import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import Navbar from '../components/Navbar';
import PricingModal from '../components/PricingModal';
import { ipa42Lessons, questionsByIpaLesson } from '../data/ipaLessonsData';
import { allVideoChapters } from '../data/allVideoChaptersData';
import { allExtraVideoQuestions } from '../data/allVideoQuestionsData';
import { 
  Play, 
  Pause, 
  Volume2, 
  VolumeX,
  Search, 
  ChevronDown, 
  ChevronUp, 
  Crown, 
  CheckCircle2, 
  Clock, 
  Zap, 
  Maximize2,
  ArrowLeft,
  ArrowRight,
  RotateCcw,
  Sparkles,
  BookOpen,
  HelpCircle,
  Award,
  Video,
  Check,
  AlertCircle,
  MonitorPlay,
  ExternalLink,
  Mic,
  Lock
} from 'lucide-react';

export default function VideoLessonRoom() {
  const [sidebarTab, setSidebarTab] = useState('chapter'); // 'chapter' | 'lesson'
  const [searchTerm, setSearchTerm] = useState('');
  const [openChapters, setOpenChapters] = useState([1, 2, 3, 4, 5, 6, 7, 8]);
  const [selectedLessonId, setSelectedLessonId] = useState(allVideoChapters[0]?.lessons[0]?.id || 'd_e426f2f8');
  
  // Pro Access State
  const [isProUser, setIsProUser] = useState(() => {
    try {
      const cached = JSON.parse(localStorage.getItem('tuong_tan_toeic_user') || '{}');
      return Boolean(cached?.isPro || cached?.role === 'admin');
    } catch (_) {
      return false;
    }
  });
  const [showPricingModal, setShowPricingModal] = useState(false);

  useEffect(() => {
    async function checkProStatus() {
      try {
        const token = localStorage.getItem('tuong_tan_toeic_token');
        if (!token) {
          const cached = JSON.parse(localStorage.getItem('tuong_tan_toeic_user') || '{}');
          if (cached.isPro || cached.role === 'admin') setIsProUser(true);
          return;
        }
        const res = await axios.get('/api/v1/user/profile', {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.data?.success && res.data?.data) {
          const proStatus = Boolean(res.data.data.isPro || res.data.data.role === 'admin');
          setIsProUser(proStatus);
          try {
            const cached = JSON.parse(localStorage.getItem('tuong_tan_toeic_user') || '{}');
            if (cached && (cached.isPro !== res.data.data.isPro || cached.role !== res.data.data.role)) {
              localStorage.setItem('tuong_tan_toeic_user', JSON.stringify({
                ...cached,
                isPro: res.data.data.isPro,
                proTier: res.data.data.proTier,
                proExpiresAt: res.data.data.proExpiresAt,
                role: res.data.data.role || cached.role
              }));
            }
          } catch (_) {}
        }
      } catch (e) {
        try {
          const cached = JSON.parse(localStorage.getItem('tuong_tan_toeic_user') || '{}');
          if (cached.isPro || cached.role === 'admin') setIsProUser(true);
        } catch (_) {}
      }
    }
    checkProStatus();
    window.addEventListener('auth_state_changed', checkProStatus);
    return () => window.removeEventListener('auth_state_changed', checkProStatus);
  }, []);

  // Video Player state - Default speed 1.25x as requested by user
  const videoRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1.25); // Default 1.25x
  const [showSubtitles, setShowSubtitles] = useState(true);

  // Exercise Practice state
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [revealedExplanations, setRevealedExplanations] = useState({});
  const [userScore, setUserScore] = useState(0);
  const [isCompletedLesson, setIsCompletedLesson] = useState(false);

  // Full 10 Chapters Structure from modular dataset
  const chapters = allVideoChapters;

  // Find active lesson
  let activeLesson = null;
  for (const ch of chapters) {
    const found = ch.lessons.find((l) => l.id === selectedLessonId);
    if (found) {
      activeLesson = found;
      break;
    }
  }
  if (!activeLesson) {
    activeLesson = chapters[0].lessons[0]; // Default to Chapter 1 Lesson 1
  }

  // Question Banks per Lesson
  const questionsByLesson = {
    v1: [
      {
        id: 1,
        prompt: 'Bài thi TOEIC Quốc Tế Listening & Reading bao gồm tổng cộng bao nhiêu câu hỏi và thời gian làm bài là bao lâu?',
        options: [
          { label: 'A', text: '100 câu - 60 phút' },
          { label: 'B', text: '200 câu - 120 phút (45 phút Nghe + 75 phút Đọc)' },
          { label: 'C', text: '150 câu - 90 phút' },
          { label: 'D', text: '200 câu - 150 phút' }
        ],
        correct: 'B',
        explanation: 'Chính xác! Cấu trúc chuẩn ETS gồm 100 câu Listening (45 phút) và 100 câu Reading (75 phút), tổng 200 câu trong 120 phút.'
      },
      {
        id: 2,
        prompt: 'Thang điểm tối đa của bài thi TOEIC 2 kỹ năng (Listening & Reading) là bao nhiêu điểm?',
        options: [
          { label: 'A', text: '100 điểm' },
          { label: 'B', text: '900 điểm' },
          { label: 'C', text: '990 điểm (Listening: 495, Reading: 495)' },
          { label: 'D', text: '1000 điểm' }
        ],
        correct: 'C',
        explanation: 'Đúng! Mỗi phần thi Nghe và Đọc có điểm tối đa là 495 điểm, tạo nên tổng điểm tuyệt đối là 990 điểm.'
      },
      {
        id: 3,
        prompt: 'Khi làm sai một câu hỏi trong bài thi TOEIC thật của ETS, bạn có bị trừ điểm không?',
        options: [
          { label: 'A', text: 'Có, bị trừ 5 điểm cho mỗi câu sai' },
          { label: 'B', text: 'Không bị trừ điểm, chỉ tính điểm trên tổng số câu làm đúng' },
          { label: 'C', text: 'Bị trừ 50% số điểm của câu đó' },
          { label: 'D', text: 'Tùy thuộc vào từng đợt thi' }
        ],
        correct: 'B',
        explanation: 'Chính xác! ETS không trừ điểm khi trả lời sai. Vì vậy lời khuyên quan trọng nhất là KHÔNG BAO GIỜ để trống bất kỳ ô đáp án nào.'
      }
    ],
    v2: [
      {
        id: 1,
        prompt: 'Hệ thống Ôn Tập Ngắt Quãng (Spaced Repetition SM-2) trên website hoạt động dựa trên nguyên lý nào?',
        options: [
          { label: 'A', text: 'Tự động tính toán chu kỳ lặp lại tối ưu theo đường cong quên lãng Ebbinghaus' },
          { label: 'B', text: 'Yêu cầu học viên học liên tục 100 từ mỗi ngày không nghỉ' },
          { label: 'C', text: 'Bắt buộc học viên phải học lại tất cả các từ từ đầu' },
          { label: 'D', text: 'Chỉ lưu lại các từ bạn đã làm đúng trong đề thi' }
        ],
        correct: 'A',
        explanation: 'Chính xác! Thuật toán SM-2 giúp phân loại từ vựng và tự động lên lịch nhắc nhở ôn tập ngắt quãng đúng thời điểm não bộ sắp quên nhất.'
      }
    ],
    v5: [
      {
        id: 1,
        prompt: 'Trong đề thi Part 5 TOEIC, dấu hiệu để nhận diện dạng câu hỏi Từ Loại là gì?',
        options: [
          { label: 'A', text: '4 Lựa chọn A, B, C, D là các từ hoàn toàn khác nghĩa nhau' },
          { label: 'B', text: '4 Lựa chọn có cùng gốc từ nhưng mang các hậu tố (đuôi) khác nhau' },
          { label: 'C', text: 'Câu có chứa liên từ nối 2 mệnh đề' },
          { label: 'D', text: 'Câu bắt buộc phải dịch nghĩa toàn bộ câu mới làm được' }
        ],
        correct: 'B',
        explanation: 'Chính xác! Dạng câu từ loại có 4 phương án đầu giống nhau nhưng đuôi khác nhau (ví dụ: protect, protective, protectively).'
      },
      {
        id: 2,
        prompt: 'Xét ví dụ trong video: "The new manager is responsible for the overall _______ of the team." Từ cần điền vào chỗ trống là:',
        options: [
          { label: 'A', text: 'effective (tính từ)' },
          { label: 'B', text: 'effectively (trạng từ)' },
          { label: 'C', text: 'effectiveness (danh từ)' },
          { label: 'D', text: 'effect (danh từ/động từ)' }
        ],
        correct: 'C',
        explanation: 'Đúng! Sau tính từ "overall" ta cần một danh từ chỉ tính hiệu quả của cả đội ngũ ("effectiveness").'
      },
      {
        id: 3,
        prompt: 'Nhóm hậu tố nào sau đây là các hậu tố phổ biến nhất của DANH TỪ chỉ người trong TOEIC?',
        options: [
          { label: 'A', text: '-er, -ee, -or, -ist, -ian, -ant' },
          { label: 'B', text: '-able, -ous, -ful, -ive' },
          { label: 'C', text: '-ate, -ify, -en, -ize' },
          { label: 'D', text: '-ly, -ward, -wise' }
        ],
        correct: 'A',
        explanation: 'Chính xác! Ví dụ: teacher (-er), employee (-ee), doctor (-or), pianist (-ist), musician (-ian), assistant (-ant).'
      },
      {
        id: 4,
        prompt: 'Theo mẹo "Người chuẩn men thì cần ship vẻ đẹp văn hóa", hậu tố của TÍNH TỪ gồm những đuôi nào?',
        options: [
          { label: 'A', text: '-tion, -ment, -ness, -ship, -ty, -ure' },
          { label: 'B', text: '-able, -ous, -ful, -less, -ive, -al, -ic, -ary' },
          { label: 'C', text: '-ate, -ify, -en, -ize' },
          { label: 'D', text: '-ce, -ee, -or, -ist' }
        ],
        correct: 'B',
        explanation: 'Đúng! Các hậu tố tính từ kinh điển gồm: -able (comfortable), -ous (dangerous), -ful (helpful), -ive (creative), -al (national), v.v.'
      },
      {
        id: 5,
        prompt: 'Quy tắc cơ bản để tạo thành TRẠNG TỪ trong tiếng Anh là gì?',
        options: [
          { label: 'A', text: 'Lấy Danh từ + đuôi -ly' },
          { label: 'B', text: 'Lấy Động từ + đuôi -ing' },
          { label: 'C', text: 'Lấy Tính từ + đuôi -ly (ví dụ: safe -> safely, perfect -> perfectly)' },
          { label: 'D', text: 'Thêm tiền tố un- vào trước động từ' }
        ],
        correct: 'C',
        explanation: 'Chính xác! Đa phần trạng từ được tạo thành bằng công thức: Tính từ + ly (safe -> safely, careful -> carefully).'
      }
    ],
    v6: [
      {
        id: 1,
        prompt: 'Cấu trúc hoàn chỉnh nhất của một Cụm Danh Từ (Noun Phrase) trong tiếng Anh là gì?',
        options: [
          { label: 'A', text: 'Động từ + Trạng từ + Danh từ' },
          { label: 'B', text: 'Mạo từ/Hạn định từ + (Trạng từ) + Tính từ + Danh từ chính' },
          { label: 'C', text: 'Tính từ + Giới từ + Danh từ' },
          { label: 'D', text: 'Liên từ + Danh từ + Động từ' }
        ],
        correct: 'B',
        explanation: 'Chính xác! Ví dụ: "a very successful marketing campaign" (Mạo từ + Trạng từ + Tính từ + Danh từ chính).'
      },
      {
        id: 2,
        prompt: 'Trong câu: "The company will provide a _____ explanation of the new policy.", từ cần điền vào chỗ trống là:',
        options: [
          { label: 'A', text: 'comprehensively (trạng từ)' },
          { label: 'B', text: 'comprehensive (tính từ)' },
          { label: 'C', text: 'comprehend (động từ)' },
          { label: 'D', text: 'comprehension (danh từ)' }
        ],
        correct: 'B',
        explanation: 'Đúng! Đứng giữa mạo từ "a" và danh từ "explanation" cần một Tính từ ("comprehensive" = toàn diện).'
      },
      {
        id: 3,
        prompt: 'Trong cụm danh từ "an extremely successful marketing campaign", từ nào đóng vai trò là Danh từ chính (Head Noun)?',
        options: [
          { label: 'A', text: 'extremely' },
          { label: 'B', text: 'successful' },
          { label: 'C', text: 'marketing' },
          { label: 'D', text: 'campaign' }
        ],
        correct: 'D',
        explanation: 'Chính xác! Danh từ đứng ở vị trí cuối cùng của cụm danh từ luôn là danh từ chính ("campaign" = chiến dịch).'
      },
      {
        id: 4,
        prompt: 'Vị trí của Tính từ (Adjective) trong cụm danh từ là:',
        options: [
          { label: 'A', text: 'Đứng sau danh từ chính' },
          { label: 'B', text: 'Đứng trước danh từ chính để bổ nghĩa trực tiếp cho danh từ' },
          { label: 'C', text: 'Đứng trước mạo từ a/an/the' },
          { label: 'D', text: 'Đứng sau giới từ' }
        ],
        correct: 'B',
        explanation: 'Đúng! Tính từ luôn đứng trước danh từ để bổ sung tính chất, đặc điểm cho danh từ đó.'
      },
      {
        id: 5,
        prompt: '"We received _____ feedback from our international clients." Từ cần điền là:',
        options: [
          { label: 'A', text: 'positive (tính từ)' },
          { label: 'B', text: 'positively (trạng từ)' },
          { label: 'C', text: 'positivity (danh từ)' },
          { label: 'D', text: 'positiveness (danh từ)' }
        ],
        correct: 'A',
        explanation: 'Chính xác! Sau động từ "received" và trước danh từ "feedback" cần một tính từ "positive" (tích cực).'
      }
    ],
    v7: [
      {
        id: 1,
        prompt: 'Danh từ (Noun) có thể giữ những chức năng ngữ pháp nào trong câu?',
        options: [
          { label: 'A', text: 'Chỉ làm Chủ ngữ (Subject)' },
          { label: 'B', text: 'Làm Chủ ngữ, làm Tân ngữ (Object) hoặc đứng sau Giới từ' },
          { label: 'C', text: 'Chỉ đứng sau động từ' },
          { label: 'D', text: 'Chỉ làm bổ ngữ cho trạng từ' }
        ],
        correct: 'B',
        explanation: 'Chính xác! Danh từ có thể đứng đầu câu làm Chủ ngữ, sau động từ làm Tân ngữ hoặc sau giới từ.'
      },
      {
        id: 2,
        prompt: '"Due to recent budget cuts, the director announced a _____ in travel expenses." Từ cần điền là:',
        options: [
          { label: 'A', text: 'reduce (động từ)' },
          { label: 'B', text: 'reduction (danh từ)' },
          { label: 'C', text: 'reduced (tính từ)' },
          { label: 'D', text: 'reducing (V-ing)' }
        ],
        correct: 'B',
        explanation: 'Đúng! Sau mạo từ "a" và trước giới từ "in" bắt buộc phải là một danh từ ("reduction" = sự cắt giảm).'
      },
      {
        id: 3,
        prompt: '"Please submit your completed _____ to the HR department by Friday." Từ cần điền là:',
        options: [
          { label: 'A', text: 'apply (động từ)' },
          { label: 'B', text: 'applicant (danh từ chỉ người)' },
          { label: 'C', text: 'application (danh từ chỉ vật - đơn ứng tuyển)' },
          { label: 'D', text: 'applicable (tính từ)' }
        ],
        correct: 'C',
        explanation: 'Chính xác! Nộp "đơn ứng tuyển" (application), không thể nộp "người ứng tuyển" (applicant).'
      },
      {
        id: 4,
        prompt: 'Đứng ngay sau các giới từ như "of, in, for, with, about, at, on" ta cần điền từ loại nào?',
        options: [
          { label: 'A', text: 'Tính từ (Adjective)' },
          { label: 'B', text: 'Trạng từ (Adverb)' },
          { label: 'C', text: 'Danh từ (Noun) hoặc Danh động từ (V-ing)' },
          { label: 'D', text: 'Động từ nguyên mẫu (V-bare)' }
        ],
        correct: 'C',
        explanation: 'Đúng! Giới từ luôn đi kèm với Danh từ hoặc Cụm danh từ / V-ing để tạo thành cụm giới từ.'
      },
      {
        id: 5,
        prompt: '"The _____ of modern safety equipment has greatly improved factory productivity." Từ cần điền là:',
        options: [
          { label: 'A', text: 'install (động từ)' },
          { label: 'B', text: 'installation (danh từ - sự lắp đặt)' },
          { label: 'C', text: 'installed (tính từ)' },
          { label: 'D', text: 'installer (danh từ chỉ người)' }
        ],
        correct: 'B',
        explanation: 'Chính xác! Sau "The" và trước "of" cần danh từ chỉ việc lắp đặt trang thiết bị ("installation").'
      }
    ],
    v8: [
      {
        id: 1,
        prompt: 'Hiện tượng 2 danh từ đứng cạnh nhau cùng bổ nghĩa tạo thành một cụm mang ý nghĩa mới gọi là gì?',
        options: [
          { label: 'A', text: 'Cụm động từ (Phrasal Verb)' },
          { label: 'B', text: 'Danh từ ghép (Compound Noun)' },
          { label: 'C', text: 'Mệnh đề quan hệ rút gọn' },
          { label: 'D', text: 'Đảo ngữ câu điều kiện' }
        ],
        correct: 'B',
        explanation: 'Chính xác! Ví dụ: identification card (thẻ căn cước), training session (buổi đào tạo), safety regulations (quy định an toàn).'
      },
      {
        id: 2,
        prompt: 'Trong một Danh Từ Ghép (Compound Noun), danh từ nào đóng vai trò là Danh từ chính?',
        options: [
          { label: 'A', text: 'Danh từ đứng đầu tiên' },
          { label: 'B', text: 'Danh từ đứng ở vị trí sau cùng' },
          { label: 'C', text: 'Cả 2 danh từ đều là danh từ chính' },
          { label: 'D', text: 'Không có danh từ chính' }
        ],
        correct: 'B',
        explanation: 'Đúng! Danh từ đứng phía trước đóng vai trò như một tính từ bổ nghĩa, còn danh từ đứng sau cùng là danh từ chính quyết định ý nghĩa và số ít/số nhiều.'
      },
      {
        id: 3,
        prompt: '"All passengers must present their _____ card before boarding the flight." Từ cần điền là:',
        options: [
          { label: 'A', text: 'identify (động từ)' },
          { label: 'B', text: 'identification (danh từ ghép: identification card)' },
          { label: 'C', text: 'identifiably (trạng từ)' },
          { label: 'D', text: 'identified (tính từ)' }
        ],
        correct: 'B',
        explanation: 'Chính xác! Cụm danh từ ghép quen thuộc trong TOEIC: "identification card" = thẻ nhận dạng / CCCD.'
      },
      {
        id: 4,
        prompt: 'Danh từ đứng trước trong một danh từ ghép thường có dạng:',
        options: [
          { label: 'A', text: 'Luôn luôn ở dạng số nhiều có -s' },
          { label: 'B', text: 'Thường ở dạng số ít, đóng vai trò bổ nghĩa cho danh từ sau' },
          { label: 'C', text: 'Bắt buộc thêm đuôi -ing' },
          { label: 'D', text: 'Bắt buộc là tính từ' }
        ],
        correct: 'B',
        explanation: 'Đúng! Ví dụ: "account number" (không dùng accounts number), "bus stop" (không dùng buses stop).'
      },
      {
        id: 5,
        prompt: '"The HR department organized an orientation _____ for all new interns." Từ cần điền là:',
        options: [
          { label: 'A', text: 'session (danh từ - buổi họp/phiên học)' },
          { label: 'B', text: 'sessionally (trạng từ)' },
          { label: 'C', text: 'sessioned (tính từ)' },
          { label: 'D', text: 'sessional (tính từ)' }
        ],
        correct: 'A',
        explanation: 'Chính xác! Cụm danh từ ghép "orientation session" = buổi định hướng.'
      }
    ],
    v9: [
      {
        id: 1,
        prompt: 'Quy tắc ngữ pháp quan trọng nhất về Danh Từ Đếm Được Số Ít (Singular Countable Noun) trong Part 5 là gì?',
        options: [
          { label: 'A', text: 'Có thể đứng một mình mà không cần từ hạn định' },
          { label: 'B', text: 'Bắt buộc phải có Mạo từ (a, an, the) hoặc Từ hạn định (this, that, every, my, your...) đi kèm' },
          { label: 'C', text: 'Luôn luôn phải thêm đuôi -s hoặc -es' },
          { label: 'D', text: 'Luôn đi với động từ số nhiều' }
        ],
        correct: 'B',
        explanation: 'Chính xác! Danh từ đếm được số ít KHÔNG BAO GIỜ đứng trơ trọi một mình trong tiếng Anh chuẩn.'
      },
      {
        id: 2,
        prompt: '"Every _____ must wear a visitor badge while inside the facility." Từ cần điền là:',
        options: [
          { label: 'A', text: 'visitors (danh từ số nhiều)' },
          { label: 'B', text: 'visitor (danh từ số ít)' },
          { label: 'C', text: 'visitation (danh từ)' },
          { label: 'D', text: 'visiting (V-ing)' }
        ],
        correct: 'B',
        explanation: 'Đúng! Sau "Every" và "Each" luôn là một danh từ đếm được số ít ("visitor").'
      },
      {
        id: 3,
        prompt: 'Nếu chỗ trống là một danh từ đếm được mà phía trước KHÔNG có a/an/the hay từ sở hữu, ta phải chọn đáp án nào?',
        options: [
          { label: 'A', text: 'Danh từ số ít' },
          { label: 'B', text: 'Danh từ số nhiều (có đuôi -s / -es)' },
          { label: 'C', text: 'Động từ nguyên mẫu' },
          { label: 'D', text: 'Trạng từ' }
        ],
        correct: 'B',
        explanation: 'Chính xác! Khi không có mạo từ thì danh từ đếm được bắt buộc phải ở dạng số nhiều để câu đúng ngữ pháp.'
      }
    ]
  };

  const currentQuestions = 
    allExtraVideoQuestions[selectedLessonId] || 
    questionsByIpaLesson[selectedLessonId] || 
    questionsByLesson[selectedLessonId] || 
    Object.values(allExtraVideoQuestions)[0] || 
    [];
  const currentQ = currentQuestions[currentQuestionIdx] || currentQuestions[0];
  const userChoice = selectedAnswers[currentQuestionIdx];
  const isAnswered = Boolean(userChoice);
  const isCorrect = userChoice === currentQ.correct;

  // Helper for YouTube embed
  const getYoutubeEmbedUrl = (url, id) => {
    if (id) return `https://www.youtube.com/embed/${id}?autoplay=0&rel=0&modestbranding=1`;
    if (!url) return null;
    const match = url.match(/(?:v=|youtu\.be\/|embed\/)([a-zA-Z0-9_-]{11})/);
    return match ? `https://www.youtube.com/embed/${match[1]}?autoplay=0&rel=0&modestbranding=1` : null;
  };

  const isYoutube = Boolean(
    activeLesson.youtubeId || 
    (activeLesson.videoUrl && (activeLesson.videoUrl.includes('youtube.com') || activeLesson.videoUrl.includes('youtu.be')))
  );

  const activeYtId = activeLesson.youtubeId || (activeLesson.videoUrl ? (activeLesson.videoUrl.match(/(?:v=|youtu\.be\/|embed\/)([a-zA-Z0-9_-]{11})/)?.[1]) : null);
  const activeLessonThumb = activeYtId ? `https://img.youtube.com/vi/${activeYtId}/hqdefault.jpg` : null;

  // Apply playback speed on load and when speed changes
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.playbackRate = playbackSpeed;
    }
  }, [playbackSpeed, selectedLessonId]);

  // When changing lesson, reset question index and player
  const handleSelectLesson = (lesId) => {
    setSelectedLessonId(lesId);
    setCurrentQuestionIdx(0);
    setSelectedAnswers({});
    setRevealedExplanations({});
    setIsPlaying(false);

    // If selected lesson is VIP and user is not VIP, open pricing modal
    const target = chapters.flatMap(c => c.lessons).find(l => l.id === lesId);
    if (target?.isPro && !isProUser) {
      setShowPricingModal(true);
    }
  };

  // Toggle Chapter Accordion
  const toggleChapter = (cId) => {
    setOpenChapters(prev => 
      prev.includes(cId) ? prev.filter(id => id !== cId) : [...prev, cId]
    );
  };

  // Video Controls
  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
      setDuration(videoRef.current.duration || 0);
    }
  };

  const handleSeek = (e) => {
    const seekTime = Number(e.target.value);
    if (videoRef.current) {
      videoRef.current.currentTime = seekTime;
      setCurrentTime(seekTime);
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const handleSpeedChange = (speed) => {
    if (videoRef.current) {
      videoRef.current.playbackRate = speed;
      setPlaybackSpeed(speed);
    }
  };

  const formatTime = (secs) => {
    const mins = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${mins < 10 ? '0' : ''}${mins}:${s < 10 ? '0' : ''}${s}`;
  };

  // Handle Answer Selection
  const handleSelectOption = (label) => {
    if (isAnswered) return;
    const newAnswers = { ...selectedAnswers, [currentQuestionIdx]: label };
    setSelectedAnswers(newAnswers);
    setRevealedExplanations(prev => ({ ...prev, [currentQuestionIdx]: true }));

    if (label === currentQ.correct) {
      setUserScore(prev => prev + 20);
    }

    if (Object.keys(newAnswers).length === currentQuestions.length) {
      setIsCompletedLesson(true);
    }
  };

  const handleResetQuestion = () => {
    const newAnswers = { ...selectedAnswers };
    delete newAnswers[currentQuestionIdx];
    setSelectedAnswers(newAnswers);
  };

  return (
    <div className="min-h-screen dark:bg-[#070b14] bg-[#f8fafc] dark:text-slate-100 text-slate-900 flex flex-col font-sans pb-16 transition-colors duration-200">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        
        {/* Breadcrumb Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 pb-5 border-b dark:border-slate-800/80 border-slate-200 mb-6">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              {activeLesson.isPro ? (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#0284c7] text-white text-xs font-black shadow-md shadow-sky-500/20">
                  <Zap className="w-3.5 h-3.5 fill-white" />
                  <span>Khóa học VIP Premium</span>
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs font-bold">
                  <span>Free</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                </span>
              )}
              <span className="text-xs text-slate-400">·</span>
              <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">{activeLesson.badge || 'Bài Học Video Chuẩn ETS'}</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black font-heading dark:text-white text-slate-900">
              {activeLesson.title}
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <div className="px-3.5 py-1.5 rounded-xl dark:bg-slate-900 bg-white border dark:border-slate-800 border-slate-200 text-xs font-mono dark:text-amber-400 text-amber-600 font-bold flex items-center gap-1.5 shadow-sm">
              <Zap className="w-4 h-4 fill-amber-400" />
              <span>+{userScore} XP</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* LEFT COLUMN: VIDEO PLAYER & PRACTICE EXERCISES (8 COLS) */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* VIDEO PLAYER CONTAINER */}
            <div className="rounded-3xl border dark:border-slate-800 border-slate-200 overflow-hidden dark:bg-[#0c1222] bg-white shadow-xl p-4 sm:p-6 space-y-4">
              
              {/* HTML5 Custom Video Player OR YouTube Embed OR VIP Lock Overlay */}
              <div className="relative aspect-video rounded-2xl overflow-hidden bg-slate-950 border dark:border-slate-800 border-slate-200 flex items-center justify-center group">
                {activeLesson.isPro && !isProUser ? (
                  <div className="relative w-full h-full flex flex-col items-center justify-center text-center p-6 select-none overflow-hidden">
                    {/* Background blurred thumbnail */}
                    {activeLessonThumb && (
                      <img 
                        src={activeLessonThumb} 
                        alt={activeLesson.title} 
                        className="absolute inset-0 w-full h-full object-cover blur-md opacity-20 scale-110 pointer-events-none"
                      />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/85 to-slate-950/70 pointer-events-none" />

                    <div className="relative z-10 max-w-lg mx-auto space-y-3 sm:space-y-4 flex flex-col items-center">
                      <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center shadow-xl shadow-amber-500/25 ring-4 ring-amber-400/20">
                        <Crown className="w-7 h-7 sm:w-8 sm:h-8 text-slate-950" />
                      </div>

                      <div className="space-y-1">
                        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sky-500/20 border border-sky-500/40 text-sky-400 text-[11px] font-black uppercase tracking-wider">
                          <Zap className="w-3 h-3 fill-sky-400" />
                          Nội Dung Dành Riêng Cho Học Viên VIP
                        </div>
                        <h3 className="text-base sm:text-lg font-black text-white line-clamp-2">
                          {activeLesson.title}
                        </h3>
                        <p className="text-xs text-slate-300 line-clamp-2 max-w-md">
                          Mở khóa toàn bộ 100+ video bài giảng ngữ pháp Part 5, phát âm IPA bản ngữ và 18.200 câu hỏi đề thi ETS chỉ với duy nhất một gói VIP Khai Trương.
                        </p>
                      </div>

                      <button
                        onClick={() => setShowPricingModal(true)}
                        className="px-6 py-3 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-black text-xs sm:text-sm shadow-xl shadow-amber-500/25 flex items-center gap-2 transition-all hover:scale-105 active:scale-95 cursor-pointer"
                      >
                        <Crown className="w-4 h-4 text-slate-950" />
                        <span>MỞ KHÓA VIP 99K (4 THÁNG)</span>
                      </button>

                      <p className="text-[11px] text-slate-400 font-mono">
                        ⚡ Kích hoạt tức thì qua mã VietQR tự động · Sử dụng trọn vẹn 120 ngày
                      </p>
                    </div>
                  </div>
                ) : isYoutube ? (
                  <iframe
                    key={activeLesson.id}
                    src={getYoutubeEmbedUrl(activeLesson.videoUrl, activeLesson.youtubeId)}
                    title={activeLesson.title}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                    className="w-full h-full rounded-2xl border-0"
                  />
                ) : (
                  <>
                    <video
                      ref={videoRef}
                      key={activeLesson.videoUrl || selectedLessonId}
                      src={activeLesson.videoUrl || '/videos/toeic_structure_scoring.mp4'}
                      onTimeUpdate={handleTimeUpdate}
                      onLoadedMetadata={() => {
                        if (videoRef.current) videoRef.current.playbackRate = playbackSpeed;
                      }}
                      onEnded={() => setIsPlaying(false)}
                      className="w-full h-full object-contain cursor-pointer"
                      onClick={togglePlay}
                      playsInline
                      autoPlay={false}
                    />

                    {/* Big Center Play Button Overlay when paused */}
                    {!isPlaying && (
                      <button
                        onClick={togglePlay}
                        className="absolute inset-0 m-auto w-20 h-20 rounded-full bg-sky-500/90 text-slate-950 flex items-center justify-center shadow-2xl shadow-sky-500/40 hover:scale-110 active:scale-95 transition-all z-20"
                      >
                        <Play className="w-8 h-8 fill-current ml-1" />
                      </button>
                    )}

                    {/* Bottom Video Controls Bar Overlay */}
                    <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-slate-950/95 via-slate-950/70 to-transparent flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity z-20">
                      
                      {/* Seek Bar Slider */}
                      <input
                        type="range"
                        min={0}
                        max={duration || 100}
                        value={currentTime}
                        onChange={handleSeek}
                        className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-sky-400"
                      />

                      {/* Buttons Row */}
                      <div className="flex items-center justify-between text-xs text-slate-300">
                        <div className="flex items-center gap-3">
                          <button onClick={togglePlay} className="hover:text-sky-400 transition-colors">
                            {isPlaying ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current" />}
                          </button>

                          <button onClick={toggleMute} className="hover:text-sky-400 transition-colors">
                            {isMuted ? <VolumeX className="w-5 h-5 text-rose-400" /> : <Volume2 className="w-5 h-5" />}
                          </button>

                          <span className="font-mono text-xs">
                            {formatTime(currentTime)} / {formatTime(duration)}
                          </span>
                        </div>

                        {/* SPEED CONTROLS (DEFAULT 1.25x, 1.5x, 1.75x, 2.0x) */}
                        <div className="flex items-center gap-1.5 font-mono">
                          <span className="text-[10px] text-slate-500 mr-1 hidden sm:inline">Tốc độ:</span>
                          {[1.25, 1.5, 1.75, 2.0].map((spd) => (
                            <button
                              key={spd}
                              onClick={() => handleSpeedChange(spd)}
                              className={`px-2 py-0.5 rounded text-[11px] font-black transition-all ${
                                playbackSpeed === spd 
                                  ? 'bg-sky-500 text-slate-950 shadow-md shadow-sky-500/20 scale-105' 
                                  : 'bg-slate-800 text-slate-400 hover:text-white'
                              }`}
                            >
                              {spd}x {spd === 1.25 && '⚡'}
                            </button>
                          ))}

                          <button 
                            onClick={() => {
                              if (videoRef.current) {
                                if (videoRef.current.requestFullscreen) videoRef.current.requestFullscreen();
                              }
                            }}
                            className="p-1 hover:text-sky-400 ml-1"
                          >
                            <Maximize2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                    </div>
                  </>
                )}
              </div>

              {/* Subtitle / Script Summary Banner */}
              <div className="p-4 rounded-2xl dark:bg-slate-900/90 bg-slate-50 border dark:border-slate-800 border-slate-200 space-y-1.5 text-xs select-text">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sky-600 dark:text-sky-400 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Tóm tắt bài học (Tường Tận TOEIC AI):</span>
                  </span>
                  <span className="text-[10px] font-mono dark:text-slate-400 text-slate-500">{isYoutube ? 'Video Giảng Viên Bản Ngữ YouTube' : `Tốc độ chuẩn ${playbackSpeed}x`}</span>
                </div>
                <p className="dark:text-slate-200 text-slate-700 leading-relaxed italic">
                  {activeLesson.description || 'Nắm vững kiến thức trọng tâm và thực hành các câu hỏi bài tập ngay bên dưới video.'}
                </p>
              </div>

              {/* IPA SPECIFIC THEORY, MOUTH DIAGRAM & VOCABULARY CARD */}
              {activeLesson.soundSymbol && (
                <div className="p-5 rounded-2xl dark:bg-slate-900/90 bg-slate-50 border dark:border-slate-800 border-slate-200 space-y-4 text-xs">
                  <div className="flex flex-wrap items-center justify-between gap-3 border-b dark:border-slate-800 border-slate-200 pb-3">
                    <div className="flex items-center gap-2">
                      <span className="px-3 py-1 rounded-lg bg-sky-500/20 border border-sky-500/40 text-sky-600 dark:text-sky-300 font-mono text-base font-black">
                        {activeLesson.soundSymbol}
                      </span>
                      <span className="font-bold dark:text-white text-slate-900 text-sm">Hướng dẫn phát âm chuẩn âm {activeLesson.soundSymbol}</span>
                    </div>
                    <span className="dark:text-slate-400 text-slate-600 text-[11px] dark:bg-slate-800 bg-slate-200 px-2.5 py-1 rounded-full font-medium">42 Ngày Phát Âm IPA</span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start">
                    {/* Diagram */}
                    {activeLesson.diagramUrl && (
                      <div className="dark:bg-slate-900 bg-white p-3 rounded-xl border dark:border-slate-800 border-slate-200 flex flex-col items-center gap-2 shadow-sm">
                        <span className="text-[11px] dark:text-slate-400 text-slate-600 font-medium">Sơ đồ khẩu hình miệng</span>
                        <img 
                          src={activeLesson.diagramUrl} 
                          alt={`Khẩu hình âm ${activeLesson.soundSymbol}`} 
                          className="h-32 object-contain rounded-lg dark:bg-white/5 bg-slate-50 p-2"
                        />
                      </div>
                    )}

                    {/* Theory */}
                    <div className={`${activeLesson.diagramUrl ? 'md:col-span-2' : 'md:col-span-3'} space-y-2 dark:text-slate-300 text-slate-700 leading-relaxed`}>
                      <span className="font-bold dark:text-amber-400 text-amber-600 flex items-center gap-1.5 text-xs">
                        <BookOpen className="w-3.5 h-3.5" />
                        <span>Kỹ thuật đặt lưỡi & luồng hơi:</span>
                      </span>
                      <p className="whitespace-pre-line text-[12px] dark:bg-slate-900 bg-white p-3 rounded-xl border dark:border-slate-800/80 border-slate-200 font-sans leading-relaxed shadow-sm">
                        {activeLesson.theory || activeLesson.description}
                      </p>
                    </div>
                  </div>

                  {/* Example Words */}
                  {activeLesson.wordsEnriched && activeLesson.wordsEnriched.length > 0 && (
                    <div className="space-y-2 pt-2 border-t dark:border-slate-800 border-slate-200">
                      <span className="font-bold text-emerald-600 dark:text-emerald-400 text-xs">Từ vựng mẫu chứa âm {activeLesson.soundSymbol}:</span>
                      <div className="flex flex-wrap gap-2">
                        {activeLesson.wordsEnriched.map((w, idx) => (
                          <div key={idx} className="px-3 py-1.5 rounded-xl dark:bg-slate-900 bg-white border dark:border-slate-800 border-slate-200 flex items-center gap-2 shadow-sm">
                            <span className="font-bold dark:text-white text-slate-900 text-xs">{w.text}</span>
                            <span className="text-sky-600 dark:text-sky-400 font-mono text-[11px]">{w.phonetic}</span>
                            <span className="text-slate-500 text-[11px]">• {w.meaning}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Example Sentences */}
                  {activeLesson.sentencesEnriched && activeLesson.sentencesEnriched.length > 0 && (
                    <div className="space-y-2 pt-2 border-t dark:border-slate-800 border-slate-200">
                      <span className="font-bold text-purple-600 dark:text-purple-400 text-xs">Câu luyện phát âm:</span>
                      <div className="space-y-1.5">
                        {activeLesson.sentencesEnriched.map((s, idx) => (
                          <div key={idx} className="p-2.5 rounded-xl dark:bg-slate-900 bg-white border dark:border-slate-800/80 border-slate-200 text-[12px] shadow-sm">
                            <p className="dark:text-white text-slate-900 font-medium italic">"{s.text}"</p>
                            <p className="dark:text-slate-400 text-slate-600 text-[11px] mt-0.5">{s.meaning}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

            </div>

            {/* PRACTICE EXERCISES DIRECTLY UNDER VIDEO */}
            {activeLesson.isPro && !isProUser ? (
              <div className="rounded-3xl border dark:border-slate-800 border-slate-200 p-8 space-y-4 dark:bg-[#0c1222] bg-white shadow-xl text-center flex flex-col items-center justify-center">
                <div className="w-14 h-14 rounded-2xl bg-sky-500/10 border border-sky-500/30 flex items-center justify-center text-sky-400 shadow-md">
                  <Lock className="w-6 h-6" />
                </div>
                <div className="max-w-md space-y-1.5">
                  <h3 className="font-heading font-black text-base sm:text-lg dark:text-white text-slate-900">
                    Bài tập củng cố kiến thức đang được khóa
                  </h3>
                  <p className="text-xs dark:text-slate-400 text-slate-600 leading-relaxed">
                    Nâng cấp lên gói VIP Khai Trương (99.000 ₫ / 4 Tháng) để mở khóa toàn bộ câu hỏi trắc nghiệm, lời giải chi tiết và tích lũy XP bài học này.
                  </p>
                </div>
                <button
                  onClick={() => setShowPricingModal(true)}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 text-xs font-black flex items-center gap-2 shadow-lg shadow-amber-500/25 transition-all hover:scale-105 active:scale-95 cursor-pointer"
                >
                  <Crown className="w-4 h-4 text-slate-950" />
                  <span>Mở khóa VIP ngay (99.000 ₫)</span>
                </button>
              </div>
            ) : (
              <div className="rounded-3xl border dark:border-slate-800 border-slate-200 p-6 sm:p-8 space-y-6 dark:bg-[#0c1222] bg-white shadow-xl">
                
                {/* Header */}
                <div className="flex items-center justify-between border-b dark:border-slate-800 border-slate-200 pb-3">
                  <div className="flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-emerald-500 dark:text-emerald-400" />
                    <h3 className="font-heading font-extrabold text-base dark:text-white text-slate-900">
                      Bài tập củng cố kiến thức video
                    </h3>
                  </div>

                  <div className="flex items-center gap-2 text-xs font-mono">
                    <span className="text-emerald-600 dark:text-emerald-400 font-bold">Câu {currentQuestionIdx + 1}/{currentQuestions.length}</span>
                    <span className="text-slate-400">•</span>
                    <span className="text-amber-600 dark:text-amber-400 font-bold">{Object.keys(selectedAnswers).length}/{currentQuestions.length} Đã làm</span>
                  </div>
                </div>

                {/* Question Navigation Bubbles */}
                <div className="flex items-center gap-2 flex-wrap">
                  {currentQuestions.map((_, qIdx) => {
                    const answered = selectedAnswers[qIdx];
                    const correct = answered === currentQuestions[qIdx].correct;
                    const isCurrent = currentQuestionIdx === qIdx;

                    let bubbleColor = 'dark:bg-slate-900 bg-slate-100 dark:border-slate-800 border-slate-200 dark:text-slate-400 text-slate-600 hover:bg-slate-200 dark:hover:bg-slate-800';
                    if (answered) {
                      bubbleColor = correct ? 'bg-emerald-500/20 border-emerald-500 text-emerald-600 dark:text-emerald-400 font-bold' : 'bg-rose-500/20 border-rose-500 text-rose-600 dark:text-rose-400 font-bold';
                    } else if (isCurrent) {
                      bubbleColor = 'bg-sky-500 text-slate-950 font-bold border-sky-400 shadow-md shadow-sky-500/20';
                    }

                    return (
                      <button
                        key={qIdx}
                        onClick={() => setCurrentQuestionIdx(qIdx)}
                        className={`w-9 h-9 rounded-xl border text-xs font-mono font-bold transition-all flex items-center justify-center ${bubbleColor}`}
                      >
                        {qIdx + 1}
                      </button>
                    );
                  })}
                </div>

                {/* Question Prompt Card */}
                {currentQ && (
                  <div className="p-6 rounded-2xl dark:bg-slate-950/90 bg-slate-50 border dark:border-slate-800 border-slate-200 space-y-4 shadow-sm">
                    <p className="font-semibold text-sm sm:text-base dark:text-slate-100 text-slate-900 select-text leading-relaxed">
                      <span className="text-sky-600 dark:text-sky-400 font-bold font-mono">Câu {currentQuestionIdx + 1}: </span>
                      {currentQ.prompt}
                    </p>

                    {/* 4 Radio Options */}
                    <div className="space-y-3 pt-2">
                      {currentQ.options?.map((opt) => {
                        const isSelected = userChoice === opt.label;
                        const isCorrectChoice = opt.label === currentQ.correct;

                        let optStyle = 'dark:bg-slate-900 bg-white hover:bg-slate-100/80 dark:hover:bg-slate-800 dark:border-slate-800 border-slate-200 dark:text-slate-200 text-slate-800 shadow-sm';
                        if (isAnswered) {
                          if (isCorrectChoice) {
                            optStyle = 'bg-emerald-500/20 border-emerald-500 text-emerald-700 dark:text-emerald-300 font-bold shadow-md shadow-emerald-500/10';
                          } else if (isSelected) {
                            optStyle = 'bg-rose-500/20 border-rose-500 text-rose-700 dark:text-rose-300 font-bold shadow-md shadow-rose-500/10';
                          }
                        }

                        return (
                          <button
                            key={opt.label}
                            onClick={() => handleSelectOption(opt.label)}
                            disabled={isAnswered}
                            className={`w-full p-4 rounded-2xl border text-left text-xs sm:text-sm font-semibold flex items-center gap-4 transition-all ${optStyle}`}
                          >
                            <div className={`w-7 h-7 rounded-xl border flex items-center justify-center text-xs font-mono font-black shrink-0 ${
                              isAnswered && isCorrectChoice 
                                ? 'bg-emerald-500 text-slate-950 border-emerald-400' 
                                : isAnswered && isSelected 
                                ? 'bg-rose-500 text-white border-rose-400' 
                                : 'dark:bg-slate-800 bg-slate-100 dark:border-slate-700 border-slate-300 dark:text-slate-400 text-slate-700'
                            }`}>
                              {opt.label}
                            </div>
                            <span className="flex-1 select-text">{opt.text}</span>
                            {isAnswered && isCorrectChoice && <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />}
                          </button>
                        );
                      })}
                    </div>

                    {/* Explanation Box */}
                    {isAnswered && (
                      <div className="p-4 rounded-2xl dark:bg-slate-900 bg-emerald-50/70 border dark:border-slate-800 border-emerald-200/80 space-y-2 animate-fadeIn select-text">
                        <div className="flex items-center gap-2 text-xs font-bold font-mono">
                          {isCorrect ? (
                            <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                              <CheckCircle2 className="w-4 h-4" /> Chính xác! (+20 XP)
                            </span>
                          ) : (
                            <span className="text-rose-600 dark:text-rose-400 flex items-center gap-1">
                              <AlertCircle className="w-4 h-4" /> Chưa chính xác. Đáp án đúng là {currentQ.correct}
                            </span>
                          )}
                        </div>
                        <p className="text-xs dark:text-slate-300 text-slate-700 leading-relaxed">
                          {currentQ.explanation}
                        </p>
                      </div>
                    )}

                  </div>
                )}

                {/* Bottom Nav Actions */}
                <div className="flex items-center justify-between pt-2">
                  <button
                    disabled={currentQuestionIdx === 0}
                    onClick={() => setCurrentQuestionIdx(prev => Math.max(0, prev - 1))}
                    className="px-4 py-2.5 rounded-xl dark:bg-slate-900 bg-slate-100 hover:bg-slate-200 dark:hover:bg-slate-800 border dark:border-slate-800 border-slate-200 dark:text-slate-300 text-slate-700 text-xs font-bold flex items-center gap-2 disabled:opacity-30"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Câu trước</span>
                  </button>

                  {isAnswered && (
                    <button
                      onClick={handleResetQuestion}
                      className="px-3 py-2 rounded-xl dark:text-slate-400 text-slate-600 hover:text-slate-900 dark:hover:text-white text-xs font-semibold flex items-center gap-1.5"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Làm lại câu này</span>
                    </button>
                  )}

                  <button
                    disabled={currentQuestionIdx === currentQuestions.length - 1}
                    onClick={() => setCurrentQuestionIdx(prev => Math.min(currentQuestions.length - 1, prev + 1))}
                    className="px-5 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 text-xs font-black flex items-center gap-2 disabled:opacity-30 shadow-md shadow-sky-500/20"
                  >
                    <span>Câu tiếp theo</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>

              </div>
            )}

          </div>

          {/* RIGHT COLUMN: CHAPTER & LESSON SIDEBAR (4 COLS) */}
          <div className="lg:col-span-4 rounded-3xl border dark:border-slate-800 border-slate-200 p-5 space-y-4 dark:bg-[#0c1222] bg-white sticky top-20 shadow-xl dark:shadow-slate-950/50 shadow-slate-200/50">
            
            {/* Search Input */}
            <div className="relative">
              <Search className="w-4 h-4 dark:text-slate-500 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Tìm bài học..."
                className="w-full pl-10 pr-8 py-2.5 rounded-xl dark:bg-slate-950 bg-slate-50 border dark:border-slate-800 border-slate-200 text-xs dark:text-white text-slate-900 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-sky-500 focus:ring-1 focus:ring-sky-500 outline-none transition-all"
              />
              {searchTerm && (
                <button 
                  onClick={() => setSearchTerm('')}
                  className="absolute right-3 top-3 text-slate-400 hover:text-slate-700 dark:text-slate-500 dark:hover:text-white text-xs"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Sidebar View Tabs (Chương vs Bài) */}
            <div className="flex items-center gap-1.5 p-1 rounded-xl dark:bg-slate-950 bg-slate-100 border dark:border-slate-800 border-slate-200">
              <button
                onClick={() => setSidebarTab('chapter')}
                className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                  sidebarTab === 'chapter'
                    ? 'bg-sky-500 text-slate-950 shadow-md shadow-sky-500/20'
                    : 'dark:text-slate-400 text-slate-600 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>Theo Chương</span>
              </button>

              <button
                onClick={() => setSidebarTab('lesson')}
                className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                  sidebarTab === 'lesson'
                    ? 'bg-sky-500 text-slate-950 shadow-md shadow-sky-500/20'
                    : 'dark:text-slate-400 text-slate-600 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Video className="w-3.5 h-3.5" />
                <span>Danh Sách Bài</span>
              </button>
            </div>

            {/* TAB 1: THEO CHƯƠNG (CHAPTER ACCORDION) */}
            {sidebarTab === 'chapter' && (
              <div className="space-y-3 max-h-[620px] overflow-y-auto pr-1 text-xs scrollbar-thin dark:scrollbar-thumb-slate-800 scrollbar-thumb-slate-300">
                {chapters.map((c) => {
                  const filteredLessons = c.lessons.filter(l => 
                    !searchTerm.trim() || 
                    l.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                    c.title.toLowerCase().includes(searchTerm.toLowerCase())
                  );
                  if (searchTerm.trim() && filteredLessons.length === 0) return null;

                  const isOpen = openChapters.includes(c.id) || Boolean(searchTerm.trim());
                  return (
                    <div key={c.id} className="border dark:border-slate-800/80 border-slate-200 rounded-2xl dark:bg-slate-950/50 bg-slate-50/70 overflow-hidden">
                      <button
                        onClick={() => toggleChapter(c.id)}
                        className="w-full flex items-center justify-between text-left p-3.5 font-bold dark:text-slate-200 text-slate-800 hover:text-sky-600 dark:hover:text-sky-400 dark:hover:bg-slate-900/60 hover:bg-slate-100/80 transition-colors"
                      >
                        <div className="flex items-center gap-2 pr-2">
                          <span className="line-clamp-1 text-xs font-bold dark:text-white text-slate-900">{c.title}</span>
                          <span className="text-[10px] text-slate-500 font-mono shrink-0">({filteredLessons.length} bài)</span>
                        </div>
                        {isOpen ? <ChevronUp className="w-4 h-4 shrink-0 text-sky-500" /> : <ChevronDown className="w-4 h-4 shrink-0 text-slate-400" />}
                      </button>

                      {isOpen && filteredLessons.length > 0 && (
                        <div className="border-t dark:border-slate-800/60 border-slate-200 divide-y dark:divide-slate-800/40 divide-slate-200 dark:bg-slate-950 bg-white">
                          {filteredLessons.map((les, idx) => {
                            const isCurrentActive = selectedLessonId === les.id;
                            const ytId = les.youtubeId || (les.videoUrl ? (les.videoUrl.match(/(?:v=|youtu\.be\/|embed\/)([a-zA-Z0-9_-]{11})/)?.[1]) : null);
                            const thumb = ytId ? `https://img.youtube.com/vi/${ytId}/mqdefault.jpg` : null;

                            return (
                              <button 
                                key={les.id}
                                onClick={() => handleSelectLesson(les.id)}
                                className={`w-full p-3 flex gap-3 text-left transition-all relative overflow-hidden ${
                                  isCurrentActive 
                                    ? 'bg-sky-500/15 dark:text-white text-sky-950 font-bold' 
                                    : 'dark:hover:bg-slate-900/70 hover:bg-slate-50 dark:text-slate-300 text-slate-700'
                                }`}
                              >
                                {isCurrentActive && (
                                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-sky-500" />
                                )}

                                {/* Thumbnail */}
                                <div className="relative shrink-0 w-24 aspect-video rounded-lg overflow-hidden dark:bg-slate-900 bg-slate-100 border dark:border-slate-800 border-slate-200">
                                  {thumb ? (
                                    <img src={thumb} alt={les.title} className="w-full h-full object-cover" />
                                  ) : (
                                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-sky-900/40 to-slate-900">
                                      <Video className="w-4 h-4 text-sky-400" />
                                    </div>
                                  )}
                                  <span className="absolute top-1 left-1 w-4 h-4 rounded-full dark:bg-slate-950/90 bg-slate-900/90 text-[9px] font-bold text-white flex items-center justify-center">
                                    {String(idx + 1).padStart(2, '0')}
                                  </span>
                                  {isCurrentActive ? (
                                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                                      <div className="w-6 h-6 rounded-full bg-sky-400 text-slate-950 flex items-center justify-center">
                                        <Play className="w-3 h-3 fill-current ml-0.5" />
                                      </div>
                                    </div>
                                  ) : les.isPro && !isProUser ? (
                                    <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                                      <div className="w-5 h-5 rounded-full bg-amber-500 text-slate-950 flex items-center justify-center shadow">
                                        <Lock className="w-2.5 h-2.5 text-slate-950" />
                                      </div>
                                    </div>
                                  ) : null}
                                </div>

                                {/* Info */}
                                <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
                                  <span className={`text-xs font-semibold line-clamp-2 leading-relaxed ${isCurrentActive ? 'dark:text-sky-300 text-sky-700 font-bold' : 'dark:text-slate-200 text-slate-800'}`}>
                                    {les.title}
                                  </span>
                                  <div className="flex items-center justify-between gap-2 text-[10px] font-mono mt-1.5">
                                    <span className="flex items-center gap-1 text-slate-400">
                                      <Clock className="w-3 h-3 text-slate-400" />
                                      {les.duration}
                                    </span>
                                    <div className="flex items-center gap-2">
                                      {isCurrentActive && (
                                        <span className="text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                          Đang phát
                                        </span>
                                      )}
                                      {les.isPro ? (
                                        <span className="px-2 py-0.5 rounded-full bg-[#0284c7] text-white text-[10px] font-black flex items-center gap-1 shadow-sm shrink-0">
                                          <Zap className="w-2.5 h-2.5 fill-white" />
                                          Premium
                                        </span>
                                      ) : (
                                        <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold flex items-center gap-1 shrink-0">
                                          Free
                                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                </div>

                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {/* TAB 2: DANH SÁCH BÀI (FLAT ALL LESSONS LIST WITH THUMBNAILS & CHAPTER BADGES) */}
            {sidebarTab === 'lesson' && (
              <div className="space-y-2 max-h-[620px] overflow-y-auto pr-1 text-xs scrollbar-thin dark:scrollbar-thumb-slate-800 scrollbar-thumb-slate-300">
                {(() => {
                  const allFlatLessons = chapters.flatMap(c => 
                    c.lessons.map(l => ({ ...l, chapterTitle: c.title, chapterId: c.id }))
                  ).filter(l => 
                    !searchTerm.trim() || 
                    l.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                    l.chapterTitle.toLowerCase().includes(searchTerm.toLowerCase())
                  );

                  if (allFlatLessons.length === 0) {
                    return (
                      <div className="p-8 text-center text-slate-500 text-xs">
                        Không tìm thấy bài học nào phù hợp với từ khóa "{searchTerm}".
                      </div>
                    );
                  }

                  return allFlatLessons.map((les, index) => {
                    const isCurrentActive = selectedLessonId === les.id;
                    const ytId = les.youtubeId || (les.videoUrl ? (les.videoUrl.match(/(?:v=|youtu\.be\/|embed\/)([a-zA-Z0-9_-]{11})/)?.[1]) : null);
                    const thumb = ytId ? `https://img.youtube.com/vi/${ytId}/mqdefault.jpg` : null;

                    return (
                      <button
                        key={les.id}
                        onClick={() => handleSelectLesson(les.id)}
                        className={`w-full p-3 rounded-2xl border flex gap-3 text-left transition-all relative overflow-hidden ${
                          isCurrentActive 
                            ? 'bg-sky-500/15 border-sky-500 dark:text-white text-sky-950 font-bold shadow-lg shadow-sky-500/10' 
                            : 'dark:bg-slate-950/80 bg-slate-50 dark:border-slate-800 border-slate-200 hover:border-slate-300 dark:hover:border-slate-700 dark:hover:bg-slate-900/60 hover:bg-white dark:text-slate-300 text-slate-700 shadow-sm'
                        }`}
                      >
                        {isCurrentActive && (
                          <div className="absolute left-0 top-0 bottom-0 w-1 bg-sky-500" />
                        )}

                        {/* Thumbnail */}
                        <div className="relative shrink-0 w-28 aspect-video rounded-xl overflow-hidden dark:bg-slate-900 bg-slate-100 border dark:border-slate-800 border-slate-200">
                          {thumb ? (
                            <img src={thumb} alt={les.title} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-sky-950 to-slate-900">
                              <Video className="w-5 h-5 text-sky-400" />
                            </div>
                          )}
                          <span className="absolute top-1 left-1 px-1.5 py-0.5 rounded-full dark:bg-slate-950/90 bg-slate-900/90 text-[9px] font-mono font-black text-amber-400 flex items-center justify-center border dark:border-slate-800 border-slate-700">
                            #{String(index + 1).padStart(2, '0')}
                          </span>
                          {isCurrentActive ? (
                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                              <div className="w-7 h-7 rounded-full bg-sky-400 text-slate-950 flex items-center justify-center shadow-md shadow-sky-500/50">
                                <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
                              </div>
                            </div>
                          ) : les.isPro && !isProUser ? (
                            <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                              <div className="w-6 h-6 rounded-full bg-amber-500 text-slate-950 flex items-center justify-center shadow">
                                <Lock className="w-3 h-3 text-slate-950" />
                              </div>
                            </div>
                          ) : null}
                        </div>

                        {/* Details */}
                        <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
                          <div>
                            <span className="inline-block text-[10px] font-mono text-sky-600 dark:text-sky-400 bg-sky-500/10 px-2 py-0.5 rounded-md mb-1 line-clamp-1 border border-sky-500/20">
                              {les.chapterTitle.replace(/^\d+\.\s*/, '')}
                            </span>
                            <h4 className={`text-xs font-bold line-clamp-2 leading-snug ${isCurrentActive ? 'dark:text-sky-300 text-sky-700 font-black' : 'dark:text-slate-200 text-slate-800'}`}>
                              {les.title}
                            </h4>
                          </div>

                          <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono mt-2">
                            <span className="flex items-center gap-1 text-slate-400">
                              <Clock className="w-3 h-3 text-slate-400" />
                              {les.duration}
                            </span>
                            <div className="flex items-center gap-2">
                              {isCurrentActive && (
                                <span className="text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                  Đang phát
                                </span>
                              )}
                              {les.isPro ? (
                                <span className="px-2 py-0.5 rounded-full bg-[#0284c7] text-white text-[10px] font-black flex items-center gap-1 shadow-sm shrink-0">
                                  <Zap className="w-2.5 h-2.5 fill-white" />
                                  Premium
                                </span>
                              ) : (
                                <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold flex items-center gap-1 shrink-0">
                                  Free
                                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                      </button>
                    );
                  });
                })()}
              </div>
            )}

          </div>

        </div>

      </main>

      {/* Pricing Upgrade Modal */}
      <PricingModal
        isOpen={showPricingModal}
        onClose={() => setShowPricingModal(false)}
        onUpgradeSuccess={() => {
          setIsProUser(true);
          setShowPricingModal(false);
        }}
      />
    </div>
  );
}
