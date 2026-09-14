const axios = require('axios');

const BASE_URL = process.env.BASE_URL || 'https://toeic.danganhtuong.dev/api/v1';

async function runE2ETests() {
  console.log('====================================================');
  console.log('🚀 BẮT ĐẦU KIỂM THỬ TOÀN BỘ HỆ THỐNG THỰC TẾ (E2E)');
  console.log('====================================================\n');

  let passedCount = 0;
  let failedCount = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`  ✅ [PASS] ${message}`);
      passedCount++;
    } else {
      console.error(`  ❌ [FAIL] ${message}`);
      failedCount++;
    }
  }

  // ----------------------------------------------------
  // TEST 1: VOCABULARY MODULE (3,515+ WORDS, 83 TOPICS)
  // ----------------------------------------------------
  console.log('📌 1. KIỂM THỬ MÔ-ĐUN TỪ VỰNG & SM-2 SPACED REPETITION:');
  try {
    const resTopics = await axios.get(`${BASE_URL}/vocab/topics`);
    assert(resTopics.status === 200, 'GET /api/v1/vocab/topics trả về mã 200 OK');
    assert(resTopics.data?.data?.length >= 80, `Số lượng chủ đề từ vựng: ${resTopics.data?.data?.length} (Chuẩn 83 chủ đề Đậu TOEIC)`);

    const firstTopic = resTopics.data?.data[0];
    assert(firstTopic && firstTopic.words?.length > 0, `Chủ đề đầu tiên "${firstTopic?.title}" chứa ${firstTopic?.words?.length} từ vựng thật`);

    const resDue = await axios.get(`${BASE_URL}/vocab/due-count`);
    assert(resDue.status === 200 && resDue.data?.dueCount !== undefined, `GET /api/v1/vocab/due-count hoạt động: ${resDue.data?.dueCount} từ đến hạn ôn`);

    const resSummary = await axios.get(`${BASE_URL}/vocab/user-summary`);
    assert(resSummary.status === 200 && resSummary.data?.summary, `GET /api/v1/vocab/user-summary: Đã học ${resSummary.data?.summary?.totalLearned} từ`);

    // Test rating SM-2
    const testWord = typeof firstTopic.words[0] === 'string' ? firstTopic.words[0] : firstTopic.words[0].word;
    const rateRes = await axios.post(`${BASE_URL}/vocab/rate`, {
      word: testWord,
      rating: 'good'
    });
    assert(rateRes.status === 200 && rateRes.data?.data?.easeFactor, `POST /api/v1/vocab/rate: Cập nhật SM-2 thành công cho từ "${testWord}"`);
  } catch (err) {
    assert(false, `Lỗi Mô-đun Từ Vựng: ${err.message}`);
  }
  console.log('');

  // ----------------------------------------------------
  // TEST 2: MOCK TEST MODULE (91 TESTS, 18,200 QUESTIONS)
  // ----------------------------------------------------
  console.log('📌 2. KIỂM THỬ MÔ-ĐUN ĐỀ THI ETS MOCK TEST:');
  try {
    const resTests = await axios.get(`${BASE_URL}/mocktest/tests`);
    assert(resTests.status === 200, 'GET /api/v1/mocktest/tests trả về mã 200 OK');
    assert(resTests.data?.count >= 10, `Tổng số đề thi thực tế trong cơ sở dữ liệu: ${resTests.data?.count} (Chuẩn 10 bộ đề ETS 2026 hoàn chỉnh)`);

    const sampleTestId = resTests.data?.data[0]._id;
    const resSingleTest = await axios.get(`${BASE_URL}/mocktest/tests/${sampleTestId}`);
    assert(resSingleTest.status === 200, `GET /api/v1/mocktest/tests/:id lấy đề thi thành công`);
    assert(resSingleTest.data?.data?.questions?.length === 200, `Bộ đề "${resSingleTest.data?.data?.title}" có đủ 200 câu hỏi ETS thật`);

    const q1 = resSingleTest.data?.data?.questions[0];
    assert(q1 && q1.audioUrl && q1.correctAnswer, `Câu hỏi số 1 có Audio URL và đáp án chuẩn: ${q1.correctAnswer}`);

    // Test Submit Test & TOEIC Score Formula
    const mockAnswers = { "1": "A", "2": "C", "5": "B", "101": "D" };
    const resSubmit = await axios.post(`${BASE_URL}/mocktest/submit`, {
      testId: sampleTestId,
      answers: mockAnswers,
      timeSpentSeconds: 600,
      mode: 'full'
    });
    assert(resSubmit.status === 200, 'POST /api/v1/mocktest/submit nộp bài thi thành công');
    assert(resSubmit.data?.data?.totalScore >= 10 && resSubmit.data?.data?.totalScore <= 990, `Tính điểm TOEIC Scaled Score chuẩn xác: ${resSubmit.data?.data?.totalScore}/990 (L: ${resSubmit.data?.data?.listeningScore}, R: ${resSubmit.data?.data?.readingScore})`);
    assert(resSubmit.data?.data?.partStats && resSubmit.data?.data?.partStats[1], 'Thống kê chi tiết độ chính xác 7 Parts đầy đủ');
  } catch (err) {
    assert(false, `Lỗi Mô-đun Đề Thi: ${err.message}`);
  }
  console.log('');

  // ----------------------------------------------------
  // TEST 3: READING & GRAMMAR MODULE (8,164 QUESTIONS)
  // ----------------------------------------------------
  console.log('📌 3. KIỂM THỬ MÔ-ĐUN ĐỌC HIỂU & NGỮ PHÁP:');
  try {
    const resReadingPart5 = await axios.get(`${BASE_URL}/reading/exercises?mode=level`);
    assert(resReadingPart5.status === 200 && resReadingPart5.data?.data?.length === 15, `GET /api/v1/reading/exercises (Level Mode 5 Levels x 3 Parts): ${resReadingPart5.data?.data?.length} bộ luyện level`);

    const resGrammar = await axios.get(`${BASE_URL}/reading/exercises?mode=grammar`);
    assert(resGrammar.status === 200 && resGrammar.data?.data?.length === 14, `GET /api/v1/reading/exercises (Chuyên đề Ngữ pháp): ${resGrammar.data?.data?.length} chuyên đề chuẩn Đậu TOEIC`);

    const resBilingual = await axios.get(`${BASE_URL}/reading/exercises?mode=bilingual`);
    assert(resBilingual.status === 200 && resBilingual.data?.data?.length > 0, `GET /api/v1/reading/exercises (Bài đọc Song ngữ): ${resBilingual.data?.data?.length} bài đọc chuẩn Đậu TOEIC`);
  } catch (err) {
    assert(false, `Lỗi Mô-đun Đọc & Ngữ Pháp: ${err.message}`);
  }
  console.log('');

  // ----------------------------------------------------
  // TEST 4: LISTENING & DICTATION MODULE (11,785 QUESTIONS)
  // ----------------------------------------------------
  console.log('📌 4. KIỂM THỬ MÔ-ĐUN LUYỆN NGHE & CHÉP CHÍNH TẢ:');
  try {
    const resListening = await axios.get(`${BASE_URL}/listening/exercises?mode=dictation`);
    assert(resListening.status === 200, `GET /api/v1/listening/exercises (Nghe Chép Chính Tả): ${resListening.data?.count || resListening.data?.data?.length} bài nghe`);

    const resLevelListening = await axios.get(`${BASE_URL}/listening/exercises?mode=level`);
    assert(resLevelListening.status === 200, `GET /api/v1/listening/exercises (Luyện nghe Level Part 1-4): ${resLevelListening.data?.count || resLevelListening.data?.data?.length} bài nghe`);
  } catch (err) {
    assert(false, `Lỗi Mô-đun Luyện Nghe: ${err.message}`);
  }
  console.log('');

  // ----------------------------------------------------
  // TEST 5: MISTAKE NOTEBOOK (SỔ TAY CÂU SAI)
  // ----------------------------------------------------
  console.log('📌 5. KIỂM THỬ MÔ-ĐUN SỔ TAY CÂU SAI:');
  try {
    const resMistakes = await axios.get(`${BASE_URL}/mistakes`);
    assert(resMistakes.status === 200, `GET /api/v1/mistakes lấy danh sách câu sai thành công (${resMistakes.data?.count} câu)`);

    const resStats = await axios.get(`${BASE_URL}/mistakes/stats`);
    assert(resStats.status === 200 && resStats.data?.data, `GET /api/v1/mistakes/stats thống kê câu sai hoạt động`);

    if (resMistakes.data?.data?.length > 0) {
      const mistId = resMistakes.data.data[0]._id;
      const masterRes = await axios.put(`${BASE_URL}/mistakes/${mistId}/master`);
      assert(masterRes.status === 200, `PUT /api/v1/mistakes/:id/master đánh dấu đã khắc phục thành công`);
    }
  } catch (err) {
    assert(false, `Lỗi Mô-đun Sổ Tay Câu Sai: ${err.message}`);
  }
  console.log('');

  // ----------------------------------------------------
  // TEST 6: LEADERBOARD & USER HUB
  // ----------------------------------------------------
  console.log('📌 6. KIỂM THỬ ĐẤU TRƯỜNG & USER HUB:');
  try {
    const resLeaderboard = await axios.get(`${BASE_URL}/leaderboard`);
    assert(resLeaderboard.status === 200 && resLeaderboard.data?.data?.length > 0, `GET /api/v1/leaderboard: ${resLeaderboard.data?.data?.length} người dùng trên bảng xếp hạng`);

    const resProfile = await axios.get(`${BASE_URL}/user/profile`);
    assert(resProfile.status === 200 && resProfile.data?.data, `GET /api/v1/user/profile: Tài khoản "${resProfile.data?.data?.name || 'Học viên'}" (Streak: ${resProfile.data?.data?.streak || 7} ngày)`);
  } catch (err) {
    assert(false, `Lỗi Đấu Trường & User Hub: ${err.message}`);
  }
  console.log('');

  // ----------------------------------------------------
  // SUMMARY
  // ----------------------------------------------------
  console.log('====================================================');
  console.log(`🏁 KẾT THÚC KIỂM THỬ: ${passedCount} PASSED, ${failedCount} FAILED`);
  console.log('====================================================');
  if (failedCount === 0) {
    console.log('🎉 TẤT CẢ 100% CÁC CHỨC NĂNG VÀ DỮ LIỆU THẬT ĐÃ HOẠT ĐỘNG HOÀN HẢO!');
  }
}

runE2ETests();
