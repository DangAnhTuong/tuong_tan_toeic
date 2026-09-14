// TOEIC Authentic Vietnamese Translation & Vocabulary Dictionary Engine

// 1. Vocabulary bank for TOEIC Part 1 - 7 with CEFR levels, part of speech, IPA, and meanings
export const TOEIC_VOCAB_BANK = [
  // Actions & Verbs
  { word: 'pour', pos: 'v', level: 'A2', meaning: 'rót, đổ (chất lỏng)', phonetic: '/pɔːr/' },
  { word: 'clear', pos: 'v', level: 'A2', meaning: 'dọn dẹp, dọn sạch', phonetic: '/klɪr/' },
  { word: 'set', pos: 'v', level: 'A2', meaning: 'đặt, để, bố trí', phonetic: '/set/' },
  { word: 'iron', pos: 'v', level: 'B1', meaning: 'ủi, là (quần áo)', phonetic: '/ˈaɪərn/' },
  { word: 'inspect', pos: 'v', level: 'B1', meaning: 'kiểm tra, thanh tra', phonetic: '/ɪnˈspekt/' },
  { word: 'operate', pos: 'v', level: 'B1', meaning: 'vận hành, điều khiển thiết bị', phonetic: '/ˈɑːpəreɪt/' },
  { word: 'board', pos: 'v', level: 'B1', meaning: 'lên (tàu, xe, máy bay)', phonetic: '/bɔːrd/' },
  { word: 'pull', pos: 'v', level: 'A2', meaning: 'kéo, lôi', phonetic: '/pʊl/' },
  { word: 'wipe', pos: 'v', level: 'A2', meaning: 'lau chùi, chùi sạch', phonetic: '/waɪp/' },
  { word: 'bend down', pos: 'phrv', level: 'B1', meaning: 'cúi người xuống', phonetic: '/bend daʊn/' },
  { word: 'bend over', pos: 'phrv', level: 'B1', meaning: 'cúi gập người', phonetic: '/bend ˈoʊvər/' },
  { word: 'trim', pos: 'v', level: 'B1', meaning: 'cắt tỉa (cây, tóc)', phonetic: '/trɪm/' },
  { word: 'scrub', pos: 'v', level: 'B1', meaning: 'chà xát, cọ rửa', phonetic: '/skrʌb/' },
  { word: 'gather', pos: 'v', level: 'B1', meaning: 'tập hợp, tụ tập', phonetic: '/ˈɡæðər/' },
  { word: 'stack', pos: 'v', level: 'B1', meaning: 'chồng, xếp chồng lên nhau', phonetic: '/stæk/' },
  { word: 'fold', pos: 'v', level: 'A2', meaning: 'gấp lại, xếp lại', phonetic: '/foʊld/' },
  { word: 'carry', pos: 'v', level: 'A2', meaning: 'mang, vác, cầm theo', phonetic: '/ˈkæri/' },
  { word: 'hold', pos: 'v', level: 'A2', meaning: 'cầm, nắm, giữ', phonetic: '/hoʊld/' },
  { word: 'reach for', pos: 'phrv', level: 'B1', meaning: 'với tay lấy', phonetic: '/riːtʃ fɔːr/' },
  { word: 'put on', pos: 'phrv', level: 'A2', meaning: 'mặc (áo), đội (mũ), đeo (kính)', phonetic: '/pʊt ɑːn/' },
  { word: 'take off', pos: 'phrv', level: 'A2', meaning: 'cởi (quần áo), cất cánh', phonetic: '/teɪk ɔːf/' },
  { word: 'wear', pos: 'v', level: 'A1', meaning: 'đang mặc, đang đeo', phonetic: '/wer/' },
  { word: 'stand', pos: 'v', level: 'A1', meaning: 'đứng', phonetic: '/stænd/' },
  { word: 'sit', pos: 'v', level: 'A1', meaning: 'ngồi', phonetic: '/sɪt/' },
  { word: 'walk', pos: 'v', level: 'A1', meaning: 'đi bộ', phonetic: '/wɔːk/' },
  { word: 'cross', pos: 'v', level: 'A2', meaning: 'băng qua (đường), gác chéo', phonetic: '/krɔːs/' },
  { word: 'lean against', pos: 'phrv', level: 'B1', meaning: 'tựa vào, dựa vào', phonetic: '/liːn əˈɡenst/' },
  { word: 'examine', pos: 'v', level: 'B1', meaning: 'kiểm tra, xem xét kỹ lưỡng', phonetic: '/ɪɡˈzæmɪn/' },
  { word: 'organize', pos: 'v', level: 'B1', meaning: 'sắp xếp, tổ chức', phonetic: '/ˈɔːrɡənaɪz/' },
  { word: 'arrange', pos: 'v', level: 'B1', meaning: 'bố trí, sắp đặt', phonetic: '/əˈreɪndʒ/' },
  { word: 'hang', pos: 'v', level: 'A2', meaning: 'treo, móc', phonetic: '/hæŋ/' },
  { word: 'display', pos: 'v', level: 'B1', meaning: 'trưng bày', phonetic: '/dɪˈspleɪ/' },
  { word: 'load', pos: 'v', level: 'B1', meaning: 'chất hàng lên', phonetic: '/loʊd/' },
  { word: 'unload', pos: 'v', level: 'B1', meaning: 'dỡ hàng xuống', phonetic: '/ʌnˈloʊd/' },

  // Objects & Nouns
  { word: 'contract', pos: 'n', level: 'B1', meaning: 'hợp đồng ký kết', phonetic: '/ˈkɑːntrækt/' },
  { word: 'contractor', pos: 'n', level: 'B2', meaning: 'nhà thầu thi công', phonetic: '/ˈkɑːntræktər/' },
  { word: 'supplier', pos: 'n', level: 'B1', meaning: 'nhà cung cấp', phonetic: '/səˈplaɪər/' },
  { word: 'conference', pos: 'n', level: 'B1', meaning: 'hội nghị, hội thảo', phonetic: '/ˈkɑːnfərəns/' },
  { word: 'liquid', pos: 'n', level: 'B1', meaning: 'chất lỏng', phonetic: '/ˈlɪkwɪd/' },
  { word: 'cup', pos: 'n', level: 'A1', meaning: 'cốc, tách', phonetic: '/kʌp/' },
  { word: 'shelf', pos: 'n', level: 'A2', meaning: 'kệ, giá sách', phonetic: '/ʃelf/' },
  { word: 'floor', pos: 'n', level: 'A1', meaning: 'sàn nhà, tầng nhà', phonetic: '/flɔːr/' },
  { word: 'plant', pos: 'n', level: 'A2', meaning: 'cây cảnh, chậu cây, nhà máy', phonetic: '/plænt/' },
  { word: 'shirt', pos: 'n', level: 'A1', meaning: 'áo sơ mi', phonetic: '/ʃɜːrt/' },
  { word: 'luggage', pos: 'n', level: 'B1', meaning: 'hành lý', phonetic: '/ˈlʌɡɪdʒ/' },
  { word: 'baggage', pos: 'n', level: 'B1', meaning: 'hành lý xách tay', phonetic: '/ˈbæɡɪdʒ/' },
  { word: 'desk', pos: 'n', level: 'A1', meaning: 'bàn làm việc', phonetic: '/desk/' },
  { word: 'table', pos: 'n', level: 'A1', meaning: 'bàn', phonetic: '/ˈteɪbl/' },
  { word: 'chair', pos: 'n', level: 'A1', meaning: 'ghế', phonetic: '/tʃer/' },
  { word: 'projector', pos: 'n', level: 'B1', meaning: 'máy chiếu', phonetic: '/prəˈdʒektər/' },
  { word: 'laptop', pos: 'n', level: 'A2', meaning: 'máy tính xách tay', phonetic: '/ˈlæptɑːp/' },
  { word: 'cable', pos: 'n', level: 'B1', meaning: 'dây cáp điện', phonetic: '/ˈkeɪbl/' },
  { word: 'renovation', pos: 'n', level: 'B2', meaning: 'sự cải tạo, tu sửa', phonetic: '/ˌrenəˈveɪʃn/' },
  { word: 'schedule', pos: 'n', level: 'B1', meaning: 'lịch trình, thời gian biểu', phonetic: '/ˈskedʒuːl/' },
  { word: 'production', pos: 'n', level: 'B1', meaning: 'buổi biểu diễn / việc sản xuất', phonetic: '/prəˈdʌkʃn/' },
  { word: 'representative', pos: 'n', level: 'B2', meaning: 'người đại diện', phonetic: '/ˌreprɪˈzentətɪv/' }
];

