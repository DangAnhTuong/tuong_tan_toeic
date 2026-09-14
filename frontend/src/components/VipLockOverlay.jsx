import React from 'react';
import { Crown, Lock, Sparkles } from 'lucide-react';

/**
 * VipLockOverlay Component
 * Renders a premium glowing gold lock overlay on restricted content for Free users.
 * Automatically bypassed for Admins or VIP Pro users.
 */
export default function VipLockOverlay({ 
  isLocked = false, 
  onUnlockClick, 
  compact = false,
  badgeOnly = false,
  label = 'Khóa VIP',
  children 
}) {
  if (!isLocked) {
    return <>{children}</>;
  }

  // 1. Badge Only Mode (Small gold pill on card header)
  if (badgeOnly) {
    return (
      <div className="relative">
        {children}
        <div 
          onClick={(e) => {
            e.stopPropagation();
            if (onUnlockClick) onUnlockClick();
          }}
          className="absolute top-2.5 right-2.5 z-20 cursor-pointer flex items-center gap-1 px-2.5 py-1 rounded-full bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 font-black text-[10px] uppercase shadow-lg shadow-amber-500/30 hover:scale-105 transition-all border border-yellow-200"
          title="Nội dung dành cho thành viên VIP Gold"
        >
          <Crown className="w-3 h-3 fill-slate-950" />
          <span>VIP</span>
        </div>
      </div>
    );
  }

  // 2. Compact Badge Mode
  if (compact) {
    return (
      <div className="relative group">
        <div className="opacity-50 pointer-events-none filter blur-[0.5px]">
          {children}
        </div>
        <div 
          onClick={(e) => {
            e.stopPropagation();
            if (onUnlockClick) onUnlockClick();
          }}
          className="absolute inset-0 z-20 flex items-center justify-center dark:bg-slate-950/60 bg-white/70 backdrop-blur-[2px] rounded-2xl cursor-pointer hover:bg-white/80 dark:hover:bg-slate-950/40 transition-all border border-amber-500/20 group-hover:border-amber-500/50"
        >
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 font-extrabold text-xs shadow-md shadow-amber-500/20 group-hover:scale-105 transition-transform">
            <Crown className="w-3.5 h-3.5 fill-slate-950" />
            <span>{label}</span>
          </div>
        </div>
      </div>
    );
  }

  // 3. Full Card Overlay Mode
  return (
    <div className="relative group rounded-3xl overflow-hidden">
      <div className="opacity-20 pointer-events-none filter blur-[2px] select-none">
        {children}
      </div>

      <div 
        onClick={(e) => {
          e.stopPropagation();
          if (onUnlockClick) onUnlockClick();
        }}
        className="absolute inset-0 z-20 flex flex-col items-center justify-center p-5 text-center dark:bg-slate-950/92 bg-white/92 backdrop-blur-sm cursor-pointer transition-all border border-amber-500/30 group-hover:border-amber-400 shadow-xl"
      >
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-400 to-yellow-500 flex items-center justify-center text-slate-950 shadow-lg shadow-amber-500/30 mb-2.5 group-hover:scale-110 transition-transform">
          <Crown className="w-6 h-6 fill-slate-950" />
        </div>

        <h4 className="dark:text-white text-slate-900 font-heading font-extrabold text-sm mb-1 flex items-center gap-1.5">
          <span>{label}</span>
          <Sparkles className="w-3.5 h-3.5 text-amber-500 dark:text-amber-400 animate-pulse" />
        </h4>

        <p className="dark:text-slate-400 text-slate-600 text-xs max-w-[220px] mb-3 leading-relaxed">
          Nâng cấp VIP để mở khóa trọn bộ bài tập & lời giải chi tiết.
        </p>

        <button 
          type="button"
          className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-slate-950 font-black text-xs shadow-md shadow-amber-500/20 group-hover:shadow-amber-500/40 transition-all flex items-center gap-1.5"
        >
          <Crown className="w-3.5 h-3.5 fill-slate-950" />
          <span>Mở Khóa Ngay</span>
        </button>
      </div>
    </div>
  );
}
