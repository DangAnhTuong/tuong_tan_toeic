import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { 
  BookOpen, Play, ChevronLeft, Target, Sparkles, CheckCircle2, 
  RotateCcw, ArrowRight, Award, ChevronRight, Clock, Zap, 
  AlertTriangle, Star, FileText, Crown, PanelLeftClose, PanelLeftOpen, ArrowLeft
} from 'lucide-react';
import axios from 'axios';
import { getStoredUser } from '../utils/auth';
import DauSavingProgressOverlay from '../components/DauSavingProgressOverlay';
import { savePracticeProgress, getSingleProgress } from '../services/practiceProgressService';

// ── Bold/code inline helper ────────────────────────────────────────────────
function iFmt(s) {
  return s
    .replace(/\*\*(.*?)\*\*/g, '<strong class="dark:text-white text-slate-900 font-bold">$1</strong>')
    .replace(/`(.*?)`/g, '<code class="dark:bg-emerald-950 bg-emerald-50 text-emerald-700 dark:text-emerald-300 px-1.5 py-0.5 rounded text-[11px] font-mono border dark:border-emerald-800 border-emerald-200">$1</code>');
}
// Color scheme per grammar category
function secColor(title) {
  const t = (title||'').toLowerCase();
  if (t.includes('danh từ')||t.includes('noun'))    return {bg:'dark:bg-blue-950/50 bg-blue-50/70',border:'dark:border-blue-600/40 border-blue-200',hBg:'dark:bg-blue-900/50 bg-blue-100/70 dark:text-blue-200 text-blue-900',dot:'bg-blue-500'};
  if (t.includes('tính từ')||t.includes('adjective'))return {bg:'dark:bg-amber-950/40 bg-amber-50/70',border:'dark:border-amber-600/40 border-amber-200',hBg:'dark:bg-amber-900/40 bg-amber-100/70 dark:text-amber-200 text-amber-900',dot:'bg-amber-500'};
  if (t.includes('trạng từ')||t.includes('adverb'))  return {bg:'dark:bg-purple-950/40 bg-purple-50/70',border:'dark:border-purple-600/40 border-purple-200',hBg:'dark:bg-purple-900/40 bg-purple-100/70 dark:text-purple-200 text-purple-900',dot:'bg-purple-500'};
  if (t.includes('động từ')||t.includes('verb'))     return {bg:'dark:bg-emerald-950/40 bg-emerald-50/70',border:'dark:border-emerald-600/40 border-emerald-200',hBg:'dark:bg-emerald-900/40 bg-emerald-100/70 dark:text-emerald-200 text-emerald-900',dot:'bg-emerald-500'};
  if (t.includes('đại từ')||t.includes('pronoun'))   return {bg:'dark:bg-rose-950/40 bg-rose-50/70',border:'dark:border-rose-600/40 border-rose-200',hBg:'dark:bg-rose-900/40 bg-rose-100/70 dark:text-rose-200 text-rose-900',dot:'bg-rose-500'};
  return {bg:'dark:bg-slate-900/60 bg-slate-50',border:'dark:border-slate-700 border-slate-200',hBg:'dark:bg-slate-800 bg-slate-100 dark:text-slate-200 text-slate-800',dot:'bg-slate-500'};
}

