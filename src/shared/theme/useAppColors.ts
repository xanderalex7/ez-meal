import { createContext, createElement, useContext, type ReactNode } from 'react';
import { useColorScheme } from 'react-native';

import { darkColors, lightColors } from './tokens';

export type ThemeMode = 'system' | 'light' | 'dark';

const ThemeModeContext = createContext<ThemeMode>('system');

export function AppThemeProvider({
  children,
  themeMode,
}: {
  children: ReactNode;
  themeMode: ThemeMode;
}) {
  return createElement(ThemeModeContext.Provider, { value: themeMode }, children);
}

export function useAppColors() {
  const systemColorScheme = useColorScheme();
  const themeMode = useContext(ThemeModeContext);
  const effectiveTheme = themeMode === 'system' ? systemColorScheme : themeMode;

  return effectiveTheme === 'dark' ? darkColors : lightColors;
}
