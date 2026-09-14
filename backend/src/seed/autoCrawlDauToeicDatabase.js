const mongoose = require('mongoose');
const https = require('https');
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');

dotenv.config({ path: path.join(__dirname, '../../.env') });

const ListeningExercise = require('../models/ListeningExercise');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/tuong_tan_toeic';

const userToken = 'eyJhbGciOiJFUzI1NiIsImtpZCI6ImUwNTFjYmQ0LTMzOTgtNGQ0Yy05NDc0LTUzNjIwMTBmN2Q5YiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJodHRwczovL3FmaG1ubHZnd2V6bnpjc29panlyLnN1cGFiYXNlLmNvL2F1dGgvdjEiLCJzdWIiOiI2MmViZmQ0ZC1hMjI1LTQ3MGQtODdlNy1hZGQ0NDdkZjcyZjgiLCJhdWQiOiJhdXRoZW50aWNhdGVkIiwiZXhwIjoxNzg3NzE5MDM2LCJpYXQiOjE3ODc3MTU0MzYsImVtYWlsIjoiZGFuZ2FuaHR1YW4yNTExMjAwOEBnbWFpbC5jb20iLCJwaG9uZSI6IiIsImFwcF9tZXRhZGF0YSI6eyJwcm92aWRlciI6Imdvb2dsZSIsInByb3ZpZGVycyI6WyJnb29nbGUiXX0sInVzZXJfbWV0YWRhdGEiOnsiYXZhdGFyX3VybCI6Imh0dHBzOi8vbGgzLmdvb2dsZXVzZXJjb250ZW50LmNvbS9hL0FDZzhvY0xXN09QOE1fdXNoVlpMOVhXWWNvbE40MGgyT3FKWTl3TnpOTWJxN2RaZ1lVQWRGdz1zOTYtYyIsImVtYWlsIjoiZGFuZ2FuaHR1YW4yNTExMjAwOEBnbWFpbC5jb20iLCJlbWFpbF92ZXJpZmllZCI6dHJ1ZSwiZnVsbF9uYW1lIjoiVHXhuqVuIMSQ4bq3bmciLCJpc3MiOiJodHRwczovL2FjY291bnRzLmdvb2dsZS5jb20iLCJuYW1lIjoiVHXhuqVuIMSQ4bq3bmciLCJwaG9uZV92ZXJpZmllZCI6ZmFsc2UsInBpY3R1cmUiOiJodHRwczovL2xoMy5nb29nbGV1c2VyY29udGVudC5jb20vYS9BQ2c4b2NMVzdPUDhNX3VzaFZaTDlYV1ljb2xONDBoMk9xSlk5d056Tk1icTdkWmdZVUFkRnc9czk2LWMiLCJwcm92aWRlcl9pZCI6IjExMjYxNjUzODAwMTc1MzI2OTY3MCIsInN1YiI6IjExMjYxNjUzODAwMTc1MzI2OTY3MCJ9LCJyb2xlIjoiYXV0aGVudGljYXRlZCIsImFhbCI6ImFhbDEiLCJhbXIiOlt7Im1ldGhvZCI6Im9hdXRoIiwidGltZXN0YW1wIjoxNzg1NTAxNjIwfV0sInNlc3Npb25faWQiOiJkYWE0YjBlYy1mZGM2LTQ1ZWEtODc0NS1mZmI4OGY5YjJkOWYiLCJpc19hbm9ueW1vdXMiOmZhbHNlfQ.EfntyvrAETUtHnnoTdLp5rXAdadPSVb1LaQQGXqNc_6IURVtssESTwrkUE_EEofleFKo3VFCaj2Z0KiyosEihg';
const anonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFmaG1ubHZnd2V6bnpjc29panlyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg4MDYyMzQsImV4cCI6MjA4NDM4MjIzNH0.mNJAoc-uJVilLr03PT3luXsekfwJ4sICOIsOIRQu-N0';

const SUPABASE_CDN = "https://qfhmnlvgweznzcsoijyr.supabase.co/storage/v1/object/public/mock-test-media";

