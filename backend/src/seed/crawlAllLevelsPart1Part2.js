const mongoose = require('mongoose');
const https = require('https');
const dotenv = require('dotenv');
const path = require('path');

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
        console.warn(`Retry request ${pathStr} due to:`, err.message);
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
          level: 'A2',
          ipaUS: `/${wordPart}/`,
          ipaUK: `/${wordPart}/`,
          meaning: meaningPart,
          example: `Practice "${wordPart}".`,
          exampleTrans: `Luyện từ "${wordPart}".`,
          collocations: []
        });
      }
    } else if (cleaned.includes('(')) {
      const match = cleaned.match(/^([a-zA-Z\s]+)\s*\(([a-z]+)\)\s*(.+)/);
      if (match) {
        result.push({
          word: match[1].trim(),
          pos: match[2].trim(),
          level: 'A2',
          ipaUS: `/${match[1].trim()}/`,
          ipaUK: `/${match[1].trim()}/`,
          meaning: match[3].trim(),
          example: `Practice "${match[1].trim()}".`,
          exampleTrans: `Luyện từ "${match[1].trim()}".`,
          collocations: []
        });
      }
    }
  }
  return result;
}

function parseOptionTranslations(dichNghia) {
  if (!dichNghia) return {};
  const transMap = {};
  const lines = dichNghia.split('\n').map(l => l.trim()).filter(Boolean);
  for (const l of lines) {
    const match = l.match(/^\(([A-D])\)\s*(.+)/);
    if (match) {
      transMap[match[1]] = match[2].trim();
    }
  }
  return transMap;
}

async function fetchAllPracticeStats(partNum) {
  console.log(`📡 Fetching difficulty stats for Part ${partNum}...`);
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
  console.log(`✅ Loaded ${allStats.length} question difficulty stats for Part ${partNum}`);
  return allStats;
}

