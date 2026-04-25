const express = require('express');
const cors = require('cors');
const play = require('play-dl');
const { Innertube, UniversalCache } = require('youtubei.js');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Initialize YouTubei.js
let yt;
let isInitializing = false;

const initYouTube = async () => {
  if (isInitializing) return;
  isInitializing = true;
  
  try {
    const options = {
      cache: new UniversalCache(false),
      generate_session_locally: true
    };
    
    // Support for advanced bypass (PO_TOKEN, VISITOR_DATA)
    if (process.env.YOUTUBE_PO_TOKEN && process.env.YOUTUBE_VISITOR_DATA) {
      options.po_token = process.env.YOUTUBE_PO_TOKEN;
      options.visitor_data = process.env.YOUTUBE_VISITOR_DATA;
      console.log('[Proxy] Using PO_TOKEN/VISITOR_DATA');
    }

    // Add cookies if available
    if (process.env.YOUTUBE_COOKIES) {
      options.cookie = process.env.YOUTUBE_COOKIES;
      console.log('[Proxy] Using YouTube cookies for YouTubei.js');
    }

    yt = await Innertube.create(options);
    console.log('[Proxy] YouTubei.js initialized');
    
    // Also set for play-dl fallback
    if (process.env.YOUTUBE_COOKIES) {
      await play.setToken({
        youtube: {
          cookie: process.env.YOUTUBE_COOKIES
        }
      });
      console.log('[Proxy] Using YouTube cookies for play-dl fallback');
    }
  } catch (err) {
    console.error('[Proxy] Failed to initialize extractors:', err.message);
  } finally {
    isInitializing = false;
  }
};
initYouTube();

// Simple in-memory cache
const cache = new Map();
const CACHE_DURATION = 30 * 60 * 1000; // 30 minutes

app.get('/', (req, res) => res.send('Vynl Proxy is running (Enhanced)'));

app.get('/api/audio', async (req, res) => {
  const { videoId } = req.query;

  if (!videoId) {
    return res.status(400).json({ error: 'videoId is required' });
  }

  // Check cache
  const cached = cache.get(videoId);
  if (cached && cached.expires > Date.now()) {
    return res.json(cached.data);
  }

  try {
    console.log(`[Proxy] Extracting audio for: ${videoId}`);
    
    let responseData;
    
    // Primary: YouTubei.js
    try {
      if (!yt) await initYouTube();
      
      const info = await yt.getBasicInfo(videoId);
      const format = info.chooseFormat({ type: 'audio', quality: 'best' });
      
      if (!format) throw new Error('No suitable audio format found');
      
      responseData = {
        title: info.basic_info.title,
        artist: info.basic_info.author,
        thumbnailUrl: info.basic_info.thumbnail[0]?.url,
        duration: info.basic_info.duration,
        audioUrl: format.decipher(yt.session),
        format: format.mime_type,
        extractor: 'youtubei.js'
      };
    } catch (ytError) {
      console.warn(`[Proxy] YouTubei.js failed: ${ytError.message}. Falling back to play-dl...`);
      
      // Fallback: play-dl
      const youtubeUrl = `https://www.youtube.com/watch?v=${videoId}`;
      const streamInfo = await play.stream(youtubeUrl, {
        quality: 2,
        discordPlayerCompatibility: true
      });
      
      const videoInfo = await play.video_info(youtubeUrl);
      
      responseData = {
        title: videoInfo.video_details.title,
        artist: videoInfo.video_details.channel.name,
        thumbnailUrl: videoInfo.video_details.thumbnails[0]?.url,
        duration: videoInfo.video_details.durationInSec,
        audioUrl: streamInfo.url,
        format: streamInfo.type,
        extractor: 'play-dl'
      };
    }

    // Save to cache
    cache.set(videoId, {
      data: responseData,
      expires: Date.now() + CACHE_DURATION
    });

    console.log(`[Proxy] Resolved: ${responseData.title} (via ${responseData.extractor})`);
    res.json(responseData);

  } catch (error) {
    console.error(`[Proxy] Extraction failed: ${error.message}`);
    
    const isBotError = error.message.includes('confirm you’re not a bot') || 
                       error.message.includes('Sign in to confirm') ||
                       error.message.includes('403');

    res.status(isBotError ? 403 : 500).json({
      error: isBotError ? 'Bot detection triggered' : 'Extraction failed',
      message: error.message
    });
  }
});

// Search endpoint
app.get('/api/search', async (req, res) => {
  const { q, pageToken } = req.query;

  if (!q) {
    return res.status(400).json({ error: 'Search query (q) is required' });
  }

  try {
    if (!yt) await initYouTube();

    console.log(`[Proxy] Searching for: ${q}`);
    const search = await yt.search(q, {
      type: 'video',
    });

    const tracks = search.videos
      .filter((v) => v.type === 'Video')
      .map((v) => ({
        id: `yt_${v.id}`,
        sourceId: v.id,
        title: v.title.text,
        artist: v.author.name,
        thumbnailUrl: v.thumbnails[0]?.url,
        duration: v.duration.seconds,
        audioUrl: '',
      }));

    res.json({
      tracks,
      nextPageToken: search.continuation,
    });
  } catch (error) {
    console.error(`[Proxy] Search failed: ${error.message}`);
    res.status(500).json({
      error: 'Search failed',
      message: error.message,
    });
  }
});

app.listen(PORT, () => {
  console.log(`[Proxy] Server running on port ${PORT}`);
});

