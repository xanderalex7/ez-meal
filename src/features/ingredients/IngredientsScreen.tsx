import { useMemo, useRef, useState } from 'react';
import { Animated, Modal, PanResponder, Pressable, StyleSheet, Text, View } from 'react-native';

import type { AppActions, AppModel } from '../appModel';
import type { Ingredient } from '../../domain';
import { useI18n } from '../../shared/i18n';
import { ActionIconButton, Button, Card, FloatingActionButton, TextField, TrashIconButton } from '../../shared/ui';
import { spacing, useAppColors } from '../../shared/theme';

type IngredientsScreenProps = {
  actions: AppActions;
  model: AppModel;
};

export function IngredientsScreen({ actions, model }: IngredientsScreenProps) {
  const colors = useAppColors();
  const { t } = useI18n();
  const [activeTab, setActiveTab] = useState<IngredientTab>('pantry');
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [name, setName] = useState('');
  const [error, setError] = useState<string | undefined>();
  const [pendingDeleteIngredientId, setPendingDeleteIngredientId] = useState<string | null>(null);
  const [deleteCandidate, setDeleteCandidate] = useState<Ingredient | null>(null);
  const [deleteWarning, setDeleteWarning] = useState<string | null>(null);
  const [message, setMessage] = useState<ScreenMessage | undefined>();
  const [search, setSearch] = useState('');
  const visibleIngredients = [...model.ingredients]
    .sort((left, right) => left.name.localeCompare(right.name, undefined, { sensitivity: 'base' }))
    .filter((ingredient) => activeTab === 'pantry' || !ingredient.available)
    .filter((ingredient) => ingredient.name.toLowerCase().includes(search.trim().toLowerCase()));

  function submit() {
    const result = actions.addIngredient(name);
    setError(result ?? undefined);
    if (!result) {
      setName('');
      setIsFormVisible(false);
      setMessage(undefined);
    }
  }

  function requestDeleteIngredient(ingredient: Ingredient) {
    setDeleteCandidate(ingredient);
    setDeleteWarning(null);
    setPendingDeleteIngredientId(null);
  }

  function cancelDeleteIngredient() {
    setDeleteCandidate(null);
    setDeleteWarning(null);
    setPendingDeleteIngredientId(null);
  }

  function confirmDeleteIngredient() {
    if (!deleteCandidate) {
      return;
    }
    const result = actions.deleteIngredient(deleteCandidate.id, {
      forceCascade: pendingDeleteIngredientId === deleteCandidate.id,
    });
    if (result) {
      setPendingDeleteIngredientId(deleteCandidate.id);
      setDeleteWarning(result);
      return;
    }

    setDeleteCandidate(null);
    setDeleteWarning(null);
    setPendingDeleteIngredientId(null);
    setMessage({ text: t('ingredientDeleted'), tone: 'info' });
  }

  function moveIngredient(ingredient: Ingredient) {
    const nextAvailable = activeTab !== 'pantry';
    const result = actions.setIngredientAvailability(ingredient.id, nextAvailable);
    if (result) {
      setMessage({ text: result, tone: 'error' });
      return;
    }
    setPendingDeleteIngredientId(null);
    setMessage({
      text: nextAvailable
        ? t('ingredientMarkedAvailable', { name: ingredient.name })
        : t('ingredientMarkedMissing', { name: ingredient.name }),
      tone: 'info',
    });
  }

  return (
    <View style={styles.stack}>
      <Text style={[styles.title, { color: colors.text }]}>{t('ingredientsTitle')}</Text>
      <View
        accessibilityRole="tablist"
        style={[styles.tabs, { backgroundColor: colors.surfaceAlt, borderColor: colors.border }]}
      >
        {ingredientTabs.map((tab) => {
          const selected = activeTab === tab.id;
          return (
            <Pressable
              key={tab.id}
              accessibilityLabel={t(tab.labelKey)}
              accessibilityRole="tab"
              accessibilityState={{ selected }}
              onPress={() => {
                setActiveTab(tab.id);
                setPendingDeleteIngredientId(null);
                setMessage(undefined);
              }}
              style={[
                styles.tab,
                {
                  backgroundColor: selected ? colors.primary : 'transparent',
                },
              ]}
            >
              <Text style={[styles.tabText, { color: selected ? colors.surface : colors.text }]}>
                {t(tab.labelKey)}
              </Text>
            </Pressable>
          );
        })}
      </View>
      {message ? (
        <Text style={[styles.message, { color: messageColor(message.tone, colors) }]}>
          {message.text}
        </Text>
      ) : null}
      {isFormVisible ? (
        <View style={styles.form}>
          <TextField
            label={t('ingredientName')}
            placeholder={t('ingredientName')}
            value={name}
            onChangeText={setName}
            error={error}
          />
          <Button label={t('actionAdd')} onPress={submit} />
        </View>
      ) : null}
      <TextField
        label={t('ingredientSearch')}
        placeholder={t('ingredientSearch')}
        value={search}
        onChangeText={setSearch}
      />
      {visibleIngredients.map((ingredient) => (
        <SwipeableIngredientCard
          activeTab={activeTab}
          ingredient={ingredient}
          key={ingredient.id}
          onDelete={requestDeleteIngredient}
          onMove={moveIngredient}
          pendingDeleteIngredientId={pendingDeleteIngredientId}
        />
      ))}
      {visibleIngredients.length === 0 ? (
        <Text style={[styles.empty, { color: colors.textMuted }]}>
          {emptyMessage(activeTab, model.ingredients.length, t)}
        </Text>
      ) : null}
      {!isFormVisible ? (
        <FloatingActionButton
          accessibilityLabel={t('ingredientCreateA11y')}
          onPress={() => {
            setError(undefined);
            setMessage(undefined);
            setIsFormVisible(true);
          }}
        />
      ) : null}
      <DeleteIngredientModal
        ingredient={deleteCandidate}
        onCancel={cancelDeleteIngredient}
        onConfirm={confirmDeleteIngredient}
        warning={deleteWarning}
      />
    </View>
  );
}

