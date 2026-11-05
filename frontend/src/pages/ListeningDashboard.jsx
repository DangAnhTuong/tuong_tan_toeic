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
import { DICTATION_CATALOG } from '../data/dictationCatalog';

export default function ListeningDashboard() {
  usePageTitle(
    'Luyện Nghe TOEIC Online - 8 Level & Nghe Chép Đậu TOEIC',
    'Chinh phục TOEIC Listening từ dễ đến khó. Nghe chép chính tả và luyện Part 1–4 theo 8 level, từ dưới 300 tới trên 900 điểm.'
  );

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
  // Single-row navigation matching Dau English:
  // Default is 'dictation' if no part is selected; otherwise '1', '2', '3', '4'
  const getInitialTab = () => {
    const curPart = searchParams.get('part');
    const curMode = searchParams.get('mode') || searchParams.get('tab');
    if (curMode === 'dictation') return 'dictation';
    if (curPart && ['1', '2', '3', '4'].includes(String(curPart))) return String(curPart);
    if (curMode && ['1', '2', '3', '4'].includes(String(curMode))) return String(curMode);
    return 'dictation';
  };

  const [activeTab, setActiveTab] = useState(getInitialTab);
  const [dictationYear, setDictationYear] = useState(searchParams.get('year') || '2026');

  // Active Part for Level & Subtype Practice (1, 2, 3, 4)
  const activePart = activeTab === 'dictation' ? 1 : Number(activeTab);

  // Keep state synced when user clicks browser Back / Forward buttons
  useEffect(() => {
    const curPart = searchParams.get('part');
    const curMode = searchParams.get('mode') || searchParams.get('tab');
    const curYear = searchParams.get('year') || '2026';

    if (curPart && ['1', '2', '3', '4'].includes(String(curPart))) {
      setActiveTab(String(curPart));
    } else if (curMode === 'dictation' || !curPart) {
      setActiveTab('dictation');
    }
    setDictationYear(curYear);
  }, [searchParams]);

  // Tab switch handlers that update URL matching Dau English exactly
  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    if (tabId === 'dictation') {
      setSearchParams({ mode: 'dictation', year: dictationYear }, { replace: true });
    } else {
      setSearchParams({ part: tabId }, { replace: true });
    }
  };

  const handleDictationYearChange = (newYear) => {
    setDictationYear(newYear);
    setSearchParams({ mode: 'dictation', year: newYear }, { replace: true });
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

  // Fetch listening exercises for active part to display real attemptsCount
  useEffect(() => {
    let isMounted = true;
    async function loadListeningExercises() {
      try {
        if (activeTab !== 'dictation') {
          const [lvlRes, topRes] = await Promise.all([
            axios.get(`/api/v1/listening/exercises?mode=level&part=${activePart}`),
            axios.get(`/api/v1/listening/exercises?mode=topic&part=${activePart}`)
          ]);
          if (isMounted) {
            if (lvlRes.data?.data) setLevelExercises(lvlRes.data.data);
            if (topRes.data?.data) setTopicExercises(topRes.data.data);
          }
        } else {
          const res = await axios.get(`/api/v1/listening/exercises?mode=dictation&part=1&year=${dictationYear}`);
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
  }, [activeTab, activePart, dictationYear]);

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
  }, [activePart, activeTab]);

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

  // --- SUBTYPE DATA (MATCHING DAU ENGLISH 100%) ---
  // Part 1: Theo dạng tranh (single, multi, scene, object) -> Total 450 (100% Đậu English)
  const part1Topics = [
    { title: 'Tranh một người', total: 176, isPro: false, key: 'single' },
    { title: 'Tranh nhiều người', total: 106, isPro: true, key: 'multi' },
    { title: 'Tranh tả cảnh', total: 37, isPro: false, key: 'scene' },
    { title: 'Tranh tả vật', total: 131, isPro: true, key: 'object' }
  ];

  // Part 2: Theo dạng câu hỏi (who, when, where, why, what, how, auxbe, modal, choice, tag, negative, statement) -> Total 1000 (Matches Đậu TOEIC 100%)
  const part2Topics = [
    { title: 'Câu hỏi Who', total: 78 },
    { title: 'Câu hỏi When', total: 102 },
    { title: 'Câu hỏi Where', total: 60 },
    { title: 'Câu hỏi Why', total: 83 },
    { title: 'Câu hỏi What / Which', total: 34 },
    { title: 'Câu hỏi How', total: 92 },
    { title: 'Câu hỏi Be/Do/Have', total: 101 },
    { title: 'Câu hỏi Modal verb', total: 99 },
    { title: 'Câu hỏi lựa chọn', total: 96 },
    { title: 'Câu hỏi đuôi', total: 65 },
    { title: 'Câu hỏi phủ định', total: 77 },
    { title: 'Câu khẳng định', total: 113 }
  ];

  // Part 3: Dạng đặc biệt (Có hình, 3 người, hàm ý) -> Total 741 (Matches Đậu TOEIC 100%)
  const part3Special = [
    { title: 'Có hình / bảng biểu', total: 351 },
    { title: 'Hội thoại 3 người nói', total: 264 },
    { title: 'Câu hỏi hàm ý người nói', total: 126 }
  ];

  const part3Topics = [
    { title: 'Lịch hẹn, cuộc họp & tiến độ công việc', total: 924 },
    { title: 'Nhà ở & dịch vụ đời sống', total: 612 },
    { title: 'Đơn hàng, kho bãi & giao nhận', total: 396 },
    { title: 'Mua sắm, cửa hàng & đổi trả', total: 330 },
    { title: 'Tàu xe & đi lại hằng ngày', total: 240 },
    { title: 'Nhà hàng & ăn uống', total: 210 },
    { title: 'Sân bay, khách sạn & du lịch', total: 120 },
    { title: 'Công nghệ, IT & website', total: 90 },
    { title: 'Marketing, bán hàng & khách hàng', total: 75 },
    { title: 'Sự cố, bảo trì & xây dựng', total: 72 },
    { title: 'Đào tạo & nhân viên mới', total: 60 },
    { title: 'Sự kiện, hội thảo & tiệc', total: 57 },
    { title: 'Kế toán, hoá đơn & ngân sách', total: 45 },
    { title: 'Tuyển dụng, lương & phúc lợi', total: 33 },
    { title: 'Y tế & dịch vụ công', total: 9 },
    { title: 'Chủ đề khác', total: 261 }
  ];

  // Part 4: Dạng đặc biệt (Có hình, hàm ý) -> Total 399 (Matches Đậu TOEIC 100%)
  const part4Special = [
    { title: 'Có hình / bảng biểu', total: 240 },
    { title: 'Câu hỏi hàm ý người nói', total: 159 }
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

  // --- DATA FOR 8 LEVEL CARDS (EXACT MATCH DAU TOEIC STANDARDIZED) ---
  const getLevelList = (part) => {
    const defaultData = {
      1: [
        { levelNum: 1, name: 'Level 1', scoreText: 'Dưới 300 điểm', attempts: 1895, total: 67, isPro: false },
        { levelNum: 2, name: 'Level 2', scoreText: '300–400 điểm', attempts: 1542, total: 31, isPro: true },
        { levelNum: 3, name: 'Level 3', scoreText: '400–500 điểm', attempts: 2326, total: 71, isPro: false },
        { levelNum: 4, name: 'Level 4', scoreText: '500–600 điểm', attempts: 1184, total: 72, isPro: false },
        { levelNum: 5, name: 'Level 5', scoreText: '600–700 điểm', attempts: 2890, total: 98, isPro: true },
        { levelNum: 6, name: 'Level 6', scoreText: '700–800 điểm', attempts: 1750, total: 70, isPro: false },
        { levelNum: 7, name: 'Level 7', scoreText: '800–900 điểm', attempts: 1320, total: 23, isPro: true },
        { levelNum: 8, name: 'Level 8', scoreText: 'Trên 900 điểm', attempts: 940, total: 18, isPro: false }
      ],
      2: [
        { levelNum: 1, name: 'Level 1', scoreText: 'Dưới 300 điểm', attempts: 2527, total: 175, isPro: false },
        { levelNum: 2, name: 'Level 2', scoreText: '300–400 điểm', attempts: 2133, total: 105, isPro: true },
        { levelNum: 3, name: 'Level 3', scoreText: '400–500 điểm', attempts: 3126, total: 187, isPro: false },
        { levelNum: 4, name: 'Level 4', scoreText: '500–600 điểm', attempts: 1347, total: 267, isPro: false },
        { levelNum: 5, name: 'Level 5', scoreText: '600–700 điểm', attempts: 2980, total: 409, isPro: true },
        { levelNum: 6, name: 'Level 6', scoreText: '700–800 điểm', attempts: 2210, total: 371, isPro: false },
        { levelNum: 7, name: 'Level 7', scoreText: '800–900 điểm', attempts: 1640, total: 241, isPro: true },
        { levelNum: 8, name: 'Level 8', scoreText: 'Trên 900 điểm', attempts: 1080, total: 120, isPro: false }
      ],
      3: [
        { levelNum: 1, name: 'Level 1', scoreText: 'Dưới 300 điểm', attempts: 1986, total: 87, isPro: false },
        { levelNum: 2, name: 'Level 2', scoreText: '300–400 điểm', attempts: 2052, total: 57, isPro: true },
        { levelNum: 3, name: 'Level 3', scoreText: '400–500 điểm', attempts: 2839, total: 285, isPro: false },
        { levelNum: 4, name: 'Level 4', scoreText: '500–600 điểm', attempts: 1125, total: 558, isPro: false },
        { levelNum: 5, name: 'Level 5', scoreText: '600–700 điểm', attempts: 3410, total: 741, isPro: true },
        { levelNum: 6, name: 'Level 6', scoreText: '700–800 điểm', attempts: 2950, total: 729, isPro: false },
        { levelNum: 7, name: 'Level 7', scoreText: '800–900 điểm', attempts: 1870, total: 360, isPro: true },
        { levelNum: 8, name: 'Level 8', scoreText: 'Trên 900 điểm', attempts: 1190, total: 108, isPro: false }
      ],
      4: [
        { levelNum: 1, name: 'Level 1', scoreText: 'Dưới 300 điểm', attempts: 1792, total: 36, isPro: false },
        { levelNum: 2, name: 'Level 2', scoreText: '300–400 điểm', attempts: 1814, total: 27, isPro: true },
        { levelNum: 3, name: 'Level 3', scoreText: '400–500 điểm', attempts: 2229, total: 156, isPro: false },
        { levelNum: 4, name: 'Level 4', scoreText: '500–600 điểm', attempts: 909, total: 366, isPro: false },
        { levelNum: 5, name: 'Level 5', scoreText: '600–700 điểm', attempts: 3120, total: 519, isPro: true },
        { levelNum: 6, name: 'Level 6', scoreText: '700–800 điểm', attempts: 2780, total: 588, isPro: false },
        { levelNum: 7, name: 'Level 7', scoreText: '800–900 điểm', attempts: 1940, total: 405, isPro: true },
        { levelNum: 8, name: 'Level 8', scoreText: 'Trên 900 điểm', attempts: 1250, total: 153, isPro: false }
      ]
    };

    const base = defaultData[part] || defaultData[1];
    return base.map(item => {
      const match = levelExercises.find(e => Number(e.part) === Number(part) && Number(e.level) === Number(item.levelNum));
      const attCount = match?.attemptsCount ?? item.attempts;
      const totCount = match?.totalQuestions || item.total;
      return {
        ...item,
        total: totCount,
        attempts: `${attCount} lượt làm`
      };
    });
  };

  const levelList = getLevelList(activePart);

  // --- DATA FOR DICTATION (AUTHENTIC 11 TABS & EXACT TEST COUNTS MATCHING DAU TOEIC 100%) ---
  const getCurrentUserId = () => {
    const user = getStoredUser();
    return user?.userId || user?._id || user?.id || user?.email || 'guest';
  };

  const getDictationProgress = (year, part, testOrTopic, totalCount) => {
    const stdKey = `dictation_p${part}_${year}_${testOrTopic}`;
    const altKey = `dictation_p${part}_${year}_test${testOrTopic}`;
    
    let progress = practiceProgressMap[stdKey] || practiceProgressMap[altKey];
    
    // Fallback: check localStorage mirror
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
    const yearCatalog = DICTATION_CATALOG[dictationYear] || DICTATION_CATALOG['2026'] || {};
    const testCount = dictationYear === '2021' ? 5 : 10;

    return Array.from({ length: testCount }, (_, i) => {
      const testNum = i + 1;
      const testData = yearCatalog[`Test ${testNum}`] || {};
      const p1Count = testData.p1 || 24;
      const p2Count = testData.p2 || 100;
      const p3Count = testData.p3 || 140;
      const p4Count = testData.p4 || 100;

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

  return (
    <div className="min-h-screen dark:bg-[#0b1120] bg-[#f8fafc] dark:text-slate-100 text-slate-900 flex flex-col font-sans pb-16 transition-colors duration-200">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* HERO BANNER: CHINH PHỤC TOEIC LISTENING (MATCHING DAU ENGLISH 100%) */}
        <div className="relative overflow-hidden rounded-3xl glass-panel border dark:border-slate-800 border-slate-200 p-8 md:p-10 dark:bg-gradient-to-r dark:from-purple-950/40 dark:via-[#0f172a] dark:to-[#0b1120] bg-gradient-to-r from-purple-50 via-white to-indigo-50/60 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl dark:shadow-2xl">
          <div className="space-y-3 text-center md:text-left">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full dark:bg-purple-500/10 bg-purple-100 border dark:border-purple-500/30 border-purple-300 text-purple-700 dark:text-purple-400 text-xs font-bold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Luyện nghe TOEIC</span>
            </div>
            <h1 className="text-3xl md:text-5xl font-extrabold font-heading dark:text-white text-slate-900 tracking-tight leading-tight">
              Chinh phục <span className="bg-gradient-to-r from-purple-600 via-pink-500 to-cyan-500 dark:from-purple-400 dark:via-pink-300 dark:to-cyan-300 bg-clip-text text-transparent">TOEIC Listening</span> từ dễ đến khó
            </h1>
            <p className="dark:text-slate-400 text-slate-600 text-sm md:text-base">
              Nghe chép chính tả và luyện Part 1–4 theo 8 level, từ dưới 300 tới trên 900 điểm.
            </p>
          </div>

          <div className="w-24 h-24 md:w-28 md:h-28 rounded-3xl bg-gradient-to-tr from-purple-600 to-indigo-500 p-0.5 shadow-2xl shadow-purple-500/30 flex items-center justify-center shrink-0">
            <div className="w-full h-full dark:bg-slate-950 bg-white rounded-[22px] flex items-center justify-center">
              <Headphones className="w-12 h-12 text-purple-500 dark:text-purple-400 animate-float" />
            </div>
          </div>
        </div>

        {/* SINGLE-ROW PILL NAVIGATION TABS (MATCHING DAU ENGLISH 100%) */}
        <div className="flex items-center gap-2 border-b dark:border-slate-800 border-slate-200 pb-3 overflow-x-auto">
          {[
            { id: 'dictation', label: 'Nghe chép' },
            { id: '1', label: 'Part 1' },
            { id: '2', label: 'Part 2' },
            { id: '3', label: 'Part 3' },
            { id: '4', label: 'Part 4' }
          ].map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id)}
                className={`px-6 py-2 rounded-full text-sm font-bold transition-all shrink-0 cursor-pointer ${
                  isActive
                    ? 'bg-purple-600 text-white shadow-md shadow-purple-600/25'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* ========================================================================= */}
        {/* MODE: PART 1, 2, 3, 4 (8 LEVEL CARDS + SUBTYPE TOPIC BREAKDOWN) */}
        {/* ========================================================================= */}
        {activeTab !== 'dictation' && (
          <div className="space-y-10 animate-fadeIn">
            
            {/* Header tip and dropdown for Part 1 matching Đậu TOEIC */}
            {activePart === 1 && (
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-xs text-sky-500 dark:text-sky-400 font-medium">
                  <span className="text-slate-400">Mẹo:</span>
                  <a href="#tips" onClick={(e) => { e.preventDefault(); }} className="hover:underline flex items-center gap-1">
                    Mẹo làm Part 1: 6 bẫy hay gặp →
                  </a>
                </div>
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-slate-900/60 border border-slate-800 text-xs font-bold text-slate-300">
                  <span>Tất cả dạng tranh (450)</span>
                </div>
              </div>
            )}

            {/* 1. 8 LEVEL CARDS GRID */}
            <div className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
                {levelList.map((lvl) => {
                  const isLocked = !isProUser && lvl.isPro;
                  const exKey = `listening_p${activePart}_lv${lvl.levelNum}`;
                  const progress = practiceProgressMap[exKey];
                  const completed = progress?.completedCount || 0;
                  const correct = progress?.correctCount || 0;
                  const wrong = progress?.wrongCount || 0;
                  const total = lvl.total;

                  return (
                    <VipLockOverlay
                      key={lvl.levelNum}
                      isLocked={isLocked}
                      onUnlockClick={() => setShowPricingModal(true)}
                      label={`Level ${lvl.levelNum} (VIP)`}
                    >
                      <div 
                        className="rounded-3xl dark:bg-slate-900/60 bg-white border dark:border-slate-800 border-slate-200 p-5 space-y-4 flex flex-col justify-between hover:border-purple-500/50 dark:hover:border-purple-500/50 hover:shadow-xl shadow-sm transition-all"
                      >
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <div>
                              <h3 className="font-heading font-extrabold text-sm sm:text-base text-slate-900 dark:text-white">
                                {lvl.name}
                              </h3>
                              <p className="text-xs text-slate-400 dark:text-slate-500 font-medium">
                                {lvl.scoreText}
                              </p>
                            </div>
                            {lvl.isPro && (
                              <span className="px-2 py-0.5 rounded-md bg-amber-500 text-slate-950 font-black text-[9px] uppercase tracking-wider flex items-center gap-1 shadow-sm">
                                <Crown className="w-2.5 h-2.5" /> PRO
                              </span>
                            )}
                          </div>

                          {/* Question Counts & Progress Stat Row matching Dau TOEIC */}
                          <div className="py-1">
                            {completed > 0 ? (
                              <div className="flex items-center gap-3 text-xs font-bold font-mono">
                                <span className="font-extrabold text-emerald-600 dark:text-emerald-400">
                                  {completed}/{total}
                                </span>
                                <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-bold">
                                  <CheckCircle2 className="w-3.5 h-3.5" /> {correct}
                                </span>
                                <span className="flex items-center gap-1 text-rose-500 font-bold">
                                  <XCircle className="w-3.5 h-3.5" /> {wrong}
                                </span>
                              </div>
                            ) : (
                              <div className="text-xs text-slate-400 dark:text-slate-500 font-medium">
                                Chưa luyện tập · {total} câu
                              </div>
                            )}
                          </div>

                          {/* Action Buttons Row matching Dau TOEIC */}
                          <div className="flex items-center justify-between gap-2 pt-3 border-t dark:border-slate-800/80 border-slate-100 mt-auto">
                            {/* Capsule 4 nút thao tác */}
                            <div className="flex items-center gap-0.5 p-0.5 sm:p-1 rounded-xl bg-slate-100 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700/60 shrink-0">
                              <button
                                onClick={() => setShowVocabDrawer(true)}
                                className="p-1.5 rounded-lg hover:bg-white dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 hover:text-purple-500 transition-colors cursor-pointer"
                                title="Giỏ từ vựng"
                              >
                                <ShoppingBag className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => setActiveNoteModal({ id: exKey, title: `Part ${activePart} Level ${lvl.levelNum}` })}
                                className="p-1.5 rounded-lg hover:bg-white dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 hover:text-amber-500 transition-colors cursor-pointer"
                                title="Ghi chú cá nhân"
                              >
                                <FileText className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => setResetConfirmLvl({ name: `Part ${activePart} Level ${lvl.levelNum}`, exerciseKey: exKey })}
                                className="p-1.5 rounded-lg hover:bg-white dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 hover:text-rose-500 transition-colors cursor-pointer"
                                title="Làm lại từ đầu"
                              >
                                <RotateCcw className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => { if (basketWords.length > 0) setShowVocabDrawer(true); }}
                                className="p-1.5 rounded-lg hover:bg-white dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 hover:text-rose-500 transition-colors cursor-pointer"
                                title="Xóa từ khỏi giỏ"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>

                            {/* Học ngay Button */}
                            <button
                              onClick={() => navigate(`/listen/level-practice?part=${activePart}&level=${lvl.levelNum}`)}
                              className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-heading font-extrabold text-xs shadow-md shadow-emerald-500/20 transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
                            >
                              <BookOpen className="w-3.5 h-3.5" />
                              <span>{completed > 0 ? 'Luyện tiếp' : 'Học ngay'}</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    </VipLockOverlay>
                  );
                })}
              </div>
            </div>

            {/* 2. SUBTYPE / TOPIC BREAKDOWN SECTION (MATCHING DAU ENGLISH DIRECTLY BELOW LEVEL CARDS) */}
            
            {/* PART 1: THEO DẠNG TRANH */}
            {activePart === 1 && (
              <div className="space-y-4 pt-2">
                <div className="space-y-1">
                  <h3 className="text-base font-bold dark:text-white text-slate-900">Theo dạng tranh</h3>
                  <p className="text-xs dark:text-slate-400 text-slate-600">
                    Cùng bộ câu ở trên, chia theo bức tranh mô tả gì. Mỗi câu thuộc đúng một dạng.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {part1Topics.map((item, idx) => {
                    const match = topicExercises.find(e => e.topic === item.title || e.title === item.title);
                    const totalCount = match?.totalQuestions || item.total;
                    const isLocked = !isProUser && idx > 0;
                    const exKey = `listening_p1_topic_${encodeURIComponent(item.title)}`;
                    const progress = practiceProgressMap[exKey];
                    const completed = progress?.completedCount || 0;
                    const correct = progress?.correctCount || 0;
                    const wrong = progress?.wrongCount || 0;

                    return (
                      <VipLockOverlay
                        key={idx}
                        isLocked={isLocked}
                        onUnlockClick={() => setShowPricingModal(true)}
                        label="VIP"
                      >
                        <div className="rounded-2xl border dark:border-slate-800 border-slate-200 hover:border-purple-500/40 p-4 dark:bg-slate-900/60 bg-white space-y-3 transition-all flex flex-col justify-between shadow-sm">
                          <div className="space-y-1.5">
                            <div className="flex items-center justify-between gap-1.5">
                              <h4 className="font-heading font-extrabold text-sm dark:text-white text-slate-900 line-clamp-1">{item.title}</h4>
                              <span className="text-[10px] font-bold text-purple-600 dark:text-purple-400 bg-purple-500/10 px-1.5 py-0.5 rounded border border-purple-500/20 font-mono shrink-0">
                                {getTopicAttempts(item.title, 240 + (idx * 29) % 320)} lượt
                              </span>
                            </div>
                            
                            <div className="py-0.5">
                              {completed > 0 ? (
                                <div className="flex items-center gap-2 text-xs font-bold font-mono">
                                  <span className="font-extrabold text-emerald-600 dark:text-emerald-400">{completed}/{totalCount}</span>
                                  <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-bold"><CheckCircle2 className="w-3 h-3" /> {correct}</span>
                                  <span className="flex items-center gap-1 text-rose-500 font-bold"><XCircle className="w-3 h-3" /> {wrong}</span>
                                </div>
                              ) : (
                                <span className="text-xs dark:text-slate-400 text-slate-500 block">Chưa luyện tập · {totalCount} câu</span>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center justify-between pt-3 border-t dark:border-slate-800/60 border-slate-100">
                            <div className="flex items-center gap-0.5 p-0.5 rounded-lg bg-slate-100 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700/60 text-slate-400">
                              <button onClick={() => window.print()} className="p-1 rounded-md hover:bg-slate-200 dark:hover:bg-slate-700 hover:text-slate-700 dark:hover:text-slate-200 cursor-pointer" title="In đề"><Printer className="w-3 h-3" /></button>
                              <button onClick={() => setActiveNoteModal({ id: exKey, title: item.title })} className="p-1 rounded-md hover:bg-slate-200 dark:hover:bg-slate-700 hover:text-amber-500 cursor-pointer" title="Ghi chú cá nhân"><FileText className="w-3 h-3" /></button>
                              <button onClick={() => setResetConfirmLvl({ name: item.title, exerciseKey: exKey })} className="p-1 rounded-md hover:bg-slate-200 dark:hover:bg-slate-700 hover:text-rose-500 cursor-pointer" title="Làm lại từ đầu"><RotateCcw className="w-3 h-3" /></button>
                            </div>

                            <button
                              onClick={() => navigate(`/listen/level-practice?part=1&mode=topic&topic=${encodeURIComponent(item.title)}`)}
                              className="px-3.5 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-heading font-extrabold text-xs shadow-md shadow-emerald-500/20 transition-all flex items-center gap-1 cursor-pointer whitespace-nowrap"
                            >
                              <BookOpen className="w-3 h-3" />
                              <span>{completed > 0 ? 'Luyện tiếp' : 'Học ngay'}</span>
                            </button>
                          </div>
                        </div>
                      </VipLockOverlay>
                    );
                  })}
                </div>
              </div>
            )}

            {/* PART 2: THEO DẠNG CÂU HỎI */}
            {activePart === 2 && (
              <div className="space-y-4 pt-2">
                <div className="space-y-1">
                  <h3 className="text-base font-bold dark:text-white text-slate-900">Theo dạng câu hỏi</h3>
                  <p className="text-xs dark:text-slate-400 text-slate-600">
                    Cùng bộ câu ở trên, chia theo dạng câu hỏi đầu tiên bạn nghe. Mỗi câu thuộc đúng một dạng.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {part2Topics.map((item, idx) => {
                    const isLocked = false;
                    const exKey = `listening_p2_topic_${encodeURIComponent(item.title)}`;
                    const progress = practiceProgressMap[exKey];
                    const completed = progress?.completedCount || 0;
                    const correct = progress?.correctCount || 0;
                    const wrong = progress?.wrongCount || 0;
                    const topicMatch = topicExercises.find(e => e.topic === item.title || e.title === item.title);
                    const totalCount = topicMatch?.totalQuestions || item.total;

                    return (
                      <VipLockOverlay
                        key={idx}
                        isLocked={isLocked}
                        onUnlockClick={() => setShowPricingModal(true)}
                        label="VIP"
                      >
                        <div className="rounded-2xl border dark:border-slate-800 border-slate-200 hover:border-purple-500/40 p-4 dark:bg-slate-900/60 bg-white space-y-3 transition-all flex flex-col justify-between shadow-sm">
                          <div className="space-y-1.5">
                            <div className="flex items-center justify-between gap-1.5">
                              <h4 className="font-heading font-extrabold text-sm dark:text-white text-slate-900 line-clamp-1">{item.title}</h4>
                              <span className="text-[10px] font-bold text-purple-600 dark:text-purple-400 bg-purple-500/10 px-1.5 py-0.2 rounded border border-purple-500/20 font-mono shrink-0">
                                {getTopicAttempts(item.title, 190 + (idx * 21) % 290)} lượt
                              </span>
                            </div>

                            <div className="py-0.5">
                              {completed > 0 ? (
                                <div className="flex items-center gap-2 text-xs font-bold font-mono">
                                  <span className="font-extrabold text-emerald-600 dark:text-emerald-400">{completed}/{totalCount}</span>
                                  <span className="text-emerald-600 dark:text-emerald-400 font-bold text-[11px]">✓ {correct}</span>
                                  <span className="text-rose-500 font-bold text-[11px]">✗ {wrong}</span>
                                </div>
                              ) : (
                                <span className="text-[11px] dark:text-slate-400 text-slate-500 block">Chưa luyện tập · {totalCount} câu</span>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center justify-between pt-2 border-t dark:border-slate-800/60 border-slate-100">
                            <div className="flex items-center gap-0.5 p-0.5 rounded-lg bg-slate-100 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700/60 text-slate-400">
                              <button onClick={() => window.print()} className="p-1 rounded-md hover:bg-slate-200 dark:hover:bg-slate-700 hover:text-slate-700 dark:hover:text-slate-200" title="In đề"><Printer className="w-3 h-3" /></button>
                              <button onClick={() => setActiveNoteModal({ id: exKey, title: item.title })} className="p-1 rounded-md hover:bg-slate-200 dark:hover:bg-slate-700 hover:text-amber-500" title="Ghi chú cá nhân"><FileText className="w-3 h-3" /></button>
                              <button onClick={() => setResetConfirmLvl({ name: item.title, exerciseKey: exKey })} className="p-1 rounded-md hover:bg-slate-200 dark:hover:bg-slate-700 hover:text-rose-500" title="Làm lại từ đầu"><RotateCcw className="w-3 h-3" /></button>
                            </div>

                            <button
                              onClick={() => navigate(`/listen/level-practice?part=2&mode=topic&topic=${encodeURIComponent(item.title)}`)}
                              className="px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-[11px] transition-all flex items-center gap-1 shadow-sm cursor-pointer whitespace-nowrap"
                            >
                              <BookOpen className="w-3 h-3" />
                              <span>{completed > 0 ? 'Luyện tiếp' : 'Học ngay'}</span>
                            </button>
                          </div>
                        </div>
                      </VipLockOverlay>
                    );
                  })}
                </div>
              </div>
            )}

            {/* PART 3: DẠNG ĐẶC BIỆT (MATCHES ĐẬU TOEIC 100% - KHÔNG CÓ THEO CHỦ ĐỀ) */}
            {activePart === 3 && (
              <div className="space-y-8 pt-2">
                {/* Dạng đặc biệt */}
                <div className="space-y-3">
                  <div className="space-y-1">
                    <h3 className="text-base font-bold text-amber-500 dark:text-amber-400">Dạng đặc biệt</h3>
                    <p className="text-xs dark:text-slate-400 text-slate-600">
                      Luyện riêng các dạng khó của Part 3, lấy từ bộ câu ở trên. Mỗi nhóm chỉ nằm ở một thẻ.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {part3Special.map((item, idx) => {
                      const topicMatch = topicExercises.find(e => Number(e.part) === 3 && (e.topic === item.title || e.title === item.title));
                      const totalCount = topicMatch?.totalQuestions || item.total;
                      const exKey = `listening_p3_topic_${encodeURIComponent(item.title)}`;
                      const progress = practiceProgressMap[exKey];
                      const completed = progress?.completedCount || 0;
                      const correct = progress?.correctCount || 0;
                      const wrong = progress?.wrongCount || 0;

                      return (
                        <div
                          key={idx}
                          className="rounded-2xl border dark:border-slate-800 border-slate-200 hover:border-amber-500/40 p-5 dark:bg-slate-900/60 bg-white space-y-3 transition-all flex flex-col justify-between shadow-sm"
                        >
                          <div className="space-y-1.5">
                            <div className="flex items-center justify-between gap-2">
                              <h4 className="font-heading font-extrabold text-sm dark:text-white text-slate-900">{item.title}</h4>
                              <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20 font-mono shrink-0">
                                sau 1 lượt
                              </span>
                            </div>
                            <div className="py-0.5">
                              {completed > 0 ? (
                                <div className="flex items-center gap-2 text-xs font-bold font-mono">
                                  <span className="font-extrabold text-emerald-600 dark:text-emerald-400">{completed}/{totalCount}</span>
                                  <span className="text-emerald-600 dark:text-emerald-400 font-bold text-[11px]">✓ {correct}</span>
                                  <span className="text-rose-500 font-bold text-[11px]">✗ {wrong}</span>
                                </div>
                              ) : (
                                <span className="text-[11px] dark:text-slate-400 text-slate-500 block">Chưa luyện tập · {totalCount} câu</span>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center justify-between pt-2 border-t dark:border-slate-800/60 border-slate-100">
                            <div className="flex items-center gap-0.5 p-0.5 rounded-lg bg-slate-100 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700/60 text-slate-400">
                              <button onClick={() => window.print()} className="p-1 rounded-md hover:bg-slate-200 dark:hover:bg-slate-700 hover:text-slate-700 dark:hover:text-slate-200" title="In đề"><Printer className="w-3 h-3" /></button>
                              <button onClick={() => setActiveNoteModal({ id: exKey, title: item.title })} className="p-1 rounded-md hover:bg-slate-200 dark:hover:bg-slate-700 hover:text-amber-500" title="Ghi chú cá nhân"><FileText className="w-3 h-3" /></button>
                              <button onClick={() => setResetConfirmLvl({ name: item.title, exerciseKey: exKey })} className="p-1 rounded-md hover:bg-slate-200 dark:hover:bg-slate-700 hover:text-rose-500" title="Làm lại từ đầu"><RotateCcw className="w-3 h-3" /></button>
                            </div>

                            <button
                              onClick={() => navigate(`/listen/level-practice?part=3&mode=topic&topic=${encodeURIComponent(item.title)}`)}
                              className="px-3.5 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-md shadow-emerald-500/20 transition-all flex items-center gap-1 cursor-pointer whitespace-nowrap"
                            >
                              <BookOpen className="w-3 h-3" />
                              <span>{completed > 0 ? 'Luyện tiếp' : 'Học ngay'}</span>
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* PART 4: DẠNG ĐẶC BIỆT (MATCHES ĐẬU TOEIC 100% - KHÔNG CÓ THEO DẠNG BÀI NÓI) */}
            {activePart === 4 && (
              <div className="space-y-8 pt-2">
                {/* Dạng đặc biệt */}
                <div className="space-y-3">
                  <div className="space-y-1">
                    <h3 className="text-base font-bold text-amber-500 dark:text-amber-400">Dạng đặc biệt</h3>
                    <p className="text-xs dark:text-slate-400 text-slate-600">
                      Luyện riêng các dạng khó của Part 4, lấy từ bộ câu ở trên. Mỗi nhóm chỉ nằm ở một thẻ.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {part4Special.map((item, idx) => {
                      const topicMatch = topicExercises.find(e => Number(e.part) === 4 && (e.topic === item.title || e.title === item.title));
                      const totalCount = topicMatch?.totalQuestions || item.total;
                      const exKey = `listening_p4_topic_${encodeURIComponent(item.title)}`;
                      const progress = practiceProgressMap[exKey];
                      const completed = progress?.completedCount || 0;
                      const correct = progress?.correctCount || 0;
                      const wrong = progress?.wrongCount || 0;

                      return (
                        <div
                          key={idx}
                          className="rounded-2xl border dark:border-slate-800 border-slate-200 hover:border-amber-500/40 p-5 dark:bg-slate-900/60 bg-white space-y-3 transition-all flex flex-col justify-between shadow-sm"
                        >
                          <div className="space-y-1.5">
                            <div className="flex items-center justify-between gap-2">
                              <h4 className="font-heading font-extrabold text-sm dark:text-white text-slate-900">{item.title}</h4>
                            </div>
                            <div className="py-0.5">
                              {completed > 0 ? (
                                <div className="flex items-center gap-2 text-xs font-bold font-mono">
                                  <span className="font-extrabold text-emerald-600 dark:text-emerald-400">{completed}/{totalCount}</span>
                                  <span className="text-emerald-600 dark:text-emerald-400 font-bold text-[11px]">✓ {correct}</span>
                                  <span className="text-rose-500 font-bold text-[11px]">✗ {wrong}</span>
                                </div>
                              ) : (
                                <span className="text-[11px] dark:text-slate-400 text-slate-500 block">Chưa luyện tập · {totalCount} câu</span>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center justify-between pt-2 border-t dark:border-slate-800/60 border-slate-100">
                            <div className="flex items-center gap-0.5 p-0.5 rounded-lg bg-slate-100 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700/60 text-slate-400">
                              <button onClick={() => window.print()} className="p-1 rounded-md hover:bg-slate-200 dark:hover:bg-slate-700 hover:text-slate-700 dark:hover:text-slate-200" title="In đề"><Printer className="w-3 h-3" /></button>
                              <button onClick={() => setActiveNoteModal({ id: exKey, title: item.title })} className="p-1 rounded-md hover:bg-slate-200 dark:hover:bg-slate-700 hover:text-amber-500" title="Ghi chú cá nhân"><FileText className="w-3 h-3" /></button>
                              <button onClick={() => setResetConfirmLvl({ name: item.title, exerciseKey: exKey })} className="p-1 rounded-md hover:bg-slate-200 dark:hover:bg-slate-700 hover:text-rose-500" title="Làm lại từ đầu"><RotateCcw className="w-3 h-3" /></button>
                            </div>

                            <button
                              onClick={() => navigate(`/listen/level-practice?part=4&mode=topic&topic=${encodeURIComponent(item.title)}`)}
                              className="px-3.5 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-md shadow-emerald-500/20 transition-all flex items-center gap-1 cursor-pointer whitespace-nowrap"
                            >
                              <BookOpen className="w-3 h-3" />
                              <span>{completed > 0 ? 'Luyện tiếp' : 'Học ngay'}</span>
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

          </div>
        )}

        {/* ========================================================================= */}
        {/* MODE: NGHE CHÉP CHÍNH TẢ (DICTATION ETS 10 TESTS & TOPICS) */}
        {/* ========================================================================= */}
        {activeTab === 'dictation' && (
          <div className="space-y-8 animate-fadeIn">
            
            {/* TIP GUIDE MATCHING DAU TOEIC */}
            <div className="flex items-center gap-2 text-xs text-sky-500 dark:text-sky-400 font-medium">
              <span className="text-slate-400">Mẹo:</span>
              <a href="#dictation-guide" onClick={(e) => { e.preventDefault(); }} className="hover:underline flex items-center gap-1">
                Nghe chép chính tả đúng cách →
              </a>
            </div>

            {/* SUB-TABS: 11 YEAR / CATEGORY FILTERS MATCHING DAU TOEIC 100% */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1">
              {[
                { id: 'crack1', label: 'Crack Vol 1' },
                { id: 'crack2', label: 'Crack Vol 2' },
                { id: '2026', label: '2026' },
                { id: '2024', label: '2024' },
                { id: '2023', label: '2023' },
                { id: '2022', label: '2022' },
                { id: '2021', label: '2021' },
                { id: '2020', label: '2020' },
                { id: '2019', label: '2019' },
                { id: 'master', label: 'TOEIC MASTER' },
                { id: 'topic', label: 'Theo chủ đề' },
                { id: 'review', label: 'Câu cần luyện lại', icon: '🔖' }
              ].map((f) => {
                const isActive = dictationYear === f.id;
                const isReview = f.id === 'review';
                return (
                  <button
                    key={f.id}
                    onClick={() => handleDictationYearChange(f.id)}
                    className={`px-4 py-2 rounded-full text-xs font-heading font-extrabold transition-all flex items-center gap-1.5 shrink-0 cursor-pointer ${
                      isActive
                        ? (isReview ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/30' : 'bg-[#0284c7] text-white shadow-md shadow-sky-600/30')
                        : (isReview
                            ? 'dark:bg-amber-500/10 bg-amber-50 border border-amber-500/40 text-amber-500 dark:text-amber-400 hover:bg-amber-500/20'
                            : 'dark:bg-[#0f172a] bg-white border dark:border-slate-800 border-slate-200 dark:text-slate-400 text-slate-600 hover:text-sky-500 dark:hover:text-white shadow-sm')
                    }`}
                  >
                    {f.icon && <span>{f.icon}</span>}
                    <span>{f.label}</span>
                  </button>
                );
              })}
            </div>

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
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="px-3.5 py-1.5 rounded-xl bg-purple-500/10 text-purple-400 font-heading font-extrabold text-xs border border-purple-500/20 flex items-center gap-1.5">
                      <span>PART 4 — 8 BÀI NÓI & BẢN TIN CHUYÊN ĐỀ</span>
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {[
                      { title: 'Corporate Volunteer Day Announcement', subTitle: 'Thông báo ngày hoạt động tình nguyện công ty', badge: 'B1', count: 10 },
                      { title: 'Annual Energy Summit Opening Remarks', subTitle: 'Phát biểu khai mạc hội nghị năng lượng thường niên', badge: 'B2', count: 9 },
                      { title: 'Public Transit Delay Broadcast', subTitle: 'Bản tin phát thanh hoãn chuyến tàu công cộng', badge: 'B1', count: 10 },
                      { title: 'Warehouse Operations Safety Guidelines', subTitle: 'Quy tắc an toàn vận hành kho hàng', badge: 'B1', count: 11 },
                      { title: 'Guided Tour of Eco-Friendly Architecture', subTitle: 'Hướng dẫn tham quan công trình kiến trúc xanh', badge: 'B2', count: 9 },
                      { title: 'Airport Terminal Gate Change Broadcast', subTitle: 'Thông báo thay đổi cửa khởi hành sân bay', badge: 'A2', count: 10 },
                      { title: 'Museum Exhibit Preview for Press', subTitle: 'Buổi giới thiệu triển lãm bảo tàng cho báo chí', badge: 'B2', count: 9 },
                      { title: 'Voicemail: Rescheduling Dental Appointment', subTitle: 'Tin nhắn thoại: Dời lịch hẹn khám răng', badge: 'A2', count: 9 }
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
                                  <span className="px-2.5 py-0.5 rounded-lg dark:bg-slate-800/80 bg-slate-100 text-purple-700 dark:text-purple-300 font-mono text-xs font-bold border dark:border-slate-700 border-slate-200">
                                    {item.badge}
                                  </span>
                                </div>
                                <span className="text-[10px] font-bold text-sky-600 dark:text-sky-400 bg-sky-500/10 px-1.5 py-0.5 rounded border border-sky-500/20 font-mono">
                                  {dictationExercises.find(e => e.topic === item.title)?.attemptsCount || (240 + (idx * 21) % 270)} lượt
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

            {/* 2. REVIEW MODE: 🔖 CÂU CẦN LUYỆN LẠI */}
            {dictationYear === 'review' && (
              <div className="rounded-3xl border dark:border-slate-800 border-slate-200 dark:bg-slate-900/60 bg-white p-8 text-center space-y-4">
                <div className="w-16 h-16 rounded-2xl bg-amber-500/10 text-amber-500 mx-auto flex items-center justify-center">
                  <Bookmark className="w-8 h-8" />
                </div>
                <div className="max-w-md mx-auto space-y-2">
                  <h3 className="font-heading font-extrabold text-lg text-slate-900 dark:text-white">
                    Sổ tay câu sai & Đánh dấu luyện lại
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                    Hệ thống lưu tự động các câu bạn viết sai hoặc bấm bookmark trong quá trình nghe chép để bạn nghe lại và kiểm tra chính tả.
                  </p>
                </div>
                <button
                  onClick={() => navigate('/mistakes')}
                  className="px-6 py-2.5 rounded-full bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-lg shadow-purple-600/25 transition-all inline-flex items-center gap-2 cursor-pointer"
                >
                  <Bookmark className="w-4 h-4" />
                  <span>Mở sổ tay câu sai & Đánh dấu</span>
                </button>
              </div>
            )}

            {/* 3. TEST MODES: 11 COLLECTIONS (CRACK 1/2, 2026-2019, MASTER) */}
            {dictationYear !== 'topic' && dictationYear !== 'review' && (
              <div className="space-y-8">
                {dictationTests.map((t) => {
                  const isLocked = !isProUser && t.testNum > 2;

                  return (
                    <VipLockOverlay
                      key={t.testNum}
                      isLocked={isLocked}
                      onUnlockClick={() => setShowPricingModal(true)}
                      label="VIP"
                    >
                      <div className="space-y-3">
                        {/* Test Section Header matching Đậu TOEIC: | Test X */}
                        <div className="flex items-center gap-2 font-heading font-extrabold text-base text-sky-500 dark:text-sky-400">
                          <span className="w-1.5 h-4 bg-sky-500 rounded-full inline-block"></span>
                          <span className="dark:text-white text-slate-900">Test {t.testNum}</span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                          
                          {/* Part 1 */}
                          <div className="rounded-2xl border dark:border-slate-800/80 border-slate-200 hover:border-sky-500/40 p-5 dark:bg-[#0d1424] bg-white space-y-4 transition-all flex flex-col justify-between shadow-sm">
                            <div>
                              <div className="flex items-center justify-between">
                                <span className="px-2.5 py-0.5 rounded-lg dark:bg-slate-800/80 bg-slate-100 text-slate-700 dark:text-slate-300 text-xs font-bold font-heading border dark:border-slate-700 border-slate-200">
                                  Part 1
                                </span>
                                <div className="flex items-center gap-1.5 text-xs text-slate-400 font-mono">
                                  <Bookmark className="w-3.5 h-3.5" />
                                  <span>0</span>
                                </div>
                              </div>
                              
                              <h4 className="font-heading font-extrabold text-base dark:text-white text-slate-900 mt-4 flex items-center gap-2">
                                <Headphones className="w-4 h-4 text-sky-400" />
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
                                <span className="px-2.5 py-0.5 rounded-lg dark:bg-slate-800/80 bg-slate-100 text-slate-700 dark:text-slate-300 text-xs font-bold font-heading border dark:border-slate-700 border-slate-200">
                                  Part 2
                                </span>
                                <div className="flex items-center gap-1.5 text-xs text-slate-400 font-mono">
                                  <Bookmark className="w-3.5 h-3.5" />
                                  <span>0</span>
                                </div>
                              </div>
                              
                              <h4 className="font-heading font-extrabold text-base dark:text-white text-slate-900 mt-4 flex items-center gap-2">
                                <Headphones className="w-4 h-4 text-sky-400" />
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
                                <span className="px-2.5 py-0.5 rounded-lg dark:bg-slate-800/80 bg-slate-100 text-slate-700 dark:text-slate-300 text-xs font-bold font-heading border dark:border-slate-700 border-slate-200">
                                  Part 3
                                </span>
                                <div className="flex items-center gap-1.5 text-xs text-slate-400 font-mono">
                                  <Bookmark className="w-3.5 h-3.5" />
                                  <span>0</span>
                                </div>
                              </div>
                              
                              <h4 className="font-heading font-extrabold text-base dark:text-white text-slate-900 mt-4 flex items-center gap-2">
                                <Headphones className="w-4 h-4 text-sky-400" />
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
                                <span className="px-2.5 py-0.5 rounded-lg dark:bg-slate-800/80 bg-slate-100 text-slate-700 dark:text-slate-300 text-xs font-bold font-heading border dark:border-slate-700 border-slate-200">
                                  Part 4
                                </span>
                                <div className="flex items-center gap-1.5 text-xs text-slate-400 font-mono">
                                  <Bookmark className="w-3.5 h-3.5" />
                                  <span>0</span>
                                </div>
                              </div>
                              
                              <h4 className="font-heading font-extrabold text-base dark:text-white text-slate-900 mt-4 flex items-center gap-2">
                                <Headphones className="w-4 h-4 text-sky-400" />
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
