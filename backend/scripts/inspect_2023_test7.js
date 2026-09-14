const mongoose = require('mongoose');
const https = require('https');

function pingUrl(url) {
  return new Promise((resolve) => {
    if (!url) return resolve({ status: 'no_url' });
    const req = https.request(url, { method: 'HEAD', timeout: 5000 }, (res) => {
      resolve({ status: res.statusCode });
    });
    req.on('error', (e) => resolve({ status: 'error', error: e.message }));
    req.on('timeout', () => { req.destroy(); resolve({ status: 'timeout' }); });
    req.end();
  });
}

async function run() {
  await mongoose.connect('mongodb://127.0.0.1:27017/tuong_tan_toeic');
  const db = mongoose.connection.db;
  const col = db.collection('listeningexercises');
  
  const t7Docs = await col.find({
    year: '2023',
    $or: [{ testNumber: 7 }, { title: /Test\s*0?7/i }]
  }).toArray();
  
  console.log(`Tìm thấy ${t7Docs.length} bài luyện cho 2023 Test 7:`);
  for (const doc of t7Docs) {
    console.log(`\n- Part: ${doc.part} | Title: ${doc.title} | Questions: ${doc.questions?.length || 0}`);
    if (doc.questions && doc.questions.length > 0) {
      const q = doc.questions[0];
      console.log(`  + Câu 1 audioUrl: ${q.audioUrl}`);
      const res = await pingUrl(q.audioUrl);
      console.log(`    Status ping: ${res.status}`);
      
      if (q.dialogueLines && q.dialogueLines.length > 0) {
        console.log(`  + Câu thoại 1 audioUrl: ${q.dialogueLines[0].audioUrl}`);
        const resLine = await pingUrl(q.dialogueLines[0].audioUrl);
        console.log(`    Status ping câu thoại: ${resLine.status}`);
      }
    }
  }

  // Also let's check a sample from 2026 and 2024 to verify
  const sample2026 = await col.findOne({ year: '2026', testNumber: 1 });
  if (sample2026 && sample2026.questions?.[0]) {
    const res = await pingUrl(sample2026.questions[0].audioUrl);
    console.log(`\nSample 2026 Test 1: ${sample2026.questions[0].audioUrl} -> Status: ${res.status}`);
  }

  const sample2024 = await col.findOne({ year: '2024', testNumber: 1 });
  if (sample2024 && sample2024.questions?.[0]) {
    const res = await pingUrl(sample2024.questions[0].audioUrl);
    console.log(`Sample 2024 Test 1: ${sample2024.questions[0].audioUrl} -> Status: ${res.status}`);
  }

  await mongoose.disconnect();
  process.exit(0);
}

run();
