const express = require('express');
const router = express.Router();
const videoController = require('../controllers/video.controller');

router.get('/lessons', videoController.getVideoLessons);
router.get('/lessons/:id', videoController.getVideoLessonById);

module.exports = router;
