// BANK OF AUTHENTIC, DISTINCT TOEIC PART 2 QUESTION-RESPONSE SCENARIOS
// 12 Types: Who, When, Where, Why, What, How, Be/Do/Have, Modal Verbs, Choice, Tag, Negative, Statement

const part2ComprehensiveBank = [
  // 1. Câu hỏi WHO
  {
    id: "p2_01",
    type: "Who",
    question: "Who will be leading the orientation session for new hires?",
    options: [
      { label: "(A)", text: "Ms. Ramirez from the Human Resources department.", isCorrect: true },
      { label: "(B)", text: "Yes, I attended the session yesterday.", isCorrect: false },
      { label: "(C)", text: "In Conference Room B on the second floor.", isCorrect: false }
    ],
    transQ: "Ai sẽ là người dẫn dắt buổi định hướng cho nhân viên mới?",
    transA: "Cô Ramirez từ phòng Nhân sự.",
    exp: "Câu hỏi 'Who' hỏi về người -> Đáp án (A) trả lời đích danh tên người và phòng ban. Bẫy: (B) dùng Yes/No cho câu hỏi WH-, (C) trả lời về địa điểm."
  },
  {
    id: "p2_02",
    type: "Who",
    question: "Who should I contact to request an ergonomic office chair?",
    options: [
      { label: "(A)", text: "Submit a request to the facilities manager.", isCorrect: true },
      { label: "(B)", text: "The chair is very comfortable.", isCorrect: false },
      { label: "(C)", text: "No later than five o'clock.", isCorrect: false }
    ],
    transQ: "Tôi nên liên hệ ai để yêu cầu một chiếc ghế văn phòng công thái học?",
    transA: "Hãy gửi yêu cầu đến quản lý cơ sở vật chất.",
    exp: "Đáp án (A) chỉ ra đúng người phụ trách (facilities manager)."
  },

  // 2. Câu hỏi WHEN
  {
    id: "p2_03",
    type: "When",
    question: "When is the deadline for submitting our expense reimbursement receipts?",
    options: [
      { label: "(A)", text: "By Friday at the end of business hours.", isCorrect: true },
      { label: "(B)", text: "It cost around three hundred dollars.", isCorrect: false },
      { label: "(C)", text: "The finance team reviewed it.", isCorrect: false }
    ],
    transQ: "Khi nào là hạn chót nộp hóa đơn hoàn trả chi phí?",
    transA: "Trước chiều thứ Sáu khi hết giờ làm việc.",
    exp: "Câu hỏi 'When' hỏi về mốc thời gian -> 'By Friday at the end of business hours'."
  },
  {
    id: "p2_04",
    type: "When",
    question: "When will the quarterly revenue report be released to shareholders?",
    options: [
      { label: "(A)", text: "Early next month after the board meeting.", isCorrect: true },
      { label: "(B)", text: "The sales numbers increased by ten percent.", isCorrect: false },
      { label: "(C)", text: "Yes, I read the entire document.", isCorrect: false }
    ],
    transQ: "Khi nào báo cáo doanh thu quý sẽ được công bố cho các cổ đông?",
    transA: "Đầu tháng tới sau cuộc họp hội đồng quản trị.",
    exp: "Thời gian: 'Early next month'."
  },

  // 3. Câu hỏi WHERE
  {
    id: "p2_05",
    type: "Where",
    question: "Where did you leave the extra keys to the supply storage closet?",
    options: [
      { label: "(A)", text: "In the top drawer of the reception desk.", isCorrect: true },
      { label: "(B)", text: "We ordered new office supplies.", isCorrect: false },
      { label: "(C)", text: "Because the closet was locked.", isCorrect: false }
    ],
    transQ: "Bạn đã để chìa khóa dự phòng của tủ chứa đồ ở đâu?",
    transA: "Ở ngăn kéo trên cùng của bàn lễ tân.",
    exp: "Vị trí địa điểm: 'In the top drawer of the reception desk'."
  },

  // 4. Câu hỏi WHY
  {
    id: "p2_06",
    type: "Why",
    question: "Why has the scheduled server maintenance been postponed?",
    options: [
      { label: "(A)", text: "Because the IT team is still awaiting replacement hardware.", isCorrect: true },
      { label: "(B)", text: "The server is located in the basement.", isCorrect: false },
      { label: "(C)", text: "Every weekend starting at midnight.", isCorrect: false }
    ],
    transQ: "Tại sao lịch bảo trì máy chủ lại bị hoãn?",
    transA: "Bởi vì đội ngũ IT vẫn đang chờ linh kiện phần cứng thay thế.",
    exp: "Nguyên nhân 'Because...' giải thích lý do trì hoãn."
  },

  // 5. Câu hỏi HOW
  {
    id: "p2_07",
    type: "How",
    question: "How do I connect my tablet to the wireless office network?",
    options: [
      { label: "(A)", text: "Select 'Guest_WiFi' and enter your employee ID.", isCorrect: true },
      { label: "(B)", text: "The signal is very fast today.", isCorrect: false },
      { label: "(C)", text: "About fifteen minutes ago.", isCorrect: false }
    ],
    transQ: "Làm thế nào để tôi kết nối máy tính bảng vào mạng không dây của văn phòng?",
    transA: "Hãy chọn mạng 'Guest_WiFi' và nhập mã số nhân viên của bạn.",
    exp: "Hướng dẫn cách thức kết nối mạng."
  },

  // 6. Câu hỏi LỰA CHỌN (OR)
  {
    id: "p2_08",
    type: "Choice",
    question: "Would you prefer to review the contract proposal now or after lunch?",
    options: [
      { label: "(A)", text: "Let's go over it after we eat.", isCorrect: true },
      { label: "(B)", text: "Yes, the contract was signed.", isCorrect: false },
      { label: "(C)", text: "At the Italian restaurant across the street.", isCorrect: false }
    ],
    transQ: "Bạn muốn xem xét đề xuất hợp đồng bây giờ hay sau bữa trưa?",
    transA: "Hãy cùng xem qua sau khi chúng ta ăn xong.",
    exp: "Câu hỏi lựa chọn 'now or after lunch' -> Chọn 'after we eat'. Tuyệt đối không dùng Yes/No."
  },

  // 7. Câu hỏi TRẦN THUẬT / KHẲNG ĐỊNH
  {
    id: "p2_09",
    type: "Statement",
    question: "The keynote speaker for tomorrow's seminar just canceled his flight.",
    options: [
      { label: "(A)", text: "Oh no, we need to find an emergency replacement.", isCorrect: true },
      { label: "(B)", text: "He spoke very clearly.", isCorrect: false },
      { label: "(C)", text: "Ticket prices start at fifty dollars.", isCorrect: false }
    ],
    transQ: "Diễn giả chính cho buổi hội thảo ngày mai vừa mới hủy chuyến bay.",
    transA: "Ôi không, chúng ta cần phải tìm người thay thế khẩn cấp.",
    exp: "Câu trần thuật thông báo tình huống bất ngờ -> Phản xạ đối thoại tương ứng giải quyết vấn đề."
  },

  // 8. Câu hỏi BE / DO / HAVE
  {
    id: "p2_10",
    type: "BeDoHave",
    question: "Have all the invitations for the annual gala been mailed out?",
    options: [
      { label: "(A)", text: "Yes, the postal courier picked them up this morning.", isCorrect: true },
      { label: "(B)", text: "The event is formal dress only.", isCorrect: false },
      { label: "(C)", text: "At the grand ballroom downtown.", isCorrect: false }
    ],
    transQ: "Tất cả thư mời cho đêm tiệc thường niên đã được gửi đi chưa?",
    transA: "Rồi, nhân viên bưu tá đã đến lấy vào sáng nay.",
    exp: "Câu hỏi Yes/No với thì hiện tại hoàn thành -> Xác nhận bưu tá đã lấy thư."
  }
];

module.exports = part2ComprehensiveBank;
