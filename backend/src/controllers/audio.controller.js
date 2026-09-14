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
 * High-definition Natural Voice TTS Controller (US, UK, AU accents)
 */
exports.getSpeechAudio = async (req, res) => {
  try {
    const rawText = req.query.text || '';
    const accent = (req.query.accent || 'us').toLowerCase();
    
    const text = cleanSentenceText(rawText);
    if (!text) {
      return res.status(400).json({ success: false, message: 'Text parameter is required' });
    }

    // Map accent to language code
    let langCode = 'en-US';
    if (accent === 'uk' || accent === 'gb') langCode = 'en-GB';
    else if (accent === 'au') langCode = 'en-AU';
    else if (accent === 'ca') langCode = 'en-CA';

    const cacheKey = crypto.createHash('md5').update(`${langCode}_${text}`).digest('hex');

    // 1. Check memory cache
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

    // 3. Fetch high-definition MP3 stream from TTS provider
    const encodedText = encodeURIComponent(text.slice(0, 300));
    const ttsUrl = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodedText}&tl=${langCode}&client=tw-ob`;

    const request = https.get(ttsUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      }
    }, (ttsRes) => {
      if (ttsRes.statusCode !== 200) {
        return res.status(ttsRes.statusCode).json({ success: false, message: 'Failed to generate audio' });
      }

      const chunks = [];
      ttsRes.on('data', (chunk) => chunks.push(chunk));
      ttsRes.on('end', () => {
        const audioBuffer = Buffer.concat(chunks);
        
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
          'X-Audio-Source': 'live-stream'
        });
        res.send(audioBuffer);
      });
    });

    request.on('error', (err) => {
      console.error('TTS streaming error:', err);
      res.status(500).json({ success: false, message: 'Audio stream error', error: err.message });
    });

  } catch (err) {
    console.error('Audio controller error:', err);
    res.status(500).json({ success: false, message: 'Internal server error', error: err.message });
  }
};
