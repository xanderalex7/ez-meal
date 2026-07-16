import { isMealType, type MealType } from '../mealTypes';
import { hasCompleteRecipeNutrition, type RecipeNutrition } from '../nutrition';

export type { RecipeNutrition } from '../nutrition';

export type RecipeId = string;
export type IngredientId = string;

export type RecipeIngredient = {
  ingredientId: IngredientId;
  quantity?: string;
  /** Legacy numeric amount kept for data imported before free-form quantities. */
  weightAmount?: number;
};

export type Recipe = {
  id: RecipeId;
  name: string;
  mealTypes: MealType[];
  ingredientIds: IngredientId[];
  ingredientWeights?: RecipeIngredient[];
  nutrition?: RecipeNutrition;
  notes?: string;
  createdAt: string;
  updatedAt: string;
};

export type RecipeInput = {
  name: string;
  mealTypes: unknown[];
  ingredientIds?: IngredientId[];
  ingredientWeights?: Array<{
    ingredientId: IngredientId;
    quantity?: unknown;
    weightAmount?: unknown;
  }>;
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
  | 'RECIPE_INGREDIENT_WEIGHT_REQUIRED'
  | 'RECIPE_INGREDIENT_WEIGHT_INVALID'
  | 'RECIPE_WEIGHT_REQUIRED'
  | 'RECIPE_WEIGHT_INVALID'
  | 'RECIPE_CALORIES_REQUIRED'
  | 'RECIPE_CALORIES_INVALID';

export type RecipeValidationError = {
  code: RecipeValidationErrorCode;
  field:
    | 'name'
    | 'mealTypes'
    | 'ingredientIds'
    | 'ingredientWeights'
    | 'nutrition.weightAmount'
    | 'nutrition.calories';
  message: string;
};

export type RecipeValidationResult =
  | {
      ok: true;
      value: {
        name: string;
        mealTypes: MealType[];
        ingredientIds: IngredientId[];
        ingredientWeights?: RecipeIngredient[];
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
  const ingredientIds = input.ingredientIds ?? [];
  const ingredientWeights = parseRecipeIngredientWeights(ingredientIds, input.ingredientWeights);

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

  if (ingredientIds.length === 0) {
    errors.push({
      code: 'RECIPE_INGREDIENT_REQUIRED',
      field: 'ingredientIds',
      message: 'Seleziona almeno un ingrediente.',
    });
  }

  if (options.nutritionRequired) {
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

    ingredientIds.forEach((ingredientId) => {
      const quantity = ingredientWeights.find((candidate) => candidate.ingredientId === ingredientId);
      if (!quantity?.quantity) {
        errors.push({
          code: 'RECIPE_INGREDIENT_WEIGHT_REQUIRED',
          field: 'ingredientWeights',
          message: "La quantità di ogni ingrediente è obbligatoria.",
        });
      }
    });
  }

  if (errors.length > 0) {
    return { ok: false, errors };
  }

  return {
    ok: true,
    value: {
      name,
      mealTypes,
      ingredientIds,
      ingredientWeights: ingredientWeights.length > 0 ? ingredientWeights : undefined,
      nutrition: hasCompleteRecipeNutrition(nutrition) ? nutrition : undefined,
      notes: input.notes?.trim() || undefined,
    },
  };
}

function parseRecipeNutrition(input: RecipeInput['nutrition']): RecipeNutrition | undefined {
  if (!input) {
    return undefined;
  }

  const calories = parseNumber(input.calories);

  if (calories === undefined) {
    return undefined;
  }

  return { calories };
}

function parseRecipeIngredientWeights(
  ingredientIds: IngredientId[],
  input: RecipeInput['ingredientWeights'],
): RecipeIngredient[] {
  const inputMap = new Map((input ?? []).map((item) => [item.ingredientId, item]));

  return ingredientIds
    .map((ingredientId) => {
      const source = inputMap.get(ingredientId);
      const quantity = parseQuantity(source?.quantity ?? source?.weightAmount);
      const weightAmount = parseNumber(source?.weightAmount);
      return {
        ingredientId,
        ...(quantity === undefined ? {} : { quantity }),
        ...(weightAmount === undefined ? {} : { weightAmount }),
      };
    })
    .filter((item) => item.quantity !== undefined || item.weightAmount !== undefined || inputMap.has(item.ingredientId));
}

function parseQuantity(value: unknown): string | undefined {
  if (typeof value === 'string' && value.trim()) {
    return value.trim();
  }

  if (typeof value === 'number' && Number.isFinite(value)) {
    return String(value);
  }

  return undefined;
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
