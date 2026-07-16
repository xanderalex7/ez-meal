import { act, fireEvent, render } from '@testing-library/react-native';
import type { ReactNode } from 'react';
import * as ReactNative from 'react-native';
import { Keyboard, KeyboardAvoidingView, ScrollView, StyleSheet, View } from 'react-native';

import App from '../../../App';
import { createInitialAppModel, type AppActions } from '../../features/appModel';
import { HomeScreen } from '../../features/home';
import { PlannerScreen } from '../../features/planner';
import { RecipesScreen } from '../../features/recipes';
import { Badge, Button, Card, FloatingActionButton, MultiSelect } from '../../shared/ui';
import { componentSizes, darkColors, lightColors, spacing } from '../../shared/theme';

let mockedInsets = { bottom: 0, left: 0, right: 0, top: 0 };

jest.mock('../../features/appPersistence', () => ({
  createAppPersistence: jest.fn(async () => ({
    getLanguage: async () => 'it',
    getNutritionSettings: async () => ({ trackingEnabled: false, weightUnit: 'g' }),
    getThemeMode: async () => 'system',
    load: async () => jest.requireActual('../../features/appModel').createInitialAppModel(),
    resetLocalData: async () => jest.requireActual('../../features/appModel').createInitialAppModel(),
    saveLanguage: async () => undefined,
    saveNutritionSettings: async () => undefined,
    saveThemeMode: async () => undefined,
    saveSnapshot: async () => undefined,
  })),
}));

jest.mock('react-native-safe-area-context', () => {
  const { View } = require('react-native');
  return {
    SafeAreaProvider: ({ children }: { children: ReactNode }) => children,
    useSafeAreaInsets: () => mockedInsets,
  };
});

