const mongoose = require('mongoose');
const VideoLesson = require('../models/VideoLesson');

const seedVideoData = [
  {
    title: 'Bài tập danh từ tổng hợp 1',
    chapterTitle: 'Làm chủ ngữ pháp trọng tâm Part 5',
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    duration: '8:47',
    isPro: false,
    subtitles: [
      { timestamp: '04:45', textEn: 'We are looking for someone with two years of experience in the marketing field.', textVi: 'Chúng tôi tìm người có hai năm kinh nghiệm trong lĩnh vực marketing.' }
    ],
    practiceQuestions: [
      {
        questionNum: 2,
        prompt: 'Recent data indicate that the _____ of water in Orlova Valley has dropped over the last two years.',
        options: [
          { label: 'A', text: 'consume' },
          { label: 'B', text: 'consumer' },
          { label: 'C', text: 'consumption' },
          { label: 'D', text: 'consumed' }
        ],
        correctAnswer: 'C',
        explanation: 'Sau mạo từ "the" và trước giới từ "of" cần điền một danh từ không chỉ người (sự tiêu thụ nước).'
      }
    ]
  },
  {
    title: 'Cách làm câu từ loại ở Part 5. Các hậu tố thường gặp',
    chapterTitle: 'Làm chủ ngữ pháp trọng tâm Part 5',
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    duration: '12:30',
    isPro: false,
    practiceQuestions: []
  },
  {
    title: 'Cách phát âm đuôi s,es trong tiếng Anh',
    chapterTitle: 'Học phát âm bằng IPA',
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    duration: '06:15',
    isPro: true,
    practiceQuestions: []
  }
];

async function seedDB() {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/tuong_tan_toeic';
    await mongoose.connect(mongoUri);
    await VideoLesson.deleteMany({});
    await VideoLesson.insertMany(seedVideoData);
    console.log('🎉 Video lessons seeded successfully to MongoDB!');
    mongoose.connection.close();
  } catch (err) {
    console.error('Error seeding video data:', err.message);
  }
}

if (require.main === module) {
  seedDB();
}

module.exports = seedVideoData;
