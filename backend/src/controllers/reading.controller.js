const mongoose = require('mongoose');
const ReadingExercise = require('../models/ReadingExercise');

// Get All Reading Exercises with Filters + Pagination
exports.getReadingExercises = async (req, res) => {
  try {
    const { mode, part, level, topic, page = 1, limit = 20, full, includeQuestions } = req.query;
    let query = {};

    // Normalize part: frontend sends "5" but DB stores "Part 5"
    if (part) {
      const partNum = String(part).replace(/[^0-9]/g, '');
      query.part = `Part ${partNum}`;
    }

    // Normalize mode: 'grammar' stays grammar, 'bilingual' stays bilingual
    // For part-based mode: 'part5' -> query by part only (no mode filter)
    if (mode) {
      const modeMap = {
        'grammar': 'grammar',
        'bilingual': 'bilingual',
        'consolidated': 'consolidated',
        'level': 'level'
      };
      if (modeMap[mode]) query.mode = modeMap[mode];
      // if mode is 'part5'/'part6'/'part7', we use the part filter above instead
    }

    if (level !== undefined) query.level = Number(level);
    if (topic) query.topic = topic;

    const skip = (Number(page) - 1) * Number(limit);
    const total = await ReadingExercise.countDocuments(query);
    
    let queryBuilder = ReadingExercise.find(query).skip(skip).limit(Number(limit));
    if (full !== 'true' && includeQuestions !== 'true') {
      queryBuilder = queryBuilder.select('-questions'); // Exclude heavy questions in list view
    }

    const exercises = await queryBuilder;

    return res.status(200).json({
      success: true,
      count: exercises.length,
      total,
      page: Number(page),
      totalPages: Math.ceil(total / Number(limit)),
      data: exercises
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Get Single Reading Exercise (with full questions)
exports.getReadingExerciseById = async (req, res) => {
  try {
    const { id } = req.params;
    let exercise = null;

    if (mongoose.Types.ObjectId.isValid(id)) {
      exercise = await ReadingExercise.findById(id);
    }

    if (!exercise) {
      // Support slug format like "p5lv1", "p5lv2", "p5_lv2", "p6lv1", "part7_level3", etc.
      const match = id.match(/p(\d+)[-_]?lv(\d+)/i) || id.match(/part(\d+)[-_]?level(\d+)/i);
      if (match) {
        const partNum = match[1];
        const levelNum = parseInt(match[2], 10);
        exercise = await ReadingExercise.findOne({
          part: `Part ${partNum}`,
          level: levelNum,
          mode: 'level'
        });
      }
    }

    if (!exercise) {
      // Support topic slug like "p5topic_vocab", "p5topic_pos", "p5topic_verb", "p5topic_advanced"
      if (id.startsWith('p5topic_') || id.includes('topic_')) {
        exercise = await ReadingExercise.findOne({
          part: 'Part 5',
          slug: id,
          'questions.0': { $exists: true }
        });

        if (!exercise) {
          const topicKey = id.replace(/^p\d+topic_/, '').replace(/^topic_/, '').toLowerCase();
          const topicMap = {
            'vocab': /^từ vựng/i,
            'pos': /^từ loại/i,
            'verb': /động từ/i,
            'advanced': /nâng cao/i
          };
          const topicRegex = topicMap[topicKey] || new RegExp(topicKey, 'i');
          exercise = await ReadingExercise.findOne({
            part: 'Part 5',
            'questions.0': { $exists: true },
            $or: [
              { topic: topicRegex },
              { title: topicRegex }
            ]
          });
        }
      }
    }

    if (!exercise && req.query.topic) {
      const partNum = req.query.part ? String(req.query.part).replace(/[^0-9]/g, '') : '5';
      exercise = await ReadingExercise.findOne({
        part: `Part ${partNum}`,
        'questions.0': { $exists: true },
        $or: [
          { slug: id },
          { topic: new RegExp(req.query.topic, 'i') },
          { title: new RegExp(req.query.topic, 'i') }
        ]
      });
    }

    if (!exercise) {
      exercise = await ReadingExercise.findOne({
        $or: [
          { slug: id },
          { topic: id },
          { title: new RegExp(`^${id}`, 'i') },
          { topic: new RegExp(id, 'i') }
        ]
      });
    }

    if (!exercise) {
      return res.status(404).json({ success: false, message: 'Exercise not found' });
    }
    return res.status(200).json({ success: true, data: exercise });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

