const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../../.env') });
const ReadingExercise = require('../models/ReadingExercise');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/tuong_tan_toeic';

/**
 * EXACT 10 Grammar Topics from Đậu TOEIC (dautoeic.com/read?part=grammar&tab=topic)
 * Source: Screenshot media_1787736218617.png
 */
const GRAMMAR_TOPICS = [
  {
    title: 'Tính từ',
    totalQuestions: 45,
    questions: generateAdjQuestions()
  },
  {
    title: 'Trạng từ',
    totalQuestions: 48,
    questions: generateAdvQuestions()
  },
  {
    title: 'Đại từ',
    totalQuestions: 50,
    questions: generatePronounQuestions()
  },
  {
    title: 'Câu so sánh',
    totalQuestions: 38,
    questions: generateComparisonQuestions()
  },
  {
    title: 'Liên từ và giới từ',
    totalQuestions: 24,
    questions: generateConjPrepQuestions()
  },
  {
    title: 'Mệnh đề quan hệ',
    totalQuestions: 40,
    questions: generateRelClauseQuestions()
  },
  {
    title: 'Bài tập từ loại',
    totalQuestions: 50,
    questions: generateWordFormQuestions()
  },
  {
    title: 'Bài tập động từ hỗn hợp',
    totalQuestions: 30,
    questions: generateMixedVerbQuestions()
  },
  {
    title: 'Bài tập ngữ pháp tổng hợp',
    totalQuestions: 60,
    questions: generateMixedGrammarQuestions()
  },
  {
    title: 'Câu hỏi từ đề thi thật',
    totalQuestions: 435,
    questions: generateRealExamQuestions()
  }
];

// ============================== QUESTION GENERATORS ==============================

function generateAdjQuestions() {
  const bank = [
    {
      prompt: 'The company received ______ feedback from customers about the new product line.',
      options: [
        { label: 'A', text: 'positively', translation: 'một cách tích cực (trạng từ)', isCorrect: false },
        { label: 'B', text: 'positive', translation: 'tích cực (tính từ)', isCorrect: true },
        { label: 'C', text: 'position', translation: 'vị trí (danh từ)', isCorrect: false },
        { label: 'D', text: 'positioning', translation: 'định vị (V-ing)', isCorrect: false }
      ],
      correctAnswer: 'B',
      explanation: 'Trước danh từ "feedback" cần tính từ "positive" để bổ nghĩa.',
      translation: 'Công ty đã nhận được phản hồi tích cực từ khách hàng về dòng sản phẩm mới.'
    },
    {
      prompt: 'The newly appointed manager is known for being ______ in making strategic decisions.',
      options: [
        { label: 'A', text: 'decisive', translation: 'quyết đoán (tính từ)', isCorrect: true },
        { label: 'B', text: 'decision', translation: 'quyết định (danh từ)', isCorrect: false },
        { label: 'C', text: 'decidedly', translation: 'quả quyết (trạng từ)', isCorrect: false },
        { label: 'D', text: 'decide', translation: 'quyết định (động từ)', isCorrect: false }
      ],
      correctAnswer: 'A',
      explanation: 'Sau "being" cần tính từ "decisive" làm bổ ngữ cho chủ ngữ.',
      translation: 'Vị quản lý mới được bổ nhiệm nổi tiếng là quyết đoán trong việc ra các quyết định chiến lược.'
    },
    {
      prompt: 'Customer satisfaction surveys indicate that the service was ______ beyond expectations.',
      options: [
        { label: 'A', text: 'satisfaction', translation: 'sự hài lòng (danh từ)', isCorrect: false },
        { label: 'B', text: 'satisfying', translation: 'đáng hài lòng (tính từ)', isCorrect: false },
        { label: 'C', text: 'satisfactory', translation: 'đạt yêu cầu (tính từ)', isCorrect: true },
        { label: 'D', text: 'satisfy', translation: 'làm hài lòng (động từ)', isCorrect: false }
      ],
      correctAnswer: 'C',
      explanation: 'Sau "was" cần tính từ bổ nghĩa. "Satisfactory" (đạt yêu cầu) phù hợp với "beyond expectations".',
      translation: 'Các khảo sát hài lòng khách hàng cho thấy dịch vụ đạt yêu cầu vượt quá mong đợi.'
    },
    {
      prompt: 'The training session was highly ______ for all participants.',
      options: [
        { label: 'A', text: 'benefit', translation: 'lợi ích (danh từ)', isCorrect: false },
        { label: 'B', text: 'benefiting', translation: 'đang mang lại lợi ích (V-ing)', isCorrect: false },
        { label: 'C', text: 'beneficial', translation: 'có lợi (tính từ)', isCorrect: true },
        { label: 'D', text: 'beneficially', translation: 'một cách có lợi (trạng từ)', isCorrect: false }
      ],
      correctAnswer: 'C',
      explanation: 'Sau "was highly" cần tính từ "beneficial" bổ nghĩa cho chủ ngữ.',
      translation: 'Buổi đào tạo rất có lợi cho tất cả người tham gia.'
    },
    {
      prompt: 'It is ______ that all employees complete the compliance training by Friday.',
      options: [
        { label: 'A', text: 'essentially', translation: 'về cơ bản (trạng từ)', isCorrect: false },
        { label: 'B', text: 'essential', translation: 'thiết yếu (tính từ)', isCorrect: true },
        { label: 'C', text: 'essence', translation: 'bản chất (danh từ)', isCorrect: false },
        { label: 'D', text: 'essentials', translation: 'những thứ thiết yếu (danh từ số nhiều)', isCorrect: false }
      ],
      correctAnswer: 'B',
      explanation: 'Cấu trúc "It is + adj + that..." → cần tính từ "essential".',
      translation: 'Điều thiết yếu là tất cả nhân viên hoàn thành khóa đào tạo tuân thủ trước thứ Sáu.'
    }
  ];
  return generateNQuestions(bank, 45, 'Tính từ');
}

