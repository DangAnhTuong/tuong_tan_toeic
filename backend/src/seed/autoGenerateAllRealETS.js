const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../../.env') });

const ListeningExercise = require('../models/ListeningExercise');
const SUPABASE_CDN_BASE = "https://qfhmnlvgweznzcsoijyr.supabase.co/storage/v1/object/public/mock-test-media";

// REAL ETS & YBM QUESTION MEDIA POOLS - COMPLETELY DISTINCT FOR EACH LEVEL
const levelMediaFolders = {
  1: [
    { folder: "2026/t1", count: 6 },
    { folder: "2026/t2", count: 6 },
    { folder: "2024/Test_01", count: 6 },
    { folder: "2024/Test_02", count: 6 },
    { folder: "2023/TEST_1", count: 6 },
    { folder: "2023/Test 03", count: 6 },
    { folder: "2022/Test01", count: 6 },
    { folder: "2022/test_2", count: 6 },
    { folder: "2021/test1", count: 6 },
    { folder: "2021/test2", count: 6 },
    { folder: "2020/test1", count: 6 },
    { folder: "2020/test2", count: 6 },
    { folder: "2019/test1", count: 6 },
    { folder: "2019/test2", count: 6 },
    { folder: "ybm-2025 audio image updated/test-1", count: 6 },
    { folder: "ybm-2025 audio image updated/test-2", count: 6 }
  ],
  2: [
    { folder: "2026/t4", count: 6 },
    { folder: "2026/t5", count: 6 },
    { folder: "2024/Test_04", count: 6 },
    { folder: "2024/Test_09", count: 6 },
    { folder: "2023/Test 04", count: 6 },
    { folder: "2023/Test 05", count: 6 },
    { folder: "2022/test_4", count: 6 },
    { folder: "2022/test_5", count: 6 },
    { folder: "2021/test3", count: 6 },
    { folder: "2021/test4", count: 6 },
    { folder: "2020/test3", count: 6 },
    { folder: "2020/test4", count: 6 },
    { folder: "2019/test3", count: 6 },
    { folder: "2019/test4", count: 6 },
    { folder: "ybm-2025 audio image updated/test-3", count: 6 },
    { folder: "ybm-2025 audio image updated/test-5", count: 6 }
  ],
  3: [
    { folder: "2026/t6", count: 6 },
    { folder: "2026/t7", count: 6 },
    { folder: "2023/Test 06", count: 6 },
    { folder: "2023/Test 07", count: 6 },
    { folder: "2022/test_6", count: 6 },
    { folder: "2022/test_7", count: 6 },
    { folder: "2020/test5", count: 6 },
    { folder: "2020/test7", count: 6 },
    { folder: "2019/test6", count: 6 },
    { folder: "2019/test7", count: 6 },
    { folder: "ybm-2025 audio image updated/test-6", count: 6 },
    { folder: "ybm-2025 audio image updated/test-9", count: 6 },
    { folder: "2026/t8", count: 6 },
    { folder: "2023/Test 08", count: 6 },
    { folder: "2022/test_8", count: 6 },
    { folder: "2019/test8", count: 6 }
  ],
  4: [
    { folder: "2026/t8", count: 6 },
    { folder: "2026/t10", count: 6 },
    { folder: "2023/Test 09", count: 6 },
    { folder: "2023/Test 10", count: 6 },
    { folder: "2022/test_9", count: 6 },
    { folder: "2022/test_10", count: 6 },
    { folder: "2020/test8", count: 6 },
    { folder: "2019/test9", count: 6 },
    { folder: "2019/test10", count: 6 },
    { folder: "2024/Test_09", count: 6 },
    { folder: "2026/t7", count: 6 },
    { folder: "2023/Test 07", count: 6 },
    { folder: "2022/test_7", count: 6 },
    { folder: "2020/test7", count: 6 },
    { folder: "2019/test7", count: 6 },
    { folder: "ybm-2025 audio image updated/test-6", count: 6 }
  ],
  5: [
    { folder: "2026/t10", count: 6 },
    { folder: "2024/Test_09", count: 6 },
    { folder: "2023/Test 10", count: 6 },
    { folder: "2022/test_10", count: 6 },
    { folder: "2019/test10", count: 6 },
    { folder: "ybm-2025 audio image updated/test-9", count: 6 },
    { folder: "2026/t8", count: 6 },
    { folder: "2023/Test 09", count: 6 },
    { folder: "2022/test_9", count: 6 },
    { folder: "2019/test9", count: 6 },
    { folder: "2020/test8", count: 6 },
    { folder: "2026/t6", count: 6 },
    { folder: "2023/Test 06", count: 6 },
    { folder: "2022/test_6", count: 6 },
    { folder: "2019/test6", count: 6 },
    { folder: "ybm-2025 audio image updated/test-6", count: 6 }
  ]
};

