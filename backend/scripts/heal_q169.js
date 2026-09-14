const mongoose = require('mongoose');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/tuong_tan_toeic';

async function healQ169() {
  await mongoose.connect(MONGODB_URI);
  const db = mongoose.connection.db;

  const expl = `🎯 ĐÁP ÁN ĐÚNG: (A) "Their color" (Màu sắc của chúng)

💡 DẪN CHỨNG BÀI ĐỌC:
• Dẫn chứng: "The boots are lined with a proprietary material that is highly effective at retaining body heat. They are also durable, light, and comfortable."
(Đôi ủng được lót bằng chất liệu độc quyền có hiệu quả giữ nhiệt cơ thể rất cao. Chúng cũng rất bền, nhẹ và thoải mái.)

🔄 PARAPHRASE & SUY LUẬN:
• "retaining body heat" ➔ Their warmth (Sự ấm áp) [Được nhắc tới]
• "durable" ➔ Their durability (Độ bền) [Được nhắc tới]
• "light" ➔ Their weight (Trọng lượng nhẹ) [Được nhắc tới]
• Màu sắc ("Their color") hoàn toàn KHÔNG được đề cập trong bài đọc (NOT mentioned) ➔ Chọn phương án (A).

🔍 PHÂN TÍCH 4 PHƯƠNG ÁN:
• (A) Their color: Màu sắc → ĐÚNG (Không được đề cập trong email).
• (B) Their weight: Trọng lượng → Sai (Được nhắc đến qua từ "light" - nhẹ).
• (C) Their durability: Độ bền → Sai (Được nhắc đến qua từ "durable" - bền).
• (D) Their warmth: Sự ấm áp → Sai (Được nhắc đến qua cụm "retaining body heat" - giữ nhiệt).`;

  const res = await db.collection('readingexercises').updateOne(
    { title: 'Level 3 — Trung bình (Part 7)', 'questions.questionNum': 169 },
    { $set: { 'questions.$.explanation': expl } }
  );

  console.log('Updated Level 3 Q169:', res.modifiedCount);
  await mongoose.disconnect();
  process.exit(0);
}

healQ169().catch(console.error);
