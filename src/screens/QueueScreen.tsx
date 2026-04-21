import React from 'react';
import { View, Text, Pressable, Alert, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import DraggableFlatList, {
  RenderItemParams,
  ScaleDecorator,
} from 'react-native-draggable-flatlist';
import { Swipeable } from 'react-native-gesture-handler';
import { ChevronDown, List, Trash2 } from 'lucide-react-native';
import { body, display, kicker, vynl } from '../theme';
import { IconButton, TrackRow, EqBars, Vinyl } from '../components/vynl';
import { usePlayerStore } from '../store/usePlayerStore';
import { QueueItem } from '../types';

export const QueueScreen: React.FC = () => {
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

  const confirmClear = () => {
    Alert.alert('Clear queue', 'Remove all upcoming tracks?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Clear', style: 'destructive', onPress: clearQueue },
    ]);
  };

  const handleDragEnd = ({ from, to }: { from: number; to: number }) => {
    reorderQueue(from + queueIndex + 1, to + queueIndex + 1);
  };

  const renderItem = ({ item, drag, isActive }: RenderItemParams<QueueItem>) => (
    <ScaleDecorator>
      <Swipeable
        renderRightActions={() => (
          <Pressable
            style={styles.deleteBtn}
            onPress={() => removeFromQueue(item.queueId)}
          >
            <Trash2 size={18} color={vynl.surface} />
          </Pressable>
        )}
      >
        <Pressable
          onPress={() => skipToQueueItem(item.queueId)}
          onLongPress={drag}
          disabled={isActive}
          style={isActive ? { backgroundColor: vynl.surface2 } : undefined}
        >
          <TrackRow track={item} />
        </Pressable>
      </Swipeable>
    </ScaleDecorator>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <IconButton size="sm" variant="ghost" onPress={() => navigation.goBack()}>
          <ChevronDown size={20} color={vynl.ink} />
        </IconButton>
        <Text style={[display(20, { weight: 'semibold' }), { color: vynl.ink }]}>
          Queue
        </Text>
        <Pressable onPress={confirmClear} disabled={upNext.length === 0}>
          <Text
            style={[
              body(14, { weight: 'semibold' }),
              { color: upNext.length > 0 ? vynl.ink : vynl.muted },
            ]}
          >
            Clear
          </Text>
        </Pressable>
      </View>

      {currentTrack ? (
        <View style={styles.section}>
          <Text style={[kicker(10), styles.sectionLabel]}>Now playing</Text>
          <View style={styles.nowPlayingRow}>
            <View style={styles.eqLead}>
              <EqBars />
            </View>
            <Vinyl size="xs" spinning />
            <View style={{ flex: 1, minWidth: 0, marginLeft: 10 }}>
              <Text style={[body(14, { weight: 'semibold' }), { color: vynl.ink }]} numberOfLines={1}>
                {currentTrack.title.split(' - ')[0].split('(')[0].trim()}
              </Text>
              <Text style={[body(11), { color: vynl.muted, marginTop: 2 }]} numberOfLines={1}>
                {currentTrack.artist}
              </Text>
            </View>
          </View>
        </View>
      ) : null}

      <Text style={[kicker(10), styles.sectionLabel]}>Up next ({upNext.length})</Text>

      {upNext.length === 0 ? (
        <View style={styles.empty}>
          <List size={40} color={vynl.muted} />
          <Text style={[display(18), { color: vynl.ink, marginTop: 16 }]}>
            No tracks in queue
          </Text>
          <Text
            style={[body(12), { color: vynl.muted, marginTop: 4, textAlign: 'center' }]}
          >
            Add with “Play next” or “Add to queue”.
          </Text>
        </View>
      ) : (
        <DraggableFlatList
          data={upNext}
          keyExtractor={(item) => item.queueId}
          renderItem={renderItem}
          onDragEnd={handleDragEnd}
          contentContainerStyle={{ paddingBottom: 32 }}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: vynl.bg },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  section: { paddingTop: 12 },
  sectionLabel: {
    color: vynl.muted,
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 6,
  },
  nowPlayingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 12,
    padding: 10,
    backgroundColor: vynl.surface,
    borderRadius: 16,
  },
  eqLead: { width: 24, alignItems: 'center', marginRight: 6 },
  empty: {
    flex: 1,
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteBtn: {
    width: 72,
    backgroundColor: vynl.labelAccent,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 6,
    borderRadius: 14,
  },
});
