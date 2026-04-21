import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { body, display, kicker, vynl } from '../theme';

interface SectionHeaderProps {
  title: string;
  titleItalicSuffix?: string;
  kickerText?: string;
  onSeeAll?: () => void;
}

export const SectionHeader: React.FC<SectionHeaderProps> = ({
  title,
  titleItalicSuffix,
  kickerText,
  onSeeAll,
}) => {
  return (
    <View style={styles.container}>
      <View style={{ flex: 1 }}>
        {kickerText ? (
          <Text style={[kicker(10), { color: vynl.muted, marginBottom: 6 }]}>
            {kickerText}
          </Text>
        ) : null}
        <Text style={[display(20), { color: vynl.ink }]}>
          {title}
          {titleItalicSuffix ? (
            <Text style={[display(20, { italic: true }), { color: vynl.labelAccent }]}>
              {' '}
              {titleItalicSuffix}
            </Text>
          ) : null}
        </Text>
      </View>
      {onSeeAll ? (
        <Pressable onPress={onSeeAll}>
          <Text style={[body(13), { color: vynl.inkSoft }]}>See all</Text>
        </Pressable>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
});
