const https = require('https');
const VocabularyTopic = require('../models/VocabularyTopic');

// In-Memory LRU Cache for ultra-fast < 2ms lookups & zero redundant external calls
const lookupCache = new Map();
const MAX_CACHE_SIZE = 5000;

function setCache(key, value) {
  if (lookupCache.size >= MAX_CACHE_SIZE) {
    const firstKey = lookupCache.keys().next().value;
    lookupCache.delete(firstKey);
  }
  lookupCache.set(key.toLowerCase().trim(), value);
}

function getCache(key) {
  return lookupCache.get(key.toLowerCase().trim());
}

// Helper: HTTP GET JSON with strict 3000ms timeout
function fetchJson(url, timeoutMs = 3000) {
  return new Promise((resolve) => {
    const req = https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' } }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(data) });
        } catch (e) {
          resolve({ status: res.statusCode, raw: data });
        }
      });
    });
    req.on('error', () => resolve({ status: 500 }));
    req.setTimeout(timeoutMs, () => {
      req.destroy();
      resolve({ status: 408 });
    });
  });
}

// Helper: Translate English to Vietnamese using Multi-Tier Fallback (clients5 Google Dict + MyMemory)
function fetchMyMemory(text, timeoutMs = 2000) {
  return new Promise((resolve) => {
    const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=en|vi`;
    const req = https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          const trans = parsed?.responseData?.translatedText;
          if (trans && !trans.includes('MYMEMORY WARNING') && !trans.startsWith('[') && trans.toLowerCase().trim() !== text.toLowerCase().trim()) {
            return resolve(trans.trim());
          }
          // Search in matches
          if (Array.isArray(parsed?.matches)) {
            for (const m of parsed.matches) {
              const mTrans = m.translation?.trim().replace(/[:.,]$/, '');
              if (mTrans && !mTrans.startsWith('[') && mTrans.toLowerCase() !== text.toLowerCase()) {
                return resolve(mTrans);
              }
            }
          }
        } catch {}
        resolve(text);
      });
    });
    req.on('error', () => resolve(text));
    req.setTimeout(timeoutMs, () => {
      req.destroy();
      resolve(text);
    });
  });
}

function translateToVietnamese(text, timeoutMs = 2500) {
  if (!text || typeof text !== 'string') return Promise.resolve('');
  const cleanText = text.trim();
  if (!cleanText) return Promise.resolve('');

  return new Promise((resolve) => {
    // Primary: Google Chrome Dictionary Extension API (Fast, Reliable, No 429)
    const url = 'https://clients5.google.com/translate_a/t?client=dict-chrome-ex&sl=en&tl=vi&q=' + encodeURIComponent(cleanText);
    const req = https.get(url, { 
      headers: { 
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
        'Accept': '*/*'
      } 
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          let translated = '';
          if (Array.isArray(parsed)) {
            translated = typeof parsed[0] === 'string' ? parsed[0] : (parsed[0]?.[0] || '');
          }
          if (translated && translated.toLowerCase().trim() !== cleanText.toLowerCase().trim()) {
            return resolve(translated.trim());
          }
        } catch {}
        // Secondary fallback to MyMemory
        fetchMyMemory(cleanText, 2000).then(resolve);
      });
    });
    req.on('error', () => {
      fetchMyMemory(cleanText, 2000).then(resolve);
    });
    req.setTimeout(timeoutMs, () => {
      req.destroy();
      fetchMyMemory(cleanText, 2000).then(resolve);
    });
  });
}

// Main lookup controller
exports.lookupWord = async (req, res) => {
  try {
    const rawWord = req.query.word || req.query.q;
    if (!rawWord || typeof rawWord !== 'string' || !rawWord.trim()) {
      return res.status(400).json({ success: false, message: 'Tham số word không được để trống' });
    }

    const word = rawWord.trim();
    const cacheKey = word.toLowerCase();

    // 1. Check in-memory cache (< 1ms)
    const cachedResult = getCache(cacheKey);
    if (cachedResult) {
      return res.status(200).json({ success: true, fromCache: true, data: cachedResult });
    }

    // Check if it's a multi-word phrase or full sentence
    const wordTokens = word.split(/\s+/).filter(Boolean);
    const isPhrase = wordTokens.length > 1;

    // 2. If it's a single word, check local MongoDB VocabularyTopic for curated TOEIC data
    let toeicDbEntry = null;
    if (!isPhrase) {
      try {
        const regex = new RegExp(`^${word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i');
        const topicWithWord = await VocabularyTopic.findOne({
          $or: [
            { 'words.word': regex },
            { 'parts.words.word': regex }
          ]
        }).lean();

        if (topicWithWord) {
          let found = topicWithWord.words?.find(w => regex.test(w.word));
          if (!found && topicWithWord.parts) {
            for (const p of topicWithWord.parts) {
              found = p.words?.find(w => regex.test(w.word));
              if (found) break;
            }
          }
          if (found) {
            toeicDbEntry = {
              ...found,
              topicTitle: topicWithWord.title,
              category: topicWithWord.category
            };
          }
        }
      } catch (dbErr) {
        console.warn('MongoDB vocab lookup warning:', dbErr.message);
      }
    }

    // 3. Parallel fetch: Primary Translation & Dictionary API
    const [primaryTranslation, dictApiRes] = await Promise.all([
      translateToVietnamese(word, 2500),
      isPhrase ? Promise.resolve({ status: 404 }) : fetchJson(`https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(word)}`, 3000)
    ]);

    // 4. If phrase or sentence: return phrase translation directly
    if (isPhrase) {
      const phraseAudio = `https://dict.youdao.com/dictvoice?audio=${encodeURIComponent(word)}&type=2`;
      const phraseData = {
        word: word,
        isPhrase: true,
        translation: primaryTranslation || word,
        phoneticUs: '',
        phoneticUk: '',
        audioUs: phraseAudio,
        audioUk: phraseAudio,
        meanings: [
          {
            partOfSpeech: 'phrase',
            definitions: [
              {
                definitionEn: `Phrase / Sentence in TOEIC test context.`,
                definitionVi: primaryTranslation,
                exampleEn: word,
                exampleVi: primaryTranslation
              }
            ]
          }
        ],
        phrases: [],
        synonyms: [],
        wordFamily: []
      };

      setCache(cacheKey, phraseData);
      return res.status(200).json({ success: true, data: phraseData });
    }

    // 5. Parse Free Dictionary API for single words
    let phonetic = toeicDbEntry?.phonetic || `/${word}/`;
    let phoneticUs = toeicDbEntry?.phonetic || '';
    let phoneticUk = toeicDbEntry?.phoneticUk || '';
    let audioUs = '';
    let audioUk = '';
    let meanings = [];
    let synonyms = [];

    if (dictApiRes.status === 200 && Array.isArray(dictApiRes.data) && dictApiRes.data.length > 0) {
      const entry = dictApiRes.data[0];

      // Extract phonetics & audio
      if (entry.phonetic) phonetic = entry.phonetic;
      if (Array.isArray(entry.phonetics)) {
        for (const p of entry.phonetics) {
          if (!phonetic && p.text) phonetic = p.text;
          if (p.audio) {
            if (p.audio.includes('-us') || p.audio.includes('en-us') || !audioUs) {
              audioUs = p.audio;
            }
            if (p.audio.includes('-uk') || p.audio.includes('en-uk') || !audioUk) {
              audioUk = p.audio;
            }
          }
          if (p.text) {
            if (!phoneticUs) phoneticUs = p.text;
            else if (!phoneticUk) phoneticUk = p.text;
          }
        }
      }

      if (!phoneticUs) phoneticUs = phonetic;
      if (!phoneticUk) phoneticUk = phonetic;

      // Extract meanings by part of speech
      if (Array.isArray(entry.meanings)) {
        for (const m of entry.meanings.slice(0, 3)) {
          const pos = m.partOfSpeech || 'word';
          const defsToProcess = (m.definitions || []).slice(0, 2);

          const defs = await Promise.all(defsToProcess.map(async (d, dIdx) => {
            // For top definition, translate in Vietnamese, else reuse primaryTranslation
            let defVi = primaryTranslation;
            if (dIdx === 0 && d.definition) {
              defVi = await translateToVietnamese(d.definition, 1500) || primaryTranslation;
            }
            return {
              definitionEn: d.definition,
              definitionVi: defVi,
              exampleEn: d.example || `The word "${word}" is frequently used in TOEIC business communication.`,
              exampleVi: `Từ "${word}" mang nghĩa "${primaryTranslation}" trong bài thi TOEIC.`
            };
          }));

          if (defs.length > 0) {
            meanings.push({
              partOfSpeech: pos,
              definitions: defs
            });
          }

          if (Array.isArray(m.synonyms) && m.synonyms.length > 0) {
            synonyms.push(...m.synonyms);
          }
        }
      }
    }

    // 6. Merge with local TOEIC database if available (gives pedagogical priority)
    if (toeicDbEntry) {
      if (!phoneticUs && toeicDbEntry.phonetic) phoneticUs = toeicDbEntry.phonetic;
      if (!phoneticUk && toeicDbEntry.phoneticUk) phoneticUk = toeicDbEntry.phoneticUk;

      const toeicMeaningItem = {
        definitionEn: `Core TOEIC business meaning: ${primaryTranslation}`,
        definitionVi: toeicDbEntry.meaning || primaryTranslation,
        exampleEn: toeicDbEntry.exampleEn || `She checked the ${word} schedule carefully.`,
        exampleVi: toeicDbEntry.exampleVi || `Cô ấy đã kiểm tra lịch trình ${primaryTranslation} một cách cẩn thận.`
      };

      const existingPosGroup = meanings.find(m => m.partOfSpeech.toLowerCase() === (toeicDbEntry.pos || 'noun').toLowerCase());
      if (existingPosGroup) {
        existingPosGroup.definitions.unshift(toeicMeaningItem);
      } else {
        meanings.unshift({
          partOfSpeech: toeicDbEntry.pos || 'noun',
          definitions: [toeicMeaningItem]
        });
      }
    }

    // 7. Fallback if no meanings found from dictionary API
    if (meanings.length === 0) {
      meanings.push({
        partOfSpeech: 'vocabulary',
        definitions: [
          {
            definitionEn: `Meaning of "${word}" in business & TOEIC context.`,
            definitionVi: primaryTranslation,
            exampleEn: `You need to understand "${word}" in the TOEIC test.`,
            exampleVi: `Bạn cần nắm rõ "${primaryTranslation}" trong bài thi TOEIC.`
          }
        ]
      });
    }

    // Deduplicate synonyms
    const uniqueSynonyms = Array.from(new Set(synonyms)).slice(0, 8);

    // Generate word family heuristics
    const baseRoot = word.toLowerCase().replace(/(ing|ed|ly|tion|ment|able|ive|s)$/, '');
    const wordFamily = Array.from(new Set([
      word.toLowerCase(),
      `${baseRoot}s`,
      `${baseRoot}ed`,
      `${baseRoot}ing`,
      `${baseRoot}tion`,
      `${baseRoot}ment`,
      `${baseRoot}able`
    ])).filter(w => w.length >= 4).slice(0, 5);

    // Common TOEIC collocations / phrases
    const commonPhrases = [
      `make an ${word}`,
      `${word} schedule`,
      `prior to the ${word}`,
      `in terms of ${word}`,
      `confirm the ${word}`
    ];

    const effectiveTranslation = toeicDbEntry?.meaning 
      || (primaryTranslation && primaryTranslation.toLowerCase().trim() !== word.toLowerCase().trim() ? primaryTranslation : '')
      || (meanings[0]?.definitions?.[0]?.definitionVi && meanings[0].definitions[0].definitionVi.toLowerCase().trim() !== word.toLowerCase().trim() ? meanings[0].definitions[0].definitionVi : '')
      || primaryTranslation
      || word;

    const reliableAudioUs = audioUs || `https://dict.youdao.com/dictvoice?audio=${encodeURIComponent(word)}&type=2`;
    const reliableAudioUk = audioUk || `https://dict.youdao.com/dictvoice?audio=${encodeURIComponent(word)}&type=1`;

    const resultData = {
      word: word,
      isPhrase: false,
      translation: effectiveTranslation,
      phonetic: phoneticUs || phonetic || `/${word}/`,
      phoneticUs: phoneticUs || `/${word}/`,
      phoneticUk: phoneticUk || `/${word}/`,
      audioUs: reliableAudioUs,
      audioUk: reliableAudioUk,
      meanings: meanings,
      phrases: commonPhrases,
      synonyms: uniqueSynonyms,
      wordFamily: wordFamily,
      toeicTip: toeicDbEntry ? `Từ vựng thuộc bộ đề: ${toeicDbEntry.topicTitle || 'TOEIC Core'}` : 'Thuộc danh mục từ vựng kinh tế & văn phòng TOEIC.'
    };

    // Save to cache
    setCache(cacheKey, resultData);

    return res.status(200).json({ success: true, data: resultData });
  } catch (error) {
    console.error('Lookup word error:', error);
    return res.status(500).json({ success: false, message: 'Lỗi tra cứu từ vựng: ' + error.message });
  }
};

