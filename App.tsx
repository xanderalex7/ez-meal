import { StatusBar } from 'expo-status-bar';
import { useEffect, useMemo, useRef, useState, type Dispatch, type SetStateAction } from 'react';
import {
  Image,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';

import { HomeScreen } from './src/features/home';
import { IngredientsScreen } from './src/features/ingredients';
import { createAppActions, createInitialAppModel, type AppModel } from './src/features/appModel';
import { createAppPersistence, type AppPersistence } from './src/features/appPersistence';
import {
  exportAppModelToCsv,
  importAppModelFromCsv,
  type ImportExportStepId,
} from './src/features/importExport';
import { pickCsvFile, readCsvFile, shareCsvFile } from './src/features/importExport/deviceFiles';
import { appSections, type AppSection } from './src/features/navigation';
import { PlannerScreen } from './src/features/planner';
import { RecipesScreen } from './src/features/recipes';
import { SettingsScreen } from './src/features/settings';
import type { NutritionSettings } from './src/domain';
import { I18nProvider, type Language, useI18n } from './src/shared/i18n';
import { consoleLogger } from './src/shared/logging';
import { AppThemeProvider, darkColors, radii, spacing, useAppColors, type ThemeMode } from './src/shared/theme';

const logoLight = require('./assets/logo/logo-light-crp.png');
const logoDark = require('./assets/logo/logo-dark-crp.png');

export default function App() {
  const [language, setLanguage] = useState<Language>('it');
  const [themeMode, setThemeMode] = useState<ThemeMode>('system');

  useEffect(() => {
    configureWebPwa();
  }, []);

  return (
    <SafeAreaProvider>
      <I18nProvider language={language}>
        <AppThemeProvider themeMode={themeMode}>
          <AppContent
            language={language}
            setLanguage={setLanguage}
            setThemeMode={setThemeMode}
            themeMode={themeMode}
          />
        </AppThemeProvider>
      </I18nProvider>
    </SafeAreaProvider>
  );
}

function upsertHeadTag<K extends keyof HTMLElementTagNameMap>(
  tagName: K,
  selector: string,
  attributes: Record<string, string>,
) {
  if (typeof document === 'undefined') {
    return;
  }
  const element = document.querySelector(selector) ?? document.createElement(tagName);
  Object.entries(attributes).forEach(([name, value]) => element.setAttribute(name, value));
  if (!element.parentElement) {
    document.head.appendChild(element);
  }
}

function configureWebPwa() {
  if (Platform.OS !== 'web' || typeof window === 'undefined' || typeof document === 'undefined') {
    return;
  }

  const webBasePath = window.location.pathname.includes('/ez-meal/') ? '/ez-meal' : '';
  const webAssetPath = (path: string) => `${webBasePath}${path}`;

  upsertHeadTag('link', 'link[rel="manifest"]', { rel: 'manifest', href: webAssetPath('/manifest.webmanifest') });
  upsertHeadTag('link', 'link[rel="apple-touch-icon"]', {
    rel: 'apple-touch-icon',
    href: webAssetPath('/icons/icon-192.png'),
  });
  upsertHeadTag('meta', 'meta[name="theme-color"]', { name: 'theme-color', content: '#FAFAF7' });
  upsertHeadTag('meta', 'meta[name="apple-mobile-web-app-capable"]', {
    name: 'apple-mobile-web-app-capable',
    content: 'yes',
  });
  upsertHeadTag('meta', 'meta[name="apple-mobile-web-app-title"]', {
    name: 'apple-mobile-web-app-title',
    content: 'EZ-MEAL',
  });

  if ('serviceWorker' in navigator && (window.isSecureContext || window.location.hostname === 'localhost')) {
    window.addEventListener('load', () => {
      void navigator.serviceWorker.register(webAssetPath('/service-worker.js')).catch(() => {
        consoleLogger.warn('PWA service worker registration failed');
      });
    });
  }
}

function AppContent({
  language,
  setLanguage,
  setThemeMode,
  themeMode,
}: {
  language: Language;
  setLanguage: Dispatch<SetStateAction<Language>>;
  setThemeMode: Dispatch<SetStateAction<ThemeMode>>;
  themeMode: ThemeMode;
}) {
  const [section, setSection] = useState<AppSection>('home');
  const [model, setModel] = useState(createInitialAppModel);
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const persistence = useRef<AppPersistence | null>(null);
  const setPersistentModel = useMemo<Dispatch<SetStateAction<AppModel>>>(
    () => (update) => {
      setModel((current) => {
        const next = typeof update === 'function' ? update(current) : update;
        void persistence.current?.saveSnapshot(current, next).catch(() => {
          consoleLogger.error('Local app state save failed');
        });
        return next;
      });
    },
    [],
  );
  const { t } = useI18n();
  const actions = useMemo(() => createAppActions(model, setPersistentModel, t), [model, setPersistentModel, t]);
  const colors = useAppColors();
  const insets = useSafeAreaInsets();
  const headerLogo = colors.background === darkColors.background ? logoDark : logoLight;

  useEffect(() => {
    let active = true;

    async function loadPersistentModel() {
      try {
        const appPersistence = await createAppPersistence();
        const [persistedModel, persistedThemeMode, persistedLanguage] = await Promise.all([
          appPersistence.load(),
          appPersistence.getThemeMode(),
          appPersistence.getLanguage(),
        ]);
        if (!active) {
          return;
        }
        persistence.current = appPersistence;
        setModel(persistedModel);
        setThemeMode(persistedThemeMode);
        setLanguage(persistedLanguage);
      } catch {
        consoleLogger.error('Local app state load failed');
      }
    }

    void loadPersistentModel();

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    const showSubscription = Keyboard.addListener('keyboardDidShow', () => {
      setKeyboardVisible(true);
    });
    const hideSubscription = Keyboard.addListener('keyboardDidHide', () => {
      setKeyboardVisible(false);
    });

    return () => {
      showSubscription.remove();
      hideSubscription.remove();
    };
  }, []);

  async function resetLocalDatabase() {
    try {
      const resetModel = await persistence.current?.resetLocalData();
      setModel(resetModel ?? createInitialAppModel());
      setThemeMode('system');
      setLanguage('it');
      consoleLogger.warn('Local app state reset requested');
      return null;
    } catch {
      consoleLogger.error('Local app state reset failed');
      return t('errorLocalResetFailed');
    }
  }

  async function changeThemeMode(nextThemeMode: ThemeMode) {
    setThemeMode(nextThemeMode);
    try {
      await persistence.current?.saveThemeMode(nextThemeMode);
      return null;
    } catch {
      consoleLogger.error('Local theme preference save failed');
      return t('errorThemeSaveFailed');
    }
  }

  async function changeLanguage(nextLanguage: Language) {
    setLanguage(nextLanguage);
    try {
      await persistence.current?.saveLanguage(nextLanguage);
      return null;
    } catch {
      consoleLogger.error('Local language preference save failed');
      return t('errorLanguageSaveFailed');
    }
  }

  async function changeNutritionSettings(nextNutritionSettings: NutritionSettings) {
    actions.updateNutritionSettings(nextNutritionSettings);
    try {
      await persistence.current?.saveNutritionSettings(nextNutritionSettings);
      return null;
    } catch {
      consoleLogger.error('Local nutrition preference save failed');
      return t('errorNutritionSettingsSaveFailed');
    }
  }

  async function selectImportCsvFile() {
    try {
      const pickedFile = await pickCsvFile();
      if (pickedFile.canceled) {
        return { ok: false as const, canceled: true as const };
      }
      return {
        ok: true as const,
        fileName: pickedFile.name,
        uri: pickedFile.uri,
      };
    } catch {
      consoleLogger.error('CSV file selection failed');
      return { ok: false as const, message: t('errorImportFileSelectionFailed') };
    }
  }

  async function confirmImportCsvFile(
    uri: string,
    onProgress: (stepId: ImportExportStepId, status: 'active' | 'success' | 'error') => void,
  ) {
    try {
      onProgress('read', 'active');
      const csv = await readCsvFile(uri);
      onProgress('read', 'success');
      const imported = importAppModelFromCsv(csv, onProgress);
      onProgress('database', 'active');
      await persistence.current?.replaceLocalData(imported.model, imported.language, imported.themeMode);
      onProgress('database', 'success');
      onProgress('app', 'active');
      setModel(imported.model);
      setLanguage(imported.language);
      setThemeMode(imported.themeMode);
      onProgress('app', 'success');
      consoleLogger.warn('CSV import completed');
      return { ok: true as const, completedAt: new Date().toLocaleString('it-IT') };
    } catch {
      consoleLogger.error('CSV import failed');
      return { ok: false as const, message: t('errorImportFailed') };
    }
  }

  async function exportCsvFile(
    onProgress: (stepId: ImportExportStepId, status: 'active' | 'success' | 'error') => void,
  ) {
    try {
      onProgress('export', 'active');
      const exportedAt = new Date();
      const csv = exportAppModelToCsv({
        exportedAt: exportedAt.toISOString(),
        language,
        model,
        themeMode,
      });
      await shareCsvFile(csv, exportedAt);
      onProgress('export', 'success');
      consoleLogger.info('CSV export completed', {
        ingredientCount: model.ingredients.length,
        recipeCount: model.recipes.length,
      });
      return { ok: true as const, completedAt: exportedAt.toLocaleString('it-IT') };
    } catch {
      consoleLogger.error('CSV export failed');
      onProgress('export', 'error');
      return { ok: false as const, message: t('errorExportFailed') };
    }
  }

  const safeBottomPadding = Math.max(insets.bottom, spacing.sm);
  const navBottomPadding = safeBottomPadding;
  const keyboardBottomPadding = keyboardVisible ? spacing.xxxl : 0;
  const contentBottomPadding = spacing.xl + keyboardBottomPadding + (!keyboardVisible ? navBottomPadding : 0);

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <View style={styles.header}>
        <Image
          accessibilityLabel="EZ-MEAL"
          resizeMode="contain"
          source={headerLogo}
          style={styles.logo}
        />
        <Text style={[styles.subtitle, { color: colors.textMuted }]}>{t('appSubtitle')}</Text>
      </View>
      <ScrollView
        style={styles.content}
        contentContainerStyle={[styles.contentScroll, { paddingBottom: contentBottomPadding }]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {renderSection(
          section,
          model,
          actions,
          resetLocalDatabase,
          themeMode,
          changeThemeMode,
          language,
          changeLanguage,
          selectImportCsvFile,
          confirmImportCsvFile,
          exportCsvFile,
          changeNutritionSettings,
        )}
      </ScrollView>
      {!keyboardVisible ? (
        <View
          style={[
            styles.nav,
            {
              backgroundColor: colors.surface,
              borderColor: colors.border,
              marginBottom: navBottomPadding,
              shadowColor: colors.text,
            },
          ]}
          accessibilityRole="tablist"
        >
          {appSections.map((item) => {
            const selected = item.id === section;
            return (
              <Pressable
                key={item.id}
                accessibilityLabel={t(item.labelKey)}
                accessibilityRole="tab"
                accessibilityState={{ selected }}
                onPress={() => setSection(item.id)}
                style={[
                  styles.navItem,
                  {
                    backgroundColor: selected ? colors.primary : colors.surfaceAlt,
                    borderColor: selected ? colors.primary : colors.border,
                  },
                ]}
              >
                <Text
                  adjustsFontSizeToFit
                  minimumFontScale={0.76}
                  numberOfLines={1}
                  style={[styles.navText, { color: selected ? colors.surface : colors.text }]}
                >
                  {t(item.labelKey)}
                </Text>
              </Pressable>
            );
          })}
        </View>
      ) : null}
      <StatusBar style="auto" />
    </KeyboardAvoidingView>
  );
}

function renderSection(
  section: AppSection,
  model: ReturnType<typeof createInitialAppModel>,
  actions: ReturnType<typeof createAppActions>,
  resetLocalDatabase: () => Promise<string | null>,
  themeMode: ThemeMode,
  changeThemeMode: (themeMode: ThemeMode) => Promise<string | null>,
  language: Language,
  changeLanguage: (language: Language) => Promise<string | null>,
  selectImportCsvFile: () => Promise<
    | { ok: true; fileName: string; uri: string }
    | { ok: false; canceled?: true; message?: string }
  >,
  confirmImportCsvFile: (
    uri: string,
    onProgress: (stepId: ImportExportStepId, status: 'active' | 'success' | 'error') => void,
  ) => Promise<{ ok: true; completedAt: string } | { ok: false; message: string }>,
  exportCsvFile: (
    onProgress: (stepId: ImportExportStepId, status: 'active' | 'success' | 'error') => void,
  ) => Promise<{ ok: true; completedAt: string } | { ok: false; message: string }>,
  changeNutritionSettings: (settings: NutritionSettings) => Promise<string | null>,
) {
  switch (section) {
    case 'home':
      return <HomeScreen model={model} />;
    case 'planner':
      return <PlannerScreen actions={actions} model={model} />;
    case 'recipes':
      return <RecipesScreen actions={actions} model={model} />;
    case 'ingredients':
      return <IngredientsScreen actions={actions} model={model} />;
    case 'settings':
      return (
        <SettingsScreen
          onResetLocalDatabase={resetLocalDatabase}
          language={language}
          onLanguageChange={changeLanguage}
          onConfirmImportCsv={confirmImportCsvFile}
          onExportCsv={exportCsvFile}
          nutritionSettings={model.nutritionSettings}
          onNutritionSettingsChange={changeNutritionSettings}
          onThemeModeChange={changeThemeMode}
          onSelectImportCsv={selectImportCsvFile}
          themeMode={themeMode}
        />
      );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: spacing.xl,
  },
  header: {
    alignItems: 'flex-start',
    gap: spacing.sm,
    paddingBottom: spacing.xl,
  },
  logo: {
    height: 56,
    width: 174,
  },
  subtitle: {
    fontSize: 15,
    fontWeight: '600',
    lineHeight: 20,
    maxWidth: 360,
  },
  content: {
    flex: 1,
  },
  contentScroll: {
    flexGrow: 1,
    paddingBottom: spacing.xl,
  },
  nav: {
    borderRadius: radii.md,
    borderWidth: 1,
    elevation: 3,
    flexDirection: 'row',
    gap: spacing.xs,
    minHeight: 58,
    padding: spacing.xs,
    shadowOffset: { height: 2, width: 0 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
  },
  navItem: {
    alignItems: 'center',
    borderRadius: radii.sm,
    borderWidth: 1,
    flex: 1,
    minHeight: 48,
    justifyContent: 'center',
    paddingHorizontal: 2,
  },
  navText: {
    fontSize: 11,
    fontWeight: '700',
    includeFontPadding: false,
    lineHeight: 14,
    textAlign: 'center',
  },
});
