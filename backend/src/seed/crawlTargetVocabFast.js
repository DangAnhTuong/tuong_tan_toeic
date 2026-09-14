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

// 5 Target Sets on Dau TOEIC
const TARGET_SETS = [
  { key: '600_vocab', tag: '600 TỪ VỰNG TOEIC', setId: '66c99944-ebc5-43b8-93e2-994a73406b99' },
  { key: 'test_2023', tag: 'ĐỀ 2023', setId: 'c5d94dfd-cb16-44f7-a057-37ea5b5ded20' },
  { key: 'test_2024', tag: 'ĐỀ 2024', setId: '5900e7c8-0397-4ae5-9cc2-791ea8bb7737' },
  { key: 'test_2026', tag: 'ĐỀ 2026', setId: '21793dec-3c53-4e8b-923a-72a2a3bf491a', setIdB: 'b4ea71e5-c6e6-411a-836e-d74af555b5a8' },
  { key: 'toeic_master', tag: 'TOEIC MASTER', setId: 'cc18bad9-2ce5-41b7-8bd5-51c59ed04b1b' }
];

async function crawlCategory(cat) {
  console.log(`\n=================== BẮT ĐẦU CÀO: ${cat.tag} ===================`);
  let tests = await querySupabase('vocabulary_tests', `set_id=eq.${cat.setId}&order=order_index.asc`);
  if (cat.setIdB) {
    const testsB = await querySupabase('vocabulary_tests', `set_id=eq.${cat.setIdB}&order=order_index.asc`);
    if (Array.isArray(testsB)) tests = tests.concat(testsB);
  }

  if (!Array.isArray(tests) || tests.length === 0) {
    console.log(`⚠️ Không tìm thấy bài test cho set_id: ${cat.setId}`);
    return 0;
  }

  console.log(`🔍 Tìm thấy ${tests.length} bài test trong ${cat.tag}`);
  let countWordsInCat = 0;

  for (let i = 0; i < tests.length; i++) {
    const t = tests[i];
    const parts = await querySupabase('vocabulary_parts', `test_id=eq.${t.id}`);
    
    let words = [];
    if (Array.isArray(parts) && parts.length > 0) {
      const partIds = parts.map(p => p.id);
      // Query words in chunks of 5 parts to avoid long URL
      for (let p = 0; p < partIds.length; p += 5) {
        const chunk = partIds.slice(p, p + 5);
        const rawWords = await querySupabase('vocabulary_words', `part_id=in.(${chunk.join(',')})&select=word,ipa,meanings,phrases,synonyms`);
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

            words.push({
              word: w.word || '',
              phonetic: w.ipa || '',
              pos: m.part_of_speech || 'n.',
              meaning: m.meaning || '',
              exampleEn: exampleEn,
              exampleVi: exampleVi
            });
          });
        }
      }
    }

    let title = t.name;
    if (cat.key.startsWith('test_') && !title.toLowerCase().includes('ets')) {
      const year = cat.key.replace('test_', '');
      title = `ETS ${year} — ${title}`;
    }

    await VocabularyTopic.create({
      title: title,
      category: cat.key,
      tagLabel: cat.tag,
      sessionIndex: i + 1,
      sourceType: 'PRELOADED',
      learnedCount: 0,
      totalCount: words.length,
      isPro: i >= 3,
      words: words
    });

    countWordsInCat += words.length;
    console.log(`   ✅ [${i + 1}/${tests.length}] "${title}": ${words.length} từ thật`);
  }

  return countWordsInCat;
}

async function main() {
  await mongoose.connect(MONGODB_URI);
  console.log('✅ Connected to MongoDB.');

  // Clear old topics
  const del = await VocabularyTopic.deleteMany({ sourceType: 'PRELOADED' });
  console.log(`🗑️ Đã xóa ${del.deletedCount} topics cũ.`);

  let totalWordsAll = 0;
  for (const cat of TARGET_SETS) {
    const wordsCount = await crawlCategory(cat);
    totalWordsAll += wordsCount;
  }

  console.log(`\n🎉🎉🎉 HOÀN THÀNH 100%! Tổng cộng đã cào ${totalWordsAll} từ vựng thật từ Đậu TOEIC vào MongoDB!`);
  await mongoose.disconnect();
}

main().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
