const mongoose = require('mongoose');
const ListeningExercise = require('../models/ListeningExercise');

// Comprehensive dictionary of TOEIC Part 1 key vocabulary with full attributes (IPA, POS, CEFR, meaning, example)
const VOCAB_DICTIONARY = {
  // Verbs & Actions
  'type': { pos: 'v', level: 'A2', ipaUS: '/taɪp/', ipaUK: '/taɪp/', meaning: 'gõ (bàn phím, máy tính)', example: 'He is typing an email to his supervisor.', exampleTrans: 'Anh ấy đang gõ một email gửi cho người giám sát.', collocations: [{ phrase: 'type on a keyboard', meaning: 'gõ trên bàn phím' }] },
  'plug in': { pos: 'phr v', level: 'B1', ipaUS: '/plʌɡ ɪn/', ipaUK: '/plʌɡ ɪn/', meaning: 'cắm phích điện', example: 'She is plugging in the computer monitor.', exampleTrans: 'Cô ấy đang cắm phích cắm màn hình máy tính.', collocations: [{ phrase: 'plug in an appliance', meaning: 'cắm điện thiết bị' }] },
  'unplug': { pos: 'v', level: 'B1', ipaUS: '/ʌnˈplʌɡ/', ipaUK: '/ʌnˈplʌɡ/', meaning: 'rút phích cắm điện', example: 'A technician is unplugging the copy machine.', exampleTrans: 'Một kỹ thuật viên đang rút phích cắm máy photocopy.', collocations: [{ phrase: 'unplug a device', meaning: 'rút phích cắm thiết bị' }] },
  'answer': { pos: 'v', level: 'A1', ipaUS: '/ˈæn.sɚ/', ipaUK: '/ˈɑːn.sər/', meaning: 'trả lời (điện thoại, câu hỏi)', example: 'The receptionist is answering a phone call.', exampleTrans: 'Nhân viên lễ tân đang trả lời một cuộc gọi.', collocations: [{ phrase: 'answer a telephone', meaning: 'nghe điện thoại bàn' }] },
  'sweep': { pos: 'v', level: 'A2', ipaUS: '/swiːp/', ipaUK: '/swiːp/', meaning: 'quét (sàn nhà, vỉa hè)', example: 'The worker is sweeping the hallway floor.', exampleTrans: 'Người công nhân đang quét sàn hành lang.', collocations: [{ phrase: 'sweep the floor', meaning: 'quét sàn nhà' }, { phrase: 'sweep the walkway', meaning: 'quét lối đi bộ' }] },
  'board': { pos: 'v', level: 'B1', ipaUS: '/bɔːrd/', ipaUK: '/bɔːd/', meaning: 'lên tàu, lên xe, lên máy bay', example: 'Passengers are boarding the morning flight.', exampleTrans: 'Hành khách đang lên chuyến bay buổi sáng.', collocations: [{ phrase: 'board a train', meaning: 'lên tàu hỏa' }, { phrase: 'board an airplane', meaning: 'lên máy bay' }] },
  'install': { pos: 'v', level: 'B1', ipaUS: '/ɪnˈstɑːl/', ipaUK: '/ɪnˈstɔːl/', meaning: 'lắp đặt, cài đặt', example: 'Workers are installing a security camera.', exampleTrans: 'Công nhân đang lắp đặt camera an ninh.', collocations: [{ phrase: 'install a fixture', meaning: 'lắp đặt thiết bị cố định' }, { phrase: 'install a railing', meaning: 'lắp lan can' }] },
  'stack': { pos: 'v', level: 'B1', ipaUS: '/stæk/', ipaUK: '/stæk/', meaning: 'xếp chồng, chất đống', example: 'Boxes are stacked neatly in the warehouse.', exampleTrans: 'Các hộp được xếp chồng gọn gàng trong nhà kho.', collocations: [{ phrase: 'stack boxes', meaning: 'xếp chồng các thùng carton' }] },
  'hang': { pos: 'v', level: 'A2', ipaUS: '/hæŋ/', ipaUK: '/hæŋ/', meaning: 'treo, móc (tranh, quần áo, đèn)', example: 'A framed portrait is hanging on the wall.', exampleTrans: 'Một bức chân dung có khung đang treo trên tường.', collocations: [{ phrase: 'hang from the ceiling', meaning: 'treo từ trần nhà' }] },
  'lean': { pos: 'v', level: 'B1', ipaUS: '/liːn/', ipaUK: '/liːn/', meaning: 'dựa, tựa vào', example: 'A ladder is leaning against the brick wall.', exampleTrans: 'Một chiếc thang đang dựa vào tường gạch.', collocations: [{ phrase: 'lean against a wall', meaning: 'dựa vào tường' }] },
  'carry': { pos: 'v', level: 'A2', ipaUS: '/ˈkær.i/', ipaUK: '/ˈkær.i/', meaning: 'mang, vác, bưng, xách', example: 'The waiter is carrying a tray of drinks.', exampleTrans: 'Người phục vụ đang bưng một khay đồ uống.', collocations: [{ phrase: 'carry a briefcase', meaning: 'xách cặp tài liệu' }, { phrase: 'carry a tray', meaning: 'bưng khay' }] },
  'hold': { pos: 'v', level: 'A2', ipaUS: '/hoʊld/', ipaUK: '/həʊld/', meaning: 'cầm, nắm, giữ', example: 'She is holding a pen in her right hand.', exampleTrans: 'Cô ấy đang cầm một cây bút ở tay phải.', collocations: [{ phrase: 'hold a document', meaning: 'cầm tài liệu' }, { phrase: 'hold a handle', meaning: 'nắm tay cầm' }] },
  'pour': { pos: 'v', level: 'B1', ipaUS: '/pɔːr/', ipaUK: '/pɔːr/', meaning: 'rót, đổ (chất lỏng)', example: 'He is pouring coffee into a ceramic mug.', exampleTrans: 'Anh ấy đang rót cà phê vào cốc sứ.', collocations: [{ phrase: 'pour water into a glass', meaning: 'rót nước vào ly' }] },
  'stir': { pos: 'v', level: 'B1', ipaUS: '/stɝː/', ipaUK: '/stɜːr/', meaning: 'khuấy, đảo', example: 'The chef is stirring a pot of soup.', exampleTrans: 'Đầu bếp đang khuấy nồi súp.', collocations: [{ phrase: 'stir a liquid', meaning: 'khuấy chất lỏng' }] },
  'water': { pos: 'v', level: 'A2', ipaUS: '/ˈwɑː.t̬ɚ/', ipaUK: '/ˈwɔː.tər/', meaning: 'tưới nước (cho cây)', example: 'The gardener is watering the flowers.', exampleTrans: 'Người làm vườn đang tưới hoa.', collocations: [{ phrase: 'water a plant', meaning: 'tưới cây' }] },
  'trim': { pos: 'v', level: 'B1', ipaUS: '/trɪm/', ipaUK: '/trɪm/', meaning: 'cắt tỉa (cây, cành, tóc)', example: 'A worker is trimming the bushes along the path.', exampleTrans: 'Một công nhân đang cắt tỉa bụi cây dọc lối đi.', collocations: [{ phrase: 'trim branches', meaning: 'tỉa cành cây' }] },
  'wipe': { pos: 'v', level: 'B1', ipaUS: '/waɪp/', ipaUK: '/waɪp/', meaning: 'lau chùi, chùi sạch', example: 'She is wiping down the conference table.', exampleTrans: 'Cô ấy đang lau chùi bàn phòng họp.', collocations: [{ phrase: 'wipe a counter', meaning: 'lau mặt quầy' }] },
  'mow': { pos: 'v', level: 'B2', ipaUS: '/moʊ/', ipaUK: '/məʊ/', meaning: 'cắt cỏ', example: 'He is mowing the lawn in front of the house.', exampleTrans: 'Anh ấy đang cắt cỏ trước nhà.', collocations: [{ phrase: 'mow the lawn', meaning: 'cắt cỏ bãi cỏ' }] },
  'kneel': { pos: 'v', level: 'B1', ipaUS: '/niːl/', ipaUK: '/niːl/', meaning: 'quỳ gối', example: 'The plumber is kneeling beside the sink.', exampleTrans: 'Thợ sửa ống nước đang quỳ bên cạnh bồn rửa.', collocations: [{ phrase: 'kneel on the floor', meaning: 'quỳ trên sàn' }] },
  'bend': { pos: 'v', level: 'B1', ipaUS: '/bend/', ipaUK: '/bend/', meaning: 'cúi người, uốn cong', example: 'A man is bending over to pick up a box.', exampleTrans: 'Một người đàn ông đang cúi xuống nhặt một chiếc hộp.', collocations: [{ phrase: 'bend over', meaning: 'cúi người xuống' }] },
  'point': { pos: 'v', level: 'A2', ipaUS: '/pɔɪnt/', ipaUK: '/pɔɪnt/', meaning: 'chỉ tay, chỉ về hướng', example: 'The tour guide is pointing at the monument.', exampleTrans: 'Hướng dẫn viên đang chỉ vào tượng đài.', collocations: [{ phrase: 'point at a chart', meaning: 'chỉ vào biểu đồ' }] },
  'shake': { pos: 'v', level: 'A2', ipaUS: '/ʃeɪk/', ipaUK: '/ʃeɪk/', meaning: 'bắt tay, rung, lắc', example: 'The business partners are shaking hands.', exampleTrans: 'Các đối tác kinh doanh đang bắt tay nhau.', collocations: [{ phrase: 'shake hands', meaning: 'bắt tay nhau' }] },
  'examine': { pos: 'v', level: 'B1', ipaUS: '/ɪɡˈzæm.ɪn/', ipaUK: '/ɪɡˈzæm.ɪn/', meaning: 'kiểm tra, xem xét kỹ lưỡng', example: 'The shopper is examining a piece of clothing.', exampleTrans: 'Người mua hàng đang kiểm tra một món đồ may mặc.', collocations: [{ phrase: 'examine merchandise', meaning: 'kiểm tra hàng hóa' }] },
  'inspect': { pos: 'v', level: 'B1', ipaUS: '/ɪnˈspekt/', ipaUK: '/ɪnˈspekt/', meaning: 'thanh tra, kiểm tra kỹ thuật', example: 'An engineer is inspecting the engine components.', exampleTrans: 'Một kỹ sư đang kiểm tra các bộ phận của động cơ.', collocations: [{ phrase: 'inspect equipment', meaning: 'kiểm tra thiết bị' }] },
  'repair': { pos: 'v', level: 'A2', ipaUS: '/rɪˈper/', ipaUK: '/rɪˈpeər/', meaning: 'sửa chữa', example: 'A mechanic is repairing a vehicle tire.', exampleTrans: 'Thợ cơ khí đang sửa chữa lốp xe.', collocations: [{ phrase: 'repair a machine', meaning: 'sửa chữa máy móc' }] },
  'fix': { pos: 'v', level: 'A2', ipaUS: '/fɪks/', ipaUK: '/fɪks/', meaning: 'sửa chữa, cố định', example: 'He is fixing a broken door hinge.', exampleTrans: 'Anh ấy đang sửa một chiếc bản lề cửa bị hỏng.', collocations: [{ phrase: 'fix a roof', meaning: 'sửa mái nhà' }] },
  'assemble': { pos: 'v', level: 'B2', ipaUS: '/əˈsem.bəl/', ipaUK: '/əˈsem.bəl/', meaning: 'lắp ráp (đồ vật), tập trung (người)', example: 'Workers are assembling electronic parts.', exampleTrans: 'Công nhân đang lắp ráp các linh kiện điện tử.', collocations: [{ phrase: 'assemble furniture', meaning: 'lắp ráp đồ nội thất' }] },
  'load': { pos: 'v', level: 'B1', ipaUS: '/loʊd/', ipaUK: '/ləʊd/', meaning: 'chất hàng, bốc hàng lên xe', example: 'Men are loading cartons into a delivery van.', exampleTrans: 'Những người đàn ông đang bốc các thùng carton lên xe tải giao hàng.', collocations: [{ phrase: 'load cargo', meaning: 'bốc dỡ hàng hóa' }] },
  'unload': { pos: 'v', level: 'B1', ipaUS: '/ʌnˈloʊd/', ipaUK: '/ʌnˈləʊd/', meaning: 'dỡ hàng xuống', example: 'Workers are unloading crates from a truck.', exampleTrans: 'Công nhân đang dỡ các thùng gỗ từ xe tải.', collocations: [{ phrase: 'unload goods', meaning: 'dỡ hàng hóa' }] },
  'display': { pos: 'v', level: 'B1', ipaUS: '/dɪˈspleɪ/', ipaUK: '/dɪˈspleɪ/', meaning: 'trưng bày, hiển thị', example: 'Fresh produce is displayed on outdoor shelves.', exampleTrans: 'Nông sản tươi được trưng bày trên các kệ ngoài trời.', collocations: [{ phrase: 'display items', meaning: 'trưng bày các mặt hàng' }] },
  'arrange': { pos: 'v', level: 'B1', ipaUS: '/əˈreɪndʒ/', ipaUK: '/əˈreɪndʒ/', meaning: 'sắp xếp, bố trí', example: 'Chairs are arranged in neat rows.', exampleTrans: 'Những chiếc ghế được sắp xếp thành các hàng ngay ngắn.', collocations: [{ phrase: 'arrange flowers', meaning: 'cắm hoa / sắp hoa' }, { phrase: 'arrange furniture', meaning: 'bố trí đồ đạc' }] },
  'dock': { pos: 'v', level: 'B2', ipaUS: '/dɑːk/', ipaUK: '/dɒk/', meaning: 'cập bến, neo đậu (tàu thuyền)', example: 'Several boats are docked at the marina pier.', exampleTrans: 'Một vài chiếc thuyền đang neo đậu tại bến tàu.', collocations: [{ phrase: 'dock at a harbor', meaning: 'cập cảng' }] },
  'park': { pos: 'v', level: 'A1', ipaUS: '/pɑːrk/', ipaUK: '/pɑːk/', meaning: 'đỗ xe', example: 'Vehicles are parked along the curb.', exampleTrans: 'Các phương tiện đang đỗ dọc theo lề đường.', collocations: [{ phrase: 'park a vehicle', meaning: 'đỗ một chiếc xe' }] },
  'walk': { pos: 'v', level: 'A1', ipaUS: '/wɑːk/', ipaUK: '/wɔːk/', meaning: 'đi bộ, dạo bước', example: 'Pedestrians are walking across the crosswalk.', exampleTrans: 'Người đi bộ đang băng qua vạch sang đường.', collocations: [{ phrase: 'walk along a path', meaning: 'đi bộ dọc theo lối đi' }] },
  'stroll': { pos: 'v', level: 'B2', ipaUS: '/stroʊl/', ipaUK: '/strəʊl/', meaning: 'đi dạo thong thả', example: 'Couples are strolling through the city park.', exampleTrans: 'Các cặp đôi đang đi dạo thong thả qua công viên thành phố.', collocations: [{ phrase: 'stroll along the beach', meaning: 'dạo bước dọc bãi biển' }] },

  // Nouns & Objects & Settings
  'drawer': { pos: 'n', level: 'A2', ipaUS: '/drɔːr/', ipaUK: '/drɔː.ər/', meaning: 'ngăn kéo bàn', example: 'She opened the desk drawer to find a stapler.', exampleTrans: 'Cô ấy mở ngăn kéo bàn để tìm chiếc dập ghim.', collocations: [{ phrase: 'desk drawer', meaning: 'ngăn kéo bàn làm việc' }] },
  'keyboard': { pos: 'n', level: 'A1', ipaUS: '/ˈkiː.bɔːrd/', ipaUK: '/ˈkiː.bɔːd/', meaning: 'bàn phím (máy tính, đàn)', example: 'He spilled coffee on his computer keyboard.', exampleTrans: 'Anh ấy làm đổ cà phê lên bàn phím máy tính.', collocations: [{ phrase: 'computer keyboard', meaning: 'bàn phím máy tính' }] },
  'printer': { pos: 'n', level: 'A2', ipaUS: '/ˈprɪn.t̬ɚ/', ipaUK: '/ˈprɪn.tər/', meaning: 'máy in', example: 'The wireless printer is connected to the office network.', exampleTrans: 'Máy in không dây đã được kết nối vào mạng văn phòng.', collocations: [{ phrase: 'laser printer', meaning: 'máy in laser' }] },
  'railing': { pos: 'n', level: 'B2', ipaUS: '/ˈreɪ.lɪŋ/', ipaUK: '/ˈreɪ.lɪŋ/', meaning: 'lan can, tay vịn', example: 'She held onto the stairway railing for balance.', exampleTrans: 'Cô ấy bám vào lan can cầu thang để giữ thăng bằng.', collocations: [{ phrase: 'stair railing', meaning: 'lan can cầu thang' }, { phrase: 'balcony railing', meaning: 'lan can ban công' }] },
  'walkway': { pos: 'n', level: 'B1', ipaUS: '/ˈwɑːk.weɪ/', ipaUK: '/ˈwɔːk.weɪ/', meaning: 'lối đi bộ, đường đi dạo', example: 'The stone walkway leads directly to the garden entrance.', exampleTrans: 'Lối đi bộ bằng đá dẫn thẳng đến cổng vườn.', collocations: [{ phrase: 'paved walkway', meaning: 'lối đi lát gạch' }] },
  'sidewalk': { pos: 'n', level: 'A2', ipaUS: '/ˈsaɪd.wɑːk/', ipaUK: '/ˈsaɪd.wɔːk/', meaning: 'vỉa hè, lề đường', example: 'Trees are planted along the edge of the sidewalk.', exampleTrans: 'Cây cối được trồng dọc theo mép vỉa hè.', collocations: [{ phrase: 'walk on the sidewalk', meaning: 'đi bộ trên vỉa hè' }] },
  'crosswalk': { pos: 'n', level: 'B1', ipaUS: '/ˈkrɑːs.wɑːk/', ipaUK: '/ˈkrɒs.wɔːk/', meaning: 'vạch kẻ đường cho người đi bộ', example: 'Drivers must stop when pedestrians enter the crosswalk.', exampleTrans: 'Tài xế phải dừng lại khi người đi bộ bước vào vạch sang đường.', collocations: [{ phrase: 'pedestrian crosswalk', meaning: 'vạch sang đường cho người đi bộ' }] },
  'intersection': { pos: 'n', level: 'B1', ipaUS: '/ˌɪn.t̬ɚˈsek.ʃən/', ipaUK: '/ˌɪn.təˈsek.ʃən/', meaning: 'ngã tư, giao lộ', example: 'Traffic lights are operating at the busy intersection.', exampleTrans: 'Đèn giao thông đang hoạt động tại ngã tư đông đúc.', collocations: [{ phrase: 'busy intersection', meaning: 'giao lộ đông đúc' }] },
  'curb': { pos: 'n', level: 'B2', ipaUS: '/kɝːb/', ipaUK: '/kɜːb/', meaning: 'mép vỉa hè, lề đường', example: 'A bicycle is resting against the street curb.', exampleTrans: 'Một chiếc xe đạp đang tựa vào mép vỉa hè.', collocations: [{ phrase: 'park at the curb', meaning: 'đỗ xe sát mép lề đường' }] },
  'fountain': { pos: 'n', level: 'B1', ipaUS: '/ˈfaʊn.tən/', ipaUK: '/ˈfaʊn.tɪn/', meaning: 'đài phun nước', example: 'Children are tossing coins into the water fountain.', exampleTrans: 'Trẻ em đang ném đồng xu vào đài phun nước.', collocations: [{ phrase: 'water fountain', meaning: 'đài phun nước' }] },
  'bench': { pos: 'n', level: 'A2', ipaUS: '/bentʃ/', ipaUK: '/bentʃ/', meaning: 'ghế dài công viên / bàn thợ', example: 'An elderly man is reading a book on the wooden bench.', exampleTrans: 'Một người đàn ông cao tuổi đang đọc sách trên chiếc ghế dài bằng gỗ.', collocations: [{ phrase: 'park bench', meaning: 'ghế dài công viên' }] },
  'ladder': { pos: 'n', level: 'A2', ipaUS: '/ˈlæd.ɚ/', ipaUK: '/ˈlæd.ər/', meaning: 'cái thang', example: 'The electrician climbed up the aluminum ladder.', exampleTrans: 'Người thợ điện trèo lên chiếc thang nhôm.', collocations: [{ phrase: 'step ladder', meaning: 'thang xếp chữ A' }] },
  'scaffolding': { pos: 'n', level: 'C1', ipaUS: '/ˈskæf.əl.dɪŋ/', ipaUK: '/ˈskæf.əl.dɪŋ/', meaning: 'giàn giáo xây dựng', example: 'Construction workers are standing on the exterior scaffolding.', exampleTrans: 'Công nhân xây dựng đang đứng trên giàn giáo bên ngoài.', collocations: [{ phrase: 'erect scaffolding', meaning: 'dựng giàn giáo' }] },
  'briefcase': { pos: 'n', level: 'B1', ipaUS: '/ˈbriːf.keɪs/', ipaUK: '/ˈbriːf.keɪs/', meaning: 'cặp tài liệu, vali xách tay', example: 'The lawyer placed her leather briefcase on the conference table.', exampleTrans: 'Nữ luật sư đặt chiếc cặp da của mình lên bàn hội nghị.', collocations: [{ phrase: 'leather briefcase', meaning: 'cặp da đựng tài liệu' }] },
  'backpack': { pos: 'n', level: 'A2', ipaUS: '/ˈbæk.pæk/', ipaUK: '/ˈbæk.pæk/', meaning: 'ba lô đeo lưng', example: 'The student slung a heavy backpack over his shoulder.', exampleTrans: 'Cậu sinh viên khoác chiếc ba lô nặng lên vai.', collocations: [{ phrase: 'wear a backpack', meaning: 'đeo ba lô' }] },
  'helmet': { pos: 'n', level: 'A2', ipaUS: '/ˈhel.mət/', ipaUK: '/ˈhel.mɪt/', meaning: 'mũ bảo hiểm / mũ bảo hộ', example: 'Everyone on the construction site must wear a protective helmet.', exampleTrans: 'Mọi người tại công trường xây dựng đều phải đội mũ bảo hộ.', collocations: [{ phrase: 'hard hat / safety helmet', meaning: 'mũ bảo hộ lao động' }] },
  'counter': { pos: 'n', level: 'B1', ipaUS: '/ˈkaʊn.t̬ɚ/', ipaUK: '/ˈkaʊn.tər/', meaning: 'quầy thu ngân / mặt quầy', example: 'A customer is paying at the checkout counter.', exampleTrans: 'Một khách hàng đang thanh toán tại quầy thu ngân.', collocations: [{ phrase: 'service counter', meaning: 'quầy phục vụ' }] },
  'shelves': { pos: 'n', level: 'A2', ipaUS: '/ʃelvz/', ipaUK: '/ʃelvz/', meaning: 'các giá sách, kệ hàng', example: 'The library shelves are filled with historical archives.', exampleTrans: 'Các giá kệ thư viện chứa đầy tài liệu lưu trữ lịch sử.', collocations: [{ phrase: 'display shelves', meaning: 'kệ trưng bày' }] },
  'pot': { pos: 'n', level: 'A2', ipaUS: '/pɑːt/', ipaUK: '/pɒt/', meaning: 'nồi nấu / chậu cây', example: 'Green potted plants decorate the hotel lobby.', exampleTrans: 'Những chậu cây xanh trang trí sảnh khách sạn.', collocations: [{ phrase: 'potted plant', meaning: 'chậu cây cảnh' }] },
  'cart': { pos: 'n', level: 'B1', ipaUS: '/kɑːrt/', ipaUK: '/kɑːt/', meaning: 'xe đẩy hàng (siêu thị, hành lý)', example: 'The traveler pushed a luggage cart through the airport terminal.', exampleTrans: 'Vị khách du lịch đẩy chiếc xe hành lý qua nhà ga sân bay.', collocations: [{ phrase: 'shopping cart', meaning: 'xe đẩy mua hàng' }, { phrase: 'luggage cart', meaning: 'xe đẩy hành lý' }] },
  'wheelbarrow': { pos: 'n', level: 'B2', ipaUS: '/ˈwiːlˌber.oʊ/', ipaUK: '/ˈwiːlˌbær.əʊ/', meaning: 'xe rùa, xe cút kít chở đất cát', example: 'The gardener transported soil in a metal wheelbarrow.', exampleTrans: 'Người làm vườn vận chuyển đất bằng xe rùa kim loại.', collocations: [{ phrase: 'push a wheelbarrow', meaning: 'đẩy xe rùa' }] },
  'tool': { pos: 'n', level: 'A2', ipaUS: '/tuːl/', ipaUK: '/tuːl/', meaning: 'dụng cụ, công cụ', example: 'The mechanic selected a wrench from his tool box.', exampleTrans: 'Thợ cơ khí chọn một chiếc cờ lê từ hộp dụng cụ của mình.', collocations: [{ phrase: 'power tool', meaning: 'dụng cụ điện cầm tay' }] },
  'apron': { pos: 'n', level: 'B1', ipaUS: '/ˈeɪ.prən/', ipaUK: '/ˈeɪ.prən/', meaning: 'tạp dề (nấu ăn, phục vụ)', example: 'The barista tied a brown apron around his waist.', exampleTrans: 'Nhân viên pha chế thắt chiếc tạp dề màu nâu quanh eo.', collocations: [{ phrase: 'wear an apron', meaning: 'đeo tạp dề' }] },
  'pier': { pos: 'n', level: 'B2', ipaUS: '/pɪr/', ipaUK: '/pɪər/', meaning: 'bến tàu, cầu tàu nhô ra biển', example: 'Tourists walked out onto the wooden fishing pier.', exampleTrans: 'Khách du lịch bước ra cầu tàu câu cá bằng gỗ.', collocations: [{ phrase: 'dock at a pier', meaning: 'cập cầu tàu' }] },
  'awning': { pos: 'n', level: 'C1', ipaUS: '/ˈɑː.nɪŋ/', ipaUK: '/ˈɔː.nɪŋ/', meaning: 'mái che, mái hiên di động', example: 'A striped fabric awning provides shade over the outdoor cafe tables.', exampleTrans: 'Mái che bằng vải sọc tạo bóng mát cho các bàn cà phê ngoài trời.', collocations: [{ phrase: 'retractable awning', meaning: 'mái hiên có thể thu vào' }] },
  'pedestrian': { pos: 'n', level: 'B1', ipaUS: '/pəˈdes.tri.ən/', ipaUK: '/pəˈdes.tri.ən/', meaning: 'người đi bộ', example: 'Pedestrians waited on the sidewalk for the signal to change.', exampleTrans: 'Người đi bộ đứng đợi trên vỉa hè chờ tín hiệu đèn đổi màu.', collocations: [{ phrase: 'pedestrian zone', meaning: 'phố đi bộ' }] }
};