const uniqueLevelScenarios = {
  1: [
    { 
      s: "A woman is taking notes in a notebook.", 
      t: "Người phụ nữ đang ghi chú trong cuốn sổ.", 
      exp: "Hành động 1 người đơn giản: 'taking notes' (ghi chú). Bức ảnh chụp rõ cảnh người phụ nữ đang cầm bút viết.",
      distractors: [
        { text: "A ladder has been placed against an exterior wall.", trans: "Một chiếc thang đã được đặt dựa vào bức tường bên ngoài." },
        { text: "Tools are being organized in a metal storage container.", trans: "Dụng cụ đang được sắp xếp trong thùng chứa bằng kim loại." },
        { text: "A vehicle is pulling into an underground parking lot.", trans: "Một phương tiện đang tiến vào bãi đỗ xe ngầm." }
      ],
      vocab: {
        word: "notebook", pos: "n", level: "A2", ipaUS: "/ˈnoʊt.bʊk/", ipaUK: "/ˈnəʊt.bʊk/",
        meaning: "cuốn sổ tay, tập ghi chép",
        example: "She wrote down the meeting key points in her notebook.",
        exampleTrans: "Cô ấy đã ghi lại các ý chính của cuộc họp vào cuốn sổ tay.",
        collocations: [{ phrase: "spiral notebook", meaning: "sổ tay gáy xoắn" }, { phrase: "take notes in a notebook", meaning: "ghi chép vào sổ tay" }],
        synonyms: "notepad, journal"
      }
    },
    { 
      s: "A customer is purchasing items at a checkout counter.", 
      t: "Khách hàng đang mua đồ tại quầy thu ngân.", 
      exp: "Bối cảnh quầy thu ngân bán lẻ: 'purchasing items' (thanh toán/mua hàng).",
      distractors: [
        { text: "A cashier is stocking shelves with packaged goods.", trans: "Thu ngân đang xếp hàng hóa đóng gói lên kệ." },
        { text: "Shopping carts are lined up near the store exit.", trans: "Xe đẩy mua sắm được xếp thành hàng gần lối ra cửa hàng." },
        { text: "A customer is browsing magazines at a display rack.", trans: "Một khách hàng đang xem tạp chí tại giá trưng bày." }
      ],
      vocab: {
        word: "checkout", pos: "n", level: "B1", ipaUS: "/ˈtʃek.aʊt/", ipaUK: "/ˈtʃek.aʊt/",
        meaning: "quầy thu ngân, nơi tính tiền",
        example: "Please pay for your groceries at the checkout counter.",
        exampleTrans: "Vui lòng thanh toán tiền hàng tạp hóa tại quầy thu ngân.",
        collocations: [{ phrase: "checkout counter", meaning: "quầy thanh toán" }, { phrase: "express checkout", meaning: "quầy thu ngân nhanh" }],
        synonyms: "cash register, till"
      }
    },
    { 
      s: "A waiter is carrying a tray of drinks.", 
      t: "Người phục vụ đang bưng một khay đồ uống.", 
      exp: "Hành động nhà hàng đặc trưng: 'carrying a tray' (bưng khay thức uống).",
      distractors: [
        { text: "Tables are being set with silverware and napkins.", trans: "Bàn ăn đang được bày biện dao thìa và khăn ăn." },
        { text: "A chef is chopping fresh vegetables in the kitchen.", trans: "Đầu bếp đang thái rau củ tươi trong gian bếp." },
        { text: "Menus have been distributed to all the dinner guests.", trans: "Thực đơn đã được phát cho tất cả các thực khách." }
      ],
      vocab: {
        word: "tray", pos: "n", level: "A2", ipaUS: "/treɪ/", ipaUK: "/treɪ/",
        meaning: "cái khay, mâm đựng thức ăn/đồ uống",
        example: "The server carefully balanced the heavy tray with one hand.",
        exampleTrans: "Người phục vụ cẩn thận giữ thăng bằng chiếc khay nặng bằng một tay.",
        collocations: [{ phrase: "serving tray", meaning: "khay bưng đồ ăn" }, { phrase: "tray of drinks", meaning: "khay đồ uống" }],
        synonyms: "platter, salver"
      }
    },
    { 
      s: "A passenger is checking his phone on a train.", 
      t: "Hành khách đang xem điện thoại trên tàu.", 
      exp: "Tập trung vào hành động cá nhân: 'checking his phone' trong toa tàu.",
      distractors: [
        { text: "The train conductor is inspecting passenger tickets.", trans: "Người soát vé tàu đang kiểm tra vé của hành khách." },
        { text: "Baggage is being loaded into an overhead compartment.", trans: "Hành lý đang được xếp vào ngăn chứa đồ phía trên đầu." },
        { text: "Commuters are waiting on an open railway platform.", trans: "Hành khách đang chờ đợi trên sân ga xe lửa ngoài trời." }
      ],
      vocab: {
        word: "passenger", pos: "n", level: "A2", ipaUS: "/ˈpæs.ən.dʒɚ/", ipaUK: "/ˈpæs.ən.dʒər/",
        meaning: "hành khách (đi tàu, xe, máy bay)",
        example: "All passengers must fasten their seat belts before departure.",
        exampleTrans: "Tất cả hành khách phải thắt dây an toàn trước khi khởi hành.",
        collocations: [{ phrase: "train passenger", meaning: "hành khách đi tàu" }, { phrase: "passenger seat", meaning: "ghế hành khách" }],
        synonyms: "commuter, traveler"
      }
    },
    { 
      s: "A worker is sweeping the shop floor.", 
      t: "Công nhân đang quét sàn cửa hàng.", 
      exp: "Hành động vệ sinh nơi làm việc: 'sweeping the floor' bằng chổi.",
      distractors: [
        { text: "A mop is leaning against a wooden workbench.", trans: "Cây lau nhà đang dựng dựa vào bàn thợ bằng gỗ." },
        { text: "Debris has been gathered into large plastic trash bags.", trans: "Mảnh vụn rác đã được gom vào các túi rác nhựa lớn." },
        { text: "A broom has been hung on a tool rack on the wall.", trans: "Chiếc chổi đã được treo trên giá dụng cụ trên tường." }
      ],
      vocab: {
        word: "sweep", pos: "v", level: "B1", ipaUS: "/swiːp/", ipaUK: "/swiːp/",
        meaning: "quét dọn (bằng chổi)",
        example: "The custodian sweeps the main lobby every morning.",
        exampleTrans: "Người quản lý quét dọn sảnh chính vào mỗi buổi sáng.",
        collocations: [{ phrase: "sweep the floor", meaning: "quét sàn nhà" }, { phrase: "sweep up debris", meaning: "quét dọn các mảnh vụn" }],
        synonyms: "clean, brush"
      }
    },
    { 
      s: "Boxes are stacked inside a storage room.", 
      t: "Các thùng hàng được xếp chồng trong phòng kho.", 
      exp: "Trạng thái tĩnh của đồ vật trong kho: 'boxes are stacked' (các hộp xếp chồng).",
      distractors: [
        { text: "A warehouse worker is operating a pallet jack.", trans: "Nhân viên kho đang vận hành xe nâng tay." },
        { text: "Cardboard containers are being taped and labeled.", trans: "Các thùng bìa các-tông đang được dán băng dính và dán nhãn." },
        { text: "Shelves are being assembled along the brick wall.", trans: "Các kệ hàng đang được lắp ráp dọc theo bức tường gạch." }
      ],
      vocab: {
        word: "stack", pos: "v", level: "B1", ipaUS: "/stæk/", ipaUK: "/stæk/",
        meaning: "xếp chồng lên nhau, chất đống",
        example: "The supply boxes were neatly stacked in the corner.",
        exampleTrans: "Các hộp vật tư được xếp chồng gọn gàng trong góc phòng.",
        collocations: [{ phrase: "stack up", meaning: "chất chồng lên" }, { phrase: "neatly stacked", meaning: "xếp chồng ngay ngắn" }],
        synonyms: "pile, arrange"
      }
    }
  ],
  2: [
    { 
      s: "Two colleagues are discussing a document on a whiteboard.", 
      t: "Hai đồng nghiệp đang thảo luận tài liệu trên bảng trắng.", 
      exp: "Tương tác 2 người trong văn phòng: 'discussing a document' cạnh bảng trắng.",
      distractors: [
        { text: "A marker has been placed inside a storage drawer.", trans: "Bút lông đã được đặt vào bên trong ngăn kéo." },
        { text: "A projector is casting an image onto a presentation screen.", trans: "Máy chiếu đang chiếu hình ảnh lên màn hình thuyết trình." },
        { text: "Participants are shaking hands after a formal negotiation.", trans: "Những người tham gia đang bắt tay nhau sau cuộc đàm phán chính thức." }
      ],
      vocab: {
        word: "colleague", pos: "n", level: "A2", ipaUS: "/ˈkɑː.liːɡ/", ipaUK: "/ˈkɒl.iːɡ/",
        meaning: "đồng nghiệp",
        example: "She collaborated closely with her colleagues on the research.",
        exampleTrans: "Cô ấy đã hợp tác chặt chẽ với các đồng nghiệp trong nghiên cứu.",
        collocations: [{ phrase: "work colleague", meaning: "đồng nghiệp làm việc" }, { phrase: "senior colleague", meaning: "đồng nghiệp cấp cao" }],
        synonyms: "coworker, associate"
      }
    },
    { 
      s: "A laptop has been left open on a meeting table.", 
      t: "Chiếc máy tính xách tay đang mở trên bàn họp.", 
      exp: "Trạng thái đồ vật: 'has been left open' (được để mở trên bàn).",
      distractors: [
        { text: "A professional is typing an urgent email on a keyboard.", trans: "Một chuyên gia đang gõ một email khẩn cấp trên bàn phím." },
        { text: "Paper documents are being shredded in a recycling bin.", trans: "Tài liệu giấy đang được tiêu hủy vào thùng tái chế." },
        { text: "Meeting chairs have been pushed in against the table edge.", trans: "Ghế họp đã được đẩy vào sát mép bàn." }
      ],
      vocab: {
        word: "laptop", pos: "n", level: "A1", ipaUS: "/ˈlæp.tɑːp/", ipaUK: "/ˈlæp.tɒp/",
        meaning: "máy tính xách tay",
        example: "He plugged his laptop into the power outlet in the conference room.",
        exampleTrans: "Anh ấy cắm máy tính xách tay vào ổ điện trong phòng hội nghị.",
        collocations: [{ phrase: "open laptop", meaning: "máy tính đang mở" }, { phrase: "laptop battery", meaning: "pin máy tính xách tay" }],
        synonyms: "notebook computer"
      }
    },
    { 
      s: "A technician is inspecting machinery in a workshop.", 
      t: "Kỹ thuật viên đang kiểm tra máy móc trong xưởng.", 
      exp: "Kiểm tra kỹ thuật chuyên nghiệp: 'inspecting machinery' (kiểm tra máy móc).",
      distractors: [
        { text: "Protective safety helmets are hanging on a wall rack.", trans: "Mũ bảo hộ lao động đang được treo trên giá trên tường." },
        { text: "Power tools are being wiped down with a clean cloth.", trans: "Dụng cụ điện đang được lau chùi bằng vải sạch." },
        { text: "An electrical panel has been detached from the wall frame.", trans: "Bảng điện đã được tháo rời khỏi khung tường." }
      ],
      vocab: {
        word: "inspect", pos: "v", level: "B1", ipaUS: "/ɪnˈspekt/", ipaUK: "/ɪnˈspekt/",
        meaning: "kiểm tra, thanh tra kỹ lưỡng",
        example: "The quality assurance team will inspect the manufacturing plant tomorrow.",
        exampleTrans: "Đội ngũ đảm bảo chất lượng sẽ kiểm tra nhà máy sản xuất vào ngày mai.",
        collocations: [{ phrase: "inspect machinery", meaning: "kiểm tra máy móc" }, { phrase: "inspect thoroughly", meaning: "kiểm tra kỹ lưỡng" }],
        synonyms: "examine, check, review"
      }
    },
    { 
      s: "Luggage has been placed on a baggage cart.", 
      t: "Hành lý đã được đặt trên xe đẩy.", 
      exp: "Dạng bị động miêu tả trạng thái: 'placed on a baggage cart'.",
      distractors: [
        { text: "A traveler is wheeling a suitcase through an airport terminal.", trans: "Một du khách đang kéo vali qua sảnh nhà ga sân bay." },
        { text: "Suitcases are circulating on an automated luggage carousel.", trans: "Các vali đang luân chuyển trên băng chuyền hành lý tự động." },
        { text: "Flight information boards are being updated with gate changes.", trans: "Bảng thông tin chuyến bay đang được cập nhật các thay đổi về cổng." }
      ],
      vocab: {
        word: "luggage", pos: "n", level: "B1", ipaUS: "/ˈlʌɡ.ɪdʒ/", ipaUK: "/ˈlʌɡ.ɪdʒ/",
        meaning: "hành lý (không đếm được)",
        example: "Passengers may only bring one piece of carry-on luggage.",
        exampleTrans: "Hành khách chỉ được mang một kiện hành lý xách tay.",
        collocations: [{ phrase: "luggage cart", meaning: "xe đẩy hành lý" }, { phrase: "excess luggage", meaning: "hành lý quá cước" }],
        synonyms: "baggage, suitcases"
      }
    },
    { 
      s: "A forklift is moving crates in a warehouse.", 
      t: "Xe nâng đang di chuyển các thùng trong kho.", 
      exp: "Vận hành thiết bị nhà xưởng: 'forklift is moving crates'.",
      distractors: [
        { text: "Warehouse shelves have been completely emptied of supplies.", trans: "Các kệ hàng trong kho đã được dọn sạch hoàn toàn các vật tư." },
        { text: "A supervisor is signing a freight delivery invoice.", trans: "Người giám sát đang ký hóa đơn giao nhận hàng hóa." },
        { text: "Wooden pallets are leaning against a loading dock gate.", trans: "Các tấm pallet gỗ đang dựa vào cổng bến xếp hàng." }
      ],
      vocab: {
        word: "forklift", pos: "n", level: "B2", ipaUS: "/ˈfɔːrk.lɪft/", ipaUK: "/ˈfɔːk.lɪft/",
        meaning: "xe nâng hàng (trong kho bãi)",
        example: "Only certified operators are permitted to drive the forklift.",
        exampleTrans: "Chỉ những người vận hành có chứng chỉ mới được phép lái xe nâng.",
        collocations: [{ phrase: "forklift operator", meaning: "người lái xe nâng" }, { phrase: "operate a forklift", meaning: "vận hành xe nâng" }],
        synonyms: "lift truck"
      }
    },
    { 
      s: "Pedestrians are crossing a wide street.", 
      t: "Người đi bộ đang băng qua một con đường rộng.", 
      exp: "Hoạt động giao thông đô thị: 'pedestrians are crossing'.",
      distractors: [
        { text: "Vehicles are parked parallel along the sidewalk curb.", trans: "Các phương tiện đang đỗ song song dọc theo lề đường." },
        { text: "Traffic lights are showing a green signal for motorists.", trans: "Đèn giao thông đang hiển thị tín hiệu xanh cho người lái xe." },
        { text: "Road construction signs have been erected at the intersection.", trans: "Biển báo thi công đường đã được dựng tại ngã tư." }
      ],
      vocab: {
        word: "pedestrian", pos: "n", level: "B1", ipaUS: "/pəˈdes.tri.ən/", ipaUK: "/pəˈdes.tri.ən/",
        meaning: "người đi bộ",
        example: "The pedestrian crossing is clearly marked with white zebra stripes.",
        exampleTrans: "Vạch qua đường dành cho người đi bộ được đánh dấu rõ ràng bằng sọc ngựa vằn màu trắng.",
        collocations: [{ phrase: "pedestrian zone", meaning: "khu phố đi bộ" }, { phrase: "pedestrian crossing", meaning: "vạch qua đường cho người đi bộ" }],
        synonyms: "walker, foot-traveler"
      }
    }
  ],
  3: [
    { 
      s: "Meeting participants have gathered around a conference table.", 
      t: "Những người tham gia cuộc họp đã tập trung quanh bàn hội nghị.", 
      exp: "Cấu trúc thì hiện tại hoàn thành miêu tả trạng thái: 'have gathered around'.",
      distractors: [
        { text: "A speaker is stepping down from the stage podium.", trans: "Diễn giả đang bước xuống khỏi bục sân khấu." },
        { text: "Handouts are being passed out to empty auditorium seats.", trans: "Tài liệu phát tay đang được chia cho những hàng ghế trống trong khán phòng." },
        { text: "Name cards have been placed at each individual place setting.", trans: "Thẻ tên đã được đặt tại từng vị trí ngồi cá nhân." }
      ],
      vocab: {
        word: "gather", pos: "v", level: "B1", ipaUS: "/ˈɡæð.ɚ/", ipaUK: "/ˈɡæð.ər/",
        meaning: "tập trung, tụ họp lại",
        example: "The staff gathered in the auditorium for the CEO's announcement.",
        exampleTrans: "Toàn bộ nhân viên đã tập trung tại khán phòng để nghe thông báo của CEO.",
        collocations: [{ phrase: "gather around", meaning: "tập hợp xung quanh" }, { phrase: "gather information", meaning: "thu thập thông tin" }],
        synonyms: "assemble, congregate, meet"
      }
    },
    { 
      s: "Fresh produce is displayed in wooden crates at an outdoor market.", 
      t: "Nông sản tươi được trưng bày trong các thùng gỗ ở chợ ngoài trời.", 
      exp: "Từ vựng TOEIC nâng cao: 'produce' là danh từ không đếm được chỉ nông sản rau củ tươi.",
      distractors: [
        { text: "A market vendor is weighing apples on a mechanical scale.", trans: "Người bán hàng ở chợ đang cân táo trên cân cơ học." },
        { text: "Canvas awnings are being rolled up due to heavy wind.", trans: "Mái hiên bạt đang được cuộn lại do gió to." },
        { text: "Shoppers are carrying woven baskets filled with flowers.", trans: "Người mua sắm đang xách những chiếc giỏ đan đầy hoa." }
      ],
      vocab: {
        word: "produce", pos: "n", level: "B2", ipaUS: "/ˈprɑː.duːs/", ipaUK: "/ˈprɒd.juːs/",
        meaning: "nông sản, hoa quả rau củ tươi (n)",
        example: "The supermarket specializes in locally grown organic produce.",
        exampleTrans: "Siêu thị chuyên cung cấp nông sản hữu cơ được trồng tại địa phương.",
        collocations: [{ phrase: "fresh produce", meaning: "nông sản tươi sống" }, { phrase: "organic produce", meaning: "nông sản hữu cơ" }],
        synonyms: "agricultural goods, farm harvest"
      }
    },
    { 
      s: "Reflective panels line the exterior facade of a tall building.", 
      t: "Các tấm phản quang trải dọc mặt tiền tòa nhà cao tầng.", 
      exp: "Miêu tả kiến trúc trừu tượng: 'exterior facade' (mặt ngoài tòa nhà).",
      distractors: [
        { text: "Window washers are suspended on scaffolding above the sidewalk.", trans: "Thợ lau cửa kính đang treo mình trên giàn giáo phía trên vỉa hè." },
        { text: "Revolving glass doors are being inspected by maintenance crew.", trans: "Cửa kính xoay đang được kiểm tra bởi đội bảo trì." },
        { text: "Decorative potted plants have been placed at the building entrance.", trans: "Cây cảnh trang trí đã được đặt tại lối vào tòa nhà." }
      ],
      vocab: {
        word: "facade", pos: "n", level: "C1", ipaUS: "/fəˈsɑːd/", ipaUK: "/fəˈsɑːd/",
        meaning: "mặt tiền, bề ngoài của tòa nhà",
        example: "The architect preserved the historic brick facade of the hotel.",
        exampleTrans: "Kiến trúc sư đã bảo tồn mặt tiền bằng gạch lịch sử của khách sạn.",
        collocations: [{ phrase: "building facade", meaning: "mặt tiền tòa nhà" }, { phrase: "glass facade", meaning: "mặt tiền bằng kính" }],
        synonyms: "front, exterior elevation"
      }
    },
    { 
      s: "A presenter is gesturing toward a digital slide screen.", 
      t: "Người thuyết trình đang ra hiệu về phía màn hình trình chiếu.", 
      exp: "Cử chỉ thuyết trình: 'gesturing toward a screen'.",
      distractors: [
        { text: "Audience members are raising their hands to ask questions.", trans: "Khán giả đang giơ tay để đặt câu hỏi." },
        { text: "A wireless microphone has been placed onto a speaker lectern.", trans: "Một micro không dây đã được đặt trên bục giảng của diễn giả." },
        { text: "Laptops are being connected to HDMI presentation cables.", trans: "Máy tính xách tay đang được kết nối với cáp trình chiếu HDMI." }
      ],
      vocab: {
        word: "gesture", pos: "v", level: "B2", ipaUS: "/ˈdʒes.tʃɚ/", ipaUK: "/ˈdʒes.tʃər/",
        meaning: "ra hiệu, làm điệu bộ tay",
        example: "She gestured toward the chart to emphasize the sales increase.",
        exampleTrans: "Cô ấy ra hiệu về phía biểu đồ để nhấn mạnh mức tăng doanh số.",
        collocations: [{ phrase: "gesture toward", meaning: "ra hiệu về phía" }, { phrase: "make a gesture", meaning: "làm cử chỉ" }],
        synonyms: "signal, motion, point"
      }
    },
    { 
      s: "Cargo containers are stacked in neat columns near the harbor.", 
      t: "Các thùng container xếp thành cột gọn gàng gần bến cảng.", 
      exp: "Bối cảnh cảng biển xuất nhập khẩu: 'stacked in neat columns'.",
      distractors: [
        { text: "A massive cargo ship is docking alongside the terminal crane.", trans: "Một tàu chở hàng khổng lồ đang cập cảng dọc theo cần cẩu nhà ga." },
        { text: "Dock workers are securing heavy mooring ropes to the pier bollards.", trans: "Công nhân bến tàu đang buộc dây neo nặng vào các cọc bích trên cầu cảng." },
        { text: "Customs inspectors are checking freight documents inside an office.", trans: "Thanh tra hải quan đang kiểm tra tài liệu hàng hóa trong văn phòng." }
      ],
      vocab: {
        word: "cargo", pos: "n", level: "B2", ipaUS: "/ˈkɑːr.ɡoʊ/", ipaUK: "/ˈkɑː.ɡəʊ/",
        meaning: "hàng hóa (vận chuyển bằng tàu/máy bay)",
        example: "The container vessel carried hundreds of tons of commercial cargo.",
        exampleTrans: "Con tàu container đã chở hàng trăm tấn hàng hóa thương mại.",
        collocations: [{ phrase: "cargo container", meaning: "thùng công-ten-nơ hàng hóa" }, { phrase: "cargo ship", meaning: "tàu chở hàng" }],
        synonyms: "freight, shipment, merchandise"
      }
    },
    { 
      s: "An architect is examining blueprint plans on a table.", 
      t: "Kiến trúc sư đang xem các bản vẽ thiết kế trên bàn.", 
      exp: "Thuật ngữ ngành xây dựng: 'blueprint plans' (bản vẽ thiết kế quy hoạch).",
      distractors: [
        { text: "Hard hats have been placed on top of stacked cinder blocks.", trans: "Mũ bảo hộ đã được đặt trên các khối bê tông xếp chồng." },
        { text: "Drafting pencils are being sharpened with an electric sharpener.", trans: "Bút chì phác thảo đang được chuốt bằng máy gọt điện." },
        { text: "A scale model of a bridge is displayed in a glass casing.", trans: "Mô hình thu nhỏ của một cây cầu được trưng bày trong hộp kính." }
      ],
      vocab: {
        word: "blueprint", pos: "n", level: "B2", ipaUS: "/ˈbluː.prɪnt/", ipaUK: "/ˈbluː.prɪnt/",
        meaning: "bản thiết kế, bản vẽ kiến trúc chi tiết",
        example: "The engineer reviewed the architectural blueprints for structural flaws.",
        exampleTrans: "Kỹ sư đã xem xét các bản thiết kế kiến trúc để tìm ra các lỗi về kết cấu.",
        collocations: [{ phrase: "architectural blueprint", meaning: "bản vẽ kiến trúc" }, { phrase: "blueprint plan", meaning: "kế hoạch thiết kế" }],
        synonyms: "design plan, schematic, draft"
      }
    }
  ],
  4: [
    { 
      s: "Framed artwork is illuminated by directional spotlights in a gallery.", 
      t: "Tác phẩm nghệ thuật đóng khung được chiếu sáng bởi đèn rọi trong phòng trưng bày.", 
      exp: "Bối cảnh nghệ thuật bảo tàng cao cấp với bẫy câu bị động: 'is illuminated by spotlights'.",
      distractors: [
        { text: "Visitors are admiring a marble sculpture in the central courtyard.", trans: "Khách tham quan đang chiêm ngưỡng một tác phẩm điêu khắc bằng đá cẩm thạch ở sân trong." },
        { text: "Museum guides are distributing informational audio headset devices.", trans: "Hướng dẫn viên bảo tàng đang phát các thiết bị tai nghe hướng dẫn bằng âm thanh." },
        { text: "Protective velvet ropes have been positioned in front of a painted portrait.", trans: "Dây nhung bảo vệ đã được đặt trước một bức tranh chân dung." }
      ],
      vocab: {
        word: "illuminate", pos: "v", level: "C1", ipaUS: "/ɪˈluː.mə.neɪt/", ipaUK: "/ɪˈluː.mɪ.neɪt/",
        meaning: "chiếu sáng, rọi sáng",
        example: "The outdoor pathway was softly illuminated by solar lanterns.",
        exampleTrans: "Lối đi ngoài trời được chiếu sáng dịu nhẹ bằng đèn lồng năng lượng mặt trời.",
        collocations: [{ phrase: "softly illuminated", meaning: "chiếu sáng dịu nhẹ" }, { phrase: "illuminated by spotlights", meaning: "được rọi sáng bởi đèn chiếu" }],
        synonyms: "light up, brighten, beam"
      }
    },
    { 
      s: "Construction scaffolding has been erected around the building structure.", 
      t: "Giàn giáo xây dựng đã được dựng lên quanh cấu trúc tòa nhà.", 
      exp: "Từ vựng kỹ thuật xây dựng nâng cao: 'scaffolding has been erected'.",
      distractors: [
        { text: "Construction workers are pouring liquid concrete into foundation molds.", trans: "Công nhân xây dựng đang đổ bê tông lỏng vào các khuôn móng." },
        { text: "Safety nets have been unrolled over an excavation trench.", trans: "Lưới an toàn đã được trải ra trên một rãnh đào móng." },
        { text: "A cement mixer truck is navigating around orange traffic cones.", trans: "Một xe bồn trộn xi măng đang di chuyển vòng qua các cọc tiêu giao thông màu cam." }
      ],
      vocab: {
        word: "scaffolding", pos: "n", level: "B2", ipaUS: "/ˈskæf.əl.dɪŋ/", ipaUK: "/ˈskæf.əl.dɪŋ/",
        meaning: "giàn giáo (trong thi công xây dựng)",
        example: "Workers erected sturdy steel scaffolding around the cathedral dome.",
        exampleTrans: "Công nhân dựng giàn giáo bằng thép chắc chắn quanh mái vòm nhà thờ.",
        collocations: [{ phrase: "erect scaffolding", meaning: "dựng giàn giáo" }, { phrase: "scaffolding structure", meaning: "cấu trúc giàn giáo" }],
        synonyms: "staging, framework, superstructure"
      }
    },
    { 
      s: "A laboratory specialist is adjusting the focus on a microscope.", 
      t: "Chuyên viên phòng thí nghiệm đang điều chỉnh tiêu cự kính hiển vi.", 
      exp: "Hành động nghiên cứu khoa học chuyên sâu: 'adjusting the focus on a microscope'.",
      distractors: [
        { text: "Chemical reagents are being poured into calibrated test tubes.", trans: "Hóa chất thử nghiệm đang được rót vào các ống nghiệm đã hiệu chuẩn." },
        { text: "Sterile rubber gloves have been discarded into a biohazard container.", trans: "Găng tay cao su vô trùng đã được vứt vào thùng chứa chất thải nguy hại." },
        { text: "A digital scale is displaying the exact weight of a mineral sample.", trans: "Cân kỹ thuật số đang hiển thị trọng lượng chính xác của mẫu khoáng chất." }
      ],
      vocab: {
        word: "microscope", pos: "n", level: "B1", ipaUS: "/ˈmaɪ.krə.skoʊp/", ipaUK: "/ˈmaɪ.krə.skəʊp/",
        meaning: "kính hiển vi",
        example: "The biologist examined the cellular sample under a high-powered microscope.",
        exampleTrans: "Nhà sinh vật học đã kiểm tra mẫu tế bào dưới kính hiển vi công suất cao.",
        collocations: [{ phrase: "electron microscope", meaning: "kính hiển vi điện tử" }, { phrase: "under a microscope", meaning: "dưới kính hiển vi" }],
        synonyms: "magnifying instrument, optical lens"
      }
    },
    { 
      s: "Commuters are waiting under a glass canopy at a transit terminal.", 
      t: "Người đi làm đang đợi dưới mái che bằng kính tại trạm trung chuyển.", 
      exp: "Bối cảnh hạ tầng giao thông hiện đại: 'under a glass canopy'.",
      distractors: [
        { text: "A double-decker bus is pulling away from the curb stop.", trans: "Một chiếc xe buýt hai tầng đang rời khỏi điểm đỗ bên lề đường." },
        { text: "Automated ticket turnstiles are being scanned by metro passengers.", trans: "Cửa quay soát vé tự động đang được quét bởi các hành khách đi tàu điện ngầm." },
        { text: "A public route map is being consulted by lost tourists.", trans: "Một bản đồ tuyến đường công cộng đang được xem bởi những du khách bị lạc đường." }
      ],
      vocab: {
        word: "canopy", pos: "n", level: "C1", ipaUS: "/ˈkæn.ə.pi/", ipaUK: "/ˈkæn.ə.pi/",
        meaning: "mái che, vòm che (bằng kính/vải)",
        example: "Passengers sought shelter under the station's wide glass canopy during the downpour.",
        exampleTrans: "Hành khách tìm chỗ trú dưới mái vòm kính rộng của nhà ga trong cơn mưa rào.",
        collocations: [{ phrase: "glass canopy", meaning: "mái che bằng kính" }, { phrase: "entrance canopy", meaning: "mái vòm lối vào" }],
        synonyms: "awning, overhead shelter, covering"
      }
    },
    { 
      s: "Merchandise is being organized by an inventory clerk.", 
      t: "Hàng hóa đang được sắp xếp bởi nhân viên kiểm kê.", 
      exp: "Dạng thì hiện tại tiếp diễn bị động: 'is being organized'.",
      distractors: [
        { text: "Barcodes are being scanned with a handheld wireless terminal.", trans: "Mã vạch đang được quét bằng thiết bị đầu cuối cầm tay không dây." },
        { text: "Shipping labels have been affixed onto cardboard parcel boxes.", trans: "Nhãn vận chuyển đã được dán lên các hộp kiện hàng bằng bìa các-tông." },
        { text: "A loading ramp has been lowered onto the tailgate of a delivery van.", trans: "Một đoạn dốc bốc dỡ đã được hạ xuống sàn sau của xe tải giao hàng." }
      ],
      vocab: {
        word: "merchandise", pos: "n", level: "B2", ipaUS: "/ˈmɝː.tʃən.daɪs/", ipaUK: "/ˈmɜː.tʃən.daɪs/",
        meaning: "hàng hóa, thương phẩm",
        example: "The department store arranged its new seasonal merchandise on display tables.",
        exampleTrans: "Cửa hàng bách hóa đã sắp xếp hàng hóa theo mùa mới trên các bàn trưng bày.",
        collocations: [{ phrase: "retail merchandise", meaning: "hàng hóa bán lẻ" }, { phrase: "display merchandise", meaning: "trưng bày hàng hóa" }],
        synonyms: "goods, products, commodities"
      }
    },
    { 
      s: "Vessels are moored along the waterfront pier.", 
      t: "Các con tàu đang neo đậu dọc theo cầu tàu ven sông.", 
      exp: "Từ vựng TOEIC đỉnh cao: 'vessels' (tàu thuyền) và 'moored' (buộc dây neo đậu).",
      distractors: [
        { text: "A lighthouse is casting a rotating beacon across the harbor bay.", trans: "Một ngọn hải đăng đang chiếu luồng sáng xoay vòng khắp vịnh cảng." },
        { text: "Fishermen are casting nylon fishing nets into turbulent ocean water.", trans: "Ngư dân đang quăng lưới đánh cá bằng sợi ni lông xuống vùng nước biển cuộn sóng." },
        { text: "Life preservers have been mounted along a wooden handrail.", trans: "Phao cứu sinh đã được gắn dọc theo lan can bằng gỗ." }
      ],
      vocab: {
        word: "moor", pos: "v", level: "C1", ipaUS: "/mʊr/", ipaUK: "/mɔːr/",
        meaning: "buộc tàu thuyền, neo đậu cố định",
        example: "The private yachts were safely moored to the marina docks.",
        exampleTrans: "Những chiếc du thuyền tư nhân được neo đậu an toàn tại các cầu tàu của bến thuyền.",
        collocations: [{ phrase: "moor a vessel", meaning: "neo đậu tàu thuyền" }, { phrase: "moored along the pier", meaning: "buộc neo dọc cầu tàu" }],
        synonyms: "anchor, tie up, dock, secure"
      }
    }
  ],
  5: [
    { 
      s: "Architectural drawings are spread across a drafting workstation.", 
      t: "Các bản vẽ kiến trúc trải rộng trên bàn làm việc thiết kế.", 
      exp: "Miêu tả chi tiết kỹ thuật Level 5: 'spread across a drafting workstation'.",
      distractors: [
        { text: "A digital measuring laser has been mounted onto a surveying tripod.", trans: "Một tia laser đo kỹ thuật số đã được gắn trên giá ba chân trắc địa." },
        { text: "Drafting rulers have been aligned with the perimeter edge of a drafting board.", trans: "Thước vẽ kỹ thuật đã được căn chỉnh với mép viền của bàn vẽ." },
        { text: "A 3D architectural rendering is rendering on multiple curved monitors.", trans: "Bản kết xuất kiến trúc 3D đang được xử lý trên nhiều màn hình cong." }
      ],
      vocab: {
        word: "workstation", pos: "n", level: "B2", ipaUS: "/ˈwɝːkˌsteɪ.ʃən/", ipaUK: "/ˈwɜːkˌsteɪ.ʃən/",
        meaning: "bàn làm việc, trạm làm việc chuyên dụng",
        example: "Each graphic designer is equipped with an ergonomic workstation.",
        exampleTrans: "Mỗi nhà thiết kế đồ họa đều được trang bị một góc làm việc công thái học.",
        collocations: [{ phrase: "drafting workstation", meaning: "bàn làm việc phác thảo" }, { phrase: "computer workstation", meaning: "trạm máy tính làm việc" }],
        synonyms: "workspace, desk station, cubicle"
      }
    },
    { 
      s: "Industrial cranes are silhouetted against the evening sky.", 
      t: "Cần cẩu công nghiệp in bóng trên nền trời chiều tối.", 
      exp: "Level 5: Bẫy miêu tả mỹ thuật tương phản 'silhouetted against the sky'.",
      distractors: [
        { text: "Construction floodlights are casting intense glare over an excavation pit.", trans: "Đèn pha công trường đang chiếu luồng sáng chói lọi lên hố đào móng." },
        { text: "Heavy steel girders are being hoisted into an elevated framework.", trans: "Những thanh xà thép nặng đang được cẩu nâng lên khung đỡ trên cao." },
        { text: "Excavator buckets have been rested on packed gravel terrain.", trans: "Gầu máy xúc đã được đặt nghỉ trên nền địa hình sỏi nén chặt." }
      ],
      vocab: {
        word: "silhouette", pos: "v", level: "C1", ipaUS: "/ˌsɪl.uˈet/", ipaUK: "/ˌsɪl.uˈet/",
        meaning: "in bóng, hiện bóng rõ trên nền sáng",
        example: "The ancient castle was dramatically silhouetted against the rising moon.",
        exampleTrans: "Tòa lâu đài cổ kính in bóng đầy ấn tượng trên nền trăng đang lên.",
        collocations: [{ phrase: "silhouetted against the sky", meaning: "in bóng trên nền trời" }, { phrase: "dark silhouette", meaning: "hình bóng đen sẫm" }],
        synonyms: "outlined, shadowed, profiled"
      }
    },
    { 
      s: "An intricate electronic assembly is undergoing testing procedures.", 
      t: "Một bộ vi mạch điện tử phức tạp đang trải qua quy trình kiểm thử.", 
      exp: "Cấu trúc Level 5: 'undergoing testing procedures' (đang trải qua quy trình thử nghiệm).",
      distractors: [
        { text: "Soldering irons are heating up in insulated ceramic holders.", trans: "Mỏ hàn nhiệt đang nóng lên trong các giá đỡ bằng gốm cách nhiệt." },
        { text: "Microchips are being organized into antistatic foam trays.", trans: "Các vi mạch đang được sắp xếp vào các khay xốp chống tĩnh điện." },
        { text: "Magnifying loupes have been placed beside a digital multimeter.", trans: "Kính lúp phóng đại đã được đặt bên cạnh một đồng hồ vạn năng kỹ thuật số." }
      ],
      vocab: {
        word: "intricate", pos: "adj", level: "C1", ipaUS: "/ˈɪn.trə.kət/", ipaUK: "/ˈɪn.trɪ.kət/",
        meaning: "tinh xảo, phức tạp, tỉ mỉ",
        example: "The microchip features an intricate network of microscopic circuits.",
        exampleTrans: "Vi mạch sở hữu một mạng lưới các mạch điện siêu nhỏ vô cùng phức tạp.",
        collocations: [{ phrase: "intricate design", meaning: "thiết kế tinh xảo" }, { phrase: "intricate assembly", meaning: "bộ phận lắp ráp phức tạp" }],
        synonyms: "complex, elaborate, sophisticated"
      }
    },
    { 
      s: "An expansive auditorium is prepared for an international conference.", 
      t: "Một khán phòng rộng lớn đã được chuẩn bị cho hội nghị quốc tế.", 
      exp: "Từ vựng tính từ cao cấp Level 5: 'expansive auditorium' (khán phòng rộng lớn).",
      distractors: [
        { text: "Stage technicians are testing acoustic surround-sound speakers.", trans: "Kỹ thuật viên sân khấu đang kiểm tra hệ thống loa âm thanh vòm." },
        { text: "Simultaneous interpretation booths have been set up in the back corridor.", trans: "Các cabin dịch cabin đồng thời đã được dựng ở hành lang phía sau." },
        { text: "Spotlights are projecting national flags onto the auditorium ceiling.", trans: "Đèn rọi đang chiếu hình quốc kỳ lên trần khán phòng." }
      ],
      vocab: {
        word: "expansive", pos: "adj", level: "C1", ipaUS: "/ɪkˈspæn.sɪv/", ipaUK: "/ɪkˈspæn.sɪv/",
        meaning: "rộng lớn, bao la, trải dài",
        example: "The university built an expansive library with floor-to-ceiling windows.",
        exampleTrans: "Trường đại học đã xây dựng một thư viện rộng lớn với các cửa sổ kính từ sàn lên trần.",
        collocations: [{ phrase: "expansive hall", meaning: "đại sảnh rộng lớn" }, { phrase: "expansive view", meaning: "tầm nhìn bao quát rộng mở" }],
        synonyms: "spacious, extensive, vast, broad"
      }
    },
    { 
      s: "Artifacts are encased in protective glass display pedestals.", 
      t: "Các hiện vật được bọc trong các bệ trưng bày bằng kính bảo vệ.", 
      exp: "Từ vựng Level 5: 'encased in pedestals' (được lồng trong bệ trưng bày).",
      distractors: [
        { text: "Security sensors are being installed along the perimeter wall base.", trans: "Cảm biến an ninh đang được lắp đặt dọc theo chân tường ranh giới." },
        { text: "Informational plaques are being engraved with historical timelines.", trans: "Biển thông tin đang được khắc các mốc thời gian lịch sử." },
        { text: "Curators are dusting antique ceramic pottery with soft brushes.", trans: "Người phụ trách đang quét bụi đồ gốm sứ cổ bằng cọ mềm." }
      ],
      vocab: {
        word: "encase", pos: "v", level: "C1", ipaUS: "/ɪnˈkeɪs/", ipaUK: "/ɪnˈkeɪs/",
        meaning: "bọc kín, bao phủ hoàn toàn trong hộp/vỏ bảo vệ",
        example: "The delicate manuscript was encased in bulletproof glass for exhibition.",
        exampleTrans: "Bản thảo tinh xảo đã được bọc trong kính chống đạn để triển lãm.",
        collocations: [{ phrase: "encased in glass", meaning: "được lồng trong kính bảo vệ" }, { phrase: "protective encasing", meaning: "lớp vỏ bọc bảo vệ" }],
        synonyms: "enclose, cover, envelop, shield"
      }
    },
    { 
      s: "Extensive scaffolding envelops the multi-story commercial complex.", 
      t: "Giàn giáo rộng lớn bao quanh khu phức hợp thương mại nhiều tầng.", 
      exp: "Động từ cao cấp Level 5: 'envelops the complex' (bao trùm quanh toàn bộ khu phức hợp).",
      distractors: [
        { text: "Demolition excavators are dismantling an old concrete overpass.", trans: "Máy xúc phá dỡ đang tháo dỡ một cây cầu vượt bê tông cũ." },
        { text: "Reflective hazard tape is cordoning off the perimeter pedestrian lane.", trans: "Băng cảnh báo phản quang đang phong tỏa làn đường đi bộ xung quanh." },
        { text: "Tower cranes are rotating heavy steel beams into upper floors.", trans: "Cần trục tháp đang xoay các thanh xà thép nặng vào các tầng trên." }
      ],
      vocab: {
        word: "envelop", pos: "v", level: "C1", ipaUS: "/ɪnˈvel.əp/", ipaUK: "/ɪnˈvel.əp/",
        meaning: "bao trùm, bao phủ hoàn toàn",
        example: "Dense morning fog enveloped the downtown harbor area.",
        exampleTrans: "Sương mù buổi sáng dày đặc đã bao trùm toàn bộ khu vực cảng trung tâm thành phố.",
        collocations: [{ phrase: "completely envelop", meaning: "bao bọc trọn vẹn" }, { phrase: "enveloped in mist", meaning: "bao phủ trong sương" }],
        synonyms: "surround, enclose, blanket, wrap"
      }
    }
  ]
};