// Common full-sentence translation dictionary for exact matches
const EXACT_SENTENCE_DICT = {
  "he's clearing the floor.": "Anh ấy đang dọn dẹp sàn nhà.",
  "he is clearing the floor.": "Anh ấy đang dọn dẹp sàn nhà.",
  "he's setting a plant on a shelf.": "Anh ấy đang đặt một cái cây lên kệ.",
  "he is setting a plant on a shelf.": "Anh ấy đang đặt một cái cây lên kệ.",
  "he's pouring some liquid into a cup.": "Anh ấy đang rót một ít chất lỏng vào chiếc cốc.",
  "he is pouring some liquid into a cup.": "Anh ấy đang rót một ít chất lỏng vào chiếc cốc.",
  "he's ironing a shirt.": "Anh ấy đang ủi một chiếc áo sơ mi.",
  "he is ironing a shirt.": "Anh ấy đang ủi một chiếc áo sơ mi.",
  "they're sitting at a desk.": "Họ đang ngồi ở bàn làm việc.",
  "they are sitting at a desk.": "Họ đang ngồi ở bàn làm việc.",
  "they're inspecting a projector.": "Họ đang kiểm tra máy chiếu.",
  "they are inspecting a projector.": "Họ đang kiểm tra máy chiếu.",
  "they're carrying a laptop.": "Họ đang mang theo một máy tính xách tay.",
  "they are carrying a laptop.": "Họ đang mang theo một máy tính xách tay.",
  "they're holding some cables.": "Họ đang cầm một số sợi cáp.",
  "they are holding some cables.": "Họ đang cầm một số sợi cáp.",
  "she's closing a garden gate.": "Cô ấy đang đóng cổng vườn.",
  "she's scrubbing dirt off a fence.": "Cô ấy đang chà sạch vết bẩn trên hàng rào.",
  "she's bending down to turn on a hose.": "Cô ấy đang cúi xuống để mở vòi nước.",
  "she's trimming a hedge.": "Cô ấy đang cắt tỉa hàng rào cây.",
  "a man is standing in a road.": "Một người đàn ông đang đứng trên đường.",
  "a man is wearing a coat.": "Một người đàn ông đang mặc áo khoác.",
  "a man with tools is bending over.": "Một người đàn ông mang theo dụng cụ đang cúi người xuống.",
  "a man is putting on a hat.": "Một người đàn ông đang đội mũ.",
  "the woman is wiping off the dining table.": "Người phụ nữ đang lau bàn ăn.",
  "the woman is holding a glass.": "Người phụ nữ đang cầm một chiếc cốc thủy tinh.",
  "the woman is pouring a beverage.": "Người phụ nữ đang rót một loại đồ uống.",
  "the woman is paying the bill.": "Người phụ nữ đang thanh toán hóa đơn.",
  "he's inspecting a printed boarding pass.": "Anh ấy đang kiểm tra tấm thẻ lên máy bay đã in.",
  "he's boarding an airplane.": "Anh ấy đang bước lên máy bay.",
  "he's putting on his coat.": "Anh ấy đang mặc chiếc áo khoác của mình.",
  "he's pulling his luggage across the floor.": "Anh ấy đang kéo hành lý của mình trên sàn.",
  "one of the men is operating a drill.": "Một trong những người đàn ông đang vận hành máy khoan.",
  "one of the men is latching a toolbox.": "Một trong những người đàn ông đang cài chốt hộp dụng cụ.",
  "the men are positioning a large metal pipe.": "Những người đàn ông đang định vị một đường ống kim loại lớn.",
  "some safety helmets are placed on a ledge.": "Một số mũ bảo hộ được đặt trên gờ tường.",
  "one of the women is reviewing notes on a chart.": "Một trong hai người phụ nữ đang xem lại ghi chú trên biểu đồ.",
  "one of the women is opening a cabinet door.": "Một trong hai người phụ nữ đang mở cửa tủ đựng đồ.",
  "there are supplies organized on trays.": "Có các vật dụng / đồ tiếp tế được sắp xếp gọn gàng trên các khay.",
  "there are bandages on a desk.": "Có băng gạc y tế ở trên bàn làm việc.",
  "he is operating a microwave.": "Người đàn ông đang vận hành / sử dụng lò vi sóng.",
  "he is inspecting a tall pantry cabinet.": "Người đàn ông đang kiểm tra một chiếc tủ đựng đồ ăn cao.",
  "the woman is cleaning a table in a library.": "Người phụ nữ đang lau một chiếc bàn trong thư viện.",
  "some storage shelves have been arranged along a wall.": "Một số kệ chứa đồ đã được bố trí dọc theo bức tường.",
  "one of the women is opening a filing cabinet near the window.": "Một trong những người phụ nữ đang mở tủ hồ sơ gần cửa sổ.",
  "some people are seated on the chairs.": "Một số người đang ngồi trên các ghế.",
  "a man is handing an identity card to the women.": "Một người đàn ông đang đưa thẻ căn cước cho người phụ nữ.",
  "lab technician is examining a microscope.": "Kỹ thuật viên phòng thí nghiệm đang kiểm tra kính hiển vi.",
  "some glass bottles are being arranged on shelves.": "Một số chai thủy tinh đang được sắp xếp lên kệ.",
  "igital screen has been mounted above a workbench.": "Một màn hình kỹ thuật số đã được gắn phía trên bàn làm việc.",
  "some office workers are standing near a safety cabinet.": "Một số nhân viên văn phòng đang đứng gần một tủ an toàn.",
  "paper shredder has been connected to an outlet.": "Máy hủy tài liệu đã được cắm vào một ổ điện.",
  "some people are seated at a café.": "Một số người đang ngồi tại một quán cà phê.",
  "at a café": "Tại một quán cà phê",
  "a résumé": "Một bản sơ yếu lý lịch",
  "update a résumé": "Cập nhật sơ yếu lý lịch",
  "send a résumé": "Gửi một bản sơ yếu lý lịch",
  "review a résumé": "Xem lại sơ yếu lý lịch",
  "review some résumés": "Xem lại một số bản sơ yếu lý lịch",
  "print out her résumé": "In sơ yếu lý lịch của cô ấy",
  "next to a café": "Bên cạnh một quán cà phê",
  "eat at a café": "Ăn tại một quán cà phê",
  "the café is a few blocks away.": "Quán cà phê cách đây vài dãy nhà."
};

