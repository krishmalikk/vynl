import React from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { useThemeStore } from '../store/useThemeStore';
import { Track } from '../types';
import { spacing, borderRadius, typography } from '../theme';
import { neumorphicOutset } from '../theme/neumorphic';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = (SCREEN_WIDTH - spacing.lg * 2 - spacing.md) / 2;

interface TrendingTrackCardProps {
  track: Track;
  rank?: number;
  onPress: () => void;
  variant?: 'default' | 'compact';
}

export const TrendingTrackCard: React.FC<TrendingTrackCardProps> = ({
  track,
  rank,
  onPress,
  variant = 'default',
}) => {
  const { colors } = useThemeStore();
  const cardWidth = variant === 'compact' ? CARD_WIDTH * 0.85 : CARD_WIDTH;
  const artworkSize = cardWidth - spacing.sm * 2;

  return (
    <TouchableOpacity
      style={[
        styles.container,
        {
          width: cardWidth,
          backgroundColor: colors.surfaceLight || colors.surface,
        },
        neumorphicOutset(colors.shadowDark || '#A3B1C6', 'light'),
      ]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      {/* Artwork */}
      <View style={styles.artworkContainer}>
        <Image
          source={{ uri: track.thumbnailUrl }}
          style={[
            styles.artwork,
            {
              width: artworkSize,
              height: artworkSize,
              backgroundColor: colors.background,
            },
          ]}
          resizeMode="cover"
        />
        {rank && (
          <View style={[styles.rankBadge, { backgroundColor: colors.text }]}>
            <Text style={styles.rankText}>{rank}</Text>
          </View>
        )}
      </View>

      {/* Info */}
      <View style={styles.info}>
        <Text style={[styles.title, { color: colors.text }]} numberOfLines={1}>
          {track.title}
        </Text>
        <Text
          style={[styles.artist, { color: colors.textSecondary }]}
          numberOfLines={1}
        >
          {track.artist}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: borderRadius.lg,
    padding: spacing.sm,
    marginBottom: spacing.sm,
  },
  artworkContainer: {
    position: 'relative',
  },
  artwork: {
    borderRadius: borderRadius.md,
  },
  rankBadge: {
    position: 'absolute',
    top: spacing.xs,
    left: spacing.xs,
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rankText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '700',
  },
  info: {
    paddingTop: spacing.sm,
  },
  title: {
    ...typography.bodySmall,
    fontWeight: '600',
  },
  artist: {
    ...typography.caption,
    marginTop: 2,
  },
});
