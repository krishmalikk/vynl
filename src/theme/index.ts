import { Dimensions, Platform, TextStyle, ViewStyle } from 'react-native';

const { width, height } = Dimensions.get('window');

// ============================================================================
// Vynl design tokens — warm lavender + ink + cranberry
// ============================================================================
export const vynl = {
  bg: '#EDEAF2',
  bgDeep: '#DCD7E4',
  ink: '#0B0B0E',
  ink2: '#1A1A1F',
  inkSoft: '#4A4A52',
  muted: '#8F8A9A',
  surface: '#FFFFFF',
  surface2: '#F6F4FA',
  vinyl: '#0E0E12',
  vinylShine: '#2A2A30',
  labelCream: '#E8DFC9',
  labelAccent: '#B8405A',
  pulseGreen: '#6EE7A3',
} as const;

// ============================================================================
// Theme palettes
// Light is the vynl palette (only theme we ship). Dark kept for shape compat.
// ============================================================================
export const colors = {
  dark: {
    background: '#0a0a0a',
    surface: '#141414',
    surfaceLight: '#1f1f1f',
    primary: '#1DB954',
    primaryDark: '#158a3d',
    secondary: '#535353',
    text: '#ffffff',
    textSecondary: '#b3b3b3',
    textMuted: '#6a6a6a',
    border: '#282828',
    error: '#ff4444',
    warning: '#ffaa00',
    overlay: 'rgba(0, 0, 0, 0.7)',
    shadowLight: '#1f1f1f',
    shadowDark: '#000000',
  },
  light: {
    background: vynl.bg,
    surface: vynl.surface,
    surfaceLight: vynl.surface2,
    primary: vynl.ink,
    primaryDark: vynl.ink2,
    secondary: vynl.inkSoft,
    text: vynl.ink,
    textSecondary: vynl.inkSoft,
    textMuted: vynl.muted,
    border: 'transparent',
    error: vynl.labelAccent,
    warning: '#ED8936',
    overlay: 'rgba(11, 11, 14, 0.45)',
    shadowLight: '#FFFFFF',
    shadowDark: '#A3B1C6',
  },
};

// ============================================================================
// Spacing (4px grid)
// ============================================================================
export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

// ============================================================================
// Radii
// sm 12, md 18, lg 24, xl 28, pill 999. "16" from HTML mockups folds to sm.
// borderRadius kept for legacy screens; radii is the new canonical export.
// ============================================================================
export const radii = {
  sm: 12,
  md: 18,
  lg: 24,
  xl: 28,
  pill: 999,
} as const;

export const borderRadius = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  full: 9999,
};

// ============================================================================
// Shadows
// ============================================================================
export const shadow: Record<'sm' | 'md' | 'lg', ViewStyle> = {
  sm: Platform.select({
    ios: {
      shadowColor: vynl.ink,
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.06,
      shadowRadius: 2,
    },
    android: { elevation: 1 },
    default: {},
  })!,
  md: Platform.select({
    ios: {
      shadowColor: vynl.ink,
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.08,
      shadowRadius: 24,
    },
    android: { elevation: 4 },
    default: {},
  })!,
  lg: Platform.select({
    ios: {
      shadowColor: vynl.ink,
      shadowOffset: { width: 0, height: 20 },
      shadowOpacity: 0.14,
      shadowRadius: 60,
    },
    android: { elevation: 12 },
    default: {},
  })!,
};

// ============================================================================
// Typography — legacy block kept so existing screens compile during migration.
// Use `fonts` + `display`/`body` helpers below for new code.
// ============================================================================
export const typography = {
  h1: { fontSize: 32, fontWeight: '700' as const, lineHeight: 40 },
  h2: { fontSize: 24, fontWeight: '700' as const, lineHeight: 32 },
  h3: { fontSize: 20, fontWeight: '600' as const, lineHeight: 28 },
  body: { fontSize: 16, fontWeight: '400' as const, lineHeight: 24 },
  bodySmall: { fontSize: 14, fontWeight: '400' as const, lineHeight: 20 },
  caption: { fontSize: 12, fontWeight: '400' as const, lineHeight: 16 },
};

// ============================================================================
// Fonts — Fraunces (display) + Geist (body). Italic variants of Fraunces
// used to set off accent characters like the period in "vynl.".
// Font family names must exactly match the keys in useFonts().
// ============================================================================
export const fonts = {
  displayRegular: 'Fraunces_400Regular',
  displayRegularItalic: 'Fraunces_400Regular_Italic',
  displayMedium: 'Fraunces_500Medium',
  displaySemiBold: 'Fraunces_600SemiBold',
  displayBold: 'Fraunces_700Bold',
  displayBoldItalic: 'Fraunces_700Bold_Italic',
  bodyRegular: 'Geist_400Regular',
  bodyMedium: 'Geist_500Medium',
  bodySemiBold: 'Geist_600SemiBold',
} as const;

/** Display text (Fraunces). Pass size + optional italic + weight. */
export const display = (size: number, opts?: { italic?: boolean; weight?: 'regular' | 'medium' | 'semibold' | 'bold' }): TextStyle => {
  const weight = opts?.weight ?? 'regular';
  const italic = opts?.italic ?? false;
  let family: string = fonts.displayRegular;
  if (italic && weight === 'bold') family = fonts.displayBoldItalic;
  else if (italic) family = fonts.displayRegularItalic;
  else if (weight === 'medium') family = fonts.displayMedium;
  else if (weight === 'semibold') family = fonts.displaySemiBold;
  else if (weight === 'bold') family = fonts.displayBold;
  return { fontFamily: family, fontSize: size, lineHeight: Math.round(size * 1.1) };
};

/** Body text (Geist). Pass size + optional weight. */
export const body = (size: number, opts?: { weight?: 'regular' | 'medium' | 'semibold' }): TextStyle => {
  const weight = opts?.weight ?? 'regular';
  const family =
    weight === 'semibold' ? fonts.bodySemiBold : weight === 'medium' ? fonts.bodyMedium : fonts.bodyRegular;
  return { fontFamily: family, fontSize: size, lineHeight: Math.round(size * 1.4) };
};

/** Uppercase tracked kicker — "Friday afternoon", "Featured artist", etc. */
export const kicker = (size: number = 11): TextStyle => ({
  fontFamily: fonts.bodySemiBold,
  fontSize: size,
  letterSpacing: 1.4,
  textTransform: 'uppercase',
});

// ============================================================================
// Layout
// ============================================================================
export const layout = {
  screenWidth: width,
  screenHeight: height,
  miniPlayerHeight: 64,
  tabBarHeight: 80,
  headerHeight: 56,
};

// ============================================================================
// Theme colors (legacy shape used by useThemeStore)
// ============================================================================
export type ThemeColors = typeof colors.light;
export type Theme = 'dark' | 'light';

export const getThemeColors = (theme: Theme): ThemeColors => {
  // Force light — dark mode is disabled in this redesign.
  return colors.light;
};