// Comprehensive Root Verb Meanings for Dynamic Tense & Voice Generation
const ROOT_VERB_MAP = {
  'end': 'kết thúc, chấm dứt',
  'close': 'đóng cửa, kết thúc',
  'inspect': 'kiểm tra, thanh tra',
  'expand': 'mở rộng, phát triển',
  'approve': 'phê duyệt, chấp thuận',
  'inform': 'thông báo, cho biết',
  'confirm': 'xác nhận',
  'decide': 'quyết định',
  'expect': 'dự kiến, kỳ vọng, lường trước',
  'wait': 'chờ đợi, đón đợi',
  'figure': 'hình dung, tính toán',
  'provide': 'cung cấp',
  'complete': 'hoàn thành',
  'submit': 'nộp, đệ trình',
  'receive': 'nhận được',
  'attend': 'tham dự',
  'manage': 'quản lý',
  'develop': 'phát triển',
  'operate': 'vận hành',
  'reduce': 'cắt giảm, giảm bớt',
  'increase': 'gia tăng, tăng lên',
  'maintain': 'duy trì, bảo dưỡng',
  'distribute': 'phân phối',
  'recommend': 'khuyến nghị, giới thiệu',
  'consider': 'xem xét, cân nhắc',
  'require': 'yêu cầu, bắt buộc',
  'produce': 'sản xuất',
  'qualify': 'đủ điều kiện',
  'represent': 'đại diện',
  'apply': 'ứng tuyển, áp dụng',
  'compete': 'cạnh tranh',
  'succeed': 'thành công, kế nhiệm',
  'renew': 'gia hạn, làm mới',
  'extend': 'kéo dài, mở rộng',
  'cancel': 'hủy bỏ',
  'postpone': 'hoãn lại',
  'delay': 'trì hoãn',
  'schedule': 'lên lịch trình',
  'reschedule': 'đổi lại lịch trình',
  'deliver': 'giao hàng, chuyển phát',
  'order': 'đặt hàng, yêu cầu',
  'purchase': 'mua hàng, thanh toán',
  'install': 'cài đặt, lắp đặt',
  'repair': 'sửa chữa',
  'replace': 'thay thế',
  'hire': 'thuê, tuyển dụng',
  'promote': 'thăng chức, quảng bá',
  'retire': 'nghỉ hưu',
  'resign': 'từ chức',
  'review': 'xem xét, đánh giá',
  'evaluate': 'đánh giá, thẩm định',
  'conduct': 'tiến hành, thực hiện',
  'organize': 'tổ chức, sắp xếp',
  'arrange': 'bố trí, sắp xếp',
  'participate': 'tham gia',
  'join': 'gia nhập, tham gia',
  'visit': 'thăm quan, ghé thăm',
  'travel': 'đi công tác, du lịch',
  'commute': 'đi lại làm việc',
  'arrive': 'đến nơi',
  'depart': 'khởi hành',
  'leave': 'rời đi, để lại'
};

