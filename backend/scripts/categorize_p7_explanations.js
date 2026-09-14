const mongoose = require('mongoose');

async function categorizeP67() {
  await mongoose.connect('mongodb://127.0.0.1:27017/tuong_tan_toeic');
  const db = mongoose.connection.db;

  const results = {
    mocktests: { A_standard: 0, B_bracket_quote: 0, C_generic_no_quote: 0, D_empty_short: 0, total: 0 },
    readingexercises: { A_standard: 0, B_bracket_quote: 0, C_generic_no_quote: 0, D_empty_short: 0, total: 0 }
  };

  const genericSamples = [];

  // Helper to categorize
  function checkExp(exp, passageText) {
    if (!exp || exp.trim().length < 25) return 'D';
    const clean = exp.trim();
    if (/dẫn chứng:\s*["“]/i.test(clean)) return 'A';
    if (/^\[câu hỏi/i.test(clean) && /["“].+?["”]/.test(clean)) return 'B';
    if (/["“].+?["”]/.test(clean) && /paraphrase|bằng chứng|chứng minh/i.test(clean)) return 'B';
    if (/xét tính liên kết|dựa vào ngữ cảnh của câu và nội dung bài đọc|phương án .+? là câu trả lời chính xác/i.test(clean)) {
      return 'C';
    }
    return 'C';
  }

  // 1. Mocktests Part 7
  const mockTests = await db.collection('mocktests').find({}).toArray();
  for (const t of mockTests) {
    for (const q of (t.questions || [])) {
      const p = q.part;
      const num = q.questionNum;
      if (p === 7 || (num >= 147 && num <= 200)) {
        results.mocktests.total++;
        const cat = checkExp(q.explanation, q.passageText);
        results.mocktests[cat === 'A' ? 'A_standard' : cat === 'B' ? 'B_bracket_quote' : cat === 'C' ? 'C_generic_no_quote' : 'D_empty_short']++;
        if (cat === 'C' && genericSamples.length < 5) {
          genericSamples.push({ source: 'mocktests', test: t.title, qNum: num, prompt: q.prompt, exp: q.explanation.slice(0, 120) });
        }
      }
    }
  }

  // 2. Readingexercises Part 7
  const rDocs = await db.collection('readingexercises').find({
    part: { $in: ['Part 7', 7] }
  }).toArray();
  for (const d of rDocs) {
    for (const q of (d.questions || [])) {
      results.readingexercises.total++;
      const cat = checkExp(q.explanation, q.passageText);
      results.readingexercises[cat === 'A' ? 'A_standard' : cat === 'B' ? 'B_bracket_quote' : cat === 'C' ? 'C_generic_no_quote' : 'D_empty_short']++;
      if (cat === 'C' && genericSamples.length < 10) {
        genericSamples.push({ source: 'readingexercises', title: d.title, qNum: q.questionNum, prompt: q.prompt, exp: q.explanation.slice(0, 120) });
      }
    }
  }

  console.log('--- CATEGORIZATION RESULTS ---');
  console.log('MOCKTESTS Part 7 (540 questions):', results.mocktests);
  console.log('READINGEXERCISES Part 7 (4,562 questions):', results.readingexercises);
  console.log('\nSamples of Category C (Generic without passage quote):');
  console.log(JSON.stringify(genericSamples, null, 2));

  await mongoose.disconnect();
  process.exit(0);
}

categorizeP67().catch(console.error);
