import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  StyleSheet,
  ActivityIndicator,
  FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Pause, Play } from 'lucide-react-native';
import { body, display, kicker, vynl, layout } from '../theme';
import { Vinyl, PulseDot, TrackRow, IconButton } from '../components/vynl';
import { SectionHeader } from '../components/SectionHeader';
import { useThemeStore } from '../store/useThemeStore';
import { usePlayerStore } from '../store/usePlayerStore';
import { useNowPlaying, usePlaybackControls } from '../hooks/useTrackPlayer';
import { useLibrary } from '../hooks/useLibrary';
import { useAppStore } from '../store/useAppStore';
import { getTrendingTracks } from '../services/search';
import { Track } from '../types';

const DAY_LABELS = [
  'Sunday morning',
  'Monday morning',
  'Tuesday morning',
  'Wednesday morning',
  'Thursday morning',
  'Friday morning',
  'Saturday morning',
];
const timeKicker = () => {
  const now = new Date();
  const day = DAY_LABELS[now.getDay()];
  const hour = now.getHours();
  const period =
    hour < 5 ? 'night' : hour < 12 ? 'morning' : hour < 17 ? 'afternoon' : 'evening';
  return day.replace('morning', period);
};

const displayName = (email: string | null) => {
  if (!email) return 'friend';
  const name = email.split('@')[0];
  return name.charAt(0).toUpperCase() + name.slice(1);
};

const cleanTitle = (title: string) =>
  title.split(' - ')[0].split('(')[0].trim();

