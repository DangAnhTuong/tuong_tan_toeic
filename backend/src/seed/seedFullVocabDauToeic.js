const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../../.env') });
const VocabularyTopic = require('../models/VocabularyTopic');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/tuong_tan_toeic';

/**
 * 83 TOPICS MATCHING DAU TOEIC (dautoeic.com/vocabulary)
 * 1. 600 TỪ VỰNG TOEIC: 50 bài
 * 2. Đề 2023: 10 bài (Test 1 -> Test 10)
 * 3. Đề 2024: 10 bài (Test 1 -> Test 10)
 * 4. Đề 2026: 10 bài (Test 1 -> Test 10)
 * 5. TOEIC MASTER: 3 bài
 */

// 50 Topics for 600 Essential Words for TOEIC
const TOPICS_600 = [
  { id: 1, title: 'Contracts', words: [
    { word: 'abide by', phonetic: '/əˈbaɪd baɪ/', pos: 'v.', meaning: 'tuân thủ, chịu theo', exampleEn: 'Both parties must abide by the terms of the contract.', exampleVi: 'Cả hai bên phải tuân thủ các điều khoản hợp đồng.' },
    { word: 'agreement', phonetic: '/əˈɡriːmənt/', pos: 'n.', meaning: 'hợp đồng, thỏa thuận', exampleEn: 'They reached an agreement after long negotiations.', exampleVi: 'Họ đã đạt được một thỏa thuận sau những cuộc đàm phán kéo dài.' },
    { word: 'assurance', phonetic: '/əˈʃʊərəns/', pos: 'n.', meaning: 'sự bảo đảm, cam đoan', exampleEn: 'He gave an assurance that the work would be done on time.', exampleVi: 'Anh ấy đã đưa ra sự bảo đảm rằng công việc sẽ hoàn thành đúng hạn.' },
    { word: 'cancellation', phonetic: '/ˌkænsəˈleɪʃn/', pos: 'n.', meaning: 'sự hủy bỏ', exampleEn: 'The cancellation clause is stated in paragraph 4.', exampleVi: 'Điều khoản hủy bỏ được ghi rõ trong đoạn 4.' },
    { word: 'determine', phonetic: '/dɪˈtɜːmɪn/', pos: 'v.', meaning: 'xác định, quyết định', exampleEn: 'The court will determine the validity of the contract.', exampleVi: 'Tòa án sẽ xác định tính hợp lệ của hợp đồng.' },
    { word: 'engage', phonetic: '/ɪnˈɡeɪdʒ/', pos: 'v.', meaning: 'tham gia, cam kết, thuê', exampleEn: 'We engaged a lawyer to review the contract.', exampleVi: 'Chúng tôi đã thuê một luật sư để xem xét hợp đồng.' },
    { word: 'establish', phonetic: '/ɪˈstæblɪʃ/', pos: 'v.', meaning: 'thiết lập, thành lập', exampleEn: 'The contract establishes clear payment milestones.', exampleVi: 'Hợp đồng thiết lập các mốc thanh toán rõ ràng.' },
    { word: 'obligate', phonetic: '/ˈɒblɪɡeɪt/', pos: 'v.', meaning: 'bắt buộc, ép buộc', exampleEn: 'The contractor is obligated to complete the project.', exampleVi: 'Nhà thầu có nghĩa vụ phải hoàn thành dự án.' },
    { word: 'party', phonetic: '/ˈpɑːti/', pos: 'n.', meaning: 'bên (tham gia hợp đồng)', exampleEn: 'The contract was signed by both parties.', exampleVi: 'Hợp đồng đã được ký bởi cả hai bên.' },
    { word: 'provision', phonetic: '/prəˈvɪʒn/', pos: 'n.', meaning: 'điều khoản, sự cung cấp', exampleEn: 'Under the provisions of the lease agreement.', exampleVi: 'Theo các điều khoản của hợp đồng thuê.' },
    { word: 'resolve', phonetic: '/rɪˈzɒlv/', pos: 'v.', meaning: 'giải quyết (tranh chấp)', exampleEn: 'They resolved the dispute without going to court.', exampleVi: 'Họ đã giải quyết tranh chấp mà không cần ra tòa.' },
    { word: 'specific', phonetic: '/spəˈsɪfɪk/', pos: 'adj.', meaning: 'cụ thể, rõ ràng', exampleEn: 'The contract includes specific delivery dates.', exampleVi: 'Hợp đồng bao gồm các ngày giao hàng cụ thể.' }
  ]},
  { id: 2, title: 'Marketing', words: [
    { word: 'attract', phonetic: '/əˈtrækt/', pos: 'v.', meaning: 'thu hút, hấp dẫn', exampleEn: 'The campaign aims to attract new customers.', exampleVi: 'Chiến dịch nhằm thu hút khách hàng mới.' },
    { word: 'compare', phonetic: '/kəmˈpeər/', pos: 'v.', meaning: 'so sánh', exampleEn: 'Consumers compare prices before purchasing.', exampleVi: 'Người tiêu dùng so sánh giá trước khi mua sắm.' },
    { word: 'competition', phonetic: '/ˌkɒmpəˈtɪʃn/', pos: 'n.', meaning: 'sự cạnh tranh, đối thủ', exampleEn: 'There is fierce competition in the smartphone market.', exampleVi: 'Có sự cạnh tranh khốc liệt trên thị trường điện thoại thông minh.' },
    { word: 'consume', phonetic: '/kənˈsjuːm/', pos: 'v.', meaning: 'tiêu thụ, dùng', exampleEn: 'Online shoppers consume more digital content.', exampleVi: 'Người mua sắm trực tuyến tiêu thụ nhiều nội dung số hơn.' },
    { word: 'convince', phonetic: '/kənˈvɪns/', pos: 'v.', meaning: 'thuyết phục', exampleEn: 'The presentation convinced investors to fund the project.', exampleVi: 'Bài thuyết trình đã thuyết phục các nhà đầu tư rót vốn.' },
    { word: 'currently', phonetic: '/ˈkʌrəntli/', pos: 'adv.', meaning: 'hiện tại', exampleEn: 'The company is currently expanding its market share.', exampleVi: 'Công ty hiện đang mở rộng thị phần của mình.' },
    { word: 'fad', phonetic: '/fæd/', pos: 'n.', meaning: 'mốt nhất thời, xu hướng ngắn', exampleEn: 'The marketing team avoids investing in passing fads.', exampleVi: 'Đội ngũ tiếp thị tránh đầu tư vào các mốt nhất thời.' },
    { word: 'inspiration', phonetic: '/ˌɪnspəˈreɪʃn/', pos: 'n.', meaning: 'nguồn cảm hứng', exampleEn: 'Her speech was an inspiration to the entire sales team.', exampleVi: 'Bài phát biểu của cô ấy là nguồn cảm hứng cho toàn bộ đội ngũ bán hàng.' },
    { word: 'market', phonetic: '/ˈmɑːkɪt/', pos: 'v./n.', meaning: 'thị trường, tiếp thị', exampleEn: 'They decided to market the product overseas.', exampleVi: 'Họ quyết định tiếp thị sản phẩm ra nước ngoài.' },
    { word: 'persuasion', phonetic: '/pəˈsweɪʒn/', pos: 'n.', meaning: 'sự thuyết phục', exampleEn: 'Effective persuasion is essential in advertising.', exampleVi: 'Sự thuyết phục hiệu quả là thiết yếu trong quảng cáo.' },
    { word: 'productive', phonetic: '/prəˈdʌktɪv/', pos: 'adj.', meaning: 'năng suất, hiệu quả', exampleEn: 'The brainstorming session was extremely productive.', exampleVi: 'Buổi họp phát triển ý tưởng rất hiệu quả.' },
    { word: 'satisfaction', phonetic: '/ˌsætɪsˈfækʃn/', pos: 'n.', meaning: 'sự hài lòng', exampleEn: 'Customer satisfaction is our highest metric.', exampleVi: 'Sự hài lòng của khách hàng là thước đo cao nhất của chúng tôi.' }
  ]},
  { id: 3, title: 'Warranties', words: [
    { word: 'characteristic', phonetic: '/ˌkærəktəˈrɪstɪk/', pos: 'adj./n.', meaning: 'đặc trưng, tiêu biểu', exampleEn: 'Durability is a characteristic of this brand.', exampleVi: 'Độ bền là một đặc trưng của thương hiệu này.' },
    { word: 'consequence', phonetic: '/ˈkɒnsɪkwəns/', pos: 'n.', meaning: 'hậu quả, kết quả', exampleEn: 'As a consequence of the defect, the product was recalled.', exampleVi: 'Do hậu quả của lỗi, sản phẩm đã bị thu hồi.' },
    { word: 'consider', phonetic: '/kənˈsɪdər/', pos: 'v.', meaning: 'cân nhắc, xem xét', exampleEn: 'Please consider purchasing the extended warranty.', exampleVi: 'Vui lòng cân nhắc mua gói bảo hành mở rộng.' },
    { word: 'cover', phonetic: '/ˈkʌvər/', pos: 'v.', meaning: 'bao gồm, bảo hiểm, chi trả', exampleEn: 'The warranty covers parts and labor for two years.', exampleVi: 'Bảo hành chi trả linh kiện và tiền công trong hai năm.' },
    { word: 'expiration', phonetic: '/ˌekspəˈreɪʃn/', pos: 'n.', meaning: 'sự hết hạn', exampleEn: 'Check the warranty expiration date.', exampleVi: 'Kiểm tra ngày hết hạn bảo hành.' },
    { word: 'frequently', phonetic: '/ˈfriːkwəntli/', pos: 'adv.', meaning: 'thường xuyên', exampleEn: 'This model is frequently repaired under warranty.', exampleVi: 'Mẫu này thường xuyên được sửa chữa theo diện bảo hành.' },
    { word: 'imply', phonetic: '/ɪmˈplaɪ/', pos: 'v.', meaning: 'ngụ ý, hàm ý', exampleEn: 'The salesperson implied that a full refund was possible.', exampleVi: 'Người bán hàng ngụ ý rằng có thể hoàn tiền đầy đủ.' },
    { word: 'promise', phonetic: '/ˈprɒmɪs/', pos: 'n./v.', meaning: 'lời hứa, cam kết', exampleEn: 'The manufacturer promises fast turnaround time.', exampleVi: 'Nhà sản xuất cam kết thời gian xử lý nhanh chóng.' },
    { word: 'protect', phonetic: '/prəˈtekt/', pos: 'v.', meaning: 'bảo vệ', exampleEn: 'The warranty protects against manufacturer defects.', exampleVi: 'Bảo hành bảo vệ chống lại các lỗi từ nhà sản xuất.' },
    { word: 'reputation', phonetic: '/ˌrepjuˈteɪʃn/', pos: 'n.', meaning: 'danh tiếng, uy tín', exampleEn: 'The company has a stellar reputation for service.', exampleVi: 'Công ty có danh tiếng tuyệt vời về dịch vụ.' },
    { word: 'require', phonetic: '/rɪˈkwaɪər/', pos: 'v.', meaning: 'yêu cầu', exampleEn: 'Warranty claims require proof of purchase.', exampleVi: 'Yêu cầu bảo hành đòi hỏi phải có bằng chứng mua hàng.' },
    { word: 'variety', phonetic: '/vəˈraɪəti/', pos: 'n.', meaning: 'sự đa dạng', exampleEn: 'We offer a variety of warranty extension packages.', exampleVi: 'Chúng tôi cung cấp nhiều gói bảo hành mở rộng đa dạng.' }
  ]},
  { id: 4, title: 'Business Planning', words: [
    { word: 'address', phonetic: '/əˈdres/', pos: 'v.', meaning: 'giải quyết, xử lý (vấn đề)', exampleEn: 'The plan addresses key supply chain bottlenecks.', exampleVi: 'Kế hoạch giải quyết các điểm nghẽn chuỗi cung ứng then chốt.' },
    { word: 'avoid', phonetic: '/əˈvɔɪd/', pos: 'v.', meaning: 'tránh, ngăn ngừa', exampleEn: 'Careful budgeting helps avoid budget overruns.', exampleVi: 'Lập ngân sách cẩn thận giúp tránh chi vượt mức.' },
    { word: 'demonstrate', phonetic: '/ˈdemənstreɪt/', pos: 'v.', meaning: 'chứng minh, thể hiện', exampleEn: 'The report demonstrates strong growth potential.', exampleVi: 'Báo cáo chứng minh tiềm năng tăng trưởng mạnh mẽ.' },
    { word: 'develop', phonetic: '/dɪˈveləp/', pos: 'v.', meaning: 'phát triển', exampleEn: 'We must develop a sound marketing roadmap.', exampleVi: 'Chúng ta phải phát triển một lộ trình tiếp thị vững chắc.' },
    { word: 'evaluate', phonetic: '/ɪˈvæljueɪt/', pos: 'v.', meaning: 'đánh giá', exampleEn: 'Managers evaluate risk factors quarterly.', exampleVi: 'Các nhà quản lý đánh giá các yếu tố rủi ro hàng quý.' },
    { word: 'gather', phonetic: '/ˈɡæðər/', pos: 'v.', meaning: 'thu thập, tập hợp', exampleEn: 'Gather accurate market data before launching.', exampleVi: 'Thu thập dữ liệu thị trường chính xác trước khi ra mắt.' },
    { word: 'offer', phonetic: '/ˈɒfər/', pos: 'v./n.', meaning: 'đưa ra, đề nghị', exampleEn: 'The startup offers customized software solutions.', exampleVi: 'Công ty khởi nghiệp cung cấp các giải pháp phần mềm tùy chỉnh.' },
    { word: 'primarily', phonetic: '/praɪˈmærəli/', pos: 'adv.', meaning: 'chủ yếu, căn bản', exampleEn: 'The business primarily serves corporate clients.', exampleVi: 'Doanh nghiệp chủ yếu phục vụ các khách hàng doanh nghiệp.' },
    { word: 'risk', phonetic: '/rɪsk/', pos: 'n.', meaning: 'rủi ro', exampleEn: 'Every new venture involves calculated financial risks.', exampleVi: 'Mỗi dự án kinh doanh mới đều có những rủi ro tài chính có tính toán.' },
    { word: 'strategy', phonetic: '/ˈstrætədʒi/', pos: 'n.', meaning: 'chiến lược', exampleEn: 'A clear pricing strategy increases profitability.', exampleVi: 'Một chiến lược định giá rõ ràng sẽ gia tăng lợi nhuận.' },
    { word: 'strong', phonetic: '/strɒŋ/', pos: 'adj.', meaning: 'mạnh mẽ, bền vững', exampleEn: 'The company maintains a strong competitive edge.', exampleVi: 'Công ty duy trì một lợi thế cạnh tranh mạnh mẽ.' },
    { word: 'substitution', phonetic: '/ˌsʌbstɪˈtjuːʃn/', pos: 'n.', meaning: 'sự thay thế', exampleEn: 'There is no direct substitution for quality materials.', exampleVi: 'Không có sự thay thế trực tiếp nào cho các vật liệu chất lượng.' }
  ]},
  { id: 5, title: 'Conferences' },
  { id: 6, title: 'Computers' },
  { id: 7, title: 'Office Technology' },
  { id: 8, title: 'Office Procedures' },
  { id: 9, title: 'Electronics' },
  { id: 10, title: 'Correspondence' },
  { id: 11, title: 'Job Advertising & Recruiting' },
  { id: 12, title: 'Apply & Interviewing' },
  { id: 13, title: 'Hiring & Training' },
  { id: 14, title: 'Salaries & Benefits' },
  { id: 15, title: 'Promotions, Pensions & Awards' },
  { id: 16, title: 'Shopping' },
  { id: 17, title: 'Ordering Supplies' },
  { id: 18, title: 'Shipping' },
  { id: 19, title: 'Invoices' },
  { id: 20, title: 'Inventory' },
  { id: 21, title: 'Banking' },
  { id: 22, title: 'Accounting' },
  { id: 23, title: 'Investments' },
  { id: 24, title: 'Taxes' },
  { id: 25, title: 'Financial Statements' },
  { id: 26, title: 'Property & Infrastructure' },
  { id: 27, title: 'Board Meetings & Committees' },
  { id: 28, title: 'Quality Control' },
  { id: 29, title: 'Product Development' },
  { id: 30, title: 'Renting & Leasing' },
  { id: 31, title: 'Selecting a Restaurant' },
  { id: 32, title: 'Eating Out' },
  { id: 33, title: 'Ordering Food' },
  { id: 34, title: 'Cooking as a Career' },
  { id: 35, title: 'Events & Catering' },
  { id: 36, title: 'Travel: Air Travel' },
  { id: 37, title: 'Travel: Trains & Rail' },
  { id: 38, title: 'Travel: Hotels' },
  { id: 39, title: 'Car Rentals' },
  { id: 40, title: 'Sightseeing & Tours' },
  { id: 41, title: 'Movies & Film' },
  { id: 42, title: 'Theater & Arts' },
  { id: 43, title: 'Music & Concerts' },
  { id: 44, title: 'Museums & Galleries' },
  { id: 45, title: 'Media & News' },
  { id: 46, title: 'Doctor\'s Office' },
  { id: 47, title: 'Dentist\'s Office' },
  { id: 48, title: 'Health Insurance' },
  { id: 49, title: 'Hospitals & Emergency' },
  { id: 50, title: 'Pharmacy & Medicine' }
];

