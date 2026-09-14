import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../components/Navbar';
import PricingModal from '../components/PricingModal';
import TargetExamDateModal from '../components/TargetExamDateModal';
import DailyGoalSettingsModal from '../components/DailyGoalSettingsModal';
import SkillRadarAnalysisModal from '../components/SkillRadarAnalysisModal';
import SrsDailyReminderModal from '../components/SrsDailyReminderModal';
import usePageTitle from '../hooks/usePageTitle';
import { 
  Sparkles, 
  Target, 
  Calendar, 
  Flame, 
  Trophy, 
  Clock, 
  FileText, 
  BookOpen, 
  Headphones, 
  PenTool, 
  Video, 
  Settings,
  ArrowRight,
  Zap,
  CheckCircle2,
  Play,
  RotateCcw,
  Award,
  Mic,
  BookMarked,
  Crown,
  ChevronRight,
  HelpCircle,
  TrendingUp,
  Compass,
  Swords,
  ShieldCheck,
  Check,
  Plus,
  Minus,
  Layers,
  GraduationCap,
  Star,
  Activity,
  BarChart3,
  Bookmark,
  ExternalLink
} from 'lucide-react';
import { useStudyTime } from '../hooks/useStudyTime';
import { calculateStudyPace, generateGoogleCalendarUrl } from '../utils/studyPaceCalculator';

