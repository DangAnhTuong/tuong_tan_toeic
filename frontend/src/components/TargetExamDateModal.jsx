import React, { useState, useEffect } from 'react';
import { X, Calendar, Target, Sparkles, Check, Trash2, Clock, Zap, ExternalLink, Flame, BookOpen, Headphones } from 'lucide-react';
import { calculateStudyPace, generateGoogleCalendarUrl } from '../utils/studyPaceCalculator';

export default function TargetExamDateModal({
  isOpen,
  onClose,
  currentScore = 100,
  initialTargetScore = 650,
  initialTestDate = null,
  onSave
}) {
  const [targetScore, setTargetScore] = useState(initialTargetScore);
  const [testDate, setTestDate] = useState('');
  const [autoSyncDailyGoals, setAutoSyncDailyGoals] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setTargetScore(initialTargetScore || 650);
      if (initialTestDate) {
        const d = new Date(initialTestDate);
        if (!isNaN(d.getTime())) {
          setTestDate(d.toISOString().split('T')[0]);
        } else {
          setTestDate('');
        }
      } else {
        setTestDate('');
      }
    }
  }, [isOpen, initialTargetScore, initialTestDate]);

  if (!isOpen) return null;

  const scorePresets = [500, 650, 750, 850, 900];

  // Calculate study pace using the smart algorithm
  const paceInfo = calculateStudyPace(currentScore, targetScore, testDate);
  const googleCalUrl = testDate ? generateGoogleCalendarUrl(testDate, targetScore) : null;

  const handleClearDate = () => {
    setTestDate('');
  };

  const handleSave = async () => {
    setIsSubmitting(true);
    try {
      await onSave({
        targetScore: Number(targetScore) || 650,
        testDate: testDate ? new Date(testDate).toISOString() : null,
        autoSyncDailyGoals,
        paceInfo
      });
      onClose();
    } catch (err) {
      console.error('Failed to save target & exam date:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div 
        className="relative w-full max-w-lg bg-slate-900 border border-slate-700/80 rounded-3xl shadow-2xl overflow-hidden animate-scale-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* MODAL HEADER */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-800 bg-slate-900/50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              <Target className="w-5 h-5" />
            </div>
            <h3 className="font-heading font-extrabold text-lg text-white">
              Mục tiêu & ngày thi
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* MODAL BODY */}
        <div className="p-6 space-y-6">
          
          {/* SECTION 1: ĐIỂM MỤC TIÊU */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                Điểm mục tiêu TOEIC
              </label>
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/15 border border-cyan-500/30 text-cyan-300 font-extrabold text-sm focus-within:ring-2 focus-within:ring-cyan-400">
                <input
                  type="number"
                  min="10"
                  max="990"
                  step="5"
                  value={targetScore}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val === '') {
                      setTargetScore('');
                      return;
                    }
                    const num = parseInt(val, 10);
                    if (!isNaN(num)) setTargetScore(num);
                  }}
                  onBlur={() => {
                    const num = parseInt(targetScore, 10);
                    if (isNaN(num) || num < 10) {
                      setTargetScore(10);
                    } else if (num > 990) {
                      setTargetScore(990);
                    } else {
                      setTargetScore(Math.round(num / 5) * 5);
                    }
                  }}
                  className="w-14 bg-transparent text-center font-mono font-black text-cyan-300 outline-none"
                  title="Nhập trực tiếp điểm mục tiêu (10 - 990)"
                />
                <span className="text-[11px] font-normal text-cyan-400">điểm</span>
              </div>
            </div>

            {/* Slider */}
            <div className="space-y-1 py-1">
              <input
                type="range"
                min="300"
                max="990"
                step="10"
                value={targetScore}
                onChange={(e) => setTargetScore(Number(e.target.value))}
                className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400 focus:outline-none"
              />
              <div className="flex justify-between text-[11px] text-slate-500 font-bold px-1">
                <span>300</span>
                <span>650</span>
                <span>990</span>
              </div>
            </div>

            {/* Preset Buttons */}
            <div className="flex items-center gap-2 pt-1">
              <span className="text-xs text-slate-400 font-semibold">Gợi ý:</span>
              <div className="flex flex-wrap items-center gap-1.5 flex-1">
                {scorePresets.map((score) => {
                  const isSelected = targetScore === score;
                  return (
                    <button
                      key={score}
                      type="button"
                      onClick={() => setTargetScore(score)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all ${
                        isSelected
                          ? 'bg-gradient-to-r from-cyan-500 to-teal-500 text-slate-950 shadow-md shadow-cyan-500/20 scale-105'
                          : 'bg-slate-800/80 hover:bg-slate-700 text-slate-300 border border-slate-700/60'
                      }`}
                    >
                      {score}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* SECTION 2: NGÀY THI DỰ KIẾN */}
          <div className="space-y-3 pt-4 border-t border-slate-800">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-cyan-400" />
                <span>Ngày thi dự kiến (tuỳ chọn)</span>
              </label>
              {paceInfo.daysRemaining !== null && (
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${
                  paceInfo.daysRemaining >= 0 
                    ? paceInfo.paceLevel === 'ideal'
                      ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                      : paceInfo.paceLevel === 'moderate'
                        ? 'bg-amber-500/15 text-amber-300 border-amber-500/30'
                        : 'bg-rose-500/15 text-rose-300 border-rose-500/30'
                    : 'bg-slate-800 text-slate-400 border-slate-700'
                }`}>
                  {paceInfo.daysRemaining >= 0 ? `⏳ Còn ${paceInfo.daysRemaining} ngày` : 'Đã qua ngày thi'}
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <input
                  id="exam-date"
                  type="date"
                  value={testDate}
                  min={new Date().toISOString().split('T')[0]}
                  onChange={(e) => setTestDate(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700/80 focus:border-cyan-500 rounded-2xl px-4 py-3 text-sm text-slate-100 placeholder-slate-500 focus:outline-none transition-colors"
                />
              </div>

              {testDate && (
                <button
                  type="button"
                  onClick={handleClearDate}
                  className="px-4 py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-rose-400 hover:text-rose-300 text-xs font-bold transition-colors flex items-center gap-1.5 shrink-0"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Bỏ</span>
                </button>
              )}
            </div>

            {/* DYNAMIC AI STUDY PACE BREAKDOWN (When date is set) */}
            {testDate && paceInfo.hasDate && paceInfo.daysRemaining >= 0 ? (
              <div className="p-4 rounded-2xl bg-slate-950/80 border border-cyan-500/30 space-y-3 animate-fade-in shadow-inner">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-mono font-black uppercase text-cyan-400 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
                    <span>LỘ TRÌNH AI PHÂN BỔ MỖI NGÀY</span>
                  </span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                    paceInfo.paceLevel === 'ideal' 
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' 
                      : paceInfo.paceLevel === 'moderate' 
                        ? 'bg-amber-500/20 text-amber-300 border-amber-500/40' 
                        : 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                  }`}>
                    {paceInfo.badgeText}
                  </span>
                </div>

                {/* 4 Metric Pills */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <div className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800 text-center">
                    <div className="flex items-center justify-center gap-1 text-[11px] text-cyan-400 font-bold mb-0.5">
                      <Headphones className="w-3 h-3" />
                      <span>Nghe</span>
                    </div>
                    <div className="text-base font-black text-white font-mono">{paceInfo.listeningDaily}</div>
                    <span className="text-[10px] text-slate-400">câu/ngày</span>
                  </div>

                  <div className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800 text-center">
                    <div className="flex items-center justify-center gap-1 text-[11px] text-emerald-400 font-bold mb-0.5">
                      <BookOpen className="w-3 h-3" />
                      <span>Đọc</span>
                    </div>
                    <div className="text-base font-black text-white font-mono">{paceInfo.readingDaily}</div>
                    <span className="text-[10px] text-slate-400">câu/ngày</span>
                  </div>

                  <div className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800 text-center">
                    <div className="flex items-center justify-center gap-1 text-[11px] text-amber-400 font-bold mb-0.5">
                      <Zap className="w-3 h-3" />
                      <span>Từ vựng</span>
                    </div>
                    <div className="text-base font-black text-white font-mono">{paceInfo.vocabDaily}</div>
                    <span className="text-[10px] text-slate-400">từ/ngày</span>
                  </div>

                  <div className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800 text-center">
                    <div className="flex items-center justify-center gap-1 text-[11px] text-violet-400 font-bold mb-0.5">
                      <Clock className="w-3 h-3" />
                      <span>Thời lượng</span>
                    </div>
                    <div className="text-base font-black text-white font-mono">~{paceInfo.estimatedMinutesPerDay}</div>
                    <span className="text-[10px] text-slate-400">phút/ngày</span>
                  </div>
                </div>

                {/* Pedagogical Advice */}
                <p className="text-[11px] text-slate-300 leading-relaxed bg-slate-900/60 p-2.5 rounded-xl border border-slate-800/80">
                  💡 {paceInfo.advice}
                </p>

                {/* Auto Sync Toggle & Google Calendar Link */}
                <div className="pt-1 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 border-t border-slate-800/80 text-xs">
                  <label className="flex items-center gap-2 cursor-pointer text-slate-300 hover:text-white select-none">
                    <input
                      type="checkbox"
                      checked={autoSyncDailyGoals}
                      onChange={(e) => setAutoSyncDailyGoals(e.target.checked)}
                      className="w-4 h-4 rounded text-cyan-500 bg-slate-900 border-slate-700 focus:ring-cyan-400 focus:ring-offset-slate-950"
                    />
                    <span className="text-[11px] font-medium text-cyan-300">
                      Tự động cập nhật vào <strong>Mục tiêu hôm nay</strong>
                    </span>
                  </label>

                  {googleCalUrl && (
                    <a
                      href={googleCalUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-400 hover:text-amber-300 transition-colors py-0.5"
                      title="Mở Google Calendar để thêm lịch nhắc thi"
                    >
                      <span>Thêm vào Google Calendar</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
              </div>
            ) : (
              /* Helper Text when no date is picked */
              <div className="space-y-1 text-xs text-slate-400 leading-relaxed bg-slate-950/50 p-3.5 rounded-2xl border border-slate-800/80">
                <p className="flex items-start gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-cyan-400 mt-0.5 shrink-0" />
                  <span>Web sẽ đếm ngược mỗi ngày để bạn không quên deadline và duy trì kỷ luật.</span>
                </p>
                <p className="flex items-start gap-1.5 text-slate-400">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400 mt-0.5 shrink-0" />
                  <span>Dựa vào ngày thi, AI sẽ tự động phân bổ khối lượng câu hỏi & từ vựng cần học mỗi ngày để đạt mục tiêu.</span>
                </p>
              </div>
            )}
          </div>

        </div>

        {/* MODAL FOOTER */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-800 bg-slate-950/40">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-colors"
          >
            Huỷ
          </button>
          <button
            type="button"
            disabled={isSubmitting}
            onClick={handleSave}
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-400 hover:to-teal-400 text-slate-950 text-xs font-black shadow-lg shadow-cyan-500/20 transition-all hover:scale-105 active:scale-95 disabled:opacity-50 flex items-center gap-1.5"
          >
            <Check className="w-4 h-4" />
            <span>{isSubmitting ? 'Đang lưu...' : 'Lưu'}</span>
          </button>
        </div>

      </div>
    </div>
  );
}
