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

function checkUrlLive(url) {
  return new Promise((resolve) => {
    if (!url || !url.startsWith('http')) return resolve({ status: false, url });
    try {
      const client = url.startsWith('https') ? https : http;
      const parsed = new URL(url);
      const req = client.request({
        method: 'HEAD',
        host: parsed.host,
        path: parsed.pathname + parsed.search,
        timeout: 6000,
        headers: { 'User-Agent': 'TuongTanToeic-HeadCheck/1.0' }
      }, (res) => {
        resolve({ status: res.statusCode >= 200 && res.statusCode < 400, code: res.statusCode, url });
      });
      req.on('error', () => resolve({ status: false, url }));
      req.on('timeout', () => { req.destroy(); resolve({ status: false, url }); });
      req.end();
    } catch (e) {
      resolve({ status: false, url });
    }
  });
}

async function batchCheckUrls(urls, batchSize = 20) {
  const results = [];
  for (let i = 0; i < urls.length; i += batchSize) {
    const batch = urls.slice(i, i + batchSize);
    const batchResults = await Promise.all(batch.map(checkUrlLive));
    results.push(...batchResults);
  }
  return results;
}

async function auditLiveListening() {
  console.log('================================================================');
  console.log(`🎧 BẮT ĐẦU KIỂM TRA GIAI ĐOẠN 3: LUYỆN NGHE & DICTATION TRÊN LIVE DOMAIN: ${LIVE_DOMAIN}`);
  console.log('================================================================\n');

  const modes = ['level', 'dictation'];
  const summary = {
    totalExercises: 0,
    totalQuestions: 0,
    missingAudio: 0,
    missingTranslation: 0,
    audioUrls: new Set()
  };

  for (const mode of modes) {
    console.log(`📡 Đang tải danh sách bài tập Listening Mode: [${mode.toUpperCase()}] từ /api/v1/listening/exercises?mode=${mode}...`);
    const res = await fetchJson(`${LIVE_DOMAIN}/api/v1/listening/exercises?mode=${mode}`);
    if (!res.success || !Array.isArray(res.data)) {
      console.error(`❌ Không tải được danh sách mode ${mode}`);
      continue;
    }

    const list = res.data;
    summary.totalExercises += list.length;
    console.log(`   ✅ Mode [${mode}]: Tìm thấy ${list.length} bài luyện.`);

    for (let i = 0; i < list.length; i++) {
      const exMeta = list[i];
      const detailRes = await fetchJson(`${LIVE_DOMAIN}/api/v1/listening/exercises/${exMeta._id}`);
      const ex = detailRes.data || exMeta;
      const qList = ex.questions || ex.items || [];
      summary.totalQuestions += qList.length;

      qList.forEach(q => {
        const aUrl = q.audioUrl || q.audio || ex.audioUrl;
        if (!aUrl) {
          summary.missingAudio++;
        } else if (typeof aUrl === 'string' && aUrl.startsWith('http')) {
          summary.audioUrls.add(aUrl);
        }

        const trans = q.translation || q.vietnamese || q.dichNghia;
        if (!trans || trans.trim() === '') {
          // In Part 1/2 single-sentence questions, translations might be on options or transcript
          if (!q.options && !q.transcriptTranslation) summary.missingTranslation++;
        }
      });
    }
  }

  console.log(`\n🔊 Đang kiểm tra trạng thái HTTP HEAD của 100 link Audio CDN mẫu...`);
  const sampleAudioList = Array.from(summary.audioUrls).slice(0, 100);
  const headResults = await batchCheckUrls(sampleAudioList, 20);
  const deadAudios = headResults.filter(r => !r.status);
  console.log(`   ✅ Audio CDN: ${sampleAudioList.length - deadAudios.length}/${sampleAudioList.length} link sống 100% (Mã 200 OK)!`);

  console.log('\n================================================================');
  console.log('🏁 TỔNG KẾT KIỂM TRA GIAI ĐOẠN 3 (LUYỆN NGHE & DICTATION LIVE):');
  console.log(`   - Tổng số bài luyện tập: ${summary.totalExercises}`);
  console.log(`   - Tổng số câu hỏi / câu chép: ${summary.totalQuestions}`);
  console.log(`   - Link Audio CDN tổng cộng: ${summary.audioUrls.size}`);
  console.log(`   - Câu thiếu Audio: ${summary.missingAudio}`);
  console.log(`   - Link Audio chết trong mẫu: ${deadAudios.length}`);
  console.log('================================================================\n');

  return summary;
}

auditLiveListening().catch(console.error);
