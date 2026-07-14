import { normalizeMealPlan, type MealPlan, type PlanDay } from '../../domain';

export type MealPlanRow = {
  id: string;
  title?: string;
  week_start_date: string;
  days: string;
  created_at: string;
  updated_at: string;
};

export function mealPlanToRow(plan: MealPlan) {
  return {
    id: plan.id,
    title: plan.title,
    week_start_date: plan.weekStartDate,
    days: JSON.stringify(plan.days),
    created_at: plan.createdAt,
    updated_at: plan.updatedAt,
  };
}

export function rowToMealPlan(row: MealPlanRow): MealPlan {
  return normalizeMealPlan({
    id: row.id,
    title: row.title ?? 'Piano settimanale',
    weekStartDate: row.week_start_date,
    days: JSON.parse(row.days) as PlanDay[],
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  });
}
