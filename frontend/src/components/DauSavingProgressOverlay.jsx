import React from 'react';

export default function DauSavingProgressOverlay({ 
  isVisible = false, 
  isSaving = false,
  message = 'Đang lưu tiến độ làm bài của bạn...' 
}) {
  const show = Boolean(isVisible || isSaving);
  if (!show) return null;

  // Clean out any legacy "Đậu" prefix or trailing dots
  const displayMsg = (message || 'Đang lưu tiến độ làm bài của bạn')
    .replace(/^Đậu\s*/i, '')
    .replace(/\.\.\..*$/, '');

  return (
    <div 
      className="fixed inset-0 z-[9999] flex flex-col items-center justify-center p-6 bg-slate-950/90 backdrop-blur-md animate-fadeIn select-none"
      role="dialog"
      aria-modal="true"
    >
      <div className="flex flex-col items-center justify-center text-center space-y-6 max-w-sm w-full">
        
        {/* Cute Mascot Black Cat with ambient glow */}
        <div className="relative">
          {/* Subtle ambient cyan glow behind mascot */}
          <div className="absolute inset-0 rounded-full bg-cyan-500/25 blur-3xl transform scale-125 pointer-events-none" />
          
          <img 
            src="/assets/saving_progress_mascot.png" 
            alt="Đang lưu tiến độ làm bài" 
            className="relative w-44 sm:w-52 h-auto object-contain drop-shadow-[0_12px_28px_rgba(56,189,248,0.35)] animate-pulse duration-1000"
            onError={(e) => {
              if (e.target.src !== '/assets/dau_saving_progress.png') {
                e.target.src = '/assets/dau_saving_progress.png';
              }
            }}
          />
        </div>

        {/* Text with animated typing dots */}
        <div className="space-y-2">
          <div className="flex items-center justify-center gap-1.5 text-base sm:text-lg font-heading font-extrabold text-white tracking-wide">
            <span>{displayMsg}</span>
            <span className="inline-flex items-center gap-1 ml-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping inline-block" />
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse delay-150 inline-block" />
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse delay-300 inline-block" />
            </span>
          </div>

          <p className="text-xs text-slate-400 font-medium">
            Tiến trình câu đã làm và câu sai đang được đồng bộ hóa...
          </p>
        </div>

      </div>
    </div>
  );
}
