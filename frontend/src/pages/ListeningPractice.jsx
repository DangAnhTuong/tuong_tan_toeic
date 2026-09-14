import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../components/Navbar';
import { isWordMatch } from '../utils/textMatching';
import { 
  ArrowLeft, 
  Play, 
  Pause, 
  RotateCcw, 
  RotateCw, 
  Crown, 
  FileText, 
  Edit3, 
  Sparkles, 
  AlertTriangle, 
  Bookmark, 
  ChevronLeft, 
  ChevronRight, 
  Zap, 
  CheckCircle2,
  Volume2,
  Clock,
  Eye,
  SkipBack,
  SkipForward,
  Copy,
  Sliders,
  PanelLeftClose,
  PanelLeftOpen,
  Check,
  Award,
  BookOpen
} from 'lucide-react';
import VocabularyDrawer from '../components/VocabularyDrawer';
import ExitModal from '../components/ExitModal';

// 60 DIVERSE REALISTIC TOEIC PART 1 SCENARIOS (FALLBACK & SEED BACKED)
const masterPart1Questions = [
  // Bài 1: Văn phòng (1-4)
  { sentence: "The woman is writing notes in a spiral notebook.", trans: "Người phụ nữ đang ghi chép vào một cuốn sổ tay dạng lò xo.", blanks: [1, 3, 7, 8] },
  { sentence: "Some colleagues are gathered around a conference table.", trans: "Một số đồng nghiệp đang tập trung quanh bàn hội nghị.", blanks: [1, 3, 6, 7] },
  { sentence: "A presenter is pointing at a financial chart on the whiteboard.", trans: "Người thuyết trình đang chỉ vào biểu đồ tài chính trên bảng trắng.", blanks: [1, 3, 6, 9] },
  { sentence: "The employee is typing information on a desktop computer.", trans: "Người nhân viên đang gõ thông tin trên máy tính để bàn.", blanks: [1, 3, 6, 7] },

  // Bài 2: Kho bãi (5-8)
  { sentence: "Cardboard boxes are stacked high on wooden pallets.", trans: "Các thùng bìa carton được xếp chồng cao trên các tấm pallet gỗ.", blanks: [0, 1, 3, 6, 7] },
  { sentence: "The forklift operator is lifting heavy cargo crates.", trans: "Người lái xe nâng đang nâng các kiện hàng nặng.", blanks: [1, 2, 4, 6, 7] },
  { sentence: "A logistics worker is scanning a barcode on a package.", trans: "Công nhân kho vận đang quét mã vạch trên một kiện hàng.", blanks: [1, 2, 4, 6, 9] },
  { sentence: "Shipment containers are lined up along the delivery dock.", trans: "Các thùng container xếp thành hàng dọc theo cầu cảng bốc dỡ.", blanks: [0, 1, 4, 7, 8] },

  // Bài 3: Cửa hàng & Mua sắm (9-12)
  { sentence: "A cashier is scanning groceries at the checkout counter.", trans: "Thu ngân đang quét mã hàng tạp hóa tại quầy thanh toán.", blanks: [1, 3, 4, 7, 8] },
  { sentence: "Customers are browsing clothing items on the display racks.", trans: "Khách hàng đang xem các món quần áo trên giá trưng bày.", blanks: [0, 2, 3, 7, 8] },
  { sentence: "The shopkeeper is arranging fresh fruit in wooden baskets.", trans: "Người bán hàng đang xếp trái cây tươi vào các giỏ gỗ.", blanks: [1, 3, 5, 8] },
  { sentence: "Merchandise is displayed attractively in the store window.", trans: "Hàng hóa được trưng bày bắt mắt bên cửa kính cửa hàng.", blanks: [0, 2, 6, 7] },

  // Bài 4: Nhà hàng & Ẩm thực (13-16)
  { sentence: "The waiter is pouring red wine into a crystal glass.", trans: "Người phục vụ đang rót rượu vang đỏ vào ly thủy tinh.", blanks: [1, 3, 5, 8, 9] },
  { sentence: "Diners are seated at tables in an outdoor courtyard.", trans: "Thực khách đang ngồi tại các bàn trong sân ngoài trời.", blanks: [0, 2, 4, 7, 8] },
  { sentence: "The chef is preparing ingredients in a commercial kitchen.", trans: "Đầu bếp đang chuẩn bị nguyên liệu trong gian bếp nhà hàng.", blanks: [1, 3, 4, 7, 8] },
  { sentence: "Plates of gourmet food are arranged on a serving tray.", trans: "Những đĩa thức ăn cao cấp được bày biện trên khay phục vụ.", blanks: [0, 2, 3, 5, 8, 9] },

  // Bài 5: Sân bay & Du lịch (17-20)
  { sentence: "Passengers are queuing up at the airline check-in counter.", trans: "Hành khách đang xếp hàng tại quầy làm thủ tục của hãng bay.", blanks: [0, 2, 6, 7, 8] },
  { sentence: "A traveler is wheeling a suitcase through the airport concourse.", trans: "Một du khách đang kéo vali qua sảnh lớn sân bay.", blanks: [1, 3, 5, 8, 9] },
  { sentence: "Ground crew members are directing an airplane on the tarmac.", trans: "Nhân viên mặt đất đang điều hướng máy bay trên đường băng.", blanks: [1, 2, 4, 6, 9] },
  { sentence: "Luggage bags are revolving on the baggage claim carousel.", trans: "Các túi hành lý đang xoay tròn trên băng chuyền trả hành lý.", blanks: [0, 1, 3, 6, 7, 8] },

  // Bài 6: Công trường & Ngoài trời (21-24)
  { sentence: "Construction workers are wearing protective vests and hard hats.", trans: "Các công nhân xây dựng đang mặc áo bảo hộ và đội mũ cứng.", blanks: [0, 1, 3, 4, 5, 7, 8] },
  { sentence: "Heavy machinery is excavating soil at the construction site.", trans: "Máy móc hạng nặng đang đào đất tại công trường xây dựng.", blanks: [0, 1, 3, 4, 7, 8] },
  { sentence: "A surveyor is measuring distances using specialized equipment.", trans: "Chuyên viên khảo sát đang đo khoảng cách bằng thiết bị chuyên dụng.", blanks: [1, 3, 4, 6, 7] },
  { sentence: "Workers are climbing metal scaffolding on the building facade.", trans: "Các công nhân đang leo lên giàn giáo kim loại trên mặt tiền tòa nhà.", blanks: [0, 2, 4, 7, 8] }
];

