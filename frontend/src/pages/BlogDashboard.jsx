import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import axios from 'axios';
import { 
  Sparkles, 
  Search, 
  Calendar, 
  Clock, 
  User, 
  ArrowRight, 
  BookOpen, 
  Loader2, 
  Filter, 
  ChevronRight,
  Lightbulb,
  Target,
  Map,
  FileText
} from 'lucide-react';
import Navbar from '../components/Navbar';

export const BLOG_CATEGORIES = [
  { id: 'all', label: 'Tất cả', icon: null },
  { id: 'tips', label: 'Mẹo làm bài', icon: '💡', gradient: 'from-amber-400 to-orange-500' },
  { id: 'strategy', label: 'Chiến lược', icon: '🎯', gradient: 'from-blue-500 to-cyan-400' },
  { id: 'roadmap', label: 'Lộ trình', icon: '🗺️', gradient: 'from-emerald-400 to-teal-500' },
  { id: 'experience', label: 'Kinh nghiệm', icon: '✨', gradient: 'from-purple-500 to-pink-400' },
  { id: 'resources', label: 'Tài liệu', icon: '📚', gradient: 'from-rose-400 to-red-500' },
];

export function getCategoryAccent(cat) {
  switch (cat) {
    case 'tips': return 'from-amber-400 to-orange-500';
    case 'strategy': return 'from-blue-500 to-cyan-400';
    case 'roadmap': return 'from-emerald-400 to-teal-500';
    case 'experience': return 'from-purple-500 to-pink-400';
    case 'resources': return 'from-rose-400 to-red-500';
    default: return 'from-cyan-400 to-teal-500';
  }
}

export function getCategoryBadge(cat) {
  const found = BLOG_CATEGORIES.find(c => c.id === cat);
  if (!found || !found.icon) return { label: 'TOEIC', icon: '📝' };
  return { label: found.label, icon: found.icon };
}

