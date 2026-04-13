import { create } from 'zustand';
import { Alert } from 'react-native';
import { Track, QueueItem, RepeatMode } from '../types';
import { playerControls, toTrackPlayerTrack } from '../services/player';
import { resolveAudioUrl, UnsupportedFormatError } from '../services/search';

// Generate unique queue ID
const generateQueueId = () => `queue_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

// Convert Track to QueueItem
const toQueueItem = (track: Track): QueueItem => ({
  ...track,
  queueId: generateQueueId(),
});

interface PlayerStore {
  // State
  currentTrack: Track | null;
  queue: QueueItem[];
  queueIndex: number;
  isPlaying: boolean;
  isLoading: boolean;
  position: number;
  duration: number;
  shuffleEnabled: boolean;
  repeatMode: RepeatMode;

  // Original queue for unshuffle
  originalQueue: QueueItem[];

  // Actions
  setCurrentTrack: (track: Track | null) => void;
  setIsPlaying: (playing: boolean) => void;
  setIsLoading: (loading: boolean) => void;
  setPosition: (position: number) => void;
  setDuration: (duration: number) => void;
  setQueueIndex: (index: number) => void;

  // Playback actions
  playTrack: (track: Track, tracks?: Track[]) => Promise<void>;
  playNext: (track: Track) => Promise<void>;
  addToQueue: (track: Track) => Promise<void>;
  removeFromQueue: (queueId: string) => void;
  skipToQueueItem: (queueId: string) => Promise<void>;
  reorderQueue: (fromIndex: number, toIndex: number) => void;
  clearQueue: () => void;

  // Shuffle & Repeat
  toggleShuffle: () => void;
  cycleRepeatMode: () => void;
}

export const usePlayerStore = create<PlayerStore>((set, get) => ({
  // Initial state
  currentTrack: null,
  queue: [],
  queueIndex: 0,
  isPlaying: false,
  isLoading: false,
  position: 0,
  duration: 0,
  shuffleEnabled: false,
  repeatMode: 'off',
  originalQueue: [],

  // State setters
  setCurrentTrack: (track) => set({ currentTrack: track }),
  setIsPlaying: (isPlaying) => set({ isPlaying }),
  setIsLoading: (isLoading) => set({ isLoading }),
  setPosition: (position) => set({ position }),
  setDuration: (duration) => set({ duration }),
  setQueueIndex: (queueIndex) => set({ queueIndex }),

  // Play a track, optionally with a queue
  playTrack: async (track, tracks) => {
    set({ isLoading: true });

    try {
      // Only resolve the audio URL for the track being played
      // Other tracks will be resolved on-demand when they start playing
      const resolvedTrack = await resolveAudioUrl(track);

      // Keep other tracks with their original (possibly empty) audioUrl
      // They'll be resolved when needed
      const trackList = tracks || [track];
      const resolvedTracks = trackList.map(t =>
        t.id === track.id ? resolvedTrack : t
      );

      const queueItems = resolvedTracks.map(toQueueItem);
      const currentIndex = resolvedTracks.findIndex(t => t.id === track.id);

      set({
        queue: queueItems,
        originalQueue: queueItems,
        queueIndex: Math.max(0, currentIndex),
        currentTrack: resolvedTrack,
        shuffleEnabled: false,
      });

      await playerControls.playTrack(resolvedTrack, resolvedTracks);
      set({ isPlaying: true, isLoading: false });
    } catch (error) {
      console.error('Error playing track:', error);
      set({ isLoading: false });

      // Show user-friendly error for unsupported formats
      if (error instanceof UnsupportedFormatError) {
        Alert.alert(
          'Cannot Play Track',
          'This track is not available in a format that iOS can play. Try a different track.',
          [{ text: 'OK' }]
        );
      }
    }
  },

  // Play next (insert after current)
  playNext: async (track) => {
    const { queue, queueIndex } = get();
    const resolvedTrack = await resolveAudioUrl(track);
    const queueItem = toQueueItem(resolvedTrack);

    const newQueue = [...queue];
    newQueue.splice(queueIndex + 1, 0, queueItem);

    set({ queue: newQueue });
    await playerControls.playNext(resolvedTrack);
  },

  // Add to end of queue
  addToQueue: async (track) => {
    const { queue } = get();
    const resolvedTrack = await resolveAudioUrl(track);
    const queueItem = toQueueItem(resolvedTrack);

    set({ queue: [...queue, queueItem] });
    await playerControls.addToQueue([resolvedTrack]);
  },

  // Remove from queue
  removeFromQueue: (queueId) => {
    const { queue, queueIndex } = get();
    const removeIndex = queue.findIndex(q => q.queueId === queueId);

    if (removeIndex === -1) return;

    const newQueue = queue.filter(q => q.queueId !== queueId);
    const newIndex = removeIndex < queueIndex ? queueIndex - 1 : queueIndex;

    set({ queue: newQueue, queueIndex: Math.max(0, newIndex) });
    playerControls.removeFromQueue(removeIndex);
  },

  // Skip to specific queue item
  skipToQueueItem: async (queueId) => {
    const { queue } = get();
    const index = queue.findIndex(q => q.queueId === queueId);

    if (index !== -1) {
      set({ queueIndex: index, currentTrack: queue[index] });
      await playerControls.skipToIndex(index);
    }
  },

  // Reorder queue (for drag and drop)
  reorderQueue: (fromIndex, toIndex) => {
    const { queue, queueIndex } = get();
    const newQueue = [...queue];
    const [moved] = newQueue.splice(fromIndex, 1);
    newQueue.splice(toIndex, 0, moved);

    // Adjust current index if needed
    let newQueueIndex = queueIndex;
    if (fromIndex === queueIndex) {
      newQueueIndex = toIndex;
    } else if (fromIndex < queueIndex && toIndex >= queueIndex) {
      newQueueIndex--;
    } else if (fromIndex > queueIndex && toIndex <= queueIndex) {
      newQueueIndex++;
    }

    set({ queue: newQueue, queueIndex: newQueueIndex });
  },

  // Clear queue
  clearQueue: () => {
    set({
      queue: [],
      originalQueue: [],
      queueIndex: 0,
      currentTrack: null,
      isPlaying: false,
    });
    playerControls.clearQueue();
  },

  // Toggle shuffle
  toggleShuffle: () => {
    const { shuffleEnabled, queue, queueIndex, originalQueue } = get();

    if (!shuffleEnabled) {
      // Enable shuffle - shuffle remaining tracks
      const currentTrack = queue[queueIndex];
      const remainingTracks = queue.slice(queueIndex + 1);

      // Fisher-Yates shuffle
      for (let i = remainingTracks.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [remainingTracks[i], remainingTracks[j]] = [remainingTracks[j], remainingTracks[i]];
      }

      const newQueue = [
        ...queue.slice(0, queueIndex + 1),
        ...remainingTracks,
      ];

      set({ shuffleEnabled: true, queue: newQueue });
    } else {
      // Disable shuffle - restore original order from current position
      const currentTrack = queue[queueIndex];
      const currentOriginalIndex = originalQueue.findIndex(
        q => q.queueId === currentTrack?.queueId
      );

      if (currentOriginalIndex !== -1) {
        set({
          shuffleEnabled: false,
          queue: originalQueue,
          queueIndex: currentOriginalIndex,
        });
      } else {
        set({ shuffleEnabled: false });
      }
    }
  },

  // Cycle through repeat modes: off -> all -> one -> off
  cycleRepeatMode: () => {
    const { repeatMode } = get();
    const modes: RepeatMode[] = ['off', 'all', 'one'];
    const currentIndex = modes.indexOf(repeatMode);
    const nextMode = modes[(currentIndex + 1) % modes.length];

    set({ repeatMode: nextMode });
    playerControls.setRepeatMode(nextMode);
  },
}));
