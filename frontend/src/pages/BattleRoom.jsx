import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../components/Navbar';
import { 
  Swords, 
  Trophy, 
  Flame, 
  Zap, 
  Clock, 
  ShieldCheck, 
  Check, 
  X, 
  RefreshCw, 
  ArrowRight, 
  Crown, 
  Sparkles, 
  Award,
  Users,
  Play,
  BookMarked
} from 'lucide-react';
import usePageTitle from '../hooks/usePageTitle';

export default function BattleRoom() {
  usePageTitle('Đấu Trường 1v1 - Đối Kháng TOEIC Real-Time');
  const navigate = useNavigate();

  // Game States: 'lobby' | 'matching' | 'playing' | 'result'
  const [gameState, setGameState] = useState('lobby');
  const [arenaInfo, setArenaInfo] = useState(null);
  const [loading, setLoading] = useState(true);

  // Match State
  const [opponent, setOpponent] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(15);
  
  // Scores & Round State
  const [userScore, setUserScore] = useState(0);
  const [opponentScore, setOpponentScore] = useState(0);
  const [userAnswersHistory, setUserAnswersHistory] = useState([]); // [{ correct: bool, points: number }]
  const [opponentAnswersHistory, setOpponentAnswersHistory] = useState([]); // [{ correct: bool, points: number }]
  const [selectedOption, setSelectedOption] = useState(null);
  const [isAnswerLocked, setIsAnswerLocked] = useState(false);
  const [roundFeedback, setRoundFeedback] = useState(null); // 'correct' | 'wrong' | 'timeout' | null
  const [opponentCurrentStatus, setOpponentCurrentStatus] = useState({ answered: false, isCorrect: false, points: 0 });

  const opponentTimerRef = useRef(null);
  const roundAdvanceTimerRef = useRef(null);
  const opponentPlanRef = useRef([]); // Pre-calculated realistic match plan
  const userScoreRef = useRef(0);
  const opponentScoreRef = useRef(0);
  const userAnswersHistoryRef = useRef([]);
  const opponentAnswersHistoryRef = useRef([]);

  // Independent pacing synchronization refs
  const userAnsweredRef = useRef(false);
  const opponentAnsweredRef = useRef(false);
  const roundResolvedRef = useRef(false);
  const userPendingResultRef = useRef({ isCorrect: false, points: 0, optionIdx: null, isTimeout: false });

  // Matchmaking Animation Timer
  const [matchmakingDots, setMatchmakingDots] = useState('');

  // Handle Opponent Answer independently
  const handleOpponentAnswer = (qIdx) => {
    const planned = opponentPlanRef.current[qIdx];
    if (!planned || planned.answered || roundResolvedRef.current) return;

    planned.answered = true;
    opponentAnsweredRef.current = true;
    setOpponentCurrentStatus({
      answered: true,
      isCorrect: planned.isCorrect,
      points: planned.points
    });

    // If user has already answered this question, both are done -> resolve round!
    if (userAnsweredRef.current && !roundResolvedRef.current) {
      resolveRound();
    }
  };

  // Fetch Arena Lobby Info
  const fetchArenaInfo = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/api/v1/battle/arena-info');
      if (res.data?.data) {
        setArenaInfo(res.data.data);
      }
    } catch (err) {
      console.warn('Arena info error:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchArenaInfo();
  }, []);

  // Matchmaking Sequence
  const handleStartMatchmaking = async () => {
    setGameState('matching');
    setMatchmakingDots('');
    const dotInterval = setInterval(() => {
      setMatchmakingDots(prev => (prev.length >= 3 ? '' : prev + '.'));
    }, 400);

    try {
      const res = await axios.post('/api/v1/battle/matchmake', { topic: 'part5' });
      clearInterval(dotInterval);
      
      // Artificial 2-second suspense
      setTimeout(() => {
        if (res.data?.data) {
          const qs = res.data.data.questions || [];
          const opp = res.data.data.opponent;
          setOpponent(opp);
          setQuestions(qs);
          setCurrentQIndex(0);
          
          userScoreRef.current = 0;
          opponentScoreRef.current = 0;
          userAnswersHistoryRef.current = [];
          opponentAnswersHistoryRef.current = [];
          setUserScore(0);
          setOpponentScore(0);
          setUserAnswersHistory([]);
          setOpponentAnswersHistory([]);
          
          userAnsweredRef.current = false;
          opponentAnsweredRef.current = false;
          roundResolvedRef.current = false;
          userPendingResultRef.current = { isCorrect: false, points: 0, optionIdx: null, isTimeout: false };

          setTimeLeft(15);
          setIsAnswerLocked(false);
          setSelectedOption(null);
          setRoundFeedback(null);
          setOpponentCurrentStatus({ answered: false, isCorrect: false, points: 0 });

          // Pre-generate intelligent, balanced opponent performance:
          const totalQ = qs.length || 10;
          const targetCorrect = Math.min(totalQ, Math.floor(Math.random() * 3) + 5);
          const correctIndices = new Set();
          while (correctIndices.size < targetCorrect && correctIndices.size < totalQ) {
            correctIndices.add(Math.floor(Math.random() * totalQ));
          }

          const plan = qs.map((_, idx) => {
            const isCorrect = correctIndices.has(idx);
            // Diverse, realistic human thinking time: 3.2s to 8.2s
            const responseTimeMs = Math.floor(3200 + Math.random() * 5000);
            const remainingSec = Math.max(2, 15 - responseTimeMs / 1000);
            const points = isCorrect ? Math.round(100 + remainingSec * 7) : 0;
            return { isCorrect, responseTimeMs, points, answered: false };
          });
          opponentPlanRef.current = plan;

          setGameState('playing');
        }
      }, 2000);
    } catch (err) {
      clearInterval(dotInterval);
      setGameState('lobby');
    }
  };

  // Timer Countdown Effect during gameplay
  useEffect(() => {
    if (gameState !== 'playing' || roundResolvedRef.current) return;

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          handleTimeout();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [gameState, currentQIndex]);

  // Simulate Opponent's Answer independently during each question
  useEffect(() => {
    if (gameState !== 'playing') return;

    setOpponentCurrentStatus({ answered: false, isCorrect: false, points: 0 });
    const planned = opponentPlanRef.current[currentQIndex];
    if (!planned) return;

    opponentTimerRef.current = setTimeout(() => {
      handleOpponentAnswer(currentQIndex);
    }, planned.responseTimeMs);

    return () => {
      if (opponentTimerRef.current) {
        clearTimeout(opponentTimerRef.current);
      }
    };
  }, [gameState, currentQIndex]);

  // Handle User Answer Selection
  const handleSelectAnswer = (optionLabel, optionIdx) => {
    if (isAnswerLocked || roundResolvedRef.current) return;

    setIsAnswerLocked(true);
    userAnsweredRef.current = true;
    setSelectedOption(optionIdx);

    const currentQ = questions[currentQIndex];
    const letter = ['A', 'B', 'C', 'D'][optionIdx];
    const isCorrect = letter === currentQ?.correctAnswer;

    // Calculate Speed Bonus Score
    const speedBonus = timeLeft * 7;
    const pointsEarned = isCorrect ? 100 + speedBonus : 0;

    userPendingResultRef.current = { isCorrect, points: pointsEarned, optionIdx, isTimeout: false };

    // If opponent has already answered, both are done -> resolve round!
    if (opponentAnsweredRef.current && !roundResolvedRef.current) {
      resolveRound();
    }
    // If opponent hasn't answered yet, user waits for opponent!
  };

  // Handle Question Timeout
  const handleTimeout = () => {
    if (roundResolvedRef.current) return;
    setIsAnswerLocked(true);

    if (!userAnsweredRef.current) {
      userAnsweredRef.current = true;
      userPendingResultRef.current = { isCorrect: false, points: 0, optionIdx: -1, isTimeout: true };
    }

    resolveRound(true);
  };

  // Synchronized Round Resolution
  const resolveRound = (isTimeout = false) => {
    if (roundResolvedRef.current) return;
    roundResolvedRef.current = true;

    if (opponentTimerRef.current) {
      clearTimeout(opponentTimerRef.current);
    }

    const currentQ = questions[currentQIndex];
    const planned = opponentPlanRef.current[currentQIndex];

    // Ensure opponent answer is finalized
    if (planned && !planned.answered) {
      planned.answered = true;
      if (isTimeout && !opponentAnsweredRef.current) {
        planned.isCorrect = false;
        planned.points = 0;
      }
    }

    const oppPoints = planned ? planned.points : 0;
    const oppCorrect = planned ? planned.isCorrect : false;

    opponentScoreRef.current += oppPoints;
    opponentAnswersHistoryRef.current.push({ correct: oppCorrect, points: oppPoints });
    setOpponentScore(opponentScoreRef.current);
    setOpponentAnswersHistory([...opponentAnswersHistoryRef.current]);
    setOpponentCurrentStatus({ answered: true, isCorrect: oppCorrect, points: oppPoints });

    const userRes = userPendingResultRef.current;
    const userCorrect = userRes.isCorrect;
    const userPoints = userRes.points;

    userScoreRef.current += userPoints;
    userAnswersHistoryRef.current.push({ correct: userCorrect, points: userPoints });
    setUserScore(userScoreRef.current);
    setUserAnswersHistory([...userAnswersHistoryRef.current]);

    if (userRes.isTimeout) {
      setRoundFeedback('timeout');
    } else {
      setRoundFeedback(userCorrect ? 'correct' : 'wrong');
    }

    // Auto-record mistake to Sổ Tay Câu Sai if user was incorrect or timed out
    if (!userCorrect && currentQ) {
      try {
        axios.post('/api/v1/mistakes', {
          questionId: `battle-${currentQ.id || currentQIndex + 1}`,
          part: 5,
          section: 'READING',
          prompt: currentQ.promptText,
          passageText: currentQ.promptText,
          options: currentQ.options.map((opt, i) => ({ label: `(${['A', 'B', 'C', 'D'][i]})`, text: opt })),
          correctAnswer: ['A', 'B', 'C', 'D'].indexOf(currentQ.correctAnswer),
          userAnswer: userRes.optionIdx ?? -1,
          explanation: currentQ.explanation || 'Xem lại cấu trúc ngữ pháp và từ loại của câu.',
          translation: currentQ.translation || '',
          categoryTag: userRes.isTimeout ? '1v1 Battle Part 5 (Hết giờ)' : '1v1 Battle Part 5'
        }).catch(() => {});
      } catch (e) {}
    }

    // Both players see result together for 1.8s, then proceed to next question
    roundAdvanceTimerRef.current = setTimeout(() => {
      proceedToNextQuestion();
    }, 1800);
  };

  const [finishData, setFinishData] = useState(null);

  // Proceed to next question or finish match
  const proceedToNextQuestion = async () => {
    if (roundAdvanceTimerRef.current) {
      clearTimeout(roundAdvanceTimerRef.current);
    }
    if (opponentTimerRef.current) {
      clearTimeout(opponentTimerRef.current);
    }

    userAnsweredRef.current = false;
    opponentAnsweredRef.current = false;
    roundResolvedRef.current = false;
    userPendingResultRef.current = { isCorrect: false, points: 0, optionIdx: null, isTimeout: false };

    setIsAnswerLocked(false);
    setSelectedOption(null);
    setRoundFeedback(null);
    setTimeLeft(15);
    setOpponentCurrentStatus({ answered: false, isCorrect: false, points: 0 });

    if (currentQIndex + 1 < questions.length) {
      setCurrentQIndex(prev => prev + 1);
    } else {
      // Match Finished!
      const fullHistory = opponentPlanRef.current.map(p => ({ correct: p.isCorrect, points: p.points }));
      const finalOpponentScore = fullHistory.reduce((acc, curr) => acc + curr.points, 0);
      opponentScoreRef.current = finalOpponentScore;
      opponentAnswersHistoryRef.current = fullHistory;
      setOpponentScore(finalOpponentScore);
      setOpponentAnswersHistory(fullHistory);

      const finalUserScore = userScoreRef.current;
      const finalUserHistory = [...userAnswersHistoryRef.current];
      const isWon = finalUserScore > finalOpponentScore;

      try {
        const res = await axios.post('/api/v1/battle/finish', {
          isWinner: isWon,
          userScore: finalUserScore,
          correctCount: finalUserHistory.filter(a => a.correct).length
        });
        if (res.data?.data) {
          setFinishData(res.data.data);
          setArenaInfo(prev => ({
            ...prev,
            battleElo: res.data.data.newElo || prev?.battleElo,
            battleTier: res.data.data.newTier || prev?.battleTier,
            winStreak: res.data.data.newStreak !== undefined ? res.data.data.newStreak : prev?.winStreak
          }));
        }
      } catch (e) {}
      setGameState('result');
    }
  };

  const currentQ = questions[currentQIndex];
  const isWinner = userScore > opponentScore;
  const isDraw = userScore === opponentScore;

  return (
    <div className="min-h-screen dark:bg-[#0b1120] bg-[#f8fafc] dark:text-slate-100 text-slate-900 flex flex-col font-sans pb-16 selection:bg-rose-500 selection:text-white transition-colors duration-200">
      <Navbar />

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-8 space-y-8 animate-fadeIn">
        
        {/* ========================================================================= */}
        {/* 1. LOBBY VIEW: ARENA HERO, STATS & MATCHMAKING BUTTON */}
        {/* ========================================================================= */}
        {gameState === 'lobby' && (
          <div className="space-y-8">
            
            {/* HERO ARENA BANNER */}
            <div className="relative overflow-hidden rounded-3xl p-8 sm:p-12 dark:bg-gradient-to-r dark:from-[#2e1022]/70 dark:via-[#0f172a] dark:to-[#0b1120] bg-gradient-to-r from-rose-50 via-white to-orange-50/60 border-2 dark:border-rose-500/40 border-rose-200 shadow-xl dark:shadow-2xl space-y-6">
              <div className="absolute top-0 right-0 w-96 h-96 bg-rose-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
              <div className="absolute bottom-0 left-1/3 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
                <div className="space-y-3 max-w-2xl">
                  <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full dark:bg-rose-500/20 bg-rose-100 border dark:border-rose-500/40 border-rose-300 dark:text-rose-300 text-rose-700 text-xs font-black uppercase tracking-wider">
                    <Swords className="w-3.5 h-3.5" />
                    <span>ĐẤU TRƯỜNG ĐỐI KHÁNG 1V1 • REAL-TIME</span>
                  </div>
                  <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black font-heading dark:text-white text-slate-900 tracking-tight">
                    Thách Đấu Tốc Độ 1v1 ⚔️
                  </h1>
                  <p className="dark:text-slate-300 text-slate-600 text-xs sm:text-sm leading-relaxed">
                    So tài 10 câu trắc nghiệm Part 5 tốc độ cao với các học viên trên toàn quốc. Trả lời chính xác và nhanh nhất để nhận cúp vinh quang và ăn trọn <strong className="text-amber-600 dark:text-amber-400">+100 XP Thưởng</strong>!
                  </p>
                </div>

                {/* Matchmaking Action Button */}
                <div className="flex flex-col items-center gap-3 shrink-0">
                  <button
                    onClick={handleStartMatchmaking}
                    className="w-full sm:w-auto py-4 px-8 rounded-3xl bg-gradient-to-r from-rose-500 via-red-500 to-orange-500 hover:from-rose-400 hover:to-orange-400 text-white font-black font-heading text-base sm:text-lg shadow-2xl shadow-rose-500/30 flex items-center justify-center gap-3 transition-all hover:scale-105 active:scale-95 animate-pulse"
                  >
                    <Zap className="w-6 h-6 fill-white" />
                    <span>TÌM ĐỐI THỦ NGAY (1V1)</span>
                  </button>
                  <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-mono flex items-center gap-1.5 font-bold">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                    <span>{arenaInfo?.onlineCount || 48} học viên đang tìm trận</span>
                  </span>
                </div>
              </div>

              {/* Arena Info Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 border-t dark:border-slate-800/80 border-slate-200 pt-6 relative z-10 font-mono">
                <div className="p-3.5 rounded-2xl dark:bg-slate-950/80 bg-white border dark:border-slate-800 border-slate-200 shadow-sm">
                  <span className="text-[10px] dark:text-slate-400 text-slate-500 uppercase font-sans block">Bậc Xếp Hạng</span>
                  <span className="text-sm sm:text-base font-black text-amber-600 dark:text-amber-400">{arenaInfo?.battleTier || 'Vàng II'}</span>
                </div>
                <div className="p-3.5 rounded-2xl dark:bg-slate-950/80 bg-white border dark:border-slate-800 border-slate-200 shadow-sm">
                  <span className="text-[10px] dark:text-slate-400 text-slate-500 uppercase font-sans block">Điểm ELO</span>
                  <span className="text-sm sm:text-base font-black text-sky-600 dark:text-cyan-400">{arenaInfo?.battleElo || 1380} PTS</span>
                </div>
                <div className="p-3.5 rounded-2xl dark:bg-slate-950/80 bg-white border dark:border-slate-800 border-slate-200 shadow-sm">
                  <span className="text-[10px] dark:text-slate-400 text-slate-500 uppercase font-sans block">Tỷ Lệ Thắng</span>
                  <span className="text-sm sm:text-base font-black text-emerald-600 dark:text-emerald-400">{arenaInfo?.winRate || '71%'}</span>
                </div>
                <div className="p-3.5 rounded-2xl dark:bg-slate-950/80 bg-white border dark:border-slate-800 border-slate-200 shadow-sm">
                  <span className="text-[10px] dark:text-slate-400 text-slate-500 uppercase font-sans block">Chuỗi Thắng</span>
                  <span className="text-sm sm:text-base font-black text-rose-600 dark:text-rose-400">🔥 {arenaInfo?.winStreak || 4} trận</span>
                </div>
              </div>
            </div>

            {/* RECENT MATCH HISTORY */}
            <div className="glass-panel rounded-3xl border dark:border-slate-800 border-slate-200 p-6 space-y-4 dark:bg-slate-900/60 bg-white shadow-xl">
              <h3 className="font-heading font-extrabold text-sm dark:text-white text-slate-900 flex items-center gap-2">
                <Trophy className="w-4 h-4 text-amber-500 dark:text-amber-400" />
                <span>Nhật Ký Thi Đấu Gần Đây</span>
              </h3>

              <div className="divide-y dark:divide-slate-800/80 divide-slate-100 font-mono text-xs">
                {arenaInfo?.recentMatches?.map((match) => (
                  <div key={match.id} className="py-3.5 flex items-center justify-between">
                    <div className="flex items-center gap-3 font-sans">
                      <span className={`px-2.5 py-0.5 rounded-lg text-[10px] font-black uppercase font-mono ${
                        match.result === 'WIN' ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/40' : 'bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-500/40'
                      }`}>
                        {match.result}
                      </span>
                      <span className="font-bold dark:text-white text-slate-800">vs {match.opponent}</span>
                    </div>

                    <div className="flex items-center gap-4">
                      <span className="font-bold dark:text-slate-300 text-slate-700">{match.score}</span>
                      <span className="text-emerald-600 dark:text-emerald-400 font-bold">+{match.xpGain} XP</span>
                      <span className="text-[10px] dark:text-slate-500 text-slate-400 font-sans hidden sm:inline">{match.time}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}

        {/* ========================================================================= */}
        {/* 2. MATCHMAKING SCREEN: SCANNING OPPONENT */}
        {/* ========================================================================= */}
        {gameState === 'matching' && (
          <div className="min-h-[450px] flex flex-col items-center justify-center p-8 rounded-3xl dark:bg-slate-900/80 bg-white border dark:border-slate-800 border-slate-200 text-center space-y-6 animate-fadeIn relative shadow-xl">
            <div className="relative">
              <div className="w-24 h-24 rounded-full border-4 border-rose-500/30 border-t-rose-500 animate-spin flex items-center justify-center" />
              <div className="absolute inset-0 m-auto w-16 h-16 rounded-full bg-rose-500/20 flex items-center justify-center text-3xl animate-pulse">
                ⚔️
              </div>
            </div>

            <div className="space-y-2">
              <h2 className="text-2xl font-black font-heading dark:text-white text-slate-900">
                ĐANG TÌM ĐỐI THỦ XỨNG TẦM{matchmakingDots}
              </h2>
              <p className="text-xs dark:text-slate-400 text-slate-600 max-w-sm mx-auto">
                Hệ thống đang quét các học viên trong cùng bậc rank Vàng để ghép trận đấu công bằng nhất.
              </p>
            </div>

            <button
              onClick={() => setGameState('lobby')}
              className="px-5 py-2.5 rounded-2xl dark:bg-slate-800 bg-slate-100 hover:bg-slate-200 dark:hover:bg-slate-700 dark:text-slate-300 text-slate-700 font-bold text-xs transition-colors border dark:border-slate-700 border-slate-200 shadow-sm"
            >
              Hủy Tìm Trận
            </button>
          </div>
        )}

        {/* ========================================================================= */}
        {/* 3. LIVE 1V1 BATTLE PLAYING SCREEN */}
        {/* ========================================================================= */}
        {gameState === 'playing' && currentQ && (
          <div className="space-y-6">
            
            {/* TOP VERSUS LIVE SCOREBOARD */}
            <div className="p-5 sm:p-6 rounded-3xl dark:bg-slate-900 bg-white border dark:border-slate-800 border-slate-200 shadow-xl grid grid-cols-12 items-center gap-4 relative overflow-hidden">
              
              {/* Left: Player 1 (User) */}
              <div className="col-span-5 flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-cyan-500 to-blue-500 text-slate-950 flex items-center justify-center font-heading font-black text-xl shadow-lg shrink-0">
                  {(arenaInfo?.userName || 'B').charAt(0).toUpperCase()}
                </div>
                <div className="space-y-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <h4 className="font-heading font-black dark:text-white text-slate-900 text-xs sm:text-sm truncate">{arenaInfo?.userName || 'Bạn'} (Bạn)</h4>
                    <span className="px-2 py-0.5 rounded dark:bg-cyan-500/20 bg-sky-100 dark:text-cyan-300 text-sky-700 text-[10px] font-mono font-bold hidden sm:inline">Vàng II</span>
                  </div>
                  <div className="text-lg sm:text-2xl font-black font-mono dark:text-cyan-400 text-sky-600">
                    {userScore} <span className="text-[10px] dark:text-slate-400 text-slate-500">PTS</span>
                  </div>
                  {/* Round Progress Dots for User */}
                  <div className="flex items-center gap-1 pt-0.5">
                    {questions.map((_, idx) => {
                      const ans = userAnswersHistory[idx];
                      const isCurrent = idx === currentQIndex;
                      let color = 'dark:bg-slate-800 bg-slate-200';
                      if (ans) color = ans.correct ? 'bg-emerald-500' : 'bg-rose-500';
                      else if (isCurrent) color = 'bg-cyan-400 animate-pulse ring-1 ring-cyan-400/50';
                      return <span key={idx} className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full transition-all ${color}`} />;
                    })}
                  </div>
                </div>
              </div>

              {/* Center: Timer & Round Counter */}
              <div className="col-span-2 flex flex-col items-center justify-center text-center">
                <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-full border-4 flex items-center justify-center font-black font-mono text-base sm:text-xl shadow-xl transition-all ${
                  timeLeft <= 4 ? 'border-rose-500 text-rose-500 bg-rose-50 animate-ping' : 'border-amber-500 text-amber-600 dark:text-amber-400 dark:bg-slate-950 bg-amber-50'
                }`}>
                  {timeLeft}s
                </div>
                <span className="text-[10px] font-mono dark:text-slate-400 text-slate-500 mt-1 font-bold">
                  {currentQIndex + 1}/10
                </span>
              </div>

              {/* Right: Player 2 (Opponent) */}
              <div className="col-span-5 flex items-center justify-end gap-3 text-right">
                <div className="space-y-1 min-w-0">
                  <div className="flex items-center justify-end gap-1.5">
                    <span className="px-2 py-0.5 rounded dark:bg-rose-500/20 bg-rose-100 dark:text-rose-300 text-rose-700 text-[10px] font-mono font-bold hidden sm:inline">{opponent?.tier}</span>
                    <h4 className="font-heading font-black dark:text-white text-slate-900 text-xs sm:text-sm truncate">{opponent?.name}</h4>
                  </div>
                  <div className="flex items-center justify-end gap-2">
                    <span className={`text-[9px] sm:text-[10px] font-mono px-2 py-0.5 rounded-full font-bold transition-all hidden sm:inline-block ${
                      opponentCurrentStatus.answered
                        ? (roundFeedback 
                            ? (opponentCurrentStatus.isCorrect 
                                ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30' 
                                : 'bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-500/30')
                            : 'bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/30 animate-pulse')
                        : 'dark:bg-slate-800 bg-slate-100 dark:text-slate-400 text-slate-500 animate-pulse'
                    }`}>
                      {opponentCurrentStatus.answered 
                        ? (roundFeedback 
                            ? (opponentCurrentStatus.isCorrect ? `✓ Đúng (+${opponentCurrentStatus.points} PTS)` : '✗ Sai (+0 PTS)') 
                            : '⚡ Đã chốt đáp án!') 
                        : '⏱ Đang suy nghĩ...'}
                    </span>
                    <div className="text-lg sm:text-2xl font-black font-mono text-rose-500 dark:text-rose-400">
                      {opponentScore} <span className="text-[10px] dark:text-slate-400 text-slate-500">PTS</span>
                    </div>
                  </div>
                  {/* Round Progress Dots for Opponent */}
                  <div className="flex items-center justify-end gap-1 pt-0.5">
                    {questions.map((_, idx) => {
                      const ans = opponentAnswersHistory[idx];
                      const isCurrent = idx === currentQIndex;
                      let color = 'dark:bg-slate-800 bg-slate-200';
                      if (ans) color = ans.correct ? 'bg-emerald-500' : 'bg-rose-500';
                      else if (isCurrent) color = opponentCurrentStatus.answered ? 'bg-amber-400 animate-pulse ring-1 ring-amber-400/50' : 'bg-rose-400 animate-pulse ring-1 ring-rose-400/50';
                      return <span key={idx} className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full transition-all ${color}`} />;
                    })}
                  </div>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-rose-500 to-orange-500 text-white flex items-center justify-center text-2xl shadow-lg shrink-0">
                  {opponent?.avatar || '🦁'}
                </div>
              </div>

            </div>

            {/* CENTER QUESTION & OPTIONS CARD */}
            <div className="p-6 sm:p-8 rounded-3xl dark:bg-slate-900 bg-white border dark:border-slate-800 border-slate-200 space-y-6 shadow-xl relative">
              
              {/* Question Text */}
              <div className="space-y-2">
                <span className="text-[11px] font-mono dark:text-cyan-400 text-sky-600 font-bold uppercase tracking-wider">
                  Part 5: Ngữ Pháp & Từ Vựng Tốc Độ
                </span>
                <h3 className="text-base sm:text-xl font-bold font-sans dark:text-white text-slate-900 leading-relaxed">
                  {currentQ.promptText}
                </h3>
              </div>

              {/* 4 Options Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {currentQ.options.map((opt, idx) => {
                  const letter = ['A', 'B', 'C', 'D'][idx];
                  const isSelected = selectedOption === idx;
                  const isCorrect = letter === currentQ.correctAnswer;

                  let btnStyle = 'dark:bg-slate-950 bg-white dark:border-slate-800 border-slate-200 hover:border-sky-500 dark:hover:border-cyan-500 dark:text-slate-200 text-slate-800 shadow-sm';
                  if (isAnswerLocked) {
                    if (roundFeedback) {
                      if (isCorrect) {
                        btnStyle = 'bg-emerald-500/20 border-emerald-500 text-emerald-700 dark:text-emerald-300 font-bold shadow-lg shadow-emerald-500/20';
                      } else if (isSelected) {
                        btnStyle = 'bg-rose-500/20 border-rose-500 text-rose-700 dark:text-rose-300 font-bold';
                      } else {
                        btnStyle = 'dark:bg-slate-950/60 bg-slate-50 dark:border-slate-800 border-slate-200 dark:text-slate-600 text-slate-400 opacity-60';
                      }
                    } else {
                      // Waiting for opponent to answer: show user's choice highlighted in sky/blue
                      if (isSelected) {
                        btnStyle = 'bg-sky-500/20 border-sky-500 text-sky-700 dark:text-sky-300 font-bold shadow-md shadow-sky-500/20';
                      } else {
                        btnStyle = 'dark:bg-slate-950/60 bg-slate-50 dark:border-slate-800 border-slate-200 dark:text-slate-600 text-slate-400 opacity-60';
                      }
                    }
                  }

                  return (
                    <button
                      key={idx}
                      onClick={() => handleSelectAnswer(opt, idx)}
                      disabled={isAnswerLocked}
                      className={`p-4 rounded-2xl border text-left text-sm font-semibold transition-all flex items-center gap-3.5 active:scale-[0.98] ${btnStyle}`}
                    >
                      <span className={`w-8 h-8 rounded-xl flex items-center justify-center font-mono font-bold text-xs shrink-0 ${
                        isAnswerLocked && roundFeedback && isCorrect 
                          ? 'bg-emerald-500 text-white' 
                          : isAnswerLocked && roundFeedback && isSelected 
                          ? 'bg-rose-500 text-white' 
                          : isAnswerLocked && !roundFeedback && isSelected
                          ? 'bg-sky-500 text-white'
                          : 'dark:bg-slate-800 bg-slate-100 dark:text-slate-300 text-slate-700'
                      }`}>
                        {letter}
                      </span>
                      <span className="flex-1">{opt}</span>
                    </button>
                  );
                })}
              </div>

              {/* Instant Round Feedback Banner or Waiting for Opponent Status */}
              {roundFeedback ? (
                <div className={`p-4 rounded-2xl flex items-center justify-between text-xs font-bold animate-fadeIn ${
                  roundFeedback === 'correct' ? 'bg-emerald-500/20 border border-emerald-500/40 text-emerald-700 dark:text-emerald-300' : (roundFeedback === 'timeout' ? 'bg-amber-500/20 border border-amber-500/40 text-amber-700 dark:text-amber-300' : 'bg-rose-500/20 border border-rose-500/40 text-rose-700 dark:text-rose-300')
                }`}>
                  <div className="flex items-center gap-2">
                    {roundFeedback === 'correct' ? <Check className="w-5 h-5 text-emerald-500 shrink-0" /> : (roundFeedback === 'timeout' ? <Clock className="w-5 h-5 text-amber-500 shrink-0" /> : <X className="w-5 h-5 text-rose-500 shrink-0" />)}
                    <span>
                      {roundFeedback === 'correct' 
                        ? 'CHÍNH XÁC! +100 PTS VÀ THƯỞNG TỐC ĐỘ' 
                        : (roundFeedback === 'timeout' ? 'HẾT THỜI GIAN TRẢ LỜI!' : 'CHƯA CHÍNH XÁC!')}
                    </span>
                  </div>
                  <span className="text-[11px] dark:text-slate-300 text-slate-600 font-normal truncate max-w-md">{currentQ.explanation}</span>
                </div>
              ) : isAnswerLocked ? (
                <div className="p-4 rounded-2xl flex items-center justify-between text-xs font-bold bg-amber-500/10 border border-amber-500/30 text-amber-700 dark:text-amber-300 animate-pulse">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-amber-500 animate-spin shrink-0" />
                    <span>BẠN ĐÃ CHỐT ĐÁP ÁN!</span>
                  </div>
                  <span className="text-[11px] dark:text-slate-400 text-slate-600 font-normal">
                    Đang chờ đối thủ ({opponent?.name || 'Đối phương'}) chốt câu trả lời...
                  </span>
                </div>
              ) : null}

            </div>

          </div>
        )}

        {/* ========================================================================= */}
        {/* 4. RESULT & CELEBRATION SCREEN */}
        {/* ========================================================================= */}
        {gameState === 'result' && (
          <div className="max-w-xl mx-auto p-8 rounded-3xl dark:bg-slate-900 bg-white border-2 dark:border-amber-500/40 border-amber-300 shadow-2xl text-center space-y-6 animate-fadeIn">
            
            {/* Victory / Defeat Header */}
            <div className="space-y-3">
              <div className={`w-20 h-20 rounded-full mx-auto flex items-center justify-center text-slate-950 shadow-2xl animate-bounce ${
                isWinner ? 'bg-gradient-to-tr from-amber-400 via-yellow-400 to-amber-500 shadow-amber-500/40' : (isDraw ? 'bg-gradient-to-tr from-sky-400 to-blue-500 shadow-sky-500/40 text-white' : 'bg-slate-700 text-white')
              }`}>
                {isWinner ? <Crown className="w-10 h-10 fill-slate-950" /> : <Trophy className="w-10 h-10" />}
              </div>

              <span className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider border inline-block ${
                isWinner ? 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border-emerald-500/40' : (isDraw ? 'bg-sky-500/20 text-sky-600 dark:text-sky-400 border-sky-500/40' : 'dark:bg-slate-800 bg-slate-100 dark:text-slate-400 text-slate-600 border-slate-300 dark:border-slate-700')
              }`}>
                {isWinner ? '🏆 CHIẾN THẮNG TUYỆT ĐỐI' : (isDraw ? '🤝 HÒA NHAU GANG TẤC' : '⚔️ NỖ LỰC TUYỆT VỜI')}
              </span>

              <h2 className="text-3xl font-black font-heading dark:text-white text-slate-900">
                {isWinner ? 'BẠN ĐÃ CHIẾN THẮNG!' : (isDraw ? 'TRẬN ĐẤU BẤT PHÂN THẮNG BẠI!' : 'ĐỐI THỦ ĐÃ DẪN TRƯỚC')}
              </h2>
            </div>

            {/* Score Comparison Box */}
            <div className="p-6 rounded-2xl dark:bg-slate-950 bg-slate-50 border dark:border-slate-800 border-slate-200 grid grid-cols-2 gap-4 items-center">
              <div className="space-y-1">
                <span className="text-[10px] font-mono dark:text-cyan-400 text-sky-600 uppercase font-bold">Điểm của bạn</span>
                <div className="text-3xl font-black font-heading dark:text-cyan-300 text-sky-700">
                  {userScore}
                </div>
                <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-mono font-bold">
                  {userAnswersHistory.filter(a => a.correct).length}/10 đúng
                </span>
              </div>

              <div className="space-y-1 border-l dark:border-slate-800 border-slate-200 pl-4">
                <span className="text-[10px] font-mono text-rose-500 dark:text-rose-400 uppercase font-bold">{opponent?.name}</span>
                <div className="text-3xl font-black font-heading text-rose-600 dark:text-rose-400">
                  {opponentScore}
                </div>
                <span className="text-[10px] dark:text-slate-400 text-slate-500 font-mono font-bold">
                  {opponentAnswersHistory.filter(a => a.correct).length}/10 đúng
                </span>
              </div>
            </div>

            {/* XP Bonus & Elo Award Banner */}
            <div className="space-y-2">
              <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center gap-3 text-amber-700 dark:text-amber-300 text-xs font-extrabold">
                <Zap className="w-5 h-5 text-amber-500 dark:text-amber-400 shrink-0" />
                <span>{isWinner ? 'Đã cộng +100 XP Thưởng Vinh Quang!' : 'Đã cộng +35 XP khích lệ!'}</span>
                {finishData?.newElo && (
                  <span className="ml-2 px-2.5 py-0.5 rounded-full bg-sky-500/20 text-sky-700 dark:text-cyan-300 text-[11px] font-mono border border-sky-500/30">
                    {isWinner ? '+25 ELO' : '-15 ELO'} • {finishData.newElo} PTS
                  </span>
                )}
              </div>

              {userAnswersHistory.some(a => !a.correct) && (
                <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/25 flex items-center justify-between gap-3 text-rose-700 dark:text-rose-300 text-xs">
                  <div className="flex items-center gap-2">
                    <BookMarked className="w-4 h-4 text-rose-500 shrink-0" />
                    <span>Đã lưu <strong>{userAnswersHistory.filter(a => !a.correct).length} câu sai</strong> vào Sổ Tay Câu Sai để bạn ôn lại!</span>
                  </div>
                  <button
                    onClick={() => navigate('/mistakes')}
                    className="px-3 py-1 rounded-xl bg-rose-500 hover:bg-rose-600 text-white font-bold text-[11px] transition-all shrink-0"
                  >
                    Xem Sổ Tay →
                  </button>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
              <button
                onClick={handleStartMatchmaking}
                className="w-full sm:w-auto flex-1 py-3.5 px-6 rounded-2xl bg-gradient-to-r from-rose-500 to-orange-500 hover:from-rose-400 hover:to-orange-400 text-white font-black text-xs shadow-lg shadow-rose-500/20 active:scale-95 transition-all flex items-center justify-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                <span>TÁI ĐẤU 1V1 NGAY</span>
              </button>

              <button
                onClick={() => setGameState('lobby')}
                className="w-full sm:w-auto py-3.5 px-6 rounded-2xl dark:bg-slate-800 bg-slate-100 hover:bg-slate-200 dark:hover:bg-slate-700 dark:text-white text-slate-700 font-bold text-xs transition-colors border dark:border-slate-700 border-slate-200"
              >
                Về Sảnh Đấu Trường
              </button>
            </div>

          </div>
        )}

      </main>
    </div>
  );
}