export default function Home() {
  usePageTitle('Trang Chủ - Luyện Thi TOEIC 4 Kỹ Năng Thông Minh');
  const navigate = useNavigate();
  const studyTime = useStudyTime();
  const [syncToastMessage, setSyncToastMessage] = useState('');

  // User Profile & Goal States (start as null, then hydrated from API)
  const [profile, setProfile] = useState({
    fullName: null,
    currentScore: 0,
    targetScore: 650,
    testDate: null,
    streakDays: 0,
    maxStreakDays: 0,
    totalXp: 0,
    studyTimeMinutes: 0,
    dailyGoals: {
      reading: { enabled: true, target: 30 },
      listening: { enabled: true, target: 30 },
      vocab: { enabled: true, target: 20 },
      mockTest: { enabled: true, target: 40 },
      video: { enabled: true, target: 2 }
    },
    todayProgress: {
      reading: 0,
      listening: 0,
      vocab: 0,
      mockTest: 0,
      video: 0,
      studyTimeMinutes: 0
    }
  });

  // UI Active Filters & Modals
  const [srsDueCount, setSrsDueCount] = useState(0);
  const [showSrsReminderModal, setShowSrsReminderModal] = useState(false);
  const [showPricingModal, setShowPricingModal] = useState(false);
  const [showTargetExamModal, setShowTargetExamModal] = useState(false);
  const [showDailyGoalModal, setShowDailyGoalModal] = useState(false);
  const [showRadarModal, setShowRadarModal] = useState(false);
  const [loading, setLoading] = useState(false);

  // Direct score editing states
  const [isEditingCurrent, setIsEditingCurrent] = useState(false);
  const [tempCurrentScore, setTempCurrentScore] = useState('');
  const [isEditingTarget, setIsEditingTarget] = useState(false);
  const [tempTargetScore, setTempTargetScore] = useState('');

  // Fetch User Profile, Goals & SRS Stats from MongoDB API
  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [profileRes, srsRes] = await Promise.allSettled([
        axios.get('/api/v1/user/profile'),
        axios.get('/api/v1/vocab/due-count')
      ]);

      if (profileRes.status === 'fulfilled' && profileRes.value.data?.data) {
        const d = profileRes.value.data.data;
        setProfile(prev => ({
          ...prev,
          ...d,
          dailyGoals: {
            ...prev.dailyGoals,
            ...(d.dailyGoals || {})
          },
          todayProgress: {
            ...prev.todayProgress,
            ...(d.todayProgress || {})
          }
        }));
      }

      if (srsRes.status === 'fulfilled' && srsRes.value.data?.dueCount !== undefined) {
        setSrsDueCount(srsRes.value.data.dueCount);
      }

      // Guest / Offline fallback: check local storage for saved goal
      try {
        const savedGoal = localStorage.getItem('tuong_tan_toeic_user_goal');
        if (savedGoal) {
          const parsed = JSON.parse(savedGoal);
          setProfile(prev => ({
            ...prev,
            currentScore: prev.currentScore !== undefined && prev.currentScore !== 0 ? prev.currentScore : (parsed.currentScore ?? 100),
            targetScore: prev.targetScore && prev.targetScore !== 650 ? prev.targetScore : (parsed.targetScore || 650),
            testDate: prev.testDate || parsed.testDate || null
          }));
        }
      } catch (e) {
        // ignore parse error
      }
    } catch (err) {
      console.warn('Dashboard sync notice:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Trigger SRS Daily Reminder Modal if there are due reviews and not shown today yet
  useEffect(() => {
    if (srsDueCount > 0) {
      try {
        const today = new Date().toISOString().slice(0, 10);
        const lastShown = localStorage.getItem('tuongtan_srs_reminder_date');
        if (lastShown !== today) {
          setShowSrsReminderModal(true);
        }
      } catch (e) {
        // ignore
      }
    }
  }, [srsDueCount]);

  const handleDismissSrsReminder = () => {
    try {
      const today = new Date().toISOString().slice(0, 10);
      localStorage.setItem('tuongtan_srs_reminder_date', today);
    } catch (e) {}
    setShowSrsReminderModal(false);
  };

  const handleStartSrsReview = () => {
    try {
      const today = new Date().toISOString().slice(0, 10);
      localStorage.setItem('tuongtan_srs_reminder_date', today);
    } catch (e) {}
    setShowSrsReminderModal(false);
    navigate('/vocabulary/review?tab=learn&study=flashcard');
  };

  // Handlers for Score Changes (Instant local update + localStorage + MongoDB sync)
  const handleScoreUpdate = async (newCurrent, newTarget, newTestDate) => {
    const nextCurrent = newCurrent !== undefined ? newCurrent : profile.currentScore;
    const nextTarget = newTarget !== undefined ? newTarget : profile.targetScore;
    const nextTestDate = newTestDate !== undefined ? newTestDate : profile.testDate;

    // Instant local state update for 0-latency UI
    setProfile(prev => ({
      ...prev,
      currentScore: nextCurrent,
      targetScore: nextTarget,
      testDate: nextTestDate
    }));

    // LocalStorage fallback for guests & resilience
    try {
      localStorage.setItem('tuong_tan_toeic_user_goal', JSON.stringify({
        currentScore: nextCurrent,
        targetScore: nextTarget,
        testDate: nextTestDate
      }));
    } catch (e) {
      // ignore
    }

    try {
      const payload = {
        currentScore: nextCurrent,
        targetScore: nextTarget,
        testDate: nextTestDate
      };
      const res = await axios.put('/api/v1/user/goal', payload);
      if (res.data?.data) {
        setProfile(prev => ({
          ...prev,
          currentScore: res.data.data.currentScore,
          targetScore: res.data.data.targetScore,
          testDate: res.data.data.testDate
        }));
      }
    } catch (err) {
      // Guest users get 401, but their goal is safely preserved in localStorage & React state
      console.warn('Backend goal sync notice (Guest fallback active):', err.message);
    }
  };

  const applyPaceToGoals = async (pace) => {
    if (!pace || !pace.hasDate) return;
    const newGoals = {
      ...(profile.dailyGoals || {}),
      listening: { enabled: true, target: pace.listeningDaily },
      reading: { enabled: true, target: pace.readingDaily },
      vocab: { enabled: true, target: pace.vocabDaily }
    };
    await handleSaveDailyGoals(newGoals);
    setSyncToastMessage(`⚡ Đã đồng bộ: ${pace.listeningDaily} câu Nghe + ${pace.readingDaily} câu Đọc + ${pace.vocabDaily} từ vựng/ngày!`);
    setTimeout(() => setSyncToastMessage(''), 4500);
  };

  const handleSaveTargetExamDate = async ({ targetScore, testDate, autoSyncDailyGoals, paceInfo }) => {
    await handleScoreUpdate(undefined, targetScore, testDate);
    if (autoSyncDailyGoals && paceInfo?.hasDate && paceInfo.daysRemaining >= 0) {
      await applyPaceToGoals(paceInfo);
    }
  };

  const handleSaveDailyGoals = async (dailyGoalsData) => {
    try {
      // Instant local state update
      setProfile(prev => ({
        ...prev,
        dailyGoals: dailyGoalsData
      }));

      // LocalStorage fallback
      try {
        localStorage.setItem('tuong_tan_toeic_daily_goals', JSON.stringify(dailyGoalsData));
      } catch (e) {}

      const res = await axios.put('/api/v1/user/daily-goals', { dailyGoals: dailyGoalsData });
      if (res.data?.data) {
        setProfile(prev => ({
          ...prev,
          dailyGoals: res.data.data.dailyGoals
        }));
      }
    } catch (err) {
      console.warn('Daily goals sync notice (Local state preserved):', err.message);
    }
  };

  const startEditingTarget = () => {
    setTempTargetScore(String(profile.targetScore || 650));
    setIsEditingTarget(true);
  };

  const commitTargetScore = () => {
    setIsEditingTarget(false);
    const parsed = parseInt(tempTargetScore, 10);
    if (!isNaN(parsed) && parsed > 0) {
      const rounded = Math.round(parsed / 5) * 5;
      const finalVal = Math.max(10, Math.min(990, rounded));
      handleScoreUpdate(undefined, finalVal, undefined);
    }
  };

  const startEditingCurrent = () => {
    setTempCurrentScore(String(profile.currentScore ?? 100));
    setIsEditingCurrent(true);
  };

  const commitCurrentScore = () => {
    setIsEditingCurrent(false);
    const parsed = parseInt(tempCurrentScore, 10);
    if (!isNaN(parsed) && parsed >= 0) {
      const rounded = Math.round(parsed / 5) * 5;
      const finalVal = Math.max(0, Math.min(990, rounded));
      handleScoreUpdate(finalVal, undefined, undefined);
    }
  };

  const handleCurrentScoreDelta = (delta) => {
    const current = profile.currentScore ?? 100;
    let nextVal;
    if (delta > 0) {
      if (current % 50 !== 0) {
        nextVal = Math.floor(current / 50) * 50 + 50;
      } else {
        nextVal = current + 50;
      }
    } else {
      if (current % 50 !== 0) {
        nextVal = Math.ceil(current / 50) * 50 - 50;
      } else {
        nextVal = current - 50;
      }
    }
    nextVal = Math.max(0, Math.min(990, nextVal));
    handleScoreUpdate(nextVal, undefined, undefined);
  };

  const handleTargetScoreDelta = (delta) => {
    const current = profile.targetScore || 650;
    let nextVal;
    if (delta > 0) {
      if (current % 50 !== 0) {
        nextVal = Math.floor(current / 50) * 50 + 50;
      } else {
        nextVal = current + 50;
      }
    } else {
      if (current % 50 !== 0) {
        nextVal = Math.ceil(current / 50) * 50 - 50;
      } else {
        nextVal = current - 50;
      }
    }
    nextVal = Math.max(10, Math.min(990, nextVal));
    handleScoreUpdate(undefined, nextVal, undefined);
  };

  // Calculations for Study Pace, Days & Gaps
  const paceInfo = calculateStudyPace(profile.currentScore ?? 100, profile.targetScore || 650, profile.testDate);
  const googleCalUrl = profile.testDate ? generateGoogleCalendarUrl(profile.testDate, profile.targetScore || 650) : null;
  const daysRemaining = paceInfo.daysRemaining;
  const missingScore = Math.max(0, (profile.targetScore || 650) - (profile.currentScore || 100));
  const completionPercent = profile.targetScore 
    ? Math.min(100, Math.round(((profile.currentScore || 100) / profile.targetScore) * 100))
    : 0;

  // Daily skill progress items
  const dailySkillItems = [
    {
      id: 'listening',
      label: 'Nghe Part 1-4',
      unit: 'câu',
      completed: profile.todayProgress?.listening || 0,
      target: profile.dailyGoals?.listening?.target || 30,
      enabled: profile.dailyGoals?.listening?.enabled ?? true,
      icon: Headphones,
      gradient: 'from-cyan-400 to-blue-500',
      badgeBg: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40',
      path: '/listen'
    },
    {
      id: 'reading',
      label: 'Đọc Part 5-7',
      unit: 'câu',
      completed: profile.todayProgress?.reading || 0,
      target: profile.dailyGoals?.reading?.target || 30,
      enabled: profile.dailyGoals?.reading?.enabled ?? true,
      icon: BookOpen,
      gradient: 'from-emerald-400 to-teal-500',
      badgeBg: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
      path: '/read'
    },
    {
      id: 'vocab',
      label: 'Từ vựng SM-2',
      unit: 'từ',
      completed: profile.todayProgress?.vocab || 0,
      target: profile.dailyGoals?.vocab?.target || 20,
      enabled: profile.dailyGoals?.vocab?.enabled ?? true,
      icon: Sparkles,
      gradient: 'from-amber-400 to-orange-500',
      badgeBg: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
      path: '/vocabulary'
    },
    {
      id: 'mockTest',
      label: 'Luyện đề ETS',
      unit: 'câu',
      completed: profile.todayProgress?.mockTest || 0,
      target: profile.dailyGoals?.mockTest?.target || 40,
      enabled: profile.dailyGoals?.mockTest?.enabled ?? true,
      icon: FileText,
      gradient: 'from-blue-400 to-indigo-500',
      badgeBg: 'bg-blue-500/20 text-blue-300 border-blue-500/40',
      path: '/tests'
    },
    {
      id: 'video',
      label: 'Video Vietsub',
      unit: 'bài',
      completed: profile.todayProgress?.video || 0,
      target: profile.dailyGoals?.video?.target || 2,
      enabled: profile.dailyGoals?.video?.enabled ?? true,
      icon: Video,
      gradient: 'from-rose-400 to-pink-500',
      badgeBg: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
      path: '/video'
    }
  ];

  const enabledSkills = dailySkillItems.filter(s => s.enabled);
  const completedGoalsCount = enabledSkills.filter(s => s.completed >= s.target).length;

  // 4 Core Study Modules with Rich Visual Presentation
  const coreModules = [
    {
      id: 'listen',
      title: 'Luyện Nghe Chuyên Sâu',
      subtitle: 'Part 1, 2, 3, 4 • Chép chính tả • Nhại giọng AI Shadowing',
      icon: Headphones,
      gradientIcon: 'from-cyan-400 via-sky-500 to-blue-600',
      glowColor: 'group-hover:shadow-cyan-500/30',
      borderColor: 'group-hover:border-cyan-400/60',
      tagText: '11.785 CÂU THẬT',
      tagStyle: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40',
      path: '/listen',
      features: ['Audio chuẩn giọng đọc ETS', 'Chép chính tả 3 chế độ', 'Nghe 24 chủ đề Part 3-4'],
      btnBg: 'btn-3d-cyan',
      btnText: 'LUYỆN NGHE NGAY'
    },
    {
      id: 'read',
      title: 'Luyện Đọc & Ngữ Pháp',
      subtitle: '5 Level Part 5-7 • 14 Chuyên đề Ngữ pháp • 75 Bài đọc song ngữ',
      icon: BookOpen,
      gradientIcon: 'from-emerald-400 via-teal-500 to-cyan-600',
      glowColor: 'group-hover:shadow-emerald-500/30',
      borderColor: 'group-hover:border-emerald-400/60',
      tagText: '8.164 CÂU ETS',
      tagStyle: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
      path: '/read',
      features: ['5 Cấp độ từ 350 đến 800+', '100% Giải thích tiếng Việt', 'Tra từ 1 chạm tích hợp'],
      btnBg: 'btn-3d-cyan',
      btnText: 'LUYỆN ĐỌC NGAY'
    },
    {
      id: 'vocab',
      title: 'Từ Vựng Siêu Trí Nhớ',
      subtitle: 'Thuật toán SM-2 SuperMemo • 2 Web Game Cyber Neon sống động',
      icon: Sparkles,
      gradientIcon: 'from-amber-400 via-orange-500 to-yellow-500',
      glowColor: 'group-hover:shadow-amber-500/30',
      borderColor: 'group-hover:border-amber-400/60',
      tagText: '3.515+ TỪ VỰNG',
      tagStyle: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
      path: '/vocabulary',
      features: ['83 Chủ đề đề thi thật', 'Game Word Blast bắn pháo', 'Flashcard 3D lật 2 chiều'],
      btnBg: 'btn-3d-amber',
      btnText: 'HỌC TỪ VỰNG NGAY'
    },
    {
      id: 'tests',
      title: '91 Đề Thi ETS Quốc Tế',
      subtitle: 'Full 200 Câu • 2 Cột No-scroll 100vh • Ước tính điểm chuẩn ETS',
      icon: FileText,
      gradientIcon: 'from-purple-400 via-indigo-500 to-blue-600',
      glowColor: 'group-hover:shadow-purple-500/30',
      borderColor: 'group-hover:border-purple-400/60',
      tagText: '18.200 CÂU THẬT',
      tagStyle: 'bg-purple-500/20 text-purple-300 border-purple-500/40',
      path: '/tests',
      features: ['Bộ đề 2019 đến 2026', 'Thang điểm chuẩn 10-990', 'Xuất bảng điểm PDF xịn'],
      btnBg: 'btn-3d-rose',
      btnText: 'VÀO PHÒNG THI THỬ'
    }
  ];

  return (
    <div className="min-h-screen dark:bg-[#080d1a] bg-[#f8fafc] dark:text-slate-100 text-slate-900 flex flex-col font-sans pb-20 selection:bg-cyan-500 selection:text-slate-950 relative overflow-hidden transition-colors duration-300">
      
      {/* GLOBAL AURORA AMBIENT LIGHTING */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] dark:bg-gradient-to-b dark:from-cyan-500/15 dark:via-indigo-500/10 bg-gradient-to-b from-sky-400/10 via-cyan-300/5 to-transparent blur-[140px] pointer-events-none" />
      <div className="absolute top-[600px] left-0 w-[500px] h-[500px] dark:bg-emerald-500/10 bg-emerald-500/5 blur-[130px] pointer-events-none" />
      <div className="absolute top-[900px] right-0 w-[600px] h-[600px] dark:bg-amber-500/10 bg-amber-500/5 blur-[150px] pointer-events-none" />

      <Navbar />

      <main className="flex-1 max-w-[1560px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10 animate-fadeIn relative z-10">
        
        {/* ========================================================================= */}
        {/* 1. HERO COCKPIT HEADER WITH DYNAMIC AVATAR & MOTIVATION */}
        {/* ========================================================================= */}
        <div className="relative overflow-hidden rounded-3xl p-6 sm:p-10 dark:bg-gradient-to-r dark:from-[#0d162d] dark:via-[#111e3f] dark:to-[#0d162d] bg-gradient-to-r from-sky-50 via-white to-cyan-50 dark:border-2 dark:border-cyan-500/30 border border-slate-200/90 shadow-xl dark:shadow-2xl space-y-6">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 relative z-10">
            
            {/* Left: Headline & Actions */}
            <div className="space-y-4 max-w-2xl">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full dark:bg-cyan-500/20 bg-cyan-500/10 border dark:border-cyan-500/40 border-cyan-500/30 dark:text-cyan-300 text-cyan-700 text-xs font-black uppercase tracking-wider shadow-sm">
                <Sparkles className="w-4 h-4 text-cyan-500 animate-spin-slow" />
                <span>NỀN TẢNG LUYỆN THI TOEIC 4 KỸ NĂNG THÔNG MINH</span>
              </div>
              
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black font-heading dark:text-white text-slate-900 tracking-tight leading-tight">
                Chào <span className="bg-gradient-to-r from-cyan-500 via-teal-500 to-amber-500 bg-clip-text text-transparent">{profile.fullName || (loading ? '...' : 'Học Viên')}</span>, sẵn sàng bứt phá hôm nay! 🚀
              </h1>
              
              <p className="dark:text-slate-300 text-slate-600 text-sm sm:text-base leading-relaxed">
                Mục tiêu hiện tại: <strong className="text-amber-500 dark:text-amber-400 font-mono font-black text-lg">{profile.targetScore || 650} PTS</strong>. Hệ thống AI đang chỉ ra <strong className="text-cyan-600 dark:text-cyan-300">3 điểm nghẽn trọng yếu</strong> giúp bạn tăng vọt 100+ điểm nhanh nhất.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <Link
                  to="/listen"
                  className="btn-3d-cyan w-full sm:w-auto justify-center px-6 py-3 rounded-2xl text-slate-950 font-black text-xs sm:text-sm flex items-center gap-2 cursor-pointer font-heading tracking-wide"
                >
                  <Play className="w-4 h-4 fill-slate-950" />
                  <span>VÀO LUYỆN HỌC NGAY</span>
                </Link>

                <button
                  onClick={() => setShowRadarModal(true)}
                  className="w-full sm:w-auto justify-center px-5 py-3 rounded-2xl dark:bg-[#172554]/80 bg-cyan-50 hover:bg-cyan-100 dark:hover:bg-[#1e3a8a] text-cyan-700 dark:text-cyan-300 font-extrabold text-xs border border-cyan-500/40 hover:border-cyan-400 active:scale-95 transition-all flex items-center gap-2 shadow-sm cursor-pointer"
                >
                  <Compass className="w-4 h-4 text-cyan-500" />
                  <span>Bản Đồ Radar 7 Kỹ Năng</span>
                </button>

                <button
                  onClick={() => setShowDailyGoalModal(true)}
                  className="w-full sm:w-auto justify-center px-5 py-3 rounded-2xl dark:bg-[#1e293b]/80 bg-slate-100 hover:bg-slate-200 dark:hover:bg-[#334155] text-slate-700 dark:text-slate-200 hover:text-slate-900 font-bold text-xs border dark:border-slate-700 border-slate-300 active:scale-95 transition-all flex items-center gap-2 shadow-sm cursor-pointer"
                >
                  <Settings className="w-4 h-4 text-slate-500" />
                  <span>Cài Đặt Mục Tiêu</span>
                </button>
              </div>
            </div>

            {/* Right: AI Coach Avatar & Level Badge */}
            <div className="w-full lg:w-auto p-4 sm:p-6 rounded-3xl dark:bg-[#080f24]/90 bg-white border dark:border-cyan-500/40 border-slate-200/90 shadow-xl flex items-center gap-4 sm:gap-5 shrink-0 backdrop-blur-2xl">
              <div className="relative shrink-0">
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-tr from-cyan-400 via-teal-400 to-amber-400 p-1 shadow-xl shadow-cyan-500/20">
                  <div className="w-full h-full dark:bg-[#0b1329] bg-slate-50 rounded-[12px] flex items-center justify-center text-3xl sm:text-4xl animate-float">
                    🎯
                  </div>
                </div>
                <span className="absolute -bottom-2 -right-2 px-2 py-0.5 rounded-full bg-amber-500 text-slate-950 font-black text-[10px] shadow font-mono">
                  PRO
                </span>
              </div>
              <div className="space-y-1.5 flex-1 max-w-[240px]">
                <div className="flex items-center gap-1 text-[11px] font-mono text-cyan-600 dark:text-cyan-400 font-extrabold uppercase">
                  <Flame className="w-3.5 h-3.5 text-amber-500 animate-pulse" />
                  <span>{profile.streakDays > 0 ? `CHUỖI ${profile.streakDays} NGÀY LIÊN TỤC` : 'KHỞI ĐỘNG CHUỖI HỌC 🔥'}</span>
                </div>
                <h4 className="font-heading font-black dark:text-white text-slate-900 text-sm">
                  Cấp Độ {Math.max(1, Math.floor((profile.totalXp || 0) / 100) + 1)} • {(profile.totalXp || 0) >= 1500 ? 'Đấu Thủ Kim Cương' : (profile.totalXp || 0) >= 800 ? 'Đấu Thủ Vàng' : (profile.totalXp || 0) >= 300 ? 'Đấu Thủ Bạc' : 'Tân Binh'}
                </h4>
                <p className="text-[11px] dark:text-slate-300 text-slate-600 leading-snug">
                  "Chỉ 20 phút mỗi ngày, điểm số sẽ tự nói lên sự nỗ lực của bạn!"
                </p>
              </div>
            </div>

          </div>
        </div>

        {/* ========================================================================= */}
        {/* 2. BENTO GRID COCKPIT (SCORE DIAL, DAILY GOALS, RADAR BOTTLE-NECKS) */}
        {/* ========================================================================= */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-6">
          
          {/* BENTO CARD 1: SCORE GAP & EXAM COUNTDOWN DIAL (5 cols) */}
          <div className="lg:col-span-5 rounded-3xl p-6 sm:p-7 dark:bg-[#0d162d]/90 bg-white border-2 dark:border-slate-700/60 border-slate-200/90 hover:border-cyan-500/50 shadow-xl dark:shadow-2xl flex flex-col justify-between space-y-6 relative overflow-hidden backdrop-blur-xl group transition-all">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black font-mono text-amber-500 dark:text-amber-400 uppercase tracking-wider flex items-center gap-2">
                <Target className="w-4 h-4" />
                <span>MỤC TIÊU ĐIỂM SỐ & NGÀY THI</span>
              </span>
              <button
                onClick={() => setShowTargetExamModal(true)}
                className="text-[11px] font-bold text-cyan-600 dark:text-cyan-400 hover:text-cyan-700 dark:hover:text-cyan-300 flex items-center gap-1 transition-colors px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30"
              >
                <span>Chỉnh sửa</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Score Comparison Display with Clickable Increments */}
            <div className="p-5 rounded-2xl dark:bg-[#080f24] bg-slate-50 border dark:border-slate-700/80 border-slate-200 grid grid-cols-2 gap-4 items-center shadow-inner">
              {/* Current Score */}
              <div className="space-y-1.5 text-center border-r dark:border-slate-700/80 border-slate-200 pr-3">
                <span className="text-[11px] font-mono dark:text-slate-400 text-slate-500 uppercase font-bold">Điểm Hiện Tại</span>
                <div className="flex items-center justify-center gap-2">
                  <button 
                    onClick={() => handleCurrentScoreDelta(-50)}
                    title="Giảm 50 điểm (tròn mốc 50)"
                    className="w-8 h-8 rounded-xl dark:bg-[#1e293b] bg-white hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 font-black text-sm flex items-center justify-center transition-all active:scale-90 shadow-sm shrink-0"
                  >
                    -
                  </button>

                  {isEditingCurrent ? (
                    <input
                      type="number"
                      min="0"
                      max="990"
                      step="5"
                      value={tempCurrentScore}
                      autoFocus
                      onChange={(e) => setTempCurrentScore(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') commitCurrentScore();
                        if (e.key === 'Escape') setIsEditingCurrent(false);
                      }}
                      onBlur={commitCurrentScore}
                      className="w-20 sm:w-24 text-center text-2xl sm:text-3xl font-black font-heading text-cyan-500 dark:text-cyan-400 bg-cyan-500/10 dark:bg-cyan-400/10 border-2 border-cyan-500 rounded-xl outline-none py-0.5 font-mono focus:ring-2 focus:ring-cyan-400/40"
                    />
                  ) : (
                    <div
                      onClick={startEditingCurrent}
                      className="group relative cursor-pointer px-2 py-0.5 rounded-xl hover:bg-cyan-500/10 transition-all flex items-center justify-center"
                      title="Nhấp để nhập trực tiếp điểm hiện tại"
                    >
                      <span className="text-3xl sm:text-4xl font-black font-heading text-cyan-500 dark:text-cyan-400 tracking-tight group-hover:scale-105 transition-transform">
                        {profile.currentScore ?? 100}
                      </span>
                      <span className="absolute -bottom-3 left-1/2 -translate-x-1/2 text-[9px] font-mono font-bold text-cyan-400/90 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap bg-slate-900/90 px-1 rounded shadow z-10">
                        Nhập số ✎
                      </span>
                    </div>
                  )}

                  <button 
                    onClick={() => handleCurrentScoreDelta(50)}
                    title="Tăng 50 điểm (tròn mốc 50)"
                    className="w-8 h-8 rounded-xl dark:bg-[#1e293b] bg-white hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 font-black text-sm flex items-center justify-center transition-all active:scale-90 shadow-sm shrink-0"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Target Score */}
              <div className="space-y-1.5 text-center pl-3">
                <span className="text-[11px] font-mono text-amber-500 dark:text-amber-400 uppercase font-extrabold">Mục Tiêu TOEIC</span>
                <div className="flex items-center justify-center gap-2">
                  <button 
                    onClick={() => handleTargetScoreDelta(-50)}
                    title="Giảm 50 điểm (tròn mốc 50)"
                    className="w-8 h-8 rounded-xl dark:bg-[#1e293b] bg-white hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 font-black text-sm flex items-center justify-center transition-all active:scale-90 shadow-sm shrink-0"
                  >
                    -
                  </button>

                  {isEditingTarget ? (
                    <input
                      type="number"
                      min="10"
                      max="990"
                      step="5"
                      value={tempTargetScore}
                      autoFocus
                      onChange={(e) => setTempTargetScore(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') commitTargetScore();
                        if (e.key === 'Escape') setIsEditingTarget(false);
                      }}
                      onBlur={commitTargetScore}
                      className="w-20 sm:w-24 text-center text-2xl sm:text-3xl font-black font-heading text-amber-500 dark:text-amber-400 bg-amber-500/10 dark:bg-amber-400/10 border-2 border-amber-500 rounded-xl outline-none py-0.5 font-mono focus:ring-2 focus:ring-amber-400/40"
                    />
                  ) : (
                    <div
                      onClick={startEditingTarget}
                      className="group relative cursor-pointer px-2 py-0.5 rounded-xl hover:bg-amber-500/10 transition-all flex items-center justify-center"
                      title="Nhấp để nhập trực tiếp mục tiêu TOEIC"
                    >
                      <span className="text-3xl sm:text-4xl font-black font-heading text-amber-500 dark:text-amber-400 tracking-tight group-hover:scale-105 transition-transform">
                        {profile.targetScore || 650}
                      </span>
                      <span className="absolute -bottom-3 left-1/2 -translate-x-1/2 text-[9px] font-mono font-bold text-amber-400/90 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap bg-slate-900/90 px-1 rounded shadow z-10">
                        Nhập số ✎
                      </span>
                    </div>
                  )}

                  <button 
                    onClick={() => handleTargetScoreDelta(50)}
                    title="Tăng 50 điểm (tròn mốc 50)"
                    className="w-8 h-8 rounded-xl dark:bg-[#1e293b] bg-white hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 font-black text-sm flex items-center justify-center transition-all active:scale-90 shadow-sm shrink-0"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>

            {/* Progress Bar & Exam Countdown */}
            <div className="space-y-3.5">
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-mono">
                  <span className="dark:text-slate-300 text-slate-600 font-medium">Tiến độ mục tiêu: <strong className="dark:text-cyan-300 text-cyan-600 font-bold">{completionPercent}%</strong></span>
                  <span className="text-amber-500 dark:text-amber-400 font-bold">Còn thiếu {missingScore} điểm</span>
                </div>
                <div className="w-full h-3.5 rounded-full dark:bg-[#080f24] bg-slate-200 overflow-hidden p-0.5 border dark:border-slate-700/80 border-slate-300 shadow-inner">
                  <div 
                    className="h-full rounded-full bg-gradient-to-r from-cyan-400 via-teal-400 to-amber-400 transition-all duration-500 shadow-md shadow-cyan-500/20"
                    style={{ width: `${completionPercent}%` }}
                  />
                </div>
              </div>

              {/* Exam Date Countdown & AI Pace Cockpit */}
              {profile.testDate ? (
                <div className="rounded-2xl dark:bg-[#080f24] bg-slate-50 border dark:border-slate-700/80 border-slate-200 overflow-hidden text-xs shadow-inner">
                  {/* Main Clickable Row */}
                  <div 
                    onClick={() => setShowTargetExamModal(true)}
                    className="p-3.5 flex items-center justify-between cursor-pointer hover:bg-slate-100/60 dark:hover:bg-slate-800/40 transition-colors group"
                    title="Nhấp để thay đổi ngày thi hoặc mục tiêu điểm số"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-500 dark:text-cyan-400 group-hover:scale-110 transition-transform">
                        <Calendar className="w-4 h-4 shrink-0" />
                      </div>
                      <div className="min-w-0">
                        <div className="font-heading font-bold dark:text-slate-200 text-slate-800 truncate">
                          Thi ngày: {new Date(profile.testDate).toLocaleDateString('vi-VN')}
                        </div>
                        <div className="text-[10px] text-slate-500 dark:text-slate-400 flex items-center gap-1">
                          <span>Chạm để đổi ngày</span>
                          <ChevronRight className="w-3 h-3 text-cyan-400" />
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span className={`px-2.5 py-1 rounded-full font-mono font-black text-xs border shadow-sm ${
                        paceInfo.daysRemaining >= 0
                          ? paceInfo.paceLevel === 'ideal'
                            ? 'dark:bg-emerald-500/20 bg-emerald-100 text-emerald-700 dark:text-emerald-300 border-emerald-400/40'
                            : paceInfo.paceLevel === 'moderate'
                              ? 'dark:bg-amber-500/20 bg-amber-100 text-amber-700 dark:text-amber-300 border-amber-400/40'
                              : 'dark:bg-rose-500/20 bg-rose-100 text-rose-700 dark:text-rose-300 border-rose-400/40'
                          : 'bg-slate-800 text-slate-400 border-slate-700'
                      }`}>
                        {paceInfo.daysRemaining >= 0 ? `⏳ Còn ${paceInfo.daysRemaining} ngày` : 'Đã qua ngày thi'}
                      </span>
                    </div>
                  </div>

                  {/* AI Study Pace Sub-bar */}
                  {paceInfo.hasDate && paceInfo.daysRemaining >= 0 && (
                    <div className="px-3.5 py-2.5 bg-cyan-500/5 dark:bg-cyan-950/20 border-t dark:border-slate-800/80 border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="text-[11px] dark:text-slate-300 text-slate-600 flex items-center gap-1.5 flex-wrap">
                        <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                        <span>
                          Mỗi ngày: <strong className="text-cyan-600 dark:text-cyan-400">{paceInfo.listeningDaily} Nghe</strong> + <strong className="text-emerald-600 dark:text-emerald-400">{paceInfo.readingDaily} Đọc</strong> + <strong className="text-amber-500 dark:text-amber-400">{paceInfo.vocabDaily} Từ</strong> (~{paceInfo.estimatedMinutesPerDay}p)
                        </span>
                      </div>

                      <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            applyPaceToGoals(paceInfo);
                          }}
                          className="px-2.5 py-1 rounded-lg bg-cyan-500/15 hover:bg-cyan-500/25 text-cyan-600 dark:text-cyan-300 font-bold text-[10px] border border-cyan-500/30 flex items-center gap-1 transition-all active:scale-95 shadow-sm cursor-pointer"
                          title="Đồng bộ ngay chỉ tiêu này vào Mục tiêu hôm nay"
                        >
                          <Zap className="w-3 h-3 text-cyan-400" />
                          <span>Áp dụng chỉ tiêu</span>
                        </button>

                        {googleCalUrl && (
                          <a
                            href={googleCalUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="px-2.5 py-1 rounded-lg bg-amber-500/15 hover:bg-amber-500/25 text-amber-600 dark:text-amber-300 font-bold text-[10px] border border-amber-500/30 flex items-center gap-1 transition-all active:scale-95 shadow-sm"
                            title="Thêm lịch thi vào Google Calendar"
                          >
                            <ExternalLink className="w-3 h-3" />
                            <span>Google Cal</span>
                          </a>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                /* When Test Date is not yet set: Interactive Clickable CTA */
                <div 
                  onClick={() => setShowTargetExamModal(true)}
                  className="p-3.5 rounded-2xl dark:bg-[#080f24] bg-slate-50 border-2 border-dashed dark:border-cyan-500/30 border-cyan-500/40 hover:border-cyan-400 flex items-center justify-between text-xs cursor-pointer group transition-all duration-300 hover:shadow-lg hover:shadow-cyan-500/10 hover:bg-cyan-500/5 dark:hover:bg-cyan-950/20"
                  title="Nhấp để đặt ngày thi và tính lộ trình AI"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-500 dark:text-cyan-400 group-hover:scale-110 group-hover:bg-cyan-500 group-hover:text-slate-950 transition-all">
                      <Calendar className="w-4 h-4 shrink-0" />
                    </div>
                    <div>
                      <span className="dark:text-slate-200 text-slate-800 font-bold group-hover:text-cyan-500 transition-colors">
                        Chưa đặt ngày thi
                      </span>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400">
                        Đặt lịch để AI tính khối lượng học mỗi ngày
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowTargetExamModal(true);
                    }}
                    className="px-4 py-1.5 rounded-full bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-400 hover:to-teal-400 text-slate-950 font-mono font-black text-xs shadow-md shadow-cyan-500/20 transition-all group-hover:scale-105 active:scale-95 flex items-center gap-1 cursor-pointer"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Đặt lịch ngay</span>
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* BENTO CARD 2: MỤC TIÊU HÔM NAY (4 cols) */}
          <div className="lg:col-span-4 rounded-3xl p-6 sm:p-7 dark:bg-[#0d162d]/90 bg-white border-2 dark:border-slate-700/60 border-slate-200/90 hover:border-cyan-500/50 shadow-xl dark:shadow-2xl flex flex-col justify-between space-y-4 backdrop-blur-xl transition-all">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black font-mono text-cyan-600 dark:text-cyan-400 uppercase tracking-wider flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                <span>MỤC TIÊU HÔM NAY ({completedGoalsCount}/{enabledSkills.length})</span>
                {paceInfo.hasDate && paceInfo.daysRemaining >= 0 && (
                  <span className="text-[10px] font-mono text-cyan-500 dark:text-cyan-300 bg-cyan-500/10 px-2 py-0.5 rounded-full border border-cyan-500/30">
                    D-{paceInfo.daysRemaining}
                  </span>
                )}
              </span>
              <button
                onClick={() => setShowDailyGoalModal(true)}
                className="p-2 rounded-xl dark:bg-[#1e293b] bg-slate-100 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors"
                title="Cài đặt chỉ tiêu hàng ngày"
              >
                <Settings className="w-4 h-4" />
              </button>
            </div>

            {/* 5 Skills Progress rows */}
            <div className="space-y-2.5">
              {dailySkillItems.map((skill) => {
                if (!skill.enabled) return null;
                const pct = Math.min(100, Math.round((skill.completed / skill.target) * 100));
                const Icon = skill.icon;

                return (
                  <Link
                    key={skill.id}
                    to={skill.path}
                    className="p-3 rounded-2xl dark:bg-[#080f24] bg-slate-50 border dark:border-slate-700/70 border-slate-200 hover:border-cyan-500/50 hover:bg-slate-100 dark:hover:bg-[#111e3f] flex items-center justify-between gap-3 transition-all group"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`p-1.5 rounded-lg bg-gradient-to-tr ${skill.gradient} text-slate-950 shadow shrink-0`}>
                        <Icon className="w-3.5 h-3.5" />
                      </div>
                      <span className="text-xs font-bold dark:text-slate-200 text-slate-700 group-hover:text-cyan-600 dark:group-hover:text-cyan-300 transition-colors">{skill.label}</span>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="w-20 sm:w-24 h-2 rounded-full dark:bg-[#1e293b] bg-slate-200 overflow-hidden">
                        <div 
                          className={`h-full rounded-full bg-gradient-to-r ${skill.gradient} transition-all duration-500`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <span className="text-[11px] font-mono font-bold dark:text-slate-300 text-slate-600 min-w-[40px] text-right">
                        {skill.completed}/{skill.target}
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>

            <div className="text-[11px] dark:text-slate-400 text-slate-500 text-center font-medium pt-1">
              {completedGoalsCount === enabledSkills.length && enabledSkills.length > 0
                ? '🎉 Xuất sắc! Bạn đã hoàn thành 100% mục tiêu hôm nay!'
                : 'Duy trì đủ 5 kỹ năng để giữ ngọn lửa Streak rực cháy 🔥'}
            </div>
          </div>

          {/* BENTO CARD 3: ĐỘNG LỰC & RANKING (3 cols) */}
          <div className="lg:col-span-3 rounded-3xl p-6 sm:p-7 dark:bg-[#0d162d]/90 bg-white border-2 dark:border-slate-700/60 border-slate-200/90 hover:border-cyan-500/50 shadow-xl dark:shadow-2xl flex flex-col justify-between space-y-4 backdrop-blur-xl transition-all">
            <span className="text-xs font-black font-mono text-rose-500 dark:text-rose-400 uppercase tracking-wider flex items-center gap-2">
              <Flame className="w-4 h-4" />
              <span>ĐỘNG LỰC & ĐẤU TRƯỜNG</span>
            </span>

            <div className="space-y-3.5 font-mono">
              {/* Streak Pill */}
              <div className="p-4 rounded-2xl dark:bg-[#080f24] bg-amber-50/70 border border-amber-500/30 flex items-center justify-between shadow-inner">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-500 dark:text-amber-400 shadow-sm">
                    <Flame className="w-5 h-5 fill-amber-400 streak-glow animate-pulse" />
                  </div>
                  <div>
                    <span className="text-[10px] dark:text-slate-400 text-slate-500 font-sans block font-bold">Chuỗi Lửa Streak</span>
                    <span className="text-base font-black text-amber-600 dark:text-amber-400">{profile.streakDays || 0} ngày liên tục</span>
                  </div>
                </div>
              </div>

              {/* Realtime Today Study Time Box */}
              <div className="p-4 rounded-2xl dark:bg-[#080f24] bg-sky-50/70 border border-sky-500/30 flex items-center justify-between shadow-inner">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-sky-500/20 text-sky-500 dark:text-sky-400 shadow-sm">
                    <Clock className="w-5 h-5 animate-pulse" />
                  </div>
                  <div>
                    <span className="text-[10px] dark:text-slate-400 text-slate-500 font-sans block font-bold">Thời Gian Học Hôm Nay</span>
                    <span className="text-base font-black text-sky-600 dark:text-sky-300">{studyTime.formatted} <span className="text-[10px] font-normal dark:text-slate-400 text-slate-500 font-sans">(Trực tiếp)</span></span>
                  </div>
                </div>
              </div>

              {/* Lifetime XP */}
              <div className="p-4 rounded-2xl dark:bg-[#080f24] bg-cyan-50/70 border border-cyan-500/30 flex items-center justify-between shadow-inner">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-cyan-500/20 text-cyan-500 dark:text-cyan-400 shadow-sm">
                    <Zap className="w-5 h-5 text-cyan-500 dark:text-cyan-400" />
                  </div>
                  <div>
                    <span className="text-[10px] dark:text-slate-400 text-slate-500 font-sans block font-bold">Tổng Điểm XP</span>
                    <span className="text-base font-black text-cyan-600 dark:text-cyan-300">{(profile.totalXp || 0).toLocaleString('vi-VN')} XP</span>
                  </div>
                </div>
              </div>
            </div>

            <Link
              to="/leaderboard"
              className="w-full py-3 px-4 rounded-2xl dark:bg-[#1e293b] bg-slate-100 hover:bg-slate-200 dark:hover:bg-slate-700 text-amber-600 dark:text-amber-400 font-extrabold text-xs flex items-center justify-center gap-2 transition-all border border-amber-500/30 shadow-sm active:scale-95"
            >
              <Trophy className="w-4 h-4 text-amber-500 dark:text-amber-400" />
              <span>Xem Bảng Xếp Hạng</span>
            </Link>
          </div>

        </div>

        {/* ========================================================================= */}
        {/* 3. STICKY SPACED REPETITION (SRS) DUE REVIEW WIDGET BANNER */}
        {/* ========================================================================= */}
        <div className="relative overflow-hidden rounded-3xl p-6 sm:p-7 dark:bg-gradient-to-r dark:from-[#291b0d] dark:via-[#101b35] dark:to-[#15102a] bg-gradient-to-r from-amber-50 via-orange-50 to-amber-100/60 border-2 dark:border-amber-500/50 border-amber-300 shadow-xl dark:shadow-2xl flex flex-col sm:flex-row items-center justify-between gap-5">
          <div className="flex items-center gap-4">
            <div className="p-4 rounded-2xl bg-gradient-to-tr from-amber-400 to-yellow-500 text-slate-950 shadow-xl shadow-amber-500/30 shrink-0">
              <Sparkles className="w-7 h-7 animate-spin-slow" />
            </div>
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <span className="px-3 py-0.5 rounded-full dark:bg-amber-500/20 bg-amber-100 text-amber-800 dark:text-amber-300 text-[10px] font-black border border-amber-500/40 uppercase tracking-wider">
                  THUẬT TOÁN SM-2 SUPERMEMO
                </span>
                <span className="text-xs font-bold text-amber-700 dark:text-amber-400">
                  {srsDueCount > 0 ? 'Đến hạn ôn tập hôm nay' : 'Trạng thái ôn tập tối ưu'}
                </span>
              </div>
              <h3 className="text-lg sm:text-xl font-black font-heading dark:text-white text-slate-900">
                {srsDueCount > 0 
                  ? `Bạn có ${srsDueCount} từ vựng cần ôn tập để chuyển vào trí nhớ dài hạn`
                  : 'Hôm nay bạn không có từ vựng nào cần ôn tập 🎉'}
              </h3>
              <p className="text-xs dark:text-slate-300 text-slate-600">
                {srsDueCount > 0
                  ? 'Ôn ngắt quãng 3 phút mỗi ngày giúp ghi nhớ từ vựng TOEIC vĩnh viễn không quên.'
                  : 'Toàn bộ từ đã được xếp lịch theo thuật toán SM-2. Hãy khám phá và học thêm các bài học mới!'}
              </p>
            </div>
          </div>

          {srsDueCount > 0 ? (
            <Link
              to="/vocabulary/review?tab=learn&study=flashcard"
              className="btn-3d-amber w-full sm:w-auto py-3.5 px-8 rounded-2xl text-slate-950 font-black text-xs sm:text-sm flex items-center justify-center gap-2 shrink-0 cursor-pointer font-heading tracking-wide"
            >
              <span>ÔN TẬP NGAY ({srsDueCount} TỪ)</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          ) : (
            <Link
              to="/vocabulary"
              className="btn-3d-amber w-full sm:w-auto py-3.5 px-8 rounded-2xl text-slate-950 font-black text-xs sm:text-sm flex items-center justify-center gap-2 shrink-0 cursor-pointer font-heading tracking-wide"
            >
              <span>HỌC TỪ MỚI NGAY</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          )}
        </div>

        {/* ========================================================================= */}
        {/* 4. 4 CORE STUDY MODULES (EMBOSSED 3D CARDS WITH RICH STATS) */}
        {/* ========================================================================= */}
        <div className="space-y-5">
          <div className="space-y-1">
            <h2 className="text-2xl sm:text-3xl font-black font-heading dark:text-white text-slate-900 tracking-tight">
              Lộ Trình Luyện Thi Toàn Diện 📚
            </h2>
            <p className="text-xs sm:text-sm dark:text-slate-400 text-slate-600">
              4 Phân hệ kiến thức bám sát 100% cấu trúc đề thi thật ETS mới nhất 2026
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {coreModules.map((mod) => {
              const Icon = mod.icon;
              return (
                <div
                  key={mod.id}
                  className={`rounded-3xl p-6 sm:p-7 dark:bg-[#0d162d]/90 bg-white border-2 dark:border-slate-700/70 border-slate-200/90 ${mod.borderColor} ${mod.glowColor} shadow-xl dark:shadow-2xl flex flex-col justify-between space-y-6 transition-all duration-300 hover:scale-[1.02] group relative overflow-hidden backdrop-blur-xl`}
                >
                  <div className="space-y-4">
                    {/* Top Icon & Badge */}
                    <div className="flex items-center justify-between">
                      <div className={`p-4 rounded-2xl bg-gradient-to-tr ${mod.gradientIcon} text-slate-950 shadow-xl shrink-0 group-hover:scale-110 transition-transform`}>
                        <Icon className="w-6 h-6" />
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-black font-mono border ${mod.tagStyle}`}>
                        {mod.tagText}
                      </span>
                    </div>

                    {/* Title & Subtitle */}
                    <div className="space-y-1.5">
                      <h3 className="text-xl font-black font-heading dark:text-white text-slate-900 group-hover:text-cyan-600 dark:group-hover:text-cyan-300 transition-colors">
                        {mod.title}
                      </h3>
                      <p className="text-xs dark:text-slate-400 text-slate-600 line-clamp-2 leading-relaxed">{mod.subtitle}</p>
                    </div>

                    {/* Feature bullet points */}
                    <div className="space-y-2 pt-3 border-t dark:border-slate-700/80 border-slate-100 text-xs dark:text-slate-300 text-slate-600">
                      {mod.features.map((feat, i) => (
                        <div key={i} className="flex items-center gap-2">
                          <Check className="w-4 h-4 text-cyan-500 dark:text-cyan-400 shrink-0" />
                          <span>{feat}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Action CTA Button */}
                  <Link
                    to={mod.path}
                    className={`${mod.btnBg} w-full py-3.5 px-4 rounded-2xl text-slate-950 font-black text-xs flex items-center justify-center gap-2 cursor-pointer font-heading tracking-wide`}
                  >
                    <span>{mod.btnText}</span>
                    <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                  </Link>
                </div>
              );
            })}
          </div>
        </div>

        {/* ========================================================================= */}
        {/* 5. ARENA & GAMIFICATION SHOWCASE (1V1 BATTLE, RADAR & NOTEBOOK) */}
        {/* ========================================================================= */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Card 1: 1v1 Battle Arena */}
          <div className="rounded-3xl p-6 sm:p-7 dark:bg-gradient-to-b dark:from-[#2e1022]/80 dark:via-[#0d162d] dark:to-[#080f24] bg-gradient-to-b from-rose-50/70 via-white to-rose-50/30 border-2 dark:border-rose-500/40 border-rose-200 hover:border-rose-400 shadow-xl dark:shadow-2xl space-y-4 flex flex-col justify-between backdrop-blur-xl">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="px-3 py-1 rounded-full bg-rose-500/20 text-rose-600 dark:text-rose-300 text-[10px] font-black border border-rose-500/30 uppercase tracking-wider">
                  🔥 ĐỐI KHÁNG TỐC ĐỘ
                </span>
                <span className="text-xs font-mono font-bold text-amber-500 dark:text-amber-400">+100 XP Thưởng</span>
              </div>
              <h3 className="text-xl font-black font-heading dark:text-white text-slate-900">
                Đấu Trường 1v1 Real-Time ⚔️
              </h3>
              <p className="text-xs dark:text-slate-300 text-slate-600 leading-relaxed">
                Ghép trận trực tiếp và so tài 10 câu Part 5 tốc độ cao với các học viên cùng bậc rank trên toàn quốc.
              </p>
            </div>

            <Link
              to="/battle"
              className="btn-3d-rose w-full py-3.5 px-4 rounded-2xl text-white font-black text-xs flex items-center justify-center gap-2 cursor-pointer font-heading tracking-wide"
            >
              <Swords className="w-4 h-4" />
              <span>TÌM TRẬN ĐẤU 1V1 NGAY</span>
            </Link>
          </div>

          {/* Card 2: AI Skill Radar & Score Prediction */}
          <div className="rounded-3xl p-6 sm:p-7 dark:bg-gradient-to-b dark:from-[#0a2338]/80 dark:via-[#0d162d] dark:to-[#080f24] bg-gradient-to-b from-cyan-50/70 via-white to-cyan-50/30 border-2 dark:border-cyan-500/40 border-cyan-200 hover:border-cyan-400 shadow-xl dark:shadow-2xl space-y-4 flex flex-col justify-between backdrop-blur-xl">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="px-3 py-1 rounded-full bg-cyan-500/20 text-cyan-600 dark:text-cyan-300 text-[10px] font-black border border-cyan-500/30 uppercase tracking-wider">
                  📊 DỰ BÁO NĂNG LỰC
                </span>
                <span className="text-xs font-mono font-bold text-cyan-600 dark:text-cyan-400">~660 PTS</span>
              </div>
              <h3 className="text-xl font-black font-heading dark:text-white text-slate-900">
                Bản Đồ Radar 7 Kỹ Năng 🕸️
              </h3>
              <p className="text-xs dark:text-slate-300 text-slate-600 leading-relaxed">
                Tự động phân tích điểm mạnh, phát hiện các điểm nghẽn kéo tụt điểm và xây dựng lộ trình bứt phá mục tiêu TOEIC của riêng bạn.
              </p>
            </div>

            <button
              onClick={() => setShowRadarModal(true)}
              className="btn-3d-cyan w-full py-3.5 px-4 rounded-2xl text-slate-950 font-black text-xs flex items-center justify-center gap-2 cursor-pointer font-heading tracking-wide"
            >
              <Compass className="w-4 h-4 text-slate-950" />
              <span>XEM RADAR & DỰ BÁO ĐIỂM</span>
            </button>
          </div>

          {/* Card 3: Sổ Tay Câu Sai & Lỗ Hổng Kiến Thức */}
          <div className="rounded-3xl p-6 sm:p-7 dark:bg-gradient-to-b dark:from-[#21133b]/80 dark:via-[#0d162d] dark:to-[#080f24] bg-gradient-to-b from-purple-50/70 via-white to-purple-50/30 border-2 dark:border-purple-500/40 border-purple-200 hover:border-purple-400 shadow-xl dark:shadow-2xl space-y-4 flex flex-col justify-between backdrop-blur-xl">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="px-3 py-1 rounded-full bg-purple-500/20 text-purple-600 dark:text-purple-300 text-[10px] font-black border border-purple-500/30 uppercase tracking-wider">
                  📓 TỰ ĐỘNG GHI NHẬN
                </span>
                <span className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400">Closed-Loop</span>
              </div>
              <h3 className="text-xl font-black font-heading dark:text-white text-slate-900">
                Sổ Tay Câu Sai Thông Minh 🛡️
              </h3>
              <p className="text-xs dark:text-slate-300 text-slate-600 leading-relaxed">
                Mọi câu trả lời sai từ Đề thi và Bài đọc đều được tự động lưu lại để ôn tập cho đến khi thành thạo 100%.
              </p>
            </div>

            <Link
              to="/mistakes"
              className="w-full py-3.5 px-4 rounded-2xl bg-purple-600 hover:bg-purple-500 text-white font-black text-xs shadow-xl shadow-purple-600/30 flex items-center justify-center gap-2 transition-all active:scale-95 border border-purple-400/40 font-heading tracking-wide"
            >
              <BookMarked className="w-4 h-4" />
              <span>VÀO ÔN LẠI CÂU SAI</span>
            </Link>
          </div>

        </div>

      </main>

      {/* ========================================================================= */}
      {/* MODALS & NOTIFICATIONS */}
      {/* ========================================================================= */}
      {syncToastMessage && (
        <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50 px-5 py-3 rounded-2xl bg-slate-900/95 border border-cyan-500/50 text-cyan-300 shadow-2xl backdrop-blur-xl flex items-center gap-2.5 text-xs font-bold animate-fade-in pointer-events-none">
          <Zap className="w-4 h-4 text-cyan-400 shrink-0 animate-pulse" />
          <span>{syncToastMessage}</span>
        </div>
      )}

      <TargetExamDateModal
        isOpen={showTargetExamModal}
        onClose={() => setShowTargetExamModal(false)}
        currentScore={profile.currentScore ?? 100}
        initialTargetScore={profile.targetScore || 650}
        initialTestDate={profile.testDate}
        onSave={handleSaveTargetExamDate}
      />

      <DailyGoalSettingsModal
        isOpen={showDailyGoalModal}
        onClose={() => setShowDailyGoalModal(false)}
        initialGoals={profile.dailyGoals}
        onSave={handleSaveDailyGoals}
      />

      <PricingModal 
        isOpen={showPricingModal}
        onClose={() => setShowPricingModal(false)}
      />

      <SkillRadarAnalysisModal
        isOpen={showRadarModal}
        onClose={() => setShowRadarModal(false)}
      />

      <SrsDailyReminderModal
        isOpen={showSrsReminderModal}
        onClose={handleDismissSrsReminder}
        dueCount={srsDueCount}
        onStartReview={handleStartSrsReview}
      />

    </div>
  );
}
