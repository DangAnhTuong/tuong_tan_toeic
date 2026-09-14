import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { getStoredUser, setStoredUser, clearStoredUser } from '../utils/auth';
import { 
  Headphones, 
  BookOpen, 
  PenTool, 
  Mic,
  Sparkles, 
  FileText, 
  Video, 
  Trophy, 
  MoreHorizontal, 
  Flame, 
  Crown, 
  ChevronDown,
  User,
  LayoutDashboard,
  Target,
  BookMarked,
  LogOut,
  ShieldCheck,
  Award,
  Swords,
  Clock,
  Menu,
  Sun,
  Moon,
  Newspaper,
  Lightbulb,
  MessageSquare,
  Bell
} from 'lucide-react';
import PricingModal from './PricingModal';
import MobileMenuDrawer from './MobileMenuDrawer';
import FeedbackModal from './FeedbackModal';
import NotificationDropdown from './NotificationDropdown';
import { useStudyTime } from '../hooks/useStudyTime';
import { reconcileStudyTimeWithServer } from '../utils/studyTimeTracker';
import { useTheme } from '../context/ThemeContext';

export default function Navbar() {
  const { theme, isDark, toggleTheme } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(getStoredUser());
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showMobileDrawer, setShowMobileDrawer] = useState(false);
  const [isProUser, setIsProUser] = useState(() => {
    const u = getStoredUser();
    return Boolean(u?.isPro || u?.role === 'admin');
  });
  const [userRole, setUserRole] = useState('user');
  const [showPricingModal, setShowPricingModal] = useState(false);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [streakDays, setStreakDays] = useState(0);
  const [showNotificationDropdown, setShowNotificationDropdown] = useState(false);
  const [notificationUnreadCount, setNotificationUnreadCount] = useState(0);
  const studyTime = useStudyTime();

  // Polling unread notifications count every 15s
  useEffect(() => {
    const fetchUnread = () => {
      axios.get('/api/v1/notifications/unread-count')
        .then(res => {
          if (res.data?.success) {
            setNotificationUnreadCount(res.data.unreadCount || 0);
          }
        })
        .catch(() => {});
    };
    fetchUnread();
    const interval = setInterval(fetchUnread, 15000);
    return () => clearInterval(interval);
  }, []);

  const userMenuRef = useRef(null);

  // Sync stored user & Profile API
  useEffect(() => {
    const current = getStoredUser();
    setCurrentUser(current);
    if (current?.isPro || current?.role === 'admin') {
      setIsProUser(true);
    }

    async function fetchUserProfile() {
      try {
        const res = await axios.get('/api/v1/user/profile');
        if (res.data?.data) {
          const proStatus = Boolean(res.data.data.isPro || res.data.data.role === 'admin');
          setIsProUser(proStatus);
          if (res.data.data.role) setUserRole(res.data.data.role);
          if (res.data.data.streakDays) setStreakDays(res.data.data.streakDays);
          if (res.data.data.todayProgress?.studyTimeMinutes) {
            reconcileStudyTimeWithServer(res.data.data.todayProgress.studyTimeMinutes);
          }
          const stored = getStoredUser();
          if (stored && (stored.isPro !== res.data.data.isPro || stored.role !== res.data.data.role)) {
            setStoredUser({
              ...stored,
              isPro: res.data.data.isPro,
              proTier: res.data.data.proTier,
              proExpiresAt: res.data.data.proExpiresAt,
              role: res.data.data.role || stored.role
            });
            setCurrentUser(getStoredUser());
          }
        }
      } catch (e) {
        const savedStreak = localStorage.getItem('user_streak_days');
        if (savedStreak) setStreakDays(parseInt(savedStreak, 10));
      }
    }
    fetchUserProfile();
    window.addEventListener('auth_state_changed', fetchUserProfile);
    return () => window.removeEventListener('auth_state_changed', fetchUserProfile);
  }, [location.pathname]);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setShowUserMenu(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Listen to open_mobile_menu custom event from MobileBottomNav
  useEffect(() => {
    const handleOpenMobileMenu = () => setShowMobileDrawer(true);
    const handleOpenFeedback = () => setShowFeedbackModal(true);
    window.addEventListener('open_mobile_menu', handleOpenMobileMenu);
    window.addEventListener('open_feedback_modal', handleOpenFeedback);
    return () => {
      window.removeEventListener('open_mobile_menu', handleOpenMobileMenu);
      window.removeEventListener('open_feedback_modal', handleOpenFeedback);
    };
  }, []);

  const handleLogout = () => {
    clearStoredUser();
    setCurrentUser(null);
    setShowUserMenu(false);
    navigate('/login');
  };

  const navItems = [
    { name: 'Nghe', path: '/listen', icon: Headphones },
    { name: 'Đọc', path: '/read', icon: BookOpen },
    { name: 'Từ vựng', path: '/vocabulary', icon: Sparkles },
    { name: 'Đề thi', path: '/tests', icon: FileText },
    { name: 'Video', path: '/video', icon: Video },
    { name: 'Đấu trường', path: '/leaderboard', icon: Trophy },
    { name: '1v1', path: '/battle', icon: Swords, badge: 'HOT' },
  ];

  return (
    <header className="sticky top-0 z-50 w-full glass-panel border-b dark:border-slate-800/80 border-slate-200/90 dark:bg-[#0b1120]/90 bg-white/90 backdrop-blur-2xl transition-all shadow-sm">
      <div className="max-w-[1600px] mx-auto px-3 sm:px-5 lg:px-6 h-16 flex items-center justify-between gap-1.5 sm:gap-2 xl:gap-4">
        
        {/* Brand Logo with Mascot */}
        <Link to="/" className="flex items-center gap-1.5 sm:gap-2 group shrink-0 whitespace-nowrap">
          <div className="w-8 h-8 sm:w-9 sm:h-9 xl:w-10 xl:h-10 rounded-xl bg-gradient-to-tr from-cyan-500 via-teal-400 to-amber-400 p-0.5 shadow-lg shadow-cyan-500/20 group-hover:scale-105 transition-transform duration-300 shrink-0">
            <div className="w-full h-full dark:bg-[#0b1120] bg-white rounded-[10px] flex items-center justify-center relative overflow-hidden">
              <span className="text-base sm:text-lg xl:text-xl animate-float">🎯</span>
            </div>
          </div>
          <div className="flex flex-col shrink-0">
            <div className="flex items-center gap-1">
              <span className="font-heading font-extrabold text-sm sm:text-base xl:text-lg dark:text-white text-slate-900 tracking-wide leading-tight group-hover:text-cyan-500 transition-colors">
                TƯỜNG TẬN <span className="bg-gradient-to-r from-cyan-500 to-teal-400 bg-clip-text text-transparent">TOEIC</span>
              </span>
              <span className="text-[8px] sm:text-[9px] bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/30 px-1 py-0.2 rounded font-bold uppercase">
                PRO
              </span>
            </div>
            <span className="text-[9px] sm:text-[10px] dark:text-slate-400 text-slate-500 tracking-wider font-medium hidden 2xl:block">Luyện Thi 4 Kỹ Năng Online</span>
          </div>
        </Link>

        {/* Center Navigation Links (Clean, No-Wrap, Sleek) */}
        <nav className="hidden lg:flex items-center gap-0.5 xl:gap-1 dark:bg-[#0f172a]/95 bg-slate-100/90 p-1 rounded-full border dark:border-slate-800/90 border-slate-200/90 shadow-inner shrink-0">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname.startsWith(item.path);

            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-1 xl:gap-1.5 px-2 xl:px-2.5 2xl:px-3 py-1 xl:py-1.5 rounded-full text-[11px] xl:text-xs font-semibold whitespace-nowrap shrink-0 transition-all duration-200 ${
                  isActive
                    ? 'bg-gradient-to-r from-cyan-500 to-teal-500 text-white shadow-md shadow-cyan-500/25 font-bold'
                    : 'dark:text-slate-300 text-slate-700 hover:text-cyan-600 dark:hover:text-white dark:hover:bg-slate-800/60 hover:bg-slate-200/70'
                }`}
              >
                <Icon className={`w-3 h-3 xl:w-3.5 xl:h-3.5 shrink-0 ${isActive ? 'text-white' : 'dark:text-slate-400 text-slate-500'}`} />
                <span className="whitespace-nowrap">{item.name}</span>
                {item.badge && (
                  <span className="text-[8px] xl:text-[9px] font-mono px-1 xl:px-1.5 py-0.2 rounded-full bg-rose-500/20 text-rose-500 dark:text-rose-400 border border-rose-500/30 font-bold ml-0.5">
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}

          {/* More Menu Dropdown */}
          <div className="relative shrink-0">
            <button
              onClick={() => setShowMoreMenu(!showMoreMenu)}
              className="flex items-center gap-1 px-2 xl:px-2.5 py-1 xl:py-1.5 rounded-full text-[11px] xl:text-xs font-semibold dark:text-slate-400 text-slate-600 hover:text-cyan-600 dark:hover:text-white dark:hover:bg-slate-800/50 hover:bg-slate-200/60 whitespace-nowrap"
            >
              <MoreHorizontal className="w-3 h-3 xl:w-3.5 xl:h-3.5 shrink-0" />
              <span>More</span>
              <ChevronDown className="w-3 h-3 ml-0.5 opacity-60 shrink-0" />
            </button>

            {showMoreMenu && (
              <div 
                className="absolute right-0 mt-2 w-60 dark:bg-[#0f172a] bg-white backdrop-blur-xl border dark:border-slate-800 border-slate-200 rounded-2xl p-2 shadow-2xl z-50 text-xs space-y-1 animate-fadeIn"
              >
                <Link 
                  to="/blog" 
                  onClick={() => setShowMoreMenu(false)}
                  className="flex items-center gap-2.5 p-2.5 rounded-xl dark:text-slate-200 text-slate-700 dark:hover:bg-slate-800/80 hover:bg-slate-100 hover:text-cyan-400 font-semibold transition-colors"
                >
                  <Newspaper className="w-4 h-4 text-cyan-400 shrink-0" />
                  <div className="flex flex-col">
                    <span>Blog Chiến Lược & Mẹo Thi</span>
                    <span className="text-[10px] text-slate-400 font-normal">21 bài viết từ chuyên gia</span>
                  </div>
                </Link>

                <button 
                  onClick={() => {
                    setShowMoreMenu(false);
                    setShowFeedbackModal(true);
                  }}
                  className="w-full flex items-center gap-2.5 p-2.5 rounded-xl dark:text-slate-200 text-slate-700 dark:hover:bg-slate-800/80 hover:bg-slate-100 hover:text-amber-400 font-semibold transition-colors text-left"
                >
                  <Lightbulb className="w-4 h-4 text-amber-400 shrink-0" />
                  <div className="flex flex-col">
                    <span>Đề Xuất & Góp Ý</span>
                    <span className="text-[10px] text-slate-400 font-normal">Ý tưởng nâng cấp web</span>
                  </div>
                </button>

                <button 
                  onClick={() => {
                    setShowMoreMenu(false);
                    window.dispatchEvent(new CustomEvent('open_admin_chat'));
                  }}
                  className="w-full flex items-center gap-2.5 p-2.5 rounded-xl dark:text-slate-200 text-slate-700 dark:hover:bg-slate-800/80 hover:bg-slate-100 hover:text-purple-400 font-semibold transition-colors text-left"
                >
                  <MessageSquare className="w-4 h-4 text-purple-400 shrink-0" />
                  <div className="flex flex-col">
                    <span>Nhắn Tin Cho Admin</span>
                    <span className="text-[10px] text-slate-400 font-normal">Hỗ trợ & giải đáp trực tiếp</span>
                  </div>
                </button>

                <div className="my-1 border-t dark:border-slate-800/80 border-slate-200" />

                <Link 
                  to="/mistakes" 
                  onClick={() => setShowMoreMenu(false)}
                  className="flex items-center gap-2.5 p-2.5 rounded-xl dark:text-slate-200 text-slate-700 dark:hover:bg-slate-800/80 hover:bg-slate-100 hover:text-rose-500 font-semibold transition-colors"
                >
                  <BookMarked className="w-4 h-4 text-rose-500 shrink-0" />
                  <span>Sổ Tay Câu Sai & Lỗ Hổng</span>
                </Link>

                <Link 
                  to="/hub" 
                  onClick={() => setShowMoreMenu(false)}
                  className="flex items-center gap-2.5 p-2.5 rounded-xl dark:text-slate-200 text-slate-700 dark:hover:bg-slate-800/80 hover:bg-slate-100 hover:text-cyan-500 font-semibold transition-colors"
                >
                  <LayoutDashboard className="w-4 h-4 text-cyan-500 shrink-0" />
                  <span>Trang Cá Nhân & Mục Tiêu</span>
                </Link>

                <Link 
                  to="/vocabulary/review?tab=learn&study=flashcard" 
                  onClick={() => setShowMoreMenu(false)}
                  className="flex items-center gap-2.5 p-2.5 rounded-xl dark:text-slate-200 text-slate-700 dark:hover:bg-slate-800/80 hover:bg-slate-100 hover:text-amber-500 font-semibold transition-colors"
                >
                  <Sparkles className="w-4 h-4 text-amber-500 shrink-0" />
                  <span>Phòng Ôn SRS Từ Vựng</span>
                </Link>
              </div>
            )}
          </div>
        </nav>

        {/* Right Section: Gamification, VIP Upgrade & User Profile with Logout */}
        <div className="flex items-center gap-1 sm:gap-1.5 xl:gap-2 shrink-0">
          
          {/* NÚT QUẢN TRỊ VIÊN DÀNH CHO ADMIN (Ẩn trên mobile & tablet, hiển thị trên 2xl+) */}
          {userRole === 'admin' && (
            <Link
              to="/admin"
              className="hidden 2xl:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r from-purple-600 via-indigo-600 to-cyan-500 hover:from-purple-500 hover:to-cyan-400 text-white font-heading font-black text-xs shadow-lg shadow-purple-500/25 transition-all hover:scale-105 shrink-0 border border-purple-400/40"
              title="Trung tâm Quản trị hệ thống"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Quản Trị</span>
            </Link>
          )}

          {/* NÚT NÂNG CẤP VIP PRO HOẶC HUY HIỆU PRO */}
          {isProUser ? (
            <div 
              onClick={() => setShowPricingModal(true)}
              className="flex items-center gap-1 px-2 sm:px-2.5 py-1 rounded-full bg-gradient-to-r from-amber-500/20 to-amber-400/10 border border-amber-500/40 text-amber-300 text-[10px] xl:text-[11px] font-black shadow-lg shadow-amber-500/10 cursor-pointer hover:border-amber-400 transition-colors shrink-0"
              title="Tài khoản VIP GOLD"
            >
              <Crown className="w-3 h-3 xl:w-3.5 xl:h-3.5 text-amber-400 fill-amber-400" />
              <span className="hidden xl:inline">VIP GOLD</span>
              <span className="xl:hidden">VIP</span>
            </div>
          ) : (
            <button
              onClick={() => setShowPricingModal(true)}
              className="flex items-center gap-1 px-2 xl:px-2.5 py-1 xl:py-1.5 rounded-full bg-gradient-to-r from-amber-400 via-amber-500 to-rose-500 hover:from-amber-300 hover:to-rose-400 text-slate-950 font-heading font-black text-[10px] xl:text-xs shadow-lg shadow-amber-500/25 transition-all hover:scale-105 shrink-0 cursor-pointer"
            >
              <Crown className="w-3 h-3 xl:w-3.5 xl:h-3.5 fill-slate-950" />
              <span className="hidden xl:inline">Nâng cấp VIP</span>
              <span className="xl:hidden">VIP</span>
            </button>
          )}

          {/* REALTIME TODAY STUDY TIME PILL (Hiển thị trên md+, mobile có trong Drawer & Hub) */}
          <Link
            to="/hub"
            className="hidden md:flex items-center gap-1 px-2 xl:px-2.5 py-1 rounded-full bg-sky-500/10 border border-sky-500/30 hover:border-sky-400/60 text-sky-400 text-[11px] xl:text-xs font-mono font-bold transition-all hover:scale-105 shadow-sm group shrink-0"
            title={`Thời gian học hôm nay: ${studyTime.detailed} • Bấm để xem chi tiết mục tiêu`}
          >
            <Clock className="w-3 h-3 xl:w-3.5 xl:h-3.5 text-sky-400 group-hover:text-sky-300 animate-pulse" />
            <span className="font-heading font-extrabold text-[11px] xl:text-xs text-sky-400 tracking-tight">
              {studyTime.formatted}
            </span>
          </Link>

          {/* Streak Flame Counter */}
          <Link 
            to="/hub"
            className="flex items-center gap-1 px-2 xl:px-2.5 py-1 rounded-full dark:bg-amber-500/10 bg-amber-500/15 border dark:border-amber-500/25 border-amber-500/40 hover:border-amber-500/50 transition-colors cursor-pointer group shrink-0"
            title="Chuỗi ngày luyện tập liên tục"
          >
            <Flame className="w-3 h-3 xl:w-3.5 xl:h-3.5 text-amber-500 dark:text-amber-400 streak-glow animate-pulse" />
            <span className="font-heading font-extrabold text-[11px] xl:text-xs text-amber-500 dark:text-amber-400 tracking-tight">
              {streakDays} <span className="text-[10px] font-normal text-amber-600 dark:text-amber-300/80 hidden 2xl:inline">ngày</span>
            </span>
          </Link>

          {/* THEME TOGGLE BUTTON (Light ☀️ / Dark 🌙 Mode) */}
          <button
            onClick={toggleTheme}
            className="p-1.5 xl:p-2 rounded-xl dark:bg-slate-900 bg-slate-100 dark:border-slate-800 border-slate-200 text-amber-500 dark:text-amber-400 hover:scale-105 active:scale-95 transition-all shadow-sm shrink-0 cursor-pointer border"
            title={isDark ? "Chuyển sang Giao diện Sáng (Light Mode)" : "Chuyển sang Giao diện Tối (Dark Mode)"}
            aria-label="Chuyển đổi giao diện Sáng / Tối"
          >
            {isDark ? (
              <Sun className="w-3.5 h-3.5 xl:w-4 xl:h-4 text-amber-400 hover:rotate-45 transition-transform" />
            ) : (
              <Moon className="w-3.5 h-3.5 xl:w-4 xl:h-4 text-indigo-600 hover:-rotate-12 transition-transform" />
            )}
          </button>

          {/* NOTIFICATION BELL ICON & DROPDOWN */}
          <div className="relative shrink-0">
            <button
              onClick={() => setShowNotificationDropdown(!showNotificationDropdown)}
              className="p-1.5 xl:p-2 rounded-xl dark:bg-slate-900 bg-slate-100 dark:border-slate-800 border-slate-200 text-slate-600 dark:text-slate-300 hover:text-cyan-500 dark:hover:text-cyan-400 hover:scale-105 active:scale-95 transition-all shadow-sm shrink-0 cursor-pointer border relative"
              title="Thông báo hệ thống"
              aria-label="Hòm thư thông báo"
            >
              <Bell className="w-3.5 h-3.5 xl:w-4 xl:h-4" />
              {notificationUnreadCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-4 min-w-4 px-1 items-center justify-center rounded-full bg-rose-500 text-[9px] font-black text-white shadow-md shadow-rose-500/50 animate-pulse">
                  {notificationUnreadCount > 9 ? '9+' : notificationUnreadCount}
                </span>
              )}
            </button>

            <NotificationDropdown
              isOpen={showNotificationDropdown}
              onClose={() => setShowNotificationDropdown(false)}
              onUnreadChange={(count) => setNotificationUnreadCount(count)}
            />
          </div>

          {/* Mobile Hamburger Menu Toggle Button (Luôn hiển thị rõ ràng trên mobile < lg) */}
          <button
            onClick={() => setShowMobileDrawer(true)}
            className="lg:hidden p-1.5 sm:p-2 rounded-xl dark:bg-slate-900 bg-slate-100 dark:border-slate-800 border-slate-200 dark:text-slate-300 text-slate-700 hover:text-cyan-600 dark:hover:text-white hover:border-cyan-500/40 transition-colors shrink-0 active:scale-95 cursor-pointer ml-0.5"
            aria-label="Mở menu điều hướng"
          >
            <Menu className="w-5 h-5 dark:text-slate-300 text-slate-700" />
          </button>

          {/* USER PROFILE & LOGOUT DROPDOWN (Chỉ hiển thị trên Desktop lg+, trên mobile < lg đã tích hợp trong Drawer) */}
          {currentUser ? (
            <div className="hidden lg:block relative shrink-0" ref={userMenuRef}>
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-1.5 p-1 rounded-full dark:bg-slate-900 bg-slate-100 dark:border-slate-800 border-slate-200 hover:border-cyan-500/50 transition-colors group cursor-pointer"
                title={`Tài khoản: ${currentUser.name || 'Học viên'} • Bấm để xem chi tiết`}
              >
                <div className="relative">
                  <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gradient-to-r from-cyan-500 to-teal-500 flex items-center justify-center text-xs font-bold text-slate-950 font-heading shadow">
                    {currentUser.name ? currentUser.name.charAt(0).toUpperCase() : 'T'}
                  </div>
                  <span className="absolute bottom-0 right-0 w-2 h-2 rounded-full bg-emerald-400 ring-1 dark:ring-slate-950 ring-white" />
                </div>
                <ChevronDown className="w-3.5 h-3.5 dark:text-slate-400 text-slate-500 group-hover:text-cyan-500 transition-transform mr-0.5" />
              </button>

              {/* USER POPUP MENU */}
              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-64 dark:bg-[#0f172a] bg-white backdrop-blur-2xl border dark:border-slate-800 border-slate-200 rounded-2xl p-3 shadow-2xl z-50 text-xs space-y-3 animate-fadeIn">
                  
                  {/* User Profile Header */}
                  <div className="p-2.5 rounded-xl dark:bg-slate-950 bg-slate-50 border dark:border-slate-800 border-slate-200 space-y-1">
                    <div className="flex items-center justify-between">
                      <h4 className="font-heading font-extrabold dark:text-white text-slate-900 text-sm truncate">
                        {currentUser?.name || currentUser?.fullName || (currentUser?.email ? currentUser.email.split('@')[0] : 'Học viên')}
                      </h4>
                      {isProUser ? (
                        <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-500 dark:text-amber-300 text-[10px] font-black border border-amber-500/30 flex items-center gap-1">
                          <Crown className="w-3 h-3 fill-amber-400" />
                          PRO
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full dark:bg-slate-800 bg-slate-200 dark:text-slate-400 text-slate-600 text-[10px] font-bold">
                          Free
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] dark:text-slate-400 text-slate-500 truncate">
                      {currentUser?.email || (currentUser?.isGuest ? 'Tài khoản trải nghiệm' : '')}
                    </p>
                  </div>

                  {/* Links */}
                  <div className="space-y-1">
                    {userRole === 'admin' && (
                      <Link
                        to="/admin"
                        onClick={() => setShowUserMenu(false)}
                        className="flex items-center gap-2.5 px-3 py-2 rounded-xl bg-purple-500/15 text-purple-600 dark:text-purple-300 hover:bg-purple-500/25 transition-colors font-bold border border-purple-500/30"
                      >
                        <ShieldCheck className="w-4 h-4 text-purple-500" />
                        <span>Quản Trị Hệ Thống (Admin)</span>
                      </Link>
                    )}

                    <Link
                      to="/hub"
                      onClick={() => setShowUserMenu(false)}
                      className="flex items-center gap-2.5 px-3 py-2 rounded-xl dark:text-slate-200 text-slate-700 dark:hover:bg-slate-800 hover:bg-slate-100 hover:text-cyan-500 transition-colors font-semibold"
                    >
                      <LayoutDashboard className="w-4 h-4 text-cyan-500" />
                      <span>Trang Cá Nhân & Mục Tiêu</span>
                    </Link>

                    <Link
                      to="/mistakes"
                      onClick={() => setShowUserMenu(false)}
                      className="flex items-center gap-2.5 px-3 py-2 rounded-xl dark:text-slate-200 text-slate-700 dark:hover:bg-slate-800 hover:bg-slate-100 hover:text-rose-500 transition-colors font-semibold"
                    >
                      <BookMarked className="w-4 h-4 text-rose-500" />
                      <span>Sổ Tay Câu Sai ({'>'} 0)</span>
                    </Link>

                    {!isProUser ? (
                      <button
                        onClick={() => {
                          setShowUserMenu(false);
                          setShowPricingModal(true);
                        }}
                        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-amber-600 dark:text-amber-300 dark:hover:bg-amber-500/10 hover:bg-amber-50 transition-colors font-bold text-left cursor-pointer"
                      >
                        <Crown className="w-4 h-4 text-amber-500 fill-amber-500" />
                        <span>Nâng Cấp Gói VIP (99k)</span>
                      </button>
                    ) : (
                      <div className="flex items-center gap-2.5 px-3 py-2 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 font-bold text-xs border border-amber-500/20">
                        <Crown className="w-4 h-4 text-amber-500 fill-amber-500 shrink-0" />
                        <span>{userRole === 'admin' ? 'Tài Khoản Quản Trị Viên' : 'Đã Kích Hoạt Gói VIP'}</span>
                      </div>
                    )}
                  </div>

                  {/* LOGOUT BUTTON */}
                  <div className="border-t dark:border-slate-800 border-slate-200 pt-2">
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-rose-500 hover:bg-rose-500/15 hover:text-rose-600 dark:hover:text-rose-300 transition-colors font-bold text-left cursor-pointer"
                    >
                      <LogOut className="w-4 h-4 text-rose-500" />
                      <span>Đăng Xuất Tài Khoản</span>
                    </button>
                  </div>

                </div>
              )}
            </div>
          ) : (
            <div className="hidden lg:flex items-center gap-2 shrink-0">
              <Link 
                to="/login"
                className="flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-400 hover:to-teal-400 text-slate-950 font-heading font-extrabold text-xs shadow-lg shadow-cyan-500/20 hover:scale-105 transition-transform"
              >
                <User className="w-3.5 h-3.5" />
                <span>Đăng nhập</span>
              </Link>
            </div>
          )}

        </div>

      </div>

      {/* MOBILE MENU DRAWER */}
      <MobileMenuDrawer
        isOpen={showMobileDrawer}
        onClose={() => setShowMobileDrawer(false)}
        currentUser={currentUser}
        isProUser={isProUser}
        userRole={userRole}
        streakDays={streakDays}
        studyTime={studyTime}
        onOpenPricing={() => setShowPricingModal(true)}
      />

      {/* PRICING MODAL & VIETQR PAYMENT */}
      <PricingModal
        isOpen={showPricingModal}
        onClose={() => setShowPricingModal(false)}
        onUpgradeSuccess={() => setIsProUser(true)}
      />

      {/* FEEDBACK & SUGGESTIONS MODAL */}
      <FeedbackModal
        isOpen={showFeedbackModal}
        onClose={() => setShowFeedbackModal(false)}
      />

    </header>
  );
}


