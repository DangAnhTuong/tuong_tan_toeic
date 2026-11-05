const mongoose = require('../backend/node_modules/mongoose');

async function check() {
  await mongoose.connect('mongodb://127.0.0.1:27017/tuong_tan_toeic');
  const coll = mongoose.connection.collection('listeningexercises');
  const all = await coll.find({}).toArray();
  console.log('Total documents:', all.length);

  let dummyOptionsCount = 0;
  let realOptionsCount = 0;
  let totalQuestions = 0;

  for (const doc of all) {
    if (!doc.questions || doc.questions.length === 0) continue;
    let docDummy = 0;
    let docReal = 0;
    for (const q of doc.questions) {
      totalQuestions++;
      const isDummy = q.options && q.options.length > 0 && q.options.every(o => {
        const t = (o.text || '').trim();
        return t === `(${o.label})` || t === o.label || t === '';
      });
      if (isDummy) {
        dummyOptionsCount++;
        docDummy++;
      } else {
        realOptionsCount++;
        docReal++;
      }
    }
    if (docDummy > 0) {
      console.log(`Doc [${doc.title}] mode: ${doc.mode} part: ${doc.part} has ${docDummy}/${doc.questions.length} dummy options`);
    }
  }

  console.log({ totalQuestions, dummyOptionsCount, realOptionsCount });
  await mongoose.disconnect();
}

check().catch(console.error);

