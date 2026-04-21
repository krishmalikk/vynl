import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Disc3 } from 'lucide-react-native';
import { body, display, vynl } from '../../theme';

export const AlbumsTab: React.FC = () => {
  return (
    <View style={styles.empty}>
      <Disc3 size={40} color={vynl.muted} />
      <Text style={[display(20), { color: vynl.ink, marginTop: 16 }]}>
        No albums yet
      </Text>
      <Text style={[body(13), { color: vynl.muted, marginTop: 6, textAlign: 'center' }]}>
        Album collecting is coming soon.
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  empty: { padding: 40, alignItems: 'center' },
});
