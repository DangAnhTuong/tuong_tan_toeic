const mongoose = require('../backend/node_modules/mongoose');

async function check() {
  await mongoose.connect('mongodb://127.0.0.1:27017/tuong_tan_toeic');
  const coll = mongoose.connection.collection('listeningexercises');

  const p1Exercises = await coll.find({ part: 1 }).toArray();
  let bareImgCount = 0;
  let bareAudioCount = 0;
  let totalQ = 0;

  for (const ex of p1Exercises) {
    for (const q of (ex.questions || [])) {
      totalQ++;
      if (q.imageUrl && !q.imageUrl.startsWith('/') && !q.imageUrl.startsWith('http')) {
        bareImgCount++;
        if (bareImgCount <= 5) console.log('Bare img in:', ex.title, 'q:', q.questionNumber, 'img:', q.imageUrl);
      }
      if (q.audioUrl && !q.audioUrl.startsWith('/') && !q.audioUrl.startsWith('http')) {
        bareAudioCount++;
        if (bareAudioCount <= 5) console.log('Bare audio in:', ex.title, 'q:', q.questionNumber, 'audio:', q.audioUrl);
      }
    }
  }

  console.log({ totalQ, bareImgCount, bareAudioCount });
  await mongoose.disconnect();
}

check().catch(console.error);

