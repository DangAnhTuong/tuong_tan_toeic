const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const { READING_OPTION_DICT } = require('./readingMasterOptionTranslator');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/tuong_tan_toeic';

// 1. Core Grammar & Functional Words Dictionary
const CORE_FUNCTIONAL_WORDS = {
  // Prepositions & Conjunctions
  'at': 'tại, vào lúc (giới từ)',
  'on': 'trên, vào ngày (giới từ)',
  'in': 'trong, ở trong (giới từ)',
  'for': 'cho, dành cho, trong khoảng (giới từ)',
  'with': 'với, cùng với (giới từ)',
  'by': 'bởi, trước lúc, bằng cách (giới từ)',
  'from': 'từ, đến từ (giới từ)',
  'to': 'đến, tới (giới từ / to + V-inf)',
  'of': 'của, về (giới từ)',
  'about': 'về, khoảng (giới từ/trạng từ)',
  'into': 'vào trong (giới từ)',
  'through': 'qua, xuyên qua (giới từ)',
  'throughout': 'suốt, trên khắp (giới từ)',
  'across': 'băng qua, trên khắp (giới từ)',
  'along': 'dọc theo (giới từ)',
  'between': 'ở giữa hai đối tượng (giới từ)',
  'among': 'trong số, giữa nhiều đối tượng (giới từ)',
  'under': 'dưới, theo sự (giới từ)',
  'over': 'qua, hơn, trong khoảng thời gian (giới từ)',
  'above': 'ở trên (giới từ)',
  'below': 'ở dưới (giới từ)',
  'after': 'sau khi (giới từ/liên từ)',
  'before': 'trước khi (giới từ/liên từ)',
  'during': 'trong suốt (giới từ)',
  'since': 'kể từ khi, bởi vì (giới từ/liên từ)',
  'until': 'cho đến khi (giới từ/liên từ)',
  'without': 'không có, thiếu (giới từ)',
  'within': 'trong vòng, trong phạm vi (giới từ)',
  'behind': 'phía sau (giới từ)',
  'beyond': 'vượt ra ngoài (giới từ)',
  'against': 'chống lại, dựa vào (giới từ)',
  'towards': 'hướng về phía (giới từ)',
  'toward': 'hướng tới, về phía (giới từ)',
  'down': 'xuống, ở dưới',
  'up': 'lên, ở trên',
  'off': 'tắt, rời khỏi, cách xa',
  'and': 'và (liên từ)',
  'but': 'nhưng, nhưng mà (liên từ)',
  'or': 'hoặc, hay là (liên từ)',
  'nor': 'cũng không (liên từ)',
  'yet': 'nhưng, thế mà, chưa (liên từ/trạng từ)',
  'so': 'vì vậy, do đó (liên từ)',
  'both': 'cả hai (từ hạn định / đại từ)',
  'either': 'hoặc cái này hoặc cái kia',
  'neither': 'cả hai đều không',
  'not only': 'không những',
  'as': 'như là, khi, vì (giới từ/liên từ)',
  'than': 'hơn (trong so sánh hơn)',

  // Auxiliary & Core Verbs
  'is': 'là, thì, ở (ngôi thứ 3 số ít)',
  'am': 'là, thì, ở (ngôi thứ nhất số ít)',
  'are': 'là, thì, ở (ngôi số nhiều / you)',
  'was': 'đã là, thì, ở (quá khứ số ít)',
  'were': 'đã là, thì, ở (quá khứ số nhiều)',
  'be': 'là, thì, ở (động từ nguyên mẫu)',
  'been': 'đã từng là, ở (quá khứ phân từ)',
  'being': 'đang là, hiện diện (V-ing)',
  'has': 'có, đã (ngôi 3 số ít)',
  'have': 'có, sở hữu (nguyên mẫu)',
  'had': 'đã có, đã (quá khứ)',
  'having': 'việc có, đang có (V-ing)',
  'do': 'làm (nguyên mẫu)',
  'does': 'làm (ngôi 3 số ít)',
  'did': 'đã làm (quá khứ)',
  'doing': 'đang làm (V-ing)',
  'done': 'đã hoàn thành (quá khứ phân từ)',
  'will': 'sẽ (tương lai đơn)',
  'would': 'sẽ / muốn (câu điều kiện)',
  'can': 'có thể (khả năng)',
  'could': 'có thể (quá khứ / lịch sự)',
  'should': 'nên (lời khuyên)',
  'may': 'có thể (xác suất)',
  'might': 'có thể (xác suất thấp)',
  'must': 'phải, chắc hẳn là (bắt buộc/suy đoán)',
  'make': 'làm, tạo ra, khiến cho (động từ)',
  'makes': 'làm, tạo ra (ngôi 3 số ít)',
  'made': 'đã làm, được làm (quá khứ/bị động)',
  'making': 'việc làm, đang làm (V-ing)',
  'use': 'sử dụng, dùng (động từ/danh từ)',
  'uses': 'sử dụng (ngôi 3 số ít)',
  'used': 'đã sử dụng, quen với (quá khứ/tính từ)',
  'using': 'việc sử dụng, đang sử dụng (V-ing)',
  'meet': 'gặp gỡ, đáp ứng (nhu cầu)',
  'meets': 'gặp gỡ, đáp ứng (ngôi 3 số ít)',
  'met': 'đã gặp gỡ, đã đáp ứng (quá khứ)',
  'meeting': 'cuộc họp / đang gặp gỡ (danh từ/V-ing)',
  'meetings': 'các cuộc họp (danh từ số nhiều)',
  'is meeting': 'đang gặp gỡ (hiện tại tiếp diễn)',
  'are meeting': 'đang gặp gỡ (hiện tại tiếp diễn)',
  'will meet': 'sẽ gặp gỡ (tương lai đơn)',
  'has met': 'đã gặp gỡ (hiện tại hoàn thành)',
  'tackle': 'giải quyết, xử lý (động từ)',
  'tackles': 'giải quyết (ngôi 3 số ít)',
  'tackled': 'đã giải quyết, xử lý (quá khứ)',
  'tackling': 'việc giải quyết (V-ing)',
  'voluntary': 'tự nguyện, tình nguyện (tính từ)',
  'voluntarily': 'một cách tự nguyện (trạng từ)',
  'volunteer': 'tình nguyện viên / tình nguyện (danh từ/động từ)',
  'volunteers': 'các tình nguyện viên (số nhiều)',
  'volunteered': 'đã tình nguyện (quá khứ)',
  'volunteering': 'hoạt động tình nguyện (V-ing)',
  'raise': 'gây quỹ, nâng cao, tăng lên (động từ)',
  'raises': 'gây quỹ, tăng lên (ngôi 3 số ít)',
  'raised': 'đã gây quỹ, đã nâng cao (quá khứ)',
  'raising': 'việc gây quỹ, đang nâng lên (V-ing)',
  'convince': 'thuyết phục (động từ)',
  'convinces': 'thuyết phục (ngôi 3 số ít)',
  'convinced': 'tin chắc, đã thuyết phục (quá khứ/tính từ)',
  'convincing': 'có sức thuyết phục (tính từ/V-ing)',
  'observe': 'quan sát, tuân thủ (động từ)',
  'observes': 'quan sát, tuân thủ (ngôi 3 số ít)',
  'observed': 'đã quan sát, đã tuân thủ (quá khứ)',
  'observing': 'việc quan sát (V-ing)',
  'observation': 'sự quan sát, sự tuân thủ (danh từ)',
  'observations': 'các quan sát (số nhiều)'
};

