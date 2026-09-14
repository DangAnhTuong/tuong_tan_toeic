import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, ShoppingBag, Trash2, Volume2, ArrowRight } from 'lucide-react';
import { getLocalBasketWords, getBasketWords, removeWordFromBasket } from '../services/vocabBasketService';

export default function VocabularyDrawer({ isOpen, onClose, vocabList = [], onDeleteWord, title = 'Giỏ Từ Vựng' }) {
  const navigate = useNavigate();
  const [internalList, setInternalList] = useState(() => getLocalBasketWords());

  // Function to compute merged freshest list
  const refreshList = () => {
    const local = getLocalBasketWords();
    const map = new Map();
    // 1. Add prop words if any
    if (Array.isArray(vocabList)) {
      vocabList.forEach(w => {
        if (w && w.word) map.set(w.word.toLowerCase().trim(), w);
      });
    }
    // 2. Add local storage words (which are always the latest authoritative saved words)
    local.forEach(w => {
      if (w && w.word) map.set(w.word.toLowerCase().trim(), w);
    });
    const merged = Array.from(map.values());
    setInternalList(merged);
    return merged;
  };

  // Sync internalList on open or prop change
  useEffect(() => {
    if (isOpen) {
      refreshList();
      // Also background sync with MongoDB
      getBasketWords().then(words => {
        if (words && Array.isArray(words)) {
          setInternalList(words);
        }
      }).catch(() => {});
    }
  }, [isOpen, vocabList]);

  // Real-time synchronization whenever any word is added/removed across the app
  useEffect(() => {
    const handleBasketUpdate = (e) => {
      const detail = e?.detail;
      if (detail?.allWords && Array.isArray(detail.allWords)) {
        setInternalList(detail.allWords);
      } else {
        refreshList();
      }
    };

    window.addEventListener('vocab_basket_updated', handleBasketUpdate);
    return () => window.removeEventListener('vocab_basket_updated', handleBasketUpdate);
  }, [vocabList]);

  if (!isOpen) return null;

  const handleDeleteItem = async (index) => {
    const target = internalList[index];
    const nextList = internalList.filter((_, idx) => idx !== index);
    setInternalList(nextList);

    if (target && target.word) {
      try {
        await removeWordFromBasket(target.word);
      } catch (e) {
        console.warn('Delete word from basket error:', e);
      }
    }
    if (onDeleteWord) onDeleteWord(index);
  };

  const handleStartReview = () => {
    if (onClose) onClose();
    navigate('/vocabulary/review?source=cart&tab=learn&study=flashcard');
  };

  const handleSpeak = (text) => {
    if (!text) return;
    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'en-US';
      utterance.rate = 0.9;
      window.speechSynthesis.speak(utterance);
    } catch (e) {}
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden animate-fadeIn">
      {/* Backdrop */}
      <div 
        onClick={onClose} 
        className="absolute inset-0 bg-slate-950/70 backdrop-blur-sm transition-opacity" 
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md glass-panel dark:bg-[#0f172a] bg-white dark:border-l dark:border-slate-800 border-l border-slate-200 dark:text-slate-100 text-slate-800 shadow-2xl flex flex-col">
          
          {/* Drawer Header */}
          <div className="p-6 border-b dark:border-slate-800 border-slate-100 flex items-center justify-between dark:bg-slate-950/60 bg-slate-50/80">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-amber-500/10 text-amber-500 border border-amber-500/20">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-heading font-bold text-base dark:text-white text-slate-900">{title}</h3>
                <p className="text-xs dark:text-slate-400 text-slate-500">({internalList.length} từ đã lưu)</p>
              </div>
            </div>
            <button 
              onClick={onClose}
              className="p-2 rounded-lg text-slate-400 hover:text-slate-800 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Drawer Content */}
          <div className="flex-1 overflow-y-auto p-6 space-y-3">
            {internalList.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 dark:text-slate-400 text-slate-500">
                <ShoppingBag className="w-12 h-12 stroke-1 dark:text-slate-600 text-slate-300 mb-3" />
                <p className="font-semibold dark:text-slate-300 text-slate-700">Giỏ từ trống</p>
                <p className="text-xs mt-1 max-w-xs dark:text-slate-500 text-slate-400">
                  Tra từ hoặc bấm nút "Thêm vào giỏ" trong lúc làm bài để lưu từ vựng cần học.
                </p>
              </div>
            ) : (
              internalList.map((item, index) => (
                <div 
                  key={index}
                  className="p-4 rounded-xl dark:bg-slate-800/40 bg-slate-50/80 border dark:border-slate-800 border-slate-200/90 hover:border-amber-500/30 transition-all flex items-start justify-between group shadow-sm"
                >
                  <div className="space-y-1 pr-2">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-amber-500 text-base">{item.word}</span>
                      {item.phonetic && (
                        <span className="text-xs dark:text-slate-400 text-slate-500">{item.phonetic}</span>
                      )}
                      <button 
                        onClick={() => handleSpeak(item.word)}
                        className="text-slate-400 hover:text-amber-500 transition-colors p-1"
                        title="Nghe phát âm"
                      >
                        <Volume2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <p className="text-xs dark:text-slate-200 text-slate-800 font-medium">{item.meaning || item.definition || 'Chưa có định nghĩa'}</p>
                    {item.example && (
                      <p className="text-[11px] dark:text-slate-400 text-slate-500 italic">VD: {item.example}</p>
                    )}
                  </div>
                  
                  <button 
                    onClick={() => handleDeleteItem(index)}
                    className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg dark:text-slate-500 dark:hover:text-rose-400 dark:hover:bg-slate-800 text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-all"
                    title="Xóa khỏi giỏ từ"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))
            )}
          </div>

          {/* Drawer Footer */}
          <div className="p-6 border-t dark:border-slate-800 border-slate-100 dark:bg-slate-950/80 bg-slate-50/80 space-y-3">
            <button 
              onClick={handleStartReview}
              disabled={internalList.length === 0}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 disabled:opacity-50 disabled:cursor-not-allowed text-slate-950 font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 transition-all cursor-pointer"
            >
              <span>Ôn tập {internalList.length > 0 ? `(${internalList.length} từ)` : ''}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
