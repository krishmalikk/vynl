import React from 'react';
import { Pressable, Text, View, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import { body, vynl, shadow } from '../../theme';

export type PillVariant = 'primary' | 'secondary';

interface PillButtonProps {
  label: string;
  onPress?: () => void;
  variant?: PillVariant;
  leadingIcon?: React.ReactNode;
  trailingIcon?: React.ReactNode;
  fullWidth?: boolean;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
}

export const PillButton: React.FC<PillButtonProps> = ({
  label,
  onPress,
  variant = 'primary',
  leadingIcon,
  trailingIcon,
  fullWidth = false,
  disabled,
  style,
}) => {
  const isPrimary = variant === 'primary';
  const bg = isPrimary ? vynl.ink : vynl.surface;
  const fg = isPrimary ? vynl.surface : vynl.ink;

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.base,
        {
          backgroundColor: bg,
          opacity: pressed ? 0.9 : disabled ? 0.5 : 1,
          alignSelf: fullWidth ? 'stretch' : 'flex-start',
        },
        !isPrimary && shadow.sm,
        style,
      ]}
    >
      {leadingIcon ? <View style={styles.leadingIcon}>{leadingIcon}</View> : null}
      <Text style={[body(15, { weight: 'semibold' }), { color: fg }]}>{label}</Text>
      {trailingIcon ? <View style={styles.trailingIcon}>{trailingIcon}</View> : null}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 999,
    gap: 8,
  },
  leadingIcon: { marginRight: 4 },
  trailingIcon: { marginLeft: 4 },
});
