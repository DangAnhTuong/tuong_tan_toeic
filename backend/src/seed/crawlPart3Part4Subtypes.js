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
          level: 'B1',
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

function parseOptionTranslations(expEn) {
  if (!expEn) return {};
  const transMap = {};
  const lines = String(expEn).split('\n').map(l => l.trim()).filter(Boolean);
  for (const l of lines) {
    const match = l.match(/^([A-D])\.\s*(.+)/);
    if (match) {
      transMap[match[1]] = match[2].trim();
    }
  }
  return transMap;
}

function classifyPart3Topic(scriptText) {
  const text = scriptText.toLowerCase();
  if (/meeting|schedule|agenda|reschedule|appointment|conference|postpone/.test(text)) return 'Lịch hẹn, cuộc họp & tiến độ công việc';
  if (/order|shipment|delivery|warehouse|tracking|package|supplier|inventory/.test(text)) return 'Đơn hàng, kho bãi & giao nhận';
  if (/store|discount|receipt|refund|purchase|cashier|shopping|sale|exchange/.test(text)) return 'Mua sắm, cửa hàng & đổi trả';
  if (/restaurant|menu|dish|chef|reservation|catering|lunch|dinner|beverage/.test(text)) return 'Nhà hàng & ăn uống';
  if (/apartment|rent|lease|property|maintenance|plumbing|landlord|tenant/.test(text)) return 'Nhà ở & dịch vụ đời sống';
  if (/flight|airline|airport|hotel|luggage|boarding|reservation|ticket|tourism/.test(text)) return 'Sân bay, khách sạn & du lịch';
  if (/train|subway|bus|traffic|commute|parking|transit|station|vehicle/.test(text)) return 'Tàu xe & đi lại hằng ngày';
  if (/hiring|interview|candidate|resume|salary|benefit|applicant|recruit/.test(text)) return 'Tuyển dụng, lương & phúc lợi';
  if (/training|orientation|workshop|intern|seminar|new hire|instruction/.test(text)) return 'Đào tạo & nhân viên mới';
  if (/repair|broken|renovation|construction|inspect|damage|leak|fix/.test(text)) return 'Sự cố, bảo trì & xây dựng';
  if (/marketing|client|customer|campaign|survey|advertising|sales|feedback/.test(text)) return 'Marketing, bán hàng & khách hàng';
  if (/invoice|budget|accounting|expense|reimburse|financial|audit|payment/.test(text)) return 'Kế toán, hoá đơn & ngân sách';
  if (/software|website|system|database|network|password|server|computer|tech/.test(text)) return 'Công nghệ, IT & website';
  if (/banquet|event|annual|celebration|gala|award|ceremony|reception/.test(text)) return 'Sự kiện, hội thảo & tiệc';
  if (/hospital|clinic|doctor|patient|medical|prescription|pharmacy|health/.test(text)) return 'Y tế & dịch vụ công';
  return 'Chủ đề khác';
}

