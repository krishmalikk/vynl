import React, { useMemo } from 'react';
import { View, Text, FlatList, Pressable, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { ChevronRight, Users } from 'lucide-react-native';
import { body, display, vynl, shadow, layout } from '../../theme';
import { Vinyl } from '../../components/vynl';
import { useLibrary } from '../../hooks/useLibrary';

export const ArtistsTab: React.FC = () => {
  const navigation = useNavigation<any>();
  const { tracks } = useLibrary();

  const artists = useMemo(() => {
    const counts = new Map<string, number>();
    for (const t of tracks) {
      counts.set(t.artist, (counts.get(t.artist) ?? 0) + 1);
    }
    return [...counts.entries()].map(([name, count]) => ({ name, count }));
  }, [tracks]);

  if (artists.length === 0) {
    return (
      <View style={styles.empty}>
        <Users size={40} color={vynl.muted} />
        <Text style={[display(20), { color: vynl.ink, marginTop: 16 }]}>
          No artists yet
        </Text>
        <Text
          style={[body(13), { color: vynl.muted, marginTop: 6, textAlign: 'center' }]}
        >
          Save a track and its artist will show up here.
        </Text>
      </View>
    );
  }

  return (
    <FlatList
      data={artists}
      keyExtractor={(a) => a.name}
      renderItem={({ item }) => (
        <Pressable
          style={styles.row}
          onPress={() =>
            navigation.navigate('ArtistDetail', { artistName: item.name })
          }
        >
          <Vinyl size={44} />
          <View style={styles.info}>
            <Text style={[body(14, { weight: 'semibold' }), { color: vynl.ink }]}>
              {item.name}
            </Text>
            <Text style={[body(11), { color: vynl.muted, marginTop: 2 }]}>
              Artist · {item.count} {item.count === 1 ? 'track' : 'tracks'}
            </Text>
          </View>
          <ChevronRight size={18} color={vynl.muted} />
        </Pressable>
      )}
      contentContainerStyle={{
        paddingHorizontal: 20,
        paddingBottom: layout.tabBarHeight + layout.miniPlayerHeight + 20,
        gap: 10,
      }}
    />
  );
};

const styles = StyleSheet.create({
  empty: { padding: 40, alignItems: 'center' },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: vynl.surface,
    borderRadius: 18,
    padding: 12,
    ...shadow.sm,
  },
  info: { flex: 1, minWidth: 0 },
});