// Comprehensive word bank for single words in Part 5, 6, 7 options
const COMMON_TOEIC_WORDS = {
  // Pronouns
  'she': 'cô ấy (đại từ chủ ngữ)',
  'her': 'của cô ấy (tính từ sở hữu / tân ngữ)',
  'hers': 'của cô ấy (đại từ sở hữu độc lập)',
  'herself': 'chính cô ấy (đại từ phản thân)',
  'he': 'anh ấy (đại từ chủ ngữ)',
  'his': 'của anh ấy (tính từ sở hữu / đại từ sở hữu)',
  'him': 'anh ấy (tân ngữ)',
  'himself': 'chính anh ấy (đại từ phản thân)',
  'they': 'họ, chúng (đại từ chủ ngữ)',
  'them': 'họ, chúng (tân ngữ)',
  'their': 'của họ (tính từ sở hữu)',
  'theirs': 'của họ (đại từ sở hữu)',
  'themselves': 'chính họ (đại từ phản thân)',
  'we': 'chúng tôi (đại từ chủ ngữ)',
  'us': 'chúng tôi (tân ngữ)',
  'our': 'của chúng tôi (tính từ sở hữu)',
  'ours': 'của chúng tôi (đại từ sở hữu)',
  'ourselves': 'chính chúng tôi (đại từ phản thân)',
  'it': 'nó (đại từ)',
  'its': 'của nó (tính từ sở hữu)',
  'itself': 'chính nó (đại từ phản thân)',
  'who': 'người mà, ai (đại từ quan hệ chỉ người)',
  'whom': 'người mà (tân ngữ quan hệ)',
  'whose': 'của người mà (sở hữu quan hệ)',
  'which': 'cái mà (đại từ quan hệ chỉ vật)',
  'that': 'người mà / cái mà (đại từ quan hệ)',
  'other': 'khác (tính từ)',
  'others': 'những người khác / cái khác (đại từ số nhiều)',
  'another': 'một cái khác / một người khác',

  // Prepositions & Conjunctions
  'because': 'bởi vì (liên từ)',
  'because of': 'bởi vì, do (giới từ)',
  'due to': 'do, bởi vì (giới từ)',
  'although': 'mặc dù (liên từ)',
  'despite': 'mặc dù, bất chấp (giới từ)',
  'in spite of': 'mặc dù, bất chấp (giới từ)',
  'during': 'trong suốt (giới từ)',
  'while': 'trong khi (liên từ)',
  'unless': 'trừ khi (liên từ)',
  'prior to': 'trước khi (giới từ)',
  'instead of': 'thay vì (giới từ)',
  'in addition to': 'ngoài ra, bên cạnh',
  'as well as': 'cũng như, cùng với',

  // Common TOEIC Vocabulary
  'wait': 'chờ đợi, đón đợi',
  'decide': 'quyết định, định đoạt',
  'expect': 'dự kiến, kỳ vọng, lường trước',
  'figure': 'hình dung, tính toán, chỉ số',
  'approved': 'đã được phê duyệt / đã chấp thuận',
  'approving': 'đang phê duyệt / việc phê duyệt',
  'approval': 'sự phê duyệt, sự chấp thuận',
  'inspected': 'đã kiểm tra, đã thanh tra',
  'inspecting': 'đang kiểm tra, việc thanh tra',
  'inspection': 'sự kiểm tra, cuộc thanh tra',
  'inspector': 'thanh tra viên',
  'expanded': 'đã mở rộng, đã phát triển',
  'expanding': 'đang mở rộng',
  'expansion': 'sự mở rộng, sự bành trướng',
  'expansive': 'rộng lớn, bao quát',
  'closed': 'đã đóng cửa / đóng lại',
  'closing': 'việc đóng cửa / đang đóng',
  'closure': 'sự đóng cửa',
  'will be ending': 'sẽ kết thúc (thì tương lai tiếp diễn)',
  'has been ending': 'đã và đang kết thúc (hiện tại hoàn thành tiếp diễn)',
  'has ended': 'đã kết thúc (thì hiện tại hoàn thành)',
  'have ended': 'đã kết thúc (thì hiện tại hoàn thành)',
  'is ended': 'bị kết thúc (thể bị động)',
  'was ended': 'đã bị kết thúc (thể bị động quá khứ)',
  'will end': 'sẽ kết thúc (thì tương lai đơn)',
  'is ending': 'đang kết thúc (thì hiện tại tiếp diễn)',
  'original': 'nguyên bản, ban đầu',
  'originally': 'ban đầu, vốn dĩ',
  'originality': 'tính độc đáo, sự sáng tạo',
  'practical': 'thiết thực, thực tế',
  'practically': 'một cách thiết thực / gần như',
  'practice': 'việc thực hành, luyện tập',
  'practicality': 'tính thực tế, sự khả thi',
  'sufficient': 'đủ, thích đáng',
  'sufficiently': 'một cách đầy đủ',
  'sufficiency': 'sự đầy đủ',
  'frequent': 'thường xuyên',
  'frequently': 'một cách thường xuyên',
  'frequency': 'tần suất, độ thường xuyên',
  'recent': 'gần đây, mới đây',
  'recently': 'gần đây, mới đây',
  'financial': 'thuộc về tài chính',
  'financially': 'về mặt tài chính',
  'finance': 'tài chính',
  'professional': 'chuyên nghiệp',
  'professionally': 'một cách chuyên nghiệp',
  'profession': 'nghề nghiệp',
  'successful': 'thành công',
  'successfully': 'một cách thành công',
  'success': 'sự thành công',
  'succeed': 'thành công, kế thừa',
  'available': 'có sẵn, rảnh rỗi',
  'availability': 'tình trạng có sẵn',
  'reliable': 'đáng tin cậy',
  'reliably': 'một cách đáng tin cậy',
  'reliability': 'độ tin cậy',
  'rely': 'dựa vào, tin cậy'
};