async function crawlAndSeedPart34Subtypes() {
  await mongoose.connect(MONGODB_URI, { serverSelectionTimeoutMS: 5000 });
  console.log('✅ Connected to MongoDB.');

  // Fetch special flags
  console.log('📡 Fetching special flags (has_graphic, three_speakers, has_intent)...');
  const flagsRes = await querySupabase('/rest/v1/rpc/get_part34_special_flags', 'POST', {});
  const flagsMap = new Map();
  (flagsRes.data || []).forEach(f => {
    flagsMap.set(f.id, f);
  });
  console.log(`✅ Loaded ${flagsMap.size} special flags.`);

  // Delete old Part 3 & 4 topic exercises
  console.log('🗑️ Clearing old Part 3 & 4 topic exercises in MongoDB (mode = "topic")...');
  await ListeningExercise.deleteMany({ mode: 'topic', part: { $in: [3, 4] } });

  for (const partNum of [3, 4]) {
    console.log(`\n======================================================`);
    console.log(`🚀 PROCESSING PART ${partNum} THEO DẠNG BÀI & CHỦ ĐỀ...`);
    console.log(`======================================================`);

    // 1. Fetch passages
    const allPassages = [];
    let pOffset = 0;
    while (true) {
      const res = await querySupabase(`/rest/v1/mock_test_passages?part=eq.${partNum}&order=order_index.asc&limit=500&offset=${pOffset}&select=*`);
      if (res.data && Array.isArray(res.data) && res.data.length > 0) {
        allPassages.push(...res.data);
        if (res.data.length < 500) break;
        pOffset += 500;
      } else {
        break;
      }
    }
    console.log(`Loaded ${allPassages.length} passages for Part ${partNum}`);

    // 2. Fetch media map
    const testIds = [...new Set(allPassages.map(p => p.test_id).filter(Boolean))];
    const mediaMap = {};
    for (let i = 0; i < testIds.length; i += 100) {
      const chunk = testIds.slice(i, i + 100);
      const mRes = await querySupabase('/rest/v1/rpc/get_mock_test_media_batch', 'POST', { p_test_ids: chunk });
      (mRes.data || []).forEach(m => { mediaMap[m.id] = m.media_folder; });
    }

    // 3. Fetch questions
    const pIds = allPassages.map(p => p.id);
    const qIds = [];
    for (let i = 0; i < pIds.length; i += 100) {
      const chunk = pIds.slice(i, i + 100);
      const skel = await querySupabase('/rest/v1/rpc/get_mock_question_skeleton_by_passages_fast', 'POST', { p_passage_ids: chunk });
      (skel.data || []).forEach(q => qIds.push(q.id));
    }

    const allQuestions = [];
    for (let i = 0; i < qIds.length; i += 100) {
      const chunk = qIds.slice(i, i + 100);
      const qRes = await querySupabase(`/rest/v1/mock_test_questions?id=in.(${chunk.join(',')})&select=*`);
      if (qRes.data && Array.isArray(qRes.data)) {
        allQuestions.push(...qRes.data);
      }
    }

    const questionsByPassage = {};
    allQuestions.forEach(q => {
      if (!questionsByPassage[q.passage_id]) questionsByPassage[q.passage_id] = [];
      questionsByPassage[q.passage_id].push(q);
    });
    Object.keys(questionsByPassage).forEach(pId => {
      questionsByPassage[pId].sort((a, b) => (a.question_number || 0) - (b.question_number || 0));
    });

    // 4. Group passages by Special Types and by Business Topics
    const groups = {};

    // Special categories
    const graphicPassages = [];
    const threeSpeakerPassages = [];
    const intentPassages = [];

    allPassages.forEach(p => {
      const flag = flagsMap.get(p.id);
      if (flag?.has_graphic) graphicPassages.push(p);
      if (flag?.three_speakers) threeSpeakerPassages.push(p);
      if (flag?.has_intent) intentPassages.push(p);

      // Topic grouping
      const rawText = `${p.transcript || ''} ${p.passage_text || ''}`;
      const topic = classifyPart3Topic(rawText);
      if (!groups[topic]) groups[topic] = [];
      groups[topic].push(p);
    });

    if (graphicPassages.length > 0) groups['Có hình / bảng biểu'] = graphicPassages;
    if (threeSpeakerPassages.length > 0) groups['Hội thoại 3 người nói'] = threeSpeakerPassages;
    if (intentPassages.length > 0) groups['Câu hỏi hàm ý người nói'] = intentPassages;

    // 5. Transform and Save each group
    for (const [topicName, passageList] of Object.entries(groups)) {
      const transformedQuestions = [];
      let globalQNum = 1;

      passageList.forEach((p, pIdx) => {
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
          const transMap = parseOptionTranslations(q.explanation_en);
          const vocabList = parseVocabulary(q.tu_vung);

          const options = [
            { label: '(A)', text: q.option_a || 'Option A', translation: transMap['A'] || '', isCorrect: q.correct_answer === 'A' },
            { label: '(B)', text: q.option_b || 'Option B', translation: transMap['B'] || '', isCorrect: q.correct_answer === 'B' },
            { label: '(C)', text: q.option_c || 'Option C', translation: transMap['C'] || '', isCorrect: q.correct_answer === 'C' },
            { label: '(D)', text: q.option_d || 'Option D', translation: transMap['D'] || '', isCorrect: q.correct_answer === 'D' }
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
            promptTranslation: (cleanTranslation.split('\n')[0] || '').trim(),
            options: options,
            transcript: cleanTranscript || 'Conversation audio',
            translation: cleanTranslation || 'Bản dịch tiếng Việt',
            dictationText: cleanTranscript.slice(0, 150),
            explanation: (q.explanation_vi || '').trim(),
            vocabularyList: vocabList
          });
        });
      });

      const doc = new ListeningExercise({
        title: topicName,
        part: partNum,
        mode: 'topic',
        topic: topicName,
        year: '2026',
        totalQuestions: transformedQuestions.length,
        questions: transformedQuestions
      });

      await doc.save();
      console.log(`💾 [SAVED PART ${partNum}] ${topicName}: ${transformedQuestions.length} câu (${passageList.length} đoạn)!`);
    }
  }

  console.log('\n🌟 HOÀN TẤT NẠP SẠCH TOÀN BỘ DẠNG BÀI & CHỦ ĐỀ CHO PART 3 VÀ PART 4!');
}

if (require.main === module) {
  crawlAndSeedPart34Subtypes().then(() => mongoose.connection.close());
}

module.exports = { crawlAndSeedPart34Subtypes };
