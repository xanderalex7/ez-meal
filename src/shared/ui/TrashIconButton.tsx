import { Pressable, StyleSheet, View } from 'react-native';

import { useAppColors } from '../theme';

type TrashIconButtonProps = {
  accessibilityLabel: string;
  confirming?: boolean;
  onPress: () => void;
};

export function TrashIconButton({
  accessibilityLabel,
  confirming = false,
  onPress,
}: TrashIconButtonProps) {
  const colors = useAppColors();
  const iconColor = confirming ? colors.surface : colors.error;

  return (
    <Pressable
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="button"
      onPress={onPress}
      style={[
        styles.button,
        {
          backgroundColor: confirming ? colors.error : colors.surface,
          borderColor: colors.error,
        },
      ]}
    >
      <TrashIcon color={iconColor} />
    </Pressable>
  );
}

export function TrashIcon({ color }: { color: string }) {
  return (
    <View style={styles.iconCanvas}>
      <View style={[styles.trashHandle, { backgroundColor: color }]} />
      <View style={[styles.trashLid, { backgroundColor: color }]} />
      <View style={[styles.trashBody, { borderColor: color }]} />
    </View>
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
  iconCanvas: {
    alignItems: 'center',
    height: 20,
    justifyContent: 'center',
    width: 20,
  },
  trashHandle: {
    borderRadius: 2,
    height: 3,
    width: 7,
  },
  trashLid: {
    borderRadius: 2,
    height: 3,
    marginBottom: 2,
    marginTop: 1,
    width: 15,
  },
  trashBody: {
    borderBottomLeftRadius: 3,
    borderBottomRightRadius: 3,
    borderWidth: 2,
    borderTopWidth: 0,
    height: 13,
    width: 13,
  },
});