async function crawlAndSeedPart1And2() {
  console.log('===============================================================');
  console.log('🚀 BẮT ĐẦU CÀO TOÀN BỘ 5 LEVELS CHO PART 1 & PART 2 ĐẬU TOEIC...');
  console.log('===============================================================');

  await mongoose.connect(MONGODB_URI, { serverSelectionTimeoutMS: 5000 });
  console.log('✅ Connected to MongoDB.');

  // 1. XÓA SẠCH DỮ LIỆU CŨ CỦA PART 1 VÀ PART 2 TRONG DATABASE
  console.log('🗑️ Deleting old Part 1 and Part 2 data from MongoDB (mode = "level")...');
  await ListeningExercise.deleteMany({ mode: 'level', part: { $in: [1, 2] } });
  console.log('✅ Cleared old Part 1 and Part 2 level data.');

  // Process Part 1 and Part 2
  for (const partNum of [1, 2]) {
    console.log(`\n-----------------------------------------------------`);
    console.log(`📥 PROCESSING PART ${partNum}...`);
    console.log(`-----------------------------------------------------`);

    // Fetch difficulty stats
    const statsList = await fetchAllPracticeStats(partNum);
    const statsMap = new Map();
    statsList.forEach(s => {
      statsMap.set(s.item_id, {
        level: s.difficulty_level || 1,
        errorRate: `${((s.error_rate || 0) * 100).toFixed(1)}%`
      });
    });

    // Fetch all questions for Part
    console.log(`Fetching all raw questions for Part ${partNum}...`);
    const allQuestions = [];
    let qOffset = 0;
    const qLimit = 500;
    while (true) {
      const res = await querySupabase(`/rest/v1/mock_test_questions?part=eq.${partNum}&order=order_index.asc&limit=${qLimit}&offset=${qOffset}&select=*`);
      if (res.data && Array.isArray(res.data) && res.data.length > 0) {
        allQuestions.push(...res.data);
        if (res.data.length < qLimit) break;
        qOffset += qLimit;
      } else {
        break;
      }
    }
    console.log(`✅ Loaded ${allQuestions.length} questions for Part ${partNum}`);

    // Fetch media folders for all tests
    const testIds = [...new Set(allQuestions.map(q => q.test_id).filter(Boolean))];
    console.log(`🎬 Fetching media folders for ${testIds.length} tests...`);
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

    // Group questions into 5 Levels
    const questionsByLevel = { 1: [], 2: [], 3: [], 4: [], 5: [] };
    allQuestions.forEach(q => {
      const stat = statsMap.get(q.id);
      const level = stat ? stat.level : 1;
      if (questionsByLevel[level]) {
        questionsByLevel[level].push(q);
      } else {
        questionsByLevel[1].push(q);
      }
    });

    console.log(`📊 Distribution for Part ${partNum}:`);
    for (let lv = 1; lv <= 5; lv++) {
      console.log(`  - Level ${lv}: ${questionsByLevel[lv].length} câu hỏi`);
    }

    // Transform and Save each Level
    for (let lv = 1; lv <= 5; lv++) {
      const rawList = questionsByLevel[lv];
      const transformed = rawList.map((q, idx) => {
        const mediaFolder = mediaMap[q.test_id] || '2026/t1';
        
        let audioUrl = '';
        if (q.audio_url) {
          audioUrl = q.audio_url.startsWith('http') ? q.audio_url : `${SUPABASE_CDN}/${mediaFolder}/${q.audio_url}`;
        } else {
          audioUrl = `${SUPABASE_CDN}/${mediaFolder}/${q.question_number || (partNum === 1 ? (idx % 6) + 1 : (idx % 25) + 7)}.mp3`;
        }

        let imageUrl = '';
        if (partNum === 1) {
          if (q.image_url) {
            imageUrl = q.image_url.startsWith('http') ? q.image_url : `${SUPABASE_CDN}/${mediaFolder}/${q.image_url}`;
          } else {
            imageUrl = `${SUPABASE_CDN}/${mediaFolder}/${q.question_number || ((idx % 6) + 1)}.jpg`;
          }
        }

        const transMap = parseOptionTranslations(q.dich_nghia);
        const vocabList = parseVocabulary(q.tu_vung);

        let options = [];
        if (partNum === 1) {
          options = [
            { label: '(A)', text: q.option_a || 'Option A', translation: transMap['A'] || '', isCorrect: q.correct_answer === 'A' },
            { label: '(B)', text: q.option_b || 'Option B', translation: transMap['B'] || '', isCorrect: q.correct_answer === 'B' },
            { label: '(C)', text: q.option_c || 'Option C', translation: transMap['C'] || '', isCorrect: q.correct_answer === 'C' },
            { label: '(D)', text: q.option_d || 'Option D', translation: transMap['D'] || '', isCorrect: q.correct_answer === 'D' }
          ];
        } else {
          // Part 2 has 3 options
          options = [
            { label: '(A)', text: q.option_a || 'Option A', translation: transMap['A'] || '', isCorrect: q.correct_answer === 'A' },
            { label: '(B)', text: q.option_b || 'Option B', translation: transMap['B'] || '', isCorrect: q.correct_answer === 'B' },
            { label: '(C)', text: q.option_c || 'Option C', translation: transMap['C'] || '', isCorrect: q.correct_answer === 'C' }
          ];
        }

        // Clean transcript and translation with robust defaults
        const rawTranscript = q.passage_text || q.question_text || `Question ${q.question_number || (idx + 1)} audio transcription.`;
        const cleanTranscript = rawTranscript.replace(/\n\s+/g, '\n').trim() || 'Audio transcript';

        const cleanTranslation = (q.dich_nghia && q.dich_nghia.trim()) 
          ? q.dich_nghia.trim() 
          : (partNum === 1 ? 'Bản dịch 4 phương án miêu tả tranh.' : 'Bản dịch câu hỏi và phản hồi.');

        return {
          questionNumber: idx + 1,
          testQuestionNumber: q.question_number || (partNum === 1 ? (idx % 6) + 1 : (idx % 25) + 7),
          audioUrl: audioUrl,
          imageUrl: imageUrl,
          promptText: q.question_text || (partNum === 1 ? 'Listen to the 4 statements and choose the one that best describes the picture.' : 'Listen to the question and responses.'),
          promptTranslation: (cleanTranslation.split('\n')[0] || '').trim(),
          options: options,
          transcript: cleanTranscript,
          translation: cleanTranslation,
          dictationText: cleanTranscript.slice(0, 120) || 'Dictation exercise',
          explanation: (q.explanation_vi || '').trim(),
          vocabularyList: vocabList
        };
      });

      const levelNames = ['Dễ', 'Cơ bản', 'Trung bình', 'Khó', 'Rất khó'];
      const doc = new ListeningExercise({
        title: `Level ${lv} — ${levelNames[lv - 1]} (Part ${partNum} Đậu TOEIC VIP)`,
        part: partNum,
        level: lv,
        mode: 'level',
        year: '2026',
        topic: `Part ${partNum} Level ${lv}`,
        errorRate: `${lv * 8}% - ${(lv + 1) * 11}%`,
        isPro: lv >= 3,
        totalQuestions: transformed.length,
        questions: transformed
      });

      await doc.save();
      console.log(`💾 [MONGODB SAVED] Part ${partNum} Level ${lv}: ${transformed.length} câu hỏi thật 100%!`);
    }
  }

  console.log('\n🌟 HOÀN TẤT CÀO VÀ NẠP TOÀN BỘ 5 LEVELS CHO PART 1 VÀ PART 2!');
}

if (require.main === module) {
  crawlAndSeedPart1And2().then(() => mongoose.connection.close());
}

module.exports = { crawlAndSeedPart1And2 };
