import { mealTypes, type MealType } from '../mealTypes';
import { sumNutritionTotals, type NutritionTotals } from '../nutrition';
import type { Recipe } from '../recipes';

export type MealPlanId = string;

export type MealSlot = {
  date: string;
  mealType: MealType;
  recipeIds: string[];
};

type LegacyMealSlot = Omit<MealSlot, 'recipeIds'> & {
  recipeId?: string;
  recipeIds?: string[];
};

export type PlanDay = {
  date: string;
  slots: MealSlot[];
};

export type MealPlan = {
  id: MealPlanId;
  title: string;
  weekStartDate: string;
  days: PlanDay[];
  createdAt: string;
  updatedAt: string;
};

export type AssignRecipeResult =
  | {
      ok: true;
      value: MealSlot;
    }
  | {
      ok: false;
      error: {
        code: 'RECIPE_INCOMPATIBLE_WITH_SLOT';
        message: string;
      };
    };

export type GenerateWeeklyPlanResult = {
  plan: MealPlan;
  uncoveredSlots: MealSlot[];
};

export type RandomSource = () => number;

export function createEmptyMealPlan(input: {
  id: MealPlanId;
  title?: string;
  weekStartDate: string;
  now: string;
}): MealPlan {
  return {
    id: input.id,
    title: input.title ?? 'Piano settimanale',
    weekStartDate: input.weekStartDate,
    days: createWeekDates(input.weekStartDate).map((date) => ({
      date,
      slots: mealTypes.map((mealType) => ({
        date,
        mealType,
        recipeIds: [],
      })),
    })),
    createdAt: input.now,
    updatedAt: input.now,
  };
}

export function assignRecipeToSlot(slot: MealSlot, recipe: Recipe): AssignRecipeResult {
  return addRecipeToSlot(slot, recipe);
}

export function addRecipeToSlot(slot: MealSlot, recipe: Recipe): AssignRecipeResult {
  if (!recipe.mealTypes.includes(slot.mealType)) {
    return {
      ok: false,
      error: {
        code: 'RECIPE_INCOMPATIBLE_WITH_SLOT',
        message: 'La ricetta non è compatibile con questo pasto.',
      },
    };
  }

  return {
    ok: true,
    value: {
      ...slot,
      recipeIds: slot.recipeIds.includes(recipe.id) ? slot.recipeIds : [...slot.recipeIds, recipe.id],
    },
  };
}

export function removeRecipeFromSlot(slot: MealSlot): MealSlot {
  return clearRecipesFromSlot(slot);
}

export function removeRecipeFromSlotById(slot: MealSlot, recipeId: string): MealSlot {
  return {
    ...slot,
    recipeIds: slot.recipeIds.filter((candidate) => candidate !== recipeId),
  };
}

export function clearRecipesFromSlot(slot: MealSlot): MealSlot {
  return {
    ...slot,
    recipeIds: [],
  };
}

export function normalizeMealSlot(slot: LegacyMealSlot): MealSlot {
  const recipeIds = Array.isArray(slot.recipeIds)
    ? slot.recipeIds
    : slot.recipeId
      ? [slot.recipeId]
      : [];

  return {
    date: slot.date,
    mealType: slot.mealType,
    recipeIds: [...new Set(recipeIds.filter(Boolean))],
  };
}

export function normalizeMealPlan(plan: MealPlan): MealPlan {
  return {
    ...plan,
    days: plan.days.map((day) => ({
      ...day,
      slots: day.slots.map((slot) => normalizeMealSlot(slot as LegacyMealSlot)),
    })),
  };
}

export function calculateMealSlotNutritionTotal(
  slot: MealSlot,
  recipes: Recipe[],
): NutritionTotals {
  const recipeMap = new Map(recipes.map((recipe) => [recipe.id, recipe]));
  return sumNutritionTotals(slot.recipeIds.map((recipeId) => recipeMap.get(recipeId)?.nutrition));
}

export function calculatePlanDayNutritionTotal(day: PlanDay, recipes: Recipe[]): NutritionTotals {
  return day.slots.reduce<NutritionTotals>(
    (total, slot) => {
      const slotTotal = calculateMealSlotNutritionTotal(slot, recipes);
      return {
        calories: total.calories + slotTotal.calories,
        weightAmount: total.weightAmount + slotTotal.weightAmount,
      };
    },
    { calories: 0, weightAmount: 0 },
  );
}

export function calculateMealPlanNutritionTotal(
  plan: MealPlan,
  recipes: Recipe[],
): NutritionTotals {
  return plan.days.reduce<NutritionTotals>(
    (total, day) => {
      const dayTotal = calculatePlanDayNutritionTotal(day, recipes);
      return {
        calories: total.calories + dayTotal.calories,
        weightAmount: total.weightAmount + dayTotal.weightAmount,
      };
    },
    { calories: 0, weightAmount: 0 },
  );
}

export function generateWeeklyPlan(input: {
  plan: MealPlan;
  recipes: Recipe[];
  random?: RandomSource;
  now: string;
}): GenerateWeeklyPlanResult {
  const random = input.random ?? Math.random;
  const uncoveredSlots = input.plan.days.flatMap((day) =>
    day.slots.filter(
      (slot) => !input.recipes.some((recipe) => recipe.mealTypes.includes(slot.mealType)),
    ),
  );

  if (uncoveredSlots.length > 0) {
    return {
      plan: input.plan,
      uncoveredSlots,
    };
  }

  const days = input.plan.days.map((day) => ({
    ...day,
    slots: day.slots.map((slot) => {
      const compatibleRecipes = input.recipes.filter((recipe) =>
        recipe.mealTypes.includes(slot.mealType),
      );

      const selectedRecipe = compatibleRecipes[pickIndex(compatibleRecipes.length, random)];
      return {
        ...slot,
        recipeIds: [selectedRecipe.id],
      };
    }),
  }));

  return {
    plan: {
      ...input.plan,
      days,
      updatedAt: input.now,
    },
    uncoveredSlots,
  };
}

function createWeekDates(weekStartDate: string): string[] {
  const start = parseIsoDate(weekStartDate);

  return Array.from({ length: 7 }, (_value, index) => {
    const date = new Date(start);
    date.setUTCDate(start.getUTCDate() + index);
    return toIsoDate(date);
  });
}

function parseIsoDate(value: string): Date {
  return new Date(`${value}T00:00:00.000Z`);
}

function toIsoDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function pickIndex(length: number, random: RandomSource): number {
  return Math.min(Math.floor(random() * length), length - 1);
}
