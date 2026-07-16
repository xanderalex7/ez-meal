import type { AppModel } from '../appModel';
import { createInitialAppModel } from '../appModel';
import type { Ingredient, MealPlan, MealType, NutritionSettings, Recipe } from '../../domain';
import {
  defaultNutritionSettings,
  hasCompleteRecipeNutrition,
  isWeightUnit,
  mealTypes,
} from '../../domain';
import { isLanguage, type Language } from '../../shared/i18n';
import { isThemeMode, type ThemeMode } from '../../shared/theme';

export type ImportExportStepId =
  | 'read'
  | 'schema'
  | 'preferences'
  | 'ingredients'
  | 'recipes'
  | 'relations'
  | 'plans'
  | 'database'
  | 'app'
  | 'export';

export type ImportProgress = (stepId: ImportExportStepId, status: 'active' | 'success' | 'error') => void;

export type CsvImportData = {
  language: Language;
  model: AppModel;
  themeMode: ThemeMode;
};

type CsvRecord = Record<(typeof csvHeader)[number], string>;

const csvHeader = [
  'record_type',
  'id',
  'parent_id',
  'key',
  'name',
  'value',
  'available',
  'meal_types',
  'date',
  'meal_type',
  'recipe_id',
  'week_start_date',
  'created_at',
  'updated_at',
  'notes',
  'weight_amount',
  'calories',
] as const;

const legacyCsvHeader = csvHeader.filter(
  (column) => column !== 'weight_amount' && column !== 'calories',
);

const mealTypeSet = new Set<string>(mealTypes);

export function exportAppModelToCsv(input: {
  exportedAt: string;
  language: Language;
  model: AppModel;
  themeMode: ThemeMode;
}) {
  const rows: string[][] = [
    [...csvHeader],
    metadataRow('format', 'schema_version', '2'),
    metadataRow('export', 'app_name', 'EZ-MEAL'),
    metadataRow('export', 'exported_at', input.exportedAt),
    row({ record_type: 'preference', id: 'language', key: 'language', value: input.language, updated_at: input.exportedAt }),
    row({ record_type: 'preference', id: 'themeMode', key: 'themeMode', value: input.themeMode, updated_at: input.exportedAt }),
    row({
      record_type: 'preference',
      id: 'nutritionTrackingEnabled',
      key: 'nutritionTrackingEnabled',
      value: String(input.model.nutritionSettings.trackingEnabled),
      updated_at: input.exportedAt,
    }),
    row({
      record_type: 'preference',
      id: 'weightUnit',
      key: 'weightUnit',
      value: input.model.nutritionSettings.weightUnit,
      updated_at: input.exportedAt,
    }),
  ];

  input.model.ingredients.forEach((ingredient) => {
    rows.push(
      row({
        record_type: 'ingredient',
        id: ingredient.id,
        name: ingredient.name,
        available: String(ingredient.available),
        created_at: ingredient.createdAt,
        updated_at: ingredient.updatedAt,
      }),
    );
  });

  input.model.recipes.forEach((recipe) => {
    rows.push(
      row({
        record_type: 'recipe',
        id: recipe.id,
        name: recipe.name,
        meal_types: recipe.mealTypes.join(';'),
        created_at: recipe.createdAt,
        updated_at: recipe.updatedAt,
        notes: recipe.notes ?? '',
        weight_amount: recipe.nutrition ? String(recipe.nutrition.weightAmount) : '',
        calories: recipe.nutrition ? String(recipe.nutrition.calories) : '',
      }),
    );
    recipe.ingredientIds.forEach((ingredientId) => {
      rows.push(
        row({
          record_type: 'recipe_ingredient',
          id: `${recipe.id}__${ingredientId}`,
          parent_id: recipe.id,
          value: ingredientId,
        }),
      );
    });
  });

  getAllMealPlans(input.model).forEach((plan) => {
    rows.push(
      row({
        record_type: 'meal_plan',
        id: plan.id,
        name: plan.title,
        week_start_date: plan.weekStartDate,
        created_at: plan.createdAt,
        updated_at: plan.updatedAt,
      }),
    );
    plan.days.forEach((day) => {
      day.slots.forEach((slot) => {
        rows.push(
          row({
            record_type: 'meal_slot',
            id: `${plan.id}__${slot.date}__${slot.mealType}`,
            parent_id: plan.id,
            date: slot.date,
            meal_type: slot.mealType,
            recipe_id: slot.recipeIds.join(';'),
          }),
        );
      });
    });
  });

  return rows.map((csvRow) => csvRow.map(escapeCsvValue).join(',')).join('\n');
}

