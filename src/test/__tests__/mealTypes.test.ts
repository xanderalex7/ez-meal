import { getMealTypeLabel, isMealType, mealTypeLabels, mealTypes } from '../../domain';

describe('mealTypes', () => {
  it('defines the standard meal slots in internal format', () => {
    expect(mealTypes).toEqual(['breakfast', 'lunch', 'dinner']);
  });

  it('maps meal slots to Italian UI labels', () => {
    expect(mealTypeLabels).toEqual({
      breakfast: 'Colazione',
      lunch: 'Pranzo',
      dinner: 'Cena',
    });
    expect(getMealTypeLabel('lunch')).toBe('Pranzo');
  });

  it('accepts only known meal types', () => {
    expect(isMealType('breakfast')).toBe(true);
    expect(isMealType('snack')).toBe(false);
    expect(isMealType(null)).toBe(false);
  });
});