describe('shared UI', () => {
  afterEach(() => {
    mockedInsets = { bottom: 0, left: 0, right: 0, top: 0 };
    jest.restoreAllMocks();
  });

  it('renders core components with shared tokens', async () => {
    const { getByText } = await render(
      <Card>
        <Badge label="Pranzo" tone="lunch" />
        <Button label="Salva" />
      </Card>,
    );

    expect(getByText('Pranzo')).toBeTruthy();
    expect(getByText('Salva')).toBeTruthy();
    expect(lightColors.primary).toBe('#2F7D5C');
    expect(lightColors.mealTags.lunch.background).toBe('#DDF7E8');
    expect(spacing.lg).toBe(16);
  });

  it('uses distinctive colors for meal tags', async () => {
    const { UNSAFE_getByType, getByText } = await render(<Badge label="Cena" tone="dinner" />);

    expect(getByText('Cena').props.style).toEqual(
      expect.arrayContaining([expect.objectContaining({ color: lightColors.mealTags.dinner.text })]),
    );
    expect(StyleSheet.flatten(UNSAFE_getByType(View).props.style)).toEqual(
      expect.objectContaining({ width: componentSizes.mealTagWidth }),
    );
  });

  it('supports compact meal tags for dense planner slots', async () => {
    const { UNSAFE_getByType, getByText } = await render(
      <Badge label="Colazione" size="compact" tone="breakfast" />,
    );

    expect(StyleSheet.flatten(UNSAFE_getByType(View).props.style)).toEqual(
      expect.objectContaining({ width: componentSizes.mealTagCompactWidth }),
    );
    expect(getByText('Colazione').props.numberOfLines).toBe(1);
  });

  it('uses readable text on secondary buttons', async () => {
    const { getByText } = await render(<Button label="Colazione" variant="secondary" />);

    expect(getByText('Colazione').props.style).toEqual(
      expect.arrayContaining([expect.objectContaining({ color: lightColors.text })]),
    );
  });

  it('applies light and dark theme colors from the system color scheme', async () => {
    const colorSchemeSpy = jest.spyOn(ReactNative, 'useColorScheme');
    colorSchemeSpy.mockReturnValue('light');

    const lightRender = await render(<App />);
    expect(StyleSheet.flatten(lightRender.UNSAFE_getByType(KeyboardAvoidingView).props.style)).toEqual(
      expect.objectContaining({ backgroundColor: lightColors.background }),
    );
    expect(lightRender.getByLabelText('EZ-MEAL').props.resizeMode).toBe('contain');
    expect(StyleSheet.flatten(lightRender.getByText('Pianifica i pasti con quello che hai già.').props.style)).toEqual(
      expect.objectContaining({ color: lightColors.textMuted, fontSize: 15 }),
    );
    lightRender.unmount();

    colorSchemeSpy.mockReturnValue('dark');

    const darkRender = await render(<App />);
    expect(StyleSheet.flatten(darkRender.UNSAFE_getByType(KeyboardAvoidingView).props.style)).toEqual(
      expect.objectContaining({ backgroundColor: darkColors.background }),
    );
    expect(darkRender.getByLabelText('EZ-MEAL').props.resizeMode).toBe('contain');
  });

  it('allows forcing the dark theme from settings', async () => {
    const colorSchemeSpy = jest.spyOn(ReactNative, 'useColorScheme');
    colorSchemeSpy.mockReturnValue('light');
    const { findByText, getByText, UNSAFE_getByType } = await render(<App />);

    fireEvent.press(getByText('Altro'));
    fireEvent.press(await findByText('Scuro'));

    expect(StyleSheet.flatten(UNSAFE_getByType(KeyboardAvoidingView).props.style)).toEqual(
      expect.objectContaining({ backgroundColor: darkColors.background }),
    );
  });

  it('allows switching the app language from settings', async () => {
    const { findByText, getByText } = await render(<App />);

    fireEvent.press(getByText('Altro'));
    fireEvent.press(await findByText('🇬🇧 English'));

    expect(await findByText('Settings')).toBeTruthy();
    expect(await findByText('App theme')).toBeTruthy();
    expect(getByText('Today')).toBeTruthy();
  });

  it('shows import/export controls in settings', async () => {
    const { findByText, getByText, queryByText } = await render(<App />);

    fireEvent.press(getByText('Altro'));

    expect(await findByText('Import/export')).toBeTruthy();
    expect(await findByText('Importa o esporta ingredienti, ricette, piani, lingua e tema tramite un CSV unico.')).toBeTruthy();
    expect(await findByText('Importa CSV')).toBeTruthy();
    expect(await findByText('Esporta CSV')).toBeTruthy();
    expect(queryByText('Importa')).toBeNull();
    expect(queryByText('Lettura CSV')).toBeNull();
  });

  it('shows nutrition settings controls in settings', async () => {
    const { findByLabelText, findByText, getByText } = await render(<App />);

    fireEvent.press(getByText('Altro'));

    expect(await findByText('Unità e calorie')).toBeTruthy();
    expect(await findByText('Conteggio calorie disattivato')).toBeTruthy();
    expect(await findByLabelText('Unità e calorie')).toBeTruthy();
    expect(await findByText('Grammi')).toBeTruthy();
    expect(await findByText('Chilogrammi')).toBeTruthy();
    expect(await findByText('Once')).toBeTruthy();
    expect(await findByText('Libbre')).toBeTruthy();
  });


  it('renders an accessible floating action button', async () => {
    const { getByLabelText, getByText } = await render(
      <FloatingActionButton accessibilityLabel="Crea ricetta" onPress={jest.fn()} />,
    );
    const fab = getByLabelText('Crea ricetta');

    expect(fab).toBeTruthy();
    expect(StyleSheet.flatten(fab.props.style)).toEqual(
      expect.objectContaining({ position: 'absolute', right: spacing.lg, top: spacing.lg }),
    );
    expect(getByText('+')).toBeTruthy();
  });

  it('renders multiselect as a searchable scrollable dropdown', async () => {
    const { UNSAFE_getByType, getByLabelText, getByPlaceholderText } = await render(
      <MultiSelect
        label="Ingredienti"
        options={[
          { id: 'ingredient-1', label: 'Pomodoro' },
          { id: 'ingredient-2', label: 'Zucchero' },
          { id: 'ingredient-3', label: 'Zucchine' },
        ]}
        selectedIds={['ingredient-2']}
        onChange={jest.fn()}
      />,
    );

    fireEvent.changeText(getByPlaceholderText('Cerca ingredienti'), 'zucche');

    expect(getByLabelText('Zucchero').props.accessibilityRole).toBe('checkbox');
    expect(getByLabelText('Zucchero').props.accessibilityState).toEqual({ checked: true });
    expect(() => getByLabelText('Zucchine')).toThrow();
    expect(StyleSheet.flatten(UNSAFE_getByType(ScrollView).props.style)).toEqual(
      expect.objectContaining({ maxHeight: 264 }),
    );
  });

  it('opens the multiselect dropdown before enabling the mobile keyboard', async () => {
    const { getByLabelText, getByPlaceholderText } = await render(
      <MultiSelect
        label="Ingredienti"
        options={[{ id: 'ingredient-1', label: 'Pomodoro' }]}
        selectedIds={[]}
        onChange={jest.fn()}
      />,
    );
    const searchInput = getByPlaceholderText('Cerca ingredienti');

    expect(searchInput.props.showSoftInputOnFocus).toBe(false);

    fireEvent(searchInput, 'pressIn');

    expect(getByLabelText('Pomodoro')).toBeTruthy();
    expect(getByPlaceholderText('Cerca ingredienti').props.showSoftInputOnFocus).toBe(false);

    fireEvent(getByPlaceholderText('Cerca ingredienti'), 'pressIn');

    expect(getByPlaceholderText('Cerca ingredienti').props.showSoftInputOnFocus).toBe(true);
  });

  it('closes the multiselect dropdown when search loses focus', async () => {
    jest.useFakeTimers();
    try {
      const { getByLabelText, getByPlaceholderText, queryByLabelText } = await render(
        <MultiSelect
          label="Ingredienti"
          options={[{ id: 'ingredient-1', label: 'Pomodoro' }]}
          selectedIds={[]}
          onChange={jest.fn()}
        />,
      );
      const searchInput = getByPlaceholderText('Cerca ingredienti');

      fireEvent(searchInput, 'pressIn');
      expect(getByLabelText('Pomodoro')).toBeTruthy();

      fireEvent(searchInput, 'blur');
      act(() => {
        jest.runOnlyPendingTimers();
      });

      expect(queryByLabelText('Pomodoro')).toBeNull();
    } finally {
      jest.useRealTimers();
    }
  });

  it('shows newest recipes first', async () => {
    const model = {
      ...createInitialAppModel(),
      recipes: [
        {
          id: 'recipe-1',
          name: 'Pasta',
          mealTypes: ['lunch' as const],
          ingredientIds: [],
          createdAt: '2026-07-04T12:00:00.000Z',
          updatedAt: '2026-07-04T12:00:00.000Z',
        },
        {
          id: 'recipe-2',
          name: 'Risotto',
          mealTypes: ['dinner' as const],
          ingredientIds: [],
          createdAt: '2026-07-04T13:00:00.000Z',
          updatedAt: '2026-07-04T13:00:00.000Z',
        },
      ],
    };
    const actions = {
      deleteRecipe: jest.fn(),
    } as unknown as AppActions;

    const { getAllByText, getByLabelText } = await render(<RecipesScreen actions={actions} model={model} />);

    expect(getAllByText(/Pasta|Risotto/).map((node) => node.props.children)).toEqual([
      'Risotto',
      'Pasta',
    ]);
    expect(StyleSheet.flatten(getByLabelText('Modifica ricetta Risotto').props.style)).toEqual(
      expect.objectContaining({
        backgroundColor: lightColors.surface,
        borderColor: lightColors.text,
      }),
    );
  });

  it('filters recipes by name', async () => {
    const model = {
      ...createInitialAppModel(),
      recipes: [
        {
          id: 'recipe-1',
          name: 'Pasta al sugo',
          mealTypes: ['lunch' as const],
          ingredientIds: [],
          createdAt: '2026-07-04T12:00:00.000Z',
          updatedAt: '2026-07-04T12:00:00.000Z',
        },
        {
          id: 'recipe-2',
          name: 'Risotto',
          mealTypes: ['dinner' as const],
          ingredientIds: [],
          createdAt: '2026-07-04T13:00:00.000Z',
          updatedAt: '2026-07-04T13:00:00.000Z',
        },
      ],
    };

    const { getByLabelText, getByText, queryByText } = await render(
      <RecipesScreen actions={{ deleteRecipe: jest.fn() } as unknown as AppActions} model={model} />,
    );

    fireEvent.changeText(getByLabelText('Cerca ricette'), 'past');

    expect(getByText('Pasta al sugo')).toBeTruthy();
    expect(queryByText('Risotto')).toBeNull();
  });

  it('requests scrolling to the edit form when editing a recipe', async () => {
    const model = {
      ...createInitialAppModel(),
      recipes: [
        {
          id: 'recipe-1',
          name: 'Pasta',
          mealTypes: ['lunch' as const],
          ingredientIds: [],
          createdAt: '2026-07-04T12:00:00.000Z',
          updatedAt: '2026-07-04T12:00:00.000Z',
        },
      ],
    };
    const onRequestScrollToTop = jest.fn();

    const { getByLabelText, getByText } = await render(
      <RecipesScreen
        actions={{ deleteRecipe: jest.fn() } as unknown as AppActions}
        model={model}
        onRequestScrollToTop={onRequestScrollToTop}
      />,
    );

    fireEvent.press(getByLabelText('Modifica ricetta Pasta'));

    expect(getByText('Modifica ricetta')).toBeTruthy();
    expect(onRequestScrollToTop).toHaveBeenCalledTimes(1);
  });

  it('shows recipe missing-ingredient guidance as a warning', async () => {
    const model = createInitialAppModel();
    const actions = {} as AppActions;

    const { getByLabelText, getByText } = await render(<RecipesScreen actions={actions} model={model} />);

    fireEvent.press(getByLabelText('Apri creazione ricetta'));

    expect(
      StyleSheet.flatten(getByText('Crea prima un ingrediente per associarlo alla ricetta.').props.style),
    ).toEqual(expect.objectContaining({ color: lightColors.warning }));
  });

  it('shows recipe nutrition fields when tracking is enabled', async () => {
    const model = {
      ...createInitialAppModel(),
      ingredients: [
        {
          id: 'ingredient-1',
          name: 'Pomodoro',
          available: true,
          createdAt: '2026-07-04T12:00:00.000Z',
          updatedAt: '2026-07-04T12:00:00.000Z',
        },
      ],
      nutritionSettings: { trackingEnabled: true, weightUnit: 'kg' as const },
    };
    const actions = {
      addRecipe: jest.fn(() => null),
    } as unknown as AppActions;

    const { getByLabelText, getByPlaceholderText } = await render(<RecipesScreen actions={actions} model={model} />);

    fireEvent.press(getByLabelText('Apri creazione ricetta'));
    fireEvent.changeText(getByLabelText('Nome ricetta'), 'Pasta');
    fireEvent.changeText(getByLabelText('Peso ricetta (kg)'), '0,35');
    fireEvent.changeText(getByLabelText('Calorie ricetta'), '520');
    fireEvent(getByPlaceholderText('Cerca ingredienti'), 'pressIn');
    fireEvent.press(getByLabelText('Pomodoro'));
    fireEvent.press(getByLabelText('Aggiungi'));

    expect(actions.addRecipe).toHaveBeenCalledWith({
      ingredientIds: ['ingredient-1'],
      mealTypes: ['lunch'],
      name: 'Pasta',
      nutrition: { weightAmount: '0,35', calories: '520' },
    });
  });

  it('toggles planner read and edit controls', async () => {
    const model = createInitialAppModel();
    const actions = {
      generatePlan: jest.fn(() => 21),
      renameMealPlan: jest.fn(() => null),
    } as unknown as AppActions;

    const { getByLabelText, getByText, getByTestId, queryByLabelText, queryByTestId } = await render(
      <PlannerScreen actions={actions} model={model} />,
    );

    expect(getByText('Piano settimanale')).toBeTruthy();
    expect(queryByTestId('meal-plan-selector')).toBeNull();
    expect(StyleSheet.flatten(getByTestId('plan-actions').props.style)).toEqual(
      expect.objectContaining({ justifyContent: 'flex-end' }),
    );
    expect(StyleSheet.flatten(getByLabelText('Modifica piano').props.style)).toEqual(
      expect.objectContaining({
        backgroundColor: lightColors.surface,
        borderColor: lightColors.text,
      }),
    );
    expect(queryByLabelText('Salva piano')).toBeNull();
    expect(queryByTestId('plan-generator-actions')).toBeNull();
    expect(queryByLabelText('Scegli ricetta per 2026-06-29 Colazione')).toBeNull();

    fireEvent.press(getByLabelText('Modifica piano'));

    expect(StyleSheet.flatten(getByLabelText('Salva piano').props.style)).toEqual(
      expect.objectContaining({
        backgroundColor: lightColors.surface,
        borderColor: lightColors.success,
      }),
    );
    expect(StyleSheet.flatten(getByLabelText('Elimina piano').props.style)).toEqual(
      expect.objectContaining({ borderColor: lightColors.error }),
    );
    expect(StyleSheet.flatten(getByTestId('plan-generator-actions').props.style)).toEqual(
      expect.objectContaining({ width: '100%' }),
    );
    expect(StyleSheet.flatten(getByTestId('generate-plan-button').props.style)).toEqual(
      expect.objectContaining({ width: '100%' }),
    );
    expect(getByLabelText('Scegli ricetta per 2026-06-29 Colazione')).toBeTruthy();
  });

  it('does not show plan generation for non-empty plans', async () => {
    const model = createInitialAppModel();
    const firstSlot = model.mealPlan.days[0].slots[0];
    const filledPlan = {
      ...model.mealPlan,
      days: model.mealPlan.days.map((day, dayIndex) =>
        dayIndex === 0
          ? {
              ...day,
              slots: day.slots.map((slot, slotIndex) =>
                slotIndex === 0 ? { ...slot, recipeIds: ['recipe-1'] } : slot,
              ),
            }
          : day,
      ),
    };
    const filledModel = {
      ...model,
      mealPlan: filledPlan,
      mealPlans: [filledPlan],
      recipes: [
        {
          id: 'recipe-1',
          name: 'Porridge',
          mealTypes: [firstSlot.mealType],
          ingredientIds: [],
          createdAt: '2026-07-04T12:00:00.000Z',
          updatedAt: '2026-07-04T12:00:00.000Z',
        },
      ],
    };
    const actions = {} as AppActions;

    const { getByLabelText, queryByTestId } = await render(
      <PlannerScreen actions={actions} model={filledModel} />,
    );

    fireEvent.press(getByLabelText('Modifica piano'));

    expect(queryByTestId('plan-generator-actions')).toBeNull();
  });

  it('shows missing compatible planner recipes as a warning', async () => {
    const model = createInitialAppModel();
    const actions = {} as AppActions;

    const { getByLabelText, getByText } = await render(<PlannerScreen actions={actions} model={model} />);

    fireEvent.press(getByLabelText('Modifica piano'));
    fireEvent.press(getByLabelText('Scegli ricetta per 2026-06-29 Colazione'));

    expect(StyleSheet.flatten(getByText('Nessuna ricetta compatibile per Colazione.').props.style)).toEqual(
      expect.objectContaining({ color: lightColors.warning }),
    );
  });

  it('shows recipes planned for the current weekday on home', async () => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2026-07-15T10:00:00.000Z'));
    const model = createInitialAppModel();
    const todayPlan = {
      ...model.mealPlan,
      days: model.mealPlan.days.map((day, dayIndex) =>
        dayIndex === 2
          ? {
              ...day,
              slots: day.slots.map((slot) => ({
                ...slot,
                recipeIds: slot.mealType === 'lunch' ? ['recipe-riso', 'recipe-pollo'] : [],
              })),
            }
          : day,
      ),
    };
    const homeModel = {
      ...model,
      mealPlan: todayPlan,
      mealPlans: [todayPlan],
      recipes: [
        {
          id: 'recipe-riso',
          name: 'Riso in bianco',
          mealTypes: ['lunch' as const],
          ingredientIds: [],
          createdAt: '2026-07-15T10:00:00.000Z',
          updatedAt: '2026-07-15T10:00:00.000Z',
        },
        {
          id: 'recipe-pollo',
          name: 'Fettine di pollo al limone',
          mealTypes: ['lunch' as const],
          ingredientIds: [],
          createdAt: '2026-07-15T10:00:00.000Z',
          updatedAt: '2026-07-15T10:00:00.000Z',
        },
      ],
    };

    const { getByText } = await render(<HomeScreen model={homeModel} />);

    expect(getByText('Riso in bianco')).toBeTruthy();
    expect(getByText('Fettine di pollo al limone')).toBeTruthy();
    jest.useRealTimers();
  });

  it('shows daily nutrition totals on home when tracking is enabled', async () => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2026-07-15T10:00:00.000Z'));
    const model = createInitialAppModel();
    const todayPlan = {
      ...model.mealPlan,
      days: model.mealPlan.days.map((day, dayIndex) =>
        dayIndex === 2
          ? {
              ...day,
              slots: day.slots.map((slot) => ({
                ...slot,
                recipeIds: slot.mealType === 'lunch' ? ['recipe-riso', 'recipe-pollo'] : [],
              })),
            }
          : day,
      ),
    };
    const homeModel = {
      ...model,
      mealPlan: todayPlan,
      mealPlans: [todayPlan],
      nutritionSettings: { trackingEnabled: true, weightUnit: 'g' as const },
      recipes: [
        {
          id: 'recipe-riso',
          name: 'Riso in bianco con nome molto molto lungo',
          mealTypes: ['lunch' as const],
          ingredientIds: [],
          nutrition: { weightAmount: 250, calories: 340 },
          createdAt: '2026-07-15T10:00:00.000Z',
          updatedAt: '2026-07-15T10:00:00.000Z',
        },
        {
          id: 'recipe-pollo',
          name: 'Pollo',
          mealTypes: ['lunch' as const],
          ingredientIds: [],
          nutrition: { weightAmount: 180, calories: 260 },
          createdAt: '2026-07-15T10:00:00.000Z',
          updatedAt: '2026-07-15T10:00:00.000Z',
        },
      ],
    };

    const { getAllByText, getByText } = await render(<HomeScreen model={homeModel} />);

    expect(getByText('600 cal')).toBeTruthy();
    expect(getByText('250 g · 340 cal')).toBeTruthy();
    expect(getByText('180 g · 260 cal')).toBeTruthy();
    expect(StyleSheet.flatten(getAllByText('Riso in bianco con nome molto molto lungo')[0].props.style)).toEqual(
      expect.objectContaining({ flex: 1, minWidth: 0 }),
    );
    jest.useRealTimers();
  });

  it('shows missing nutrition as an error on home', async () => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2026-07-15T10:00:00.000Z'));
    const model = createInitialAppModel();
    const todayPlan = {
      ...model.mealPlan,
      days: model.mealPlan.days.map((day, dayIndex) =>
        dayIndex === 2
          ? {
              ...day,
              slots: day.slots.map((slot) => ({
                ...slot,
                recipeIds: slot.mealType === 'lunch' ? ['recipe-riso'] : [],
              })),
            }
          : day,
      ),
    };
    const homeModel = {
      ...model,
      mealPlan: todayPlan,
      mealPlans: [todayPlan],
      nutritionSettings: { trackingEnabled: true, weightUnit: 'g' as const },
      recipes: [
        {
          id: 'recipe-riso',
          name: 'Riso in bianco',
          mealTypes: ['lunch' as const],
          ingredientIds: [],
          createdAt: '2026-07-15T10:00:00.000Z',
          updatedAt: '2026-07-15T10:00:00.000Z',
        },
      ],
    };

    const { getByText } = await render(<HomeScreen model={homeModel} />);

    expect(
      StyleSheet.flatten(
        getByText('Completa peso e calorie di tutte le ricette pianificate oppure disattiva il conteggio calorie.').props.style,
      ),
    ).toEqual(expect.objectContaining({ color: lightColors.error }));
    expect(getByText('-')).toBeTruthy();
    jest.useRealTimers();
  });

  it('shows plan nutrition totals when tracking is enabled', async () => {
    const model = createInitialAppModel();
    const filledPlan = {
      ...model.mealPlan,
      days: model.mealPlan.days.map((day, dayIndex) =>
        dayIndex === 0
          ? {
              ...day,
              slots: day.slots.map((slot) =>
                slot.mealType === 'lunch' ? { ...slot, recipeIds: ['recipe-riso', 'recipe-pollo'] } : slot,
              ),
            }
          : day,
      ),
    };
    const plannerModel = {
      ...model,
      mealPlan: filledPlan,
      mealPlans: [filledPlan],
      nutritionSettings: { trackingEnabled: true, weightUnit: 'g' as const },
      recipes: [
        {
          id: 'recipe-riso',
          name: 'Riso',
          mealTypes: ['lunch' as const],
          ingredientIds: [],
          nutrition: { weightAmount: 250, calories: 340 },
          createdAt: '2026-07-15T10:00:00.000Z',
          updatedAt: '2026-07-15T10:00:00.000Z',
        },
        {
          id: 'recipe-pollo',
          name: 'Pollo',
          mealTypes: ['lunch' as const],
          ingredientIds: [],
          nutrition: { weightAmount: 180, calories: 260 },
          createdAt: '2026-07-15T10:00:00.000Z',
          updatedAt: '2026-07-15T10:00:00.000Z',
        },
      ],
    };

    const { getAllByText, getByText } = await render(
      <PlannerScreen actions={{} as AppActions} model={plannerModel} />,
    );

    expect(getByText('Piano settimanale (600 cal)')).toBeTruthy();
    expect(getAllByText('600 cal')).toHaveLength(1);
    expect(getByText('250 g · 340 cal')).toBeTruthy();
    expect(getByText('180 g · 260 cal')).toBeTruthy();
  });

  it('uses a scrollable shell for long screen content', async () => {
    const { UNSAFE_getByType } = await render(<App />);

    expect(UNSAFE_getByType(KeyboardAvoidingView)).toBeTruthy();
    expect(UNSAFE_getByType(ScrollView)).toBeTruthy();
  });

  it('hides the bottom navigation while the keyboard is open', async () => {
    const keyboardListeners = new Map<string, () => void>();
    jest.spyOn(Keyboard, 'addListener').mockImplementation((eventName, callback) => {
      keyboardListeners.set(eventName, callback as () => void);
      return { remove: jest.fn() } as unknown as ReturnType<typeof Keyboard.addListener>;
    });
    const { getByLabelText, queryByLabelText } = await render(<App />);

    expect(getByLabelText('Piano')).toBeTruthy();

    act(() => {
      keyboardListeners.get('keyboardDidShow')?.();
    });
    expect(queryByLabelText('Piano')).toBeNull();

    act(() => {
      keyboardListeners.get('keyboardDidHide')?.();
    });
    expect(getByLabelText('Piano')).toBeTruthy();
  });

  it('keeps bottom navigation above the device safe area', async () => {
    mockedInsets = { bottom: 32, left: 0, right: 0, top: 0 };

    const { UNSAFE_getAllByType, UNSAFE_getByType } = await render(<App />);
    const nav = UNSAFE_getAllByType(View).find((node) => node.props.accessibilityRole === 'tablist');

    expect(StyleSheet.flatten(nav?.props.style)).toEqual(
      expect.objectContaining({ marginBottom: 32 }),
    );
    expect(StyleSheet.flatten(UNSAFE_getByType(ScrollView).props.contentContainerStyle)).toEqual(
      expect.objectContaining({ paddingBottom: spacing.xl + 32 }),
    );
  });
});
