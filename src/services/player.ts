import TrackPlayer, {
  AppKilledPlaybackBehavior,
  Capability,
  Event,
  RepeatMode as TPRepeatMode,
  State,
  Track as TPTrack,
} from 'react-native-track-player';
import { Track, QueueItem } from '../types';

// Convert our Track type to TrackPlayer's format
export const toTrackPlayerTrack = (track: Track | QueueItem): TPTrack => ({
  id: 'queueId' in track ? track.queueId : track.id,
  url: track.audioUrl,
  title: track.title,
  artist: track.artist,
  artwork: track.thumbnailUrl,
  duration: track.duration,
});

// Initialize the player
export const setupPlayer = async (): Promise<boolean> => {
  try {
    // Always try to set up the player - catch error if already initialized
    try {
      await TrackPlayer.setupPlayer({
        autoHandleInterruptions: true,
      });
      console.log('[TrackPlayer] Player setup complete');
    } catch (setupError: any) {
      // If already initialized, that's fine - continue with updateOptions
      if (setupError?.message?.includes('already been initialized')) {
        console.log('[TrackPlayer] Player was already initialized, continuing...');
      } else {
        throw setupError;
      }
    }

    await TrackPlayer.updateOptions({
      // Enable background playback
      android: {
        appKilledPlaybackBehavior: AppKilledPlaybackBehavior.ContinuePlayback,
      },
      // Capabilities for lock screen / notification controls
      capabilities: [
        Capability.Play,
        Capability.Pause,
        Capability.SkipToNext,
        Capability.SkipToPrevious,
        Capability.SeekTo,
        Capability.Stop,
      ],
      compactCapabilities: [
        Capability.Play,
        Capability.Pause,
        Capability.SkipToNext,
      ],
      // Lock screen progress bar
      progressUpdateEventInterval: 1,
    });

    return true;
  } catch (error) {
    console.error('Error setting up player:', error);
    return false;
  }
};

// Playback service - handles background events
export const PlaybackService = async () => {
  TrackPlayer.addEventListener(Event.RemotePlay, () => TrackPlayer.play());
  TrackPlayer.addEventListener(Event.RemotePause, () => TrackPlayer.pause());
  TrackPlayer.addEventListener(Event.RemoteStop, () => TrackPlayer.stop());
  TrackPlayer.addEventListener(Event.RemoteNext, () => TrackPlayer.skipToNext());
  TrackPlayer.addEventListener(Event.RemotePrevious, () => TrackPlayer.skipToPrevious());
  TrackPlayer.addEventListener(Event.RemoteSeek, (event) => {
    TrackPlayer.seekTo(event.position);
  });

  // Debug: Log playback state changes
  TrackPlayer.addEventListener(Event.PlaybackState, (event) => {
    console.log('[TrackPlayer] State changed:', event.state);
  });

  // Debug: Log when track changes
  TrackPlayer.addEventListener(Event.PlaybackActiveTrackChanged, (event) => {
    console.log('[TrackPlayer] Active track changed:', event.track?.title, 'URL:', event.track?.url?.substring(0, 50));
  });

  // Handle playback errors
  TrackPlayer.addEventListener(Event.PlaybackError, (error) => {
    console.error('[TrackPlayer] Playback error:', error);
  });
};

// Player control functions
export const playerControls = {
  async play() {
    await TrackPlayer.play();
  },

  async pause() {
    await TrackPlayer.pause();
  },

  async togglePlayPause() {
    const state = await TrackPlayer.getPlaybackState();
    if (state.state === State.Playing) {
      await TrackPlayer.pause();
    } else {
      await TrackPlayer.play();
    }
  },

  async skipToNext() {
    await TrackPlayer.skipToNext();
  },

  async skipToPrevious() {
    const position = await TrackPlayer.getProgress();
    // If more than 3 seconds in, restart track instead
    if (position.position > 3) {
      await TrackPlayer.seekTo(0);
    } else {
      await TrackPlayer.skipToPrevious();
    }
  },

  async seekTo(position: number) {
    await TrackPlayer.seekTo(position);
  },

  async setRepeatMode(mode: 'off' | 'one' | 'all') {
    const modeMap = {
      off: TPRepeatMode.Off,
      one: TPRepeatMode.Track,
      all: TPRepeatMode.Queue,
    };
    await TrackPlayer.setRepeatMode(modeMap[mode]);
  },

  async addToQueue(tracks: Track[]) {
    const tpTracks = tracks.map(toTrackPlayerTrack);
    await TrackPlayer.add(tpTracks);
  },

  async playTrack(track: Track, queue?: Track[]) {
    console.log('[TrackPlayer] playTrack called with:', track.title);
    console.log('[TrackPlayer] Audio URL:', track.audioUrl?.substring(0, 80));

    await TrackPlayer.reset();

    if (queue && queue.length > 0) {
      const tpTracks = queue.map(toTrackPlayerTrack);
      console.log('[TrackPlayer] Adding queue with', tpTracks.length, 'tracks');
      await TrackPlayer.add(tpTracks);
      const index = queue.findIndex(t => t.id === track.id);
      if (index > 0) {
        await TrackPlayer.skip(index);
      }
    } else {
      const tpTrack = toTrackPlayerTrack(track);
      console.log('[TrackPlayer] Adding single track:', tpTrack);
      await TrackPlayer.add(tpTrack);
    }

    console.log('[TrackPlayer] Calling play()...');
    await TrackPlayer.play();
    console.log('[TrackPlayer] play() called successfully');
  },

  async playNext(track: Track) {
    const queue = await TrackPlayer.getQueue();
    const currentIndex = await TrackPlayer.getActiveTrackIndex();
    const insertIndex = (currentIndex ?? 0) + 1;
    await TrackPlayer.add(toTrackPlayerTrack(track), insertIndex);
  },

  async clearQueue() {
    await TrackPlayer.reset();
  },

  async removeFromQueue(index: number) {
    await TrackPlayer.remove(index);
  },

  async skipToIndex(index: number) {
    await TrackPlayer.skip(index);
  },

  async getQueue(): Promise<TPTrack[]> {
    return TrackPlayer.getQueue();
  },

  async getCurrentTrackIndex(): Promise<number | undefined> {
    return TrackPlayer.getActiveTrackIndex();
  },
};
