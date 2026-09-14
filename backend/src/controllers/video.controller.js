const VideoLesson = require('../models/VideoLesson');

// Get All Video Lessons
exports.getVideoLessons = async (req, res) => {
  try {
    const lessons = await VideoLesson.find();
    return res.status(200).json({ success: true, count: lessons.length, data: lessons });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Get Single Video Lesson by ID
exports.getVideoLessonById = async (req, res) => {
  try {
    const lesson = await VideoLesson.findById(req.params.id);
    if (!lesson) {
      return res.status(404).json({ success: false, message: 'Lesson not found' });
    }
    return res.status(200).json({ success: true, data: lesson });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