async function buildMasterDictionary(mongoose) {
  const masterDict = new Map();

  // 1. Files in data directory
  try {
    const persistentCache = JSON.parse(fs.readFileSync(path.join(__dirname, '../data/persistent_translation_cache.json'), 'utf-8'));
    for (const [k, v] of Object.entries(persistentCache)) masterDict.set(k.toLowerCase().trim(), v.trim());
  } catch (e) {}

  try {
    const optionCache = JSON.parse(fs.readFileSync(path.join(__dirname, '../data/option_translation_cache.json'), 'utf-8'));
    for (const [k, v] of Object.entries(optionCache)) masterDict.set(k.toLowerCase().trim(), v.trim());
  } catch (e) {}

  try {
    const curatedDict = JSON.parse(fs.readFileSync(path.join(__dirname, '../data/curated_option_translations.json'), 'utf-8'));
    for (const [k, v] of Object.entries(curatedDict)) masterDict.set(k.toLowerCase().trim(), v.trim());
  } catch (e) {}

  for (const [k, v] of Object.entries(READING_OPTION_DICT)) masterDict.set(k.toLowerCase().trim(), v.trim());
  for (const [k, v] of Object.entries(CORE_FUNCTIONAL_WORDS)) masterDict.set(k.toLowerCase().trim(), v.trim());

  // 2. VocabularyTopic from MongoDB
  try {
    const VocabularyTopic = mongoose.model('VocabularyTopic', new mongoose.Schema({}, { strict: false }));
    const topics = await VocabularyTopic.find({}).lean();
    topics.forEach(t => {
      (t.words || []).forEach(w => { if (w.word && w.meaning) masterDict.set(w.word.toLowerCase().trim(), w.meaning.trim()); });
      (t.parts || []).forEach(p => (p.words || []).forEach(w => { if (w.word && w.meaning) masterDict.set(w.word.toLowerCase().trim(), w.meaning.trim()); }));
    });
  } catch (e) {}

  return masterDict;
}

