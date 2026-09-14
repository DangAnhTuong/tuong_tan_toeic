const mongoose = require('mongoose');
const https = require('https');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../../.env') });

const ReadingExercise = require('../models/ReadingExercise');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/tuong_tan_toeic';

const anonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFmaG1ubHZnd2V6bnpjc29panlyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg4MDYyMzQsImV4cCI6MjA4NDM4MjIzNH0.mNJAoc-uJVilLr03PT3luXsekfwJ4sICOIsOIRQu-N0';

function querySupabase(pathStr, retries = 3) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'qfhmnlvgweznzcsoijyr.supabase.co',
      path: pathStr,
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'apikey': anonKey,
        'Authorization': `Bearer ${anonKey}`
      }
    };

    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(body) });
        } catch {
          resolve({ status: res.statusCode, body });
        }
      });
    });

    req.on('error', async (err) => {
      if (retries > 0) {
        console.warn(`Retry request ${pathStr} due to:`, err.message);
        await new Promise(r => setTimeout(r, 1000));
        resolve(querySupabase(pathStr, retries - 1));
      } else {
        reject(err);
      }
    });

    req.end();
  });
}

function parseOptionTranslations(dichNghia) {
  if (!dichNghia) return {};
  const transMap = {};
  const lines = String(dichNghia).split('\n').map(l => l.trim()).filter(Boolean);
  for (const l of lines) {
    const match = l.match(/^([A-D])[\.\)]\s*(.+)/i) || l.match(/^\(([A-D])\)\s*(.+)/i);
    if (match) {
      transMap[match[1].toUpperCase()] = match[2].trim();
    }
  }
  return transMap;
}

const levelMeta = [
  { level: 1, name: 'Level 1 — Dễ', rate: '2% - 17%', isPro: false },
  { level: 2, name: 'Level 2 — Cơ bản', rate: '17% - 27%', isPro: false },
  { level: 3, name: 'Level 3 — Trung bình', rate: '27% - 38%', isPro: true },
  { level: 4, name: 'Level 4 — Khó', rate: '38% - 51%', isPro: true },
  { level: 5, name: 'Level 5 — Rất khó', rate: '51% - 87%', isPro: true }
];