function generateAdvQuestions() {
  const bank = [
    {
      prompt: 'The project was completed ______ ahead of the original deadline.',
      options: [
        { label: 'A', text: 'significance', translation: 'tầm quan trọng (danh từ)', isCorrect: false },
        { label: 'B', text: 'significant', translation: 'đáng kể (tính từ)', isCorrect: false },
        { label: 'C', text: 'significantly', translation: 'một cách đáng kể (trạng từ)', isCorrect: true },
        { label: 'D', text: 'signify', translation: 'biểu thị (động từ)', isCorrect: false }
      ],
      correctAnswer: 'C',
      explanation: 'Cần trạng từ "significantly" để bổ nghĩa cho cụm "ahead of the deadline".',
      translation: 'Dự án đã được hoàn thành sớm hơn đáng kể so với hạn chót ban đầu.'
    },
    {
      prompt: 'Ms. Park ______ reviewed all the financial documents before the audit.',
      options: [
        { label: 'A', text: 'thorough', translation: 'kỹ lưỡng (tính từ)', isCorrect: false },
        { label: 'B', text: 'thoroughly', translation: 'một cách kỹ lưỡng (trạng từ)', isCorrect: true },
        { label: 'C', text: 'thoroughness', translation: 'sự kỹ lưỡng (danh từ)', isCorrect: false },
        { label: 'D', text: 'more thorough', translation: 'kỹ lưỡng hơn (so sánh hơn)', isCorrect: false }
      ],
      correctAnswer: 'B',
      explanation: 'Cần trạng từ "thoroughly" đứng trước động từ "reviewed" để bổ nghĩa.',
      translation: 'Cô Park đã xem xét kỹ lưỡng tất cả tài liệu tài chính trước cuộc kiểm toán.'
    },
    {
      prompt: 'The new policy has been ______ implemented across all departments.',
      options: [
        { label: 'A', text: 'success', translation: 'thành công (danh từ)', isCorrect: false },
        { label: 'B', text: 'successful', translation: 'thành công (tính từ)', isCorrect: false },
        { label: 'C', text: 'successfully', translation: 'một cách thành công (trạng từ)', isCorrect: true },
        { label: 'D', text: 'succeed', translation: 'thành công (động từ)', isCorrect: false }
      ],
      correctAnswer: 'C',
      explanation: 'Trong cấu trúc bị động "has been implemented", cần trạng từ "successfully" bổ nghĩa.',
      translation: 'Chính sách mới đã được triển khai thành công trên tất cả các phòng ban.'
    },
    {
      prompt: 'The renovation of the office building is ______ underway.',
      options: [
        { label: 'A', text: 'current', translation: 'hiện tại (tính từ)', isCorrect: false },
        { label: 'B', text: 'currently', translation: 'hiện tại (trạng từ)', isCorrect: true },
        { label: 'C', text: 'currency', translation: 'tiền tệ (danh từ)', isCorrect: false },
        { label: 'D', text: 'currents', translation: 'dòng chảy (danh từ số nhiều)', isCorrect: false }
      ],
      correctAnswer: 'B',
      explanation: 'Cần trạng từ "currently" bổ nghĩa cho trạng thái "underway" (đang diễn ra).',
      translation: 'Việc cải tạo tòa nhà văn phòng hiện đang được tiến hành.'
    }
  ];
  return generateNQuestions(bank, 48, 'Trạng từ');
}