// Dynamic Tense & Voice Grammar Engine
function translateGrammarVerbPhrase(cleanLower) {
  // 1. will be + V-ing
  let match = cleanLower.match(/^will\s+be\s+([a-z]+)ing$/i);
  if (match) {
    const root = match[1].replace(/e$/, '');
    const viRoot = ROOT_VERB_MAP[root] || ROOT_VERB_MAP[match[1]] || ROOT_VERB_MAP[root + 'e'] || match[1];
    return `sẽ ${viRoot} (thì tương lai tiếp diễn)`;
  }

  // 2. has been / have been + V-ing
  match = cleanLower.match(/^(has|have)\s+been\s+([a-z]+)ing$/i);
  if (match) {
    const root = match[2].replace(/e$/, '');
    const viRoot = ROOT_VERB_MAP[root] || ROOT_VERB_MAP[match[2]] || ROOT_VERB_MAP[root + 'e'] || match[2];
    return `đã và đang ${viRoot} (hiện tại hoàn thành tiếp diễn)`;
  }

  // 3. has / have / had + V-ed/V3
  match = cleanLower.match(/^(has|have|had)\s+([a-z]+)(ed|en|t)$/i);
  if (match) {
    const root = match[2].replace(/e$/, '');
    const viRoot = ROOT_VERB_MAP[root] || ROOT_VERB_MAP[match[2]] || ROOT_VERB_MAP[root + 'e'] || match[2];
    return `đã ${viRoot} (thì hoàn thành)`;
  }

  // 4. is / are / was / were + V-ed (Passive)
  match = cleanLower.match(/^(is|are|was|were)\s+([a-z]+)(ed|en|t)$/i);
  if (match) {
    const root = match[2].replace(/e$/, '');
    const viRoot = ROOT_VERB_MAP[root] || ROOT_VERB_MAP[match[2]] || ROOT_VERB_MAP[root + 'e'] || match[2];
    return `được / bị ${viRoot} (thể bị động)`;
  }

  // 5. is / are / was / were + V-ing
  match = cleanLower.match(/^(is|are|was|were)\s+([a-z]+)ing$/i);
  if (match) {
    const root = match[2].replace(/e$/, '');
    const viRoot = ROOT_VERB_MAP[root] || ROOT_VERB_MAP[match[2]] || ROOT_VERB_MAP[root + 'e'] || match[2];
    return `đang ${viRoot} (thì tiếp diễn)`;
  }

  // 6. will + V-inf
  match = cleanLower.match(/^will\s+([a-z]+)$/i);
  if (match) {
    const viRoot = ROOT_VERB_MAP[match[1]] || match[1];
    return `sẽ ${viRoot} (thì tương lai đơn)`;
  }

  // 7. to + V-inf
  match = cleanLower.match(/^to\s+([a-z]+)$/i);
  if (match) {
    const viRoot = ROOT_VERB_MAP[match[1]] || match[1];
    return `để ${viRoot} (dạng to-V)`;
  }

  // 8. Single word V-ed
  if (cleanLower.endsWith('ed')) {
    const root1 = cleanLower.replace(/ed$/, '');
    const root2 = cleanLower.replace(/d$/, '');
    const viRoot = ROOT_VERB_MAP[cleanLower] || ROOT_VERB_MAP[root1] || ROOT_VERB_MAP[root1 + 'e'] || ROOT_VERB_MAP[root2];
    if (viRoot) return `đã / được ${viRoot}`;
  }

  // 9. Single word V-ing
  if (cleanLower.endsWith('ing')) {
    const root1 = cleanLower.replace(/ing$/, '');
    const viRoot = ROOT_VERB_MAP[cleanLower] || ROOT_VERB_MAP[root1] || ROOT_VERB_MAP[root1 + 'e'];
    if (viRoot) return `đang / việc ${viRoot}`;
  }

  // 10. Single word in ROOT_VERB_MAP
  if (ROOT_VERB_MAP[cleanLower]) {
    return ROOT_VERB_MAP[cleanLower];
  }

  return null;
}

