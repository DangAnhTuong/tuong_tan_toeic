const mongoose = require('mongoose');
const https = require('https');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../../.env') });

const ListeningExercise = require('../models/ListeningExercise');
const ReadingExercise = require('../models/ReadingExercise');

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

// ----------------------------------------------------
// CLASSIFIERS FROM ĐẬU TOEIC BUNDLE
// ----------------------------------------------------
const singleWords = ["man","woman","person","guy","lady","boy","girl","child","kid","worker","shopper","customer","employee","student","teacher","chef","cook","waiter","waitress","server","clerk","cashier","doctor","nurse","patient","technician","engineer","scientist","musician","performer","artist","painter","photographer","driver","rider","cyclist","pedestrian","passenger","traveler","traveller","tourist","visitor","guest","gardener","farmer","vendor","seller","buyer","shopkeeper","librarian","receptionist","secretary","manager","supervisor","presenter","speaker","athlete","player","runner","swimmer","hiker","diner","salesperson","mechanic","carpenter","researcher","instructor","trainer","attendant","officer","firefighter","baker","barista","cleaner","janitor","electrician","plumber","landscaper"];
const pluralWords = ["people","men","women","children","crowd","audience","staff","crew","team","pedestrians","diners","workers","customers","students","shoppers"];
const pronounPlural = ["they're","they are","they","they've","their"];
const pronounSingle = ["he's","he is","he has","he","she's","she is","she has","she","his","her"];

function classifyPart1(q) {
  let ansText = '';
  switch (String(q.correct_answer || '').toUpperCase()) {
    case 'A': ansText = q.option_a || ''; break;
    case 'B': ansText = q.option_b || ''; break;
    case 'C': ansText = q.option_c || ''; break;
    case 'D': ansText = q.option_d || ''; break;
  }
  const clean = ansText.toLowerCase().replace(/^\(?[a-d]\)?[.)]?\s+/, '').trim();
  
  for (const p of pronounPlural) {
    if (new RegExp(`\\b${p}\\b`, 'i').test(clean)) return 'Tranh nhiều người';
  }
  for (const p of pluralWords) {
    if (new RegExp(`\\b${p}\\b`, 'i').test(clean)) return 'Tranh nhiều người';
  }
  for (const s of pronounSingle) {
    if (new RegExp(`\\b${s}\\b`, 'i').test(clean)) return 'Tranh một người';
  }
  for (const s of singleWords) {
    if (new RegExp(`\\b${s}\\b`, 'i').test(clean)) return 'Tranh một người';
  }
  return 'Tranh cảnh vật';
}

