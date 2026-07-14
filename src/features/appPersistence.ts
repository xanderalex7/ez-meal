import {
  createIngredientRepository,
  createMealPlanRepository,
  createPreferenceRepository,
  createRecipeRepository,
  type QueryExecutor,
  type RepositoryResult,
} from '../data/repositories';
import { consoleLogger } from '../shared/logging';
import type { Language } from '../shared/i18n';
import type { ThemeMode } from '../shared/theme';
import { createInitialAppModel, type AppModel } from './appModel';

type LocalRepositories = {
  ingredients: ReturnType<typeof createIngredientRepository>;
  mealPlans: ReturnType<typeof createMealPlanRepository>;
  preferences: ReturnType<typeof createPreferenceRepository>;
  recipes: ReturnType<typeof createRecipeRepository>;
};

export type AppPersistence = {
  getLanguage: () => Promise<Language>;
  getThemeMode: () => Promise<ThemeMode>;
  load: () => Promise<AppModel>;
  replaceLocalData: (model: AppModel, language: Language, themeMode: ThemeMode) => Promise<void>;
  resetLocalData: () => Promise<AppModel>;
  saveLanguage: (language: Language) => Promise<void>;
  saveThemeMode: (themeMode: ThemeMode) => Promise<void>;
  saveSnapshot: (previous: AppModel, next: AppModel) => Promise<void>;
};

export async function createAppPersistence(db?: QueryExecutor): Promise<AppPersistence> {
  const database = db ?? (await openDefaultDatabase());
  const repositories = createLocalRepositories(database);
  const writeQueue = createWriteQueue();

  return {
    async getLanguage() {
      return unwrap(repositories.preferences.getLanguage());
    },

    async getThemeMode() {
      return unwrap(repositories.preferences.getThemeMode());
    },

    async load() {
      const initial = createInitialAppModel();
      const [ingredients, recipes, mealPlans] = await Promise.all([
        unwrap(repositories.ingredients.list()),
        unwrap(repositories.recipes.list()),
        unwrap(repositories.mealPlans.list()),
      ]);
      const loadedMealPlans = mealPlans.length > 0 ? mealPlans : initial.mealPlans;
      const activeMealPlan =
        loadedMealPlans.find((plan) => plan.id === initial.selectedMealPlanId) ?? loadedMealPlans[0];
      const loadedModel = {
        ingredients,
        mealPlan: activeMealPlan,
        mealPlans: loadedMealPlans,
        recipes,
        selectedMealPlanId: activeMealPlan.id,
      };

      if (mealPlans.length === 0) {
        await unwrap(repositories.mealPlans.save(initial.mealPlan));
      }

      consoleLogger.info('Local app state loaded', {
        ingredientCount: loadedModel.ingredients.length,
        recipeCount: loadedModel.recipes.length,
      });
      return loadedModel;
    },

    async resetLocalData() {
      return writeQueue(async () => resetLocalData(database, repositories));
    },

    async replaceLocalData(model, language, themeMode) {
      await writeQueue(async () => {
        await clearLocalData(database);
        await saveFullModel(repositories, model);
        const now = new Date().toISOString();
        await unwrap(repositories.preferences.saveLanguage(language, now));
        await unwrap(repositories.preferences.saveThemeMode(themeMode, now));
        consoleLogger.warn('Local app data imported');
      });
    },

    async saveThemeMode(themeMode) {
      await writeQueue(() =>
        unwrap(repositories.preferences.saveThemeMode(themeMode, new Date().toISOString())),
      );
    },

    async saveLanguage(language) {
      await writeQueue(() =>
        unwrap(repositories.preferences.saveLanguage(language, new Date().toISOString())),
      );
    },

    async saveSnapshot(previous, next) {
      await writeQueue(async () => {
        await saveDeletedEntities(repositories, previous, next);
        for (const ingredient of next.ingredients) {
          await unwrap(repositories.ingredients.save(ingredient));
        }
        for (const recipe of next.recipes) {
          await unwrap(repositories.recipes.save(recipe));
        }
        for (const plan of mergeActiveMealPlan(next)) {
          await unwrap(repositories.mealPlans.save(plan));
        }
        consoleLogger.info('Local app state saved', {
          ingredientCount: next.ingredients.length,
          recipeCount: next.recipes.length,
        });
      });
    },
  };
}

