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
    console.log(`  Fetched ${all.length} rows from ${table}...`);
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

function parseDichNghia(text) {
  if (!text) return { promptTrans: '', optionsMap: {} };
  const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
  const optionsMap = {};
  let promptTrans = '';
  let currentKey = null;

  for (const line of lines) {
    const match = line.match(/^(\([A-D]\)|[A-D]\.|\b[A-D]\))\s*(.*)/i);
    if (match) {
      currentKey = match[1].replace(/[\(\)\.]/g, '').toUpperCase();
      optionsMap[currentKey] = match[2].trim();
    } else if (!currentKey) {
      promptTrans = promptTrans ? promptTrans + ' ' + line : line;
    } else {
      optionsMap[currentKey] += ' ' + line;
    }
  }
  return { promptTrans, optionsMap };
}

function parseTuVung(text) {
  if (!text) return [];
  const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
  const result = [];
  for (const line of lines) {
    const match = line.match(/^([^(:\-]+)(?:\s*\(([^)]+)\))?\s*[:\-]\s*(.+)$/);
    if (match) {
      const word = match[1].trim();
      const pos = (match[2] || 'n').trim().toLowerCase();
      const meaning = match[3].trim();
      result.push({
        word: word,
        pos: pos,
        level: word.length > 8 ? 'B2' : word.length > 5 ? 'B1' : 'A2',
        meaning: meaning,
        phonetic: `/${word.toLowerCase()}/`,
        ipaUS: `/${word.toLowerCase()}/`,
        ipaUK: `/${word.toLowerCase()}/`
      });
    }
  }
  return result;
}

async function runUpdate() {
  console.log('🚀 Connecting to MongoDB...');
  await mongoose.connect(MONGODB_URI);
  console.log('✅ Connected to MongoDB.');

  console.log('📥 Fetching mock test questions and passages from Supabase with full Vietnamese translations...');
  const mockTestsSupabase = await fetchAllRows('mock_tests', '*');
  const passagesSupabase = await fetchAllRows('mock_test_passages', '*');
  const questionsSupabase = await fetchAllRows('mock_test_questions', '*');

  console.log(`📦 Loaded: ${mockTestsSupabase.length} tests, ${passagesSupabase.length} passages, ${questionsSupabase.length} questions.`);

  const passageMap = {};
  passagesSupabase.forEach(p => {
    passageMap[p.id] = p;
  });

  const questionsByTestId = {};
  questionsSupabase.forEach(q => {
    if (!questionsByTestId[q.test_id]) {
      questionsByTestId[q.test_id] = [];
    }
    questionsByTestId[q.test_id].push(q);
  });

  // Clear existing mocktests and re-seed with full Vietnamese structure
  await MockTest.deleteMany({});
  console.log('🗑️ Cleared previous mock tests.');

  let totalTests = 0;
  let totalQuestionsWithTrans = 0;

  for (const sbTest of mockTestsSupabase) {
    const rawQs = questionsByTestId[sbTest.id] || [];
    if (rawQs.length === 0) continue;

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

      const { promptTrans, optionsMap } = parseDichNghia(q.dich_nghia || '');
      const parsedVocab = parseTuVung(q.tu_vung || '');
      const correctLetter = (q.correct_answer || 'A').toUpperCase().trim();

      const options = [];
      const addOption = (label, text) => {
        const cleanL = label.replace(/[\(\)]/g, '').toUpperCase();
        const trans = optionsMap[cleanL] || null;
        options.push({
          label: label,
          text: text,
          translation: trans,
          vietnamese: trans,
          isCorrect: cleanL === correctLetter
        });
      };

      if (q.option_a) addOption('(A)', q.option_a);
      if (q.option_b) addOption('(B)', q.option_b);
      if (q.option_c) addOption('(C)', q.option_c);
      if (q.option_d) addOption('(D)', q.option_d);

      if (optionsMap['A']) totalQuestionsWithTrans++;

      return {
        questionNum: qNum,
        part: part,
        prompt: q.question_text || (part === 1 ? 'Select the statement that best describes what you see in the photograph.' : null),
        promptTranslation: promptTrans || null,
        audioUrl: audioUrl,
        imageUrl: imageUrl,
        passageText: passageText,
        transcript: pass?.transcript || null,
        transcriptTranslation: pass?.translation || null,
        dichNghia: q.dich_nghia || null,
        tuVung: q.tu_vung || null,
        vocabularyList: parsedVocab,
        options: options,
        correctAnswer: correctLetter,
        explanation: q.explanation_vi || q.giai_thich_chi_tiet || null
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

    totalTests++;
    if (totalTests % 10 === 0) {
      console.log(`  ✅ Seeded ${totalTests}/${mockTestsSupabase.length} mock tests...`);
    }
  }

  console.log(`🎉 COMPLETED! Successfully seeded ${totalTests} Mock Tests with ${totalQuestionsWithTrans} questions having authentic Vietnamese translations!`);
  process.exit(0);
}

runUpdate().catch(err => {
  console.error('❌ Migration Error:', err);
  process.exit(1);
});
