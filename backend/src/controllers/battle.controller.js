const User = require('../models/User');
const ReadingExercise = require('../models/ReadingExercise');

// Backup curated question bank (20 high-paced Part 5 questions)
const battleQuestionBank = [
  {
    id: 'bt-1',
    part: 5,
    promptText: 'Ms. Jenkins was ______ promoted to senior marketing director due to her outstanding quarterly sales performance.',
    options: ['recent', 'recently', 'more recent', 'recency'],
    correctAnswer: 'B',
    explanation: 'Cần một trạng từ (recently) để bổ nghĩa cho động từ phân từ "promoted".',
    translation: 'Cô Jenkins gần đây đã được thăng chức lên giám đốc tiếp thị cấp cao nhờ thành tích bán hàng xuất sắc.'
  },
  {
    id: 'bt-2',
    part: 5,
    promptText: 'All employees are required to submit their annual expense reports ______ Friday at 5:00 PM.',
    options: ['until', 'by', 'during', 'between'],
    correctAnswer: 'B',
    explanation: '"By" dùng để chỉ hạn chót (deadline) - trước hoặc đúng thời điểm thứ Sáu lúc 5:00 PM.',
    translation: 'Tất cả nhân viên được yêu cầu nộp báo cáo chi phí hàng năm trước 5:00 chiều thứ Sáu.'
  },
  {
    id: 'bt-3',
    part: 5,
    promptText: 'The new aerodynamic design makes the vehicle significantly more ______ than previous hybrid models.',
    options: ['economy', 'economical', 'economize', 'economics'],
    correctAnswer: 'B',
    explanation: 'Cấu trúc "more + adj" (so sánh hơn), cần tính từ "economical" (tiết kiệm nhiên liệu/chi phí).',
    translation: 'Thiết kế khí động học mới làm cho chiếc xe tiết kiệm nhiên liệu hơn đáng kể so với các mẫu hybrid trước đây.'
  },
  {
    id: 'bt-4',
    part: 5,
    promptText: 'Please review the attached contract carefully ______ signing the final agreement.',
    options: ['before', 'whereas', 'unless', 'despite'],
    correctAnswer: 'A',
    explanation: '"Before + V-ing" (Trước khi ký thỏa thuận cuối cùng) chỉ trình tự thời gian logic.',
    translation: 'Vui lòng xem lại kỹ hợp đồng đính kèm trước khi ký kết thỏa thuận cuối cùng.'
  },
  {
    id: 'bt-5',
    part: 5,
    promptText: 'The warranty covers the replacement of defective parts, ______ labor costs are not included.',
    options: ['or', 'so', 'but', 'because'],
    correctAnswer: 'C',
    explanation: 'Liên từ đẳng lập "but" dùng để nối 2 vế câu mang nghĩa tương phản.',
    translation: 'Bảo hành bao gồm việc thay thế các bộ phận bị lỗi, nhưng chi phí nhân công không được bao gồm.'
  },
  {
    id: 'bt-6',
    part: 5,
    promptText: 'Neither the project manager ______ the team members were aware of the sudden schedule change.',
    options: ['or', 'nor', 'and', 'also'],
    correctAnswer: 'B',
    explanation: 'Cặp liên từ tương quan: "Neither... nor..." (Cả quản lý lẫn các thành viên đều không biết).',
    translation: 'Cả quản lý dự án lẫn các thành viên trong nhóm đều không biết về sự thay đổi lịch trình đột ngột.'
  },
  {
    id: 'bt-7',
    part: 5,
    promptText: 'Participants in the leadership workshop gave ______ feedback regarding the keynote speaker.',
    options: ['enthusiasm', 'enthusiastic', 'enthusiastically', 'enthuse'],
    correctAnswer: 'B',
    explanation: 'Cần tính từ "enthusiastic" bổ nghĩa cho danh từ "feedback" (phản hồi nhiệt tình).',
    translation: 'Những người tham gia hội thảo lãnh đạo đã đưa ra phản hồi nhiệt tình về diễn giả chính.'
  },
  {
    id: 'bt-8',
    part: 5,
    promptText: 'To ensure timely delivery, please double-check your shipping address ______ submitting the order.',
    options: ['prior to', 'in addition', 'accordingly', 'instead of'],
    correctAnswer: 'A',
    explanation: '"Prior to + V-ing" đồng nghĩa với "before" (trước khi gửi đơn đặt hàng).',
    translation: 'Để đảm bảo giao hàng kịp thời, vui lòng kiểm tra lại địa chỉ giao hàng của bạn trước khi gửi đơn đặt hàng.'
  },
  {
    id: 'bt-9',
    part: 5,
    promptText: 'The board of directors agreed ______ to the proposed budget increase for the research lab.',
    options: ['unanimous', 'unanimously', 'unanimity', 'unanimousness'],
    correctAnswer: 'B',
    explanation: 'Cần trạng từ "unanimously" (nhất trí đồng thuận) bổ nghĩa cho động từ "agreed".',
    translation: 'Hội đồng quản trị đã nhất trí đồng ý tăng ngân sách đề xuất cho phòng thí nghiệm nghiên cứu.'
  },
  {
    id: 'bt-10',
    part: 5,
    promptText: 'If the equipment ______ malfunction, please contact technical support immediately.',
    options: ['should', 'would', 'will', 'had'],
    correctAnswer: 'A',
    explanation: 'Đảo ngữ câu điều kiện loại 1: "Should + S + V-inf" (Nếu thiết bị có lỡ xảy ra trục trặc...).',
    translation: 'Nếu thiết bị có xảy ra sự cố, vui lòng liên hệ ngay với bộ phận hỗ trợ kỹ thuật.'
  },
  {
    id: 'bt-11',
    part: 5,
    promptText: 'The seminar on renewable energy was ______ attended by industry leaders from across the region.',
    options: ['wide', 'widely', 'widen', 'width'],
    correctAnswer: 'B',
    explanation: 'Cần trạng từ "widely" bổ nghĩa cho phân từ quá khứ "attended" (được tham dự đông đảo).',
    translation: 'Hội thảo về năng lượng tái tạo đã được các nhà lãnh đạo trong ngành từ khắp khu vực tham dự đông đảo.'
  },
  {
    id: 'bt-12',
    part: 5,
    promptText: 'Applicants must possess at least five years of ______ experience in corporate accounting.',
    options: ['relevant', 'relevance', 'relevantly', 'relevancies'],
    correctAnswer: 'A',
    explanation: 'Cần tính từ "relevant" đứng trước danh từ "experience" (kinh nghiệm liên quan).',
    translation: 'Các ứng viên phải có ít nhất 5 năm kinh nghiệm liên quan trong lĩnh vực kế toán doanh nghiệp.'
  },
  {
    id: 'bt-13',
    part: 5,
    promptText: 'The factory supervisor conducts safety inspections ______ to prevent workplace accidents.',
    options: ['period', 'periodic', 'periodically', 'periodical'],
    correctAnswer: 'C',
    explanation: 'Cần trạng từ "periodically" (định kỳ) để bổ nghĩa cho động từ "conducts".',
    translation: 'Giám sát viên nhà máy tiến hành kiểm tra an toàn định kỳ để ngăn ngừa tai nạn lao động.'
  },
  {
    id: 'bt-14',
    part: 5,
    promptText: 'Customer feedback indicates that the upgraded software is much ______ than the previous version.',
    options: ['reliable', 'more reliable', 'most reliable', 'reliability'],
    correctAnswer: 'B',
    explanation: 'Cấu trúc so sánh hơn với "than", dùng "more reliable" (đáng tin cậy hơn).',
    translation: 'Phản hồi từ khách hàng cho thấy phần mềm được nâng cấp đáng tin cậy hơn nhiều so với phiên bản trước.'
  },
  {
    id: 'bt-15',
    part: 5,
    promptText: 'The keynote speaker expressed her ______ for the enthusiastic reception from the audience.',
    options: ['appreciate', 'appreciated', 'appreciation', 'appreciative'],
    correctAnswer: 'C',
    explanation: 'Sau tính từ sở hữu "her", cần danh từ "appreciation" (sự cảm kích, biết ơn).',
    translation: 'Diễn giả chính đã bày tỏ sự cảm kích đối với sự đón tiếp nhiệt tình từ khán giả.'
  },
  {
    id: 'bt-16',
    part: 5,
    promptText: 'Employees are encouraged to submit innovative suggestions ______ the company suggestion box.',
    options: ['via', 'amid', 'onto', 'past'],
    correctAnswer: 'A',
    explanation: 'Giới từ "via" có nghĩa là qua, thông qua (thông qua hòm thư góp ý của công ty).',
    translation: 'Nhân viên được khuyến khích gửi các đề xuất sáng tạo thông qua hộp thư góp ý của công ty.'
  },
  {
    id: 'bt-17',
    part: 5,
    promptText: 'The newly launched tablet features an ______ long battery life of up to 24 hours.',
    options: ['exception', 'exceptional', 'exceptionally', 'exceptions'],
    correctAnswer: 'C',
    explanation: 'Cần trạng từ "exceptionally" bổ nghĩa cho tính từ "long" (thời lượng pin dài đặc biệt).',
    translation: 'Chiếc máy tính bảng mới ra mắt có thời lượng pin dài đặc biệt lên tới 24 giờ.'
  },
  {
    id: 'bt-18',
    part: 5,
    promptText: 'Only authorized personnel are permitted to access the ______ client records in the archive.',
    options: ['confidential', 'confidentiality', 'confidentially', 'confide'],
    correctAnswer: 'A',
    explanation: 'Cần tính từ "confidential" bổ nghĩa cho cụm danh từ "client records" (hồ sơ khách hàng bảo mật).',
    translation: 'Chỉ những nhân viên được ủy quyền mới được phép truy cập vào hồ sơ khách hàng bảo mật trong kho lưu trữ.'
  },
  {
    id: 'bt-19',
    part: 5,
    promptText: 'The marketing team worked ______ through the weekend to finalize the product launch campaign.',
    options: ['diligent', 'diligently', 'diligence', 'diligentness'],
    correctAnswer: 'B',
    explanation: 'Cần trạng từ "diligently" (chăm chỉ, cần mẫn) bổ nghĩa cho động từ "worked".',
    translation: 'Đội ngũ tiếp thị đã làm việc chăm chỉ suốt cuối tuần để hoàn tất chiến dịch ra mắt sản phẩm.'
  },
  {
    id: 'bt-20',
    part: 5,
    promptText: 'The upcoming merger will create one of the largest financial ______ in Southeast Asia.',
    options: ['institutes', 'institutions', 'institutional', 'institutionally'],
    correctAnswer: 'B',
    explanation: 'Cần danh từ số nhiều "financial institutions" (các định chế/tổ chức tài chính lớn nhất).',
    translation: 'Vụ sáp nhập sắp tới sẽ tạo ra một trong những định chế tài chính lớn nhất Đông Nam Á.'
  }
];

