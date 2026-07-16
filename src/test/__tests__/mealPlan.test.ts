import {
  addRecipeToSlot,
  calculateMealPlanNutritionTotal,
  calculateMealSlotNutritionTotal,
  calculatePlanDayNutritionTotal,
  createEmptyMealPlan,
  normalizeMealSlot,
  removeRecipeFromSlot,
  removeRecipeFromSlotById,
  type Recipe,
} from '../../domain';

const lunchRecipe: Recipe = {
  id: 'recipe-1',
  name: 'Pasta',
  mealTypes: ['lunch'],
  ingredientIds: [],
  nutrition: { weightAmount: 320, calories: 520 },
  createdAt: '2026-07-04T00:00:00.000Z',
  updatedAt: '2026-07-04T00:00:00.000Z',
};

const sideRecipe: Recipe = {
  id: 'recipe-2',
  name: 'Pollo',
  mealTypes: ['lunch', 'dinner'],
  ingredientIds: [],
  nutrition: { weightAmount: 180, calories: 260 },
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
        { date: '2026-07-06', mealType: 'breakfast', recipeIds: [] },
        { date: '2026-07-06', mealType: 'lunch', recipeIds: [] },
        { date: '2026-07-06', mealType: 'dinner', recipeIds: [] },
      ],
    });
    expect(plan.days[6].date).toBe('2026-07-12');
  });

  it('assigns a compatible recipe to a slot', () => {
    expect(addRecipeToSlot({ date: '2026-07-06', mealType: 'lunch', recipeIds: [] }, lunchRecipe)).toEqual({
      ok: true,
      value: {
        date: '2026-07-06',
        mealType: 'lunch',
        recipeIds: ['recipe-1'],
      },
    });
  });

  it('does not duplicate a recipe already assigned to a slot', () => {
    expect(
      addRecipeToSlot(
        { date: '2026-07-06', mealType: 'lunch', recipeIds: ['recipe-1'] },
        lunchRecipe,
      ),
    ).toEqual({
      ok: true,
      value: {
        date: '2026-07-06',
        mealType: 'lunch',
        recipeIds: ['recipe-1'],
      },
    });
  });

  it('rejects an incompatible recipe assignment', () => {
    expect(addRecipeToSlot({ date: '2026-07-06', mealType: 'dinner', recipeIds: [] }, lunchRecipe)).toEqual({
      ok: false,
      error: {
        code: 'RECIPE_INCOMPATIBLE_WITH_SLOT',
        message: 'La ricetta non è compatibile con questo pasto.',
      },
    });
  });

  it('removes every recipe from a slot', () => {
    expect(
      removeRecipeFromSlot({
        date: '2026-07-06',
        mealType: 'lunch',
        recipeIds: ['recipe-1', 'recipe-2'],
      }),
    ).toEqual({
      date: '2026-07-06',
      mealType: 'lunch',
      recipeIds: [],
    });
  });

  it('removes one recipe from a slot', () => {
    expect(
      removeRecipeFromSlotById(
        {
          date: '2026-07-06',
          mealType: 'lunch',
          recipeIds: ['recipe-1', 'recipe-2'],
        },
        'recipe-1',
      ),
    ).toEqual({
      date: '2026-07-06',
      mealType: 'lunch',
      recipeIds: ['recipe-2'],
    });
  });

  it('normalizes legacy recipeId slots', () => {
    expect(
      normalizeMealSlot({
        date: '2026-07-06',
        mealType: 'lunch',
        recipeId: 'recipe-1',
      }),
    ).toEqual({
      date: '2026-07-06',
      mealType: 'lunch',
      recipeIds: ['recipe-1'],
    });
  });

  it('calculates nutrition totals from planned recipes', () => {
    const plan = createEmptyMealPlan({
      id: 'plan-1',
      weekStartDate: '2026-07-06',
      now: '2026-07-04T12:00:00.000Z',
    });
    const plannedDay = {
      ...plan.days[0],
      slots: plan.days[0].slots.map((slot) =>
        slot.mealType === 'lunch'
          ? { ...slot, recipeIds: [lunchRecipe.id, sideRecipe.id] }
          : slot.mealType === 'dinner'
            ? { ...slot, recipeIds: [sideRecipe.id] }
            : slot,
      ),
    };
    const plannedPlan = {
      ...plan,
      days: plan.days.map((day, index) => (index === 0 ? plannedDay : day)),
    };

    expect(calculateMealSlotNutritionTotal(plannedDay.slots[1], [lunchRecipe, sideRecipe])).toEqual({
      calories: 780,
      weightAmount: 0,
    });
    expect(calculatePlanDayNutritionTotal(plannedDay, [lunchRecipe, sideRecipe])).toEqual({
      calories: 1040,
      weightAmount: 0,
    });
    expect(calculateMealPlanNutritionTotal(plannedPlan, [lunchRecipe, sideRecipe])).toEqual({
      calories: 1040,
      weightAmount: 0,
    });
  });
});
