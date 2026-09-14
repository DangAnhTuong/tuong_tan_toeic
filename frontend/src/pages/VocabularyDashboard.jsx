import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Navbar from '../components/Navbar';
import VocabWordListModal from '../components/VocabWordListModal';
import { 
  BookOpen, 
  Sparkles, 
  Play, 
  Gamepad2, 
  Clock, 
  CheckCircle2, 
  Plus, 
  Crown, 
  ArrowRight, 
  Flame, 
  RotateCcw,
  Target,
  ChevronRight,
  Eye,
  Layers,
  Zap,
  Award,
  Brain,
  ShieldAlert,
  Volume2,
  Calendar,
  Settings,
  Search,
  Check,
  TrendingUp,
  BarChart2,
  Bookmark,
  FolderHeart,
  Lightbulb,
  HelpCircle,
  Clock4,
  RefreshCw,
  Trash2,
  X
} from 'lucide-react';
import axios from 'axios';

import VipLockOverlay from '../components/VipLockOverlay';
import PricingModal from '../components/PricingModal';
import { useAuth } from '../context/AuthContext';
import usePageTitle from '../hooks/usePageTitle';
import { 
  removeWordFromBasket, 
  getBasketWordsSync,
  getUserDecks,
  deleteUserDeck,
  addWordToBasket,
  addWordsToBasket
} from '../services/vocabBasketService';

import { getStoredUser, setStoredUser } from '../utils/auth';

