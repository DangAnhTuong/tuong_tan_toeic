const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const { READING_OPTION_DICT } = require('./readingMasterOptionTranslator');

const persistentCache = JSON.parse(fs.readFileSync(path.join(__dirname, '../data/persistent_translation_cache.json'), 'utf-8'));
const optionCache = JSON.parse(fs.readFileSync(path.join(__dirname, '../data/option_translation_cache.json'), 'utf-8'));
const curatedDict = JSON.parse(fs.readFileSync(path.join(__dirname, '../data/curated_option_translations.json'), 'utf-8'));

const masterDict = new Map();

// 1. Ingest all sources into masterDict (lowercased keys)
for (const [k, v] of Object.entries(persistentCache)) masterDict.set(k.toLowerCase().trim(), v.trim());
for (const [k, v] of Object.entries(optionCache)) masterDict.set(k.toLowerCase().trim(), v.trim());
for (const [k, v] of Object.entries(curatedDict)) masterDict.set(k.toLowerCase().trim(), v.trim());
for (const [k, v] of Object.entries(READING_OPTION_DICT)) masterDict.set(k.toLowerCase().trim(), v.trim());

function findMeaning(word) {
  const w = word.toLowerCase().trim();
  if (masterDict.has(w)) return masterDict.get(w);

  // Strip -ed
  if (w.endsWith('ed')) {
    const stem1 = w.slice(0, -2);
    const stem2 = w.slice(0, -1);
    const stem3 = w.endsWith('ied') ? w.slice(0, -3) + 'y' : null;
    const stem4 = stem1.length > 2 && stem1[stem1.length - 1] === stem1[stem1.length - 2] ? stem1.slice(0, -1) : null;

    for (const s of [stem2, stem1, stem3, stem4].filter(Boolean)) {
      if (masterDict.has(s)) {
        const base = masterDict.get(s);
        return `đã ${base.split(/[,;(]/)[0].trim()} (quá khứ / bị động)`;
      }
    }
  }

  // Strip -ing
  if (w.endsWith('ing')) {
    const stem1 = w.slice(0, -3);
    const stem2 = stem1 + 'e';
    const stem3 = stem1.length > 2 && stem1[stem1.length - 1] === stem1[stem1.length - 2] ? stem1.slice(0, -1) : null;

    for (const s of [stem1, stem2, stem3].filter(Boolean)) {
      if (masterDict.has(s)) {
        const base = masterDict.get(s);
        return `việc / đang ${base.split(/[,;(]/)[0].trim()} (V-ing)`;
      }
    }
  }

  // Strip -ly
  if (w.endsWith('ly')) {
    const stem1 = w.slice(0, -2);
    const stem2 = w.endsWith('ily') ? w.slice(0, -3) + 'y' : null;
    for (const s of [stem1, stem2].filter(Boolean)) {
      if (masterDict.has(s)) {
        const base = masterDict.get(s);
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
      if (masterDict.has(s)) {
        const base = masterDict.get(s);
        return `${base.split(/[,;(]/)[0].trim()} (số nhiều / ngôi thứ 3)`;
      }
    }
  }

  return null;
}

async function testCombined() {
  await mongoose.connect('mongodb://localhost:27017/tuong_tan_toeic');
  const VocabularyTopic = mongoose.model('VocabularyTopic', new mongoose.Schema({}, { strict: false }));
  const topics = await VocabularyTopic.find({}).lean();
  topics.forEach(t => {
    (t.words || []).forEach(w => { if (w.word && w.meaning) masterDict.set(w.word.toLowerCase().trim(), w.meaning.trim()); });
    (t.parts || []).forEach(p => (p.words || []).forEach(w => { if (w.word && w.meaning) masterDict.set(w.word.toLowerCase().trim(), w.meaning.trim()); }));
  });
  console.log(`Total dictionary terms loaded: ${masterDict.size}`);

  const col = mongoose.connection.db.collection('readingexercises');
  const docs = await col.find({ 'questions.options.translation': /Phương án:/i }).toArray();

  let total = 0;
  let resolved = 0;
  let unresolvedList = [];

  for (const d of docs) {
    for (const q of (d.questions || [])) {
      for (const o of (q.options || [])) {
        if ((o.translation || '').includes('Phương án:')) {
          total++;
          const m = findMeaning(o.text);
          if (m) {
            resolved++;
          } else {
            unresolvedList.push(o.text.trim());
          }
        }
      }
    }
  }

  console.log(`Total 'Phương án:' options: ${total}`);
  console.log(`Resolved with combined master dict + stemmer: ${resolved} (${((resolved/total)*100).toFixed(1)}%)`);
  const uniqueUnresolved = Array.from(new Set(unresolvedList));
  console.log(`Unique unresolved: ${uniqueUnresolved.length}`);
  console.log('Sample unresolved (first 20):', uniqueUnresolved.slice(0, 20));

  process.exit(0);
}

testCombined().catch(console.error);
