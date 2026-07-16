import { createAppPersistence } from '../../features/appPersistence';
import { createInitialAppModel, type AppModel } from '../../features/appModel';
import type { QueryExecutor } from '../../data/repositories';
import { createFakeQueryExecutor } from '../builders';

const timestamp = '2026-07-04T12:00:00.000Z';

describe('appPersistence', () => {
  it('loads local rows into the app model', async () => {
    const { db, allRows } = createFakeQueryExecutor();
    const initial = createInitialAppModel();
    allRows.set('SELECT * FROM ingredients ORDER BY name;', [
      {
        id: 'ingredient-1',
        name: 'Pomodoro',
        available: 1,
        created_at: timestamp,
        updated_at: timestamp,
      },
    ]);
    allRows.set('SELECT * FROM recipes ORDER BY name;', [
      {
        id: 'recipe-1',
        name: 'Pasta',
        meal_types: '["lunch"]',
        ingredient_ids: '["ingredient-1"]',
        weight_amount: 320,
        calories: 520,
        notes: null,
        created_at: timestamp,
        updated_at: timestamp,
      },
    ]);
    allRows.set('SELECT * FROM meal_plans ORDER BY updated_at DESC;', [
      {
        id: initial.mealPlan.id,
        title: 'Piano test',
        week_start_date: initial.mealPlan.weekStartDate,
        days: JSON.stringify(initial.mealPlan.days),
        created_at: timestamp,
        updated_at: timestamp,
      },
    ]);

    const persistence = await createAppPersistence(db);

    await expect(persistence.load()).resolves.toMatchObject({
      ingredients: [{ id: 'ingredient-1', name: 'Pomodoro' }],
      mealPlan: { id: initial.mealPlan.id, title: 'Piano test' },
      mealPlans: [{ id: initial.mealPlan.id, title: 'Piano test' }],
      nutritionSettings: { trackingEnabled: false, weightUnit: 'g' },
      recipes: [{ id: 'recipe-1', name: 'Pasta', nutrition: { weightAmount: 320, calories: 520 } }],
      selectedMealPlanId: initial.mealPlan.id,
    });
  });

  it('deletes removed entities when saving a snapshot', async () => {
    const { db, runs } = createFakeQueryExecutor();
    const persistence = await createAppPersistence(db);
    const previous: AppModel = {
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
      recipes: [
        {
          id: 'recipe-1',
          name: 'Pasta',
          mealTypes: ['lunch'],
          ingredientIds: ['ingredient-1'],
          createdAt: timestamp,
          updatedAt: timestamp,
        },
      ],
    };
    const next: AppModel = {
      ...previous,
      ingredients: [],
      recipes: [],
    };

    await persistence.saveSnapshot(previous, next);

    expect(runs).toEqual(
      expect.arrayContaining([
        { source: 'DELETE FROM ingredients WHERE id = ?;', params: ['ingredient-1'] },
        { source: 'DELETE FROM recipes WHERE id = ?;', params: ['recipe-1'] },
      ]),
    );
  });

  it('resets local data and recreates the initial meal plan', async () => {
    const { db, runs } = createFakeQueryExecutor();
    const persistence = await createAppPersistence(db);

    const resetModel = await persistence.resetLocalData();

    expect(resetModel).toMatchObject({
      ingredients: [],
      recipes: [],
      mealPlan: { id: 'plan-current', title: 'Piano settimanale' },
      mealPlans: [{ id: 'plan-current', title: 'Piano settimanale' }],
      nutritionSettings: { trackingEnabled: false, weightUnit: 'g' },
      selectedMealPlanId: 'plan-current',
    });
    expect(runs).toEqual(
      expect.arrayContaining([
        { source: 'DELETE FROM ingredients;', params: [] },
        { source: 'DELETE FROM recipes;', params: [] },
        { source: 'DELETE FROM meal_plans;', params: [] },
        { source: 'DELETE FROM user_preferences;', params: [] },
      ]),
    );
    expect(runs).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          source: expect.stringContaining('INSERT OR REPLACE INTO meal_plans'),
        }),
      ]),
    );
    expect(runs.map((run) => run.source).slice(0, 4)).toEqual([
      'DELETE FROM ingredients;',
      'DELETE FROM recipes;',
      'DELETE FROM meal_plans;',
      'DELETE FROM user_preferences;',
    ]);
  });

  it('runs reset after pending snapshot writes', async () => {
    const initial = createInitialAppModel();
    const startedSql: string[] = [];
    let releaseRecipeSave: (() => void) | undefined;
    let resolveRecipeSaveStarted: (() => void) | undefined;
    const recipeSaveStarted = new Promise<void>((resolve) => {
      resolveRecipeSaveStarted = resolve;
    });
    const db: QueryExecutor = {
      runAsync: async (source) => {
        startedSql.push(source);
        if (source.includes('INSERT OR REPLACE INTO recipes')) {
          resolveRecipeSaveStarted?.();
          await new Promise<void>((resolve) => {
            releaseRecipeSave = resolve;
          });
        }
        return {};
      },
      getAllAsync: async () => [],
      getFirstAsync: async () => null,
    };
    const persistence = await createAppPersistence(db);
    const next: AppModel = {
      ...initial,
      ingredients: [
        {
          id: 'ingredient-1',
          name: 'Pomodoro',
          available: true,
          createdAt: timestamp,
          updatedAt: timestamp,
        },
      ],
      recipes: [
        {
          id: 'recipe-1',
          name: 'Pasta',
          mealTypes: ['lunch'],
          ingredientIds: ['ingredient-1'],
          createdAt: timestamp,
          updatedAt: timestamp,
        },
      ],
    };

    const savePromise = persistence.saveSnapshot(initial, next);
    await recipeSaveStarted;
    const resetPromise = persistence.resetLocalData();

    expect(startedSql).not.toContain('DELETE FROM ingredients;');

    releaseRecipeSave?.();
    await savePromise;
    await resetPromise;

    const recipeSaveIndex = startedSql.findIndex((source) =>
      source.includes('INSERT OR REPLACE INTO recipes'),
    );
    const firstResetIndex = startedSql.indexOf('DELETE FROM ingredients;');
    expect(firstResetIndex).toBeGreaterThan(recipeSaveIndex);
    expect(startedSql.slice(firstResetIndex, firstResetIndex + 4)).toEqual([
      'DELETE FROM ingredients;',
      'DELETE FROM recipes;',
      'DELETE FROM meal_plans;',
      'DELETE FROM user_preferences;',
    ]);
  });

  it('loads and saves user preferences', async () => {
    const { db, firstRows, runs } = createFakeQueryExecutor();
    const persistence = await createAppPersistence(db);

    await expect(persistence.getThemeMode()).resolves.toBe('system');
    await expect(persistence.getLanguage()).resolves.toBe('it');
    await expect(persistence.getNutritionSettings()).resolves.toEqual({
      trackingEnabled: false,
      weightUnit: 'g',
    });

    firstRows.set('SELECT value FROM user_preferences WHERE key = ?;', { value: 'dark' });
    await expect(persistence.getThemeMode()).resolves.toBe('dark');

    await persistence.saveThemeMode('light');
    await persistence.saveLanguage('en');
    await persistence.saveNutritionSettings({ trackingEnabled: true, weightUnit: 'kg' });

    expect(runs).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          params: expect.arrayContaining(['themeMode', 'light']),
          source: 'INSERT OR REPLACE INTO user_preferences (key, value, updated_at) VALUES (?, ?, ?);',
        }),
        expect.objectContaining({
          params: expect.arrayContaining(['language', 'en']),
          source: 'INSERT OR REPLACE INTO user_preferences (key, value, updated_at) VALUES (?, ?, ?);',
        }),
        expect.objectContaining({
          params: expect.arrayContaining(['nutritionTrackingEnabled', 'true']),
          source: 'INSERT OR REPLACE INTO user_preferences (key, value, updated_at) VALUES (?, ?, ?);',
        }),
        expect.objectContaining({
          params: expect.arrayContaining(['weightUnit', 'kg']),
          source: 'INSERT OR REPLACE INTO user_preferences (key, value, updated_at) VALUES (?, ?, ?);',
        }),
      ]),
    );
  });

  it('replaces local data and preferences during import', async () => {
    const { db, runs } = createFakeQueryExecutor();
    const persistence = await createAppPersistence(db);
    const importedModel: AppModel = {
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
      nutritionSettings: { trackingEnabled: true, weightUnit: 'oz' },
    };

    await persistence.replaceLocalData(importedModel, 'en', 'dark');

    expect(runs.map((run) => run.source).slice(0, 4)).toEqual([
      'DELETE FROM ingredients;',
      'DELETE FROM recipes;',
      'DELETE FROM meal_plans;',
      'DELETE FROM user_preferences;',
    ]);
    expect(runs).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          source: expect.stringContaining('INSERT OR REPLACE INTO ingredients'),
        }),
        expect.objectContaining({
          params: expect.arrayContaining(['language', 'en']),
          source: 'INSERT OR REPLACE INTO user_preferences (key, value, updated_at) VALUES (?, ?, ?);',
        }),
        expect.objectContaining({
          params: expect.arrayContaining(['themeMode', 'dark']),
          source: 'INSERT OR REPLACE INTO user_preferences (key, value, updated_at) VALUES (?, ?, ?);',
        }),
        expect.objectContaining({
          params: expect.arrayContaining(['nutritionTrackingEnabled', 'true']),
          source: 'INSERT OR REPLACE INTO user_preferences (key, value, updated_at) VALUES (?, ?, ?);',
        }),
        expect.objectContaining({
          params: expect.arrayContaining(['weightUnit', 'oz']),
          source: 'INSERT OR REPLACE INTO user_preferences (key, value, updated_at) VALUES (?, ?, ?);',
        }),
      ]),
    );
  });
});
