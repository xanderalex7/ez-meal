export type IngredientId = string;

export type Ingredient = {
  id: IngredientId;
  name: string;
  available: boolean;
  createdAt: string;
  updatedAt: string;
};

export type IngredientInput = {
  name: string;
  available?: boolean;
};

export type IngredientValidationErrorCode = 'INGREDIENT_NAME_REQUIRED';

export type IngredientValidationError = {
  code: IngredientValidationErrorCode;
  field: 'name';
  message: string;
};

export type IngredientValidationResult =
  | {
      ok: true;
      value: {
        name: string;
        available: boolean;
      };
    }
  | {
      ok: false;
      errors: IngredientValidationError[];
    };

export function validateIngredientInput(input: IngredientInput): IngredientValidationResult {
  const name = input.name.trim();

  if (!name) {
    return {
      ok: false,
      errors: [
        {
          code: 'INGREDIENT_NAME_REQUIRED',
          field: 'name',
          message: "Il nome dell'ingrediente è obbligatorio.",
        },
      ],
    };
  }

  return {
    ok: true,
    value: {
      name,
      available: input.available ?? true,
    },
  };
}
