import { StyleSheet, Text, View } from 'react-native';

import type { MealType } from '../../domain';
import { componentSizes, radii, spacing, useAppColors } from '../theme';

type BadgeProps = {
  label: string;
  size?: 'default' | 'compact';
  tone?: 'primary' | 'warning' | 'error' | 'info' | MealType;
};

export function Badge({ label, size = 'default', tone = 'primary' }: BadgeProps) {
  const colors = useAppColors();
  const mealTagColors = tone in colors.mealTags ? colors.mealTags[tone as MealType] : null;
  const toneStyle = {
    primary: { backgroundColor: colors.surfaceAlt, borderColor: colors.border },
    warning: { backgroundColor: colors.warning, borderColor: colors.warning },
    error: { backgroundColor: colors.error, borderColor: colors.error },
    info: { backgroundColor: colors.info, borderColor: colors.info },
  }[tone as 'primary' | 'warning' | 'error' | 'info'];
  const labelStyle = {
    primary: { color: colors.text },
    warning: { color: colors.surface },
    error: { color: colors.surface },
    info: { color: colors.surface },
  }[tone as 'primary' | 'warning' | 'error' | 'info'];

  return (
    <View
      style={[
        styles.badge,
        size === 'compact' ? styles.badgeCompact : null,
        mealTagColors
          ? [
              styles.mealBadge,
              size === 'compact' ? styles.mealBadgeCompact : null,
              { backgroundColor: mealTagColors.background, borderColor: mealTagColors.border },
            ]
          : toneStyle,
      ]}
    >
      <Text
        numberOfLines={1}
        style={[
          styles.label,
          size === 'compact' ? styles.labelCompact : null,
          mealTagColors ? { color: mealTagColors.text } : labelStyle,
        ]}
      >
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderRadius: radii.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  badgeCompact: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
  },
  mealBadge: {
    alignItems: 'center',
    width: componentSizes.mealTagWidth,
  },
  mealBadgeCompact: {
    width: componentSizes.mealTagCompactWidth,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
  labelCompact: {
    fontSize: 10,
  },
});
