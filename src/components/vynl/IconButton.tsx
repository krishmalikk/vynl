import React from 'react';
import { Pressable, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import { vynl, shadow } from '../../theme';

export type IconButtonSize = 'sm' | 'md' | 'lg';
export type IconButtonVariant = 'ghost' | 'surface' | 'dark';

const DIM_MAP: Record<IconButtonSize, number> = {
  sm: 34,
  md: 40,
  lg: 52,
};

interface IconButtonProps {
  size?: IconButtonSize | number;
  variant?: IconButtonVariant;
  onPress?: () => void;
  disabled?: boolean;
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}

export const IconButton: React.FC<IconButtonProps> = ({
  size = 'md',
  variant = 'surface',
  onPress,
  disabled,
  children,
  style,
}) => {
  const dimension = typeof size === 'number' ? size : DIM_MAP[size];
  const bg =
    variant === 'ghost'
      ? 'transparent'
      : variant === 'dark'
      ? vynl.ink
      : vynl.surface;

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        {
          width: dimension,
          height: dimension,
          borderRadius: dimension / 2,
          backgroundColor: bg,
          alignItems: 'center',
          justifyContent: 'center',
          opacity: pressed ? 0.85 : 1,
        },
        variant === 'surface' && shadow.sm,
        style,
      ]}
    >
      {children}
    </Pressable>
  );
};
