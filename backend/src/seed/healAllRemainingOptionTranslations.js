const mongoose = require('mongoose');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/tuong_tan_toeic';

const REMAINING_DICTIONARY = {
  // Phrases
  'will be held': 'sẽ được tổ chức',
  'on oak street': 'trên đường Oak',
  'the business card design': 'thiết kế danh thiếp',

  // Vocabulary Words
  'accumulation': 'sự tích lũy',
  'acknowledgement': 'sự công nhận, lời cảm ơn',
  'arrangement': 'sự sắp xếp, thỏa thuận',
  'calmness': 'sự bình tĩnh, sự điềm tĩnh',
  'carefulness': 'sự cẩn thận, tính cẩn trọng',
  'combination': 'sự kết hợp, sự phối hợp',
  'complexity': 'sự phức tạp',
  'complexness': 'tính phức tạp',
  'comprehension': 'sự thấu hiểu, khả năng hiểu',
  'confusion': 'sự bối rối, sự nhầm lẫn',
  'correction': 'sự sửa chữa, sự điều chỉnh',
  'dedication': 'sự cống hiến, sự tận tâm',
  'deliberation': 'sự cân nhắc kỹ lưỡng, sự thận trọng',
  'dependability': 'sự đáng tin cậy',
  'directness': 'tính thẳng thắn, sự trực tiếp',
  'disruption': 'sự gián đoạn, sự xáo trộn',
  'distinction': 'sự khác biệt, sự xuất sắc',
  'duplication': 'sự trùng lặp, sự nhân bản',
  'elaboration': 'sự tỉ mỉ, sự giải thích chi tiết',
  'encouragement': 'sự khuyến khích, sự động viên',
  'engagement': 'sự tham gia, sự gắn kết',
  'excellence': 'sự xuất sắc, sự ưu tú',
  'excitement': 'sự hào hứng, sự phấn khích',
  'exclusivity': 'tính độc quyền',
  'expectation': 'sự kỳ vọng, sự mong đợi',
  'expertness': 'sự tinh thông, chuyên môn cao',
  'generosity': 'sự hào phóng, lòng rộng lượng',
  'greatness': 'sự vĩ đại, sự to lớn',
  'helpfulness': 'sự nhiệt tình giúp đỡ, tính hữu ích',
  'loudness': 'độ lớn âm thanh, âm lượng',
  'multiplicity': 'sự đa dạng, vô số',
  'nearness': 'sự gần gũi, khoảng cách gần',
  'participation': 'sự tham gia',
  'permission': 'sự cho phép, giấy phép',
  'politeness': 'sự lịch sự, phép lịch sự',
  'preciseness': 'sự chính xác',
  'preferability': 'tính đáng chuộng hơn, sự ưu tiên',
  'prioritization': 'việc sắp xếp thứ tự ưu tiên',
  'prohibition': 'lệnh cấm, sự ngăn cấm',
  'promptness': 'sự nhanh chóng, tính kịp thời',
  'pronouncement': 'lời tuyên bố, phán quyết',
  'quickness': 'sự nhanh nhẹn, tốc độ nhanh',
  'recentness': 'tính gần đây, sự mới xảy ra',
  'recognition': 'sự công nhận, sự ghi nhận',
  'regularity': 'tính đều đặn, sự thường xuyên',
  'repetition': 'sự lặp lại',
  'repetitiousness': 'tính lặp đi lặp lại',
  'reporter': 'phóng viên, nhà báo',
  'retention': 'sự giữ lại, tỷ lệ duy trì',
  'safeness': 'sự an toàn',
  'secureness': 'tính bảo mật, sự an toàn',
  'six': 'sáu (6)',
  'specifies': 'nêu cụ thể, chỉ rõ',
  'suitability': 'sự phù hợp, tính thích hợp',
  'thoroughness': 'sự cẩn trọng, tính kỹ lưỡng',
  'wideness': 'độ rộng, bề rộng',
  'wildness': 'tính hoang dã'
};

async function healRemainingTranslations() {
  console.log('🩹 BẮT ĐẦU CHỮA LÀNH TRIỆT ĐỂ TẤT CẢ PHƯƠNG ÁN CÒN SÓT TRÊN HỆ THỐNG...');
  await mongoose.connect(MONGODB_URI, { serverSelectionTimeoutMS: 5000 });
  const db = mongoose.connection.db;

  let totalMockOptionsHealed = 0;
  let totalReadingOptionsHealed = 0;

  // 1. Heal MockTests
  const mockDocs = await db.collection('mocktests').find({}).toArray();
  for (const test of mockDocs) {
    let modified = false;
    if (test.questions && Array.isArray(test.questions)) {
      for (const q of test.questions) {
        if (q.options && Array.isArray(q.options)) {
          for (const opt of q.options) {
            const raw = (opt.text || '').trim().toLowerCase();
            const currentTr = (opt.translation || '').trim().toLowerCase();
            if (raw === currentTr && REMAINING_DICTIONARY[raw]) {
              opt.translation = REMAINING_DICTIONARY[raw];
              totalMockOptionsHealed++;
              modified = true;
            }
          }
        }
      }
    }
    if (modified) {
      await db.collection('mocktests').updateOne(
        { _id: test._id },
        { $set: { questions: test.questions } }
      );
    }
  }

  // 2. Heal ReadingExercises
  const readingDocs = await db.collection('readingexercises').find({}).toArray();
  for (const doc of readingDocs) {
    let modified = false;
    if (doc.questions && Array.isArray(doc.questions)) {
      for (const q of doc.questions) {
        if (q.options && Array.isArray(q.options)) {
          for (const opt of q.options) {
            const raw = (opt.text || '').trim().toLowerCase();
            const currentTr = (opt.translation || '').trim().toLowerCase();
            if (raw === currentTr && REMAINING_DICTIONARY[raw]) {
              opt.translation = REMAINING_DICTIONARY[raw];
              totalReadingOptionsHealed++;
              modified = true;
            }
          }
        }
      }
    }
    if (modified) {
      await db.collection('readingexercises').updateOne(
        { _id: doc._id },
        { $set: { questions: doc.questions } }
      );
    }
  }

  console.log('\n========================================================');
  console.log('✅ KẾT QUẢ CHỮA LÀNH DỮ LIỆU:');
  console.log(`   - MockTests: Đã chữa lành ${totalMockOptionsHealed} phương án.`);
  console.log(`   - ReadingExercises: Đã chữa lành ${totalReadingOptionsHealed} phương án.`);
  console.log(`   - Tổng cộng: Đã chữa lành ${totalMockOptionsHealed + totalReadingOptionsHealed} phương án.`);
  console.log('========================================================\n');

  await mongoose.disconnect();
}

healRemainingTranslations().catch(err => {
  console.error(err);
  process.exit(1);
});
