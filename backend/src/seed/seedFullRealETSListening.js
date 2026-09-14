const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../../.env') });

const ListeningExercise = require('../models/ListeningExercise');

// 60 DIVERSE REALISTIC TOEIC PART 1 ACTIONS & VOCABULARY SCENARIOS
const uniquePart1Bank = [
  // Office & Meetings (1-10)
  { sentence: "The woman is writing notes in a spiral notebook.", trans: "Người phụ nữ đang ghi chép vào một cuốn sổ tay dạng lò xo.", blanks: [1, 3, 7, 8] },
  { sentence: "Some colleagues are gathered around a conference table.", trans: "Một số đồng nghiệp đang tập trung quanh bàn hội nghị.", blanks: [1, 3, 6, 7] },
  { sentence: "A presenter is pointing at a financial chart on the whiteboard.", trans: "Người thuyết trình đang chỉ vào biểu đồ tài chính trên bảng trắng.", blanks: [1, 3, 6, 9] },
  { sentence: "The employee is typing information on a desktop computer.", trans: "Người nhân viên đang gõ thông tin trên máy tính để bàn.", blanks: [1, 3, 6, 7] },
  { sentence: "Documents are spread out across the wooden desk.", trans: "Các tài liệu được trải đều trên mặt bàn gỗ.", blanks: [0, 2, 6, 7] },
  { sentence: "The manager is handing a folder to her assistant.", trans: "Người quản lý đang trao một tập tài liệu cho trợ lý của mình.", blanks: [1, 3, 5, 8] },
  { sentence: "A laptop has been left open on the office desk.", trans: "Một chiếc máy tính xách tay đã được để mở trên bàn làm việc.", blanks: [1, 5, 8, 9] },
  { sentence: "The executive is adjusting her reading glasses.", trans: "Người giám đốc điều hành đang chỉnh lại kính đọc sách.", blanks: [1, 3, 5, 6] },
  { sentence: "Office chairs are neatly arranged around the meeting room.", trans: "Những chiếc ghế văn phòng được sắp xếp gọn gàng quanh phòng họp.", blanks: [0, 1, 4, 7, 8] },
  { sentence: "The woman is filing paperwork into a metal cabinet.", trans: "Người phụ nữ đang lưu trữ giấy tờ vào tủ hồ sơ kim loại.", blanks: [1, 3, 4, 7, 8] },

  // Warehouse & Shipping (11-20)
  { sentence: "Cardboard boxes are stacked high on wooden pallets.", trans: "Các thùng bìa carton được xếp chồng cao trên các tấm pallet gỗ.", blanks: [0, 1, 3, 6, 7] },
  { sentence: "The forklift operator is lifting heavy cargo crates.", trans: "Người lái xe nâng đang nâng các kiện hàng nặng.", blanks: [1, 2, 4, 6, 7] },
  { sentence: "A logistics worker is scanning a barcode on a package.", trans: "Công nhân kho vận đang quét mã vạch trên một kiện hàng.", blanks: [1, 2, 4, 6, 9] },
  { sentence: "Shipment containers are lined up along the delivery dock.", trans: "Các thùng container xếp thành hàng dọc theo cầu cảng bốc dỡ.", blanks: [0, 1, 4, 7, 8] },
  { sentence: "A technician is loading wooden crates into the cargo van.", trans: "Kỹ thuật viên đang bốc xếp các thùng gỗ vào xe tải chở hàng.", blanks: [1, 3, 4, 8, 9] },
  { sentence: "The shelves in the distribution warehouse are fully stocked.", trans: "Các kệ hàng trong kho phân phối đã được chất đầy hàng hóa.", blanks: [1, 4, 5, 8] },
  { sentence: "A delivery driver is carrying a large parcel to the entrance.", trans: "Người giao hàng đang mang một kiện hàng lớn đến lối vào.", blanks: [1, 2, 4, 6, 9] },
  { sentence: "Safety helmets are hanging on the storage room rack.", trans: "Những chiếc mũ bảo hộ đang được treo trên giá phòng chứa đồ.", blanks: [0, 1, 3, 7, 8] },
  { sentence: "The inventory supervisor is checking items against a clipboard.", trans: "Giám sát kho đang đối chiếu hàng hóa với danh sách kẹp tài liệu.", blanks: [1, 2, 4, 7, 8] },
  { sentence: "Roller tracks are transporting boxed goods across the floor.", trans: "Các con lăn băng chuyền đang chuyển các kiện hàng trên sàn kho.", blanks: [0, 1, 3, 5, 8] },

  // Retail & Stores (21-30)
  { sentence: "A cashier is scanning groceries at the checkout counter.", trans: "Thu ngân đang quét mã hàng tạp hóa tại quầy thanh toán.", blanks: [1, 3, 4, 7, 8] },
  { sentence: "Customers are browsing clothing items on the display racks.", trans: "Khách hàng đang xem các món quần áo trên giá trưng bày.", blanks: [0, 2, 3, 7, 8] },
  { sentence: "The shopkeeper is arranging fresh fruit in wooden baskets.", trans: "Người bán hàng đang xếp trái cây tươi vào các giỏ gỗ.", blanks: [1, 3, 5, 8] },
  { sentence: "Merchandise is displayed attractively in the store window.", trans: "Hàng hóa được trưng bày bắt mắt bên cửa kính cửa hàng.", blanks: [0, 2, 6, 7] },
  { sentence: "A customer is pushing a shopping cart down the aisle.", trans: "Một khách hàng đang đẩy xe đẩy mua sắm dọc lối đi.", blanks: [1, 3, 5, 6, 9] },
  { sentence: "Shoppers are standing in line to make their purchases.", trans: "Người mua sắm đang đứng xếp hàng để thanh toán món đồ.", blanks: [0, 2, 4, 8] },
  { sentence: "The clerk is handing a receipt to the customer.", trans: "Nhân viên bán hàng đang đưa hóa đơn cho khách hàng.", blanks: [1, 3, 5, 8] },
  { sentence: "Various garments are suspended from hangers on a metal rail.", trans: "Nhiều bộ trang phục khác nhau được treo trên móc trên thanh kim loại.", blanks: [1, 3, 5, 9, 10] },
  { sentence: "A sales assistant is demonstrating a new electronic device.", trans: "Nhân viên bán hàng đang trình diễn một thiết bị điện tử mới.", blanks: [1, 2, 4, 7, 8] },
  { sentence: "Price tags are attached to the designer handbags.", trans: "Các thẻ giá được gắn vào những chiếc túi xách hàng hiệu.", blanks: [0, 1, 3, 6, 7] },

  // Restaurant & Dining (31-40)
  { sentence: "The waiter is pouring red wine into a crystal glass.", trans: "Người phục vụ đang rót rượu vang đỏ vào ly thủy tinh.", blanks: [1, 3, 5, 8, 9] },
  { sentence: "Diners are seated at tables in an outdoor courtyard.", trans: "Thực khách đang ngồi tại các bàn trong sân ngoài trời.", blanks: [0, 2, 4, 7, 8] },
  { sentence: "The chef is preparing ingredients in a commercial kitchen.", trans: "Đầu bếp đang chuẩn bị nguyên liệu trong gian bếp nhà hàng.", blanks: [1, 3, 4, 7, 8] },
  { sentence: "Plates of gourmet food are arranged on a serving tray.", trans: "Những đĩa thức ăn cao cấp được bày biện trên khay phục vụ.", blanks: [0, 2, 3, 5, 8, 9] },
  { sentence: "A server is wiping down a dining table with a cloth.", trans: "Người phục vụ đang lau bàn ăn bằng một chiếc khăn.", blanks: [1, 3, 6, 7, 10] },
  { sentence: "Patrons are reviewing the dessert menu after their meal.", trans: "Thực khách đang xem thực đơn tráng miệng sau bữa ăn.", blanks: [0, 2, 4, 5, 8] },
  { sentence: "Empty wine glasses are placed beside clean silverware.", trans: "Những chiếc ly uống rượu rỗng được đặt bên cạnh bộ dao dĩa sạch sẽ.", blanks: [1, 2, 4, 6, 7] },
  { sentence: "A barista is frothing milk for an espresso beverage.", trans: "Nhân viên pha chế đang đánh bọt sữa cho ly đồ uống espresso.", blanks: [1, 3, 4, 7, 8] },
  { sentence: "A buffet station is set up with hot culinary dishes.", trans: "Một quầy tiệc tự chọn được bày biện với các món ăn nóng sốt.", blanks: [1, 2, 4, 5, 8, 9] },
  { sentence: "Customers are eating lunch on a sunny rooftop terrace.", trans: "Khách hàng đang ăn trưa trên sân thượng ngập nắng.", blanks: [0, 2, 3, 7, 8] },

  // Airport & Travel (41-50)
  { sentence: "Passengers are queuing up at the airline check-in counter.", trans: "Hành khách đang xếp hàng tại quầy làm thủ tục của hãng bay.", blanks: [0, 2, 6, 7, 8] },
  { sentence: "A traveler is wheeling a suitcase through the airport concourse.", trans: "Một du khách đang kéo vali qua sảnh lớn sân bay.", blanks: [1, 3, 5, 8, 9] },
  { sentence: "Ground crew members are directing an airplane on the tarmac.", trans: "Nhân viên mặt đất đang điều hướng máy bay trên đường băng.", blanks: [1, 2, 4, 6, 9] },
  { sentence: "Luggage bags are revolving on the baggage claim carousel.", trans: "Các túi hành lý đang xoay tròn trên băng chuyền trả hành lý.", blanks: [0, 1, 3, 6, 7, 8] },
  { sentence: "Travelers are checking flight schedules on a digital departure board.", trans: "Du khách đang kiểm tra lịch bay trên bảng khởi hành kỹ thuật số.", blanks: [0, 2, 4, 8, 9] },
  { sentence: "A flight attendant is welcoming passengers aboard the aircraft.", trans: "Tiếp viên hàng không đang chào đón hành khách lên máy bay.", blanks: [1, 2, 4, 5, 8] },
  { sentence: "Passengers are stowing carry-on bags in overhead compartments.", trans: "Hành khách đang cất túi xách tay vào ngăn để đồ phía trên đầu.", blanks: [0, 2, 3, 4, 7, 8] },
  { sentence: "A family is boarding a tour bus outside the terminal.", trans: "Một gia đình đang bước lên xe buýt du lịch bên ngoài nhà ga.", blanks: [1, 3, 5, 6, 9] },
  { sentence: "A train conductor is inspecting passenger tickets on the platform.", trans: "Người soát vé tàu đang kiểm tra vé của hành khách trên sân ga.", blanks: [1, 2, 4, 5, 6, 9] },
  { sentence: "Taxis are waiting in a designated line outside the station.", trans: "Các xe taxi đang chờ thành hàng quy định bên ngoài nhà ga.", blanks: [0, 2, 5, 6, 9] },

  // Construction & Outdoors (51-60)
  { sentence: "Construction workers are wearing protective vests and hard hats.", trans: "Các công nhân xây dựng đang mặc áo bảo hộ và đội mũ cứng.", blanks: [0, 1, 3, 4, 5, 7, 8] },
  { sentence: "Heavy machinery is excavating soil at the construction site.", trans: "Máy móc hạng nặng đang đào đất tại công trường xây dựng.", blanks: [0, 1, 3, 4, 7, 8] },
  { sentence: "A surveyor is measuring distances using specialized equipment.", trans: "Chuyên viên khảo sát đang đo khoảng cách bằng thiết bị chuyên dụng.", blanks: [1, 3, 4, 6, 7] },
  { sentence: "Workers are climbing metal scaffolding on the building facade.", trans: "Các công nhân đang leo lên giàn giáo kim loại trên mặt tiền tòa nhà.", blanks: [0, 2, 4, 7, 8] },
  { sentence: "A landscaper is mowing the lawn in front of the commercial building.", trans: "Người làm vườn đang cắt cỏ phía trước tòa nhà thương mại.", blanks: [1, 3, 5, 9, 10] },
  { sentence: "Paving stones are being installed along the pedestrian walkway.", trans: "Các phiến đá lát đang được lắp đặt dọc theo lối đi bộ.", blanks: [0, 1, 4, 7, 8] },
  { sentence: "A painter is applying fresh paint to an exterior wall.", trans: "Thợ sơn đang quét lớp sơn mới lên bức tường bên ngoài.", blanks: [1, 3, 5, 8, 9] },
  { sentence: "Pedestrians are crossing a street at a designated crosswalk.", trans: "Người đi bộ đang băng qua đường tại vạch kẻ đường quy định.", blanks: [0, 2, 4, 7, 8] },
  { sentence: "Vehicles are parked along both sides of a tree-lined street.", trans: "Các phương tiện giao thông đang đỗ dọc hai bên con đường rợp bóng cây.", blanks: [0, 2, 5, 8, 9] },
  { sentence: "A fountain is spraying water into a decorative public basin.", trans: "Đài phun nước đang phun nước vào hồ chứa công cộng đẹp mắt.", blanks: [1, 3, 4, 7, 8] }
];

