import type { Dispatch, SetStateAction } from 'react';

import {
  addRecipeToSlot,
  createEmptyMealPlan,
  defaultNutritionSettings,
  generateWeeklyPlan,
  removeRecipeFromSlotById,
  removeRecipeFromSlot,
  validateIngredientInput,
  validateRecipeInput,
  type Ingredient,
  type MealPlan,
  type MealType,
  type NutritionSettings,
  type Recipe,
} from '../domain';
import { translate, type TranslationKey, type TranslationParams } from '../shared/i18n';

const now = '2026-07-04T12:00:00.000Z';

export type AppModel = {
  generatedMealPlanDraft?: MealPlan;
  ingredients: Ingredient[];
  mealPlans: MealPlan[];
  nutritionSettings: NutritionSettings;
  selectedMealPlanId: string;
  recipes: Recipe[];
  mealPlan: MealPlan;
};

export type AppActions = {
  addIngredient: (name: string) => string | null;
  deleteIngredient: (id: string, options?: { forceCascade?: boolean }) => string | null;
  addRecipe: (input: {
    name: string;
    mealTypes: MealType[];
    ingredientIds: string[];
    ingredientWeights?: Array<{ ingredientId: string; quantity?: unknown; weightAmount?: unknown }>;
    nutrition?: { weightAmount?: unknown; calories?: unknown };
  }) => string | null;
  updateRecipe: (
    id: string,
    input: {
      name: string;
      mealTypes: MealType[];
      ingredientIds: string[];
      ingredientWeights?: Array<{ ingredientId: string; quantity?: unknown; weightAmount?: unknown }>;
      nutrition?: { weightAmount?: unknown; calories?: unknown };
    },
  ) => string | null;
  deleteRecipe: (id: string, options?: { forceCascade?: boolean }) => string | null;
  createMealPlan: (title: string) => string | null;
  deleteMealPlan: (id: string) => string | null;
  renameMealPlan: (id: string, title: string) => string | null;
  selectMealPlan: (id: string) => void;
  assignFirstCompatibleRecipe: (date: string, mealType: MealType) => string | null;
  assignRecipeToMealSlot: (date: string, mealType: MealType, recipeId: string) => string | null;
  removeRecipeFromMealSlot: (date: string, mealType: MealType, recipeId?: string) => void;
  generatePlan: () => number;
  saveGeneratedPlan: () => string | null;
  updateNutritionSettings: (settings: NutritionSettings) => void;
};

export function createInitialAppModel(): AppModel {
  const mealPlan = createEmptyMealPlan({
    id: 'plan-current',
    title: 'Piano settimanale',
    weekStartDate: '2026-06-29',
    now,
  });

  return {
    ingredients: [],
    mealPlans: [mealPlan],
    nutritionSettings: defaultNutritionSettings,
    selectedMealPlanId: mealPlan.id,
    recipes: [],
    mealPlan,
  };
}

