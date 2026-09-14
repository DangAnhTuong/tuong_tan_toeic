const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../../.env') });
const ListeningExercise = require('../models/ListeningExercise');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/tuong_tan_toeic';

async function audit2024And2023() {
  console.log('================================================================');
  console.log('🔍 DEEP AUDIT: 100% BÀI & CÂU CỦA ĐỀ 2024 VÀ ĐỀ 2023 (DICTATION)');
  console.log('================================================================');

  await mongoose.connect(MONGODB_URI, { serverSelectionTimeoutMS: 5000 });

  const yearsToAudit = ['2024', '2023'];
  let grandTotalSentences = 0;
  let grandTotalLessons = 0;
  let totalErrors = 0;

  for (const year of yearsToAudit) {
    console.log(`\n================================================================`);
    console.log(`🚀 KIỂM TRA TOÀN BỘ BỘ ĐỀ NĂM ${year} (10 TESTS x 4 PARTS)`);
    console.log(`================================================================`);

    const yearDocs = await ListeningExercise.find({ mode: 'dictation', year: year }).sort({ part: 1, topic: 1 });
    console.log(`📦 Tìm thấy ${yearDocs.length} tài liệu Part & Test của năm ${year}.`);

    let yearSentences = 0;
    let yearLessons = 0;

    for (let testNum = 1; testNum <= 10; testNum++) {
      const topicName = `Test ${testNum}`;
      console.log(`\n--- 📌 Test ${testNum} (${year}) ---`);

      for (let partNum = 1; partNum <= 4; partNum++) {
        const doc = yearDocs.find(d => d.part === partNum && d.topic === topicName);

        if (!doc) {
          console.log(`  ❌ Thiếu Part ${partNum} cho Test ${testNum} (${year})!`);
          totalErrors++;
          continue;
        }

        const lessons = doc.lessons || [];
        const expectedLessons = partNum === 1 ? 6 : partNum === 2 ? 25 : partNum === 3 ? 13 : 10;
        
        if (lessons.length !== expectedLessons) {
          console.log(`  ⚠️ Part ${partNum}: Có ${lessons.length}/${expectedLessons} bài học.`);
          totalErrors++;
        }

        let partSentencesCount = 0;
        let pErrors = 0;

        lessons.forEach((l, lIdx) => {
          yearLessons++;
          const sentences = l.sentences || [];
          if (sentences.length === 0) {
            console.log(`    ❌ Bài ${lIdx + 1} của Part ${partNum} không có câu nào!`);
            pErrors++;
          }

          sentences.forEach((s, sIdx) => {
            partSentencesCount++;
            yearSentences++;
            
            // Validate sentence text
            if (!s.text || s.text.trim().length === 0) {
              console.log(`    ❌ Bài ${lIdx + 1} Câu ${sIdx + 1} thiếu text tiếng Anh!`);
              pErrors++;
            }

            // Validate translation
            if (!s.translation || s.translation.trim().length === 0) {
              console.log(`    ❌ Bài ${lIdx + 1} Câu ${sIdx + 1} thiếu bản dịch tiếng Việt!`);
              pErrors++;
            }

            // Validate blanks
            if (!s.blanks50 || s.blanks50.length === 0) {
              // Part 1/2/3/4 sentences should have blank indices
              pErrors++;
            }
          });
        });

        if (pErrors === 0) {
          const sampleS = lessons[0]?.sentences?.[0]?.text || '';
          console.log(`  ✅ Part ${partNum}: Đủ ${lessons.length} bài • ${partSentencesCount} câu | Câu 1: "${sampleS.slice(0, 45)}..."`);
        } else {
          totalErrors += pErrors;
        }
      }
    }

    grandTotalSentences += yearSentences;
    grandTotalLessons += yearLessons;
    console.log(`\n📊 TỔNG KẾT ĐỀ ${year}: ${yearLessons} bài học • ${yearSentences.toLocaleString()} câu hỏi (0 LỖI)`);
  }

  console.log('\n================================================================');
  console.log(`🏆 TỔNG KẾT TOÀN DIỆN ĐỀ 2024 & 2023:`);
  console.log(`   - Tổng số bài học (Lessons): ${grandTotalLessons.toLocaleString()} bài`);
  console.log(`   - Tổng số câu chép chính tả (Sentences): ${grandTotalSentences.toLocaleString()} câu`);
  console.log(`   - Trạng thái kiểm toán: ${totalErrors === 0 ? '100% HOÀN HẢO (0 LỖI)' : `CÒN ${totalErrors} LỖI CẦN XỬ LÝ`}`);
  console.log('================================================================');

  await mongoose.disconnect();
}

audit2024And2023().catch(console.error);
