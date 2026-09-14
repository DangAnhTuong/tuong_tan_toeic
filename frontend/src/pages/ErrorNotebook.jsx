import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../components/Navbar';
import usePageTitle from '../hooks/usePageTitle';
import { 
  BookMarked, 
  Sparkles, 
  CheckCircle2, 
  XCircle, 
  RotateCcw, 
  ArrowRight, 
  Filter,
  Check,
  AlertTriangle,
  Flame,
  Award,
  Layers,
  ChevronRight,
  Volume2,
  Play,
  Pause,
  Trash2,
  HelpCircle,
  Lightbulb,
  Zap,
  RefreshCw
} from 'lucide-react';

export default function ErrorNotebook() {
  usePageTitle('Sổ Tay Câu Sai & Ôn Tập Lỗ Hổng');
  const navigate = useNavigate();

  const [mistakes, setMistakes] = useState([]);
  const [stats, setStats] = useState({ totalMistakes: 0, masteredCount: 0, pendingCount: 0, accuracyRate: 100 });
  const [activePart, setActivePart] = useState('all');
  const [filterMastered, setFilterMastered] = useState('pending'); // 'pending' | 'mastered' | 'all'
  const [loading, setLoading] = useState(true);

  // Retest state per card: { [mistakeId]: { active: bool, selectedOpt: number | null, isAnswered: bool, isCorrect: bool } }
  const [retestStates, setRetestStates] = useState({});

  // Audio playing state: { [mistakeId]: boolean }
  const [playingAudioId, setPlayingAudioId] = useState(null);
  const audioRefs = useRef({});

  // Fallback defaults if user has 0 mistakes
  const defaultMistakes = [
    {
      _id: 'm1',
      questionId: 'q129',
      part: 5,
      section: 'READING',
      passageText: "129. Annika Dulin ------ the marketing department at Tollason Industries' planning meeting tomorrow.",
      options: [
        { label: '(A)', text: 'will represent' },
        { label: '(B)', text: 'had represented' },
        { label: '(C)', text: 'to represent' },
        { label: '(D)', text: 'be representing' }
      ],
      correctAnswer: 0,
      userAnswer: 1,
      explanation: 'Dấu hiệu "tomorrow" chỉ hành động tương lai -> Chia thì Tương lai đơn (will + V-inf). Bạn đã chọn nhầm quá khứ hoàn thành.',
      translation: 'Annika Dulin sẽ đại diện phòng marketing trong cuộc họp ngày mai.',
      categoryTag: 'Thì động từ',
      reviewCount: 2,
      isMastered: false
    },
    {
      _id: 'm2',
      questionId: 'q130',
      part: 5,
      section: 'READING',
      passageText: "130. Please submit your quarterly expense reports ------ next Friday at noon.",
      options: [
        { label: '(A)', text: 'by' },
        { label: '(B)', text: 'until' },
        { label: '(C)', text: 'for' },
        { label: '(D)', text: 'in' }
      ],
      correctAnswer: 0,
      userAnswer: 1,
      explanation: 'Giới từ chỉ thời hạn chót: "by + mốc thời gian" (trước lúc). "Until" chỉ hành động kéo dài liên tục đến mốc.',
      translation: 'Vui lòng nộp báo cáo chi phí trước trưa thứ Sáu tuần tới.',
      categoryTag: 'Giới từ',
      reviewCount: 1,
      isMastered: false
    },
    {
      _id: 'm3',
      questionId: 'q2',
      part: 2,
      section: 'LISTENING',
      passageText: "Part 2: Where did you leave the conference room key?",
      options: [
        { label: '(A)', text: 'At 3:00 PM.' },
        { label: '(B)', text: 'On the receptionist desk.' },
        { label: '(C)', text: 'Yes, I enjoyed it.' }
      ],
      correctAnswer: 1,
      userAnswer: 0,
      explanation: 'Câu hỏi bắt đầu bằng "Where" hỏi về địa điểm -> Đáp án (B) On the desk là câu trả lời chính xác.',
      translation: 'Bạn để chìa khóa phòng họp ở đâu? - Ở trên bàn tiếp tân.',
      categoryTag: 'Bẫy nghe WH- question',
      reviewCount: 1,
      isMastered: true
    }
  ];

  const fetchMistakes = async () => {
    try {
      setLoading(true);
      const [listRes, statsRes] = await Promise.allSettled([
        axios.get('/api/v1/mistakes'),
        axios.get('/api/v1/mistakes/stats')
      ]);

      if (listRes.status === 'fulfilled' && listRes.value.data?.data && listRes.value.data.data.length > 0) {
        setMistakes(listRes.value.data.data);
      } else {
        setMistakes(defaultMistakes);
      }

      if (statsRes.status === 'fulfilled' && statsRes.value.data?.data) {
        setStats(statsRes.value.data.data);
      } else {
        setStats({ totalMistakes: 3, masteredCount: 1, pendingCount: 2, accuracyRate: 33 });
      }
    } catch (e) {
      setMistakes(defaultMistakes);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMistakes();
  }, []);

  // Toggle mastered status (Đã thuộc ⇄ Cần ôn)
  const handleToggleMastered = async (id, currentStatus) => {
    const nextStatus = !currentStatus;
    try {
      await axios.put(`/api/v1/mistakes/${id}/master`, { isMastered: nextStatus });
      setMistakes(prev => prev.map(m => m._id === id ? { ...m, isMastered: nextStatus } : m));
      setStats(prev => ({
        ...prev,
        masteredCount: nextStatus ? prev.masteredCount + 1 : Math.max(0, prev.masteredCount - 1),
        pendingCount: nextStatus ? Math.max(0, prev.pendingCount - 1) : prev.pendingCount + 1
      }));
    } catch (e) {
      setMistakes(prev => prev.map(m => m._id === id ? { ...m, isMastered: nextStatus } : m));
    }
  };

  // Delete mistake from notebook
  const handleDeleteMistake = async (id) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa câu hỏi này khỏi Sổ tay câu sai?')) return;
    try {
      await axios.delete(`/api/v1/mistakes/${id}`);
      setMistakes(prev => prev.filter(m => m._id !== id));
      setStats(prev => ({
        ...prev,
        totalMistakes: Math.max(0, prev.totalMistakes - 1),
        pendingCount: Math.max(0, prev.pendingCount - 1)
      }));
    } catch (e) {
      setMistakes(prev => prev.filter(m => m._id !== id));
    }
  };

  // Retest Actions
  const startRetest = (mId) => {
    setRetestStates(prev => ({
      ...prev,
      [mId]: { active: true, selectedOpt: null, isAnswered: false, isCorrect: false }
    }));
  };

  const handleSelectRetestOption = (m, optIdx) => {
    const isCorrect = optIdx === m.correctAnswer;
    setRetestStates(prev => ({
      ...prev,
      [m._id]: { active: true, selectedOpt: optIdx, isAnswered: true, isCorrect }
    }));
  };

  const cancelRetest = (mId) => {
    setRetestStates(prev => {
      const copy = { ...prev };
      delete copy[mId];
      return copy;
    });
  };

  // Play/Pause Audio
  const toggleAudio = (mId, audioUrl) => {
    if (!audioUrl) return;
    if (playingAudioId === mId) {
      if (audioRefs.current[mId]) {
        audioRefs.current[mId].pause();
      }
      setPlayingAudioId(null);
    } else {
      if (playingAudioId && audioRefs.current[playingAudioId]) {
        audioRefs.current[playingAudioId].pause();
      }
      if (!audioRefs.current[mId]) {
        audioRefs.current[mId] = new Audio(audioUrl);
        audioRefs.current[mId].onended = () => setPlayingAudioId(null);
      }
      audioRefs.current[mId].play();
      setPlayingAudioId(mId);
    }
  };

  const filteredList = mistakes.filter(m => {
    if (activePart !== 'all' && m.part !== Number(activePart)) return false;
    if (filterMastered === 'pending' && m.isMastered) return false;
    if (filterMastered === 'mastered' && !m.isMastered) return false;
    return true;
  });

  return (
    <div className="min-h-screen dark:bg-[#0b1120] bg-[#f8fafc] dark:text-slate-100 text-slate-900 flex flex-col font-sans pb-16 transition-colors duration-200">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* HERO BANNER SỔ TAY CÂU SAI */}
        <div className="relative overflow-hidden rounded-3xl glass-panel border dark:border-slate-800 border-slate-200 p-8 md:p-10 dark:bg-gradient-to-r dark:from-rose-950/40 dark:via-slate-900 dark:to-[#0b1120] bg-gradient-to-r from-rose-50 via-white to-pink-50/60 shadow-xl dark:shadow-2xl">
          <div className="absolute top-0 right-0 -mt-12 -mr-12 w-96 h-96 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-1/3 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
          
          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-3 text-center md:text-left">
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full dark:bg-rose-500/10 bg-rose-100 border dark:border-rose-500/30 border-rose-300 text-rose-700 dark:text-rose-400 text-xs font-extrabold uppercase tracking-wider">
                <BookMarked className="w-3.5 h-3.5" />
                <span>HỆ THỐNG HỌC TẬP KHÉP KÍN • CLOSED-LOOP LEARNING</span>
              </div>
              <h1 className="text-3xl md:text-4xl font-extrabold font-heading dark:text-white text-slate-900 tracking-tight">
                Sổ Tay Câu Sai & Lỗ Hổng Kiến Thức 📖
              </h1>
              <p className="dark:text-slate-400 text-slate-600 text-sm max-w-xl leading-relaxed">
                Tự động thu thập 100% các câu hỏi bạn từng làm sai từ <strong>Đề Thi Thử</strong>, <strong>Luyện Đọc</strong>, <strong>Luyện Nghe</strong> và <strong>Đấu Trường 1v1</strong>. Hãy thử sức lại cho đến khi làm chủ hoàn toàn!
              </p>

              <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 pt-2">
                <button
                  onClick={() => {
                    setFilterMastered('pending');
                    const firstPending = filteredList.find(m => !m.isMastered);
                    if (firstPending) startRetest(firstPending._id);
                  }}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-rose-500 to-orange-500 hover:from-rose-400 hover:to-orange-400 text-white font-bold text-xs shadow-md shadow-rose-500/20 active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <Zap className="w-4 h-4 fill-white" />
                  <span>Ôn Tập Nhanh Câu Chưa Thuộc</span>
                </button>

                <button
                  onClick={() => navigate('/battle')}
                  className="px-4 py-2 rounded-xl dark:bg-slate-900 bg-white border dark:border-slate-800 border-slate-200 dark:text-slate-200 text-slate-700 hover:border-rose-500 font-bold text-xs transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <span>Đấu Trường 1v1 ⚔️</span>
                </button>
              </div>
            </div>

            {/* Quick Stats Badges */}
            <div className="flex items-center gap-3 shrink-0">
              <div className="p-4 rounded-2xl dark:bg-slate-900/90 bg-white border dark:border-slate-800 border-slate-200 shadow-sm text-center min-w-[105px]">
                <span className="text-[10px] font-bold dark:text-slate-400 text-slate-500 uppercase">Cần Ôn Lại</span>
                <p className="text-2xl sm:text-3xl font-black font-heading text-rose-600 dark:text-rose-400">
                  {stats.pendingCount || 0}
                </p>
                <span className="text-[10px] text-slate-400 font-mono">câu hỏi</span>
              </div>

              <div className="p-4 rounded-2xl dark:bg-slate-900/90 bg-white border dark:border-slate-800 border-slate-200 shadow-sm text-center min-w-[105px]">
                <span className="text-[10px] font-bold dark:text-slate-400 text-slate-500 uppercase">Đã Khắc Phục</span>
                <p className="text-2xl sm:text-3xl font-black font-heading text-emerald-600 dark:text-emerald-400">
                  {stats.masteredCount || 0}
                </p>
                <span className="text-[10px] text-slate-400 font-mono">câu hỏi</span>
              </div>
            </div>
          </div>
        </div>

        {/* FILTER BAR */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b dark:border-slate-800 border-slate-200 pb-4">
          
          {/* Part Filters */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full">
            {['all', '1', '2', '3', '4', '5', '6', '7'].map((p) => (
              <button
                key={p}
                onClick={() => setActivePart(p)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                  activePart === p
                    ? 'bg-rose-500 text-white shadow-md shadow-rose-500/20 font-extrabold'
                    : 'dark:bg-slate-900 bg-white border dark:border-slate-800 border-slate-200 dark:text-slate-400 text-slate-600 hover:text-slate-900 dark:hover:text-white shadow-sm'
                }`}
              >
                {p === 'all' ? 'Tất cả Part (1-7)' : `Part ${p}`}
              </button>
            ))}
          </div>

          {/* Mastered Status Toggle */}
          <div className="flex items-center gap-1.5 p-1 rounded-xl dark:bg-slate-900 bg-slate-100 border dark:border-slate-800 border-slate-200 text-xs font-bold shrink-0">
            <button
              onClick={() => setFilterMastered('pending')}
              className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                filterMastered === 'pending' ? 'bg-rose-500 text-white' : 'dark:text-slate-400 text-slate-600 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Cần ôn ({stats.pendingCount || 0})
            </button>
            <button
              onClick={() => setFilterMastered('mastered')}
              className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                filterMastered === 'mastered' ? 'bg-emerald-500 text-slate-950 font-extrabold' : 'dark:text-slate-400 text-slate-600 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Đã thuộc ({stats.masteredCount || 0})
            </button>
            <button
              onClick={() => setFilterMastered('all')}
              className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                filterMastered === 'all' ? 'dark:bg-slate-800 bg-white dark:text-white text-slate-900 shadow-sm' : 'dark:text-slate-400 text-slate-600 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Tất cả
            </button>
          </div>

        </div>

        {/* MISTAKES LIST */}
        <div className="space-y-4">
          {filteredList.length === 0 ? (
            <div className="text-center py-16 dark:bg-slate-900/60 bg-white rounded-3xl border dark:border-slate-800 border-slate-200 p-8 space-y-4 shadow-sm">
              <span className="text-5xl inline-block">🎉</span>
              <div className="space-y-1">
                <h3 className="font-heading font-extrabold text-lg dark:text-white text-slate-900">
                  Không có câu sai nào trong danh mục này!
                </h3>
                <p className="text-xs dark:text-slate-400 text-slate-600 max-w-md mx-auto">
                  Bạn đã giải quyết sạch lỗ hổng kiến thức hoặc chưa gặp câu sai nào trong danh mục này. Hãy tiếp tục luyện tập và thi thử nhé!
                </p>
              </div>
              <div className="flex items-center justify-center gap-3 pt-2">
                <button
                  onClick={() => navigate('/tests')}
                  className="px-4 py-2 rounded-xl bg-rose-500 hover:bg-rose-600 text-white font-bold text-xs shadow-md shadow-rose-500/20 transition-all cursor-pointer"
                >
                  Làm Đề Thi Thử ETS →
                </button>
                <button
                  onClick={() => navigate('/battle')}
                  className="px-4 py-2 rounded-xl dark:bg-slate-800 bg-slate-100 hover:bg-slate-200 dark:hover:bg-slate-700 dark:text-white text-slate-700 font-bold text-xs transition-all cursor-pointer"
                >
                  Đấu Trường 1v1 ⚔️
                </button>
              </div>
            </div>
          ) : (
            filteredList.map((m) => {
              const isRetesting = retestStates[m._id]?.active;
              const retest = retestStates[m._id] || {};

              return (
                <div
                  key={m._id}
                  className={`dark:bg-slate-900/90 bg-white rounded-3xl border transition-all p-6 space-y-4 shadow-sm ${
                    isRetesting 
                      ? 'ring-2 ring-rose-500/50 dark:border-rose-500/40 border-rose-300' 
                      : (m.isMastered ? 'dark:border-emerald-500/30 border-emerald-200' : 'dark:border-slate-800 border-slate-200 hover:border-rose-500/30')
                  }`}
                >
                  {/* TOP HEADER: PART, BADGES & ACTION BUTTONS */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b dark:border-slate-800 border-slate-200 pb-3">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-rose-500/15 text-rose-600 dark:text-rose-300 border border-rose-500/30 uppercase">
                        Part {m.part} • {m.categoryTag || 'TOEIC'}
                      </span>

                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono dark:bg-slate-800 bg-slate-100 dark:text-slate-400 text-slate-500">
                        {m.section === 'LISTENING' ? '🎧 Listening' : '📖 Reading'}
                      </span>

                      <span className="text-xs dark:text-slate-400 text-slate-500">
                        Đã làm sai {m.reviewCount || 1} lần
                      </span>

                      {/* Optional Audio Button for Listening Mistakes */}
                      {m.audioUrl && (
                        <button
                          onClick={() => toggleAudio(m._id, m.audioUrl)}
                          className="px-2.5 py-1 rounded-lg text-xs font-bold dark:bg-cyan-500/20 bg-sky-100 dark:text-cyan-300 text-sky-700 border dark:border-cyan-500/30 border-sky-300 flex items-center gap-1 transition-all hover:scale-105 active:scale-95 cursor-pointer"
                        >
                          {playingAudioId === m._id ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 fill-current" />}
                          <span>{playingAudioId === m._id ? 'Tạm dừng' : 'Nghe Audio'}</span>
                        </button>
                      )}
                    </div>

                    {/* ACTIONS: RETEST, TOGGLE MASTERED & DELETE */}
                    <div className="flex items-center gap-2 shrink-0">
                      {!isRetesting ? (
                        <button
                          onClick={() => startRetest(m._id)}
                          className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-rose-500 to-orange-500 hover:from-rose-400 hover:to-orange-400 text-white text-xs font-bold shadow-sm shadow-rose-500/20 transition-all flex items-center gap-1.5 cursor-pointer active:scale-95"
                          title="Làm lại câu này để tự kiểm tra kiến thức"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                          <span>Thử sức lại</span>
                        </button>
                      ) : (
                        <button
                          onClick={() => cancelRetest(m._id)}
                          className="px-3 py-1.5 rounded-xl dark:bg-slate-800 bg-slate-100 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-bold dark:text-slate-300 text-slate-700 transition-colors cursor-pointer"
                        >
                          ✕ Thoát thử sức
                        </button>
                      )}

                      {/* Mastered / Pending Toggle */}
                      {m.isMastered ? (
                        <button
                          onClick={() => handleToggleMastered(m._id, true)}
                          className="px-3 py-1.5 rounded-xl bg-emerald-500/15 hover:bg-rose-500/15 text-emerald-700 dark:text-emerald-300 hover:text-rose-600 dark:hover:text-rose-300 border border-emerald-500/30 hover:border-rose-500/30 text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer"
                          title="Bấm để đưa về danh sách Cần ôn"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                          <span>Đã thuộc (Đưa về cần ôn)</span>
                        </button>
                      ) : (
                        <button
                          onClick={() => handleToggleMastered(m._id, false)}
                          className="px-3 py-1.5 rounded-xl dark:bg-slate-800 bg-slate-100 hover:bg-emerald-500 hover:text-white text-xs font-bold dark:text-slate-300 text-slate-700 border dark:border-slate-700 border-slate-300 transition-colors flex items-center gap-1.5 cursor-pointer"
                          title="Đánh dấu câu này đã khắc phục hoàn toàn"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>Đã thuộc</span>
                        </button>
                      )}

                      {/* Delete Button */}
                      <button
                        onClick={() => handleDeleteMistake(m._id)}
                        className="p-1.5 rounded-xl text-slate-400 hover:text-rose-500 dark:hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
                        title="Xóa câu sai khỏi sổ tay"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* QUESTION PASSAGE / PROMPT */}
                  <div className="space-y-2">
                    <p className="text-sm sm:text-base font-semibold dark:text-slate-100 text-slate-900 select-text leading-relaxed">
                      {m.prompt || m.passageText}
                    </p>
                  </div>

                  {/* ========================================================================= */}
                  {/* A. INTERACTIVE RETEST MODE */}
                  {/* ========================================================================= */}
                  {isRetesting ? (
                    <div className="space-y-4 pt-2">
                      <div className="p-3 rounded-2xl dark:bg-rose-500/10 bg-rose-50 border dark:border-rose-500/25 border-rose-200 text-xs font-bold text-rose-700 dark:text-rose-300 flex items-center gap-2">
                        <RotateCcw className="w-4 h-4 text-rose-500 animate-spin" />
                        <span>CHẾ ĐỘ THỬ SỨC: Chọn đáp án chính xác mà không xem gợi ý!</span>
                      </div>

                      {/* 4 Interactive Option Buttons */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {m.options.map((opt, idx) => {
                          const letter = ['A', 'B', 'C', 'D'][idx];
                          const isSelected = retest.selectedOpt === idx;
                          const isCorrectOpt = idx === m.correctAnswer;

                          let btnStyle = 'dark:bg-slate-950 bg-white dark:border-slate-800 border-slate-200 hover:border-rose-500 text-slate-800 dark:text-slate-200';
                          if (retest.isAnswered) {
                            if (isCorrectOpt) {
                              btnStyle = 'bg-emerald-500/20 border-emerald-500 text-emerald-700 dark:text-emerald-300 font-bold';
                            } else if (isSelected) {
                              btnStyle = 'bg-rose-500/20 border-rose-500 text-rose-700 dark:text-rose-300 font-bold';
                            } else {
                              btnStyle = 'dark:bg-slate-950/60 bg-slate-50 opacity-50 dark:border-slate-800 border-slate-200';
                            }
                          }

                          return (
                            <button
                              key={idx}
                              onClick={() => !retest.isAnswered && handleSelectRetestOption(m, idx)}
                              disabled={retest.isAnswered}
                              className={`p-3.5 rounded-2xl border text-left text-xs sm:text-sm font-semibold transition-all flex items-center gap-3 cursor-pointer ${btnStyle}`}
                            >
                              <span className={`w-7 h-7 rounded-xl flex items-center justify-center font-mono font-bold text-xs shrink-0 ${
                                retest.isAnswered && isCorrectOpt 
                                  ? 'bg-emerald-500 text-white' 
                                  : (retest.isAnswered && isSelected 
                                      ? 'bg-rose-500 text-white' 
                                      : 'dark:bg-slate-800 bg-slate-100 dark:text-slate-300 text-slate-700')
                              }`}>
                                {letter}
                              </span>
                              <span className="flex-1">{opt.text || opt.label}</span>
                            </button>
                          );
                        })}
                      </div>

                      {/* Retest Result Feedback */}
                      {retest.isAnswered && (
                        <div className={`p-4 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-bold animate-fadeIn ${
                          retest.isCorrect 
                            ? 'bg-emerald-500/20 border border-emerald-500/40 text-emerald-700 dark:text-emerald-300' 
                            : 'bg-rose-500/20 border border-rose-500/40 text-rose-700 dark:text-rose-300'
                        }`}>
                          <div className="flex items-center gap-2">
                            {retest.isCorrect ? <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" /> : <XCircle className="w-5 h-5 text-rose-500 shrink-0" />}
                            <span>
                              {retest.isCorrect 
                                ? '🎉 CHÍNH XÁC TUYỆT ĐỐI! Bạn đã làm chủ hoàn toàn câu hỏi này.' 
                                : 'CHƯA CHÍNH XÁC! Hãy đọc kỹ giải thích bẫy bên dưới.'}
                            </span>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            {retest.isCorrect ? (
                              <button
                                onClick={() => {
                                  handleToggleMastered(m._id, false);
                                  cancelRetest(m._id);
                                }}
                                className="px-3.5 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs shadow-sm transition-all cursor-pointer"
                              >
                                ✓ Đánh dấu đã thuộc ngay
                              </button>
                            ) : (
                              <button
                                onClick={() => startRetest(m._id)}
                                className="px-3.5 py-1.5 rounded-xl bg-rose-500 hover:bg-rose-600 text-white font-bold text-xs shadow-sm transition-all cursor-pointer"
                              >
                                🔄 Thử lại lần nữa
                              </button>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Show Explanation upon answer */}
                      {retest.isAnswered && (
                        <div className="p-4 rounded-2xl dark:bg-slate-950 bg-amber-50/50 border dark:border-slate-800 border-amber-200/60 space-y-2 text-xs animate-fadeIn">
                          {m.translation && (
                            <p className="dark:text-slate-300 text-slate-700">
                              <strong>🇻🇳 Dịch nghĩa:</strong> {m.translation}
                            </p>
                          )}
                          <p className="dark:text-amber-300 text-amber-900 leading-relaxed">
                            <strong>💡 Lời giải & Phân tích bẫy ETS:</strong> {m.explanation}
                          </p>
                        </div>
                      )}

                    </div>
                  ) : (
                    /* ========================================================================= */
                    /* B. NORMAL REVIEW MODE */
                    /* ========================================================================= */
                    <div className="space-y-4">
                      
                      {/* Options Grid */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        {m.options.map((opt, idx) => {
                          const isCorrect = idx === m.correctAnswer;
                          const isUserWrong = idx === m.userAnswer && !isCorrect;

                          return (
                            <div
                              key={idx}
                              className={`p-3 rounded-2xl border text-xs font-medium flex items-center justify-between transition-all ${
                                isCorrect
                                  ? 'bg-emerald-500/15 border-emerald-500 text-emerald-700 dark:text-emerald-300 font-bold shadow-sm'
                                  : isUserWrong
                                  ? 'bg-rose-500/15 border-rose-500 text-rose-700 dark:text-rose-300 line-through'
                                  : 'dark:bg-slate-950/80 bg-slate-50 border dark:border-slate-800 border-slate-200 dark:text-slate-400 text-slate-700'
                              }`}
                            >
                              <span className="flex items-center gap-2">
                                <span className="font-mono font-bold text-[11px] opacity-75">{opt.label}</span>
                                <span>{opt.text}</span>
                              </span>
                              {isCorrect && (
                                <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold shrink-0 ml-2">
                                  ✓ Đáp án đúng
                                </span>
                              )}
                              {isUserWrong && (
                                <span className="text-[10px] text-rose-600 dark:text-rose-400 font-bold shrink-0 ml-2">
                                  ✗ Bạn đã chọn
                                </span>
                              )}
                            </div>
                          );
                        })}
                      </div>

                      {/* Explanation Box */}
                      <div className="p-4 rounded-2xl dark:bg-slate-950 bg-amber-50/50 border dark:border-slate-800 border-amber-200/60 space-y-2 text-xs">
                        {m.translation && (
                          <p className="dark:text-slate-300 text-slate-700">
                            <strong>🇻🇳 Dịch nghĩa:</strong> {m.translation}
                          </p>
                        )}
                        <p className="dark:text-amber-300 text-amber-900 leading-relaxed">
                          <strong>💡 Lời giải & Phân tích bẫy ETS:</strong> {m.explanation}
                        </p>
                      </div>

                    </div>
                  )}

                </div>
              );
            })
          )}
        </div>

      </main>
    </div>
  );
}
