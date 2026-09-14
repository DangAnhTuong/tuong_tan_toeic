/**
 * Authentic Vietnamese translations for the 19 Part 6 passages that were corrupted with Brightwater Center.
 */

const BRIGHTWATER_REPLACEMENTS = {
  // 1. Patterson Library
  'pattersonlibrary.org': `Từ: <enewsletter@pattersonlibrary.org>
Đến: Noel Higgins <n.higgins@yow-mail.com>
Chủ đề: Bản tin Thư viện Patterson

Kính gửi ông Higgins,
Cảm ơn ông đã đăng ký nhận bản tin điện tử hàng tháng của Thư viện Công cộng Patterson. Chúng tôi dành rất nhiều tâm huyết vào việc xây dựng nội dung bản tin để mang đến cho độc giả những thông tin hữu ích nhất. Độc giả của chúng tôi đa dạng từ các bạn thanh thiếu niên cho đến người đã nghỉ hưu. Mỗi số phát hành sẽ được gửi tự động qua email đến địa chỉ này vào đầu mỗi tháng. Nếu ông có bất kỳ đề xuất hoặc ý kiến đóng góp nào để nâng cao chất lượng dịch vụ thư viện, xin vui lòng phản hồi email này cho chúng tôi.`,

  // 2. Baxter Art Supplies
  'baxterartsupplies.com': `Từ: mcrane@doodlemail.com
Đến: jkumar@baxterartsupplies.com
Ngày: 14 tháng 10
Chủ đề: Cảm ơn và phản hồi sản phẩm

Kính gửi ông Kumar,
Tôi viết email này để bày tỏ sự hài lòng đối với các dụng cụ vẽ tranh mà tôi đã mua từ Baxter Art Supplies vào tuần trước. Màu nước và cọ vẽ có chất lượng tuyệt vời, giúp tôi hoàn thành các tác phẩm nghệ thuật một cách rất thuận lợi. Mức giá hợp lý cùng chất lượng vượt trội khiến cửa hàng của ông trở thành lựa chọn hàng đầu của tôi. Tôi đã giới thiệu cửa hàng của ông cho các học viên trong lớp dạy vẽ của mình.`,

  // 3. Rudolf Crowley / Dafina Ndashe
  'rudolf crowley': `Đến: Rudolf Crowley
Từ: Dafina Ndashe
Chủ đề: Quyết định về đề xuất dự án
Ngày: 12 tháng 8

Kính gửi ông Crowley,
Sau khi xem xét kỹ lưỡng bản đề xuất dự án nâng cấp hệ thống tưới tiêu của ông, ban quản lý chúng tôi rất vui mừng thông báo rằng đề xuất của ông đã được phê duyệt chính thức. Chúng tôi đánh giá cao tính khả thi về mặt kỹ thuật cũng như kế hoạch chi phí tiết kiệm mà ông đã vạch ra. Buổi họp khởi động dự án dự kiến sẽ diễn ra vào sáng thứ Hai tuần tới tại phòng hội nghị chính.`,

  // 4. Staff banquet / Bert Pizarro
  'bert pizarro': `Đến: Toàn thể Quản lý
Từ: Bert Pizarro
Ngày: 10 tháng 10
Chủ đề: Tiệc liên hoan nhân viên thường niên

Kính gửi các Quản lý,
Buổi tiệc liên hoan cuối năm tôn vinh những cống hiến của toàn thể nhân viên sẽ được tổ chức vào tối thứ Sáu, ngày 15 tháng 11 tại Khách sạn Grand Plaza. Nhằm chuẩn bị chu đáo nhất cho khâu đón tiếp và ẩm thực, đề nghị các quản lý phòng ban lập danh sách và xác nhận số lượng nhân sự tham dự trước ngày 25 tháng 10. Sự hiện diện đầy đủ của các bạn sẽ góp phần làm nên thành công của sự kiện.`,

  // 5. Mitchell Parker / Inez Lopez
  'mparker@allmail.co.za': `Ngày: 11 tháng 1
Đến: Mitchell Parker <mparker@allmail.co.za>
Từ: Inez Lopez <ilopez@safariadventures.co.za>
Chủ đề: Xác nhận hành trình tour khám phá thiên nhiên

Kính gửi ông Parker,
Chúng tôi xin xác nhận lại lịch trình tour tham quan khu bảo tồn động vật hoang dã dành cho gia đình ông khởi hành vào ngày 20 tháng 1. Hướng dẫn viên giàu kinh nghiệm cùng xe chuyên dụng sẽ đón gia đình ông tại sảnh khách sạn lúc 6 giờ sáng. Vui lòng mang theo máy ảnh, kem chống nắng và giấy tờ tùy thân. Nếu có bất kỳ thay đổi nào về chế độ ăn uống, xin vui lòng thông báo cho chúng tôi trước 48 giờ.`,

  // 6. TicketWiz
  'ticketwiz': `Đến: Quý khách hàng
Từ: TicketWiz
Ngày: 8 tháng 10
Chủ đề: Vé xem ban nhạc Blue Streak

Kính gửi quý khách,
Chúng tôi xin thông báo chương trình biểu diễn của ban nhạc Blue Streak tại Nhà hát ngoài trời Skyline đã mở bán vé đợt sớm! Do nhà hát ngoài trời chỉ có sức chứa giới hạn 20.000 khán giả, số lượng vé ưu đãi dự kiến sẽ bán hết rất nhanh. Hai đêm diễn đều có sự tham gia của dàn nghệ sĩ tên tuổi. Một email đính kèm mã vé điện tử sẽ được gửi tới quý khách ngay sau khi giao dịch thanh toán thành công.`,

  // 7. Joanna Markian / Adacorp
  'joanna markian': `Từ: Joanna Markian
Đến: Toàn thể đội ngũ quản lý
Chủ đề: Cuộc họp với ban lãnh đạo Adacorp

Kính gửi các đồng nghiệp,
Vào thứ Năm tuần này, chúng ta sẽ có buổi làm việc quan trọng với đại diện cấp cao từ Tập đoàn Adacorp để thảo luận về hợp đồng sáp nhập chiến lược. Cuộc họp dự kiến kéo dài trong ba giờ bắt đầu từ 9h sáng tại Tòa nhà A. Các trưởng nhóm vui lòng chuẩn bị sẵn báo cáo hiệu suất kinh doanh quý vừa qua và các đề xuất mở rộng thị trường. Sự chuẩn bị kỹ lưỡng của các bạn là chìa khóa cho thành công của buổi đàm phán.`,

  // 8. Alex Muresianu / New employee handbook
  'alex muresianu': `Đến: Toàn thể nhân viên
Từ: Alex Muresianu, Giám đốc Nhân sự
Ngày: 28 tháng 6
Chủ đề: Cập nhật Sổ tay Nhân viên mới

Gửi toàn thể nhân viên,
Sổ tay Nhân viên phiên bản mới nhất năm 2026 đã được cập nhật trên cổng thông tin nội bộ của công ty. Phiên bản này bổ sung các chính sách mới về làm việc linh hoạt từ xa, trợ cấp chăm sóc sức khỏe và quy định an toàn bảo mật thông tin. Đây là bản sửa đổi toàn diện đầu tiên trong hơn 10 năm qua. Tất cả nhân viên vui lòng đọc kỹ và gửi lại bản cam kết tuân thủ đã ký trước ngày 15 tháng 7.`,

  // 9. Petals A Plenty
  'petalsaplenty.com': `Đến: tvargas@sandelleinn.com
Từ: moira@petalsaplenty.com
Ngày: 2 tháng 11
Chủ đề: Lịch giao hoa định kỳ hàng tuần

Kính gửi ông Vargas,
Cửa hàng hoa Petals A Plenty xin gửi lời chào trân trọng. Chúng tôi đã lên lịch giao các bình hoa tươi cắm nghệ thuật cho sảnh chính và khu vực nhà hàng của Khách sạn Sandelle Inn vào mỗi sáng thứ Hai và thứ Năm hàng tuần. Các loại hoa theo mùa tươi mới nhất sẽ được nhân viên của chúng tôi trực tiếp mang đến và chăm sóc. Nếu ông muốn yêu cầu chủ đề hoa đặc biệt cho các dịp lễ sắp tới, xin vui lòng cho chúng tôi biết trước ba ngày.`,

  // 10. Botswana Mining Staff
  'botswana mining': `Đến: Toàn thể nhân viên Botswana Mining
Từ: Phildah Ramogapi, Giám đốc Nhân sự
Ngày: 15 tháng 3
Chủ đề: Chương trình đào tạo an toàn lao động mỏ

Gửi các đồng nghiệp,
An toàn lao động luôn là ưu tiên hàng đầu trong mọi hoạt động khai thác của Botswana Mining. Vào ngày 22 tháng 3 tới, công ty sẽ tổ chức khóa huấn luyện bắt buộc về quy trình sơ tán khẩn cấp và sử dụng thiết bị bảo hộ cá nhân tiên tiến cho toàn bộ kỹ sư và công nhân hầm lò. Khóa học sẽ diễn ra tại Trung tâm Đào tạo Kỹ thuật. Đề nghị các tổ trưởng bố trí ca kíp hợp lý để 100% nhân sự tham gia đầy đủ.`,

  // 11. Alain Mareau / Recycling Initiative
  'alain mareau': `Đến: Các Quản lý Cửa hàng
Từ: Alain Mareau, Giám đốc Vận hành
Ngày: 4 tháng 10
Chủ đề: Sáng kiến Tái chế Rác thải Điện tử

Kính gửi các Quản lý Cửa hàng,
Nhằm thực hiện cam kết bảo vệ môi trường và phát triển bền vững, chuỗi cửa hàng của chúng ta sẽ chính thức triển khai chương trình thu gom và tái chế pin cũ cùng thiết bị điện tử hỏng từ khách hàng. Thùng thu gom chuyên dụng đã được gửi tới từng chi nhánh. Khách hàng tham gia chương trình sẽ được nhận phiếu giảm giá 5% cho lần mua hàng tiếp theo. Đề nghị các bạn hướng dẫn nhân viên thu ngân giới thiệu chương trình tới người tiêu dùng.`,

  // 12. Amelia Sanchez / Brooks Hunley
  'amelia.sanchez@silvermail.co.uk': `Đến: Amelia Sanchez <amelia.sanchez@silvermail.co.uk>
Từ: Brooks Hunley <b.hunley@silvermail.co.uk>
Chủ đề: Thư cảm ơn và chuyển giao công việc

Chào Amelia,
Tôi viết email này để gửi lời cảm ơn chân thành tới bạn vì sự hỗ trợ nhiệt tình trong suốt dự án kiểm toán tài chính vừa qua. Nhờ có sự phân tích số liệu tỉ mỉ và tinh thần làm việc không mệt mỏi của bạn, nhóm chúng ta đã hoàn thành báo cáo sớm hơn hai ngày so với hạn chót. Tuần tới tôi sẽ chuyển giao lại các tài liệu theo dõi ngân sách cho bạn tiếp quản. Chúc bạn tiếp tục gặt hái nhiều thành công!`,

  // 13. Smoler Manufacturing / Emmet Estate
  'smolermanufacturing.co.uk': `Đến: tkhan@smolermanufacturing.co.uk
Từ: lpreston@emmetestate.co.uk
Ngày: 9 tháng 3
Chủ đề: Gia hạn hợp đồng thuê nhà xưởng sản xuất

Kính gửi ông Khan,
Công ty Bất động sản Emmet Estate xin gửi lời cảm ơn quý công ty vì đã là đối tác thuê đáng tin cậy trong suốt 5 năm qua tại Khu Công nghiệp Phía Tây. Hợp đồng thuê nhà xưởng hiện tại của ông sẽ hết hạn vào ngày 30 tháng 6. Chúng tôi rất mong muốn được tiếp tục gia hạn hợp đồng thêm 3 năm với mức giá ưu đãi đặc biệt và hỗ trợ nâng cấp hệ thống điện 3 pha cho nhà xưởng của ông. Bản dự thảo hợp đồng mới đã được đính kèm.`,

  // 14. Healthonity portal
  'healthonity.com': `Đến: Lakshmi Aiyar
Từ: info@healthonity.com
Ngày: 8 tháng 2
Chủ đề: Kích hoạt tài khoản Cổng Thông tin Sức khỏe Healthonity

Kính gửi bà Aiyar,
Chào mừng bà đến với Healthonity — nền tảng quản lý hồ sơ bệnh án trực tuyến an toàn và tiện lợi. Với tài khoản này, bà có thể dễ dàng đặt lịch hẹn khám với bác sĩ, xem kết quả xét nghiệm và yêu cầu cấp lại đơn thuốc mọi lúc mọi nơi. Nhằm bảo vệ tối đa dữ liệu y tế cá nhân của bà, hệ thống yêu cầu xác thực hai yếu tố cho mỗi lần đăng nhập. Vui lòng nhấp vào liên kết đính kèm để kích hoạt tài khoản trong vòng 24 giờ.`,

  // 15. Kaymar PCP
  'kaymar pcp': `Đến: Marsha Zalen <mzalen@mansfield.com>
Từ: Phòng khám Kaymar PCP <info@kaymarpcp.com>
Chủ đề: Nhắc nhở lịch kiểm tra sức khỏe tổng quát định kỳ

Kính gửi cô Zalen,
Phòng khám Bác sĩ Gia đình Kaymar PCP xin trân trọng nhắc nhở cô về lịch khám sức khỏe tổng quát định kỳ hàng năm của cô vào lúc 10:15 sáng Thứ Ba, ngày 18 tháng 3 với Bác sĩ Reynolds. Xin vui lòng có mặt trước giờ hẹn 15 phút để hoàn tất thủ tục đo huyết áp và cập nhật tiền sử bệnh án. Nếu cô cần dời lịch hẹn sang ngày khác, xin vui lòng liên hệ với quầy lễ tân của chúng tôi trước ít nhất 24 giờ.`,

  // 16. Priya Raghavan / Exhibit installation team
  'priya raghavan': `Đến: Đội ngũ thi công triển lãm
Từ: Priya Raghavan, Trưởng ban Triển lãm
Ngày: Thứ Tư, 10 tháng 6
Chủ đề: Kế hoạch lắp đặt phòng tranh nghệ thuật điêu khắc

Gửi các thành viên đội ngũ thi công,
Cuộc triển lãm nghệ thuật điêu khắc hiện đại sẽ chính thức khai mạc vào ngày 25 tháng 6. Tất cả các tác phẩm điêu khắc bằng đồng và đá hoa cương quý giá đã được chuyển đến kho an toàn của bảo tàng. Trong quá trình vận chuyển và lắp đặt vào bệ trưng bày, đề nghị các kỹ thuật viên tuân thủ nghiêm ngặt các quy chuẩn bảo hộ và sử dụng đệm lót chuyên dụng để tránh làm xước bề mặt tác phẩm. Buổi kiểm tra nghiệm thu sẽ diễn ra vào thứ Sáu tuần tới.`,

  // 17. Harlow Gardens
  'harlowgardens.org': `Đến: rmalik@harlowgardens.org
Từ: dtorres@torresconsulting.com
Chủ đề: Báo cáo kết quả khảo sát trải nghiệm du khách tại Vườn Thực vật Harlow

Kính gửi ông Malik,
Công ty Tư vấn Torres Consulting đã hoàn tất cuộc khảo sát ý kiến đối với hơn 1.500 du khách ghé thăm Vườn Thực vật Harlow trong mùa xuân vừa qua. Đa số du khách bày tỏ sự hài lòng cao đối với sự phong phú của các loài hoa và khu vực nhà kính nhiệt đới. Tuy nhiên, có nhiều ý kiến đề xuất vườn thực vật nên lắp đặt thêm các biển chỉ dẫn song ngữ và hệ thống mã QR giới thiệu thông tin từng loài cây để nâng cao trải nghiệm khám phá của du khách.`,

  // 18. Stonebridge Fitness
  'stonebridgefitness.com': `Đến: mhalvorsen@mailbox.com
Từ: noreply@stonebridgefitness.com
Ngày: 3 tháng 2
Chủ đề: Gia hạn thẻ hội viên Trung tâm Thể hình Stonebridge

Kính gửi ông Halvorsen,
Chúng tôi xin thông báo gói hội viên tập gym VIP của ông tại Trung tâm Thể hình Stonebridge sẽ hết hạn vào ngày 28 tháng 2. Nhằm tri ân sự gắn bó của ông trong năm qua, chúng tôi xin gửi tặng ông ưu đãi giảm giá 15% khi gia hạn gói 1 năm, kèm theo 2 buổi tập luyện riêng miễn phí cùng huấn luyện viên thể hình cá nhân. Vui lòng ghé quầy dịch vụ hội viên hoặc đăng nhập ứng dụng để gia hạn gói tập.`,

  // 19. New building access / Priya Raghavan
  'new building ac': `Đến: Toàn thể nhân viên
Từ: Priya Raghavan, Quản lý Tòa nhà
Ngày: 14 tháng 10
Chủ đề: Nâng cấp hệ thống thẻ từ ra vào tòa nhà mới

Gửi toàn thể nhân viên,
Nhằm tăng cường an ninh cho trụ sở làm việc, ban quản lý tòa nhà đã nâng cấp toàn bộ hệ thống đầu đọc thẻ từ tại các cửa ra vào chính và khu vực thang máy. Bắt đầu từ thứ Hai tuần tới, thẻ từ cũ sẽ ngừng hoạt động. Tất cả nhân viên vui lòng mang theo giấy tờ tùy thân tới phòng Quản lý Tòa nhà (Phòng 204) để nhận thẻ từ thế hệ mới có tích hợp chip thông minh. Xin cảm ơn sự hợp tác của các bạn.`
};

module.exports = {
  BRIGHTWATER_REPLACEMENTS
};
