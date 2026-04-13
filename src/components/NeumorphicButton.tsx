import React, { useState } from 'react';
import {
  TouchableOpacity,
  StyleSheet,
  ViewStyle,
  StyleProp,
} from 'react-native';
import { useThemeStore } from '../store/useThemeStore';
import { neumorphicOutset, neumorphicInset, NeumorphicIntensity } from '../theme/neumorphic';

interface NeumorphicButtonProps {
  children: React.ReactNode;
  onPress: () => void;
  size?: number;
  intensity?: NeumorphicIntensity;
  style?: StyleProp<ViewStyle>;
  disabled?: boolean;
  activeOpacity?: number;
}

export const NeumorphicButton: React.FC<NeumorphicButtonProps> = ({
  children,
  onPress,
  size = 64,
  intensity = 'medium',
  style,
  disabled = false,
  activeOpacity = 0.9,
}) => {
  const { colors } = useThemeStore();
  const [isPressed, setIsPressed] = useState(false);

  const buttonStyles: ViewStyle[] = [
    styles.button,
    {
      width: size,
      height: size,
      borderRadius: size / 2,
      backgroundColor: colors.background,
    },
  ];

  // Apply neumorphic shadow when not pressed
  if (!isPressed) {
    buttonStyles.push(neumorphicOutset(colors.shadowDark || '#A3B1C6', intensity));
  } else {
    // Pressed state - inset appearance
    buttonStyles.push(neumorphicInset());
  }

  return (
    <TouchableOpacity
      style={[buttonStyles, style]}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={activeOpacity}
      onPressIn={() => setIsPressed(true)}
      onPressOut={() => setIsPressed(false)}
    >
      {children}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
