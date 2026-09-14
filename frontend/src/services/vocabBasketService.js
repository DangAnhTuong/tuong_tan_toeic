import axios from 'axios';

const BASKET_STORAGE_KEYS = ['tuongtan_vocab_basket', 'user_vocab_basket', 'tuongtan_cart_words'];

// Helper to get local words merged across keys
export const getLocalBasketWords = () => {
  try {
    const map = new Map();
    BASKET_STORAGE_KEYS.forEach(key => {
      try {
        const raw = localStorage.getItem(key);
        if (raw) {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed)) {
            parsed.forEach(item => {
              if (item && item.word) {
                map.set(item.word.toLowerCase().trim(), item);
              }
            });
          }
        }
      } catch (e) {}
    });
    return Array.from(map.values());
  } catch (e) {
    return [];
  }
};

// Helper to save words into all local storage keys
const saveLocalBasketWords = (wordsList) => {
  try {
    const jsonStr = JSON.stringify(wordsList);
    BASKET_STORAGE_KEYS.forEach(key => {
      localStorage.setItem(key, jsonStr);
    });
  } catch (e) {
    console.warn('saveLocalBasketWords error:', e);
  }
};

/**
 * Add a single word to vocabulary basket (Synced Local + MongoDB)
 */
export const addWordToBasket = async (wordEntry, customDeckName = null, customSource = null) => {
  if (!wordEntry || !wordEntry.word) return [];

  const cleanWord = wordEntry.word.trim();
  const deck = (customDeckName || wordEntry.deckName || 'Giỏ từ vựng cá nhân').trim();
  const source = (customSource || wordEntry.source || 'general').trim();

  const normalizedEntry = {
    word: cleanWord,
    phonetic: wordEntry.phonetic || wordEntry.ipaUS || wordEntry.phoneticUS || wordEntry.phoneticUk || '',
    meaning: wordEntry.meaning || wordEntry.definition || '',
    exampleEn: wordEntry.exampleEn || wordEntry.example || '',
    exampleVi: wordEntry.exampleVi || wordEntry.translation || wordEntry.example_vi || '',
    pos: wordEntry.pos || wordEntry.partOfSpeech || 'n.',
    deckName: deck,
    source: source,
    addedAt: wordEntry.addedAt || new Date().toISOString()
  };

  // 1. Update local storage
  const currentList = getLocalBasketWords();
  const filtered = currentList.filter(item => item.word.toLowerCase().trim() !== cleanWord.toLowerCase());
  const updatedList = [normalizedEntry, ...filtered];
  saveLocalBasketWords(updatedList);

  // 2. Dispatch custom event for immediate UI reflection in components
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('vocab_basket_updated', { 
      detail: {
        ...normalizedEntry,
        type: 'add',
        word: cleanWord,
        wordItem: normalizedEntry,
        words: [normalizedEntry],
        allWords: updatedList,
        count: updatedList.length
      }
    }));
  }

  // 3. Persist to Backend MongoDB with JWT Token
  try {
    await axios.post('/api/v1/vocab/basket', normalizedEntry);
  } catch (err) {
    console.warn('Backend basket sync error (saved locally):', err.message);
  }

  return updatedList;
};

/**
 * Add multiple words to vocabulary basket in batch
 */
export const addWordsToBasket = async (wordList, customDeckName = null, customSource = null) => {
  if (!Array.isArray(wordList) || wordList.length === 0) return [];

  const defaultDeck = (customDeckName || 'Giỏ từ vựng cá nhân').trim();
  const defaultSource = (customSource || 'general').trim();

  const validEntries = wordList.filter(w => w && w.word).map(w => ({
    word: w.word.trim(),
    phonetic: w.phonetic || w.ipaUS || w.phoneticUS || w.phoneticUk || '',
    meaning: w.meaning || w.definition || '',
    exampleEn: w.exampleEn || w.example || '',
    exampleVi: w.exampleVi || w.translation || w.example_vi || '',
    pos: w.pos || w.partOfSpeech || 'n.',
    deckName: (w.deckName || defaultDeck).trim(),
    source: (w.source || defaultSource).trim(),
    addedAt: w.addedAt || new Date().toISOString()
  }));

  if (validEntries.length === 0) return [];

  // 1. Update local storage
  const currentList = getLocalBasketWords();
  const map = new Map();
  currentList.forEach(item => map.set(item.word.toLowerCase().trim(), item));
  validEntries.forEach(item => map.set(item.word.toLowerCase().trim(), item));
  const updatedList = Array.from(map.values());
  saveLocalBasketWords(updatedList);

  // 2. Dispatch event with allWords and words array
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('vocab_basket_updated', { 
      detail: { 
        type: 'batch_add',
        word: validEntries[0]?.word || '',
        wordItem: validEntries[0] || null,
        words: validEntries,
        allWords: updatedList,
        count: updatedList.length,
        addedCount: validEntries.length
      } 
    }));
  }

  // 3. Persist batch to backend
  try {
    await axios.post('/api/v1/vocab/basket', { 
      words: validEntries, 
      deckName: defaultDeck, 
      source: defaultSource 
    });
  } catch (err) {
    console.warn('Backend batch basket sync error (saved locally):', err.message);
  }

  return updatedList;
};

/**
 * Get User Decks (Học phần group)
 */
