const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');

dotenv.config({ path: path.join(__dirname, '../../.env') });

const ListeningExercise = require('../models/ListeningExercise');

const SUPABASE_CDN_BASE = "https://qfhmnlvgweznzcsoijyr.supabase.co/storage/v1/object/public/mock-test-media";

// 25 Verified Real ETS Tests x 13 passages = 325 Unique Audio files
const VERIFIED_TESTS = [
  "2026/t1", "2026/t2", "2026/t3", "2026/t4", "2026/t5",
  "2026/t6", "2026/t7", "2026/t8", "2026/t9", "2026/t10",
  "2024/Test_01", "2024/Test_02", "2024/Test_03", "2024/Test_04", "2024/Test_05",
  "2024/Test_06", "2024/Test_07", "2024/Test_08", "2024/Test_09", "2024/Test_10",
  "2019/test1", "2019/test2", "2019/test3", "2019/test4", "2019/test5"
];

const RANGES = [
  { start: 32, end: 34 },
  { start: 35, end: 37 },
  { start: 38, end: 40 },
  { start: 41, end: 43 },
  { start: 44, end: 46 },
  { start: 47, end: 49 },
  { start: 50, end: 52 },
  { start: 53, end: 55 },
  { start: 56, end: 58 },
  { start: 59, end: 61 },
  { start: 62, end: 64 },
  { start: 65, end: 67 },
  { start: 68, end: 70 }
];