export function importAppModelFromCsv(csv: string, progress?: ImportProgress): CsvImportData {
  const records = parseCsv(csv);
  progress?.('schema', 'active');
  validateHeader(records.header);
  const byType = groupByRecordType(records.rows);
  validateMetadata(byType.metadata);
  progress?.('schema', 'success');

  progress?.('preferences', 'active');
  const preferences = parsePreferences(byType.preference);
  progress?.('preferences', 'success');

  progress?.('ingredients', 'active');
  const ingredients = parseIngredients(byType.ingredient);
  progress?.('ingredients', 'success');

  progress?.('recipes', 'active');
  const recipes = parseRecipes(byType.recipe);
  progress?.('recipes', 'success');

  progress?.('relations', 'active');
  const recipesWithIngredients = applyRecipeIngredients(recipes, ingredients, byType.recipe_ingredient);
  validateNutritionCompleteness(preferences.nutritionSettings, recipesWithIngredients);
  progress?.('relations', 'success');

  progress?.('plans', 'active');
  const mealPlans = parseMealPlans(byType.meal_plan, byType.meal_slot, recipesWithIngredients);
  progress?.('plans', 'success');

  const activeMealPlan = mealPlans[0];
  return {
    language: preferences.language,
    model: {
      generatedMealPlanDraft: undefined,
      ingredients,
      mealPlan: activeMealPlan,
      mealPlans,
      nutritionSettings: preferences.nutritionSettings,
      recipes: recipesWithIngredients,
      selectedMealPlanId: activeMealPlan.id,
    },
    themeMode: preferences.themeMode,
  };
}

function metadataRow(id: string, key: string, value: string) {
  return row({ record_type: 'metadata', id, key, value });
}

function row(values: Partial<CsvRecord>) {
  return csvHeader.map((key) => values[key] ?? '');
}