// Sample AI Opponents for instant matchmaking
const sampleOpponents = [
  { name: 'Trần Minh Hoàng', level: 16, tier: 'Vàng II', avatar: '🦁', winRate: '72%', elo: 1340 },
  { name: 'Lê Thùy Ngân', level: 17, tier: 'Bạch Kim I', avatar: '🦊', winRate: '80%', elo: 1520 },
  { name: 'Vũ Mai Linh', level: 14, tier: 'Vàng III', avatar: '🐼', winRate: '65%', elo: 1210 },
  { name: 'Phạm Hải Đăng', level: 15, tier: 'Vàng I', avatar: '🐯', winRate: '75%', elo: 1390 },
  { name: 'Nguyễn Thu Trang', level: 18, tier: 'Kim Cương IV', avatar: '🦅', winRate: '85%', elo: 1680 },
  { name: 'Bùi Quốc Bảo', level: 15, tier: 'Vàng II', avatar: '🐺', winRate: '70%', elo: 1360 },
  { name: 'Đỗ Khánh Linh', level: 16, tier: 'Vàng I', avatar: '🐱', winRate: '74%', elo: 1410 },
  { name: 'Hoàng Minh Quân', level: 17, tier: 'Bạch Kim III', avatar: '🐻', winRate: '78%', elo: 1480 }
];

