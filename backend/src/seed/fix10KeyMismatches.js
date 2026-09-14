const mongoose = require('mongoose');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/tuong_tan_toeic';

async function fix10() {
  console.log('🚀 Connecting to MongoDB to fix 10 key-mismatched questions...');
  await mongoose.connect(MONGODB_URI);
  const db = mongoose.connection.db;

  // 1. Level 3 Part 7 Q169 (Jerry Sanderson's Ghearey Garden Goods)
  const docP7 = await db.collection('readingexercises').findOne({
    _id: new mongoose.Types.ObjectId('6a8e71dbdc656c12b90ffcf1')
  });

  if (docP7) {
    const q169 = docP7.questions.find(q => q._id.toString() === '6a8e71dbdc656c12b91005c1');
    if (q169) {
      q169.explanation = `🎯 ĐÁP ÁN ĐÚNG: (C) "Instructions for gardeners" (Hướng dẫn dành cho những người làm vườn)

💡 DẪN CHỨNG BÀI ĐỌC:
• Trong đoạn cuối bức thư, Jerry Sanderson thông báo:
"But while the physical Ghearey Garden Goods location is closing, ghearygardengoods.com will remain a resource for home gardeners through our Web site. I will keep adding educational blog posts and articles as I have time."
(Tuy nhiên, trong khi cửa hàng trực tiếp Ghearey Garden Goods đóng cửa, trang web ghearygardengoods.com vẫn sẽ là nguồn tài liệu hữu ích cho những người làm vườn tại nhà. Tôi sẽ tiếp tục bổ sung các bài đăng blog và bài viết mang tính giáo dục, hướng dẫn khi có thời gian.)

🔄 PARAPHRASE & SUY LUẬN:
• Cụm "remain a resource for home gardeners... educational blog posts and articles" được diễn đạt lại (paraphrase) thành "Instructions for gardeners" (Các hướng dẫn, chỉ dẫn kiến thức làm vườn) ➔ Chọn phương án (C).

🔍 PHÂN TÍCH 4 PHƯƠNG ÁN:
• (A) Photographs of a farmhouse: Sai. Tác giả chỉ nhắc việc mình mua nông trại ở vùng quê để ở ("purchased a farmhouse in the country"), không nói đăng ảnh lên web.
• (B) Discount coupons: Sai. Bài viết không hề đề cập đến việc tặng phiếu giảm giá khi cửa hàng đóng cửa.
• (C) Instructions for gardeners: ĐÚNG. Website tiếp tục là nguồn tài liệu hướng dẫn cho người làm vườn qua các bài viết giáo dục ("educational blog posts and articles").
• (D) A list of recommended stores: Sai. Tác giả không đề cập danh sách cửa hàng giới thiệu nào khác.`;

      await db.collection('readingexercises').updateOne(
        { _id: docP7._id },
        { $set: { questions: docP7.questions } }
      );
      console.log('✅ 1. Fixed Level 3 Part 7 Q169 explanation.');
    }
  }

  // 2. Level 4 Part 6 (Southerby Designs & Where to Stay in Devegas)
  const docP6Lv4 = await db.collection('readingexercises').findOne({
    _id: new mongoose.Types.ObjectId('6a8e71c9dc656c12b90fdb78')
  });

  if (docP6Lv4) {
    // A. Where to Stay in Devegas
    const q139Dev = docP6Lv4.questions.find(q => q._id.toString() === '6a8e71c9dc656c12b90fdc91');
    if (q139Dev) {
      q139Dev.explanation = `🎯 ĐÁP ÁN ĐÚNG: (D) "accommodation" (chỗ ở, nơi lưu trú)

💡 PHÂN TÍCH NGỮ NGHĨA & NGỮ CẢNH:
• Câu tiếp theo liền kề đề cập: "More than twenty luxury hotels... found along Devegas Beach, along with several moderately priced hotels... campsites and hostels" (Hơn hai mươi khách sạn sang trọng, các khách sạn tầm trung, khu cắm trại và nhà trọ).
• Tất cả các địa điểm trên đều là các hình thức lưu trú, chỗ nghỉ ngơi của du khách. Do đó, danh từ phù hợp nhất để khái quát là "accommodation options" (các lựa chọn nơi lưu trú).

🔍 PHÂN TÍCH 4 PHƯƠNG ÁN:
• (A) dining: nơi ăn uống (Không bao hàm khách sạn, nhà trọ).
• (B) investment: sự đầu tư (Sai ngữ cảnh du lịch lưu trú).
• (C) entertainment: sự giải trí (Lạc đề).
• (D) accommodation: chỗ ở, nơi lưu trú ➔ CHÍNH XÁC.`;
    }

    const q140Dev = docP6Lv4.questions.find(q => q._id.toString() === '6a8e71c9dc656c12b90fdc96');
    if (q140Dev) {
      q140Dev.explanation = `🎯 ĐÁP ÁN ĐÚNG: (B) "can be" (có thể)

💡 PHÂN TÍCH NGỮ PHÁP & CẤU TRÚC:
• Cấu trúc bị động với động từ khuyết thiếu: Modal verb + be + V-pp (can be found = có thể được tìm thấy / tọa lạc tại).
• Đoạn văn giới thiệu các lựa chọn hiện có ở hiện tại ("features a wide range of options") để quảng bá cho du khách đến bán đảo Devegas, diễn tả khả năng có thể tìm thấy các khách sạn sang trọng dọc bãi biển ➔ Chọn "can be".

🔍 PHÂN TÍCH 4 PHƯƠNG ÁN:
• (A) were: Quá khứ đơn (Sai thì vì bài viết nói về hiện trạng hiện tại).
• (B) can be: can be found (có thể được tìm thấy) ➔ CHÍNH XÁC.
• (C) would be: Diễn tả giả định hoặc quá khứ của will (Sai ngữ cảnh).
• (D) have been: Thì hiện tại hoàn thành thiếu "found" theo ngữ pháp phù hợp ở đây.`;
    }

    const q141Dev = docP6Lv4.questions.find(q => q._id.toString() === '6a8e71c9dc656c12b90fdc9b');
    if (q141Dev) {
      q141Dev.explanation = `🎯 ĐÁP ÁN ĐÚNG: (B) "In addition" (Ngoài ra, thêm vào đó)

💡 PHÂN TÍCH MẠCH VĂN & LIÊN KẾT:
• Câu trước liệt kê: Khách sạn sang trọng (luxury hotels) và khách sạn tầm trung (moderately priced hotels).
• Câu sau bổ sung thêm: Các khu cắm trại giá rẻ và nhà trọ (inexpensive campsites and hostels).
• Để liên kết bổ sung thêm thông tin cùng loại (các lựa chọn lưu trú khác), ta dùng trạng từ liên kết "In addition" (Ngoài ra).

🔍 PHÂN TÍCH 4 PHƯƠNG ÁN:
• (A) After all: Rốt cuộc, sau tất cả (Không phù hợp ý bổ sung).
• (B) In addition: Ngoài ra, thêm vào đó ➔ CHÍNH XÁC.
• (C) Fortunately: May mắn thay (Mang sắc thái cảm xúc không tự nhiên ở đây).
• (D) Nevertheless: Tuy nhiên (Dùng cho ý tương phản, ở đây hai câu cùng chiều bổ sung danh mục lưu trú).`;
    }

    // B. Southerby Designs
    const q139South = docP6Lv4.questions.find(q => q._id.toString() === '6a8e71c9dc656c12b90fdc05');
    if (q139South) {
      q139South.explanation = `🎯 ĐÁP ÁN ĐÚNG: (D) "producing" (tạo ra, sản xuất ra)

💡 PHÂN TÍCH NGỮ PHÁP (MỆNH ĐỀ PHÂN TỪ HIỆN TẠI):
• Câu đã có mệnh đề chính hoàn chỉnh: "Southerby Designs has collaborated with countless stores" (Southerby Designs đã hợp tác với vô số cửa hàng).
• Vế sau đóng vai trò là mệnh đề phân từ hiện tại (present participle clause - V-ing) chỉ kết quả hoặc hành động diễn ra đồng thời: "..., producing beautiful designs for their retail spaces" (..., tạo ra những thiết kế đẹp mắt cho không gian bán lẻ của họ).

🔍 PHÂN TÍCH 4 PHƯƠNG ÁN:
• (A) produced: V-ed (Sai vì mang nghĩa bị động).
• (B) have produced: Động từ chia thì hoàn thành (Thiếu liên từ kết nối hai mệnh đề độc lập).
• (C) was producing: Động từ chia thì quá khứ tiếp diễn (Sai cấu trúc và sai thì).
• (D) producing: Phân từ hiện tại chủ động V-ing ➔ CHÍNH XÁC.`;
    }

    const q140South = docP6Lv4.questions.find(q => q._id.toString() === '6a8e71c9dc656c12b90fdc0a');
    if (q140South) {
      q140South.explanation = `🎯 ĐÁP ÁN ĐÚNG: (A) "even" (thậm chí, ngay cả)

💡 PHÂN TÍCH NGỮ NGHĨA & BỔ TRỢ:
• Câu trước nói Southerby Designs hợp tác với các cửa hàng bán lẻ ("countless stores").
• Câu này mở rộng quy mô năng lực: "We have even worked with several museums and event production companies..." (Chúng tôi thậm chí còn từng hợp tác với nhiều bảo tàng và công ty tổ chức sự kiện...).
• Trạng từ "even" đứng giữa trợ động từ "have" và phân từ "worked" để nhấn mạnh sự bất ngờ hoặc mở rộng thêm phạm vi khách hàng danh giá.

🔍 PHÂN TÍCH 4 PHƯƠNG ÁN:
• (A) even: thậm chí, ngay cả ➔ CHÍNH XÁC.
• (B) instead: thay vào đó (Dùng khi phủ định ý trước, ở đây công ty làm cả hai).
• (C) therefore: do đó (Chỉ kết quả, không hợp nghĩa).
• (D) nevertheless: tuy nhiên (Chỉ tương phản nhượng bộ, không hợp logic).`;
    }

    const q141South = docP6Lv4.questions.find(q => q._id.toString() === '6a8e71c9dc656c12b90fdc0f');
    if (q141South) {
      q141South.explanation = `🎯 ĐÁP ÁN ĐÚNG: (D) "From" (Từ)

💡 PHÂN TÍCH CẤU TRÚC ĐI KÈM "FROM... TO...":
• Nhận diện cấu trúc tương quan kinh điển trong tiếng Anh TOEIC: "From [X] to [Y]" (Từ việc [X] cho đến việc hoàn thành [Y]).
• Trong câu: "From designing retail displays to completing projects for leading cultural institutions..." (Từ việc thiết kế trưng bày bán lẻ cho đến việc hoàn thành các dự án cho các tổ chức văn hóa hàng đầu...).
• Do phía sau có giới từ "to completing projects", từ phù hợp duy nhất ở đầu câu là giới từ "From".

🔍 PHÂN TÍCH 4 PHƯƠNG ÁN:
• (A) By: Bằng cách (Không đi với cấu trúc "to completing" phía sau).
• (B) Over: Qua, trong suốt (Không hợp nghĩa).
• (C) After: Sau khi (Không kết hợp với "to completing").
• (D) From: Cấu trúc From ... to ... ➔ CHÍNH XÁC.`;
    }

    const q142South = docP6Lv4.questions.find(q => q._id.toString() === '6a8e71c9dc656c12b90fdc14');
    if (q142South) {
      // Fix options translations
      q142South.options[0].translation = 'Chúng tôi đã làm việc với một danh mục lớn gồm các nhà thiết kế và nghệ sĩ vào thời điểm đó.';
      q142South.options[0].vietnamese = q142South.options[0].translation;
      q142South.options[1].translation = 'Hãy liên hệ với chúng tôi ngay hôm nay và cho chúng tôi biết những thách thức thiết kế mà bạn đang gặp phải.';
      q142South.options[1].vietnamese = q142South.options[1].translation;
      q142South.options[2].translation = 'Trên thực tế, chúng tôi đã tăng mức giá lần đầu tiên vào năm ngoái.';
      q142South.options[2].vietnamese = q142South.options[2].translation;
      q142South.options[3].translation = 'Ngược lại, hoạt động kinh doanh của chúng tôi đã tăng trưởng đáng kể trong mười năm qua.';
      q142South.options[3].vietnamese = q142South.options[3].translation;

      q142South.explanation = `🎯 ĐÁP ÁN ĐÚNG: (B) "Contact us today and let us know what design challenges you are facing." (Hãy liên hệ với chúng tôi ngay hôm nay và cho chúng tôi biết những thách thức thiết kế mà bạn đang gặp phải.)

💡 PHÂN TÍCH TÍNH LIÊN KẾT ĐOẠN VĂN:
• Đoạn văn đang là lời ngỏ quảng bá dịch vụ thiết kế của Southerby Designs. Câu liền kề phía sau kết luận: "We are confident that we can develop a solution to help you!" (Chúng tôi tự tin rằng chúng tôi có thể phát triển một giải pháp giúp đỡ bạn!).
• Để tạo tiền đề cho lời hứa cung cấp giải pháp, câu trước cần là một lời kêu gọi hành động (Call to Action): Hãy liên hệ ngay hôm nay để chia sẻ vấn đề thiết kế của bạn. Phương án (B) hoàn toàn ăn khớp và liền mạch logic với câu đứng sau.

🔍 PHÂN TÍCH 4 PHƯƠNG ÁN:
• (A) Nói về thời điểm quá khứ xa xôi "at that time" (Lạc mạch văn đang kêu gọi khách hàng hiện tại).
• (B) Lời kêu gọi hành động trực tiếp ăn khớp với câu sau ➔ CHÍNH XÁC.
• (C) Nói về việc tăng giá (Phản cảm trong bài viết chào mời khách hàng).
• (D) So sánh kinh doanh tăng trưởng (Không kết nối tự nhiên với câu giải pháp phía sau).`;
    }

    await db.collection('readingexercises').updateOne(
      { _id: docP6Lv4._id },
      { $set: { questions: docP6Lv4.questions } }
    );
    console.log('✅ 2. Fixed Level 4 Part 6 (Southerby & Devegas) explanations & translations.');
  }

  // 3. Level 1 Part 6 (Berestoff Ltd. job advertisement)
  const docP6Lv1 = await db.collection('readingexercises').findOne({
    _id: new mongoose.Types.ObjectId('6a8e71c8dc656c12b90fcc36')
  });

  if (docP6Lv1) {
    const q131Ber = docP6Lv1.questions.find(q => q._id.toString() === '6a8e71c8dc656c12b90fcf93');
    if (q131Ber) {
      // Fix option D translation: trains -> đào tạo (verb), not xe lửa (noun)
      q131Ber.options[3].translation = 'đào tạo, huấn luyện';
      q131Ber.options[3].vietnamese = 'đào tạo, huấn luyện';

      q131Ber.explanation = `🎯 ĐÁP ÁN ĐÚNG: (A) "seeks" (tìm kiếm, tuyển mộ)

💡 PHÂN TÍCH NGỮ NGHĨA & TIÊU ĐỀ TUYỂN DỤNG:
• Trong các thông báo tuyển dụng việc làm tiếng Anh, cấu trúc chuẩn để thông báo tìm ứng viên là: [Company Name] seeks [Position] (Công ty ... đang tìm kiếm / tuyển dụng vị trí ...).
• "Berestoff Ltd. seeks a professional procurement officer to oversee bidding..." (Công ty Berestoff Ltd. đang tìm kiếm một nhân viên thu mua chuyên nghiệp để giám sát quy trình đấu thầu...).
• Chủ ngữ "Berestoff Ltd." là danh từ số ít nên động từ chia thêm "s" ➔ "seeks".

🔍 PHÂN TÍCH 4 PHƯƠNG ÁN:
• (A) seeks: tìm kiếm (ĐÚNG chuẩn cấu trúc tuyển dụng nhân sự).
• (B) hires: tuyển dụng (Thường dùng cho hành động tuyển dụng thực tế, không dùng làm tiêu đề thông báo tìm ứng viên như seeks).
• (C) offers: cung cấp, đề nghị (Không hợp nghĩa với tân ngữ chỉ người procurement officer).
• (D) trains: đào tạo (Không phù hợp vì công ty đang đăng tuyển người mới, không phải đào tạo).`;
    }

    const q132Ber = docP6Lv1.questions.find(q => q._id.toString() === '6a8e71c8dc656c12b90fcf98');
    if (q132Ber) {
      q132Ber.explanation = `🎯 ĐÁP ÁN ĐÚNG: (D) "and" (và)

💡 PHÂN TÍCH CẤU TRÚC SONG HÀNH (PARALLEL STRUCTURE):
• Quan sát chuỗi động từ liệt kê nhiệm vụ của nhân viên này đứng sau trợ động từ "will":
"This employee will draft advertisements, prepare contract documents, process bids, ---132--- provide training on policy..."
• Ta thấy một chuỗi các động từ nguyên mẫu song song: "draft..., prepare..., process..., [and] provide...".
• Khi liệt kê chuỗi hành động cùng loại, phần tử cuối cùng trong câu bắt buộc phải được nối bằng liên từ kết hợp "and" (và).

🔍 PHÂN TÍCH 4 PHƯƠNG ÁN:
• (A) so: vì vậy (Chỉ kết quả, không dùng nối chuỗi động từ song hành).
• (B) while: trong khi (Chỉ thời gian hoặc tương phản, cần một mệnh đề hoàn chỉnh).
• (C) nor: cũng không (Đi sau thể phủ định, ở đây câu là khẳng định).
• (D) and: và ➔ CHÍNH XÁC.`;
    }

    await db.collection('readingexercises').updateOne(
      { _id: docP6Lv1._id },
      { $set: { questions: docP6Lv1.questions } }
    );
    console.log('✅ 3. Fixed Level 1 Part 6 (Berestoff Ltd) Q131 & Q132.');
  }

  console.log('\n🎉 ALL 10 DISCREPANCIES HAVE BEEN SUCCESSFULLY HEALED!');
  await mongoose.disconnect();
}

fix10().catch(console.error);
