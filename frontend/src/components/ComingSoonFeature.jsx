import React from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from './Navbar';
import { 
  Sparkles, 
  Clock, 
  ArrowRight, 
  Headphones, 
  BookOpen, 
  FileText, 
  Home, 
  Construction, 
  Bot,
  Flame,
  CheckCircle2
} from 'lucide-react';

export default function ComingSoonFeature({ 
  title = "Tính Năng Đang Được Phát Triển", 
  featureName = "TOEIC Speaking & Writing AI Coach",
  description = "Đội ngũ kỹ thuật Tường Tận TOEIC đang hoàn thiện mô hình AI chấm điểm phát âm và ngữ pháp thời gian thực để mang đến trải nghiệm học tập chuẩn xác nhất."
}) {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      <Navbar />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 py-12 flex flex-col items-center justify-center text-center space-y-8 animate-fadeIn">
        
        {/* Animated Icon Badge */}
        <div className="relative">
          <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl bg-gradient-to-tr from-amber-500/20 via-orange-500/10 to-sky-500/20 border-2 border-amber-500/40 p-1 flex items-center justify-center shadow-2xl shadow-amber-500/10">
            <div className="w-full h-full bg-slate-900 rounded-[20px] flex items-center justify-center">
              <Bot className="w-12 h-12 text-amber-400 animate-bounce" />
            </div>
          </div>
          <span className="absolute -bottom-2 -right-2 px-3 py-1 rounded-full bg-amber-500 text-slate-950 text-[10px] font-extrabold font-mono uppercase tracking-wider shadow-lg">
            SẮP RA MẮT
          </span>
        </div>

        {/* Title & Description */}
        <div className="space-y-3 max-w-xl">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold uppercase tracking-wider">
            <Clock className="w-3.5 h-3.5" />
            <span>Đang Trong Giai Đoạn Hoàn Thiện</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-black font-heading text-white tracking-tight">
            {title}
          </h1>

          <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
            {description}
          </p>
        </div>

        {/* Feature Highlights In Progress */}
        <div className="w-full max-w-md p-5 rounded-3xl glass-panel border border-slate-800 text-left space-y-3">
          <span className="text-xs font-mono font-bold text-slate-400 uppercase block">
            Những tính năng sắp tới:
          </span>
          <div className="space-y-2 text-xs text-slate-300">
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
              <span>AI nhận diện giọng nói và chấm điểm phát âm /200 điểm</span>
            </div>
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
              <span>Sửa lỗi ngữ pháp & nâng cấp từ vựng bài viết Email / Essay</span>
            </div>
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
              <span>Gợi ý câu trả lời mẫu đạt điểm tối đa (Level 8 Speaking / Writing)</span>
            </div>
          </div>
        </div>

        {/* Alternative Ready Modules Navigation */}
        <div className="space-y-3 w-full max-w-md pt-2">
          <span className="text-xs font-bold text-slate-400 block">
            Trong thời gian này, bạn hãy trải nghiệm các mô-đun đã hoàn thiện:
          </span>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              onClick={() => navigate('/listen')}
              className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-cyan-500 text-xs font-bold text-slate-200 hover:text-white flex items-center justify-between transition-all group"
            >
              <div className="flex items-center gap-2">
                <Headphones className="w-4 h-4 text-cyan-400" />
                <span>Luyện Nghe (Part 1-4)</span>
              </div>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </button>

            <button
              onClick={() => navigate('/read')}
              className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-emerald-500 text-xs font-bold text-slate-200 hover:text-white flex items-center justify-between transition-all group"
            >
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-emerald-400" />
                <span>Luyện Đọc (Part 5-7)</span>
              </div>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </button>

            <button
              onClick={() => navigate('/vocabulary')}
              className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-amber-500 text-xs font-bold text-slate-200 hover:text-white flex items-center justify-between transition-all group"
            >
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>Từ Vựng Spaced Repetition</span>
              </div>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </button>

            <button
              onClick={() => navigate('/tests')}
              className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-sky-500 text-xs font-bold text-slate-200 hover:text-white flex items-center justify-between transition-all group"
            >
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-sky-400" />
                <span>Thi Thử ETS 91 Đề</span>
              </div>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>

          <button
            onClick={() => navigate('/')}
            className="w-full py-3 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-xs font-bold text-slate-400 hover:text-white flex items-center justify-center gap-2 transition-all mt-2"
          >
            <Home className="w-4 h-4" />
            <span>Quay về Trang Chủ</span>
          </button>
        </div>

      </main>
    </div>
  );
}
