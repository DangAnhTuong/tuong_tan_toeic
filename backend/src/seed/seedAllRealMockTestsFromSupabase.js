const https = require('https');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../../.env') });
const MockTest = require('../models/MockTest');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/tuong_tan_toeic';
const SUPABASE_URL = 'https://qfhmnlvgweznzcsoijyr.supabase.co';
const ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFmaG1ubHZnd2V6bnpjc29panlyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg4MDYyMzQsImV4cCI6MjA4NDM4MjIzNH0.mNJAoc-uJVilLr03PT3luXsekfwJ4sICOIsOIRQu-N0';
const SUPABASE_CDN = 'https://qfhmnlvgweznzcsoijyr.supabase.co/storage/v1/object/public/mock-test-media';

function querySupabase(endpoint) {
  return new Promise((resolve, reject) => {
    const url = `${SUPABASE_URL}/rest/v1/${endpoint}`;
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
          resolve([]);
        }
      });
    }).on('error', reject);
  });
}

// Fetch in paginated chunks of 1000
async function fetchAllRows(table, select = '*', filter = '') {
  let all = [];
  let offset = 0;
  const limit = 1000;
  
  while (true) {
    const endpoint = `${table}?select=${select}&limit=${limit}&offset=${offset}${filter ? '&' + filter : ''}`;
    const rows = await querySupabase(endpoint);
    if (!Array.isArray(rows) || rows.length === 0) break;
    all = all.concat(rows);
    if (rows.length < limit) break;
    offset += limit;
  }
  return all;
}

function resolveMediaUrl(rawUrl, year, testNum) {
  if (!rawUrl) return null;
  if (rawUrl.startsWith('http')) return rawUrl;
  return `${SUPABASE_CDN}/${year}/test${testNum}/${rawUrl}`;
}