type IngredientTab = 'pantry' | 'shopping';

const ingredientTabs: Array<{ id: IngredientTab; labelKey: 'ingredientPantryTab' | 'ingredientShoppingTab' }> = [
  { id: 'pantry', labelKey: 'ingredientPantryTab' },
  { id: 'shopping', labelKey: 'ingredientShoppingTab' },
];

type ScreenMessage = {
  text: string;
  tone: 'info' | 'warning' | 'error';
};

function SwipeableIngredientCard({
  activeTab,
  ingredient,
  onDelete,
  onMove,
  pendingDeleteIngredientId,
}: {
  activeTab: IngredientTab;
  ingredient: Ingredient;
  onDelete: (ingredient: Ingredient) => void;
  onMove: (ingredient: Ingredient) => void;
  pendingDeleteIngredientId: string | null;
}) {
  const colors = useAppColors();
  const { t } = useI18n();
  const dragX = useRef(new Animated.Value(0)).current;
  const canMoveFromCurrentTab = activeTab === 'shopping' || ingredient.available;
  const actionColor = activeTab === 'pantry' ? colors.warning : colors.success;
  const resetSwipe = () => {
    Animated.spring(dragX, {
      friction: 8,
      tension: 80,
      toValue: 0,
      useNativeDriver: true,
    }).start();
  };
  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => false,
        onStartShouldSetPanResponderCapture: () => false,
        onMoveShouldSetPanResponder: (_, gesture) =>
          canMoveFromCurrentTab && gesture.dx < -4 && Math.abs(gesture.dx) > Math.abs(gesture.dy),
        onMoveShouldSetPanResponderCapture: (_, gesture) =>
          canMoveFromCurrentTab && gesture.dx < -6 && Math.abs(gesture.dx) > Math.abs(gesture.dy),
        onPanResponderGrant: () => {
          dragX.stopAnimation();
        },
        onPanResponderMove: (_, gesture) => {
          if (gesture.dx < 0) {
            dragX.setValue(Math.max(gesture.dx, -92));
          }
        },
        onPanResponderRelease: (_, gesture) => {
          resetSwipe();
          if (canMoveFromCurrentTab && (gesture.dx < -44 || gesture.vx < -0.55)) {
            onMove(ingredient);
          }
        },
        onPanResponderTerminate: resetSwipe,
        onPanResponderTerminationRequest: () => false,
        onShouldBlockNativeResponder: () => true,
      }),
    [canMoveFromCurrentTab, dragX, ingredient, onMove],
  );
  const swipeHint = activeTab === 'pantry'
    ? ingredient.available
      ? t('ingredientSwipeToShopping')
      : t('ingredientAlreadyInShopping')
    : t('ingredientSwipeToPantry');

  return (
    <View style={styles.swipeFrame} {...panResponder.panHandlers}>
      {canMoveFromCurrentTab ? (
        <View style={[styles.swipeAction, { backgroundColor: actionColor }]}>
          <CartSwipeGlyph color={colors.surface} withPlus={activeTab === 'pantry'} />
        </View>
      ) : null}
      <Animated.View
        style={[
          { transform: [{ translateX: dragX }] },
        ]}
      >
        <Card
          style={[
            styles.item,
            activeTab === 'pantry' && !ingredient.available
              ? { backgroundColor: missingIngredientBackground(colors), borderColor: colors.warning }
              : null,
          ]}
        >
          <View style={styles.itemContent}>
            <Text style={[styles.itemTitle, { color: colors.text }]}>{ingredient.name}</Text>
            <Text style={[styles.itemHint, { color: colors.textMuted }]}>{swipeHint}</Text>
          </View>
          <View style={styles.itemActions}>
            {activeTab === 'pantry' && ingredient.available ? (
              <ActionIconButton
                accessibilityLabel={t('ingredientMoveToShoppingA11y', { name: ingredient.name })}
                color={colors.warning}
                icon="cart-add"
                onPress={() => onMove(ingredient)}
              />
            ) : null}
            {activeTab === 'shopping' ? (
              <ActionIconButton
                accessibilityLabel={t('ingredientMarkAvailableA11y', { name: ingredient.name })}
                color={colors.success}
                icon="cart"
                onPress={() => onMove(ingredient)}
              />
            ) : null}
            {activeTab === 'pantry' ? (
              <TrashIconButton
                accessibilityLabel={
                  pendingDeleteIngredientId === ingredient.id
                    ? t('ingredientConfirmDeleteA11y', { name: ingredient.name })
                    : t('ingredientDeleteA11y', { name: ingredient.name })
                }
              confirming={pendingDeleteIngredientId === ingredient.id}
              onPress={() => onDelete(ingredient)}
            />
          ) : null}
          </View>
        </Card>
      </Animated.View>
    </View>
  );
}

