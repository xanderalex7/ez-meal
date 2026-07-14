import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import type { AppActions, AppModel } from '../appModel';
import type { MealType } from '../../domain';
import { useI18n, type TranslationKey } from '../../shared/i18n';
import {
  Badge,
  Button,
  Card,
  FloatingActionButton,
  TextField,
  TrashIcon,
  TrashIconButton,
} from '../../shared/ui';
import { spacing, useAppColors } from '../../shared/theme';

type PlannerScreenProps = {
  actions: AppActions;
  model: AppModel;
};

const weekDayLabelKeys: TranslationKey[] = [
  'weekdayMonday',
  'weekdayTuesday',
  'weekdayWednesday',
  'weekdayThursday',
  'weekdayFriday',
  'weekdaySaturday',
  'weekdaySunday',
];
type SlotActionIcon = 'add' | 'swap' | 'trash';

export function PlannerScreen({ actions, model }: PlannerScreenProps) {
  const colors = useAppColors();
  const { mealTypeLabel, t } = useI18n();
  const visibleMealPlan = model.generatedMealPlanDraft ?? model.mealPlan;
  const hasGeneratedDraft = Boolean(model.generatedMealPlanDraft);
  const hasMultipleMealPlans = model.mealPlans.length > 1;
  const [isCreateFormVisible, setIsCreateFormVisible] = useState(false);
  const [pendingDeletePlanId, setPendingDeletePlanId] = useState<string | null>(null);
  const [planTitle, setPlanTitle] = useState(model.mealPlan.title);
  const [newPlanTitle, setNewPlanTitle] = useState('');
  const [message, setMessage] = useState<string | undefined>();
  const [selectionSlotKey, setSelectionSlotKey] = useState<string | null>(null);

  function getSlotKey(date: string, mealType: MealType) {
    return `${date}-${mealType}`;
  }

  function generate() {
    setPendingDeletePlanId(null);
    const uncovered = actions.generatePlan();
    setMessage(
      uncovered === 0
        ? t('planGeneratedDraft')
        : t('planInsufficientRecipes', { count: uncovered }),
    );
  }

  function saveGeneratedPlan() {
    setPendingDeletePlanId(null);
    setSelectionSlotKey(null);
    const result = actions.saveGeneratedPlan();
    setMessage(result ?? t('planGeneratedSave'));
  }

  function startManualPlanCreation() {
    setPendingDeletePlanId(null);
    setSelectionSlotKey(null);
    const result = actions.createMealPlan(newPlanTitle);
    setMessage(result ?? t('planCreated'));
    if (!result) {
      setNewPlanTitle('');
      setIsCreateFormVisible(false);
    }
  }

  function renameSelectedPlan() {
    setPendingDeletePlanId(null);
    setSelectionSlotKey(null);
    const result = actions.renameMealPlan(model.mealPlan.id, planTitle);
    setMessage(result ?? t('planTitleUpdated'));
  }

  function deleteSelectedPlan() {
    setSelectionSlotKey(null);
    if (pendingDeletePlanId !== model.mealPlan.id) {
      setPendingDeletePlanId(model.mealPlan.id);
      setMessage(t('planDeleteConfirmMessage'));
      return;
    }

    const result = actions.deleteMealPlan(model.mealPlan.id);
    setMessage(result ?? t('planDeleted'));
    setPendingDeletePlanId(null);
  }

  function selectPlan(id: string) {
    const plan = model.mealPlans.find((candidate) => candidate.id === id);
    if (!plan) {
      return;
    }
    actions.selectMealPlan(id);
    setPlanTitle(plan.title);
    setPendingDeletePlanId(null);
    setSelectionSlotKey(null);
    setMessage(undefined);
  }

  function assignRecipe(date: string, mealType: MealType, recipeId: string) {
    const result = actions.assignRecipeToMealSlot(date, mealType, recipeId);
    setMessage(result ?? t('planMealUpdated'));
    if (!result) {
      setSelectionSlotKey(null);
    }
  }

  return (
    <View style={styles.stack}>
      <Text style={[styles.title, { color: colors.text }]}>{visibleMealPlan.title}</Text>
      {isCreateFormVisible ? (
        <View style={styles.form}>
          <TextField
            label={t('planNewTitle')}
            placeholder={t('planNewTitle')}
            value={newPlanTitle}
            onChangeText={setNewPlanTitle}
          />
          <Button label={t('actionAdd')} onPress={startManualPlanCreation} />
        </View>
      ) : null}
      <TextField
        label={t('planRenameSelected')}
        placeholder={t('planRenameSelected')}
        value={planTitle}
        onChangeText={setPlanTitle}
      />
      {hasMultipleMealPlans ? (
        <View style={styles.planSelector} testID="meal-plan-selector">
          {model.mealPlans.map((plan) => (
            <Button
              key={plan.id}
              label={plan.title}
              variant={plan.id === model.selectedMealPlanId ? 'primary' : 'secondary'}
              onPress={() => selectPlan(plan.id)}
            />
          ))}
        </View>
      ) : null}
      <View style={styles.planActions} testID="plan-actions">
        <PlanIconButton
          accessibilityLabel={t('actionRenamePlan')}
          onPress={renameSelectedPlan}
        />
        <TrashIconButton
          accessibilityLabel={
            pendingDeletePlanId === model.mealPlan.id
              ? t('actionConfirmDeletePlan')
              : t('actionDeletePlan')
          }
          confirming={pendingDeletePlanId === model.mealPlan.id}
          onPress={deleteSelectedPlan}
        />
      </View>
      <View style={styles.generatorActions} testID="plan-generator-actions">
        <Button
          label={t('planGenerate')}
          onPress={generate}
          style={styles.fullWidthButton}
          testID="generate-plan-button"
        />
        {hasGeneratedDraft ? <Button label={t('actionSave')} onPress={saveGeneratedPlan} style={styles.fullWidthButton} /> : null}
      </View>
      {message ? <Text style={[styles.message, { color: colors.textMuted }]}>{message}</Text> : null}
      {visibleMealPlan.days.map((day, dayIndex) => (
        <Card key={day.date} style={styles.day}>
          <Text style={[styles.dayTitle, { color: colors.text }]}>
            {weekDayLabelKeys[dayIndex] ? t(weekDayLabelKeys[dayIndex]) : day.date}
          </Text>
          <View style={[styles.dayDivider, { backgroundColor: colors.border }]} />
          {day.slots.map((slot) => {
            const recipe = model.recipes.find((candidate) => candidate.id === slot.recipeId);
            const slotKey = getSlotKey(slot.date, slot.mealType);
            const compatibleRecipes = model.recipes.filter((candidate) =>
              candidate.mealTypes.includes(slot.mealType),
            );
            const selectionOpen = selectionSlotKey === slotKey;
            return (
              <View key={slotKey} style={styles.slotContainer}>
                <View style={styles.slot}>
                  <View style={styles.slotText}>
                    <Badge
                      label={mealTypeLabel(slot.mealType)}
                      size="compact"
                      tone={slot.mealType}
                    />
                    <Text
                      style={[
                        styles.recipeName,
                        { color: recipe ? colors.text : colors.textMuted },
                      ]}
                    >
                      {recipe?.name ?? t('planEmptySlot')}
                    </Text>
                  </View>
                  <View style={styles.slotActions}>
                    <SlotActionButton
                      accessibilityLabel={t('planChooseRecipeA11y', {
                        date: slot.date,
                        meal: mealTypeLabel(slot.mealType),
                      })}
                      color={recipe ? colors.text : colors.success}
                      icon={recipe ? 'swap' : 'add'}
                      onPress={() => {
                        setMessage(undefined);
                        setSelectionSlotKey(selectionOpen ? null : slotKey);
                      }}
                    />
                    {recipe ? (
                      <SlotActionButton
                        accessibilityLabel={t('planRemoveRecipeA11y', {
                          date: slot.date,
                          meal: mealTypeLabel(slot.mealType),
                        })}
                        color={colors.error}
                        icon="trash"
                        onPress={() => {
                          actions.removeRecipeFromMealSlot(slot.date, slot.mealType);
                          setSelectionSlotKey(null);
                          setMessage(t('planMealCleared'));
                        }}
                      />
                    ) : null}
                  </View>
                </View>
                {selectionOpen ? (
                  <View style={styles.optionList}>
                    {compatibleRecipes.length > 0 ? (
                      compatibleRecipes.map((candidate) => (
                        <Button
                          key={candidate.id}
                          label={candidate.name}
                          variant={candidate.id === slot.recipeId ? 'primary' : 'secondary'}
                          onPress={() => assignRecipe(slot.date, slot.mealType, candidate.id)}
                        />
                      ))
                    ) : (
                      <Text style={[styles.empty, { color: colors.textMuted }]}>
                        {t('planNoCompatibleRecipe', { meal: mealTypeLabel(slot.mealType) })}
                      </Text>
                    )}
                    <Button label={t('actionCancel')} variant="ghost" onPress={() => setSelectionSlotKey(null)} />
                  </View>
                ) : null}
              </View>
            );
          })}
        </Card>
      ))}
      {!isCreateFormVisible ? (
        <FloatingActionButton
          accessibilityLabel={t('planCreateA11y')}
          onPress={() => {
            setMessage(undefined);
            setPendingDeletePlanId(null);
            setIsCreateFormVisible(true);
          }}
        />
      ) : null}
    </View>
  );
}

