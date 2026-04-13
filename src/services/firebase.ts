/**
 * Firebase Service for Playlist Sharing
 *
 * This file provides playlist sharing functionality via Firebase.
 * To use this:
 * 1. Create a Firebase project at https://console.firebase.google.com
 * 2. Enable Firestore Database
 * 3. Enable Dynamic Links (or use custom deep links)
 * 4. Install @react-native-firebase/app and @react-native-firebase/firestore
 * 5. Add your firebase config
 *
 * For now, this provides a mock implementation for testing.
 */

import { Playlist, Track, SharedPlaylist } from '../types';
import { playlistStorage, getTracksByIds } from './storage';

// ============ CONFIGURATION ============
// Replace with your Firebase config when ready
const FIREBASE_ENABLED = false;
const SHARE_BASE_URL = 'https://yourapp.com/playlist/';

// ============ MOCK STORAGE ============
// In-memory storage for demo (replace with Firebase Firestore)
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

    if (FIREBASE_ENABLED) {
      // TODO: Upload to Firebase Firestore
      // await firestore().collection('sharedPlaylists').doc(shareId).set(sharedPlaylist);
    } else {
      // Mock storage
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
    if (FIREBASE_ENABLED) {
      // TODO: Fetch from Firebase Firestore
      // const doc = await firestore().collection('sharedPlaylists').doc(shareId).get();
      // if (doc.exists) {
      //   return doc.data() as SharedPlaylist;
      // }
      return null;
    } else {
      // Mock storage
      return mockSharedPlaylists.get(shareId) || null;
    }
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

// ============ FIREBASE SETUP INSTRUCTIONS ============
/*
To enable Firebase sharing:

1. Install Firebase:
   npx expo install @react-native-firebase/app @react-native-firebase/firestore

2. Create a Firebase project and add iOS/Android apps

3. Download and add config files:
   - iOS: GoogleService-Info.plist to ios/
   - Android: google-services.json to android/app/

4. Initialize Firebase in this file:
   import firestore from '@react-native-firebase/firestore';

5. Set FIREBASE_ENABLED = true above

6. Create Firestore security rules:
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       match /sharedPlaylists/{playlistId} {
         allow read: if true;
         allow create: if request.resource.data.keys().hasAll(['id', 'name', 'tracks', 'createdAt']);
       }
     }
   }

7. For Dynamic Links (optional):
   npx expo install @react-native-firebase/dynamic-links
   Configure in Firebase Console > Dynamic Links

8. Update SHARE_BASE_URL to your dynamic link domain
*/
