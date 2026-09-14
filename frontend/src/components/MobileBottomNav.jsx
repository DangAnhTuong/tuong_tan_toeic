import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  Home, 
  Headphones, 
  BookOpen, 
  Sparkles, 
  FileText, 
  Menu,
  X,
  Trophy,
  Swords,
  BookMarked,
  LayoutDashboard,
  Video,
  Crown,
  LogOut,
  ShieldCheck,
  User,
  Clock,
  Flame,
  Zap,
  Target
} from 'lucide-react';
import { getStoredUser, clearStoredUser } from '../utils/auth';
import PricingModal from './PricingModal';

export default function MobileBottomNav({ onOpenMenu }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(getStoredUser());

  useEffect(() => {
    setCurrentUser(getStoredUser());
  }, [location.pathname]);

  // Don't render MobileBottomNav inside Immersive Practice Rooms & Exams to give 100% focus and space
  const isImmersiveRoom = 
    location.pathname.startsWith('/tests/room/') ||
    location.pathname.startsWith('/read/practice/') ||
    location.pathname.startsWith('/reading/article/') ||
    location.pathname.startsWith('/listen/practice/') ||
    location.pathname.startsWith('/listen/dictation') ||
    location.pathname.startsWith('/listen/level-practice') ||
    location.pathname.startsWith('/grammar/') ||
    location.pathname.startsWith('/battle');

  if (isImmersiveRoom) {
    return null;
  }

  const navTabs = [
    { name: 'Trang chủ', path: '/', icon: Home },
    { name: 'Luyện nghe', path: '/listen', icon: Headphones },
    { name: 'Luyện đọc', path: '/read', icon: BookOpen },
    { name: 'Từ vựng', path: '/vocabulary', icon: Sparkles },
    { name: 'Đề thi', path: '/tests', icon: FileText },
  ];

  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 dark:bg-[#070b14]/95 bg-white/95 backdrop-blur-2xl border-t dark:border-slate-800/90 border-slate-200/90 shadow-2xl transition-all">
      <div className="max-w-md mx-auto px-2 py-1 flex items-center justify-around pb-[max(0.5rem,env(safe-area-inset-bottom))]">
        {navTabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = tab.path === '/' 
            ? location.pathname === '/' 
            : location.pathname.startsWith(tab.path);

          return (
            <Link
              key={tab.path}
              to={tab.path}
              className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all duration-200 ${
                isActive
                  ? 'dark:text-cyan-400 text-cyan-600 font-bold scale-105'
                  : 'dark:text-slate-400 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              <div className="relative">
                <Icon className={`w-5 h-5 ${isActive ? 'dark:text-cyan-400 text-cyan-600 stroke-[2.5]' : 'dark:text-slate-400 text-slate-500'}`} />
                {isActive && (
                  <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-cyan-500 ring-2 dark:ring-[#070b14] ring-white animate-pulse" />
                )}
              </div>
              <span className={`text-[10px] tracking-tight mt-0.5 whitespace-nowrap ${isActive ? 'dark:text-cyan-400 text-cyan-600 font-black' : 'dark:text-slate-400 text-slate-500 font-medium'}`}>
                {tab.name}
              </span>
            </Link>
          );
        })}

        {/* Menu Drawer Toggle Button */}
        <button
          onClick={onOpenMenu}
          className="flex flex-col items-center justify-center py-1 px-2.5 rounded-xl dark:text-slate-400 text-slate-500 hover:text-slate-900 dark:hover:text-white transition-all active:scale-95"
          title="Mở rộng menu"
        >
          <div className="w-5 h-5 flex items-center justify-center">
            <Menu className="w-5 h-5 dark:text-slate-400 text-slate-500" />
          </div>
          <span className="text-[10px] tracking-tight mt-0.5 dark:text-slate-400 text-slate-500 font-medium">
            Thêm
          </span>
        </button>
      </div>
    </div>
  );
}