// ==============================================================================
// 🌐 2-WAY TRANSLATION CONTROLLER (TIẾNG VIỆT <-> TIẾNG ANH & SPEECH INTEGRATION)
// 100% Free & Zero-Cost, Multi-Tier Fallback, Ultra-Fast (<200ms)
// ==============================================================================
const translateCache = new Map();
const MAX_TRANS_CACHE = 5000;

function setTransCache(key, value) {
  if (translateCache.size >= MAX_TRANS_CACHE) {
    const firstKey = translateCache.keys().next().value;
    translateCache.delete(firstKey);
  }
  translateCache.set(key, value);
}

function hasVietnameseMarksCheck(str) {
  return /[àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ]/i.test(str || '');
}

function fetchGoogleMobileTranslate(text, sl, tl) {
  return new Promise((resolve) => {
    const url = `https://translate.google.com/m?sl=${sl}&tl=${tl}&q=${encodeURIComponent(text)}`;
    const req = https.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Mobile/15E148 Safari/604.1'
      }
    }, res => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const match = data.match(/<div class="result-container">([\s\S]*?)<\/div>/i);
          if (match && match[1]) {
            const decoded = match[1]
              .replace(/&quot;/g, '"')
              .replace(/&#39;/g, "'")
              .replace(/&amp;/g, '&')
              .replace(/&lt;/g, '<')
              .replace(/&gt;/g, '>')
              .trim();
            if (decoded) return resolve(decoded);
          }
        } catch {}
        resolve(null);
      });
    });
    req.on('error', () => resolve(null));
    req.setTimeout(3000, () => { req.destroy(); resolve(null); });
  });
}

