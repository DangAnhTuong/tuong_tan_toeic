const mongoose = require('mongoose');

async function verifyLiveDb() {
  await mongoose.connect('mongodb://127.0.0.1:27017/tuong_tan_toeic');
  const db = mongoose.connection.db;

  console.log('=== VERIFYING LIVE MONGODB DATABASE ===\n');

  let totalP7Questions = 0;
  let remainingFallbacks = 0;
  let hasDanChung = 0;
  const remainingList = [];

  const rDocs = await db.collection('readingexercises').find({
    part: { $in: ['Part 7', 7] }
  }).toArray();

  for (const doc of rDocs) {
    for (const q of (doc.questions || [])) {
      totalP7Questions++;
      const exp = (q.explanation || '').trim();

      if (/thông tin (tương ứng|được) nêu rõ trong bài đọc/i.test(exp) ||
          /dựa vào ngữ cảnh của câu và nội dung bài đọc.+từ .+? mang ngữ nghĩa phù hợp/i.test(exp) ||
          /phương án .+? là câu trả lời chính xác theo ngữ cảnh/i.test(exp) ||
          /xét tính liên kết logic của đoạn văn.+phương án .+? cung cấp thông tin liền mạch/i.test(exp)) {
        remainingFallbacks++;
        remainingList.push({ title: doc.title, qNum: q.questionNum, prompt: q.prompt, exp: exp.slice(0, 100) });
      }

      if (/dẫn chứng|\[câu hỏi|\[cross-reference\]/i.test(exp)) {
        hasDanChung++;
      }
    }
  }

  // Also check mocktests
  const mDocs = await db.collection('mocktests').find({}).toArray();
  for (const doc of mDocs) {
    for (const q of (doc.questions || [])) {
      if (q.part === 7 || (q.questionNum >= 147 && q.questionNum <= 200)) {
        totalP7Questions++;
        const exp = (q.explanation || '').trim();

        if (/thông tin (tương ứng|được) nêu rõ trong bài đọc/i.test(exp) ||
            /dựa vào ngữ cảnh của câu và nội dung bài đọc.+từ .+? mang ngữ nghĩa phù hợp/i.test(exp) ||
            /phương án .+? là câu trả lời chính xác theo ngữ cảnh/i.test(exp) ||
            /xét tính liên kết logic của đoạn văn.+phương án .+? cung cấp thông tin liền mạch/i.test(exp)) {
          remainingFallbacks++;
          remainingList.push({ title: doc.title, qNum: q.questionNum, prompt: q.prompt, exp: exp.slice(0, 100) });
        }

        if (/dẫn chứng|\[câu hỏi|\[cross-reference\]/i.test(exp)) {
          hasDanChung++;
        }
      }
    }
  }

  console.log(`Tổng số câu hỏi Part 7 (readingexercises + mocktests): ${totalP7Questions}`);
  console.log(`Số câu CÒN DÍNH generic fallback trong MongoDB: ${remainingFallbacks}`);
  console.log(`Số câu có DẪN CHỨNG / trích đoạn rõ ràng: ${hasDanChung} (${((hasDanChung/totalP7Questions)*100).toFixed(2)}%)`);

  if (remainingList.length > 0) {
    console.log('\nRemaining fallbacks:', JSON.stringify(remainingList, null, 2));
  } else {
    console.log('\n🎉 HOÀN TOÀN SẠCH 100%! Không còn một câu nào dính generic fallback!');
  }

  await mongoose.disconnect();
  process.exit(0);
}

verifyLiveDb().catch(console.error);