// Fallback high-frequency words generator based on text analysis
function extractVocabFromStatements(statements) {
  const fullText = statements.join(' ').toLowerCase();
  const results = [];
  const added = new Set();

  for (const [key, val] of Object.entries(VOCAB_DICTIONARY)) {
    const keyLower = key.toLowerCase();
    const regex = new RegExp(`\\b${keyLower}\\b`, 'i');
    if (regex.test(fullText) && !added.has(key)) {
      results.push({
        word: key.charAt(0).toUpperCase() + key.slice(1),
        pos: val.pos,
        level: val.level,
        ipaUS: val.ipaUS,
        ipaUK: val.ipaUK,
        meaning: val.meaning,
        example: val.example,
        exampleTrans: val.exampleTrans,
        collocations: val.collocations || []
      });
      added.add(key);
      if (results.length >= 4) break;
    }
  }

  // If still fewer than 2 words, pick default core Part 1 vocabulary
  if (results.length < 2) {
    const defaults = ['carry', 'hold', 'display', 'arrange', 'inspect'];
    for (const d of defaults) {
      if (!added.has(d)) {
        const val = VOCAB_DICTIONARY[d];
        results.push({
          word: d.charAt(0).toUpperCase() + d.slice(1),
          pos: val.pos,
          level: val.level,
          ipaUS: val.ipaUS,
          ipaUK: val.ipaUK,
          meaning: val.meaning,
          example: val.example,
          exampleTrans: val.exampleTrans,
          collocations: val.collocations || []
        });
        added.add(d);
        if (results.length >= 3) break;
      }
    }
  }

  return results;
}

