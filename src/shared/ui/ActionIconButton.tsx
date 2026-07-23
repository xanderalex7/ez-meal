import { StyleSheet, View } from 'react-native';

import { IconButton } from './IconButton';
import { TrashIcon } from './TrashIconButton';

type ActionIcon = 'add' | 'cart' | 'cart-add' | 'swap' | 'trash';

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
      {icon === 'cart' ? <CartIcon color={color} /> : null}
      {icon === 'cart-add' ? <CartIcon color={color} withPlus /> : null}
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

export function CartIcon({ color, withPlus = false }: { color: string; withPlus?: boolean }) {
  return (
    <View style={styles.iconCanvas}>
      <View style={[styles.cartHandle, { backgroundColor: color }]} />
      <View style={[styles.cartTopRail, { backgroundColor: color }]} />
      <View style={[styles.cartBasket, { backgroundColor: color }]} />
      <View style={[styles.cartWheelLeft, { backgroundColor: color }]} />
      <View style={[styles.cartWheelRight, { backgroundColor: color }]} />
      {withPlus ? (
        <View style={styles.cartPlus}>
          <View style={[styles.cartPlusLine, { backgroundColor: color }]} />
          <View style={[styles.cartPlusLine, styles.cartPlusVertical, { backgroundColor: color }]} />
        </View>
      ) : null}
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
  cartBasket: {
    borderRadius: 2,
    height: 8,
    left: 6,
    position: 'absolute',
    top: 9,
    width: 12,
  },
  cartHandle: {
    borderRadius: 2,
    height: 3,
    left: 2,
    position: 'absolute',
    top: 5,
    transform: [{ rotate: '18deg' }],
    width: 9,
  },
  cartPlus: {
    alignItems: 'center',
    height: 8,
    justifyContent: 'center',
    position: 'absolute',
    right: 0,
    top: 0,
    width: 8,
  },
  cartPlusLine: {
    borderRadius: 2,
    height: 2,
    position: 'absolute',
    width: 9,
  },
  cartPlusVertical: {
    transform: [{ rotate: '90deg' }],
  },
  cartWheelLeft: {
    borderRadius: 2,
    bottom: 1,
    height: 4,
    left: 7,
    position: 'absolute',
    width: 4,
  },
  cartWheelRight: {
    borderRadius: 2,
    bottom: 1,
    height: 4,
    position: 'absolute',
    right: 2,
    width: 4,
  },
  cartTopRail: {
    borderRadius: 2,
    height: 3,
    left: 5,
    position: 'absolute',
    top: 8,
    width: 14,
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
