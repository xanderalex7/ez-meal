import { validateIngredientInput } from '../../domain';

describe('validateIngredientInput', () => {
  it('accepts an ingredient with a non-empty name', () => {
    expect(validateIngredientInput({ name: '  Pomodoro  ' })).toEqual({
      ok: true,
      value: {
        name: 'Pomodoro',
        available: true,
      },
    });
  });

  it('preserves explicit availability', () => {
    expect(validateIngredientInput({ name: 'Farina', available: false })).toEqual({
      ok: true,
      value: {
        name: 'Farina',
        available: false,
      },
    });
  });

  it('rejects an empty ingredient name', () => {
    expect(validateIngredientInput({ name: '   ' })).toEqual({
      ok: false,
      errors: [
        {
          code: 'INGREDIENT_NAME_REQUIRED',
          field: 'name',
          message: "Il nome dell'ingrediente è obbligatorio.",
        },
      ],
    });
  });
});
