const mongoose = require('mongoose');

async function detailedAudit() {
  await mongoose.connect('mongodb://127.0.0.1:27017/tuong_tan_toeic');
  const db = mongoose.connection.db;
  const hasVietnameseMarks = (str) => /[àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ]/i.test(str || '');

  console.log('--- EXAMINING MOCKTEST FAKE PREFIX OPTIONS ---');
  const mocktests = await db.collection('mocktests').find({}).toArray();
  let fakeCount = 0;
  for (const test of mocktests) {
    for (const q of (test.questions || [])) {
      for (const opt of (q.options || [])) {
        const trans = (opt.vietnamese || opt.translation || '').trim();
        const raw = (opt.text || '').trim();
        if (trans.startsWith('Phương án (') && trans.includes(raw) && raw.length > 5) {
          if (fakeCount < 5) {
            console.log(`[${test.title}] Part ${q.part} Q${q.questionNum}: label=${opt.label}, text="${opt.text}" -> trans="${trans}"`);
          }
          fakeCount++;
        }
      }
    }
  }

  console.log('\n--- EXAMINING READING NO-VIETNAMESE OPTIONS ---');
  const reading = await db.collection('readingexercises').find({}).toArray();
  let reNoCount = 0;
  for (const doc of reading) {
    for (const q of (doc.questions || [])) {
      for (const opt of (q.options || [])) {
        const trans = (opt.vietnamese || opt.translation || '').trim();
        if (!trans || !hasVietnameseMarks(trans)) {
          if (reNoCount < 10) {
            console.log(`[${doc.title || doc.category}] Part ${doc.part} Q${q.questionNum || q.questionNumber}: text="${opt.text}" -> trans="${trans}"`);
          }
          reNoCount++;
        }
      }
    }
  }

  console.log('\n--- EXAMINING LISTENING NO-VIETNAMESE OPTIONS ---');
  const listening = await db.collection('listeningexercises').find({}).toArray();
  let leNoCount = 0;
  for (const doc of listening) {
    for (const q of (doc.questions || [])) {
      for (const opt of (q.options || [])) {
        const trans = (opt.vietnamese || opt.translation || '').trim();
        if (!trans || !hasVietnameseMarks(trans)) {
          if (leNoCount < 10) {
            console.log(`[${doc.title || doc.category}] Part ${doc.part} Q${q.questionNum || q.questionNumber}: text="${opt.text}" -> trans="${trans}"`);
          }
          leNoCount++;
        }
      }
    }
  }

  console.log('\n--- AUDITING QUESTION PROMPTS / DICH NGHIA ---');
  // Check how many questions in mocktests, reading, listening have question translations
  let mtMissingPromptTrans = 0;
  mocktests.forEach(t => {
    (t.questions || []).forEach(q => {
      const qTrans = q.promptTranslation || q.vietnameseQuestion || q.questionTranslation || '';
      // Also check if q.dichNghia exists
      if (!qTrans && !q.dichNghia) mtMissingPromptTrans++;
    });
  });
  console.log(`MockTests: Questions without prompt translation or dichNghia: ${mtMissingPromptTrans} / ${mocktests.reduce((acc, t) => acc + (t.questions || []).length, 0)}`);

  let reMissingPromptTrans = 0;
  reading.forEach(d => {
    (d.questions || []).forEach(q => {
      const qTrans = q.promptTranslation || q.questionTranslation || q.dichNghia || '';
      if (!qTrans) reMissingPromptTrans++;
    });
  });
  console.log(`Reading: Questions without prompt translation: ${reMissingPromptTrans} / ${reading.reduce((acc, d) => acc + (d.questions || []).length, 0)}`);

  let leMissingPromptTrans = 0;
  listening.forEach(d => {
    (d.questions || []).forEach(q => {
      const qTrans = q.promptTranslation || q.questionTranslation || q.dichNghia || '';
      if (!qTrans) leMissingPromptTrans++;
    });
  });
  console.log(`Listening: Questions without prompt translation: ${leMissingPromptTrans} / ${listening.reduce((acc, d) => acc + (d.questions || []).length, 0)}`);

  process.exit(0);
}

detailedAudit();
