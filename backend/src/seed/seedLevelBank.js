const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../../.env') });

const ListeningExercise = require('../models/ListeningExercise');

// 93 REALISTIC TOEIC PART 1 PHOTO QUESTIONS FOR EACH DIFFICULTY LEVEL
const photosCollection = [
  {
    img: "https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=800&q=80",
    correct: "The man is looking at his mobile phone on the train.",
    options: [
      { label: "(A)", text: "The man is looking at his mobile phone on the train." },
      { label: "(B)", text: "The man is purchasing a train ticket at the counter." },
      { label: "(C)", text: "The man is adjusting his winter coat." },
      { label: "(D)", text: "The man is standing near the train entrance." }
    ],
    trans: "Người đàn ông đang nhìn vào điện thoại di động trên tàu.",
    exp: "Trong bức ảnh, người đàn ông đang ngồi trên ghế tàu và chăm chú nhìn vào màn hình điện thoại cầm trên tay."
  },
  {
    img: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=800&q=80",
    correct: "Two women are seated together at a cafe table.",
    options: [
      { label: "(A)", text: "Two women are seated together at a cafe table." },
      { label: "(B)", text: "A customer is paying for a beverage." },
      { label: "(C)", text: "The waiter is taking an order." },
      { label: "(D)", text: "One of the women is removing her jacket." }
    ],
    trans: "Hai người phụ nữ đang ngồi cùng nhau tại bàn quán cà phê.",
    exp: "Hành động chính mô tả hai người phụ nữ ngồi tại bàn, một người đang xem điện thoại và một người đang lấy đồ từ túi xách."
  },
  {
    img: "https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&w=800&q=80",
    correct: "A woman is writing notes on a document.",
    options: [
      { label: "(A)", text: "A woman is writing notes on a document." },
      { label: "(B)", text: "A woman is shutting down a laptop." },
      { label: "(C)", text: "A woman is organizing file folders." },
      { label: "(D)", text: "A woman is hanging a picture frame." }
    ],
    trans: "Người phụ nữ đang ghi chép lên tài liệu.",
    exp: "Người phụ nữ đang cầm bút viết trên mặt bàn làm việc."
  },
  {
    img: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=800&q=80",
    correct: "A technician is inspecting electronic machinery.",
    options: [
      { label: "(A)", text: "A technician is inspecting electronic machinery." },
      { label: "(B)", text: "A machine is being packed into a box." },
      { label: "(C)", text: "A technician is sweeping the workshop floor." },
      { label: "(D)", text: "Some wires are being disconnected." }
    ],
    trans: "Kỹ thuật viên đang kiểm tra máy móc điện tử.",
    exp: "Kỹ thuật viên đang kiểm tra kỹ lưỡng các bộ phận máy móc trong xưởng."
  },
  {
    img: "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=800&q=80",
    correct: "Boxes are stacked on a pallet inside a warehouse.",
    options: [
      { label: "(A)", text: "Boxes are stacked on a pallet inside a warehouse." },
      { label: "(B)", text: "Workers are unloading a delivery truck." },
      { label: "(C)", text: "The warehouse doors are being locked." },
      { label: "(D)", text: "A forklift is moving down the aisle." }
    ],
    trans: "Các thùng hàng được xếp chồng trên tấm pallet trong kho.",
    exp: "Tranh miêu tả các thùng hàng xếp ngay ngắn trên tấm pallet gỗ."
  },
  {
    img: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=800&q=80",
    correct: "A server is setting plates on a dining table.",
    options: [
      { label: "(A)", text: "A server is setting plates on a dining table." },
      { label: "(B)", text: "Customers are lining up at a buffet." },
      { label: "(C)", text: "A chef is cooking meals in the kitchen." },
      { label: "(D)", text: "The restaurant is closed for renovations." }
    ],
    trans: "Người phục vụ đang bày đĩa lên bàn ăn.",
    exp: "Người phục vụ đang đặt các dụng cụ và đĩa ăn lên bàn trong nhà hàng."
  },
  {
    img: "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&w=800&q=80",
    correct: "Passengers are walking toward the boarding gate.",
    options: [
      { label: "(A)", text: "Passengers are walking toward the boarding gate." },
      { label: "(B)", text: "Luggage is being loaded onto an airplane." },
      { label: "(C)", text: "An airplane is taxiing on the runway." },
      { label: "(D)", text: "A flight attendant is serving drinks." }
    ],
    trans: "Hành khách đang đi về phía cổng lên máy bay.",
    exp: "Hành khách di chuyển trong sảnh chờ sân bay hướng tới cửa khởi hành."
  },
  {
    img: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=800&q=80",
    correct: "Construction workers are gathered near heavy equipment.",
    options: [
      { label: "(A)", text: "Construction workers are gathered near heavy equipment." },
      { label: "(B)", text: "A building is being demolished." },
      { label: "(C)", text: "Workers are painting a wooden fence." },
      { label: "(D)", text: "A crane is lifting concrete blocks." }
    ],
    trans: "Công nhân xây dựng đang tập trung gần máy móc hạng nặng.",
    exp: "Nhóm công nhân đội mũ bảo hộ đang đứng thảo luận gần xe công trình."
  }
];

