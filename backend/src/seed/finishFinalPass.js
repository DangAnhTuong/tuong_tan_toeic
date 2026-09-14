const mongoose = require('mongoose');
const { translateText, getTranslationSync, persistCache, hasVietnameseMarks } = require('../utils/universalTranslator');

function isCodeOrNumber(t) {
  if (!t) return true;
  const s = t.trim();
  if (/^[\$#]?[0-9\.,]+%?$/.test(s)) return true;
  if (/^[A-Z0-9\-\.\s]{1,6}$/i.test(s) && /\d/.test(s)) return true; // e.g. 15EW, W32, E-1, 10G
  if (/^(Frame|Page|Studio|Area|Room|Gate|Table|Flight|Track|Lane)\s+[A-Z0-9]+$/i.test(s)) return true;
  return false;
}

async function finishFinalPass() {
  await mongoose.connect('mongodb://127.0.0.1:27017/tuong_tan_toeic');
  const db = mongoose.connection.db;

  const le = await db.collection('listeningexercises').find({}).toArray();
  const phrasesToTranslate = new Set();

  for (const doc of le) {
    for (const q of (doc.questions || [])) {
      for (const opt of (q.options || [])) {
        const trans = (opt.vietnamese || opt.translation || '').trim();
        const raw = (opt.text || '').trim();
        if (trans.toLowerCase() === raw.toLowerCase() && raw.length > 2 && !isCodeOrNumber(raw)) {
          if (!hasVietnameseMarks(trans)) {
            phrasesToTranslate.add(raw);
          }
        }
      }
    }
  }

  console.log(`Found ${phrasesToTranslate.size} phrases to finalize.`);
  for (const text of phrasesToTranslate) {
    const tr = await translateText(text);
    console.log(`  ${text} -> ${tr}`);
    await new Promise(r => setTimeout(r, 60));
  }
  persistCache();

  // Apply to Listening
  let updatedCount = 0;
  for (const doc of le) {
    let changed = false;
    for (const q of (doc.questions || [])) {
      for (const opt of (q.options || [])) {
        const raw = (opt.text || '').trim();
        const tr = getTranslationSync(raw);
        if (tr && hasVietnameseMarks(tr)) {
          if (opt.translation !== tr || opt.vietnamese !== tr) {
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
      updatedCount++;
    }
  }
  console.log(`✅ Finalized ${updatedCount} listening documents.`);

  process.exit(0);
}

finishFinalPass();
