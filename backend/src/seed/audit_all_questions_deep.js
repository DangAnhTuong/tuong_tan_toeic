const mongoose = require('mongoose');

const VIETNAMESE_ACCENT_REGEX = /[àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ]/i;

async function auditDeep() {
  const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/tuong_tan_toeic';
  await mongoose.connect(mongoUri);
  console.log('🚀 Connected to MongoDB:', mongoUri);

  const db = mongoose.connection.db;

  const results = {
    listening: { totalQs: 0, totalOpts: 0, englishTranslationOpts: [], emptyTranslationOpts: [], promptIssues: [] },
    reading: { totalQs: 0, totalOpts: 0, englishTranslationOpts: [], emptyTranslationOpts: [], promptIssues: [] },
    mocktests: { totalQs: 0, totalOpts: 0, englishTranslationOpts: [], emptyTranslationOpts: [], promptIssues: [] }
  };

  function checkOptionTrans(text, trans) {
    const rawText = (text || '').trim();
    const rawTrans = (trans || '').trim();

    if (!rawTrans) {
      return { isIssue: true, reason: 'empty' };
    }
    if (rawTrans === '.') {
      return { isIssue: true, reason: 'dot_only' };
    }
    if (/mymemory/i.test(rawTrans)) {
      return { isIssue: true, reason: 'mymemory_warning' };
    }
    if (/^Người\s+[a-zA-Z]/i.test(rawTrans)) {
      return { isIssue: true, reason: 'nguoi_english_syntax' };
    }
    if (/^Đang\s+[a-zA-Z]/i.test(rawTrans)) {
      return { isIssue: true, reason: 'dang_english_syntax' };
    }
    
    // Number, money, code, time
    if (/^[\$€£]?\d+([,\.]\d+)?%?$/.test(rawText) || /^\d{1,2}:\d{2}$/.test(rawText) || /^\d{4}$/.test(rawText)) {
      return { isIssue: false, isNumber: true };
    }

    // Identical to English
    if (rawTrans.toLowerCase() === rawText.toLowerCase()) {
      return { isIssue: true, reason: 'identical_to_english', text: rawText, trans: rawTrans };
    }

    // Has NO Vietnamese accents at all and contains English words
    if (!VIETNAMESE_ACCENT_REGEX.test(rawTrans)) {
      if (/[a-zA-Z]{3,}/.test(rawTrans)) {
        return { isIssue: true, reason: 'english_without_vietnamese_accent', text: rawText, trans: rawTrans };
      }
    }

    return { isIssue: false };
  }

  // 1. LISTENING EXERCISES
  console.log('--- Scanning listeningexercises ---');
  const listenDocs = await db.collection('listeningexercises').find({}).toArray();
  for (const doc of listenDocs) {
    const qs = doc.questions || [];
    for (let qIdx = 0; qIdx < qs.length; qIdx++) {
      const q = qs[qIdx];
      results.listening.totalQs++;

      const pText = (q.promptText || '').trim();
      const pTrans = (q.promptTranslation || '').trim();
      if (pText && pTrans && pTrans.toLowerCase() === pText.toLowerCase()) {
        results.listening.promptIssues.push({ docId: doc._id, part: doc.part, qNum: q.questionNumber, text: pText });
      }

      const opts = q.options || [];
      for (const opt of opts) {
        results.listening.totalOpts++;
        const check = checkOptionTrans(opt.text, opt.translation || opt.vietnamese);
        if (check.isIssue) {
          if (check.reason === 'empty' || check.reason === 'dot_only') {
            results.listening.emptyTranslationOpts.push({ docId: doc._id, part: doc.part, qNum: q.questionNumber, label: opt.label, text: opt.text });
          } else {
            results.listening.englishTranslationOpts.push({ docId: doc._id, part: doc.part, qNum: q.questionNumber, label: opt.label, text: opt.text, trans: opt.translation, reason: check.reason });
          }
        }
      }
    }
  }

  // 2. READING EXERCISES
  console.log('--- Scanning readingexercises ---');
  const readDocs = await db.collection('readingexercises').find({}).toArray();
  for (const doc of readDocs) {
    const qs = doc.questions || [];
    for (let qIdx = 0; qIdx < qs.length; qIdx++) {
      const q = qs[qIdx];
      results.reading.totalQs++;

      const pText = (q.prompt || '').trim();
      const pTrans = (q.promptTranslation || '').trim();
      if (pText && pTrans && pTrans.toLowerCase() === pText.toLowerCase()) {
        results.reading.promptIssues.push({ docId: doc._id, part: doc.part, qNum: q.questionNumber, text: pText });
      }

      const opts = q.options || [];
      for (const opt of opts) {
        results.reading.totalOpts++;
        const check = checkOptionTrans(opt.text, opt.translation || opt.vietnamese);
        if (check.isIssue) {
          if (check.reason === 'empty' || check.reason === 'dot_only') {
            results.reading.emptyTranslationOpts.push({ docId: doc._id, part: doc.part, qNum: q.questionNumber, label: opt.label, text: opt.text });
          } else {
            results.reading.englishTranslationOpts.push({ docId: doc._id, part: doc.part, qNum: q.questionNumber, label: opt.label, text: opt.text, trans: opt.translation, reason: check.reason });
          }
        }
      }
    }
  }

  // 3. MOCK TESTS
  console.log('--- Scanning mocktests ---');
  const mockDocs = await db.collection('mocktests').find({}).toArray();
  for (const doc of mockDocs) {
    const qs = doc.questions || [];
    for (let qIdx = 0; qIdx < qs.length; qIdx++) {
      const q = qs[qIdx];
      results.mocktests.totalQs++;

      const pText = (q.prompt || '').trim();
      const pTrans = (q.promptTranslation || '').trim();
      if (pText && pTrans && pTrans.toLowerCase() === pText.toLowerCase()) {
        results.mocktests.promptIssues.push({ docId: doc._id, test: doc.title, qNum: q.questionNum, text: pText });
      }

      const opts = q.options || [];
      for (const opt of opts) {
        results.mocktests.totalOpts++;
        const check = checkOptionTrans(opt.text, opt.translation || opt.vietnamese);
        if (check.isIssue) {
          if (check.reason === 'empty' || check.reason === 'dot_only') {
            results.mocktests.emptyTranslationOpts.push({ docId: doc._id, test: doc.title, qNum: q.questionNum, label: opt.label, text: opt.text });
          } else {
            results.mocktests.englishTranslationOpts.push({ docId: doc._id, test: doc.title, qNum: q.questionNum, label: opt.label, text: opt.text, trans: opt.translation || opt.vietnamese, reason: check.reason });
          }
        }
      }
    }
  }

  console.log('\n================ AUDIT SUMMARY ================');
  console.log(`Listening: ${results.listening.totalQs} Qs, ${results.listening.totalOpts} Opts`);
  console.log(`  - English/Corrupted Translations: ${results.listening.englishTranslationOpts.length}`);
  console.log(`  - Empty Translations: ${results.listening.emptyTranslationOpts.length}`);
  console.log(`  - Prompt issues: ${results.listening.promptIssues.length}`);

  console.log(`Reading: ${results.reading.totalQs} Qs, ${results.reading.totalOpts} Opts`);
  console.log(`  - English/Corrupted Translations: ${results.reading.englishTranslationOpts.length}`);
  console.log(`  - Empty Translations: ${results.reading.emptyTranslationOpts.length}`);
  console.log(`  - Prompt issues: ${results.reading.promptIssues.length}`);

  console.log(`Mock Tests: ${results.mocktests.totalQs} Qs, ${results.mocktests.totalOpts} Opts`);
  console.log(`  - English/Corrupted Translations: ${results.mocktests.englishTranslationOpts.length}`);
  console.log(`  - Empty Translations: ${results.mocktests.emptyTranslationOpts.length}`);
  console.log(`  - Prompt issues: ${results.mocktests.promptIssues.length}`);

  const fs = require('fs');
  fs.writeFileSync('audit_deep_results.json', JSON.stringify({
    listeningEnglishCount: results.listening.englishTranslationOpts.length,
    listeningEmptyCount: results.listening.emptyTranslationOpts.length,
    readingEnglishCount: results.reading.englishTranslationOpts.length,
    readingEmptyCount: results.reading.emptyTranslationOpts.length,
    mockEnglishCount: results.mocktests.englishTranslationOpts.length,
    mockEmptyCount: results.mocktests.emptyTranslationOpts.length,
    sampleListeningEnglish: results.listening.englishTranslationOpts.slice(0, 30),
    sampleReadingEnglish: results.reading.englishTranslationOpts.slice(0, 50),
    sampleMockEnglish: results.mocktests.englishTranslationOpts.slice(0, 30)
  }, null, 2));

  console.log('Saved summary to audit_deep_results.json');
  await mongoose.disconnect();
}

auditDeep().catch(err => {
  console.error('Audit failed:', err);
  process.exit(1);
});
