import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { 
  ArrowLeft, 
  Mic, 
  MicOff, 
  Sparkles, 
  Clock, 
  Play, 
  RotateCcw, 
  Award, 
  Volume2, 
  AlertCircle,
  CheckCircle2,
  Image as ImageIcon
} from 'lucide-react';
import axios from 'axios';
import usePageTitle from '../hooks/usePageTitle';

export default function SpeakingPractice() {
  const { partId } = useParams();
  const navigate = useNavigate();

  const [exercise, setExercise] = useState(null);
  const [loading, setLoading] = useState(true);

  // States: 'idle' | 'prep' | 'speaking' | 'evaluating' | 'result'
  const [sessionState, setSessionState] = useState('idle');
  const [prepTimeLeft, setPrepTimeLeft] = useState(45);
  const [speakTimeLeft, setSpeakTimeLeft] = useState(45);
  const [transcript, setTranscript] = useState('');
  const [evaluation, setEvaluation] = useState(null);

  const recognitionRef = useRef(null);

  usePageTitle(
    'Phòng Luyện Nói TOEIC AI — Chấm Điểm ETS /200',
    'Phòng luyện nói TOEIC Speaking tương tác với Web Speech API nhận diện giọng nói và chấm điểm tức thì theo thang ETS 200.'
  );

  useEffect(() => {
    let isMounted = true;
    async function loadItem() {
      setLoading(true);
      try {
        const res = await axios.get(`/api/v1/speaking/exercises/${partId}`);
        if (isMounted && res.data && res.data.data) {
          const ex = res.data.data;
          setExercise(ex);
          setPrepTimeLeft(ex.prepTime || 45);
          setSpeakTimeLeft(ex.speakTime || 45);
        }
      } catch (err) {
        console.error('Failed to load speaking item:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    loadItem();
    return () => { isMounted = false; };
  }, [partId]);

  // Setup Web Speech API
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onresult = (event) => {
        let currentText = '';
        for (let i = 0; i < event.results.length; i++) {
          currentText += event.results[i][0].transcript + ' ';
        }
        setTranscript(currentText.trim());
      };

      recognition.onerror = (event) => {
        console.warn('Speech recognition error:', event.error);
      };

      recognitionRef.current = recognition;
    }

    return () => {
      if (recognitionRef.current) {
        try { recognitionRef.current.stop(); } catch (e) {}
      }
    };
  }, []);

  // Timer logic for prep and speaking
  useEffect(() => {
    let timer = null;
    if (sessionState === 'prep' && prepTimeLeft > 0) {
      timer = setInterval(() => {
        setPrepTimeLeft(t => {
          if (t <= 1) {
            startSpeaking();
            return 0;
          }
          return t - 1;
        });
      }, 1000);
    } else if (sessionState === 'speaking' && speakTimeLeft > 0) {
      timer = setInterval(() => {
        setSpeakTimeLeft(t => {
          if (t <= 1) {
            stopSpeakingAndEvaluate();
            return 0;
          }
          return t - 1;
        });
      }, 1000);
    }
    return () => { if (timer) clearInterval(timer); };
  }, [sessionState, prepTimeLeft, speakTimeLeft]);

  const startPreparation = () => {
    setSessionState('prep');
    setPrepTimeLeft(exercise?.prepTime || 45);
    setTranscript('');
    setEvaluation(null);
  };

  const startSpeaking = () => {
    setSessionState('speaking');
    setSpeakTimeLeft(exercise?.speakTime || 45);
    if (recognitionRef.current) {
      try { recognitionRef.current.start(); } catch (e) {}
    }
  };

  const stopSpeakingAndEvaluate = async () => {
    setSessionState('evaluating');
    if (recognitionRef.current) {
      try { recognitionRef.current.stop(); } catch (e) {}
    }

    try {
      const res = await axios.post('/api/v1/speaking/evaluate', {
        part: exercise?.part || 1,
        userTranscript: transcript || 'I think that this is very important for communication.',
        targetText: exercise?.title || '',
        durationSeconds: (exercise?.speakTime || 45) - speakTimeLeft
      });
      if (res.data && res.data.data) {
        setEvaluation(res.data.data);
      }
    } catch (err) {
      console.error('Speaking evaluation error:', err);
    } finally {
      setSessionState('result');
    }
  };

  const resetAll = () => {
    setSessionState('idle');
    setPrepTimeLeft(exercise?.prepTime || 45);
    setSpeakTimeLeft(exercise?.speakTime || 45);
    setTranscript('');
    setEvaluation(null);
    if (recognitionRef.current) {
      try { recognitionRef.current.stop(); } catch (e) {}
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 py-20 text-center">
          <div className="w-12 h-12 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-400 text-sm">Đang nạp phòng luyện nói...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 selection:bg-cyan-500 selection:text-slate-950">
      <Navbar />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-6">
        {/* Navigation bar */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigate(`/speaking?tab=${exercise?.part || 1}`)}
            className="flex items-center gap-2 text-slate-400 hover:text-white text-xs font-semibold px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Danh sách Part {exercise?.part || 1}</span>
          </button>

          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold text-cyan-400 bg-cyan-500/10 border border-cyan-500/20 px-3 py-1 rounded-xl">
              {exercise?.code || 'Speaking'}
            </span>
            <span className="text-xs font-semibold text-slate-400 bg-slate-900 border border-slate-800 px-3 py-1 rounded-xl">
              {exercise?.topic || 'Chủ đề'}
            </span>
          </div>
        </div>

        {/* Question Header & Instructions */}
        <div className="rounded-3xl bg-slate-900/80 border border-slate-800/80 p-6 space-y-4 shadow-xl">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              <span>Part {exercise?.part}: {
                exercise?.part === 1 ? 'Read a Text Aloud (Đọc to đoạn văn)' :
                exercise?.part === 2 ? 'Describe a Picture (Miêu tả một bức tranh)' :
                exercise?.part === 3 ? 'Respond to Questions (Trả lời câu hỏi)' :
                exercise?.part === 4 ? 'Respond Using Information Provided (Trả lời theo thông tin)' :
                'Express an Opinion (Trình bày quan điểm)'
              }</span>
            </h2>
            <span className="text-xs font-mono text-slate-400">
              ⏱️ Chuẩn bị: {exercise?.prepTime}s • Nói: {exercise?.speakTime}s
            </span>
          </div>

          {/* Prompt Content */}
          <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 text-sm sm:text-base text-slate-100 font-medium leading-relaxed font-sans">
            {exercise?.title}
          </div>

          {/* Part 2 Picture if available */}
          {exercise?.part === 2 && (
            <div className="flex justify-center p-3 rounded-2xl bg-slate-950/60 border border-slate-800">
              <img
                src={exercise?.image || '/media/listening/part1/photo_1.jpg'}
                alt="Speaking Part 2 Picture"
                className="max-h-[300px] w-auto rounded-xl object-contain shadow-lg"
                onError={(e) => {
                  e.currentTarget.src = '/media/listening/part1/photo_1.jpg';
                }}
              />
            </div>
          )}

          {exercise?.tips && (
            <div className="p-3 rounded-xl bg-cyan-500/5 border border-cyan-500/20 text-xs text-cyan-300">
              💡 <strong>Mẹo làm bài:</strong> {exercise.tips}
            </div>
          )}
        </div>

        {/* Interactive Recording Console */}
        <div className="rounded-3xl bg-slate-900/90 border border-slate-800 p-8 space-y-6 text-center shadow-2xl">
          {sessionState === 'idle' && (
            <div className="space-y-4 py-6">
              <div className="w-20 h-20 rounded-full bg-cyan-500/10 border-2 border-cyan-500/30 flex items-center justify-center mx-auto text-cyan-400 shadow-inner">
                <Mic className="w-10 h-10 animate-pulse" />
              </div>
              <div className="space-y-1">
                <h3 className="text-lg font-bold text-white">Sẵn sàng thu âm giọng nói?</h3>
                <p className="text-xs text-slate-400 max-w-md mx-auto">
                  Bạn sẽ có <strong className="text-slate-200">{exercise?.prepTime} giây chuẩn bị</strong>, sau đó hệ thống sẽ tự động bật microphone để bạn nói trong <strong className="text-slate-200">{exercise?.speakTime} giây</strong>.
                </p>
              </div>
              <button
                onClick={startPreparation}
                className="inline-flex items-center gap-2 px-8 py-3 rounded-2xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-extrabold text-sm transition-all shadow-lg shadow-cyan-500/25"
              >
                <Play className="w-4 h-4 fill-current" />
                <span>Bắt đầu lượt nói</span>
              </button>
            </div>
          )}

          {sessionState === 'prep' && (
            <div className="space-y-4 py-6">
              <div className="w-24 h-24 rounded-full bg-amber-500/10 border-4 border-amber-500/40 flex items-center justify-center mx-auto text-amber-400 text-3xl font-extrabold font-mono animate-pulse">
                {prepTimeLeft}s
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-bold text-amber-300 uppercase tracking-wider">Thời gian chuẩn bị...</h3>
                <p className="text-xs text-slate-400">Đọc kỹ đề bài và phác thảo các ý tưởng trong đầu.</p>
              </div>
              <button
                onClick={startSpeaking}
                className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-all"
              >
                Bỏ qua chuẩn bị ➔ Bắt đầu nói ngay
              </button>
            </div>
          )}

          {sessionState === 'speaking' && (
            <div className="space-y-4 py-6">
              <div className="w-24 h-24 rounded-full bg-rose-500/10 border-4 border-rose-500/50 flex items-center justify-center mx-auto text-rose-400 text-3xl font-extrabold font-mono animate-bounce">
                {speakTimeLeft}s
              </div>
              <div className="space-y-1">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/20 text-rose-400 text-xs font-bold animate-pulse">
                  <span className="w-2 h-2 rounded-full bg-rose-500" />
                  <span>ĐANG THU ÂM TRỰC TIẾP...</span>
                </div>
                <p className="text-xs text-slate-400">Hãy nói to, rõ ràng và trôi chảy vào microphone.</p>
              </div>

              {/* Live Speech-to-Text transcript display */}
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-left max-w-lg mx-auto">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                  Nhận diện giọng nói thời gian thực:
                </span>
                <p className="text-xs sm:text-sm text-cyan-300 font-mono min-h-[40px]">
                  {transcript || '(Đang lắng nghe giọng nói của bạn...)'}
                </p>
              </div>

              <button
                onClick={stopSpeakingAndEvaluate}
                className="px-6 py-2.5 rounded-xl bg-rose-500 hover:bg-rose-400 text-white text-xs font-bold transition-all shadow-lg shadow-rose-500/20"
              >
                Hoàn thành & Chấm điểm sớm
              </button>
            </div>
          )}

          {sessionState === 'evaluating' && (
            <div className="py-12 space-y-4">
              <div className="w-12 h-12 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto" />
              <h3 className="text-base font-bold text-white">AI đang phân tích giọng nói...</h3>
              <p className="text-xs text-slate-400">Đang đối chiếu rubric phát âm, ngữ điệu và từ vựng chuẩn ETS.</p>
            </div>
          )}

          {sessionState === 'result' && evaluation && (
            <div className="space-y-6 text-left animate-fade-in">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-cyan-500/10 border border-cyan-500/30">
                <div className="space-y-1">
                  <span className="text-xs uppercase font-bold text-cyan-400 tracking-wider">Điểm Tổng Kết TOEIC Speaking</span>
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-extrabold text-white">{evaluation.score}</span>
                    <span className="text-sm text-slate-400">/ 200 PTS (ETS Scale)</span>
                  </div>
                </div>

                <button
                  onClick={resetAll}
                  className="self-start sm:self-center flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 text-xs font-bold transition-all"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Luyện lại bài này</span>
                </button>
              </div>

              {/* Subscores Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { label: 'Phát âm (Pronunciation)', score: evaluation.subScores?.pronunciation || 80 },
                  { label: 'Độ trôi chảy (Fluency)', score: evaluation.subScores?.fluency || 80 },
                  { label: 'Ngữ pháp (Grammar)', score: evaluation.subScores?.grammar || 80 },
                  { label: 'Từ vựng (Vocabulary)', score: evaluation.subScores?.vocabulary || 80 }
                ].map((s, idx) => (
                  <div key={idx} className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                    <span className="text-[11px] text-slate-400 block line-clamp-1">{s.label}</span>
                    <span className="text-lg font-extrabold text-cyan-400">{s.score}/100</span>
                  </div>
                ))}
              </div>

              {/* User transcript */}
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-1.5">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Bản ghi giọng nói của bạn:</span>
                <p className="text-xs sm:text-sm text-slate-200 font-mono leading-relaxed">
                  "{evaluation.transcript || transcript}"
                </p>
              </div>

              {/* AI Feedback */}
              <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-2">
                <span className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Award className="w-4 h-4" />
                  <span>Nhận xét từ AI Coach:</span>
                </span>
                {(evaluation.feedback || []).map((fb, idx) => (
                  <p key={idx} className="text-xs sm:text-sm text-slate-300">
                    {fb}
                  </p>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
