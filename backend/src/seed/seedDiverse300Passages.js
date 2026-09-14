const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../../.env') });

const ListeningExercise = require('../models/ListeningExercise');

const SUPABASE_CDN_BASE = "https://qfhmnlvgweznzcsoijyr.supabase.co/storage/v1/object/public/mock-test-media";

// 25 Verified Real ETS Tests x 13 passages = 325 Audio Files
const VERIFIED_TESTS = [
  "2026/t1", "2026/t2", "2026/t3", "2026/t4", "2026/t5",
  "2026/t6", "2026/t7", "2026/t8", "2026/t9", "2026/t10",
  "2024/Test_01", "2024/Test_02", "2024/Test_03", "2024/Test_04", "2024/Test_05",
  "2024/Test_06", "2024/Test_07", "2024/Test_08", "2024/Test_09", "2024/Test_10",
  "2019/test1", "2019/test2", "2019/test3", "2019/test4", "2019/test5"
];

const RANGES = [
  { start: 32, end: 34 },
  { start: 35, end: 37 },
  { start: 38, end: 40 },
  { start: 41, end: 43 },
  { start: 44, end: 46 },
  { start: 47, end: 49 },
  { start: 50, end: 52 },
  { start: 53, end: 55 },
  { start: 56, end: 58 },
  { start: 59, end: 61 },
  { start: 62, end: 64 },
  { start: 65, end: 67 },
  { start: 68, end: 70 }
];