// Beautiful block-based markdown renderer
function parseMarkdown(text) {
  if (!text) return null;
  const lines = text.split('\n');
  const blocks = [];
  let i = 0;
  let bk = 0;

  while (i < lines.length) {
    const line = lines[i];

    // ### → Color-coded card section (groups bullets until next heading)
    if (line.startsWith('### ')) {
      const title = line.slice(4).trim();
      const col = secColor(title);
      const items = [];
      i++;
      while (i < lines.length && !lines[i].startsWith('##')) {
        items.push(lines[i]);
        i++;
      }
      // Filter out empties at end
      while (items.length && !items[items.length-1].trim()) items.pop();

      blocks.push(
        <div key={bk++} className={`rounded-2xl border ${col.border} ${col.bg} overflow-hidden my-3`}>
          <div className={`px-4 py-2.5 ${col.hBg} flex items-center gap-2.5 font-bold text-sm border-b ${col.border}`}>
            <span className={`w-2.5 h-2.5 rounded-full ${col.dot} shrink-0`}></span>
            <span dangerouslySetInnerHTML={{__html: iFmt(title)}} />
          </div>
          <div className="px-4 py-3 space-y-0.5">
            {items.map((item, ii) => {
              if (!item.trim()) return <div key={ii} className="h-1.5" />;
              // Sub-group label (emoji prefix inside section)
              if (/^[👥📦🔵🟠🟢✨⚡🏷🔹🔸]/.test(item.trim())) {
                return <div key={ii} className="text-xs font-bold text-slate-400 uppercase tracking-wider pt-3 pb-1">{item.trim()}</div>;
              }
              const raw = item.replace(/^[\-\*]\s*/, '').trim();
              // Suffix table row: "-tion  creation (ý nghĩa)" — 2+ spaces between
              const sfx = raw.match(/^(-[\w,\/ ]+?)\s{2,}(.+)$/);
              if (sfx) {
                return (
                  <div key={ii} className="flex items-start gap-3 py-2 border-b border-white/5 last:border-0">
                    <code className="shrink-0 text-xs font-mono font-bold text-emerald-300 bg-emerald-950/70 px-2.5 py-1 rounded-lg border border-emerald-800/60 min-w-[80px] text-center">
                      {sfx[1].trim()}
                    </code>
                    <span className="text-sm text-slate-300 leading-relaxed pt-0.5" dangerouslySetInnerHTML={{__html: iFmt(sfx[2])}} />
                  </div>
                );
              }
              // Normal bullet inside section
              return (
                <div key={ii} className="flex items-start gap-2.5 py-1.5">
                  <span className={`w-1.5 h-1.5 rounded-full ${col.dot} opacity-70 shrink-0 mt-2`}></span>
                  <span className="text-sm text-slate-300 leading-relaxed" dangerouslySetInnerHTML={{__html: iFmt(raw)}} />
                </div>
              );
            })}
          </div>
        </div>
      );
      continue;
    }

    // ## → bold divider heading
    if (line.startsWith('## ')) {
      blocks.push(
        <h2 key={bk++} className="text-base font-extrabold text-white mt-6 mb-1 flex items-center gap-2.5 pt-4 border-t border-slate-800">
          <span className="w-1 h-6 bg-emerald-400 rounded-full shrink-0"></span>
          {line.slice(3).trim()}
        </h2>
      );
      i++; continue;
    }

    // # → page title
    if (line.startsWith('# ')) {
      blocks.push(
        <h1 key={bk++} className="text-lg font-black text-white mb-3 pb-3 border-b border-slate-700">{line.slice(2).trim()}</h1>
      );
      i++; continue;
    }

    // Callout line (emoji at start: 👉 💡 ⚠️ ✅ 🔑 🔍 🛠 📝 ✏️ 🔢 🏷)
    if (/^[👉💡⚠️✅🔑🔍🛠📝✏️🔢🏷]/.test(line.trim())) {
      blocks.push(
        <div key={bk++} className="my-2 px-4 py-3 rounded-xl bg-blue-950/50 border border-blue-700/40 text-sm text-blue-100 leading-relaxed font-medium">
          {line.trim()}
        </div>
      );
      i++; continue;
    }

    // Numbered item with sub-bullets
    if (/^\d+\.\s/.test(line)) {
      const m = line.match(/^(\d+)\.\s*(.*)/);
      if (m) {
        const num = m[1]; const content = m[2];
        const subs = [];
        i++;
        while (i < lines.length && /^[\s]*([\-\*]|\s{2,})/.test(lines[i]) && !lines[i].startsWith('###') && !lines[i].startsWith('##')) {
          if (lines[i].trim()) subs.push(lines[i].trim().replace(/^[\-\*]\s*/,''));
          i++;
        }
        blocks.push(
          <div key={bk++} className="rounded-xl border border-slate-800 bg-slate-900/50 p-4 my-2 space-y-2">
            <div className="flex items-start gap-3">
              <span className="w-7 h-7 rounded-full bg-emerald-500 text-slate-950 text-sm font-black flex items-center justify-center shrink-0 mt-0.5">{num}</span>
              <span className="text-sm font-bold text-white leading-relaxed" dangerouslySetInnerHTML={{__html: iFmt(content)}} />
            </div>
            {subs.length > 0 && (
              <div className="ml-10 space-y-1.5 border-l-2 border-slate-700 pl-4 pt-1">
                {subs.map((sub, si) => (
                  <div key={si} className="flex items-start gap-2">
                    <span className="text-slate-600 text-xs shrink-0 mt-1">▸</span>
                    <span className="text-sm text-slate-300 leading-relaxed" dangerouslySetInnerHTML={{__html: iFmt(sub)}} />
                  </div>
                ))}
              </div>
            )}
          </div>
        );
        continue;
      }
    }

    // Standalone bullet
    if (/^[\-\*]\s/.test(line)) {
      blocks.push(
        <div key={bk++} className="flex items-start gap-2.5 py-1">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0 mt-2"></span>
          <span className="text-sm text-slate-300 leading-relaxed" dangerouslySetInnerHTML={{__html: iFmt(line.slice(2))}} />
        </div>
      );
      i++; continue;
    }

    // Empty
    if (!line.trim()) { blocks.push(<div key={bk++} className="h-2" />); i++; continue; }

    // Regular paragraph
    blocks.push(
      <p key={bk++} className="text-sm text-slate-300 leading-relaxed py-0.5" dangerouslySetInnerHTML={{__html: iFmt(line)}} />
    );
    i++;
  }
  return blocks;
}

