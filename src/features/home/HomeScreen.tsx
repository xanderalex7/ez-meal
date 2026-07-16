import { StyleSheet, Text, View } from 'react-native';

import type { AppModel } from '../appModel';
import { calculatePlanDayNutritionTotal } from '../../domain';
import { useI18n } from '../../shared/i18n';
import {
  formatNumber,
  formatRecipeCalories,
  getRecipeIngredientRows,
  hasMissingNutrition,
} from '../../shared/nutritionUi';
import { Badge, Card } from '../../shared/ui';
import { radii, spacing, useAppColors } from '../../shared/theme';

type HomeScreenProps = {
  model: AppModel;
};

export function HomeScreen({ model }: HomeScreenProps) {
  const colors = useAppColors();
  const { mealTypeLabel, t } = useI18n();
  const today = model.mealPlan.days[toMondayFirstWeekdayIndex(new Date())];
  const todayRecipes = (today?.slots ?? [])
    .flatMap((slot) => slot.recipeIds)
    .map((recipeId) => model.recipes.find((candidate) => candidate.id === recipeId))
    .filter((recipe): recipe is NonNullable<typeof recipe> => Boolean(recipe));
  const showNutrition = model.nutritionSettings.trackingEnabled;
  const todayTotal = today ? calculatePlanDayNutritionTotal(today, model.recipes) : undefined;
  const nutritionMissing = showNutrition && hasMissingNutrition(todayRecipes);

  return (
    <View style={styles.stack}>
      <View style={styles.headerRow}>
        <Text style={[styles.title, { color: colors.text }]}>{t('homeTitle')}</Text>
        {showNutrition && todayTotal ? (
          <Text style={[styles.totalText, { color: colors.text }]}>
            {t('homeDailyCalories', { calories: todayTotal.calories })}
          </Text>
        ) : null}
      </View>
      {nutritionMissing ? (
        <Text style={[styles.message, { color: colors.error }]}>{t('nutritionMissing')}</Text>
      ) : null}
      {(today?.slots ?? []).map((slot) => {
        const recipes = slot.recipeIds
          .map((recipeId) => model.recipes.find((candidate) => candidate.id === recipeId))
          .filter((recipe): recipe is NonNullable<typeof recipe> => Boolean(recipe));
        return (
          <Card key={slot.mealType} style={styles.todayCard}>
            <Badge label={mealTypeLabel(slot.mealType)} tone={slot.mealType} />
            {recipes.length > 0 ? (
              <View style={styles.recipeList}>
                {recipes.map((recipe) => (
                  <View
                    key={recipe.id}
                    style={[
                      styles.recipeSubCard,
                      { backgroundColor: colors.surfaceAlt, borderColor: colors.border },
                    ]}
                  >
                    <View style={styles.recipeRow}>
                      <Text
                        numberOfLines={2}
                        style={[styles.recipeName, { color: colors.text }]}
                      >
                        {recipe.name}
                      </Text>
                      {showNutrition ? (
                        <Text
                          numberOfLines={1}
                          style={[styles.nutritionMeta, { color: colors.textMuted }]}
                        >
                          {formatRecipeCalories(recipe) ?? '-'}
                        </Text>
                      ) : null}
                    </View>
                    {showNutrition ? (
                      <View
                        style={[styles.recipeDivider, { backgroundColor: colors.border }]}
                        testID={`home-recipe-divider-${recipe.id}`}
                      />
                    ) : null}
                    {showNutrition ? (
                      <View style={styles.ingredientList}>
                        {getRecipeIngredientRows(recipe, model.ingredients).map((ingredient) => (
                          <View key={ingredient.ingredientId} style={styles.ingredientRow}>
                            <Text
                              numberOfLines={1}
                              style={[styles.ingredientName, { color: colors.textMuted }]}
                            >
                              {ingredient.name}
                            </Text>
                            <Text style={[styles.ingredientWeight, { color: colors.textMuted }]}>
                              {ingredient.quantity ?? '-'}
                            </Text>
                          </View>
                        ))}
                      </View>
                    ) : null}
                  </View>
                ))}
              </View>
            ) : (
              <Text style={[styles.recipeName, { color: colors.textMuted }]}>
                {t('homeNoRecipe')}
              </Text>
            )}
          </Card>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  stack: {
    gap: spacing.md,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
  },
  headerRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.md,
    justifyContent: 'space-between',
  },
  totalText: {
    flexShrink: 0,
    fontSize: 16,
    fontWeight: '700',
  },
  message: {
    fontSize: 14,
    fontWeight: '600',
  },
  todayCard: {
    gap: spacing.sm,
  },
  recipeName: {
    flex: 1,
    fontSize: 16,
    minWidth: 0,
  },
  nutritionMeta: {
    flexShrink: 0,
    fontSize: 13,
    fontWeight: '700',
    textAlign: 'right',
  },
  recipeList: {
    gap: spacing.xs,
  },
  recipeSubCard: {
    borderRadius: radii.md,
    borderWidth: 1,
    gap: spacing.sm,
    padding: spacing.sm,
  },
  recipeDivider: { height: 1 },
  recipeRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.sm,
    justifyContent: 'space-between',
  },
  ingredientList: {
    gap: spacing.xs,
  },
  ingredientRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.sm,
    justifyContent: 'space-between',
  },
  ingredientName: {
    flex: 1,
    fontSize: 14,
    minWidth: 0,
  },
  ingredientWeight: {
    flexShrink: 0,
    fontSize: 14,
    fontWeight: '600',
  },
});

function toMondayFirstWeekdayIndex(date: Date) {
  return (date.getDay() + 6) % 7;
}
