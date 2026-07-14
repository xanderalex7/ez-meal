import {
  Pressable,
  StyleSheet,
  Text,
  type PressableProps,
  type StyleProp,
  type ViewStyle,
} from 'react-native';

import { radii, spacing, useAppColors } from '../theme';

type FloatingActionButtonProps = Omit<PressableProps, 'children' | 'style'> & {
  accessibilityLabel: string;
  style?: StyleProp<ViewStyle>;
};

export function FloatingActionButton({ accessibilityLabel, style, ...props }: FloatingActionButtonProps) {
  const colors = useAppColors();

  return (
    <Pressable
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="button"
      style={[
        styles.button,
        {
          backgroundColor: colors.primary,
          shadowColor: colors.text,
        },
        style,
      ]}
      {...props}
    >
      <Text style={[styles.icon, { color: colors.surface }]}>+</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    borderRadius: radii.pill,
    elevation: 4,
    height: 56,
    justifyContent: 'center',
    position: 'absolute',
    right: spacing.lg,
    shadowOffset: { height: 2, width: 0 },
    shadowOpacity: 0.18,
    shadowRadius: 10,
    top: spacing.lg,
    width: 56,
  },
  icon: {
    fontSize: 32,
    fontWeight: '600',
    includeFontPadding: false,
    lineHeight: 36,
    textAlign: 'center',
  },
});
