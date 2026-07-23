import { createEmptyMealPlan, type Recipe } from '../../domain';
import { createAppActions, createInitialAppModel, type AppModel } from '../../features/appModel';

const timestamp = '2026-07-04T12:00:00.000Z';

const plannedRecipe: Recipe = {
  id: 'recipe-1',
  name: 'Pasta',
  mealTypes: ['lunch'],
  ingredientIds: ['ingredient-1'],
  createdAt: timestamp,
  updatedAt: timestamp,
};

const dinnerRecipe: Recipe = {
  id: 'recipe-2',
  name: 'Zuppa',
  mealTypes: ['dinner'],
  ingredientIds: [],
  createdAt: timestamp,
  updatedAt: timestamp,
};

const lunchSideRecipe: Recipe = {
  id: 'recipe-4',
  name: 'Pollo',
  mealTypes: ['lunch'],
  ingredientIds: [],
  createdAt: timestamp,
  updatedAt: timestamp,
};

const breakfastRecipe: Recipe = {
  id: 'recipe-3',
  name: 'Yogurt',
  mealTypes: ['breakfast'],
  ingredientIds: [],
  createdAt: timestamp,
  updatedAt: timestamp,
};

function createModelHarness(initialModel: AppModel) {
  let model = initialModel;
  const setModel = (update: AppModel | ((current: AppModel) => AppModel)) => {
    model = typeof update === 'function' ? update(model) : update;
  };

  return {
    get model() {
      return model;
    },
    actions() {
      return createAppActions(model, setModel);
    },
  };
}

describe('appModel destructive actions', () => {
  it('requires confirmation before removing an ingredient from recipes', () => {
    const harness = createModelHarness({
      ...createInitialAppModel(),
      ingredients: [
        {
          id: 'ingredient-1',
          name: 'Pomodoro',
          available: true,
          createdAt: timestamp,
          updatedAt: timestamp,
        },
      ],
      recipes: [plannedRecipe],
    });

    const warning = harness.actions().deleteIngredient('ingredient-1');

    expect(warning).toMatch(/Ingrediente usato in 1 piatti/);
    expect(harness.model.ingredients).toHaveLength(1);
    expect(harness.model.recipes[0].ingredientIds).toEqual(['ingredient-1']);

    const result = harness.actions().deleteIngredient('ingredient-1', { forceCascade: true });

    expect(result).toBeNull();
    expect(harness.model.ingredients).toEqual([]);
    expect(harness.model.recipes[0].ingredientIds).toEqual([]);
  });

  it('requires confirmation and removes a deleted recipe from every meal plan', () => {
    const firstPlan = createEmptyMealPlan({
      id: 'plan-1',
      title: 'Piano 1',
      weekStartDate: '2026-06-29',
      now: timestamp,
    });
    const secondPlan = createEmptyMealPlan({
      id: 'plan-2',
      title: 'Piano 2',
      weekStartDate: '2026-06-29',
      now: timestamp,
    });
    const plannedFirstPlan = assignLunch(firstPlan, plannedRecipe.id);
    const plannedSecondPlan = assignLunch(secondPlan, plannedRecipe.id);
    const harness = createModelHarness({
      ...createInitialAppModel(),
      mealPlan: plannedFirstPlan,
      mealPlans: [plannedFirstPlan, plannedSecondPlan],
      recipes: [plannedRecipe],
      selectedMealPlanId: plannedFirstPlan.id,
    });

    const warning = harness.actions().deleteRecipe(plannedRecipe.id);

    expect(warning).toMatch(/Piatto pianificato in 2 pasti/);
    expect(harness.model.recipes).toHaveLength(1);
    expect(countPlannedRecipe(harness.model, plannedRecipe.id)).toBe(2);

    const result = harness.actions().deleteRecipe(plannedRecipe.id, { forceCascade: true });

    expect(result).toBeNull();
    expect(harness.model.recipes).toEqual([]);
    expect(countPlannedRecipe(harness.model, plannedRecipe.id)).toBe(0);
  });
});