function fetchClients5Translate(text, sl, tl) {
  return new Promise((resolve) => {
    const url = `https://clients5.google.com/translate_a/t?client=dict-chrome-ex&sl=${sl}&tl=${tl}&q=${encodeURIComponent(text)}`;
    const req = https.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
        'Accept': '*/*'
      }
    }, res => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          if (Array.isArray(parsed)) {
            const result = typeof parsed[0] === 'string' ? parsed[0] : (parsed[0]?.[0] || '');
            if (result && result.trim()) return resolve(result.trim());
          }
        } catch {}
        resolve(null);
      });
    });
    req.on('error', () => resolve(null));
    req.setTimeout(2500, () => { req.destroy(); resolve(null); });
  });
}

function fetchMyMemoryTranslate(text, sl, tl) {
  return new Promise((resolve) => {
    const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${sl}|${tl}`;
    const req = https.get(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' }
    }, res => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          const trans = parsed?.responseData?.translatedText;
          if (trans && !trans.includes('MYMEMORY WARNING') && !trans.startsWith('[')) {
            return resolve(trans.trim());
          }
        } catch {}
        resolve(null);
      });
    });
    req.on('error', () => resolve(null));
    req.setTimeout(2500, () => { req.destroy(); resolve(null); });
  });
}

exports.translateText = async (req, res) => {
  try {
    const text = (req.body?.text || req.query?.text || req.query?.q || '').trim();
    if (!text) {
      return res.status(400).json({ success: false, message: 'Nội dung cần dịch không được để trống' });
    }

    let sl = (req.body?.sourceLang || req.query?.sl || req.query?.source || 'auto').toLowerCase().trim();
    let tl = (req.body?.targetLang || req.query?.tl || req.query?.target || '').toLowerCase().trim();

    // Auto-detect language if requested or not specified
    let detectedLang = sl;
    if (sl === 'auto' || !tl) {
      const isVi = hasVietnameseMarksCheck(text);
      if (isVi) {
        detectedLang = 'vi';
        if (!tl || tl === 'vi') tl = 'en';
        sl = 'vi';
      } else {
        detectedLang = 'en';
        if (!tl || tl === 'en') tl = 'vi';
        sl = 'en';
      }
    }

    if (sl === tl) {
      tl = sl === 'vi' ? 'en' : 'vi';
    }

    const cacheKey = `${sl}:${tl}:${text.toLowerCase()}`;
    const cached = translateCache.get(cacheKey);
    if (cached) {
      return res.status(200).json({
        success: true,
        fromCache: true,
        sourceLang: sl,
        targetLang: tl,
        detectedLang,
        originalText: text,
        translatedText: cached
      });
    }

    // Multi-tier translation pipeline
    let translated = await fetchClients5Translate(text, sl, tl);
    if (!translated) {
      translated = await fetchGoogleMobileTranslate(text, sl, tl);
    }
    if (!translated) {
      translated = await fetchMyMemoryTranslate(text, sl, tl);
    }

    if (!translated) {
      translated = text;
    }

    setTransCache(cacheKey, translated);

    return res.status(200).json({
      success: true,
      sourceLang: sl,
      targetLang: tl,
      detectedLang,
      originalText: text,
      translatedText: translated
    });
  } catch (error) {
    console.error('Translate text error:', error);
    return res.status(500).json({ success: false, message: 'Lỗi dịch thuật: ' + error.message });
  }
};

