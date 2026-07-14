import type { TranslationKey } from '../shared/i18n';

export type AppSection = 'home' | 'planner' | 'recipes' | 'ingredients' | 'settings';

export const appSections: Array<{ id: AppSection; labelKey: TranslationKey }> = [
  { id: 'home', labelKey: 'navHome' },
  { id: 'planner', labelKey: 'navPlanner' },
  { id: 'recipes', labelKey: 'navRecipes' },
  { id: 'ingredients', labelKey: 'navIngredients' },
  { id: 'settings', labelKey: 'navSettings' },
];
