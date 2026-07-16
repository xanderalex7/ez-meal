import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import type { ImportExportStepId } from '../importExport';
import { useI18n, type Language } from '../../shared/i18n';
import { Badge, Button, Card } from '../../shared/ui';
import { spacing, useAppColors, type ThemeMode } from '../../shared/theme';

type StepStatus = 'pending' | 'active' | 'success' | 'error';

type SettingsScreenProps = {
  language: Language;
  onConfirmImportCsv: (
    uri: string,
    onProgress: (stepId: ImportExportStepId, status: 'active' | 'success' | 'error') => void,
  ) => Promise<{ ok: true; completedAt: string } | { ok: false; message: string }>;
  onExportCsv: (
    onProgress: (stepId: ImportExportStepId, status: 'active' | 'success' | 'error') => void,
  ) => Promise<{ ok: true; completedAt: string } | { ok: false; message: string }>;
  onLanguageChange: (language: Language) => Promise<string | null>;
  onResetLocalDatabase: () => Promise<string | null>;
  onSelectImportCsv: () => Promise<
    | { ok: true; fileName: string; uri: string }
    | { ok: false; canceled?: true; message?: string }
  >;
  onThemeModeChange: (themeMode: ThemeMode) => Promise<string | null>;
  themeMode: ThemeMode;
};

export function SettingsScreen({
  language,
  onConfirmImportCsv,
  onExportCsv,
  onLanguageChange,
  onResetLocalDatabase,
  onSelectImportCsv,
  onThemeModeChange,
  themeMode,
}: SettingsScreenProps) {
  const colors = useAppColors();
  const { t } = useI18n();
  const [exportSteps, setExportSteps] = useState(createExportSteps(t));
  const [importSteps, setImportSteps] = useState(createImportSteps(t));
  const [lastExportAt, setLastExportAt] = useState<string | undefined>();
  const [lastImportAt, setLastImportAt] = useState<string | undefined>();
  const [resetPending, setResetPending] = useState(false);
  const [showExportSteps, setShowExportSteps] = useState(false);
  const [showImportSteps, setShowImportSteps] = useState(false);
  const [selectedImportFile, setSelectedImportFile] = useState<{ name: string; uri: string } | undefined>();
  const [message, setMessage] = useState<ScreenMessage | undefined>();
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
    setMessage(result ? { text: result, tone: 'error' } : undefined);
  }

  async function selectLanguage(nextLanguage: Language) {
    setResetPending(false);
    const result = await onLanguageChange(nextLanguage);
    setMessage(result ? { text: result, tone: 'error' } : undefined);
  }

  async function resetDatabase() {
    if (!resetPending) {
      setResetPending(true);
      setMessage({ text: t('settingsResetPrompt'), tone: 'warning' });
      return;
    }

    const result = await onResetLocalDatabase();
    setResetPending(false);
    setMessage(
      result
        ? { text: result, tone: 'error' }
        : { text: t('settingsResetDone'), tone: 'info' },
    );
  }

  async function selectImportFile() {
    setResetPending(false);
    setMessage(undefined);
    setImportSteps(createImportSteps(t));
    setShowImportSteps(false);
    const result = await onSelectImportCsv();
    if (result.ok) {
      setSelectedImportFile({ name: result.fileName, uri: result.uri });
      setMessage({ text: t('settingsImportFileSelected', { name: result.fileName }), tone: 'info' });
    } else if (!result.canceled) {
      setMessage({
        text: result.message ?? t('errorImportFileSelectionFailed'),
        tone: 'error',
      });
    }
  }

  async function confirmImport() {
    if (!selectedImportFile) {
      setMessage({ text: t('settingsImportSelectFileFirst'), tone: 'warning' });
      return;
    }
    setMessage(undefined);
    const nextSteps = createImportSteps(t);
    setImportSteps(nextSteps);
    setShowImportSteps(true);
    const result = await onConfirmImportCsv(selectedImportFile.uri, (stepId, status) => {
      setImportSteps((current) => updateSteps(current, stepId, status));
    });
    if (result.ok) {
      setLastImportAt(result.completedAt);
      setSelectedImportFile(undefined);
      setMessage({ text: t('settingsImportDone'), tone: 'info' });
    } else {
      setImportSteps((current) => markActiveStepAsError(current));
      setMessage({ text: result.message, tone: 'error' });
    }
  }

  async function exportCsv() {
    setResetPending(false);
    setMessage(undefined);
    setExportSteps(createExportSteps(t));
    setShowExportSteps(true);
    const result = await onExportCsv((stepId, status) => {
      setExportSteps((current) => updateSteps(current, stepId, status));
    });
    if (result.ok) {
      setLastExportAt(result.completedAt);
      setMessage({ text: t('settingsExportDone'), tone: 'info' });
    } else {
      setExportSteps((current) => markActiveStepAsError(current));
      setMessage({ text: result.message, tone: 'error' });
    }
  }

  return (
    <View style={styles.stack}>
      <Text style={[styles.title, { color: colors.text }]}>{t('settingsTitle')}</Text>
      {message ? (
        <Text style={[styles.message, { color: messageColor(message.tone, colors) }]}>
          {message.text}
        </Text>
      ) : null}
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
      <Card style={styles.cardStack}>
        <Badge label={t('settingsImportExportBadge')} />
        <Text style={[styles.text, { color: colors.textMuted }]}>
          {t('settingsImportExportDescription')}
        </Text>
        {selectedImportFile ? (
          <Text style={[styles.text, { color: colors.text }]}>
            {t('settingsImportSelectedFile', { name: selectedImportFile.name })}
          </Text>
        ) : null}
        <View style={styles.optionRow}>
          <Button label={t('settingsImportCsv')} onPress={selectImportFile} variant="secondary" />
          <Button label={t('settingsExportCsv')} onPress={exportCsv} variant="secondary" />
        </View>
        {selectedImportFile ? <Button label={t('settingsImportSelectedCsv')} onPress={confirmImport} /> : null}
        {showImportSteps ? <StepList steps={importSteps} /> : null}
        {showExportSteps ? <StepList steps={exportSteps} /> : null}
        {lastImportAt ? (
          <Text style={[styles.text, { color: colors.textMuted }]}>
            {t('settingsLastImport', { date: lastImportAt })}
          </Text>
        ) : null}
        {lastExportAt ? (
          <Text style={[styles.text, { color: colors.textMuted }]}>
            {t('settingsLastExport', { date: lastExportAt })}
          </Text>
        ) : null}
      </Card>
    </View>
  );
}

