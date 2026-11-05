import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { 
  Mic, 
  Sparkles, 
  Search, 
  Clock, 
  ArrowRight, 
  Play, 
  Video, 
  Crown, 
  CheckCircle2, 
  Image as ImageIcon,
  MessageSquare,
  HelpCircle,
  FileQuestion,
  Award
} from 'lucide-react';
import axios from 'axios';
import usePageTitle from '../hooks/usePageTitle';

export default function SpeakingDashboard() {
  usePageTitle(
    'Luyện Nói TOEIC Speaking — Trọn Bộ 5 Parts & Shadowing Chuẩn Đậu TOEIC',
    'Chinh phục TOEIC Speaking tự tin giao tiếp chuẩn quốc tế. Luyện phát âm, ngữ điệu và phản xạ giao tiếp theo rubric chấm điểm ETS 0-200.'
  );

  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const tabParam = searchParams.get('tab') || searchParams.get('part') || '1';
  const [activeTab, setActiveTab] = useState(tabParam); // 'shadowing', '1', '2', '3', '4', '5'

  const [exercises, setExercises] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLevel, setSelectedLevel] = useState('all');
  const [selectedTopic, setSelectedTopic] = useState('all');
  const [visibleCount, setVisibleCount] = useState(24);

  const tabs = [
    { id: 'shadowing', label: 'Shadowing', count: '100+ Video', icon: Video },
    { id: '1', label: 'Part 1: Đọc to', count: '60 bài', icon: Mic },
    { id: '2', label: 'Part 2: Tả tranh', count: '60 bài', icon: ImageIcon },
    { id: '3', label: 'Part 3: Trả lời câu hỏi', count: '50 bài', icon: MessageSquare },
    { id: '4', label: 'Part 4: Dùng thông tin', count: '50 bài', icon: FileQuestion },
    { id: '5', label: 'Part 5: Nêu quan điểm', count: '60 bài', icon: Award }
  ];

  useEffect(() => {
    let isMounted = true;
    async function loadData() {
      if (activeTab === 'shadowing') {
        setExercises([]);
        setLoading(false);
        return;
      }
      setLoading(true);
      try {
        const res = await axios.get(`/api/v1/speaking/exercises?part=${activeTab}`);
        if (isMounted && res.data && res.data.data) {
          setExercises(res.data.data);
        }
      } catch (err) {
        console.error('Failed to load speaking exercises:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    loadData();
    return () => { isMounted = false; };
  }, [activeTab]);

  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    setSearchParams({ tab: tabId });
    setSelectedLevel('all');
    setSelectedTopic('all');
    setSearchQuery('');
    setVisibleCount(24);
  };

  const topics = useMemo(() => {
    return ['all', ...new Set(exercises.map(e => e.topic).filter(Boolean))];
  }, [exercises]);

  const filteredExercises = useMemo(() => {
    return exercises.filter(item => {
      if (selectedLevel !== 'all' && item.level !== selectedLevel) return false;
      if (selectedTopic !== 'all' && item.topic !== selectedTopic) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const codeMatch = (item.code || '').toLowerCase().includes(q);
        const titleMatch = (item.title || '').toLowerCase().includes(q);
        const topicMatch = (item.topic || '').toLowerCase().includes(q);
        if (!codeMatch && !titleMatch && !topicMatch) return false;
      }
      return true;
    });
  }, [exercises, selectedLevel, selectedTopic, searchQuery]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 selection:bg-cyan-500 selection:text-slate-950">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Hero Header */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-900/90 to-blue-950/40 border border-slate-800/80 p-8 sm:p-10 shadow-2xl backdrop-blur-xl">
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-3 max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 text-xs font-semibold uppercase tracking-wider">
                <Mic className="w-3.5 h-3.5" />
                <span>TOEIC Speaking AI Coach (0 - 200 PTS)</span>
              </div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold font-heading text-white tracking-tight">
                Chinh phục <span className="bg-gradient-to-r from-blue-400 via-cyan-400 to-teal-400 bg-clip-text text-transparent">TOEIC Speaking</span> chuẩn ETS
              </h1>
              <p className="text-slate-400 text-sm sm:text-base leading-relaxed">
                Luyện phát âm, ngữ điệu và phản xạ giao tiếp theo rubric chuẩn quốc tế ETS 0-200 điểm với nhận diện giọng nói AI tức thì.
              </p>
            </div>

            <div className="hidden lg:flex items-center justify-center w-28 h-28 rounded-2xl bg-blue-500/10 border border-blue-500/20 shadow-inner">
              <Mic className="w-14 h-14 text-cyan-400 animate-pulse" />
            </div>
          </div>
        </div>

        {/* 6 Main Tabs */}
        <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-slate-900/80 border border-slate-800/80 overflow-x-auto">
          {tabs.map(t => {
            const Icon = t.icon;
            const isActive = activeTab === t.id;
            return (
              <button
                key={t.id}
                onClick={() => handleTabChange(t.id)}
                className={`flex-1 min-w-[130px] flex items-center justify-center gap-2 py-3 px-3 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap ${
                  isActive 
                    ? 'bg-cyan-500 text-slate-950 shadow-lg shadow-cyan-500/20' 
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{t.label}</span>
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                  isActive ? 'bg-slate-950/20 text-slate-950' : 'bg-slate-800 text-slate-400'
                }`}>
                  {t.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Shadowing Tab Section */}
        {activeTab === 'shadowing' ? (
          <div className="rounded-3xl bg-slate-900/60 border border-slate-800 p-8 space-y-6">
            <div className="space-y-2">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Video className="w-5 h-5 text-cyan-400" />
                <span>Luyện Shadowing Nhại Giọng Người Bản Xứ</span>
              </h2>
              <p className="text-xs sm:text-sm text-slate-400">
                Phương pháp Shadowing giúp bạn bắt chước ngữ điệu, trọng âm và nối từ chuẩn xác như người bản ngữ qua các video ngắn được chọn lọc.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {[
                { title: 'Steve Jobs Stanford Speech', topic: 'Diễn thuyết truyền cảm hứng', duration: '1:45', level: 'Medium' },
                { title: 'Coffee Shop Customer Service', topic: 'Hội thoại công sở', duration: '1:15', level: 'Easy' },
                { title: 'Airport Boarding Announcement', topic: 'Thông báo sân bay', duration: '0:55', level: 'Easy' },
                { title: 'Job Interview Best Answers', topic: 'Phỏng vấn xin việc', duration: '2:10', level: 'Hard' },
                { title: 'TED Talk: Body Language', topic: 'Kỹ năng thuyết trình', duration: '2:30', level: 'Hard' },
                { title: 'Ordering Food in Restaurant', topic: 'Giao tiếp thường ngày', duration: '1:20', level: 'Easy' }
              ].map((vid, idx) => (
                <div key={idx} className="rounded-2xl bg-slate-950 border border-slate-800 p-5 space-y-3 hover:border-cyan-500/50 transition-all">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded-md">{vid.topic}</span>
                    <span className="text-slate-500 font-mono">⏱️ {vid.duration}</span>
                  </div>
                  <h3 className="font-bold text-sm text-slate-200 line-clamp-1">{vid.title}</h3>
                  <button
                    onClick={() => navigate(`/listen/dictation/1?mode=shadowing`)}
                    className="w-full flex items-center justify-center gap-2 py-2 rounded-xl bg-cyan-500/10 hover:bg-cyan-500 text-cyan-400 hover:text-slate-950 text-xs font-bold transition-all"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>Bắt đầu nhại giọng</span>
                  </button>
                </div>
              ))}
            </div>
          </div>
        ) : (
          /* Speaking Parts 1-5 Grid */
          <div className="space-y-6">
            {/* Filter and Search Bar */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
              <div className="flex items-center gap-2 overflow-x-auto pb-2 sm:pb-0 scrollbar-none">
                {['all', 'Easy', 'Medium', 'Hard'].map(lvl => (
                  <button
                    key={lvl}
                    onClick={() => setSelectedLevel(lvl)}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                      selectedLevel === lvl
                        ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                        : 'bg-slate-900/60 text-slate-400 border border-slate-800 hover:text-slate-200'
                    }`}
                  >
                    {lvl === 'all' ? 'Tất cả độ khó' : lvl === 'Easy' ? 'Dễ' : lvl === 'Medium' ? 'Vừa' : 'Khó'}
                  </button>
                ))}
              </div>

              <div className="relative w-full sm:w-72 shrink-0">
                <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Tìm kiếm chủ đề, mã đề..."
                  className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-900/80 border border-slate-800 text-xs sm:text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all"
                />
              </div>
            </div>

            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="h-44 rounded-2xl bg-slate-900/50 border border-slate-800/60 animate-pulse" />
                ))}
              </div>
            ) : filteredExercises.length === 0 ? (
              <div className="py-16 text-center text-slate-500 rounded-3xl border border-slate-800/60 bg-slate-900/30 p-8">
                <Mic className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                <p className="text-base font-semibold text-slate-400">Không tìm thấy bài luyện nói nào khớp bộ lọc</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {filteredExercises.slice(0, visibleCount).map((item, idx) => (
                  <div
                    key={item._id || item.dauId || idx}
                    className="group relative flex flex-col justify-between rounded-2xl bg-slate-900/60 border border-slate-800/80 p-5 hover:border-cyan-500/50 hover:bg-slate-900 transition-all duration-200 shadow-lg"
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-mono font-bold text-cyan-400 bg-cyan-500/10 border border-cyan-500/20 px-2.5 py-0.5 rounded-lg">
                          {item.code || `SP${activeTab}-${idx + 1}`}
                        </span>
                        <div className="flex items-center gap-1.5">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                            item.level === 'Hard' ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' :
                            item.level === 'Medium' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                            'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          }`}>
                            {item.level || 'Easy'}
                          </span>
                          <span className="text-[11px] text-slate-400 bg-slate-800 px-2 py-0.5 rounded-md">
                            {item.topic || 'Chung'}
                          </span>
                        </div>
                      </div>

                      <h3 className="text-sm font-bold text-slate-200 group-hover:text-cyan-300 transition-colors line-clamp-3 leading-relaxed">
                        {item.title}
                      </h3>
                    </div>

                    <div className="pt-4 border-t border-slate-800/60 mt-4 flex items-center justify-between">
                      <span className="text-[11px] text-slate-500 font-mono">
                        ⏱️ {item.prepTime}s chuẩn bị • {item.speakTime}s nói
                      </span>
                      <button
                        onClick={() => navigate(`/speaking/practice/${item._id || item.dauId}`)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-cyan-500/10 hover:bg-cyan-500 text-cyan-400 hover:text-slate-950 text-xs font-bold transition-all"
                      >
                        <Mic className="w-3.5 h-3.5" />
                        <span>Luyện nói</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {filteredExercises.length > visibleCount && (
              <div className="flex justify-center pt-4">
                <button
                  onClick={() => setVisibleCount(c => c + 24)}
                  className="px-6 py-2.5 rounded-full bg-slate-900 border border-slate-700 text-slate-300 hover:text-white hover:border-cyan-500 text-xs font-bold transition-all shadow-md"
                >
                  Xem thêm ({filteredExercises.length - visibleCount} bài còn lại)
                </button>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
