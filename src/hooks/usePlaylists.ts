import { useState, useEffect, useCallback } from 'react';
import { Playlist, StoredTrack } from '../types';
import { playlistStorage, getTracksByIds } from '../services/storage';

// Hook for managing playlists
export const usePlaylists = () => {
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadPlaylists = useCallback(async () => {
    setIsLoading(true);
    const data = await playlistStorage.getAll();
    setPlaylists(data);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    loadPlaylists();
  }, [loadPlaylists]);

  const createPlaylist = async (name: string): Promise<Playlist> => {
    const newPlaylist = await playlistStorage.create(name);
    setPlaylists((prev) => [newPlaylist, ...prev]);
    return newPlaylist;
  };

  const renamePlaylist = async (playlistId: string, newName: string) => {
    await playlistStorage.rename(playlistId, newName);
    setPlaylists((prev) =>
      prev.map((p) =>
        p.id === playlistId
          ? { ...p, name: newName, updatedAt: Date.now() }
          : p
      )
    );
  };

  const deletePlaylist = async (playlistId: string) => {
    await playlistStorage.delete(playlistId);
    setPlaylists((prev) => prev.filter((p) => p.id !== playlistId));
  };

  const addTrackToPlaylist = async (playlistId: string, trackId: string) => {
    await playlistStorage.addTrack(playlistId, trackId);
    setPlaylists((prev) =>
      prev.map((p) =>
        p.id === playlistId
          ? {
              ...p,
              trackIds: [...p.trackIds, trackId],
              updatedAt: Date.now(),
            }
          : p
      )
    );
  };

  const removeTrackFromPlaylist = async (
    playlistId: string,
    trackId: string
  ) => {
    await playlistStorage.removeTrack(playlistId, trackId);
    setPlaylists((prev) =>
      prev.map((p) =>
        p.id === playlistId
          ? {
              ...p,
              trackIds: p.trackIds.filter((id) => id !== trackId),
              updatedAt: Date.now(),
            }
          : p
      )
    );
  };

  const reorderPlaylistTracks = async (
    playlistId: string,
    trackIds: string[]
  ) => {
    await playlistStorage.reorderTracks(playlistId, trackIds);
    setPlaylists((prev) =>
      prev.map((p) =>
        p.id === playlistId
          ? { ...p, trackIds, updatedAt: Date.now() }
          : p
      )
    );
  };

  return {
    playlists,
    isLoading,
    refresh: loadPlaylists,
    createPlaylist,
    renamePlaylist,
    deletePlaylist,
    addTrackToPlaylist,
    removeTrackFromPlaylist,
    reorderPlaylistTracks,
  };
};

// Hook for a single playlist with tracks
export const usePlaylistDetail = (playlistId: string) => {
  const [playlist, setPlaylist] = useState<Playlist | null>(null);
  const [tracks, setTracks] = useState<StoredTrack[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadPlaylist = useCallback(async () => {
    if (!playlistId) return;

    setIsLoading(true);
    const playlistData = await playlistStorage.getById(playlistId);
    setPlaylist(playlistData);

    if (playlistData) {
      const trackData = await getTracksByIds(playlistData.trackIds);
      setTracks(trackData);
    }

    setIsLoading(false);
  }, [playlistId]);

  useEffect(() => {
    loadPlaylist();
  }, [loadPlaylist]);

  const removeTrack = async (trackId: string) => {
    await playlistStorage.removeTrack(playlistId, trackId);
    setTracks((prev) => prev.filter((t) => t.id !== trackId));
    setPlaylist((prev) =>
      prev
        ? {
            ...prev,
            trackIds: prev.trackIds.filter((id) => id !== trackId),
            updatedAt: Date.now(),
          }
        : null
    );
  };

  const reorderTracks = async (fromIndex: number, toIndex: number) => {
    const newTracks = [...tracks];
    const [moved] = newTracks.splice(fromIndex, 1);
    newTracks.splice(toIndex, 0, moved);

    setTracks(newTracks);

    const newTrackIds = newTracks.map((t) => t.id);
    await playlistStorage.reorderTracks(playlistId, newTrackIds);
    setPlaylist((prev) =>
      prev ? { ...prev, trackIds: newTrackIds, updatedAt: Date.now() } : null
    );
  };

  return {
    playlist,
    tracks,
    isLoading,
    refresh: loadPlaylist,
    removeTrack,
    reorderTracks,
  };
};