async function runSeed() {
  console.log('🚀 Connecting to MongoDB...');
  await mongoose.connect(MONGODB_URI);
  console.log('✅ Connected to MongoDB.');

  console.log('📥 Fetching all mock tests and questions from Supabase...');
  const mockTestsSupabase = await fetchAllRows('mock_tests', '*');
  console.log(`📦 Found ${mockTestsSupabase.length} mock_tests in Supabase.`);

  const passagesSupabase = await fetchAllRows('mock_test_passages', '*');
  console.log(`📦 Found ${passagesSupabase.length} mock_test_passages in Supabase.`);

  const passageMap = {};
  passagesSupabase.forEach(p => {
    passageMap[p.id] = p;
  });

  const questionsSupabase = await fetchAllRows('mock_test_questions', '*');
  console.log(`📦 Found ${questionsSupabase.length} mock_test_questions in Supabase.`);

  // Group questions by test_id
  const questionsByTestId = {};
  questionsSupabase.forEach(q => {
    if (!questionsByTestId[q.test_id]) {
      questionsByTestId[q.test_id] = [];
    }
    questionsByTestId[q.test_id].push(q);
  });

  console.log(`🧩 Grouped into ${Object.keys(questionsByTestId).length} unique test sets.`);

  // Clear existing mocktests to prevent duplicates
  await MockTest.deleteMany({});
  console.log('🗑️ Cleared previous mock tests.');

  // Process known years and tests
  const years = [2026, 2024, 2023, 2022, 2020, 2019];
  let totalSeeded = 0;

  for (const sbTest of mockTestsSupabase) {
    const rawQs = questionsByTestId[sbTest.id] || [];
    if (rawQs.length === 0) continue;

    // Sort by question_number
    rawQs.sort((a, b) => (a.question_number || 0) - (b.question_number || 0));

    const year = sbTest.year || 2026;
    const testNum = sbTest.order_index || 1;
    const title = `ETS TOEIC ${year} — ${sbTest.name || `Test ${testNum}`} (Full 200 Câu)`;

    const formattedQuestions = rawQs.map(q => {
      const qNum = q.question_number || 1;
      const part = q.part || (qNum <= 6 ? 1 : qNum <= 31 ? 2 : qNum <= 70 ? 3 : qNum <= 100 ? 4 : qNum <= 130 ? 5 : qNum <= 146 ? 6 : 7);

      const pass = q.passage_id ? passageMap[q.passage_id] : null;
      const passageText = q.passage_text || (pass ? (pass.passage_text || pass.transcript) : null);
      const audioUrl = resolveMediaUrl(q.audio_url || (pass ? pass.audio_url : null), year, testNum);
      const imageUrl = resolveMediaUrl(q.image_url || (pass ? pass.image_url : null), year, testNum);

      const options = [];
      if (q.option_a) options.push({ label: '(A)', text: q.option_a });
      if (q.option_b) options.push({ label: '(B)', text: q.option_b });
      if (q.option_c) options.push({ label: '(C)', text: q.option_c });
      if (q.option_d) options.push({ label: '(D)', text: q.option_d });

      return {
        questionNum: qNum,
        part: part,
        prompt: q.question_text || (part === 1 ? 'Select the statement that best describes what you see in the photograph.' : null),
        audioUrl: audioUrl,
        imageUrl: imageUrl,
        passageText: passageText,
        options: options,
        correctAnswer: q.correct_answer || 'A',
        explanation: q.explanation_vi || q.giai_thich_chi_tiet || q.dich_nghia || null
      };
    });

    await MockTest.create({
      title: title,
      year: year,
      totalQuestions: formattedQuestions.length,
      durationMinutes: 120,
      status: 'Chưa luyện tập',
      isPro: false,
      questions: formattedQuestions
    });

    totalSeeded++;
    console.log(`✅ Seeded ${title}: ${formattedQuestions.length} câu hỏi.`);
  }

  // Also verify other tests grouped in questionsByTestId that might not be in mock_tests table
  for (const tid in questionsByTestId) {
    const already = mockTestsSupabase.find(t => t.id === tid);
    if (already) continue;

    const rawQs = questionsByTestId[tid];
    if (rawQs.length < 50) continue; // Skip incomplete fragments

    rawQs.sort((a, b) => (a.question_number || 0) - (b.question_number || 0));
    
    // Attempt to detect year & test from first audio_url
    let year = 2023;
    let testNum = totalSeeded + 1;
    const sampleAudio = rawQs.find(q => q.audio_url)?.audio_url || '';
    const matchYear = sampleAudio.match(/20\d\d/);
    if (matchYear) year = parseInt(matchYear[0], 10);
    const matchTest = sampleAudio.match(/test\s*0?(\d+)/i) || sampleAudio.match(/t(\d+)/i);
    if (matchTest) testNum = parseInt(matchTest[1], 10);

    const title = `ETS TOEIC ${year} — Test ${testNum} (Full 200 Câu)`;

    const formattedQuestions = rawQs.map(q => {
      const qNum = q.question_number || 1;
      const part = q.part || (qNum <= 6 ? 1 : qNum <= 31 ? 2 : qNum <= 70 ? 3 : qNum <= 100 ? 4 : qNum <= 130 ? 5 : qNum <= 146 ? 6 : 7);

      const pass = q.passage_id ? passageMap[q.passage_id] : null;
      const passageText = q.passage_text || (pass ? (pass.passage_text || pass.transcript) : null);
      const audioUrl = resolveMediaUrl(q.audio_url || (pass ? pass.audio_url : null), year, testNum);
      const imageUrl = resolveMediaUrl(q.image_url || (pass ? pass.image_url : null), year, testNum);

      const options = [];
      if (q.option_a) options.push({ label: '(A)', text: q.option_a });
      if (q.option_b) options.push({ label: '(B)', text: q.option_b });
      if (q.option_c) options.push({ label: '(C)', text: q.option_c });
      if (q.option_d) options.push({ label: '(D)', text: q.option_d });

      return {
        questionNum: qNum,
        part: part,
        prompt: q.question_text || (part === 1 ? 'Select the statement that best describes what you see in the photograph.' : null),
        audioUrl: audioUrl,
        imageUrl: imageUrl,
        passageText: passageText,
        options: options,
        correctAnswer: q.correct_answer || 'A',
        explanation: q.explanation_vi || q.giai_thich_chi_tiet || q.dich_nghia || null
      };
    });

    await MockTest.create({
      title: title,
      year: year,
      totalQuestions: formattedQuestions.length,
      durationMinutes: 120,
      status: 'Chưa luyện tập',
      isPro: false,
      questions: formattedQuestions
    });

    totalSeeded++;
    console.log(`✅ Seeded additional ${title}: ${formattedQuestions.length} câu hỏi.`);
  }

  console.log(`\n🎉 HOÀN TẤT SEED TOÀN BỘ ${totalSeeded} BỘ ĐỀ MOCK TEST ETS THẬT TỪ SUPABASE!`);
  await mongoose.disconnect();
}

runSeed().catch(err => {
  console.error('❌ Seed error:', err);
  process.exit(1);
});
