const mongoose = require('mongoose');

async function fullAudit() {
  await mongoose.connect('mongodb://127.0.0.1:27017/tuong_tan_toeic');
  const ReadingExercise = mongoose.model('ReadingExercise', new mongoose.Schema({}, { strict: false }));
  const MockTest = mongoose.model('MockTest', new mongoose.Schema({}, { strict: false }));
  
  console.log('=====================================================');
  console.log('🔍 FULL BILINGUAL & TRANSLATION SYSTEM AUDIT');
  console.log('=====================================================');

  // 1. Reading Exercises
  const readingDocs = await ReadingExercise.find({}).lean();
  let totalReadingQ = 0;
  let readingMismatchedExpl = 0;
  let readingTemplateExpl = 0;
  let readingMismatchedOptTrans = 0;
  let readingMissingOptTrans = 0;
  let readingPassageMismatches = 0;
  let totalPassagesChecked = 0;

  // Track common mismatched strings
  const suspiciousTransStrings = [
    'nhưng, thế mà', 'khi, vì', 'các khoản phân bổ (danh từ)', 'ngoại lệ (danh từ)',
    'lấy làm vinh dự', 'vinh dự, sự tôn vinh', 'chính cô ấy (đại từ phản thân)',
    'một cách kỹ lưỡng (trạng từ)', 'sẽ tổ chức (chủ động)'
  ];

  for (const doc of readingDocs) {
    // Check passage translation vs passageText
    const passagesSeen = new Set();
    
    for (const q of (doc.questions || [])) {
      totalReadingQ++;
      const optTexts = (q.options || []).map(o => (o.text || '').toLowerCase().trim());
      const optTrans = (q.options || []).map(o => (o.translation || '').trim());

      // Check option translations
      q.options?.forEach(opt => {
        const t = (opt.translation || '').trim();
        const txt = (opt.text || '').toLowerCase().trim();
        if (!t || t.length < 2) {
          readingMissingOptTrans++;
        }
        // If option text is a noun/adjective/verb like "popularity" but translation is "nhưng, thế mà"
        if (suspiciousTransStrings.includes(t)) {
          // If option text doesn't correspond to this translation
          if (t === 'nhưng, thế mà' && !['yet', 'however', 'but'].includes(txt)) {
            readingMismatchedOptTrans++;
          } else if (t.includes('phân bổ') && !txt.includes('allocat')) {
            readingMismatchedOptTrans++;
          } else if (t.includes('ngoại lệ') && !txt.includes('except')) {
            readingMismatchedOptTrans++;
          } else if (t.includes('vinh dự') && !txt.includes('honor')) {
            readingMismatchedOptTrans++;
          }
        }
      });

      // Check explanation
      const expl = q.explanation || '';
      if (expl.includes('Chỗ trống nối hai tính từ "difficult" và "rewarding"') && !optTexts.includes('yet')) {
        readingMismatchedExpl++;
      } else if (expl.includes('Dựa vào cấu trúc ngữ pháp và ngữ cảnh câu,') && expl.includes('phù hợp nhất về từ loại và thì của câu')) {
        readingTemplateExpl++;
      } else {
        const quotes = expl.match(/"([a-zA-Z]{2,})"/g) || [];
        const quotedWords = quotes.map(w => w.replace(/"/g, '').toLowerCase());
        if (quotedWords.length >= 2) {
          const matchAny = quotedWords.some(w => optTexts.includes(w));
          if (!matchAny && optTexts.length > 0) {
            readingMismatchedExpl++;
          }
        }
      }

      // Check passage translation mismatch
      const passageKey = (q.passageText || '').slice(0, 100);
      if (passageKey && !passagesSeen.has(passageKey)) {
        passagesSeen.add(passageKey);
        totalPassagesChecked++;
        // If passage text has Carmen Phelps but translation has Citrus Leaf or Nadia Reyes
        const pText = (q.passageText || '').toLowerCase();
        const pTrans = (q.translation || '').toLowerCase();
        if (pText.includes('carmen phelps') && !pTrans.includes('carmen') && pTrans.includes('nadia')) {
          readingPassageMismatches++;
        } else if (pText.length > 100 && pTrans.length > 50) {
          // Check for prominent named entities or subjects
          // If passage text contains words like "museum" or "hospital" or "restaurant" but translation is about something completely different
          const hasMuseum = pText.includes('museum') && !pTrans.includes('bảo tàng');
          const hasFlight = (pText.includes('flight') || pText.includes('airline')) && (!pTrans.includes('chuyến bay') && !pTrans.includes('hàng không'));
          const hasHotel = pText.includes('hotel') && !pTrans.includes('khách sạn');
          if (hasMuseum || hasFlight || hasHotel) {
            readingPassageMismatches++;
          }
        }
      }
    }
  }

  console.log(`\n📚 1. READING EXERCISES (${readingDocs.length} collections / levels):`);
  console.log(`- Total Questions: ${totalReadingQ}`);
  console.log(`- Questions with Mismatched Explanations: ${readingMismatchedExpl}`);
  console.log(`- Questions with Generic Template Explanations: ${readingTemplateExpl}`);
  console.log(`- Option Translations Definitely Mismatched: ${readingMismatchedOptTrans}`);
  console.log(`- Missing Option Translations: ${readingMissingOptTrans}`);
  console.log(`- Passages Checked: ${totalPassagesChecked}`);
  console.log(`- Passages with Detectable Mismatched Translations: ${readingPassageMismatches}`);

  // 2. Mock Tests
  const mockTests = await MockTest.find({}).lean();
  let totalMockQ = 0;
  let mockMismatchedExpl = 0;
  let mockMismatchedOptTrans = 0;

  for (const mt of mockTests) {
    for (const q of (mt.questions || [])) {
      totalMockQ++;
      const optTexts = (q.options || []).map(o => (o.text || '').toLowerCase().trim());
      const quotes = (q.explanation || '').match(/"([a-zA-Z]{2,})"/g) || [];
      const quotedWords = quotes.map(w => w.replace(/"/g, '').toLowerCase());
      if (quotedWords.length >= 2) {
        const matchAny = quotedWords.some(w => optTexts.includes(w));
        if (!matchAny && optTexts.length > 0) {
          mockMismatchedExpl++;
        }
      }
      q.options?.forEach(opt => {
        const t = (opt.translation || '').trim();
        const txt = (opt.text || '').toLowerCase().trim();
        if (suspiciousTransStrings.includes(t)) {
          if (t === 'nhưng, thế mà' && !['yet', 'however', 'but'].includes(txt)) mockMismatchedOptTrans++;
          if (t.includes('phân bổ') && !txt.includes('allocat')) mockMismatchedOptTrans++;
        }
      });
    }
  }

  console.log(`\n📝 2. MOCK TESTS (${mockTests.length} tests):`);
  console.log(`- Total Questions: ${totalMockQ}`);
  console.log(`- Questions with Mismatched Explanations: ${mockMismatchedExpl}`);
  console.log(`- Option Translations Definitely Mismatched: ${mockMismatchedOptTrans}`);

  await mongoose.disconnect();
}

fullAudit().catch(console.error);