export const getUserDecks = async () => {
  try {
    const res = await axios.get('/api/v1/vocab/decks');
    if (res.data?.data && Array.isArray(res.data.data)) {
      return res.data.data;
    }
  } catch (e) {
    console.warn('Failed to fetch user decks from API:', e.message);
  }

  // Local fallback
  const localWords = getLocalBasketWords();
  const map = new Map();
  localWords.forEach(w => {
    const deck = (w.deckName || 'Giỏ từ vựng cá nhân').trim();
    if (!map.has(deck)) {
      map.set(deck, {
        deckName: deck,
        totalCount: 0,
        learnedCount: 0,
        masteredCount: 0,
        dueCount: 0,
        words: [],
        updatedAt: w.addedAt || new Date()
      });
    }
    const d = map.get(deck);
    d.totalCount += 1;
    if (w.repetitionCount > 0) d.learnedCount += 1;
    if (w.isMastered) d.masteredCount += 1;
    d.words.push(w);
  });

  return Array.from(map.values()).map(d => ({
    ...d,
    progress: Math.round((d.learnedCount / Math.max(1, d.totalCount)) * 100)
  }));
};

/**
 * Get all basket words (Fetches from API if authenticated, falls back to local)
 */
export const getBasketWords = async () => {
  const localWords = getLocalBasketWords();
  try {
    const res = await axios.get('/api/v1/vocab/basket');
    if (res.data && res.data.data && Array.isArray(res.data.data)) {
      const serverWords = res.data.data.map(item => ({
        word: item.word,
        phonetic: item.phonetic,
        meaning: item.meaning,
        exampleEn: item.exampleEn,
        exampleVi: item.exampleVi,
        pos: item.pos || 'n.',
        addedAt: item.createdAt || item.updatedAt || new Date().toISOString(),
        intervalMinutes: item.intervalMinutes,
        nextReviewDate: item.nextReviewDate,
        isMastered: item.isMastered,
        repetitionCount: item.repetitionCount || 0,
        deckName: item.deckName || 'Giỏ từ vựng cá nhân',
        status: item.status || 'learning'
      }));

      const map = new Map();
      localWords.forEach(w => map.set(w.word.toLowerCase().trim(), w));
      serverWords.forEach(w => map.set(w.word.toLowerCase().trim(), w));
      const merged = Array.from(map.values());
      saveLocalBasketWords(merged);
      return merged;
    }
  } catch (e) {
    // Guest or offline: return local
  }
  return localWords;
};

/**
 * Remove word from basket
 */
export const removeWordFromBasket = async (word) => {
  if (!word) return;
  const clean = word.toLowerCase().trim();

  // 1. Remove from local
  const currentList = getLocalBasketWords();
  const updated = currentList.filter(item => item.word.toLowerCase().trim() !== clean);
  saveLocalBasketWords(updated);

  // 2. Dispatch event
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('vocab_basket_updated', { 
      detail: { 
        type: 'remove',
        removedWord: word,
        word: clean,
        allWords: updated,
        count: updated.length
      } 
    }));
  }

  // 3. Call backend delete
  try {
    await axios.delete(`/api/v1/vocab/basket/${encodeURIComponent(clean)}`);
  } catch (e) {
    console.warn('Backend basket delete error:', e.message);
  }

  return updated;
};

export const getBasketWordsSync = getLocalBasketWords;

/**
 * Get basket words by specific deckName
 */
export const getBasketWordsByDeck = async (deckName) => {
  if (!deckName) return getBasketWords();
  const cleanDeck = deckName.trim();

  try {
    const res = await axios.get('/api/v1/vocab/basket', {
      params: { deckName: cleanDeck }
    });
    if (res.data?.data && Array.isArray(res.data.data)) {
      return res.data.data.map(item => ({
        word: item.word,
        phonetic: item.phonetic,
        meaning: item.meaning,
        exampleEn: item.exampleEn,
        exampleVi: item.exampleVi,
        pos: item.pos || 'n.',
        deckName: item.deckName || cleanDeck,
        addedAt: item.createdAt || item.updatedAt || new Date().toISOString(),
        intervalMinutes: item.intervalMinutes,
        nextReviewDate: item.nextReviewDate,
        isMastered: item.isMastered,
        repetitionCount: item.repetitionCount || 0,
        status: item.status || 'learning'
      }));
    }
  } catch (e) {
    console.warn('Failed to fetch words by deck:', e.message);
  }

  // Local fallback
  const all = getLocalBasketWords();
  return all.filter(w => (w.deckName || 'Giỏ từ vựng cá nhân').toLowerCase().trim() === cleanDeck.toLowerCase());
};

/**
 * Delete an entire deck
 */
export const deleteUserDeck = async (deckName) => {
  if (!deckName) return;
  const cleanDeck = deckName.trim();

  // 1. Remove from local
  const currentList = getLocalBasketWords();
  const updated = currentList.filter(item => (item.deckName || 'Giỏ từ vựng cá nhân').toLowerCase().trim() !== cleanDeck.toLowerCase());
  saveLocalBasketWords(updated);

  // 2. Dispatch event
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('vocab_basket_updated', { 
      detail: { 
        type: 'delete_deck',
        deletedDeck: cleanDeck,
        allWords: updated,
        count: updated.length
      } 
    }));
  }

  // 3. Call backend
  try {
    await axios.delete(`/api/v1/vocab/decks/${encodeURIComponent(cleanDeck)}`);
  } catch (e) {
    console.warn('Backend delete deck error:', e.message);
  }

  return updated;
};
