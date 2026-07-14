export const lightColors = {
  primary: '#2F7D5C',
  secondary: '#D97706',
  accent: '#5B6EE1',
  background: '#FAFAF7',
  surface: '#FFFFFF',
  surfaceAlt: '#F0F3EC',
  text: '#1E241F',
  textMuted: '#687267',
  border: '#DDE3DA',
  success: '#27834F',
  warning: '#B86B00',
  error: '#C2413A',
  info: '#2563A8',
  mealTags: {
    breakfast: {
      background: '#FFF1C7',
      border: '#D89A1D',
      text: '#5C3B00',
    },
    lunch: {
      background: '#DDF7E8',
      border: '#2F9D69',
      text: '#124C32',
    },
    dinner: {
      background: '#E8EAFE',
      border: '#6A72D8',
      text: '#30378B',
    },
  },
} as const;

export const darkColors = {
  primary: '#6CCF9D',
  secondary: '#F6B35B',
  accent: '#9AA7FF',
  background: '#121412',
  surface: '#1B1F1B',
  surfaceAlt: '#242A24',
  text: '#F2F5EF',
  textMuted: '#AEB7AC',
  border: '#394238',
  success: '#65C98E',
  warning: '#F2B84B',
  error: '#FF8A82',
  info: '#75A7E8',
  mealTags: {
    breakfast: {
      background: '#4A3511',
      border: '#F2B84B',
      text: '#FFE8A6',
    },
    lunch: {
      background: '#163B29',
      border: '#65C98E',
      text: '#B9F2D0',
    },
    dinner: {
      background: '#252A57',
      border: '#9AA7FF',
      text: '#DDE2FF',
    },
  },
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
  xxxl: 48,
} as const;

export const componentSizes = {
  mealTagCompactWidth: 78,
  mealTagWidth: 96,
} as const;

export const radii = {
  sm: 4,
  md: 8,
  pill: 999,
} as const;

export const typography = {
  h1: { fontSize: 24, lineHeight: 30, fontWeight: '700' },
  h2: { fontSize: 20, lineHeight: 26, fontWeight: '600' },
  body: { fontSize: 16, lineHeight: 24, fontWeight: '400' },
  small: { fontSize: 14, lineHeight: 20, fontWeight: '400' },
  caption: { fontSize: 12, lineHeight: 16, fontWeight: '500' },
} as const;

export type AppColors = typeof lightColors;
