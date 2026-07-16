import { createInitialAppModel } from '../../features/appModel';
import { exportAppModelToCsv, importAppModelFromCsv } from '../../features/importExport';

describe('import/export CSV', () => {
  it('exports and imports the app model, language and theme', () => {
    const model = createInitialAppModel();

    const csv = exportAppModelToCsv({
      exportedAt: '2026-07-14T10:00:00.000Z',
      language: 'it',
      model,
      themeMode: 'system',
    });
    const imported = importAppModelFromCsv(csv);

    expect(csv).toContain('record_type,id,parent_id,key,name,value');
    expect(csv).toContain('weight_amount,calories');
    expect(imported.language).toBe('it');
    expect(imported.themeMode).toBe('system');
    expect(imported.model.nutritionSettings).toEqual({ trackingEnabled: false, weightUnit: 'g' });
    expect(imported.model.mealPlans).toHaveLength(1);
    expect(imported.model.mealPlan.days).toHaveLength(7);
    expect(imported.model.mealPlan.days.flatMap((day) => day.slots)).toHaveLength(21);
  });

  it('roundtrips recipe nutrition and nutrition preferences', () => {
    const model = createInitialAppModel();
    const updatedModel = {
      ...model,
      nutritionSettings: { trackingEnabled: true, weightUnit: 'kg' as const },
      ingredients: [
        {
          id: 'ingredient-1',
          name: 'Riso',
          available: true,
          createdAt: '2026-07-04T12:00:00.000Z',
          updatedAt: '2026-07-04T12:00:00.000Z',
        },
      ],
      recipes: [
        {
          id: 'recipe-1',
          name: 'Riso e pollo',
          mealTypes: ['lunch' as const],
          ingredientIds: ['ingredient-1'],
          ingredientWeights: [{ ingredientId: 'ingredient-1', quantity: '1 cucchiaino' }],
          nutrition: { calories: 650 },
          createdAt: '2026-07-04T12:00:00.000Z',
          updatedAt: '2026-07-04T12:00:00.000Z',
        },
      ],
    };

    const csv = exportAppModelToCsv({
      exportedAt: '2026-07-14T10:00:00.000Z',
      language: 'it',
      model: updatedModel,
      themeMode: 'dark',
    });
    const imported = importAppModelFromCsv(csv);

    expect(csv).toContain('metadata,format,,schema_version,,3');
    expect(csv).toContain('preference,nutritionTrackingEnabled,,nutritionTrackingEnabled,,true');
    expect(csv).toContain('preference,weightUnit,,weightUnit,,kg');
    expect(csv).toContain('recipe,recipe-1,,,Riso e pollo,,,lunch');
    expect(csv).toContain('recipe_ingredient,recipe-1__ingredient-1,recipe-1,,,ingredient-1');
    expect(csv).toContain(',1 cucchiaino,');
    expect(imported.model.nutritionSettings).toEqual({ trackingEnabled: true, weightUnit: 'kg' });
    expect(imported.model.recipes[0].nutrition).toEqual({ calories: 650 });
    expect(imported.model.recipes[0].ingredientWeights).toEqual([
      { ingredientId: 'ingredient-1', quantity: '1 cucchiaino' },
    ]);
  });

  it('imports legacy schema version 1 CSV files without nutrition columns', () => {
    const model = createInitialAppModel();
    const csv = [
      'record_type,id,parent_id,key,name,value,available,meal_types,date,meal_type,recipe_id,week_start_date,created_at,updated_at,notes',
      'metadata,format,,schema_version,,1,,,,,,,,,',
      'metadata,export,,app_name,,EZ-MEAL,,,,,,,,,',
      'metadata,export,,exported_at,,2026-07-14T10:00:00.000Z,,,,,,,,,',
      'preference,language,,language,,it,,,,,,,,2026-07-14T10:00:00.000Z,',
      'preference,themeMode,,themeMode,,system,,,,,,,,2026-07-14T10:00:00.000Z,',
      'meal_plan,plan-current,,,Piano settimanale,,,,,,,2026-06-29,2026-07-04T12:00:00.000Z,2026-07-04T12:00:00.000Z,',
      ...model.mealPlan.days.flatMap((day) =>
        day.slots.map(
          (slot) =>
            `meal_slot,plan-current__${slot.date}__${slot.mealType},plan-current,,,,,,${slot.date},${slot.mealType},,,,,`,
        ),
      ),
    ].join('\n');

    const imported = importAppModelFromCsv(csv);

    expect(imported.model.nutritionSettings).toEqual({ trackingEnabled: false, weightUnit: 'g' });
    expect(imported.model.recipes).toEqual([]);
  });

  it('rejects invalid nutrition preferences and incomplete recipe nutrition', () => {
    const model = createInitialAppModel();
    const csv = exportAppModelToCsv({
      exportedAt: '2026-07-14T10:00:00.000Z',
      language: 'it',
      model: {
        ...model,
        nutritionSettings: { trackingEnabled: true, weightUnit: 'g' },
        recipes: [
          {
            id: 'recipe-1',
            name: 'Pasta',
            mealTypes: ['lunch' as const],
            ingredientIds: [],
            createdAt: '2026-07-04T12:00:00.000Z',
            updatedAt: '2026-07-04T12:00:00.000Z',
          },
        ],
      },
      themeMode: 'system',
    });

    expect(() => importAppModelFromCsv(csv)).toThrow('Dati nutrizionali mancanti per ricetta: Pasta');
    expect(() => importAppModelFromCsv(csv.replace(',g,', ',stone,'))).toThrow(
      'Preferenza unita peso non valida',
    );
  });

  it('imports legacy schema version 2 recipe weight when a recipe has one ingredient', () => {
    const model = createInitialAppModel();
    const csv = [
      'record_type,id,parent_id,key,name,value,available,meal_types,date,meal_type,recipe_id,week_start_date,created_at,updated_at,notes,weight_amount,calories',
      'metadata,format,,schema_version,,2,,,,,,,,,,,',
      'metadata,export,,app_name,,EZ-MEAL,,,,,,,,,,,',
      'metadata,export,,exported_at,,2026-07-14T10:00:00.000Z,,,,,,,,,,,',
      'preference,language,,language,,it,,,,,,,,2026-07-14T10:00:00.000Z,,,',
      'preference,themeMode,,themeMode,,system,,,,,,,,2026-07-14T10:00:00.000Z,,,',
      'preference,nutritionTrackingEnabled,,nutritionTrackingEnabled,,true,,,,,,,,2026-07-14T10:00:00.000Z,,,',
      'preference,weightUnit,,weightUnit,,g,,,,,,,,2026-07-14T10:00:00.000Z,,,',
      'ingredient,ingredient-1,,,Riso,,true,,,,,,2026-07-04T12:00:00.000Z,2026-07-04T12:00:00.000Z,,,',
      'recipe,recipe-1,,,Riso in bianco,,,lunch,,,,,2026-07-04T12:00:00.000Z,2026-07-04T12:00:00.000Z,,80,240',
      'recipe_ingredient,recipe-1__ingredient-1,recipe-1,,,ingredient-1,,,,,,,,,,,',
      'meal_plan,plan-current,,,Piano settimanale,,,,,,,2026-06-29,2026-07-04T12:00:00.000Z,2026-07-04T12:00:00.000Z,,,',
      ...model.mealPlan.days.flatMap((day) =>
        day.slots.map(
          (slot) =>
            `meal_slot,plan-current__${slot.date}__${slot.mealType},plan-current,,,,,,${slot.date},${slot.mealType},,,,,,`,
        ),
      ),
    ].join('\n');

    const imported = importAppModelFromCsv(csv);

    expect(imported.model.recipes[0].nutrition).toEqual({ weightAmount: 80, calories: 240 });
    expect(imported.model.recipes[0].ingredientWeights).toEqual([
      { ingredientId: 'ingredient-1', quantity: '80', weightAmount: 80 },
    ]);
  });

  it('roundtrips multiple recipes in the same meal slot', () => {
    const model = createInitialAppModel();
    const updatedModel = {
      ...model,
      recipes: [
        {
          id: 'recipe-1',
          name: 'Riso in bianco',
          mealTypes: ['lunch' as const],
          ingredientIds: [],
          createdAt: '2026-07-04T12:00:00.000Z',
          updatedAt: '2026-07-04T12:00:00.000Z',
        },
        {
          id: 'recipe-2',
          name: 'Pollo',
          mealTypes: ['lunch' as const],
          ingredientIds: [],
          createdAt: '2026-07-04T12:00:00.000Z',
          updatedAt: '2026-07-04T12:00:00.000Z',
        },
      ],
      mealPlan: {
        ...model.mealPlan,
        days: model.mealPlan.days.map((day, dayIndex) =>
          dayIndex === 0
            ? {
                ...day,
                slots: day.slots.map((slot) =>
                  slot.mealType === 'lunch' ? { ...slot, recipeIds: ['recipe-1', 'recipe-2'] } : slot,
                ),
              }
            : day,
        ),
      },
    };

    const csv = exportAppModelToCsv({
      exportedAt: '2026-07-14T10:00:00.000Z',
      language: 'it',
      model: { ...updatedModel, mealPlans: [updatedModel.mealPlan] },
      themeMode: 'system',
    });
    const imported = importAppModelFromCsv(csv);

    expect(csv).toContain('2026-06-29,lunch,recipe-1;recipe-2');
    expect(imported.model.mealPlan.days[0].slots.find((slot) => slot.mealType === 'lunch')?.recipeIds).toEqual([
      'recipe-1',
      'recipe-2',
    ]);
  });

  it('rejects planned recipes that are incompatible with the slot meal type', () => {
    const model = createInitialAppModel();
    const csv = [
      'record_type,id,parent_id,key,name,value,available,meal_types,date,meal_type,recipe_id,week_start_date,created_at,updated_at,notes',
      'metadata,format,,schema_version,,1,,,,,,,,,',
      'metadata,export,,app_name,,EZ-MEAL,,,,,,,,,',
      'metadata,export,,exported_at,,2026-07-14T10:00:00.000Z,,,,,,,,,',
      'preference,language,,language,,it,,,,,,,,2026-07-14T10:00:00.000Z,',
      'preference,themeMode,,themeMode,,system,,,,,,,,2026-07-14T10:00:00.000Z,',
      'recipe,recipe-1,,,Pasta,,,lunch,,,,,2026-07-04T12:00:00.000Z,2026-07-04T12:00:00.000Z,',
      'meal_plan,plan-current,,,Piano settimanale,,,,,,,2026-06-29,2026-07-04T12:00:00.000Z,2026-07-04T12:00:00.000Z,',
      ...model.mealPlan.days.flatMap((day) =>
        day.slots.map((slot) => {
          const recipeId = slot.date === '2026-06-29' && slot.mealType === 'breakfast' ? 'recipe-1' : '';
          return `meal_slot,plan-current__${slot.date}__${slot.mealType},plan-current,,,,,,${slot.date},${slot.mealType},${recipeId},,,,`;
        }),
      ),
    ].join('\n');

    expect(() => importAppModelFromCsv(csv)).toThrow('Ricetta non compatibile');
  });
});