function createWriteQueue() {
  let queue = Promise.resolve();

  return async function enqueue<T>(operation: () => Promise<T>): Promise<T> {
    const queued = queue.then(operation, operation);
    queue = queued.then(
      () => undefined,
      () => undefined,
    );
    return queued;
  };
}

async function resetLocalData(
  database: QueryExecutor,
  repositories: LocalRepositories,
): Promise<AppModel> {
  const initial = createInitialAppModel();
  await clearLocalData(database);
  await unwrap(repositories.mealPlans.save(initial.mealPlan));
  consoleLogger.warn('Local app data reset');
  return initial;
}

async function clearLocalData(database: QueryExecutor): Promise<void> {
  await database.runAsync('DELETE FROM ingredients;', []);
  await database.runAsync('DELETE FROM recipes;', []);
  await database.runAsync('DELETE FROM meal_plans;', []);
  await database.runAsync('DELETE FROM user_preferences;', []);
}

async function saveFullModel(repositories: LocalRepositories, model: AppModel): Promise<void> {
  for (const ingredient of model.ingredients) {
    await unwrap(repositories.ingredients.save(ingredient));
  }
  for (const recipe of model.recipes) {
    await unwrap(repositories.recipes.save(recipe));
  }
  for (const plan of mergeActiveMealPlan(model)) {
    await unwrap(repositories.mealPlans.save(plan));
  }
}

function mergeActiveMealPlan(model: AppModel) {
  return model.mealPlans.some((plan) => plan.id === model.mealPlan.id)
    ? model.mealPlans.map((plan) => (plan.id === model.mealPlan.id ? model.mealPlan : plan))
    : [...model.mealPlans, model.mealPlan];
}

async function openDefaultDatabase(): Promise<QueryExecutor> {
  const { openAppDatabase } = await import('../data/db');
  return openAppDatabase();
}

function createLocalRepositories(db: QueryExecutor): LocalRepositories {
  return {
    ingredients: createIngredientRepository(db),
    mealPlans: createMealPlanRepository(db),
    preferences: createPreferenceRepository(db),
    recipes: createRecipeRepository(db),
  };
}

async function saveDeletedEntities(
  repositories: LocalRepositories,
  previous: AppModel,
  next: AppModel,
): Promise<void> {
  const nextIngredientIds = new Set(next.ingredients.map((ingredient) => ingredient.id));
  const nextMealPlanIds = new Set(mergeActiveMealPlan(next).map((plan) => plan.id));
  const nextRecipeIds = new Set(next.recipes.map((recipe) => recipe.id));
  const deletedIngredientIds = previous.ingredients
    .filter((ingredient) => !nextIngredientIds.has(ingredient.id))
    .map((ingredient) => ingredient.id);
  const deletedRecipeIds = previous.recipes
    .filter((recipe) => !nextRecipeIds.has(recipe.id))
    .map((recipe) => recipe.id);
  const deletedMealPlanIds = previous.mealPlans
    .filter((plan) => !nextMealPlanIds.has(plan.id))
    .map((plan) => plan.id);

  for (const id of deletedIngredientIds) {
    await unwrap(repositories.ingredients.delete(id));
  }
  for (const id of deletedMealPlanIds) {
    await unwrap(repositories.mealPlans.delete(id));
  }
  for (const id of deletedRecipeIds) {
    await unwrap(repositories.recipes.delete(id));
  }
}

async function unwrap<T>(operation: Promise<RepositoryResult<T>>): Promise<T> {
  const result = await operation;
  if (!result.ok) {
    throw new Error(result.error.code);
  }
  return result.value;
}
