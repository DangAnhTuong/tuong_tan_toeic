const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const SpeakingExercise = require('../models/SpeakingExercise');
const WritingExercise = require('../models/WritingExercise');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/tuong_tan_toeic';

async function seed() {
  await mongoose.connect(MONGODB_URI);
  console.log('Connected to MongoDB');

  // 1. Seed Speaking
  const speakingPath = path.resolve(__dirname, '../../../scratch/dau_speaking_cards.json');
  if (fs.existsSync(speakingPath)) {
    const rawSpeaking = JSON.parse(fs.readFileSync(speakingPath, 'utf8'));
    await SpeakingExercise.deleteMany({});
    console.log('Cleared existing Speaking exercises');

    const speakingDocs = [];
    for (let part = 1; part <= 5; part++) {
      const cards = rawSpeaking[`part${part}`] || [];
      for (const card of cards) {
        let cleanImage = null;
        if (card.image) {
          cleanImage = card.image.replace(/https?:\/\/[^\/]+\/storage\/v1\/object\/public\//g, '/media/');
        }
        speakingDocs.push({
          dauId: card.id,
          code: card.code || `SP${part}-${speakingDocs.length + 1}`,
          part: part,
          level: card.level || 'Easy',
          title: card.title || `Speaking Part ${part}`,
          topic: card.topic || 'Chung',
          topicGroup: card.topic_group || null,
          image: cleanImage,
          prepTime: part === 1 ? 45 : (part === 2 ? 45 : (part === 3 ? 3 : (part === 4 ? 45 : 30))),
          speakTime: part === 1 ? 45 : (part === 2 ? 30 : (part === 3 ? 15 : (part === 4 ? 15 : 60))),
          sampleResponse: '',
          tips: `Tập trung vào phát âm chuẩn, ngữ điệu tự nhiên và trả lời đúng trọng tâm câu hỏi Part ${part}.`,
          accessLevel: card.access_level || 'free'
        });
      }
    }
    const insertedSp = await SpeakingExercise.insertMany(speakingDocs);
    console.log(`Successfully seeded ${insertedSp.length} Speaking exercises across Parts 1-5!`);
  }

  // 2. Seed Writing
  const writingPath = path.resolve(__dirname, '../../../scratch/dau_writing_cards.json');
  if (fs.existsSync(writingPath)) {
    const rawWriting = JSON.parse(fs.readFileSync(writingPath, 'utf8'));
    await WritingExercise.deleteMany({});
    console.log('Cleared existing Writing exercises');

    const writingDocs = [];

    // Part 1: Picture Description (250 cards)
    for (const card of (rawWriting.part1 || [])) {
      writingDocs.push({
        dauId: card.id,
        code: `WP1-${card.external_id || (writingDocs.length + 1)}`,
        part: 1,
        title: (card.words || []).join(' • ') || 'Mô tả bức tranh',
        filterTag: card.pattern || 'All',
        pattern: card.pattern || 'N + V',
        difficulty: card.difficulty || 'medium',
        vietnameseTitle: (card.words_vi || []).join(' • ') || '',
        imageUrl: card.image_name ? `/media/writing/part1/${card.image_name}` : `/media/listening/part1/photo_${((card.external_id || 1) % 45) + 1}.jpg`,
        keywords: card.words || [],
        sampleAnswers: card.samples_en || card.sample_sentences || [],
        sampleTranslations: card.samples_vi || [],
        topic: 'Mô tả tranh',
        accessLevel: card.access_level || 'free'
      });
    }

    // Part 2: Email Response (200 cards)
    for (const card of (rawWriting.part2 || [])) {
      writingDocs.push({
        dauId: card.id,
        code: `WP2-${card.external_id || (writingDocs.length + 1)}`,
        part: 2,
        title: card.title || 'Phản hồi email yêu cầu',
        vietnameseTitle: card.title_vi || '',
        topic: card.chu_de || 'Công sở',
        dangYeuCau: card.dang_yeu_cau || 'Phản hồi email',
        difficulty: 'medium',
        emailPassage: {
          from: 'client@company.com',
          to: 'you@office.com',
          subject: card.title || 'Inquiry',
          sentDate: 'Oct 15, 2026',
          body: card.email || 'Please review the attached details and reply with your availability.'
        },
        sampleAnswers: [],
        usefulPhrases: (card.useful_phrases_1 || []).concat(card.useful_phrases_2 || []),
        accessLevel: card.access_level || 'free'
      });
    }

    // Part 3: Opinion Essay (100 cards)
    for (const card of (rawWriting.part3 || [])) {
      writingDocs.push({
        dauId: card.id,
        code: card.ma_de || `WP3-${writingDocs.length + 1}`,
        part: 3,
        title: card.de_bai ? card.de_bai.substring(0, 100) + '...' : 'Viết bài luận nghị luận',
        vietnameseTitle: card.dich_de ? card.dich_de.substring(0, 100) + '...' : '',
        topic: card.chu_de || 'Xã hội & Đời sống',
        difficulty: card.do_kho || 'medium',
        essayPrompt: {
          promptEn: card.de_bai || '',
          promptVi: card.dich_de || '',
          essayType: card.dang_de || 'Đồng ý/Phản đối'
        },
        sampleAnswers: [],
        outlineSuggestions: [
          'Paragraph 1: Introduction & Thesis Statement',
          'Paragraph 2: First Supporting Reason with Real-world Example',
          'Paragraph 3: Second Supporting Reason or Counter-argument Rebuttal',
          'Paragraph 4: Conclusion & Restatement of Main Opinion'
        ],
        accessLevel: card.access_level || 'free'
      });
    }

    const insertedWr = await WritingExercise.insertMany(writingDocs);
    console.log(`Successfully seeded ${insertedWr.length} Writing exercises across Parts 1-3!`);
  }

  await mongoose.disconnect();
  console.log('Seeding completed successfully!');
}

seed().catch(err => {
  console.error('Seeding failed:', err);
  process.exit(1);
});

