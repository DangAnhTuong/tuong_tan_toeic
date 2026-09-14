const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const { translateToeicPrompt } = require('../utils/toeicPromptTranslator');
const { getTranslation, saveCache } = require('../utils/translationCache');
const { PASSAGE_TRANSLATIONS } = require('./allCuratedPassagesTranslations');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/tuong_tan_toeic';

const FALLBACK_CHECKS = [
  { term: 'quyên góp', enKeys: ['donat', 'contribut'] },
  { term: 'đăng ký nhận', enKeys: ['subscri', 'sign up'] },
  { term: 'thử vai', enKeys: ['audit'] },
  { term: 'bước vào, dự thi', enKeys: ['enter'] },
  { term: 'doanh nghiệp cảnh quan', enKeys: ['landscap'] },
  { term: 'sản phẩm làm vườn', enKeys: ['garden'] },
  { term: 'quy định xây dựng', enKeys: ['construct', 'build', 'regulat'] },
  { term: 'dịch vụ bán bất động sản', enKeys: ['real estate', 'propert'] },
  { term: 'cỗ máy', enKeys: ['machine', 'engine'] },
  { term: 'đóng chai', enKeys: ['bottl'] },
  { term: 'difficult và rewarding', enKeys: ['difficult'] }
];

function isOptionCorrupted(opt) {
  const text = (opt.text || '').toLowerCase().trim();
  const trans = (opt.translation || opt.vietnamese || '').toLowerCase().trim();
  if (!trans) return true;
  if (trans === text && text.length > 2) return true;

  for (const check of FALLBACK_CHECKS) {
    if (trans.includes(check.term)) {
      const hasKey = check.enKeys.some(k => text.includes(k));
      if (!hasKey) return true;
    }
  }
  return false;
}

