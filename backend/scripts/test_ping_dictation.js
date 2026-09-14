const mongoose = require('mongoose');
const https = require('https');

async function testDictationAudio() {
  await mongoose.connect('mongodb://127.0.0.1:27017/tuong_tan_toeic');
  const db = mongoose.connection.db;
  const docs = await db.collection('listeningexercises').find({ mode: 'dictation' }).toArray();
  const allAudioUrls = [];
  for (const d of docs) {
    for (const l of (d.lessons || [])) {
      for (const s of (l.sentences || [])) {
        if (s.audioUrl && s.audioUrl.startsWith('http')) {
          allAudioUrls.push(s.audioUrl);
        }
      }
    }
  }
  console.log('Total dictation audio URLs:', allAudioUrls.length);
  const sample = [];
  for (let i = 0; i < 30; i++) {
    sample.push(allAudioUrls[Math.floor(Math.random() * allAudioUrls.length)]);
  }

  let passed = 0;
  let failed = 0;
  for (const url of sample) {
    await new Promise(res => {
      https.request(url, { method: 'HEAD', timeout: 5000 }, r => {
        if (r.statusCode >= 200 && r.statusCode < 400) passed++;
        else {
          failed++;
          console.log('FAILED:', r.statusCode, url);
        }
        res();
      }).on('error', err => {
        failed++;
        console.log('ERR:', err.message, url);
        res();
      }).end();
    });
  }
  console.log('Sample ping tested: 30 | Passed: ' + passed + ' | Failed: ' + failed);
  process.exit(0);
}

testDictationAudio().catch(console.error);