export default function VocabularyDashboard() {
  usePageTitle(
    'Từ Vựng TOEIC Spaced Repetition — 84 Chủ Đề Chuẩn ETS Kèm Cyber Neon Games',
    'Học từ vựng TOEIC thông minh với thuật toán lặp lại ngắt quãng SM-2, phiên âm IPA, audio bản ngữ và 2 web game Cyber Neon Bắn Pháo Vũ Trụ & Ghép Cặp.'
  );

  const { user, requireAuth, isPro: authIsPro, refreshProfile } = useAuth();
  const currentUserId = user?._id || user?.id || user?.userId || user?.email || 'guest';
  const rawNavigate = useNavigate();
  const navigate = (to, options) => {
    if (typeof to === 'string' && (to.startsWith('/vocabulary/learn') || to.startsWith('/vocabulary/review'))) {
      return requireAuth(to);
    }
    return rawNavigate(to, options);
  };
  const [searchParams, setSearchParams] = useSearchParams();
  
  // URL Params Synchronization (Tab 1: learn, Tab 2: progress, Tab 3: my-words, Tab 4: algorithm)
  const initialTab = searchParams.get('tab') || 'learn';
  const initialSubTab = searchParams.get('sub') || '600_vocab';
  
  const [activeTab, setActiveTab] = useState(initialTab);
  const [activeSubTab, setActiveSubTab] = useState(initialSubTab);
  const [searchTerm, setSearchTerm] = useState('');

  // Keep state synced on browser Back / Forward buttons
  useEffect(() => {
    const curTab = searchParams.get('tab') || 'learn';
    const curSub = searchParams.get('sub') || '600_vocab';
    setActiveTab(curTab);
    setActiveSubTab(curSub);
  }, [searchParams]);
  
  // Data States
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTopicForModal, setSelectedTopicForModal] = useState(null);
  const [isWordListModalOpen, setIsWordListModalOpen] = useState(false);
  const [isProUser, setIsProUser] = useState(() => {
    const stored = getStoredUser();
    return Boolean(stored?.isPro || stored?.role === 'admin' || authIsPro);
  });
  const [showPricingModal, setShowPricingModal] = useState(false);

  useEffect(() => {
    if (authIsPro) setIsProUser(true);
  }, [authIsPro]);

  // Sync profile VIP status
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

  // User Stats & Goals State
  const [dailyGoal, setDailyGoal] = useState(20);
  const [isGoalModalOpen, setIsGoalModalOpen] = useState(false);
  const [userStats, setUserStats] = useState({
    dueCount: 0,
    newWordsCount: 0,
    masteredCount: 0,
    totalWords: 0,
    todayLearned: 0,
    streakDays: 0,
    stages: { level1: 0, level2: 0, level3: 0, level4: 0, level5: 0 }
  });

  // Saved Words State for Tab 3 (My Words)
  const [savedWords, setSavedWords] = useState([]);
  const [myWordsFilter, setMyWordsFilter] = useState('all'); // 'all' | 'due' | 'new' | 'mastered'
  const [userDecks, setUserDecks] = useState([]);
  const [myWordsSubTab, setMyWordsSubTab] = useState('decks'); // 'decks' | 'curated'
  const [activeDeckFilter, setActiveDeckFilter] = useState('all');
  const [openDeckMenu, setOpenDeckMenu] = useState(null);
  const [showNewDeckModal, setShowNewDeckModal] = useState(false);
  const [newDeckTitle, setNewDeckTitle] = useState('');
  const [showAddWordModal, setShowAddWordModal] = useState(false);
  const [targetDeckForWord, setTargetDeckForWord] = useState('');
  const [wordForm, setWordForm] = useState({ word: '', meaning: '', phonetic: '', example: '' });
  const [showImportModal, setShowImportModal] = useState(false);
  const [targetDeckForImport, setTargetDeckForImport] = useState('');
  const [importText, setImportText] = useState('');

  const displayedWords = React.useMemo(() => {
    return savedWords.filter(w => {
      if (activeDeckFilter !== 'all') {
        const deck = (w.deckName || 'Giỏ từ vựng cá nhân').trim().toLowerCase();
        if (deck !== activeDeckFilter.trim().toLowerCase()) return false;
      }
      if (myWordsFilter === 'due') return Boolean(w.isDue);
      if (myWordsFilter === 'mastered') return Boolean(w.isMastered);
      return true;
    });
  }, [savedWords, myWordsFilter, activeDeckFilter]);

  // Sync with URL params
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setSearchParams({ tab, sub: activeSubTab }, { replace: true });
  };

  const handleSubTabChange = (sub) => {
    setActiveSubTab(sub);
    setSearchParams({ tab: activeTab, sub }, { replace: true });
  };

  // Fetch Topics based on Sub-Tab in Tab 1
  useEffect(() => {
    async function fetchTopics() {
      setLoading(true);
      try {
        const res = await axios.get(`/api/v1/vocab/topics?category=${activeSubTab}`);
        if (res.data && res.data.data) {
          setTopics(res.data.data);
        }
      } catch (err) {
        console.warn('Failed to load topics:', err.message);
      } finally {
        setLoading(false);
      }
    }

    if (activeTab === 'learn') {
      fetchTopics();
    }
  }, [activeTab, activeSubTab]);

  // Fetch User Summary Stats for Tab 2 & 3
  const fetchSummary = async () => {
    try {
      const [dueRes, summaryRes, profileRes, myWordsRes] = await Promise.allSettled([
        axios.get('/api/v1/vocab/due-reviews'),
        axios.get('/api/v1/vocab/summary'),
        axios.get('/api/v1/user/profile'),
        axios.get('/api/v1/vocab/my-words')
      ]);

      let allList = [];
      if (myWordsRes.status === 'fulfilled' && myWordsRes.value.data?.data) {
        allList = myWordsRes.value.data.data;
      }

      // Merge with sync basket for guest/offline words
      const localBasket = getBasketWordsSync();
      const map = new Map();
      [...allList, ...localBasket.map(b => ({
        ...b,
        isDue: true,
        repetitionCount: b.repetitionCount || 1,
        status: 'learning'
      }))].forEach(item => {
        if (item && item.word) map.set(item.word.toLowerCase(), item);
      });
      const mergedList = Array.from(map.values());
      setSavedWords(mergedList);

      try {
        const decks = await getUserDecks();
        setUserDecks(decks || []);
      } catch (err) {}

      let summary = { 
        totalLearned: mergedList.length, 
        totalMastered: 0, 
        dueCount: mergedList.filter(w => w.isDue).length, 
        stages: { level1: 0, level2: 0, level3: 0, level4: 0, level5: 0 } 
      };
      if (summaryRes.status === 'fulfilled' && summaryRes.value.data?.summary) {
        summary = summaryRes.value.data.summary;
      }

      let streak = 0;
      let todayCount = 0;
      if (profileRes.status === 'fulfilled' && profileRes.value.data?.data) {
        const u = profileRes.value.data.data;
        streak = u.streakDays || 0;
        todayCount = u.todayProgress?.vocab || 0;
      }

      const totalWordsCount = summary.totalLearned || mergedList.length;
      const masteredWordsCount = summary.totalMastered || 0;
      const newWords = mergedList.filter(w => !w.repetitionCount || w.repetitionCount === 0);
      const newWordsCount = mergedList.length > 0 ? newWords.length : Math.max(0, totalWordsCount - masteredWordsCount);

      setUserStats({
        dueCount: summary.dueCount !== undefined ? summary.dueCount : mergedList.filter(w => w.isDue).length,
        newWordsCount: newWordsCount,
        masteredCount: masteredWordsCount,
        totalWords: totalWordsCount,
        todayLearned: todayCount,
        streakDays: streak,
        stages: summary.stages || { level1: 0, level2: 0, level3: 0, level4: 0, level5: 0 }
      });
    } catch (e) {
      console.warn('Failed to load summary stats:', e.message);
    }
  };

  useEffect(() => {
    fetchSummary();
    const handleUpdate = () => fetchSummary();
    window.addEventListener('vocab_basket_updated', handleUpdate);
    return () => window.removeEventListener('vocab_basket_updated', handleUpdate);
  }, []);

  const subTabs = [
    { id: '600_vocab', label: '600 TỪ VỰNG TOEIC (50)', count: 50 },
    { id: 'test_2023', label: 'Đề 2023 (10)', count: 10 },
    { id: 'test_2024', label: 'Đề 2024 (10)', count: 10 },
    { id: 'test_2026', label: 'Đề 2026 (10)', count: 10 },
    { id: 'toeic_master', label: 'TOEIC MASTER (3)', count: 3 }
  ];

  const filteredTopics = topics.filter(t => 
    t.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (t.tagLabel && t.tagLabel.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="min-h-screen dark:bg-slate-950 bg-[#f8fafc] dark:text-slate-100 text-slate-900 flex flex-col font-sans pb-16 transition-colors duration-200">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* HERO BANNER (EXACT MATCH WITH DAU TOEIC VOCABULARY) */}
        <div className="relative overflow-hidden rounded-3xl glass-panel border dark:border-slate-800 border-slate-200 p-8 md:p-10 dark:bg-gradient-to-r dark:from-emerald-950/40 dark:via-slate-900 dark:to-slate-950 bg-gradient-to-r from-emerald-50 via-white to-teal-50/60 shadow-xl dark:shadow-2xl">
          <div className="absolute top-0 right-0 -mt-12 -mr-12 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
          
          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-3 text-center md:text-left">
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full dark:bg-emerald-500/10 bg-emerald-100 border dark:border-emerald-500/30 border-emerald-300 text-emerald-700 dark:text-emerald-400 text-xs font-bold uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Spaced Repetition System</span>
              </div>
              <h1 className="text-3xl md:text-4xl font-extrabold font-heading dark:text-white text-slate-900 tracking-tight">
                Chinh phục <span className="text-emerald-600 dark:text-emerald-400">Từ vựng TOEIC</span>
              </h1>
              <p className="dark:text-slate-400 text-slate-600 text-sm max-w-xl leading-relaxed">
                Học theo phương pháp lặp lại ngắt quãng — đẩy đúng từ vào đúng thời điểm não sắp quên. Nhớ lâu, tốn ít công sức.
              </p>
            </div>

            {/* Right Book Icon Visual matching Dau TOEIC */}
            <div className="hidden md:flex w-24 h-24 rounded-3xl bg-gradient-to-br from-emerald-500 to-teal-700 items-center justify-center shadow-2xl shadow-emerald-500/20 shrink-0 border border-emerald-400/30">
              <BookOpen className="w-12 h-12 text-slate-950 fill-slate-950" />
            </div>
          </div>
        </div>

        {/* 4 MAIN NAVIGATION TABS (Học | Tiến độ | Từ vựng của tôi | Thuật toán học từ) */}
        <div className="flex items-center gap-3 border-b dark:border-slate-800 border-slate-200 pb-4 overflow-x-auto">
          {[
            { id: 'learn', label: '📖 Học', badge: '83 bộ từ' },
            { id: 'progress', label: '📊 Tiến độ', badge: 'Mục tiêu ngày' },
            { id: 'my-words', label: '📁 Từ vựng của tôi', badge: `${userStats.dueCount} đến hạn` },
            { id: 'algorithm', label: '⚙️ Thuật toán học từ', badge: 'SM-2' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id)}
              className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shrink-0 ${
                activeTab === tab.id
                  ? 'bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/20 font-extrabold'
                  : 'dark:bg-slate-900 bg-white border dark:border-slate-800 border-slate-200 dark:text-slate-400 text-slate-600 hover:text-emerald-600 dark:hover:text-white hover:border-emerald-500/40 shadow-sm'
              }`}
            >
              <span>{tab.label}</span>
              <span className={`px-1.5 py-0.5 rounded text-[10px] ${activeTab === tab.id ? 'bg-emerald-600 text-white' : 'dark:bg-slate-800 bg-slate-100 dark:text-slate-400 text-slate-600'}`}>
                {tab.badge}
              </span>
            </button>
          ))}
        </div>

        {/* ========================================================================= */}
        {/* TAB 1: HỌC (5 SUB-TABS: 600 TỪ, ĐỀ 2023, ĐỀ 2024, ĐỀ 2026, MASTER) */}
        {/* ========================================================================= */}
        {activeTab === 'learn' && (
          <div className="space-y-6 animate-fadeIn">
            
            {/* 5 Sub-tabs Pills */}
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <div className="flex items-center gap-2 overflow-x-auto pb-1">
                {subTabs.map((sub) => (
                  <button
                    key={sub.id}
                    onClick={() => handleSubTabChange(sub.id)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all shrink-0 ${
                      activeSubTab === sub.id
                        ? 'dark:bg-emerald-500/20 bg-emerald-600 dark:border-emerald-500 border-emerald-600 text-white dark:text-emerald-400 shadow-md font-extrabold'
                        : 'dark:bg-slate-900 bg-slate-100 dark:border-slate-800 border-slate-200 dark:text-slate-400 text-slate-600 hover:text-slate-900 dark:hover:text-slate-200'
                    }`}
                  >
                    <span>{sub.label}</span>
                  </button>
                ))}
              </div>

              {/* Search Bar */}
              <div className="relative w-full sm:w-64">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Tìm chủ đề từ vựng..."
                  className="w-full pl-10 pr-4 py-2 rounded-xl dark:bg-slate-900 bg-white dark:border-slate-800 border-slate-200 text-xs font-medium dark:text-white text-slate-900 focus:border-emerald-500 outline-none shadow-sm"
                />
              </div>
            </div>

            {/* TOPIC CARDS GRID (3 COLUMNS LIKE DAU TOEIC) */}
            {loading ? (
              <div className="py-16 text-center text-slate-400 font-medium animate-pulse">
                Đang tải danh sách chủ đề từ vựng...
              </div>
            ) : filteredTopics.length === 0 ? (
              <div className="py-16 text-center text-slate-400">
                Không tìm thấy chủ đề nào phù hợp.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredTopics.map((top, idx) => {
                  const total = top.words?.length || top.totalCount || 12;
                  let localCount = 0;
                  try {
                    const saved = localStorage.getItem(`tuongtan_completed_words_${currentUserId}_${top._id}`);
                    if (saved) {
                      const list = JSON.parse(saved);
                      if (Array.isArray(list)) localCount = list.length;
                    }
                  } catch (e) {}
                  const learned = Math.max(top.learnedCount || 0, localCount);
                  // FREE: 600_vocab -> 6 topics dau (idx < 6), cac tab khac -> 1 topic dau (idx < 1)
                  const isLocked = !isProUser && (activeSubTab === '600_vocab' ? idx >= 6 : idx >= 1);

                  return (
                    <VipLockOverlay
                      key={top._id || idx}
                      isLocked={isLocked}
                      compact
                      onUnlockClick={() => setShowPricingModal(true)}
                      label={`VIP — Mở khóa bộ từ`}
                    >
                      <div 
                        className="glass-card rounded-3xl dark:border-slate-800 border-slate-200 p-6 space-y-4 flex flex-col justify-between hover:border-emerald-500/50 hover:shadow-xl transition-all dark:bg-slate-900/60 bg-white shadow-sm"
                      >
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="px-2.5 py-0.5 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-[10px] font-mono font-bold uppercase">
                              {top.tagLabel || '600 TỪ VỰNG TOEIC'}
                            </span>

                            {top.isPro && (
                              <span className="px-2 py-0.5 rounded-md bg-amber-500/20 border border-amber-500/30 text-amber-600 dark:text-amber-300 font-bold text-[9px] uppercase flex items-center gap-1">
                                <Crown className="w-2.5 h-2.5" /> PRO
                              </span>
                            )}
                          </div>

                          <h3 className="font-heading font-extrabold text-base dark:text-white text-slate-900 line-clamp-1">
                            {top.title}
                          </h3>

                          <p className="text-xs font-medium font-mono">
                            {learned > 0 ? (
                              <span className="text-emerald-600 dark:text-emerald-400 font-bold">{learned}/{total}</span>
                            ) : (
                              <span className="dark:text-slate-400 text-slate-500">{total} từ vựng</span>
                            )}
                          </p>
                        </div>

                        {/* 3 Action Buttons Row: [👁️ Xem từ] [📖 Học] [🎮 Chơi] */}
                        <div className="grid grid-cols-3 gap-2 pt-2">
                          <button
                            onClick={() => requireAuth(`/vocabulary/learn/${top._id}?tab=view`)}
                            className="py-2 px-2 rounded-xl dark:bg-slate-900 bg-slate-100 dark:border-slate-800 border-slate-200 hover:border-slate-300 dark:hover:border-slate-700 dark:text-slate-300 text-slate-700 hover:text-slate-900 dark:hover:text-white font-bold text-[11px] flex items-center justify-center gap-1 transition-all active:scale-95 shadow-sm"
                          >
                            <Eye className="w-3.5 h-3.5 text-slate-400" />
                            <span>Xem từ</span>
                          </button>

                          <button
                            onClick={() => requireAuth(`/vocabulary/learn/${top._id}?tab=learn&study=flashcard`)}
                            className="py-2 px-2 rounded-xl dark:bg-emerald-500/10 bg-emerald-50 hover:bg-emerald-100 dark:hover:bg-emerald-500 border dark:border-emerald-500/30 border-emerald-200 text-emerald-700 dark:text-emerald-400 hover:text-emerald-900 dark:hover:text-slate-950 font-bold text-[11px] flex items-center justify-center gap-1 transition-all shadow-sm active:scale-95"
                          >
                            <BookOpen className="w-3.5 h-3.5" />
                            <span>Học</span>
                          </button>

                          <button
                            onClick={() => requireAuth(`/vocabulary/learn/${top._id}?tab=play&game=blast`)}
                            className="py-2 px-2 rounded-xl dark:bg-purple-500/10 bg-purple-50 hover:bg-purple-100 dark:hover:bg-purple-500 border dark:border-purple-500/30 border-purple-200 text-purple-700 dark:text-purple-400 hover:text-purple-900 dark:hover:text-white font-bold text-[11px] flex items-center justify-center gap-1 transition-all shadow-sm active:scale-95"
                          >
                            <Gamepad2 className="w-3.5 h-3.5" />
                            <span>Chơi</span>
                          </button>
                        </div>
                      </div>
                    </VipLockOverlay>
                  );
                })}
              </div>
            )}

          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 2: TIẾN ĐỘ (GOAL, SRS STAGES, HEATMAP) */}
        {/* ========================================================================= */}
        {activeTab === 'progress' && (
          <div className="space-y-8 animate-fadeIn">
            
            {/* Top Goals Card */}
            <div className="glass-panel rounded-3xl border dark:border-slate-800 border-slate-200 p-6 space-y-6 dark:bg-slate-900/60 bg-white shadow-sm">
              <div className="flex items-center justify-between border-b dark:border-slate-800 border-slate-200 pb-4">
                <div className="flex items-center gap-2">
                  <Target className="w-5 h-5 text-emerald-500 dark:text-emerald-400" />
                  <h2 className="font-heading font-extrabold text-base dark:text-white text-slate-900">Mục tiêu hôm nay</h2>
                </div>
                <button 
                  onClick={() => setIsGoalModalOpen(true)}
                  title="Cài đặt mục tiêu"
                  className="p-2 rounded-xl dark:bg-slate-900 bg-slate-100 border dark:border-slate-800 border-slate-200 hover:text-emerald-500 text-slate-500 transition-colors"
                >
                  <Settings className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Due for Review */}
                <div className="p-6 rounded-2xl dark:bg-slate-900/60 bg-slate-50 border dark:border-slate-800/80 border-slate-200 space-y-3">
                  <div className="flex items-center gap-2 dark:text-slate-400 text-slate-500 text-xs font-semibold">
                    <Clock className="w-4 h-4 text-emerald-500 dark:text-emerald-400" />
                    <span>Ôn tập</span>
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-extrabold font-mono dark:text-white text-slate-900">{userStats.dueCount}</span>
                    <span className="text-xs dark:text-slate-400 text-slate-500">từ</span>
                  </div>
                  <p className="text-[11px] text-slate-400">Không giới hạn</p>
                </div>

                {/* New Words Goal */}
                <div className="p-6 rounded-2xl dark:bg-slate-900/60 bg-slate-50 border dark:border-slate-800/80 border-slate-200 space-y-3">
                  <div className="flex items-center gap-2 dark:text-slate-400 text-slate-500 text-xs font-semibold">
                    <BookOpen className="w-4 h-4 text-sky-500 dark:text-blue-400" />
                    <span>Từ mới</span>
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-extrabold font-mono dark:text-white text-slate-900">{userStats.todayLearned}</span>
                    <span className="text-xs dark:text-slate-400 text-slate-500">/{dailyGoal} từ</span>
                  </div>
                  <div className="space-y-1">
                    <div className="h-2 rounded-full dark:bg-slate-950 bg-slate-200 overflow-hidden border dark:border-slate-800 border-slate-300">
                      <div 
                        style={{ width: `${Math.min(100, Math.round((userStats.todayLearned / dailyGoal) * 100))}%` }}
                        className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full"
                      />
                    </div>
                    <p className="text-[10px] text-right dark:text-slate-400 text-slate-500 font-mono">
                      {Math.min(100, Math.round((userStats.todayLearned / dailyGoal) * 100))}% hoàn thành
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* SRS 5 Stages Distribution */}
            <div className="glass-panel rounded-3xl border dark:border-slate-800 border-slate-200 p-6 space-y-6 dark:bg-slate-900/60 bg-white shadow-sm">
              <div className="flex items-center gap-2 border-b dark:border-slate-800 border-slate-200 pb-4">
                <Brain className="w-5 h-5 text-purple-500 dark:text-purple-400" />
                <h2 className="font-heading font-extrabold text-base dark:text-white text-slate-900">Phân bổ theo Cấp độ nhớ (SRS)</h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                {[
                  { level: 1, name: 'Mới học', days: '1 lần', count: userStats.stages?.level1 || 0, color: 'border-rose-500/40 text-rose-500 dark:text-rose-400 bg-rose-500/10' },
                  { level: 2, name: 'Ghi nhớ ngắn', days: '2-3 ngày', count: userStats.stages?.level2 || 0, color: 'border-orange-500/40 text-orange-500 dark:text-orange-400 bg-orange-500/10' },
                  { level: 3, name: 'Đang củng cố', days: '7-14 ngày', count: userStats.stages?.level3 || 0, color: 'border-amber-500/40 text-amber-600 dark:text-amber-300 bg-amber-500/10' },
                  { level: 4, name: 'Thuộc lòng', days: '1 tháng', count: userStats.stages?.level4 || 0, color: 'border-blue-500/40 text-blue-500 dark:text-blue-400 bg-blue-500/10' },
                  { level: 5, name: 'Vĩnh viễn', days: '3+ tháng', count: userStats.stages?.level5 || 0, color: 'border-emerald-500/40 text-emerald-600 dark:text-emerald-400 bg-emerald-500/10' }
                ].map((s) => (
                  <div key={s.level} className="p-4 rounded-2xl dark:bg-slate-900 bg-slate-50 border dark:border-slate-800 border-slate-200 space-y-2 shadow-sm">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${s.color}`}>
                      Cấp độ {s.level}
                    </span>
                    <h4 className="font-bold text-sm dark:text-white text-slate-900">{s.name}</h4>
                    <div className="flex items-baseline justify-between pt-1">
                      <span className="text-xl font-mono font-extrabold dark:text-white text-slate-900">{s.count}</span>
                      <span className="text-[10px] dark:text-slate-400 text-slate-500">Chu kỳ: {s.days}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Streak & Activity Heatmap */}
            <div className="glass-panel rounded-3xl border border-slate-800 p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <div className="flex items-center gap-2">
                  <Flame className="w-5 h-5 text-orange-400" />
                  <h2 className="font-heading font-extrabold text-base text-white">Chuỗi ngày học liên tục (Streak)</h2>
                </div>
                <span className="px-3 py-1 rounded-full bg-orange-500/20 text-orange-400 border border-orange-500/30 text-xs font-mono font-bold">
                  🔥 {userStats.streakDays} ngày liên tiếp
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Hãy duy trì việc ôn tập từ vựng ít nhất 10 phút mỗi ngày để củng cố trí nhớ dài hạn.
              </p>
            </div>

          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 3: TỪ VỰNG CỦA TÔI (DUAL-TRACK VOCABULARY ARCHITECTURE - CHUẨN ĐẬU TOEIC) */}
        {/* ========================================================================= */}
        {activeTab === 'my-words' && (
          <div className="space-y-6 animate-fadeIn">
            
            {/* 1. Header with Title, Description & "+ Tạo mới" (Matching Screenshot 2) */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b dark:border-slate-800/80 border-slate-200/80">
              <div>
                <h1 className="text-2xl sm:text-3xl font-heading font-extrabold dark:text-white text-slate-900 tracking-tight">
                  Từ vựng của tôi
                </h1>
                <p className="text-xs sm:text-sm dark:text-slate-400 text-slate-600 mt-0.5">
                  Tạo và quản lý bộ từ vựng riêng
                </p>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => setShowNewDeckModal(true)}
                  className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-slate-950 font-bold text-xs sm:text-sm flex items-center gap-1.5 shadow-lg shadow-sky-500/20 active:scale-95 transition-all cursor-pointer"
                >
                  <Plus className="w-4 h-4 stroke-[3]" />
                  <span>+ Tạo mới</span>
                </button>
              </div>
            </div>

            {/* 2. Sub-tab Pills (Matching Screenshot 2: [ 📖 Học phần (X) ]  [ 📁 Bộ từ vựng (Y) ]) */}
            <div className="flex items-center gap-2 border-b dark:border-slate-800/80 border-slate-200/80 pb-3">
              <button
                onClick={() => setMyWordsSubTab('decks')}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-heading font-extrabold transition-all cursor-pointer ${
                  myWordsSubTab === 'decks'
                    ? 'bg-sky-500/15 border border-sky-500/40 text-sky-600 dark:text-sky-300 shadow-sm'
                    : 'dark:bg-slate-900/60 bg-slate-100 dark:text-slate-400 text-slate-600 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <BookOpen className="w-4 h-4 text-sky-500" />
                <span>Học phần</span>
                <span className="px-1.5 py-0.2 rounded-md bg-sky-500/20 text-sky-600 dark:text-sky-300 text-xs font-mono font-black">
                  {userDecks.length}
                </span>
              </button>

              <button
                onClick={() => setMyWordsSubTab('curated')}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-heading font-extrabold transition-all cursor-pointer ${
                  myWordsSubTab === 'curated'
                    ? 'bg-amber-500/15 border border-amber-500/40 text-amber-600 dark:text-amber-300 shadow-sm'
                    : 'dark:bg-slate-900/60 bg-slate-100 dark:text-slate-400 text-slate-600 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <FolderHeart className="w-4 h-4 text-amber-500" />
                <span>Bộ từ vựng</span>
                <span className="px-1.5 py-0.2 rounded-md bg-amber-500/20 text-amber-600 dark:text-amber-300 text-xs font-mono font-black">
                  5
                </span>
              </button>
            </div>

            {/* ========================================================================= */}
            {/* SUB-TAB A: HỌC PHẦN (CÁC BỘ TỰ ĐỘNG TẠO TỪ ĐỀ THI / ĐỌC / NGHE / TRA TỪ) */}
            {/* ========================================================================= */}
            {myWordsSubTab === 'decks' && (
              <div className="space-y-6">
                
                {/* Super Review Hero Card */}
                <div className="glass-panel rounded-3xl border border-emerald-500/30 p-6 sm:p-8 bg-gradient-to-br from-emerald-950/30 via-slate-900 to-slate-950 space-y-5">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                      ✨ TỔNG ÔN SRS
                    </span>
                    <span className="text-xs dark:text-slate-400 text-slate-500">
                      Gom từ tất cả học phần & bộ từ vựng
                    </span>
                  </div>

                  <div className="space-y-1.5 max-w-2xl">
                    <h2 className="text-xl sm:text-2xl font-extrabold font-heading text-white">
                      Học tất cả từ vựng của tôi
                    </h2>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      Một phiên duy nhất, gom toàn bộ từ bạn đã lưu từ tất cả các phần (Part 1-7, Đề thi, Nghe, Đọc, Tra từ). Hệ thống tự ưu tiên từ <strong className="text-amber-400">đến hạn ôn</strong> trước, rồi đến <strong className="text-emerald-400">từ mới</strong>.
                    </p>
                  </div>

                  {/* Indicators Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                    <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 space-y-1">
                      <span className="text-[10px] font-bold uppercase">🔥 ĐẾN HẠN ÔN</span>
                      <div className="text-xl sm:text-2xl font-extrabold font-mono text-white">{userStats.dueCount}</div>
                    </div>

                    <div className="p-3.5 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-400 space-y-1">
                      <span className="text-[10px] font-bold uppercase">➕ TỪ MỚI</span>
                      <div className="text-xl sm:text-2xl font-extrabold font-mono text-white">{userStats.newWordsCount}</div>
                    </div>

                    <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 space-y-1">
                      <span className="text-[10px] font-bold uppercase">🏆 ĐÃ THUỘC</span>
                      <div className="text-xl sm:text-2xl font-extrabold font-mono text-white">{userStats.masteredCount}</div>
                    </div>

                    <div className="p-3.5 rounded-2xl bg-slate-800/80 border border-slate-700/80 text-slate-300 space-y-1">
                      <span className="text-[10px] font-bold uppercase">📚 TỔNG CỘNG</span>
                      <div className="text-xl sm:text-2xl font-extrabold font-mono text-white">{userStats.totalWords}</div>
                    </div>
                  </div>

                  {/* Big Start Button */}
                  <div className="pt-1">
                    <button
                      onClick={() => requireAuth('/vocabulary/review?tab=learn&study=flashcard')}
                      className="px-6 py-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-extrabold text-sm flex items-center gap-2.5 shadow-xl shadow-emerald-500/25 transition-all active:scale-95 cursor-pointer"
                    >
                      <BookOpen className="w-4 h-4" />
                      <span>Bắt đầu học ngay →</span>
                    </button>
                  </div>
                </div>

                {/* 3. Grid of Deck Cards (Exact Đậu TOEIC Screenshot 2) */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-heading font-extrabold text-base dark:text-white text-slate-900 flex items-center gap-2">
                      <BookOpen className="w-4 h-4 text-sky-500" />
                      <span>Danh sách học phần ({userDecks.length})</span>
                    </h3>
                  </div>

                  {userDecks.length === 0 ? (
                    <div className="glass-panel p-8 rounded-3xl border border-dashed dark:border-slate-800 border-slate-300 text-center space-y-3 dark:bg-slate-900/40 bg-white">
                      <BookOpen className="w-10 h-10 text-slate-500 mx-auto stroke-1" />
                      <div className="space-y-1">
                        <p className="font-bold text-sm dark:text-white text-slate-800">Chưa có học phần nào</p>
                        <p className="text-xs dark:text-slate-400 text-slate-500 max-w-md mx-auto">
                          Khi bạn bôi đen tra từ hoặc bấm "Lưu vào giỏ" trong lúc luyện đề Part 1 - 7, hệ thống sẽ tự động tạo học phần tương ứng (ví dụ: <span className="font-mono text-sky-400 font-bold">Part 5 Test 1 2023</span>).
                        </p>
                      </div>
                      <button
                        onClick={() => setShowNewDeckModal(true)}
                        className="px-4 py-2 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 text-xs font-bold transition-all"
                      >
                        + Tạo học phần đầu tiên
                      </button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                      {userDecks.map((deck) => (
                        <div 
                          key={deck.deckName}
                          className="glass-panel p-5 rounded-3xl border dark:border-slate-800 border-slate-200 dark:bg-slate-900/70 bg-white flex flex-col justify-between space-y-4 hover:border-sky-500/50 hover:shadow-lg transition-all group"
                        >
                          <div className="space-y-2.5">
                            <div className="flex items-center justify-between">
                              <span className="px-2.5 py-0.5 rounded-lg bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-500/20 text-[11px] font-extrabold flex items-center gap-1.5">
                                <BookOpen className="w-3 h-3" />
                                <span>Học phần</span>
                              </span>

                              <div className="relative">
                                <button
                                  onClick={() => setOpenDeckMenu(openDeckMenu === deck.deckName ? null : deck.deckName)}
                                  className="p-1 rounded-lg text-slate-400 hover:text-slate-100 transition-colors"
                                >
                                  •••
                                </button>
                                {openDeckMenu === deck.deckName && (
                                  <div className="absolute right-0 top-7 z-30 w-44 py-1.5 rounded-2xl dark:bg-slate-950 bg-white border dark:border-slate-800 border-slate-200 shadow-2xl text-xs font-semibold space-y-1 animate-in fade-in zoom-in-95">
                                    <button
                                      onClick={() => {
                                        setOpenDeckMenu(null);
                                        setActiveDeckFilter(activeDeckFilter === deck.deckName ? 'all' : deck.deckName);
                                      }}
                                      className="w-full text-left px-3.5 py-2 hover:bg-slate-800 text-slate-300 flex items-center gap-2"
                                    >
                                      <Eye className="w-3.5 h-3.5 text-sky-400" />
                                      <span>{activeDeckFilter === deck.deckName ? 'Hiện tất cả' : 'Lọc từ học phần này'}</span>
                                    </button>
                                    <button
                                      onClick={async () => {
                                        setOpenDeckMenu(null);
                                        if (window.confirm(`Bạn có chắc muốn xóa toàn bộ học phần "${deck.deckName}"?`)) {
                                          await deleteUserDeck(deck.deckName);
                                          await fetchSummary();
                                        }
                                      }}
                                      className="w-full text-left px-3.5 py-2 hover:bg-rose-500/10 text-rose-400 flex items-center gap-2"
                                    >
                                      <Trash2 className="w-3.5 h-3.5 text-rose-400" />
                                      <span>Xóa học phần</span>
                                    </button>
                                  </div>
                                )}
                              </div>
                            </div>

                            <h3 className="font-heading font-extrabold text-base sm:text-lg dark:text-white text-slate-900 tracking-tight">
                              {deck.deckName}
                            </h3>

                            <div className="flex items-center gap-2 text-xs dark:text-slate-400 text-slate-600 font-medium flex-wrap">
                              <span>📖 {deck.totalCount} từ</span>
                              <span>•</span>
                              <span className="text-emerald-500 font-bold">✓ {deck.learnedCount !== undefined ? deck.learnedCount : deck.masteredCount} đã học</span>
                              {deck.masteredCount > 0 && (
                                <>
                                  <span>•</span>
                                  <span className="text-teal-400 font-bold">🏆 {deck.masteredCount} đã thuộc</span>
                                </>
                              )}
                              {deck.dueCount > 0 && (
                                <>
                                  <span>•</span>
                                  <span className="text-amber-500 font-bold">🔥 {deck.dueCount} đến hạn</span>
                                </>
                              )}
                            </div>

                            {/* Progress bar */}
                            <div className="space-y-1.5 pt-1">
                              <div className="flex items-center justify-between text-[11px] font-mono">
                                <span className="dark:text-slate-400 text-slate-500">Tiến độ:</span>
                                <span className="text-sky-500 font-bold">{deck.progress || 0}%</span>
                              </div>
                              <div className="w-full h-2 rounded-full dark:bg-slate-800 bg-slate-200 overflow-hidden">
                                <div 
                                  className="h-full bg-gradient-to-r from-sky-500 to-teal-400 rounded-full transition-all duration-300"
                                  style={{ width: `${Math.min(100, Math.max(0, deck.progress || 0))}%` }}
                                />
                              </div>
                            </div>
                          </div>

                          {/* Action Buttons Row (Exact Đậu TOEIC: [ + Thêm từ ] [ ⇪ Import ] [ Luyện tập > ]) */}
                          <div className="flex items-center justify-between gap-2 pt-3 border-t dark:border-slate-800/80 border-slate-100">
                            <div className="flex items-center gap-1.5">
                              <button
                                onClick={() => {
                                  setTargetDeckForWord(deck.deckName);
                                  setShowAddWordModal(true);
                                }}
                                className="px-2.5 py-1.5 rounded-xl dark:bg-slate-800 bg-slate-100 hover:dark:bg-slate-700 hover:bg-slate-200 text-slate-300 text-[11px] font-bold transition-all cursor-pointer flex items-center gap-1"
                              >
                                <Plus className="w-3 h-3 stroke-[3]" />
                                <span>Thêm từ</span>
                              </button>
                              <button
                                onClick={() => {
                                  setTargetDeckForImport(deck.deckName);
                                  setShowImportModal(true);
                                }}
                                className="px-2.5 py-1.5 rounded-xl dark:bg-slate-800 bg-slate-100 hover:dark:bg-slate-700 hover:bg-slate-200 text-slate-300 text-[11px] font-bold transition-all cursor-pointer flex items-center gap-1"
                              >
                                <span>⇪ Import</span>
                              </button>
                            </div>

                            <button
                              onClick={() => requireAuth(`/vocabulary/review?source=deck&name=${encodeURIComponent(deck.deckName)}&tab=learn&study=flashcard`)}
                              className="text-xs font-bold text-sky-400 hover:text-sky-300 flex items-center gap-1 cursor-pointer group-hover:translate-x-0.5 transition-transform"
                            >
                              <span>Luyện tập</span>
                              <ChevronRight className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* 4. Words Table filtered by deck or all */}
                <div className="glass-panel rounded-3xl border dark:border-slate-800 border-slate-200 p-6 space-y-4 dark:bg-slate-900/60 bg-white shadow-sm">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b dark:border-slate-800 border-slate-200 pb-4">
                    <div className="space-y-0.5">
                      <h3 className="font-heading font-extrabold text-base dark:text-white text-slate-900 flex items-center gap-2">
                        <FolderHeart className="w-5 h-5 text-rose-500" />
                        <span>Danh sách từ vựng đã lưu ({displayedWords.length})</span>
                      </h3>
                      {activeDeckFilter !== 'all' && (
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-sky-400 font-bold">Đang lọc theo: {activeDeckFilter}</span>
                          <button
                            onClick={() => setActiveDeckFilter('all')}
                            className="text-[11px] text-slate-400 hover:text-white underline"
                          >
                            (Hiện tất cả)
                          </button>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-2 flex-wrap">
                      {userDecks.length > 1 && (
                        <select
                          value={activeDeckFilter}
                          onChange={(e) => setActiveDeckFilter(e.target.value)}
                          className="px-3 py-1.5 rounded-xl text-xs font-bold border dark:bg-slate-900 bg-white dark:border-slate-800 border-slate-200 text-slate-300"
                        >
                          <option value="all">Tất cả học phần</option>
                          {userDecks.map(d => (
                            <option key={d.deckName} value={d.deckName}>{d.deckName} ({d.totalCount})</option>
                          ))}
                        </select>
                      )}

                      {['all', 'due', 'mastered'].map((filter) => (
                        <button
                          key={filter}
                          onClick={() => setMyWordsFilter(filter)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                            myWordsFilter === filter
                              ? 'bg-emerald-500 text-slate-950 border-emerald-500 font-extrabold shadow-sm'
                              : 'dark:bg-slate-900 bg-slate-100 dark:border-slate-800 border-slate-200 dark:text-slate-400 text-slate-600 hover:text-slate-900 dark:hover:text-white'
                          }`}
                        >
                          {filter === 'all' ? 'Tất cả' : filter === 'due' ? 'Đến hạn' : 'Đã thuộc'}
                        </button>
                      ))}
                    </div>
                  </div>

                  {displayedWords.length === 0 ? (
                    <div className="py-12 text-center dark:text-slate-400 text-slate-500 text-xs">
                      {myWordsFilter === 'all' 
                        ? 'Chưa có từ vựng nào trong giỏ ôn tập. Hãy học bài hoặc lưu từ khi luyện đề!'
                        : myWordsFilter === 'due' 
                        ? 'Hiện tại không có từ nào đến hạn ôn tập!'
                        : 'Chưa có từ nào đạt trạng thái đã thuộc!'}
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {displayedWords.map((w, idx) => (
                        <div key={idx} className="p-4 rounded-2xl dark:bg-slate-900 bg-slate-50 border dark:border-slate-800 border-slate-200 flex items-center justify-between gap-4 shadow-sm">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-bold text-sm dark:text-white text-slate-900">{w.word}</span>
                              {w.phonetic && <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400">{w.phonetic}</span>}
                              {w.deckName && (
                                <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-sky-500/10 text-sky-400 border border-sky-500/30">
                                  {w.deckName}
                                </span>
                              )}
                              {w.isDue && (
                                <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-500/10 text-amber-500 border border-amber-500/30 uppercase">
                                  Đến hạn
                                </span>
                              )}
                              {w.isMastered && (
                                <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-emerald-500/10 text-emerald-500 border border-emerald-500/30 uppercase">
                                  Đã thuộc
                                </span>
                              )}
                            </div>
                            <p className="text-xs dark:text-slate-400 text-slate-600">{w.meaning}</p>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            <span className="px-2 py-1 rounded-lg dark:bg-slate-800 bg-slate-200 dark:text-slate-300 text-slate-700 text-[10px] font-mono">
                              Lặp {w.repetitionCount || 1} lần
                            </span>
                            <button
                              onClick={async () => {
                                await removeWordFromBasket(w.word);
                                setSavedWords(prev => prev.filter(item => item.word?.toLowerCase() !== w.word?.toLowerCase()));
                              }}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 transition-colors cursor-pointer"
                              title="Xóa khỏi giỏ từ"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

              </div>
            )}

            {/* ========================================================================= */}
            {/* SUB-TAB B: BỘ TỪ VỰNG (CÁC BỘ TỪ HỆ THỐNG VÀ BỘ CHỦ ĐỀ) */}
            {/* ========================================================================= */}
            {myWordsSubTab === 'curated' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {[
                    { id: '600_vocab', title: '600 Từ Vựng TOEIC Căn Bản', total: 600, tag: 'Cốt lõi' },
                    { id: 'test_2026', title: 'Từ Vựng Đề Thi Thật ETS 2026', total: 450, tag: 'Hot 2026' },
                    { id: 'test_2024', title: 'Từ Vựng Đề Thi Thật ETS 2024', total: 420, tag: 'ETS 2024' },
                    { id: 'test_2023', title: 'Từ Vựng Đề Thi Thật ETS 2023', total: 380, tag: 'ETS 2023' },
                    { id: 'toeic_master', title: 'TOEIC Master Siêu Cấp 800+', total: 300, tag: 'Nâng cao' }
                  ].map((set) => (
                    <div 
                      key={set.id}
                      className="glass-panel p-5 rounded-3xl border dark:border-slate-800 border-slate-200 dark:bg-slate-900/70 bg-white flex flex-col justify-between space-y-4 hover:border-amber-500/50 hover:shadow-lg transition-all"
                    >
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="px-2.5 py-0.5 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 text-[11px] font-extrabold">
                            📁 Bộ từ vựng
                          </span>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-800 text-slate-300">
                            {set.tag}
                          </span>
                        </div>

                        <h3 className="font-heading font-extrabold text-base sm:text-lg dark:text-white text-slate-900 tracking-tight">
                          {set.title}
                        </h3>

                        <p className="text-xs dark:text-slate-400 text-slate-600">
                          Bộ từ vựng chuẩn hóa kèm âm thanh US/UK, câu ví dụ song ngữ và hình ảnh minh họa.
                        </p>
                      </div>

                      <div className="flex items-center justify-between pt-3 border-t dark:border-slate-800/80 border-slate-100">
                        <span className="text-xs font-mono font-bold dark:text-slate-400 text-slate-600">
                          {set.total} từ vựng
                        </span>
                        <button
                          onClick={() => {
                            setActiveTab('learn');
                            setActiveSubTab(set.id);
                          }}
                          className="px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-md shadow-amber-500/20 transition-all cursor-pointer"
                        >
                          <span>Xem chi tiết</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* MODAL 1: TẠO HỌC PHẦN MỚI */}
            {showNewDeckModal && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fadeIn">
                <div className="w-full max-w-md glass-panel p-6 rounded-3xl border dark:border-slate-700 border-slate-300 dark:bg-slate-900 bg-white space-y-5 shadow-2xl">
                  <div className="flex items-center justify-between border-b dark:border-slate-800 border-slate-200 pb-3">
                    <h3 className="font-heading font-extrabold text-base dark:text-white text-slate-900 flex items-center gap-2">
                      <BookOpen className="w-4 h-4 text-sky-400" />
                      <span>Tạo học phần mới</span>
                    </h3>
                    <button 
                      onClick={() => setShowNewDeckModal(false)}
                      className="p-1 rounded-lg text-slate-400 hover:text-white"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <form 
                    onSubmit={async (e) => {
                      e.preventDefault();
                      if (!newDeckTitle.trim()) return;
                      const clean = newDeckTitle.trim();
                      try {
                        await addWordToBasket({
                          word: 'start',
                          meaning: `Khởi đầu học phần ${clean}`,
                          pos: 'v.',
                          phonetic: '/stɑːrt/'
                        }, clean, 'new_deck');
                        await fetchSummary();
                        setNewDeckTitle('');
                        setShowNewDeckModal(false);
                      } catch(err) {}
                    }}
                    className="space-y-4"
                  >
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold dark:text-slate-300 text-slate-700">
                        Tên học phần:
                      </label>
                      <input
                        type="text"
                        placeholder="Ví dụ: Part 5 Test 1 2023, ETS 2026 Test 2..."
                        value={newDeckTitle}
                        onChange={(e) => setNewDeckTitle(e.target.value)}
                        className="w-full px-4 py-2.5 rounded-xl border dark:bg-slate-950 bg-white dark:border-slate-800 border-slate-300 text-sm font-medium focus:ring-2 focus:ring-sky-500 focus:outline-none"
                        autoFocus
                        required
                      />
                    </div>

                    <div className="flex items-center justify-end gap-2 pt-2">
                      <button
                        type="button"
                        onClick={() => setShowNewDeckModal(false)}
                        className="px-4 py-2 rounded-xl border dark:border-slate-800 border-slate-300 text-xs font-bold text-slate-400 hover:text-white"
                      >
                        Hủy
                      </button>
                      <button
                        type="submit"
                        className="px-5 py-2 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 text-xs font-bold transition-all shadow-md shadow-sky-500/20"
                      >
                        Tạo học phần
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            {/* MODAL 2: THÊM TỪ VÀO HỌC PHẦN */}
            {showAddWordModal && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fadeIn">
                <div className="w-full max-w-md glass-panel p-6 rounded-3xl border dark:border-slate-700 border-slate-300 dark:bg-slate-900 bg-white space-y-5 shadow-2xl">
                  <div className="flex items-center justify-between border-b dark:border-slate-800 border-slate-200 pb-3">
                    <h3 className="font-heading font-extrabold text-base dark:text-white text-slate-900 flex items-center gap-2">
                      <Plus className="w-4 h-4 text-emerald-400" />
                      <span>Thêm từ vào "{targetDeckForWord}"</span>
                    </h3>
                    <button 
                      onClick={() => setShowAddWordModal(false)}
                      className="p-1 rounded-lg text-slate-400 hover:text-white"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <form 
                    onSubmit={async (e) => {
                      e.preventDefault();
                      if (!wordForm.word.trim() || !wordForm.meaning.trim()) return;
                      try {
                        await addWordToBasket({
                          word: wordForm.word.trim(),
                          meaning: wordForm.meaning.trim(),
                          phonetic: wordForm.phonetic.trim(),
                          exampleEn: wordForm.example.trim(),
                          exampleVi: '',
                          pos: 'n.'
                        }, targetDeckForWord, 'manual_add');
                        await fetchSummary();
                        setWordForm({ word: '', meaning: '', phonetic: '', example: '' });
                        setShowAddWordModal(false);
                      } catch(err) {}
                    }}
                    className="space-y-3.5"
                  >
                    <div className="space-y-1">
                      <label className="text-xs font-bold dark:text-slate-300 text-slate-700">Từ tiếng Anh (*):</label>
                      <input
                        type="text"
                        placeholder="Ví dụ: encourage"
                        value={wordForm.word}
                        onChange={(e) => setWordForm(prev => ({ ...prev, word: e.target.value }))}
                        className="w-full px-3.5 py-2 rounded-xl border dark:bg-slate-950 bg-white dark:border-slate-800 border-slate-300 text-sm font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                        required
                        autoFocus
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold dark:text-slate-300 text-slate-700">Nghĩa tiếng Việt (*):</label>
                      <input
                        type="text"
                        placeholder="Ví dụ: khuyến khích, động viên"
                        value={wordForm.meaning}
                        onChange={(e) => setWordForm(prev => ({ ...prev, meaning: e.target.value }))}
                        className="w-full px-3.5 py-2 rounded-xl border dark:bg-slate-950 bg-white dark:border-slate-800 border-slate-300 text-sm font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                        required
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold dark:text-slate-300 text-slate-700">Phiên âm IPA (tùy chọn):</label>
                      <input
                        type="text"
                        placeholder="Ví dụ: /ɪnˈkɜːr.ɪdʒ/"
                        value={wordForm.phonetic}
                        onChange={(e) => setWordForm(prev => ({ ...prev, phonetic: e.target.value }))}
                        className="w-full px-3.5 py-2 rounded-xl border dark:bg-slate-950 bg-white dark:border-slate-800 border-slate-300 text-sm font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold dark:text-slate-300 text-slate-700">Ví dụ câu (tùy chọn):</label>
                      <input
                        type="text"
                        placeholder="Ví dụ: The manager encouraged the team."
                        value={wordForm.example}
                        onChange={(e) => setWordForm(prev => ({ ...prev, example: e.target.value }))}
                        className="w-full px-3.5 py-2 rounded-xl border dark:bg-slate-950 bg-white dark:border-slate-800 border-slate-300 text-sm font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                      />
                    </div>

                    <div className="flex items-center justify-end gap-2 pt-2">
                      <button
                        type="button"
                        onClick={() => setShowAddWordModal(false)}
                        className="px-4 py-2 rounded-xl border dark:border-slate-800 border-slate-300 text-xs font-bold text-slate-400 hover:text-white"
                      >
                        Hủy
                      </button>
                      <button
                        type="submit"
                        className="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold transition-all shadow-md shadow-emerald-500/20"
                      >
                        Lưu vào học phần
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            {/* MODAL 3: IMPORT TỪ HÀNG LOẠT */}
            {showImportModal && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fadeIn">
                <div className="w-full max-w-lg glass-panel p-6 rounded-3xl border dark:border-slate-700 border-slate-300 dark:bg-slate-900 bg-white space-y-5 shadow-2xl">
                  <div className="flex items-center justify-between border-b dark:border-slate-800 border-slate-200 pb-3">
                    <h3 className="font-heading font-extrabold text-base dark:text-white text-slate-900 flex items-center gap-2">
                      <span>⇪ Import từ vựng vào "{targetDeckForImport}"</span>
                    </h3>
                    <button 
                      onClick={() => setShowImportModal(false)}
                      className="p-1 rounded-lg text-slate-400 hover:text-white"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <form 
                    onSubmit={async (e) => {
                      e.preventDefault();
                      if (!importText.trim()) return;
                      const lines = importText.split('\n').map(l => l.trim()).filter(Boolean);
                      const toAdd = [];
                      for (const line of lines) {
                        const parts = line.split(/[:\-\t]/);
                        if (parts.length >= 2) {
                          const w = parts[0].trim();
                          const m = parts.slice(1).join('-').trim();
                          if (w && m) {
                            toAdd.push({
                              word: w,
                              meaning: m,
                              pos: 'word',
                              exampleEn: '',
                              exampleVi: ''
                            });
                          }
                        }
                      }
                      if (toAdd.length > 0) {
                        try {
                          await addWordsToBasket(toAdd, targetDeckForImport, 'bulk_import');
                          await fetchSummary();
                        } catch(err) {}
                      }
                      setImportText('');
                      setShowImportModal(false);
                    }}
                    className="space-y-3.5"
                  >
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold dark:text-slate-300 text-slate-700">
                        Dán danh sách từ theo định dạng "từ : nghĩa" (mỗi dòng một từ):
                      </label>
                      <textarea
                        rows={8}
                        placeholder={`meeting : cuộc họp\nencourage : khuyến khích\npostpone : hoãn lại`}
                        value={importText}
                        onChange={(e) => setImportText(e.target.value)}
                        className="w-full p-3.5 rounded-xl border dark:bg-slate-950 bg-white dark:border-slate-800 border-slate-300 font-mono text-xs leading-relaxed focus:ring-2 focus:ring-sky-500 focus:outline-none"
                        required
                      />
                    </div>

                    <div className="flex items-center justify-end gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => setShowImportModal(false)}
                        className="px-4 py-2 rounded-xl border dark:border-slate-800 border-slate-300 text-xs font-bold text-slate-400 hover:text-white"
                      >
                        Hủy
                      </button>
                      <button
                        type="submit"
                        className="px-5 py-2 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 text-xs font-bold transition-all shadow-md shadow-sky-500/20"
                      >
                        Tiến hành Import
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 4: THUẬT TOÁN HỌC TỪ (SM-2 & SPACED REPETITION SCIENTIFIC EXPLANATION) */}
        {/* ========================================================================= */}
        {activeTab === 'algorithm' && (
          <div className="space-y-8 animate-fadeIn">
            
            {/* Header Section */}
            <div className="text-center space-y-3 max-w-2xl mx-auto pt-4">
              <span className="px-3.5 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 text-xs font-bold uppercase tracking-wider">
                ✨ Cách Tường Tận TOEIC dạy từ vựng
              </span>
              <h2 className="text-3xl font-extrabold font-heading dark:text-white text-slate-900">
                Học đúng từ — <span className="text-emerald-600 dark:text-emerald-400">đúng lúc</span> — đúng số lần
              </h2>
              <p className="dark:text-slate-400 text-slate-600 text-sm leading-relaxed">
                Bạn chỉ bấm <strong>Again / Hard / Good / Easy</strong> — hệ thống lo toàn bộ phần lịch ôn, nhắc nhở và phân loại khoa học.
              </p>
            </div>

            {/* 4 Core Feature Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                {
                  icon: Calendar,
                  title: 'Lên lịch ôn tập cho từng từ',
                  badge: 'TỰ ĐỘNG',
                  desc: 'Thuật toán SM-2 tính toán chính xác khoảng thời gian lặp lại tối ưu theo trí nhớ của bạn.'
                },
                {
                  icon: Layers,
                  title: 'Một từ — 4 chế độ học',
                  badge: '4 CHẾ ĐỘ',
                  desc: 'Học đa giác quan qua Flashcard 3D, Trắc nghiệm, Game nối từ và Speed Typing gõ phím.'
                },
                {
                  icon: Zap,
                  title: 'Nhắc ôn tập khi tới hạn',
                  badge: 'REAL-TIME',
                  desc: 'Tự động tổng hợp danh sách từ cần ôn mỗi ngày, tránh lãng phí thời gian học lại từ đã thuộc.'
                },
                {
                  icon: Award,
                  title: 'Phân loại theo CEFR',
                  badge: 'A1 — C2',
                  desc: 'Mỗi từ đều được gắn nhãn cấp độ theo khung chuẩn Châu Âu từ cơ bản đến cao cấp.'
                }
              ].map((item, idx) => {
                const IconComponent = item.icon;
                return (
                  <div 
                    key={idx}
                    className="glass-panel rounded-3xl border dark:border-slate-800 border-slate-200 p-6 space-y-4 hover:border-emerald-500/40 transition-all flex flex-col justify-between dark:bg-slate-900/60 bg-white shadow-sm"
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                          <IconComponent className="w-5 h-5" />
                        </div>
                        <span className="px-2 py-0.5 rounded-md dark:bg-slate-900 bg-slate-100 dark:text-slate-300 text-slate-700 text-[10px] font-mono font-bold border dark:border-slate-800 border-slate-200">
                          {item.badge}
                        </span>
                      </div>

                      <h3 className="font-heading font-extrabold text-base dark:text-white text-slate-900">
                        {item.title}
                      </h3>

                      <p className="text-xs dark:text-slate-400 text-slate-600 leading-relaxed">
                        {item.desc}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* 4 SM-2 Rating Buttons Explanation Table */}
            <div className="glass-panel rounded-3xl border dark:border-slate-800 border-slate-200 p-8 space-y-6 dark:bg-slate-900/60 bg-white shadow-sm">
              <div className="space-y-2 border-b dark:border-slate-800 border-slate-200 pb-4">
                <h3 className="text-xl font-extrabold font-heading dark:text-white text-slate-900">
                  Ý nghĩa 4 nút đánh giá mức độ nhớ
                </h3>
                <p className="text-xs dark:text-slate-400 text-slate-600">
                  Trong khi học Flashcard, bạn bấm các nút sau (hoặc dùng phím số 1, 2, 3, 4) để hệ thống tự động lên lịch:
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-5 rounded-2xl bg-rose-500/10 border border-rose-500/30 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-sm text-rose-400">1. Again (Lặp lại)</span>
                    <span className="text-xs font-mono font-bold text-rose-300">&lt; 1 phút</span>
                  </div>
                  <p className="text-xs text-slate-300">
                    Bạn hoàn toàn quên từ này hoặc chọn sai. Thẻ sẽ xuất hiện lại ngay trong phiên học.
                  </p>
                </div>

                <div className="p-5 rounded-2xl bg-orange-500/10 border border-orange-500/30 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-sm text-orange-400">2. Hard (Khó)</span>
                    <span className="text-xs font-mono font-bold text-orange-300">12 giờ</span>
                  </div>
                  <p className="text-xs text-slate-300">
                    Phải mất nhiều thời gian mới nhớ ra. Khoảng cách ôn tập sẽ tăng chậm.
                  </p>
                </div>

                <div className="p-5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-sm text-emerald-400">3. Good (Tốt)</span>
                    <span className="text-xs font-mono font-bold text-emerald-300">1 ngày</span>
                  </div>
                  <p className="text-xs text-slate-300">
                    Nhớ từ một cách chuẩn xác sau vài giây suy nghĩ. Đây là nút được chọn nhiều nhất.
                  </p>
                </div>

                <div className="p-5 rounded-2xl bg-blue-500/10 border border-blue-500/30 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-sm text-blue-400">4. Easy (Dễ)</span>
                    <span className="text-xs font-mono font-bold text-blue-300">4 ngày</span>
                  </div>
                  <p className="text-xs text-slate-300">
                    Từ quá quen thuộc, bật ra ngay lập tức. Khoảng cách ôn tập sẽ giãn cách tối đa.
                  </p>
                </div>
              </div>
            </div>

          </div>
        )}

      </main>

      {/* WORD LIST PREVIEW MODAL */}
      <VocabWordListModal
        isOpen={isWordListModalOpen}
        onClose={() => setIsWordListModalOpen(false)}
        topic={selectedTopicForModal}
      />

      {/* VIP Upgrade Pricing Modal */}
      <PricingModal
        isOpen={showPricingModal}
        onClose={() => setShowPricingModal(false)}
        onUpgradeSuccess={() => {
          setIsProUser(true);
          refreshProfile?.();
        }}
      />
    </div>
  );
}
