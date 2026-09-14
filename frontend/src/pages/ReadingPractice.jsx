import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { 
  ArrowLeft, 
  Crown, 
  FileText, 
  Edit3, 
  AlertTriangle, 
  ShoppingBag, 
  Search, 
  Star, 
  ChevronLeft, 
  ChevronRight,
  Zap,
  CheckCircle2,
  XCircle,
  Volume2,
  BookOpen,
  Eye,
  EyeOff,
  Sparkles,
  Languages,
  Highlighter,
  FileEdit,
  Bell,
  FolderPlus,
  CheckSquare,
  Square,
  Bookmark,
  Check,
  Plus,
  Grid,
  X,
  Layers,
  RotateCcw
} from 'lucide-react';
import PricingModal from '../components/PricingModal';
import VocabularyDrawer from '../components/VocabularyDrawer';
import ExitModal from '../components/ExitModal';
import DauSavingProgressOverlay from '../components/DauSavingProgressOverlay';
import AnnotatorToolbar from '../components/AnnotatorToolbar';
import FlashcardQuickModal from '../components/FlashcardQuickModal';
import FillInBlanksModal from '../components/FillInBlanksModal';
import PersonalNoteModal from '../components/PersonalNoteModal';
import { translateToeicOption, extractVocabRecommendations } from '../utils/toeicTranslator';
import { useDictionary } from '../context/DictionaryContext';
import { getStoredUser, setStoredUser } from '../utils/auth';
import { 
  savePracticeProgress, 
  getSingleProgress, 
  resetPracticeProgress 
} from '../services/practiceProgressService';
import { 
  addWordToBasket, 
  addWordsToBasket, 
  removeWordFromBasket, 
  getBasketWords 
} from '../services/vocabBasketService';