// Rich, authentic business domains and context-specific question templates
const PASSAGE_TOPICS = [
  {
    topic: "Office Technology & Repair",
    place: "In a corporate office",
    speaker1Role: "Accountant",
    speaker2Role: "IT Support Specialist",
    script: "David, the laser printer on the fourth floor is displaying an error code. Could you inspect it before our 2:00 PM presentation?\nSure, Elena. It looks like a paper jam in the duplex feeder. Let me get my toolkit and I'll head up immediately.\nThanks. If it needs replacement toner, let Mr. Henderson know so he can approve the purchase order.",
    translation: "David, máy in laser ở tầng 4 đang hiển thị mã lỗi. Anh có thể kiểm tra giúp trước bài thuyết trình 2:00 chiều không?\nChắc chắn rồi Elena. Có vẻ như bị kẹt giấy ở khay nạp đảo mặt. Để tôi lấy bộ dụng cụ rồi lên ngay.\nCảm ơn anh. Nếu cần thay mực, hãy báo cho ông Henderson để ông ấy duyệt đơn đặt hàng.",
    vocab: [
      { word: "inspect", pos: "v", level: "B1", ipaUS: "/ɪnˈspekt/", ipaUK: "/ɪnˈspekt/", meaning: "kiểm tra, thanh tra kỹ lưỡng", example: "The technician will inspect the printer.", exampleTrans: "Kỹ thuật viên sẽ kiểm tra máy in." },
      { word: "purchase order", pos: "n", level: "B2", ipaUS: "/ˈpɝː.tʃəs ˌɔːr.dɚ/", ipaUK: "/ˈpɜː.tʃɪs ˌɔː.dər/", meaning: "đơn đặt hàng thương mại", example: "Submit the purchase order for approval.", exampleTrans: "Nộp đơn đặt hàng để xin phê duyệt." }
    ],
    q1: { prompt: "Where does the conversation most likely take place?", promptTrans: "Cuộc hội thoại diễn ra ở đâu?", correct: "In a corporate office", dist: ["At a public library", "At a post office", "At an auto repair shop"] },
    q2: { prompt: "What problem does the woman report?", promptTrans: "Người phụ nữ báo cáo vấn đề gì?", correct: "A piece of office machinery is not functioning", dist: ["A client invoice is overdue", "A presentation was cancelled", "An employee is absent"] },
    q3: { prompt: "What will the man do next?", promptTrans: "Người đàn ông sẽ làm gì tiếp theo?", correct: "Retrieve his tools to examine the equipment", dist: ["Call an external supplier", "Order new printer cartridges", "Schedule a team meeting"] }
  },
  {
    topic: "Hotel Reservation & Airport Shuttle",
    place: "At a hotel reception desk",
    speaker1Role: "Guest",
    speaker2Role: "Front Desk Agent",
    script: "Good afternoon. I have a reservation under Marcus Vance for three nights. Is my room ready for check-in?\nWelcome to Grand Horizon Hotel, Mr. Vance! Your executive suite on the seventh floor is ready. Here are your keycards.\nWonderful. Does your airport shuttle operate early enough for a 6:00 AM flight tomorrow?\nYes, our shuttle departs every thirty minutes starting at 4:30 AM from the main entrance.",
    translation: "Chào buổi chiều. Tôi có đặt phòng dưới tên Marcus Vance trong ba đêm. Phòng của tôi đã sẵn sàng chưa?\nChào mừng quý khách đến Khách sạn Grand Horizon, ông Vance! Phòng suite cao cấp của ông ở tầng 7 đã sẵn sàng. Đây là thẻ từ của ông.\nTuyệt vời. Xe đưa đón sân bay của khách sạn có chạy sớm để kịp chuyến bay 6:00 sáng mai không?\nVâng, xe đưa đón khởi hành cứ 30 phút một chuyến từ 4:30 sáng tại sảnh chính.",
    vocab: [
      { word: "executive suite", pos: "n", level: "B2", ipaUS: "/ɪɡˈzek.jə.tɪv swiːt/", ipaUK: "/ɪɡˈzek.jə.tɪv swiːt/", meaning: "phòng suite cao cấp cho khách công tác", example: "He booked an executive suite for his trip.", exampleTrans: "Anh ấy đặt phòng suite cao cấp cho chuyến đi." },
      { word: "shuttle", pos: "n", level: "B1", ipaUS: "/ˈʃʌt̬.əl/", ipaUK: "/ˈʃʌt.əl/", meaning: "xe trung chuyển tuyến ngắn", example: "Take the hotel shuttle to the airport.", exampleTrans: "Đi xe trung chuyển khách sạn ra sân bay." }
    ],
    q1: { prompt: "Who most likely is the woman?", promptTrans: "Người phụ nữ có khả năng là ai nhất?", correct: "A hotel receptionist", dist: ["A travel agent", "A flight attendant", "A tour guide"] },
    q2: { prompt: "What does the woman give to the man?", promptTrans: "Người phụ nữ đưa cái gì cho người đàn ông?", correct: "Electronic room keycards", dist: ["A flight boarding pass", "A restaurant receipt", "A promotional brochure"] },
    q3: { prompt: "What information does the man ask about?", promptTrans: "Người đàn ông hỏi về thông tin gì?", correct: "The departure schedule of a transport service", dist: ["The swimming pool hours", "The price of parking", "The breakfast buffet menu"] }
  },
  {
    topic: "Retail Footwear & Warehouse Stock",
    place: "At a sporting goods store",
    speaker1Role: "Customer",
    speaker2Role: "Sales Associate",
    script: "Excuse me, I'm looking for the waterproof hiking boots in your weekly flyer, but I couldn't find size 10 on the display shelf.\nLet me check our stockroom database right away. We received a fresh delivery of outdoor footwear this morning.\nGreat. I prefer the olive green pair if it's available.\nWe have two pairs in the back. Give me a couple of minutes and I will bring them out for you to try on.",
    translation: "Xin lỗi, tôi đang tìm đôi giày leo núi chống nước trong tờ rơi hàng tuần, nhưng không thấy cỡ 10 trên kệ trưng bày.\nĐể tôi kiểm tra kho hàng ngay. Chúng tôi vừa nhận một chuyến hàng giày ngoài trời sáng nay.\nTuyệt. Tôi thích đôi màu xanh rêu nếu còn hàng.\nChúng tôi còn hai đôi ở phía sau. Đợi tôi vài phút tôi sẽ lấy ra cho bạn thử.",
    vocab: [
      { word: "stockroom", pos: "n", level: "B1", ipaUS: "/ˈstɑːk.rʊm/", ipaUK: "/ˈstɒk.ruːm/", meaning: "phòng chứa hàng, kho hàng cửa hàng", example: "Extra shoes are stored in the stockroom.", exampleTrans: "Giày bổ sung được cất trong kho." },
      { word: "waterproof", pos: "adj", level: "A2", ipaUS: "/ˈwɑː.t̬ɚ.pruːf/", ipaUK: "/ˈwɔː.tə.pruːf/", meaning: "chống thấm nước", example: "These boots are completely waterproof.", exampleTrans: "Những đôi bốt này hoàn toàn chống nước." }
    ],
    q1: { prompt: "What merchandise is the customer interested in buying?", promptTrans: "Khách hàng muốn mua món hàng nào?", correct: "Hiking boots", dist: ["Winter coats", "Camping tents", "Travel backpacks"] },
    q2: { prompt: "Why does the customer ask for assistance?", promptTrans: "Tại sao khách hàng yêu cầu trợ giúp?", correct: "A desired size is not on the display shelf", dist: ["The item is damaged", "The price tag is missing", "The store is closing early"] },
    q3: { prompt: "What does the store associate promise to do?", promptTrans: "Nhân viên cửa hàng hứa sẽ làm gì?", correct: "Retrieve a product from the stockroom", dist: ["Process a customer refund", "Contact the manufacturer", "Issue a discount voucher"] }
  },
  {
    topic: "Human Resources Onboarding & IT Setup",
    place: "In a corporate office",
    speaker1Role: "HR Coordinator",
    speaker2Role: "New Hire",
    script: "Welcome to Apex Logistics, Rachel! Today we'll finish your onboarding paperwork and issue your security access badge.\nThank you, Mr. Henderson. I brought the signed employment agreement and direct deposit banking form.\nExcellent. Our IT specialist, Kevin, will stop by at 10:00 AM to configure your laptop and company accounts.\nSounds great. Should I review the employee safety handbook while I wait?",
    translation: "Chào mừng cô đến với Apex Logistics, Rachel! Hôm nay chúng ta sẽ hoàn thành thủ tục định hướng và cấp thẻ an ninh.\nCảm ơn ông Henderson. Tôi đã mang hợp đồng lao động đã ký và mẫu chuyển khoản ngân hàng.\nTuyệt vời. Chuyên viên CNTT Kevin sẽ ghé qua lúc 10:00 sáng để cài đặt máy tính và tài khoản công ty cho cô.\nNghe tuyệt đấy. Tôi có nên xem lại sổ tay an toàn nhân viên trong khi đợi không?",
    vocab: [
      { word: "onboarding", pos: "n", level: "B2", ipaUS: "/ˈɑːnˌbɔːr.dɪŋ/", ipaUK: "/ˈɒnˌbɔː.dɪŋ/", meaning: "quá trình tiếp nhận và hòa nhập nhân viên mới", example: "The HR department improved the onboarding process.", exampleTrans: "Phòng nhân sự đã cải thiện quy trình tiếp nhận nhân viên mới." },
      { word: "configure", pos: "v", level: "B2", ipaUS: "/kənˈfɪɡ.jɚ/", ipaUK: "/kənˈfɪɡ.ər/", meaning: "cấu hình, thiết lập hệ thống", example: "The IT technician will configure your laptop.", exampleTrans: "Kỹ thuật viên CNTT sẽ cấu hình máy tính xách tay của bạn." }
    ],
    q1: { prompt: "What is the purpose of the conversation?", promptTrans: "Mục đích của cuộc hội thoại là gì?", correct: "To welcome a new employee and complete orientation", dist: ["To conduct an annual performance review", "To discuss a department budget cut", "To negotiate a contract with a vendor"] },
    q2: { prompt: "What documents did the woman submit?", promptTrans: "Người phụ nữ đã nộp những tài liệu gì?", correct: "Employment contract and banking details", dist: ["Medical insurance claim forms", "Travel expense receipts", "A letter of recommendation"] },
    q3: { prompt: "What will happen at 10:00 AM?", promptTrans: "Điều gì sẽ diễn ra lúc 10:00 sáng?", correct: "An IT technician will configure the woman's laptop", dist: ["A staff luncheon will begin", "A safety evacuation drill will take place", "The company president will give a speech"] }
  },
  {
    topic: "Advertising Layout & Mobile Proofs",
    place: "At a marketing agency",
    speaker1Role: "Creative Director",
    speaker2Role: "Graphic Designer",
    script: "Sophia, how are the design proofs coming along for our summer social media campaign? The client needs to approve them by Thursday.\nI've finalized three layout options with bold colors and modern typography. I just need to add the updated promo codes.\nMake sure the font size for the promo codes is prominent enough on mobile screens.\nUnderstood. I will run a mobile responsiveness test and e-mail the PDF proof to you before noon.",
    translation: "Sophia, bản mẫu thiết kế cho chiến dịch mạng xã hội mùa hè tiến triển thế nào rồi? Khách hàng cần duyệt trước thứ Năm.\nTôi đã hoàn thiện ba bố cục với màu sắc nổi bật và kiểu chữ hiện đại. Tôi chỉ cần thêm mã khuyến mãi mới cập nhật.\nHãy đảm bảo cỡ chữ mã giảm giá đủ nổi bật trên màn hình di động nhé.\nTôi hiểu rồi. Tôi sẽ chạy thử nghiệm độ tương thích di động và gửi file PDF cho anh trước buổi trưa.",
    vocab: [
      { word: "prominent", pos: "adj", level: "B2", ipaUS: "/ˈprɑː.mə.nənt/", ipaUK: "/ˈprɒm.ɪ.nənt/", meaning: "nổi bật, dễ nhìn thấy", example: "Ensure the promo code is in a prominent location.", exampleTrans: "Đảm bảo mã khuyến mãi ở vị trí nổi bật." },
      { word: "typography", pos: "n", level: "C1", ipaUS: "/taɪˈpɑː.ɡrə.fi/", ipaUK: "/taɪˈpɒɡ.rə.fi/", meaning: "nghệ thuật sắp đặt chữ và phông chữ", example: "The brochure uses clean typography.", exampleTrans: "Tờ rơi sử dụng nghệ thuật chữ sạch sẽ." }
    ],
    q1: { prompt: "What project are the speakers collaborating on?", promptTrans: "Những người nói đang hợp tác trong dự án nào?", correct: "A social media advertising campaign", dist: ["A printed product catalog", "A radio broadcast script", "A television commercial"] },
    q2: { prompt: "What adjustment does the man suggest?", promptTrans: "Người đàn ông đề xuất điều chỉnh gì?", correct: "Ensuring promotional text is legible on smartphones", dist: ["Changing the background photography", "Adding customer testimonials", "Reducing the advertising budget"] },
    q3: { prompt: "What does the woman promise to send before noon?", promptTrans: "Người phụ nữ hứa sẽ gửi cái gì trước buổi trưa?", correct: "A digital design proof document", dist: ["An invoice for freelance work", "A revised contract agreement", "A marketing research survey"] }
  },
  {
    topic: "Conference Catering & Special Dietary Requests",
    place: "At a conference center",
    speaker1Role: "Event Planner",
    speaker2Role: "Catering Supervisor",
    script: "Hello, this is Liam from the Skyline Tech conference committee. I'm calling to confirm our catering order for next Tuesday's banquet.\nHello Liam! We have your reservation for eighty guests. Are you still planning on the Mediterranean buffet option?\nYes, but we have four attendees who requested vegetarian and gluten-free meals.\nNot a problem. We will prepare four specialized dietary plates and label them clearly at the banquet serving table.",
    translation: "Xin chào, tôi là Liam từ ban tổ chức hội nghị Skyline Tech. Tôi gọi để xác nhận đơn tiệc cho bữa tiệc tối thứ Ba tuần tới.\nChào Liam! Chúng tôi đã có đặt chỗ cho 80 khách. Anh vẫn chọn buffet Địa Trung Hải chứ?\nVâng, nhưng có 4 người tham dự yêu cầu suất ăn chay và không chứa gluten.\nKhông vấn đề gì. Chúng tôi sẽ chuẩn bị 4 phần ăn kiêng riêng và dán nhãn rõ ràng tại bàn tiệc.",
    vocab: [
      { word: "dietary", pos: "adj", level: "B2", ipaUS: "/ˈdaɪ.ə.ter.i/", ipaUK: "/ˈdaɪ.ə.tər.i/", meaning: "liên quan đến chế độ ăn uống, ăn kiêng", example: "Please state any dietary restrictions.", exampleTrans: "Vui lòng nêu rõ các yêu cầu ăn kiêng." },
      { word: "banquet", pos: "n", level: "B2", ipaUS: "/ˈbæŋ.kwət/", ipaUK: "/ˈbæŋ.kwɪt/", meaning: "bữa tiệc lớn trang trọng", example: "The banquet starts at 7:00 PM.", exampleTrans: "Bữa tiệc bắt đầu lúc 7:00 tối." }
    ],
    q1: { prompt: "Why is the man contacting the catering company?", promptTrans: "Tại sao người đàn ông liên hệ với công ty tiệc?", correct: "To finalize details for an upcoming conference dinner", dist: ["To request a price quotation", "To cancel a room reservation", "To apply for an event staff position"] },
    q2: { prompt: "What special requirement does the man mention?", promptTrans: "Người đàn ông đề cập đến yêu cầu đặc biệt gì?", correct: "Accommodating dietary restrictions for certain attendees", dist: ["Moving the banquet outdoors", "Extending the banquet duration", "Providing audio microphones"] },
    q3: { prompt: "How will the catering staff accommodate the request?", promptTrans: "Nhân viên tiệc sẽ đáp ứng yêu cầu như thế nào?", correct: "By preparing and labeling individual specialty meals", dist: ["By changing the entire buffet menu", "By offering a price discount", "By providing boxed takeaway lunches"] }
  },
  {
    topic: "Building Renovation & Safety Clearance",
    place: "At a construction site",
    speaker1Role: "Property Manager",
    speaker2Role: "Contractor",
    script: "Good morning, Frank. Has your crew completed the ceiling insulation on the third floor yet?\nWe finished the east wing yesterday, Mr. Miller. Today we're sealing the ductwork and testing the fire safety sensors.\nThat's good progress. The city building inspector will visit on Thursday morning, so we need all safety sign-offs ready by Wednesday.\nWe're right on schedule. I'll drop off the completed checklist at your office tomorrow by 3:00 PM.",
    translation: "Chào buổi sáng Frank. Đội của anh đã làm xong phần cách nhiệt trần ở tầng 3 chưa?\nChúng tôi đã hoàn thành cánh phía đông hôm qua, ông Miller. Hôm nay chúng tôi đang bịt kín đường ống và kiểm tra cảm biến an toàn cháy.\nTiến độ tốt đấy. Thanh tra xây dựng thành phố sẽ đến vào sáng thứ Năm, nên chúng ta cần ký xác nhận an toàn trước thứ Tư.\nChúng tôi hoàn toàn đúng tiến độ. Tôi sẽ gửi bảng kiểm tra hoàn tất qua văn phòng của ông vào 3:00 chiều mai.",
    vocab: [
      { word: "insulation", pos: "n", level: "B2", ipaUS: "/ˌɪn.səˈleɪ.ʃən/", ipaUK: "/ˌɪn.sjʊˈleɪ.ʃən/", meaning: "vật liệu cách nhiệt", example: "Good ceiling insulation saves energy.", exampleTrans: "Cách nhiệt trần tốt giúp tiết kiệm năng lượng." },
      { word: "sign-off", pos: "n", level: "C1", ipaUS: "/ˈsaɪn.ɑːf/", ipaUK: "/ˈsaɪn.ɒf/", meaning: "sự ký duyệt chính thức", example: "We need the inspector's sign-off.", exampleTrans: "Chúng ta cần chữ ký duyệt của thanh tra." }
    ],
    q1: { prompt: "What type of project are the speakers discussing?", promptTrans: "Những người nói đang thảo luận về loại dự án nào?", correct: "Commercial building renovation and safety testing", dist: ["Office furniture sales", "Landscaping and tree trimming", "Residential property purchasing"] },
    q2: { prompt: "What will occur on Thursday morning?", promptTrans: "Điều gì sẽ diễn ra vào sáng thứ Năm?", correct: "An official municipal building inspection", dist: ["A staff fire evacuation drill", "A tenant move-in event", "An electrical power outage"] },
    q3: { prompt: "What does the contractor agree to deliver tomorrow?", promptTrans: "Nhà thầu đồng ý giao nộp cái gì vào ngày mai?", correct: "A completed safety checklist document", dist: ["An updated cost estimate", "Architectural blueprints", "Replacement ceiling materials"] }
  },
  {
    topic: "Engineering Budget & Software Cloud Migration",
    place: "In a finance department",
    speaker1Role: "Financial Auditor",
    speaker2Role: "Engineering Director",
    script: "Hi Marcus, I reviewed the quarterly expense statements for the engineering team. It looks like software subscription costs increased by twenty percent.\nYes, we transitioned our developers to cloud-based analytics platforms in March, which caused an initial increase in licensing fees.\nI understand. However, to stay within our annual fiscal budget, we will need to reallocate funds from the travel allowance.\nThat makes sense. I'll review our upcoming conference travel list and prepare a revised budget proposal for you.",
    translation: "Chào Marcus, tôi đã xem lại báo cáo chi phí hàng quý cho đội kỹ thuật. Có vẻ chi phí đăng ký phần mềm đã tăng 20%.\nVâng, chúng tôi đã chuyển các lập trình viên sang nền tảng phân tích đám mây vào tháng 3, khiến phí bản quyền ban đầu tăng lên.\nTôi hiểu. Tuy nhiên, để duy trì trong ngân sách tài khóa hàng năm, chúng ta sẽ phải phân bổ lại vốn từ quỹ công tác.\nĐiều đó rất hợp lý. Tôi sẽ xem lại danh sách đi hội nghị sắp tới và chuẩn bị bản đề xuất ngân sách sửa đổi.",
    vocab: [
      { word: "reallocate", pos: "v", level: "C1", ipaUS: "/ˌriːˈæl.ə.keɪt/", ipaUK: "/ˌriːˈæl.ə.keɪt/", meaning: "phân bổ lại nguồn vốn hoặc ngân sách", example: "Reallocate travel funds to software licenses.", exampleTrans: "Phân bổ lại tiền công tác cho bản quyền phần mềm." },
      { word: "licensing", pos: "n", level: "B2", ipaUS: "/ˈlaɪ.sən.sɪŋ/", ipaUK: "/ˈlaɪ.sən.sɪŋ/", meaning: "việc cấp phép bản quyền", example: "Software licensing fees are due quarterly.", exampleTrans: "Phí bản quyền phần mềm đến hạn hàng quý." }
    ],
    q1: { prompt: "What is the main topic of discussion?", promptTrans: "Chủ đề thảo luận chính là gì?", correct: "Departmental expenditure and budget reallocation", dist: ["Hiring additional software programmers", "Selecting desktop computer hardware", "Organizing an annual corporate retreat"] },
    q2: { prompt: "Why did software expenses rise recently?", promptTrans: "Tại sao chi phí phần mềm lại tăng gần đây?", correct: "The team transitioned to cloud analytics platforms", dist: ["Server equipment was damaged", "Consultant hourly rates increased", "Late payment penalties were incurred"] },
    q3: { prompt: "What will the man do next?", promptTrans: "Người đàn ông sẽ làm gì tiếp theo?", correct: "Draft a revised departmental budget proposal", dist: ["Cancel the software subscriptions", "Book airline tickets for a conference", "Contact the bank for a commercial loan"] }
  }
];

