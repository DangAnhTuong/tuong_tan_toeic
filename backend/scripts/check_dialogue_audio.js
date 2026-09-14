const mongoose = require('mongoose');
const https = require('https');

function ping(url) {
  return new Promise((resolve) => {
    if (!url) return resolve(null);
    try {
      const req = https.get(url, { timeout: 3000 }, (res) => resolve(res.statusCode))
        .on('error', () => resolve(null))
        .on('timeout', () => { req.destroy(); resolve(null); });
    } catch {
      resolve(null);
    }
  });
}

async function checkDialogueAudios() {
  await mongoose.connect('mongodb://127.0.0.1:27017/tuong_tan_toeic');
  const db = mongoose.connection.db;
  const col = db.collection('listeningexercises');

  // Let's sample 5 dialogueLines from Part 3 and Part 4
  const docs = await col.find({
    part: { $in: [3, 4] },
    'questions.dialogueLines.0': { $exists: true }
  }).limit(10).toArray();

  console.log(`Found ${docs.length} docs with dialogueLines`);
  for (const doc of docs) {
    const q = doc.questions.find(x => x.dialogueLines && x.dialogueLines.length > 0);
    if (q && q.dialogueLines[0]) {
      const line = q.dialogueLines[0];
      const code = await ping(line.audioUrl);
      console.log(`[${doc.year || 'NoYear'} P${doc.part}] ${line.audioUrl?.slice(-40)} -> Status: ${code}`);
    }
  }

  await mongoose.disconnect();
  process.exit(0);
}

checkDialogueAudios();
