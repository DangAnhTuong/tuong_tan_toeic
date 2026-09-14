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

// Fetch all paginated rows for a table
async function fetchAllRows(table, query = '') {
  let all = [];
  let offset = 0;
  const limit = 1000;
  while (true) {
    const sep = query ? '&' : '';
    const chunk = await querySupabase(table, `${query}${sep}limit=${limit}&offset=${offset}`);
    if (!Array.isArray(chunk) || chunk.length === 0) break;
    all = all.concat(chunk);
    if (chunk.length < limit) break;
    offset += limit;
  }
  return all;
}

async function run() {
  console.log('🚀 Bắt đầu cào dữ liệu từ vựng thật 100% từ Supabase Đậu TOEIC...');
  await mongoose.connect(MONGODB_URI);
  console.log('✅ Connected to local MongoDB.');

  // 1. Fetch all tables
  console.log('📥 Đang tải toàn bộ bảng vocabulary_sets, tests, parts, words...');
  const [sets, tests, parts, words] = await Promise.all([
    fetchAllRows('vocabulary_sets'),
    fetchAllRows('vocabulary_tests'),
    fetchAllRows('vocabulary_parts'),
    fetchAllRows('vocabulary_words')
  ]);

  console.log(`📊 Đã nạp từ Supabase:`);
  console.log(`   - Sets: ${sets.length}`);
  console.log(`   - Tests: ${tests.length}`);
  console.log(`   - Parts: ${parts.length}`);
  console.log(`   - Words: ${words.length}`);

  // Build lookup maps
  const partsByTestId = {};
  parts.forEach(p => {
    if (!partsByTestId[p.test_id]) partsByTestId[p.test_id] = [];
    partsByTestId[p.test_id].push(p.id);
  });

  const wordsByPartId = {};
  words.forEach(w => {
    if (!wordsByPartId[w.part_id]) wordsByPartId[w.part_id] = [];
    
    // Normalize word object
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

    wordsByPartId[w.part_id].push({
      word: w.word || '',
      phonetic: w.ipa || '',
      pos: m.part_of_speech || 'n.',
      meaning: m.meaning || '',
      exampleEn: exampleEn,
      exampleVi: exampleVi
    });
  });

  // Clear old preloaded topics
  await VocabularyTopic.deleteMany({ sourceType: 'PRELOADED' });
  console.log('🗑️ Cleared old local vocabulary topics.');

  let totalTopics = 0;
  let totalWordsCount = 0;

  // Helper to extract words for a test
  function getWordsForTest(testId) {
    const partIds = partsByTestId[testId] || [];
    let list = [];
    partIds.forEach(pid => {
      if (wordsByPartId[pid]) {
        list = list.concat(wordsByPartId[pid]);
      }
    });
    return list;
  }

  // A. 600 TỪ VỰNG TOEIC (Set 66c99944-ebc5-43b8-93e2-994a73406b99)
  const set600Id = '66c99944-ebc5-43b8-93e2-994a73406b99';
  const tests600 = tests.filter(t => t.set_id === set600Id).sort((a, b) => (a.order_index || 0) - (b.order_index || 0));
  console.log(`\n📘 Đang nạp ${tests600.length} bài của "600 TỪ VỰNG TOEIC"...`);

  for (let i = 0; i < tests600.length; i++) {
    const t = tests600[i];
    const testWords = getWordsForTest(t.id);
    await VocabularyTopic.create({
      title: t.name,
      category: '600_vocab',
      tagLabel: '600 TỪ VỰNG TOEIC',
      sessionIndex: i + 1,
      sourceType: 'PRELOADED',
      learnedCount: 0,
      totalCount: testWords.length,
      isPro: i >= 3,
      words: testWords
    });
    totalTopics++;
    totalWordsCount += testWords.length;
    console.log(`   [${i + 1}/${tests600.length}] "${t.name}": ${testWords.length} từ thật`);
  }

  // B. ĐỀ 2023 (Set c5d94dfd-cb16-44f7-a057-37ea5b5ded20 & others)
  const set2023Id = 'c5d94dfd-cb16-44f7-a057-37ea5b5ded20';
  const tests2023 = tests.filter(t => t.set_id === set2023Id).sort((a, b) => (a.order_index || 0) - (b.order_index || 0));
  console.log(`\n📘 Đang nạp ${tests2023.length} bài của "Đề 2023"...`);

  for (let i = 0; i < tests2023.length; i++) {
    const t = tests2023[i];
    const testWords = getWordsForTest(t.id);
    await VocabularyTopic.create({
      title: t.name.startsWith('ETS') ? t.name : `ETS 2023 — ${t.name}`,
      category: 'test_2023',
      tagLabel: 'ĐỀ 2023',
      sessionIndex: i + 1,
      sourceType: 'PRELOADED',
      learnedCount: 0,
      totalCount: testWords.length,
      isPro: i >= 3,
      words: testWords
    });
    totalTopics++;
    totalWordsCount += testWords.length;
    console.log(`   [${i + 1}/${tests2023.length}] "${t.name}": ${testWords.length} từ thật`);
  }

  // C. ĐỀ 2024 (Set 5900e7c8-0397-4ae5-9cc2-791ea8bb7737)
  const set2024Id = '5900e7c8-0397-4ae5-9cc2-791ea8bb7737';
  const tests2024 = tests.filter(t => t.set_id === set2024Id).sort((a, b) => (a.order_index || 0) - (b.order_index || 0));
  console.log(`\n📘 Đang nạp ${tests2024.length} bài của "Đề 2024"...`);

  for (let i = 0; i < tests2024.length; i++) {
    const t = tests2024[i];
    const testWords = getWordsForTest(t.id);
    await VocabularyTopic.create({
      title: t.name.startsWith('ETS') ? t.name : `ETS 2024 — ${t.name}`,
      category: 'test_2024',
      tagLabel: 'ĐỀ 2024',
      sessionIndex: i + 1,
      sourceType: 'PRELOADED',
      learnedCount: 0,
      totalCount: testWords.length,
      isPro: i >= 3,
      words: testWords
    });
    totalTopics++;
    totalWordsCount += testWords.length;
    console.log(`   [${i + 1}/${tests2024.length}] "${t.name}": ${testWords.length} từ thật`);
  }

  // D. ĐỀ 2026 (Set 21793dec-3c53-4e8b-923a-72a2a3bf491a & b4ea71e5-c6e6-411a-836e-d74af555b5a8)
  const set2026Id = '21793dec-3c53-4e8b-923a-72a2a3bf491a';
  const set2026BId = 'b4ea71e5-c6e6-411a-836e-d74af555b5a8';
  let tests2026 = tests.filter(t => t.set_id === set2026Id || t.set_id === set2026BId).sort((a, b) => (a.order_index || 0) - (b.order_index || 0));
  console.log(`\n📘 Đang nạp ${tests2026.length} bài của "Đề 2026"...`);

  for (let i = 0; i < tests2026.length; i++) {
    const t = tests2026[i];
    const testWords = getWordsForTest(t.id);
    await VocabularyTopic.create({
      title: t.name.startsWith('ETS') || t.name.startsWith('Test') || t.name.startsWith('TEST') ? (t.name.startsWith('ETS') ? t.name : `ETS 2026 — ${t.name}`) : `ETS 2026 — ${t.name}`,
      category: 'test_2026',
      tagLabel: 'ĐỀ 2026',
      sessionIndex: i + 1,
      sourceType: 'PRELOADED',
      learnedCount: 0,
      totalCount: testWords.length,
      isPro: i >= 3,
      words: testWords
    });
    totalTopics++;
    totalWordsCount += testWords.length;
    console.log(`   [${i + 1}/${tests2026.length}] "${t.name}": ${testWords.length} từ thật`);
  }

  // E. 800 TỪ VỰNG TRỌNG ĐIỂM (Set cc18bad9-2ce5-41b7-8bd5-51c59ed04b1b / TOEIC MASTER)
  const masterTests = tests.filter(t => t.name.includes('800') || t.name.toLowerCase().includes('master'));
  console.log(`\n📘 Đang nạp ${masterTests.length} bài của "TOEIC MASTER & 800 TỪ"...`);

  for (let i = 0; i < masterTests.length; i++) {
    const t = masterTests[i];
    const testWords = getWordsForTest(t.id);
    await VocabularyTopic.create({
      title: t.name,
      category: 'toeic_master',
      tagLabel: 'TOEIC MASTER',
      sessionIndex: i + 1,
      sourceType: 'PRELOADED',
      learnedCount: 0,
      totalCount: testWords.length,
      isPro: true,
      words: testWords
    });
    totalTopics++;
    totalWordsCount += testWords.length;
    console.log(`   [${i + 1}/${masterTests.length}] "${t.name}": ${testWords.length} từ thật`);
  }

  console.log(`\n🎉🎉🎉 HOÀN TẤT 100%! Đã cào và nạp thành công ${totalTopics} chủ đề với TỔNG CỘNG ${totalWordsCount} TỪ VỰNG THỰC TẾ từ Đậu TOEIC vào MongoDB!`);
  await mongoose.disconnect();
}

run().catch(err => {
  console.error('Lỗi cào dữ liệu:', err);
  process.exit(1);
});
