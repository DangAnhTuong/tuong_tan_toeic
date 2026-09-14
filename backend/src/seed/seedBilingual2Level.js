/**
 * seedBilingual2Level.js
 * Xóa hết bài cũ, seed 30 bài mới — 2 level như Đậu TOEIC
 * Level 1: 15 bài (dễ-cơ bản)
 * Level 2: 15 bài (nâng cao)
 */

const mongoose = require('mongoose');
const MONGO_URI = 'mongodb://127.0.0.1:27017/tuong_tan_toeic';

const readingExerciseSchema = new mongoose.Schema({
  title: String, subTitle: String, mode: String, level: Number, levelName: String,
  levelBadge: String, part: String, partNumber: Number, topic: String, grammarTopic: String,
  articleCategory: String, readTime: String, audioUrl: String, errorRate: Number,
  isPro: Boolean, totalQuestions: Number, questions: Array,
  bilingualArticle: Object, grammarTheory: Object,
  createdAt: { type: Date, default: Date.now }, updatedAt: { type: Date, default: Date.now }
}, { collection: 'readingexercises' });
const ReadingExercise = mongoose.model('ReadingExercise', readingExerciseSchema);

// Helper: build document
function makeDoc(article) {
  const questions = article.questions.map((q, i) => ({
    questionNumber: i + 1,
    prompt: q.prompt,
    options: q.options.map(o => ({
      label: o.label, text: o.text, translation: o.translation,
      isCorrect: o.label === q.correctAnswer
    })),
    correctAnswer: q.correctAnswer,
    explanation: q.explanation,
  }));
  return new ReadingExercise({
    title: article.title,
    subTitle: `Đọc song ngữ Anh-Việt — ${article.category}`,
    mode: 'bilingual',
    level: article.level,
    levelName: article.level === 1 ? 'Level 1' : 'Level 2',
    levelBadge: article.level === 1 ? 'Lv1' : 'Lv2',
    part: 'Part 7', partNumber: 7,
    articleCategory: article.category,
    readTime: article.readTime,
    isPro: article.level > 1,
    totalQuestions: questions.length,
    questions,
    bilingualArticle: {
      title: article.title,
      badge: article.level === 1 ? 'Lv1' : 'Lv2',
      category: article.category,
      readTime: article.readTime,
      levelText: article.level === 1 ? 'Level 1' : 'Level 2',
      audioUrl: '',
      paragraphs: article.paragraphs.map((p, i) => ({ paragraphNum: i + 1, en: p.en, vi: p.vi })),
      vocabulary: article.vocabulary.map(v => ({ word: v.word, pos: v.pos, ipa: v.ipa, meaning: v.meaning })),
      questions,
    },
  });
}

