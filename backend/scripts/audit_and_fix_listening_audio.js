const mongoose = require('mongoose');
const https = require('https');

function ping(url) {
  return new Promise((resolve) => {
    if (!url) return resolve(null);
    try {
      https.get(url, { timeout: 3000 }, (res) => resolve(res.statusCode))
        .on('error', () => resolve(null))
        .on('timeout', () => resolve(null));
    } catch {
      resolve(null);
    }
  });
}

async function auditAndFixListeningAudio() {
  await mongoose.connect('mongodb://127.0.0.1:27017/tuong_tan_toeic');
  const db = mongoose.connection.db;
  const col = db.collection('listeningexercises');

  // Fix known 2023 Test 07 32-34.mp3 -> 32_34.mp3
  console.log('Fixing 2023 Test 07 32-34.mp3 to 32_34.mp3...');
  await col.updateMany(
    { year: '2023', 'questions.audioUrl': /Test\s*0?7\/32-34\.mp3/i },
    { $set: { 'questions.$[elem].audioUrl': 'https://qfhmnlvgweznzcsoijyr.supabase.co/storage/v1/object/public/mock-test-media/2023/Test 07/32_34.mp3' } },
    { arrayFilters: [{ 'elem.audioUrl': /Test\s*0?7\/32-34\.mp3/i }] }
  );

  // Fix 2023 Test 1: Test 01 -> TEST_1
  console.log('Fixing 2023 Test 01 to TEST_1...');
  const t1Docs = await col.find({ year: '2023', $or: [{ testNumber: 1 }, { title: /test\s*0?1/i }] }).toArray();
  for (const doc of t1Docs) {
    let changed = false;
    (doc.questions || []).forEach(q => {
      if (q.audioUrl && q.audioUrl.includes('2023/Test 01')) {
        q.audioUrl = q.audioUrl.replace('2023/Test 01', '2023/TEST_1');
        changed = true;
      }
    });
    (doc.lessons || []).forEach(l => {
      (l.sentences || []).forEach(s => {
        if (s.audioUrl && s.audioUrl.includes('2023/Test 01')) {
          s.audioUrl = s.audioUrl.replace('2023/Test 01', '2023/TEST_1');
          changed = true;
        }
      });
    });
    if (changed) {
      await col.updateOne({ _id: doc._id }, { $set: { questions: doc.questions, lessons: doc.lessons } });
    }
  }

  // Ping a sample of audio URLs from every test
  console.log('Auditing audio samples across all years...');
  const testsSummary = [];
  const years = ['2026', '2024', '2023'];

  for (const y of years) {
    for (let t = 1; t <= 10; t++) {
      const doc = await col.findOne({
        year: y,
        $or: [{ testNumber: t }, { title: new RegExp(`test\\s*0?${t}\\b`, 'i') }]
      });
      if (doc && doc.questions && doc.questions.length > 0) {
        const sampleQ = doc.questions[0].audioUrl;
        const code = await ping(sampleQ);
        testsSummary.push({ year: y, test: t, part: doc.part, status: code, url: sampleQ });
      }
    }
  }

  console.table(testsSummary);

  await mongoose.disconnect();
  console.log('Audit completed successfully!');
  process.exit(0);
}

auditAndFixListeningAudio().catch(console.error);