export default function ReadingPractice() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const partParam = searchParams.get('part') || 'Part 5';

  const [exerciseData, setExerciseData] = useState(null);
  const [questionsList, setQuestionsList] = useState([]);
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [currentPassageIdx, setCurrentPassageIdx] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [correctScore, setCorrectScore] = useState(0);
  const [practiceXp, setPracticeXp] = useState(0);
  const [loading, setLoading] = useState(true);

  const currentUser = getStoredUser();
  const currentUserId = currentUser?.userId || currentUser?.email || 'guest';
  const isRedoMode = searchParams.get('redo') === 'true';
  const rawLevel = searchParams.get('level') || (id ? (id.match(/lv(\d+)/i)?.[1] || 1) : 1);
  const computedLevel = parseInt(rawLevel, 10) || 1;
  const computedPart = (partParam || 'Part 5').replace(/\s+/g, '').toLowerCase();
  const exerciseKey = `reading_${computedPart}_lv${computedLevel}`;
  const resumeStorageKey = `tuongtan_reading_resume_${currentUserId}_${exerciseKey}`;
  const [hasRestoredProgress, setHasRestoredProgress] = useState(false);
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
  
  const leftColRef = useRef(null);
  const rightColRef = useRef(null);

  // Auto-scroll columns and window to top whenever navigating to next question/passage
  useEffect(() => {
    const scrollToTop = () => {
      if (rightColRef.current) {
        if (typeof rightColRef.current.scrollTo === 'function') {
          rightColRef.current.scrollTo({ top: 0, behavior: 'smooth' });
        } else {
          rightColRef.current.scrollTop = 0;
        }
      }
      if (leftColRef.current) {
        if (typeof leftColRef.current.scrollTo === 'function') {
          leftColRef.current.scrollTo({ top: 0, behavior: 'smooth' });
        } else {
          leftColRef.current.scrollTop = 0;
        }
      }
      window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    scrollToTop();
    const timer = setTimeout(scrollToTop, 50);
    return () => clearTimeout(timer);
  }, [currentQuestionIdx, currentPassageIdx]);

  // User answers map for Passage Mode: { [globalQuestionIdx]: selectedOptionIdx }
  const [userAnswersMap, setUserAnswersMap] = useState({});
  const [openTranslationMap, setOpenTranslationMap] = useState({});
  const [bookmarkedQuestions, setBookmarkedQuestions] = useState({});
  const [showGridDrawer, setShowGridDrawer] = useState(false);
  const [showPassageTranslation, setShowPassageTranslation] = useState(false);
  // Mobile responsive tab state for Part 6 & 7: 'passage' or 'questions'
  const [mobileTab, setMobileTab] = useState('passage');

  useEffect(() => {
    setMobileTab('passage');
  }, [currentPassageIdx]);

  // Feature Toggles & Toolbar State
  const [isBilingualOn, setIsBilingualOn] = useState(true);
  const [isTranslationPanelOpen, setIsTranslationPanelOpen] = useState(true);
  const [isVocabPanelOpen, setIsVocabPanelOpen] = useState(true);
  const [hideVocabMeaning, setHideVocabMeaning] = useState(false);
  const [isAutoPlayNext, setIsAutoPlayNext] = useState(false);
  const [isSfxOn, setIsSfxOn] = useState(true);

  // Advanced Tools (Annotator, Fill-in-blanks, Flashcards, Notes)
  const [isAnnotatorActive, setIsAnnotatorActive] = useState(false);
  const [annotatorColor, setAnnotatorColor] = useState('yellow');
  const [showFillInBlanks, setShowFillInBlanks] = useState(false);
  const [showFlashcards, setShowFlashcards] = useState(false);
  const [showPersonalNoteModal, setShowPersonalNoteModal] = useState(false);

  // Modals & Dictionary State
  const [showExitModal, setShowExitModal] = useState(false);
  const [showVocabDrawer, setShowVocabDrawer] = useState(false);
  const { 
    openDictionary, 
    closeDictionary, 
    isOpen: isDictModalOpen, 
    isDictEnabled, 
    toggleDictEnabled,
    setDeckContext
  } = useDictionary();

  const currentDeckName = `${exerciseData?.part || partParam || 'Reading'} - ${exerciseData?.title || 'Bài tập'}`;

  // Sync contextual deck name with global DictionaryContext
  useEffect(() => {
    if (setDeckContext && currentDeckName) {
      setDeckContext(currentDeckName);
    }
  }, [setDeckContext, currentDeckName]);

  const [savedVocab, setSavedVocab] = useState(() => {
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
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [toastMsg, setToastMsg] = useState(null);

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 2500);
  };

  useEffect(() => {
    const handleBasketUpdate = (e) => {
      const detail = e?.detail;
      if (detail?.allWords && Array.isArray(detail.allWords)) {
        setSavedVocab(detail.allWords);
        return;
      }
      if (detail?.removedWord) {
        setSavedVocab(prev => prev.filter(item => item.word?.toLowerCase() !== detail.removedWord.toLowerCase()));
        return;
      }
      if (detail?.words && Array.isArray(detail.words)) {
        setSavedVocab(prev => {
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
        setSavedVocab(prev => {
          const map = new Map();
          [...prev, newWord].forEach(item => {
            if (item && item.word) map.set(item.word.toLowerCase().trim(), item);
          });
          return Array.from(map.values());
        });
        showToast(`🛒 Đã lưu "${newWord.word}" vào giỏ từ!`);
      }
    };
    window.addEventListener('vocab_basket_updated', handleBasketUpdate);

    // Initial load from synchronized basket
    getBasketWords().then(words => {
      if (words && words.length > 0) setSavedVocab(words);
    }).catch(() => {});

    return () => window.removeEventListener('vocab_basket_updated', handleBasketUpdate);
  }, []);

  const fallbackQuestions = [
    {
      questionNum: 1,
      prompt: 'Ms. Carpenter will be attending the conference with ------- marketing team.',
      passageText: 'Ms. Carpenter will be attending the conference with ------- marketing team.',
      options: [
        { label: '(A)', text: 'she', translation: 'cô ấy (chủ ngữ)' },
        { label: '(B)', text: 'her', translation: 'của cô ấy (tính từ sở hữu)' },
        { label: '(C)', text: 'hers', translation: 'cái của cô ấy (đại từ sở hữu)' },
        { label: '(D)', text: 'herself', translation: 'chính cô ấy (đại từ phản thân)' }
      ],
      correctAnswer: 'B',
      explanation: 'Trước danh từ "marketing team" cần một tính từ sở hữu. "Her" là tính từ sở hữu bổ nghĩa cho danh từ đứng sau. Chọn (B).',
      translation: 'Cô Carpenter sẽ tham dự hội nghị cùng với nhóm tiếp thị của cô ấy.',
      vocabularyList: [
        { word: 'attend', pos: 'v', level: 'B1', ipaUS: '/əˈtend/', meaning: 'tham dự, có mặt', example: 'She will attend the meeting.', exampleTrans: 'Cô ấy sẽ tham dự cuộc họp.' },
        { word: 'conference', pos: 'n', level: 'B1', ipaUS: '/ˈkɑːn.fɚ.əns/', meaning: 'hội nghị, hội thảo', example: 'The annual sales conference is next week.', exampleTrans: 'Hội nghị bán hàng thường niên diễn ra vào tuần tới.' }
      ]
    }
  ];

  // Check if current exercise is Part 6 or Part 7 (Passage Mode)
  const isPart6or7 = useMemo(() => {
    const p = (partParam || exerciseData?.part || '').toLowerCase();
    return p.includes('part 6') || p.includes('part 7') || p.includes('part6') || p.includes('part7') || p.includes('p6') || p.includes('p7');
  }, [partParam, exerciseData]);

  // Fetch Exercise Data
  useEffect(() => {
    async function fetchExercise() {
      setLoading(true);
      try {
        let res;
        // Direct by ID or Slug (e.g. p5lv2, p5_lv2, p6lv1, 6a8e...)
        if (id) {
          res = await axios.get(`/api/v1/reading/exercises/${id}`);
        } else {
          res = await axios.get(`/api/v1/reading/exercises?part=${encodeURIComponent(partParam)}&full=true`);
        }

        if (res.data?.data) {
          const ex = Array.isArray(res.data.data) ? res.data.data[0] : res.data.data;
          if (ex && ex.questions && ex.questions.length > 0) {
            setExerciseData(ex);
            setQuestionsList(ex.questions);
          } else {
            // If still missing, try fallback query with full=true
            const fallbackRes = await axios.get(`/api/v1/reading/exercises?part=${encodeURIComponent(partParam)}&full=true`);
            if (fallbackRes.data?.data) {
              const fbEx = Array.isArray(fallbackRes.data.data) ? fallbackRes.data.data[0] : fallbackRes.data.data;
              if (fbEx?.questions?.length > 0) {
                setExerciseData(fbEx);
                setQuestionsList(fbEx.questions);
                return;
              }
            }
            setQuestionsList(fallbackQuestions);
          }
        } else {
          setQuestionsList(fallbackQuestions);
        }
      } catch (err) {
        console.warn('Fetch reading exercise error, attempting fallback query:', err.message);
        try {
          const fallbackRes = await axios.get(`/api/v1/reading/exercises?part=${encodeURIComponent(partParam)}&full=true`);
          if (fallbackRes.data?.data) {
            const fbEx = Array.isArray(fallbackRes.data.data) ? fallbackRes.data.data[0] : fallbackRes.data.data;
            if (fbEx?.questions?.length > 0) {
              setExerciseData(fbEx);
              setQuestionsList(fbEx.questions);
              return;
            }
          }
        } catch (e) {}
        setQuestionsList(fallbackQuestions);
      } finally {
        setLoading(false);
      }
    }
    fetchExercise();
  }, [id, partParam]);

  // Group questions into Passages for Part 6 & Part 7
  const passages = useMemo(() => {
    if (!isPart6or7 || !questionsList || questionsList.length === 0) return [];

    const groups = [];
    let currentGroup = null;

    questionsList.forEach((q, idx) => {
      const key = q.passageId || q.passageText;
      const isPart6 = (partParam || '').includes('6') || (exerciseData?.part || '').includes('6');
      const isNewGroup = !currentGroup || (currentGroup.key !== key && (isPart6 ? currentGroup.questions.length >= 4 : true));

      if (isNewGroup) {
        currentGroup = {
          id: q.passageId || `passage-${groups.length + 1}`,
          key,
          passageTitle: q.passageTitle || `Đoạn văn ${groups.length + 1}`,
          passageText: q.passageText,
          imageUrl: q.imageUrl,
          prompt: q.prompt,
          questions: [q],
          startIdx: idx
        };
        groups.push(currentGroup);
      } else {
        currentGroup.questions.push(q);
      }
    });

    return groups;
  }, [questionsList, isPart6or7, partParam, exerciseData]);

  // Current Passage in Passage Mode
  const currentPassage = passages[currentPassageIdx] || (passages.length > 0 ? passages[0] : null);
  const currentPassageQuestions = currentPassage ? currentPassage.questions : (questionsList.length > 0 ? [questionsList[currentQuestionIdx]] : fallbackQuestions);

  // Single Question Mode current question
  const currentQ = questionsList[currentQuestionIdx] || fallbackQuestions[0];

  // VIP Pro Lock Checking: Level 1 free limit is exactly 20 questions across Part 1-7
  const isQuestionLocked = (qIdx) => {
    if (isProUser) return false;
    if (computedLevel > 1) return true;
    return qIdx >= 20; // Exactly 20 questions free (indices 0..19 are free, 20+ locked)
  };

  const isPassageLocked = (pIdx) => {
    if (isProUser) return false;
    if (computedLevel > 1) return true;
    const targetPassage = passages[pIdx];
    if (!targetPassage) return false;
    return (targetPassage.startIdx ?? (pIdx * 4)) >= 20;
  };

  const isCurrentLocked = isPart6or7 ? isPassageLocked(currentPassageIdx) : isQuestionLocked(currentQuestionIdx);

  // Auto-restore reading practice progress (Resume feature matching Dau TOEIC)
  useEffect(() => {
    async function restoreProgress() {
      if (questionsList.length === 0 || hasRestoredProgress) return;

      try {
        const saved = await getSingleProgress(exerciseKey);
        if (saved && saved.userAnswersMap && Object.keys(saved.userAnswersMap).length > 0) {
          setUserAnswersMap(saved.userAnswersMap);
          if (typeof saved.correctCount === 'number') setCorrectScore(saved.correctCount);
          if (typeof saved.practiceXp === 'number') setPracticeXp(saved.practiceXp);

          if (isRedoMode) {
            if (Array.isArray(saved.wrongQuestions) && saved.wrongQuestions.length > 0) {
              const firstWrong = saved.wrongQuestions[0];
              if (firstWrong < questionsList.length) {
                setCurrentQuestionIdx(firstWrong);
                if (passages.length > 0) {
                  const matchedPassageIdx = passages.findIndex(p => firstWrong >= p.startIdx && firstWrong < (p.startIdx + p.questions.length));
                  if (matchedPassageIdx !== -1) {
                    setCurrentPassageIdx(matchedPassageIdx);
                  }
                }
                showToast(`🎯 Làm lại ${saved.wrongQuestions.length} câu sai: Bắt đầu từ câu ${firstWrong + 1}`);
              }
            }
          } else {
            // Normal mode: jump to next question to study
            let targetIdx = 0;
            if (typeof saved.currentQuestionIdx === 'number' && saved.currentQuestionIdx < questionsList.length) {
              targetIdx = saved.currentQuestionIdx;
            }
            // If the question at targetIdx is already answered, search for the next unanswered question
            if (saved.userAnswersMap[targetIdx] !== undefined) {
              for (let i = 0; i < questionsList.length; i++) {
                if (saved.userAnswersMap[i] === undefined) {
                  targetIdx = i;
                  break;
                }
              }
            }
            setCurrentQuestionIdx(targetIdx);
            if (passages.length > 0) {
              const matchedPassageIdx = passages.findIndex(p => targetIdx >= p.startIdx && targetIdx < (p.startIdx + p.questions.length));
              if (matchedPassageIdx !== -1) {
                setCurrentPassageIdx(matchedPassageIdx);
              } else if (typeof saved.currentPassageIdx === 'number') {
                setCurrentPassageIdx(Math.min(passages.length - 1, saved.currentPassageIdx));
              }
            }
            if (targetIdx > 0) {
              showToast(`🔄 Tiếp tục làm bài: Câu ${targetIdx + 1}`);
            }
          }
        }
      } catch (e) {
        console.warn('Restore progress error:', e);
      } finally {
        setHasRestoredProgress(true);
      }
    }

    restoreProgress();
  }, [questionsList.length, exerciseKey, hasRestoredProgress, isRedoMode, passages.length]);

  // Reset progress to start from Question 1
  const handleResetProgress = async () => {
    try {
      await resetPracticeProgress(exerciseKey);
    } catch (e) {}
    setCurrentQuestionIdx(0);
    setCurrentPassageIdx(0);
    setUserAnswersMap({});
    setSelectedOption(null);
    setCorrectScore(0);
    setPracticeXp(0);
    showToast('↺ Đã làm lại bài từ câu 1');
  };

  // Set single mode selected option when changing question (load saved answer if already answered)
  useEffect(() => {
    if (userAnswersMap[currentQuestionIdx] !== undefined && userAnswersMap[currentQuestionIdx] !== null) {
      setSelectedOption(userAnswersMap[currentQuestionIdx]);
    } else {
      setSelectedOption(null);
    }
    setSelectedVocabToAdd(new Set());
  }, [currentQuestionIdx, userAnswersMap]);

  // Reset passage index if out of bounds
  useEffect(() => {
    if (currentPassageIdx >= passages.length && passages.length > 0) {
      setCurrentPassageIdx(0);
    }
  }, [passages.length, currentPassageIdx]);

  // TTS Pronunciation Helper (US & UK)
  const speakWord = (word, lang = 'en-US') => {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(word);
    u.lang = lang;
    u.rate = 0.9;
    window.speechSynthesis.speak(u);
  };

  // Determine correct answer index
  const getCorrectIndex = (q) => {
    if (!q || !q.options) return 0;
    const explicitCorrect = q.options.findIndex(o => o.isCorrect);
    if (explicitCorrect !== -1) return explicitCorrect;

    const answerStr = String(q.correctAnswer || 'A').toUpperCase().replace(/[\(\)]/g, '').trim();
    const idx = q.options.findIndex(o => o.label?.replace(/[\(\)]/g, '').trim() === answerStr);
    return idx !== -1 ? idx : 0;
  };

  const correctIdx = getCorrectIndex(currentQ);

  // Single mode vocab recommendations
  const currentVocabRecommendations = useMemo(() => {
    if (currentQ?.vocabularyList && currentQ.vocabularyList.length > 0) {
      return currentQ.vocabularyList;
    }
    return extractVocabRecommendations(currentQ);
  }, [currentQ]);

  // Vietnamese Translations Map for Choices
  const getChoiceTranslations = (q) => {
    if (!q) return {};
    const map = {};

    if (q.options) {
      q.options.forEach(opt => {
        const clean = opt.label?.replace(/[()]/g, '').trim().toUpperCase();
        if (clean && (opt.vietnamese || opt.translation)) {
          map[clean] = (opt.vietnamese || opt.translation).trim();
        }
      });
    }

    if (q.dichNghia) {
      const lines = q.dichNghia.split('\n').map(l => l.trim()).filter(Boolean);
      for (const line of lines) {
        const match = line.match(/^(\([A-D]\)|[A-D]\.|\b[A-D]\))\s*(.*)/i);
        if (match) {
          const key = match[1].replace(/[\(\)\.]/g, '').toUpperCase();
          if (!map[key]) map[key] = match[2].trim();
        }
      }
    }

    return {
      'A': map['A'] || 'Lựa chọn (A)',
      'B': map['B'] || 'Lựa chọn (B)',
      'C': map['C'] || 'Lựa chọn (C)',
      'D': map['D'] || 'Lựa chọn (D)'
    };
  };

  const translationsMap = getChoiceTranslations(currentQ);

  // Helper to sync practice progress to backend & local storage
  const syncProgressToStorage = (answersMap, activeQIdx, activePIdx, xpVal) => {
    const answeredKeys = Object.keys(answersMap);
    const completedCount = answeredKeys.length;
    let calculatedCorrect = 0;
    let calculatedWrong = 0;
    const wrongIndices = [];

    answeredKeys.forEach(k => {
      const qIndex = parseInt(k, 10);
      const chosen = answersMap[qIndex];
      const q = questionsList[qIndex];
      if (q) {
        const cIdx = getCorrectIndex(q);
        if (chosen === cIdx) {
          calculatedCorrect++;
        } else {
          calculatedWrong++;
          wrongIndices.push(qIndex);
        }
      }
    });

    savePracticeProgress({
      category: 'reading',
      part: exerciseData?.part || partParam || 'Part 5',
      level: computedLevel,
      exerciseKey,
      exerciseTitle: exerciseData?.title || `Level ${computedLevel}`,
      totalQuestions: questionsList.length,
      completedCount,
      correctCount: calculatedCorrect,
      wrongCount: calculatedWrong,
      currentQuestionIdx: Math.min(questionsList.length - 1, activeQIdx),
      currentPassageIdx: activePIdx,
      userAnswersMap: answersMap,
      wrongQuestions: wrongIndices,
      practiceXp: xpVal,
      isCompleted: completedCount >= questionsList.length && questionsList.length > 0
    });
  };

  // Handle Option Click for Single Mode (Part 5)
  const handleOptionClick = async (idx) => {
    if (isQuestionLocked(currentQuestionIdx)) {
      setShowPricingModal(true);
      return;
    }
    if (selectedOption !== null) return; // Answered
    setSelectedOption(idx);

    const updatedAnswers = { ...userAnswersMap, [currentQuestionIdx]: idx };
    setUserAnswersMap(updatedAnswers);

    const isCorrect = (idx === correctIdx);
    const newCorrectScore = correctScore + (isCorrect ? 1 : 0);
    const newXp = practiceXp + (isCorrect ? 5 : 0);

    if (isCorrect) {
      setCorrectScore(newCorrectScore);
      setPracticeXp(newXp);
      showToast('🎉 +5 XP! Đáp án chính xác!');

      if (isAutoPlayNext) {
        setTimeout(() => {
          if (currentQuestionIdx < questionsList.length - 1) {
            setCurrentQuestionIdx(prev => prev + 1);
          }
        }, 1500);
      }
    } else {
      // Auto-record mistake to Sổ Tay Câu Sai
      try {
        await axios.post('/api/v1/mistakes', {
          questionId: `read-${currentQ.questionNum || currentQuestionIdx + 1}`,
          part: exerciseData?.part || partParam || 'Part 5',
          section: 'READING',
          prompt: currentQ.prompt || currentQ.promptText || 'TOEIC Reading',
          passageText: currentQ.passageText || `Câu hỏi đọc hiểu ${currentQ.questionNum || currentQuestionIdx + 1}`,
          options: currentQ.options.map(o => ({ label: o.label, text: o.text || o.label })),
          correctAnswer: correctIdx,
          userAnswer: idx,
          explanation: currentQ.explanation || 'Xem lại cấu trúc ngữ pháp và từ loại của câu.',
          translation: currentQ.translation || 'Dịch nghĩa câu tiếng Anh.',
          categoryTag: `${exerciseData?.part || partParam} Reading`
        });
      } catch (err) {}
    }

    // Immediately persist progress
    syncProgressToStorage(updatedAnswers, currentQuestionIdx + 1, currentPassageIdx, newXp);
  };

  // Handle Option Click for Passage Mode (Part 6 & Part 7)
  const handleSelectOptionInPassage = async (globalIdx, optionIdx, qItem) => {
    if (isQuestionLocked(globalIdx)) {
      setShowPricingModal(true);
      return;
    }
    if (userAnswersMap[globalIdx] !== undefined) return; // Already answered

    const updatedAnswers = { ...userAnswersMap, [globalIdx]: optionIdx };
    setUserAnswersMap(updatedAnswers);

    const correct = getCorrectIndex(qItem);
    const isCorrect = (optionIdx === correct);
    const newCorrectScore = correctScore + (isCorrect ? 1 : 0);
    const newXp = practiceXp + (isCorrect ? 5 : 0);

    if (isCorrect) {
      setCorrectScore(newCorrectScore);
      setPracticeXp(newXp);
      showToast('🎉 +5 XP! Đáp án chính xác!');
    } else {
      // Auto-record mistake
      try {
        await axios.post('/api/v1/mistakes', {
          questionId: `read-${qItem.questionNum || globalIdx + 1}`,
          part: exerciseData?.part || partParam || 'Part 6',
          section: 'READING',
          prompt: qItem.prompt || 'TOEIC Reading',
          passageText: qItem.passageText || `Đoạn văn câu ${qItem.questionNum || globalIdx + 1}`,
          options: qItem.options?.map(o => ({ label: o.label, text: o.text || o.label })),
          correctAnswer: correct,
          userAnswer: optionIdx,
          explanation: qItem.explanation || 'Xem lại cấu trúc ngữ pháp và từ loại của câu.',
          translation: qItem.translation || 'Dịch nghĩa câu tiếng Anh.',
          categoryTag: `${exerciseData?.part || partParam} Reading`
        });
      } catch (err) {}
    }

    // Immediately persist progress
    syncProgressToStorage(updatedAnswers, globalIdx + 1, currentPassageIdx, newXp);
  };

  // Vocab Handlers for Single Mode
  const handleSelectAllVocab = (list) => {
    const vocabItems = list || currentVocabRecommendations;
    if (selectedVocabToAdd.size === vocabItems.length) {
      setSelectedVocabToAdd(new Set());
    } else {
      setSelectedVocabToAdd(new Set(vocabItems.map(v => v.word)));
    }
  };

  const handleAddSelectedVocabToBag = async (list) => {
    const vocabItems = list || currentVocabRecommendations;
    const wordsToAdd = vocabItems.filter(v => selectedVocabToAdd.has(v.word));
    if (wordsToAdd.length === 0) {
      showToast('Vui lòng chọn ít nhất 1 từ để thêm');
      return;
    }

    const formattedList = wordsToAdd.map(w => ({
      word: w.word,
      pos: w.pos || 'n',
      phonetic: w.ipaUS || w.phonetic,
      meaning: w.meaning,
      exampleEn: w.example || '',
      exampleVi: w.exampleTrans || ''
    }));

    try {
      const updated = await addWordsToBasket(formattedList, currentDeckName, 'reading_practice');
      if (updated && updated.length > 0) setSavedVocab(updated);
    } catch (e) {
      console.warn('addWordsToBasket error:', e);
    }

    setSelectedVocabToAdd(new Set());
    showToast(`🛒 Đã thêm ${wordsToAdd.length} từ vào học phần "${currentDeckName}"!`);
  };

  // Render Vocabulary Card helper
  const renderVocabularyCard = (vocabList) => {
    if (!vocabList || vocabList.length === 0) return null;

    return (
      <div className="p-4 sm:p-5 rounded-3xl dark:bg-slate-900/90 bg-white border dark:border-slate-800 border-slate-200 space-y-3.5 shadow-md animate-fadeIn">
        <div className="flex items-center justify-between border-b dark:border-slate-800 border-slate-200 pb-3">
          <div className="flex items-center gap-2 text-amber-500 dark:text-amber-400">
            <ShoppingBag className="w-4 h-4" />
            <span className="font-heading font-extrabold text-sm dark:text-white text-slate-900">
              Từ vựng nên học ({vocabList.length})
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => handleSelectAllVocab(vocabList)}
              className="text-[11px] font-bold dark:text-slate-400 text-slate-600 hover:text-emerald-500 transition-colors"
            >
              {selectedVocabToAdd.size === vocabList.length ? 'Bỏ chọn' : 'Chọn tất cả'}
            </button>
            <button
              onClick={() => handleAddSelectedVocabToBag(vocabList)}
              disabled={selectedVocabToAdd.size === 0}
              className="px-2.5 py-1 rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-40 text-slate-950 text-[11px] font-extrabold transition-all flex items-center gap-1 cursor-pointer"
            >
              <Plus className="w-3 h-3 stroke-[3]" />
              <span>+ Thêm ({selectedVocabToAdd.size})</span>
            </button>
          </div>
        </div>

        <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
          {vocabList.map((v, vIdx) => {
            const isChecked = selectedVocabToAdd.has(v.word);
            return (
              <div
                key={vIdx}
                onClick={() => {
                  const next = new Set(selectedVocabToAdd);
                  if (next.has(v.word)) next.delete(v.word);
                  else next.add(v.word);
                  setSelectedVocabToAdd(next);
                }}
                className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                  isChecked 
                    ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-700 dark:text-slate-100' 
                    : 'dark:bg-slate-950/60 bg-slate-50 dark:border-slate-800/80 border-slate-200 dark:text-slate-300 text-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                }`}
              >
                <div className="flex items-center gap-2.5 flex-1 min-w-0">
                  <button 
                    type="button" 
                    className={`w-4 h-4 rounded flex items-center justify-center border transition-colors shrink-0 ${
                      isChecked ? 'bg-emerald-500 border-emerald-400 text-slate-950' : 'dark:border-slate-600 border-slate-300 dark:bg-slate-800 bg-white'
                    }`}
                  >
                    {isChecked && <Check className="w-3 h-3 stroke-[3]" />}
                  </button>

                  <div className="truncate">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs dark:text-white text-slate-900 capitalize">{v.word}</span>
                      {v.pos && (
                        <span className="px-1.5 py-0.2 rounded dark:bg-slate-800 bg-slate-200 text-[10px] font-mono dark:text-cyan-300 text-cyan-700">
                          {v.pos}
                        </span>
                      )}
                      {v.level && (
                        <span className="px-1.5 py-0.2 rounded bg-amber-500/20 text-[10px] font-mono text-amber-600 dark:text-amber-300">
                          {v.level}
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] dark:text-slate-400 text-slate-600 truncate mt-0.5">{v.meaning}</p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    speakWord(v.word);
                  }}
                  className="p-1.5 rounded-lg dark:bg-slate-800 bg-slate-100 hover:bg-slate-200 dark:hover:bg-slate-700 dark:text-cyan-400 text-cyan-600 hover:text-slate-900 dark:hover:text-white transition-colors shrink-0"
                  title="Phát âm US"
                >
                  <Volume2 className="w-3.5 h-3.5" />
                </button>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  // Hotkey handlers
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (['INPUT', 'TEXTAREA'].includes(document.activeElement?.tagName)) return;

      if (!isPart6or7) {
        if (['Digit1', 'Digit2', 'Digit3', 'Digit4', '1', '2', '3', '4'].includes(e.key)) {
          const optionIdx = parseInt(e.key) - 1;
          handleOptionClick(optionIdx);
        } else if (e.key === 'ArrowLeft') {
          setCurrentQuestionIdx(prev => Math.max(0, prev - 1));
        } else if (e.key === 'ArrowRight') {
          setCurrentQuestionIdx(prev => Math.min(questionsList.length - 1, prev + 1));
        }
      } else {
        if (e.key === 'ArrowLeft') {
          setCurrentPassageIdx(prev => Math.max(0, prev - 1));
        } else if (e.key === 'ArrowRight') {
          setCurrentPassageIdx(prev => Math.min(passages.length - 1, prev + 1));
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentQ, selectedOption, questionsList.length, isPart6or7, passages.length]);

  return (
    <div 
      data-deck-name={currentDeckName}
      className="min-h-screen dark:bg-slate-950 bg-[#f8fafc] dark:text-slate-100 text-slate-900 flex flex-col font-sans"
    >
      
      {/* Toast Notification */}
      {toastMsg && (
        <div className="fixed top-16 right-6 z-50 px-4 py-2.5 rounded-2xl dark:bg-slate-900 bg-white border border-emerald-500/50 text-emerald-600 dark:text-emerald-300 text-xs sm:text-sm font-bold shadow-2xl animate-scaleUp flex items-center gap-2">
          <span>✨</span>
          <span>{toastMsg}</span>
        </div>
      )}

      {/* TOP HEADER TOOLBAR */}
      <header className="h-14 border-b dark:border-slate-800/90 border-slate-200 dark:bg-slate-950 bg-white px-3 sm:px-6 flex items-center justify-between sticky top-0 z-40 gap-2 shadow-sm">
        
        {/* Left: Exit & Badge */}
        <div className="flex items-center gap-3 shrink-0">
          <button 
            onClick={() => setShowExitModal(true)}
            className="flex items-center gap-1 px-3 py-1.5 rounded-xl dark:bg-slate-900 bg-slate-100 dark:border-slate-800 border-slate-200 hover:border-slate-300 dark:hover:border-slate-700 dark:text-slate-300 text-slate-700 hover:text-slate-900 dark:hover:text-white transition-colors text-xs font-bold"
            title="Thoát phòng luyện"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Thoát</span>
          </button>
          
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs font-heading font-extrabold">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>{exerciseData?.title || partParam}</span>
          </div>
        </div>

        {/* Center: Controls */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
          
          {/* Song ngữ 👑 */}
          <button
            onClick={() => {
              setIsBilingualOn(prev => !prev);
              showToast(!isBilingualOn ? 'Đã bật Song ngữ Anh - Việt 👑' : 'Đã tắt Song ngữ');
            }}
            className={`px-2.5 py-1 rounded-xl text-[11px] font-bold flex items-center gap-1 transition-all border cursor-pointer ${
              isBilingualOn 
                ? 'bg-amber-500/20 border-amber-500 text-amber-600 dark:text-amber-300 shadow-sm shadow-amber-500/10' 
                : 'dark:bg-slate-900 bg-slate-100 dark:border-slate-800 border-slate-200 dark:text-slate-400 text-slate-600 hover:text-slate-900 dark:hover:text-white'
            }`}
            title="Bật/Tắt chế độ song ngữ"
          >
            <Languages className="w-3.5 h-3.5" />
            <span>Song ngữ</span>
            <Crown className="w-3 h-3 text-amber-500 fill-amber-500" />
          </button>

          {/* Làm lại bài từ câu 1 */}
          <button
            onClick={handleResetProgress}
            className="px-2.5 py-1 rounded-xl text-[11px] font-bold flex items-center gap-1 dark:bg-slate-900 bg-slate-100 dark:border-slate-800 border-slate-200 dark:text-slate-400 text-slate-600 hover:text-red-400 dark:hover:text-red-400 transition-all cursor-pointer"
            title="Làm lại bài luyện tập này từ câu 1"
          >
            <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
            <span>Làm lại</span>
          </button>

          {/* Ghi chú */}
          <button
            onClick={() => setShowPersonalNoteModal(true)}
            className="px-2.5 py-1 rounded-xl text-[11px] font-bold flex items-center gap-1 dark:bg-slate-900 bg-slate-100 dark:border-slate-800 border-slate-200 dark:text-slate-300 text-slate-700 hover:text-sky-500 transition-all cursor-pointer"
            title="Ghi chú cá nhân"
          >
            <FileText className="w-3.5 h-3.5 text-sky-500" />
            <span>Ghi chú</span>
          </button>

          {/* Annotator */}
          <button
            onClick={() => {
              setIsAnnotatorActive(prev => !prev);
              showToast(!isAnnotatorActive ? 'Đã bật bút dạ quang ✏️' : 'Đã tắt bút dạ quang');
            }}
            className={`px-2.5 py-1 rounded-xl text-[11px] font-bold flex items-center gap-1 transition-all border cursor-pointer ${
              isAnnotatorActive 
                ? 'bg-purple-500/20 border-purple-500 text-purple-600 dark:text-purple-300' 
                : 'dark:bg-slate-900 bg-slate-100 dark:border-slate-800 border-slate-200 dark:text-slate-400 text-slate-600 hover:text-slate-900 dark:hover:text-white'
            }`}
            title="Bút dạ quang highlight"
          >
            <Highlighter className="w-3.5 h-3.5" />
            <span>Annotator</span>
          </button>

          {/* Điền từ */}
          <button
            onClick={() => setShowFillInBlanks(true)}
            className="px-2.5 py-1 rounded-xl text-[11px] font-bold flex items-center gap-1 dark:bg-slate-900 bg-slate-100 dark:border-slate-800 border-slate-200 dark:text-slate-300 text-slate-700 hover:text-emerald-500 transition-all cursor-pointer"
            title="Luyện gõ điền từ"
          >
            <FileEdit className="w-3.5 h-3.5 text-emerald-500" />
            <span>Điền từ</span>
          </button>

          {/* Lật từ */}
          <button
            onClick={() => setShowFlashcards(true)}
            className="px-2.5 py-1 rounded-xl text-[11px] font-bold flex items-center gap-1 dark:bg-slate-900 bg-slate-100 dark:border-slate-800 border-slate-200 dark:text-slate-300 text-slate-700 hover:text-amber-500 transition-all cursor-pointer"
            title="Lật thẻ từ vựng"
          >
            <BookOpen className="w-3.5 h-3.5 text-amber-500" />
            <span>Lật từ</span>
          </button>

          {/* SFX */}
          <button
            onClick={() => setIsSfxOn(prev => !prev)}
            className={`p-1.5 rounded-xl transition-all border cursor-pointer ${
              isSfxOn ? 'dark:bg-slate-800 bg-amber-50 border-amber-300 dark:border-slate-700 text-amber-500' : 'dark:bg-slate-900 bg-slate-100 dark:border-slate-800 border-slate-200 text-slate-400'
            }`}
            title="Hiệu ứng âm thanh SFX"
          >
            <Bell className="w-3.5 h-3.5" />
          </button>

          {/* XP */}
          <div className="px-2.5 py-1 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-600 dark:text-amber-400 text-xs font-mono font-extrabold flex items-center gap-1">
            <Zap className="w-3.5 h-3.5 fill-current" />
            <span>{practiceXp}</span>
          </div>

          {/* Đúng/Đã làm */}
          <div className="px-2.5 py-1 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs font-mono font-bold flex items-center gap-1">
            <Check className="w-3 h-3 stroke-[3]" />
            <span>{correctScore}/{Object.keys(userAnswersMap).length}</span>
          </div>

          {/* Counter Badge */}
          <div className="px-2.5 py-1 rounded-xl dark:bg-slate-900 bg-slate-100 dark:border-slate-800 border-slate-200 dark:text-slate-300 text-slate-700 text-xs font-mono font-bold">
            {isPart6or7 
              ? `Đoạn ${currentPassageIdx + 1}/${passages.length}` 
              : `Câu ${currentQuestionIdx + 1}/${questionsList.length}`
            }
          </div>

        </div>

        {/* Right Status */}
        <div className="flex items-center gap-2">
          <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-300 text-[10px] font-bold border border-emerald-500/30">
            {exerciseData?.errorRate ? `Tỉ lệ sai: ${exerciseData.errorRate}` : '100% Tiếng Việt'}
          </span>
        </div>

      </header>

      {/* Mobile Segmented Controller (Part 6 & 7 only, < lg screens) */}
      {isPart6or7 && (
        <div className="lg:hidden flex items-center dark:bg-[#0a0f1d] bg-white border-b dark:border-slate-800 border-slate-200 px-3 py-2 gap-2 sticky top-14 z-30 shadow-md">
          <button
            onClick={() => setMobileTab('passage')}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-heading font-extrabold flex items-center justify-center gap-1.5 transition-all ${
              mobileTab === 'passage'
                ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                : 'dark:bg-slate-900 bg-slate-100 dark:border-slate-800 border-slate-200 dark:text-slate-400 text-slate-600 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>📄 Bài đọc {currentPassage?.passageTitle ? `(${currentPassage.passageTitle})` : ''}</span>
          </button>

          <button
            onClick={() => setMobileTab('questions')}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-heading font-extrabold flex items-center justify-center gap-1.5 transition-all ${
              mobileTab === 'questions'
                ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                : 'dark:bg-slate-900 bg-slate-100 dark:border-slate-800 border-slate-200 dark:text-slate-400 text-slate-600 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>✍️ Câu hỏi ({currentPassageQuestions.filter((_, i) => userAnswersMap[currentPassage ? currentPassage.startIdx + i : i] !== undefined).length}/{currentPassageQuestions.length})</span>
          </button>
        </div>
      )}

      {/* MAIN 2-COLUMN WORKSPACE */}
      <div className={`flex-1 ${isPart6or7 ? 'flex flex-col lg:grid lg:grid-cols-12 overflow-hidden h-[calc(100vh-3.5rem)]' : 'flex flex-col lg:grid lg:grid-cols-2 overflow-y-auto lg:overflow-hidden lg:h-[calc(100vh-3.5rem)]'}`}>
        
        {/* LEFT COLUMN: PASSAGE / CONTEXT (PART 6/7) OR PROMPT (PART 5) */}
        <div 
          ref={leftColRef}
          className={`${isPart6or7 ? 'lg:col-span-7' : 'lg:col-span-1'} ${isPart6or7 && mobileTab !== 'passage' ? 'hidden lg:flex' : 'flex'} p-4 sm:p-6 pb-36 dark:bg-[#0a0f1d] bg-[#f8fafc] border-r dark:border-slate-800/80 border-slate-200 flex flex-col justify-between overflow-y-auto h-full space-y-4`}
        >
          
          <div className="space-y-4">
            {/* Passage Header */}
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold text-emerald-400 uppercase tracking-wider bg-emerald-500/10 px-3 py-1.5 rounded-xl border border-emerald-500/20">
                {isPart6or7 
                  ? (currentPassage?.passageTitle || `Đoạn văn #${currentPassageIdx + 1}`) 
                  : (currentQ.passageTitle || 'Câu hỏi Part 5')
                }
              </span>

              {isPart6or7 && currentPassage && (
                <span className="text-xs font-mono dark:text-slate-400 text-slate-600 dark:bg-slate-900 bg-white px-2.5 py-1 rounded-lg border dark:border-slate-800 border-slate-200 shadow-sm">
                  {currentPassage.questions.length} câu hỏi
                </span>
              )}
            </div>

            {/* Passage Graphic if present */}
            {((isPart6or7 && currentPassage?.imageUrl) || (!isPart6or7 && currentQ.imageUrl)) && (
              <div className="rounded-2xl border dark:border-slate-800 border-slate-200 overflow-hidden dark:bg-slate-900 bg-white p-2 text-center shadow-sm">
                <img 
                  src={isPart6or7 ? currentPassage.imageUrl : currentQ.imageUrl} 
                  alt="TOEIC Passage Graphic" 
                  className="max-h-80 mx-auto rounded-xl object-contain" 
                />
              </div>
            )}

            {isPart6or7 ? (
              <div className="space-y-4">
                <div className="p-5 sm:p-6 rounded-3xl dark:bg-slate-900/90 bg-white border dark:border-slate-800 border-slate-200 dark:text-slate-200 text-slate-800 text-sm sm:text-base leading-relaxed space-y-4 font-sans shadow-md select-text toeic-passage-container">
                  <div 
                    className="max-w-none select-text"
                    dangerouslySetInnerHTML={{ __html: currentPassage?.passageText || currentQ.passageText || '' }} 
                  />
                </div>

                {/* Collapsible Full Passage Translation in Vietnamese (Reveals after answering) */}
                {currentPassageQuestions.some((_, i) => userAnswersMap[currentPassage ? currentPassage.startIdx + i : i] !== undefined) && currentPassage?.questions[0]?.translation && (
                  <div className="p-4 rounded-2xl dark:bg-slate-900/60 bg-slate-50 border dark:border-slate-800 border-slate-200 space-y-2 animate-fadeIn shadow-sm">
                    <button
                      onClick={() => setShowPassageTranslation(!showPassageTranslation)}
                      className="flex items-center justify-between w-full text-xs font-bold text-sky-500 hover:text-sky-600 dark:hover:text-sky-400 transition-colors cursor-pointer"
                    >
                      <div className="flex items-center gap-1.5">
                        <Languages className="w-3.5 h-3.5" />
                        <span>Bản dịch Tiếng Việt bài đọc</span>
                      </div>
                      <span className="text-[10px] dark:text-slate-500 text-slate-400">{showPassageTranslation ? 'Thu gọn ▲' : 'Xem bản dịch ▼'}</span>
                    </button>

                    {showPassageTranslation && (
                      <div className="pt-2 text-xs dark:text-slate-300 text-slate-700 leading-relaxed italic whitespace-pre-line border-t dark:border-slate-800/80 border-slate-200">
                        {currentPassage.questions[0].translation}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-3 select-text">
                <span className="text-[10px] font-extrabold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                  Đề bài & Đoạn trích
                </span>
                <p className="text-sm font-semibold dark:text-slate-200 text-slate-800 leading-relaxed">
                  {currentQ.prompt || 'Select the best answer to complete the sentence.'}
                </p>
                <div className="p-5 rounded-2xl dark:bg-slate-900/80 bg-white border dark:border-slate-800 border-slate-200 dark:text-slate-100 text-slate-900 text-base font-semibold leading-relaxed shadow-sm">
                  {currentQ.passageText}
                </div>
              </div>
            )}
            {/* On mobile for Part 6/7: Quick prominent button to switch to questions */}
            {isPart6or7 && (
              <div className="lg:hidden pt-3">
                <button
                  onClick={() => setMobileTab('questions')}
                  className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/25 active:scale-95 transition-all cursor-pointer font-heading tracking-wide"
                >
                  <Edit3 className="w-4 h-4 stroke-[2.5]" />
                  <span>CHUYỂN SANG LÀM BÀI ({currentPassageQuestions.length} CÂU)</span>
                  <ChevronRight className="w-4 h-4 stroke-[2.5]" />
                </button>
              </div>
            )}

            {/* BOTTOM SPACER BUFFER (Tránh bị thanh cố định che khi cuộn hết cỡ) */}
            <div className="h-28 sm:h-36 shrink-0 pointer-events-none" aria-hidden="true" />
          </div>
        </div>

        {/* RIGHT COLUMN: QUESTIONS & OPTIONS (PASSAGE MODE VS SINGLE MODE) */}
        <div className={`${isPart6or7 ? 'lg:col-span-5' : 'lg:col-span-1'} ${isPart6or7 && mobileTab !== 'questions' ? 'hidden lg:flex' : 'flex'} p-4 sm:p-6 pb-36 sm:pb-40 dark:bg-slate-950 bg-[#f8fafc] flex flex-col justify-between overflow-y-auto lg:overflow-hidden h-full border-l dark:border-slate-800/60 border-slate-200 relative`}>
          
          {/* Floating peek button for passage on mobile when answering questions */}
          {isPart6or7 && (
            <button
              onClick={() => setMobileTab('passage')}
              className="lg:hidden fixed bottom-20 right-4 z-40 px-4 py-2.5 rounded-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs shadow-2xl flex items-center gap-1.5 border-2 border-emerald-300 active:scale-95 transition-all cursor-pointer font-heading"
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Xem lại bài đọc</span>
            </button>
          )}

          <div 
            ref={rightColRef}
            className="space-y-6 overflow-y-auto pr-1 pb-36 sm:pb-40"
          >
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
                    Nâng cấp VIP PRO chỉ 99.000đ (4 tháng) để mở khóa trọn bộ {questionsList.length} câu hỏi Level 1 và toàn bộ 5 Levels {partParam} cùng 100% lời giải chi tiết, mẹo làm bài 3 giây và phân tích bẫy ETS!
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
                      setCurrentQuestionIdx(0);
                      setCurrentPassageIdx(0);
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="w-full sm:w-auto px-5 py-3 rounded-2xl dark:bg-slate-800 bg-slate-100 hover:bg-slate-200 dark:hover:bg-slate-700 dark:text-slate-300 text-slate-700 font-bold text-xs transition-colors cursor-pointer"
                  >
                    ← Quay lại 20 câu miễn phí
                  </button>
                </div>
              </div>
            ) : isPart6or7 ? (
              <div className="space-y-6">
                {currentPassageQuestions.map((qItem, subIdx) => {
                  const globalIdx = currentPassage ? currentPassage.startIdx + subIdx : subIdx;
                  const selectedOptIdx = userAnswersMap[globalIdx];
                  const isAnswered = selectedOptIdx !== undefined;
                  const itemCorrectIdx = getCorrectIndex(qItem);
                  const isItemCorrect = selectedOptIdx === itemCorrectIdx;
                  const itemTranslations = getChoiceTranslations(qItem);
                  const itemVocab = qItem.vocabularyList && qItem.vocabularyList.length > 0 ? qItem.vocabularyList : extractVocabRecommendations(qItem);

                  return (
                    <div 
                      key={globalIdx}
                      className="p-5 sm:p-6 rounded-3xl dark:bg-slate-900/70 bg-white border dark:border-slate-800/90 border-slate-200 space-y-4 shadow-md"
                    >
                      {/* Question Header */}
                      <div className="flex items-start justify-between border-b dark:border-slate-800/80 border-slate-200 pb-3 gap-3">
                        <div className="flex items-center gap-2.5 flex-1">
                          <span className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 font-heading font-black text-sm flex items-center justify-center shrink-0">
                            {qItem.questionNum || (globalIdx + 1)}
                          </span>
                          <span className="text-sm sm:text-base font-semibold dark:text-slate-100 text-slate-900 leading-snug">
                            {qItem.prompt || `Câu hỏi ${qItem.questionNum || (globalIdx + 1)}`}
                          </span>
                        </div>

                        <button 
                          onClick={() => {
                            setBookmarkedQuestions(prev => ({ ...prev, [globalIdx]: !prev[globalIdx] }));
                            showToast(!bookmarkedQuestions[globalIdx] ? '⭐ Đã lưu đánh dấu câu hỏi!' : 'Đã bỏ đánh dấu.');
                          }}
                          className={`p-1.5 rounded-lg transition-colors shrink-0 cursor-pointer ${
                            bookmarkedQuestions[globalIdx] ? 'bg-amber-500/20 text-amber-500' : 'dark:bg-slate-800 bg-slate-100 dark:text-slate-400 text-slate-500 hover:text-amber-500'
                          }`}
                          title="Đánh dấu câu hỏi"
                        >
                          <Star className={`w-4 h-4 ${bookmarkedQuestions[globalIdx] ? 'fill-amber-400' : ''}`} />
                        </button>
                      </div>

                      {/* Options (A, B, C, D) */}
                      <div className="space-y-2.5">
                        {qItem.options?.map((opt, optIdx) => {
                          const isSelected = selectedOptIdx === optIdx;
                          const isThisCorrect = optIdx === itemCorrectIdx;

                          let btnStyle = 'dark:bg-slate-900/90 bg-white dark:border-slate-800 border-slate-200 dark:text-slate-200 text-slate-800 hover:border-emerald-500/50 dark:hover:border-emerald-500/50 hover:bg-slate-50 dark:hover:bg-slate-800 shadow-sm';
                          let bubbleStyle = 'dark:border-slate-700 border-slate-300 dark:bg-slate-800 bg-slate-100 dark:text-slate-300 text-slate-700 font-bold';

                          if (isAnswered) {
                            if (isThisCorrect) {
                              btnStyle = 'bg-emerald-500/15 border-emerald-500 text-emerald-800 dark:text-emerald-200 font-bold shadow-md shadow-emerald-500/10';
                              bubbleStyle = 'border-emerald-500 bg-emerald-500 text-slate-950 font-black';
                            } else if (isSelected) {
                              btnStyle = 'bg-rose-500/15 border-rose-500 text-rose-800 dark:text-rose-200 font-bold shadow-md shadow-rose-500/10';
                              bubbleStyle = 'border-rose-500 bg-rose-500 text-white font-black';
                            } else {
                              btnStyle = 'dark:bg-slate-950/50 bg-slate-100/70 dark:border-slate-800/60 border-slate-200 dark:text-slate-400 text-slate-500 opacity-60';
                              bubbleStyle = 'dark:border-slate-800 border-slate-200 dark:bg-slate-900 bg-slate-200/80 dark:text-slate-500 text-slate-400';
                            }
                          } else if (isSelected) {
                            btnStyle = 'bg-emerald-500/15 border-emerald-500 text-emerald-800 dark:text-emerald-200 font-bold shadow-sm';
                            bubbleStyle = 'border-emerald-500 bg-emerald-500 text-slate-950 font-black';
                          }

                          return (
                            <button
                              key={optIdx}
                              onClick={() => handleSelectOptionInPassage(globalIdx, optIdx, qItem)}
                              className={`w-full p-3.5 sm:p-4 rounded-2xl border text-left flex flex-col gap-1.5 transition-all duration-200 cursor-pointer ${btnStyle}`}
                            >
                              <div className="flex items-center justify-between w-full">
                                <div className="flex items-center gap-3 flex-1">
                                  <div className={`w-7 h-7 rounded-full border flex items-center justify-center text-xs font-bold shrink-0 transition-colors ${bubbleStyle}`}>
                                    {opt.label.replace(/[\(\)]/g, '')}
                                  </div>
                                  <span className="font-semibold text-xs md:text-sm select-text flex-1">
                                    {opt.text}
                                  </span>
                                </div>

                                {isAnswered && isThisCorrect && (
                                  <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 animate-scaleUp" />
                                )}
                                {isAnswered && isSelected && !isThisCorrect && (
                                  <XCircle className="w-5 h-5 text-rose-500 shrink-0 animate-scaleUp" />
                                )}
                              </div>

                              {/* Song ngữ translation below option button */}
                              {(() => {
                                if (!isAnswered || !isBilingualOn) return null;
                                let trans = (opt.vietnamese || opt.translation || itemTranslations[opt.label.replace(/[\(\)]/g, '')] || '').trim();
                                if (/mymemory/i.test(trans) || /^Người\s+[a-zA-Z]/i.test(trans) || /^Phương án lựa chọn:\s*[a-zA-Z]/i.test(trans)) {
                                  trans = translateToeicOption(opt.text) || '';
                                }
                                if (!trans || trans === '.' || trans.toLowerCase() === (opt.text || '').trim().toLowerCase()) {
                                  return null;
                                }
                                return (
                                  <div className="border-l-2 border-emerald-400/60 pl-3 ml-1 text-xs font-normal dark:text-slate-400 text-slate-600 leading-relaxed">
                                    {trans}
                                  </div>
                                );
                              })()}
                            </button>
                          );
                        })}
                      </div>

                      {/* Explanation & Trap Analysis Card (Opens after answering) */}
                      {isAnswered && (
                        <div className="p-4 rounded-2xl bg-amber-500/5 border border-amber-500/20 space-y-2 animate-fadeIn text-xs dark:text-slate-300 text-slate-700 leading-relaxed">
                          <div className="flex items-center gap-2 font-bold text-amber-500 dark:text-amber-400">
                            <Sparkles className="w-3.5 h-3.5" />
                            <span>LỜI GIẢI & DẪN CHỨNG ETS (CÂU #{qItem.questionNum || (globalIdx + 1)})</span>
                          </div>
                          <div className="whitespace-pre-line dark:text-slate-200 text-slate-800">
                            {qItem.explanation || 'Đáp án đúng là lựa chọn chính xác theo ngữ cảnh đoạn văn.'}
                          </div>
                        </div>
                      )}

                      {/* Vocabulary Box for this Question */}
                      {isAnswered && renderVocabularyCard(itemVocab)}
                    </div>
                  );
                })}
              </div>
            ) : (
              /* ========================================================================= */
              /* SINGLE MODE (PART 5 & GRAMMAR): RENDER SINGLE QUESTION */
              /* ========================================================================= */
              <div className="space-y-4 p-5 sm:p-6 rounded-3xl dark:bg-slate-900/70 bg-white border dark:border-slate-800/90 border-slate-200 shadow-md">
                {/* Header with Bookmark */}
                <div className="flex items-center justify-between border-b dark:border-slate-800 border-slate-200 pb-3">
                  <h2 className="font-heading font-bold text-sm sm:text-base dark:text-white text-slate-900">
                    Câu hỏi #{currentQ.questionNum || currentQuestionIdx + 1}
                  </h2>
                  <button 
                    onClick={() => {
                      setIsBookmarked(!isBookmarked);
                      showToast(!isBookmarked ? '⭐ Đã lưu đánh dấu câu hỏi!' : 'Đã bỏ đánh dấu câu hỏi.');
                    }}
                    className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                      isBookmarked ? 'bg-amber-500/20 text-amber-500' : 'dark:bg-slate-900 bg-slate-100 text-slate-400 hover:text-amber-500'
                    }`}
                    title="Đánh dấu câu hỏi"
                  >
                    <Star className={`w-4 h-4 ${isBookmarked ? 'fill-amber-400' : ''}`} />
                  </button>
                </div>

                {/* OPTIONS RADIO LIST */}
                <div className="space-y-2.5">
                  {currentQ.options?.map((opt, idx) => {
                    const isSelected = selectedOption === idx;
                    const isCorrect = (idx === correctIdx);
                    const showResult = selectedOption !== null;

                    let btnStyle = 'dark:bg-slate-900/90 bg-white dark:border-slate-800 border-slate-200 dark:text-slate-200 text-slate-800 hover:border-emerald-500/50 dark:hover:border-emerald-500/50 hover:bg-slate-50 dark:hover:bg-slate-800 shadow-sm';
                    let bubbleStyle = 'dark:border-slate-700 border-slate-300 dark:bg-slate-800 bg-slate-100 dark:text-slate-300 text-slate-700 font-bold';

                    if (showResult) {
                      if (isCorrect) {
                        btnStyle = 'bg-emerald-500/15 border-emerald-500 text-emerald-800 dark:text-emerald-200 font-bold shadow-md shadow-emerald-500/10';
                        bubbleStyle = 'border-emerald-500 bg-emerald-500 text-slate-950 font-black';
                      } else if (isSelected) {
                        btnStyle = 'bg-rose-500/15 border-rose-500 text-rose-800 dark:text-rose-200 font-bold shadow-md shadow-rose-500/10';
                        bubbleStyle = 'border-rose-500 bg-rose-500 text-white font-black';
                      } else {
                        btnStyle = 'dark:bg-slate-950/50 bg-slate-100/70 dark:border-slate-800/60 border-slate-200 dark:text-slate-400 text-slate-500 opacity-60';
                        bubbleStyle = 'dark:border-slate-800 border-slate-200 dark:bg-slate-900 bg-slate-200/80 dark:text-slate-500 text-slate-400';
                      }
                    } else if (isSelected) {
                      btnStyle = 'bg-emerald-500/15 border-emerald-500 text-emerald-800 dark:text-emerald-200 font-bold shadow-sm';
                      bubbleStyle = 'border-emerald-500 bg-emerald-500 text-slate-950 font-black';
                    }

                    return (
                      <button
                        key={idx}
                        onClick={() => handleOptionClick(idx)}
                        className={`w-full p-3.5 sm:p-4 rounded-2xl border text-left flex flex-col gap-1 transition-all duration-200 cursor-pointer ${btnStyle}`}
                      >
                        <div className="flex items-center justify-between w-full">
                          <div className="flex items-center gap-3 flex-1">
                            <div className={`w-7 h-7 rounded-full border flex items-center justify-center text-xs font-bold shrink-0 transition-colors ${bubbleStyle}`}>
                              {opt.label.replace(/[\(\)]/g, '')}
                            </div>
                            <span className="font-semibold text-xs md:text-sm select-text flex-1">
                              {opt.text}
                            </span>
                          </div>

                          {showResult && isCorrect && (
                            <span className="text-[10px] text-emerald-500 font-extrabold uppercase shrink-0">Đúng ✓</span>
                          )}
                          {showResult && isSelected && !isCorrect && (
                            <span className="text-[10px] text-rose-500 font-extrabold uppercase shrink-0">Sai ✗</span>
                          )}
                        </div>

                        {/* Option translation */}
                        {(() => {
                          if (!showResult || !isBilingualOn) return null;
                          let trans = (opt.vietnamese || opt.translation || translationsMap[opt.label.replace(/[\(\)]/g, '')] || '').trim();
                          if (/mymemory/i.test(trans) || /^Người\s+[a-zA-Z]/i.test(trans) || /^Phương án lựa chọn:\s*[a-zA-Z]/i.test(trans)) {
                            trans = translateToeicOption(opt.text) || '';
                          }
                          if (!trans || trans === '.' || trans.toLowerCase() === (opt.text || '').trim().toLowerCase()) {
                            return null;
                          }
                          return (
                            <div className="border-l-2 border-emerald-400/60 pl-3 ml-1 text-xs font-normal dark:text-slate-400 text-slate-600 leading-relaxed mt-1">
                              {trans}
                            </div>
                          );
                        })()}
                      </button>
                    );
                  })}
                </div>

                {/* DỊCH NGHĨA CÂU HỎI PANEL */}
                {selectedOption !== null && (
                  <div className="p-4 sm:p-5 rounded-3xl dark:bg-slate-900/90 bg-white border dark:border-sky-500/30 border-sky-200 space-y-3 shadow-md animate-fadeIn">
                    <div className="flex items-center justify-between border-b dark:border-slate-800 border-slate-200 pb-3">
                      <div className="flex items-center gap-2 text-sky-500">
                        <Languages className="w-4 h-4" />
                        <span className="font-heading font-extrabold text-sm dark:text-white text-slate-900">Dịch nghĩa câu hỏi</span>
                      </div>

                      <button
                        onClick={() => setIsTranslationPanelOpen(prev => !prev)}
                        className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors cursor-pointer ${
                          isTranslationPanelOpen ? 'bg-sky-500' : 'bg-slate-300 dark:bg-slate-700'
                        }`}
                        title={isTranslationPanelOpen ? 'Đóng bản dịch' : 'Mở bản dịch'}
                      >
                        <div className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                          isTranslationPanelOpen ? 'translate-x-5' : 'translate-x-0'
                        }`} />
                      </button>
                    </div>

                    {isTranslationPanelOpen && (
                      <div className="space-y-2.5 pt-1">
                        {(currentQ.promptTranslation || currentQ.translation) && (
                          <div className="p-3 rounded-2xl dark:bg-slate-950/80 bg-sky-50/60 border dark:border-slate-800/80 border-sky-200 text-xs dark:text-sky-200 text-slate-800 leading-relaxed font-medium">
                            <strong className="text-sky-500">{isPart6or7 ? 'Dịch nghĩa câu hỏi: ' : 'Dịch nghĩa câu: '}</strong>
                            <span>{currentQ.promptTranslation || currentQ.translation}</span>
                          </div>
                        )}

                        {['A', 'B', 'C', 'D'].slice(0, currentQ.options?.length || 4).map((letter, lIdx) => {
                          const isCorrect = lIdx === correctIdx;
                          const translatedText = translationsMap[letter] || 'Lựa chọn ' + letter;

                          return (
                            <div
                              key={letter}
                              className={`p-3 rounded-2xl border text-xs sm:text-sm leading-relaxed transition-all flex items-start gap-2.5 ${
                                isCorrect 
                                  ? 'bg-emerald-500/15 border-emerald-500/50 text-emerald-700 dark:text-emerald-300 font-medium shadow-sm' 
                                  : 'dark:bg-slate-950/60 bg-slate-50 dark:border-slate-800/80 border-slate-200 dark:text-slate-300 text-slate-700'
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

                {/* LỜI GIẢI CHI TIẾT */}
                {selectedOption !== null && currentQ.explanation && (
                  <div className="p-4 rounded-2xl dark:bg-emerald-950/20 bg-emerald-50/60 border dark:border-emerald-500/20 border-emerald-200 text-xs leading-relaxed space-y-1">
                    <strong className="text-amber-500 dark:text-amber-400 font-bold">💡 Giải thích & Bẫy ETS: </strong>
                    <div className="whitespace-pre-line text-emerald-800 dark:text-emerald-200/90">{currentQ.explanation}</div>
                  </div>
                )}

                {/* TỪ VỰNG NÊN HỌC */}
                {selectedOption !== null && renderVocabularyCard(currentVocabRecommendations)}
              </div>
            )}

            {/* BOTTOM SPACER BUFFER (Tránh bị thanh cố định che khi cuộn hết cỡ) */}
            <div className="h-28 sm:h-36 shrink-0 pointer-events-none" aria-hidden="true" />

          </div>
        </div>

      </div>

      {/* ========================================================================= */}
      {/* 3. UNIFIED FIXED BOTTOM BAR (FIX CỨNG Ở ĐÁY MÀN HÌNH - CHUẨN ĐẬU TOEIC) */}
      {/* ========================================================================= */}
      <footer className="fixed bottom-0 left-0 right-0 z-40 h-16 border-t dark:border-slate-800/90 border-slate-200/90 dark:bg-[#070b14]/95 bg-white/95 backdrop-blur-2xl px-4 sm:px-8 flex items-center justify-between gap-4 shadow-[0_-8px_25px_rgba(0,0,0,0.15)] transition-all">
        
        {/* Left Actions: Báo lỗi, Giỏ từ, Tra từ */}
        <div className="flex items-center gap-2 sm:gap-3">
          <button 
            onClick={() => showToast('Đã ghi nhận báo cáo phản hồi câu hỏi!')}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl dark:bg-slate-900 bg-slate-100 border dark:border-slate-800 border-slate-200 dark:text-slate-400 text-slate-600 hover:text-rose-500 text-xs font-semibold transition-colors cursor-pointer shadow-sm"
            title="Báo lỗi câu hỏi"
          >
            <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
            <span className="hidden sm:inline">Báo lỗi</span>
          </button>

          <button 
            onClick={() => setShowVocabDrawer(true)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl dark:bg-slate-900 bg-slate-100 border dark:border-slate-800 border-slate-200 text-amber-500 text-xs font-bold transition-colors cursor-pointer shadow-sm hover:border-amber-500"
            title="Xem giỏ từ vựng"
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>Giỏ từ ({savedVocab.length})</span>
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
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl border text-xs font-bold transition-all shadow-sm cursor-pointer ${
              isDictModalOpen
                ? 'bg-sky-500 text-slate-950 border-sky-400 shadow-sky-500/20'
                : 'dark:bg-slate-900 bg-slate-100 dark:border-slate-800 border-slate-200 dark:text-slate-400 text-slate-600 hover:text-slate-900 dark:hover:text-white'
            }`}
            title="Tra từ điển TOEIC"
          >
            <Search className={`w-3.5 h-3.5 ${isDictModalOpen ? 'text-slate-950' : 'text-sky-500'}`} />
            <span>Tra từ</span>
          </button>
        </div>

        {/* Right Navigation: Prev, Grid Matrix, Next */}
        <div className="flex items-center gap-2 sm:gap-3">
          <button 
            disabled={isPart6or7 ? currentPassageIdx === 0 : currentQuestionIdx === 0}
            onClick={() => {
              if (isPart6or7) setCurrentPassageIdx(prev => Math.max(0, prev - 1));
              else setCurrentQuestionIdx(prev => Math.max(0, prev - 1));
            }}
            className="px-3.5 py-2 rounded-xl dark:bg-slate-900 bg-slate-100 border dark:border-slate-800 border-slate-200 dark:text-slate-400 text-slate-600 hover:text-slate-900 dark:hover:text-white disabled:opacity-40 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-sm"
            title={isPart6or7 ? "Đoạn trước (←)" : "Câu trước (←)"}
          >
            <ChevronLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Trước</span>
          </button>

          <button 
            onClick={() => setShowGridDrawer(true)}
            className="px-3.5 py-2 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 font-mono font-extrabold text-xs flex items-center gap-1.5 hover:bg-emerald-500/25 transition-colors cursor-pointer shadow-sm"
            title="Danh sách câu hỏi & đoạn văn"
          >
            <Grid className="w-3.5 h-3.5 text-emerald-500" />
            <span>
              {isPart6or7 
                ? `Đoạn ${currentPassageIdx + 1}/${passages.length}` 
                : `Câu ${currentQuestionIdx + 1}/${questionsList.length}`
              }
            </span>
          </button>

          <button 
            disabled={isPart6or7 ? currentPassageIdx === passages.length - 1 : currentQuestionIdx === questionsList.length - 1}
            onClick={() => {
              if (isPart6or7) {
                const nextP = currentPassageIdx + 1;
                if (isPassageLocked(nextP)) {
                  setShowPricingModal(true);
                  return;
                }
                setCurrentPassageIdx(Math.min(passages.length - 1, nextP));
              } else {
                const nextQ = currentQuestionIdx + 1;
                if (isQuestionLocked(nextQ)) {
                  setShowPricingModal(true);
                  return;
                }
                setCurrentQuestionIdx(Math.min(questionsList.length - 1, nextQ));
              }
            }}
            className="px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-xs flex items-center gap-1.5 shadow-lg shadow-emerald-500/20 active:scale-95 disabled:opacity-40 transition-all cursor-pointer"
            title={isPart6or7 ? "Đoạn tiếp theo (→)" : "Câu tiếp theo (→)"}
          >
            <span>{isPart6or7 ? 'Đoạn tiếp theo' : 'Câu tiếp theo'}</span>
            <ChevronRight className="w-4 h-4 stroke-[3]" />
          </button>
        </div>

      </footer>

      {/* ADVANCED TOOL MODALS */}
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
          try {
            const updated = await addWordToBasket(w, currentDeckName, 'reading_practice');
            if (updated && Array.isArray(updated)) setSavedVocab(updated);
            showToast(`⭐ Đã lưu từ "${w.word}" vào học phần "${currentDeckName}"!`);
          } catch(e) {}
        }}
      />

      <FillInBlanksModal
        isOpen={showFillInBlanks}
        onClose={() => setShowFillInBlanks(false)}
        question={currentQ}
      />

      <PersonalNoteModal
        isOpen={showPersonalNoteModal}
        onClose={() => setShowPersonalNoteModal(false)}
        questionId={`read_${id}_q${currentQuestionIdx + 1}`}
        title={`Ghi chú - Câu ${currentQuestionIdx + 1}`}
      />


      <VocabularyDrawer 
        isOpen={showVocabDrawer}
        onClose={() => setShowVocabDrawer(false)}
        vocabList={savedVocab}
        onDeleteWord={async (idx) => {
          const target = savedVocab[idx];
          if (target?.word) {
            await removeWordFromBasket(target.word);
          }
          const next = savedVocab.filter((_, i) => i !== idx);
          setSavedVocab(next);
        }}
      />

      <ExitModal 
        isOpen={showExitModal}
        onClose={() => setShowExitModal(false)}
        onConfirmExit={async () => {
          setShowExitModal(false);
          setIsSavingProgress(true);

          try {
            syncProgressToStorage(userAnswersMap, currentQuestionIdx, currentPassageIdx, practiceXp);
          } catch (e) {
            console.warn('Sync on exit error:', e);
          }

          setTimeout(() => {
            setIsSavingProgress(false);
            navigate(`/read?mode=practice&part=${encodeURIComponent(partParam)}`);
          }, 1200);
        }}
      />

      <DauSavingProgressOverlay 
        isVisible={isSavingProgress}
      />

      {/* QUESTION & PASSAGE MATRIX GRID DRAWER */}
      {showGridDrawer && (
        <div 
          className="fixed inset-0 z-50 dark:bg-slate-950/80 bg-slate-900/40 backdrop-blur-sm flex items-end sm:items-center justify-center p-4 animate-fadeIn"
          onClick={() => setShowGridDrawer(false)}
        >
          <div 
            className="glass-card max-w-3xl w-full rounded-3xl border dark:border-slate-800 border-slate-200 dark:bg-slate-950 bg-white p-6 space-y-4 max-h-[85vh] overflow-y-auto shadow-2xl"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b dark:border-slate-800 border-slate-200 pb-3">
              <div>
                <h3 className="font-heading font-extrabold text-base dark:text-white text-slate-900">
                  {isPart6or7 
                    ? `DANH SÁCH ${passages.length} ĐOẠN VĂN (${questionsList.length} CÂU HỎI)` 
                    : `DANH SÁCH ${questionsList.length} CÂU HỎI PART 5`
                  }
                </h3>
                <p className="text-xs dark:text-slate-400 text-slate-600">Chọn để chuyển nhanh đến đoạn văn / câu hỏi</p>
              </div>
              <button 
                onClick={() => setShowGridDrawer(false)}
                className="p-1 rounded-lg dark:bg-slate-900 bg-slate-100 dark:text-slate-400 text-slate-600 hover:text-slate-900 dark:hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {isPart6or7 ? (
              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-3">
                {passages.map((p, pIdx) => {
                  const isCurrent = currentPassageIdx === pIdx;
                  const isLocked = isPassageLocked(pIdx);
                  const answeredCount = p.questions.filter((_, subIdx) => userAnswersMap[p.startIdx + subIdx] !== undefined).length;
                  const isFullyAnswered = answeredCount === p.questions.length && p.questions.length > 0;

                  return (
                    <button
                      key={pIdx}
                      onClick={() => {
                        if (isLocked) {
                          setShowPricingModal(true);
                          return;
                        }
                        setCurrentPassageIdx(pIdx);
                        setShowGridDrawer(false);
                      }}
                      className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between gap-1.5 ${
                        isCurrent
                          ? 'border-emerald-400 bg-emerald-500/20 text-emerald-700 dark:text-white ring-2 ring-emerald-500/30 font-bold'
                          : isLocked
                          ? 'dark:bg-slate-900/40 bg-slate-100/70 border-dashed border-amber-500/40 opacity-80 hover:opacity-100 hover:border-amber-500'
                          : isFullyAnswered
                          ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-600 dark:text-emerald-300'
                          : 'dark:border-slate-800 border-slate-200 dark:bg-slate-900/60 bg-slate-50 dark:text-slate-300 text-slate-700 hover:border-slate-300 dark:hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-heading font-extrabold text-xs flex items-center gap-1">
                          {isLocked && <Crown className="w-3 h-3 text-amber-500 fill-amber-500 shrink-0" />}
                          Đoạn {pIdx + 1}
                        </span>
                        <span className="text-[10px] font-mono dark:text-slate-400 text-slate-500">
                          {p.questions.length} câu
                        </span>
                      </div>
                      <span className="text-[10px] dark:text-slate-400 text-slate-500 truncate">
                        {p.passageTitle || `Q${p.questions[0]?.questionNum || (p.startIdx + 1)}`}
                      </span>
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="grid grid-cols-5 sm:grid-cols-10 gap-2">
                {questionsList.map((_, qIdx) => {
                  const isCurrent = currentQuestionIdx === qIdx;
                  const isAnswered = userAnswersMap[qIdx] !== undefined;
                  const isLocked = isQuestionLocked(qIdx);

                  let cellStyle = 'dark:border-slate-800 border-slate-200 dark:bg-slate-900 bg-slate-50 dark:text-slate-300 text-slate-700 hover:border-slate-300 dark:hover:border-slate-700';
                  if (isLocked) {
                    cellStyle = 'dark:bg-slate-900/40 bg-slate-100 border-dashed border-amber-500/40 text-amber-500 hover:border-amber-500';
                  } else if (isCurrent) {
                    cellStyle = 'border-emerald-400 bg-emerald-500 text-slate-950 shadow-md font-black';
                  } else if (isAnswered) {
                    cellStyle = 'border-emerald-500/40 bg-emerald-500/15 text-emerald-600 dark:text-emerald-300';
                  }

                  return (
                    <button
                      key={qIdx}
                      onClick={() => {
                        if (isLocked) {
                          setShowPricingModal(true);
                          return;
                        }
                        setCurrentQuestionIdx(qIdx);
                        setShowGridDrawer(false);
                      }}
                      className={`p-2 rounded-xl text-xs font-mono font-bold border text-center transition-all cursor-pointer flex items-center justify-center gap-0.5 ${cellStyle}`}
                    >
                      {isLocked && <Crown className="w-2.5 h-2.5 text-amber-500 fill-amber-500 shrink-0" />}
                      <span>{qIdx + 1}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* VIP PRO PRICING MODAL */}
      <PricingModal
        isOpen={showPricingModal}
        onClose={() => setShowPricingModal(false)}
        onUpgradeSuccess={() => setIsProUser(true)}
      />

    </div>
  );
}