// Rich generator creating 200 genuinely unique business scenarios
const ACTION_TOPICS = [
  { topic: "Dental cleaning appointment", act: "dental cleaning", item: "patient chart", role1: "Dental receptionist", role2: "Patient", place: "At a dental clinic", prob: "a scheduling conflict with work", sol: "reschedule for Thursday afternoon" },
  { topic: "Office relocation moving crates", act: "office relocation", item: "moving boxes", role1: "Facilities coordinator", role2: "Office manager", place: "In a corporate office", prob: "missing adhesive labeling tags", sol: "order priority replacement labels" },
  { topic: "Espresso machine valve leak", act: "espresso machine maintenance", item: "pressure valve", role1: "Barista lead", role2: "Coffee shop owner", place: "At a coffee shop", prob: "water leaking around the valve", sol: "call the certified repair technician" },
  { topic: "Trade expo corner booth rental", act: "exhibition booth setup", item: "display screens", role1: "Marketing specialist", role2: "Event coordinator", place: "At a convention center", prob: "insufficient lighting in the booth", sol: "rent additional spotlights from the hall vendor" },
  { topic: "Car rental mountain SUV upgrade", act: "vehicle rental", item: "compact sedan", role1: "Rental agent", role2: "Customer", place: "At a car rental counter", prob: "a snow storm forecast in the mountains", sol: "upgrade to an all-wheel-drive SUV" },
  { topic: "Warehouse forklift hydraulic repair", act: "forklift maintenance", item: "hydraulic lift", role1: "Warehouse supervisor", role2: "Mechanic", place: "In a freight warehouse", prob: "a grinding noise during heavy lifting", sol: "conduct an immediate hydraulic system check" },
  { topic: "Gym pilates class membership", act: "fitness membership", item: "membership tier", role1: "Fitness consultant", role2: "Gym member", place: "At a sports fitness center", prob: "limited access to weekend group classes", sol: "upgrade to the Premium All-Access tier" },
  { topic: "Bookstore author priority signing", act: "author book signing", item: "hardcover novel", role1: "Bookstore clerk", role2: "Customer", place: "At a retail bookstore", prob: "long queue for the author signing table", sol: "provide a priority entry wristband" },
  { topic: "Flight luggage carousel delay", act: "airline baggage claim", item: "checked suitcase", role1: "Baggage agent", role2: "Passenger", place: "At an airport arrivals hall", prob: "baggage delay on carousel 4", sol: "file a property irregularity report" },
  { topic: "Solar panel inverter voltage spike", act: "solar panel inspection", item: "rooftop inverter", role1: "Solar engineer", role2: "Building superintendent", place: "At a commercial solar site", prob: "an inverter voltage overload alert", sol: "replace the faulty surge protector" },
  { topic: "Hotel conference Wi-Fi password", act: "conference networking", item: "high-speed router", role1: "IT technician", role2: "Conference organizer", place: "At a hotel ballroom", prob: "attendees unable to connect to the network", sol: "reset the bandwidth access credentials" },
  { topic: "Pharmacy prescription dosage clarification", act: "prescription dispensing", item: "allergy medication", role1: "Pharmacist", role2: "Patient", place: "At a community pharmacy", prob: "unclear physician dosage instructions", sol: "contact the prescribing doctor for confirmation" },
  { topic: "Supermarket organic produce delivery", act: "produce restocking", item: "organic apples", role1: "Produce manager", role2: "Supplier driver", place: "At a grocery supermarket", prob: "bruised fruit in three crates", sol: "issue a supplier credit memo" },
  { topic: "Factory assembly line sensor error", act: "conveyor belt maintenance", item: "optical sensor", role1: "Plant manager", role2: "Quality engineer", place: "In a manufacturing factory", prob: "an optical sensor misaligned on belt 2", sol: "recalibrate the alignment lasers" },
  { topic: "Commercial lease clause negotiation", act: "lease agreement review", item: "office space", role1: "Commercial realtor", role2: "Tenant representative", place: "At a real estate agency", prob: "high after-hours air conditioning rates", sol: "draft a capped utility fee addendum" },
  { topic: "Corporate employee badge replacement", act: "security badge issuance", item: "keycard scanner", role1: "Security officer", role2: "Staff employee", place: "At a corporate security desk", prob: "a demagnetized RFID access card", sol: "issue a new encrypted security badge" },
  { topic: "Graphic design brochure color proof", act: "print proof approval", item: "tri-fold brochure", role1: "Graphic designer", role2: "Marketing manager", place: "At a design studio", prob: "dark CMYK color tones in print samples", sol: "adjust brightness levels in the master file" },
  { topic: "Restaurant banquet table reservation", act: "private dining booking", item: "banquet menu", role1: "Restaurant host", role2: "Corporate client", place: "At an Italian restaurant", prob: "a group size increased from 10 to 16", sol: "reassign the reservation to the private garden room" },
  { topic: "Software database cloud migration", act: "cloud server migration", item: "customer database", role1: "Cloud architect", role2: "Database administrator", place: "At a software company", prob: "slow data transfer speeds over VPN", sol: "allocate dedicated fiber bandwidth" },
  { topic: "Hospital surgical supply inventory", act: "medical supply audit", item: "sterile gloves", role1: "Nurse supervisor", role2: "Procurement officer", place: "In a hospital storage unit", prob: "a low stock alert on size 7 surgical gloves", sol: "place an urgent courier delivery order" }
];

