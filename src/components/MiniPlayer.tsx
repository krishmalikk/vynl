import React from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Pressable,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useThemeStore } from '../store/useThemeStore';
import { useNowPlaying, usePlaybackControls } from '../hooks/useTrackPlayer';
import { spacing, borderRadius, typography, layout } from '../theme';

interface MiniPlayerProps {
  onPress: () => void;
}

export const MiniPlayer: React.FC<MiniPlayerProps> = ({ onPress }) => {
  const { colors } = useThemeStore();
  const { currentTrack, isPlaying, isLoading, progress } = useNowPlaying();
  const { togglePlayPause, skipToNext } = usePlaybackControls();

  if (!currentTrack) {
    return null;
  }

  return (
    <TouchableOpacity
      style={[
        styles.container,
        {
          backgroundColor: colors.background,
          shadowColor: colors.shadowDark || '#A3B1C6',
        },
      ]}
      onPress={onPress}
      activeOpacity={0.95}
    >
      {/* Progress bar */}
      <View style={[styles.progressBar, { backgroundColor: colors.textMuted }]}>
        <View
          style={[
            styles.progressFill,
            { width: `${progress * 100}%`, backgroundColor: colors.text },
          ]}
        />
      </View>

      <View style={styles.content}>
        {/* Thumbnail */}
        <Image
          source={{ uri: currentTrack.thumbnailUrl }}
          style={styles.thumbnail}
          resizeMode="cover"
        />

        {/* Track Info */}
        <View style={styles.info}>
          <Text style={[styles.title, { color: colors.text }]} numberOfLines={1}>
            {currentTrack.title}
          </Text>
          <Text style={[styles.artist, { color: colors.textSecondary }]} numberOfLines={1}>
            {currentTrack.artist}
          </Text>
        </View>

        {/* Controls */}
        <View style={styles.controls}>
          <Pressable
            style={styles.controlButton}
            onPress={togglePlayPause}
            disabled={isLoading}
          >
            <Ionicons
              name={isLoading ? 'hourglass' : isPlaying ? 'pause' : 'play'}
              size={28}
              color={colors.text}
            />
          </Pressable>

          <Pressable style={styles.controlButton} onPress={skipToNext}>
            <Ionicons name="play-skip-forward" size={24} color={colors.text} />
          </Pressable>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: layout.tabBarHeight,
    left: 0,
    right: 0,
    height: layout.miniPlayerHeight,
    borderTopLeftRadius: borderRadius.lg,
    borderTopRightRadius: borderRadius.lg,
    overflow: 'hidden',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  progressBar: {
    height: 2,
    width: '100%',
  },
  progressFill: {
    height: '100%',
  },
  content: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
  },
  thumbnail: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.sm,
  },
  info: {
    flex: 1,
    marginLeft: spacing.md,
  },
  title: {
    ...typography.body,
    fontWeight: '500',
  },
  artist: {
    ...typography.caption,
    marginTop: 2,
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  controlButton: {
    padding: spacing.sm,
  },
});