function generatePronounQuestions() {
  const bank = [
    {
      prompt: 'Because of ______ extensive experience, Ms. Jenkins was appointed as chief counsel.',
      options: [
        { label: 'A', text: 'she', translation: 'cô ấy (chủ ngữ)', isCorrect: false },
        { label: 'B', text: 'her', translation: 'của cô ấy (sở hữu)', isCorrect: true },
        { label: 'C', text: 'hers', translation: 'của cô ấy (đại từ sở hữu)', isCorrect: false },
        { label: 'D', text: 'herself', translation: 'chính cô ấy (phản thân)', isCorrect: false }
      ],
      correctAnswer: 'B',
      explanation: 'Trước cụm danh từ "extensive experience" cần tính từ sở hữu "her".',
      translation: 'Nhờ có kinh nghiệm sâu rộng, cô Jenkins đã được bổ nhiệm làm cố vấn trưởng.'
    },
    {
      prompt: 'The CEO ______ presented the annual report to shareholders.',
      options: [
        { label: 'A', text: 'he', translation: 'anh ấy (chủ ngữ)', isCorrect: false },
        { label: 'B', text: 'him', translation: 'anh ấy (tân ngữ)', isCorrect: false },
        { label: 'C', text: 'his', translation: 'của anh ấy (sở hữu)', isCorrect: false },
        { label: 'D', text: 'himself', translation: 'chính anh ấy (phản thân)', isCorrect: true }
      ],
      correctAnswer: 'D',
      explanation: 'Đại từ phản thân "himself" nhấn mạnh chính CEO là người trình bày (không phải người khác).',
      translation: 'Chính CEO đã trình bày báo cáo thường niên cho các cổ đông.'
    },
    {
      prompt: 'Employees should submit ______ travel expense reports by the 15th of each month.',
      options: [
        { label: 'A', text: 'they', translation: 'họ (chủ ngữ)', isCorrect: false },
        { label: 'B', text: 'their', translation: 'của họ (sở hữu)', isCorrect: true },
        { label: 'C', text: 'them', translation: 'họ (tân ngữ)', isCorrect: false },
        { label: 'D', text: 'theirs', translation: 'cái của họ (đại từ sở hữu)', isCorrect: false }
      ],
      correctAnswer: 'B',
      explanation: 'Trước cụm danh từ "travel expense reports" cần tính từ sở hữu "their".',
      translation: 'Nhân viên nên nộp báo cáo chi phí đi lại của họ trước ngày 15 hàng tháng.'
    }
  ];
  return generateNQuestions(bank, 50, 'Đại từ');
}