async function healAll() {
  console.log('🚀 CONNECTING TO MONGODB...');
  await mongoose.connect(MONGODB_URI, { serverSelectionTimeoutMS: 5000 });
  const db = mongoose.connection.db;

  // =========================================================================
  // PART 1: HEAL MOCK TESTS
  // =========================================================================
  console.log('\n=============================================================');
  console.log('📦 1. HEALING ALL 16 MOCK TESTS...');
  console.log('=============================================================');

  const MockTest = mongoose.model('MockTest', new mongoose.Schema({}, { strict: false }));
  const mockDocs = await MockTest.find({});
  let totalMockPromptsHealed = 0;
  let totalMockOptionsHealed = 0;

  for (const test of mockDocs) {
    let modified = false;

    for (const q of (test.questions || [])) {
      // 1. Fix promptTranslation having entire passage
      const pTrans = q.promptTranslation || '';
      const isLongPassage = pTrans.length > 150 || pTrans.includes('<div') || pTrans.includes('<table') || pTrans.includes('Gửi:') || pTrans.includes('HỘI LÀM VƯỜN');

      if (isLongPassage && q.prompt) {
        // Save passage translation to dichNghia if dichNghia is empty or shorter
        if (!q.dichNghia || q.dichNghia.length < pTrans.length) {
          q.dichNghia = pTrans;
        }

        let newPromptTrans = translateToeicPrompt(q.prompt);
        if (!newPromptTrans) {
          newPromptTrans = await getTranslation(q.prompt);
        }
        if (newPromptTrans && newPromptTrans !== pTrans) {
          q.promptTranslation = newPromptTrans;
          totalMockPromptsHealed++;
          modified = true;
        }
      }

      // 2. Specific Adeyemi Fix for Holloway Garden (Test 3 Q195)
      if (q.prompt && q.prompt.includes('Adeyemi') && (q.passageText || '').toLowerCase().includes('holloway')) {
        q.promptTranslation = 'Bà Adeyemi được ngụ ý/gợi ý điều gì?';
        if (q.options && Array.isArray(q.options)) {
          q.options.forEach(opt => {
            if (opt.text.includes('member of the garden society')) {
              opt.translation = 'Bà ấy là thành viên của hội làm vườn.';
              opt.vietnamese = opt.translation;
            } else if (opt.text.includes('beside the main avenue')) {
              opt.translation = 'Bà ấy sẽ đỗ xe bên cạnh đại lộ chính.';
              opt.vietnamese = opt.translation;
            } else if (opt.text.includes('ticket for the pavilion')) {
              opt.translation = 'Bà ấy đã đặt một vé vào khu nhà trưng bày.';
              opt.vietnamese = opt.translation;
            } else if (opt.text.includes('tickets in time for a discount')) {
              opt.translation = 'Bà ấy đã mua vé kịp thời để được giảm giá.';
              opt.vietnamese = opt.translation;
            }
          });
          totalMockOptionsHealed += 4;
          modified = true;
        }
      }

      // 3. General Mock Option Healing
      if (q.options && Array.isArray(q.options)) {
        for (const opt of q.options) {
          if (isOptionCorrupted(opt)) {
            const healed = await getTranslation(opt.text);
            if (healed && healed !== opt.translation) {
              opt.translation = healed;
              opt.vietnamese = healed;
              totalMockOptionsHealed++;
              modified = true;
            }
          }
        }
      }
    }

    if (modified) {
      test.markModified('questions');
      await test.save();
      console.log(`  ✅ Saved healed MockTest: ${test.title} (${test._id})`);
    }
  }

  console.log(`🎉 MOCK TESTS HEALED: ${totalMockPromptsHealed} prompts, ${totalMockOptionsHealed} options.`);

  // =========================================================================
  // PART 2: HEAL READING EXERCISES (PART 5, 6, 7 & GRAMMAR)
  // =========================================================================
  console.log('\n=============================================================');
  console.log('📚 2. HEALING ALL READING EXERCISES...');
  console.log('=============================================================');

  const ReadingExercise = mongoose.model('ReadingExercise', new mongoose.Schema({}, { strict: false }));
  const readingDocs = await ReadingExercise.find({});
  let totalReadingPromptsHealed = 0;
  let totalReadingOptionsHealed = 0;
  let totalReadingPassagesHealed = 0;

  for (const doc of readingDocs) {
    let modified = false;

    // A. Heal Part 6 Fallback Options (sentences)
    for (const q of (doc.questions || [])) {
      // 1. Fix generic placeholder promptTranslations ("Điều gì / Cái gì?")
      if (q.promptTranslation && (q.promptTranslation.includes('Điều gì / Cái gì?') || q.promptTranslation.includes('Tại sao? (Lý do / Mục đích)') || q.promptTranslation.length > 200)) {
        let newPrompt = translateToeicPrompt(q.prompt);
        if (!newPrompt) newPrompt = await getTranslation(q.prompt);
        if (newPrompt && newPrompt !== q.promptTranslation) {
          q.promptTranslation = newPrompt;
          totalReadingPromptsHealed++;
          modified = true;
        }
      }

      // 2. Fix corrupted options
      if (q.options && Array.isArray(q.options)) {
        for (const opt of q.options) {
          if (isOptionCorrupted(opt)) {
            const healed = await getTranslation(opt.text);
            if (healed && healed !== opt.translation) {
              opt.translation = healed;
              opt.vietnamese = healed;
              totalReadingOptionsHealed++;
              modified = true;
            }
          }
        }
      }

      // 3. Fix Passage Translations from Curated Passages
      const pText = (q.passageText || doc.passageText || '').toLowerCase();
      if (pText.length > 30) {
        for (const [key, curatedTrans] of Object.entries(PASSAGE_TRANSLATIONS)) {
          if (pText.includes(key.toLowerCase())) {
            if (q.translation !== curatedTrans || q.passageTranslation !== curatedTrans) {
              q.translation = curatedTrans;
              q.passageTranslation = curatedTrans;
              totalReadingPassagesHealed++;
              modified = true;
            }
            break;
          }
        }
      }
    }

    if (modified) {
      doc.markModified('questions');
      await doc.save();
      console.log(`  ✅ Saved healed ReadingExercise: ${doc.title} (${doc.part} Lv${doc.level || ''})`);
    }
  }

  console.log(`🎉 READING EXERCISES HEALED: ${totalReadingPromptsHealed} prompts, ${totalReadingOptionsHealed} options, ${totalReadingPassagesHealed} passages.`);

  // =========================================================================
  // PART 3: HEAL LISTENING EXERCISES
  // =========================================================================
  console.log('\n=============================================================');
  console.log('🎧 3. HEALING LISTENING EXERCISES...');
  console.log('=============================================================');

  const ListeningExercise = mongoose.model('ListeningExercise', new mongoose.Schema({}, { strict: false }));
  const listenDocs = await ListeningExercise.find({});
  let totalListenOptionsHealed = 0;

  for (const doc of listenDocs) {
    let modified = false;

    for (const q of (doc.questions || [])) {
      if (q.options && Array.isArray(q.options)) {
        for (const opt of q.options) {
          if (isOptionCorrupted(opt)) {
            const healed = await getTranslation(opt.text);
            if (healed && healed !== opt.translation) {
              opt.translation = healed;
              totalListenOptionsHealed++;
              modified = true;
            }
          }
        }
      }
    }

    if (modified) {
      doc.markModified('questions');
      await doc.save();
      console.log(`  ✅ Saved healed ListeningExercise: ${doc.title} (Part ${doc.part})`);
    }
  }

  console.log(`🎉 LISTENING EXERCISES HEALED: ${totalListenOptionsHealed} options.`);

  // Save updated cache
  saveCache();

  console.log('\n=============================================================');
  console.log('🏁 MASTER BILINGUAL HEALING COMPLETE ACROSS ALL MODULES!');
  console.log('=============================================================');

  process.exit(0);
}

healAll().catch(err => {
  console.error('Fatal healing error:', err);
  process.exit(1);
});