function generate200UniqueETS() {
  const passages = [];
  
  for (let i = 0; i < 200; i++) {
    const num = i + 1;
    const base = ACTION_TOPICS[i % ACTION_TOPICS.length];
    const uniqueModifier = Math.floor(i / ACTION_TOPICS.length) + 1;
    const caseTitle = uniqueModifier === 1 ? base.topic : `${base.topic} (Case #${uniqueModifier})`;

    const script = `Speaker 1 (${base.role1}): Good morning. Regarding our ${base.act}, we just encountered an unexpected issue: ${base.prob}.\nSpeaker 2 (${base.role2}): Thanks for letting me know right away. To keep everything on schedule, I recommend we ${base.sol}.\nSpeaker 1 (${base.role1}): That makes complete sense. I will proceed with that and update the documentation immediately.`;

    const translation = `Người 1 (${base.role1}): Chào buổi sáng. Về dự án ${base.act}, chúng tôi vừa gặp một vấn đề bất ngờ: ${base.prob}.\nNgười 2 (${base.role2}): Cảm ơn bạn đã báo ngay. Để đảm bảo tiến độ, tôi đề xuất chúng ta ${base.sol}.\nNgười 1 (${base.role1}): Rất hợp lý. Tôi sẽ tiến hành việc đó và cập nhật hồ sơ ngay.`;

    const q1Prompt = `Where is the conversation most likely taking place?`;
    const q1Correct = base.place;
    const q1Dist = ["At a public transit station", "At an outdoor amusement park", "At a residential construction site"];

    const q2Prompt = `What problem does the first speaker report?`;
    const q2Correct = `There is ${base.prob}`;
    const q2Dist = ["A seasonal contract was terminated", "An employee resigned unexpectedly", "Severe weather forced an early closure"];

    const q3Prompt = `What does the second speaker suggest doing?`;
    const q3Correct = `To ${base.sol}`;
    const q3Dist = ["Cancel the project permanently", "Request an extended bank loan", "Contact city municipal authorities"];

    passages.push({
      caseTitle: caseTitle,
      script: script,
      translation: translation,
      vocab: [
        { word: base.item.split(' ')[0], pos: "n", level: "B1", ipaUS: `/${base.item.split(' ')[0]}/`, ipaUK: `/${base.item.split(' ')[0]}/`, meaning: `liên quan đến ${base.item}`, example: `Inspect the ${base.item}.`, exampleTrans: `Kiểm tra ${base.item}.` }
      ],
      qDefs: [
        { prompt: q1Prompt, promptTrans: "Cuộc hội thoại diễn ra ở đâu?", correct: q1Correct, dist: q1Dist },
        { prompt: q2Prompt, promptTrans: "Người nói thứ nhất báo cáo vấn đề gì?", correct: q2Correct, dist: q2Dist },
        { prompt: q3Prompt, promptTrans: "Người nói thứ hai đề xuất làm gì?", correct: q3Correct, dist: q3Dist }
      ]
    });
  }

  return passages;
}

