import { hasCompleteRecipeNutrition, type Recipe } from '../domain';
import type { TranslationParams } from './i18n';

export function formatNutritionMeta(
  recipe: Recipe,
  unit: string,
  t: (key: 'nutritionRecipeMeta', params?: TranslationParams) => string,
) {
  if (!hasCompleteRecipeNutrition(recipe.nutrition)) {
    return undefined;
  }

  return t('nutritionRecipeMeta', {
    calories: formatNumber(recipe.nutrition.calories),
    unit,
    weight: formatNumber(recipe.nutrition.weightAmount ?? 0),
  });
}

export function hasMissingNutrition(recipes: Recipe[]) {
  return recipes.some(
    (recipe) =>
      !hasCompleteRecipeNutrition(recipe.nutrition) ||
      recipe.ingredientIds.some((ingredientId) => {
        const ingredientWeight = getRecipeIngredientRows(recipe, []).find(
          (candidate) => candidate.ingredientId === ingredientId,
        );
        return !ingredientWeight?.quantity;
      }),
  );
}

export function formatRecipeCalories(recipe: Recipe) {
  return hasCompleteRecipeNutrition(recipe.nutrition)
    ? `${formatNumber(recipe.nutrition.calories)} cal`
    : undefined;
}

export function getRecipeIngredientRows(
  recipe: Recipe,
  ingredients: Array<{ id: string; name: string }>,
) {
  const weights = new Map(
    (recipe.ingredientWeights ?? []).map((ingredientWeight) => [
      ingredientWeight.ingredientId,
      ingredientWeight.quantity ?? (
        ingredientWeight.weightAmount === undefined ? undefined : formatNumber(ingredientWeight.weightAmount)
      ),
    ]),
  );

  if (recipe.ingredientIds.length === 1 && !weights.has(recipe.ingredientIds[0]) && recipe.nutrition?.weightAmount) {
    weights.set(recipe.ingredientIds[0], formatNumber(recipe.nutrition.weightAmount));
  }

  return recipe.ingredientIds.map((ingredientId) => ({
    ingredientId,
    name: ingredients.find((ingredient) => ingredient.id === ingredientId)?.name ?? ingredientId,
    quantity: weights.get(ingredientId),
  }));
}

export function formatNumber(value: number) {
  return Number.isInteger(value) ? String(value) : String(Number(value.toFixed(2)));
}
