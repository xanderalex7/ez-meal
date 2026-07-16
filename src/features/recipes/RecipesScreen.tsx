import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

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

type RecipesScreenProps = {
  actions: AppActions;
  model: AppModel;
};

export function RecipesScreen({ actions, model }: RecipesScreenProps) {
  const colors = useAppColors();
  const { mealTypeLabel, t } = useI18n();
  const visibleRecipes = [...model.recipes].reverse();
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [name, setName] = useState('');
  const [weightAmount, setWeightAmount] = useState('');
  const [calories, setCalories] = useState('');
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
    setWeightAmount('');
    setCalories('');
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
      nutrition: model.nutritionSettings.trackingEnabled
        ? { weightAmount, calories }
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
    setWeightAmount(recipe.nutrition ? String(recipe.nutrition.weightAmount) : '');
    setCalories(recipe.nutrition ? String(recipe.nutrition.calories) : '');
    setSelectedMealTypes(recipe.mealTypes);
    setSelectedIngredientIds(recipe.ingredientIds);
    setEditingRecipeId(recipe.id);
    setIsFormVisible(true);
    setError(undefined);
    setMessage(undefined);
    setPendingDeleteRecipeId(null);
  }

  function getIngredientNames(ingredientIds: string[]) {
    return ingredientIds
      .map((ingredientId) => model.ingredients.find((ingredient) => ingredient.id === ingredientId)?.name)
      .filter((ingredientName): ingredientName is string => Boolean(ingredientName));
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
                keyboardType="decimal-pad"
                label={t('recipeWeight', { unit: model.nutritionSettings.weightUnit })}
                placeholder={t('recipeWeight', { unit: model.nutritionSettings.weightUnit })}
                value={weightAmount}
                onChangeText={setWeightAmount}
              />
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
              onChange={setSelectedIngredientIds}
            />
          ) : (
            <Text style={[styles.empty, { color: colors.warning }]}>
              {t('recipeNoIngredientsHint')}
            </Text>
          )}
          <Button
            disabled={selectedIngredientIds.length === 0}
            label={editingRecipeId ? t('actionSave') : t('actionAdd')}
            onPress={submit}
          />
        </View>
      ) : null}
      {visibleRecipes.map((recipe) => (
        <Card key={recipe.id} style={styles.item}>
          <View style={styles.stackSmall}>
            <Text style={[styles.itemTitle, { color: colors.text }]}>{recipe.name}</Text>
            <View style={styles.row}>
              {recipe.mealTypes.map((mealType) => (
                <Badge key={mealType} label={mealTypeLabel(mealType)} tone={mealType} />
              ))}
            </View>
            <Text style={[styles.ingredientsText, { color: colors.textMuted }]}>
              {t('recipeIngredientsPrefix')}{' '}
              {getIngredientNames(recipe.ingredientIds).length > 0
                ? getIngredientNames(recipe.ingredientIds).join(', ')
                : t('recipeNoIngredients')}
            </Text>
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
  itemTitle: { fontSize: 16, fontWeight: '700' },
  ingredientsText: { fontSize: 14 },
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
