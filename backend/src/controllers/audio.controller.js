const https = require('https');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

// In-memory cache for ultra-fast instant playback (0ms latency)
const memoryCache = new Map();

// Local cache directory
const CACHE_DIR = path.join(__dirname, '../../cache/audio');
if (!fs.existsSync(CACHE_DIR)) {
  fs.mkdirSync(CACHE_DIR, { recursive: true });
}

/**
 * Clean and normalize sentence text for natural TTS reading
 */
function cleanSentenceText(rawText) {
  if (!rawText) return '';
  return rawText
    .replace(/^\s*\([A-D]\)\s*/i, '') // strip (A), (B), (C), (D)
    .replace(/^[A-Z][A-Za-z0-9_-]*:\s*/gm, '') // strip speaker names "W-Am:", "M-Cn:"
    .replace(/[_]+/g, ' ') // strip underscores for blanks
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Split text into chunks <= maxLen (default 180 chars) for Google TTS tw-ob limit
 */
function splitTextIntoChunks(text, maxLen = 180) {
  if (text.length <= maxLen) return [text];
  const sentences = text.match(/[^.!?\n]+[.!?\n]*/g) || [text];
  const chunks = [];
  let currentChunk = '';
  for (const s of sentences) {
    if ((currentChunk + ' ' + s).trim().length <= maxLen) {
      currentChunk = (currentChunk + ' ' + s).trim();
    } else {
      if (currentChunk) chunks.push(currentChunk);
      if (s.length <= maxLen) {
        currentChunk = s.trim();
      } else {
        const words = s.split(' ');
        currentChunk = '';
        for (const w of words) {
          if ((currentChunk + ' ' + w).trim().length <= maxLen) {
            currentChunk = (currentChunk + ' ' + w).trim();
          } else {
            if (currentChunk) chunks.push(currentChunk);
            currentChunk = w;
          }
        }
      }
    }
  }
  if (currentChunk) chunks.push(currentChunk);
  return chunks;
}

function fetchSingleTtsChunk(chunkText, langCode) {
  return new Promise((resolve, reject) => {
    const encoded = encodeURIComponent(chunkText);
    const ttsUrl = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encoded}&tl=${langCode}&client=tw-ob`;
    https.get(ttsUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      }
    }, (ttsRes) => {
      if (ttsRes.statusCode !== 200) {
        return reject(new Error(`TTS status ${ttsRes.statusCode}`));
      }
      const chunks = [];
      ttsRes.on('data', c => chunks.push(c));
      ttsRes.on('end', () => resolve(Buffer.concat(chunks)));
    }).on('error', reject);
  });
}

const { MsEdgeTTS, OUTPUT_FORMAT } = require('msedge-tts');

/**
 * Map accents to authentic ETS-style neural voices
 */
function getVoiceForAccent(accent, gender = 'male') {
  const acc = (accent || 'us').toLowerCase();
  if (acc === 'uk' || acc === 'gb') {
    return gender === 'female' ? 'en-GB-SoniaNeural' : 'en-GB-RyanNeural';
  } else if (acc === 'au') {
    return gender === 'female' ? 'en-AU-NatashaNeural' : 'en-AU-WilliamNeural';
  } else if (acc === 'ca') {
    return gender === 'female' ? 'en-CA-ClaraNeural' : 'en-CA-LiamNeural';
  }
  return gender === 'female' ? 'en-US-JennyNeural' : 'en-US-ChristopherNeural';
}

/**
 * Fetch studio-quality neural audio via MsEdgeTTS
 */
async function fetchEdgeTtsAudio(text, voiceName) {
  const tts = new MsEdgeTTS();
  await tts.setMetadata(voiceName, OUTPUT_FORMAT.AUDIO_24KHZ_48KBITRATE_MONO_MP3);
  const { audioStream } = tts.toStream(text);
  
  return new Promise((resolve, reject) => {
    const chunks = [];
    const timeout = setTimeout(() => {
      reject(new Error('MsEdgeTTS stream timeout'));
    }, 12000);

    audioStream.on('data', c => chunks.push(c));
    audioStream.on('end', () => {
      clearTimeout(timeout);
      resolve(Buffer.concat(chunks));
    });
    audioStream.on('error', (err) => {
      clearTimeout(timeout);
      reject(err);
    });
  });
}

/**
 * High-definition Natural Voice TTS Controller (US, UK, AU accents)
 */
exports.getSpeechAudio = async (req, res) => {
  try {
    const rawText = req.query.text || '';
    const accent = (req.query.accent || 'us').toLowerCase();
    const gender = (req.query.gender || 'male').toLowerCase();
    
    const text = cleanSentenceText(rawText);
    if (!text) {
      return res.status(400).json({ success: false, message: 'Text parameter is required' });
    }

    const voiceName = getVoiceForAccent(accent, gender);
    const cacheKey = crypto.createHash('md5').update(`${voiceName}_${text}`).digest('hex');

    // 1. Check memory cache (0ms instant)
    if (memoryCache.has(cacheKey)) {
      const buffer = memoryCache.get(cacheKey);
      res.set({
        'Content-Type': 'audio/mpeg',
        'Content-Length': buffer.length,
        'Cache-Control': 'public, max-age=31536000, immutable',
        'X-Audio-Source': 'memory-cache'
      });
      return res.send(buffer);
    }

    // 2. Check disk cache
    const diskPath = path.join(CACHE_DIR, `${cacheKey}.mp3`);
    if (fs.existsSync(diskPath)) {
      const buffer = fs.readFileSync(diskPath);
      memoryCache.set(cacheKey, buffer);
      res.set({
        'Content-Type': 'audio/mpeg',
        'Content-Length': buffer.length,
        'Cache-Control': 'public, max-age=31536000, immutable',
        'X-Audio-Source': 'disk-cache'
      });
      return res.send(buffer);
    }

    // 3. Generate high-definition neural MP3 stream via MsEdgeTTS
    let audioBuffer;
    try {
      audioBuffer = await fetchEdgeTtsAudio(text, voiceName);
    } catch (edgeErr) {
      console.warn('MsEdgeTTS failed, falling back to chunked Google TTS:', edgeErr.message);
      let langCode = 'en-US';
      if (accent === 'uk' || accent === 'gb') langCode = 'en-GB';
      else if (accent === 'au') langCode = 'en-AU';

      const textChunks = splitTextIntoChunks(text);
      const buffers = [];
      for (const chunk of textChunks) {
        const buf = await fetchSingleTtsChunk(chunk, langCode);
        buffers.push(buf);
      }
      audioBuffer = Buffer.concat(buffers);
    }

    // Cache in memory and disk
    memoryCache.set(cacheKey, audioBuffer);
    try {
      fs.writeFileSync(diskPath, audioBuffer);
    } catch (e) {
      // Ignore disk write errors
    }

    res.set({
      'Content-Type': 'audio/mpeg',
      'Content-Length': audioBuffer.length,
      'Cache-Control': 'public, max-age=31536000, immutable',
      'X-Audio-Source': 'live-neural-stream'
    });
    return res.send(audioBuffer);

  } catch (err) {
    console.error('Audio controller error:', err);
    res.status(500).json({ success: false, message: 'Internal server error', error: err.message });
  }
};

