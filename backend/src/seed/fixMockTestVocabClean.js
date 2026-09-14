const mongoose = require('mongoose');

async function run() {
  await mongoose.connect('mongodb://127.0.0.1:27017/tuong_tan_toeic');
  console.log('Connected to MongoDB');

  const tests = await mongoose.connection.db.collection('mocktests').find({}).toArray();
  console.log(`Found ${tests.length} tests to clean...`);

  let totalQuestionsFixed = 0;

  for (const test of tests) {
    let modified = false;
    for (const q of test.questions) {
      // 1. If tuVung has JSON string, parse it cleanly
      if (q.tuVung && typeof q.tuVung === 'string') {
        try {
          const raw = JSON.parse(q.tuVung);
          if (Array.isArray(raw)) {
            const cleanList = raw.map(item => ({
              word: item.word || item.lemma || '',
              pos: item.pos || 'n',
              level: item.cefr || item.level || 'B1',
              meaning: item.meaning_vi || item.meaning || item.vi || '',
              phonetic: item.ipa_us ? `/${item.ipa_us}/` : '',
              ipaUS: item.ipa_us || '',
              ipaUK: item.ipa_uk || '',
              _id: new mongoose.Types.ObjectId()
            })).filter(item => item.word && !item.word.includes('{') && !item.word.includes('[') && !item.word.includes('"'));

            if (cleanList.length > 0) {
              q.vocabularyList = cleanList;
              modified = true;
              totalQuestionsFixed++;
            }
          }
        } catch (e) {
          // If not JSON, ignore
        }
      }

      // 2. Filter out corrupted vocabularyList items
      if (q.vocabularyList && Array.isArray(q.vocabularyList)) {
        const originalLen = q.vocabularyList.length;
        q.vocabularyList = q.vocabularyList.filter(v => {
          if (!v || !v.word) return false;
          if (typeof v.word !== 'string') return false;
          if (v.word.includes('{') || v.word.includes('[') || v.word.includes('"') || v.word.includes('vocabulary')) return false;
          if (v.meaning && (v.meaning.includes('lemma') || v.meaning.includes('cefr') || v.meaning.includes('ipa_us'))) return false;
          return true;
        });
        if (q.vocabularyList.length !== originalLen) {
          modified = true;
        }
      }
    }

    if (modified) {
      await mongoose.connection.db.collection('mocktests').updateOne(
        { _id: test._id },
        { $set: { questions: test.questions } }
      );
    }
  }

  console.log(`✅ Successfully cleaned vocabulary for ${totalQuestionsFixed} questions across all tests!`);
  process.exit(0);
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