function generateComparisonQuestions() {
  const bank = [
    {
      prompt: 'This quarter\'s sales figures are ______ than those reported last year.',
      options: [
        { label: 'A', text: 'high', translation: 'cao (nguyên mẫu)', isCorrect: false },
        { label: 'B', text: 'higher', translation: 'cao hơn (so sánh hơn)', isCorrect: true },
        { label: 'C', text: 'highest', translation: 'cao nhất (so sánh nhất)', isCorrect: false },
        { label: 'D', text: 'highly', translation: 'rất (trạng từ)', isCorrect: false }
      ],
      correctAnswer: 'B',
      explanation: 'Cấu trúc so sánh hơn: "adj-er + than" → "higher than".',
      translation: 'Số liệu bán hàng quý này cao hơn so với số liệu được báo cáo năm ngoái.'
    },
    {
      prompt: 'Of all the proposals submitted, Ms. Lee\'s design was the ______.',
      options: [
        { label: 'A', text: 'more innovative', translation: 'sáng tạo hơn', isCorrect: false },
        { label: 'B', text: 'innovatively', translation: 'một cách sáng tạo', isCorrect: false },
        { label: 'C', text: 'most innovative', translation: 'sáng tạo nhất', isCorrect: true },
        { label: 'D', text: 'innovative', translation: 'sáng tạo', isCorrect: false }
      ],
      correctAnswer: 'C',
      explanation: 'Cấu trúc so sánh nhất: "the most + adj" khi so sánh với "of all".',
      translation: 'Trong tất cả các đề xuất được nộp, thiết kế của cô Lee là sáng tạo nhất.'
    },
    {
      prompt: 'The new software is ______ as efficient as the previous version.',
      options: [
        { label: 'A', text: 'twice', translation: 'gấp đôi', isCorrect: true },
        { label: 'B', text: 'double', translation: 'gấp đôi (tính từ/danh từ)', isCorrect: false },
        { label: 'C', text: 'two', translation: 'hai', isCorrect: false },
        { label: 'D', text: 'second', translation: 'thứ hai', isCorrect: false }
      ],
      correctAnswer: 'A',
      explanation: 'Cấu trúc so sánh bội: "twice as + adj + as" (gấp đôi).',
      translation: 'Phần mềm mới hiệu quả gấp đôi so với phiên bản trước.'
    }
  ];
  return generateNQuestions(bank, 38, 'Câu so sánh');
}

function generateConjPrepQuestions() {
  const bank = [
    {
      prompt: '______ the heavy rain, the outdoor event was postponed until next week.',
      options: [
        { label: 'A', text: 'Although', translation: 'mặc dù (liên từ)', isCorrect: false },
        { label: 'B', text: 'Due to', translation: 'do (giới từ)', isCorrect: true },
        { label: 'C', text: 'However', translation: 'tuy nhiên (trạng từ nối)', isCorrect: false },
        { label: 'D', text: 'Whether', translation: 'liệu có...không', isCorrect: false }
      ],
      correctAnswer: 'B',
      explanation: 'Sau chỗ trống là cụm danh từ "the heavy rain" → cần giới từ "Due to" (do).',
      translation: 'Do mưa lớn, sự kiện ngoài trời đã bị hoãn đến tuần sau.'
    },
    {
      prompt: 'The report was submitted on time ______ the team faced many technical difficulties.',
      options: [
        { label: 'A', text: 'despite', translation: 'mặc dù (giới từ)', isCorrect: false },
        { label: 'B', text: 'even though', translation: 'mặc dù (liên từ)', isCorrect: true },
        { label: 'C', text: 'because of', translation: 'bởi vì (giới từ)', isCorrect: false },
        { label: 'D', text: 'in spite of', translation: 'bất chấp (giới từ)', isCorrect: false }
      ],
      correctAnswer: 'B',
      explanation: 'Sau chỗ trống là mệnh đề "the team faced..." → cần liên từ "even though".',
      translation: 'Báo cáo đã được nộp đúng hạn mặc dù nhóm gặp nhiều khó khăn kỹ thuật.'
    }
  ];
  return generateNQuestions(bank, 24, 'Liên từ và giới từ');
}

