const mongoose = require('mongoose');
const { MsEdgeTTS, OUTPUT_FORMAT } = require('msedge-tts');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config({ path: path.join(__dirname, '../../.env') });

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/tuong_tan_toeic';
const MEDIA_BASE_DIR = process.env.MEDIA_DIR || '/var/www/tuong-tan-toeic/media';

function stripHtml(html) {
  if (!html) return '';
  return html
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, ' ')
    .trim();
}

async function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function synthesizeTextToMp3(text, voiceName, outputPath, maxRetries = 4) {
  if (fs.existsSync(outputPath) && fs.statSync(outputPath).size > 1000) {
    return; // Already exists
  }

  const dir = path.dirname(outputPath);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      await delay(250); // Throttle socket requests
      const tts = new MsEdgeTTS();
      await tts.setMetadata(voiceName, OUTPUT_FORMAT.AUDIO_24KHZ_48KBITRATE_MONO_MP3);
      const { audioStream } = tts.toStream(text);

      await new Promise((resolve, reject) => {
        const writeStream = fs.createWriteStream(outputPath);
        const timeout = setTimeout(() => {
          writeStream.destroy();
          reject(new Error(`Timeout generating ${path.basename(outputPath)}`));
        }, 30000);

        audioStream.pipe(writeStream);
        writeStream.on('finish', () => {
          clearTimeout(timeout);
          resolve();
        });
        audioStream.on('error', (err) => {
          clearTimeout(timeout);
          writeStream.destroy();
          reject(err);
        });
      });

      console.log(`  [GEN] ${path.basename(outputPath)} (${fs.statSync(outputPath).size} bytes)`);
      return; // Success
    } catch (err) {
      console.warn(`    [RETRY ${attempt}/${maxRetries}] ${path.basename(outputPath)} failed: ${err.message}. Retrying in ${attempt * 1500}ms...`);
      if (fs.existsSync(outputPath)) {
        try { fs.unlinkSync(outputPath); } catch (_) {}
      }
      if (attempt === maxRetries) {
        throw err;
      }
      await delay(attempt * 1500);
    }
  }
}

