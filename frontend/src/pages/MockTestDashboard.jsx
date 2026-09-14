import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../components/Navbar';
import { 
  FileText, 
  Play, 
  BookOpen, 
  Clock, 
  CheckCircle2, 
  XCircle,
  X, 
  Sparkles, 
  Award, 
  BarChart2, 
  Filter,
  Check,
  Crown, 
  Search, 
  ChevronRight, 
  Headphones, 
  History, 
  TrendingUp, 
  Volume2, 
  Calendar, 
  Layers, 
  ArrowRight, 
  RefreshCw, 
  Trophy, 
  ChevronLeft, 
  AlertCircle,
  RotateCcw,
  ClipboardCheck,
  Target,
  Zap,
  Share2,
  Sliders
} from 'lucide-react';

import VipLockOverlay from '../components/VipLockOverlay';
import PricingModal from '../components/PricingModal';
import { useAuth } from '../context/AuthContext';
import usePageTitle from '../hooks/usePageTitle';
import { getStoredUser, setStoredUser } from '../utils/auth';

export default function MockTestDashboard() {
  usePageTitle(
    'Thi Thử TOEIC 2026 Chuẩn Quốc Tế — Trọn Bộ 10 Đề ETS 200 Câu Có Giải Thích',
    'Phòng thi thử TOEIC online format mới 2026 với 10 bộ đề ETS 200 câu bấm giờ 120 phút, chấm điểm tức thì, giải thích chi tiết đáp án và phân tích bẫy đề thi.'
  );

  const { requireAuth, isPro: authIsPro, refreshProfile } = useAuth();
  const rawNavigate = useNavigate();
  const navigate = (to, options) => {
    if (typeof to === 'string' && to.startsWith('/tests/room')) {
      return requireAuth(to);
    }
    return rawNavigate(to, options);
  };
  const [searchParams, setSearchParams] = useSearchParams();
  const activeMainTab = searchParams.get('tab') || 'list'; // 'list' (Học) | 'history' (Tiến độ)
  const urlCategory = searchParams.get('category') || 'Crack TOEIC Vol 1';

  // Filter & Category State (Only 2 categories matching Dau TOEIC: Crack TOEIC Vol 1 & Pass TOEIC)
  const [selectedCategory, setSelectedCategory] = useState(urlCategory);
  const [searchKeyword, setSearchKeyword] = useState('');

  // Keep state synced on browser Back / Forward buttons
  useEffect(() => {
    const curCat = searchParams.get('category') || 'Crack TOEIC Vol 1';
    setSelectedCategory(curCat);
  }, [searchParams]);

  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
    setSearchParams({ tab: activeMainTab, category }, { replace: true });
  };

  const handleTabChange = (tab) => {
    setSearchParams({ tab, category: selectedCategory }, { replace: true });
  };

  // VIP & Pricing States
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

  // Mode Selection Modal State
  const [selectedTestForModal, setSelectedTestForModal] = useState(null);
  const [modalTab, setModalTab] = useState('exam'); // 'exam' (Luyện thi) | 'practice' (Luyện tập)
  const [selectedExamParts, setSelectedExamParts] = useState(['1']);
  const [selectedPracticeParts, setSelectedPracticeParts] = useState(['1', '2', '5']);
  const [practiceTimeLimit, setPracticeTimeLimit] = useState('unlimited'); // 'unlimited' | '30' | '45' | '60'

  // Quick Scorecard Modal State
  const [selectedScorecardTest, setSelectedScorecardTest] = useState(null);

  // Default 10 ETS Tests pre-populated to guarantee instant crawler indexing & eliminate Soft 404
  const DEFAULT_MOCK_TESTS = [
    { _id: "6a91b9306d1938ebacd9ae0c", title: "ETS TOEIC 2026 — Test 1 (Full 200 Câu)", year: 2026, totalQuestions: 200, timeLimitMinutes: 120 },
    { _id: "6a91b9306d1938ebacd9b65b", title: "ETS TOEIC 2026 — Test 2 (Full 200 Câu)", year: 2026, totalQuestions: 200, timeLimitMinutes: 120 },
    { _id: "6a91b92f6d1938ebacd99e14", title: "ETS TOEIC 2026 — Test 3 (Full 200 Câu)", year: 2026, totalQuestions: 200, timeLimitMinutes: 120 },
    { _id: "6a91b92f6d1938ebacd9a251", title: "ETS TOEIC 2026 — Test 4 (Full 200 Câu)", year: 2026, totalQuestions: 200, timeLimitMinutes: 120 },
    { _id: "6a91b92f6d1938ebacd9a622", title: "ETS TOEIC 2026 — Test 5 (Full 200 Câu)", year: 2026, totalQuestions: 200, timeLimitMinutes: 120 },
    { _id: "6a91b9306d1938ebacd9ba9d", title: "ETS TOEIC 2026 — Test 6 (Full 200 Câu)", year: 2026, totalQuestions: 200, timeLimitMinutes: 120 },
    { _id: "6a91b9306d1938ebacd9b242", title: "ETS TOEIC 2026 — Test 7 (Full 200 Câu)", year: 2026, totalQuestions: 200, timeLimitMinutes: 120 },
    { _id: "6a91b92f6d1938ebacd9a9f3", title: "ETS TOEIC 2026 — Test 8 (Full 200 Câu)", year: 2026, totalQuestions: 200, timeLimitMinutes: 120 },
    { _id: "6a91b92f6d1938ebacd999fb", title: "ETS TOEIC 2026 — Test 9 (Full 200 Câu)", year: 2026, totalQuestions: 200, timeLimitMinutes: 120 },
    { _id: "6a91b9306d1938ebacd9cab9", title: "ETS TOEIC 2026 — Test 10 (Full 200 Câu)", year: 2026, totalQuestions: 200, timeLimitMinutes: 120 }
  ];

  // Tests Data
  const [tests, setTests] = useState(DEFAULT_MOCK_TESTS);
  const [loading, setLoading] = useState(false);
  const [selectedYear, setSelectedYear] = useState(() => {
    const yearFromQuery = parseInt(searchParams.get('year'), 10);
    return !isNaN(yearFromQuery) && yearFromQuery >= 2019 && yearFromQuery <= 2026 ? yearFromQuery : 2026;
  });
  const [testHistory, setTestHistory] = useState(() => {
    try {
      const saved = localStorage.getItem('tuongtan_mocktest_history');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Sync profile VIP status
  const location = useLocation();
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
  }, [location.key]);

  useEffect(() => {
    async function loadMockTests() {
      try {
        setLoading(true);
        const res = await axios.get('/api/v1/mocktest/tests');
        if (res.data?.data) {
          setTests(res.data.data);
        }
      } catch (err) {
        console.warn('Error fetching mock tests:', err.message);
      } finally {
        setLoading(false);
      }
    }
    loadMockTests();
  }, []);

  // Part options with exact questions and recommended minutes
  const listeningPartOptions = [
    { id: '1', label: 'Part 1', questions: 6, minutes: 6 },
    { id: '2', label: 'Part 2', questions: 25, minutes: 12 },
    { id: '3', label: 'Part 3', questions: 39, minutes: 15 },
    { id: '4', label: 'Part 4', questions: 30, minutes: 12 }
  ];

  const readingPartOptions = [
    { id: '5', label: 'Part 5', questions: 30, minutes: 15 },
    { id: '6', label: 'Part 6', questions: 16, minutes: 15 },
    { id: '7', label: 'Part 7', questions: 54, minutes: 45 }
  ];

  const allPartOptions = [...listeningPartOptions, ...readingPartOptions];

  const toggleExamPartSelection = (partId) => {
    setSelectedExamParts(prev => 
      prev.includes(partId) 
        ? (prev.length > 1 ? prev.filter(p => p !== partId) : prev) 
        : [...prev, partId]
    );
  };

  const togglePracticePartSelection = (partId) => {
    setSelectedPracticeParts(prev => 
      prev.includes(partId) 
        ? (prev.length > 1 ? prev.filter(p => p !== partId) : prev) 
        : [...prev, partId]
    );
  };

  // Compute dynamic exam minutes when choosing custom parts
  const computedExamMinutes = selectedExamParts.reduce((acc, partId) => {
    const p = allPartOptions.find(opt => opt.id === partId);
    return acc + (p?.minutes || 10);
  }, 0);

  // EXACT Categories List (ONLY 2 Categories matching Dau TOEIC 100%)
  const categoryPillList = [
    { id: 'Crack TOEIC Vol 1', label: 'Crack TOEIC Vol 1 (10)', count: 10 },
    { id: 'Pass TOEIC', label: 'Pass TOEIC (6)', count: 6 }
  ];

  // Helper to extract natural test number for numerical sorting (Test 1..10)
  const extractTestNumber = (title) => {
    const match = title.match(/Test\s*(\d+)/i);
    return match ? parseInt(match[1], 10) : 999;
  };

  // Exact mock test attempt counts matching Dau TOEIC
  const attemptsCrackVol1 = [500, 150, 44, 23, 31, 18, 11, 9, 17, 46];
  const attemptsPassToeic = [320, 140, 85, 42, 28, 19];

  // Filter & Naturally Sort Tests strictly according to selected category
  const displayedTests = useMemo(() => {
    let filtered = [];

    if (selectedCategory === 'Pass TOEIC') {
      // Pass TOEIC has exactly 6 tests from year 2024 / Pass TOEIC set
      filtered = tests.filter(t => t.year === 2024 || (t.title && t.title.includes('2024')));
      filtered.sort((a, b) => extractTestNumber(a.title) - extractTestNumber(b.title));
      filtered = filtered.slice(0, 6);
    } else {
      // Default: Crack TOEIC Vol 1 has exactly 10 tests from year 2026 / Crack TOEIC set
      filtered = tests.filter(t => t.year === 2026 || (t.title && t.title.includes('2026')));
      filtered.sort((a, b) => extractTestNumber(a.title) - extractTestNumber(b.title));
      filtered = filtered.slice(0, 10);
    }

    // Apply search keyword if user types in search box
    if (searchKeyword.trim()) {
      filtered = filtered.filter((t, idx) => {
        const titleName = `Test ${idx + 1}`;
        return titleName.toLowerCase().includes(searchKeyword.toLowerCase()) || 
               (t.title && t.title.toLowerCase().includes(searchKeyword.toLowerCase()));
      });
    }

    return filtered;
  }, [tests, selectedCategory, searchKeyword]);

  // Start Room Handlers
  const handleStartExam = (mode, customParts = null, customMinutes = null) => {
    if (!selectedTestForModal) return;
    const testId = selectedTestForModal._id;
    setSelectedTestForModal(null);
    if (mode === 'part' || mode === 'custom') {
      const partsParam = (customParts || selectedExamParts).join(',');
      const timeParam = customMinutes || computedExamMinutes;
      navigate(`/tests/room/${testId}?mode=part&parts=${partsParam}&time=${timeParam}`);
    } else if (mode === 'listening') {
      navigate(`/tests/room/${testId}?mode=listening&parts=1,2,3,4&time=45`);
    } else if (mode === 'reading') {
      navigate(`/tests/room/${testId}?mode=reading&parts=5,6,7&time=75`);
    } else {
      navigate(`/tests/room/${testId}?mode=full&time=120`);
    }
  };

  const handleStartPractice = () => {
    if (!selectedTestForModal) return;
    const testId = selectedTestForModal._id;
    const partsParam = selectedPracticeParts.join(',');
    setSelectedTestForModal(null);
    navigate(`/tests/room/${testId}?mode=practice&parts=${partsParam}&time=${practiceTimeLimit}`);
  };

  // Reset Test History Handler
  const handleResetTestHistory = (testId) => {
    try {
      const nextHistory = testHistory.filter(h => h.testId !== testId);
      setTestHistory(nextHistory);
      localStorage.setItem('tuongtan_mocktest_history', JSON.stringify(nextHistory));
    } catch (e) {
      console.warn('Failed to reset mock test history:', e);
    }
  };

  // Average score calculations for history tab
  const averageTotalScore = testHistory.length > 0
    ? Math.round(testHistory.reduce((acc, h) => acc + (h.totalScore || 0), 0) / testHistory.length)
    : 0;

  const averageListeningScore = testHistory.length > 0
    ? Math.round(testHistory.reduce((acc, h) => acc + (h.listeningScore || 0), 0) / testHistory.length)
    : 0;

  const averageReadingScore = testHistory.length > 0
    ? Math.round(testHistory.reduce((acc, h) => acc + (h.readingScore || 0), 0) / testHistory.length)
    : 0;

  return (
    <div className="min-h-screen dark:bg-[#070b14] bg-[#f8fafc] dark:text-slate-100 text-slate-900 flex flex-col font-sans pb-16 transition-colors duration-200">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-7">
        
        {/* ========================================================================= */}
        {/* 1. HERO BANNER (100% MATCHING DAU TOEIC dautoeic.com/mock-test) */}
        {/* ========================================================================= */}
        <div className="relative overflow-hidden rounded-3xl dark:bg-gradient-to-r dark:from-sky-950/50 dark:via-slate-900 dark:to-slate-950 bg-gradient-to-r from-sky-50 via-white to-blue-50/60 border dark:border-slate-800/80 border-slate-200 p-8 sm:p-10 shadow-xl dark:shadow-2xl">
          <div className="absolute top-0 right-0 -mt-16 -mr-16 w-96 h-96 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-1/3 -mb-16 w-80 h-80 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-8">
            <div className="space-y-3.5 text-center lg:text-left max-w-3xl">
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full dark:bg-sky-500/15 bg-sky-100 border dark:border-sky-400/30 border-sky-300 text-sky-700 dark:text-sky-300 text-xs font-bold uppercase tracking-wide shadow-sm">
                <Sparkles className="w-3.5 h-3.5 text-sky-500 dark:text-sky-400" />
                <span>Đề thi TOEIC mô phỏng sát đề thi thật</span>
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black font-heading dark:text-white text-slate-900 tracking-tight leading-tight">
                Luyện đề thi <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-500 via-blue-600 to-indigo-600 dark:from-sky-400 dark:via-blue-400 dark:to-indigo-400">TOEIC thực tế</span>
              </h1>

              <p className="text-sm sm:text-base dark:text-slate-300 text-slate-600 leading-relaxed font-normal">
                Nghe chép chính tả, đọc song ngữ Anh - Việt, 1 chạm thêm từ vào giỏ từ vựng, xem dẫn chứng đáp án và giải thích chi tiết từng câu.
              </p>
            </div>

            <div className="relative shrink-0 hidden sm:flex items-center justify-center">
              <div className="w-32 h-32 sm:w-36 sm:h-36 rounded-3xl dark:bg-gradient-to-br dark:from-sky-500/20 dark:via-blue-600/20 dark:to-slate-900 bg-gradient-to-br from-sky-100 to-blue-50 border-2 dark:border-sky-400/40 border-sky-300 flex items-center justify-center shadow-[0_0_40px_rgba(56,189,248,0.15)] relative group transition-all">
                <div className="w-20 h-20 rounded-2xl dark:bg-sky-500/20 bg-sky-100 border dark:border-sky-400/30 border-sky-300 flex items-center justify-center text-sky-600 dark:text-sky-300">
                  <ClipboardCheck className="w-12 h-12 text-sky-500 dark:text-sky-400 drop-shadow-md" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* 2. MODE SWITCHER: [ 📖 Học ] [ 📊 Tiến độ ] */}
        {/* ========================================================================= */}
        <div className="flex items-center justify-between border-b dark:border-slate-800/80 border-slate-200 pb-3 gap-4 flex-wrap">
          <div className="flex items-center dark:bg-slate-950 bg-white p-1 rounded-2xl border dark:border-slate-800/90 border-slate-200 shadow-sm">
            <button
              onClick={() => handleTabChange('list')}
              className={`px-6 py-2 rounded-xl text-xs font-extrabold flex items-center gap-2 transition-all ${
                activeMainTab === 'list'
                  ? 'bg-sky-500 text-slate-950 shadow-md shadow-sky-500/20'
                  : 'dark:text-slate-400 text-slate-600 hover:text-sky-600 dark:hover:text-white'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Học</span>
            </button>

            <button
              onClick={() => handleTabChange('history')}
              className={`px-6 py-2 rounded-xl text-xs font-extrabold flex items-center gap-2 transition-all ${
                activeMainTab === 'history'
                  ? 'bg-sky-500 text-slate-950 shadow-md shadow-sky-500/20'
                  : 'dark:text-slate-400 text-slate-600 hover:text-sky-600 dark:hover:text-white'
              }`}
            >
              <BarChart2 className="w-3.5 h-3.5" />
              <span>Tiến độ</span>
            </button>
          </div>

          {/* Search Box */}
          {activeMainTab === 'list' && (
            <div className="relative w-full sm:w-64">
              <Search className="w-3.5 h-3.5 dark:text-slate-500 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                placeholder="Tìm tên đề thi..."
                className="w-full pl-9 pr-4 py-2 rounded-xl dark:bg-slate-900 bg-white border dark:border-slate-800 border-slate-200 text-xs dark:text-white text-slate-900 dark:placeholder-slate-500 placeholder-slate-400 outline-none focus:border-sky-500 shadow-sm transition-all"
              />
            </div>
          )}
        </div>

        {/* ========================================================================= */}
        {/* TAB 1: [ 📖 HỌC ] - CATEGORIES & TEST CARDS LIST */}
        {/* ========================================================================= */}
        {activeMainTab === 'list' && (
          <div className="space-y-6 animate-fadeIn">
            
            {/* ONLY 2 Category Pills (Crack TOEIC Vol 1 & Pass TOEIC matching Dau TOEIC 100%) */}
            <div className="flex items-center gap-3">
              {categoryPillList.map((cat) => {
                const isActive = selectedCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    onClick={() => handleCategoryChange(cat.id)}
                    className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                      isActive
                        ? 'bg-sky-500 text-slate-950 font-extrabold shadow-lg shadow-sky-500/25 ring-2 ring-sky-400/40'
                        : 'dark:bg-slate-900/80 bg-white border dark:border-slate-800 border-slate-200 dark:text-slate-300 text-slate-700 hover:bg-slate-50 dark:hover:text-white shadow-sm'
                    }`}
                  >
                    <span>{cat.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Test Cards Grid - Strictly Ordered Test 1..10 in 4 Columns */}
            {loading ? (
              <div className="py-24 text-center space-y-3 font-mono text-sky-500 dark:text-sky-400 flex flex-col items-center justify-center">
                <RefreshCw className="w-8 h-8 animate-spin" />
                <span>Đang nạp kho đề thi TOEIC...</span>
              </div>
            ) : displayedTests.length === 0 ? (
              <div className="py-20 text-center dark:text-slate-500 text-slate-400 space-y-2 glass-panel rounded-3xl border dark:border-slate-800 border-slate-200 p-8 max-w-md mx-auto">
                <AlertCircle className="w-8 h-8 mx-auto text-slate-400" />
                <p className="text-sm dark:text-slate-300 text-slate-700 font-bold">Không tìm thấy đề thi phù hợp</p>
                <p className="text-xs dark:text-slate-500 text-slate-500">Hãy thử tìm với từ khóa khác.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                {displayedTests.map((test, idx) => {
                  const historyRecord = testHistory.find(h => h.testId === test._id);
                  const isFreeTest = idx === 0; // Test 1 is Free
                  const isLocked = !isProUser && !isFreeTest;

                  // Strictly sequential Title: 'Test 1', 'Test 2', ..., 'Test 10'
                  const displayTitle = `Test ${idx + 1}`;

                  // Real attempt counts from MongoDB (seeded baseline + live attempts increment)
                  const attempts = test.attemptsCount || (selectedCategory === 'Pass TOEIC' 
                    ? (attemptsPassToeic[idx] || 35)
                    : (attemptsCrackVol1[idx] || 45));

                  return (
                    <VipLockOverlay
                      key={test._id}
                      isLocked={isLocked}
                      onUnlockClick={() => setShowPricingModal(true)}
                      label={`${displayTitle} (VIP)`}
                    >
                      <div className="group rounded-2xl p-5 dark:bg-slate-900/85 bg-white border dark:border-slate-800/90 border-slate-200/90 hover:border-sky-500/50 transition-all flex flex-col justify-between space-y-4 shadow-sm hover:shadow-lg relative">
                        
                        {/* TOP CARD ROW: Title + 3 Mini Action Icons */}
                        <div className="space-y-3">
                          <div className="flex items-center justify-between gap-2">
                            <h3 className="font-heading font-extrabold text-base dark:text-white text-slate-900 group-hover:text-sky-600 dark:group-hover:text-sky-400 transition-colors">
                              {displayTitle}
                            </h3>

                            {/* 3 Mini Action Icons: History, Practice Config, Details */}
                            <div className="flex items-center gap-1.5 dark:text-slate-400 text-slate-500">
                              {/* History button */}
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedScorecardTest({ ...test, title: displayTitle });
                                }}
                                className={`p-1 rounded transition-colors ${
                                  historyRecord 
                                    ? 'text-sky-500 hover:bg-sky-50 dark:hover:bg-sky-950/40' 
                                    : 'hover:text-sky-500'
                                }`}
                                title="Lịch sử các lần thi"
                              >
                                <History className="w-3.5 h-3.5" />
                              </button>

                              {/* Redo / Practice Config button */}
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedTestForModal({ ...test, title: displayTitle });
                                  setModalTab('practice');
                                }}
                                className="p-1 hover:text-sky-500 transition-colors rounded cursor-pointer"
                                title="Luyện tập đề này"
                              >
                                <RotateCcw className="w-3.5 h-3.5" />
                              </button>

                              {/* Note / Details button */}
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedScorecardTest({ ...test, title: displayTitle });
                                }}
                                className="p-1 hover:text-emerald-500 transition-colors rounded cursor-pointer"
                                title="Xem chi tiết đề thi"
                              >
                                <FileText className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>

                          {/* Info Line: [👥 Lượt làm] • [📶 Vừa] • [🏆 Điểm số badge] */}
                          <div className="flex items-center gap-2 text-[11px] dark:text-slate-400 text-slate-600 flex-wrap">
                            <div className="flex items-center gap-1">
                              <span className="dark:text-slate-500 text-slate-400">👥</span>
                              <span>{attempts} lượt làm</span>
                            </div>

                            <span>•</span>

                            <div className="flex items-center gap-1">
                              <span className="dark:text-slate-500 text-slate-400">📶</span>
                              <span>Vừa</span>
                            </div>

                            <span>•</span>

                            {/* Clickable Scorecard Badge */}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedScorecardTest({ ...test, title: displayTitle });
                              }}
                              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md dark:bg-amber-500/10 bg-amber-50 border dark:border-amber-500/30 border-amber-200 text-amber-700 dark:text-amber-400 hover:bg-amber-100 dark:hover:bg-amber-500/20 font-bold transition-colors shadow-sm"
                            >
                              <Trophy className="w-3 h-3 text-amber-500 dark:text-amber-400" />
                              <span>Điểm số</span>
                            </button>
                          </div>

                          {/* Attempt Status */}
                          <div className="pt-1">
                            {historyRecord ? (
                              <span className="text-emerald-600 dark:text-emerald-400 font-bold text-xs flex items-center gap-1">
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 dark:text-emerald-400" />
                                <span>Đã làm ({historyRecord.totalScore}/990 PTS)</span>
                              </span>
                            ) : (
                              <span className="text-xs dark:text-slate-500 text-slate-400 font-medium">Chưa luyện tập</span>
                            )}
                          </div>
                        </div>

                        {/* BOTTOM: 2 PRIMARY ACTION BUTTONS: [ ▷ Thi thử ] [ 📖 Luyện tập ] */}
                        <div className="grid grid-cols-2 gap-2 pt-2 border-t dark:border-slate-800/80 border-slate-100 mt-auto">
                          <button
                            onClick={() => {
                              setSelectedTestForModal({ ...test, title: displayTitle });
                              setModalTab('exam');
                            }}
                            className="py-2.5 px-3 rounded-xl dark:bg-slate-800/90 bg-slate-100 hover:bg-slate-200 dark:hover:bg-slate-700 dark:text-white text-slate-700 font-extrabold text-xs flex items-center justify-center gap-1.5 transition-all active:scale-95 border dark:border-slate-700 border-slate-200 shadow-sm cursor-pointer"
                          >
                            <Play className="w-3 h-3 fill-current text-sky-500 dark:text-sky-400" />
                            <span>Thi thử</span>
                          </button>

                          <button
                            onClick={() => {
                              setSelectedTestForModal({ ...test, title: displayTitle });
                              setModalTab('practice');
                            }}
                            className="py-2.5 px-3 rounded-xl dark:bg-emerald-500/15 bg-emerald-50 hover:bg-emerald-100 dark:hover:bg-emerald-500/25 dark:text-emerald-300 text-emerald-700 font-extrabold text-xs flex items-center justify-center gap-1.5 transition-all active:scale-95 border dark:border-emerald-500/30 border-emerald-200 shadow-sm cursor-pointer"
                          >
                            <BookOpen className="w-3 h-3 text-emerald-500 dark:text-emerald-400" />
                            <span>Luyện tập</span>
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
        {/* TAB 2: [ 📊 TIẾN ĐỘ ] - PROGRESS & SCORE HISTORY (MATCHING DAU TOEIC) */}
        {/* ========================================================================= */}
        {activeMainTab === 'history' && (
          <div className="space-y-7 animate-fadeIn">
            
            {/* 3 Overview Metric Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-6 rounded-3xl dark:bg-slate-900/90 bg-white border dark:border-slate-800 border-slate-200 text-center space-y-1 shadow-sm">
                <span className="text-[11px] dark:text-slate-400 text-slate-500 font-mono uppercase tracking-wider">Điểm Trung Bình TOEIC</span>
                <div className="text-3xl font-extrabold font-heading text-amber-500 dark:text-amber-400">{averageTotalScore || 0} <span className="text-sm dark:text-slate-500 text-slate-400 font-mono">/ 990</span></div>
                <span className="text-[11px] dark:text-slate-500 text-slate-400 font-mono">{testHistory.length} bài thi đã hoàn thành</span>
              </div>

              <div className="p-6 rounded-3xl dark:bg-slate-900/90 bg-white border dark:border-slate-800 border-slate-200 text-center space-y-1 shadow-sm">
                <span className="text-[11px] dark:text-slate-400 text-slate-500 font-mono uppercase tracking-wider">Listening Trung Bình</span>
                <div className="text-3xl font-extrabold font-heading text-sky-500 dark:text-sky-400">{averageListeningScore || 0} <span className="text-sm dark:text-slate-500 text-slate-400 font-mono">/ 495</span></div>
                <span className="text-[11px] dark:text-slate-500 text-slate-400 font-mono">Kỹ năng nghe (Part 1 - 4)</span>
              </div>

              <div className="p-6 rounded-3xl dark:bg-slate-900/90 bg-white border dark:border-slate-800 border-slate-200 text-center space-y-1 shadow-sm">
                <span className="text-[11px] dark:text-slate-400 text-slate-500 font-mono uppercase tracking-wider">Reading Trung Bình</span>
                <div className="text-3xl font-extrabold font-heading text-emerald-500 dark:text-emerald-400">{averageReadingScore || 0} <span className="text-sm dark:text-slate-500 text-slate-400 font-mono">/ 495</span></div>
                <span className="text-[11px] dark:text-slate-500 text-slate-400 font-mono">Kỹ năng đọc (Part 5 - 7)</span>
              </div>
            </div>

            {testHistory.length === 0 ? (
              <div className="py-20 text-center dark:bg-slate-900/60 bg-white rounded-3xl border dark:border-slate-800 border-slate-200 p-8 space-y-4 max-w-lg mx-auto shadow-sm">
                <Award className="w-12 h-12 text-slate-400 mx-auto" />
                <h3 className="text-lg font-bold dark:text-white text-slate-900">Bạn Chưa Hoàn Thành Bài Thi Nào</h3>
                <p className="text-xs dark:text-slate-400 text-slate-600 leading-relaxed">
                  Hãy chọn một đề thi ở tab Danh Sách Đề Thi và bắt đầu thử sức để theo dõi tiến độ điểm số tại đây.
                </p>
                <button
                  onClick={() => handleTabChange('list')}
                  className="px-6 py-2.5 rounded-xl bg-sky-500 text-slate-950 font-extrabold text-xs shadow-md shadow-sky-500/20"
                >
                  Chọn đề thi ngay →
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-heading font-extrabold text-lg dark:text-white text-slate-900">Lịch Sử Các Lần Thi Thử</h3>
                  <button
                    onClick={() => navigate('/mistakes')}
                    className="text-xs text-sky-600 dark:text-sky-400 hover:underline flex items-center gap-1 font-bold"
                  >
                    <span>Xem Sổ tay câu sai</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="space-y-3">
                  {testHistory.map((item, idx) => (
                    <div
                      key={idx}
                      className="p-5 rounded-2xl dark:bg-slate-900/80 bg-white border dark:border-slate-800 border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:border-slate-400 dark:hover:border-slate-700 shadow-sm transition-all"
                    >
                      <div className="space-y-1">
                        <h4 className="font-extrabold dark:text-white text-slate-900 text-base">{item.testTitle}</h4>
                        <div className="flex items-center gap-3 text-xs dark:text-slate-400 text-slate-600 font-mono">
                          <span>{item.date || 'Gần đây'}</span>
                          <span>•</span>
                          <span>Listening: <strong className="text-sky-600 dark:text-sky-400">{item.listeningScore}</strong>/495</span>
                          <span>•</span>
                          <span>Reading: <strong className="text-emerald-600 dark:text-emerald-400">{item.readingScore}</strong>/495</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <span className="text-[10px] dark:text-slate-400 text-slate-500 block font-mono uppercase">Tổng điểm</span>
                          <span className="text-2xl font-extrabold font-heading text-amber-500 dark:text-amber-400">{item.totalScore} PTS</span>
                        </div>

                        <button
                          onClick={() => navigate(`/tests/room/${item.testId}?mode=full`)}
                          className="px-4 py-2 rounded-xl dark:bg-slate-800 bg-slate-100 hover:bg-slate-200 dark:hover:bg-slate-700 border dark:border-slate-700 border-slate-200 text-xs font-bold dark:text-slate-200 text-slate-700 hover:text-slate-900 dark:hover:text-white shadow-sm transition-all"
                        >
                          Thi lại
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

      </main>

      {/* ========================================================================= */}
      {/* 3. MODAL CHỌN CHẾ ĐỘ LÀM BÀI (100% KHỚP ĐẬU TOEIC SCREENSHOT 2) */}
      {/* ========================================================================= */}
      {selectedTestForModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 dark:bg-slate-950/85 backdrop-blur-md animate-fadeIn">
          <div className="relative w-full max-w-2xl rounded-3xl dark:bg-[#0d1424] bg-white border dark:border-slate-800 border-slate-200 p-6 sm:p-7 space-y-5 shadow-2xl max-h-[90vh] overflow-y-auto">
            
            {/* Header */}
            <div className="flex items-center justify-between border-b dark:border-slate-800 border-slate-200 pb-3">
              <div>
                <h3 className="font-heading font-extrabold text-xl text-slate-900 dark:text-white">Chọn chế độ</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-mono mt-0.5">{selectedTestForModal.title}</p>
              </div>
              <button
                onClick={() => setSelectedTestForModal(null)}
                className="p-2 rounded-xl dark:bg-slate-800/80 bg-slate-100 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* 2 Main Tabs: [ 📖 Luyện thi ] [ ⚙️ Luyện tập ] */}
            <div className="grid grid-cols-2 gap-2 p-1 rounded-2xl dark:bg-slate-950 bg-slate-100 border dark:border-slate-800 border-slate-200">
              <button
                onClick={() => setModalTab('exam')}
                className={`py-2 rounded-xl text-xs font-extrabold transition-all flex items-center justify-center gap-2 ${
                  modalTab === 'exam'
                    ? 'bg-sky-500 text-slate-950 shadow-md'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>Luyện thi</span>
              </button>

              <button
                onClick={() => setModalTab('practice')}
                className={`py-2 rounded-xl text-xs font-extrabold transition-all flex items-center justify-center gap-2 ${
                  modalTab === 'practice'
                    ? 'bg-sky-500 text-slate-950 shadow-md'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Sliders className="w-3.5 h-3.5" />
                <span>Luyện tập</span>
              </button>
            </div>

            {/* TAB 1: EXAM MODES (LUYỆN THI) - 100% MATCHING DAU TOEIC SCREENSHOT 2 */}
            {modalTab === 'exam' && (
              <div className="space-y-4 animate-fadeIn">
                
                {/* 3 Top Cards: [ Full Test ] [ Thi Listening ] [ Thi Reading ] */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  
                  {/* Card 1: Full Test */}
                  <div className="p-4 rounded-2xl dark:bg-[#090e1a] bg-slate-50 border dark:border-slate-800/90 border-slate-200 flex flex-col justify-between space-y-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-sky-500 dark:text-sky-400">
                        <FileText className="w-4 h-4" />
                        <h4 className="font-extrabold text-sm text-slate-900 dark:text-white">Full Test</h4>
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">Làm như thi thật</p>
                    </div>

                    <div className="space-y-2">
                      <button
                        onClick={() => handleStartExam('full')}
                        className="w-full py-2 px-3 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-extrabold text-xs flex items-center justify-center gap-1.5 transition-all shadow-md active:scale-95"
                      >
                        <Play className="w-3 h-3 fill-current" />
                        <span>Bắt đầu</span>
                      </button>

                      <div className="flex items-center justify-between text-[10px] text-slate-500 dark:text-slate-400 font-mono">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3 text-slate-400 dark:text-slate-500" />
                          <span>120 phút</span>
                        </span>
                        <span>200 câu</span>
                      </div>
                    </div>
                  </div>

                  {/* Card 2: Thi Listening */}
                  <div className="p-4 rounded-2xl dark:bg-[#090e1a] bg-slate-50 border dark:border-slate-800/90 border-slate-200 flex flex-col justify-between space-y-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-blue-500 dark:text-blue-400">
                        <Headphones className="w-4 h-4" />
                        <h4 className="font-extrabold text-sm text-slate-900 dark:text-white">Thi Listening</h4>
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">Thi riêng phần nghe</p>
                    </div>

                    <div className="space-y-2">
                      <button
                        onClick={() => handleStartExam('listening')}
                        className="w-full py-2 px-3 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-extrabold text-xs flex items-center justify-center gap-1.5 transition-all shadow-md active:scale-95"
                      >
                        <Play className="w-3 h-3 fill-current" />
                        <span>Bắt đầu</span>
                      </button>

                      <div className="flex items-center justify-between text-[10px] text-slate-500 dark:text-slate-400 font-mono">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3 text-slate-400 dark:text-slate-500" />
                          <span>45 phút</span>
                        </span>
                        <span>100 câu</span>
                      </div>
                    </div>
                  </div>

                  {/* Card 3: Thi Reading */}
                  <div className="p-4 rounded-2xl dark:bg-[#090e1a] bg-slate-50 border dark:border-slate-800/90 border-slate-200 flex flex-col justify-between space-y-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
                        <BookOpen className="w-4 h-4" />
                        <h4 className="font-extrabold text-sm text-slate-900 dark:text-white">Thi Reading</h4>
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">Thi riêng phần đọc</p>
                    </div>

                    <div className="space-y-2">
                      <button
                        onClick={() => handleStartExam('reading')}
                        className="w-full py-2 px-3 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-extrabold text-xs flex items-center justify-center gap-1.5 transition-all shadow-md active:scale-95"
                      >
                        <Play className="w-3 h-3 fill-current" />
                        <span>Bắt đầu</span>
                      </button>

                      <div className="flex items-center justify-between text-[10px] text-slate-500 dark:text-slate-400 font-mono">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3 text-slate-400 dark:text-slate-500" />
                          <span>75 phút</span>
                        </span>
                        <span>100 câu</span>
                      </div>
                    </div>
                  </div>

                </div>

                {/* Bottom Card: Thi theo Part (Exact Dau TOEIC layout) */}
                <div className="p-5 rounded-2xl dark:bg-[#090e1a] bg-slate-50 border dark:border-slate-800 border-slate-200 space-y-4">
                  
                  {/* Top Bar of 'Thi theo Part' */}
                  <div className="flex items-center justify-between border-b dark:border-slate-800/80 border-slate-200 pb-3">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                        <h4 className="font-extrabold text-sm text-slate-900 dark:text-white">Thi theo Part</h4>
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">Chọn Part cụ thể để thi thử ({computedExamMinutes} phút)</p>
                    </div>

                    <button
                      onClick={() => handleStartExam('part')}
                      className="py-2 px-5 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-extrabold text-xs flex items-center gap-1.5 transition-all shadow-md active:scale-95"
                    >
                      <Play className="w-3.5 h-3.5 fill-current" />
                      <span>Bắt đầu</span>
                    </button>
                  </div>

                  {/* LISTENING SECTION CHECKBOXES */}
                  <div className="space-y-2">
                    <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider block">
                      LISTENING
                    </span>
                    <div className="grid grid-cols-2 gap-2">
                      {listeningPartOptions.map((p) => {
                        const isSelected = selectedExamParts.includes(p.id);
                        return (
                          <div
                            key={p.id}
                            onClick={() => toggleExamPartSelection(p.id)}
                            className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                              isSelected
                                ? 'bg-sky-500/15 border-sky-500 text-sky-700 dark:text-white font-bold'
                                : 'dark:bg-slate-950/60 bg-white border dark:border-slate-800 border-slate-200 dark:text-slate-400 text-slate-700 hover:text-slate-900 dark:hover:text-slate-200 dark:hover:bg-slate-900 hover:bg-slate-100/80'
                            }`}
                          >
                            <div className="flex items-center gap-2.5">
                              <div className={`w-4 h-4 rounded-full flex items-center justify-center border ${
                                isSelected ? 'bg-sky-500 border-sky-400 text-slate-950' : 'border-slate-300 dark:border-slate-600'
                              }`}>
                                {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-slate-950" />}
                              </div>
                              <span className="text-xs">{p.label}</span>
                            </div>
                            <span className="text-[11px] font-mono text-slate-400 dark:text-slate-500">{p.questions} câu</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* READING SECTION CHECKBOXES */}
                  <div className="space-y-2 pt-1">
                    <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider block">
                      READING
                    </span>
                    <div className="grid grid-cols-2 gap-2">
                      {readingPartOptions.map((p) => {
                        const isSelected = selectedExamParts.includes(p.id);
                        return (
                          <div
                            key={p.id}
                            onClick={() => toggleExamPartSelection(p.id)}
                            className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                              isSelected
                                ? 'bg-sky-500/15 border-sky-500 text-sky-700 dark:text-white font-bold'
                                : 'dark:bg-slate-950/60 bg-white border dark:border-slate-800 border-slate-200 dark:text-slate-400 text-slate-700 hover:text-slate-900 dark:hover:text-slate-200 dark:hover:bg-slate-900 hover:bg-slate-100/80'
                            }`}
                          >
                            <div className="flex items-center gap-2.5">
                              <div className={`w-4 h-4 rounded-full flex items-center justify-center border ${
                                isSelected ? 'bg-sky-500 border-sky-400 text-slate-950' : 'border-slate-300 dark:border-slate-600'
                              }`}>
                                {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-slate-950" />}
                              </div>
                              <span className="text-xs">{p.label}</span>
                            </div>
                            <span className="text-[11px] font-mono text-slate-400 dark:text-slate-500">{p.questions} câu</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                </div>

              </div>
            )}

            {/* TAB 2: PRACTICE BY PART (LUYỆN TẬP) */}
            {modalTab === 'practice' && (
              <div className="space-y-5 animate-fadeIn">
                <div className="space-y-2">
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block">Chọn các phần bạn muốn luyện:</span>
                  <div className="grid grid-cols-2 gap-2">
                    {allPartOptions.map((p) => {
                      const isSelected = selectedPracticeParts.includes(p.id);
                      return (
                        <div
                          key={p.id}
                          onClick={() => togglePracticePartSelection(p.id)}
                          className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                            isSelected
                              ? 'bg-emerald-500/15 border-emerald-500 text-emerald-700 dark:text-white font-bold'
                              : 'dark:bg-slate-950/60 bg-white border dark:border-slate-800 border-slate-200 dark:text-slate-400 text-slate-700 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100/80'
                          }`}
                        >
                          <div className="flex items-center gap-2.5">
                            <div className={`w-4 h-4 rounded-md flex items-center justify-center border ${
                              isSelected ? 'bg-emerald-500 border-emerald-400 text-slate-950' : 'border-slate-300 dark:border-slate-600'
                            }`}>
                              {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                            </div>
                            <span className="text-xs">{p.label}</span>
                          </div>
                          <span className="text-[11px] font-mono text-slate-400 dark:text-slate-500">{p.questions} câu</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="space-y-2">
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block">Giới hạn thời gian làm bài:</span>
                  <div className="grid grid-cols-4 gap-2">
                    {[
                      { id: 'unlimited', label: 'Không giới hạn' },
                      { id: '30', label: '30 phút' },
                      { id: '45', label: '45 phút' },
                      { id: '60', label: '60 phút' }
                    ].map((t) => (
                      <button
                        key={t.id}
                        onClick={() => setPracticeTimeLimit(t.id)}
                        className={`p-2.5 rounded-xl border text-center text-xs font-bold transition-all ${
                          practiceTimeLimit === t.id
                            ? 'bg-emerald-500 text-slate-950 border-emerald-500'
                            : 'dark:bg-slate-950 bg-white border dark:border-slate-800 border-slate-200 dark:text-slate-400 text-slate-600 hover:text-slate-900 dark:hover:text-white'
                        }`}
                      >
                        {t.label}
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  onClick={handleStartPractice}
                  className="w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-sm shadow-xl active:scale-95 transition-all flex items-center justify-center gap-2"
                >
                  <span>Bắt đầu luyện tập ({selectedPracticeParts.length} Parts)</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}

          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. QUICK SCORECARD POPUP (KHI BẤM BADGE ĐIỂM SỐ TRÊN CARD) */}
      {/* ========================================================================= */}
      {selectedScorecardTest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 dark:bg-slate-950/85 backdrop-blur-md animate-fadeIn">
          <div className="relative w-full max-w-lg rounded-3xl dark:bg-slate-900 bg-white border dark:border-slate-800 border-slate-200 p-6 sm:p-8 space-y-6 shadow-2xl">
            
            <div className="flex items-center justify-between border-b dark:border-slate-800 border-slate-200 pb-3">
              <div className="flex items-center gap-2">
                <Trophy className="w-5 h-5 text-amber-500 dark:text-amber-400" />
                <h3 className="font-heading font-extrabold text-lg text-slate-900 dark:text-white">Bảng Điểm TOEIC</h3>
              </div>
              <button
                onClick={() => setSelectedScorecardTest(null)}
                className="p-1.5 rounded-xl dark:bg-slate-800 bg-slate-100 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="text-center space-y-2">
              <p className="text-xs text-slate-500 dark:text-slate-400 font-mono">{selectedScorecardTest.title}</p>
              
              {(() => {
                const historyRecord = testHistory.find(h => h.testId === selectedScorecardTest._id);
                if (historyRecord) {
                  return (
                    <div className="space-y-4 pt-2">
                      <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-center space-y-1">
                        <span className="text-xs font-mono text-amber-600 dark:text-amber-400 uppercase font-bold">Điểm số cao nhất</span>
                        <div className="text-4xl font-black font-heading text-slate-900 dark:text-white">
                          {historyRecord.totalScore} <span className="text-base text-slate-400 font-normal">/ 990 PTS</span>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div className="p-3.5 rounded-2xl dark:bg-slate-950 bg-slate-50 border dark:border-slate-800 border-slate-200 text-center">
                          <span className="text-[10px] font-mono text-sky-600 dark:text-sky-400 uppercase font-bold block">Listening</span>
                          <span className="text-xl font-extrabold text-slate-900 dark:text-white">{historyRecord.listeningScore || 0} / 495</span>
                        </div>

                        <div className="p-3.5 rounded-2xl dark:bg-slate-950 bg-slate-50 border dark:border-slate-800 border-slate-200 text-center">
                          <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 uppercase font-bold block">Reading</span>
                          <span className="text-xl font-extrabold text-slate-900 dark:text-white">{historyRecord.readingScore || 0} / 495</span>
                        </div>
                      </div>
                    </div>
                  );
                }

                return (
                  <div className="py-8 text-center space-y-2">
                    <p className="text-sm font-bold text-slate-700 dark:text-slate-300">Chưa có kết quả làm bài</p>
                    <p className="text-xs text-slate-400">Bạn chưa nộp bài thi thử nào cho đề này.</p>
                  </div>
                );
              })()}
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={() => {
                  const t = selectedScorecardTest;
                  setSelectedScorecardTest(null);
                  setSelectedTestForModal(t);
                  setModalTab('exam');
                }}
                className="flex-1 py-3 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-extrabold text-xs transition-all"
              >
                Làm bài thi ngay
              </button>

              <button
                onClick={() => setSelectedScorecardTest(null)}
                className="px-5 py-3 rounded-xl dark:bg-slate-800 bg-slate-100 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-white font-bold text-xs"
              >
                Đóng
              </button>
            </div>

          </div>
        </div>
      )}

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