function SlotActionButton({
  accessibilityLabel,
  color,
  icon,
  onPress,
}: {
  accessibilityLabel: string;
  color: string;
  icon: SlotActionIcon;
  onPress: () => void;
}) {
  const colors = useAppColors();

  return (
    <Pressable
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="button"
      onPress={onPress}
      style={[
        styles.iconButton,
        {
          backgroundColor: colors.surface,
          borderColor: color,
        },
      ]}
    >
      {icon === 'add' ? <PlusIcon color={color} /> : null}
      {icon === 'swap' ? <SwapIcon color={color} /> : null}
      {icon === 'trash' ? <TrashIcon color={color} /> : null}
    </Pressable>
  );
}

function PlanIconButton({
  accessibilityLabel,
  onPress,
}: {
  accessibilityLabel: string;
  onPress: () => void;
}) {
  const colors = useAppColors();

  return (
    <Pressable
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="button"
      onPress={onPress}
      style={[
        styles.iconButton,
        {
          backgroundColor: colors.surface,
          borderColor: colors.text,
        },
      ]}
    >
      <PencilIcon color={colors.text} />
    </Pressable>
  );
}

function PlusIcon({ color }: { color: string }) {
  return (
    <View style={styles.iconCanvas}>
      <View style={[styles.plusHorizontal, { backgroundColor: color }]} />
      <View style={[styles.plusVertical, { backgroundColor: color }]} />
    </View>
  );
}