async function processSingleTest(db, testDoc) {
  const match = testDoc.title.match(/Test (\d+)/i);
  if (!match) return;
  const testNum = parseInt(match[1]);
  const testDir = path.join(MEDIA_BASE_DIR, 'mocktests', `test${testNum}`);
  if (!fs.existsSync(testDir)) fs.mkdirSync(testDir, { recursive: true });

  console.log(`\n======================================================`);
  console.log(`[TEST ${testNum}] ${testDoc.title} -> ${testDir}`);
  console.log(`======================================================`);

  const questions = testDoc.questions || [];
  let updatedCount = 0;

  // 1. Part 1 (Q1 - Q6)
  for (let i = 0; i < 6; i++) {
    const q = questions[i];
    if (!q) continue;
    const qNum = q.questionNum || (i + 1);
    const opts = (q.options || []).map(o => {
      const cleanLabel = (o.label || '').replace(/[()]/g, '').trim();
      return `(${cleanLabel}) ${o.text || ''}`;
    }).join('. ');

    const speechText = `Number ${qNum}. Look at the picture marked number ${qNum} in your test book. ${opts}.`;
    const voice = i % 2 === 0 ? 'en-US-ChristopherNeural' : 'en-US-JennyNeural';
    const fileName = `q${qNum}.mp3`;
    const outPath = path.join(testDir, fileName);

    await synthesizeTextToMp3(speechText, voice, outPath);
    q.audioUrl = `https://toeic.danganhtuong.dev/media/mocktests/test${testNum}/${fileName}`;
    updatedCount++;
  }

  // 2. Part 2 (Q7 - Q31)
  for (let i = 6; i < 31; i++) {
    const q = questions[i];
    if (!q) continue;
    const qNum = q.questionNum || (i + 1);
    const cleanPrompt = stripHtml(q.prompt || '').replace(/^Câu\s+\d+[:.]?\s*/i, '');
    const opts = (q.options || []).map(o => {
      const cleanLabel = (o.label || '').replace(/[()]/g, '').trim();
      return `(${cleanLabel}) ${o.text || ''}`;
    }).join('. ');

    let prefix = `Number ${qNum}. `;
    if (qNum === 7) {
      prefix = `Part 2. Directions: You will hear a question or statement and three responses spoken in English. They will not be printed in your test book and will be spoken only one time. Select the best response to the question or statement and mark the letter (A), (B), or (C) on your answer sheet. Number 7. `;
    }

    const speechText = `${prefix}${cleanPrompt}? ${opts}.`;
    const voice = i % 2 === 0 ? 'en-US-ChristopherNeural' : 'en-US-JennyNeural';
    const fileName = `q${qNum}.mp3`;
    const outPath = path.join(testDir, fileName);

    await synthesizeTextToMp3(speechText, voice, outPath);
    q.audioUrl = `https://toeic.danganhtuong.dev/media/mocktests/test${testNum}/${fileName}`;
    updatedCount++;
  }

  // 3. Part 3 (Q32 - Q70 in groups of 3)
  for (let i = 31; i < 70; i += 3) {
    const groupQs = questions.slice(i, i + 3);
    const firstQ = groupQs[0];
    if (!firstQ) continue;
    const startQ = firstQ.questionNum || (i + 1);
    const endQ = (groupQs[groupQs.length - 1]?.questionNum) || (i + groupQs.length);

    const rawDialogue = firstQ.passageText || firstQ.transcript || '';
    const cleanDialogue = stripHtml(rawDialogue);

    let prefix = `Questions ${startQ} through ${endQ} refer to the following conversation. `;
    if (startQ === 32) {
      prefix = `Part 3. Directions: You will hear some conversations between two or more people. You will be asked to answer three questions about what the speakers say in each conversation. Select the best response to each question and mark the letter (A), (B), (C), or (D) on your answer sheet. The conversations will not be printed in your test book and will be spoken only one time. Questions 32 through 34 refer to the following conversation. `;
    }

    const speechText = `${prefix}${cleanDialogue}`;
    const voice = (i / 3) % 2 === 0 ? 'en-US-ChristopherNeural' : 'en-US-JennyNeural';
    const fileName = `p3_q${startQ}_${endQ}.mp3`;
    const outPath = path.join(testDir, fileName);

    await synthesizeTextToMp3(speechText, voice, outPath);
    const audioUrl = `https://toeic.danganhtuong.dev/media/mocktests/test${testNum}/${fileName}`;

    for (const q of groupQs) {
      q.audioUrl = audioUrl;
      updatedCount++;
    }
  }

  // 4. Part 4 (Q71 - Q100 in groups of 3)
  for (let i = 70; i < 100; i += 3) {
    const groupQs = questions.slice(i, i + 3);
    const firstQ = groupQs[0];
    if (!firstQ) continue;
    const startQ = firstQ.questionNum || (i + 1);
    const endQ = (groupQs[groupQs.length - 1]?.questionNum) || (i + groupQs.length);

    const rawTalk = firstQ.passageText || firstQ.transcript || '';
    const cleanTalk = stripHtml(rawTalk);

    let prefix = `Questions ${startQ} through ${endQ} refer to the following talk. `;
    if (startQ === 71) {
      prefix = `Part 4. Directions: You will hear some talks given by a single speaker. You will be asked to answer three questions about what the speaker says in each talk. Select the best response to each question and mark the letter (A), (B), (C), or (D) on your answer sheet. The talks will not be printed in your test book and will be spoken only one time. Questions 71 through 73 refer to the following talk. `;
    }

    const speechText = `${prefix}${cleanTalk}`;
    const voice = (i / 3) % 2 === 0 ? 'en-US-JennyNeural' : 'en-US-ChristopherNeural';
    const fileName = `p4_q${startQ}_${endQ}.mp3`;
    const outPath = path.join(testDir, fileName);

    await synthesizeTextToMp3(speechText, voice, outPath);
    const audioUrl = `https://toeic.danganhtuong.dev/media/mocktests/test${testNum}/${fileName}`;

    for (const q of groupQs) {
      q.audioUrl = audioUrl;
      updatedCount++;
    }
  }

  await db.collection('mocktests').updateOne(
    { _id: testDoc._id },
    { $set: { questions: questions } }
  );
  console.log(`[TEST ${testNum}] Saved ${updatedCount} listening questions to MongoDB!`);
}

async function run() {
  console.log('Connecting to MongoDB at:', MONGODB_URI);
  await mongoose.connect(MONGODB_URI);
  const db = mongoose.connection.db;

  const tests = await db.collection('mocktests').find({}).toArray();
  tests.sort((a, b) => {
    const na = parseInt(a.title.match(/Test (\d+)/)?.[1] || '0');
    const nb = parseInt(b.title.match(/Test (\d+)/)?.[1] || '0');
    return na - nb;
  });

  console.log(`Found ${tests.length} tests. Starting batch audio synthesis...`);
  for (const t of tests) {
    await processSingleTest(db, t);
  }

  console.log('\nALL 10 MOCK TESTS LISTENING AUDIO SYNTHESIZED AND SAVED SUCCESSFULLY!');
  process.exit(0);
}

run().catch((err) => {
  console.error('Fatal error in generateAllMockTestsMedia:', err);
  process.exit(1);
});
