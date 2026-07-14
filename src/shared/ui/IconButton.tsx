import { Pressable, StyleSheet, type PressableProps } from 'react-native';

import { useAppColors } from '../theme';

type IconButtonProps = Omit<PressableProps, 'children' | 'style'> & {
  accessibilityLabel: string;
  backgroundColor?: string;
  borderColor: string;
  children: React.ReactNode;
};

export function IconButton({
  accessibilityLabel,
  backgroundColor,
  borderColor,
  children,
  ...props
}: IconButtonProps) {
  const colors = useAppColors();

  return (
    <Pressable
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="button"
      style={[
        styles.button,
        {
          backgroundColor: backgroundColor ?? colors.surface,
          borderColor,
        },
      ]}
      {...props}
    >
      {children}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    borderRadius: 22,
    borderWidth: 1,
    height: 44,
    justifyContent: 'center',
    width: 44,
  },
});
