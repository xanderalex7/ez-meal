import { StyleSheet, View } from 'react-native';

import { useAppColors } from '../theme';
import { IconButton } from './IconButton';

type PencilIconButtonProps = {
  accessibilityLabel: string;
  onPress: () => void;
};

export function PencilIconButton({ accessibilityLabel, onPress }: PencilIconButtonProps) {
  const colors = useAppColors();

  return (
    <IconButton accessibilityLabel={accessibilityLabel} borderColor={colors.text} onPress={onPress}>
      <PencilIcon color={colors.text} />
    </IconButton>
  );
}

export function PencilIcon({ color }: { color: string }) {
  return (
    <View style={styles.iconCanvas}>
      <View style={styles.pencilGroup}>
        <View style={[styles.pencilTip, { borderRightColor: color }]} />
        <View style={[styles.pencilBody, { borderColor: color }]} />
        <View style={[styles.pencilEraser, { backgroundColor: color }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  iconCanvas: {
    alignItems: 'center',
    height: 20,
    justifyContent: 'center',
    width: 20,
  },
  pencilBody: {
    borderLeftWidth: 0,
    borderRadius: 2,
    borderWidth: 2,
    height: 8,
    width: 12,
  },
  pencilEraser: {
    borderBottomRightRadius: 2,
    borderTopRightRadius: 2,
    height: 8,
    width: 4,
  },
  pencilGroup: {
    alignItems: 'center',
    flexDirection: 'row',
    transform: [{ rotate: '-45deg' }],
  },
  pencilTip: {
    borderBottomColor: 'transparent',
    borderBottomWidth: 4,
    borderRightWidth: 6,
    borderTopColor: 'transparent',
    borderTopWidth: 4,
  },
});
