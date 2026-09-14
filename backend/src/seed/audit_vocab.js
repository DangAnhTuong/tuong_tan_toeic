const mongoose = require('mongoose');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/tuong_tan_toeic';

async function auditVocab() {
  await mongoose.connect(MONGODB_URI);
  const db = mongoose.connection.db;

  const topics = await db.collection('vocabularytopics').find({}).toArray();
  console.log(`Found ${topics.length} vocabulary topics.`);

  let totalWords = 0;
  let missingMeaning = 0;
  let placeholderMeaning = 0;
  let missingExampleVi = 0;

  for (const t of topics) {
    const checkWord = (w) => {
      totalWords++;
      const meaning = (w.meaning || '').trim();
      const exampleEn = (w.exampleEn || w.example || '').trim();
      const exampleVi = (w.exampleVi || w.exampleTrans || '').trim();

      if (!meaning) missingMeaning++;
      if (meaning.includes('từ vựng cốt lõi') || meaning === w.word) placeholderMeaning++;
      if (exampleEn && !exampleVi) missingExampleVi++;
    };

    (t.words || []).forEach(checkWord);
    (t.parts || []).forEach(p => (p.words || []).forEach(checkWord));
  }

  console.log(`Vocabulary Audit:`);
  console.log(`- Total Words: ${totalWords}`);
  console.log(`- Missing Meaning: ${missingMeaning}`);
  console.log(`- Placeholder Meaning: ${placeholderMeaning}`);
  console.log(`- Missing Example Vietnamese: ${missingExampleVi}`);

  process.exit(0);
}

auditVocab().catch(e => { console.error(e); process.exit(1); });
