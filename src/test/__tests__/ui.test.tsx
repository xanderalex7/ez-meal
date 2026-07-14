import { act, fireEvent, render } from '@testing-library/react-native';
import * as ReactNative from 'react-native';
import { Keyboard, KeyboardAvoidingView, ScrollView, StyleSheet, View } from 'react-native';

import App from '../../../App';
import { createInitialAppModel, type AppActions } from '../../features/appModel';
import { PlannerScreen } from '../../features/planner';
import { RecipesScreen } from '../../features/recipes';
import { Badge, Button, Card, FloatingActionButton, MultiSelect } from '../../shared/ui';
import { componentSizes, darkColors, lightColors, spacing } from '../../shared/theme';

jest.mock('../../features/appPersistence', () => ({
  createAppPersistence: jest.fn(async () => ({
    getLanguage: async () => 'it',
    getThemeMode: async () => 'system',
    load: async () => jest.requireActual('../../features/appModel').createInitialAppModel(),
    resetLocalData: async () => jest.requireActual('../../features/appModel').createInitialAppModel(),
    saveLanguage: async () => undefined,
    saveThemeMode: async () => undefined,
    saveSnapshot: async () => undefined,
  })),
}));

describe('shared UI', () => {
  afterEach(() => {
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
    expect(lightRender.getByText('EZ-MEAL').props.style).toEqual(
      expect.arrayContaining([expect.objectContaining({ color: lightColors.primary })]),
    );
    lightRender.unmount();

    colorSchemeSpy.mockReturnValue('dark');

    const darkRender = await render(<App />);
    expect(StyleSheet.flatten(darkRender.UNSAFE_getByType(KeyboardAvoidingView).props.style)).toEqual(
      expect.objectContaining({ backgroundColor: darkColors.background }),
    );
    expect(darkRender.getByText('EZ-MEAL').props.style).toEqual(
      expect.arrayContaining([expect.objectContaining({ color: darkColors.primary })]),
    );
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

  it('shows the selected plan as title and makes generation full width', async () => {
    const model = createInitialAppModel();
    const actions = {
      generatePlan: jest.fn(() => 21),
    } as unknown as AppActions;

    const { getByLabelText, getByText, getByTestId, queryByTestId } = await render(
      <PlannerScreen actions={actions} model={model} />,
    );

    expect(getByText('Piano settimanale')).toBeTruthy();
    expect(queryByTestId('meal-plan-selector')).toBeNull();
    expect(StyleSheet.flatten(getByTestId('plan-actions').props.style)).toEqual(
      expect.objectContaining({ justifyContent: 'flex-end' }),
    );
    expect(StyleSheet.flatten(getByLabelText('Rinomina piano').props.style)).toEqual(
      expect.objectContaining({
        backgroundColor: lightColors.surface,
        borderColor: lightColors.text,
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
});