// Grammar & phrase translation rules for dynamic TOEIC translations
export function translateToeicOption(englishText, question = null) {
  if (!englishText) return '';
  const clean = englishText.trim();
  const lower = clean.toLowerCase();

  // 1. Direct dictionary match from Common Words
  if (COMMON_TOEIC_WORDS[lower]) {
    return COMMON_TOEIC_WORDS[lower];
  }

  // 2. Exact full sentence match
  if (EXACT_SENTENCE_DICT[lower]) {
    return EXACT_SENTENCE_DICT[lower];
  }

  const stripped = lower.replace(/[.,!?;:]+$/, '');
  if (EXACT_SENTENCE_DICT[stripped]) {
    return EXACT_SENTENCE_DICT[stripped];
  }
  if (COMMON_TOEIC_WORDS[stripped]) {
    return COMMON_TOEIC_WORDS[stripped];
  }

  // 3. Dynamic Tense & Voice Grammar Translation
  const grammarTrans = translateGrammarVerbPhrase(stripped);
  if (grammarTrans) {
    return grammarTrans;
  }

  // 4. Suffix heuristic translations for single vocabulary words

  // 5. Suffix heuristic translations
  if (stripped.endsWith('ly')) {
    const root = stripped.replace(/ly$/, '');
    const viRoot = COMMON_TOEIC_WORDS[root] || ROOT_VERB_MAP[root] || root;
    return `một cách ${viRoot} (trạng từ)`;
  }
  if (stripped.endsWith('tion') || stripped.endsWith('sion') || stripped.endsWith('ment') || stripped.endsWith('ness') || stripped.endsWith('ity')) {
    return `sự / việc ${stripped} (danh từ)`;
  }
  if (stripped.endsWith('able') || stripped.endsWith('ible') || stripped.endsWith('ive') || stripped.endsWith('ful') || stripped.endsWith('ous')) {
    return `có tính ${stripped} (tính từ)`;
  }

  // If no Vietnamese translation is found, return empty string so UI doesn't render duplicate English text
  return '';
}

