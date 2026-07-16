import { validateRecipeInput } from '../../domain';

describe('validateRecipeInput', () => {
  it('accepts a recipe with a name and at least one meal type', () => {
    expect(
      validateRecipeInput({
        name: '  Pasta al pomodoro  ',
        mealTypes: ['lunch', 'dinner'],
        ingredientIds: ['ingredient-1'],
        notes: '  Facile  ',
      }),
    ).toEqual({
      ok: true,
      value: {
        name: 'Pasta al pomodoro',
        mealTypes: ['lunch', 'dinner'],
        ingredientIds: ['ingredient-1'],
        notes: 'Facile',
      },
    });
  });

  it('rejects an empty recipe name', () => {
    expect(
      validateRecipeInput({ name: '   ', mealTypes: ['breakfast'], ingredientIds: ['ingredient-1'] }),
    ).toEqual({
      ok: false,
      errors: [
        {
          code: 'RECIPE_NAME_REQUIRED',
          field: 'name',
          message: 'Il nome della ricetta è obbligatorio.',
        },
      ],
    });
  });

  it('rejects recipes without meal types', () => {
    expect(validateRecipeInput({ name: 'Toast', mealTypes: [], ingredientIds: ['ingredient-1'] })).toEqual({
      ok: false,
      errors: [
        {
          code: 'RECIPE_MEAL_TYPE_REQUIRED',
          field: 'mealTypes',
          message: 'Seleziona almeno un pasto.',
        },
      ],
    });
  });

  it('rejects invalid meal types', () => {
    expect(validateRecipeInput({ name: 'Toast', mealTypes: ['snack'], ingredientIds: ['ingredient-1'] })).toEqual({
      ok: false,
      errors: [
        {
          code: 'RECIPE_MEAL_TYPE_INVALID',
          field: 'mealTypes',
          message: 'Una o più label pasto non sono valide.',
        },
      ],
    });
  });

  it('rejects recipes without ingredients', () => {
    expect(validateRecipeInput({ name: 'Toast', mealTypes: ['breakfast'], ingredientIds: [] })).toEqual({
      ok: false,
      errors: [
        {
          code: 'RECIPE_INGREDIENT_REQUIRED',
          field: 'ingredientIds',
          message: 'Seleziona almeno un ingrediente.',
        },
      ],
    });
  });
});
