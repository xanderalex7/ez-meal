import { assignRecipeToSlot, createEmptyMealPlan, removeRecipeFromSlot, type Recipe } from '../../domain';

const lunchRecipe: Recipe = {
  id: 'recipe-1',
  name: 'Pasta',
  mealTypes: ['lunch'],
  ingredientIds: [],
  createdAt: '2026-07-04T00:00:00.000Z',
  updatedAt: '2026-07-04T00:00:00.000Z',
};

describe('meal plan domain', () => {
  it('creates a week with seven days and three standard slots per day', () => {
    const plan = createEmptyMealPlan({
      id: 'plan-1',
      weekStartDate: '2026-07-06',
      now: '2026-07-04T12:00:00.000Z',
    });

    expect(plan.days).toHaveLength(7);
    expect(plan.days[0]).toEqual({
      date: '2026-07-06',
      slots: [
        { date: '2026-07-06', mealType: 'breakfast' },
        { date: '2026-07-06', mealType: 'lunch' },
        { date: '2026-07-06', mealType: 'dinner' },
      ],
    });
    expect(plan.days[6].date).toBe('2026-07-12');
  });

  it('assigns a compatible recipe to a slot', () => {
    expect(assignRecipeToSlot({ date: '2026-07-06', mealType: 'lunch' }, lunchRecipe)).toEqual({
      ok: true,
      value: {
        date: '2026-07-06',
        mealType: 'lunch',
        recipeId: 'recipe-1',
      },
    });
  });

  it('rejects an incompatible recipe assignment', () => {
    expect(assignRecipeToSlot({ date: '2026-07-06', mealType: 'dinner' }, lunchRecipe)).toEqual({
      ok: false,
      error: {
        code: 'RECIPE_INCOMPATIBLE_WITH_SLOT',
        message: 'La ricetta non è compatibile con questo pasto.',
      },
    });
  });

  it('removes a recipe from a slot', () => {
    expect(
      removeRecipeFromSlot({
        date: '2026-07-06',
        mealType: 'lunch',
        recipeId: 'recipe-1',
      }),
    ).toEqual({
      date: '2026-07-06',
      mealType: 'lunch',
    });
  });
});
