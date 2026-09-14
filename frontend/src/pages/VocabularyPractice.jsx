import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { 
  BookOpen, 
  Gamepad2, 
  Sparkles, 
  Volume2, 
  RotateCcw, 
  CheckCircle2, 
  ArrowLeft, 
  ArrowRight, 
  Flame, 
  Award, 
  HelpCircle, 
  Trophy, 
  ChevronRight,
  Send,
  Zap,
  Timer,
  RefreshCw,
  Clock,
  Eye,
  Sidebar as SidebarIcon,
  Star,
  Check,
  Search,
  Crosshair,
  VolumeX,
  Maximize2,
  Minimize2,
  Mic,
  Edit3,
  Layers,
  ChevronLeft,
  ChevronDown,
  Filter,
  Lightbulb,
  Shuffle,
  Settings,
  Music,
  CheckCheck,
  AlertTriangle,
  ShoppingBag,
  X
} from 'lucide-react';
import axios from 'axios';
import { getStoredUser } from '../utils/auth';
import { getBasketWords, getBasketWordsByDeck } from '../services/vocabBasketService';

// Web Audio API Synthesizer for Retro Sci-Fi Game Sounds
const playSound = (type) => {
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();

    if (type === 'laser') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(950, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(120, ctx.currentTime + 0.18);
      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.01, ctx.currentTime + 0.18);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.18);
    } else if (type === 'blast') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(320, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(30, ctx.currentTime + 0.28);
      gain.gain.setValueAtTime(0.35, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.01, ctx.currentTime + 0.28);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.28);
    } else if (type === 'correct') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(523.25, ctx.currentTime);
      osc.frequency.setValueAtTime(659.25, ctx.currentTime + 0.08);
      osc.frequency.setValueAtTime(783.99, ctx.currentTime + 0.16);
      gain.gain.setValueAtTime(0.18, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.01, ctx.currentTime + 0.25);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.25);
    } else if (type === 'wrong') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(150, ctx.currentTime);
      osc.frequency.setValueAtTime(90, ctx.currentTime + 0.15);
      gain.gain.setValueAtTime(0.25, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.01, ctx.currentTime + 0.25);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.25);
    }
  } catch (e) {}
};

// Helper to format intervals cleanly (1m, 6h, 1d, 3d, 1mo...)
const formatSrsInterval = (minutes) => {
  if (!minutes || minutes <= 1) return '1m';
  if (minutes < 60) return `${minutes}m`;
  if (minutes < 1440) return `${Math.round(minutes / 60)}h`;
  const days = Math.round(minutes / 1440);
  if (days < 30) return `${days}d`;
  const months = Math.round(days / 30);
  return `${months}mo`;
};

// Compute dynamic preview interval for rating buttons matching Anki / Đậu TOEIC SM-2
const getPreviewIntervalLabel = (rating, card) => {
  if (!card) return rating === 1 ? '1m' : rating === 2 ? '6h' : rating === 3 ? '1d' : '3d';
  const curInterval = card.intervalMinutes ?? null;
  const isInitial = curInterval === null || curInterval < 360;

  if (rating === 1) return '1m';
  if (rating === 2) {
    const mins = isInitial ? 360 : Math.round(curInterval * 2);
    return formatSrsInterval(mins);
  }
  if (rating === 3) {
    const mins = isInitial ? 1440 : Math.round(curInterval * 3);
    return formatSrsInterval(mins);
  }
  if (rating === 4) {
    const mins = isInitial ? 4320 : Math.round(curInterval * 4);
    return formatSrsInterval(mins);
  }
  return '1m';
};

