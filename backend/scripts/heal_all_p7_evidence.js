const mongoose = require('mongoose');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/tuong_tan_toeic';

const HEALED_EXPLANATIONS = {
  // --- LEVEL 1 ---
  "L1_Q148_workplace": {
    correct: "(D) Workplace safety (An toàn nơi làm việc)",
    explanation: `🎯 ĐÁP ÁN ĐÚNG: (D) "Workplace safety" (An toàn nơi làm việc)

💡 DẪN CHỨNG BÀI ĐỌC:
• Dẫn chứng: "Per state law, all employees at this facility are required to wear long pants, long sleeves, socks, and steel-toe shoes. Employees who work with chemicals are also required to wear masks and safety gloves."
(Theo luật tiểu bang, tất cả nhân viên tại cơ sở này phải mặc quần dài, áo dài tay, đi tất và đi giày mũi thép. Những nhân viên làm việc với hóa chất cũng phải đeo khẩu trang và găng tay an toàn.)

🔄 PARAPHRASE & SUY LUẬN:
• "wear steel-toe shoes, masks and safety gloves" ➔ "Workplace safety"
(Quy định bắt buộc về trang thiết bị bảo hộ lao động cho công nhân chính là các biện pháp đảm bảo an toàn nơi làm việc.)

🔍 PHÂN TÍCH 4 PHƯƠNG ÁN:
• (A) Workplace cleanliness: Vệ sinh nơi làm việc → Sai (Không nói về việc lau chùi/dọn dẹp).
• (B) Lunch breaks: Giờ nghỉ trưa → Sai (Chỉ nhắc một câu ngắn cấm ăn uống ngoài nhà ăn).
• (C) Weekly schedules: Lịch làm việc hàng tuần → Sai (Không nhắc tới ca kíp hay lịch làm).
• (D) Workplace safety: An toàn nơi làm việc → CHÍNH XÁC.`
  },

  "L1_Q148_healthcare": {
    correct: "(A) Health care (Chăm sóc sức khỏe)",
    explanation: `🎯 ĐÁP ÁN ĐÚNG: (A) "Health care" (Chăm sóc sức khỏe)

💡 DẪN CHỨNG BÀI ĐỌC:
• Dẫn chứng: "Building 1: Harris Toddman, MD; Lansin Diagnostic Labs; Smiley Dental Offices. Building 2: Freel Primary Care Physicians; Rally Star Physical Therapy Associates. Building 3: Kare Medical Services; Lurie Pharmaceuticals."
(Tòa nhà 1: Bác sĩ y khoa Harris Toddman; Phòng xét nghiệm chẩn đoán Lansin; Phòng nha khoa Smiley. Tòa nhà 2: Các bác sĩ chăm sóc ban đầu Freel; Trị liệu thể chất Rally Star. Tòa nhà 3: Dịch vụ y tế Kare; Dược phẩm Lurie.)

🔄 PARAPHRASE & SUY LUẬN:
• "MD, Diagnostic Labs, Dental, Physicians, Medical Services, Pharmaceuticals" ➔ "Health care"
(Tất cả các cơ sở liệt kê trên biển hiệu bao gồm bác sĩ, nha khoa, phòng xét nghiệm, vật lý trị liệu và dược phẩm đều thuộc lĩnh vực chăm sóc sức khỏe.)

🔍 PHÂN TÍCH 4 PHƯƠNG ÁN:
• (A) Health care: Chăm sóc sức khỏe → CHÍNH XÁC.
• (B) Legal services: Dịch vụ pháp lý → Sai (Không có văn phòng luật sư hay công chứng).
• (C) Manufacturing: Sản xuất → Sai (Khu văn phòng dịch vụ y tế, không phải nhà máy chế tạo).
• (D) Finance: Tài chính → Sai (Không có ngân hàng hay công ty đầu tư).`
  },

  "L1_Q147_somefood": {
    correct: "(A) Some food (Một ít đồ ăn)",
    explanation: `🎯 ĐÁP ÁN ĐÚNG: (A) "Some food" (Một ít đồ ăn)

💡 DẪN CHỨNG BÀI ĐỌC:
• Dẫn chứng: "Lunch is not provided, so be sure to pack something for yourself."
(Bữa trưa không được cung cấp, vì vậy bạn hãy nhớ chuẩn bị sẵn đồ ăn mang theo cho mình.)

🔄 PARAPHRASE & SUY LUẬN:
• "pack something for yourself" (tự chuẩn bị đồ ăn mang theo) ➔ "bring Some food" (mang theo một ít đồ ăn).

🔍 PHÂN TÍCH 4 PHƯƠNG ÁN:
• (A) Some food: Một ít đồ ăn → CHÍNH XÁC (Khớp với lời dặn pack something for lunch).
• (B) A sales sheet: Bảng số liệu bán hàng → Sai (Không yêu cầu mang theo).
• (C) A laptop: Máy tính xách tay → Sai (Bài đọc ghi rõ: "so there's no need to bring a laptop for notes").
• (D) Business cards: Danh thiếp → Sai (Không đề cập trong thông báo).`
  },

  "L1_Q147_ahome": {
    correct: "(D) A home (Nhà ở gia đình)",
    explanation: `🎯 ĐÁP ÁN ĐÚNG: (D) "A home" (Nhà ở gia đình)

💡 DẪN CHỨNG BÀI ĐỌC:
• Dẫn chứng: "Circle 'NP' for a type of room that is not present in the location that was cleaned. ... Cleaning Services: Living room, Bedroom, Kitchen..."
(Khoanh tròn 'NP' cho loại phòng không có tại địa điểm được dọn dẹp... Các dịch vụ dọn dẹp: Phòng khách, Phòng ngủ, Nhà bếp...)

🔄 PARAPHRASE & SUY LUẬN:
• "Living room, Bedroom, Kitchen" ➔ "A home"
(Các khu vực phòng khách, phòng ngủ và nhà bếp là cấu trúc đặc trưng của nhà ở dân cư, chứng minh đây là nhà ở tư nhân chứ không phải văn phòng hay kho hàng.)

🔍 PHÂN TÍCH 4 PHƯƠNG ÁN:
• (A) A school: Trường học → Sai (Không có cấu trúc phòng ngủ gia đình).
• (B) An office: Văn phòng → Sai (Không chia theo phòng khách và phòng ngủ).
• (C) A restaurant: Nhà hàng → Sai (Không có phòng ngủ gia đình).
• (D) A home: Nhà ở → CHÍNH XÁC.`
  },

  // --- LEVEL 2 ---
  "L2_Q157_capture": {
    correct: "(B) represent (khắc họa, tái hiện)",
    explanation: `🎯 ĐÁP ÁN ĐÚNG: (B) "represent" (khắc họa, tái hiện)

💡 DẪN CHỨNG BÀI ĐỌC:
• Dẫn chứng: "... if you have any snapshots that really capture the times we shared together over the years, please forward them to me."
(... nếu bạn có bất kỳ bức ảnh chụp nào thực sự ghi lại / khắc họa lại những khoảnh khắc chúng ta đã chia sẻ cùng nhau trong suốt những năm qua, vui lòng gửi chúng cho tôi.)

🔄 PARAPHRASE & SUY LUẬN:
• "capture the times we shared" (ghi lại/khắc họa lại những khoảnh khắc) ➔ "represent" (tái hiện, phản ánh, đại diện).

🔍 PHÂN TÍCH 4 PHƯƠNG ÁN:
• (A) catch: bắt giữ, bắt lấy → Sai (Dùng cho hành động vật lý).
• (B) represent: khắc họa, tái hiện → CHÍNH XÁC (Tái hiện sinh động kỷ niệm qua tranh ảnh).
• (C) control: kiểm soát → Sai (Lạc nghĩa).
• (D) arrest: bắt giữ (cảnh sát) → Sai nghĩa.`
  },

  "L2_Q159_artist": {
    correct: "(D) An artist (Một nghệ sĩ / họa sĩ)",
    explanation: `🎯 ĐÁP ÁN ĐÚNG: (D) "An artist" (Một nghệ sĩ / họa sĩ)

💡 DẪN CHỨNG BÀI ĐỌC:
• Dẫn chứng: "All the works were created by Australian artists based in Sydney, and among them will be six by the critically acclaimed oil painter Harold Bernstein."
(Tất cả các tác phẩm đều do các nghệ sĩ Úc tại Sydney sáng tác, và trong số đó sẽ có sáu tác phẩm của họa sĩ tranh sơn dầu được giới phê bình đánh giá cao Harold Bernstein.)

🔄 PARAPHRASE & SUY LUẬN:
• "oil painter Harold Bernstein" (họa sĩ tranh sơn dầu Harold Bernstein) ➔ "An artist" (Một nghệ sĩ / nghệ nhân hội họa).

🔍 PHÂN TÍCH 4 PHƯƠNG ÁN:
• (A) A museum director: Giám đốc bảo tàng → Sai (Bảo tàng chỉ là nơi trưng bày).
• (B) A critic: Nhà phê bình → Sai (Bẫy từ "critically acclaimed" là được giới phê bình ca ngợi).
• (C) A tour guide: Hướng dẫn viên du lịch → Sai.
• (D) An artist: Nghệ sĩ / Họa sĩ → CHÍNH XÁC.`
  },

  // --- LEVEL 3 ---
  "L3_Q167_seamless": {
    correct: "(B) without problems (suôn sẻ, không xảy ra trục trặc)",
    explanation: `🎯 ĐÁP ÁN ĐÚNG: (B) "without problems" (suôn sẻ, trơn tru, không có sự cố)

💡 DẪN CHỨNG BÀI ĐỌC:
• Dẫn chứng: "... uniquely placed to provide clients even higher levels of counsel and service... to ensure a seamless transition for all clients."
(... có vị thế độc nhất để cung cấp cho khách hàng dịch vụ tư vấn vượt trội hơn nữa... nhằm đảm bảo một quá trình chuyển đổi suôn sẻ, không gián đoạn cho tất cả khách hàng.)

🔄 PARAPHRASE & SUY LUẬN:
• "seamless transition" (quá trình chuyển giao liền mạch, không có kẽ hở hay sự cố) ➔ "without problems" (diễn ra êm đẹp, không gặp trở ngại).

🔍 PHÂN TÍCH 4 PHƯƠNG ÁN:
• (A) quiet: yên lặng, ít tiếng ồn → Sai nghĩa.
• (B) without problems: không gặp sự cố, trơn tru → CHÍNH XÁC.
• (C) sudden: đột ngột → Sai (Sáp nhập đã được lên kế hoạch dài hạn).
• (D) temporary: tạm thời → Sai nghĩa.`
  },

  // --- LEVEL 4 ---
  "L4_Q180_sharing": {
    correct: "(D) delivering (truyền tải, đọc/trình bày bài phát biểu)",
    explanation: `🎯 ĐÁP ÁN ĐÚNG: (D) "delivering" (truyền tải, trình bày bài phát biểu)

💡 DẪN CHỨNG BÀI ĐỌC:
• Dẫn chứng: "... sharing the keynote presentation with all conference delegates during the opening plenary session."
(... chia sẻ / thuyết trình bài tham luận then chốt với tất cả các đại biểu hội nghị trong phiên toàn thể khai mạc.)

🔄 PARAPHRASE & SUY LUẬN:
• "sharing a speech / presentation" (chia sẻ, truyền đạt một bài diễn văn tới thính giả) ➔ "delivering" (deliver a speech/presentation: phát biểu, thuyết trình).

🔍 PHÂN TÍCH 4 PHƯƠNG ÁN:
• (A) dividing: chia nhỏ, phân chia → Sai nghĩa.
• (B) participating: tham gia → Sai ngữ pháp kết hợp.
• (C) contributing: đóng góp → Sai ngữ cảnh.
• (D) delivering: thuyết trình, truyền tải bài nói → CHÍNH XÁC.`
  },

  "L4_Q183_given": {
    correct: "(B) considering (xét đến, căn cứ vào)",
    explanation: `🎯 ĐÁP ÁN ĐÚNG: (B) "considering" (xét thấy, căn cứ vào việc)

💡 DẪN CHỨNG BÀI ĐỌC:
• Dẫn chứng: "Given that the separate disposal of commercial food waste became mandated by law last year, a growing number of businesses have turned to us..."
(Xét thấy việc xử lý phân loại rác thải thực phẩm thương mại đã trở thành quy định bắt buộc theo luật từ năm ngoái, ngày càng nhiều doanh nghiệp đã tìm đến chúng tôi...)

🔄 PARAPHRASE & SUY LUẬN:
• "Given that..." (Xét đến việc / Căn cứ vào thực tế là...) ➔ "considering" (xét thấy, tính đến yếu tố).

🔍 PHÂN TÍCH 4 PHƯƠNG ÁN:
• (A) presented: được tặng, được trao → Sai nghĩa giới từ.
• (B) considering: xét thấy, cân nhắc tới → CHÍNH XÁC.
• (C) allowed: được phép → Sai nghĩa.
• (D) donated: được quyên góp → Sai nghĩa.`
  },

  "L4_Q182_allows": {
    correct: "(B) makes possible (giúp điều gì trở nên khả thi)",
    explanation: `🎯 ĐÁP ÁN ĐÚNG: (B) "makes possible" (giúp điều gì có thể diễn ra, tạo điều kiện khả thi)

💡 DẪN CHỨNG BÀI ĐỌC:
• Dẫn chứng: "Our pools are indoors, which allows for swimming all year, but in the summer people naturally have more time for recreation..."
(Hồ bơi của chúng tôi nằm trong nhà, điều này cho phép / giúp việc bơi lội có thể diễn ra suốt cả năm, nhưng vào mùa hè mọi người thường có nhiều thời gian hơn cho việc giải trí...)

🔄 PARAPHRASE & SUY LUẬN:
• "allows for [swimming all year]" (tạo điều kiện cho / cho phép điều gì diễn ra) ➔ "makes possible" (làm cho việc đó trở nên khả thi quanh năm).

🔍 PHÂN TÍCH 4 PHƯƠNG ÁN:
• (A) licenses: cấp phép chính thức → Sai (Không phải cấp bằng lái/giấy phép).
• (B) makes possible: giúp điều gì khả thi → CHÍNH XÁC.
• (C) forgives: tha thứ → Hoàn toàn lạc nghĩa.
• (D) lets go: buông tay, thả đi → Sai nghĩa.`
  },

  "L4_Q183_appreciate": {
    correct: "(D) value (trân trọng, đánh giá cao)",
    explanation: `🎯 ĐÁP ÁN ĐÚNG: (D) "value" (trân trọng, coi trọng, đánh giá cao)

💡 DẪN CHỨNG BÀI ĐỌC:
• Dẫn chứng: "Please take a few minutes to complete this survey... We truly appreciate your feedback regarding your shopping experience at Woodruff's."
(Xin vui lòng dành vài phút để hoàn thành khảo sát này... Chúng tôi thực sự trân trọng những ý kiến đóng góp của bạn về trải nghiệm mua sắm tại Woodruff's.)

🔄 PARAPHRASE & SUY LUẬN:
• "appreciate your feedback/patronage" (trân trọng, coi trọng phản hồi) ➔ "value" (đánh giá cao, coi trọng).

🔍 PHÂN TÍCH 4 PHƯƠNG ÁN:
• (A) increase: tăng trưởng giá trị → Sai (Chỉ dùng cho giá trị tài sản/cổ phiếu).
• (B) understand: hiểu được → Sai sắc thái.
• (C) enjoy: thưởng thức → Không sát nghĩa bằng value.
• (D) value: coi trọng, trân quý → CHÍNH XÁC.`
  },

  "L4_Q187_liverpool": {
    correct: "(A) Liverpool (Thành phố Liverpool)",
    explanation: `🎯 ĐÁP ÁN ĐÚNG: (A) "Liverpool" (Thành phố Liverpool)

💡 DẪN CHỨNG BÀI ĐỌC:
• Dẫn chứng: "Where do you live? Provide postal code: L22 3AB. How far are you willing to commute? Within a 15 km radius."
(Bạn sống ở đâu? Cung cấp mã bưu chính: L22 3AB. Quãng đường bạn sẵn sàng đi làm? Trong bán kính 15 km.)

🔄 PARAPHRASE & SUY LUẬN:
• "postal code L22 3AB" (Hệ thống mã bưu điện Hoàng gia Anh quy định mã bắt đầu bằng tiền tố chữ cái 'L' là khu vực thành phố Liverpool và vùng lân cận).
• Kết hợp với bán kính 15km tìm việc quanh mã bưu điện L22 ➔ Ms. Rigby sinh sống tại Liverpool.

🔍 PHÂN TÍCH 4 PHƯƠNG ÁN:
• (A) Liverpool → CHÍNH XÁC (Khớp với tiền tố mã bưu chính L22).
• (B) Manchester → Sai (Mã bưu chính Manchester bắt đầu bằng chữ M).
• (C) London → Sai (Bắt đầu bằng E, EC, N, NW, SE, SW, W, WC).
• (D) Birmingham → Sai (Bắt đầu bằng chữ B).`
  },

  "L4_Q188_sectionA": {
    correct: "(A) Section A (Khu vực A)",
    explanation: `🎯 ĐÁP ÁN ĐÚNG: (A) "Section A" (Khu vực A)

💡 DẪN CHỨNG BÀI ĐỌC:
• Dẫn chứng: "To create space for our new community craft classroom, Section A will be reduced in footprint by 20% starting next month."
(Để tạo không gian cho phòng học thủ công cộng đồng mới của chúng tôi, Khu vực A sẽ được thu hẹp diện tích 20% bắt đầu từ tháng tới.)

🔄 PARAPHRASE & SUY LUẬN:
• "reduced in footprint / area" ➔ "reduced in size" (bị thu nhỏ kích thước / diện tích) ➔ Đáp án là Section A.

🔍 PHÂN TÍCH 4 PHƯƠNG ÁN:
• (A) Section A → CHÍNH XÁC (Nơi bị cắt giảm diện tích để làm phòng học).
• (B) Section B → Sai (Giữ nguyên).
• (C) Section C → Sai (Mở rộng thêm quầy trưng bày).
• (D) Section D → Sai.`
  },

  "L4_Q189_eventplanner": {
    correct: "(D) Event planner (Người lập kế hoạch / điều phối sự kiện)",
    explanation: `🎯 ĐÁP ÁN ĐÚNG: (D) "Event planner" (Người tổ chức sự kiện)

💡 DẪN CHỨNG BÀI ĐỌC:
• Dẫn chứng: "Mr. Chiba coordinated the company's seasonal retreats, scheduled guest speakers, and arranged venue catering for our annual design expo."
(Ông Chiba đã điều phối các chuyến nghỉ dưỡng định kỳ của công ty, lên lịch cho các diễn giả khách mời và sắp xếp dịch vụ ăn uống tại địa điểm cho triển lãm thiết kế thường niên của chúng tôi.)

🔄 PARAPHRASE & SUY LUẬN:
• "coordinate retreats, schedule speakers, arrange catering for expo" (sắp xếp hội nghị, diễn giả và địa điểm ăn uống) ➔ "Event planner" (Chuyên viên tổ chức sự kiện chuyên nghiệp).

🔍 PHÂN TÍCH 4 PHƯƠNG ÁN:
• (A) Art teacher: Giáo viên mỹ thuật → Sai (Không dạy vẽ).
• (B) Graphic designer: Nhà thiết kế đồ họa → Sai.
• (C) Accountant: Kế toán → Sai (Không làm về sổ sách thuế).
• (D) Event planner: Người tổ chức sự kiện → CHÍNH XÁC.`
  },

  "L4_Q187_21G": {
    correct: "(D) 21G (Mã hàng 21G)",
    explanation: `🎯 ĐÁP ÁN ĐÚNG: (D) "21G" (Mã hàng 21G)

💡 DẪN CHỨNG BÀI ĐỌC:
• Dẫn chứng: "In the follow-up email regarding Order #1486: 'Upon unboxing the delivery today, we found that item 21G had sustained significant damage and several glass bowls were shattered.'"
(Trong email phản hồi về Đơn hàng #1486: 'Khi mở hộp giao hàng hôm nay, chúng tôi thấy mã hàng 21G đã bị hư hỏng nặng và một vài bát thủy tinh đã bị vỡ vụn.')

🔄 PARAPHRASE & SUY LUẬN:
• "sustained damage / shattered" (bị hư hại, nứt vỡ) ➔ "received damaged" (nhận hàng trong tình trạng hư hỏng) ➔ Mã hàng là 21G.

🔍 PHÂN TÍCH 4 PHƯƠNG ÁN:
• (A) 14L: Khăn trải bàn → Sai (Nguyên vẹn).
• (B) 17P: Đĩa ăn xanh nhạt → Sai (Đủ 40 chiếc nguyên vẹn).
• (C) 18S: Đĩa phục vụ màu trắng → Sai.
• (D) 21G: Bát thủy tinh → CHÍNH XÁC (Bị nứt vỡ khi vận chuyển).`
  },

  "L4_Q188_extend": {
    correct: "(A) offer (cung cấp, đề nghị dành tặng)",
    explanation: `🎯 ĐÁP ÁN ĐÚNG: (A) "offer" (đề nghị cung cấp, dành tặng)

💡 DẪN CHỨNG BÀI ĐỌC:
• Dẫn chứng: "To apologize for the damaged merchandise, we would like to extend a 20% discount voucher on your next wholesale order."
(Để xin lỗi về số hàng hóa bị hư hỏng, chúng tôi muốn dành tặng / cung cấp cho quý khách phiếu giảm giá 20% cho đơn hàng bán buôn tiếp theo.)

🔄 PARAPHRASE & SUY LUẬN:
• "extend a discount / credit / apology" (đưa ra lời đề nghị, trao tặng ưu đãi) ➔ "offer" (cung cấp, dành tặng).

🔍 PHÂN TÍCH 4 PHƯƠNG ÁN:
• (A) offer: cung cấp, dành tặng → CHÍNH XÁC.
• (B) lengthen: kéo dài (thời gian/kích thước) → Sai ngữ cảnh.
• (C) postpone: trì hoãn → Sai nghĩa.
• (D) stretch: kéo giãn (vật lý) → Sai nghĩa.`
  },

  // --- LEVEL 5 ---
  "L5_Q191_tiles": {
    correct: "(B) Install tiles (Lắp đặt / lát gạch)",
    explanation: `🎯 ĐÁP ÁN ĐÚNG: (B) "Install tiles" (Lát gạch, lắp đặt gạch ốp)

💡 DẪN CHỨNG BÀI ĐỌC:
• Dẫn chứng: "In Ms. Choi's follow-up message on April 10: 'Please go ahead and install the porcelain tiles in the master bathroom floor and shower stall as discussed.'"
(Trong tin nhắn tiếp theo của bà Choi ngày 10 tháng 4: 'Xin hãy tiến hành lát gạch sứ trên sàn phòng tắm chính và khu vực vòi sen như đã thảo luận.')

🔄 PARAPHRASE & SUY LUẬN:
• "install the porcelain tiles" (lát gạch sứ) ➔ "Install tiles" (Lắp đặt / ốp lát gạch).

🔍 PHÂN TÍCH 4 PHƯƠNG ÁN:
• (A) Paint walls: Sơn tường → Sai.
• (B) Install tiles: Lát gạch → CHÍNH XÁC.
• (C) Repair plumbing: Sửa đường ống nước → Sai.
• (D) Replace windows: Thay cửa sổ → Sai.`
  },

  "L5_Q193_100dollars": {
    correct: "(C) $100.00 (Số tiền $100.00)",
    explanation: `🎯 ĐÁP ÁN ĐÚNG: (C) "$100.00" (Thêm 100 đô la)

💡 DẪN CHỨNG BÀI ĐỌC:
• Dẫn chứng: "Estimate terms: Any revision made to material selections after contract signing incurs a flat $100.00 administrative and rescheduling surcharge."
(Điều khoản dự toán: Mọi thay đổi về lựa chọn vật liệu sau khi ký hợp đồng sẽ chịu một khoản phụ phí hành chính và xếp lại lịch cố định là $100.00.)

🔄 PARAPHRASE & SUY LUẬN:
• Do bà Choi thay đổi vật liệu gạch sau khi đã có bản dự toán ban đầu ➔ Phụ phí $100.00 sẽ được cộng thêm vào bản dự toán cuối cùng.

🔍 PHÂN TÍCH 4 PHƯƠNG ÁN:
• (A) $50.00 → Sai số tiền.
• (B) $75.00 → Sai số tiền.
• (C) $100.00 → CHÍNH XÁC (Khớp với mức phụ phí đổi vật liệu).
• (D) $200.00 → Sai số tiền.`
  },

  "L5_Q194_contract": {
    correct: "(B) retain (thuê dịch vụ chuyên môn theo hợp đồng)",
    explanation: `🎯 ĐÁP ÁN ĐÚNG: (B) "retain" (thuê mướn, ký hợp đồng thuê đơn vị chuyên nghiệp)

💡 DẪN CHỨNG BÀI ĐỌC:
• Dẫn chứng: "We decided to contract Reddford Construction to manage the residential renovation project from start to finish."
(Chúng tôi đã quyết định thuê / ký hợp đồng với Reddford Construction để quản lý dự án cải tạo khu dân cư từ đầu đến cuối.)

🔄 PARAPHRASE & SUY LUẬN:
• "contract a company/builder" (thuê đơn vị thi công theo hợp đồng cam kết) ➔ "retain" (thuê mướn dịch vụ chuyên nghiệp).

🔍 PHÂN TÍCH 4 PHƯƠNG ÁN:
• (A) shorten: rút ngắn, thu nhỏ → Sai (Đó là nghĩa của contract khi là nội động từ vật lý co lại).
• (B) retain: thuê dịch vụ chuyên môn → CHÍNH XÁC.
• (C) agree: đồng ý → Thiếu tân ngữ dịch vụ.
• (D) sign: ký tên → Thiếu ý nghĩa thuê mướn.`
  },

  "L5_Q192_haroldglass": {
    correct: "(A) Harold Glass (Ông Harold Glass)",
    explanation: `🎯 ĐÁP ÁN ĐÚNG: (A) "Harold Glass" (Thủ quỹ Harold Glass)

💡 DẪN CHỨNG BÀI ĐỌC:
• Dẫn chứng: "District Council Meeting Minutes: 'Council Treasurer Harold Glass delivered the fiscal forecast and outlined the district's capital development financing plan.'"
(Biên bản cuộc họp Hội đồng Quận: 'Thủ quỹ Hội đồng Harold Glass đã trình bày dự báo ngân sách và phác thảo kế hoạch tài trợ phát triển vốn của quận.')

🔄 PARAPHRASE & SUY LUẬN:
• "Harold Glass outlined the capital development financing plan" ➔ "Harold Glass presented a financial plan to the council".

🔍 PHÂN TÍCH 4 PHƯƠNG ÁN:
• (A) Harold Glass → CHÍNH XÁC (Người trình bày báo cáo kế hoạch tài chính).
• (B) John Stone: Chủ Regal Properties → Sai (Chỉ gửi thư xin chuyển đổi mục đích sử dụng đất).
• (C) Stuart Kaplan: Thị trưởng → Sai (Chỉ chủ trì cuộc họp).
• (D) Amanda M.: Nghị viên → Sai.`
  },

  "L5_Q197_item4": {
    correct: "(D) Item 4 (Mục số 4 trong nghị trình)",
    explanation: `🎯 ĐÁP ÁN ĐÚNG: (D) "Item 4" (Mục 4 trong nghị trình)

💡 DẪN CHỨNG BÀI ĐỌC:
• Dẫn chứng: "Attached Proposed Agenda: Item 4 – Outreach to neighborhood shopkeepers. Ms. Fowler noted: 'we could probably save meeting time by doing this online before the meeting.'"
(Dự thảo nghị trình đính kèm: Mục 4 – Tiếp cận các chủ cửa hàng trong khu phố. Bà Fowler lưu ý: 'chúng ta có thể tiết kiệm thời gian họp bằng cách thực hiện việc này trực tuyến trước cuộc họp.')

🔄 PARAPHRASE & SUY LUẬN:
• "save meeting time by doing this online before the meeting" ➔ Bà Fowler đề xuất có thể bỏ thảo luận trực tiếp Mục 4 ("Item 4") trong buổi họp để làm qua mạng trước.

🔍 PHÂN TÍCH 4 PHƯƠNG ÁN:
• (A) Item 1 → Sai (Phần bầu cử ban điều hành bắt buộc họp trực tiếp).
• (B) Item 2 → Sai.
• (C) Item 3 → Sai.
• (D) Item 4 → CHÍNH XÁC (Nội dung tiếp cận hộ kinh doanh được chuyển sang làm online).`
  },

  "L5_Q200_location": {
    correct: "(D) The location (Địa điểm ăn trưa)",
    explanation: `🎯 ĐÁP ÁN ĐÚNG: (D) "The location" (Địa điểm ăn trưa)

💡 DẪN CHỨNG BÀI ĐỌC:
• Dẫn chứng: "In the second e-mail from Ms. Fowler: 'For those available after the session, we will be walking across the square to dine together at the Bistro Verde on Elm Street.'"
(Trong email thứ hai từ bà Fowler: 'Đối với những người rảnh sau buổi họp, chúng ta sẽ đi bộ qua quảng trường để dùng bữa cùng nhau tại quán Bistro Verde trên Phố Elm.')

🔄 PARAPHRASE & SUY LUẬN:
• "dine together at Bistro Verde on Elm Street" (quán ăn trên Phố Elm) ➔ Bà Fowler cung cấp thông tin về địa điểm ("The location") của bữa trưa.

🔍 PHÂN TÍCH 4 PHƯƠNG ÁN:
• (A) The menu options: Thực đơn chi tiết → Sai (Không liệt kê món ăn).
• (B) The price per person: Giá tiền mỗi người → Sai (Không đề cập số tiền).
• (C) The guest speaker: Diễn giả khách mời → Sai.
• (D) The location: Địa điểm quán ăn → CHÍNH XÁC.`
  },

  "L5_Q197_scope": {
    correct: "(D) extent (tầm mức, quy mô, phạm vi)",
    explanation: `🎯 ĐÁP ÁN ĐÚNG: (D) "extent" (quy mô, tầm mức, phạm vi)

💡 DẪN CHỨNG BÀI ĐỌC:
• Dẫn chứng: "Because of the size and scope of the project, a variety of jobs will be needed, from warehouse loaders and drivers to clerical positions."
(Do quy mô và tầm mức / phạm vi rộng lớn của dự án, nhiều vị trí công việc đa dạng sẽ được tuyển dụng, từ nhân viên bốc xếp kho bãi và tài xế cho đến các vị trí văn phòng.)

🔄 PARAPHRASE & SUY LUẬN:
• "size and scope of the project" (kích thước và phạm vi/tầm mức của dự án) ➔ "extent" (phạm vi, quy mô ảnh hưởng).

🔍 PHÂN TÍCH 4 PHƯƠNG ÁN:
• (A) goal: mục tiêu → Sai nghĩa.
• (B) view: tầm nhìn, góc nhìn → Sai nghĩa.
• (C) method: phương pháp → Sai nghĩa.
• (D) extent: quy mô, phạm vi, tầm mức → CHÍNH XÁC.`
  },

  "L5_Q198_characteristic1": {
    correct: "(A) Characteristic 1 (Đặc tính số 1 - Bền vững)",
    explanation: `🎯 ĐÁP ÁN ĐÚNG: (A) "Characteristic 1" (Đặc tính số 1 - Tính bền vững với môi trường)

💡 DẪN CHỨNG BÀI ĐỌC:
• Dẫn chứng: "Characteristic 1: Sustainable – Bamboo is a renewable resource and can be composted. In Ms. Lahiri's letter: 'Our café's mission is zero landfill waste, so your biodegradable and compostable plates were the deciding factor for our procurement.'"
(Đặc tính 1: Bền vững – Tre là tài nguyên tái tạo và có thể ủ thành phân hữu cơ. Trong thư của cô Lahiri: 'Sứ mệnh của quán cà phê chúng tôi là không rác thải chôn lấp, vì vậy các loại đĩa tự phân hủy sinh học của bạn là yếu tố quyết định cho việc mua hàng của chúng tôi.')

🔄 PARAPHRASE & SUY LUẬN:
• "zero landfill waste, biodegradable, compostable" ➔ Trùng khớp trực tiếp với nội dung của Đặc tính 1 ("Characteristic 1 - Sustainable").

🔍 PHÂN TÍCH 4 PHƯƠNG ÁN:
• (A) Characteristic 1 → CHÍNH XÁC (Khớp với tiêu chí phân hủy sinh học và bảo vệ môi trường).
• (B) Characteristic 2: Không chứa hóa chất → Sai.
• (C) Characteristic 3: Độ bền cao → Sai.
• (D) Characteristic 4: Giá thành hợp lý → Sai.`
  },

  "L5_Q162_journalist": {
    correct: "(D) A journalist (Nhà báo / Phóng viên)",
    explanation: `🎯 ĐÁP ÁN ĐÚNG: (D) "A journalist" (Nhà báo / Phóng viên)

💡 DẪN CHỨNG BÀI ĐỌC:
• Dẫn chứng: "I remember those days clearly as I interviewed the members several times while I was writing for a regional arts newsletter."
(Tôi nhớ rất rõ những ngày đó vì tôi đã phỏng vấn các thành viên đoàn kịch nhiều lần khi đang viết bài cho một bản tin nghệ thuật trong khu vực.)

🔄 PARAPHRASE & SUY LUẬN:
• "interviewed members while writing for a newsletter" (phỏng vấn nhân vật và viết bài cho tòa soạn bản tin) ➔ Nghề nghiệp của ông Ntuli là "A journalist" (Nhà báo / Người làm báo).

🔍 PHÂN TÍCH 4 PHƯƠNG ÁN:
• (A) An actor: Diễn viên kịch → Sai (Ông chỉ phỏng vấn diễn viên).
• (B) A stage manager: Quản lý sân khấu → Sai (Ông đính chính Ronald Pike mới là quản lý đầu tiên).
• (C) A ticket seller: Nhân viên bán vé → Sai (Doreen Whitfield mới là người bán vé).
• (D) A journalist: Nhà báo → CHÍNH XÁC.`
  },

  "L5_Q165_12dollars": {
    correct: "(B) $12.00 (Mức giá $12.00 mỗi buổi học)",
    explanation: `🎯 ĐÁP ÁN ĐÚNG: (B) "$12.00" (12 đô la một buổi học)

💡 DẪN CHỨNG BÀI ĐỌC:
• Dẫn chứng: "Starting from 1 January, the price of a 12-month lesson package (48 lessons per year) will increase from $480.00 to $576.00. This rate ($12 per lesson) still enables you to make considerable savings compared with the standard non-member price of $16 for each session."
(Bắt đầu từ ngày 1 tháng 1, giá của gói học 12 tháng (48 buổi mỗi năm) sẽ tăng từ $480.00 lên $576.00. Mức giá này ($12 mỗi buổi học) vẫn giúp bạn tiết kiệm đáng kể so với mức giá tiêu chuẩn không dành cho hội viên là $16 cho mỗi buổi.)

🔄 PARAPHRASE & SUY LUẬN:
• Giá gói 48 buổi là $576.00 ➔ Lấy 576 chia 48 buổi = "$12 per lesson" (12 đô la một buổi học cho hội viên vào năm tới).

🔍 PHÂN TÍCH 4 PHƯƠNG ÁN:
• (A) $10.00: Giá cũ trước khi tăng ($480 / 48 buổi = $10) → Bẫy giá cũ.
• (B) $12.00: Giá mới năm sau ($576 / 48 buổi = $12) → CHÍNH XÁC.
• (C) $16.00: Giá cho khách vãng lai không phải hội viên → Bẫy đối tượng.
• (D) $20.00 → Không có trong bài đọc.`
  },

  "L5_Q167_lessonfees": {
    correct: "(D) Lesson fees (Học phí các buổi học bơi)",
    explanation: `🎯 ĐÁP ÁN ĐÚNG: (D) "Lesson fees" (Học phí các lớp học)

💡 DẪN CHỨNG BÀI ĐỌC:
• Dẫn chứng: "For more information about our updated class schedules and the new lesson fees for non-members, please visit www.riversideaquatics.org."
(Để biết thêm thông tin về lịch học cập nhật và biểu phí học bơi mới cho người không phải là hội viên, vui lòng truy cập trang web www.riversideaquatics.org.)

🔄 PARAPHRASE & SUY LUẬN:
• "information about updated schedules and new lesson fees on www.riversideaquatics.org" ➔ Thông tin có sẵn trên trang web chính là "Lesson fees" (Biểu phí học bơi).

🔍 PHÂN TÍCH 4 PHƯƠNG ÁN:
• (A) Locker rental rates: Phí thuê tủ khóa → Sai.
• (B) Pool operating hours: Giờ mở cửa hồ bơi → Sai.
• (C) Staff biographies: Tiểu sử nhân viên → Sai.
• (D) Lesson fees: Biểu phí học bơi → CHÍNH XÁC.`
  },

  "L5_Q170_conditions": {
    correct: "(B) conditions (các điều kiện, điều khoản quy định)",
    explanation: `🎯 ĐÁP ÁN ĐÚNG: (B) "conditions" (các điều kiện, điều khoản bắt buộc)

💡 DẪN CHỨNG BÀI ĐỌC:
• Dẫn chứng: "According to the terms set out by the founder of the initiative, we had to provide a comprehensive learning experience that runs regularly throughout the year..."
(Theo các điều khoản / điều kiện được người sáng lập sáng kiến đưa ra, chúng tôi phải cung cấp một trải nghiệm học tập toàn diện diễn ra thường xuyên trong suốt cả năm...)

🔄 PARAPHRASE & SUY LUẬN:
• "terms set out by the founder" (các điều khoản / điều kiện quy định bắt buộc phải tuân theo) ➔ "conditions" (điều kiện cam kết).

🔍 PHÂN TÍCH 4 PHƯƠNG ÁN:
• (A) durations: khoảng thời gian → Sai nghĩa.
• (B) conditions: các điều kiện, điều khoản → CHÍNH XÁC.
• (C) expressions: biểu thức, cách diễn đạt → Sai nghĩa.
• (D) names: tên gọi → Sai nghĩa.`
  },

  "L5_Q184_entered": {
    correct: "(C) entered (nhập mã vào hệ thống máy tính)",
    explanation: `🎯 ĐÁP ÁN ĐÚNG: (C) "entered" (nhập vào hệ thống)

💡 DẪN CHỨNG BÀI ĐỌC:
• Dẫn chứng: "In the manager's response: 'I ran the voucher code (serial number 51284630) through our central merchant database and confirmed that the $60 credit is active.'"
(Trong phản hồi của người quản lý: 'Tôi đã nhập mã phiếu thưởng (số sê-ri 51284630) vào cơ sở dữ liệu thương nhân trung tâm của chúng tôi và xác nhận rằng khoản tín dụng 60 đô la vẫn đang hoạt động.')

🔄 PARAPHRASE & SUY LUẬN:
• "ran a code/serial number through a database" (chạy/nhập mã số vào phần mềm để kiểm tra) ➔ "entered" (nhập dữ liệu vào hệ thống).

🔍 PHÂN TÍCH 4 PHƯƠNG ÁN:
• (A) fled: chạy trốn (quá khứ của flee) → Lạc nghĩa hoàn toàn.
• (B) operated: vận hành → Không phù hợp với thao tác nhập mã.
• (C) entered: nhập dữ liệu vào → CHÍNH XÁC.
• (D) competed: thi đấu, cạnh tranh → Sai nghĩa.`
  },

  "L5_Q186_refreshments": {
    correct: "(B) Refreshments (Đồ ăn nhẹ và nước uống)",
    explanation: `🎯 ĐÁP ÁN ĐÚNG: (B) "Refreshments" (Đồ ăn nhẹ và nước uống giải khát)

💡 DẪN CHỨNG BÀI ĐỌC:
• Dẫn chứng: "Admission ticket includes seat in the main gallery, souvenir booklet, and post-show discussion with the director. Refreshments (tea, coffee, pastries) are available for purchase at the lobby concession stand."
(Vé vào cửa bao gồm chỗ ngồi trong khán phòng chính, sách lưu niệm và buổi thảo luận sau buổi diễn với đạo diễn. Đồ ăn nhẹ giải khát (trà, cà phê, bánh ngọt) được bán riêng tại quầy dịch vụ ở sảnh.)

🔄 PARAPHRASE & SUY LUẬN:
• "Refreshments are available for purchase separately" (đồ giải khát phải trả tiền mua riêng) ➔ "Refreshments" là mục KHÔNG được bao gồm trong giá vé vào cửa thông thường (NOT included).

🔍 PHÂN TÍCH 4 PHƯƠNG ÁN:
• (A) Main gallery seating: Chỗ ngồi khán phòng → ĐƯỢC BAO GỒM.
• (B) Refreshments: Đồ ăn uống giải khát → KHÔNG BAO GỒM (CHÍNH XÁC).
• (C) Souvenir booklet: Sách lưu niệm → ĐƯỢC BAO GỒM.
• (D) Post-show discussion: Thảo luận sau vở kịch → ĐƯỢC BAO GỒM.`
  },

  "L5_Q188_received": {
    correct: "(C) received (được đón nhận, tiếp nhận)",
    explanation: `🎯 ĐÁP ÁN ĐÚNG: (C) "received" (được đón nhận, tiếp nhận phản hồi)

💡 DẪN CHỨNG BÀI ĐỌC:
• Dẫn chứng: "The revival of Northern Lantern was very well taken by audiences, receiving enthusiastic reviews from both local theater critics and casual theatergoers."
(Sự trở lại của vở kịch Northern Lantern đã được khán giả đón nhận rất nồng nhiệt, nhận được những đánh giá đầy hào hứng từ cả các nhà phê bình sân khấu địa phương lẫn khán giả thông thường.)

🔄 PARAPHRASE & SUY LUẬN:
• "well taken by audiences" (được khán giả đón nhận tốt, hưởng ứng tích cực) ➔ "received" (được tiếp nhận / đón nhận).

🔍 PHÂN TÍCH 4 PHƯƠNG ÁN:
• (A) captured: bị bắt giữ → Sai nghĩa.
• (B) removed: bị dời đi, tháo dỡ → Sai nghĩa.
• (C) received: được đón nhận, tiếp nhận → CHÍNH XÁC.
• (D) interpreted: được thông dịch → Không tự nhiên trong ngữ cảnh đánh giá kịch nghệ.`
  },

  "L5_Q192_matters": {
    correct: "(A) matters (các vấn đề, sự việc thảo luận)",
    explanation: `🎯 ĐÁP ÁN ĐÚNG: (A) "matters" (các vấn đề, sự việc quan trọng)

💡 DẪN CHỨNG BÀI ĐỌC:
• Dẫn chứng: "In Paul's e-mail: 'There are a couple of issues I'd like to bring to your attention regarding the staircase painting project and agenda formatting.'"
(Trong email của Paul: 'Có một vài vấn đề / sự việc tôi muốn lưu ý với anh liên quan đến dự án sơn cầu thang bộ và cách định dạng chương trình nghị sự.')

🔄 PARAPHRASE & SUY LUẬN:
• "a couple of issues to bring to attention" (một vài vấn đề, việc cần bàn luận) ➔ "matters" (các sự việc, vấn đề liên quan).

🔍 PHÂN TÍCH 4 PHƯƠNG ÁN:
• (A) matters: các vấn đề, công việc → CHÍNH XÁC.
• (B) publications: các ấn phẩm, số báo → Sai (Chỉ dùng cho số phát hành tạp chí).
• (C) provisions: điều khoản điều lệ / nguồn cung cấp → Sai nghĩa.
• (D) requests: các lời yêu cầu → Không sát nghĩa bằng matters.`
  },

  "L5_Q198_article": {
    correct: "(D) article (bài báo chuyên đề / bài phóng sự)",
    explanation: `🎯 ĐÁP ÁN ĐÚNG: (D) "article" (bài báo, bài phóng sự)

💡 DẪN CHỨNG BÀI ĐỌC:
• Dẫn chứng: "In Ellis Vaughan's email: 'I was delighted to read the lovely feature on Snowpeak in yesterday's edition of the Western Mail food section.'"
(Trong email của Ellis Vaughan: 'Tôi rất vui khi đọc bài phóng sự chuyên đề tuyệt vời về Snowpeak trên chuyên mục ẩm thực của tờ Western Mail ngày hôm qua.')

🔄 PARAPHRASE & SUY LUẬN:
• "a feature in the newspaper food section" (bài phóng sự đặc biệt trên báo) ➔ "article" (bài báo, bài viết).

🔍 PHÂN TÍCH 4 PHƯƠNG ÁN:
• (A) characteristic: đặc tính sản phẩm → Sai nghĩa khi đứng trong ngữ cảnh báo chí.
• (B) film: bộ phim điện ảnh → Sai ngữ cảnh báo in.
• (C) promotion: chương trình khuyến mãi → Sai.
• (D) article: bài báo, bài viết chuyên đề → CHÍNH XÁC.`
  },

  "L5_Q199_wednesday": {
    correct: "(C) On Wednesday (Vào thứ Tư)",
    explanation: `🎯 ĐÁP ÁN ĐÚNG: (C) "On Wednesday" (Vào ngày thứ Tư)

💡 DẪN CHỨNG BÀI ĐỌC:
• Dẫn chứng: "In the meeting confirmation email: 'I will be traveling to Swansea on Tuesday, but Wednesday afternoon after 2:00 P.M. works perfectly for our discussion at your dessert shop.'"
(Trong email xác nhận cuộc gặp: 'Tôi sẽ đi công tác ở Swansea vào thứ Ba, nhưng chiều thứ Tư sau 2:00 chiều là thời gian hoàn hảo để chúng ta thảo luận tại quán đồ tráng miệng của bạn.')

🔄 PARAPHRASE & SUY LUẬN:
• Thứ Ba bận đi Swansea ➔ Cuộc gặp giữa ông Vaughan và cô Kowal được ấn định chính xác vào "On Wednesday" (Thứ Tư).

🔍 PHÂN TÍCH 4 PHƯƠNG ÁN:
• (A) On Monday: Thứ Hai → Sai.
• (B) On Tuesday: Thứ Ba → Bẫy (Hôm đó đi Swansea).
• (C) On Wednesday: Thứ Tư → CHÍNH XÁC (Khớp với giờ hẹn sau 2:00 P.M.).
• (D) On Friday: Thứ Sáu → Không nhắc tới.`
  },

  // --- MOCK TEST 1 SENTENCE INSERTION ---
  "M1_Q160_insertion": {
    correct: "(D) [4]",
    explanation: `🎯 ĐÁP ÁN ĐÚNG: (D) "[4]"

💡 DẪN CHỨNG BÀI ĐỌC:
• Câu đứng trước vị trí [4]: "Employees frequently spend hours attempting to resolve unexpected computer network outages on their own."
(Nhân viên thường mất hàng giờ tự tìm cách khắc phục các sự cố mất mạng máy tính bất ngờ.)
• Câu cần điền: "This can lead to a considerable loss of productivity for a business."
(Điều này có thể dẫn đến sự sụt giảm đáng kể năng suất của một doanh nghiệp.)

🔄 LIÊN KẾT MẠCH VĂN:
• Đại từ chỉ định "This" (Điều này) thay thế trực tiếp cho tình trạng nhân viên lãng phí hàng giờ tự sửa máy tính ở câu trước. Hành động đó chính là nguyên nhân trực tiếp dẫn tới "loss of productivity" (mất mát năng suất lao động của doanh nghiệp).

🔍 PHÂN TÍCH CÁC VỊ TRÍ KHÁC:
• Vị trí [1], [2], [3] đang nói về phạm vi dịch vụ hỗ trợ CNTT và quy trình đăng ký, chèn câu về mất năng suất vào giữa các câu đó sẽ làm gãy mạch văn.`
  },

  "M1_Q166_insertion": {
    correct: "(D) [4]",
    explanation: `🎯 ĐÁP ÁN ĐÚNG: (D) "[4]"

💡 DẪN CHỨNG BÀI ĐỌC:
• Câu đứng trước vị trí [4]: "Simply call our member services team at 555-0143 between the hours of 8 A.M. and 5 P.M."
(Chỉ cần gọi cho đội ngũ dịch vụ thành viên của chúng tôi theo số 555-0143 trong khung giờ từ 8 giờ sáng đến 5 giờ chiều.)
• Câu cần điền: "Our staff will only need to ask you for a few details to complete the process."
(Nhân viên của chúng tôi sẽ chỉ cần hỏi bạn một vài thông tin chi tiết để hoàn tất quy trình.)

🔄 LIÊN KẾT MẠCH VĂN:
• Cụm từ "Our staff" (Nhân viên của chúng tôi) liên kết chặt chẽ với "our member services team" (đội ngũ dịch vụ thành viên) ở câu gọi điện thoại đứng ngay trước đó. Cụm "the process" thay thế cho quy trình gia hạn thẻ hội viên qua điện thoại.`
  }
};

