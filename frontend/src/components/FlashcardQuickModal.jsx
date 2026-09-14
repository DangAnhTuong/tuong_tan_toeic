import React, { useState } from 'react';
import { X, Volume2, ChevronLeft, ChevronRight, RotateCw, BookOpen, Check, Bookmark } from 'lucide-react';

export default function FlashcardQuickModal({ isOpen, onClose, vocabList = [], onAddToBasket }) {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  if (!isOpen || vocabList.length === 0) return null;

  const currentWord = vocabList[currentIdx] || vocabList[0];

  const handleSpeak = (e, text, lang = 'en-US') => {
    e.stopPropagation();
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = lang;
    u.rate = 0.9;
    window.speechSynthesis.speak(u);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="w-full max-w-md dark:bg-slate-900 bg-white border border-amber-500/40 rounded-3xl p-6 shadow-2xl space-y-5 dark:text-slate-100 text-slate-800 relative">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b dark:border-slate-800 border-slate-100 pb-3">
          <div className="flex items-center gap-2 text-amber-500 font-extrabold text-sm font-heading">
            <BookOpen className="w-4 h-4" />
            <span>🎴 Lật Thẻ Từ Vựng Nhanh ({currentIdx + 1}/{vocabList.length})</span>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-400 dark:hover:text-white bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* 3D Flashcard */}
        <div
          onClick={() => setIsFlipped(!isFlipped)}
          className="w-full h-64 cursor-pointer perspective-1000 group select-none"
        >
          <div className={`w-full h-full rounded-3xl p-6 transition-all duration-500 transform-style-3d flex flex-col justify-between items-center text-center border ${
            isFlipped 
              ? 'dark:bg-gradient-to-br dark:from-slate-950 dark:to-slate-900 bg-gradient-to-br from-amber-50 to-orange-50/60 border-amber-500/50 shadow-amber-500/10 shadow-xl' 
              : 'dark:bg-gradient-to-br dark:from-slate-900 dark:to-slate-950 bg-gradient-to-br from-sky-50 to-blue-50/60 border-sky-500/40 shadow-sky-500/10 shadow-xl group-hover:border-sky-400'
          }`}>
            
            {/* Top Badge */}
            <div className="w-full flex items-center justify-between">
              <span className="px-2.5 py-0.5 rounded-full bg-sky-500/20 text-sky-600 dark:text-sky-400 font-mono text-[10px] font-bold">
                {currentWord.level || 'B1'} • {currentWord.pos || 'v'}
              </span>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (onAddToBasket) onAddToBasket(currentWord);
                }}
                className="p-1.5 rounded-lg dark:bg-slate-800 bg-white hover:bg-amber-500 hover:text-slate-950 text-amber-500 transition-all text-xs font-bold flex items-center gap-1 shadow-sm"
                title="Lưu vào giỏ từ"
              >
                <Bookmark className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Main Word or Meaning */}
            <div className="space-y-2">
              {!isFlipped ? (
                <>
                  <h3 className="text-2xl font-heading font-black dark:text-white text-slate-900">{currentWord.word}</h3>
                  {currentWord.phonetic && (
                    <p className="text-xs text-sky-600 dark:text-sky-400 font-mono">{currentWord.phonetic}</p>
                  )}
                  <button
                    onClick={(e) => handleSpeak(e, currentWord.word)}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full dark:bg-slate-800 dark:text-slate-300 bg-white text-slate-700 shadow-sm hover:bg-sky-500 hover:text-slate-950 text-xs font-bold transition-colors mt-2"
                  >
                    <Volume2 className="w-3.5 h-3.5 text-sky-500" />
                    <span>Phát âm</span>
                  </button>
                </>
              ) : (
                <>
                  <h4 className="text-lg font-heading font-extrabold dark:text-amber-300 text-amber-700">{currentWord.meaning}</h4>
                  {currentWord.example && (
                    <p className="text-xs dark:text-slate-300 text-slate-600 italic max-w-xs mt-2">
                      "{currentWord.example}"
                    </p>
                  )}
                </>
              )}
            </div>

            {/* Bottom Flip Hint */}
            <div className="flex items-center gap-1 text-[11px] dark:text-slate-500 text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300 transition-colors">
              <RotateCw className="w-3 h-3" />
              <span>Chạm để lật xem {isFlipped ? 'từ tiếng Anh' : 'nghĩa tiếng Việt'}</span>
            </div>

          </div>
        </div>

        {/* Bottom Navigation */}
        <div className="flex items-center justify-between pt-2">
          <button
            onClick={() => {
              setIsFlipped(false);
              setCurrentIdx(prev => Math.max(0, prev - 1));
            }}
            disabled={currentIdx === 0}
            className="px-4 py-2 rounded-xl dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-300 bg-slate-100 hover:bg-slate-200 text-slate-700 disabled:opacity-30 text-xs font-bold flex items-center gap-1 transition-all"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Trước</span>
          </button>

          <span className="font-mono text-xs dark:text-slate-400 text-slate-500 font-bold">
            {currentIdx + 1} / {vocabList.length}
          </span>

          <button
            onClick={() => {
              setIsFlipped(false);
              setCurrentIdx(prev => Math.min(vocabList.length - 1, prev + 1));
            }}
            disabled={currentIdx === vocabList.length - 1}
            className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 disabled:opacity-30 text-xs font-extrabold flex items-center gap-1 transition-all shadow-md shadow-amber-500/20"
          >
            <span>Tiếp</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

      </div>
    </div>
  );
}
