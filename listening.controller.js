const ListeningExercise = require('../models/ListeningExercise');
const seedListeningData = require('../seed/listeningData');

// Get all listening exercises filtered by mode, part, level, year
exports.getListeningExercises = async (req, res) => {
  try {
    const { mode = 'level', part = 1, level, year, topic } = req.query;
    
    let filter = { mode: mode };
    if (part) filter.part = Number(part);
    if (level) filter.level = Number(level);
    if (year) filter.year = year;
    if (topic) filter.topic = topic;

    let exercises = [];
    try {
      exercises = await ListeningExercise.find(filter);
    } catch (dbErr) {
      console.warn("MongoDB query failed, using in-memory seed fallback:", dbErr.message);
    }

    // Fallback to in-memory seed data if database is empty or not connected
    if (!exercises || exercises.length === 0) {
      exercises = seedListeningData.filter(item => {
        let match = item.mode === mode;
        if (part) match = match && item.part === Number(part);
        if (level) match = match && item.level === Number(level);
        if (year) match = match && item.year === year;
        return match;
      });
    }

    return res.status(200).json({
      success: true,
      count: exercises.length,
      data: exercises
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get single exercise by ID or seed index
exports.getExerciseById = async (req, res) => {
  try {
    const { id } = req.params;
    let exercise = null;

    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      exercise = await ListeningExercise.findById(id);
    }
    if (!exercise) {
      exercise = await ListeningExercise.findOne({ _id: id });
    }

    if (!exercise) {
      // Find in seed data by title or index
      exercise = seedListeningData.find(item => item.title.toLowerCase().includes(id.toLowerCase())) || seedListeningData[0];
    }

    return res.status(200).json({
      success: true,
      data: exercise
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
