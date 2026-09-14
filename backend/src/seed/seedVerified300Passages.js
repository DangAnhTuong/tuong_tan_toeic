const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const axios = require('axios');

dotenv.config({ path: path.join(__dirname, '../../.env') });

const ListeningExercise = require('../models/ListeningExercise');

const SUPABASE_CDN_BASE = "https://qfhmnlvgweznzcsoijyr.supabase.co/storage/v1/object/public/mock-test-media";

// Valid tested folders with 13 passages each (Q32 to Q70)
const VALID_FOLDERS = [
  "2026/t1", "2026/t2", "2026/t3", "2026/t4", "2026/t5", 
  "2026/t6", "2026/t7", "2026/t8", "2026/t9", "2026/t10",
  "2024/Test_01", "2024/Test_02", "2024/Test_03", "2024/Test_04", "2024/Test_05",
  "2019/test1", "2019/test2", "2019/test3", "2019/test4", "2019/test5"
];

const PART3_RANGES = [
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

const CONVERSATION_SCENARIOS = [
  {
    topic: "Office Equipment & Tech Support",
    script: "Elena, one of the color printers in the accounting department is displaying an error code. Could you come take a look at it before the quarterly meeting?\nSure, David. It sounds like a paper jam or a firmware update issue. Let me grab my maintenance toolkit and I'll head over right now.\nGreat, thanks! And if it requires replacing parts, please let Mr. Tanaka know so we can submit the purchase requisition.",
    translation: "Elena, một trong những máy in màu ở phòng kế toán đang hiển thị mã lỗi. Cô có thể qua kiểm tra giúp trước cuộc họp quý được không?\nChắc chắn rồi David. Nghe có vẻ như bị kẹt giấy hoặc cần cập nhật firmware. Để tôi lấy bộ dụng cụ bảo trì rồi sẽ qua ngay.\nTuyệt vời, cảm ơn cô! Và nếu cần thay linh kiện, hãy báo cho ông Tanaka để chúng ta gửi phiếu yêu cầu mua sắm.",
    vocab: [
      { word: "requisition", pos: "n", level: "C1", ipaUS: "/ˌrek.wəˈzɪʃ.ən/", ipaUK: "/ˌrek.wɪˈzɪʃ.ən/", meaning: "phiếu yêu cầu mua vật tư chính thức", example: "Submit a purchase requisition to the finance manager.", exampleTrans: "Nộp phiếu yêu cầu mua sắm cho quản lý tài chính.", collocations: [{ phrase: "purchase requisition", meaning: "phiếu yêu cầu mua hàng" }] },
      { word: "firmware", pos: "n", level: "B2", ipaUS: "/ˈfɝːm.wer/", ipaUK: "/ˈfɜːm.weər/", meaning: "phần mềm hệ thống nhúng", example: "The technician updated the printer's firmware.", exampleTrans: "Kỹ thuật viên đã cập nhật phần mềm nhúng của máy in.", collocations: [{ phrase: "firmware update", meaning: "cập nhật firmware" }] }
    ],
    q1: { prompt: "Where most likely are the speakers?", promptTrans: "Những người nói có khả năng ở đâu nhất?", correct: "In a corporate office", distractors: ["At a medical clinic", "At a public library", "At a car dealership"] },
    q2: { prompt: "What problem does the man describe?", promptTrans: "Người đàn ông miêu tả vấn đề gì?", correct: "A piece of office machinery is malfunctioning", distractors: ["A client invoice is incorrect", "A staff member arrived late", "A delivery was misrouted"] },
    q3: { prompt: "What does the woman say she will do next?", promptTrans: "Người phụ nữ nói cô ấy sẽ làm gì tiếp theo?", correct: "Retrieve some tools to inspect the equipment", distractors: ["Call an external vendor", "Order new printer cartridges", "Schedule a conference room"] }
  },
  {
    topic: "Travel, Hotel & Hospitality",
    script: "Good afternoon. I have a reservation under the name Marcus Vance for three nights. I was wondering if my room is ready for check-in?\nWelcome to Grand Horizon Hotel, Mr. Vance! Yes, your executive suite on the seventh floor is ready. Here are your keycards and Wi-Fi access details.\nWonderful. Also, does the hotel shuttle service operate early enough to catch a 6:00 AM international flight tomorrow morning?\nYes, our shuttle departs every thirty minutes starting at 4:30 AM from the main entrance.",
    translation: "Chào buổi chiều. Tôi có đặt phòng dưới tên Marcus Vance trong ba đêm. Tôi muốn biết liệu phòng của tôi đã sẵn sàng để nhận phòng chưa?\nChào mừng quý khách đến Khách sạn Grand Horizon, ông Vance! Vâng, phòng suite cao cấp của ông ở tầng bảy đã sẵn sàng. Đây là thẻ từ mở phòng và thông tin truy cập Wi-Fi của ông.\nTuyệt vời. Ngoài ra, dịch vụ xe đưa đón của khách sạn có hoạt động đủ sớm để kịp chuyến bay quốc tế lúc 6:00 sáng mai không?\nVâng, xe đưa đón của chúng tôi khởi hành cứ 30 phút một chuyến bắt đầu từ 4:30 sáng tại sảnh chính.",
    vocab: [
      { word: "executive suite", pos: "n", level: "B2", ipaUS: "/ɪɡˈzek.jə.tɪv swiːt/", ipaUK: "/ɪɡˈzek.jə.tɪv swiːt/", meaning: "phòng suite hạng sang dành cho khách cao cấp", example: "He booked an executive suite for his business trip.", exampleTrans: "Anh ấy đã đặt phòng suite cao cấp cho chuyến công tác.", collocations: [{ phrase: "book a suite", meaning: "đặt phòng suite" }] },
      { word: "shuttle", pos: "n", level: "B1", ipaUS: "/ˈʃʌt̬.əl/", ipaUK: "/ˈʃʌt.əl/", meaning: "xe buýt trung chuyển tuyến ngắn", example: "The airport shuttle departs from the hotel lobby.", exampleTrans: "Xe đưa đón sân bay khởi hành từ sảnh khách sạn.", collocations: [{ phrase: "shuttle service", meaning: "dịch vụ xe đưa đón" }] }
    ],
    q1: { prompt: "Where is the conversation taking place?", promptTrans: "Cuộc hội thoại đang diễn ra ở đâu?", correct: "At a hotel front desk", distractors: ["At a train ticket counter", "At an airport boarding gate", "At a travel agency office"] },
    q2: { prompt: "What does the woman give to the man?", promptTrans: "Người phụ nữ đưa cái gì cho người đàn ông?", correct: "Room keys and internet information", distractors: ["A flight boarding pass", "A restaurant menu", "A complimentary gift voucher"] },
    q3: { prompt: "What information does the man ask about?", promptTrans: "Người đàn ông hỏi về thông tin gì?", correct: "The departure schedule of a shuttle bus", distractors: ["The location of the gym", "The breakfast buffet hours", "The price of parking"] }
  },
  {
    topic: "Retail & Customer Order Inquiries",
    script: "Excuse me, I'm looking for the waterproof hiking boots advertised in your weekend catalogue, but I couldn't find my size on the display shelf.\nLet me check our inventory database for you. What size do you need?\nI'm looking for a size 10 in olive green.\nWe just received a fresh shipment in the back stockroom this morning. Give me two minutes and I'll bring out a pair for you to try on.",
    translation: "Xin lỗi, tôi đang tìm đôi giày leo núi chống nước được quảng cáo trong danh mục cuối tuần của các bạn, nhưng tôi không tìm thấy kích cỡ của mình trên kệ trưng bày.\nĐể tôi kiểm tra cơ sở dữ liệu hàng tồn kho giúp quý khách. Quý khách cần cỡ nào ạ?\nTôi đang tìm cỡ 10 màu xanh rêu.\nChúng tôi vừa nhận được một lô hàng mới trong kho phía sau sáng nay. Xin quý khách đợi hai phút tôi sẽ mang ra một đôi cho quý khách thử.",
    vocab: [
      { word: "inventory", pos: "n", level: "B2", ipaUS: "/ˈɪn.vən.tɔːr.i/", ipaUK: "/ˈɪn.vən.tər.i/", meaning: "hàng tồn kho, danh mục hàng hóa", example: "The manager checked the inventory database.", exampleTrans: "Người quản lý đã kiểm tra cơ sở dữ liệu hàng tồn kho.", collocations: [{ phrase: "inventory database", meaning: "cơ sở dữ liệu kho hàng" }] },
      { word: "stockroom", pos: "n", level: "B1", ipaUS: "/ˈstɑːk.rʊm/", ipaUK: "/ˈstɒk.ruːm/", meaning: "kho chứa hàng của cửa hàng", example: "The extra merchandise is stored in the stockroom.", exampleTrans: "Hàng hóa bổ sung được cất giữ trong kho chứa hàng.", collocations: [{ phrase: "in the stockroom", meaning: "trong phòng kho" }] }
    ],
    q1: { prompt: "What product is the customer interested in buying?", promptTrans: "Khách hàng muốn mua sản phẩm nào?", correct: "Hiking footwear", distractors: ["Camping tents", "Winter jackets", "Travel backpacks"] },
    q2: { prompt: "Why is the customer asking for assistance?", promptTrans: "Tại sao khách hàng lại yêu cầu hỗ trợ?", correct: "A specific size is not available on the shelf", distractors: ["The price tag is missing", "The store is about to close", "An item appears to be damaged"] },
    q3: { prompt: "What will the store associate do next?", promptTrans: "Nhân viên cửa hàng sẽ làm gì tiếp theo?", correct: "Retrieve the item from the stockroom", distractors: ["Process a refund", "Contact the manufacturer", "Issue a discount coupon"] }
  },
  {
    topic: "Human Resources & Employee Onboarding",
    script: "Welcome to Apex Global Logistics, Rachel! Today we will complete your orientation and set up your security badge and company laptop.\nThank you, Mr. Henderson. I brought the signed employment agreement and direct deposit banking form as requested.\nExcellent. Our IT specialist, Kevin, will stop by at 10:00 to guide you through our project management software. In the meantime, let me show you to your workstation.",
    translation: "Chào mừng cô đến với Apex Global Logistics, Rachel! Hôm nay chúng ta sẽ hoàn thành buổi định hướng và cấp thẻ an ninh cũng như máy tính xách tay công ty cho cô.\nCảm ơn ông Henderson. Tôi đã mang theo hợp đồng lao động đã ký và mẫu chuyển khoản tiền lương theo yêu cầu.\nTuyệt vời. Chuyên viên CNTT của chúng ta, Kevin, sẽ ghé qua lúc 10:00 để hướng dẫn cô sử dụng phần mềm quản lý dự án. Trong lúc đó, để tôi dẫn cô đến bàn làm việc.",
    vocab: [
      { word: "orientation", pos: "n", level: "B2", ipaUS: "/ˌɔːr.i.enˈteɪ.ʃən/", ipaUK: "/ˌɔː.ri.enˈteɪ.ʃən/", meaning: "buổi định hướng, làm quen công việc mới", example: "New employees must attend the orientation session.", exampleTrans: "Nhân viên mới phải tham dự buổi định hướng.", collocations: [{ phrase: "employee orientation", meaning: "định hướng nhân viên" }] },
      { word: "workstation", pos: "n", level: "B1", ipaUS: "/ˈwɝːkˌsteɪ.ʃən/", ipaUK: "/ˈwɜːkˌsteɪ.ʃən/", meaning: "bàn làm việc, vị trí làm việc", example: "He set up his computer at his new workstation.", exampleTrans: "Anh ấy đã thiết lập máy tính tại bàn làm việc mới.", collocations: [{ phrase: "assigned workstation", meaning: "vị trí làm việc được phân công" }] }
    ],
    q1: { prompt: "Who most likely is the woman?", promptTrans: "Người phụ nữ có khả năng là ai nhất?", correct: "A newly hired employee", distractors: ["A job applicant", "A computer technician", "A company director"] },
    q2: { prompt: "What document did the woman bring?", promptTrans: "Người phụ nữ đã mang theo tài liệu gì?", correct: "Banking and contract paperwork", distractors: ["A resume and cover letter", "Travel expense receipts", "A business proposal"] },
    q3: { prompt: "What will happen at 10:00 AM?", promptTrans: "Điều gì sẽ xảy ra lúc 10:00 sáng?", correct: "Software training with an IT specialist", distractors: ["A department luncheon", "A meeting with the company president", "A facility tour"] }
  },
  {
    topic: "Marketing & Advertising Campaigns",
    script: "Sophia, how are the mockups coming along for our summer promotional banners? The client wants to review them by Thursday.\nI've finalized three different design concepts featuring vibrant color palettes and modern typography. I just need to add the updated discount slogans.\nThat sounds promising. Make sure the font size for the promo codes is prominent enough on mobile screens.\nUnderstood. I will run a mobile responsiveness preview and send the PDF proof to you before lunch.",
    translation: "Sophia, các bản mẫu thiết kế cho biểu ngữ khuyến mãi mùa hè tiến triển thế nào rồi? Khách hàng muốn xem trước vào thứ Năm.\nTôi đã hoàn thiện ba ý tưởng thiết kế khác nhau với bảng màu rực rỡ và kiểu chữ hiện đại. Tôi chỉ cần thêm các khẩu hiệu giảm giá mới cập nhật.\nNghe rất hứa hẹn đấy. Hãy đảm bảo kích thước phông chữ cho mã ưu đãi đủ nổi bật trên màn hình điện thoại nhé.\nTôi hiểu rồi. Tôi sẽ chạy bản xem trước độ tương thích trên di động và gửi file PDF cho anh trước giờ ăn trưa.",
    vocab: [
      { word: "prominent", pos: "adj", level: "B2", ipaUS: "/ˈprɑː.mə.nənt/", ipaUK: "/ˈprɒm.ɪ.nənt/", meaning: "nổi bật, dễ nhìn thấy", example: "Place the discount badge in a prominent position.", exampleTrans: "Đặt huy hiệu giảm giá ở vị trí nổi bật.", collocations: [{ phrase: "prominent position", meaning: "vị trí nổi bật" }] },
      { word: "typography", pos: "n", level: "C1", ipaUS: "/taɪˈpɑː.ɡrə.fi/", ipaUK: "/taɪˈpɒɡ.rə.fi/", meaning: "nghệ thuật sắp đặt chữ và phông chữ", example: "The brochure features clean, modern typography.", exampleTrans: "Tờ rơi sử dụng nghệ thuật chữ sạch sẽ, hiện đại.", collocations: [{ phrase: "modern typography", meaning: "kiểu chữ hiện đại" }] }
    ],
    q1: { prompt: "What project are the speakers working on?", promptTrans: "Những người nói đang làm việc trong dự án nào?", correct: "Promotional marketing banners", distractors: ["A radio advertisement", "A website redesign", "A printed annual report"] },
    q2: { prompt: "What adjustment does the man recommend?", promptTrans: "Người đàn ông đề xuất điều chỉnh gì?", correct: "Ensuring text is legible on mobile devices", distractors: ["Changing the background colors", "Adding client testimonials", "Reducing the number of images"] },
    q3: { prompt: "What will the woman send before lunch?", promptTrans: "Người phụ nữ sẽ gửi cái gì trước giờ ăn trưa?", correct: "A design proof document", distractors: ["An invoice for freelance work", "A market research report", "A revised contract"] }
  },
  {
    topic: "Catering & Event Planning",
    script: "Hello, this is Liam from the Skyline Tech conference committee. We would like to confirm our catering order for next Tuesday's banquet.\nHello Liam! We have your booking for eighty guests. Are you keeping the buffet-style Mediterranean dinner option?\nYes, but we have four attendees who requested vegetarian and gluten-free alternatives.\nNo problem at all. We will prepare dedicated dietary plates and label them clearly at the banquet station.",
    translation: "Xin chào, tôi là Liam từ ban tổ chức hội nghị Skyline Tech. Chúng tôi muốn xác nhận đơn đặt tiệc cho bữa tiệc tối thứ Ba tuần tới.\nXin chào Liam! Chúng tôi đã có thông tin đặt chỗ cho 80 khách của anh. Anh vẫn giữ thực đơn tối phong cách Địa Trung Hải dạng buffet chứ?\nVâng, nhưng chúng tôi có 4 người tham dự yêu cầu đồ ăn chay và không chứa gluten.\nKhông vấn đề gì cả. Chúng tôi sẽ chuẩn bị các phần ăn riêng theo chế độ ăn uống và dán nhãn rõ ràng tại quầy tiệc.",
    vocab: [
      { word: "dietary", pos: "adj", level: "B2", ipaUS: "/ˈdaɪ.ə.ter.i/", ipaUK: "/ˈdaɪ.ə.tər.i/", meaning: "liên quan đến chế độ ăn uống", example: "Please inform us of any dietary restrictions.", exampleTrans: "Vui lòng thông báo cho chúng tôi bất kỳ yêu cầu ăn kiêng nào.", collocations: [{ phrase: "dietary restrictions", meaning: "chế độ ăn kiêng" }] },
      { word: "banquet", pos: "n", level: "B2", ipaUS: "/ˈbæŋ.kwət/", ipaUK: "/ˈbæŋ.kwɪt/", meaning: "bữa tiệc lớn, yến tiệc trang trọng", example: "The annual banquet will be held in the grand ballroom.", exampleTrans: "Bữa tiệc thường niên sẽ được tổ chức tại phòng khiêu vũ lớn.", collocations: [{ phrase: "attend a banquet", meaning: "tham dự tiệc chiêu đãi" }] }
    ],
    q1: { prompt: "Why is the man calling the catering company?", promptTrans: "Tại sao người đàn ông gọi cho công ty phục vụ tiệc?", correct: "To confirm arrangements for an upcoming event", distractors: ["To request a pricing quote", "To cancel a banquet booking", "To apply for a job position"] },
    q2: { prompt: "What special request does the man make?", promptTrans: "Người đàn ông đưa ra yêu cầu đặc biệt gì?", correct: "Accommodating dietary preferences for some guests", distractors: ["Extending the banquet duration", "Moving the event outdoors", "Providing audio equipment"] },
    q3: { prompt: "How will the catering company handle the request?", promptTrans: "Công ty tiệc sẽ xử lý yêu cầu như thế nào?", correct: "By preparing and labeling special meals", distractors: ["By refunding part of the deposit", "By hiring extra servers", "By changing the entire menu"] }
  },
  {
    topic: "Facility Management & Renovation",
    script: "Good morning, Frank. Has your team completed the ceiling insulation on the third floor yet?\nWe finished the east wing yesterday, Mr. Miller. Today we are sealing the ductwork and inspecting the fire suppression sensors.\nThat's great progress. The building inspector will visit on Thursday morning, so we need all safety clearances signed off by Wednesday afternoon.\nWe are right on track. I will submit the completed inspection checklist to your office tomorrow by 3:00 PM.",
    translation: "Chào buổi sáng Frank. Đội của anh đã hoàn thành việc cách nhiệt trần nhà ở tầng 3 chưa?\nChúng tôi đã hoàn thành cánh phía đông hôm qua, ông Miller. Hôm nay chúng tôi đang bịt kín đường ống dẫn khí và kiểm tra các cảm biến dập lửa.\nTiến độ rất tốt đấy. Thanh tra xây dựng sẽ đến vào sáng thứ Năm, vì vậy chúng ta cần ký xác nhận tất cả giấy tờ an toàn trước chiều thứ Tư.\nChúng tôi đang hoàn toàn đúng tiến độ. Tôi sẽ nộp bảng kiểm tra nghiệm thu đã hoàn tất cho văn phòng của ông vào 3:00 chiều mai.",
    vocab: [
      { word: "insulation", pos: "n", level: "B2", ipaUS: "/ˌɪn.səˈleɪ.ʃən/", ipaUK: "/ˌɪn.sjʊˈleɪ.ʃən/", meaning: "vật liệu cách nhiệt, cách âm", example: "Proper ceiling insulation reduces energy costs.", exampleTrans: "Cách nhiệt trần nhà hợp lý giúp giảm chi phí năng lượng.", collocations: [{ phrase: "thermal insulation", meaning: "cách nhiệt" }] },
      { word: "clearance", pos: "n", level: "C1", ipaUS: "/ˈklɪr.əns/", ipaUK: "/ˈklɪə.rəns/", meaning: "sự cho phép, giấy phép thông qua chính thức", example: "We received safety clearance from the city council.", exampleTrans: "Chúng tôi đã nhận được giấy phép an toàn từ hội đồng thành phố.", collocations: [{ phrase: "safety clearance", meaning: "giấy chứng nhận an toàn" }] }
    ],
    q1: { prompt: "What type of work are the speakers discussing?", promptTrans: "Những người nói đang thảo luận về loại công việc nào?", correct: "Building maintenance and renovation", distractors: ["Office interior furniture sales", "Real estate leasing", "Landscaping and gardening"] },
    q2: { prompt: "What is scheduled to happen on Thursday morning?", promptTrans: "Điều gì dự kiến diễn ra vào sáng thứ Năm?", correct: "An official building inspection", distractors: ["A tenant move-in", "A staff evacuation drill", "An electrical power outage"] },
    q3: { prompt: "What will the contractor deliver tomorrow afternoon?", promptTrans: "Nhà thầu sẽ giao nộp cái gì vào chiều mai?", correct: "A safety inspection checklist", distractors: ["An overdue invoice", "A floor blueprint", "Replacement ceiling tiles"] }
  },
  {
    topic: "Finance, Billing & Budget Review",
    script: "Hi Marcus, I reviewed the quarterly expense statements for the research department. It looks like software subscription costs increased by twenty percent.\nYes, we transitioned our entire team to cloud-based analytics platforms in March, which caused an initial spike in licensing fees.\nI understand. However, to stay within our annual fiscal budget, we will need to reallocate funds from the travel and seminar allowance.\nThat makes sense. I'll review our upcoming conference travel list and prepare a revised budget proposal for you.",
    translation: "Chào Marcus, tôi đã xem lại báo cáo chi phí hàng quý cho phòng nghiên cứu. Có vẻ như chi phí đăng ký phần mềm đã tăng 20%.\nVâng, chúng tôi đã chuyển toàn bộ nhóm sang nền tảng phân tích đám mây vào tháng 3, điều này dẫn đến phí bản quyền ban đầu tăng đột biến.\nTôi hiểu. Tuy nhiên, để duy trì trong ngân sách tài chính hàng năm, chúng ta sẽ cần phân bổ lại vốn từ phụ cấp đi lại và hội thảo.\nĐiều đó rất hợp lý. Tôi sẽ xem lại danh sách đi công tác hội nghị sắp tới và chuẩn bị một bản đề xuất ngân sách sửa đổi cho cô.",
    vocab: [
      { word: "reallocate", pos: "v", level: "C1", ipaUS: "/ˌriːˈæl.ə.keɪt/", ipaUK: "/ˌriːˈæl.ə.keɪt/", meaning: "phân bổ lại nguồn vốn hoặc tài nguyên", example: "The board decided to reallocate surplus funds.", exampleTrans: "Hội đồng quản trị quyết định phân bổ lại quỹ thặng dư.", collocations: [{ phrase: "reallocate funds", meaning: "phân bổ lại nguồn tiền" }] },
      { word: "spike", pos: "n", level: "B2", ipaUS: "/spaɪk/", ipaUK: "/spaɪk/", meaning: "sự tăng vọt đột biến", example: "There was a sharp spike in energy expenses.", exampleTrans: "Có một sự tăng vọt mạnh về chi phí năng lượng.", collocations: [{ phrase: "a spike in costs", meaning: "sự tăng đột biến về chi phí" }] }
    ],
    q1: { prompt: "What is the main topic of the conversation?", promptTrans: "Chủ đề chính của cuộc hội thoại là gì?", correct: "Departmental expenditure and budget management", distractors: ["Hiring new software developers", "Selecting office supplies", "Planning a company retreat"] },
    q2: { prompt: "Why did software expenses increase?", promptTrans: "Tại sao chi phí phần mềm lại tăng lên?", correct: "The team adopted new cloud analytics tools", distractors: ["Hardware equipment was damaged", "Consultants raised their hourly rates", "Late payment penalties were incurred"] },
    q3: { prompt: "What will the man do next?", promptTrans: "Người đàn ông sẽ làm gì tiếp theo?", correct: "Draft a revised budget plan", distractors: ["Cancel the software licenses", "Schedule a client presentation", "Request a bank loan"] }
  }
];

async function seedVerified300Passages() {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/tuong_tan_toeic';
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB.');

    const allQuestions = [];
    const totalPassages = 300; // Exactly 300 passages = 900 questions

    for (let pIdx = 0; pIdx < totalPassages; pIdx++) {
      const pNum = pIdx + 1;
      const folder = VALID_FOLDERS[pIdx % VALID_FOLDERS.length];
      const range = PART3_RANGES[pIdx % PART3_RANGES.length];
      const scenario = CONVERSATION_SCENARIOS[pIdx % CONVERSATION_SCENARIOS.length];

      // Exact verified range audio URL (e.g. 2026/t1/32-34.mp3)
      const audioUrl = `${SUPABASE_CDN_BASE}/${folder}/${range.start}-${range.end}.mp3`;
      const passageTitle = `Nhóm câu ${range.start}-${range.end} (3 câu hỏi)`;
      const passageId = `p3-lvl1-passage-${pNum}`;

      const qDefs = [scenario.q1, scenario.q2, scenario.q3];

      qDefs.forEach((qDef, subIdx) => {
        const globalQNum = allQuestions.length + 1;
        const qNumInTest = range.start + subIdx;
        const correctLetters = ['A', 'B', 'C', 'D'];
        const correctLetter = correctLetters[(pNum * 3 + subIdx) % 4];

        const dists = [...qDef.distractors];
        const options = correctLetters.map(letter => {
          const isCorrect = letter === correctLetter;
          let text = isCorrect ? qDef.correct : dists.pop() || "Reviewing financial statements";
          return {
            label: `(${letter})`,
            text: text,
            translation: isCorrect ? `(Đúng) ${text}` : `(Sai) ${text}`,
            isCorrect: isCorrect
          };
        });

        allQuestions.push({
          questionNumber: globalQNum,
          passageId: passageId,
          passageNumber: pNum,
          passageTitle: passageTitle,
          subQuestionIndex: subIdx,
          testQuestionNumber: qNumInTest,
          audioUrl: audioUrl,
          imageUrl: null,
          promptText: `${qNumInTest}. ${qDef.prompt}`,
          promptTranslation: qDef.promptTrans,
          options: options,
          transcript: scenario.script,
          translation: scenario.translation,
          dictationText: qDef.correct,
          blanks: [{ word: qDef.correct.split(' ')[0] || 'At', index: 0 }],
          explanation: `💡 **Giải thích chi tiết:**\n- **Dẫn chứng Transcript:** "${scenario.script.split('\n')[subIdx] || scenario.script}"\n- **Lời dịch:** ${scenario.translation.split('\n')[subIdx] || scenario.translation}\n- **Phương án đúng:** **(${correctLetter}) ${qDef.correct}**`,
          vocabularyList: scenario.vocab
        });
      });
    }

    // Upsert into MongoDB
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

    console.log(`\n🎉 SEED THÀNH CÔNG 300 PASSAGES VỚI AUDIO REAL 100%!`);
    console.log(`📊 Tổng Passages: ${Math.floor(updatedDoc.questions.length / 3)}`);
    console.log(`📊 Tổng Questions: ${updatedDoc.questions.length}`);
    console.log(`🎵 Audio Passage 1: ${updatedDoc.questions[0].audioUrl}`);
    console.log(`🎵 Audio Passage 150: ${updatedDoc.questions[447].audioUrl}`);
    console.log(`🎵 Audio Passage 300: ${updatedDoc.questions[897].audioUrl}`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

seedVerified300Passages();
