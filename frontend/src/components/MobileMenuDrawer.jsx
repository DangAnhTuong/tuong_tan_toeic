import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { Link, useNavigate } from 'react-router-dom';
import { 
  X, 
  Crown, 
  BookMarked, 
  Swords, 
  Trophy, 
  LayoutDashboard, 
  Video, 
  ShieldCheck, 
  LogOut, 
  User, 
  Flame, 
  Clock, 
  ChevronRight,
  Sparkles,
  Target,
  Sun,
  Moon,
  Newspaper,
  Lightbulb,
  MessageSquare,
  Smartphone
} from 'lucide-react';
import { clearStoredUser } from '../utils/auth';
import { useTheme } from '../context/ThemeContext';
import InstallAppModal from './InstallAppModal';

export default function MobileMenuDrawer({ 
  isOpen, 
  onClose, 
  currentUser, 
  isProUser, 
  userRole, 
  streakDays, 
  studyTime, 
  onOpenPricing 
}) {
  const navigate = useNavigate();
  const { theme, isDark, toggleTheme } = useTheme();
  const [showInstallModal, setShowInstallModal] = useState(false);

  if (!isOpen) return null;

  const handleLogout = () => {
    clearStoredUser();
    onClose();
    navigate('/login');
  };

  return createPortal(
    <div className="lg:hidden fixed inset-0 z-[9999] flex justify-end animate-fadeIn">
      {/* Backdrop */}
      <div 
        onClick={onClose} 
        className="fixed inset-0 bg-slate-950/80 backdrop-blur-md transition-opacity"
      />

      {/* Drawer Panel */}
      <div className="relative w-[85%] max-w-sm h-full dark:bg-[#0b1120] bg-white border-l dark:border-slate-800/90 border-slate-200 shadow-2xl flex flex-col justify-between overflow-y-auto z-10 animate-slideLeft">
        
        {/* Top Header */}
        <div className="p-5 border-b dark:border-slate-800/80 border-slate-200 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-cyan-500 to-teal-400 p-0.5 shadow-md">
                <div className="w-full h-full dark:bg-[#0b1120] bg-white rounded-[10px] flex items-center justify-center text-sm">
                  🎯
                </div>
              </div>
              <span className="font-heading font-black dark:text-white text-slate-900 text-sm">
                TƯỜNG TẬN <span className="text-cyan-500">TOEIC</span>
              </span>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-xl dark:bg-slate-900 bg-slate-100 border dark:border-slate-800 border-slate-200 dark:text-slate-400 text-slate-600 dark:hover:text-white hover:text-slate-900 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* User Profile Card */}
          {currentUser ? (
            <div className="p-3 rounded-2xl dark:bg-slate-900/90 bg-slate-50 border dark:border-slate-800 border-slate-200 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-r from-cyan-500 to-teal-400 flex items-center justify-center font-bold text-slate-950 text-sm font-heading shrink-0 shadow">
                    {currentUser.name ? currentUser.name.charAt(0).toUpperCase() : 'T'}
                  </div>
                  <div className="min-w-0 truncate">
                    <h4 className="font-heading font-extrabold dark:text-white text-slate-900 text-xs truncate">
                      {currentUser.name || currentUser.fullName || (currentUser.email ? currentUser.email.split('@')[0] : 'Học viên')}
                    </h4>
                    <p className="text-[10px] dark:text-slate-400 text-slate-500 truncate">
                      {currentUser.email || 'Tài khoản trải nghiệm'}
                    </p>
                  </div>
                </div>

                {isProUser ? (
                  <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-500 dark:text-amber-300 text-[10px] font-black border border-amber-500/40 flex items-center gap-1 shrink-0">
                    <Crown className="w-3 h-3 fill-amber-400" />
                    PRO
                  </span>
                ) : (
                  <button
                    onClick={() => {
                      onClose();
                      onOpenPricing();
                    }}
                    className="px-2.5 py-1 rounded-full bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 font-black text-[10px] shadow active:scale-95 transition-all shrink-0"
                  >
                    Nâng cấp
                  </button>
                )}
              </div>

              {/* Mini Stats Bar */}
              <div className="grid grid-cols-2 gap-2 pt-1 border-t dark:border-slate-800/80 border-slate-200 text-[11px] font-mono">
                <div className="flex items-center gap-1 text-amber-500 dark:text-amber-400 font-bold">
                  <Flame className="w-3.5 h-3.5 animate-pulse" />
                  <span>{streakDays || 1} ngày học</span>
                </div>
                <div className="flex items-center gap-1 text-sky-500 dark:text-sky-400 font-bold justify-end">
                  <Clock className="w-3.5 h-3.5" />
                  <span>{studyTime?.formatted || '0p'}</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-3 rounded-2xl dark:bg-slate-900 bg-slate-50 border dark:border-slate-800 border-slate-200 flex items-center justify-between">
              <div>
                <h4 className="dark:text-white text-slate-900 text-xs font-bold font-heading">Đăng nhập tài khoản</h4>
                <p className="text-[10px] dark:text-slate-400 text-slate-500">Để lưu tiến độ & đồng bộ chuỗi học</p>
              </div>
              <Link
                to="/login"
                onClick={onClose}
                className="px-3 py-1.5 rounded-xl bg-cyan-500 text-slate-950 text-xs font-bold font-heading shadow active:scale-95"
              >
                Đăng nhập
              </Link>
            </div>
          )}
        </div>

        {/* Middle Navigation Links */}
        <div className="p-4 space-y-2 flex-1 overflow-y-auto">
          
          {/* THEME TOGGLE ROW (Sáng / Tối) */}
          <div className="p-3 rounded-2xl dark:bg-slate-900/90 bg-slate-100 border dark:border-slate-800 border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl dark:bg-amber-500/15 bg-amber-500/20 dark:border-amber-500/30 border-amber-500/40 border flex items-center justify-center">
                {isDark ? (
                  <Moon className="w-4 h-4 text-amber-400" />
                ) : (
                  <Sun className="w-4 h-4 text-amber-600" />
                )}
              </div>
              <div>
                <span className="font-bold text-xs block dark:text-white text-slate-900">
                  {isDark ? 'Giao diện Tối 🌙' : 'Giao diện Sáng ☀️'}
                </span>
                <span className="text-[10px] dark:text-slate-400 text-slate-500">
                  {isDark ? 'Bấm để đổi sang giao diện Sáng' : 'Bấm để đổi sang giao diện Tối'}
                </span>
              </div>
            </div>
            <button
              onClick={toggleTheme}
              className="px-3 py-1.5 rounded-xl text-xs font-black dark:bg-slate-800 bg-white border dark:border-slate-700 border-slate-300 dark:text-cyan-300 text-cyan-700 shadow-sm active:scale-95 transition-all"
            >
              Đổi
            </button>
          </div>

          <div className="text-[10px] font-mono font-bold text-slate-500 uppercase px-3 pt-2 pb-0.5">
            Mở rộng & Nâng cao
          </div>

          {/* CÀI ĐẶT APP VÀO ĐIỆN THOẠI (PWA) */}
          <button
            onClick={() => setShowInstallModal(true)}
            className="w-full flex items-center justify-between p-3 rounded-2xl bg-gradient-to-r dark:from-cyan-950/40 dark:to-teal-950/20 from-cyan-50 to-teal-50 hover:bg-cyan-100/60 dark:hover:bg-cyan-900/40 border border-cyan-500/30 text-left transition-all group"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400 group-hover:scale-105 transition-transform">
                <Smartphone className="w-4 h-4 text-cyan-400" />
              </div>
              <div>
                <span className="font-bold text-xs block dark:text-white text-slate-900 flex items-center gap-1.5">
                  Cài Đặt App Vào Điện Thoại
                  <span className="px-1.5 py-0.2 rounded-full bg-cyan-500/20 text-cyan-600 dark:text-cyan-300 text-[9px] font-black border border-cyan-500/30 font-mono">
                    PWA ⚡
                  </span>
                </span>
                <span className="text-[10px] dark:text-slate-400 text-slate-500">Màn hình chính, không cần App Store</span>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-cyan-400 group-hover:translate-x-0.5 transition-transform" />
          </button>

          {/* BLOG & CHIẾN LƯỢC */}
          <Link
            to="/blog"
            onClick={onClose}
            className="flex items-center justify-between p-3 rounded-2xl dark:bg-slate-900/60 bg-slate-50 hover:bg-slate-100 dark:hover:bg-slate-800 border dark:border-slate-800/60 border-slate-200 dark:text-slate-200 text-slate-800 transition-colors group"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-400 group-hover:scale-105 transition-transform">
                <Newspaper className="w-4 h-4" />
              </div>
              <div>
                <span className="font-bold text-xs block dark:text-white text-slate-900">Blog Chiến Lược & Mẹo Thi</span>
                <span className="text-[10px] dark:text-slate-400 text-slate-500">21 bài viết từ chuyên gia 990 TOEIC</span>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-cyan-400" />
          </Link>

          {/* ĐỀ XUẤT & GÓP Ý */}
          <button
            onClick={() => {
              onClose();
              window.dispatchEvent(new CustomEvent('open_feedback_modal'));
            }}
            className="w-full flex items-center justify-between p-3 rounded-2xl dark:bg-slate-900/60 bg-slate-50 hover:bg-slate-100 dark:hover:bg-slate-800 border dark:border-slate-800/60 border-slate-200 dark:text-slate-200 text-slate-800 transition-colors group text-left"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 group-hover:scale-105 transition-transform">
                <Lightbulb className="w-4 h-4" />
              </div>
              <div>
                <span className="font-bold text-xs block dark:text-white text-slate-900">Đề Xuất & Góp Ý</span>
                <span className="text-[10px] dark:text-slate-400 text-slate-500">Đóng góp ý tưởng nâng cấp web</span>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-amber-400" />
          </button>

          {/* NHẮN TIN CHO ADMIN */}
          <button
            onClick={() => {
              onClose();
              window.dispatchEvent(new CustomEvent('open_admin_chat'));
            }}
            className="w-full flex items-center justify-between p-3 rounded-2xl dark:bg-slate-900/60 bg-slate-50 hover:bg-slate-100 dark:hover:bg-slate-800 border dark:border-slate-800/60 border-slate-200 dark:text-slate-200 text-slate-800 transition-colors group text-left"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-purple-500/15 border border-purple-500/30 flex items-center justify-center text-purple-400 group-hover:scale-105 transition-transform">
                <MessageSquare className="w-4 h-4" />
              </div>
              <div>
                <span className="font-bold text-xs block dark:text-white text-slate-900">Nhắn Tin Cho Admin</span>
                <span className="text-[10px] dark:text-slate-400 text-slate-500">Kênh giải đáp thắc mắc & hỗ trợ</span>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-purple-400" />
          </button>

          <Link
            to="/mistakes"
            onClick={onClose}
            className="flex items-center justify-between p-3 rounded-2xl dark:bg-slate-900/60 bg-slate-50 hover:bg-slate-100 dark:hover:bg-slate-800 border dark:border-slate-800/60 border-slate-200 dark:text-slate-200 text-slate-800 transition-colors group"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-rose-500/15 border border-rose-500/30 flex items-center justify-center text-rose-500 group-hover:scale-105 transition-transform">
                <BookMarked className="w-4 h-4" />
              </div>
              <div>
                <span className="font-bold text-xs block dark:text-white text-slate-900">Sổ Tay Câu Sai</span>
                <span className="text-[10px] dark:text-slate-400 text-slate-500">Ôn luyện lỗ hổng ngữ pháp & từ vựng</span>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-rose-500" />
          </Link>

          <Link
            to="/battle"
            onClick={onClose}
            className="flex items-center justify-between p-3 rounded-2xl dark:bg-slate-900/60 bg-slate-50 hover:bg-slate-100 dark:hover:bg-slate-800 border dark:border-slate-800/60 border-slate-200 dark:text-slate-200 text-slate-800 transition-colors group"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-500 group-hover:scale-105 transition-transform">
                <Swords className="w-4 h-4" />
              </div>
              <div>
                <span className="font-bold text-xs block dark:text-white text-slate-900 flex items-center gap-1.5">
                  Đấu Trường 1v1
                  <span className="px-1.5 py-0.2 rounded-full bg-rose-500/20 text-rose-500 dark:text-rose-400 text-[9px] font-bold border border-rose-500/30">
                    HOT
                  </span>
                </span>
                <span className="text-[10px] dark:text-slate-400 text-slate-500">So tài tốc độ 15s với đối thủ</span>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-amber-500" />
          </Link>

          <Link
            to="/leaderboard"
            onClick={onClose}
            className="flex items-center justify-between p-3 rounded-2xl dark:bg-slate-900/60 bg-slate-50 hover:bg-slate-100 dark:hover:bg-slate-800 border dark:border-slate-800/60 border-slate-200 dark:text-slate-200 text-slate-800 transition-colors group"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center text-indigo-500 group-hover:scale-105 transition-transform">
                <Trophy className="w-4 h-4" />
              </div>
              <div>
                <span className="font-bold text-xs block dark:text-white text-slate-900">Bảng Xếp Hạng</span>
                <span className="text-[10px] dark:text-slate-400 text-slate-500">Top học viên & Đấu thủ xuất sắc</span>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-500" />
          </Link>

          <Link
            to="/hub"
            onClick={onClose}
            className="flex items-center justify-between p-3 rounded-2xl dark:bg-slate-900/60 bg-slate-50 hover:bg-slate-100 dark:hover:bg-slate-800 border dark:border-slate-800/60 border-slate-200 dark:text-slate-200 text-slate-800 transition-colors group"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-500 group-hover:scale-105 transition-transform">
                <LayoutDashboard className="w-4 h-4" />
              </div>
              <div>
                <span className="font-bold text-xs block dark:text-white text-slate-900">Trang Cá Nhân & Mục Tiêu</span>
                <span className="text-[10px] dark:text-slate-400 text-slate-500">Theo dõi điểm số mục tiêu & streak</span>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-cyan-500" />
          </Link>

          <Link
            to="/video"
            onClick={onClose}
            className="flex items-center justify-between p-3 rounded-2xl dark:bg-slate-900/60 bg-slate-50 hover:bg-slate-100 dark:hover:bg-slate-800 border dark:border-slate-800/60 border-slate-200 dark:text-slate-200 text-slate-800 transition-colors group"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-sky-500/15 border border-sky-500/30 flex items-center justify-center text-sky-500 group-hover:scale-105 transition-transform">
                <Video className="w-4 h-4" />
              </div>
              <div>
                <span className="font-bold text-xs block dark:text-white text-slate-900">Video Bài Giảng Vietsub</span>
                <span className="text-[10px] dark:text-slate-400 text-slate-500">Học ngữ pháp & phương pháp ETS</span>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-sky-500" />
          </Link>

          {userRole === 'admin' && (
            <Link
              to="/admin"
              onClick={onClose}
              className="flex items-center justify-between p-3 rounded-2xl bg-purple-500/15 hover:bg-purple-500/25 border border-purple-500/30 text-purple-700 dark:text-purple-200 transition-colors group"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-purple-500/30 flex items-center justify-center text-purple-500">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <span className="font-bold text-xs block dark:text-white text-slate-900">Quản Trị Hệ Thống (Admin)</span>
                  <span className="text-[10px] text-purple-600 dark:text-purple-300">Quản lý câu hỏi & người dùng</span>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-purple-500" />
            </Link>
          )}

        </div>

        {/* Bottom Actions */}
        <div className="p-4 border-t dark:border-slate-800/80 border-slate-200 space-y-2">
          {!isProUser && (
            <button
              onClick={() => {
                onClose();
                onOpenPricing();
              }}
              className="w-full py-3 rounded-2xl bg-gradient-to-r from-amber-400 via-amber-500 to-rose-500 text-slate-950 font-heading font-black text-xs shadow-lg shadow-amber-500/25 flex items-center justify-center gap-2 active:scale-95 transition-all"
            >
              <Crown className="w-4 h-4 fill-slate-950" />
              <span>NÂNG CẤP VIP KHAI TRƯƠNG 99K</span>
            </button>
          )}

          {currentUser && (
            <button
              onClick={handleLogout}
              className="w-full py-2.5 rounded-xl text-rose-400 hover:bg-rose-500/10 text-xs font-bold transition-colors flex items-center justify-center gap-2"
            >
              <LogOut className="w-4 h-4" />
              <span>Đăng xuất tài khoản</span>
            </button>
          )}
        </div>

      </div>

      {/* PWA INSTALL MODAL */}
      <InstallAppModal 
        isOpen={showInstallModal} 
        onClose={() => setShowInstallModal(false)} 
      />
    </div>,
    document.body
  );
}
