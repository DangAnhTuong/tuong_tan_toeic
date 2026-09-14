const mongoose = require('mongoose');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/tuong_tan_toeic';

function normalizeAnswer(ans) {
  if (!ans) return '';
  const s = String(ans).trim().toUpperCase();
  if (s === '1') return 'A';
  if (s === '2') return 'B';
  if (s === '3') return 'C';
  if (s === '4') return 'D';
  return s;
}

function cleanText(txt) {
  return (txt || '').replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, '').trim().toLowerCase();
}

async function auditKeyConsistency() {
  console.log('================================================================');
  console.log('🔍 BẮT ĐẦU ĐỐI SOÁT ĐÁP ÁN ĐÚNG (KEY) VS LỜI GIẢI CHI TIẾT (EXPLANATION)...');
  console.log('================================================================\n');

  await mongoose.connect(MONGODB_URI, { serverSelectionTimeoutMS: 5000 });
  const db = mongoose.connection.db;

  const results = {
    mockTests: { total: 0, checked: 0, matchedExact: 0, discrepancies: [] },
    reading: { total: 0, checked: 0, matchedExact: 0, discrepancies: [] }
  };

  // 1. AUDIT MOCKTESTS (2000 Questions)
  console.log('--- 1. Đối Soát MockTests (10 Đề ETS 2026 - 2.000 Câu) ---');
  const mockDocs = await db.collection('mocktests').find({}).toArray();

  for (const test of mockDocs) {
    for (const q of (test.questions || [])) {
      results.mockTests.total++;
      const key = normalizeAnswer(q.correctAnswer);
      const expl = q.explanation || '';
      const options = q.options || [];

      // Valid key check
      if (!['A', 'B', 'C', 'D'].includes(key)) {
        results.mockTests.discrepancies.push({
          testTitle: test.title,
          qNum: q.questionNum,
          part: q.part,
          issue: `Invalid key format: [${q.correctAnswer}]`
        });
        continue;
      }

      // Check option index
      const correctOpt = options.find(o => normalizeAnswer(o.label) === key) || options[['A', 'B', 'C', 'D'].indexOf(key)];
      const correctText = cleanText(correctOpt?.text || '');

      // Check explicit letter in explanation: e.g. "chọn (A)", "chọn A", "đáp án đúng là (A)", "→ chọn B"
      // MUST NOT match words starting with c like "chọn chứ", "chọn của", "chọn các", "chọn bữa", "chọn dành"
      const explicitLetterMatch = expl.match(/(?:chọn|đáp án đúng(?: là)?|phương án đúng(?: là)?)\s*[:→\s]*(?:\(([A-D])\)|\b([A-D])\b(?![\p{L}\p{N}]))/iu);
      if (explicitLetterMatch) {
        results.mockTests.checked++;
        const explLetter = (explicitLetterMatch[1] || explicitLetterMatch[2]).toUpperCase();
        if (explLetter === key) {
          results.mockTests.matchedExact++;
        } else {
          results.mockTests.discrepancies.push({
            testTitle: test.title,
            qNum: q.questionNum,
            part: q.part,
            key,
            explLetter,
            issue: `KEY lệch EXPLANATION: Key là [${key}] nhưng lời giải ghi chọn [${explLetter}]`,
            snippet: explicitLetterMatch[0]
          });
        }
        continue;
      }

      // Check explicit text chosen: e.g. chọn "practical" or → chọn "practical"
      const chosenTextMatch = expl.match(/chọn\s*["“]([^"”]+)["”]/i);
      if (chosenTextMatch) {
        results.mockTests.checked++;
        const chosenWord = cleanText(chosenTextMatch[1]);
        if (chosenWord && correctText && (correctText.includes(chosenWord) || chosenWord.includes(correctText))) {
          results.mockTests.matchedExact++;
        } else {
          // Check if chosenWord belongs to another option!
          const wrongOpt = options.find(o => {
            const optTxt = cleanText(o.text || '');
            return optTxt && (optTxt === chosenWord || optTxt.includes(chosenWord));
          });
          if (wrongOpt && normalizeAnswer(wrongOpt.label) !== key) {
            results.mockTests.discrepancies.push({
              testTitle: test.title,
              qNum: q.questionNum,
              part: q.part,
              key,
              wrongKey: normalizeAnswer(wrongOpt.label),
              issue: `KEY lệch EXPLANATION: Key là [${key}] (${correctText}) nhưng lời giải chọn từ [${wrongOpt.label}] (${wrongOpt.text})`,
              snippet: chosenTextMatch[0]
            });
          }
        }
        continue;
      }

      // Check eliminated options: If explanation says e.g. '"practice" (A) ... nên loại', the key MUST NOT be A!
      const eliminatedMatches = Array.from(expl.matchAll(/["“]?([^"”\(\)]+)["”]?\s*\(([A-D])\)[^.\n]*?(?:nên loại|loại)/gi));
      if (eliminatedMatches.length > 0) {
        results.mockTests.checked++;
        const eliminatedLetters = eliminatedMatches.map(m => m[2].toUpperCase());
        if (eliminatedLetters.includes(key)) {
          results.mockTests.discrepancies.push({
            testTitle: test.title,
            qNum: q.questionNum,
            part: q.part,
            key,
            issue: `KEY bị LOẠI trong lời giải: Key là [${key}] nhưng lời giải lại ghi [(${key}) ... nên loại]`,
            snippet: expl.slice(0, 150)
          });
        } else {
          results.mockTests.matchedExact++;
        }
      }
    }
  }

  console.log(`   - Tổng câu hỏi MockTest: ${results.mockTests.total}`);
  console.log(`   - Số câu đối soát được quy tắc rõ ràng: ${results.mockTests.checked}`);
  console.log(`   - Số câu khớp chuẩn xác: ${results.mockTests.matchedExact}`);
  console.log(`   - Số câu vênh (discrepancy): ${results.mockTests.discrepancies.length}`);

  // 2. AUDIT READINGEXERCISES (13,596 Questions)
  console.log('\n--- 2. Đối Soát ReadingExercises (76 Bộ Đề/Level - 13.596 Câu) ---');
  const readingDocs = await db.collection('readingexercises').find({}).toArray();

  for (const doc of readingDocs) {
    for (const q of (doc.questions || [])) {
      results.reading.total++;
      const key = normalizeAnswer(q.correctAnswer);
      const expl = q.explanation || '';
      const options = q.options || [];

      if (!['A', 'B', 'C', 'D'].includes(key)) {
        results.reading.discrepancies.push({
          title: doc.title,
          qNum: q.questionNum,
          part: doc.part,
          issue: `Invalid key format: [${q.correctAnswer}]`
        });
        continue;
      }

      // Check Reading 4-part breakdown: • (X) text: ... → CHÍNH XÁC / ĐÚNG / Loại
      const exactMatch = expl.match(/•\s*\(([A-D])\)[^:\n]*:[^→\n]*→\s*(?:CHÍNH XÁC|ĐÚNG|ĐÁP ÁN ĐÚNG)/i);
      if (exactMatch) {
        results.reading.checked++;
        const explKey = exactMatch[1].toUpperCase();
        if (explKey === key) {
          results.reading.matchedExact++;
        } else {
          results.reading.discrepancies.push({
            title: doc.title,
            qNum: q.questionNum,
            part: doc.part,
            key,
            explKey,
            issue: `KEY lệch EXPLANATION: Key là [${key}] nhưng phân tích ghi [(${explKey}) ... → CHÍNH XÁC]`,
            snippet: exactMatch[0]
          });
        }
        continue;
      }

      // Check if Key is marked as "Loại"
      const keyEliminated = expl.match(new RegExp(`•\\s*\\(${key}\\)[^:\\n]*:[^→\\n]*→\\s*Loại`, 'i'));
      if (keyEliminated) {
        results.reading.checked++;
        results.reading.discrepancies.push({
          title: doc.title,
          qNum: q.questionNum,
          part: doc.part,
          key,
          issue: `KEY bị LOẠI: Key là [${key}] nhưng trong phân tích lại ghi [(${key}) ... → Loại]`,
          snippet: keyEliminated[0]
        });
        continue;
      }

      // Check general explicit letter match
      const explicitLetterMatch = expl.match(/(?:chọn|đáp án đúng(?: là)?|phương án đúng(?: là)?)\s*[:→\s]*(?:\(([A-D])\)|\b([A-D])\b(?![\p{L}\p{N}]))/iu);
      if (explicitLetterMatch) {
        results.reading.checked++;
        const explLetter = (explicitLetterMatch[1] || explicitLetterMatch[2]).toUpperCase();
        if (explLetter === key) {
          results.reading.matchedExact++;
        } else {
          results.reading.discrepancies.push({
            title: doc.title,
            qNum: q.questionNum,
            part: doc.part,
            key,
            explLetter,
            issue: `KEY lệch EXPLANATION: Key là [${key}] nhưng lời giải ghi chọn [${explLetter}]`,
            snippet: explicitLetterMatch[0]
          });
        }
      }
    }
  }

  console.log(`   - Tổng câu hỏi Reading: ${results.reading.total}`);
  console.log(`   - Số câu đối soát được quy tắc rõ ràng: ${results.reading.checked}`);
  console.log(`   - Số câu khớp chuẩn xác: ${results.reading.matchedExact}`);
  console.log(`   - Số câu vênh (discrepancy): ${results.reading.discrepancies.length}`);

  console.log('\n================================================================');
  console.log('🏁 TỔNG KẾT GIAI ĐOẠN 1: ĐỐI SOÁT ĐÁP ÁN VS LỜI GIẢI TOÀN SÀN:');
  console.log(`   - MockTests lệch: ${results.mockTests.discrepancies.length} câu`);
  console.log(`   - ReadingExercises lệch: ${results.reading.discrepancies.length} câu`);
  console.log('================================================================\n');

  if (results.mockTests.discrepancies.length > 0) {
    console.log('⚠️ Chi tiết lệch MockTests:', results.mockTests.discrepancies);
  }
  if (results.reading.discrepancies.length > 0) {
    console.log('⚠️ Chi tiết lệch Reading:', results.reading.discrepancies.slice(0, 10));
  }

  await mongoose.disconnect();
}

auditKeyConsistency().catch(console.error);