describe('appModel duplicate policy', () => {
  it('moves ingredients between pantry and shopping states', () => {
    const harness = createModelHarness({
      ...createInitialAppModel(),
      ingredients: [
        {
          id: 'ingredient-1',
          name: 'Pomodoro',
          available: true,
          createdAt: timestamp,
          updatedAt: timestamp,
        },
      ],
    });

    expect(harness.actions().setIngredientAvailability('ingredient-1', false)).toBeNull();
    expect(harness.model.ingredients[0].available).toBe(false);

    expect(harness.actions().setIngredientAvailability('ingredient-1', true)).toBeNull();
    expect(harness.model.ingredients[0].available).toBe(true);
  });

  it('rejects duplicate ingredient names ignoring case and surrounding spaces', () => {
    const harness = createModelHarness({
      ...createInitialAppModel(),
      ingredients: [
        {
          id: 'ingredient-1',
          name: 'Pomodoro',
          available: true,
          createdAt: timestamp,
          updatedAt: timestamp,
        },
      ],
    });

    const result = harness.actions().addIngredient('  pomodoro  ');

    expect(result).toBe('Esiste già un ingrediente con questo nome.');
    expect(harness.model.ingredients).toHaveLength(1);
  });

  it('rejects duplicate recipe names on create and update', () => {
    const harness = createModelHarness({
      ...createInitialAppModel(),
      recipes: [plannedRecipe, dinnerRecipe],
    });

    const createResult = harness.actions().addRecipe({
      ingredientIds: ['ingredient-1'],
      mealTypes: ['lunch'],
      name: ' pasta ',
    });
    const updateResult = harness.actions().updateRecipe(dinnerRecipe.id, {
      ingredientIds: ['ingredient-1'],
      mealTypes: ['dinner'],
      name: 'PASTA',
    });

    expect(createResult).toBe('Esiste già un piatto con questo nome.');
    expect(updateResult).toBe('Esiste già un piatto con questo nome.');
    expect(harness.model.recipes.map((recipe) => recipe.name)).toEqual(['Pasta', 'Zuppa']);
  });
});

describe('appModel generated plan draft', () => {
  it('keeps a generated random plan as draft until it is saved', () => {
    const initialModel = {
      ...createInitialAppModel(),
      recipes: [breakfastRecipe, plannedRecipe, dinnerRecipe],
    };
    const harness = createModelHarness(initialModel);

    const uncovered = harness.actions().generatePlan();

    expect(uncovered).toBe(0);
    expect(harness.model.generatedMealPlanDraft).toBeDefined();
    expect(countPlannedRecipe(harness.model, plannedRecipe.id)).toBe(0);
    expect(
      harness.model.generatedMealPlanDraft?.days.some((day) =>
        day.slots.some((slot) => slot.recipeIds.includes(plannedRecipe.id)),
      ),
    ).toBe(true);

    const result = harness.actions().saveGeneratedPlan();

    expect(result).toBeNull();
    expect(harness.model.generatedMealPlanDraft).toBeUndefined();
    expect(countPlannedRecipe(harness.model, plannedRecipe.id)).toBeGreaterThan(0);
  });
});

describe('appModel meal slot recipes', () => {
  it('adds multiple compatible recipes to the same meal slot and removes one recipe', () => {
    const harness = createModelHarness({
      ...createInitialAppModel(),
      recipes: [plannedRecipe, lunchSideRecipe],
    });
    const lunchSlot = harness.model.mealPlan.days[0].slots.find((slot) => slot.mealType === 'lunch');

    expect(lunchSlot).toBeDefined();
    const firstResult = harness.actions().assignRecipeToMealSlot(lunchSlot!.date, 'lunch', plannedRecipe.id);
    const secondResult = harness.actions().assignRecipeToMealSlot(lunchSlot!.date, 'lunch', lunchSideRecipe.id);

    expect(firstResult).toBeNull();
    expect(secondResult).toBeNull();
    expect(harness.model.mealPlan.days[0].slots.find((slot) => slot.mealType === 'lunch')?.recipeIds).toEqual([
      plannedRecipe.id,
      lunchSideRecipe.id,
    ]);

    harness.actions().removeRecipeFromMealSlot(lunchSlot!.date, 'lunch', plannedRecipe.id);

    expect(harness.model.mealPlan.days[0].slots.find((slot) => slot.mealType === 'lunch')?.recipeIds).toEqual([
      lunchSideRecipe.id,
    ]);
  });
});

function assignLunch(mealPlan: AppModel['mealPlan'], recipeId: string) {
  return {
    ...mealPlan,
    days: mealPlan.days.map((day, dayIndex) =>
      dayIndex === 0
        ? {
            ...day,
            slots: day.slots.map((slot) =>
              slot.mealType === 'lunch' ? { ...slot, recipeIds: [recipeId] } : slot,
            ),
          }
        : day,
    ),
  };
}

function countPlannedRecipe(model: AppModel, recipeId: string) {
  return model.mealPlans.reduce(
    (count, plan) =>
      count +
      plan.days.reduce(
        (dayCount, day) =>
          dayCount + day.slots.filter((slot) => slot.recipeIds.includes(recipeId)).length,
        0,
      ),
    0,
  );
}
