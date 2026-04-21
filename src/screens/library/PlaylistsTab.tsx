import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  Pressable,
  TextInput,
  Modal,
  Alert,
  StyleSheet,
  RefreshControl,
} from 'react-native';
import { Swipeable } from 'react-native-gesture-handler';
import { useNavigation } from '@react-navigation/native';
import { ChevronRight, Trash2, Pencil, Plus } from 'lucide-react-native';
import { body, display, kicker, vynl, shadow, layout } from '../../theme';
import { IconButton, PillButton } from '../../components/vynl';
import { ActionSheet, ActionSheetOption } from '../../components/ActionSheet';
import { usePlaylists } from '../../hooks/usePlaylists';
import { Playlist } from '../../types';

export const PlaylistsTab: React.FC = () => {
  const navigation = useNavigation<any>();
  const { playlists, refresh, createPlaylist, renamePlaylist, deletePlaylist } =
    usePlaylists();

  const [refreshing, setRefreshing] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [renameOpen, setRenameOpen] = useState(false);
  const [name, setName] = useState('');
  const [selected, setSelected] = useState<Playlist | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refresh();
    setRefreshing(false);
  }, [refresh]);

  const handleCreate = async () => {
    if (!name.trim()) return;
    await createPlaylist(name.trim());
    setName('');
    setCreateOpen(false);
  };

  const handleRename = async () => {
    if (!selected || !name.trim()) return;
    await renamePlaylist(selected.id, name.trim());
    setName('');
    setRenameOpen(false);
    setSelected(null);
  };

  const confirmDelete = (p: Playlist) => {
    Alert.alert('Delete playlist', `Delete "${p.name}"?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => deletePlaylist(p.id) },
    ]);
  };

  const openRename = (p: Playlist) => {
    setSelected(p);
    setName(p.name);
    setRenameOpen(true);
  };

  const sheetOptions: ActionSheetOption[] = selected
    ? [
        { label: 'Rename', icon: 'pencil', onPress: () => openRename(selected) },
        {
          label: 'Delete',
          icon: 'trash',
          destructive: true,
          onPress: () => confirmDelete(selected),
        },
      ]
    : [];

  const renderSwipeActions = (p: Playlist) => (
    <View style={styles.swipeRow}>
      <Pressable style={styles.swipeBtn} onPress={() => openRename(p)}>
        <Pencil size={18} color={vynl.surface} />
      </Pressable>
      <Pressable
        style={[styles.swipeBtn, { backgroundColor: vynl.labelAccent }]}
        onPress={() => confirmDelete(p)}
      >
        <Trash2 size={18} color={vynl.surface} />
      </Pressable>
    </View>
  );

  return (
    <>
      <FlatList
        data={playlists}
        keyExtractor={(p) => p.id}
        ListHeaderComponent={
          <View style={styles.listHeader}>
            <PillButton
              label="New playlist"
              variant="secondary"
              onPress={() => {
                setName('');
                setCreateOpen(true);
              }}
              leadingIcon={<Plus size={16} color={vynl.ink} />}
              fullWidth
            />
          </View>
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={[display(20), { color: vynl.ink }]}>No playlists yet</Text>
            <Text style={[body(13), { color: vynl.muted, marginTop: 6, textAlign: 'center' }]}>
              Create your first playlist to collect records worth coming back to.
            </Text>
          </View>
        }
        renderItem={({ item }) => (
          <Swipeable renderRightActions={() => renderSwipeActions(item)}>
            <Pressable
              style={styles.row}
              onPress={() =>
                navigation.navigate('PlaylistDetail', { playlistId: item.id })
              }
              onLongPress={() => {
                setSelected(item);
                setSheetOpen(true);
              }}
            >
              <View style={styles.art}>
                <Text style={[display(20, { italic: true, weight: 'bold' }), { color: vynl.surface }]}>
                  {item.name.charAt(0).toUpperCase()}
                </Text>
              </View>
              <View style={styles.info}>
                <Text style={[body(14, { weight: 'semibold' }), { color: vynl.ink }]} numberOfLines={1}>
                  {item.name}
                </Text>
                <Text style={[body(11), { color: vynl.muted, marginTop: 2 }]}>
                  Playlist · {item.trackIds.length}{' '}
                  {item.trackIds.length === 1 ? 'track' : 'tracks'}
                </Text>
              </View>
              <ChevronRight size={18} color={vynl.muted} />
            </Pressable>
          </Swipeable>
        )}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={vynl.ink} />
        }
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingBottom: layout.tabBarHeight + layout.miniPlayerHeight + 20,
          gap: 10,
        }}
        showsVerticalScrollIndicator={false}
      />

      <NameModal
        visible={createOpen}
        title="New playlist"
        value={name}
        onChangeText={setName}
        onSubmit={handleCreate}
        onClose={() => {
          setCreateOpen(false);
          setName('');
        }}
        submitLabel="Create"
      />
      <NameModal
        visible={renameOpen}
        title="Rename playlist"
        value={name}
        onChangeText={setName}
        onSubmit={handleRename}
        onClose={() => {
          setRenameOpen(false);
          setName('');
          setSelected(null);
        }}
        submitLabel="Save"
      />

      <ActionSheet
        visible={sheetOpen}
        onClose={() => setSheetOpen(false)}
        title={selected?.name}
        options={sheetOptions}
      />
    </>
  );
};

const NameModal: React.FC<{
  visible: boolean;
  title: string;
  value: string;
  onChangeText: (s: string) => void;
  onSubmit: () => void;
  onClose: () => void;
  submitLabel: string;
}> = ({ visible, title, value, onChangeText, onSubmit, onClose, submitLabel }) => (
  <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
    <View style={styles.modalOverlay}>
      <View style={styles.modalContent}>
        <Text style={[display(20), { color: vynl.ink, textAlign: 'center' }]}>{title}</Text>
        <TextInput
          style={[body(15), styles.modalInput]}
          placeholder="Playlist name"
          placeholderTextColor={vynl.muted}
          value={value}
          onChangeText={onChangeText}
          autoFocus
        />
        <View style={{ flexDirection: 'row', gap: 10 }}>
          <PillButton label="Cancel" variant="secondary" onPress={onClose} fullWidth style={{ flex: 1 }} />
          <PillButton label={submitLabel} onPress={onSubmit} fullWidth style={{ flex: 1 }} />
        </View>
      </View>
    </View>
  </Modal>
);

const styles = StyleSheet.create({
  listHeader: { paddingBottom: 8 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: vynl.surface,
    borderRadius: 18,
    padding: 12,
    ...shadow.sm,
  },
  art: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: vynl.labelAccent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  info: { flex: 1, minWidth: 0 },
  empty: { padding: 40, alignItems: 'center' },
  swipeRow: { flexDirection: 'row', gap: 8, paddingLeft: 10 },
  swipeBtn: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: vynl.ink,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(11,11,14,0.45)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  modalContent: {
    width: '100%',
    maxWidth: 340,
    backgroundColor: vynl.surface,
    borderRadius: 24,
    padding: 20,
    gap: 14,
  },
  modalInput: {
    backgroundColor: vynl.bg,
    borderRadius: 14,
    padding: 14,
    color: vynl.ink,
  },
});
