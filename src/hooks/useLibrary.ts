import { useState, useEffect, useCallback } from 'react';
import { StoredTrack, Track } from '../types';
import { libraryStorage } from '../services/storage';

export const useLibrary = () => {
  const [tracks, setTracks] = useState<StoredTrack[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadLibrary = useCallback(async () => {
    setIsLoading(true);
    const data = await libraryStorage.getAll();
    setTracks(data);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    loadLibrary();
  }, [loadLibrary]);

  const addTrack = async (track: Track): Promise<StoredTrack> => {
    const storedTrack = await libraryStorage.add(track);
    setTracks((prev) => {
      // Don't add if already exists
      if (prev.some((t) => t.id === track.id)) {
        return prev;
      }
      return [storedTrack, ...prev];
    });
    return storedTrack;
  };

  const removeTrack = async (trackId: string) => {
    await libraryStorage.remove(trackId);
    setTracks((prev) => prev.filter((t) => t.id !== trackId));
  };

  const isInLibrary = (trackId: string): boolean => {
    return tracks.some((t) => t.id === trackId);
  };

  const toggleLibrary = async (track: Track): Promise<boolean> => {
    if (isInLibrary(track.id)) {
      await removeTrack(track.id);
      return false;
    } else {
      await addTrack(track);
      return true;
    }
  };

  return {
    tracks,
    isLoading,
    refresh: loadLibrary,
    addTrack,
    removeTrack,
    isInLibrary,
    toggleLibrary,
  };
};
