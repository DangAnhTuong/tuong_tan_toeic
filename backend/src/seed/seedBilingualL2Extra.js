/**
 * seedBilingualL2Extra.js — Thêm 4 bài Level 2 còn thiếu
 */
const mongoose = require('mongoose');
const MONGO_URI = 'mongodb://127.0.0.1:27017/tuong_tan_toeic';

const schema = new mongoose.Schema({
  title: String, subTitle: String, mode: String, level: Number, levelName: String,
  levelBadge: String, part: String, partNumber: Number, topic: String,
  articleCategory: String, readTime: String, isPro: Boolean, totalQuestions: Number,
  questions: Array, bilingualArticle: Object,
  createdAt: { type: Date, default: Date.now }, updatedAt: { type: Date, default: Date.now }
}, { collection: 'readingexercises' });
const R = mongoose.model('ReadingExercise', schema);

function makeDoc(a) {
  const questions = a.questions.map((q, i) => ({
    questionNumber: i + 1, prompt: q.prompt,
    options: q.options.map(o => ({ label: o.label, text: o.text, translation: o.translation, isCorrect: o.label === q.correct })),
    correctAnswer: q.correct, explanation: q.explanation,
  }));
  return new R({
    title: a.title, subTitle: `Đọc song ngữ Anh-Việt — ${a.cat}`, mode: 'bilingual',
    level: 2, levelName: 'Level 2', levelBadge: 'Lv2', part: 'Part 7', partNumber: 7,
    articleCategory: a.cat, readTime: a.time, isPro: true, totalQuestions: questions.length, questions,
    bilingualArticle: {
      title: a.title, badge: 'Lv2', category: a.cat, readTime: a.time, levelText: 'Level 2', audioUrl: '',
      paragraphs: a.paragraphs.map((p, i) => ({ paragraphNum: i + 1, en: p.en, vi: p.vi })),
      vocabulary: a.vocab.map(v => ({ word: v.word, pos: v.pos, ipa: v.ipa, meaning: v.meaning })),
      questions,
    },
  });
}

