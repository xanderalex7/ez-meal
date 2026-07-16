import { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import type { AppActions, AppModel } from '../appModel';
import { mealTypes, type MealType } from '../../domain';
import { useI18n } from '../../shared/i18n';
import {
  Badge,
  Button,
  Card,
  FloatingActionButton,
  MultiSelect,
  PencilIconButton,
  TextField,
  TrashIconButton,
} from '../../shared/ui';
import { componentSizes, radii, spacing, useAppColors } from '../../shared/theme';
import { formatNumber, getRecipeIngredientRows as getSharedRecipeIngredientRows } from '../../shared/nutritionUi';

type RecipesScreenProps = {
  actions: AppActions;
  model: AppModel;
  onRequestScrollToTop?: () => void;
};

export function RecipesScreen({ actions, model, onRequestScrollToTop }: RecipesScreenProps) {
  const colors = useAppColors();
  const { mealTypeLabel, t } = useI18n();
  const [search, setSearch] = useState('');
  const normalizedSearch = search.trim().toLocaleLowerCase();
  const visibleRecipes = [...model.recipes]
    .sort((first, second) => first.name.localeCompare(second.name, undefined, { sensitivity: 'base' }))
    .filter((recipe) =>
      normalizedSearch ? recipe.name.toLocaleLowerCase().includes(normalizedSearch) : true,
    );
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [name, setName] = useState('');
  const [calories, setCalories] = useState('');
  const [ingredientWeightValues, setIngredientWeightValues] = useState<Record<string, string>>({});
  const [selectedMealTypes, setSelectedMealTypes] = useState<MealType[]>(['lunch']);
  const [selectedIngredientIds, setSelectedIngredientIds] = useState<string[]>([]);
  const [editingRecipeId, setEditingRecipeId] = useState<string | null>(null);
  const [pendingDeleteRecipeId, setPendingDeleteRecipeId] = useState<string | null>(null);
  const [error, setError] = useState<string | undefined>();
  const [message, setMessage] = useState<ScreenMessage | undefined>();

  function toggleMealType(mealType: MealType) {
    setSelectedMealTypes((current) =>
      current.includes(mealType)
        ? current.filter((item) => item !== mealType)
        : [...current, mealType],
    );
  }

  function resetForm() {
    setName('');
    setCalories('');
    setIngredientWeightValues({});
    setSelectedMealTypes(['lunch']);
    setSelectedIngredientIds([]);
    setEditingRecipeId(null);
    setPendingDeleteRecipeId(null);
    setIsFormVisible(false);
  }

  function submit() {
    const input = {
      name,
      mealTypes: selectedMealTypes,
      ingredientIds: selectedIngredientIds,
      ingredientWeights: model.nutritionSettings.trackingEnabled
        ? selectedIngredientIds.map((ingredientId) => ({
            ingredientId,
            quantity: ingredientWeightValues[ingredientId] ?? '',
          }))
        : undefined,
      nutrition: model.nutritionSettings.trackingEnabled
        ? { calories }
        : undefined,
    };
    const result = editingRecipeId
      ? actions.updateRecipe(editingRecipeId, input)
      : actions.addRecipe(input);
    setError(result ?? undefined);
    if (!result) {
      setMessage(undefined);
      resetForm();
    }
  }

  function editRecipe(recipeId: string) {
    const recipe = model.recipes.find((candidate) => candidate.id === recipeId);
    if (!recipe) {
      return;
    }
    setName(recipe.name);
    setCalories(recipe.nutrition ? String(recipe.nutrition.calories) : '');
    setSelectedMealTypes(recipe.mealTypes);
    setSelectedIngredientIds(recipe.ingredientIds);
    setIngredientWeightValues(getRecipeIngredientWeightValues(recipe));
    setEditingRecipeId(recipe.id);
    setIsFormVisible(true);
    setError(undefined);
    setMessage(undefined);
    setPendingDeleteRecipeId(null);
    onRequestScrollToTop?.();
  }

  function getIngredientNames(ingredientIds: string[]) {
    return ingredientIds
      .map((ingredientId) => model.ingredients.find((ingredient) => ingredient.id === ingredientId)?.name)
      .filter((ingredientName): ingredientName is string => Boolean(ingredientName));
  }

  function updateSelectedIngredientIds(nextIngredientIds: string[]) {
    setSelectedIngredientIds(nextIngredientIds);
    setIngredientWeightValues((current) =>
      Object.fromEntries(
        nextIngredientIds.map((ingredientId) => [ingredientId, current[ingredientId] ?? '']),
      ),
    );
  }

  function updateIngredientWeight(ingredientId: string, weightAmount: string) {
    setIngredientWeightValues((current) => ({ ...current, [ingredientId]: weightAmount }));
  }

  function getRecipeIngredientWeightValues(recipe: AppModel['recipes'][number]) {
    const weights = new Map(
      (recipe.ingredientWeights ?? []).map((ingredientWeight) => [
        ingredientWeight.ingredientId,
        ingredientWeight.quantity ?? (
          ingredientWeight.weightAmount === undefined ? '' : String(ingredientWeight.weightAmount)
        ),
      ]),
    );

    if (recipe.ingredientIds.length === 1 && !weights.has(recipe.ingredientIds[0]) && recipe.nutrition?.weightAmount) {
      weights.set(recipe.ingredientIds[0], String(recipe.nutrition.weightAmount));
    }

    return Object.fromEntries(recipe.ingredientIds.map((ingredientId) => [ingredientId, weights.get(ingredientId) ?? '']));
  }

  function deleteRecipe(recipeId: string) {
    const result = actions.deleteRecipe(recipeId, {
      forceCascade: pendingDeleteRecipeId === recipeId,
    });
    if (result) {
      setPendingDeleteRecipeId(recipeId);
      setMessage({ text: result, tone: 'warning' });
      return;
    }

    setPendingDeleteRecipeId(null);
    setMessage({ text: t('recipeDeleted'), tone: 'info' });
  }

  return (
    <View style={styles.stack}>
      <Text style={[styles.title, { color: colors.text }]}>
        {editingRecipeId ? t('recipeEditTitle') : t('recipesTitle')}
      </Text>
      {message ? (
        <Text style={[styles.message, { color: messageColor(message.tone, colors) }]}>
          {message.text}
        </Text>
      ) : null}
      {isFormVisible ? (
        <View style={styles.form}>
          <TextField
            label={t('recipeName')}
            placeholder={t('recipeName')}
            value={name}
            onChangeText={setName}
            error={error}
          />
          {model.nutritionSettings.trackingEnabled ? (
            <View style={styles.nutritionFields}>
              <TextField
                keyboardType="number-pad"
                label={t('recipeCalories')}
                placeholder={t('recipeCalories')}
                value={calories}
                onChangeText={setCalories}
              />
            </View>
          ) : null}
          <View style={styles.row}>
            {mealTypes.map((mealType) => (
              <MealTypeChip
                key={mealType}
                mealType={mealType}
                mealTypeLabel={mealTypeLabel(mealType)}
                selected={selectedMealTypes.includes(mealType)}
                onPress={() => toggleMealType(mealType)}
              />
            ))}
          </View>
          {model.ingredients.length > 0 ? (
            <MultiSelect
              label={t('recipeIngredients')}
              options={model.ingredients.map((ingredient) => ({
                id: ingredient.id,
                label: ingredient.name,
              }))}
              selectedIds={selectedIngredientIds}
              onChange={updateSelectedIngredientIds}
              showSelectedChips={false}
            />
          ) : (
            <Text style={[styles.empty, { color: colors.warning }]}>
              {t('recipeNoIngredientsHint')}
            </Text>
          )}
          {model.nutritionSettings.trackingEnabled && selectedIngredientIds.length > 0 ? (
            <View style={styles.ingredientWeights}>
              <Text style={[styles.ingredientWeightsTitle, { color: colors.text }]}>
                {t('recipeIngredientWeights')}
              </Text>
              <Text style={[styles.ingredientWeightsHint, { color: colors.textMuted }]}>
                {t('recipeIngredientWeightHint')}
              </Text>
              {selectedIngredientIds.map((ingredientId) => {
                const ingredient = model.ingredients.find((candidate) => candidate.id === ingredientId);
                const ingredientName = ingredient?.name ?? ingredientId;
                return (
                  <View key={ingredientId} style={styles.ingredientWeightRow}>
                    <Pressable
                      accessibilityLabel={t('multiselectRemoveA11y', { label: ingredientName })}
                      accessibilityRole="button"
                      onPress={() =>
                        updateSelectedIngredientIds(
                          selectedIngredientIds.filter((selectedIngredientId) => selectedIngredientId !== ingredientId),
                        )
                      }
                      style={[
                        styles.ingredientWeightLabel,
                        { backgroundColor: colors.surfaceAlt, borderColor: colors.border },
                      ]}
                    >
                      <Text
                        numberOfLines={1}
                        style={[styles.ingredientWeightLabelText, { color: colors.text }]}
                      >
                        {ingredientName}
                      </Text>
                      <Text style={[styles.ingredientWeightRemove, { color: colors.textMuted }]}>x</Text>
                    </Pressable>
                    <TextInput
                      accessibilityLabel={t('recipeIngredientWeightA11y', {
                        ingredient: ingredientName,
                      })}
                      onChangeText={(value) => updateIngredientWeight(ingredientId, value)}
                      placeholder={t('recipeIngredientWeightPlaceholder')}
                      placeholderTextColor={colors.textMuted}
                      style={[
                        styles.ingredientWeightInput,
                        {
                          backgroundColor: colors.surface,
                          borderColor: colors.border,
                          color: colors.text,
                        },
                      ]}
                      value={ingredientWeightValues[ingredientId] ?? ''}
                    />
                  </View>
                );
              })}
            </View>
          ) : null}
          <Button
            disabled={selectedIngredientIds.length === 0}
            label={editingRecipeId ? t('actionSave') : t('actionAdd')}
            onPress={submit}
          />
        </View>
      ) : null}
      <TextField
        label={t('recipeSearch')}
        placeholder={t('recipeSearch')}
        value={search}
        onChangeText={setSearch}
      />
      {visibleRecipes.map((recipe) => (
        <Card key={recipe.id} style={styles.item}>
          <View style={styles.stackSmall}>
            <View style={styles.recipeTitleRow}>
              <Text numberOfLines={2} style={[styles.itemTitle, { color: colors.text }]}>
                {recipe.name}
              </Text>
              {model.nutritionSettings.trackingEnabled && recipe.nutrition?.calories ? (
                <Text style={[styles.recipeCalories, { color: colors.textMuted }]}>
                  {formatNumber(recipe.nutrition.calories)} cal
                </Text>
              ) : null}
            </View>
            <View style={styles.row}>
              {recipe.mealTypes.map((mealType) => (
                <Badge key={mealType} label={mealTypeLabel(mealType)} tone={mealType} />
              ))}
            </View>
            {getSharedRecipeIngredientRows(recipe, model.ingredients).length > 0 ? (
              <View style={styles.recipeIngredientList}>
                {getSharedRecipeIngredientRows(recipe, model.ingredients).map((ingredient) => (
                  <View key={ingredient.ingredientId} style={styles.recipeIngredientRow}>
                    <Text
                      numberOfLines={1}
                      style={[styles.recipeIngredientName, { color: colors.textMuted }]}
                    >
                      {ingredient.name}
                    </Text>
                    {model.nutritionSettings.trackingEnabled && ingredient.quantity ? (
                      <Text style={[styles.recipeIngredientWeight, { color: colors.textMuted }]}>
                        {ingredient.quantity}
                      </Text>
                    ) : null}
                  </View>
                ))}
              </View>
            ) : (
              <Text style={[styles.ingredientsText, { color: colors.textMuted }]}>
                {t('recipeIngredientsPrefix')} {t('recipeNoIngredients')}
              </Text>
            )}
          </View>
          <View style={styles.recipeActions} testID="recipe-actions">
            <PencilIconButton
              accessibilityLabel={t('recipeEditA11y', { name: recipe.name })}
              onPress={() => editRecipe(recipe.id)}
            />
            <TrashIconButton
              accessibilityLabel={
                pendingDeleteRecipeId === recipe.id
                  ? t('recipeConfirmDeleteA11y', { name: recipe.name })
                  : t('recipeDeleteA11y', { name: recipe.name })
              }
              confirming={pendingDeleteRecipeId === recipe.id}
              onPress={() => deleteRecipe(recipe.id)}
            />
          </View>
        </Card>
      ))}
      {model.recipes.length === 0 ? (
        <Text style={[styles.empty, { color: colors.textMuted }]}>{t('recipeEmpty')}</Text>
      ) : null}
      {!isFormVisible ? (
        <FloatingActionButton
          accessibilityLabel={t('recipeCreateA11y')}
          onPress={() => {
            setError(undefined);
            setMessage(undefined);
            setPendingDeleteRecipeId(null);
            setIsFormVisible(true);
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

function MealTypeChip({
  mealType,
  mealTypeLabel,
  onPress,
  selected,
}: {
  mealType: MealType;
  mealTypeLabel: string;
  onPress: () => void;
  selected: boolean;
}) {
  const colors = useAppColors();
  const { t } = useI18n();
  const tagColors = colors.mealTags[mealType];
  const chipColors = selected
    ? {
        background: tagColors.background,
        border: tagColors.border,
        text: tagColors.text,
      }
    : {
        background: colors.surfaceAlt,
        border: colors.border,
        text: colors.textMuted,
      };

  return (
    <Pressable
      accessibilityLabel={t('mealTagA11y', { meal: mealTypeLabel })}
      accessibilityRole="button"
      accessibilityState={{ selected }}
      onPress={onPress}
      style={[
        styles.mealChip,
        {
          backgroundColor: chipColors.background,
          borderColor: chipColors.border,
        },
      ]}
    >
      <Text numberOfLines={1} style={[styles.mealChipText, { color: chipColors.text }]}>
        {mealTypeLabel}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  stack: { gap: spacing.md, paddingTop: 72, position: 'relative' },
  form: { gap: spacing.md },
  nutritionFields: { gap: spacing.md },
  ingredientWeights: { gap: spacing.sm },
  ingredientWeightsTitle: { fontSize: 14, fontWeight: '700' },
  ingredientWeightsHint: { fontSize: 13, lineHeight: 18 },
  ingredientWeightRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.sm,
  },
  ingredientWeightLabel: {
    alignItems: 'center',
    borderRadius: radii.pill,
    borderWidth: 1,
    flex: 1,
    flexDirection: 'row',
    gap: spacing.sm,
    minHeight: 40,
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
  },
  ingredientWeightLabelText: {
    flexShrink: 1,
    fontSize: 13,
    fontWeight: '700',
    minWidth: 0,
  },
  ingredientWeightRemove: {
    flexShrink: 0,
    fontSize: 18,
    fontWeight: '800',
    lineHeight: 20,
  },
  ingredientWeightInput: {
    borderRadius: radii.md,
    borderWidth: 1,
    minHeight: 40,
    paddingHorizontal: spacing.md,
    width: 112,
  },
  stackSmall: { gap: spacing.sm },
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  recipeActions: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.sm,
    justifyContent: 'flex-end',
  },
  title: { fontSize: 20, fontWeight: '700' },
  item: { gap: spacing.md },
  recipeTitleRow: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: spacing.sm,
    justifyContent: 'space-between',
  },
  itemTitle: { flex: 1, fontSize: 16, fontWeight: '700', minWidth: 0 },
  recipeCalories: {
    flexShrink: 0,
    fontSize: 14,
    fontWeight: '700',
    lineHeight: 20,
  },
  ingredientsText: { fontSize: 14 },
  recipeIngredientList: { gap: spacing.xs },
  recipeIngredientRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.sm,
    justifyContent: 'space-between',
  },
  recipeIngredientName: {
    flex: 1,
    fontSize: 14,
    minWidth: 0,
  },
  recipeIngredientWeight: {
    flexShrink: 0,
    fontSize: 14,
    fontWeight: '600',
  },
  message: { fontSize: 14 },
  empty: { fontSize: 14 },
  mealChip: {
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: radii.pill,
    width: componentSizes.mealTagWidth,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  mealChipText: {
    fontSize: 14,
    fontWeight: '700',
    textAlign: 'center',
  },
});
