import React from 'react';
import { Pressable, Text, View, StyleSheet } from 'react-native';
import { body, vynl } from '../../theme';

interface SegmentedTabsProps<T extends string> {
  tabs: readonly T[];
  value: T;
  onChange: (value: T) => void;
}

/**
 * Flat segmented-control-style tabs with a 2px underline beneath the active
 * label. The underline sits inside each tab cell so it's always centered on
 * the text — no `onLayout` measurement required (avoids a React 19 / RN 0.81
 * pooled-event issue).
 */
export function SegmentedTabs<T extends string>({
  tabs,
  value,
  onChange,
}: SegmentedTabsProps<T>) {
  return (
    <View style={styles.container}>
      <View style={styles.row}>
        {tabs.map((t) => {
          const active = t === value;
          return (
            <Pressable
              key={t}
              onPress={() => onChange(t)}
              style={styles.tab}
              hitSlop={8}
            >
              <Text
                style={[
                  body(14, { weight: active ? 'semibold' : 'regular' }),
                  { color: active ? vynl.ink : vynl.muted },
                ]}
              >
                {t}
              </Text>
              <View
                style={[
                  styles.underline,
                  { backgroundColor: active ? vynl.ink : 'transparent' },
                ]}
              />
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(11,11,14,0.08)',
  },
  row: {
    flexDirection: 'row',
    gap: 20,
  },
  tab: {
    paddingTop: 12,
    paddingBottom: 10,
    alignItems: 'center',
  },
  underline: {
    height: 2,
    width: '100%',
    marginTop: 8,
    borderRadius: 2,
  },
});
