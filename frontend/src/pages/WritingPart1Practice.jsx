import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { 
  ArrowLeft, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle, 
  Send, 
  RotateCcw, 
  Lightbulb, 
  Eye, 
  Award,
  ChevronRight
} from 'lucide-react';
import axios from 'axios';
import usePageTitle from '../hooks/usePageTitle';

export default function WritingPart1Practice() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [exercise, setExercise] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userSentence, setUserSentence] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState(null);
  const [showSamples, setShowSamples] = useState(false);

  usePageTitle(
    'Luyện Viết Part 1 — Tả Tranh 2 Từ Khóa TOEIC Writing',
    'Luyện viết câu mô tả bức tranh Part 1 sử dụng 2 từ khóa bắt buộc với AI chấm điểm ngữ pháp thời gian thực.'
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
        console.error('Failed to load writing item:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    loadItem();
    return () => { isMounted = false; };
  }, [id]);

  const handleSubmit = async () => {
    if (!userSentence.trim()) return;
    setIsSubmitting(true);
    try {
      const res = await axios.post('/api/v1/writing/grade', {
        part: 1,
        userText: userSentence,
        keywords: exercise?.keywords || []
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
    setUserSentence('');
    setResult(null);
    setShowSamples(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 py-20 text-center">
          <div className="w-12 h-12 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-400 text-sm">Đang nạp bài tập Part 1...</p>
        </div>
      </div>
    );
  }

  const keywords = exercise?.keywords || [];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 selection:bg-cyan-500 selection:text-slate-950">
      <Navbar />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-6">
        {/* Top bar navigation */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigate('/write?part=1')}
            className="flex items-center gap-2 text-slate-400 hover:text-white text-xs font-semibold px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Danh sách Part 1</span>
          </button>

          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold text-cyan-400 bg-cyan-500/10 border border-cyan-500/20 px-3 py-1 rounded-xl">
              {exercise?.code || 'Part 1'}
            </span>
            <span className="text-xs font-semibold text-slate-400 bg-slate-900 border border-slate-800 px-3 py-1 rounded-xl">
              Dạng: {exercise?.pattern || 'N + V'}
            </span>
          </div>
        </div>

        {/* Prompt Header */}
        <div className="rounded-3xl bg-slate-900/80 border border-slate-800/80 p-6 space-y-4 shadow-xl">
          <div className="space-y-1">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-cyan-400" />
              <span>Yêu cầu làm bài</span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-400">
              Viết đúng <strong className="text-slate-200">1 câu hoàn chỉnh</strong> miêu tả bức tranh dưới đây và bắt buộc phải sử dụng cả <strong className="text-cyan-300">2 từ khóa</strong> được cung cấp.
            </p>
          </div>

          {/* 2 Keywords Highlight */}
          <div className="flex items-center gap-3 p-3 rounded-2xl bg-slate-950/60 border border-slate-800">
            <span className="text-xs text-slate-400 font-semibold shrink-0">Từ khóa bắt buộc:</span>
            <div className="flex items-center gap-2 flex-wrap">
              {keywords.map((kw, idx) => (
                <span key={idx} className="px-3 py-1 rounded-xl text-xs sm:text-sm font-extrabold text-amber-300 bg-amber-500/10 border border-amber-500/30 tracking-wide">
                  {kw}
                </span>
              ))}
            </div>
            {exercise?.vietnameseTitle && (
              <span className="text-xs text-slate-500 italic ml-auto hidden sm:inline">
                ({exercise.vietnameseTitle})
              </span>
            )}
          </div>
        </div>

        {/* Picture Card */}
        <div className="rounded-3xl overflow-hidden bg-slate-900/40 border border-slate-800 flex justify-center p-4">
          <img
            src={exercise?.imageUrl || '/media/listening/part1/photo_1.jpg'}
            alt="TOEIC Writing Part 1 Picture"
            className="max-h-[380px] w-auto rounded-2xl object-contain shadow-2xl border border-slate-800"
            onError={(e) => {
              e.currentTarget.src = '/media/listening/part1/photo_1.jpg';
            }}
          />
        </div>

        {/* Text Area & Submit */}
        <div className="rounded-3xl bg-slate-900/80 border border-slate-800/80 p-6 space-y-4 shadow-xl">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Câu trả lời của bạn:
            </label>
            <span className="text-xs text-slate-500 font-mono">
              {userSentence.trim() ? userSentence.trim().split(/\s+/).length : 0} từ
            </span>
          </div>

          <textarea
            value={userSentence}
            onChange={(e) => setUserSentence(e.target.value)}
            disabled={!!result}
            placeholder={`Ví dụ: The woman is preparing food in the modern kitchen...`}
            rows={3}
            className="w-full rounded-2xl bg-slate-950 border border-slate-800 p-4 text-sm sm:text-base text-slate-100 placeholder-slate-600 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all resize-none font-sans"
          />

          <div className="flex items-center justify-between pt-2">
            <button
              onClick={() => setShowSamples(!showSamples)}
              className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-cyan-300 transition-colors"
            >
              <Lightbulb className="w-4 h-4 text-amber-400" />
              <span>{showSamples ? 'Ẩn câu mẫu' : 'Xem câu mẫu tham khảo'}</span>
            </button>

            <div className="flex items-center gap-2">
              {result && (
                <button
                  onClick={handleReset}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-all"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Viết lại</span>
                </button>
              )}
              <button
                onClick={handleSubmit}
                disabled={isSubmitting || !userSentence.trim() || !!result}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 text-slate-950 text-xs sm:text-sm font-extrabold transition-all shadow-lg shadow-cyan-500/20"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                    <span>Đang chấm...</span>
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
        </div>

        {/* AI Evaluation Card */}
        {result && (
          <div className="rounded-3xl bg-gradient-to-br from-slate-900 via-slate-900 to-cyan-950/30 border border-cyan-500/40 p-6 space-y-4 shadow-2xl animate-fade-in">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <Award className="w-6 h-6 text-cyan-400" />
                <h3 className="font-extrabold text-base text-white">Kết Quả Chấm Điểm AI</h3>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-cyan-500/10 border border-cyan-500/30">
                <span className="text-xs text-slate-400">Điểm số:</span>
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

        {/* Sample Answers Panel */}
        {showSamples && (
          <div className="rounded-3xl bg-slate-900/60 border border-slate-800 p-6 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-2">
              <Eye className="w-4 h-4" />
              <span>Câu mẫu tham khảo chuẩn ETS</span>
            </h4>
            <div className="space-y-2">
              {(exercise?.sampleAnswers && exercise.sampleAnswers.length > 0 ? exercise.sampleAnswers : [
                `The ${keywords[0] || 'person'} is ${keywords[1] || 'working'} near the area.`,
                `There is a ${keywords[0] || 'subject'} which has been ${keywords[1] || 'placed'} on the table.`
              ]).map((ans, idx) => (
                <div key={idx} className="p-3 rounded-xl bg-slate-950 border border-slate-800/80 text-xs sm:text-sm text-slate-200">
                  <span className="font-bold text-cyan-400 mr-2">Cách {idx + 1}:</span>
                  <span>{ans}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
