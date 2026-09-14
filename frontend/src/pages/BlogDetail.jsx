import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { 
  ArrowLeft, 
  Calendar, 
  Clock, 
  Eye, 
  Share2, 
  Check, 
  BookOpen, 
  Headphones, 
  FileText, 
  Sparkles, 
  ChevronRight, 
  Loader2, 
  Award,
  Layers,
  Flame
} from 'lucide-react';
import Navbar from '../components/Navbar';
import BlogMarkdownRenderer from '../components/BlogMarkdownRenderer';
import { getCategoryBadge, getCategoryAccent } from './BlogDashboard';

export default function BlogDetail() {
  const { slug } = useParams();
  const navigate = useNavigate();

  const [article, setArticle] = useState(null);
  const [related, setRelated] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCopied, setIsCopied] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchArticle() {
      setIsLoading(true);
      setError(null);
      try {
        const res = await axios.get(`/api/v1/blog/${slug}`);
        if (res.data?.data) {
          setArticle(res.data.data);
          setRelated(res.data.data.related || []);
        } else {
          setError('Không tìm thấy bài viết này.');
        }
      } catch (err) {
        console.error('Error loading article:', err);
        setError('Không thể tải bài viết. Vui lòng thử lại sau.');
      } finally {
        setIsLoading(false);
      }
    }

    if (slug) {
      fetchArticle();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [slug]);

  const handleShare = async () => {
    const url = window.location.href;
    try {
      if (navigator.share) {
        await navigator.share({
          title: article?.title,
          text: article?.excerpt,
          url
        });
      } else {
        await navigator.clipboard.writeText(url);
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
      }
    } catch (err) {
      try {
        await navigator.clipboard.writeText(url);
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
      } catch (e) {}
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    try {
      return new Date(dateStr).toLocaleDateString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    } catch {
      return '';
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#070b14] text-slate-100 flex flex-col font-sans">
        <Navbar />
        <div className="flex-1 flex flex-col items-center justify-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-cyan-400" />
          <p className="text-sm text-slate-400 font-medium">Đang tải nội dung bài viết...</p>
        </div>
      </div>
    );
  }

  if (error || !article) {
    return (
      <div className="min-h-screen bg-[#070b14] text-slate-100 flex flex-col font-sans">
        <Navbar />
        <div className="flex-1 max-w-xl mx-auto px-4 py-20 text-center space-y-4">
          <div className="w-16 h-16 mx-auto rounded-full bg-rose-500/15 text-rose-400 flex items-center justify-center">
            <BookOpen className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-heading font-black text-white">{error || 'Không tìm thấy bài viết'}</h2>
          <p className="text-xs sm:text-sm text-slate-400">
            Bài viết bạn đang tìm kiếm có thể đã được cập nhật hoặc không tồn tại.
          </p>
          <Link
            to="/blog"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-sm transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Quay lại trang Blog</span>
          </Link>
        </div>
      </div>
    );
  }

  const badge = getCategoryBadge(article.category);
  const accent = getCategoryAccent(article.category);

  return (
    <div className="min-h-screen bg-[#070b14] text-slate-100 flex flex-col font-sans">
      <Navbar />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 pb-28">
        
        {/* BREADCRUMB & BACK BUTTON */}
        <div className="flex items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-2 text-xs text-slate-400 overflow-hidden truncate">
            <Link to="/" className="hover:text-cyan-400 transition-colors">Trang chủ</Link>
            <ChevronRight className="w-3.5 h-3.5 text-slate-600 shrink-0" />
            <Link to="/blog" className="hover:text-cyan-400 transition-colors">Blog</Link>
            <ChevronRight className="w-3.5 h-3.5 text-slate-600 shrink-0" />
            <span className="text-slate-200 truncate max-w-[200px] sm:max-w-xs">{article.title}</span>
          </div>

          <Link
            to="/blog"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-900 border border-slate-800 text-xs font-semibold text-slate-300 hover:text-white hover:border-slate-700 transition-all shrink-0"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Quay lại Blog</span>
          </Link>
        </div>

        {/* ARTICLE HEADER CARD */}
        <header className="relative rounded-3xl bg-[#0d1527] border border-slate-800/90 overflow-hidden shadow-xl mb-8">
          <div className={`h-2.5 w-full bg-gradient-to-r ${accent}`} />

          <div className="p-6 sm:p-8 space-y-4">
            
            {/* Category Pill */}
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-slate-800 border border-slate-700 text-slate-200">
                <span>{badge.icon}</span>
                <span>{badge.label}</span>
              </span>

              {/* Action: Share */}
              <button
                onClick={handleShare}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 text-cyan-400 text-xs font-bold transition-all hover:scale-105 active:scale-95 cursor-pointer"
              >
                {isCopied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-400">Đã copy link!</span>
                  </>
                ) : (
                  <>
                    <Share2 className="w-3.5 h-3.5" />
                    <span>Chia sẻ bài viết</span>
                  </>
                )}
              </button>
            </div>

            {/* Main Title */}
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-heading font-black text-white leading-tight tracking-tight">
              {article.title}
            </h1>

            {/* Metadata row */}
            <div className="pt-2 flex flex-wrap items-center gap-4 sm:gap-6 text-xs text-slate-400 border-t border-slate-800/80">
              <div className="flex items-center gap-2 font-semibold text-slate-200">
                <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-cyan-500 to-teal-400 p-0.5">
                  <div className="w-full h-full bg-slate-950 rounded-full flex items-center justify-center font-bold text-cyan-300 text-[10px]">
                    TT
                  </div>
                </div>
                <span>{article.author || 'TƯỜNG TẬN TOEIC'}</span>
              </div>

              <div className="flex items-center gap-1.5 font-mono">
                <Calendar className="w-3.5 h-3.5 text-slate-500" />
                <span>{formatDate(article.created_at)}</span>
              </div>

              <div className="flex items-center gap-1.5 font-mono">
                <Clock className="w-3.5 h-3.5 text-slate-500" />
                <span>{article.read_time || '5 phút đọc'}</span>
              </div>

              {article.views > 0 && (
                <div className="flex items-center gap-1.5 font-mono ml-auto">
                  <Eye className="w-3.5 h-3.5 text-slate-500" />
                  <span>{article.views} lượt xem</span>
                </div>
              )}
            </div>

          </div>
        </header>

        {/* ARTICLE BODY */}
        <article className="rounded-3xl bg-[#0b1329] border border-slate-800/90 p-6 sm:p-10 shadow-2xl">
          <BlogMarkdownRenderer content={article.content} />
        </article>

        {/* BOTTOM CALL-TO-ACTION CARD */}
        <section className="mt-10 rounded-3xl p-6 sm:p-8 bg-gradient-to-br from-cyan-950/50 via-[#0d1527] to-blue-950/50 border border-cyan-500/30 text-center space-y-4 shadow-xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/20 text-cyan-300 text-xs font-bold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Học Đi Đôi Với Hành</span>
          </div>

          <h3 className="text-xl sm:text-2xl font-heading font-black text-white">
            Áp Dụng Chiến Lược Vào Luyện Tập Ngay Hôm Nay
          </h3>

          <p className="text-xs sm:text-sm text-slate-300 max-w-xl mx-auto leading-relaxed">
            Hơn 11.785 câu đề thi ETS thật, 84 chủ đề từ vựng Spaced Repetition và 10 bộ đề thi thử ETS 2026 đang chờ bạn tại Tường Tận TOEIC!
          </p>

          <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
            <Link
              to="/listen/dictation"
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-teal-500 text-slate-950 font-black text-xs sm:text-sm shadow-lg shadow-cyan-500/20 hover:scale-105 transition-all"
            >
              Luyện Nghe Chép Chính Tả
            </Link>

            <Link
              to="/tests"
              className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs sm:text-sm border border-slate-700 hover:scale-105 transition-all"
            >
              Làm Đề Thi Thử ETS 2026
            </Link>
          </div>
        </section>

        {/* RELATED ARTICLES */}
        {related.length > 0 && (
          <section className="mt-12 space-y-5">
            <h3 className="text-lg sm:text-xl font-heading font-extrabold text-white flex items-center gap-2">
              <Layers className="w-5 h-5 text-cyan-400" />
              <span>Bài viết cùng chủ đề</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {related.map((item) => (
                <div
                  key={item._id || item.slug}
                  onClick={() => navigate(`/blog/${item.slug}`)}
                  className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-cyan-500/40 transition-all cursor-pointer group flex flex-col justify-between space-y-2 hover:-translate-y-1"
                >
                  <h4 className="font-bold text-xs sm:text-sm text-white group-hover:text-cyan-400 transition-colors line-clamp-2">
                    {item.title}
                  </h4>
                  <div className="flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-slate-800/60">
                    <span>{formatDate(item.created_at)}</span>
                    <span className="text-cyan-400 group-hover:underline flex items-center gap-0.5">
                      Đọc tiếp <ChevronRight className="w-3 h-3" />
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

      </main>
    </div>
  );
}
