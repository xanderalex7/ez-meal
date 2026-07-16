export const weightUnits = ['g', 'kg', 'oz', 'lb'] as const;

export type WeightUnit = (typeof weightUnits)[number];

export type NutritionSettings = {
  trackingEnabled: boolean;
  weightUnit: WeightUnit;
};

export type RecipeNutrition = {
  weightAmount: number;
  calories: number;
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
      Number.isFinite(nutrition.weightAmount) &&
      nutrition.weightAmount > 0 &&
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
            weightAmount: total.weightAmount + nutrition.weightAmount,
          }
        : total,
    { calories: 0, weightAmount: 0 },
  );
}
