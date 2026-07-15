import { StyleSheet, Text, View } from 'react-native';

import type { AppModel } from '../appModel';
import { useI18n } from '../../shared/i18n';
import { Badge, Card } from '../../shared/ui';
import { spacing, useAppColors } from '../../shared/theme';

type HomeScreenProps = {
  model: AppModel;
};

export function HomeScreen({ model }: HomeScreenProps) {
  const colors = useAppColors();
  const { mealTypeLabel, t } = useI18n();
  const today = model.mealPlan.days[toMondayFirstWeekdayIndex(new Date())];

  return (
    <View style={styles.stack}>
      <Text style={[styles.title, { color: colors.text }]}>{t('homeTitle')}</Text>
      {(today?.slots ?? []).map((slot) => {
        const recipes = slot.recipeIds
          .map((recipeId) => model.recipes.find((candidate) => candidate.id === recipeId))
          .filter((recipe): recipe is NonNullable<typeof recipe> => Boolean(recipe));
        return (
          <Card key={slot.mealType}>
            <Badge label={mealTypeLabel(slot.mealType)} tone={slot.mealType} />
            {recipes.length > 0 ? (
              <View style={styles.recipeList}>
                {recipes.map((recipe) => (
                  <Text key={recipe.id} style={[styles.recipeName, { color: colors.text }]}>
                    {recipe.name}
                  </Text>
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
  recipeName: {
    fontSize: 16,
  },
  recipeList: {
    gap: spacing.xs,
    marginTop: spacing.xs,
  },
});

function toMondayFirstWeekdayIndex(date: Date) {
  return (date.getDay() + 6) % 7;
}
