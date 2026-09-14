import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  Plus, 
  Check, 
  Volume2, 
  BookOpen, 
  Sparkles, 
  FolderPlus, 
  Search, 
  ChevronDown,
  ChevronUp,
  Edit3
} from 'lucide-react';
import { lookupDictionary } from '../services/dictionaryService';
import { addWordToBasket, getUserDecks } from '../services/vocabBasketService';

export default function DictionaryModal({ 
  word, 
  initialWord,
  isOpen = true, 
  position = null, 
  deckName = 'Giỏ từ vựng cá nhân',
  onClose, 
  onAddWord 
}) {
  const targetWord = word || initialWord || '';

  // Strict check: if not open, do not render anything
  if (!isOpen) {
    return null;
  }

  const [currentWord, setCurrentWord] = useState(targetWord);
  const [searchInput, setSearchInput] = useState(targetWord);
  const [activeTab, setActiveTab] = useState('nghia');
  const [loading, setLoading] = useState(false);
  const [dictData, setDictData] = useState(null);
  const [includeExample, setIncludeExample] = useState(true);
  const [addedItems, setAddedItems] = useState(new Set());
  const [customMeaningText, setCustomMeaningText] = useState('');
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [expandedExamples, setExpandedExamples] = useState(new Set([0]));
  const [targetDeckName, setTargetDeckName] = useState(deckName || 'Giỏ từ vựng cá nhân');
  const [existingDecks, setExistingDecks] = useState([]);
  const modalRef = useRef(null);
  const searchInputRef = useRef(null);

  // Sync deckName prop
  useEffect(() => {
    if (deckName) setTargetDeckName(deckName);
  }, [deckName]);

  // Load existing decks for target deck selector
  useEffect(() => {
    getUserDecks().then(decks => {
      if (decks && Array.isArray(decks)) {
        setExistingDecks(decks.map(d => d.deckName));
      }
    }).catch(() => {});
  }, []);

  const isFloating = Boolean(position && position.x !== undefined && position.y !== undefined);

  // Helper to execute dictionary lookup
  const executeLookup = (query) => {
    const clean = (query || '').trim();
    if (!clean) return;
    setLoading(true);
    setCurrentWord(clean);

    lookupDictionary(clean)
      .then((data) => {
        if (data) {
          setDictData(data);
          setLoading(false);
        }
      })
      .catch((err) => {
        console.error('Dict load error:', err);
        setLoading(false);
      });
  };

  // Load dictionary data when targetWord prop changes
  useEffect(() => {
    const clean = (targetWord || '').trim();
    if (clean) {
      setCurrentWord(clean);
      setSearchInput(clean);
      executeLookup(clean);
    } else {
      setTimeout(() => {
        if (searchInputRef.current) searchInputRef.current.focus();
      }, 100);
    }
  }, [targetWord]);

  const handleSearchSubmit = (e) => {
    if (e) e.preventDefault();
    if (searchInput.trim()) {
      executeLookup(searchInput.trim());
    }
  };

  // Handle Close cleanly: do not wipe selection if user is selecting another word!
  const handleClose = () => {
    if (onClose) onClose();
  };

  // Close on click outside when in floating mode without blocking mouse events
  useEffect(() => {
    if (!isFloating) return;

    const handleOutsideClick = (e) => {
      if (modalRef.current && !modalRef.current.contains(e.target)) {
        if (onClose) onClose();
      }
    };

    // Listen to mousedown with slight delay so current event finishes
    const timer = setTimeout(() => {
      document.addEventListener('mousedown', handleOutsideClick);
    }, 10);

    return () => {
      clearTimeout(timer);
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, [isFloating, onClose]);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        handleClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Pronunciation speaker helper
  const handleSpeak = (text, accent = 'en-US', audioUrl = null) => {
    if (audioUrl) {
      const audio = new Audio(audioUrl);
      audio.play().catch(() => {
        speakSynthesis(text, accent);
      });
    } else {
      speakSynthesis(text, accent);
    }
  };

  const speakSynthesis = (text, accent) => {
    if (!text || typeof window === 'undefined' || !window.speechSynthesis) return;
    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = accent;
      utterance.rate = 0.95;
      window.speechSynthesis.speak(utterance);
    } catch (e) {
      console.warn('Speech synthesis error:', e);
    }
  };

  // Add definition to vocabulary basket (Synced Local + MongoDB)
  const handleAddDefinition = async (definitionItem, indexKey) => {
    if (!dictData) return;

    const wordEntry = {
      word: dictData.word,
      phonetic: dictData.phoneticUs || dictData.phoneticUk || dictData.phonetic,
      meaning: definitionItem.definitionVi || definitionItem.definitionEn,
      exampleEn: includeExample ? definitionItem.exampleEn : '',
      exampleVi: includeExample ? definitionItem.exampleVi : '',
      pos: definitionItem.partOfSpeech || 'word',
      addedAt: new Date().toISOString()
    };

    setAddedItems(prev => new Set(prev).add(indexKey));

    try {
      await addWordToBasket(wordEntry, targetDeckName, 'dictionary_lookup');
    } catch (e) {
      console.warn('Basket add error:', e);
    }

    if (onAddWord) {
      onAddWord(wordEntry);
    }
  };

  // Add custom meaning
  const handleAddCustomMeaning = () => {
    if (!customMeaningText.trim() || !dictData) return;
    handleAddDefinition({
      definitionVi: customMeaningText.trim(),
      definitionEn: 'Nghĩa riêng cá nhân',
      exampleEn: '',
      exampleVi: '',
      partOfSpeech: 'custom'
    }, 'custom_meaning');
    setCustomMeaningText('');
    setShowCustomInput(false);
  };

  const toggleExample = (idx) => {
    setExpandedExamples(prev => {
      const next = new Set(prev);
      if (next.has(idx)) next.delete(idx);
      else next.add(idx);
      return next;
    });
  };

  const floatingStyle = isFloating
    ? {
        position: 'fixed',
        left: `${position.x}px`,
        top: `${position.y}px`
      }
    : {};

  return (
    <div className="dictionary-modal-container pointer-events-auto">
      {/* 1. Backdrop overlay rendered ONLY for centered modal, NEVER for floating lookup */}
      {!isFloating && (
        <div 
          className="fixed inset-0 z-[9998] bg-slate-950/60 backdrop-blur-[2px] transition-opacity"
          onClick={handleClose}
        />
      )}

      {/* 2. Modal / Popover Content */}
      <div 
        ref={modalRef}
        style={floatingStyle}
        onClick={(e) => e.stopPropagation()} 
        className={`z-[9999] flex flex-col glass-panel dark:bg-[#0f172a] bg-white border dark:border-sky-500/50 border-sky-400/60 rounded-2xl shadow-2xl dark:shadow-sky-500/25 shadow-slate-300/50 overflow-hidden dark:text-slate-100 text-slate-800 ${
          isFloating 
            ? 'w-[390px] sm:w-[420px] max-w-[95vw] max-h-[85vh]' 
            : 'fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[390px] sm:w-[420px] max-w-[95vw] max-h-[85vh]'
        } animate-in fade-in zoom-in-95 duration-150`}
      >
        
        {/* ========================================================================= */}
        {/* HEADER: Word Title, Audio buttons, Badge & Close */}
        {/* ========================================================================= */}
        <div className="flex items-start justify-between p-4 pb-3 border-b dark:border-slate-800 border-slate-100 dark:bg-slate-950/70 bg-slate-50/90 shrink-0">
          <div className="space-y-1.5 pr-2 flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-xl font-heading font-extrabold dark:text-white text-slate-900 capitalize tracking-tight truncate">
                {dictData?.word || currentWord || 'Tra cứu từ điển'}
              </h3>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-sky-500/20 text-sky-600 dark:text-sky-400 border border-sky-500/30 shrink-0">
                TOEIC · VI
              </span>
            </div>

            {/* Phonetics & Native Audio US / UK */}
            {(dictData?.word || currentWord) && (
              <div className="flex items-center gap-3 text-xs dark:text-slate-300 text-slate-600 flex-wrap">
                <button
                  onClick={() => handleSpeak(dictData?.word || currentWord, 'en-US', dictData?.audioUs)}
                  className="flex items-center gap-1 px-2 py-0.5 rounded-md dark:bg-slate-800/80 bg-white hover:bg-sky-50 dark:hover:bg-sky-500/20 hover:text-sky-600 dark:hover:text-sky-300 border dark:border-slate-700 border-slate-200 transition-colors shadow-sm cursor-pointer"
                  title="Phát âm giọng Mỹ (US)"
                >
                  <Volume2 className="w-3.5 h-3.5 text-sky-500" />
                  <span className="font-bold dark:text-slate-400 text-slate-500">US</span>
                  <span className="font-mono dark:text-slate-300 text-slate-700">{dictData?.phoneticUs || dictData?.phonetic || ''}</span>
                </button>

                <button
                  onClick={() => handleSpeak(dictData?.word || currentWord, 'en-GB', dictData?.audioUk)}
                  className="flex items-center gap-1 px-2 py-0.5 rounded-md dark:bg-slate-800/80 bg-white hover:bg-amber-50 dark:hover:bg-amber-500/20 hover:text-amber-600 dark:hover:text-amber-300 border dark:border-slate-700 border-slate-200 transition-colors shadow-sm cursor-pointer"
                  title="Phát âm giọng Anh (UK)"
                >
                  <Volume2 className="w-3.5 h-3.5 text-amber-500" />
                  <span className="font-bold dark:text-slate-400 text-slate-500">UK</span>
                  <span className="font-mono dark:text-slate-300 text-slate-700">{dictData?.phoneticUk || dictData?.phonetic || ''}</span>
                </button>
              </div>
            )}
          </div>

          <button 
            onClick={handleClose}
            className="p-1.5 rounded-lg dark:bg-slate-800/80 bg-slate-100 dark:text-slate-400 text-slate-500 hover:text-slate-800 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer shrink-0"
            title="Đóng cửa sổ tra từ (Esc)"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* ========================================================================= */}
        {/* INTERACTIVE SEARCH BAR */}
        {/* ========================================================================= */}
        <form onSubmit={handleSearchSubmit} className="px-3.5 py-2 border-b dark:border-slate-800 border-slate-100 dark:bg-slate-900/50 bg-slate-100/60 flex items-center gap-2 shrink-0">
          <div className="relative flex-1">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            <input
              ref={searchInputRef}
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Nhập từ hoặc câu cần tra cứu..."
              className="w-full pl-8 pr-7 py-1.5 rounded-xl dark:bg-slate-950 bg-white border dark:border-slate-700 border-slate-200 text-xs dark:text-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-sky-500 shadow-sm"
            />
            {searchInput && (
              <button
                type="button"
                onClick={() => setSearchInput('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-0.5"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>
          <button
            type="submit"
            className="px-3 py-1.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-extrabold text-xs transition-colors shrink-0 shadow-sm cursor-pointer"
          >
            Tra
          </button>
        </form>

        {/* ========================================================================= */}
        {/* TABS NAVIGATION: Nghĩa | Cụm từ | Ví dụ | Đồng nghĩa | Họ từ */}
        {/* ========================================================================= */}
        <div className="flex border-b dark:border-slate-800/80 border-slate-100 px-4 dark:bg-slate-950/40 bg-slate-50/60 text-xs font-semibold overflow-x-auto no-scrollbar shrink-0">
          {[
            { id: 'nghia', label: 'Nghĩa' },
            { id: 'cumtu', label: 'Cụm từ' },
            { id: 'vidu', label: 'Ví dụ' },
            { id: 'dongnghia', label: 'Đồng nghĩa' },
            { id: 'hotu', label: 'Họ từ' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-2.5 px-3 relative border-b-2 whitespace-nowrap transition-colors cursor-pointer ${
                activeTab === tab.id
                  ? 'border-sky-500 text-sky-500 font-bold'
                  : 'border-transparent dark:text-slate-400 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* ========================================================================= */}
        {/* OPTIONS ROW: Checkbox Kèm ví dụ & Nút Thêm nghĩa riêng */}
        {/* ========================================================================= */}
        <div className="px-4 py-2 dark:bg-slate-900/60 bg-slate-50/40 border-b dark:border-slate-800/50 border-slate-100 flex items-center justify-between text-xs dark:text-slate-300 text-slate-600 shrink-0">
          <label className="flex items-center gap-1.5 cursor-pointer select-none">
            <input 
              type="checkbox"
              checked={includeExample}
              onChange={(e) => setIncludeExample(e.target.checked)}
              className="rounded dark:bg-slate-800 bg-white dark:border-slate-700 border-slate-300 text-sky-500 focus:ring-0 w-3.5 h-3.5"
            />
            <span className="text-[11px] dark:text-slate-300 text-slate-600">Kèm ví dụ khi thêm từ</span>
          </label>

          <button
            onClick={() => setShowCustomInput(!showCustomInput)}
            className="flex items-center gap-1 text-[11px] text-sky-500 hover:text-sky-600 font-semibold transition-colors cursor-pointer"
          >
            <Edit3 className="w-3 h-3" />
            <span>Thêm nghĩa riêng của bạn +</span>
          </button>
        </div>

        {/* Custom meaning input bar */}
        {showCustomInput && (
          <div className="p-3 dark:bg-slate-950/80 bg-slate-50 border-b dark:border-slate-800 border-slate-100 flex gap-2 animate-fadeIn shrink-0">
            <input
              type="text"
              value={customMeaningText}
              onChange={(e) => setCustomMeaningText(e.target.value)}
              placeholder="Nhập nghĩa riêng của bạn cho từ này..."
              className="flex-1 px-3 py-1.5 rounded-xl dark:bg-slate-900 bg-white border dark:border-slate-700 border-slate-200 text-xs dark:text-white text-slate-900 focus:outline-none focus:border-sky-500"
              onKeyDown={(e) => e.key === 'Enter' && handleAddCustomMeaning()}
            />
            <button
              onClick={handleAddCustomMeaning}
              className="px-3 py-1.5 rounded-xl bg-sky-500 text-slate-950 font-bold text-xs hover:bg-sky-400 transition-colors cursor-pointer"
            >
              Lưu
            </button>
          </div>
        )}

        {/* ========================================================================= */}
        {/* MAIN BODY CONTENT */}
        {/* ========================================================================= */}
        <div className="p-4 overflow-y-auto flex-1 text-sm space-y-4 max-h-[50vh]">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-10 space-y-2 dark:text-slate-400 text-slate-500 text-xs">
              <div className="w-6 h-6 border-2 border-sky-400 border-t-transparent rounded-full animate-spin" />
              <span>Đang tra cứu từ điển TOEIC...</span>
            </div>
          ) : !dictData ? (
            <div className="flex flex-col items-center justify-center py-12 space-y-3 dark:text-slate-400 text-slate-500 text-center">
              <BookOpen className="w-10 h-10 stroke-1 text-sky-500/70" />
              <div className="space-y-1">
                <p className="font-bold text-sm dark:text-slate-200 text-slate-800">Tra cứu từ vựng TOEIC</p>
                <p className="text-xs max-w-xs dark:text-slate-400 text-slate-500">
                  Nhập từ tiếng Anh hoặc cụm từ vào ô tìm kiếm ở trên để tra nghĩa, phiên âm và phát âm chuẩn.
                </p>
              </div>
            </div>
          ) : (
            <>
              {/* TAB 1: NGHĨA */}
              {activeTab === 'nghia' && (
                <div className="space-y-4">
                  {dictData?.meanings?.map((group, gIdx) => (
                    <div key={gIdx} className="space-y-2.5">
                      <div className="text-[11px] font-extrabold uppercase tracking-wider text-amber-500 flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                        <span>{group.partOfSpeech}</span>
                      </div>

                      {group.definitions?.map((def, dIdx) => {
                        const itemKey = `${gIdx}_${dIdx}`;
                        const isAdded = addedItems.has(itemKey);
                        const isExOpen = expandedExamples.has(gIdx * 10 + dIdx);

                        return (
                          <div 
                            key={dIdx}
                            className="p-3 rounded-xl dark:bg-slate-800/40 bg-slate-50 border dark:border-slate-800/80 border-slate-200/90 hover:border-sky-500/40 transition-all space-y-2 shadow-sm"
                          >
                            <div className="flex items-start justify-between gap-2">
                              <div className="space-y-1 flex-1">
                                <p className="font-bold dark:text-slate-100 text-slate-900 text-sm leading-snug">
                                  {def.definitionVi || def.definitionEn}
                                </p>
                                {def.definitionEn && def.definitionVi !== def.definitionEn && (
                                  <p className="text-xs dark:text-slate-400 text-slate-500 leading-normal">
                                    {def.definitionEn}
                                  </p>
                                )}
                              </div>

                              <button
                                onClick={() => handleAddDefinition(def, itemKey)}
                                className={`shrink-0 px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1 transition-all cursor-pointer ${
                                  isAdded
                                    ? 'bg-emerald-500 text-slate-950 shadow-sm shadow-emerald-500/20'
                                    : 'bg-sky-500/20 text-sky-500 hover:bg-sky-500 hover:text-slate-950 border border-sky-500/40'
                                }`}
                              >
                                {isAdded ? (
                                  <>
                                    <Check className="w-3.5 h-3.5" />
                                    <span>Đã thêm</span>
                                  </>
                                ) : (
                                  <>
                                    <Plus className="w-3.5 h-3.5" />
                                    <span>Add</span>
                                  </>
                                )}
                              </button>
                            </div>

                            {def.exampleEn && (
                              <div className="pt-1.5 border-t dark:border-slate-800/60 border-slate-200/60">
                                <button
                                  onClick={() => toggleExample(gIdx * 10 + dIdx)}
                                  className="w-full flex items-center justify-between text-[11px] dark:text-slate-400 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 py-0.5 cursor-pointer"
                                >
                                  <span className="italic font-medium">Ví dụ trong đề thi</span>
                                  {isExOpen ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                                </button>

                                {isExOpen && (
                                  <div className="mt-1 p-2 rounded-lg dark:bg-slate-900/60 bg-white border dark:border-slate-800 border-slate-200 text-xs space-y-1 animate-fadeIn shadow-sm">
                                    <p className="dark:text-slate-200 text-slate-700 italic font-medium leading-relaxed">
                                      "{def.exampleEn}"
                                    </p>
                                    {def.exampleVi && (
                                      <p className="dark:text-slate-400 text-slate-500 text-[11px] leading-relaxed">
                                        {def.exampleVi}
                                      </p>
                                    )}
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  ))}
                </div>
              )}

              {/* TAB 2: CỤM TỪ */}
              {activeTab === 'cumtu' && (
                <div className="space-y-2">
                  <p className="text-[11px] dark:text-slate-400 text-slate-500 mb-2">Các cụm từ hay đi kèm từ này trong bài thi TOEIC:</p>
                  {dictData?.phrases?.length > 0 ? (
                    dictData.phrases.map((phrase, idx) => (
                      <div 
                        key={idx}
                        className="p-2.5 rounded-xl dark:bg-slate-800/40 bg-slate-50 border dark:border-slate-800 border-slate-200/90 flex items-center justify-between text-xs shadow-sm"
                      >
                        <span className="font-semibold dark:text-amber-300 text-amber-600">• {phrase}</span>
                        <button
                          onClick={() => handleAddDefinition({ definitionVi: phrase, definitionEn: phrase }, `phrase_${idx}`)}
                          className="px-2 py-0.5 rounded text-[11px] font-bold dark:bg-slate-800 bg-white dark:hover:bg-sky-500 hover:bg-sky-500 dark:hover:text-slate-950 hover:text-white dark:text-slate-300 text-slate-600 border dark:border-transparent border-slate-200 transition-colors cursor-pointer shadow-sm"
                        >
                          + Add
                        </button>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs dark:text-slate-400 text-slate-500 italic">Chưa có cụm từ ghi chú.</p>
                  )}
                </div>
              )}

              {/* TAB 3: VÍ DỤ */}
              {activeTab === 'vidu' && (
                <div className="space-y-3">
                  {dictData?.meanings?.flatMap(m => m.definitions || []).filter(d => d.exampleEn).map((item, idx) => (
                    <div key={idx} className="p-3 rounded-xl dark:bg-slate-800/40 bg-slate-50 border dark:border-slate-800 border-slate-200/90 space-y-1.5 text-xs shadow-sm">
                      <p className="dark:text-slate-200 text-slate-800 font-medium italic">"{item.exampleEn}"</p>
                      {item.exampleVi && <p className="dark:text-slate-400 text-slate-500">{item.exampleVi}</p>}
                    </div>
                  ))}
                </div>
              )}

              {/* TAB 4: ĐỒNG NGHĨA */}
              {activeTab === 'dongnghia' && (
                <div className="space-y-3">
                  <p className="text-[11px] dark:text-slate-400 text-slate-500">Các từ đồng nghĩa:</p>
                  <div className="flex flex-wrap gap-2">
                    {dictData?.synonyms?.length > 0 ? (
                      dictData.synonyms.map((syn, idx) => (
                        <span
                          key={idx}
                          className="px-3 py-1 rounded-full dark:bg-slate-800 bg-slate-100 border dark:border-slate-700 border-slate-200 text-xs dark:text-slate-300 text-slate-700 font-medium"
                        >
                          {syn}
                        </span>
                      ))
                    ) : (
                      <p className="text-xs dark:text-slate-400 text-slate-500 italic">Không tìm thấy từ đồng nghĩa trực tiếp.</p>
                    )}
                  </div>
                </div>
              )}

              {/* TAB 5: HỌ TỪ */}
              {activeTab === 'hotu' && (
                <div className="space-y-2">
                  <p className="text-[11px] dark:text-slate-400 text-slate-500 mb-2">Các dạng biến thể ngữ pháp (Word Family):</p>
                  <div className="space-y-1.5 text-xs">
                    {dictData?.wordFamily?.map((wf, idx) => (
                      <div 
                        key={idx} 
                        className="py-1.5 px-3 rounded-lg dark:bg-slate-800/30 bg-slate-50 border dark:border-slate-800/80 border-slate-200 flex items-center justify-between dark:text-slate-300 text-slate-700"
                      >
                        <span className="font-mono font-medium">{wf}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* ========================================================================= */}
        {/* FOOTER: TARGET DECK / HỌC PHẦN SELECTOR (CHUẨN ĐẬU TOEIC SCREENSHOT 1) */}
        {/* ========================================================================= */}
        <div className="px-3.5 py-2.5 dark:bg-slate-950/95 bg-slate-50/95 border-t dark:border-slate-800 border-slate-200 flex items-center justify-between gap-2 text-xs shrink-0">
          <div className="flex items-center gap-1.5 flex-1 min-w-0">
            <span className="text-[11px] font-bold dark:text-slate-400 text-slate-500 shrink-0">
              Thêm vào:
            </span>
            <div className="relative flex-1 min-w-0">
              <select
                value={targetDeckName}
                onChange={(e) => {
                  if (e.target.value === '__new__') {
                    const newName = window.prompt('Nhập tên học phần mới (ví dụ: Part 5 Test 1 2023):');
                    if (newName && newName.trim()) {
                      const cleanNew = newName.trim();
                      setTargetDeckName(cleanNew);
                      setExistingDecks(prev => Array.from(new Set([cleanNew, ...prev])));
                    }
                  } else {
                    setTargetDeckName(e.target.value);
                  }
                }}
                className="w-full text-xs font-bold py-1 px-2.5 rounded-xl border dark:bg-slate-900 bg-white dark:border-slate-700 border-slate-300 dark:text-emerald-400 text-emerald-600 focus:outline-none focus:ring-1 focus:ring-emerald-500 cursor-pointer truncate"
              >
                {targetDeckName && !existingDecks.includes(targetDeckName) && (
                  <option value={targetDeckName}>📖 {targetDeckName} (Hiện tại)</option>
                )}
                {existingDecks.map(deck => (
                  <option key={deck} value={deck}>📖 {deck}</option>
                ))}
                {!existingDecks.includes('Giỏ từ vựng cá nhân') && targetDeckName !== 'Giỏ từ vựng cá nhân' && (
                  <option value="Giỏ từ vựng cá nhân">📖 Giỏ từ vựng cá nhân</option>
                )}
                <option value="__new__">➕ + Tạo học phần mới...</option>
              </select>
            </div>
          </div>

          <span className="text-[10px] dark:text-slate-500 text-slate-400 font-mono shrink-0 hidden sm:inline">
            ESC đóng
          </span>
        </div>

      </div>
    </div>
  );
}
