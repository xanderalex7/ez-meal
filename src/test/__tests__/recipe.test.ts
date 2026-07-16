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

  it('accepts recipe calories when provided', () => {
    expect(
      validateRecipeInput({
        name: 'Riso e pollo',
        mealTypes: ['lunch'],
        ingredientIds: ['ingredient-1'],
        nutrition: { weightAmount: '350,5', calories: '620' },
      }),
    ).toEqual({
      ok: true,
      value: {
        name: 'Riso e pollo',
        mealTypes: ['lunch'],
        ingredientIds: ['ingredient-1'],
        nutrition: { calories: 620 },
      },
    });
  });

  it('requires recipe calories and ingredient weights only when requested', () => {
    expect(
      validateRecipeInput(
        { name: 'Toast', mealTypes: ['breakfast'], ingredientIds: ['ingredient-1'] },
        { nutritionRequired: true },
      ),
    ).toEqual({
      ok: false,
      errors: [
        {
          code: 'RECIPE_CALORIES_REQUIRED',
          field: 'nutrition.calories',
          message: 'Le calorie della ricetta sono obbligatorie.',
        },
        {
          code: 'RECIPE_INGREDIENT_WEIGHT_REQUIRED',
          field: 'ingredientWeights',
          message: 'La quantità di ogni ingrediente è obbligatoria.',
        },
      ],
    });
  });

  it('rejects missing required recipe calories and ingredient quantities', () => {
    expect(
      validateRecipeInput(
        {
          name: 'Toast',
          mealTypes: ['breakfast'],
          ingredientIds: ['ingredient-1'],
          ingredientWeights: [{ ingredientId: 'ingredient-1', quantity: '   ' }],
          nutrition: { calories: '-5' },
        },
        { nutritionRequired: true },
      ),
    ).toEqual({
      ok: false,
      errors: [
        {
          code: 'RECIPE_CALORIES_INVALID',
          field: 'nutrition.calories',
          message: 'Le calorie della ricetta devono essere maggiori di zero.',
        },
        {
          code: 'RECIPE_INGREDIENT_WEIGHT_REQUIRED',
          field: 'ingredientWeights',
          message: 'La quantità di ogni ingrediente è obbligatoria.',
        },
      ],
    });
  });

  it('returns ingredient quantities when nutrition tracking is valid', () => {
    expect(
      validateRecipeInput(
        {
          name: 'Riso in bianco',
          mealTypes: ['lunch'],
          ingredientIds: ['rice', 'oil'],
          ingredientWeights: [
            { ingredientId: 'rice', quantity: '50 g' },
            { ingredientId: 'oil', quantity: '1 cucchiaino' },
          ],
          nutrition: { calories: '240' },
        },
        { nutritionRequired: true },
      ),
    ).toEqual({
      ok: true,
      value: {
        name: 'Riso in bianco',
        mealTypes: ['lunch'],
        ingredientIds: ['rice', 'oil'],
        ingredientWeights: [
          { ingredientId: 'rice', quantity: '50 g' },
          { ingredientId: 'oil', quantity: '1 cucchiaino' },
        ],
        nutrition: { calories: 240 },
      },
    });
  });
});