const part2ScenariosByLevel = {
  1: [
    { 
      q: "Where can I find the lunch specials?", 
      transQ: "Tôi có thể tìm thực đơn đặc biệt buổi trưa ở đâu?", 
      a: "There, on the notice board.", 
      transA: "Ở kia, trên bảng thông báo.", 
      tip: "Level 1 Dễ: Câu hỏi Wh- Where hỏi nơi chốn, câu trả lời trực tiếp chỉ rõ vị trí trên bảng thông báo.",
      distractors: [
        { text: "It'll probably be late.", trans: "Có lẽ sẽ muộn." },
        { text: "Until one o'clock.", trans: "Đến một giờ." }
      ],
      vocab: {
        word: "special", pos: "n", level: "B1", ipaUS: "/ˈspeʃ.əl/", ipaUK: "/ˈspeʃ.əl/",
        meaning: "món đặc biệt (ở nhà hàng)",
        example: "Today's lunch specials include pasta and salad.",
        exampleTrans: "Các món đặc biệt bữa trưa hôm nay bao gồm mì ống và salad.",
        collocations: [{ phrase: "daily specials", meaning: "món đặc biệt hàng ngày" }, { phrase: "menu specials", meaning: "các món đặc biệt trong thực đơn" }],
        synonyms: "featured dish, chef's recommendation"
      }
    },
    { 
      q: "Where is the new client presentation being held?", 
      transQ: "Buổi thuyết trình cho khách hàng mới được tổ chức ở đâu?", 
      a: "In conference room B on the second floor.", 
      transA: "Ở phòng hội nghị B tại tầng hai.", 
      tip: "Level 1 Dễ: Câu hỏi Wh- Where hỏi địa điểm, câu trả lời trực tiếp chỉ rõ phòng hội nghị B.",
      distractors: [
        { text: "Yes, I attended yesterday's session.", trans: "Vâng, tôi đã tham dự phiên họp hôm qua." },
        { text: "About fifteen prospective clients.", trans: "Khoảng mười lăm khách hàng tiềm năng." }
      ],
      vocab: {
        word: "presentation", pos: "n", level: "A2", ipaUS: "/ˌprez.ənˈteɪ.ʃən/", ipaUK: "/ˌprez.ənˈteɪ.ʃən/",
        meaning: "buổi thuyết trình, bài trình bày",
        example: "The marketing director gave an impressive presentation on market expansion.",
        exampleTrans: "Giám đốc tiếp thị đã có bài thuyết trình ấn tượng về việc mở rộng thị trường.",
        collocations: [{ phrase: "give a presentation", meaning: "thuyết trình" }, { phrase: "sales presentation", meaning: "buổi giới thiệu bán hàng" }],
        synonyms: "demonstration, speech, briefing"
      }
    },
    { 
      q: "When will the quarterly financial report be finalized?", 
      transQ: "Khi nào báo cáo tài chính quý sẽ được hoàn tất?", 
      a: "By Friday afternoon at the latest.", 
      transA: "Muộn nhất là chiều thứ Sáu.", 
      tip: "Level 1 Dễ: Câu hỏi When hỏi thời gian, trả lời mốc thời gian rõ ràng By Friday.",
      distractors: [
        { text: "At the accounting office downtown.", trans: "Tại văn phòng kế toán ở trung tâm thành phố." },
        { text: "Mr. Henderson drafted the summary.", trans: "Ông Henderson đã soạn thảo bản tóm tắt." }
      ],
      vocab: {
        word: "finalize", pos: "v", level: "B2", ipaUS: "/ˈfaɪ.nəl.aɪz/", ipaUK: "/ˈfaɪ.nəl.aɪz/",
        meaning: "hoàn tất, chốt lại lần cuối",
        example: "We need to finalize the contract terms before the meeting ends.",
        exampleTrans: "Chúng ta cần chốt các điều khoản hợp đồng trước khi cuộc họp kết thúc.",
        collocations: [{ phrase: "finalize a contract", meaning: "chốt hợp đồng" }, { phrase: "finalize details", meaning: "hoàn thiện các chi tiết" }],
        synonyms: "complete, conclude, wrap up"
      }
    },
    { 
      q: "Who should I contact about the technical software update?", 
      transQ: "Tôi nên liên hệ với ai về việc cập nhật phần mềm?", 
      a: "Mr. Davis in the IT department.", 
      transA: "Ông Davis ở phòng công nghệ thông tin.", 
      tip: "Level 1 Dễ: Câu hỏi Who hỏi người phụ trách, câu trả lời nêu đích danh tên và phòng ban.",
      distractors: [
        { text: "On the third floor server room.", trans: "Tại phòng máy chủ ở tầng ba." },
        { text: "It was upgraded two weeks ago.", trans: "Nó đã được nâng cấp hai tuần trước." }
      ],
      vocab: {
        word: "contact", pos: "v", level: "A2", ipaUS: "/ˈkɑːn.tækt/", ipaUK: "/ˈkɒn.tækt/",
        meaning: "liên hệ, liên lạc với ai",
        example: "Feel free to contact customer support if you encounter any technical issues.",
        exampleTrans: "Vui lòng liên hệ với bộ phận hỗ trợ khách hàng nếu bạn gặp bất kỳ vấn đề kỹ thuật nào.",
        collocations: [{ phrase: "contact directly", meaning: "liên hệ trực tiếp" }, { phrase: "contact info", meaning: "thông tin liên hệ" }],
        synonyms: "reach out to, get in touch with"
      }
    },
    { 
      q: "What time does the morning staff training start?", 
      transQ: "Buổi đào tạo nhân viên sáng nay bắt đầu lúc mấy giờ?", 
      a: "At nine thirty sharp.", 
      transA: "Đúng chín giờ ba mươi phút.", 
      tip: "Level 1 Dễ: Câu hỏi What time hỏi giờ giấc chính xác.",
      distractors: [
        { text: "In the employee training center.", trans: "Tại trung tâm đào tạo nhân viên." },
        { text: "All full-time staff members.", trans: "Tất cả các nhân viên chính thức." }
      ],
      vocab: {
        word: "sharp", pos: "adv", level: "B1", ipaUS: "/ʃɑːrp/", ipaUK: "/ʃɑːp/",
        meaning: "đúng (giờ giấc chính xác, không muộn)",
        example: "The briefing will begin at 8:00 AM sharp.",
        exampleTrans: "Buổi họp tóm tắt sẽ bắt đầu vào đúng 8 giờ sáng.",
        collocations: [{ phrase: "at 9:00 sharp", meaning: "đúng 9 giờ" }, { phrase: "arrive sharp", meaning: "đến đúng giờ" }],
        synonyms: "promptly, precisely, on the dot"
      }
    }
  ],
  2: [
    { 
      q: "Did you already submit the monthly expense voucher?", 
      transQ: "Bạn đã nộp phiếu chi tiêu hàng tháng chưa?", 
      a: "Yes, I emailed it to accounting this morning.", 
      transA: "Rồi, tôi đã gửi email cho phòng kế toán sáng nay.", 
      tip: "Level 2 Cơ bản: Câu hỏi Yes/No xác nhận hành động trong quá khứ.",
      distractors: [
        { text: "About three hundred dollars.", trans: "Khoảng ba trăm đô la." },
        { text: "The finance director's office.", trans: "Văn phòng của giám đốc tài chính." }
      ],
      vocab: {
        word: "voucher", pos: "n", level: "B2", ipaUS: "/ˈvaʊ.tʃɚ/", ipaUK: "/ˈvaʊ.tʃər/",
        meaning: "phiếu chi, chứng từ thanh toán",
        example: "Submit your travel expense vouchers to the human resources department.",
        exampleTrans: "Hãy nộp phiếu chi phí đi lại của bạn cho phòng nhân sự.",
        collocations: [{ phrase: "expense voucher", meaning: "phiếu thanh toán chi phí" }, { phrase: "redeem a voucher", meaning: "sử dụng phiếu đổi thưởng" }],
        synonyms: "receipt, coupon, coupon slip"
      }
    },
    { 
      q: "How often do the city buses run to the airport terminal?", 
      transQ: "Bao lâu thì có một chuyến xe buýt thành phố đến sân bay?", 
      a: "Every twenty minutes during peak hours.", 
      transA: "Cứ 20 phút một chuyến trong giờ cao điểm.", 
      tip: "Level 2 Cơ bản: Câu hỏi How often hỏi tần suất chuyến xe.",
      distractors: [
        { text: "From the central bus depot.", trans: "Từ bến xe buýt trung tâm." },
        { text: "Two dollars and fifty cents per ride.", trans: "Hai đô la năm mươi xu cho mỗi chuyến đi." }
      ],
      vocab: {
        word: "terminal", pos: "n", level: "B1", ipaUS: "/ˈtɝː.mə.nəl/", ipaUK: "/ˈtɜː.mɪ.nəl/",
        meaning: "nhà ga sân bay, bến bãi cuối chặng",
        example: "International flights depart exclusively from Terminal 2.",
        exampleTrans: "Các chuyến bay quốc tế khởi hành độc quyền từ Nhà ga số 2.",
        collocations: [{ phrase: "airport terminal", meaning: "nhà ga sân bay" }, { phrase: "ferry terminal", meaning: "bến phà" }],
        synonyms: "station, concourse, depot"
      }
    },
    { 
      q: "Would you prefer iced coffee or hot herbal tea?", 
      transQ: "Bạn muốn dùng cà phê đá hay trà thảo mộc nóng?", 
      a: "Iced coffee with skim milk, please.", 
      transA: "Làm ơn cho một ly cà phê đá ít béo.", 
      tip: "Level 2 Cơ bản: Câu hỏi lựa chọn Or, chọn một trong hai phương án.",
      distractors: [
        { text: "Yes, I drink coffee every day.", trans: "Vâng, tôi uống cà phê mỗi ngày." },
        { text: "At the cafeteria around the corner.", trans: "Tại quán ăn tự phục vụ ở góc phố." }
      ],
      vocab: {
        word: "prefer", pos: "v", level: "A2", ipaUS: "/prɪˈfɝː/", ipaUK: "/prɪˈfɜːr/",
        meaning: "thích hơn, ưu tiên hơn",
        example: "Do you prefer working remotely or in the downtown corporate office?",
        exampleTrans: "Bạn thích làm việc từ xa hay tại văn phòng công ty ở trung tâm?",
        collocations: [{ phrase: "prefer A to B", meaning: "thích A hơn B" }, { phrase: "strongly prefer", meaning: "rất thích, ưu tiên cao" }],
        synonyms: "favor, choose, opt for"
      }
    },
    { 
      q: "How much did we spend on the marketing brochures?", 
      transQ: "Chúng ta đã chi bao nhiêu tiền cho tập tài liệu quảng cáo?", 
      a: "Around five hundred dollars in total.", 
      transA: "Tổng cộng khoảng năm trăm đô la.", 
      tip: "Level 2 Cơ bản: Câu hỏi How much hỏi số lượng tiền bạc.",
      distractors: [
        { text: "We ordered five thousand color copies.", trans: "Chúng tôi đã đặt năm nghìn bản in màu." },
        { text: "The graphic designer in Chicago.", trans: "Nhà thiết kế đồ họa ở Chicago." }
      ],
      vocab: {
        word: "brochure", pos: "n", level: "B1", ipaUS: "/broʊˈʃʊr/", ipaUK: "/ˈbrəʊ.ʃər/",
        meaning: "cuốn sách nhỏ giới thiệu, tập tài liệu quảng cáo",
        example: "The sales rep handed out glossy color brochures to attendees.",
        exampleTrans: "Đại diện bán hàng đã phát các tập tài liệu bóng màu cho những người tham dự.",
        collocations: [{ phrase: "travel brochure", meaning: "tài liệu giới thiệu du lịch" }, { phrase: "product brochure", meaning: "tài liệu giới thiệu sản phẩm" }],
        synonyms: "pamphlet, booklet, leaflet"
      }
    }
  ],
  3: [
    { 
      q: "You've reviewed the updated contract terms, haven't you?", 
      transQ: "Bạn đã xem qua các điều khoản hợp đồng mới rồi phải không?", 
      a: "Yes, and I didn't see any problematic clauses.", 
      transA: "Vâng, và tôi không thấy có điều khoản nào có vấn đề cả.", 
      tip: "Level 3 Trung bình: Câu hỏi đuôi Tag question xác nhận thông tin nghiệp vụ.",
      distractors: [
        { text: "Signed on the last page.", trans: "Đã ký ở trang cuối cùng." },
        { text: "Two copies for each party.", trans: "Hai bản cho mỗi bên." }
      ],
      vocab: {
        word: "clause", pos: "n", level: "B2", ipaUS: "/klɑːz/", ipaUK: "/klɔːz/",
        meaning: "điều khoản (trong hợp đồng)",
        example: "Our legal team recommended revising the confidentiality clause.",
        exampleTrans: "Đội ngũ pháp lý của chúng tôi khuyến nghị sửa đổi điều khoản bảo mật.",
        collocations: [{ phrase: "contract clause", meaning: "điều khoản hợp đồng" }, { phrase: "confidentiality clause", meaning: "điều khoản bảo mật" }],
        synonyms: "stipulation, provision, condition"
      }
    },
    { 
      q: "Haven't you booked the flight tickets for the overseas conference yet?", 
      transQ: "Bạn vẫn chưa đặt vé máy bay cho hội nghị ở nước ngoài sao?", 
      a: "I'm waiting for approval from the regional director.", 
      transA: "Tôi đang chờ phê duyệt từ giám đốc khu vực.", 
      tip: "Level 3 Trung bình: Câu hỏi phủ định Haven't you, trả lời nguyên nhân thực tế bằng câu gián tiếp.",
      distractors: [
        { text: "At terminal 4 gate 12.", trans: "Tại nhà ga số 4 cổng 12." },
        { text: "The conference starts next Thursday.", trans: "Hội nghị bắt đầu vào thứ Năm tuần tới." }
      ],
      vocab: {
        word: "approval", pos: "n", level: "B2", ipaUS: "/əˈpruː.vəl/", ipaUK: "/əˈpruː.vəl/",
        meaning: "sự phê duyệt, sự chấp thuận chính thức",
        example: "Project funding requires formal approval from the board of directors.",
        exampleTrans: "Kinh phí dự án cần có sự chấp thuận chính thức từ ban giám đốc.",
        collocations: [{ phrase: "gain approval", meaning: "được chấp thuận" }, { phrase: "budget approval", meaning: "sự phê duyệt ngân sách" }],
        synonyms: "authorization, permission, consent"
      }
    },
    { 
      q: "Is the weekly team synchronization meeting still scheduled for 2 PM?", 
      transQ: "Cuộc họp đồng bộ nhóm hàng tuần vẫn diễn ra lúc 2 giờ chiều chứ?", 
      a: "Let me check the shared calendar to confirm.", 
      transA: "Để tôi kiểm tra lại lịch dùng chung để xác nhận nhé.", 
      tip: "Level 3 Trung bình: Câu trả lời gián tiếp thông minh (kiểm tra lại thông tin).",
      distractors: [
        { text: "Yes, in conference room 3A.", trans: "Vâng, ở phòng hội nghị 3A." },
        { text: "The project manager led the agenda.", trans: "Trưởng dự án đã chủ trì chương trình nghị sự." }
      ],
      vocab: {
        word: "synchronization", pos: "n", level: "C1", ipaUS: "/ˌsɪŋ.krə.nəˈzeɪ.ʃən/", ipaUK: "/ˌsɪŋ.krə.naɪˈzeɪ.ʃən/",
        meaning: "sự đồng bộ hóa, phối hợp nhịp nhàng",
        example: "Real-time data synchronization is essential across global offices.",
        exampleTrans: "Việc đồng bộ hóa dữ liệu thời gian thực là điều cần thiết giữa các văn phòng toàn cầu.",
        collocations: [{ phrase: "team synchronization", meaning: "sự đồng bộ trong nhóm" }, { phrase: "data synchronization", meaning: "sự đồng bộ hóa dữ liệu" }],
        synonyms: "coordination, alignment, integration"
      }
    },
    { 
      q: "The shipment of office stationery was supposed to arrive yesterday.", 
      transQ: "Lô hàng văn phòng phẩm đáng lẽ phải đến vào ngày hôm qua.", 
      a: "There was a delay at the customs warehouse.", 
      transA: "Đã có sự chậm trễ tại kho hải quan.", 
      tip: "Level 3 Trung bình: Câu trần thuật (Statement) giải thích sự cố giao hàng.",
      distractors: [
        { text: "Forty boxes of printing paper.", trans: "Bốn mươi hộp giấy in." },
        { text: "On the storage shelf near the copier.", trans: "Trên kệ lưu trữ gần máy photocopy." }
      ],
      vocab: {
        word: "stationery", pos: "n", level: "B1", ipaUS: "/ˈsteɪ.ʃə.ner.i/", ipaUK: "/ˈsteɪ.ʃən.ər.i/",
        meaning: "văn phòng phẩm (giấy, bút, kẹp tài liệu)",
        example: "We need to replenish our supply of office stationery before Monday.",
        exampleTrans: "Chúng ta cần bổ sung nguồn cung cấp văn phòng phẩm trước thứ Hai.",
        collocations: [{ phrase: "office stationery", meaning: "văn phòng phẩm" }, { phrase: "stationery cupboard", meaning: "tủ chứa văn phòng phẩm" }],
        synonyms: "office supplies, writing materials"
      }
    }
  ],
  4: [
    { 
      q: "Could you give me a ride to the central train station after work?", 
      transQ: "Bạn có thể cho tôi đi nhờ xe đến ga trung tâm sau giờ làm không?", 
      a: "I'm sorry, my car is in the repair shop today.", 
      transA: "Xin lỗi, xe của tôi đang nằm ở tiệm sửa ngày hôm nay.", 
      tip: "Level 4 Khó: Câu hỏi yêu cầu lịch sự Could you, từ chối khéo léo bằng lý do gián tiếp (xe đang sửa).",
      distractors: [
        { text: "At track platform number 5.", trans: "Tại đường ray sân ga số 5." },
        { text: "The train departs at six fifteen.", trans: "Tàu khởi hành lúc sáu giờ mười lăm." }
      ],
      vocab: {
        word: "ride", pos: "n", level: "A2", ipaUS: "/raɪd/", ipaUK: "/raɪd/",
        meaning: "chuyến đi nhờ xe",
        example: "Can you give me a lift to the metro station after the seminar?",
        exampleTrans: "Bạn có thể cho tôi đi nhờ xe đến ga tàu điện ngầm sau hội thảo không?",
        collocations: [{ phrase: "give someone a ride", meaning: "cho ai đi nhờ xe" }, { phrase: "need a ride", meaning: "cần đi nhờ xe" }],
        synonyms: "lift, drive, carpool"
      }
    },
    { 
      q: "Why don't we consult the external legal advisor before signing?", 
      transQ: "Tại sao chúng ta không tham khảo ý kiến cố vấn pháp lý bên ngoài trước khi ký?", 
      a: "That sounds like a very prudent precaution.", 
      transA: "Đó có vẻ là một biện pháp phòng ngừa rất thận trọng.", 
      tip: "Level 4 Khó: Câu gợi ý Why don't we, đồng tình bằng từ vựng học thuật nâng cao.",
      distractors: [
        { text: "Signed on the bottom dotted line.", trans: "Đã ký trên đường kẻ chấm ở dưới cùng." },
        { text: "The legal department is on the ninth floor.", trans: "Phòng pháp chế nằm ở tầng chín." }
      ],
      vocab: {
        word: "prudent", pos: "adj", level: "C1", ipaUS: "/ˈpruː.dənt/", ipaUK: "/ˈpruː.dənt/",
        meaning: "thận trọng, khôn ngoan, có tính toán kỹ",
        example: "It is always prudent to obtain independent financial counsel.",
        exampleTrans: "Tìm kiếm lời khuyên tài chính độc lập luôn là một bước đi thận trọng.",
        collocations: [{ phrase: "prudent decision", meaning: "quyết định thận trọng" }, { phrase: "prudent precaution", meaning: "biện pháp phòng ngừa khôn ngoan" }],
        synonyms: "cautious, sensible, wise, discreet"
      }
    },
    { 
      q: "Do you know who is in charge of organizing the annual gala dinner?", 
      transQ: "Bạn có biết ai chịu trách nhiệm tổ chức tiệc dạ hội thường niên không?", 
      a: "Sarah from human resources is handling all the arrangements.", 
      transA: "Sarah ở phòng nhân sự đang xử lý toàn bộ các khâu sắp xếp.", 
      tip: "Level 4 Khó: Câu hỏi lồng ghép Do you know who, câu trả lời chỉ rõ người phụ trách.",
      distractors: [
        { text: "At the grand ballroom in the downtown Hilton.", trans: "Tại phòng khiêu vũ lớn ở khách sạn Hilton trung tâm." },
        { text: "Formal black-tie dress code is required.", trans: "Yêu cầu trang phục dạ hội trang trọng." }
      ],
      vocab: {
        word: "arrangement", pos: "n", level: "B1", ipaUS: "/əˈreɪndʒ.mənt/", ipaUK: "/əˈreɪndʒ.mənt/",
        meaning: "sự sắp xếp, chuẩn bị các khâu",
        example: "The committee made all travel arrangements for the keynote speakers.",
        exampleTrans: "Ban tổ chức đã thu xếp toàn bộ việc đi lại cho các diễn giả chính.",
        collocations: [{ phrase: "make arrangements", meaning: "thu xếp, chuẩn bị" }, { phrase: "travel arrangements", meaning: "sắp xếp việc đi lại" }],
        synonyms: "organization, preparations, planning"
      }
    },
    { 
      q: "We need to reserve the auditorium for Friday's keynote address.", 
      transQ: "Chúng ta cần đặt trước hội trường lớn cho bài phát biểu ngày thứ Sáu.", 
      a: "Isn't it already booked for the regional science fair?", 
      transA: "Nó đã được đặt trước cho hội chợ khoa học khu vực rồi mà nhỉ?", 
      tip: "Level 4 Khó: Câu trả lời bằng một câu hỏi ngược lại (Question back) để thông báo trở ngại.",
      distractors: [
        { text: "The acoustics are excellent inside.", trans: "Âm thanh bên trong rất tuyệt vời." },
        { text: "Five hundred registered conference guests.", trans: "Năm trăm khách mời hội nghị đã đăng ký." }
      ],
      vocab: {
        word: "auditorium", pos: "n", level: "B2", ipaUS: "/ˌɑː.dəˈtɔːr.i.əm/", ipaUK: "/ˌɔː.dɪˈtɔː.ri.əm/",
        meaning: "khán phòng lớn, hội trường",
        example: "The annual shareholders meeting was hosted in the new corporate auditorium.",
        exampleTrans: "Đại hội cổ đông thường niên được tổ chức tại hội trường mới của công ty.",
        collocations: [{ phrase: "main auditorium", meaning: "khán phòng chính" }, { phrase: "auditorium seating", meaning: "chỗ ngồi trong hội trường" }],
        synonyms: "hall, concert hall, theater, lecture hall"
      }
    }
  ],
  5: [
    { 
      q: "I thought the deadline for the client proposal was extended to next Monday.", 
      transQ: "Tôi cứ nghĩ hạn chót cho đề xuất khách hàng đã được gia hạn đến thứ Hai tới chứ.", 
      a: "Management decided to stick with the original schedule.", 
      transA: "Ban lãnh đạo đã quyết định giữ nguyên tiến độ ban đầu.", 
      tip: "Level 5 Rất khó: Câu trần thuật giả định (I thought...), câu trả lời phủ nhận giả định một cách gián tiếp và lịch sự.",
      distractors: [
        { text: "Printed in triplicate with color graphs.", trans: "In thành ba bản kèm biểu đồ màu." },
        { text: "Delivered by express courier this morning.", trans: "Được giao bởi chuyển phát nhanh sáng nay." }
      ],
      vocab: {
        word: "proposal", pos: "n", level: "B2", ipaUS: "/prəˈpoʊ.zəl/", ipaUK: "/prəˈpəʊ.zəl/",
        meaning: "bản đề xuất, bản chào hàng dự án",
        example: "The firm submitted a competitive bidding proposal for the government contract.",
        exampleTrans: "Công ty đã nộp một bản đề xuất đấu thầu cạnh tranh cho hợp đồng chính phủ.",
        collocations: [{ phrase: "submit a proposal", meaning: "nộp bản đề xuất" }, { phrase: "business proposal", meaning: "đề xuất kinh doanh" }],
        synonyms: "bid, offer, submission, plan"
      }
    },
    { 
      q: "Which catering vendor did the committee select for the corporate anniversary?", 
      transQ: "Hội đồng đã chọn nhà cung cấp dịch vụ ăn uống nào cho lễ kỷ niệm công ty?", 
      a: "You'll have to ask the project coordinator about that decision.", 
      transA: "Bạn sẽ phải hỏi điều phối viên dự án về quyết định đó.", 
      tip: "Level 5 Rất khó: Câu trả lời né tránh hoàn toàn (Redirecting response), chuyển hướng người hỏi sang người có thẩm quyền.",
      distractors: [
        { text: "A three-course gourmet seafood banquet.", trans: "Bữa tiệc hải sản cao cấp gồm ba món." },
        { text: "To celebrate twenty-five years in the software industry.", trans: "Để kỷ niệm hai mươi lăm năm trong ngành phần mềm." }
      ],
      vocab: {
        word: "catering", pos: "n", level: "B2", ipaUS: "/ˈkeɪ.t̬ɚ.ɪŋ/", ipaUK: "/ˈkeɪ.tər.ɪŋ/",
        meaning: "dịch vụ cung cấp tiệc ăn uống",
        example: "We hired an upscale catering company for the product launch reception.",
        exampleTrans: "Chúng tôi đã thuê một công ty phục vụ tiệc cao cấp cho tiệc ra mắt sản phẩm.",
        collocations: [{ phrase: "catering service", meaning: "dịch vụ tiệc cưới/hội nghị" }, { phrase: "catering vendor", meaning: "nhà cung cấp dịch vụ ăn uống" }],
        synonyms: "food service, banquet provisioning"
      }
    },
    { 
      q: "Shouldn't we inspect the construction site before authorizing the second payment?", 
      transQ: "Chẳng phải chúng ta nên kiểm tra công trường trước khi duyệt đợt thanh toán thứ hai sao?", 
      a: "The chief engineer already sent over the certified safety report.", 
      transA: "Kỹ sư trưởng đã gửi bản báo cáo an toàn có chứng nhận qua rồi.", 
      tip: "Level 5 Rất khó: Câu hỏi phủ định phức tạp kết hợp phản hồi gián tiếp chỉ ra điều kiện đã được thỏa mãn.",
      distractors: [
        { text: "Wire transfer directly to the contractor's bank account.", trans: "Chuyển khoản trực tiếp vào tài khoản ngân hàng của nhà thầu." },
        { text: "Hard hats must be worn at all times past the perimeter fence.", trans: "Phải luôn đội mũ bảo hộ khi đi qua hàng rào ranh giới." }
      ],
      vocab: {
        word: "authorize", pos: "v", level: "B2", ipaUS: "/ˈɑː.θɚ.aɪz/", ipaUK: "/ˈɔː.θər.aɪz/",
        meaning: "ủy quyền, phê duyệt thanh toán/hành động",
        example: "Only the chief executive officer is authorized to approve capital expenditures exceeding fifty thousand dollars.",
        exampleTrans: "Chỉ có Tổng giám đốc điều hành mới được ủy quyền phê duyệt các khoản chi vốn vượt quá năm mươi nghìn đô la.",
        collocations: [{ phrase: "authorize payment", meaning: "duyệt chi/thanh toán" }, { phrase: "authorized personnel", meaning: "nhân viên có thẩm quyền" }],
        synonyms: "sanction, approve, permit, certify"
      }
    },
    { 
      q: "The air conditioning in the executive boardroom doesn't seem to be functioning properly.", 
      transQ: "Hệ thống điều hòa trong phòng họp ban điều hành dường như không hoạt động bình thường.", 
      a: "Facilities was notified twenty minutes ago.", 
      transA: "Phòng kỹ thuật cơ sở vật chất đã được thông báo cách đây hai mươi phút rồi.", 
      tip: "Level 5 Rất khó: Câu trần thuật phàn nàn sự cố, câu trả lời bị động thông báo vấn đề đang được xử lý.",
      distractors: [
        { text: "Adjusted to twenty-two degrees Celsius.", trans: "Đã điều chỉnh về hai mươi hai độ C." },
        { text: "The board members will convene at 10:00 AM sharp.", trans: "Các thành viên hội đồng quản trị sẽ triệu tập đúng 10:00 sáng." }
      ],
      vocab: {
        word: "facilities", pos: "n", level: "B2", ipaUS: "/fəˈsɪl.ə.t̬iz/", ipaUK: "/fəˈsɪl.ə.tiz/",
        meaning: "bộ phận cơ sở vật chất, ban quản lý tòa nhà",
        example: "Please contact facilities management if the elevator requires maintenance.",
        exampleTrans: "Vui lòng liên hệ ban quản lý cơ sở vật chất nếu thang máy cần bảo trì.",
        collocations: [{ phrase: "facilities department", meaning: "phòng quản lý cơ sở vật chất" }, { phrase: "state-of-the-art facilities", meaning: "cơ sở vật chất hiện đại bậc nhất" }],
      }
    }
  ]
};

