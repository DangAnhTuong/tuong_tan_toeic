const mongoose = require('mongoose');
const { getTranslationSync, hasVietnameseMarks } = require('../utils/universalTranslator');

const GARBAGE_PATTERNS = [
  /\/\/\//,
  /\bGIAM\s*DOC\b/i,
  /QUERY\s*LENGTH\s*LIMIT/i,
  /^phương án \([a-d]\)$/i,
  /^lựa chọn \([a-d]\)$/i,
  /^phương án\s*[a-d]$/i
];

function isGarbage(text) {
  if (!text) return false;
  return GARBAGE_PATTERNS.some(pat => pat.test(text));
}

function isDefectiveOption(opt) {
  const trans = (opt.vietnamese || opt.translation || '').trim();
  const raw = (opt.text || '').trim();
  if (!raw) return false;

  if (!trans) return true;
  if (isGarbage(trans)) return true;
  if (trans.startsWith('Phương án (') && trans.includes(raw) && raw.length > 5) return true;
  if (trans.toLowerCase() === raw.toLowerCase() && raw.length > 2) return true;
  if (raw.length > 4 && !hasVietnameseMarks(trans)) return true;

  return false;
}

async function healAllPlatformQuestions() {
  console.log('🚀 Connecting to MongoDB...');
  await mongoose.connect('mongodb://127.0.0.1:27017/tuong_tan_toeic');
  const db = mongoose.connection.db;
  console.log('✅ Connected.');

  // 1. MockTests
  console.log('\n===============================================================');
  console.log('STEP 1: UPDATING MOCKTESTS (16 Tests)');
  console.log('===============================================================');
  const mocktests = await db.collection('mocktests').find({}).toArray();
  let mtUpdatedCount = 0;
  for (const test of mocktests) {
    let changed = false;
    for (const q of (test.questions || [])) {
      if (q.part === 1) {
        if (!q.prompt || q.prompt.length < 5) {
          q.prompt = 'Select the statement that best describes what you see in the photograph.';
          changed = true;
        }
        if (!q.promptTranslation) {
          q.promptTranslation = 'Chọn câu miêu tả đúng nhất những gì bạn nhìn thấy trong bức tranh.';
          changed = true;
        }
      } else {
        const rawP = (q.prompt || '').trim();
        if (rawP && !q.promptTranslation && !q.dichNghia) {
          const tr = getTranslationSync(rawP, true);
          if (tr && tr !== rawP && hasVietnameseMarks(tr)) {
            q.promptTranslation = tr;
            changed = true;
          }
        }
      }

      for (const opt of (q.options || [])) {
        if (isDefectiveOption(opt)) {
          const tr = getTranslationSync(opt.text);
          opt.translation = tr;
          opt.vietnamese = tr;
          changed = true;
        } else {
          const clean = (opt.vietnamese || opt.translation || '').trim();
          if (clean && (opt.vietnamese !== clean || opt.translation !== clean)) {
            opt.vietnamese = clean;
            opt.translation = clean;
            changed = true;
          }
        }
      }
    }

    if (changed) {
      const op = '$' + 'set';
      await db.collection('mocktests').updateOne({ _id: test._id }, { [op]: { questions: test.questions } });
      mtUpdatedCount++;
    }
  }
  console.log(`✅ Updated ${mtUpdatedCount} MockTests.`);

  // 2. Reading
  console.log('\n===============================================================');
  console.log('STEP 2: UPDATING READING EXERCISES (76 Collections)');
  console.log('===============================================================');
  const reading = await db.collection('readingexercises').find({}).toArray();
  let reUpdatedCount = 0;
  for (const doc of reading) {
    let changed = false;
    for (const q of (doc.questions || [])) {
      const rawP = (q.promptText || q.prompt || '').trim();
      if (rawP && !q.promptTranslation && !q.questionTranslation && !q.dichNghia && !rawP.includes('______')) {
        const tr = getTranslationSync(rawP, true);
        if (tr && tr !== rawP && hasVietnameseMarks(tr)) {
          q.promptTranslation = tr;
          changed = true;
        }
      }

      for (const opt of (q.options || [])) {
        if (isDefectiveOption(opt)) {
          const tr = getTranslationSync(opt.text);
          opt.translation = tr;
          opt.vietnamese = tr;
          changed = true;
        } else {
          const clean = (opt.vietnamese || opt.translation || '').trim();
          if (clean && (opt.vietnamese !== clean || opt.translation !== clean)) {
            opt.vietnamese = clean;
            opt.translation = clean;
            changed = true;
          }
        }
      }
    }

    if (changed) {
      const op = '$' + 'set';
      await db.collection('readingexercises').updateOne({ _id: doc._id }, { [op]: { questions: doc.questions } });
      reUpdatedCount++;
    }
  }
  console.log(`✅ Updated ${reUpdatedCount} Reading documents.`);

  // 3. Listening
  console.log('\n===============================================================');
  console.log('STEP 3: UPDATING LISTENING EXERCISES (225 Collections)');
  console.log('===============================================================');
  const listening = await db.collection('listeningexercises').find({}).toArray();
  let leUpdatedCount = 0;
  for (const doc of listening) {
    let changed = false;
    for (const q of (doc.questions || [])) {
      const rawP = (q.promptText || q.prompt || '').trim();
      if (/^Part 1 mirror/i.test(rawP)) {
        q.promptText = 'Select the statement that best describes what you see in the photograph.';
        q.promptTranslation = 'Chọn câu miêu tả đúng nhất những gì bạn nhìn thấy trong bức tranh.';
        changed = true;
      } else if (rawP && !q.promptTranslation && !q.questionTranslation && !q.dichNghia) {
        const tr = getTranslationSync(rawP, true);
        if (tr && tr !== rawP && hasVietnameseMarks(tr)) {
          q.promptTranslation = tr;
          changed = true;
        }
      }

      for (const opt of (q.options || [])) {
        if (isDefectiveOption(opt)) {
          const tr = getTranslationSync(opt.text);
          opt.translation = tr;
          opt.vietnamese = tr;
          changed = true;
        } else {
          const clean = (opt.vietnamese || opt.translation || '').trim();
          if (clean && (opt.vietnamese !== clean || opt.translation !== clean)) {
            opt.vietnamese = clean;
            opt.translation = clean;
            changed = true;
          }
        }
      }
    }

    if (changed) {
      const op = '$' + 'set';
      await db.collection('listeningexercises').updateOne({ _id: doc._id }, { [op]: { questions: doc.questions } });
      leUpdatedCount++;
    }
  }
  console.log(`✅ Updated ${leUpdatedCount} Listening documents.`);

  console.log('\n🎉 ALL COLLECTIONS SUCCESSFULLY HEALED IN MONGODB!');
  process.exit(0);
}

healAllPlatformQuestions().catch(err => {
  console.error('❌ Healing failed:', err);
  process.exit(1);
});
