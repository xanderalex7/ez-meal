import type { Ingredient } from '../../domain';
import { ingredientToRow, rowToIngredient, type IngredientRow } from '../mappers';
import type { QueryExecutor, RepositoryResult } from './sqliteTypes';

export function createIngredientRepository(db: QueryExecutor) {
  return {
    async save(ingredient: Ingredient): Promise<RepositoryResult<Ingredient>> {
      try {
        const row = ingredientToRow(ingredient);
        await db.runAsync(
          `INSERT OR REPLACE INTO ingredients
          (id, name, available, created_at, updated_at)
          VALUES (?, ?, ?, ?, ?);`,
          [row.id, row.name, row.available, row.created_at, row.updated_at],
        );
        return { ok: true, value: ingredient };
      } catch {
        return persistenceError();
      }
    },

    async list(): Promise<RepositoryResult<Ingredient[]>> {
      try {
        const rows = await db.getAllAsync<IngredientRow>('SELECT * FROM ingredients ORDER BY name;', []);
        return { ok: true, value: rows.map(rowToIngredient) };
      } catch {
        return persistenceError();
      }
    },

    async delete(id: string): Promise<RepositoryResult<string>> {
      try {
        await db.runAsync('DELETE FROM ingredients WHERE id = ?;', [id]);
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
