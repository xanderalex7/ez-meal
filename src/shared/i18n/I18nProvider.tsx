import { createContext, useContext, type ReactNode } from 'react';

import {
  getMealTypeTranslationKey,
  translate,
  type Language,
  type TranslationKey,
  type TranslationParams,
} from './translations';
import type { MealType } from '../../domain';

type I18nContextValue = {
  language: Language;
  mealTypeLabel: (mealType: MealType) => string;
  t: (key: TranslationKey, params?: TranslationParams) => string;
};

const I18nContext = createContext<I18nContextValue>({
  language: 'it',
  mealTypeLabel: (mealType) => translate('it', getMealTypeTranslationKey(mealType)),
  t: (key, params) => translate('it', key, params),
});

export function I18nProvider({
  children,
  language,
}: {
  children: ReactNode;
  language: Language;
}) {
  const value: I18nContextValue = {
    language,
    mealTypeLabel: (mealType) => translate(language, getMealTypeTranslationKey(mealType)),
    t: (key, params) => translate(language, key, params),
  };

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  return useContext(I18nContext);
}

