import type { MealType, Recipe } from '../../domain';

export type RecipeRow = {
  id: string;
  name: string;
  meal_types: string;
  ingredient_ids: string;
  ingredient_weights?: string | null;
  weight_amount: number | null;
  calories: number | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

export function recipeToRow(recipe: Recipe) {
  return {
    id: recipe.id,
    name: recipe.name,
    meal_types: JSON.stringify(recipe.mealTypes),
    ingredient_ids: JSON.stringify(recipe.ingredientIds),
    ingredient_weights: JSON.stringify(recipe.ingredientWeights ?? []),
    weight_amount: recipe.nutrition?.weightAmount ?? null,
    calories: recipe.nutrition?.calories ?? null,
    notes: recipe.notes ?? null,
    created_at: recipe.createdAt,
    updated_at: recipe.updatedAt,
  };
}

export function rowToRecipe(row: RecipeRow): Recipe {
  return {
    id: row.id,
    name: row.name,
    mealTypes: JSON.parse(row.meal_types) as MealType[],
    ingredientIds: JSON.parse(row.ingredient_ids) as string[],
    ingredientWeights: parseIngredientWeights(row.ingredient_weights),
    nutrition:
      row.calories
        ? { calories: row.calories, ...(row.weight_amount ? { weightAmount: row.weight_amount } : {}) }
        : undefined,
    notes: row.notes ?? undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function parseIngredientWeights(value: string | null | undefined): Recipe['ingredientWeights'] {
  if (!value) {
    return undefined;
  }

  const parsed = JSON.parse(value) as Recipe['ingredientWeights'];
  return parsed && parsed.length > 0 ? parsed : undefined;
}
