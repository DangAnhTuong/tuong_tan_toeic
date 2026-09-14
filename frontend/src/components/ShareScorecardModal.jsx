import React, { useState } from 'react';
import axios from 'axios';
import { 
  Trophy, 
  Share2, 
  Crown, 
  Sparkles, 
  Check, 
  Copy, 
  ExternalLink, 
  Download, 
  X, 
  Award, 
  Zap, 
  CheckCircle2,
  Flame,
  ShieldCheck
} from 'lucide-react';

export default function ShareScorecardModal({ 
  isOpen, 
  onClose, 
  evaluationResult, 
  studentName = 'Học Viên TOEIC'
}) {
  const [copied, setCopied] = useState(false);

  if (!isOpen || !evaluationResult) return null;

  const totalScore = evaluationResult.totalScore || 785;
  const listeningScore = evaluationResult.listeningScore || 410;
  const readingScore = evaluationResult.readingScore || 375;
  const testTitle = evaluationResult.testTitle || 'ETS TOEIC 2026 Test 1 (Full 200 Câu)';

  // Calculate Band Level
  const getBandInfo = (score) => {
    if (score >= 850) return { band: 'C1 Proficient', text: 'Thành thạo chuyên nghiệp - Giao tiếp đa quốc gia xuất sắc', color: 'from-amber-400 to-yellow-500' };
    if (score >= 700) return { band: 'B2 Vantage', text: 'Giao tiếp doanh nghiệp lưu loát & Xử lý văn bản tốt', color: 'from-emerald-400 to-teal-500' };
    if (score >= 500) return { band: 'B1 Independent', text: 'Tự tin giao tiếp cơ bản & Đọc hiểu thông thường', color: 'from-cyan-400 to-blue-500' };
    return { band: 'A2 Breakthrough', text: 'Đang xây dựng nền tảng từ vựng & ngữ pháp', color: 'from-purple-400 to-indigo-500' };
  };

  const bandInfo = getBandInfo(totalScore);

  // 1. Share Facebook
  const handleShareFacebook = () => {
    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://tuongtantoeic.com';
    const shareUrl = encodeURIComponent(`${origin}/tests`);
    const quote = encodeURIComponent(`🎯 Mình vừa đạt ${totalScore}/990 điểm trong bài thi thử "${testTitle}" trên Tường Tận TOEIC! Hãy cùng thi thử và bứt phá mục tiêu nào!`);
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${shareUrl}&quote=${quote}`, '_blank', 'width=600,height=500');
  };

  // 2. Share Zalo
  const handleShareZalo = () => {
    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://tuongtantoeic.com';
    const shareUrl = encodeURIComponent(`${origin}/tests`);
    window.open(`https://sp.zalo.me/plugins/share?url=${shareUrl}`, '_blank', 'width=600,height=500');
  };

  // 3. Copy Link
  const handleCopyLink = () => {
    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://tuongtantoeic.com';
    const link = `${origin}/tests?ref=scorecard_${totalScore}`;
    navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  // 4. Download High-Res Certificate Image via HTML5 Canvas (1200x675)
  const handleDownloadImage = () => {
    try {
      const canvas = document.createElement('canvas');
      canvas.width = 1200;
      canvas.height = 675;
      const ctx = canvas.getContext('2d');
      if (!ctx) return window.print();

      // Background gradient
      const bgGrad = ctx.createLinearGradient(0, 0, 1200, 675);
      bgGrad.addColorStop(0, '#090e1a');
      bgGrad.addColorStop(0.5, '#0f172a');
      bgGrad.addColorStop(1, '#090e1a');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, 1200, 675);

      // Gold border
      ctx.strokeStyle = '#f59e0b';
      ctx.lineWidth = 6;
      ctx.strokeRect(30, 30, 1140, 615);

      // Inner thin border
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(42, 42, 1116, 591);

      // Header Tag
      ctx.fillStyle = '#f59e0b';
      ctx.fillRect(850, 42, 300, 48);
      ctx.fillStyle = '#0f172a';
      ctx.font = 'bold 20px "Segoe UI", Arial, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('ETS TOEIC CERTIFICATE', 1000, 74);

      // Subheader
      ctx.fillStyle = '#f59e0b';
      ctx.font = 'bold 18px "Segoe UI", Arial, sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText('BẢNG ĐIỂM THI THỬ TOEIC CHUẨN IIG', 70, 95);

      // Main Title
      ctx.fillStyle = '#ffffff';
      ctx.font = '900 36px "Segoe UI", Arial, sans-serif';
      ctx.fillText('CHỨNG NHẬN NĂNG LỰC ETS TOEIC', 70, 145);

      // Student info
      ctx.fillStyle = '#94a3b8';
      ctx.font = '16px "Segoe UI", Arial, sans-serif';
      ctx.fillText('Thí sinh kiểm tra:', 70, 195);

      ctx.fillStyle = '#38bdf8';
      ctx.font = 'bold 30px "Segoe UI", Arial, sans-serif';
      ctx.fillText(studentName, 70, 235);

      ctx.fillStyle = '#94a3b8';
      ctx.font = '16px "Segoe UI", Arial, sans-serif';
      ctx.fillText(testTitle, 70, 270);

      // Total Score Card
      ctx.fillStyle = '#020617';
      ctx.fillRect(70, 310, 1060, 170);
      ctx.strokeStyle = '#1e293b';
      ctx.lineWidth = 2;
      ctx.strokeRect(70, 310, 1060, 170);

      ctx.fillStyle = '#f59e0b';
      ctx.font = 'bold 18px "Segoe UI", Arial, sans-serif';
      ctx.fillText('TỔNG ĐIỂM ƯỚC TÍNH (SCALED SCORE)', 100, 355);

      ctx.fillStyle = '#fbbf24';
      ctx.font = '900 70px "Segoe UI", Arial, sans-serif';
      ctx.fillText(`${totalScore}`, 100, 440);
      ctx.fillStyle = '#94a3b8';
      ctx.font = 'bold 24px "Segoe UI", Arial, sans-serif';
      ctx.fillText('/ 990 PTS', 240, 435);

      // Breakdown Box
      ctx.fillStyle = '#38bdf8';
      ctx.font = 'bold 26px "Segoe UI", Arial, sans-serif';
      ctx.fillText(`🎧 Listening: ${listeningScore} / 495`, 700, 380);

      ctx.fillStyle = '#34d399';
      ctx.font = 'bold 26px "Segoe UI", Arial, sans-serif';
      ctx.fillText(`📖 Reading:  ${readingScore} / 495`, 700, 435);

      // Band Level Pill
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(70, 505, 1060, 60);
      ctx.fillStyle = '#f59e0b';
      ctx.font = 'bold 20px "Segoe UI", Arial, sans-serif';
      ctx.fillText(`🏆 Xếp loại: ${bandInfo.band}`, 100, 542);
      ctx.fillStyle = '#94a3b8';
      ctx.font = '16px "Segoe UI", Arial, sans-serif';
      ctx.fillText(`— ${bandInfo.text}`, 380, 542);

      // Footer
      ctx.fillStyle = '#64748b';
      ctx.font = '14px "Segoe UI", Arial, sans-serif';
      ctx.fillText('Nền tảng Tường Tận TOEIC • toeic.danganhtuong.dev', 70, 605);
      ctx.textAlign = 'right';
      ctx.fillText(`Ngày thi: ${new Date().toLocaleDateString('vi-VN')}`, 1130, 605);

      // Download
      const link = document.createElement('a');
      link.download = `Bang_Diem_ETS_TOEIC_${studentName.replace(/\s+/g, '_')}_${totalScore}PTS.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch (e) {
      console.warn('Canvas export failed, fallback to print:', e);
      window.print();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md animate-fadeIn overflow-y-auto">
      <div className="relative w-full max-w-xl rounded-3xl bg-slate-900 border border-slate-800 p-6 sm:p-8 space-y-6 shadow-2xl my-8 text-slate-100 overflow-hidden">
        
        {/* Glow ambient background */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none -ml-20 -mb-20" />

        {/* Close button */}
        <button 
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors z-20"
        >
          <X className="w-5 h-5" />
        </button>

        {/* SCORECARD & SHARE CONTENT */}
        <div className="space-y-6 relative z-10">
          
          {/* Header Title */}
          <div className="text-center space-y-1">
            <div className="flex items-center justify-center gap-2 text-amber-400 text-xs font-black uppercase tracking-wider">
              <Sparkles className="w-4 h-4 animate-pulse" />
              <span>BẢNG ĐIỂM THI THỬ TOEIC CHUẨN IIG</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-heading font-black text-white">
              Chứng Nhận Năng Lực ETS TOEIC
            </h2>
          </div>

            {/* CYBER-LUXE ETS SCORECARD CERTIFICATE */}
            <div id="ets-scorecard-card" className="p-6 rounded-3xl bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 border-2 border-amber-500/40 shadow-2xl relative overflow-hidden space-y-5">
              
              <div className="absolute top-0 right-0 px-4 py-1.5 rounded-bl-2xl bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 font-heading font-black text-[10px] uppercase shadow-md">
                ETS TOEIC CERTIFICATE
              </div>

              {/* Header Info */}
              <div className="space-y-1">
                <p className="text-[10px] text-slate-400 font-mono uppercase tracking-wider">Thí sinh kiểm tra:</p>
                <h3 className="text-lg font-heading font-extrabold text-white flex items-center gap-2">
                  <span>{studentName}</span>
                  <ShieldCheck className="w-4 h-4 text-cyan-400" />
                </h3>
                <p className="text-[11px] text-slate-400 line-clamp-1">{testTitle}</p>
              </div>

              {/* Big Scaled Total Score */}
              <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800/80 flex items-center justify-between">
                <div className="space-y-0.5">
                  <span className="text-[10px] font-mono text-amber-400 font-bold uppercase">Tổng Điểm Ước Tính</span>
                  <div className="text-3xl sm:text-4xl font-heading font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500">
                    {totalScore} <span className="text-xs font-mono text-slate-400">/ 990 PTS</span>
                  </div>
                </div>

                <div className="text-right space-y-1 font-mono text-xs">
                  <div className="text-sky-400 font-bold">
                    🎧 Listening: <span className="text-white font-extrabold">{listeningScore}</span>/495
                  </div>
                  <div className="text-emerald-400 font-bold">
                    📖 Reading: <span className="text-white font-extrabold">{readingScore}</span>/495
                  </div>
                </div>
              </div>

              {/* Band Proficiency Pill */}
              <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <Award className="w-4 h-4 text-amber-400 shrink-0" />
                  <span className="font-bold text-slate-200">{bandInfo.band}</span>
                </div>
                <span className="text-[10px] text-slate-400 hidden sm:inline">{bandInfo.text}</span>
              </div>

              {/* Footer Verification Stamp */}
              <div className="flex items-center justify-between text-[10px] text-slate-500 border-t border-slate-800/80 pt-3">
                <span>Nền tảng Tường Tận TOEIC</span>
                <span>Ngày thi: {new Date().toLocaleDateString('vi-VN')}</span>
              </div>
            </div>

            {/* INFORMATIVE SHARE BANNER */}
            <div className="p-4 rounded-2xl bg-gradient-to-r from-sky-500/15 via-cyan-500/10 to-transparent border border-sky-500/30 flex items-center gap-3">
              <div className="p-2 rounded-xl bg-sky-500/20 text-sky-300 shrink-0">
                <Share2 className="w-5 h-5 text-sky-400" />
              </div>
              <div className="text-xs space-y-0.5">
                <span className="font-heading font-extrabold text-sky-300">
                  Lưu & Chia sẻ thành tích:
                </span>
                <p className="text-slate-300 text-[11px] leading-relaxed">
                  Lưu lại bảng điểm hoặc chia sẻ để lưu giữ cột mốc tiến bộ luyện thi TOEIC của bạn!
                </p>
              </div>
            </div>

            {/* SOCIAL SHARING ACTIONS (4 BUTTONS) */}
            <div className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                
                {/* 1. Facebook Share */}
                <button
                  onClick={handleShareFacebook}
                  className="py-3 px-4 rounded-2xl bg-[#1877F2] hover:bg-[#166fe5] text-white font-extrabold text-xs flex items-center justify-center gap-2 shadow-lg shadow-[#1877F2]/20 active:scale-95 transition-all"
                >
                  <Share2 className="w-4 h-4" />
                  <span>Chia sẻ lên Facebook</span>
                </button>

                {/* 2. Zalo Share */}
                <button
                  onClick={handleShareZalo}
                  className="py-3 px-4 rounded-2xl bg-[#0068FF] hover:bg-[#0057d9] text-white font-extrabold text-xs flex items-center justify-center gap-2 shadow-lg shadow-[#0068FF]/20 active:scale-95 transition-all"
                >
                  <Share2 className="w-4 h-4" />
                  <span>Chia sẻ lên Zalo</span>
                </button>

              </div>

              <div className="flex flex-col sm:flex-row items-center gap-3">
                {/* 3. Copy Link */}
                <button
                  onClick={handleCopyLink}
                  className="w-full sm:flex-1 py-2.5 px-4 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs flex items-center justify-center gap-2 border border-slate-700 transition-all active:scale-95"
                >
                  {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-slate-400" />}
                  <span>{copied ? 'Đã sao chép liên kết!' : 'Sao chép link'}</span>
                </button>

                {/* 4. Tải Ảnh Chứng Chỉ HD */}
                <button
                  onClick={handleDownloadImage}
                  className="w-full sm:flex-1 py-2.5 px-4 rounded-2xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/50 text-amber-300 hover:text-amber-200 font-bold text-xs flex items-center justify-center gap-1.5 transition-all active:scale-95"
                  title="Tải ảnh chứng chỉ bảng điểm sắc nét"
                >
                  <Download className="w-4 h-4" />
                  <span>Tải Ảnh HD</span>
                </button>

                {/* 5. In / Lưu PDF */}
                <button
                  onClick={() => window.print()}
                  className="w-full sm:w-auto py-2.5 px-4 rounded-2xl bg-slate-950 border border-slate-800 hover:border-slate-700 text-slate-400 hover:text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all active:scale-95"
                  title="In báo cáo điểm hoặc lưu file PDF A4"
                >
                  <Download className="w-4 h-4" />
                  <span>Lưu PDF (A4)</span>
                </button>
              </div>
            </div>

          </div>

      </div>
    </div>
  );
}
