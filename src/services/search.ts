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

// ============ IMPLEMENT THESE FUNCTIONS ============

/**
 * Search for tracks by query
 * @param query - Search query string
 * @param pageToken - Optional pagination token for next page
 * @returns SearchResult with tracks array and optional nextPageToken
 *
 * ┌─────────────────────────────────────────────────────────────────┐
 * │ YOUR IMPLEMENTATION GOES HERE                                   │
 * │                                                                 │
 * │ 1. Query YouTube search (Data API v3 or scrape mobile site)    │
 * │    - Use query parameter to search                             │
 * │    - Use pageToken for pagination                              │
 * │                                                                 │
 * │ 2. For each result, extract:                                   │
 * │    - videoId (sourceId)                                        │
 * │    - title, channel name (artist)                              │
 * │    - thumbnail URL                                             │
 * │    - duration                                                  │
 * │                                                                 │
 * │ 3. For audioUrl, you need to:                                  │
 * │    - Extract the audio stream URL from the video               │
 * │    - This is the part YOU implement yourself                   │
 * │    - Libraries like ytdl-core, youtube-dl, etc. exist          │
 * │    - Or use a WebView-based approach                           │
 * │                                                                 │
 * │ 4. Return tracks array with all fields populated               │
 * └─────────────────────────────────────────────────────────────────┘
 */
export const searchTracks = async (
  query: string,
  pageToken?: string
): Promise<SearchResult> => {
  // ═══════════════════════════════════════════════════════════════
  // YOUR YOUTUBE SEARCH + AUDIO EXTRACTION IMPLEMENTATION HERE
  // ═══════════════════════════════════════════════════════════════
  //
  // Example pseudocode:
  //
  // const searchResults = await youtubeSearch(query, pageToken);
  //
  // const tracks = await Promise.all(searchResults.items.map(async (item) => {
  //   const audioUrl = await extractAudioUrl(item.videoId); // <-- YOU IMPLEMENT THIS
  //   return {
  //     id: item.videoId,
  //     sourceId: item.videoId,
  //     title: item.title,
  //     artist: item.channelName,
  //     thumbnailUrl: `https://i.ytimg.com/vi/${item.videoId}/hqdefault.jpg`,
  //     duration: item.durationSeconds,
  //     audioUrl: audioUrl,  // <-- The extracted/circumvented audio URL
  //   };
  // }));
  //
  // return { tracks, nextPageToken: searchResults.nextPageToken };
  //
  // ═══════════════════════════════════════════════════════════════

  void query;      // Remove when implementing
  void pageToken;  // Remove when implementing

  console.warn('searchTracks not implemented - implement in src/services/search.ts');

  // Return mock data for testing UI
  return {
    tracks: getMockTracks(),
    nextPageToken: undefined,
  };
};

/**
 * Get trending/featured tracks for the home screen
 * @returns Array of tracks
 *
 * ┌─────────────────────────────────────────────────────────────────┐
 * │ YOUR IMPLEMENTATION GOES HERE                                   │
 * │                                                                 │
 * │ Options:                                                        │
 * │ - Fetch YouTube Music trending playlist                        │
 * │ - Query "trending music" or genre playlists                    │
 * │ - Use YouTube Data API playlistItems endpoint                  │
 * │                                                                 │
 * │ Same as searchTracks - extract audioUrl for each track         │
 * └─────────────────────────────────────────────────────────────────┘
 */
export const getTrendingTracks = async (): Promise<Track[]> => {
  // ═══════════════════════════════════════════════════════════════
  // YOUR TRENDING/CHARTS IMPLEMENTATION HERE
  // ═══════════════════════════════════════════════════════════════

  console.warn('getTrendingTracks not implemented - implement in src/services/search.ts');

  return getMockTracks();
};

/**
 * Get new releases for the home screen
 * @returns Array of tracks
 */
export const getNewReleases = async (): Promise<Track[]> => {
  // TODO: Implement your new releases logic here

  console.warn('getNewReleases not implemented - implement in src/services/search.ts');

  return getMockTracks().slice(0, 5);
};

/**
 * Resolve/refresh the audio URL for a track
 * Some sources have expiring URLs - use this to get a fresh URL
 * @param track - Track to resolve
 * @returns Track with updated audioUrl
 */
export const resolveAudioUrl = async (track: Track): Promise<Track> => {
  // TODO: Implement if your audio URLs expire
  // Otherwise, just return the track unchanged

  return track;
};

// ============ MOCK DATA FOR UI TESTING ============

const getMockTracks = (): Track[] => [
  {
    id: 'mock_1',
    sourceId: 'dQw4w9WgXcQ',
    title: 'Never Gonna Give You Up',
    artist: 'Rick Astley',
    thumbnailUrl: 'https://i.ytimg.com/vi/dQw4w9WgXcQ/hqdefault.jpg',
    duration: 212,
    audioUrl: '', // You provide this
  },
  {
    id: 'mock_2',
    sourceId: '9bZkp7q19f0',
    title: 'Gangnam Style',
    artist: 'PSY',
    thumbnailUrl: 'https://i.ytimg.com/vi/9bZkp7q19f0/hqdefault.jpg',
    duration: 252,
    audioUrl: '',
  },
  {
    id: 'mock_3',
    sourceId: 'kJQP7kiw5Fk',
    title: 'Despacito',
    artist: 'Luis Fonsi ft. Daddy Yankee',
    thumbnailUrl: 'https://i.ytimg.com/vi/kJQP7kiw5Fk/hqdefault.jpg',
    duration: 282,
    audioUrl: '',
  },
  {
    id: 'mock_4',
    sourceId: 'RgKAFK5djSk',
    title: 'See You Again',
    artist: 'Wiz Khalifa ft. Charlie Puth',
    thumbnailUrl: 'https://i.ytimg.com/vi/RgKAFK5djSk/hqdefault.jpg',
    duration: 237,
    audioUrl: '',
  },
  {
    id: 'mock_5',
    sourceId: 'OPf0YbXqDm0',
    title: 'Uptown Funk',
    artist: 'Mark Ronson ft. Bruno Mars',
    thumbnailUrl: 'https://i.ytimg.com/vi/OPf0YbXqDm0/hqdefault.jpg',
    duration: 271,
    audioUrl: '',
  },
  {
    id: 'mock_6',
    sourceId: 'JGwWNGJdvx8',
    title: 'Shape of You',
    artist: 'Ed Sheeran',
    thumbnailUrl: 'https://i.ytimg.com/vi/JGwWNGJdvx8/hqdefault.jpg',
    duration: 234,
    audioUrl: '',
  },
  {
    id: 'mock_7',
    sourceId: 'fRh_vgS2dFE',
    title: 'Sorry',
    artist: 'Justin Bieber',
    thumbnailUrl: 'https://i.ytimg.com/vi/fRh_vgS2dFE/hqdefault.jpg',
    duration: 200,
    audioUrl: '',
  },
  {
    id: 'mock_8',
    sourceId: 'CevxZvSJLk8',
    title: 'Roar',
    artist: 'Katy Perry',
    thumbnailUrl: 'https://i.ytimg.com/vi/CevxZvSJLk8/hqdefault.jpg',
    duration: 224,
    audioUrl: '',
  },
];
