import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Dimensions,
  Pressable,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import {
  ChevronLeft,
  MoreHorizontal,
  Play,
  Heart,
  Share2,
} from 'lucide-react-native';
import { body, display, kicker, vynl, shadow, layout } from '../theme';
import { Vinyl, IconButton, PillButton, TrackRow } from '../components/vynl';
import { SectionHeader } from '../components/SectionHeader';
import { getArtist, ArtistSummary } from '../services/search';
import { usePlayerStore } from '../store/usePlayerStore';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const HERO_VINYL = Math.round(SCREEN_WIDTH * 0.78);

export const ArtistDetailScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const route = useRoute();
  const artistName = (route.params as any)?.artistName ?? 'Wiz Khalifa';
  const playTrack = usePlayerStore((s) => s.playTrack);

  const [artist, setArtist] = useState<ArtistSummary | null>(null);
  const [following, setFollowing] = useState(false);

  useEffect(() => {
    (async () => {
      const res = await getArtist(artistName);
      setArtist(res);
    })();
  }, [artistName]);

  if (!artist) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator color={vynl.ink} />
      </View>
    );
  }

  const handlePlayAll = () => {
    if (artist.topTracks.length > 0) {
      playTrack(artist.topTracks[0], artist.topTracks);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Hero */}
        <View style={styles.hero}>
          <LinearGradient
            colors={[vynl.labelAccent, '#4A1E2E', vynl.ink2]}
            style={StyleSheet.absoluteFill}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          />
          {/* Vinyl bleeding off right edge */}
          <View style={styles.heroVinyl}>
            <Vinyl
              size={HERO_VINYL}
              spinning
              spinDurationMs={20000}
              labelColor={vynl.labelCream}
              labelAccentColor={vynl.labelAccent}
            />
          </View>

          <SafeAreaView edges={['top']} style={styles.heroNav}>
            <IconButton size="sm" variant="surface" onPress={() => navigation.goBack()}>
              <ChevronLeft size={18} color={vynl.ink} />
            </IconButton>
            <IconButton size="sm" variant="surface">
              <MoreHorizontal size={18} color={vynl.ink} />
            </IconButton>
          </SafeAreaView>

          <View style={styles.heroContent}>
            <Text style={[kicker(10), { color: 'rgba(255,255,255,0.7)' }]}>
              Featured artist
            </Text>
            <Text
              style={[
                display(42, { italic: true, weight: 'semibold' }),
                { color: vynl.surface, marginTop: 6 },
              ]}
              numberOfLines={2}
            >
              {artist.name}
            </Text>
            <Text style={[body(11), styles.stats]}>
              {artist.monthlyListeners} listeners · {artist.albumCount} albums ·{' '}
              {artist.trackCount} tracks
            </Text>
          </View>
        </View>

        {/* Actions */}
        <View style={styles.actionRow}>
          <PillButton
            label="Play all"
            onPress={handlePlayAll}
            leadingIcon={<Play size={14} color={vynl.surface} fill={vynl.surface} />}
          />
          <PillButton
            label={following ? 'Following' : 'Follow'}
            variant="secondary"
            onPress={() => setFollowing((f) => !f)}
            leadingIcon={
              <Heart
                size={14}
                color={following ? vynl.labelAccent : vynl.ink}
                fill={following ? vynl.labelAccent : 'transparent'}
              />
            }
          />
          <IconButton size="md" variant="surface">
            <Share2 size={16} color={vynl.ink} />
          </IconButton>
        </View>

        {/* Top tracks */}
        <SectionHeader title="Top tracks" onSeeAll={() => {}} />
        <View style={styles.tracksList}>
          {artist.topTracks.slice(0, 5).map((t, i) => (
            <View key={t.id} style={styles.trackCard}>
              <TrackRow
                variant="numbered"
                number={i + 1}
                track={t}
                onPress={() => playTrack(t, artist.topTracks)}
              />
            </View>
          ))}
        </View>

        <View style={{ height: layout.tabBarHeight + layout.miniPlayerHeight + 20 }} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: vynl.bg },
  center: { alignItems: 'center', justifyContent: 'center' },
  scroll: { paddingBottom: 40 },
  hero: {
    height: 360,
    overflow: 'hidden',
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
  },
  heroVinyl: {
    position: 'absolute',
    top: 40,
    right: -HERO_VINYL * 0.35,
  },
  heroNav: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 4,
  },
  heroContent: {
    position: 'absolute',
    left: 24,
    right: 24,
    bottom: 24,
  },
  stats: {
    color: 'rgba(255,255,255,0.7)',
    marginTop: 8,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  tracksList: {
    paddingHorizontal: 12,
    gap: 8,
  },
  trackCard: {
    backgroundColor: vynl.surface,
    borderRadius: 16,
    paddingVertical: 2,
    ...shadow.sm,
  },
});
