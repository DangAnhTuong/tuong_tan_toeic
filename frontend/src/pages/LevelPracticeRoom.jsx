import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { 
  ArrowLeft, 
  Play, 
  Pause, 
  RotateCcw, 
  RotateCw, 
  Star, 
  Bookmark, 
  Volume2, 
  Zap, 
  CheckCircle2, 
  XCircle, 
  HelpCircle, 
  ChevronLeft, 
  ChevronRight, 
  Grid, 
  Sparkles, 
  BookOpen, 
  AlertTriangle, 
  ShoppingBag, 
  Languages, 
  Check, 
  Plus,
  Eye,
  EyeOff,
  FolderOpen,
  Crown,
  Share2,
  Highlighter,
  FileText,
  Repeat,
  PenTool,
  Save,
  Trash2
} from 'lucide-react';
import PricingModal from '../components/PricingModal';
import VocabularyDrawer from '../components/VocabularyDrawer';
import ExitModal from '../components/ExitModal';
import DauSavingProgressOverlay from '../components/DauSavingProgressOverlay';
import AnnotatorToolbar from '../components/AnnotatorToolbar';
import FlashcardQuickModal from '../components/FlashcardQuickModal';
import FillInBlanksModal from '../components/FillInBlanksModal';
import { getStoredUser, setStoredUser } from '../utils/auth';
import { translateToeicOption } from '../utils/toeicTranslator';
import { useDictionary } from '../context/DictionaryContext';
import { savePracticeProgress, getSingleProgress, resetPracticeProgress } from '../services/practiceProgressService';
import { 
  addWordToBasket, 
  addWordsToBasket, 
  removeWordFromBasket, 
  getBasketWords 
} from '../services/vocabBasketService';