export const HomeScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const playTrack = usePlayerStore((s) => s.playTrack);
  const { currentTrack, isPlaying, progress } = useNowPlaying();
  const { togglePlayPause } = usePlaybackControls();
  const { tracks: libraryTracks } = useLibrary();
  const email = useAppStore((s) => s.email);

  const [trending, setTrending] = useState<Track[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const data = await getTrendingTracks();
        setTrending(data);
      } catch (e) {
        console.warn('trending load failed', e);
      }
      setLoading(false);
    })();
  }, []);

  const handlePlay = useCallback(
    (track: Track) => playTrack(track, trending),
    [playTrack, trending]
  );

  const renderTrendingCard = useCallback(
    ({ item, index }: { item: Track; index: number }) => (
      <Pressable style={styles.trendingCard} onPress={() => handlePlay(item)}>
        <Vinyl
          size="md"
          labelText={cleanTitle(item.title)}
          labelColor={LABEL_GRADIENTS[index % LABEL_GRADIENTS.length][0]}
          labelAccentColor={LABEL_GRADIENTS[index % LABEL_GRADIENTS.length][1]}
          labelTextColor={LABEL_GRADIENTS[index % LABEL_GRADIENTS.length][2]}
        />
        <Text
          style={[body(13, { weight: 'semibold' }), { color: vynl.ink, marginTop: 10 }]}
          numberOfLines={1}
        >
          {cleanTitle(item.title)}
        </Text>
        <Text
          style={[body(11), { color: vynl.muted, marginTop: 2 }]}
          numberOfLines={1}
        >
          {item.artist}
        </Text>
      </Pressable>
    ),
    [handlePlay]
  );

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, styles.center]} edges={['top']}>
        <ActivityIndicator color={vynl.ink} />
      </SafeAreaView>
    );
  }

  return (
    <View style={styles.container}>
      <SafeAreaView style={{ flex: 1 }} edges={['top']}>
        <ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
        >
          {/* Greeting */}
          <View style={styles.greetingRow}>
            <View style={{ flex: 1 }}>
              <Text style={[kicker(10), { color: vynl.muted }]}>{timeKicker()}</Text>
              <Text style={[display(36, { weight: 'semibold' }), styles.hello]}>
                Hey,{' '}
                <Text style={display(36, { italic: true, weight: 'semibold' })}>
                  {displayName(email)}
                </Text>
              </Text>
            </View>
            <Pressable
              style={styles.avatar}
              onPress={() => navigation.navigate('Settings')}
            >
              <Text
                style={[
                  display(18, { italic: true, weight: 'bold' }),
                  { color: vynl.surface },
                ]}
              >
                {displayName(email).charAt(0)}
              </Text>
            </Pressable>
          </View>

          {/* Now spinning */}
          {currentTrack ? (
            <Pressable
              style={styles.nowSpinning}
              onPress={() => navigation.navigate('NowPlaying')}
            >
              <View style={styles.nsHeader}>
                <PulseDot color={vynl.pulseGreen} />
                <Text
                  style={[
                    kicker(9),
                    { color: 'rgba(255,255,255,0.7)', marginLeft: 6 },
                  ]}
                >
                  Now spinning
                </Text>
              </View>
              <View style={styles.nsRow}>
                <Vinyl size="sm" spinning={isPlaying} labelText={cleanTitle(currentTrack.title)} />
                <View style={styles.nsInfo}>
                  <Text
                    style={[display(19), { color: vynl.surface }]}
                    numberOfLines={1}
                  >
                    {cleanTitle(currentTrack.title)}
                  </Text>
                  <Text
                    style={[
                      body(12),
                      { color: 'rgba(255,255,255,0.6)', marginTop: 4 },
                    ]}
                    numberOfLines={1}
                  >
                    {currentTrack.artist}
                  </Text>
                  <View style={styles.nsProgress}>
                    <View
                      style={[
                        styles.nsProgressFill,
                        { width: `${Math.max(3, progress * 100)}%` },
                      ]}
                    />
                  </View>
                </View>
                <Pressable
                  style={styles.nsPlayButton}
                  onPress={(e) => {
                    e.stopPropagation();
                    togglePlayPause();
                  }}
                >
                  {isPlaying ? (
                    <Pause size={16} color={vynl.ink} fill={vynl.ink} />
                  ) : (
                    <Play
                      size={16}
                      color={vynl.ink}
                      fill={vynl.ink}
                      style={{ marginLeft: 2 }}
                    />
                  )}
                </Pressable>
              </View>
            </Pressable>
          ) : null}

          {/* Trending */}
          <View style={{ marginTop: 16 }}>
            <SectionHeader
              title="Trending"
              titleItalicSuffix="this week"
              onSeeAll={() => navigation.navigate('Explore')}
            />
            <FlatList
              data={trending.slice(0, 8)}
              renderItem={renderTrendingCard}
              keyExtractor={(item) => item.id}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.trendingList}
            />
          </View>

          {/* Recently played */}
          <View style={{ marginTop: 8 }}>
            <View style={{ paddingHorizontal: 20, paddingTop: 12, paddingBottom: 4 }}>
              <Text style={[kicker(11), { color: vynl.muted }]}>Recently played</Text>
            </View>
            {libraryTracks.length === 0 ? (
              <Text
                style={[
                  body(13),
                  { color: vynl.muted, paddingHorizontal: 20, paddingVertical: 8 },
                ]}
              >
                Tracks you save will show up here.
              </Text>
            ) : (
              libraryTracks.slice(0, 5).map((track) => (
                <TrackRow
                  key={track.id}
                  track={track}
                  onPress={() => playTrack(track, libraryTracks)}
                />
              ))
            )}
          </View>

          <View style={{ height: layout.tabBarHeight + layout.miniPlayerHeight + 20 }} />
        </ScrollView>
      </SafeAreaView>
    </View>
  );
};

// Gradient palette variations for trending vinyl labels: [cream, accent, textColor]
const LABEL_GRADIENTS: Array<[string, string, string]> = [
  ['#F4C542', '#B8751C', vynl.ink],
  [vynl.labelCream, vynl.labelAccent, vynl.surface],
  ['#7DBE9A', '#2A5E4A', vynl.surface],
  ['#5E7DB3', '#2A3D5E', vynl.surface],
  ['#E8BBA2', '#7A3B1E', vynl.surface],
  ['#C9B4E8', '#5E3A8F', vynl.surface],
];

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: vynl.bg },
  center: { justifyContent: 'center', alignItems: 'center' },
  scroll: { paddingTop: 8 },
  greetingRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 20,
    paddingBottom: 18,
  },
  hello: { color: vynl.ink, marginTop: 2 },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: vynl.labelAccent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  nowSpinning: {
    marginHorizontal: 20,
    backgroundColor: vynl.ink,
    borderRadius: 24,
    padding: 18,
  },
  nsHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 14 },
  nsRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  nsInfo: { flex: 1, minWidth: 0 },
  nsProgress: {
    height: 2,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 1,
    overflow: 'hidden',
    marginTop: 10,
  },
  nsProgressFill: { height: '100%', backgroundColor: vynl.surface },
  nsPlayButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: vynl.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  trendingList: { paddingHorizontal: 20, gap: 16 },
  trendingCard: { width: 140 },
});
