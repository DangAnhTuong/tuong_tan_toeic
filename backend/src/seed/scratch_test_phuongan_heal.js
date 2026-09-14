const mongoose = require('mongoose');
const { READING_OPTION_DICT } = require('./readingMasterOptionTranslator');
const { initMongoVocab, getExactOptionTranslation } = require('../utils/exactOptionTranslator');

async function testPhuongAnHealing() {
  await mongoose.connect('mongodb://localhost:27017/tuong_tan_toeic');
  await initMongoVocab(mongoose);

  const col = mongoose.connection.db.collection('readingexercises');
  const docs = await col.find({ 'questions.options.translation': /Phương án:/i }).toArray();

  let totalPhuongAn = 0;
  let healedCount = 0;
  let sampleHealed = [];

  for (const d of docs) {
    for (const q of (d.questions || [])) {
      for (const o of (q.options || [])) {
        if ((o.translation || '').includes('Phương án:')) {
          totalPhuongAn++;
          const cleanText = (o.text || '').trim();
          const newTrans = getExactOptionTranslation(cleanText, o.translation);
          if (newTrans && !newTrans.includes('Phương án:')) {
            healedCount++;
            if (sampleHealed.length < 15) {
              sampleHealed.push({ original: o.text, was: o.translation, now: newTrans });
            }
          }
        }
      }
    }
  }

  console.log(`Total 'Phương án:' options: ${totalPhuongAn}`);
  console.log(`Successfully healed with exactOptionTranslator: ${healedCount} (${((healedCount/totalPhuongAn)*100).toFixed(1)}%)`);
  console.log('Sample healed:', JSON.stringify(sampleHealed, null, 2));

  process.exit(0);
}

testPhuongAnHealing().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