function classifyPart2(q) {
  const text = (q.question_text || q.passage_text || '').toLowerCase().replace(/^[mw]\s*-\s*[a-z]{2}\s*[:：]?\s*/i, '').trim();
  
  if (/^(who|whose|whom)\b/i.test(text)) return 'Câu hỏi Who';
  if (/^(when|what time)\b/i.test(text)) return 'Câu hỏi When';
  if (/^where\b/i.test(text)) return 'Câu hỏi Where';
  if (/^(why|how come)\b/i.test(text)) return 'Câu hỏi Why';
  if (/^what\b/i.test(text)) return 'Câu hỏi What';
  if (/^how\b/i.test(text)) return 'Câu hỏi How';
  if (/\bor\b/i.test(text) && !/or not/i.test(text)) return 'Câu hỏi lựa chọn';
  if (/,\s*(right|isn't it|don't you|didn't you|can you|can't you|will you|won't you|is it|did he|does she)\s*\?/i.test(text)) return 'Câu hỏi đuôi';
  if (/^(don't|doesn't|didn't|isn't|aren't|wasn't|weren't|haven't|hasn't|won't|can't|couldn't|shouldn't)\b/i.test(text)) return 'Câu hỏi phủ định';
  if (/^(do|does|did|is|are|am|was|were|have|has|had)\b/i.test(text)) return 'Câu hỏi Be/Do/Have';
  if (/^(can|could|will|would|should|shall|may|might|must)\b/i.test(text)) return 'Câu hỏi Modal verb';
  return 'Câu khẳng định';
}

function classifyPart5(q) {
  const type = q.question_type || '';
  if (type.includes('danh từ')) return 'Từ vựng - Danh từ';
  if (type.includes('động từ')) return 'Từ vựng - Động từ';
  if (type.includes('tính từ')) return 'Từ vựng - Tính từ';
  if (type.includes('trạng từ')) return 'Từ vựng - Trạng từ';
  if (type.includes('Đại từ')) return 'Đại từ';
  if (type.includes('Giới từ')) return 'Giới từ';
  if (type.includes('Liên từ')) return 'Liên từ';
  if (type.includes('Thì') || type.includes('thể')) return 'Thì & Thể động từ';
  if (type.includes('quan hệ')) return 'Mệnh đề quan hệ';
  return 'Ngữ pháp tổng hợp';
}

function parseVocabulary(tuVungStr) {
  if (!tuVungStr) return [];
  if (typeof tuVungStr === 'string' && tuVungStr.startsWith('{')) {
    try {
      const parsed = JSON.parse(tuVungStr);
      if (parsed.vocabulary && Array.isArray(parsed.vocabulary)) {
        return parsed.vocabulary.map(v => ({
          word: v.word,
          pos: v.pos || 'n',
          level: v.cefr || 'B1',
          ipaUS: v.ipa_us ? `/${v.ipa_us}/` : '',
          ipaUK: v.ipa_uk ? `/${v.ipa_uk}/` : '',
          meaning: v.meaning_vi || '',
          example: v.example_en || '',
          exampleTrans: v.example_vi || '',
          collocations: (v.collocations || []).map(c => ({ phrase: c.en, meaning: c.vi }))
        }));
      }
    } catch {}
  }
  const lines = String(tuVungStr).split('\n').map(l => l.trim()).filter(Boolean);
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
    }
  }
  return result;
}

function parseOptionTranslations(dichNghia) {
  if (!dichNghia) return {};
  const transMap = {};
  const lines = String(dichNghia).split('\n').map(l => l.trim()).filter(Boolean);
  for (const l of lines) {
    const match = l.match(/^\(([A-D])\)\s*(.+)/i);
    if (match) {
      transMap[match[1].toUpperCase()] = match[2].trim();
    }
  }
  return transMap;
}

// ----------------------------------------------------
// MAIN CRAWL RUNNER
// ----------------------------------------------------
async function crawlAllSubtypes() {
  await mongoose.connect(MONGODB_URI, { serverSelectionTimeoutMS: 5000 });
  console.log('✅ Connected to MongoDB.');

  // ====================================================
  // 1. CRAWL PART 1 SUBTYPES (Theo dạng tranh)
  // ====================================================
  console.log('\n======================================================');
  console.log('🚀 1. CRAWLING PART 1 THEO DẠNG TRANH (Tranh 1 người, nhiều người, cảnh vật)...');
  console.log('======================================================');
  
  const resP1 = await querySupabase('/rest/v1/mock_test_questions?part=eq.1&order=order_index.asc&limit=1000&select=*');
  const p1Questions = resP1.data || [];
  
  // Media folders
  const p1TestIds = [...new Set(p1Questions.map(q => q.test_id).filter(Boolean))];
  const p1MediaRes = await querySupabase('/rest/v1/rpc/get_mock_test_media_batch', 'POST', { p_test_ids: p1TestIds });
  const p1MediaMap = {};
  (p1MediaRes.data || []).forEach(m => { p1MediaMap[m.id] = m.media_folder; });

  const p1Groups = { 'Tranh một người': [], 'Tranh nhiều người': [], 'Tranh cảnh vật': [] };
  p1Questions.forEach(q => {
    const topic = classifyPart1(q);
    p1Groups[topic].push(q);
  });

  // Delete old Part 1 topic exercises
  await ListeningExercise.deleteMany({ mode: 'topic', part: 1 });

  for (const [topicName, rawList] of Object.entries(p1Groups)) {
    const transformed = rawList.map((q, idx) => {
      const mediaFolder = p1MediaMap[q.test_id] || '2026/t1';
      const audioUrl = q.audio_url 
        ? (q.audio_url.startsWith('http') ? q.audio_url : `${SUPABASE_CDN}/${mediaFolder}/${q.audio_url}`)
        : `${SUPABASE_CDN}/${mediaFolder}/${q.question_number || (idx + 1)}.mp3`;
      
      const imageUrl = q.image_url 
        ? (q.image_url.startsWith('http') ? q.image_url : `${SUPABASE_CDN}/${mediaFolder}/${q.image_url}`)
        : `${SUPABASE_CDN}/${mediaFolder}/${q.question_number || (idx + 1)}.jpg`;

      const transMap = parseOptionTranslations(q.dich_nghia);
      const vocabList = parseVocabulary(q.tu_vung);

      const options = [
        { label: '(A)', text: q.option_a || 'Option A', translation: transMap['A'] || '', isCorrect: q.correct_answer === 'A' },
        { label: '(B)', text: q.option_b || 'Option B', translation: transMap['B'] || '', isCorrect: q.correct_answer === 'B' },
        { label: '(C)', text: q.option_c || 'Option C', translation: transMap['C'] || '', isCorrect: q.correct_answer === 'C' },
        { label: '(D)', text: q.option_d || 'Option D', translation: transMap['D'] || '', isCorrect: q.correct_answer === 'D' }
      ];

      const cleanTranscript = (q.passage_text || q.question_text || 'Audio statement').replace(/\n\s+/g, '\n').trim();
      const cleanTranslation = (q.dich_nghia || 'Bản dịch 4 phương án miêu tả tranh.').trim();

      return {
        questionNumber: idx + 1,
        testQuestionNumber: q.question_number || (idx + 1),
        audioUrl: audioUrl,
        imageUrl: imageUrl,
        promptText: 'Listen to the 4 statements and choose the one that best describes the picture.',
        promptTranslation: (cleanTranslation.split('\n')[0] || '').trim(),
        options: options,
        transcript: cleanTranscript,
        translation: cleanTranslation,
        dictationText: cleanTranscript.slice(0, 120),
        explanation: (q.explanation_vi || '').trim(),
        vocabularyList: vocabList
      };
    });

    const exerciseDoc = new ListeningExercise({
      title: topicName,
      part: 1,
      mode: 'topic',
      topic: topicName,
      year: '2026',
      totalQuestions: transformed.length,
      questions: transformed
    });
    await exerciseDoc.save();
    console.log(`💾 [SAVED PART 1] ${topicName}: ${transformed.length} câu hỏi thật!`);
  }

  // ====================================================
  // 2. CRAWL PART 2 SUBTYPES (12 Dạng câu hỏi)
  // ====================================================
  console.log('\n======================================================');
  console.log('🚀 2. CRAWLING PART 2 THEO DẠNG CÂU HỎI (12 Dạng: Who, When, Where, Why, What, How, v.v.)...');
  console.log('======================================================');

  let allP2Questions = [];
  let p2Offset = 0;
  while (true) {
    const resP2 = await querySupabase(`/rest/v1/mock_test_questions?part=eq.2&order=order_index.asc&limit=500&offset=${p2Offset}&select=*`);
    if (resP2.data && Array.isArray(resP2.data) && resP2.data.length > 0) {
      allP2Questions.push(...resP2.data);
      if (resP2.data.length < 500) break;
      p2Offset += 500;
    } else {
      break;
    }
  }
  console.log(`Loaded total ${allP2Questions.length} Part 2 questions.`);

  const p2TestIds = [...new Set(allP2Questions.map(q => q.test_id).filter(Boolean))];
  const p2MediaMap = {};
  for (let i = 0; i < p2TestIds.length; i += 100) {
    const chunk = p2TestIds.slice(i, i + 100);
    const mRes = await querySupabase('/rest/v1/rpc/get_mock_test_media_batch', 'POST', { p_test_ids: chunk });
    (mRes.data || []).forEach(m => { p2MediaMap[m.id] = m.media_folder; });
  }

  const p2Groups = {};
  allP2Questions.forEach(q => {
    const topic = classifyPart2(q);
    if (!p2Groups[topic]) p2Groups[topic] = [];
    p2Groups[topic].push(q);
  });

  await ListeningExercise.deleteMany({ mode: 'topic', part: 2 });

  for (const [topicName, rawList] of Object.entries(p2Groups)) {
    const transformed = rawList.map((q, idx) => {
      const mediaFolder = p2MediaMap[q.test_id] || '2026/t1';
      const audioUrl = q.audio_url 
        ? (q.audio_url.startsWith('http') ? q.audio_url : `${SUPABASE_CDN}/${mediaFolder}/${q.audio_url}`)
        : `${SUPABASE_CDN}/${mediaFolder}/${q.question_number || (idx + 7)}.mp3`;

      const transMap = parseOptionTranslations(q.dich_nghia);
      const vocabList = parseVocabulary(q.tu_vung);

      const options = [
        { label: '(A)', text: q.option_a || 'Option A', translation: transMap['A'] || '', isCorrect: q.correct_answer === 'A' },
        { label: '(B)', text: q.option_b || 'Option B', translation: transMap['B'] || '', isCorrect: q.correct_answer === 'B' },
        { label: '(C)', text: q.option_c || 'Option C', translation: transMap['C'] || '', isCorrect: q.correct_answer === 'C' }
      ];

      const cleanTranscript = (q.passage_text || q.question_text || 'Question audio transcript').replace(/\n\s+/g, '\n').trim();
      const cleanTranslation = (q.dich_nghia || 'Bản dịch câu hỏi và 3 phương án.').trim();

      return {
        questionNumber: idx + 1,
        testQuestionNumber: q.question_number || (idx + 7),
        audioUrl: audioUrl,
        promptText: q.question_text || 'Listen to the question and responses.',
        promptTranslation: (cleanTranslation.split('\n')[0] || '').trim(),
        options: options,
        transcript: cleanTranscript,
        translation: cleanTranslation,
        dictationText: cleanTranscript.slice(0, 120),
        explanation: (q.explanation_vi || '').trim(),
        vocabularyList: vocabList
      };
    });

    const exerciseDoc = new ListeningExercise({
      title: topicName,
      part: 2,
      mode: 'topic',
      topic: topicName,
      year: '2026',
      totalQuestions: transformed.length,
      questions: transformed
    });
    await exerciseDoc.save();
    console.log(`💾 [SAVED PART 2] ${topicName}: ${transformed.length} câu hỏi thật!`);
  }

  // ====================================================
  // 3. CRAWL PART 5 SUBTYPES (Dạng bài ngữ pháp & từ loại)
  // ====================================================
  console.log('\n======================================================');
  console.log('🚀 3. CRAWLING PART 5 THEO DẠNG BÀI NGỮ PHÁP & TỪ LOẠI...');
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
  console.log(`Loaded total ${allP5Questions.length} Part 5 questions.`);

  const p5Groups = {};
  allP5Questions.forEach(q => {
    const topic = classifyPart5(q);
    if (!p5Groups[topic]) p5Groups[topic] = [];
    p5Groups[topic].push(q);
  });

  await ReadingExercise.deleteMany({ mode: 'part5' });

  for (const [topicName, rawList] of Object.entries(p5Groups)) {
    const transformed = rawList.map((q, idx) => {
      const transMap = parseOptionTranslations(q.dich_nghia_dap_an);
      return {
        questionNum: idx + 1,
        prompt: q.question_text || 'Select the best response.',
        passageText: q.passage_text || '',
        options: [
          { label: '(A)', text: q.option_a || 'A' },
          { label: '(B)', text: q.option_b || 'B' },
          { label: '(C)', text: q.option_c || 'C' },
          { label: '(D)', text: q.option_d || 'D' }
        ],
        correctAnswer: q.correct_answer || 'A',
        explanation: (q.explanation_vi || q.dich_nghia || '').trim()
      };
    });

    const rDoc = new ReadingExercise({
      title: topicName,
      mode: 'part5',
      part: 'Part 5',
      topic: topicName,
      level: 1,
      levelName: 'Dạng bài: ' + topicName,
      totalQuestions: transformed.length,
      questions: transformed
    });
    await rDoc.save();
    console.log(`💾 [SAVED PART 5] ${topicName}: ${transformed.length} câu hỏi thật!`);
  }

  console.log('\n🌟 HOÀN TẤT CÀO TOÀN BỘ TAB "THEO DẠNG BÀI" CHO PART 1 ĐẾN PART 5!');
}

if (require.main === module) {
  crawlAllSubtypes().then(() => mongoose.connection.close());
}

module.exports = { crawlAllSubtypes };
