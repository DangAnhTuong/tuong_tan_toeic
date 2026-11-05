import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { 
  ArrowLeft, 
  Mail, 
  Send, 
  RotateCcw, 
  Lightbulb, 
  Award, 
  FileText,
  Clock,
  CheckCircle2,
  HelpCircle
} from 'lucide-react';
import axios from 'axios';
import usePageTitle from '../hooks/usePageTitle';

export default function WritingPart2Practice() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const isEssayMode = searchParams.get('mode') === 'essay';

  const [exercise, setExercise] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userText, setUserText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState(null);
  const [showPhrases, setShowPhrases] = useState(false);

  usePageTitle(
    isEssayMode ? 'Luyện Viết Bài Luận Part 3 — TOEIC Writing' : 'Luyện Viết Email Part 2 — TOEIC Writing',
    'Phòng luyện viết email và bài luận TOEIC Writing với phrase bank công sở và bộ chấm điểm AI chuẩn ETS.'
  );

  useEffect(() => {
    let isMounted = true;
    async function loadItem() {
      setLoading(true);
      try {
        const res = await axios.get(`/api/v1/writing/exercises/${id}`);
        if (isMounted && res.data && res.data.data) {
          setExercise(res.data.data);
        }
      } catch (err) {
        console.error('Failed to load exercise:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    loadItem();
    return () => { isMounted = false; };
  }, [id]);

  const handleSubmit = async () => {
    if (!userText.trim()) return;
    setIsSubmitting(true);
    try {
      const res = await axios.post('/api/v1/writing/grade', {
        part: isEssayMode ? 3 : 2,
        userText: userText
      });
      if (res.data && res.data.data) {
        setResult(res.data.data);
      }
    } catch (err) {
      console.error('Grading error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setUserText('');
    setResult(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 py-20 text-center">
          <div className="w-12 h-12 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-400 text-sm">Đang nạp bài tập viết...</p>
        </div>
      </div>
    );
  }

  const wordCount = userText.trim() ? userText.trim().split(/\s+/).length : 0;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 selection:bg-cyan-500 selection:text-slate-950">
      <Navbar />

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-6">
        {/* Top nav */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigate(isEssayMode ? '/write?part=3' : '/write?part=2')}
            className="flex items-center gap-2 text-slate-400 hover:text-white text-xs font-semibold px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>{isEssayMode ? 'Danh sách Part 3' : 'Danh sách Part 2'}</span>
          </button>

          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold text-cyan-400 bg-cyan-500/10 border border-cyan-500/20 px-3 py-1 rounded-xl">
              {exercise?.code || (isEssayMode ? 'Part 3' : 'Part 2')}
            </span>
            <span className="text-xs font-semibold text-slate-400 bg-slate-900 border border-slate-800 px-3 py-1 rounded-xl">
              {isEssayMode ? 'Thời gian: 30 phút' : 'Thời gian: 10 phút'}
            </span>
          </div>
        </div>

        {/* 2-Column layout: Prompt on Left, Editor on Right */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column: Prompt / Passage */}
          <div className="space-y-4">
            <div className="rounded-3xl bg-slate-900/80 border border-slate-800 p-6 space-y-4 shadow-xl">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  {isEssayMode ? (
                    <FileText className="w-5 h-5 text-emerald-400" />
                  ) : (
                    <Mail className="w-5 h-5 text-cyan-400" />
                  )}
                  <h2 className="text-sm font-bold text-white">
                    {isEssayMode ? 'Đề bài bài luận' : 'Email yêu cầu phản hồi'}
                  </h2>
                </div>
                <span className="text-xs text-slate-400 bg-slate-800 px-2.5 py-0.5 rounded-md">
                  {exercise?.topic || 'Công sở'}
                </span>
              </div>

              {!isEssayMode ? (
                // Email Prompt
                <div className="space-y-3">
                  <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-xs space-y-1.5 font-mono">
                    <p className="text-slate-400"><strong className="text-slate-300">From:</strong> {exercise?.emailPassage?.from || 'client@business.com'}</p>
                    <p className="text-slate-400"><strong className="text-slate-300">To:</strong> {exercise?.emailPassage?.to || 'you@office.com'}</p>
                    <p className="text-slate-400"><strong className="text-slate-300">Subject:</strong> {exercise?.emailPassage?.subject || exercise?.title || 'Inquiry'}</p>
                  </div>
                  <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 text-xs sm:text-sm text-slate-200 leading-relaxed font-sans">
                    {exercise?.emailPassage?.body || exercise?.title}
                  </div>
                  <div className="p-3 rounded-xl bg-cyan-500/5 border border-cyan-500/20 text-xs text-cyan-300">
                    🎯 <strong>Yêu cầu:</strong> {exercise?.dangYeuCau || 'Phản hồi email trên, đưa ra 2 thông tin chi tiết và đặt 1 câu hỏi làm rõ.'}
                  </div>
                </div>
              ) : (
                // Essay Prompt
                <div className="space-y-3">
                  <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-sm text-slate-200 leading-relaxed font-sans font-medium">
                    {exercise?.essayPrompt?.promptEn || exercise?.title}
                  </div>
                  {exercise?.essayPrompt?.promptVi && (
                    <div className="p-3 rounded-xl bg-slate-950/50 border border-slate-800 text-xs text-slate-400 italic">
                      {exercise.essayPrompt.promptVi}
                    </div>
                  )}
                  <div className="p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/20 text-xs text-emerald-300">
                    🎯 <strong>Dạng bài:</strong> {exercise?.essayPrompt?.essayType || 'Trình bày quan điểm (Agree / Disagree)'} — Mục tiêu tối thiểu 300 từ.
                  </div>
                </div>
              )}
            </div>

            {/* Useful Phrase Bank */}
            <div className="rounded-3xl bg-slate-900/60 border border-slate-800 p-5 space-y-3">
              <button
                onClick={() => setShowPhrases(!showPhrases)}
                className="w-full flex items-center justify-between text-xs font-bold text-slate-300 hover:text-white"
              >
                <span className="flex items-center gap-1.5">
                  <Lightbulb className="w-4 h-4 text-amber-400" />
                  <span>Cụm từ gợi ý (Phrase Bank)</span>
                </span>
                <span className="text-xs text-cyan-400">{showPhrases ? 'Thu gọn ▲' : 'Xem mở rộng ▼'}</span>
              </button>

              {showPhrases && (
                <div className="space-y-2 text-xs text-slate-300 pt-2 border-t border-slate-800/80">
                  <p><strong className="text-cyan-400">Mở đầu:</strong> Thank you for your email regarding... / I am writing to express my view on...</p>
                  <p><strong className="text-cyan-400">Phản hồi:</strong> In response to your question, I would like to confirm that...</p>
                  <p><strong className="text-cyan-400">Hỏi lại:</strong> Could you please provide further details about...? / I would appreciate it if you could...</p>
                  <p><strong className="text-cyan-400">Kết thư:</strong> Please feel free to reach out if you have any questions. Best regards,</p>
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Editor & Submission */}
          <div className="space-y-4">
            <div className="rounded-3xl bg-slate-900/80 border border-slate-800 p-6 space-y-4 shadow-xl">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Bài viết của bạn:
                </label>
                <div className="flex items-center gap-2">
                  <span className={`text-xs font-mono font-bold px-2.5 py-0.5 rounded-lg ${
                    isEssayMode 
                      ? (wordCount >= 250 ? 'bg-emerald-500/10 text-emerald-400' : 'bg-slate-800 text-slate-400')
                      : (wordCount >= 50 ? 'bg-cyan-500/10 text-cyan-400' : 'bg-slate-800 text-slate-400')
                  }`}>
                    {wordCount} {isEssayMode ? '/ 300 từ' : '/ 50-100 từ'}
                  </span>
                </div>
              </div>

              <textarea
                value={userText}
                onChange={(e) => setUserText(e.target.value)}
                disabled={!!result}
                placeholder={isEssayMode ? 'Viết bài luận 4 đoạn bắt đầu từ Introduction...' : 'Dear Mr. / Ms. ...\n\nThank you for reaching out to us...'}
                rows={12}
                className="w-full rounded-2xl bg-slate-950 border border-slate-800 p-4 text-xs sm:text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all resize-none font-sans leading-relaxed"
              />

              <div className="flex items-center justify-between pt-2">
                {result && (
                  <button
                    onClick={handleReset}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-all"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Làm lại</span>
                  </button>
                )}
                <button
                  onClick={handleSubmit}
                  disabled={isSubmitting || !userText.trim() || !!result}
                  className="ml-auto flex items-center gap-2 px-6 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 text-slate-950 text-xs sm:text-sm font-extrabold transition-all shadow-lg shadow-cyan-500/20"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                      <span>Đang phân tích...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>Nộp bài & Chấm điểm</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* AI Grading Result */}
            {result && (
              <div className="rounded-3xl bg-gradient-to-br from-slate-900 via-slate-900 to-cyan-950/30 border border-cyan-500/40 p-6 space-y-4 shadow-2xl animate-fade-in">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <div className="flex items-center gap-2.5">
                    <Award className="w-6 h-6 text-cyan-400" />
                    <h3 className="font-extrabold text-base text-white">Kết Quả Chấm Điểm AI</h3>
                  </div>
                  <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-cyan-500/10 border border-cyan-500/30">
                    <span className="text-xs text-slate-400">Điểm:</span>
                    <span className="text-base font-extrabold text-cyan-400">{result.score}/{result.maxScore}</span>
                  </div>
                </div>

                <div className="space-y-2">
                  {(result.feedback || []).map((fb, idx) => (
                    <p key={idx} className="text-xs sm:text-sm text-slate-300">
                      {fb}
                    </p>
                  ))}
                  {result.improvedSuggestion && (
                    <p className="text-xs text-cyan-400 bg-cyan-500/5 border border-cyan-500/20 p-3 rounded-xl mt-3">
                      💡 {result.improvedSuggestion}
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
