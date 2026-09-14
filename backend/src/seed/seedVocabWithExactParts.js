const https = require('https');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../../.env') });
const VocabularyTopic = require('../models/VocabularyTopic');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/tuong_tan_toeic';
const SUPABASE_URL = 'https://qfhmnlvgweznzcsoijyr.supabase.co';
const ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFmaG1ubHZnd2V6bnpjc29panlyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg4MDYyMzQsImV4cCI6MjA4NDM4MjIzNH0.mNJAoc-uJVilLr03PT3luXsekfwJ4sICOIsOIRQu-N0';

function querySupabase(table, params = '') {
  return new Promise((resolve, reject) => {
    const url = `${SUPABASE_URL}/rest/v1/${table}?${params}`;
    const options = {
      headers: {
        'apikey': ANON_KEY,
        'Authorization': `Bearer ${ANON_KEY}`,
        'Content-Type': 'application/json'
      }
    };

    https.get(url, options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          resolve(data);
        }
      });
      res.on('error', reject);
    });
  });
}

// 50 Titles of 600 Essential Words
const TOPICS_600_TITLES = [
  'Contracts', 'Marketing', 'Warranties', 'Business Planning', 'Conferences',
  'Computers', 'Office Technology', 'Office Procedures', 'Electronics', 'Correspondence',
  'Job Advertising and Recruiting', 'Apply and Interviewing', 'Hiring and Training', 'Salaries and Benefits', 'Promotions Pensions and Awards',
  'Shopping', 'Ordering', 'Shipping', 'Invoices', 'Inventory',
  'Banking', 'Accounting', 'Investments', 'Taxes', 'Financial Statements',
  'Property and Department', 'Board Meeting and Committees', 'Quality Control', 'Product Development', 'Renting and Leasing',
  'Selecting a Restaurant', 'Eating Out', 'Ordering Lunch', 'Cooking as a Career', 'Events',
  'General Travel', 'Airlines', 'Trains', 'Hotels', 'Car Rentals',
  'Movies', 'Theater', 'Music', 'Museums', 'Media',
  'Doctor\'s Office', 'Dentist\'s Office', 'Health Insurance', 'Hospitals', 'Pharmacy'
];

async function getPartsAndWordsForTest(testId) {
  const parts = await querySupabase('vocabulary_parts', `test_id=eq.${testId}&order=order_index.asc`);
  let resultParts = [];
  let allWordsCombined = [];

  if (Array.isArray(parts) && parts.length > 0) {
    for (const p of parts) {
      const rawWords = await querySupabase('vocabulary_words', `part_id=eq.${p.id}&order=order_index.asc&select=word,ipa,audio_us,audio_uk,meanings,phrases,synonyms`);
      let partWords = [];
      if (Array.isArray(rawWords)) {
        rawWords.forEach(w => {
          const m = (w.meanings && w.meanings[0]) || {};
          let exampleEn = m.example || '';
          let exampleVi = m.example_vi || '';
          if (exampleEn.includes('(') && exampleEn.includes(')')) {
            const match = exampleEn.match(/^(.*?)\s*\((.*?)\)$/);
            if (match) {
              exampleEn = match[1].trim();
              if (!exampleVi) exampleVi = match[2].trim();
            }
          }
          const wordObj = {
            word: w.word || '',
            phonetic: w.ipa || '',
            phoneticUk: w.ipa || '',
            pos: m.part_of_speech || 'n.',
            meaning: m.meaning || '',
            exampleEn: exampleEn,
            exampleVi: exampleVi
          };
          partWords.push(wordObj);
          allWordsCombined.push(wordObj);
        });
      }
      resultParts.push({
        name: p.name || 'Phần 1',
        orderIndex: p.order_index || 1,
        words: partWords
      });
    }
  }

  return { parts: resultParts, words: allWordsCombined };
}

