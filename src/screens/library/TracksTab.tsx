import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  Pressable,
  Alert,
  StyleSheet,
  RefreshControl,
} from 'react-native';
import { Swipeable } from 'react-native-gesture-handler';
import { useNavigation } from '@react-navigation/native';
import { Trash2, Heart } from 'lucide-react-native';
import { body, display, vynl, layout } from '../../theme';
import { TrackRow } from '../../components/vynl';
import { ActionSheet, ActionSheetOption } from '../../components/ActionSheet';
import { useLibrary } from '../../hooks/useLibrary';
import { usePlayerStore } from '../../store/usePlayerStore';
import { Track } from '../../types';

export const TracksTab: React.FC = () => {
  const navigation = useNavigation<any>();
  const { tracks, refresh, removeTrack } = useLibrary();
  const { playTrack, playNext, addToQueue } = usePlayerStore();

  const [refreshing, setRefreshing] = useState(false);
  const [selected, setSelected] = useState<Track | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refresh();
    setRefreshing(false);
  }, [refresh]);

  const confirmDelete = (id: string) => {
    Alert.alert('Remove from library', 'Remove this track?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Remove', style: 'destructive', onPress: () => removeTrack(id) },
    ]);
  };

  const sheetOptions: ActionSheetOption[] = selected
    ? [
        { label: 'Play next', icon: 'play-skip-forward', onPress: () => playNext(selected) },
        { label: 'Add to queue', icon: 'list', onPress: () => addToQueue(selected) },
        {
          label: 'Go to artist',
          icon: 'person-outline',
          onPress: () =>
            navigation.navigate('ArtistDetail', { artistName: selected.artist }),
        },
        {
          label: 'Remove from library',
          icon: 'heart-dislike',
          destructive: true,
          onPress: () => removeTrack(selected.id),
        },
      ]
    : [];

  return (
    <>
      <FlatList
        data={tracks}
        keyExtractor={(t) => t.id}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Heart size={40} color={vynl.muted} />
            <Text style={[display(20), { color: vynl.ink, marginTop: 16 }]}>
              Your library is empty
            </Text>
            <Text style={[body(13), { color: vynl.muted, marginTop: 6, textAlign: 'center' }]}>
              Save tracks to see them here.
            </Text>
          </View>
        }
        renderItem={({ item }) => (
          <Swipeable
            renderRightActions={() => (
              <Pressable
                style={styles.deleteAction}
                onPress={() => confirmDelete(item.id)}
              >
                <Trash2 size={18} color={vynl.surface} />
              </Pressable>
            )}
          >
            <TrackRow
              track={item}
              onPress={() => playTrack(item, tracks)}
              trailing={
                <Pressable
                  onPress={() => {
                    setSelected(item);
                    setSheetOpen(true);
                  }}
                  hitSlop={8}
                  style={{ padding: 4 }}
                >
                  <Text style={[body(20, { weight: 'semibold' }), { color: vynl.muted }]}>
                    ⋯
                  </Text>
                </Pressable>
              }
            />
          </Swipeable>
        )}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={vynl.ink} />
        }
        contentContainerStyle={{
          paddingBottom: layout.tabBarHeight + layout.miniPlayerHeight + 20,
        }}
        showsVerticalScrollIndicator={false}
      />
      <ActionSheet
        visible={sheetOpen}
        onClose={() => setSheetOpen(false)}
        title={selected?.title}
        subtitle={selected?.artist}
        options={sheetOptions}
      />
    </>
  );
};

const styles = StyleSheet.create({
  empty: { padding: 40, alignItems: 'center' },
  deleteAction: {
    width: 72,
    backgroundColor: vynl.labelAccent,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 6,
    borderRadius: 14,
  },
});
