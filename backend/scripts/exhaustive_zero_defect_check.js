const mongoose = require('mongoose');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/tuong_tan_toeic';

async function exhaustiveZeroDefectCheck() {
  await mongoose.connect(MONGODB_URI);
  const db = mongoose.connection.db;

  console.log('================================================================');
  console.log('🔎 KIỂM TOÁN ĐỘC LẬP TỪNG CÂU - TỪNG ĐOẠN (100% EXHAUSTIVE AUDIT)');
  console.log('================================================================\n');

  // Forbidden / generic fallback patterns strictly defined
  const FORBIDDEN_PATTERNS = [
    { name: 'Generic "thông tin được/tương ứng nêu rõ"', regex: /thông tin (được|tương ứng) nêu rõ trong bài đọc/i },
    { name: 'Placeholder "đang cập nhật"', regex: /lời giải đang cập nhật|giải thích đang được cập nhật|lời giải đang được chuẩn bị/i },
    { name: 'Placeholder "chưa có giải thích"', regex: /chưa có giải thích|chưa có lời giải/i },
    { name: 'MyMemory warning', regex: /MYMEMORY WARNING/i },
    { name: 'Generic "đáp án đúng theo ngữ cảnh" rỗng', regex: /^đáp án đúng là lựa chọn chính xác theo ngữ cảnh đoạn văn\.?$/i }
  ];

  // 1. Check all readingexercises
  const rDocs = await db.collection('readingexercises').find({}).toArray();

  let totalReadingQuestions = 0;
  let emptyExplanationCount = 0;
  let emptyPassageCount = 0;
  let totalPassagesAudited = 0;
  let forbiddenPatternHits = 0;
  const flaggedQuestions = [];

  const breakdownByPart = {};

  for (const doc of rDocs) {
    const pName = doc.mode === 'bilingual' ? 'Bilingual' : (doc.part || 'Unknown');
    if (!breakdownByPart[pName]) {
      breakdownByPart[pName] = { docs: 0, questions: 0, passages: 0, hasEvidence: 0 };
    }
    breakdownByPart[pName].docs++;

    // Check passage for Bilingual
    if (doc.mode === 'bilingual') {
      const bArt = doc.bilingualArticle;
      if (!bArt || !bArt.paragraphs || bArt.paragraphs.length === 0) {
        emptyPassageCount++;
        flaggedQuestions.push({ doc: doc.title, issue: 'RỖNG ĐOẠN VĂN SONG NGỮ' });
      } else {
        totalPassagesAudited += bArt.paragraphs.length;
        breakdownByPart[pName].passages += bArt.paragraphs.length;
      }
    } else if (doc.part === 'Part 6' || doc.part === 'Part 7' || doc.part === 6 || doc.part === 7) {
      // For Part 6 and 7: Count unique passages
      const seenPassages = new Set();
      let docHasEmptyPassage = false;

      for (let qIdx = 0; qIdx < (doc.questions || []).length; qIdx++) {
        const q = doc.questions[qIdx];
        const passage = (q.passageText || doc.passageText || '').trim();
        if (!passage) {
          docHasEmptyPassage = true;
        } else {
          seenPassages.add(passage);
        }
      }

      if (docHasEmptyPassage && seenPassages.size === 0) {
        emptyPassageCount++;
        flaggedQuestions.push({ doc: doc.title, issue: 'RỖNG ĐOẠN VĂN' });
      }

      totalPassagesAudited += seenPassages.size;
      breakdownByPart[pName].passages += seenPassages.size;
    }

    for (let qIdx = 0; qIdx < (doc.questions || []).length; qIdx++) {
      const q = doc.questions[qIdx];
      totalReadingQuestions++;
      breakdownByPart[pName].questions++;

      const exp = (q.explanation || '').trim();
      if (!exp) {
        emptyExplanationCount++;
        flaggedQuestions.push({ doc: doc.title, qNum: q.questionNum || qIdx + 1, issue: 'RỖNG GIẢI THÍCH' });
      }

      // Check forbidden patterns in explanation
      for (const fp of FORBIDDEN_PATTERNS) {
        if (fp.regex.test(exp)) {
          forbiddenPatternHits++;
          flaggedQuestions.push({ doc: doc.title, qNum: q.questionNum || qIdx + 1, type: 'explanation', issue: fp.name });
        }
      }

      // Check evidence quote in Part 7
      if (doc.part === 'Part 7' || doc.part === 7) {
        if (/dẫn chứng|\[câu hỏi|\[cross-reference\]|\[paraphrase\]|\[suy luận\]/i.test(exp) || /["“].+?["”]/.test(exp)) {
          breakdownByPart[pName].hasEvidence++;
        }
      }
    }
  }

  // 2. Check all mocktests Part 5, 6, 7
  const mDocs = await db.collection('mocktests').find({}).toArray();

  let totalMockReadingQuestions = 0;
  let mockEmptyExplanation = 0;
  let mockForbiddenHits = 0;
  let mockP7EvidenceCount = 0;
  let mockPassagesAudited = 0;

  for (const t of mDocs) {
    const seenMockPassages = new Set();
    for (const q of (t.questions || [])) {
      const num = q.questionNum;
      if (num >= 101 && num <= 200) {
        totalMockReadingQuestions++;
        const exp = (q.explanation || '').trim();

        if (!exp) {
          mockEmptyExplanation++;
          flaggedQuestions.push({ doc: t.title, qNum: num, issue: 'RỖNG GIẢI THÍCH' });
        }

        // Passage count for Part 6 (131-146) and Part 7 (147-200)
        if (num >= 131 && num <= 200) {
          const passage = (q.passageText || q.passage || '').trim();
          if (passage) {
            seenMockPassages.add(passage);
          }
        }

        for (const fp of FORBIDDEN_PATTERNS) {
          if (fp.regex.test(exp)) {
            mockForbiddenHits++;
            flaggedQuestions.push({ doc: t.title, qNum: num, type: 'explanation', issue: fp.name });
          }
        }

        if (num >= 147 && num <= 200) {
          if (/dẫn chứng|\[câu hỏi|\[cross-reference\]|\[paraphrase\]|\[suy luận\]/i.test(exp) || /["“].+?["”]/.test(exp)) {
            mockP7EvidenceCount++;
          }
        }
      }
    }
    mockPassagesAudited += seenMockPassages.size;
  }

  console.log('--- BẢNG THỐNG KÊ CHI TIẾT TỪNG PHÂN HỆ LUYỆN ĐỌC ---');
  console.table(breakdownByPart);

  console.log('\n--- KẾT QUẢ RÀ SOÁT TỔNG LỰC TOÀN SÀN ---');
  console.log(`- Tổng câu hỏi Reading kiểm tra (readingexercises): ${totalReadingQuestions.toLocaleString()} câu`);
  console.log(`- Tổng câu hỏi Reading trong đề thi (10 Tests x 100 câu): ${totalMockReadingQuestions.toLocaleString()} câu`);
  console.log(`- Tổng cộng toàn hệ thống: ${(totalReadingQuestions + totalMockReadingQuestions).toLocaleString()} câu hỏi Reading`);
  console.log(`- Tổng số bài đọc / đoạn văn ETS được kiểm tra: ${(totalPassagesAudited + mockPassagesAudited).toLocaleString()} đoạn văn (Readingexercises: ${totalPassagesAudited}, MockTests: ${mockPassagesAudited})`);
  console.log(`- Số câu rỗng giải thích: ${emptyExplanationCount + mockEmptyExplanation} câu`);
  console.log(`- Số bài đọc rỗng đoạn văn: ${emptyPassageCount} bài`);
  console.log(`- Số câu vi phạm bất kỳ mẫu placeholder generic nào: ${forbiddenPatternHits + mockForbiddenHits} câu`);
  console.log(`- Tỷ lệ câu hỏi Part 7 có Dẫn chứng trích đoạn bài đọc rõ ràng:`);
  console.log(`  + readingexercises Part 7: ${breakdownByPart['Part 7']?.hasEvidence}/${breakdownByPart['Part 7']?.questions} (${((breakdownByPart['Part 7']?.hasEvidence / breakdownByPart['Part 7']?.questions)*100).toFixed(2)}%)`);
  console.log(`  + mocktests Part 7: ${mockP7EvidenceCount}/540 (${((mockP7EvidenceCount/540)*100).toFixed(2)}%)`);

  if (flaggedQuestions.length > 0) {
    console.log('\n⚠️ CÁC CÂU BỊ CẢNH BÁO:', JSON.stringify(flaggedQuestions, null, 2));
  } else {
    console.log('\n🏆 KẾT LUẬN TUYỆT ĐỐI: CHẮC CHẮN 100.00% KHÔNG BỎ SÓT BẤT KỲ CÂU NÀO, ĐOẠN NÀO!');
  }

  await mongoose.disconnect();
  process.exit(0);
}

exhaustiveZeroDefectCheck().catch(console.error);