export default function VocabularyPractice() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  
  const isReviewMode = id === 'review' || window.location.pathname.includes('/vocabulary/review');
  const querySource = searchParams.get('source');
  const queryDeckName = searchParams.get('name') || searchParams.get('deck');
  const isDeckMode = querySource === 'deck' || Boolean(queryDeckName);
  const isCartMode = (querySource === 'cart' || id === 'cart') && !isDeckMode;

  // Resolve initial tab from URL params (defaults straight to 'learn' if in review mode)
  const queryTab = searchParams.get('tab');
  const queryMode = searchParams.get('mode');
  const queryGame = searchParams.get('game');
  const queryStudy = searchParams.get('study');

  const activeTab = queryTab || (queryMode === 'match' ? 'play' : queryMode === 'flashcard' ? 'learn' : isReviewMode ? 'learn' : 'view');
  const studySubMode = queryStudy || (queryMode === 'quiz' ? 'quiz' : queryMode === 'typing' ? 'typing' : 'flashcard');
  const activeGame = queryGame || (queryMode === 'match' ? 'match' : 'blast');

  // Topic & Words Data State
  const [topic, setTopic] = useState(null);
  const [allWords, setAllWords] = useState([]);
  const [parts, setParts] = useState([]);
  const [activePartIndex, setActivePartIndex] = useState(0);
  const [isSidebarOpen, setIsSidebarOpen] = useState(() => typeof window !== 'undefined' ? window.innerWidth >= 768 : false);
  const [isLoading, setIsLoading] = useState(true);

  // Tab 1: [Xem từ] State
  const [viewIndex, setViewIndex] = useState(0);
  const [isViewCardFlipped, setIsViewCardFlipped] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showDetailList, setShowDetailList] = useState(true);
  const [showHint, setShowHint] = useState(true);
  const [autoPlayAudio, setAutoPlayAudio] = useState(true);
  const [filterMode, setFilterMode] = useState('all'); // 'all' | 'starred' | 'mastered'

  const currentUser = getStoredUser();
  const currentUserId = currentUser?._id || currentUser?.id || currentUser?.userId || currentUser?.email || 'guest';
  const storageKeyId = `${currentUserId}_${isCartMode ? 'cart' : isReviewMode ? 'review' : (id || 'default')}`;

  // Persistent Stars & Mastered state (Synced with LocalStorage)
  const [starredWords, setStarredWords] = useState(() => {
    try {
      const saved = localStorage.getItem(`tuongtan_starred_words_${storageKeyId}`);
      return saved ? new Set(JSON.parse(saved)) : new Set();
    } catch {
      return new Set();
    }
  });

  const [masteredWords, setMasteredWords] = useState(() => {
    try {
      const saved = localStorage.getItem(`tuongtan_mastered_words_${storageKeyId}`);
      return saved ? new Set(JSON.parse(saved)) : new Set();
    } catch {
      return new Set();
    }
  });

  // Save stars & mastered words to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(`tuongtan_starred_words_${storageKeyId}`, JSON.stringify([...starredWords]));
    } catch (e) {}
  }, [starredWords, storageKeyId]);

  useEffect(() => {
    try {
      localStorage.setItem(`tuongtan_mastered_words_${storageKeyId}`, JSON.stringify([...masteredWords]));
    } catch (e) {}
  }, [masteredWords, storageKeyId]);

  // Tab 2: [Học] Active Recall Cascade State (Flashcard -> Trắc nghiệm -> Gõ từ)
  const [sessionCards, setSessionCards] = useState([]);
  const [completedSet, setCompletedSet] = useState(() => {
    try {
      const saved = localStorage.getItem(`tuongtan_completed_words_${storageKeyId}`);
      return saved ? new Set(JSON.parse(saved).map(w => (w || '').trim().toLowerCase())) : new Set();
    } catch {
      return new Set();
    }
  });
  const [totalInitialCards, setTotalInitialCards] = useState(0);
  const [learnIndex, setLearnIndex] = useState(0);
  const [learnStep, setLearnStep] = useState(studySubMode || 'flashcard'); // 'flashcard' | 'quiz' | 'typing' | 'pronunciation'
  const [isLearnFlipped, setIsLearnFlipped] = useState(false);
  const [showRatingButtons, setShowRatingButtons] = useState(false);
  const [learnRatedCount, setLearnRatedCount] = useState(0);
  const [sessionXp, setSessionXp] = useState(0);
  const [isLearnCompleted, setIsLearnCompleted] = useState(false);
  const [countdown, setCountdown] = useState(null);

  // Tab 2: Pronunciation (Stage 4) State
  const [isListening, setIsListening] = useState(false);
  const [speechTranscript, setSpeechTranscript] = useState('');
  const [speechFeedback, setSpeechFeedback] = useState('idle'); // 'idle' | 'listening' | 'correct' | 'wrong'
  const recognitionRef = useRef(null);

  // Sync learnStep if study URL param changes
  useEffect(() => {
    if (queryStudy && ['flashcard', 'quiz', 'typing', 'pronunciation'].includes(queryStudy)) {
      setLearnStep(queryStudy);
    }
  }, [queryStudy]);

  // Auto redirect countdown effect when topic learning is completed
  useEffect(() => {
    let timer;
    if (isLearnCompleted && countdown !== null && countdown > 0) {
      timer = setTimeout(() => {
        setCountdown(c => c - 1);
      }, 1000);
    } else if (isLearnCompleted && countdown === 0) {
      navigate('/vocabulary');
    }
    return () => clearTimeout(timer);
  }, [isLearnCompleted, countdown, navigate]);
  
  // Tab 2: Quiz Mode State
  const [quizOptions, setQuizOptions] = useState([]);
  const [selectedQuizAnswer, setSelectedQuizAnswer] = useState(null);
  const [quizFeedback, setQuizFeedback] = useState('idle'); // 'idle' | 'correct' | 'wrong'

  // Tab 2: Typing Mode State
  const [typingInput, setTypingInput] = useState('');
  const [typingFeedback, setTypingFeedback] = useState('idle'); // 'idle' | 'correct' | 'wrong'
  const [showTypingHint, setShowTypingHint] = useState(false);
  const typingInputRef = useRef(null);

  // Tab 3: Game 1 - Word Blast State (Bắn Pháo Laser Không Lặp Từ)
  const [blastQueue, setBlastQueue] = useState([]);
  const [blastCurrentIndex, setBlastCurrentIndex] = useState(0);
  const [blastOptions, setBlastOptions] = useState([]);
  const [blastLives, setBlastLives] = useState(3);
  const [blastScore, setBlastScore] = useState(0);
  const [blastLevel, setBlastLevel] = useState(1);
  const [blastCombo, setBlastCombo] = useState(0);
  const [laserBeam, setLaserBeam] = useState(null);
  const [isBlastEnded, setIsBlastEnded] = useState(false);
  const [isBlastWon, setIsBlastWon] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Tab 3: Game 2 - Word Match State (Nối Cặp theo từng đợt 6 từ)
  const [matchBatchIndex, setMatchBatchIndex] = useState(0);
  const [matchCards, setMatchCards] = useState([]);
  const [selectedCards, setSelectedCards] = useState([]);
  const [matchedPairs, setMatchedPairs] = useState([]);
  const [matchScore, setMatchScore] = useState(0);
  const [isMatchPartCompleted, setIsMatchPartCompleted] = useState(false);

  // Current active words for the selected part
  const currentPartWords = React.useMemo(() => {
    if (parts && parts.length > 0 && parts[activePartIndex]) {
      return parts[activePartIndex].words || [];
    }
    return allWords || [];
  }, [parts, activePartIndex, allWords]);

  // Synchronize sessionCards and reset queue on part/mode change
  useEffect(() => {
    if (currentPartWords && currentPartWords.length > 0) {
      if (isReviewMode) {
        // In SRS Review Mode (/vocabulary/review): queue all due review words immediately!
        setTotalInitialCards(currentPartWords.length);
        setCompletedSet(new Set());
        setMasteredWords(new Set());
        setLearnRatedCount(0);
        setSessionCards([...currentPartWords]);
        setLearnIndex(0);
        setIsLearnCompleted(false);
        setCountdown(null);
        setLearnStep('flashcard');
        setIsLearnFlipped(false);
        setShowRatingButtons(false);
        setViewIndex(0);
        return;
      }

      // 1. Read locally cached completed words for this topic/part
      let localCompletedList = [];
      try {
        const saved = localStorage.getItem(`tuongtan_completed_words_${storageKeyId}`);
        if (saved) localCompletedList = JSON.parse(saved);
      } catch (e) {}
      const localCompletedSet = new Set(
        (Array.isArray(localCompletedList) ? localCompletedList : []).map(w => (w || '').trim().toLowerCase())
      );

      // 2. Identify all words already learned (from backend isLearned OR local completed cache)
      // Regardless of rating (Again / Hard / Good / Easy) or review interval: IT COUNTS AS LEARNED!
      const alreadyLearnedWords = currentPartWords.filter(w => {
        const k = (w.word || '').trim().toLowerCase();
        return Boolean(w.isLearned || localCompletedSet.has(k));
      });

      const initialCompletedSet = new Set(
        alreadyLearnedWords.map(w => (w.word || '').trim().toLowerCase())
      );

      // Keep localStorage cache in sync with learned words
      try {
        localStorage.setItem(`tuongtan_completed_words_${storageKeyId}`, JSON.stringify([...initialCompletedSet]));
      } catch (e) {}

      setTotalInitialCards(currentPartWords.length);
      setCompletedSet(initialCompletedSet);
      setLearnRatedCount(initialCompletedSet.size);

      // Also ensure masteredWords set includes all learned words for UI indicators
      setMasteredWords(prev => {
        const next = new Set(prev);
        alreadyLearnedWords.forEach(w => {
          if (w.word) next.add(w.word);
        });
        return next;
      });

      // 3. Queue words for Tab 2 [📖 Học]
      // Primary queue: words NOT yet learned
      const unlearnedWords = currentPartWords.filter(w => {
        const k = (w.word || '').trim().toLowerCase();
        return !w.isLearned && !initialCompletedSet.has(k);
      });

      if (unlearnedWords.length > 0) {
        // Start directly with the next unlearned word (e.g. Word 4, NOT Word 1!)
        setSessionCards([...unlearnedWords]);
        setLearnIndex(0);
        setIsLearnCompleted(false);
        setCountdown(null);
        setLearnStep('flashcard');
        setIsLearnFlipped(false);
        setShowRatingButtons(false);
      } else {
        // All words in this part have been studied!
        // Check if any words are due for Spaced Repetition review
        const dueWords = currentPartWords.filter(w => w.isDue);
        if (dueWords.length > 0) {
          setSessionCards([...dueWords]);
          setLearnIndex(0);
          setIsLearnCompleted(false);
          setCountdown(null);
          setLearnStep('flashcard');
          setIsLearnFlipped(false);
          setShowRatingButtons(false);
        } else {
          setSessionCards([]);
          setLearnIndex(0);
          setIsLearnCompleted(true);
          setCountdown(null);
        }
      }

      // In Tab [Xem từ], focus on the first unlearned word
      const firstUnlearnedIdx = currentPartWords.findIndex(w => {
        const k = (w.word || '').trim().toLowerCase();
        return !w.isLearned && !initialCompletedSet.has(k);
      });
      if (firstUnlearnedIdx >= 0) {
        setViewIndex(firstUnlearnedIdx);
      }
    } else {
      setSessionCards([]);
      setTotalInitialCards(0);
      setCompletedSet(new Set());
    }
  }, [currentPartWords, activePartIndex, storageKeyId]);

  // Fetch Topic Data
  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      try {
        if (isDeckMode && queryDeckName) {
          const deckWords = await getBasketWordsByDeck(queryDeckName);
          setAllWords(deckWords);
          setParts([{ name: queryDeckName, words: deckWords }]);
          setTopic({ title: `📖 Học phần: ${queryDeckName}`, totalCount: deckWords.length, deckName: queryDeckName });
        } else if (isCartMode) {
          const cartList = await getBasketWords();
          setAllWords(cartList);
          setParts([{ name: 'Giỏ từ đã lưu', words: cartList }]);
          setTopic({ title: '🛒 Ôn Tập Giỏ Từ Vựng Đã Lưu', totalCount: cartList.length });
        } else if (isReviewMode) {
          const res = await axios.get('/api/v1/vocab/due-reviews');
          const dueList = (res.data && res.data.data) ? res.data.data : [];
          setAllWords(dueList);
          setParts([{ name: 'Từ đến hạn', words: dueList }]);
          setTopic({ title: '🔥 Ôn Tập Từ Vựng Đến Hạn', totalCount: dueList.length });
        } else {
          const res = await axios.get(`/api/v1/vocab/topics/${id}`);
          if (res.data && res.data.data) {
            const t = res.data.data;
            setTopic(t);
            setAllWords(t.words || []);
            if (t.parts && t.parts.length > 0) {
              setParts(t.parts);
            } else {
              setParts([{ name: 'Phần 1', words: t.words || [] }]);
            }
          }
        }
      } catch (e) {
        console.warn('Load error:', e.message);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, [id, isReviewMode, isCartMode, isDeckMode, queryDeckName]);

  // Handle Tab Navigation
  const setTab = (tab, extra = {}) => {
    const params = { tab };
    if (isDeckMode && queryDeckName) {
      params.source = 'deck';
      params.name = queryDeckName;
    } else if (isCartMode) {
      params.source = 'cart';
    }
    if (extra.study) params.study = extra.study;
    if (extra.game) params.game = extra.game;
    setSearchParams(params);
  };

  const cleanWordForSpeech = (text) => (text || '').replace(/\s*\([a-zA-Z\s/]+\)$/, '').trim();

  // Text to Speech with Voice Selection & Robust Handling
  const playAudio = (text, lang = 'en-US') => {
    if (!text) return;
    const cleanText = cleanWordForSpeech(text);
    if (!cleanText) return;
    if ('speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(cleanText);
        utterance.lang = lang;
        utterance.rate = 0.92;
        
        // Find best English voice if available
        const voices = window.speechSynthesis.getVoices();
        if (voices && voices.length > 0) {
          const matchedVoice = voices.find(v => 
            lang === 'en-GB' 
              ? (v.lang.includes('en-GB') || v.name.includes('UK') || v.name.includes('British'))
              : (v.lang.includes('en-US') || v.name.includes('US') || v.name.includes('English (United States)'))
          );
          if (matchedVoice) utterance.voice = matchedVoice;
        }

        window.speechSynthesis.speak(utterance);
      } catch (e) {
        console.warn('SpeechSynthesis error:', e);
      }
    }
  };

  // Auto-pronounce when transitioning words in Tab [Học] (Flashcard mode)
  useEffect(() => {
    if (activeTab === 'learn' && learnStep === 'flashcard' && sessionCards.length > 0) {
      const w = sessionCards[learnIndex]?.word;
      if (w) {
        const timer = setTimeout(() => {
          playAudio(w, 'en-US');
        }, 120);
        return () => clearTimeout(timer);
      }
    }
  }, [learnIndex, learnStep, activeTab, sessionCards]);

  // Auto-pronounce when transitioning words in Tab [Xem từ]
  useEffect(() => {
    if (activeTab === 'view' && currentPartWords.length > 0) {
      const w = currentPartWords[viewIndex]?.word;
      if (w) {
        const timer = setTimeout(() => {
          playAudio(w, 'en-US');
        }, 120);
        return () => clearTimeout(timer);
      }
    }
  }, [viewIndex, activeTab, currentPartWords]);

  // Init Quiz Question when entering quiz step
  useEffect(() => {
    if (activeTab === 'learn' && learnStep === 'quiz' && sessionCards.length > 0) {
      const current = sessionCards[learnIndex];
      if (!current) return;
      
      const others = currentPartWords.filter(w => (w.word || '').toLowerCase() !== (current.word || '').toLowerCase());
      const shuffledOthers = [...others].sort(() => 0.5 - Math.random()).slice(0, 3);
      const choices = [current, ...shuffledOthers].sort(() => 0.5 - Math.random());
      
      setQuizOptions(choices);
      setSelectedQuizAnswer(null);
      setQuizFeedback('idle');
      setShowRatingButtons(false);
    }
  }, [activeTab, learnStep, learnIndex, sessionCards, currentPartWords]);

  // Focus typing input when entering typing step
  useEffect(() => {
    if (activeTab === 'learn' && learnStep === 'typing') {
      setTimeout(() => {
        typingInputRef.current?.focus();
      }, 100);
    }
  }, [activeTab, learnStep]);

  // Active Recall Handlers
  const handleFlashcardNotRemembered = () => {
    setLearnStep('quiz');
    setIsLearnFlipped(false);
    setShowRatingButtons(false);
    setSelectedQuizAnswer(null);
    setQuizFeedback('idle');
  };

  const handleQuizSelect = (opt) => {
    if (selectedQuizAnswer || showRatingButtons) return;
    setSelectedQuizAnswer(opt.word);
    
    const current = sessionCards[learnIndex];
    const isCorrect = opt.word === current?.word;
    
    if (isCorrect) {
      setQuizFeedback('correct');
      if (soundEnabled) playSound('correct');
      setShowRatingButtons(false);
    } else {
      setQuizFeedback('wrong');
      if (soundEnabled) playSound('wrong');
    }
  };

  const handleTypingSubmit = (e) => {
    if (e) e.preventDefault();
    const current = sessionCards[learnIndex];
    if (!current || !typingInput.trim()) return;
    
    const cleanTarget = (current.word || '').replace(/\s*\([a-zA-Z\s/]+\)$/, '').trim().toLowerCase();
    const cleanInput = typingInput.trim().toLowerCase();
    
    if (cleanInput === cleanTarget || cleanInput === (current.word || '').toLowerCase()) {
      setTypingFeedback('correct');
      if (soundEnabled) playSound('correct');
      setShowRatingButtons(false);
    } else {
      setTypingFeedback('wrong');
      if (soundEnabled) playSound('wrong');
    }
  };

  const handleSkipTyping = () => {
    setTypingFeedback('wrong');
    if (soundEnabled) playSound('wrong');
  };

  // Web Speech API for Stage 4: Phát âm
  const startSpeechRecognition = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Trình duyệt chưa hỗ trợ nhận diện giọng nói trực tiếp. Bạn có thể bấm Đã thuộc để tiếp tục.');
      return;
    }

    try {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
      const recognition = new SpeechRecognition();
      recognition.lang = 'en-US';
      recognition.interimResults = false;
      recognition.maxAlternatives = 3;

      recognition.onstart = () => {
        setIsListening(true);
        setSpeechFeedback('listening');
        setSpeechTranscript('');
      };

      recognition.onresult = (event) => {
        const results = event.results;
        if (results && results[0] && results[0][0]) {
          const spoken = results[0][0].transcript.trim().toLowerCase();
          setSpeechTranscript(spoken);
          const current = sessionCards[learnIndex];
          const target = (current?.word || '').trim().toLowerCase();
          const cleanTarget = target.replace(/\s*\([a-zA-Z\s/]+\)$/, '').trim().toLowerCase();

          if (spoken === cleanTarget || spoken.includes(cleanTarget) || cleanTarget.includes(spoken)) {
            setSpeechFeedback('correct');
            if (soundEnabled) playSound('correct');
            setShowRatingButtons(true);
          } else {
            setSpeechFeedback('wrong');
            if (soundEnabled) playSound('wrong');
          }
        }
      };

      recognition.onerror = (e) => {
        console.warn('Speech error:', e.error);
        setIsListening(false);
        setSpeechFeedback('idle');
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err) {
      console.warn('Speech start error:', err);
      setIsListening(false);
    }
  };

  const stopSpeechRecognition = () => {
    if (recognitionRef.current) {
      recognitionRef.current.abort();
      setIsListening(false);
      setSpeechFeedback('idle');
    }
  };

  // Handle SM-2 Rating & Persist to Backend API matching Đậu TOEIC
  const handleRateWord = async (ratingScore) => {
    const current = sessionCards[learnIndex];
    if (!current) return;

    const isAgain = ratingScore === 1 || ratingScore === 'again';
    const cleanWord = (current.word || '').trim().toLowerCase();

    // 1. Mark word as learned locally immediately (ZERO LATENCY)
    current.isLearned = true;

    // 2. Add to completedSet and localStorage cache (COUNTED AS LEARNED FOR ALL RATINGS!)
    const nextCompleted = new Set(completedSet).add(cleanWord);
    setCompletedSet(nextCompleted);
    setLearnRatedCount(nextCompleted.size);
    try {
      localStorage.setItem(`tuongtan_completed_words_${storageKeyId}`, JSON.stringify([...nextCompleted]));
    } catch (e) {}

    // Update masteredWords so UI counter reflects it
    setMasteredWords(prev => new Set(prev).add(current.word));

    // Award XP
    setSessionXp(x => x + (isAgain ? 1 : ratingScore >= 3 ? 5 : 2));

    try {
      const res = await axios.post('/api/v1/vocab/rate', {
        word: current.word,
        rating: ratingScore,
        topicId: id,
        phonetic: current.phoneticUS || current.ipaUS || current.phonetic,
        meaning: current.meaning || current.definition,
        exampleEn: current.exampleEn || current.example,
        exampleVi: current.exampleVi || current.example_vi || current.translation,
        pos: current.pos
      });

      if (res.data && res.data.newInterval !== undefined) {
        current.intervalMinutes = res.data.newInterval;
        current.repetitionCount = (current.repetitionCount || 0) + 1;
        current.nextReviewDate = res.data.nextReviewDate;
      }

      await axios.post('/api/v1/user/record-progress', { type: 'vocab', count: 1 }).catch(() => {});

      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('vocab_basket_updated'));
      }
    } catch (err) {
      console.warn('Sync rating error:', err.message);
    }

    if (soundEnabled) playSound(isAgain ? 'wrong' : 'correct');

    const remainingCards = sessionCards.filter((_, idx) => idx !== learnIndex);

    // Kiểm tra đã học hết toàn bộ thẻ trong phiên
    if (remainingCards.length === 0) {
      setSessionCards([]);
      setIsLearnCompleted(true);
      setCountdown(8);
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('vocab_basket_updated'));
      }
      return;
    }

    let nextIdx = learnIndex;
    if (nextIdx >= remainingCards.length) {
      nextIdx = 0;
    }

    setSessionCards(remainingCards);
    setLearnIndex(nextIdx);
    setLearnStep('flashcard');
    setIsLearnFlipped(false);
    setShowRatingButtons(false);
    setSelectedQuizAnswer(null);
    setQuizFeedback('idle');
    setTypingInput('');
    setTypingFeedback('idle');
    setShowTypingHint(false);
    setSpeechTranscript('');
    setSpeechFeedback('idle');
    setIsListening(false);
  };

  // Reset and restart learning all words in this part from the very beginning
  const handleResetAllToStart = () => {
    if (currentPartWords.length === 0) return;
    try {
      localStorage.removeItem(`tuongtan_completed_words_${storageKeyId}`);
    } catch (e) {}
    setSessionCards([...currentPartWords]);
    setCompletedSet(new Set());
    setTotalInitialCards(currentPartWords.length);
    setLearnIndex(0);
    setIsLearnCompleted(false);
    setCountdown(null);
    setLearnStep('flashcard');
    setIsLearnFlipped(false);
    setShowRatingButtons(false);
    setSelectedQuizAnswer(null);
    setQuizFeedback('idle');
    setTypingInput('');
    setTypingFeedback('idle');
    setShowTypingHint(false);
    setViewIndex(0);
  };

  // Keyboard Shortcuts for [Xem từ] and [Học]
  useEffect(() => {
    const handleKeyDown = (e) => {
      const isInput = e.target && (e.target.tagName.toLowerCase() === 'input' || e.target.tagName.toLowerCase() === 'textarea');

      if (activeTab === 'view') {
        if (e.code === 'Space' && !isInput) {
          e.preventDefault();
          setIsViewCardFlipped(prev => !prev);
        } else if (e.code === 'ArrowRight' && !isInput) {
          e.preventDefault();
          setViewIndex(prev => Math.min(prev + 1, currentPartWords.length - 1));
          setIsViewCardFlipped(false);
        } else if (e.code === 'ArrowLeft' && !isInput) {
          e.preventDefault();
          setViewIndex(prev => Math.max(prev - 1, 0));
          setIsViewCardFlipped(false);
        }
      } else if (activeTab === 'learn') {
        // Universal 1-4 rating buttons shortcut when rating buttons are visible
        if (showRatingButtons && ['1', '2', '3', '4'].includes(e.key) && !isInput) {
          e.preventDefault();
          handleRateWord(Number(e.key));
          return;
        }

        if (learnStep === 'flashcard') {
          if (e.code === 'Space' && !isInput) {
            e.preventDefault();
            setIsLearnFlipped(prev => !prev);
          } else if (isLearnFlipped && !showRatingButtons) {
            if (e.key === 'Tab') {
              e.preventDefault();
              setShowRatingButtons(true);
            } else if (e.key === 'Enter') {
              e.preventDefault();
              handleFlashcardNotRemembered();
            }
          }
        } else if (learnStep === 'quiz') {
          if (!selectedQuizAnswer) {
            if (['1', '2', '3', '4'].includes(e.key) && !isInput) {
              e.preventDefault();
              const optIdx = Number(e.key) - 1;
              if (quizOptions[optIdx]) {
                handleQuizSelect(quizOptions[optIdx]);
              }
            }
          } else if (!showRatingButtons) {
            if (e.key === 'Tab') {
              e.preventDefault();
              setShowRatingButtons(true);
            } else if (e.key === 'Enter') {
              e.preventDefault();
              setLearnStep('typing');
              setSelectedQuizAnswer(null);
              setQuizFeedback('idle');
              setTypingInput('');
              setTypingFeedback('idle');
              setShowTypingHint(false);
              setShowRatingButtons(false);
            }
          }
        } else if (learnStep === 'typing') {
          if (typingFeedback === 'correct' && !showRatingButtons) {
            if (e.key === 'Tab') {
              e.preventDefault();
              setShowRatingButtons(true);
            } else if (e.key === 'Enter') {
              e.preventDefault();
              setLearnStep('pronunciation');
              setShowRatingButtons(false);
              setSpeechTranscript('');
              setSpeechFeedback('idle');
            }
          } else if (typingFeedback === 'wrong' && !showRatingButtons) {
            if (e.key === 'Enter') {
              e.preventDefault();
              setLearnStep('pronunciation');
              setShowRatingButtons(false);
              setSpeechTranscript('');
              setSpeechFeedback('idle');
            }
          }
        } else if (learnStep === 'pronunciation') {
          if (!showRatingButtons) {
            if (e.key === 'Tab' || e.key === 'Enter') {
              e.preventDefault();
              setShowRatingButtons(true);
            }
          }
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeTab, learnStep, isLearnFlipped, showRatingButtons, selectedQuizAnswer, quizFeedback, typingFeedback, quizOptions, currentPartWords]);

  // -------------------------------------------------------------
  // WORD BLAST GAME: SEQUENTIAL NON-REPEATING QUEUE (N WORDS)
  // -------------------------------------------------------------
  const initWordBlast = () => {
    if (currentPartWords.length === 0) return;
    const shuffledQueue = [...currentPartWords].sort(() => 0.5 - Math.random());
    setBlastQueue(shuffledQueue);
    setBlastCurrentIndex(0);
    setBlastLives(3);
    setBlastScore(0);
    setBlastLevel(1);
    setBlastCombo(0);
    setIsBlastEnded(false);
    setIsBlastWon(false);
    setLaserBeam(null);

    loadBlastQuestion(0, shuffledQueue);
  };

  const loadBlastQuestion = (index, queue = blastQueue) => {
    if (index >= queue.length || queue.length === 0) {
      setIsBlastWon(true);
      return;
    }

    const target = queue[index];
    const others = currentPartWords.filter(w => w.word !== target.word);
    const shuffledOthers = [...others].sort(() => 0.5 - Math.random()).slice(0, 3);
    const choices = [target, ...shuffledOthers].sort(() => 0.5 - Math.random());

    setBlastOptions(choices);
    setLaserBeam(null);
  };

  // Start blast when entering play tab
  useEffect(() => {
    if (activeTab === 'play' && activeGame === 'blast' && currentPartWords.length > 0) {
      initWordBlast();
    }
  }, [activeTab, activeGame, activePartIndex, currentPartWords]);

  const handleBlastTargetClick = (chosenWord, idx) => {
    if (isBlastEnded || isBlastWon || laserBeam) return;
    
    const targetWord = blastQueue[blastCurrentIndex];
    if (!targetWord) return;

    if (soundEnabled) playSound('laser');
    const isHit = chosenWord.word === targetWord.word;
    setLaserBeam({ targetIndex: idx, isHit });

    setTimeout(() => {
      if (isHit) {
        if (soundEnabled) playSound('blast');
        setBlastScore(s => s + 100 * blastLevel + blastCombo * 20);
        setBlastCombo(c => c + 1);
        
        const nextIdx = blastCurrentIndex + 1;
        setBlastCurrentIndex(nextIdx);

        if (nextIdx >= blastQueue.length) {
          setIsBlastWon(true);
          if (soundEnabled) playSound('correct');
        } else {
          loadBlastQuestion(nextIdx, blastQueue);
        }
      } else {
        if (soundEnabled) playSound('wrong');
        setBlastCombo(0);
        setBlastLives(l => {
          const nextLives = l - 1;
          if (nextLives <= 0) {
            setIsBlastEnded(true);
          }
          return Math.max(0, nextLives);
        });
        setTimeout(() => {
          setLaserBeam(null);
        }, 400);
      }
    }, 180);
  };

  // -------------------------------------------------------------
  // WORD MATCH GAME: BATCHED BY 6 WORDS UNTIL PART IS COMPLETED
  // -------------------------------------------------------------
  const initWordMatch = (batchIdx = 0) => {
    if (currentPartWords.length === 0) return;
    const start = batchIdx * 6;
    const end = Math.min(start + 6, currentPartWords.length);
    const batchWords = currentPartWords.slice(start, end);

    if (batchWords.length === 0) {
      setIsMatchPartCompleted(true);
      return;
    }

    const enCards = batchWords.map((w, i) => ({ id: `en_${i}`, text: w.word, type: 'en', pairId: i }));
    const viCards = batchWords.map((w, i) => ({ id: `vi_${i}`, text: w.meaning, type: 'vi', pairId: i }));
    const allCards = [...enCards, ...viCards].sort(() => 0.5 - Math.random());
    
    setMatchBatchIndex(batchIdx);
    setMatchCards(allCards);
    setSelectedCards([]);
    setMatchedPairs([]);
    setIsMatchPartCompleted(false);
  };

  useEffect(() => {
    if (activeTab === 'play' && activeGame === 'match' && currentPartWords.length > 0) {
      initWordMatch(0);
    }
  }, [activeTab, activeGame, activePartIndex, currentPartWords]);

  const handleCardClick = (card) => {
    if (matchedPairs.includes(card.pairId) || selectedCards.find(c => c.id === card.id)) return;
    
    const newSelected = [...selectedCards, card];
    setSelectedCards(newSelected);

    if (newSelected.length === 2) {
      if (newSelected[0].pairId === newSelected[1].pairId && newSelected[0].type !== newSelected[1].type) {
        if (soundEnabled) playSound('correct');
        setMatchedPairs(prev => [...prev, newSelected[0].pairId]);
        setMatchScore(s => s + 200);
        setSelectedCards([]);
      } else {
        if (soundEnabled) playSound('wrong');
        setTimeout(() => {
          setSelectedCards([]);
        }, 500);
      }
    }
  };

  // Unified learned / mastered words set across the entire topic part
  const learnedWordsSet = useMemo(() => {
    const set = new Set();
    currentPartWords.forEach(w => {
      const clean = (w.word || '').trim().toLowerCase();
      if (w.isLearned || completedSet.has(clean) || masteredWords.has(w.word) || masteredWords.has(clean)) {
        if (clean) set.add(clean);
      }
    });
    return set;
  }, [currentPartWords, completedSet, masteredWords]);

  const learnedProgressCount = Math.min(learnedWordsSet.size, currentPartWords.length);

  const newWordsCount = Math.max(0, currentPartWords.length - learnedProgressCount);
  const dueWordsCount = currentPartWords.filter(w => w.isDue).length;

  // Filtered Words List for Tab 1
  const filteredWordsList = currentPartWords.filter(w => {
    if (!w) return false;
    const wordStr = (w.word || '').toLowerCase();
    const meaningStr = (w.meaning || w.definition || '').toLowerCase();
    const matchesSearch = wordStr.includes(searchTerm.toLowerCase()) || 
                          meaningStr.includes(searchTerm.toLowerCase());
    if (!matchesSearch) return false;
    if (filterMode === 'starred') return starredWords.has(w.word);
    if (filterMode === 'mastered') {
      const clean = (w.word || '').trim().toLowerCase();
      return learnedWordsSet.has(clean) || masteredWords.has(w.word);
    }
    return true;
  });

  const toggleStar = (word) => {
    setStarredWords(prev => {
      const next = new Set(prev);
      if (next.has(word)) next.delete(word);
      else next.add(word);
      return next;
    });
  };

  const toggleMaster = (word) => {
    const clean = (word || '').trim().toLowerCase();
    const isCurrentlyMastered = learnedWordsSet.has(clean) || masteredWords.has(word);
    
    if (isCurrentlyMastered) {
      setMasteredWords(prev => {
        const next = new Set(prev);
        next.delete(word);
        next.delete(clean);
        return next;
      });
      setCompletedSet(prev => {
        const next = new Set(prev);
        next.delete(clean);
        try {
          localStorage.setItem(`tuongtan_completed_words_${storageKeyId}`, JSON.stringify([...next]));
        } catch (e) {}
        return next;
      });
      const targetWordObj = currentPartWords.find(w => (w.word || '').trim().toLowerCase() === clean);
      if (targetWordObj) targetWordObj.isLearned = false;
    } else {
      setMasteredWords(prev => {
        const next = new Set(prev);
        next.add(word);
        next.add(clean);
        return next;
      });
      setCompletedSet(prev => {
        const next = new Set(prev);
        next.add(clean);
        try {
          localStorage.setItem(`tuongtan_completed_words_${storageKeyId}`, JSON.stringify([...next]));
        } catch (e) {}
        return next;
      });
      const targetWordObj = currentPartWords.find(w => (w.word || '').trim().toLowerCase() === clean);
      if (targetWordObj) targetWordObj.isLearned = true;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
        <div className="flex items-center gap-3 text-emerald-400 font-mono">
          <RefreshCw className="w-5 h-5 animate-spin" />
          <span>Đang nạp phòng học từ vựng...</span>
        </div>
      </div>
    );
  }

  const cleanWordDisplay = (word) => (word || '').replace(/\s*\([a-zA-Z\s/]+\)$/, '').trim();
  const getPhoneticUS = (w) => w?.phoneticUS || w?.ipaUS || w?.phonetic || (w?.word ? `/${cleanWordDisplay(w.word).toLowerCase()}/` : '/.../');
  const getPhoneticUK = (w) => w?.phoneticUK || w?.phoneticUk || w?.ipaUK || w?.phonetic || (w?.word ? `/${cleanWordDisplay(w.word).toLowerCase()}/` : '/.../');

  const getStepIndex = (step) => {
    switch (step) {
      case 'flashcard': return 1;
      case 'quiz': return 2;
      case 'typing': return 3;
      case 'pronunciation': return 4;
      default: return 1;
    }
  };

  const getStepName = (step) => {
    switch (step) {
      case 'flashcard': return 'Flashcard';
      case 'quiz': return 'Trắc nghiệm';
      case 'typing': return 'Gõ từ';
      case 'pronunciation': return 'Phát âm';
      default: return 'Flashcard';
    }
  };

  const currentViewWord = currentPartWords[viewIndex] || currentPartWords[0] || {};
  const currentLearnWord = (sessionCards && sessionCards.length > 0) ? (sessionCards[learnIndex] || sessionCards[0] || {}) : (currentPartWords[learnIndex] || currentPartWords[0] || {});
  const currentBlastWord = blastQueue[blastCurrentIndex] || currentPartWords[0] || {};

  const renderEmptyCartState = () => (
    <div className="rounded-3xl bg-slate-900/90 border border-slate-800 p-8 sm:p-12 text-center space-y-5 shadow-2xl animate-fadeIn max-w-2xl mx-auto my-6">
      <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center mx-auto shadow-lg shadow-amber-500/10">
        <ShoppingBag className="w-8 h-8" />
      </div>
      <div className="space-y-2 max-w-md mx-auto">
        <h3 className="text-xl sm:text-2xl font-bold text-white font-heading">Giỏ từ của bạn hiện đang trống</h3>
        <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
          Hãy lưu các từ vựng cần học trong lúc làm bài <strong>Luyện Đọc</strong>, <strong>Luyện Nghe</strong>, <strong>Đề Thi ETS</strong> hoặc <strong>Tra từ điển</strong> để ôn luyện chuyên sâu tại đây nhé!
        </p>
      </div>
      <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
        <button
          onClick={() => navigate('/vocabulary')}
          className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold text-xs uppercase tracking-wider shadow-lg shadow-emerald-500/20 transition-all flex items-center gap-2"
        >
          <BookOpen className="w-4 h-4" />
          <span>Danh mục 83 chủ đề từ</span>
        </button>
        <button
          onClick={() => navigate('/read')}
          className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs uppercase tracking-wider border border-slate-700 transition-all flex items-center gap-2"
        >
          <span>Luyện Đọc ETS</span>
        </button>
        <button
          onClick={() => navigate('/listen')}
          className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs uppercase tracking-wider border border-slate-700 transition-all flex items-center gap-2"
        >
          <span>Luyện Nghe ETS</span>
        </button>
      </div>
    </div>
  );

  const renderEmptyReviewState = () => (
    <div className="rounded-3xl dark:bg-slate-900/90 bg-white border dark:border-slate-800 border-slate-200 p-8 sm:p-12 text-center space-y-5 shadow-2xl animate-fadeIn max-w-2xl mx-auto my-6">
      <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 dark:text-emerald-400 flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/10">
        <CheckCircle2 className="w-8 h-8" />
      </div>
      <div className="space-y-2 max-w-md mx-auto">
        <h3 className="text-xl sm:text-2xl font-bold dark:text-white text-slate-900 font-heading">
          Không có từ vựng nào đến hạn ôn tập 🎉
        </h3>
        <p className="text-xs sm:text-sm dark:text-slate-400 text-slate-600 leading-relaxed">
          Thuật toán Spaced Repetition (SM-2) đã tối ưu lịch ôn. Bạn đã hoàn thành toàn bộ các từ cần ôn hôm nay! Hãy tiếp tục học thêm các bài học mới nhé.
        </p>
      </div>
      <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
        <button
          onClick={() => navigate('/vocabulary')}
          className="px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-xs uppercase tracking-wider shadow-lg shadow-emerald-500/20 transition-all flex items-center gap-2 cursor-pointer"
        >
          <BookOpen className="w-4 h-4" />
          <span>Khám phá 83 chủ đề từ vựng</span>
        </button>
      </div>
    </div>
  );

  const renderEmptyState = () => {
    if (isReviewMode) return renderEmptyReviewState();
    return renderEmptyCartState();
  };

  return (
    <div className="min-h-screen dark:bg-slate-950 bg-[#f8fafc] dark:text-slate-100 text-slate-900 flex flex-col font-sans transition-colors duration-200">
      <Navbar />

      {/* TOP HEADER BAR (MATCHING DAU TOEIC) */}
      <header className="sticky top-0 z-40 dark:bg-slate-900/90 bg-white/90 backdrop-blur-md border-b dark:border-slate-800 border-slate-200 px-4 sm:px-6 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          
          {/* Left Controls: Back + Toggle Sidebar */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate('/vocabulary')}
              className="p-2 rounded-xl dark:bg-slate-800/80 bg-slate-100 dark:hover:bg-slate-700 hover:bg-slate-200 dark:text-slate-300 text-slate-700 dark:hover:text-white hover:text-slate-900 border dark:border-slate-800 border-slate-200 transition-all cursor-pointer"
              title="Quay lại danh sách"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>

            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-xl dark:bg-slate-800/80 bg-slate-100 dark:hover:bg-slate-700 hover:bg-slate-200 dark:text-slate-300 text-slate-700 dark:hover:text-white hover:text-slate-900 text-xs font-bold flex items-center gap-1.5 border dark:border-slate-800 border-slate-200 transition-all active:scale-95 cursor-pointer"
            >
              <SidebarIcon className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{isSidebarOpen ? 'Ẩn sidebar' : 'Hiện sidebar'}</span>
              <span className="sm:hidden text-[11px]">Phần học</span>
            </button>
          </div>

          {/* Center 3 Main Mode Switcher: [ 👁️ Xem từ ] [ 📖 Học ] [ 🎮 Chơi ] */}
          <div className="flex items-center dark:bg-slate-950 bg-slate-100 p-0.5 sm:p-1 rounded-2xl border dark:border-slate-800 border-slate-200 shadow-inner">
            <button
              onClick={() => setTab('view')}
              className={`px-3 sm:px-5 py-1.5 sm:py-2 rounded-xl text-[11px] sm:text-xs font-extrabold flex items-center gap-1.5 transition-all cursor-pointer ${
                activeTab === 'view'
                  ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                  : 'dark:text-slate-400 text-slate-600 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Xem từ</span>
            </button>

            <button
              onClick={() => setTab('learn', { study: 'flashcard' })}
              className={`px-3 sm:px-5 py-1.5 sm:py-2 rounded-xl text-[11px] sm:text-xs font-extrabold flex items-center gap-1.5 transition-all cursor-pointer ${
                activeTab === 'learn'
                  ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                  : 'dark:text-slate-400 text-slate-600 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Học</span>
            </button>

            <button
              onClick={() => {
                setTab('play', { game: 'blast' });
                initWordBlast();
              }}
              className={`px-3 sm:px-5 py-1.5 sm:py-2 rounded-xl text-[11px] sm:text-xs font-extrabold flex items-center gap-1.5 transition-all cursor-pointer ${
                activeTab === 'play'
                  ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                  : 'dark:text-slate-400 text-slate-600 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Gamepad2 className="w-3.5 h-3.5" />
              <span>Chơi</span>
            </button>
          </div>

          {/* Right Controls: XP + Progress matching Đậu TOEIC */}
          <div className="flex items-center gap-3 text-xs font-mono">
            <span className="text-amber-500 font-bold flex items-center gap-1">
              <Zap className="w-3.5 h-3.5 fill-current" />
              +{sessionXp}
            </span>
            <span className="dark:text-slate-400 text-slate-600 font-bold">
              {learnedProgressCount}/{currentPartWords.length} từ
            </span>
          </div>

        </div>
      </header>

      {/* MOBILE PARTS DRAWER OVERLAY (< md screens) */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm md:hidden flex" 
          onClick={() => setIsSidebarOpen(false)}
        >
          <div 
            className="w-72 max-w-[85vw] h-full dark:bg-[#0a0f1d] bg-white border-r dark:border-slate-800 border-slate-200 p-4 overflow-y-auto flex flex-col justify-between shadow-2xl animate-slideInLeft"
            onClick={e => e.stopPropagation()}
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between pb-3 border-b dark:border-slate-800 border-slate-200">
                <span className="text-xs font-black dark:text-slate-200 text-slate-900 uppercase font-heading">Danh sách phần học</span>
                <button 
                  onClick={() => setIsSidebarOpen(false)}
                  className="p-1 rounded-lg dark:bg-slate-900 bg-slate-100 dark:text-slate-400 text-slate-600 dark:hover:text-white hover:text-slate-900"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div>
                <h3 className="font-heading font-extrabold text-sm dark:text-white text-slate-900 line-clamp-1">
                  {topic?.title || 'Bộ Từ Vựng'}
                </h3>
                <p className="text-xs dark:text-slate-400 text-slate-500 font-mono">
                  {parts.length} phần • {allWords.length} từ
                </p>
              </div>

              <div className="space-y-1.5 pt-2">
                {parts.map((part, idx) => {
                  const isActive = activePartIndex === idx;
                  return (
                    <button
                      key={idx}
                      onClick={() => {
                        setActivePartIndex(idx);
                        setViewIndex(0);
                        setLearnIndex(0);
                        setIsLearnCompleted(false);
                        setCountdown(null);
                        setLearnStep('flashcard');
                        setIsLearnFlipped(false);
                        setShowRatingButtons(false);
                        if (activeTab === 'play') {
                          if (activeGame === 'blast') initWordBlast();
                          else initWordMatch(0);
                        }
                        setIsSidebarOpen(false);
                      }}
                      className={`w-full p-2.5 rounded-xl text-left text-xs font-bold transition-all flex items-center justify-between cursor-pointer ${
                        isActive
                          ? 'bg-emerald-500 text-slate-950 font-extrabold shadow-md shadow-emerald-500/20'
                          : 'dark:bg-slate-900/60 bg-slate-50 border dark:border-slate-800 border-slate-200 dark:text-slate-300 text-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <BookOpen className={`w-3.5 h-3.5 ${isActive ? 'text-slate-950' : 'text-slate-400'}`} />
                        <span className="truncate">{part.name || `Phần ${idx + 1}`}</span>
                      </div>
                      <span className={`text-[10px] font-mono shrink-0 ${isActive ? 'text-slate-950 font-extrabold' : 'dark:text-slate-500 text-slate-400'}`}>
                        {part.words?.length || 0} từ
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            <button
              onClick={() => setIsSidebarOpen(false)}
              className="w-full mt-4 py-2.5 rounded-xl dark:bg-slate-900 bg-slate-100 border dark:border-slate-800 border-slate-200 dark:text-slate-300 text-slate-700 font-bold text-xs dark:hover:text-white hover:text-slate-900 transition-colors"
            >
              Đóng danh sách
            </button>
          </div>
        </div>
      )}

      {/* MAIN TWO-COLUMN WORKSPACE (FITS 100% IN VIEWPORT) */}
      <div className="flex-1 flex flex-col md:flex-row max-w-7xl w-full mx-auto px-4 sm:px-6 py-3 sm:py-4 gap-4">
        
        {/* DESKTOP SIDEBAR (Hidden on < md) */}
        {isSidebarOpen && (
          <aside className="hidden md:block w-60 shrink-0 space-y-3">
            <div className="p-3.5 rounded-2xl dark:bg-[#0a0f1d] bg-white border dark:border-slate-800 border-slate-200 shadow-xl space-y-2.5">
              <div>
                <h3 className="font-heading font-extrabold text-sm sm:text-base dark:text-white text-slate-900 line-clamp-1">
                  {topic?.title || 'Bộ Từ Vựng'}
                </h3>
                <p className="text-xs dark:text-slate-400 text-slate-500 font-mono">
                  {parts.length} phần • {allWords.length} từ
                </p>
              </div>

              <div className="space-y-1 pt-1">
                {parts.map((part, idx) => {
                  const isActive = activePartIndex === idx;
                  return (
                    <button
                      key={idx}
                      onClick={() => {
                        setActivePartIndex(idx);
                        setViewIndex(0);
                        setLearnIndex(0);
                        setIsLearnCompleted(false);
                        setCountdown(null);
                        setLearnStep('flashcard');
                        setIsLearnFlipped(false);
                        setShowRatingButtons(false);
                        if (activeTab === 'play') {
                          if (activeGame === 'blast') initWordBlast();
                          else initWordMatch(0);
                        }
                      }}
                      className={`w-full p-2.5 rounded-xl text-left text-xs font-bold transition-all flex items-center justify-between cursor-pointer ${
                        isActive
                          ? 'bg-emerald-500 text-slate-950 font-extrabold shadow-md shadow-emerald-500/20'
                          : 'dark:bg-slate-900/60 bg-slate-50 border dark:border-slate-800 border-slate-200 dark:text-slate-300 text-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <BookOpen className={`w-3.5 h-3.5 ${isActive ? 'text-slate-950' : 'text-slate-400'}`} />
                        <span className="truncate">{part.name || `Phần ${idx + 1}`}</span>
                      </div>
                      <span className={`text-[10px] font-mono shrink-0 ${isActive ? 'text-slate-950 font-extrabold' : 'dark:text-slate-500 text-slate-400'}`}>
                        {part.words?.length || 0} từ
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </aside>
        )}

        {/* RIGHT MAIN CONTENT AREA */}
        <main className="flex-1 space-y-4 min-w-0">

          {/* ========================================================================= */}
          {/* TAB 1: [ 👁️ XEM TỪ ] - 100% KHỚP GIAO DIỆN ĐẬU TOEIC */}
          {/* ========================================================================= */}
          {activeTab === 'view' && (
            currentPartWords.length === 0 ? (
              renderEmptyState()
            ) : (
            <div className="space-y-8 animate-fadeIn">
              
              {/* TOP UTILITY ROW */}
              <div className="flex items-center justify-between text-xs text-slate-400">
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => setShowHint(!showHint)}
                    className="flex items-center gap-1.5 hover:text-emerald-400 transition-colors"
                  >
                    <Lightbulb className="w-4 h-4 text-amber-400" />
                    <span>{showHint ? 'Hiển thị gợi ý' : 'Ẩn gợi ý'}</span>
                  </button>

                  <button
                    onClick={() => setAutoPlayAudio(!autoPlayAudio)}
                    className={`flex items-center gap-1.5 transition-colors ${autoPlayAudio ? 'text-emerald-400 font-bold' : 'text-slate-400 hover:text-slate-200'}`}
                  >
                    <Volume2 className="w-4 h-4" />
                    <span>Tự động phát âm: {autoPlayAudio ? 'Bật' : 'Tắt'}</span>
                  </button>
                </div>

                <div className="flex items-center gap-3">
                  <button 
                    onClick={() => toggleStar(currentViewWord.word)}
                    className={`p-1.5 rounded-lg hover:bg-slate-900 ${starredWords.has(currentViewWord.word) ? 'text-amber-400' : 'text-slate-400'}`}
                    title="Yêu thích"
                  >
                    <Star className="w-4 h-4" fill={starredWords.has(currentViewWord.word) ? 'currentColor' : 'none'} />
                  </button>

                  <button 
                    onClick={() => {
                      setViewIndex(0);
                    }}
                    className="p-1.5 rounded-lg hover:bg-slate-900 hover:text-emerald-400 text-slate-400"
                    title="Xáo trộn"
                  >
                    <Shuffle className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* BIG CLEAN FLASHCARD CAROUSEL (DARK CYBER THEME - FITS 100% IN VIEWPORT) */}
              <div className="space-y-3">
                <div 
                  onClick={() => setIsViewCardFlipped(!isViewCardFlipped)}
                  className="cursor-pointer min-h-[350px] sm:min-h-[380px] rounded-3xl dark:bg-[#0d1424] bg-white border dark:border-slate-800/90 border-slate-200 dark:text-white text-slate-900 shadow-xl p-5 sm:p-6 flex flex-col justify-between items-center text-center transition-all relative select-none hover:border-emerald-500/40"
                >
                  <div className="w-full flex items-center justify-between text-xs text-slate-400">
                    <span className="font-mono text-emerald-400 font-extrabold uppercase tracking-widest text-[11px] sm:text-xs bg-emerald-500/10 px-2.5 py-0.5 rounded-lg border border-emerald-500/20">
                      {currentViewWord.pos || 'vocabulary'}
                    </span>
                    <span className="font-mono dark:text-slate-300 text-slate-700 font-bold text-xs dark:bg-slate-900 bg-slate-100 px-2.5 py-0.5 rounded-lg border dark:border-slate-800 border-slate-200">
                      {viewIndex + 1} / {currentPartWords.length}
                    </span>
                  </div>

                  {/* Card Front vs Back Content */}
                  <div className="my-auto space-y-3 py-2 w-full max-w-xl">
                    {!isViewCardFlipped ? (
                      <div className="space-y-3 animate-fadeIn">
                        <h2 className="text-3xl sm:text-4xl md:text-5xl font-black font-heading dark:text-white text-slate-900 tracking-tight drop-shadow-md py-1">
                          {currentViewWord.word} {currentViewWord.pos && <span className="text-base dark:text-slate-400 text-slate-500 font-normal">({currentViewWord.pos})</span>}
                        </h2>
                        
                        {/* Audio Buttons with US/UK Phonetics (Blue & Red Speaker) */}
                        <div className="flex items-center justify-center gap-3 sm:gap-4 pt-1">
                          <button
                            onClick={(e) => { e.stopPropagation(); playAudio(currentViewWord.word, 'en-US'); }}
                            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-sky-500/15 hover:bg-sky-500/25 text-sky-600 dark:text-sky-300 text-xs sm:text-sm font-mono font-bold transition-all border border-sky-500/30 hover:scale-105 shadow-sm"
                          >
                            <Volume2 className="w-3.5 h-3.5 text-sky-500" />
                            <span>{getPhoneticUS(currentViewWord)}</span>
                          </button>

                          <button
                            onClick={(e) => { e.stopPropagation(); playAudio(currentViewWord.word, 'en-GB'); }}
                            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-rose-500/15 hover:bg-rose-500/25 text-rose-600 dark:text-rose-300 text-xs sm:text-sm font-mono font-bold transition-all border border-rose-500/30 hover:scale-105 shadow-sm"
                          >
                            <Volume2 className="w-3.5 h-3.5 text-rose-500" />
                            <span>{getPhoneticUK(currentViewWord)}</span>
                          </button>
                        </div>

                        <div className="pt-2">
                          <p className="text-xs dark:text-slate-400 text-slate-500 font-medium">Nhấn vào thẻ để xem nghĩa</p>
                          <span className="text-[10px] dark:text-slate-400 text-slate-600 font-mono dark:bg-slate-800 bg-slate-100 px-2 py-0.5 rounded border dark:border-slate-700 border-slate-200 font-bold inline-block mt-1">
                            Space
                          </span>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-3 animate-fadeIn text-center">
                        <h3 className="text-3xl sm:text-4xl font-black text-emerald-500 dark:text-emerald-400 drop-shadow-md tracking-tight py-1">
                          {currentViewWord.meaning}
                        </h3>
                        {currentViewWord.exampleEn && (
                          <div className="max-w-lg mx-auto p-3.5 sm:p-4 rounded-xl dark:bg-slate-950/90 bg-slate-50 border dark:border-slate-800 border-slate-200 text-left space-y-1.5 shadow-inner">
                            <p className="text-xs sm:text-sm dark:text-slate-100 text-slate-800 font-bold leading-snug">"{currentViewWord.exampleEn}"</p>
                            {currentViewWord.exampleVi && (
                              <p className="text-[11px] sm:text-xs dark:text-slate-400 text-slate-500 italic pl-4 border-l dark:border-slate-700 border-slate-300">({currentViewWord.exampleVi})</p>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Navigation Carousel Bar */}
                  <div className="w-full flex items-center justify-between pt-3 border-t dark:border-slate-800/80 border-slate-200">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setViewIndex(prev => Math.max(prev - 1, 0));
                        setIsViewCardFlipped(false);
                      }}
                      disabled={viewIndex === 0}
                      className="px-3.5 py-2 rounded-xl dark:bg-slate-800 bg-slate-100 dark:hover:bg-slate-700 hover:bg-slate-200 disabled:opacity-30 dark:text-slate-200 text-slate-700 font-bold text-xs transition-all border dark:border-slate-700/60 border-slate-200 flex items-center gap-1.5"
                    >
                      <ChevronLeft className="w-3.5 h-3.5" />
                      <span>Từ trước</span>
                    </button>

                    <div className="text-xs font-mono dark:text-slate-400 text-slate-500">
                      <span className="dark:text-white text-slate-900 font-bold">{viewIndex + 1}</span> / {currentPartWords.length}
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setViewIndex(prev => Math.min(prev + 1, currentPartWords.length - 1));
                        setIsViewCardFlipped(false);
                      }}
                      disabled={viewIndex === currentPartWords.length - 1}
                      className="px-3.5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-30 text-slate-950 font-black text-xs transition-all shadow-md shadow-emerald-500/20 flex items-center gap-1.5"
                    >
                      <span>Từ tiếp</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="text-center text-xs text-slate-400 font-mono">
                  ← → chuyển từ • Space lật thẻ
                </div>
              </div>

              {/* DETAILED VOCABULARY LIST TABLE (EXACT MATCH WITH DAU TOEIC) */}
              <div className="space-y-4">
                
                {/* Control Bar: [29 thuật ngữ] [◫ Xem chi tiết] [☆ 0] [✓ Đã thuộc (2)] [Thứ tự gốc ▾] */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-sm text-white">
                      {filteredWordsList.length} thuật ngữ
                    </span>

                    <button
                      onClick={() => setShowDetailList(!showDetailList)}
                      className="px-3 py-1.5 rounded-xl bg-emerald-500 text-slate-950 font-extrabold text-xs flex items-center gap-1.5 shadow-sm"
                    >
                      <Layers className="w-3.5 h-3.5" />
                      <span>{showDetailList ? 'Ẩn chi tiết' : 'Xem chi tiết'}</span>
                    </button>
                  </div>

                  <div className="flex items-center gap-3 flex-wrap">
                    <button
                      onClick={() => setFilterMode(filterMode === 'starred' ? 'all' : 'starred')}
                      className={`text-xs font-bold flex items-center gap-1 transition-colors ${filterMode === 'starred' ? 'text-amber-400' : 'text-slate-400 hover:text-white'}`}
                    >
                      <Star className="w-3.5 h-3.5" fill={starredWords.size > 0 ? 'currentColor' : 'none'} />
                      <span>{starredWords.size}</span>
                    </button>

                    <button
                      onClick={() => setFilterMode(filterMode === 'mastered' ? 'all' : 'mastered')}
                      className={`text-xs font-bold flex items-center gap-1 transition-colors ${filterMode === 'mastered' ? 'text-emerald-400' : 'text-slate-400 hover:text-white'}`}
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Đã thuộc ({learnedProgressCount})</span>
                    </button>

                    <div className="relative w-40">
                      <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5" />
                      <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Tìm từ..."
                        className="w-full pl-8 pr-3 py-1 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white outline-none focus:border-emerald-500"
                      />
                    </div>
                  </div>
                </div>

                {/* Word List Rows (Card with Left: Word & Example, Center: Meaning, Right: Actions) */}
                {showDetailList && (
                  <div className="space-y-3">
                    {filteredWordsList.map((item, idx) => {
                      const cleanItemWord = (item.word || '').trim().toLowerCase();
                      const isMastered = learnedWordsSet.has(cleanItemWord) || masteredWords.has(item.word);
                      const isStarred = starredWords.has(item.word);

                      return (
                        <div 
                          key={idx}
                          className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-emerald-500/40 grid grid-cols-1 md:grid-cols-12 gap-4 items-center transition-all"
                        >
                          {/* Left Column: Word & Example (5 cols) */}
                          <div className="md:col-span-5 space-y-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <h4 className="font-extrabold text-base text-white">{item.word}</h4>
                              {item.isLearned && !item.isDue && (
                                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-medium">
                                  ✓ Đã học {item.intervalMinutes ? `(${formatSrsInterval(item.intervalMinutes)})` : ''}
                                </span>
                              )}
                              {item.isLearned && item.isDue && (
                                <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 font-medium">
                                  ⏰ Đến hạn ôn
                                </span>
                              )}
                              {!item.isLearned && (
                                <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700 font-medium">
                                  Từ mới
                                </span>
                              )}
                            </div>
                            {item.exampleEn && (
                              <div className="text-xs text-slate-300 space-y-0.5">
                                <p>{item.exampleEn}</p>
                                {item.exampleVi && <p className="text-slate-400 italic">→ {item.exampleVi}</p>}
                              </div>
                            )}
                          </div>

                          {/* Center Column: Vietnamese Meaning (5 cols) */}
                          <div className="md:col-span-5">
                            <span className="font-bold text-sm text-emerald-400">
                              {item.meaning}
                            </span>
                          </div>

                          {/* Right Column: Audio, Star, Mastered (2 cols) */}
                          <div className="md:col-span-2 flex items-center justify-end gap-2">
                            <button
                              onClick={() => playAudio(item.word, 'en-US')}
                              className="p-2 rounded-xl text-slate-400 hover:text-emerald-400 hover:bg-slate-800 transition-colors"
                              title="Phát âm"
                            >
                              <Volume2 className="w-4 h-4" />
                            </button>

                            <button
                              onClick={() => toggleStar(item.word)}
                              className={`p-2 rounded-xl hover:bg-slate-800 transition-colors ${isStarred ? 'text-amber-400' : 'text-slate-400'}`}
                              title="Yêu thích"
                            >
                              <Star className="w-4 h-4" fill={isStarred ? 'currentColor' : 'none'} />
                            </button>

                            <button
                              onClick={() => toggleMaster(item.word)}
                              className={`p-2 rounded-xl hover:bg-slate-800 transition-colors ${isMastered ? 'text-emerald-400 bg-emerald-500/10' : 'text-slate-400'}`}
                              title="Đánh dấu đã thuộc"
                            >
                              <CheckCircle2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

              </div>

            </div>
            )
          )}

          {/* ========================================================================= */}
          {/* TAB 2: [ 📖 HỌC ] - ACTIVE RECALL CASCADE (FLASHCARD -> TRẮC NGHIỆM -> GÕ TỪ) */}
          {/* ========================================================================= */}
          {activeTab === 'learn' && (
            currentPartWords.length === 0 ? (
              renderEmptyState()
            ) : (
            <div className="max-w-3xl mx-auto space-y-5 animate-fadeIn">
              
              {isLearnCompleted ? (
                /* CELEBRATION COMPLETION VIEW */
                <div className="rounded-3xl bg-slate-900/95 border-2 border-emerald-500/50 p-8 sm:p-12 text-center space-y-7 shadow-2xl relative overflow-hidden animate-fadeIn">
                  {/* Decorative Background Glows */}
                  <div className="absolute -top-24 -left-24 w-60 h-60 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none" />
                  <div className="absolute -bottom-24 -right-24 w-60 h-60 bg-purple-500/20 rounded-full blur-3xl pointer-events-none" />

                  {/* Big Glowing Trophy */}
                  <div className="relative z-10 mx-auto w-24 h-24 rounded-3xl bg-gradient-to-br from-amber-400 via-emerald-400 to-teal-500 flex items-center justify-center shadow-xl shadow-emerald-500/30 ring-4 ring-emerald-500/20 animate-bounce">
                    <Trophy className="w-12 h-12 text-slate-950" />
                  </div>

                  {/* Title & Topic Details */}
                  <div className="relative z-10 space-y-2">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-mono font-extrabold uppercase tracking-wider">
                      <Sparkles className="w-4 h-4 text-emerald-400" />
                      <span>Hoàn thành bài học</span>
                    </div>

                    <h2 className="text-3xl sm:text-4xl font-extrabold font-heading text-white tracking-tight">
                      Xuất Sắc! Bạn Đã Hoàn Thành Chủ Đề
                    </h2>

                    <p className="text-base text-slate-300 font-medium max-w-lg mx-auto">
                      Chủ đề: <strong className="text-emerald-400">{topic?.title || 'Chủ đề từ vựng'}</strong> 
                      {parts[activePartIndex]?.name ? ` — ${parts[activePartIndex].name}` : ''}
                    </p>
                  </div>

                  {/* 3 Metric Cards */}
                  <div className="relative z-10 grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-xl mx-auto">
                    <div className="p-4 rounded-2xl dark:bg-slate-950/80 bg-slate-50 border dark:border-slate-800 border-slate-200 space-y-1 shadow-sm">
                      <span className="text-[11px] font-mono dark:text-slate-400 text-slate-500 uppercase">Từ đã học</span>
                      <div className="text-2xl font-black font-mono dark:text-white text-slate-900 flex items-center justify-center gap-1.5">
                        <BookOpen className="w-5 h-5 text-emerald-500" />
                        <span>{currentPartWords.length}</span>
                        <span className="text-xs text-slate-400 dark:text-slate-500 font-normal">/ {currentPartWords.length}</span>
                      </div>
                    </div>

                    <div className="p-4 rounded-2xl dark:bg-slate-950/80 bg-slate-50 border dark:border-slate-800 border-slate-200 space-y-1 shadow-sm">
                      <span className="text-[11px] font-mono dark:text-slate-400 text-slate-500 uppercase">XP Tích Lũy</span>
                      <div className="text-2xl font-black font-mono text-amber-500 dark:text-amber-400 flex items-center justify-center gap-1.5">
                        <Zap className="w-5 h-5 fill-current" />
                        <span>+{sessionXp}</span>
                      </div>
                    </div>

                    <div className="p-4 rounded-2xl dark:bg-slate-950/80 bg-slate-50 border dark:border-slate-800 border-slate-200 space-y-1 shadow-sm">
                      <span className="text-[11px] font-mono dark:text-slate-400 text-slate-500 uppercase">Spaced Repetition</span>
                      <div className="text-2xl font-black font-mono text-purple-600 dark:text-purple-400 flex items-center justify-center gap-1.5">
                        <CheckCircle2 className="w-5 h-5" />
                        <span>100%</span>
                      </div>
                    </div>
                  </div>

                  {/* SM-2 Notification */}
                  <div className="relative z-10 p-3.5 rounded-2xl dark:bg-slate-950/70 bg-slate-50 border dark:border-slate-800 border-slate-200 text-xs dark:text-slate-400 text-slate-600 max-w-md mx-auto flex items-center justify-center gap-2 shadow-sm">
                    <Clock className="w-4 h-4 text-sky-500 shrink-0" />
                    <span>Toàn bộ từ đã được lưu vào thuật toán lặp lại ngắt quãng SM-2 để nhắc bạn ôn tập đúng ngày.</span>
                  </div>

                  {/* Auto-redirect Countdown Notice */}
                  {countdown !== null && (
                    <div className="relative z-10 flex items-center justify-center gap-2 text-xs font-mono text-slate-400">
                      <span>Tự động quay lại danh sách sau <strong className="text-emerald-400 text-sm font-bold">{countdown}s</strong>...</span>
                      <button
                        onClick={() => setCountdown(null)}
                        className="text-[11px] text-slate-400 hover:text-white underline ml-1 font-sans cursor-pointer"
                      >
                        [Dừng đếm ngược]
                      </button>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="relative z-10 flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                    {/* Primary Button: Back out to Vocabulary Dashboard */}
                    <button
                      onClick={() => navigate('/vocabulary')}
                      className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-400 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-sm shadow-xl shadow-emerald-500/25 active:scale-95 transition-all flex items-center justify-center gap-2.5"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      <span>Trở về danh sách từ vựng</span>
                    </button>

                    {/* Next Part Button (if available) */}
                    {activePartIndex < parts.length - 1 && (
                      <button
                        onClick={() => {
                          setActivePartIndex(p => p + 1);
                          setLearnIndex(0);
                          setIsLearnCompleted(false);
                          setCountdown(null);
                          setLearnStep('flashcard');
                          setIsLearnFlipped(false);
                          setShowRatingButtons(false);
                        }}
                        className="w-full sm:w-auto px-6 py-4 rounded-2xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-extrabold text-sm shadow-lg shadow-sky-500/20 active:scale-95 transition-all flex items-center justify-center gap-2"
                      >
                        <span>Học Phần {activePartIndex + 2}</span>
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    )}

                    {/* Replay / Review Part */}
                    <button
                      onClick={() => {
                        setSessionCards([...currentPartWords]);
                        setCompletedSet(new Set());
                        setTotalInitialCards(currentPartWords.length);
                        setLearnIndex(0);
                        setIsLearnCompleted(false);
                        setCountdown(null);
                        setLearnStep('flashcard');
                        setIsLearnFlipped(false);
                        setShowRatingButtons(false);
                      }}
                      className="w-full sm:w-auto px-5 py-4 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white font-bold text-sm border border-slate-700 transition-all flex items-center justify-center gap-2"
                    >
                      <RotateCcw className="w-4 h-4" />
                      <span>Học lại phần này</span>
                    </button>

                    {/* Play Mini Games */}
                    <button
                      onClick={() => {
                        setTab('play', { game: 'blast' });
                        initWordBlast();
                      }}
                      className="w-full sm:w-auto px-5 py-4 rounded-2xl bg-purple-950/60 hover:bg-purple-900/60 text-purple-300 hover:text-white font-bold text-sm border border-purple-800/60 transition-all flex items-center justify-center gap-2"
                    >
                      <Gamepad2 className="w-4 h-4" />
                      <span>Chơi Mini Game</span>
                    </button>
                  </div>

                </div>
              ) : (
                <>
                  {/* TOP HEADER STATUS & PROGRESS (MATCHING DAU TOEIC) */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-white font-heading font-extrabold text-sm sm:text-base">
                        <Clock className="w-4 h-4 text-purple-400" />
                        <span>{topic?.title || 'Ôn tập từ vựng'}</span>
                      </div>

                      <div className="flex items-center gap-3 text-xs font-mono">
                        <button
                          onClick={handleResetAllToStart}
                          className="text-slate-400 hover:text-white flex items-center gap-1 hover:underline transition-colors cursor-pointer text-[11px] font-sans"
                          title="Học lại toàn bộ phần này từ đầu"
                        >
                          <RotateCcw className="w-3 h-3 text-slate-400" />
                          <span>Học lại từ đầu</span>
                        </button>
                        <span className="text-amber-400 font-bold flex items-center gap-1">
                          <Zap className="w-3.5 h-3.5 fill-current" />
                          +{sessionXp} XP
                        </span>
                        <span className="text-slate-400 font-bold">
                          {learnedProgressCount}/{currentPartWords.length} từ
                        </span>
                      </div>
                    </div>

                    {/* Progress Bar (Purple Gradient) - Đậu TOEIC Standard */}
                    <div className="h-1.5 w-full bg-slate-900 rounded-full overflow-hidden border border-slate-800">
                      <div 
                        style={{ width: `${Math.min(100, Math.round((learnedProgressCount / Math.max(1, currentPartWords.length)) * 100))}%` }}
                        className="h-full bg-gradient-to-r from-purple-500 via-indigo-500 to-sky-400 rounded-full transition-all duration-300"
                      />
                    </div>

                    {/* Mode Selector Sub-bar matching Đậu TOEIC */}
                    <div className="flex items-center justify-center gap-2 pt-1 pb-1 flex-wrap">
                      <button
                        type="button"
                        onClick={() => {
                          setLearnStep('flashcard');
                          setShowRatingButtons(false);
                        }}
                        className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                          learnStep === 'flashcard' 
                            ? 'bg-sky-500 text-slate-950 font-black shadow-md shadow-sky-500/20' 
                            : 'dark:bg-slate-900/80 bg-slate-100 border dark:border-slate-800 border-slate-200 dark:text-slate-400 text-slate-600 hover:text-white'
                        }`}
                      >
                        <RefreshCw className="w-3 h-3" />
                        <span>Flashcard</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setLearnStep('quiz');
                          setShowRatingButtons(false);
                        }}
                        className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                          learnStep === 'quiz' 
                            ? 'bg-sky-500 text-slate-950 font-black shadow-md shadow-sky-500/20' 
                            : 'dark:bg-slate-900/80 bg-slate-100 border dark:border-slate-800 border-slate-200 dark:text-slate-400 text-slate-600 hover:text-white'
                        }`}
                      >
                        <HelpCircle className="w-3 h-3" />
                        <span>Trắc nghiệm</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setLearnStep('typing');
                          setShowRatingButtons(false);
                        }}
                        className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                          learnStep === 'typing' 
                            ? 'bg-sky-500 text-slate-950 font-black shadow-md shadow-sky-500/20' 
                            : 'dark:bg-slate-900/80 bg-slate-100 border dark:border-slate-800 border-slate-200 dark:text-slate-400 text-slate-600 hover:text-white'
                        }`}
                      >
                        <Edit3 className="w-3 h-3" />
                        <span>Gõ từ</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setLearnStep('pronunciation');
                          setShowRatingButtons(false);
                          setSpeechTranscript('');
                          setSpeechFeedback('idle');
                        }}
                        className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                          learnStep === 'pronunciation' 
                            ? 'bg-sky-500 text-slate-950 font-black shadow-md shadow-sky-500/20' 
                            : 'dark:bg-slate-900/80 bg-slate-100 border dark:border-slate-800 border-slate-200 dark:text-slate-400 text-slate-600 hover:text-white'
                        }`}
                      >
                        <Mic className="w-3 h-3" />
                        <span>Phát âm</span>
                      </button>
                    </div>
                  </div>

                  {/* STEP CONTENT */}
                  <>
                    {/* Helper to render 4 SM-2 Rating Buttons matching Đậu TOEIC 100% */}
                    {(() => {
                      const renderRatingButtons = () => (
                        <div className="space-y-2 animate-fadeIn w-full max-w-xl mx-auto">
                          <div className="grid grid-cols-4 gap-2 sm:gap-3">
                            {/* 1. Học lại (1m) - Red */}
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleRateWord(1);
                              }}
                              className="p-3 rounded-2xl bg-red-500 hover:bg-red-600 text-white font-extrabold flex flex-col items-center justify-center gap-0.5 shadow-md shadow-red-500/20 active:scale-95 transition-all text-xs cursor-pointer"
                            >
                              <span className="text-sm font-bold">Học lại</span>
                              <span className="text-[11px] font-mono opacity-90">{getPreviewIntervalLabel(1, currentLearnWord)}</span>
                            </button>

                            {/* 2. Khó (6h) - Warm Orange */}
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleRateWord(2);
                              }}
                              className="p-3 rounded-2xl dark:bg-amber-950/40 bg-orange-50 hover:bg-orange-100 dark:hover:bg-amber-900/40 border border-orange-200 dark:border-amber-700/60 text-orange-600 dark:text-amber-300 font-extrabold flex flex-col items-center justify-center gap-0.5 shadow-sm active:scale-95 transition-all text-xs cursor-pointer"
                            >
                              <span className="text-sm font-bold">Khó</span>
                              <span className="text-[11px] font-mono opacity-90">{getPreviewIntervalLabel(2, currentLearnWord)}</span>
                            </button>

                            {/* 3. Tốt (1d) - Fresh Green */}
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleRateWord(3);
                              }}
                              className="p-3 rounded-2xl dark:bg-emerald-950/40 bg-green-50 hover:bg-green-100 dark:hover:bg-emerald-900/40 border border-green-200 dark:border-emerald-700/60 text-green-700 dark:text-emerald-300 font-extrabold flex flex-col items-center justify-center gap-0.5 shadow-sm active:scale-95 transition-all text-xs cursor-pointer"
                            >
                              <span className="text-sm font-bold">Tốt</span>
                              <span className="text-[11px] font-mono opacity-90">{getPreviewIntervalLabel(3, currentLearnWord)}</span>
                            </button>

                            {/* 4. Dễ (3d) - Solid Blue */}
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleRateWord(4);
                              }}
                              className="p-3 rounded-2xl bg-blue-500 hover:bg-blue-600 text-white font-extrabold flex flex-col items-center justify-center gap-0.5 shadow-md shadow-blue-500/20 active:scale-95 transition-all text-xs cursor-pointer"
                            >
                              <span className="text-sm font-bold">Dễ</span>
                              <span className="text-[11px] font-mono opacity-90">{getPreviewIntervalLabel(4, currentLearnWord)}</span>
                            </button>
                          </div>

                          <div className="text-center text-[11px] text-slate-400 font-mono">
                            1 · 2 · 3 · 4
                          </div>
                        </div>
                      );

                      return (
                        <>
                          {/* ========================================================================= */}
                          {/* STAGE 1: FLASHCARD MODE */}
                          {/* ========================================================================= */}
                          {learnStep === 'flashcard' && (
                            <div className="space-y-3">
                              {/* The Flashcard */}
                              <div 
                                onClick={() => {
                                  setIsLearnFlipped(prev => !prev);
                                }}
                                className="min-h-[350px] sm:min-h-[380px] rounded-3xl dark:bg-[#0d1424] bg-white border dark:border-slate-800/90 border-slate-200 dark:text-white text-slate-900 shadow-xl p-5 sm:p-6 flex flex-col justify-between transition-all relative cursor-pointer select-none hover:border-sky-500/40"
                              >
                                {/* Top Row: Word Pos + Icons */}
                                <div className="flex items-center justify-between text-xs text-slate-400">
                                  <span className="font-mono text-emerald-400 font-extrabold uppercase tracking-widest text-[11px] sm:text-xs bg-emerald-500/10 px-2.5 py-0.5 rounded-lg border border-emerald-500/20">
                                    {currentLearnWord.pos ? `(${currentLearnWord.pos})` : 'vocabulary'}
                                  </span>

                                  <div className="flex items-center gap-2">
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        toggleMaster(currentLearnWord.word);
                                      }}
                                      className={`p-1.5 rounded-lg dark:bg-slate-900 bg-slate-100 border dark:border-slate-800 border-slate-200 hover:text-emerald-500 transition-colors ${
                                        (learnedWordsSet.has((currentLearnWord.word || '').trim().toLowerCase()) || masteredWords.has(currentLearnWord.word)) ? 'text-emerald-500 font-bold border-emerald-500/40' : 'dark:text-slate-400 text-slate-500'
                                      }`}
                                      title="Đánh dấu đã thuộc"
                                    >
                                      <CheckCheck className="w-3.5 h-3.5" />
                                    </button>
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setAutoPlayAudio(!autoPlayAudio);
                                      }}
                                      className={`p-1.5 rounded-lg dark:bg-slate-900 bg-slate-100 border dark:border-slate-800 border-slate-200 hover:text-slate-900 dark:hover:text-slate-200 transition-colors ${autoPlayAudio ? 'text-sky-500 border-sky-500/40' : 'dark:text-slate-400 text-slate-500'}`}
                                      title="Tự động phát âm"
                                    >
                                      <Settings className="w-3.5 h-3.5" />
                                    </button>
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        alert('Cảm ơn bạn! Đã ghi nhận phản hồi về từ vựng này.');
                                      }}
                                      className="p-1.5 rounded-lg dark:bg-slate-900 bg-slate-100 border dark:border-slate-800 border-slate-200 hover:text-amber-500 dark:text-slate-400 text-slate-500 transition-colors"
                                      title="Báo lỗi từ"
                                    >
                                      <AlertTriangle className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                </div>

                                {/* Middle Content */}
                                <div className="my-auto text-center space-y-3 py-2 w-full max-w-xl mx-auto">
                                  {!isLearnFlipped ? (
                                    /* FRONT OF CARD */
                                    <div className="space-y-3 animate-fadeIn">
                                      <h2 className="text-3xl sm:text-4xl md:text-5xl font-black font-heading dark:text-white text-slate-900 tracking-tight drop-shadow-md py-1">
                                        {currentLearnWord.word}
                                      </h2>

                                      {/* US & UK Pronunciation Rows */}
                                      <div className="flex items-center justify-center gap-3 sm:gap-4 text-xs font-mono">
                                        <button
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            playAudio(currentLearnWord.word, 'en-US');
                                          }}
                                          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-sky-500/15 hover:bg-sky-500/25 text-sky-600 dark:text-sky-300 font-bold border border-sky-500/30 transition-all hover:scale-105 shadow-sm cursor-pointer"
                                        >
                                          <Volume2 className="w-3.5 h-3.5 text-sky-500" />
                                          <span>{getPhoneticUS(currentLearnWord)}</span>
                                        </button>

                                        <button
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            playAudio(currentLearnWord.word, 'en-GB');
                                          }}
                                          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-rose-500/15 hover:bg-rose-500/25 text-rose-600 dark:text-rose-300 font-bold border border-rose-500/30 transition-all hover:scale-105 shadow-sm cursor-pointer"
                                        >
                                          <Volume2 className="w-3.5 h-3.5 text-rose-500" />
                                          <span>{getPhoneticUK(currentLearnWord)}</span>
                                        </button>
                                      </div>

                                      <div className="pt-2">
                                        <p className="text-xs dark:text-slate-400 text-slate-500 font-medium">Nhấn vào thẻ để xem nghĩa</p>
                                        <span className="text-[10px] dark:text-slate-300 text-slate-600 font-mono dark:bg-slate-800 bg-slate-100 px-2 py-0.5 rounded border dark:border-slate-700 border-slate-200 font-bold inline-block mt-1">
                                          Space
                                        </span>
                                      </div>
                                    </div>
                                  ) : (
                                    /* BACK OF CARD */
                                    <div className="space-y-3 animate-fadeIn text-left">
                                      {/* Large Meaning */}
                                      <div className="text-center">
                                        <h3 className="text-3xl sm:text-4xl font-black text-emerald-500 dark:text-emerald-400 drop-shadow-md tracking-tight py-1">
                                          {currentLearnWord.meaning || currentLearnWord.definition || 'Chưa có định nghĩa'}
                                        </h3>
                                      </div>

                                      {/* Example Sentence Box */}
                                      {(currentLearnWord.exampleEn || currentLearnWord.example) && (
                                        <div className="p-3.5 sm:p-4 rounded-xl dark:bg-slate-950/90 bg-slate-50 border dark:border-slate-800 border-slate-200 text-xs sm:text-sm space-y-1.5 shadow-inner">
                                          <div className="flex items-start gap-2.5">
                                            <button 
                                              onClick={(e) => {
                                                e.stopPropagation();
                                                playAudio(currentLearnWord.exampleEn || currentLearnWord.example, 'en-US');
                                              }}
                                              className="text-sky-500 hover:text-sky-600 shrink-0 mt-0.5 cursor-pointer"
                                              title="Nghe câu ví dụ"
                                            >
                                              <Volume2 className="w-4 h-4" />
                                            </button>
                                            <p className="font-bold dark:text-slate-100 text-slate-800 leading-snug text-xs sm:text-sm">
                                              "{currentLearnWord.exampleEn || currentLearnWord.example}"
                                            </p>
                                          </div>
                                          {(currentLearnWord.exampleVi || currentLearnWord.translation || currentLearnWord.example_vi) && (
                                            <p className="dark:text-slate-400 text-slate-500 pl-6 italic text-[11px] sm:text-xs border-l dark:border-slate-700 border-slate-300 ml-1">
                                              ({currentLearnWord.exampleVi || currentLearnWord.translation || currentLearnWord.example_vi})
                                            </p>
                                          )}
                                        </div>
                                      )}

                                      <div className="text-center pt-1">
                                        <span className="text-[11px] dark:text-slate-400 text-slate-500 font-medium">
                                          Nhấn vào thẻ hoặc bấm <span className="font-mono dark:bg-slate-800 bg-slate-100 px-1.5 py-0.5 rounded dark:text-slate-200 text-slate-700 font-bold border dark:border-slate-700 border-slate-200">Space</span> để lật lại
                                        </span>
                                      </div>
                                    </div>
                                  )}
                                </div>
                              </div>

                              {/* Bottom Action Area */}
                              {isLearnFlipped && (
                                <div className="pt-3 border-t dark:border-slate-800/80 border-slate-200 space-y-2">
                                  {!showRatingButtons ? (
                                    <div className="space-y-1.5">
                                      <div className="grid grid-cols-2 gap-3 max-w-md mx-auto">
                                        <button
                                          type="button"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            setShowRatingButtons(true);
                                          }}
                                          className="py-2.5 px-4 rounded-xl border-2 border-emerald-500 hover:bg-emerald-500/20 text-emerald-500 font-bold text-sm flex items-center justify-center gap-2 transition-all active:scale-95 shadow-sm cursor-pointer"
                                        >
                                          <CheckCircle2 className="w-4 h-4" />
                                          <span>Đã thuộc</span>
                                        </button>

                                        <button
                                          type="button"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            handleFlashcardNotRemembered();
                                          }}
                                          className="py-2.5 px-4 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-extrabold text-sm flex items-center justify-center gap-2 transition-all active:scale-95 shadow-md shadow-sky-500/20 cursor-pointer"
                                        >
                                          <span>Chưa nhớ</span>
                                        </button>
                                      </div>

                                      <div className="text-center text-[10px] text-slate-400 font-mono">
                                        Tab: Đã thuộc · Enter: Chưa nhớ · Bấm "Chưa nhớ" để qua chế độ học tiếp theo
                                      </div>
                                    </div>
                                  ) : (
                                    renderRatingButtons()
                                  )}
                                </div>
                              )}
                            </div>
                          )}

                          {/* ========================================================================= */}
                          {/* STAGE 2: TRẮC NGHIỆM (QUIZ) MODE */}
                          {/* ========================================================================= */}
                          {learnStep === 'quiz' && (
                            <div className="space-y-3">
                              <div className="min-h-[350px] sm:min-h-[380px] rounded-3xl dark:bg-[#0d1424] bg-white border dark:border-slate-800/90 border-slate-200 dark:text-white text-slate-900 shadow-xl p-5 sm:p-6 flex flex-col justify-between transition-all">
                                {/* Top Row: Word Pos + Icons */}
                                <div className="flex items-center justify-between text-xs text-slate-400">
                                  <span className="font-mono text-emerald-400 font-extrabold uppercase tracking-widest text-[11px] sm:text-xs bg-emerald-500/10 px-2.5 py-0.5 rounded-lg border border-emerald-500/20">
                                    {currentLearnWord.pos ? `(${currentLearnWord.pos})` : 'vocabulary'}
                                  </span>
                                  <div className="flex items-center gap-2">
                                    <button
                                      onClick={() => toggleMaster(currentLearnWord.word)}
                                      className={`p-1.5 rounded-lg dark:bg-slate-900 bg-slate-100 border dark:border-slate-800 border-slate-200 hover:text-emerald-500 ${masteredWords.has(currentLearnWord.word) ? 'text-emerald-500 font-bold border-emerald-500/40' : 'dark:text-slate-400 text-slate-500'}`}
                                    >
                                      <CheckCheck className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                </div>

                                {/* Word Title & Pronunciation */}
                                <div className="text-center space-y-2 py-1">
                                  <h2 className="text-3xl sm:text-4xl font-black font-heading dark:text-white text-slate-900 tracking-tight drop-shadow-md">
                                    {currentLearnWord.word} {currentLearnWord.pos && <span className="text-base dark:text-slate-400 text-slate-500 font-normal">({currentLearnWord.pos})</span>}
                                  </h2>

                                  <div className="flex items-center justify-center gap-3 sm:gap-4 text-xs font-mono">
                                    <button
                                      onClick={() => playAudio(currentLearnWord.word, 'en-US')}
                                      className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-sky-500/15 text-sky-600 dark:text-sky-300 hover:bg-sky-500/25 border border-sky-500/30 font-bold transition-all shadow-sm cursor-pointer"
                                    >
                                      <Volume2 className="w-3.5 h-3.5 text-sky-500" />
                                      <span>{getPhoneticUS(currentLearnWord)} (US)</span>
                                    </button>

                                    <button
                                      onClick={() => playAudio(currentLearnWord.word, 'en-GB')}
                                      className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/15 text-rose-600 dark:text-rose-300 hover:bg-rose-500/25 border border-rose-500/30 font-bold transition-all shadow-sm cursor-pointer"
                                    >
                                      <Volume2 className="w-3.5 h-3.5 text-rose-500" />
                                      <span>{getPhoneticUK(currentLearnWord)} (UK)</span>
                                    </button>
                                  </div>
                                </div>

                                {/* 4 Multiple Choice Options (Matching Đậu TOEIC) */}
                                <div className="space-y-2 my-1 max-w-xl mx-auto w-full">
                                  {quizOptions.map((opt, idx) => {
                                    const isSelected = selectedQuizAnswer === opt.word;
                                    const isCorrect = opt.word === currentLearnWord.word;

                                    let rowStyle = 'dark:bg-slate-900/80 bg-slate-50 hover:bg-slate-100 dark:hover:bg-slate-800 border dark:border-slate-800 border-slate-200 dark:text-slate-200 text-slate-800';
                                    if (selectedQuizAnswer) {
                                      if (isCorrect) {
                                        rowStyle = 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-200 font-bold border-emerald-500 shadow-sm shadow-emerald-500/20';
                                      } else if (isSelected) {
                                        rowStyle = 'bg-rose-500/20 text-rose-600 dark:text-rose-200 font-bold border-rose-500 shadow-sm shadow-rose-500/20';
                                      }
                                    }

                                    return (
                                      <button
                                        key={idx}
                                        onClick={() => handleQuizSelect(opt)}
                                        disabled={selectedQuizAnswer !== null}
                                        className={`w-full p-2.5 sm:p-3 rounded-xl border text-left text-xs sm:text-sm font-semibold flex items-center justify-between transition-all cursor-pointer ${rowStyle}`}
                                      >
                                        <div className="flex items-center gap-3">
                                          <span className={`w-6 h-6 rounded-lg text-xs font-mono font-bold flex items-center justify-center ${
                                            selectedQuizAnswer && isCorrect ? 'bg-emerald-500 text-slate-950 font-black' : 'dark:bg-slate-800 bg-slate-100 border dark:border-slate-700 border-slate-200 dark:text-slate-400 text-slate-600'
                                          }`}>
                                            {idx + 1}
                                          </span>
                                          <span>{opt.meaning}</span>
                                        </div>
                                        {selectedQuizAnswer && isCorrect && (
                                          <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                                        )}
                                      </button>
                                    );
                                  })}
                                </div>

                                {/* Feedback & Action Buttons */}
                                {selectedQuizAnswer && (
                                  <div className="pt-2 border-t dark:border-slate-800/80 border-slate-200 space-y-2">
                                    {quizFeedback === 'correct' ? (
                                      !showRatingButtons ? (
                                        <div className="space-y-1.5">
                                          <div className="text-center font-bold text-emerald-500 text-sm flex items-center justify-center gap-1.5">
                                            <CheckCircle2 className="w-4 h-4" />
                                            <span>Chính xác!</span>
                                          </div>
                                          <div className="grid grid-cols-2 gap-3 max-w-md mx-auto">
                                            <button
                                              type="button"
                                              onClick={(e) => {
                                                e.stopPropagation();
                                                setShowRatingButtons(true);
                                              }}
                                              className="py-2.5 px-4 rounded-xl border-2 border-emerald-500 hover:bg-emerald-500/20 text-emerald-500 font-bold text-sm flex items-center justify-center gap-2 transition-all active:scale-95 shadow-sm cursor-pointer"
                                            >
                                              <CheckCircle2 className="w-4 h-4" />
                                              <span>Đã thuộc</span>
                                            </button>

                                            <button
                                              type="button"
                                              onClick={(e) => {
                                                e.stopPropagation();
                                                setLearnStep('typing');
                                                setSelectedQuizAnswer(null);
                                                setQuizFeedback('idle');
                                                setTypingInput('');
                                                setTypingFeedback('idle');
                                                setShowTypingHint(false);
                                                setShowRatingButtons(false);
                                              }}
                                              className="py-2.5 px-4 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-extrabold text-sm flex items-center justify-center gap-2 transition-all active:scale-95 shadow-md shadow-sky-500/20 cursor-pointer"
                                            >
                                              <span>Chưa nhớ</span>
                                            </button>
                                          </div>
                                          <div className="text-center text-[10px] text-slate-400 font-mono">
                                            Tab: Đã thuộc · Enter: Chưa nhớ · Bấm "Chưa nhớ" để qua chế độ học tiếp theo
                                          </div>
                                        </div>
                                      ) : (
                                        renderRatingButtons()
                                      )
                                    ) : (
                                      <div className="space-y-2 text-center">
                                        <div className="text-xs text-rose-500 font-bold">
                                          Chưa chính xác! Đáp án đúng: <span className="underline font-bold text-emerald-500">{currentLearnWord.meaning}</span>
                                        </div>
                                        <div className="max-w-xs mx-auto">
                                          <button
                                            type="button"
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              setLearnStep('typing');
                                              setSelectedQuizAnswer(null);
                                              setQuizFeedback('idle');
                                              setTypingInput('');
                                              setTypingFeedback('idle');
                                              setShowTypingHint(false);
                                              setShowRatingButtons(false);
                                            }}
                                            className="w-full py-2 px-4 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-extrabold text-xs flex items-center justify-center gap-1.5 transition-all shadow-md cursor-pointer"
                                          >
                                            <span>Tiếp tục: Gõ từ (Enter)</span>
                                          </button>
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                )}
                              </div>
                            </div>
                          )}

                          {/* ========================================================================= */}
                          {/* STAGE 3: GÕ TỪ (TYPING) MODE */}
                          {/* ========================================================================= */}
                          {learnStep === 'typing' && (
                            <div className="space-y-3">
                              <div className="min-h-[350px] sm:min-h-[380px] rounded-3xl dark:bg-[#0d1424] bg-white border dark:border-slate-800/90 border-slate-200 dark:text-white text-slate-900 shadow-xl p-5 sm:p-6 flex flex-col justify-between transition-all">
                                {/* Pos badge */}
                                <div className="text-center">
                                  <span className="px-3 py-1 rounded-full dark:bg-slate-900 bg-slate-100 border dark:border-slate-800 border-slate-200 dark:text-slate-300 text-slate-700 text-xs font-mono font-bold">
                                    {currentLearnWord.pos ? `(${currentLearnWord.pos})` : 'vocabulary'}
                                  </span>
                                </div>

                                {/* Vietnamese Meaning Prompt */}
                                <div className="text-center space-y-2 py-3 max-w-lg mx-auto">
                                  <h2 className="text-3xl sm:text-4xl font-black dark:text-white text-slate-900 leading-tight">
                                    {currentLearnWord.meaning}
                                  </h2>
                                  {currentLearnWord.exampleVi && (
                                    <p className="text-xs sm:text-sm dark:text-slate-400 text-slate-500 italic">
                                      "{currentLearnWord.exampleVi}"
                                    </p>
                                  )}
                                </div>

                                {/* Input and Actions */}
                                <form onSubmit={handleTypingSubmit} className="space-y-3 max-w-md mx-auto w-full">
                                  <div className="relative">
                                    <input
                                      ref={typingInputRef}
                                      type="text"
                                      value={typingInput}
                                      onChange={(e) => setTypingInput(e.target.value)}
                                      placeholder="Gõ từ tiếng Anh..."
                                      autoFocus
                                      disabled={typingFeedback === 'correct'}
                                      className={`w-full p-3 rounded-xl border-2 text-center text-base font-bold outline-none transition-all ${
                                        typingFeedback === 'correct' 
                                          ? 'border-emerald-500 bg-emerald-500/15 text-emerald-600 dark:text-emerald-300' 
                                          : typingFeedback === 'wrong' 
                                          ? 'border-rose-500 bg-rose-500/15 text-rose-600 dark:text-rose-300' 
                                          : 'dark:border-slate-800 border-slate-300 focus:border-sky-500 dark:bg-slate-950 bg-slate-50 dark:text-white text-slate-900'
                                      }`}
                                    />
                                  </div>

                                  {/* Hint Reveal */}
                                  {showTypingHint && (
                                    <div className="text-center text-xs font-mono text-amber-500 dark:text-amber-400 font-bold">
                                      Gợi ý: {currentLearnWord.word?.slice(0, 2) + '... ' + `(${currentLearnWord.word?.length} chữ cái)`}
                                    </div>
                                  )}

                                  {/* Wrong Feedback */}
                                  {typingFeedback === 'wrong' && (
                                    <div className="text-center text-xs font-bold text-rose-500 dark:text-rose-400">
                                      Đáp án đúng: <span className="font-mono text-sm underline text-emerald-600 dark:text-emerald-400">{currentLearnWord.word}</span>
                                    </div>
                                  )}

                                  {typingFeedback !== 'correct' ? (
                                    <div className="flex items-center gap-2.5 pt-1">
                                      <button
                                        type="button"
                                        onClick={() => setShowTypingHint(!showTypingHint)}
                                        className="px-3 py-2 rounded-xl dark:bg-slate-800 bg-slate-100 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold transition-colors border border-slate-200 dark:border-slate-700/60 cursor-pointer"
                                      >
                                        {showTypingHint ? 'Ẩn gợi ý' : 'Gợi ý'}
                                      </button>

                                      <button
                                        type="button"
                                        onClick={() => {
                                          setLearnStep('pronunciation');
                                          setShowRatingButtons(false);
                                          setSpeechTranscript('');
                                          setSpeechFeedback('idle');
                                        }}
                                        className="px-3 py-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 text-xs font-bold transition-colors cursor-pointer"
                                      >
                                        Bỏ qua
                                      </button>

                                      <button
                                        type="submit"
                                        className="flex-1 py-2.5 px-4 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-black text-xs sm:text-sm shadow-md shadow-sky-500/20 active:scale-95 transition-all cursor-pointer"
                                      >
                                        Kiểm tra (Enter)
                                      </button>
                                    </div>
                                  ) : (
                                    /* Post-correct Actions matching Đậu TOEIC */
                                    <div className="pt-2 border-t dark:border-slate-800/80 border-slate-200 space-y-2 animate-fadeIn">
                                      {!showRatingButtons ? (
                                        <div className="space-y-1.5">
                                          <div className="text-center font-bold text-emerald-500 text-sm flex items-center justify-center gap-1.5">
                                            <CheckCircle2 className="w-4 h-4" />
                                            <span>Chính xác!</span>
                                          </div>
                                          <div className="text-center text-xl font-black text-emerald-500">
                                            {currentLearnWord.word}
                                          </div>
                                          <div className="grid grid-cols-2 gap-3 max-w-md mx-auto">
                                            <button
                                              type="button"
                                              onClick={(e) => {
                                                e.stopPropagation();
                                                setShowRatingButtons(true);
                                              }}
                                              className="py-2.5 px-4 rounded-xl border-2 border-emerald-500 hover:bg-emerald-500/20 text-emerald-500 font-bold text-sm flex items-center justify-center gap-2 transition-all active:scale-95 shadow-sm cursor-pointer"
                                            >
                                              <CheckCircle2 className="w-4 h-4" />
                                              <span>Đã thuộc</span>
                                            </button>

                                            <button
                                              type="button"
                                              onClick={(e) => {
                                                e.stopPropagation();
                                                setLearnStep('pronunciation');
                                                setShowRatingButtons(false);
                                                setSpeechTranscript('');
                                                setSpeechFeedback('idle');
                                              }}
                                              className="py-2.5 px-4 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-extrabold text-sm flex items-center justify-center gap-2 transition-all active:scale-95 shadow-md shadow-sky-500/20 cursor-pointer"
                                            >
                                              <span>Chưa nhớ</span>
                                            </button>
                                          </div>
                                          <div className="text-center text-[10px] text-slate-400 font-mono">
                                            Tab: Đã thuộc · Enter: Chưa nhớ
                                          </div>
                                        </div>
                                      ) : (
                                        renderRatingButtons()
                                      )}
                                    </div>
                                  )}
                                </form>
                              </div>
                            </div>
                          )}

                          {/* ========================================================================= */}
                          {/* STAGE 4: PHÁT ÂM (PRONUNCIATION) MODE */}
                          {/* ========================================================================= */}
                          {learnStep === 'pronunciation' && (
                            <div className="space-y-3">
                              <div className="min-h-[350px] sm:min-h-[380px] rounded-3xl dark:bg-[#0d1424] bg-white border dark:border-slate-800/90 border-slate-200 dark:text-white text-slate-900 shadow-xl p-5 sm:p-6 flex flex-col justify-between transition-all">
                                {/* Top Pos + Title */}
                                <div className="flex items-center justify-between text-xs text-slate-400">
                                  <span className="font-mono text-emerald-400 font-extrabold uppercase tracking-widest text-[11px] sm:text-xs bg-emerald-500/10 px-2.5 py-0.5 rounded-lg border border-emerald-500/20">
                                    {currentLearnWord.pos ? `(${currentLearnWord.pos})` : 'vocabulary'}
                                  </span>
                                  <span className="text-xs font-bold text-sky-500 uppercase tracking-wider">
                                    Phát âm từ này
                                  </span>
                                </div>

                                {/* Target Word & Phonetic */}
                                <div className="text-center space-y-2 py-2 max-w-lg mx-auto">
                                  <h2 className="text-3xl sm:text-4xl font-black text-emerald-500 dark:text-emerald-400 drop-shadow-md">
                                    {currentLearnWord.meaning}
                                  </h2>
                                  <div className="text-2xl font-black dark:text-white text-slate-900">
                                    {currentLearnWord.word}
                                  </div>
                                  <div className="flex items-center justify-center gap-3 text-xs font-mono">
                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        playAudio(currentLearnWord.word, 'en-US');
                                      }}
                                      className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-sky-500/15 text-sky-600 dark:text-sky-300 hover:bg-sky-500/25 border border-sky-500/30 font-bold transition-all shadow-sm cursor-pointer"
                                    >
                                      <Volume2 className="w-3.5 h-3.5 text-sky-500" />
                                      <span>{getPhoneticUS(currentLearnWord)} (US)</span>
                                    </button>
                                  </div>
                                </div>

                                {/* Mic Center Button */}
                                <div className="text-center space-y-3 my-auto">
                                  <button
                                    type="button"
                                    onClick={isListening ? stopSpeechRecognition : startSpeechRecognition}
                                    className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto transition-all shadow-lg active:scale-95 cursor-pointer ${
                                      isListening 
                                        ? 'bg-rose-500 text-white animate-pulse shadow-rose-500/40 ring-4 ring-rose-500/30' 
                                        : 'bg-sky-500 hover:bg-sky-400 text-slate-950 shadow-sky-500/30 hover:scale-105'
                                    }`}
                                    title={isListening ? 'Đang nghe... bấm để dừng' : 'Nhấn để nói'}
                                  >
                                    <Mic className="w-7 h-7" />
                                  </button>

                                  <p className="text-xs font-bold dark:text-slate-300 text-slate-600">
                                    {isListening ? 'Đang nghe... hãy nói từ tiếng Anh' : 'Nhấn để nói'}
                                  </p>

                                  {speechTranscript && (
                                    <div className="text-xs font-mono dark:text-slate-400 text-slate-500">
                                      Bạn vừa nói: <span className="font-bold text-white">"{speechTranscript}"</span>
                                    </div>
                                  )}

                                  {speechFeedback === 'correct' && (
                                    <div className="flex items-center justify-center gap-1.5 text-emerald-500 font-bold text-sm">
                                      <CheckCircle2 className="w-4 h-4" />
                                      <span>Phát âm chuẩn xác!</span>
                                    </div>
                                  )}
                                </div>

                                {/* Actions */}
                                {!showRatingButtons ? (
                                  <div className="pt-3 border-t dark:border-slate-800/80 border-slate-200 flex items-center justify-center gap-3">
                                    <button
                                      type="button"
                                      onClick={() => setShowRatingButtons(true)}
                                      className="py-2.5 px-5 rounded-xl border dark:border-slate-700 border-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-bold transition-all cursor-pointer"
                                    >
                                      Bỏ qua chế độ này
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => setShowRatingButtons(true)}
                                      className="py-2.5 px-6 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs transition-all shadow-md shadow-emerald-500/20 active:scale-95 cursor-pointer"
                                    >
                                      Đã thuộc (Tab)
                                    </button>
                                  </div>
                                ) : (
                                  renderRatingButtons()
                                )}
                              </div>
                            </div>
                          )}

                          {/* ========================================================================= */}
                          {/* BOTTOM HELPER & SESSION STATS MATCHING ĐẬU TOEIC */}
                          {/* ========================================================================= */}
                          <div className="space-y-2 pt-2 text-center select-none">
                            {learnStep === 'quiz' && !selectedQuizAnswer && (
                              <div className="text-[11px] text-slate-400 font-mono">
                                1 · 2 · 3 · 4 để chọn
                              </div>
                            )}

                            {/* Mode indicator X/4 */}
                            <div className="text-xs font-semibold text-slate-400">
                              Chế độ {getStepIndex(learnStep)}/4: <span className="text-sky-400 font-bold">{getStepName(learnStep)}</span>
                            </div>

                            {/* Session stats: Từ mới, Đã học, Ôn tập */}
                            <div className="flex items-center justify-center gap-4 text-xs font-mono pt-1">
                              <span className="text-sky-400">
                                <strong className="font-bold">{newWordsCount}</strong> Từ mới
                              </span>
                              <span className="text-emerald-400">
                                <strong className="font-bold">{learnedProgressCount}</strong> Đã học
                              </span>
                              <span className="text-amber-400">
                                <strong className="font-bold">{dueWordsCount}</strong> Ôn tập
                              </span>
                            </div>
                          </div>
                        </>
                      );
                    })()}
                  </>
                </>
              )}
            </div>
          )
        )}

          {/* ========================================================================= */}
          {/* TAB 3: [ 🎮 CHƠI ] - WORD BLAST (N TỪ KHÔNG LẶP) & WORD MATCH (6 TỪ/ĐỢT) */}
          {/* ========================================================================= */}
          {activeTab === 'play' && (
            currentPartWords.length === 0 ? (
              renderEmptyState()
            ) : (
            <div className="space-y-8 animate-fadeIn">
              
              {/* Game Selector Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-3xl mx-auto">
                <button
                  onClick={() => {
                    setTab('play', { game: 'blast' });
                    initWordBlast();
                  }}
                  className={`p-6 rounded-3xl border text-left space-y-3 transition-all ${
                    activeGame === 'blast'
                      ? 'dark:bg-gradient-to-br dark:from-cyan-950/40 dark:to-slate-900 bg-cyan-50/70 border-cyan-500/50 shadow-xl'
                      : 'dark:bg-slate-900/60 bg-white border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 shadow-sm'
                  }`}
                >
                  <div className="w-10 h-10 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-600 dark:text-cyan-400">
                    <Crosshair className="w-5 h-5" />
                  </div>
                  <h3 className="font-heading font-extrabold text-base dark:text-white text-slate-900">Word Blast</h3>
                  <p className="text-xs dark:text-slate-400 text-slate-500">Bắn pháo laser vũ trụ chọn đúng toàn bộ {currentPartWords.length} từ.</p>
                </button>

                <button
                  onClick={() => {
                    setTab('play', { game: 'match' });
                    initWordMatch(0);
                  }}
                  className={`p-6 rounded-3xl border text-left space-y-3 transition-all ${
                    activeGame === 'match'
                      ? 'dark:bg-gradient-to-br dark:from-purple-950/40 dark:to-slate-900 bg-purple-50/70 border-purple-500/50 shadow-xl'
                      : 'dark:bg-slate-900/60 bg-white border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 shadow-sm'
                  }`}
                >
                  <div className="w-10 h-10 rounded-2xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-600 dark:text-purple-400">
                    <Layers className="w-5 h-5" />
                  </div>
                  <h3 className="font-heading font-extrabold text-base dark:text-white text-slate-900">Word Match</h3>
                  <p className="text-xs dark:text-slate-400 text-slate-500">Ghép thẻ từ tiếng Anh với nghĩa tiếng Việt siêu tốc.</p>
                </button>
              </div>

              {/* GAME 1: WORD BLAST (CYBER LASER SPACE CANNON ARENA) */}
              {activeGame === 'blast' && (
                <div className="relative overflow-hidden rounded-3xl bg-[#070c1d] border border-cyan-500/40 shadow-2xl p-6 sm:p-10 min-h-[500px] flex flex-col justify-between">
                  
                  {/* Space Grid Background */}
                  <div className="absolute inset-0 bg-[radial-gradient(#06b6d4_1px,transparent_1px)] [background-size:24px_24px] opacity-20 pointer-events-none" />

                  {/* Top HUD: Lives, Level, Score, Sound */}
                  <div className="relative z-10 flex items-center justify-between border-b border-slate-800/80 pb-4">
                    <div className="flex items-center gap-1.5">
                      {[1, 2, 3].map((heart) => (
                        <Flame 
                          key={heart} 
                          className={`w-5 h-5 transition-all ${heart <= blastLives ? 'text-rose-500 fill-rose-500 animate-pulse' : 'text-slate-800'}`} 
                        />
                      ))}
                    </div>

                    <div className="text-xs font-mono font-extrabold text-cyan-400 tracking-wider">
                      LVL.0{blastLevel}
                    </div>

                    <div className="flex items-center gap-4">
                      <button
                        onClick={() => setSoundEnabled(!soundEnabled)}
                        className={`p-1.5 rounded-lg border text-xs ${soundEnabled ? 'border-cyan-500/40 text-cyan-400' : 'border-slate-800 text-slate-600'}`}
                        title="Bật/Tắt âm thanh"
                      >
                        {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                      </button>

                      <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-amber-400">
                        <Trophy className="w-4 h-4" />
                        <span>{blastScore}</span>
                      </div>
                    </div>
                  </div>

                  {/* Center Prompt: Vietnamese Target */}
                  <div className="relative z-10 text-center my-6 space-y-2">
                    <span className="text-[10px] font-mono tracking-widest text-cyan-400 uppercase font-bold">
                      &gt; FIND THE WORD
                    </span>
                    <h2 className="text-3xl sm:text-5xl font-extrabold font-heading text-white tracking-wide drop-shadow-lg">
                      {currentBlastWord?.meaning || 'Đang tải mục tiêu...'}
                    </h2>
                  </div>

                  {/* 4 Floating Asteroid Target Bubbles */}
                  <div className="relative z-10 grid grid-cols-2 gap-4 max-w-xl mx-auto my-4 w-full">
                    {blastOptions.map((opt, idx) => {
                      const isTargeted = laserBeam && laserBeam.targetIndex === idx;
                      return (
                        <button
                          key={idx}
                          onClick={() => handleBlastTargetClick(opt, idx)}
                          className={`p-4 sm:p-5 rounded-2xl border font-mono font-bold text-sm sm:text-base transition-all transform hover:scale-105 active:scale-95 shadow-xl ${
                            isTargeted 
                              ? laserBeam.isHit 
                                ? 'bg-emerald-500 text-slate-950 border-emerald-400 scale-110 shadow-emerald-500/50' 
                                : 'bg-rose-500 text-white border-rose-400 scale-95 shadow-rose-500/50'
                              : 'bg-slate-900/90 border-cyan-500/40 text-cyan-100 hover:border-cyan-400 hover:shadow-cyan-500/30'
                          }`}
                        >
                          {opt.word}
                        </button>
                      );
                    })}
                  </div>

                  {/* Bottom Controls: Progress & Laser Cannon Visual */}
                  <div className="relative z-10 flex items-center justify-between pt-4 border-t border-slate-800/80">
                    <div className="text-xs font-mono font-bold text-cyan-400">
                      {Math.min(blastCurrentIndex + 1, blastQueue.length)} / {blastQueue.length} TARGETS
                    </div>

                    <div className="w-14 h-14 rounded-full bg-cyan-500/20 border-2 border-cyan-400 flex items-center justify-center shadow-lg shadow-cyan-500/40 animate-pulse">
                      <Crosshair className="w-7 h-7 text-cyan-300" />
                    </div>

                    <div className="text-xs font-mono text-slate-500">
                      Combo: <span className="text-amber-400 font-bold">x{blastCombo}</span>
                    </div>
                  </div>

                  {/* VICTORY CELEBRATION MODAL (WHEN COMPLETED ALL WORDS) */}
                  {isBlastWon && (
                    <div className="absolute inset-0 bg-slate-950/95 backdrop-blur-md z-30 flex flex-col items-center justify-center p-6 text-center space-y-5 animate-fadeIn">
                      <Sparkles className="w-16 h-16 text-emerald-400 animate-bounce" />
                      <div className="space-y-2">
                        <h3 className="text-3xl sm:text-4xl font-extrabold text-white font-heading">
                          CHIẾN THẮNG XUẤT SẮC!
                        </h3>
                        <p className="text-sm text-slate-300">
                          Bạn đã bắn trúng toàn bộ <strong className="text-emerald-400 font-mono text-base">{blastQueue.length} / {blastQueue.length}</strong> từ vựng của phần này!
                        </p>
                      </div>

                      <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 text-center space-y-1">
                        <span className="text-xs font-mono text-slate-400 uppercase">Tổng Điểm Ván Đấu</span>
                        <div className="text-3xl font-extrabold font-mono text-amber-400">
                          {blastScore} PTS
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                        <button
                          onClick={() => navigate('/vocabulary')}
                          className="px-6 py-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-extrabold text-xs shadow-xl active:scale-95 flex items-center gap-1.5"
                        >
                          <ArrowLeft className="w-4 h-4" />
                          <span>Trở về danh sách</span>
                        </button>

                        <button
                          onClick={initWordBlast}
                          className="px-6 py-3 rounded-2xl bg-slate-900 border border-slate-700 hover:border-slate-500 text-white font-bold text-xs"
                        >
                          Chơi lại phần này ↺
                        </button>

                        {activePartIndex < parts.length - 1 && (
                          <button
                            onClick={() => {
                              setActivePartIndex(p => p + 1);
                              initWordBlast();
                            }}
                            className="px-6 py-3 rounded-2xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-extrabold text-xs shadow-xl active:scale-95 flex items-center gap-1.5"
                          >
                            <span>Sang Phần {activePartIndex + 2}</span>
                            <ArrowRight className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  )}

                  {/* GAME OVER MODAL (WHEN LIVES RUN OUT) */}
                  {isBlastEnded && !isBlastWon && (
                    <div className="absolute inset-0 bg-slate-950/95 backdrop-blur-md z-30 flex flex-col items-center justify-center p-6 text-center space-y-4 animate-fadeIn">
                      <Trophy className="w-14 h-14 text-rose-500 animate-pulse" />
                      <h3 className="text-3xl font-extrabold text-white font-heading">HẾT MẠNG!</h3>
                      <p className="text-sm text-slate-400">Bạn đã hoàn thành <strong className="text-white">{blastCurrentIndex} / {blastQueue.length}</strong> từ.</p>
                      <p className="text-sm font-mono text-cyan-400">Điểm số: <strong className="text-white text-xl">{blastScore}</strong></p>
                      <button
                        onClick={initWordBlast}
                        className="px-8 py-3.5 rounded-2xl bg-gradient-to-r from-cyan-500 to-emerald-500 text-slate-950 font-extrabold text-sm shadow-xl active:scale-95"
                      >
                        Thử lại ngay ↺
                      </button>
                    </div>
                  )}

                </div>
              )}

              {/* GAME 2: WORD MATCH (NỐI THẺ CẶP THEO ĐỢT 6 TỪ) */}
              {activeGame === 'match' && (
                <div className="glass-panel dark:bg-slate-900/90 bg-white rounded-3xl border dark:border-purple-500/30 border-purple-200 shadow-xl p-8 space-y-6 max-w-3xl mx-auto">
                  <div className="flex items-center justify-between border-b dark:border-slate-800 border-slate-200 pb-4">
                    <div className="flex items-center gap-2">
                      <Layers className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                      <h3 className="font-heading font-extrabold text-base dark:text-white text-slate-900">Ghép Cặp Từ Vựng (Đợt {matchBatchIndex + 1})</h3>
                    </div>
                    <span className="text-xs font-mono text-purple-600 dark:text-purple-400 font-bold">
                      Đã ghép: {matchedPairs.length}/{matchCards.length / 2} cặp • Tổng điểm: {matchScore}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {matchCards.map((card) => {
                      const isSelected = selectedCards.find(c => c.id === card.id);
                      const isMatched = matchedPairs.includes(card.pairId);

                      if (isMatched) {
                        return (
                          <div key={card.id} className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 opacity-40 flex items-center justify-center text-xs font-bold text-emerald-600 dark:text-emerald-400 font-mono">
                            ✓ Đã ghép
                          </div>
                        );
                      }

                      return (
                        <button
                          key={card.id}
                          onClick={() => handleCardClick(card)}
                          className={`p-4 rounded-2xl border text-center font-bold text-xs transition-all active:scale-95 min-h-[70px] flex items-center justify-center ${
                            isSelected
                              ? 'bg-purple-500 text-white border-purple-400 shadow-lg shadow-purple-500/30 scale-105'
                              : 'dark:bg-slate-900 bg-slate-50 dark:border-slate-800 border-slate-200 dark:text-slate-200 text-slate-800 hover:border-purple-500/50 shadow-sm'
                          }`}
                        >
                          {card.text}
                        </button>
                      );
                    })}
                  </div>

                  {matchedPairs.length === matchCards.length / 2 && matchCards.length > 0 && (
                    <div className="text-center p-6 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 space-y-3 animate-fadeIn">
                      <Sparkles className="w-8 h-8 text-emerald-400 mx-auto animate-bounce" />
                      <h4 className="font-extrabold text-lg dark:text-white text-slate-900">
                        XUẤT SẮC! BẠN ĐÃ HOÀN THÀNH ĐỢT {matchBatchIndex + 1}
                      </h4>
                      
                      <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                        <button
                          onClick={() => navigate('/vocabulary')}
                          className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-extrabold text-xs flex items-center gap-1.5 shadow-lg active:scale-95"
                        >
                          <ArrowLeft className="w-3.5 h-3.5" />
                          <span>Trở về danh sách</span>
                        </button>

                        {(matchBatchIndex + 1) * 6 < currentPartWords.length ? (
                          <button
                            onClick={() => initWordMatch(matchBatchIndex + 1)}
                            className="px-6 py-2.5 rounded-xl bg-purple-500 hover:bg-purple-400 text-white font-extrabold text-xs flex items-center gap-1.5 shadow-lg active:scale-95"
                          >
                            <span>Ghép 6 từ tiếp theo</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </button>
                        ) : (
                          <button
                            onClick={() => initWordMatch(0)}
                            className="px-6 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs"
                          >
                            Chơi lại từ đầu ↺
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}

            </div>
            )
          )}

        </main>

      </div>
    </div>
  );
}
