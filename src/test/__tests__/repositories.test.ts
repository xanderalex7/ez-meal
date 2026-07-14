import {
  createIngredientRepository,
  createMealPlanRepository,
  createPreferenceRepository,
  createRecipeRepository,
} from '../../data/repositories';
import { createEmptyMealPlan, type Ingredient, type Recipe } from '../../domain';
import { createFakeQueryExecutor } from '../builders';

const timestamp = '2026-07-04T12:00:00.000Z';

describe('repositories', () => {
  it('saves and lists recipes through mapped SQLite rows', async () => {
    const { db, runs, allRows } = createFakeQueryExecutor();
    const repository = createRecipeRepository(db);
    const recipe: Recipe = {
      id: 'recipe-1',
      name: 'Pasta',
      mealTypes: ['lunch'],
      ingredientIds: ['ingredient-1'],
      createdAt: timestamp,
      updatedAt: timestamp,
    };

    await expect(repository.save(recipe)).resolves.toEqual({ ok: true, value: recipe });
    expect(runs[0].params).toEqual([
      'recipe-1',
      'Pasta',
      '["lunch"]',
      '["ingredient-1"]',
      null,
      timestamp,
      timestamp,
    ]);

    allRows.set('SELECT * FROM recipes ORDER BY name;', [
      {
        id: 'recipe-1',
        name: 'Pasta',
        meal_types: '["lunch"]',
        ingredient_ids: '["ingredient-1"]',
        notes: null,
        created_at: timestamp,
        updated_at: timestamp,
      },
    ]);

    await expect(repository.list()).resolves.toEqual({ ok: true, value: [recipe] });
  });

  it('saves and lists ingredients through mapped SQLite rows', async () => {
    const { db, runs, allRows } = createFakeQueryExecutor();
    const repository = createIngredientRepository(db);
    const ingredient: Ingredient = {
      id: 'ingredient-1',
      name: 'Pomodoro',
      available: true,
      createdAt: timestamp,
      updatedAt: timestamp,
    };

    await expect(repository.save(ingredient)).resolves.toEqual({ ok: true, value: ingredient });
    expect(runs[0].params).toEqual(['ingredient-1', 'Pomodoro', 1, timestamp, timestamp]);

    allRows.set('SELECT * FROM ingredients ORDER BY name;', [
      {
        id: 'ingredient-1',
        name: 'Pomodoro',
        available: 1,
        created_at: timestamp,
        updated_at: timestamp,
      },
    ]);

    await expect(repository.list()).resolves.toEqual({ ok: true, value: [ingredient] });
  });

  it('saves and finds meal plans by week start date', async () => {
    const { db, runs, firstRows, allRows } = createFakeQueryExecutor();
    const repository = createMealPlanRepository(db);
    const plan = createEmptyMealPlan({
      id: 'plan-1',
      title: 'Piano bulk',
      weekStartDate: '2026-07-06',
      now: timestamp,
    });

    await expect(repository.save(plan)).resolves.toEqual({ ok: true, value: plan });
    expect(runs[0].params).toEqual([
      'plan-1',
      'Piano bulk',
      '2026-07-06',
      JSON.stringify(plan.days),
      timestamp,
      timestamp,
    ]);

    firstRows.set('SELECT * FROM meal_plans WHERE week_start_date = ?;', {
      id: 'plan-1',
      title: 'Piano bulk',
      week_start_date: '2026-07-06',
      days: JSON.stringify(plan.days),
      created_at: timestamp,
      updated_at: timestamp,
    });

    await expect(repository.findByWeekStartDate('2026-07-06')).resolves.toEqual({
      ok: true,
      value: plan,
    });

    allRows.set('SELECT * FROM meal_plans ORDER BY updated_at DESC;', [
      {
        id: 'plan-1',
        title: 'Piano bulk',
        week_start_date: '2026-07-06',
        days: JSON.stringify(plan.days),
        created_at: timestamp,
        updated_at: timestamp,
      },
    ]);

    await expect(repository.list()).resolves.toEqual({ ok: true, value: [plan] });
  });

  it('normalizes legacy meal plan slots with a single recipeId', async () => {
    const { db, firstRows } = createFakeQueryExecutor();
    const repository = createMealPlanRepository(db);
    const plan = createEmptyMealPlan({
      id: 'plan-1',
      title: 'Piano bulk',
      weekStartDate: '2026-07-06',
      now: timestamp,
    });
    const legacyDays = plan.days.map((day, dayIndex) =>
      dayIndex === 0
        ? {
            ...day,
            slots: day.slots.map((slot) =>
              slot.mealType === 'lunch'
                ? { date: slot.date, mealType: slot.mealType, recipeId: 'recipe-1' }
                : slot,
            ),
          }
        : day,
    );

    firstRows.set('SELECT * FROM meal_plans WHERE week_start_date = ?;', {
      id: 'plan-1',
      title: 'Piano bulk',
      week_start_date: '2026-07-06',
      days: JSON.stringify(legacyDays),
      created_at: timestamp,
      updated_at: timestamp,
    });

    await expect(repository.findByWeekStartDate('2026-07-06')).resolves.toEqual({
      ok: true,
      value: {
        ...plan,
        days: plan.days.map((day, dayIndex) =>
          dayIndex === 0
            ? {
                ...day,
                slots: day.slots.map((slot) =>
                  slot.mealType === 'lunch' ? { ...slot, recipeIds: ['recipe-1'] } : slot,
                ),
              }
            : day,
        ),
      },
    });
  });

  it('persists theme and language preferences with fallbacks', async () => {
    const { db, firstRows } = createFakeQueryExecutor();
    const repository = createPreferenceRepository(db);

    await expect(repository.getThemeMode()).resolves.toEqual({ ok: true, value: 'system' });
    await expect(repository.getLanguage()).resolves.toEqual({ ok: true, value: 'it' });
    await expect(repository.saveThemeMode('dark', timestamp)).resolves.toEqual({
      ok: true,
      value: 'dark',
    });
    await expect(repository.saveLanguage('en', timestamp)).resolves.toEqual({
      ok: true,
      value: 'en',
    });

    firstRows.set('SELECT value FROM user_preferences WHERE key = ?;', { value: 'dark' });
    await expect(repository.getThemeMode()).resolves.toEqual({ ok: true, value: 'dark' });

    firstRows.set('SELECT value FROM user_preferences WHERE key = ?;', { value: 'en' });
    await expect(repository.getLanguage()).resolves.toEqual({ ok: true, value: 'en' });
  });
});