function DeleteIngredientModal({
  ingredient,
  onCancel,
  onConfirm,
  warning,
}: {
  ingredient: Ingredient | null;
  onCancel: () => void;
  onConfirm: () => void;
  warning: string | null;
}) {
  const colors = useAppColors();
  const { t } = useI18n();

  return (
    <Modal
      animationType="fade"
      onRequestClose={onCancel}
      transparent
      visible={ingredient !== null}
    >
      <View style={styles.modalBackdrop}>
        <View
          accessibilityRole="alert"
          style={[styles.modalCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
        >
          <Text style={[styles.modalTitle, { color: colors.text }]}>
            {ingredient ? t('ingredientDeleteConfirmTitle', { name: ingredient.name }) : ''}
          </Text>
          {warning ? (
            <Text style={[styles.modalWarning, { color: colors.warning }]}>{warning}</Text>
          ) : null}
          <View style={styles.modalActions}>
            <Button label={t('actionNo')} onPress={onCancel} style={styles.modalButton} variant="secondary" />
            <Button label={t('actionYes')} onPress={onConfirm} style={styles.modalButton} variant="danger" />
          </View>
        </View>
      </View>
    </Modal>
  );
}

function CartSwipeGlyph({ color, withPlus = false }: { color: string; withPlus?: boolean }) {
  return (
    <View style={styles.cartSwipeCanvas}>
      <View style={[styles.cartSwipeHandle, { backgroundColor: color }]} />
      <View style={[styles.cartSwipeTopRail, { backgroundColor: color }]} />
      <View style={[styles.cartSwipeBasket, { backgroundColor: color }]} />
      <View style={[styles.cartSwipeWheelLeft, { backgroundColor: color }]} />
      <View style={[styles.cartSwipeWheelRight, { backgroundColor: color }]} />
      {withPlus ? (
        <View style={styles.cartSwipePlus}>
          <View style={[styles.cartSwipePlusLine, { backgroundColor: color }]} />
          <View style={[styles.cartSwipePlusLine, styles.cartSwipePlusVertical, { backgroundColor: color }]} />
        </View>
      ) : null}
      </View>
  );
}

function missingIngredientBackground(colors: ReturnType<typeof useAppColors>) {
  return colors.background === '#121412' ? '#3A2B13' : '#FFF3D8';
}

function emptyMessage(
  activeTab: IngredientTab,
  ingredientCount: number,
  t: ReturnType<typeof useI18n>['t'],
) {
  if (ingredientCount === 0) {
    return t('ingredientEmpty');
  }
  return activeTab === 'pantry' ? t('ingredientPantryEmpty') : t('ingredientShoppingEmpty');
}

function messageColor(tone: ScreenMessage['tone'], colors: ReturnType<typeof useAppColors>) {
  if (tone === 'error') {
    return colors.error;
  }
  if (tone === 'warning') {
    return colors.warning;
  }
  return colors.textMuted;
}

const styles = StyleSheet.create({
  cartSwipeBasket: {
    borderRadius: 3,
    height: 14,
    left: 11,
    position: 'absolute',
    top: 15,
    width: 20,
  },
  cartSwipeCanvas: {
    height: 36,
    width: 36,
  },
  cartSwipeHandle: {
    borderRadius: 2,
    height: 4,
    left: 4,
    position: 'absolute',
    top: 10,
    transform: [{ rotate: '18deg' }],
    width: 15,
  },
  cartSwipePlus: {
    alignItems: 'center',
    height: 14,
    justifyContent: 'center',
    position: 'absolute',
    right: 0,
    top: 1,
    width: 14,
  },
  cartSwipePlusLine: {
    borderRadius: 2,
    height: 3,
    position: 'absolute',
    width: 13,
  },
  cartSwipePlusVertical: {
    transform: [{ rotate: '90deg' }],
  },
  cartSwipeWheelLeft: {
    borderRadius: 3,
    bottom: 2,
    height: 6,
    left: 13,
    position: 'absolute',
    width: 6,
  },
  cartSwipeWheelRight: {
    borderRadius: 3,
    bottom: 2,
    height: 6,
    position: 'absolute',
    right: 3,
    width: 6,
  },
  cartSwipeTopRail: {
    borderRadius: 2,
    height: 4,
    left: 9,
    position: 'absolute',
    top: 13,
    width: 24,
  },
  empty: { fontSize: 14 },
  form: { gap: spacing.md },
  item: { flexDirection: 'row', justifyContent: 'space-between', gap: spacing.md },
  itemActions: { alignItems: 'center', flexDirection: 'row', gap: spacing.sm },
  itemContent: { flex: 1, gap: spacing.xs, justifyContent: 'center' },
  itemHint: { fontSize: 12 },
  itemTitle: { fontSize: 16, fontWeight: '700' },
  message: { fontSize: 14 },
  modalActions: {
    flexDirection: 'row',
    gap: spacing.md,
    justifyContent: 'flex-end',
  },
  modalBackdrop: {
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    flex: 1,
    justifyContent: 'center',
    padding: spacing.xl,
  },
  modalButton: {
    flex: 1,
  },
  modalCard: {
    borderRadius: 8,
    borderWidth: 1,
    gap: spacing.lg,
    maxWidth: 360,
    padding: spacing.xl,
    width: '100%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  modalWarning: {
    fontSize: 14,
    lineHeight: 20,
  },
  stack: { gap: spacing.md, paddingTop: 72, position: 'relative' },
  swipeAction: {
    alignItems: 'center',
    borderRadius: 8,
    bottom: 0,
    justifyContent: 'center',
    position: 'absolute',
    right: 0,
    top: 0,
    width: 84,
  },
  swipeFrame: {
    overflow: 'hidden',
    position: 'relative',
  },
  tab: {
    alignItems: 'center',
    borderRadius: 6,
    flex: 1,
    minHeight: 40,
    justifyContent: 'center',
    paddingHorizontal: spacing.sm,
  },
  tabText: { fontSize: 14, fontWeight: '700' },
  tabs: {
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: 'row',
    gap: spacing.xs,
    padding: spacing.xs,
  },
  title: { fontSize: 20, fontWeight: '700' },
});
