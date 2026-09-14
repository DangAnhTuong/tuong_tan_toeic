// BANK OF AUTHENTIC, DISTINCT TOEIC PART 1 PHOTO QUESTIONS WITH 4 EXPLICIT STATEMENTS EACH
// Grouped into Difficulty Levels: Level 1 (Dễ), Level 2 (Cơ bản), Level 3 (Trung bình), Level 4 (Khó), Level 5 (Rất khó)

const part1ComprehensiveBank = [
  // --- LEVEL 1: DỄ (Hành động trực diện 1 người, động tác rõ ràng) ---
  {
    id: "p1_lvl1_01",
    level: 1,
    topic: "Văn phòng",
    img: "https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&w=800&q=80",
    options: [
      { label: "(A)", text: "A woman is writing notes on a sheet of paper.", isCorrect: true },
      { label: "(B)", text: "A woman is plugging a cable into a computer.", isCorrect: false },
      { label: "(C)", text: "A woman is closing a window in the office.", isCorrect: false },
      { label: "(D)", text: "A woman is hanging a painting on the wall.", isCorrect: false }
    ],
    trans: "Người phụ nữ đang ghi chú trên một tờ giấy.",
    exp: "Bẫy thường gặp: Hành động 'writing' rất rõ ràng ở bàn tay. Các đáp án B, C, D đều miêu tả hành động không hề xuất hiện trong ảnh."
  },
  {
    id: "p1_lvl1_02",
    level: 1,
    topic: "Giao thông & Tàu xe",
    img: "https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=800&q=80",
    options: [
      { label: "(A)", text: "A passenger is checking his smartphone while seated on a train.", isCorrect: true },
      { label: "(B)", text: "A passenger is standing in line to buy a ticket.", isCorrect: false },
      { label: "(C)", text: "A conductor is inspecting travel passes.", isCorrect: false },
      { label: "(D)", text: "A man is putting his luggage into an overhead compartment.", isCorrect: false }
    ],
    trans: "Hành khách đang kiểm tra điện thoại thông minh khi đang ngồi trên tàu.",
    exp: "Trọng tâm: 'seated on a train' và 'checking smartphone'. Đáp án B sai vì người đàn ông đang ngồi, không phải đứng xếp hàng (standing in line)."
  },
  {
    id: "p1_lvl1_03",
    level: 1,
    topic: "Nhà hàng & Cà phê",
    img: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=800&q=80",
    options: [
      { label: "(A)", text: "A waiter is placing drinking glasses on a restaurant table.", isCorrect: true },
      { label: "(B)", text: "A chef is cooking food over an open flame.", isCorrect: false },
      { label: "(C)", text: "Customers are paying their bills at the cash register.", isCorrect: false },
      { label: "(D)", text: "Chairs are being stacked in the corner.", isCorrect: false }
    ],
    trans: "Người phục vụ đang đặt những chiếc ly uống nước lên bàn nhà hàng.",
    exp: "Chủ ngữ 'waiter' và hành động 'placing glasses' là chính xác nhất. Không có đầu bếp (chef) hay quầy thu ngân (cash register)."
  },
  {
    id: "p1_lvl1_04",
    level: 1,
    topic: "Kho bãi & Giao nhận",
    img: "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=800&q=80",
    options: [
      { label: "(A)", text: "Cardboard boxes are stacked on a wooden pallet.", isCorrect: true },
      { label: "(B)", text: "Workers are assembling furniture in a workshop.", isCorrect: false },
      { label: "(C)", text: "A truck is backing into a loading dock.", isCorrect: false },
      { label: "(D)", text: "Packages are being loaded onto a conveyor belt.", isCorrect: false }
    ],
    trans: "Các thùng bìa carton được xếp chồng trên một tấm pallet gỗ.",
    exp: "Dạng câu mô tả vật thể tĩnh (Passive/State): 'Cardboard boxes are stacked on a wooden pallet'."
  },
  {
    id: "p1_lvl1_05",
    level: 1,
    topic: "Phòng thí nghiệm & Y tế",
    img: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=800&q=80",
    options: [
      { label: "(A)", text: "A technician is examining equipment in a laboratory.", isCorrect: true },
      { label: "(B)", text: "A doctor is speaking to a patient in an exam room.", isCorrect: false },
      { label: "(C)", text: "Medication is being dispensed at a pharmacy.", isCorrect: false },
      { label: "(D)", text: "Scientific journals are displayed on a bookshelf.", isCorrect: false }
    ],
    trans: "Kỹ thuật viên đang kiểm tra thiết bị trong phòng thí nghiệm.",
    exp: "Từ khóa 'examining equipment' mô tả đúng nhất hành động của nhân vật đang tập trung vào máy móc."
  },
  {
    id: "p1_lvl1_06",
    level: 1,
    topic: "Cửa hàng bán lẻ",
    img: "https://images.unsplash.com/photo-1555529669-e69e7aa0ba9a?auto=format&fit=crop&w=800&q=80",
    options: [
      { label: "(A)", text: "A shopper is browsing garments on a clothing rack.", isCorrect: true },
      { label: "(B)", text: "A cashier is counting money at the register.", isCorrect: false },
      { label: "(C)", text: "Clothes are being packed into shipping boxes.", isCorrect: false },
      { label: "(D)", text: "A store employee is sweeping the floor.", isCorrect: false }
    ],
    trans: "Người mua hàng đang xem quần áo trên giá treo đồ.",
    exp: "'Browsing garments' (xem qua các bộ quần áo) là cụm từ kinh điển trong TOEIC Part 1."
  },
  {
    id: "p1_lvl1_07",
    level: 1,
    topic: "Sân bay & Du lịch",
    img: "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&w=800&q=80",
    options: [
      { label: "(A)", text: "Travelers are pulling wheeled suitcases through an airport concourse.", isCorrect: true },
      { label: "(B)", text: "Passengers are boarding an aircraft via the staircase.", isCorrect: false },
      { label: "(C)", text: "An airplane is being refueled on the runway.", isCorrect: false },
      { label: "(D)", text: "Luggage is revolving on a baggage carousel.", isCorrect: false }
    ],
    trans: "Du khách đang kéo vali có bánh xe qua sảnh lớn sân bay.",
    exp: "Động từ 'pulling wheeled suitcases' miêu tả chuẩn xác hành động đi lại cùng hành lý."
  },
  {
    id: "p1_lvl1_08",
    level: 1,
    topic: "Công trường xây dựng",
    img: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=800&q=80",
    options: [
      { label: "(A)", text: "Construction workers are wearing safety helmets and reflective vests.", isCorrect: true },
      { label: "(B)", text: "A brick wall is being demolished by a bulldozer.", isCorrect: false },
      { label: "(C)", text: "Workers are climbing down a tall wooden ladder.", isCorrect: false },
      { label: "(D)", text: "Concrete is being poured into a foundation mold.", isCorrect: false }
    ],
    trans: "Các công nhân xây dựng đang đội mũ bảo hộ và mặc áo phản quang.",
    exp: "Đặc điểm nhận dạng trang phục: 'safety helmets' (mũ bảo hộ) và 'reflective vests' (áo phản quang)."
  },
  {
    id: "p1_lvl1_09",
    level: 1,
    topic: "Hội thảo & Họp",
    img: "https://images.unsplash.com/photo-1515187029135-18ee286d815b?auto=format&fit=crop&w=800&q=80",
    options: [
      { label: "(A)", text: "A speaker is gesturing with her hands during a presentation.", isCorrect: true },
      { label: "(B)", text: "Audience members are exiting the conference auditorium.", isCorrect: false },
      { label: "(C)", text: "Microphones are being distributed to attendees.", isCorrect: false },
      { label: "(D)", text: "Projector slides are being printed on a copier.", isCorrect: false }
    ],
    trans: "Người diễn giả đang dùng cử chỉ tay trong khi thuyết trình.",
    exp: "Hành động 'gesturing with hands' (ra hiệu bằng tay) khi đang nói trước hội trường."
  },
  {
    id: "p1_lvl1_10",
    level: 1,
    topic: "Văn phòng & Công nghệ",
    img: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=800&q=80",
    options: [
      { label: "(A)", text: "Team members are looking at a shared laptop monitor.", isCorrect: true },
      { label: "(B)", text: "An office worker is answering a landline telephone.", isCorrect: false },
      { label: "(C)", text: "Documents are being shredded in a recycling bin.", isCorrect: false },
      { label: "(D)", text: "Office supplies are being unpacked from boxes.", isCorrect: false }
    ],
    trans: "Các thành viên trong nhóm đang cùng nhìn vào màn hình máy tính xách tay.",
    exp: "Hành động nhiều người: 'looking at a shared laptop monitor'."
  },

  // --- LEVEL 2: CƠ BẢN (Nhiều người tương tác, miêu tả đồ vật xung quanh) ---
  {
    id: "p1_lvl2_01",
    level: 2,
    topic: "Quán cà phê ngoài trời",
    img: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=800&q=80",
    options: [
      { label: "(A)", text: "Patrons are seated under patio umbrellas at an outdoor cafe.", isCorrect: true },
      { label: "(B)", text: "Umbrellas are being folded up due to heavy rain.", isCorrect: false },
      { label: "(C)", text: "A server is handing a printed menu to a customer.", isCorrect: false },
      { label: "(D)", text: "Empty dishes are being cleared from the patio floor.", isCorrect: false }
    ],
    trans: "Thực khách đang ngồi dưới những chiếc dù che tại một quán cà phê ngoài trời.",
    exp: "Từ vựng nâng cao: 'Patrons' (thực khách), 'patio umbrellas' (dù che ngoài trời)."
  },
  {
    id: "p1_lvl2_02",
    level: 2,
    topic: "Thư viện & Sách",
    img: "https://images.unsplash.com/photo-1521587760476-6c12a4b040da?auto=format&fit=crop&w=800&q=80",
    options: [
      { label: "(A)", text: "Books are arranged neatly in rows along the library shelves.", isCorrect: true },
      { label: "(B)", text: "A student is returning a stack of books to the circulation desk.", isCorrect: false },
      { label: "(C)", text: "A librarian is stamping due dates inside book covers.", isCorrect: false },
      { label: "(D)", text: "Study desks have been moved into the corridor.", isCorrect: false }
    ],
    trans: "Những cuốn sách được xếp gọn gàng thành từng hàng dọc theo các kệ thư viện.",
    exp: "Miêu tả trạng thái tĩnh: 'Books are arranged neatly in rows'."
  },
  {
    id: "p1_lvl2_03",
    level: 2,
    topic: "Kho bãi & Xe nâng",
    img: "https://images.unsplash.com/photo-1580674684081-7617fbf3d745?auto=format&fit=crop&w=800&q=80",
    options: [
      { label: "(A)", text: "A motorized forklift is transporting wooden crates across the warehouse.", isCorrect: true },
      { label: "(B)", text: "A mechanic is replacing the tire on an industrial vehicle.", isCorrect: false },
      { label: "(C)", text: "Storage racks are being dismantled by maintenance staff.", isCorrect: false },
      { label: "(D)", text: "A driver is stepping down from the truck cabin.", isCorrect: false }
    ],
    trans: "Xe nâng cơ giới đang vận chuyển các thùng gỗ qua sàn nhà kho.",
    exp: "'Motorized forklift' (xe nâng chạy động cơ) và 'transporting wooden crates' (vận chuyển thùng gỗ)."
  },
  {
    id: "p1_lvl2_04",
    level: 2,
    topic: "Bệnh viện & Chăm sóc sức khỏe",
    img: "https://images.unsplash.com/photo-1505751172876-fa1923c5c528?auto=format&fit=crop&w=800&q=80",
    options: [
      { label: "(A)", text: "A healthcare professional is consulting a medical record clipboard.", isCorrect: true },
      { label: "(B)", text: "A patient is being transported in a wheelchair.", isCorrect: false },
      { label: "(C)", text: "Medical supplies are being unpacked from cardboard boxes.", isCorrect: false },
      { label: "(D)", text: "A doctor is examining an X-ray on an illuminated screen.", isCorrect: false }
    ],
    trans: "Nhân viên y tế đang tham khảo bảng kẹp hồ sơ bệnh án.",
    exp: "'Healthcare professional' (nhân viên y tế) và 'consulting a medical record clipboard' (xem hồ sơ kẹp tài liệu)."
  },
  {
    id: "p1_lvl2_05",
    level: 2,
    topic: "Công viên & Không gian xanh",
    img: "https://images.unsplash.com/photo-1519331379826-f10be5486c6f?auto=format&fit=crop&w=800&q=80",
    options: [
      { label: "(A)", text: "Pedestrians are strolling along a paved walkway through a public park.", isCorrect: true },
      { label: "(B)", text: "Park benches are being painted by city workers.", isCorrect: false },
      { label: "(C)", text: "A gardener is trimming tree branches with shears.", isCorrect: false },
      { label: "(D)", text: "Bicycles are chained to a metal bike rack.", isCorrect: false }
    ],
    trans: "Người đi bộ đang tản bộ dọc theo lối đi lát đá qua công viên công cộng.",
    exp: "Cụm 'strolling along a paved walkway' (đi dạo trên đường lát đá)."
  },

  // --- LEVEL 3: TRUNG BÌNH (Dạng bị động, bẫy từ đồng âm, bẫy chi tiết phụ) ---
  {
    id: "p1_lvl3_01",
    level: 3,
    topic: "Phòng họp doanh nghiệp",
    img: "https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&w=800&q=80",
    options: [
      { label: "(A)", text: "Meeting participants have gathered around a long conference table.", isCorrect: true },
      { label: "(B)", text: "A whiteboard is being erased by the team leader.", isCorrect: false },
      { label: "(C)", text: "Conference attendees are standing in line for refreshments.", isCorrect: false },
      { label: "(D)", text: "Handouts are being shredded in an office machine.", isCorrect: false }
    ],
    trans: "Các thành viên tham gia cuộc họp đã tập trung quanh chiếc bàn hội nghị dài.",
    exp: "Thì hiện tại hoàn thành mô tả kết quả của trạng thái: 'have gathered around a conference table'."
  },
  {
    id: "p1_lvl3_02",
    level: 3,
    topic: "Bến cảng & Vận tải biển",
    img: "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=800&q=80",
    options: [
      { label: "(A)", text: "Cargo containers have been stacked in neat columns near the water.", isCorrect: true },
      { label: "(B)", text: "A large cargo ship is being unloaded by dockworkers.", isCorrect: false },
      { label: "(C)", text: "Cranes are actively lifting shipping crates onto a barge.", isCorrect: false },
      { label: "(D)", text: "Trucks are queuing up to enter the shipping terminal.", isCorrect: false }
    ],
    trans: "Các thùng container chở hàng đã được xếp chồng thành các cột gọn gàng gần mép nước.",
    exp: "Bẫy 'being unloaded' (đang được bốc dỡ) là sai vì tàu đang tĩnh, đáp án đúng là 'have been stacked'."
  },
  {
    id: "p1_lvl3_03",
    level: 3,
    topic: "Siêu thị & Cửa hàng thực phẩm",
    img: "https://images.unsplash.com/photo-1578916171728-46686eac8d58?auto=format&fit=crop&w=800&q=80",
    options: [
      { label: "(A)", text: "Fresh produce is organized in wooden display crates at a grocery market.", isCorrect: true },
      { label: "(B)", text: "A shopper is weighing vegetables on a digital hanging scale.", isCorrect: false },
      { label: "(C)", text: "Store clerks are restocking empty shelves with canned goods.", isCorrect: false },
      { label: "(D)", text: "Price tags are being printed at the customer service desk.", isCorrect: false }
    ],
    trans: "Nông sản tươi được sắp xếp trong các thùng gỗ trưng bày tại chợ thực phẩm.",
    exp: "Từ 'produce' ở đây là danh từ không đếm được mang nghĩa 'nông sản tươi sống' (rau củ quả)."
  },

  // --- LEVEL 4 & 5: KHÓ & RẤT KHÓ (Bẫy ngữ pháp Being V-ed vs Have been V-ed, bẫy góc nhìn) ---
  {
    id: "p1_lvl4_01",
    level: 4,
    topic: "Kiến trúc & Cảnh quan đô thị",
    img: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=800&q=80",
    options: [
      { label: "(A)", text: "Reflective glass panels line the exterior facade of a modern skyscraper.", isCorrect: true },
      { label: "(B)", text: "Window cleaners are suspended from the top of the high-rise tower.", isCorrect: false },
      { label: "(C)", text: "Construction scaffolding is being erected around the building base.", isCorrect: false },
      { label: "(D)", text: "Pedestrians are waiting at a traffic signal beneath the overpass.", isCorrect: false }
    ],
    trans: "Các tấm kính phản quang trải dọc mặt tiền bên ngoài của tòa nhà chọc trời hiện đại.",
    exp: "Mức độ từ vựng cao cấp: 'Reflective glass panels', 'exterior facade', 'skyscraper'."
  },
  {
    id: "p1_lvl5_01",
    level: 5,
    topic: "Phòng trưng bày nghệ thuật & Bảo tàng",
    img: "https://images.unsplash.com/photo-1565008447742-97f6f38c985c?auto=format&fit=crop&w=800&q=80",
    options: [
      { label: "(A)", text: "Framed artwork is illuminated by directional spotlights in an exhibition gallery.", isCorrect: true },
      { label: "(B)", text: "A tour guide is lecturing visitors in front of a sculpture.", isCorrect: false },
      { label: "(C)", text: "Canvases are being restored by preservation specialists.", isCorrect: false },
      { label: "(D)", text: "Admission tickets are being verified at the gallery turnstile.", isCorrect: false }
    ],
    trans: "Các tác phẩm nghệ thuật đóng khung được chiếu sáng bởi đèn rọi định hướng trong phòng trưng bày triển lãm.",
    exp: "Cấu trúc Level 5: Miêu tả ánh sáng và không gian trưng bày trừu tượng 'illuminated by directional spotlights'."
  }
];

module.exports = part1ComprehensiveBank;
