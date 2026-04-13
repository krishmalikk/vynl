import { Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');

export const colors = {
  // Dark theme
  dark: {
    background: '#0a0a0a',
    surface: '#141414',
    surfaceLight: '#1f1f1f',
    primary: '#1DB954',        // Spotify-like green accent
    primaryDark: '#158a3d',
    secondary: '#535353',
    text: '#ffffff',
    textSecondary: '#b3b3b3',
    textMuted: '#6a6a6a',
    border: '#282828',
    error: '#ff4444',
    warning: '#ffaa00',
    overlay: 'rgba(0, 0, 0, 0.7)',
    // Shadow colors for dark theme
    shadowLight: '#1f1f1f',
    shadowDark: '#000000',
  },
  // Light theme - Neumorphic design with lavender
  light: {
    background: '#F0EEF6',        // Light lavender/gray
    surface: '#F0EEF6',           // Same as background for flat look
    surfaceLight: '#FFFFFF',      // Pure white for raised elements
    primary: '#2D3748',           // Dark grey accent (minimal)
    primaryDark: '#1A202C',
    secondary: '#A0AEC0',
    text: '#1a1a1a',              // Near black for primary text
    textSecondary: '#888888',     // Medium grey for secondary
    textMuted: '#A0AEC0',
    border: 'transparent',        // No borders in neumorphic design
    error: '#E53E3E',
    warning: '#ED8936',
    overlay: 'rgba(240, 238, 246, 0.9)',
    // Neumorphic shadow colors
    shadowLight: '#FFFFFF',
    shadowDark: '#A3B1C6',
  },
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const borderRadius = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  full: 9999,
};

export const typography = {
  h1: {
    fontSize: 32,
    fontWeight: '700' as const,
    lineHeight: 40,
  },
  h2: {
    fontSize: 24,
    fontWeight: '700' as const,
    lineHeight: 32,
  },
  h3: {
    fontSize: 20,
    fontWeight: '600' as const,
    lineHeight: 28,
  },
  body: {
    fontSize: 16,
    fontWeight: '400' as const,
    lineHeight: 24,
  },
  bodySmall: {
    fontSize: 14,
    fontWeight: '400' as const,
    lineHeight: 20,
  },
  caption: {
    fontSize: 12,
    fontWeight: '400' as const,
    lineHeight: 16,
  },
};

export const layout = {
  screenWidth: width,
  screenHeight: height,
  miniPlayerHeight: 64,
  tabBarHeight: 80,
  headerHeight: 56,
};

// Default to dark theme
export type ThemeColors = typeof colors.dark;
export type Theme = 'dark' | 'light';

export const getThemeColors = (theme: Theme): ThemeColors => {
  return theme === 'dark' ? colors.dark : colors.light;
};
