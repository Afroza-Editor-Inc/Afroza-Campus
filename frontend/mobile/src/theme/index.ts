import { TextStyle, ViewStyle } from 'react-native';

export const colors = {
  primary: '#0072FF',
  secondary: '#00FF6A',
  accent: '#00A3FF',
  lime: '#80FF00',
  backgroundDark: '#0F0F14',
  background: '#FFFFFF',
  surface: '#FFFFFF',
  surfaceMuted: '#F7F9FC',
  surfaceStrong: '#E8EDF5',
  surfaceDark: '#171A22',
  surfaceDarkMuted: '#1D2230',
  surfaceGlass: 'rgba(15, 15, 20, 0.88)',
  surfaceGlassBorder: 'rgba(255, 255, 255, 0.08)',
  text: '#333333',
  textStrong: '#111827',
  textMuted: '#A7B1C2',
  muted: '#A7B1C2',
  textSoft: '#E8EDF5',
  textOnDark: '#F5F7FB',
  textMutedOnDark: 'rgba(237, 242, 252, 0.66)',
  iconInactive: 'rgba(228, 235, 247, 0.6)',
  border: '#E8EDF5',
  borderStrong: '#E8EDF5',
  borderDark: 'rgba(255, 255, 255, 0.08)',
  success: '#00FF6A',
  warning: '#F2A93B',
  danger: '#E55252',
  badge: '#FF5D73',
  overlay: 'rgba(0, 0, 0, 0.5)',
  white: '#FFFFFF',
  black: '#333333',
  primarySoft: '#DCEBFF',
  primaryDeep: '#0456C7',
  secondarySoft: '#D6FFE7',
  secondaryDeep: '#00C557',
  gradientStart: '#0072FF', // Bleu pour gradient
  gradientEnd: '#00FF6A', // Vert pour gradient
};

export const spacing = {
  xxs: 4,
  xs: 8,
  sm: 12,
  md: 16,
  lg: 20,
  xl: 24,
  xxl: 32,
  xxxl: 40,
};

export const radii = {
  xs: 10,
  sm: 14,
  md: 18,
  lg: 24,
  xl: 32,
  round: 999,
};

export const typography = {
  fontSizeSm: 12,
  fontSizeMd: 16,
  fontSizeLg: 20,
  hero: {
    fontSize: 34,
    lineHeight: 40,
    fontWeight: '800',
    color: colors.text,
  } satisfies TextStyle,
  title1: {
    fontSize: 28,
    lineHeight: 34,
    fontWeight: '800',
    color: colors.text,
  } satisfies TextStyle,
  title2: {
    fontSize: 22,
    lineHeight: 28,
    fontWeight: '700',
    color: colors.text,
  } satisfies TextStyle,
  title3: {
    fontSize: 18,
    lineHeight: 24,
    fontWeight: '700',
    color: colors.text,
  } satisfies TextStyle,
  body: {
    fontSize: 15,
    lineHeight: 22,
    fontWeight: '500',
    color: colors.text,
  } satisfies TextStyle,
  bodyMuted: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '500',
    color: colors.textMuted,
  } satisfies TextStyle,
  label: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '700',
    color: colors.text,
  } satisfies TextStyle,
  caption: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '600',
    color: colors.textSoft,
    letterSpacing: 0.2,
  } satisfies TextStyle,
};

export const shadows = {
  card: {
    shadowColor: '#164574',
    shadowOpacity: 0.08,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 8 },
    elevation: 6,
  } satisfies ViewStyle,
  glow: {
    shadowColor: '#0F5FD3',
    shadowOpacity: 0.22,
    shadowRadius: 22,
    shadowOffset: { width: 0, height: 12 },
    elevation: 10,
  } satisfies ViewStyle,
  floating: {
    shadowColor: '#020712',
    shadowOpacity: 0.28,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 14 },
    elevation: 18,
  } satisfies ViewStyle,
};

export const gradients = {
  brand: [colors.primary, colors.accent, colors.secondary] as const,
  bubbleMine: [colors.primary, colors.accent, colors.secondary] as const,
  ocean: [colors.primary, colors.accent] as const,
  mint: [colors.accent, colors.secondary] as const,
  aqua: [colors.primary, colors.secondary] as const,
};

/** WCAG-friendly touch targets and motion defaults for shared UI. */
export const accessibility = {
  minTouchTarget: 44,
  hitSlop: 8,
};

export const navigation = {
  barHeight: 92,
  floatingOffset: 14,
  horizontalInset: spacing.md,
  bubbleSize: 52,
  bubbleTopInset: 6,
  container: {
    backgroundColor: colors.surfaceGlass,
    borderColor: colors.surfaceGlassBorder,
  },
  active: {
    base: colors.primary,
    blend: colors.secondary,
    highlight: colors.accent,
  },
};

const theme = {
  colors,
  spacing,
  radii,
  typography,
  shadows,
  gradients,
  accessibility,
  navigation,
};

export default theme;
