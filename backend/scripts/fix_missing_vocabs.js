const mongoose = require('mongoose');

const VOCAB_FIX_MAP = {
  'turnover': 'doanh thu, tỉ lệ quay vòng vốn/nhân viên',
  'participate': 'tham gia, tham dự',
  'participate in': 'tham gia vào, tham dự',
  'far': 'xa, nhiều, xa xôi',
  'rubber': 'cao su, chất liệu cao su',
  'look through': 'đọc lướt qua, xem qua',
  'enroll': 'ghi danh, đăng ký học',
  'greens': 'rau xanh, mảng xanh cảnh quan',
  'revenue': 'doanh thu, lợi tức',
  'surrounding': 'bao quanh, phụ cận, môi trường xung quanh',
  'general': 'chung, tổng quát, đại cương',
  'sacrifice': 'sự hy sinh, hy sinh vì mục tiêu',
  'carry': 'mang, vác, mang theo, kinh doanh mặt hàng',
  'railing': 'lan can, rào chắn',
  'tolerant': 'khoan dung, chịu đựng được',
  'cabin': 'khoang máy bay, cabin tàu, buồng lái, nhà gỗ',
  'perimeter': 'chu vi, ranh giới xung quanh',
  'wholesale': 'bán buôn, bán sỉ'
};

async function fixMissingVocabs() {
  await mongoose.connect('mongodb://127.0.0.1:27017/tuong_tan_toeic');
  const db = mongoose.connection.db;

  const topics = await db.collection('vocabularytopics').find({}).toArray();
  let fixedCount = 0;

  for (const t of topics) {
    let modified = false;
    for (const w of (t.words || [])) {
      const lower = (w.word || '').toLowerCase().trim();
      if (!w.meaning || !/[àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ]/i.test(w.meaning)) {
        if (VOCAB_FIX_MAP[lower]) {
          w.meaning = VOCAB_FIX_MAP[lower];
          modified = true;
          fixedCount++;
        }
      }
    }
    if (modified) {
      await db.collection('vocabularytopics').updateOne(
        { _id: t._id },
        { $set: { words: t.words } }
      );
    }
  }

  console.log(`✅ Fixed ${fixedCount} vocabulary meanings in vocabularytopics.`);
  process.exit(0);
}

fixMissingVocabs().catch(console.error);
