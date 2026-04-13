import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import Slider from '@react-native-community/slider';
import { useThemeStore } from '../store/useThemeStore';
import { useNowPlaying, usePlaybackControls } from '../hooks/useTrackPlayer';
import { VinylPlayer } from '../components/VinylPlayer';
import { NeumorphicButton } from '../components/NeumorphicButton';
import { spacing, typography } from '../theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export const NowPlayingScreen: React.FC = () => {
  const { colors } = useThemeStore();
  const navigation = useNavigation<any>();
  const {
    currentTrack,
    isPlaying,
    isLoading,
    duration,
    progress,
    shuffleEnabled,
    repeatMode,
    positionFormatted,
    durationFormatted,
  } = useNowPlaying();

  const {
    togglePlayPause,
    skipToNext,
    skipToPrevious,
    seekTo,
    toggleShuffle,
    cycleRepeatMode,
  } = usePlaybackControls();

  if (!currentTrack) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.emptyContainer}>
          <Ionicons name="musical-notes" size={64} color={colors.textMuted} />
          <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
            Nothing playing
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  const getRepeatIcon = (): keyof typeof Ionicons.glyphMap => {
    return 'repeat';
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.headerButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="chevron-down" size={28} color={colors.text} />
        </TouchableOpacity>

        <View style={styles.headerDots}>
          <Ionicons name="ellipsis-horizontal" size={24} color={colors.text} />
        </View>
      </View>

      {/* Vinyl Player */}
      <View style={styles.vinylContainer}>
        <VinylPlayer
          artworkUrl={currentTrack.thumbnailUrl}
          isPlaying={isPlaying}
        />
      </View>

      {/* Track Info */}
      <View style={styles.infoContainer}>
        <Text style={[styles.title, { color: colors.text }]} numberOfLines={1}>
          {currentTrack.title}
        </Text>
        <Text style={[styles.artist, { color: colors.textSecondary }]} numberOfLines={1}>
          {currentTrack.artist}
        </Text>
      </View>

      {/* Waveform / Progress Visualization */}
      <View style={styles.waveformContainer}>
        <View style={styles.waveform}>
          {Array.from({ length: 7 }, (_, i) => (
            <View
              key={i}
              style={[
                styles.waveformBar,
                {
                  height: [16, 24, 32, 40, 32, 24, 16][i],
                  backgroundColor: i < Math.floor(progress * 7) ? colors.text : colors.textMuted,
                },
              ]}
            />
          ))}
        </View>
        <Text style={[styles.timeText, { color: colors.text }]}>
          {positionFormatted} / {durationFormatted}
        </Text>
      </View>

      {/* Hidden Slider for seek functionality */}
      <View style={styles.sliderContainer}>
        <Slider
          style={styles.slider}
          value={progress}
          minimumValue={0}
          maximumValue={1}
          minimumTrackTintColor="transparent"
          maximumTrackTintColor="transparent"
          thumbTintColor="transparent"
          onSlidingComplete={(value) => seekTo(value * duration)}
        />
      </View>

      {/* Neumorphic Controls */}
      <View style={styles.controlsContainer}>
        {/* Previous */}
        <NeumorphicButton
          size={56}
          onPress={skipToPrevious}
          intensity="light"
        >
          <Ionicons name="play-skip-back" size={24} color={colors.text} />
        </NeumorphicButton>

        {/* Play/Pause - Larger */}
        <NeumorphicButton
          size={80}
          onPress={togglePlayPause}
          intensity="medium"
        >
          <Ionicons
            name={isLoading ? 'hourglass' : isPlaying ? 'pause' : 'play'}
            size={32}
            color={colors.text}
          />
        </NeumorphicButton>

        {/* Next */}
        <NeumorphicButton
          size={56}
          onPress={skipToNext}
          intensity="light"
        >
          <Ionicons name="play-skip-forward" size={24} color={colors.text} />
        </NeumorphicButton>
      </View>

      {/* Bottom Actions */}
      <View style={styles.bottomActions}>
        <TouchableOpacity
          style={styles.bottomAction}
          onPress={toggleShuffle}
        >
          <Ionicons
            name="shuffle"
            size={22}
            color={shuffleEnabled ? colors.text : colors.textMuted}
          />
        </TouchableOpacity>

        <TouchableOpacity style={styles.bottomAction}>
          <Ionicons name="heart-outline" size={22} color={colors.textSecondary} />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.bottomAction}
          onPress={() => navigation.navigate('Queue')}
        >
          <Ionicons name="list" size={22} color={colors.textSecondary} />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.bottomAction}
          onPress={cycleRepeatMode}
        >
          <View>
            <Ionicons
              name={getRepeatIcon()}
              size={22}
              color={repeatMode !== 'off' ? colors.text : colors.textMuted}
            />
            {repeatMode === 'one' && (
              <View style={[styles.repeatOneBadge, { backgroundColor: colors.text }]}>
                <Text style={styles.repeatOneText}>1</Text>
              </View>
            )}
          </View>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    ...typography.body,
    marginTop: spacing.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  headerButton: {
    padding: spacing.sm,
  },
  headerDots: {
    padding: spacing.sm,
  },
  vinylContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.sm,
  },
  infoContainer: {
    paddingHorizontal: spacing.xl,
    marginTop: spacing.md,
    alignItems: 'center',
  },
  title: {
    ...typography.h2,
    textAlign: 'center',
  },
  artist: {
    ...typography.body,
    textAlign: 'center',
    marginTop: spacing.xs,
  },
  waveformContainer: {
    alignItems: 'center',
    marginTop: spacing.md,
    paddingHorizontal: spacing.xl,
  },
  waveform: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    height: 44,
  },
  waveformBar: {
    width: 4,
    borderRadius: 2,
  },
  timeText: {
    ...typography.body,
    marginTop: spacing.md,
    fontWeight: '500',
  },
  sliderContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: '50%',
    opacity: 0,
    height: 40,
  },
  slider: {
    width: '100%',
    height: 40,
  },
  controlsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.lg,
    gap: spacing.xl,
    marginTop: spacing.sm,
  },
  bottomActions: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.xl,
    paddingBottom: spacing.lg,
    paddingHorizontal: spacing.xl,
    marginTop: 'auto',
  },
  bottomAction: {
    padding: spacing.md,
  },
  repeatOneBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    width: 12,
    height: 12,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  repeatOneText: {
    fontSize: 7,
    fontWeight: '700',
    color: '#fff',
  },
});
