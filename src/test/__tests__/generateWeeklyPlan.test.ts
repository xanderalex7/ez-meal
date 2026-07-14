import { createEmptyMealPlan, generateWeeklyPlan, type Recipe } from '../../domain';

const timestamp = '2026-07-04T12:00:00.000Z';

const breakfastRecipe: Recipe = {
  id: 'recipe-breakfast',
  name: 'Porridge',
  mealTypes: ['breakfast'],
  ingredientIds: [],
  createdAt: timestamp,
  updatedAt: timestamp,
};

const lunchRecipe: Recipe = {
  id: 'recipe-lunch',
  name: 'Pasta',
  mealTypes: ['lunch'],
  ingredientIds: [],
  createdAt: timestamp,
  updatedAt: timestamp,
};

const dinnerRecipe: Recipe = {
  id: 'recipe-dinner',
  name: 'Zuppa',
  mealTypes: ['dinner'],
  ingredientIds: [],
  createdAt: timestamp,
  updatedAt: timestamp,
};

describe('generateWeeklyPlan', () => {
  it('fills all slots when compatible recipes exist for every meal type', () => {
    const plan = createEmptyMealPlan({
      id: 'plan-1',
      weekStartDate: '2026-07-06',
      now: timestamp,
    });

    const result = generateWeeklyPlan({
      plan,
      recipes: [breakfastRecipe, lunchRecipe, dinnerRecipe],
      random: () => 0,
      now: '2026-07-04T13:00:00.000Z',
    });

    expect(result.uncoveredSlots).toEqual([]);
    expect(result.plan.days[0].slots).toEqual([
      { date: '2026-07-06', mealType: 'breakfast', recipeId: 'recipe-breakfast' },
      { date: '2026-07-06', mealType: 'lunch', recipeId: 'recipe-lunch' },
      { date: '2026-07-06', mealType: 'dinner', recipeId: 'recipe-dinner' },
    ]);
    expect(result.plan.updatedAt).toBe('2026-07-04T13:00:00.000Z');
  });

  it('does not change the plan when recipes are insufficient', () => {
    const plan = createEmptyMealPlan({
      id: 'plan-1',
      weekStartDate: '2026-07-06',
      now: timestamp,
    });

    const result = generateWeeklyPlan({
      plan,
      recipes: [lunchRecipe],
      random: () => 0,
      now: timestamp,
    });

    expect(result.uncoveredSlots).toHaveLength(14);
    expect(result.plan).toBe(plan);
  });

  it('keeps existing assignments unchanged when generation is blocked by missing meal types', () => {
    const plan = createEmptyMealPlan({
      id: 'plan-1',
      weekStartDate: '2026-07-06',
      now: timestamp,
    });
    const planWithAssignment = {
      ...plan,
      days: plan.days.map((day, dayIndex) =>
        dayIndex === 0
          ? {
              ...day,
              slots: day.slots.map((slot) =>
                slot.mealType === 'lunch' ? { ...slot, recipeId: 'recipe-lunch' } : slot,
              ),
            }
          : day,
      ),
    };

    const result = generateWeeklyPlan({
      plan: planWithAssignment,
      recipes: [lunchRecipe],
      random: () => 0,
      now: timestamp,
    });

    expect(result.uncoveredSlots).toHaveLength(14);
    expect(result.plan).toBe(planWithAssignment);
    expect(result.plan.days[0].slots[1]).toEqual({
      date: '2026-07-06',
      mealType: 'lunch',
      recipeId: 'recipe-lunch',
    });
  });

  it('uses the injected random source to choose among compatible recipes', () => {
    const alternativeLunchRecipe: Recipe = {
      ...lunchRecipe,
      id: 'recipe-lunch-2',
      name: 'Insalata',
    };
    const plan = createEmptyMealPlan({
      id: 'plan-1',
      weekStartDate: '2026-07-06',
      now: timestamp,
    });

    const result = generateWeeklyPlan({
      plan,
      recipes: [breakfastRecipe, lunchRecipe, alternativeLunchRecipe, dinnerRecipe],
      random: () => 0.99,
      now: timestamp,
    });

    expect(result.plan.days[0].slots[1]).toEqual({
      date: '2026-07-06',
      mealType: 'lunch',
      recipeId: 'recipe-lunch-2',
    });
  });

  it('returns every slot uncovered when no recipes exist', () => {
    const plan = createEmptyMealPlan({
      id: 'plan-1',
      weekStartDate: '2026-07-06',
      now: timestamp,
    });

    const result = generateWeeklyPlan({
      plan,
      recipes: [],
      random: () => 0,
      now: timestamp,
    });

    expect(result.uncoveredSlots).toHaveLength(21);
    expect(result.plan).toBe(plan);
  });
});
