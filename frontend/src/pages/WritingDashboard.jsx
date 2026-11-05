import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { 
  PenTool, 
  Sparkles, 
  Search, 
  Mail, 
  FileText, 
  Image as ImageIcon,
  CheckCircle2, 
  ArrowRight, 
  Filter, 
  Tag, 
  Layers,
  Clock,
  Crown,
  ChevronRight,
  BookOpen
} from 'lucide-react';
import axios from 'axios';
import usePageTitle from '../hooks/usePageTitle';
import { useAuth } from '../context/AuthContext';

export default function WritingDashboard() {
  usePageTitle(
    'Luyện Viết TOEIC — Trọn Bộ 3 Part Chuẩn Đậu TOEIC',
    'Rèn luyện TOEIC Writing từ câu đến bài luận. Luyện viết câu theo tranh Part 1, viết email phản hồi Part 2 và bài luận Part 3 với dàn ý mẫu và AI chấm điểm.'
  );

  const { requireAuth, isPro } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const tabParam = searchParams.get('part') || searchParams.get('tab') || '1';
  const [activePart, setActivePart] = useState(Number(tabParam) || 1);

  const [exercises, setExercises] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [visibleCount, setVisibleCount] = useState(24);

  const parts = [
    {
      id: 1,
      title: 'Part 1: Tả tranh',
      short: 'Part 1',
      total: 250,
      icon: ImageIcon,
      description: 'Viết 1 câu mô tả bức ảnh, sử dụng 2 từ khóa cho trước. Luyện đặt từ đúng vị trí và chuẩn ngữ pháp.'
    },
    {
      id: 2,
      title: 'Part 2: Viết email',
      short: 'Part 2',
      total: 200,
      icon: Mail,
      description: 'Đọc email yêu cầu rồi viết email phản hồi trong 10 phút. Luyện văn phong công sở và phrase bank.'
    },
    {
      id: 3,
      title: 'Part 3: Viết bài luận',
      short: 'Part 3',
      total: 100,
      icon: FileText,
      description: 'Viết bài luận 300+ từ trình bày quan điểm trong 30 phút. Luyện lập luận, ví dụ và cấu trúc 4 đoạn.'
    }
  ];

  useEffect(() => {
    let isMounted = true;
    async function fetchExercises() {
      setLoading(true);
      try {
        const res = await axios.get(`/api/v1/writing/exercises?part=${activePart}`);
        if (isMounted && res.data && res.data.data) {
          setExercises(res.data.data);
        }
      } catch (err) {
        console.error('Failed to load writing exercises:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    fetchExercises();
    return () => { isMounted = false; };
  }, [activePart]);

  const handleTabChange = (partId) => {
    setActivePart(partId);
    setSearchParams({ part: partId });
    setSelectedFilter('all');
    setSearchQuery('');
    setVisibleCount(24);
  };

  // Distinct filters based on active part
  const filterOptions = useMemo(() => {
    if (activePart === 1) {
      const patterns = [...new Set(exercises.map(e => e.pattern).filter(Boolean))];
      return ['all', ...patterns];
    } else {
      const topics = [...new Set(exercises.map(e => e.topic).filter(Boolean))];
      return ['all', ...topics];
    }
  }, [exercises, activePart]);

  // Filtered exercises
  const filteredExercises = useMemo(() => {
    return exercises.filter(item => {
      // Filter tag check
      if (selectedFilter !== 'all') {
        if (activePart === 1 && item.pattern !== selectedFilter) return false;
        if (activePart !== 1 && item.topic !== selectedFilter) return false;
      }
      // Search check
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const titleMatch = (item.title || '').toLowerCase().includes(q);
        const viMatch = (item.vietnameseTitle || '').toLowerCase().includes(q);
        const kwMatch = (item.keywords || []).some(k => k.toLowerCase().includes(q));
        const codeMatch = (item.code || '').toLowerCase().includes(q);
        if (!titleMatch && !viMatch && !kwMatch && !codeMatch) return false;
      }
      return true;
    });
  }, [exercises, selectedFilter, searchQuery, activePart]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 selection:bg-cyan-500 selection:text-slate-950">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Hero Header */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-900/90 to-cyan-950/40 border border-slate-800/80 p-8 sm:p-10 shadow-2xl backdrop-blur-xl">
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-3 max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-semibold uppercase tracking-wider">
                <PenTool className="w-3.5 h-3.5" />
                <span>Luyện Viết TOEIC 3 Parts</span>
              </div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold font-heading text-white tracking-tight">
                Rèn luyện <span className="bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">TOEIC Writing</span> từ câu đến bài luận
              </h1>
              <p className="text-slate-400 text-sm sm:text-base leading-relaxed">
                Luyện viết câu theo tranh Part 1, viết email phản hồi Part 2 và bài luận Part 3 với dàn ý mẫu và bộ chấm điểm AI chuẩn quốc tế.
              </p>
            </div>

            <div className="hidden lg:flex items-center justify-center w-28 h-28 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 shadow-inner">
              <PenTool className="w-14 h-14 text-cyan-400 animate-pulse" />
            </div>
          </div>
        </div>

        {/* 3 Main Part Tabs */}
        <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-slate-900/80 border border-slate-800/80 max-w-2xl overflow-x-auto">
          {parts.map(p => {
            const Icon = p.icon;
            const isActive = activePart === p.id;
            return (
              <button
                key={p.id}
                onClick={() => handleTabChange(p.id)}
                className={`flex-1 min-w-[150px] flex items-center justify-center gap-2.5 py-3 px-4 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                  isActive 
                    ? 'bg-cyan-500 text-slate-950 shadow-lg shadow-cyan-500/20' 
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{p.title}</span>
                <span className={`text-xs px-2 py-0.5 rounded-full ${
                  isActive ? 'bg-slate-950/20 text-slate-950' : 'bg-slate-800 text-slate-400'
                }`}>
                  {p.total}
                </span>
              </button>
            );
          })}
        </div>

        {/* Filter and Search Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          {/* Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 sm:pb-0 scrollbar-none">
            {filterOptions.slice(0, 8).map(opt => (
              <button
                key={opt}
                onClick={() => setSelectedFilter(opt)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                  selectedFilter === opt
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                    : 'bg-slate-900/60 text-slate-400 border border-slate-800 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                {opt === 'all' ? `Tất cả (${exercises.length})` : opt}
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div className="relative w-full sm:w-72 shrink-0">
            <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm kiếm bài tập..."
              className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-900/80 border border-slate-800 text-xs sm:text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all"
            />
          </div>
        </div>

        {/* Cards Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-48 rounded-2xl bg-slate-900/50 border border-slate-800/60 animate-pulse" />
            ))}
          </div>
        ) : filteredExercises.length === 0 ? (
          <div className="py-16 text-center text-slate-500 rounded-3xl border border-slate-800/60 bg-slate-900/30 p-8">
            <PenTool className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <p className="text-base font-semibold text-slate-400">Không tìm thấy bài tập nào khớp bộ lọc</p>
            <p className="text-xs text-slate-500 mt-1">Vui lòng thử tìm từ khóa khác hoặc chuyển sang danh mục khác.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredExercises.slice(0, visibleCount).map((item, idx) => (
              <div
                key={item._id || item.dauId || idx}
                className="group relative flex flex-col justify-between rounded-2xl bg-slate-900/60 border border-slate-800/80 p-5 hover:border-cyan-500/50 hover:bg-slate-900 transition-all duration-200 shadow-lg hover:shadow-cyan-500/5"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-mono font-bold text-cyan-400 bg-cyan-500/10 border border-cyan-500/20 px-2.5 py-0.5 rounded-lg">
                      {item.code || `Bài ${idx + 1}`}
                    </span>
                    <span className="text-[11px] font-semibold text-slate-400 bg-slate-800 px-2 py-0.5 rounded-md">
                      {item.pattern || item.topic || 'Tiêu chuẩn'}
                    </span>
                  </div>

                  {activePart === 1 && (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        {(item.keywords || []).map((kw, ki) => (
                          <span key={ki} className="text-xs font-bold text-amber-300 bg-amber-500/10 border border-amber-500/20 px-2.5 py-1 rounded-lg">
                            {kw}
                          </span>
                        ))}
                      </div>
                      {item.vietnameseTitle && (
                        <p className="text-xs text-slate-400 italic">
                          {item.vietnameseTitle}
                        </p>
                      )}
                    </div>
                  )}

                  {activePart === 2 && (
                    <div className="space-y-1.5">
                      <h3 className="text-sm font-bold text-slate-200 group-hover:text-cyan-300 transition-colors line-clamp-1">
                        {item.title}
                      </h3>
                      {item.vietnameseTitle && (
                        <p className="text-xs text-slate-400 line-clamp-1">
                          {item.vietnameseTitle}
                        </p>
                      )}
                      <div className="inline-block text-[11px] text-blue-400 bg-blue-500/10 border border-blue-500/20 px-2 py-0.5 rounded-md">
                        {item.dangYeuCau || 'Phản hồi 3 yêu cầu'}
                      </div>
                    </div>
                  )}

                  {activePart === 3 && (
                    <div className="space-y-1.5">
                      <div className="inline-block text-[11px] text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-md">
                        {item.essayPrompt?.essayType || 'Bài luận nghị luận'}
                      </div>
                      <p className="text-xs text-slate-300 font-medium line-clamp-3 leading-relaxed">
                        {item.essayPrompt?.promptEn || item.title}
                      </p>
                      {item.essayPrompt?.promptVi && (
                        <p className="text-[11px] text-slate-500 italic line-clamp-2">
                          {item.essayPrompt.promptVi}
                        </p>
                      )}
                    </div>
                  )}
                </div>

                <div className="pt-4 border-t border-slate-800/60 mt-4 flex items-center justify-between">
                  <span className="text-[11px] text-slate-500">
                    {activePart === 1 ? '1 câu • 2 từ khóa' : activePart === 2 ? '10 phút • 50-100 từ' : '30 phút • 300+ từ'}
                  </span>
                  <button
                    onClick={() => {
                      if (activePart === 1) navigate(`/write/part1/${item._id || item.dauId}`);
                      else if (activePart === 2) navigate(`/write/part2/${item._id || item.dauId}`);
                      else navigate(`/write/part2/${item._id || item.dauId}?mode=essay`);
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-cyan-500/10 hover:bg-cyan-500 text-cyan-400 hover:text-slate-950 text-xs font-bold transition-all"
                  >
                    <span>Luyện tập</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Load more button */}
        {filteredExercises.length > visibleCount && (
          <div className="flex justify-center pt-4">
            <button
              onClick={() => setVisibleCount(c => c + 24)}
              className="px-6 py-2.5 rounded-full bg-slate-900 border border-slate-700 text-slate-300 hover:text-white hover:border-cyan-500 text-xs font-bold transition-all shadow-md"
            >
              Xem thêm ({filteredExercises.length - visibleCount} bài còn lại)
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