function resolveOptionMeaning(word, masterDict) {
  if (!word || typeof word !== 'string') return '';
  const w = word.toLowerCase().trim();

  // Direct hit
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

  // Suffix patterns
  if (w.endsWith('tion') || w.endsWith('ment') || w.endsWith('ness') || w.endsWith('ity')) {
    return `sự ${w} (danh từ)`;
  }
  if (w.endsWith('able') || w.endsWith('ible') || w.endsWith('ive') || w.endsWith('al')) {
    return `có tính ${w} (tính từ)`;
  }

  return word.trim();
}

async function purifyAllPhuongAnOptions() {
  const startTime = Date.now();
  await mongoose.connect(MONGODB_URI);
  console.log('✅ Connected to MongoDB.');

  const masterDict = await buildMasterDictionary(mongoose);
  console.log(`📚 Master Dictionary ready with ${masterDict.size} terms.`);

  const col = mongoose.connection.db.collection('readingexercises');
  const docs = await col.find({ 'questions.options.translation': /Phương án:/i }).toArray();
  console.log(`Found ${docs.length} documents containing 'Phương án:' translations.`);

  let totalHealedOptions = 0;
  let totalDocsUpdated = 0;

  for (const doc of docs) {
    let docModified = false;

    for (let i = 0; i < (doc.questions || []).length; i++) {
      const q = doc.questions[i];
      let questionModified = false;

      for (const opt of (q.options || [])) {
        if ((opt.translation || '').includes('Phương án:')) {
          const raw = (opt.text || '').trim();
          const cleanTranslation = resolveOptionMeaning(raw, masterDict);
          opt.translation = cleanTranslation;
          opt.vietnamese = cleanTranslation;
          questionModified = true;
          totalHealedOptions++;
        }
      }

      // Also clean up explanation breakdown if it contains "Phương án: "
      if (questionModified && q.explanation && q.explanation.includes('Phương án:')) {
        q.explanation = q.explanation.replace(/Phương án:\s*/g, '');
      }

      if (questionModified) docModified = true;
    }

    if (docModified) {
      await col.updateOne({ _id: doc._id }, { $set: { questions: doc.questions } });
      totalDocsUpdated++;
      console.log(`💾 Updated [${doc.title} (${doc.part} Lv${doc.level})]`);
    }
  }

  console.log(`\n🎉 PURIFICATION COMPLETE!`);
  console.log(`- Total options purified: ${totalHealedOptions}`);
  console.log(`- Documents updated: ${totalDocsUpdated}`);
  console.log(`- Time elapsed: ${((Date.now() - startTime) / 1000).toFixed(1)}s`);
  process.exit(0);
}

purifyAllPhuongAnOptions().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