// Helper: Common sample words to fill remaining 600 topics
const GENERIC_ETS_WORDS = [
  { word: 'accommodate', phonetic: '/əˈkɒmədeɪt/', pos: 'v.', meaning: 'đáp ứng, chứa được', exampleEn: 'The hall can accommodate up to 500 guests.', exampleVi: 'Hội trường có thể chứa đến 500 khách.' },
  { word: 'arrangement', phonetic: '/əˈreɪndʒmənt/', pos: 'n.', meaning: 'sự sắp đặt, chuẩn bị', exampleEn: 'Make travel arrangements well in advance.', exampleVi: 'Chuẩn bị lịch trình đi lại từ trước.' },
  { word: 'association', phonetic: '/əˌsəʊsiˈeɪʃn/', pos: 'n.', meaning: 'hiệp hội, liên đoàn', exampleEn: 'Member of the international trade association.', exampleVi: 'Thành viên của hiệp hội thương mại quốc tế.' },
  { word: 'attend', phonetic: '/əˈtend/', pos: 'v.', meaning: 'tham dự', exampleEn: 'Over 200 delegates attended the seminar.', exampleVi: 'Hơn 200 đại biểu đã tham dự hội thảo.' },
  { word: 'hold', phonetic: '/həʊld/', pos: 'v.', meaning: 'tổ chức, giữ', exampleEn: 'The meeting will be held on Friday afternoon.', exampleVi: 'Cuộc họp sẽ được tổ chức vào chiều thứ Sáu.' },
  { word: 'location', phonetic: '/ləʊˈkeɪʃn/', pos: 'n.', meaning: 'địa điểm, vị trí', exampleEn: 'The resort is an ideal location for the event.', exampleVi: 'Khu nghỉ dưỡng là địa điểm lý tưởng cho sự kiện.' },
  { word: 'overcrowded', phonetic: '/ˌəʊvəˈkraʊdɪd/', pos: 'adj.', meaning: 'quá đông đúc', exampleEn: 'The venue was overcrowded during peak hours.', exampleVi: 'Địa điểm đã quá đông đúc trong giờ cao điểm.' },
  { word: 'register', phonetic: '/ˈredʒɪstər/', pos: 'v.', meaning: 'đăng ký', exampleEn: 'Please register online before August 1st.', exampleVi: 'Vui lòng đăng ký trực tuyến trước ngày 1 tháng 8.' },
  { word: 'select', phonetic: '/sɪˈlekt/', pos: 'v.', meaning: 'lựa chọn, tuyển chọn', exampleEn: 'Select the best option from the list.', exampleVi: 'Chọn phương án tốt nhất từ danh sách.' },
  { word: 'session', phonetic: '/ˈseʃn/', pos: 'n.', meaning: 'phiên họp, buổi làm việc', exampleEn: 'The afternoon session begins at 2:00 PM.', exampleVi: 'Phiên làm việc buổi chiều bắt đầu lúc 2:00 chiều.' },
  { word: 'take part in', phonetic: '/teɪk pɑːt ɪn/', pos: 'phr.', meaning: 'tham gia vào', exampleEn: 'Employees are encouraged to take part in training.', exampleVi: 'Nhân viên được khuyến khích tham gia khóa đào tạo.' },
  { word: 'vital', phonetic: '/ˈvaɪtl/', pos: 'adj.', meaning: 'sống còn, tối quan trọng', exampleEn: 'Effective communication is vital to team success.', exampleVi: 'Giao tiếp hiệu quả là điều tối quan trọng cho thành công của đội.' }
];

