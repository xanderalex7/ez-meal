import { mealTypes, type MealType } from '../mealTypes';
import type { Recipe } from '../recipes';

export type MealPlanId = string;

export type MealSlot = {
  date: string;
  mealType: MealType;
  recipeId?: string;
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
      })),
    })),
    createdAt: input.now,
    updatedAt: input.now,
  };
}

export function assignRecipeToSlot(slot: MealSlot, recipe: Recipe): AssignRecipeResult {
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
      recipeId: recipe.id,
    },
  };
}

export function removeRecipeFromSlot(slot: MealSlot): MealSlot {
  const { recipeId: _recipeId, ...emptySlot } = slot;
  return emptySlot;
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
        recipeId: selectedRecipe.id,
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
