import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import DraggableFlatList, {
  RenderItemParams,
  ScaleDecorator,
} from 'react-native-draggable-flatlist';
import { Swipeable } from 'react-native-gesture-handler';
import { TrackItem } from '../components/TrackItem';
import { useThemeStore } from '../store/useThemeStore';
import { usePlayerStore } from '../store/usePlayerStore';
import { QueueItem } from '../types';
import { spacing, borderRadius, typography } from '../theme';

export const QueueScreen: React.FC = () => {
  const { colors } = useThemeStore();
  const navigation = useNavigation();
  const {
    queue,
    queueIndex,
    currentTrack,
    reorderQueue,
    removeFromQueue,
    skipToQueueItem,
    clearQueue,
  } = usePlayerStore();

  const upNext = queue.slice(queueIndex + 1);

  const handleClearQueue = () => {
    Alert.alert(
      'Clear Queue',
      'Remove all upcoming tracks from the queue?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: clearQueue,
        },
      ]
    );
  };

  const renderRightActions = (queueId: string) => (
    <TouchableOpacity
      style={[styles.deleteAction, { backgroundColor: colors.error }]}
      onPress={() => removeFromQueue(queueId)}
    >
      <Ionicons name="trash" size={24} color="#fff" />
    </TouchableOpacity>
  );

  const renderItem = ({ item, drag, isActive }: RenderItemParams<QueueItem>) => {
    // Adjust index for the upNext array (offset by queueIndex + 1)
    const actualIndex = queue.findIndex(q => q.queueId === item.queueId);

    return (
      <ScaleDecorator>
        <Swipeable renderRightActions={() => renderRightActions(item.queueId)}>
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
              onPress={() => skipToQueueItem(item.queueId)}
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
  };

  const handleDragEnd = ({ from, to }: { from: number; to: number }) => {
    // Convert from upNext indices to actual queue indices
    const actualFrom = from + queueIndex + 1;
    const actualTo = to + queueIndex + 1;
    reorderQueue(actualFrom, actualTo);
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

        <Text style={[styles.headerTitle, { color: colors.text }]}>Queue</Text>

        <TouchableOpacity
          style={styles.headerButton}
          onPress={handleClearQueue}
          disabled={upNext.length === 0}
        >
          <Text
            style={[
              styles.clearText,
              { color: upNext.length > 0 ? colors.primary : colors.textMuted },
            ]}
          >
            Clear
          </Text>
        </TouchableOpacity>
      </View>

      {/* Now Playing */}
      {currentTrack && (
        <View style={styles.nowPlayingSection}>
          <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
            Now Playing
          </Text>
          <TrackItem
            track={currentTrack}
            onPress={() => {}}
            isPlaying
          />
        </View>
      )}

      {/* Up Next */}
      <View style={styles.upNextSection}>
        <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
          Up Next ({upNext.length})
        </Text>

        {upNext.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="list" size={48} color={colors.textMuted} />
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
              No tracks in queue
            </Text>
            <Text style={[styles.emptySubtext, { color: colors.textMuted }]}>
              Add tracks using "Play Next" or "Add to Queue"
            </Text>
          </View>
        ) : (
          <DraggableFlatList
            data={upNext}
            keyExtractor={(item) => item.queueId}
            renderItem={renderItem}
            onDragEnd={handleDragEnd}
            contentContainerStyle={styles.listContent}
          />
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
  headerTitle: {
    ...typography.h3,
  },
  clearText: {
    ...typography.body,
    fontWeight: '500',
  },
  nowPlayingSection: {
    paddingTop: spacing.md,
  },
  upNextSection: {
    flex: 1,
    paddingTop: spacing.lg,
  },
  sectionTitle: {
    ...typography.caption,
    textTransform: 'uppercase',
    letterSpacing: 1,
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.sm,
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
  listContent: {
    paddingBottom: spacing.xl,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
  },
  emptyText: {
    ...typography.body,
    marginTop: spacing.md,
    textAlign: 'center',
  },
  emptySubtext: {
    ...typography.bodySmall,
    marginTop: spacing.xs,
    textAlign: 'center',
  },
});