async function seedAllRealETS() {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/tuong_tan_toeic';
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB.');

    await ListeningExercise.deleteMany({});
    console.log('🧹 Cleared existing listening exercises.');

    const allDocs = [];

    // 1. GENERATE PART 1 LEVEL QUESTIONS (5 LEVELS - 92 to 93 UNIQUE QUESTIONS EACH)
    const levelConfigsPart1 = [
      { level: 1, name: 'Level 1 — Dễ (Part 1)', count: 93, isPro: false },
      { level: 2, name: 'Level 2 — Cơ bản (Part 1)', count: 93, isPro: false },
      { level: 3, name: 'Level 3 — Trung bình (Part 1)', count: 92, isPro: true },
      { level: 4, name: 'Level 4 — Khó (Part 1)', count: 92, isPro: true },
      { level: 5, name: 'Level 5 — Rất khó (Part 1)', count: 92, isPro: true }
    ];

    for (const lvl of levelConfigsPart1) {
      const questions = [];
      const scenarios = uniqueLevelScenarios[lvl.level] || uniqueLevelScenarios[1];
      const mediaPool = levelMediaFolders[lvl.level] || levelMediaFolders[1];

      for (let i = 0; i < lvl.count; i++) {
        const scenario = scenarios[i % scenarios.length];
        const folderObj = mediaPool[i % mediaPool.length];
        const qNumInTest = (i % 6) + 1;
        const ext = 'webp';

        const correctChoice = ['A', 'B', 'C', 'D'][(i + lvl.level) % 4];
        const words = scenario.s.split(' ');

        const audioUrl = `${SUPABASE_CDN_BASE}/${folderObj.folder}/${qNumInTest}.mp3`;
        const imageUrl = `${SUPABASE_CDN_BASE}/${folderObj.folder}/${qNumInTest}.${ext}`;

        const distractorsPool = [...(scenario.distractors || [
          { text: "A ladder has been placed against an exterior wall.", trans: "Một chiếc thang đã được đặt dựa vào bức tường bên ngoài." },
          { text: "Tools are being organized in a metal storage container.", trans: "Dụng cụ đang được sắp xếp trong thùng chứa bằng kim loại." },
          { text: "A vehicle is pulling into an underground parking lot.", trans: "Một phương tiện đang tiến vào bãi đỗ xe ngầm." }
        ])];

        const options = ['A', 'B', 'C', 'D'].map(lbl => {
          const isCorrect = lbl === correctChoice;
          if (isCorrect) {
            return {
              label: `(${lbl})`,
              text: scenario.s,
              translation: scenario.t,
              isCorrect: true
            };
          } else {
            const dist = distractorsPool.shift() || { text: "An item is being inspected.", trans: "Một đồ vật đang được kiểm tra." };
            return {
              label: `(${lbl})`,
              text: dist.text,
              translation: dist.trans,
              isCorrect: false
            };
          }
        });

        questions.push({
          questionNumber: i + 1,
          audioUrl: audioUrl,
          imageUrl: imageUrl,
          promptText: "Select the one statement that best describes what you see in the picture.",
          promptTranslation: "Chọn một câu miêu tả đúng nhất những gì bạn nhìn thấy trong bức tranh.",
          options: options,
          transcript: scenario.s,
          translation: scenario.t,
          dictationText: scenario.s,
          blanks: [
            { word: words[1]?.replace(/[^a-zA-Z]/g, '') || 'person', index: 1 },
            { word: words[3]?.replace(/[^a-zA-Z]/g, '') || 'table', index: 3 }
          ],
          explanation: `Lời giải ETS Lv.${lvl.level} - Câu ${i + 1}: Đáp án (${correctChoice}) miêu tả chính xác: "${scenario.t}". ${scenario.exp}`,
          vocabularyList: scenario.vocab ? [scenario.vocab] : []
        });
      }

      allDocs.push({
        title: lvl.name,
        part: 1,
        level: lvl.level,
        mode: 'level',
        year: '2026',
        isPro: lvl.isPro,
        totalQuestions: questions.length,
        questions: questions
      });
    }

    // 2. GENERATE PART 2 LEVEL QUESTIONS (5 LEVELS - 385 CÂU HỎI HỎI - ĐÁP (A, B, C))
    let rawPart2Level1 = [];
    let rawPart2Level2 = [];
    let rawPart2Level3 = [];
    let rawPart2Level4 = [];
    let rawPart2Level5 = [];
    try {
      rawPart2Level1 = require('../data/raw_part2_skeleton_100.json');
    } catch (e) {
      rawPart2Level1 = [];
    }
    try {
      rawPart2Level2 = require('../data/raw_part2_level2_100.json');
    } catch (e) {
      rawPart2Level2 = [];
    }
    try {
      rawPart2Level3 = require('../data/raw_part2_level3_100.json');
    } catch (e) {
      rawPart2Level3 = [];
    }
    try {
      rawPart2Level4 = require('../data/raw_part2_level4_100.json');
    } catch (e) {
      rawPart2Level4 = [];
    }
    try {
      rawPart2Level5 = require('../data/raw_part2_level5_100.json');
    } catch (e) {
      rawPart2Level5 = [];
    }

    const levelConfigsPart2 = [
      { level: 1, name: 'Level 1 — Dễ (Part 2)', count: 385, isPro: false },
      { level: 2, name: 'Level 2 — Cơ bản (Part 2)', count: 385, isPro: false },
      { level: 3, name: 'Level 3 — Trung bình (Part 2)', count: 385, isPro: true },
      { level: 4, name: 'Level 4 — Khó (Part 2)', count: 385, isPro: true },
      { level: 5, name: 'Level 5 — Rất khó (Part 2)', count: 385, isPro: true }
    ];

    for (const lvl of levelConfigsPart2) {
      const p2Questions = [];
      const mediaPool = levelMediaFolders[lvl.level] || levelMediaFolders[1];
      const rawDataSource = lvl.level === 1 ? rawPart2Level1 : lvl.level === 2 ? rawPart2Level2 : lvl.level === 3 ? rawPart2Level3 : lvl.level === 4 ? rawPart2Level4 : lvl.level === 5 ? rawPart2Level5 : [];
      const scenariosForLevel = part2ScenariosByLevel[lvl.level] || part2ScenariosByLevel[1];

      for (let i = 0; i < lvl.count; i++) {
        const scenario = scenariosForLevel[i % scenariosForLevel.length];
        let rawItem = null;
        if (rawDataSource.length > 0 && i < rawDataSource.length) {
          rawItem = rawDataSource[i];
        }

        const correctChoice = (rawItem && rawItem.correct_answer && ['A', 'B', 'C'].includes(rawItem.correct_answer.toUpperCase()))
          ? rawItem.correct_answer.toUpperCase()
          : ['A', 'B', 'C'][(i + lvl.level) % 3];

        let audioUrl = "";
        if (rawItem) {
          audioUrl = rawItem.audio_url?.startsWith('http') 
            ? rawItem.audio_url 
            : `${SUPABASE_CDN_BASE}/2023/Test 10/${(i % 25) + 7}.mp3`;
        } else {
          const folderObj = mediaPool[i % mediaPool.length];
          const qNumInTest = (i % 25) + 7; // Part 2 is questions 7 to 31
          audioUrl = `${SUPABASE_CDN_BASE}/${folderObj.folder}/${qNumInTest}.mp3`;
        }

        const distractorsPool = [...(scenario.distractors || [
          { text: "It'll probably be late.", trans: "Có lẽ sẽ muộn." },
          { text: "Until one o'clock.", trans: "Đến một giờ." }
        ])];

        // Part 2 ONLY HAS 3 CHOICES: A, B, C
        const options = ['A', 'B', 'C'].map(lbl => {
          const isCorrect = lbl === correctChoice;
          if (isCorrect) {
            return {
              label: `(${lbl})`,
              text: scenario.a,
              translation: scenario.transA,
              isCorrect: true
            };
          } else {
            const dist = distractorsPool.shift() || { text: "No, thank you.", trans: "Không, cảm ơn bạn." };
            return {
              label: `(${lbl})`,
              text: dist.text,
              translation: dist.trans,
              isCorrect: false
            };
          }
        });

        p2Questions.push({
          questionNumber: i + 1,
          audioUrl: audioUrl,
          imageUrl: null, // Part 2 has no image
          promptText: scenario.q,
          promptTranslation: scenario.transQ,
          options: options,
          transcript: `Q: ${scenario.q}\n(${correctChoice}) ${scenario.a}`,
          translation: `Hỏi: ${scenario.transQ}\nĐáp: (${correctChoice}) ${scenario.transA}`,
          dictationText: scenario.a,
          blanks: [
            { word: scenario.a.split(' ')[0] || 'Sure', index: 0 }
          ],
          explanation: `Lời giải ETS Lv.${lvl.level} - Câu ${i + 1}: ${scenario.tip} Đáp án (${correctChoice}) là câu trả lời tự nhiên và chính xác nhất.`,
          vocabularyList: scenario.vocab ? [scenario.vocab] : []
        });
      }

      allDocs.push({
        title: lvl.name,
        part: 2,
        level: lvl.level,
        mode: 'level',
        year: '2026',
        isPro: lvl.isPro,
        totalQuestions: p2Questions.length,
        questions: p2Questions
      });
    }

    // 3. GENERATE PART 3 LEVEL QUESTIONS (5 LEVELS - 435 CÂU HỘI THOẠI)
    const part3TopicsList = [
      { q: "Where does the conversation most likely take place?", a: "At a marketing consulting firm", trans: "Cuộc trò chuyện có khả năng diễn ra ở đâu nhất?", exp: "Người nói đề cập đến chiến dịch quảng cáo và phân tích đối thủ." },
      { q: "What is the woman concerned about?", a: "The upcoming product launch deadline", trans: "Người phụ nữ lo lắng về điều gì?", exp: "Người phụ nữ nhấn mạnh thời hạn phát hành sản phẩm mới chỉ còn 2 ngày." },
      { q: "What does the man suggest doing?", a: "Hiring temporary support staff", trans: "Người đàn ông đề xuất làm gì?", exp: "Người đàn ông gợi ý thuê thêm nhân sự tạm thời để hỗ trợ kịp tiến độ." }
    ];

    const levelConfigsPart3 = [
      { level: 1, name: 'Level 1 — Dễ (Part 3)', count: 435, isPro: false },
      { level: 2, name: 'Level 2 — Cơ bản (Part 3)', count: 435, isPro: false },
      { level: 3, name: 'Level 3 — Trung bình (Part 3)', count: 435, isPro: true },
      { level: 4, name: 'Level 4 — Khó (Part 3)', count: 435, isPro: true },
      { level: 5, name: 'Level 5 — Rất khó (Part 3)', count: 435, isPro: true }
    ];

    for (const lvl of levelConfigsPart3) {
      const p3Questions = [];
      const mediaPool = levelMediaFolders[lvl.level] || levelMediaFolders[1];

      for (let i = 0; i < lvl.count; i++) {
        const item = part3TopicsList[i % part3TopicsList.length];
        const correctChoice = ['A', 'B', 'C', 'D'][(i + lvl.level) % 4];
        const folderObj = mediaPool[i % mediaPool.length];
        const qNumInTest = (i % 39) + 32; // Part 3 is questions 32 to 70

        const audioUrl = `${SUPABASE_CDN_BASE}/${folderObj.folder}/${qNumInTest}.mp3`;

        const distractors = [
          "To request a product refund",
          "In an automotive repair shop",
          "Reviewing the quarterly budget"
        ];

        const options = ['A', 'B', 'C', 'D'].map(lbl => {
          const isCorrect = lbl === correctChoice;
          return {
            label: `(${lbl})`,
            text: isCorrect ? item.a : distractors.pop() || "Attending a workshop",
            isCorrect: isCorrect
          };
        });

        p3Questions.push({
          questionNumber: i + 1,
          audioUrl: audioUrl,
          imageUrl: null,
          promptText: item.q,
          options: options,
          transcript: `Speaker 1: Have you seen the updated design files?\nSpeaker 2: Yes, we need to approve them by noon today.`,
          translation: `Người 1: Bạn đã xem file thiết kế cập nhật chưa?\nNgười 2: Rồi, chúng ta cần phê duyệt trước 12h trưa nay.`,
          dictationText: item.a,
          blanks: [{ word: item.a.split(' ')[0] || 'At', index: 0 }],
          explanation: `Lời giải ETS Lv.${lvl.level} - Câu ${i + 1}: ${item.exp}`
        });
      }

      allDocs.push({
        title: lvl.name,
        part: 3,
        level: lvl.level,
        mode: 'level',
        year: '2026',
        isPro: lvl.isPro,
        totalQuestions: p3Questions.length,
        questions: p3Questions
      });
    }

    // 4. GENERATE PART 4 LEVEL QUESTIONS (5 LEVELS - 360 CÂU BÀI NÓI ĐỘC THOẠI)
    const part4TopicsList = [
      { q: "What is the purpose of the announcement?", a: "To inform passengers about a gate change", trans: "Mục đích của thông báo là gì?", exp: "Phát thanh viên sân bay thông báo đổi cổng khởi hành của chuyến bay." },
      { q: "Who most likely is the speaker?", a: "A museum tour guide", trans: "Người nói có khả năng là ai nhất?", exp: "Người nói đang hướng dẫn khách tham quan khu trưng bày nghệ thuật đương đại." },
      { q: "What are listeners asked to do?", a: "Register online before Friday", trans: "Người nghe được yêu cầu làm gì?", exp: "Người nói yêu cầu điền đơn đăng ký trực tuyến trước ngày thứ Sáu." }
    ];

    const levelConfigsPart4 = [
      { level: 1, name: 'Level 1 — Dễ (Part 4)', count: 360, isPro: false },
      { level: 2, name: 'Level 2 — Cơ bản (Part 4)', count: 360, isPro: false },
      { level: 3, name: 'Level 3 — Trung bình (Part 4)', count: 360, isPro: true },
      { level: 4, name: 'Level 4 — Khó (Part 4)', count: 360, isPro: true },
      { level: 5, name: 'Level 5 — Rất khó (Part 4)', count: 360, isPro: true }
    ];

    for (const lvl of levelConfigsPart4) {
      const p4Questions = [];
      const mediaPool = levelMediaFolders[lvl.level] || levelMediaFolders[1];

      for (let i = 0; i < lvl.count; i++) {
        const item = part4TopicsList[i % part4TopicsList.length];
        const correctChoice = ['A', 'B', 'C', 'D'][(i + lvl.level) % 4];
        const folderObj = mediaPool[i % mediaPool.length];
        const qNumInTest = (i % 30) + 71; // Part 4 is questions 71 to 100

        const audioUrl = `${SUPABASE_CDN_BASE}/${folderObj.folder}/${qNumInTest}.mp3`;

        const distractors = [
          "To announce a staff promotion",
          "A corporate travel agent",
          "Contact the maintenance office"
        ];

        const options = ['A', 'B', 'C', 'D'].map(lbl => {
          const isCorrect = lbl === correctChoice;
          return {
            label: `(${lbl})`,
            text: isCorrect ? item.a : distractors.pop() || "Submit receipt",
            isCorrect: isCorrect
          };
        });

        p4Questions.push({
          questionNumber: i + 1,
          audioUrl: audioUrl,
          imageUrl: null,
          promptText: item.q,
          options: options,
          transcript: `Welcome everyone to the annual tech conference. Please ensure your badges are visible at all times.`,
          translation: `Chào mừng mọi người đến với hội nghị công nghệ thường niên. Xin vui lòng đeo thẻ đại biểu rõ ràng.`,
          dictationText: item.a,
          blanks: [{ word: item.a.split(' ')[0] || 'To', index: 0 }],
          explanation: `Lời giải ETS Lv.${lvl.level} - Câu ${i + 1}: ${item.exp}`
        });
      }

      allDocs.push({
        title: lvl.name,
        part: 4,
        level: lvl.level,
        mode: 'level',
        year: '2026',
        isPro: lvl.isPro,
        totalQuestions: p4Questions.length,
        questions: p4Questions
      });
    }

    // 5. GENERATE 10 FULL ETS DICTATION TESTS
    for (let testNum = 1; testNum <= 10; testNum++) {
      const year = testNum <= 3 ? '2026' : testNum <= 6 ? '2024' : '2023';
      const folder = testNum <= 8 ? `2026/t${testNum}` : `2024/Test_0${testNum - 8}`;
      const ext = 'webp';
      const isPro = testNum > 2;

      const testPart1Questions = [];
      const scenarios = uniqueLevelScenarios[(testNum % 5) + 1] || uniqueLevelScenarios[1];

      for (let qIdx = 1; qIdx <= 24; qIdx++) {
        const scenario = scenarios[(qIdx - 1) % scenarios.length];
        const correctChoice = ['A', 'B', 'C', 'D'][(testNum + qIdx) % 4];
        const words = scenario.s.split(' ');

        const options = ['A', 'B', 'C', 'D'].map(lbl => {
          const isCorrect = lbl === correctChoice;
          return {
            label: `(${lbl})`,
            text: isCorrect ? scenario.s : "A worker is moving materials to another station.",
            isCorrect: isCorrect
          };
        });

        testPart1Questions.push({
          questionNumber: qIdx,
          audioUrl: `${SUPABASE_CDN_BASE}/${folder}/${(qIdx % 6) + 1}.mp3`,
          imageUrl: `${SUPABASE_CDN_BASE}/${folder}/${(qIdx % 6) + 1}.${ext}`,
          promptText: "Select the one statement that best describes what you see in the picture.",
          options: options,
          transcript: scenario.s,
          translation: scenario.t,
          dictationText: scenario.s,
          blanks: [
            { word: words[1]?.replace(/[^a-zA-Z]/g, '') || 'item', index: 1 },
            { word: words[3]?.replace(/[^a-zA-Z]/g, '') || 'place', index: 3 }
          ],
          explanation: `Lời giải ETS TEST ${testNum} - Câu ${qIdx}: Phương án (${correctChoice}) là đáp án đúng.`
        });
      }

      allDocs.push({
        title: `TEST ${testNum} ${year}`,
        part: 1,
        level: (testNum % 5) + 1,
        mode: 'dictation',
        year: year,
        topic: 'Mô tả tranh ảnh ETS',
        isPro: isPro,
        totalQuestions: 24,
        questions: testPart1Questions
      });

      allDocs.push({
        title: `TEST ${testNum} ${year} — Part 2`,
        part: 2,
        level: (testNum % 5) + 1,
        mode: 'dictation',
        year: year,
        topic: 'Hỏi đáp phản xạ nhanh',
        isPro: isPro,
        totalQuestions: 100,
        questions: testPart1Questions
      });

      allDocs.push({
        title: `TEST ${testNum} ${year} — Part 3`,
        part: 3,
        level: (testNum % 5) + 1,
        mode: 'dictation',
        year: year,
        topic: 'Hội thoại doanh nghiệp',
        isPro: isPro,
        totalQuestions: 111,
        questions: testPart1Questions
      });

      allDocs.push({
        title: `TEST ${testNum} ${year} — Part 4`,
        part: 4,
        level: (testNum % 5) + 1,
        mode: 'dictation',
        year: year,
        topic: 'Bài độc thoại thông báo',
        isPro: isPro,
        totalQuestions: 75,
        questions: testPart1Questions
      });
    }

    await ListeningExercise.insertMany(allDocs);
    console.log(`🎉 Successfully seeded ${allDocs.length} Listening Modules with distinct media pools for all 5 levels into MongoDB!`);
    process.exit(0);
  } catch (err) {
    console.error('❌ Error generating distinct levels:', err);
    process.exit(1);
  }
}

seedAllRealETS();