// Sub-lesson map: title → sub-lessons array
const SUBLESSO_MAP = {
  'Danh từ': [
    {name:'Từ hạn định và cụm danh từ',total:10,isFree:true,from:0,to:9},
    {name:'Cách chọn danh từ dựa vào vị trí',total:10,isFree:true,from:10,to:19},
    {name:'Hai danh từ đứng cạnh nhau',total:5,isFree:true,from:20,to:24},
    {name:'Danh từ số ít không đứng một mình',total:14,isFree:true,from:25,to:38},
    {name:'Danh từ có đuôi -al và -ive',total:3,isFree:false,from:39,to:41},
    {name:'Bài tập tổng hợp về danh từ 1',total:15,isFree:true,from:42,to:56},
    {name:'Bài tập tổng hợp về danh từ 2',total:5,isFree:false,from:57,to:61},
  ],
  'Kiến thức ngữ pháp cơ bản': [
    {name:'Hậu tố từ loại (Word Suffixes)',total:15,isFree:true,from:0,to:14},
    {name:'Cách nhận biết câu từ loại',total:15,isFree:true,from:15,to:29},
    {name:'Cấu trúc câu cơ bản',total:10,isFree:true,from:30,to:39},
    {name:'Từ loại thông dụng tổng hợp',total:10,isFree:false,from:40,to:49},
  ],
  'Động từ': [
    {name:'Phân biệt thì động từ',total:12,isFree:true,from:0,to:11},
    {name:'Động từ khuyết thiếu',total:11,isFree:true,from:12,to:22},
    {name:'Dạng động từ (V-ing / to V)',total:12,isFree:false,from:23,to:34},
    {name:'Bài tập động từ tổng hợp',total:10,isFree:false,from:35,to:44},
  ],
  'Câu chủ động và câu bị động': [
    {name:'Cấu trúc bị động cơ bản',total:10,isFree:true,from:0,to:9},
    {name:'Bị động với get / have',total:10,isFree:false,from:10,to:19},
  ],
  'Tính từ': [
    {name:'Phân biệt tính từ và trạng từ',total:15,isFree:true,from:0,to:14},
    {name:'Tính từ so sánh',total:15,isFree:true,from:15,to:29},
    {name:'Tính từ ghép trong TOEIC',total:15,isFree:false,from:30,to:44},
  ],
  'Trạng từ': [
    {name:'Trạng từ chỉ cách thức',total:16,isFree:true,from:0,to:15},
    {name:'Trạng từ chỉ tần suất',total:16,isFree:true,from:16,to:31},
    {name:'Trạng từ kết nối câu',total:16,isFree:false,from:32,to:47},
  ],
  'Đại từ': [
    {name:'Đại từ nhân xưng và sở hữu',total:17,isFree:true,from:0,to:16},
    {name:'Đại từ phản thân',total:16,isFree:true,from:17,to:32},
    {name:'Đại từ bất định',total:17,isFree:false,from:33,to:49},
  ],
  'Câu so sánh': [
    {name:'So sánh hơn và kém',total:13,isFree:true,from:0,to:12},
    {name:'So sánh nhất',total:13,isFree:true,from:13,to:25},
    {name:'So sánh bằng (as...as)',total:12,isFree:false,from:26,to:37},
  ],
  'Liên từ và giới từ': [
    {name:'Giới từ chỉ thời gian',total:12,isFree:true,from:0,to:11},
    {name:'Liên từ kết hợp',total:12,isFree:false,from:12,to:23},
  ],
  'Mệnh đề quan hệ': [
    {name:'Mệnh đề quan hệ xác định',total:20,isFree:true,from:0,to:19},
    {name:'Mệnh đề quan hệ không xác định',total:20,isFree:false,from:20,to:39},
  ],
  'Bài tập từ loại': [
    {name:'Bài tập từ loại cơ bản',total:25,isFree:true,from:0,to:24},
    {name:'Bài tập từ loại nâng cao',total:25,isFree:false,from:25,to:49},
  ],
  'Bài tập động từ hỗn hợp': [
    {name:'Động từ hỗn hợp Nhóm 1',total:15,isFree:true,from:0,to:14},
    {name:'Động từ hỗn hợp Nhóm 2',total:15,isFree:false,from:15,to:29},
  ],
  'Bài tập ngữ pháp tổng hợp': [
    {name:'Tổng hợp ngữ pháp Nhóm 1',total:20,isFree:true,from:0,to:19},
    {name:'Tổng hợp ngữ pháp Nhóm 2',total:20,isFree:false,from:20,to:39},
    {name:'Tổng hợp ngữ pháp Nhóm 3',total:20,isFree:false,from:40,to:59},
  ],
  'Câu hỏi từ đề thi thật': [
    {name:'Đề thi thật Nhóm 1 (1-50)',total:50,isFree:true,from:0,to:49},
    {name:'Đề thi thật Nhóm 2 (51-100)',total:50,isFree:false,from:50,to:99},
    {name:'Đề thi thật Nhóm 3 (101-150)',total:50,isFree:false,from:100,to:149},
    {name:'Đề thi thật Nhóm 4 (151-200)',total:50,isFree:false,from:150,to:199},
    {name:'Đề thi thật Nhóm 5 (201-250)',total:50,isFree:false,from:200,to:249},
    {name:'Đề thi thật Nhóm 6 (251-300)',total:50,isFree:false,from:250,to:299},
    {name:'Đề thi thật Nhóm 7 (301-435)',total:135,isFree:false,from:300,to:434},
  ],
};

