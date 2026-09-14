const mongoose = require('mongoose');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/tuong_tan_toeic';

async function inspect10() {
  await mongoose.connect(MONGODB_URI);
  const db = mongoose.connection.db;

  const readingDocs = await db.collection('readingexercises').find({}).toArray();

  for (const doc of readingDocs) {
    for (const q of (doc.questions || [])) {
      const key = (q.correctAnswer || '').trim().toUpperCase();
      const expl = q.explanation || '';

      const exactMatch = expl.match(/•\s*\(([A-D])\)[^:\n]*:[^→\n]*→\s*(?:CHÍNH XÁC|ĐÚNG|ĐÁP ÁN ĐÚNG)/i);
      const explicitLetterMatch = expl.match(/(?:chọn|đáp án đúng(?: là)?|phương án đúng(?: là)?)\s*[:→\s]*(?:\(([A-D])\)|\b([A-D])\b(?![\p{L}\p{N}]))/iu);

      let mismatched = false;
      let reason = '';

      if (exactMatch && exactMatch[1].toUpperCase() !== key) {
        mismatched = true;
        reason = `4-part breakdown says [${exactMatch[1]}] is correct, but key is [${key}]`;
      } else if (explicitLetterMatch) {
        const explLetter = (explicitLetterMatch[1] || explicitLetterMatch[2]).toUpperCase();
        if (explLetter !== key) {
          mismatched = true;
          reason = `Expl says choose [${explLetter}], but key is [${key}]`;
        }
      }

      if (mismatched) {
        console.log('================================================================');
        console.log(`Doc ID: ${doc._id} | Title: "${doc.title}" | Part: ${doc.part} | Level: ${doc.level}`);
        console.log(`Q#${q.questionNum} (ID: ${q._id}) | Key: [${key}]`);
        console.log(`Passage Text (snippet): ${(q.passageText || doc.passageText || '').slice(0, 300)}`);
        console.log(`Prompt: ${q.prompt}`);
        console.log('Options:', q.options.map(o => `${o.label}: ${o.text} (${o.translation || o.vietnamese})`));
        console.log(`Reason: ${reason}`);
        console.log(`Current Explanation:\n${expl.slice(0, 300)}\n`);
      }
    }
  }

  await mongoose.disconnect();
}

inspect10().catch(console.error);
