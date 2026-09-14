const mongoose = require('mongoose');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/tuong_tan_toeic';

async function syncFields() {
  await mongoose.connect(MONGODB_URI);
  const db = mongoose.connection.db;

  const docs = await db.collection('readingexercises').find({}).toArray();
  let updatedQuestions = 0;

  for (const doc of docs) {
    let changed = false;
    for (const q of (doc.questions || [])) {
      if (!q.translation && q.promptTranslation) {
        q.translation = q.promptTranslation;
        changed = true;
        updatedQuestions++;
      }
      if (!q.promptTranslation && q.translation) {
        q.promptTranslation = q.translation;
        changed = true;
        updatedQuestions++;
      }
    }
    if (changed) {
      await db.collection('readingexercises').updateOne(
        { _id: doc._id },
        { $set: { questions: doc.questions } }
      );
    }
  }

  console.log(`✅ Synced missing translation/promptTranslation fields: ${updatedQuestions} questions updated.`);
  await mongoose.disconnect();
}

syncFields().catch(console.error);
