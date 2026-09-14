import React from 'react';
import { LogOut } from 'lucide-react';

export default function ExitModal({ isOpen, onClose, onConfirmExit, isSaving = false }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="w-full max-w-md dark:bg-slate-900 bg-white border dark:border-slate-800 border-slate-200 rounded-3xl p-6 shadow-2xl text-center space-y-5">
        
        <div className="w-14 h-14 mx-auto rounded-2xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-600 dark:text-cyan-400 flex items-center justify-center">
          <LogOut className="w-7 h-7" />
        </div>

        <div className="space-y-2">
          <h3 className="font-heading font-extrabold text-xl dark:text-white text-slate-900">
            Thoát khỏi bài luyện tập?
          </h3>
          <p className="text-xs dark:text-slate-400 text-slate-600 leading-relaxed max-w-xs mx-auto">
            Tiến trình làm bài của bạn sẽ được lưu lại. Bạn có thể tiếp tục làm bài sau.
          </p>
        </div>

        <div className="flex items-center justify-center gap-3 pt-2">
          <button
            type="button"
            disabled={isSaving}
            onClick={onClose}
            className="flex-1 py-2.5 px-4 rounded-xl dark:bg-slate-800 bg-slate-100 hover:bg-slate-200 dark:hover:bg-slate-700 dark:text-slate-300 text-slate-700 text-xs font-bold border dark:border-slate-700 border-slate-200 transition-colors cursor-pointer"
          >
            Tiếp tục làm bài
          </button>
          
          <button
            type="button"
            disabled={isSaving}
            onClick={onConfirmExit}
            className="flex-1 py-2.5 px-4 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-black shadow-lg shadow-cyan-500/25 transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
          >
            <span>Thoát</span>
          </button>
        </div>

      </div>
    </div>
  );
}
