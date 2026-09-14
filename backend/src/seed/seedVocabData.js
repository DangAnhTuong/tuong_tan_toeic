const mongoose = require('mongoose');
const VocabularyTopic = require('../models/VocabularyTopic');

const buoi1Words = require('../../../docs/vocab_mai_phuong/buoi_1_80_tu_nghe.json');
const buoi2Words = require('../../../docs/vocab_mai_phuong/buoi_2_80_tu_nghe.json');
const buoi3Words = require('../../../docs/vocab_mai_phuong/buoi_3_80_tu_nghe.json');

const seedVocabData = [
  // 800 Từ vựng Trọng điểm Kĩ năng Nghe Cô Vũ Thị Mai Phương (Buổi 1 -> Buổi 10)
  {
    title: 'Buổi 1: 80 Từ vựng trọng điểm Nghe 2024 (Phần 1)',
    category: '800_listening_maiphuong',
    tagLabel: '800 TỪ NGHE MAI PHƯƠNG',
    sessionIndex: 1,
    sourceType: 'PRELOADED',
    learnedCount: 0,
    totalCount: buoi1Words.length,
    isPro: false,
    words: buoi1Words
  },
  {
    title: 'Buổi 2: 80 Từ vựng trọng điểm Nghe 2024 (Phần 2)',
    category: '800_listening_maiphuong',
    tagLabel: '800 TỪ NGHE MAI PHƯƠNG',
    sessionIndex: 2,
    sourceType: 'PRELOADED',
    learnedCount: 0,
    totalCount: buoi2Words.length,
    isPro: false,
    words: buoi2Words
  },
  {
    title: 'Buổi 3: 80 Từ vựng trọng điểm Nghe 2024 (Phần 3)',
    category: '800_listening_maiphuong',
    tagLabel: '800 TỪ NGHE MAI PHƯƠNG',
    sessionIndex: 3,
    sourceType: 'PRELOADED',
    learnedCount: 0,
    totalCount: buoi3Words.length,
    isPro: false,
    words: buoi3Words
  },

  // 600 Vocabulary Category
  {
    title: 'Contracts (Điều khoản hợp đồng)',
    category: '600_vocab',
    tagLabel: '600 TỪ VỰNG TOEIC',
    learnedCount: 12,
    totalCount: 12,
    isPro: false,
    words: [
      { word: 'abide by', phonetic: '/əˈbaɪd baɪ/', pos: 'v.', meaning: 'tuân theo, tôn trọng', exampleEn: 'Both parties agreed to abide by the terms of the contract.', exampleVi: 'Cả hai bên đã đồng ý tuân theo các điều khoản của hợp đồng.' },
      { word: 'agreement', phonetic: '/əˈɡriːmənt/', pos: 'n.', meaning: 'hợp đồng, sự thỏa thuận', exampleEn: 'We signed a binding agreement yesterday.', exampleVi: 'Chúng tôi đã ký một thỏa thuận có tính ràng buộc vào ngày hôm qua.' }
    ]
  }
];

async function seedDB() {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/tuong_tan_toeic';
    await mongoose.connect(mongoUri);
    await VocabularyTopic.deleteMany({});
    await VocabularyTopic.insertMany(seedVocabData);
    console.log('🎉 Vocabulary topics seeded successfully to MongoDB!');
    mongoose.connection.close();
  } catch (err) {
    console.error('Error seeding vocab data:', err.message);
  }
}

if (require.main === module) {
  seedDB();
}

module.exports = seedVocabData;
