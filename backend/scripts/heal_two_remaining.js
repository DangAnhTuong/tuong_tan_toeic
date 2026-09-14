const mongoose = require('mongoose');

async function healP6L5Idx15AndP7L4Idx501() {
  await mongoose.connect('mongodb://127.0.0.1:27017/tuong_tan_toeic');
  const db = mongoose.connection.db;

  // 1. Heal P6 L5 Idx 15
  const p6L5 = await db.collection('readingexercises').findOne({ title: 'Level 5 — Rất khó (Part 6)' });
  const qP6 = p6L5.questions[15];
  qP6.options[0].translation = 'khách hàng, đối tác';
  qP6.options[0].vietnamese = 'khách hàng, đối tác';
  qP6.options[1].translation = 'phóng viên, nhà báo';
  qP6.options[1].vietnamese = 'phóng viên, nhà báo';
  qP6.options[2].translation = 'ứng viên, người dự tuyển';
  qP6.options[2].vietnamese = 'ứng viên, người dự tuyển';
  qP6.options[3].translation = 'giám đốc điều hành, cán bộ quản lý cấp cao';
  qP6.options[3].vietnamese = 'giám đốc điều hành, cán bộ quản lý cấp cao';

  qP6.explanation = `🎯 ĐÁP ÁN ĐÚNG: (B) reporter — phóng viên, nhà báo

💡 DẪN CHỨNG & PHÂN TÍCH TỪ ĐỒNG NGHĨA (PARAPHRASE):
- Dẫn chứng trong bài đọc: "Next Tuesday, a Parham Monthly correspondent will visit Melnyk Corporation in preparation for writing a profile of me for the magazine. In addition to interviewing me, the ______[146] will photograph our work areas..."
- Phân tích ngữ cảnh: Câu trước nhắc đến "a Parham Monthly correspondent" (phóng viên / thông tín viên của tạp chí Parham Monthly). Đến câu sau, danh từ này được nhắc lại bằng từ đồng nghĩa "reporter" (nhà báo, phóng viên) đi cùng mạo từ xác định "the".
- Xét 4 phương án:
  • (A) client: khách hàng, đối tác (Không phù hợp ngữ cảnh người đến phỏng vấn và chụp ảnh).
  • (B) reporter: phóng viên, nhà báo (Đồng nghĩa trực tiếp với "correspondent" ở câu trước).
  • (C) candidate: ứng cử viên, người xin việc (Sai ngữ nghĩa).
  • (D) executive: giám đốc điều hành, cán bộ cấp cao (Sai ngữ nghĩa).

📝 BẢN DỊCH CÂU:
"Ngoài việc phỏng vấn tôi, phóng viên này cũng sẽ chụp ảnh các khu vực làm việc của chúng ta."`;

  await db.collection('readingexercises').updateOne(
    { _id: p6L5._id },
    { $set: { questions: p6L5.questions } }
  );
  console.log('✅ Healed P6 L5 Idx 15!');

  // 2. Heal P7 L4 Idx 501
  const p7L4 = await db.collection('readingexercises').findOne({ title: 'Level 4 — Khó (Part 7)' });
  const qP7 = p7L4.questions[501];
  qP7.options[0].translation = 'nhút nhát, e thẹn';
  qP7.options[0].vietnamese = 'nhút nhát, e thẹn';
  qP7.options[1].translation = 'hiện đại, tân tiến';
  qP7.options[1].vietnamese = 'hiện đại, tân tiến';
  qP7.options[2].translation = 'sáng tạo, có óc sáng tạo';
  qP7.options[2].vietnamese = 'sáng tạo, có óc sáng tạo';
  qP7.options[3].translation = 'nhỏ, khiêm tốn';
  qP7.options[3].vietnamese = 'nhỏ, khiêm tốn';

  qP7.explanation = `🎯 ĐÁP ÁN ĐÚNG: (D) small — nhỏ, khiêm tốn

💡 DẪN CHỨNG & PHÂN TÍCH TỪ ĐỒNG NGHĨA (SYNONYM IN CONTEXT):
- Dẫn chứng trong bài đọc: "Effective 1 June, the cost of a daily pass for nonmembers will be €8. This modest increase will allow us to maintain our facility..."
- Phân tích ngữ cảnh: Trong thông báo về việc tăng giá vé ngày cho người không phải thành viên (từ mức cũ lên 8 Euro), tính từ "modest" đi kèm với "increase" diễn tả mức tăng này là "khiêm tốn / nhỏ" (small), không đáng kể và có thể chấp nhận được.
- Xét các phương án:
  • (A) shy: nhút nhát, e ngại (Dùng cho tính cách con người, không dùng cho mức tăng giá).
  • (B) modern: hiện đại, tân tiến (Không đồng nghĩa với modest).
  • (C) creative: sáng tạo (Không phù hợp ngữ cảnh mức tăng tiền vé).
  • (D) small: nhỏ, khiêm tốn (Chính xác, diễn tả quy mô tăng giá không đáng kể).

📝 BẢN DỊCH DẪN CHỨNG:
"Có hiệu lực từ ngày 1 tháng 6, chi phí vé ngày cho người không phải thành viên sẽ là 8 Euro. Mức tăng khiêm tốn này sẽ cho phép chúng tôi duy trì cơ sở vật chất..."`;

  await db.collection('readingexercises').updateOne(
    { _id: p7L4._id },
    { $set: { questions: p7L4.questions } }
  );
  console.log('✅ Healed P7 L4 Idx 501!');

  await mongoose.disconnect();
}

healP6L5Idx15AndP7L4Idx501().catch(console.error);
