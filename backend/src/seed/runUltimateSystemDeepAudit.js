const mongoose = require('mongoose');
const http = require('http');
const https = require('https');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/tuong_tan_toeic';

// Known proper nouns that SHOULD remain in original English/Latin script
const KNOWN_PROPER_NOUNS = new Set([
  'priya anand', 'ana sorrentino', 'bram de wit', 'hugo marchetti', 'duncan reyes',
  'gerald ngata', 'tessa okonkwo', 'bernard lusk', 'denton', 'dublin', 'galway',
  'belfast', 'aldgate', 'brixton', 'camden', 'dalston', 'mr. adeyemi', 'ms. adeyemi',
  'adeyemi', 'holloway', 'holloway garden', 'brightwater'
]);

function checkUrlLive(url) {
  return new Promise((resolve) => {
    if (!url || !url.startsWith('http')) return resolve(false);
    try {
      const client = url.startsWith('https') ? https : http;
      const req = client.request(url, { method: 'HEAD', timeout: 4000 }, (res) => {
        resolve(res.statusCode >= 200 && res.statusCode < 400);
      });
      req.on('error', () => resolve(false));
      req.on('timeout', () => { req.destroy(); resolve(false); });
      req.end();
    } catch (e) {
      resolve(false);
    }
  });
}