function escapeCsvValue(value: string) {
  return /[",\n\r]/.test(value) ? `"${value.replaceAll('"', '""')}"` : value;
}

function parseCsv(csv: string) {
  const rows = parseCsvRows(csv);
  if (rows.length === 0) {
    throw new Error('CSV vuoto.');
  }
  const header = rows[0];
  validateHeader(header);
  const body = rows.slice(1).filter((csvRow) => csvRow.some((cell) => cell.trim() !== ''));
  return {
    header,
    rows: body.map((csvRow) => {
      const record = Object.fromEntries(
        csvHeader.map((key) => {
          const sourceIndex = header.indexOf(key);
          return [key, sourceIndex >= 0 ? csvRow[sourceIndex] ?? '' : ''];
        }),
      ) as CsvRecord;
      return record;
    }),
  };
}

function parseCsvRows(csv: string) {
  const rows: string[][] = [];
  let rowValues: string[] = [];
  let value = '';
  let quoted = false;

  for (let index = 0; index < csv.length; index += 1) {
    const char = csv[index];
    const next = csv[index + 1];
    if (quoted) {
      if (char === '"' && next === '"') {
        value += '"';
        index += 1;
      } else if (char === '"') {
        quoted = false;
      } else {
        value += char;
      }
    } else if (char === '"') {
      quoted = true;
    } else if (char === ',') {
      rowValues.push(value);
      value = '';
    } else if (char === '\n') {
      rowValues.push(value);
      rows.push(rowValues);
      rowValues = [];
      value = '';
    } else if (char !== '\r') {
      value += char;
    }
  }

  rowValues.push(value);
  if (rowValues.some((cell) => cell !== '') || rows.length === 0) {
    rows.push(rowValues);
  }
  if (quoted) {
    throw new Error('CSV non valido: virgolette non chiuse.');
  }
  return rows;
}

function validateHeader(header: string[]) {
  const expected = csvHeader.join(',');
  const legacyExpected = legacyCsvHeader.join(',');
  const actual = header.join(',');
  if (actual !== expected && actual !== legacyExpected) {
    throw new Error(`Header CSV non valido. Atteso: ${expected}`);
  }
}

function groupByRecordType(rows: CsvRecord[]) {
  const groups = {
    ingredient: [] as CsvRecord[],
    meal_plan: [] as CsvRecord[],
    meal_slot: [] as CsvRecord[],
    metadata: [] as CsvRecord[],
    preference: [] as CsvRecord[],
    recipe: [] as CsvRecord[],
    recipe_ingredient: [] as CsvRecord[],
  };
  rows.forEach((record) => {
    if (!Object.prototype.hasOwnProperty.call(groups, record.record_type)) {
      throw new Error(`record_type non supportato: ${record.record_type}`);
    }
    groups[record.record_type as keyof typeof groups].push(record);
  });
  return groups;
}

function validateMetadata(records: CsvRecord[]) {
  const schemaVersion = records.find((record) => record.key === 'schema_version')?.value;
  const appName = records.find((record) => record.key === 'app_name')?.value;
  if (schemaVersion !== '1' && schemaVersion !== '2') {
    throw new Error('Versione schema CSV non supportata.');
  }
  if (appName !== 'EZ-MEAL') {
    throw new Error('File CSV non riconosciuto per EZ-MEAL.');
  }
}

function parsePreferences(records: CsvRecord[]) {
  const language = records.find((record) => record.id === 'language')?.value;
  const themeMode = records.find((record) => record.id === 'themeMode')?.value;
  const trackingEnabled = records.find((record) => record.id === 'nutritionTrackingEnabled')?.value;
  const weightUnit = records.find((record) => record.id === 'weightUnit')?.value;
  if (!isLanguage(language)) {
    throw new Error('Preferenza lingua non valida.');
  }
  if (!isThemeMode(themeMode)) {
    throw new Error('Preferenza tema non valida.');
  }
  return {
    language,
    nutritionSettings: parseNutritionSettings(trackingEnabled, weightUnit),
    themeMode,
  };
}

function parseNutritionSettings(
  trackingEnabled: string | undefined,
  weightUnit: string | undefined,
): NutritionSettings {
  if (trackingEnabled && trackingEnabled !== 'true' && trackingEnabled !== 'false') {
    throw new Error('Preferenza conteggio calorie non valida.');
  }
  if (weightUnit && !isWeightUnit(weightUnit)) {
    throw new Error('Preferenza unita peso non valida.');
  }
  return {
    trackingEnabled: trackingEnabled === 'true',
    weightUnit: isWeightUnit(weightUnit) ? weightUnit : defaultNutritionSettings.weightUnit,
  };
}

function parseIngredients(records: CsvRecord[]): Ingredient[] {
  assertUniqueIds(records, 'ingredient');
  return records.map((record) => {
    assertRequired(record.id, 'ID ingrediente mancante.');
    assertRequired(record.name, 'Nome ingrediente mancante.');
    assertDateTime(record.created_at);
    assertDateTime(record.updated_at);
    if (record.available !== 'true' && record.available !== 'false') {
      throw new Error(`Disponibilita ingrediente non valida: ${record.name}`);
    }
    return {
      id: record.id,
      name: record.name,
      available: record.available === 'true',
      createdAt: record.created_at,
      updatedAt: record.updated_at,
    };
  });
}

function parseRecipes(records: CsvRecord[]): Recipe[] {
  assertUniqueIds(records, 'recipe');
  return records.map((record) => {
    assertRequired(record.id, 'ID ricetta mancante.');
    assertRequired(record.name, 'Nome ricetta mancante.');
    assertDateTime(record.created_at);
    assertDateTime(record.updated_at);
    const recipeMealTypes = record.meal_types.split(';').filter(Boolean);
    if (recipeMealTypes.length === 0 || recipeMealTypes.some((mealType) => !mealTypeSet.has(mealType))) {
      throw new Error(`Tag pasto ricetta non validi: ${record.name}`);
    }
    return {
      id: record.id,
      name: record.name,
      mealTypes: recipeMealTypes as MealType[],
      ingredientIds: [],
      nutrition: parseRecipeNutrition(record),
      notes: record.notes || undefined,
      createdAt: record.created_at,
      updatedAt: record.updated_at,
    };
  });
}

function parseRecipeNutrition(record: CsvRecord): Recipe['nutrition'] {
  const hasWeight = record.weight_amount.trim() !== '';
  const hasCalories = record.calories.trim() !== '';
  if (!hasWeight && !hasCalories) {
    return undefined;
  }
  if (!hasWeight || !hasCalories) {
    throw new Error(`Dati nutrizionali incompleti per ricetta: ${record.name}`);
  }

  const weightAmount = parsePositiveNumber(record.weight_amount);
  const calories = parsePositiveNumber(record.calories);
  if (weightAmount === undefined) {
    throw new Error(`Peso ricetta non valido: ${record.name}`);
  }
  if (calories === undefined) {
    throw new Error(`Calorie ricetta non valide: ${record.name}`);
  }

  return { weightAmount, calories };
}

function parsePositiveNumber(value: string): number | undefined {
  const parsed = Number(value.trim().replace(',', '.'));
  return Number.isFinite(parsed) && parsed > 0 ? parsed : undefined;
}

function applyRecipeIngredients(
  recipes: Recipe[],
  ingredients: Ingredient[],
  records: CsvRecord[],
): Recipe[] {
  assertUniqueIds(records, 'recipe_ingredient');
  const ingredientIds = new Set(ingredients.map((ingredient) => ingredient.id));
  const recipeIds = new Set(recipes.map((recipe) => recipe.id));
  const relationMap = new Map<string, string[]>();

  records.forEach((record) => {
    assertRequired(record.id, 'ID relazione ricetta-ingrediente mancante.');
    if (!recipeIds.has(record.parent_id)) {
      throw new Error(`Relazione con ricetta inesistente: ${record.parent_id}`);
    }
    if (!ingredientIds.has(record.value)) {
      throw new Error(`Relazione con ingrediente inesistente: ${record.value}`);
    }
    relationMap.set(record.parent_id, [...(relationMap.get(record.parent_id) ?? []), record.value]);
  });

  return recipes.map((recipe) => ({
    ...recipe,
    ingredientIds: relationMap.get(recipe.id) ?? [],
  }));
}

function validateNutritionCompleteness(settings: NutritionSettings, recipes: Recipe[]) {
  if (!settings.trackingEnabled) {
    return;
  }

  const missingRecipe = recipes.find((recipe) => !hasCompleteRecipeNutrition(recipe.nutrition));
  if (missingRecipe) {
    throw new Error(`Dati nutrizionali mancanti per ricetta: ${missingRecipe.name}`);
  }
}

function parseMealPlans(
  planRecords: CsvRecord[],
  slotRecords: CsvRecord[],
  recipes: Recipe[],
): MealPlan[] {
  assertUniqueIds(planRecords, 'meal_plan');
  assertUniqueIds(slotRecords, 'meal_slot');
  if (planRecords.length === 0) {
    throw new Error('Nessun piano presente nel CSV.');
  }
  const recipeMap = new Map(recipes.map((recipe) => [recipe.id, recipe]));
  const plans = planRecords.map((record) => {
    assertRequired(record.id, 'ID piano mancante.');
    assertRequired(record.name, 'Titolo piano mancante.');
    assertDate(record.week_start_date);
    assertDateTime(record.created_at);
    assertDateTime(record.updated_at);
    const slots = slotRecords.filter((slotRecord) => slotRecord.parent_id === record.id);
    if (slots.length !== 21) {
      throw new Error(`Il piano ${record.name} deve avere 21 slot.`);
    }
    const seenSlots = new Set<string>();
    slots.forEach((slot) => {
      assertDate(slot.date);
      if (!mealTypeSet.has(slot.meal_type)) {
        throw new Error(`Tipo pasto non valido nel piano ${record.name}.`);
      }
      const key = `${slot.date}-${slot.meal_type}`;
      if (seenSlots.has(key)) {
        throw new Error(`Slot duplicato nel piano ${record.name}: ${key}`);
      }
      seenSlots.add(key);
      const slotRecipeIds = parseSlotRecipeIds(slot.recipe_id);
      slotRecipeIds.forEach((recipeId) => {
        const recipe = recipeMap.get(recipeId);
        if (!recipe) {
          throw new Error(`Slot con ricetta inesistente: ${recipeId}`);
        }
        if (!recipe.mealTypes.includes(slot.meal_type as MealType)) {
          throw new Error(`Ricetta non compatibile con slot ${key}.`);
        }
      });
    });

    const dates = Array.from(new Set(slots.map((slot) => slot.date))).sort();
    return {
      id: record.id,
      title: record.name,
      weekStartDate: record.week_start_date,
      days: dates.map((date) => ({
        date,
        slots: mealTypes.map((mealType) => {
          const matchingSlot = slots.find((slot) => slot.date === date && slot.meal_type === mealType);
          return {
            date,
            mealType,
            recipeIds: parseSlotRecipeIds(matchingSlot?.recipe_id ?? ''),
          };
        }),
      })),
      createdAt: record.created_at,
      updatedAt: record.updated_at,
    };
  });
  return plans;
}

function parseSlotRecipeIds(value: string) {
  const recipeIds = value.split(';').filter(Boolean);
  if (new Set(recipeIds).size !== recipeIds.length) {
    throw new Error('Slot con ricette duplicate.');
  }
  return recipeIds;
}

function assertUniqueIds(records: CsvRecord[], label: string) {
  const ids = new Set<string>();
  records.forEach((record) => {
    assertRequired(record.id, `ID ${label} mancante.`);
    if (ids.has(record.id)) {
      throw new Error(`ID duplicato per ${label}: ${record.id}`);
    }
    ids.add(record.id);
  });
}

function assertRequired(value: string, message: string) {
  if (!value.trim()) {
    throw new Error(message);
  }
}

function assertDate(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    throw new Error(`Data non valida: ${value}`);
  }
}

function assertDateTime(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/.test(value)) {
    throw new Error(`Data/ora non valida: ${value}`);
  }
}

function getAllMealPlans(model: AppModel) {
  return model.mealPlans.some((plan) => plan.id === model.mealPlan.id)
    ? model.mealPlans.map((plan) => (plan.id === model.mealPlan.id ? model.mealPlan : plan))
    : [...model.mealPlans, model.mealPlan];
}

export function createExampleImportCsv() {
  const initial = createInitialAppModel();
  return exportAppModelToCsv({
    exportedAt: '2026-07-14T10:00:00.000Z',
    language: 'it',
    model: initial,
    themeMode: 'system',
  });
}
