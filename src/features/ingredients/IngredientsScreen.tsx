import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import type { AppActions, AppModel } from '../appModel';
import { useI18n } from '../../shared/i18n';
import { Button, Card, FloatingActionButton, TextField, TrashIconButton } from '../../shared/ui';
import { spacing, useAppColors } from '../../shared/theme';

type IngredientsScreenProps = {
  actions: AppActions;
  model: AppModel;
};

export function IngredientsScreen({ actions, model }: IngredientsScreenProps) {
  const colors = useAppColors();
  const { t } = useI18n();
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [name, setName] = useState('');
  const [error, setError] = useState<string | undefined>();
  const [pendingDeleteIngredientId, setPendingDeleteIngredientId] = useState<string | null>(null);
  const [message, setMessage] = useState<ScreenMessage | undefined>();
  const [search, setSearch] = useState('');
  const visibleIngredients = [...model.ingredients]
    .sort((left, right) => left.name.localeCompare(right.name, undefined, { sensitivity: 'base' }))
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

  function deleteIngredient(id: string) {
    const result = actions.deleteIngredient(id, {
      forceCascade: pendingDeleteIngredientId === id,
    });
    if (result) {
      setPendingDeleteIngredientId(id);
      setMessage({ text: result, tone: 'warning' });
      return;
    }

    setPendingDeleteIngredientId(null);
    setMessage({ text: t('ingredientDeleted'), tone: 'info' });
  }

  return (
    <View style={styles.stack}>
      <Text style={[styles.title, { color: colors.text }]}>{t('ingredientsTitle')}</Text>
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
        <Card key={ingredient.id} style={styles.item}>
          <View>
            <Text style={[styles.itemTitle, { color: colors.text }]}>{ingredient.name}</Text>
          </View>
          <TrashIconButton
            accessibilityLabel={
              pendingDeleteIngredientId === ingredient.id
                ? t('ingredientConfirmDeleteA11y', { name: ingredient.name })
                : t('ingredientDeleteA11y', { name: ingredient.name })
            }
            confirming={pendingDeleteIngredientId === ingredient.id}
            onPress={() => deleteIngredient(ingredient.id)}
          />
        </Card>
      ))}
      {model.ingredients.length === 0 ? (
        <Text style={[styles.empty, { color: colors.textMuted }]}>
          {t('ingredientEmpty')}
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

const styles = StyleSheet.create({
  stack: { gap: spacing.md, paddingTop: 72, position: 'relative' },
  form: { gap: spacing.md },
  title: { fontSize: 20, fontWeight: '700' },
  item: { flexDirection: 'row', justifyContent: 'space-between', gap: spacing.md },
  itemTitle: { fontSize: 16, fontWeight: '700' },
  message: { fontSize: 14 },
  empty: { fontSize: 14 },
});
