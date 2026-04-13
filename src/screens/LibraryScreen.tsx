import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  RefreshControl,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Swipeable } from 'react-native-gesture-handler';
import { TrackItem } from '../components/TrackItem';
import { ActionSheet, ActionSheetOption } from '../components/ActionSheet';
import { useThemeStore } from '../store/useThemeStore';
import { usePlayerStore } from '../store/usePlayerStore';
import { useLibrary } from '../hooks/useLibrary';
import { Track } from '../types';
import { spacing, borderRadius, typography, layout } from '../theme';

export const LibraryScreen: React.FC = () => {
  const { colors } = useThemeStore();
  const { playTrack, playNext, addToQueue } = usePlayerStore();
  const { tracks, isLoading, refresh, removeTrack } = useLibrary();

  const [refreshing, setRefreshing] = useState(false);
  const [selectedTrack, setSelectedTrack] = useState<Track | null>(null);
  const [showActionSheet, setShowActionSheet] = useState(false);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refresh();
    setRefreshing(false);
  }, [refresh]);

  const handleTrackPress = (track: Track) => {
    playTrack(track, tracks);
  };

  const handleOptionsPress = (track: Track) => {
    setSelectedTrack(track);
    setShowActionSheet(true);
  };

  const handleDelete = (trackId: string) => {
    Alert.alert(
      'Remove from Library',
      'Are you sure you want to remove this track from your library?',
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
    <View style={[styles.deleteAction, { backgroundColor: colors.error }]}>
      <Ionicons name="trash" size={24} color="#fff" />
    </View>
  );

  const actionSheetOptions: ActionSheetOption[] = selectedTrack
    ? [
        {
          label: 'Play Next',
          icon: 'play-skip-forward',
          onPress: () => playNext(selectedTrack),
        },
        {
          label: 'Add to Queue',
          icon: 'list',
          onPress: () => addToQueue(selectedTrack),
        },
        {
          label: 'Add to Playlist',
          icon: 'add-circle',
          onPress: () => {
            // TODO: Open playlist picker
          },
        },
        {
          label: 'Remove from Library',
          icon: 'heart-dislike',
          onPress: () => removeTrack(selectedTrack.id),
          destructive: true,
        },
      ]
    : [];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <Text style={[styles.title, { color: colors.text }]}>Library</Text>

      <FlatList
        data={tracks}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <Swipeable
            renderRightActions={() => renderRightActions(item.id)}
            onSwipeableRightOpen={() => handleDelete(item.id)}
          >
            <TrackItem
              track={item}
              onPress={() => handleTrackPress(item)}
              onOptionsPress={() => handleOptionsPress(item)}
            />
          </Swipeable>
        )}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="heart-outline" size={64} color={colors.textMuted} />
            <Text style={[styles.emptyTitle, { color: colors.text }]}>
              Your library is empty
            </Text>
            <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
              Save tracks to see them here
            </Text>
          </View>
        }
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
          />
        }
        contentContainerStyle={[
          styles.listContent,
          tracks.length === 0 && styles.emptyList,
        ]}
      />

      <ActionSheet
        visible={showActionSheet}
        onClose={() => setShowActionSheet(false)}
        title={selectedTrack?.title}
        subtitle={selectedTrack?.artist}
        options={actionSheetOptions}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  title: {
    ...typography.h1,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.md,
  },
  listContent: {
    paddingBottom: layout.miniPlayerHeight + layout.tabBarHeight + spacing.lg,
  },
  emptyList: {
    flex: 1,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
  },
  emptyTitle: {
    ...typography.h3,
    marginTop: spacing.lg,
    textAlign: 'center',
  },
  emptySubtitle: {
    ...typography.body,
    marginTop: spacing.sm,
    textAlign: 'center',
  },
  deleteAction: {
    justifyContent: 'center',
    alignItems: 'center',
    width: 80,
    marginVertical: spacing.xs,
    borderRadius: borderRadius.md,
  },
});
