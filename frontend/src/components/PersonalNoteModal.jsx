import React, { useState, useEffect } from 'react';
import { X, Save, Edit3, Trash2 } from 'lucide-react';

export default function PersonalNoteModal({
  isOpen,
  onClose,
  questionId,
  title = 'Ghi chú cá nhân',
  onSave
}) {
  const [noteContent, setNoteContent] = useState('');

  useEffect(() => {
    if (isOpen && questionId) {
      const stored = localStorage.getItem(`tuongtan_note_${questionId}`) || '';
      setNoteContent(stored);
    }
  }, [isOpen, questionId]);

  if (!isOpen) return null;

  const handleSave = () => {
    if (questionId) {
      localStorage.setItem(`tuongtan_note_${questionId}`, noteContent.trim());
    }
    if (onSave) onSave(noteContent.trim());
    onClose();
  };

  const handleClear = () => {
    if (questionId) {
      localStorage.removeItem(`tuongtan_note_${questionId}`);
    }
    setNoteContent('');
    if (onSave) onSave('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="w-full max-w-lg dark:bg-slate-900 bg-white border dark:border-slate-700 border-slate-200 rounded-3xl p-6 shadow-2xl space-y-4 dark:text-slate-100 text-slate-800 relative">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b dark:border-slate-800 border-slate-100 pb-3">
          <div className="flex items-center gap-2 text-sky-500 font-extrabold text-sm font-heading">
            <Edit3 className="w-4 h-4" />
            <span>📝 {title}</span>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-400 dark:hover:text-white bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Textarea */}
        <div className="space-y-2">
          <label className="text-xs dark:text-slate-400 text-slate-500 font-medium">
            Ghi lại ngữ pháp cần nhớ, bẫy ETS hoặc mẹo làm câu này để ôn tập lại sau:
          </label>
          <textarea
            rows={5}
            value={noteContent}
            onChange={(e) => setNoteContent(e.target.value)}
            placeholder="Ví dụ: Chú ý sau giới từ dùng V-ing, nhớ học từ vựng renovation..."
            className="w-full p-4 rounded-2xl dark:bg-slate-950 bg-slate-50 border dark:border-slate-700 border-slate-200 focus:border-sky-500 focus:ring-1 focus:ring-sky-500 dark:text-slate-100 text-slate-800 text-sm outline-none resize-none placeholder:text-slate-400"
          />
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between pt-2 border-t dark:border-slate-800 border-slate-100">
          <button
            onClick={handleClear}
            className="px-3.5 py-2 rounded-xl dark:bg-slate-800 dark:hover:bg-rose-500/20 dark:text-slate-400 dark:hover:text-rose-400 bg-slate-100 hover:bg-rose-50 text-slate-600 hover:text-rose-600 text-xs font-bold flex items-center gap-1.5 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Xóa ghi chú</span>
          </button>

          <button
            onClick={handleSave}
            className="px-5 py-2 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-extrabold text-xs flex items-center gap-1.5 shadow-md shadow-sky-500/20 transition-all"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Lưu ghi chú</span>
          </button>
        </div>

      </div>
    </div>
  );
}