async function runUltimateAudit() {
  console.log('🚀 BẮT ĐẦU TỔNG RÀ SOÁT CHUYÊN SÂU TOÀN DIỆN HỆ THỐNG TƯỜNG TẬN TOEIC...');
  await mongoose.connect(MONGODB_URI, { serverSelectionTimeoutMS: 5000 });
  const db = mongoose.connection.db;

  const report = {
    timestamp: new Date().toISOString(),
    collectionsCount: 0,
    mockTests: { total: 0, questions: 0, missingOptTrans: [], missingExpl: 0, sampleAudioLive: 0, sampleAudioTotal: 0 },
    reading: { total: 0, questions: 0, missingOptTrans: [], missingExpl: 0, sampleImagesLive: 0, sampleImagesTotal: 0 },
    listening: { total: 0, questions: 0, missingOptTrans: [], missingAudio: 0, sampleAudioLive: 0, sampleAudioTotal: 0 },
    vocab: { topics: 0, totalWords: 0, missingDefs: 0, missingIPA: 0 },
    users: { realUsersCount: 0, sampleTopXp: 0 }
  };

  // 0. Collections
  const collections = await db.listCollections().toArray();
  report.collectionsCount = collections.length;
  console.log(`📦 Tổng cộng: ${collections.length} Collections trong MongoDB.`);

  // 1. Audit MockTests
  console.log('\n--- 1. Kiểm tra MockTests (Bộ Đề ETS Quốc Tế) ---');
  const mockDocs = await db.collection('mocktests').find({}).toArray();
  report.mockTests.total = mockDocs.length;
  let audioSamples = [];

  for (const test of mockDocs) {
    for (const q of (test.questions || [])) {
      report.mockTests.questions++;
      if (q.audioUrl && audioSamples.length < 5) audioSamples.push(q.audioUrl);
      if (!q.explanation || q.explanation.length < 10) report.mockTests.missingExpl++;
      for (const o of (q.options || [])) {
        if (!o.translation || o.translation.trim() === '') {
          report.mockTests.missingOptTrans.push({ test: test.title, qNum: q.questionNum, part: q.part, text: o.text, reason: 'empty' });
        } else if (/[a-zA-Z]/.test(o.text) && !/[0-9]/.test(o.text)) {
          const raw = o.text.trim().toLowerCase();
          const tr = o.translation.trim().toLowerCase();
          if (raw === tr && !KNOWN_PROPER_NOUNS.has(raw)) {
            report.mockTests.missingOptTrans.push({ test: test.title, qNum: q.questionNum, part: q.part, text: o.text, reason: 'untranslated_word' });
          }
        }
      }
    }
  }

  // Check sample audio live
  report.mockTests.sampleAudioTotal = audioSamples.length;
  for (const aUrl of audioSamples) {
    const isLive = await checkUrlLive(aUrl);
    if (isLive) report.mockTests.sampleAudioLive++;
  }

  console.log(`   - Tổng bộ đề: ${report.mockTests.total}`);
  console.log(`   - Tổng câu hỏi: ${report.mockTests.questions}`);
  console.log(`   - Câu thiếu giải thích: ${report.mockTests.missingExpl}`);
  console.log(`   - Phương án tiếng Anh chưa dịch (không tính tên riêng): ${report.mockTests.missingOptTrans.length}`);
  console.log(`   - Mẫu Audio CDN kiểm tra trực tiếp: ${report.mockTests.sampleAudioLive}/${report.mockTests.sampleAudioTotal} sống`);

  // 2. Audit ReadingExercises
  console.log('\n--- 2. Kiểm tra ReadingExercises (Part 5, 6, 7 & Ngữ pháp) ---');
  const readingDocs = await db.collection('readingexercises').find({}).toArray();
  report.reading.total = readingDocs.length;
  let imageSamples = [];

  for (const doc of readingDocs) {
    for (const q of (doc.questions || [])) {
      report.reading.questions++;
      if (q.image && imageSamples.length < 5) imageSamples.push(q.image);
      if (!q.explanation || q.explanation.length < 10) report.reading.missingExpl++;
      for (const o of (q.options || [])) {
        if (!o.translation || o.translation.trim() === '') {
          report.reading.missingOptTrans.push({ title: doc.title, qNum: q.questionNum, text: o.text, reason: 'empty' });
        } else if (/[a-zA-Z]/.test(o.text) && !/[0-9]/.test(o.text)) {
          const raw = o.text.trim().toLowerCase();
          const tr = o.translation.trim().toLowerCase();
          if (raw === tr && !KNOWN_PROPER_NOUNS.has(raw)) {
            report.reading.missingOptTrans.push({ title: doc.title, qNum: q.questionNum, text: o.text, reason: 'untranslated_word' });
          }
        }
      }
    }
  }

  report.reading.sampleImagesTotal = imageSamples.length;
  for (const imgUrl of imageSamples) {
    const isLive = await checkUrlLive(imgUrl);
    if (isLive) report.reading.sampleImagesLive++;
  }

  console.log(`   - Tổng chuyên đề/level: ${report.reading.total}`);
  console.log(`   - Tổng câu hỏi Reading: ${report.reading.questions}`);
  console.log(`   - Câu thiếu giải thích: ${report.reading.missingExpl}`);
  console.log(`   - Phương án tiếng Anh chưa dịch (không tính tên riêng): ${report.reading.missingOptTrans.length}`);
  console.log(`   - Mẫu Image CDN kiểm tra trực tiếp: ${report.reading.sampleImagesLive}/${report.reading.sampleImagesTotal} sống`);

  // 3. Audit ListeningExercises
  console.log('\n--- 3. Kiểm tra ListeningExercises (Part 1, 2, 3, 4 & Dictation) ---');
  const listenDocs = await db.collection('listeningexercises').find({}).toArray();
  report.listening.total = listenDocs.length;
  let listenAudioSamples = [];

  for (const doc of listenDocs) {
    for (const q of (doc.questions || [])) {
      report.listening.questions++;
      if (q.audioUrl && listenAudioSamples.length < 5) listenAudioSamples.push(q.audioUrl);
      if (!q.audioUrl) report.listening.missingAudio++;
      for (const o of (q.options || [])) {
        if (!o.translation && !o.vietnamese) {
          report.listening.missingOptTrans.push({ title: doc.title, qNum: q.questionNum, text: o.text });
        }
      }
    }
  }

  report.listening.sampleAudioTotal = listenAudioSamples.length;
  for (const aUrl of listenAudioSamples) {
    const isLive = await checkUrlLive(aUrl);
    if (isLive) report.listening.sampleAudioLive++;
  }

  console.log(`   - Tổng bài luyện Listening: ${report.listening.total}`);
  console.log(`   - Tổng câu hỏi Listening: ${report.listening.questions}`);
  console.log(`   - Câu thiếu Audio: ${report.listening.missingAudio}`);
  console.log(`   - Phương án thiếu dịch: ${report.listening.missingOptTrans.length}`);
  console.log(`   - Mẫu Audio CDN kiểm tra trực tiếp: ${report.listening.sampleAudioLive}/${report.listening.sampleAudioTotal} sống`);

  // 4. Audit Vocab
  console.log('\n--- 4. Kiểm tra Vocabularies & Topics ---');
  const vTopicCount = await db.collection('vocabularytopics').countDocuments();
  report.vocab.topics = vTopicCount;
  const vocabDocs = await db.collection('vocabularytopics').find({}).toArray();
  for (const t of vocabDocs) {
    for (const w of (t.words || [])) {
      report.vocab.totalWords++;
      if (!w.meaning && !w.vietnamese) report.vocab.missingDefs++;
      if (!w.ipa && !w.phonetic) report.vocab.missingIPA++;
    }
  }
  console.log(`   - Tổng chủ đề từ vựng: ${report.vocab.topics}`);
  console.log(`   - Tổng từ vựng: ${report.vocab.totalWords}`);
  console.log(`   - Từ thiếu định nghĩa: ${report.vocab.missingDefs}`);
  console.log(`   - Từ thiếu phiên âm IPA: ${report.vocab.missingIPA}`);

  // 5. Audit Real Users Integrity
  console.log('\n--- 5. Kiểm tra Toàn vẹn Người dùng (Users Collection) ---');
  report.users.realUsersCount = await db.collection('users').countDocuments();
  const topXpUser = await db.collection('users').findOne({}, { sort: { totalXp: -1 } });
  report.users.sampleTopXp = topXpUser?.totalXp || 0;
  console.log(`   - Tổng tài khoản thật: ${report.users.realUsersCount}`);
  console.log(`   - Top XP tài khoản thật cao nhất: ${topXpUser?.fullName} (${report.users.sampleTopXp} XP)`);

  console.log('\n================================================================');
  console.log('🎯 KẾT QUẢ TỔNG QUAN RÀ SOÁT:');
  console.log(`   - Tổng câu hỏi toàn sàn: ${report.mockTests.questions + report.reading.questions + report.listening.questions}`);
  console.log(`   - MockTest thiếu dịch phương án: ${report.mockTests.missingOptTrans.length}`);
  console.log(`   - Reading thiếu dịch phương án: ${report.reading.missingOptTrans.length}`);
  console.log(`   - Listening thiếu Audio: ${report.listening.missingAudio}`);
  console.log('================================================================\n');

  await mongoose.disconnect();
  return report;
}

runUltimateAudit().then((r) => {
  const fs = require('fs');
  const path = require('path');
  fs.writeFileSync(path.join(__dirname, 'ultimate_audit_summary.json'), JSON.stringify(r, null, 2));
  console.log('✅ Đã lưu kết quả chi tiết vào ultimate_audit_summary.json');
  process.exit(0);
}).catch(err => {
  console.error(err);
  process.exit(1);
});
