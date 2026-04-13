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
import { Track } from '../types';
import { useThemeStore } from '../store/useThemeStore';
import { spacing, borderRadius, typography } from '../theme';

interface TrackItemProps {
  track: Track;
  onPress: () => void;
  onOptionsPress?: () => void;
  isPlaying?: boolean;
  showDuration?: boolean;
  rightElement?: React.ReactNode;
}

export const TrackItem: React.FC<TrackItemProps> = ({
  track,
  onPress,
  onOptionsPress,
  isPlaying = false,
  showDuration = true,
  rightElement,
}) => {
  const { colors } = useThemeStore();

  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <TouchableOpacity
      style={[styles.container, { backgroundColor: colors.surface }]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.thumbnailContainer}>
        <Image
          source={{ uri: track.thumbnailUrl }}
          style={styles.thumbnail}
          resizeMode="cover"
        />
        {isPlaying && (
          <View style={[styles.playingOverlay, { backgroundColor: colors.overlay }]}>
            <Ionicons name="musical-notes" size={20} color={colors.primary} />
          </View>
        )}
      </View>

      <View style={styles.info}>
        <Text
          style={[
            styles.title,
            { color: isPlaying ? colors.primary : colors.text },
          ]}
          numberOfLines={1}
        >
          {track.title}
        </Text>
        <Text style={[styles.artist, { color: colors.textSecondary }]} numberOfLines={1}>
          {track.artist}
          {showDuration && ` • ${formatDuration(track.duration)}`}
        </Text>
      </View>

      {rightElement ? (
        rightElement
      ) : onOptionsPress ? (
        <Pressable
          style={styles.optionsButton}
          onPress={onOptionsPress}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons
            name="ellipsis-vertical"
            size={20}
            color={colors.textSecondary}
          />
        </Pressable>
      ) : null}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.sm,
    borderRadius: borderRadius.md,
    marginHorizontal: spacing.md,
    marginVertical: spacing.xs,
  },
  thumbnailContainer: {
    position: 'relative',
    width: 56,
    height: 56,
    borderRadius: borderRadius.sm,
    overflow: 'hidden',
  },
  thumbnail: {
    width: '100%',
    height: '100%',
  },
  playingOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  info: {
    flex: 1,
    marginLeft: spacing.md,
    justifyContent: 'center',
  },
  title: {
    ...typography.body,
    fontWeight: '500',
  },
  artist: {
    ...typography.bodySmall,
    marginTop: 2,
  },
  optionsButton: {
    padding: spacing.sm,
  },
});
