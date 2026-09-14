import React from 'react';
import { Highlighter, Eraser, X, Check } from 'lucide-react';

export default function AnnotatorToolbar({
  isActive,
  onToggle,
  currentColor,
  onChangeColor,
  onClearAll
}) {
  const colors = [
    { id: 'yellow', label: 'Vàng', bg: 'bg-amber-400', border: 'border-amber-300', text: 'text-amber-950' },
    { id: 'green', label: 'Xanh lá', bg: 'bg-emerald-400', border: 'border-emerald-300', text: 'text-emerald-950' },
    { id: 'pink', label: 'Hồng', bg: 'bg-rose-400', border: 'border-rose-300', text: 'text-rose-950' },
    { id: 'blue', label: 'Xanh dương', bg: 'bg-sky-400', border: 'border-sky-300', text: 'text-sky-950' }
  ];

  if (!isActive) return null;

  return (
    <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50 animate-bounce-short dark:bg-slate-900/95 bg-white/95 backdrop-blur-xl border border-sky-500/40 p-2.5 rounded-2xl shadow-2xl shadow-sky-500/10 flex items-center gap-2 text-xs text-slate-800 dark:text-slate-100">
      <div className="flex items-center gap-1.5 px-2 py-1 bg-sky-500/20 text-sky-500 rounded-xl font-bold">
        <Highlighter className="w-3.5 h-3.5" />
        <span>Bút dạ quang (Annotator)</span>
      </div>

      <div className="h-4 w-px dark:bg-slate-700 bg-slate-200" />

      {/* Colors */}
      <div className="flex items-center gap-1.5">
        {colors.map((c) => {
          const isSelected = currentColor === c.id;
          return (
            <button
              key={c.id}
              onClick={() => onChangeColor(c.id)}
              className={`w-6 h-6 rounded-full ${c.bg} flex items-center justify-center transition-all ${
                isSelected ? 'ring-2 dark:ring-white ring-slate-800 scale-110 shadow-lg' : 'opacity-70 hover:opacity-100'
              }`}
              title={`Màu ${c.label}`}
            >
              {isSelected && <Check className={`w-3.5 h-3.5 ${c.text} stroke-[3]`} />}
            </button>
          );
        })}
      </div>

      <div className="h-4 w-px dark:bg-slate-700 bg-slate-200" />

      {/* Clear Button */}
      <button
        onClick={onClearAll}
        className="px-2.5 py-1 rounded-xl dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-300 dark:hover:text-white bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900 flex items-center gap-1 font-medium transition-colors"
        title="Xóa tất cả highlight trên trang"
      >
        <Eraser className="w-3.5 h-3.5 text-rose-500" />
        <span>Xóa hết</span>
      </button>

      {/* Close button */}
      <button
        onClick={onToggle}
        className="p-1 rounded-xl dark:bg-slate-800 dark:hover:bg-rose-500/20 dark:text-slate-400 dark:hover:text-rose-400 bg-slate-100 hover:bg-rose-50 text-slate-500 hover:text-rose-600 transition-colors"
        title="Tắt Annotator"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}
