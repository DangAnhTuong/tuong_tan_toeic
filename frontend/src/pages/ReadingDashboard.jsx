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

export default function ReadingDashboard() {
  usePageTitle(
    'Luyện Đọc TOEIC Part 5 6 7 — 13.622 Câu Hỏi ETS Có Giải Thích Chi Tiết',
    'Luyện thi TOEIC Reading toàn diện Part 5, Part 6 và Part 7 trọn bộ 5 level với mẹo 3 giây, giải thích ngữ pháp chi tiết tiếng Việt và dịch nghĩa từng câu.'
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
  const urlMode = searchParams.get('mode') || 'practice';
  const urlPart = searchParams.get('part') || 'Part 5';
  const urlSubTab = searchParams.get('subTab') || 'chudiem';
  const urlLevel = parseInt(searchParams.get('level'), 10) || 1;

  const [activeMode, setActiveMode] = useState(urlMode); // 'practice' | 'grammar' | 'bilingual'
  const [selectedPart, setSelectedPart] = useState(urlPart); // 'Part 5' | 'Part 6' | 'Part 7'
  const [grammarSubTab, setGrammarSubTab] = useState(urlSubTab); // 'chudiem' | 'tonghop' | 'capdo' | 'tiendo'
  const [bilingualLevel, setBilingualLevel] = useState(urlLevel); // 1 | 2 | 3 | 4 | 5
  const [searchTerm, setSearchTerm] = useState('');
  const [targetBand, setTargetBand] = useState('all'); // 'all' | '350-500' | '500-650' | '650-800' | '800-990'

  // Keep state synced on browser Back / Forward buttons
  useEffect(() => {
    const curMode = searchParams.get('mode') || 'practice';
    const curPart = searchParams.get('part') || 'Part 5';
    const curSubTab = searchParams.get('subTab') || 'chudiem';
    const curLevel = parseInt(searchParams.get('level'), 10) || 1;

    setActiveMode(curMode);
    setSelectedPart(curPart);
    setGrammarSubTab(curSubTab);
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
  const handleModeChange = (mode) => {
    setActiveMode(mode);
    setSearchParams({ mode, part: selectedPart, subTab: grammarSubTab, level: bilingualLevel }, { replace: true });
  };

  const handlePartChange = (part) => {
    setSelectedPart(part);
    setSearchParams({ mode: activeMode, part, subTab: grammarSubTab, level: bilingualLevel }, { replace: true });
  };

  const handleGrammarSubTabChange = (subTab) => {
    setGrammarSubTab(subTab);
    setSearchParams({ mode: activeMode, part: selectedPart, subTab, level: bilingualLevel }, { replace: true });
  };

  const handleBilingualLevelChange = (level) => {
    setBilingualLevel(level);
    setSearchParams({ mode: activeMode, part: selectedPart, subTab: grammarSubTab, level }, { replace: true });
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

  const defaultTotals = {
    'Part 5': [462, 462, 462, 462, 462],
    'Part 6': [248, 248, 248, 248, 244],
    'Part 7': [661, 782, 862, 901, 952]
  };

  const defaultAttempts = {
    'Part 5': [785, 492, 284, 142, 64],
    'Part 6': [458, 312, 194, 105, 42],
    'Part 7': [396, 264, 168, 86, 31]
  };

  const levelCards = [
    { 
      id: 1, 
      name: 'Level 1 — Dễ', 
      rate: 'Tỉ lệ sai 2% - 17%', 
      isPro: false, 
      completed: 0, 
      correct: 0, 
      wrong: 0, 
      total: levelData.find(e => e.level === 1)?.totalQuestions || defaultTotals[selectedPart]?.[0] || 462, 
      attempts: levelData.find(e => e.level === 1)?.attemptsCount || defaultAttempts[selectedPart]?.[0] || 785,
      color: 'emerald' 
    },
    { 
      id: 2, 
      name: 'Level 2 — Cơ bản', 
      rate: 'Tỉ lệ sai 17% - 27%', 
      isPro: false, 
      completed: 0, 
      correct: 0, 
      wrong: 0, 
      total: levelData.find(e => e.level === 2)?.totalQuestions || defaultTotals[selectedPart]?.[1] || 462, 
      attempts: levelData.find(e => e.level === 2)?.attemptsCount || defaultAttempts[selectedPart]?.[1] || 492,
      color: 'blue' 
    },
    { 
      id: 3, 
      name: 'Level 3 — Trung bình', 
      rate: 'Tỉ lệ sai 27% - 38%', 
      isPro: true, 
      completed: 0, 
      correct: 0, 
      wrong: 0, 
      total: levelData.find(e => e.level === 3)?.totalQuestions || defaultTotals[selectedPart]?.[2] || 462, 
      attempts: levelData.find(e => e.level === 3)?.attemptsCount || defaultAttempts[selectedPart]?.[2] || 284,
      color: 'amber' 
    },
    { 
      id: 4, 
      name: 'Level 4 — Khó', 
      rate: 'Tỉ lệ sai 38% - 51%', 
      isPro: true, 
      completed: 0, 
      correct: 0, 
      wrong: 0, 
      total: levelData.find(e => e.level === 4)?.totalQuestions || defaultTotals[selectedPart]?.[3] || 462, 
      attempts: levelData.find(e => e.level === 4)?.attemptsCount || defaultAttempts[selectedPart]?.[3] || 142,
      color: 'orange' 
    },
    { 
      id: 5, 
      name: 'Level 5 — Rất khó', 
      rate: 'Tỉ lệ sai 51% - 87%', 
      isPro: true, 
      completed: 0, 
      correct: 0, 
      wrong: 0, 
      total: levelData.find(e => e.level === 5)?.totalQuestions || defaultTotals[selectedPart]?.[4] || 462, 
      attempts: levelData.find(e => e.level === 5)?.attemptsCount || defaultAttempts[selectedPart]?.[4] || 64,
      color: 'rose' 
    }
  ];

  // Filter grammar by search
  const filteredGrammar = grammarList.filter(g => 
    g.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    (g.subTitle && g.subTitle.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="min-h-screen dark:bg-[#0b1120] bg-[#f8fafc] dark:text-slate-100 text-slate-900 flex flex-col font-sans pb-12 transition-colors duration-200">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* HERO BANNER READING */}
        <div className="relative overflow-hidden rounded-3xl glass-panel border dark:border-slate-800 border-slate-200 p-8 md:p-10 dark:bg-gradient-to-r dark:from-emerald-950/40 dark:via-[#0f172a] dark:to-[#0b1120] bg-gradient-to-r from-emerald-50 via-white to-teal-50/60 shadow-xl dark:shadow-2xl">
          <div className="absolute top-0 right-0 -mt-12 -mr-12 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
          
          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-3 text-center md:text-left">
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full dark:bg-emerald-500/10 bg-emerald-100 border dark:border-emerald-500/30 border-emerald-300 text-emerald-700 dark:text-emerald-400 text-xs font-bold uppercase tracking-wider">
                <BookOpen className="w-3.5 h-3.5" />
                <span>LUYỆN ĐỌC TOEIC TOÀN DIỆN</span>
              </div>
              <h1 className="text-3xl md:text-4xl font-extrabold font-heading dark:text-white text-slate-900 tracking-tight">
                Chinh phục <span className="text-emerald-600 dark:text-emerald-400">TOEIC Reading</span> từ dễ đến khó
              </h1>
              <p className="dark:text-slate-400 text-slate-600 text-sm max-w-xl">
                13.622 câu hỏi ETS Part 5–7 theo 5 cấp độ, 14 chuyên đề ngữ pháp trọng điểm (997 câu) và 31 bài đọc song ngữ Anh–Việt.
              </p>
            </div>

            {/* Target Score Selector in Hero */}
            <div className="flex flex-col items-center sm:items-end gap-2 shrink-0">
              <span className="text-[10px] font-bold dark:text-slate-400 text-slate-500 uppercase tracking-wider">Lọc Theo Mục Tiêu:</span>
              <div className="flex items-center gap-1.5 p-1 rounded-2xl dark:bg-slate-900 bg-white border dark:border-slate-800 border-slate-200 shadow-sm">
                {[
                  { id: 'all', label: 'Tất cả' },
                  { id: '350-500', label: '350-500' },
                  { id: '500-650', label: '500-650' },
                  { id: '650-800', label: '650-800' },
                  { id: '800-990', label: '800+' }
                ].map((band) => (
                  <button
                    key={band.id}
                    onClick={() => setTargetBand(band.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                      targetBand === band.id
                        ? 'bg-emerald-500 text-slate-950 font-extrabold shadow-md'
                        : 'dark:text-slate-400 text-slate-600 hover:text-emerald-600 dark:hover:text-white'
                    }`}
                  >
                    {band.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* 3 MAIN MODE TABS (Luyện đề vs Ngữ pháp vs Đọc song ngữ) */}
        <div className="flex items-center gap-3 border-b dark:border-slate-800 border-slate-200 pb-4 overflow-x-auto">
          {[
            { id: 'practice', label: '📄 Luyện đề', badge: '13.622 câu ETS' },
            { id: 'grammar', label: '📖 Ngữ pháp', badge: '14 chuyên đề' },
            { id: 'bilingual', label: '🔤 Đọc song ngữ', badge: '31 bài đọc' }
          ].map((mode) => (
            <button
              key={mode.id}
              onClick={() => handleModeChange(mode.id)}
              className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shrink-0 ${
                activeMode === mode.id
                  ? 'bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/20 font-extrabold'
                  : 'dark:bg-slate-900 bg-white border dark:border-slate-800 border-slate-200 dark:text-slate-400 text-slate-600 hover:text-emerald-600 dark:hover:text-white hover:border-emerald-500/40 shadow-sm'
              }`}
            >
              <span>{mode.label}</span>
              <span className={`px-1.5 py-0.5 rounded text-[10px] ${activeMode === mode.id ? 'bg-emerald-600 text-white' : 'dark:bg-slate-800 bg-slate-100 dark:text-slate-400 text-slate-600'}`}>
                {mode.badge}
              </span>
            </button>
          ))}
        </div>

        {/* ========================================================================= */}
        {/* MODE 1: LUYỆN ĐỀ (PART 5, 6, 7 & 5 LEVEL CARDS) */}
        {/* ========================================================================= */}
        {activeMode === 'practice' && (
          <div className="space-y-6 animate-fadeIn">
            
            {/* Part Sub-tabs */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {[
                  { part: 'Part 5', desc: 'Điền từ vào câu (2.430 câu)' },
                  { part: 'Part 6', desc: 'Điền đoạn văn (1.296 câu)' },
                  { part: 'Part 7', desc: 'Đọc hiểu đoạn văn (4.438 câu)' }
                ].map((item) => (
                  <button
                    key={item.part}
                    onClick={() => handlePartChange(item.part)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all ${
                      selectedPart === item.part
                        ? 'bg-emerald-500/20 border-emerald-500 text-emerald-600 dark:text-emerald-400 shadow-md font-extrabold'
                        : 'dark:bg-slate-900 bg-white dark:border-slate-800 border-slate-200 dark:text-slate-400 text-slate-600 hover:text-slate-900 dark:hover:text-slate-200 shadow-sm'
                    }`}
                  >
                    <span>{item.part}</span>
                    <span className="ml-1.5 text-[10px] opacity-70">({item.desc.split('(')[1]}</span>
                  </button>
                ))}
              </div>

              <div className="text-xs text-slate-500 dark:text-slate-400 font-medium hidden sm:block">
                Bộ đề ETS thật kèm giải thích và dịch nghĩa tiếng Việt 100%
              </div>
            </div>

            {/* 5 LEVEL PRACTICE CARDS GRID (4-column grid matching Dau TOEIC) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {levelCards.map((lvl) => {
                const isLocked = !isProUser && lvl.id > 1;
                const exKey = `reading_${selectedPart.replace(/\s+/g, '').toLowerCase()}_lv${lvl.id}`;
                const prog = practiceProgressMap[exKey];
                const completed = prog?.completedCount || 0;
                const correct = prog?.correctCount || 0;
                const wrong = prog?.wrongCount || 0;
                const wrongCount = (prog?.wrongQuestions?.length) || wrong;
                const total = lvl.total || 462;
                const percent = total > 0 ? Math.min(100, Math.round((completed / total) * 100)) : 0;

                return (
                  <VipLockOverlay
                    key={lvl.id}
                    isLocked={isLocked}
                    onUnlockClick={() => setShowPricingModal(true)}
                    label={`Level ${lvl.id} (VIP)`}
                  >
                    <div 
                      className="rounded-3xl dark:bg-slate-900/60 bg-white border dark:border-slate-800 border-slate-200 p-5 space-y-4 flex flex-col justify-between hover:border-emerald-500/50 hover:shadow-xl shadow-sm transition-all"
                    >
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                              <BookOpen className="w-4 h-4" />
                            </div>
                            <div>
                              <h3 className="font-heading font-extrabold text-sm text-slate-900 dark:text-white">{lvl.name}</h3>
                              <div className="flex items-center gap-2 mt-0.5">
                                <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">{lvl.rate}</span>
                                <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-500/10 px-1.5 py-0.2 rounded border border-emerald-500/20">
                                  {lvl.attempts} lượt làm
                                </span>
                              </div>
                            </div>
                          </div>

                          {lvl.isPro && (
                            <span className="px-2 py-0.5 rounded-full bg-amber-500/20 border border-amber-500/30 text-amber-500 dark:text-amber-300 font-bold text-[9px] uppercase flex items-center gap-1">
                              <Crown className="w-2.5 h-2.5" /> PRO
                            </span>
                          )}
                          {!isProUser && lvl.id === 1 && (
                            <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 font-black text-[9px] border border-emerald-500/30 flex items-center gap-1 shadow-sm">
                              <Sparkles className="w-2.5 h-2.5" /> Free 20 câu
                            </span>
                          )}
                        </div>

                        {/* Progress */}
                        <div className="space-y-1.5 pt-1">
                          <div className="flex items-center justify-between text-xs font-semibold">
                            <div className="flex items-center gap-2">
                              <span className="font-mono font-extrabold text-emerald-600 dark:text-emerald-400 text-sm">
                                {completed}/{total}
                              </span>
                              <span className="flex items-center gap-0.5 text-[11px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded">
                                <CheckCircle2 className="w-3 h-3" /> {correct}
                              </span>
                              <span className="flex items-center gap-0.5 text-[11px] font-bold text-rose-600 dark:text-rose-400 bg-rose-500/10 px-1.5 py-0.5 rounded">
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
                                navigate(`/read/practice/p${selectedPart.replace('Part ', '')}lv${lvl.id}?part=${encodeURIComponent(selectedPart)}&level=${lvl.id}&redo=true`);
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

                          {/* Luyện tập / Tiếp tục Button */}
                          <button
                            onClick={() => navigate(`/read/practice/p${selectedPart.replace('Part ', '')}lv${lvl.id}?part=${encodeURIComponent(selectedPart)}&level=${lvl.id}`)}
                            className="ml-auto shrink-0 whitespace-nowrap h-8 sm:h-8.5 px-3 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-sm shadow-emerald-600/20 flex items-center justify-center gap-1 transition-all active:scale-95 cursor-pointer"
                          >
                            <BookOpen className="w-3.5 h-3.5 shrink-0" />
                            <span>{completed > 0 ? (completed >= total ? 'Luyện lại' : 'Luyện tiếp') : 'Luyện tập'}</span>
                          </button>
                        </div>

                      </div>
                    </div>
                  </VipLockOverlay>
                );
              })}
            </div>

          </div>
        )}

        {/* ========================================================================= */}
        {/* MODE 2: NGỮ PHÁP — REBUILT EXACT MATCH ĐẬU TOEIC */}
        {/* ========================================================================= */}
        {activeMode === 'grammar' && (
          <div className="space-y-6 animate-fadeIn">

            {/* ── Sub-tabs (pill style giống Đậu TOEIC) ── */}
            <div className="flex items-center gap-2 dark:bg-slate-900/60 bg-white border dark:border-slate-800 border-slate-200 shadow-sm rounded-2xl p-1.5 w-fit">
              {[
                { id: 'chudiem', icon: '📖', label: 'Theo chủ điểm' },
                { id: 'tonghop', icon: '≡', label: 'Tổng hợp' },
                { id: 'capdo',   icon: '◎', label: 'Theo cấp độ' },
                { id: 'tiendo', icon: '📊', label: 'Tiến độ' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => handleGrammarSubTabChange(tab.id)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap ${
                    grammarSubTab === tab.id
                      ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/30 font-extrabold'
                      : 'dark:text-slate-400 text-slate-600 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <span className="text-sm leading-none">{tab.icon}</span>
                  <span>{tab.label}</span>
                </button>
              ))}
            </div>

            {/* ════════════════════════════════════════════
                SUBTAB 1: THEO CHỦ ĐIỂM — 14 chuyên đề
            ════════════════════════════════════════════ */}
            {grammarSubTab === 'chudiem' && (() => {
              // Color palette per topic (border-top accent colors)
              const topicColors = [
                { border: 'border-t-cyan-500',    icon: '🔤', badge: 'bg-cyan-500/15 text-cyan-500 dark:text-cyan-400 border-cyan-500/30' },
                { border: 'border-t-blue-500',    icon: '🏷️', badge: 'bg-blue-500/15 text-blue-500 dark:text-blue-400 border-blue-500/30' },
                { border: 'border-t-violet-500',  icon: '⚡', badge: 'bg-violet-500/15 text-violet-500 dark:text-violet-400 border-violet-500/30' },
                { border: 'border-t-rose-500',    icon: '🔄', badge: 'bg-rose-500/15 text-rose-500 dark:text-rose-400 border-rose-500/30' },
                { border: 'border-t-amber-500',   icon: '✨', badge: 'bg-amber-500/15 text-amber-500 dark:text-amber-400 border-amber-500/30' },
                { border: 'border-t-teal-500',    icon: '📌', badge: 'bg-teal-500/15 text-teal-500 dark:text-teal-400 border-teal-500/30' },
                { border: 'border-t-indigo-500',  icon: '👤', badge: 'bg-indigo-500/15 text-indigo-500 dark:text-indigo-400 border-indigo-500/30' },
                { border: 'border-t-orange-500',  icon: '⚖️', badge: 'bg-orange-500/15 text-orange-500 dark:text-orange-400 border-orange-500/30' },
                { border: 'border-t-lime-500',    icon: '🔗', badge: 'bg-lime-500/15 text-lime-600 dark:text-lime-400 border-lime-500/30' },
                { border: 'border-t-pink-500',    icon: '🔍', badge: 'bg-pink-500/15 text-pink-500 dark:text-pink-400 border-pink-500/30' },
                { border: 'border-t-emerald-500', icon: '📝', badge: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30' },
                { border: 'border-t-sky-500',     icon: '🎯', badge: 'bg-sky-500/15 text-sky-500 dark:text-sky-400 border-sky-500/30' },
                { border: 'border-t-fuchsia-500', icon: '📚', badge: 'bg-fuchsia-500/15 text-fuchsia-500 dark:text-fuchsia-400 border-fuchsia-500/30' },
                { border: 'border-t-yellow-500',  icon: '🏆', badge: 'bg-yellow-500/15 text-yellow-600 dark:text-yellow-400 border-yellow-500/30' }
              ];

              // Read progress from localStorage
              const getProgress = (topicId, total) => {
                try {
                  const raw = localStorage.getItem(`grammar_progress_${topicId}`);
                  if (raw) return JSON.parse(raw);
                } catch(_) {}
                return { attempted: 0, correct: 0, wrong: 0, total };
              };

              const filtered = grammarList.filter(g =>
                g.title.toLowerCase().includes(searchTerm.toLowerCase())
              );

              return (
                <div className="space-y-5">
                  {/* Header + Search */}
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-2.5">
                      <BookOpen className="w-5 h-5 text-emerald-500 dark:text-emerald-400" />
                      <h2 className="font-heading font-extrabold text-lg text-slate-900 dark:text-white">Các chủ đề ngữ pháp</h2>
                      <span className="px-2.5 py-0.5 rounded-full dark:bg-slate-800 bg-slate-100 border dark:border-slate-700 border-slate-200 text-slate-600 dark:text-slate-300 text-xs font-mono font-bold">
                        {filtered.length} / 14 chuyên đề
                      </span>
                    </div>
                    <div className="relative w-full sm:w-72">
                      <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Tìm kiếm chuyên đề..."
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl dark:bg-slate-900 bg-white border dark:border-slate-800 border-slate-200 text-xs font-medium text-slate-900 dark:text-white focus:border-emerald-500 outline-none placeholder:text-slate-400 dark:placeholder:text-slate-600 shadow-sm transition-colors"
                      />
                    </div>
                  </div>

                  {/* 4-column Grid (like Đậu TOEIC) */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {filtered.map((top, idx) => {
                      const isLocked = !isProUser && idx > 1;
                      const color = topicColors[idx % topicColors.length];
                      const prog = getProgress(top.grammarTopic || top._id, top.totalQuestions || 50);
                      const pct = prog.total > 0 ? Math.round((prog.attempted / prog.total) * 100) : 0;

                      return (
                        <VipLockOverlay
                          key={top._id || idx}
                          isLocked={isLocked}
                          compact
                          onUnlockClick={() => setShowPricingModal(true)}
                          label="VIP — Mở khóa chuyên đề"
                        >
                          <div className={`relative dark:bg-slate-900 bg-white rounded-2xl border dark:border-slate-800 border-slate-200 border-t-2 ${color.border} p-4 space-y-3 flex flex-col justify-between hover:border-slate-400 dark:hover:border-slate-700 hover:shadow-lg dark:hover:shadow-slate-900/50 shadow-sm transition-all group`}>
                            {/* Title row */}
                            <div className="space-y-2">
                              <div className="flex items-start justify-between gap-2">
                                <h3 className="font-heading font-extrabold text-sm text-slate-900 dark:text-white leading-tight group-hover:text-emerald-600 dark:group-hover:text-emerald-300 transition-colors">
                                  {top.title}
                                </h3>
                                {top.isPro && (
                                  <span className={`shrink-0 px-1.5 py-0.5 rounded-md border text-[9px] font-bold uppercase flex items-center gap-0.5 ${color.badge}`}>
                                    <Crown className="w-2.5 h-2.5" /> VIP
                                  </span>
                                )}
                              </div>

                              {/* Progress line */}
                              {prog.attempted > 0 ? (
                                <div className="flex items-center justify-between text-[11px] font-mono font-bold">
                                  <div className="flex items-center gap-2">
                                    <span className="text-slate-700 dark:text-slate-300">{prog.attempted}/{prog.total}</span>
                                    <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-0.5">
                                      <CheckCircle2 className="w-3 h-3" />{prog.correct}
                                    </span>
                                    <span className="text-rose-500 dark:text-rose-400 flex items-center gap-0.5">
                                      <XCircle className="w-3 h-3" />{prog.wrong}
                                    </span>
                                  </div>
                                  <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20 font-sans">
                                    {top.attemptsCount || 320} lượt
                                  </span>
                                </div>
                              ) : (
                                <div className="flex items-center justify-between text-[11px] text-slate-500 font-medium">
                                  <span>Chưa luyện tập · {top.totalQuestions} câu</span>
                                  <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">
                                    {top.attemptsCount || 320} lượt
                                  </span>
                                </div>
                              )}

                              {/* Progress bar */}
                              <div className="h-1 rounded-full dark:bg-slate-800 bg-slate-100 overflow-hidden">
                                <div
                                  style={{ width: `${pct}%` }}
                                  className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                                />
                              </div>
                            </div>

                            {/* Action icons row (exact match Đậu TOEIC: 🗑️ ↩️ ⭐ 📄) */}
                            <div className="flex items-center gap-1 pt-0.5">
                              <button
                                title="Xóa tiến độ"
                                onClick={(e) => { e.stopPropagation(); localStorage.removeItem(`grammar_progress_${top.grammarTopic || top._id}`); }}
                                className="p-1.5 rounded-lg hover:bg-rose-500/15 hover:text-rose-500 text-slate-400 transition-colors"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                              <button title="Làm lại từ đầu" className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-200 text-slate-400 transition-colors">
                                <RotateCcw className="w-3.5 h-3.5" />
                              </button>
                              <button title="Đánh dấu sao" className="p-1.5 rounded-lg hover:bg-amber-500/15 hover:text-amber-500 text-slate-400 transition-colors">
                                <Star className="w-3.5 h-3.5" />
                              </button>
                              <button title="Lý thuyết & Ghi chú" className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-200 text-slate-400 transition-colors">
                                <FileText className="w-3.5 h-3.5" />
                              </button>
                              <div className="flex-1" />
                              {prog.attempted > 0 && (
                                <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded-md border border-emerald-500/20">
                                  {pct}%
                                </span>
                              )}
                            </div>

                            {/* Luyện tập button */}
                            <button
                              onClick={() => navigate(`/grammar/${top._id || top.grammarTopic}`)}
                              className="w-full py-2 rounded-xl border border-emerald-500/40 bg-emerald-500/10 hover:bg-emerald-500 hover:text-slate-950 hover:border-emerald-500 text-emerald-400 font-extrabold text-xs flex items-center justify-center gap-1.5 transition-all active:scale-95"
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
              );
            })()}

            {/* ════════════════════════════════════════════
                SUBTAB 2: TỔNG HỢP — 9 bộ đề theo năm
            ════════════════════════════════════════════ */}
            {grammarSubTab === 'tonghop' && (
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
                            {/* Title + badges */}
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

                            {/* Progress bar (empty for now) */}
                            <div className="h-1 rounded-full dark:bg-slate-800 bg-slate-100 overflow-hidden">
                              <div className="h-full w-0 bg-emerald-500 rounded-full" />
                            </div>

                            {/* Action icons */}
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

            {/* ════════════════════════════════════════════
                SUBTAB 3: THEO CẤP ĐỘ — Level 1-5 (Giống Đậu TOEIC)
            ════════════════════════════════════════════ */}
            {grammarSubTab === 'capdo' && (
              <div className="space-y-5">
                <div className="flex items-center gap-2.5">
                  <BarChart2 className="w-5 h-5 text-emerald-500 dark:text-emerald-400" />
                  <h2 className="font-heading font-extrabold text-lg text-slate-900 dark:text-white">Ngữ pháp theo cấp độ</h2>
                  <span className="px-2.5 py-0.5 rounded-full dark:bg-slate-800 bg-slate-100 border dark:border-slate-700 border-slate-200 text-slate-600 dark:text-slate-300 text-xs font-mono font-bold">5 cấp độ</span>
                </div>

                {/* Level cards grid — giống Đậu TOEIC */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
                  {[
                    { id: 1, label: 'Level 1 — Dễ',       score: '350–500',  total: 200, isPro: false, color: 'emerald', borderC: 'border-t-emerald-500', bg: 'bg-emerald-500/10', text: 'text-emerald-600 dark:text-emerald-400', navId: '6a8f9ed81d7ebd47d4702b27' },
                    { id: 2, label: 'Level 2 — Cơ bản',   score: '500–600',  total: 200, isPro: true,  color: 'cyan',    borderC: 'border-t-cyan-500',    bg: 'bg-cyan-500/10',    text: 'text-cyan-600 dark:text-cyan-400',    navId: '6a8f9ed91d7ebd47d4702d5b' },
                    { id: 3, label: 'Level 3 — Trung bình', score: '600–700', total: 200, isPro: true,  color: 'blue',    borderC: 'border-t-blue-500',    bg: 'bg-blue-500/10',    text: 'text-blue-600 dark:text-blue-400',    navId: '6a8f9ed91d7ebd47d4703079' },
                    { id: 4, label: 'Level 4 — Khó',      score: '700–850',  total: 200, isPro: true,  color: 'amber',   borderC: 'border-t-amber-500',   bg: 'bg-amber-500/10',   text: 'text-amber-600 dark:text-amber-400',   navId: '6a8f9ed91d7ebd47d4703379' },
                    { id: 5, label: 'Level 5 — Rất khó',  score: '850–990',  total: 200, isPro: true,  color: 'rose',    borderC: 'border-t-rose-500',    bg: 'bg-rose-500/10',    text: 'text-rose-600 dark:text-rose-400',    navId: '6a8f9eda1d7ebd47d470363b' }
                  ].map((lvl) => {
                    const isLocked = !isProUser && lvl.isPro;
                    // Read progress
                    let prog = { attempted: 0, correct: 0, wrong: 0, total: lvl.total };
                    try {
                      const raw = localStorage.getItem(`grammar_level_progress_${lvl.id}`);
                      if (raw) prog = { ...prog, ...JSON.parse(raw) };
                    } catch(_) {}
                    const pct = prog.total > 0 ? Math.round((prog.attempted / prog.total) * 100) : 0;

                    return (
                      <VipLockOverlay
                        key={lvl.id}
                        isLocked={isLocked}
                        compact
                        onUnlockClick={() => setShowPricingModal(true)}
                        label="VIP — Mở khóa cấp độ"
                      >
                        <div className={`dark:bg-slate-900 bg-white rounded-2xl border dark:border-slate-800 border-slate-200 border-t-2 ${lvl.borderC} p-4 space-y-3 flex flex-col hover:border-slate-400 dark:hover:border-slate-700 hover:shadow-lg shadow-sm transition-all group`}>
                          {/* Header */}
                          <div className="flex items-start justify-between gap-1">
                            <h3 className="font-heading font-extrabold text-sm text-slate-900 dark:text-white leading-tight group-hover:text-emerald-600 dark:group-hover:text-emerald-300 transition-colors">
                              {lvl.label}
                            </h3>
                            {lvl.isPro && (
                              <span className="shrink-0 px-1.5 py-0.5 rounded-md bg-amber-500/20 border border-amber-500/30 text-amber-500 dark:text-amber-300 text-[9px] font-bold uppercase flex items-center gap-0.5">
                                <Crown className="w-2.5 h-2.5" /> PRO
                              </span>
                            )}
                          </div>

                          {/* Stats */}
                          {prog.attempted > 0 ? (
                            <div className="flex items-center gap-2 text-[11px] font-mono font-bold">
                              <span className="text-slate-700 dark:text-slate-300">{prog.attempted}/{prog.total}</span>
                              <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-0.5"><CheckCircle2 className="w-3 h-3" />{prog.correct}</span>
                              <span className="text-rose-500 dark:text-rose-400 flex items-center gap-0.5"><XCircle className="w-3 h-3" />{prog.wrong}</span>
                            </div>
                          ) : (
                            <p className="text-[11px] text-slate-500 font-medium">Chưa luyện tập · {lvl.total} câu</p>
                          )}

                          {/* Score range badge */}
                          <span className={`inline-block w-fit px-2 py-0.5 rounded-md text-[10px] font-bold border ${lvl.bg} ${lvl.text} border-current/20`}>
                            {lvl.score}
                          </span>

                          {/* Progress bar */}
                          <div className="h-1 rounded-full dark:bg-slate-800 bg-slate-100 overflow-hidden">
                            <div style={{ width: `${pct}%` }} className={`h-full rounded-full transition-all duration-500 bg-${lvl.color}-500`} />
                          </div>

                          {/* Action icons (giống Đậu TOEIC: 🔖 □ 🗑️) */}
                          <div className="flex items-center gap-1 text-slate-400">
                            <button title="Đánh dấu" className="p-1.5 rounded-lg hover:bg-amber-500/15 hover:text-amber-500 transition-colors">
                              <Star className="w-3.5 h-3.5" />
                            </button>
                            <button title="Làm lại" className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-200 transition-colors">
                              <RotateCcw className="w-3.5 h-3.5" />
                            </button>
                            <button
                              title="Xóa tiến độ"
                              onClick={(e) => { e.stopPropagation(); localStorage.removeItem(`grammar_level_progress_${lvl.id}`); }}
                              className="p-1.5 rounded-lg hover:bg-rose-500/15 hover:text-rose-500 transition-colors"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          {/* Luyện tập button */}
                          <button
                            onClick={() => navigate(`/grammar/${lvl.navId}`)}
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

                {/* Mô tả hệ thống */}
                <div className="dark:bg-slate-900/60 bg-white border dark:border-slate-800 border-slate-200 shadow-sm rounded-2xl px-5 py-4 flex flex-col sm:flex-row items-start sm:items-center gap-4">
                  <div className="flex items-center gap-2 shrink-0">
                    <BarChart2 className="w-4 h-4 text-emerald-500 dark:text-emerald-400" />
                    <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">Hệ thống 5 cấp độ</span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                    Câu hỏi được sắp xếp từ dễ đến khó dựa trên tỉ lệ sai thực tế của hàng nghìn thí sinh TOEIC. Mỗi cấp độ có khoảng 200 câu Part 5 ETS thật với giải thích chi tiết tiếng Việt.
                  </p>
                </div>
              </div>
            )}



            {/* ════════════════════════════════════════════
                SUBTAB 4: TIẾN ĐỘ — Dashboard tổng quát
            ════════════════════════════════════════════ */}
            {grammarSubTab === 'tiendo' && (() => {
              // Aggregate from localStorage
              const allTopics = [
                { id: 'basic-grammar', title: 'Kiến thức cơ bản', total: 50 },
                { id: 'nouns', title: 'Danh từ', total: 62 },
                { id: 'verbs', title: 'Động từ', total: 45 },
                { id: 'passive-active', title: 'Câu bị động', total: 20 },
                { id: 'adjectives', title: 'Tính từ', total: 45 },
                { id: 'adverbs', title: 'Trạng từ', total: 48 },
                { id: 'pronouns', title: 'Đại từ', total: 50 },
                { id: 'comparisons', title: 'Câu so sánh', total: 38 },
                { id: 'conjunctions-prepositions', title: 'Liên từ/Giới từ', total: 24 },
                { id: 'relative-clauses', title: 'Mệnh đề quan hệ', total: 40 },
                { id: 'word-forms', title: 'Bài tập từ loại', total: 50 },
                { id: 'mixed-verbs', title: 'Động từ hỗn hợp', total: 30 },
                { id: 'mixed-grammar', title: 'Ngữ pháp tổng hợp', total: 60 },
                { id: 'real-exam', title: 'Đề thi thật', total: 435 }
              ];

              const statsWithProgress = allTopics.map(t => {
                try {
                  const raw = localStorage.getItem(`grammar_progress_${t.id}`);
                  if (raw) {
                    const p = JSON.parse(raw);
                    return { ...t, ...p };
                  }
                } catch(_) {}
                return { ...t, attempted: 0, correct: 0, wrong: 0 };
              });

              const totalQuestions = 997;
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
                        <div className="text-xs text-slate-500 dark:text-slate-400">/ {totalQuestions} câu đã làm</div>
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
                      <h3 className="font-heading font-extrabold text-sm text-slate-900 dark:text-white">Tiến độ từng chuyên đề</h3>
                    </div>
                    <div className="divide-y dark:divide-slate-800/60 divide-slate-100">
                      {statsWithProgress.map((t, i) => {
                        const pct = t.total > 0 ? Math.round(((t.attempted || 0) / t.total) * 100) : 0;
                        const acc = (t.attempted || 0) > 0 ? Math.round(((t.correct || 0) / t.attempted) * 100) : 0;
                        return (
                          <div key={t.id} className="px-5 py-3 grid grid-cols-12 items-center gap-3 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
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

                  {/* Reset all progress button */}
                  {totalAttempted > 0 && (
                    <div className="flex justify-end">
                      <button
                        onClick={() => {
                          allTopics.forEach(t => localStorage.removeItem(`grammar_progress_${t.id}`));
                          window.location.reload();
                        }}
                        className="px-4 py-2 rounded-xl border border-rose-500/30 bg-rose-500/10 text-rose-600 dark:text-rose-400 hover:bg-rose-500/20 text-xs font-bold flex items-center gap-1.5 transition-all"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>Reset toàn bộ tiến độ ngữ pháp</span>
                      </button>
                    </div>
                  )}

                  {/* Empty state */}
                  {totalAttempted === 0 && (
                    <div className="text-center py-10 text-slate-400">
                      <BookOpen className="w-10 h-10 mx-auto mb-3 opacity-30" />
                      <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Chưa có tiến độ nào.</p>
                      <p className="text-xs mt-1 text-slate-500">Bắt đầu luyện tập từ tab <strong className="text-emerald-600 dark:text-emerald-400">Theo chủ điểm</strong> để xem thống kê tại đây.</p>
                    </div>
                  )}
                </div>
              );
            })()}

          </div>
        )}



        {/* ========================================================================= */}
        {/* MODE 3: ĐỌC SONG NGỮ ANH-VIỆT (75 BÀI ĐỌC TRỌN BỘ 5 LEVELS) */}
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
