const express = require('express');
const cors = require('cors');
const play = require('play-dl');
const { Innertube, UniversalCache } = require('youtubei.js');
const { generate } = require('youtube-po-token-generator');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Start server IMMEDIATELY to satisfy Render's health check
app.listen(PORT, '0.0.0.0', () => {
  console.log(`[Proxy] Server running on port ${PORT}`);
  // Give Render 5 seconds to finish its port check before we start heavy initialization
  setTimeout(() => {
    initYouTube();
  }, 5000);
});

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
      console.log('[Proxy] Using PO_TOKEN/VISITOR_DATA from env');
    } else {
      try {
        console.log('[Proxy] Generating PO token automatically...');
        // Yield the event loop to prevent blocking Render's health checks
        await new Promise(resolve => setImmediate(resolve));
        const generated = await generate();
        options.po_token = generated.poToken;
        options.visitor_data = generated.visitorData;
        console.log('[Proxy] PO token generated successfully');
      } catch (genError) {
        console.error('[Proxy] Failed to generate PO token automatically:', genError.message);
      }
    }

    // Add cookies if available
    if (process.env.YOUTUBE_COOKIES) {
      options.cookie = process.env.YOUTUBE_COOKIES;
      console.log('[Proxy] Using YouTube cookies for YouTubei.js');
    }

    // Another yield
    await new Promise(resolve => setImmediate(resolve));
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
      if (!yt && !isInitializing) await initYouTube();
      // Wait a moment if still initializing
      let attempts = 0;
      while (!yt && attempts < 10) {
        await new Promise(r => setTimeout(r, 500));
        attempts++;
      }
      
      if (!yt) throw new Error('YouTubei.js not initialized after waiting');
      
      const info = await yt.getBasicInfo(videoId);
      const format = info.chooseFormat({ type: 'audio', quality: 'best' });
      
      if (!format) throw new Error('No suitable audio format found');
      
      responseData = {
        title: info.basic_info.title,
        artist: info.basic_info.author,
        thumbnailUrl: info.basic_info.thumbnail[info.basic_info.thumbnail.length - 1]?.url,
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
        thumbnailUrl: videoInfo.video_details.thumbnails[videoInfo.video_details.thumbnails.length - 1]?.url,
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
        thumbnailUrl: v.thumbnails[v.thumbnails.length - 1]?.url,
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

// Artist detail endpoint
app.get('/api/artist', async (req, res) => {
  const { name } = req.query;

  if (!name) {
    return res.status(400).json({ error: 'Artist name is required' });
  }

  try {
    if (!yt) await initYouTube();

    console.log(`[Proxy] Getting details for artist: ${name}`);
    const search = await yt.search(name, { type: 'channel' });
    const channel = search.channels[0];

    if (!channel) {
      return res.status(404).json({ error: 'Artist not found' });
    }

    // Get channel details
    const channelInfo = await yt.getChannel(channel.id);
    
    // Get some videos from the artist
    const videos = await channelInfo.getVideos();
    
    const topTracks = videos.videos
      .filter(v => v.type === 'Video')
      .slice(0, 10)
      .map(v => ({
        id: `yt_${v.id}`,
        sourceId: v.id,
        title: v.title.text,
        artist: name,
        thumbnailUrl: v.thumbnails[v.thumbnails.length - 1]?.url,
        duration: v.duration.seconds,
        audioUrl: '',
      }));

    res.json({
      name: channelInfo.metadata.title,
      monthlyListeners: (Math.random() * 20 + 5).toFixed(1) + 'M', // Mock listeners
      albumCount: Math.floor(Math.random() * 10) + 2,
      trackCount: topTracks.length * 8,
      topTracks,
    });
  } catch (error) {
    console.error(`[Proxy] Artist lookup failed: ${error.message}`);
    res.status(500).json({
      error: 'Artist lookup failed',
      message: error.message,
    });
  }
});

// Health check for Render
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'ok', 
    youtube: yt ? 'ready' : (isInitializing ? 'initializing' : 'not_started') 
  });
});

