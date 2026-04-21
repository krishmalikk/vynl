import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Search, Plus } from 'lucide-react-native';
import { body, display, vynl } from '../theme';
import { SegmentedTabs, IconButton } from '../components/vynl';
import { useLibrary } from '../hooks/useLibrary';
import { usePlaylists } from '../hooks/usePlaylists';
import { PlaylistsTab } from './library/PlaylistsTab';
import { TracksTab } from './library/TracksTab';
import { ArtistsTab } from './library/ArtistsTab';
import { AlbumsTab } from './library/AlbumsTab';

const TABS = ['Playlists', 'Tracks', 'Artists', 'Albums'] as const;
type TabName = (typeof TABS)[number];

export const LibraryScreen: React.FC = () => {
  const [tab, setTab] = useState<TabName>('Playlists');
  const { tracks } = useLibrary();
  const { playlists } = usePlaylists();

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <View style={{ flex: 1 }}>
          <Text style={[display(40, { weight: 'semibold' }), { color: vynl.ink }]}>
            Library
            <Text
              style={[
                display(40, { italic: true, weight: 'semibold' }),
                { color: vynl.labelAccent },
              ]}
            >
              .
            </Text>
          </Text>
          <Text style={[body(13), { color: vynl.muted, marginTop: 4 }]}>
            {tracks.length} saved · {playlists.length}{' '}
            {playlists.length === 1 ? 'playlist' : 'playlists'}
          </Text>
        </View>
        <View style={{ flexDirection: 'row', gap: 8 }}>
          <IconButton size="sm" variant="surface">
            <Search size={16} color={vynl.ink} />
          </IconButton>
          <IconButton size="sm" variant="surface">
            <Plus size={16} color={vynl.ink} />
          </IconButton>
        </View>
      </View>

      <SegmentedTabs tabs={TABS} value={tab} onChange={setTab} />

      <View style={styles.content}>
        {tab === 'Playlists' && <PlaylistsTab />}
        {tab === 'Tracks' && <TracksTab />}
        {tab === 'Artists' && <ArtistsTab />}
        {tab === 'Albums' && <AlbumsTab />}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: vynl.bg },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 16,
    gap: 12,
  },
  content: { flex: 1 },
});
