import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Languages, 
  ArrowLeftRight, 
  Mic, 
  MicOff, 
  Volume2, 
  Copy, 
  Check, 
  Star, 
  Trash2, 
  X, 
  Sparkles, 
  BookOpen, 
  Clock, 
  FileText, 
  CornerDownLeft, 
  VolumeX, 
  Share2, 
  Search,
  ExternalLink,
  ChevronDown,
  Info,
  CheckCircle2
} from 'lucide-react';
import axios from 'axios';
import Navbar from '../components/Navbar';
import { addWordToBasket } from '../services/vocabBasketService';

export default function TraTuPage() {
  // Languages state: source 'vi' | 'en' | 'auto', target 'en' | 'vi'
  const [sourceLang, setSourceLang] = useState('vi');
  const [targetLang, setTargetLang] = useState('en');
  const [detectedLang, setDetectedLang] = useState('vi');

  // Text state
  const [inputText, setInputText] = useState('');
  const [outputText, setOutputText] = useState('');
  const [isTranslating, setIsTranslating] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Audio / Mic state
  const [isListening, setIsListening] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(true);
  const [micErrorMsg, setMicErrorMsg] = useState('');
  const [isSpeakingSource, setIsSpeakingSource] = useState(false);
  const [isSpeakingTarget, setIsSpeakingTarget] = useState(false);

  // Copy state
  const [copied, setCopied] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  // Deep vocabulary data (if single word or short phrase)
  const [deepVocab, setDeepVocab] = useState(null);
  const [loadingVocab, setLoadingVocab] = useState(false);

  // History & Saved list (stored in localStorage)
  const [activeBottomTab, setActiveBottomTab] = useState('history'); // 'history' | 'saved'
  const [historyList, setHistoryList] = useState(() => {
    try {
      const saved = localStorage.getItem('ttt_translate_history');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [savedList, setSavedList] = useState(() => {
    try {
      const saved = localStorage.getItem('ttt_translate_saved');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const recognitionRef = useRef(null);
  const debounceTimerRef = useRef(null);
  const silenceTimerRef = useRef(null);
  const textareaRef = useRef(null);

  // Check Web Speech API support
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setSpeechSupported(false);
    }
  }, []);

  // Cleanup microphone on tab blur, visibility change, or page unmount
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && recognitionRef.current) {
        try { recognitionRef.current.stop(); } catch (e) {}
        setIsListening(false);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('beforeunload', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('beforeunload', handleVisibilityChange);
      if (recognitionRef.current) {
        try { recognitionRef.current.stop(); } catch (e) {}
      }
      if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
    };
  }, []);

  // Sync history to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('ttt_translate_history', JSON.stringify(historyList.slice(0, 30)));
    } catch (e) {}
  }, [historyList]);

  // Sync saved list to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('ttt_translate_saved', JSON.stringify(savedList));
    } catch (e) {}
  }, [savedList]);

  // Check if current translation is saved
  useEffect(() => {
    if (!inputText || !outputText) {
      setIsSaved(false);
      return;
    }
    const found = savedList.some(
      item => item.input.toLowerCase().trim() === inputText.toLowerCase().trim()
    );
    setIsSaved(found);
  }, [inputText, outputText, savedList]);

  // Core translate function
  const executeTranslate = useCallback(async (textToTranslate, sLang, tLang) => {
    const query = (textToTranslate || '').trim();
    if (!query) {
      setOutputText('');
      setDeepVocab(null);
      setIsTranslating(false);
      return;
    }

    setIsTranslating(true);
    setErrorMsg('');

    try {
      const res = await axios.post('/api/v1/dictionary/translate', {
        text: query,
        sourceLang: sLang,
        targetLang: tLang
      });

      if (res.data?.success) {
        const transResult = res.data.translatedText || '';
        setOutputText(transResult);
        if (res.data.detectedLang) {
          setDetectedLang(res.data.detectedLang);
        }

        // Save to history (if distinct)
        setHistoryList(prev => {
          const filtered = prev.filter(item => item.input.toLowerCase().trim() !== query.toLowerCase());
          return [
            {
              id: Date.now(),
              input: query,
              output: transResult,
              sourceLang: sLang,
              targetLang: tLang,
              timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
            },
            ...filtered
          ].slice(0, 30);
        });

        // If it's a short English or Vietnamese word (1-2 tokens), fetch deep dictionary context
        const tokens = query.split(/\s+/).filter(Boolean);
        if (tokens.length <= 2) {
          fetchDeepVocab(sLang === 'vi' ? transResult : query);
        } else {
          setDeepVocab(null);
        }
      }
    } catch (err) {
      console.warn('Translate error:', err);
      setErrorMsg('Không thể kết nối máy chủ dịch thuật. Vui lòng thử lại.');
    } finally {
      setIsTranslating(false);
    }
  }, []);

  // Fetch deep vocabulary (IPA, pos, examples) from TOEIC dictionary
  const fetchDeepVocab = async (englishWord) => {
    if (!englishWord) return;
    const cleanWord = englishWord.replace(/[^a-zA-Z\s-]/g, '').trim();
    if (!cleanWord || cleanWord.split(/\s+/).length > 2) return;

    setLoadingVocab(true);
    try {
      const res = await axios.get(`/api/v1/dictionary/lookup?word=${encodeURIComponent(cleanWord)}`);
      if (res.data?.success && res.data?.data) {
        setDeepVocab(res.data.data);
      } else {
        setDeepVocab(null);
      }
    } catch (e) {
      setDeepVocab(null);
    } finally {
      setLoadingVocab(false);
    }
  };

  // Debounced input change
  const handleInputChange = (e) => {
    const val = e.target.value;
    setInputText(val);

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    if (!val.trim()) {
      setOutputText('');
      setDeepVocab(null);
      return;
    }

    debounceTimerRef.current = setTimeout(() => {
      executeTranslate(val, sourceLang, targetLang);
    }, 400);
  };

  // Swap language function
  const handleSwapLanguages = () => {
    const newSource = targetLang;
    const newTarget = sourceLang === 'auto' ? (detectedLang === 'vi' ? 'en' : 'vi') : sourceLang;
    
    setSourceLang(newSource);
    setTargetLang(newTarget);

    // Swap text values
    if (outputText) {
      const oldOutput = outputText;
      setInputText(oldOutput);
      setOutputText(inputText);
      executeTranslate(oldOutput, newSource, newTarget);
    }
  };

  // Switch source language
  const handleSelectSource = (lang) => {
    if (sourceLang === lang) return;
    setSourceLang(lang);
    if (lang === targetLang) {
      setTargetLang(lang === 'vi' ? 'en' : 'vi');
    }
    if (inputText.trim()) {
      executeTranslate(inputText, lang, lang === targetLang ? (lang === 'vi' ? 'en' : 'vi') : targetLang);
    }
  };

  // Switch target language
  const handleSelectTarget = (lang) => {
    if (targetLang === lang) return;
    setTargetLang(lang);
    if (lang === sourceLang) {
      setSourceLang(lang === 'vi' ? 'en' : 'vi');
    }
    if (inputText.trim()) {
      executeTranslate(inputText, lang === sourceLang ? (lang === 'vi' ? 'en' : 'vi') : sourceLang, lang);
    }
  };

  // Speech-to-Text Microphone Handler (Upgraded with Multi-Tab Protection & Buffer)
  const toggleListening = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setMicErrorMsg('Trình duyệt của bạn chưa hỗ trợ nhận diện giọng nói Web Speech API. Vui lòng dùng Google Chrome hoặc Microsoft Edge!');
      return;
    }

    setMicErrorMsg('');

    if (isListening) {
      if (recognitionRef.current) {
        try { recognitionRef.current.stop(); } catch (e) {}
      }
      setIsListening(false);
      if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
      return;
    }

    try {
      // Abort any old hanging instance
      if (recognitionRef.current) {
        try { recognitionRef.current.abort(); } catch (e) {}
      }

      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.maxAlternatives = 1;
      
      const langToUse = sourceLang === 'vi' ? 'vi-VN' : (sourceLang === 'en' ? 'en-US' : (detectedLang === 'vi' ? 'vi-VN' : 'en-US'));
      recognition.lang = langToUse;

      recognition.onstart = () => {
        setIsListening(true);
        setMicErrorMsg('');
      };

      recognition.onresult = (event) => {
        let fullTranscript = '';
        for (let i = 0; i < event.results.length; ++i) {
          fullTranscript += event.results[i][0].transcript;
        }

        if (fullTranscript) {
          setInputText(fullTranscript);

          // Reset silence timer on every new speech piece (auto-stop after 2.2s silence)
          if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
          silenceTimerRef.current = setTimeout(() => {
            if (recognitionRef.current) {
              try { recognitionRef.current.stop(); } catch (e) {}
            }
          }, 2200);
        }
      };

      recognition.onerror = (event) => {
        console.warn('Speech recognition error:', event.error);
        if (event.error === 'not-allowed') {
          setMicErrorMsg('⚠️ Quyền Microphone bị chặn. Vui lòng bấm vào biểu tượng ổ khóa 🔒 trên thanh địa chỉ để Cho phép (Allow) Microphone!');
        } else if (event.error === 'audio-capture') {
          setMicErrorMsg('⚠️ Không thể bắt tín hiệu Microphone: Thiết bị đang bị một Tab trình duyệt khác hoặc ứng dụng khác chiếm dụng. Vui lòng đóng/tắt mic ở tab kia!');
        } else if (event.error === 'no-speech') {
          setMicErrorMsg('Chưa nghe thấy giọng nói. Vui lòng thử nói to hơn hoặc ghé sát micro!');
        } else if (event.error !== 'aborted') {
          setMicErrorMsg(`Lỗi nhận diện âm thanh: ${event.error}`);
        }
        setIsListening(false);
        if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
      };

      recognition.onend = () => {
        setIsListening(false);
        if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
        // Translate immediately after speech stops
        if (textareaRef.current && textareaRef.current.value.trim()) {
          executeTranslate(textareaRef.current.value.trim(), sourceLang, targetLang);
        }
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err) {
      console.error('Cannot start SpeechRecognition:', err);
      setMicErrorMsg('Không thể khởi động Microphone: ' + err.message);
      setIsListening(false);
    }
  };

  // Text-to-Speech (TTS) Reader
  const speakText = (text, lang, isSource = false) => {
    if (!text || !window.speechSynthesis) return;

    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang === 'vi' ? 'vi-VN' : 'en-US';
    utterance.rate = 0.95;

    if (isSource) setIsSpeakingSource(true);
    else setIsSpeakingTarget(true);

    utterance.onend = () => {
      if (isSource) setIsSpeakingSource(false);
      else setIsSpeakingTarget(false);
    };

    utterance.onerror = () => {
      if (isSource) setIsSpeakingSource(false);
      else setIsSpeakingTarget(false);
    };

    window.speechSynthesis.speak(utterance);
  };

  // Copy to clipboard
  const handleCopy = () => {
    if (!outputText) return;
    navigator.clipboard.writeText(outputText).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  // Toggle Save to Vocab Notebook
  const handleToggleSave = () => {
    if (!inputText || !outputText) return;

    if (isSaved) {
      setSavedList(prev => prev.filter(item => item.input.toLowerCase().trim() !== inputText.toLowerCase().trim()));
      setIsSaved(false);
    } else {
      const newItem = {
        id: Date.now(),
        input: inputText.trim(),
        output: outputText.trim(),
        sourceLang,
        targetLang,
        date: new Date().toLocaleDateString('vi-VN')
      };
      setSavedList(prev => [newItem, ...prev]);
      setIsSaved(true);

      // Also attempt to add to vocab basket if it's single English word
      if (targetLang === 'en' && outputText.split(/\s+/).length <= 3) {
        addWordToBasket(outputText.trim(), inputText.trim(), 'Tra Từ Song Ngữ');
      } else if (sourceLang === 'en' && inputText.split(/\s+/).length <= 3) {
        addWordToBasket(inputText.trim(), outputText.trim(), 'Tra Từ Song Ngữ');
      }
    }
  };

  // Clear input
  const handleClear = () => {
    setInputText('');
    setOutputText('');
    setDeepVocab(null);
    if (textareaRef.current) textareaRef.current.focus();
  };

  // Load item from history/saved
  const handleLoadItem = (item) => {
    setInputText(item.input);
    setSourceLang(item.sourceLang || 'auto');
    setTargetLang(item.targetLang || 'en');
    executeTranslate(item.input, item.sourceLang || 'auto', item.targetLang || 'en');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-[#070d19] text-slate-100 flex flex-col font-sans selection:bg-cyan-500/30">
      <Navbar />

      <main className="flex-1 max-w-[1500px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col gap-6">
        
        {/* Top Header & Sub-navigation */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-cyan-500 via-teal-500 to-blue-600 p-0.5 shadow-lg shadow-cyan-500/20 flex items-center justify-center">
              <div className="w-full h-full bg-[#0b1120] rounded-[14px] flex items-center justify-center">
                <Languages className="w-6 h-6 text-cyan-400" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black font-heading tracking-tight text-white">
                  Tra Từ <span className="bg-gradient-to-r from-cyan-400 to-teal-400 bg-clip-text text-transparent">& Dịch Thuật</span>
                </h1>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
                  Chuẩn TOEIC
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Dịch 2 chiều Anh ⇄ Việt • Nhận diện giọng nói Micro 🎙️ • Đọc to tiếng bản xứ 🔊 • 0đ chi phí
              </p>
            </div>
          </div>

          {/* Mode Pill Badges */}
          <div className="flex items-center gap-1.5 p-1 bg-slate-900/90 border border-slate-800 rounded-xl text-xs font-semibold">
            <button className="px-3 py-1.5 rounded-lg bg-cyan-500 text-white font-bold flex items-center gap-1.5 shadow-md shadow-cyan-500/25">
              <FileText className="w-3.5 h-3.5" />
              <span>Văn bản</span>
            </button>
            <button 
              onClick={() => {
                const sample = sourceLang === 'vi' ? 'Hôm nay tôi ôn thi TOEIC' : 'I am preparing for the TOEIC test';
                setInputText(sample);
                executeTranslate(sample, sourceLang, targetLang);
              }}
              className="px-3 py-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/70 transition-colors flex items-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Mẫu câu TOEIC</span>
            </button>
            <button 
              onClick={toggleListening}
              className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                isListening 
                  ? 'bg-rose-500 text-white animate-pulse font-bold' 
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/70'
              }`}
            >
              <Mic className="w-3.5 h-3.5 text-rose-400" />
              <span>{isListening ? 'Đang thu âm...' : 'Nói qua mic'}</span>
            </button>
          </div>
        </div>

        {/* Translation Workstation Container (Google Translate Layout) */}
        <div className="bg-[#0b1324] border border-slate-800/90 rounded-3xl shadow-2xl overflow-hidden flex flex-col">
          
          {/* Language Selection Bar */}
          <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-slate-800/80 border-b border-slate-800/80 bg-[#090f1e]/80">
            
            {/* Left Source Tabs */}
            <div className="px-4 py-2.5 flex items-center justify-between gap-2 overflow-x-auto">
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => handleSelectSource('auto')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    sourceLang === 'auto'
                      ? 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/30'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                  }`}
                >
                  Phát hiện ngôn ngữ {sourceLang === 'auto' && detectedLang ? `(${detectedLang.toUpperCase()})` : ''}
                </button>
                <button
                  onClick={() => handleSelectSource('vi')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    sourceLang === 'vi'
                      ? 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/30'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                  }`}
                >
                  Tiếng Việt
                </button>
                <button
                  onClick={() => handleSelectSource('en')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    sourceLang === 'en'
                      ? 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/30'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                  }`}
                >
                  Tiếng Anh
                </button>
              </div>

              {/* Swap Button (Desktop & Mobile) */}
              <button
                onClick={handleSwapLanguages}
                title="Tráo đổi 2 chiều ngôn ngữ (Anh ⇄ Việt)"
                className="p-2 rounded-xl bg-slate-800/70 hover:bg-cyan-500/20 hover:text-cyan-400 text-slate-300 transition-all border border-slate-700/50 group active:scale-95 shrink-0"
              >
                <ArrowLeftRight className="w-4 h-4 group-hover:rotate-180 transition-transform duration-300" />
              </button>
            </div>

            {/* Right Target Tabs */}
            <div className="px-4 py-2.5 flex items-center justify-between gap-2 overflow-x-auto">
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => handleSelectTarget('en')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    targetLang === 'en'
                      ? 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/30'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                  }`}
                >
                  Tiếng Anh
                </button>
                <button
                  onClick={() => handleSelectTarget('vi')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    targetLang === 'vi'
                      ? 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/30'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                  }`}
                >
                  Tiếng Việt
                </button>
              </div>

              <span className="text-[11px] text-slate-500 font-medium hidden sm:inline">
                Chế độ dịch tức thì (Instant)
              </span>
            </div>
          </div>

          {/* Main Translation 2-Column Boxes */}
          <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-slate-800/80 min-h-[380px]">
            
            {/* LEFT BOX: Source Input */}
            <div className="p-5 flex flex-col justify-between relative group bg-[#0b1324]">
              <div className="flex-1 flex flex-col relative">
                {/* Clear button */}
                {inputText && (
                  <button
                    onClick={handleClear}
                    title="Xóa nội dung"
                    className="absolute top-0 right-0 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/60 transition-colors z-10"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}

                <textarea
                  ref={textareaRef}
                  value={inputText}
                  onChange={handleInputChange}
                  rows={8}
                  placeholder={
                    sourceLang === 'vi'
                      ? 'Nhập từ vựng, câu tiếng Việt hoặc bấm biểu tượng Micro bên dưới để nói...'
                      : 'Enter English vocabulary, phrases, or full sentences (or click microphone to speak)...'
                  }
                  className="w-full flex-1 bg-transparent border-0 outline-none resize-none text-base sm:text-lg lg:text-xl font-normal text-white placeholder:text-slate-500/80 leading-relaxed pr-8"
                />

                {/* Speech recording pulse banner */}
                {isListening && (
                  <div className="my-2 p-3 rounded-2xl bg-rose-500/15 border border-rose-500/30 flex items-center gap-3 animate-fadeIn">
                    <span className="relative flex h-3 w-3">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-rose-500"></span>
                    </span>
                    <span className="text-xs text-rose-300 font-semibold flex-1">
                      Đang lắng nghe qua Microphone... Hãy nói câu {sourceLang === 'vi' ? 'Tiếng Việt' : 'Tiếng Anh'} của bạn!
                    </span>
                    <button
                      onClick={toggleListening}
                      className="px-2.5 py-1 rounded-lg bg-rose-500 text-white text-xs font-bold hover:bg-rose-600 transition-colors"
                    >
                      Dừng
                    </button>
                  </div>
                )}

                {/* Microphone Error Alert Banner */}
                {micErrorMsg && (
                  <div className="my-2 p-3 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs flex items-center justify-between gap-2 animate-fadeIn">
                    <div className="flex items-center gap-2">
                      <Info className="w-4 h-4 shrink-0 text-amber-400" />
                      <span>{micErrorMsg}</span>
                    </div>
                    <button
                      onClick={() => setMicErrorMsg('')}
                      className="p-1 rounded-md hover:bg-amber-500/20 text-amber-400 transition-colors shrink-0"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>

              {/* Bottom Toolbar: Mic, Speaker, Char count */}
              <div className="pt-4 border-t border-slate-800/60 flex items-center justify-between gap-3 text-slate-400">
                <div className="flex items-center gap-1.5">
                  {/* Microphone STT */}
                  <button
                    onClick={toggleListening}
                    title={isListening ? 'Dừng thu âm' : 'Nhập văn bản bằng giọng nói'}
                    className={`p-2.5 rounded-xl transition-all ${
                      isListening
                        ? 'bg-rose-500 text-white ring-4 ring-rose-500/30 shadow-lg shadow-rose-500/40 animate-pulse'
                        : 'hover:bg-slate-800/80 hover:text-cyan-400 text-slate-300'
                    }`}
                  >
                    {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                  </button>

                  {/* Speaker TTS */}
                  {inputText && (
                    <button
                      onClick={() => speakText(inputText, sourceLang === 'auto' ? detectedLang : sourceLang, true)}
                      title="Phát âm câu gốc"
                      className={`p-2.5 rounded-xl transition-all ${
                        isSpeakingSource
                          ? 'bg-cyan-500 text-white shadow-lg shadow-cyan-500/30'
                          : 'hover:bg-slate-800/80 hover:text-cyan-400 text-slate-300'
                      }`}
                    >
                      <Volume2 className="w-5 h-5" />
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-xs text-slate-500 font-mono">
                    {inputText.length} / 5.000
                  </span>
                  {inputText && (
                    <button
                      onClick={() => executeTranslate(inputText, sourceLang, targetLang)}
                      disabled={isTranslating}
                      className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-400 hover:to-teal-400 text-white text-xs font-bold shadow-md shadow-cyan-500/20 active:scale-95 transition-all flex items-center gap-1.5"
                    >
                      {isTranslating ? (
                        <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <CornerDownLeft className="w-3.5 h-3.5" />
                      )}
                      <span>Dịch</span>
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* RIGHT BOX: Target Output */}
            <div className="p-5 flex flex-col justify-between bg-[#0e1628]/60 relative">
              <div className="flex-1 flex flex-col">
                
                {/* Result header & Star Save button */}
                <div className="flex items-center justify-between pb-2 mb-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-cyan-400/80">
                    Bản dịch {targetLang === 'en' ? 'Tiếng Anh (English)' : 'Tiếng Việt'}
                  </span>

                  {outputText && (
                    <button
                      onClick={handleToggleSave}
                      title={isSaved ? 'Đã lưu vào danh sách yêu thích' : 'Lưu vào sổ tay từ vựng cá nhân'}
                      className={`p-2 rounded-xl transition-all ${
                        isSaved
                          ? 'text-amber-400 bg-amber-400/10 border border-amber-400/30'
                          : 'text-slate-400 hover:text-amber-400 hover:bg-slate-800/50'
                      }`}
                    >
                      <Star className={`w-4 h-4 ${isSaved ? 'fill-amber-400' : ''}`} />
                    </button>
                  )}
                </div>

                {/* Translation display text */}
                <div className="flex-1">
                  {isTranslating ? (
                    <div className="flex items-center gap-3 text-slate-400 py-6 animate-pulse">
                      <div className="w-5 h-5 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
                      <span className="text-sm font-medium">Đang chuyển ngữ siêu tốc...</span>
                    </div>
                  ) : outputText ? (
                    <div className="text-base sm:text-lg lg:text-xl font-bold text-cyan-300 leading-relaxed whitespace-pre-wrap select-text">
                      {outputText}
                    </div>
                  ) : (
                    <div className="text-base sm:text-lg text-slate-600 font-medium italic select-none">
                      Bản dịch ngữ nghĩa sẽ xuất hiện tại đây...
                    </div>
                  )}

                  {errorMsg && (
                    <div className="mt-3 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-2">
                      <Info className="w-4 h-4 shrink-0" />
                      <span>{errorMsg}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Bottom Toolbar: Speaker, Copy */}
              <div className="pt-4 border-t border-slate-800/60 flex items-center justify-between gap-3 text-slate-400">
                <div className="flex items-center gap-1.5">
                  {outputText && (
                    <>
                      {/* Speaker TTS */}
                      <button
                        onClick={() => speakText(outputText, targetLang, false)}
                        title="Đọc to câu dịch"
                        className={`p-2.5 rounded-xl transition-all ${
                          isSpeakingTarget
                            ? 'bg-cyan-500 text-white shadow-lg shadow-cyan-500/30'
                            : 'hover:bg-slate-800/80 hover:text-cyan-400 text-slate-300'
                        }`}
                      >
                        <Volume2 className="w-5 h-5" />
                      </button>

                      {/* Copy to clipboard */}
                      <button
                        onClick={handleCopy}
                        title="Sao chép bản dịch"
                        className="p-2.5 rounded-xl hover:bg-slate-800/80 hover:text-cyan-400 text-slate-300 transition-all flex items-center gap-1.5 text-xs font-semibold"
                      >
                        {copied ? (
                          <>
                            <Check className="w-4 h-4 text-emerald-400" />
                            <span className="text-emerald-400 text-[11px]">Đã chép</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-4 h-4" />
                            <span className="text-[11px]">Sao chép</span>
                          </>
                        )}
                      </button>
                    </>
                  )}
                </div>

                {outputText && (
                  <span className="text-[11px] text-slate-500 font-medium">
                    Hệ thống AI Dịch thuật Tường Tận TOEIC
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Deep Business Vocabulary Analysis Card (When single word is detected) */}
        {deepVocab && (
          <div className="p-6 rounded-3xl bg-[#0c1427] border border-cyan-500/30 shadow-2xl animate-fadeIn">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/40 flex items-center justify-center font-bold">
                  <BookOpen className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-xl font-black text-white">{deepVocab.word}</h2>
                    {deepVocab.phonetic && (
                      <span className="text-sm font-mono text-cyan-400">{deepVocab.phonetic}</span>
                    )}
                    <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                      Từ Vựng TOEIC
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">{deepVocab.translation}</p>
                </div>
              </div>

              {/* Audio US/UK pills */}
              <div className="flex items-center gap-2">
                {deepVocab.audioUs && (
                  <button
                    onClick={() => {
                      const audio = new Audio(deepVocab.audioUs);
                      audio.play();
                    }}
                    className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-cyan-500/20 text-slate-300 hover:text-cyan-400 border border-slate-700/60 text-xs font-bold transition-all flex items-center gap-1.5"
                  >
                    <Volume2 className="w-3.5 h-3.5 text-cyan-400" />
                    <span>US 🔊</span>
                  </button>
                )}
                {deepVocab.audioUk && (
                  <button
                    onClick={() => {
                      const audio = new Audio(deepVocab.audioUk);
                      audio.play();
                    }}
                    className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-cyan-500/20 text-slate-300 hover:text-cyan-400 border border-slate-700/60 text-xs font-bold transition-all flex items-center gap-1.5"
                  >
                    <Volume2 className="w-3.5 h-3.5 text-teal-400" />
                    <span>UK 🔊</span>
                  </button>
                )}
                <button
                  onClick={() => addWordToBasket(deepVocab.word, deepVocab.translation, 'Tra Từ')}
                  className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-cyan-500 to-teal-500 text-white text-xs font-bold shadow-md shadow-cyan-500/20 hover:scale-105 active:scale-95 transition-all flex items-center gap-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>+ Giỏ từ vựng</span>
                </button>
              </div>
            </div>

            {/* Meanings & Examples list */}
            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              {deepVocab.meanings?.slice(0, 2).map((m, mIdx) => (
                <div key={mIdx} className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800">
                  <span className="text-[11px] font-extrabold uppercase px-2 py-0.5 rounded-md bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                    {m.partOfSpeech}
                  </span>
                  <div className="mt-2.5 space-y-2">
                    {m.definitions?.slice(0, 2).map((d, dIdx) => (
                      <div key={dIdx} className="text-xs">
                        <p className="text-slate-200 font-semibold">{d.definitionVi || d.definitionEn}</p>
                        {d.exampleEn && (
                          <p className="text-slate-400 italic mt-0.5">"{d.exampleEn}"</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Bottom Section: History & Saved Items */}
        <div className="bg-[#0b1324] border border-slate-800/80 rounded-3xl p-5 shadow-xl">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setActiveBottomTab('history')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                  activeBottomTab === 'history'
                    ? 'bg-cyan-500 text-white shadow-md shadow-cyan-500/20'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <Clock className="w-3.5 h-3.5" />
                <span>Lịch sử gần đây ({historyList.length})</span>
              </button>
              <button
                onClick={() => setActiveBottomTab('saved')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                  activeBottomTab === 'saved'
                    ? 'bg-amber-500 text-white shadow-md shadow-amber-500/20'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <Star className="w-3.5 h-3.5" />
                <span>Từ & Câu đã lưu ({savedList.length})</span>
              </button>
            </div>

            {activeBottomTab === 'history' && historyList.length > 0 && (
              <button
                onClick={() => setHistoryList([])}
                className="text-xs text-rose-400 hover:text-rose-300 transition-colors flex items-center gap-1"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Xóa lịch sử</span>
              </button>
            )}
          </div>

          {/* List display */}
          {activeBottomTab === 'history' ? (
            historyList.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {historyList.slice(0, 12).map((item) => (
                  <div
                    key={item.id}
                    onClick={() => handleLoadItem(item)}
                    className="p-3.5 rounded-2xl bg-slate-900/60 hover:bg-slate-800/80 border border-slate-800/80 hover:border-cyan-500/40 cursor-pointer transition-all group flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between text-[10px] text-slate-500 font-medium mb-1">
                        <span className="uppercase font-bold text-cyan-400/80">
                          {item.sourceLang} ➔ {item.targetLang}
                        </span>
                        <span>{item.timestamp}</span>
                      </div>
                      <p className="text-sm font-semibold text-white line-clamp-2">{item.input}</p>
                      <p className="text-xs text-cyan-400/90 line-clamp-2 mt-1">{item.output}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-8 text-center text-slate-500 text-xs">
                Chưa có lịch sử tra cứu nào. Hãy nhập văn bản hoặc nói qua micro để dịch!
              </div>
            )
          ) : (
            savedList.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {savedList.map((item) => (
                  <div
                    key={item.id}
                    className="p-3.5 rounded-2xl bg-slate-900/60 border border-amber-500/30 flex flex-col justify-between"
                  >
                    <div onClick={() => handleLoadItem(item)} className="cursor-pointer">
                      <div className="flex items-center justify-between text-[10px] text-slate-500 font-medium mb-1">
                        <span className="uppercase font-bold text-amber-400">
                          {item.sourceLang} ➔ {item.targetLang}
                        </span>
                        <span>{item.date}</span>
                      </div>
                      <p className="text-sm font-semibold text-white line-clamp-2">{item.input}</p>
                      <p className="text-xs text-amber-300 line-clamp-2 mt-1">{item.output}</p>
                    </div>
                    <div className="mt-2.5 pt-2 border-t border-slate-800 flex items-center justify-between">
                      <button
                        onClick={() => speakText(item.output, item.targetLang)}
                        className="text-slate-400 hover:text-cyan-400 transition-colors"
                      >
                        <Volume2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setSavedList(prev => prev.filter(s => s.id !== item.id))}
                        className="text-slate-500 hover:text-rose-400 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-8 text-center text-slate-500 text-xs">
                Chưa có từ hoặc câu nào được lưu. Bấm biểu tượng ngôi sao ⭐ để ghim lại!
              </div>
            )
          )}
        </div>
      </main>
    </div>
  );
}