const articles = [
// ═══════════════════════════════════════════════════
// LEVEL 1 — 15 BÀI (Email, Thông báo, Bài đọc ngắn)
// ═══════════════════════════════════════════════════
{
  level: 1, category: 'E-mail', readTime: '3 phút',
  title: 'Company Picnic Announcement',
  paragraphs: [
    { en: 'Dear All Staff,\n\nWe are pleased to announce that the annual company picnic will be held on Saturday, July 19, from 11:00 A.M. to 4:00 P.M. at Riverside Park. This year\'s event will include a barbecue lunch, outdoor games, and a raffle with exciting prizes.', vi: 'Kính gửi toàn thể nhân viên,\n\nChúng tôi vui mừng thông báo rằng buổi dã ngoại thường niên của công ty sẽ được tổ chức vào thứ Bảy, ngày 19 tháng 7, từ 11:00 SA đến 4:00 CH tại Công viên Riverside. Sự kiện năm nay sẽ bao gồm bữa trưa nướng ngoài trời, các trò chơi và một buổi rút thăm may mắn với các giải thưởng hấp dẫn.' },
    { en: 'All employees and their families are welcome to attend. Please RSVP to hr@company.com by July 12 so we can arrange enough food and activities. Transportation will be provided from the main office, with buses departing at 10:30 A.M.\n\nWe look forward to seeing you there!\n\nHuman Resources Department', vi: 'Tất cả nhân viên và gia đình của họ đều được chào đón tham dự. Vui lòng xác nhận tham dự với hr@company.com trước ngày 12 tháng 7 để chúng tôi có thể sắp xếp đủ thức ăn và các hoạt động. Phương tiện đi lại sẽ được cung cấp từ văn phòng chính, với các xe buýt khởi hành lúc 10:30 SA.\n\nChúng tôi mong gặp bạn ở đó!\n\nPhòng Nhân sự' },
  ],
  vocabulary: [
    { word: 'annual', pos: 'adj', ipa: '/ˈænjuəl/', meaning: 'hằng năm, thường niên' },
    { word: 'raffle', pos: 'n', ipa: '/ˈræfl/', meaning: 'rút thăm may mắn' },
    { word: 'RSVP', pos: 'v', ipa: '/ˌɑːr es viː ˈpiː/', meaning: 'xác nhận tham dự (viết tắt tiếng Pháp)' },
    { word: 'transportation', pos: 'n', ipa: '/ˌtrænspɔːrˈteɪʃn/', meaning: 'phương tiện vận chuyển, đi lại' },
  ],
  questions: [
    { prompt: 'When is the company picnic?', options: [{ label: 'A', text: 'Saturday, July 12', translation: 'Thứ Bảy, ngày 12 tháng 7' }, { label: 'B', text: 'Saturday, July 19', translation: 'Thứ Bảy, ngày 19 tháng 7' }, { label: 'C', text: 'Sunday, July 12', translation: 'Chủ nhật, ngày 12 tháng 7' }, { label: 'D', text: 'Sunday, July 19', translation: 'Chủ nhật, ngày 19 tháng 7' }], correctAnswer: 'B', explanation: '"the annual company picnic will be held on Saturday, July 19" — buổi dã ngoại vào thứ Bảy ngày 19 tháng 7.' },
    { prompt: 'What should employees do by July 12?', options: [{ label: 'A', text: 'Purchase tickets for the event', translation: 'Mua vé cho sự kiện' }, { label: 'B', text: 'Confirm attendance by emailing HR', translation: 'Xác nhận tham dự bằng cách gửi email cho Nhân sự' }, { label: 'C', text: 'Register for bus transportation', translation: 'Đăng ký phương tiện xe buýt' }, { label: 'D', text: 'Submit their food preferences', translation: 'Gửi sở thích thực phẩm của họ' }], correctAnswer: 'B', explanation: '"Please RSVP to hr@company.com by July 12" — cần xác nhận tham dự qua email trước ngày 12 tháng 7.' },
    { prompt: 'What time do the buses depart from the main office?', options: [{ label: 'A', text: '10:00 A.M.', translation: '10:00 SA' }, { label: 'B', text: '10:30 A.M.', translation: '10:30 SA' }, { label: 'C', text: '11:00 A.M.', translation: '11:00 SA' }, { label: 'D', text: '11:30 A.M.', translation: '11:30 SA' }], correctAnswer: 'B', explanation: '"buses departing at 10:30 A.M." — xe buýt khởi hành lúc 10:30 SA.' },
    { prompt: 'Who is invited to attend the picnic?', options: [{ label: 'A', text: 'Only full-time employees', translation: 'Chỉ nhân viên toàn thời gian' }, { label: 'B', text: 'Employees and their families', translation: 'Nhân viên và gia đình của họ' }, { label: 'C', text: 'Managers and senior staff only', translation: 'Chỉ quản lý và nhân viên cấp cao' }, { label: 'D', text: 'Company clients and partners', translation: 'Khách hàng và đối tác của công ty' }], correctAnswer: 'B', explanation: '"All employees and their families are welcome to attend" — tất cả nhân viên và gia đình đều được mời.' },
  ]
},

{
  level: 1, category: 'Notice', readTime: '3 phút',
  title: 'Office Closure Notice',
  paragraphs: [
    { en: 'NOTICE TO ALL STAFF\n\nPlease be advised that our office will be closed on Monday, September 2, in observance of the National Labor Day holiday. Normal business hours will resume on Tuesday, September 3.', vi: 'THÔNG BÁO ĐẾN TOÀN THỂ NHÂN VIÊN\n\nXin lưu ý rằng văn phòng của chúng tôi sẽ đóng cửa vào thứ Hai, ngày 2 tháng 9, để kỷ niệm kỳ nghỉ Ngày Lao Động Quốc Tế. Giờ làm việc bình thường sẽ tiếp tục vào thứ Ba, ngày 3 tháng 9.' },
    { en: 'If you have any urgent matters that require attention before the holiday, please ensure they are completed by 5:00 P.M. on Friday, August 30. For emergency customer inquiries during the closure period, customers may contact our 24-hour support line at 1-800-555-0100.\n\nThank you for your understanding.', vi: 'Nếu bạn có bất kỳ vấn đề khẩn cấp nào cần giải quyết trước kỳ nghỉ, vui lòng đảm bảo chúng được hoàn thành trước 5:00 CH vào thứ Sáu, ngày 30 tháng 8. Đối với các yêu cầu khẩn cấp của khách hàng trong thời gian đóng cửa, khách hàng có thể liên hệ đường dây hỗ trợ 24 giờ của chúng tôi tại 1-800-555-0100.\n\nCảm ơn sự hiểu biết của bạn.' },
  ],
  vocabulary: [
    { word: 'in observance of', pos: 'phrase', ipa: '/ɪn əbˈzɜːrvəns əv/', meaning: 'để kỷ niệm, để tuân thủ (ngày lễ)' },
    { word: 'resume', pos: 'v', ipa: '/rɪˈzjuːm/', meaning: 'tiếp tục lại, nối lại' },
    { word: 'urgent', pos: 'adj', ipa: '/ˈɜːrdʒənt/', meaning: 'khẩn cấp, cấp bách' },
    { word: 'inquiry', pos: 'n', ipa: '/ɪnˈkwaɪri/', meaning: 'câu hỏi, sự hỏi thăm, yêu cầu thông tin' },
  ],
  questions: [
    { prompt: 'Why will the office be closed on September 2?', options: [{ label: 'A', text: 'For a company team-building event', translation: 'Cho một sự kiện xây dựng nhóm của công ty' }, { label: 'B', text: 'For the National Labor Day holiday', translation: 'Cho kỳ nghỉ Ngày Lao Động Quốc Tế' }, { label: 'C', text: 'For building maintenance', translation: 'Để bảo trì tòa nhà' }, { label: 'D', text: 'For a company-wide training day', translation: 'Cho ngày đào tạo toàn công ty' }], correctAnswer: 'B', explanation: '"in observance of the National Labor Day holiday" — đóng cửa để kỷ niệm Ngày Lao Động.' },
    { prompt: 'When will normal business hours resume?', options: [{ label: 'A', text: 'Monday, September 2', translation: 'Thứ Hai, ngày 2 tháng 9' }, { label: 'B', text: 'Tuesday, September 3', translation: 'Thứ Ba, ngày 3 tháng 9' }, { label: 'C', text: 'Wednesday, September 4', translation: 'Thứ Tư, ngày 4 tháng 9' }, { label: 'D', text: 'Friday, August 30', translation: 'Thứ Sáu, ngày 30 tháng 8' }], correctAnswer: 'B', explanation: '"Normal business hours will resume on Tuesday, September 3" — giờ làm việc bình thường tiếp tục vào thứ Ba ngày 3 tháng 9.' },
    { prompt: 'By what time must urgent matters be completed before the holiday?', options: [{ label: 'A', text: '3:00 P.M. on Friday', translation: '3:00 CH vào thứ Sáu' }, { label: 'B', text: '4:00 P.M. on Friday', translation: '4:00 CH vào thứ Sáu' }, { label: 'C', text: '5:00 P.M. on Friday', translation: '5:00 CH vào thứ Sáu' }, { label: 'D', text: '5:00 P.M. on Thursday', translation: '5:00 CH vào thứ Năm' }], correctAnswer: 'C', explanation: '"completed by 5:00 P.M. on Friday, August 30" — hoàn thành trước 5:00 CH thứ Sáu.' },
    { prompt: 'How can customers get emergency help during the closure?', options: [{ label: 'A', text: 'By emailing the support team', translation: 'Bằng cách gửi email cho nhóm hỗ trợ' }, { label: 'B', text: 'By visiting the office in person', translation: 'Bằng cách đến văn phòng trực tiếp' }, { label: 'C', text: 'By calling the 24-hour support line', translation: 'Bằng cách gọi đường dây hỗ trợ 24 giờ' }, { label: 'D', text: 'By waiting until the office reopens', translation: 'Bằng cách đợi đến khi văn phòng mở cửa trở lại' }], correctAnswer: 'C', explanation: '"customers may contact our 24-hour support line" — khách hàng có thể gọi đường dây hỗ trợ 24 giờ.' },
  ]
},

{
  level: 1, category: 'Advertisement', readTime: '3 phút',
  title: 'Grand Opening Sale',
  paragraphs: [
    { en: 'GRAND OPENING CELEBRATION!\nSunflower Home Furniture Store\n123 Main Street, Springfield\n\nWe are thrilled to announce the grand opening of our newest location in Springfield! Join us on Saturday, October 5, and Sunday, October 6, for two days of incredible savings and fun activities.', vi: 'LỄ KHAI TRƯƠNG HOÀNH TRÁNG!\nCửa hàng Nội thất Sunflower Home\n123 Phố Main, Springfield\n\nChúng tôi rất vui mừng thông báo về lễ khai trương địa điểm mới nhất của chúng tôi tại Springfield! Hãy tham gia cùng chúng tôi vào thứ Bảy, ngày 5 tháng 10 và Chủ nhật, ngày 6 tháng 10, để có hai ngày tiết kiệm đáng kinh ngạc và các hoạt động vui vẻ.' },
    { en: 'Enjoy up to 40% off all furniture and home accessories during the opening weekend. The first 50 customers each day will receive a free gift bag worth $30. We will also have live music, refreshments, and a lucky draw every hour.\n\nStore hours: 9:00 A.M. to 8:00 P.M.\nVisit us at www.sunflowerhome.com for more details.', vi: 'Thưởng thức giảm giá lên đến 40% trên tất cả đồ nội thất và phụ kiện gia đình trong cuối tuần khai trương. 50 khách hàng đầu tiên mỗi ngày sẽ nhận được một túi quà miễn phí trị giá 30 đô la. Chúng tôi cũng sẽ có nhạc sống, đồ ăn nhẹ và rút thăm may mắn mỗi giờ.\n\nGiờ mở cửa: 9:00 SA đến 8:00 CH\nTruy cập www.sunflowerhome.com để biết thêm chi tiết.' },
  ],
  vocabulary: [
    { word: 'grand opening', pos: 'n', ipa: '/ɡrænd ˈoʊpənɪŋ/', meaning: 'lễ khai trương hoành tráng' },
    { word: 'accessories', pos: 'n', ipa: '/əkˈsesəriz/', meaning: 'phụ kiện, đồ trang trí' },
    { word: 'refreshments', pos: 'n', ipa: '/rɪˈfreʃmənts/', meaning: 'đồ ăn nhẹ, thức uống nhẹ' },
    { word: 'lucky draw', pos: 'n', ipa: '/ˈlʌki drɔː/', meaning: 'rút thăm may mắn' },
  ],
  questions: [
    { prompt: 'What discount is offered during the opening weekend?', options: [{ label: 'A', text: 'Up to 20% off', translation: 'Giảm đến 20%' }, { label: 'B', text: 'Up to 30% off', translation: 'Giảm đến 30%' }, { label: 'C', text: 'Up to 40% off', translation: 'Giảm đến 40%' }, { label: 'D', text: 'Up to 50% off', translation: 'Giảm đến 50%' }], correctAnswer: 'C', explanation: '"up to 40% off all furniture and home accessories during the opening weekend" — giảm đến 40%.' },
    { prompt: 'What do the first 50 customers each day receive?', options: [{ label: 'A', text: 'A $50 gift card', translation: 'Thẻ quà tặng 50 đô la' }, { label: 'B', text: 'A free gift bag worth $30', translation: 'Một túi quà miễn phí trị giá 30 đô la' }, { label: 'C', text: 'An extra 10% discount', translation: 'Giảm thêm 10%' }, { label: 'D', text: 'Free delivery on their purchases', translation: 'Giao hàng miễn phí cho các mua sắm của họ' }], correctAnswer: 'B', explanation: '"The first 50 customers each day will receive a free gift bag worth $30" — 50 khách đầu tiên nhận túi quà trị giá 30 đô la.' },
    { prompt: 'When is the lucky draw held?', options: [{ label: 'A', text: 'Once a day', translation: 'Một lần mỗi ngày' }, { label: 'B', text: 'Twice a day', translation: 'Hai lần mỗi ngày' }, { label: 'C', text: 'Every hour', translation: 'Mỗi giờ' }, { label: 'D', text: 'At the end of the event', translation: 'Vào cuối sự kiện' }], correctAnswer: 'C', explanation: '"a lucky draw every hour" — rút thăm may mắn mỗi giờ.' },
    { prompt: 'What are the store hours during the opening?', options: [{ label: 'A', text: '8:00 A.M. to 9:00 P.M.', translation: '8:00 SA đến 9:00 CH' }, { label: 'B', text: '9:00 A.M. to 8:00 P.M.', translation: '9:00 SA đến 8:00 CH' }, { label: 'C', text: '10:00 A.M. to 8:00 P.M.', translation: '10:00 SA đến 8:00 CH' }, { label: 'D', text: '9:00 A.M. to 6:00 P.M.', translation: '9:00 SA đến 6:00 CH' }], correctAnswer: 'B', explanation: '"Store hours: 9:00 A.M. to 8:00 P.M." — giờ mở cửa từ 9:00 SA đến 8:00 CH.' },
  ]
},

{
  level: 1, category: 'Memo', readTime: '3 phút',
  title: 'Updated Office Hours',
  paragraphs: [
    { en: 'TO: All Employees\nFROM: Office Management\nSUBJECT: New Office Hours Starting September 1\n\nStarting September 1, our office hours will change to 8:00 A.M. to 5:00 P.M., Monday through Friday. Previously, the office opened at 9:00 A.M.', vi: 'GỬI: Toàn thể nhân viên\nTỪ: Ban Quản lý Văn phòng\nCHỦ ĐỀ: Giờ làm việc mới bắt đầu từ ngày 1 tháng 9\n\nBắt đầu từ ngày 1 tháng 9, giờ làm việc của văn phòng chúng tôi sẽ thay đổi thành 8:00 SA đến 5:00 CH, từ thứ Hai đến thứ Sáu. Trước đây, văn phòng mở cửa lúc 9:00 SA.' },
    { en: 'This change is being made to better serve our clients on the East Coast, who are in an earlier time zone. The lunch break will remain from 12:00 P.M. to 1:00 P.M.\n\nIf you have any concerns about this schedule change, please speak to your direct manager by August 25.\n\nThank you for your cooperation.', vi: 'Thay đổi này được thực hiện để phục vụ tốt hơn các khách hàng của chúng tôi ở Bờ Đông, những người đang ở múi giờ sớm hơn. Giờ nghỉ trưa sẽ vẫn là từ 12:00 CH đến 1:00 CH.\n\nNếu bạn có bất kỳ lo ngại nào về thay đổi lịch trình này, vui lòng nói chuyện với quản lý trực tiếp của bạn trước ngày 25 tháng 8.\n\nCảm ơn sự hợp tác của bạn.' },
  ],
  vocabulary: [
    { word: 'time zone', pos: 'n', ipa: '/taɪm zoʊn/', meaning: 'múi giờ' },
    { word: 'direct manager', pos: 'n', ipa: '/dɪˈrekt ˈmænɪdʒər/', meaning: 'quản lý trực tiếp' },
    { word: 'cooperation', pos: 'n', ipa: '/koʊˌɒpəˈreɪʃn/', meaning: 'sự hợp tác' },
    { word: 'concern', pos: 'n', ipa: '/kənˈsɜːrn/', meaning: 'lo ngại, mối quan tâm' },
  ],
  questions: [
    { prompt: 'What are the new office hours?', options: [{ label: 'A', text: '8:00 A.M. to 4:00 P.M.', translation: '8:00 SA đến 4:00 CH' }, { label: 'B', text: '8:00 A.M. to 5:00 P.M.', translation: '8:00 SA đến 5:00 CH' }, { label: 'C', text: '9:00 A.M. to 5:00 P.M.', translation: '9:00 SA đến 5:00 CH' }, { label: 'D', text: '9:00 A.M. to 6:00 P.M.', translation: '9:00 SA đến 6:00 CH' }], correctAnswer: 'B', explanation: '"our office hours will change to 8:00 A.M. to 5:00 P.M." — giờ làm việc mới là 8:00 SA đến 5:00 CH.' },
    { prompt: 'What was the previous opening time?', options: [{ label: 'A', text: '7:00 A.M.', translation: '7:00 SA' }, { label: 'B', text: '8:00 A.M.', translation: '8:00 SA' }, { label: 'C', text: '9:00 A.M.', translation: '9:00 SA' }, { label: 'D', text: '10:00 A.M.', translation: '10:00 SA' }], correctAnswer: 'C', explanation: '"Previously, the office opened at 9:00 A.M." — giờ mở cửa trước đây là 9:00 SA.' },
    { prompt: 'Why is the office changing its hours?', options: [{ label: 'A', text: 'To reduce energy costs', translation: 'Để giảm chi phí điện' }, { label: 'B', text: 'To better serve East Coast clients', translation: 'Để phục vụ tốt hơn các khách hàng Bờ Đông' }, { label: 'C', text: 'Due to government regulations', translation: 'Do quy định của chính phủ' }, { label: 'D', text: 'To match competitor schedules', translation: 'Để phù hợp với lịch trình của đối thủ cạnh tranh' }], correctAnswer: 'B', explanation: '"to better serve our clients on the East Coast" — để phục vụ tốt hơn khách hàng Bờ Đông.' },
    { prompt: 'When is the deadline to raise concerns about the schedule change?', options: [{ label: 'A', text: 'August 20', translation: 'Ngày 20 tháng 8' }, { label: 'B', text: 'August 25', translation: 'Ngày 25 tháng 8' }, { label: 'C', text: 'September 1', translation: 'Ngày 1 tháng 9' }, { label: 'D', text: 'September 5', translation: 'Ngày 5 tháng 9' }], correctAnswer: 'B', explanation: '"please speak to your direct manager by August 25" — hạn cuối phản hồi lo ngại là ngày 25 tháng 8.' },
  ]
},

{
  level: 1, category: 'E-mail', readTime: '3 phút',
  title: 'Order Confirmation',
  paragraphs: [
    { en: 'Dear Ms. Nguyen,\n\nThank you for your order! Your order #8847291 has been confirmed. You ordered 3 boxes of Premium Printer Paper (A4, 500 sheets each) and 2 Wireless Keyboards (Model KX-200).\n\nOrder Total: $127.50\nExpected Delivery: 3 to 5 business days', vi: 'Kính gửi bà Nguyen,\n\nCảm ơn bạn đã đặt hàng! Đơn hàng #8847291 của bạn đã được xác nhận. Bạn đã đặt 3 hộp Giấy In Cao cấp (A4, 500 tờ mỗi hộp) và 2 Bàn phím Không dây (Model KX-200).\n\nTổng đơn hàng: 127,50 đô la\nDự kiến giao hàng: 3 đến 5 ngày làm việc' },
    { en: 'Your items will be shipped to: 45 Oak Street, Dallas, TX 75201.\n\nIf you need to make any changes to your order, please contact us within 24 hours at orders@officesupply.com or 1-888-234-5678. After this time, we cannot guarantee changes can be made.\n\nThank you for shopping with us!\nOffice Supply Co.', vi: 'Các mặt hàng của bạn sẽ được giao đến: 45 Đường Oak, Dallas, TX 75201.\n\nNếu bạn cần thay đổi đơn hàng, vui lòng liên hệ với chúng tôi trong vòng 24 giờ tại orders@officesupply.com hoặc 1-888-234-5678. Sau thời gian này, chúng tôi không thể đảm bảo các thay đổi có thể được thực hiện.\n\nCảm ơn bạn đã mua sắm cùng chúng tôi!\nOffice Supply Co.' },
  ],
  vocabulary: [
    { word: 'confirmed', pos: 'adj', ipa: '/kənˈfɜːrmd/', meaning: 'đã được xác nhận' },
    { word: 'business days', pos: 'n', ipa: '/ˈbɪznəs deɪz/', meaning: 'ngày làm việc (không tính thứ Bảy, Chủ nhật)' },
    { word: 'shipped', pos: 'v', ipa: '/ʃɪpt/', meaning: 'được vận chuyển, được giao hàng' },
    { word: 'guarantee', pos: 'v', ipa: '/ˌɡærənˈtiː/', meaning: 'đảm bảo, cam kết' },
  ],
  questions: [
    { prompt: 'What is the order number?', options: [{ label: 'A', text: '#8847219', translation: '#8847219' }, { label: 'B', text: '#8847291', translation: '#8847291' }, { label: 'C', text: '#8874291', translation: '#8874291' }, { label: 'D', text: '#8847921', translation: '#8847921' }], correctAnswer: 'B', explanation: '"Your order #8847291 has been confirmed" — số đơn hàng là #8847291.' },
    { prompt: 'How many wireless keyboards were ordered?', options: [{ label: 'A', text: 'One', translation: 'Một' }, { label: 'B', text: 'Two', translation: 'Hai' }, { label: 'C', text: 'Three', translation: 'Ba' }, { label: 'D', text: 'Five', translation: 'Năm' }], correctAnswer: 'B', explanation: '"2 Wireless Keyboards" — hai bàn phím không dây được đặt.' },
    { prompt: 'What is the expected delivery time?', options: [{ label: 'A', text: '1 to 2 business days', translation: '1 đến 2 ngày làm việc' }, { label: 'B', text: '2 to 3 business days', translation: '2 đến 3 ngày làm việc' }, { label: 'C', text: '3 to 5 business days', translation: '3 đến 5 ngày làm việc' }, { label: 'D', text: '5 to 7 business days', translation: '5 đến 7 ngày làm việc' }], correctAnswer: 'C', explanation: '"Expected Delivery: 3 to 5 business days" — giao hàng dự kiến 3 đến 5 ngày làm việc.' },
    { prompt: 'How long does the customer have to make changes to the order?', options: [{ label: 'A', text: '12 hours', translation: '12 giờ' }, { label: 'B', text: '24 hours', translation: '24 giờ' }, { label: 'C', text: '48 hours', translation: '48 giờ' }, { label: 'D', text: '72 hours', translation: '72 giờ' }], correctAnswer: 'B', explanation: '"please contact us within 24 hours" — có 24 giờ để thay đổi đơn hàng.' },
  ]
},

{
  level: 1, category: 'Notice', readTime: '3 phút',
  title: 'Parking Lot Maintenance',
  paragraphs: [
    { en: 'NOTICE: PARKING LOT CLOSURE\n\nThe south parking lot will be closed for resurfacing on Wednesday, May 14, and Thursday, May 15. During this time, employees are encouraged to use the north parking lot, which has 200 additional spaces available.', vi: 'THÔNG BÁO: ĐÓNG CỬA BÃI ĐỖ XE\n\nBãi đỗ xe phía nam sẽ đóng cửa để tái bề mặt vào thứ Tư, ngày 14 tháng 5 và thứ Năm, ngày 15 tháng 5. Trong thời gian này, nhân viên được khuyến khích sử dụng bãi đỗ xe phía bắc, có thêm 200 chỗ đỗ xe.' },
    { en: 'Street parking is also available on Elm Street and Oak Avenue without time limits during these dates. The south lot will reopen on Friday, May 16, at 7:00 A.M.\n\nWe apologize for any inconvenience. Please contact the Facilities team at ext. 4400 if you have questions.', vi: 'Đỗ xe đường phố cũng có thể sử dụng trên Phố Elm và Đại lộ Oak mà không giới hạn thời gian trong những ngày này. Bãi đỗ xe phía nam sẽ mở cửa trở lại vào thứ Sáu, ngày 16 tháng 5 lúc 7:00 SA.\n\nChúng tôi xin lỗi vì bất kỳ sự bất tiện nào. Vui lòng liên hệ nhóm Cơ sở vật chất theo số nội bộ 4400 nếu có câu hỏi.' },
  ],
  vocabulary: [
    { word: 'resurfacing', pos: 'n', ipa: '/ˌriːˈsɜːrfɪsɪŋ/', meaning: 'tái bề mặt, trải lại mặt đường' },
    { word: 'encouraged', pos: 'adj', ipa: '/ɪnˈkɜːrɪdʒd/', meaning: 'được khuyến khích' },
    { word: 'time limit', pos: 'n', ipa: '/taɪm ˈlɪmɪt/', meaning: 'giới hạn thời gian' },
    { word: 'facilities', pos: 'n', ipa: '/fəˈsɪlɪtiz/', meaning: 'cơ sở vật chất, tiện nghi' },
  ],
  questions: [
    { prompt: 'Which parking lot will be closed?', options: [{ label: 'A', text: 'The north parking lot', translation: 'Bãi đỗ xe phía bắc' }, { label: 'B', text: 'The south parking lot', translation: 'Bãi đỗ xe phía nam' }, { label: 'C', text: 'The east parking lot', translation: 'Bãi đỗ xe phía đông' }, { label: 'D', text: 'The west parking lot', translation: 'Bãi đỗ xe phía tây' }], correctAnswer: 'B', explanation: '"The south parking lot will be closed for resurfacing" — bãi đỗ xe phía nam sẽ đóng cửa.' },
    { prompt: 'How many additional spaces are available in the north lot?', options: [{ label: 'A', text: '100', translation: '100' }, { label: 'B', text: '150', translation: '150' }, { label: 'C', text: '200', translation: '200' }, { label: 'D', text: '250', translation: '250' }], correctAnswer: 'C', explanation: '"the north parking lot, which has 200 additional spaces available" — 200 chỗ bổ sung ở phía bắc.' },
    { prompt: 'When will the south parking lot reopen?', options: [{ label: 'A', text: 'Thursday, May 15', translation: 'Thứ Năm, ngày 15 tháng 5' }, { label: 'B', text: 'Friday, May 16', translation: 'Thứ Sáu, ngày 16 tháng 5' }, { label: 'C', text: 'Saturday, May 17', translation: 'Thứ Bảy, ngày 17 tháng 5' }, { label: 'D', text: 'Monday, May 19', translation: 'Thứ Hai, ngày 19 tháng 5' }], correctAnswer: 'B', explanation: '"The south lot will reopen on Friday, May 16" — bãi đỗ xe phía nam mở lại thứ Sáu ngày 16 tháng 5.' },
    { prompt: 'Where else can employees park during the closure?', options: [{ label: 'A', text: 'Only in the north parking lot', translation: 'Chỉ ở bãi đỗ xe phía bắc' }, { label: 'B', text: 'On Elm Street and Oak Avenue', translation: 'Trên Phố Elm và Đại lộ Oak' }, { label: 'C', text: 'In a nearby shopping center', translation: 'Ở một trung tâm mua sắm gần đó' }, { label: 'D', text: 'No alternative parking is available', translation: 'Không có bãi đỗ xe thay thế nào' }], correctAnswer: 'B', explanation: '"Street parking is also available on Elm Street and Oak Avenue" — có thể đỗ trên Phố Elm và Đại lộ Oak.' },
  ]
},

{
  level: 1, category: 'E-mail', readTime: '3 phút',
  title: 'Meeting Room Booking Confirmation',
  paragraphs: [
    { en: 'Dear Mr. Park,\n\nThis is a confirmation that Meeting Room B (3rd Floor) has been reserved for you on Thursday, June 6, from 2:00 P.M. to 4:00 P.M. The room can accommodate up to 12 people and is equipped with a projector, whiteboard, and video conferencing system.', vi: 'Kính gửi ông Park,\n\nĐây là xác nhận rằng Phòng họp B (Tầng 3) đã được đặt trước cho bạn vào thứ Năm, ngày 6 tháng 6, từ 2:00 CH đến 4:00 CH. Phòng có thể chứa tối đa 12 người và được trang bị máy chiếu, bảng trắng và hệ thống hội nghị video.' },
    { en: 'Please note that food and beverages are not allowed inside the meeting rooms. If you need catering services, please contact the Cafeteria at ext. 2200 at least two hours before your meeting.\n\nTo cancel or change your booking, please visit the Room Booking System at http://rooms.company.com or call the Facilities Desk at ext. 4000.\n\nBest regards,\nFacilities Management', vi: 'Xin lưu ý rằng thức ăn và đồ uống không được phép trong các phòng họp. Nếu bạn cần dịch vụ phục vụ ăn uống, vui lòng liên hệ với Căng tin theo số nội bộ 2200 ít nhất hai giờ trước cuộc họp của bạn.\n\nĐể hủy hoặc thay đổi đặt phòng của bạn, vui lòng truy cập Hệ thống Đặt phòng tại http://rooms.company.com hoặc gọi Bàn Cơ sở vật chất theo số nội bộ 4000.\n\nTrân trọng,\nQuản lý Cơ sở vật chất' },
  ],
  vocabulary: [
    { word: 'accommodate', pos: 'v', ipa: '/əˈkɒmədeɪt/', meaning: 'chứa đựng, cung cấp chỗ cho' },
    { word: 'equipped with', pos: 'phrase', ipa: '/ɪˈkwɪpt wɪð/', meaning: 'được trang bị, có sẵn' },
    { word: 'catering', pos: 'n', ipa: '/ˈkeɪtərɪŋ/', meaning: 'dịch vụ ăn uống, phục vụ tiệc' },
    { word: 'booking', pos: 'n', ipa: '/ˈbʊkɪŋ/', meaning: 'sự đặt trước, đặt phòng/chỗ' },
  ],
  questions: [
    { prompt: 'Which meeting room was reserved?', options: [{ label: 'A', text: 'Meeting Room A', translation: 'Phòng họp A' }, { label: 'B', text: 'Meeting Room B', translation: 'Phòng họp B' }, { label: 'C', text: 'Meeting Room C', translation: 'Phòng họp C' }, { label: 'D', text: 'Meeting Room D', translation: 'Phòng họp D' }], correctAnswer: 'B', explanation: '"Meeting Room B (3rd Floor) has been reserved for you" — Phòng họp B đã được đặt.' },
    { prompt: 'How many people can the room accommodate?', options: [{ label: 'A', text: 'Up to 8 people', translation: 'Tối đa 8 người' }, { label: 'B', text: 'Up to 10 people', translation: 'Tối đa 10 người' }, { label: 'C', text: 'Up to 12 people', translation: 'Tối đa 12 người' }, { label: 'D', text: 'Up to 15 people', translation: 'Tối đa 15 người' }], correctAnswer: 'C', explanation: '"The room can accommodate up to 12 people" — phòng chứa tối đa 12 người.' },
    { prompt: 'What is NOT allowed inside meeting rooms?', options: [{ label: 'A', text: 'Electronic devices', translation: 'Thiết bị điện tử' }, { label: 'B', text: 'Food and beverages', translation: 'Thức ăn và đồ uống' }, { label: 'C', text: 'Personal laptops', translation: 'Laptop cá nhân' }, { label: 'D', text: 'External guests', translation: 'Khách bên ngoài' }], correctAnswer: 'B', explanation: '"food and beverages are not allowed inside the meeting rooms" — thức ăn và đồ uống không được phép.' },
    { prompt: 'How far in advance must catering be ordered?', options: [{ label: 'A', text: 'At least one hour', translation: 'Ít nhất một giờ' }, { label: 'B', text: 'At least two hours', translation: 'Ít nhất hai giờ' }, { label: 'C', text: 'At least one day', translation: 'Ít nhất một ngày' }, { label: 'D', text: 'At least two days', translation: 'Ít nhất hai ngày' }], correctAnswer: 'B', explanation: '"at least two hours before your meeting" — đặt dịch vụ ăn uống ít nhất hai giờ trước cuộc họp.' },
  ]
},

{
  level: 1, category: 'Article', readTime: '3 phút',
  title: 'New Library Opens in Town',
  paragraphs: [
    { en: 'The Greenfield Public Library officially opened its doors on Friday to great excitement from local residents. The new three-story building on River Road replaces the old library, which had been operating in a smaller location since 1985. The new facility is more than three times larger than the original.', vi: 'Thư viện Công cộng Greenfield đã chính thức mở cửa vào thứ Sáu với sự hào hứng lớn từ cư dân địa phương. Tòa nhà ba tầng mới trên Đường River thay thế thư viện cũ, vốn đã hoạt động ở một địa điểm nhỏ hơn từ năm 1985. Cơ sở mới lớn hơn gấp ba lần so với thư viện ban đầu.' },
    { en: 'The new library features a children\'s section with a dedicated storytelling room, a quiet study area with 80 computer workstations, a community meeting room, and a café. It holds over 120,000 books, DVDs, and digital media. Library cards are free for all town residents. For information, visit www.greenfieldlibrary.org.', vi: 'Thư viện mới có khu vực thiếu nhi với phòng kể chuyện riêng, khu vực học yên tĩnh với 80 máy tính, phòng họp cộng đồng và một quán cà phê. Thư viện lưu trữ hơn 120.000 sách, đĩa DVD và phương tiện kỹ thuật số. Thẻ thư viện miễn phí cho tất cả cư dân trong thị trấn. Để biết thêm thông tin, truy cập www.greenfieldlibrary.org.' },
  ],
  vocabulary: [
    { word: 'officially', pos: 'adv', ipa: '/əˈfɪʃəli/', meaning: 'chính thức, một cách chính thức' },
    { word: 'replaces', pos: 'v', ipa: '/rɪˈpleɪsɪz/', meaning: 'thay thế' },
    { word: 'facility', pos: 'n', ipa: '/fəˈsɪlɪti/', meaning: 'cơ sở, tòa nhà (có dịch vụ)' },
    { word: 'workstation', pos: 'n', ipa: '/ˈwɜːrksteɪʃn/', meaning: 'trạm làm việc, chỗ ngồi có máy tính' },
  ],
  questions: [
    { prompt: 'Where is the new library located?', options: [{ label: 'A', text: 'On Oak Street', translation: 'Trên Phố Oak' }, { label: 'B', text: 'On River Road', translation: 'Trên Đường River' }, { label: 'C', text: 'On Main Avenue', translation: 'Trên Đại lộ Main' }, { label: 'D', text: 'On Park Boulevard', translation: 'Trên Đại lộ Park' }], correctAnswer: 'B', explanation: '"The new three-story building on River Road" — thư viện nằm trên Đường River.' },
    { prompt: 'How many computer workstations are in the quiet study area?', options: [{ label: 'A', text: '40', translation: '40' }, { label: 'B', text: '60', translation: '60' }, { label: 'C', text: '80', translation: '80' }, { label: 'D', text: '120', translation: '120' }], correctAnswer: 'C', explanation: '"a quiet study area with 80 computer workstations" — 80 trạm máy tính trong khu học yên tĩnh.' },
    { prompt: 'How much does a library card cost for town residents?', options: [{ label: 'A', text: '$5 per year', translation: '5 đô la mỗi năm' }, { label: 'B', text: '$10 per year', translation: '10 đô la mỗi năm' }, { label: 'C', text: 'It depends on age', translation: 'Phụ thuộc vào độ tuổi' }, { label: 'D', text: 'It is free', translation: 'Miễn phí' }], correctAnswer: 'D', explanation: '"Library cards are free for all town residents" — thẻ thư viện miễn phí cho cư dân.' },
    { prompt: 'How much larger is the new library compared to the original?', options: [{ label: 'A', text: 'Twice as large', translation: 'Lớn gấp đôi' }, { label: 'B', text: 'Three times larger', translation: 'Lớn gấp ba lần' }, { label: 'C', text: 'Four times larger', translation: 'Lớn gấp bốn lần' }, { label: 'D', text: 'Five times larger', translation: 'Lớn gấp năm lần' }], correctAnswer: 'B', explanation: '"more than three times larger than the original" — lớn hơn gấp ba lần.' },
  ]
},

{
  level: 1, category: 'E-mail', readTime: '3 phút',
  title: 'Training Workshop Registration',
  paragraphs: [
    { en: 'Dear Team,\n\nWe are pleased to offer a free professional development workshop next month. The session, titled "Effective Business Communication," will be held on Friday, March 14, from 9:00 A.M. to 12:00 P.M. in Conference Room 1. The workshop will cover writing professional emails, giving presentations, and handling difficult conversations.', vi: 'Kính gửi Đội nhóm,\n\nChúng tôi vui mừng cung cấp một hội thảo phát triển nghề nghiệp miễn phí vào tháng tới. Buổi học, có tựa đề "Giao tiếp Kinh doanh Hiệu quả," sẽ được tổ chức vào thứ Sáu, ngày 14 tháng 3, từ 9:00 SA đến 12:00 trưa tại Phòng Hội nghị 1. Hội thảo sẽ bao gồm viết email chuyên nghiệp, thuyết trình và xử lý các cuộc trò chuyện khó khăn.' },
    { en: 'Space is limited to 20 participants on a first-come, first-served basis. To register, please email training@company.com with your name and department by February 28. Attendance certificates will be provided to all who complete the workshop.\n\nWe encourage everyone to take advantage of this opportunity.\n\nTraining & Development Team', vi: 'Chỗ ngồi giới hạn 20 người tham gia theo nguyên tắc đến trước phục vụ trước. Để đăng ký, vui lòng gửi email đến training@company.com với tên và phòng ban của bạn trước ngày 28 tháng 2. Chứng chỉ tham dự sẽ được cấp cho tất cả những ai hoàn thành hội thảo.\n\nChúng tôi khuyến khích mọi người tận dụng cơ hội này.\n\nĐội Đào tạo & Phát triển' },
  ],
  vocabulary: [
    { word: 'professional development', pos: 'n', ipa: '/prəˈfeʃənl dɪˈveləpmənt/', meaning: 'phát triển nghề nghiệp, phát triển chuyên môn' },
    { word: 'first-come, first-served', pos: 'phrase', ipa: '/fɜːrst kʌm fɜːrst sɜːrvd/', meaning: 'đến trước phục vụ trước' },
    { word: 'certificate', pos: 'n', ipa: '/sərˈtɪfɪkət/', meaning: 'chứng chỉ, chứng nhận' },
    { word: 'take advantage of', pos: 'phrase', ipa: '/teɪk ədˈvɑːntɪdʒ əv/', meaning: 'tận dụng, tranh thủ' },
  ],
  questions: [
    { prompt: 'What is the workshop topic?', options: [{ label: 'A', text: 'Business accounting and finance', translation: 'Kế toán và tài chính kinh doanh' }, { label: 'B', text: 'Effective Business Communication', translation: 'Giao tiếp Kinh doanh Hiệu quả' }, { label: 'C', text: 'Leadership and team management', translation: 'Lãnh đạo và quản lý nhóm' }, { label: 'D', text: 'Customer service excellence', translation: 'Dịch vụ khách hàng xuất sắc' }], correctAnswer: 'B', explanation: '"titled \'Effective Business Communication\'" — tên hội thảo là "Giao tiếp Kinh doanh Hiệu quả".' },
    { prompt: 'How many participants can attend?', options: [{ label: 'A', text: '10', translation: '10' }, { label: 'B', text: '15', translation: '15' }, { label: 'C', text: '20', translation: '20' }, { label: 'D', text: '25', translation: '25' }], correctAnswer: 'C', explanation: '"Space is limited to 20 participants" — giới hạn 20 người tham gia.' },
    { prompt: 'What is the registration deadline?', options: [{ label: 'A', text: 'February 14', translation: 'Ngày 14 tháng 2' }, { label: 'B', text: 'February 28', translation: 'Ngày 28 tháng 2' }, { label: 'C', text: 'March 7', translation: 'Ngày 7 tháng 3' }, { label: 'D', text: 'March 14', translation: 'Ngày 14 tháng 3' }], correctAnswer: 'B', explanation: '"by February 28" — hạn đăng ký là ngày 28 tháng 2.' },
    { prompt: 'What do participants receive upon completing the workshop?', options: [{ label: 'A', text: 'A cash bonus', translation: 'Tiền thưởng' }, { label: 'B', text: 'A free lunch', translation: 'Bữa trưa miễn phí' }, { label: 'C', text: 'An attendance certificate', translation: 'Chứng chỉ tham dự' }, { label: 'D', text: 'A day off work', translation: 'Một ngày nghỉ làm' }], correctAnswer: 'C', explanation: '"Attendance certificates will be provided to all who complete the workshop" — nhận chứng chỉ tham dự khi hoàn thành.' },
  ]
},

{
  level: 1, category: 'Notice', readTime: '3 phút',
  title: 'Subscription Renewal Reminder',
  paragraphs: [
    { en: 'Dear Subscriber,\n\nThis is a friendly reminder that your annual subscription to TechNews Magazine will expire on October 31. To ensure you continue receiving your monthly issues without interruption, please renew your subscription before this date.\n\nYou can renew online at www.technewsmag.com/renew or by calling our customer service line at 1-800-456-7890.', vi: 'Kính gửi Người đăng ký,\n\nĐây là lời nhắc nhở thân thiện rằng đăng ký hàng năm của bạn với TechNews Magazine sẽ hết hạn vào ngày 31 tháng 10. Để đảm bảo bạn tiếp tục nhận được các số hàng tháng mà không bị gián đoạn, vui lòng gia hạn đăng ký của bạn trước ngày này.\n\nBạn có thể gia hạn trực tuyến tại www.technewsmag.com/renew hoặc bằng cách gọi đường dây dịch vụ khách hàng của chúng tôi tại 1-800-456-7890.' },
    { en: 'Renew before October 15 and receive a 15% early renewal discount! You can choose from three subscription plans:\n• Basic (Digital only): $49/year\n• Standard (Print + Digital): $79/year\n• Premium (Print + Digital + Archive Access): $99/year\n\nThank you for being a valued subscriber!\nTechNews Magazine', vi: 'Gia hạn trước ngày 15 tháng 10 và nhận chiết khấu gia hạn sớm 15%! Bạn có thể chọn từ ba gói đăng ký:\n• Cơ bản (Chỉ kỹ thuật số): 49 đô la/năm\n• Tiêu chuẩn (Bản in + Kỹ thuật số): 79 đô la/năm\n• Cao cấp (Bản in + Kỹ thuật số + Quyền truy cập Kho lưu trữ): 99 đô la/năm\n\nCảm ơn bạn đã là người đăng ký có giá trị!\nTechNews Magazine' },
  ],
  vocabulary: [
    { word: 'subscription', pos: 'n', ipa: '/səbˈskrɪpʃn/', meaning: 'đăng ký (báo, tạp chí, dịch vụ...)' },
    { word: 'interruption', pos: 'n', ipa: '/ˌɪntəˈrʌpʃn/', meaning: 'sự gián đoạn, sự ngắt quãng' },
    { word: 'renewal', pos: 'n', ipa: '/rɪˈnjuːəl/', meaning: 'sự gia hạn' },
    { word: 'archive', pos: 'n', ipa: '/ˈɑːrkaɪv/', meaning: 'kho lưu trữ, tài liệu lưu trữ' },
  ],
  questions: [
    { prompt: 'When does the subscription expire?', options: [{ label: 'A', text: 'October 15', translation: 'Ngày 15 tháng 10' }, { label: 'B', text: 'October 31', translation: 'Ngày 31 tháng 10' }, { label: 'C', text: 'November 1', translation: 'Ngày 1 tháng 11' }, { label: 'D', text: 'November 15', translation: 'Ngày 15 tháng 11' }], correctAnswer: 'B', explanation: '"your annual subscription...will expire on October 31" — đăng ký hết hạn ngày 31 tháng 10.' },
    { prompt: 'What discount is offered for early renewal?', options: [{ label: 'A', text: '10%', translation: '10%' }, { label: 'B', text: '12%', translation: '12%' }, { label: 'C', text: '15%', translation: '15%' }, { label: 'D', text: '20%', translation: '20%' }], correctAnswer: 'C', explanation: '"receive a 15% early renewal discount" — chiết khấu gia hạn sớm 15%.' },
    { prompt: 'What does the Standard plan include?', options: [{ label: 'A', text: 'Digital only', translation: 'Chỉ kỹ thuật số' }, { label: 'B', text: 'Print and Digital', translation: 'Bản in và kỹ thuật số' }, { label: 'C', text: 'Print, Digital, and Archive Access', translation: 'Bản in, kỹ thuật số và quyền truy cập kho lưu trữ' }, { label: 'D', text: 'Digital and Archive Access only', translation: 'Chỉ kỹ thuật số và quyền truy cập kho lưu trữ' }], correctAnswer: 'B', explanation: '"Standard (Print + Digital): $79/year" — gói Tiêu chuẩn bao gồm bản in và kỹ thuật số.' },
    { prompt: 'How much does the Premium plan cost?', options: [{ label: 'A', text: '$49/year', translation: '49 đô la/năm' }, { label: 'B', text: '$79/year', translation: '79 đô la/năm' }, { label: 'C', text: '$89/year', translation: '89 đô la/năm' }, { label: 'D', text: '$99/year', translation: '99 đô la/năm' }], correctAnswer: 'D', explanation: '"Premium (Print + Digital + Archive Access): $99/year" — gói cao cấp là 99 đô la/năm.' },
  ]
},

{
  level: 1, category: 'E-mail', readTime: '3 phút',
  title: 'Hotel Reservation Confirmation',
  paragraphs: [
    { en: 'Dear Mr. Johnson,\n\nThank you for choosing the Grand Pacific Hotel. We are pleased to confirm your reservation:\n\nGuest Name: Robert Johnson\nCheck-in: Friday, August 8\nCheck-out: Sunday, August 10\nRoom Type: Deluxe King Room (Non-smoking)\nTotal: $298.00 (includes taxes and fees)', vi: 'Kính gửi ông Johnson,\n\nCảm ơn bạn đã chọn Grand Pacific Hotel. Chúng tôi vui mừng xác nhận đặt phòng của bạn:\n\nTên khách: Robert Johnson\nNhận phòng: Thứ Sáu, ngày 8 tháng 8\nTrả phòng: Chủ nhật, ngày 10 tháng 8\nLoại phòng: Phòng King Deluxe (Không hút thuốc)\nTổng cộng: 298,00 đô la (bao gồm thuế và phí)' },
    { en: 'Check-in time is 3:00 P.M. Early check-in may be available upon request and subject to availability. Check-out time is 12:00 P.M. Late check-out is available for an additional $50.\n\nFree parking is available on-site. To cancel, contact us at least 48 hours in advance to avoid a one-night charge. We look forward to welcoming you!\n\nGrand Pacific Hotel', vi: 'Thời gian nhận phòng là 3:00 CH. Nhận phòng sớm có thể được thực hiện theo yêu cầu và tùy thuộc vào tình trạng phòng. Thời gian trả phòng là 12:00 trưa. Trả phòng muộn có sẵn với phí thêm 50 đô la.\n\nĐỗ xe miễn phí tại chỗ. Để hủy, liên hệ với chúng tôi ít nhất 48 giờ trước để tránh tính phí một đêm. Chúng tôi mong chờ được chào đón bạn!\n\nGrand Pacific Hotel' },
  ],
  vocabulary: [
    { word: 'reservation', pos: 'n', ipa: '/ˌrezərˈveɪʃn/', meaning: 'đặt phòng/chỗ trước' },
    { word: 'subject to availability', pos: 'phrase', ipa: '/ˈsʌbdʒɪkt tuː əˌveɪləˈbɪlɪti/', meaning: 'tùy thuộc vào tình trạng có sẵn' },
    { word: 'on-site', pos: 'adj', ipa: '/ɒn saɪt/', meaning: 'tại chỗ, trong khuôn viên' },
    { word: 'in advance', pos: 'phrase', ipa: '/ɪn ədˈvɑːns/', meaning: 'trước, trước đó' },
  ],
  questions: [
    { prompt: 'What type of room is reserved?', options: [{ label: 'A', text: 'Standard King Room', translation: 'Phòng King Tiêu chuẩn' }, { label: 'B', text: 'Deluxe King Room', translation: 'Phòng King Deluxe' }, { label: 'C', text: 'Deluxe Twin Room', translation: 'Phòng Twin Deluxe' }, { label: 'D', text: 'Suite Room', translation: 'Phòng Suite' }], correctAnswer: 'B', explanation: '"Deluxe King Room (Non-smoking)" — phòng được đặt là Phòng King Deluxe.' },
    { prompt: 'What is the check-out time?', options: [{ label: 'A', text: '10:00 A.M.', translation: '10:00 SA' }, { label: 'B', text: '11:00 A.M.', translation: '11:00 SA' }, { label: 'C', text: '12:00 P.M.', translation: '12:00 trưa' }, { label: 'D', text: '1:00 P.M.', translation: '1:00 CH' }], correctAnswer: 'C', explanation: '"Check-out time is 12:00 P.M." — thời gian trả phòng là 12:00 trưa.' },
    { prompt: 'How much does a late check-out cost?', options: [{ label: 'A', text: '$25', translation: '25 đô la' }, { label: 'B', text: '$30', translation: '30 đô la' }, { label: 'C', text: '$50', translation: '50 đô la' }, { label: 'D', text: '$75', translation: '75 đô la' }], correctAnswer: 'C', explanation: '"Late check-out is available for an additional $50" — trả phòng muộn tốn thêm 50 đô la.' },
    { prompt: 'How early must the guest cancel to avoid charges?', options: [{ label: 'A', text: '24 hours in advance', translation: '24 giờ trước' }, { label: 'B', text: '48 hours in advance', translation: '48 giờ trước' }, { label: 'C', text: '72 hours in advance', translation: '72 giờ trước' }, { label: 'D', text: 'One week in advance', translation: 'Một tuần trước' }], correctAnswer: 'B', explanation: '"contact us at least 48 hours in advance to avoid a one-night charge" — cần hủy ít nhất 48 giờ trước.' },
  ]
},

{
  level: 1, category: 'Article', readTime: '3 phút',
  title: 'New Bus Route Serves Airport',
  paragraphs: [
    { en: 'The Greenfield City Transit Authority announced the launch of a new express bus service connecting the city center to Greenfield International Airport. Route 88X will operate seven days a week, with buses running every 30 minutes between 5:00 A.M. and 11:00 P.M.', vi: 'Cơ quan Giao thông Thành phố Greenfield thông báo ra mắt dịch vụ xe buýt tốc hành mới kết nối trung tâm thành phố với Sân bay Quốc tế Greenfield. Tuyến 88X sẽ hoạt động bảy ngày một tuần, với các xe buýt chạy mỗi 30 phút từ 5:00 SA đến 11:00 CH.' },
    { en: 'The journey from City Hall to the airport takes approximately 45 minutes. A one-way adult ticket costs $4.50, while children under 12 travel free when accompanied by a fare-paying adult. Monthly passes for frequent travelers are available at $85. Tickets can be purchased at any transit station or through the CityTransit app.\n\nFor full schedule information, visit www.greenfieldtransit.com.', vi: 'Hành trình từ Tòa thị chính đến sân bay mất khoảng 45 phút. Vé một chiều cho người lớn có giá 4,50 đô la, trong khi trẻ em dưới 12 tuổi được đi miễn phí khi có người lớn trả tiền vé đi cùng. Thẻ tháng cho người đi thường xuyên có giá 85 đô la. Vé có thể được mua tại bất kỳ ga giao thông nào hoặc qua ứng dụng CityTransit.\n\nĐể biết thông tin đầy đủ về lịch trình, hãy truy cập www.greenfieldtransit.com.' },
  ],
  vocabulary: [
    { word: 'transit authority', pos: 'n', ipa: '/ˈtrænsɪt ɔːˈθɒrɪti/', meaning: 'cơ quan giao thông công cộng' },
    { word: 'express bus', pos: 'n', ipa: '/ɪkˈspres bʌs/', meaning: 'xe buýt tốc hành, xe buýt nhanh' },
    { word: 'accompanied by', pos: 'phrase', ipa: '/əˈkʌmpənid baɪ/', meaning: 'có người đi cùng, được đồng hành bởi' },
    { word: 'fare', pos: 'n', ipa: '/feər/', meaning: 'giá vé (xe buýt, tàu điện...)' },
  ],
  questions: [
    { prompt: 'How often do buses run on Route 88X?', options: [{ label: 'A', text: 'Every 15 minutes', translation: 'Mỗi 15 phút' }, { label: 'B', text: 'Every 20 minutes', translation: 'Mỗi 20 phút' }, { label: 'C', text: 'Every 30 minutes', translation: 'Mỗi 30 phút' }, { label: 'D', text: 'Every 45 minutes', translation: 'Mỗi 45 phút' }], correctAnswer: 'C', explanation: '"buses running every 30 minutes" — xe buýt chạy mỗi 30 phút.' },
    { prompt: 'How long does the journey from City Hall to the airport take?', options: [{ label: 'A', text: '30 minutes', translation: '30 phút' }, { label: 'B', text: '40 minutes', translation: '40 phút' }, { label: 'C', text: '45 minutes', translation: '45 phút' }, { label: 'D', text: '60 minutes', translation: '60 phút' }], correctAnswer: 'C', explanation: '"The journey from City Hall to the airport takes approximately 45 minutes" — hành trình mất khoảng 45 phút.' },
    { prompt: 'How much is a one-way adult ticket?', options: [{ label: 'A', text: '$3.50', translation: '3,50 đô la' }, { label: 'B', text: '$4.00', translation: '4,00 đô la' }, { label: 'C', text: '$4.50', translation: '4,50 đô la' }, { label: 'D', text: '$5.00', translation: '5,00 đô la' }], correctAnswer: 'C', explanation: '"A one-way adult ticket costs $4.50" — vé một chiều người lớn là 4,50 đô la.' },
    { prompt: 'Who can travel free on Route 88X?', options: [{ label: 'A', text: 'All children under 16', translation: 'Tất cả trẻ em dưới 16 tuổi' }, { label: 'B', text: 'Children under 12 when with a fare-paying adult', translation: 'Trẻ em dưới 12 tuổi khi có người lớn trả vé đi cùng' }, { label: 'C', text: 'Senior citizens over 65', translation: 'Người cao tuổi trên 65 tuổi' }, { label: 'D', text: 'Monthly pass holders', translation: 'Người có thẻ tháng' }], correctAnswer: 'B', explanation: '"children under 12 travel free when accompanied by a fare-paying adult" — trẻ dưới 12 tuổi đi miễn phí khi có người lớn trả vé.' },
  ]
},

{
  level: 1, category: 'Announcement', readTime: '3 phút',
  title: 'Staff Appreciation Week',
  paragraphs: [
    { en: 'STAFF APPRECIATION WEEK — OCTOBER 14–18\n\nTo show our gratitude for your hard work and dedication, we are delighted to announce our annual Staff Appreciation Week. This year\'s program includes:\n\n• Monday: Free breakfast buffet in the cafeteria (7:30–9:30 A.M.)\n• Tuesday: Yoga and relaxation session (12:00–1:00 P.M., Rooftop)\n• Wednesday: Team trivia competition (5:00–7:00 P.M., Main Hall)\n• Thursday: Spa vouchers for all staff ($30 value)\n• Friday: Casual dress day + afternoon cake celebration', vi: 'TUẦN TRI ÂN NHÂN VIÊN — 14-18 THÁNG 10\n\nĐể thể hiện lòng biết ơn của chúng tôi đối với sự chăm chỉ và cống hiến của bạn, chúng tôi vui mừng thông báo về Tuần Tri ân Nhân viên thường niên. Chương trình năm nay bao gồm:\n\n• Thứ Hai: Bữa sáng buffet miễn phí tại căng-tin (7:30–9:30 SA)\n• Thứ Ba: Buổi yoga và thư giãn (12:00–1:00 CH, Sân thượng)\n• Thứ Tư: Thi đố vui theo nhóm (5:00–7:00 CH, Sảnh chính)\n• Thứ Năm: Phiếu spa cho tất cả nhân viên (trị giá 30 đô la)\n• Thứ Sáu: Ngày ăn mặc thoải mái + tiệc bánh buổi chiều' },
    { en: 'All events are open to full-time and part-time employees. No registration is required for most activities, except the trivia competition — please register your team (3–5 members) at the HR desk by October 11.\n\nThank you for everything you do!\nManagement Team', vi: 'Tất cả các sự kiện đều mở cho nhân viên toàn thời gian và bán thời gian. Hầu hết các hoạt động không cần đăng ký, ngoại trừ cuộc thi đố vui — vui lòng đăng ký nhóm của bạn (3–5 thành viên) tại bàn Nhân sự trước ngày 11 tháng 10.\n\nCảm ơn bạn về mọi thứ bạn làm!\nĐội Quản lý' },
  ],
  vocabulary: [
    { word: 'appreciation', pos: 'n', ipa: '/əˌpriːʃiˈeɪʃn/', meaning: 'sự tri ân, lòng biết ơn' },
    { word: 'dedication', pos: 'n', ipa: '/ˌdedɪˈkeɪʃn/', meaning: 'sự cống hiến, tận tâm' },
    { word: 'voucher', pos: 'n', ipa: '/ˈvaʊtʃər/', meaning: 'phiếu quà tặng, phiếu giảm giá' },
    { word: 'trivia', pos: 'n', ipa: '/ˈtrɪviə/', meaning: 'câu đố kiến thức tổng hợp' },
  ],
  questions: [
    { prompt: 'When is the free breakfast buffet?', options: [{ label: 'A', text: 'Tuesday, 7:30–9:30 A.M.', translation: 'Thứ Ba, 7:30–9:30 SA' }, { label: 'B', text: 'Monday, 7:30–9:30 A.M.', translation: 'Thứ Hai, 7:30–9:30 SA' }, { label: 'C', text: 'Monday, 9:00–11:00 A.M.', translation: 'Thứ Hai, 9:00–11:00 SA' }, { label: 'D', text: 'Friday, 8:00–10:00 A.M.', translation: 'Thứ Sáu, 8:00–10:00 SA' }], correctAnswer: 'B', explanation: '"Monday: Free breakfast buffet in the cafeteria (7:30–9:30 A.M.)" — bữa sáng buffet vào thứ Hai từ 7:30–9:30 SA.' },
    { prompt: 'What is the value of the spa voucher?', options: [{ label: 'A', text: '$20', translation: '20 đô la' }, { label: 'B', text: '$25', translation: '25 đô la' }, { label: 'C', text: '$30', translation: '30 đô la' }, { label: 'D', text: '$50', translation: '50 đô la' }], correctAnswer: 'C', explanation: '"Spa vouchers for all staff ($30 value)" — phiếu spa trị giá 30 đô la.' },
    { prompt: 'Which event requires registration?', options: [{ label: 'A', text: 'The yoga session', translation: 'Buổi yoga' }, { label: 'B', text: 'The breakfast buffet', translation: 'Bữa sáng buffet' }, { label: 'C', text: 'The team trivia competition', translation: 'Cuộc thi đố vui theo nhóm' }, { label: 'D', text: 'The cake celebration', translation: 'Tiệc bánh' }], correctAnswer: 'C', explanation: '"except the trivia competition — please register your team" — cuộc thi đố vui yêu cầu đăng ký nhóm.' },
    { prompt: 'By when must teams register for the trivia competition?', options: [{ label: 'A', text: 'October 11', translation: 'Ngày 11 tháng 10' }, { label: 'B', text: 'October 14', translation: 'Ngày 14 tháng 10' }, { label: 'C', text: 'October 16', translation: 'Ngày 16 tháng 10' }, { label: 'D', text: 'October 18', translation: 'Ngày 18 tháng 10' }], correctAnswer: 'A', explanation: '"register your team...at the HR desk by October 11" — đăng ký nhóm trước ngày 11 tháng 10.' },
  ]
},

{
  level: 1, category: 'E-mail', readTime: '3 phút',
  title: 'Service Appointment Reminder',
  paragraphs: [
    { en: 'Dear Ms. Kim,\n\nThis is a reminder from AutoCare Service Center about your upcoming vehicle maintenance appointment:\n\nDate: Thursday, October 10\nTime: 9:00 A.M.\nService: Oil change + tire rotation + brake inspection\nVehicle: 2021 Toyota Camry (License Plate: ABC-4821)', vi: 'Kính gửi bà Kim,\n\nĐây là lời nhắc nhở từ Trung tâm Dịch vụ AutoCare về cuộc hẹn bảo dưỡng xe sắp tới của bạn:\n\nNgày: Thứ Năm, ngày 10 tháng 10\nGiờ: 9:00 SA\nDịch vụ: Thay dầu + đảo lốp + kiểm tra phanh\nXe: Toyota Camry 2021 (Biển số: ABC-4821)' },
    { en: 'Your appointment will take approximately 90 minutes. We offer a free shuttle service to nearby shopping areas while you wait. Alternatively, a comfortable waiting lounge with complimentary coffee and Wi-Fi is available on-site.\n\nTo reschedule or cancel, please call us at 555-3300 at least 24 hours before your appointment.\n\nSee you soon!\nAutocare Service Center', vi: 'Cuộc hẹn của bạn sẽ mất khoảng 90 phút. Chúng tôi cung cấp dịch vụ đưa đón miễn phí đến các khu mua sắm lân cận trong khi bạn chờ đợi. Ngoài ra, phòng chờ thoải mái với cà phê miễn phí và Wi-Fi có sẵn tại chỗ.\n\nĐể đổi lịch hoặc hủy, vui lòng gọi cho chúng tôi tại 555-3300 ít nhất 24 giờ trước cuộc hẹn của bạn.\n\nHẹn gặp lại!\nTrung tâm Dịch vụ Autocare' },
  ],
  vocabulary: [
    { word: 'upcoming', pos: 'adj', ipa: '/ˈʌpkʌmɪŋ/', meaning: 'sắp tới, sắp xảy ra' },
    { word: 'maintenance', pos: 'n', ipa: '/ˈmeɪntənəns/', meaning: 'bảo dưỡng, bảo trì' },
    { word: 'shuttle service', pos: 'n', ipa: '/ˈʃʌtl ˈsɜːrvɪs/', meaning: 'dịch vụ đưa đón, xe con thoi' },
    { word: 'reschedule', pos: 'v', ipa: '/riːˈʃedʒuːl/', meaning: 'đổi lịch, sắp xếp lại lịch trình' },
  ],
  questions: [
    { prompt: 'What services are included in the appointment?', options: [{ label: 'A', text: 'Oil change only', translation: 'Chỉ thay dầu' }, { label: 'B', text: 'Oil change and brake inspection only', translation: 'Chỉ thay dầu và kiểm tra phanh' }, { label: 'C', text: 'Oil change, tire rotation, and brake inspection', translation: 'Thay dầu, đảo lốp và kiểm tra phanh' }, { label: 'D', text: 'Full vehicle inspection', translation: 'Kiểm tra xe toàn bộ' }], correctAnswer: 'C', explanation: '"Oil change + tire rotation + brake inspection" — ba dịch vụ: thay dầu, đảo lốp và kiểm tra phanh.' },
    { prompt: 'How long will the appointment take?', options: [{ label: 'A', text: '30 minutes', translation: '30 phút' }, { label: 'B', text: '60 minutes', translation: '60 phút' }, { label: 'C', text: '90 minutes', translation: '90 phút' }, { label: 'D', text: '120 minutes', translation: '120 phút' }], correctAnswer: 'C', explanation: '"Your appointment will take approximately 90 minutes" — cuộc hẹn mất khoảng 90 phút.' },
    { prompt: 'What can customers do while waiting for their vehicle?', options: [{ label: 'A', text: 'Browse the parts store', translation: 'Duyệt cửa hàng phụ tùng' }, { label: 'B', text: 'Use a free shuttle to nearby shopping areas or wait in a lounge', translation: 'Sử dụng xe đưa đón miễn phí đến khu mua sắm hoặc chờ tại phòng chờ' }, { label: 'C', text: 'Work in a private office space', translation: 'Làm việc trong không gian văn phòng riêng' }, { label: 'D', text: 'Watch the service process', translation: 'Xem quá trình dịch vụ' }], correctAnswer: 'B', explanation: '"free shuttle service to nearby shopping areas" and "comfortable waiting lounge" — hai lựa chọn trong khi chờ.' },
    { prompt: 'How early must the customer cancel before the appointment?', options: [{ label: 'A', text: '12 hours', translation: '12 giờ' }, { label: 'B', text: '24 hours', translation: '24 giờ' }, { label: 'C', text: '48 hours', translation: '48 giờ' }, { label: 'D', text: '72 hours', translation: '72 giờ' }], correctAnswer: 'B', explanation: '"at least 24 hours before your appointment" — cần hủy ít nhất 24 giờ trước.' },
  ]
},

{
  level: 1, category: 'Article', readTime: '3 phút',
  title: 'Company Wins Customer Service Award',
  paragraphs: [
    { en: 'Pacific Solutions, a local technology services company, has been named the winner of the Regional Business Excellence Award for Outstanding Customer Service. The award was presented at the Annual Chamber of Commerce Gala held on Friday evening. Pacific Solutions beat 48 other nominees across seven industry categories.', vi: 'Pacific Solutions, một công ty dịch vụ công nghệ địa phương, đã được vinh danh là người chiến thắng Giải thưởng Xuất sắc Kinh doanh Khu vực về Dịch vụ Khách hàng Nổi bật. Giải thưởng được trao tại Dạ tiệc Thường niên của Phòng Thương mại được tổ chức vào tối thứ Sáu. Pacific Solutions đã vượt qua 48 đề cử khác trong bảy hạng mục ngành.' },
    { en: 'Company founder Anna Reyes credited the award to the company\'s front-line staff. "Our customer-facing teams go above and beyond every single day," she said. "This award is theirs, not mine." Pacific Solutions, which employs 230 people, plans to expand its services to two new cities next year. Last year, the company\'s customer satisfaction score reached 97%, the highest in the region.', vi: 'Người sáng lập công ty Anna Reyes ghi công giải thưởng cho đội ngũ nhân viên tuyến đầu. "Các nhóm đối diện khách hàng của chúng tôi luôn nỗ lực hết mình mỗi ngày," bà nói. "Giải thưởng này là của họ, không phải của tôi." Pacific Solutions, với 230 nhân viên, có kế hoạch mở rộng dịch vụ sang hai thành phố mới vào năm tới. Năm ngoái, điểm hài lòng của khách hàng công ty đạt 97%, cao nhất khu vực.' },
  ],
  vocabulary: [
    { word: 'nominee', pos: 'n', ipa: '/ˌnɒmɪˈniː/', meaning: 'người được đề cử, ứng viên' },
    { word: 'founder', pos: 'n', ipa: '/ˈfaʊndər/', meaning: 'người sáng lập' },
    { word: 'credited', pos: 'v', ipa: '/ˈkredɪtɪd/', meaning: 'ghi công, quy công lao cho' },
    { word: 'go above and beyond', pos: 'phrase', ipa: '/ɡoʊ əˈbʌv ænd bɪˈɒnd/', meaning: 'nỗ lực hơn mức cần thiết, vượt trên kỳ vọng' },
  ],
  questions: [
    { prompt: 'What award did Pacific Solutions win?', options: [{ label: 'A', text: 'Best New Business Award', translation: 'Giải thưởng Doanh nghiệp Mới nhất' }, { label: 'B', text: 'Regional Business Excellence Award for Outstanding Customer Service', translation: 'Giải thưởng Xuất sắc Kinh doanh Khu vực về Dịch vụ Khách hàng Nổi bật' }, { label: 'C', text: 'National Technology Innovation Award', translation: 'Giải thưởng Đổi mới Công nghệ Quốc gia' }, { label: 'D', text: 'Chamber of Commerce Leadership Award', translation: 'Giải thưởng Lãnh đạo Phòng Thương mại' }], correctAnswer: 'B', explanation: '"named the winner of the Regional Business Excellence Award for Outstanding Customer Service" — giải thưởng xuất sắc dịch vụ khách hàng.' },
    { prompt: 'How many nominees did Pacific Solutions beat?', options: [{ label: 'A', text: '38', translation: '38' }, { label: 'B', text: '48', translation: '48' }, { label: 'C', text: '58', translation: '58' }, { label: 'D', text: '68', translation: '68' }], correctAnswer: 'B', explanation: '"Pacific Solutions beat 48 other nominees" — vượt qua 48 đề cử khác.' },
    { prompt: 'How many employees does Pacific Solutions have?', options: [{ label: 'A', text: '130', translation: '130' }, { label: 'B', text: '200', translation: '200' }, { label: 'C', text: '230', translation: '230' }, { label: 'D', text: '270', translation: '270' }], correctAnswer: 'C', explanation: '"Pacific Solutions, which employs 230 people" — công ty có 230 nhân viên.' },
    { prompt: 'What was the company\'s customer satisfaction score last year?', options: [{ label: 'A', text: '87%', translation: '87%' }, { label: 'B', text: '92%', translation: '92%' }, { label: 'C', text: '95%', translation: '95%' }, { label: 'D', text: '97%', translation: '97%' }], correctAnswer: 'D', explanation: '"customer satisfaction score reached 97%" — điểm hài lòng đạt 97%.' },
  ]
},

{
  level: 1, category: 'Letter', readTime: '3 phút',
  title: 'Complaint About a Delayed Shipment',
  paragraphs: [
    { en: 'Dear Customer Service Team,\n\nI am writing to express my disappointment regarding my recent order (#334-5562), placed on March 3. According to the order confirmation, delivery was expected within 5–7 business days. It is now March 18, and I have still not received my items — 15 business days after the order was placed.', vi: 'Kính gửi Đội Dịch vụ Khách hàng,\n\nTôi viết thư để bày tỏ sự thất vọng về đơn hàng gần đây của tôi (#334-5562), được đặt vào ngày 3 tháng 3. Theo xác nhận đơn hàng, giao hàng dự kiến trong vòng 5–7 ngày làm việc. Hiện tại là ngày 18 tháng 3, và tôi vẫn chưa nhận được các mặt hàng — 15 ngày làm việc sau khi đơn hàng được đặt.' },
    { en: 'When I tracked my order online, the status has shown "In Transit" since March 8 with no updates. I have called your support line twice but was placed on hold for more than 20 minutes each time and was unable to speak with anyone.\n\nI would appreciate an immediate update on the status of my shipment and, if the items cannot be delivered within the next three business days, I request a full refund. Please respond to this email within 48 hours.\n\nSincerely,\nMark Hoffman', vi: 'Khi tôi theo dõi đơn hàng trực tuyến, trạng thái đã hiển thị "Đang vận chuyển" kể từ ngày 8 tháng 3 mà không có cập nhật nào. Tôi đã gọi đường dây hỗ trợ của bạn hai lần nhưng bị giữ máy hơn 20 phút mỗi lần và không thể nói chuyện với ai.\n\nTôi rất biết ơn nếu được cập nhật ngay lập tức về tình trạng vận chuyển của tôi và nếu các mặt hàng không thể được giao trong ba ngày làm việc tiếp theo, tôi yêu cầu hoàn tiền đầy đủ. Vui lòng phản hồi email này trong vòng 48 giờ.\n\nTrân trọng,\nMark Hoffman' },
  ],
  vocabulary: [
    { word: 'disappointment', pos: 'n', ipa: '/ˌdɪsəˈpɔɪntmənt/', meaning: 'sự thất vọng' },
    { word: 'In Transit', pos: 'phrase', ipa: '/ɪn ˈtrænsɪt/', meaning: 'đang được vận chuyển, đang trên đường đến' },
    { word: 'on hold', pos: 'phrase', ipa: '/ɒn hoʊld/', meaning: 'đang chờ máy (khi gọi điện)' },
    { word: 'refund', pos: 'n', ipa: '/ˈriːfʌnd/', meaning: 'tiền hoàn lại' },
  ],
  questions: [
    { prompt: 'When was the order placed?', options: [{ label: 'A', text: 'March 3', translation: 'Ngày 3 tháng 3' }, { label: 'B', text: 'March 8', translation: 'Ngày 8 tháng 3' }, { label: 'C', text: 'March 15', translation: 'Ngày 15 tháng 3' }, { label: 'D', text: 'March 18', translation: 'Ngày 18 tháng 3' }], correctAnswer: 'A', explanation: '"my recent order...placed on March 3" — đơn hàng được đặt ngày 3 tháng 3.' },
    { prompt: 'What has the tracking status shown since March 8?', options: [{ label: 'A', text: 'Delivered', translation: 'Đã giao hàng' }, { label: 'B', text: 'Out for Delivery', translation: 'Đang giao hàng' }, { label: 'C', text: 'In Transit', translation: 'Đang vận chuyển' }, { label: 'D', text: 'Returned to Sender', translation: 'Trả lại người gửi' }], correctAnswer: 'C', explanation: '"the status has shown \'In Transit\' since March 8" — trạng thái hiển thị "Đang vận chuyển" từ ngày 8 tháng 3.' },
    { prompt: 'How many times did the customer call the support line?', options: [{ label: 'A', text: 'Once', translation: 'Một lần' }, { label: 'B', text: 'Twice', translation: 'Hai lần' }, { label: 'C', text: 'Three times', translation: 'Ba lần' }, { label: 'D', text: 'Four times', translation: 'Bốn lần' }], correctAnswer: 'B', explanation: '"I have called your support line twice" — đã gọi hai lần.' },
    { prompt: 'What does the customer want if items cannot be delivered soon?', options: [{ label: 'A', text: 'A replacement order sent express', translation: 'Đơn hàng thay thế gửi khẩn' }, { label: 'B', text: 'A partial refund', translation: 'Hoàn tiền một phần' }, { label: 'C', text: 'A full refund', translation: 'Hoàn tiền đầy đủ' }, { label: 'D', text: 'A discount on the next order', translation: 'Giảm giá đơn hàng tiếp theo' }], correctAnswer: 'C', explanation: '"I request a full refund" — khách hàng yêu cầu hoàn tiền đầy đủ.' },
  ]
},

// ═══════════════════════════════════════════════════
// LEVEL 2 — 15 BÀI (Thư tín, Bài đọc nâng cao, Báo cáo)
// ═══════════════════════════════════════════════════
{
  level: 2, category: 'E-mail', readTime: '4 phút',
  title: 'A New Attendance Policy',
  paragraphs: [
    { en: 'Dear All Staff,\n\nFollowing a review of our current attendance practices, management has approved an updated attendance policy effective from November 1. The new policy aims to provide greater flexibility while maintaining accountability and ensuring our clients continue to receive consistent service.\n\nKey changes include: (1) Employees may now work from home up to two days per week, subject to manager approval and team scheduling requirements. (2) Core working hours are now 10:00 A.M. to 3:00 P.M. — all staff must be available during this window for meetings and collaboration. (3) All remote working days must be scheduled at least 48 hours in advance.', vi: 'Kính gửi toàn thể nhân viên,\n\nSau khi xem xét các thực hành chấm công hiện tại của chúng tôi, ban quản lý đã phê duyệt chính sách chấm công cập nhật có hiệu lực từ ngày 1 tháng 11. Chính sách mới nhằm mục đích cung cấp sự linh hoạt hơn trong khi duy trì trách nhiệm giải trình và đảm bảo các khách hàng của chúng tôi tiếp tục nhận được dịch vụ nhất quán.\n\nCác thay đổi chính bao gồm: (1) Nhân viên hiện có thể làm việc tại nhà tối đa hai ngày mỗi tuần, tùy thuộc vào sự chấp thuận của quản lý và yêu cầu lên lịch nhóm. (2) Giờ làm việc cốt lõi hiện nay là 10:00 SA đến 3:00 CH — tất cả nhân viên phải có sẵn trong khoảng thời gian này cho các cuộc họp và cộng tác. (3) Tất cả các ngày làm việc từ xa phải được lên lịch trước ít nhất 48 giờ.' },
    { en: 'Employees who wish to work from home more than two days per week for personal reasons (e.g., health or caregiving needs) should speak with HR to explore individual arrangements.\n\nFull documentation of the updated policy is available on the company intranet under HR Policies. Please review it before November 1 and direct any questions to your line manager or hr@company.com.\n\nBest regards,\nHuman Resources', vi: 'Nhân viên muốn làm việc tại nhà hơn hai ngày mỗi tuần vì lý do cá nhân (ví dụ: nhu cầu sức khỏe hoặc chăm sóc) nên nói chuyện với Nhân sự để khám phá các thỏa thuận cá nhân.\n\nTài liệu đầy đủ của chính sách cập nhật có sẵn trên mạng nội bộ công ty trong phần Chính sách Nhân sự. Vui lòng xem xét trước ngày 1 tháng 11 và gửi bất kỳ câu hỏi nào đến quản lý trực tiếp của bạn hoặc hr@company.com.\n\nTrân trọng,\nNhân sự' },
  ],
  vocabulary: [
    { word: 'accountability', pos: 'n', ipa: '/əˌkaʊntəˈbɪlɪti/', meaning: 'trách nhiệm giải trình, tính chịu trách nhiệm' },
    { word: 'core working hours', pos: 'n', ipa: '/kɔːr ˈwɜːrkɪŋ ˈaʊərz/', meaning: 'giờ làm việc cốt lõi (bắt buộc có mặt)' },
    { word: 'caregiving', pos: 'n', ipa: '/ˈkerɡɪvɪŋ/', meaning: 'việc chăm sóc (người thân)' },
    { word: 'intranet', pos: 'n', ipa: '/ˈɪntrənet/', meaning: 'mạng nội bộ (của tổ chức)' },
    { word: 'individual arrangement', pos: 'n', ipa: '/ˌɪndɪˈvɪdʒuəl əˈreɪndʒmənt/', meaning: 'sắp xếp cá nhân, thỏa thuận riêng' },
  ],
  questions: [
    { prompt: 'When does the new attendance policy take effect?', options: [{ label: 'A', text: 'October 1', translation: 'Ngày 1 tháng 10' }, { label: 'B', text: 'November 1', translation: 'Ngày 1 tháng 11' }, { label: 'C', text: 'December 1', translation: 'Ngày 1 tháng 12' }, { label: 'D', text: 'January 1', translation: 'Ngày 1 tháng 1' }], correctAnswer: 'B', explanation: '"effective from November 1" — chính sách có hiệu lực từ ngày 1 tháng 11.' },
    { prompt: 'How many days per week may employees work from home?', options: [{ label: 'A', text: 'Up to one day', translation: 'Tối đa một ngày' }, { label: 'B', text: 'Up to two days', translation: 'Tối đa hai ngày' }, { label: 'C', text: 'Up to three days', translation: 'Tối đa ba ngày' }, { label: 'D', text: 'Any number of days', translation: 'Bất kỳ số ngày nào' }], correctAnswer: 'B', explanation: '"work from home up to two days per week" — tối đa hai ngày mỗi tuần.' },
    { prompt: 'What are the core working hours?', options: [{ label: 'A', text: '9:00 A.M. to 3:00 P.M.', translation: '9:00 SA đến 3:00 CH' }, { label: 'B', text: '10:00 A.M. to 3:00 P.M.', translation: '10:00 SA đến 3:00 CH' }, { label: 'C', text: '10:00 A.M. to 4:00 P.M.', translation: '10:00 SA đến 4:00 CH' }, { label: 'D', text: '9:00 A.M. to 5:00 P.M.', translation: '9:00 SA đến 5:00 CH' }], correctAnswer: 'B', explanation: '"Core working hours are now 10:00 A.M. to 3:00 P.M." — giờ làm việc cốt lõi từ 10:00 SA đến 3:00 CH.' },
    { prompt: 'How far in advance must remote working days be scheduled?', options: [{ label: 'A', text: '24 hours', translation: '24 giờ' }, { label: 'B', text: '48 hours', translation: '48 giờ' }, { label: 'C', text: '72 hours', translation: '72 giờ' }, { label: 'D', text: 'One week', translation: 'Một tuần' }], correctAnswer: 'B', explanation: '"must be scheduled at least 48 hours in advance" — phải lên lịch trước ít nhất 48 giờ.' },
  ]
},

{
  level: 2, category: 'Notice', readTime: '4 phút',
  title: 'Office Relocation Notice',
  paragraphs: [
    { en: 'IMPORTANT NOTICE — OFFICE RELOCATION\n\nWe are pleased to announce that our company will be relocating to new premises at 500 Harbor Boulevard, Suite 1200, effective Monday, December 2. The decision to move was driven by our need for a larger, more modern workspace to support our growing team and to better serve our clients. The new office offers 40% more floor space and is located two blocks from the Metro Central Station.', vi: 'THÔNG BÁO QUAN TRỌNG — DI CHUYỂN VĂN PHÒNG\n\nChúng tôi vui mừng thông báo rằng công ty chúng tôi sẽ chuyển đến địa điểm mới tại 500 Harbor Boulevard, Suite 1200, có hiệu lực vào thứ Hai, ngày 2 tháng 12. Quyết định chuyển địa điểm được thúc đẩy bởi nhu cầu về không gian làm việc lớn hơn, hiện đại hơn để hỗ trợ đội nhóm ngày càng phát triển của chúng tôi và phục vụ khách hàng tốt hơn. Văn phòng mới có thêm 40% diện tích sàn và nằm cách hai khu nhà từ Ga Metro Central.' },
    { en: 'Moving activities will take place over the weekend of November 30 and December 1. The office will be closed on Friday, November 29, to allow for IT infrastructure disconnection and packing. All employees should ensure their personal items are packed by 5:00 P.M. on Thursday, November 28.\n\nPlease update your business cards and email signatures with the new address. Our phone numbers and email addresses will remain unchanged. If you have questions, contact our Operations team at operations@company.com.', vi: 'Các hoạt động chuyển dọn sẽ diễn ra vào cuối tuần ngày 30 tháng 11 và ngày 1 tháng 12. Văn phòng sẽ đóng cửa vào thứ Sáu, ngày 29 tháng 11, để cho phép ngắt kết nối cơ sở hạ tầng CNTT và đóng gói. Tất cả nhân viên nên đảm bảo các đồ dùng cá nhân của họ được đóng gói trước 5:00 CH vào thứ Năm, ngày 28 tháng 11.\n\nVui lòng cập nhật danh thiếp và chữ ký email của bạn với địa chỉ mới. Số điện thoại và địa chỉ email của chúng tôi sẽ không thay đổi. Nếu bạn có câu hỏi, hãy liên hệ nhóm Vận hành của chúng tôi tại operations@company.com.' },
  ],
  vocabulary: [
    { word: 'relocating', pos: 'v', ipa: '/ˌriːloʊˈkeɪtɪŋ/', meaning: 'di chuyển địa điểm, chuyển đến nơi mới' },
    { word: 'premises', pos: 'n', ipa: '/ˈpremɪsɪz/', meaning: 'cơ sở, địa điểm, tòa nhà' },
    { word: 'infrastructure', pos: 'n', ipa: '/ˈɪnfrəstrʌktʃər/', meaning: 'cơ sở hạ tầng' },
    { word: 'business cards', pos: 'n', ipa: '/ˈbɪznəs kɑːrdz/', meaning: 'danh thiếp' },
  ],
  questions: [
    { prompt: 'When will the company move to the new office?', options: [{ label: 'A', text: 'Friday, November 29', translation: 'Thứ Sáu, ngày 29 tháng 11' }, { label: 'B', text: 'Weekend of November 30 – December 1', translation: 'Cuối tuần ngày 30 tháng 11 – 1 tháng 12' }, { label: 'C', text: 'Monday, December 2', translation: 'Thứ Hai, ngày 2 tháng 12' }, { label: 'D', text: 'Tuesday, December 3', translation: 'Thứ Ba, ngày 3 tháng 12' }], correctAnswer: 'C', explanation: '"effective Monday, December 2" — văn phòng mới chính thức hoạt động từ thứ Hai ngày 2 tháng 12.' },
    { prompt: 'By when must employees pack their personal items?', options: [{ label: 'A', text: '5:00 P.M. on Thursday, November 28', translation: '5:00 CH vào thứ Năm, ngày 28 tháng 11' }, { label: 'B', text: '5:00 P.M. on Friday, November 29', translation: '5:00 CH vào thứ Sáu, ngày 29 tháng 11' }, { label: 'C', text: 'Before the weekend of November 30', translation: 'Trước cuối tuần ngày 30 tháng 11' }, { label: 'D', text: 'By December 2', translation: 'Trước ngày 2 tháng 12' }], correctAnswer: 'A', explanation: '"packed by 5:00 P.M. on Thursday, November 28" — phải đóng gói trước 5:00 CH thứ Năm ngày 28.' },
    { prompt: 'What advantage does the new office have?', options: [{ label: 'A', text: 'Lower rent than the current location', translation: 'Tiền thuê thấp hơn địa điểm hiện tại' }, { label: 'B', text: '40% more floor space', translation: 'Thêm 40% diện tích sàn' }, { label: 'C', text: 'A rooftop meeting area', translation: 'Khu họp trên sân thượng' }, { label: 'D', text: 'Free underground parking', translation: 'Đỗ xe ngầm miễn phí' }], correctAnswer: 'B', explanation: '"The new office offers 40% more floor space" — văn phòng mới có thêm 40% diện tích sàn.' },
    { prompt: 'What will remain unchanged after the move?', options: [{ label: 'A', text: 'The office address', translation: 'Địa chỉ văn phòng' }, { label: 'B', text: 'The phone numbers and email addresses', translation: 'Số điện thoại và địa chỉ email' }, { label: 'C', text: 'The floor layout', translation: 'Bố cục tầng' }, { label: 'D', text: 'The business card design', translation: 'Thiết kế danh thiếp' }], correctAnswer: 'B', explanation: '"Our phone numbers and email addresses will remain unchanged" — số điện thoại và email không thay đổi.' },
  ]
},

{
  level: 2, category: 'Article', readTime: '4 phút',
  title: 'Customer Loyalty Program',
  paragraphs: [
    { en: 'Retail giant ShopMart announced the launch of its redesigned customer loyalty program, SmartRewards, with several new features aimed at improving customer engagement and retention. The program, which has 12 million existing members, now offers a tiered points system with three membership levels: Bronze, Silver, and Gold.', vi: 'Gã khổng lồ bán lẻ ShopMart đã thông báo ra mắt chương trình khách hàng thân thiết được thiết kế lại, SmartRewards, với một số tính năng mới nhằm cải thiện sự gắn kết và giữ chân khách hàng. Chương trình, với 12 triệu thành viên hiện tại, hiện cung cấp hệ thống điểm phân cấp với ba cấp độ thành viên: Đồng, Bạc và Vàng.' },
    { en: 'Members earn 1 point for every $1 spent. Bronze members (0–499 points) receive a 5% quarterly rebate. Silver members (500–1,999 points) earn a 10% rebate and free standard shipping on all orders. Gold members (2,000+ points) enjoy a 15% rebate, free express shipping, priority customer service, and invitations to exclusive members-only events.\n\nAll existing members have been automatically enrolled in the new program and will retain their points balance. New members can join for free at www.shopmart.com/rewards. "Our research showed customers want to feel valued," said ShopMart CEO Lisa Chen. "SmartRewards is designed to do exactly that."', vi: 'Thành viên kiếm được 1 điểm cho mỗi 1 đô la chi tiêu. Thành viên Đồng (0–499 điểm) nhận được khoản hoàn tiền hàng quý 5%. Thành viên Bạc (500–1.999 điểm) kiếm được khoản hoàn tiền 10% và vận chuyển tiêu chuẩn miễn phí cho tất cả các đơn hàng. Thành viên Vàng (2.000+ điểm) được hưởng khoản hoàn tiền 15%, vận chuyển nhanh miễn phí, dịch vụ khách hàng ưu tiên và lời mời tham gia các sự kiện độc quyền chỉ dành cho thành viên.\n\nTất cả thành viên hiện tại đã được tự động đăng ký vào chương trình mới và sẽ giữ lại số dư điểm của họ. Thành viên mới có thể tham gia miễn phí tại www.shopmart.com/rewards. "Nghiên cứu của chúng tôi cho thấy khách hàng muốn cảm thấy được trân trọng," CEO ShopMart Lisa Chen cho biết. "SmartRewards được thiết kế để làm chính xác điều đó."' },
  ],
  vocabulary: [
    { word: 'retention', pos: 'n', ipa: '/rɪˈtenʃn/', meaning: 'sự giữ chân (khách hàng, nhân viên)' },
    { word: 'tiered', pos: 'adj', ipa: '/tɪərd/', meaning: 'phân cấp, theo cấp bậc' },
    { word: 'rebate', pos: 'n', ipa: '/ˈriːbeɪt/', meaning: 'khoản hoàn tiền, tiền thưởng trả lại' },
    { word: 'enrolled', pos: 'v', ipa: '/ɪnˈroʊld/', meaning: 'được đăng ký, được nhập danh sách' },
    { word: 'exclusive', pos: 'adj', ipa: '/ɪkˈskluːsɪv/', meaning: 'độc quyền, dành riêng cho' },
  ],
  questions: [
    { prompt: 'How many existing members does SmartRewards have?', options: [{ label: 'A', text: '1.2 million', translation: '1,2 triệu' }, { label: 'B', text: '5 million', translation: '5 triệu' }, { label: 'C', text: '12 million', translation: '12 triệu' }, { label: 'D', text: '20 million', translation: '20 triệu' }], correctAnswer: 'C', explanation: '"12 million existing members" — chương trình có 12 triệu thành viên hiện tại.' },
    { prompt: 'How many points does a member earn per dollar spent?', options: [{ label: 'A', text: '0.5 points', translation: '0,5 điểm' }, { label: 'B', text: '1 point', translation: '1 điểm' }, { label: 'C', text: '2 points', translation: '2 điểm' }, { label: 'D', text: '5 points', translation: '5 điểm' }], correctAnswer: 'B', explanation: '"Members earn 1 point for every $1 spent" — kiếm 1 điểm cho mỗi 1 đô la chi tiêu.' },
    { prompt: 'What benefit do Silver members receive in addition to the rebate?', options: [{ label: 'A', text: 'Free express shipping', translation: 'Vận chuyển nhanh miễn phí' }, { label: 'B', text: 'Free standard shipping', translation: 'Vận chuyển tiêu chuẩn miễn phí' }, { label: 'C', text: 'Invitations to exclusive events', translation: 'Lời mời tham gia sự kiện độc quyền' }, { label: 'D', text: 'Priority customer service', translation: 'Dịch vụ khách hàng ưu tiên' }], correctAnswer: 'B', explanation: '"Silver members earn a 10% rebate and free standard shipping on all orders" — thành viên Bạc nhận vận chuyển tiêu chuẩn miễn phí.' },
    { prompt: 'What happens to existing members\' points when they join the new program?', options: [{ label: 'A', text: 'Their points are reset to zero', translation: 'Điểm của họ được đặt lại về 0' }, { label: 'B', text: 'Their points are doubled as a welcome bonus', translation: 'Điểm của họ được nhân đôi như phần thưởng chào mừng' }, { label: 'C', text: 'They retain their existing points balance', translation: 'Họ giữ lại số dư điểm hiện tại' }, { label: 'D', text: 'They start at the Silver level automatically', translation: 'Họ bắt đầu ở cấp độ Bạc tự động' }], correctAnswer: 'C', explanation: '"will retain their points balance" — thành viên giữ lại số dư điểm hiện tại.' },
  ]
},

{
  level: 2, category: 'E-mail', readTime: '4 phút',
  title: 'Proposal for Budget Adjustment',
  paragraphs: [
    { en: 'Dear Mr. Walsh,\n\nI am writing to formally request a budget adjustment for the Digital Marketing team for the remainder of Q4. Our current approved budget stands at $45,000, of which $38,500 has already been spent through October. The remaining $6,500 is insufficient to execute the remaining planned initiatives for November and December, which include the seasonal campaign launch and our year-end client appreciation event.', vi: 'Kính gửi ông Walsh,\n\nTôi viết thư để chính thức yêu cầu điều chỉnh ngân sách cho nhóm Marketing Kỹ thuật số cho phần còn lại của Q4. Ngân sách được phê duyệt hiện tại của chúng tôi là 45.000 đô la, trong đó 38.500 đô la đã được chi tiêu đến tháng 10. Số tiền còn lại 6.500 đô la không đủ để thực hiện các sáng kiến đã lên kế hoạch còn lại cho tháng 11 và tháng 12, bao gồm việc ra mắt chiến dịch theo mùa và sự kiện tri ân khách hàng cuối năm của chúng tôi.' },
    { en: 'I am requesting an additional $18,000, which will cover $11,000 for the seasonal campaign (digital advertising, influencer partnerships, and creative production) and $7,000 for the client appreciation event (venue, catering, and gifts).\n\nThese investments are projected to generate $120,000 in incremental revenue based on last year\'s comparable campaigns. I have attached a detailed breakdown and ROI projection. I would welcome the opportunity to discuss this with you at your earliest convenience.\n\nBest regards,\nSophia Torres\nDigital Marketing Manager', vi: 'Tôi đang yêu cầu thêm 18.000 đô la, sẽ bao gồm 11.000 đô la cho chiến dịch theo mùa (quảng cáo kỹ thuật số, quan hệ đối tác với người có ảnh hưởng và sản xuất sáng tạo) và 7.000 đô la cho sự kiện tri ân khách hàng (địa điểm, phục vụ ăn uống và quà tặng).\n\nCác khoản đầu tư này được dự kiến sẽ tạo ra 120.000 đô la doanh thu tăng thêm dựa trên các chiến dịch tương đương năm ngoái. Tôi đã đính kèm bảng phân tích chi tiết và dự báo ROI. Tôi hoan nghênh cơ hội thảo luận điều này với bạn sớm nhất có thể.\n\nTrân trọng,\nSophia Torres\nGiám đốc Marketing Kỹ thuật số' },
  ],
  vocabulary: [
    { word: 'budget adjustment', pos: 'n', ipa: '/ˈbʌdʒɪt əˈdʒʌstmənt/', meaning: 'điều chỉnh ngân sách' },
    { word: 'initiatives', pos: 'n', ipa: '/ɪˈnɪʃətɪvz/', meaning: 'các sáng kiến, kế hoạch hành động' },
    { word: 'influencer', pos: 'n', ipa: '/ˈɪnfluənsər/', meaning: 'người có ảnh hưởng (trên mạng xã hội)' },
    { word: 'incremental revenue', pos: 'n', ipa: '/ˌɪŋkrɪˈmentl ˈrevənjuː/', meaning: 'doanh thu tăng thêm, doanh thu cận biên' },
    { word: 'ROI (Return on Investment)', pos: 'n', ipa: '/ˌɑːr oʊ ˈaɪ/', meaning: 'tỷ lệ hoàn vốn đầu tư' },
  ],
  questions: [
    { prompt: 'What is the current approved budget for the Digital Marketing team in Q4?', options: [{ label: 'A', text: '$6,500', translation: '6.500 đô la' }, { label: 'B', text: '$18,000', translation: '18.000 đô la' }, { label: 'C', text: '$38,500', translation: '38.500 đô la' }, { label: 'D', text: '$45,000', translation: '45.000 đô la' }], correctAnswer: 'D', explanation: '"Our current approved budget stands at $45,000" — ngân sách được phê duyệt hiện tại là 45.000 đô la.' },
    { prompt: 'How much additional budget is being requested?', options: [{ label: 'A', text: '$6,500', translation: '6.500 đô la' }, { label: 'B', text: '$11,000', translation: '11.000 đô la' }, { label: 'C', text: '$18,000', translation: '18.000 đô la' }, { label: 'D', text: '$38,500', translation: '38.500 đô la' }], correctAnswer: 'C', explanation: '"I am requesting an additional $18,000" — yêu cầu thêm 18.000 đô la.' },
    { prompt: 'How much is allocated for the client appreciation event?', options: [{ label: 'A', text: '$5,000', translation: '5.000 đô la' }, { label: 'B', text: '$7,000', translation: '7.000 đô la' }, { label: 'C', text: '$11,000', translation: '11.000 đô la' }, { label: 'D', text: '$18,000', translation: '18.000 đô la' }], correctAnswer: 'B', explanation: '"$7,000 for the client appreciation event" — 7.000 đô la cho sự kiện tri ân khách hàng.' },
    { prompt: 'How much incremental revenue is the investment projected to generate?', options: [{ label: 'A', text: '$45,000', translation: '45.000 đô la' }, { label: 'B', text: '$63,000', translation: '63.000 đô la' }, { label: 'C', text: '$100,000', translation: '100.000 đô la' }, { label: 'D', text: '$120,000', translation: '120.000 đô la' }], correctAnswer: 'D', explanation: '"projected to generate $120,000 in incremental revenue" — dự kiến tạo ra 120.000 đô la doanh thu tăng thêm.' },
  ]
},

{
  level: 2, category: 'Article', readTime: '4 phút',
  title: 'Remote Work Trends in 2024',
  paragraphs: [
    { en: 'A new workplace survey conducted by the Global Employment Institute has found that hybrid work arrangements have now become the dominant model in knowledge-based industries. The survey, which collected responses from over 4,200 full-time employees across 18 countries, found that 64% currently work in a hybrid arrangement, while 22% work fully remotely and just 14% are fully office-based.', vi: 'Một cuộc khảo sát nơi làm việc mới do Viện Việc làm Toàn cầu thực hiện đã phát hiện ra rằng các sắp xếp làm việc kết hợp hiện đã trở thành mô hình chi phối trong các ngành dựa trên kiến thức. Cuộc khảo sát, thu thập phản hồi từ hơn 4.200 nhân viên toàn thời gian trên 18 quốc gia, cho thấy 64% hiện đang làm việc theo hình thức kết hợp, trong khi 22% làm việc hoàn toàn từ xa và chỉ 14% làm việc hoàn toàn tại văn phòng.' },
    { en: 'Productivity perceptions have also shifted. When asked whether they are more productive at home, in the office, or equally productive in both environments, 41% said they were more productive at home, 35% said both environments were equally productive, and only 24% reported being more productive in the office.\n\nDespite these trends, the survey noted a "proximity bias" challenge: 58% of hybrid workers reported feeling that office-based colleagues received more recognition and career advancement opportunities. Companies are now investing in technology and management training to address this inequity and ensure remote workers are evaluated on results rather than visibility.', vi: 'Nhận thức về năng suất cũng đã thay đổi. Khi được hỏi liệu họ có năng suất hơn khi ở nhà, tại văn phòng, hay năng suất như nhau ở cả hai môi trường, 41% nói rằng họ có năng suất hơn ở nhà, 35% nói rằng cả hai môi trường đều có năng suất như nhau và chỉ 24% báo cáo năng suất hơn tại văn phòng.\n\nMặc dù có những xu hướng này, cuộc khảo sát lưu ý đến thách thức "thiên vị gần gũi": 58% người làm việc kết hợp báo cáo cảm thấy rằng các đồng nghiệp làm việc tại văn phòng nhận được nhiều sự công nhận và cơ hội thăng tiến nghề nghiệp hơn. Các công ty hiện đang đầu tư vào công nghệ và đào tạo quản lý để giải quyết sự bất bình đẳng này và đảm bảo nhân viên từ xa được đánh giá dựa trên kết quả thay vì mức độ hiện diện.' },
  ],
  vocabulary: [
    { word: 'hybrid work', pos: 'n', ipa: '/ˈhaɪbrɪd wɜːrk/', meaning: 'làm việc kết hợp (một phần ở nhà, một phần tại văn phòng)' },
    { word: 'proximity bias', pos: 'n', ipa: '/prɒkˈsɪmɪti ˈbaɪəs/', meaning: 'thiên vị gần gũi (ưu ái hơn với người có mặt trực tiếp)' },
    { word: 'career advancement', pos: 'n', ipa: '/kəˈrɪər ədˈvɑːnsmənt/', meaning: 'thăng tiến nghề nghiệp' },
    { word: 'inequity', pos: 'n', ipa: '/ɪnˈekwɪti/', meaning: 'sự bất bình đẳng, thiếu công bằng' },
    { word: 'visibility', pos: 'n', ipa: '/ˌvɪzɪˈbɪlɪti/', meaning: 'mức độ hiện diện, khả năng được nhìn thấy' },
  ],
  questions: [
    { prompt: 'What percentage of employees currently work in a hybrid arrangement?', options: [{ label: 'A', text: '14%', translation: '14%' }, { label: 'B', text: '22%', translation: '22%' }, { label: 'C', text: '41%', translation: '41%' }, { label: 'D', text: '64%', translation: '64%' }], correctAnswer: 'D', explanation: '"64% currently work in a hybrid arrangement" — 64% làm việc theo hình thức kết hợp.' },
    { prompt: 'What percentage of workers say they are more productive at home?', options: [{ label: 'A', text: '24%', translation: '24%' }, { label: 'B', text: '35%', translation: '35%' }, { label: 'C', text: '41%', translation: '41%' }, { label: 'D', text: '64%', translation: '64%' }], correctAnswer: 'C', explanation: '"41% said they were more productive at home" — 41% có năng suất hơn khi ở nhà.' },
    { prompt: 'What is the "proximity bias" described in the article?', options: [{ label: 'A', text: 'Remote workers are paid more than office workers', translation: 'Nhân viên từ xa được trả nhiều hơn nhân viên văn phòng' }, { label: 'B', text: 'Office-based colleagues receive more recognition and advancement opportunities', translation: 'Đồng nghiệp văn phòng nhận được nhiều sự công nhận và cơ hội thăng tiến hơn' }, { label: 'C', text: 'Hybrid workers have longer commutes', translation: 'Nhân viên làm việc kết hợp có quãng đường đi làm dài hơn' }, { label: 'D', text: 'Remote workers are more likely to be promoted', translation: 'Nhân viên từ xa có nhiều khả năng được thăng chức hơn' }], correctAnswer: 'B', explanation: '"office-based colleagues received more recognition and career advancement opportunities" — nhân viên văn phòng được nhận nhiều sự công nhận và cơ hội thăng tiến hơn.' },
    { prompt: 'What are companies investing in to address proximity bias?', options: [{ label: 'A', text: 'Larger office spaces to fit more employees', translation: 'Không gian văn phòng lớn hơn để chứa nhiều nhân viên hơn' }, { label: 'B', text: 'Technology and management training', translation: 'Công nghệ và đào tạo quản lý' }, { label: 'C', text: 'Higher salaries for remote workers', translation: 'Mức lương cao hơn cho nhân viên từ xa' }, { label: 'D', text: 'Mandatory office attendance policies', translation: 'Chính sách đến văn phòng bắt buộc' }], correctAnswer: 'B', explanation: '"investing in technology and management training to address this inequity" — đầu tư vào công nghệ và đào tạo quản lý.' },
  ]
},

{
  level: 2, category: 'Letter', readTime: '4 phút',
  title: 'Complaint About Defective Product',
  paragraphs: [
    { en: 'Dear Customer Relations Manager,\n\nI am writing to formally report a defect with a product I purchased from your online store on September 5 (Order No. CE-7723-48). The item in question is the SmartHome Pro Hub (Model SH-400), which was purchased for $189.\n\nAfter setting up the device as directed, I experienced repeated connection failures and system crashes within the first week of use. I contacted your technical support team on September 18, and despite following all recommended troubleshooting steps, the issue persisted. The support representative advised me to perform a factory reset, which I did, but the problems continued.', vi: 'Kính gửi Giám đốc Quan hệ Khách hàng,\n\nTôi viết thư để chính thức báo cáo một lỗi với sản phẩm tôi đã mua từ cửa hàng trực tuyến của bạn vào ngày 5 tháng 9 (Đơn hàng số CE-7723-48). Mặt hàng được đề cập là SmartHome Pro Hub (Model SH-400), được mua với giá 189 đô la.\n\nSau khi thiết lập thiết bị theo hướng dẫn, tôi đã gặp phải các lỗi kết nối lặp đi lặp lại và sự cố hệ thống trong tuần đầu tiên sử dụng. Tôi đã liên hệ với nhóm hỗ trợ kỹ thuật của bạn vào ngày 18 tháng 9, và mặc dù đã làm theo tất cả các bước khắc phục sự cố được khuyến nghị, vấn đề vẫn tiếp diễn. Đại diện hỗ trợ khuyên tôi thực hiện khôi phục cài đặt gốc, điều mà tôi đã làm, nhưng các vấn đề vẫn tiếp tục.' },
    { en: 'I have documented the issues with screenshots and error logs, which I am happy to share upon request. Given that the product is still within the 30-day return window and the 12-month manufacturer\'s warranty period, I am requesting either a full replacement unit or a complete refund of $189, including any shipping costs I incurred.\n\nI expect a response within 5 business days and hope we can resolve this matter without further inconvenience.\n\nSincerely,\nDavid Park\nCustomer ID: CP-44821', vi: 'Tôi đã ghi lại các vấn đề bằng ảnh chụp màn hình và nhật ký lỗi, mà tôi sẵn lòng chia sẻ theo yêu cầu. Vì sản phẩm vẫn còn trong thời hạn trả hàng 30 ngày và thời gian bảo hành 12 tháng của nhà sản xuất, tôi đang yêu cầu một đơn vị thay thế hoàn toàn mới hoặc hoàn tiền đầy đủ 189 đô la, bao gồm mọi chi phí vận chuyển mà tôi phát sinh.\n\nTôi mong nhận được phản hồi trong vòng 5 ngày làm việc và hy vọng chúng ta có thể giải quyết vấn đề này mà không cần thêm sự bất tiện nào.\n\nTrân trọng,\nDavid Park\nID Khách hàng: CP-44821' },
  ],
  vocabulary: [
    { word: 'defect', pos: 'n', ipa: '/ˈdiːfekt/', meaning: 'lỗi sản phẩm, khuyết tật' },
    { word: 'troubleshooting', pos: 'n', ipa: '/ˈtrʌblʃuːtɪŋ/', meaning: 'khắc phục sự cố' },
    { word: 'factory reset', pos: 'n', ipa: '/ˈfæktəri ˈriːset/', meaning: 'khôi phục cài đặt gốc' },
    { word: 'warranty', pos: 'n', ipa: '/ˈwɒrənti/', meaning: 'bảo hành' },
    { word: 'incurred', pos: 'v', ipa: '/ɪnˈkɜːrd/', meaning: 'phát sinh, chịu (chi phí)' },
  ],
  questions: [
    { prompt: 'What product does the customer have a complaint about?', options: [{ label: 'A', text: 'SmartHome Pro Hub (Model SH-400)', translation: 'SmartHome Pro Hub (Model SH-400)' }, { label: 'B', text: 'SmartHome Pro Hub (Model SH-300)', translation: 'SmartHome Pro Hub (Model SH-300)' }, { label: 'C', text: 'SmartHome Mini Hub (Model SH-400)', translation: 'SmartHome Mini Hub (Model SH-400)' }, { label: 'D', text: 'SmartHome Connect Hub (Model SH-400)', translation: 'SmartHome Connect Hub (Model SH-400)' }], correctAnswer: 'A', explanation: '"SmartHome Pro Hub (Model SH-400)" — sản phẩm bị lỗi là SmartHome Pro Hub Model SH-400.' },
    { prompt: 'What did the technical support team recommend?', options: [{ label: 'A', text: 'Return the product immediately', translation: 'Trả lại sản phẩm ngay lập tức' }, { label: 'B', text: 'Perform a factory reset', translation: 'Thực hiện khôi phục cài đặt gốc' }, { label: 'C', text: 'Replace the power adapter', translation: 'Thay bộ chuyển đổi nguồn điện' }, { label: 'D', text: 'Update the firmware', translation: 'Cập nhật firmware' }], correctAnswer: 'B', explanation: '"The support representative advised me to perform a factory reset" — hỗ trợ khuyên thực hiện khôi phục cài đặt gốc.' },
    { prompt: 'What does the customer offer to provide as evidence?', options: [{ label: 'A', text: 'A video recording of the malfunctions', translation: 'Video ghi lại các lỗi hoạt động' }, { label: 'B', text: 'Screenshots and error logs', translation: 'Ảnh chụp màn hình và nhật ký lỗi' }, { label: 'C', text: 'The original product packaging', translation: 'Bao bì sản phẩm gốc' }, { label: 'D', text: 'The original receipt and warranty card', translation: 'Hóa đơn gốc và thẻ bảo hành' }], correctAnswer: 'B', explanation: '"I have documented the issues with screenshots and error logs" — khách hàng ghi lại bằng ảnh chụp màn hình và nhật ký lỗi.' },
    { prompt: 'What are the two options the customer is requesting?', options: [{ label: 'A', text: 'A repair or a store credit', translation: 'Sửa chữa hoặc tín dụng cửa hàng' }, { label: 'B', text: 'A full replacement unit or a complete refund', translation: 'Đơn vị thay thế hoàn toàn mới hoặc hoàn tiền đầy đủ' }, { label: 'C', text: 'A partial refund or a replacement', translation: 'Hoàn tiền một phần hoặc thay thế' }, { label: 'D', text: 'A discount on a future purchase or a refund', translation: 'Giảm giá mua hàng tương lai hoặc hoàn tiền' }], correctAnswer: 'B', explanation: '"requesting either a full replacement unit or a complete refund of $189" — yêu cầu thay thế hoàn toàn hoặc hoàn tiền đầy đủ.' },
  ]
},

{
  level: 2, category: 'Memo', readTime: '4 phút',
  title: 'Quarterly Performance Review Process',
  paragraphs: [
    { en: 'TO: All Department Heads\nFROM: Human Resources\nSUBJECT: Q3 Performance Review Cycle — Schedule and Guidelines\n\nThe Q3 performance review cycle will commence on October 14. All performance appraisals must be completed and submitted through the HR portal by October 31. This year, we have introduced a simplified two-step review process to reduce administrative burden while ensuring meaningful feedback.', vi: 'GỬI: Tất cả Trưởng Phòng\nTỪ: Nhân sự\nCHỦ ĐỀ: Chu kỳ Đánh giá Hiệu suất Q3 — Lịch trình và Hướng dẫn\n\nChu kỳ đánh giá hiệu suất Q3 sẽ bắt đầu vào ngày 14 tháng 10. Tất cả các đánh giá hiệu suất phải được hoàn thành và nộp qua cổng thông tin Nhân sự trước ngày 31 tháng 10. Năm nay, chúng tôi đã giới thiệu một quy trình đánh giá hai bước đơn giản hóa để giảm gánh nặng hành chính trong khi đảm bảo phản hồi có ý nghĩa.' },
    { en: 'Step 1: Self-Assessment — Each employee completes a self-assessment in the HR portal, rating their own performance against their key objectives and commenting on their professional development needs. Deadline: October 18.\n\nStep 2: Manager Review — Department heads review and rate each direct report, provide written comments, and schedule a one-on-one feedback meeting. Deadline: October 31.\n\nPerformance ratings will use a four-point scale: Exceeds Expectations, Meets Expectations, Needs Improvement, and Unsatisfactory. All ratings must be accompanied by specific, documented examples. Anonymous 360-degree feedback from peers will be incorporated for employees at the senior manager level and above.\n\nFor questions, contact HR at hr@company.com.', vi: 'Bước 1: Tự đánh giá — Mỗi nhân viên hoàn thành tự đánh giá trong cổng thông tin Nhân sự, tự đánh giá hiệu suất của mình dựa trên các mục tiêu chính và nhận xét về nhu cầu phát triển chuyên môn của họ. Hạn chót: 18 tháng 10.\n\nBước 2: Đánh giá của Quản lý — Trưởng phòng xem xét và đánh giá từng nhân viên trực tiếp, cung cấp nhận xét bằng văn bản và lên lịch một cuộc họp phản hồi riêng. Hạn chót: 31 tháng 10.\n\nXếp hạng hiệu suất sẽ sử dụng thang điểm bốn: Vượt kỳ vọng, Đáp ứng kỳ vọng, Cần cải thiện và Không đạt yêu cầu. Tất cả các xếp hạng phải kèm theo các ví dụ cụ thể, được ghi lại. Phản hồi 360 độ ẩn danh từ đồng nghiệp sẽ được tích hợp cho nhân viên ở cấp quản lý cấp cao trở lên.\n\nĐối với câu hỏi, liên hệ Nhân sự tại hr@company.com.' },
  ],
  vocabulary: [
    { word: 'performance appraisal', pos: 'n', ipa: '/pərˈfɔːrməns əˈpreɪzl/', meaning: 'đánh giá hiệu suất, xếp hạng công việc' },
    { word: 'self-assessment', pos: 'n', ipa: '/self əˈsesmənt/', meaning: 'tự đánh giá' },
    { word: 'direct report', pos: 'n', ipa: '/dɪˈrekt rɪˈpɔːrt/', meaning: 'nhân viên trực tiếp (báo cáo cho bạn)' },
    { word: '360-degree feedback', pos: 'n', ipa: '/θriː sɪksti dɪˈɡriː ˈfiːdbæk/', meaning: 'phản hồi 360 độ (từ nhiều phía: cấp trên, đồng nghiệp, cấp dưới)' },
    { word: 'incorporated', pos: 'v', ipa: '/ɪnˈkɔːrpəreɪtɪd/', meaning: 'được tích hợp, được đưa vào' },
  ],
  questions: [
    { prompt: 'When does the Q3 performance review cycle begin?', options: [{ label: 'A', text: 'October 1', translation: 'Ngày 1 tháng 10' }, { label: 'B', text: 'October 14', translation: 'Ngày 14 tháng 10' }, { label: 'C', text: 'October 18', translation: 'Ngày 18 tháng 10' }, { label: 'D', text: 'October 31', translation: 'Ngày 31 tháng 10' }], correctAnswer: 'B', explanation: '"The Q3 performance review cycle will commence on October 14" — chu kỳ đánh giá bắt đầu ngày 14 tháng 10.' },
    { prompt: 'What is the deadline for employees to complete their self-assessment?', options: [{ label: 'A', text: 'October 14', translation: 'Ngày 14 tháng 10' }, { label: 'B', text: 'October 18', translation: 'Ngày 18 tháng 10' }, { label: 'C', text: 'October 25', translation: 'Ngày 25 tháng 10' }, { label: 'D', text: 'October 31', translation: 'Ngày 31 tháng 10' }], correctAnswer: 'B', explanation: '"Deadline: October 18" for the self-assessment step — hạn chót tự đánh giá là ngày 18 tháng 10.' },
    { prompt: 'How many rating levels does the performance scale have?', options: [{ label: 'A', text: 'Three', translation: 'Ba' }, { label: 'B', text: 'Four', translation: 'Bốn' }, { label: 'C', text: 'Five', translation: 'Năm' }, { label: 'D', text: 'Six', translation: 'Sáu' }], correctAnswer: 'B', explanation: '"Performance ratings will use a four-point scale" — thang điểm bốn mức.' },
    { prompt: 'Who receives 360-degree peer feedback?', options: [{ label: 'A', text: 'All employees equally', translation: 'Tất cả nhân viên như nhau' }, { label: 'B', text: 'Only new employees in their first year', translation: 'Chỉ nhân viên mới trong năm đầu tiên' }, { label: 'C', text: 'Employees at the senior manager level and above', translation: 'Nhân viên ở cấp quản lý cấp cao trở lên' }, { label: 'D', text: 'Only department heads', translation: 'Chỉ trưởng phòng' }], correctAnswer: 'C', explanation: '"for employees at the senior manager level and above" — phản hồi 360 độ dành cho nhân viên cấp quản lý cấp cao trở lên.' },
  ]
},

{
  level: 2, category: 'Notice', readTime: '4 phút',
  title: 'New Remote Work Policy Implementation',
  paragraphs: [
    { en: 'POLICY ANNOUNCEMENT\nEffective Date: February 1\n\nFollowing an extensive six-month internal review and consultation with department heads across all divisions, the Executive Leadership Team has approved a comprehensive Remote Work Policy designed to formalize flexible working arrangements while protecting operational continuity.\n\nEligibility: All permanent employees who have completed their 6-month probationary period are eligible to apply for remote work arrangements. Contractual staff and probationary employees are not eligible under this policy.', vi: 'THÔNG BÁO CHÍNH SÁCH\nNgày Có Hiệu Lực: 1 tháng 2\n\nSau một quá trình xem xét nội bộ sáu tháng và tham vấn với các trưởng phòng trên tất cả các bộ phận, Nhóm Lãnh đạo Điều hành đã phê duyệt Chính sách Làm việc từ Xa toàn diện được thiết kế để chính thức hóa các sắp xếp làm việc linh hoạt trong khi bảo vệ tính liên tục vận hành.\n\nĐiều kiện đủ: Tất cả nhân viên chính thức đã hoàn thành thời gian thử việc 6 tháng đều đủ điều kiện để đăng ký sắp xếp làm việc từ xa. Nhân viên hợp đồng và nhân viên đang trong thời gian thử việc không đủ điều kiện theo chính sách này.' },
    { en: 'Application Process: Employees wishing to work remotely must submit a Remote Work Request Form (available on the HR portal) to their line manager. Line managers must approve or decline requests within 10 business days. Approved arrangements are subject to a 3-month trial period, after which they may be renewed, modified, or terminated based on performance.\n\nExpectations: Remote workers must maintain the same professional standards as office-based staff, attend all scheduled video meetings, respond to communications within 2 hours during core hours, and ensure their home workspace meets the minimum ergonomic and security standards outlined in Appendix B.\n\nAll employees should read the full policy document at [HR Portal > Policies > Flexible Work] before the effective date.', vi: 'Quy trình Đăng ký: Nhân viên muốn làm việc từ xa phải nộp Mẫu Yêu cầu Làm việc Từ xa (có sẵn trên cổng thông tin Nhân sự) cho quản lý trực tiếp của họ. Quản lý trực tiếp phải phê duyệt hoặc từ chối yêu cầu trong vòng 10 ngày làm việc. Các sắp xếp được phê duyệt phải trải qua giai đoạn thử nghiệm 3 tháng, sau đó có thể được gia hạn, sửa đổi hoặc chấm dứt dựa trên hiệu suất.\n\nKỳ vọng: Nhân viên làm việc từ xa phải duy trì cùng tiêu chuẩn chuyên nghiệp như nhân viên văn phòng, tham dự tất cả các cuộc họp video theo lịch, trả lời các liên lạc trong vòng 2 giờ trong giờ làm việc cốt lõi và đảm bảo không gian làm việc tại nhà của họ đáp ứng các tiêu chuẩn ergonomic và bảo mật tối thiểu được nêu trong Phụ lục B.\n\nTất cả nhân viên nên đọc tài liệu chính sách đầy đủ tại [Cổng thông tin Nhân sự > Chính sách > Làm việc Linh hoạt] trước ngày có hiệu lực.' },
  ],
  vocabulary: [
    { word: 'probationary period', pos: 'n', ipa: '/prəˈbeɪʃənri ˈpɪəriəd/', meaning: 'thời gian thử việc' },
    { word: 'operational continuity', pos: 'n', ipa: '/ˌɒpəˈreɪʃənl ˌkɒntɪˈnjuːɪti/', meaning: 'tính liên tục hoạt động, sự ổn định vận hành' },
    { word: 'trial period', pos: 'n', ipa: '/ˈtraɪəl ˈpɪəriəd/', meaning: 'giai đoạn thử nghiệm' },
    { word: 'ergonomic', pos: 'adj', ipa: '/ˌɜːrɡəˈnɒmɪk/', meaning: 'tiện nghi, hỗ trợ tư thế làm việc tốt' },
    { word: 'declined', pos: 'v', ipa: '/dɪˈklaɪnd/', meaning: 'từ chối, không chấp thuận' },
  ],
  questions: [
    { prompt: 'Who is NOT eligible for the remote work policy?', options: [{ label: 'A', text: 'Employees who have been with the company for over one year', translation: 'Nhân viên đã ở công ty hơn một năm' }, { label: 'B', text: 'Contractual staff and probationary employees', translation: 'Nhân viên hợp đồng và nhân viên thử việc' }, { label: 'C', text: 'Part-time permanent employees', translation: 'Nhân viên chính thức bán thời gian' }, { label: 'D', text: 'Senior managers and executives', translation: 'Quản lý cấp cao và điều hành' }], correctAnswer: 'B', explanation: '"Contractual staff and probationary employees are not eligible under this policy" — nhân viên hợp đồng và thử việc không đủ điều kiện.' },
    { prompt: 'How long do managers have to respond to a remote work request?', options: [{ label: 'A', text: '5 business days', translation: '5 ngày làm việc' }, { label: 'B', text: '7 business days', translation: '7 ngày làm việc' }, { label: 'C', text: '10 business days', translation: '10 ngày làm việc' }, { label: 'D', text: '14 business days', translation: '14 ngày làm việc' }], correctAnswer: 'C', explanation: '"Line managers must approve or decline requests within 10 business days" — quản lý phải phản hồi trong 10 ngày làm việc.' },
    { prompt: 'How long is the trial period for approved remote work arrangements?', options: [{ label: 'A', text: '1 month', translation: '1 tháng' }, { label: 'B', text: '3 months', translation: '3 tháng' }, { label: 'C', text: '6 months', translation: '6 tháng' }, { label: 'D', text: '12 months', translation: '12 tháng' }], correctAnswer: 'B', explanation: '"subject to a 3-month trial period" — giai đoạn thử nghiệm 3 tháng.' },
    { prompt: 'Within what time must remote workers respond to communications during core hours?', options: [{ label: 'A', text: '30 minutes', translation: '30 phút' }, { label: 'B', text: '1 hour', translation: '1 giờ' }, { label: 'C', text: '2 hours', translation: '2 giờ' }, { label: 'D', text: '4 hours', translation: '4 giờ' }], correctAnswer: 'C', explanation: '"respond to communications within 2 hours during core hours" — phải trả lời liên lạc trong 2 giờ trong giờ cốt lõi.' },
  ]
},

{
  level: 2, category: 'Article', readTime: '4 phút',
  title: 'Weekend Train Schedule Change',
  paragraphs: [
    { en: 'Metro Rail Authority announced that it will be modifying weekend train schedules starting August 3, as part of a major infrastructure upgrade project affecting Lines A, B, and D. The upgrades are designed to increase capacity by 30% and reduce delays caused by aging signal equipment. The work is expected to last approximately eight weeks, with normal schedules resuming on September 28.', vi: 'Cơ quan Đường sắt Metro thông báo rằng họ sẽ thay đổi lịch trình tàu cuối tuần bắt đầu từ ngày 3 tháng 8, như một phần của dự án nâng cấp cơ sở hạ tầng lớn ảnh hưởng đến các Tuyến A, B và D. Việc nâng cấp được thiết kế để tăng sức chứa lên 30% và giảm sự chậm trễ do thiết bị tín hiệu lão hóa. Công việc dự kiến kéo dài khoảng tám tuần, với lịch trình bình thường tiếp tục vào ngày 28 tháng 9.' },
    { en: 'During the upgrade period, weekend service on Lines A and B will run every 20 minutes instead of the usual 10-minute frequency, and the last train on these lines will depart 45 minutes earlier than normal. Line D will be suspended entirely on weekends, with replacement bus services operating on the same route at no additional cost to passengers.\n\nCommuters are encouraged to plan ahead by using the Metro Journey Planner app or visiting www.metrorail.gov/updates. Paper timetables will also be available at all station information desks from Monday. Metro Rail apologizes for any inconvenience caused and thanks commuters for their patience.', vi: 'Trong thời gian nâng cấp, dịch vụ cuối tuần trên các Tuyến A và B sẽ chạy mỗi 20 phút thay vì tần suất thông thường 10 phút, và chuyến tàu cuối cùng trên các tuyến này sẽ khởi hành sớm hơn 45 phút so với bình thường. Tuyến D sẽ bị đình chỉ hoàn toàn vào cuối tuần, với các dịch vụ xe buýt thay thế hoạt động trên cùng tuyến đường mà không tính thêm chi phí cho hành khách.\n\nNgười đi làm được khuyến khích lập kế hoạch trước bằng cách sử dụng ứng dụng Metro Journey Planner hoặc truy cập www.metrorail.gov/updates. Thời gian biểu giấy cũng sẽ có sẵn tại tất cả các bàn thông tin ga từ thứ Hai. Metro Rail xin lỗi vì bất kỳ sự bất tiện nào gây ra và cảm ơn người đi làm vì sự kiên nhẫn của họ.' },
  ],
  vocabulary: [
    { word: 'infrastructure upgrade', pos: 'n', ipa: '/ˈɪnfrəstrʌktʃər ˈʌpɡreɪd/', meaning: 'nâng cấp cơ sở hạ tầng' },
    { word: 'frequency', pos: 'n', ipa: '/ˈfriːkwənsi/', meaning: 'tần suất, tần số' },
    { word: 'suspended', pos: 'adj', ipa: '/səˈspendɪd/', meaning: 'bị đình chỉ, tạm dừng' },
    { word: 'replacement bus service', pos: 'n', ipa: '/rɪˈpleɪsmənt bʌs ˈsɜːrvɪs/', meaning: 'dịch vụ xe buýt thay thế' },
    { word: 'commuter', pos: 'n', ipa: '/kəˈmjuːtər/', meaning: 'người đi làm hàng ngày bằng phương tiện công cộng' },
  ],
  questions: [
    { prompt: 'What is the purpose of the infrastructure upgrades?', options: [{ label: 'A', text: 'To add new train stations on Line D', translation: 'Để thêm các ga tàu mới trên Tuyến D' }, { label: 'B', text: 'To increase capacity by 30% and reduce delays', translation: 'Để tăng sức chứa lên 30% và giảm sự chậm trễ' }, { label: 'C', text: 'To reduce operating costs', translation: 'Để giảm chi phí vận hành' }, { label: 'D', text: 'To extend service hours on all lines', translation: 'Để kéo dài giờ phục vụ trên tất cả các tuyến' }], correctAnswer: 'B', explanation: '"designed to increase capacity by 30% and reduce delays caused by aging signal equipment" — tăng sức chứa 30% và giảm sự chậm trễ.' },
    { prompt: 'How often will Lines A and B run during the upgrade period on weekends?', options: [{ label: 'A', text: 'Every 10 minutes', translation: 'Mỗi 10 phút' }, { label: 'B', text: 'Every 15 minutes', translation: 'Mỗi 15 phút' }, { label: 'C', text: 'Every 20 minutes', translation: 'Mỗi 20 phút' }, { label: 'D', text: 'Every 30 minutes', translation: 'Mỗi 30 phút' }], correctAnswer: 'C', explanation: '"will run every 20 minutes instead of the usual 10-minute frequency" — sẽ chạy mỗi 20 phút.' },
    { prompt: 'What will happen to Line D during the weekend upgrades?', options: [{ label: 'A', text: 'It will run less frequently', translation: 'Nó sẽ chạy ít thường xuyên hơn' }, { label: 'B', text: 'It will run only during peak hours', translation: 'Nó sẽ chạy chỉ trong giờ cao điểm' }, { label: 'C', text: 'It will be suspended and replaced by bus service', translation: 'Nó sẽ bị đình chỉ và thay thế bằng dịch vụ xe buýt' }, { label: 'D', text: 'It will operate normally', translation: 'Nó sẽ hoạt động bình thường' }], correctAnswer: 'C', explanation: '"Line D will be suspended entirely on weekends, with replacement bus services" — Tuyến D đình chỉ cuối tuần, thay bằng xe buýt.' },
    { prompt: 'When will normal train schedules resume?', options: [{ label: 'A', text: 'August 3', translation: 'Ngày 3 tháng 8' }, { label: 'B', text: 'August 31', translation: 'Ngày 31 tháng 8' }, { label: 'C', text: 'September 14', translation: 'Ngày 14 tháng 9' }, { label: 'D', text: 'September 28', translation: 'Ngày 28 tháng 9' }], correctAnswer: 'D', explanation: '"with normal schedules resuming on September 28" — lịch trình bình thường tiếp tục vào ngày 28 tháng 9.' },
  ]
},

{
  level: 2, category: 'E-mail', readTime: '4 phút',
  title: 'Professional Development Workshop Series',
  paragraphs: [
    { en: 'Dear Ms. Abdullah,\n\nThank you for registering for the Apex Leadership Academy\'s "Managing High-Performance Teams" workshop series. We are delighted to confirm your enrollment in the 4-session program scheduled for the following Saturdays: September 7, 14, 21, and 28, each from 9:00 A.M. to 1:00 P.M.\n\nThe program will be facilitated by Dr. Karim Nassar, a management consultant with 20 years of experience working with Fortune 500 companies. Each session will combine theory with interactive case studies and group activities, focusing on talent development, conflict resolution, performance management, and building accountability cultures.', vi: 'Kính gửi bà Abdullah,\n\nCảm ơn bạn đã đăng ký Chuỗi Hội thảo "Quản lý Nhóm Hiệu suất Cao" của Apex Leadership Academy. Chúng tôi vui mừng xác nhận việc đăng ký của bạn vào chương trình 4 buổi dự kiến vào các thứ Bảy sau: ngày 7, 14, 21 và 28 tháng 9, mỗi buổi từ 9:00 SA đến 1:00 CH.\n\nChương trình sẽ do Tiến sĩ Karim Nassar hướng dẫn, một tư vấn quản lý với 20 năm kinh nghiệm làm việc với các công ty Fortune 500. Mỗi buổi sẽ kết hợp lý thuyết với các nghiên cứu điển hình tương tác và các hoạt động nhóm, tập trung vào phát triển tài năng, giải quyết xung đột, quản lý hiệu suất và xây dựng văn hóa trách nhiệm.' },
    { en: 'The program fee of $1,200 covers all four sessions, workshop materials, and a complimentary one-year membership to the Apex Online Learning Hub. Payment is due by September 3. Please note that a cancellation fee of $200 applies if you cancel within 7 days of the program start date; no refund is available after September 1.\n\nThe venue is the Meridian Conference Center, 8 Sunset Drive, Level 2, Room 4. Parking is available in the basement at $12 per day.\n\nPlease feel free to contact us at workshops@apexacademy.com if you have any questions.\n\nBest regards,\nApex Leadership Academy', vi: 'Phí chương trình 1.200 đô la bao gồm cả bốn buổi, tài liệu hội thảo và tư cách thành viên miễn phí một năm tại Apex Online Learning Hub. Thanh toán phải được thực hiện trước ngày 3 tháng 9. Xin lưu ý rằng khoản phí hủy 200 đô la được áp dụng nếu bạn hủy trong vòng 7 ngày trước ngày bắt đầu chương trình; không có hoàn tiền sau ngày 1 tháng 9.\n\nĐịa điểm là Meridian Conference Center, 8 Sunset Drive, Tầng 2, Phòng 4. Đỗ xe có sẵn ở tầng hầm với giá 12 đô la mỗi ngày.\n\nVui lòng liên hệ với chúng tôi tại workshops@apexacademy.com nếu bạn có bất kỳ câu hỏi nào.\n\nTrân trọng,\nApex Leadership Academy' },
  ],
  vocabulary: [
    { word: 'facilitated by', pos: 'phrase', ipa: '/fəˈsɪlɪteɪtɪd baɪ/', meaning: 'được hướng dẫn bởi, điều phối bởi' },
    { word: 'conflict resolution', pos: 'n', ipa: '/ˈkɒnflɪkt ˌrezəˈluːʃn/', meaning: 'giải quyết xung đột' },
    { word: 'accountability culture', pos: 'n', ipa: '/əˌkaʊntəˈbɪlɪti ˈkʌltʃər/', meaning: 'văn hóa trách nhiệm giải trình' },
    { word: 'cancellation fee', pos: 'n', ipa: '/ˌkænsəˈleɪʃn fiː/', meaning: 'phí hủy bỏ' },
    { word: 'complimentary', pos: 'adj', ipa: '/ˌkɒmplɪˈmentri/', meaning: 'miễn phí, được tặng kèm' },
  ],
  questions: [
    { prompt: 'Who will facilitate the workshop series?', options: [{ label: 'A', text: 'Ms. Abdullah', translation: 'Bà Abdullah' }, { label: 'B', text: 'Dr. Karim Nassar', translation: 'Tiến sĩ Karim Nassar' }, { label: 'C', text: 'The Apex Leadership team', translation: 'Đội Apex Leadership' }, { label: 'D', text: 'A Fortune 500 company executive', translation: 'Một giám đốc điều hành công ty Fortune 500' }], correctAnswer: 'B', explanation: '"The program will be facilitated by Dr. Karim Nassar" — chương trình do Tiến sĩ Karim Nassar hướng dẫn.' },
    { prompt: 'What is included in the $1,200 program fee?', options: [{ label: 'A', text: 'Four sessions, materials, and one-year online membership', translation: 'Bốn buổi, tài liệu và tư cách thành viên trực tuyến một năm' }, { label: 'B', text: 'Four sessions and materials only', translation: 'Chỉ bốn buổi và tài liệu' }, { label: 'C', text: 'Four sessions, meals, and parking', translation: 'Bốn buổi, bữa ăn và đỗ xe' }, { label: 'D', text: 'Three sessions and a certification exam', translation: 'Ba buổi và kỳ thi chứng nhận' }], correctAnswer: 'A', explanation: '"covers all four sessions, workshop materials, and a complimentary one-year membership" — bốn buổi, tài liệu và thành viên một năm miễn phí.' },
    { prompt: 'What is the cancellation fee if cancelled within 7 days of the start?', options: [{ label: 'A', text: '$100', translation: '100 đô la' }, { label: 'B', text: '$200', translation: '200 đô la' }, { label: 'C', text: '$500', translation: '500 đô la' }, { label: 'D', text: 'The full program fee', translation: 'Toàn bộ phí chương trình' }], correctAnswer: 'B', explanation: '"a cancellation fee of $200 applies if you cancel within 7 days" — phí hủy 200 đô la nếu hủy trong 7 ngày.' },
    { prompt: 'What is the cost of parking per day?', options: [{ label: 'A', text: '$8', translation: '8 đô la' }, { label: 'B', text: '$10', translation: '10 đô la' }, { label: 'C', text: '$12', translation: '12 đô la' }, { label: 'D', text: '$15', translation: '15 đô la' }], correctAnswer: 'C', explanation: '"Parking is available in the basement at $12 per day" — đỗ xe 12 đô la mỗi ngày.' },
  ]
},

{
  level: 2, category: 'Advertisement', readTime: '4 phút',
  title: 'Accounting Software for Small Business',
  paragraphs: [
    { en: 'INTRODUCING CLEARBOOKS PRO — THE SMART ACCOUNTING SOFTWARE FOR GROWING BUSINESSES\n\nManaging your finances shouldn\'t be complicated. ClearBooks Pro is the all-in-one accounting solution designed specifically for small and medium-sized businesses that need professional financial management without the complexity or high cost of enterprise software.\n\nKey Features:\n• Automated invoicing and payment tracking\n• Real-time profit & loss reporting\n• Payroll management for up to 50 employees\n• Bank reconciliation with 500+ bank integrations\n• Tax preparation and filing assistance\n• Multi-currency support for international transactions', vi: 'GIỚI THIỆU CLEARBOOKS PRO — PHẦN MỀM KẾ TOÁN THÔNG MINH CHO DOANH NGHIỆP ĐANG PHÁT TRIỂN\n\nQuản lý tài chính của bạn không nên phức tạp. ClearBooks Pro là giải pháp kế toán tất cả trong một được thiết kế đặc biệt cho các doanh nghiệp vừa và nhỏ cần quản lý tài chính chuyên nghiệp mà không cần độ phức tạp hay chi phí cao của phần mềm doanh nghiệp lớn.\n\nTính năng chính:\n• Xuất hóa đơn tự động và theo dõi thanh toán\n• Báo cáo lãi & lỗ theo thời gian thực\n• Quản lý bảng lương cho tối đa 50 nhân viên\n• Đối chiếu ngân hàng với hơn 500 tích hợp ngân hàng\n• Hỗ trợ chuẩn bị và nộp thuế\n• Hỗ trợ đa tiền tệ cho các giao dịch quốc tế' },
    { en: 'Pricing Plans:\n• Starter: $29/month — Up to 2 users, core invoicing & reporting\n• Professional: $59/month — Up to 10 users, all features + payroll\n• Enterprise: $99/month — Unlimited users, priority support, custom reporting\n\nAll plans include a 30-day free trial. No credit card required to start.\n\nJoin over 40,000 businesses already using ClearBooks Pro. Rated 4.8/5 by 12,000+ users.\n\nStart your free trial today at www.clearbookspro.com', vi: 'Gói Giá:\n• Khởi đầu: 29 đô la/tháng — Tối đa 2 người dùng, hóa đơn cốt lõi & báo cáo\n• Chuyên nghiệp: 59 đô la/tháng — Tối đa 10 người dùng, tất cả tính năng + bảng lương\n• Doanh nghiệp: 99 đô la/tháng — Không giới hạn người dùng, hỗ trợ ưu tiên, báo cáo tùy chỉnh\n\nTất cả các gói bao gồm dùng thử miễn phí 30 ngày. Không cần thẻ tín dụng để bắt đầu.\n\nTham gia hơn 40.000 doanh nghiệp đang sử dụng ClearBooks Pro. Được đánh giá 4,8/5 bởi hơn 12.000 người dùng.\n\nBắt đầu dùng thử miễn phí của bạn ngay hôm nay tại www.clearbookspro.com' },
  ],
  vocabulary: [
    { word: 'invoicing', pos: 'n', ipa: '/ˈɪnvɔɪsɪŋ/', meaning: 'xuất hóa đơn, lập hóa đơn' },
    { word: 'bank reconciliation', pos: 'n', ipa: '/bæŋk ˌrekənsɪliˈeɪʃn/', meaning: 'đối chiếu ngân hàng' },
    { word: 'payroll', pos: 'n', ipa: '/ˈpeɪroʊl/', meaning: 'bảng lương, quỹ lương' },
    { word: 'multi-currency', pos: 'adj', ipa: '/ˈmʌlti ˈkʌrənsi/', meaning: 'đa tiền tệ, hỗ trợ nhiều loại tiền' },
    { word: 'enterprise software', pos: 'n', ipa: '/ˈentərpraɪz ˈsɒftwer/', meaning: 'phần mềm doanh nghiệp lớn' },
  ],
  questions: [
    { prompt: 'How many bank integrations does ClearBooks Pro support?', options: [{ label: 'A', text: 'Over 50', translation: 'Hơn 50' }, { label: 'B', text: 'Over 200', translation: 'Hơn 200' }, { label: 'C', text: 'Over 500', translation: 'Hơn 500' }, { label: 'D', text: 'Over 1,000', translation: 'Hơn 1.000' }], correctAnswer: 'C', explanation: '"Bank reconciliation with 500+ bank integrations" — hỗ trợ hơn 500 tích hợp ngân hàng.' },
    { prompt: 'What is the maximum number of employees supported by the payroll feature?', options: [{ label: 'A', text: '10', translation: '10' }, { label: 'B', text: '20', translation: '20' }, { label: 'C', text: '50', translation: '50' }, { label: 'D', text: '100', translation: '100' }], correctAnswer: 'C', explanation: '"Payroll management for up to 50 employees" — quản lý bảng lương tối đa 50 nhân viên.' },
    { prompt: 'Which plan includes unlimited users?', options: [{ label: 'A', text: 'Starter', translation: 'Khởi đầu' }, { label: 'B', text: 'Professional', translation: 'Chuyên nghiệp' }, { label: 'C', text: 'Enterprise', translation: 'Doanh nghiệp' }, { label: 'D', text: 'All plans', translation: 'Tất cả các gói' }], correctAnswer: 'C', explanation: '"Enterprise: $99/month — Unlimited users" — gói Doanh nghiệp có người dùng không giới hạn.' },
    { prompt: 'How long is the free trial period?', options: [{ label: 'A', text: '7 days', translation: '7 ngày' }, { label: 'B', text: '14 days', translation: '14 ngày' }, { label: 'C', text: '30 days', translation: '30 ngày' }, { label: 'D', text: '60 days', translation: '60 ngày' }], correctAnswer: 'C', explanation: '"All plans include a 30-day free trial" — tất cả gói dùng thử miễn phí 30 ngày.' },
  ]
},

];

async function seed() {
  await mongoose.connect(MONGO_URI);
  console.log('✅ Connected:', MONGO_URI);

  const deleted = await ReadingExercise.deleteMany({ mode: 'bilingual' });
  console.log(`🗑️  Deleted ${deleted.deletedCount} old bilingual records`);

  let count = 0;
  for (const article of articles) {
    await makeDoc(article).save();
    count++;
    console.log(`✅ [${count}/${articles.length}] L${article.level}: "${article.title}"`);
  }

  console.log('\n📊 Final counts:');
  for (let lvl = 1; lvl <= 2; lvl++) {
    const cnt = await ReadingExercise.countDocuments({ mode: 'bilingual', level: lvl });
    console.log(`  Level ${lvl}: ${cnt} articles`);
  }
  const total = await ReadingExercise.countDocuments({ mode: 'bilingual' });
  console.log(`  TOTAL: ${total} bilingual articles`);

  await mongoose.disconnect();
  console.log('\n🎉 Bilingual 2-level seed complete!');
}

seed().catch(console.error);
