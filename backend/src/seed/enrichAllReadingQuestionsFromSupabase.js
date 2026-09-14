const mongoose = require('mongoose');
const https = require('https');
const ReadingExercise = require('../models/ReadingExercise');
const { LISTENING_MASTER_DICT } = require('./listeningVocabEnricher');

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

function parseVocabList(tuVungStr, questionText) {
  const result = [];
  if (tuVungStr && tuVungStr.trim()) {
    const items = tuVungStr.split(';').map(s => s.trim()).filter(Boolean);
    for (const item of items) {
      // pattern: word (pos): meaning
      const match = item.match(/^([a-zA-Z\s'-]+)(?:\s*\(([^)]+)\))?\s*:\s*(.+)$/);
      if (match) {
        const rawWord = match[1].trim();
        const rawPos = match[2]?.trim() || 'n';
        const rawMeaning = match[3]?.trim();
        const dictEntry = LISTENING_MASTER_DICT[rawWord.toLowerCase()] || {};

        result.push({
          word: rawWord,
          pos: rawPos,
          ipaUS: dictEntry.ipaUS || `/ˈ${rawWord.toLowerCase()}/`,
          ipaUK: dictEntry.ipaUK || `/ˈ${rawWord.toLowerCase()}/`,
          meaning: rawMeaning,
          level: dictEntry.level || 'B1',
          example: dictEntry.example || `The word "${rawWord}" is frequently tested in TOEIC reading.`,
          exampleTrans: dictEntry.exampleTrans || `Từ "${rawWord}" thường xuyên xuất hiện trong đề thi đọc TOEIC.`
        });
      }
    }
  }

  // Fallback if empty or fewer than 2 words: extract key words from questionText
  if (result.length < 2 && questionText) {
    const words = questionText.replace(/[^\w\s]/g, '').split(/\s+/).filter(w => w.length > 5);
    const uniqueWords = Array.from(new Set(words.map(w => w.toLowerCase())));
    for (const w of uniqueWords.slice(0, 3)) {
      if (!result.some(r => r.word.toLowerCase() === w)) {
        const dictEntry = LISTENING_MASTER_DICT[w] || {};
        result.push({
          word: w,
          pos: dictEntry.pos || 'n',
          ipaUS: dictEntry.ipaUS || `/ˈ${w}/`,
          ipaUK: dictEntry.ipaUK || `/ˈ${w}/`,
          meaning: dictEntry.meaning || `từ vựng cốt lõi TOEIC`,
          level: dictEntry.level || 'B1',
          example: dictEntry.example || `Please review the key term "${w}".`,
          exampleTrans: dictEntry.exampleTrans || `Vui lòng xem lại từ khóa "${w}".`
        });
      }
    }
  }

  return result;
}

function parseOptionTranslations(dichNghiaOpt, explanationEn) {
  const transMap = {};
  const str = dichNghiaOpt || explanationEn || '';
  const lines = String(str).split('\n').map(l => l.trim()).filter(Boolean);
  for (const l of lines) {
    const m = l.match(/^([A-D])[\.\)]\s*(.+)/i) || l.match(/^\(([A-D])\)\s*(.+)/i);
    if (m) {
      transMap[m[1].toUpperCase()] = m[2].trim();
    }
  }
  return transMap;
}

function cleanExplanationText(text) {
  if (!text) return '';
  return String(text)
    .replace(/\$\s*\\rightarrow\s*\$/g, '→')
    .replace(/\\rightarrow/g, '→')
    .replace(/\$\s*\\approx\s*\$/g, '≈')
    .replace(/\\approx/g, '≈')
    .replace(/\*\*(.*?)\*\*/g, '$1')
    .replace(/\*(.*?)\*/g, '$1')
    .trim();
}

async function runEnrichment() {
  await mongoose.connect(MONGODB_URI, { serverSelectionTimeoutMS: 5000 });
  console.log('✅ Connected to MongoDB.');

  // 1. Fetch all Reading Questions from Supabase (Part 5, 6, 7)
  console.log('🚀 Fetching all Supabase reading questions...');
  const supabaseQuestions = [];
  let offset = 0;
  while (true) {
    const res = await querySupabase(`/rest/v1/mock_test_questions?section=eq.reading&limit=1000&offset=${offset}&select=id,part,question_number,question_text,option_a,option_b,option_c,option_d,correct_answer,explanation_vi,explanation_en,dich_nghia,tu_vung,dich_nghia_dap_an`);
    if (res.data && Array.isArray(res.data) && res.data.length > 0) {
      supabaseQuestions.push(...res.data);
      if (res.data.length < 1000) break;
      offset += 1000;
    } else {
      break;
    }
  }
  console.log(`✅ Loaded ${supabaseQuestions.length} reading questions from Supabase.`);

  // Create fast lookup maps:
  // 1. By Question Text & Part
  const byTextMap = new Map();
  // 2. By Part & Question Number
  const byPartAndNum = new Map();

  supabaseQuestions.forEach(q => {
    if (q.question_text) {
      const key = `${q.part}_${q.question_text.trim().toLowerCase().slice(0, 50)}`;
      byTextMap.set(key, q);
    }
    const partNumKey = `${q.part}_${q.question_number}_${(q.option_a || '').trim().toLowerCase()}`;
    byPartAndNum.set(partNumKey, q);
  });

  // 2. Iterate through all ReadingExercise documents in MongoDB
  const docs = await ReadingExercise.find({});
  console.log(`\n📚 Processing ${docs.length} ReadingExercise documents in MongoDB...`);

  let totalUpdatedQuestions = 0;
  let totalDocsUpdated = 0;

  for (const doc of docs) {
    let docModified = false;
    const partNum = doc.part === 'Part 5' ? 5 : doc.part === 'Part 6' ? 6 : doc.part === 'Part 7' ? 7 : 5;

    for (let i = 0; i < doc.questions.length; i++) {
      const q = doc.questions[i];
      const qText = q.prompt || q.passageText || '';
      const textKey = `${partNum}_${qText.trim().toLowerCase().slice(0, 50)}`;
      const optA = q.options && q.options[0] ? q.options[0].text : '';
      const numKey = `${partNum}_${q.questionNum || (i + 1)}_${optA.trim().toLowerCase()}`;

      const matchedSupabase = byTextMap.get(textKey) || byPartAndNum.get(numKey);

      let tuVungSource = matchedSupabase?.tu_vung || q.tuVung;
      let optTransMap = parseOptionTranslations(matchedSupabase?.dich_nghia_dap_an, matchedSupabase?.explanation_en);
      let vietnameseTrans = matchedSupabase?.dich_nghia || q.translation;
      let explanationVi = matchedSupabase?.explanation_vi || q.explanation;

      // 1. Enrich Vocabulary List
      const parsedVocab = parseVocabList(tuVungSource, qText);
      if (parsedVocab.length > 0) {
        q.vocabularyList = parsedVocab;
        q.tuVung = tuVungSource || parsedVocab.map(v => `${v.word} (${v.pos}): ${v.meaning}`).join('; ');
        docModified = true;
      }

      // 2. Enrich Options with Vietnamese Translations
      if (q.options && Array.isArray(q.options)) {
        q.options.forEach((opt, optIdx) => {
          const letter = String.fromCharCode(65 + optIdx); // A, B, C, D
          if (optTransMap[letter]) {
            opt.translation = optTransMap[letter];
            docModified = true;
          } else if (!opt.translation || opt.translation.length < 2) {
            opt.translation = opt.text || `Lựa chọn (${letter})`;
            docModified = true;
          }
        });
      }

      // 3. Enrich Translation
      if (vietnameseTrans && (!q.translation || q.translation.length < 5)) {
        q.translation = vietnameseTrans.trim();
        docModified = true;
      }

      // 4. Enrich & Clean Explanation
      if (explanationVi) {
        q.explanation = cleanExplanationText(explanationVi);
        docModified = true;
      }

      totalUpdatedQuestions++;
    }

    if (docModified) {
      doc.markModified('questions');
      await doc.save();
      totalDocsUpdated++;
    }
  }

  console.log(`\n🎉 ENRICHMENT COMPLETE!`);
  console.log(`✅ Updated ${totalDocsUpdated} / ${docs.length} documents.`);
  console.log(`✅ Processed & Enriched ${totalUpdatedQuestions} reading questions.`);
  process.exit(0);
}

runEnrichment().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
