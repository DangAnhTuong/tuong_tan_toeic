const mongoose = require('mongoose');

async function findTrulyMissingEvidence() {
  await mongoose.connect('mongodb://127.0.0.1:27017/tuong_tan_toeic');
  const db = mongoose.connection.db;

  console.log('=== FINDING QUESTIONS TRULY LACKING PASSAGE CITATIONS/EVIDENCE ===\n');

  const trulyMissing = [];

  // Helper to test if explanation has a quote from passage or explicit clue
  function hasPassageQuote(exp) {
    if (!exp || exp.trim().length < 30) return false;
    // Check if it quotes text
    const quotes = exp.match(/["“][^"”]{4,250}["”]/g);
    if (!quotes || quotes.length === 0) return false;

    // If it only quotes the option itself like: 🎯 ĐÁP ÁN ĐÚNG: (D) "Workplace safety" and nothing else
    // Check if there are other quotes or if the quote is longer than a short option label
    if (/🎯 ĐÁP ÁN ĐÚNG:\s*\([A-D]\)\s*["“][^"”]+["”]\s*\([^\)]+\)\s*$/m.test(exp) &&
        !/dẫn chứng|bài đọc|đoạn \d|câu trước|email|thư điện tử|thông báo/i.test(exp)) {
      return false;
    }
    
    // If it explicitly says "Dẫn chứng:" or "Dẫn chứng 1:" or "[Câu hỏi..."
    if (/dẫn chứng\s*(\d|\([^\)]+\))?:?\s*["“]/i.test(exp)) return true;
    if (/^\[câu hỏi/i.test(exp) && /["“]/.test(exp)) return true;

    // Check if quotes contain phrases of at least 3 words
    const hasLongQuote = quotes.some(q => q.trim().split(/\s+/).length >= 3);
    return hasLongQuote;
  }

  // 1. Check Mocktests Part 7
  const mockTests = await db.collection('mocktests').find({}).toArray();
  for (const t of mockTests) {
    for (const q of (t.questions || [])) {
      const p = q.part;
      const num = q.questionNum;
      if (p === 7 || (num >= 147 && num <= 200)) {
        if (!hasPassageQuote(q.explanation)) {
          trulyMissing.push({
            collection: 'mocktests',
            docId: t._id,
            test: t.title,
            qNum: num,
            prompt: q.prompt,
            passageText: q.passageText,
            options: q.options,
            correctAnswer: q.correctAnswer,
            explanation: q.explanation
          });
        }
      }
    }
  }

  // 2. Check Readingexercises Part 7
  const rDocs = await db.collection('readingexercises').find({
    part: { $in: ['Part 7', 7] }
  }).toArray();
  for (const d of rDocs) {
    for (const q of (d.questions || [])) {
      if (!hasPassageQuote(q.explanation)) {
        trulyMissing.push({
          collection: 'readingexercises',
          docId: d._id,
          title: d.title,
          qNum: q.questionNum,
          prompt: q.prompt,
          passageText: q.passageText,
          options: q.options,
          correctAnswer: q.correctAnswer,
          explanation: q.explanation
        });
      }
    }
  }

  console.log(`Total questions in Part 7 across both collections: ${540 + 4562} = 5102 questions.`);
  console.log(`Questions TRULY lacking passage citations/evidence: ${trulyMissing.length}`);
  console.log(`- In mocktests: ${trulyMissing.filter(x => x.collection === 'mocktests').length}`);
  console.log(`- In readingexercises: ${trulyMissing.filter(x => x.collection === 'readingexercises').length}`);

  console.log('\nSample 5 truly missing evidence:');
  console.log(JSON.stringify(trulyMissing.slice(0, 5).map(x => ({
    col: x.collection,
    test: x.test || x.title,
    qNum: x.qNum,
    prompt: x.prompt,
    exp: x.explanation?.slice(0, 150)
  })), null, 2));

  // Save the list of truly missing questions to a json file for precise processing
  const fs = require('fs');
  fs.writeFileSync(
    'src/data/part7_truly_missing_evidence.json',
    JSON.stringify(trulyMissing.map(x => ({
      collection: x.collection,
      docId: x.docId,
      test: x.test || x.title,
      qNum: x.qNum,
      prompt: x.prompt,
      correctAnswer: x.correctAnswer,
      correctOptionText: x.options?.find(o => o.label?.includes(x.correctAnswer))?.text || '',
      passageText: x.passageText?.slice(0, 1200),
      explanation: x.explanation
    })), null, 2),
    'utf-8'
  );

  await mongoose.disconnect();
  process.exit(0);
}

findTrulyMissingEvidence().catch(console.error);
