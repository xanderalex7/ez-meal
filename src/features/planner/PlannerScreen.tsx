import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import type { AppActions, AppModel } from '../appModel';
import {
  calculateMealPlanNutritionTotal,
  calculatePlanDayNutritionTotal,
  type MealType,
} from '../../domain';
import { useI18n, type TranslationKey } from '../../shared/i18n';
import { formatNumber, formatRecipeCalories, hasMissingNutrition } from '../../shared/nutritionUi';
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
  const showNutrition = model.nutritionSettings.trackingEnabled;
  const planTotal = calculateMealPlanNutritionTotal(visibleMealPlan, model.recipes);
  const plannedRecipes = visibleMealPlan.days
    .flatMap((day) => day.slots)
    .flatMap((slot) => slot.recipeIds)
    .map((recipeId) => model.recipes.find((candidate) => candidate.id === recipeId))
    .filter((recipe): recipe is NonNullable<typeof recipe> => Boolean(recipe));
  const nutritionMissing = showNutrition && hasMissingNutrition(plannedRecipes);
  const hasGeneratedDraft = Boolean(model.generatedMealPlanDraft);
  const hasMultipleMealPlans = model.mealPlans.length > 1;
  const [isCreateFormVisible, setIsCreateFormVisible] = useState(false);
  const [pendingDeletePlanId, setPendingDeletePlanId] = useState<string | null>(null);
  const [planTitle, setPlanTitle] = useState(model.mealPlan.title);
  const [newPlanTitle, setNewPlanTitle] = useState('');
  const [message, setMessage] = useState<ScreenMessage | undefined>();
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
        ? { text: t('planGeneratedDraft'), tone: 'info' }
        : { text: t('planInsufficientRecipes', { count: uncovered }), tone: 'error' },
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
    setMessage(
      result
        ? { text: result, tone: 'error' }
        : { text: hasGeneratedDraft ? t('planGeneratedSave') : t('planSaved'), tone: 'info' },
    );
    if (!result) {
      setIsEditing(false);
    }
  }

  function startManualPlanCreation() {
    setPendingDeletePlanId(null);
    setSelectionSlotKey(null);
    const result = actions.createMealPlan(newPlanTitle);
    setMessage(result ? { text: result, tone: 'error' } : { text: t('planCreated'), tone: 'info' });
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
      setMessage({ text: t('planDeleteConfirmMessage'), tone: 'warning' });
      return;
    }

    const result = actions.deleteMealPlan(model.mealPlan.id);
    setMessage(result ? { text: result, tone: 'error' } : { text: t('planDeleted'), tone: 'info' });
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
    setMessage(result ? { text: result, tone: 'error' } : { text: t('planMealUpdated'), tone: 'info' });
    if (!result) {
      setSelectionSlotKey(null);
    }
  }

  return (
    <View style={styles.stack}>
      <View style={styles.titleRow}>
        <Text numberOfLines={1} style={[styles.title, { color: colors.text }]}>
          {visibleMealPlan.title}
          {showNutrition ? ` (${formatNumber(planTotal.calories)} cal)` : ''}
        </Text>
      </View>
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
      {message ? (
        <Text style={[styles.message, { color: messageColor(message.tone, colors) }]}>
          {message.text}
        </Text>
      ) : null}
      {nutritionMissing ? (
        <Text style={[styles.message, { color: colors.error }]}>{t('nutritionMissing')}</Text>
      ) : null}
      {visibleMealPlan.days.map((day, dayIndex) => (
        <Card key={day.date} style={styles.day}>
          <View style={styles.dayHeader}>
            <Text style={[styles.dayTitle, { color: colors.text }]}>
              {weekDayLabelKeys[dayIndex] ? t(weekDayLabelKeys[dayIndex]) : day.date}
            </Text>
            {showNutrition ? (
              <Text style={[styles.dayTotal, { color: colors.textMuted }]}>
                {formatNumber(calculatePlanDayNutritionTotal(day, model.recipes).calories)} cal
              </Text>
            ) : null}
          </View>
          <View style={[styles.dayDivider, { backgroundColor: colors.border }]} />
          {day.slots.map((slot) => {
            const assignedRecipes = slot.recipeIds
              .map((recipeId) => model.recipes.find((candidate) => candidate.id === recipeId))
              .filter((recipe): recipe is NonNullable<typeof recipe> => Boolean(recipe));
            const slotKey = getSlotKey(slot.date, slot.mealType);
            const compatibleRecipes = model.recipes.filter((candidate) =>
              candidate.mealTypes.includes(slot.mealType) && !slot.recipeIds.includes(candidate.id),
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
                    {assignedRecipes.length === 0 ? (
                      <Text style={[styles.recipeName, { color: colors.textMuted }]}>
                        {t('planEmptySlot')}
                      </Text>
                    ) : null}
                  </View>
                  {isEditing ? (
                    <View style={styles.slotActions}>
                      <ActionIconButton
                        accessibilityLabel={t('planChooseRecipeA11y', {
                          date: slot.date,
                          meal: mealTypeLabel(slot.mealType),
                        })}
                        color={colors.success}
                        icon="add"
                        onPress={() => {
                          setMessage(undefined);
                          setSelectionSlotKey(selectionOpen ? null : slotKey);
                        }}
                      />
                    </View>
                  ) : null}
                </View>
                {assignedRecipes.length > 0 ? (
                  <View style={styles.recipeList}>
                    {assignedRecipes.map((recipe) => (
                      <View key={recipe.id} style={styles.recipeRow}>
                        <Text
                          numberOfLines={1}
                          style={[styles.recipeName, { color: colors.text }]}
                        >
                          {recipe.name}
                        </Text>
                        {showNutrition ? (
                          <Text
                            numberOfLines={1}
                            style={[styles.nutritionMeta, { color: colors.textMuted }]}
                          >
                            {formatRecipeCalories(recipe) ?? '-'}
                          </Text>
                        ) : null}
                        {isEditing ? (
                          <View style={styles.recipeAction}>
                            <ActionIconButton
                              accessibilityLabel={t('planRemoveRecipeA11y', {
                                date: slot.date,
                                meal: mealTypeLabel(slot.mealType),
                              })}
                              color={colors.error}
                              icon="trash"
                              onPress={() => {
                                actions.removeRecipeFromMealSlot(slot.date, slot.mealType, recipe.id);
                                setSelectionSlotKey(null);
                                setMessage({ text: t('planMealCleared'), tone: 'info' });
                              }}
                            />
                          </View>
                        ) : null}
                      </View>
                    ))}
                  </View>
                ) : null}
                {isEditing && selectionOpen ? (
                  <View style={styles.optionList}>
                    {compatibleRecipes.length > 0 ? (
                      compatibleRecipes.map((candidate) => (
                        <Button
                          key={candidate.id}
                          label={candidate.name}
                          variant="secondary"
                          onPress={() => assignRecipe(slot.date, slot.mealType, candidate.id)}
                        />
                      ))
                    ) : (
                      <Text style={[styles.empty, { color: colors.warning }]}>
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

type ScreenMessage = {
  text: string;
  tone: 'info' | 'warning' | 'error';
};

function messageColor(tone: ScreenMessage['tone'], colors: ReturnType<typeof useAppColors>) {
  if (tone === 'error') {
    return colors.error;
  }
  if (tone === 'warning') {
    return colors.warning;
  }
  return colors.textMuted;
}

function isMealPlanEmpty(mealPlan: AppModel['mealPlan']) {
  return mealPlan.days.every((day) => day.slots.every((slot) => slot.recipeIds.length === 0));
}

const styles = StyleSheet.create({
  stack: { gap: spacing.md, paddingTop: 72, position: 'relative' },
  form: { gap: spacing.md },
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  planActions: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, justifyContent: 'flex-end' },
  planSelector: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  generatorActions: { gap: spacing.sm, width: '100%' },
  fullWidthButton: { width: '100%' },
  title: { flex: 1, fontSize: 20, fontWeight: '700', minWidth: 0 },
  titleRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.md,
    justifyContent: 'space-between',
  },
  message: { fontSize: 14 },
  day: { gap: spacing.md },
  dayHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.md,
    justifyContent: 'space-between',
  },
  dayTitle: { flex: 1, fontSize: 16, fontWeight: '700', minWidth: 0 },
  dayTotal: { flexShrink: 0, fontSize: 13, fontWeight: '700' },
  dayDivider: { height: 1 },
  slot: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.md,
    justifyContent: 'space-between',
  },
  slotText: { flex: 1, gap: spacing.xs },
  slotActions: { alignItems: 'center', flexDirection: 'row', justifyContent: 'flex-end', width: 44 },
  slotContainer: { gap: spacing.sm },
  slotLabel: { fontSize: 14, fontWeight: '700' },
  recipeName: { flex: 1, fontSize: 17, fontWeight: '700', minWidth: 0 },
  nutritionMeta: {
    flexShrink: 0,
    fontSize: 13,
    fontWeight: '700',
    textAlign: 'right',
  },
  recipeList: { gap: spacing.xs },
  recipeRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.sm,
    justifyContent: 'space-between',
  },
  recipeAction: { alignItems: 'center', width: 44 },
  optionList: { gap: spacing.sm, paddingLeft: spacing.md },
  empty: { fontSize: 14 },
});
