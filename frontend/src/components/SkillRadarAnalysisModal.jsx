import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { 
  Target, 
  TrendingUp, 
  Award, 
  AlertTriangle, 
  Sparkles, 
  X, 
  ChevronRight, 
  ArrowRight, 
  Zap, 
  CheckCircle2, 
  ShieldCheck,
  Flame,
  BookOpen,
  Headphones,
  Compass,
  Play,
  RotateCcw,
  Info
} from 'lucide-react';

export default function SkillRadarAnalysisModal({ isOpen, onClose }) {
  const [predictionData, setPredictionData] = useState(null);
  const [activePart, setActivePart] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isOpen) return;
    async function loadPrediction() {
      try {
        setLoading(true);
        const res = await axios.get('/api/v1/user/score-prediction');
        if (res.data?.data) {
          const data = res.data.data;
          setPredictionData(data);
          if (data.radarStats && data.radarStats.length > 0) {
            // Default to bottleneck part if available, else first part
            const defaultPart = (data.bottlenecks && data.bottlenecks.length > 0)
              ? (data.radarStats.find(s => s.part === data.bottlenecks[0].part) || data.radarStats[0])
              : data.radarStats[0];
            setActivePart(defaultPart);
          }
        }
      } catch (err) {
        console.warn('Load prediction err:', err.message);
      } finally {
        setLoading(false);
      }
    }
    loadPrediction();
  }, [isOpen]);

  if (!isOpen) return null;

  const hasData = Boolean(predictionData?.hasData && predictionData?.totalSessions > 0);

  // Radar Chart Math Calculation (7 Points on a circle)
  const size = 320;
  const center = size / 2;
  const radius = 110;
  const stats = predictionData?.radarStats || [];
  const numPoints = stats.length || 7;

  const getCoordinates = (index, valuePercent) => {
    const angle = (Math.PI * 2 / numPoints) * index - Math.PI / 2;
    const r = (valuePercent / 100) * radius;
    const x = center + r * Math.cos(angle);
    const y = center + r * Math.sin(angle);
    return { x, y };
  };

  // Polygon Points String (draw at real accuracy if hasData, or baseline 15% if no data for visual grid)
  const polygonPoints = stats.map((stat, idx) => {
    const displayAcc = hasData ? stat.accuracy : 0;
    const { x, y } = getCoordinates(idx, Math.max(5, displayAcc));
    return `${x},${y}`;
  }).join(' ');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md animate-fadeIn overflow-y-auto">
      <div className="relative w-full max-w-4xl rounded-3xl bg-slate-900 border border-slate-800 p-6 sm:p-8 space-y-6 shadow-2xl my-8 text-slate-100 overflow-hidden">
        
        {/* Ambient background glows */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none -ml-20 -mb-20" />

        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors z-20 cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4 relative z-10">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-black uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" />
              <span>AI SKILL RADAR • DỰ BÁO ĐIỂM TOEIC</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black font-heading text-white">
              Biểu Đồ Năng Lực 7 Kỹ Năng & Lộ Trình Bứt Phá
            </h2>
          </div>

          {/* Probability Badge */}
          {predictionData && (
            <div className="px-4 py-2 rounded-2xl bg-slate-950 border border-slate-800 text-right shrink-0">
              <span className="text-[10px] text-slate-400 font-mono block">Khả năng đạt mục tiêu:</span>
              <span className={`text-xs font-black font-mono ${hasData ? 'text-emerald-400' : 'text-amber-400'}`}>
                {predictionData.probabilityOfReachingTarget}
              </span>
            </div>
          )}
        </div>

        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center space-y-3">
            <div className="w-10 h-10 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin" />
            <span className="text-xs font-mono text-slate-400">Đang tổng hợp dữ liệu học tập thực tế...</span>
          </div>
        ) : (
          <>
            {/* 1. SCORE PREDICTION HERO METRICS */}
            {predictionData && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 relative z-10">
                
                {/* Estimated Total */}
                <div className={`p-4 rounded-2xl bg-slate-950 border ${hasData ? 'border-amber-500/40' : 'border-slate-800'} shadow-lg`}>
                  <span className="text-[10px] font-mono text-amber-400 uppercase font-bold block">Điểm Dự Đoán</span>
                  {hasData ? (
                    <>
                      <div className="text-2xl sm:text-3xl font-black font-heading text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-yellow-300">
                        {predictionData.currentEstimatedScore} <span className="text-xs font-mono text-slate-400">/ 990</span>
                      </div>
                      <span className="text-[10px] text-slate-500 font-mono">
                        Dựa trên {predictionData.totalSessions} bài luyện tập thực tế
                      </span>
                    </>
                  ) : (
                    <>
                      <div className="text-2xl sm:text-3xl font-black font-heading text-slate-500">
                        -- <span className="text-xs font-mono text-slate-600">/ 990</span>
                      </div>
                      <span className="text-[10px] text-amber-400/90 font-mono flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3 shrink-0" />
                        Chưa có bài làm (0 bài)
                      </span>
                    </>
                  )}
                </div>

                {/* Listening Breakdown */}
                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800">
                  <span className="text-[10px] font-mono text-sky-400 uppercase font-bold flex items-center gap-1">
                    <Headphones className="w-3 h-3" />
                    <span>Listening</span>
                  </span>
                  {hasData && predictionData.estimatedListening > 0 ? (
                    <>
                      <div className="text-xl sm:text-2xl font-black font-heading text-white">
                        {predictionData.estimatedListening} <span className="text-xs font-mono text-slate-500">/ 495</span>
                      </div>
                      <span className="text-[10px] text-sky-400/80 font-mono">Part 1-4: Chuẩn ETS</span>
                    </>
                  ) : (
                    <>
                      <div className="text-xl sm:text-2xl font-black font-heading text-slate-500">
                        -- <span className="text-xs font-mono text-slate-600">/ 495</span>
                      </div>
                      <span className="text-[10px] text-slate-500 font-mono">Chưa làm bài Listening</span>
                    </>
                  )}
                </div>

                {/* Reading Breakdown */}
                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800">
                  <span className="text-[10px] font-mono text-emerald-400 uppercase font-bold flex items-center gap-1">
                    <BookOpen className="w-3 h-3" />
                    <span>Reading</span>
                  </span>
                  {hasData && predictionData.estimatedReading > 0 ? (
                    <>
                      <div className="text-xl sm:text-2xl font-black font-heading text-white">
                        {predictionData.estimatedReading} <span className="text-xs font-mono text-slate-500">/ 495</span>
                      </div>
                      <span className="text-[10px] text-emerald-400/80 font-mono">Part 5-7: Chuẩn ETS</span>
                    </>
                  ) : (
                    <>
                      <div className="text-xl sm:text-2xl font-black font-heading text-slate-500">
                        -- <span className="text-xs font-mono text-slate-600">/ 495</span>
                      </div>
                      <span className="text-[10px] text-slate-500 font-mono">Chưa làm bài Reading</span>
                    </>
                  )}
                </div>

                {/* Target Gap */}
                <div className="p-4 rounded-2xl bg-gradient-to-tr from-slate-950 to-slate-900 border border-cyan-500/30">
                  <span className="text-[10px] font-mono text-cyan-400 uppercase font-bold flex items-center gap-1">
                    <Target className="w-3 h-3" />
                    <span>Khoảng Cách Mục Tiêu</span>
                  </span>
                  <div className="text-xl sm:text-2xl font-black font-heading text-cyan-300">
                    {hasData 
                      ? (predictionData.targetGap > 0 ? `-${predictionData.targetGap} PTS` : '✓ ĐÃ ĐẠT')
                      : `${predictionData.targetScore || 650} PTS`
                    }
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono">
                    {hasData 
                      ? `Mục tiêu: ${predictionData.targetScore} PTS`
                      : 'Mục tiêu thiết lập'
                    }
                  </span>
                </div>

              </div>
            )}

            {/* 2. RADAR SPIDER CHART & PART DRILLDOWN (TWO COLUMNS) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center relative z-10">
              
              {/* LEFT: INTERACTIVE SVG RADAR CHART (6 cols) */}
              <div className="lg:col-span-6 flex flex-col items-center justify-center p-4 rounded-3xl bg-slate-950/80 border border-slate-800 relative">
                <span className="text-[11px] font-mono text-slate-400 font-bold uppercase mb-2">
                  🕸️ BẢN ĐỒ MẠNG NHỆN 7 KỸ NĂNG
                </span>

                <div className="relative">
                  <svg width={size} height={size} className="overflow-visible select-none">
                    {/* Concentric Web Polygons (20%, 40%, 60%, 80%, 100%) */}
                    {[20, 40, 60, 80, 100].map((level) => {
                      const points = Array.from({ length: numPoints }).map((_, idx) => {
                        const { x, y } = getCoordinates(idx, level);
                        return `${x},${y}`;
                      }).join(' ');
                      return (
                        <polygon
                          key={level}
                          points={points}
                          fill="none"
                          stroke="#1e293b"
                          strokeWidth="1"
                          strokeDasharray={level === 100 ? 'none' : '3 3'}
                        />
                      );
                    })}

                    {/* Axis lines from center to outer vertices */}
                    {Array.from({ length: numPoints }).map((_, idx) => {
                      const { x, y } = getCoordinates(idx, 100);
                      return (
                        <line
                          key={idx}
                          x1={center}
                          y1={center}
                          x2={x}
                          y2={y}
                          stroke="#334155"
                          strokeWidth="1"
                        />
                      );
                    })}

                    {/* Glowing Student Performance Polygon (Rendered if hasData) */}
                    {hasData ? (
                      <polygon
                        points={polygonPoints}
                        fill="rgba(6, 182, 212, 0.25)"
                        stroke="#06b6d4"
                        strokeWidth="2.5"
                        className="transition-all duration-500 filter drop-shadow-[0_0_8px_rgba(6,182,212,0.6)]"
                      />
                    ) : (
                      // Empty state dashed polygon outline at center
                      <polygon
                        points={polygonPoints}
                        fill="rgba(148, 163, 184, 0.05)"
                        stroke="#475569"
                        strokeWidth="1.5"
                        strokeDasharray="4 4"
                      />
                    )}

                    {/* Data Vertices (Dots) & Labels */}
                    {stats.map((stat, idx) => {
                      const displayAcc = hasData ? stat.accuracy : 0;
                      const { x, y } = getCoordinates(idx, Math.max(5, displayAcc));
                      const labelPos = getCoordinates(idx, 122);
                      const isSelected = activePart?.part === stat.part;

                      return (
                        <g key={stat.part} className="cursor-pointer" onClick={() => setActivePart(stat)}>
                          {/* Vertex Dot */}
                          <circle
                            cx={x}
                            cy={y}
                            r={isSelected ? 6 : 4}
                            fill={hasData 
                              ? (stat.accuracy >= 75 ? '#10b981' : stat.accuracy >= 60 ? '#f59e0b' : '#f43f5e')
                              : '#64748b'
                            }
                            stroke="#ffffff"
                            strokeWidth="1.5"
                            className="transition-all hover:scale-150"
                          />

                          {/* Part Label */}
                          <text
                            x={labelPos.x}
                            y={labelPos.y}
                            fill={isSelected ? '#38bdf8' : '#94a3b8'}
                            fontSize={isSelected ? '11' : '9.5'}
                            fontWeight={isSelected ? 'bold' : 'normal'}
                            fontFamily="monospace"
                            textAnchor="middle"
                            dominantBaseline="central"
                          >
                            {stat.part} {hasData ? `(${stat.accuracy}%)` : ''}
                          </text>
                        </g>
                      );
                    })}
                  </svg>

                  {/* Empty Data Center Badge Overlay */}
                  {!hasData && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none p-4 text-center">
                      <div className="p-3 rounded-2xl bg-slate-950/90 border border-slate-800 backdrop-blur-md shadow-xl max-w-[210px] space-y-1">
                        <Compass className="w-5 h-5 text-cyan-400 mx-auto animate-pulse" />
                        <span className="text-[11px] font-bold text-white block font-heading">
                          Chưa Có Dữ Liệu
                        </span>
                        <p className="text-[9.5px] text-slate-400 leading-tight">
                          Làm bài thi thử hoặc bài tập để AI vẽ mạng nhện năng lực của bạn
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                <span className="text-[10px] text-slate-500 mt-2 font-mono">
                  💡 Bấm vào từng điểm Part để xem phân tích chi tiết bên phải
                </span>
              </div>

              {/* RIGHT: PART DRILLDOWN & BOTTLENECK PRESCRIPTION (6 cols) */}
              <div className="lg:col-span-6 space-y-4">
                
                {/* Active Selected Part Detail Box */}
                {activePart && (
                  <div className="p-5 rounded-3xl bg-slate-950 border border-slate-800 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-black uppercase ${
                          hasData
                            ? (activePart.accuracy >= 75 
                                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40' 
                                : activePart.accuracy >= 60 
                                ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40' 
                                : 'bg-rose-500/20 text-rose-400 border border-rose-500/40')
                            : 'bg-slate-800 text-slate-300 border border-slate-700'
                        }`}>
                          {activePart.part} • {activePart.name}
                        </span>
                      </div>

                      <span className="text-xl font-black font-mono text-white">
                        {hasData ? `${activePart.accuracy}%` : 'Chưa làm'}
                      </span>
                    </div>

                    <p className="text-xs text-slate-300 leading-relaxed">
                      {activePart.description}
                    </p>

                    {/* Progress bar */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-[10px] font-mono text-slate-400">
                        <span>Độ chính xác hiện tại</span>
                        <span>{hasData ? `${activePart.correct || 0}/${activePart.attempted || 0} câu đúng` : 'Mục tiêu: 80%+'}</span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-slate-850 overflow-hidden">
                        <div 
                          className={`h-full rounded-full transition-all duration-500 ${
                            hasData
                              ? (activePart.accuracy >= 75 ? 'bg-emerald-500' : activePart.accuracy >= 60 ? 'bg-amber-500' : 'bg-rose-500')
                              : 'bg-slate-700'
                          }`}
                          style={{ width: `${hasData ? activePart.accuracy : 0}%` }}
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* DYNAMIC VIEW: IF HAS DATA -> TOP BOTTLENECKS; IF NEW USER -> STARTER ROADMAP */}
                {hasData ? (
                  <div className="space-y-2">
                    <span className="text-xs font-extrabold text-rose-400 uppercase tracking-wider flex items-center gap-1.5">
                      <AlertTriangle className="w-4 h-4" />
                      <span>Top Điểm Nghẽn Cần Bứt Phá Ngay:</span>
                    </span>

                    <div className="space-y-2">
                      {predictionData?.bottlenecks?.length > 0 ? (
                        predictionData.bottlenecks.map((item) => (
                          <div key={item.part} className="p-3.5 rounded-2xl bg-slate-950/80 border border-rose-500/20 flex items-center justify-between gap-3">
                            <div className="space-y-0.5 max-w-[280px]">
                              <div className="flex items-center gap-1.5">
                                <span className="text-xs font-bold text-white">{item.part}: {item.name}</span>
                                <span className="text-[10px] font-mono font-bold text-amber-400">+{item.potentialScoreGain} pts</span>
                              </div>
                              <p className="text-[11px] text-slate-400 line-clamp-1">{item.advice}</p>
                            </div>

                            <Link
                              to={item.practiceUrl}
                              onClick={onClose}
                              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-sky-500 hover:text-slate-950 text-sky-400 font-bold text-[11px] flex items-center gap-1 transition-all shrink-0 cursor-pointer"
                            >
                              <span>Luyện ngay</span>
                              <ChevronRight className="w-3.5 h-3.5" />
                            </Link>
                          </div>
                        ))
                      ) : (
                        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs">
                          🎉 Phong độ rất tốt! Bạn không có điểm nghẽn nghiêm trọng nào (tất cả các Part đều đạt trên 75%).
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  /* STARTER ROADMAP FOR NEW USERS (0 SESSIONS) */
                  <div className="p-5 rounded-3xl bg-slate-950/90 border border-cyan-500/30 space-y-3">
                    <div className="flex items-center gap-2 text-cyan-400">
                      <Sparkles className="w-4 h-4" />
                      <span className="text-xs font-extrabold uppercase tracking-wide font-heading">
                        Lộ Trình Bắt Đầu Nhanh Dành Cho Bạn
                      </span>
                    </div>

                    <p className="text-xs text-slate-300 leading-relaxed">
                      Hãy hoàn thành 1 bài tập hoặc đề thi bất kỳ. Hệ thống sẽ tự động tổng hợp câu đúng/sai, đo độ chính xác 7 kỹ năng và phát hiện điểm nghẽn của bạn!
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                      <Link
                        to="/tests"
                        onClick={onClose}
                        className="p-3 rounded-2xl bg-cyan-500/10 hover:bg-cyan-500 text-cyan-400 hover:text-slate-950 border border-cyan-500/30 font-bold text-xs flex items-center justify-between transition-all cursor-pointer"
                      >
                        <span className="flex items-center gap-1.5">
                          <Compass className="w-3.5 h-3.5" />
                          <span>Thi thử ETS Full</span>
                        </span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>

                      <Link
                        to="/listen"
                        onClick={onClose}
                        className="p-3 rounded-2xl bg-sky-500/10 hover:bg-sky-500 text-sky-400 hover:text-slate-950 border border-sky-500/30 font-bold text-xs flex items-center justify-between transition-all cursor-pointer"
                      >
                        <span className="flex items-center gap-1.5">
                          <Headphones className="w-3.5 h-3.5" />
                          <span>Luyện Nghe Part 1-4</span>
                        </span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>

                      <Link
                        to="/read"
                        onClick={onClose}
                        className="p-3 rounded-2xl bg-emerald-500/10 hover:bg-emerald-500 text-emerald-400 hover:text-slate-950 border border-emerald-500/30 font-bold text-xs flex items-center justify-between transition-all cursor-pointer sm:col-span-2"
                      >
                        <span className="flex items-center gap-1.5">
                          <BookOpen className="w-3.5 h-3.5" />
                          <span>Luyện Đọc & Ngữ Pháp Part 5-7</span>
                        </span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>
                )}

              </div>

            </div>
          </>
        )}

        {/* Footer Action */}
        <div className="pt-2 flex items-center justify-between border-t border-slate-800 text-xs">
          <span className="text-slate-400">
            Tường Tận TOEIC AI Score Predictor • Cập nhật theo thời gian thực
          </span>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold transition-all cursor-pointer"
          >
            Đóng
          </button>
        </div>

      </div>
    </div>
  );
}
