import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Navbar from '../components/Navbar';
import usePageTitle from '../hooks/usePageTitle';
import { 
  Headphones, 
  Sparkles, 
  Play, 
  CheckCircle2, 
  XCircle,
  ArrowRight, 
  Flame, 
  Volume2, 
  BookOpen, 
  Award, 
  Layers,
  Crown,
  Lock,
  Printer,
  Copy,
  RotateCcw, 
  Trash2,
  Sliders,
  Check,
  Zap,
  Bookmark,
  Edit3,
  ShoppingBag,
  FileText
} from 'lucide-react';

import PricingModal from '../components/PricingModal';
import VipLockOverlay from '../components/VipLockOverlay';
import VocabularyDrawer from '../components/VocabularyDrawer';
import PersonalNoteModal from '../components/PersonalNoteModal';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { getPracticeProgress, resetPracticeProgress } from '../services/practiceProgressService';
import { getBasketWords, removeWordFromBasket } from '../services/vocabBasketService';
import { getStoredUser, setStoredUser } from '../utils/auth';

export default function ListeningDashboard() {
  usePageTitle('Luyện Nghe TOEIC Online - 4 Chế Độ Đậu TOEIC');
  const { requireAuth, isPro: authIsPro, refreshProfile } = useAuth();
  const rawNavigate = useNavigate();
  const navigate = (to, options) => {
    if (typeof to === 'string' && (to.startsWith('/listen/practice') || to.startsWith('/listen/level-practice') || to.startsWith('/listen/dictation'))) {
      return requireAuth(to);
    }
    return rawNavigate(to, options);
  };
  const [searchParams, setSearchParams] = useSearchParams();

  // Read URL query params on load or back button
  const urlTab = searchParams.get('tab') || searchParams.get('mode') || 'type';
  const urlPart = parseInt(searchParams.get('part'), 10) || 1;
  const urlYear = searchParams.get('year') || '2026';

  // 3 Main Tabs: 'type' (Theo dạng bài) | 'level' (Theo level) | 'dictation' (Nghe chép)
  const [mainTab, setMainTab] = useState(urlTab);

  // Sub-tab for Part 1-4
  const [activePart, setActivePart] = useState(urlPart);

  // Sub-tab for Dictation (2026, 2024, 2023, MASTER, topic, review)
  const [dictationYear, setDictationYear] = useState(urlYear);

  // Keep state synced when user clicks browser Back / Forward buttons
  useEffect(() => {
    const currentTab = searchParams.get('tab') || searchParams.get('mode') || 'type';
    const currentPart = parseInt(searchParams.get('part'), 10) || 1;
    const currentYear = searchParams.get('year') || '2026';

    setMainTab(currentTab);
    setActivePart(currentPart);
    setDictationYear(currentYear);
  }, [searchParams]);

  // Tab switch handlers that update URL
  const handleTabChange = (newTab) => {
    setMainTab(newTab);
    setSearchParams({ tab: newTab, part: activePart, year: dictationYear }, { replace: true });
  };

  const handlePartChange = (newPart) => {
    setActivePart(newPart);
    setSearchParams({ tab: mainTab, part: newPart, year: dictationYear }, { replace: true });
  };

  const handleDictationYearChange = (newYear) => {
    setDictationYear(newYear);
    setSearchParams({ tab: mainTab, part: activePart, year: newYear }, { replace: true });
  };

  // Pricing Modal & User VIP status
  const [showPricingModal, setShowPricingModal] = useState(false);
  const [isProUser, setIsProUser] = useState(() => {
    const stored = getStoredUser();
    return Boolean(stored?.isPro || stored?.role === 'admin');
  });

  useEffect(() => {
    if (authIsPro) {
      setIsProUser(true);
    }
  }, [authIsPro]);

  const [practiceProgressMap, setPracticeProgressMap] = useState({});
  const [resetConfirmLvl, setResetConfirmLvl] = useState(null);
  const [showVocabDrawer, setShowVocabDrawer] = useState(false);
  const [basketWords, setBasketWords] = useState([]);
  const [activeNoteModal, setActiveNoteModal] = useState(null);

  const [levelExercises, setLevelExercises] = useState([]);
  const [topicExercises, setTopicExercises] = useState([]);
  const [dictationExercises, setDictationExercises] = useState([]);

  // Fetch listening exercises for active tab and active part to display real attemptsCount
  useEffect(() => {
    let isMounted = true;
    async function loadListeningExercises() {
      try {
        if (mainTab === 'level') {
          const res = await axios.get(`/api/v1/listening/exercises?mode=level&part=${activePart}`);
          if (isMounted && res.data?.data) {
            setLevelExercises(res.data.data);
          }
        } else if (mainTab === 'type') {
          const res = await axios.get(`/api/v1/listening/exercises?mode=topic&part=${activePart}`);
          if (isMounted && res.data?.data) {
            setTopicExercises(res.data.data);
          }
        } else if (mainTab === 'dictation') {
          const res = await axios.get(`/api/v1/listening/exercises?mode=dictation&part=${activePart}&year=${dictationYear}`);
          if (isMounted && res.data?.data) {
            setDictationExercises(res.data.data);
          }
        }
      } catch (err) {
        console.warn('Load listening exercises warning:', err.message);
      }
    }
    loadListeningExercises();
    return () => { isMounted = false; };
  }, [mainTab, activePart, dictationYear]);

  const getTopicAttempts = (title, fallback = 240) => {
    const match = topicExercises.find(e => e.topic === title || e.title === title);
    return match?.attemptsCount || fallback;
  };

  // Load user practice progress for level cards, dictation & basket words
  const loadPracticeProgress = async () => {
    try {
      const { map } = await getPracticeProgress();
      if (map) setPracticeProgressMap(map);
    } catch (e) {}
    try {
      const words = await getBasketWords();
      if (words) setBasketWords(words);
    } catch (e) {}
  };

  useEffect(() => {
    loadPracticeProgress();
    const onFocus = () => loadPracticeProgress();
    window.addEventListener('focus', onFocus);

    const handleBasketUpdate = (e) => {
      const detail = e?.detail;
      if (detail?.allWords && Array.isArray(detail.allWords)) {
        setBasketWords(detail.allWords);
      } else {
        getBasketWords().then(words => {
          if (words) setBasketWords(words);
        }).catch(() => {});
      }
    };
    window.addEventListener('vocab_basket_updated', handleBasketUpdate);

    return () => {
      window.removeEventListener('focus', onFocus);
      window.removeEventListener('vocab_basket_updated', handleBasketUpdate);
    };
  }, [activePart, mainTab]);

  // Sync user profile & VIP status
  useEffect(() => {
    async function checkPro() {
      try {
        const stored = getStoredUser();
        if (stored?.isPro || stored?.role === 'admin') {
          setIsProUser(true);
        }
        const res = await axios.get('/api/v1/user/profile');
        if (res.data?.data) {
          const isVip = Boolean(res.data.data.isPro || res.data.data.role === 'admin');
          setIsProUser(isVip);
          if (isVip && !stored?.isPro) {
            setStoredUser({ ...stored, ...res.data.data, isPro: true });
          }
        }
      } catch (e) {}
    }
    checkPro();
    window.addEventListener('auth_state_changed', checkPro);
    return () => window.removeEventListener('auth_state_changed', checkPro);
  }, []);

  // --- DATA FOR TAB 1: THEO DẠNG BÀI (DYNAMIC FROM DATABASE) ---
  const part1Topics = [
    { title: 'Tranh một người', total: 220 },
    { title: 'Tranh nhiều người', total: 104 },
    { title: 'Tranh cảnh vật', total: 214 }
  ];

  const part2Topics = [
    { title: 'Câu khẳng định', total: 780 },
    { title: 'Câu hỏi Be/Do/Have', total: 162 },
    { title: 'Câu hỏi Modal verb', total: 158 },
    { title: 'Câu hỏi When', total: 156 },
    { title: 'Câu hỏi How', total: 155 },
    { title: 'Câu hỏi Why', total: 144 },
    { title: 'Câu hỏi lựa chọn', total: 174 },
    { title: 'Câu hỏi phủ định', total: 142 },
    { title: 'Câu hỏi Who', total: 127 },
    { title: 'Câu hỏi Where', total: 123 },
    { title: 'Câu hỏi What', total: 92 },
    { title: 'Câu hỏi đuôi', total: 88 }
  ];

  // Part 3: 3 Special Formats (Includes 3-Speaker Conversations)
  const part3Special = [
    { title: 'Có hình / bảng biểu', total: 375 },
    { title: 'Hội thoại 3 người nói', total: 255 },
    { title: 'Câu hỏi hàm ý người nói', total: 126 }
  ];

  const part3Topics = [
    { title: 'Lịch hẹn, cuộc họp & tiến độ công việc', total: 924 },
    { title: 'Đơn hàng, kho bãi & giao nhận', total: 552 },
    { title: 'Mua sắm, cửa hàng & đổi trả', total: 420 },
    { title: 'Nhà ở & dịch vụ đời sống', total: 378 },
    { title: 'Tàu xe & đi lại hằng ngày', total: 261 },
    { title: 'Nhà hàng & ăn uống', total: 204 },
    { title: 'Sân bay, khách sạn & du lịch', total: 150 },
    { title: 'Marketing, bán hàng & khách hàng', total: 126 },
    { title: 'Công nghệ, IT & website', total: 69 },
    { title: 'Sự cố, bảo trì & xây dựng', total: 72 },
    { title: 'Đào tạo & nhân viên mới', total: 60 },
    { title: 'Sự kiện, hội thảo & tiệc', total: 57 },
    { title: 'Kế toán, hoá đơn & ngân sách', total: 45 },
    { title: 'Tuyển dụng, lương & phúc lợi', total: 33 },
    { title: 'Y tế & dịch vụ công', total: 9 },
    { title: 'Chủ đề khác', total: 261 }
  ];

  // Part 4: 2 Special Formats (Short Talks do NOT have 3-speaker conversations)
  const part4Special = [
    { title: 'Có hình / bảng biểu', total: 228 },
    { title: 'Câu hỏi hàm ý người nói', total: 150 }
  ];

  const part4Topics = [
    { title: 'Lịch hẹn, cuộc họp & tiến độ công việc', total: 756 },
    { title: 'Nhà ở & dịch vụ đời sống', total: 561 },
    { title: 'Đơn hàng, kho bãi & giao nhận', total: 324 },
    { title: 'Mua sắm, cửa hàng & đổi trả', total: 276 },
    { title: 'Tàu xe & đi lại hằng ngày', total: 192 },
    { title: 'Nhà hàng & ăn uống', total: 165 },
    { title: 'Sân bay, khách sạn & du lịch', total: 66 },
    { title: 'Sự kiện, hội thảo & tiệc', total: 48 },
    { title: 'Công nghệ, IT & website', total: 42 },
    { title: 'Sự cố, bảo trì & xây dựng', total: 42 },
    { title: 'Marketing, bán hàng & khách hàng', total: 27 },
    { title: 'Đào tạo & nhân viên mới', total: 27 },
    { title: 'Kế toán, hoá đơn & ngân sách', total: 21 },
    { title: 'Y tế & dịch vụ công', total: 18 },
    { title: 'Tuyển dụng, lương & phúc lợi', total: 12 },
    { title: 'Chủ đề khác', total: 153 }
  ];

  // --- DATA FOR TAB 2: THEO LEVEL (5 LEVELS DYNAMIC PER PART - CALIBRATED FOR 200 STUDENTS) ---
  const getLevelList = (part) => {
    const defaultData = {
      1: [
        { levelNum: 1, name: 'Level 1 — Dễ', attempts: 895, total: 93, isPro: false },
        { levelNum: 2, name: 'Level 2 — Cơ bản', attempts: 542, total: 93, isPro: false },
        { levelNum: 3, name: 'Level 3 — Trung bình', attempts: 326, total: 92, isPro: true },
        { levelNum: 4, name: 'Level 4 — Khó', attempts: 184, total: 92, isPro: true },
        { levelNum: 5, name: 'Level 5 — Rất khó', attempts: 72, total: 92, isPro: true }
      ],
      2: [
        { levelNum: 1, name: 'Level 1 — Dễ', attempts: 768, total: 385, isPro: false },
        { levelNum: 2, name: 'Level 2 — Cơ bản', attempts: 485, total: 385, isPro: false },
        { levelNum: 3, name: 'Level 3 — Trung bình', attempts: 294, total: 385, isPro: true },
        { levelNum: 4, name: 'Level 4 — Khó', attempts: 156, total: 385, isPro: true },
        { levelNum: 5, name: 'Level 5 — Rất khó', attempts: 68, total: 385, isPro: true }
      ],
      3: [
        { levelNum: 1, name: 'Level 1 — Dễ', attempts: 512, total: 435, isPro: false },
        { levelNum: 2, name: 'Level 2 — Cơ bản', attempts: 345, total: 435, isPro: false },
        { levelNum: 3, name: 'Level 3 — Trung bình', attempts: 218, total: 435, isPro: true },
        { levelNum: 4, name: 'Level 4 — Khó', attempts: 115, total: 435, isPro: true },
        { levelNum: 5, name: 'Level 5 — Rất khó', attempts: 48, total: 435, isPro: true }
      ],
      4: [
        { levelNum: 1, name: 'Level 1 — Dễ', attempts: 426, total: 360, isPro: false },
        { levelNum: 2, name: 'Level 2 — Cơ bản', attempts: 284, total: 360, isPro: false },
        { levelNum: 3, name: 'Level 3 — Trung bình', attempts: 176, total: 360, isPro: true },
        { levelNum: 4, name: 'Level 4 — Khó', attempts: 92, total: 360, isPro: true },
        { levelNum: 5, name: 'Level 5 — Rất khó', attempts: 38, total: 360, isPro: true }
      ]
    };

    const base = defaultData[part] || defaultData[1];
    return base.map(item => {
      const match = levelExercises.find(e => e.level === item.levelNum);
      const attCount = match?.attemptsCount ?? item.attempts;
      const totCount = match?.totalQuestions || item.total;
      return {
        ...item,
        total: totCount,
        attempts: `${attCount} lượt làm`,
        completed: 0,
        correct: 0,
        wrong: 0
      };
    });
  };

  const levelList = getLevelList(activePart);

  // --- DATA FOR TAB 3: NGHE CHÉP (DICTATION 10 TESTS MATCHING DAU TOEIC 100%) ---
  const p3Counts = [156, 142, 138, 148, 150, 144, 140, 146, 152, 145];
  const p4Counts = [106, 101, 98, 104, 102, 100, 105, 103, 108, 100];

  const getCurrentUserId = () => {
    const user = getStoredUser();
    return user?.userId || user?._id || user?.id || user?.email || 'guest';
  };

  const getDictationProgress = (year, part, testOrTopic, totalCount) => {
    const stdKey = `dictation_p${part}_${year}_${testOrTopic}`;
    const altKey = `dictation_p${part}_${year}_test${testOrTopic}`;
    
    let progress = practiceProgressMap[stdKey] || practiceProgressMap[altKey];
    
    // Fallback: check localStorage mirror tuongtan_dictation_resume_*
    if (!progress || !progress.completedCount) {
      try {
        const userId = getCurrentUserId();
        const localKey1 = `tuongtan_dictation_resume_${userId}_part${part}_${year}_${testOrTopic}`;
        const localKey2 = `tuongtan_dictation_resume_${userId}_part${part}_${year}_test${testOrTopic}`;
        const localKey3 = `tuongtan_practice_progress_${userId}_${stdKey}`;
        const raw = localStorage.getItem(localKey1) || localStorage.getItem(localKey2) || localStorage.getItem(localKey3);
        if (raw) {
          const parsed = JSON.parse(raw);
          if (parsed) {
            const completedLen = typeof parsed.completedCount === 'number'
              ? parsed.completedCount
              : (Array.isArray(parsed.completedSentences)
                ? parsed.completedSentences.length
                : (Array.isArray(parsed.completedList)
                  ? parsed.completedList.length
                  : (Array.isArray(parsed.userAnswersMap?.completedList) ? parsed.userAnswersMap.completedList.length : 0)));
            return {
              completed: completedLen,
              total: totalCount,
              isCompleted: completedLen >= totalCount && totalCount > 0
            };
          }
        }
      } catch (e) {}
    }

    if (progress) {
      const completed = Number(progress.completedCount) || 0;
      return {
        completed,
        total: progress.totalQuestions || totalCount,
        isCompleted: Boolean(progress.isCompleted) || (completed >= totalCount && totalCount > 0)
      };
    }

    return { completed: 0, total: totalCount, isCompleted: false };
  };

  const dictationTests = useMemo(() => {
    return Array.from({ length: 10 }, (_, i) => {
      const testNum = i + 1;
      const p1Count = 24;
      const p2Count = 100;
      const p3Count = p3Counts[i] || 140;
      const p4Count = p4Counts[i] || 100;

      const p1Prog = getDictationProgress(dictationYear, 1, testNum, p1Count);
      const p2Prog = getDictationProgress(dictationYear, 2, testNum, p2Count);
      const p3Prog = getDictationProgress(dictationYear, 3, testNum, p3Count);
      const p4Prog = getDictationProgress(dictationYear, 4, testNum, p4Count);

      return {
        testNum,
        p1: { count: p1Count, completed: p1Prog.completed, isCompleted: p1Prog.isCompleted },
        p2: { count: p2Count, completed: p2Prog.completed, isCompleted: p2Prog.isCompleted },
        p3: { count: p3Count, completed: p3Prog.completed, isCompleted: p3Prog.isCompleted },
        p4: { count: p4Count, completed: p4Prog.completed, isCompleted: p4Prog.isCompleted }
      };
    });
  }, [dictationYear, practiceProgressMap]);

  const handleStartPractice = (modeName, testNumber = 1, part = 1, level = null) => {
    let url = `/listen/practice/test${testNumber}?mode=${modeName}&test=${testNumber}&part=${part}`;
    if (level) {
      url = `/listen/practice/level${level}?mode=${modeName}&level=${level}&part=${part}`;
    }
    navigate(url);
  };


  return (
    <div className="min-h-screen dark:bg-[#0b1120] bg-[#f8fafc] dark:text-slate-100 text-slate-900 flex flex-col font-sans pb-16 transition-colors duration-200">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* HERO BANNER: CHINH PHỤC TOEIC LISTENING */}
        <div className="relative overflow-hidden rounded-3xl glass-panel border dark:border-slate-800 border-slate-200 p-8 md:p-10 dark:bg-gradient-to-r dark:from-purple-950/40 dark:via-[#0f172a] dark:to-[#0b1120] bg-gradient-to-r from-purple-50 via-white to-indigo-50/60 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl dark:shadow-2xl">
          <div className="space-y-3 text-center md:text-left">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full dark:bg-purple-500/10 bg-purple-100 border dark:border-purple-500/30 border-purple-300 text-purple-700 dark:text-purple-400 text-xs font-bold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" />
              <span>LUYỆN NGHE TOEIC</span>
            </div>
            <h1 className="text-3xl md:text-5xl font-extrabold font-heading dark:text-white text-slate-900 tracking-tight leading-tight">
              Chinh phục <span className="bg-gradient-to-r from-purple-600 via-pink-500 to-cyan-500 dark:from-purple-400 dark:via-pink-300 dark:to-cyan-300 bg-clip-text text-transparent">TOEIC Listening</span> từ dễ đến khó
            </h1>
            <p className="dark:text-slate-400 text-slate-600 text-sm md:text-base">
              Luyện Part 1—4 theo 5 cấp độ và luyện nghe chép chính tả Dictation.
            </p>
          </div>

          <div className="w-24 h-24 md:w-28 md:h-28 rounded-3xl bg-gradient-to-tr from-purple-600 to-indigo-500 p-0.5 shadow-2xl shadow-purple-500/30 flex items-center justify-center shrink-0">
            <div className="w-full h-full dark:bg-slate-950 bg-white rounded-[22px] flex items-center justify-center">
              <Headphones className="w-12 h-12 text-purple-500 dark:text-purple-400 animate-float" />
            </div>
          </div>
        </div>

        {/* 3 MAIN TABS SWITCHER */}
        <div className="flex items-center gap-3 border-b dark:border-slate-800 border-slate-200 pb-4 overflow-x-auto">
          
          {/* Tab 1: Theo dạng bài */}
          <button
            onClick={() => handleTabChange('type')}
            className={`px-5 py-2.5 rounded-2xl text-xs font-heading font-extrabold transition-all flex items-center gap-2 shrink-0 ${
              mainTab === 'type'
                ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30'
                : 'dark:bg-slate-900 bg-white border dark:border-slate-800 border-slate-200 dark:text-slate-400 text-slate-600 hover:text-purple-600 dark:hover:text-white shadow-sm'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Theo dạng bài</span>
            <span className="px-1.5 py-0.2 rounded bg-rose-500 text-white text-[9px] font-black uppercase">NEW</span>
          </button>

          {/* Tab 2: Theo level */}
          <button
            onClick={() => handleTabChange('level')}
            className={`px-5 py-2.5 rounded-2xl text-xs font-heading font-extrabold transition-all flex items-center gap-2 shrink-0 ${
              mainTab === 'level'
                ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30'
                : 'dark:bg-slate-900 bg-white border dark:border-slate-800 border-slate-200 dark:text-slate-400 text-slate-600 hover:text-purple-600 dark:hover:text-white shadow-sm'
            }`}
          >
            <Sliders className="w-4 h-4" />
            <span>Theo level</span>
          </button>

          {/* Tab 3: Nghe chép */}
          <button
            onClick={() => handleTabChange('dictation')}
            className={`px-5 py-2.5 rounded-2xl text-xs font-heading font-extrabold transition-all flex items-center gap-2 shrink-0 ${
              mainTab === 'dictation'
                ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30'
                : 'dark:bg-slate-900 bg-white border dark:border-slate-800 border-slate-200 dark:text-slate-400 text-slate-600 hover:text-purple-600 dark:hover:text-white shadow-sm'
            }`}
          >
            <Edit3 className="w-4 h-4" />
            <span>Nghe chép</span>
          </button>

        </div>

        {/* SUB-TABS: PART 1-4 (For Tab 1 and Tab 2) */}
        {mainTab !== 'dictation' && (
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            {[1, 2, 3, 4].map((pNum) => (
              <button
                key={pNum}
                onClick={() => handlePartChange(pNum)}
                className={`px-4 py-1.5 rounded-xl text-xs font-heading font-extrabold transition-all flex items-center gap-1.5 shrink-0 ${
                  activePart === pNum
                    ? 'bg-purple-600 text-white shadow-md shadow-purple-600/20'
                    : 'dark:bg-slate-900/80 bg-white border dark:border-slate-800 border-slate-200 dark:text-slate-400 text-slate-600 hover:text-purple-600 dark:hover:text-white shadow-sm'
                }`}
              >
                <Headphones className="w-3.5 h-3.5" />
                <span>Part {pNum}</span>
              </button>
            ))}
          </div>
        )}

        {/* SUB-TABS: YEAR FILTERS (For Tab 3: Nghe Chép) */}
        {mainTab === 'dictation' && (
          <div className="flex items-center gap-2.5 overflow-x-auto pb-1">
            {[
              { id: '2026', label: 'Đề 2026' },
              { id: '2024', label: 'Đề 2024' },
              { id: '2023', label: 'Đề 2023' },
              { id: 'master', label: 'TOEIC MASTER' },
              { id: 'topic', label: 'Nghe theo chủ đề', icon: '🔥', hot: true },
              { id: 'review', label: 'Câu cần luyện lại', icon: '🔖' }
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => handleDictationYearChange(f.id)}
                className={`px-4 py-2 rounded-full text-xs font-heading font-extrabold transition-all flex items-center gap-1.5 shrink-0 ${
                  dictationYear === f.id
                    ? 'bg-[#7c3aed] text-white shadow-md shadow-purple-600/30'
                    : 'dark:bg-[#0f172a] bg-white border dark:border-slate-800 border-slate-200 dark:text-slate-400 text-slate-600 hover:text-purple-600 dark:hover:text-white shadow-sm'
                }`}
              >
                {f.icon && <span>{f.icon}</span>}
                <span>{f.label}</span>
                {f.hot && (
                  <span className="px-1.5 py-0.2 rounded bg-amber-500 text-slate-950 font-black text-[9px] uppercase tracking-wider ml-0.5">
                    HOT
                  </span>
                )}
              </button>
            ))}
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 1 CONTENT: THEO DẠNG BÀI */}
        {/* ========================================================= */}
        {mainTab === 'type' && (
          <div className="space-y-6">
            
            {/* PART 1 */}
            {activePart === 1 && (
              <div className="space-y-3">
                <div className="space-y-1">
                  <h3 className="text-sm font-bold dark:text-slate-300 text-slate-800">Theo chủ đề</h3>
                  <p className="text-xs dark:text-slate-400 text-slate-600">Luyện theo các chủ đề thường gặp ở Part 1. Mỗi câu vẫn thuộc đúng chủ đề gốc của nó.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {part1Topics.map((item, idx) => {
                    // FREE: idx=0 (Tranh một người), PRO: idx=1,2
                    const isLocked = !isProUser && idx > 0;
                    const exKey = `listening_p1_topic_${encodeURIComponent(item.title)}`;
                    const progress = practiceProgressMap[exKey];
                    const completed = progress?.completedCount || 0;
                    const correct = progress?.correctCount || 0;
                    const wrong = progress?.wrongCount || 0;
                    const percent = Math.min(100, Math.round((completed / item.total) * 100)) || 0;

                    return (
                      <VipLockOverlay
                        key={idx}
                        isLocked={isLocked}
                        compact
                        onUnlockClick={() => setShowPricingModal(true)}
                        label="VIP — Mở khóa chủ đề này"
                      >
                        <div className="glass-panel rounded-3xl border dark:border-slate-800 border-slate-200 hover:border-cyan-500/40 p-6 dark:bg-slate-900/60 bg-white space-y-4 transition-all shadow-sm flex flex-col justify-between">
                          <div className="space-y-2">
                            <div className="flex items-center justify-between gap-2">
                              <h4 className="font-heading font-extrabold text-base dark:text-white text-slate-900">{item.title}</h4>
                              <span className="text-[10px] font-bold text-cyan-600 dark:text-cyan-400 bg-cyan-500/10 px-1.5 py-0.5 rounded border border-cyan-500/20 font-mono shrink-0">
                                {getTopicAttempts(item.title, 240 + (idx * 29) % 320)} lượt
                              </span>
                            </div>
                            
                            {completed > 0 ? (
                              <div className="space-y-1.5 pt-1">
                                <div className="flex items-center justify-between text-xs font-semibold">
                                  <div className="flex items-center gap-2">
                                    <span className="font-mono font-extrabold text-emerald-600 dark:text-emerald-400 text-sm">
                                      {completed}/{item.total}
                                    </span>
                                    <span className="flex items-center gap-0.5 text-[11px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded">
                                      <CheckCircle2 className="w-3 h-3" /> {correct}
                                    </span>
                                    <span className="flex items-center gap-0.5 text-[11px] font-bold text-rose-600 dark:text-rose-400 bg-rose-500/10 px-1.5 py-0.5 rounded">
                                      <XCircle className="w-3 h-3" /> {wrong}
                                    </span>
                                  </div>
                                  <span className="text-[10px] text-slate-400 font-mono">{percent}%</span>
                                </div>
                                <div className="h-1.5 rounded-full dark:bg-slate-950 bg-slate-100 overflow-hidden border dark:border-slate-800 border-slate-200">
                                  <div 
                                    className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-500" 
                                    style={{ width: `${percent}%` }}
                                  />
                                </div>
                              </div>
                            ) : (
                              <span className="text-xs dark:text-slate-400 text-slate-500 block">Chưa luyện tập • {item.total} câu</span>
                            )}
                          </div>

                          <div className="flex items-center justify-between pt-3 border-t dark:border-slate-800/60 border-slate-100">
                            <div className="inline-flex items-center gap-0.5 p-0.5 rounded-full dark:bg-slate-950/70 bg-slate-100 border dark:border-slate-800 border-slate-200 text-slate-400">
                              <button onClick={() => window.print()} className="p-1.5 rounded-full hover:bg-slate-200 dark:hover:bg-slate-800 hover:text-slate-700 dark:hover:text-slate-200 transition-colors" title="In đề"><Printer className="w-3.5 h-3.5" /></button>
                              <button onClick={() => setActiveNoteModal({ id: exKey, title: item.title })} className="p-1.5 rounded-full hover:bg-slate-200 dark:hover:bg-slate-800 hover:text-slate-700 dark:hover:text-slate-200 transition-colors" title="Ghi chú cá nhân"><FileText className="w-3.5 h-3.5" /></button>
                              <button onClick={() => setResetConfirmLvl({ name: item.title, exerciseKey: exKey })} className="p-1.5 rounded-full hover:bg-slate-200 dark:hover:bg-slate-800 hover:text-rose-500 transition-colors" title="Làm lại từ đầu (Xóa tiến độ)"><RotateCcw className="w-3.5 h-3.5" /></button>
                              <button onClick={() => { navigator.clipboard?.writeText(window.location.href); }} className="p-1.5 rounded-full hover:bg-slate-200 dark:hover:bg-slate-800 hover:text-slate-700 dark:hover:text-slate-200 transition-colors" title="Chia sẻ"><Copy className="w-3.5 h-3.5" /></button>
                            </div>

                            <button
                              onClick={() => navigate(`/listen/level-practice?part=1&mode=topic&topic=${encodeURIComponent(item.title)}`)}
                              className="px-4 py-2 rounded-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-heading font-extrabold text-xs shadow-md shadow-emerald-500/20 transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
                            >
                              <BookOpen className="w-3.5 h-3.5" />
                              <span>{completed > 0 ? 'Luyện tiếp' : 'Luyện tập'}</span>
                            </button>
                          </div>
                        </div>
                      </VipLockOverlay>
                    );
                  })}
                </div>
              </div>
            )}

            {/* PART 2 */}
            {activePart === 2 && (
              <div className="space-y-3">
                <div className="space-y-1">
                  <h3 className="text-sm font-bold dark:text-slate-300 text-slate-800">Theo chủ đề</h3>
                  <p className="text-xs dark:text-slate-400 text-slate-600">Luyện theo các chủ đề thường gặp ở Part 2. Mỗi câu vẫn thuộc đúng chủ đề gốc của nó.</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {part2Topics.map((item, idx) => {
                    // FREE: idx=0 "Câu khẳng định", idx=1 "Câu hỏi Be/Do/Have" — PRO: idx=2..11
                    const isLocked = !isProUser && idx > 1;
                    const exKey = `listening_p2_topic_${encodeURIComponent(item.title)}`;
                    const progress = practiceProgressMap[exKey];
                    const completed = progress?.completedCount || 0;
                    const correct = progress?.correctCount || 0;
                    const wrong = progress?.wrongCount || 0;
                    const percent = Math.min(100, Math.round((completed / item.total) * 100)) || 0;

                    return (
                      <VipLockOverlay
                        key={idx}
                        isLocked={isLocked}
                        compact
                        onUnlockClick={() => setShowPricingModal(true)}
                        label="VIP"
                      >
                        <div className="glass-panel rounded-2xl border dark:border-slate-800 border-slate-200 hover:border-cyan-500/40 p-5 dark:bg-slate-900/60 bg-white space-y-3 transition-all flex flex-col justify-between shadow-sm">
                          <div className="space-y-1.5">
                            <div className="flex items-center justify-between gap-2">
                              <h4 className="font-heading font-extrabold text-sm dark:text-white text-slate-900">{item.title}</h4>
                              <span className="text-[10px] font-bold text-cyan-600 dark:text-cyan-400 bg-cyan-500/10 px-1.5 py-0.2 rounded border border-cyan-500/20 font-mono shrink-0">
                                {getTopicAttempts(item.title, 210 + (idx * 19) % 300)} lượt
                              </span>
                            </div>
                            {completed > 0 ? (
                              <div className="space-y-1">
                                <div className="flex items-center justify-between text-[11px] font-semibold">
                                  <div className="flex items-center gap-1.5">
                                    <span className="font-mono font-extrabold text-emerald-600 dark:text-emerald-400">
                                      {completed}/{item.total}
                                    </span>
                                    <span className="text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-500/10 px-1 py-0.2 rounded text-[10px]">
                                      ✓ {correct}
                                    </span>
                                    <span className="text-rose-600 dark:text-rose-400 font-bold bg-rose-500/10 px-1 py-0.2 rounded text-[10px]">
                                      ✗ {wrong}
                                    </span>
                                  </div>
                                  <span className="text-[10px] text-slate-400 font-mono">{percent}%</span>
                                </div>
                                <div className="h-1 rounded-full dark:bg-slate-950 bg-slate-100 overflow-hidden border dark:border-slate-800 border-slate-200">
                                  <div 
                                    className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-500" 
                                    style={{ width: `${percent}%` }}
                                  />
                                </div>
                              </div>
                            ) : (
                              <span className="text-[11px] dark:text-slate-400 text-slate-500 block">Chưa luyện tập • {item.total} câu</span>
                            )}
                          </div>

                          <div className="flex items-center justify-between pt-2 border-t dark:border-slate-800/60 border-slate-100">
                            <div className="inline-flex items-center gap-0.5 p-0.5 rounded-full dark:bg-slate-950/70 bg-slate-100 border dark:border-slate-800 border-slate-200 text-slate-400">
                              <button onClick={() => window.print()} className="p-1 rounded-full hover:bg-slate-200 dark:hover:bg-slate-800 hover:text-slate-700 dark:hover:text-slate-200" title="In đề"><Printer className="w-3 h-3" /></button>
                              <button onClick={() => setActiveNoteModal({ id: exKey, title: item.title })} className="p-1 rounded-full hover:bg-slate-200 dark:hover:bg-slate-800 hover:text-slate-700 dark:hover:text-slate-200" title="Ghi chú"><FileText className="w-3 h-3" /></button>
                              <button onClick={() => setResetConfirmLvl({ name: item.title, exerciseKey: exKey })} className="p-1 rounded-full hover:bg-slate-200 dark:hover:bg-slate-800 hover:text-rose-500" title="Làm lại từ đầu"><RotateCcw className="w-3 h-3" /></button>
                            </div>

                            <button
                              onClick={() => navigate(`/listen/level-practice?part=2&mode=topic&topic=${encodeURIComponent(item.title)}`)}
                              className="px-3 py-1.5 rounded-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-[11px] transition-all flex items-center gap-1 shadow-sm cursor-pointer whitespace-nowrap"
                            >
                              <BookOpen className="w-3 h-3" />
                              <span>{completed > 0 ? 'Luyện tiếp' : 'Luyện tập'}</span>
                            </button>
                          </div>
                        </div>
                      </VipLockOverlay>
                    );
                  })}
                </div>
              </div>
            )}

            {/* PART 3 & PART 4 */}
            {(activePart === 3 || activePart === 4) && (() => {
              const currentSpecial = activePart === 3 ? part3Special : part4Special;
              const currentTopics = activePart === 3 ? part3Topics : part4Topics;

              // FREE: special idx=0 (Có hình/bảng biểu), PRO: idx=1+
              // Part 3 free topics: idx=0 (Lịch hẹn...)
              // Part 4 free topics: idx=1 (Nhà ở & dịch vụ đời sống)
              const freeTopicIdx = activePart === 3 ? 0 : 1;

              return (
                <div className="space-y-6">
                  
                  {/* Dạng đặc biệt */}
                  <div className="space-y-3">
                    <div className="space-y-1">
                      <h3 className="text-sm font-bold text-amber-500 dark:text-amber-400">Dạng đặc biệt</h3>
                      <p className="text-xs dark:text-slate-400 text-slate-600">Luyện riêng các dạng khó của Part {activePart}.</p>
                    </div>

                    <div className={`grid grid-cols-1 ${activePart === 4 ? 'md:grid-cols-2' : 'md:grid-cols-3'} gap-4`}>
                      {currentSpecial.map((item, idx) => {
                        const isLocked = !isProUser && idx > 0;
                        const exKey = `listening_p${activePart}_topic_${encodeURIComponent(item.title)}`;
                        const progress = practiceProgressMap[exKey];
                        const completed = progress?.completedCount || 0;
                        const correct = progress?.correctCount || 0;
                        const wrong = progress?.wrongCount || 0;
                        const percent = Math.min(100, Math.round((completed / item.total) * 100)) || 0;

                        return (
                          <VipLockOverlay
                            key={idx}
                            isLocked={isLocked}
                            compact
                            onUnlockClick={() => setShowPricingModal(true)}
                            label="VIP"
                          >
                            <div className="glass-panel rounded-2xl border dark:border-slate-800 border-slate-200 hover:border-amber-500/40 p-5 dark:bg-slate-900/60 bg-white space-y-3 transition-all flex flex-col justify-between shadow-sm">
                              <div className="space-y-1.5">
                                <div className="flex items-center justify-between gap-2">
                                  <h4 className="font-heading font-extrabold text-sm dark:text-white text-slate-900">{item.title}</h4>
                                  <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 bg-amber-500/10 px-1.5 py-0.2 rounded border border-amber-500/20 font-mono shrink-0">
                                    {getTopicAttempts(item.title, 230 + (idx * 27) % 250)} lượt
                                  </span>
                                </div>
                                {completed > 0 ? (
                                  <div className="space-y-1">
                                    <div className="flex items-center justify-between text-[11px] font-semibold">
                                      <div className="flex items-center gap-1.5">
                                        <span className="font-mono font-extrabold text-emerald-600 dark:text-emerald-400">
                                          {completed}/{item.total}
                                        </span>
                                        <span className="text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-500/10 px-1 py-0.2 rounded text-[10px]">
                                          ✓ {correct}
                                        </span>
                                        <span className="text-rose-600 dark:text-rose-400 font-bold bg-rose-500/10 px-1 py-0.2 rounded text-[10px]">
                                          ✗ {wrong}
                                        </span>
                                      </div>
                                      <span className="text-[10px] text-slate-400 font-mono">{percent}%</span>
                                    </div>
                                    <div className="h-1 rounded-full dark:bg-slate-950 bg-slate-100 overflow-hidden border dark:border-slate-800 border-slate-200">
                                      <div 
                                        className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-500" 
                                        style={{ width: `${percent}%` }}
                                      />
                                    </div>
                                  </div>
                                ) : (
                                  <span className="text-[11px] dark:text-slate-400 text-slate-500 mt-1 block">Chưa luyện tập • {item.total} câu</span>
                                )}
                              </div>

                              <div className="flex items-center justify-between pt-2 border-t dark:border-slate-800/60 border-slate-100">
                                <div className="inline-flex items-center gap-0.5 p-0.5 rounded-full dark:bg-slate-950/70 bg-slate-100 border dark:border-slate-800 border-slate-200 text-slate-400">
                                  <button onClick={() => window.print()} className="p-1 rounded-full hover:bg-slate-200 dark:hover:bg-slate-800 hover:text-slate-700 dark:hover:text-slate-200" title="In đề"><Printer className="w-3 h-3" /></button>
                                  <button onClick={() => setActiveNoteModal({ id: exKey, title: item.title })} className="p-1 rounded-full hover:bg-slate-200 dark:hover:bg-slate-800 hover:text-slate-700 dark:hover:text-slate-200" title="Ghi chú"><FileText className="w-3 h-3" /></button>
                                  <button onClick={() => setResetConfirmLvl({ name: item.title, exerciseKey: exKey })} className="p-1 rounded-full hover:bg-slate-200 dark:hover:bg-slate-800 hover:text-rose-500" title="Làm lại từ đầu"><RotateCcw className="w-3 h-3" /></button>
                                </div>

                                <button
                                  onClick={() => navigate(`/listen/level-practice?part=${activePart}&mode=topic&topic=${encodeURIComponent(item.title)}`)}
                                  className="px-3 py-1.5 rounded-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-[11px] transition-all flex items-center gap-1 shadow-sm cursor-pointer whitespace-nowrap"
                                >
                                  <BookOpen className="w-3 h-3" />
                                  <span>{completed > 0 ? 'Luyện tiếp' : 'Luyện tập'}</span>
                                </button>
                              </div>
                            </div>
                          </VipLockOverlay>
                        );
                      })}
                    </div>
                  </div>

                  {/* Theo chủ đề doanh nghiệp */}
                  <div className="space-y-3">
                    <div className="space-y-1">
                      <h3 className="text-sm font-bold dark:text-slate-300 text-slate-700">Theo chủ đề</h3>
                      <p className="text-xs dark:text-slate-400 text-slate-500">Luyện theo các chủ đề thường gặp ở Part {activePart}. Mỗi câu vẫn thuộc đúng chủ đề gốc của nó.</p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                      {currentTopics.map((item, idx) => {
                        const isLocked = !isProUser && idx !== freeTopicIdx;
                        const exKey = `listening_p${activePart}_topic_${encodeURIComponent(item.title)}`;
                        const progress = practiceProgressMap[exKey];
                        const completed = progress?.completedCount || 0;
                        const correct = progress?.correctCount || 0;
                        const wrong = progress?.wrongCount || 0;
                        const percent = Math.min(100, Math.round((completed / item.total) * 100)) || 0;

                        return (
                          <VipLockOverlay
                            key={idx}
                            isLocked={isLocked}
                            compact
                            onUnlockClick={() => setShowPricingModal(true)}
                            label="VIP"
                          >
                            <div className="glass-panel rounded-2xl border dark:border-slate-800 border-slate-200 hover:border-cyan-500/40 p-5 dark:bg-slate-900/60 bg-white space-y-3 transition-all flex flex-col justify-between shadow-sm">
                              <div className="space-y-1.5">
                                <div className="flex items-center justify-between gap-2">
                                  <h4 className="font-heading font-extrabold text-sm dark:text-white text-slate-900">{item.title}</h4>
                                  <span className="text-[10px] font-bold text-cyan-600 dark:text-cyan-400 bg-cyan-500/10 px-1.5 py-0.2 rounded border border-cyan-500/20 font-mono shrink-0">
                                    {getTopicAttempts(item.title, 220 + (idx * 17) % 280)} lượt
                                  </span>
                                </div>
                                {completed > 0 ? (
                                  <div className="space-y-1">
                                    <div className="flex items-center justify-between text-[11px] font-semibold">
                                      <div className="flex items-center gap-1.5">
                                        <span className="font-mono font-extrabold text-emerald-600 dark:text-emerald-400">
                                          {completed}/{item.total}
                                        </span>
                                        <span className="text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-500/10 px-1 py-0.2 rounded text-[10px]">
                                          ✓ {correct}
                                        </span>
                                        <span className="text-rose-600 dark:text-rose-400 font-bold bg-rose-500/10 px-1 py-0.2 rounded text-[10px]">
                                          ✗ {wrong}
                                        </span>
                                      </div>
                                      <span className="text-[10px] text-slate-400 font-mono">{percent}%</span>
                                    </div>
                                    <div className="h-1 rounded-full dark:bg-slate-950 bg-slate-100 overflow-hidden border dark:border-slate-800 border-slate-200">
                                      <div 
                                        className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-500" 
                                        style={{ width: `${percent}%` }}
                                      />
                                    </div>
                                  </div>
                                ) : (
                                  <span className="text-[11px] dark:text-slate-400 text-slate-500 mt-1 block">Chưa luyện tập • {item.total} câu</span>
                                )}
                              </div>

                              <div className="flex items-center justify-between pt-2 border-t dark:border-slate-800/60 border-slate-100">
                                <div className="inline-flex items-center gap-0.5 p-0.5 rounded-full dark:bg-slate-950/70 bg-slate-100 border dark:border-slate-800 border-slate-200 text-slate-400">
                                  <button onClick={() => window.print()} className="p-1 rounded-full hover:bg-slate-200 dark:hover:bg-slate-800 hover:text-slate-700 dark:hover:text-slate-200" title="In đề"><Printer className="w-3 h-3" /></button>
                                  <button onClick={() => setActiveNoteModal({ id: exKey, title: item.title })} className="p-1 rounded-full hover:bg-slate-200 dark:hover:bg-slate-800 hover:text-slate-700 dark:hover:text-slate-200" title="Ghi chú"><FileText className="w-3 h-3" /></button>
                                  <button onClick={() => setResetConfirmLvl({ name: item.title, exerciseKey: exKey })} className="p-1 rounded-full hover:bg-slate-200 dark:hover:bg-slate-800 hover:text-rose-500" title="Làm lại từ đầu"><RotateCcw className="w-3 h-3" /></button>
                                </div>

                                <button
                                  onClick={() => navigate(`/listen/level-practice?part=${activePart}&mode=topic&topic=${encodeURIComponent(item.title)}`)}
                                  className="px-3 py-1.5 rounded-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-[11px] transition-all flex items-center gap-1 shadow-sm cursor-pointer whitespace-nowrap"
                                >
                                  <BookOpen className="w-3 h-3" />
                                  <span>{completed > 0 ? 'Luyện tiếp' : 'Luyện tập'}</span>
                                </button>
                              </div>
                            </div>
                          </VipLockOverlay>
                        );
                      })}
                    </div>
                  </div>

                </div>
              );
            })()}

          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 2 CONTENT: THEO LEVEL (5 LEVELS) */}
        {/* ========================================================= */}
        {mainTab === 'level' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
              {levelList.map((item) => {
                const isLocked = !isProUser && item.levelNum > 1;
                const exKey = `listening_p${activePart}_lv${item.levelNum}`;
                const progress = practiceProgressMap[exKey];
                const completed = progress?.completedCount || 0;
                const correct = progress?.correctCount || 0;
                const wrong = progress?.wrongCount || 0;
                const percent = Math.min(100, Math.round((completed / item.total) * 100)) || 0;

                return (
                  <VipLockOverlay
                    key={item.levelNum}
                    isLocked={isLocked}
                    onUnlockClick={() => setShowPricingModal(true)}
                    label={`Level ${item.levelNum} (VIP)`}
                  >
                    <div 
                      className="glass-panel rounded-3xl border dark:border-slate-800 border-slate-200 hover:border-purple-500/40 p-4 sm:p-5 dark:bg-slate-900/60 bg-white space-y-3.5 transition-all relative flex flex-col justify-between shadow-sm"
                    >
                      {item.isPro && (
                        <span className="absolute top-3.5 right-3.5 px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-600 dark:text-amber-300 text-[10px] font-black border border-amber-500/40 flex items-center gap-1">
                          <Crown className="w-3 h-3 fill-amber-500" />
                          PRO
                        </span>
                      )}
                      {!isProUser && item.levelNum === 1 && (
                        <span className="absolute top-3.5 right-3.5 px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 text-[10px] font-black border border-emerald-500/30 flex items-center gap-1 shadow-sm">
                          <Sparkles className="w-3 h-3" />
                          Free 20 câu
                        </span>
                      )}

                      <div className="space-y-0.5">
                        <h4 className="font-heading font-extrabold text-sm sm:text-base dark:text-white text-slate-900">{item.name}</h4>
                        <span className="text-xs dark:text-slate-400 text-slate-500 block">{item.attempts}</span>
                      </div>

                      {/* Progress Bar and Counts matching Dau TOEIC */}
                      <div className="space-y-1.5 pt-1">
                        <div className="flex items-center justify-between text-xs font-semibold">
                          <div className="flex items-center gap-1.5">
                            <span className="font-mono font-extrabold text-emerald-600 dark:text-emerald-400 text-xs sm:text-sm">
                              {completed}/{item.total}
                            </span>
                            <span className="flex items-center gap-0.5 text-[10px] sm:text-[11px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded">
                              <CheckCircle2 className="w-3 h-3" /> {correct}
                            </span>
                            <span className="flex items-center gap-0.5 text-[10px] sm:text-[11px] font-bold text-rose-600 dark:text-rose-400 bg-rose-500/10 px-1.5 py-0.5 rounded">
                              <XCircle className="w-3 h-3" /> {wrong}
                            </span>
                          </div>
                          <span className="text-[10px] text-slate-400 font-mono">
                            {percent}%
                          </span>
                        </div>

                        <div className="h-1.5 rounded-full dark:bg-slate-900 bg-slate-100 overflow-hidden border dark:border-slate-800 border-slate-200">
                          <div 
                            style={{ width: `${percent}%` }}
                            className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-300" 
                          />
                        </div>
                      </div>

                      {/* 4 Action Buttons matching Dau TOEIC */}
                      <div className="flex items-center justify-between gap-1.5 pt-3 border-t dark:border-slate-800/80 border-slate-100 mt-auto">
                        {/* Capsule 4 nút thao tác */}
                        <div className="flex items-center gap-0.5 p-0.5 sm:p-1 rounded-xl bg-slate-100 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700/60 shrink-0">
                          {/* 1. Giỏ từ */}
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setShowVocabDrawer(true);
                            }}
                            className="w-6.5 h-6.5 rounded-lg flex items-center justify-center text-slate-400 hover:text-amber-500 hover:bg-white dark:hover:bg-slate-700/60 transition-colors relative cursor-pointer"
                            title="Xem giỏ từ vựng"
                          >
                            <ShoppingBag className="w-3.5 h-3.5" />
                            {basketWords.length > 0 && (
                              <span className="absolute -top-1 -right-1 flex h-3.5 min-w-3.5 px-0.5 items-center justify-center rounded-full bg-amber-500 text-slate-950 font-bold text-[8px] shadow-sm">
                                {basketWords.length}
                              </span>
                            )}
                          </button>

                          {/* 2. Ghi chú bài học */}
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setActiveNoteModal({
                                id: exKey,
                                title: `Ghi chú — ${item.name} (Part ${activePart})`
                              });
                            }}
                            className="w-6.5 h-6.5 rounded-lg flex items-center justify-center text-slate-400 hover:text-sky-500 hover:bg-white dark:hover:bg-slate-700/60 transition-colors relative cursor-pointer"
                            title="Ghi chú bài học"
                          >
                            <FileText className="w-3.5 h-3.5" />
                          </button>

                          {/* 3. Làm lại câu sai */}
                          <button
                            type="button"
                            disabled={wrong === 0}
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/listen/level-practice?part=${activePart}&level=${item.levelNum}&redo=true`);
                            }}
                            className={`w-6.5 h-6.5 rounded-lg flex items-center justify-center transition-all relative ${
                              wrong > 0
                                ? 'text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 cursor-pointer'
                                : 'text-slate-300 dark:text-slate-600 cursor-not-allowed opacity-40'
                            }`}
                            title={wrong > 0 ? `Làm lại ${wrong} câu sai` : 'Không có câu sai'}
                          >
                            <RotateCcw className="w-3.5 h-3.5" />
                            {wrong > 0 && (
                              <span className="absolute -top-1 -right-1 flex h-3.5 min-w-3.5 px-0.5 items-center justify-center rounded-full bg-rose-500 text-white font-bold text-[8px] shadow-sm">
                                {wrong}
                              </span>
                            )}
                          </button>

                          {/* 4. Xóa tiến độ */}
                          <button
                            type="button"
                            disabled={completed === 0}
                            onClick={(e) => {
                              e.stopPropagation();
                              setResetConfirmLvl({ ...item, exerciseKey: exKey });
                            }}
                            className={`w-6.5 h-6.5 rounded-lg flex items-center justify-center transition-all ${
                              completed > 0
                                ? 'text-slate-400 hover:text-rose-500 hover:bg-white dark:hover:bg-slate-700/60 cursor-pointer'
                                : 'text-slate-300 dark:text-slate-600 cursor-not-allowed opacity-40'
                            }`}
                            title={completed > 0 ? `Xóa tiến độ ${item.name}` : 'Chưa có tiến độ để xóa'}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        {/* Luyện tập / Luyện tiếp / Luyện lại Button */}
                        <button
                          onClick={() => {
                            navigate(`/listen/level-practice?part=${activePart}&level=${item.levelNum}`);
                          }}
                          className="ml-auto shrink-0 whitespace-nowrap h-8 sm:h-8.5 px-3 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-sm shadow-emerald-600/20 flex items-center justify-center gap-1 transition-all active:scale-95 cursor-pointer"
                        >
                          <BookOpen className="w-3.5 h-3.5 shrink-0" />
                          <span>{completed > 0 ? (completed >= item.total ? 'Luyện lại' : 'Luyện tiếp') : 'Luyện tập'}</span>
                        </button>
                      </div>
                    </div>
                  </VipLockOverlay>
                );
              })}
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 3 CONTENT: NGHE CHÉP (DICTATION ETS 10 TESTS & TOPICS) */}
        {/* ========================================================= */}
        {mainTab === 'dictation' && (
          <div className="space-y-8">
            
            {/* 1. TOPIC MODE: 🔥 NGHE THEO CHỦ ĐỀ (PART 3 & PART 4) */}
            {/* 1. TOPIC MODE: 🔥 NGHE THEO CHỦ ĐỀ (PART 3 & PART 4) */}
            {dictationYear === 'topic' && (
              <div className="space-y-6">
                
                {/* Part 3 Topics */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="px-3.5 py-1.5 rounded-xl bg-purple-500/10 text-purple-400 font-heading font-extrabold text-xs border border-purple-500/20 flex items-center gap-1.5">
                      <span>PART 3 — 16 CHỦ ĐỀ HỘI THOẠI DOANH NGHIỆP</span>
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {[
                      { title: 'Tragic Loss: Remembering a Colleague', subTitle: 'Mất mát đau lòng. Tưởng nhớ đồng nghiệp', badge: 'C1', count: 9 },
                      { title: 'Canteen Management Enhancements', subTitle: 'Nâng cấp quản lý căng tin trường học', badge: 'C1', count: 9 },
                      { title: 'Investigating Milk Product Defects', subTitle: 'Điều tra lỗi đóng gói sản phẩm sữa', badge: 'C1', count: 9 },
                      { title: 'Addressing Negative Customer Feedback', subTitle: 'Giải quyết phản hồi tiêu cực từ khách hàng', badge: 'B2', count: 11 },
                      { title: 'Remote Work Policy Discussion', subTitle: 'Thảo luận quy định làm việc từ xa kết hợp', badge: 'B2', count: 9 },
                      { title: "Discussion about a Colleague's Performance", subTitle: 'Đánh giá hiệu suất làm việc đồng nghiệp', badge: 'A2', count: 7 },
                      { title: 'Return Policy Inquiry', subTitle: 'Tìm hiểu chính sách đổi trả hàng hóa', badge: 'A2', count: 9 },
                      { title: 'Gym Membership Near Office', subTitle: 'Đăng ký gói tập thể hình gần cơ quan', badge: 'A2', count: 9 },
                      { title: 'Discussing Coffee Shop Menu Changes', subTitle: 'Thay đổi thực đơn đồ uống quán cà phê', badge: 'B1', count: 9 },
                      { title: 'Hotel Booking for Business Trip', subTitle: 'Đặt phòng khách sạn chuyến công tác', badge: 'B1', count: 9 },
                      { title: 'Last-Minute International Flight Booking', subTitle: 'Đặt vé máy bay quốc tế phút chót', badge: 'B2', count: 9 },
                      { title: 'New Product Introduction to Potential Customer', subTitle: 'Giới thiệu sản phẩm mới cho khách hàng', badge: 'B2', count: 9 },
                      { title: 'Office Renovation Schedule', subTitle: 'Lịch trình nâng cấp và sửa chữa văn phòng', badge: 'B1', count: 8 },
                      { title: 'Marketing Strategy for New App Launch', subTitle: 'Chiến lược tiếp thị ra mắt ứng dụng', badge: 'B2', count: 10 },
                      { title: 'Software Update and Server Downtime', subTitle: 'Cập nhật phần mềm và bảo trì máy chủ', badge: 'B1', count: 8 },
                      { title: 'Annual Charity Auction Organization', subTitle: 'Tổ chức buổi đấu giá từ thiện thường niên', badge: 'C1', count: 9 }
                    ].map((item, idx) => {
                      const isLocked = !isProUser && idx > 0;
                      return (
                        <VipLockOverlay
                          key={idx}
                          isLocked={isLocked}
                          compact
                          onUnlockClick={() => setShowPricingModal(true)}
                          label="VIP"
                        >
                          <div className="rounded-2xl border dark:border-slate-800/80 border-slate-200 hover:border-sky-500/40 p-5 dark:bg-[#0d1424] bg-white space-y-4 transition-all flex flex-col justify-between shadow-sm">
                            <div>
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-1.5">
                                  <span className="px-2.5 py-0.5 rounded-lg bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20 text-xs font-bold font-heading">
                                    Part 3
                                  </span>
                                  <span className="px-2.5 py-0.5 rounded-lg dark:bg-slate-800/80 bg-slate-100 text-purple-700 dark:text-purple-300 font-mono text-xs font-bold border dark:border-slate-700 border-slate-200">
                                    {item.badge}
                                  </span>
                                </div>
                                <span className="text-[10px] font-bold text-purple-600 dark:text-purple-400 bg-purple-500/10 px-1.5 py-0.5 rounded border border-purple-500/20 font-mono">
                                  {dictationExercises.find(e => e.topic === item.title)?.attemptsCount || (210 + (idx * 23) % 280)} lượt
                                </span>
                              </div>

                              <h4 className="font-heading font-extrabold text-sm dark:text-white text-slate-900 mt-3 leading-snug line-clamp-2">
                                {item.title}
                              </h4>
                              <p className="text-[11px] dark:text-slate-400 text-slate-500 italic line-clamp-1 mt-1">
                                {item.subTitle}
                              </p>

                              <h5 className="font-heading font-extrabold text-base dark:text-white text-slate-900 mt-3 flex items-center gap-2">
                                <Headphones className="w-4 h-4 text-sky-500 dark:text-sky-400" />
                                <span>{item.count} câu</span>
                              </h5>
                            </div>

                            {(() => {
                              const prog = getDictationProgress('topic', 3, item.title, item.count);
                              return (
                                <div className="flex items-center justify-between pt-3 border-t dark:border-slate-800/80 border-slate-100">
                                  <span className="text-xs font-mono">
                                    {prog.completed > 0 ? (
                                      <span className={prog.isCompleted ? "text-emerald-500 font-bold" : "text-sky-500 font-bold"}>
                                        {prog.isCompleted ? `✓ Hoàn thành (${prog.completed}/${item.count})` : `${prog.completed}/${item.count} câu`}
                                      </span>
                                    ) : (
                                      <span className="dark:text-slate-400 text-slate-500">Chưa bắt đầu</span>
                                    )}
                                  </span>
                                  <button
                                    onClick={() => navigate(`/listen/dictation?year=topic&part=3&topic=${encodeURIComponent(item.title)}`)}
                                    className="px-4 py-1.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-heading font-black text-xs shadow-md shadow-sky-500/20 transition-all flex items-center gap-1 active:scale-95 cursor-pointer"
                                  >
                                    <span>{prog.completed > 0 ? (prog.isCompleted ? 'Luyện lại' : 'Luyện tiếp') : 'Luyện tập'}</span>
                                    <ArrowRight className="w-3 h-3" />
                                  </button>
                                </div>
                              );
                            })()}
                          </div>
                        </VipLockOverlay>
                      );
                    })}
                  </div>
                </div>

                {/* Part 4 Topics */}
                <div className="space-y-3 pt-4">
                  <div className="flex items-center justify-between">
                    <span className="px-3.5 py-1.5 rounded-xl bg-sky-500/10 text-sky-600 dark:text-sky-400 font-heading font-extrabold text-xs border border-sky-500/20 flex items-center gap-1.5">
                      <span>PART 4 — 8 CHỦ ĐỀ BÀI NÓI ĐỘC THOẠI</span>
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {[
                      { title: 'Company Expansion Announcement', subTitle: 'Thông báo mở rộng quy mô chi nhánh công ty', badge: 'B2', count: 8 },
                      { title: 'Voicemail Regarding Project Delay', subTitle: 'Tin nhắn thoại báo hoãn tiến độ dự án', badge: 'A2', count: 7 },
                      { title: 'Weather and Traffic Advisory Report', subTitle: 'Bản tin dự báo thời tiết bão và giao thông', badge: 'A2', count: 7 },
                      { title: 'Keynote Presentation on AI Technology', subTitle: 'Thuyết trình công nghệ trí tuệ nhân tạo', badge: 'C1', count: 9 },
                      { title: 'Museum Guided Tour Instructions', subTitle: 'Hướng dẫn đoàn tham quan bảo tàng lịch sử', badge: 'B1', count: 8 },
                      { title: 'Airport Gate Change and Boarding Call', subTitle: 'Thông báo đổi cửa khởi hành và lên máy bay', badge: 'B1', count: 8 },
                      { title: 'Award Ceremony Opening Speech', subTitle: 'Phát biểu khai mạc lễ vinh danh nhân viên', badge: 'B2', count: 8 },
                      { title: 'Promotional Radio Commercial for Supermarket', subTitle: 'Quảng cáo phát thanh ưu đãi siêu thị cuối tuần', badge: 'B2', count: 9 }
                    ].map((item, idx) => {
                      const isLocked = !isProUser && idx > 0;
                      return (
                        <VipLockOverlay
                          key={idx}
                          isLocked={isLocked}
                          compact
                          onUnlockClick={() => setShowPricingModal(true)}
                          label="VIP"
                        >
                          <div className="rounded-2xl border dark:border-slate-800/80 border-slate-200 hover:border-sky-500/40 p-5 dark:bg-[#0d1424] bg-white space-y-4 transition-all flex flex-col justify-between shadow-sm">
                            <div>
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-1.5">
                                  <span className="px-2.5 py-0.5 rounded-lg bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-500/20 text-xs font-bold font-heading">
                                    Part 4
                                  </span>
                                  <span className="px-2.5 py-0.5 rounded-lg dark:bg-slate-800/80 bg-slate-100 text-sky-700 dark:text-sky-300 font-mono text-xs font-bold border dark:border-slate-700 border-slate-200">
                                    {item.badge}
                                  </span>
                                </div>
                                <span className="text-[10px] font-bold text-sky-600 dark:text-sky-400 bg-sky-500/10 px-1.5 py-0.5 rounded border border-sky-500/20 font-mono">
                                  {dictationExercises.find(e => e.topic === item.title)?.attemptsCount || (195 + (idx * 29) % 260)} lượt
                                </span>
                              </div>

                              <h4 className="font-heading font-extrabold text-sm dark:text-white text-slate-900 mt-3 leading-snug line-clamp-2">
                                {item.title}
                              </h4>
                              <p className="text-[11px] dark:text-slate-400 text-slate-500 italic line-clamp-1 mt-1">
                                {item.subTitle}
                              </p>

                              <h5 className="font-heading font-extrabold text-base dark:text-white text-slate-900 mt-3 flex items-center gap-2">
                                <Headphones className="w-4 h-4 text-sky-500 dark:text-sky-400" />
                                <span>{item.count} câu</span>
                              </h5>
                            </div>

                            {(() => {
                              const prog = getDictationProgress('topic', 4, item.title, item.count);
                              return (
                                <div className="flex items-center justify-between pt-3 border-t dark:border-slate-800/80 border-slate-100">
                                  <span className="text-xs font-mono">
                                    {prog.completed > 0 ? (
                                      <span className={prog.isCompleted ? "text-emerald-500 font-bold" : "text-sky-500 font-bold"}>
                                        {prog.isCompleted ? `✓ Hoàn thành (${prog.completed}/${item.count})` : `${prog.completed}/${item.count} câu`}
                                      </span>
                                    ) : (
                                      <span className="dark:text-slate-400 text-slate-500">Chưa bắt đầu</span>
                                    )}
                                  </span>
                                  <button
                                    onClick={() => navigate(`/listen/dictation?year=topic&part=4&topic=${encodeURIComponent(item.title)}`)}
                                    className="px-4 py-1.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-heading font-black text-xs shadow-md shadow-sky-500/20 transition-all flex items-center gap-1 active:scale-95 cursor-pointer"
                                  >
                                    <span>{prog.completed > 0 ? (prog.isCompleted ? 'Luyện lại' : 'Luyện tiếp') : 'Luyện tập'}</span>
                                    <ArrowRight className="w-3 h-3" />
                                  </button>
                                </div>
                              );
                            })()}
                          </div>
                        </VipLockOverlay>
                      );
                    })}
                  </div>
                </div>

              </div>
            )}

            {/* 2. TOEIC MASTER PRO (9 SPECIALIZED TOPICS MATCHING DAU TOEIC 100%) */}
            {dictationYear === 'master' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <span className="px-3.5 py-1.5 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 font-heading font-extrabold text-xs border border-amber-500/20 flex items-center gap-1.5">
                    <Crown className="w-3.5 h-3.5 fill-amber-500 dark:fill-amber-400 text-amber-600" />
                    <span>TOEIC MASTER — 9 CHỦ ĐỀ LUYỆN TẬP CHUYÊN SÂU PRO</span>
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {[
                    { title: 'Tranh người', count: 101, part: 1 },
                    { title: 'Tranh cảnh vật', count: 105, part: 1 },
                    { title: 'Câu hỏi when', count: 90, part: 2 },
                    { title: 'Câu hỏi why', count: 90, part: 2 },
                    { title: 'Modal verbs', count: 90, part: 2 },
                    { title: 'Câu hỏi what', count: 90, part: 2 },
                    { title: 'Be do have', count: 90, part: 2 },
                    { title: 'Câu hỏi where', count: 90, part: 2 },
                    { title: 'Câu hỏi who', count: 90, part: 2 }
                  ].map((item, idx) => {
                    const isLocked = !isProUser && idx > 0;
                    return (
                      <VipLockOverlay
                        key={idx}
                        isLocked={isLocked}
                        compact
                        onUnlockClick={() => setShowPricingModal(true)}
                        label="VIP"
                      >
                        <div className="rounded-2xl border dark:border-slate-800/80 border-slate-200 hover:border-amber-500/40 p-5 dark:bg-[#0d1424] bg-white space-y-4 transition-all flex flex-col justify-between shadow-sm relative">
                          <div>
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-1.5">
                                <span className="px-2.5 py-0.5 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 text-xs font-bold font-heading">
                                  📄 Chuyên đề
                                </span>
                                <span className="px-2.5 py-0.5 rounded-lg dark:bg-slate-800/80 bg-slate-100 dark:text-slate-300 text-slate-700 text-xs font-bold font-heading border dark:border-slate-700 border-slate-200">
                                  Part {item.part}
                                </span>
                              </div>
                              <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20 font-mono">
                                {dictationExercises.find(e => e.topic === item.title || e.title?.includes(item.title))?.attemptsCount || (220 + (idx * 31) % 250)} lượt
                              </span>
                            </div>

                            <h4 className="font-heading font-extrabold text-base dark:text-white text-slate-900 mt-4">
                              {item.title}
                            </h4>

                            <h5 className="font-heading font-extrabold text-lg text-amber-600 dark:text-amber-300 mt-2 flex items-center gap-2">
                              <Headphones className="w-4 h-4 text-amber-500 dark:text-amber-400" />
                              <span>{item.count} câu</span>
                            </h5>
                          </div>

                          {(() => {
                            const prog = getDictationProgress('master', item.part, item.title, item.count);
                            return (
                              <div className="flex items-center justify-between pt-3 border-t dark:border-slate-800/80 border-slate-100">
                                <span className="text-xs font-mono">
                                  {prog.completed > 0 ? (
                                    <span className={prog.isCompleted ? "text-emerald-500 font-bold" : "text-sky-500 font-bold"}>
                                      {prog.isCompleted ? `✓ Hoàn thành (${prog.completed}/${item.count})` : `${prog.completed}/${item.count} câu`}
                                    </span>
                                  ) : (
                                    <span className="dark:text-slate-400 text-slate-500">Chưa bắt đầu</span>
                                  )}
                                </span>
                                <button
                                  onClick={() => navigate(`/listen/dictation?year=master&part=${item.part}&topic=${encodeURIComponent(item.title)}`)}
                                  className="px-4 py-1.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-heading font-black text-xs shadow-md shadow-sky-500/20 transition-all flex items-center gap-1 active:scale-95 cursor-pointer"
                                >
                                  <span>{prog.completed > 0 ? (prog.isCompleted ? 'Luyện lại' : 'Luyện tiếp') : 'Luyện tập'}</span>
                                  <ArrowRight className="w-3 h-3" />
                                </button>
                              </div>
                            );
                          })()}
                        </div>
                      </VipLockOverlay>
                    );
                  })}
                </div>
              </div>
            )}

            {/* 3. REVIEW TAB: 🔖 CÂU CẦN LUYỆN LẠI (MATCHING DAU TOEIC) */}
            {dictationYear === 'review' && (
              <div className="rounded-3xl border dark:border-slate-800 border-slate-200 p-10 dark:bg-[#0d1424] bg-white text-center space-y-4 max-w-xl mx-auto my-8 shadow-xl">
                <div className="w-16 h-16 rounded-3xl bg-pink-500/10 border border-pink-500/20 flex items-center justify-center mx-auto text-pink-500">
                  <Bookmark className="w-8 h-8" />
                </div>
                <h3 className="font-heading font-extrabold text-xl dark:text-white text-slate-900">
                  Chưa có câu nào cần luyện lại
                </h3>
                <p className="text-sm dark:text-slate-400 text-slate-600 leading-relaxed">
                  Trong quá trình luyện nghe chép, hãy bấm biểu tượng lưu câu để gom các câu bạn nghe chưa tốt vào đây ôn luyện lại nhé!
                </p>
                <div className="pt-2">
                  <button
                    onClick={() => handleDictationYearChange('2026')}
                    className="px-6 py-2.5 rounded-2xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-heading font-black text-sm shadow-lg shadow-sky-500/25 transition-all inline-flex items-center gap-2"
                  >
                    <span>Khám phá bài nghe</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}


            {/* 3. TESTS GRID (ĐỀ 2026, ĐỀ 2024, ĐỀ 2023) */}
            {['2026', '2024', '2023'].includes(dictationYear) && (
              <div className="space-y-4">
                {dictationTests.map((t) => {
                  // FREE: Test 1 (toàn bộ 4 Parts), PRO: Test 2-10
                  const isTestLocked = !isProUser && t.testNum > 1;
                  return (
                    <VipLockOverlay
                      key={t.testNum}
                      isLocked={isTestLocked}
                      compact
                      onUnlockClick={() => setShowPricingModal(true)}
                      label={`VIP — Mở khóa Test ${t.testNum}`}
                    >
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        
                        {/* Part 1 */}
                        <div className="rounded-2xl border dark:border-slate-800/80 border-slate-200 hover:border-sky-500/40 p-5 dark:bg-[#0d1424] bg-white space-y-4 transition-all flex flex-col justify-between shadow-sm">
                          <div>
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-1.5">
                                <span className="px-2.5 py-0.5 rounded-lg bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-500/20 text-xs font-bold font-heading">
                                  📄 Test {t.testNum}
                                </span>
                                <span className="px-2.5 py-0.5 rounded-lg dark:bg-slate-800/80 bg-slate-100 text-slate-700 dark:text-slate-300 text-xs font-bold font-heading border dark:border-slate-700 border-slate-200">
                                  Part 1
                                </span>
                              </div>
                              <span className="text-[10px] font-bold text-sky-600 dark:text-sky-400 bg-sky-500/10 px-1.5 py-0.5 rounded border border-sky-500/20 font-mono">
                                {dictationExercises.find(e => (e.topic === `Test ${t.testNum}` || e.title?.includes(`TEST ${t.testNum}`)) && e.part === 1)?.attemptsCount || (204 + (t.testNum * 17) % 240)} lượt
                              </span>
                            </div>
                            
                            <h4 className="font-heading font-extrabold text-lg dark:text-white text-slate-900 mt-4 flex items-center gap-2">
                              <Headphones className="w-4 h-4 text-sky-500 dark:text-sky-400" />
                              <span>{t.p1.count} câu</span>
                            </h4>
                          </div>

                          <div className="flex items-center justify-between pt-3 border-t dark:border-slate-800/80 border-slate-100">
                            <span className="text-xs font-mono">
                              {t.p1.completed > 0 ? (
                                <span className={t.p1.isCompleted ? "text-emerald-500 font-bold" : "text-sky-500 font-bold"}>
                                  {t.p1.isCompleted ? `✓ Hoàn thành (${t.p1.completed}/${t.p1.count})` : `${t.p1.completed}/${t.p1.count} câu`}
                                </span>
                              ) : (
                                <span className="dark:text-slate-400 text-slate-500">Chưa bắt đầu</span>
                              )}
                            </span>
                            <button
                              onClick={() => navigate(`/listen/dictation?year=${dictationYear}&test=${t.testNum}&part=1`)}
                              className="px-4 py-1.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-heading font-black text-xs shadow-md shadow-sky-500/20 transition-all flex items-center gap-1 active:scale-95 cursor-pointer"
                            >
                              <span>{t.p1.completed > 0 ? (t.p1.isCompleted ? 'Luyện lại' : 'Luyện tiếp') : 'Luyện tập'}</span>
                              <ArrowRight className="w-3 h-3" />
                            </button>
                          </div>
                        </div>

                        {/* Part 2 */}
                        <div className="rounded-2xl border dark:border-slate-800/80 border-slate-200 hover:border-sky-500/40 p-5 dark:bg-[#0d1424] bg-white space-y-4 transition-all flex flex-col justify-between shadow-sm">
                          <div>
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-1.5">
                                <span className="px-2.5 py-0.5 rounded-lg bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-500/20 text-xs font-bold font-heading">
                                  📄 Test {t.testNum}
                                </span>
                                <span className="px-2.5 py-0.5 rounded-lg dark:bg-slate-800/80 bg-slate-100 text-slate-700 dark:text-slate-300 text-xs font-bold font-heading border dark:border-slate-700 border-slate-200">
                                  Part 2
                                </span>
                              </div>
                              <span className="text-[10px] font-bold text-sky-600 dark:text-sky-400 bg-sky-500/10 px-1.5 py-0.5 rounded border border-sky-500/20 font-mono">
                                {dictationExercises.find(e => (e.topic === `Test ${t.testNum}` || e.title?.includes(`TEST ${t.testNum}`)) && e.part === 2)?.attemptsCount || (212 + (t.testNum * 19) % 240)} lượt
                              </span>
                            </div>
                            
                            <h4 className="font-heading font-extrabold text-lg dark:text-white text-slate-900 mt-4 flex items-center gap-2">
                              <Headphones className="w-4 h-4 text-sky-500 dark:text-sky-400" />
                              <span>{t.p2.count} câu</span>
                            </h4>
                          </div>

                          <div className="flex items-center justify-between pt-3 border-t dark:border-slate-800/80 border-slate-100">
                            <span className="text-xs font-mono">
                              {t.p2.completed > 0 ? (
                                <span className={t.p2.isCompleted ? "text-emerald-500 font-bold" : "text-sky-500 font-bold"}>
                                  {t.p2.isCompleted ? `✓ Hoàn thành (${t.p2.completed}/${t.p2.count})` : `${t.p2.completed}/${t.p2.count} câu`}
                                </span>
                              ) : (
                                <span className="dark:text-slate-400 text-slate-500">Chưa bắt đầu</span>
                              )}
                            </span>
                            <button
                              onClick={() => navigate(`/listen/dictation?year=${dictationYear}&test=${t.testNum}&part=2`)}
                              className="px-4 py-1.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-heading font-black text-xs shadow-md shadow-sky-500/20 transition-all flex items-center gap-1 active:scale-95 cursor-pointer"
                            >
                              <span>{t.p2.completed > 0 ? (t.p2.isCompleted ? 'Luyện lại' : 'Luyện tiếp') : 'Luyện tập'}</span>
                              <ArrowRight className="w-3 h-3" />
                            </button>
                          </div>
                        </div>

                        {/* Part 3 */}
                        <div className="rounded-2xl border dark:border-slate-800/80 border-slate-200 hover:border-sky-500/40 p-5 dark:bg-[#0d1424] bg-white space-y-4 transition-all flex flex-col justify-between shadow-sm">
                          <div>
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-1.5">
                                <span className="px-2.5 py-0.5 rounded-lg bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-500/20 text-xs font-bold font-heading">
                                  📄 Test {t.testNum}
                                </span>
                                <span className="px-2.5 py-0.5 rounded-lg dark:bg-slate-800/80 bg-slate-100 text-slate-700 dark:text-slate-300 text-xs font-bold font-heading border dark:border-slate-700 border-slate-200">
                                  Part 3
                                </span>
                              </div>
                              <span className="text-[10px] font-bold text-sky-600 dark:text-sky-400 bg-sky-500/10 px-1.5 py-0.5 rounded border border-sky-500/20 font-mono">
                                {dictationExercises.find(e => (e.topic === `Test ${t.testNum}` || e.title?.includes(`TEST ${t.testNum}`)) && e.part === 3)?.attemptsCount || (230 + (t.testNum * 21) % 240)} lượt
                              </span>
                            </div>
                            
                            <h4 className="font-heading font-extrabold text-lg dark:text-white text-slate-900 mt-4 flex items-center gap-2">
                              <Headphones className="w-4 h-4 text-sky-500 dark:text-sky-400" />
                              <span>{t.p3.count} câu</span>
                            </h4>
                          </div>

                          <div className="flex items-center justify-between pt-3 border-t dark:border-slate-800/80 border-slate-100">
                            <span className="text-xs font-mono">
                              {t.p3.completed > 0 ? (
                                <span className={t.p3.isCompleted ? "text-emerald-500 font-bold" : "text-sky-500 font-bold"}>
                                  {t.p3.isCompleted ? `✓ Hoàn thành (${t.p3.completed}/${t.p3.count})` : `${t.p3.completed}/${t.p3.count} câu`}
                                </span>
                              ) : (
                                <span className="dark:text-slate-400 text-slate-500">Chưa bắt đầu</span>
                              )}
                            </span>
                            <button
                              onClick={() => navigate(`/listen/dictation?year=${dictationYear}&test=${t.testNum}&part=3`)}
                              className="px-4 py-1.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-heading font-black text-xs shadow-md shadow-sky-500/20 transition-all flex items-center gap-1 active:scale-95 cursor-pointer"
                            >
                              <span>{t.p3.completed > 0 ? (t.p3.isCompleted ? 'Luyện lại' : 'Luyện tiếp') : 'Luyện tập'}</span>
                              <ArrowRight className="w-3 h-3" />
                            </button>
                          </div>
                        </div>

                        {/* Part 4 */}
                        <div className="rounded-2xl border dark:border-slate-800/80 border-slate-200 hover:border-sky-500/40 p-5 dark:bg-[#0d1424] bg-white space-y-4 transition-all flex flex-col justify-between shadow-sm">
                          <div>
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-1.5">
                                <span className="px-2.5 py-0.5 rounded-lg bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-500/20 text-xs font-bold font-heading">
                                  📄 Test {t.testNum}
                                </span>
                                <span className="px-2.5 py-0.5 rounded-lg dark:bg-slate-800/80 bg-slate-100 text-slate-700 dark:text-slate-300 text-xs font-bold font-heading border dark:border-slate-700 border-slate-200">
                                  Part 4
                                </span>
                              </div>
                              <span className="text-[10px] font-bold text-sky-600 dark:text-sky-400 bg-sky-500/10 px-1.5 py-0.5 rounded border border-sky-500/20 font-mono">
                                {dictationExercises.find(e => (e.topic === `Test ${t.testNum}` || e.title?.includes(`TEST ${t.testNum}`)) && e.part === 4)?.attemptsCount || (245 + (t.testNum * 23) % 240)} lượt
                              </span>
                            </div>
                            
                            <h4 className="font-heading font-extrabold text-lg dark:text-white text-slate-900 mt-4 flex items-center gap-2">
                              <Headphones className="w-4 h-4 text-sky-500 dark:text-sky-400" />
                              <span>{t.p4.count} câu</span>
                            </h4>
                          </div>

                          <div className="flex items-center justify-between pt-3 border-t dark:border-slate-800/80 border-slate-100">
                            <span className="text-xs font-mono">
                              {t.p4.completed > 0 ? (
                                <span className={t.p4.isCompleted ? "text-emerald-500 font-bold" : "text-sky-500 font-bold"}>
                                  {t.p4.isCompleted ? `✓ Hoàn thành (${t.p4.completed}/${t.p4.count})` : `${t.p4.completed}/${t.p4.count} câu`}
                                </span>
                              ) : (
                                <span className="dark:text-slate-400 text-slate-500">Chưa bắt đầu</span>
                              )}
                            </span>
                            <button
                              onClick={() => navigate(`/listen/dictation?year=${dictationYear}&test=${t.testNum}&part=4`)}
                              className="px-4 py-1.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-heading font-black text-xs shadow-md shadow-sky-500/20 transition-all flex items-center gap-1 active:scale-95 cursor-pointer"
                            >
                              <span>{t.p4.completed > 0 ? (t.p4.isCompleted ? 'Luyện lại' : 'Luyện tiếp') : 'Luyện tập'}</span>
                              <ArrowRight className="w-3 h-3" />
                            </button>
                          </div>
                        </div>

                      </div>
                    </VipLockOverlay>
                  );
                })}
              </div>
            )}


          </div>
        )}

      </main>

      {/* PRICING MODAL FOR PRO CONTENT */}
      <PricingModal
        isOpen={showPricingModal}
        onClose={() => setShowPricingModal(false)}
        onUpgradeSuccess={() => {
          setIsProUser(true);
          refreshProfile?.();
        }}
      />

      {/* Vocabulary Drawer */}
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

      {/* Confirm Reset Progress Modal */}
      {resetConfirmLvl && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
          <div className="w-full max-w-sm rounded-3xl dark:bg-slate-900 bg-white border dark:border-slate-800 border-slate-200 p-6 space-y-4 shadow-2xl text-center">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/10 text-rose-500 mx-auto flex items-center justify-center">
              <Trash2 className="w-6 h-6" />
            </div>
            <div className="space-y-1.5">
              <h3 className="font-heading font-extrabold text-base text-slate-900 dark:text-white">
                Xóa tiến độ bài nghe?
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Toàn bộ kết quả và câu đã trả lời của <span className="font-bold text-slate-700 dark:text-slate-200">{resetConfirmLvl.name}</span> sẽ được đặt lại từ đầu. Hành động này không thể hoàn tác.
              </p>
            </div>
            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setResetConfirmLvl(null)}
                className="flex-1 py-2.5 rounded-xl border dark:border-slate-800 border-slate-200 dark:text-slate-300 text-slate-700 text-xs font-bold hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                onClick={async () => {
                  if (resetConfirmLvl?.exerciseKey) {
                    await resetPracticeProgress(resetConfirmLvl.exerciseKey);
                    setPracticeProgressMap(prev => ({
                      ...prev,
                      [resetConfirmLvl.exerciseKey]: null
                    }));
                  }
                  setResetConfirmLvl(null);
                }}
                className="flex-1 py-2.5 rounded-xl bg-rose-500 hover:bg-rose-600 text-white text-xs font-bold shadow-lg shadow-rose-500/25 transition-all cursor-pointer"
              >
                Xóa tiến độ
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Personal Note Modal */}
      {activeNoteModal && (
        <PersonalNoteModal
          isOpen={Boolean(activeNoteModal)}
          onClose={() => setActiveNoteModal(null)}
          questionId={activeNoteModal.id}
          title={activeNoteModal.title}
        />
      )}
    </div>
  );
}
