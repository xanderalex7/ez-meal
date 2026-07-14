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
  const today = model.mealPlan.days.find((day) => day.date === '2026-07-04');

  return (
    <View style={styles.stack}>
      <Text style={[styles.title, { color: colors.text }]}>{t('homeTitle')}</Text>
      {(today?.slots ?? []).map((slot) => {
        const recipe = model.recipes.find((candidate) => candidate.id === slot.recipeId);
        return (
          <Card key={slot.mealType}>
            <Badge label={mealTypeLabel(slot.mealType)} tone={slot.mealType} />
            <Text style={[styles.recipeName, { color: colors.text }]}>
              {recipe?.name ?? t('homeNoRecipe')}
            </Text>
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
    marginTop: spacing.xs,
  },
});
