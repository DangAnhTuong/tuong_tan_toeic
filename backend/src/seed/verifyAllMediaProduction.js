/**
 * Verification Script: Full Audit of All Media (Audio & Images) across All 10 Mock Tests & Modules
 * Checks MongoDB database records and physical files on disk.
 */
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/tuong_tan_toeic';
const MEDIA_DIR = process.env.MEDIA_DIR || '/var/www/tuong-tan-toeic/media';

async function runAudit() {
  console.log('Connecting to MongoDB at:', MONGO_URI);
  await mongoose.connect(MONGO_URI);
  console.log('Connected successfully.\n');

  const MockTest = mongoose.model('MockTest', new mongoose.Schema({}, { strict: false }));
  const tests = await MockTest.find({}).sort({ testNumber: 1 }).lean();

  console.log(`Found ${tests.length} Mock Tests in MongoDB.\n`);

  let totalListeningQuestions = 0;
  let totalSupabaseAudioRemaining = 0;
  let totalLocalAudioAssigned = 0;
  let totalPart1Photos = 0;
  let totalPart1PhotosLocal = 0;
  let totalGraphics = 0;
  let totalGraphicsLocal = 0;

  for (const test of tests) {
    const tNumMatch = (test.title || '').match(/Test (\d+)/i);
    const tNum = test.testNumber || (tNumMatch ? parseInt(tNumMatch[1]) : 0);
    const questions = test.questions || [];
    const listeningQuestions = questions.filter(q => q.part >= 1 && q.part <= 4);
    totalListeningQuestions += listeningQuestions.length;

    let supabaseAudios = 0;
    let localAudios = 0;
    let missingAudio = 0;

    for (const q of listeningQuestions) {
      if (!q.audioUrl) {
        missingAudio++;
      } else if (q.audioUrl.includes('supabase.co')) {
        supabaseAudios++;
        totalSupabaseAudioRemaining++;
      } else if (q.audioUrl.includes('/media/mocktests/')) {
        localAudios++;
        totalLocalAudioAssigned++;
      }
    }

    const part1Questions = questions.filter(q => q.part === 1);
    let part1LocalPhotos = 0;
    for (const q of part1Questions) {
      totalPart1Photos++;
      if (q.imageUrl && q.imageUrl.includes('/media/mocktests/test')) {
        part1LocalPhotos++;
        totalPart1PhotosLocal++;
      }
    }

    const graphicQuestions = questions.filter(q => q.part >= 3 && q.imageUrl && q.imageUrl.includes('/graphics/'));
    totalGraphics += graphicQuestions.length;
    totalGraphicsLocal += graphicQuestions.length;

    // Check disk files
    const testDir = path.join(MEDIA_DIR, 'mocktests', `test${tNum}`);
    let fileCount = 0;
    if (fs.existsSync(testDir)) {
      fileCount = fs.readdirSync(testDir).length;
    }

    console.log(`[TEST ${tNum}] "${test.title}"`);
    console.log(`  - Total Questions: ${questions.length}`);
    console.log(`  - Listening Questions: ${listeningQuestions.length}`);
    console.log(`  - Local Audio Assigned: ${localAudios}/${listeningQuestions.length}`);
    console.log(`  - Supabase Audio Remaining: ${supabaseAudios}`);
    console.log(`  - Part 1 Local Photos: ${part1LocalPhotos}/${part1Questions.length}`);
    console.log(`  - Graphic Questions: ${graphicQuestions.length}`);
    console.log(`  - Disk Files in test${tNum}: ${fileCount} files`);
    console.log('------------------------------------------------------');
  }

  // Check Graphic SVGs on disk
  const graphicsDir = path.join(MEDIA_DIR, 'mocktests', 'graphics');
  const graphicFiles = fs.existsSync(graphicsDir) ? fs.readdirSync(graphicsDir) : [];
  console.log(`\nGraphics SVGs on disk (${graphicFiles.length} files):`, graphicFiles.join(', '));

  // Check Listening Part 1 photos
  const listeningPart1Dir = path.join(MEDIA_DIR, 'listening', 'part1');
  const listeningPart1Files = fs.existsSync(listeningPart1Dir) ? fs.readdirSync(listeningPart1Dir) : [];
  console.log(`Listening Part 1 Photos on disk: ${listeningPart1Files.length} photos.`);

  console.log('\n======================================================');
  console.log('FINAL AUDIT SUMMARY:');
  console.log(`  - Total Tests: ${tests.length}`);
  console.log(`  - Total Listening Questions: ${totalListeningQuestions}`);
  console.log(`  - Local Media Audios: ${totalLocalAudioAssigned}/${totalListeningQuestions} (${((totalLocalAudioAssigned / totalListeningQuestions) * 100).toFixed(1)}%)`);
  console.log(`  - Supabase Audios Remaining: ${totalSupabaseAudioRemaining} (Target: 0)`);
  console.log(`  - Part 1 Local Photos: ${totalPart1PhotosLocal}/${totalPart1Photos} (${((totalPart1PhotosLocal / totalPart1Photos) * 100).toFixed(1)}%)`);
  console.log(`  - Graphic Diagrams: ${totalGraphicsLocal} questions with vector SVGs`);
  console.log('======================================================');

  await mongoose.disconnect();
  process.exit(totalSupabaseAudioRemaining === 0 ? 0 : 1);
}

runAudit().catch(err => {
  console.error('Audit Error:', err);
  process.exit(1);
});
