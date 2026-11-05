const SpeakingExercise = require('../models/SpeakingExercise');

// Get speaking prompts / cards by part and level
exports.getSpeakingPrompts = async (req, res) => {
  try {
    const { part, level, topic } = req.query;
    const query = {};
    if (part) query.part = Number(part);
    if (level && level !== 'all') query.level = level;
    if (topic && topic !== 'all') query.topic = topic;

    const exercises = await SpeakingExercise.find(query).sort({ code: 1 });
    return res.status(200).json({
      success: true,
      count: exercises.length,
      data: exercises
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Get single speaking exercise by ID or code
exports.getSpeakingExerciseById = async (req, res) => {
  try {
    const { id } = req.params;
    const exercise = await SpeakingExercise.findOne({
      $or: [{ _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }, { dauId: id }, { code: id }]
    });
    if (!exercise) {
      return res.status(404).json({ success: false, message: 'Speaking exercise not found' });
    }
    return res.status(200).json({ success: true, data: exercise });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Evaluate speaking audio transcript using ETS Rubric (0 - 200)
exports.evaluateSpeaking = async (req, res) => {
  try {
    const { part, userTranscript, targetText, durationSeconds } = req.body;
    const cleanTranscript = (userTranscript || '').trim();

    if (!cleanTranscript) {
      return res.status(400).json({
        success: false,
        message: 'Không nhận được dữ liệu giọng nói. Vui lòng thử nói lại.'
      });
    }

    const words = cleanTranscript.split(/\s+/).filter(Boolean);
    const wordCount = words.length;

    // ETS Rubric scoring approximation
    let pronunciationScore = 80;
    let fluencyScore = 80;
    let grammarScore = 80;
    let vocabularyScore = 80;

    if (part === 1 && targetText) {
      // Compare transcript words with target text
      const targetWords = targetText.toLowerCase().replace(/[^a-z0-9\s]/g, '').split(/\s+/).filter(Boolean);
      const userWords = cleanTranscript.toLowerCase().replace(/[^a-z0-9\s]/g, '').split(/\s+/).filter(Boolean);
      
      let matchedCount = 0;
      targetWords.forEach(tw => {
        if (userWords.includes(tw)) matchedCount++;
      });
      const matchRate = targetWords.length > 0 ? (matchedCount / targetWords.length) : 1;
      pronunciationScore = Math.round(matchRate * 100);
      fluencyScore = wordCount > 20 ? 90 : Math.round((wordCount / 25) * 90);
    } else {
      // Open response parts 2, 3, 4, 5
      fluencyScore = Math.min(100, Math.round((wordCount / 35) * 95));
      pronunciationScore = 85;
      vocabularyScore = Math.min(100, Math.round(new Set(words).size / wordCount * 100) + 10);
    }

    const overallScore = Math.min(200, Math.max(10, Math.round(((pronunciationScore + fluencyScore + grammarScore + vocabularyScore) / 4) * 2)));

    return res.status(200).json({
      success: true,
      data: {
        score: overallScore,
        maxScore: 200,
        subScores: {
          pronunciation: pronunciationScore,
          fluency: fluencyScore,
          grammar: grammarScore,
          vocabulary: vocabularyScore
        },
        wordCount,
        durationSeconds: durationSeconds || 0,
        transcript: cleanTranscript,
        feedback: [
          overallScore >= 160 ? '🌟 Phát âm rõ ràng, tốc độ nói tự nhiên đạt chuẩn ETS Level 7-8.' :
          overallScore >= 120 ? '👍 Phản xạ tốt, cần chú ý nối âm và ngữ điệu câu hỏi.' :
          '💡 Nên luyện đọc chậm lại, ngắt nghỉ đúng cụm nghĩa và phát âm rõ âm đuôi /s/, /ed/.'
        ]
      }
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
