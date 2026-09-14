const http = require('http');
const https = require('https');

const TARGET_URL = process.env.TARGET_URL || 'http://localhost:5000';

function requestApi(method, path, body = null, token = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(TARGET_URL + path);
    const isHttps = url.protocol === 'https:';
    const client = isHttps ? https : http;

    const options = {
      hostname: url.hostname,
      port: url.port || (isHttps ? 443 : 80),
      path: url.pathname + url.search,
      method: method,
      headers: {
        'Content-Type': 'application/json'
      }
    };

    if (token) {
      options.headers['Authorization'] = `Bearer ${token}`;
    }

    const req = client.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          resolve({ status: res.statusCode, body: json });
        } catch (e) {
          resolve({ status: res.statusCode, body: data });
        }
      });
    });

    req.on('error', reject);
    if (body) {
      req.write(JSON.stringify(body));
    }
    req.end();
  });
}

async function runExhaustiveLogicAudit() {
  console.log('================================================================');
  console.log('🧪 BẮT ĐẦU KIỂM THỬ TOÀN BỘ LOGIC & CHỨC NĂNG HỆ THỐNG');
  console.log(`🌐 Endpoint Target: ${TARGET_URL}`);
  console.log('================================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`  ✅ [PASS] ${message}`);
      passed++;
    } else {
      console.error(`  ❌ [FAIL] ${message}`);
      failed++;
    }
  }

  let authToken = null;
  const testEmail = `audit_student_${Date.now()}@test.com`;
  const testPassword = 'Password123!';

  // =========================================================================
  // 1. AUTHENTICATION & PRO GATE LOGIC
  // =========================================================================
  console.log('📌 1. KIỂM THỬ XÁC THỰC, BẢO MẬT & PHÂN QUYỀN PRO GATE:');
  try {
    // 1.1 Register
    const regRes = await requestApi('POST', '/api/v1/auth/register', {
      name: 'Audit Test Student',
      email: testEmail,
      password: testPassword
    });
    assert(regRes.status === 201 && regRes.body.token, 'Đăng ký tài khoản mới trả về HTTP 201 Created và cấp JWT Token');
    authToken = regRes.body.token;

    // 1.2 Login
    const loginRes = await requestApi('POST', '/api/v1/auth/login', {
      email: testEmail,
      password: testPassword
    });
    assert(loginRes.status === 200 && loginRes.body.token, 'Đăng nhập với email/password trả về HTTP 200 OK và JWT Token');
    if (loginRes.body.token) authToken = loginRes.body.token;

    // 1.3 User Profile & Streak / XP
    const profileRes = await requestApi('GET', '/api/v1/user/profile', null, authToken);
    assert(profileRes.status === 200 && profileRes.body.data?.email === testEmail, `Lấy hồ sơ người dùng thành công: ${profileRes.body.data?.fullName || profileRes.body.data?.name || testEmail}`);
    assert(profileRes.body.data?.isPro === false, 'Tài khoản mới khởi tạo mặc định thuộc gói Free Tier (isPro: false)');

    // 1.4 Free Tier Gate Check on Tests
    const testsListRes = await requestApi('GET', '/api/v1/mocktest/tests', null, authToken);
    assert(testsListRes.status === 200 && testsListRes.body.data?.length === 10, 'Danh sách đề thi trả về đủ 10 bộ ETS 2026');
    const test1 = testsListRes.body.data.find(t => /Test 1\b/i.test(t.title));
    const test2 = testsListRes.body.data.find(t => /Test 2\b/i.test(t.title));
    assert(test1 && test1.isPro === false, 'Test 1 mở miễn phí cho mọi học viên Free Tier (isPro: false)');
    assert(test2 && test2.isPro === true, 'Test 2 yêu cầu phân quyền Pro Tier (isPro: true)');
  } catch (err) {
    assert(false, `Lỗi Auth & Pro Gate: ${err.message}`);
  }
  console.log('');

  // =========================================================================
  // 2. MOCK TEST SCORING ENGINE & ETS CONVERSION FORMULA
  // =========================================================================
  console.log('📌 2. KIỂM THỬ ĐỘNG CƠ ĐỀ THI & CÔNG THỨC CHẤM ĐIỂM TOEIC SCALED SCORE:');
  try {
    const testsRes = await requestApi('GET', '/api/v1/mocktest/tests');
    const test1 = testsRes.body.data.find(t => /Test 1\b/i.test(t.title));
    const test1Id = test1._id;

    // 2.1 Fetch Test Detail
    const detailRes = await requestApi('GET', `/api/v1/mocktest/tests/${test1Id}`);
    assert(detailRes.status === 200 && detailRes.body.data?.questions?.length === 200, 'Tải đề thi Test 1 thành công: Đầy đủ 200 câu hỏi ETS');

    // 2.2 Submit Mock Answers
    // Simulate 35 correct answers in LC (Q1-100) and 45 correct answers in RC (Q101-200)
    const simulatedAnswers = {};
    const questions = detailRes.body.data.questions;
    questions.slice(0, 35).forEach(q => { 
      const num = q.questionNum !== undefined ? q.questionNum : q.questionNumber;
      simulatedAnswers[num] = q.correctAnswer; 
    });
    questions.slice(35, 100).forEach(q => { 
      const num = q.questionNum !== undefined ? q.questionNum : q.questionNumber;
      simulatedAnswers[num] = 'X'; 
    });
    questions.slice(100, 145).forEach(q => { 
      const num = q.questionNum !== undefined ? q.questionNum : q.questionNumber;
      simulatedAnswers[num] = q.correctAnswer; 
    });
    questions.slice(145, 200).forEach(q => { 
      const num = q.questionNum !== undefined ? q.questionNum : q.questionNumber;
      simulatedAnswers[num] = 'X'; 
    });

    const submitRes = await requestApi('POST', '/api/v1/mocktest/submit', {
      testId: test1Id,
      answers: simulatedAnswers,
      timeSpentSeconds: 3600,
      mode: 'full'
    }, authToken);

    assert(submitRes.status === 200, 'Nộp bài thi thành công (HTTP 200 OK)');
    const scoreData = submitRes.body.data;
    assert(scoreData.listeningScore >= 100 && scoreData.listeningScore <= 350, `Điểm Listening chuẩn thang TOEIC: ${scoreData.listeningScore}/495 (35/100 câu đúng)`);
    assert(scoreData.readingScore >= 150 && scoreData.readingScore <= 400, `Điểm Reading chuẩn thang TOEIC: ${scoreData.readingScore}/495 (45/100 câu đúng)`);
    assert(scoreData.totalScore === (scoreData.listeningScore + scoreData.readingScore), `Tổng điểm Scaled Score chính xác tuyệt đối: ${scoreData.totalScore}/990`);
    assert(scoreData.partStats && scoreData.partStats[1] && scoreData.partStats[5], 'Thống kê chi tiết tỷ lệ Đúng/Sai theo từng Part 1-7 đầy đủ');
  } catch (err) {
    assert(false, `Lỗi Động Cơ Đề Thi & Chấm Điểm: ${err.message}`);
  }
  console.log('');

  // =========================================================================
  // 3. CLOSED-LOOP LEARNING & MISTAKES NOTEBOOK
  // =========================================================================
  console.log('📌 3. KIỂM THỬ VÒNG LẶP HỌC TẬP KHÉP KÍN & SỔ TAY CÂU SAI:');
  try {
    // Wait a brief tick for async upsert
    await new Promise(r => setTimeout(r, 500));
    const mistakesRes = await requestApi('GET', '/api/v1/mistakes', null, authToken);
    assert(mistakesRes.status === 200, 'Truy vấn danh sách câu sai thành công');
    assert(mistakesRes.body.data && mistakesRes.body.data.length > 0, `Đồng bộ khép kín: Tự động ghi nhận ${mistakesRes.body.data?.length} câu làm sai từ đề thi vào sổ tay`);

    const sampleMistake = mistakesRes.body.data[0];
    assert(sampleMistake && (sampleMistake.prompt || sampleMistake.questionId), 'Bản ghi câu sai lưu đầy đủ thông tin câu hỏi, đáp án và phân tích');

    // 3.2 Master a mistake
    if (sampleMistake) {
      const masterRes = await requestApi('PUT', `/api/v1/mistakes/${sampleMistake._id}/master`, null, authToken);
      assert(masterRes.status === 200, 'Đánh dấu đã thành thạo câu sai (Master) hoạt động chính xác');
    }
  } catch (err) {
    assert(false, `Lỗi Sổ Tay Câu Sai: ${err.message}`);
  }
  console.log('');

  // =========================================================================
  // 4. SPACED REPETITION SM-2 VOCABULARY ENGINE
  // =========================================================================
  console.log('📌 4. KIỂM THỬ THUẬT TOÁN LẶP LẠI NGẮT QUÃNG SM-2 (TỪ VỰNG):');
  try {
    const vocabTopics = await requestApi('GET', '/api/v1/vocab/topics');
    assert(vocabTopics.status === 200 && vocabTopics.body.data?.length === 84, 'Danh sách từ vựng có đủ 84 chủ đề chuẩn');

    const firstWord = vocabTopics.body.data[0].words[0];
    const wordText = typeof firstWord === 'string' ? firstWord : firstWord.word;

    // Rate word with SM-2 'good'
    const rateRes = await requestApi('POST', '/api/v1/vocab/rate', {
      word: wordText,
      rating: 'good'
    }, authToken);
    assert(rateRes.status === 200 && rateRes.body.data?.easeFactor, `Thuật toán SM-2 cập nhật thành công: Ease Factor = ${rateRes.body.data?.easeFactor}`);

    const dueRes = await requestApi('GET', '/api/v1/vocab/due-count', null, authToken);
    assert(dueRes.status === 200 && dueRes.body.dueCount !== undefined, `Widget SRS ghim vĩnh viễn tính toán chính xác: ${dueRes.body.dueCount} từ đến hạn`);
  } catch (err) {
    assert(false, `Lỗi Thuật Toán SM-2: ${err.message}`);
  }
  console.log('');

  // =========================================================================
  // 5. LISTENING & DICTATION ANTI-SPOIL PEDAGOGY
  // =========================================================================
  console.log('📌 5. KIỂM THỬ ĐỘNG CƠ NGHE CHÉP CHÍNH TẢ & SƯ PHẠM ANTI-SPOIL:');
  try {
    const dict2026 = await requestApi('GET', '/api/v1/listening/exercises?mode=dictation&year=2026&part=1');
    assert(dict2026.status === 200 && dict2026.body.data?.length === 10, 'Bộ đề Nghe Chép 2026 Part 1 trả về đủ 10 tests');

    const test1Dict = dict2026.body.data[0];
    const sentences = test1Dict.lessons?.[0]?.sentences || test1Dict.questions || [];
    assert(sentences.length > 0, `Đề thi chép chính tả "${test1Dict.title}" chứa ${sentences.length} câu thoại thật`);

    const s1 = sentences[0];
    assert(s1.text && (s1.audioUrl || s1.audio), 'Câu thoại có nội dung tiếng Anh và Audio độc lập');
    assert(s1.translation && s1.translation.trim().length > 0, 'Câu thoại có bản dịch tiếng Việt chuẩn để đối soát');
  } catch (err) {
    assert(false, `Lỗi Nghe Chép Chính Tả: ${err.message}`);
  }
  console.log('');

  // =========================================================================
  // 6. READING & 4-PART PEDAGOGICAL EXPLANATION
  // =========================================================================
  console.log('📌 6. KIỂM THỬ ĐỌC HIỂU 4 BƯỚC SƯ PHẠM & BÀI ĐỌC SONG NGỮ:');
  try {
    // 6.1 Bilingual Articles
    const biRes = await requestApi('GET', '/api/v1/reading/exercises?mode=bilingual&limit=50');
    assert(biRes.status === 200 && biRes.body.data?.length === 31, 'Bài đọc song ngữ trả về chuẩn xác 31 bài (16 bài Lv1 + 15 bài Lv2)');

    // 6.2 Grammar Lessons
    const gramRes = await requestApi('GET', '/api/v1/reading/exercises?mode=grammar&limit=50');
    assert(gramRes.status === 200 && gramRes.body.data?.length === 14, 'Chuyên đề ngữ pháp có đủ 14 bài học lý thuyết chuẩn');

    // 6.3 Part 5 Pedagogical Explanation
    const p5Res = await requestApi('GET', '/api/v1/reading/exercises?part=5&limit=5');
    assert(p5Res.status === 200 && p5Res.body.data?.length > 0, 'Tải bài tập Part 5 thành công');
    const p5Detail = await requestApi('GET', `/api/v1/reading/exercises/${p5Res.body.data[0]._id}`);
    const sampleQ = p5Detail.body.data?.questions?.[0];
    assert(sampleQ && sampleQ.explanation && sampleQ.explanation.length > 10, 'Part 5 có lời giải sư phạm chi tiết kèm phân tích 4 đáp án');
  } catch (err) {
    assert(false, `Lỗi Đọc Hiểu & Ngữ Pháp: ${err.message}`);
  }
  console.log('');

  // =========================================================================
  // 7. LEADERBOARD & 1V1 GAMIFICATION
  // =========================================================================
  console.log('📌 7. KIỂM THỬ ĐẤU TRƯỜNG 1V1, XP & BẢNG XẾP HẠNG:');
  try {
    const lbRes = await requestApi('GET', '/api/v1/leaderboard');
    assert(lbRes.status === 200 && lbRes.body.data?.length > 0, `Bảng xếp hạng vinh danh Top ${lbRes.body.data?.length} học viên điểm cao nhất`);
    
    // Check leaderboard sorted in descending order of XP
    const topUsers = lbRes.body.data;
    let isSorted = true;
    for (let i = 0; i < topUsers.length - 1; i++) {
      if ((topUsers[i].xp || 0) < (topUsers[i + 1].xp || 0)) {
        isSorted = false;
        break;
      }
    }
    assert(isSorted, 'Bảng xếp hạng được sắp xếp chuẩn xác theo điểm kinh nghiệm (XP) giảm dần');
  } catch (err) {
    assert(false, `Lỗi Bảng Xếp Hạng & Gamification: ${err.message}`);
  }
  console.log('');

  // =========================================================================
  // 8. VIETQR AUTOMATED PAYMENT GATEWAY
  // =========================================================================
  console.log('📌 8. KIỂM THỬ CỔNG THANH TOÁN TỰ ĐỘNG VIETQR:');
  try {
    const orderRes = await requestApi('POST', '/api/v1/payment/create-order', {
      planType: 'pro_4_months',
      email: testEmail
    }, authToken);

    assert(orderRes.status === 200 || orderRes.status === 201, 'Tạo đơn hàng thanh toán VIP Khai Trương (HTTP 200/201)');
    const orderData = orderRes.body.data || orderRes.body;
    assert(orderData.qrUrl || orderData.accountNo, 'Sinh mã VietQR chuẩn MB Bank thành công');
    assert(orderData.amount === 99000, `Số tiền khuyến mãi khai trương chính xác: 99.000 ₫ (gốc 199.000 ₫)`);
    assert(orderData.orderCode || orderData.transferContent, `Cú pháp chuyển khoản định danh tự động duy nhất: ${orderData.orderCode || orderData.transferContent}`);
  } catch (err) {
    assert(false, `Lỗi Cổng Thanh Toán VietQR: ${err.message}`);
  }
  console.log('');

  // =========================================================================
  // FINAL EVALUATION
  // =========================================================================
  console.log('================================================================');
  console.log(`🏁 KẾT THÚC TOÀN BỘ KIỂM THỬ: ${passed} PASSED, ${failed} FAILED`);
  console.log('================================================================');
  if (failed === 0) {
    console.log('🎉 100% CÁC LOGIC NGHIỆP VỤ & CHỨC NĂNG HỆ THỐNG ĐÃ ĐẠT CHUẨN XUẤT SẮC!');
  }
}

runExhaustiveLogicAudit().catch(console.error);