export function createAppActions(
  model: AppModel,
  setModel: Dispatch<SetStateAction<AppModel>>,
  t: (key: TranslationKey, params?: TranslationParams) => string = (key, params) =>
    translate('it', key, params),
): AppActions {
  return {
    addIngredient(name) {
      const result = validateIngredientInput({ name });
      if (!result.ok) {
        return t('errorIngredientNameRequired');
      }
      if (hasIngredientWithName(model.ingredients, result.value.name)) {
        return t('errorIngredientDuplicate');
      }

      const ingredient: Ingredient = {
        id: `ingredient-${Date.now()}`,
        name: result.value.name,
        available: result.value.available,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      setModel((current) => ({ ...current, ingredients: [...current.ingredients, ingredient] }));
      return null;
    },

    deleteIngredient(id, options) {
      const usageCount = model.recipes.filter((recipe) => recipe.ingredientIds.includes(id)).length;
      if (usageCount > 0 && !options?.forceCascade) {
        return t('errorIngredientInUse', { count: usageCount });
      }

      setModel((current) => ({
        ...current,
        ingredients: current.ingredients.filter((ingredient) => ingredient.id !== id),
        recipes: current.recipes.map((recipe) => ({
          ...recipe,
          ingredientIds: recipe.ingredientIds.filter((ingredientId) => ingredientId !== id),
          ingredientWeights: recipe.ingredientWeights?.filter(
            (ingredientWeight) => ingredientWeight.ingredientId !== id,
          ),
        })),
      }));
      return null;
    },

    addRecipe(input) {
      const result = validateRecipeInput({
        name: input.name,
        mealTypes: input.mealTypes,
        ingredientIds: input.ingredientIds,
        ingredientWeights: input.ingredientWeights,
        nutrition: input.nutrition,
      }, { nutritionRequired: model.nutritionSettings.trackingEnabled });
      if (!result.ok) {
        return recipeValidationMessage(result.errors[0].code, t);
      }
      if (hasRecipeWithName(model.recipes, result.value.name)) {
        return t('errorRecipeDuplicate');
      }

      const recipe: Recipe = {
        id: `recipe-${Date.now()}`,
        name: result.value.name,
        mealTypes: result.value.mealTypes,
        ingredientIds: result.value.ingredientIds,
        ingredientWeights: result.value.ingredientWeights,
        nutrition: result.value.nutrition,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      setModel((current) => ({ ...current, recipes: [...current.recipes, recipe] }));
      return null;
    },

    updateRecipe(id, input) {
      const result = validateRecipeInput({
        name: input.name,
        mealTypes: input.mealTypes,
        ingredientIds: input.ingredientIds,
        ingredientWeights: input.ingredientWeights,
        nutrition: input.nutrition,
      }, { nutritionRequired: model.nutritionSettings.trackingEnabled });
      if (!result.ok) {
        return recipeValidationMessage(result.errors[0].code, t);
      }
      if (hasRecipeWithName(model.recipes, result.value.name, id)) {
        return t('errorRecipeDuplicate');
      }

      setModel((current) => ({
        ...current,
        recipes: current.recipes.map((recipe) =>
          recipe.id === id
            ? {
                ...recipe,
                name: result.value.name,
                mealTypes: result.value.mealTypes,
                ingredientIds: result.value.ingredientIds,
                ingredientWeights: result.value.ingredientWeights,
                nutrition: result.value.nutrition,
                updatedAt: new Date().toISOString(),
              }
            : recipe,
        ),
      }));
      return null;
    },

    deleteRecipe(id, options) {
      const usageCount = countRecipeMealPlanReferences(model.mealPlans, id);
      if (usageCount > 0 && !options?.forceCascade) {
        return t('errorRecipePlanned', { count: usageCount });
      }

      setModel((current) => {
        const mealPlans = current.mealPlans.map((plan) => removeRecipeFromMealPlan(plan, id));
        const mealPlan =
          mealPlans.find((plan) => plan.id === current.selectedMealPlanId) ?? current.mealPlan;

        return {
          ...current,
          mealPlan,
          mealPlans,
          recipes: current.recipes.filter((recipe) => recipe.id !== id),
        };
      });
      return null;
    },

    createMealPlan(title) {
      const name = title.trim();
      if (!name) {
        return t('errorPlanTitleRequired');
      }

      const mealPlan = createEmptyMealPlan({
        id: `plan-${Date.now()}`,
        title: name,
        weekStartDate: '2026-06-29',
        now: new Date().toISOString(),
      });

      setModel((current) => ({
        ...current,
        generatedMealPlanDraft: undefined,
        ...withActiveMealPlan(current, mealPlan),
      }));
      return null;
    },

    deleteMealPlan(id) {
      if (model.mealPlans.length <= 1) {
        return t('errorPlanMustExist');
      }

      setModel((current) => {
        const remainingPlans = current.mealPlans.filter((plan) => plan.id !== id);
        if (remainingPlans.length === current.mealPlans.length || remainingPlans.length === 0) {
          return current;
        }
        const nextActivePlan =
          current.selectedMealPlanId === id ? remainingPlans[0] : current.mealPlan;

        return {
          ...current,
          generatedMealPlanDraft: undefined,
          mealPlan: nextActivePlan,
          mealPlans: remainingPlans,
          selectedMealPlanId: nextActivePlan.id,
        };
      });
      return null;
    },

    renameMealPlan(id, title) {
      const name = title.trim();
      if (!name) {
        return t('errorPlanTitleRequired');
      }

      setModel((current) => {
        const mealPlans = current.mealPlans.map((plan) =>
          plan.id === id ? { ...plan, title: name, updatedAt: new Date().toISOString() } : plan,
        );
        const mealPlan =
          current.mealPlan.id === id ? { ...current.mealPlan, title: name } : current.mealPlan;
        const generatedMealPlanDraft =
          current.generatedMealPlanDraft?.id === id
            ? { ...current.generatedMealPlanDraft, title: name, updatedAt: new Date().toISOString() }
            : current.generatedMealPlanDraft;

        return {
          ...current,
          generatedMealPlanDraft,
          mealPlan,
          mealPlans,
        };
      });
      return null;
    },

    selectMealPlan(id) {
      const selected = model.mealPlans.find((plan) => plan.id === id);
      if (!selected) {
        return;
      }

      setModel((current) => ({
        ...current,
        generatedMealPlanDraft: undefined,
        mealPlan: selected,
        selectedMealPlanId: selected.id,
      }));
    },

    assignFirstCompatibleRecipe(date, mealType) {
      const recipe = model.recipes.find((candidate) => candidate.mealTypes.includes(mealType));
      if (!recipe) {
        return t('errorNoCompatibleRecipe');
      }

      setModel((current) => ({
        ...current,
        ...withEditableMealPlan(current, {
          ...getEditableMealPlan(current),
          days: getEditableMealPlan(current).days.map((day) =>
            day.date === date
              ? {
                  ...day,
                  slots: day.slots.map((slot) => {
                    if (slot.mealType !== mealType) {
                      return slot;
                    }
                    const assignment = addRecipeToSlot(slot, recipe);
                    return assignment.ok ? assignment.value : slot;
                  }),
                }
              : day,
          ),
        }),
      }));
      return null;
    },

    assignRecipeToMealSlot(date, mealType, recipeId) {
      const recipe = model.recipes.find((candidate) => candidate.id === recipeId);
      if (!recipe) {
        return t('errorRecipeNotFound');
      }

      const candidateSlot = (model.generatedMealPlanDraft ?? model.mealPlan).days
        .find((day) => day.date === date)
        ?.slots.find((slot) => slot.mealType === mealType);
      if (!candidateSlot) {
        return t('errorMealSlotNotFound');
      }

      const assignment = addRecipeToSlot(candidateSlot, recipe);
      if (!assignment.ok) {
        return t('errorRecipeIncompatible');
      }

      setModel((current) => ({
        ...current,
        ...withEditableMealPlan(current, {
          ...getEditableMealPlan(current),
          days: getEditableMealPlan(current).days.map((day) =>
            day.date === date
              ? {
                  ...day,
                  slots: day.slots.map((slot) =>
                    slot.mealType === mealType ? assignment.value : slot,
                  ),
                }
              : day,
          ),
          updatedAt: new Date().toISOString(),
        }),
      }));
      return null;
    },

    removeRecipeFromMealSlot(date, mealType, recipeId) {
      setModel((current) => ({
        ...current,
        ...withEditableMealPlan(current, {
          ...getEditableMealPlan(current),
          days: getEditableMealPlan(current).days.map((day) =>
            day.date === date
              ? {
                  ...day,
                  slots: day.slots.map((slot) =>
                    slot.mealType === mealType
                      ? recipeId
                        ? removeRecipeFromSlotById(slot, recipeId)
                        : removeRecipeFromSlot(slot)
                      : slot,
                  ),
                }
              : day,
          ),
        }),
      }));
    },

    generatePlan() {
      const result = generateWeeklyPlan({
        plan: model.mealPlan,
        recipes: model.recipes,
        now: new Date().toISOString(),
      });
      setModel((current) => ({
        ...current,
        generatedMealPlanDraft: result.uncoveredSlots.length === 0 ? result.plan : undefined,
      }));
      return result.uncoveredSlots.length;
    },

    saveGeneratedPlan() {
      const generatedMealPlanDraft = model.generatedMealPlanDraft;
      if (!generatedMealPlanDraft) {
        return t('errorNoGeneratedPlan');
      }

      setModel((current) => ({
        ...current,
        generatedMealPlanDraft: undefined,
        ...withActiveMealPlan(current, generatedMealPlanDraft),
      }));
      return null;
    },

    updateNutritionSettings(settings) {
      setModel((current) => ({ ...current, nutritionSettings: settings }));
    },
  };
}

function recipeValidationMessage(
  code:
    | 'RECIPE_NAME_REQUIRED'
    | 'RECIPE_MEAL_TYPE_REQUIRED'
    | 'RECIPE_MEAL_TYPE_INVALID'
    | 'RECIPE_INGREDIENT_REQUIRED'
    | 'RECIPE_INGREDIENT_WEIGHT_REQUIRED'
    | 'RECIPE_INGREDIENT_WEIGHT_INVALID'
    | 'RECIPE_WEIGHT_REQUIRED'
    | 'RECIPE_WEIGHT_INVALID'
    | 'RECIPE_CALORIES_REQUIRED'
    | 'RECIPE_CALORIES_INVALID',
  t: (key: TranslationKey, params?: TranslationParams) => string,
) {
  return {
    RECIPE_NAME_REQUIRED: t('errorRecipeNameRequired'),
    RECIPE_MEAL_TYPE_REQUIRED: t('errorRecipeMealTypeRequired'),
    RECIPE_MEAL_TYPE_INVALID: t('errorRecipeMealTypeInvalid'),
    RECIPE_INGREDIENT_REQUIRED: t('errorRecipeIngredientRequired'),
    RECIPE_INGREDIENT_WEIGHT_REQUIRED: t('errorRecipeWeightRequired'),
    RECIPE_INGREDIENT_WEIGHT_INVALID: t('errorRecipeWeightInvalid'),
    RECIPE_WEIGHT_REQUIRED: t('errorRecipeWeightRequired'),
    RECIPE_WEIGHT_INVALID: t('errorRecipeWeightInvalid'),
    RECIPE_CALORIES_REQUIRED: t('errorRecipeCaloriesRequired'),
    RECIPE_CALORIES_INVALID: t('errorRecipeCaloriesInvalid'),
  }[code];
}

function withActiveMealPlan(current: AppModel, mealPlan: MealPlan) {
  const mealPlans = current.mealPlans.some((plan) => plan.id === mealPlan.id)
    ? current.mealPlans.map((plan) => (plan.id === mealPlan.id ? mealPlan : plan))
    : [...current.mealPlans, mealPlan];

  return {
    mealPlan,
    mealPlans,
    selectedMealPlanId: mealPlan.id,
  };
}

function getEditableMealPlan(current: AppModel) {
  return current.generatedMealPlanDraft ?? current.mealPlan;
}

function withEditableMealPlan(current: AppModel, mealPlan: MealPlan) {
  return current.generatedMealPlanDraft
    ? { generatedMealPlanDraft: mealPlan }
    : withActiveMealPlan(current, mealPlan);
}

function countRecipeMealPlanReferences(mealPlans: MealPlan[], recipeId: string) {
  return mealPlans.reduce(
    (count, plan) =>
      count +
      plan.days.reduce(
        (dayCount, day) =>
          dayCount + day.slots.filter((slot) => slot.recipeIds.includes(recipeId)).length,
        0,
      ),
    0,
  );
}

function removeRecipeFromMealPlan(mealPlan: MealPlan, recipeId: string): MealPlan {
  return {
    ...mealPlan,
    days: mealPlan.days.map((day) => ({
      ...day,
      slots: day.slots.map((slot) => removeRecipeFromSlotById(slot, recipeId)),
    })),
    updatedAt: new Date().toISOString(),
  };
}

function hasIngredientWithName(ingredients: Ingredient[], name: string) {
  const normalizedName = normalizeName(name);
  return ingredients.some((ingredient) => normalizeName(ingredient.name) === normalizedName);
}

function hasRecipeWithName(recipes: Recipe[], name: string, excludedRecipeId?: string) {
  const normalizedName = normalizeName(name);
  return recipes.some(
    (recipe) => recipe.id !== excludedRecipeId && normalizeName(recipe.name) === normalizedName,
  );
}

function normalizeName(name: string) {
  return name.trim().toLocaleLowerCase();
}
