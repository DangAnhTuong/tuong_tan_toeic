const mongoose = require('mongoose');
const ListeningExercise = require('../models/ListeningExercise');
const { extractVocabFromStatements, formatPart1Statement } = require('./part1VocabDict');
const { translatePart1Statement, generatePart1Explanation } = require('./part1Translator');

async function enrichAllPart1Questions() {
  await mongoose.connect('mongodb://127.0.0.1:27017/tuong_tan_toeic');
  console.log('🚀 Connected to MongoDB. Starting Part 1 data auto-healing & enrichment...');

  const part1Exercises = await ListeningExercise.find({ part: 1 });
  console.log(`Found ${part1Exercises.length} Part 1 exercise documents.`);

  let totalQuestionsProcessed = 0;
  let transcriptsFixed = 0;
  let translationsFixed = 0;
  let optionTranslationsFixed = 0;
  let vocabListsEnriched = 0;
  let explanationsEnriched = 0;

  for (const doc of part1Exercises) {
    let docModified = false;
    console.log(`\nProcessing doc: [${doc.mode}] "${doc.title}" (topic: "${doc.topic}") with ${doc.questions.length} questions...`);

    for (let i = 0; i < doc.questions.length; i++) {
      const q = doc.questions[i];
      totalQuestionsProcessed++;

      // 1. Ensure 4 standard options with clean labels
      const labels = ['(A)', '(B)', '(C)', '(D)'];
      if (!q.options || q.options.length === 0) {
        // Try parsing from transcript or create standard options
        if (q.transcript && q.transcript.includes('(A)')) {
          const rawLines = q.transcript.split(/\n/);
          q.options = labels.map((lbl, idx) => {
            const line = rawLines.find(l => l.trim().startsWith(lbl)) || '';
            const text = formatPart1Statement(line) || `Statement ${lbl}`;
            return {
              label: lbl,
              text: text,
              translation: translatePart1Statement(text),
              isCorrect: idx === 0
            };
          });
        } else {
          q.options = labels.map((lbl, idx) => ({
            label: lbl,
            text: q.dictationText || `Statement ${lbl}`,
            translation: q.translation || `Phương án ${lbl}`,
            isCorrect: idx === 0
          }));
        }
        docModified = true;
      }

      // 2. Extract clean English statements from options or transcript
      const statementTexts = [];
      q.options.forEach((opt, optIdx) => {
        if (!opt.label) opt.label = labels[optIdx] || `(${String.fromCharCode(65 + optIdx)})`;
        opt.label = opt.label.trim();
        if (!opt.label.startsWith('(')) opt.label = `(${opt.label})`;

        // Clean HTML or prefixes
        let cleanText = (opt.text || '').replace(/<[^>]*>?/gm, '').trim();
        cleanText = formatPart1Statement(cleanText);
        if (!cleanText || cleanText.length < 3) {
          const transcriptLines = (q.transcript || '').replace(/<[^>]*>?/gm, '').split(/\n/);
          const matchedLine = transcriptLines.find(l => l.includes(opt.label));
          if (matchedLine) {
            cleanText = formatPart1Statement(matchedLine);
          }
        }
        opt.text = cleanText || `Statement ${opt.label}`;
        statementTexts.push(opt.text);

        // Translate option if empty, placeholder, or invalid
        const isBadOptTrans = !opt.translation || opt.translation.length < 2 || opt.translation.includes('Bản dịch') || opt.translation.includes('Phương án');
        if (isBadOptTrans) {
          opt.translation = translatePart1Statement(opt.text) || `Bản dịch phương án ${opt.label}`;
          optionTranslationsFixed++;
          docModified = true;
        }
      });

      // Ensure at least 1 option is marked correct
      const hasCorrect = q.options.some(o => o.isCorrect);
      if (!hasCorrect && q.options.length > 0) {
        q.options[0].isCorrect = true;
      }

      // 3. Fix / Reconstruct Transcript (4 Clean Lines)
      const cleanTranscriptLines = q.options.map(opt => `${opt.label} ${opt.text}`);
      const expectedTranscript = cleanTranscriptLines.join('\n');
      const isBadTranscript = !q.transcript || q.transcript.startsWith('Câu') || q.transcript.length < 10 || q.transcript.includes('<p>') || q.transcript.includes('<br />');

      if (isBadTranscript || q.transcript !== expectedTranscript) {
        q.transcript = expectedTranscript || '(A) A statement is being read.';
        transcriptsFixed++;
        docModified = true;
      }

      // 4. Fix / Reconstruct Translation (4 Clean Lines)
      const cleanTranslationLines = q.options.map(opt => `${opt.label} ${opt.translation || translatePart1Statement(opt.text)}`);
      const expectedTranslation = cleanTranslationLines.join('\n');
      const isBadTranslation = !q.translation || q.translation.includes('Bản dịch 4 phương án') || q.translation.length < 10;

      if (isBadTranslation || !q.translation.includes('(A)')) {
        q.translation = expectedTranslation || '(A) Một phương án đang được đọc.';
        translationsFixed++;
        docModified = true;
      }

      // 5. Prompt Text & Prompt Translation
      q.promptText = q.promptText || 'Listen to the 4 statements and choose the one that best describes the picture.';
      q.promptTranslation = 'Lắng nghe 4 phương án và chọn câu miêu tả đúng nhất nội dung trong tranh.';

      // 6. Dictation Text (Must NEVER be empty)
      const correctOpt = q.options.find(o => o.isCorrect) || q.options[0];
      q.dictationText = (correctOpt ? `${correctOpt.label} ${correctOpt.text}` : q.transcript) || '(A) Statement';

      // 7. Enrich Vocabulary List (Always ensure 2 to 4 rich CEFR items)
      const currentVocabValid = q.vocabularyList && q.vocabularyList.length >= 2 && q.vocabularyList.every(v => v.word && v.meaning && v.ipaUS);
      if (!currentVocabValid) {
        q.vocabularyList = extractVocabFromStatements(statementTexts);
        vocabListsEnriched++;
        docModified = true;
      }

      // 8. Generate Detailed Explanation & Trap Analysis (Clean Unicode, no raw Markdown/LaTeX)
      const correctLabel = correctOpt?.label || '(A)';
      q.explanation = generatePart1Explanation(q.options, correctLabel);
      explanationsEnriched++;
      docModified = true;
    }

    if (docModified) {
      doc.markModified('questions');
      await doc.save();
      console.log(`✅ Saved updated doc: "${doc.title}"`);
    }
  }

  console.log('\n======================================================');
  console.log('🎉 PART 1 ENRICHMENT & AUTO-HEALING COMPLETED!');
  console.log(`Total questions processed: ${totalQuestionsProcessed}`);
  console.log(`Transcripts reconstructed: ${transcriptsFixed}`);
  console.log(`Translations healed: ${translationsFixed}`);
  console.log(`Option-by-Option translations healed: ${optionTranslationsFixed}`);
  console.log(`Vocabulary lists enriched: ${vocabListsEnriched}`);
  console.log(`Explanations generated: ${explanationsEnriched}`);
  console.log('======================================================\n');

  process.exit(0);
}

enrichAllPart1Questions().catch(err => {
  console.error('Error enriching Part 1:', err);
  process.exit(1);
});