const lessonTitles = [
  'Bài 1: Văn phòng & Bàn làm việc',
  'Bài 2: Kho bãi & Vận chuyển hàng',
  'Bài 3: Cửa hàng & Mua sắm bán lẻ',
  'Bài 4: Nhà hàng & Ẩm thực ăn uống',
  'Bài 5: Sân bay, Ga tàu & Du lịch',
  'Bài 6: Công trường & Không gian ngoài trời'
];

export default function ListeningPractice() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const initialMode = searchParams.get('mode') || 'check'; // 'check' | 'dictation' | 'full'
  const testNumber = Number(searchParams.get('test')) || 1;
  const partNumber = Number(searchParams.get('part')) || 1;
  const levelNumber = searchParams.get('level') ? Number(searchParams.get('level')) : null;

  // Sub-mode switch: 'check' (Nghe Check) | 'dictation' (Nghe Chép) | 'full' (Nghe Full)
  const [subMode, setSubMode] = useState(initialMode);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // Lesson & Questions Data
  const [testTitle, setTestTitle] = useState(`TEST ${testNumber} 2026`);
  const [exerciseData, setExerciseData] = useState([]);
  const [activeLessonIdx, setActiveLessonIdx] = useState(0);

  const [currentSentenceIdx, setCurrentSentenceIdx] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1.0);
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [earnedXP, setEarnedXP] = useState(5);

  // Percentage hide mode: 30 | 50 | 100
  const [hidePercentage, setHidePercentage] = useState(50);

  // Mode 1: Nghe Check (Lật từ) State
  const [revealedCount, setRevealedCount] = useState(0);
  const [isFlippedAll, setIsFlippedAll] = useState(false);

  // Mode 2: Nghe Chép (Dictation) State
  const [userInputs, setUserInputs] = useState({});
  const inputRefs = useRef([]);

  // Mode 3: Nghe Full State
  const [isAutoPlay, setIsAutoPlay] = useState(true);
  const [isScriptVisible, setIsScriptVisible] = useState(true);

  // Question status trackers
  const [completedSentences, setCompletedSentences] = useState({});

  // Modals & Tools
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [copyToast, setCopyToast] = useState(false);
  const mainRef = useRef(null);

  useEffect(() => {
    if (mainRef.current) {
      mainRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentSentenceIdx, activeLessonIdx]);

  // Build Structured Lessons from 24 questions
  const buildLessonsFromQuestions = (rawQuestions, offset = 0) => {
    const lessons = [];
    for (let lIdx = 0; lIdx < 6; lIdx++) {
      const lessonQs = [];
      for (let qIdx = 0; qIdx < 4; qIdx++) {
        const itemIdx = (offset + lIdx * 4 + qIdx) % masterPart1Questions.length;
        const fallbackItem = masterPart1Questions[itemIdx];
        
        let qData = rawQuestions && rawQuestions[lIdx * 4 + qIdx];
        let sentenceText = qData?.transcript || fallbackItem.sentence;
        let transText = qData?.translation || fallbackItem.trans;
        let wordsArr = sentenceText.split(' ');
        let blanksArr = (fallbackItem.blanks || [1, 3]).filter(idx => idx < wordsArr.length);

        lessonQs.push({
          id: `q_${lIdx + 1}_${qIdx + 1}`,
          audioUrl: qData?.audioUrl || '',
          imageUrl: qData?.imageUrl || '',
          sentence: sentenceText,
          translation: transText,
          words: wordsArr,
          blankIndices: blanksArr,
          tip: `Chú ý phát âm và cấu trúc ngữ pháp câu ${qIdx + 1}.`
        });
      }

      lessons.push({
        lessonNumber: lIdx + 1,
        title: lessonTitles[lIdx],
        questions: lessonQs
      });
    }
    return lessons;
  };

  // Timer counter
  useEffect(() => {
    const timer = setInterval(() => {
      setTimerSeconds(prev => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Fetch Exercises dynamically from MongoDB API
  useEffect(() => {
    async function loadData() {
      try {
        let apiUrl = `/api/v1/listening/exercises?mode=dictation&part=${partNumber}`;
        if (levelNumber) {
          apiUrl = `/api/v1/listening/exercises?mode=level&level=${levelNumber}`;
          setTestTitle(`LEVEL ${levelNumber} — ${['DỄ', 'CƠ BẢN', 'TRUNG BÌNH', 'KHÓ', 'RẤT KHÓ'][levelNumber - 1]}`);
        } else if (testNumber) {
          setTestTitle(`TEST ${testNumber} 2026`);
        }

        const res = await axios.get(apiUrl);
        if (res.data?.data && res.data.data.length > 0) {
          let matched = null;
          if (testNumber) {
            matched = res.data.data.find(ex => ex.title?.includes(`TEST ${testNumber}`)) || res.data.data[0];
          } else if (levelNumber) {
            matched = res.data.data.find(ex => ex.level === Number(levelNumber)) || res.data.data[0];
          } else {
            matched = res.data.data[0];
          }

          if (matched && matched.questions && matched.questions.length > 0) {
            const dynamicLessons = buildLessonsFromQuestions(matched.questions);
            setExerciseData(dynamicLessons);
            return;
          }
        }
        
        // Fallback default structure
        setExerciseData(buildLessonsFromQuestions(null));
      } catch (err) {
        console.warn('API load failed, using fallback data:', err);
        setExerciseData(buildLessonsFromQuestions(null));
      }
    }
    loadData();
  }, [testNumber, partNumber, levelNumber]);

  const currentLessons = exerciseData.length > 0 ? exerciseData : buildLessonsFromQuestions(null);
  const currentLesson = currentLessons[activeLessonIdx] || currentLessons[0] || { questions: [{sentence: "", words: [], blankIndices: []}] };
  const currentQ = currentLesson?.questions[currentSentenceIdx] || currentLesson?.questions[0] || {
    sentence: "The woman is writing on a paper.",
    translation: "Người phụ nữ đang ghi chép trên tờ giấy.",
    words: ["The", "woman", "is", "writing", "on", "a", "paper."],
    blankIndices: [1, 3, 6]
  };

  const audioRef = useRef(null);

  const fallbackTTS = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(currentQ.sentence);
      utterance.rate = playbackSpeed;
      utterance.lang = 'en-US';
      utterance.onstart = () => setIsPlaying(true);
      utterance.onend = () => setIsPlaying(false);
      utterance.onerror = () => setIsPlaying(false);
      window.speechSynthesis.speak(utterance);
    }
  };

  const playAudio = () => {
    if (currentQ?.audioUrl && currentQ.audioUrl.startsWith('http')) {
      if (audioRef.current) {
        audioRef.current.pause();
      }
      const audio = new Audio(currentQ.audioUrl);
      audioRef.current = audio;
      audio.playbackRate = playbackSpeed;
      setIsPlaying(true);
      audio.play().catch(() => {
        fallbackTTS();
      });
      audio.onended = () => setIsPlaying(false);
      audio.onerror = () => {
        setIsPlaying(false);
        fallbackTTS();
      };
    } else {
      fallbackTTS();
    }
  };


  // Keyboard Shortcuts (Ctrl -> Replay, Tab -> Flip / Hint, Enter -> Next)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Control') {
        e.preventDefault();
        playAudio();
      } else if (e.key === 'Tab') {
        e.preventDefault();
        if (subMode === 'check') {
          handleFlipWords(revealedCount < 3 ? revealedCount + 1 : 'all');
        } else if (subMode === 'dictation') {
          handleAutoFillOneBlank();
        }
      } else if (e.key === 'Enter') {
        e.preventDefault();
        handleNextSentence();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [subMode, revealedCount, activeLessonIdx, currentSentenceIdx, currentQ]);

  // Handle Flip Words in Mode 1 (Nghe Check)
  const handleFlipWords = (count) => {
    if (count === 'all') {
      setIsFlippedAll(true);
      setRevealedCount(3);
    } else {
      setRevealedCount(Number(count));
      setIsFlippedAll(false);
    }
  };

  // Reset Flip State
  const handleResetFlip = () => {
    setRevealedCount(0);
    setIsFlippedAll(false);
  };

  // Dictation auto-fill one hint
  const handleAutoFillOneBlank = () => {
    const blanks = currentQ.blankIndices || [1, 3];
    for (let idx of blanks) {
      const target = currentQ.words[idx] || '';
      if (!userInputs[idx] || !isWordMatch(userInputs[idx], target)) {
        setUserInputs(prev => ({ ...prev, [idx]: target }));
        break;
      }
    }
  };

  // Handle Typing in Dictation Mode
  const handleInputChange = (idx, value) => {
    setUserInputs(prev => ({ ...prev, [idx]: value }));
    
    // Auto jump to next input when correct
    const target = currentQ.words[idx] || '';
    if (isWordMatch(value, target)) {
      const blanks = currentQ.blankIndices || [];
      const currentPos = blanks.indexOf(idx);
      if (currentPos !== -1 && currentPos + 1 < blanks.length) {
        const nextIdx = blanks[currentPos + 1];
        if (inputRefs.current[nextIdx]) {
          inputRefs.current[nextIdx].focus();
        }
      }
    }
  };

  // Go to next sentence
  const handleNextSentence = () => {
    const qKey = `${activeLessonIdx}_${currentSentenceIdx}`;
    setCompletedSentences(prev => ({ ...prev, [qKey]: true }));
    setEarnedXP(prev => prev + 2);

    handleResetFlip();
    setUserInputs({});

    if (currentSentenceIdx + 1 < currentLesson.questions.length) {
      setCurrentSentenceIdx(prev => prev + 1);
    } else if (activeLessonIdx + 1 < currentLessons.length) {
      setActiveLessonIdx(prev => prev + 1);
      setCurrentSentenceIdx(0);
    } else {
      alert('🎉 Chúc mừng bạn đã hoàn thành trọn bộ 24 câu nghe này!');
    }
  };

  // Go to previous sentence
  const handlePrevSentence = () => {
    handleResetFlip();
    setUserInputs({});
    if (currentSentenceIdx > 0) {
      setCurrentSentenceIdx(prev => prev - 1);
    } else if (activeLessonIdx > 0) {
      setActiveLessonIdx(prev => prev - 1);
      setCurrentSentenceIdx(currentLessons[activeLessonIdx - 1].questions.length - 1);
    }
  };

  // Copy sentence
  const handleCopySentence = () => {
    navigator.clipboard.writeText(currentQ.sentence);
    setCopyToast(true);
    setTimeout(() => setCopyToast(false), 2000);
  };

  // Determine if a word at index should be hidden or shown
  const isWordBlank = (idx) => {
    if (!currentQ.blankIndices) return false;
    return currentQ.blankIndices.includes(idx);
  };

  return (
    <div className="min-h-screen dark:bg-slate-950 bg-[#f8fafc] dark:text-slate-100 text-slate-900 flex flex-col font-sans transition-colors duration-200">
      
      {/* 1. TOP CONTROL BAR */}
      <header className="h-16 border-b dark:border-slate-800/90 border-slate-200 dark:bg-slate-950/90 bg-white/90 backdrop-blur-xl px-4 sm:px-6 flex items-center justify-between gap-4 sticky top-0 z-40 shadow-sm">
        
        {/* Left: Back & Toggle Sidebar */}
        <div className="flex items-center gap-3">
          <button 
            onClick={() => {
              const targetTab = levelNumber ? 'level' : (initialMode === 'dictation' || initialMode === 'check' || initialMode === 'full' ? 'dictation' : 'type');
              navigate(`/listen?tab=${targetTab}&part=${partNumber}`);
            }}
            className="p-2 rounded-xl dark:bg-slate-900 bg-slate-100 border dark:border-slate-800 border-slate-200 dark:text-slate-400 text-slate-600 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
            title="Quay lại danh sách bài nghe"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>

          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-xl dark:bg-slate-900 bg-slate-100 border dark:border-slate-800 border-slate-200 dark:text-slate-300 text-slate-700 hover:text-slate-900 dark:hover:text-white text-xs font-bold transition-colors"
          >
            {isSidebarOpen ? <PanelLeftClose className="w-3.5 h-3.5 text-cyan-500" /> : <PanelLeftOpen className="w-3.5 h-3.5 text-cyan-500" />}
            <span>{isSidebarOpen ? 'Ẩn sidebar' : 'Hiện sidebar'}</span>
          </button>
        </div>

        {/* Center: 3 SUB-MODES SWITCHER */}
        <div className="flex items-center p-1 rounded-2xl dark:bg-slate-900 bg-slate-100 border dark:border-slate-800 border-slate-200 shadow-inner">
          
          {/* 1. Nghe Check */}
          <button
            onClick={() => { setSubMode('check'); handleResetFlip(); }}
            className={`px-4 py-1.5 rounded-xl text-xs font-heading font-extrabold transition-all flex items-center gap-1.5 ${
              subMode === 'check'
                ? 'dark:bg-slate-950 bg-white dark:text-white text-slate-900 shadow-sm border dark:border-slate-700/80 border-slate-200'
                : 'dark:text-slate-400 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <span>Nghe Check</span>
          </button>

          {/* 2. Nghe Chép */}
          <button
            onClick={() => { setSubMode('dictation'); setUserInputs({}); }}
            className={`px-4 py-1.5 rounded-xl text-xs font-heading font-extrabold transition-all flex items-center gap-1.5 ${
              subMode === 'dictation'
                ? 'dark:bg-slate-950 bg-white dark:text-white text-slate-900 shadow-sm border dark:border-slate-700/80 border-slate-200'
                : 'dark:text-slate-400 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <span>Nghe Chép</span>
          </button>

          {/* 3. Nghe Full */}
          <button
            onClick={() => setSubMode('full')}
            className={`px-4 py-1.5 rounded-xl text-xs font-heading font-extrabold transition-all flex items-center gap-1.5 ${
              subMode === 'full'
                ? 'dark:bg-slate-950 bg-white dark:text-white text-slate-900 shadow-sm border dark:border-slate-700/80 border-slate-200'
                : 'dark:text-slate-400 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <span>Nghe Full</span>
          </button>
        </div>

        {/* Right: Timer & XP Tracker */}
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="flex items-center gap-1 px-3 py-1 rounded-full dark:bg-slate-900 bg-slate-100 border dark:border-slate-800 border-slate-200 dark:text-slate-300 text-slate-700 font-mono text-xs font-bold">
            <Clock className="w-3.5 h-3.5 text-amber-500" />
            <span>{timerSeconds}s</span>
          </div>

          <div className="flex items-center gap-1 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-700 dark:text-cyan-300 font-mono text-xs font-extrabold">
            <Zap className="w-3.5 h-3.5 text-cyan-500" />
            <span>+{earnedXP} XP</span>
          </div>
        </div>

      </header>

      {/* 2. MAIN WORKSPACE (SIDEBAR + CONTENT) */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* LEFT SIDEBAR ACCORDION */}
        {isSidebarOpen && (
          <aside className="w-72 lg:w-80 border-r dark:border-slate-800/80 border-slate-200 dark:bg-slate-950/95 bg-white flex flex-col shrink-0 overflow-y-auto animate-slideRight shadow-sm">
            
            {/* Sidebar Header */}
            <div className="p-4 border-b dark:border-slate-800/80 border-slate-200">
              <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-600 dark:text-cyan-400 block">
                BỘ ĐỀ THI ETS TOEIC
              </span>
              <h3 className="font-heading font-extrabold text-sm dark:text-white text-slate-900 mt-0.5">
                {testTitle}
              </h3>
              <p className="text-xs dark:text-slate-400 text-slate-500">
                6 bài • 24 câu hỏi
              </p>
            </div>

            {/* Accordion Lessons List */}
            <div className="flex-1 p-3 space-y-2 overflow-y-auto">
              {currentLessons.map((lesson, lIdx) => {
                const isLessonActive = activeLessonIdx === lIdx;
                const completedInLesson = lesson.questions.filter((_, qIdx) => completedSentences[`${lIdx}_${qIdx}`]).length;

                return (
                  <div key={lIdx} className="rounded-2xl border dark:border-slate-800/80 border-slate-200 overflow-hidden dark:bg-slate-900/40 bg-slate-50">
                    
                    {/* Lesson Header */}
                    <div 
                      onClick={() => {
                        setActiveLessonIdx(lIdx);
                        setCurrentSentenceIdx(0);
                        handleResetFlip();
                      }}
                      className={`p-3 flex items-center justify-between cursor-pointer transition-colors ${
                        isLessonActive 
                          ? 'bg-emerald-500 text-slate-950 font-bold' 
                          : 'hover:bg-slate-200 dark:hover:bg-slate-800/60 dark:text-slate-300 text-slate-700'
                      }`}
                    >
                      <div className="flex items-center gap-2 truncate">
                        <Volume2 className="w-4 h-4 shrink-0" />
                        <span className="text-xs truncate">{lesson.title}</span>
                      </div>
                      <span className={`text-[11px] font-mono px-2 py-0.5 rounded-full ${
                        isLessonActive ? 'bg-slate-950/20 text-slate-950' : 'dark:bg-slate-800 bg-slate-200 dark:text-slate-400 text-slate-600'
                      }`}>
                        {completedInLesson}/{lesson.questions.length}
                      </span>
                    </div>

                    {/* Sentences Sub-list (when expanded) */}
                    {isLessonActive && (
                      <div className="p-2 space-y-1 dark:bg-slate-950/80 bg-white border-t dark:border-slate-800/60 border-slate-200">
                        {lesson.questions.map((q, qIdx) => {
                          const isCurrent = currentSentenceIdx === qIdx;
                          const isDone = completedSentences[`${lIdx}_${qIdx}`];

                          return (
                            <button
                              key={qIdx}
                              onClick={() => {
                                setCurrentSentenceIdx(qIdx);
                                handleResetFlip();
                                setUserInputs({});
                              }}
                              className={`w-full p-2 rounded-xl text-xs flex items-center justify-between transition-all ${
                                isCurrent
                                  ? 'bg-cyan-500/20 text-cyan-700 dark:text-cyan-300 font-bold border border-cyan-500/40'
                                  : 'dark:text-slate-400 text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-900 hover:text-slate-900 dark:hover:text-white'
                              }`}
                            >
                              <div className="flex items-center gap-2">
                                {isDone ? (
                                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                                ) : (
                                  <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] ${
                                    isCurrent ? 'bg-cyan-500 text-slate-950 font-black' : 'dark:bg-slate-800 bg-slate-200 dark:text-slate-400 text-slate-600'
                                  }`}>
                                    {qIdx + 1}
                                  </span>
                                )}
                                <span>Câu {qIdx + 1}</span>
                              </div>
                              {isCurrent && <span className="w-2 h-2 rounded-full bg-cyan-500 animate-pulse" />}
                            </button>
                          );
                        })}
                      </div>
                    )}

                  </div>
                );
              })}
            </div>

          </aside>
        )}

        {/* RIGHT MAIN PRACTICE CONTAINER */}
        <main ref={mainRef} className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-10 flex flex-col items-center justify-center pb-44 sm:pb-48">
          
          <div className="max-w-3xl w-full space-y-6">
            
            {/* PRACTICE ROOM CARD */}
            <div className="glass-panel rounded-3xl border dark:border-slate-800 border-slate-200 p-6 md:p-8 dark:bg-slate-900/70 bg-white shadow-xl space-y-6">
              
              {/* TOP ACTION BAR INSIDE CARD */}
              <div className="flex items-center justify-between border-b dark:border-slate-800/80 border-slate-200 pb-4">
                
                {/* Left: Sentence Navigator & Play */}
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1">
                    <button 
                      onClick={handlePrevSentence}
                      className="p-1.5 rounded-lg dark:bg-slate-800 bg-slate-100 hover:bg-slate-200 dark:hover:bg-slate-700 dark:text-slate-300 text-slate-700 transition-colors"
                      title="Câu trước"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <span className="font-mono font-bold text-xs dark:text-white text-slate-900 px-2">
                      {currentSentenceIdx + 1} / {currentLesson.questions.length}
                    </span>
                    <button 
                      onClick={handleNextSentence}
                      className="p-1.5 rounded-lg dark:bg-slate-800 bg-slate-100 hover:bg-slate-200 dark:hover:bg-slate-700 dark:text-slate-300 text-slate-700 transition-colors"
                      title="Câu tiếp theo"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>

                  <button
                    onClick={playAudio}
                    className={`w-9 h-9 rounded-full flex items-center justify-center transition-all ${
                      isPlaying 
                        ? 'bg-amber-400 text-slate-950 animate-pulse ring-4 ring-amber-400/20' 
                        : 'bg-gradient-to-tr from-cyan-500 to-teal-400 text-slate-950 hover:scale-105 shadow-md shadow-cyan-500/20'
                    }`}
                    title="Phát âm (Phím tắt: Ctrl)"
                  >
                    {isPlaying ? <Pause className="w-4 h-4 fill-slate-950" /> : <Play className="w-4 h-4 fill-slate-950 ml-0.5" />}
                  </button>
                </div>

                {/* Right Tool Icons (Speed, Repeat, Bookmark, Copy) */}
                <div className="flex items-center gap-1 sm:gap-2 text-xs">
                  <button 
                    onClick={() => setPlaybackSpeed(prev => prev === 1.0 ? 1.25 : prev === 1.25 ? 0.75 : 1.0)}
                    className="px-2 py-1 rounded-lg dark:bg-slate-800 bg-slate-100 hover:bg-slate-200 dark:hover:bg-slate-700 dark:text-slate-300 text-slate-700 font-mono font-bold transition-colors"
                    title="Tốc độ phát"
                  >
                    {playbackSpeed}x
                  </button>

                  <button 
                    onClick={playAudio}
                    className="p-1.5 rounded-lg dark:bg-slate-800 bg-slate-100 hover:bg-slate-200 dark:hover:bg-slate-700 dark:text-slate-400 text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors"
                    title="Nghe lại từ đầu"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                  </button>

                  <button 
                    onClick={() => setIsBookmarked(!isBookmarked)}
                    className={`p-1.5 rounded-lg transition-colors ${
                      isBookmarked ? 'bg-amber-500/20 text-amber-500 dark:text-amber-400' : 'dark:bg-slate-800 bg-slate-100 dark:text-slate-400 text-slate-500 hover:text-slate-900 dark:hover:text-white'
                    }`}
                    title="Lưu câu hỏi"
                  >
                    <Bookmark className="w-3.5 h-3.5" />
                  </button>

                  <button 
                    onClick={handleCopySentence}
                    className="p-1.5 rounded-lg dark:bg-slate-800 bg-slate-100 hover:bg-slate-200 dark:hover:bg-slate-700 dark:text-slate-400 text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors"
                    title="Sao chép câu"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                </div>

              </div>

              {/* MODE 1: NGHE CHECK (LẬT TỪ) */}
              {subMode === 'check' && (
                <div className="space-y-6">
                  
                  {/* Percentage selector pills */}
                  <div className="flex items-center gap-2 text-xs">
                    <span className="dark:text-slate-400 text-slate-500 text-xs font-semibold">Ẩn từ:</span>
                    {[30, 50, 100].map(pct => (
                      <button
                        key={pct}
                        onClick={() => setHidePercentage(pct)}
                        className={`px-3 py-1 rounded-xl font-bold transition-all ${
                          hidePercentage === pct
                            ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
                            : 'dark:bg-slate-950 bg-slate-100 border dark:border-slate-800 border-slate-200 dark:text-slate-400 text-slate-600 hover:text-slate-900 dark:hover:text-white'
                        }`}
                      >
                        {pct}%
                      </button>
                    ))}
                  </div>

                  {/* Sentence with Word Capsules */}
                  <div className="p-6 rounded-2xl dark:bg-slate-950 bg-slate-50 border dark:border-slate-800/80 border-slate-200 min-h-[90px] flex flex-wrap items-center gap-2 text-base md:text-lg font-medium leading-loose">
                    {currentQ.words.map((word, wIdx) => {
                      const isBlank = isWordBlank(wIdx);
                      const isRevealed = !isBlank || isFlippedAll || (isBlank && revealedCount >= (wIdx % 3 + 1));

                      if (!isBlank) {
                        return (
                          <span key={wIdx} className="dark:text-slate-200 text-slate-800">
                            {word}
                          </span>
                        );
                      }

                      return isRevealed ? (
                        <span 
                          key={wIdx}
                          className="px-2.5 py-1 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-700 dark:text-emerald-300 font-bold animate-fadeIn"
                        >
                          {word}
                        </span>
                      ) : (
                        <span 
                          key={wIdx}
                          className="w-16 h-8 rounded-xl dark:bg-slate-900 bg-slate-200 border dark:border-slate-800 border-slate-300 inline-block align-middle animate-pulse"
                        />
                      );
                    })}
                  </div>

                  {/* LẬT TỪ FLIP CONTROLS */}
                  <div className="p-4 rounded-2xl dark:bg-slate-950/70 bg-slate-50 border dark:border-slate-800 border-slate-200 space-y-3">
                    <div className="flex items-center justify-between text-xs font-bold dark:text-slate-400 text-slate-500">
                      <span>LẬT TỪ (FLIP WORDS)</span>
                      <button
                        onClick={handleResetFlip}
                        className="flex items-center gap-1 dark:text-slate-400 text-slate-500 hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors"
                      >
                        <RotateCcw className="w-3 h-3" />
                        <span>Reset</span>
                      </button>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                      <button
                        onClick={() => handleFlipWords(1)}
                        className={`py-2.5 rounded-xl text-xs font-extrabold flex items-center justify-center gap-1.5 transition-all ${
                          revealedCount === 1 
                            ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 shadow-md shadow-amber-500/20' 
                            : 'dark:bg-slate-900 bg-white border dark:border-slate-800 border-slate-200 dark:text-slate-300 text-slate-700 hover:border-slate-300 dark:hover:border-slate-700 shadow-sm'
                        }`}
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>1 từ</span>
                      </button>

                      <button
                        onClick={() => handleFlipWords(2)}
                        className={`py-2.5 rounded-xl text-xs font-extrabold flex items-center justify-center gap-1.5 transition-all ${
                          revealedCount === 2 
                            ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 shadow-md shadow-amber-500/20' 
                            : 'dark:bg-slate-900 bg-white border dark:border-slate-800 border-slate-200 dark:text-slate-300 text-slate-700 hover:border-slate-300 dark:hover:border-slate-700 shadow-sm'
                        }`}
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>2 từ</span>
                      </button>

                      <button
                        onClick={() => handleFlipWords(3)}
                        className={`py-2.5 rounded-xl text-xs font-extrabold flex items-center justify-center gap-1.5 transition-all ${
                          revealedCount === 3 && !isFlippedAll
                            ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 shadow-md shadow-amber-500/20' 
                            : 'dark:bg-slate-900 bg-white border dark:border-slate-800 border-slate-200 dark:text-slate-300 text-slate-700 hover:border-slate-300 dark:hover:border-slate-700 shadow-sm'
                        }`}
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>3 từ</span>
                      </button>

                      <button
                        onClick={() => handleFlipWords('all')}
                        className={`py-2.5 rounded-xl text-xs font-extrabold flex items-center justify-center gap-1.5 transition-all ${
                          isFlippedAll 
                            ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 shadow-md shadow-emerald-500/20' 
                            : 'dark:bg-slate-900 bg-white border dark:border-slate-800 border-slate-200 dark:text-slate-300 text-slate-700 hover:border-slate-300 dark:hover:border-slate-700 shadow-sm'
                        }`}
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Tất cả</span>
                      </button>
                    </div>
                  </div>

                </div>
              )}

              {/* MODE 2: NGHE CHÉP (DICTATION INPUTS) */}
              {subMode === 'dictation' && (
                <div className="space-y-6">
                  
                  {/* Percentage selector pills */}
                  <div className="flex items-center gap-2 text-xs">
                    <span className="dark:text-slate-400 text-slate-500 text-xs font-semibold">Ẩn từ:</span>
                    {[30, 50, 100].map(pct => (
                      <button
                        key={pct}
                        onClick={() => setHidePercentage(pct)}
                        className={`px-3 py-1 rounded-xl font-bold transition-all ${
                          hidePercentage === pct
                            ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
                            : 'dark:bg-slate-950 bg-slate-100 border dark:border-slate-800 border-slate-200 dark:text-slate-400 text-slate-600 hover:text-slate-900 dark:hover:text-white'
                        }`}
                      >
                        {pct}%
                      </button>
                    ))}
                  </div>

                  {/* Dictation interactive sentence input boxes */}
                  <div className="p-6 rounded-2xl dark:bg-slate-950 bg-slate-50 border dark:border-slate-800/80 border-slate-200 min-h-[90px] flex flex-wrap items-center gap-2.5 text-base md:text-lg font-medium leading-loose">
                    {currentQ.words.map((word, wIdx) => {
                      const isBlank = isWordBlank(wIdx);
                      const userVal = userInputs[wIdx] || '';
                      const isCorrect = isWordMatch(userVal, word);

                      if (!isBlank) {
                        return (
                          <span key={wIdx} className="dark:text-slate-300 text-slate-700">
                            {word}
                          </span>
                        );
                      }

                      return (
                        <input
                          key={wIdx}
                          ref={el => inputRefs.current[wIdx] = el}
                          type="text"
                          value={userVal}
                          onChange={(e) => handleInputChange(wIdx, e.target.value)}
                          placeholder="......."
                          className={`w-28 px-2 py-1 rounded-xl border text-center font-mono font-bold text-sm outline-none transition-all ${
                            isCorrect
                              ? 'bg-emerald-500/20 border-emerald-500 text-emerald-700 dark:text-emerald-300'
                              : 'dark:bg-slate-900 bg-white dark:border-slate-700 border-slate-300 text-cyan-600 dark:text-cyan-300 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 shadow-sm'
                          }`}
                        />
                      );
                    })}
                  </div>

                  {/* Hint text */}
                  <div className="text-center">
                    <span className="text-xs text-amber-600 dark:text-amber-400 font-medium">
                      💡 Tắt bộ gõ tiếng Việt để tự chuyển ô khi điền đúng từ
                    </span>
                  </div>

                </div>
              )}

              {/* MODE 3: NGHE FULL (SONG NGỮ ANH - VIỆT) */}
              {subMode === 'full' && (
                <div className="space-y-5">
                  
                  {/* Big Audio Player Controller */}
                  <div className="p-5 rounded-2xl dark:bg-slate-950 bg-slate-50 border dark:border-slate-800 border-slate-200 flex flex-col items-center justify-center space-y-4 shadow-sm">
                    
                    {/* Media buttons */}
                    <div className="flex items-center gap-6">
                      <button
                        onClick={handlePrevSentence}
                        className="p-2 rounded-full dark:bg-slate-900 bg-white dark:text-slate-400 text-slate-600 hover:text-slate-900 dark:hover:text-white border dark:border-transparent border-slate-200 shadow-sm transition-colors"
                        title="Câu trước"
                      >
                        <SkipBack className="w-5 h-5" />
                      </button>

                      <button
                        onClick={playAudio}
                        className="w-14 h-14 rounded-full bg-gradient-to-tr from-cyan-500 to-teal-400 text-slate-950 flex items-center justify-center shadow-xl shadow-cyan-500/20 hover:scale-105 active:scale-95 transition-all"
                      >
                        {isPlaying ? <Pause className="w-6 h-6 fill-slate-950" /> : <Play className="w-6 h-6 fill-slate-950 ml-0.5" />}
                      </button>

                      <button
                        onClick={handleNextSentence}
                        className="p-2 rounded-full dark:bg-slate-900 bg-white dark:text-slate-400 text-slate-600 hover:text-slate-900 dark:hover:text-white border dark:border-transparent border-slate-200 shadow-sm transition-colors"
                        title="Câu tiếp theo"
                      >
                        <SkipForward className="w-5 h-5" />
                      </button>
                    </div>

                    <span className="text-xs font-mono font-bold dark:text-slate-400 text-slate-500">
                      Câu {currentSentenceIdx + 1} / {currentLesson.questions.length}
                    </span>

                    {/* Secondary player options */}
                    <div className="flex items-center gap-4 text-xs dark:text-slate-400 text-slate-500 pt-2 border-t dark:border-slate-900 border-slate-200 w-full justify-center">
                      <button 
                        onClick={() => setIsAutoPlay(!isAutoPlay)}
                        className={`font-semibold transition-colors ${isAutoPlay ? 'text-cyan-600 dark:text-cyan-400' : 'text-slate-400 dark:text-slate-500'}`}
                      >
                        Tự động phát: {isAutoPlay ? 'Bật' : 'Tắt'}
                      </button>
                      <span>•</span>
                      <button 
                        onClick={() => setIsScriptVisible(!isScriptVisible)}
                        className="hover:text-slate-900 dark:hover:text-white transition-colors"
                      >
                        {isScriptVisible ? 'Ẩn script' : 'Hiện script'}
                      </button>
                      <span>•</span>
                      <button 
                        onClick={() => setPlaybackSpeed(prev => prev === 1.0 ? 1.25 : 1.0)}
                        className="font-mono font-bold dark:text-slate-300 text-slate-700 hover:text-slate-900 dark:hover:text-white"
                      >
                        {playbackSpeed}x
                      </button>
                    </div>

                  </div>

                  {/* TRANSCRIPT & TRANSLATION CARDS */}
                  {isScriptVisible && (
                    <div className="space-y-3">
                      {/* Transcript */}
                      <div className="p-5 rounded-2xl dark:bg-slate-950 bg-slate-50 border dark:border-slate-800 border-slate-200 space-y-1.5 shadow-sm">
                        <span className="text-[10px] font-black uppercase tracking-wider text-cyan-600 dark:text-cyan-400">
                          TRANSCRIPT
                        </span>
                        <p className="text-base md:text-lg font-bold dark:text-white text-slate-900 leading-relaxed">
                          {currentQ.sentence}
                        </p>
                      </div>

                      {/* Dịch nghĩa */}
                      <div className="p-5 rounded-2xl dark:bg-slate-950/80 bg-slate-50/80 border dark:border-slate-800/80 border-slate-200 space-y-1.5 shadow-sm">
                        <span className="text-[10px] font-black uppercase tracking-wider text-amber-600 dark:text-amber-400">
                          DỊCH NGHĨA
                        </span>
                        <p className="text-sm md:text-base dark:text-slate-300 text-slate-600 leading-relaxed italic">
                          {currentQ.translation}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* DANH SÁCH CÂU (QUICK NUMBER CAPSULES) */}
                  <div className="p-4 rounded-2xl dark:bg-slate-950 bg-slate-50 border dark:border-slate-800 border-slate-200 space-y-2 shadow-sm">
                    <span className="text-[10px] font-black uppercase tracking-wider dark:text-slate-400 text-slate-500 block">
                      DANH SÁCH CÂU
                    </span>
                    <div className="flex items-center gap-2 flex-wrap">
                      {currentLesson.questions.map((_, idx) => {
                        const isSelected = currentSentenceIdx === idx;
                        const isDone = completedSentences[`${activeLessonIdx}_${idx}`];

                        return (
                          <button
                            key={idx}
                            onClick={() => {
                              setCurrentSentenceIdx(idx);
                              handleResetFlip();
                            }}
                            className={`w-9 h-9 rounded-xl font-mono font-bold text-xs flex items-center justify-center transition-all ${
                              isSelected
                                ? 'bg-cyan-500 text-slate-950 ring-2 ring-cyan-400/40 shadow-md shadow-cyan-500/20'
                                : isDone
                                ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/40'
                                : 'dark:bg-slate-900 bg-white border dark:border-slate-800 border-slate-200 dark:text-slate-400 text-slate-600 hover:text-slate-900 dark:hover:text-white shadow-sm'
                            }`}
                          >
                            {idx + 1}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                </div>
              )}

            </div>

            {/* KEYBOARD SHORTCUTS HINTS BAR (BOTTOM) */}
            <div className="text-center text-[11px] font-semibold text-slate-500 flex items-center justify-center gap-3">
              <span><kbd className="px-1.5 py-0.5 rounded dark:bg-slate-900 bg-slate-100 border dark:border-slate-800 border-slate-200 dark:text-slate-300 text-slate-700 font-mono">Ctrl</kbd> phát lại</span>
              <span>•</span>
              <span><kbd className="px-1.5 py-0.5 rounded dark:bg-slate-900 bg-slate-100 border dark:border-slate-800 border-slate-200 dark:text-slate-300 text-slate-700 font-mono">Tab</kbd> {subMode === 'check' ? 'lật từ' : 'gợi ý từ'}</span>
              <span>•</span>
              <span><kbd className="px-1.5 py-0.5 rounded dark:bg-slate-900 bg-slate-100 border dark:border-slate-800 border-slate-200 dark:text-slate-300 text-slate-700 font-mono">Enter</kbd> câu tiếp theo</span>
            </div>

          </div>

          {/* BOTTOM SPACER BUFFER (Tránh bị thanh cố định che khi cuộn hết cỡ) */}
          <div className="h-28 sm:h-36 shrink-0 pointer-events-none" aria-hidden="true" />

        </main>

      </div>

      {/* ========================================================================= */}
      {/* 3. UNIFIED FIXED BOTTOM NAVIGATION BAR (FIX CỨNG Ở ĐÁY MÀN HÌNH) */}
      {/* ========================================================================= */}
      <footer className="fixed bottom-0 left-0 right-0 z-40 h-16 border-t dark:border-slate-800/90 border-slate-200/90 dark:bg-[#070b14]/95 bg-white/95 backdrop-blur-2xl px-4 sm:px-8 flex items-center justify-between gap-4 shadow-[0_-8px_25px_rgba(0,0,0,0.15)] transition-all">
        {/* Left side: Toggle Sidebar & Shortcuts hints */}
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl dark:bg-slate-900 bg-slate-100 border dark:border-slate-800 border-slate-200 dark:text-slate-300 text-slate-700 text-xs font-bold hover:dark:text-white hover:text-slate-900 transition-colors shadow-sm cursor-pointer"
            title="Bật/tắt danh sách bài"
          >
            {isSidebarOpen ? <PanelLeftClose className="w-4 h-4" /> : <PanelLeftOpen className="w-4 h-4" />}
            <span className="hidden sm:inline">Danh sách bài</span>
          </button>

          <span className="hidden md:inline-flex items-center gap-2 text-[11px] font-mono dark:text-slate-400 text-slate-500">
            <span><kbd className="px-1.5 py-0.5 rounded dark:bg-slate-900 bg-slate-100 border dark:border-slate-800 border-slate-200 font-mono">Ctrl</kbd> phát lại</span>
            <span>•</span>
            <span><kbd className="px-1.5 py-0.5 rounded dark:bg-slate-900 bg-slate-100 border dark:border-slate-800 border-slate-200 font-mono">Tab</kbd> {subMode === 'check' ? 'lật từ' : 'gợi ý từ'}</span>
            <span>•</span>
            <span><kbd className="px-1.5 py-0.5 rounded dark:bg-slate-900 bg-slate-100 border dark:border-slate-800 border-slate-200 font-mono">Enter</kbd> tiếp theo</span>
          </span>
        </div>

        {/* Right side: Prev, Counter, Next */}
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            onClick={handlePrevSentence}
            disabled={activeLessonIdx === 0 && currentSentenceIdx === 0}
            className="p-2 sm:px-3 sm:py-2 rounded-xl dark:bg-slate-900 bg-slate-100 hover:dark:bg-slate-800 hover:bg-slate-200 border dark:border-slate-800 border-slate-200 disabled:opacity-30 dark:text-slate-300 text-slate-700 transition-all font-bold text-xs flex items-center gap-1 cursor-pointer disabled:cursor-not-allowed"
            title="Câu trước (←)"
          >
            <ChevronLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Trước</span>
          </button>

          <div className="px-3 py-1.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 font-mono font-bold text-xs text-emerald-600 dark:text-emerald-400 shadow-sm">
            Câu {currentSentenceIdx + 1}/{currentLesson?.questions?.length || 1}
          </div>

          <button
            onClick={handleNextSentence}
            disabled={activeLessonIdx === currentLessons.length - 1 && currentSentenceIdx === (currentLesson?.questions?.length || 1) - 1}
            className="p-2 sm:px-4 sm:py-2 rounded-xl bg-sky-500 hover:bg-sky-400 disabled:opacity-30 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-md shadow-sky-500/20 transition-all cursor-pointer disabled:cursor-not-allowed"
            title="Câu tiếp theo (→)"
          >
            <span className="hidden sm:inline">Tiếp theo</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </footer>

    </div>
  );
}