// Clean and standardize statements and translations
function formatPart1Statement(text) {
  if (!text) return '';
  let clean = text.trim()
    .replace(/^[\(\[\{][A-Da-d][\)\]\}]\s*[\.:\-]?\s*/, '') // (A), [A], etc.
    .replace(/^[A-Da-d][\.\:\-]\s+/, '') // A., B., C., D.
    .replace(/\s+/g, ' ')
    .trim();

  // If accidentally stripped "A " before "woman" or "man" or "person"
  if (/^(woman|man|person|technician|worker|mechanic|waiter|waitress|customer|doctor|nurse)\s+/i.test(clean)) {
    clean = 'A ' + clean;
  } else if (/^(printer|ladder|painting|picture|cart|door|window|box|bag|car|boat|train|bus)\s+/i.test(clean)) {
    clean = 'A ' + clean;
  } else if (/^(chairs|boxes|items|supplies|people|passengers|workers|vehicles|cars|boats|shelves)\s+/i.test(clean)) {
    clean = clean.charAt(0).toUpperCase() + clean.slice(1);
  }

  // Ensure first character is capitalized
  if (clean.length > 0) {
    clean = clean.charAt(0).toUpperCase() + clean.slice(1);
  }

  return clean;
}

module.exports = {
  VOCAB_DICTIONARY,
  extractVocabFromStatements,
  formatPart1Statement
};
