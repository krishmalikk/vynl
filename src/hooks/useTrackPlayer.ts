import { useEffect, useRef } from 'react';
import { Alert } from 'react-native';
import TrackPlayer, {
  Event,
  State,
  usePlaybackState,
  useProgress,
  useActiveTrack,
} from 'react-native-track-player';
import { usePlayerStore } from '../store/usePlayerStore';
import { Track } from '../types';

// Hook to sync TrackPlayer state with our store
export const useTrackPlayerSync = () => {
  const {
    setIsPlaying,
    setIsLoading,
    setPosition,
    setDuration,
    setCurrentTrack,
    setQueueIndex,
    queue,
  } = usePlayerStore();

  const playbackState = usePlaybackState();
  const progress = useProgress(1000); // Update every second
  const activeTrack = useActiveTrack();

  // Sync playback state
  useEffect(() => {
    const state = playbackState.state as unknown as string | undefined;
    setIsPlaying(state === State.Playing);
    setIsLoading(state === 'loading' || state === 'buffering');
  }, [playbackState.state, setIsPlaying, setIsLoading]);

  // Sync progress
  useEffect(() => {
    setPosition(progress.position);
    setDuration(progress.duration);
  }, [progress.position, progress.duration, setPosition, setDuration]);

  // Sync current track
  useEffect(() => {
    if (activeTrack) {
      // Find matching track in our queue
      const queueIndex = queue.findIndex(
        (t) => t.queueId === activeTrack.id || t.id === activeTrack.id
      );

      if (queueIndex !== -1) {
        setQueueIndex(queueIndex);
        setCurrentTrack(queue[queueIndex]);
      }
    }
  }, [activeTrack, queue, setCurrentTrack, setQueueIndex]);
};

// Hook for playback controls
export const usePlaybackControls = () => {
  const {
    playTrack,
    playNext,
    addToQueue,
    toggleShuffle,
    cycleRepeatMode,
    shuffleEnabled,
    repeatMode,
  } = usePlayerStore();

  const togglePlayPause = async () => {
    const state = await TrackPlayer.getPlaybackState();
    if (state.state === State.Playing) {
      await TrackPlayer.pause();
    } else {
      await TrackPlayer.play();
    }
  };

  const skipToNext = async () => {
    await TrackPlayer.skipToNext();
  };

  const skipToPrevious = async () => {
    const progress = await TrackPlayer.getProgress();
    if (progress.position > 3) {
      await TrackPlayer.seekTo(0);
    } else {
      await TrackPlayer.skipToPrevious();
    }
  };

  const seekTo = async (position: number) => {
    await TrackPlayer.seekTo(position);
  };

  return {
    togglePlayPause,
    skipToNext,
    skipToPrevious,
    seekTo,
    playTrack,
    playNext,
    addToQueue,
    toggleShuffle,
    cycleRepeatMode,
    shuffleEnabled,
    repeatMode,
  };
};

// Hook for current playback info
export const useNowPlaying = () => {
  const {
    currentTrack,
    isPlaying,
    isLoading,
    position,
    duration,
    shuffleEnabled,
    repeatMode,
    queue,
    queueIndex,
  } = usePlayerStore();

  const progress = duration > 0 ? position / duration : 0;

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return {
    currentTrack,
    isPlaying,
    isLoading,
    position,
    duration,
    progress,
    shuffleEnabled,
    repeatMode,
    queue,
    queueIndex,
    hasNext: queueIndex < queue.length - 1,
    hasPrevious: queueIndex > 0 || position > 3,
    positionFormatted: formatTime(position),
    durationFormatted: formatTime(duration),
  };
};

// Hook to handle playback errors and show user-friendly alerts
export const usePlaybackErrorHandler = () => {
  useEffect(() => {
    const subscription = TrackPlayer.addEventListener(Event.PlaybackError, (error) => {
      console.error('[TrackPlayer] Playback error caught by handler:', error);
      Alert.alert(
        'Playback Error',
        'This track cannot be played. It may be unavailable or in an unsupported format.',
        [{ text: 'OK' }]
      );
    });

    return () => subscription.remove();
  }, []);
};
