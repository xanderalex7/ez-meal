import type { Logger } from '../../shared/logging';
import { schemaStatements } from './schema';

export type SqlValue = string | number | boolean | null | Uint8Array;

export type SqlExecutor = {
  execAsync: (source: string) => Promise<void>;
  getAllAsync: <T>(source: string, params?: SqlValue[]) => Promise<T[]>;
  runAsync: (source: string, params: SqlValue[]) => Promise<unknown>;
};

export async function migrateDatabase(input: {
  db: SqlExecutor;
  logger?: Pick<Logger, 'info' | 'error'>;
  now: string;
}): Promise<void> {
  try {
    for (const statement of schemaStatements) {
      await input.db.execAsync(statement);
    }

    await ensureMealPlanTitleColumn(input.db);
    await ensureMealPlanWeekStartDateIsNotUnique(input.db);
    await ensureRecipeNutritionColumns(input.db);

    await input.db.runAsync(
      'INSERT OR IGNORE INTO schema_migrations (version, applied_at) VALUES (?, ?);',
      [1, input.now],
    );

    input.logger?.info('Database migration completed', { version: 1 });
  } catch (error) {
    input.logger?.error('Database migration failed', { version: 1 });
    throw error;
  }
}

async function ensureRecipeNutritionColumns(db: SqlExecutor): Promise<void> {
  const columns = await db.getAllAsync<{ name: string }>('PRAGMA table_info(recipes);', []);
  const columnNames = new Set(columns.map((column) => column.name));

  if (!columnNames.has('weight_amount')) {
    await db.execAsync('ALTER TABLE recipes ADD COLUMN weight_amount REAL;');
  }

  if (!columnNames.has('calories')) {
    await db.execAsync('ALTER TABLE recipes ADD COLUMN calories INTEGER;');
  }
}

async function ensureMealPlanTitleColumn(db: SqlExecutor): Promise<void> {
  const columns = await db.getAllAsync<{ name: string }>('PRAGMA table_info(meal_plans);', []);
  if (columns.some((column) => column.name === 'title')) {
    return;
  }

  await db.execAsync("ALTER TABLE meal_plans ADD COLUMN title TEXT NOT NULL DEFAULT 'Piano settimanale';");
}

async function ensureMealPlanWeekStartDateIsNotUnique(db: SqlExecutor): Promise<void> {
  const indexes = await db.getAllAsync<{ name: string; unique: number }>('PRAGMA index_list(meal_plans);', []);
  let hasUniqueWeekStartDateIndex = false;

  for (const index of indexes.filter((candidate) => candidate.unique === 1)) {
    const columns = await db.getAllAsync<{ name: string }>(`PRAGMA index_info(${index.name});`, []);
    if (columns.some((column) => column.name === 'week_start_date')) {
      hasUniqueWeekStartDateIndex = true;
      break;
    }
  }

  if (!hasUniqueWeekStartDateIndex) {
    return;
  }

  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS meal_plans_next (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL DEFAULT 'Piano settimanale',
      week_start_date TEXT NOT NULL,
      days TEXT NOT NULL,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );
    INSERT OR REPLACE INTO meal_plans_next
      (id, title, week_start_date, days, created_at, updated_at)
      SELECT id, title, week_start_date, days, created_at, updated_at FROM meal_plans;
    DROP TABLE meal_plans;
    ALTER TABLE meal_plans_next RENAME TO meal_plans;
  `);
}
