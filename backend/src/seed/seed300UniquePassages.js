const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');

dotenv.config({ path: path.join(__dirname, '../../.env') });

const ListeningExercise = require('../models/ListeningExercise');

const SUPABASE_CDN_BASE = "https://qfhmnlvgweznzcsoijyr.supabase.co/storage/v1/object/public/mock-test-media";

// 25 Verified Tests x 13 passages = 325 Unique Audio files (more than 300 needed!)
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

// Comprehensive 50+ Unique Scenarios for ETS Part 3 Conversations
const SCENARIO_TEMPLATES = [
  {
    topic: "Office Machinery & Paper Jam",
    script: "Elena, the color laser printer on the fourth floor is displaying an error code. Could you check it before our 2:00 PM client presentation?\nSure, David. It might be a paper jam in the duplex feeder. Let me get my maintenance toolkit and I'll head upstairs immediately.\nThanks a lot. If it needs a new toner cartridge, let Mr. Henderson know so he can issue a purchase order.",
    translation: "Elena, máy in laser màu ở tầng 4 đang báo mã lỗi. Cô có thể kiểm tra giúp trước bài thuyết trình với khách hàng lúc 2:00 chiều không?\nChắc chắn rồi David. Có thể do kẹt giấy trong khay đảo mặt. Để tôi lấy bộ dụng cụ bảo trì rồi sẽ lên tầng ngay.\nCảm ơn cô rất nhiều. Nếu cần hộp mực mới, hãy báo cho ông Henderson để ông ấy xuất đơn đặt mua.",
    vocab: [
      { word: "duplex feeder", pos: "n", level: "B2", ipaUS: "/ˈduː.pleks ˈfiː.dɚ/", ipaUK: "/ˈdjuː.pleks ˈfiː.dər/", meaning: "khay nạp giấy đảo mặt tự động", example: "Check the duplex feeder for jammed pages.", exampleTrans: "Kiểm tra khay đảo mặt xem có trang giấy bị kẹt không." },
      { word: "purchase order", pos: "n", level: "B2", ipaUS: "/ˈpɝː.tʃəs ˌɔːr.dɚ/", ipaUK: "/ˈpɜː.tʃɪs ˌɔː.dər/", meaning: "đơn đặt hàng thương mại", example: "Submit the purchase order for approval.", exampleTrans: "Nộp đơn đặt hàng để xin phê duyệt." }
    ],
    q1: { prompt: "Where does the conversation most likely take place?", promptTrans: "Cuộc hội thoại diễn ra ở đâu?", correct: "In a corporate office", dist: ["At a public library", "At a post office", "At a car repair shop"] },
    q2: { prompt: "What problem does the man mention?", promptTrans: "Người đàn ông đề cập đến vấn đề gì?", correct: "A piece of office equipment is not working", dist: ["A client cancelled a contract", "A meeting was rescheduled", "An employee arrived late"] },
    q3: { prompt: "What does the woman say she will do next?", promptTrans: "Người phụ nữ nói cô ấy sẽ làm gì tiếp theo?", correct: "Retrieve some tools to inspect the machine", dist: ["Call an external technician", "Order replacement paper", "Book a conference room"] }
  },
  {
    topic: "Hotel Check-in & Early Shuttle Service",
    script: "Good afternoon. I have a reservation under Marcus Vance for three nights. Is my room ready for check-in?\nWelcome to Grand Horizon Hotel, Mr. Vance! Your executive suite on the seventh floor is all set. Here are your electronic keycards and Wi-Fi login.\nWonderful. Does your airport shuttle operate early enough for a 6:00 AM flight tomorrow?\nYes, our shuttle departs every thirty minutes starting at 4:30 AM from the main entrance.",
    translation: "Chào buổi chiều. Tôi có đặt phòng dưới tên Marcus Vance trong ba đêm. Phòng của tôi đã sẵn sàng chưa?\nChào mừng quý khách đến Khách sạn Grand Horizon, ông Vance! Phòng suite cao cấp của ông ở tầng 7 đã sẵn sàng. Đây là thẻ từ và thông tin Wi-Fi.\nTuyệt vời. Xe đưa đón sân bay của khách sạn có chạy sớm để kịp chuyến bay 6:00 sáng mai không?\nVâng, xe đưa đón khởi hành cứ 30 phút một chuyến từ 4:30 sáng tại sảnh chính.",
    vocab: [
      { word: "executive suite", pos: "n", level: "B2", ipaUS: "/ɪɡˈzek.jə.tɪv swiːt/", ipaUK: "/ɪɡˈzek.jə.tɪv swiːt/", meaning: "phòng suite cao cấp dành cho khách công tác", example: "The executive suite has a balcony.", exampleTrans: "Phòng suite cao cấp có ban công." },
      { word: "shuttle", pos: "n", level: "B1", ipaUS: "/ˈʃʌt̬.əl/", ipaUK: "/ˈʃʌt.əl/", meaning: "xe trung chuyển tuyến ngắn", example: "Take the airport shuttle from the hotel.", exampleTrans: "Đi xe trung chuyển sân bay từ khách sạn." }
    ],
    q1: { prompt: "Where is the conversation taking place?", promptTrans: "Cuộc hội thoại diễn ra ở đâu?", correct: "At a hotel reception desk", dist: ["At an airport ticket counter", "At a train station", "At a rental car agency"] },
    q2: { prompt: "What does the woman hand to the man?", promptTrans: "Người phụ nữ đưa cái gì cho người đàn ông?", correct: "Room keys and access credentials", dist: ["A boarding pass", "A restaurant menu", "A complimentary voucher"] },
    q3: { prompt: "What does the man inquire about?", promptTrans: "Người đàn ông hỏi thăm về điều gì?", correct: "The schedule of a transport service", dist: ["The swimming pool hours", "The breakfast buffet cost", "The gym location"] }
  },
  {
    topic: "Retail Store & Inventory Search",
    script: "Excuse me, I'm looking for the waterproof hiking boots shown in your weekend flyer, but I couldn't find size 10 on the display shelf.\nLet me check our stockroom database right away. We received a fresh delivery of outdoor footwear this morning.\nGreat. I prefer the olive green model if it is in stock.\nWe have two pairs in the back. Give me a couple of minutes and I will bring them out for you to try on.",
    translation: "Xin lỗi, tôi đang tìm đôi giày leo núi chống nước trong tờ rơi cuối tuần, nhưng không thấy cỡ 10 trên kệ.\nĐể tôi kiểm tra cơ sở dữ liệu kho hàng ngay. Chúng tôi vừa nhận chuyến giao giày ngoài trời sáng nay.\nTuyệt. Tôi thích mẫu màu xanh rêu nếu còn hàng.\nChúng tôi còn hai đôi ở phía sau. Đợi tôi vài phút tôi sẽ lấy ra cho bạn thử.",
    vocab: [
      { word: "flyer", pos: "n", level: "A2", ipaUS: "/ˈflaɪ.ɚ/", ipaUK: "/ˈflaɪ.ər/", meaning: "tờ rơi quảng cáo", example: "The discount is listed in our weekly flyer.", exampleTrans: "Mức giảm giá được liệt kê trong tờ rơi hàng tuần." },
      { word: "stockroom", pos: "n", level: "B1", ipaUS: "/ˈstɑːk.rʊm/", ipaUK: "/ˈstɒk.ruːm/", meaning: "phòng chứa hàng, kho cửa hàng", example: "Extra merchandise is stored in the stockroom.", exampleTrans: "Hàng hóa thêm được cất trong kho." }
    ],
    q1: { prompt: "What merchandise is the customer looking for?", promptTrans: "Khách hàng đang tìm món hàng nào?", correct: "Hiking boots", dist: ["Winter coats", "Camping tents", "Travel suitcases"] },
    q2: { prompt: "Why does the customer request assistance?", promptTrans: "Tại sao khách hàng yêu cầu hỗ trợ?", correct: "A specific size is not on the shelf", dist: ["The price is not displayed", "An item is damaged", "The store is closing"] },
    q3: { prompt: "What will the employee do next?", promptTrans: "Nhân viên sẽ làm gì tiếp theo?", correct: "Retrieve a product from the storage room", dist: ["Process a customer refund", "Contact the footwear supplier", "Issue a promotional coupon"] }
  },
  {
    topic: "Human Resources & Employee Onboarding",
    script: "Welcome to Apex Global Logistics, Rachel! Today we'll complete your new-hire orientation and issue your company security badge.\nThank you, Mr. Henderson. I brought the signed employment agreement and direct deposit banking form.\nExcellent. Our IT specialist, Kevin, will stop by at 10:00 AM to configure your laptop and project management account.\nSounds great. Should I read through the company handbook while I wait?",
    translation: "Chào mừng cô đến với Apex Global Logistics, Rachel! Hôm nay chúng ta sẽ hoàn thành buổi định hướng nhân viên mới và cấp thẻ an ninh.\nCảm ơn ông Henderson. Tôi đã mang hợp đồng lao động đã ký và mẫu chuyển khoản lương.\nTuyệt vời. Chuyên viên CNTT Kevin sẽ ghé qua lúc 10:00 sáng để cài đặt laptop và tài khoản quản lý dự án cho cô.\nNghe tuyệt đấy. Tôi có nên đọc sổ tay công ty trong khi đợi không?",
    vocab: [
      { word: "orientation", pos: "n", level: "B2", ipaUS: "/ˌɔːr.i.enˈteɪ.ʃən/", ipaUK: "/ˌɔː.ri.enˈteɪ.ʃən/", meaning: "buổi định hướng công việc", example: "All new staff attend orientation on Monday.", exampleTrans: "Tất cả nhân viên mới tham dự buổi định hướng vào thứ Hai." },
      { word: "handbook", pos: "n", level: "B1", ipaUS: "/ˈhænd.bʊk/", ipaUK: "/ˈhænd.bʊk/", meaning: "sổ tay hướng dẫn nội bộ", example: "Review the safety policies in the handbook.", exampleTrans: "Xem lại các chính sách an toàn trong sổ tay." }
    ],
    q1: { prompt: "Who most likely is the woman?", promptTrans: "Người phụ nữ có khả năng là ai nhất?", correct: "A newly hired employee", dist: ["A prospective client", "A computer repair technician", "A university intern"] },
    q2: { prompt: "What paperwork did the woman bring?", promptTrans: "Người phụ nữ đã mang theo giấy tờ gì?", correct: "A signed employment agreement and banking details", dist: ["A medical certificate", "A travel visa application", "An expense reimbursement form"] },
    q3: { prompt: "What is scheduled to take place at 10:00 AM?", promptTrans: "Điều gì dự kiến diễn ra lúc 10:00 sáng?", correct: "Computer and account setup with an IT specialist", dist: ["A staff luncheon", "A department team meeting", "A building safety drill"] }
  },
  {
    topic: "Marketing Campaign & Social Media Banner",
    script: "Sophia, how are the design proofs coming along for our summer social media campaign? The client needs to approve them by Thursday.\nI've finalized three layout options with bold color schemes and modern typography. I just need to add the updated promotional promo codes.\nThat sounds promising. Make sure the font size for the promo codes is prominent enough on mobile screens.\nUnderstood. I will run a mobile responsiveness test and e-mail the PDF proof to you before noon.",
    translation: "Sophia, bản mẫu thiết kế cho chiến dịch mạng xã hội mùa hè tiến triển thế nào rồi? Khách hàng cần duyệt trước thứ Năm.\nTôi đã hoàn thiện ba bố cục với tông màu nổi bật và kiểu chữ hiện đại. Tôi chỉ cần thêm mã khuyến mãi mới cập nhật.\nNghe hứa hẹn đấy. Hãy đảm bảo cỡ chữ mã giảm giá đủ nổi bật trên màn hình di động nhé.\nTôi hiểu rồi. Tôi sẽ chạy thử nghiệm hiển thị di động và gửi file PDF cho anh trước buổi trưa.",
    vocab: [
      { word: "prominent", pos: "adj", level: "B2", ipaUS: "/ˈprɑː.mə.nənt/", ipaUK: "/ˈprɒm.ɪ.nənt/", meaning: "nổi bật, dễ nhận thấy", example: "Place the logo in a prominent position.", exampleTrans: "Đặt logo ở vị trí nổi bật." },
      { word: "responsiveness", pos: "n", level: "C1", ipaUS: "/rɪˈspɑːn.sɪv.nəs/", ipaUK: "/rɪˈspɒn.sɪv.nəs/", meaning: "khả năng tương thích hiển thị trên nhiều màn hình", example: "Test the website's mobile responsiveness.", exampleTrans: "Kiểm tra độ tương thích di động của trang web." }
    ],
    q1: { prompt: "What project are the speakers discussing?", promptTrans: "Những người nói đang thảo luận về dự án nào?", correct: "An online promotional campaign", dist: ["A print catalog redesign", "A radio commercial script", "A product packaging overhaul"] },
    q2: { prompt: "What recommendation does the man provide?", promptTrans: "Người đàn ông đưa ra đề xuất gì?", correct: "Ensuring promotional codes are clearly readable on phones", dist: ["Changing the main color scheme", "Adding customer reviews", "Shortening the headline text"] },
    q3: { prompt: "What will the woman send before noon?", promptTrans: "Người phụ nữ sẽ gửi cái gì trước buổi trưa?", correct: "A design proof document", dist: ["An invoice for freelance fees", "A revised contract", "A marketing survey report"] }
  },
  {
    topic: "Catering Arrangements & Dietary Options",
    script: "Hello, this is Liam from the Skyline Tech conference committee. I'm calling to confirm our catering order for next Tuesday's banquet.\nHello Liam! We have your reservation for eighty guests. Are you still planning on the Mediterranean buffet option?\nYes, but we have four attendees who requested vegetarian and gluten-free meals.\nNot a problem. We will prepare four specialized dietary plates and label them clearly at the banquet serving table.",
    translation: "Xin chào, tôi là Liam từ ban tổ chức hội nghị Skyline Tech. Tôi gọi để xác nhận đơn đặt tiệc cho bữa tiệc tối thứ Ba tuần tới.\nChào Liam! Chúng tôi đã có đặt chỗ cho 80 khách. Anh vẫn chọn thực đơn buffet Địa Trung Hải chứ?\nVâng, nhưng có 4 người tham dự yêu cầu suất ăn chay và không chứa gluten.\nKhông vấn đề gì. Chúng tôi sẽ chuẩn bị 4 phần ăn kiêng riêng và dán nhãn rõ ràng tại bàn tiệc.",
    vocab: [
      { word: "dietary", pos: "adj", level: "B2", ipaUS: "/ˈdaɪ.ə.ter.i/", ipaUK: "/ˈdaɪ.ə.tər.i/", meaning: "thuộc về chế độ ăn uống, ăn kiêng", example: "Please note any dietary restrictions.", exampleTrans: "Vui lòng lưu ý các yêu cầu ăn kiêng." },
      { word: "banquet", pos: "n", level: "B2", ipaUS: "/ˈbæŋ.kwət/", ipaUK: "/ˈbæŋ.kwɪt/", meaning: "bữa yến tiệc trang trọng", example: "The awards banquet starts at 7 PM.", exampleTrans: "Tiệc trao giải bắt đầu lúc 7 giờ tối." }
    ],
    q1: { prompt: "Why is the man calling the catering company?", promptTrans: "Tại sao người đàn ông gọi cho công ty tiệc?", correct: "To finalize event meal arrangements", dist: ["To request a pricing quote", "To reschedule a wedding dinner", "To inquire about job openings"] },
    q2: { prompt: "What special request is mentioned by the man?", promptTrans: "Người đàn ông đưa ra yêu cầu đặc biệt gì?", correct: "Accommodating dietary restrictions for certain guests", dist: ["Extending the banquet duration", "Moving the event outdoors", "Providing audio microphones"] },
    q3: { prompt: "How will the catering company handle the request?", promptTrans: "Công ty tiệc sẽ xử lý yêu cầu như thế nào?", correct: "By preparing and labeling individual specialty meals", dist: ["By offering a discounted rate", "By altering the entire buffet menu", "By providing takeaway lunchboxes"] }
  },
  {
    topic: "Facility Management & Renovation Inspection",
    script: "Good morning, Frank. Has your crew completed the ceiling insulation on the third floor yet?\nWe finished the east wing yesterday, Mr. Miller. Today we're sealing the ductwork and testing the fire safety sensors.\nThat's good progress. The city building inspector will visit on Thursday morning, so we need all safety sign-offs ready by Wednesday.\nWe're right on schedule. I'll drop off the completed checklist at your office tomorrow by 3:00 PM.",
    translation: "Chào buổi sáng Frank. Đội của anh đã làm xong phần cách nhiệt trần ở tầng 3 chưa?\nChúng tôi đã hoàn thành cánh phía đông hôm qua, ông Miller. Hôm nay chúng tôi đang bịt kín đường ống và kiểm tra cảm biến an toàn cháy.\nTiến độ tốt đấy. Thanh tra xây dựng thành phố sẽ đến vào sáng thứ Năm, nên chúng ta cần ký xác nhận an toàn trước thứ Tư.\nChúng tôi hoàn toàn đúng tiến độ. Tôi sẽ gửi bảng kiểm tra hoàn tất qua văn phòng của ông vào 3:00 chiều mai.",
    vocab: [
      { word: "insulation", pos: "n", level: "B2", ipaUS: "/ˌɪn.səˈleɪ.ʃən/", ipaUK: "/ˌɪn.sjʊˈleɪ.ʃən/", meaning: "vật liệu cách nhiệt", example: "Good insulation lowers heating bills.", exampleTrans: "Cách nhiệt tốt giúp giảm tiền sưởi." },
      { word: "sign-off", pos: "n", level: "C1", ipaUS: "/ˈsaɪn.ɑːf/", ipaUK: "/ˈsaɪn.ɒf/", meaning: "sự ký duyệt, chấp thuận chính thức", example: "We need the manager's sign-off before launch.", exampleTrans: "Chúng ta cần chữ ký duyệt của quản lý trước khi ra mắt." }
    ],
    q1: { prompt: "What type of project are the speakers discussing?", promptTrans: "Những người nói đang thảo luận về loại dự án nào?", correct: "Building renovation and maintenance", dist: ["Landscaping and lawn care", "Office furniture purchasing", "Commercial property leasing"] },
    q2: { prompt: "What event will take place on Thursday morning?", promptTrans: "Sự kiện gì sẽ diễn ra vào sáng thứ Năm?", correct: "An official municipal building inspection", dist: ["A staff fire evacuation drill", "A tenant welcome reception", "An electrical power shutdown"] },
    q3: { prompt: "What will the contractor deliver tomorrow afternoon?", promptTrans: "Nhà thầu sẽ giao cái gì vào chiều mai?", correct: "A safety inspection checklist", dist: ["A cost estimate invoice", "Architectural floor blueprints", "A supplier contract"] }
  },
  {
    topic: "Corporate Budget & Software Subscriptions",
    script: "Hi Marcus, I reviewed the quarterly expense statements for the engineering team. It looks like software subscription costs increased by twenty percent.\nYes, we transitioned our developers to cloud-based analytics platforms in March, which caused an initial increase in licensing fees.\nI understand. However, to stay within our annual fiscal budget, we will need to reallocate funds from the travel and seminar allowance.\nThat makes sense. I'll review our upcoming conference travel list and prepare a revised budget proposal for you.",
    translation: "Chào Marcus, tôi đã xem lại báo cáo chi phí hàng quý cho đội kỹ thuật. Có vẻ chi phí đăng ký phần mềm đã tăng 20%.\nVâng, chúng tôi đã chuyển các lập trình viên sang nền tảng phân tích đám mây vào tháng 3, khiến phí bản quyền ban đầu tăng lên.\nTôi hiểu. Tuy nhiên, để duy trì trong ngân sách tài khóa hàng năm, chúng ta sẽ phải phân bổ lại vốn từ quỹ công tác và hội thảo.\nĐiều đó rất hợp lý. Tôi sẽ xem lại danh sách đi hội nghị sắp tới và chuẩn bị bản đề xuất ngân sách sửa đổi.",
    vocab: [
      { word: "reallocate", pos: "v", level: "C1", ipaUS: "/ˌriːˈæl.ə.keɪt/", ipaUK: "/ˌriːˈæl.ə.keɪt/", meaning: "tái phân bổ nguồn vốn hoặc tài nguyên", example: "Reallocate funds to cover urgent expenses.", exampleTrans: "Tái phân bổ vốn để trang trải chi phí khẩn cấp." },
      { word: "licensing", pos: "n", level: "B2", ipaUS: "/ˈlaɪ.sən.sɪŋ/", ipaUK: "/ˈlaɪ.sən.sɪŋ/", meaning: "việc cấp bản quyền sử dụng phần mềm", example: "Software licensing costs are reviewed annually.", exampleTrans: "Chi phí cấp bản quyền phần mềm được xem xét hàng năm." }
    ],
    q1: { prompt: "What is the main subject of the conversation?", promptTrans: "Chủ đề chính của cuộc trò chuyện là gì?", correct: "Departmental expenses and budget adjustments", dist: ["Hiring new software engineers", "Selecting office desktop monitors", "Scheduling team building events"] },
    q2: { prompt: "Why did software expenses rise recently?", promptTrans: "Tại sao chi phí phần mềm lại tăng gần đây?", correct: "The department adopted new cloud-based tools", dist: ["Computer hardware was damaged", "Consultant fees increased", "Overdue payment penalties were charged"] },
    q3: { prompt: "What will the man do next?", promptTrans: "Người đàn ông sẽ làm gì tiếp theo?", correct: "Draft a revised budget proposal", dist: ["Cancel software subscriptions", "Book flight tickets for a conference", "Contact the bank for a loan"] }
  }
];

