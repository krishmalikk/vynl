import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useThemeStore } from '../store/useThemeStore';
import { usePlayerStore } from '../store/usePlayerStore';
import { WheelCarousel } from '../components/WheelCarousel';
import { getTrendingTracks } from '../services/search';
import { Track } from '../types';
import { spacing, typography } from '../theme';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

export const HomeScreen: React.FC = () => {
  const { colors } = useThemeStore();
  const { playTrack, isPlaying } = usePlayerStore();

  const [tracks, setTracks] = useState<Track[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadData = async () => {
    try {
      const trendingData = await getTrendingTracks();
      setTracks(trendingData);
    } catch (error) {
      console.error('Error loading home data:', error);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleTrackSelect = useCallback((track: Track) => {
    // Track selected but not played
    console.log('Track selected:', track.title);
  }, []);

  const handlePlayTrack = useCallback((track: Track) => {
    playTrack(track, tracks);
  }, [playTrack, tracks]);

  if (isLoading) {
    return (
      <SafeAreaView
        style={[styles.container, { backgroundColor: colors.background }]}
        edges={['top']}
      >
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.text} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: '#F5F5F5' }]}>
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={[styles.title, { color: '#1a1a1a' }]}>Home</Text>
            <Text style={styles.subtitle}>Trending Songs</Text>
          </View>
          <TouchableOpacity style={styles.menuButton}>
            <Ionicons name="ellipsis-horizontal" size={24} color="#1a1a1a" />
          </TouchableOpacity>
        </View>
      </SafeAreaView>

      {/* Wheel Carousel */}
      <View style={styles.carouselContainer}>
        {tracks.length > 0 ? (
          <WheelCarousel
            tracks={tracks}
            onTrackSelect={handleTrackSelect}
            onPlayTrack={handlePlayTrack}
            isPlaying={isPlaying}
          />
        ) : (
          <View style={styles.emptyContainer}>
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
              No tracks available
            </Text>
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 100,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 14,
    color: '#888',
    marginTop: 2,
    fontWeight: '500',
  },
  menuButton: {
    padding: spacing.sm,
  },
  carouselContainer: {
    flex: 1,
    marginTop: 80, // Account for header
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    ...typography.body,
  },
});
