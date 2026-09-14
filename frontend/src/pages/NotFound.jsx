import React from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { 
  Home, 
  Sparkles, 
  Headphones, 
  BookOpen, 
  FileText, 
  ArrowLeft, 
  Compass,
  Search
} from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-amber-500 selection:text-slate-950">
      <Navbar />

      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 my-8 relative overflow-hidden">
        {/* Background Ambient Glows */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-10 left-10 w-72 h-72 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-10 right-10 w-72 h-72 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-xl w-full text-center relative z-10 space-y-8 animate-fadeIn">
          {/* Top Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-900/90 border border-slate-800 text-amber-400 text-xs font-bold tracking-wide shadow-lg shadow-amber-500/5">
            <Compass className="w-4 h-4 animate-spin" style={{ animationDuration: '8s' }} />
            <span>KHÔNG TÌM THẤY ĐƯỜNG DẪN</span>
          </div>

          {/* 404 Large Gradient Text */}
          <div className="space-y-3">
            <h1 className="text-7xl sm:text-9xl font-black font-heading tracking-tighter bg-gradient-to-r from-amber-400 via-emerald-400 to-cyan-400 bg-clip-text text-transparent drop-shadow-2xl">
              404
            </h1>
            <h2 className="text-xl sm:text-2xl font-extrabold text-white">
              Lạc vào vùng bí ẩn rồi học viên ơi! 🛸
            </h2>
            <p className="text-sm text-slate-400 max-w-md mx-auto leading-relaxed">
              Trang bạn đang cố gắng truy cập không tồn tại, đã bị đổi tên hoặc đường liên kết bị đứt quãng trong quá trình điều hướng.
            </p>
          </div>

          {/* Quick Action Navigation Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-left">
            <Link
              to="/"
              className="group p-4 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-emerald-500/50 hover:bg-slate-800/80 transition-all flex items-center gap-3.5 shadow-lg"
            >
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Home className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs font-bold text-white group-hover:text-emerald-400 transition-colors">Trang Chủ</div>
                <div className="text-[11px] text-slate-400">Về trang chủ Tường Tận TOEIC</div>
              </div>
            </Link>

            <Link
              to="/hub"
              className="group p-4 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-amber-500/50 hover:bg-slate-800/80 transition-all flex items-center gap-3.5 shadow-lg"
            >
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs font-bold text-white group-hover:text-amber-400 transition-colors">Phòng Học Cá Nhân</div>
                <div className="text-[11px] text-slate-400">Xem tiến độ, Streak 🔥 và XP ⚡</div>
              </div>
            </Link>

            <Link
              to="/listen"
              className="group p-4 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-cyan-500/50 hover:bg-slate-800/80 transition-all flex items-center gap-3.5 shadow-lg"
            >
              <div className="w-10 h-10 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Headphones className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs font-bold text-white group-hover:text-cyan-400 transition-colors">Luyện Nghe Part 1 - 4</div>
                <div className="text-[11px] text-slate-400">11.785 câu chép chính tả & Level</div>
              </div>
            </Link>

            <Link
              to="/tests"
              className="group p-4 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-purple-500/50 hover:bg-slate-800/80 transition-all flex items-center gap-3.5 shadow-lg"
            >
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs font-bold text-white group-hover:text-purple-400 transition-colors">Thi Thử TOEIC Full</div>
                <div className="text-[11px] text-slate-400">10 bộ đề ETS 2026 chuẩn 200 câu</div>
              </div>
            </Link>
          </div>

          {/* Primary Back Button */}
          <div className="pt-4 flex items-center justify-center gap-4">
            <Link
              to="/"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold text-xs tracking-wide shadow-lg shadow-emerald-500/20 transition-all active:scale-95"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>QUAY VỀ TRANG CHỦ NGAY</span>
            </Link>
          </div>
        </div>
      </main>

      {/* Subtle Footer */}
      <footer className="py-4 border-t border-slate-800 text-center text-xs text-slate-500">
        © 2026 Tường Tận TOEIC — Nền Tảng Luyện Thi TOEIC 4 Kỹ Năng Hàng Đầu.
      </footer>
    </div>
  );
}
