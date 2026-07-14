import type { MealPlan } from '../../domain';
import { mealPlanToRow, rowToMealPlan, type MealPlanRow } from '../mappers';
import type { QueryExecutor, RepositoryResult } from './sqliteTypes';

export function createMealPlanRepository(db: QueryExecutor) {
  return {
    async save(plan: MealPlan): Promise<RepositoryResult<MealPlan>> {
      try {
        const row = mealPlanToRow(plan);
        await db.runAsync(
          `INSERT OR REPLACE INTO meal_plans
          (id, title, week_start_date, days, created_at, updated_at)
          VALUES (?, ?, ?, ?, ?, ?);`,
          [row.id, row.title, row.week_start_date, row.days, row.created_at, row.updated_at],
        );
        return { ok: true, value: plan };
      } catch {
        return persistenceError();
      }
    },

    async list(): Promise<RepositoryResult<MealPlan[]>> {
      try {
        const rows = await db.getAllAsync<MealPlanRow>(
          'SELECT * FROM meal_plans ORDER BY updated_at DESC;',
          [],
        );
        return { ok: true, value: rows.map(rowToMealPlan) };
      } catch {
        return persistenceError();
      }
    },

    async findByWeekStartDate(weekStartDate: string): Promise<RepositoryResult<MealPlan | null>> {
      try {
        const row = await db.getFirstAsync<MealPlanRow>(
          'SELECT * FROM meal_plans WHERE week_start_date = ?;',
          [weekStartDate],
        );
        return { ok: true, value: row ? rowToMealPlan(row) : null };
      } catch {
        return persistenceError();
      }
    },

    async delete(id: string): Promise<RepositoryResult<string>> {
      try {
        await db.runAsync('DELETE FROM meal_plans WHERE id = ?;', [id]);
        return { ok: true, value: id };
      } catch {
        return persistenceError();
      }
    },
  };
}

function persistenceError(): RepositoryResult<never> {
  return {
    ok: false,
    error: {
      code: 'PERSISTENCE_ERROR',
      message: 'I dati locali non sono disponibili.',
    },
  };
}