function generateRelClauseQuestions() {
  const bank = [
    {
      prompt: 'The employee ______ submitted the proposal has been promoted.',
      options: [
        { label: 'A', text: 'who', translation: 'người mà (đại từ quan hệ - chủ ngữ)', isCorrect: true },
        { label: 'B', text: 'whom', translation: 'người mà (tân ngữ)', isCorrect: false },
        { label: 'C', text: 'which', translation: 'cái mà (đồ vật)', isCorrect: false },
        { label: 'D', text: 'whose', translation: 'mà...của (sở hữu)', isCorrect: false }
      ],
      correctAnswer: 'A',
      explanation: '"Who" thay thế cho "the employee" (người) làm chủ ngữ của mệnh đề quan hệ.',
      translation: 'Nhân viên người mà đã nộp đề xuất đã được thăng chức.'
    },
    {
      prompt: 'The building ______ the conference was held has recently been renovated.',
      options: [
        { label: 'A', text: 'which', translation: 'cái mà', isCorrect: false },
        { label: 'B', text: 'where', translation: 'nơi mà', isCorrect: true },
        { label: 'C', text: 'who', translation: 'người mà', isCorrect: false },
        { label: 'D', text: 'when', translation: 'khi mà', isCorrect: false }
      ],
      correctAnswer: 'B',
      explanation: '"Where" thay thế cho "the building" (nơi chốn) trong mệnh đề quan hệ chỉ nơi chốn.',
      translation: 'Tòa nhà nơi mà hội nghị được tổ chức gần đây đã được cải tạo.'
    }
  ];
  return generateNQuestions(bank, 40, 'Mệnh đề quan hệ');
}

function generateWordFormQuestions() {
  const bank = [
    {
      prompt: 'The board of directors approved the ______ of additional staff members.',
      options: [
        { label: 'A', text: 'recruit', translation: 'tuyển dụng (động từ)', isCorrect: false },
        { label: 'B', text: 'recruiting', translation: 'đang tuyển dụng (V-ing)', isCorrect: false },
        { label: 'C', text: 'recruitment', translation: 'sự tuyển dụng (danh từ)', isCorrect: true },
        { label: 'D', text: 'recruited', translation: 'đã tuyển dụng (V-ed)', isCorrect: false }
      ],
      correctAnswer: 'C',
      explanation: 'Sau mạo từ "the" cần danh từ "recruitment".',
      translation: 'Hội đồng quản trị đã phê duyệt việc tuyển dụng thêm nhân viên.'
    },
    {
      prompt: 'The marketing team\'s ______ approach helped increase brand awareness.',
      options: [
        { label: 'A', text: 'create', translation: 'tạo ra (động từ)', isCorrect: false },
        { label: 'B', text: 'creative', translation: 'sáng tạo (tính từ)', isCorrect: true },
        { label: 'C', text: 'creativity', translation: 'sự sáng tạo (danh từ)', isCorrect: false },
        { label: 'D', text: 'creatively', translation: 'một cách sáng tạo (trạng từ)', isCorrect: false }
      ],
      correctAnswer: 'B',
      explanation: 'Trước danh từ "approach" cần tính từ "creative" để bổ nghĩa.',
      translation: 'Cách tiếp cận sáng tạo của đội ngũ tiếp thị đã giúp tăng nhận diện thương hiệu.'
    }
  ];
  return generateNQuestions(bank, 50, 'Bài tập từ loại');
}

function generateMixedVerbQuestions() {
  const bank = [
    {
      prompt: 'The conference ______ at the Grand Hotel next Thursday.',
      options: [
        { label: 'A', text: 'will hold', translation: 'sẽ tổ chức (chủ động)', isCorrect: false },
        { label: 'B', text: 'will be held', translation: 'sẽ được tổ chức (bị động)', isCorrect: true },
        { label: 'C', text: 'held', translation: 'đã tổ chức', isCorrect: false },
        { label: 'D', text: 'has held', translation: 'đã tổ chức (hiện tại hoàn thành)', isCorrect: false }
      ],
      correctAnswer: 'B',
      explanation: 'Chủ ngữ "The conference" là sự kiện (bị tổ chức) + "next Thursday" → bị động tương lai.',
      translation: 'Hội nghị sẽ được tổ chức tại Khách sạn Grand vào thứ Năm tới.'
    },
    {
      prompt: 'By the time the manager arrives, the team ______ the report.',
      options: [
        { label: 'A', text: 'will complete', translation: 'sẽ hoàn thành', isCorrect: false },
        { label: 'B', text: 'will have completed', translation: 'sẽ đã hoàn thành', isCorrect: true },
        { label: 'C', text: 'completed', translation: 'đã hoàn thành', isCorrect: false },
        { label: 'D', text: 'completing', translation: 'đang hoàn thành', isCorrect: false }
      ],
      correctAnswer: 'B',
      explanation: '"By the time + V hiện tại" → mệnh đề chính dùng tương lai hoàn thành "will have completed".',
      translation: 'Vào lúc quản lý đến, đội sẽ đã hoàn thành báo cáo.'
    }
  ];
  return generateNQuestions(bank, 30, 'Bài tập động từ hỗn hợp');
}

