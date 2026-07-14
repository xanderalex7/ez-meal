export const mealTypes = ['breakfast', 'lunch', 'dinner'] as const;

export type MealType = (typeof mealTypes)[number];

export const mealTypeLabels: Record<MealType, string> = {
  breakfast: 'Colazione',
  lunch: 'Pranzo',
  dinner: 'Cena',
};

export function isMealType(value: unknown): value is MealType {
  return typeof value === 'string' && mealTypes.includes(value as MealType);
}

export function getMealTypeLabel(mealType: MealType): string {
  return mealTypeLabels[mealType];
}
