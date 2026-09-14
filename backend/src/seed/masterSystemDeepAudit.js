const mongoose = require('mongoose');

const hasVietnameseMarks = (str) => /[àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ]/i.test(str || '');

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

function isProperNameOrNumber(text) {
  if (!text) return true;
  const t = text.trim();
  // Numbers, prices, percentages, order codes, times
  if (/^[\$#]?[0-9\.,]+%?$/.test(t)) return true;
  if (/^(19|20)\d\d$/.test(t)) return true;
  if (/^\d{1,2}:\d{2}$/.test(t)) return true;
  // Graphic / Frame / Page / Shift labels
  if (/^(Frame|Page|Studio|Area|Room|Gate|Table|Flight|Track|Lane|Shift|Section)\s+[A-Z0-9\.]+$/i.test(t)) return true;
  // Code tokens like 15EW, W32, E-1, 10G, #4012
  if (/^[A-Z0-9\-\.\s]{1,7}$/i.test(t) && /\d/.test(t)) return true;
  // Proper names of people, cities, companies (Title Cased 1-3 words)
  if (/^[A-Z][a-z]+(\s+[A-Z][a-z]+){1,3}$/.test(t)) return true;
  return false;
}

async function runDeepAudit() {
  await mongoose.connect('mongodb://127.0.0.1:27017/tuong_tan_toeic');
  const db = mongoose.connection.db;

  console.log('===============================================================');
  console.log('       MASTER SYSTEM DEEP AUDIT: 48,537 QUESTIONS               ');
  console.log('===============================================================');

  // 1. MockTests
  console.log('\n--- 1. AUDITING MOCKTESTS (16 Tests) ---');
  const mocktests = await db.collection('mocktests').find({}).toArray();
  const mtStats = {
    totalQuestions: 0,
    totalOptions: 0,
    fakePrefix: 0,
    englishClone: 0,
    garbage: 0,
    noVietnamese: 0,
    dualMismatch: 0,
    missingPromptTrans: 0
  };

  for (const test of mocktests) {
    for (const q of (test.questions || [])) {
      mtStats.totalQuestions++;
      const qTrans = q.promptTranslation || q.vietnameseQuestion || q.questionTranslation || '';
      if (!qTrans && !q.dichNghia) {
        mtStats.missingPromptTrans++;
      }

      for (const opt of (q.options || [])) {
        mtStats.totalOptions++;
        const trans = (opt.vietnamese || opt.translation || '').trim();
        const raw = (opt.text || '').trim();

        if (opt.vietnamese && opt.translation && opt.vietnamese !== opt.translation) {
          mtStats.dualMismatch++;
        }

        if (!trans) {
          mtStats.noVietnamese++;
        } else if (isGarbage(trans)) {
          mtStats.garbage++;
        } else if (trans.startsWith('Phương án (') && trans.includes(raw) && raw.length > 5) {
          mtStats.fakePrefix++;
        } else if (trans.toLowerCase() === raw.toLowerCase() && raw.length > 2 && !isProperNameOrNumber(raw)) {
          mtStats.englishClone++;
        } else if (raw.length > 4 && !hasVietnameseMarks(trans) && !isProperNameOrNumber(raw)) {
          mtStats.noVietnamese++;
        }
      }
    }
  }
  console.log(mtStats);

  // 2. ReadingExercises
  console.log('\n--- 2. AUDITING READING EXERCISES ---');
  const reading = await db.collection('readingexercises').find({}).toArray();
  const reStats = {
    totalDocs: reading.length,
    totalQuestions: 0,
    totalOptions: 0,
    fakePrefix: 0,
    englishClone: 0,
    garbage: 0,
    noVietnamese: 0,
    dualMismatch: 0,
    missingPromptTrans: 0
  };

  for (const doc of reading) {
    for (const q of (doc.questions || [])) {
      reStats.totalQuestions++;
      const qTrans = q.promptTranslation || q.questionTranslation || q.dichNghia || '';
      if (!qTrans) {
        reStats.missingPromptTrans++;
      }

      for (const opt of (q.options || [])) {
        reStats.totalOptions++;
        const trans = (opt.vietnamese || opt.translation || '').trim();
        const raw = (opt.text || '').trim();

        if (opt.vietnamese && opt.translation && opt.vietnamese !== opt.translation) {
          reStats.dualMismatch++;
        }

        if (!trans) {
          reStats.noVietnamese++;
        } else if (isGarbage(trans)) {
          reStats.garbage++;
        } else if (trans.startsWith('Phương án (') && trans.includes(raw) && raw.length > 5) {
          reStats.fakePrefix++;
        } else if (trans.toLowerCase() === raw.toLowerCase() && raw.length > 2 && !isProperNameOrNumber(raw)) {
          reStats.englishClone++;
        } else if (raw.length > 4 && !hasVietnameseMarks(trans) && !isProperNameOrNumber(raw)) {
          reStats.noVietnamese++;
        }
      }
    }
  }
  console.log(reStats);

  // 3. ListeningExercises
  console.log('\n--- 3. AUDITING LISTENING EXERCISES ---');
  const listening = await db.collection('listeningexercises').find({}).toArray();
  const leStats = {
    totalDocs: listening.length,
    totalQuestions: 0,
    totalOptions: 0,
    fakePrefix: 0,
    englishClone: 0,
    garbage: 0,
    noVietnamese: 0,
    dualMismatch: 0,
    missingPromptTrans: 0
  };

  for (const doc of listening) {
    for (const q of (doc.questions || [])) {
      leStats.totalQuestions++;
      const qTrans = q.promptTranslation || q.questionTranslation || q.dichNghia || '';
      if (!qTrans) {
        leStats.missingPromptTrans++;
      }

      for (const opt of (q.options || [])) {
        leStats.totalOptions++;
        const trans = (opt.vietnamese || opt.translation || '').trim();
        const raw = (opt.text || '').trim();

        if (opt.vietnamese && opt.translation && opt.vietnamese !== opt.translation) {
          leStats.dualMismatch++;
        }

        if (!trans) {
          leStats.noVietnamese++;
        } else if (isGarbage(trans)) {
          leStats.garbage++;
        } else if (trans.startsWith('Phương án (') && trans.includes(raw) && raw.length > 5) {
          leStats.fakePrefix++;
        } else if (trans.toLowerCase() === raw.toLowerCase() && raw.length > 2 && !isProperNameOrNumber(raw)) {
          leStats.englishClone++;
        } else if (raw.length > 4 && !hasVietnameseMarks(trans) && !isProperNameOrNumber(raw)) {
          leStats.noVietnamese++;
        }
      }
    }
  }
  console.log(leStats);

  console.log('\n===============================================================');
  console.log('TOTAL DEFECT SUMMARY:');
  const totalOpts = mtStats.totalOptions + reStats.totalOptions + leStats.totalOptions;
  const totalDefects = (
    mtStats.fakePrefix + mtStats.englishClone + mtStats.garbage + mtStats.noVietnamese + mtStats.dualMismatch +
    reStats.fakePrefix + reStats.englishClone + reStats.garbage + reStats.noVietnamese + reStats.dualMismatch +
    leStats.fakePrefix + leStats.englishClone + leStats.garbage + leStats.noVietnamese + leStats.dualMismatch
  );
  console.log(`Total Options: ${totalOpts}`);
  console.log(`Total Defects Found: ${totalDefects}`);
  console.log(`Missing Prompt Translations: ${mtStats.missingPromptTrans + reStats.missingPromptTrans + leStats.missingPromptTrans}`);
  console.log('===============================================================');

  return { mtStats, reStats, leStats, totalDefects };
}

if (require.main === module) {
  runDeepAudit().then(() => process.exit(0)).catch(err => {
    console.error('Audit failed:', err);
    process.exit(1);
  });
}

module.exports = { runDeepAudit };
