/**
 * Firebase Service for Playlist Sharing
 *
 * Uses Firestore when `src/config/firebaseConfig.ts` is filled in, otherwise
 * falls back to an in-memory Map so the dev-skip flow still works.
 */

import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
  Firestore,
} from 'firebase/firestore';
import { Playlist, Track, SharedPlaylist } from '../types';
import { playlistStorage, getTracksByIds } from './storage';
import { isFirebaseConfigured } from '../config/firebaseConfig';
import { getFirebaseApp } from './firebaseApp';

const SHARE_BASE_URL = 'https://yourapp.com/playlist/';
const SHARED_PLAYLISTS_COLLECTION = 'sharedPlaylists';

const FIREBASE_ENABLED = isFirebaseConfigured();

let db: Firestore | null = null;
const getDb = (): Firestore | null => {
  if (db) return db;
  const app = getFirebaseApp();
  if (!app) return null;
  db = getFirestore(app);
  return db;
};

// In-memory fallback for when Firebase config hasn't been pasted in yet.
const mockSharedPlaylists = new Map<string, SharedPlaylist>();

// Generate a short shareable ID
const generateShareId = (): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

// ============ SHARING FUNCTIONS ============

/**
 * Share a playlist and get a shareable link
 */
export const sharePlaylist = async (playlistId: string): Promise<string | null> => {
  try {
    // Get the playlist and its tracks
    const playlist = await playlistStorage.getById(playlistId);
    if (!playlist) {
      console.error('Playlist not found');
      return null;
    }

    const tracks = await getTracksByIds(playlist.trackIds);

    // Create shared playlist object
    const shareId = generateShareId();
    const sharedPlaylist: SharedPlaylist = {
      id: shareId,
      name: playlist.name,
      tracks: tracks,
      createdAt: Date.now(),
    };

    const firestore = FIREBASE_ENABLED ? getDb() : null;
    if (firestore) {
      await setDoc(
        doc(firestore, SHARED_PLAYLISTS_COLLECTION, shareId),
        sharedPlaylist
      );
    } else {
      mockSharedPlaylists.set(shareId, sharedPlaylist);
    }

    return `${SHARE_BASE_URL}${shareId}`;
  } catch (error) {
    console.error('Error sharing playlist:', error);
    return null;
  }
};

/**
 * Get a shared playlist by its ID
 */
export const getSharedPlaylist = async (shareId: string): Promise<SharedPlaylist | null> => {
  try {
    const firestore = FIREBASE_ENABLED ? getDb() : null;
    if (firestore) {
      const snap = await getDoc(
        doc(firestore, SHARED_PLAYLISTS_COLLECTION, shareId)
      );
      return snap.exists() ? (snap.data() as SharedPlaylist) : null;
    }
    return mockSharedPlaylists.get(shareId) || null;
  } catch (error) {
    console.error('Error getting shared playlist:', error);
    return null;
  }
};

/**
 * Import a shared playlist to local storage
 */
export const importSharedPlaylist = async (shareId: string): Promise<Playlist | null> => {
  try {
    const sharedPlaylist = await getSharedPlaylist(shareId);
    if (!sharedPlaylist) {
      console.error('Shared playlist not found');
      return null;
    }

    // Create a new local playlist
    const newPlaylist = await playlistStorage.create(`${sharedPlaylist.name} (Imported)`);

    // Add tracks to library and playlist
    const { libraryStorage } = await import('./storage');
    for (const track of sharedPlaylist.tracks) {
      await libraryStorage.add(track);
      await playlistStorage.addTrack(newPlaylist.id, track.id);
    }

    // Update and return the playlist
    const updatedPlaylist = await playlistStorage.getById(newPlaylist.id);
    return updatedPlaylist;
  } catch (error) {
    console.error('Error importing shared playlist:', error);
    return null;
  }
};

/**
 * Parse a share URL to get the playlist ID
 */
export const parseShareUrl = (url: string): string | null => {
  try {
    // Handle both full URLs and just the ID
    if (url.startsWith(SHARE_BASE_URL)) {
      return url.replace(SHARE_BASE_URL, '');
    }
    // If it looks like just an ID (8 alphanumeric chars)
    if (/^[A-Za-z0-9]{8}$/.test(url)) {
      return url;
    }
    return null;
  } catch {
    return null;
  }
};

// ============ DEEP LINKING ============

/**
 * Handle incoming deep links
 * Call this in your app's deep link handler
 */
export const handleDeepLink = async (url: string): Promise<{
  type: 'playlist';
  data: SharedPlaylist;
} | null> => {
  const shareId = parseShareUrl(url);
  if (!shareId) {
    return null;
  }

  const playlist = await getSharedPlaylist(shareId);
  if (!playlist) {
    return null;
  }

  return {
    type: 'playlist',
    data: playlist,
  };
};

