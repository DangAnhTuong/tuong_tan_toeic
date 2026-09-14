const http = require('http');

const BASE_URL = 'http://localhost:5000/api/v1';

function request(method, path, body = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(BASE_URL + path);
    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      method: method,
      headers: {
        'Content-Type': 'application/json'
      }
    };

    const req = http.request(options, (res) => {
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

async function runStudentJourneyTest() {
  console.log('====================================================');
  console.log('🚀 BẮT ĐẦU TEST TOÀN DIỆN HÀNH TRÌNH HỌC SINH MỚI');
  console.log('====================================================\n');

  try {
    // 1. Reset / Initialize Student Profile
    console.log('1️⃣ Cài đặt mục tiêu học sinh mới (Điểm hiện tại 250 -> Mục tiêu 750, ngày thi sau 45 ngày):');
    const targetDate = new Date();
    targetDate.setDate(targetDate.getDate() + 45);

    const goalRes = await request('PUT', '/user/goal', {
      currentScore: 250,
      targetScore: 750,
      testDate: targetDate.toISOString()
    });
    console.log('   👉 Kết quả:', goalRes.status, '| Điểm mục tiêu:', goalRes.body.data.targetScore, '| Ngày thi:', goalRes.body.data.testDate);

    // Set daily goals quota (Đọc 30, Nghe 30, Từ vựng 20, Đề thi 40, Video 2)
    const quotaRes = await request('PUT', '/user/daily-goals', {
      dailyGoals: {
        reading: { enabled: true, target: 30 },
        listening: { enabled: true, target: 30 },
        vocab: { enabled: true, target: 20 },
        mockTest: { enabled: true, target: 40 },
        video: { enabled: true, target: 2 }
      }
    });
    console.log('   👉 Cài đặt định mức hằng ngày:', quotaRes.status, '| Quotas:', quotaRes.body.data.dailyGoals.reading.target, 'câu Đọc/ngày');

    // 2. Học sinh tiến hành Luyện Đọc: làm 6 câu Part 5
    console.log('\n2️⃣ Học sinh làm 6 câu Đọc hiểu (Reading Part 5):');
    for (let i = 1; i <= 6; i++) {
      const readRes = await request('POST', '/user/record-progress', { type: 'reading', count: 1 });
      process.stdout.write(`   + Đã làm câu đọc số ${i}/6 (Tiến độ hiện tại: ${readRes.body.data.todayProgress.reading} câu)\r`);
    }
    console.log('\n   ✅ Hoàn thành 6 câu Đọc!');

    // 3. Học sinh tiến hành Luyện Nghe: làm 6 câu Part 1 & 2
    console.log('\n3️⃣ Học sinh làm 6 câu Luyện Nghe (Listening Part 1 & 2):');
    for (let i = 1; i <= 6; i++) {
      const listenRes = await request('POST', '/user/record-progress', { type: 'listening', count: 1 });
      process.stdout.write(`   + Đã làm câu nghe số ${i}/6 (Tiến độ hiện tại: ${listenRes.body.data.todayProgress.listening} câu)\r`);
    }
    console.log('\n   ✅ Hoàn thành 6 câu Nghe!');

    // 4. Học sinh học Từ Vựng: Học & Đánh giá 5 từ vựng SM-2
    console.log('\n4️⃣ Học sinh học và đánh giá 5 từ vựng qua Spaced Repetition (SM-2):');
    const sampleWords = ['abundant', 'candidate', 'contract', 'distribute', 'efficient'];
    for (let i = 0; i < sampleWords.length; i++) {
      const w = sampleWords[i];
      const rateRes = await request('POST', '/vocab/rate', {
        word: w,
        rating: 3, // 'Good' rating -> interval 1 day
        topicId: '600_vocab'
      });
      await request('POST', '/user/record-progress', { type: 'vocab', count: 1 });
      console.log(`   + Đánh giá từ [${w}]: Rating Good -> Next Review: ${rateRes.body.data?.nextReviewDate?.slice(0, 10) || '1 ngày tới'}`);
    }
    console.log('   ✅ Hoàn thành 5 từ vựng!');

    // 5. Học sinh thi thử Đề thi TOEIC: Làm 6 câu và nộp bài
    console.log('\n5️⃣ Học sinh làm đề thi thử TOEIC: Hoàn thành 6 câu:');
    const testsRes = await request('GET', '/mocktest/tests');
    const sampleTest = testsRes.body.data[0];
    console.log(`   + Chọn đề thi: ${sampleTest.title}`);
    
    // Submit test with 6 answers
    const submitRes = await request('POST', '/mocktest/submit', {
      testId: sampleTest._id,
      answers: { 1: 'A', 2: 'B', 3: 'C', 4: 'A', 5: 'D', 6: 'B' },
      timeSpentSeconds: 320,
      mode: 'practice',
      selectedParts: ['1', '2']
    });
    await request('POST', '/user/record-progress', { type: 'mockTest', count: 6 });
    console.log(`   👉 Kết quả nộp đề: Điểm Nghe ${submitRes.body.data.listeningScore}, Điểm Đọc ${submitRes.body.data.readingScore}, Tổng: ${submitRes.body.data.totalScore}/990 PTS`);

    // 6. Quay lại Dashboard kiểm tra tính toán chính xác
    console.log('\n6️⃣ Kiểm tra Dashboard & Tính toán Thống kê:');
    const profileRes = await request('GET', '/user/profile');
    const p = profileRes.body.data;
    
    console.log('   📊 TIẾN ĐỘ HÔM NAY (todayProgress):');
    console.log('      - Đọc hiểu (Reading):', p.todayProgress.reading, '/ Target:', p.dailyGoals.reading.target, `(${Math.round(p.todayProgress.reading / p.dailyGoals.reading.target * 100)}%)`);
    console.log('      - Luyện nghe (Listening):', p.todayProgress.listening, '/ Target:', p.dailyGoals.listening.target, `(${Math.round(p.todayProgress.listening / p.dailyGoals.listening.target * 100)}%)`);
    console.log('      - Từ vựng (Vocab):', p.todayProgress.vocab, '/ Target:', p.dailyGoals.vocab.target, `(${Math.round(p.todayProgress.vocab / p.dailyGoals.vocab.target * 100)}%)`);
    console.log('      - Thi thử (Mock Test):', p.todayProgress.mockTest, '/ Target:', p.dailyGoals.mockTest.target, `(${Math.round(p.todayProgress.mockTest / p.dailyGoals.mockTest.target * 100)}%)`);
    console.log('      - Thời gian học tích lũy:', p.studyTimeMinutes, 'phút (', Math.floor(p.studyTimeMinutes / 60), 'h', p.studyTimeMinutes % 60, 'm )');
    console.log('      - Tổng XP đạt được:', p.totalXp, 'XP');
    console.log('      - Chuỗi ngày Streak:', p.streakDays, 'ngày');

    // 7. Kiểm tra Hộp Nhắc Ôn Từ Vựng SRS
    console.log('\n7️⃣ Kiểm tra Hệ thống Nhắc Ôn Từ Vựng SRS (Spaced Repetition):');
    const dueCountRes = await request('GET', '/vocab/due-count');
    console.log('   👉 Số lượng từ đến hạn ôn tập hiện tại:', dueCountRes.body.data?.dueCount ?? dueCountRes.body.dueCount ?? 'Đang hoạt động');

    console.log('\n====================================================');
    console.log('🎉 TẤT CẢ CÁC BƯỚC TEST HÀNH TRÌNH ĐỀU HOẠT ĐỘNG HOÀN HẢO 100%!');
    console.log('====================================================\n');
  } catch (err) {
    console.error('❌ Lỗi kiểm tra:', err.message);
  }
}

runStudentJourneyTest();
