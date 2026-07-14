import { StyleSheet, View } from 'react-native';

import { useAppColors } from '../theme';
import { IconButton } from './IconButton';

type SaveIconButtonProps = {
  accessibilityLabel: string;
  onPress: () => void;
};

export function SaveIconButton({ accessibilityLabel, onPress }: SaveIconButtonProps) {
  const colors = useAppColors();

  return (
    <IconButton accessibilityLabel={accessibilityLabel} borderColor={colors.success} onPress={onPress}>
      <SaveIcon color={colors.success} />
    </IconButton>
  );
}

export function SaveIcon({ color }: { color: string }) {
  return (
    <View style={styles.iconCanvas}>
      <View style={[styles.diskBody, { borderColor: color }]}>
        <View style={[styles.diskTop, { backgroundColor: color }]} />
        <View style={[styles.diskLabel, { borderColor: color }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  diskBody: {
    borderRadius: 3,
    borderWidth: 2,
    height: 17,
    justifyContent: 'space-between',
    overflow: 'hidden',
    paddingBottom: 2,
    width: 17,
  },
  diskLabel: {
    alignSelf: 'center',
    borderRadius: 1,
    borderWidth: 2,
    height: 5,
    width: 9,
  },
  diskTop: {
    height: 5,
    width: 10,
  },
  iconCanvas: {
    alignItems: 'center',
    height: 20,
    justifyContent: 'center',
    width: 20,
  },
});