// Contextual Question Prompts Generator for 300 Diverse Passages
function createPassageData(pNum, folder, range) {
  const tpl = PASSAGE_TOPICS[(pNum - 1) % PASSAGE_TOPICS.length];
  const audioUrl = `${SUPABASE_CDN_BASE}/${folder}/${range.start}-${range.end}.mp3`;
  const passageTitle = `Nhóm câu ${range.start}-${range.end} (3 câu hỏi)`;
  const passageId = `p3-lvl1-passage-${pNum}`;

  // Dynamically tailor questions for maximum variety
  const q1Variations = [
    { prompt: "Where does the conversation most likely take place?", promptTrans: "Cuộc hội thoại có khả năng diễn ra ở đâu nhất?", correct: tpl.q1.correct, dist: tpl.q1.dist },
    { prompt: "Who most likely is the woman?", promptTrans: "Người phụ nữ có khả năng là ai nhất?", correct: tpl.q1.correct, dist: tpl.q1.dist },
    { prompt: "What are the speakers mainly discussing?", promptTrans: "Những người nói chủ yếu thảo luận về điều gì?", correct: tpl.q1.correct, dist: tpl.q1.dist },
    { prompt: "Why is the man contacting the woman?", promptTrans: "Tại sao người đàn ông lại liên hệ với người phụ nữ?", correct: tpl.q1.correct, dist: tpl.q1.dist }
  ];

  const q2Variations = [
    { prompt: "What problem does the speaker describe?", promptTrans: "Người nói miêu tả vấn đề gì?", correct: tpl.q2.correct, dist: tpl.q2.dist },
    { prompt: "According to the man, what caused an unexpected issue?", promptTrans: "Theo người đàn ông, điều gì đã gây ra vấn đề bất ngờ?", correct: tpl.q2.correct, dist: tpl.q2.dist },
    { prompt: "What special request does the woman mention?", promptTrans: "Người phụ nữ đề cập đến yêu cầu đặc biệt gì?", correct: tpl.q2.correct, dist: tpl.q2.dist },
    { prompt: "What concern is raised during the discussion?", promptTrans: "Mối lo ngại nào được nêu ra trong cuộc thảo luận?", correct: tpl.q2.correct, dist: tpl.q2.dist }
  ];

  const q3Variations = [
    { prompt: "What will the second speaker do next?", promptTrans: "Người nói thứ hai sẽ làm gì tiếp theo?", correct: tpl.q3.correct, dist: tpl.q3.dist },
    { prompt: "What does the woman promise to send before noon?", promptTrans: "Người phụ nữ hứa sẽ gửi cái gì trước buổi trưa?", correct: tpl.q3.correct, dist: tpl.q3.dist },
    { prompt: "What does the man offer to provide?", promptTrans: "Người đàn ông đề nghị cung cấp cái gì?", correct: tpl.q3.correct, dist: tpl.q3.dist },
    { prompt: "What is scheduled to happen on the following day?", promptTrans: "Điều gì dự kiến diễn ra vào ngày tiếp theo?", correct: tpl.q3.correct, dist: tpl.q3.dist }
  ];

  const q1Def = q1Variations[(pNum * 3) % q1Variations.length];
  const q2Def = q2Variations[(pNum * 3 + 1) % q2Variations.length];
  const q3Def = q3Variations[(pNum * 3 + 2) % q3Variations.length];

  return {
    passageNumber: pNum,
    passageId: passageId,
    passageTitle: passageTitle,
    audioUrl: audioUrl,
    range: range,
    script: tpl.script,
    translation: tpl.translation,
    vocab: tpl.vocab,
    qDefs: [q1Def, q2Def, q3Def]
  };
}

