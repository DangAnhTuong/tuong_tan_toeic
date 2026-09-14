const mongoose = require('mongoose');

async function checkAudioYears() {
  await mongoose.connect('mongodb://localhost:27017/tuong_tan_toeic');
  const db = mongoose.connection.db;

  const t1 = await db.collection('mocktests').findOne({ _id: new mongoose.Types.ObjectId('6a91b92f6d1938ebacd99e14') });
  const t2 = await db.collection('mocktests').findOne({ _id: new mongoose.Types.ObjectId('6a91b9306d1938ebacd9ced2') });

  console.log('T1 sample audio:', t1.questions.find(q => q.audioUrl)?.audioUrl);
  console.log('T2 sample audio:', t2.questions.find(q => q.audioUrl)?.audioUrl);

  process.exit(0);
}

checkAudioYears().catch(e => { console.error(e); process.exit(1); });