export default function BlogDashboard() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const currentCat = searchParams.get('category') || 'all';

  const [articles, setArticles] = useState([]);
  const [categoryStats, setCategoryStats] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      try {
        const [postsRes, statsRes] = await Promise.all([
          axios.get('/api/v1/blog', {
            params: {
              category: currentCat !== 'all' ? currentCat : undefined,
              search: searchQuery.trim() || undefined
            }
          }),
          axios.get('/api/v1/blog/categories/stats')
        ]);

        if (postsRes.data?.data) {
          setArticles(postsRes.data.data);
        }
        if (statsRes.data?.data) {
          setCategoryStats(statsRes.data.data);
        }
      } catch (err) {
        console.error('Error fetching blog data:', err);
      } finally {
        setIsLoading(false);
      }
    }

    const timer = setTimeout(() => {
      loadData();
    }, 200);

    return () => clearTimeout(timer);
  }, [currentCat, searchQuery]);

  const handleSelectCategory = (catId) => {
    if (catId === 'all') {
      searchParams.delete('category');
      setSearchParams(searchParams);
    } else {
      setSearchParams({ category: catId });
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    } catch {
      return '';
    }
  };

  return (
    <div className="min-h-screen bg-[#070b14] text-slate-100 flex flex-col font-sans">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 pb-28">
        
        {/* HERO HEADER SECTION (Matching Đậu TOEIC design) */}
        <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-12 space-y-4">
          
          {/* Top Pill Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs sm:text-sm font-semibold shadow-inner animate-fadeIn">
            <Lightbulb className="w-4 h-4 text-cyan-400" />
            <span>Chia sẻ kinh nghiệm & chiến lược</span>
          </div>

          {/* Title */}
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-heading font-black tracking-tight text-white">
            Blog <span className="bg-gradient-to-r from-cyan-400 via-teal-300 to-sky-400 bg-clip-text text-transparent">TƯỜNG TẬN TOEIC</span>
          </h1>

          {/* Subtitle */}
          <p className="text-sm sm:text-base text-slate-400 leading-relaxed">
            Tổng hợp mẹo làm bài, chiến lược thi, lộ trình học và kinh nghiệm chinh phục điểm cao từ chuyên gia và học viên đạt 900+ TOEIC.
          </p>

          {/* Search Bar */}
          <div className="pt-2 max-w-xl mx-auto">
            <div className="relative flex items-center">
              <Search className="w-5 h-5 absolute left-4 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Tìm kiếm bài viết (ví dụ: phát âm, lộ trình, từ vựng, Part 5...)"
                className="w-full pl-12 pr-4 py-3 rounded-2xl bg-slate-900/90 border border-slate-800 focus:border-cyan-500/80 focus:ring-2 focus:ring-cyan-500/20 text-xs sm:text-sm text-slate-100 placeholder-slate-500 transition-all outline-none shadow-lg"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-4 text-xs text-slate-400 hover:text-white"
                >
                  Xoá
                </button>
              )}
            </div>
          </div>
        </div>

        {/* CATEGORY TABS (Matching screenshot pills) */}
        <div className="flex items-center justify-center gap-1.5 sm:gap-2 overflow-x-auto pb-4 mb-8 scrollbar-none">
          {BLOG_CATEGORIES.map((cat) => {
            const isActive = currentCat === cat.id;
            const count = categoryStats[cat.id];

            return (
              <button
                key={cat.id}
                onClick={() => handleSelectCategory(cat.id)}
                className={`flex items-center gap-1.5 px-3.5 sm:px-4 py-2 rounded-full text-xs sm:text-sm font-bold whitespace-nowrap transition-all duration-200 cursor-pointer ${
                  isActive
                    ? 'bg-gradient-to-r from-cyan-500 to-teal-500 text-slate-950 font-black shadow-lg shadow-cyan-500/25 scale-105'
                    : 'bg-slate-900/90 border border-slate-800 text-slate-300 hover:text-white hover:border-slate-700'
                }`}
              >
                {cat.icon && <span>{cat.icon}</span>}
                <span>{cat.label}</span>
                {count !== undefined && (
                  <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full ${
                    isActive ? 'bg-slate-950/20 text-slate-950 font-black' : 'bg-slate-800 text-slate-400'
                  }`}>
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* ARTICLES GRID */}
        {isLoading ? (
          <div className="py-24 flex flex-col items-center justify-center gap-3 text-slate-400">
            <Loader2 className="w-8 h-8 animate-spin text-cyan-400" />
            <span className="text-sm font-medium">Đang tải danh sách bài viết...</span>
          </div>
        ) : articles.length === 0 ? (
          <div className="py-20 text-center space-y-3 bg-slate-900/40 rounded-3xl border border-slate-800/80 p-8 max-w-lg mx-auto">
            <BookOpen className="w-12 h-12 mx-auto text-slate-600 opacity-60" />
            <h3 className="font-heading font-bold text-base text-slate-200">Không tìm thấy bài viết nào</h3>
            <p className="text-xs text-slate-400">
              Hãy thử tìm kiếm với từ khóa khác hoặc chọn danh mục "Tất cả" để xem toàn bộ bài viết.
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                handleSelectCategory('all');
              }}
              className="mt-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-400 text-xs font-bold transition-colors"
            >
              Xem tất cả bài viết
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-7">
            {articles.map((article) => {
              const badge = getCategoryBadge(article.category);
              const accent = getCategoryAccent(article.category);

              return (
                <div
                  key={article._id || article.slug}
                  onClick={() => navigate(`/blog/${article.slug}`)}
                  className="group relative flex flex-col rounded-3xl bg-[#0d1527] border border-slate-800/90 hover:border-cyan-500/50 hover:shadow-2xl hover:shadow-cyan-500/10 hover:-translate-y-1.5 transition-all duration-300 overflow-hidden cursor-pointer"
                >
                  {/* TOP GRADIENT ACCENT BAR (Matching Đậu TOEIC) */}
                  <div className={`h-2 w-full bg-gradient-to-r ${accent}`} />

                  <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                    
                    <div className="space-y-3">
                      {/* CATEGORY BADGE & READ TIME */}
                      <div className="flex items-center justify-between gap-2">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-slate-800/90 border border-slate-700/60 text-slate-200">
                          <span>{badge.icon}</span>
                          <span>{badge.label}</span>
                        </span>

                        <span className="text-[11px] text-slate-400 flex items-center gap-1 font-mono">
                          <Clock className="w-3 h-3 text-slate-500" />
                          <span>{article.read_time || '5 phút đọc'}</span>
                        </span>
                      </div>

                      {/* TITLE */}
                      <h3 className="font-heading font-extrabold text-base sm:text-lg text-white leading-snug group-hover:text-cyan-400 transition-colors line-clamp-2">
                        {article.title}
                      </h3>

                      {/* EXCERPT */}
                      <p className="text-xs sm:text-sm text-slate-400 line-clamp-3 leading-relaxed">
                        {article.excerpt || article.title}
                      </p>
                    </div>

                    {/* FOOTER: AUTHOR & DATE */}
                    <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
                      <div className="flex items-center gap-1.5 font-semibold text-slate-300">
                        <div className="w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-400 flex items-center justify-center font-bold text-[10px]">
                          TT
                        </div>
                        <span className="text-[11px] tracking-wide uppercase">{article.author || 'TƯỜNG TẬN TOEIC'}</span>
                      </div>

                      <div className="flex items-center gap-1 font-mono text-[11px] text-slate-400">
                        <Calendar className="w-3.5 h-3.5 text-slate-500" />
                        <span>{formatDate(article.created_at)}</span>
                      </div>
                    </div>

                  </div>
                </div>
              );
            })}
          </div>
        )}

      </main>
    </div>
  );
}
