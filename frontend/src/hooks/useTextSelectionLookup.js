import { useEffect, useRef } from 'react';
import { useDictionary } from '../context/DictionaryContext';

/**
 * Hook to capture word selection & double-click for instant dictionary popup
 * @param {Object} options
 * @param {boolean} options.isEnabled - whether dictionary popup is toggled ON
 * @param {Function} [options.onLookup] - optional custom callback when a word/phrase is selected: (word, position) => void
 */
export function useTextSelectionLookup(options = {}) {
  const { isEnabled = true, onLookup } = options;
  let dictContext = null;
  try {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    dictContext = useDictionary();
  } catch (e) {
    // In case used outside DictionaryProvider
    dictContext = null;
  }

  const isEnabledRef = useRef(isEnabled);
  isEnabledRef.current = isEnabled;

  const onLookupRef = useRef(onLookup);
  onLookupRef.current = onLookup;

  useEffect(() => {
    // If a custom onLookup is not provided, the global DictionaryProvider already handles document selection
    if (!onLookupRef.current) return;

    const handleSelection = (e) => {
      if (!isEnabledRef.current) return;

      // Ignore if inside dictionary modal, audio player, or opt-out containers
      if (
        e.target.closest('.dictionary-modal-container') ||
        e.target.closest('.audio-player-container') ||
        e.target.closest('.no-dictionary-lookup')
      ) {
        return;
      }

      // Ignore editable inputs without selection
      if (
        (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') &&
        !e.target.readOnly
      ) {
        return;
      }

      setTimeout(() => {
        const selection = window.getSelection();
        if (!selection || selection.rangeCount === 0 || selection.isCollapsed) return;

        const rawSelectedText = selection.toString().trim();
        const selectedText = rawSelectedText.replace(/^[“"'({\[\s]+|[.,;:!?”"')}\]\s]+$/g, '').trim();

        if (!selectedText || selectedText.length < 2 || selectedText.length > 60) return;
        if (!/[a-zA-Z]/.test(selectedText)) return;

        const wordsCount = selectedText.split(/\s+/).length;
        if (wordsCount > 6) return;

        try {
          const range = selection.getRangeAt(0);
          const rect = range.getBoundingClientRect();
          if (rect.width === 0 && rect.height === 0) return;

          const popupWidth = Math.min(410, window.innerWidth - 32);
          let posX = rect.left;
          if (posX + popupWidth > window.innerWidth - 16) {
            posX = window.innerWidth - popupWidth - 16;
          }
          if (posX < 16) posX = 16;

          let posY = rect.bottom + 8;
          const popupHeight = 440;
          if (posY + popupHeight > window.innerHeight - 16) {
            if (rect.top - popupHeight - 8 > 16) {
              posY = rect.top - popupHeight - 8;
            } else {
              posY = Math.max(16, window.innerHeight - popupHeight - 16);
            }
          }

          if (onLookupRef.current) {
            onLookupRef.current(selectedText, { x: Math.round(posX), y: Math.round(posY) });
          }
        } catch (err) {
          if (onLookupRef.current) {
            onLookupRef.current(selectedText, null);
          }
        }
      }, 50);
    };

    document.addEventListener('mouseup', handleSelection);
    document.addEventListener('dblclick', handleSelection);
    return () => {
      document.removeEventListener('mouseup', handleSelection);
      document.removeEventListener('dblclick', handleSelection);
    };
  }, []);

  return dictContext;
}
