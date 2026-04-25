/**
 * Search Service Interface
 *
 * YOU MUST IMPLEMENT THIS FILE with your own audio source.
 *
 * This service is called by the app to:
 * 1. Search for tracks
 * 2. Get trending/featured tracks
 * 3. Resolve audio URLs for playback
 *
 * The app expects tracks in this format:
 *
 * interface Track {
 *   id: string;           // Unique identifier
 *   sourceId: string;     // Your source's ID (e.g., video ID)
 *   title: string;
 *   artist: string;
 *   thumbnailUrl: string;
 *   duration: number;     // In seconds
 *   audioUrl: string;     // Direct audio URL for playback
 * }
 */

import { Track, SearchResult } from '../types';

// YOUR SELF-HOSTED PROXY URL
// For local testing: http://localhost:3000
// For production, deploy to Render and use that URL here:
const PROXY_URL = 'https://vynl-twh9.onrender.com'; // e.g. 'https://vynl-proxy.onrender.com'

/**
 * Thrown by resolveAudioUrl() when the source URL is in a format iOS
 * cannot play (e.g. Opus in a WebM container). Caught upstream in
 * usePlayerStore to surface a friendly error message.
 */
export class UnsupportedFormatError extends Error {
  constructor(message: string = 'Unsupported audio format') {
    super(message);
    this.name = 'UnsupportedFormatError';
  }
}

// ============ IMPLEMENT THESE FUNCTIONS ============

/**
 * Search for tracks by query
 * @param query - Search query string
 * @param pageToken - Optional pagination token for next page
 * @returns SearchResult with tracks array and optional nextPageToken
 */
export const searchTracks = async (
  query: string,
  pageToken?: string
): Promise<SearchResult> => {
  if (!query) return { tracks: [], nextPageToken: undefined };

  try {
    const url = new URL(`${PROXY_URL}/api/search`);
    url.searchParams.append('q', query);
    if (pageToken) url.searchParams.append('pageToken', pageToken);

    const response = await fetch(url.toString());
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Proxy search failed: ${response.status} ${errorText}`);
    }

    const data = await response.json();
    return {
      tracks: data.tracks || [],
      nextPageToken: data.nextPageToken,
    };
  } catch (error) {
    console.error(`[SearchService] Error searching tracks:`, error);
    return {
      tracks: getMockTracks().filter(t => 
        t.title.toLowerCase().includes(query.toLowerCase()) || 
        t.artist.toLowerCase().includes(query.toLowerCase())
      ),
      nextPageToken: undefined,
    };
  }
};

/**
 * Get trending/featured tracks for the home screen
 * @returns Array of tracks
 */
export const getTrendingTracks = async (): Promise<Track[]> => {
  try {
    const { tracks } = await searchTracks('trending music 2024');
    return tracks.length > 0 ? tracks : getMockTracks();
  } catch {
    return getMockTracks();
  }
};

/**
 * Get new releases for the home screen
 * @returns Array of tracks
 */
export const getNewReleases = async (): Promise<Track[]> => {
  try {
    const { tracks } = await searchTracks('new music releases');
    return tracks.length > 0 ? tracks.slice(0, 10) : getMockTracks();
  } catch {
    return getMockTracks().slice(0, 5);
  }
};

/**
 * Resolve/refresh the audio URL for a track using self-hosted proxy
 * @param track - Track to resolve
 * @returns Track with updated audioUrl
 */
export const resolveAudioUrl = async (track: Track): Promise<Track> => {
  if (!track.sourceId) return track;

  console.log(`[SearchService] Resolving audio URL for: ${track.title} (${track.sourceId})`);

  try {
    const response = await fetch(`${PROXY_URL}/api/audio?videoId=${track.sourceId}`);
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Proxy failed: ${response.status} ${errorText}`);
    }

    const data = await response.json();
    
    if (data.error) {
      throw new Error(`Proxy Error: ${data.message || data.error}`);
    }

    if (!data.audioUrl) {
      throw new Error('No audio URL returned from proxy');
    }

    console.log(`[SearchService] Resolved via proxy: ${data.audioUrl.substring(0, 50)}...`);

    return {
      ...track,
      audioUrl: data.audioUrl,
    };
  } catch (error) {
    console.error(`[SearchService] Error resolving audio URL via proxy:`, error);
    throw error;
  }
};