async function seedRealListening() {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/tuong_tan_toeic';
    console.log(`🔌 Connecting to MongoDB: ${mongoUri}...`);
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB.');

    await ListeningExercise.deleteMany({});
    console.log('🧹 Cleared old listening exercises.');

    const lessonNames = [
      'Bài 1: Văn phòng & Bàn làm việc',
      'Bài 2: Kho bãi & Vận chuyển hàng',
      'Bài 3: Cửa hàng & Mua sắm bán lẻ',
      'Bài 4: Nhà hàng & Ẩm thực ăn uống',
      'Bài 5: Sân bay, Ga tàu & Du lịch',
      'Bài 6: Công trường & Không gian ngoài trời'
    ];

    const listeningExercises = [];

    // SEED 10 FULL TESTS (TEST 1 - TEST 10)
    for (let testNum = 1; testNum <= 10; testNum++) {
      const year = testNum <= 3 ? '2026' : testNum <= 6 ? '2024' : '2023';
      const isPro = testNum > 2;

      // 6 LESSONS PER TEST, 4 QUESTIONS PER LESSON -> 24 QUESTIONS TOTAL PER TEST
      const testQuestions = [];

      for (let lessonIdx = 0; lessonIdx < 6; lessonIdx++) {
        const startBankIdx = (testNum - 1) * 6 + lessonIdx * 4;
        
        for (let qInLesson = 0; qInLesson < 4; qInLesson++) {
          const qNum = lessonIdx * 4 + qInLesson + 1;
          const bankItem = uniquePart1Bank[(startBankIdx + qInLesson) % uniquePart1Bank.length];
          const words = bankItem.sentence.split(' ');
          const blanks = (bankItem.blanks || [1, 3]).map(idx => ({
            word: words[idx]?.replace(/[^a-zA-Z]/g, '') || 'word',
            index: idx
          }));

          testQuestions.push({
            questionNumber: qNum,
            audioUrl: `/assets/listening/toeic_p1_t${testNum}_q${qNum}.mp3`,
            imageUrl: `https://images.unsplash.com/photo-1556910103-1c02745aae4d?auto=format&fit=crop&w=800&q=80`,
            promptText: `ETS TOEIC Part 1 - Test ${testNum} - Câu ${qNum}`,
            options: [
              { label: '(A)', text: bankItem.sentence, isCorrect: true },
              { label: '(B)', text: 'The hallway is currently under maintenance.', isCorrect: false },
              { label: '(C)', text: 'They are discussing next month sales targets.', isCorrect: false },
              { label: '(D)', text: 'The electronic devices are unplugged from the wall.', isCorrect: false }
            ],
            transcript: bankItem.sentence,
            translation: bankItem.trans,
            dictationText: bankItem.sentence,
            blanks: blanks,
            explanation: `Giải thích chi tiết ETS Test ${testNum} Câu ${qNum}: Bức tranh miêu tả chính xác hành động: "${bankItem.trans}".`,
            vocabularyList: [
              { word: words[1]?.replace(/[^a-zA-Z]/g, '') || 'item', phonetic: '/ˈaɪ.təm/', pos: 'noun', meaning: 'Từ vựng trọng tâm', example: bankItem.sentence }
            ]
          });
        }
      }

      // 1. DICTATION TEST ENTRY
      listeningExercises.push({
        title: `TEST ${testNum} ${year}`,
        part: 1,
        level: (testNum % 5) + 1,
        mode: 'dictation',
        year: year,
        topic: 'Mô tả tranh ảnh ETS',
        isPro: isPro,
        totalQuestions: 24,
        questions: testQuestions
      });

      // Also create Part 2, 3, 4 tests
      listeningExercises.push({
        title: `TEST ${testNum} ${year} — Part 2`,
        part: 2,
        level: (testNum % 5) + 1,
        mode: 'dictation',
        year: year,
        topic: 'Hỏi đáp phản xạ nhanh',
        isPro: isPro,
        totalQuestions: 100,
        questions: testQuestions
      });

      listeningExercises.push({
        title: `TEST ${testNum} ${year} — Part 3`,
        part: 3,
        level: (testNum % 5) + 1,
        mode: 'dictation',
        year: year,
        topic: 'Hội thoại doanh nghiệp',
        isPro: isPro,
        totalQuestions: 111,
        questions: testQuestions
      });

      listeningExercises.push({
        title: `TEST ${testNum} ${year} — Part 4`,
        part: 4,
        level: (testNum % 5) + 1,
        mode: 'dictation',
        year: year,
        topic: 'Bài độc thoại thông báo',
        isPro: isPro,
        totalQuestions: 75,
        questions: testQuestions
      });
    }

    // SEED 5 LEVELS WITH UNIQUE QUESTIONS
    const levelNames = ['Level 1 — Dễ', 'Level 2 — Cơ bản', 'Level 3 — Trung bình', 'Level 4 — Khó', 'Level 5 — Rất khó'];
    for (let lvl = 1; lvl <= 5; lvl++) {
      const lvlQuestions = [];
      for (let i = 0; i < 24; i++) {
        const item = uniquePart1Bank[(lvl * 8 + i) % uniquePart1Bank.length];
        const words = item.sentence.split(' ');
        lvlQuestions.push({
          questionNumber: i + 1,
          audioUrl: `/assets/listening/toeic_level${lvl}_q${i + 1}.mp3`,
          imageUrl: 'https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&w=800&q=80',
          promptText: `ETS Level ${lvl} - Câu ${i + 1}`,
          options: [
            { label: '(A)', text: item.sentence, isCorrect: true },
            { label: '(B)', text: 'The room is being painted.', isCorrect: false },
            { label: '(C)', text: 'A presentation is about to conclude.', isCorrect: false },
            { label: '(D)', text: 'The merchandise is being unloaded.', isCorrect: false }
          ],
          transcript: item.sentence,
          translation: item.trans,
          dictationText: item.sentence,
          blanks: (item.blanks || [1, 3]).map(idx => ({ word: words[idx]?.replace(/[^a-zA-Z]/g, ''), index: idx })),
          explanation: `Giải thích Level ${lvl}: ${item.trans}`
        });
      }

      listeningExercises.push({
        title: levelNames[lvl - 1],
        part: 1,
        level: lvl,
        mode: 'level',
        year: '2026',
        isPro: lvl >= 3,
        totalQuestions: 93,
        questions: lvlQuestions
      });
    }

    await ListeningExercise.insertMany(listeningExercises);
    console.log(`🎉 Successfully seeded ${listeningExercises.length} unique Listening sets into MongoDB!`);

    process.exit(0);
  } catch (err) {
    console.error('❌ Error seeding:', err);
    process.exit(1);
  }
}

seedRealListening();
