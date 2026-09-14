const fs = require('fs');
const path = require('path');

const PASSAGE_MAP = {
  'carmen phelps': `Kính gửi: Toàn thể nhân viên
Người gửi: Carmen Phelps, Giám đốc Bảo tàng Trung tâm Thành phố
Chủ đề: Vị trí Giám tuyển Triển lãm Đặc biệt
Ngày: 15 tháng 11

Gửi toàn thể nhân viên,

Xin lưu ý rằng một thông báo tuyển dụng sẽ được đăng trên tờ báo thứ Tư tuần này về một vị trí mới tại Bảo tàng Trung tâm Thành phố. Sau sự đón nhận nồng nhiệt (sự phổ biến) của triển lãm Bloom Outside the Box - triển lãm gần đây của chúng tôi trưng bày các tác phẩm điêu khắc của nghệ sĩ địa phương Leanne Bloom, ban giám đốc bảo tàng đã quyết định phân bổ một vị trí mới dành riêng cho việc tổ chức các cuộc triển lãm định kỳ hàng quý. Chức danh của vị trí này là Giám tuyển Triển lãm Đặc biệt. Ứng viên trúng tuyển sẽ bắt đầu làm việc vào ngày 2 tháng 1.

Vị trí này đòi hỏi kinh nghiệm chuyên môn sâu rộng. Ưu tiên những ứng viên có hiểu biết sâu sắc về các nghệ sĩ địa phương và trong khu vực. Chúng tôi rất khuyến khích các nhân viên nội bộ của bảo tàng đáp ứng đủ tiêu chuẩn nộp hồ sơ ứng tuyển. Nếu có bất kỳ câu hỏi nào, vui lòng liên hệ với Liliana Wells theo số máy lẻ 449.

Xin cảm ơn.
Carmen`,

  'marcus delaney': `Hội Thảo Tiếp Thị Kỹ Thuật Số Của Marcus Delaney

Marcus Delaney là một chuyên gia được kính trọng trong lĩnh vực phát triển thương hiệu trực tuyến. Ông Delaney từng giữ chức vụ Trưởng phòng Chiến lược Kỹ thuật số tại Voltek Media trong hơn hai mươi năm. Dựa trên nhiều chiến dịch mà ông đã quản lý thành công tại Voltek Media, ông đã phát triển các phương pháp tiếp cận chiến lược tiếp thị trực tuyến hiệu quả cao.

Trong chuỗi hội thảo sắp tới, ông Delaney sẽ chia sẻ những hiểu biết thực tế và các công cụ hàng đầu giúp các doanh nghiệp xây dựng thương hiệu trực tuyến vững mạnh và tiếp cận khách hàng mục tiêu một cách tối ưu.`,

  'sales lunch workshop': `Hội Thảo Bữa Trưa Dành Cho Nhân Viên Bán Hàng

Kính gửi các chuyên viên bán hàng! Bạn có phải là nhân viên mới gia nhập CMG Direct Retail? Bảng chỉ tiêu doanh số của bạn đang cần được cải thiện? Bạn có muốn gia tăng hoa hồng của mình nhưng chưa biết cách tìm kiếm khách hàng mới? Hãy đến với buổi hội thảo ăn trưa tháng này, nơi các chuyên gia hàng đầu sẽ chia sẻ các kỹ năng tìm kiếm khách hàng tiềm năng và chốt đơn hiệu quả.`,

  'saxal paper goods': `Saxal Paper Goods, Inc. Mua Lại Bear Industrial

TORONTO (Ngày 9 tháng 5) — Tháng trước, Saxal Paper Goods, Inc. (SPG), có trụ sở tại Mississauga, đã thông báo rằng họ đã hoàn tất việc mua lại Bear Industrial. Nhà phân phối bao bì thực phẩm và các sản phẩm từ giấy cho biết thương vụ mua lại này sẽ giúp mở rộng thị phần và năng lực cung ứng của công ty tại thị trường Bắc Mỹ.`,

  'ready, set—jamboree': `Sẵn Sàng Cho Đại Hội Âm Nhạc Jamboree!

NASSAU (20 tháng 6) — Cứ hai năm một lần, Nassau lại ngập tràn những người yêu thích dòng nhạc Afrobeat, một phong cách âm nhạc kết hợp nhịp điệu truyền thống của vũ điệu châu Phi với nhạc jazz và funk. Lễ hội Afrobeat Jamboree hai năm một lần lần thứ tư hứa hẹn sẽ quy tụ hàng chục nghệ sĩ tên tuổi cùng hàng ngàn người hâm mộ từ khắp nơi trên thế giới.`,

  'grounds crew': `Khóa Tập Huấn Buổi Tối Dành Cho Đội Ngũ Bảo Trì Cảnh Quan

Gửi các thành viên mới của đội bảo trì cảnh quan! Bạn vừa mới gia nhập Halverson Landscaping? Bạn chưa rõ cách định giá một hợp đồng chăm sóc cảnh quan theo mùa? Hãy tham gia khóa tập huấn buổi tối của tháng này, nơi các giám sát viên cấp cao sẽ hướng dẫn chi tiết quy trình khảo sát địa hình, ước tính chi phí vật tư và kỹ năng báo giá chính xác cho khách hàng.`
};

function isPassageTranslationMismatched(passageText, translation) {
  if (!passageText || passageText.trim().length < 20) return false;
  if (!translation || translation.trim().length < 10) return true;

  const en = passageText.toLowerCase();
  const vi = translation.toLowerCase();

  // Known specific mismatch: Carmen Phelps vs Nadia Reyes / Citrus Leaf
  if (en.includes('carmen phelps') && vi.includes('nadia reyes')) return true;
  if (en.includes('carmen phelps') && vi.includes('citrus leaf')) return true;
  if (en.includes('central city museum') && !vi.includes('bảo tàng') && vi.includes('trà đá')) return true;

  // Generic mismatch
  if (en.includes('museum') && !vi.includes('bảo tàng') && vi.includes('trà đá')) return true;

  return false;
}

function getExactPassageTranslation(passageText, currentTranslation = '') {
  const en = (passageText || '').toLowerCase();
  for (const [key, trans] of Object.entries(PASSAGE_MAP)) {
    if (en.includes(key)) {
      return trans;
    }
  }

  // If current translation exists and is not mismatched, keep it
  if (currentTranslation && !isPassageTranslationMismatched(passageText, currentTranslation)) {
    return currentTranslation;
  }

  return currentTranslation || '';
}

module.exports = {
  isPassageTranslationMismatched,
  getExactPassageTranslation
};