export interface ArtistSummary {
  name: string;
  monthlyListeners: string;
  albumCount: number;
  trackCount: number;
  topTracks: Track[];
}

/**
 * Returns a mock artist summary derived from the mock track list.
 */
export const getArtist = async (artistName: string): Promise<ArtistSummary> => {
  const all = getMockTracks();
  const topTracks = all.filter((t) => t.artist === artistName);
  const padded = topTracks.length > 0 ? topTracks : all.slice(0, 3);
  const listeners = (artistName.length * 7.3).toFixed(1) + 'M';
  return {
    name: artistName,
    monthlyListeners: listeners,
    albumCount: Math.max(1, artistName.length % 12),
    trackCount: padded.length * 12,
    topTracks: padded,
  };
};

// ============ MOCK DATA WITH VALID YOUTUBE IDs ============

const getMockTracks = (): Track[] => [
  {
    id: 'yt_dQw4w9WgXcQ',
    sourceId: 'dQw4w9WgXcQ',
    title: 'Never Gonna Give You Up',
    artist: 'Rick Astley',
    thumbnailUrl: 'https://i.ytimg.com/vi/dQw4w9WgXcQ/hqdefault.jpg',
    duration: 212,
    audioUrl: '',
  },
  {
    id: 'yt_9bZkp7q19f0',
    sourceId: '9bZkp7q19f0',
    title: 'Gangnam Style',
    artist: 'PSY',
    thumbnailUrl: 'https://i.ytimg.com/vi/9bZkp7q19f0/hqdefault.jpg',
    duration: 252,
    audioUrl: '',
  },
  {
    id: 'yt_kJQP7kiw5Fk',
    sourceId: 'kJQP7kiw5Fk',
    title: 'Despacito',
    artist: 'Luis Fonsi ft. Daddy Yankee',
    thumbnailUrl: 'https://i.ytimg.com/vi/kJQP7kiw5Fk/hqdefault.jpg',
    duration: 282,
    audioUrl: '',
  },
  {
    id: 'yt_RgKAFK5djSk',
    sourceId: 'RgKAFK5djSk',
    title: 'See You Again',
    artist: 'Wiz Khalifa ft. Charlie Puth',
    thumbnailUrl: 'https://i.ytimg.com/vi/RgKAFK5djSk/hqdefault.jpg',
    duration: 237,
    audioUrl: '',
  },
  {
    id: 'yt_OPf0YbXqDm0',
    sourceId: 'OPf0YbXqDm0',
    title: 'Uptown Funk',
    artist: 'Mark Ronson ft. Bruno Mars',
    thumbnailUrl: 'https://i.ytimg.com/vi/OPf0YbXqDm0/hqdefault.jpg',
    duration: 271,
    audioUrl: '',
  },
  {
    id: 'yt_JGwWNGJdvx8',
    sourceId: 'JGwWNGJdvx8',
    title: 'Shape of You',
    artist: 'Ed Sheeran',
    thumbnailUrl: 'https://i.ytimg.com/vi/JGwWNGJdvx8/hqdefault.jpg',
    duration: 234,
    audioUrl: '',
  },
  {
    id: 'yt_fRh_vgS2dFE',
    sourceId: 'fRh_vgS2dFE',
    title: 'Sorry',
    artist: 'Justin Bieber',
    thumbnailUrl: 'https://i.ytimg.com/vi/fRh_vgS2dFE/hqdefault.jpg',
    duration: 200,
    audioUrl: '',
  },
  {
    id: 'yt_CevxZvSJLk8',
    sourceId: 'CevxZvSJLk8',
    title: 'Roar',
    artist: 'Katy Perry',
    thumbnailUrl: 'https://i.ytimg.com/vi/CevxZvSJLk8/hqdefault.jpg',
    duration: 224,
    audioUrl: '',
  },
];

