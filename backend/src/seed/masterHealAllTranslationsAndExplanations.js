const mongoose = require('mongoose');
const ReadingExercise = require('../models/ReadingExercise');
const MockTest = require('../models/MockTest');
const { initMongoVocab, getExactOptionTranslation, isCorrupted } = require('../utils/exactOptionTranslator');
const { isPassageTranslationMismatched, getExactPassageTranslation } = require('../utils/exactPassageTranslator');
const { isExplanationMismatched, generatePedagogicalExplanation } = require('../utils/exactExplanationHealer');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/tuong_tan_toeic';

async function healAllTranslationsAndExplanations() {
  const startTime = Date.now();
  await mongoose.connect(MONGODB_URI, { serverSelectionTimeoutMS: 5000 });
  console.log('✅ Connected to MongoDB.');

  // 1. Initialize Vocabulary Map from MongoDB
  await initMongoVocab(mongoose);

  console.log('\n=============================================================');
  console.log('🚀 1. HEALING READING EXERCISES (PART 5, 6, 7 & GRAMMAR)...');
  console.log('=============================================================');

  const readingDocs = await ReadingExercise.find({});
  console.log(`📚 Found ${readingDocs.length} ReadingExercise collections.`);

  let totalReadingQ = 0;
  let healedOptionsCount = 0;
  let healedExplCount = 0;
  let healedPassageCount = 0;
  let modifiedReadingDocs = 0;

  for (let dIdx = 0; dIdx < readingDocs.length; dIdx++) {
    const doc = readingDocs[dIdx];
    let docModified = false;
    const passageCacheMap = new Map();

    for (let qIdx = 0; qIdx < (doc.questions || []).length; qIdx++) {
      const q = doc.questions[qIdx];
      totalReadingQ++;

      // A. Heal Option Translations
      if (q.options && Array.isArray(q.options)) {
        for (let optIdx = 0; optIdx < q.options.length; optIdx++) {
          const opt = q.options[optIdx];
          const rawText = (opt.text || '').trim();
          const currentTrans = (opt.translation || '').trim();

          if (isCorrupted(rawText, currentTrans)) {
            const newTrans = getExactOptionTranslation(rawText, currentTrans);
            if (newTrans && newTrans !== currentTrans) {
              opt.translation = newTrans;
              healedOptionsCount++;
              docModified = true;
            }
          }
        }
      }

      // B. Heal Passage Translation Mismatch (Part 6 & 7)
      if (q.passageText && q.passageText.trim().length > 30) {
        const passageKey = q.passageText.trim().slice(0, 80);
        if (!passageCacheMap.has(passageKey)) {
          if (isPassageTranslationMismatched(q.passageText, q.translation)) {
            const newPassageTrans = getExactPassageTranslation(q.passageText, q.translation);
            passageCacheMap.set(passageKey, newPassageTrans);
            q.translation = newPassageTrans;
            healedPassageCount++;
            docModified = true;
          } else {
            passageCacheMap.set(passageKey, q.translation);
          }
        } else {
          const cachedTrans = passageCacheMap.get(passageKey);
          if (cachedTrans && q.translation !== cachedTrans) {
            q.translation = cachedTrans;
            docModified = true;
          }
        }
      }

      // C. Heal Mismatched Explanation
      if (isExplanationMismatched(q, doc.part)) {
        const newExpl = generatePedagogicalExplanation(q, doc.part, q.passageText);
        q.explanation = newExpl;
        healedExplCount++;
        docModified = true;
      }
    }

    if (docModified) {
      doc.markModified('questions');
      await doc.save();
      modifiedReadingDocs++;
      console.log(`💾 Saved modified doc: ${doc.title} (Part ${doc.part}) - Progress: ${dIdx + 1}/${readingDocs.length}`);
    }
  }

  console.log(`\n✅ READING EXERCISES COMPLETED:`);
  console.log(`   - Total Questions Scanned: ${totalReadingQ}`);
  console.log(`   - Option Translations Healed: ${healedOptionsCount}`);
  console.log(`   - Passage Translations Re-aligned: ${healedPassageCount}`);
  console.log(`   - Explanations Corrected & Standardized: ${healedExplCount}`);
  console.log(`   - Collections Updated: ${modifiedReadingDocs}`);

  console.log('\n=============================================================');
  console.log('🚀 2. HEALING MOCK TESTS (ALL 16 ETS TESTS)...');
  console.log('=============================================================');

  const mockTests = await MockTest.find({});
  let totalMockQ = 0;
  let mockHealedOptions = 0;
  let mockHealedExpl = 0;
  let modifiedMockTests = 0;

  for (let mIdx = 0; mIdx < mockTests.length; mIdx++) {
    const mt = mockTests[mIdx];
    let mtModified = false;

    for (let qIdx = 0; qIdx < (mt.questions || []).length; qIdx++) {
      const q = mt.questions[qIdx];
      totalMockQ++;

      // A. Option Translations
      if (q.options && Array.isArray(q.options)) {
        for (let optIdx = 0; optIdx < q.options.length; optIdx++) {
          const opt = q.options[optIdx];
          const rawText = (opt.text || '').trim();
          const currentTrans = (opt.translation || '').trim();

          if (isCorrupted(rawText, currentTrans)) {
            const newTrans = getExactOptionTranslation(rawText, currentTrans);
            if (newTrans && newTrans !== currentTrans) {
              opt.translation = newTrans;
              mockHealedOptions++;
              mtModified = true;
            }
          }
        }
      }

      // B. Explanation Mismatch
      if (isExplanationMismatched(q, 'Part 5')) {
        const newExpl = generatePedagogicalExplanation(q, 'Part 5', q.passageText);
        q.explanation = newExpl;
        mockHealedExpl++;
        mtModified = true;
      }
    }

    if (mtModified) {
      mt.markModified('questions');
      await mt.save();
      modifiedMockTests++;
      console.log(`💾 Saved Mock Test: ${mt.title || mt._id}`);
    }
  }

  console.log(`\n✅ MOCK TESTS COMPLETED:`);
  console.log(`   - Total Questions Scanned: ${totalMockQ}`);
  console.log(`   - Option Translations Healed: ${mockHealedOptions}`);
  console.log(`   - Explanations Corrected: ${mockHealedExpl}`);
  console.log(`   - Tests Updated: ${modifiedMockTests}`);

  console.log(`\n🎉 ALL HEALING PROCESSES COMPLETED IN ${((Date.now() - startTime) / 1000).toFixed(1)}s!`);
  await mongoose.disconnect();
  process.exit(0);
}

healAllTranslationsAndExplanations().catch(err => {
  console.error('Fatal error during healing:', err);
  process.exit(1);
});
