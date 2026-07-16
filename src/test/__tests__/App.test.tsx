import { fireEvent, render } from '@testing-library/react-native';
import type { ReactNode } from 'react';
import { StyleSheet } from 'react-native';

import App from '../../../App';
import { componentSizes, lightColors } from '../../shared/theme';

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

jest.mock('react-native-safe-area-context', () => ({
  SafeAreaProvider: ({ children }: { children: ReactNode }) => children,
  useSafeAreaInsets: () => ({ bottom: 0, left: 0, right: 0, top: 0 }),
}));

describe('App', () => {
  it('renders the bootstrap screen', async () => {
    const { getAllByText, getByLabelText, getByText } = await render(<App />);

    expect(getByLabelText('EZ-MEAL')).toBeTruthy();
    expect(getByText('Pianifica i pasti con quello che hai già.')).toBeTruthy();
    expect(getAllByText('Oggi')).toHaveLength(2);
    expect(getByText('Piano')).toBeTruthy();
    expect(getByText('Ricette')).toBeTruthy();
    expect(getByText('Ingredienti')).toBeTruthy();
  });

  it('supports ingredient and recipe creation from the shell', async () => {
    const {
      findAllByText,
      findByLabelText,
      findByPlaceholderText,
      findByTestId,
      findByText,
      getAllByText,
      getByText,
    } =
      await render(<App />);

    fireEvent.press(getByText('Ingredienti'));
    fireEvent.press(await findByLabelText('Apri creazione ingrediente'));
    fireEvent.changeText(await findByPlaceholderText('Nome ingrediente'), 'Pomodoro');
    fireEvent.press(await findByText('Aggiungi'));
    expect(await findByText('Pomodoro')).toBeTruthy();

    fireEvent.press(await findByLabelText('Apri creazione ingrediente'));
    fireEvent.changeText(await findByPlaceholderText('Nome ingrediente'), 'Basilico');
    fireEvent.press(await findByText('Aggiungi'));
    expect(getAllByText(/Pomodoro|Basilico/).map((node) => node.props.children)).toEqual([
      'Basilico',
      'Pomodoro',
    ]);

    fireEvent.press(getByText('Ricette'));
    fireEvent.press(await findByLabelText('Apri creazione ricetta'));
    const lunchChip = await findByLabelText('Tag pasto Pranzo');
    const breakfastChip = await findByLabelText('Tag pasto Colazione');
    expect(lunchChip.props.accessibilityState).toEqual({ selected: true });
    expect(StyleSheet.flatten(lunchChip.props.style)).toEqual(
      expect.objectContaining({
        backgroundColor: lightColors.mealTags.lunch.background,
        borderColor: lightColors.mealTags.lunch.border,
        width: componentSizes.mealTagWidth,
      }),
    );
    expect(breakfastChip.props.accessibilityState).toEqual({ selected: false });
    expect(StyleSheet.flatten(breakfastChip.props.style)).toEqual(
      expect.objectContaining({
        backgroundColor: lightColors.surfaceAlt,
        borderColor: lightColors.border,
        width: componentSizes.mealTagWidth,
      }),
    );
    fireEvent.changeText(await findByPlaceholderText('Nome ricetta'), 'Pasta');
    fireEvent.changeText(await findByPlaceholderText('Cerca ingredienti'), 'pom');
    fireEvent.press(await findByText('Pomodoro'));
    expect((await findByLabelText('Pomodoro')).props.accessibilityState).toEqual({ checked: true });
    fireEvent.press(await findByText('Aggiungi'));
    expect(await findByText('Pasta')).toBeTruthy();
    expect(await findByText('Ingredienti: Pomodoro')).toBeTruthy();
    expect(StyleSheet.flatten((await findByTestId('recipe-actions')).props.style)).toEqual(
      expect.objectContaining({ flexDirection: 'row', justifyContent: 'flex-end' }),
    );

    fireEvent.press(await findByLabelText('Modifica ricetta Pasta'));
    fireEvent.changeText(await findByPlaceholderText('Nome ricetta'), 'Pasta al forno');
    fireEvent.press(await findByText('Salva'));
    expect(await findByText('Pasta al forno')).toBeTruthy();

    fireEvent.press(getByText('Ingredienti'));
    fireEvent.press(await findByLabelText('Elimina ingrediente Pomodoro'));
    expect(await findByText(/Ingrediente usato in 1 ricette/)).toBeTruthy();
    fireEvent.press(await findByLabelText('Conferma elimina ingrediente Pomodoro'));
    expect(await findByText('Ingrediente eliminato.')).toBeTruthy();

    fireEvent.press(getByText('Piano'));
    fireEvent.press(await findByLabelText('Modifica piano'));
    fireEvent.press(await findByLabelText('Scegli ricetta per 2026-06-29 Pranzo'));
    fireEvent.press(await findByText('Pasta al forno'));
    expect(await findByText('Pasto aggiornato.')).toBeTruthy();
    fireEvent.press(await findByLabelText('Salva piano'));
    expect(await findByText('Lunedì')).toBeTruthy();

    fireEvent.press(getByText('Ricette'));
    fireEvent.press(await findByLabelText('Elimina ricetta Pasta al forno'));
    expect(await findByText(/Ricetta pianificata in 1 pasti/)).toBeTruthy();
    fireEvent.press(await findByLabelText('Conferma elimina ricetta Pasta al forno'));
    expect(await findByText('Ricetta eliminata.')).toBeTruthy();

    fireEvent.press(getByText('Piano'));
    expect(await findAllByText('Vuoto')).not.toHaveLength(0);

    fireEvent.press(await findByLabelText('Apri creazione piano'));
    fireEvent.changeText(await findByPlaceholderText('Titolo nuovo piano'), 'Piano bulk');
    fireEvent.press(await findByText('Aggiungi'));
    expect(await findByText('Piano creato.')).toBeTruthy();
    expect(await findAllByText('Piano bulk')).not.toHaveLength(0);

    fireEvent.changeText(await findByPlaceholderText('Rinomina piano selezionato'), 'Piano bulk aggiornato');
    fireEvent.press(await findByLabelText('Salva piano'));
    expect(await findByText('Piano salvato.')).toBeTruthy();
    expect(await findAllByText('Piano bulk aggiornato')).not.toHaveLength(0);

    fireEvent.press(await findByLabelText('Elimina piano'));
    expect(await findByText('Premi di nuovo per confermare eliminazione piano.')).toBeTruthy();
    fireEvent.press(await findByLabelText('Conferma elimina piano'));
    expect(await findByText('Piano eliminato.')).toBeTruthy();

    fireEvent.press(await findByLabelText('Modifica piano'));
    fireEvent.press(await findByText('Genera piano ✨'));
    expect(await findByText(/Ricette insufficienti/)).toBeTruthy();

    fireEvent.press(getByText('Altro'));
    fireEvent.press(await findByText('Reset database locale'));
    expect(await findByText('Premi di nuovo per cancellare tutti i dati locali.')).toBeTruthy();
    fireEvent.press(await findByText('Conferma reset'));
    expect(await findByText('Database locale resettato.')).toBeTruthy();
  });
});
