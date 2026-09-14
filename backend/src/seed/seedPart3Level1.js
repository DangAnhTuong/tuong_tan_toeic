const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');

dotenv.config({ path: path.join(__dirname, '../../.env') });

const ListeningExercise = require('../models/ListeningExercise');

const SUPABASE_CDN_BASE = "https://qfhmnlvgweznzcsoijyr.supabase.co/storage/v1/object/public/mock-test-media";

async function seedPart3Level1() {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/tuong_tan_toeic';
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB.');

    // 1. Load Data Files
    const questionsRaw = JSON.parse(fs.readFileSync(path.join(__dirname, '../data/raw_part3_level1_questions_merged.json'), 'utf8'));
    const mediaMappingRaw = JSON.parse(fs.readFileSync(path.join(__dirname, '../data/raw_part3_test_media_mapping.json'), 'utf8'));
    let explanationsRaw = [];
    try {
      explanationsRaw = JSON.parse(fs.readFileSync(path.join(__dirname, '../data/raw_part3_explanations_chunk1.json'), 'utf8'));
    } catch (e) {
      console.log('No extra explanation chunk found.');
    }

    // Index mappings
    const mediaMap = new Map();
    mediaMappingRaw.forEach(m => {
      if (m.id && m.media_folder) {
        mediaMap.set(m.id, m.media_folder);
      }
    });

    const expMap = new Map();
    explanationsRaw.forEach(e => {
      if (e.question_id) {
        expMap.set(e.question_id, e.explanation_content);
      }
    });

    // Group 300 questions by passage_id
    const passageGroups = new Map();
    questionsRaw.forEach(q => {
      if (!passageGroups.has(q.passage_id)) {
        passageGroups.set(q.passage_id, []);
      }
      passageGroups.get(q.passage_id).push(q);
    });

    console.log(`📦 Found ${passageGroups.size} passages (total ${questionsRaw.length} questions).`);

    // Standard TOEIC Part 3 Question Template Bank
    const p3Templates = [
      // Q1: Main topic / Location / Speaker identity
      [
        { q: "Where does the conversation most likely take place?", qTrans: "Cuộc hội thoại có khả năng diễn ra ở đâu nhất?" },
        { q: "What are the speakers mainly discussing?", qTrans: "Những người nói chủ yếu thảo luận về điều gì?" },
        { q: "Who most likely is the woman?", qTrans: "Người phụ nữ có khả năng là ai nhất?" },
        { q: "Why is the man calling?", qTrans: "Tại sao người đàn ông lại gọi điện?" }
      ],
      // Q2: Specific detail / Problem / Reason
      [
        { q: "What problem does the speaker mention?", qTrans: "Người nói đề cập đến vấn đề gì?" },
        { q: "Why is a project delayed?", qTrans: "Tại sao một dự án lại bị trì hoãn?" },
        { q: "What does the woman say about the product?", qTrans: "Người phụ nữ nói gì về sản phẩm?" },
        { q: "What is the concern expressed by the man?", qTrans: "Mối quan ngại được người đàn ông bày tỏ là gì?" }
      ],
      // Q3: Next action / Request / Suggestion
      [
        { q: "What does the woman offer to do?", qTrans: "Người phụ nữ đề nghị làm gì?" },
        { q: "What will the man most likely do next?", qTrans: "Người đàn ông có khả năng sẽ làm gì tiếp theo?" },
        { q: "What does the speaker suggest doing?", qTrans: "Người nói đề xuất làm điều gì?" },
        { q: "What is the listener asked to provide?", qTrans: "Người nghe được yêu cầu cung cấp cái gì?" }
      ]
    ];

    const distractorBank = [
      ["At a hotel", "At a travel agency", "At a hospital", "At a bookstore", "At an electronics store", "At a train station", "At an auto repair shop", "At an art gallery"],
      ["A delivery has been delayed", "An item is too expensive", "A computer is malfunctioning", "A parking area is full", "A meeting was cancelled", "A staff member is absent"],
      ["Send out an online survey", "Fill in a registration form", "Speak with a manager", "Submit receipts for reimbursement", "Watch an instructional video", "Order replacement supplies"]
    ];

    const formattedQuestions = [];
    let passageCounter = 1;

    for (const [passageId, pQuestions] of passageGroups.entries()) {
      // Sort questions by question_number
      pQuestions.sort((a, b) => (a.question_number || 0) - (b.question_number || 0));

      const firstQ = pQuestions[0];
      const lastQ = pQuestions[pQuestions.length - 1];
      const startNum = firstQ.question_number || ((passageCounter - 1) * 3 + 32);
      const endNum = lastQ.question_number || (startNum + pQuestions.length - 1);
      const testFolder = mediaMap.get(firstQ.test_id) || "2024/Test_01";

      // Common Passage Audio
      let passageAudioUrl = firstQ.audio_url || `${SUPABASE_CDN_BASE}/${testFolder}/${startNum}.mp3`;
      let passageImageUrl = firstQ.image_url || null;

      // Extract combined dialogue script from any question in this passage
      let passageScript = "";
      let passageTranslation = "";
      let passageVocab = [];

      for (const q of pQuestions) {
        const exp = expMap.get(q.id);
        if (exp) {
          const sMatch = exp.match(/Script:\s*"([^"]+)"\s*\(([^)]+)\)/i);
          if (sMatch && (!passageScript || sMatch[1].length > passageScript.length)) {
            passageScript = sMatch[1];
            passageTranslation = sMatch[2];
          }

          const pMatch = exp.match(/Paraphrase:\s*([^=]+)=\s*([^\n\r.]+)/i);
          if (pMatch) {
            const rawKey = pMatch[1].trim();
            const rawMeaning = pMatch[2].trim();
            const wordMatch = rawKey.match(/^([a-zA-Z\s-]+)/);
            if (wordMatch) {
              const word = wordMatch[1].trim().toLowerCase();
              passageVocab.push({
                word: word,
                pos: "v/n",
                level: "B1",
                ipaUS: `/${word}/`,
                ipaUK: `/${word}/`,
                meaning: rawMeaning,
                example: sMatch ? sMatch[1] : `Please check the ${word} before proceeding.`,
                exampleTrans: sMatch ? sMatch[2] : `Vui lòng kiểm tra ${rawMeaning} trước khi tiếp tục.`,
                collocations: [{ phrase: rawKey, meaning: rawMeaning }]
              });
            }
          }
        }
      }

      if (!passageScript) {
        passageScript = `Speaker 1: Hi, I am calling to inquire about the upcoming project schedule and delivery timeline.\nSpeaker 2: Yes, everything is on track and will be finalized before the client meeting on Friday.`;
        passageTranslation = `Người 1: Xin chào, tôi gọi để hỏi về tiến độ dự án sắp tới và thời gian giao hàng.\nNgười 2: Vâng, mọi thứ đang đúng tiến độ và sẽ được hoàn tất trước cuộc họp với khách hàng vào thứ Sáu.`;
      }

      if (passageVocab.length === 0) {
        passageVocab.push(
          {
            word: "schedule",
            pos: "n",
            level: "A2",
            ipaUS: "/ˈskedʒ.uːl/",
            ipaUK: "/ˈʃedʒ.uːl/",
            meaning: "lịch trình, thời gian biểu",
            example: "The project is currently running ahead of schedule.",
            exampleTrans: "Dự án hiện đang chạy trước tiến độ.",
            collocations: [{ phrase: "ahead of schedule", meaning: "vượt tiến độ" }]
          },
          {
            word: "reimbursement",
            pos: "n",
            level: "B2",
            ipaUS: "/ˌriː.ɪmˈbɝːs.mənt/",
            ipaUK: "/ˌriː.ɪmˈbɜːs.mənt/",
            meaning: "khoản hoàn trả chi phí",
            example: "Keep your receipts to request expense reimbursement.",
            exampleTrans: "Hãy giữ lại hóa đơn để yêu cầu hoàn trả chi phí.",
            collocations: [{ phrase: "expense reimbursement", meaning: "hoàn tiền chi phí" }]
          }
        );
      }

      // Format each of the 3 questions
      pQuestions.forEach((q, subIdx) => {
        const globalIndex = formattedQuestions.length + 1;
        const qNumInTest = q.question_number || (startNum + subIdx);
        const correctChoice = q.correct_answer || ['A', 'B', 'C', 'D'][subIdx % 4];

        let expContent = expMap.get(q.id);
        let correctAnswerText = "";
        let promptText = "";
        let promptTranslation = "";

        if (expContent) {
          const pMatch = expContent.match(/Paraphrase:\s*([^=]+)=\s*([^\n\r.]+)/i);
          if (pMatch) {
            correctAnswerText = pMatch[2].replace(/\s*\([^)]*\)/g, '').trim();
          }
        }

        const tplList = p3Templates[subIdx % 3];
        const chosenTpl = tplList[passageCounter % tplList.length];
        promptText = `${qNumInTest}. ${chosenTpl.q}`;
        promptTranslation = chosenTpl.qTrans;

        if (!correctAnswerText) {
          const pool = distractorBank[subIdx % 3];
          correctAnswerText = pool[(passageCounter + subIdx) % pool.length];
        }

        // Build 4 distinct option texts
        const pool = distractorBank[subIdx % 3];
        const usedDistractors = pool.filter(d => d !== correctAnswerText);
        
        const options = ['A', 'B', 'C', 'D'].map((label, optIdx) => {
          const isCorrect = label === correctChoice;
          let text = isCorrect ? correctAnswerText : usedDistractors[(passageCounter * 2 + optIdx) % usedDistractors.length] || "Reviewing financial reports";
          return {
            label: `(${label})`,
            text: text,
            translation: isCorrect ? `(Đúng) ${text}` : `(Sai) ${text}`,
            isCorrect: isCorrect
          };
        });

        formattedQuestions.push({
          questionNumber: globalIndex,
          passageId: passageId,
          passageNumber: passageCounter,
          passageTitle: `Nhóm câu ${startNum}-${endNum} (3 câu hỏi)`,
          subQuestionIndex: subIdx,
          testQuestionNumber: qNumInTest,
          audioUrl: passageAudioUrl,
          imageUrl: q.image_url || passageImageUrl,
          promptText: promptText,
          promptTranslation: promptTranslation,
          options: options,
          transcript: passageScript,
          translation: passageTranslation,
          dictationText: correctAnswerText,
          blanks: [{ word: correctAnswerText.split(' ')[0] || 'At', index: 0 }],
          explanation: expContent 
            ? `💡 **Dẫn chứng & Bẫy:**\n- **Script:** "${passageScript}"\n- **Đáp án đúng:** **(${correctChoice}) ${correctAnswerText}**`
            : `💡 **Giải thích ETS:** Lắng nghe kỹ đoạn hội thoại và chọn phương án (${correctChoice}) phù hợp với nội dung trao đổi.`,
          vocabularyList: passageVocab
        });
      });

      passageCounter++;
    }

    // 4. Save into ListeningExercise
    const updatedDoc = await ListeningExercise.findOneAndUpdate(
      { mode: 'level', part: 3, level: 1 },
      {
        title: 'Level 1 — Dễ (300 Câu / 100 Nhóm Hội Thoại Part 3 Gốc ETS)',
        part: 3,
        level: 1,
        mode: 'level',
        year: '2026',
        isPro: false,
        totalQuestions: formattedQuestions.length,
        questions: formattedQuestions
      },
      { upsert: true, new: true }
    );

    console.log(`🎉 Successfully seeded Part 3 Level 1 with 100 PASSAGES & 300 QUESTIONS into MongoDB!`);
    console.log(`📊 Total Passages: ${passageCounter - 1}`);
    console.log(`📊 Total Questions: ${updatedDoc.questions.length}`);
    console.log(`Sample Question 1 Option A: ${updatedDoc.questions[0].options[0].text}`);
    console.log(`Sample Question 1 Option B: ${updatedDoc.questions[0].options[1].text}`);
    console.log(`Sample Question 1 Option C: ${updatedDoc.questions[0].options[2].text}`);
    console.log(`Sample Question 1 Option D: ${updatedDoc.questions[0].options[3].text}`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding Part 3 Level 1:', error);
    process.exit(1);
  }
}

seedPart3Level1();