// Extract smart vocabulary recommendations from question & options
export function extractVocabRecommendations(questionGroup) {
  if (!questionGroup) return TOEIC_VOCAB_BANK.slice(0, 5);

  const qs = questionGroup.questions || (Array.isArray(questionGroup) ? questionGroup : [questionGroup]);
  const combinedText = qs.map(q => 
    `${q.prompt || q.promptText || ''} ${(q.options || []).map(o => o.text || '').join(' ')} ${q.passageText || q.transcript || ''}`
  ).join(' ').toLowerCase();

  // 1. First check question's explicit vocabularyList from DB
  const JUNK = new Set(['questions', 'question', 'following', 'passage', 'article', 'refer', 'select', 'statement']);
  const dbVocab = [];
  qs.forEach(q => {
    if (q.vocabularyList && Array.isArray(q.vocabularyList) && q.vocabularyList.length > 0) {
      q.vocabularyList.forEach(v => {
        if (!v || !v.word || typeof v.word !== 'string') return;
        const wLower = v.word.toLowerCase().trim();
        if (/\d/.test(wLower) || JUNK.has(wLower) || wLower.length < 3) return;
        if (v.word.includes('{') || v.word.includes('[') || v.word.includes('"') || v.word.includes('vocabulary')) return;
        if (v.meaning && (v.meaning.includes('lemma') || v.meaning.includes('collocations') || v.meaning.includes('cốt lõi') || v.meaning.includes('trọng tâm TOEIC'))) return;

        if (!dbVocab.some(item => item.word.toLowerCase() === wLower)) {
          dbVocab.push({
            word: v.word.charAt(0).toUpperCase() + v.word.slice(1),
            pos: v.pos || 'n',
            level: v.level || 'B1',
            meaning: v.meaning || '',
            phonetic: v.ipaUS || v.phonetic || ''
          });
        }
      });
    }
  });

  if (dbVocab.length >= 2) return dbVocab;

  // 2. Match from Curated TOEIC Vocab Bank
  const matched = TOEIC_VOCAB_BANK.filter(v => combinedText.includes(v.word.toLowerCase()) && !JUNK.has(v.word.toLowerCase()));
  if (matched.length >= 2) return matched.slice(0, 5);

  return TOEIC_VOCAB_BANK.slice(0, 5);
}