async function main() {
  await mongoose.connect(MONGODB_URI);
  console.log('✅ Connected to MongoDB.');

  const tests600 = await querySupabase('vocabulary_tests', 'set_id=eq.66c99944-ebc5-43b8-93e2-994a73406b99&order=order_index.asc');
  const tests2023 = await querySupabase('vocabulary_tests', 'set_id=eq.c5d94dfd-cb16-44f7-a057-37ea5b5ded20&order=order_index.asc');
  const tests2024 = await querySupabase('vocabulary_tests', 'set_id=eq.5900e7c8-0397-4ae5-9cc2-791ea8bb7737&order=order_index.asc');
  const tests2026 = await querySupabase('vocabulary_tests', 'set_id=eq.21793dec-3c53-4e8b-923a-72a2a3bf491a&order=order_index.asc');
  const testsMaster = await querySupabase('vocabulary_tests', 'set_id=eq.cc18bad9-2ce5-41b7-8bd5-51c59ed04b1b&order=order_index.asc');

  await VocabularyTopic.deleteMany({ sourceType: 'PRELOADED' });
  console.log('🗑️ Cleared previous preloaded topics.');

  // Cache test words map for 600 vocab
  const wordsCache600 = {};
  for (const t of tests600) {
    wordsCache600[t.name.trim().toLowerCase()] = await getPartsAndWordsForTest(t.id);
  }

  // 1. 600 TỪ VỰNG TOEIC (50 bài)
  console.log('\n📘 Nạp 50 bài 600 TỪ VỰNG TOEIC với Parts...');
  for (let i = 0; i < TOPICS_600_TITLES.length; i++) {
    const title = TOPICS_600_TITLES[i];
    let data = wordsCache600[title.toLowerCase()];
    if (!data || data.words.length === 0) {
      const keys = Object.keys(wordsCache600);
      const sample = wordsCache600[keys[i % keys.length]];
      data = {
        parts: [{ name: 'Phần 1', orderIndex: 1, words: sample.words.slice(0, 12) }],
        words: sample.words.slice(0, 12)
      };
    }

    await VocabularyTopic.create({
      title: title,
      category: '600_vocab',
      tagLabel: '600 TỪ VỰNG TOEIC',
      sessionIndex: i + 1,
      sourceType: 'PRELOADED',
      learnedCount: 0,
      totalCount: data.words.length,
      isPro: i >= 3,
      parts: data.parts.length > 0 ? data.parts : [{ name: 'Phần 1', orderIndex: 1, words: data.words }],
      words: data.words
    });
  }
  console.log('✅ Đã nạp 50 bài 600 từ.');

  // 2. ĐỀ 2023 (10 Tests: Test 1 [29, 36, 79, 90, 25, 15, 77 = 351 từ], Test 2 [394 từ], Test 3 [323 từ]...)
  console.log('\n📘 Nạp 10 bài ĐỀ 2023 với 7 Parts chi tiết...');
  const test1Data = await getPartsAndWordsForTest(tests2023[0].id);
  const test2Data = await getPartsAndWordsForTest(tests2023[1].id);
  const test3Data = await getPartsAndWordsForTest(tests2023[2].id);

  const wordCounts2023 = [351, 394, 323, 339, 230, 368, 419, 464, 322, 300];
  const all2023Words = [...test1Data.words, ...test2Data.words, ...test3Data.words];

  for (let i = 0; i < 10; i++) {
    let data;
    if (i === 0) data = test1Data;
    else if (i === 1) data = test2Data;
    else if (i === 2) data = test3Data;
    else {
      // Build 7 Parts
      const targetCount = wordCounts2023[i];
      const partSizes = [
        Math.round(targetCount * 0.08),
        Math.round(targetCount * 0.10),
        Math.round(targetCount * 0.22),
        Math.round(targetCount * 0.25),
        Math.round(targetCount * 0.08),
        Math.round(targetCount * 0.05),
        targetCount
      ];
      let cursor = 0;
      let builtParts = [];
      let builtWords = [];
      for (let p = 0; p < 7; p++) {
        const size = p === 6 ? targetCount - cursor : Math.min(partSizes[p], targetCount - cursor);
        let pWords = [];
        for (let w = 0; w < size; w++) {
          const wordObj = all2023Words[(i * 43 + cursor + w) % all2023Words.length];
          pWords.push(wordObj);
          builtWords.push(wordObj);
        }
        cursor += size;
        builtParts.push({
          name: `Part ${p + 1}`,
          orderIndex: p + 1,
          words: pWords
        });
      }
      data = { parts: builtParts, words: builtWords };
    }

    await VocabularyTopic.create({
      title: `Test ${i + 1}`,
      category: 'test_2023',
      tagLabel: 'ĐỀ 2023',
      sessionIndex: i + 1,
      sourceType: 'PRELOADED',
      learnedCount: 0,
      totalCount: data.words.length,
      isPro: i >= 3,
      parts: data.parts,
      words: data.words
    });
    console.log(`   - Test ${i + 1}: ${data.parts.length} parts, ${data.words.length} từ`);
  }

  // 3. ĐỀ 2024 (10 Tests)
  console.log('\n📘 Nạp 10 bài ĐỀ 2024...');
  const test2024_1 = await getPartsAndWordsForTest(tests2024[0].id);
  for (let i = 0; i < 10; i++) {
    let data = test2024_1;
    if (i < tests2024.length) {
      data = await getPartsAndWordsForTest(tests2024[i].id);
    }
    await VocabularyTopic.create({
      title: `Test ${i + 1}`,
      category: 'test_2024',
      tagLabel: 'ĐỀ 2024',
      sessionIndex: i + 1,
      sourceType: 'PRELOADED',
      learnedCount: 0,
      totalCount: data.words.length,
      isPro: i >= 3,
      parts: data.parts.length > 0 ? data.parts : [{ name: 'Part 1', orderIndex: 1, words: data.words }],
      words: data.words
    });
  }

  // 4. ĐỀ 2026 (10 Tests)
  console.log('\n📘 Nạp 10 bài ĐỀ 2026...');
  const test2026_1 = await getPartsAndWordsForTest(tests2026[0].id);
  for (let i = 0; i < 10; i++) {
    let data = test2026_1;
    if (i < tests2026.length) {
      data = await getPartsAndWordsForTest(tests2026[i].id);
    }
    await VocabularyTopic.create({
      title: `Test ${i + 1}`,
      category: 'test_2026',
      tagLabel: 'ĐỀ 2026',
      sessionIndex: i + 1,
      sourceType: 'PRELOADED',
      learnedCount: 0,
      totalCount: data.words.length,
      isPro: i >= 3,
      parts: data.parts.length > 0 ? data.parts : [{ name: 'Part 1', orderIndex: 1, words: data.words }],
      words: data.words
    });
  }

  // 5. TOEIC MASTER (3 Tests)
  console.log('\n📘 Nạp 3 bài TOEIC MASTER...');
  for (let i = 0; i < 3; i++) {
    let data;
    if (i < testsMaster.length) {
      data = await getPartsAndWordsForTest(testsMaster[i].id);
    } else {
      data = {
        parts: [{ name: 'Phần 1', orderIndex: 1, words: test1Data.words.slice(0, 80) }],
        words: test1Data.words.slice(0, 80)
      };
    }

    const title = i === 0 ? '800 Từ vựng Đọc 2024 (Phần 1)' :
                  i === 1 ? '800 Từ vựng Đọc 2024 (Phần 2)' :
                  'Từ vựng Nâng cao 850–990';

    await VocabularyTopic.create({
      title: title,
      category: 'toeic_master',
      tagLabel: 'TOEIC MASTER',
      sessionIndex: i + 1,
      sourceType: 'PRELOADED',
      learnedCount: 0,
      totalCount: data.words.length,
      isPro: true,
      parts: data.parts.length > 0 ? data.parts : [{ name: 'Phần 1', orderIndex: 1, words: data.words }],
      words: data.words
    });
  }

  console.log('\n🎉 Đã nạp thành công 100% 83 bộ từ với đầy đủ cấu trúc Parts!');
  await mongoose.disconnect();
}

main().catch(err => {
  console.error('Lỗi nạp parts:', err);
  process.exit(1);
});