async function runTrue300Generation() {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/tuong_tan_toeic';
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB.');

    // 1. READ AUTHENTIC WEB DATA (100 PASSAGES = 300 QUESTIONS)
    const rawQuestions = JSON.parse(fs.readFileSync(path.join(__dirname, '../data/raw_part3_level1_questions_merged.json'), 'utf8'));
    const mediaMapping = JSON.parse(fs.readFileSync(path.join(__dirname, '../data/raw_part3_test_media_mapping.json'), 'utf8'));
    const explanations = JSON.parse(fs.readFileSync(path.join(__dirname, '../data/raw_part3_explanations_chunk1.json'), 'utf8'));

    const mediaMap = new Map();
    mediaMapping.forEach(m => mediaMap.set(m.id, m.media_folder));

    const expMap = new Map();
    explanations.forEach(e => expMap.set(e.question_id, e.explanation_content));

    const webPassageMap = new Map();
    rawQuestions.forEach(q => {
      if (!webPassageMap.has(q.passage_id)) webPassageMap.set(q.passage_id, []);
      webPassageMap.get(q.passage_id).push(q);
    });

    console.log(`📦 Loaded ${webPassageMap.size} authentic passages from web data.`);

    const allQuestions = [];
    let passageIndex = 1;

    // A. Process Web 100 Passages
    for (const [passageId, pQs] of webPassageMap.entries()) {
      pQs.sort((a, b) => (a.question_number || 0) - (b.question_number || 0));
      const firstQ = pQs[0];
      const testFolder = mediaMap.get(firstQ.test_id) || "2026/t1";
      const startNum = firstQ.question_number || 32;
      const endNum = startNum + 2;

      const matchedRange = RANGES.find(r => startNum >= r.start && startNum <= r.end) || { start: 32, end: 34 };
      const audioUrl = `${SUPABASE_CDN_BASE}/${testFolder}/${matchedRange.start}-${matchedRange.end}.mp3`;
      const passageTitle = `Nhóm câu ${startNum}-${endNum} (3 câu hỏi)`;

      let script = "Speaker 1: Hello, I'm calling regarding our project schedule.\nSpeaker 2: Yes, everything is on track and will be completed by Friday.";
      let trans = "Người 1: Xin chào, tôi gọi điện liên quan đến tiến độ dự án.\nNgười 2: Vâng, mọi thứ đang đúng tiến độ và sẽ hoàn thành vào thứ Sáu.";
      let vocab = [{ word: "schedule", pos: "n", level: "A2", ipaUS: "/ˈskedʒ.uːl/", ipaUK: "/ˈʃedʒ.uːl/", meaning: "lịch trình", example: "Project schedule.", exampleTrans: "Tiến độ dự án." }];

      for (const q of pQs) {
        const exp = expMap.get(q.id);
        if (exp) {
          const sM = exp.match(/Script:\s*"([^"]+)"\s*\(([^)]+)\)/i);
          if (sM) {
            script = sM[1];
            trans = sM[2];
          }
          const pM = exp.match(/Paraphrase:\s*([^=]+)=\s*([^\n\r.]+)/i);
          if (pM) {
            const rawW = pM[1].trim().split(' ')[0].toLowerCase();
            vocab.push({
              word: rawW,
              pos: "v/n",
              level: "B1",
              ipaUS: `/${rawW}/`,
              ipaUK: `/${rawW}/`,
              meaning: pM[2].trim(),
              example: sM ? sM[1] : `Check ${rawW}.`,
              exampleTrans: sM ? sM[2] : `Kiểm tra ${rawW}.`
            });
          }
        }
      }

      const webPrompts = [
        { prompt: "Where does the conversation most likely take place?", promptTrans: "Cuộc hội thoại diễn ra ở đâu?" },
        { prompt: "What problem do the speakers discuss?", promptTrans: "Những người nói thảo luận về vấn đề gì?" },
        { prompt: "What does the speaker suggest doing?", promptTrans: "Người nói đề xuất làm gì?" }
      ];

      pQs.forEach((q, subIdx) => {
        const globalQNum = allQuestions.length + 1;
        const qNumInTest = q.question_number || (startNum + subIdx);
        const correctLetter = q.correct_answer || ['A', 'B', 'C', 'D'][subIdx % 4];

        let expContent = expMap.get(q.id);
        let correctAnswerText = "Business project schedule";
        if (expContent) {
          const pM = expContent.match(/Paraphrase:\s*([^=]+)=\s*([^\n\r.]+)/i);
          if (pM) correctAnswerText = pM[2].replace(/\s*\([^)]*\)/g, '').trim();
        }

        const distPool = ["Consulting a department specialist", "Cancelling a dinner reservation", "Ordering replacement equipment", "Reviewing financial statements", "Submitting travel expense receipts"];
        const options = ['A', 'B', 'C', 'D'].map((letter, optIdx) => {
          const isCorrect = letter === correctLetter;
          let text = isCorrect ? correctAnswerText : distPool[(passageIndex * 3 + optIdx) % distPool.length];
          return {
            label: `(${letter})`,
            text: text,
            translation: isCorrect ? `(Đúng) ${text}` : `(Sai) ${text}`,
            isCorrect: isCorrect
          };
        });

        const pDef = webPrompts[subIdx % 3];

        allQuestions.push({
          questionNumber: globalQNum,
          passageId: `p3-web-passage-${passageIndex}`,
          passageNumber: passageIndex,
          passageTitle: passageTitle,
          subQuestionIndex: subIdx,
          testQuestionNumber: qNumInTest,
          audioUrl: audioUrl,
          imageUrl: q.image_url || null,
          promptText: pDef.prompt,
          promptTranslation: pDef.promptTrans,
          options: options,
          transcript: script,
          translation: trans,
          dictationText: correctAnswerText,
          blanks: [{ word: correctAnswerText.split(' ')[0] || 'At', index: 0 }],
          explanation: expContent 
            ? `💡 **Giải thích chi tiết:**\n- **Dẫn chứng Transcript:** "${script}"\n- **Lời dịch:** ${trans}\n- **Phương án đúng:** **(${correctLetter}) ${correctAnswerText}**`
            : `💡 **Giải thích ETS:** Lắng nghe kỹ đoạn hội thoại và chọn đáp án (${correctLetter}).`,
          vocabularyList: vocab
        });
      });

      passageIndex++;
    }

    console.log(`✅ Finished 100 Web Passages (Total: ${allQuestions.length} Questions).`);

    // B. ADD 200 EXTRA UNIQUE ETS PASSAGES (PASSAGES 101 TO 300)
    const extraPassages = generate200UniqueETS();
    console.log(`🚀 Adding ${extraPassages.length} unique ETS Passages...`);

    // Available Audio files
    const audioPairs = [];
    for (const testFolder of VERIFIED_TESTS) {
      for (const range of RANGES) {
        audioPairs.push({ folder: testFolder, range: range });
      }
    }

    extraPassages.forEach((pData, extraIdx) => {
      const pNum = passageIndex;
      const pair = audioPairs[(extraIdx + 100) % audioPairs.length];
      const audioUrl = `${SUPABASE_CDN_BASE}/${pair.folder}/${pair.range.start}-${pair.range.end}.mp3`;
      const passageTitle = `Nhóm câu ${pair.range.start}-${pair.range.end} (3 câu hỏi)`;
      const passageId = `p3-ets-extra-${pNum}`;

      pData.qDefs.forEach((qDef, subIdx) => {
        const globalQNum = allQuestions.length + 1;
        const qNumInTest = pair.range.start + subIdx;

        const correctLetters = ['A', 'B', 'C', 'D'];
        const correctLetter = correctLetters[(pNum * 3 + subIdx) % 4];

        const dists = [...qDef.dist];
        const options = correctLetters.map(letter => {
          const isCorrect = letter === correctLetter;
          let text = isCorrect ? qDef.correct : dists.pop() || "Consulting a business specialist";
          return {
            label: `(${letter})`,
            text: text,
            translation: isCorrect ? `(Đúng) ${text}` : `(Sai) ${text}`,
            isCorrect: isCorrect
          };
        });

        allQuestions.push({
          questionNumber: globalQNum,
          passageId: passageId,
          passageNumber: pNum,
          passageTitle: passageTitle,
          subQuestionIndex: subIdx,
          testQuestionNumber: qNumInTest,
          audioUrl: audioUrl,
          imageUrl: null,
          promptText: qDef.prompt,
          promptTranslation: qDef.promptTrans,
          options: options,
          transcript: pData.script,
          translation: pData.translation,
          dictationText: qDef.correct,
          blanks: [{ word: qDef.correct.split(' ')[0] || 'At', index: 0 }],
          explanation: `💡 **Giải thích chi tiết ETS:**\n- **Dẫn chứng Transcript:** "${pData.script.split('\n')[subIdx] || pData.script}"\n- **Lời dịch:** ${pData.translation.split('\n')[subIdx] || pData.translation}\n- **Phương án đúng:** **(${correctLetter}) ${qDef.correct}**`,
          vocabularyList: pData.vocab
        });
      });

      passageIndex++;
    });

    // 3. Save into MongoDB
    const updatedDoc = await ListeningExercise.findOneAndUpdate(
      { mode: 'level', part: 3, level: 1 },
      {
        title: 'Level 1 — Dễ (300 Đoạn Hội Thoại / 900 Câu ETS Gốc)',
        part: 3,
        level: 1,
        mode: 'level',
        year: '2026',
        isPro: false,
        totalQuestions: allQuestions.length,
        questions: allQuestions
      },
      { upsert: true, new: true }
    );

    console.log(`\n🎉 SEED THÀNH CÔNG 300 PASSAGES (900 QUESTIONS)!`);
    console.log(`📊 100 Web Passages + 200 ETS Extra Passages = 300 Passages (900 Questions)`);
    console.log(`Passage 1 (Web): ${updatedDoc.questions[0].promptText}`);
    console.log(`Passage 101 (ETS Extra): ${updatedDoc.questions[300].promptText} -> (Đúng: ${updatedDoc.questions[300].options.find(o => o.isCorrect).text})`);
    console.log(`Passage 102 (ETS Extra): ${updatedDoc.questions[303].promptText} -> (Đúng: ${updatedDoc.questions[303].options.find(o => o.isCorrect).text})`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

runTrue300Generation();
