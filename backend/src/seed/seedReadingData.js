const mongoose = require('mongoose');
const ReadingExercise = require('../models/ReadingExercise');

const seedReadingData = [
  // Part 5 - Level 1: Dễ (Target 350 - 500)
  {
    title: 'Part 5 - Level 1 Dễ (350 - 500)',
    mode: 'part5',
    level: 1,
    levelName: 'Level 1 — Dễ',
    part: 'Part 5',
    errorRate: '2% - 17%',
    isPro: false,
    totalQuestions: 150,
    completedQuestions: 1,
    correctCount: 1,
    wrongCount: 0,
    remainingCount: 149,
    questions: [
      {
        questionNum: 101,
        prompt: 'Select the best answer to complete the sentence.',
        passageText: 'Mr. Henderson requested that everyone arrive on time for the ------ meeting tomorrow.',
        options: [
          { label: '(A)', text: 'staff' },
          { label: '(B)', text: 'staffs' },
          { label: '(C)', text: 'staffing' },
          { label: '(D)', text: 'staffed' }
        ],
        correctAnswer: '(A)',
        explanation: 'Cụm danh từ ghép: "staff meeting" (cuộc họp nhân viên). "Staff" đóng vai trò danh từ phụ bổ nghĩa cho meeting.'
      },
      {
        questionNum: 102,
        prompt: 'Select the best answer to complete the sentence.',
        passageText: 'Annika Dulin ------ the marketing department at Tollason Industries\' planning meeting tomorrow.',
        options: [
          { label: '(A)', text: 'will represent' },
          { label: '(B)', text: 'had represented' },
          { label: '(C)', text: 'to represent' },
          { label: '(D)', text: 'be representing' }
        ],
        correctAnswer: '(A)',
        explanation: 'Thì tương lai đơn (will + V-inf) dùng cho hành động xảy ra trong tương lai có mốc "tomorrow".'
      },
      {
        questionNum: 103,
        prompt: 'Select the best answer to complete the sentence.',
        passageText: 'Customer feedback forms are available ------ the reception desk near the main entrance.',
        options: [
          { label: '(A)', text: 'at' },
          { label: '(B)', text: 'into' },
          { label: '(C)', text: 'among' },
          { label: '(D)', text: 'during' }
        ],
        correctAnswer: '(A)',
        explanation: 'Giới từ chỉ vị trí cụ thể: "at the reception desk" (tại bàn lễ tân).'
      }
    ]
  },

  // Part 5 - Level 2: Cơ bản (Target 500 - 650)
  {
    title: 'Part 5 - Level 2 Cơ bản (500 - 650)',
    mode: 'part5',
    level: 2,
    levelName: 'Level 2 — Cơ bản',
    part: 'Part 5',
    errorRate: '17% - 27%',
    isPro: false,
    totalQuestions: 180,
    completedQuestions: 0,
    correctCount: 0,
    wrongCount: 0,
    remainingCount: 180,
    questions: [
      {
        questionNum: 110,
        prompt: 'Select the best answer to complete the sentence.',
        passageText: 'Please submit your quarterly expense reports ------ next Friday at noon.',
        options: [
          { label: '(A)', text: 'by' },
          { label: '(B)', text: 'until' },
          { label: '(C)', text: 'for' },
          { label: '(D)', text: 'in' }
        ],
        correctAnswer: '(A)',
        explanation: 'Giới từ "by + mốc thời gian" chỉ thời hạn chót (trước hoặc muộn nhất vào lúc trưa thứ Sáu).'
      },
      {
        questionNum: 111,
        prompt: 'Select the best answer to complete the sentence.',
        passageText: 'The newly appointed director has ------ impressive background in international trade law.',
        options: [
          { label: '(A)', text: 'an' },
          { label: '(B)', text: 'a' },
          { label: '(C)', text: 'the' },
          { label: '(D)', text: 'any' }
        ],
        correctAnswer: '(A)',
        explanation: 'Mạo từ "an" đứng trước tính từ bắt đầu bằng nguyên âm âm /ɪ/ ("impressive background").'
      }
    ]
  },

  // Part 5 - Level 3: Trung bình (Target 650 - 800)
  {
    title: 'Part 5 - Level 3 Trung bình (650 - 800)',
    mode: 'part5',
    level: 3,
    levelName: 'Level 3 — Trung bình',
    part: 'Part 5',
    errorRate: '27% - 38%',
    isPro: false,
    totalQuestions: 200,
    completedQuestions: 0,
    correctCount: 0,
    wrongCount: 0,
    remainingCount: 200,
    questions: [
      {
        questionNum: 120,
        prompt: 'Select the best answer to complete the sentence.',
        passageText: 'Ms. Gomez worked diligently to ensure that the project was completed ------ the deadline.',
        options: [
          { label: '(A)', text: 'well ahead of' },
          { label: '(B)', text: 'up to' },
          { label: '(C)', text: 'as far as' },
          { label: '(D)', text: 'in place of' }
        ],
        correctAnswer: '(A)',
        explanation: 'Cụm từ "well ahead of the deadline" có nghĩa là "trước hạn chót một khoảng thời gian khá dài".'
      }
    ]
  },

  // Part 5 - Level 4 & 5: Nâng cao & Cao thủ (Target 800 - 990)
  {
    title: 'Part 5 - Level 4 Khó (800 - 990)',
    mode: 'part5',
    level: 4,
    levelName: 'Level 4 — Khó & Cao Thủ',
    part: 'Part 5',
    errorRate: '38% - 65%',
    isPro: false,
    totalQuestions: 150,
    completedQuestions: 0,
    correctCount: 0,
    wrongCount: 0,
    remainingCount: 150,
    questions: [
      {
        questionNum: 128,
        prompt: 'Select the best answer to complete the sentence.',
        passageText: 'Should you require any further assistance, please do not hesitate to contact ------ customer support representative.',
        options: [
          { label: '(A)', text: 'your' },
          { label: '(B)', text: 'yours' },
          { label: '(C)', text: 'yourself' },
          { label: '(D)', text: 'you' }
        ],
        correctAnswer: '(A)',
        explanation: 'Cần tính từ sở hữu "your" đứng trước cụm danh từ "customer support representative". Đảo ngữ câu điều kiện loại 1: "Should you require... = If you require...".'
      }
    ]
  },

  // Grammar Lessons: 9 Chủ Điểm Ngữ Pháp TOEIC Bẫy Nhiều Nhất
  {
    title: 'Từ Loại: Danh Từ, Động Từ, Tính Từ, Trạng Từ',
    mode: 'grammar',
    topic: 'parts_of_speech',
    levelName: 'Parts of Speech Master',
    completedQuestions: 40,
    totalQuestions: 50,
    correctCount: 35,
    wrongCount: 5,
    remainingCount: 10,
    grammarTheory: {
      title: '🎯 🔍 CÁCH NHẬN BIẾT & GIẢI CÂU TỪ LOẠI TRONG 10 GIÂY',
      description: 'Khi 4 đáp án có cùng gốc từ (ví dụ: produce, production, productive, productively), hãy nhìn vào vị trí trước và sau chỗ trống:',
      rules: [
        'Đứng sau mạo từ (a/an/the) hoặc tính từ sở hữu (my/your/his) -> Cần DANH TỪ (Noun: -tion, -ment, -ance, -ity).',
        'Đứng trước danh từ hoặc sau to be/linking verb -> Cần TÍNH TỪ (Adj: -ful, -ive, -able, -al, -ous).',
        'Bổ nghĩa cho động từ thường hoặc đứng đầu câu -> Cần TRẠNG TỪ (Adv: Adj + ly).'
      ],
      examples: [
        {
          sentence: 'The marketing team developed an (effective / effectively) advertising campaign.',
          explanation: 'Chỗ trống đứng trước danh từ "advertising campaign" và sau mạo từ "an" -> Chọn tính từ "effective".'
        }
      ]
    }
  },
  {
    title: 'Thì Động Từ & Bị Động (Tenses & Passive Voice)',
    mode: 'grammar',
    topic: 'tenses_passive',
    levelName: 'Tenses & Passive Master',
    completedQuestions: 25,
    totalQuestions: 40,
    correctCount: 20,
    wrongCount: 5,
    remainingCount: 15,
    grammarTheory: {
      title: '🎯 🔍 BẢY DẤU HIỆU CHIA THÌ ĐỘNG TỪ CHUẨN ETS',
      description: 'Nhận diện trạng từ chỉ thời gian:',
      rules: [
        'Hiện tại hoàn thành (Have/Has + V3/ed): since, for, already, recently, lately, over the past 3 years.',
        'Tương lai đơn (Will + V-inf): tomorrow, next week, upcoming, soon, in the near future.',
        'Quá khứ đơn (V2/ed): yesterday, last month, ago, previously, in 2020.'
      ]
    }
  }
];

async function seedReadingDB() {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/tuong_tan_toeic';
    await mongoose.connect(mongoUri);
    await ReadingExercise.deleteMany({});
    await ReadingExercise.insertMany(seedReadingData);
    console.log('🎉 Reading and Grammar exercises seeded successfully to MongoDB!');
    mongoose.connection.close();
  } catch (err) {
    console.error('Error seeding reading data:', err.message);
  }
}

if (require.main === module) {
  seedReadingDB();
}

module.exports = seedReadingData;
