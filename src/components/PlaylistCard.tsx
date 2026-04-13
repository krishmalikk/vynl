import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Playlist } from '../types';
import { useThemeStore } from '../store/useThemeStore';
import { spacing, borderRadius, typography } from '../theme';

interface PlaylistCardProps {
  playlist: Playlist;
  onPress: () => void;
  onOptionsPress?: () => void;
}

export const PlaylistCard: React.FC<PlaylistCardProps> = ({
  playlist,
  onPress,
  onOptionsPress,
}) => {
  const { colors } = useThemeStore();

  const trackCount = playlist.trackIds.length;

  return (
    <TouchableOpacity
      style={[styles.container, { backgroundColor: colors.surface }]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      {/* Playlist Icon */}
      <View style={[styles.iconContainer, { backgroundColor: colors.surfaceLight }]}>
        <Ionicons name="musical-notes" size={28} color={colors.primary} />
      </View>

      {/* Playlist Info */}
      <View style={styles.info}>
        <Text style={[styles.name, { color: colors.text }]} numberOfLines={1}>
          {playlist.name}
        </Text>
        <Text style={[styles.count, { color: colors.textSecondary }]}>
          {trackCount} {trackCount === 1 ? 'track' : 'tracks'}
        </Text>
      </View>

      {/* Options */}
      {onOptionsPress && (
        <TouchableOpacity style={styles.optionsButton} onPress={onOptionsPress}>
          <Ionicons name="ellipsis-vertical" size={20} color={colors.textSecondary} />
        </TouchableOpacity>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: borderRadius.md,
    marginHorizontal: spacing.md,
    marginVertical: spacing.xs,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  info: {
    flex: 1,
    marginLeft: spacing.md,
  },
  name: {
    ...typography.body,
    fontWeight: '600',
  },
  count: {
    ...typography.caption,
    marginTop: 4,
  },
  optionsButton: {
    padding: spacing.sm,
  },
});