export default function GrammarLesson() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [activeTab, setActiveTab] = useState('lesson');
  const [showSidebar, setShowSidebar] = useState(true);
  const [lessonData, setLessonData] = useState(null);
  const [allTopics, setAllTopics] = useState([]);
  const [loading, setLoading] = useState(true);

  // Practice one-by-one
  const [currentQIdx, setCurrentQIdx] = useState(0);
  const [answeredQ, setAnsweredQ] = useState({});
  const [timerOn, setTimerOn] = useState(false);
  const [speedMode, setSpeedMode] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [bookmarked, setBookmarked] = useState({});

  useEffect(() => {
    if (!timerOn) return;
    const t = setInterval(() => setElapsed(e => e + 1), 1000);
    return () => clearInterval(t);
  }, [timerOn]);

  const fmt = (s) => `${String(Math.floor(s/60)).padStart(2,'0')}:${String(s%60).padStart(2,'0')}`;

  useEffect(() => {
    axios.get('/api/v1/reading/exercises?mode=grammar')
      .then(r => { if(r.data?.data) setAllTopics(r.data.data); })
      .catch(()=>{});
  }, []);

  const [isSavingProgress, setIsSavingProgress] = useState(false);
  const computedExerciseKey = `grammar_${id}`;
  const [hasRestored, setHasRestored] = useState(false);

  useEffect(() => {
    async function load() {
      setLoading(true);
      setTimerOn(false);
      try {
        let res;
        if (id && id.length === 24) res = await axios.get(`/api/v1/reading/exercises/${id}`);
        else {
          res = await axios.get(`/api/v1/reading/exercises?mode=grammar`);
          const found = res.data?.data?.find(g => g.grammarTopic===id || g._id===id);
          if (found) res = {data:{data:found}};
        }
        if (res?.data?.data) setLessonData(res.data.data);
      } catch(e) { console.warn(e.message); }
      finally { setLoading(false); }
    }
    load();
  }, [id]);

  // Auto-restore grammar practice progress from practiceProgressService
  useEffect(() => {
    if (lessonData?.questions?.length > 0 && !hasRestored) {
      async function restore() {
        try {
          const saved = await getSingleProgress(computedExerciseKey);
          if (saved) {
            if (saved.userAnswersMap && typeof saved.userAnswersMap === 'object') {
              setAnsweredQ(saved.userAnswersMap);
            }
            // Resume to first unanswered question
            let resumeIdx = 0;
            if (saved.userAnswersMap) {
              for (let i = 0; i < lessonData.questions.length; i++) {
                if (saved.userAnswersMap[i] === undefined) {
                  resumeIdx = i;
                  break;
                }
              }
            }
            setCurrentQIdx(resumeIdx);
          }
        } catch (e) {
          console.warn('Failed to restore grammar progress:', e);
        } finally {
          setHasRestored(true);
        }
      }
      restore();
    }
  }, [lessonData, computedExerciseKey, hasRestored]);

  // Sync grammar practice progress
  const syncGrammarProgress = async (nextAnswers) => {
    const ans = nextAnswers || answeredQ;
    const qs = lessonData?.questions || [];
    const answeredCount = Object.keys(ans).length;
    let cor = 0;
    let wrg = 0;
    const wrongList = [];

    qs.forEach((q, idx) => {
      const userAns = ans[idx];
      if (userAns !== undefined) {
        const cleanUser = String(userAns || '').replace(/[\(\)]/g, '').trim().toUpperCase();
        const cleanCor = String(q?.correctAnswer || '').replace(/[\(\)]/g, '').trim().toUpperCase();
        const isCor = cleanUser === cleanCor || q?.options?.find(o => String(o.label || '').replace(/[\(\)]/g, '').trim().toUpperCase() === cleanUser)?.isCorrect;
        if (isCor) {
          cor++;
        } else {
          wrg++;
          wrongList.push({
            questionId: q._id || idx,
            userAnswer: userAns,
            promptText: q.questionText || q.prompt || ''
          });
        }
      }
    });

    let nextIdx = 0;
    for (let i = 0; i < qs.length; i++) {
      if (ans[i] === undefined) {
        nextIdx = i;
        break;
      }
    }

    await savePracticeProgress({
      category: 'reading',
      part: 'Grammar',
      level: 1,
      exerciseKey: computedExerciseKey,
      totalQuestions: qs.length,
      completedCount: answeredCount,
      correctCount: cor,
      wrongCount: wrg,
      currentQuestionIdx: nextIdx,
      userAnswersMap: ans,
      wrongQuestions: wrongList
    });
  };

  const handleExitToGrammar = async () => {
    setIsSavingProgress(true);
    try {
      await syncGrammarProgress();
    } catch (e) {}
    setTimeout(() => {
      setIsSavingProgress(false);
      navigate('/read?mode=grammar');
    }, 1200);
  };

  const handleResetGrammar = () => {
    setCurrentQIdx(0);
    setAnsweredQ({});
    setElapsed(0);
    syncGrammarProgress({}).catch(() => {});
  };

  const questions = lessonData?.questions || [];
  const totalQ = questions.length;
  const currentQ = questions[currentQIdx];
  const subLessons = SUBLESSO_MAP[lessonData?.title] || null;

  const practiceScrollRef = useRef(null);

  const handlePrev = () => {
    if (currentQIdx > 0) {
      setCurrentQIdx(prev => prev - 1);
      practiceScrollRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleNext = () => {
    if (currentQIdx < totalQ - 1) {
      setCurrentQIdx(prev => prev + 1);
      practiceScrollRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  useEffect(() => {
    practiceScrollRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentQIdx]);

  useEffect(() => {
    if (activeTab !== 'practice') return;
    const handleKeyDown = (e) => {
      if (['INPUT', 'TEXTAREA'].includes(e.target?.tagName)) return;
      if (e.key === 'ArrowLeft') {
        handlePrev();
      } else if (e.key === 'ArrowRight' || (e.key === 'Enter' && answeredQ[currentQIdx] !== undefined)) {
        handleNext();
      } else if (['1', '2', '3', '4'].includes(e.key)) {
        const labels = ['A', 'B', 'C', 'D'];
        const opt = currentQ?.options?.[parseInt(e.key) - 1];
        if (opt) handleAnswer(labels[parseInt(e.key) - 1]);
      } else if (['a', 'b', 'c', 'd', 'A', 'B', 'C', 'D'].includes(e.key)) {
        handleAnswer(e.key.toUpperCase());
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeTab, currentQIdx, totalQ, answeredQ, currentQ]);

  const handleAnswer = (label) => {
    if (answeredQ[currentQIdx] !== undefined) return;
    const clean = String(label || '').replace(/[\(\)]/g, '').trim().toUpperCase();
    const nextAnswers = { ...answeredQ, [currentQIdx]: clean };
    setAnsweredQ(nextAnswers);
    syncGrammarProgress(nextAnswers).catch(() => {});
    if (speedMode && currentQIdx < totalQ - 1) setTimeout(() => setCurrentQIdx(i=>i+1), 700);
  };

  const correctCount = Object.keys(answeredQ).filter(i => {
    const userAns = String(answeredQ[i] || '').replace(/[\(\)]/g, '').trim().toUpperCase();
    const cor = String(questions[i]?.correctAnswer || '').replace(/[\(\)]/g, '').trim().toUpperCase();
    return userAns === cor || questions[i]?.options?.find(o => String(o.label || '').replace(/[\(\)]/g, '').trim().toUpperCase() === userAns)?.isCorrect;
  }).length;
  const answeredCount = Object.keys(answeredQ).length;

  if (loading) return (
    <div className="min-h-screen dark:bg-slate-950 bg-[#f8fafc] dark:text-slate-100 text-slate-800 flex flex-col font-sans">
      <Navbar />
      <div className="flex-1 flex items-center justify-center dark:text-slate-400 text-slate-600 font-medium animate-pulse">Đang tải bài học ngữ pháp...</div>
    </div>
  );

  return (
    <div className="min-h-screen dark:bg-[#0b1120] bg-[#f8fafc] dark:text-slate-100 text-slate-900 flex flex-col font-sans" style={{height:'100vh',overflow:'hidden'}}>
      <Navbar />

      {/* Toolbar */}
      <div className="h-12 dark:bg-slate-900/90 bg-white/90 border-b dark:border-slate-800 border-slate-200 px-4 flex items-center justify-between text-xs sticky top-0 z-30 backdrop-blur-md shrink-0">
        <div className="flex items-center gap-3">
          <button onClick={()=>setShowSidebar(!showSidebar)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg dark:bg-slate-800 bg-slate-100 dark:hover:bg-slate-700 hover:bg-slate-200 dark:text-slate-300 text-slate-700 font-semibold transition-colors border border-slate-200 dark:border-transparent">
            {showSidebar ? <PanelLeftClose className="w-4 h-4 text-emerald-500"/> : <PanelLeftOpen className="w-4 h-4 text-emerald-500"/>}
            <span>{showSidebar ? 'Ẩn sidebar' : 'Hiện danh sách bài'}</span>
          </button>
          <span className="dark:text-slate-600 text-slate-300 hidden sm:inline">|</span>
          <span className="dark:text-white text-slate-900 font-bold hidden sm:inline truncate max-w-xs">{lessonData?.title}</span>
        </div>
        <button onClick={handleExitToGrammar} className="flex items-center gap-1 dark:text-slate-400 text-slate-600 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer">
          <ArrowLeft className="w-4 h-4"/> <span>Quay lại Ngữ pháp</span>
        </button>
      </div>

      {/* Body */}
      <div className="flex flex-1 overflow-hidden">

        {/* LEFT SIDEBAR */}
        {showSidebar && (
          <aside className="w-72 shrink-0 border-r dark:border-slate-800 border-slate-200 dark:bg-slate-900/70 bg-white flex flex-col overflow-hidden">
            <div className="px-4 py-3 border-b dark:border-slate-800 border-slate-200 flex items-center justify-between shrink-0 dark:bg-slate-900/95 bg-slate-50/90">
              <span className="text-[11px] font-bold dark:text-slate-400 text-slate-600 uppercase tracking-wider truncate pr-2">
                {subLessons ? lessonData?.title : 'Danh sách chuyên đề'}
              </span>
              <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 font-bold shrink-0">
                {subLessons ? subLessons.length : allTopics.length} bài
              </span>
            </div>

            <div className="overflow-y-auto flex-1 p-2 space-y-1">
              {subLessons ? subLessons.map((sub, idx) => {
                const isRangeActive = activeTab==='practice' && currentQIdx>=sub.from && currentQIdx<=sub.to;
                return (
                  <button key={idx}
                    onClick={()=>{ setActiveTab('practice'); setCurrentQIdx(sub.from); }}
                    className={`w-full text-left p-3 rounded-xl border transition-all group ${isRangeActive ? 'bg-emerald-500/15 border-emerald-500 shadow-md text-emerald-600 dark:text-emerald-300' : 'dark:bg-slate-900/60 bg-slate-50/80 dark:border-slate-800 border-slate-200 hover:bg-white dark:hover:bg-slate-800 hover:border-slate-300 dark:hover:border-slate-700'}`}
                  >
                    <div className="flex items-start gap-2.5">
                      <span className={`w-7 h-7 rounded-full text-[10px] font-black flex items-center justify-center shrink-0 mt-0.5 ${isRangeActive ? 'bg-emerald-500 text-white' : 'dark:bg-slate-800 bg-slate-200 dark:text-slate-400 text-slate-600'}`}>
                        {String(idx+1).padStart(2,'0')}
                      </span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1 mb-0.5">
                          <span className={`text-xs font-semibold leading-tight line-clamp-2 ${isRangeActive ? 'text-emerald-600 dark:text-emerald-300 font-bold' : 'dark:text-slate-300 text-slate-700 group-hover:text-emerald-600 dark:group-hover:text-white'}`}>{sub.name}</span>
                          {sub.isFree
                            ? <span className="shrink-0 ml-1 px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-[9px] font-bold border border-emerald-500/30">FREE</span>
                            : <span className="shrink-0 ml-1 px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-600 dark:text-amber-400 text-[9px] font-bold border border-amber-500/30 flex items-center gap-0.5"><Crown className="w-2.5 h-2.5"/>PRO</span>
                          }
                        </div>
                        <span className="text-[10px] dark:text-slate-600 text-slate-400 font-mono">{sub.total} câu</span>
                      </div>
                    </div>
                  </button>
                );
              }) : allTopics.map((top, idx) => {
                const isActive = top._id === lessonData?._id;
                return (
                  <button key={top._id||idx} onClick={()=>navigate(`/grammar/${top._id}`)}
                    className={`w-full text-left p-3 rounded-xl border transition-all group ${isActive ? 'bg-emerald-500/15 border-emerald-500' : 'dark:bg-slate-900/60 bg-slate-50/80 dark:border-slate-800 border-slate-200 hover:bg-white dark:hover:bg-slate-800 hover:border-slate-300 dark:hover:border-slate-700'}`}
                  >
                    <div className="flex items-center gap-2.5">
                      <span className={`w-7 h-7 rounded-full text-[10px] font-black flex items-center justify-center shrink-0 ${isActive ? 'bg-emerald-500 text-white' : 'dark:bg-slate-800 bg-slate-200 dark:text-slate-400 text-slate-600'}`}>{String(idx+1).padStart(2,'0')}</span>
                      <div className="flex-1 min-w-0">
                        <span className={`text-xs font-semibold line-clamp-1 ${isActive ? 'text-emerald-600 dark:text-emerald-300 font-bold' : 'dark:text-slate-300 text-slate-700 group-hover:text-emerald-600 dark:group-hover:text-white'}`}>{top.title}</span>
                        <span className="block text-[10px] dark:text-slate-600 text-slate-400 font-mono">{top.questions?.length||0} câu</span>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </aside>
        )}

        {/* MAIN */}
        <main className="flex-1 flex flex-col overflow-hidden relative min-w-0">
          <div ref={practiceScrollRef} className="flex-1 overflow-y-auto">
            <div className="max-w-3xl mx-auto px-4 sm:px-8 py-6 space-y-5 pb-32 sm:pb-36">

              {/* Tabs */}
              <div className="flex justify-center">
                <div className="flex items-center gap-1 p-1 rounded-2xl dark:bg-slate-900 bg-slate-100 border dark:border-slate-800 border-slate-200 shadow-sm">
                  {[{id:'lesson',icon:BookOpen,label:'Bài học'},{id:'practice',icon:Play,label:`Luyện tập (${totalQ})`}].map(t=>(
                    <button key={t.id} onClick={()=>setActiveTab(t.id)}
                      className={`px-6 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${activeTab===t.id ? 'dark:bg-slate-800 bg-white dark:text-white text-slate-900 shadow-md font-extrabold' : 'dark:text-slate-400 text-slate-600 hover:text-slate-900 dark:hover:text-white'}`}
                    >
                      <t.icon className="w-3.5 h-3.5"/> {t.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* BÀI HỌC */}
              {activeTab==='lesson' && (
                <div className="dark:bg-slate-900/60 bg-white border dark:border-slate-800 border-slate-200 shadow-xl rounded-3xl p-8 space-y-5 animate-fadeIn">
                  <div className="space-y-3 border-b dark:border-slate-800 border-slate-200 pb-5">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-bold uppercase border border-emerald-500/30">
                      <Target className="w-3.5 h-3.5"/> <span>CHUYÊN ĐỀ NGỮ PHÁP TRỌNG ĐIỂM</span>
                    </div>
                    <h1 className="text-2xl md:text-3xl font-extrabold font-heading dark:text-white text-slate-900">{lessonData?.title}</h1>
                    {lessonData?.subTitle && <p className="text-sm dark:text-slate-400 text-slate-600">{lessonData.subTitle}</p>}
                  </div>

                  <div className="space-y-1">
                    {lessonData?.grammarTheory?.theoryMarkdown
                      ? parseMarkdown(lessonData.grammarTheory.theoryMarkdown)
                      : <p className="text-sm dark:text-slate-400 text-slate-600 leading-relaxed">Nội dung lý thuyết ngữ pháp cho chuyên đề <strong className="dark:text-white text-slate-900">{lessonData?.title}</strong>. Hãy nắm vững các cấu trúc và công thức.</p>
                    }
                  </div>

                  <div className="flex justify-end pt-3 border-t dark:border-slate-800 border-slate-200">
                    <button onClick={()=>setActiveTab('practice')} className="px-6 py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-sm flex items-center gap-2 shadow-lg shadow-emerald-500/20 transition-all active:scale-95 cursor-pointer">
                      <span>Làm bài tập trắc nghiệm ({totalQ} câu)</span> <ArrowRight className="w-4 h-4"/>
                    </button>
                  </div>
                </div>
              )}

              {/* LUYỆN TẬP */}
              {activeTab==='practice' && (
                <div className="space-y-4 animate-fadeIn">
                  {/* Toolbar — như Đậu TOEIC */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <button onClick={()=>setTimerOn(!timerOn)} className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl border text-xs font-bold transition-all ${timerOn ? 'bg-blue-500/20 border-blue-500 text-blue-600 dark:text-blue-300' : 'dark:bg-slate-900 bg-white dark:border-slate-800 border-slate-200 dark:text-slate-400 text-slate-600 hover:text-slate-900 dark:hover:text-slate-200 hover:border-slate-300 dark:hover:border-slate-700 shadow-sm'}`}>
                        <Clock className="w-3.5 h-3.5"/> Ghi thời gian{timerOn ? ` · ${fmt(elapsed)}` : ''}
                      </button>
                      <button onClick={()=>setSpeedMode(!speedMode)} className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl border text-xs font-bold transition-all ${speedMode ? 'bg-amber-500/20 border-amber-500 text-amber-600 dark:text-amber-300' : 'dark:bg-slate-900 bg-white dark:border-slate-800 border-slate-200 dark:text-slate-400 text-slate-600 hover:text-slate-900 dark:hover:text-slate-200 hover:border-slate-300 dark:hover:border-slate-700 shadow-sm'}`}>
                        <Zap className="w-3.5 h-3.5"/> Speed Mode
                      </button>
                      <button onClick={handleResetGrammar} className="flex items-center gap-1.5 px-3 py-2 rounded-xl border text-xs font-bold transition-all dark:bg-slate-900 bg-white dark:border-slate-800 border-slate-200 dark:text-slate-400 text-slate-600 hover:text-red-400 dark:hover:text-red-400 shadow-sm cursor-pointer" title="Làm lại chuyên đề này từ câu 1">
                        <RotateCcw className="w-3.5 h-3.5"/> Làm lại
                      </button>
                    </div>
                    {answeredCount > 0 && <span className="text-xs font-mono dark:text-slate-400 text-slate-600"><span className="text-emerald-500 font-bold">{correctCount}</span>/{answeredCount} đúng</span>}
                  </div>

                  {!currentQ ? (
                    <div className="text-center py-16 text-slate-400"><BookOpen className="w-10 h-10 mx-auto mb-3 opacity-30"/><p>Chưa có câu hỏi luyện tập.</p></div>
                  ) : (
                    <div className="dark:bg-slate-900/70 bg-white border dark:border-slate-800 border-slate-200 shadow-xl rounded-3xl overflow-hidden">
                      {/* Counter + action icons */}
                      <div className="flex items-center justify-between px-5 py-3 border-b dark:border-slate-800 border-slate-200">
                        <span className="text-sm font-bold dark:text-slate-300 text-slate-700"><span className="dark:text-white text-slate-900 font-black">{currentQIdx+1}</span><span className="dark:text-slate-600 text-slate-400"> / {totalQ}</span></span>
                        <div className="flex items-center gap-0.5 dark:text-slate-600 text-slate-400">
                          <button title="Báo lỗi" className="p-1.5 rounded-lg hover:bg-rose-500/15 hover:text-rose-500 transition-colors cursor-pointer"><AlertTriangle className="w-4 h-4"/></button>
                          <button title="Đánh dấu" onClick={()=>setBookmarked(b=>({...b,[currentQIdx]:!b[currentQIdx]}))} className={`p-1.5 rounded-lg transition-colors cursor-pointer ${bookmarked[currentQIdx] ? 'text-amber-500' : 'hover:bg-amber-500/15 hover:text-amber-500'}`}><Star className="w-4 h-4" fill={bookmarked[currentQIdx]?'currentColor':'none'}/></button>
                          <button title="Ghi chú" className="p-1.5 rounded-lg hover:bg-blue-500/15 hover:text-blue-500 transition-colors cursor-pointer"><FileText className="w-4 h-4"/></button>
                        </div>
                      </div>

                      {/* Prompt */}
                      <div className="px-6 py-5">
                        <p className="text-base font-semibold dark:text-slate-100 text-slate-900 leading-relaxed">{currentQ.prompt || currentQ.promptText}</p>
                      </div>

                      {/* Options */}
                      <div className="px-5 pb-5 space-y-2.5">
                        {(currentQ.options||[]).map(opt => {
                          const userAns = answeredQ[currentQIdx];
                          const optClean = String(opt.label || '').replace(/[\(\)]/g, '').trim().toUpperCase();
                          const ansClean = String(currentQ.correctAnswer || '').replace(/[\(\)]/g, '').trim().toUpperCase();
                          const isSelected = userAns === optClean || userAns === opt.label;
                          const isCorrect = opt.isCorrect || optClean === ansClean;
                          const isAnswered = userAns !== undefined;
                          let s = 'dark:border-slate-800 border-slate-200 dark:bg-slate-900 bg-slate-50/80 dark:text-slate-300 text-slate-800 hover:border-slate-300 dark:hover:border-slate-700 hover:bg-white dark:hover:bg-slate-800 cursor-pointer shadow-sm';
                          if (isAnswered) {
                            if (isCorrect) s='border-emerald-500 bg-emerald-500/10 text-emerald-600 dark:text-emerald-300 cursor-default';
                            else if (isSelected) s='border-rose-500 bg-rose-500/10 text-rose-600 dark:text-rose-300 cursor-default';
                            else s='dark:border-slate-800 border-slate-100 dark:bg-slate-900 bg-slate-50/50 dark:text-slate-600 text-slate-400 opacity-40 cursor-default';
                          }
                          return (
                            <button key={opt.label} onClick={()=>handleAnswer(optClean)} className={`w-full p-4 rounded-2xl border-2 text-left text-sm transition-all flex items-center gap-3.5 ${s}`}>
                              <span className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-sm shrink-0 ${isAnswered&&isCorrect?'bg-emerald-500 text-slate-950':isAnswered&&isSelected?'bg-rose-500 text-white':'dark:bg-slate-800 bg-slate-200 dark:text-slate-400 text-slate-600'}`}>{optClean}</span>
                              <span className="flex-1">{opt.text}</span>
                              {isAnswered && isCorrect && <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0"/>}
                            </button>
                          );
                        })}
                      </div>

                      {/* Explanation (Giải thích chi tiết 4 phần chuẩn ETS: Ngữ pháp, Mẹo 3s, 4 đáp án, Bản dịch) */}
                      {answeredQ[currentQIdx] !== undefined && (
                        <div className="mx-5 mb-5 p-5 rounded-2xl dark:bg-slate-950/80 bg-slate-50 border dark:border-slate-800 border-slate-200 space-y-2 text-xs animate-fadeIn">
                          <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-extrabold text-sm">
                            <Sparkles className="w-4 h-4 text-emerald-500"/> 
                            <span>Đáp án đúng: {currentQ.correctAnswer}</span>
                          </div>
                          {currentQ.explanation && (
                            <div className="dark:text-slate-300 text-slate-700 leading-relaxed whitespace-pre-line text-xs font-normal">
                              {currentQ.explanation}
                            </div>
                          )}
                          {currentQ.promptTranslation && (
                            <p className="dark:text-slate-400 text-slate-500 italic text-[11px] border-t dark:border-slate-800/60 border-slate-200 pt-2">
                              🇻🇳 {currentQ.promptTranslation}
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* BOTTOM SPACER BUFFER (Tránh bị thanh cố định che khi cuộn hết cỡ) */}
              <div className="h-20 sm:h-28 shrink-0 pointer-events-none" aria-hidden="true" />

            </div>
          </div>

          {/* FIXED BOTTOM NAVIGATION BAR (CỐ ĐỊNH Ở ĐÁY MÀN HÌNH - BẤM PHÁT QUA LUÔN) */}
          {activeTab === 'practice' && totalQ > 0 && (
            <footer className="h-16 shrink-0 dark:bg-slate-900/95 bg-white/95 backdrop-blur-xl border-t dark:border-slate-800/90 border-slate-200 px-4 sm:px-8 flex items-center justify-between z-30 shadow-2xl">
              <div className="max-w-3xl w-full mx-auto flex items-center justify-between gap-3 sm:gap-6">
                
                {/* Cụm trái: Báo lỗi & Nút Trước */}
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => alert('Đã gửi phản hồi báo lỗi câu hỏi.')}
                    className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl dark:bg-slate-800 bg-slate-100 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-500 hover:text-rose-500 transition-colors cursor-pointer shadow-sm"
                    title="Báo lỗi câu hỏi"
                  >
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                    <span className="hidden md:inline">Báo lỗi</span>
                  </button>

                  {/* Nút Trước */}
                  <button 
                    onClick={handlePrev} 
                    disabled={currentQIdx === 0} 
                    className="flex items-center gap-1.5 px-3.5 sm:px-4 py-2.5 rounded-xl dark:bg-slate-800 bg-slate-100 dark:text-slate-300 text-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-bold transition-all disabled:opacity-30 disabled:cursor-not-allowed border border-slate-200 dark:border-transparent active:scale-95 cursor-pointer shadow-sm"
                    title="Câu trước (←)"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    <span className="hidden sm:inline">Câu trước</span>
                    <span className="sm:hidden">Trước</span>
                  </button>
                </div>

                {/* Tiến độ câu & Chấm chuyển câu */}
                <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
                  <span className="text-xs font-mono font-bold dark:text-slate-300 text-slate-700 px-2.5 py-1 rounded-lg dark:bg-slate-800/80 bg-slate-100 shrink-0">
                    Câu <strong className="text-emerald-500 font-black">{currentQIdx + 1}</strong>/{totalQ}
                  </span>
                  <div className="hidden sm:flex items-center gap-1">
                    {Array.from({ length: Math.min(9, totalQ) }, (_, di) => {
                      const start = Math.max(0, Math.min(currentQIdx - 4, totalQ - 9));
                      const ri = start + di;
                      const isCurrent = ri === currentQIdx;
                      const isAnswered = answeredQ[ri] !== undefined;
                      const isCorrect = isAnswered && answeredQ[ri] === questions[ri]?.correctAnswer;
                      return (
                        <button
                          key={ri}
                          onClick={() => {
                            setCurrentQIdx(ri);
                            practiceScrollRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
                          }}
                          className={`transition-all rounded-full cursor-pointer ${
                            isCurrent
                              ? 'w-6 h-2.5 bg-emerald-500 ring-2 ring-emerald-500/40'
                              : isAnswered
                              ? isCorrect
                                ? 'w-2.5 h-2.5 bg-emerald-600 hover:scale-125'
                                : 'w-2.5 h-2.5 bg-rose-500 hover:scale-125'
                              : 'dark:bg-slate-700 bg-slate-300 hover:bg-slate-400 w-2.5 h-2.5'
                          }`}
                          title={`Chuyển tới câu ${ri + 1}`}
                        />
                      );
                    })}
                  </div>
                </div>

                {/* Nút Tiếp theo - Luôn FIX CỨNG ở đáy màn hình, bấm phát qua luôn */}
                <button 
                  onClick={handleNext} 
                  disabled={currentQIdx === totalQ - 1} 
                  className="flex items-center gap-2 px-5 sm:px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-xs transition-all shadow-lg shadow-emerald-500/25 active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                  title="Câu tiếp theo (→ hoặc Enter)"
                >
                  <span>{currentQIdx === totalQ - 1 ? 'Hoàn thành' : 'Câu tiếp theo'}</span>
                  <ChevronRight className="w-4 h-4 stroke-[3]" />
                </button>

              </div>
            </footer>
          )}
        </main>
      </div>

      {/* Mascot Transition Overlay */}
      <DauSavingProgressOverlay isSaving={isSavingProgress} />
    </div>
  );
}
