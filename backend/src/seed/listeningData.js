const seedListeningData = [
  // --- LEVEL PRACTICE (PART 1 - LEVEL 1 - DỄ) ---
  {
    title: "Level 1 — Dễ",
    part: 1,
    level: 1,
    mode: "level",
    errorRate: "1% - 14%",
    isPro: false,
    totalQuestions: 4,
    questions: [
      {
        questionNumber: 1,
        audioUrl: "https://speech-samples.s3.amazonaws.com/toeic_p1_q1.mp3",
        imageUrl: "https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&w=800&q=80",
        promptText: "Select the one statement that best describes what you see in the picture.",
        options: [
          { label: "(A)", text: "The woman is writing on a paper.", isCorrect: true },
          { label: "(B)", text: "The woman is typing on a laptop.", isCorrect: false },
          { label: "(C)", text: "The woman is opening a window.", isCorrect: false },
          { label: "(D)", text: "The woman is serving a meal.", isCorrect: false }
        ],
        transcript: "The woman is writing on a paper.",
        translation: "Người phụ nữ đang ghi chép trên tờ giấy.",
        dictationText: "The woman is writing on a paper.",
        blanks: [
          { word: "woman", index: 1 },
          { word: "writing", index: 3 },
          { word: "paper", index: 6 }
        ],
        explanation: "Trong hình ảnh, người phụ nữ đang cầm bút viết lên một tài liệu trên bàn.",
        vocabularyList: [
          { word: "write", phonetic: "/raɪt/", pos: "verb", meaning: "Viết, ghi chép", example: "She is writing a letter." },
          { word: "paper", phonetic: "/ˈpeɪ.pɚ/", pos: "noun", meaning: "Tờ giấy, tài liệu", example: "Sign the paper please." }
        ]
      },
      {
        questionNumber: 2,
        audioUrl: "https://speech-samples.s3.amazonaws.com/toeic_p1_q2.mp3",
        imageUrl: "https://images.unsplash.com/photo-1556910103-1c02745aae4d?auto=format&fit=crop&w=800&q=80",
        promptText: "Select the one statement that best describes what you see in the picture.",
        options: [
          { label: "(A)", text: "The woman is carrying a tray of food.", isCorrect: true },
          { label: "(B)", text: "The woman is washing dishes in the sink.", isCorrect: false },
          { label: "(C)", text: "The woman is sitting on a chair.", isCorrect: false },
          { label: "(D)", text: "The woman is cleaning the table.", isCorrect: false }
        ],
        transcript: "The woman is carrying a tray of food.",
        translation: "Người phụ nữ đang bưng một khay thức ăn.",
        dictationText: "The woman is carrying a tray of food.",
        blanks: [
          { word: "carrying", index: 3 },
          { word: "tray", index: 5 },
          { word: "food", index: 7 }
        ],
        explanation: "Người phụ nữ đang bưng khay đồ ăn di chuyển trong căn bếp.",
        vocabularyList: [
          { word: "carry", phonetic: "/ˈkær.i/", pos: "verb", meaning: "Bưng, bê, mang", example: "He carries a heavy box." },
          { word: "tray", phonetic: "/treɪ/", pos: "noun", meaning: "Khay, mâm", example: "A tray of food." }
        ]
      },
      {
        questionNumber: 3,
        audioUrl: "https://speech-samples.s3.amazonaws.com/toeic_p1_q3.mp3",
        imageUrl: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=800&q=80",
        promptText: "Select the one statement that best describes what you see in the picture.",
        options: [
          { label: "(A)", text: "The woman is standing near a whiteboard.", isCorrect: false },
          { label: "(B)", text: "The woman is adjusting her glasses.", isCorrect: false },
          { label: "(C)", text: "The woman is looking at a computer screen.", isCorrect: true },
          { label: "(D)", text: "The woman is talking on the phone.", isCorrect: false }
        ],
        transcript: "The woman is looking at a computer screen.",
        translation: "Người phụ nữ đang nhìn vào màn hình máy tính.",
        dictationText: "The woman is looking at a computer screen.",
        blanks: [
          { word: "looking", index: 3 },
          { word: "computer", index: 6 },
          { word: "screen", index: 7 }
        ],
        explanation: "Hành động chính của người phụ nữ trong ảnh là chăm chú nhìn màn hình làm việc.",
        vocabularyList: [
          { word: "screen", phonetic: "/skriːn/", pos: "noun", meaning: "Màn hình", example: "Look at the screen." }
        ]
      },
      {
        questionNumber: 4,
        audioUrl: "https://speech-samples.s3.amazonaws.com/toeic_p1_q4.mp3",
        imageUrl: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=800&q=80",
        promptText: "Select the one statement that best describes what you see in the picture.",
        options: [
          { label: "(A)", text: "The woman is removing her hat.", isCorrect: true },
          { label: "(B)", text: "The woman is buying a coat.", isCorrect: false },
          { label: "(C)", text: "The woman is combing her hair.", isCorrect: false },
          { label: "(D)", text: "The woman is holding an umbrella.", isCorrect: false }
        ],
        transcript: "The woman is removing her hat.",
        translation: "Người phụ nữ đang cởi mũ.",
        dictationText: "The woman is removing her hat.",
        blanks: [
          { word: "removing", index: 3 },
          { word: "hat", index: 5 }
        ],
        explanation: "Người phụ nữ tay đang đưa lên cởi chiếc chiếc chiếc chiếc nón/mũ ra.",
        vocabularyList: [
          { word: "remove", phonetic: "/rɪˈmuːv/", pos: "verb", meaning: "Cởi ra, tháo ra", example: "Please remove your shoes." }
        ]
      }
    ]
  },

  // --- LEVEL PRACTICE (PART 1 - LEVEL 2 - CƠ BẢN) ---
  {
    title: "Level 2 — Cơ bản",
    part: 1,
    level: 2,
    mode: "level",
    errorRate: "14% - 21%",
    isPro: false,
    totalQuestions: 4,
    questions: [
      {
        questionNumber: 1,
        audioUrl: "https://speech-samples.s3.amazonaws.com/toeic_p1_lvl2_q1.mp3",
        imageUrl: "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=800&q=80",
        promptText: "Select the one statement that best describes what you see in the picture.",
        options: [
          { label: "(A)", text: "They are having a business meeting.", isCorrect: true },
          { label: "(B)", text: "They are eating in a cafeteria.", isCorrect: false },
          { label: "(C)", text: "They are painting a office wall.", isCorrect: false },
          { label: "(D)", text: "They are leaving the building.", isCorrect: false }
        ],
        transcript: "They are having a business meeting.",
        translation: "Họ đang có một cuộc họp kinh doanh.",
        dictationText: "They are having a business meeting.",
        blanks: [
          { word: "business", index: 4 },
          { word: "meeting", index: 5 }
        ],
        explanation: "Hình ảnh một nhóm người ngồi quanh bàn họp văn phòng.",
        vocabularyList: [
          { word: "meeting", phonetic: "/ˈmiː.tɪŋ/", pos: "noun", meaning: "Cuộc họp", example: "An important meeting." }
        ]
      }
    ]
  },

  // --- DICTATION MODE (TEST 1 2026 - PART 1) ---
  {
    title: "TEST 1 2026",
    part: 1,
    level: 1,
    mode: "dictation",
    year: "2026",
    isPro: false,
    totalQuestions: 4,
    questions: [
      {
        questionNumber: 1,
        audioUrl: "https://speech-samples.s3.amazonaws.com/toeic_p1_q1.mp3",
        imageUrl: "https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&w=800&q=80",
        promptText: "Nghe và điền từ còn thiếu vào ô trống.",
        options: [],
        transcript: "The woman is writing on a paper.",
        translation: "Người phụ nữ đang ghi chép trên tờ giấy.",
        dictationText: "The woman is writing on a paper.",
        blanks: [
          { word: "woman", index: 1 },
          { word: "writing", index: 3 },
          { word: "paper", index: 6 }
        ],
        explanation: "Nghe kỹ âm /'raɪtɪŋ/ và /'peɪpər/.",
        vocabularyList: []
      },
      {
        questionNumber: 2,
        audioUrl: "https://speech-samples.s3.amazonaws.com/toeic_p1_q2.mp3",
        imageUrl: "https://images.unsplash.com/photo-1556910103-1c02745aae4d?auto=format&fit=crop&w=800&q=80",
        promptText: "Nghe và điền từ còn thiếu vào ô trống.",
        options: [],
        transcript: "The woman is carrying a tray of food.",
        translation: "Người phụ nữ đang bưng một khay thức ăn.",
        dictationText: "The woman is carrying a tray of food.",
        blanks: [
          { word: "carrying", index: 3 },
          { word: "tray", index: 5 },
          { word: "food", index: 7 }
        ],
        explanation: "Chú ý từ 'tray' (/treɪ/) và 'food' (/fuːd/).",
        vocabularyList: []
      }
    ]
  },

  // --- TOPIC LISTENING MODE (CANTEEN MANAGEMENT & OTHERS) ---
  {
    title: "Canteen Management Enhancements",
    part: 3,
    level: 3,
    mode: "topic",
    topic: "Canteen Management",
    isPro: false,
    totalQuestions: 3,
    questions: [
      {
        questionNumber: 1,
        audioUrl: "https://speech-samples.s3.amazonaws.com/toeic_p3_topic1.mp3",
        imageUrl: "",
        promptText: "What are the speakers mainly discussing?",
        options: [
          { label: "(A)", text: "Upgrading the office canteen menu.", isCorrect: true },
          { label: "(B)", text: "Hiring new security staff.", isCorrect: false },
          { label: "(C)", text: "Changing working hours.", isCorrect: false },
          { label: "(D)", text: "Fixing a broken printer.", isCorrect: false }
        ],
        transcript: "Hello Mark, have you seen the new healthy options added to our canteen menu this week?",
        translation: "Chào Mark, bạn đã thấy các lựa chọn ăn uống lành mạnh mới được thêm vào thực đơn căn tin tuần này chưa?",
        dictationText: "Hello Mark, have you seen the new healthy options added to our canteen menu this week?",
        blanks: [
          { word: "healthy", index: 7 },
          { word: "canteen", index: 11 },
          { word: "menu", index: 12 }
        ],
        explanation: "Cuộc hội thoại tập trung vào cải tiến thực đơn ăn uống ở canteen.",
        vocabularyList: [
          { word: "canteen", phonetic: "/kænˈtiːn/", pos: "noun", meaning: "Căng tin, nhà ăn công ty", example: "Let's eat at the canteen." }
        ]
      }
    ]
  }
];

module.exports = seedListeningData;
