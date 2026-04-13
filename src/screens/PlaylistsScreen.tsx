import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  RefreshControl,
  TouchableOpacity,
  TextInput,
  Modal,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { Swipeable } from 'react-native-gesture-handler';
import { PlaylistCard } from '../components/PlaylistCard';
import { ActionSheet, ActionSheetOption } from '../components/ActionSheet';
import { useThemeStore } from '../store/useThemeStore';
import { usePlaylists } from '../hooks/usePlaylists';
import { Playlist } from '../types';
import { spacing, borderRadius, typography, layout } from '../theme';

export const PlaylistsScreen: React.FC = () => {
  const { colors } = useThemeStore();
  const navigation = useNavigation<any>();
  const {
    playlists,
    isLoading,
    refresh,
    createPlaylist,
    renamePlaylist,
    deletePlaylist,
  } = usePlaylists();

  const [refreshing, setRefreshing] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showRenameModal, setShowRenameModal] = useState(false);
  const [newPlaylistName, setNewPlaylistName] = useState('');
  const [selectedPlaylist, setSelectedPlaylist] = useState<Playlist | null>(null);
  const [showActionSheet, setShowActionSheet] = useState(false);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refresh();
    setRefreshing(false);
  }, [refresh]);

  const handleCreate = async () => {
    if (newPlaylistName.trim()) {
      await createPlaylist(newPlaylistName.trim());
      setNewPlaylistName('');
      setShowCreateModal(false);
    }
  };

  const handleRename = async () => {
    if (selectedPlaylist && newPlaylistName.trim()) {
      await renamePlaylist(selectedPlaylist.id, newPlaylistName.trim());
      setNewPlaylistName('');
      setShowRenameModal(false);
      setSelectedPlaylist(null);
    }
  };

  const handleDelete = (playlist: Playlist) => {
    Alert.alert(
      'Delete Playlist',
      `Are you sure you want to delete "${playlist.name}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => deletePlaylist(playlist.id),
        },
      ]
    );
  };

  const handlePlaylistPress = (playlist: Playlist) => {
    navigation.navigate('PlaylistDetail', { playlistId: playlist.id });
  };

  const handleOptionsPress = (playlist: Playlist) => {
    setSelectedPlaylist(playlist);
    setShowActionSheet(true);
  };

  const openRenameModal = (playlist: Playlist) => {
    setSelectedPlaylist(playlist);
    setNewPlaylistName(playlist.name);
    setShowRenameModal(true);
  };

  const actionSheetOptions: ActionSheetOption[] = selectedPlaylist
    ? [
        {
          label: 'Rename',
          icon: 'pencil',
          onPress: () => openRenameModal(selectedPlaylist),
        },
        {
          label: 'Share',
          icon: 'share-outline',
          onPress: () => {
            // TODO: Implement sharing
          },
        },
        {
          label: 'Delete',
          icon: 'trash',
          onPress: () => handleDelete(selectedPlaylist),
          destructive: true,
        },
      ]
    : [];

  const renderRightActions = (playlist: Playlist) => (
    <View style={styles.swipeActions}>
      <TouchableOpacity
        style={[styles.swipeAction, { backgroundColor: colors.primary }]}
        onPress={() => openRenameModal(playlist)}
      >
        <Ionicons name="pencil" size={20} color="#fff" />
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.swipeAction, { backgroundColor: colors.error }]}
        onPress={() => handleDelete(playlist)}
      >
        <Ionicons name="trash" size={20} color="#fff" />
      </TouchableOpacity>
    </View>
  );

  const renderCreateModal = () => (
    <Modal
      visible={showCreateModal}
      transparent
      animationType="fade"
      onRequestClose={() => setShowCreateModal(false)}
    >
      <View style={[styles.modalOverlay, { backgroundColor: colors.overlay }]}>
        <View style={[styles.modalContent, { backgroundColor: colors.surface }]}>
          <Text style={[styles.modalTitle, { color: colors.text }]}>
            New Playlist
          </Text>
          <TextInput
            style={[
              styles.modalInput,
              { backgroundColor: colors.surfaceLight, color: colors.text },
            ]}
            placeholder="Playlist name"
            placeholderTextColor={colors.textMuted}
            value={newPlaylistName}
            onChangeText={setNewPlaylistName}
            autoFocus
          />
          <View style={styles.modalButtons}>
            <TouchableOpacity
              style={[styles.modalButton, { backgroundColor: colors.surfaceLight }]}
              onPress={() => {
                setNewPlaylistName('');
                setShowCreateModal(false);
              }}
            >
              <Text style={[styles.modalButtonText, { color: colors.text }]}>
                Cancel
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.modalButton, { backgroundColor: colors.primary }]}
              onPress={handleCreate}
            >
              <Text style={[styles.modalButtonText, { color: '#fff' }]}>
                Create
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  const renderRenameModal = () => (
    <Modal
      visible={showRenameModal}
      transparent
      animationType="fade"
      onRequestClose={() => setShowRenameModal(false)}
    >
      <View style={[styles.modalOverlay, { backgroundColor: colors.overlay }]}>
        <View style={[styles.modalContent, { backgroundColor: colors.surface }]}>
          <Text style={[styles.modalTitle, { color: colors.text }]}>
            Rename Playlist
          </Text>
          <TextInput
            style={[
              styles.modalInput,
              { backgroundColor: colors.surfaceLight, color: colors.text },
            ]}
            placeholder="Playlist name"
            placeholderTextColor={colors.textMuted}
            value={newPlaylistName}
            onChangeText={setNewPlaylistName}
            autoFocus
          />
          <View style={styles.modalButtons}>
            <TouchableOpacity
              style={[styles.modalButton, { backgroundColor: colors.surfaceLight }]}
              onPress={() => {
                setNewPlaylistName('');
                setShowRenameModal(false);
                setSelectedPlaylist(null);
              }}
            >
              <Text style={[styles.modalButtonText, { color: colors.text }]}>
                Cancel
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.modalButton, { backgroundColor: colors.primary }]}
              onPress={handleRename}
            >
              <Text style={[styles.modalButtonText, { color: '#fff' }]}>
                Save
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>Playlists</Text>
        <TouchableOpacity
          style={[styles.addButton, { backgroundColor: colors.primary }]}
          onPress={() => setShowCreateModal(true)}
        >
          <Ionicons name="add" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      <FlatList
        data={playlists}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <Swipeable renderRightActions={() => renderRightActions(item)}>
            <PlaylistCard
              playlist={item}
              onPress={() => handlePlaylistPress(item)}
              onOptionsPress={() => handleOptionsPress(item)}
            />
          </Swipeable>
        )}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="musical-notes-outline" size={64} color={colors.textMuted} />
            <Text style={[styles.emptyTitle, { color: colors.text }]}>
              No playlists yet
            </Text>
            <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
              Create your first playlist to get started
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
          playlists.length === 0 && styles.emptyList,
        ]}
      />

      <ActionSheet
        visible={showActionSheet}
        onClose={() => setShowActionSheet(false)}
        title={selectedPlaylist?.name}
        options={actionSheetOptions}
      />

      {renderCreateModal()}
      {renderRenameModal()}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.md,
  },
  title: {
    ...typography.h1,
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.full,
    justifyContent: 'center',
    alignItems: 'center',
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
  swipeActions: {
    flexDirection: 'row',
    marginVertical: spacing.xs,
  },
  swipeAction: {
    width: 60,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: borderRadius.md,
    marginLeft: spacing.xs,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  modalContent: {
    width: '100%',
    maxWidth: 320,
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
  },
  modalTitle: {
    ...typography.h3,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  modalInput: {
    ...typography.body,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    marginBottom: spacing.lg,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  modalButton: {
    flex: 1,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    alignItems: 'center',
  },
  modalButtonText: {
    ...typography.body,
    fontWeight: '600',
  },
});
