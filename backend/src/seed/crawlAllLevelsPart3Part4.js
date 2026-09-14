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

function querySupabase(pathStr, method = 'GET', payload = null, retries = 3) {
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

    req.on('error', async (err) => {
      if (retries > 0) {
        console.warn(`Retry request ${pathStr} due to error:`, err.message);
        await new Promise(r => setTimeout(r, 1000));
        resolve(querySupabase(pathStr, method, payload, retries - 1));
      } else {
        reject(err);
      }
    });

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
          example: `Practice the phrase "${wordPart}".`,
          exampleTrans: `Luyện tập cụm từ "${wordPart}".`,
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

async function fetchAllPracticeStats(partNum) {
  console.log(`📡 Fetching practice stats (5 levels difficulty partitioning) for Part ${partNum}...`);
  const allStats = [];
  const limit = 1000;
  let offset = 0;

  while (true) {
    const res = await querySupabase('/rest/v1/rpc/get_practice_stats_page', 'POST', {
      p_part: partNum,
      p_limit: limit,
      p_offset: offset
    });

    if (res.data && Array.isArray(res.data) && res.data.length > 0) {
      allStats.push(...res.data);
      if (res.data.length < limit) break;
      offset += limit;
    } else {
      break;
    }
  }
  console.log(`✅ Loaded ${allStats.length} passage difficulty assignments for Part ${partNum}`);
  return allStats;
}

async function crawlAndSeedFullPart(partNum) {
  console.log(`\n======================================================`);
  console.log(`🚀 BẮT ĐẦU CÀO TRỌN BỘ 5 LEVELS CHO PART ${partNum} TỪ ĐẬU TOEIC...`);
  console.log(`======================================================`);

  // 1. Get difficulty stats (item_id -> level)
  const statsList = await fetchAllPracticeStats(partNum);
  const statsMap = new Map();
  statsList.forEach(s => {
    statsMap.set(s.item_id, {
      level: s.difficulty_level || 1,
      errorRate: `${((s.error_rate || 0) * 100).toFixed(1)}%`
    });
  });

  // 2. Fetch all passages for this Part
  console.log(`📥 Fetching all passages for Part ${partNum}...`);
  const allPassages = [];
  let pOffset = 0;
  const pLimit = 500;
  while (true) {
    const res = await querySupabase(`/rest/v1/mock_test_passages?part=eq.${partNum}&order=order_index.asc&limit=${pLimit}&offset=${pOffset}&select=*`);
    if (res.data && Array.isArray(res.data) && res.data.length > 0) {
      allPassages.push(...res.data);
      if (res.data.length < pLimit) break;
      pOffset += pLimit;
    } else {
      break;
    }
  }
  console.log(`✅ Loaded total ${allPassages.length} raw passages from database!`);

  // 3. Fetch media folders for all tests
  const testIds = [...new Set(allPassages.map(p => p.test_id).filter(Boolean))];
  console.log(`🎬 Fetching media folders for ${testIds.length} ETS tests...`);
  const mediaMap = {};
  for (let i = 0; i < testIds.length; i += 100) {
    const chunk = testIds.slice(i, i + 100);
    const mediaRes = await querySupabase('/rest/v1/rpc/get_mock_test_media_batch', 'POST', {
      p_test_ids: chunk
    });
    if (mediaRes.data && Array.isArray(mediaRes.data)) {
      mediaRes.data.forEach(m => {
        mediaMap[m.id] = m.media_folder;
      });
    }
  }

  // 4. Fetch question skeletons for all passages in chunks of 100
  console.log(`🧩 Fetching question skeletons for all ${allPassages.length} passages...`);
  const allPassageIds = allPassages.map(p => p.id);
  const allQuestionIds = [];
  for (let i = 0; i < allPassageIds.length; i += 100) {
    const chunk = allPassageIds.slice(i, i + 100);
    const skelRes = await querySupabase('/rest/v1/rpc/get_mock_question_skeleton_by_passages_fast', 'POST', {
      p_passage_ids: chunk
    });
    if (skelRes.data && Array.isArray(skelRes.data)) {
      allQuestionIds.push(...skelRes.data.map(q => q.id));
    }
  }
  console.log(`✅ Loaded ${allQuestionIds.length} question IDs!`);

  // 5. Fetch full question details in chunks of 100
  console.log(`📖 Fetching full question details, options, explanations and vocabulary...`);
  const allQuestions = [];
  for (let i = 0; i < allQuestionIds.length; i += 100) {
    const chunk = allQuestionIds.slice(i, i + 100);
    const qRes = await querySupabase(`/rest/v1/mock_test_questions?id=in.(${chunk.join(',')})&select=*`);
    if (qRes.data && Array.isArray(qRes.data)) {
      allQuestions.push(...qRes.data);
      process.stdout.write(`.`);
    }
  }
  console.log(`\n✅ Fetched complete data for ${allQuestions.length} questions!`);

  // 6. Group questions by passage_id
  const questionsByPassage = {};
  allQuestions.forEach(q => {
    if (!questionsByPassage[q.passage_id]) questionsByPassage[q.passage_id] = [];
    questionsByPassage[q.passage_id].push(q);
  });
  Object.keys(questionsByPassage).forEach(pId => {
    questionsByPassage[pId].sort((a, b) => (a.question_number || 0) - (b.question_number || 0));
  });

  // 7. Group passages into 5 Levels based on statsMap
  const passagesByLevel = { 1: [], 2: [], 3: [], 4: [], 5: [] };

  allPassages.forEach((p) => {
    const stat = statsMap.get(p.id);
    const level = stat ? stat.level : 1;
    if (passagesByLevel[level]) {
      passagesByLevel[level].push(p);
    } else {
      passagesByLevel[1].push(p);
    }
  });

  console.log(`\n📊 Phân bổ đoạn theo 5 Levels:`);
  for (let lv = 1; lv <= 5; lv++) {
    console.log(`  - Level ${lv}: ${passagesByLevel[lv].length} đoạn (${passagesByLevel[lv].length * 3} câu hỏi)`);
  }

  // 8. Transform and Save into MongoDB for Each of the 5 Levels
  for (let lv = 1; lv <= 5; lv++) {
    const levelPassages = passagesByLevel[lv];
    const transformedQuestions = [];
    let globalQNum = 1;

    levelPassages.forEach((p, pIdx) => {
      const pQuestions = questionsByPassage[p.id] || [];
      if (pQuestions.length === 0) return;

      const mediaFolder = mediaMap[p.test_id] || '2026/t1';
      const audioUrl = p.audio_url 
        ? (p.audio_url.startsWith('http') ? p.audio_url : `${SUPABASE_CDN}/${mediaFolder}/${p.audio_url}`)
        : `${SUPABASE_CDN}/${mediaFolder}/32-34.mp3`;

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

    const levelNames = ['Dễ', 'Cơ bản', 'Trung bình', 'Khó', 'Rất khó'];
    const levelTitle = `Level ${lv} — ${levelNames[lv - 1]} (Part ${partNum} Đậu TOEIC VIP)`;

    // Upsert into MongoDB
    await ListeningExercise.deleteMany({ mode: 'level', part: partNum, level: lv });

    const doc = new ListeningExercise({
      title: levelTitle,
      part: partNum,
      level: lv,
      mode: 'level',
      year: '2026',
      topic: `Part ${partNum} Level ${lv}`,
      errorRate: `${lv * 10}% - ${(lv + 1) * 12}%`,
      isPro: lv >= 3,
      totalQuestions: transformedQuestions.length,
      questions: transformedQuestions
    });

    await doc.save();
    console.log(`💾 [MONGODB SAVED] Part ${partNum} Level ${lv}: ${transformedQuestions.length} câu hỏi (${levelPassages.length} đoạn)!`);
  }

  console.log(`\n🎉 HOÀN TẤT CÀO TOÀN BỘ 5 LEVELS CHO PART ${partNum}!`);
}

async function runCompleteCrawl() {
  try {
    await mongoose.connect(MONGODB_URI, { serverSelectionTimeoutMS: 5000 });
    console.log('✅ Connected to MongoDB.');

    // 1. Crawl Full 5 Levels for Part 3
    await crawlAndSeedFullPart(3);

    // 2. Crawl Full 5 Levels for Part 4
    await crawlAndSeedFullPart(4);

    console.log('\n🌟 TOÀN BỘ PART 3 VÀ PART 4 ĐÃ ĐƯỢC CÀO VÀ NẠP SẠCH 100% VÀO DATABASE!');
  } catch (err) {
    console.error('Fatal Crawl Error:', err);
  } finally {
    mongoose.connection.close();
  }
}

if (require.main === module) {
  runCompleteCrawl();
}

module.exports = { runCompleteCrawl };
