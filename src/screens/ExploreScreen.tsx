import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  FlatList,
  Pressable,
  TextInput,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Search, Play, MoreHorizontal } from 'lucide-react-native';
import { body, display, vynl, layout } from '../theme';
import { Vinyl, Chip } from '../components/vynl';
import { usePlayerStore } from '../store/usePlayerStore';
import { searchTracks, getTrendingTracks } from '../services/search';
import { Track } from '../types';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = (SCREEN_WIDTH - 56) / 2;
const DISC_SIZE = Math.round(CARD_WIDTH * 0.85);

const CATEGORIES = [
  { id: 'all', name: 'All', count: 20 },
  { id: 'trending', name: 'Trending', count: 10 },
  { id: 'new', name: 'New', count: 8 },
  { id: 'chill', name: 'Chill' },
] as const;

const LABEL_GRADIENTS: Array<[string, string, string]> = [
  [vynl.labelCream, vynl.labelAccent, vynl.ink],
  ['#F4C542', '#B8751C', vynl.ink],
  ['#7DBE9A', '#2A5E4A', vynl.surface],
  ['#5E7DB3', '#2A3D5E', vynl.surface],
];

export const ExploreScreen: React.FC = () => {
  const playTrack = usePlayerStore((s) => s.playTrack);
  const [tracks, setTracks] = useState<Track[]>([]);
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const [query, setQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [category, setCategory] = useState<string>('all');

  const loadTrending = useCallback(async () => {
    try {
      const data = await getTrendingTracks();
      setTracks(data);
    } catch (e) {
      console.warn('explore load failed', e);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    loadTrending();
  }, [loadTrending]);

  // Debounced search
  useEffect(() => {
    if (!query.trim()) {
      loadTrending();
      return;
    }
    setSearching(true);
    const t = setTimeout(async () => {
      try {
        const res = await searchTracks(query);
        setTracks(res.tracks);
      } catch (e) {
        console.warn('search failed', e);
      }
      setSearching(false);
    }, 400);
    return () => clearTimeout(t);
  }, [query, loadTrending]);

  const handlePlay = useCallback(
    (track: Track) => playTrack(track, tracks),
    [playTrack, tracks]
  );

  const filtered = useMemo(() => tracks, [tracks]);

  const renderCard = useCallback(
    ({ item, index }: { item: Track; index: number }) => {
      const [cream, accent, textColor] =
        LABEL_GRADIENTS[index % LABEL_GRADIENTS.length];
      return (
        <View style={[styles.card, { width: CARD_WIDTH }]}>
          <Pressable style={styles.discWrap} onPress={() => handlePlay(item)}>
            <Vinyl
              size={DISC_SIZE}
              labelColor={cream}
              labelAccentColor={accent}
              labelTextColor={textColor}
            />
            <View style={styles.playOverlay}>
              <Play size={22} color={vynl.surface} fill={vynl.surface} />
            </View>
          </Pressable>
          <View style={styles.cardInfo}>
            <View style={{ flex: 1, minWidth: 0 }}>
              <Text
                style={[body(11), { color: vynl.muted }]}
                numberOfLines={1}
              >
                {item.artist}
              </Text>
              <Text
                style={[body(13, { weight: 'semibold' }), { color: vynl.ink, marginTop: 2 }]}
                numberOfLines={2}
              >
                {item.title.split(' - ')[0].split('(')[0].trim()}
              </Text>
            </View>
            <Pressable style={styles.menuBtn}>
              <MoreHorizontal size={16} color={vynl.muted} />
            </Pressable>
          </View>
        </View>
      );
    },
    [handlePlay]
  );

  return (
    <View style={styles.container}>
      {/* Dark hero card with bottom rounding */}
      <SafeAreaView style={styles.hero} edges={['top']}>
        <View style={styles.heroTopRow}>
          <View style={{ flex: 1 }} />
          <Pressable
            style={[
              styles.searchBtn,
              showSearch && { backgroundColor: 'rgba(255,255,255,0.26)' },
            ]}
            onPress={() => setShowSearch((v) => !v)}
          >
            <Search size={18} color={vynl.surface} />
          </Pressable>
        </View>
        <Text style={[display(40, { weight: 'semibold' }), styles.heroTitle]}>
          Explore{'\n'}Tracks
          <Text style={display(40, { italic: true, weight: 'semibold' })
            }>
            <Text style={{ color: vynl.labelAccent }}>.</Text>
          </Text>
        </Text>
        <Text style={[body(13), styles.heroSub]}>
          Crate-dig through new & old cuts.
        </Text>
        {showSearch ? (
          <View style={styles.searchInputWrap}>
            <Search size={16} color="rgba(255,255,255,0.6)" />
            <TextInput
              style={[body(14), styles.searchInput]}
              placeholder="Search tracks"
              placeholderTextColor="rgba(255,255,255,0.5)"
              value={query}
              onChangeText={setQuery}
              autoFocus
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>
        ) : null}
      </SafeAreaView>

      {/* Category chips */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.chipRow}
      >
        {CATEGORIES.map((c) => (
          <Chip
            key={c.id}
            label={c.name}
            active={category === c.id}
            count={'count' in c ? c.count : undefined}
            onPress={() => setCategory(c.id)}
          />
        ))}
      </ScrollView>

      {loading || searching ? (
        <View style={styles.center}>
          <ActivityIndicator color={vynl.ink} />
        </View>
      ) : (
        <FlatList
          data={filtered}
          renderItem={renderCard}
          keyExtractor={(t) => t.id}
          numColumns={2}
          columnWrapperStyle={{ paddingHorizontal: 20, gap: 16 }}
          contentContainerStyle={{
            paddingTop: 8,
            paddingBottom: layout.tabBarHeight + layout.miniPlayerHeight + 20,
            gap: 20,
          }}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: vynl.bg },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  hero: {
    backgroundColor: vynl.ink,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    paddingBottom: 22,
  },
  heroTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 4,
  },
  searchBtn: {
    width: 34,
    height: 34,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroTitle: {
    color: vynl.surface,
    paddingHorizontal: 20,
    paddingTop: 18,
    lineHeight: 46,
  },
  heroSub: {
    color: 'rgba(255,255,255,0.55)',
    paddingHorizontal: 20,
    paddingTop: 6,
  },
  searchInputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginHorizontal: 20,
    marginTop: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.12)',
  },
  searchInput: { flex: 1, color: vynl.surface, padding: 0 },
  chipRow: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    gap: 10,
    alignItems: 'center',
  },
  card: {
    gap: 8,
  },
  discWrap: {
    width: DISC_SIZE,
    height: DISC_SIZE,
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
  },
  playOverlay: {
    position: 'absolute',
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(11,11,14,0.72)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardInfo: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingHorizontal: 6,
    gap: 4,
  },
  menuBtn: { padding: 2, marginTop: 2 },
});
