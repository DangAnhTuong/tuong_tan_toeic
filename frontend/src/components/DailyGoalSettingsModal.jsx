import React, { useState, useEffect } from 'react';
import { X, Settings, BookOpen, Headphones, Sparkles, FileText, Video, Check } from 'lucide-react';

export default function DailyGoalSettingsModal({
  isOpen,
  onClose,
  initialGoals,
  onSave
}) {
  const defaultGoals = {
    reading: { enabled: true, target: 30 },
    listening: { enabled: true, target: 30 },
    vocab: { enabled: true, target: 20 },
    mockTest: { enabled: true, target: 40 },
    video: { enabled: true, target: 2 }
  };

  const [goals, setGoals] = useState(defaultGoals);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (initialGoals) {
        setGoals({
          reading: { enabled: initialGoals.reading?.enabled ?? true, target: initialGoals.reading?.target ?? 30 },
          listening: { enabled: initialGoals.listening?.enabled ?? true, target: initialGoals.listening?.target ?? 30 },
          vocab: { enabled: initialGoals.vocab?.enabled ?? true, target: initialGoals.vocab?.target ?? 20 },
          mockTest: { enabled: initialGoals.mockTest?.enabled ?? true, target: initialGoals.mockTest?.target ?? 40 },
          video: { enabled: initialGoals.video?.enabled ?? true, target: initialGoals.video?.target ?? 2 }
        });
      } else {
        setGoals(defaultGoals);
      }
    }
  }, [isOpen, initialGoals]);

  if (!isOpen) return null;

  const skillConfigs = [
    {
      id: 'reading',
      label: 'Đọc',
      unit: 'câu/ngày',
      icon: BookOpen,
      color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
      min: 1,
      max: 200,
      help: '1 - 200 câu/ngày'
    },
    {
      id: 'listening',
      label: 'Nghe',
      unit: 'câu/ngày',
      icon: Headphones,
      color: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20',
      min: 1,
      max: 200,
      help: '1 - 200 câu/ngày'
    },
    {
      id: 'vocab',
      label: 'Từ vựng',
      unit: 'từ/ngày',
      icon: Sparkles,
      color: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
      min: 1,
      max: 400,
      help: '1 - 400 từ/ngày'
    },
    {
      id: 'mockTest',
      label: 'Luyện đề',
      unit: 'câu/ngày',
      icon: FileText,
      color: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
      min: 1,
      max: 1000,
      help: '1 - 1000 câu/ngày'
    },
    {
      id: 'video',
      label: 'Video',
      unit: 'bài/ngày',
      icon: Video,
      color: 'text-rose-400 bg-rose-500/10 border-rose-500/20',
      min: 1,
      max: 20,
      help: '1 - 20 bài/ngày'
    }
  ];

  const handleToggle = (id) => {
    setGoals(prev => ({
      ...prev,
      [id]: {
        ...prev[id],
        enabled: !prev[id].enabled
      }
    }));
  };

  const handleTargetChange = (id, val, min, max) => {
    const num = parseInt(val, 10);
    if (isNaN(num)) {
      setGoals(prev => ({
        ...prev,
        [id]: { ...prev[id], target: '' }
      }));
      return;
    }
    const clamped = Math.max(min, Math.min(max, num));
    setGoals(prev => ({
      ...prev,
      [id]: { ...prev[id], target: clamped }
    }));
  };

  const handleSave = async () => {
    setIsSubmitting(true);
    try {
      // sanitize targets
      const sanitized = {};
      skillConfigs.forEach(cfg => {
        const item = goals[cfg.id];
        sanitized[cfg.id] = {
          enabled: item.enabled,
          target: item.target ? Number(item.target) : cfg.min
        };
      });
      await onSave(sanitized);
      onClose();
    } catch (err) {
      console.error('Failed to save daily goals:', err);
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
        {/* HEADER */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-800 bg-slate-900/50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-heading font-extrabold text-lg text-white">
                Cài đặt mục tiêu hằng ngày
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Đặt mục tiêu cho từng kỹ năng. Tắt mục bạn không muốn theo dõi.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* BODY */}
        <div className="p-6 space-y-4 max-h-[65vh] overflow-y-auto custom-scrollbar">
          {skillConfigs.map((cfg) => {
            const Icon = cfg.icon;
            const item = goals[cfg.id] || { enabled: true, target: 30 };
            const isEnabled = item.enabled;

            return (
              <div 
                key={cfg.id}
                className={`p-4 rounded-2xl border transition-all flex items-center justify-between gap-4 ${
                  isEnabled 
                    ? 'bg-slate-950/70 border-slate-800 shadow-sm' 
                    : 'bg-slate-950/20 border-slate-800/40 opacity-50'
                }`}
              >
                {/* Left: Icon, Name, Help */}
                <div className="flex items-center gap-3">
                  <div className={`p-2.5 rounded-xl border ${cfg.color}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white flex items-center gap-2">
                      {cfg.label}
                    </h4>
                    <span className="text-[11px] text-slate-500">{cfg.help}</span>
                  </div>
                </div>

                {/* Right: Target Input + Unit & Toggle Switch */}
                <div className="flex items-center gap-3">
                  {isEnabled ? (
                    <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-700/80 rounded-xl px-2.5 py-1.5">
                      <input
                        type="number"
                        min={cfg.min}
                        max={cfg.max}
                        value={item.target}
                        onChange={(e) => handleTargetChange(cfg.id, e.target.value, cfg.min, cfg.max)}
                        className="w-14 bg-transparent text-center font-extrabold text-sm text-cyan-300 focus:outline-none"
                      />
                      <span className="text-xs text-slate-400 font-semibold">{cfg.unit}</span>
                    </div>
                  ) : (
                    <span className="text-xs text-slate-500 font-semibold px-2">Tắt</span>
                  )}

                  {/* Toggle Switch */}
                  <button
                    type="button"
                    onClick={() => handleToggle(cfg.id)}
                    className={`w-12 h-6 rounded-full transition-colors relative focus:outline-none p-0.5 ${
                      isEnabled ? 'bg-cyan-500' : 'bg-slate-800'
                    }`}
                  >
                    <div 
                      className={`w-5 h-5 rounded-full bg-white shadow-md transform transition-transform ${
                        isEnabled ? 'translate-x-6' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* FOOTER */}
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
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 text-xs font-black shadow-lg shadow-amber-500/20 transition-all hover:scale-105 active:scale-95 disabled:opacity-50 flex items-center gap-1.5"
          >
            <Check className="w-4 h-4" />
            <span>{isSubmitting ? 'Đang lưu...' : 'Lưu'}</span>
          </button>
        </div>

      </div>
    </div>
  );
}
