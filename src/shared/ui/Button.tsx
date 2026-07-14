import {
  Pressable,
  StyleSheet,
  Text,
  type PressableProps,
  type StyleProp,
  type ViewStyle,
} from 'react-native';

import { radii, spacing, useAppColors } from '../theme';

type ButtonProps = Omit<PressableProps, 'style'> & {
  label: string;
  style?: StyleProp<ViewStyle>;
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
};

export function Button({ label, variant = 'primary', disabled, style, ...props }: ButtonProps) {
  const colors = useAppColors();
  const variantStyle = {
    primary: { backgroundColor: colors.primary },
    secondary: { backgroundColor: colors.surfaceAlt, borderColor: colors.border, borderWidth: 1 },
    ghost: { backgroundColor: 'transparent' },
    danger: { backgroundColor: colors.error },
  }[variant];
  const labelStyle = {
    primary: { color: colors.surface },
    secondary: { color: colors.text },
    ghost: { color: colors.primary },
    danger: { color: colors.surface },
  }[variant];

  return (
    <Pressable
      accessibilityLabel={props.accessibilityLabel ?? label}
      accessibilityRole="button"
      disabled={disabled}
      style={[styles.base, variantStyle, disabled && styles.disabled, style]}
      {...props}
    >
      <Text style={[styles.label, labelStyle]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    alignItems: 'center',
    borderRadius: radii.md,
    justifyContent: 'center',
    minHeight: 44,
    paddingHorizontal: spacing.lg,
  },
  disabled: {
    opacity: 0.5,
  },
  label: {
    fontSize: 16,
    fontWeight: '700',
  },
});
