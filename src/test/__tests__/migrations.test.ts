import { migrateDatabase, type SqlExecutor } from '../../data/db/migrations';
import { schemaStatements } from '../../data/db/schema';

function createFakeDb(input: {
  mealPlanColumns?: Array<{ name: string }>;
  recipeColumns?: Array<{ name: string }>;
} = {}) {
  const executed: string[] = [];
  const runs: Array<{ source: string; params?: unknown[] }> = [];
  const mealPlanColumns = input.mealPlanColumns ?? [{ name: 'title' }];
  const recipeColumns = input.recipeColumns ?? [{ name: 'weight_amount' }, { name: 'calories' }];
  const db: SqlExecutor = {
    execAsync: async (source) => {
      executed.push(source);
    },
    getAllAsync: async <T>(source: string) => {
      if (source === 'PRAGMA table_info(meal_plans);') {
        return mealPlanColumns as T[];
      }
      if (source === 'PRAGMA table_info(recipes);') {
        return recipeColumns as T[];
      }
      return [] as T[];
    },
    runAsync: async (source, params) => {
      runs.push({ source, params });
      return {};
    },
  };

  return { db, executed, runs };
}

describe('migrateDatabase', () => {
  it('runs every schema statement and records the migration', async () => {
    const { db, executed, runs } = createFakeDb();

    await migrateDatabase({ db, now: '2026-07-04T12:00:00.000Z' });

    expect(executed).toEqual([...schemaStatements]);
    expect(runs).toEqual([
      {
        source: 'INSERT OR IGNORE INTO schema_migrations (version, applied_at) VALUES (?, ?);',
        params: [1, '2026-07-04T12:00:00.000Z'],
      },
    ]);
  });

  it('logs migration completion without sensitive data', async () => {
    const { db } = createFakeDb();
    const logger = {
      info: jest.fn(),
      error: jest.fn(),
    };

    await migrateDatabase({ db, logger, now: '2026-07-04T12:00:00.000Z' });

    expect(logger.info).toHaveBeenCalledWith('Database migration completed', { version: 1 });
    expect(logger.error).not.toHaveBeenCalled();
  });

  it('adds the meal plan title column when upgrading an existing database', async () => {
    const { db, executed } = createFakeDb({ mealPlanColumns: [{ name: 'id' }] });

    await migrateDatabase({ db, now: '2026-07-04T12:00:00.000Z' });

    expect(executed).toContain(
      "ALTER TABLE meal_plans ADD COLUMN title TEXT NOT NULL DEFAULT 'Piano settimanale';",
    );
  });

  it('adds recipe nutrition columns when upgrading an existing database', async () => {
    const { db, executed } = createFakeDb({ recipeColumns: [{ name: 'id' }] });

    await migrateDatabase({ db, now: '2026-07-04T12:00:00.000Z' });

    expect(executed).toContain('ALTER TABLE recipes ADD COLUMN weight_amount REAL;');
    expect(executed).toContain('ALTER TABLE recipes ADD COLUMN calories INTEGER;');
  });
});