const extra = [
  {
    cat: 'Report', time: '4 phút',
    title: 'Annual Sales Performance Report',
    paragraphs: [
      { en: 'MERIDIAN ELECTRONICS — ANNUAL SALES REPORT Q4 SUMMARY\n\nTotal Revenue: $14.8 million (up 22% from Q4 last year)\nUnits Sold: 87,400\nTop-Selling Product: ProSound X3 Wireless Speaker (34% of total revenue)\nNew Markets Entered: Vietnam, Thailand, and the Philippines\n\nThe Q4 results represent the strongest quarter in the company\'s eight-year history. Growth was driven primarily by the successful launch of the ProSound X3 in September, which exceeded first-quarter sales projections by 41%.', vi: 'MERIDIAN ELECTRONICS — BÁO CÁO DOANH SỐ THƯỜNG NIÊN TÓM TẮT Q4\n\nTổng Doanh thu: 14,8 triệu đô la (tăng 22% so với Q4 năm ngoái)\nSố đơn vị bán ra: 87.400\nSản phẩm bán chạy nhất: Loa Không dây ProSound X3 (34% tổng doanh thu)\nThị trường mới gia nhập: Việt Nam, Thái Lan và Philippines\n\nKết quả Q4 đại diện cho quý mạnh nhất trong lịch sử tám năm của công ty. Tăng trưởng chủ yếu được thúc đẩy bởi việc ra mắt thành công ProSound X3 vào tháng 9, vượt dự báo doanh số quý đầu tiên 41%.' },
      { en: 'Regional performance varied significantly. The Asia-Pacific region achieved 38% year-over-year growth, becoming the company\'s largest revenue contributor for the first time. North America remained stable at 4% growth, while Europe experienced a 7% decline attributed to increased competition and unfavorable currency exchange rates.\n\nLooking ahead to Q1 of the new year, the company plans to introduce two new product lines — the ProSound X4 and the SmartHome Connect series — and expand distribution partnerships in Southeast Asia. The sales team has been increased by 15 staff to support this expansion.', vi: 'Hiệu suất theo khu vực có sự khác biệt đáng kể. Khu vực Châu Á-Thái Bình Dương đạt tăng trưởng 38% so với cùng kỳ năm trước, trở thành đóng góp doanh thu lớn nhất của công ty lần đầu tiên. Bắc Mỹ duy trì ổn định với mức tăng trưởng 4%, trong khi Châu Âu trải qua mức giảm 7% do cạnh tranh gia tăng và tỷ giá hối đoái bất lợi.\n\nNhìn về Q1 của năm mới, công ty có kế hoạch giới thiệu hai dòng sản phẩm mới — ProSound X4 và dòng SmartHome Connect — và mở rộng quan hệ đối tác phân phối ở Đông Nam Á. Đội bán hàng đã được tăng thêm 15 nhân viên để hỗ trợ việc mở rộng này.' },
    ],
    vocab: [
      { word: 'year-over-year', pos: 'adj', ipa: '/jɪər ˈoʊvər jɪər/', meaning: 'so với cùng kỳ năm ngoái' },
      { word: 'revenue contributor', pos: 'n', ipa: '/ˈrevənjuː kənˈtrɪbjuːtər/', meaning: 'nguồn đóng góp doanh thu' },
      { word: 'unfavorable', pos: 'adj', ipa: '/ʌnˈfeɪvərəbl/', meaning: 'bất lợi, không thuận lợi' },
      { word: 'distribution partnership', pos: 'n', ipa: '/ˌdɪstrɪˈbjuːʃn ˈpɑːrtnərʃɪp/', meaning: 'quan hệ đối tác phân phối' },
      { word: 'projections', pos: 'n', ipa: '/prəˈdʒekʃnz/', meaning: 'dự báo, dự đoán' },
    ],
    questions: [
      { prompt: 'By how much did Q4 revenue increase compared to last year?', options: [{ label: 'A', text: '15%', translation: '15%' }, { label: 'B', text: '22%', translation: '22%' }, { label: 'C', text: '38%', translation: '38%' }, { label: 'D', text: '41%', translation: '41%' }], correct: 'B', explanation: '"up 22% from Q4 last year" — doanh thu Q4 tăng 22% so với năm ngoái.' },
      { prompt: 'Which product contributed most to total revenue?', options: [{ label: 'A', text: 'SmartHome Connect Series', translation: 'Dòng SmartHome Connect' }, { label: 'B', text: 'ProSound X4', translation: 'ProSound X4' }, { label: 'C', text: 'ProSound X3 Wireless Speaker', translation: 'Loa Không dây ProSound X3' }, { label: 'D', text: 'ProSound X3 Headphones', translation: 'Tai nghe ProSound X3' }], correct: 'C', explanation: '"Top-Selling Product: ProSound X3 Wireless Speaker (34% of total revenue)" — ProSound X3 chiếm 34% tổng doanh thu.' },
      { prompt: 'Which region became the largest revenue contributor for the first time?', options: [{ label: 'A', text: 'North America', translation: 'Bắc Mỹ' }, { label: 'B', text: 'Europe', translation: 'Châu Âu' }, { label: 'C', text: 'Asia-Pacific', translation: 'Châu Á-Thái Bình Dương' }, { label: 'D', text: 'South America', translation: 'Nam Mỹ' }], correct: 'C', explanation: '"The Asia-Pacific region...becoming the company\'s largest revenue contributor for the first time" — Châu Á-Thái Bình Dương lần đầu trở thành nguồn doanh thu lớn nhất.' },
      { prompt: 'By how much did Europe\'s sales decline?', options: [{ label: 'A', text: '4%', translation: '4%' }, { label: 'B', text: '7%', translation: '7%' }, { label: 'C', text: '10%', translation: '10%' }, { label: 'D', text: '15%', translation: '15%' }], correct: 'B', explanation: '"Europe experienced a 7% decline" — Châu Âu giảm 7%.' },
    ]
  },
  {
    cat: 'E-mail', time: '4 phút',
    title: 'Job Offer Letter',
    paragraphs: [
      { en: 'Dear Ms. Pham,\n\nOn behalf of NovaBridge Consulting, I am delighted to extend a formal offer of employment for the position of Senior Business Analyst, reporting to the Director of Strategy. This is a full-time permanent role based in our Singapore office, with the option to work remotely up to one day per week.\n\nYour starting salary will be SGD $8,500 per month. You will also be eligible for an annual performance bonus of up to 15% of your base salary, subject to both individual and company performance targets being met.', vi: 'Kính gửi bà Pham,\n\nThay mặt NovaBridge Consulting, tôi rất vui mừng gửi đề nghị làm việc chính thức cho vị trí Chuyên viên Phân tích Kinh doanh Cấp cao, báo cáo cho Giám đốc Chiến lược. Đây là vai trò toàn thời gian cố định tại văn phòng Singapore của chúng tôi, với tùy chọn làm việc từ xa tối đa một ngày mỗi tuần.\n\nMức lương khởi điểm của bạn sẽ là 8.500 SGD/tháng. Bạn cũng sẽ đủ điều kiện nhận thưởng hiệu suất hàng năm lên đến 15% mức lương cơ bản, tùy thuộc vào việc đáp ứng các mục tiêu hiệu suất cá nhân và công ty.' },
      { en: 'The role includes the following benefits: medical and dental insurance (covering you and immediate family), 20 days of annual leave (increasing to 25 days after 3 years), a professional development allowance of SGD $2,000 per year, and a laptop and mobile phone provided for business use.\n\nPlease confirm your acceptance of this offer by signing and returning the enclosed contract by October 15. Your proposed start date is November 3. If you have any questions before then, please do not hesitate to contact me directly.\n\nWarm regards,\nJamila Harris\nHead of Talent Acquisition, NovaBridge Consulting', vi: 'Vai trò bao gồm các phúc lợi sau: bảo hiểm y tế và nha khoa (bao gồm bạn và gia đình trực tiếp), 20 ngày nghỉ phép hàng năm (tăng lên 25 ngày sau 3 năm), trợ cấp phát triển chuyên môn 2.000 SGD mỗi năm và laptop và điện thoại di động được cung cấp cho công việc.\n\nVui lòng xác nhận chấp thuận đề nghị này bằng cách ký và trả lại hợp đồng kèm theo trước ngày 15 tháng 10. Ngày bắt đầu được đề xuất của bạn là ngày 3 tháng 11. Nếu bạn có bất kỳ câu hỏi nào trước đó, xin đừng ngần ngại liên hệ trực tiếp với tôi.\n\nTrân trọng,\nJamila Harris\nTrưởng Bộ phận Thu hút Nhân tài, NovaBridge Consulting' },
    ],
    vocab: [
      { word: 'formal offer of employment', pos: 'n', ipa: '/ˈfɔːrml ˈɒfər əv ɪmˈplɔɪmənt/', meaning: 'đề nghị làm việc chính thức' },
      { word: 'performance bonus', pos: 'n', ipa: '/pərˈfɔːrməns ˈboʊnəs/', meaning: 'thưởng hiệu suất' },
      { word: 'annual leave', pos: 'n', ipa: '/ˈænjuəl liːv/', meaning: 'nghỉ phép hàng năm' },
      { word: 'allowance', pos: 'n', ipa: '/əˈlaʊəns/', meaning: 'trợ cấp, khoản phụ cấp' },
      { word: 'acceptance', pos: 'n', ipa: '/əkˈseptəns/', meaning: 'sự chấp nhận, sự đồng ý' },
    ],
    questions: [
      { prompt: 'What is Ms. Pham\'s starting monthly salary?', options: [{ label: 'A', text: 'SGD $7,500', translation: '7.500 SGD' }, { label: 'B', text: 'SGD $8,000', translation: '8.000 SGD' }, { label: 'C', text: 'SGD $8,500', translation: '8.500 SGD' }, { label: 'D', text: 'SGD $9,500', translation: '9.500 SGD' }], correct: 'C', explanation: '"Your starting salary will be SGD $8,500 per month" — lương khởi điểm 8.500 SGD/tháng.' },
      { prompt: 'How many days of annual leave does the role start with?', options: [{ label: 'A', text: '15 days', translation: '15 ngày' }, { label: 'B', text: '18 days', translation: '18 ngày' }, { label: 'C', text: '20 days', translation: '20 ngày' }, { label: 'D', text: '25 days', translation: '25 ngày' }], correct: 'C', explanation: '"20 days of annual leave (increasing to 25 days after 3 years)" — bắt đầu với 20 ngày nghỉ.' },
      { prompt: 'By when must Ms. Pham return the signed contract?', options: [{ label: 'A', text: 'October 3', translation: 'Ngày 3 tháng 10' }, { label: 'B', text: 'October 15', translation: 'Ngày 15 tháng 10' }, { label: 'C', text: 'November 1', translation: 'Ngày 1 tháng 11' }, { label: 'D', text: 'November 3', translation: 'Ngày 3 tháng 11' }], correct: 'B', explanation: '"signing and returning the enclosed contract by October 15" — ký và trả hợp đồng trước ngày 15 tháng 10.' },
      { prompt: 'What is the annual professional development allowance?', options: [{ label: 'A', text: 'SGD $1,000', translation: '1.000 SGD' }, { label: 'B', text: 'SGD $1,500', translation: '1.500 SGD' }, { label: 'C', text: 'SGD $2,000', translation: '2.000 SGD' }, { label: 'D', text: 'SGD $2,500', translation: '2.500 SGD' }], correct: 'C', explanation: '"a professional development allowance of SGD $2,000 per year" — trợ cấp phát triển chuyên môn 2.000 SGD/năm.' },
    ]
  },
  {
    cat: 'Article', time: '4 phút',
    title: 'Rise of Sustainable Packaging',
    paragraphs: [
      { en: 'Consumer pressure and new government regulations are compelling businesses across multiple industries to adopt sustainable packaging solutions at an unprecedented pace. A recent industry survey found that 73% of consumers in developed markets consider a company\'s environmental practices when making purchasing decisions, up from 58% just three years ago.\n\nThe food and beverage industry has been among the quickest to respond, with major brands like FreshChoice and GreenBite committing to fully recyclable or compostable packaging across their entire product range by 2026. Several companies have already eliminated single-use plastics, replacing them with plant-based or recycled materials.', vi: 'Áp lực từ người tiêu dùng và các quy định mới của chính phủ đang buộc các doanh nghiệp trong nhiều ngành phải áp dụng các giải pháp bao bì bền vững với tốc độ chưa từng có. Một cuộc khảo sát ngành gần đây cho thấy 73% người tiêu dùng ở các thị trường phát triển cân nhắc đến các hoạt động môi trường của công ty khi đưa ra quyết định mua hàng, tăng từ 58% chỉ ba năm trước.\n\nNgành thực phẩm và đồ uống là một trong những ngành phản ứng nhanh nhất, với các thương hiệu lớn như FreshChoice và GreenBite cam kết sử dụng bao bì hoàn toàn tái chế hoặc có thể phân hủy sinh học trên toàn bộ phạm vi sản phẩm của họ vào năm 2026. Một số công ty đã loại bỏ nhựa dùng một lần, thay thế bằng vật liệu có nguồn gốc thực vật hoặc tái chế.' },
      { en: 'However, transitioning to sustainable packaging comes with significant cost challenges. On average, eco-friendly packaging costs 20 to 35% more than conventional alternatives. To offset these costs, some brands have introduced slight price increases, while others are absorbing the costs as a long-term investment in brand reputation.\n\nIndustry analysts predict that as demand for sustainable materials grows and production scales up, costs will decrease substantially over the next five years. Meanwhile, companies that fail to transition risk losing market share to competitors who already position sustainability as a core brand value.', vi: 'Tuy nhiên, việc chuyển đổi sang bao bì bền vững đi kèm với những thách thức chi phí đáng kể. Trung bình, bao bì thân thiện với môi trường đắt hơn 20 đến 35% so với các lựa chọn thay thế thông thường. Để bù đắp những chi phí này, một số thương hiệu đã tăng giá nhẹ, trong khi những thương hiệu khác đang hấp thụ chi phí như một khoản đầu tư dài hạn vào danh tiếng thương hiệu.\n\nCác nhà phân tích ngành dự đoán rằng khi nhu cầu về vật liệu bền vững tăng lên và sản xuất mở rộng quy mô, chi phí sẽ giảm đáng kể trong năm năm tới. Trong khi đó, các công ty không chuyển đổi có nguy cơ mất thị phần vào tay các đối thủ cạnh tranh đã định vị tính bền vững là giá trị thương hiệu cốt lõi.' },
    ],
    vocab: [
      { word: 'compostable', pos: 'adj', ipa: '/ˈkɒmpɒstəbl/', meaning: 'có thể phân hủy thành phân bón, phân hủy sinh học' },
      { word: 'single-use plastics', pos: 'n', ipa: '/ˈsɪŋɡl juːs ˈplæstɪks/', meaning: 'nhựa dùng một lần' },
      { word: 'offset', pos: 'v', ipa: '/ˈɒfset/', meaning: 'bù đắp, bù trừ' },
      { word: 'absorbing the costs', pos: 'phrase', ipa: '/əbˈzɔːrbɪŋ ðə kɒsts/', meaning: 'gánh chịu chi phí, chịu lỗ' },
      { word: 'market share', pos: 'n', ipa: '/ˈmɑːrkɪt ʃer/', meaning: 'thị phần' },
    ],
    questions: [
      { prompt: 'What percentage of consumers consider environmental practices when buying?', options: [{ label: 'A', text: '58%', translation: '58%' }, { label: 'B', text: '65%', translation: '65%' }, { label: 'C', text: '73%', translation: '73%' }, { label: 'D', text: '80%', translation: '80%' }], correct: 'C', explanation: '"73% of consumers...consider a company\'s environmental practices when making purchasing decisions" — 73% cân nhắc đến yếu tố môi trường.' },
      { prompt: 'By what year have brands like FreshChoice committed to fully recyclable packaging?', options: [{ label: 'A', text: '2024', translation: '2024' }, { label: 'B', text: '2025', translation: '2025' }, { label: 'C', text: '2026', translation: '2026' }, { label: 'D', text: '2030', translation: '2030' }], correct: 'C', explanation: '"committing to fully recyclable or compostable packaging...by 2026" — cam kết đến năm 2026.' },
      { prompt: 'How much more expensive is eco-friendly packaging on average?', options: [{ label: 'A', text: '10 to 15% more', translation: 'Đắt hơn 10 đến 15%' }, { label: 'B', text: '15 to 20% more', translation: 'Đắt hơn 15 đến 20%' }, { label: 'C', text: '20 to 35% more', translation: 'Đắt hơn 20 đến 35%' }, { label: 'D', text: '30 to 50% more', translation: 'Đắt hơn 30 đến 50%' }], correct: 'C', explanation: '"eco-friendly packaging costs 20 to 35% more than conventional alternatives" — đắt hơn 20 đến 35%.' },
      { prompt: 'What risk do companies that fail to transition face?', options: [{ label: 'A', text: 'Higher production costs', translation: 'Chi phí sản xuất cao hơn' }, { label: 'B', text: 'Government penalties', translation: 'Phạt tiền từ chính phủ' }, { label: 'C', text: 'Losing market share to competitors', translation: 'Mất thị phần vào tay đối thủ' }, { label: 'D', text: 'Reduced consumer ratings', translation: 'Điểm đánh giá người tiêu dùng giảm' }], correct: 'C', explanation: '"risk losing market share to competitors" — nguy cơ mất thị phần vào tay đối thủ.' },
    ]
  },
  {
    cat: 'Article', time: '4 phút',
    title: 'The Rise of Co-Working Spaces',
    paragraphs: [
      { en: 'The global co-working space industry has experienced remarkable growth over the past decade, fueled by the surge in freelance work, remote employment, and the rise of startups. According to the Global Workspace Association, there are now over 35,000 co-working spaces worldwide, serving approximately 5 million members — a figure projected to reach 8 million by 2028.\n\nCo-working spaces appeal to a wide range of users. While freelancers and solo entrepreneurs remain the primary demographic, an increasing number of corporations are now booking co-working desks for remote employees rather than investing in permanent satellite offices. This trend has prompted co-working providers to expand their service offerings beyond desk rental.', vi: 'Ngành không gian làm việc chung toàn cầu đã trải qua sự tăng trưởng đáng kể trong thập kỷ qua, được thúc đẩy bởi sự bùng nổ công việc tự do, việc làm từ xa và sự nổi lên của các công ty khởi nghiệp. Theo Hiệp hội Không gian Làm việc Toàn cầu, hiện có hơn 35.000 không gian làm việc chung trên toàn thế giới, phục vụ khoảng 5 triệu thành viên — một con số được dự báo sẽ đạt 8 triệu vào năm 2028.\n\nCác không gian làm việc chung thu hút nhiều đối tượng người dùng khác nhau. Trong khi những người làm việc tự do và doanh nhân độc lập vẫn là nhân khẩu học chính, ngày càng có nhiều tập đoàn đặt bàn làm việc chung cho nhân viên từ xa thay vì đầu tư vào văn phòng vệ tinh cố định. Xu hướng này đã thúc đẩy các nhà cung cấp không gian làm việc chung mở rộng dịch vụ của họ ngoài việc cho thuê bàn làm việc.' },
      { en: 'Today\'s leading co-working providers like WorkHive and SpacePlus now offer private offices for small teams, meeting room hire, virtual office addresses for business registration, event spaces, and even wellness amenities like gyms and meditation rooms. Monthly membership fees vary widely, from $100 for basic hot-desking plans to over $800 for private team suites.\n\nDespite the sector\'s growth, challenges remain. Retention of members is a persistent issue, with many users switching providers in search of better pricing or amenities. Operators are responding with loyalty programs, flexible month-to-month contracts, and enhanced community-building events to increase member engagement and reduce churn.', vi: 'Các nhà cung cấp không gian làm việc chung hàng đầu ngày nay như WorkHive và SpacePlus hiện cung cấp văn phòng riêng cho các nhóm nhỏ, cho thuê phòng họp, địa chỉ văn phòng ảo để đăng ký kinh doanh, không gian sự kiện và thậm chí cả tiện nghi sức khỏe như phòng gym và phòng thiền. Phí thành viên hàng tháng thay đổi đáng kể, từ 100 đô la cho các gói hot-desking cơ bản đến hơn 800 đô la cho các suite nhóm riêng tư.\n\nMặc dù ngành đang tăng trưởng, vẫn còn những thách thức. Giữ chân thành viên là một vấn đề dai dẳng, với nhiều người dùng chuyển đổi nhà cung cấp để tìm kiếm giá tốt hơn hoặc tiện nghi tốt hơn. Các nhà vận hành đang phản hồi bằng các chương trình khách hàng thân thiết, hợp đồng linh hoạt theo tháng và các sự kiện xây dựng cộng đồng được nâng cao để tăng sự gắn kết của thành viên và giảm tỷ lệ rời bỏ.' },
    ],
    vocab: [
      { word: 'co-working space', pos: 'n', ipa: '/koʊ ˈwɜːrkɪŋ speɪs/', meaning: 'không gian làm việc chung' },
      { word: 'freelance', pos: 'adj/n', ipa: '/ˈfriːlæns/', meaning: 'làm việc tự do, freelancer' },
      { word: 'hot-desking', pos: 'n', ipa: '/hɒt ˈdeskɪŋ/', meaning: 'làm việc không có bàn cố định, thuê bàn theo giờ/ngày' },
      { word: 'churn', pos: 'n', ipa: '/tʃɜːrn/', meaning: 'tỷ lệ khách hàng rời bỏ' },
      { word: 'amenities', pos: 'n', ipa: '/əˈmiːnɪtiz/', meaning: 'tiện nghi, tiện ích' },
    ],
    questions: [
      { prompt: 'How many co-working spaces exist worldwide currently?', options: [{ label: 'A', text: 'Over 5,000', translation: 'Hơn 5.000' }, { label: 'B', text: 'Over 15,000', translation: 'Hơn 15.000' }, { label: 'C', text: 'Over 35,000', translation: 'Hơn 35.000' }, { label: 'D', text: 'Over 50,000', translation: 'Hơn 50.000' }], correct: 'C', explanation: '"there are now over 35,000 co-working spaces worldwide" — hơn 35.000 không gian làm việc chung.' },
      { prompt: 'What has prompted co-working providers to expand their services?', options: [{ label: 'A', text: 'Government grants for co-working spaces', translation: 'Trợ cấp chính phủ cho không gian làm việc chung' }, { label: 'B', text: 'Corporations booking desks for remote employees', translation: 'Các tập đoàn đặt bàn làm việc cho nhân viên từ xa' }, { label: 'C', text: 'An increase in international business travelers', translation: 'Sự gia tăng khách du lịch kinh doanh quốc tế' }, { label: 'D', text: 'Lower commercial real estate prices', translation: 'Giá bất động sản thương mại thấp hơn' }], correct: 'B', explanation: '"corporations are now booking co-working desks for remote employees...prompted co-working providers to expand" — tập đoàn đặt bàn thúc đẩy mở rộng dịch vụ.' },
      { prompt: 'What is the price range for monthly membership fees?', options: [{ label: 'A', text: '$50 to $400', translation: '50 đến 400 đô la' }, { label: 'B', text: '$100 to over $800', translation: '100 đến hơn 800 đô la' }, { label: 'C', text: '$200 to $1,000', translation: '200 đến 1.000 đô la' }, { label: 'D', text: '$500 to $2,000', translation: '500 đến 2.000 đô la' }], correct: 'B', explanation: '"from $100 for basic hot-desking plans to over $800 for private team suites" — từ 100 đến hơn 800 đô la.' },
      { prompt: 'How are operators addressing the member retention challenge?', options: [{ label: 'A', text: 'By lowering prices and reducing services', translation: 'Bằng cách giảm giá và giảm dịch vụ' }, { label: 'B', text: 'With loyalty programs, flexible contracts, and community events', translation: 'Với chương trình thân thiết, hợp đồng linh hoạt và sự kiện cộng đồng' }, { label: 'C', text: 'By opening more locations in suburban areas', translation: 'Bằng cách mở thêm địa điểm ở khu vực ngoại ô' }, { label: 'D', text: 'By partnering exclusively with large corporations', translation: 'Bằng cách hợp tác độc quyền với các tập đoàn lớn' }], correct: 'B', explanation: '"loyalty programs, flexible month-to-month contracts, and enhanced community-building events" — ba giải pháp giữ chân thành viên.' },
    ]
  },
];

async function run() {
  await mongoose.connect(MONGO_URI);
  console.log('✅ Connected');
  let count = 0;
  for (const a of extra) {
    await makeDoc(a).save();
    count++;
    console.log(`✅ [${count}/${extra.length}] L2: "${a.title}"`);
  }
  const total = await R.countDocuments({ mode: 'bilingual' });
  const l1 = await R.countDocuments({ mode: 'bilingual', level: 1 });
  const l2 = await R.countDocuments({ mode: 'bilingual', level: 2 });
  console.log(`\n📊 Level 1: ${l1} | Level 2: ${l2} | TOTAL: ${total}`);
  await mongoose.disconnect();
  console.log('🎉 Done!');
}
run().catch(console.error);
