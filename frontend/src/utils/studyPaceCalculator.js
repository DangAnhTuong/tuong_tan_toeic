/**
 * 🎯 TOEIC Study Pace & Workload Calculator
 * Tính toán khối lượng câu hỏi, từ vựng và thời gian học tối ưu mỗi ngày
 * dựa trên Mục tiêu điểm số và Ngày thi dự kiến.
 */

/**
 * Tính số ngày còn lại đến ngày thi
 * @param {string|Date} testDate 
 * @returns {number|null} Số ngày (dương: còn X ngày, 0: hôm nay, âm: đã qua)
 */
export function calculateDaysRemaining(testDate) {
  if (!testDate) return null;
  const target = new Date(testDate);
  if (isNaN(target.getTime())) return null;

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  target.setHours(0, 0, 0, 0);

  const diffTime = target.getTime() - today.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

/**
 * Tính toán lộ trình học tập thông minh
 * @param {number} currentScore Điểm hiện tại (10 - 990)
 * @param {number} targetScore Điểm mục tiêu (10 - 990)
 * @param {string|Date} testDate Ngày thi dự kiến
 */
export function calculateStudyPace(currentScore = 100, targetScore = 650, testDate = null) {
  const cur = Number(currentScore) || 0;
  const target = Number(targetScore) || 650;
  const scoreGap = Math.max(0, target - cur);
  const daysRemaining = calculateDaysRemaining(testDate);

  if (!testDate || daysRemaining === null) {
    return {
      hasDate: false,
      daysRemaining: null,
      scoreGap,
      listeningDaily: 30,
      readingDaily: 30,
      vocabDaily: 20, // KPI sàn tối thiểu 20 từ/ngày
      totalDailyQuestions: 60,
      estimatedMinutesPerDay: 55,
      paceLevel: 'not_set',
      badgeText: 'Chưa đặt ngày thi',
      badgeColor: 'cyan',
      advice: 'Hãy đặt ngày thi để AI tính toán lộ trình từ vựng và câu hỏi chính xác nhất cho bạn (tối thiểu 20 từ/ngày).'
    };
  }

  if (daysRemaining < 0) {
    return {
      hasDate: true,
      daysRemaining,
      scoreGap,
      listeningDaily: 20,
      readingDaily: 20,
      vocabDaily: 20,
      totalDailyQuestions: 40,
      estimatedMinutesPerDay: 40,
      paceLevel: 'expired',
      badgeText: 'Đã qua ngày thi',
      badgeColor: 'rose',
      advice: 'Ngày thi đã qua, hãy chọn lại ngày thi mới để cập nhật lộ trình luyện thi nhé!'
    };
  }

  const effectiveDays = Math.max(1, daysRemaining);

  // Chuẩn sư phạm TOEIC: Tăng 100 điểm cần ~280 câu hỏi ETS
  const estimatedTotalQuestions = Math.max(80, Math.round(scoreGap * 2.8));
  const rawDailyQuestions = Math.ceil(estimatedTotalQuestions / effectiveDays);

  // Giới hạn an toàn câu hỏi: tối thiểu 10 câu/ngày, tối đa 140 câu/ngày
  const clampedDailyQuestions = Math.max(10, Math.min(140, rawDailyQuestions));

  // Chia đều 50% Nghe - 50% Đọc, làm tròn mốc 5 câu
  const listeningDaily = Math.max(5, Math.round((clampedDailyQuestions * 0.5) / 5) * 5);
  const readingDaily = Math.max(5, Math.round((clampedDailyQuestions * 0.5) / 5) * 5);
  const totalDailyQuestions = listeningDaily + readingDaily;

  // TỪ VỰNG: KPI sàn tối thiểu bắt buộc 20 từ/ngày, tăng dần lũy tiến theo khoảng cách điểm và số ngày thi
  const MIN_VOCAB_KPI = 20;
  const rawVocab = MIN_VOCAB_KPI + Math.ceil((scoreGap * 0.9) / effectiveDays);
  // Làm tròn mốc 5 từ, chặn trên tối đa 60 từ/ngày để bảo đảm hiệu quả ghi nhớ dài hạn SM-2
  const vocabDaily = Math.max(MIN_VOCAB_KPI, Math.min(60, Math.round(rawVocab / 5) * 5));

  // Thời gian học ước tính: ~0.8 phút/câu + 0.6 phút/từ vựng
  const estimatedMinutesPerDay = Math.max(20, Math.round(totalDailyQuestions * 0.8 + vocabDaily * 0.6));

  // Đánh giá tính khả thi (Pace Level)
  let paceLevel = 'ideal';
  let badgeText = 'Lộ trình lý tưởng';
  let badgeColor = 'emerald';
  let advice = `Nắm chắc tối thiểu ${vocabDaily} từ vựng/ngày làm gốc để bắt âm và đọc hiểu, kết hợp luyện ${totalDailyQuestions} câu (~${estimatedMinutesPerDay} phút/ngày) để chắc chắn bứt phá mục tiêu ${target} điểm!`;

  if (totalDailyQuestions > 80 || estimatedMinutesPerDay > 90 || vocabDaily >= 45) {
    paceLevel = 'intense';
    badgeText = 'Áp lực rất cao';
    badgeColor = 'rose';
    advice = `Khoảng cách ${scoreGap} điểm trong ${effectiveDays} ngày cần nạp ${vocabDaily} từ vựng + ${totalDailyQuestions} câu/ngày (~${estimatedMinutesPerDay}p). Bạn nên dành >2h/ngày hoặc cân nhắc dời lịch thi thêm 3-4 tuần để giảm tải.`;
  } else if (totalDailyQuestions > 45 || estimatedMinutesPerDay > 50 || vocabDaily >= 30) {
    paceLevel = 'moderate';
    badgeText = 'Cần tăng tốc';
    badgeColor = 'amber';
    advice = `Lộ trình cần tăng tốc với ${vocabDaily} từ vựng và ${totalDailyQuestions} câu/ngày (~${estimatedMinutesPerDay}p). Hãy chia 2 khung giờ học (sáng từ vựng, tối luyện đề) để ghi nhớ sâu nhất!`;
  }

  return {
    hasDate: true,
    daysRemaining,
    scoreGap,
    listeningDaily,
    readingDaily,
    vocabDaily,
    totalDailyQuestions,
    estimatedMinutesPerDay,
    paceLevel,
    badgeText,
    badgeColor,
    advice
  };
}

/**
 * Sinh đường dẫn Google Calendar tạo sự kiện ngày thi TOEIC 1 chạm
 * @param {string|Date} testDate 
 * @param {number} targetScore 
 * @returns {string|null}
 */
export function generateGoogleCalendarUrl(testDate, targetScore = 650) {
  if (!testDate) return null;
  const d = new Date(testDate);
  if (isNaN(d.getTime())) return null;

  // Giờ thi chuẩn TOEIC: 08:00 - 11:30 sáng
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');

  const startIso = `${year}${month}${day}T080000`;
  const endIso = `${year}${month}${day}T113000`;

  const title = encodeURIComponent(`🎯 THI TOEIC QUỐC TẾ (Mục tiêu: ${targetScore} điểm)`);
  const details = encodeURIComponent(
    `Hôm nay là ngày thi TOEIC chính thức!\n` +
    `• Mục tiêu điểm số: ${targetScore} điểm\n` +
    `• Đã hoàn thành ôn luyện tại Tường Tận TOEIC (https://toeic.danganhtuong.dev)\n` +
    `• Nhớ mang theo: CMND/CCCD bản gốc, phiếu đăng ký dự thi, 2 bút chì 2B và tẩy.\n` +
    `Chúc bạn tự tin làm bài thật tốt và vượt mục tiêu!`
  );
  const location = encodeURIComponent('Văn phòng IIG Việt Nam / Địa điểm thi TOEIC Quốc Tế');

  return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${startIso}/${endIso}&details=${details}&location=${location}`;
}
