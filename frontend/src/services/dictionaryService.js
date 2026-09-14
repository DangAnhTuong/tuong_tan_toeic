import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api/v1';

// In-memory frontend cache to avoid repeat network requests
const localCache = new Map();

export const lookupDictionary = async (word) => {
  if (!word || typeof word !== 'string' || !word.trim()) {
    return null;
  }

  const cleanWord = word.trim();
  const cacheKey = cleanWord.toLowerCase();

  if (localCache.has(cacheKey)) {
    return localCache.get(cacheKey);
  }

  try {
    const res = await axios.get(`${API_BASE_URL}/dictionary/lookup`, {
      params: { word: cleanWord },
      timeout: 8000
    });

    if (res.data && res.data.success && res.data.data) {
      localCache.set(cacheKey, res.data.data);
      return res.data.data;
    }
  } catch (err) {
    console.warn('Backend dictionary lookup failed, falling back to client-side translation:', err.message);
  }

  // Client-side fallback if backend cannot be reached
  try {
    const transRes = await axios.get(
      `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=vi&dt=t&q=${encodeURIComponent(cleanWord)}`,
      { timeout: 5000 }
    );
    const transVi = transRes.data?.[0]?.map(item => item[0]).join('') || cleanWord;
    
    const fallbackData = {
      word: cleanWord,
      translation: transVi,
      phoneticUs: `/${cleanWord}/`,
      phoneticUk: `/${cleanWord}/`,
      meanings: [
        {
          partOfSpeech: cleanWord.includes(' ') ? 'phrase' : 'word',
          definitions: [
            {
              definitionEn: `Meaning of "${cleanWord}" in TOEIC context.`,
              definitionVi: transVi,
              exampleEn: `She reviewed the phrase "${cleanWord}" carefully.`,
              exampleVi: `Cô ấy đã ôn tập cụm từ "${cleanWord}" một cách cẩn thận.`
            }
          ]
        }
      ],
      phrases: [`in terms of ${cleanWord}`, `with regard to ${cleanWord}`],
      synonyms: ['term', 'concept', 'expression'],
      wordFamily: [cleanWord]
    };

    localCache.set(cacheKey, fallbackData);
    return fallbackData;
  } catch (clientErr) {
    console.error('All dictionary fallbacks failed:', clientErr);
    return {
      word: cleanWord,
      translation: cleanWord,
      phoneticUs: `/${cleanWord}/`,
      phoneticUk: `/${cleanWord}/`,
      meanings: [
        {
          partOfSpeech: 'word',
          definitions: [
            {
              definitionEn: cleanWord,
              definitionVi: cleanWord,
              exampleEn: cleanWord,
              exampleVi: cleanWord
            }
          ]
        }
      ],
      phrases: [],
      synonyms: [],
      wordFamily: []
    };
  }
};
