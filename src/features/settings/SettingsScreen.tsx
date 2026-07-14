import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { useI18n, type Language } from '../../shared/i18n';
import { Badge, Button, Card } from '../../shared/ui';
import { spacing, useAppColors, type ThemeMode } from '../../shared/theme';

type SettingsScreenProps = {
  language: Language;
  onLanguageChange: (language: Language) => Promise<string | null>;
  onResetLocalDatabase: () => Promise<string | null>;
  onThemeModeChange: (themeMode: ThemeMode) => Promise<string | null>;
  themeMode: ThemeMode;
};

export function SettingsScreen({
  language,
  onLanguageChange,
  onResetLocalDatabase,
  onThemeModeChange,
  themeMode,
}: SettingsScreenProps) {
  const colors = useAppColors();
  const { t } = useI18n();
  const [resetPending, setResetPending] = useState(false);
  const [message, setMessage] = useState<string | undefined>();
  const themeOptions: Array<{ label: string; mode: ThemeMode }> = [
    { label: t('settingsThemeSystem'), mode: 'system' },
    { label: t('settingsThemeLight'), mode: 'light' },
    { label: t('settingsThemeDark'), mode: 'dark' },
  ];
  const languageOptions: Array<{ label: string; value: Language }> = [
    { label: t('settingsLanguageItalian'), value: 'it' },
    { label: t('settingsLanguageEnglish'), value: 'en' },
  ];

  async function selectThemeMode(nextThemeMode: ThemeMode) {
    setResetPending(false);
    const result = await onThemeModeChange(nextThemeMode);
    setMessage(result ?? undefined);
  }

  async function selectLanguage(nextLanguage: Language) {
    setResetPending(false);
    const result = await onLanguageChange(nextLanguage);
    setMessage(result ?? undefined);
  }

  async function resetDatabase() {
    if (!resetPending) {
      setResetPending(true);
      setMessage(t('settingsResetPrompt'));
      return;
    }

    const result = await onResetLocalDatabase();
    setResetPending(false);
    setMessage(result ?? t('settingsResetDone'));
  }

  return (
    <View style={styles.stack}>
      <Text style={[styles.title, { color: colors.text }]}>{t('settingsTitle')}</Text>
      {message ? <Text style={[styles.message, { color: colors.textMuted }]}>{message}</Text> : null}
      <Card style={styles.cardStack}>
        <Badge label={t('settingsThemeBadge')} />
        <Text style={[styles.text, { color: colors.textMuted }]}>
          {t('settingsThemeDescription')}
        </Text>
        <View style={styles.optionRow}>
          {themeOptions.map((option) => (
            <Button
              key={option.mode}
              label={option.label}
              variant={themeMode === option.mode ? 'primary' : 'secondary'}
              onPress={() => selectThemeMode(option.mode)}
            />
          ))}
        </View>
      </Card>
      <Card style={styles.cardStack}>
        <Badge label={t('settingsLanguageBadge')} />
        <Text style={[styles.text, { color: colors.textMuted }]}>
          {t('settingsLanguageDescription')}
        </Text>
        <View style={styles.optionRow}>
          {languageOptions.map((option) => (
            <Button
              key={option.value}
              label={option.label}
              variant={language === option.value ? 'primary' : 'secondary'}
              onPress={() => selectLanguage(option.value)}
            />
          ))}
        </View>
      </Card>
      <Card style={styles.cardStack}>
        <Badge label={t('settingsDatabaseTitle')} />
        <Text style={[styles.text, { color: colors.textMuted }]}>
          {t('settingsDatabaseDescription')}
        </Text>
        <Button
          label={resetPending ? t('settingsConfirmReset') : t('settingsReset')}
          variant="danger"
          onPress={resetDatabase}
        />
      </Card>
    </View>
  );
}

const styles = StyleSheet.create({
  stack: { gap: spacing.md },
  cardStack: { gap: spacing.md },
  message: { fontSize: 14 },
  optionRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  title: { fontSize: 20, fontWeight: '700' },
  text: { fontSize: 14 },
});
