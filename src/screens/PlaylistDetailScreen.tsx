import React from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  Alert,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import DraggableFlatList, {
  RenderItemParams,
  ScaleDecorator,
} from 'react-native-draggable-flatlist';
import { Swipeable } from 'react-native-gesture-handler';
import { LinearGradient } from 'expo-linear-gradient';
import {
  ChevronLeft,
  Heart,
  MoreHorizontal,
  Shuffle,
  Play,
  Plus,
  Trash2,
} from 'lucide-react-native';
import { body, display, kicker, vynl, shadow, layout } from '../theme';
import { Vinyl, IconButton, TrackRow, EqBars } from '../components/vynl';
import { usePlaylistDetail } from '../hooks/usePlaylists';
import { usePlayerStore } from '../store/usePlayerStore';
import { StoredTrack } from '../types';

type RouteParams = { PlaylistDetail: { playlistId: string } };
const { width: SCREEN_WIDTH } = Dimensions.get('window');
const HERO_SIZE = Math.min(220, SCREEN_WIDTH * 0.55);

export const PlaylistDetailScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<RouteProp<RouteParams, 'PlaylistDetail'>>();
  const { playlistId } = route.params;

  const { playlist, tracks, removeTrack, reorderTracks } = usePlaylistDetail(playlistId);
  const { playTrack, currentTrack } = usePlayerStore();

  const handlePlayAll = () => {
    if (tracks.length > 0) playTrack(tracks[0], tracks);
  };
  const handleShuffle = () => {
    if (tracks.length === 0) return;
    const shuffled = [...tracks].sort(() => Math.random() - 0.5);
    playTrack(shuffled[0], shuffled);
  };

  const confirmRemove = (trackId: string) => {
    Alert.alert('Remove track', 'Remove this track from the playlist?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Remove', style: 'destructive', onPress: () => removeTrack(trackId) },
    ]);
  };

  const renderItem = ({ item, drag, isActive, getIndex }: RenderItemParams<StoredTrack>) => {
    const idx = (getIndex?.() ?? 0) + 1;
    const isCurrent = currentTrack?.id === item.id;
    return (
      <ScaleDecorator>
        <Swipeable
          renderRightActions={() => (
            <Pressable style={styles.deleteBtn} onPress={() => confirmRemove(item.id)}>
              <Trash2 size={18} color={vynl.surface} />
            </Pressable>
          )}
        >
          <Pressable
            onPress={() => playTrack(item, tracks)}
            onLongPress={drag}
            disabled={isActive}
          >
            {isCurrent ? (
              <View style={styles.currentRow}>
                <View style={styles.eqLead}>
                  <EqBars />
                </View>
                <Vinyl size="xs" spinning />
                <View style={{ flex: 1, minWidth: 0, marginLeft: 10 }}>
                  <Text
                    style={[body(14, { weight: 'semibold' }), { color: vynl.ink }]}
                    numberOfLines={1}
                  >
                    {cleanTitle(item.title)}
                  </Text>
                  <Text style={[body(11), { color: vynl.muted, marginTop: 2 }]} numberOfLines={1}>
                    {item.artist}
                  </Text>
                </View>
                <Heart size={16} color={vynl.labelAccent} fill={vynl.labelAccent} />
              </View>
            ) : (
              <TrackRow variant="numbered" number={idx} track={item} />
            )}
          </Pressable>
        </Swipeable>
      </ScaleDecorator>
    );
  };

  return (
    <View style={styles.container}>
      <SafeAreaView edges={['top']} style={{ flex: 1 }}>
        {/* Nav */}
        <View style={styles.nav}>
          <IconButton size="sm" variant="surface" onPress={() => navigation.goBack()}>
            <ChevronLeft size={18} color={vynl.ink} />
          </IconButton>
          <View style={{ flexDirection: 'row', gap: 8 }}>
            <IconButton size="sm" variant="surface">
              <Heart size={16} color={vynl.ink} />
            </IconButton>
            <IconButton size="sm" variant="surface">
              <MoreHorizontal size={16} color={vynl.ink} />
            </IconButton>
          </View>
        </View>

        <DraggableFlatList
          data={tracks}
          keyExtractor={(t) => t.id}
          renderItem={renderItem}
          onDragEnd={({ from, to }) => reorderTracks(from, to)}
          ListHeaderComponent={
            <View style={styles.heroWrap}>
              {/* Stacked art */}
              <View style={styles.stack}>
                {/* Back vinyl */}
                <View
                  style={[
                    styles.discBehind,
                    { width: HERO_SIZE, height: HERO_SIZE },
                  ]}
                >
                  <Vinyl size={HERO_SIZE} labelColor={vynl.labelCream} labelAccentColor={vynl.labelAccent} />
                </View>
                {/* Front sleeve */}
                <View
                  style={[
                    styles.sleeve,
                    {
                      width: HERO_SIZE,
                      height: HERO_SIZE,
                      borderRadius: 24,
                    },
                  ]}
                >
                  <LinearGradient
                    colors={['#E8DFC9', '#D4A574', '#8B5E3C']}
                    style={StyleSheet.absoluteFill}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                  />
                  <Text
                    style={[
                      display(28, { italic: true, weight: 'semibold' }),
                      { color: vynl.ink },
                    ]}
                    numberOfLines={3}
                  >
                    {playlist?.name ?? 'Playlist'}
                  </Text>
                </View>
              </View>

              <Text style={[kicker(10), { color: vynl.muted, marginTop: 20 }]}>
                Playlist · {tracks.length} {tracks.length === 1 ? 'track' : 'tracks'}
              </Text>
              <Text style={[display(28, { weight: 'semibold' }), { color: vynl.ink, marginTop: 6 }]}>
                {playlist?.name ?? 'Playlist'}
              </Text>
              <Text style={[body(13), { color: vynl.inkSoft, marginTop: 6 }]} numberOfLines={2}>
                A collection of records worth spinning more than once.
              </Text>

              {/* Controls */}
              <View style={styles.controlRow}>
                <IconButton size="md" variant="surface" onPress={handleShuffle}>
                  <Shuffle size={18} color={vynl.ink} />
                </IconButton>
                <IconButton
                  size="lg"
                  variant="dark"
                  onPress={handlePlayAll}
                  style={{ marginHorizontal: 4 }}
                >
                  <Play size={22} color={vynl.surface} fill={vynl.surface} style={{ marginLeft: 2 }} />
                </IconButton>
                <IconButton size="md" variant="surface">
                  <Plus size={18} color={vynl.ink} />
                </IconButton>
              </View>
            </View>
          }
          ListEmptyComponent={
            <Text style={[body(13), { color: vynl.muted, textAlign: 'center', paddingVertical: 40 }]}>
              No tracks yet.
            </Text>
          }
          contentContainerStyle={{
            paddingHorizontal: 12,
            paddingBottom: layout.tabBarHeight + layout.miniPlayerHeight + 20,
          }}
        />
      </SafeAreaView>
    </View>
  );
};

const cleanTitle = (s: string) => s.split(' - ')[0].split('(')[0].trim();

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: vynl.bg },
  nav: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 8,
  },
  heroWrap: { alignItems: 'center', paddingTop: 16, paddingHorizontal: 8 },
  stack: {
    width: HERO_SIZE + 30,
    height: HERO_SIZE + 10,
    position: 'relative',
  },
  discBehind: {
    position: 'absolute',
    top: 10,
    left: 30,
    ...shadow.md,
  },
  sleeve: {
    position: 'absolute',
    top: 0,
    left: 0,
    overflow: 'hidden',
    padding: 14,
    justifyContent: 'flex-end',
    ...shadow.md,
  },
  controlRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginTop: 24,
    marginBottom: 12,
  },
  currentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 8,
    marginVertical: 4,
    paddingVertical: 10,
    paddingHorizontal: 10,
    backgroundColor: vynl.surface,
    borderRadius: 16,
    ...shadow.sm,
  },
  eqLead: { width: 24, alignItems: 'center', marginRight: 6 },
  deleteBtn: {
    width: 72,
    backgroundColor: vynl.labelAccent,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 6,
    borderRadius: 14,
  },
});
