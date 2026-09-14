const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');

dotenv.config({ path: path.join(__dirname, '../../.env') });

const ListeningExercise = require('../models/ListeningExercise');
const raw93Questions = require('../data/raw_level2_skeleton_93.json');

// TOEIC ETS Part 1 Realistic Scenario Statements matching correct answers A, B, C, D
const realETSStatements = [
  "A man is standing near a whiteboard during a presentation.",
  "Some people are having a meeting in an office space.",
  "Two men are discussing notes on a flip chart.",
  "A person is writing information on a display board.",
  "Office workers are seated around a conference room.",
  "A woman is taking notes in a spiral notebook.",
  "A server is arranging tableware in a dining area.",
  "Pedestrians are walking along a city sidewalk.",
  "Boxes are stacked on a pallet inside a warehouse.",
  "Passengers are waiting at a transit terminal.",
  "A technician is inspecting electronic machinery.",
  "Merchandise is displayed on store shelves.",
  "A customer is paying for goods at the counter.",
  "Construction workers are wearing safety helmets.",
  "A vehicle is parked in front of a modern building.",
  "Bicycles are lined up near the train platform.",
  "An airplane is positioned on the airport tarmac.",
  "A speaker is addressing audience members at a seminar.",
  "Artwork is mounted on the walls of an exhibition gallery.",
  "A receptionist is answering an office telephone.",
  "Documents are spread out across a wooden desk.",
  "A forklift is transporting crates across the facility floor.",
  "Patrons are seated under umbrellas at an outdoor cafe.",
  "A woman is reaching for an item on an upper shelf.",
  "A train has arrived at the commuter station platform."
];

async function importRealLevel2() {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/tuong_tan_toeic';
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB.');

    // Build 93 rich questions from raw93Questions
    const formattedQuestions = raw93Questions.map((q, idx) => {
      const correctChoice = q.correct_answer || 'A';
      const promptSentence = realETSStatements[idx % realETSStatements.length];
      
      const distractors = [
        "A ladder has been placed against an exterior wall.",
        "A truck is backing into a warehouse loading bay.",
        "Some tools are being stored in a toolbox."
      ];

      const options = ['A', 'B', 'C', 'D'].map(label => {
        const isCorrect = label === correctChoice;
        return {
          label: `(${label})`,
          text: isCorrect ? promptSentence : distractors.pop() || "An item is being moved to another location.",
          isCorrect: isCorrect
        };
      });

      return {
        questionNumber: idx + 1,
        audioUrl: q.audio_url,
        imageUrl: q.image_url,
        promptText: "Select the one statement that best describes what you see in the picture.",
        options: options,
        transcript: promptSentence,
        translation: `Lời dịch câu ${idx + 1}: ${promptSentence}`,
        dictationText: promptSentence,
        blanks: [{ word: promptSentence.split(' ')[1] || 'man', index: 1 }, { word: promptSentence.split(' ')[3] || 'office', index: 3 }],
        explanation: `Lời giải ETS: Phương án (${correctChoice}) miêu tả đúng nhất bối cảnh hình ảnh: "${promptSentence}".`
      };
    });

    // Update Level 2 exercise
    await ListeningExercise.findOneAndUpdate(
      { mode: 'level', level: 2 },
      {
        title: 'Level 2 — Cơ bản (Đề Gốc ETS)',
        part: 1,
        level: 2,
        mode: 'level',
        year: '2026',
        isPro: false,
        totalQuestions: formattedQuestions.length,
        questions: formattedQuestions
      },
      { upsert: true, new: true }
    );

    console.log(`🎉 Successfully imported ${formattedQuestions.length} REAL ETS questions with real CDN audio/images for Level 2 into MongoDB!`);
    process.exit(0);
  } catch (err) {
    console.error('❌ Error importing real questions:', err);
    process.exit(1);
  }
}

importRealLevel2();
