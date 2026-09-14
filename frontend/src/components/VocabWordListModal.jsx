import React, { useState } from 'react';
import { 
  X, 
  Volume2, 
  Search, 
  BookOpen, 
  Gamepad2, 
  Sparkles, 
  Bookmark, 
  Check, 
  ExternalLink 
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function VocabWordListModal({ isOpen, onClose, topic }) {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [playingWord, setPlayingWord] = useState(null);

  if (!isOpen || !topic) return null;

  const words = topic.words || [];
  const filteredWords = words.filter(w => 
    w.word?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    w.meaning?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSpeak = (text) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'en-US';
      utterance.rate = 0.9;
      setPlayingWord(text);
      utterance.onend = () => setPlayingWord(null);
      utterance.onerror = () => setPlayingWord(null);
      window.speechSynthesis.speak(utterance);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div 
        className="relative w-full max-w-4xl max-h-[90vh] bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl flex flex-col overflow-hidden text-slate-100 animate-scaleUp"
        onClick={(e) => e.stopPropagation()}
      >
        {/* HEADER */}
        <div className="p-6 border-b border-slate-800 flex items-center justify-between bg-slate-900/90 backdrop-blur-sm sticky top-0 z-10">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                {topic.tagLabel || 'TỪ VỰNG TOEIC'}
              </span>
              <span className="text-xs text-slate-400 font-mono">
                {words.length} từ vựng
              </span>
            </div>
            <h2 className="text-xl font-extrabold font-heading text-white tracking-tight">
              {topic.title}
            </h2>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* SEARCH & FILTERS */}
        <div className="px-6 py-3 bg-slate-950/50 border-b border-slate-800/80 flex items-center gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Tìm kiếm từ vựng, nghĩa tiếng Việt..."
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs font-medium text-white placeholder-slate-500 focus:border-emerald-500 outline-none"
            />
          </div>
          <span className="text-xs text-slate-400 font-mono shrink-0">
            {filteredWords.length} kết quả
          </span>
        </div>

        {/* WORD LIST */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4 max-h-[calc(90vh-200px)]">
          {filteredWords.length === 0 ? (
            <div className="py-12 text-center text-slate-400 text-sm">
              Không tìm thấy từ vựng nào phù hợp với từ khóa.
            </div>
          ) : (
            filteredWords.map((w, idx) => (
              <div 
                key={idx}
                className="glass-card rounded-2xl border border-slate-800 p-4 hover:border-emerald-500/40 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="space-y-1.5 flex-1">
                  <div className="flex items-center gap-3 flex-wrap">
                    <span className="font-heading font-extrabold text-base text-white tracking-wide">
                      {w.word}
                    </span>
                    {w.phonetic && (
                      <span className="text-xs font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">
                        {w.phonetic}
                      </span>
                    )}
                    {w.pos && (
                      <span className="text-[11px] font-semibold text-slate-400 italic">
                        ({w.pos})
                      </span>
                    )}
                    <button
                      onClick={() => handleSpeak(w.word)}
                      title="Nghe phát âm"
                      className={`p-1.5 rounded-xl transition-all ${
                        playingWord === w.word
                          ? 'bg-emerald-500 text-slate-950 scale-110'
                          : 'bg-slate-800 text-slate-300 hover:text-emerald-400 hover:bg-slate-700'
                      }`}
                    >
                      <Volume2 className="w-4 h-4" />
                    </button>
                  </div>

                  <p className="text-sm font-medium text-emerald-300">
                    {w.meaning}
                  </p>

                  {w.exampleEn && (
                    <div className="text-xs space-y-0.5 pt-1 border-t border-slate-800/60 mt-1.5">
                      <p className="text-slate-300 font-sans">
                        • {w.exampleEn}
                      </p>
                      {w.exampleVi && (
                        <p className="text-slate-400 italic">
                          → {w.exampleVi}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {/* BOTTOM ACTION BAR */}
        <div className="p-4 sm:p-6 border-t border-slate-800 bg-slate-900/90 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-xs text-slate-400 hidden sm:block">
            Mẹo: Bấm <strong className="text-emerald-400">Học Flashcard</strong> để hệ thống tự động lên lịch Spaced Repetition.
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              onClick={() => {
                onClose();
                navigate(`/vocabulary/learn/${topic._id}?mode=match`);
              }}
              className="flex-1 sm:flex-none px-5 py-2.5 rounded-xl border border-slate-700 hover:border-slate-600 bg-slate-800 hover:bg-slate-750 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-md active:scale-95"
            >
              <Gamepad2 className="w-4 h-4 text-purple-400" />
              <span>Chơi Game</span>
            </button>

            <button
              onClick={() => {
                onClose();
                navigate(`/vocabulary/learn/${topic._id}?mode=flashcard`);
              }}
              className="flex-1 sm:flex-none px-6 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-xs flex items-center justify-center gap-2 transition-all shadow-lg shadow-emerald-500/20 active:scale-95"
            >
              <BookOpen className="w-4 h-4" />
              <span>Học Flashcard SM-2</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
