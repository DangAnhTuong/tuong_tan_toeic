import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { 
  BookOpen, 
  Sparkles, 
  Crown, 
  CheckCircle2, 
  XCircle, 
  RotateCcw, 
  ArrowRight, 
  Search, 
  Shuffle, 
  FileText, 
  Grid, 
  BarChart2, 
  Lock,
  Tag,
  Clock,
  Volume2,
  ChevronRight,
  Flame,
  ShoppingBag,
  Copy,
  Trash2,
  Star
} from 'lucide-react';
import axios from 'axios';
import VipLockOverlay from '../components/VipLockOverlay';
import PricingModal from '../components/PricingModal';
import VocabularyDrawer from '../components/VocabularyDrawer';
import PersonalNoteModal from '../components/PersonalNoteModal';
import { useAuth } from '../context/AuthContext';
import usePageTitle from '../hooks/usePageTitle';
import { getPracticeProgress, resetPracticeProgress } from '../services/practiceProgressService';
import { getBasketWords, removeWordFromBasket } from '../services/vocabBasketService';
import { getStoredUser, setStoredUser } from '../utils/auth';

// ── 15 Authentic Grammar Topics across 3 Categories (1,843 questions total) ──
export const GRAMMAR_CATEGORIES = [
  {
    id: 'tu-loai',
    title: 'Từ loại',
    topicsCount: 3,
    totalQuestions: 554,
    topics: [
      { slug: 'nouns', title: 'Danh từ', total: 287 },
      { slug: 'adjectives', title: 'Tính từ', total: 130 },
      { slug: 'adverbs', title: 'Trạng từ', total: 137 }
    ]
  },
  {
    id: 'dong-tu',
    title: 'Động từ',
    topicsCount: 6,
    totalQuestions: 582,
    topics: [
      { slug: 'verb-tenses', title: 'Thì', total: 113 },
      { slug: 'subject-verb-agreement', title: 'Hòa hợp chủ ngữ – động từ', total: 129 },
      { slug: 'active-and-passive-voice', title: 'Chủ động – bị động', total: 113 },
      { slug: 'gerunds', title: 'Danh động từ', total: 76 },
      { slug: 'imperatives', title: 'Câu mệnh lệnh', total: 14 },
      { slug: 'verb-forms', title: 'Dạng động từ', total: 137 }
    ]
  },
  {
    id: 'ngu-phap-khac',
    title: 'Ngữ pháp khác',
    topicsCount: 6,
    totalQuestions: 707,
    topics: [
      { slug: 'pronouns', title: 'Đại từ', total: 145 },
      { slug: 'comparisons', title: 'So sánh', total: 164 },
      { slug: 'conjunctions-and-prepositions', title: 'Liên từ giới từ', total: 151 },
      { slug: 'relative-clauses', title: 'Mệnh đề quan hệ', total: 156 },
      { slug: 'conditionals', title: 'Câu điều kiện', total: 37 },
      { slug: 'adverb-clauses', title: 'Mệnh đề trạng ngữ', total: 54 }
    ]
  }
];

