import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import type { AppActions, AppModel } from '../appModel';
import type { MealType } from '../../domain';
import { useI18n, type TranslationKey } from '../../shared/i18n';
import {
  ActionIconButton,
  Badge,
  Button,
  Card,
  FloatingActionButton,
  PencilIconButton,
  SaveIconButton,
  TextField,
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
  const [isEditing, setIsEditing] = useState(false);
  const canGeneratePlan = isEditing && !hasGeneratedDraft && isMealPlanEmpty(model.mealPlan);

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

  function enterEditMode() {
    setPendingDeletePlanId(null);
    setSelectionSlotKey(null);
    setPlanTitle(model.mealPlan.title);
    setMessage(undefined);
    setIsEditing(true);
  }

  function savePlanChanges() {
    setPendingDeletePlanId(null);
    setSelectionSlotKey(null);
    const generatedResult = hasGeneratedDraft ? actions.saveGeneratedPlan() : null;
    const renameResult =
      planTitle.trim() !== model.mealPlan.title
        ? actions.renameMealPlan(model.mealPlan.id, planTitle)
        : null;
    const result = generatedResult ?? renameResult;
    setMessage(result ?? (hasGeneratedDraft ? t('planGeneratedSave') : t('planSaved')));
    if (!result) {
      setIsEditing(false);
    }
  }

  function startManualPlanCreation() {
    setPendingDeletePlanId(null);
    setSelectionSlotKey(null);
    const result = actions.createMealPlan(newPlanTitle);
    setMessage(result ?? t('planCreated'));
    if (!result) {
      setNewPlanTitle('');
      setIsCreateFormVisible(false);
      setIsEditing(true);
    }
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
    setIsEditing(false);
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
      {isEditing ? (
        <TextField
          label={t('planRenameSelected')}
          placeholder={t('planRenameSelected')}
          value={planTitle}
          onChangeText={setPlanTitle}
        />
      ) : null}
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
        {isEditing ? (
          <SaveIconButton accessibilityLabel={t('actionSavePlan')} onPress={savePlanChanges} />
        ) : (
          <PencilIconButton accessibilityLabel={t('actionEditPlan')} onPress={enterEditMode} />
        )}
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
      {canGeneratePlan ? (
        <View style={styles.generatorActions} testID="plan-generator-actions">
          <Button
            label={t('planGenerate')}
            onPress={generate}
            style={styles.fullWidthButton}
            testID="generate-plan-button"
          />
        </View>
      ) : null}
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
                  {isEditing ? (
                    <View style={styles.slotActions}>
                      <ActionIconButton
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
                        <ActionIconButton
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
                  ) : null}
                </View>
                {isEditing && selectionOpen ? (
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
                    <Button
                      label={t('actionCancel')}
                      variant="ghost"
                      onPress={() => setSelectionSlotKey(null)}
                    />
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

function isMealPlanEmpty(mealPlan: AppModel['mealPlan']) {
  return mealPlan.days.every((day) => day.slots.every((slot) => !slot.recipeId));
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
  optionList: { gap: spacing.sm, paddingLeft: spacing.md },
  empty: { fontSize: 14 },
});