async function crawlAllReadingLevels() {
  await mongoose.connect(MONGODB_URI, { serverSelectionTimeoutMS: 5000 });
  console.log('✅ Connected to MongoDB.');

  // ====================================================
  // 1. CRAWL PART 5 (5 LEVELS)
  // ====================================================
  console.log('\n======================================================');
  console.log('🚀 1. CRAWLING PART 5 (TẤT CẢ 5 LEVELS)...');
  console.log('======================================================');

  let allP5Questions = [];
  let p5Offset = 0;
  while (true) {
    const resP5 = await querySupabase(`/rest/v1/mock_test_questions?part=eq.5&order=order_index.asc&limit=500&offset=${p5Offset}&select=*`);
    if (resP5.data && Array.isArray(resP5.data) && resP5.data.length > 0) {
      allP5Questions.push(...resP5.data);
      if (resP5.data.length < 500) break;
      p5Offset += 500;
    } else {
      break;
    }
  }
  console.log(`✅ Loaded total ${allP5Questions.length} Part 5 questions.`);

  // Delete old Part 5 level exercises
  await ReadingExercise.deleteMany({ part: 'Part 5', mode: 'level' });

  // Divide into 5 levels
  const p5ChunkSize = Math.ceil(allP5Questions.length / 5);
  for (let lvl = 1; lvl <= 5; lvl++) {
    const meta = levelMeta[lvl - 1];
    const chunk = allP5Questions.slice((lvl - 1) * p5ChunkSize, lvl * p5ChunkSize);

    const transformed = chunk.map((q, idx) => {
      const transMap = parseOptionTranslations(q.dich_nghia_dap_an || q.explanation_en);
      return {
        questionNum: q.question_number || idx + 101,
        prompt: q.question_text || 'Select the best answer to complete the sentence.',
        passageText: q.passage_text || q.question_text || '',
        options: [
          { label: '(A)', text: q.option_a || 'A', translation: transMap['A'] || '' },
          { label: '(B)', text: q.option_b || 'B', translation: transMap['B'] || '' },
          { label: '(C)', text: q.option_c || 'C', translation: transMap['C'] || '' },
          { label: '(D)', text: q.option_d || 'D', translation: transMap['D'] || '' }
        ],
        correctAnswer: q.correct_answer || 'A',
        explanation: (q.explanation_vi || '').trim(),
        translation: (q.dich_nghia || '').trim(),
        tuVung: q.tu_vung || ''
      };
    });

    const doc = new ReadingExercise({
      title: `${meta.name} (Part 5)`,
      mode: 'level',
      part: 'Part 5',
      level: lvl,
      levelName: meta.name,
      errorRate: meta.rate,
      isPro: meta.isPro,
      totalQuestions: transformed.length,
      questions: transformed
    });
    await doc.save();
    console.log(`💾 [SAVED PART 5] ${meta.name}: ${transformed.length} câu hỏi!`);
  }

  // ====================================================
  // 2. CRAWL PART 6 (5 LEVELS - 4 QUESTIONS PER PASSAGE)
  // ====================================================
  console.log('\n======================================================');
  console.log('🚀 2. CRAWLING PART 6 (TẤT CẢ 5 LEVELS)...');
  console.log('======================================================');

  let allP6Passages = [];
  let p6Offset = 0;
  while (true) {
    const resP6 = await querySupabase(`/rest/v1/mock_test_passages?part=eq.6&order=order_index.asc&limit=500&offset=${p6Offset}&select=*`);
    if (resP6.data && Array.isArray(resP6.data) && resP6.data.length > 0) {
      allP6Passages.push(...resP6.data);
      if (resP6.data.length < 500) break;
      p6Offset += 500;
    } else {
      break;
    }
  }
  console.log(`✅ Loaded total ${allP6Passages.length} Part 6 passages.`);

  // Fetch all Part 6 questions
  const p6PassageIds = allP6Passages.map(p => p.id);
  const allP6Questions = [];
  for (let i = 0; i < p6PassageIds.length; i += 100) {
    const chunk = p6PassageIds.slice(i, i + 100);
    const qRes = await querySupabase(`/rest/v1/mock_test_questions?passage_id=in.(${chunk.join(',')})&select=*`);
    if (qRes.data && Array.isArray(qRes.data)) {
      allP6Questions.push(...qRes.data);
    }
  }

  const p6QuestionsByPassage = {};
  allP6Questions.forEach(q => {
    if (!p6QuestionsByPassage[q.passage_id]) p6QuestionsByPassage[q.passage_id] = [];
    p6QuestionsByPassage[q.passage_id].push(q);
  });
  Object.keys(p6QuestionsByPassage).forEach(pId => {
    p6QuestionsByPassage[pId].sort((a, b) => (a.question_number || 0) - (b.question_number || 0));
  });

  await ReadingExercise.deleteMany({ part: 'Part 6', mode: 'level' });

  const p6ChunkSize = Math.ceil(allP6Passages.length / 5);
  for (let lvl = 1; lvl <= 5; lvl++) {
    const meta = levelMeta[lvl - 1];
    const passageChunk = allP6Passages.slice((lvl - 1) * p6ChunkSize, lvl * p6ChunkSize);

    const transformed = [];
    let globalQNum = 1;

    passageChunk.forEach((p, pIdx) => {
      const pQuestions = p6QuestionsByPassage[p.id] || [];
      const cleanPassage = p.passage_text || '';

      pQuestions.forEach(q => {
        const transMap = parseOptionTranslations(q.dich_nghia_dap_an || q.explanation_en);
        transformed.push({
          questionNum: q.question_number || globalQNum++,
          prompt: q.question_text || p.title || 'Questions 131-134 refer to the following text.',
          passageText: cleanPassage,
          passageTitle: p.title || `Passage #${pIdx + 1}`,
          passageId: p.id,
          options: [
            { label: '(A)', text: q.option_a || 'A', translation: transMap['A'] || '' },
            { label: '(B)', text: q.option_b || 'B', translation: transMap['B'] || '' },
            { label: '(C)', text: q.option_c || 'C', translation: transMap['C'] || '' },
            { label: '(D)', text: q.option_d || 'D', translation: transMap['D'] || '' }
          ],
          correctAnswer: q.correct_answer || 'A',
          explanation: (q.explanation_vi || '').trim(),
          translation: (q.dich_nghia || '').trim(),
          tuVung: q.tu_vung || ''
        });
      });
    });

    const doc = new ReadingExercise({
      title: `${meta.name} (Part 6)`,
      mode: 'level',
      part: 'Part 6',
      level: lvl,
      levelName: meta.name,
      errorRate: meta.rate,
      isPro: meta.isPro,
      totalQuestions: transformed.length,
      questions: transformed
    });
    await doc.save();
    console.log(`💾 [SAVED PART 6] ${meta.name}: ${transformed.length} câu (${passageChunk.length} đoạn)!`);
  }

  // ====================================================
  // 3. CRAWL PART 7 (5 LEVELS - SINGLE/DOUBLE/TRIPLE PASSAGES)
  // ====================================================
  console.log('\n======================================================');
  console.log('🚀 3. CRAWLING PART 7 (TẤT CẢ 5 LEVELS)...');
  console.log('======================================================');

  let allP7Passages = [];
  let p7Offset = 0;
  while (true) {
    const resP7 = await querySupabase(`/rest/v1/mock_test_passages?part=eq.7&order=order_index.asc&limit=500&offset=${p7Offset}&select=*`);
    if (resP7.data && Array.isArray(resP7.data) && resP7.data.length > 0) {
      allP7Passages.push(...resP7.data);
      if (resP7.data.length < 500) break;
      p7Offset += 500;
    } else {
      break;
    }
  }
  console.log(`✅ Loaded total ${allP7Passages.length} Part 7 passages.`);

  // Fetch all Part 7 questions
  const p7PassageIds = allP7Passages.map(p => p.id);
  const allP7Questions = [];
  for (let i = 0; i < p7PassageIds.length; i += 100) {
    const chunk = p7PassageIds.slice(i, i + 100);
    const qRes = await querySupabase(`/rest/v1/mock_test_questions?passage_id=in.(${chunk.join(',')})&select=*`);
    if (qRes.data && Array.isArray(qRes.data)) {
      allP7Questions.push(...qRes.data);
    }
  }

  const p7QuestionsByPassage = {};
  allP7Questions.forEach(q => {
    if (!p7QuestionsByPassage[q.passage_id]) p7QuestionsByPassage[q.passage_id] = [];
    p7QuestionsByPassage[q.passage_id].push(q);
  });
  Object.keys(p7QuestionsByPassage).forEach(pId => {
    p7QuestionsByPassage[pId].sort((a, b) => (a.question_number || 0) - (b.question_number || 0));
  });

  await ReadingExercise.deleteMany({ part: 'Part 7', mode: 'level' });

  const p7ChunkSize = Math.ceil(allP7Passages.length / 5);
  for (let lvl = 1; lvl <= 5; lvl++) {
    const meta = levelMeta[lvl - 1];
    const passageChunk = allP7Passages.slice((lvl - 1) * p7ChunkSize, lvl * p7ChunkSize);

    const transformed = [];
    let globalQNum = 1;

    passageChunk.forEach((p, pIdx) => {
      const pQuestions = p7QuestionsByPassage[p.id] || [];
      const cleanPassage = [p.passage_text, p.passage_text_2, p.passage_text_3].filter(Boolean).join('\n<hr/>\n');

      pQuestions.forEach(q => {
        const transMap = parseOptionTranslations(q.dich_nghia_dap_an || q.explanation_en);
        transformed.push({
          questionNum: q.question_number || globalQNum++,
          prompt: q.question_text || 'Select the best answer.',
          passageText: cleanPassage,
          passageTitle: p.title || `Passage #${pIdx + 1}`,
          passageId: p.id,
          imageUrl: q.image_url || p.image_url || '',
          options: [
            { label: '(A)', text: q.option_a || 'A', translation: transMap['A'] || '' },
            { label: '(B)', text: q.option_b || 'B', translation: transMap['B'] || '' },
            { label: '(C)', text: q.option_c || 'C', translation: transMap['C'] || '' },
            { label: '(D)', text: q.option_d || 'D', translation: transMap['D'] || '' }
          ],
          correctAnswer: q.correct_answer || 'A',
          explanation: (q.explanation_vi || '').trim(),
          translation: (q.dich_nghia || '').trim(),
          tuVung: q.tu_vung || ''
        });
      });
    });

    const doc = new ReadingExercise({
      title: `${meta.name} (Part 7)`,
      mode: 'level',
      part: 'Part 7',
      level: lvl,
      levelName: meta.name,
      errorRate: meta.rate,
      isPro: meta.isPro,
      totalQuestions: transformed.length,
      questions: transformed
    });
    await doc.save();
    console.log(`💾 [SAVED PART 7] ${meta.name}: ${transformed.length} câu (${passageChunk.length} đoạn)!`);
  }

  console.log('\n🌟 HOÀN TẤT CÀO TRỌN BỘ READING 5 LEVEL CHO PART 5, 6, 7!');
}

if (require.main === module) {
  crawlAllReadingLevels().then(() => mongoose.connection.close());
}

module.exports = { crawlAllReadingLevels };
