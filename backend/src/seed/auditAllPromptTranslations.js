const mongoose = require('mongoose');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/tuong_tan_toeic';

// Detect if a string has 2 or more consecutive English common words (not proper nouns)
const ENGLISH_QUESTION_WORDS = /\b(what|why|who|whom|whose|when|where|which|how|does|did|is|are|was|were|will|would|can|could|should|most likely|suggested about|indicated about|stated about|mentioned about|according to the|refer to the|first e-mail|second e-mail|third e-mail|web page|her new job)\b/i;

function hasEnglishFragment(str) {
  if (!str) return true;
  return ENGLISH_QUESTION_WORDS.test(str);
}

async function auditPrompts() {
  await mongoose.connect(MONGODB_URI);
  const db = mongoose.connection.db;

  let totalPrompts = 0;
  let defectivePrompts = 0;
  const defectiveList = [];

  for (const col of ['mocktests', 'readingexercises']) {
    const docs = await db.collection(col).find({}).toArray();
    for (const doc of docs) {
      for (const q of (doc.questions || [])) {
        if (q.prompt && q.prompt.length > 5) {
          totalPrompts++;
          const pt = (q.promptTranslation || '').trim();
          if (!pt || hasEnglishFragment(pt)) {
            defectivePrompts++;
            defectiveList.push({
              col,
              title: doc.title,
              qNum: q.questionNum,
              prompt: q.prompt,
              currentPt: pt
            });
          }
        }
      }
    }
  }

  console.log(`=== AUDIT TẤT CẢ PROMPT TRANSLATION (CÂU HỎI) ===`);
  console.log(`- Tổng số câu hỏi có prompt: ${totalPrompts}`);
  console.log(`- Số câu hỏi có bản dịch bị dính tiếng Anh hoặc chưa dịch: ${defectivePrompts}`);

  console.log('\nSample 15 defective:');
  for (const d of defectiveList.slice(0, 15)) {
    console.log(`[${d.col} | ${d.title} Q${d.qNum}]`);
    console.log(`  EN: "${d.prompt}"`);
    console.log(`  VI: "${d.currentPt}"\n`);
  }

  await mongoose.disconnect();
}

auditPrompts().catch(console.error);
