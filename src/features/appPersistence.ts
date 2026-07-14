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
  resetLocalData: () => Promise<AppModel>;
  saveLanguage: (language: Language) => Promise<void>;
  saveThemeMode: (themeMode: ThemeMode) => Promise<void>;
  saveSnapshot: (previous: AppModel, next: AppModel) => Promise<void>;
};

export async function createAppPersistence(db?: QueryExecutor): Promise<AppPersistence> {
  const database = db ?? (await openDefaultDatabase());
  const repositories = createLocalRepositories(database);

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
      const initial = createInitialAppModel();
      await Promise.all([
        database.runAsync('DELETE FROM ingredients;', []),
        database.runAsync('DELETE FROM recipes;', []),
        database.runAsync('DELETE FROM meal_plans;', []),
        database.runAsync('DELETE FROM user_preferences;', []),
      ]);
      await unwrap(repositories.mealPlans.save(initial.mealPlan));
      consoleLogger.warn('Local app data reset');
      return initial;
    },

    async saveThemeMode(themeMode) {
      await unwrap(repositories.preferences.saveThemeMode(themeMode, new Date().toISOString()));
    },

    async saveLanguage(language) {
      await unwrap(repositories.preferences.saveLanguage(language, new Date().toISOString()));
    },

    async saveSnapshot(previous, next) {
      await saveDeletedEntities(repositories, previous, next);
      await Promise.all([
        ...next.ingredients.map((ingredient) => unwrap(repositories.ingredients.save(ingredient))),
        ...next.recipes.map((recipe) => unwrap(repositories.recipes.save(recipe))),
        ...mergeActiveMealPlan(next).map((plan) => unwrap(repositories.mealPlans.save(plan))),
      ]);
      consoleLogger.info('Local app state saved', {
        ingredientCount: next.ingredients.length,
        recipeCount: next.recipes.length,
      });
    },
  };
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

  await Promise.all([
    ...deletedIngredientIds.map((id) => unwrap(repositories.ingredients.delete(id))),
    ...deletedMealPlanIds.map((id) => unwrap(repositories.mealPlans.delete(id))),
    ...deletedRecipeIds.map((id) => unwrap(repositories.recipes.delete(id))),
  ]);
}

async function unwrap<T>(operation: Promise<RepositoryResult<T>>): Promise<T> {
  const result = await operation;
  if (!result.ok) {
    throw new Error(result.error.code);
  }
  return result.value;
}
