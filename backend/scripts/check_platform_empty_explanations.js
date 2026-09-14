const mongoose = require('mongoose');

async function checkAllCollectionsForEmptyExplanations() {
  await mongoose.connect('mongodb://127.0.0.1:27017/tuong_tan_toeic');
  const db = mongoose.connection.db;

  console.log('=== CHECKING EMPTY/PLACEHOLDER EXPLANATIONS PLATFORM-WIDE ===');

  // 1. Reading exercises
  const rDocs = await db.collection('readingexercises').find({}).toArray();
  let rEmpty = 0, rPlaceholder = 0;
  rDocs.forEach(d => {
    (d.questions || []).forEach(q => {
      const exp = (q.explanation || '').trim();
      if (!exp) rEmpty++;
      else if (/đang cập nhật|chưa có giải thích|lời giải đang được chuẩn bị/i.test(exp)) rPlaceholder++;
    });
  });
  console.log(`readingexercises (all parts): empty=${rEmpty}, placeholder=${rPlaceholder}`);

  // 2. Mock tests
  const mDocs = await db.collection('mocktests').find({}).toArray();
  let mEmpty = 0, mPlaceholder = 0;
  mDocs.forEach(d => {
    (d.questions || []).forEach(q => {
      const exp = (q.explanation || '').trim();
      if (!exp) mEmpty++;
      else if (/đang cập nhật|chưa có giải thích|lời giải đang được chuẩn bị/i.test(exp)) mPlaceholder++;
    });
  });
  console.log(`mocktests (2000 questions): empty=${mEmpty}, placeholder=${mPlaceholder}`);

  // 3. Listening exercises
  const lDocs = await db.collection('listeningexercises').find({}).toArray();
  let lEmpty = 0, lPlaceholder = 0;
  lDocs.forEach(d => {
    (d.questions || []).forEach(q => {
      const exp = (q.explanation || '').trim();
      if (!exp) lEmpty++;
      else if (/đang cập nhật|chưa có giải thích|lời giải đang được chuẩn bị/i.test(exp)) lPlaceholder++;
    });
  });
  console.log(`listeningexercises (questions): empty=${lEmpty}, placeholder=${lPlaceholder}`);

  await mongoose.disconnect();
  process.exit(0);
}

checkAllCollectionsForEmptyExplanations().catch(console.error);
