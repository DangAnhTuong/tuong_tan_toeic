const mongoose = require('mongoose');
const { READING_OPTION_DICT } = require('./readingMasterOptionTranslator');
const { initMongoVocab } = require('../utils/exactOptionTranslator');

let mongoVocab = new Map();

function findStemMeaning(word) {
  const w = word.toLowerCase().trim();
  if (READING_OPTION_DICT[w]) return READING_OPTION_DICT[w];
  if (mongoVocab.has(w)) return mongoVocab.get(w);

  // Strip -ed
  if (w.endsWith('ed')) {
    const stem1 = w.slice(0, -2); // raised -> rais -> raise
    const stem2 = w.slice(0, -1); // raised -> raise
    const stem3 = w.endsWith('ied') ? w.slice(0, -3) + 'y' : null;
    const stem4 = stem1.length > 2 && stem1[stem1.length - 1] === stem1[stem1.length - 2] ? stem1.slice(0, -1) : null; // stopped -> stop

    for (const s of [stem2, stem1, stem3, stem4].filter(Boolean)) {
      if (READING_OPTION_DICT[s] || mongoVocab.has(s)) {
        const base = READING_OPTION_DICT[s] || mongoVocab.get(s);
        return `đã ${base.split(/[,;(]/)[0].trim()} (quá khứ / bị động)`;
      }
    }
  }

  // Strip -ing
  if (w.endsWith('ing')) {
    const stem1 = w.slice(0, -3); // demanding -> demand
    const stem2 = stem1 + 'e';    // managing -> manage
    const stem3 = stem1.length > 2 && stem1[stem1.length - 1] === stem1[stem1.length - 2] ? stem1.slice(0, -1) : null; // planning -> plan

    for (const s of [stem1, stem2, stem3].filter(Boolean)) {
      if (READING_OPTION_DICT[s] || mongoVocab.has(s)) {
        const base = READING_OPTION_DICT[s] || mongoVocab.get(s);
        return `việc / đang ${base.split(/[,;(]/)[0].trim()} (V-ing)`;
      }
    }
  }

  // Strip -ly
  if (w.endsWith('ly')) {
    const stem1 = w.slice(0, -2); // quickly -> quick
    const stem2 = w.endsWith('ily') ? w.slice(0, -3) + 'y' : null; // easily -> easy
    for (const s of [stem1, stem2].filter(Boolean)) {
      if (READING_OPTION_DICT[s] || mongoVocab.has(s)) {
        const base = READING_OPTION_DICT[s] || mongoVocab.get(s);
        return `một cách ${base.split(/[,;(]/)[0].trim()} (trạng từ)`;
      }
    }
  }

  // Strip -s / -es
  if (w.endsWith('s') && !w.endsWith('ss')) {
    const stem1 = w.slice(0, -1);
    const stem2 = w.endsWith('es') ? w.slice(0, -2) : null;
    const stem3 = w.endsWith('ies') ? w.slice(0, -3) + 'y' : null;
    for (const s of [stem1, stem2, stem3].filter(Boolean)) {
      if (READING_OPTION_DICT[s] || mongoVocab.has(s)) {
        const base = READING_OPTION_DICT[s] || mongoVocab.get(s);
        return `${base.split(/[,;(]/)[0].trim()} (số nhiều / ngôi thứ 3)`;
      }
    }
  }

  return null;
}

async function testEnhanced() {
  await mongoose.connect('mongodb://localhost:27017/tuong_tan_toeic');
  const VocabularyTopic = mongoose.model('VocabularyTopic', new mongoose.Schema({}, { strict: false }));
  const topics = await VocabularyTopic.find({}).lean();
  topics.forEach(t => {
    (t.words || []).forEach(w => { if (w.word && w.meaning) mongoVocab.set(w.word.toLowerCase().trim(), w.meaning.trim()); });
    (t.parts || []).forEach(p => (p.words || []).forEach(w => { if (w.word && w.meaning) mongoVocab.set(w.word.toLowerCase().trim(), w.meaning.trim()); }));
  });
  console.log(`Loaded ${mongoVocab.size} mongo vocab words.`);

  const col = mongoose.connection.db.collection('readingexercises');
  const docs = await col.find({ 'questions.options.translation': /Phương án:/i }).toArray();

  let total = 0;
  let resolved = 0;
  for (const d of docs) {
    for (const q of (d.questions || [])) {
      for (const o of (q.options || [])) {
        if ((o.translation || '').includes('Phương án:')) {
          total++;
          const meaning = findStemMeaning(o.text);
          if (meaning) resolved++;
        }
      }
    }
  }

  console.log(`Total 'Phương án:' options: ${total}`);
  console.log(`Resolved with morphological stemmer: ${resolved} (${((resolved/total)*100).toFixed(1)}%)`);
  process.exit(0);
}

testEnhanced().catch(console.error);