// Helper to determine rank tier based on Elo
const calculateTierFromElo = (elo = 1200) => {
  if (elo >= 1700) return 'Kim Cương (Đại Kiện Tướng)';
  if (elo >= 1500) return 'Bạch Kim I (Cao Thủ Part 5)';
  if (elo >= 1300) return 'Vàng II (Chuyên Gia Part 5)';
  if (elo >= 1100) return 'Bạc I (Chiến Binh Part 5)';
  return 'Đồng I (Tân Binh Part 5)';
};

// Get 1v1 Battle Arena Stats
exports.getBattleArenaInfo = async (req, res) => {
  try {
    const reqUser = req.user;
    let user = null;
    if (reqUser && !reqUser.isGuest) {
      if (reqUser._id) user = await User.findById(reqUser._id);
      if (!user && reqUser.email) user = await User.findOne({ email: reqUser.email.toLowerCase().trim() });
    }

    const recentMatches = [
      { id: 'm1', opponent: 'Nguyễn Thu Trang', result: 'WIN', score: '850 - 720', xpGain: 100, time: '10 phút trước' },
      { id: 'm2', opponent: 'Vũ Mai Linh', result: 'WIN', score: '910 - 640', xpGain: 100, time: '1 giờ trước' },
      { id: 'm3', opponent: 'Lê Thùy Ngân', result: 'LOSS', score: '780 - 820', xpGain: 30, time: '3 giờ trước' }
    ];

    const currentElo = user ? (user.battleElo || 1200) : 1200;
    const currentTier = user ? (user.battleTier || calculateTierFromElo(currentElo)) : 'Vàng II (Chuyên Gia Part 5)';
    const winStreak = user ? (user.battleStreak || 0) : 4;
    const totalMatches = user ? ((user.battleWins || 0) + (user.battleLosses || 0)) : 28;
    const userWins = user ? (user.battleWins || 0) : 20;
    const winRate = totalMatches > 0 ? `${Math.round((userWins / totalMatches) * 100)}%` : '71%';

    return res.status(200).json({
      success: true,
      data: {
        userName: user?.fullName || (user?.email ? user.email.split('@')[0] : 'Học Viên'),
        battleTier: currentTier,
        battleElo: currentElo,
        winStreak,
        totalMatches,
        winRate,
        onlineCount: 52,
        recentMatches
      }
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Matchmake 1v1 Opponent & Retrieve 10 Dynamic Battle Questions from MongoDB
exports.matchmakeBattle = async (req, res) => {
  try {
    const randomOpponent = sampleOpponents[Math.floor(Math.random() * sampleOpponents.length)];
    const roomId = 'battle_' + Math.random().toString(36).substring(2, 9);

    let questionsToPlay = [];

    // Attempt to pull authentic questions from MongoDB readingexercises Part 5
    try {
      const part5Docs = await ReadingExercise.find({
        $or: [
          { part: 5 },
          { part: '5' },
          { part: 'Part 5' },
          { category: { $regex: 'part 5|ngữ pháp', $options: 'i' } }
        ]
      }).select('questions title').lean();

      if (part5Docs && part5Docs.length > 0) {
        // Collect candidate questions with valid prompts and 4 options
        const allCandidates = [];
        for (const doc of part5Docs) {
          for (const q of (doc.questions || [])) {
            const prompt = (q.prompt || q.promptText || '').trim();
            if (prompt && q.options && q.options.length >= 4 && q.correctAnswer) {
              allCandidates.push({
                id: q._id ? q._id.toString() : `bt_q_${allCandidates.length}`,
                part: 5,
                promptText: prompt,
                options: q.options.slice(0, 4).map(o => {
                  const raw = typeof o === 'string' ? o : (o.text || o.label || '');
                  return raw.replace(/^[A-D]\.\s*/, '').trim();
                }),
                correctAnswer: String(q.correctAnswer).trim().toUpperCase(),
                explanation: q.explanation || 'Xem lại cấu trúc ngữ pháp và từ loại của câu.',
                translation: q.translation || q.promptTranslation || ''
              });
            }
          }
        }

        if (allCandidates.length >= 10) {
          // Shuffle candidates and pick 10
          questionsToPlay = allCandidates.sort(() => 0.5 - Math.random()).slice(0, 10);
        }
      }
    } catch (dbErr) {
      console.warn('Dynamic Part 5 query error, falling back to backup bank:', dbErr.message);
    }

    // Fallback to static curated bank if DB returned < 10
    if (questionsToPlay.length < 10) {
      questionsToPlay = [...battleQuestionBank].sort(() => 0.5 - Math.random()).slice(0, 10);
    }

    return res.status(200).json({
      success: true,
      data: {
        roomId,
        opponent: randomOpponent,
        timePerQuestion: 15,
        totalQuestions: 10,
        questions: questionsToPlay
      }
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Finish 1v1 Battle & Award XP, Elo & Streaks
exports.finishBattle = async (req, res) => {
  try {
    const { isWinner, userScore, correctCount } = req.body;
    const reqUser = req.user;
    let user = null;

    if (reqUser && !reqUser.isGuest) {
      if (reqUser._id) user = await User.findById(reqUser._id);
      if (!user && reqUser.email) user = await User.findOne({ email: reqUser.email.toLowerCase().trim() });
    }

    const xpReward = isWinner ? 100 : 35;

    if (user) {
      user.totalXp = (user.totalXp || 0) + xpReward;

      if (isWinner) {
        user.battleWins = (user.battleWins || 0) + 1;
        user.battleStreak = (user.battleStreak || 0) + 1;
        if (user.battleStreak > (user.maxBattleStreak || 0)) {
          user.maxBattleStreak = user.battleStreak;
        }
        user.battleElo = (user.battleElo || 1200) + 25;
      } else {
        user.battleLosses = (user.battleLosses || 0) + 1;
        user.battleStreak = 0;
        user.battleElo = Math.max(1000, (user.battleElo || 1200) - 15);
      }

      user.battleTier = calculateTierFromElo(user.battleElo);
      await user.save();
    }

    return res.status(200).json({
      success: true,
      message: isWinner 
        ? `🎉 CHIẾN THẮNG TUYỆT ĐỐI! +${xpReward} XP VÀ +25 ELO ĐÃ ĐƯỢC CỘNG VÀO TÀI KHOẢN` 
        : `👍 Nỗ lực tuyệt vời! +${xpReward} XP khích lệ.`,
      data: {
        isWinner,
        userScore,
        xpReward,
        newTotalXp: user ? user.totalXp : xpReward,
        newElo: user ? user.battleElo : (isWinner ? 1225 : 1185),
        newStreak: user ? user.battleStreak : (isWinner ? 1 : 0),
        newTier: user ? user.battleTier : (isWinner ? 'Vàng II (Chuyên Gia Part 5)' : 'Vàng II (Chuyên Gia Part 5)')
      }
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
