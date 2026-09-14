const fs = require('fs');
const path = require('path');
const https = require('https');
const { READING_OPTION_DICT } = require('../seed/readingMasterOptionTranslator');
const { translatePassagePrompt } = require('../seed/passagePromptTranslator');

const CACHE_FILE = path.join(__dirname, '../data/persistent_translation_cache.json');
let CACHE = {};

try {
  if (fs.existsSync(CACHE_FILE)) {
    CACHE = JSON.parse(fs.readFileSync(CACHE_FILE, 'utf8'));
  }
} catch (e) {
  CACHE = {};
}

let saveTimeout = null;
function persistCache() {
  try {
    fs.writeFileSync(CACHE_FILE, JSON.stringify(CACHE, null, 2), 'utf8');
  } catch (e) {
    console.error('Failed to write translation cache:', e.message);
  }
}

function scheduleSave() {
  if (saveTimeout) clearTimeout(saveTimeout);
  saveTimeout = setTimeout(persistCache, 500);
}

const hasVietnameseMarks = (str) => /[àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ]/i.test(str || '');

function queryGoogleMobile(text) {
  return new Promise((resolve) => {
    const url = 'https://translate.google.com/m?sl=en&tl=vi&q=' + encodeURIComponent(text);
    const options = {
      headers: {
        'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Mobile/15E148 Safari/604.1'
      }
    };
    const req = https.get(url, options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const match = data.match(/<div class="result-container">([\s\S]*?)<\/div>/i);
          if (match) {
            const decoded = match[1]
              .replace(/&quot;/g, '"')
              .replace(/&#39;/g, "'")
              .replace(/&amp;/g, '&')
              .replace(/&lt;/g, '<')
              .replace(/&gt;/g, '>')
              .trim();
            if (decoded && hasVietnameseMarks(decoded)) {
              return resolve(decoded);
            }
          }
          resolve(null);
        } catch (e) {
          resolve(null);
        }
      });
    });
    req.on('error', () => resolve(null));
    req.setTimeout(6000, () => {
      req.destroy();
      resolve(null);
    });
  });
}

async function translateText(rawText, isPrompt = false) {
  if (!rawText || typeof rawText !== 'string') return '';
  const text = rawText.trim();
  const lower = text.toLowerCase();

  // 1. Check persistent cache
  if (CACHE[text] && hasVietnameseMarks(CACHE[text])) return CACHE[text];
  if (CACHE[lower] && hasVietnameseMarks(CACHE[lower])) return CACHE[lower];

  // 2. Curated reading option dictionary
  if (READING_OPTION_DICT[lower]) {
    CACHE[text] = READING_OPTION_DICT[lower];
    scheduleSave();
    return CACHE[text];
  }

  // 3. Passage prompt pattern
  if (isPrompt) {
    const promptTr = translatePassagePrompt(text);
    if (promptTr && promptTr !== text && hasVietnameseMarks(promptTr)) {
      CACHE[text] = promptTr;
      scheduleSave();
      return promptTr;
    }
  }

  // 4. Query Google Mobile Translate
  const translated = await queryGoogleMobile(text);
  if (translated) {
    CACHE[text] = translated;
    scheduleSave();
    return translated;
  }

  // Suffix fallback
  if (lower.endsWith('tion') || lower.endsWith('tions') || lower.endsWith('ment') || lower.endsWith('ness')) {
    const fallback = `sự ${lower} (danh từ)`;
    CACHE[text] = fallback;
    scheduleSave();
    return fallback;
  }
  if (lower.endsWith('ly')) {
    const fallback = `một cách ${lower.replace(/ly$/, '')} (trạng từ)`;
    CACHE[text] = fallback;
    scheduleSave();
    return fallback;
  }

  return text;
}

function getTranslationSync(rawText, isPrompt = false) {
  if (!rawText || typeof rawText !== 'string') return '';
  const text = rawText.trim();
  const lower = text.toLowerCase();

  if (CACHE[text] && hasVietnameseMarks(CACHE[text])) return CACHE[text];
  if (CACHE[lower] && hasVietnameseMarks(CACHE[lower])) return CACHE[lower];
  if (READING_OPTION_DICT[lower]) return READING_OPTION_DICT[lower];

  if (isPrompt) {
    const promptTr = translatePassagePrompt(text);
    if (promptTr && promptTr !== text && hasVietnameseMarks(promptTr)) {
      return promptTr;
    }
  }

  if (lower.endsWith('tion') || lower.endsWith('tions') || lower.endsWith('ment') || lower.endsWith('ness')) {
    return `sự ${lower} (danh từ)`;
  }
  if (lower.endsWith('ly')) {
    return `một cách ${lower.replace(/ly$/, '')} (trạng từ)`;
  }

  return text;
}

module.exports = {
  translateText,
  getTranslationSync,
  persistCache,
  hasVietnameseMarks,
  queryGoogleMobile
};
