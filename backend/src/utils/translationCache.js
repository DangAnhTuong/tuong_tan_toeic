const fs = require('fs');
const path = require('path');
const https = require('https');

const CACHE_FILE = path.join(__dirname, '../data/translation_cache.json');

let cache = {};
try {
  if (fs.existsSync(CACHE_FILE)) {
    cache = JSON.parse(fs.readFileSync(CACHE_FILE, 'utf8'));
  }
} catch (e) {
  cache = {};
}

// Load pre-existing dictionaries
let phuonganDict = {};
try {
  phuonganDict = require('../seed/phuongan_resolved_dictionary.json');
} catch (e) {}

let masterHealedDict = {};
try {
  masterHealedDict = require('../seed/master_healed_options_dict.json');
} catch (e) {}

let readingOptionDict = {};
try {
  readingOptionDict = require('../seed/readingMasterOptionTranslator').READING_OPTION_DICT;
} catch (e) {}

function saveCache() {
  try {
    const dir = path.dirname(CACHE_FILE);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(CACHE_FILE, JSON.stringify(cache, null, 2));
  } catch (e) {
    console.error('Error saving translation cache:', e);
  }
}

function fetchMyMemory(text) {
  return new Promise((resolve) => {
    const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=en|vi&de=support@tuongtantoeic.vn`;
    const req = https.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          if (parsed && parsed.responseData && parsed.responseData.translatedText) {
            let trans = parsed.responseData.translatedText.trim();
            // clean up HTML entities
            trans = trans.replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&amp;/g, '&');
            resolve(trans);
          } else {
            resolve(null);
          }
        } catch (e) {
          resolve(null);
        }
      });
    });
    req.on('error', () => resolve(null));
    req.setTimeout(4000, () => {
      req.destroy();
      resolve(null);
    });
  });
}

async function getTranslation(text) {
  if (!text || typeof text !== 'string') return '';
  const clean = text.trim();
  const lower = clean.toLowerCase();

  // 1. In memory cache
  if (cache[clean]) return cache[clean];
  if (cache[lower]) return cache[lower];

  // 2. Reading Option Dict
  if (readingOptionDict[lower]) {
    cache[clean] = readingOptionDict[lower];
    return cache[clean];
  }

  // 3. PhuongAn Dict
  if (phuonganDict[clean]) {
    cache[clean] = phuonganDict[clean];
    return cache[clean];
  }
  if (phuonganDict[lower]) {
    cache[clean] = phuonganDict[lower];
    return cache[clean];
  }

  // 4. Master Healed Dict
  if (masterHealedDict[clean]) {
    cache[clean] = masterHealedDict[clean];
    return cache[clean];
  }
  if (masterHealedDict[lower]) {
    cache[clean] = masterHealedDict[lower];
    return cache[clean];
  }

  // 5. Fetch from MyMemory API
  const apiTrans = await fetchMyMemory(clean);
  if (apiTrans && apiTrans.toLowerCase() !== lower) {
    cache[clean] = apiTrans;
    return apiTrans;
  }

  return clean;
}

module.exports = {
  getTranslation,
  saveCache
};