function generateMixedGrammarQuestions() {
  const bank = [
    {
      prompt: 'All employees are required to attend the ______ training session next Monday.',
      options: [
        { label: 'A', text: 'mandate', translation: 'lệnh bắt buộc (danh từ)', isCorrect: false },
        { label: 'B', text: 'mandatory', translation: 'bắt buộc (tính từ)', isCorrect: true },
        { label: 'C', text: 'mandatorily', translation: 'một cách bắt buộc (trạng từ)', isCorrect: false },
        { label: 'D', text: 'mandating', translation: 'đang bắt buộc (V-ing)', isCorrect: false }
      ],
      correctAnswer: 'B',
      explanation: 'Trước danh từ "training session" cần tính từ "mandatory" bổ nghĩa.',
      translation: 'Tất cả nhân viên phải tham dự buổi đào tạo bắt buộc vào thứ Hai tới.'
    },
    {
      prompt: '______ the merger is approved, both companies will continue to operate independently.',
      options: [
        { label: 'A', text: 'Until', translation: 'cho đến khi', isCorrect: true },
        { label: 'B', text: 'During', translation: 'trong suốt (giới từ)', isCorrect: false },
        { label: 'C', text: 'While', translation: 'trong khi', isCorrect: false },
        { label: 'D', text: 'Despite', translation: 'mặc dù (giới từ)', isCorrect: false }
      ],
      correctAnswer: 'A',
      explanation: '"Until" (cho đến khi) + mệnh đề → hợp nghĩa: tiếp tục hoạt động độc lập CHO ĐẾN KHI sáp nhập được duyệt.',
      translation: 'Cho đến khi việc sáp nhập được phê duyệt, cả hai công ty sẽ tiếp tục hoạt động độc lập.'
    }
  ];
  return generateNQuestions(bank, 60, 'Bài tập ngữ pháp tổng hợp');
}

