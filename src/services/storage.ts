import AsyncStorage from '@react-native-async-storage/async-storage';
import { StoredTrack, Playlist, Track } from '../types';

const KEYS = {
  LIBRARY: 'library_tracks',
  PLAYLISTS: 'playlists',
};

// Generate unique ID
const generateId = () => `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

// ============ Library (Saved Tracks) ============

export const libraryStorage = {
  async getAll(): Promise<StoredTrack[]> {
    try {
      const data = await AsyncStorage.getItem(KEYS.LIBRARY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error getting library:', error);
      return [];
    }
  },

  async add(track: Track): Promise<StoredTrack> {
    const library = await this.getAll();

    // Check if already exists
    const exists = library.some((t) => t.id === track.id);
    if (exists) {
      return library.find((t) => t.id === track.id)!;
    }

    const storedTrack: StoredTrack = {
      ...track,
      addedAt: Date.now(),
    };

    library.unshift(storedTrack); // Add to beginning
    await AsyncStorage.setItem(KEYS.LIBRARY, JSON.stringify(library));
    return storedTrack;
  },

  async remove(trackId: string): Promise<void> {
    const library = await this.getAll();
    const filtered = library.filter((t) => t.id !== trackId);
    await AsyncStorage.setItem(KEYS.LIBRARY, JSON.stringify(filtered));
  },

  async isInLibrary(trackId: string): Promise<boolean> {
    const library = await this.getAll();
    return library.some((t) => t.id === trackId);
  },

  async clear(): Promise<void> {
    await AsyncStorage.removeItem(KEYS.LIBRARY);
  },
};

// ============ Playlists ============

export const playlistStorage = {
  async getAll(): Promise<Playlist[]> {
    try {
      const data = await AsyncStorage.getItem(KEYS.PLAYLISTS);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error getting playlists:', error);
      return [];
    }
  },

  async getById(playlistId: string): Promise<Playlist | null> {
    const playlists = await this.getAll();
    return playlists.find((p) => p.id === playlistId) || null;
  },

  async create(name: string): Promise<Playlist> {
    const playlists = await this.getAll();

    const newPlaylist: Playlist = {
      id: generateId(),
      name,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      trackIds: [],
    };

    playlists.unshift(newPlaylist);
    await AsyncStorage.setItem(KEYS.PLAYLISTS, JSON.stringify(playlists));
    return newPlaylist;
  },

  async rename(playlistId: string, newName: string): Promise<void> {
    const playlists = await this.getAll();
    const index = playlists.findIndex((p) => p.id === playlistId);

    if (index !== -1) {
      playlists[index].name = newName;
      playlists[index].updatedAt = Date.now();
      await AsyncStorage.setItem(KEYS.PLAYLISTS, JSON.stringify(playlists));
    }
  },

  async delete(playlistId: string): Promise<void> {
    const playlists = await this.getAll();
    const filtered = playlists.filter((p) => p.id !== playlistId);
    await AsyncStorage.setItem(KEYS.PLAYLISTS, JSON.stringify(filtered));
  },

  async addTrack(playlistId: string, trackId: string): Promise<void> {
    const playlists = await this.getAll();
    const index = playlists.findIndex((p) => p.id === playlistId);

    if (index !== -1) {
      // Don't add duplicates
      if (!playlists[index].trackIds.includes(trackId)) {
        playlists[index].trackIds.push(trackId);
        playlists[index].updatedAt = Date.now();
        await AsyncStorage.setItem(KEYS.PLAYLISTS, JSON.stringify(playlists));
      }
    }
  },

  async removeTrack(playlistId: string, trackId: string): Promise<void> {
    const playlists = await this.getAll();
    const index = playlists.findIndex((p) => p.id === playlistId);

    if (index !== -1) {
      playlists[index].trackIds = playlists[index].trackIds.filter(
        (id) => id !== trackId
      );
      playlists[index].updatedAt = Date.now();
      await AsyncStorage.setItem(KEYS.PLAYLISTS, JSON.stringify(playlists));
    }
  },

  async reorderTracks(playlistId: string, trackIds: string[]): Promise<void> {
    const playlists = await this.getAll();
    const index = playlists.findIndex((p) => p.id === playlistId);

    if (index !== -1) {
      playlists[index].trackIds = trackIds;
      playlists[index].updatedAt = Date.now();
      await AsyncStorage.setItem(KEYS.PLAYLISTS, JSON.stringify(playlists));
    }
  },

  async clear(): Promise<void> {
    await AsyncStorage.removeItem(KEYS.PLAYLISTS);
  },
};

// ============ Backup & Restore ============

export const backupRestore = {
  async createBackup(): Promise<string> {
    const library = await libraryStorage.getAll();
    const playlists = await playlistStorage.getAll();

    const backup = {
      version: 1,
      createdAt: Date.now(),
      library,
      playlists,
    };

    // Encode as base64 for easy sharing
    return btoa(JSON.stringify(backup));
  },

  async restoreFromBackup(backupCode: string): Promise<boolean> {
    try {
      const backup = JSON.parse(atob(backupCode));

      if (!backup.version || !backup.library || !backup.playlists) {
        throw new Error('Invalid backup format');
      }

      await AsyncStorage.setItem(KEYS.LIBRARY, JSON.stringify(backup.library));
      await AsyncStorage.setItem(KEYS.PLAYLISTS, JSON.stringify(backup.playlists));

      return true;
    } catch (error) {
      console.error('Error restoring backup:', error);
      return false;
    }
  },

  async clearAllData(): Promise<void> {
    await libraryStorage.clear();
    await playlistStorage.clear();
  },
};

// ============ Get tracks by IDs ============

export const getTracksByIds = async (trackIds: string[]): Promise<StoredTrack[]> => {
  const library = await libraryStorage.getAll();
  const trackMap = new Map(library.map((t) => [t.id, t]));

  return trackIds
    .map((id) => trackMap.get(id))
    .filter((t): t is StoredTrack => t !== undefined);
};
