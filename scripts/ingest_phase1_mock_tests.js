/**
 * 🎧 INGESTION ENGINE — GIAI ĐOẠN 1: CHUẨN HÓA 100% PHÂN HỆ ĐỀ THI ETS FULL 200 CÂU
 * Đồng bộ hóa toàn bộ 50 Đề Thi ETS Thật (10.000 câu hỏi) từ Đậu English vào MongoDB.
 */

const path = require('path');
const fs = require('fs');
const mongoose = require(path.resolve(__dirname, '../backend/node_modules/mongoose'));
const MockTest = require(path.resolve(__dirname, '../backend/src/models/MockTest'));

const tokenPath = path.resolve(__dirname, '../scratch/dau_auth_token.json');
if (!fs.existsSync(tokenPath)) {
  console.error('❌ Token file not found at:', tokenPath);
  process.exit(1);
}
const tokenData = JSON.parse(fs.readFileSync(tokenPath, 'utf8'));
const SUPABASE_URL = 'https://odlnhfaygiotcyehuysw.supabase.co';
const ANON_KEY = 'sb_publishable_4Gim-4AGEqRCeNXSVp8Xzw_P3_Lz8CB';

async function callRpc(funcName, params = {}) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/rpc/${funcName}`, {
    method: 'POST',
    headers: {
      'apikey': ANON_KEY,
      'Authorization': `Bearer ${tokenData.access_token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(params)
  });
  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`RPC ${funcName} failed (${res.status}): ${errText}`);
  }
  return await res.json();
}

function parseTranslations(dichNghia) {
  let transA = '', transB = '', transC = '', transD = '';
  if (!dichNghia) return { transA, transB, transC, transD };
  const mA = dichNghia.match(/\(A\)\s*([^\n\r]+)/i);
  const mB = dichNghia.match(/\(B\)\s*([^\n\r]+)/i);
  const mC = dichNghia.match(/\(C\)\s*([^\n\r]+)/i);
  const mD = dichNghia.match(/\(D\)\s*([^\n\r]+)/i);
  if (mA) transA = mA[1].trim();
  if (mB) transB = mB[1].trim();
  if (mC) transC = mC[1].trim();
  if (mD) transD = mD[1].trim();
  return { transA, transB, transC, transD };
}

function parseVocab(tuVung) {
  if (!tuVung) return [];
  try {
    const parsed = typeof tuVung === 'string' ? JSON.parse(tuVung) : tuVung;
    const list = parsed.vocabulary || parsed || [];
    if (!Array.isArray(list)) return [];
    return list.map(v => ({
      word: v.word || v.lemma || '',
      pos: v.pos || '',
      level: v.cefr || 'B1',
      meaning: v.meaning || v.definition || '',
      phonetic: v.ipa_us || v.ipa_uk || '',
      ipaUS: v.ipa_us || '',
      ipaUK: v.ipa_uk || '',
      example: v.example_en || v.example || '',
      exampleTrans: v.example_vi || ''
    }));
  } catch (e) {
    return [];
  }
}

const SET_METADATA = {
  '6d5f1a56-13fc-4030-8750-ace75540f669': {
    category: 'Pass TOEIC',
    collectionName: 'Pass TOEIC',
    year: 2026,
    prefix: 'Pass TOEIC'
  },
  'c43507d7-bcb0-44c0-9338-79697a5f161a': {
    category: 'Max Vol 1',
    collectionName: 'Max Vol 1',
    year: 2026,
    prefix: 'Max Vol 1'
  },
  '73d6c9ae-3a38-4c0a-bee5-d8aa1fe6cde7': {
    category: 'Max Vol 2',
    collectionName: 'Max Vol 2',
    year: 2026,
    prefix: 'Max Vol 2'
  },
  '40b95c1f-68b2-4c1b-a45a-1c13935dc0b8': {
    category: 'Crack TOEIC Vol 1',
    collectionName: 'Crack TOEIC Vol 1',
    year: 2024,
    prefix: 'Crack TOEIC Vol 1'
  },
  'ee48fed8-f948-4042-ac9d-be2681e36050': {
    category: 'Crack TOEIC Vol 2',
    collectionName: 'Crack TOEIC Vol 2',
    year: 2024,
    prefix: 'Crack TOEIC Vol 2'
  }
};

