import React, { useState } from 'react';
import { X, CheckCircle2, XCircle, Sparkles, HelpCircle, RefreshCw } from 'lucide-react';

export default function FillInBlanksModal({ isOpen, onClose, question }) {
  const [userInput, setUserInput] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [showHint, setShowHint] = useState(false);

  if (!isOpen || !question) return null;

  // Derive target sentence from question prompt or correct option
  const targetText = question.options?.find(o => o.isCorrect || o.label === `(${question.correctAnswer})`)?.text || question.prompt || '';
  const isCorrect = userInput.trim().toLowerCase() === targetText.trim().toLowerCase();

  const handleCheck = () => {
    setIsSubmitted(true);
  };

  const handleReset = () => {
    setUserInput('');
    setIsSubmitted(false);
    setShowHint(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 dark:bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="w-full max-w-lg dark:bg-slate-900 bg-white border dark:border-sky-500/40 border-slate-200 rounded-3xl p-6 shadow-2xl space-y-5 dark:text-slate-100 text-slate-900 relative">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b dark:border-slate-800 border-slate-200 pb-3">
          <div className="flex items-center gap-2 text-sky-600 dark:text-sky-400 font-extrabold text-sm font-heading">
            <Sparkles className="w-4 h-4" />
            <span>✏️ Luyện Gõ Điền Từ / Chép Chính Tả (Dictation)</span>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl dark:bg-slate-800 bg-slate-100 hover:dark:bg-slate-700 hover:bg-slate-200 dark:text-slate-400 text-slate-600 hover:dark:text-white hover:text-slate-900 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-4">
          <p className="text-xs dark:text-slate-300 text-slate-600">
            Hãy nghe hoặc đọc gợi ý và tự tay gõ lại chính xác câu/đáp án tiếng Anh vào ô bên dưới:
          </p>

          {/* Prompt / Audio Context */}
          {question.prompt && (
            <div className="p-3.5 rounded-2xl dark:bg-slate-950/80 bg-slate-50 border dark:border-slate-800 border-slate-200 text-xs dark:text-slate-200 text-slate-800">
              <span className="font-bold text-sky-600 dark:text-sky-400">Câu hỏi: </span>
              <span>{question.prompt}</span>
            </div>
          )}

          {/* Hint */}
          {showHint && targetText && (
            <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-700 dark:text-amber-300 text-xs font-mono">
              💡 Gợi ý: {targetText.split(' ').map((w, i) => i === 0 || i === targetText.split(' ').length - 1 ? w : w[0] + '...').join(' ')}
            </div>
          )}

          {/* Input Textarea */}
          <div className="space-y-2">
            <textarea
              rows={3}
              value={userInput}
              onChange={(e) => {
                setUserInput(e.target.value);
                if (isSubmitted) setIsSubmitted(false);
              }}
              placeholder="Gõ đáp án tiếng Anh tại đây..."
              className="w-full p-4 rounded-2xl dark:bg-slate-950 bg-slate-50 border dark:border-slate-700 border-slate-300 focus:border-sky-500 focus:ring-1 focus:ring-sky-500 dark:text-slate-100 text-slate-900 text-sm outline-none resize-none"
            />
          </div>

          {/* Result Feedback */}
          {isSubmitted && (
            <div className={`p-4 rounded-2xl border flex items-start gap-3 text-xs leading-relaxed animate-fadeIn ${
              isCorrect ? 'bg-emerald-500/15 border-emerald-500/50 text-emerald-800 dark:text-emerald-300' : 'bg-rose-500/15 border-rose-500/50 text-rose-800 dark:text-rose-300'
            }`}>
              {isCorrect ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
              ) : (
                <XCircle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
              )}
              <div className="space-y-1">
                <p className="font-bold text-sm">{isCorrect ? '🎉 Xuất sắc! Bạn đã gõ chính xác 100%!' : '❌ Chưa chính xác, hãy so sánh với câu chuẩn bên dưới:'}</p>
                {!isCorrect && (
                  <p className="font-mono dark:text-white text-slate-900 dark:bg-slate-950/60 bg-white p-2 rounded-xl border dark:border-slate-800 border-slate-300">
                    {targetText}
                  </p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Bottom Actions */}
        <div className="flex items-center justify-between pt-2 border-t dark:border-slate-800 border-slate-200">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowHint(!showHint)}
              className="px-3 py-1.5 rounded-xl dark:bg-slate-800 bg-slate-100 hover:dark:bg-slate-700 hover:bg-slate-200 dark:text-slate-300 text-slate-700 text-xs font-bold flex items-center gap-1 transition-colors border dark:border-slate-700 border-slate-200"
            >
              <HelpCircle className="w-3.5 h-3.5 text-amber-500" />
              <span>{showHint ? 'Ẩn gợi ý' : 'Gợi ý'}</span>
            </button>

            <button
              onClick={handleReset}
              className="p-2 rounded-xl dark:bg-slate-800 bg-slate-100 hover:dark:bg-slate-700 hover:bg-slate-200 dark:text-slate-400 text-slate-600 hover:dark:text-white hover:text-slate-900 transition-colors border dark:border-slate-700 border-slate-200"
              title="Làm lại"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          </div>

          <button
            onClick={handleCheck}
            disabled={!userInput.trim()}
            className="px-5 py-2 rounded-xl bg-sky-500 hover:bg-sky-400 disabled:opacity-40 text-slate-950 font-extrabold text-xs shadow-md shadow-sky-500/20 transition-all"
          >
            Kiểm tra
          </button>
        </div>

      </div>
    </div>
  );
}
