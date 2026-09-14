const https = require('https');
const http = require('http');

const LIVE_DOMAIN = 'https://toeic.danganhtuong.dev';

function fetchJson(url) {
  return new Promise((resolve, reject) => {
    const client = url.startsWith('https') ? https : http;
    const req = client.get(url, { headers: { 'User-Agent': 'TuongTanToeic-LiveAudit/1.0' } }, (res) => {
      let data = '';
      res.on('data', chunk => { data += chunk; });
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          reject(new Error(`Failed to parse JSON from ${url}: ${data.slice(0, 100)}`));
        }
      });
    });
    req.on('error', reject);
    req.setTimeout(25000, () => { req.destroy(); reject(new Error(`Timeout fetching ${url}`)); });
  });
}

async function auditLiveReading() {
  console.log('================================================================');
  console.log(`📖 BẮT ĐẦU KIỂM TRA GIAI ĐOẠN 2: LUYỆN ĐỌC & SONG NGỮ TRÊN LIVE DOMAIN: ${LIVE_DOMAIN}`);
  console.log('================================================================\n');

  const modes = ['level', 'grammar', 'bilingual'];
  const summary = {
    totalModes: modes.length,
    totalExercises: 0,
    totalQuestions: 0,
    bilingualArticles: 0,
    missingPrompt: 0,
    missingOptions: 0,
    missingOptionTrans: 0,
    missingExplanation: 0,
    missingPassage: 0
  };

  for (const mode of modes) {
    console.log(`📡 Đang tải danh sách bài tập Reading Mode: [${mode.toUpperCase()}] từ /api/v1/reading/exercises?mode=${mode}...`);
    const res = await fetchJson(`${LIVE_DOMAIN}/api/v1/reading/exercises?mode=${mode}`);
    if (!res.success || !Array.isArray(res.data)) {
      console.error(`❌ Không tải được danh sách bài tập mode ${mode}`);
      continue;
    }

    const list = res.data;
    summary.totalExercises += list.length;
    console.log(`   ✅ Mode [${mode}]: Tìm thấy ${list.length} chuyên đề / cấp độ.`);

    for (let i = 0; i < list.length; i++) {
      const exMeta = list[i];
      if (mode === 'bilingual') summary.bilingualArticles++;

      const detailRes = await fetchJson(`${LIVE_DOMAIN}/api/v1/reading/exercises/${exMeta._id}`);
      const ex = detailRes.data || exMeta;
      const qList = ex.questions || [];
      summary.totalQuestions += qList.length;

      qList.forEach(q => {
        if (!q.prompt || q.prompt.trim() === '') summary.missingPrompt++;
        if (!q.options || q.options.length < 2) summary.missingOptions++;
        (q.options || []).forEach(o => {
          if (!o.translation || o.translation.trim() === '') summary.missingOptionTrans++;
        });
        if (!q.explanation || q.explanation.trim().length < 5) summary.missingExplanation++;
        if ((ex.part === 6 || ex.part === 7) && (!q.passageText && !ex.passageText && !q.passage)) {
          summary.missingPassage++;
        }
      });
    }
  }

  console.log('\n================================================================');
  console.log('🏁 TỔNG KẾT KIỂM TRA GIAI ĐOẠN 2 (LUYỆN ĐỌC & SONG NGỮ LIVE):');
  console.log(`   - Tổng số chuyên đề/bài tập: ${summary.totalExercises}`);
  console.log(`   - Tổng số câu hỏi Reading kiểm tra: ${summary.totalQuestions}`);
  console.log(`   - Bài đọc Song Ngữ chuẩn Đậu TOEIC: ${summary.bilingualArticles} bài`);
  console.log(`   - Câu thiếu nội dung câu hỏi: ${summary.missingPrompt}`);
  console.log(`   - Câu thiếu phương án A-B-C-D: ${summary.missingOptions}`);
  console.log(`   - Phương án thiếu dịch: ${summary.missingOptionTrans}`);
  console.log(`   - Câu thiếu lời giải thích: ${summary.missingExplanation}`);
  console.log(`   - Đoạn văn Part 6 & 7 thiếu văn bản bài đọc: ${summary.missingPassage}`);
  console.log('================================================================\n');

  return summary;
}

auditLiveReading().catch(console.error);
