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
    weight: formatNumber(recipe.nutrition.weightAmount),
  });
}

export function hasMissingNutrition(recipes: Recipe[]) {
  return recipes.some((recipe) => !hasCompleteRecipeNutrition(recipe.nutrition));
}

export function formatNumber(value: number) {
  return Number.isInteger(value) ? String(value) : String(Number(value.toFixed(2)));
}