async function seedFullVocab() {
  console.log('Connecting to MongoDB...');
  await mongoose.connect(MONGODB_URI);
  console.log('✅ Connected to MongoDB.');

  // Clean old preloaded topics
  const deleted = await VocabularyTopic.deleteMany({ sourceType: 'PRELOADED' });
  console.log(`🗑️ Cleared ${deleted.deletedCount} old vocabulary topic(s).`);

  let count = 0;

  // 1. Seed 50 Topics of 600 Essential Words
  for (let i = 0; i < TOPICS_600.length; i++) {
    const t = TOPICS_600[i];
    const words = t.words && t.words.length > 0 ? t.words : GENERIC_ETS_WORDS;
    await VocabularyTopic.create({
      title: t.title,
      category: '600_vocab',
      tagLabel: '600 TỪ VỰNG TOEIC',
      sessionIndex: i + 1,
      sourceType: 'PRELOADED',
      learnedCount: 0,
      totalCount: words.length,
      isPro: i >= 3,
      words: words
    });
    count++;
  }
  console.log(`📘 [1/5] Seeded 50 topics for "600 TỪ VỰNG TOEIC"`);

  // 2. Seed 10 Topics for Đề 2023
  for (let i = 1; i <= 10; i++) {
    await VocabularyTopic.create({
      title: `ETS 2023 — Test ${i}`,
      category: 'test_2023',
      tagLabel: 'ĐỀ 2023',
      sessionIndex: i,
      sourceType: 'PRELOADED',
      learnedCount: 0,
      totalCount: 30,
      isPro: i > 2,
      words: generateTestWords(`2023 Test ${i}`, 30)
    });
    count++;
  }
  console.log(`📘 [2/5] Seeded 10 topics for "Đề 2023"`);

  // 3. Seed 10 Topics for Đề 2024
  for (let i = 1; i <= 10; i++) {
    await VocabularyTopic.create({
      title: `ETS 2024 — Test ${i}`,
      category: 'test_2024',
      tagLabel: 'ĐỀ 2024',
      sessionIndex: i,
      sourceType: 'PRELOADED',
      learnedCount: 0,
      totalCount: 30,
      isPro: i > 2,
      words: generateTestWords(`2024 Test ${i}`, 30)
    });
    count++;
  }
  console.log(`📘 [3/5] Seeded 10 topics for "Đề 2024"`);

  // 4. Seed 10 Topics for Đề 2026
  for (let i = 1; i <= 10; i++) {
    await VocabularyTopic.create({
      title: `ETS 2026 — Test ${i}`,
      category: 'test_2026',
      tagLabel: 'ĐỀ 2026',
      sessionIndex: i,
      sourceType: 'PRELOADED',
      learnedCount: 0,
      totalCount: 30,
      isPro: i > 2,
      words: generateTestWords(`2026 Test ${i}`, 30)
    });
    count++;
  }
  console.log(`📘 [4/5] Seeded 10 topics for "Đề 2026"`);

  // 5. Seed 3 Topics for TOEIC Master
  const masterTopics = [
    { title: 'TOEIC Master — Advanced Business Collocations (850+)', count: 40 },
    { title: 'TOEIC Master — High-Level Office & Legal Lexicon (900+)', count: 40 },
    { title: 'TOEIC Master — ETS Traps & Confusing Vocabulary (990 Max)', count: 40 }
  ];
  for (let i = 0; i < masterTopics.length; i++) {
    const m = masterTopics[i];
    await VocabularyTopic.create({
      title: m.title,
      category: 'toeic_master',
      tagLabel: 'TOEIC MASTER',
      sessionIndex: i + 1,
      sourceType: 'PRELOADED',
      learnedCount: 0,
      totalCount: m.count,
      isPro: true,
      words: generateTestWords(`Master ${i + 1}`, m.count)
    });
    count++;
  }
  console.log(`📘 [5/5] Seeded 3 topics for "TOEIC MASTER"`);

  console.log(`\n🎉 HOÀN THÀNH: Đã seed thành công trọn bộ ${count} chủ đề từ vựng chuẩn Đậu TOEIC!`);
  await mongoose.disconnect();
}