type StepItem = {
  id: ImportExportStepId;
  label: string;
  status: StepStatus;
};

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

function createImportSteps(t: ReturnType<typeof useI18n>['t']): StepItem[] {
  return [
    { id: 'read', label: t('settingsImportStepRead'), status: 'pending' },
    { id: 'schema', label: t('settingsImportStepSchema'), status: 'pending' },
    { id: 'preferences', label: t('settingsImportStepPreferences'), status: 'pending' },
    { id: 'ingredients', label: t('settingsImportStepIngredients'), status: 'pending' },
    { id: 'recipes', label: t('settingsImportStepRecipes'), status: 'pending' },
    { id: 'relations', label: t('settingsImportStepRelations'), status: 'pending' },
    { id: 'plans', label: t('settingsImportStepPlans'), status: 'pending' },
    { id: 'database', label: t('settingsImportStepDatabase'), status: 'pending' },
    { id: 'app', label: t('settingsImportStepApp'), status: 'pending' },
  ];
}

function createExportSteps(t: ReturnType<typeof useI18n>['t']): StepItem[] {
  return [{ id: 'export', label: t('settingsExportStepCsv'), status: 'pending' }];
}

function updateSteps(steps: StepItem[], id: ImportExportStepId, status: 'active' | 'success' | 'error'): StepItem[] {
  return steps.map((step) => (step.id === id ? { ...step, status } : step));
}

function markActiveStepAsError(steps: StepItem[]): StepItem[] {
  return steps.map((step) => (step.status === 'active' ? { ...step, status: 'error' } : step));
}

function StepList({ steps }: { steps: StepItem[] }) {
  const colors = useAppColors();
  return (
    <View style={styles.stepList}>
      {steps.map((step) => (
        <Text
          key={step.id}
          style={[
            styles.step,
            {
              color: step.status === 'error' ? colors.error : colors.textMuted,
            },
          ]}
        >
          <Text style={{ color: statusColor(step.status, colors) }}>{statusSymbol(step.status)}</Text>{' '}
          {step.label}
        </Text>
      ))}
    </View>
  );
}

function statusSymbol(status: StepStatus) {
  if (status === 'active') {
    return '...';
  }
  if (status === 'success') {
    return 'V';
  }
  if (status === 'error') {
    return 'X';
  }
  return '-';
}

function statusColor(status: StepStatus, colors: ReturnType<typeof useAppColors>) {
  if (status === 'success') {
    return colors.success;
  }
  if (status === 'error') {
    return colors.error;
  }
  return colors.textMuted;
}

const styles = StyleSheet.create({
  stack: { gap: spacing.md },
  cardStack: { gap: spacing.md },
  message: { fontSize: 14 },
  optionRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  step: { fontSize: 13 },
  stepList: { gap: spacing.xs },
  title: { fontSize: 20, fontWeight: '700' },
  text: { fontSize: 14 },
});