async function seedLevelBank() {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/tuong_tan_toeic';
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB for Level Bank Seeding.');

    // Remove existing level exercises
    await ListeningExercise.deleteMany({ mode: 'level' });

    const levelConfigs = [
      { level: 1, name: 'Level 1 — Dễ', count: 93, isPro: false },
      { level: 2, name: 'Level 2 — Cơ bản', count: 93, isPro: false },
      { level: 3, name: 'Level 3 — Trung bình', count: 92, isPro: true },
      { level: 4, name: 'Level 4 — Khó', count: 92, isPro: true },
      { level: 5, name: 'Level 5 — Rất khó', count: 92, isPro: true }
    ];

    const levelDocs = [];

    for (const cfg of levelConfigs) {
      const questions = [];

      for (let i = 1; i <= cfg.count; i++) {
        const photo = photosCollection[(cfg.level * 11 + i) % photosCollection.length];
        const correctOpt = photo.options[0];
        
        // Shuffle options deterministically
        const shuffled = [...photo.options].sort((a, b) => (a.text.length + i) % 3 - 1);
        const correctLabel = ['(A)', '(B)', '(C)', '(D)'][shuffled.findIndex(o => o.text === photo.correct)];

        questions.push({
          questionNumber: i,
          audioUrl: `/assets/listening/toeic_p1_lvl${cfg.level}_q${i}.mp3`,
          imageUrl: photo.img,
          promptText: "Select the one statement that best describes what you see in the picture.",
          options: shuffled.map((o, idx) => ({
            label: ['(A)', '(B)', '(C)', '(D)'][idx],
            text: o.text,
            isCorrect: o.text === photo.correct
          })),
          transcript: photo.correct,
          translation: photo.trans,
          dictationText: photo.correct,
          blanks: [{ word: photo.correct.split(' ')[1] || 'man', index: 1 }, { word: photo.correct.split(' ')[3] || 'phone', index: 3 }],
          explanation: photo.exp
        });
      }

      levelDocs.push({
        title: cfg.name,
        part: 1,
        level: cfg.level,
        mode: 'level',
        year: '2026',
        isPro: cfg.isPro,
        totalQuestions: cfg.count,
        questions: questions
      });
    }

    await ListeningExercise.insertMany(levelDocs);
    console.log(`🎉 Seeded all 5 Levels with ${levelDocs.reduce((acc, d) => acc + d.questions.length, 0)} real ETS questions into MongoDB!`);

    process.exit(0);
  } catch (err) {
    console.error('❌ Error seeding level bank:', err);
    process.exit(1);
  }
}

seedLevelBank();
