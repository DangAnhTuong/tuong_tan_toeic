import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Navbar from '../components/Navbar';
import { 
  Trophy, 
  Flame, 
  Clock, 
  Share2, 
  Award, 
  Zap, 
  Users, 
  ChevronDown,
  Sparkles,
  ShieldCheck,
  Crown,
  Timer,
  CheckCircle2,
  Gift,
  ArrowRight,
  TrendingUp
} from 'lucide-react';
import { Link } from 'react-router-dom';
import UserProfilePopover from '../components/UserProfilePopover';
import AvatarWithCrownFrame from '../components/AvatarWithCrownFrame';
import { useStudyTime } from '../hooks/useStudyTime';
import { syncStudyTimeNow } from '../utils/studyTimeTracker';
import usePageTitle from '../hooks/usePageTitle';

export default function Leaderboard() {
  usePageTitle(
    'Bảng Xếp Hạng Học Viên Xuất Sắc — Vinh Danh Cao Thủ TOEIC',
    'Bảng vàng vinh danh những học viên có chuỗi streak học tập ấn tượng, thời gian rèn luyện cao nhất và điểm số thi thử xuất sắc trên Tường Tận TOEIC.'
  );

  const [metricTab, setMetricTab] = useState('xp'); // 'xp' | 'time' | 'streak'
  const [timeFilter, setTimeFilter] = useState('week'); // 'today' | 'week' | 'month' | 'all'
  const [rankingsList, setRankingsList] = useState([]);
  const [arenaData, setArenaData] = useState(null);
  const [currentUserStats, setCurrentUserStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedUserForModal, setSelectedUserForModal] = useState(null);
  const [hallOfFameList, setHallOfFameList] = useState([
    { title: 'BẬC THẦY TRI THỨC', name: 'Thuấn Trần Hữu', achievement: '128.923 XP', xp: 128923, targetScore: '990', streak: 45, level: 25, timeSpent: '128h 45p', badgeType: 'xp' },
    { title: 'HUYỀN THOẠI CHUỖI', name: 'Ngọc Nguyễn', achievement: '168 ngày streak', xp: 95400, targetScore: '900', streak: 168, level: 22, timeSpent: '96h 20p', badgeType: 'streak' },
    { title: 'THỦ KHOA ĐỀ THI', name: 'Minh Trương', achievement: '990/990 Điểm ETS', xp: 87200, targetScore: '990', streak: 30, level: 20, timeSpent: '84h 10p', badgeType: 'score' }
  ]);

  // Live Countdown State
  const [countdown, setCountdown] = useState({ days: 3, hours: 14, minutes: 28, seconds: 45 });

  const fallbackRankings = [
    { _id: '1', user: 'Mục tiêu 850 TOEIC', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=MucTieu850', scoreValue: '4.767 XP', numericValue: 4767, timeSpent: '115h 00p', streakDays: 7, isWeeklyChampion: true, prizeLabel: '👑 Quán Quân Tuần', targetScore: '850', isBot: true },
    { _id: '2', user: 'deadline dí', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=DeadlineDi', scoreValue: '4.347 XP', numericValue: 4347, timeSpent: '60h 00p', streakDays: 4, prizeLabel: '⚡ Top 2 - Nhận 500 XP', targetScore: '750', isBot: true },
    { _id: '3', user: 'Ken', avatar: 'https://api.dicebear.com/7.x/personas/svg?seed=KenPro', scoreValue: '4.205 XP', numericValue: 4205, timeSpent: '68h 20p', streakDays: 4, prizeLabel: '🔥 Top 3 - Nhận 300 XP', targetScore: '900', isBot: true },
    { _id: '4', user: 'nhớ người yêu cũ', avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=NguoiYeuCu', scoreValue: '3.940 XP', numericValue: 3940, timeSpent: '113h 20p', streakDays: 8, targetScore: '850', isBot: true },
    { _id: '5', user: 'TOEIC 990 or Die', avatar: 'https://api.dicebear.com/7.x/personas/svg?seed=Toeic990OrDie', scoreValue: '3.881 XP', numericValue: 3881, timeSpent: '158h 20p', streakDays: 31, targetScore: '990', isBot: true },
    { _id: '6', user: 'fan cứng ETS', avatar: 'https://api.dicebear.com/7.x/open-peeps/svg?seed=FanCungETS', scoreValue: '3.520 XP', numericValue: 3520, timeSpent: '136h 40p', streakDays: 24, targetScore: '950', isBot: true },
    { _id: '7', user: 'trùm Part 5', avatar: 'https://api.dicebear.com/7.x/personas/svg?seed=TrumPart5', scoreValue: '3.410 XP', numericValue: 3410, timeSpent: '51h 40p', streakDays: 19, targetScore: '900', isBot: true },
    { _id: '8', user: 'Bảo Trâm', avatar: 'https://api.dicebear.com/7.x/personas/svg?seed=BaoTram', scoreValue: '3.380 XP', numericValue: 3380, timeSpent: '143h 20p', streakDays: 26, targetScore: '900', isBot: true },
    { _id: '9', user: 'Thu', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=ThuCute', scoreValue: '1.497 XP', numericValue: 1497, timeSpent: '148h 20p', streakDays: 62, targetScore: '900', isBot: true },
    { _id: '10', user: 'Mất gốc cày lại', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=MatGocCayLai', scoreValue: '2.056 XP', numericValue: 2056, timeSpent: '190h 00p', streakDays: 22, targetScore: '650', isBot: true }
  ];

  const [recentActivities, setRecentActivities] = useState([
    { text: 'nhớ người yêu cũ vừa hoàn thành ETS 2026 Test 1', time: '5 phút trước • Thi thử', badge: '+120 XP' },
    { text: 'Mục tiêu 850 TOEIC vừa đạt 850 Điểm ETS 2026 Test 2', time: '12 phút trước • Thi thử', badge: '🎯 850 Điểm' },
    { text: 'Thu vừa duy trì chuỗi 62 ngày Streak', time: '20 phút trước • Giữ lửa 🔥', badge: '🔥 62 Ngày' },
    { text: 'trùm Part 5 vừa thắng chuỗi 5 trận 1v1 Battle', time: '35 phút trước • Đấu trường', badge: '⚡ +200 XP' },
    { text: 'Mất gốc cày lại vừa học xong chuyên đề Danh Từ', time: '1 giờ trước • Ngữ pháp', badge: '+90 XP' }
  ]);

  // Fetch Live Rankings
  useEffect(() => {
    async function fetchRankings() {
      try {
        setLoading(true);
        // Force flush local realtime study time to backend before fetching leaderboard
        syncStudyTimeNow(true);
        const res = await axios.get(`/api/v1/leaderboard/rankings?metric=${metricTab}&timeframe=${timeFilter}`);
        if (res.data?.data && res.data.data.length > 0) {
          setRankingsList(res.data.data);
          if (res.data.weeklyArena) setArenaData(res.data.weeklyArena);
          if (res.data.currentUserStats) setCurrentUserStats(res.data.currentUserStats);
          if (res.data.recentActivities && res.data.recentActivities.length > 0) {
            setRecentActivities(res.data.recentActivities);
          }
          if (res.data.hallOfFame && res.data.hallOfFame.length > 0) {
            setHallOfFameList(res.data.hallOfFame);
          }
        } else {
          setRankingsList(fallbackRankings);
        }
      } catch (err) {
        setRankingsList(fallbackRankings);
      } finally {
        setLoading(false);
      }
    }
    fetchRankings();
  }, [metricTab, timeFilter]);

  // Live Timer Countdown to Sunday 23:59:59
  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      const currentDay = now.getDay();
      const daysUntilSunday = currentDay === 0 ? 0 : 7 - currentDay;
      const sundayMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate() + daysUntilSunday, 23, 59, 59);
      const msLeft = Math.max(0, sundayMidnight.getTime() - now.getTime());
      
      const seconds = Math.floor((msLeft / 1000) % 60);
      const minutes = Math.floor((msLeft / (1000 * 60)) % 60);
      const hours = Math.floor((msLeft / (1000 * 60 * 60)) % 24);
      const days = Math.floor(msLeft / (1000 * 60 * 60 * 24));

      setCountdown({ days, hours, minutes, seconds });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const getName = (item) => item?.name || item?.user || item?.fullName || 'Học viên';
  
  const getScoreDisplay = (item) => {
    if (!item) return '0';
    if (item.scoreValue) return item.scoreValue;
    if (metricTab === 'xp') return `${(item.xp || 0).toLocaleString('vi-VN')} XP`;
    if (metricTab === 'time') {
      const m = Number(item.timeMinutes) || 0;
      if (m < 60) return `${m} phút`;
      return `${Math.floor(m / 60)}h ${m % 60 > 0 ? `${m % 60}p` : ''}`;
    }
    if (metricTab === 'streak') return `${item.streakDays || 0} ngày`;
    return `${(item.xp || 0).toLocaleString('vi-VN')} XP`;
  };

  const studyTime = useStudyTime();

  const top1 = rankingsList[0] || fallbackRankings[0];
  const top2 = rankingsList[1] || fallbackRankings[1];
  const top3 = rankingsList[2] || fallbackRankings[2];
  const rankRest = rankingsList.slice(3);

  // Calculate dynamic live score, rank and distance for current user (matching Navbar real-time clock across all tabs)
  let userLiveScoreDisplay = currentUserStats?.scoreValue || `${(currentUserStats?.xp || 0).toLocaleString('vi-VN')} XP`;
  let userLiveRank = currentUserStats?.rank ? Number(currentUserStats.rank) : '—';
  let userLiveDistance = currentUserStats?.distanceToTop3 ?? 0;
  let userDistanceToTop1 = currentUserStats?.distanceToTop1 ?? 0;

  if (currentUserStats && metricTab === 'time') {
    const liveTodayMinutes = Math.floor((studyTime?.seconds || 0) / 60);
    const serverCurrentVal = Number(currentUserStats.currentValue) || 0;
    const serverTodayVal = Number(currentUserStats.todayStudyMinutes) || 0;
    
    let liveMinutes = 0;
    if (timeFilter === 'today') {
      liveMinutes = Math.max(serverTodayVal, serverCurrentVal, liveTodayMinutes);
    } else {
      // For week, month, all: the student's study time can NEVER be lower than today's live minutes!
      // Plus any difference between live today and server recorded today
      const unsyncedDiff = Math.max(0, liveTodayMinutes - serverTodayVal);
      liveMinutes = Math.max(serverCurrentVal + unsyncedDiff, liveTodayMinutes);
    }

    userLiveScoreDisplay = liveMinutes < 60 ? `${liveMinutes} phút` : `${Math.floor(liveMinutes / 60)}h ${liveMinutes % 60}p`;
    
    // Live rank based on liveMinutes
    const higherCount = rankingsList.filter(item => (Number(item.numericValue) || 0) > liveMinutes).length;
    userLiveRank = higherCount + 1;

    // Live distance to Top 1 & Top 3
    const top1Val = Number(rankingsList[0]?.numericValue) || 0;
    userDistanceToTop1 = Math.max(0, top1Val - liveMinutes);

    const top3Val = Number(rankingsList[2]?.numericValue) || 0;
    userLiveDistance = Math.max(0, top3Val - liveMinutes);
  }

  return (
    <div className="min-h-screen dark:bg-[#0b1120] bg-[#f8fafc] dark:text-slate-100 text-slate-900 flex flex-col font-sans pb-16 selection:bg-cyan-500 selection:text-slate-950 transition-colors duration-200">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fadeIn">
        
        {/* ========================================================================= */}
        {/* 1. WEEKLY CHAMPIONSHIP HERO BANNER (TOP 1 REWARD 7 DAYS VIP GOLD) */}
        {/* ========================================================================= */}
        <div className="relative overflow-hidden rounded-3xl p-6 sm:p-8 dark:bg-gradient-to-r dark:from-[#2c1d09]/70 dark:via-[#0f172a] dark:to-[#0b1120] bg-gradient-to-r from-amber-50 via-white to-orange-50/60 border-2 dark:border-amber-500/40 border-amber-300 shadow-xl dark:shadow-2xl space-y-6">
          <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
          <div className="absolute bottom-0 left-1/3 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
            
            {/* Left: Title & Description */}
            <div className="space-y-2 max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full dark:bg-amber-500/20 bg-amber-100 border dark:border-amber-500/40 border-amber-300 text-amber-800 dark:text-amber-300 text-xs font-black uppercase tracking-wider">
                <Crown className="w-3.5 h-3.5 fill-amber-500 dark:fill-amber-400 text-amber-600 dark:text-amber-400" />
                <span>ĐẤU TRƯỜNG TOEIC TUẦN • GIẢI THƯỞNG VIP GOLD</span>
              </div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black font-heading dark:text-white text-slate-900 tracking-tight">
                Quán Quân Top 1 Nhận 7 Ngày VIP Gold 👑
              </h1>
              <p className="dark:text-slate-300 text-slate-600 text-xs sm:text-sm leading-relaxed">
                Học viên đạt vị trí <strong className="text-amber-600 dark:text-amber-400">Top 1 Bảng Xếp Hạng XP</strong> vào 23:59 Chủ Nhật sẽ được hệ thống tự động trao tặng <strong className="text-amber-700 dark:text-amber-300">7 Ngày Trải Nghiệm VIP Gold Miễn Phí</strong> trọn bộ 91 Đề ETS & 5 Level Reading/Listening!
              </p>
            </div>

            {/* Right: Live Real-time Countdown Box */}
            <div className="p-5 rounded-3xl dark:bg-slate-950/80 bg-white border dark:border-amber-500/30 border-amber-200 shadow-xl space-y-2 text-center shrink-0 min-w-[280px]">
              <div className="flex items-center justify-center gap-1.5 text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider">
                <Timer className="w-4 h-4 animate-spin" />
                <span>Thời gian còn lại của tuần:</span>
              </div>
              
              <div className="grid grid-cols-4 gap-2 text-center pt-1 font-mono">
                <div className="p-2 rounded-xl dark:bg-slate-900 bg-slate-50 border dark:border-slate-800 border-slate-200 shadow-inner">
                  <span className="text-xl sm:text-2xl font-black dark:text-white text-slate-900 block">{countdown.days}</span>
                  <span className="text-[10px] dark:text-slate-400 text-slate-500 font-sans">Ngày</span>
                </div>
                <div className="p-2 rounded-xl dark:bg-slate-900 bg-slate-50 border dark:border-slate-800 border-slate-200 shadow-inner">
                  <span className="text-xl sm:text-2xl font-black text-amber-600 dark:text-amber-400 block">{String(countdown.hours).padStart(2, '0')}</span>
                  <span className="text-[10px] dark:text-slate-400 text-slate-500 font-sans">Giờ</span>
                </div>
                <div className="p-2 rounded-xl dark:bg-slate-900 bg-slate-50 border dark:border-slate-800 border-slate-200 shadow-inner">
                  <span className="text-xl sm:text-2xl font-black text-amber-600 dark:text-amber-300 block">{String(countdown.minutes).padStart(2, '0')}</span>
                  <span className="text-[10px] dark:text-slate-400 text-slate-500 font-sans">Phút</span>
                </div>
                <div className="p-2 rounded-xl dark:bg-slate-900 bg-slate-50 border dark:border-slate-800 border-slate-200 shadow-inner">
                  <span className="text-xl sm:text-2xl font-black text-emerald-600 dark:text-emerald-400 block">{String(countdown.seconds).padStart(2, '0')}</span>
                  <span className="text-[10px] dark:text-slate-400 text-slate-500 font-sans">Giây</span>
                </div>
              </div>

              <div className="text-[11px] text-slate-400 font-medium pt-1">
                Tự động reset và trao thưởng Chủ Nhật lúc 23:59:59
              </div>
            </div>

          </div>

          {/* Special Perks Row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 border-t dark:border-slate-800/80 border-slate-200 pt-4 relative z-10 text-xs">
            <div className="flex items-center gap-2 dark:text-slate-300 text-slate-700">
              <span className="p-1 rounded-lg dark:bg-amber-500/20 bg-amber-100 text-amber-800 dark:text-amber-400 font-bold">🥇 Top 1</span>
              <span>7 Ngày VIP Gold + Huy Hiệu Vàng Quán Quân</span>
            </div>
            <div className="flex items-center gap-2 dark:text-slate-300 text-slate-700">
              <span className="p-1 rounded-lg dark:bg-slate-800 bg-slate-100 text-slate-700 dark:text-slate-300 font-bold">🥈 Top 2</span>
              <span>+500 XP Thưởng + Huy Hiệu Bạc Á Quân</span>
            </div>
            <div className="flex items-center gap-2 dark:text-slate-300 text-slate-700">
              <span className="p-1 rounded-lg dark:bg-amber-800/40 bg-amber-100 text-amber-700 dark:text-amber-500 font-bold">🥉 Top 3</span>
              <span>+300 XP Thưởng + Huy Hiệu Đồng</span>
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* 2. METRIC TABS & TIME FILTERS */}
        {/* ========================================================================= */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 border-b dark:border-slate-800 border-slate-200 pb-4">
          
          {/* Main Metric Tabs */}
          <div className="flex items-center gap-2 flex-wrap">
            {[
              { id: 'xp', label: '⚡ Điểm XP' },
              { id: 'time', label: '⏳ Thời Gian Học' },
              { id: 'streak', label: '🔥 Chuỗi Ngày (Streak)' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setMetricTab(tab.id)}
                className={`px-4 py-2.5 rounded-2xl text-xs font-extrabold transition-all ${
                  metricTab === tab.id
                    ? 'bg-amber-400 text-slate-950 shadow-lg shadow-amber-400/20 scale-105'
                    : 'dark:bg-slate-900 bg-white border dark:border-slate-800 border-slate-200 dark:text-slate-400 text-slate-700 hover:bg-slate-50 dark:hover:text-white shadow-sm'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Time Filter Sub-tabs (Only for XP and Time) */}
          {(metricTab === 'xp' || metricTab === 'time') && (
            <div className="flex items-center gap-1.5 p-1 rounded-2xl dark:bg-slate-900 bg-white border dark:border-slate-800 border-slate-200 text-xs shadow-sm">
              <button onClick={() => setTimeFilter('today')} className={`px-3.5 py-1.5 rounded-xl font-bold transition-all ${timeFilter === 'today' ? 'bg-amber-400 text-slate-950 font-black shadow-sm' : 'dark:text-slate-400 text-slate-600 hover:text-slate-900 dark:hover:text-white'}`}>Hôm nay</button>
              <button onClick={() => setTimeFilter('week')} className={`px-3.5 py-1.5 rounded-xl font-bold transition-all ${timeFilter === 'week' ? 'bg-amber-400 text-slate-950 font-black shadow-sm' : 'dark:text-slate-400 text-slate-600 hover:text-slate-900 dark:hover:text-white'}`}>🔥 Tuần này</button>
              <button onClick={() => setTimeFilter('month')} className={`px-3.5 py-1.5 rounded-xl font-bold transition-all ${timeFilter === 'month' ? 'bg-amber-400 text-slate-950 font-black shadow-sm' : 'dark:text-slate-400 text-slate-600 hover:text-slate-900 dark:hover:text-white'}`}>Tháng này</button>
              <button onClick={() => setTimeFilter('all')} className={`px-3.5 py-1.5 rounded-xl font-bold transition-all ${timeFilter === 'all' ? 'bg-amber-400 text-slate-950 font-black shadow-sm' : 'dark:text-slate-400 text-slate-600 hover:text-slate-900 dark:hover:text-white'}`}>Tất cả</button>
            </div>
          )}

          {/* Streak Explanatory Banner (Only for Chuỗi Ngày) */}
          {metricTab === 'streak' && (
            <div className="flex items-center gap-2 px-4 py-2 rounded-2xl dark:bg-rose-500/10 bg-rose-50 border dark:border-rose-500/30 border-rose-200 text-xs text-rose-600 dark:text-rose-400 font-bold shadow-sm">
              <Flame className="w-4 h-4 fill-rose-500" />
              <span>Chuỗi ngày học liên tục không ngắt quãng (Toàn thời gian)</span>
            </div>
          )}

        </div>

        {/* ========================================================================= */}
        {/* 3. TWO COLUMN CONTENT: PODIUM + RANKINGS TABLE + ACTIVITY FEED */}
        {/* ========================================================================= */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* LEFT COLUMN: PODIUM + RANKING TABLE (8 cols) */}
          <div className="lg:col-span-8 space-y-8">
            
            {/* TOP 3 PODIUM (WITH ROYAL CROWN AVATAR FRAMES) */}
            <div className="glass-panel rounded-3xl border dark:border-slate-800 border-slate-200 p-8 dark:bg-slate-900/60 bg-white flex items-end justify-center gap-4 sm:gap-10 min-h-[320px] relative overflow-hidden shadow-xl dark:shadow-2xl">
              
              {/* TOP 2 (LEFT - SILVER ROYAL CROWN FRAME) */}
              <div 
                onClick={() => setSelectedUserForModal({
                  ...top2,
                  name: getName(top2),
                  rank: 2,
                  xp: top2.totalXp || top2.xp || 16200,
                  level: top2.level || 16,
                  targetScore: top2.targetScore || '850',
                  streak: top2.streakDays || 12,
                  timeSpent: top2.timeSpent || '32h 15p',
                  joinDate: '01/05/2026',
                  isBot: top2.isBot ?? true
                })}
                className="flex flex-col items-center space-y-2.5 text-center cursor-pointer group hover:scale-105 transition-all duration-200"
                title="Bấm để xem hồ sơ và kết bạn"
              >
                <AvatarWithCrownFrame 
                  rank={2} 
                  name={getName(top2)} 
                  size="lg" 
                />
                <div className="space-y-0.5 pt-1">
                  <h4 className="font-bold text-xs sm:text-sm dark:text-white text-slate-800 max-w-[130px] truncate group-hover:text-cyan-500 transition-colors">
                    {getName(top2)}
                  </h4>
                  <p className="text-xs font-mono font-bold dark:text-cyan-400 text-sky-600">
                    {getScoreDisplay(top2)}
                  </p>
                  <span className="text-[10px] dark:text-slate-400 text-slate-500 block font-mono">
                    {top2.prizeLabel || (metricTab === 'xp' ? '+500 XP' : metricTab === 'time' ? '🥈 Á Quân Chăm Chỉ' : '🥈 Á Quân')}
                  </span>
                </div>
              </div>

              {/* TOP 1 (CENTER - HIGHEST GOLD ROYAL CROWN & WINGS FRAME) */}
              <div 
                onClick={() => setSelectedUserForModal({
                  ...top1,
                  name: getName(top1),
                  rank: 1,
                  xp: top1.totalXp || top1.xp || 20010,
                  level: top1.level || 18,
                  targetScore: top1.targetScore || '990',
                  streak: top1.streakDays || 28,
                  timeSpent: top1.timeSpent || '48h 30p',
                  joinDate: '15/04/2026',
                  isBot: top1.isBot ?? true
                })}
                className="flex flex-col items-center space-y-3 text-center -mt-6 relative cursor-pointer group hover:scale-105 transition-all duration-200"
                title="Bấm để xem hồ sơ và kết bạn"
              >
                <AvatarWithCrownFrame 
                  rank={1} 
                  name={getName(top1)} 
                  size="xl" 
                />

                <div className="space-y-1">
                  <span className="px-2.5 py-0.5 rounded-full dark:bg-amber-500/20 bg-amber-100 dark:text-amber-300 text-amber-800 text-[10px] font-black border dark:border-amber-500/40 border-amber-300 uppercase tracking-wider flex items-center justify-center gap-1 shadow-sm">
                    <Crown className="w-3 h-3 fill-amber-500 text-amber-500 dark:text-amber-400" />
                    <span>{metricTab === 'xp' && timeFilter === 'week' ? 'VIP 7 NGÀY' : (top1.prizeLabel || 'QUÁN QUÂN')}</span>
                  </span>
                  <h3 className="font-heading font-black text-sm sm:text-base dark:text-amber-300 text-amber-700 max-w-[160px] truncate group-hover:text-yellow-500 transition-colors">
                    {getName(top1)}
                  </h3>
                  <p className="text-sm font-mono font-black dark:text-amber-400 text-amber-600">
                    {getScoreDisplay(top1)}
                  </p>
                </div>
              </div>

              {/* TOP 3 (RIGHT - BRONZE ROYAL CROWN FRAME) */}
              <div 
                onClick={() => setSelectedUserForModal({
                  ...top3,
                  name: getName(top3),
                  rank: 3,
                  xp: top3.totalXp || top3.xp || 14890,
                  level: top3.level || 15,
                  targetScore: top3.targetScore || '800',
                  streak: top3.streakDays || 9,
                  timeSpent: top3.timeSpent || '26h 40p',
                  joinDate: '20/05/2026',
                  isBot: top3.isBot ?? true
                })}
                className="flex flex-col items-center space-y-2.5 text-center cursor-pointer group hover:scale-105 transition-all duration-200"
                title="Bấm để xem hồ sơ và kết bạn"
              >
                <AvatarWithCrownFrame 
                  rank={3} 
                  name={getName(top3)} 
                  size="lg" 
                />
                <div className="space-y-0.5 pt-1">
                  <h4 className="font-bold text-xs sm:text-sm dark:text-white text-slate-800 max-w-[130px] truncate group-hover:text-amber-500 transition-colors">
                    {getName(top3)}
                  </h4>
                  <p className="text-xs font-mono font-bold dark:text-emerald-400 text-emerald-600">
                    {getScoreDisplay(top3)}
                  </p>
                  <span className="text-[10px] dark:text-slate-400 text-slate-500 block font-mono">
                    {top3.prizeLabel || (metricTab === 'xp' ? '+300 XP' : metricTab === 'time' ? '🥉 Top 3 Chăm Chỉ' : '🥉 Top 3')}
                  </span>
                </div>
              </div>

            </div>

            {/* RANKING TABLE 4-10 (CLICKABLE ROWS) */}
            <div className="glass-panel rounded-3xl border dark:border-slate-800 border-slate-200 overflow-hidden dark:bg-slate-900/60 bg-white shadow-xl dark:shadow-2xl">
              
              <div className="px-6 py-4 border-b dark:border-slate-800 border-slate-200 grid grid-cols-12 text-xs font-bold dark:text-slate-400 text-slate-500 uppercase tracking-wider">
                <span className="col-span-2">Hạng</span>
                <span className="col-span-6">Học viên</span>
                <span className="col-span-2 text-center">Cấp độ</span>
                <span className="col-span-2 text-right">Thành tích</span>
              </div>

              <div className="divide-y dark:divide-slate-800/60 divide-slate-100 font-mono">
                {rankRest.map((row, idx) => {
                  const isUser = currentUserStats && (getName(row) === currentUserStats.fullName || getName(row).includes('(Bạn)'));
                  return (
                    <div 
                      key={idx} 
                      onClick={() => {
                        const isThisUser = currentUserStats && (getName(row) === currentUserStats.fullName || getName(row).includes('(Bạn)'));
                        setSelectedUserForModal({
                          ...row,
                          name: getName(row),
                          rank: row.rank || idx + 4,
                          xp: isThisUser ? (currentUserStats?.xp || row.xp) : (row.totalXp || row.xp || (12500 - idx * 500)),
                          level: row.level || 15,
                          targetScore: row.targetScore || '750+',
                          streak: isThisUser ? (currentUserStats?.streakDays || row.streakDays) : (row.streakDays || 12),
                          timeSpent: isThisUser ? userLiveScoreDisplay : row.timeSpent,
                          joinDate: isThisUser ? '01/01/2026' : (row.joinDate || '12/06/2026'),
                          isBot: !isThisUser
                        });
                      }}
                      className={`px-6 py-3.5 grid grid-cols-12 items-center text-xs font-semibold transition-all cursor-pointer ${
                        isUser ? 'bg-amber-500/10 border-l-4 border-amber-400' : 'hover:bg-slate-50 dark:hover:bg-slate-800/60 hover:pl-7'
                      }`}
                      title="Bấm để xem hồ sơ và kết bạn"
                    >
                      <span className="col-span-2 font-bold dark:text-slate-400 text-slate-500">{row.rank || idx + 4}</span>
                      <div className="col-span-6 flex items-center gap-3 font-sans">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs uppercase shadow ${
                          isUser ? 'bg-amber-500 text-slate-950 font-black' : 'dark:bg-slate-800 bg-slate-100 border dark:border-slate-700 border-slate-200 text-slate-700 dark:text-slate-300'
                        }`}>
                          {getName(row).charAt(0).toUpperCase()}
                        </div>
                        <div className="truncate">
                          <span className={`font-bold block truncate ${isUser ? 'dark:text-amber-300 text-amber-700' : 'dark:text-white text-slate-800 hover:text-sky-600 dark:hover:text-cyan-400'}`}>
                            {getName(row)}
                          </span>
                          {row.prizeLabel && (
                            <span className="text-[10px] text-amber-600 dark:text-amber-400 font-bold block">{row.prizeLabel}</span>
                          )}
                        </div>
                      </div>
                      <span className="col-span-2 text-center dark:text-slate-400 text-slate-500 text-[11px]">Lv. {row.level || 15}</span>
                      <span className="col-span-2 text-right font-bold text-amber-600 dark:text-amber-400">{getScoreDisplay(row)}</span>
                    </div>
                  );
                })}
              </div>

              <div className="p-4 text-center border-t dark:border-slate-800 border-slate-200 dark:bg-slate-950/40 bg-slate-50 text-xs dark:text-slate-400 text-slate-500">
                Hiển thị Top 10 học viên xuất sắc nhất {metricTab === 'streak' ? 'chuỗi ngày' : timeFilter === 'today' ? 'hôm nay' : timeFilter === 'month' ? 'tháng này' : timeFilter === 'all' ? 'toàn thời gian' : 'tuần này'} • Bấm vào học viên để kết bạn & nhắn tin
              </div>

            </div>

            {/* USER PERSONAL RANK FOOTER BOX */}
            <div className="p-6 rounded-3xl dark:bg-gradient-to-r dark:from-slate-900 dark:to-slate-950 bg-gradient-to-r from-amber-50 to-orange-50/70 border-2 dark:border-amber-500/40 border-amber-300 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-400 to-yellow-500 text-slate-950 flex items-center justify-center font-heading font-black text-lg shadow-lg shadow-amber-500/30">
                  {(currentUserStats?.fullName || 'B').charAt(0).toUpperCase()}
                </div>
                <div>
                  <span className="text-[10px] font-black text-amber-600 dark:text-amber-400 uppercase tracking-wider flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>Hạng của bạn ({metricTab === 'streak' ? 'Chuỗi ngày' : timeFilter === 'today' ? 'Hôm nay' : timeFilter === 'month' ? 'Tháng này' : timeFilter === 'all' ? 'Toàn thời gian' : 'Tuần này'}): Top {userLiveRank}</span>
                  </span>
                  <h4 className="font-heading font-extrabold dark:text-white text-slate-900 text-base">
                    {currentUserStats?.fullName || 'Học Viên'} • {userLiveScoreDisplay}
                  </h4>
                </div>
              </div>

              <div className="text-right space-y-1">
                <Link
                  to="/tests"
                  className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-slate-950 font-black text-xs flex items-center gap-1.5 shadow-md shadow-amber-500/20 active:scale-95 transition-all"
                >
                  <span>Luyện Đề Để Leo Top 1</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
                <p className="text-[10px] dark:text-slate-400 text-slate-500">
                  {userLiveRank === 2
                    ? `🔥 Bạn đang là Á Quân (Top 2)! Chỉ còn cách Quán Quân Top 1 khoảng ${userDistanceToTop1.toLocaleString('vi-VN')} ${metricTab === 'time' ? 'phút' : metricTab === 'streak' ? 'ngày' : 'XP'}! Cố lên!`
                    : userLiveRank === 3
                    ? `⚡ Bạn đang đứng Top 3! Chỉ còn cách Quán Quân Top 1 khoảng ${userDistanceToTop1.toLocaleString('vi-VN')} ${metricTab === 'time' ? 'phút' : metricTab === 'streak' ? 'ngày' : 'XP'}! Cố lên!`
                    : userLiveDistance > 0 
                    ? `Chỉ cách Top 3 khoảng ${userLiveDistance.toLocaleString('vi-VN')} ${metricTab === 'time' ? 'phút' : metricTab === 'streak' ? 'ngày' : 'XP'}`
                    : '🎉 Bạn đang nằm trong nhóm dẫn đầu xuất sắc!'}
                </p>
              </div>
            </div>

          </div>

          {/* RIGHT COLUMN: HALL OF FAME & VIRAL SHARE VIP CALLOUT (4 cols) */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* MOCK TEST CALLOUT CARD */}
            <div className="p-6 rounded-3xl dark:bg-gradient-to-b dark:from-indigo-950/50 dark:to-slate-900 bg-gradient-to-b from-indigo-50 to-white border dark:border-indigo-500/30 border-indigo-200 space-y-4 shadow-xl relative overflow-hidden">
              <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-bold text-xs uppercase tracking-wider">
                <Trophy className="w-4 h-4 text-indigo-500 dark:text-indigo-400" />
                <span>Phòng Thi ETS 2026</span>
              </div>

              <h4 className="font-heading font-black text-base dark:text-white text-slate-900">
                📝 Thi Thử Full 200 Câu Chuẩn IIG
              </h4>

              <p className="text-xs dark:text-slate-300 text-slate-600 leading-relaxed">
                Luyện đề thi thử bấm giờ 120 phút với 100% âm thanh CDN chuẩn ETS, nhận bảng điểm phân tích năng lực chi tiết ngay khi nộp bài!
              </p>

              <Link
                to="/tests"
                className="w-full py-3 px-4 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-black text-xs flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/20 transition-all active:scale-95"
              >
                <Trophy className="w-4 h-4" />
                <span>Vào Phòng Thi Thử Ngay</span>
              </Link>
            </div>

            {/* ĐẠI SẢNH DANH VỌNG (ALL-TIME LEGENDS - CLICKABLE) */}
            <div className="glass-panel rounded-3xl border dark:border-slate-800 border-slate-200 p-6 space-y-4 dark:bg-slate-900/60 bg-white shadow-xl">
              <h3 className="font-heading font-extrabold text-sm dark:text-white text-slate-900 flex items-center gap-2">
                <Trophy className="w-4 h-4 text-amber-500 dark:text-amber-400" />
                <span>Đại sảnh danh vọng</span>
              </h3>

              <div className="space-y-3 text-xs">
                {hallOfFameList.map((legend, idx) => {
                  const isXp = legend.badgeType === 'xp' || idx === 0;
                  const isStreak = legend.badgeType === 'streak' || idx === 1;
                  const colorClass = isXp 
                    ? { border: 'hover:border-amber-500/50', badge: 'text-amber-600 dark:text-amber-400', hoverText: 'group-hover:text-amber-600', valText: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-amber-500/10 text-amber-500', icon: Trophy }
                    : isStreak
                    ? { border: 'hover:border-rose-500/50', badge: 'text-rose-500', hoverText: 'group-hover:text-rose-500', valText: 'text-rose-500', bg: 'bg-rose-500/10 text-rose-500', icon: Flame }
                    : { border: 'hover:border-sky-500/50', badge: 'text-sky-600 dark:text-cyan-400', hoverText: 'group-hover:text-sky-600', valText: 'text-sky-600 dark:text-cyan-400', bg: 'bg-sky-500/10 text-sky-500', icon: Award };
                  const IconComp = colorClass.icon;

                  return (
                    <div 
                      key={idx}
                      onClick={() => setSelectedUserForModal({
                        name: legend.name,
                        xp: legend.xp,
                        targetScore: legend.targetScore || '900',
                        streak: legend.streak || 30,
                        level: legend.level || 20,
                        timeSpent: legend.timeSpent || '100h 00p',
                        isBot: true
                      })}
                      className={`p-3.5 rounded-2xl dark:bg-slate-950 bg-slate-50 border dark:border-slate-800 border-slate-200 ${colorClass.border} transition-all flex items-center justify-between cursor-pointer group`}
                      title="Bấm để xem hồ sơ và kết bạn"
                    >
                      <div>
                        <span className={`text-[10px] font-bold ${colorClass.badge} uppercase`}>
                          {isXp ? '🏆 ' : isStreak ? '🔥 ' : '🎖️ '}{legend.title}
                        </span>
                        <h5 className={`font-bold dark:text-white text-slate-900 ${colorClass.hoverText} transition-colors`}>{legend.name}</h5>
                        <span className={`text-[11px] font-mono ${colorClass.valText} font-bold`}>{legend.achievement}</span>
                      </div>
                      <div className={`p-2 rounded-full ${colorClass.bg} group-hover:scale-110 transition-transform`}>
                        <IconComp className="w-4 h-4" />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* HOẠT ĐỘNG THỜI GIAN THỰC (LIVE ACTIVITY FEED) */}
            <div className="glass-panel rounded-3xl border dark:border-slate-800 border-slate-200 p-6 space-y-4 dark:bg-slate-900/60 bg-white shadow-xl">
              <h3 className="font-heading font-extrabold text-sm dark:text-white text-slate-900 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-emerald-500 dark:text-emerald-400" />
                <span>Hoạt động học tập gần đây</span>
              </h3>

              <div className="space-y-2.5 text-xs">
                {recentActivities.map((act, i) => (
                  <div 
                    key={i} 
                    onClick={() => {
                      const extractedName = act.text.split(' vừa')[0];
                      setSelectedUserForModal({
                        name: extractedName,
                        xp: 5000 + i * 800,
                        targetScore: '800',
                        streak: 8 + i,
                        level: 12 + i,
                        timeSpent: `${18 + i * 4}h ${20 + i * 5}p`,
                        isBot: true
                      });
                    }}
                    className="p-3 rounded-2xl dark:bg-slate-950 bg-slate-50 border dark:border-slate-800/80 border-slate-200 hover:border-emerald-500/40 transition-all flex items-center justify-between cursor-pointer group"
                    title="Bấm để xem hồ sơ và kết bạn"
                  >
                    <div className="space-y-0.5">
                      <p className="font-semibold dark:text-slate-200 text-slate-800 group-hover:text-emerald-600 transition-colors">{act.text}</p>
                      <p className="text-[10px] dark:text-slate-400 text-slate-500">{act.time}</p>
                    </div>
                    {act.badge && (
                      <span className="px-2 py-0.5 rounded dark:bg-emerald-500/20 bg-emerald-50 dark:text-emerald-400 text-emerald-700 border dark:border-emerald-500/30 border-emerald-200 text-[10px] font-bold font-mono shrink-0 ml-2">
                        {act.badge}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>

          </div>

        </div>

      </main>

      {/* USER PROFILE INTERACTIVE POPOVER / MODAL */}
      <UserProfilePopover
        user={selectedUserForModal}
        isOpen={Boolean(selectedUserForModal)}
        onClose={() => setSelectedUserForModal(null)}
      />

    </div>
  );
}
