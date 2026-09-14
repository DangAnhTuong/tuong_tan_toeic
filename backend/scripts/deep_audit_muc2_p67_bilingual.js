const mongoose = require('mongoose');

async function deepAuditMuc2() {
  await mongoose.connect('mongodb://127.0.0.1:27017/tuong_tan_toeic');
  const db = mongoose.connection.db;

  console.log('================================================================');
  console.log('📖 KIỂM TOÁN TỪNG CÂU, TỪNG ĐOẠN, TỪNG DÒNG MỤC 2 (PART 6 & 7 + BILINGUAL)');
  console.log('================================================================\n');

  const SUSPICIOUS_PATTERNS = [
    { name: 'Fake noun "sự ... (danh từ)"', regex: /sự [a-zA-Z]+\s*\(danh từ\)/i },
    { name: 'Fake verb "đang ... (V-ing)"', regex: /đang [a-zA-Z]+\s*\(V-ing\)/i },
    { name: 'Fake adj "có tính ... (tính từ)"', regex: /có tính [a-zA-Z]{3,}\s*\(tính từ\)/i },
    { name: 'Fake adv "một cách ... (trạng từ)"', regex: /một cách [a-zA-Z]{3,}\s*\(trạng từ\)/i },
    { name: 'Placeholder update', regex: /lời giải đang cập nhật|giải thích đang được cập nhật|lời giải đang được chuẩn bị/i },
    { name: 'Placeholder missing', regex: /chưa có giải thích|chưa có lời giải/i },
    { name: 'Generic info statement', regex: /thông tin (được|tương ứng) nêu rõ trong bài đọc/i },
    { name: 'MyMemory warning', regex: /MYMEMORY WARNING/i }
  ];

  const flagged = [];

  // 1. Audit Part 6 & Part 7 in readingexercises
  const p67Docs = await db.collection('readingexercises').find({
    part: { $in: ['Part 6', 'Part 7', 6, 7] },
    mode: { $ne: 'bilingual' }
  }).toArray();

  let totalP67Questions = 0;
  let totalP67Passages = 0;
  let p7EvidenceCount = 0;
  let missingPassage = 0;
  let missingExplanation = 0;
  let missingOptions = 0;
  let missingCorrectAnswer = 0;

  for (const doc of p67Docs) {
    const isP7 = doc.part === 'Part 7' || doc.part === 7;
    const seenPassages = new Set();

    for (let i = 0; i < (doc.questions || []).length; i++) {
      totalP67Questions++;
      const q = doc.questions[i];
      const qNum = q.questionNum || i + 1;

      // Passage text check
      const passage = (q.passageText || doc.passageText || '').trim();
      if (!passage) {
        missingPassage++;
        flagged.push({ doc: doc.title, qNum, issue: 'RỖNG ĐOẠN VĂN (passageText)' });
      } else {
        seenPassages.add(passage);
      }

      // Prompt check
      if (!(q.prompt || '').trim()) {
        flagged.push({ doc: doc.title, qNum, issue: 'RỖNG CÂU HỎI (prompt)' });
      }

      // Options check
      const opts = q.options || [];
      if (opts.length < 4) {
        missingOptions++;
        flagged.push({ doc: doc.title, qNum, issue: `THIẾU PHƯƠNG ÁN (${opts.length}/4)` });
      } else {
        for (const opt of opts) {
          if (!(opt.text || '').trim()) {
            flagged.push({ doc: doc.title, qNum, opt: opt.label, issue: 'RỖNG TEXT PHƯƠNG ÁN' });
          }
          if (!(opt.translation || opt.vietnamese || '').trim()) {
            flagged.push({ doc: doc.title, qNum, opt: opt.label, issue: 'RỖNG DỊCH PHƯƠNG ÁN' });
          }
          // Suspicious patterns in option translation
          for (const sp of SUSPICIOUS_PATTERNS) {
            if (sp.regex.test(opt.translation || '') || sp.regex.test(opt.vietnamese || '')) {
              flagged.push({ doc: doc.title, qNum, opt: opt.label, issue: `OPTION PATTERN: ${sp.name}` });
            }
          }
        }
      }

      // Correct answer check
      if (!['A', 'B', 'C', 'D'].includes((q.correctAnswer || '').trim().toUpperCase())) {
        missingCorrectAnswer++;
        flagged.push({ doc: doc.title, qNum, issue: `ĐÁP ÁN ĐÚNG KHÔNG HỢP LỆ: "${q.correctAnswer}"` });
      }

      // Explanation check
      const exp = (q.explanation || '').trim();
      if (!exp) {
        missingExplanation++;
        flagged.push({ doc: doc.title, qNum, issue: 'RỖNG LỜI GIẢI' });
      } else {
        for (const sp of SUSPICIOUS_PATTERNS) {
          if (sp.regex.test(exp)) {
            flagged.push({ doc: doc.title, qNum, issue: `EXPLANATION PATTERN: ${sp.name}` });
          }
        }
      }

      // Evidence check for Part 7
      if (isP7) {
        if (/dẫn chứng|\[câu hỏi|\[cross-reference\]|\[paraphrase\]|\[suy luận\]/i.test(exp) || /["“].+?["”]/.test(exp)) {
          p7EvidenceCount++;
        } else {
          flagged.push({ doc: doc.title, qNum, issue: 'PART 7 THIẾU DẪN CHỨNG TRÍCH ĐOẠN' });
        }
      }
    }

    totalP67Passages += seenPassages.size;
  }

  // 2. Audit Bilingual Reading Articles (31 articles)
  const bilingualDocs = await db.collection('readingexercises').find({ mode: 'bilingual' }).toArray();
  let totalBilingualQuestions = 0;
  let bilingualPassageCount = 0;
  let bilingualVocabCount = 0;

  for (const doc of bilingualDocs) {
    const art = doc.bilingualArticle;
    if (!art) {
      flagged.push({ doc: doc.title, issue: 'RỖNG OBJECT BILINGUAL ARTICLE' });
      continue;
    }
    const paras = art.paragraphs || [];
    if (paras.length === 0) {
      flagged.push({ doc: doc.title, issue: 'RỖNG PARAGRAPHS BÀI ĐỌC SONG NGỮ' });
    } else {
      bilingualPassageCount += paras.length;
      paras.forEach((p, pIdx) => {
        if (!p.en || !p.en.trim()) flagged.push({ doc: doc.title, issue: `Đoạn ${pIdx+1} rỗng tiếng Anh` });
        if (!p.vi || !p.vi.trim()) flagged.push({ doc: doc.title, issue: `Đoạn ${pIdx+1} rỗng tiếng Việt` });
      });
    }

    const vocabs = art.vocabulary || [];
    bilingualVocabCount += vocabs.length;

    for (const q of (doc.questions || [])) {
      totalBilingualQuestions++;
      if (!q.prompt || !q.prompt.trim()) flagged.push({ doc: doc.title, issue: 'Bilingual câu hỏi rỗng prompt' });
      if (!q.explanation || !q.explanation.trim()) flagged.push({ doc: doc.title, issue: 'Bilingual câu hỏi rỗng explanation' });
      if (!q.correctAnswer) flagged.push({ doc: doc.title, issue: 'Bilingual câu hỏi rỗng correctAnswer' });
      if ((q.options || []).length < 4) flagged.push({ doc: doc.title, issue: 'Bilingual câu hỏi thiếu options' });
    }
  }

  // 3. Audit Mock Tests Reading Section (10 Tests x 100 Questions)
  const mockDocs = await db.collection('mocktests').find({}).toArray();
  let mockReadingQuestions = 0;
  let mockReadingPassages = 0;
  let mockP7Evidence = 0;

  for (const t of mockDocs) {
    const seenMockPassages = new Set();
    for (const q of (t.questions || [])) {
      if (q.questionNum >= 101 && q.questionNum <= 200) {
        mockReadingQuestions++;
        const exp = (q.explanation || '').trim();

        if (!exp) flagged.push({ doc: t.title, qNum: q.questionNum, issue: 'MockTest rỗng explanation' });
        if ((q.options || []).length < 4) flagged.push({ doc: t.title, qNum: q.questionNum, issue: 'MockTest thiếu options' });

        if (q.questionNum >= 131 && q.questionNum <= 200) {
          const passage = (q.passageText || q.passage || '').trim();
          if (!passage) {
            flagged.push({ doc: t.title, qNum: q.questionNum, issue: 'MockTest Part 6/7 rỗng passage' });
          } else {
            seenMockPassages.add(passage);
          }
        }

        if (q.questionNum >= 147 && q.questionNum <= 200) {
          if (/dẫn chứng|\[câu hỏi|\[cross-reference\]|\[paraphrase\]|\[suy luận\]/i.test(exp) || /["“].+?["”]/.test(exp)) {
            mockP7Evidence++;
          } else {
            flagged.push({ doc: t.title, qNum: q.questionNum, issue: 'MockTest Part 7 thiếu dẫn chứng' });
          }
        }
      }
    }
    mockReadingPassages += seenMockPassages.size;
  }

  console.log('--- KẾT QUẢ KIỂM TOÁN TỔNG THỂ MỤC 2 ---');
  console.log(`1. Phân hệ Part 6 & Part 7 (readingexercises):`);
  console.log(`   - Tổng số câu hỏi: ${totalP67Questions.toLocaleString()} câu`);
  console.log(`   - Tổng số đoạn văn ETS duy nhất: ${totalP67Passages.toLocaleString()} đoạn`);
  console.log(`   - Số câu Part 7 có Dẫn chứng trích đoạn: ${p7EvidenceCount} / 4.438 (${((p7EvidenceCount/4438)*100).toFixed(2)}%)`);
  console.log(`   - Số câu rỗng đoạn văn: ${missingPassage}`);
  console.log(`   - Số câu rỗng lời giải: ${missingExplanation}`);
  console.log(`   - Số câu thiếu phương án hoặc rỗng text: ${missingOptions}`);
  console.log(`   - Số câu sai/rỗng đáp án đúng: ${missingCorrectAnswer}`);

  console.log(`\n2. Phân hệ Đọc Song Ngữ (Bilingual Reading):`);
  console.log(`   - Số bài đọc: ${bilingualDocs.length} bài`);
  console.log(`   - Số đoạn văn Anh - Việt song song: ${bilingualPassageCount} đoạn`);
  console.log(`   - Số từ vựng trọng tâm: ${bilingualVocabCount} từ`);
  console.log(`   - Số câu hỏi kiểm tra: ${totalBilingualQuestions} câu`);

  console.log(`\n3. Đề Thi Thử ETS 2026 (Mock Tests Reading Section):`);
  console.log(`   - Số bộ đề: ${mockDocs.length} đề`);
  console.log(`   - Tổng câu hỏi Reading (Part 5, 6, 7): ${mockReadingQuestions} câu`);
  console.log(`   - Tổng số đoạn văn Part 6 & 7: ${mockReadingPassages} đoạn`);
  console.log(`   - Số câu Part 7 có Dẫn chứng: ${mockP7Evidence} / 540 (${((mockP7Evidence/540)*100).toFixed(2)}%)`);

  console.log(`\n4. TỔNG SỐ LỖI PHÁT HIỆN ĐƯỢC: ${flagged.length} lỗi`);
  if (flagged.length > 0) {
    console.log('Chi tiết lỗi:', JSON.stringify(flagged, null, 2));
  } else {
    console.log('🏆 100.00% KHÔNG CÓ BẤT KỲ LỖI NÀO TRONG TOÀN BỘ MỤC 2!');
  }

  await mongoose.disconnect();
}

deepAuditMuc2().catch(console.error);
