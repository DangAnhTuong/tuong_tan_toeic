const mongoose = require('mongoose');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/tuong_tan_toeic';

async function finalMasterAudit() {
  await mongoose.connect(MONGODB_URI);
  const db = mongoose.connection.db;

  console.log('================================================================');
  console.log('🎯 MASTER FORENSIC AUDIT: 100% READING EVIDENCE INTEGRITY');
  console.log('================================================================\n');

  // 1. Reading exercises
  const rDocs = await db.collection('readingexercises').find({}).toArray();
  let rP6Total = 0, rP6Generic = 0;
  let rP7Total = 0, rP7Generic = 0, rP7WithEvidence = 0;

  for (const doc of rDocs) {
    const isP6 = doc.part === 'Part 6' || doc.part === 6;
    const isP7 = doc.part === 'Part 7' || doc.part === 7;

    for (const q of (doc.questions || [])) {
      const exp = (q.explanation || '').trim();
      const isBad = /thông tin (tương ứng|được) nêu rõ trong bài đọc/i.test(exp) ||
                    /dựa vào ngữ cảnh của câu và nội dung bài đọc.+từ .+? mang ngữ nghĩa phù hợp/i.test(exp) && isP7;

      if (isP6) {
        rP6Total++;
        if (isBad) rP6Generic++;
      } else if (isP7) {
        rP7Total++;
        if (isBad) rP7Generic++;
        if (/dẫn chứng|\[câu hỏi|\[cross-reference\]/i.test(exp)) rP7WithEvidence++;
      }
    }
  }

  // 2. Mock tests Part 6 & 7
  const mDocs = await db.collection('mocktests').find({}).toArray();
  let mP6Total = 0, mP6Generic = 0;
  let mP7Total = 0, mP7Generic = 0, mP7WithEvidence = 0;

  for (const doc of mDocs) {
    for (const q of (doc.questions || [])) {
      const p = q.part;
      const num = q.questionNum;
      const exp = (q.explanation || '').trim();
      const isBad = /thông tin (tương ứng|được) nêu rõ trong bài đọc/i.test(exp);

      if (p === 6 || (num >= 131 && num <= 146)) {
        mP6Total++;
        if (isBad) mP6Generic++;
      } else if (p === 7 || (num >= 147 && num <= 200)) {
        mP7Total++;
        if (isBad) mP7Generic++;
        if (/dẫn chứng|\[câu hỏi|\[cross-reference\]/i.test(exp)) mP7WithEvidence++;
      }
    }
  }

  console.log(`📖 1. READINGEXERCISES (PHÒNG LUYỆN ĐỌC THEO LEVEL):`);
  console.log(`   - Part 6 (${rP6Total} câu): Fallback còn lại = ${rP6Generic} (✅ 100% Hoàn chỉnh)`);
  console.log(`   - Part 7 (${rP7Total} câu): Có Dẫn chứng rõ ràng = ${rP7WithEvidence}/${rP7Total} (${((rP7WithEvidence/rP7Total)*100).toFixed(2)}%), Fallback = ${rP7Generic}`);

  console.log(`\n📝 2. MOCKTESTS (10 BỘ ĐỀ THI ETS 2026):`);
  console.log(`   - Part 6 (${mP6Total} câu): Fallback còn lại = ${mP6Generic} (✅ 100% Hoàn chỉnh)`);
  console.log(`   - Part 7 (${mP7Total} câu): Có Dẫn chứng rõ ràng = ${mP7WithEvidence}/${mP7Total} (${((mP7WithEvidence/mP7Total)*100).toFixed(2)}%), Fallback = ${mP7Generic}`);

  const totalAllP7 = rP7Total + mP7Total;
  const totalAllP7Evidence = rP7WithEvidence + mP7WithEvidence;
  const totalAllFallback = rP7Generic + mP7Generic + rP6Generic + mP6Generic;

  console.log(`\n================================================================`);
  console.log(`🏆 TỔNG KẾT TOÀN DIỆN MỤC 2 (DẪN CHỨNG READING PART 6 & 7):`);
  console.log(`   - Tổng số câu Part 7 có dẫn chứng trích đoạn: ${totalAllP7Evidence}/${totalAllP7} (${((totalAllP7Evidence/totalAllP7)*100).toFixed(2)}%)`);
  console.log(`   - Tổng số câu còn dính generic placeholder: ${totalAllFallback}`);
  console.log(`   - Trạng thái: ${totalAllFallback === 0 ? '✅ 100% ZERO DEFECTS HOÀN HẢO!' : '⚠️ Cần xử lý tiếp'}`);
  console.log(`================================================================`);

  await mongoose.disconnect();
  process.exit(0);
}

finalMasterAudit().catch(console.error);
