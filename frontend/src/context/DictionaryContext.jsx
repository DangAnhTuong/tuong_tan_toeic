import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import DictionaryModal from '../components/DictionaryModal';

export const DictionaryContext = createContext({
  dictionaryWord: null,
  dictPosition: null,
  isOpen: false,
  isDictEnabled: true,
  deckContext: '',
  setDeckContext: () => {},
  openDictionary: () => {},
  closeDictionary: () => {},
  toggleDictEnabled: () => {},
});

export function DictionaryProvider({ children }) {
  const [dictionaryWord, setDictionaryWord] = useState(null);
  const [dictPosition, setDictPosition] = useState(null);
  const [activeDeckName, setActiveDeckName] = useState('');
  const [deckContext, setDeckContext] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [isDictEnabled, setIsDictEnabled] = useState(() => {
    try {
      const saved = localStorage.getItem('tuongtan_dict_enabled');
      return saved !== null ? JSON.parse(saved) : true;
    } catch (e) {
      return true;
    }
  });

  const isEnabledRef = useRef(isDictEnabled);
  isEnabledRef.current = isDictEnabled;

  const deckContextRef = useRef(deckContext);
  deckContextRef.current = deckContext;

  const toggleDictEnabled = useCallback(() => {
    setIsDictEnabled((prev) => {
      const next = !prev;
      try {
        localStorage.setItem('tuongtan_dict_enabled', JSON.stringify(next));
      } catch (e) {}
      return next;
    });
  }, []);

  const openDictionary = useCallback((word, position = null, customDeckName = null) => {
    if (!word || typeof word !== 'string' || !word.trim()) return;
    const cleanWord = word.trim().replace(/^[“"'({\[\s]+|[.,;:!?”"')}\]\s]+$/g, '').trim();
    if (!cleanWord) return;

    setDictionaryWord(cleanWord);
    setDictPosition(position);
    setActiveDeckName(customDeckName || deckContextRef.current || '');
    setIsOpen(true);
  }, []);

  const closeDictionary = useCallback(() => {
    setIsOpen(false);
    setDictionaryWord(null);
    setDictPosition(null);
    if (window.getSelection) {
      try {
        window.getSelection().removeAllRanges();
      } catch (e) {}
    }
  }, []);

  // Global mouseup & dblclick text selection listeners
  useEffect(() => {
    let selectionTimeout = null;

    const handleSelectionTrigger = (e) => {
      if (!isEnabledRef.current) return;

      // Ignore if clicking inside dictionary modal
      if (e && e.target && e.target.closest && e.target.closest('.dictionary-modal-container')) {
        return;
      }

      // Ignore audio controls
      if (e && e.target && e.target.closest && e.target.closest('.audio-player-container')) {
        return;
      }

      // Ignore explicit opt-out elements
      if (e && e.target && e.target.closest && e.target.closest('.no-dictionary-lookup')) {
        return;
      }

      // If clicking inside editable text fields without selection, ignore
      if (
        e && e.target &&
        (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') &&
        !e.target.readOnly
      ) {
        return;
      }

      clearTimeout(selectionTimeout);

      // Debounce slightly to allow browser selection range to finalize
      selectionTimeout = setTimeout(() => {
        const selection = window.getSelection();
        if (!selection || selection.rangeCount === 0 || selection.isCollapsed) {
          return;
        }

        const rawText = selection.toString().trim();
        if (!rawText) return;

        // Clean leading/trailing punctuation, quotes, brackets
        const cleanText = rawText.replace(/^[“"'({\[\s]+|[.,;:!?”"')}\]\s]+$/g, '').trim();

        // Must contain at least one English alphabetic character
        if (!/[a-zA-Z]/.test(cleanText)) {
          return;
        }

        // Length checks: 2 to 60 chars, max 6 words
        if (cleanText.length < 2 || cleanText.length > 60) {
          return;
        }

        const wordsCount = cleanText.split(/\s+/).length;
        if (wordsCount > 6) {
          return;
        }

        // Calculate safe floating popup coordinates
        try {
          const range = selection.getRangeAt(0);
          const rect = range.getBoundingClientRect();
          if (rect.width === 0 && rect.height === 0) return;

          const popupWidth = Math.min(410, window.innerWidth - 32);
          const popupHeight = 440;

          let posX = rect.left;
          if (posX + popupWidth > window.innerWidth - 16) {
            posX = window.innerWidth - popupWidth - 16;
          }
          if (posX < 16) posX = 16;

          let posY = rect.bottom + 8;
          if (posY + popupHeight > window.innerHeight - 16) {
            if (rect.top - popupHeight - 8 > 16) {
              posY = rect.top - popupHeight - 8;
            } else {
              posY = Math.max(16, window.innerHeight - popupHeight - 16);
            }
          }

          const elDeck = e?.target?.closest?.('[data-deck-name]')?.getAttribute('data-deck-name') || null;
          openDictionary(cleanText, { x: Math.round(posX), y: Math.round(posY) }, elDeck);
        } catch (err) {
          const elDeck = e?.target?.closest?.('[data-deck-name]')?.getAttribute('data-deck-name') || null;
          openDictionary(cleanText, null, elDeck);
        }
      }, 60);
    };

    // Custom window event listener for programmatic lookup
    const handleCustomLookup = (e) => {
      if (e.detail?.word) {
        openDictionary(e.detail.word, e.detail.position || null, e.detail.deckName || null);
      }
    };

    document.addEventListener('mouseup', handleSelectionTrigger);
    window.addEventListener('open_dictionary', handleCustomLookup);

    return () => {
      clearTimeout(selectionTimeout);
      document.removeEventListener('mouseup', handleSelectionTrigger);
      window.removeEventListener('open_dictionary', handleCustomLookup);
    };
  }, [openDictionary]);

  return (
    <DictionaryContext.Provider
      value={{
        dictionaryWord,
        dictPosition,
        isOpen,
        isDictEnabled,
        deckContext,
        setDeckContext,
        activeDeckName,
        openDictionary,
        closeDictionary,
        toggleDictEnabled,
      }}
    >
      {children}

      {/* Global Dictionary Modal instance */}
      {isOpen && dictionaryWord && (
        <DictionaryModal
          word={dictionaryWord}
          isOpen={isOpen}
          position={dictPosition}
          deckName={activeDeckName || deckContext || 'Giỏ từ vựng cá nhân'}
          onClose={closeDictionary}
        />
      )}
    </DictionaryContext.Provider>
  );
}

export function useDictionary() {
  const context = useContext(DictionaryContext);
  if (!context) {
    throw new Error('useDictionary must be used within a DictionaryProvider');
  }
  return context;
}