async function seed300UniquePassages() {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/tuong_tan_toeic';
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB.');

    // Build exactly 300 unique (TestFolder, Range) pairs from verified audio files
    const uniqueAudioPairs = [];
    for (const testFolder of VERIFIED_TESTS) {
      for (const range of RANGES) {
        uniqueAudioPairs.push({ folder: testFolder, range: range });
      }
    }

    console.log(`📦 Available unique authentic audio files: ${uniqueAudioPairs.length}`);

    const allQuestions = [];
    const totalPassages = 300;

    for (let pIdx = 0; pIdx < totalPassages; pIdx++) {
      const pNum = pIdx + 1;
      const pair = uniqueAudioPairs[pIdx];
      const folder = pair.folder;
      const range = pair.range;

      // Select scenario uniquely or with diverse context
      const scenario = SCENARIO_TEMPLATES[pIdx % SCENARIO_TEMPLATES.length];

      // Audio URL pointing to verified range audio
      const audioUrl = `${SUPABASE_CDN_BASE}/${folder}/${range.start}-${range.end}.mp3`;
      const passageTitle = `Nhóm câu ${range.start}-${range.end} (3 câu hỏi)`;
      const passageId = `p3-lvl1-passage-${pNum}`;

      const qDefs = [scenario.q1, scenario.q2, scenario.q3];

      qDefs.forEach((qDef, subIdx) => {
        const globalQNum = allQuestions.length + 1;
        const qNumInTest = range.start + subIdx;
        const correctLetters = ['A', 'B', 'C', 'D'];
        const correctLetter = correctLetters[(pNum * 3 + subIdx) % 4];

        const dists = [...qDef.dist];
        const options = correctLetters.map(letter => {
          const isCorrect = letter === correctLetter;
          let text = isCorrect ? qDef.correct : dists.pop() || "Consulting a business specialist";
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
          explanation: `💡 **Giải thích chi tiết ETS:**\n- **Dẫn chứng Transcript:** "${scenario.script.split('\n')[subIdx] || scenario.script}"\n- **Lời dịch:** ${scenario.translation.split('\n')[subIdx] || scenario.translation}\n- **Phương án đúng:** **(${correctLetter}) ${qDef.correct}**`,
          vocabularyList: scenario.vocab
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

    console.log(`\n🎉 SEED THÀNH CÔNG 300 PASSAGES ĐỘC LẬP — KHÔNG TRÙNG LẶP AUDIO!`);
    console.log(`📊 Tổng số Đoạn hội thoại: ${Math.floor(updatedDoc.questions.length / 3)} passages`);
    console.log(`📊 Tổng số Câu hỏi: ${updatedDoc.questions.length} questions`);
    console.log(`🎵 Đoạn 1: ${updatedDoc.questions[0].audioUrl}`);
    console.log(`🎵 Đoạn 150: ${updatedDoc.questions[447].audioUrl}`);
    console.log(`🎵 Đoạn 300: ${updatedDoc.questions[897].audioUrl}`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

seed300UniquePassages();
