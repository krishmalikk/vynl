const express = require('express');
const cors = require('cors');
const play = require('play-dl');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Simple in-memory cache to avoid redundant extractions
// Format: { videoId: { url, expires } }
const cache = new Map();
const CACHE_DURATION = 30 * 60 * 1000; // 30 minutes

// Health check for Render
app.get('/', (req, res) => res.send('Vynl Proxy is running (Optimized)'));

// Extraction endpoint
app.get('/api/audio', async (req, res) => {
  const { videoId } = req.query;

  if (!videoId) {
    return res.status(400).json({ error: 'videoId is required' });
  }

  // Check cache first
  const cached = cache.get(videoId);
  if (cached && cached.expires > Date.now()) {
    console.log(`[Proxy] Cache hit for: ${videoId}`);
    return res.json(cached.data);
  }

  try {
    console.log(`[Proxy] Extracting audio for videoId: ${videoId} using play-dl`);
    const youtubeUrl = `https://www.youtube.com/watch?v=${videoId}`;
    
    // Set a custom user agent to look more like a real browser
    // This is a common trick to bypass basic bot detection
    const userAgents = [
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36',
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/118.0.0.0 Safari/537.36',
      'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36'
    ];
    const randomUA = userAgents[Math.floor(Math.random() * userAgents.length)];

    // Get video info first - this often helps "warm up" the connection
    const videoInfo = await play.video_info(youtubeUrl, {
      requestOptions: {
        headers: {
          'User-Agent': randomUA
        }
      }
    });

    // Get stream info
    const streamInfo = await play.stream(youtubeUrl, {
      quality: 2, 
      discordPlayerCompatibility: true,
      requestOptions: {
        headers: {
          'User-Agent': randomUA
        }
      }
    });
    
    const responseData = {
      title: videoInfo.video_details.title,
      artist: videoInfo.video_details.channel.name,
      thumbnailUrl: videoInfo.video_details.thumbnails[0]?.url,
      duration: videoInfo.video_details.durationInSec,
      audioUrl: streamInfo.url,
      format: streamInfo.type,
    };

    // Save to cache
    cache.set(videoId, {
      data: responseData,
      expires: Date.now() + CACHE_DURATION
    });

    console.log(`[Proxy] Successfully resolved URL for: ${responseData.title}`);
    res.json(responseData);
  } catch (error) {
    console.error(`[Proxy] Error: ${error.message}`);
    
    // Handle specific YouTube errors
    if (error.message.includes('confirm you are not a bot')) {
      return res.status(403).json({
        error: 'YouTube blocked the request',
        message: 'Bot detection triggered. Try again later or use a different source.'
      });
    }

    res.status(500).json({ 
      error: 'Failed to extract audio stream', 
      message: error.message 
    });
  }
});

app.listen(PORT, () => {
  console.log(`[Proxy] Server running on port ${PORT}`);
});