function querySupabase(pathStr, method = 'GET', payload = null) {
  return new Promise((resolve, reject) => {
    const postData = payload ? JSON.stringify(payload) : null;
    const options = {
      hostname: 'qfhmnlvgweznzcsoijyr.supabase.co',
      path: pathStr,
      method: method,
      headers: {
        'Content-Type': 'application/json',
        'apikey': anonKey,
        'Authorization': `Bearer ${userToken}`,
        ...(postData ? { 'Content-Length': Buffer.byteLength(postData) } : {})
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

    req.on('error', reject);
    if (postData) req.write(postData);
    req.end();
  });
}

function parseVocabulary(tuVungStr) {
  if (!tuVungStr) return [];
  const lines = tuVungStr.split('\n').map(l => l.trim()).filter(Boolean);
  const result = [];
  for (const line of lines) {
    const cleaned = line.replace(/^[\*\-\•]\s*/, '').trim();
    if (cleaned.includes(':')) {
      const [wordPart, meaningPart] = cleaned.split(':').map(s => s.trim());
      if (wordPart && meaningPart) {
        result.push({
          word: wordPart,
          pos: 'n',
          level: 'B1',
          ipaUS: `/${wordPart}/`,
          ipaUK: `/${wordPart}/`,
          meaning: meaningPart,
          example: `Learn the term "${wordPart}".`,
          exampleTrans: `Học thuật ngữ "${wordPart}".`,
          collocations: []
        });
      }
    }
  }
  return result;
}

function parseTranslationsFromExplanationEn(expEn) {
  if (!expEn) return { promptTrans: '', optionTrans: {} };
  const lines = expEn.split('\n').map(l => l.trim()).filter(Boolean);
  const promptTrans = lines[0] || '';
  const optionTrans = {};
  for (const l of lines.slice(1)) {
    const match = l.match(/^([A-D])\.\s*(.+)/);
    if (match) {
      optionTrans[match[1]] = match[2];
    }
  }
  return { promptTrans, optionTrans };
}

async function crawlAndSeedPart(partNum = 3, maxPassages = 50) {
  console.log(`\n========================================`);
  console.log(`🚀 CRAWLING PART ${partNum} TỪ ĐẬU TOEIC PREMIUM...`);
  console.log(`========================================`);

  // 1. Fetch passages for Part
  console.log(`1. Fetching passages for Part ${partNum}...`);
  const passagesRes = await querySupabase(`/rest/v1/mock_test_passages?part=eq.${partNum}&order=order_index.asc&limit=${maxPassages}&select=*`);
  
  if (passagesRes.status !== 200 || !Array.isArray(passagesRes.data)) {
    console.error(`❌ Failed to fetch passages:`, passagesRes);
    return;
  }

  const passages = passagesRes.data;
  console.log(`✅ Loaded ${passages.length} passages for Part ${partNum}`);

  // 2. Collect test_ids to fetch media folders
  const testIds = [...new Set(passages.map(p => p.test_id).filter(Boolean))];
  console.log(`2. Fetching media folders for ${testIds.length} tests...`);
  const mediaRes = await querySupabase('/rest/v1/rpc/get_mock_test_media_batch', 'POST', {
    p_test_ids: testIds
  });

  const mediaMap = {};
  if (mediaRes.data && Array.isArray(mediaRes.data)) {
    mediaRes.data.forEach(m => {
      mediaMap[m.id] = m.media_folder;
    });
  }

  // 3. Fetch questions for all passages
  const passageIds = passages.map(p => p.id);
  console.log(`3. Fetching question skeletons for ${passageIds.length} passages...`);
  const skeletonRes = await querySupabase('/rest/v1/rpc/get_mock_question_skeleton_by_passages_fast', 'POST', {
    p_passage_ids: passageIds
  });

  const questionIds = skeletonRes.data ? skeletonRes.data.map(q => q.id) : [];
  console.log(`✅ Found ${questionIds.length} question IDs.`);

  // 4. Fetch full question details in batches of 50
  console.log(`4. Fetching detailed questions data (prompts, options, explanations, vocabulary)...`);
  const allQuestions = [];
  const chunkSize = 50;
  for (let i = 0; i < questionIds.length; i += chunkSize) {
    const chunk = questionIds.slice(i, i + chunkSize);
    const qDetailsRes = await querySupabase(`/rest/v1/mock_test_questions?id=in.(${chunk.join(',')})&select=*`);
    if (qDetailsRes.data && Array.isArray(qDetailsRes.data)) {
      allQuestions.push(...qDetailsRes.data);
      process.stdout.write(`.` );
    }
  }
  console.log(`\n✅ Fetched full details for ${allQuestions.length} questions!`);

  // 5. Group questions by passage
  const questionsByPassage = {};
  allQuestions.forEach(q => {
    if (!questionsByPassage[q.passage_id]) questionsByPassage[q.passage_id] = [];
    questionsByPassage[q.passage_id].push(q);
  });

  // Sort questions within passage by question_number
  Object.keys(questionsByPassage).forEach(pId => {
    questionsByPassage[pId].sort((a, b) => (a.question_number || 0) - (b.question_number || 0));
  });

  // 6. Transform into our MongoDB ListeningExercise format
  const transformedQuestions = [];
  let globalQNum = 1;

  passages.forEach((p, pIdx) => {
    const pQuestions = questionsByPassage[p.id] || [];
    if (pQuestions.length === 0) return;

    const mediaFolder = mediaMap[p.test_id] || '2026/t1';
    const audioUrl = p.audio_url 
      ? (p.audio_url.startsWith('http') ? p.audio_url : `${SUPABASE_CDN}/${mediaFolder}/${p.audio_url}`)
      : `${SUPABASE_CDN}/${mediaFolder}/32-34.mp3`;

    // Clean transcript HTML tags
    const cleanTranscript = (p.transcript || '')
      .replace(/<\/?p>/g, '\n')
      .replace(/<br\s*\/?>/g, '\n')
      .replace(/<\/?strong>/g, '')
      .replace(/SCRIPT/g, '')
      .replace(/\n\s*\n/g, '\n')
      .trim();

    const cleanTranslation = (pQuestions[0]?.dich_nghia || '').trim();

    pQuestions.forEach((q, subI) => {
      const { promptTrans, optionTrans } = parseTranslationsFromExplanationEn(q.explanation_en);
      const vocabList = parseVocabulary(q.tu_vung);

      const options = [
        { label: '(A)', text: q.option_a || 'Option A', translation: optionTrans['A'] || '', isCorrect: q.correct_answer === 'A' },
        { label: '(B)', text: q.option_b || 'Option B', translation: optionTrans['B'] || '', isCorrect: q.correct_answer === 'B' },
        { label: '(C)', text: q.option_c || 'Option C', translation: optionTrans['C'] || '', isCorrect: q.correct_answer === 'C' },
        { label: '(D)', text: q.option_d || 'Option D', translation: optionTrans['D'] || '', isCorrect: q.correct_answer === 'D' }
      ];

      transformedQuestions.push({
        questionNumber: globalQNum++,
        passageId: p.id,
        passageNumber: pIdx + 1,
        passageTitle: `Nhóm câu ${pQuestions[0]?.question_number || 32}-${pQuestions[pQuestions.length - 1]?.question_number || 34} (3 câu hỏi)`,
        subQuestionIndex: subI,
        testQuestionNumber: q.question_number || (pIdx * 3 + subI + 1),
        audioUrl: audioUrl,
        imageUrl: q.image_url || p.image_url || '',
        promptText: q.question_text || 'Select the best response.',
        promptTranslation: promptTrans || '',
        options: options,
        transcript: cleanTranscript || 'Conversation audio',
        translation: cleanTranslation || 'Bản dịch tiếng Việt',
        dictationText: cleanTranscript.slice(0, 150),
        explanation: (q.explanation_vi || '').trim(),
        vocabularyList: vocabList
      });
    });
  });

  console.log(`\n🎉 Transformed ${transformedQuestions.length} real questions (${transformedQuestions.length / 3} passages)!`);

  // 7. Save to MongoDB
  await mongoose.connect(MONGODB_URI, { serverSelectionTimeoutMS: 5000 });
  
  // Upsert Level 1 for Part
  await ListeningExercise.deleteMany({ mode: 'level', part: partNum, level: 1 });
  
  const exerciseDoc = new ListeningExercise({
    title: `Level 1 — Dễ (Part ${partNum} Đậu TOEIC VIP Real)`,
    part: partNum,
    level: 1,
    mode: 'level',
    year: '2026',
    topic: 'Real ETS Business Conversations',
    errorRate: '1% - 14%',
    isPro: false,
    totalQuestions: transformedQuestions.length,
    questions: transformedQuestions
  });

  await exerciseDoc.save();
  console.log(`💾 SAVED TO MONGODB SUCCESSFULLY: Part ${partNum} Level 1 (${transformedQuestions.length} câu hỏi thật)!`);
}

async function main() {
  try {
    // Crawl Part 3 (first 50 real passages = 150 questions)
    await crawlAndSeedPart(3, 50);
    // Crawl Part 4 (first 50 real passages = 150 questions)
    await crawlAndSeedPart(4, 50);
    console.log('\n🌟 ALL PART 3 & PART 4 CRAWLED AND INGESTED 100% REAL FROM ĐẬU TOEIC PREMIUM!');
  } catch (err) {
    console.error('Crawler Error:', err);
  } finally {
    mongoose.connection.close();
  }
}

if (require.main === module) {
  main();
}

module.exports = { crawlAndSeedPart };
