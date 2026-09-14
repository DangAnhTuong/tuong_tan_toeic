import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { 
  Volume2, 
  VolumeX, 
  Play, 
  Pause, 
  RotateCcw, 
  Clock, 
  CheckCircle2, 
  X, 
  Sparkles, 
  Award, 
  RefreshCw, 
  Trophy, 
  ChevronLeft, 
  ChevronRight, 
  Send,
  BookOpen,
  Headphones,
  FileText,
  Sliders,
  Check,
  AlertTriangle,
  Radio,
  Layers,
  ShoppingBag,
  Search,
  MessageSquare,
  Star,
  Zap,
  Eye,
  EyeOff,
  Plus,
  Bell,
  Languages,
  CheckSquare,
  Square,
  Bookmark,
  FolderPlus,
  Highlighter,
  FileEdit,
  Layers as LayersIcon,
  HelpCircle,
  Flag,
  Grid,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

import { useDictionary } from '../context/DictionaryContext';
import VocabularyDrawer from '../components/VocabularyDrawer';
import AnnotatorToolbar from '../components/AnnotatorToolbar';
import FlashcardQuickModal from '../components/FlashcardQuickModal';
import FillInBlanksModal from '../components/FillInBlanksModal';
import PersonalNoteModal from '../components/PersonalNoteModal';
import ShareScorecardModal from '../components/ShareScorecardModal';
import { useAuth } from '../context/AuthContext';
import { getStoredUser } from '../utils/auth';
import { translateToeicOption, extractVocabRecommendations } from '../utils/toeicTranslator';
import { 
  addWordToBasket, 
  addWordsToBasket, 
  removeWordFromBasket, 
  getBasketWords,
  getLocalBasketWords 
} from '../services/vocabBasketService';

export default function MockTestRoom() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [searchParams] = useSearchParams();

  const mode = searchParams.get('mode') || 'full'; // 'full' | 'listening' | 'reading' | 'part' | 'custom' | 'practice'
  const partsQuery = searchParams.get('parts'); // e.g. '1' or '1,2' or '5'
  const timeQuery = searchParams.get('time'); // e.g. '6' or '45' or 'unlimited'

  const isPracticeMode = mode === 'practice';

  // Test & Raw Questions State
  const [testData, setTestData] = useState(null);
  const [rawQuestions, setRawQuestions] = useState([]);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [bookmarkedQuestions, setBookmarkedQuestions] = useState(new Set());
  const [loading, setLoading] = useState(true);

  // Grouped Clusters & Current Navigation Index
  const [currentGroupIndex, setCurrentGroupIndex] = useState(0);

  // Practice Mode Feature Toggles & Modals
  const [isBilingualOn, setIsBilingualOn] = useState(false);
  const [isTranslationPanelOpen, setIsTranslationPanelOpen] = useState(false); // Toggle "Dịch nghĩa câu hỏi"
  const [isVocabPanelOpen, setIsVocabPanelOpen] = useState(true); // Toggle "Từ vựng nên học"
  const [showPassageTranslation, setShowPassageTranslation] = useState(false); // Toggle "Bản dịch bài đọc"
  const [hideVocabMeaning, setHideVocabMeaning] = useState(false);
  const [isAutoPlayNext, setIsAutoPlayNext] = useState(false);
  const [isSfxOn, setIsSfxOn] = useState(true);
  const [practiceXp, setPracticeXp] = useState(0);
  
  // Advanced Tools (Annotator, Fill-in-blanks, Flashcards, Notes)
  const [isAnnotatorActive, setIsAnnotatorActive] = useState(false);
  const [annotatorColor, setAnnotatorColor] = useState('yellow');
  const [showFillInBlanks, setShowFillInBlanks] = useState(false);
  const [showFlashcards, setShowFlashcards] = useState(false);
  const [showPersonalNoteModal, setShowPersonalNoteModal] = useState(false);
  const [notes, setNotes] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('tuongtan_practice_notes') || '{}');
    } catch {
      return {};
    }
  });

  // Vocab Bag State
  const [vocabList, setVocabList] = useState(() => {
    try {
      const w1 = JSON.parse(localStorage.getItem('tuongtan_cart_words') || '[]');
      const w2 = JSON.parse(localStorage.getItem('user_vocab_basket') || '[]');
      const w3 = JSON.parse(localStorage.getItem('tuongtan_vocab_basket') || '[]');
      const map = new Map();
      [...w1, ...w2, ...w3].forEach(item => {
        if (item && item.word) map.set(item.word.toLowerCase(), item);
      });
      return Array.from(map.values());
    } catch {
      return [];
    }
  });
  const [selectedVocabToAdd, setSelectedVocabToAdd] = useState(new Set());
  const [showVocabDrawer, setShowVocabDrawer] = useState(false);
  const { 
    openDictionary, 
    closeDictionary, 
    isOpen: isDictModalOpen, 
    isDictEnabled, 
    toggleDictEnabled,
    setDeckContext
  } = useDictionary();

  // Listen for global dictionary additions/deletions to update local cart list & show toast
  useEffect(() => {
    const handleBasketUpdate = (e) => {
      const detail = e?.detail;
      if (detail?.allWords && Array.isArray(detail.allWords)) {
        setVocabList(detail.allWords);
        return;
      }
      if (detail?.removedWord) {
        setVocabList(prev => prev.filter(item => item.word?.toLowerCase() !== detail.removedWord.toLowerCase()));
        return;
      }
      if (detail?.words && Array.isArray(detail.words)) {
        setVocabList(prev => {
          const map = new Map();
          [...prev, ...detail.words].forEach(item => {
            if (item && item.word) map.set(item.word.toLowerCase().trim(), item);
          });
          return Array.from(map.values());
        });
        return;
      }
      const newWord = detail;
      if (newWord && newWord.word) {
        setVocabList(prev => {
          const next = [...prev.filter(item => item.word?.toLowerCase() !== newWord.word.toLowerCase()), newWord];
          return next;
        });
        showToast(`🛒 Đã lưu "${newWord.word}" vào giỏ từ!`);
      }
    };
    window.addEventListener('vocab_basket_updated', handleBasketUpdate);

    // Initial load from synchronized basket
    getBasketWords().then(words => {
      if (words && words.length > 0) setVocabList(words);
    }).catch(() => {});

    return () => window.removeEventListener('vocab_basket_updated', handleBasketUpdate);
  }, []);

  const [showQuestionMatrixDrawer, setShowQuestionMatrixDrawer] = useState(false);
  const [showAiAskModal, setShowAiAskModal] = useState(false);
  const [aiAskAnswer, setAiAskAnswer] = useState('');
  const [aiAskLoading, setAiAskLoading] = useState(false);

  // Exam Mode Question Palette State (Reading: Part 5, 6, 7)
  const [isExamPaletteOpen, setIsExamPaletteOpen] = useState(true);
  const [examPaletteFilter, setExamPaletteFilter] = useState('all'); // 'all' | 'part5' | 'part6' | 'part7' | 'unanswered' | 'marked'

  // Audio Control State
  const audioRef = useRef(null);
  const [isAudioMuted, setIsAudioMuted] = useState(false);
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  const [audioProgress, setAudioProgress] = useState(0);
  const [audioDuration, setAudioDuration] = useState(0);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [autoAdvanceCountdown, setAutoAdvanceCountdown] = useState(null);
  const autoAdvanceTimerRef = useRef(null);
  const countdownIntervalRef = useRef(null);
  const leftColumnRef = useRef(null);
  const rightColumnRef = useRef(null);

  // Auto-scroll questions list, stimulus panel, and window to top whenever navigating to a new question/group
  useEffect(() => {
    const scrollToTop = () => {
      if (rightColumnRef.current) {
        if (typeof rightColumnRef.current.scrollTo === 'function') {
          rightColumnRef.current.scrollTo({ top: 0, behavior: 'smooth' });
        } else {
          rightColumnRef.current.scrollTop = 0;
        }
      }
      if (leftColumnRef.current) {
        if (typeof leftColumnRef.current.scrollTo === 'function') {
          leftColumnRef.current.scrollTo({ top: 0, behavior: 'smooth' });
        } else {
          leftColumnRef.current.scrollTop = 0;
        }
      }
      window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    scrollToTop();
    const timer = setTimeout(scrollToTop, 50);
    return () => clearTimeout(timer);
  }, [currentGroupIndex]);

  // Modals & Submission
  const [showExitModal, setShowExitModal] = useState(false);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [showScorecardModal, setShowScorecardModal] = useState(false);
  const [evaluationResult, setEvaluationResult] = useState(null);
  const [isReviewMode, setIsReviewMode] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);
  const { user } = useAuth() || {};

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  };

  // Timer Calculation
  const calculateInitialTime = () => {
    if (timeQuery && timeQuery !== 'unlimited') {
      return Number(timeQuery) * 60;
    }
    if (timeQuery === 'unlimited') {
      return null;
    }
    if (mode === 'listening') return 45 * 60;
    if (mode === 'reading') return 75 * 60;
    if (mode === 'full') return 120 * 60;
    if (partsQuery) {
      const partTimes = { 1: 6, 2: 12, 3: 15, 4: 12, 5: 15, 6: 15, 7: 45 };
      const totalMins = partsQuery.split(',').reduce((acc, p) => acc + (partTimes[p] || 10), 0);
      return totalMins * 60;
    }
    return 120 * 60;
  };

  const [timeLeft, setTimeLeft] = useState(calculateInitialTime);

  // Load Test from API & Filter by selected parts
  useEffect(() => {
    async function loadTest() {
      try {
        setLoading(true);
        const res = await axios.get(`/api/v1/mocktest/tests/${id}`);
        if (res.data?.data) {
          const t = res.data.data;
          setTestData(t);

          let qs = t.questions || [];
          if (mode === 'listening') {
            qs = qs.filter(q => q.part <= 4);
          } else if (mode === 'reading') {
            qs = qs.filter(q => q.part >= 5);
          } else if (partsQuery) {
            const allowedParts = partsQuery.split(',').map(Number);
            qs = qs.filter(q => allowedParts.includes(q.part));
          }

          setRawQuestions(qs);
          setTimeLeft(calculateInitialTime());
        }
      } catch (err) {
        console.warn('Error loading test room:', err.message);
      } finally {
        setLoading(false);
      }
    }
    loadTest();
  }, [id, mode, partsQuery, timeQuery]);

  // Clean up any legacy mock test resume keys in localStorage
  useEffect(() => {
    try {
      Object.keys(localStorage)
        .filter(k => k.startsWith('tuongtan_mocktest_resume_'))
        .forEach(k => localStorage.removeItem(k));
    } catch (e) {}
  }, []);

  // Group questions into clusters (Single for Part 1/2/5, 3-4 for Part 3/4/6/7)
  const questionGroups = useMemo(() => {
    if (!rawQuestions || rawQuestions.length === 0) return [];
    const groups = [];
    let currentGroup = null;

    for (let i = 0; i < rawQuestions.length; i++) {
      const q = rawQuestions[i];
      const isSingle = q.part === 1 || q.part === 2 || q.part === 5;

      if (isSingle) {
        if (currentGroup) groups.push(currentGroup);
        groups.push({
          id: `single_${q.questionNum}`,
          part: q.part,
          passageText: q.passageText,
          imageUrl: q.imageUrl,
          audioUrl: q.audioUrl,
          questions: [q]
        });
        currentGroup = null;
      } else {
        const shouldMerge = currentGroup && 
          currentGroup.part === q.part && 
          ((currentGroup.audioUrl && currentGroup.audioUrl === q.audioUrl) ||
           (currentGroup.passageText && currentGroup.passageText === q.passageText) ||
           (currentGroup.questions.length < 3 && (q.part === 3 || q.part === 4)) ||
           (currentGroup.questions.length < 4 && q.part === 6));

        if (shouldMerge) {
          currentGroup.questions.push(q);
        } else {
          if (currentGroup) groups.push(currentGroup);
          currentGroup = {
            id: `cluster_${q.questionNum}`,
            part: q.part,
            passageText: q.passageText,
            imageUrl: q.imageUrl,
            audioUrl: q.audioUrl,
            questions: [q]
          };
        }
      }
    }
    if (currentGroup) groups.push(currentGroup);
    return groups;
  }, [rawQuestions]);

  const handleResetMockTestProgress = () => {
    if (window.confirm('Bạn có muốn làm lại bài thi từ đầu không? Toàn bộ đáp án đã chọn sẽ được thiết lập lại.')) {
      setCurrentGroupIndex(0);
      setSelectedAnswers({});
      setPracticeXp(0);
      setBookmarkedQuestions(new Set());
      setTimeLeft(calculateInitialTime());
      showToast('Đã làm lại từ đầu! ↺');
    }
  };

  const currentGroup = questionGroups[currentGroupIndex] || questionGroups[0];
  const isCurrentListeningSection = currentGroup?.part <= 4;

  const currentPartNum = currentGroup?.part || currentGroup?.questions?.[0]?.part || (isCurrentListeningSection ? '1' : '5');
  const currentTestTitle = testData?.title ? testData.title.replace(/—.*/, '').trim() : 'ETS TOEIC';
  const currentDeckName = `Part ${currentPartNum} ${currentTestTitle}`;

  // Sync contextual deck name with global DictionaryContext
  useEffect(() => {
    if (setDeckContext && currentDeckName) {
      setDeckContext(currentDeckName);
    }
  }, [setDeckContext, currentDeckName]);

  // Realtime Accuracy & Answered Count
  const answeredCount = useMemo(() => Object.keys(selectedAnswers).length, [selectedAnswers]);

  const correctAnswersCount = useMemo(() => {
    if (!rawQuestions) return 0;
    return rawQuestions.reduce((acc, q) => {
      const userAns = selectedAnswers[q.questionNum];
      if (userAns && String(userAns).toUpperCase() === String(q.correctAnswer).toUpperCase()) {
        return acc + 1;
      }
      return acc;
    }, 0);
  }, [rawQuestions, selectedAnswers]);

  // Reading Section Questions & Palette Computations
  const readingQuestions = useMemo(() => {
    if (!rawQuestions) return [];
    return rawQuestions.filter(q => q.part >= 5);
  }, [rawQuestions]);

  const p5Questions = useMemo(() => readingQuestions.filter(q => q.part === 5), [readingQuestions]);
  const p6Questions = useMemo(() => readingQuestions.filter(q => q.part === 6), [readingQuestions]);
  const p7Questions = useMemo(() => readingQuestions.filter(q => q.part === 7), [readingQuestions]);

  const readingAnsweredCount = useMemo(() => {
    return readingQuestions.filter(q => selectedAnswers[q.questionNum] !== undefined).length;
  }, [readingQuestions, selectedAnswers]);

  const readingMarkedCount = useMemo(() => {
    return readingQuestions.filter(q => bookmarkedQuestions.has(q.questionNum)).length;
  }, [readingQuestions, bookmarkedQuestions]);

  const readingUnansweredCount = readingQuestions.length - readingAnsweredCount;

  const filteredPaletteQuestions = useMemo(() => {
    if (examPaletteFilter === 'part5') return p5Questions;
    if (examPaletteFilter === 'part6') return p6Questions;
    if (examPaletteFilter === 'part7') return p7Questions;
    if (examPaletteFilter === 'unanswered') return readingQuestions.filter(q => !selectedAnswers[q.questionNum]);
    if (examPaletteFilter === 'marked') return readingQuestions.filter(q => bookmarkedQuestions.has(q.questionNum));
    return readingQuestions;
  }, [examPaletteFilter, readingQuestions, p5Questions, p6Questions, p7Questions, selectedAnswers, bookmarkedQuestions]);

  // Timer countdown for Exam Mode
  useEffect(() => {
    if (timeLeft === null || timeLeft <= 0 || isReviewMode || evaluationResult) return;

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          handleSubmitTest();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, isReviewMode, evaluationResult]);

  // Format Time (e.g. 00:14:50 or 00:05:32)
  const formatTime = (seconds) => {
    if (seconds === null) return 'Không giới hạn';
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    if (h > 0) {
      return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
    }
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  // Audio Playback & Auto-Advance Engine
  useEffect(() => {
    if (autoAdvanceTimerRef.current) clearTimeout(autoAdvanceTimerRef.current);
    if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
    setAutoAdvanceCountdown(null);

    if (audioRef.current && currentGroup?.audioUrl) {
      audioRef.current.currentTime = 0;
      audioRef.current.playbackRate = playbackSpeed;
      
      const playPromise = audioRef.current.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => setIsAudioPlaying(true))
          .catch(() => setIsAudioPlaying(false));
      }
    } else {
      setIsAudioPlaying(false);
    }

    return () => {
      if (autoAdvanceTimerRef.current) clearTimeout(autoAdvanceTimerRef.current);
      if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
    };
  }, [currentGroupIndex, currentGroup?.audioUrl, playbackSpeed]);

  const handleAudioEnded = () => {
    setIsAudioPlaying(false);
    
    // In Exam Mode for Listening: strictly auto-advance after standard pause (IIG standard)
    if (!isPracticeMode && !isReviewMode && isCurrentListeningSection) {
      const waitSeconds = (currentGroup?.part === 1 || currentGroup?.part === 2) ? 5 : 8;
      setAutoAdvanceCountdown(waitSeconds);

      countdownIntervalRef.current = setInterval(() => {
        setAutoAdvanceCountdown(prev => {
          if (prev <= 1) {
            clearInterval(countdownIntervalRef.current);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      autoAdvanceTimerRef.current = setTimeout(() => {
        if (currentGroupIndex < questionGroups.length - 1) {
          setCurrentGroupIndex(prev => prev + 1);
        }
      }, waitSeconds * 1000);
    }

    // In Practice Mode if Auto Play Next is enabled:
    if (isPracticeMode && isAutoPlayNext) {
      setTimeout(() => {
        if (currentGroupIndex < questionGroups.length - 1) {
          setCurrentGroupIndex(prev => prev + 1);
        }
      }, 2000);
    }
  };

  const handleAudioTimeUpdate = () => {
    if (audioRef.current) {
      setAudioProgress(audioRef.current.currentTime);
      setAudioDuration(audioRef.current.duration || 0);
    }
  };

  const toggleAudioPlay = () => {
    if (!audioRef.current) return;
    if (isAudioPlaying) {
      audioRef.current.pause();
      setIsAudioPlaying(false);
    } else {
      audioRef.current.play();
      setIsAudioPlaying(true);
    }
  };

  const rewindAudio = (sec = 3) => {
    if (audioRef.current) {
      audioRef.current.currentTime = Math.max(0, audioRef.current.currentTime - sec);
    }
  };

  const forwardAudio = (sec = 5) => {
    if (audioRef.current) {
      audioRef.current.currentTime = Math.min(audioDuration, audioRef.current.currentTime + sec);
    }
  };

  // Keyboard Shortcuts in Practice Mode
  useEffect(() => {
    if (!isPracticeMode) return;

    const handleKeyDown = (e) => {
      if (['INPUT', 'TEXTAREA'].includes(document.activeElement?.tagName)) return;

      if (e.ctrlKey || e.key === 'Control') {
        toggleAudioPlay();
      } else if (e.shiftKey || e.key === 'Shift') {
        rewindAudio(3);
      } else if (['1', '2', '3', '4'].includes(e.key)) {
        const letters = ['A', 'B', 'C', 'D'];
        const chosenLetter = letters[Number(e.key) - 1];
        if (currentGroup?.questions?.[0]) {
          handleSelectOption(currentGroup.questions[0].questionNum, chosenLetter);
        }
      } else if (e.key === 'ArrowLeft' && currentGroupIndex > 0) {
        setCurrentGroupIndex(prev => prev - 1);
      } else if (e.key === 'ArrowRight' && currentGroupIndex < questionGroups.length - 1) {
        setCurrentGroupIndex(prev => prev + 1);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentGroupIndex, questionGroups.length, isPracticeMode, currentGroup]);

  // Handle Option Select
  const handleSelectOption = (questionNum, optionLabel) => {
    if (isReviewMode) return;
    const cleanLabel = optionLabel.replace(/[()]/g, '').trim().toUpperCase();
    const wasAlreadyAnswered = Boolean(selectedAnswers[questionNum]);
    
    const nextAnswers = {
      ...selectedAnswers,
      [questionNum]: cleanLabel
    };
    setSelectedAnswers(nextAnswers);

    let nextXp = practiceXp;
    if (isPracticeMode && !wasAlreadyAnswered) {
      const qObj = rawQuestions.find(q => q.questionNum === questionNum);
      if (qObj && String(cleanLabel).toUpperCase() === String(qObj.correctAnswer).toUpperCase()) {
        nextXp = practiceXp + 5;
        setPracticeXp(nextXp);
        showToast('🎉 +5 XP! Đáp án chính xác!');
      } else if (qObj) {
        // Auto-record wrong answer to Sổ Tay Câu Sai
        const letters = ['A', 'B', 'C', 'D'];
        const userIdx = letters.indexOf(cleanLabel);
        const correctIdx = letters.indexOf(String(qObj.correctAnswer).toUpperCase());
        axios.post('/api/v1/mistakes', {
          questionId: `mock_${testData?._id || id}_q${questionNum}`,
          part: qObj.part || 5,
          section: qObj.part <= 4 ? 'LISTENING' : 'READING',
          prompt: qObj.prompt || `Câu hỏi ${questionNum} (Part ${qObj.part})`,
          passageText: qObj.passageText || currentGroup?.passageText || qObj.prompt,
          options: (qObj.options || []).map(o => ({ label: o.label, text: o.text || o.label })),
          correctAnswer: correctIdx >= 0 ? correctIdx : 0,
          userAnswer: userIdx >= 0 ? userIdx : 0,
          explanation: qObj.explanation || '',
          translation: qObj.translation || qObj.dichNghia || '',
          categoryTag: `Part ${qObj.part} Mock Test`
        }).catch(() => {});
      }
    }
  };

  // Toggle Bookmark
  const toggleBookmark = (qNum) => {
    setBookmarkedQuestions(prev => {
      const next = new Set(prev);
      if (next.has(qNum)) {
        next.delete(qNum);
        showToast(`Đã bỏ đánh dấu Câu ${qNum}`);
      } else {
        next.add(qNum);
        showToast(`⭐ Đã lưu đánh dấu Câu ${qNum}`);
      }
      return next;
    });
  };

  // TTS Pronunciation Helper (US & UK)
  const playWordAudio = (word, lang = 'en-US') => {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(word);
    u.lang = lang;
    u.rate = 0.9;
    window.speechSynthesis.speak(u);
  };

  // Vocabulary Recommendations (Direct from DB question or smart TOEIC vocabulary extractor)
  const currentVocabRecommendations = useMemo(() => {
    if (!currentGroup) return [];
    return extractVocabRecommendations(currentGroup);
  }, [currentGroup]);

  // Authentic Vietnamese translation mapping for current question choices (100% Vietnamese, NO English prefixes)
  const getQuestionChoiceTranslations = (q) => {
    if (!q) return {};
    const map = {};
    const rawMap = {};

    const hasVietnameseMarks = (str) => /[àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ]/i.test(str || '');

    // 1. Direct from option object if populated with real Vietnamese
    if (q.options) {
      q.options.forEach(opt => {
        const clean = opt.label?.replace(/[()]/g, '').trim().toUpperCase();
        const rawText = (opt.text || '').trim();
        const trans = (opt.vietnamese || opt.translation || '').trim();

        if (clean) {
          rawMap[clean] = rawText;
          if (trans && trans.toLowerCase() !== rawText.toLowerCase() && !/mymemory/i.test(trans) && !/^Người\s+[a-zA-Z]/i.test(trans)) {
            map[clean] = trans;
          }
        }
      });
    }

    // 2. Parsed from q.dichNghia if available
    if (q.dichNghia) {
      const lines = q.dichNghia.split('\n').map(l => l.trim()).filter(Boolean);
      for (const line of lines) {
        const match = line.match(/^[\(\[]?([A-D])[\.\)\]]\s*(.+)/i);
        if (match) {
          const key = match[1].toUpperCase();
          const val = match[2].trim();
          if (hasVietnameseMarks(val) || !map[key]) {
            map[key] = val;
          }
        }
      }
    }

    // 3. Fallback to raw text or label
    return {
      'A': map['A'] || rawMap['A'] || 'Lựa chọn (A)',
      'B': map['B'] || rawMap['B'] || 'Lựa chọn (B)',
      'C': map['C'] || rawMap['C'] || 'Lựa chọn (C)',
      'D': map['D'] || rawMap['D'] || 'Lựa chọn (D)'
    };
  };

  // Vocab Basket Handlers
  const handleAddSelectedVocabToBag = async () => {
    const wordsToAdd = currentVocabRecommendations.filter(v => selectedVocabToAdd.has(v.word));
    if (wordsToAdd.length === 0) {
      showToast('Vui lòng chọn ít nhất 1 từ để thêm');
      return;
    }

    const updated = await addWordsToBasket(wordsToAdd, currentDeckName, 'mock_test');
    if (updated && Array.isArray(updated)) {
      setVocabList(updated);
    }
    setSelectedVocabToAdd(new Set());
    showToast(`🛒 Đã thêm ${wordsToAdd.length} từ vào học phần "${currentDeckName}"!`);
  };

  const handleSelectAllVocab = () => {
    if (selectedVocabToAdd.size === currentVocabRecommendations.length) {
      setSelectedVocabToAdd(new Set());
    } else {
      setSelectedVocabToAdd(new Set(currentVocabRecommendations.map(v => v.word)));
    }
  };

  const handleDeleteVocabFromBag = async (index) => {
    const target = vocabList[index];
    if (target?.word) {
      await removeWordFromBasket(target.word);
    }
    const nextList = vocabList.filter((_, i) => i !== index);
    setVocabList(nextList);
    showToast('Đã xóa từ khỏi giỏ');
  };


  // Save Note Handler
  const handleSaveNote = (text) => {
    if (!currentGroup?.questions?.[0]) return;
    const qNum = currentGroup.questions[0].questionNum;
    const nextNotes = { ...notes, [qNum]: text };
    setNotes(nextNotes);
    localStorage.setItem('tuongtan_practice_notes', JSON.stringify(nextNotes));
    showToast('📝 Đã lưu ghi chú thành công!');
    setShowPersonalNoteModal(false);
  };

  // AI Ask Tutor Handler
  const handleAskAi = async () => {
    setShowAiAskModal(true);
    setAiAskLoading(true);
    try {
      const q = currentGroup?.questions?.[0];
      const res = await axios.post('/api/v1/speaking/evaluate', {
        type: 'grammar_help',
        prompt: `Giải thích câu hỏi TOEIC: ${q?.prompt || 'Part 1'} - Đáp án đúng: ${q?.correctAnswer}.`
      });
      setAiAskAnswer(res.data?.feedback || q?.explanation || 'Đáp án này chính xác vì miêu tả đúng hành động trong hình ảnh/bài đọc.');
    } catch (e) {
      setAiAskAnswer(currentGroup?.questions?.[0]?.explanation || 'Đây là câu hỏi kiểm tra kỹ năng nghe hiểu và ngữ cảnh bài thi TOEIC.');
    } finally {
      setAiAskLoading(false);
    }
  };

  // Submit test and evaluate
  const handleSubmitTest = async () => {
    setShowSubmitModal(false);
    try {
      setLoading(true);
      const totalAllocatedSec = (timeQuery && timeQuery !== 'unlimited' ? Number(timeQuery) * 60 : 7200);
      const res = await axios.post('/api/v1/mocktest/submit', {
        testId: id,
        answers: selectedAnswers,
        timeSpentSeconds: totalAllocatedSec - (timeLeft || 0),
        mode: mode,
        selectedParts: partsQuery
      });

      if (res.data?.data) {
        setEvaluationResult(res.data.data);
        
        try {
          await axios.post('/api/v1/user/record-progress', { 
            type: 'mockTest', 
            count: Math.max(1, answeredCount) 
          });
        } catch (e) {}

        try {
          const currentHist = JSON.parse(localStorage.getItem('tuongtan_mocktest_history') || '[]');
          const newRecord = {
            testId: id,
            testTitle: testData?.title || 'Đề thi TOEIC',
            date: new Date().toLocaleDateString('vi-VN'),
            listeningScore: res.data.data.listeningScore,
            readingScore: res.data.data.readingScore,
            totalScore: res.data.data.totalScore
          };
          localStorage.setItem('tuongtan_mocktest_history', JSON.stringify([newRecord, ...currentHist]));
        } catch (e) {}
      }
    } catch (err) {
      console.warn('Submit error:', err.message);
    } finally {
      setLoading(false);
    }
  };

  // Top Title Helper for Exam Mode
  const getHeaderCenterTitle = () => {
    if (!currentGroup || !currentGroup.questions || currentGroup.questions.length === 0) {
      return 'TOEIC Test Room';
    }

    const isListening = currentGroup.part <= 4;
    const sectionName = isListening ? 'Listening' : 'Reading';
    const firstQ = currentGroup.questions[0].questionNum;
    const lastQ = currentGroup.questions[currentGroup.questions.length - 1].questionNum;
    const qRange = firstQ === lastQ ? `Question ${firstQ}` : `Questions ${firstQ} - ${lastQ}`;

    if (mode === 'part') {
      return `Part ${currentGroup.part} (${sectionName}): ${qRange}`;
    }
    if (mode === 'listening') {
      return `Listening: ${qRange} of 100`;
    }
    if (mode === 'reading') {
      return `Reading: ${qRange} of 100`;
    }
    if (rawQuestions.length === 200) {
      return `${sectionName}: ${qRange} of 100`;
    }
    return `${sectionName}: ${qRange} of ${rawQuestions.length}`;
  };

  // Direction Helper
  const getDirectionText = (part) => {
    switch (part) {
      case 1:
        return 'Select the one statement that best describes what you see in the picture.';
      case 2:
        return 'Select the best response to the question or statement.';
      case 3:
      case 4:
        return 'Select the best response to each question.';
      case 5:
        return 'Select the best answer to complete the sentence.';
      case 6:
      case 7:
        return 'Read the passage and select the best answer for each question.';
      default:
        return 'Select the best response to each question.';
    }
  };

  const handleConfirmExit = () => {
    setShowExitModal(false);
    navigate('/tests');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#070b14] text-white flex items-center justify-center font-mono">
        <div className="flex items-center gap-3 text-sky-400">
          <RefreshCw className="w-5 h-5 animate-spin" />
          <span>Đang nạp phòng thi ETS...</span>
        </div>
      </div>
    );
  }

  return (
    <div 
      data-deck-name={currentDeckName}
      className="h-screen w-screen dark:bg-[#070b14] bg-[#f8fafc] dark:text-slate-100 text-slate-900 flex flex-col font-sans overflow-hidden"
    >
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-2xl bg-sky-500 text-slate-950 font-bold text-xs shadow-2xl animate-fadeIn flex items-center gap-2">
          <Sparkles className="w-4 h-4" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Hidden Native Audio Element */}
      {currentGroup?.audioUrl && (
        <audio 
          ref={audioRef}
          src={currentGroup.audioUrl}
          muted={isAudioMuted}
          onEnded={handleAudioEnded}
          onTimeUpdate={handleAudioTimeUpdate}
        />
      )}

      {/* ========================================================================= */}
      {/* 1. TOP HEADER (EXAM MODE OR PRACTICE MODE) */}
      {/* ========================================================================= */}
      <header className="h-14 dark:bg-[#0d1424] bg-white border-b dark:border-slate-800/90 border-slate-200/90 dark:text-white text-slate-900 px-4 sm:px-6 flex items-center justify-between shadow-sm shrink-0 z-30">
        {/* Left: Brand & Back */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <button
            onClick={() => setShowExitModal(true)}
            className="flex items-center gap-1.5 dark:bg-slate-800/80 bg-slate-100 hover:bg-rose-500/20 hover:text-rose-500 px-3 py-1.5 rounded-xl text-xs font-bold dark:text-slate-300 text-slate-700 transition-colors border dark:border-slate-700/60 border-slate-200"
            title="Thoát phòng"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Thoát</span>
          </button>

          <div className="hidden sm:flex items-center gap-2 px-2.5 py-1 rounded-xl dark:bg-slate-900 bg-slate-100 border dark:border-slate-800 border-slate-200 text-xs font-bold dark:text-slate-200 text-slate-800">
            <div className="w-5 h-5 rounded-lg bg-amber-400 flex items-center justify-center text-slate-950 font-black text-[10px]">
              TT
            </div>
            <span className="font-heading font-extrabold text-xs text-sky-600 dark:text-sky-400 truncate max-w-[140px]">
              {testData?.title?.replace(/ETS TOEIC\s*\d*\s*—\s*/i, '') || 'Test Practice'}
            </span>
          </div>
        </div>

        {/* Center: Exam Mode Title VS Practice Mode Tool Pills */}
        {!isPracticeMode ? (
          /* PURE EXAM MODE CENTER TITLE ("Listening: Questions 1 of 6") */
          <div className="text-sm sm:text-base font-bold font-heading dark:text-white text-slate-900 tracking-tight text-center truncate px-2">
            {getHeaderCenterTitle()}
          </div>
        ) : (
          /* PRACTICE MODE TOOLBAR PILLS MATCHING DAU TOEIC */
          <div className="flex items-center gap-1 sm:gap-1.5 shrink-0 px-1 overflow-x-auto scrollbar-none">
            {/* 1. Song ngữ 👑 */}
            <button
              onClick={() => {
                setIsBilingualOn(prev => !prev);
                showToast(isBilingualOn ? 'Đã tắt Song ngữ' : 'Đã bật Song ngữ Anh - Việt 👑');
              }}
              className={`px-2.5 py-1 rounded-xl text-[11px] font-bold flex items-center gap-1 transition-all border ${
                isBilingualOn 
                  ? 'bg-amber-500/15 border-amber-500/40 text-amber-700 dark:text-amber-300' 
                  : 'dark:bg-slate-900 bg-slate-100 dark:border-slate-800 border-slate-200 dark:text-slate-400 text-slate-600 hover:dark:text-white hover:text-slate-900'
              }`}
              title="Chế độ song ngữ Anh - Việt"
            >
              <Languages className="w-3.5 h-3.5" />
              <span>Song ngữ</span>
              <span className="text-[10px]">👑</span>
            </button>

            {/* 2. Ghi chú */}
            <button
              onClick={() => setShowPersonalNoteModal(true)}
              className="px-2.5 py-1 rounded-xl text-[11px] font-bold flex items-center gap-1 dark:bg-slate-900 bg-slate-100 border dark:border-slate-800 border-slate-200 dark:text-slate-300 text-slate-700 hover:dark:text-white hover:text-slate-900 transition-all"
              title="Ghi chú cá nhân"
            >
              <FileText className="w-3.5 h-3.5 text-sky-500" />
              <span>Ghi chú</span>
            </button>

            {/* 3. Annotator (Bút dạ quang) */}
            <button
              onClick={() => {
                setIsAnnotatorActive(prev => !prev);
                showToast(isAnnotatorActive ? 'Đã tắt Annotator' : 'Đã bật Annotator (Bút dạ quang) ✏️');
              }}
              className={`px-2.5 py-1 rounded-xl text-[11px] font-bold flex items-center gap-1 transition-all border ${
                isAnnotatorActive 
                  ? 'bg-sky-500/20 border-sky-400 text-sky-700 dark:text-sky-300 shadow-md shadow-sky-500/10' 
                  : 'dark:bg-slate-900 bg-slate-100 dark:border-slate-800 border-slate-200 dark:text-slate-400 text-slate-600 hover:dark:text-white hover:text-slate-900'
              }`}
              title="Bút dạ quang Annotator"
            >
              <Highlighter className="w-3.5 h-3.5" />
              <span>Annotator</span>
            </button>

            {/* 4. Điền từ (Dictation Fill-in-blanks) */}
            <button
              onClick={() => setShowFillInBlanks(true)}
              className="px-2.5 py-1 rounded-xl text-[11px] font-bold flex items-center gap-1 dark:bg-slate-900 bg-slate-100 border dark:border-slate-800 border-slate-200 dark:text-slate-300 text-slate-700 hover:text-sky-500 transition-all"
              title="Luyện gõ điền từ"
            >
              <FileEdit className="w-3.5 h-3.5 text-emerald-500" />
              <span>Điền từ</span>
            </button>

            {/* 5. Lật từ (Flashcards) */}
            <button
              onClick={() => setShowFlashcards(true)}
              className="px-2.5 py-1 rounded-xl text-[11px] font-bold flex items-center gap-1 dark:bg-slate-900 bg-slate-100 border dark:border-slate-800 border-slate-200 dark:text-slate-300 text-slate-700 hover:text-amber-500 transition-all"
              title="Lật thẻ từ vựng Flashcard"
            >
              <BookOpen className="w-3.5 h-3.5 text-amber-500" />
              <span>Lật từ</span>
            </button>

            {/* 6. Auto */}
            <button
              onClick={() => {
                setIsAutoPlayNext(prev => !prev);
                showToast(isAutoPlayNext ? 'Đã tắt tự động chuyển câu' : 'Đã bật tự động chuyển câu');
              }}
              className={`px-2 py-1 rounded-xl text-[11px] font-bold flex items-center gap-1 transition-all border ${
                isAutoPlayNext 
                  ? 'bg-sky-500/20 border-sky-500 text-sky-700 dark:text-sky-300' 
                  : 'dark:bg-slate-900 bg-slate-100 dark:border-slate-800 border-slate-200 dark:text-slate-400 text-slate-600 hover:dark:text-white hover:text-slate-900'
              }`}
              title="Tự động phát tiếp"
            >
              <Volume2 className="w-3.5 h-3.5" />
              <span>Auto</span>
            </button>

            {/* 7. SFX */}
            <button
              onClick={() => setIsSfxOn(prev => !prev)}
              className={`p-1.5 rounded-xl transition-all border ${
                isSfxOn ? 'dark:bg-slate-800 bg-slate-200 dark:border-slate-700 border-slate-300 text-amber-500' : 'dark:bg-slate-900 bg-slate-100 dark:border-slate-800 border-slate-200 text-slate-400'
              }`}
              title="Hiệu ứng âm thanh SFX"
            >
              <Bell className="w-3.5 h-3.5" />
            </button>

            {/* 8. XP */}
            <div className="px-2.5 py-1 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-600 dark:text-amber-400 text-xs font-mono font-extrabold flex items-center gap-1">
              <Zap className="w-3.5 h-3.5 fill-current" />
              <span>{practiceXp}</span>
            </div>

            {/* 9. Đúng/Tổng */}
            <div className="px-2.5 py-1 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs font-mono font-bold flex items-center gap-1">
              <Check className="w-3 h-3 stroke-[3]" />
              <span>{correctAnswersCount}/{answeredCount}</span>
            </div>

            {/* Nút Làm lại bài thi */}
            <button
              onClick={handleResetMockTestProgress}
              className="px-2.5 py-1 rounded-xl text-[11px] font-bold flex items-center gap-1 text-slate-500 hover:text-rose-500 dark:hover:text-rose-400 hover:bg-rose-500/10 transition-all border dark:border-slate-800 border-slate-200 cursor-pointer"
              title="Làm lại bài từ câu đầu tiên (Reset tiến độ)"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Làm lại</span>
            </button>

            {/* 10. Câu X/Y */}
            <button
              onClick={() => setShowQuestionMatrixDrawer(true)}
              className="px-2.5 py-1 rounded-xl dark:bg-slate-900 bg-slate-100 border dark:border-slate-800 border-slate-200 dark:text-slate-300 text-slate-700 hover:border-sky-500 text-xs font-mono font-bold transition-all"
            >
              Câu {currentGroupIndex + 1}/{questionGroups.length}
            </button>
          </div>
        )}

        {/* Right: Controls & Badges */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          
          {/* Mute/Unmute Toggle */}
          <button
            onClick={() => setIsAudioMuted(prev => !prev)}
            className={`p-2 rounded-full transition-colors ${
              isAudioMuted 
                ? 'bg-rose-500/20 text-rose-400' 
                : 'bg-sky-500 text-slate-950 hover:bg-sky-400'
            }`}
            title={isAudioMuted ? 'Bật âm thanh' : 'Tắt âm thanh'}
          >
            {isAudioMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>

          {/* Exam Mode Badges: [ 0/6 ] [ ⏱ 00:05:55 ] */}
          {!isPracticeMode && (
            <>
              <div className="px-3 py-1.5 rounded-full dark:bg-slate-900 bg-slate-100 border dark:border-slate-800 border-slate-200 text-sky-600 dark:text-sky-400 text-xs font-bold font-mono">
                {answeredCount}/{rawQuestions.length}
              </div>

              <div className="px-3.5 py-1.5 rounded-full bg-sky-500/15 border border-sky-500/30 text-sky-700 dark:text-sky-300 text-xs font-extrabold font-mono flex items-center gap-1.5 shadow-sm">
                <Clock className="w-3.5 h-3.5 text-sky-500" />
                <span>{formatTime(timeLeft)}</span>
              </div>
            </>
          )}

          {/* Submit Button (Amber/Orange Pill) */}
          {!isReviewMode && (
            <button
              onClick={() => setShowSubmitModal(true)}
              className="px-4 py-1.5 rounded-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-xs flex items-center gap-1.5 shadow-md active:scale-95 transition-all"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Submit</span>
            </button>
          )}

        </div>
      </header>

      {/* ========================================================================= */}
      {/* 2. MAIN 2-COLUMN VIEWPORT (100% IN ONE CRISP FRAME - DUAL THEME) */}
      {/* ========================================================================= */}
      <main className="flex-1 flex flex-col md:flex-row min-h-0 dark:bg-[#070b14] bg-[#f8fafc] overflow-hidden">
        
        {/* LEFT COLUMN: DIRECTION & STIMULUS (50% WIDTH) */}
        <section 
          ref={leftColumnRef}
          className="w-full md:w-1/2 p-6 sm:p-8 flex flex-col justify-start border-b md:border-b-0 md:border-r dark:border-slate-800/80 border-slate-200/90 overflow-y-auto dark:bg-[#0a0f1d] bg-[#f8fafc] space-y-4 pb-36 sm:pb-40"
        >
          
          {/* Top Direction Instruction */}
          <div className="text-xs sm:text-sm font-medium dark:text-slate-400 text-slate-600">
            {getDirectionText(currentGroup?.part)}
          </div>

          {/* PRACTICE MODE INTERACTIVE AUDIO PLAYER (Only in Practice Mode) */}
          {isPracticeMode && currentGroup?.audioUrl && (
            <div className="p-4 rounded-2xl dark:bg-slate-900/90 bg-white border dark:border-slate-800 border-slate-200/90 space-y-3 shadow-sm">
              
              <div className="flex items-center gap-3">
                <button
                  onClick={toggleAudioPlay}
                  className="w-10 h-10 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 flex items-center justify-center shadow-md shadow-sky-500/20 active:scale-95 transition-all shrink-0"
                >
                  {isAudioPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current ml-0.5" />}
                </button>

                <div className="flex-1 flex items-center gap-1 h-8 px-2 rounded-xl dark:bg-slate-950/80 bg-slate-100 border dark:border-slate-800/80 border-slate-200 overflow-hidden cursor-pointer" onClick={() => rewindAudio(3)}>
                  {[40, 75, 55, 90, 60, 30, 85, 45, 95, 70, 50, 80, 65, 35, 90, 50, 75, 40, 85, 60, 45, 90, 35, 70].map((h, i) => {
                    const isPlayed = (audioDuration > 0) && (i / 24 <= audioProgress / audioDuration);
                    return (
                      <div
                        key={i}
                        className={`flex-1 rounded-full transition-all duration-150 ${isPlayed ? 'bg-sky-500' : 'dark:bg-slate-700/60 bg-slate-300'}`}
                        style={{ height: `${isAudioPlaying ? Math.max(20, (h * Math.sin(audioProgress * 4 + i))) : h}%` }}
                      />
                    );
                  })}
                </div>

                <div className="font-mono text-xs dark:text-slate-400 text-slate-500 shrink-0">
                  {Math.floor(audioProgress)}s / {Math.floor(audioDuration)}s
                </div>
              </div>

              <div className="flex items-center justify-between text-xs dark:text-slate-400 text-slate-500 pt-1 border-t dark:border-slate-800/60 border-slate-200 flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => rewindAudio(3)}
                    className="px-2.5 py-1 rounded-lg dark:bg-slate-800 bg-slate-100 hover:dark:bg-slate-700 hover:bg-slate-200 dark:text-slate-300 text-slate-700 text-xs font-mono font-bold flex items-center gap-1 border dark:border-slate-700 border-slate-200"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>3s</span>
                  </button>

                  <button
                    onClick={() => forwardAudio(5)}
                    className="px-2.5 py-1 rounded-lg dark:bg-slate-800 bg-slate-100 hover:dark:bg-slate-700 hover:bg-slate-200 dark:text-slate-300 text-slate-700 text-xs font-mono font-bold flex items-center gap-1 border dark:border-slate-700 border-slate-200"
                  >
                    <RotateCcw className="w-3 h-3 scale-x-[-1]" />
                    <span>5s</span>
                  </button>

                  <select
                    value={playbackSpeed}
                    onChange={(e) => setPlaybackSpeed(Number(e.target.value))}
                    className="px-2 py-1 rounded-lg dark:bg-slate-800 bg-slate-100 dark:text-sky-400 text-sky-600 text-xs font-bold outline-none cursor-pointer border dark:border-slate-700 border-slate-200"
                  >
                    <option value={0.75}>0.75x</option>
                    <option value={1}>1x</option>
                    <option value={1.25}>1.25x</option>
                    <option value={1.5}>1.5x</option>
                  </select>
                </div>

                <div className="hidden sm:flex items-center gap-2 text-[10px] dark:text-slate-500 text-slate-500 font-mono">
                  <span><kbd className="px-1 py-0.5 rounded dark:bg-slate-800 bg-slate-200 dark:text-slate-400 text-slate-700 border dark:border-slate-700 border-slate-300">Ctrl</kbd> Phát/Dừng</span>
                  <span><kbd className="px-1 py-0.5 rounded dark:bg-slate-800 bg-slate-200 dark:text-slate-400 text-slate-700 border dark:border-slate-700 border-slate-300">Shift</kbd> Tua 3s</span>
                  <span><kbd className="px-1 py-0.5 rounded dark:bg-slate-800 bg-slate-200 dark:text-slate-400 text-slate-700 border dark:border-slate-700 border-slate-300">1-4</kbd> Đáp án</span>
                </div>
              </div>

            </div>
          )}

          {/* Middle Stimulus Display */}
          <div className="flex-1 flex flex-col items-center justify-center">
            
            {/* 1. Part 1: Centered High-Res Photograph OR Part 3/4/7 Graphic Charts */}
            {currentGroup?.imageUrl && (
              <div className="w-full flex items-center justify-center">
                <img 
                  src={currentGroup.imageUrl} 
                  alt="TOEIC Question Photograph"
                  className="max-h-[480px] w-auto max-w-full object-contain rounded-2xl shadow-xl border dark:border-slate-800 border-slate-200/90 dark:bg-slate-950/80 bg-white"
                />
              </div>
            )}

            {/* 2. Part 6 & 7: Reading Passage (Always shown in Exam, Practice, Review) */}
            {!isCurrentListeningSection && currentGroup?.passageText && (
              <div className="w-full space-y-3">
                <div className="w-full p-6 rounded-3xl dark:bg-slate-900/80 bg-white border dark:border-slate-800 border-slate-200/90 dark:text-slate-200 text-slate-800 text-sm leading-relaxed max-h-[480px] overflow-y-auto space-y-3 shadow-sm toeic-passage-container">
                  <div 
                    dangerouslySetInnerHTML={{ __html: currentGroup.passageText }}
                    className="max-w-none text-xs sm:text-sm leading-relaxed select-text"
                  />
                </div>

                {/* Practice & Review Mode: Collapsible Passage Translation Panel */}
                {(isPracticeMode || isReviewMode) && (currentGroup?.questions?.some(q => selectedAnswers[q.questionNum]) || isReviewMode) && currentGroup?.questions?.[0]?.dichNghia && (
                  <div className="p-4 rounded-2xl dark:bg-slate-900/90 bg-white border dark:border-slate-800 border-slate-200/90 space-y-2.5 shadow-sm animate-fadeIn">
                    <button
                      onClick={() => setShowPassageTranslation(prev => !prev)}
                      className="w-full flex items-center justify-between text-xs font-bold text-sky-600 dark:text-sky-400 hover:underline transition-colors cursor-pointer"
                    >
                      <div className="flex items-center gap-2">
                        <Languages className="w-4 h-4" />
                        <span>Bản dịch Tiếng Việt toàn bài đọc</span>
                      </div>
                      <span className="text-[11px] px-2 py-0.5 rounded-full dark:bg-slate-800 bg-slate-100 dark:text-slate-300 text-slate-700 border dark:border-slate-700 border-slate-200">
                        {showPassageTranslation ? 'Ẩn bản dịch ▲' : 'Xem bản dịch ▼'}
                      </span>
                    </button>

                    {showPassageTranslation && (
                      <div className="p-3.5 rounded-xl dark:bg-slate-950/80 bg-slate-50 border dark:border-slate-800/80 border-slate-200 text-xs dark:text-slate-300 text-slate-700 leading-relaxed whitespace-pre-line select-text animate-fadeIn">
                        {currentGroup.questions[0].dichNghia}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* 3. Listening Section (Part 1-4) Spoken Transcript */}
            {isCurrentListeningSection && currentGroup?.passageText && (isReviewMode || isPracticeMode) && (
              <div className="w-full space-y-3">
                {isReviewMode ? (
                  <div className="w-full p-6 rounded-3xl dark:bg-slate-900/90 bg-white border dark:border-sky-500/30 border-sky-200 dark:text-slate-200 text-slate-800 text-xs sm:text-sm leading-relaxed max-h-[480px] overflow-y-auto space-y-3 shadow-sm">
                    <div className="flex items-center gap-2 text-sky-600 dark:text-sky-400 font-bold text-xs border-b dark:border-slate-800 border-slate-200 pb-2 mb-2">
                      <Headphones className="w-4 h-4" />
                      <span>TRANSCRIPT LỜI THOẠI BÀI NGHE</span>
                    </div>
                    <div 
                      dangerouslySetInnerHTML={{ __html: currentGroup.passageText }}
                      className="max-w-none text-xs sm:text-sm leading-relaxed select-text"
                    />
                  </div>
                ) : isPracticeMode ? (
                  <div className="p-4 rounded-2xl dark:bg-slate-900/90 bg-white border dark:border-slate-800 border-slate-200/90 space-y-2.5 shadow-sm">
                    <button
                      onClick={() => setShowPassageTranslation(prev => !prev)}
                      className="w-full flex items-center justify-between text-xs font-bold text-sky-600 dark:text-sky-400 hover:underline transition-colors cursor-pointer"
                    >
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4" />
                        <span>Transcript lời thoại bài nghe</span>
                      </div>
                      <span className="text-[11px] px-2 py-0.5 rounded-full dark:bg-slate-800 bg-slate-100 dark:text-slate-300 text-slate-700 border dark:border-slate-700 border-slate-200">
                        {showPassageTranslation ? 'Ẩn lời thoại ▲' : 'Xem lời thoại ▼'}
                      </span>
                    </button>

                    {showPassageTranslation && (
                      <div 
                        dangerouslySetInnerHTML={{ __html: currentGroup.passageText }}
                        className="p-3.5 rounded-xl dark:bg-slate-950/80 bg-slate-50 border dark:border-slate-800/80 border-slate-200 text-xs dark:text-slate-300 text-slate-700 leading-relaxed select-text animate-fadeIn"
                      />
                    )}
                  </div>
                ) : null}
              </div>
            )}

            {/* 4. Audio Wave Indicator for Listening (Part 1-4) in Exam Mode when NO Image */}
            {!isPracticeMode && isCurrentListeningSection && !currentGroup?.imageUrl && (
              <div className="flex flex-col items-center justify-center p-12 text-center space-y-4">
                <div className={`w-24 h-24 rounded-3xl flex items-center justify-center transition-all ${
                  isAudioPlaying ? 'bg-sky-500/20 text-sky-500 border border-sky-400/40 shadow-xl shadow-sky-500/20 scale-105 animate-pulse' : 'dark:bg-slate-900 bg-white border dark:border-slate-800 border-slate-200 text-slate-400'
                }`}>
                  <Headphones className="w-12 h-12" />
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-bold dark:text-white text-slate-900">
                    {isAudioPlaying ? '🎧 Đang phát bài nghe ETS...' : 'Audio đoạn hội thoại / bài nói'}
                  </p>
                  <p className="text-xs dark:text-slate-400 text-slate-600 font-mono">
                    Lắng nghe kỹ và chọn đáp án chính xác ở cột bên phải.
                  </p>
                </div>
              </div>
            )}

          </div>

          {/* BOTTOM SPACER BUFFER (Tránh bị thanh cố định che khi cuộn hết cỡ) */}
          <div className="h-28 sm:h-36 shrink-0 pointer-events-none" aria-hidden="true" />

        </section>

        {/* RIGHT COLUMN: QUESTIONS & OPTIONS (50% WIDTH) */}
        <section className="w-full md:w-1/2 flex flex-col h-full overflow-hidden dark:bg-[#0d1424] bg-white">
          
          {/* Scrollable Questions List Container */}
          <div 
            ref={rightColumnRef}
            className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-7 space-y-6 pb-36 sm:pb-40"
          >
            
            {/* Column Header */}
            <div className="flex items-center justify-between pb-1 border-b dark:border-slate-800/80 border-slate-200/90">
              <h3 className="text-base font-bold dark:text-white text-slate-900">
                Question
              </h3>

              {/* Countdown badge before auto-advancing in Exam Mode */}
              {!isPracticeMode && autoAdvanceCountdown !== null && autoAdvanceCountdown > 0 && (
                <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-600 dark:text-amber-300 text-xs font-mono font-bold animate-pulse">
                  <Clock className="w-3 h-3 text-amber-500" />
                  <span>Tự chuyển câu sau: {autoAdvanceCountdown}s</span>
                </div>
              )}
            </div>

            {/* Questions List */}
            <div className="space-y-6">
              {currentGroup?.questions?.map((q) => {
                const userChoice = selectedAnswers[q.questionNum];
                const isAnswered = Boolean(userChoice);
                const cleanPrompt = q.prompt ? q.prompt.replace(/^Câu\s*\d+\s*[:.-]?\s*/i, '').trim() : '';
                const isListeningAudioOnly = (q.part === 1 || q.part === 2) && !isReviewMode && !isPracticeMode;
                const isBookmarked = bookmarkedQuestions.has(q.questionNum);
                const translationsMap = getQuestionChoiceTranslations(q);

                return (
                  <div key={q.questionNum} className="space-y-4">
                    
                    {/* Question Box */}
                    <div className="p-4 rounded-3xl dark:bg-slate-900/60 bg-slate-50/80 border dark:border-slate-800/80 border-slate-200/90 space-y-3 shadow-sm">
                      
                      {/* Question Header */}
                      <div className="flex items-center justify-between gap-2">
                        <div className="text-sm sm:text-base font-semibold dark:text-white text-slate-900 leading-snug">
                          <span className="font-mono text-sky-600 dark:text-sky-400 font-bold">{q.questionNum}. </span>
                          {cleanPrompt && <span className="dark:text-slate-200 text-slate-800">{cleanPrompt}</span>}
                        </div>

                        {/* Exam Mode Mark for Review Button */}
                        {!isPracticeMode && !isCurrentListeningSection && (
                          <button
                            type="button"
                            onClick={() => toggleBookmark(q.questionNum)}
                            className={`px-3 py-1.5 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shrink-0 shadow-sm ${
                              isBookmarked
                                ? 'bg-amber-500/20 border-amber-500 text-amber-600 dark:text-amber-400 ring-1 ring-amber-500/30'
                                : 'dark:bg-slate-800 bg-slate-100 dark:border-slate-700 border-slate-200 dark:text-slate-400 text-slate-600 hover:dark:text-white hover:text-slate-900 hover:border-amber-500/40'
                            }`}
                            title={isBookmarked ? 'Bỏ đánh dấu câu hỏi' : 'Đánh dấu câu hỏi để xem lại (Mark for Review)'}
                          >
                            <Flag className={`w-3.5 h-3.5 ${isBookmarked ? 'fill-amber-400 text-amber-500' : ''}`} />
                            <span className="hidden sm:inline">{isBookmarked ? 'Đã đánh dấu ⚑' : 'Mark for Review'}</span>
                            <span className="sm:hidden">⚑ Review</span>
                          </button>
                        )}

                        {/* Practice Mode AI & Bookmark buttons */}
                        {isPracticeMode && (
                          <div className="flex items-center gap-1.5 shrink-0">
                            <button
                              onClick={handleAskAi}
                              className="px-2 py-1 rounded-lg bg-sky-500/10 hover:bg-sky-500/20 text-sky-600 dark:text-sky-400 border border-sky-500/30 text-xs font-bold flex items-center gap-1 transition-colors"
                              title="Hỏi trợ giảng AI"
                            >
                              <MessageSquare className="w-3.5 h-3.5" />
                              <span>Hỏi bài</span>
                            </button>

                            <button
                              onClick={() => toggleBookmark(q.questionNum)}
                              className={`p-1.5 rounded-lg border transition-colors ${
                                isBookmarked ? 'bg-amber-500/20 border-amber-500 text-amber-500' : 'dark:bg-slate-800 bg-slate-100 dark:border-slate-700 border-slate-200 dark:text-slate-400 text-slate-600 hover:dark:text-white hover:text-slate-900'
                              }`}
                            >
                              <Star className="w-3.5 h-3.5" fill={isBookmarked ? 'currentColor' : 'none'} />
                            </button>
                          </div>
                        )}
                      </div>

                      {/* Radio Options List */}
                      <div className="space-y-2.5">
                        {isListeningAudioOnly ? (
                          /* CLEAN EXAM MODE AUDIO-ONLY OPTIONS (A), (B), (C), (D) */
                          (q.part === 2 ? ['A', 'B', 'C'] : ['A', 'B', 'C', 'D']).map((letter) => {
                            const isSelected = userChoice === letter;
                            return (
                              <button
                                key={letter}
                                onClick={() => handleSelectOption(q.questionNum, letter)}
                                className={`w-full p-3.5 rounded-2xl border text-left text-xs sm:text-sm flex items-center gap-3.5 transition-all ${
                                  isSelected
                                    ? 'border-sky-500 bg-sky-500/15 dark:text-white text-slate-900 font-bold shadow-sm'
                                    : 'dark:border-slate-800 border-slate-200/90 dark:bg-slate-900/80 bg-white hover:border-sky-500 dark:text-slate-300 text-slate-700 hover:dark:text-white hover:text-slate-900 shadow-sm'
                                }`}
                              >
                                <div className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${
                                  isSelected ? 'border-sky-500 bg-sky-500' : 'dark:border-slate-600 border-slate-300 dark:bg-slate-950 bg-slate-100'
                                }`}>
                                  {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white dark:bg-slate-950" />}
                                </div>
                                <span className="font-semibold font-mono">({letter})</span>
                              </button>
                            );
                          })
                        ) : (
                          /* PRACTICE MODE OR READING SECTION (FULL TEXT OPTIONS) */
                          (q.options && q.options.length > 0 ? q.options : (q.part === 2 ? [{ label: '(A)', text: '' }, { label: '(B)', text: '' }, { label: '(C)', text: '' }] : [{ label: '(A)', text: '' }, { label: '(B)', text: '' }, { label: '(C)', text: '' }, { label: '(D)', text: '' }])).map((opt, optIdx) => {
                            const cleanLabel = opt.label.replace(/[()]/g, '').trim().toUpperCase();
                            const isSelected = userChoice === cleanLabel;
                            const isCorrect = q.correctAnswer === cleanLabel;

                            let optionStyle = 'dark:border-slate-800 border-slate-200/90 dark:bg-slate-900/80 bg-white hover:border-sky-500 dark:text-slate-300 text-slate-700 hover:dark:text-white hover:text-slate-900 shadow-sm';
                            
                            if (isPracticeMode && isAnswered) {
                              if (isCorrect) {
                                optionStyle = 'border-emerald-500 bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 font-bold shadow-sm';
                              } else if (isSelected && !isCorrect) {
                                optionStyle = 'border-rose-500 bg-rose-500/15 text-rose-700 dark:text-rose-300 font-bold shadow-sm';
                              }
                            } else if (isSelected) {
                              optionStyle = 'border-sky-500 bg-sky-500/15 dark:text-white text-slate-900 font-bold shadow-sm';
                            }

                            if (isReviewMode) {
                              if (isCorrect) optionStyle = 'border-emerald-500 bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 font-bold';
                              else if (isSelected && !isCorrect) optionStyle = 'border-rose-500 bg-rose-500/20 text-rose-700 dark:text-rose-300 font-bold';
                            }

                            return (
                              <button
                                key={optIdx}
                                onClick={() => handleSelectOption(q.questionNum, opt.label)}
                                className={`w-full p-3.5 rounded-2xl border text-left text-xs sm:text-sm flex items-center justify-between gap-3 transition-all ${optionStyle}`}
                              >
                                <div className="flex items-center gap-3 flex-1">
                                  <div className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${
                                    isSelected ? (isPracticeMode && isAnswered && !isCorrect ? 'border-rose-500 bg-rose-500' : 'border-sky-500 bg-sky-500') : 'dark:border-slate-600 border-slate-300 dark:bg-slate-950 bg-slate-100'
                                  }`}>
                                    {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white dark:bg-slate-950" />}
                                  </div>

                                  <span className="font-semibold font-mono self-start mt-0.5">({cleanLabel})</span>
                                  {opt.text && (
                                    <div className="flex-1 space-y-0.5">
                                      <div className="dark:text-slate-200 text-slate-800">{opt.text}</div>
                                      {(() => {
                                        if (!((isPracticeMode && isAnswered && isBilingualOn) || isReviewMode)) return null;
                                        let trans = (opt.vietnamese || opt.translation || translationsMap[cleanLabel] || '').trim();
                                        if (/mymemory/i.test(trans) || /^Người\s+[a-zA-Z]/i.test(trans)) {
                                          trans = '';
                                        }
                                        if (!trans || trans === '.' || trans.toLowerCase() === (opt.text || '').trim().toLowerCase()) {
                                          return null;
                                        }
                                        return (
                                          <div className="text-xs text-sky-600 dark:text-sky-400 font-normal leading-relaxed">
                                            | {trans}
                                          </div>
                                        );
                                      })()}
                                    </div>
                                  )}
                                </div>

                                {((isPracticeMode && isAnswered && isCorrect) || (isReviewMode && isCorrect)) && (
                                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 ml-2" />
                                )}
                              </button>
                            );
                          })
                        )}
                      </div>

                    </div>

                    {/* ========================================================================= */}
                    {/* DỊCH NGHĨA CÂU HỎI PANEL WITH TOGGLE SWITCH (MATCHING DAU TOEIC SCREENSHOT) */}
                    {/* ========================================================================= */}
                    {isPracticeMode && isAnswered && (
                      <div className="p-4 sm:p-5 rounded-3xl dark:bg-slate-900/90 bg-slate-50 border dark:border-sky-500/30 border-sky-200 space-y-3 shadow-sm">
                        
                        {/* Panel Header with Custom Animated Toggle Switch */}
                        <div className="flex items-center justify-between border-b dark:border-slate-800 border-slate-200 pb-3">
                          <div className="flex items-center gap-2 text-sky-600 dark:text-sky-400">
                            <Languages className="w-4 h-4" />
                            <span className="font-heading font-extrabold text-sm dark:text-white text-slate-900">Dịch nghĩa câu hỏi</span>
                          </div>

                          <button
                            onClick={() => setIsTranslationPanelOpen(prev => !prev)}
                            className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors ${
                              isTranslationPanelOpen ? 'bg-sky-500' : 'dark:bg-slate-700 bg-slate-300'
                            }`}
                            title={isTranslationPanelOpen ? 'Đóng bản dịch' : 'Mở bản dịch'}
                          >
                            <div className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                              isTranslationPanelOpen ? 'translate-x-5' : 'translate-x-0'
                            }`} />
                          </button>
                        </div>

                        {/* Translated Choices List when Toggle is ON */}
                        {isTranslationPanelOpen && (
                          <div className="space-y-2.5 pt-1">
                            {/* Question prompt translation (if available and not Part 1) */}
                            {q.part !== 1 && (q.promptTranslation || q.vietnameseQuestion) && (
                              <div className="p-3 mb-2 rounded-2xl bg-sky-500/10 border border-sky-500/30 text-xs sm:text-sm text-sky-900 dark:text-sky-200 font-medium leading-relaxed">
                                <span className="font-bold text-sky-600 dark:text-sky-400 mr-1.5">Câu hỏi:</span>
                                {q.promptTranslation || q.vietnameseQuestion}
                              </div>
                            )}
                            {['A', 'B', 'C', 'D'].slice(0, q.part === 2 ? 3 : 4).map((letter) => {
                              const isCorrect = q.correctAnswer === letter;
                              const translatedText = translationsMap[letter] || 'Bản dịch nghĩa chi tiết của lựa chọn';

                              return (
                                <div
                                  key={letter}
                                  className={`p-3 rounded-2xl border text-xs sm:text-sm leading-relaxed transition-all flex items-start gap-2.5 ${
                                    isCorrect 
                                      ? 'bg-emerald-500/15 border-emerald-500/50 text-emerald-800 dark:text-emerald-300 font-medium shadow-sm' 
                                      : 'dark:bg-slate-950/60 bg-white dark:border-slate-800/80 border-slate-200 dark:text-slate-300 text-slate-700'
                                  }`}
                                >
                                  {isCorrect ? (
                                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                                  ) : (
                                    <span className="font-mono font-bold dark:text-slate-400 text-slate-500 shrink-0">({letter})</span>
                                  )}

                                  <div className="flex-1">
                                    {isCorrect && <span className="font-mono font-bold mr-1.5">({letter})</span>}
                                    <span>{translatedText}</span>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}

                      </div>
                    )}

                    {/* Practice Mode & Review Mode Detailed Explanation Card */}
                    {((isPracticeMode && isAnswered) || isReviewMode) && q.explanation && (
                      <div className="p-4 sm:p-5 rounded-3xl bg-amber-500/5 border border-amber-500/25 text-xs space-y-2 dark:text-slate-200 text-slate-800 animate-fadeIn mt-3 shadow-sm">
                        <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 font-heading font-extrabold text-xs sm:text-sm">
                          <Sparkles className="w-4 h-4 text-amber-500" />
                          <span>LỜI GIẢI & PHÂN TÍCH BẪY ETS (CÂU #{q.questionNum})</span>
                        </div>
                        <div className="leading-relaxed whitespace-pre-line dark:text-slate-200 text-slate-800 text-xs font-normal">
                          {q.explanation}
                        </div>
                      </div>
                    )}

                  </div>
                );
              })}
            </div>

            {/* ========================================================================= */}
            {/* PRACTICE MODE "TỪ VỰNG NÊN HỌC" PANEL WITH TOGGLE SWITCH */}
            {/* ========================================================================= */}
            {isPracticeMode && isVocabPanelOpen && Object.keys(selectedAnswers).length > 0 && (
              <div className="p-5 rounded-3xl dark:bg-slate-900/90 bg-slate-50 border dark:border-amber-500/30 border-amber-200 space-y-4 shadow-sm">
                
                {/* Header with Custom Animated Toggle Switch */}
                <div className="flex items-center justify-between border-b dark:border-slate-800 border-slate-200 pb-3">
                  <div className="flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-amber-500" />
                    <span className="font-heading font-extrabold text-sm dark:text-white text-slate-900">Từ vựng nên học</span>
                  </div>

                  <button
                    onClick={() => setIsVocabPanelOpen(prev => !prev)}
                    className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors ${
                      isVocabPanelOpen ? 'bg-sky-500' : 'dark:bg-slate-700 bg-slate-300'
                    }`}
                    title={isVocabPanelOpen ? 'Đóng bảng từ vựng' : 'Mở bảng từ vựng'}
                  >
                    <div className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                      isVocabPanelOpen ? 'translate-x-5' : 'translate-x-0'
                    }`} />
                  </button>
                </div>

                <div className="space-y-3">
                  {/* Action Header: Select All, Add to Bag, Other Modules, Hide/Show Meaning */}
                  <div className="flex items-center justify-between text-xs pt-1 flex-wrap gap-2">
                    <div className="flex items-center gap-3">
                      <button
                        onClick={handleSelectAllVocab}
                        className="flex items-center gap-1.5 dark:text-slate-400 text-slate-600 hover:dark:text-white hover:text-slate-900 font-bold"
                      >
                        {selectedVocabToAdd.size === currentVocabRecommendations.length ? (
                          <CheckSquare className="w-4 h-4 text-amber-500" />
                        ) : (
                          <Square className="w-4 h-4 dark:text-slate-600 text-slate-400" />
                        )}
                        <span>Chọn tất cả ({currentVocabRecommendations.length})</span>
                      </button>

                      <button
                        onClick={handleAddSelectedVocabToBag}
                        className="px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-xs flex items-center gap-1.5 shadow-md shadow-amber-500/20 active:scale-95 transition-all"
                      >
                        <Plus className="w-3.5 h-3.5 stroke-[3]" />
                        <span>Thêm vào giỏ từ</span>
                      </button>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => navigate('/vocabulary')}
                        className="px-2.5 py-1.5 rounded-xl dark:bg-slate-800 bg-slate-100 hover:dark:bg-slate-700 hover:bg-slate-200 dark:text-slate-300 text-slate-700 text-xs font-bold flex items-center gap-1.5 transition-colors border dark:border-slate-700/60 border-slate-200"
                        title="Xem các bộ từ vựng khác"
                      >
                        <FolderPlus className="w-3.5 h-3.5 text-sky-500" />
                        <span>Học phần khác</span>
                      </button>

                      <button
                        onClick={() => setHideVocabMeaning(prev => !prev)}
                        className="p-1.5 rounded-xl dark:bg-slate-800 bg-slate-100 hover:dark:bg-slate-700 hover:bg-slate-200 dark:text-slate-400 text-slate-600 hover:dark:text-white hover:text-slate-900 transition-colors border dark:border-slate-700 border-slate-200"
                        title={hideVocabMeaning ? "Hiện nghĩa từ" : "Ẩn nghĩa từ để tự kiểm tra"}
                      >
                        {hideVocabMeaning ? <EyeOff className="w-4 h-4 text-amber-500" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Vocabulary Cards List */}
                  <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                    {currentVocabRecommendations.map((v) => {
                      const isSelected = selectedVocabToAdd.has(v.word);
                      return (
                        <div
                          key={v.word}
                          className={`p-3 rounded-2xl border flex items-center justify-between gap-3 transition-all ${
                            isSelected ? 'bg-amber-500/10 border-amber-500/40 shadow-sm' : 'dark:bg-slate-950/60 bg-white dark:border-slate-800/80 border-slate-200 shadow-sm'
                          }`}
                        >
                          <div className="flex items-start gap-3 flex-1">
                            <button
                              onClick={() => {
                                setSelectedVocabToAdd(prev => {
                                  const next = new Set(prev);
                                  if (next.has(v.word)) next.delete(v.word);
                                  else next.add(v.word);
                                  return next;
                                });
                              }}
                              className="mt-0.5"
                            >
                              {isSelected ? <CheckSquare className="w-4 h-4 text-amber-500" /> : <Square className="w-4 h-4 dark:text-slate-600 text-slate-400" />}
                            </button>

                            <div className="space-y-1 flex-1">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="font-bold dark:text-white text-slate-900 text-sm sm:text-base">{v.word}</span>
                                <span className="text-xs dark:text-slate-400 text-slate-500 font-mono italic">({v.pos || 'n'})</span>
                                <span className="px-2 py-0.2 rounded-md bg-sky-500/20 text-sky-700 dark:text-sky-300 text-[10px] font-mono font-extrabold border border-sky-500/30">
                                  {v.level || 'B1'}
                                </span>
                                
                                {/* Pronunciation Audio Buttons */}
                                <div className="flex items-center gap-1 ml-1">
                                  <button 
                                    onClick={() => playWordAudio(v.word, 'en-US')}
                                    className="p-1 rounded-lg dark:bg-slate-800 bg-slate-100 hover:bg-sky-500 hover:text-slate-950 dark:text-slate-300 text-slate-700 text-[10px] font-bold flex items-center gap-1 transition-colors border dark:border-slate-700 border-slate-200"
                                    title="Phát âm US"
                                  >
                                    <Volume2 className="w-3 h-3 text-sky-500" />
                                  </button>
                                </div>
                              </div>

                              {!hideVocabMeaning && (
                                <p className="text-xs dark:text-slate-300 text-slate-700 font-medium leading-relaxed">{v.meaning}</p>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center gap-1.5 shrink-0">
                            <button
                              onClick={async () => {
                                const updated = await addWordToBasket(v, currentDeckName, 'mock_test');
                                if (updated && Array.isArray(updated)) setVocabList(updated);
                                showToast(`⭐ Đã lưu từ "${v.word}" vào học phần "${currentDeckName}"!`);
                              }}
                              className="p-1.5 rounded-lg dark:bg-slate-800 bg-slate-100 hover:bg-amber-500/20 dark:text-slate-400 text-slate-500 hover:text-amber-500 transition-colors border dark:border-slate-700 border-slate-200"
                              title="Đánh dấu từ vựng"
                            >
                              <Bookmark className="w-3.5 h-3.5" />
                            </button>

                            <button
                              onClick={() => openDictionary(v.word)}
                              className="text-[11px] text-sky-600 dark:text-sky-400 hover:underline font-bold px-2 py-1"
                            >
                              Chi tiết
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

              </div>
            )}

            {/* BOTTOM SPACER BUFFER (Tránh bị thanh cố định che khi cuộn hết cỡ) */}
            <div className="h-28 sm:h-36 shrink-0 pointer-events-none" aria-hidden="true" />

          </div>

        </section>

      </main>

      {/* ========================================================================= */}
      {/* 3. EXAM MODE QUESTION PALETTE DOCK (BẬT/TẮT BẢNG CÂU HỎI READING) */}
      {/* ========================================================================= */}
      {!isPracticeMode && !isCurrentListeningSection && isExamPaletteOpen && (
        <div className="fixed bottom-16 left-0 right-0 z-40 max-h-[50vh] overflow-y-auto p-4 sm:p-6 dark:bg-slate-950/95 bg-white/95 backdrop-blur-2xl border-t dark:border-slate-800 border-slate-200 shadow-2xl space-y-3 animate-fadeIn">
          {/* Filter Tabs & Legend Row */}
          <div className="flex items-center justify-between gap-2 flex-wrap text-xs">
            {/* Filter Tabs */}
            <div className="flex items-center gap-1 overflow-x-auto scrollbar-none py-0.5 max-w-full">
              <button
                type="button"
                onClick={() => setExamPaletteFilter('all')}
                className={`px-2.5 py-1 rounded-lg font-bold text-[11px] transition-all cursor-pointer ${
                  examPaletteFilter === 'all'
                    ? 'bg-sky-500 text-slate-950 shadow-sm'
                    : 'dark:bg-slate-900 bg-white dark:text-slate-400 text-slate-600 border dark:border-slate-800 border-slate-200 hover:border-slate-300'
                }`}
              >
                Tất cả ({readingQuestions.length})
              </button>
              {p5Questions.length > 0 && (
                <button
                  type="button"
                  onClick={() => setExamPaletteFilter('part5')}
                  className={`px-2.5 py-1 rounded-lg font-bold text-[11px] transition-all cursor-pointer ${
                    examPaletteFilter === 'part5'
                      ? 'bg-sky-500 text-slate-950 shadow-sm'
                      : 'dark:bg-slate-900 bg-white dark:text-slate-400 text-slate-600 border dark:border-slate-800 border-slate-200 hover:border-slate-300'
                  }`}
                >
                  Part 5 ({p5Questions.length})
                </button>
              )}
              {p6Questions.length > 0 && (
                <button
                  type="button"
                  onClick={() => setExamPaletteFilter('part6')}
                  className={`px-2.5 py-1 rounded-lg font-bold text-[11px] transition-all cursor-pointer ${
                    examPaletteFilter === 'part6'
                      ? 'bg-sky-500 text-slate-950 shadow-sm'
                      : 'dark:bg-slate-900 bg-white dark:text-slate-400 text-slate-600 border dark:border-slate-800 border-slate-200 hover:border-slate-300'
                  }`}
                >
                  Part 6 ({p6Questions.length})
                </button>
              )}
              {p7Questions.length > 0 && (
                <button
                  type="button"
                  onClick={() => setExamPaletteFilter('part7')}
                  className={`px-2.5 py-1 rounded-lg font-bold text-[11px] transition-all cursor-pointer ${
                    examPaletteFilter === 'part7'
                      ? 'bg-sky-500 text-slate-950 shadow-sm'
                      : 'dark:bg-slate-900 bg-white dark:text-slate-400 text-slate-600 border dark:border-slate-800 border-slate-200 hover:border-slate-300'
                  }`}
                >
                  Part 7 ({p7Questions.length})
                </button>
              )}
              <button
                type="button"
                onClick={() => setExamPaletteFilter('unanswered')}
                className={`px-2.5 py-1 rounded-lg font-bold text-[11px] transition-all cursor-pointer ${
                  examPaletteFilter === 'unanswered'
                    ? 'bg-rose-500 text-white shadow-sm'
                    : 'dark:bg-slate-900 bg-white dark:text-slate-400 text-slate-600 border dark:border-slate-800 border-slate-200 hover:border-slate-300'
                }`}
              >
                Chưa làm ({readingUnansweredCount})
              </button>
              <button
                type="button"
                onClick={() => setExamPaletteFilter('marked')}
                className={`px-2.5 py-1 rounded-lg font-bold text-[11px] transition-all cursor-pointer flex items-center gap-1 ${
                  examPaletteFilter === 'marked'
                    ? 'bg-amber-500 text-slate-950 shadow-sm'
                    : 'dark:bg-slate-900 bg-white dark:text-slate-400 text-slate-600 border dark:border-slate-800 border-slate-200 hover:border-slate-300'
                }`}
              >
                <Flag className="w-3 h-3" />
                <span>Đánh dấu ({readingMarkedCount})</span>
              </button>
            </div>

            {/* Quick Status Legend */}
            <div className="hidden lg:flex items-center gap-3 text-[10px] dark:text-slate-400 text-slate-500 font-medium">
              <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded bg-emerald-500/80 border border-emerald-400"></span> Đã làm</span>
              <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded border dark:border-slate-700 border-slate-300"></span> Chưa làm</span>
              <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded bg-amber-500"></span> ⚑ Đánh dấu</span>
              <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded ring-1 ring-sky-400 bg-sky-500/30"></span> Đang xem</span>
            </div>
          </div>

          {/* Question Chips Grid */}
          <div className="grid grid-cols-6 sm:grid-cols-8 md:grid-cols-10 lg:grid-cols-12 gap-1.5 max-h-40 sm:max-h-48 overflow-y-auto pr-1">
            {filteredPaletteQuestions.map((q) => {
              const userChoice = selectedAnswers[q.questionNum];
              const isAnswered = Boolean(userChoice);
              const isMarked = bookmarkedQuestions.has(q.questionNum);
              const isCurrent = currentGroup?.questions?.some(item => item.questionNum === q.questionNum);

              let chipStyle = 'dark:bg-slate-900 bg-white dark:border-slate-800 border-slate-200 dark:text-slate-300 text-slate-700 hover:border-sky-500/50';

              if (isAnswered) {
                chipStyle = 'bg-emerald-500/15 border-emerald-500/60 dark:text-emerald-300 text-emerald-700 font-bold';
              }
              if (isMarked) {
                chipStyle = 'bg-amber-500/15 border-amber-400 dark:text-amber-300 text-amber-700 font-bold ring-1 ring-amber-400/40';
              }
              if (isCurrent) {
                chipStyle += ' ring-2 ring-sky-400 dark:ring-sky-400 shadow-md shadow-sky-500/20 scale-[1.03] z-10';
              }

              return (
                <button
                  key={q.questionNum}
                  type="button"
                  onClick={() => {
                    const targetGroupIdx = questionGroups.findIndex(g => g.questions.some(item => item.questionNum === q.questionNum));
                    if (targetGroupIdx !== -1) {
                      setCurrentGroupIndex(targetGroupIdx);
                      setIsExamPaletteOpen(false);
                    }
                  }}
                  className={`h-10 rounded-xl border flex flex-col items-center justify-center relative transition-all cursor-pointer ${chipStyle}`}
                  title={`Câu ${q.questionNum} (Part ${q.part})${isAnswered ? ` - Đã chọn: (${userChoice})` : ' - Chưa làm'}${isMarked ? ' - Đã đánh dấu xem lại ⚑' : ''}`}
                >
                  {isMarked && (
                    <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-amber-500 text-slate-950 flex items-center justify-center text-[8px] font-bold shadow-sm">
                      ⚑
                    </span>
                  )}
                  <span className="text-[11px] font-mono font-bold leading-none">{q.questionNum}</span>
                  {isAnswered ? (
                    <span className="text-[9px] font-mono font-black text-emerald-600 dark:text-emerald-400 leading-none mt-0.5">
                      {userChoice}
                    </span>
                  ) : (
                    <span className="text-[8px] opacity-30 font-mono leading-none mt-0.5">•</span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. UNIFIED FIXED BOTTOM NAVIGATION BAR (FIX CỨNG Ở ĐÁY MÀN HÌNH - CHUẨN ĐẬU TOEIC) */}
      {/* ========================================================================= */}
      <footer className="fixed bottom-0 left-0 right-0 z-40 h-16 border-t dark:border-slate-800/90 border-slate-200/90 dark:bg-[#070b14]/95 bg-white/95 backdrop-blur-2xl px-4 sm:px-8 flex items-center justify-between gap-4 shadow-[0_-8px_25px_rgba(0,0,0,0.15)] transition-all">
        {isPracticeMode || isReviewMode ? (
          /* Case C: Practice Mode & Review Mode */
          <div className="w-full flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <button
                onClick={() => showToast('Đã gửi báo cáo câu hỏi đến ban chuyên môn!')}
                className="px-3 py-2 rounded-xl dark:bg-slate-900 bg-slate-100 border dark:border-slate-800 border-slate-200 hover:border-slate-300 dark:hover:border-slate-700 dark:text-slate-400 text-slate-600 hover:text-rose-500 text-xs font-bold flex items-center gap-1.5 transition-colors shadow-sm cursor-pointer"
                title="Báo lỗi câu hỏi"
              >
                <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                <span className="hidden sm:inline">Báo lỗi</span>
              </button>

              <button
                onClick={() => setShowVocabDrawer(true)}
                className="px-3 py-2 rounded-xl dark:bg-slate-900 bg-slate-100 border dark:border-slate-800 border-slate-200 hover:border-amber-500 dark:text-slate-300 text-slate-700 hover:text-amber-500 text-xs font-bold flex items-center gap-1.5 transition-colors shadow-sm cursor-pointer"
                title="Xem giỏ từ vựng"
              >
                <ShoppingBag className="w-3.5 h-3.5 text-amber-500" />
                <span>Giỏ từ ({vocabList.length})</span>
              </button>

              <button
                onClick={() => {
                  if (!isDictModalOpen) {
                    const defaultWord = currentVocabRecommendations?.[0]?.word || '';
                    openDictionary(defaultWord);
                  } else {
                    closeDictionary();
                  }
                }}
                className={`px-3 py-2 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition-colors shadow-sm cursor-pointer ${
                  isDictEnabled 
                    ? 'bg-sky-500/10 border-sky-500/40 text-sky-600 dark:text-sky-400 hover:bg-sky-500/20' 
                    : 'dark:bg-slate-900 bg-slate-100 dark:border-slate-800 border-slate-200 dark:text-slate-400 text-slate-600 hover:dark:text-slate-200 hover:text-slate-900'
                }`}
                title={isDictEnabled ? "Tra từ (Đang BẬT tự động tra khi bôi đen)" : "Tra từ"}
              >
                <Search className="w-3.5 h-3.5 text-sky-500" />
                <span>Tra từ {isDictEnabled ? '✓' : ''}</span>
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  if (currentGroupIndex > 0) setCurrentGroupIndex(prev => prev - 1);
                }}
                disabled={currentGroupIndex === 0}
                className="p-2 sm:px-3 sm:py-2 rounded-xl dark:bg-slate-900 bg-slate-100 hover:dark:bg-slate-800 hover:bg-slate-200 border dark:border-slate-800 border-slate-200 disabled:opacity-30 dark:text-slate-300 text-slate-700 transition-all shadow-sm flex items-center gap-1 font-bold text-xs cursor-pointer disabled:cursor-not-allowed"
                title="Nhóm câu trước (←)"
              >
                <ChevronLeft className="w-4 h-4" />
                <span className="hidden sm:inline">Trước</span>
              </button>

              <button
                onClick={() => setShowQuestionMatrixDrawer(true)}
                className="px-3.5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-xs flex items-center gap-1.5 shadow-md shadow-emerald-500/20 active:scale-95 transition-all cursor-pointer"
                title="Danh sách câu hỏi"
              >
                <Layers className="w-3.5 h-3.5" />
                <span>{currentGroupIndex + 1}/{questionGroups.length}</span>
              </button>

              <button
                onClick={() => {
                  if (currentGroupIndex < questionGroups.length - 1) setCurrentGroupIndex(prev => prev + 1);
                }}
                disabled={currentGroupIndex === questionGroups.length - 1}
                className="p-2 sm:px-4 sm:py-2 rounded-xl bg-sky-500 hover:bg-sky-400 disabled:opacity-40 text-slate-950 font-extrabold text-xs flex items-center gap-1.5 shadow-md shadow-sky-500/20 transition-all cursor-pointer disabled:cursor-not-allowed"
                title="Nhóm câu tiếp theo (→)"
              >
                <span className="hidden sm:inline">Tiếp</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        ) : isCurrentListeningSection ? (
          /* Case A: Pure Exam Mode - Listening Section (Part 1 - 4) */
          <div className="w-full flex items-center justify-between text-xs dark:text-slate-400 text-slate-600 font-mono">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-sky-500 animate-pulse" />
              <span className="dark:text-slate-300 text-slate-700">Chuẩn thi máy IIG: Audio tự động chuyển câu sau khi kết thúc</span>
            </div>
            <span className="text-sky-600 dark:text-sky-400 font-bold">
              {currentGroupIndex + 1}/{questionGroups.length} nhóm câu
            </span>
          </div>
        ) : (
          /* Case B: Pure Exam Mode - Reading Section (Part 5 - 7) */
          <div className="w-full flex items-center justify-between gap-2 flex-wrap">
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  if (currentGroupIndex > 0) setCurrentGroupIndex(prev => prev - 1);
                }}
                disabled={currentGroupIndex === 0}
                className="px-4 py-2 rounded-xl dark:bg-slate-900 bg-slate-100 hover:dark:bg-slate-800 hover:bg-slate-200 border dark:border-slate-800 border-slate-200 disabled:opacity-30 dark:text-slate-300 text-slate-700 font-bold text-xs flex items-center gap-1.5 transition-all shadow-sm cursor-pointer disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Trước</span>
              </button>

              {currentGroup?.questions?.[0] && (
                <button
                  type="button"
                  onClick={() => toggleBookmark(currentGroup.questions[0].questionNum)}
                  className={`px-3 py-2 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-sm ${
                    bookmarkedQuestions.has(currentGroup.questions[0].questionNum)
                      ? 'bg-amber-500/20 border-amber-500 text-amber-600 dark:text-amber-400 ring-1 ring-amber-500/30'
                      : 'dark:bg-slate-900 bg-slate-100 dark:border-slate-800 border-slate-200 dark:text-slate-400 text-slate-600 hover:text-amber-500 hover:border-amber-500/40'
                  }`}
                  title="Đánh dấu câu hỏi để xem lại (Mark for Review)"
                >
                  <Flag className={`w-3.5 h-3.5 ${bookmarkedQuestions.has(currentGroup.questions[0].questionNum) ? 'fill-amber-400 text-amber-500' : ''}`} />
                  <span className="hidden sm:inline">{bookmarkedQuestions.has(currentGroup.questions[0].questionNum) ? 'Đã đánh dấu' : 'Mark for Review'}</span>
                  <span className="sm:hidden">⚑ Review</span>
                </button>
              )}
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsExamPaletteOpen(prev => !prev)}
                className={`px-3.5 py-2 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-sm ${
                  isExamPaletteOpen
                    ? 'bg-sky-500/15 border-sky-500/50 text-sky-600 dark:text-sky-300 shadow-sky-500/10'
                    : 'dark:bg-slate-900 bg-slate-100 dark:border-slate-800 border-slate-200 dark:text-slate-300 text-slate-700 hover:border-sky-500/40'
                }`}
                title="Bật/tắt khung lưới danh sách câu hỏi"
              >
                <Grid className="w-3.5 h-3.5" />
                <span>Bảng câu hỏi ({readingAnsweredCount}/{readingQuestions.length})</span>
                {isExamPaletteOpen ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronUp className="w-3.5 h-3.5" />}
              </button>

              <button
                onClick={() => {
                  if (currentGroupIndex < questionGroups.length - 1) setCurrentGroupIndex(prev => prev + 1);
                }}
                disabled={currentGroupIndex === questionGroups.length - 1}
                className="px-5 py-2 rounded-xl bg-sky-500 hover:bg-sky-400 disabled:opacity-40 text-slate-950 font-extrabold text-xs flex items-center gap-1.5 shadow-md shadow-sky-500/20 transition-all cursor-pointer disabled:cursor-not-allowed"
              >
                <span>Tiếp</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </footer>

      {/* ========================================================================= */}
      {/* 4. MODALS & DRAWERS */}
      {/* ========================================================================= */}
      {showQuestionMatrixDrawer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 dark:bg-slate-950/80 backdrop-blur-md animate-fadeIn">
          <div className="w-full max-w-md rounded-3xl dark:bg-slate-900 bg-white border dark:border-slate-800 border-slate-200 p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b dark:border-slate-800 border-slate-200 pb-3">
              <h4 className="font-heading font-extrabold text-base dark:text-white text-slate-900">Danh Sách Câu Hỏi</h4>
              <button onClick={() => setShowQuestionMatrixDrawer(false)} className="p-1 rounded-lg dark:text-slate-400 text-slate-500 hover:dark:text-white hover:text-slate-900">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-5 gap-2 max-h-72 overflow-y-auto pr-1">
              {rawQuestions.map((q) => {
                const userChoice = selectedAnswers[q.questionNum];
                const isAnswered = Boolean(userChoice);
                const isCurrent = currentGroup?.questions?.some(item => item.questionNum === q.questionNum);
                const isMarked = bookmarkedQuestions.has(q.questionNum);

                let bubbleStyle = 'dark:bg-slate-950 bg-slate-100 dark:border-slate-800 border-slate-200 dark:text-slate-400 text-slate-700 hover:bg-slate-200 dark:hover:bg-slate-900';
                if (isAnswered) bubbleStyle = 'bg-emerald-500/20 text-emerald-400 font-extrabold border-emerald-500/60 shadow-sm';
                if (isMarked) bubbleStyle = 'bg-amber-500/20 text-amber-400 border-amber-500 ring-1 ring-amber-500/40 font-extrabold';
                if (isCurrent) bubbleStyle += ' ring-2 ring-sky-500 dark:ring-sky-400';

                return (
                  <button
                    key={q.questionNum}
                    onClick={() => {
                      const groupIdx = questionGroups.findIndex(g => g.questions.some(item => item.questionNum === q.questionNum));
                      if (groupIdx !== -1) setCurrentGroupIndex(groupIdx);
                      setShowQuestionMatrixDrawer(false);
                    }}
                    className={`h-11 rounded-xl border text-xs font-mono font-bold flex flex-col items-center justify-center relative transition-all cursor-pointer ${bubbleStyle}`}
                  >
                    {isMarked && (
                      <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-amber-500 text-slate-950 flex items-center justify-center text-[8px] font-bold">
                        ⚑
                      </span>
                    )}
                    <span>{q.questionNum}</span>
                    {isAnswered && (
                      <span className="text-[9px] text-emerald-400 font-black">({userChoice})</span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}



      {showAiAskModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 dark:bg-slate-950/85 backdrop-blur-md animate-fadeIn">
          <div className="w-full max-w-lg rounded-3xl dark:bg-slate-900 bg-white border dark:border-slate-800 border-slate-200 p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b dark:border-slate-800 border-slate-200 pb-3">
              <div className="flex items-center gap-2 text-sky-600 dark:text-sky-400">
                <Sparkles className="w-5 h-5" />
                <h4 className="font-heading font-extrabold text-base dark:text-white text-slate-900">Trợ Giảng AI Tường Tận</h4>
              </div>
              <button onClick={() => setShowAiAskModal(false)} className="p-1 rounded-lg dark:text-slate-400 text-slate-500 hover:dark:text-white hover:text-slate-900">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 rounded-2xl dark:bg-slate-950 bg-slate-50 border dark:border-slate-800 border-slate-200 text-xs leading-relaxed dark:text-slate-200 text-slate-800 max-h-72 overflow-y-auto">
              {aiAskLoading ? (
                <div className="flex items-center justify-center py-8 text-sky-500 gap-2 font-mono">
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>AI đang phân tích câu hỏi và soạn giải thích...</span>
                </div>
              ) : (
                <div className="whitespace-pre-line leading-relaxed">
                  {aiAskAnswer}
                </div>
              )}
            </div>

            <button
              onClick={() => setShowAiAskModal(false)}
              className="w-full py-2.5 rounded-xl bg-sky-500 text-slate-950 font-extrabold text-xs shadow-md"
            >
              Đã hiểu
            </button>
          </div>
        </div>
      )}

      <VocabularyDrawer
        isOpen={showVocabDrawer}
        onClose={() => setShowVocabDrawer(false)}
        vocabList={vocabList}
        onDeleteWord={handleDeleteVocabFromBag}
      />



      {/* RESULT MODAL */}
      {evaluationResult && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 dark:bg-slate-950/90 backdrop-blur-md animate-fadeIn overflow-y-auto">
          <div className="w-full max-w-xl rounded-3xl dark:bg-[#0d1424] bg-white border dark:border-slate-800 border-slate-200 p-6 sm:p-8 space-y-6 text-center shadow-2xl my-8">
            <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center gap-3 text-amber-700 dark:text-amber-300 text-xs sm:text-sm font-bold">
              <span className="text-xl">🐱</span>
              <span>{evaluationResult.accuracy >= 70 ? 'Xuất sắc! Bạn đã làm rất tốt, cố gắng phát huy nhé!' : 'Cố lên nhé! Sai để học, Đậu tin bạn!'}</span>
            </div>

            <div className="space-y-1">
              <div className="w-12 h-12 rounded-2xl bg-sky-500/10 border border-sky-500/30 text-sky-500 flex items-center justify-center mx-auto mb-2">
                <Trophy className="w-6 h-6" />
              </div>
              <h3 className="font-heading font-extrabold text-2xl dark:text-white text-slate-900">Hoàn thành bài thi!</h3>
              <p className="text-xs dark:text-slate-400 text-slate-500 font-mono">{testData?.title?.replace(/—.*/, '') || 'Test 1'}</p>
            </div>

            {/* SCALED TOEIC SCORECARD ETS BANNER */}
            <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-b from-slate-900 via-slate-950 to-slate-900 border-2 border-amber-500/40 shadow-xl space-y-3.5 text-center relative overflow-hidden">
              <div className="absolute top-0 right-0 px-3 py-1 bg-amber-500/20 text-amber-300 font-mono text-[10px] font-extrabold uppercase rounded-bl-xl border-l border-b border-amber-500/30">
                ETS Scaled Score
              </div>

              <span className="text-[11px] font-mono text-amber-400 font-extrabold uppercase tracking-wider block">
                Điểm Ước Tính Chuẩn ETS (10 - 990 PTS)
              </span>

              <div className="text-5xl sm:text-6xl font-black font-heading text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500">
                {evaluationResult.totalScore || 10} <span className="text-sm font-mono text-slate-400">/ 990</span>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-1">
                <div className="p-3 rounded-2xl bg-sky-500/10 border border-sky-500/25 text-left space-y-0.5">
                  <div className="text-xs text-sky-400 font-bold flex items-center gap-1.5">
                    <Headphones className="w-3.5 h-3.5" />
                    <span>Listening</span>
                  </div>
                  <div className="text-2xl font-black text-white">{evaluationResult.listeningScore || 5} <span className="text-[10px] text-slate-400">/ 495</span></div>
                  <div className="text-[11px] text-slate-400 font-mono">{evaluationResult.correctListening || 0} câu đúng</div>
                </div>

                <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/25 text-left space-y-0.5">
                  <div className="text-xs text-emerald-400 font-bold flex items-center gap-1.5">
                    <BookOpen className="w-3.5 h-3.5" />
                    <span>Reading</span>
                  </div>
                  <div className="text-2xl font-black text-white">{evaluationResult.readingScore || 5} <span className="text-[10px] text-slate-400">/ 495</span></div>
                  <div className="text-[11px] text-slate-400 font-mono">{evaluationResult.correctReading || 0} câu đúng</div>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs px-2 pt-1 text-slate-400 border-t border-slate-800/80">
                <span>Tổng câu đúng: <strong className="text-white font-mono">{evaluationResult.correctCount}/{evaluationResult.totalQuestions}</strong></span>
                <span>Chính xác: <strong className="text-emerald-400 font-mono">{evaluationResult.accuracy}%</strong></span>
              </div>
            </div>

            {/* PART BY PART BREAKDOWN */}
            <div className="space-y-3 text-left">
              <span className="text-xs font-bold dark:text-slate-300 text-slate-700 block font-heading">
                Phân tích chi tiết 7 Parts
              </span>

              <div className="space-y-2.5 max-h-48 overflow-y-auto pr-1">
                {Object.entries(evaluationResult.partStats || {}).map(([partNum, stat]) => {
                  if (stat.total === 0) return null;
                  const pct = Math.round((stat.correct / stat.total) * 100);
                  return (
                    <div key={partNum} className="p-3 rounded-2xl dark:bg-slate-950/60 bg-slate-50 border dark:border-slate-800 border-slate-200 space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2 dark:text-slate-200 text-slate-800 font-bold">
                          {Number(partNum) <= 4 ? <Headphones className="w-3.5 h-3.5 text-sky-500" /> : <BookOpen className="w-3.5 h-3.5 text-emerald-500" />}
                          <span>Part {partNum}</span>
                        </div>
                        <span className="font-mono dark:text-slate-400 text-slate-500 font-bold">{stat.correct}/{stat.total} ({pct}%)</span>
                      </div>

                      <div className="w-full h-2 rounded-full dark:bg-slate-800 bg-slate-200 overflow-hidden">
                        <div 
                          className={`h-full rounded-full transition-all duration-500 ${pct >= 70 ? 'bg-emerald-500' : pct >= 40 ? 'bg-amber-500' : 'bg-sky-500'}`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* ACTION BUTTONS */}
            <div className="space-y-2.5 pt-2">
              {/* PRIMARY GOLDEN SCORECARD / PDF BUTTON */}
              <button
                onClick={() => setShowScorecardModal(true)}
                className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 hover:from-amber-400 hover:to-yellow-300 text-slate-950 font-heading font-black text-sm flex items-center justify-center gap-2 shadow-lg shadow-amber-500/25 active:scale-98 transition-all"
              >
                <Award className="w-4 h-4" />
                <span>Xem Bảng Điểm & Xuất PDF / Tải Ảnh HD</span>
              </button>

              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => {
                    setIsReviewMode(true);
                    setEvaluationResult(null);
                  }}
                  className="py-3 px-3 rounded-xl dark:bg-slate-800 bg-slate-100 hover:dark:bg-slate-700 hover:bg-slate-200 dark:text-white text-slate-800 font-bold text-xs flex items-center justify-center gap-1.5 transition-all border dark:border-slate-700 border-slate-300"
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>Xem lại bài thi</span>
                </button>

                <button
                  onClick={() => navigate('/mistakes')}
                  className="py-3 px-3 rounded-xl dark:bg-slate-800/80 bg-rose-50 hover:bg-rose-100 dark:hover:bg-slate-700 text-rose-500 dark:text-rose-400 font-bold text-xs flex items-center justify-center gap-1.5 transition-all border dark:border-slate-700 border-rose-200"
                >
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>Sổ tay câu sai</span>
                </button>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setSelectedAnswers({});
                    setEvaluationResult(null);
                    setIsReviewMode(false);
                    setCurrentGroupIndex(0);
                    setTimeLeft(calculateInitialTime());
                  }}
                  className="flex-1 py-2.5 rounded-xl dark:bg-slate-900 bg-slate-100 hover:dark:bg-slate-800 hover:bg-slate-200 dark:text-slate-400 text-slate-600 font-bold text-xs flex items-center justify-center gap-1.5 transition-all border dark:border-slate-800 border-slate-300"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Làm lại</span>
                </button>

                <button
                  onClick={() => navigate('/tests')}
                  className="flex-1 py-2.5 rounded-xl dark:bg-slate-900 bg-slate-100 hover:dark:bg-slate-800 hover:bg-slate-200 dark:text-slate-400 text-slate-600 font-bold text-xs transition-all border dark:border-slate-800 border-slate-300"
                >
                  Thoát ra danh sách
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* EXIT MODAL */}
      {showExitModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 dark:bg-slate-950/80 backdrop-blur-md animate-fadeIn">
          <div className="w-full max-w-md rounded-3xl dark:bg-slate-900 bg-white border dark:border-slate-800 border-slate-200 p-6 sm:p-8 space-y-6 text-center shadow-2xl">
            <AlertTriangle className="w-12 h-12 text-rose-500 mx-auto" />
            <div className="space-y-2">
              <h3 className="font-heading font-extrabold text-xl dark:text-white text-slate-900">Rời Khỏi Phòng Thi?</h3>
              <p className="text-xs dark:text-slate-400 text-slate-600">
                {isPracticeMode ? 'Bạn có chắc muốn thoát khỏi bài luyện tập?' : 'Bài thi đang làm dở sẽ không được lưu điểm chính thức. Bạn có chắc muốn thoát?'}
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setShowExitModal(false)}
                className="flex-1 py-3 rounded-2xl dark:bg-slate-800 bg-slate-100 hover:dark:bg-slate-700 hover:bg-slate-200 dark:text-slate-300 text-slate-700 font-bold text-xs border dark:border-slate-700 border-slate-200 cursor-pointer"
              >
                Ở lại tiếp tục
              </button>

              <button
                type="button"
                onClick={handleConfirmExit}
                className="flex-1 py-3 rounded-2xl bg-rose-500 hover:bg-rose-400 text-white font-extrabold text-xs shadow-lg shadow-rose-500/20 active:scale-95 cursor-pointer"
              >
                Thoát phòng thi
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SUBMIT MODAL */}
      {showSubmitModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 dark:bg-slate-950/80 backdrop-blur-md animate-fadeIn">
          <div className="w-full max-w-md rounded-3xl dark:bg-slate-900 bg-white border dark:border-slate-800 border-slate-200 p-6 sm:p-8 space-y-6 text-center shadow-2xl">
            <Award className="w-12 h-12 text-emerald-500 mx-auto" />
            <div className="space-y-2">
              <h3 className="font-heading font-extrabold text-xl dark:text-white text-slate-900">Xác Nhận Nộp Bài</h3>
              <p className="text-xs dark:text-slate-400 text-slate-600">
                Bạn đã làm <strong className="text-emerald-500 font-mono">{answeredCount}</strong> / {rawQuestions.length} câu hỏi.
                {answeredCount < rawQuestions.length && (
                  <span className="block text-amber-500 mt-1 font-bold">⚠️ Vẫn còn {rawQuestions.length - answeredCount} câu chưa làm.</span>
                )}
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowSubmitModal(false)}
                className="flex-1 py-3 rounded-2xl dark:bg-slate-800 bg-slate-100 hover:dark:bg-slate-700 hover:bg-slate-200 dark:text-slate-300 text-slate-700 font-bold text-xs border dark:border-slate-700 border-slate-200"
              >
                Tiếp tục làm
              </button>

              <button
                onClick={handleSubmitTest}
                className="flex-1 py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-xs shadow-lg shadow-emerald-500/20 active:scale-95"
              >
                Nộp bài ngay
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ADVANCED DAU TOEIC TOOL MODALS */}
      <AnnotatorToolbar
        isActive={isAnnotatorActive}
        onToggle={() => setIsAnnotatorActive(!isAnnotatorActive)}
        currentColor={annotatorColor}
        onChangeColor={setAnnotatorColor}
        onClearAll={() => showToast('Đã xóa tất cả highlight!')}
      />

      <FlashcardQuickModal
        isOpen={showFlashcards}
        onClose={() => setShowFlashcards(false)}
        vocabList={currentVocabRecommendations}
        onAddToBasket={async (w) => {
          const updated = await addWordToBasket(w, currentDeckName, 'mock_test');
          if (updated && Array.isArray(updated)) setVocabList(updated);
          showToast(`⭐ Đã lưu từ "${w.word}" vào học phần "${currentDeckName}"!`);
        }}
      />

      <FillInBlanksModal
        isOpen={showFillInBlanks}
        onClose={() => setShowFillInBlanks(false)}
        question={currentGroup?.questions?.[0]}
      />

      <PersonalNoteModal
        isOpen={showPersonalNoteModal}
        onClose={() => setShowPersonalNoteModal(false)}
        questionId={`mock_${id}_g${currentGroupIndex + 1}`}
        title={`Ghi chú - Nhóm câu ${currentGroupIndex + 1}`}
        onSave={() => showToast('Đã lưu ghi chú thành công! 📝')}
      />

      <ShareScorecardModal
        isOpen={showScorecardModal}
        onClose={() => setShowScorecardModal(false)}
        evaluationResult={evaluationResult}
        studentName={user?.fullName || user?.name || 'Học Viên TOEIC'}
      />
    </div>
  );
}

