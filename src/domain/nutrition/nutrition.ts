export const weightUnits = ['g', 'kg', 'oz', 'lb'] as const;

export type WeightUnit = (typeof weightUnits)[number];

export type NutritionSettings = {
  trackingEnabled: boolean;
  weightUnit: WeightUnit;
};

export type RecipeNutrition = {
  calories: number;
  /**
   * Legacy recipe-level weight kept temporarily for migrations/imports until
   * ingredient-level weights are fully wired through persistence and UI.
   */
  weightAmount?: number;
};

export type NutritionTotals = {
  calories: number;
  weightAmount: number;
};

export const defaultNutritionSettings: NutritionSettings = {
  trackingEnabled: false,
  weightUnit: 'g',
};

export function isWeightUnit(value: unknown): value is WeightUnit {
  return typeof value === 'string' && weightUnits.includes(value as WeightUnit);
}

export function hasCompleteRecipeNutrition(
  nutrition: RecipeNutrition | undefined,
): nutrition is RecipeNutrition {
  return Boolean(
    nutrition &&
      Number.isFinite(nutrition.calories) &&
      nutrition.calories > 0,
  );
}

export function sumNutritionTotals(values: Array<RecipeNutrition | undefined>): NutritionTotals {
  return values.reduce<NutritionTotals>(
    (total, nutrition) =>
      hasCompleteRecipeNutrition(nutrition)
        ? {
            calories: total.calories + nutrition.calories,
            weightAmount: total.weightAmount,
          }
        : total,
    { calories: 0, weightAmount: 0 },
  );
}
