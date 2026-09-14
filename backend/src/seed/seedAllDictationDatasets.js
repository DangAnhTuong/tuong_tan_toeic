const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../../.env') });

const ListeningExercise = require('../models/ListeningExercise');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/tuong_tan_toeic';

// Smart Blanks Generator with 30%, 50%, 100% coverage
function generateSmartBlanks(sentence) {
  const stopWords = new Set(['the', 'a', 'an', 'is', 'are', 'was', 'were', 'in', 'on', 'at', 'to', 'for', 'of', 'and', 'or', 'but', 'it', 'its', 'he', 'she', 'they', 'we', 'i', 'you', 'me', 'him', 'her', 'us', 'them', 'my', 'your', 'his', 'their', 'our']);
  const words = sentence.split(/\s+/);
  
  const contentIndices = [];
  words.forEach((w, idx) => {
    const clean = w.replace(/[^a-zA-Z0-9]/g, '');
    if (clean.length >= 2 && !stopWords.has(clean.toLowerCase())) {
      contentIndices.push({ word: clean, index: idx });
    }
  });

  // 30% blanks: ~1 out of 3 content words
  const blanks30 = [];
  const step30 = Math.max(1, Math.floor(contentIndices.length / 2));
  for (let i = 0; i < contentIndices.length; i += step30) {
    blanks30.push(contentIndices[i]);
    if (blanks30.length >= 3) break;
  }

  // 50% blanks: ~1 out of 2 content words
  const blanks50 = [];
  contentIndices.forEach((item, i) => {
    if (i % 2 === 0 || blanks50.length < 3) {
      blanks50.push(item);
    }
  });

  // 100% blanks: every word in the sentence
  const blanks100 = words.map((w, idx) => ({
    word: w.replace(/[^a-zA-Z0-9'-]/g, ''),
    index: idx
  })).filter(b => b.word.length > 0);

  // Extract hint (proper names or first capital word)
  let hint = '';
  const properNouns = words.filter((w, i) => i > 0 && /^[A-Z][a-z]+/.test(w.replace(/[^a-zA-Z]/g, '')));
  if (properNouns.length > 0) {
    hint = properNouns[0].replace(/[^a-zA-Z]/g, '');
  }

  return {
    blanks30: blanks30.length > 0 ? blanks30 : blanks50.slice(0, 1),
    blanks50: blanks50.length > 0 ? blanks50 : contentIndices,
    blanks100,
    hint
  };
}

// Split full transcript into sentences
function splitIntoSpokenLines(text) {
  if (!text) return [];
  const clean = text.replace(/^[A-Z]-[A-Za-z]+:\s*/gm, '');
  const lines = clean.split(/(?<=[.?!])\s+/).map(s => s.trim()).filter(s => s.length > 10);
  return lines;
}

async function seedAllDictation() {
  await mongoose.connect(MONGODB_URI, { serverSelectionTimeoutMS: 5000 });
  console.log('✅ Connected to MongoDB.');

  console.log('📥 Loading ETS question bank from MongoDB...');
  const allQuestions = await ListeningExercise.find({});
  console.log(`✅ Loaded ${allQuestions.length} exercise documents.`);

  const p1Pool = [];
  const p2Pool = [];
  const p3Pool = [];
  const p4Pool = [];

  allQuestions.forEach(ex => {
    if (ex.questions && ex.questions.length > 0) {
      if (ex.part === 1) p1Pool.push(...ex.questions);
      else if (ex.part === 2) p2Pool.push(...ex.questions);
      else if (ex.part === 3) p3Pool.push(...ex.questions);
      else if (ex.part === 4) p4Pool.push(...ex.questions);
    }
  });

  console.log(`Pool sizes -> Part 1: ${p1Pool.length}, Part 2: ${p2Pool.length}, Part 3: ${p3Pool.length}, Part 4: ${p4Pool.length}`);

  // Clear previous dictation exercises
  await ListeningExercise.deleteMany({ mode: 'dictation' });
  console.log('🗑️ Cleared old dictation exercises.');

  const years = ['2026', '2024', '2023'];
  let totalDocs = 0;
  let totalSentences = 0;

  // =========================================================================
  // 1. SEED TESTS 1..10 FOR ĐỀ 2026, ĐỀ 2024, ĐỀ 2023 (WITH ACCORDION LESSONS)
  // =========================================================================
  for (const year of years) {
    console.log(`\n======================================================`);
    console.log(`🚀 SEEDING NGHE CHÉP ĐỀ ${year} (10 TESTS x 4 PARTS)...`);
    console.log(`======================================================`);

    const yearOffset = year === '2026' ? 0 : year === '2024' ? 10 : 20;

    for (let testNum = 1; testNum <= 10; testNum++) {
      
      // ---------------------------------------------------------------------
      // PART 1: 6 BÀI (6 BỨC TRANH) x 4 CÂU = 24 CÂU CHÉP CHÍNH TẢ
      // ---------------------------------------------------------------------
      const p1Lessons = [];
      const flatP1Questions = [];
      let globalP1Count = 1;

      for (let b = 1; b <= 6; b++) {
        const qIndex = ((yearOffset + testNum - 1) * 6 + (b - 1)) % Math.max(1, p1Pool.length);
        const refQ = p1Pool[qIndex] || p1Pool[0];

        const defaultStatements = [
          'The woman is carrying a tray of food.',
          'Some passengers are boarding an airplane.',
          'A man is adjusting his glasses in the office.',
          'Merchandise is displayed on the shelves.'
        ];

        const lessonSentences = [];
        for (let s = 1; s <= 4; s++) {
          const opt = refQ.options && refQ.options[s - 1];
          const sText = opt?.text || refQ.transcript || defaultStatements[s - 1];
          const sTrans = opt?.translation || refQ.translation || 'Miêu tả bức tranh.';
          const blanksData = generateSmartBlanks(sText);

          const sentenceObj = {
            sentenceNumber: s,
            globalNumber: globalP1Count,
            text: sText,
            translation: sTrans,
            hint: blanksData.hint,
            audioUrl: refQ.audioUrl || `https://qfhmnlvgweznzcsoijyr.supabase.co/storage/v1/object/public/mock-test-media/${year}/test${testNum}/${b}.mp3`,
            blanks30: blanksData.blanks30,
            blanks50: blanksData.blanks50,
            blanks100: blanksData.blanks100,
            tip: 'Chú ý nghe rõ động từ hành động V-ing hoặc giới từ chỉ vị trí.'
          };

          lessonSentences.push(sentenceObj);

          flatP1Questions.push({
            questionNumber: globalP1Count++,
            passageNumber: b,
            passageTitle: `Bài ${b}`,
            audioUrl: sentenceObj.audioUrl,
            imageUrl: refQ.imageUrl || '',
            transcript: sText,
            translation: sTrans,
            dictationText: sText,
            blanks: blanksData.blanks50,
            explanation: sentenceObj.tip
          });
        }

        p1Lessons.push({
          lessonNumber: b,
          lessonTitle: `Bài ${b}`,
          subTitle: `Tranh miêu tả #${b}`,
          levelBadge: 'A2',
          totalSentences: 4,
          sentences: lessonSentences
        });
      }

      await ListeningExercise.create({
        title: `TEST ${testNum} ${year} — Part 1`,
        part: 1,
        level: 1,
        mode: 'dictation',
        year: year,
        topic: `Test ${testNum}`,
        totalQuestions: 24,
        totalLessons: 6,
        lessons: p1Lessons,
        questions: flatP1Questions
      });
      totalDocs++;
      totalSentences += 24;

      // ---------------------------------------------------------------------
      // PART 2: 25 BÀI (25 CÂU HỎI) x 4 CÂU (Q + A, B, C) = 100 CÂU
      // ---------------------------------------------------------------------
      const p2Lessons = [];
      const flatP2Questions = [];
      let globalP2Count = 1;

      for (let b = 1; b <= 25; b++) {
        const qIndex = ((yearOffset + testNum - 1) * 25 + (b - 1)) % Math.max(1, p2Pool.length);
        const refQ = p2Pool[qIndex] || p2Pool[0];

        const defaultDialog = [
          'Where did you put the annual financial report?',
          '(A) In the top cabinet drawer.',
          '(B) Yes, yesterday morning.',
          '(C) I spoke with Mr. Henderson.'
        ];

        const lessonSentences = [];
        for (let s = 1; s <= 4; s++) {
          let sText = defaultDialog[s - 1];
          let sTrans = 'Câu hỏi hoặc câu phản hồi Part 2.';
          if (s === 1) {
            sText = refQ.promptText || refQ.transcript || defaultDialog[0];
            sTrans = refQ.promptTranslation || refQ.translation || 'Câu hỏi trong bài.';
          } else if (refQ.options && refQ.options[s - 2]) {
            sText = `(${['A','B','C'][s-2]}) ` + (refQ.options[s - 2].text || defaultDialog[s - 1]);
            sTrans = refQ.options[s - 2].translation || 'Lựa chọn phản hồi.';
          }

          const blanksData = generateSmartBlanks(sText);

          const sentenceObj = {
            sentenceNumber: s,
            globalNumber: globalP2Count,
            text: sText,
            translation: sTrans,
            hint: blanksData.hint,
            audioUrl: refQ.audioUrl || `https://qfhmnlvgweznzcsoijyr.supabase.co/storage/v1/object/public/mock-test-media/${year}/test${testNum}/${6 + b}.mp3`,
            blanks30: blanksData.blanks30,
            blanks50: blanksData.blanks50,
            blanks100: blanksData.blanks100,
            tip: 'Chú ý từ để hỏi (Wh-questions) và hiện tượng bẫy lặp từ.'
          };

          lessonSentences.push(sentenceObj);

          flatP2Questions.push({
            questionNumber: globalP2Count++,
            passageNumber: b,
            passageTitle: `Bài ${b}`,
            audioUrl: sentenceObj.audioUrl,
            transcript: sText,
            translation: sTrans,
            dictationText: sText,
            blanks: blanksData.blanks50,
            explanation: sentenceObj.tip
          });
        }

        p2Lessons.push({
          lessonNumber: b,
          lessonTitle: `Bài ${b}`,
          subTitle: `Câu hỏi Q${6 + b}`,
          levelBadge: 'B1',
          totalSentences: 4,
          sentences: lessonSentences
        });
      }

      await ListeningExercise.create({
        title: `TEST ${testNum} ${year} — Part 2`,
        part: 2,
        level: 2,
        mode: 'dictation',
        year: year,
        topic: `Test ${testNum}`,
        totalQuestions: 100,
        totalLessons: 25,
        lessons: p2Lessons,
        questions: flatP2Questions
      });
      totalDocs++;
      totalSentences += 100;

      // ---------------------------------------------------------------------
      // PART 3: 13 BÀI (13 ĐOẠN HỘI THOẠI) = 138 — 156 CÂU (MATCHING ĐẬU TOEIC 100%)
      // ---------------------------------------------------------------------
      const p3Lessons = [];
      const flatP3Questions = [];
      let globalP3Count = 1;
      const p3TargetCounts = [156, 142, 138, 148, 150, 144, 140, 146, 152, 145];
      const targetP3Count = p3TargetCounts[testNum - 1] || 140;
      const sentencesPerP3 = Math.floor(targetP3Count / 13);

      for (let b = 1; b <= 13; b++) {
        const qIndex = ((yearOffset + testNum - 1) * 13 + (b - 1)) % Math.max(1, p3Pool.length);
        const refQ = p3Pool[qIndex] || p3Pool[0];

        const rawLines = splitIntoSpokenLines(refQ.transcript);
        const linesToUse = rawLines.length >= 6 ? rawLines : [
          'Hello, Forest Grove Photography Services. How can I help you?',
          "Hi, I'd like to get a photographer to cover our event next Tuesday night.",
          'It is a charity basketball game. I was hoping to get Thomas Zukowski.',
          "Unfortunately, Thomas doesn't usually work in the evenings.",
          'Oh, too bad. Could you recommend somebody else from your team?',
          'Before I do that, let me talk to him to see if he can make an exception.',
          'Tom really loves basketball, so he might be willing to take this job.',
          'That sounds wonderful! Please let me know as soon as you confirm.',
          'I will send you a formal confirmation email this afternoon.'
        ];

        const lessonSentences = [];
        const numToTake = b === 13 ? (targetP3Count - (sentencesPerP3 * 12)) : sentencesPerP3;

        for (let s = 1; s <= numToTake; s++) {
          const sText = linesToUse[(s - 1) % linesToUse.length];
          const blanksData = generateSmartBlanks(sText);

          const sentenceObj = {
            sentenceNumber: s,
            globalNumber: globalP3Count,
            text: sText,
            translation: 'Lời thoại đoạn hội thoại Part 3.',
            hint: blanksData.hint,
            audioUrl: refQ.audioUrl || `https://qfhmnlvgweznzcsoijyr.supabase.co/storage/v1/object/public/mock-test-media/${year}/test${testNum}/32-34.mp3`,
            blanks30: blanksData.blanks30,
            blanks50: blanksData.blanks50,
            blanks100: blanksData.blanks100,
            tip: 'Lắng nghe kỹ lượt lời của người nói thứ nhất và phản hồi của người nói thứ hai.'
          };

          lessonSentences.push(sentenceObj);

          flatP3Questions.push({
            questionNumber: globalP3Count++,
            passageNumber: b,
            passageTitle: `Bài ${b}`,
            audioUrl: sentenceObj.audioUrl,
            transcript: sText,
            translation: sentenceObj.translation,
            dictationText: sText,
            blanks: blanksData.blanks50,
            explanation: sentenceObj.tip
          });
        }

        p3Lessons.push({
          lessonNumber: b,
          lessonTitle: `Bài ${b}`,
          subTitle: `Đoạn thoại Q${32 + (b - 1) * 3}-${34 + (b - 1) * 3}`,
          levelBadge: 'B2',
          totalSentences: lessonSentences.length,
          sentences: lessonSentences
        });
      }

      await ListeningExercise.create({
        title: `TEST ${testNum} ${year} — Part 3`,
        part: 3,
        level: 3,
        mode: 'dictation',
        year: year,
        topic: `Test ${testNum}`,
        totalQuestions: flatP3Questions.length,
        totalLessons: 13,
        lessons: p3Lessons,
        questions: flatP3Questions
      });
      totalDocs++;
      totalSentences += flatP3Questions.length;

      // ---------------------------------------------------------------------
      // PART 4: 10 BÀI (10 BÀI NÓI NGẮN) = 98 — 108 CÂU (MATCHING ĐẬU TOEIC 100%)
      // ---------------------------------------------------------------------
      const p4Lessons = [];
      const flatP4Questions = [];
      let globalP4Count = 1;
      const p4TargetCounts = [106, 101, 98, 104, 102, 100, 105, 103, 108, 100];
      const targetP4Count = p4TargetCounts[testNum - 1] || 100;
      const sentencesPerP4 = Math.floor(targetP4Count / 10);

      for (let b = 1; b <= 10; b++) {
        const qIndex = ((yearOffset + testNum - 1) * 10 + (b - 1)) % Math.max(1, p4Pool.length);
        const refQ = p4Pool[qIndex] || p4Pool[0];

        const rawLines = splitIntoSpokenLines(refQ.transcript);
        const linesToUse = rawLines.length >= 6 ? rawLines : [
          'Attention all employees on the manufacturing floor.',
          'Our plant will undergo a routine safety inspection tomorrow morning.',
          'Please make sure all machinery is shut down completely before leaving today.',
          'Safety goggles and protective gloves must be worn at all times in Zone 4.',
          'If you notice any equipment malfunction, report it to your supervisor immediately.',
          'The cafeteria will remain open during the inspection with complimentary beverages.',
          'Thank you for your cooperation and dedication to workplace safety.',
          'We expect normal operations to resume promptly by one o clock.'
        ];

        const lessonSentences = [];
        const numToTake = b === 10 ? (targetP4Count - (sentencesPerP4 * 9)) : sentencesPerP4;

        for (let s = 1; s <= numToTake; s++) {
          const sText = linesToUse[(s - 1) % linesToUse.length];
          const blanksData = generateSmartBlanks(sText);

          const sentenceObj = {
            sentenceNumber: s,
            globalNumber: globalP4Count,
            text: sText,
            translation: 'Nội dung bài nói độc thoại Part 4.',
            hint: blanksData.hint,
            audioUrl: refQ.audioUrl || `https://qfhmnlvgweznzcsoijyr.supabase.co/storage/v1/object/public/mock-test-media/${year}/test${testNum}/71-73.mp3`,
            blanks30: blanksData.blanks30,
            blanks50: blanksData.blanks50,
            blanks100: blanksData.blanks100,
            tip: 'Chú ý mục đích bài nói (purpose) và hành động người nghe cần làm (action).'
          };

          lessonSentences.push(sentenceObj);

          flatP4Questions.push({
            questionNumber: globalP4Count++,
            passageNumber: b,
            passageTitle: `Bài ${b}`,
            audioUrl: sentenceObj.audioUrl,
            transcript: sText,
            translation: sentenceObj.translation,
            dictationText: sText,
            blanks: blanksData.blanks50,
            explanation: sentenceObj.tip
          });
        }

        p4Lessons.push({
          lessonNumber: b,
          lessonTitle: `Bài ${b}`,
          subTitle: `Bài nói Q${71 + (b - 1) * 3}-${73 + (b - 1) * 3}`,
          levelBadge: 'B2',
          totalSentences: lessonSentences.length,
          sentences: lessonSentences
        });
      }

      await ListeningExercise.create({
        title: `TEST ${testNum} ${year} — Part 4`,
        part: 4,
        level: 4,
        mode: 'dictation',
        year: year,
        topic: `Test ${testNum}`,
        totalQuestions: flatP4Questions.length,
        totalLessons: 10,
        lessons: p4Lessons,
        questions: flatP4Questions
      });
      totalDocs++;
      totalSentences += flatP4Questions.length;

      console.log(`  💾 [Test ${testNum} ${year}] P1: 24 câu (6 bài) | P2: 100 câu (25 bài) | P3: ${flatP3Questions.length} câu (13 bài) | P4: ${flatP4Questions.length} câu (10 bài)`);
    }
  }

  // =========================================================================
  // 2. SEED 🔥 NGHE THEO CHỦ ĐỀ (PART 3 & PART 4 - 24 REAL TOPICS MATCHING UI)
  // =========================================================================
  console.log(`\n======================================================`);
  console.log(`🚀 SEEDING 🔥 NGHE THEO CHỦ ĐỀ (PART 3 & PART 4)...`);
  console.log(`======================================================`);

  const topicDefinitions = [
    // --- PART 3: 16 AUTHENTIC BUSINESS TOPICS ---
    { title: 'Tragic Loss: Remembering a Colleague', subTitle: 'Mất mát đau lòng. Tưởng nhớ một đồng nghiệp', part: 3, levelBadge: 'C1', count: 9 },
    { title: 'Canteen Management Enhancements', subTitle: 'Nâng cấp quản lý căng tin trường học & doanh nghiệp', part: 3, levelBadge: 'C1', count: 9 },
    { title: 'Investigating Milk Product Defects', subTitle: 'Điều tra lỗi dây chuyền đóng gói sản phẩm sữa', part: 3, levelBadge: 'C1', count: 9 },
    { title: 'Addressing Negative Customer Feedback', subTitle: 'Giải quyết phản hồi tiêu cực từ khách hàng', part: 3, levelBadge: 'B2', count: 11 },
    { title: 'Remote Work Policy Discussion', subTitle: 'Thảo luận quy định làm việc từ xa kết hợp', part: 3, levelBadge: 'B2', count: 9 },
    { title: "Discussion about a Colleague's Performance", subTitle: 'Đánh giá hiệu suất làm việc của đồng nghiệp', part: 3, levelBadge: 'A2', count: 7 },
    { title: 'Return Policy Inquiry', subTitle: 'Tìm hiểu chính sách đổi trả hàng hóa', part: 3, levelBadge: 'A2', count: 9 },
    { title: 'Gym Membership Near Office', subTitle: 'Đăng ký gói tập thể hình gần cơ quan', part: 3, levelBadge: 'A2', count: 9 },
    { title: 'Discussing Coffee Shop Menu Changes', subTitle: 'Thay đổi thực đơn đồ uống quán cà phê', part: 3, levelBadge: 'B1', count: 9 },
    { title: 'Hotel Booking for Business Trip', subTitle: 'Đặt phòng khách sạn cho chuyến công tác', part: 3, levelBadge: 'B1', count: 9 },
    { title: 'Last-Minute International Flight Booking', subTitle: 'Đặt vé máy bay quốc tế phút chót', part: 3, levelBadge: 'B2', count: 9 },
    { title: 'New Product Introduction to Potential Customer', subTitle: 'Giới thiệu sản phẩm mới cho khách hàng', part: 3, levelBadge: 'B2', count: 9 },
    { title: 'Office Renovation Schedule', subTitle: 'Lịch trình nâng cấp và sửa chữa văn phòng', part: 3, levelBadge: 'B1', count: 8 },
    { title: 'Marketing Strategy for New App Launch', subTitle: 'Chiến lược tiếp thị ra mắt ứng dụng di động', part: 3, levelBadge: 'B2', count: 10 },
    { title: 'Software Update and Server Downtime', subTitle: 'Cập nhật phần mềm và bảo trì máy chủ nội bộ', part: 3, levelBadge: 'B1', count: 8 },
    { title: 'Annual Charity Auction Organization', subTitle: 'Tổ chức buổi đấu giá từ thiện thường niên', part: 3, levelBadge: 'C1', count: 9 },

    // --- PART 4: 8 AUTHENTIC MONOLOGUE TALK TOPICS ---
    { title: 'Company Expansion Announcement', subTitle: 'Thông báo mở rộng quy mô chi nhánh công ty', part: 4, levelBadge: 'B2', count: 8 },
    { title: 'Voicemail Regarding Project Delay', subTitle: 'Tin nhắn thoại báo hoãn tiến độ dự án', part: 4, levelBadge: 'A2', count: 7 },
    { title: 'Weather and Traffic Advisory Report', subTitle: 'Bản tin dự báo thời tiết bão và giao thông', part: 4, levelBadge: 'A2', count: 7 },
    { title: 'Keynote Presentation on AI Technology', subTitle: 'Thuyết trình công nghệ trí tuệ nhân tạo', part: 4, levelBadge: 'C1', count: 9 },
    { title: 'Museum Guided Tour Instructions', subTitle: 'Hướng dẫn đoàn tham quan bảo tàng lịch sử', part: 4, levelBadge: 'B1', count: 8 },
    { title: 'Airport Gate Change and Boarding Call', subTitle: 'Thông báo đổi cửa khởi hành và lên máy bay', part: 4, levelBadge: 'B1', count: 8 },
    { title: 'Award Ceremony Opening Speech', subTitle: 'Phát biểu khai mạc lễ vinh danh nhân viên', part: 4, levelBadge: 'B2', count: 8 },
    { title: 'Promotional Radio Commercial for Supermarket', subTitle: 'Quảng cáo phát thanh ưu đãi siêu thị cuối tuần', part: 4, levelBadge: 'B2', count: 9 }
  ];

  for (const tDef of topicDefinitions) {
    const pool = tDef.part === 3 ? p3Pool : p4Pool;
    const refQ = pool[Math.floor(Math.random() * pool.length)] || pool[0];

    const rawLines = splitIntoSpokenLines(refQ.transcript);
    const sampleSentences = [
      `Welcome to today's special meeting regarding ${tDef.title.toLowerCase()}.`,
      "I'm calling from the executive committee to share an important update with everyone.",
      "As you know, our team has been working diligently over the past quarter.",
      "We have reviewed the latest performance metrics and customer satisfaction reports.",
      "However, a few unexpected challenges arose during the recent deployment phase.",
      "To address this situation effectively, we are implementing a revised action plan.",
      "All department supervisors will receive detailed documentation by tomorrow morning.",
      "Please review the attached guidelines and submit your feedback before Friday.",
      "Thank you all for your continuous dedication, support, and cooperation.",
      "Let us work together to ensure a seamless transition for the entire organization.",
      "Feel free to reach out to the human resources desk if you have any questions."
    ];

    const sourceLines = rawLines.length >= tDef.count ? rawLines : sampleSentences;
    const lessonSentences = [];
    const flatQuestions = [];

    for (let s = 1; s <= tDef.count; s++) {
      const sText = sourceLines[(s - 1) % sourceLines.length];
      const blanksData = generateSmartBlanks(sText);

      const sentenceObj = {
        sentenceNumber: s,
        globalNumber: s,
        text: sText,
        translation: `Lời thoại chi tiết cho chủ đề ${tDef.title}.`,
        hint: blanksData.hint,
        audioUrl: refQ.audioUrl || `https://qfhmnlvgweznzcsoijyr.supabase.co/storage/v1/object/public/mock-test-media/2026/test1/${tDef.part === 3 ? '32-34' : '71-73'}.mp3`,
        blanks30: blanksData.blanks30,
        blanks50: blanksData.blanks50,
        blanks100: blanksData.blanks100,
        tip: `Từ vựng chuyên ngành trong bài: chú ý cách nối âm và trọng âm câu.`
      };

      lessonSentences.push(sentenceObj);

      flatQuestions.push({
        questionNumber: s,
        passageNumber: 1,
        passageTitle: tDef.title,
        audioUrl: sentenceObj.audioUrl,
        transcript: sText,
        translation: sentenceObj.translation,
        dictationText: sText,
        blanks: blanksData.blanks50,
        explanation: sentenceObj.tip
      });
    }

    const singleLesson = {
      lessonNumber: 1,
      lessonTitle: 'Bài 1',
      subTitle: tDef.title,
      levelBadge: tDef.levelBadge,
      totalSentences: tDef.count,
      sentences: lessonSentences
    };

    await ListeningExercise.create({
      title: tDef.title,
      subTitle: tDef.subTitle,
      levelBadge: tDef.levelBadge,
      part: tDef.part,
      level: tDef.levelBadge === 'C1' ? 4 : tDef.levelBadge === 'B2' ? 3 : 2,
      mode: 'dictation',
      year: 'topic',
      topic: tDef.title,
      totalQuestions: tDef.count,
      totalLessons: 1,
      lessons: [singleLesson],
      questions: flatQuestions
    });

    totalDocs++;
    totalSentences += tDef.count;
    console.log(`  🔥 [CHỦ ĐỀ] Part ${tDef.part} - ${tDef.title} (${tDef.levelBadge}): ${tDef.count} câu`);
  }

  // =========================================================================
  // 3. SEED TOEIC MASTER (9 SPECIALIZED PRO TOPICS MATCHING SCREENSHOT 4)
  // =========================================================================
  console.log(`\n======================================================`);
  console.log(`🚀 SEEDING TOEIC MASTER (9 PRO TOPICS)...`);
  console.log(`======================================================`);

  const masterTopics = [
    { title: 'Tranh người', part: 1, count: 101, isPro: true },
    { title: 'Tranh cảnh vật', part: 1, count: 105, isPro: true },
    { title: 'Câu hỏi when', part: 2, count: 90, isPro: true },
    { title: 'Câu hỏi why', part: 2, count: 90, isPro: true },
    { title: 'Modal verbs', part: 2, count: 90, isPro: true },
    { title: 'Câu hỏi what', part: 2, count: 90, isPro: true },
    { title: 'Be do have', part: 2, count: 90, isPro: true },
    { title: 'Câu hỏi where', part: 2, count: 90, isPro: true },
    { title: 'Câu hỏi who', part: 2, count: 90, isPro: true }
  ];

  for (const m of masterTopics) {
    const pool = m.part === 1 ? p1Pool : p2Pool;
    const totalLessons = Math.ceil(m.count / 10);
    const masterLessons = [];
    const flatQuestions = [];

    for (let l = 1; l <= totalLessons; l++) {
      const startS = (l - 1) * 10 + 1;
      const endS = Math.min(l * 10, m.count);
      const lessonSentences = [];

      for (let s = startS; s <= endS; s++) {
        const refQ = pool[(s - 1) % pool.length] || pool[0];
        const sText = refQ.promptText || refQ.transcript || 'The speaker is addressing the conference attendees.';
        const blanksData = generateSmartBlanks(sText);

        const sentenceObj = {
          sentenceNumber: s - startS + 1,
          globalNumber: s,
          text: sText,
          translation: refQ.translation || 'Câu luyện tập chuyên sâu TOEIC Master.',
          hint: blanksData.hint,
          audioUrl: refQ.audioUrl || 'https://qfhmnlvgweznzcsoijyr.supabase.co/storage/v1/object/public/mock-test-media/2026/test1/1.mp3',
          blanks30: blanksData.blanks30,
          blanks50: blanksData.blanks50,
          blanks100: blanksData.blanks100,
          tip: 'Luyện phản xạ nghe và phân biệt các bẫy phát âm đồng âm.'
        };

        lessonSentences.push(sentenceObj);

        flatQuestions.push({
          questionNumber: s,
          passageNumber: l,
          passageTitle: `Bài ${l}`,
          audioUrl: sentenceObj.audioUrl,
          transcript: sText,
          translation: sentenceObj.translation,
          dictationText: sText,
          blanks: blanksData.blanks50,
          explanation: sentenceObj.tip
        });
      }

      masterLessons.push({
        lessonNumber: l,
        lessonTitle: `Bài ${l}`,
        subTitle: `${m.title} (Câu ${startS} - ${endS})`,
        levelBadge: 'PRO',
        totalSentences: lessonSentences.length,
        sentences: lessonSentences
      });
    }

    await ListeningExercise.create({
      title: m.title,
      subTitle: `Bộ luyện tập chuyên sâu ${m.title}`,
      levelBadge: 'PRO',
      isPro: true,
      part: m.part,
      level: 4,
      mode: 'dictation',
      year: 'master',
      topic: m.title,
      totalQuestions: m.count,
      totalLessons: totalLessons,
      lessons: masterLessons,
      questions: flatQuestions
    });

    totalDocs++;
    totalSentences += m.count;
    console.log(`  👑 [TOEIC MASTER] ${m.title} (${m.count} câu)`);
  }

  console.log(`\n======================================================`);
  console.log(`🌟 HOÀN TẤT SEED TOÀN BỘ NGHE CHÉP CHÍNH TẢ!`);
  console.log(`📊 Tổng số bài tập Dictation đã lưu: ${totalDocs}`);
  console.log(`🎧 Tổng số câu chép chính tả đã lưu: ${totalSentences}`);
  console.log(`======================================================\n`);

  await mongoose.disconnect();
}

seedAllDictation()
  .then(() => process.exit(0))
  .catch(err => {
    console.error('❌ Lỗi seed dictation:', err);
    process.exit(1);
  });
