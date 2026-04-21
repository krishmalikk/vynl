import React from 'react';
import { Pressable, Text, View, StyleSheet } from 'react-native';
import { fonts, vynl } from '../../theme';

interface ChipProps {
  label: string;
  active?: boolean;
  count?: number;
  onPress?: () => void;
}

export const Chip: React.FC<ChipProps> = ({ label, active, count, onPress }) => {
  const textColor = active ? vynl.surface : vynl.ink;
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.base,
        {
          backgroundColor: active ? vynl.ink : 'transparent',
          borderColor: active ? vynl.ink : vynl.muted,
          opacity: pressed ? 0.8 : 1,
        },
      ]}
    >
      <Text
        allowFontScaling={false}
        numberOfLines={1}
        style={[styles.label, { color: textColor }]}
      >
        {label}
      </Text>
      {typeof count === 'number' ? (
        <View
          style={[
            styles.countBadge,
            {
              backgroundColor: active ? 'rgba(255,255,255,0.22)' : vynl.surface,
            },
          ]}
        >
          <Text
            allowFontScaling={false}
            style={[styles.countText, { color: textColor }]}
          >
            {count}
          </Text>
        </View>
      ) : null}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 999,
    paddingLeft: 16,
    paddingRight: 6,
    paddingVertical: 6,
    minHeight: 34,
  },
  label: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 13,
    marginRight: 8,
  },
  countBadge: {
    minWidth: 28,
    height: 22,
    paddingHorizontal: 6,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 999,
  },
  countText: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 11,
  },
});
