import { isMealType, type MealType } from '../mealTypes';

export type RecipeId = string;
export type IngredientId = string;

export type Recipe = {
  id: RecipeId;
  name: string;
  mealTypes: MealType[];
  ingredientIds: IngredientId[];
  notes?: string;
  createdAt: string;
  updatedAt: string;
};

export type RecipeInput = {
  name: string;
  mealTypes: unknown[];
  ingredientIds?: IngredientId[];
  notes?: string;
};

export type RecipeValidationErrorCode =
  | 'RECIPE_NAME_REQUIRED'
  | 'RECIPE_MEAL_TYPE_REQUIRED'
  | 'RECIPE_MEAL_TYPE_INVALID'
  | 'RECIPE_INGREDIENT_REQUIRED';

export type RecipeValidationError = {
  code: RecipeValidationErrorCode;
  field: 'name' | 'mealTypes' | 'ingredientIds';
  message: string;
};

export type RecipeValidationResult =
  | {
      ok: true;
      value: {
        name: string;
        mealTypes: MealType[];
        ingredientIds: IngredientId[];
        notes?: string;
      };
    }
  | {
      ok: false;
      errors: RecipeValidationError[];
    };

export function validateRecipeInput(input: RecipeInput): RecipeValidationResult {
  const errors: RecipeValidationError[] = [];
  const name = input.name.trim();
  const mealTypes = input.mealTypes.filter(isMealType);
  const hasInvalidMealTypes = input.mealTypes.some((mealType) => !isMealType(mealType));

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

  if (errors.length > 0) {
    return { ok: false, errors };
  }

  return {
    ok: true,
    value: {
      name,
      mealTypes,
      ingredientIds: input.ingredientIds ?? [],
      notes: input.notes?.trim() || undefined,
    },
  };
}
