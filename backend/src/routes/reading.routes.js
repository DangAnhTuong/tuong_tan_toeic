const express = require('express');
const router = express.Router();
const readingController = require('../controllers/reading.controller');

router.get('/exercises', readingController.getReadingExercises);
router.get('/exercises/:id', readingController.getReadingExerciseById);

module.exports = router;
