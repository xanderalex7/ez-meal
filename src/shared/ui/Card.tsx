import { StyleSheet, View, type ViewProps } from 'react-native';

import { radii, spacing, useAppColors } from '../theme';

export function Card({ style, ...props }: ViewProps) {
  const colors = useAppColors();

  return (
    <View
      style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }, style]}
      {...props}
    />
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: radii.md,
    borderWidth: 1,
    padding: spacing.lg,
  },
});
