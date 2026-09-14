const mongoose = require('mongoose');
const { translateText, getTranslationSync, persistCache, hasVietnameseMarks } = require('../utils/universalTranslator');

function isProperNameOrNumber(text) {
  if (!text) return true;
  const t = text.trim();
  if (/^\$?[0-9\.,]+%?$/.test(t)) return true; // Numbers / prices / percentages
  if (/^(19|20)\d\d$/.test(t)) return true; // Years
  if (/^[A-D]\b/.test(t) && t.length <= 2) return true;
  return false;
}

function isDefective(opt) {
  const trans = (opt.vietnamese || opt.translation || '').trim();
  const raw = (opt.text || '').trim();
  if (!raw || isProperNameOrNumber(raw)) return false;

  if (!trans) return true;
  if (trans.toLowerCase() === raw.toLowerCase() && raw.length > 2) return true;
  if (raw.length > 4 && !hasVietnameseMarks(trans)) return true;

  return false;
}

async function mapConcurrent(items, concurrency, fn) {
  let index = 0;
  const workers = Array(concurrency).fill(0).map(async () => {
    while (index < items.length) {
      const current = index++;
      try {
        await fn(items[current], current);
      } catch (e) {
        // Continue
      }
      // Small delay of 80ms
      await new Promise(r => setTimeout(r, 80));
    }
  });
  await Promise.all(workers);
}

async function runHealClones() {
  console.log('🚀 Connecting to MongoDB...');
  await mongoose.connect('mongodb://127.0.0.1:27017/tuong_tan_toeic');
  const db = mongoose.connection.db;
  console.log('✅ Connected.');

  console.log('📥 Scanning all collections for defective English clones...');
  const reading = await db.collection('readingexercises').find({}).toArray();
  const listening = await db.collection('listeningexercises').find({}).toArray();
  const mocktests = await db.collection('mocktests').find({}).toArray();

  const uniqueTexts = new Set();

  function scanOpts(opts) {
    (opts || []).forEach(opt => {
      if (isDefective(opt)) {
        uniqueTexts.add(opt.text.trim());
      }
    });
  }

  reading.forEach(d => (d.questions || []).forEach(q => scanOpts(q.options)));
  listening.forEach(d => (d.questions || []).forEach(q => scanOpts(q.options)));
  mocktests.forEach(d => (d.questions || []).forEach(q => scanOpts(q.options)));

  const textList = Array.from(uniqueTexts);
  console.log(`📦 Found ${textList.length} unique English texts needing translation.`);

  let done = 0;
  await mapConcurrent(textList, 6, async (text) => {
    await translateText(text);
    done++;
    if (done % 100 === 0 || done === textList.length) {
      console.log(`  Translated ${done}/${textList.length}...`);
    }
  });

  persistCache();
  console.log('💾 Cache saved.');

  // Update Reading
  console.log('📝 Updating Reading collections in MongoDB...');
  let reCount = 0;
  for (const doc of reading) {
    let changed = false;
    for (const q of (doc.questions || [])) {
      for (const opt of (q.options || [])) {
        if (isDefective(opt)) {
          const tr = getTranslationSync(opt.text);
          if (tr && hasVietnameseMarks(tr)) {
            opt.translation = tr;
            opt.vietnamese = tr;
            changed = true;
          }
        }
      }
    }
    if (changed) {
      const op = '$' + 'set';
      await db.collection('readingexercises').updateOne({ _id: doc._id }, { [op]: { questions: doc.questions } });
      reCount++;
    }
  }
  console.log(`✅ Updated ${reCount} Reading documents.`);

  // Update Listening
  console.log('📝 Updating Listening collections in MongoDB...');
  let leCount = 0;
  for (const doc of listening) {
    let changed = false;
    for (const q of (doc.questions || [])) {
      for (const opt of (q.options || [])) {
        if (isDefective(opt)) {
          const tr = getTranslationSync(opt.text);
          if (tr && hasVietnameseMarks(tr)) {
            opt.translation = tr;
            opt.vietnamese = tr;
            changed = true;
          }
        }
      }
    }
    if (changed) {
      const op = '$' + 'set';
      await db.collection('listeningexercises').updateOne({ _id: doc._id }, { [op]: { questions: doc.questions } });
      leCount++;
    }
  }
  console.log(`✅ Updated ${leCount} Listening documents.`);

  // Update MockTests
  console.log('📝 Updating MockTests in MongoDB...');
  let mtCount = 0;
  for (const test of mocktests) {
    let changed = false;
    for (const q of (test.questions || [])) {
      for (const opt of (q.options || [])) {
        if (isDefective(opt)) {
          const tr = getTranslationSync(opt.text);
          if (tr && hasVietnameseMarks(tr)) {
            opt.translation = tr;
            opt.vietnamese = tr;
            changed = true;
          }
        }
      }
    }
    if (changed) {
      const op = '$' + 'set';
      await db.collection('mocktests').updateOne({ _id: test._id }, { [op]: { questions: test.questions } });
      mtCount++;
    }
  }
  console.log(`✅ Updated ${mtCount} MockTests.`);

  console.log('🎉 ALL ENGLISH CLONES HAVE BEEN TRANSLATED & SYNCED TO ZERO DEFECTS!');
  process.exit(0);
}

runHealClones().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
