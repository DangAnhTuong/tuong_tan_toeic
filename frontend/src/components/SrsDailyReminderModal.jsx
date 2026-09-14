import React from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Sparkles, Clock, Brain, Flame, ArrowRight } from 'lucide-react';

export default function SrsDailyReminderModal({
  isOpen,
  onClose,
  dueCount = 0,
  onStartReview
}) {
  const navigate = useNavigate();

  if (!isOpen || dueCount <= 0) return null;

  const handleStart = () => {
    if (onStartReview) {
      onStartReview();
    } else {
      if (onClose) onClose();
      navigate('/vocabulary/review?tab=learn&study=flashcard');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      {/* Background click to close */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Modal Container */}
      <div className="relative w-full max-w-lg rounded-3xl dark:bg-[#0f172a] bg-white border border-amber-500/40 shadow-2xl shadow-amber-500/10 p-6 sm:p-8 overflow-hidden text-center animate-scaleUp z-10">
        
        {/* Glow Effects */}
        <div className="absolute -top-24 -left-24 w-60 h-60 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-60 h-60 bg-yellow-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-xl text-slate-400 hover:text-slate-800 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/80 transition-colors z-20"
          title="Đóng"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Top Badge */}
        <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-600 dark:text-amber-400 font-extrabold text-[11px] uppercase tracking-wider mb-4 shadow-sm">
          <Sparkles className="w-3.5 h-3.5 animate-spin-slow" />
          <span>Thuật toán SM-2 SuperMemo • Nhắc nhở hôm nay</span>
        </div>

        {/* Center Mascot / Icon */}
        <div className="relative mx-auto mb-4 w-20 h-20 sm:w-24 sm:h-24 flex items-center justify-center">
          <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-amber-500/30 to-yellow-400/20 animate-ping opacity-30" />
          <div className="relative w-full h-full rounded-2xl bg-gradient-to-tr from-amber-400 to-yellow-500 p-0.5 shadow-xl shadow-amber-500/30 flex items-center justify-center overflow-hidden">
            <img 
              src="/assets/saving_progress_mascot.png" 
              alt="Mascot nhắc nhở ôn tập"
              className="w-full h-full object-cover"
              onError={(e) => {
                // Fallback to Icon if image fails
                e.currentTarget.style.display = 'none';
              }}
            />
            <Sparkles className="w-10 h-10 text-slate-950 absolute" />
          </div>
        </div>

        {/* Main Title */}
        <h2 className="text-xl sm:text-2xl font-black font-heading dark:text-white text-slate-900 leading-snug">
          Hôm nay bạn có{' '}
          <span className="text-amber-500 underline decoration-amber-500/40 underline-offset-4">
            {dueCount} từ vựng
          </span>{' '}
          cần ôn tập! ⏰
        </h2>

        {/* Subtitle */}
        <p className="text-xs sm:text-sm dark:text-slate-300 text-slate-600 mt-2 max-w-md mx-auto leading-relaxed">
          Thuật toán ngắt quãng SM-2 đã lọc ra các từ bạn sắp quên. Dành 3 phút ôn ngay hôm nay để đưa toàn bộ vào trí nhớ dài hạn vĩnh viễn!
        </p>

        {/* 3 Value Badges */}
        <div className="grid grid-cols-3 gap-2 sm:gap-3 my-5">
          <div className="p-2.5 rounded-2xl dark:bg-slate-800/60 bg-slate-50 border dark:border-slate-800 border-slate-200/80 flex flex-col items-center text-center space-y-1">
            <Clock className="w-4 h-4 text-sky-500 shrink-0" />
            <span className="text-[11px] font-black dark:text-white text-slate-800">~3 - 5 phút</span>
            <span className="text-[10px] dark:text-slate-400 text-slate-500">Ước tính</span>
          </div>

          <div className="p-2.5 rounded-2xl dark:bg-slate-800/60 bg-slate-50 border dark:border-slate-800 border-slate-200/80 flex flex-col items-center text-center space-y-1">
            <Brain className="w-4 h-4 text-amber-500 shrink-0" />
            <span className="text-[11px] font-black dark:text-white text-slate-800">Chống quên 95%</span>
            <span className="text-[10px] dark:text-slate-400 text-slate-500">Trí nhớ dài hạn</span>
          </div>

          <div className="p-2.5 rounded-2xl dark:bg-slate-800/60 bg-slate-50 border dark:border-slate-800 border-slate-200/80 flex flex-col items-center text-center space-y-1">
            <Flame className="w-4 h-4 text-rose-500 shrink-0" />
            <span className="text-[11px] font-black dark:text-white text-slate-800">Giữ Streak 🔥</span>
            <span className="text-[10px] dark:text-slate-400 text-slate-500">+15 XP thưởng</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2 pt-1">
          <button
            onClick={handleStart}
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-black text-sm flex items-center justify-center gap-2 shadow-xl shadow-amber-500/30 hover:scale-[1.01] active:scale-[0.98] transition-all font-heading tracking-wider cursor-pointer"
          >
            <span>BẮT ĐẦU ÔN TẬP NGAY ({dueCount} TỪ)</span>
            <ArrowRight className="w-4 h-4 stroke-[3]" />
          </button>

          <button
            onClick={onClose}
            className="w-full py-2.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-white text-xs font-bold transition-colors cursor-pointer"
          >
            Để sau, hôm nay không nhắc lại
          </button>
        </div>

        {/* Daily Note */}
        <p className="text-[10px] dark:text-slate-500 text-slate-400 mt-3 italic">
          💡 Thông báo này chỉ xuất hiện 1 lần duy nhất mỗi ngày khi bạn mở web.
        </p>

      </div>
    </div>
  );
}