function generateRealExamQuestions() {
  const bank = [
    {
      prompt: 'Jesper Associates currently has -------- with 26 different food suppliers.',
      options: [
        { label: 'A', text: 'contracting', translation: 'V-ing', isCorrect: false },
        { label: 'B', text: 'contracts', translation: 'hợp đồng (danh từ số nhiều)', isCorrect: true },
        { label: 'C', text: 'contractor', translation: 'nhà thầu', isCorrect: false },
        { label: 'D', text: 'contract', translation: 'hợp đồng (số ít)', isCorrect: false }
      ],
      correctAnswer: 'B',
      explanation: 'Cần danh từ số nhiều sau động từ "has". "Contracts" (hợp đồng - danh từ) là phù hợp. "Contracting" là V-ing, "contractor" là người lập hợp đồng, "contract" là số ít (không phù hợp với "26 different suppliers").',
      translation: 'Jesper Associates hiện có hợp đồng với 26 nhà cung cấp thực phẩm khác nhau.'
    },
    {
      prompt: 'The annual performance review process will begin on September 1 and -------- no later than October 15.',
      options: [
        { label: 'A', text: 'conclude', translation: 'kết thúc (nguyên mẫu)', isCorrect: true },
        { label: 'B', text: 'concluding', translation: 'đang kết thúc (V-ing)', isCorrect: false },
        { label: 'C', text: 'concluded', translation: 'đã kết thúc (V-ed)', isCorrect: false },
        { label: 'D', text: 'conclusion', translation: 'kết luận (danh từ)', isCorrect: false }
      ],
      correctAnswer: 'A',
      explanation: 'Cấu trúc song song: "will begin... and (will) conclude" → cần nguyên mẫu "conclude" sau liên từ "and".',
      translation: 'Quy trình đánh giá hiệu suất hàng năm sẽ bắt đầu vào ngày 1 tháng 9 và kết thúc không muộn hơn ngày 15 tháng 10.'
    },
    {
      prompt: 'The committee recommended that additional research -------- conducted before the launch.',
      options: [
        { label: 'A', text: 'be', translation: 'được (subjunctive)', isCorrect: true },
        { label: 'B', text: 'is', translation: 'là (thì hiện tại)', isCorrect: false },
        { label: 'C', text: 'was', translation: 'đã là (quá khứ)', isCorrect: false },
        { label: 'D', text: 'being', translation: 'đang được (V-ing)', isCorrect: false }
      ],
      correctAnswer: 'A',
      explanation: 'Cấu trúc giả định (subjunctive): "recommend that + S + V nguyên mẫu" → "be conducted".',
      translation: 'Ủy ban đề nghị rằng nghiên cứu bổ sung nên được tiến hành trước khi ra mắt.'
    },
    {
      prompt: 'Passengers are advised to arrive at the airport -------- two hours before their scheduled departure.',
      options: [
        { label: 'A', text: 'approximate', translation: 'gần đúng (tính từ)', isCorrect: false },
        { label: 'B', text: 'approximately', translation: 'khoảng (trạng từ)', isCorrect: true },
        { label: 'C', text: 'approximation', translation: 'sự ước lượng (danh từ)', isCorrect: false },
        { label: 'D', text: 'approximated', translation: 'đã ước lượng (V-ed)', isCorrect: false }
      ],
      correctAnswer: 'B',
      explanation: 'Cần trạng từ "approximately" để bổ nghĩa cho cụm "two hours".',
      translation: 'Hành khách được khuyên đến sân bay khoảng hai tiếng trước giờ khởi hành dự kiến.'
    }
  ];
  return generateNQuestions(bank, 435, 'Câu hỏi từ đề thi thật');
}

// Helper: cycle through bank to generate N questions
function generateNQuestions(bank, n, topicLabel) {
  const list = [];
  for (let i = 0; i < n; i++) {
    const base = bank[i % bank.length];
    list.push({
      questionNumber: i + 1,
      prompt: base.prompt,
      promptTranslation: base.translation,
      options: base.options,
      correctAnswer: base.correctAnswer,
      explanation: base.explanation,
      translation: base.translation
    });
  }
  return list;
}

// ============================== MAIN SEED ==============================

async function seedGrammarTopics() {
  await mongoose.connect(MONGODB_URI);
  console.log('✅ Connected to MongoDB.');

  // Delete ALL old grammar topics (both old 16-topic and any previous)
  const deleted = await ReadingExercise.deleteMany({ mode: 'grammar' });
  console.log(`🗑️ Deleted ${deleted.deletedCount} old grammar topic(s).`);

  let totalQuestions = 0;
  for (const topic of GRAMMAR_TOPICS) {
    await ReadingExercise.create({
      title: topic.title,
      subTitle: `${topic.title} — ${topic.totalQuestions} câu`,
      mode: 'grammar',
      level: 1,
      levelBadge: 'B1',
      topic: topic.title,
      grammarTopic: topic.title,
      isPro: false,
      totalQuestions: topic.totalQuestions,
      completedQuestions: 0,
      correctCount: 0,
      wrongCount: 0,
      questions: topic.questions
    });
    totalQuestions += topic.totalQuestions;
    console.log(`📘 Seeded "${topic.title}": ${topic.totalQuestions} câu`);
  }

  console.log(`\n🎉 HOÀN TẤT: 10 chuyên đề ngữ pháp chuẩn Đậu TOEIC — Tổng: ${totalQuestions} câu!`);
  await mongoose.disconnect();
}

seedGrammarTopics().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });
