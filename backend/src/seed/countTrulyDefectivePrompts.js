const mongoose = require('mongoose');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/tuong_tan_toeic';

const ENGLISH_QUESTION_WORDS = /\b(what|why|who|whom|whose|when|where|which|how|does|did|is|are|was|were|will|would|can|could|should|most likely|suggested about|indicated about|stated about|mentioned about|according to the|refer to the|first e-mail|second e-mail|third e-mail|web page|her new job)\b/i;

async function countDefective() {
  await mongoose.connect(MONGODB_URI);
  const db = mongoose.connection.db;

  const defective = [];

  for (const col of ['mocktests', 'readingexercises']) {
    const docs = await db.collection(col).find({}).toArray();
    for (const doc of docs) {
      for (const q of (doc.questions || [])) {
        if (q.prompt && q.prompt.length > 5) {
          const pt = (q.promptTranslation || '').trim();
          const withoutQuotes = pt.replace(/["“][^"”]+["”]/g, '').trim();

          // Check if truly defective:
          // 1. empty translation
          // 2. has English question words OUTSIDE quotes
          // 3. translation is identical to prompt
          if (!pt || ENGLISH_QUESTION_WORDS.test(withoutQuotes) || (pt.toLowerCase() === q.prompt.toLowerCase() && pt.length > 10)) {
            defective.push({
              col,
              title: doc.title,
              qNum: q.questionNum,
              prompt: q.prompt,
              pt
            });
          }
        }
      }
    }
  }

  console.log(`Total TRULY defective prompt translations: ${defective.length}`);
  if (defective.length > 0) {
    console.log('\nDefective samples:');
    for (const d of defective.slice(0, 10)) {
      console.log(`[${d.col} | ${d.title} Q${d.qNum}]`);
      console.log(`  EN: "${d.prompt}"`);
      console.log(`  VI: "${d.pt}"\n`);
    }
  }

  await mongoose.disconnect();
}

countDefective().catch(console.error);
