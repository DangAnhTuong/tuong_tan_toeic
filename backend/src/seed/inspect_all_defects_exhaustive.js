const mongoose = require('mongoose');
const fs = require('fs');

const VIETNAMESE_ACCENT_REGEX = /[àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ]/i;

async function inspectExhaustive() {
  const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/tuong_tan_toeic';
  await mongoose.connect(mongoUri);
  console.log('🚀 Connected to MongoDB:', mongoUri);

  const db = mongoose.connection.db;

  const defectMap = new Map(); // englishText -> { text, currentTrans, occurrences: [] }

  function addDefect(englishText, currentTrans, location, reason) {
    const key = (englishText || '').trim();
    if (!key) return;
    
    // Ignore pure numbers or prices or time (e.g. $10, 2026, 3:00, 15)
    if (/^[\$€£]?\d+([,\.]\d+)?%?$/.test(key) || /^\d{1,2}:\d{2}$/.test(key) || /^\d{4}$/.test(key)) {
      return;
    }

    if (!defectMap.has(key)) {
      defectMap.set(key, {
        text: key,
        currentTrans: currentTrans || '',
        reason,
        locations: []
      });
    }
    const item = defectMap.get(key);
    if (item.locations.length < 5) {
      item.locations.push(location);
    }
  }

  function checkTrans(text, trans, location, type = 'option') {
    const rawText = (text || '').trim();
    const rawTrans = (trans || '').trim();

    if (!rawText) return;

    if (!rawTrans || rawTrans === '.') {
      addDefect(rawText, rawTrans, location, 'empty_or_dot');
      return;
    }

    if (/mymemory/i.test(rawTrans)) {
      addDefect(rawText, rawTrans, location, 'mymemory_warning');
      return;
    }

    if (/^Người\s+[a-zA-Z]/i.test(rawTrans)) {
      addDefect(rawText, rawTrans, location, 'nguoi_english');
      return;
    }

    if (/^Đang\s+[a-zA-Z]/i.test(rawTrans)) {
      addDefect(rawText, rawTrans, location, 'dang_english');
      return;
    }

    // If identical to English text (and not a pure number)
    if (rawTrans.toLowerCase() === rawText.toLowerCase()) {
      addDefect(rawText, rawTrans, location, 'identical_to_english');
      return;
    }

    // Has NO Vietnamese accents at all and has English letters
    if (!VIETNAMESE_ACCENT_REGEX.test(rawTrans) && /[a-zA-Z]{2,}/.test(rawTrans)) {
      addDefect(rawText, rawTrans, location, 'no_vietnamese_accents');
      return;
    }
  }

  // 1. LISTENING
  console.log('1. Auditing listeningexercises...');
  const listenDocs = await db.collection('listeningexercises').find({}).toArray();
  for (const doc of listenDocs) {
    const qs = doc.questions || [];
    for (const q of qs) {
      // Check prompt
      if (q.promptText) {
        checkTrans(q.promptText, q.promptTranslation, { coll: 'listening', docId: doc._id, part: doc.part, qNum: q.questionNumber, type: 'prompt' }, 'prompt');
      }
      // Check options
      for (const opt of (q.options || [])) {
        checkTrans(opt.text, opt.translation || opt.vietnamese, { coll: 'listening', docId: doc._id, part: doc.part, qNum: q.questionNumber, label: opt.label, type: 'option' }, 'option');
      }
    }
  }

  // 2. READING
  console.log('2. Auditing readingexercises...');
  const readDocs = await db.collection('readingexercises').find({}).toArray();
  for (const doc of readDocs) {
    const qs = doc.questions || [];
    for (const q of qs) {
      if (q.prompt) {
        checkTrans(q.prompt, q.promptTranslation, { coll: 'reading', docId: doc._id, part: doc.part, qNum: q.questionNumber, type: 'prompt' }, 'prompt');
      }
      for (const opt of (q.options || [])) {
        checkTrans(opt.text, opt.translation || opt.vietnamese, { coll: 'reading', docId: doc._id, part: doc.part, qNum: q.questionNumber, label: opt.label, type: 'option' }, 'option');
      }
    }
  }

  // 3. MOCK TESTS
  console.log('3. Auditing mocktests...');
  const mockDocs = await db.collection('mocktests').find({}).toArray();
  for (const doc of mockDocs) {
    const qs = doc.questions || [];
    for (const q of qs) {
      if (q.prompt) {
        checkTrans(q.prompt, q.promptTranslation, { coll: 'mocktests', docId: doc._id, test: doc.title, qNum: q.questionNum, type: 'prompt' }, 'prompt');
      }
      for (const opt of (q.options || [])) {
        checkTrans(opt.text, opt.translation || opt.vietnamese, { coll: 'mocktests', docId: doc._id, test: doc.title, qNum: q.questionNum, label: opt.label, type: 'option' }, 'option');
      }
    }
  }

  const allDefects = Array.from(defectMap.values());
  console.log(`\nFound ${allDefects.length} UNIQUE English texts that need proper Vietnamese translation!`);

  // Breakdown by reason
  const reasonCount = {};
  allDefects.forEach(d => {
    reasonCount[d.reason] = (reasonCount[d.reason] || 0) + 1;
  });
  console.log('Reason breakdown:', reasonCount);

  fs.writeFileSync('all_untranslated_exhaustive.json', JSON.stringify(allDefects, null, 2));
  console.log('Saved to all_untranslated_exhaustive.json');

  await mongoose.disconnect();
}

inspectExhaustive().catch(err => {
  console.error('Inspection failed:', err);
  process.exit(1);
});
