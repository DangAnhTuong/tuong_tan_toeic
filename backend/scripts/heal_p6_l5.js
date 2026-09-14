const mongoose = require('mongoose');

async function healP6L5() {
  await mongoose.connect('mongodb://127.0.0.1:27017/tuong_tan_toeic');
  const db = mongoose.connection.db;

  const doc = await db.collection('readingexercises').findOne({ title: 'Level 5 — Rất khó (Part 6)' });
  if (!doc) {
    console.error('Doc not found');
    process.exit(1);
  }

  // 1. Question index 68 (qNum: 143)
  const q143 = doc.questions[68];
  console.log('Updating Q143...');
  q143.options[0].translation = 'dần dần, từng bước';
  q143.options[0].vietnamese = 'dần dần, từng bước';
  q143.options[1].translation = 'hấp dẫn, có sức thuyết phục, lôi cuốn';
  q143.options[1].vietnamese = 'hấp dẫn, có sức thuyết phục, lôi cuốn';
  q143.options[2].translation = 'lặp đi lặp lại';
  q143.options[2].vietnamese = 'lặp đi lặp lại';
  q143.options[3].translation = 'đáng ngờ, không chắc chắn';
  q143.options[3].vietnamese = 'đáng ngờ, không chắc chắn';

  q143.explanation = `🎯 ĐÁP ÁN ĐÚNG: (B) compelling — hấp dẫn, có sức thuyết phục, lôi cuốn

💡 DẪN CHỨNG & PHÂN TÍCH NGỮ PHÁP / NGỮ NGHĨA:
- Dẫn chứng trong bài đọc: "Unfortunately, consumers found our ad campaign less ______[143] than we expected. Additionally, the design did not stand out against its competitors."
- Phân tích cấu trúc: Cấu trúc "find + O + adj" (nhận thấy điều gì như thế nào). Sau "less" cần một tính từ miêu tả đặc điểm của chiến dịch quảng cáo ("our ad campaign").
- Xét ngữ nghĩa: Đoạn văn giải thích lý do ngừng sản xuất dòng túi xách Luxe-7 là do doanh số đáng thất vọng: người tiêu dùng nhận thấy chiến dịch quảng cáo "kém hấp dẫn / kém thuyết phục hơn" (less compelling) so với kỳ vọng, và thiết kế không nổi bật trước các đối thủ cạnh tranh.

📚 DỊCH NGHĨA 4 PHƯƠNG ÁN:
• (A) gradual: dần dần, từng bước (Không phù hợp khi miêu tả tính chất thu hút của chiến dịch quảng cáo)
• (B) compelling: hấp dẫn, lôi cuốn, thuyết phục (Chính xác tuyệt đối theo ngữ cảnh bài đọc)
• (C) repetitive: lặp đi lặp lại (Sai ngữ nghĩa)
• (D) doubtful: đáng ngờ, nghi ngờ (Sai ngữ nghĩa)

📝 DỊCH CÂU:
"Thật không may, người tiêu dùng cảm thấy chiến dịch quảng cáo của chúng tôi kém hấp dẫn hơn so với kỳ vọng."`;

  // 2. Question index 69 (qNum: 144)
  const q144 = doc.questions[69];
  console.log('Updating Q144...');
  q144.options[0].translation = 'việc xác định cụ thể / đang chỉ định';
  q144.options[0].vietnamese = 'việc xác định cụ thể / đang chỉ định';
  q144.options[1].translation = 'thông số kỹ thuật, đặc tính (số ít)';
  q144.options[1].vietnamese = 'thông số kỹ thuật, đặc tính (số ít)';
  q144.options[2].translation = 'các thông số kỹ thuật, yêu cầu kỹ thuật chi tiết (số nhiều)';
  q144.options[2].vietnamese = 'các thông số kỹ thuật, yêu cầu kỹ thuật chi tiết (số nhiều)';
  q144.options[3].translation = 'chỉ định rõ, nêu cụ thể (động từ)';
  q144.options[3].vietnamese = 'chỉ định rõ, nêu cụ thể (động từ)';

  q144.explanation = `🎯 ĐÁP ÁN ĐÚNG: (C) specifications — các thông số kỹ thuật, tiêu chuẩn thiết kế

💡 DẪN CHỨNG & PHÂN TÍCH TỪ LOẠI (WORD FORM):
- Dẫn chứng trong bài đọc: "Moving forward, the design team will be given several ______[144] outlined by our research team to help them create prototypes of new bags."
- Phân tích cấu trúc: Chỗ trống đứng sau lượng từ "several" (một vài, một số), do đó bắt buộc phải là một DANH TỪ ĐẾM ĐƯỢC SỐ NHIỀU (plural countable noun).
- Xét các phương án:
  • (A) specifying: danh động từ / hiện tại phân từ (V-ing), không kết hợp với lượng từ "several".
  • (B) specification: danh từ đếm được nhưng ở dạng số ít (cần mạo từ a/an, không đi sau "several").
  • (C) specifications: danh từ đếm được số nhiều đuôi -s (phù hợp tuyệt đối sau "several").
  • (D) specifies: động từ ngôi thứ ba số ít (không phù hợp vị trí sau lượng từ "several").

📚 BẢN DỊCH HOÀN CHỈNH:
"Trong thời gian tới, đội ngũ thiết kế sẽ nhận được một số thông số kỹ thuật do nhóm nghiên cứu vạch ra để giúp họ tạo các mẫu thử nghiệm cho những mẫu túi mới."`;

  // 3. Question index 70 (qNum: 145)
  const q145 = doc.questions[70];
  console.log('Updating Q145...');
  q145.explanation = `🎯 ĐÁP ÁN ĐÚNG: (C) "Following that, we will gather feedback from potential customers." — Sau đó, chúng tôi sẽ thu thập phản hồi từ khách hàng tiềm năng.

💡 DẪN CHỨNG & PHÂN TÍCH MẠCH VĂN:
- Câu đứng trước: "Moving forward, the design team will be given several specifications outlined by our research team to help them create prototypes of new bags." (Đội thiết kế sẽ tạo mẫu túi thử nghiệm mới dựa trên thông số kỹ thuật).
- Câu đứng sau: "We believe the additional work that is being requested will be difficult yet beneficial." (Chúng tôi tin khối lượng công việc bổ sung này sẽ khó khăn nhưng hữu ích).
- Phân tích liên kết logic: Cụm từ "Following that" (Sau bước đó) liên kết chặt chẽ tiến trình làm việc: sau khi tạo mẫu thử nghiệm (prototypes) thì bước tiếp theo hợp lý nhất là thu thập phản hồi từ khách hàng tiềm năng trước khi sản xuất hàng loạt.

📚 DỊCH NGHĨA 4 PHƯƠNG ÁN:
• (A) However, less expensive materials are available: Tuy nhiên, có sẵn những vật liệu rẻ tiền hơn (Không phù hợp tiến trình thử nghiệm sản phẩm mới).
• (B) The commercial features examples of modern employees: Quảng cáo truyền hình có các ví dụ về nhân viên hiện đại (Lạc đề).
• (C) Following that, we will gather feedback from potential customers: Sau đó, chúng tôi sẽ thu thập phản hồi từ khách hàng tiềm năng (Chính xác, tiếp nối mạch tạo mẫu thử nghiệm).
• (D) Your efforts helped to truly make a difference: Những nỗ lực của các bạn đã giúp tạo nên sự khác biệt thực sự (Không kết nối với câu sau).`;

  // 4. Question index 71 (qNum: 146)
  const q146 = doc.questions[71];
  console.log('Updating Q146...');
  q146.options[2].translation = 'nhưng, tuy nhiên (liên từ nối tương phản)';
  q146.options[2].vietnamese = 'nhưng, tuy nhiên (liên từ nối tương phản)';
  q146.explanation = `🎯 ĐÁP ÁN ĐÚNG: (C) yet — nhưng, tuy nhiên

💡 DẪN CHỨNG & PHÂN TÍCH NGỮ PHÁP:
- Dẫn chứng trong bài đọc: "We believe the additional work that is being requested will be difficult ______[146] beneficial."
- Phân tích cấu trúc: Chỗ trống đứng giữa hai tính từ "difficult" (khó khăn) và "beneficial" (có lợi/hữu ích) cùng làm bổ ngữ cho danh từ "the additional work".
- Vì hai tính từ mang sắc thái ý nghĩa đối lập/tương phản nhau (khó khăn nhưng lại đem lại lợi ích lớn), ta cần liên từ đẳng lập mang nghĩa tương phản "yet" (tương đương với "but").

📚 PHÂN TÍCH 4 PHƯƠNG ÁN:
• (A) for: liên từ chỉ nguyên nhân (mang nghĩa "vì", phải nối hai mệnh đề độc lập S+V, không dùng nối 2 tính từ đơn lẻ).
• (B) as: liên từ phụ thuộc (khi, vì), yêu cầu một mệnh đề hoàn chỉnh S+V theo sau.
• (C) yet: liên từ đẳng lập chỉ sự tương phản ("nhưng"), kết hợp hoàn hảo cấu trúc "difficult yet beneficial" (khó khăn nhưng hữu ích).
• (D) if: liên từ điều kiện ("nếu"), không dùng để nối hai tính từ đối lập trong ngữ cảnh này.`;

  await db.collection('readingexercises').updateOne(
    { _id: doc._id },
    { $set: { questions: doc.questions } }
  );

  console.log('✅ Successfully updated Level 5 Part 6 Q143-146 in MongoDB!');
  await mongoose.disconnect();
}

healP6L5().catch(console.error);
