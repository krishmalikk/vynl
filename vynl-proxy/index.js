const express = require('express');
const cors = require('cors');
const { exec } = require('child_process');
const { promisify } = require('util');

const path = require('path');
const execAsync = promisify(exec);
const app = express();
const PORT = process.env.PORT || 3000;
const YT_DLP_PATH = path.join(__dirname, 'yt-dlp');

app.use(cors());
app.use(express.json());

// Health check for Render
app.get('/', (req, res) => res.send('Vynl Proxy is running'));

// Extraction endpoint
app.get('/api/audio', async (req, res) => {
  const { videoId } = req.query;

  if (!videoId) {
    return res.status(400).json({ error: 'videoId is required' });
  }

  try {
    console.log(`[Proxy] Extracting audio for videoId: ${videoId}`);
    const youtubeUrl = `https://www.youtube.com/watch?v=${videoId}`;
    
    const { stdout } = await execAsync(`"${YT_DLP_PATH}" -j --no-warnings "${youtubeUrl}"`);
    const info = JSON.parse(stdout);
    
    const audioFormats = info.formats.filter(f => f.vcodec === 'none' && f.acodec !== 'none');
    audioFormats.sort((a, b) => (b.abr || 0) - (a.abr || 0));
    
    if (audioFormats.length === 0) {
      throw new Error('No audio formats found');
    }
    
    const streamInfo = audioFormats[0];

    console.log(`[Proxy] Successfully resolved URL for: ${info.title}`);
    
    res.json({
      title: info.title,
      artist: info.channel || info.uploader,
      thumbnailUrl: info.thumbnail,
      duration: info.duration,
      audioUrl: streamInfo.url,
      format: streamInfo.ext || 'webm',
    });
  } catch (error) {
    console.error(`[Proxy] Error: ${error.message}`);
    res.status(500).json({ 
      error: 'Failed to extract audio stream', 
      message: error.message 
    });
  }
});

app.listen(PORT, () => {
  console.log(`[Proxy] Server running on port ${PORT}`);
});