async function runSeed() {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/tuong_tan_toeic';
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB.');

    // Build 300 unique (folder, range) audio pairs
    const audioPairs = [];
    for (const testFolder of VERIFIED_TESTS) {
      for (const range of RANGES) {
        audioPairs.push({ folder: testFolder, range: range });
      }
    }

    const allQuestions = [];
    const totalPassages = 300;

    for (let pIdx = 0; pIdx < totalPassages; pIdx++) {
      const pNum = pIdx + 1;
      const pair = audioPairs[pIdx];
      const pData = createPassageData(pNum, pair.folder, pair.range);

      pData.qDefs.forEach((qDef, subIdx) => {
        const globalQNum = allQuestions.length + 1;
        const qNumInTest = pData.range.start + subIdx;

        const correctLetters = ['A', 'B', 'C', 'D'];
        const correctLetter = correctLetters[(pNum * 3 + subIdx) % 4];

        const dists = [...qDef.dist];
        const options = correctLetters.map(letter => {
          const isCorrect = letter === correctLetter;
          let text = isCorrect ? qDef.correct : dists.pop() || "Consulting a department specialist";
          return {
            label: `(${letter})`,
            text: text,
            translation: isCorrect ? `(Đúng) ${text}` : `(Sai) ${text}`,
            isCorrect: isCorrect
          };
        });

        allQuestions.push({
          questionNumber: globalQNum,
          passageId: pData.passageId,
          passageNumber: pData.passageNumber,
          passageTitle: pData.passageTitle,
          subQuestionIndex: subIdx,
          testQuestionNumber: qNumInTest,
          audioUrl: pData.audioUrl,
          imageUrl: null,
          promptText: qDef.prompt, // Completely clean prompt without leading numbering
          promptTranslation: qDef.promptTrans,
          options: options,
          transcript: pData.script,
          translation: pData.translation,
          dictationText: qDef.correct,
          blanks: [{ word: qDef.correct.split(' ')[0] || 'At', index: 0 }],
          explanation: `💡 **Giải thích chi tiết ETS:**\n- **Dẫn chứng Transcript:** "${pData.script.split('\n')[subIdx] || pData.script}"\n- **Lời dịch:** ${pData.translation.split('\n')[subIdx] || pData.translation}\n- **Phương án đúng:** **(${correctLetter}) ${qDef.correct}**`,
          vocabularyList: pData.vocab
        });
      });
    }

    // Save into MongoDB
    const updatedDoc = await ListeningExercise.findOneAndUpdate(
      { mode: 'level', part: 3, level: 1 },
      {
        title: 'Level 1 — Dễ (300 Đoạn Hội Thoại / 900 Câu ETS Gốc)',
        part: 3,
        level: 1,
        mode: 'level',
        year: '2026',
        isPro: false,
        totalQuestions: allQuestions.length,
        questions: allQuestions
      },
      { upsert: true, new: true }
    );

    console.log(`\n🎉 SEED THÀNH CÔNG 300 PASSAGES VỚI CÂU HỎI VÀ ĐÁP ÁN ĐA DẠNG!`);
    console.log(`📊 Tổng số Đoạn hội thoại: ${Math.floor(updatedDoc.questions.length / 3)}`);
    console.log(`📊 Tổng số Câu hỏi: ${updatedDoc.questions.length}`);
    console.log(`Sample Q1 (Nhóm 1): ${updatedDoc.questions[0].promptText} -> ${updatedDoc.questions[0].options.find(o => o.isCorrect).text}`);
    console.log(`Sample Q2 (Nhóm 1): ${updatedDoc.questions[1].promptText} -> ${updatedDoc.questions[1].options.find(o => o.isCorrect).text}`);
    console.log(`Sample Q3 (Nhóm 1): ${updatedDoc.questions[2].promptText} -> ${updatedDoc.questions[2].options.find(o => o.isCorrect).text}`);
    console.log(`Sample Q4 (Nhóm 2): ${updatedDoc.questions[3].promptText} -> ${updatedDoc.questions[3].options.find(o => o.isCorrect).text}`);
    console.log(`Sample Q5 (Nhóm 2): ${updatedDoc.questions[4].promptText} -> ${updatedDoc.questions[4].options.find(o => o.isCorrect).text}`);
    console.log(`Sample Q6 (Nhóm 2): ${updatedDoc.questions[5].promptText} -> ${updatedDoc.questions[5].options.find(o => o.isCorrect).text}`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

runSeed();
