import { isMealType, type MealType } from '../mealTypes';
import { hasCompleteRecipeNutrition, type RecipeNutrition } from '../nutrition';

export type { RecipeNutrition } from '../nutrition';

export type RecipeId = string;
export type IngredientId = string;

export type Recipe = {
  id: RecipeId;
  name: string;
  mealTypes: MealType[];
  ingredientIds: IngredientId[];
  nutrition?: RecipeNutrition;
  notes?: string;
  createdAt: string;
  updatedAt: string;
};

export type RecipeInput = {
  name: string;
  mealTypes: unknown[];
  ingredientIds?: IngredientId[];
  nutrition?: {
    weightAmount?: unknown;
    calories?: unknown;
  };
  notes?: string;
};

export type RecipeValidationErrorCode =
  | 'RECIPE_NAME_REQUIRED'
  | 'RECIPE_MEAL_TYPE_REQUIRED'
  | 'RECIPE_MEAL_TYPE_INVALID'
  | 'RECIPE_INGREDIENT_REQUIRED'
  | 'RECIPE_WEIGHT_REQUIRED'
  | 'RECIPE_WEIGHT_INVALID'
  | 'RECIPE_CALORIES_REQUIRED'
  | 'RECIPE_CALORIES_INVALID';

export type RecipeValidationError = {
  code: RecipeValidationErrorCode;
  field: 'name' | 'mealTypes' | 'ingredientIds' | 'nutrition.weightAmount' | 'nutrition.calories';
  message: string;
};

export type RecipeValidationResult =
  | {
      ok: true;
      value: {
        name: string;
        mealTypes: MealType[];
        ingredientIds: IngredientId[];
        nutrition?: RecipeNutrition;
        notes?: string;
      };
    }
  | {
      ok: false;
      errors: RecipeValidationError[];
    };

export function validateRecipeInput(
  input: RecipeInput,
  options: { nutritionRequired?: boolean } = {},
): RecipeValidationResult {
  const errors: RecipeValidationError[] = [];
  const name = input.name.trim();
  const mealTypes = input.mealTypes.filter(isMealType);
  const hasInvalidMealTypes = input.mealTypes.some((mealType) => !isMealType(mealType));
  const nutrition = parseRecipeNutrition(input.nutrition);

  if (!name) {
    errors.push({
      code: 'RECIPE_NAME_REQUIRED',
      field: 'name',
      message: 'Il nome della ricetta è obbligatorio.',
    });
  }

  if (input.mealTypes.length === 0) {
    errors.push({
      code: 'RECIPE_MEAL_TYPE_REQUIRED',
      field: 'mealTypes',
      message: 'Seleziona almeno un pasto.',
    });
  }

  if (hasInvalidMealTypes) {
    errors.push({
      code: 'RECIPE_MEAL_TYPE_INVALID',
      field: 'mealTypes',
      message: 'Una o più label pasto non sono valide.',
    });
  }

  if (!input.ingredientIds || input.ingredientIds.length === 0) {
    errors.push({
      code: 'RECIPE_INGREDIENT_REQUIRED',
      field: 'ingredientIds',
      message: 'Seleziona almeno un ingrediente.',
    });
  }

  if (options.nutritionRequired) {
    if (input.nutrition?.weightAmount === undefined || input.nutrition?.weightAmount === '') {
      errors.push({
        code: 'RECIPE_WEIGHT_REQUIRED',
        field: 'nutrition.weightAmount',
        message: 'Il peso della ricetta è obbligatorio.',
      });
    } else if (!nutrition || nutrition.weightAmount <= 0) {
      errors.push({
        code: 'RECIPE_WEIGHT_INVALID',
        field: 'nutrition.weightAmount',
        message: 'Il peso della ricetta deve essere maggiore di zero.',
      });
    }

    if (input.nutrition?.calories === undefined || input.nutrition?.calories === '') {
      errors.push({
        code: 'RECIPE_CALORIES_REQUIRED',
        field: 'nutrition.calories',
        message: 'Le calorie della ricetta sono obbligatorie.',
      });
    } else if (!nutrition || nutrition.calories <= 0) {
      errors.push({
        code: 'RECIPE_CALORIES_INVALID',
        field: 'nutrition.calories',
        message: 'Le calorie della ricetta devono essere maggiori di zero.',
      });
    }
  }

  if (errors.length > 0) {
    return { ok: false, errors };
  }

  return {
    ok: true,
    value: {
      name,
      mealTypes,
      ingredientIds: input.ingredientIds ?? [],
      nutrition: hasCompleteRecipeNutrition(nutrition) ? nutrition : undefined,
      notes: input.notes?.trim() || undefined,
    },
  };
}

function parseRecipeNutrition(input: RecipeInput['nutrition']): RecipeNutrition | undefined {
  if (!input) {
    return undefined;
  }

  const weightAmount = parseNumber(input.weightAmount);
  const calories = parseNumber(input.calories);

  if (weightAmount === undefined || calories === undefined) {
    return undefined;
  }

  return { weightAmount, calories };
}

function parseNumber(value: unknown): number | undefined {
  if (typeof value === 'string' && value.trim()) {
    const parsed = Number(value.trim().replace(',', '.'));
    return Number.isFinite(parsed) ? parsed : undefined;
  }

  if (typeof value === 'number' && Number.isFinite(value)) {
    return value;
  }

  return undefined;
}