async function main() {
  console.log('================================================================');
  console.log('🚀 KHỞI ĐỘNG TIẾN TRÌNH CÀO & CHUẨN HÓA 50 ĐỀ THI ETS THẬT');
  console.log('================================================================\n');

  await mongoose.connect('mongodb://127.0.0.1:27017/tuong_tan_toeic');
  console.log('✅ Đã kết nối MongoDB local: tuong_tan_toeic\n');

  console.log('🔍 Đang lấy danh mục Sets & Tests từ Đậu English Supabase RPC...');
  const sets = await callRpc('list_public_mock_test_sets');
  const allTests = await callRpc('list_public_mock_tests');
  console.log(`📦 Tìm thấy ${sets.length} Sets và ${allTests.length} Tests.\n`);

  let totalProcessed = 0;
  let totalQuestionsIngested = 0;

  for (const s of sets) {
    const meta = SET_METADATA[s.id] || {
      category: s.name,
      collectionName: s.name,
      year: s.year || 2026,
      prefix: s.name
    };

    const testsInSet = allTests.filter(t => t.set_id === s.id);
    testsInSet.sort((a, b) => (a.order_index ?? 0) - (b.order_index ?? 0));

    console.log(`\n================================================================`);
    console.log(`📂 BẮT ĐẦU XỬ LÝ BỘ ĐỀ: [${s.name}] (${testsInSet.length} đề thi)`);
    console.log(`================================================================`);

    for (let i = 0; i < testsInSet.length; i++) {
      const test = testsInSet[i];
      const testNum = (test.order_index ?? i) + 1;
      const testTitle = `${meta.prefix} — Test ${testNum} (Full 200 Câu)`;

      console.log(`\n⏳ [${s.name} ${i + 1}/${testsInSet.length}] Đang tải dữ liệu: ${testTitle} (ID: ${test.id})...`);

      // 1. Fetch Questions
      const questions = await callRpc('get_mock_rows', {
        p_table: 'q',
        p_columns: ['*'],
        p_test_id: test.id,
        p_order: 'question_number'
      });

      // 2. Fetch Passages
      const passages = await callRpc('get_mock_rows', {
        p_table: 'p',
        p_columns: ['*'],
        p_test_id: test.id
      });

      const passageMap = new Map();
      for (const p of passages) {
        passageMap.set(p.id, p);
      }

      // 3. Map into MockTest schema
      const mappedQuestions = questions.map(q => {
        const passage = q.passage_id ? passageMap.get(q.passage_id) : null;
        const { transA, transB, transC, transD } = parseTranslations(q.dich_nghia);
        const vocabList = parseVocab(q.tu_vung);

        const options = [
          { label: 'A', text: q.option_a || '', translation: transA, vietnamese: transA, isCorrect: q.correct_answer === 'A' },
          { label: 'B', text: q.option_b || '', translation: transB, vietnamese: transB, isCorrect: q.correct_answer === 'B' },
          { label: 'C', text: q.option_c || '', translation: transC, vietnamese: transC, isCorrect: q.correct_answer === 'C' }
        ];
        if (q.part !== 2) {
          options.push({ label: 'D', text: q.option_d || '', translation: transD, vietnamese: transD, isCorrect: q.correct_answer === 'D' });
        }

        return {
          questionNum: q.question_number,
          part: q.part,
          prompt: q.question_text || '',
          promptTranslation: '',
          audioUrl: q.audio_url || (passage ? passage.audio_url : '') || '',
          imageUrl: q.image_url || (passage ? passage.image_url : '') || '',
          passageText: passage ? passage.passage_text : '',
          transcript: passage ? passage.passage_text : '',
          dichNghia: q.dich_nghia || '',
          tuVung: typeof q.tu_vung === 'string' ? q.tu_vung : JSON.stringify(q.tu_vung || ''),
          vocabularyList: vocabList,
          options: options,
          correctAnswer: q.correct_answer || 'A',
          explanation: q.explanation_vi || q.explanation_en || ''
        };
      });

      // 4. Upsert into MongoDB
      // For Pass TOEIC (Set 1), we also check if an existing test matching `Test ${testNum}` exists to update it cleanly
      let queryFilter = { dauTestId: test.id };
      if (meta.category === 'Pass TOEIC') {
        const existingByTitle = await MockTest.findOne({
          $or: [
            { dauTestId: test.id },
            { title: new RegExp(`Test ${testNum}\\b`, 'i') }
          ]
        });
        if (existingByTitle) {
          queryFilter = { _id: existingByTitle._id };
        }
      }

      const updatePayload = {
        title: testTitle,
        category: meta.category,
        collectionName: meta.collectionName,
        year: meta.year,
        orderIndex: testNum,
        totalQuestions: mappedQuestions.length,
        durationMinutes: 120,
        status: 'Chưa luyện tập',
        isPro: false,
        difficulty_label: test.difficulty_label || 'medium',
        dauTestId: test.id,
        questions: mappedQuestions
      };

      const savedDoc = await MockTest.findOneAndUpdate(
        queryFilter,
        updatePayload,
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );

      console.log(`   ✅ Hoàn tất đề ${testNum}: Đã nạp ${mappedQuestions.length} câu, ${passages.length} bài đọc (MongoID: ${savedDoc._id})`);
      totalProcessed++;
      totalQuestionsIngested += mappedQuestions.length;

      // Small delay between tests to be gentle with network
      await new Promise(r => setTimeout(r, 200));
    }
  }

  console.log('\n================================================================');
  console.log('🎉 TỔNG KẾT HOÀN THÀNH GIAI ĐOẠN 1:');
  console.log(`   - Tổng số đề thi đã nạp/chuẩn hóa: ${totalProcessed}/50 Tests`);
  console.log(`   - Tổng số câu hỏi ETS thật: ${totalQuestionsIngested}/10.000 Questions`);
  console.log('================================================================\n');

  process.exit(0);
}

main().catch(err => {
  console.error('❌ Ingestion engine error:', err);
  process.exit(1);
});