export default function LevelPracticeRoom() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const levelNum = Number(searchParams.get('level')) || 1;
  const partNum = Number(searchParams.get('part')) || 3;
  const modeParam = searchParams.get('mode') || 'level';
  const topicParam = searchParams.get('topic') || '';
  const isRedoMode = searchParams.get('redo') === 'true';

  const computedExerciseKey = modeParam === 'topic' && topicParam
    ? `listening_p${partNum}_topic_${encodeURIComponent(topicParam)}`
    : `listening_p${partNum}_lv${levelNum}`;

  const [isSavingProgress, setIsSavingProgress] = useState(false);
  const [isProUser, setIsProUser] = useState(() => {
    const stored = getStoredUser();
    return Boolean(stored?.isPro || stored?.role === 'admin');
  });
  const [showPricingModal, setShowPricingModal] = useState(false);

  useEffect(() => {
    async function checkPro() {
      try {
        const stored = getStoredUser();
        if (stored?.isPro || stored?.role === 'admin') {
          setIsProUser(true);
        }
        const res = await axios.get('/api/v1/user/profile');
        if (res.data?.data) {
          const proStatus = Boolean(res.data.data.isPro || res.data.data.role === 'admin');
          setIsProUser(proStatus);
          const current = getStoredUser();
          if (current && (current.isPro !== res.data.data.isPro || current.role !== res.data.data.role)) {
            setStoredUser({
              ...current,
              isPro: res.data.data.isPro,
              proTier: res.data.data.proTier,
              proExpiresAt: res.data.data.proExpiresAt,
              role: res.data.data.role || current.role
            });
          }
        }
      } catch (e) {}
    }
    checkPro();
    window.addEventListener('auth_state_changed', checkPro);
    return () => window.removeEventListener('auth_state_changed', checkPro);
  }, []);

  // Level & Topic Info
  const levelNames = ['Lv.1 Dễ', 'Lv.2 Cơ bản', 'Lv.3 Trung bình', 'Lv.4 Khó', 'Lv.5 Rất khó'];
  const levelTitle = modeParam === 'topic' && topicParam ? `Dạng bài: ${topicParam}` : (levelNames[levelNum - 1] || 'Lv.1 Dễ');

  // Questions Data
  const [questions, setQuestions] = useState([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [loading, setLoading] = useState(true);

  const currentUser = getStoredUser();
  const currentUserId = currentUser?.userId || currentUser?.email || 'guest';
  const resumeStorageKey = `tuongtan_listening_resume_${currentUserId}_part${partNum}_lv${levelNum}_${modeParam}_${topicParam || ''}`;
  const [hasRestoredProgress, setHasRestoredProgress] = useState(false);

  // User Interaction State
  const [selectedAnswers, setSelectedAnswers] = useState({}); // { [idx]: '(A)' }
  const [bookmarkedQuestions, setBookmarkedQuestions] = useState({}); // { [idx]: true }
  const [isSongNgu, setIsSongNgu] = useState(true);
  const [isDanChung, setIsDanChung] = useState(false);
  const [isAnnotator, setIsAnnotator] = useState(false);
  const [annotatorColor, setAnnotatorColor] = useState('yellow');
  const [showFlashcards, setShowFlashcards] = useState(false);
  const [isLoopAudio, setIsLoopAudio] = useState(false);
  const [isAutoPlay, setIsAutoPlay] = useState(true);
  const [isSFX, setIsSFX] = useState(true);
  const [xpCount, setXpCount] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);

  // Audio Player State
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1.0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(75);

  // Modals & Drawers
  const [showExitModal, setShowExitModal] = useState(false);
  const [showGridDrawer, setShowGridDrawer] = useState(false);
  const [showVocabDrawer, setShowVocabDrawer] = useState(false);
  const { 
    openDictionary, 
    closeDictionary, 
    isOpen: isDictModalOpen, 
    isDictEnabled, 
    toggleDictEnabled,
    setDeckContext
  } = useDictionary();

  const currentDeckName = `Part ${partNum} ${modeParam === 'topic' ? (topicParam || 'Chủ đề') : ('Level ' + levelNum)}`;

  useEffect(() => {
    if (setDeckContext && currentDeckName) {
      setDeckContext(currentDeckName);
    }
  }, [setDeckContext, currentDeckName]);

  // Listen for global dictionary additions to update local cart list & show toast
  useEffect(() => {
    const handleBasketUpdate = (e) => {
      const detail = e?.detail;
      if (detail?.allWords && Array.isArray(detail.allWords)) {
        setBasketWords(detail.allWords);
        return;
      }
      if (detail?.removedWord) {
        setBasketWords(prev => prev.filter(item => item.word?.toLowerCase() !== detail.removedWord.toLowerCase()));
        return;
      }
      if (detail?.words && Array.isArray(detail.words)) {
        setBasketWords(prev => {
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
        setBasketWords(prev => {
          const map = new Map();
          [...prev, newWord].forEach(item => {
            if (item && item.word) map.set(item.word.toLowerCase().trim(), item);
          });
          return Array.from(map.values());
        });
        setToastMsg(`🛒 Đã lưu "${newWord.word}" vào giỏ từ!`);
        setTimeout(() => setToastMsg(null), 2500);
      }
    };
    window.addEventListener('vocab_basket_updated', handleBasketUpdate);

    getBasketWords().then(words => {
      if (words && words.length > 0) setBasketWords(words);
    }).catch(() => {});

    return () => window.removeEventListener('vocab_basket_updated', handleBasketUpdate);
  }, []);

  // Auto-scroll to top when question or passage changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentIdx]);

  const [showAiModal, setShowAiModal] = useState(false);
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [showDictationModal, setShowDictationModal] = useState(false);

  // Notes & Annotator State
  const [userNotes, setUserNotes] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('tuong_tan_toeic_notes') || '{}');
    } catch {
      return {};
    }
  });
  const [currentNoteText, setCurrentNoteText] = useState('');

  // Vocabulary Section Interactive State
  const [isVocabSectionOpen, setIsVocabSectionOpen] = useState(true);
  const [hideVocabMeaning, setHideVocabMeaning] = useState(false);
  const [selectedVocabIndices, setSelectedVocabIndices] = useState(new Set([0]));
  const [toastMsg, setToastMsg] = useState(null);
  const [basketWords, setBasketWords] = useState(() => {
    try {
      const w1 = JSON.parse(localStorage.getItem('tuongtan_cart_words') || '[]');
      const w2 = JSON.parse(localStorage.getItem('user_vocab_basket') || '[]');
      const map = new Map();
      [...w1, ...w2].forEach(item => {
        if (item && item.word) map.set(item.word.toLowerCase(), item);
      });
      return Array.from(map.values());
    } catch (e) {
      return [];
    }
  });
  const basketCount = basketWords.length;

  // TTS Helper for US / UK Pronunciation
  const speakWord = (text, lang = 'en-US') => {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang;
    utterance.rate = 0.9;
    window.speechSynthesis.speak(utterance);
  };

  // Fallback photo questions for Part 1/2
  const fallbackPhotoQuestions = Array.from({ length: 93 }, (_, i) => ({
    questionNumber: i + 1,
    testQuestionNumber: i + 1,
    imageUrl: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=800&q=80',
    promptText: 'Select the one statement that best describes what you see in the picture.',
    promptTranslation: 'Chọn một câu miêu tả đúng nhất những gì bạn nhìn thấy trong bức tranh.',
    options: [
      { label: '(A)', text: 'The man is looking at his mobile phone on the train.', translation: 'Người đàn ông đang nhìn vào điện thoại trên tàu.', isCorrect: true },
      { label: '(B)', text: 'The man is purchasing a train ticket at the counter.', translation: 'Người đàn ông đang mua vé tàu tại quầy.', isCorrect: false },
      { label: '(C)', text: 'The man is adjusting his winter coat.', translation: 'Người đàn ông đang chỉnh lại áo khoác mùa đông.', isCorrect: false },
      { label: '(D)', text: 'The man is standing near the train entrance.', translation: 'Người đàn ông đang đứng gần lối vào tàu.', isCorrect: false }
    ],
    transcript: 'The man is looking at his mobile phone on the train.',
    translation: 'Người đàn ông đang nhìn vào điện thoại di động trên tàu.',
    explanation: 'Trong bức ảnh, người đàn ông đang ngồi trên ghế tàu và chăm chú nhìn vào màn hình điện thoại cầm trên tay.',
    vocabularyList: [
      {
        word: 'passenger',
        pos: 'n',
        level: 'A2',
        ipaUS: '/ˈpæs.ən.dʒɚ/',
        ipaUK: '/ˈpæs.ən.dʒər/',
        meaning: 'hành khách (đi tàu, xe, máy bay)',
        example: 'All passengers must remain seated until the train stops.',
        exampleTrans: 'Tất cả hành khách phải ngồi yên cho đến khi tàu dừng.',
        collocations: [{ phrase: 'train passenger', meaning: 'hành khách đi tàu' }]
      }
    ]
  }));

  // Fetch Questions from MongoDB
  useEffect(() => {
    async function loadQuestions() {
      try {
        setLoading(true);
        const endpoint = modeParam === 'topic' && topicParam
          ? `/api/v1/listening/exercises?mode=topic&part=${partNum}&topic=${encodeURIComponent(topicParam)}`
          : `/api/v1/listening/exercises?mode=level&part=${partNum}&level=${levelNum}`;

        const res = await axios.get(endpoint);
        if (res.data?.data && res.data.data.length > 0) {
          const matched = modeParam === 'topic' && topicParam
            ? (res.data.data.find(ex => ex.topic === topicParam) || res.data.data[0])
            : (res.data.data.find(ex => ex.level === levelNum) || res.data.data[0]);

          if (matched && matched.questions && matched.questions.length > 0) {
            setQuestions(matched.questions);
            return;
          }
        }
        setQuestions(fallbackPhotoQuestions);
      } catch (err) {
        console.warn('Using fallback level questions:', err.message);
        setQuestions(fallbackPhotoQuestions);
      } finally {
        setLoading(false);
      }
    }
    loadQuestions();
  }, [levelNum, partNum, modeParam, topicParam]);

  // Auto-restore listening progress from practiceProgressService
  useEffect(() => {
    if (loading || questions.length === 0 || hasRestoredProgress) return;
    async function restore() {
      try {
        const saved = await getSingleProgress(computedExerciseKey);
        if (saved) {
          // If Redo mode, filter to only wrong questions
          if (isRedoMode && saved.wrongQuestions && saved.wrongQuestions.length > 0) {
            const wrongIds = new Set(saved.wrongQuestions.map(w => String(w.questionId)));
            const filtered = questions.filter((q, idx) => wrongIds.has(String(q._id || idx)));
            if (filtered.length > 0) {
              setQuestions(filtered);
              setSelectedAnswers({});
              setHasRestoredProgress(true);
              return;
            }
          }

          if (saved.userAnswersMap && typeof saved.userAnswersMap === 'object') {
            setSelectedAnswers(saved.userAnswersMap);
          }
          if (typeof saved.correctCount === 'number') {
            setCorrectCount(saved.correctCount);
          }
          if (typeof saved.practiceXp === 'number') {
            setXpCount(saved.practiceXp);
          }

          // Resume to first unanswered question
          let resumeIdx = 0;
          if (saved.userAnswersMap) {
            for (let i = 0; i < questions.length; i++) {
              if (!saved.userAnswersMap[i]) {
                resumeIdx = i;
                break;
              }
            }
          }
          setCurrentIdx(resumeIdx);
        }
      } catch (e) {
        console.warn('Failed to restore listening practice progress:', e);
      } finally {
        setHasRestoredProgress(true);
      }
    }
    restore();
  }, [loading, questions.length, computedExerciseKey, hasRestoredProgress, isRedoMode]);

  // Synchronize progress to practiceProgressService
  const syncProgressToStorage = async (nextAnswers, nextCorrect, nextXp) => {
    const ansMap = nextAnswers || selectedAnswers;
    const answeredCount = Object.keys(ansMap).length;
    let cor = 0;
    let wrg = 0;
    const wrongList = [];

    activeQuestions.forEach((q, idx) => {
      const userAns = ansMap[idx];
      if (userAns) {
        const isCor = q?.options?.find(o => o.label === userAns)?.isCorrect;
        if (isCor) {
          cor++;
        } else {
          wrg++;
          wrongList.push({
            questionId: q._id || idx,
            userAnswer: userAns,
            promptText: q.promptText || q.prompt || ''
          });
        }
      }
    });

    let nextQIdx = 0;
    for (let i = 0; i < activeQuestions.length; i++) {
      if (!ansMap[i]) {
        nextQIdx = i;
        break;
      }
    }

    await savePracticeProgress({
      category: 'listening',
      part: `Part ${partNum}`,
      level: levelNum,
      exerciseKey: computedExerciseKey,
      totalQuestions: activeQuestions.length,
      completedCount: answeredCount,
      correctCount: nextCorrect ?? cor,
      wrongCount: wrg,
      currentQuestionIdx: nextQIdx,
      currentPassageIdx: (partNum === 3 || partNum === 4) ? Math.floor(nextQIdx / 3) : nextQIdx,
      userAnswersMap: ansMap,
      wrongQuestions: wrongList,
      practiceXp: nextXp ?? xpCount
    });
  };

  const handleConfirmExit = async () => {
    setIsSavingProgress(true);
    try {
      await syncProgressToStorage();
    } catch (e) {
      console.warn('Sync on exit error:', e);
    }
    setTimeout(() => {
      setIsSavingProgress(false);
      setShowExitModal(false);
      const targetMode = modeParam === 'topic' ? 'type' : 'level';
      navigate(`/listen?tab=${targetMode}&part=${partNum}`);
    }, 1200);
  };

  // Reset listening progress to start from Question 1
  const handleResetListeningProgress = async () => {
    try {
      await resetPracticeProgress(computedExerciseKey);
    } catch (e) {
      console.warn('Failed to reset listening practice progress:', e);
    }
    setCurrentIdx(0);
    setSelectedAnswers({});
    setCorrectCount(0);
    setXpCount(0);
    setToastMsg('↺ Đã làm lại bài nghe từ câu đầu tiên');
  };

  const activeQuestions = questions.length > 0 ? questions : fallbackPhotoQuestions;
  
  // Passage mode vs Single Question mode
  const isPassageMode = partNum === 3 || partNum === 4;
  const currentPassageIdx = isPassageMode ? Math.floor(currentIdx / 3) : currentIdx;
  const totalPassages = isPassageMode ? Math.ceil(activeQuestions.length / 3) : activeQuestions.length;
  const currentPassageQuestions = isPassageMode 
    ? activeQuestions.slice(currentPassageIdx * 3, currentPassageIdx * 3 + 3) 
    : [activeQuestions[currentIdx] || activeQuestions[0]];
  const currentPassageQ = currentPassageQuestions[0] || activeQuestions[0];
  const currentPassageImageUrl = isPassageMode 
    ? (currentPassageQuestions.find(q => q.imageUrl)?.imageUrl || currentPassageQ?.imageUrl || '') 
    : (currentPassageQ?.imageUrl || '');
  
  const startQNum = currentPassageQuestions[0]?.testQuestionNumber || (currentPassageIdx * 3 + 1);
  const endQNum = currentPassageQuestions[currentPassageQuestions.length - 1]?.testQuestionNumber || (currentPassageIdx * 3 + currentPassageQuestions.length);
  const currentPassageTitle = isPassageMode 
    ? `Nhóm câu ${startQNum}-${endQNum} (3 câu hỏi)`
    : `Câu ${currentIdx + 1}`;
  
  const currentQ = activeQuestions[currentIdx] || activeQuestions[0];
  const userChoice = selectedAnswers[currentIdx];
  const isAnswered = Boolean(userChoice);
  const isCurrentPassageAnswered = isPassageMode 
    ? currentPassageQuestions.every((_, subIdx) => selectedAnswers[currentPassageIdx * 3 + subIdx])
    : Boolean(selectedAnswers[currentIdx]);
  const anyCurrentPassageAnswered = isPassageMode 
    ? currentPassageQuestions.some((_, subIdx) => selectedAnswers[currentPassageIdx * 3 + subIdx])
    : Boolean(selectedAnswers[currentIdx]);

  // VIP Pro Lock Checking: Level 1 free limit is exactly 20 questions across Part 1-7
  const isQuestionLocked = (qIdx) => {
    if (isProUser) return false;
    if (modeParam === 'level') {
      if (levelNum > 1) return true;
      return qIdx >= 20; // 20 questions free: indices 0..19 are free, 20+ locked
    }
    return false;
  };

  const isPassageLocked = (pIdx) => {
    if (isProUser) return false;
    if (modeParam === 'level') {
      if (levelNum > 1) return true;
      return pIdx >= 7; // Passages 0..6 (21 questions: Q1..Q21) are free, Passage 7+ (Q22+) is locked
    }
    return false;
  };

  const isCurrentLocked = isPassageMode ? isPassageLocked(currentPassageIdx) : isQuestionLocked(currentIdx);

  // Auto-pause audio if current question/passage is locked
  useEffect(() => {
    if (isCurrentLocked && isPlaying) {
      audioRef.current?.pause();
      setIsPlaying(false);
    }
  }, [isCurrentLocked, isPlaying]);

  // Load Note for current passage
  useEffect(() => {
    const noteKey = `note_p${partNum}_lv${levelNum}_idx${currentPassageIdx}`;
    setCurrentNoteText(userNotes[noteKey] || '');
  }, [currentPassageIdx, partNum, levelNum, userNotes]);

  const handleSaveNote = () => {
    const noteKey = `note_p${partNum}_lv${levelNum}_idx${currentPassageIdx}`;
    const updated = { ...userNotes, [noteKey]: currentNoteText };
    setUserNotes(updated);
    localStorage.setItem('tuong_tan_toeic_notes', JSON.stringify(updated));
    setShowNoteModal(false);
    setToastMsg('Đã lưu ghi chú thành công! 📝');
    setTimeout(() => setToastMsg(null), 2000);
  };

  // Reset selected vocab indices when current passage changes
  useEffect(() => {
    if (currentPassageQ?.vocabularyList && currentPassageQ.vocabularyList.length > 0) {
      setSelectedVocabIndices(new Set(currentPassageQ.vocabularyList.map((_, i) => i)));
    } else {
      setSelectedVocabIndices(new Set());
    }
  }, [currentPassageIdx, currentPassageQ]);

  // Handle adding vocab words to basket
  const handleAddSelectedToBasket = async () => {
    if (!currentPassageQ?.vocabularyList || currentPassageQ.vocabularyList.length === 0) return;
    try {
      const toAdd = currentPassageQ.vocabularyList.filter((_, idx) => selectedVocabIndices.has(idx));
      if (toAdd.length === 0) return;
      const updated = await addWordsToBasket(toAdd, currentDeckName, 'listening_level');
      if (updated && Array.isArray(updated)) {
        setBasketWords(updated);
      }
      setToastMsg(`Đã thêm ${toAdd.length} từ vào giỏ từ thành công! 🛒`);
      setTimeout(() => setToastMsg(null), 2500);
    } catch (e) {
      console.error(e);
    }
  };

  const audioRef = useRef(null);

  // Reset audio when passage changes
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
      setCurrentTime(0);
      audioRef.current.load();
      if (isAutoPlay) {
        setTimeout(() => {
          audioRef.current?.play().then(() => setIsPlaying(true)).catch(() => {});
        }, 300);
      }
    }
  }, [currentPassageQ?.audioUrl]);

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration || 75);
    }
  };

  // Audio Play/Pause handlers
  const togglePlay = () => {
    if (isCurrentLocked) {
      setShowPricingModal(true);
      return;
    }
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play()
        .then(() => setIsPlaying(true))
        .catch(e => console.warn('Audio play error:', e));
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
      if (audioRef.current.duration && !isNaN(audioRef.current.duration)) {
        setDuration(audioRef.current.duration);
      }
    }
  };

  const handleSeek = (seconds) => {
    if (audioRef.current) {
      audioRef.current.currentTime = Math.max(0, Math.min(duration, audioRef.current.currentTime + seconds));
    }
  };

  const handleSpeedChange = () => {
    const speeds = [0.8, 1.0, 1.2, 1.5];
    const nextIdx = (speeds.indexOf(playbackSpeed) + 1) % speeds.length;
    const nextSpeed = speeds[nextIdx];
    setPlaybackSpeed(nextSpeed);
    if (audioRef.current) {
      audioRef.current.playbackRate = nextSpeed;
    }
  };

  // Keyboard Shortcuts (Ctrl: Play/Pause, Shift: Rewind 3s, 1-4: Options)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Control') {
        togglePlay();
      } else if (e.key === 'Shift') {
        handleSeek(-3);
      } else if (['1', '2', '3', '4'].includes(e.key)) {
        const optLabels = ['(A)', '(B)', '(C)', '(D)'];
        const chosen = optLabels[Number(e.key) - 1];
        if (chosen) {
          if (isPassageMode) {
            // Find first unanswered subquestion in passage
            const unansweredSubIdx = currentPassageQuestions.findIndex((_, subI) => !selectedAnswers[currentPassageIdx * 3 + subI]);
            if (unansweredSubIdx !== -1) {
              handleSelectOption(currentPassageIdx * 3 + unansweredSubIdx, chosen);
            }
          } else {
            handleSelectOption(currentIdx, chosen);
          }
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPlaying, currentIdx, currentPassageIdx, isPassageMode, selectedAnswers, currentPassageQuestions]);

  // Handle Option Click for a specific global question index
  const handleSelectOption = (targetQIdx, optLabel) => {
    if (isQuestionLocked(targetQIdx)) {
      setShowPricingModal(true);
      return;
    }
    if (selectedAnswers[targetQIdx]) return; // Answered already
    const nextAnswers = { ...selectedAnswers, [targetQIdx]: optLabel };
    setSelectedAnswers(nextAnswers);

    const targetQ = activeQuestions[targetQIdx];
    const isCorrect = targetQ?.options?.find(o => o.label === optLabel)?.isCorrect;
    let nextCorrect = correctCount;
    let nextXp = xpCount;

    if (isCorrect) {
      nextCorrect += 1;
      nextXp += 5;
      setCorrectCount(nextCorrect);
      setXpCount(nextXp);
      if (isSFX) playSfx('correct');
    } else {
      if (isSFX) playSfx('incorrect');
      // Auto-record listening mistake to Sổ Tay Câu Sai
      try {
        const correctIdx = targetQ?.options?.findIndex(o => o.isCorrect);
        const userOptIdx = targetQ?.options?.findIndex(o => o.label === optLabel);
        const partNumber = targetQ?.part || Number(partNum) || 1;

        axios.post('/api/v1/mistakes', {
          questionId: `listen-${targetQ?._id || targetQIdx + 1}`,
          part: partNumber,
          section: 'LISTENING',
          prompt: targetQ?.prompt || targetQ?.promptText || `Listening Part ${partNumber} Câu ${targetQIdx + 1}`,
          passageText: targetQ?.transcript || targetQ?.prompt || `Listening Câu ${targetQIdx + 1}`,
          audioUrl: targetQ?.audioUrl || activeQuestions[0]?.audioUrl || '',
          imageUrl: targetQ?.imageUrl || '',
          options: (targetQ?.options || []).map(o => ({
            label: o.label || '',
            text: o.text || o.vietnamese || o.label || ''
          })),
          correctAnswer: correctIdx !== -1 ? correctIdx : 0,
          userAnswer: userOptIdx !== -1 ? userOptIdx : 1,
          explanation: targetQ?.explanation || targetQ?.transcript || 'Luyện nghe kỹ từ khóa và phản xạ câu trả lời nhanh.',
          translation: targetQ?.translation || '',
          categoryTag: `Part ${partNumber} Listening`
        }).catch(() => {});
      } catch (err) {}
    }

    // Instantly sync practice progress to backend & local storage
    syncProgressToStorage(nextAnswers, nextCorrect, nextXp).catch(() => {});
  };

  const playSfx = (type) => {
    try {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.connect(gain);
      gain.connect(audioCtx.destination);

      if (type === 'correct') {
        osc.frequency.setValueAtTime(587.33, audioCtx.currentTime); // D5
        osc.frequency.setValueAtTime(880, audioCtx.currentTime + 0.1); // A5
        gain.gain.setValueAtTime(0.15, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.3);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.3);
      } else {
        osc.frequency.setValueAtTime(250, audioCtx.currentTime);
        osc.frequency.setValueAtTime(180, audioCtx.currentTime + 0.1);
        gain.gain.setValueAtTime(0.15, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.3);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.3);
      }
    } catch (e) {
      // AudioContext not allowed
    }
  };

  const handleNext = () => {
    if (isPassageMode) {
      if (currentPassageIdx < totalPassages - 1) {
        const nextPIdx = currentPassageIdx + 1;
        if (isPassageLocked(nextPIdx)) {
          setShowPricingModal(true);
          return;
        }
        setCurrentIdx(nextPIdx * 3);
        setIsPlaying(false);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    } else {
      if (currentIdx < activeQuestions.length - 1) {
        const nextQIdx = currentIdx + 1;
        if (isQuestionLocked(nextQIdx)) {
          setShowPricingModal(true);
          return;
        }
        setCurrentIdx(nextQIdx);
        setIsPlaying(false);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }
  };

  const handlePrev = () => {
    if (isPassageMode) {
      if (currentPassageIdx > 0) {
        setCurrentIdx((currentPassageIdx - 1) * 3);
        setIsPlaying(false);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    } else {
      if (currentIdx > 0) {
        setCurrentIdx(prev => prev - 1);
        setIsPlaying(false);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }
  };

  const toggleBookmark = (idx) => {
    setBookmarkedQuestions(prev => ({ ...prev, [idx]: !prev[idx] }));
  };

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`;
  };

  // Flexible Vocabulary Section (Rendered on Right Column for Part 1/2, Left Column for Part 3/4)
  const renderVocabularySection = (isEmbedded = false) => {
    if (!currentPassageQ?.vocabularyList || currentPassageQ.vocabularyList.length === 0) return null;

    return (
      <div className={`p-5 rounded-3xl glass-panel border dark:border-slate-800 border-slate-200 dark:bg-slate-900/70 bg-white space-y-3 shadow-md ${isEmbedded ? 'pt-4 border-t dark:border-slate-800/80 border-slate-200' : 'animate-fadeIn'}`}>
        <div className="flex items-center justify-between border-b dark:border-slate-800/80 border-slate-200 pb-3">
          <div className="flex items-center gap-2 text-xs font-bold text-amber-500 dark:text-amber-400">
            <Sparkles className="w-3.5 h-3.5" />
            <span>📖 TỪ VỰNG NÊN HỌC ({currentPassageQ.vocabularyList.length} từ)</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setHideVocabMeaning(!hideVocabMeaning)}
              className="p-1.5 rounded-lg text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white dark:bg-slate-800/80 bg-slate-100 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer"
              title={hideVocabMeaning ? "Hiện nghĩa từ" : "Ẩn nghĩa từ để tự kiểm tra"}
            >
              {hideVocabMeaning ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
            </button>

            <button
              onClick={handleAddSelectedToBasket}
              className="px-3 py-1 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 text-xs font-bold transition-all shadow-md shadow-amber-500/20 active:scale-95 cursor-pointer"
            >
              + Thêm vào giỏ từ ({selectedVocabIndices.size})
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-2.5">
          {currentPassageQ.vocabularyList.map((v, vIdx) => {
            const isSelected = selectedVocabIndices.has(vIdx);

            return (
              <div 
                key={vIdx}
                className={`p-3 rounded-2xl dark:bg-slate-950/80 bg-slate-50 border transition-all ${
                  isSelected ? 'border-amber-500/40 bg-amber-500/5 shadow-sm' : 'dark:border-slate-800/80 border-slate-200'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-start gap-2.5">
                    <input 
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => {
                        const next = new Set(selectedVocabIndices);
                        if (next.has(vIdx)) next.delete(vIdx);
                        else next.add(vIdx);
                        setSelectedVocabIndices(next);
                      }}
                      className="mt-1 rounded accent-amber-500 cursor-pointer"
                    />

                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-cyan-600 dark:text-cyan-300 text-sm sm:text-base">{v.word}</span>
                        <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">({v.pos || 'n'})</span>
                        <span className="px-1.5 py-0.2 rounded dark:bg-slate-800 bg-slate-200 text-[10px] text-amber-600 dark:text-amber-400 font-bold">
                          {v.level || 'B1'}
                        </span>

                        {/* US / UK Pronunciation Buttons */}
                        <div className="flex items-center gap-1.5 ml-1">
                          <button 
                            onClick={() => speakWord(v.word, 'en-US')}
                            className="px-1.5 py-0.5 rounded dark:bg-slate-800 bg-slate-200 hover:bg-slate-300 dark:hover:bg-slate-700 text-[10px] font-bold text-sky-600 dark:text-sky-300 flex items-center gap-0.5 transition-colors cursor-pointer"
                          >
                            <span>US</span>
                            <Volume2 className="w-2.5 h-2.5" />
                          </button>
                          <button 
                            onClick={() => speakWord(v.word, 'en-GB')}
                            className="px-1.5 py-0.5 rounded dark:bg-slate-800 bg-slate-200 hover:bg-slate-300 dark:hover:bg-slate-700 text-[10px] font-bold text-purple-600 dark:text-purple-300 flex items-center gap-0.5 transition-colors cursor-pointer"
                          >
                            <span>UK</span>
                            <Volume2 className="w-2.5 h-2.5" />
                          </button>
                        </div>
                      </div>

                      {!hideVocabMeaning && (
                        <>
                          <p className="text-xs dark:text-slate-200 text-slate-700 font-medium">{v.meaning}</p>
                          {v.example && (
                            <p className="text-[11px] text-slate-500 dark:text-slate-400 italic">
                              "{v.example}" {v.exampleTrans && <span className="text-slate-400 dark:text-slate-500">→ {v.exampleTrans}</span>}
                            </p>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div 
      data-deck-name={currentDeckName}
      className="min-h-screen dark:bg-slate-950 bg-[#f8fafc] dark:text-slate-100 text-slate-900 flex flex-col justify-between selection:bg-cyan-500 selection:text-slate-950 font-sans transition-colors duration-200"
    >
      
      {/* Floating Toast Message */}
      {toastMsg && (
        <div className="fixed top-20 right-6 z-50 px-4 py-2.5 rounded-2xl dark:bg-slate-900 bg-white border border-amber-500/50 text-amber-600 dark:text-amber-300 text-xs sm:text-sm font-bold shadow-2xl animate-scaleUp flex items-center gap-2">
          <span>✨</span>
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Hidden Native Audio Element */}
      <audio 
        ref={audioRef}
        src={currentPassageQ?.audioUrl || "https://qfhmnlvgweznzcsoijyr.supabase.co/storage/v1/object/public/mock-test-media/2026/t1/32-34.mp3"}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={() => {
          if (isLoopAudio) {
            audioRef.current?.play();
          } else {
            setIsPlaying(false);
          }
        }}
        preload="auto"
      />

      {/* 1. TOP HEADER TOOLBAR - EXACT ĐẬU TOEIC VIP FORMAT */}
      <header className="h-16 border-b dark:border-slate-800/90 border-slate-200 dark:bg-slate-950 bg-white px-3 sm:px-6 flex items-center justify-between sticky top-0 z-40 gap-2 overflow-x-auto no-scrollbar shadow-sm">
        
        {/* Left: Thoát & Level Badge */}
        <div className="flex items-center gap-3 shrink-0">
          <button 
            onClick={() => setShowExitModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl dark:bg-slate-900 bg-slate-100 border dark:border-slate-800 border-slate-200 hover:border-slate-300 dark:hover:border-slate-700 dark:text-slate-300 text-slate-700 hover:text-slate-900 dark:hover:text-white transition-colors text-xs font-bold cursor-pointer"
            title="Thoát phòng luyện"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Thoát</span>
          </button>
          
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-600 dark:text-cyan-400 text-xs font-heading font-black">
              {levelTitle}
            </span>
          </div>
        </div>

        {/* Center: Tools (Annotator, Song ngữ 👑, Dẫn chứng 👑, Ghi chú, Điền Từ, Lật từ, Lặp...) */}
        <div className="flex items-center gap-1 sm:gap-1.5 dark:bg-slate-900/90 bg-slate-100 p-1 rounded-2xl border dark:border-slate-800 border-slate-200 shrink-0">
          {/* Annotator Tool */}
          <button 
            onClick={() => {
              setIsAnnotator(!isAnnotator);
              setToastMsg(!isAnnotator ? 'Đã bật Annotator (Bút dạ quang) ✏️' : 'Đã tắt Annotator');
              setTimeout(() => setToastMsg(null), 2000);
            }}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
              isAnnotator ? 'bg-sky-500/20 border border-sky-500 text-sky-600 dark:text-sky-300 shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white'
            }`}
            title="Công cụ bút dạ quang"
          >
            <Highlighter className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Annotator</span>
          </button>

          {/* Song Ngữ 👑 */}
          <button 
            onClick={() => {
              setIsSongNgu(!isSongNgu);
              setToastMsg(isSongNgu ? 'Đã tắt Song ngữ' : 'Đã bật Song ngữ Anh - Việt 👑');
              setTimeout(() => setToastMsg(null), 2000);
            }}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
              isSongNgu 
                ? 'bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-500/50 text-amber-600 dark:text-amber-300 shadow-sm' 
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white'
            }`}
            title="Bật/Tắt hiển thị bản dịch câu hỏi & đáp án"
          >
            <Languages className="w-3.5 h-3.5" />
            <span>Song ngữ</span>
            <Crown className="w-3 h-3 text-amber-400 fill-amber-400" />
          </button>

          {/* Dẫn Chứng 👑 */}
          <button 
            onClick={() => {
              if (!anyCurrentPassageAnswered) {
                setToastMsg('Vui lòng chọn đáp án trước khi bật Dẫn chứng! 💡');
                setTimeout(() => setToastMsg(null), 2500);
                return;
              }
              setIsDanChung(!isDanChung);
            }}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
              isDanChung 
                ? 'bg-gradient-to-r from-sky-500/20 to-cyan-500/20 border border-cyan-500/50 text-sky-600 dark:text-cyan-300 shadow-sm' 
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white'
            }`}
            title="Tô màu dẫn chứng câu hỏi trên Transcript"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Dẫn chứng</span>
            <Crown className="w-3 h-3 text-amber-400 fill-amber-400" />
          </button>

          {/* Ghi chú */}
          <button 
            onClick={() => setShowNoteModal(true)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-bold text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white transition-all"
            title="Ghi chú câu hỏi"
          >
            <FileText className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Ghi chú</span>
          </button>

          {/* Điền từ (Dictation mode) */}
          <button 
            onClick={() => setShowDictationModal(true)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-bold text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white transition-all"
            title="Chế độ điền từ"
          >
            <PenTool className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Điền Từ</span>
          </button>

          {/* Lật từ (Flashcards) */}
          <button 
            onClick={() => setShowFlashcards(true)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-bold text-slate-500 dark:text-slate-400 hover:text-amber-500 dark:hover:text-amber-400 transition-all"
            title="Lật thẻ từ vựng Flashcard"
          >
            <BookOpen className="w-3.5 h-3.5 text-amber-500 dark:text-amber-400" />
            <span className="hidden sm:inline">Lật Từ</span>
          </button>

          {/* Nút Làm lại bài từ đầu */}
          <button 
            onClick={handleResetListeningProgress}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-bold text-slate-500 dark:text-slate-400 hover:text-rose-500 dark:hover:text-rose-400 hover:bg-rose-500/10 transition-all"
            title="Làm lại bài từ câu đầu tiên (Reset tiến độ)"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Làm lại</span>
          </button>

          {/* Lặp audio */}
          <button 
            onClick={() => setIsLoopAudio(!isLoopAudio)}
            className={`p-1.5 rounded-xl text-xs font-bold transition-all ${
              isLoopAudio ? 'bg-indigo-500/20 border border-indigo-500 text-indigo-600 dark:text-indigo-300' : 'text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
            title="Tự động lặp lại bài nghe"
          >
            <Repeat className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Right: Counter, XP & SFX */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-900 border dark:border-slate-800 border-slate-200 text-xs font-mono font-bold">
            <span className="text-emerald-500 font-bold">✓ {correctCount}/{Object.keys(selectedAnswers).length}</span>
            <span className="text-slate-400">|</span>
            <span className="text-slate-600 dark:text-slate-300">
              Câu {isPassageMode ? `${currentPassageIdx * 3 + 1}-${Math.min(activeQuestions.length, currentPassageIdx * 3 + 3)}` : currentIdx + 1}/{activeQuestions.length}
            </span>
          </div>

          <div className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-600 dark:text-amber-400 text-xs font-heading font-black">
            <span>⚡</span>
            <span>+{xpCount} XP</span>
          </div>

          <button 
            onClick={() => setIsSFX(!isSFX)}
            className={`p-2 rounded-xl text-xs font-bold transition-all ${
              isSFX ? 'text-cyan-600 dark:text-cyan-400 bg-cyan-500/10' : 'text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
            title="Âm thanh hiệu ứng"
          >
            <Zap className="w-3.5 h-3.5" />
          </button>
        </div>

      </header>

      {/* 2. MAIN 2-COLUMN WORKSPACE */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 pb-44 sm:pb-48 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* LEFT COLUMN: INSTRUCTIONS + WAVEFORM AUDIO + TRANSCRIPT (6 of 12) */}
        <div className="lg:col-span-6 space-y-4">
          
          {/* Instructions Bar */}
          <div className="text-xs sm:text-sm font-semibold dark:text-slate-300 text-slate-700 dark:bg-slate-900/60 bg-white p-3 rounded-2xl border dark:border-slate-800/80 border-slate-200 flex items-center justify-between shadow-sm">
            <span>Select the best response to each question.</span>
            <span className="text-[11px] font-mono text-cyan-600 dark:text-cyan-400 font-bold">Part {partNum}</span>
          </div>

          {/* Audio Player Card with Waveform */}
          <div className="p-5 rounded-3xl glass-panel border dark:border-slate-800 border-slate-200 dark:bg-slate-900/70 bg-white space-y-4 shadow-md">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Volume2 className="w-4 h-4 text-cyan-500" />
                <span className="text-xs font-extrabold uppercase tracking-wider dark:text-slate-300 text-slate-700">
                  {isPassageMode 
                    ? `Audio Hội Thoại • ${currentPassageTitle}`
                    : `Audio ETS Listening • Câu ${currentIdx + 1}`
                  }
                </span>
              </div>
              <button 
                onClick={handleSpeedChange}
                className="px-2.5 py-0.5 rounded-lg dark:bg-slate-800 bg-slate-100 hover:bg-slate-200 dark:hover:bg-slate-700 text-cyan-600 dark:text-cyan-300 font-mono text-xs font-bold transition-colors"
                title="Tốc độ phát"
              >
                {playbackSpeed}x
              </button>
            </div>

            {/* Simulated Animated Waveform Bars */}
            <div className="h-14 dark:bg-slate-950/80 bg-slate-100 rounded-2xl border dark:border-slate-800/80 border-slate-200 px-4 flex items-center justify-center gap-1 overflow-hidden">
              {Array.from({ length: 36 }).map((_, i) => {
                const heights = [20, 45, 75, 90, 60, 30, 85, 40, 65, 95, 35, 50, 80, 100, 70, 40, 25, 90, 60, 30, 85, 40, 65, 95, 35, 50, 80, 100, 70, 40, 25, 60, 40, 75, 50, 30];
                const h = heights[i % heights.length];
                return (
                  <div
                    key={i}
                    style={{ height: isPlaying ? `${Math.max(15, (h * Math.sin((currentTime * 5) + i)).toFixed(0))}%` : `${h * 0.4}%` }}
                    className={`w-1.5 rounded-full transition-all duration-150 ${
                      (i / 36) <= (currentTime / (duration || 75))
                        ? 'bg-gradient-to-t from-cyan-500 to-indigo-400' 
                        : 'dark:bg-slate-800 bg-slate-300'
                    }`}
                  />
                );
              })}
            </div>

            {/* Playhead Progress & Controls */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-[11px] font-mono dark:text-slate-400 text-slate-500 font-bold">
                <span>{formatTime(currentTime)}</span>
                <span>{formatTime(duration)}</span>
              </div>

              <div className="flex items-center justify-center gap-4 pt-1">
                <button
                  onClick={() => handleSeek(-3)}
                  className="p-2 rounded-xl dark:bg-slate-800/80 bg-slate-100 hover:bg-slate-200 dark:hover:bg-slate-700 dark:text-slate-300 text-slate-700 transition-colors flex items-center gap-1 text-xs font-bold"
                  title="Lùi 3 giây"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>3s</span>
                </button>

                <button
                  onClick={togglePlay}
                  className="p-4 rounded-2xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold shadow-lg shadow-cyan-500/25 transition-all transform hover:scale-105 active:scale-95"
                  title={isPlaying ? "Tạm dừng" : "Phát âm thanh"}
                >
                  {isPlaying ? <Pause className="w-6 h-6 fill-current" /> : <Play className="w-6 h-6 fill-current ml-0.5" />}
                </button>

                <button
                  onClick={() => handleSeek(5)}
                  className="p-2 rounded-xl dark:bg-slate-800/80 bg-slate-100 hover:bg-slate-200 dark:hover:bg-slate-700 dark:text-slate-300 text-slate-700 transition-colors flex items-center gap-1 text-xs font-bold"
                  title="Tiến 5 giây"
                >
                  <RotateCw className="w-3.5 h-3.5" />
                  <span>5s</span>
                </button>
              </div>

              {/* Keyboard Shortcuts Hint Bar */}
              <div className="pt-2 border-t dark:border-slate-800/60 border-slate-200 flex items-center justify-center gap-4 text-[11px] dark:text-slate-400 text-slate-500">
                <span className="flex items-center gap-1">
                  <kbd className="px-1.5 py-0.5 rounded dark:bg-slate-800 bg-slate-100 border dark:border-slate-700 border-slate-300 dark:text-slate-300 text-slate-600 font-mono text-[10px]">ctrl</kbd> Phát/Dừng
                </span>
                <span className="flex items-center gap-1">
                  <kbd className="px-1.5 py-0.5 rounded dark:bg-slate-800 bg-slate-100 border dark:border-slate-700 border-slate-300 dark:text-slate-300 text-slate-600 font-mono text-[10px]">shift</kbd> Tua lại 3s
                </span>
                <span className="flex items-center gap-1">
                  <kbd className="px-1.5 py-0.5 rounded dark:bg-slate-800 bg-slate-100 border dark:border-slate-700 border-slate-300 dark:text-slate-300 text-slate-600 font-mono text-[10px]">1-4</kbd> Chọn đáp án
                </span>
              </div>
            </div>
          </div>

          {/* Part 1 Picture or Part 3/4 Chart Image if available */}
          {currentPassageImageUrl && (
            <div className="rounded-3xl overflow-hidden border dark:border-slate-800 border-slate-200 dark:bg-slate-900/60 bg-white shadow-md relative group">
              <div className="aspect-[16/10] w-full relative dark:bg-slate-950 bg-slate-100 flex items-center justify-center overflow-hidden p-2">
                <img 
                  src={currentPassageImageUrl} 
                  alt={currentPassageTitle}
                  className="w-full h-full object-contain rounded-2xl transition-transform duration-500 group-hover:scale-105"
                  loading="lazy"
                  onError={(e) => {
                    e.currentTarget.parentElement.parentElement.style.display = 'none';
                  }}
                />
              </div>
            </div>
          )}

          {/* TRANSCRIPT & DẪN CHỨNG KHUNG LỜI THOẠI (Chỉ mở khóa sau khi người dùng đã chọn đáp án) */}
          {anyCurrentPassageAnswered ? (
            <div className="p-5 rounded-3xl border dark:border-slate-800 border-slate-200 dark:bg-slate-900/80 bg-white space-y-4 shadow-md animate-fadeIn">
              <div className="flex items-center justify-between border-b dark:border-slate-800/80 border-slate-200 pb-3">
                <div className="flex items-center gap-2 text-xs font-bold text-cyan-600 dark:text-cyan-400">
                  <BookOpen className="w-4 h-4" />
                  <span>TRANSCRIPT & DẪN CHỨNG LỜI THOẠI</span>
                </div>
                <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-700 dark:text-cyan-300">
                  {currentPassageTitle}
                </span>
              </div>

              <div className="space-y-3 text-sm">
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <h4 className="text-xs font-bold dark:text-slate-400 text-slate-500 uppercase tracking-wider">Transcript Tiếng Anh:</h4>
                    {isDanChung && (
                      <span className="text-[10px] font-bold text-amber-600 dark:text-amber-300 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/30">
                        💡 Dẫn chứng đang bật
                      </span>
                    )}
                  </div>
                  <div className="font-medium dark:text-white text-slate-800 leading-relaxed whitespace-pre-line dark:bg-slate-950/80 bg-slate-50 p-4 rounded-2xl border dark:border-slate-800/80 border-slate-200">
                    {currentPassageQ?.transcript}
                  </div>
                </div>

                <div>
                  <h4 className="text-xs font-bold dark:text-slate-400 text-slate-500 uppercase tracking-wider mb-1">Lời dịch Tiếng Việt:</h4>
                  <div className="dark:text-slate-300 text-slate-600 italic leading-relaxed whitespace-pre-line dark:bg-slate-950/50 bg-slate-50/70 p-4 rounded-2xl border dark:border-slate-800/60 border-slate-200">
                    {currentPassageQ?.translation}
                  </div>
                </div>

                {/* LỜI GIẢI & PHÂN TÍCH BẪY ETS (HIỂN THỊ TOÀN BỘ CÂU TRONG NHÓM) */}
                {isPassageMode ? (
                  currentPassageQuestions.some(q => q?.explanation) && (
                    <div className="pt-2 space-y-3">
                      <div className="flex items-center gap-2 text-xs font-bold text-amber-600 dark:text-amber-400">
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>LỜI GIẢI & PHÂN TÍCH BẪY ETS ({currentPassageQuestions.length} CÂU HỎI)</span>
                      </div>
                      <div className="space-y-3">
                        {currentPassageQuestions.map((qSub, sIdx) => {
                          if (!qSub?.explanation) return null;
                          const qNum = qSub.testQuestionNumber || (currentPassageIdx * 3 + sIdx + 1);
                          return (
                            <div key={sIdx} className="p-4 rounded-2xl bg-amber-500/5 border border-amber-500/20 space-y-2">
                              <div className="flex items-center gap-2 text-xs font-bold text-amber-700 dark:text-amber-300">
                                <span className="px-2 py-0.5 rounded-md bg-amber-500/15 border border-amber-500/30">
                                  Câu {qNum}
                                </span>
                                <span className="line-clamp-1">{qSub.promptText}</span>
                              </div>
                              <div className="text-xs dark:text-slate-300 text-slate-600 leading-relaxed whitespace-pre-line font-normal">
                                {qSub.explanation}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )
                ) : (
                  currentPassageQ?.explanation && (
                    <div className="pt-2">
                      <div className="p-4 rounded-2xl bg-amber-500/5 border border-amber-500/20 space-y-2">
                        <div className="flex items-center gap-2 text-xs font-bold text-amber-600 dark:text-amber-400">
                          <Sparkles className="w-3.5 h-3.5" />
                          <span>LỜI GIẢI & PHÂN TÍCH BẪY ETS</span>
                        </div>
                        <div className="text-xs dark:text-slate-300 text-slate-600 leading-relaxed whitespace-pre-line font-normal">
                          {currentPassageQ.explanation}
                        </div>
                      </div>
                    </div>
                  )
                )}
                {/* In Passage Mode (Part 3/4), Vocabulary is rendered in Left Column */}
                {isPassageMode && renderVocabularySection(true)}
              </div>
            </div>
          ) : (
            <div className="p-6 sm:p-8 rounded-3xl border border-dashed dark:border-slate-800/90 border-slate-300 dark:bg-slate-900/40 bg-white text-center space-y-3 shadow-md">
              <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-600 dark:text-cyan-400 flex items-center justify-center mx-auto shadow-inner">
                <BookOpen className="w-6 h-6" />
              </div>
              <div className="space-y-1.5">
                <h4 className="text-sm sm:text-base font-heading font-extrabold dark:text-slate-200 text-slate-800">
                  Transcript & Lời Dịch Đang Khóa 🔒
                </h4>
                <p className="text-xs dark:text-slate-400 text-slate-500 max-w-md mx-auto leading-relaxed">
                  Lắng nghe audio bài nghe và chọn đáp án trước. Transcript kịch bản, dẫn chứng và lời giải chi tiết sẽ tự động mở khóa ngay sau khi bạn chọn đáp án!
                </p>
              </div>
            </div>
          )}

          {/* BOTTOM SPACER BUFFER (Tránh bị thanh cố định che khi cuộn hết cỡ) */}
          <div className="h-28 sm:h-36 shrink-0 pointer-events-none" aria-hidden="true" />

        </div>

        {/* RIGHT COLUMN: 3 VERTICAL QUESTIONS & BUBBLES (6 of 12) */}
        <div className="lg:col-span-6 space-y-5 flex flex-col justify-between">
          
          <div className="space-y-4">
            
            {/* Top Row: Level Tag & Hỏi Bài */}
            <div className="flex items-center justify-between">
              <span className="px-3 py-1 rounded-xl bg-cyan-500 text-slate-950 font-heading font-extrabold text-xs">
                {levelTitle.split(' ')[0]} • {currentPassageTitle}
              </span>

              <button 
                onClick={() => setShowAiModal(true)}
                className="flex items-center gap-1.5 px-3 py-1 rounded-xl dark:bg-slate-900 bg-white border dark:border-slate-800 border-slate-200 dark:text-slate-300 text-slate-700 hover:text-slate-900 dark:hover:text-white text-xs font-bold transition-colors shadow-sm"
              >
                <Sparkles className="w-3.5 h-3.5 text-cyan-500" />
                <span>Hỏi bài</span>
              </button>
            </div>

            {/* RENDER 3 QUESTIONS VERTICALLY OR VIP LOCK CARD */}
            {isCurrentLocked ? (
              <div className="p-8 sm:p-10 rounded-3xl glass-panel border border-amber-500/40 dark:bg-slate-900/90 bg-white text-center space-y-5 shadow-2xl animate-fadeIn">
                <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-amber-500 to-amber-300 text-slate-950 flex items-center justify-center mx-auto shadow-lg shadow-amber-500/30">
                  <Crown className="w-8 h-8 fill-slate-950" />
                </div>
                <div className="space-y-2 max-w-md mx-auto">
                  <span className="px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/30 text-amber-600 dark:text-amber-400 font-heading font-black text-xs uppercase tracking-wider inline-flex items-center gap-1.5">
                    <Crown className="w-3.5 h-3.5 fill-amber-500" /> Dành riêng cho Thành viên VIP PRO
                  </span>
                  <h3 className="text-lg sm:text-xl font-heading font-extrabold dark:text-white text-slate-900">
                    Bạn đã hoàn thành 20 câu miễn phí!
                  </h3>
                  <p className="text-xs sm:text-sm dark:text-slate-400 text-slate-600 leading-relaxed">
                    Nâng cấp VIP PRO chỉ 99.000đ (4 tháng) để mở khóa trọn bộ {activeQuestions.length} câu hỏi Level 1 và toàn bộ 5 Levels Part {partNum} cùng đầy đủ transcript, dịch nghĩa và phân tích bẫy ETS!
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                  <button
                    onClick={() => setShowPricingModal(true)}
                    className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-heading font-black text-sm shadow-xl shadow-amber-500/25 transition-all transform hover:scale-105 active:scale-95 cursor-pointer flex items-center justify-center gap-2"
                  >
                    <Crown className="w-4 h-4 fill-slate-950" />
                    <span>Nâng cấp VIP Ngay (99.000 ₫)</span>
                  </button>
                  <button
                    onClick={() => {
                      setCurrentIdx(0);
                      setIsPlaying(false);
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="w-full sm:w-auto px-5 py-3 rounded-2xl dark:bg-slate-800 bg-slate-100 hover:bg-slate-200 dark:hover:bg-slate-700 dark:text-slate-300 text-slate-700 font-bold text-xs transition-colors cursor-pointer"
                  >
                    ← Quay lại 20 câu miễn phí
                  </button>
                </div>
              </div>
            ) : (
              currentPassageQuestions.map((qItem, subIdx) => {
              if (!qItem) return null;
              const qGlobalIdx = isPassageMode ? currentPassageIdx * 3 + subIdx : currentIdx;
              const qUserChoice = selectedAnswers[qGlobalIdx];
              const isThisQAnswered = Boolean(qUserChoice);

              return (
                <div 
                  key={qGlobalIdx}
                  className="p-5 sm:p-6 rounded-3xl glass-panel border dark:border-slate-800 border-slate-200 dark:bg-slate-900/60 bg-white space-y-4 shadow-md"
                >
                  
                  {/* Question Header & Prompt */}
                  <div className="flex items-start justify-between border-b dark:border-slate-800/80 border-slate-200 pb-3 gap-3">
                    <div className="flex items-start gap-2.5 flex-1">
                      <span className="font-heading font-black text-lg text-cyan-600 dark:text-cyan-400 shrink-0">
                        {qItem.testQuestionNumber || (qGlobalIdx + 1)}.
                      </span>
                      <div className="space-y-1">
                        <span className="text-sm sm:text-base font-semibold dark:text-slate-100 text-slate-900 leading-snug block">
                          {qItem.promptText}
                        </span>
                        {/* Vietnamese Translation of Question Prompt (Chỉ hiển thị khi đã làm câu hỏi VÀ bật Song ngữ VÀ là tiếng Việt thực sự) */}
                        {isThisQAnswered && isSongNgu && qItem.promptTranslation && 
                          qItem.promptTranslation.trim().toLowerCase() !== (qItem.promptText || '').trim().toLowerCase() &&
                          !/mymemory/i.test(qItem.promptTranslation) &&
                          !/^(Nữ|Nam|Người nói|Người phụ nữ|Người đàn ông|W|M|W-[a-zA-Z]+|M-[a-zA-Z]+|Man|Woman|Narrator|Speaker)\s*:/iu.test(qItem.promptTranslation) && (
                          <div className="text-xs sm:text-sm text-sky-600 dark:text-sky-300/90 font-medium italic border-l-2 border-cyan-400/80 pl-2.5 mt-1">
                            {qItem.promptTranslation}
                          </div>
                        )}
                      </div>
                    </div>

                    <button
                      onClick={() => toggleBookmark(qGlobalIdx)}
                      className={`p-1.5 rounded-lg transition-colors shrink-0 ${
                        bookmarkedQuestions[qGlobalIdx] ? 'text-amber-400 bg-amber-500/20' : 'text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-white'
                      }`}
                      title="Đánh dấu câu hỏi"
                    >
                      <Star className="w-4 h-4 fill-current" />
                    </button>
                  </div>

                  {/* BUBBLE OPTIONS (A, B, C, D) - IN PART 3 & 4, OPTION TEXT IS ALWAYS VISIBLE! */}
                  <div className="space-y-2.5 pt-1">
                    {qItem.options?.map((opt) => {
                      const isSelected = qUserChoice === opt.label;
                      const isThisCorrect = opt.isCorrect;

                      let cardStyles = 'dark:bg-slate-900/80 bg-white dark:border-slate-800 border-slate-200 dark:text-slate-300 text-slate-700 hover:border-slate-300 dark:hover:border-slate-700 dark:hover:bg-slate-800/60 hover:bg-slate-50 shadow-sm';
                      let bubbleStyles = 'dark:bg-slate-800 bg-slate-100 dark:text-slate-400 text-slate-600 font-bold';
                      let transBorderColor = 'dark:border-slate-700 border-slate-300 dark:text-slate-400 text-slate-500';

                      if (isThisQAnswered) {
                        if (isThisCorrect) {
                          cardStyles = 'bg-emerald-500/10 border-emerald-500/80 text-emerald-800 dark:text-emerald-100 shadow-md shadow-emerald-500/10 font-bold';
                          bubbleStyles = 'bg-emerald-500 text-slate-950 font-bold';
                          transBorderColor = 'border-emerald-400 text-emerald-700 dark:text-emerald-300/90';
                        } else if (isSelected && !isThisCorrect) {
                          cardStyles = 'bg-rose-500/10 border-rose-500/80 text-rose-800 dark:text-rose-100 shadow-md shadow-rose-500/10 font-bold';
                          bubbleStyles = 'bg-rose-500 text-white font-bold';
                          transBorderColor = 'border-rose-400 text-rose-700 dark:text-rose-300/90';
                        } else {
                          cardStyles = 'dark:bg-slate-900/40 bg-slate-50 dark:border-slate-800/60 border-slate-200 dark:text-slate-400 text-slate-500 opacity-80';
                          bubbleStyles = 'dark:bg-slate-800 bg-slate-200 dark:text-slate-500 text-slate-400';
                          transBorderColor = 'dark:border-slate-700 border-slate-300 dark:text-slate-400 text-slate-500';
                        }
                      } else if (isSelected) {
                        cardStyles = 'bg-cyan-500/10 border-cyan-500 text-cyan-800 dark:text-cyan-200';
                        bubbleStyles = 'bg-cyan-500 text-slate-950 font-bold';
                      }

                      return (
                        <button
                          key={opt.label}
                          onClick={() => handleSelectOption(qGlobalIdx, opt.label)}
                          className={`w-full p-3.5 sm:p-4 rounded-2xl border text-left transition-all flex flex-col gap-1.5 ${cardStyles}`}
                        >
                          <div className="flex items-center justify-between gap-3 w-full">
                            <div className="flex items-center gap-3">
                              <span className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${bubbleStyles}`}>
                                {opt.label.replace(/[\(\)]/g, '')}
                              </span>
                              
                              {/* Option text: Always visible in Part 3/4, or if answered */}
                              <span className="text-sm sm:text-base font-medium dark:text-slate-100 text-slate-800 leading-snug">
                                {isPassageMode ? opt.text : (isThisQAnswered ? opt.text : opt.label)}
                              </span>
                            </div>

                            {isThisQAnswered && isThisCorrect && (
                              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 animate-scaleUp" />
                            )}
                            {isThisQAnswered && isSelected && !isThisCorrect && (
                              <XCircle className="w-5 h-5 text-rose-400 shrink-0 animate-scaleUp" />
                            )}
                          </div>

                          {/* Sub-line Vietnamese Translation (Chỉ hiển thị khi đã chọn đáp án VÀ bật Song ngữ) */}
                          {(() => {
                            if (!isThisQAnswered || !isSongNgu) return null;
                            let trans = (opt.vietnamese || opt.translation || '').trim();
                            if (/mymemory/i.test(trans) || /^Người\s+[a-zA-Z]/i.test(trans)) {
                              trans = translateToeicOption(opt.text) || '';
                            }
                            if (!trans || trans.toLowerCase() === (opt.text || '').trim().toLowerCase()) {
                              return null;
                            }
                            return (
                              <div className={`border-l-2 ${transBorderColor} pl-3 ml-1 text-xs font-normal leading-relaxed`}>
                                {trans}
                              </div>
                            );
                          })()}
                        </button>
                      );
                    })}
                  </div>

                  {/* Lời giải chi tiết từng câu hỏi (Hiển thị ngay khi người dùng chọn đáp án) */}
                  {isThisQAnswered && qItem.explanation && (
                    <div className="mt-3 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/25 space-y-2 animate-fadeIn">
                      <div className="flex items-center gap-2 text-xs font-bold text-amber-600 dark:text-amber-400">
                        <Sparkles className="w-3.5 h-3.5 shrink-0" />
                        <span>Lời giải & Dẫn chứng câu {qItem.testQuestionNumber || (qGlobalIdx + 1)}:</span>
                      </div>
                      <div className="text-xs dark:text-slate-300 text-slate-700 leading-relaxed whitespace-pre-line font-normal">
                        {qItem.explanation}
                      </div>
                    </div>
                  )}

                </div>
              );
            })
          )}

            {/* In Single Question Mode (Part 1 & Part 2), render Vocabulary in Right Column for perfect 2-column visual balance */}
            {!isPassageMode && !isCurrentLocked && anyCurrentPassageAnswered && renderVocabularySection(false)}

            {/* BOTTOM SPACER BUFFER (Tránh bị thanh cố định che khi cuộn hết cỡ) */}
            <div className="h-28 sm:h-36 shrink-0 pointer-events-none" aria-hidden="true" />

          </div>

        </div>

      </main>

      {/* 3. FOOTER BOTTOM TOOLBAR (FIX CỨNG Ở ĐÁY MÀN HÌNH) */}
      <footer className="fixed bottom-0 left-0 right-0 z-40 h-16 border-t dark:border-slate-800/90 border-slate-200/90 dark:bg-[#070b14]/95 bg-white/95 backdrop-blur-2xl px-4 sm:px-8 flex items-center justify-between gap-4 shadow-[0_-8px_25px_rgba(0,0,0,0.15)] transition-all">
        
        {/* Left Actions: Báo lỗi, Giỏ từ, Tra từ */}
        <div className="flex items-center gap-2">
          <button 
            onClick={() => alert('Đã ghi nhận phản hồi báo lỗi câu hỏi.')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl dark:bg-slate-900 bg-slate-100 border dark:border-slate-800 border-slate-200 dark:text-slate-400 text-slate-600 hover:text-slate-900 dark:hover:text-white text-xs font-bold transition-colors"
          >
            <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">Báo lỗi</span>
          </button>

          <button 
            onClick={() => setShowVocabDrawer(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-700 dark:text-cyan-300 text-xs font-bold hover:bg-cyan-500/20 transition-colors"
          >
            <ShoppingBag className="w-3.5 h-3.5 text-cyan-500" />
            <span>Giỏ từ ({basketCount})</span>
          </button>

          <button 
            onClick={() => {
              if (isDictModalOpen) {
                closeDictionary();
              } else {
                const defaultWord = currentQuestion?.vocabulary?.[0]?.word || '';
                openDictionary(defaultWord);
              }
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold transition-colors ${
              isDictEnabled 
                ? 'bg-sky-500/10 border-sky-500/30 text-sky-600 dark:text-sky-300 hover:bg-sky-500/20' 
                : 'dark:bg-slate-900 bg-slate-100 border dark:border-slate-800 border-slate-200 dark:text-slate-400 text-slate-600 hover:text-slate-900 dark:hover:text-white'
            }`}
            title={isDictEnabled ? "Tra từ (Đang BẬT tự động khi bôi đen)" : "Tra từ"}
          >
            <BookOpen className="w-3.5 h-3.5 text-sky-500" />
            <span>Tra từ {isDictEnabled ? '✓' : ''}</span>
          </button>
        </div>

        {/* Right Navigation: Prev, Grid Matrix, Next */}
        <div className="flex items-center gap-2">
          <button
            onClick={handlePrev}
            disabled={isPassageMode ? currentPassageIdx === 0 : currentIdx === 0}
            className="p-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 disabled:opacity-30 text-slate-950 transition-all font-bold"
            title={isPassageMode ? "Nhóm trước" : "Câu trước"}
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <button
            onClick={() => setShowGridDrawer(!showGridDrawer)}
            className="px-3 py-1.5 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-700 dark:text-emerald-300 font-mono font-extrabold text-xs flex items-center gap-1.5 hover:bg-emerald-500/30 transition-colors"
          >
            <Grid className="w-3.5 h-3.5" />
            <span>
              {isPassageMode 
                ? `${currentPassageIdx + 1}/${totalPassages}` 
                : `${currentIdx + 1}/${activeQuestions.length}`
              }
            </span>
          </button>

          <button
            onClick={handleNext}
            disabled={isPassageMode ? currentPassageIdx === totalPassages - 1 : currentIdx === activeQuestions.length - 1}
            className="p-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 disabled:opacity-30 text-slate-950 transition-all font-bold"
            title={isPassageMode ? "Nhóm tiếp theo" : "Câu tiếp theo"}
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

      </footer>

      {/* 4. QUESTION MATRIX GRID DRAWER */}
      {showGridDrawer && (
        <div 
          className="fixed inset-0 z-50 dark:bg-slate-950/80 bg-slate-900/40 backdrop-blur-sm flex items-end sm:items-center justify-center p-4"
          onClick={() => setShowGridDrawer(false)}
        >
          <div 
            className="glass-card max-w-3xl w-full rounded-3xl border dark:border-slate-800 border-slate-200 dark:bg-slate-950 bg-white p-6 space-y-4 max-h-[85vh] overflow-y-auto shadow-2xl"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b dark:border-slate-800 border-slate-200 pb-3">
              <div>
                <h3 className="font-heading font-extrabold text-base dark:text-white text-slate-900">
                  {isPassageMode ? `DANH SÁCH ${totalPassages} NHÓM HỘI THOẠI (${activeQuestions.length} CÂU ETS)` : `DANH SÁCH ${activeQuestions.length} CÂU HỎI ${levelTitle}`}
                </h3>
                <p className="text-xs dark:text-slate-400 text-slate-500">Chọn nhóm để chuyển nhanh bài tập</p>
              </div>
              <button 
                onClick={() => setShowGridDrawer(false)}
                className="p-1 rounded-lg dark:bg-slate-900 bg-slate-100 dark:text-slate-400 text-slate-500 hover:text-slate-900 dark:hover:text-white"
              >
                ✕
              </button>
            </div>

            {isPassageMode ? (
              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-3">
                {Array.from({ length: totalPassages }).map((_, pIdx) => {
                  const isCurrent = currentPassageIdx === pIdx;
                  const isLocked = isPassageLocked(pIdx);
                  
                  return (
                    <button
                      key={pIdx}
                      onClick={() => {
                        if (isLocked) {
                          setShowPricingModal(true);
                          return;
                        }
                        setCurrentIdx(pIdx * 3);
                        setShowGridDrawer(false);
                        setIsPlaying(false);
                      }}
                      className={`p-3 rounded-2xl border text-left transition-all flex flex-col gap-2 cursor-pointer ${
                        isCurrent 
                          ? 'bg-cyan-500/20 border-cyan-400 ring-2 ring-cyan-400/50' 
                          : isLocked
                          ? 'dark:bg-slate-900/40 bg-slate-100/70 border-dashed border-amber-500/40 opacity-80 hover:opacity-100 hover:border-amber-500'
                          : 'dark:bg-slate-900 bg-slate-50 border dark:border-slate-800 border-slate-200 hover:border-slate-300 dark:hover:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800/80'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-heading font-bold text-xs dark:text-white text-slate-900 flex items-center gap-1">
                          {isLocked && <Crown className="w-3 h-3 text-amber-500 fill-amber-500 shrink-0" />}
                          Nhóm {pIdx + 1}
                        </span>
                        <span className="text-[10px] font-mono dark:text-slate-400 text-slate-500">
                          {pIdx * 3 + 1}-{pIdx * 3 + 3}
                        </span>
                      </div>

                      {/* 3 Status dots for the 3 questions */}
                      <div className="flex items-center gap-1.5">
                        {[0, 1, 2].map(subI => {
                          const gIdx = pIdx * 3 + subI;
                          const ans = selectedAnswers[gIdx];
                          const targetQ = activeQuestions[gIdx];
                          const isCorrect = targetQ?.options?.find(o => o.label === ans)?.isCorrect;

                          let dotClass = 'dark:bg-slate-800 bg-slate-200 border dark:border-slate-700 border-slate-300';
                          if (ans) {
                            dotClass = isCorrect ? 'bg-emerald-400' : 'bg-rose-400';
                          }

                          return (
                            <div 
                              key={subI} 
                              className={`w-3 h-3 rounded-full ${dotClass} transition-colors`}
                              title={`Câu ${gIdx + 1}: ${ans ? (isCorrect ? 'Đúng' : 'Sai') : 'Chưa làm'}`}
                            />
                          );
                        })}
                      </div>
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="grid grid-cols-5 sm:grid-cols-10 gap-2">
                {activeQuestions.map((_, qIndex) => {
                  const answer = selectedAnswers[qIndex];
                  const isSelected = currentIdx === qIndex;
                  const isDone = Boolean(answer);
                  const isLocked = isQuestionLocked(qIndex);

                  let cellStyle = 'dark:bg-slate-900 bg-slate-50 border dark:border-slate-800 border-slate-200 dark:text-slate-400 text-slate-600 hover:text-slate-900 dark:hover:text-white';
                  if (isLocked) {
                    cellStyle = 'dark:bg-slate-900/40 bg-slate-100 border-dashed border-amber-500/40 text-amber-500 hover:border-amber-500';
                  } else if (isDone) {
                    const correct = activeQuestions[qIndex].options?.find(o => o.isCorrect)?.label;
                    cellStyle = answer === correct
                      ? 'bg-emerald-500/20 border-emerald-500 text-emerald-700 dark:text-emerald-300 font-bold'
                      : 'bg-rose-500/20 border-rose-500 text-rose-700 dark:text-rose-300 font-bold';
                  }
                  if (isSelected) {
                    cellStyle += ' ring-2 ring-cyan-400';
                  }

                  return (
                    <button
                      key={qIndex}
                      onClick={() => {
                        if (isLocked) {
                          setShowPricingModal(true);
                          return;
                        }
                        setCurrentIdx(qIndex);
                        setShowGridDrawer(false);
                        setIsPlaying(false);
                      }}
                      className={`h-10 rounded-xl border font-mono font-bold text-xs flex items-center justify-center gap-0.5 transition-all cursor-pointer ${cellStyle}`}
                    >
                      {isLocked && <Crown className="w-2.5 h-2.5 text-amber-500 fill-amber-500 shrink-0" />}
                      <span>{qIndex + 1}</span>
                    </button>
                  );
                })}
              </div>
            )}

          </div>
        </div>
      )}

      {/* 5. NOTE MODAL */}
      {showNoteModal && (
        <div 
          className="fixed inset-0 z-50 dark:bg-slate-950/80 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setShowNoteModal(false)}
        >
          <div 
            className="glass-card max-w-lg w-full rounded-3xl border dark:border-slate-800 border-slate-200 dark:bg-slate-950 bg-white p-6 space-y-4 shadow-2xl"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b dark:border-slate-800 border-slate-200 pb-3">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-cyan-500" />
                <h3 className="font-heading font-extrabold text-sm dark:text-white text-slate-900">
                  Ghi chú • {currentPassageTitle}
                </h3>
              </div>
              <button onClick={() => setShowNoteModal(false)} className="dark:text-slate-400 text-slate-500 hover:text-slate-900 dark:hover:text-white">✕</button>
            </div>

            <textarea
              value={currentNoteText}
              onChange={e => setCurrentNoteText(e.target.value)}
              placeholder="Ghi lại các bẫy, từ vựng hoặc mẹo cần nhớ cho đoạn hội thoại này..."
              rows={5}
              className="w-full dark:bg-slate-900 bg-slate-50 border dark:border-slate-800 border-slate-200 rounded-2xl p-3 text-sm dark:text-slate-200 text-slate-800 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-cyan-500 resize-none"
            />

            <div className="flex items-center justify-end gap-2">
              <button 
                onClick={() => setShowNoteModal(false)}
                className="px-4 py-2 rounded-xl dark:bg-slate-900 bg-slate-100 hover:bg-slate-200 dark:hover:bg-slate-800 dark:text-slate-400 text-slate-600 text-xs font-bold transition-colors"
              >
                Hủy
              </button>
              <button 
                onClick={handleSaveNote}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold transition-all shadow-md shadow-cyan-500/20"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Lưu ghi chú</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 6. DICTATION (ĐIỀN TỪ) MODAL */}
      {showDictationModal && (
        <div 
          className="fixed inset-0 z-50 dark:bg-slate-950/80 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setShowDictationModal(false)}
        >
          <div 
            className="glass-card max-w-xl w-full rounded-3xl border dark:border-slate-800 border-slate-200 dark:bg-slate-950 bg-white p-6 space-y-4 shadow-2xl"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b dark:border-slate-800 border-slate-200 pb-3">
              <div className="flex items-center gap-2">
                <PenTool className="w-5 h-5 text-amber-500" />
                <h3 className="font-heading font-extrabold text-sm dark:text-white text-slate-900">
                  Luyện Điền Từ • {currentPassageTitle}
                </h3>
              </div>
              <button onClick={() => setShowDictationModal(false)} className="dark:text-slate-400 text-slate-500 hover:text-slate-900 dark:hover:text-white">✕</button>
            </div>

            <p className="text-xs dark:text-slate-400 text-slate-500">
              Nghe audio và điền các từ then chốt còn thiếu vào kịch bản hội thoại:
            </p>

            <div className="p-4 rounded-2xl dark:bg-slate-900 bg-slate-50 border dark:border-slate-800 border-slate-200 text-sm dark:text-slate-200 text-slate-800 leading-relaxed font-mono">
              {currentPassageQ?.transcript}
            </div>

            <button 
              onClick={() => {
                setShowDictationModal(false);
                navigate(`/listen/dictation/1?part=${partNum}`);
              }}
              className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition-colors"
            >
              Mở phòng luyện chép chính tả chuyên sâu
            </button>
          </div>
        </div>
      )}

      {/* 7. OTHER MODALS */}
      <ExitModal
        isOpen={showExitModal}
        onClose={() => setShowExitModal(false)}
        onConfirmExit={handleConfirmExit}
      />

      {/* Mascot Transition Overlay */}
      <DauSavingProgressOverlay isSaving={isSavingProgress} />

      <VocabularyDrawer
        isOpen={showVocabDrawer}
        onClose={() => setShowVocabDrawer(false)}
        vocabList={basketWords}
        onDeleteWord={async (idx) => {
          const target = basketWords[idx];
          if (target?.word) {
            await removeWordFromBasket(target.word);
          }
          const next = basketWords.filter((_, i) => i !== idx);
          setBasketWords(next);
        }}
      />



      {/* AI Explanation Assistant Modal */}
      {showAiModal && (
        <div 
          className="fixed inset-0 z-50 dark:bg-slate-950/80 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setShowAiModal(false)}
        >
          <div 
            className="glass-card max-w-md w-full rounded-3xl border dark:border-slate-800 border-slate-200 dark:bg-slate-950 bg-white p-6 space-y-4 shadow-2xl"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b dark:border-slate-800 border-slate-200 pb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-cyan-500" />
                <h3 className="font-heading font-extrabold text-sm dark:text-white text-slate-900">AI TOEIC Coach</h3>
              </div>
              <button onClick={() => setShowAiModal(false)} className="dark:text-slate-400 text-slate-500 hover:text-slate-900 dark:hover:text-white">✕</button>
            </div>

            <button 
              onClick={() => setShowAiModal(false)}
              className="w-full py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-heading font-extrabold text-xs"
            >
              Đã hiểu
            </button>
          </div>
        </div>
      )}

      {/* Tool Modals */}
      <AnnotatorToolbar
        isActive={isAnnotator}
        onToggle={() => setIsAnnotator(!isAnnotator)}
        currentColor={annotatorColor}
        onChangeColor={setAnnotatorColor}
        onClearAll={() => {
          setToastMsg('Đã xóa tất cả highlight!');
          setTimeout(() => setToastMsg(null), 2000);
        }}
      />

      <FlashcardQuickModal
        isOpen={showFlashcards}
        onClose={() => setShowFlashcards(false)}
        vocabList={currentPassageQ?.vocabularyList || []}
        onAddToBasket={async (w) => {
          try {
            const updated = await addWordToBasket(w, currentDeckName, 'listening_level');
            if (updated && Array.isArray(updated)) setBasketWords(updated);
            setToastMsg(`⭐ Đã lưu từ "${w.word}" vào học phần "${currentDeckName}"!`);
            setTimeout(() => setToastMsg(null), 2000);
          } catch(e) {}
        }}
      />

      {/* VIP PRO PRICING MODAL */}
      <PricingModal
        isOpen={showPricingModal}
        onClose={() => setShowPricingModal(false)}
        onUpgradeSuccess={() => setIsProUser(true)}
      />

    </div>
  );
}