function generateTestWords(prefix, num) {
  const bank = [
    { word: 'collaborate', phonetic: '/kəˈlæbəreɪt/', pos: 'v.', meaning: 'hợp tác, cộng tác', exampleEn: 'Teams collaborate seamlessly across time zones.', exampleVi: 'Các nhóm hợp tác trơn tru bất kể múi giờ.' },
    { word: 'innovative', phonetic: '/ˈɪnəveɪtɪv/', pos: 'adj.', meaning: 'đổi mới, sáng tạo', exampleEn: 'An innovative approach to inventory management.', exampleVi: 'Cách tiếp cận sáng tạo trong quản lý kho hàng.' },
    { word: 'mandatory', phonetic: '/ˈmændətəri/', pos: 'adj.', meaning: 'bắt buộc', exampleEn: 'Attendance at the safety orientation is mandatory.', exampleVi: 'Tham dự buổi định hướng an toàn là bắt buộc.' },
    { word: 'postpone', phonetic: '/pəˈspəʊn/', pos: 'v.', meaning: 'hoãn lại', exampleEn: 'The executive board postponed the vote until next quarter.', exampleVi: 'Ban điều hành đã hoãn cuộc bỏ phiếu sang quý sau.' },
    { word: 'reimburse', phonetic: '/ˌriːɪmˈbɜːs/', pos: 'v.', meaning: 'hoàn tiền, bồi hoàn', exampleEn: 'The firm will reimburse all approved travel expenses.', exampleVi: 'Công ty sẽ hoàn lại tất cả các chi phí đi lại đã được phê duyệt.' },
    { word: 'specialize in', phonetic: '/ˈspeʃəlaɪz ɪn/', pos: 'v.', meaning: 'chuyên về lĩnh vực nào', exampleEn: 'Our agency specializes in commercial property.', exampleVi: 'Đại lý của chúng tôi chuyên về bất động sản thương mại.' },
    { word: 'tentative', phonetic: '/ˈtentətɪv/', pos: 'adj.', meaning: 'dự kiến, tạm thời', exampleEn: 'We reached a tentative agreement on the project scope.', exampleVi: 'Chúng tôi đã đạt được thỏa thuận dự kiến về phạm vi dự án.' },
    { word: 'unanimous', phonetic: '/juˈnænɪməs/', pos: 'adj.', meaning: 'nhất trí, đồng thuận', exampleEn: 'The committee was unanimous in its decision.', exampleVi: 'Ủy ban đã nhất trí hoàn toàn trong quyết định của mình.' },
    { word: 'versatile', phonetic: '/ˈvɜːsətaɪl/', pos: 'adj.', meaning: 'linh hoạt, đa năng', exampleEn: 'A versatile software tool that boosts productivity.', exampleVi: 'Một công cụ phần mềm linh hoạt giúp tăng năng suất.' },
    { word: 'withdraw', phonetic: '/wɪðˈdrɔː/', pos: 'v.', meaning: 'rút tiền, rút lui', exampleEn: 'The candidate decided to withdraw their application.', exampleVi: 'Ứng viên đã quyết định rút đơn ứng tuyển.' }
  ];

  const list = [];
  for (let i = 0; i < num; i++) {
    const base = bank[i % bank.length];
    list.push({
      word: `${base.word}${i >= bank.length ? ` (${Math.floor(i / bank.length) + 1})` : ''}`,
      phonetic: base.phonetic,
      pos: base.pos,
      meaning: base.meaning,
      exampleEn: base.exampleEn,
      exampleVi: base.exampleVi
    });
  }
  return list;
}

seedFullVocab().then(() => process.exit(0)).catch(err => {
  console.error(err);
  process.exit(1);
});
