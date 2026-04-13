import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import DraggableFlatList, {
  RenderItemParams,
  ScaleDecorator,
} from 'react-native-draggable-flatlist';
import { Swipeable } from 'react-native-gesture-handler';
import { TrackItem } from '../components/TrackItem';
import { useThemeStore } from '../store/useThemeStore';
import { usePlayerStore } from '../store/usePlayerStore';
import { usePlaylistDetail } from '../hooks/usePlaylists';
import { StoredTrack } from '../types';
import { spacing, borderRadius, typography, layout } from '../theme';

type RouteParams = {
  PlaylistDetail: { playlistId: string };
};

export const PlaylistDetailScreen: React.FC = () => {
  const { colors } = useThemeStore();
  const navigation = useNavigation();
  const route = useRoute<RouteProp<RouteParams, 'PlaylistDetail'>>();
  const { playlistId } = route.params;

  const { playTrack } = usePlayerStore();
  const { playlist, tracks, isLoading, removeTrack, reorderTracks } = usePlaylistDetail(playlistId);

  const handlePlayAll = () => {
    if (tracks.length > 0) {
      playTrack(tracks[0], tracks);
    }
  };

  const handleShufflePlay = () => {
    if (tracks.length > 0) {
      const shuffled = [...tracks].sort(() => Math.random() - 0.5);
      playTrack(shuffled[0], shuffled);
    }
  };

  const handleTrackPress = (track: StoredTrack) => {
    playTrack(track, tracks);
  };

  const handleRemove = (trackId: string) => {
    Alert.alert(
      'Remove Track',
      'Remove this track from the playlist?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => removeTrack(trackId),
        },
      ]
    );
  };

  const renderRightActions = (trackId: string) => (
    <TouchableOpacity
      style={[styles.deleteAction, { backgroundColor: colors.error }]}
      onPress={() => handleRemove(trackId)}
    >
      <Ionicons name="trash" size={24} color="#fff" />
    </TouchableOpacity>
  );

  const renderItem = ({ item, drag, isActive }: RenderItemParams<StoredTrack>) => (
    <ScaleDecorator>
      <Swipeable renderRightActions={() => renderRightActions(item.id)}>
        <TouchableOpacity
          onLongPress={drag}
          disabled={isActive}
          style={[
            styles.trackContainer,
            isActive && { backgroundColor: colors.surfaceLight },
          ]}
        >
          <TrackItem
            track={item}
            onPress={() => handleTrackPress(item)}
            rightElement={
              <View style={styles.dragHandle}>
                <Ionicons name="menu" size={20} color={colors.textSecondary} />
              </View>
            }
          />
        </TouchableOpacity>
      </Swipeable>
    </ScaleDecorator>
  );

  const renderHeader = () => (
    <View style={styles.headerContent}>
      {/* Playlist Info */}
      <View style={[styles.playlistIcon, { backgroundColor: colors.surfaceLight }]}>
        <Ionicons name="musical-notes" size={48} color={colors.primary} />
      </View>
      <Text style={[styles.playlistName, { color: colors.text }]}>
        {playlist?.name || 'Playlist'}
      </Text>
      <Text style={[styles.trackCount, { color: colors.textSecondary }]}>
        {tracks.length} {tracks.length === 1 ? 'track' : 'tracks'}
      </Text>

      {/* Play Buttons */}
      {tracks.length > 0 && (
        <View style={styles.playButtons}>
          <TouchableOpacity
            style={[styles.playButton, { backgroundColor: colors.primary }]}
            onPress={handlePlayAll}
          >
            <Ionicons name="play" size={24} color="#fff" />
            <Text style={styles.playButtonText}>Play All</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.shuffleButton, { backgroundColor: colors.surfaceLight }]}
            onPress={handleShufflePlay}
          >
            <Ionicons name="shuffle" size={24} color={colors.text} />
          </TouchableOpacity>
        </View>
      )}
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      {/* Navigation Header */}
      <View style={styles.navHeader}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="chevron-back" size={28} color={colors.text} />
        </TouchableOpacity>
      </View>

      <DraggableFlatList
        data={tracks}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        onDragEnd={({ from, to }) => reorderTracks(from, to)}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="musical-notes-outline" size={48} color={colors.textMuted} />
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
              No tracks in this playlist
            </Text>
          </View>
        }
        contentContainerStyle={styles.listContent}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  navHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm,
  },
  backButton: {
    padding: spacing.sm,
  },
  headerContent: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
    paddingHorizontal: spacing.lg,
  },
  playlistIcon: {
    width: 120,
    height: 120,
    borderRadius: borderRadius.lg,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  playlistName: {
    ...typography.h2,
    textAlign: 'center',
  },
  trackCount: {
    ...typography.body,
    marginTop: spacing.sm,
  },
  playButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.xl,
    gap: spacing.md,
  },
  playButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    borderRadius: borderRadius.full,
  },
  playButtonText: {
    ...typography.body,
    fontWeight: '600',
    color: '#fff',
    marginLeft: spacing.sm,
  },
  shuffleButton: {
    padding: spacing.md,
    borderRadius: borderRadius.full,
  },
  listContent: {
    paddingBottom: layout.miniPlayerHeight + layout.tabBarHeight + spacing.lg,
  },
  trackContainer: {
    // Wrapper for drag functionality
  },
  dragHandle: {
    padding: spacing.sm,
  },
  deleteAction: {
    justifyContent: 'center',
    alignItems: 'center',
    width: 80,
    marginVertical: spacing.xs,
    borderRadius: borderRadius.md,
  },
  emptyContainer: {
    paddingVertical: spacing.xxl,
    alignItems: 'center',
  },
  emptyText: {
    ...typography.body,
    marginTop: spacing.md,
  },
});
