import { ViewStyle, Platform } from 'react-native';

export type NeumorphicIntensity = 'light' | 'medium' | 'heavy';

interface ShadowConfig {
  offset: number;
  radius: number;
  opacity: number;
}

const INTENSITY_CONFIG: Record<NeumorphicIntensity, ShadowConfig> = {
  light: { offset: 3, radius: 6, opacity: 0.3 },
  medium: { offset: 6, radius: 12, opacity: 0.4 },
  heavy: { offset: 10, radius: 20, opacity: 0.5 },
};

/**
 * Creates a raised (convex) neumorphic shadow effect
 * Note: React Native doesn't support multiple shadows natively,
 * so we use the dark shadow. For true neumorphism, use NeumorphicView component.
 */
export const neumorphicOutset = (
  shadowDark: string,
  intensity: NeumorphicIntensity = 'medium'
): ViewStyle => {
  const config = INTENSITY_CONFIG[intensity];

  return Platform.select({
    ios: {
      shadowColor: shadowDark,
      shadowOffset: { width: config.offset, height: config.offset },
      shadowOpacity: config.opacity,
      shadowRadius: config.radius,
    },
    android: {
      elevation: config.offset * 2,
    },
  }) as ViewStyle;
};

/**
 * Creates a pressed (inset) neumorphic effect
 * Simulated with border since RN doesn't support inset shadows
 */
export const neumorphicInset = (
  borderColor: string = 'rgba(163, 177, 198, 0.4)'
): ViewStyle => {
  return {
    borderWidth: 1,
    borderColor,
  };
};

/**
 * Combines neumorphic shadow with background color
 */
export const neumorphicContainer = (
  backgroundColor: string,
  shadowDark: string,
  intensity: NeumorphicIntensity = 'medium',
  borderRadius: number = 16
): ViewStyle => {
  return {
    backgroundColor,
    borderRadius,
    ...neumorphicOutset(shadowDark, intensity),
  };
};

/**
 * Neumorphic button style - raised appearance
 */
export const neumorphicButton = (
  backgroundColor: string,
  shadowDark: string,
  size: number = 64
): ViewStyle => {
  return {
    width: size,
    height: size,
    borderRadius: size / 2,
    backgroundColor,
    alignItems: 'center',
    justifyContent: 'center',
    ...neumorphicOutset(shadowDark, 'medium'),
  };
};

/**
 * Neumorphic pressed button style
 */
export const neumorphicButtonPressed = (
  backgroundColor: string,
  size: number = 64
): ViewStyle => {
  return {
    width: size,
    height: size,
    borderRadius: size / 2,
    backgroundColor,
    alignItems: 'center',
    justifyContent: 'center',
    ...neumorphicInset(),
  };
};