export default function ReadingDashboard() {
  usePageTitle(
    'Luyện Đọc TOEIC Part 5 6 7 — Ôn Ngữ Pháp & 8 Cấp Độ Đậu TOEIC',
    'Chinh phục TOEIC Reading từ dễ đến khó. Ôn ngữ pháp theo chủ điểm và luyện Part 5–7 theo 8 level, từ dưới 300 tới trên 900 điểm.'
  );

  const { requireAuth, isPro: authIsPro, refreshProfile } = useAuth();
  const rawNavigate = useNavigate();
  const navigate = (to, options) => {
    if (typeof to === 'string' && (to.startsWith('/read/practice') || to.startsWith('/grammar') || to.startsWith('/reading/article'))) {
      return requireAuth(to);
    }
    return rawNavigate(to, options);
  };
  const [searchParams, setSearchParams] = useSearchParams();
  
  // URL Params Synchronization on initial load & back button
  const getInitialState = () => {
    const curMode = searchParams.get('mode') || searchParams.get('tab');
    const curPart = searchParams.get('part');
    if (curMode === 'grammar' || curPart === 'grammar') {
      return { mode: 'grammar', part: 'Part 5' };
    }
    if (curMode === 'bilingual') {
      return { mode: 'bilingual', part: 'Part 5' };
    }
    if (curPart) {
      const num = curPart.replace(/[^0-9]/g, '');
      let p = 'Part 5';
      if (num === '6') p = 'Part 6';
      else if (num === '7') p = 'Part 7';
      return { mode: 'practice', part: p };
    }
    // Default to 'grammar' tab matching Dau English
    return { mode: 'grammar', part: 'Part 5' };
  };

  const initial = getInitialState();
  const [activeMode, setActiveMode] = useState(initial.mode); // 'practice' | 'grammar' | 'bilingual'
  const [selectedPart, setSelectedPart] = useState(initial.part); // 'Part 5' | 'Part 6' | 'Part 7'
  const [grammarFilter, setGrammarFilter] = useState(searchParams.get('filter') || searchParams.get('subTab') || 'all');
  const [bilingualLevel, setBilingualLevel] = useState(parseInt(searchParams.get('level'), 10) || 1);
  const [searchTerm, setSearchTerm] = useState('');

  // Keep state synced on browser Back / Forward buttons
  useEffect(() => {
    const curMode = searchParams.get('mode') || searchParams.get('tab');
    const curPart = searchParams.get('part');
    const curFilter = searchParams.get('filter') || searchParams.get('subTab') || 'all';
    const curLevel = parseInt(searchParams.get('level'), 10) || 1;

    if (curMode === 'grammar' || curPart === 'grammar') {
      setActiveMode('grammar');
    } else if (curMode === 'bilingual') {
      setActiveMode('bilingual');
    } else if (curPart) {
      setActiveMode('practice');
      const num = curPart.replace(/[^0-9]/g, '');
      if (num === '6') setSelectedPart('Part 6');
      else if (num === '7') setSelectedPart('Part 7');
      else setSelectedPart('Part 5');
    } else {
      setActiveMode('grammar');
    }

    setGrammarFilter(curFilter);
    setBilingualLevel(curLevel);
  }, [searchParams]);

  // Data States
  const [levelData, setLevelData] = useState([]);
  const [grammarList, setGrammarList] = useState([]);
  const [consolidatedList, setConsolidatedList] = useState([]);
  const [bilingualArticles, setBilingualArticles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isProUser, setIsProUser] = useState(() => {
    const stored = getStoredUser();
    return Boolean(stored?.isPro || stored?.role === 'admin');
  });

  useEffect(() => {
    if (authIsPro) {
      setIsProUser(true);
    }
  }, [authIsPro]);

  const [showPricingModal, setShowPricingModal] = useState(false);
  const [practiceProgressMap, setPracticeProgressMap] = useState({});
  const [resetConfirmLvl, setResetConfirmLvl] = useState(null);
  const [showVocabDrawer, setShowVocabDrawer] = useState(false);
  const [basketWords, setBasketWords] = useState([]);
  const [activeNoteModal, setActiveNoteModal] = useState(null);

  // Load user practice progress for level cards & basket words
  const loadPracticeProgress = async () => {
    try {
      const { map } = await getPracticeProgress({ category: 'reading' });
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
  }, [selectedPart, activeMode]);

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

  // Sync mode & sub-filters with URL
  const handlePartSelect = (part) => {
    setActiveMode('practice');
    setSelectedPart(part);
    const num = part.replace(/[^0-9]/g, '');
    setSearchParams({ part: num }, { replace: true });
  };

  const handleModeSelect = (mode) => {
    setActiveMode(mode);
    if (mode === 'grammar') {
      setSearchParams({ mode: 'grammar', filter: grammarFilter }, { replace: true });
    } else if (mode === 'bilingual') {
      setSearchParams({ mode: 'bilingual', level: bilingualLevel }, { replace: true });
    } else {
      const num = selectedPart.replace(/[^0-9]/g, '');
      setSearchParams({ part: num }, { replace: true });
    }
  };

  const handleGrammarFilterChange = (filter) => {
    setGrammarFilter(filter);
    setSearchParams({ mode: 'grammar', filter }, { replace: true });
  };

  const handleBilingualLevelChange = (level) => {
    setBilingualLevel(level);
    setSearchParams({ mode: 'bilingual', level }, { replace: true });
  };

  // 1. Fetch Practice Levels for Part 5, 6, 7
  useEffect(() => {
    async function fetchLevels() {
      try {
        const res = await axios.get(`/api/v1/reading/exercises?part=${encodeURIComponent(selectedPart)}&mode=level`);
        if (res.data?.data) {
          setLevelData(res.data.data);
        }
      } catch (e) {
        console.warn('Failed to load reading levels:', e.message);
      }
    }
    if (activeMode === 'practice') {
      fetchLevels();
    }
  }, [selectedPart, activeMode]);

  // 2. Fetch Grammar Topics & Consolidated Tests
  useEffect(() => {
    async function fetchGrammar() {
      try {
        const [gRes, cRes] = await Promise.all([
          axios.get('/api/v1/reading/exercises?mode=grammar'),
          axios.get('/api/v1/reading/exercises?mode=consolidated')
        ]);
        if (gRes.data?.data) setGrammarList(gRes.data.data);
        if (cRes.data?.data) setConsolidatedList(cRes.data.data);
      } catch (e) {
        console.warn('Failed to load grammar topics:', e.message);
      }
    }
    if (activeMode === 'grammar') {
      fetchGrammar();
    }
  }, [activeMode]);

  // 3. Fetch Bilingual Articles by Level
  useEffect(() => {
    async function fetchBilingual() {
      setLoading(true);
      try {
        const res = await axios.get(`/api/v1/reading/exercises?mode=bilingual&level=${bilingualLevel}`);
        if (res.data?.data) {
          setBilingualArticles(res.data.data);
        }
      } catch (e) {
        console.warn('Failed to load bilingual articles:', e.message);
      } finally {
        setLoading(false);
      }
    }
    if (activeMode === 'bilingual') {
      fetchBilingual();
    }
  }, [bilingualLevel, activeMode]);

  // Exact question totals matching authentic Đậu TOEIC question bank
  const defaultTotals = {
    'Part 5': [282, 217, 284, 348, 396, 315, 242, 166],
    'Part 6': [4, 20, 48, 288, 416, 260, 132, 32],
    'Part 7': [13, 67, 248, 558, 1207, 1276, 603, 78]
  };

  const defaultAttempts = {
    'Part 5': [2124, 1934, 2634, 1838, 2890, 2210, 1640, 1080],
    'Part 6': [932, 879, 1028, 727, 1420, 1150, 890, 640],
    'Part 7': [788, 723, 1111, 545, 1870, 1540, 1190, 820]
  };

  const levelConfigs = [
    { id: 1, name: 'Level 1', rate: 'Dưới 300 điểm', isPro: false, color: 'emerald' },
    { id: 2, name: 'Level 2', rate: '300–400 điểm', isPro: true, color: 'blue' },
    { id: 3, name: 'Level 3', rate: '400–500 điểm', isPro: false, color: 'amber' },
    { id: 4, name: 'Level 4', rate: '500–600 điểm', isPro: false, color: 'orange' },
    { id: 5, name: 'Level 5', rate: '600–700 điểm', isPro: true, color: 'purple' },
    { id: 6, name: 'Level 6', rate: '700–800 điểm', isPro: false, color: 'cyan' },
    { id: 7, name: 'Level 7', rate: '800–900 điểm', isPro: true, color: 'rose' },
    { id: 8, name: 'Level 8', rate: 'Trên 900 điểm', isPro: false, color: 'indigo' }
  ];

  const levelCards = levelConfigs.map((cfg, idx) => ({
    ...cfg,
    completed: 0,
    correct: 0,
    wrong: 0,
    total: levelData.find(e => e.level === cfg.id)?.totalQuestions || defaultTotals[selectedPart]?.[idx] || 100,
    attempts: levelData.find(e => e.level === cfg.id)?.attemptsCount || defaultAttempts[selectedPart]?.[idx] || 1500
  }));

  return (
    <div className="min-h-screen dark:bg-[#0b1120] bg-[#f8fafc] dark:text-slate-100 text-slate-900 flex flex-col font-sans pb-12 transition-colors duration-200">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* HERO BANNER READING — EXACT MATCH ĐẬU TOEIC */}
        <div className="relative overflow-hidden rounded-3xl glass-panel border dark:border-slate-800 border-slate-200 p-8 md:p-10 dark:bg-gradient-to-r dark:from-blue-950/30 dark:via-[#0f172a] dark:to-[#0b1120] bg-gradient-to-r from-blue-50/70 via-white to-sky-50/50 shadow-xl dark:shadow-2xl">
          <div className="absolute top-0 right-0 -mt-12 -mr-12 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
          
          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-3 text-center md:text-left">
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full dark:bg-blue-500/10 bg-blue-100 border dark:border-blue-500/30 border-blue-300 text-blue-700 dark:text-blue-400 text-xs font-bold uppercase tracking-wider">
                <BookOpen className="w-3.5 h-3.5" />
                <span>Luyện đọc TOEIC</span>
              </div>
              <h1 className="text-3xl md:text-4xl font-extrabold font-heading dark:text-white text-slate-900 tracking-tight">
                Chinh phục <span className="text-blue-600 dark:text-blue-400">TOEIC Reading</span> từ dễ đến khó
              </h1>
              <p className="dark:text-slate-400 text-slate-600 text-sm max-w-xl">
                Ôn ngữ pháp theo chủ điểm và luyện Part 5–7 theo 8 level, từ dưới 300 tới trên 900 điểm.
              </p>
            </div>

            {/* Book Icon matching Dau English */}
            <div className="w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-blue-600 dark:bg-blue-500 shadow-xl shadow-blue-500/30 flex items-center justify-center shrink-0">
              <BookOpen className="w-8 h-8 md:w-10 md:h-10 text-white" />
            </div>
          </div>
        </div>

        {/* SINGLE ROW TABS BAR — EXACT MATCH ĐẬU TOEIC [Ngữ pháp] [Part 5] [Part 6] [Part 7] [Đọc song ngữ] */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {[
            { id: 'grammar', label: 'Ngữ pháp', isMode: true },
            { id: 'Part 5', label: 'Part 5', part: 'Part 5' },
            { id: 'Part 6', label: 'Part 6', part: 'Part 6' },
            { id: 'Part 7', label: 'Part 7', part: 'Part 7' },
            { id: 'bilingual', label: 'Đọc song ngữ', isMode: true }
          ].map((tab) => {
            const isActive = tab.isMode
              ? activeMode === tab.id
              : activeMode === 'practice' && selectedPart === tab.part;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  if (tab.isMode) {
                    handleModeSelect(tab.id);
                  } else {
                    handlePartSelect(tab.part);
                  }
                }}
                className={`px-6 py-2 rounded-full text-sm font-bold transition-all shrink-0 cursor-pointer ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-600/25'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* ========================================================================= */}
        {/* MODE 1: LUYỆN ĐỀ (PART 5, 6, 7 & 4 LEVEL CARDS + LUYỆN THEO CHỦ ĐIỂM) */}
        {/* ========================================================================= */}
        {activeMode === 'practice' && (
          <div className="space-y-8 animate-fadeIn">
            
            {/* 4 LEVEL PRACTICE CARDS GRID (Exact Match Dau TOEIC) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {levelCards.map((lvl) => {
                const isLocked = !isProUser && lvl.id > 1;
                const exKey = `reading_${selectedPart.replace(/\s+/g, '').toLowerCase()}_lv${lvl.id}`;
                const prog = practiceProgressMap[exKey];
                const completed = prog?.completedCount || 0;
                const correct = prog?.correctCount || 0;
                const wrong = prog?.wrongCount || 0;
                const wrongCount = (prog?.wrongQuestions?.length) || wrong;
                const total = lvl.total || (defaultTotals[selectedPart]?.[lvl.id - 1] || 864);

                return (
                  <VipLockOverlay
                    key={lvl.id}
                    isLocked={isLocked}
                    onUnlockClick={() => setShowPricingModal(true)}
                    label={`Level ${lvl.id} (VIP)`}
                  >
                    <div 
                      className="rounded-3xl dark:bg-slate-900/60 bg-white border dark:border-slate-800 border-slate-200 p-5 space-y-4 flex flex-col justify-between hover:border-blue-500/50 dark:hover:border-blue-500/50 hover:shadow-xl shadow-sm transition-all"
                    >
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="font-heading font-extrabold text-sm sm:text-base text-slate-900 dark:text-white">
                              {lvl.name}
                            </h3>
                            <p className="text-xs text-slate-400 dark:text-slate-500 font-medium">
                              {lvl.rate}
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
                                <XCircle className="w-3.5 h-3.5" /> {wrongCount}
                              </span>
                            </div>
                          ) : (
                            <div className="text-xs text-slate-400 dark:text-slate-500 font-medium">
                              Chưa luyện tập • {total} câu
                            </div>
                          )}
                        </div>

                        {/* Action Buttons Row matching Dau TOEIC */}
                        <div className="flex items-center justify-between gap-2 pt-3 border-t dark:border-slate-800/80 border-slate-100 mt-auto">
                          
                          {/* Capsule 4 nút thao tác */}
                          <div className="flex items-center gap-0.5 p-0.5 sm:p-1 rounded-xl bg-slate-100 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700/60 shrink-0">
                            {/* 1. Giỏ từ button */}
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
                                  title: `Ghi chú — ${lvl.name} (${selectedPart})`
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
                              disabled={wrongCount === 0}
                              onClick={(e) => {
                                e.stopPropagation();
                                navigate(`/read/practice/p${selectedPart.replace(/[^0-9]/g, '')}lv${lvl.id}?part=${encodeURIComponent(selectedPart)}&level=${lvl.id}&redo=true`);
                              }}
                              className={`w-6.5 h-6.5 rounded-lg flex items-center justify-center transition-all relative ${
                                wrongCount > 0
                                  ? 'text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 cursor-pointer'
                                  : 'text-slate-300 dark:text-slate-600 cursor-not-allowed opacity-40'
                              }`}
                              title={wrongCount > 0 ? `Làm lại ${wrongCount} câu sai` : 'Không có câu sai'}
                            >
                              <RotateCcw className="w-3.5 h-3.5" />
                              {wrongCount > 0 && (
                                <span className="absolute -top-1 -right-1 flex h-3.5 min-w-3.5 px-0.5 items-center justify-center rounded-full bg-rose-500 text-white font-bold text-[8px] shadow-sm">
                                  {wrongCount}
                                </span>
                              )}
                            </button>

                            {/* 4. Xóa tiến độ */}
                            <button
                              type="button"
                              disabled={completed === 0}
                              onClick={(e) => {
                                e.stopPropagation();
                                setResetConfirmLvl({ ...lvl, exerciseKey: exKey });
                              }}
                              className={`w-6.5 h-6.5 rounded-lg flex items-center justify-center transition-all ${
                                completed > 0
                                  ? 'text-slate-400 hover:text-rose-500 hover:bg-white dark:hover:bg-slate-700/60 cursor-pointer'
                                  : 'text-slate-300 dark:text-slate-600 cursor-not-allowed opacity-40'
                              }`}
                              title={completed > 0 ? `Xóa tiến độ ${lvl.name}` : 'Chưa có tiến độ để xóa'}
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          {/* Học ngay Button matching Screenshot 1 */}
                          <button
                            onClick={() => navigate(`/read/practice/p${selectedPart.replace(/[^0-9]/g, '')}lv${lvl.id}?part=${encodeURIComponent(selectedPart)}&level=${lvl.id}`)}
                            className={`ml-auto shrink-0 whitespace-nowrap h-8 sm:h-8.5 px-4 rounded-full font-bold text-xs flex items-center justify-center transition-all active:scale-95 cursor-pointer ${
                              completed > 0
                                ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm shadow-emerald-600/20'
                                : 'border border-emerald-500/50 hover:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                            }`}
                          >
                            <span>Học ngay</span>
                          </button>
                        </div>

                      </div>
                    </div>
                  </VipLockOverlay>
                );
              })}
            </div>

            {/* Section: Luyện theo chủ điểm (Part 5 specific - 1.000 câu) */}
            {selectedPart === 'Part 5' && (
              <div className="pt-6 space-y-4">
                <div>
                  <h2 className="text-lg md:text-xl font-extrabold text-slate-900 dark:text-white font-heading">
                    Luyện theo chủ điểm
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    Cùng bộ câu ở trên, chia theo chủ điểm ngữ pháp. Mỗi câu thuộc đúng một chủ điểm.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {[
                    { 
                      id: 'vocab', 
                      topic: 'Từ vựng', 
                      title: 'Từ vựng', 
                      total: 428, 
                      attempts: 2420, 
                      desc: 'Danh từ, động từ, tính từ, trạng từ trong ngữ cảnh TOEIC' 
                    },
                    { 
                      id: 'pos', 
                      topic: 'Từ loại', 
                      title: 'Từ loại', 
                      total: 254, 
                      attempts: 1980, 
                      desc: 'Vị trí danh từ, tính từ, trạng từ, đại từ' 
                    },
                    { 
                      id: 'verb', 
                      topic: 'Động từ', 
                      title: 'Động từ', 
                      total: 88, 
                      attempts: 1450, 
                      desc: 'Thì & thể, động từ chia thì, chủ động & bị động' 
                    },
                    { 
                      id: 'advanced', 
                      topic: 'Ngữ pháp khác', 
                      title: 'Ngữ pháp khác', 
                      total: 230, 
                      attempts: 1820, 
                      desc: 'Mệnh đề quan hệ, liên từ, giới từ, câu so sánh' 
                    }
                  ].map(topicItem => {
                    const tProg = practiceProgressMap[`reading_p5_topic_${topicItem.id}`];
                    const tCompleted = tProg?.completedCount || 0;
                    return (
                      <div
                        key={topicItem.id}
                        className="rounded-3xl dark:bg-slate-900/60 bg-white border dark:border-slate-800 border-slate-200 p-5 flex flex-col justify-between hover:border-blue-500/50 dark:hover:border-blue-500/50 hover:shadow-xl shadow-sm transition-all space-y-4"
                      >
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <h3 className="font-heading font-extrabold text-sm sm:text-base text-slate-900 dark:text-white">
                              {topicItem.title}
                            </h3>
                            <span className="text-[10px] font-bold text-slate-400">
                              {topicItem.total} câu
                            </span>
                          </div>
                          <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">
                            {topicItem.desc}
                          </p>
                        </div>

                        <div className="flex items-center justify-between pt-2 border-t dark:border-slate-800/80 border-slate-100">
                          <span className="text-[10px] text-slate-400 font-medium">
                            {topicItem.attempts} lượt làm
                          </span>
                          <button
                            onClick={() => navigate(`/read/practice/p5topic_${topicItem.id}?part=Part%205&topic=${encodeURIComponent(topicItem.topic)}`)}
                            className={`h-8 px-4 rounded-full font-bold text-xs flex items-center justify-center transition-all active:scale-95 cursor-pointer ${
                              tCompleted > 0
                                ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                                : 'border border-emerald-500/50 hover:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                            }`}
                          >
                            <span>Học ngay</span>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Section: Luyện theo dạng bài (Part 6 specific - 1.616 câu) */}
            {selectedPart === 'Part 6' && (
              <div className="pt-6 space-y-4">
                <div>
                  <h2 className="text-lg md:text-xl font-extrabold text-slate-900 dark:text-white font-heading">
                    Luyện theo dạng bài
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    404 đoạn văn chuẩn ETS chia theo 8 định dạng văn bản thường gặp nhất trong TOEIC Reading.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {[
                    { id: 'email', title: 'Email', total: 508, attempts: 2150, desc: 'Thư điện tử trao đổi công việc, thông báo nội bộ' },
                    { id: 'article', title: 'Bài báo', total: 272, attempts: 1820, desc: 'Bản tin kinh doanh, tài chính, đổi mới công nghệ' },
                    { id: 'notice', title: 'Thông báo', total: 228, attempts: 1540, desc: 'Quy định công ty, bảo trì hệ thống, sự kiện' },
                    { id: 'ad', title: 'Quảng cáo', total: 152, attempts: 1260, desc: 'Quảng bá sản phẩm, dịch vụ mới, chương trình ưu đãi' },
                    { id: 'memo', title: 'Thư nội bộ', total: 128, attempts: 980, desc: 'Bản ghi nhớ công việc giữa các phòng ban' },
                    { id: 'letter', title: 'Thư tín', total: 108, attempts: 870, desc: 'Thư tay trang trọng gửi đối tác và khách hàng' },
                    { id: 'instructions', title: 'Hướng dẫn & thông tin', total: 112, attempts: 790, desc: 'Quy trình sử dụng thiết bị, sổ tay nhân viên' },
                    { id: 'web', title: 'Trang web & đánh giá', total: 108, attempts: 920, desc: 'Giao diện web trực tuyến, phản hồi dịch vụ' }
                  ].map(topicItem => (
                    <div
                      key={topicItem.id}
                      className="rounded-3xl dark:bg-slate-900/60 bg-white border dark:border-slate-800 border-slate-200 p-5 flex flex-col justify-between hover:border-blue-500/50 dark:hover:border-blue-500/50 hover:shadow-xl shadow-sm transition-all space-y-4"
                    >
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <h3 className="font-heading font-extrabold text-sm sm:text-base text-slate-900 dark:text-white">
                            {topicItem.title}
                          </h3>
                          <span className="text-[10px] font-bold text-slate-400">
                            {topicItem.total} câu
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">
                          {topicItem.desc}
                        </p>
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t dark:border-slate-800/80 border-slate-100">
                        <span className="text-[10px] text-slate-400 font-medium">
                          {topicItem.attempts} lượt làm
                        </span>
                        <button
                          onClick={() => navigate(`/read/practice/p6_${topicItem.id}?part=Part%206&type=${encodeURIComponent(topicItem.title)}`)}
                          className="h-8 px-4 rounded-full font-bold text-xs border border-emerald-500/50 hover:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center transition-all active:scale-95 cursor-pointer"
                        >
                          <span>Học ngay</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Section: Luyện theo định dạng đoạn văn (Part 7 specific - 5.454 câu) */}
            {selectedPart === 'Part 7' && (
              <div className="pt-6 space-y-4">
                <div>
                  <h2 className="text-lg md:text-xl font-extrabold text-slate-900 dark:text-white font-heading">
                    Luyện theo dạng bài
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    1.515 đoạn đọc chuẩn format ETS chia theo đoạn đơn, đoạn kép và đoạn ba.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {[
                    { id: 'single', title: 'Đoạn đơn (Single Passage)', total: 3090, attempts: 4320, desc: 'Bài đọc 1 văn bản: Email, Memo, Bài báo, Thông báo' },
                    { id: 'double', title: 'Đoạn kép (Double Passage)', total: 1180, attempts: 2890, desc: 'Tổ hợp 2 văn bản liên kết thông tin suy luận' },
                    { id: 'triple', title: 'Đoạn ba (Triple Passage)', total: 1184, attempts: 2150, desc: 'Tổ hợp 3 văn bản đa chiều yêu cầu tốc độ đọc nhanh' }
                  ].map(topicItem => (
                    <div
                      key={topicItem.id}
                      className="rounded-3xl dark:bg-slate-900/60 bg-white border dark:border-slate-800 border-slate-200 p-5 flex flex-col justify-between hover:border-blue-500/50 dark:hover:border-blue-500/50 hover:shadow-xl shadow-sm transition-all space-y-4"
                    >
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <h3 className="font-heading font-extrabold text-sm sm:text-base text-slate-900 dark:text-white">
                            {topicItem.title}
                          </h3>
                          <span className="text-[10px] font-bold text-slate-400">
                            {topicItem.total} câu
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          {topicItem.desc}
                        </p>
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t dark:border-slate-800/80 border-slate-100">
                        <span className="text-[10px] text-slate-400 font-medium">
                          {topicItem.attempts} lượt làm
                        </span>
                        <button
                          onClick={() => navigate(`/read/practice/p7_${topicItem.id}?part=Part%207&format=${encodeURIComponent(topicItem.id)}`)}
                          className="h-8 px-4 rounded-full font-bold text-xs border border-emerald-500/50 hover:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center transition-all active:scale-95 cursor-pointer"
                        >
                          <span>Học ngay</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>
        )}

        {/* ========================================================================= */}
        {/* MODE 2: NGỮ PHÁP — 15 CHỦ ĐIỂM CHUẨN XÁC ĐẬU TOEIC (1.843 CÂU) */}
        {/* ========================================================================= */}
        {activeMode === 'grammar' && (
          <div className="space-y-8 animate-fadeIn">

            {/* Filter Pills Header (Matching Đậu TOEIC Screenshot 1) */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
                {[
                  { id: 'all', label: 'Tất cả' },
                  { id: 'tu-loai', label: 'Từ loại' },
                  { id: 'dong-tu', label: 'Động từ' },
                  { id: 'ngu-phap-khac', label: 'Ngữ pháp khác' },
                  { id: 'tonghop', label: 'Đề thi theo năm' },
                  { id: 'tiendo', label: 'Tiến độ' }
                ].map((tab) => {
                  const isActive = grammarFilter === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => handleGrammarFilterChange(tab.id)}
                      className={`px-5 py-2 rounded-full text-xs sm:text-sm font-bold transition-all shrink-0 cursor-pointer ${
                        isActive
                          ? 'bg-blue-600 text-white shadow-md shadow-blue-600/25'
                          : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
                      }`}
                    >
                      {tab.label}
                    </button>
                  );
                })}
              </div>

              {/* Search Bar for Grammar Topics */}
              {['all', 'tu-loai', 'dong-tu', 'ngu-phap-khac'].includes(grammarFilter) && (
                <div className="relative w-full sm:w-64 shrink-0">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Tìm kiếm chủ điểm..."
                    className="w-full pl-9 pr-3 py-2 rounded-full dark:bg-slate-900 bg-white border dark:border-slate-800 border-slate-200 text-xs font-medium text-slate-900 dark:text-white focus:border-blue-500 outline-none placeholder:text-slate-400 shadow-sm transition-colors"
                  />
                </div>
              )}
            </div>

            {/* 15 AUTHENTIC GRAMMAR TOPICS ACROSS 3 CATEGORIES (Matching Screenshot 1) */}
            {['all', 'tu-loai', 'dong-tu', 'ngu-phap-khac'].includes(grammarFilter) && (
              <div className="space-y-10">
                {GRAMMAR_CATEGORIES.filter(cat => grammarFilter === 'all' || cat.id === grammarFilter).map(cat => {
                  const visibleTopics = cat.topics
                    .map(t => {
                      const live = grammarList.find(g => g.slug === t.slug || g.title?.toLowerCase() === t.title.toLowerCase());
                      return {
                        ...t,
                        _id: live?._id,
                        slug: live?.slug || t.slug,
                        totalQuestions: live?.totalQuestions || t.total,
                        attemptsCount: live?.attemptsCount || 320,
                        isPro: live?.isPro || false
                      };
                    })
                    .filter(t => !searchTerm || t.title.toLowerCase().includes(searchTerm.toLowerCase()));

                  if (visibleTopics.length === 0) return null;

                  return (
                    <div key={cat.id} className="space-y-4">
                      {/* Category Header: "Từ loại - 3 chủ điểm · 554 câu" */}
                      <div className="space-y-1">
                        <h2 className="text-xl md:text-2xl font-extrabold text-slate-900 dark:text-white font-heading">
                          {cat.title}
                        </h2>
                        <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                          {cat.topicsCount} chủ điểm · {cat.totalQuestions.toLocaleString('vi-VN')} câu
                        </p>
                      </div>

                      {/* Topic Cards Grid (4 columns desktop, 2 tablet, 1 mobile) */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {visibleTopics.map(item => {
                          const exKey = `grammar_${item.slug}`;
                          const prog = practiceProgressMap[exKey];
                          const completed = prog?.completedCount || 0;
                          const correct = prog?.correctCount || 0;
                          const wrong = prog?.wrongCount || 0;
                          const wrongCount = (prog?.wrongQuestions?.length) || wrong;
                          const total = item.totalQuestions || item.total;

                          return (
                            <div 
                              key={item.slug}
                              className="rounded-3xl dark:bg-slate-900/60 bg-white border dark:border-slate-800 border-slate-200 p-5 space-y-4 flex flex-col justify-between hover:border-blue-500/50 dark:hover:border-blue-500/50 hover:shadow-xl shadow-sm transition-all"
                            >
                              <div className="space-y-2.5">
                                <div className="flex items-start justify-between gap-2">
                                  <h3 className="font-heading font-extrabold text-base text-slate-900 dark:text-white">
                                    {item.title}
                                  </h3>
                                </div>

                                {/* Status Line: "Chưa luyện tập · 287 câu" */}
                                <div className="py-0.5">
                                  {completed > 0 ? (
                                    <div className="flex items-center gap-3 text-xs font-bold font-mono">
                                      <span className="font-extrabold text-emerald-600 dark:text-emerald-400">
                                        {completed}/{total}
                                      </span>
                                      <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-bold">
                                        <CheckCircle2 className="w-3.5 h-3.5" /> {correct}
                                      </span>
                                      <span className="flex items-center gap-1 text-rose-500 font-bold">
                                        <XCircle className="w-3.5 h-3.5" /> {wrongCount}
                                      </span>
                                    </div>
                                  ) : (
                                    <div className="text-xs text-slate-400 dark:text-slate-500 font-medium">
                                      Chưa luyện tập · {total} câu
                                    </div>
                                  )}
                                </div>
                              </div>

                              {/* Card Action Row: 4 Icons Capsule + Green "Học ngay" Button */}
                              <div className="flex items-center justify-between gap-2 pt-3 border-t dark:border-slate-800/80 border-slate-100 mt-auto">
                                {/* 4 Capsule Action Icons */}
                                <div className="flex items-center gap-0.5 p-0.5 sm:p-1 rounded-xl bg-slate-100 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700/60 shrink-0">
                                  {/* 1. Giỏ từ vựng */}
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

                                  {/* 2. Ghi chú cá nhân */}
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setActiveNoteModal({
                                        id: exKey,
                                        title: `Ghi chú — ${item.title}`
                                      });
                                    }}
                                    className="w-6.5 h-6.5 rounded-lg flex items-center justify-center text-slate-400 hover:text-sky-500 hover:bg-white dark:hover:bg-slate-700/60 transition-colors relative cursor-pointer"
                                    title="Ghi chú bài học"
                                  >
                                    <FileText className="w-3.5 h-3.5" />
                                  </button>

                                  {/* 3. Luyện lại câu sai / từ đầu */}
                                  <button
                                    type="button"
                                    disabled={wrongCount === 0 && completed === 0}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      navigate(`/grammar/${item.slug}?redo=true`);
                                    }}
                                    className={`w-6.5 h-6.5 rounded-lg flex items-center justify-center transition-all relative ${
                                      wrongCount > 0
                                        ? 'text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 cursor-pointer'
                                        : completed > 0
                                          ? 'text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 cursor-pointer'
                                          : 'text-slate-300 dark:text-slate-600 cursor-not-allowed opacity-40'
                                    }`}
                                    title={wrongCount > 0 ? `Làm lại ${wrongCount} câu sai` : 'Làm lại từ đầu'}
                                  >
                                    <RotateCcw className="w-3.5 h-3.5" />
                                    {wrongCount > 0 && (
                                      <span className="absolute -top-1 -right-1 flex h-3.5 min-w-3.5 px-0.5 items-center justify-center rounded-full bg-rose-500 text-white font-bold text-[8px] shadow-sm">
                                        {wrongCount}
                                      </span>
                                    )}
                                  </button>

                                  {/* 4. Xóa tiến độ */}
                                  <button
                                    type="button"
                                    disabled={completed === 0}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setResetConfirmLvl({ name: item.title, exerciseKey: exKey });
                                    }}
                                    className={`w-6.5 h-6.5 rounded-lg flex items-center justify-center transition-all ${
                                      completed > 0
                                        ? 'text-slate-400 hover:text-rose-500 hover:bg-white dark:hover:bg-slate-700/60 cursor-pointer'
                                        : 'text-slate-300 dark:text-slate-600 cursor-not-allowed opacity-40'
                                    }`}
                                    title={completed > 0 ? `Xóa tiến độ ${item.title}` : 'Chưa có tiến độ để xóa'}
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>

                                {/* Nút Học ngay (Green pill button matching Screenshot 1) */}
                                <button
                                  onClick={() => navigate(`/grammar/${item.slug}`)}
                                  className={`shrink-0 whitespace-nowrap h-8 sm:h-8.5 px-5 rounded-full font-bold text-xs flex items-center justify-center transition-all active:scale-95 cursor-pointer ${
                                    completed > 0
                                      ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm shadow-emerald-600/20'
                                      : 'border border-emerald-500/60 hover:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                                  }`}
                                >
                                  <span>Học ngay</span>
                                </button>
                              </div>

                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* TAB: BỘ ĐỀ TỔNG HỢP THEO NĂM (9 BỘ ĐỀ) */}
            {grammarFilter === 'tonghop' && (
              <div className="space-y-5">
                <div className="flex items-center gap-2.5">
                  <Grid className="w-5 h-5 text-emerald-500 dark:text-emerald-400" />
                  <h2 className="font-heading font-extrabold text-lg text-slate-900 dark:text-white">Bộ đề tổng hợp theo năm</h2>
                  <span className="px-2.5 py-0.5 rounded-full dark:bg-slate-800 bg-slate-100 border dark:border-slate-700 border-slate-200 text-slate-600 dark:text-slate-300 text-xs font-mono font-bold">
                    {consolidatedList.length} bộ đề · 1.491 câu
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {consolidatedList.map((set, idx) => {
                    const isHot = set.levelBadge === '2026';
                    const isLocked = !isProUser && idx > 1;
                    const yearColors = {
                      '2026': 'border-t-orange-500 bg-orange-500/5',
                      '2025': 'border-t-cyan-500 bg-cyan-500/5',
                      '2024': 'border-t-blue-500 bg-blue-500/5',
                      '2023': 'border-t-violet-500 bg-violet-500/5',
                      '2022': 'border-t-emerald-500 bg-emerald-500/5',
                      '2021': 'border-t-teal-500 bg-teal-500/5',
                      '2020': 'border-t-pink-500 bg-pink-500/5',
                      '2019': 'border-t-amber-500 bg-amber-500/5',
                      '2018': 'border-t-slate-400 dark:bg-slate-800/30 bg-slate-50'
                    };
                    const yc = yearColors[set.levelBadge] || 'border-t-slate-500';

                    return (
                      <VipLockOverlay
                        key={set._id || idx}
                        isLocked={isLocked}
                        compact
                        onUnlockClick={() => setShowPricingModal(true)}
                        label="VIP — Mở khóa bộ đề"
                      >
                        <div className={`relative dark:bg-slate-900 bg-white rounded-2xl border dark:border-slate-800 border-slate-200 border-t-2 ${yc} p-4 space-y-3 flex flex-col justify-between hover:border-slate-400 dark:hover:border-slate-700 hover:shadow-lg shadow-sm transition-all group`}>
                          <div className="space-y-2">
                            <div className="flex items-start justify-between gap-2">
                              <h3 className="font-heading font-extrabold text-sm text-slate-900 dark:text-white leading-tight group-hover:text-emerald-600 dark:group-hover:text-emerald-300 transition-colors">
                                {set.title}
                              </h3>
                              <div className="flex items-center gap-1 shrink-0">
                                <span className="px-1.5 py-0.5 rounded-md dark:bg-slate-800 bg-slate-100 border dark:border-slate-700 border-slate-200 text-slate-600 dark:text-slate-300 text-[10px] font-mono font-bold">
                                  {set.levelBadge}
                                </span>
                                {isHot && (
                                  <span className="px-1.5 py-0.5 rounded-md bg-orange-500 text-white font-black text-[9px] uppercase flex items-center gap-0.5">
                                    <Flame className="w-2.5 h-2.5 fill-white" /> HOT
                                  </span>
                                )}
                              </div>
                            </div>

                            <div className="flex items-center justify-between text-[11px] text-slate-500 font-medium">
                              <span>Chưa luyện tập · {set.totalQuestions} câu</span>
                              <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">
                                {set.attemptsCount || 260} lượt
                              </span>
                            </div>

                            <div className="h-1 rounded-full dark:bg-slate-800 bg-slate-100 overflow-hidden">
                              <div className="h-full w-0 bg-emerald-500 rounded-full" />
                            </div>

                            <div className="flex items-center gap-1 pt-1 text-slate-400">
                              <button title="Xóa tiến độ" className="p-1.5 rounded-lg hover:bg-rose-500/15 hover:text-rose-500 transition-colors">
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                              <button title="Làm lại" className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-200 transition-colors">
                                <RotateCcw className="w-3.5 h-3.5" />
                              </button>
                              <button title="Đánh dấu sao" className="p-1.5 rounded-lg hover:bg-amber-500/15 hover:text-amber-500 transition-colors">
                                <Star className="w-3.5 h-3.5" />
                              </button>
                              <button title="Ghi chú" className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-200 transition-colors">
                                <FileText className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>

                          <button
                            onClick={() => navigate(`/grammar/${set._id}`)}
                            className="w-full py-2 rounded-xl border border-emerald-500/40 bg-emerald-500/10 hover:bg-emerald-500 hover:text-slate-950 hover:border-emerald-500 text-emerald-600 dark:text-emerald-400 font-extrabold text-xs flex items-center justify-center gap-1.5 transition-all active:scale-95"
                          >
                            <BookOpen className="w-3.5 h-3.5" />
                            <span>Luyện tập</span>
                          </button>
                        </div>
                      </VipLockOverlay>
                    );
                  })}
                </div>
              </div>
            )}

            {/* TAB: TIẾN ĐỘ NGỮ PHÁP TỔNG QUAN (15 CHỦ ĐIỂM · 1.843 CÂU) */}
            {grammarFilter === 'tiendo' && (() => {
              const allTopicsList = GRAMMAR_CATEGORIES.flatMap(cat => cat.topics);
              const statsWithProgress = allTopicsList.map(t => {
                const live = grammarList.find(g => g.slug === t.slug);
                const prog = practiceProgressMap[`grammar_${t.slug}`];
                return {
                  ...t,
                  total: live?.totalQuestions || t.total,
                  attempted: prog?.completedCount || 0,
                  correct: prog?.correctCount || 0,
                  wrong: (prog?.wrongQuestions?.length) || (prog?.wrongCount || 0)
                };
              });

              const totalQuestions = 1843;
              const totalAttempted = statsWithProgress.reduce((sum, t) => sum + (t.attempted || 0), 0);
              const totalCorrect = statsWithProgress.reduce((sum, t) => sum + (t.correct || 0), 0);
              const totalWrong = statsWithProgress.reduce((sum, t) => sum + (t.wrong || 0), 0);
              const overallPct = totalAttempted > 0 ? Math.round((totalAttempted / totalQuestions) * 100) : 0;
              const accuracyPct = totalAttempted > 0 ? Math.round((totalCorrect / totalAttempted) * 100) : 0;
              const circumference = 2 * Math.PI * 42;
              const dashOffset = circumference - (overallPct / 100) * circumference;

              return (
                <div className="space-y-6">
                  {/* Hero summary */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                    {/* Circle progress */}
                    <div className="dark:bg-slate-900 bg-white border dark:border-slate-800 border-slate-200 shadow-sm rounded-2xl p-6 flex flex-col items-center justify-center gap-3">
                      <svg width="100" height="100" viewBox="0 0 100 100" className="-rotate-90">
                        <circle cx="50" cy="50" r="42" fill="none" stroke="currentColor" className="text-slate-100 dark:text-slate-800" strokeWidth="8" />
                        <circle
                          cx="50" cy="50" r="42" fill="none"
                          stroke="#10b981" strokeWidth="8"
                          strokeLinecap="round"
                          strokeDasharray={circumference}
                          strokeDashoffset={dashOffset}
                          className="transition-all duration-1000"
                        />
                      </svg>
                      <div className="text-center -mt-16 mb-10">
                        <div className="text-3xl font-black text-slate-900 dark:text-white font-mono">{overallPct}%</div>
                        <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">Hoàn thành</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-black text-emerald-600 dark:text-emerald-400 font-mono">{totalAttempted.toLocaleString('vi-VN')}</div>
                        <div className="text-xs text-slate-500 dark:text-slate-400">/ {totalQuestions.toLocaleString('vi-VN')} câu đã làm</div>
                      </div>
                    </div>

                    {/* Stats cards */}
                    <div className="md:col-span-2 grid grid-cols-2 gap-4">
                      {[
                        { label: 'Câu đã làm', val: totalAttempted, icon: BookOpen, color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' },
                        { label: 'Độ chính xác', val: `${accuracyPct}%`, icon: CheckCircle2, color: 'text-cyan-600 dark:text-cyan-400', bg: 'bg-cyan-500/10', border: 'border-cyan-500/20' },
                        { label: 'Câu đúng', val: totalCorrect, icon: CheckCircle2, color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' },
                        { label: 'Câu sai', val: totalWrong, icon: XCircle, color: 'text-rose-600 dark:text-rose-400', bg: 'bg-rose-500/10', border: 'border-rose-500/20' }
                      ].map((s, i) => (
                        <div key={i} className={`${s.bg} ${s.border} border rounded-2xl p-4 flex flex-col gap-2 shadow-sm`}>
                          <s.icon className={`w-5 h-5 ${s.color}`} />
                          <div className={`text-2xl font-black font-mono ${s.color}`}>{typeof s.val === 'number' ? s.val.toLocaleString('vi-VN') : s.val}</div>
                          <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">{s.label}</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Per-topic progress table */}
                  <div className="dark:bg-slate-900 bg-white border dark:border-slate-800 border-slate-200 shadow-sm rounded-2xl overflow-hidden">
                    <div className="px-5 py-3.5 border-b dark:border-slate-800 border-slate-200 flex items-center gap-2">
                      <BarChart2 className="w-4 h-4 text-emerald-500 dark:text-emerald-400" />
                      <h3 className="font-heading font-extrabold text-sm text-slate-900 dark:text-white">Tiến độ 15 chuyên đề chuẩn Đậu TOEIC</h3>
                    </div>
                    <div className="divide-y dark:divide-slate-800/60 divide-slate-100">
                      {statsWithProgress.map((t, i) => {
                        const pct = t.total > 0 ? Math.round(((t.attempted || 0) / t.total) * 100) : 0;
                        const acc = (t.attempted || 0) > 0 ? Math.round(((t.correct || 0) / t.attempted) * 100) : 0;
                        return (
                          <div key={t.slug} className="px-5 py-3 grid grid-cols-12 items-center gap-3 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                            <div className="col-span-1 text-xs font-mono text-slate-400 font-bold">{String(i + 1).padStart(2, '0')}</div>
                            <div className="col-span-3 text-xs font-semibold text-slate-700 dark:text-slate-300 truncate">{t.title}</div>
                            <div className="col-span-4 flex items-center gap-2">
                              <div className="flex-1 h-1.5 rounded-full dark:bg-slate-800 bg-slate-100 overflow-hidden">
                                <div style={{ width: `${pct}%` }} className="h-full bg-emerald-500 rounded-full transition-all" />
                              </div>
                              <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400 w-8 text-right">{pct}%</span>
                            </div>
                            <div className="col-span-2 flex items-center gap-2 text-[11px] font-mono">
                              <span className="text-emerald-600 dark:text-emerald-400">{t.correct || 0}</span>
                              <span className="text-slate-400">/</span>
                              <span className="text-rose-600 dark:text-rose-400">{t.wrong || 0}</span>
                            </div>
                            <div className="col-span-2 text-right">
                              {(t.attempted || 0) > 0 ? (
                                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${acc >= 80 ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400' : acc >= 60 ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400' : 'bg-rose-500/15 text-rose-600 dark:text-rose-400'}`}>
                                  {acc}%
                                </span>
                              ) : (
                                <span className="text-[10px] text-slate-400 font-medium">Chưa học</span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              );
            })()}

          </div>
        )}

        {/* ========================================================================= */}
        {/* MODE 3: ĐỌC SONG NGỮ ANH-VIỆT (31 BÀI ĐỌC TRỌN BỘ 2 LEVELS ĐẬU TOEIC) */}
        {/* ========================================================================= */}
        {activeMode === 'bilingual' && (
          <div className="space-y-6 animate-fadeIn">
            
            {/* 2 Level Sub-tabs — Level 1 & Level 2 (giống Đậu TOEIC) */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2">
              {[
                { lvl: 1, label: 'Level 1', desc: 'Email, Thông báo, Bài đọc ngắn' },
                { lvl: 2, label: 'Level 2', desc: 'Bài đọc nâng cao, Thư tín, Báo cáo' },
              ].map((tab) => (
                <button
                  key={tab.lvl}
                  onClick={() => handleBilingualLevelChange(tab.lvl)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all flex items-center gap-2 shrink-0 ${
                    bilingualLevel === tab.lvl
                      ? 'bg-emerald-500/20 border-emerald-500 text-emerald-600 dark:text-emerald-400 shadow-md font-extrabold'
                      : 'dark:bg-slate-900 bg-white dark:border-slate-800 border-slate-200 dark:text-slate-400 text-slate-600 hover:text-slate-900 dark:hover:text-slate-200 shadow-sm'
                  }`}
                >
                  <span>{tab.label}</span>
                </button>
              ))}
            </div>

            {/* Article Cards Grid */}
            {loading ? (
              <div className="py-12 text-center text-slate-400 font-medium">Đang tải danh sách bài đọc song ngữ...</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {bilingualArticles.map((art, idx) => {
                  // FREE: 1 bài đầu tiên (idx === 0), PRO: idx > 0
                  const isLocked = !isProUser && idx > 0;
                  return (
                    <VipLockOverlay
                      key={art._id || idx}
                      isLocked={isLocked}
                      compact
                      onUnlockClick={() => setShowPricingModal(true)}
                      label="VIP — Mở khóa bài đọc"
                    >
                      <div 
                        className="rounded-3xl dark:bg-slate-900/60 bg-white border dark:border-slate-800 border-slate-200 p-6 space-y-4 flex flex-col justify-between hover:border-emerald-500/50 hover:shadow-xl shadow-sm transition-all"
                      >
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                              {art.articleCategory || art.bilingualArticle?.category || 'E-mail'} • {art.levelBadge || 'A2'}
                            </span>
                            <div className="flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400">
                              <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">
                                {art.attemptsCount || 215} lượt đọc
                              </span>
                              <div className="flex items-center gap-1">
                                <Clock className="w-3.5 h-3.5" />
                                <span>{art.readTime || '3 phút'}</span>
                              </div>
                            </div>
                          </div>

                          <h3 className="font-heading font-extrabold text-base text-slate-900 dark:text-white line-clamp-1">{art.title}</h3>
                          <p className="text-xs text-slate-600 dark:text-slate-400">
                            {art.questions?.length || art.bilingualArticle?.questions?.length || 4} câu hỏi đọc hiểu kèm audio & lời dịch
                          </p>
                        </div>

                        <button
                          onClick={() => navigate(`/reading/article/${art._id}?level=${bilingualLevel}`)}
                          className="w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-md active:scale-95"
                        >
                          <BookOpen className="w-3.5 h-3.5" />
                          <span>Đọc ngay</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </VipLockOverlay>
                  );
                })}
              </div>
            )}

          </div>
        )}

      </main>

      {/* VIP Upgrade Pricing Modal */}
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
                Xóa tiến độ bài học?
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