function SwapIcon({ color }: { color: string }) {
  return (
    <View style={styles.iconCanvas}>
      <View style={[styles.swapTopLine, { backgroundColor: color }]} />
      <View style={[styles.swapTopHead, { borderColor: color }]} />
      <View style={[styles.swapBottomLine, { backgroundColor: color }]} />
      <View style={[styles.swapBottomHead, { borderColor: color }]} />
    </View>
  );
}

function PencilIcon({ color }: { color: string }) {
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
  stack: { gap: spacing.md, paddingTop: 72, position: 'relative' },
  form: { gap: spacing.md },
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  planActions: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, justifyContent: 'flex-end' },
  planSelector: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  generatorActions: { gap: spacing.sm, width: '100%' },
  fullWidthButton: { width: '100%' },
  title: { fontSize: 20, fontWeight: '700' },
  message: { fontSize: 14 },
  day: { gap: spacing.md },
  dayTitle: { fontSize: 16, fontWeight: '700' },
  dayDivider: { height: 1 },
  slot: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.md,
    justifyContent: 'space-between',
  },
  slotText: { flex: 1, gap: spacing.xs },
  slotActions: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, justifyContent: 'flex-end' },
  slotContainer: { gap: spacing.sm },
  slotLabel: { fontSize: 14, fontWeight: '700' },
  recipeName: { fontSize: 17, fontWeight: '700' },
  iconButton: {
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
  optionList: { gap: spacing.sm, paddingLeft: spacing.md },
  empty: { fontSize: 14 },
});
