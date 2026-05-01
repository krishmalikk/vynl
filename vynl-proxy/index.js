const express = require('express');
const cors = require('cors');
const vm = require('vm');
const play = require('play-dl');
const { Innertube, UniversalCache, ClientType, Platform } = require('youtubei.js');

// youtubei.js v17 removed the bundled JS evaluator and requires us to inject
// one. The compiled player script ends with a top-level `return process(...)`
// so it must run inside a function body — wrap it in an IIFE before eval.
Platform.shim.eval = (data, _eval_args) => {
  const wrapped = `(() => { ${data.output} })()`;
  return vm.runInNewContext(wrapped, Object.create(null), { timeout: 5000 });
};

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Start server IMMEDIATELY to satisfy Render's health check
app.listen(PORT, '0.0.0.0', () => {
  console.log(`[Proxy] Server running on port ${PORT}`);
  // Give Render 5 seconds to finish its port check before heavy initialization
  setTimeout(() => {
    warmUp();
  }, 5000);
});

// YouTube's Innertube has multiple "client types" (WEB, TV, IOS, ...).
// WEB runs BotGuard on streaming URLs and gets blocked from datacenter IPs
// almost immediately. TV (smart-TV / console client) skips BotGuard and is
// the most stable bypass for stream extraction. We rotate through these on
// /api/audio when one fails. WEB is fine for non-streaming endpoints
// (search, channel) since BotGuard only kicks in on signed video URLs.
// Note: youtubei.js compares client_type against the internal NAME, so use
// the ClientType enum values (e.g. ClientType.TV === 'TVHTML5'), not raw keys.
const CLIENT_ROTATION = [
  ClientType.TV,
  ClientType.WEB_EMBEDDED,
  ClientType.IOS,
];
const METADATA_CLIENT = ClientType.WEB;

const innertubeClients = new Map(); // clientType -> Innertube instance
const initLocks = new Map();        // clientType -> in-flight Promise

const buildOptions = (clientType) => {
  const options = {
    cache: new UniversalCache(false),
    generate_session_locally: true,
    client_type: clientType,
  };
  if (process.env.YOUTUBE_PO_TOKEN && process.env.YOUTUBE_VISITOR_DATA) {
    options.po_token = process.env.YOUTUBE_PO_TOKEN;
    options.visitor_data = process.env.YOUTUBE_VISITOR_DATA;
  }
  if (process.env.YOUTUBE_COOKIES) {
    options.cookie = process.env.YOUTUBE_COOKIES;
  }
  return options;
};

const getInnertube = async (clientType) => {
  if (innertubeClients.has(clientType)) return innertubeClients.get(clientType);
  if (initLocks.has(clientType)) return initLocks.get(clientType);

  const promise = (async () => {
    const instance = await Innertube.create(buildOptions(clientType));
    innertubeClients.set(clientType, instance);
    console.log(`[Proxy] Innertube ${clientType} client ready`);
    return instance;
  })().finally(() => initLocks.delete(clientType));

  initLocks.set(clientType, promise);
  return promise;
};

const warmUp = async () => {
  // Warm the primary client + log cookie/PO-token presence so deploys are debuggable.
  if (process.env.YOUTUBE_PO_TOKEN && process.env.YOUTUBE_VISITOR_DATA) {
    console.log('[Proxy] Using PO_TOKEN/VISITOR_DATA from env');
  }
  if (process.env.YOUTUBE_COOKIES) {
    console.log('[Proxy] Using YouTube cookies');
    try {
      await play.setToken({ youtube: { cookie: process.env.YOUTUBE_COOKIES } });
    } catch (err) {
      console.warn(`[Proxy] play-dl cookie setup failed: ${err.message}`);
    }
  }
  // Warm both the streaming client (TV) and the metadata client (WEB) in
  // parallel so the first request doesn't pay double init cost.
  await Promise.allSettled([
    getInnertube(CLIENT_ROTATION[0]).catch((err) =>
      console.error(`[Proxy] Failed to warm streaming client: ${err.message}`)
    ),
    getInnertube(METADATA_CLIENT).catch((err) =>
      console.error(`[Proxy] Failed to warm metadata client: ${err.message}`)
    ),
  ]);
};

const isBotError = (message = '') =>
  message.includes('confirm you’re not a bot') ||
  message.includes("confirm you're not a bot") ||
  message.includes('Sign in to confirm') ||
  message.includes('403');

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

    let responseData = null;
    let lastInnertubeError = null;

    // Primary: rotate through Innertube clients. Each client has different
    // bot-detection pressure and different metadata coverage, so we try them
    // all before falling through. The TV client unblocks streaming URLs but
    // sometimes lacks streaming data for specific videos — WEB_EMBEDDED/IOS
    // pick those up.
    for (const clientType of CLIENT_ROTATION) {
      try {
        const ytClient = await getInnertube(clientType);
        const info = await ytClient.getBasicInfo(videoId);
        const format = info.chooseFormat({ type: 'audio', quality: 'best' });

        if (!format) throw new Error('No suitable audio format found');

        const audioUrl = await format.decipher(ytClient.session.player);
        const basic = info.basic_info || {};
        const thumbs = basic.thumbnail || [];

        responseData = {
          title: basic.title,
          artist: basic.author,
          thumbnailUrl: thumbs[thumbs.length - 1]?.url,
          duration: basic.duration,
          audioUrl,
          format: format.mime_type,
          extractor: `youtubei.js (${clientType})`,
        };
        break;
      } catch (ytError) {
        lastInnertubeError = ytError;
        const reason = isBotError(ytError.message) ? 'blocked' : 'failed';
        console.warn(`[Proxy] Innertube ${clientType} ${reason}: ${ytError.message}. Rotating...`);
      }
    }

    // Last resort: play-dl. Different scraping path, sometimes catches what Innertube can't.
    if (!responseData) {
      console.warn(`[Proxy] All Innertube clients exhausted (last: ${lastInnertubeError?.message}). Trying play-dl...`);
      const youtubeUrl = `https://www.youtube.com/watch?v=${videoId}`;
      const streamInfo = await play.stream(youtubeUrl, {
        quality: 2,
        discordPlayerCompatibility: true,
      });
      const videoInfo = await play.video_info(youtubeUrl);

      responseData = {
        title: videoInfo.video_details.title,
        artist: videoInfo.video_details.channel.name,
        thumbnailUrl: videoInfo.video_details.thumbnails[videoInfo.video_details.thumbnails.length - 1]?.url,
        duration: videoInfo.video_details.durationInSec,
        audioUrl: streamInfo.url,
        format: streamInfo.type,
        extractor: 'play-dl',
      };
    }

    cache.set(videoId, {
      data: responseData,
      expires: Date.now() + CACHE_DURATION,
    });

    console.log(`[Proxy] Resolved: ${responseData.title} (via ${responseData.extractor})`);
    res.json(responseData);

  } catch (error) {
    console.error(`[Proxy] Extraction failed: ${error.message}`);

    const botError = isBotError(error.message);

    res.status(botError ? 403 : 500).json({
      error: botError ? 'Bot detection triggered' : 'Extraction failed',
      message: error.message,
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
    const yt = await getInnertube(METADATA_CLIENT);

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
    const yt = await getInnertube(METADATA_CLIENT);

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
  const ready = innertubeClients.has(CLIENT_ROTATION[0]);
  const initializing = initLocks.has(CLIENT_ROTATION[0]);
  res.status(200).json({
    status: 'ok',
    youtube: ready ? 'ready' : (initializing ? 'initializing' : 'not_started'),
    clients: [...innertubeClients.keys()],
  });
});