async function healAllEvidence() {
  await mongoose.connect(MONGODB_URI);
  const db = mongoose.connection.db;

  console.log('=== APPLYING AUTHENTIC ETS EVIDENCE EXPLANATIONS TO DATABASE ===\n');

  let updatedReading = 0;
  let updatedMock = 0;

  // 1. UPDATE READINGEXERCISES
  const rDocs = await db.collection('readingexercises').find({
    part: { $in: ['Part 7', 7] }
  }).toArray();

  for (const doc of rDocs) {
    let modified = false;
    for (const q of (doc.questions || [])) {
      const p = q.prompt || '';
      const exp = q.explanation || '';
      const num = q.questionNum;

      // Match each question based on prompt keywords or question number
      let replacement = null;

      if (doc.title.includes('Level 1')) {
        if (/What issue does the notice discuss/i.test(p)) replacement = HEALED_EXPLANATIONS.L1_Q148_workplace;
        else if (/What type of businesses are listed on the sign/i.test(p)) replacement = HEALED_EXPLANATIONS.L1_Q148_healthcare;
        else if (/What are attendees advised to bring/i.test(p)) replacement = HEALED_EXPLANATIONS.L1_Q147_somefood;
        else if (/What type of building did Crystal Brothers clean/i.test(p)) replacement = HEALED_EXPLANATIONS.L1_Q147_ahome;
      } else if (doc.title.includes('Level 2')) {
        if (/capture.+paragraph 1/i.test(p)) replacement = HEALED_EXPLANATIONS.L2_Q157_capture;
        else if (/Who is Mr\. Bernstein/i.test(p)) replacement = HEALED_EXPLANATIONS.L2_Q159_artist;
      } else if (doc.title.includes('Level 3')) {
        if (/seamless.+paragraph 4/i.test(p)) replacement = HEALED_EXPLANATIONS.L3_Q167_seamless;
      } else if (doc.title.includes('Level 4')) {
        if (/sharing.+paragraph 1/i.test(p)) replacement = HEALED_EXPLANATIONS.L4_Q180_sharing;
        else if (/given.+paragraph 2/i.test(p)) replacement = HEALED_EXPLANATIONS.L4_Q183_given;
        else if (/allows.+paragraph 2/i.test(p)) replacement = HEALED_EXPLANATIONS.L4_Q182_allows;
        else if (/appreciate.+paragraph 1/i.test(p)) replacement = HEALED_EXPLANATIONS.L4_Q183_appreciate;
        else if (/Where does Ms\. Rigby most likely live/i.test(p)) replacement = HEALED_EXPLANATIONS.L4_Q187_liverpool;
        else if (/Which area of Creative Kate's will be reduced/i.test(p)) replacement = HEALED_EXPLANATIONS.L4_Q188_sectionA;
        else if (/What most likely is Mr\. Chiba's job/i.test(p)) replacement = HEALED_EXPLANATIONS.L4_Q189_eventplanner;
        else if (/What item was received damaged/i.test(p)) replacement = HEALED_EXPLANATIONS.L4_Q187_21G;
        else if (/extend.+paragraph 1/i.test(p)) replacement = HEALED_EXPLANATIONS.L4_Q188_extend;
      } else if (doc.title.includes('Level 5')) {
        if (/what work does Ms\. Choi want Mr\. Nunez to do/i.test(p)) replacement = HEALED_EXPLANATIONS.L5_Q191_tiles;
        else if (/How much will likely be added to Ms\. Choi's estimate/i.test(p)) replacement = HEALED_EXPLANATIONS.L5_Q193_100dollars;
        else if (/contract.+paragraph 1/i.test(p)) replacement = HEALED_EXPLANATIONS.L5_Q194_contract;
        else if (/who presented a financial/i.test(p)) replacement = HEALED_EXPLANATIONS.L5_Q192_haroldglass;
        else if (/What item does Ms\. Fowler suggest could be removed/i.test(p)) replacement = HEALED_EXPLANATIONS.L5_Q197_item4;
        else if (/what information about lunch does Ms\. Fowler provide/i.test(p)) replacement = HEALED_EXPLANATIONS.L5_Q200_location;
        else if (/scope.+paragraph 2/i.test(p)) replacement = HEALED_EXPLANATIONS.L5_Q197_scope;
        else if (/characteristic of bamboo tableware/i.test(p)) replacement = HEALED_EXPLANATIONS.L5_Q198_characteristic1;
        else if (/Who most likely is Mr\. Ntuli/i.test(p)) replacement = HEALED_EXPLANATIONS.L5_Q162_journalist;
        else if (/swimming lesson at Riverside Aquatics cost/i.test(p)) replacement = HEALED_EXPLANATIONS.L5_Q165_12dollars;
        else if (/information is available on the Web site/i.test(p)) replacement = HEALED_EXPLANATIONS.L5_Q167_lessonfees;
        else if (/terms.+paragraph 3/i.test(p)) replacement = HEALED_EXPLANATIONS.L5_Q170_conditions;
        else if (/ran.+paragraph 1/i.test(p)) replacement = HEALED_EXPLANATIONS.L5_Q184_entered;
        else if (/NOT included in the general admission price/i.test(p)) replacement = HEALED_EXPLANATIONS.L5_Q186_refreshments;
        else if (/taken.+paragraph 2/i.test(p)) replacement = HEALED_EXPLANATIONS.L5_Q188_received;
        else if (/issues.+paragraph 2/i.test(p)) replacement = HEALED_EXPLANATIONS.L5_Q192_matters;
        else if (/feature.+paragraph 1/i.test(p)) replacement = HEALED_EXPLANATIONS.L5_Q198_article;
        else if (/When most likely will Mr\. Vaughan and Ms\. Kowal meet/i.test(p)) replacement = HEALED_EXPLANATIONS.L5_Q199_wednesday;
      }

      if (replacement) {
        q.explanation = replacement.explanation;
        modified = true;
        updatedReading++;
      }
    }

    if (modified) {
      await db.collection('readingexercises').updateOne(
        { _id: doc._id },
        { $set: { questions: doc.questions } }
      );
    }
  }

  // 2. UPDATE MOCKTESTS (TEST 1 Q160, Q165, Q166, Q167, Q184, Q186, Q188, Q192)
  const mockDocs = await db.collection('mocktests').find({}).toArray();
  for (const t of mockDocs) {
    let modified = false;
    for (const q of (t.questions || [])) {
      const p = q.prompt || '';
      let replacement = null;

      if (t.title.includes('Test 1')) {
        if (/considerable loss of productivity/i.test(p)) replacement = HEALED_EXPLANATIONS.M1_Q160_insertion;
        else if (/swimming lesson at Riverside Aquatics cost/i.test(p)) replacement = HEALED_EXPLANATIONS.L5_Q165_12dollars;
        else if (/Our staff will only need to ask you/i.test(p)) replacement = HEALED_EXPLANATIONS.M1_Q166_insertion;
        else if (/information is available on the Web site/i.test(p)) replacement = HEALED_EXPLANATIONS.L5_Q167_lessonfees;
        else if (/ran.+paragraph 1/i.test(p)) replacement = HEALED_EXPLANATIONS.L5_Q184_entered;
        else if (/NOT included in the general admission price/i.test(p)) replacement = HEALED_EXPLANATIONS.L5_Q186_refreshments;
        else if (/taken.+paragraph 2/i.test(p)) replacement = HEALED_EXPLANATIONS.L5_Q188_received;
        else if (/issues.+paragraph 2/i.test(p)) replacement = HEALED_EXPLANATIONS.L5_Q192_matters;
      }

      if (replacement) {
        q.explanation = replacement.explanation;
        modified = true;
        updatedMock++;
      }
    }

    if (modified) {
      await db.collection('mocktests').updateOne(
        { _id: t._id },
        { $set: { questions: t.questions } }
      );
    }
  }

  console.log(`✅ Success! Updated ${updatedReading} questions in readingexercises and ${updatedMock} questions in mocktests!`);
  await mongoose.disconnect();
  process.exit(0);
}

healAllEvidence().catch(console.error);
