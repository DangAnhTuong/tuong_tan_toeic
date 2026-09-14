const mongoose = require('mongoose');
const MockTest = require('../models/MockTest');

const seedMockTestData = [
  {
    title: 'ETS TOEIC 2026 — Test 1 (Full 200 Câu)',
    year: 2026,
    totalQuestions: 200,
    durationMinutes: 120,
    status: 'Sẵn sàng thi',
    isPro: false,
    questions: [
      {
        questionNum: 1,
        part: 1,
        prompt: 'Select the statement that best describes what you see in the photograph.',
        audioUrl: '/assets/listening/toeic_part1_1.mp3',
        imageUrl: '/assets/listening/toeic_part1_1.jpg',
        options: [
          { label: '(A)', text: 'She is holding a pen in her hand.' },
          { label: '(B)', text: 'She is opening a wooden door.' },
          { label: '(C)', text: 'She is paying for groceries.' },
          { label: '(D)', text: 'She is sitting at a cafe table.' }
        ],
        correctAnswer: '(A)',
        explanation: 'Người phụ nữ đang cầm bút trong tay để ghi chép tài liệu.'
      },
      {
        questionNum: 2,
        part: 2,
        prompt: 'Mark your answer on your answer sheet.',
        audioUrl: '/assets/listening/toeic_part2_1.mp3',
        options: [
          { label: '(A)', text: 'At 3:00 PM.' },
          { label: '(B)', text: 'On the receptionist desk.' },
          { label: '(C)', text: 'Yes, I enjoyed it.' }
        ],
        correctAnswer: '(B)',
        explanation: 'Câu hỏi bắt đầu bằng "Where did you leave the keys?" hỏi về địa điểm -> Đáp án (B) On the desk là câu trả lời chính xác.'
      },
      {
        questionNum: 31,
        part: 3,
        prompt: 'What are the speakers mainly discussing?',
        options: [
          { label: '(A)', text: 'A budget increase for next quarter' },
          { label: '(B)', text: 'A new office layout plan' },
          { label: '(C)', text: 'A delayed shipment of electronic parts' },
          { label: '(D)', text: 'A catering service schedule' }
        ],
        correctAnswer: '(C)',
        explanation: 'Người phụ nữ nhắc đến: "The supplier informed us that the electronic components will arrive three days late."'
      },
      {
        questionNum: 71,
        part: 4,
        prompt: 'Where is the announcement most likely taking place?',
        options: [
          { label: '(A)', text: 'At an airport terminal' },
          { label: '(B)', text: 'At a train station' },
          { label: '(C)', text: 'In a shopping mall' },
          { label: '(D)', text: 'On a cruise ship' }
        ],
        correctAnswer: '(A)',
        explanation: 'Người nói thông báo về "Flight 402 to Chicago will now board at Gate 18B".'
      },
      {
        questionNum: 101,
        part: 5,
        prompt: 'Choose the word that best completes the sentence.',
        passageText: '101. Ms. Larson was ------ promoted to head of the regional marketing division.',
        options: [
          { label: '(A)', text: 'recent' },
          { label: '(B)', text: 'recency' },
          { label: '(C)', text: 'recently' },
          { label: '(D)', text: 'more recent' }
        ],
        correctAnswer: '(C)',
        explanation: 'Cần trạng từ (Adv) "recently" đứng giữa trợ động từ "was" và quá khứ phân từ "promoted" để bổ nghĩa cho động từ.'
      },
      {
        questionNum: 102,
        part: 5,
        prompt: 'Choose the word that best completes the sentence.',
        passageText: '102. All participants must register online ------ attending the professional leadership workshop.',
        options: [
          { label: '(A)', text: 'prior to' },
          { label: '(B)', text: 'ahead' },
          { label: '(C)', text: 'in front' },
          { label: '(D)', text: 'forward' }
        ],
        correctAnswer: '(A)',
        explanation: 'Cụm giới từ "prior to + V-ing/Noun" có nghĩa là "trước khi".'
      },
      {
        questionNum: 131,
        part: 6,
        prompt: 'Select the best option to complete the passage.',
        passageText: 'Questions 131-134 refer to the following email from Apex Logistics.',
        options: [
          { label: '(A)', text: 'delivery' },
          { label: '(B)', text: 'deliverable' },
          { label: '(C)', text: 'delivering' },
          { label: '(D)', text: 'deliver' }
        ],
        correctAnswer: '(A)',
        explanation: 'Cụm danh từ ghép "scheduled delivery" (lịch giao hàng đã định).'
      },
      {
        questionNum: 147,
        part: 7,
        prompt: 'According to the memo, why was the meeting rescheduled?',
        passageText: 'Questions 147-148 refer to the following internal memorandum.',
        options: [
          { label: '(A)', text: 'The keynote speaker is traveling abroad' },
          { label: '(B)', text: 'The conference room is undergoing renovation' },
          { label: '(C)', text: 'The financial quarterly report is incomplete' },
          { label: '(D)', text: 'A severe weather forecast delayed flights' }
        ],
        correctAnswer: '(B)',
        explanation: 'Đoạn văn nêu rõ: "Due to scheduled maintenance in Hall C, the quarterly review is moved to Thursday."'
      }
    ]
  },
  {
    title: 'ETS TOEIC 2026 — Test 2 (Full 200 Câu)',
    year: 2026,
    totalQuestions: 200,
    durationMinutes: 120,
    status: 'Sẵn sàng thi',
    isPro: false,
    questions: []
  },
  {
    title: 'ETS TOEIC 2025 — Test 1 (Full 200 Câu)',
    year: 2025,
    totalQuestions: 200,
    durationMinutes: 120,
    status: 'Sẵn sàng thi',
    isPro: false,
    questions: []
  },
  {
    title: 'ETS TOEIC 2024 — Test 1 (Full 200 Câu)',
    year: 2024,
    totalQuestions: 200,
    durationMinutes: 120,
    status: 'Sẵn sàng thi',
    isPro: false,
    questions: []
  }
];

async function seedDB() {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/tuong_tan_toeic';
    await mongoose.connect(mongoUri);
    await MockTest.deleteMany({});
    await MockTest.insertMany(seedMockTestData);
    console.log('🎉 Real ETS Mock test sets seeded successfully to MongoDB!');
    mongoose.connection.close();
  } catch (err) {
    console.error('Error seeding mock test data:', err.message);
  }
}

if (require.main === module) {
  seedDB();
}

module.exports = seedMockTestData;
