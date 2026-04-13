// Core track interface - you provide the audioUrl from your source
export interface Track {
  id: string;
  sourceId: string;      // Your source's ID (e.g., video ID)
  title: string;
  artist: string;
  thumbnailUrl: string;
  duration: number;      // seconds
  audioUrl: string;      // Direct audio URL for playback
}

// Stored track with additional metadata
export interface StoredTrack extends Track {
  addedAt: number;       // timestamp
}

// Playlist
export interface Playlist {
  id: string;
  name: string;
  createdAt: number;
  updatedAt: number;
  trackIds: string[];
}

// Search result from your search service
export interface SearchResult {
  tracks: Track[];
  nextPageToken?: string;
}

// Queue item with additional context
export interface QueueItem extends Track {
  queueId: string;       // unique ID for this queue position
}

// Player state
export type RepeatMode = 'off' | 'one' | 'all';

export interface PlayerState {
  currentTrack: Track | null;
  queue: QueueItem[];
  queueIndex: number;
  isPlaying: boolean;
  isLoading: boolean;
  position: number;      // current position in seconds
  duration: number;      // total duration in seconds
  shuffleEnabled: boolean;
  repeatMode: RepeatMode;
}

// Shared playlist for Firebase
export interface SharedPlaylist {
  id: string;
  name: string;
  tracks: Track[];
  createdAt: number;
  createdBy?: string;
}

// Subscription state
export interface SubscriptionState {
  isSubscribed: boolean;
  expiresAt?: number;
  plan?: 'monthly' | 'yearly';
}
