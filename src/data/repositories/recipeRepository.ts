import type { Recipe } from '../../domain';
import { recipeToRow, rowToRecipe, type RecipeRow } from '../mappers';
import type { QueryExecutor, RepositoryResult } from './sqliteTypes';

export function createRecipeRepository(db: QueryExecutor) {
  return {
    async save(recipe: Recipe): Promise<RepositoryResult<Recipe>> {
      try {
        const row = recipeToRow(recipe);
        await db.runAsync(
          `INSERT OR REPLACE INTO recipes
          (id, name, meal_types, ingredient_ids, notes, created_at, updated_at)
          VALUES (?, ?, ?, ?, ?, ?, ?);`,
          [
            row.id,
            row.name,
            row.meal_types,
            row.ingredient_ids,
            row.notes,
            row.created_at,
            row.updated_at,
          ],
        );
        return { ok: true, value: recipe };
      } catch {
        return persistenceError();
      }
    },

    async list(): Promise<RepositoryResult<Recipe[]>> {
      try {
        const rows = await db.getAllAsync<RecipeRow>('SELECT * FROM recipes ORDER BY name;', []);
        return { ok: true, value: rows.map(rowToRecipe) };
      } catch {
        return persistenceError();
      }
    },

    async delete(id: string): Promise<RepositoryResult<string>> {
      try {
        await db.runAsync('DELETE FROM recipes WHERE id = ?;', [id]);
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
