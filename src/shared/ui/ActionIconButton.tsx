import { StyleSheet, View } from 'react-native';

import { IconButton } from './IconButton';
import { TrashIcon } from './TrashIconButton';

type ActionIcon = 'add' | 'swap' | 'trash';

type ActionIconButtonProps = {
  accessibilityLabel: string;
  color: string;
  icon: ActionIcon;
  onPress: () => void;
};

export function ActionIconButton({
  accessibilityLabel,
  color,
  icon,
  onPress,
}: ActionIconButtonProps) {
  return (
    <IconButton accessibilityLabel={accessibilityLabel} borderColor={color} onPress={onPress}>
      {icon === 'add' ? <PlusIcon color={color} /> : null}
      {icon === 'swap' ? <SwapIcon color={color} /> : null}
      {icon === 'trash' ? <TrashIcon color={color} /> : null}
    </IconButton>
  );
}

export function PlusIcon({ color }: { color: string }) {
  return (
    <View style={styles.iconCanvas}>
      <View style={[styles.plusHorizontal, { backgroundColor: color }]} />
      <View style={[styles.plusVertical, { backgroundColor: color }]} />
    </View>
  );
}

export function SwapIcon({ color }: { color: string }) {
  return (
    <View style={styles.iconCanvas}>
      <View style={[styles.swapTopLine, { backgroundColor: color }]} />
      <View style={[styles.swapTopHead, { borderColor: color }]} />
      <View style={[styles.swapBottomLine, { backgroundColor: color }]} />
      <View style={[styles.swapBottomHead, { borderColor: color }]} />
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
  plusHorizontal: {
    borderRadius: 2,
    height: 3,
    position: 'absolute',
    width: 15,
  },
  plusVertical: {
    borderRadius: 2,
    height: 15,
    position: 'absolute',
    width: 3,
  },
  swapTopLine: {
    borderRadius: 2,
    height: 3,
    position: 'absolute',
    top: 5,
    width: 15,
  },
  swapTopHead: {
    borderRightWidth: 3,
    borderTopWidth: 3,
    height: 8,
    position: 'absolute',
    right: 1,
    top: 2,
    transform: [{ rotate: '45deg' }],
    width: 8,
  },
  swapBottomLine: {
    borderRadius: 2,
    bottom: 5,
    height: 3,
    position: 'absolute',
    width: 15,
  },
  swapBottomHead: {
    borderBottomWidth: 3,
    borderLeftWidth: 3,
    bottom: 2,
    height: 8,
    left: 1,
    position: 'absolute',
    transform: [{ rotate: '45deg' }],
    width: 8,
  },
});
