import type { Ingredient } from '../../domain';

export type IngredientRow = {
  id: string;
  name: string;
  available: number;
  created_at: string;
  updated_at: string;
};

export function ingredientToRow(ingredient: Ingredient) {
  return {
    id: ingredient.id,
    name: ingredient.name,
    available: ingredient.available ? 1 : 0,
    created_at: ingredient.createdAt,
    updated_at: ingredient.updatedAt,
  };
}

export function rowToIngredient(row: IngredientRow): Ingredient {
  return {
    id: row.id,
    name: row.name,
    available: row.available === 1,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}
