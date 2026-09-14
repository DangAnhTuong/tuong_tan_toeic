const mongoose = require('mongoose');

async function fixRemaining10() {
  await mongoose.connect('mongodb://127.0.0.1:27017/tuong_tan_toeic');
  const db = mongoose.connection.db;

  const fixes = [
    { docTitle: 'TEST 2 2026 — Part 2', qIndex: 49, trans: '(A) Vào lúc 9 giờ sáng.' },
    { docTitle: 'TEST 8 2026 — Part 2', qIndex: 54, trans: '(B) Chúng tôi cất giữ tất cả các bàn làm việc dự phòng.' },
    { docTitle: 'TEST 2 2024 — Part 2', qIndex: 15, trans: '(C) Không, tôi biết rất rõ tuyến đường này.' },
    { docTitle: 'TEST 5 2024 — Part 3', qIndex: 112, trans: 'Nisreen phải không?' },
    { docTitle: 'TEST 5 2024 — Part 3', qIndex: 133, trans: 'Nisreen phải không?' },
    { docTitle: 'TEST 10 2024 — Part 2', qIndex: 51, trans: '(C) Thực đơn cho bữa trưa ngày mai.' },
    { docTitle: 'TEST 1 2023 — Part 2', qIndex: 50, trans: '(B) Trải các tài liệu ra trên bàn.' },
    { docTitle: 'TEST 2 2023 — Part 2', qIndex: 58, trans: '(B) Hội nghị nghe có vẻ thực sự hào hứng.' },
    { docTitle: 'TEST 8 2023 — Part 2', qIndex: 91, trans: '(C) Để dành chỗ cho thêm nhiều đồ đạc hơn.' },
    { docTitle: 'Câu hỏi why', qIndex: 71, trans: 'Tại sao buổi hội thảo đào tạo lại bị hoãn?' }
  ];

  for (const f of fixes) {
    const doc = await db.collection('listeningexercises').findOne({ title: f.docTitle });
    if (!doc) {
      console.warn(`Doc not found: ${f.docTitle}`);
      continue;
    }
    const items = doc.questions || doc.items || [];
    if (items[f.qIndex]) {
      console.log(`Updating ${f.docTitle} [${f.qIndex}]: "${items[f.qIndex].transcript}" -> "${f.trans}"`);
      items[f.qIndex].translation = f.trans;
      await db.collection('listeningexercises').updateOne(
        { _id: doc._id },
        { $set: { questions: items } }
      );
    } else {
      console.warn(`Item not found at index ${f.qIndex} in ${f.docTitle}`);
    }
  }

  console.log('✅ All 10 remaining dictation issues fixed!');
  await mongoose.disconnect();
}

fixRemaining10().catch(console.error);
