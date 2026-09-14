const express = require('express');
const router = express.Router();
const writingController = require('../controllers/writing.controller');

router.get('/exercises', writingController.getWritingExercises);
router.get('/exercises/:id', writingController.getWritingExerciseById);
router.post('/grade', writingController.gradeWritingSubmission);

module.exports = router;
