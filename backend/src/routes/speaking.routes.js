const express = require('express');
const router = express.Router();
const speakingController = require('../controllers/speaking.controller');

router.get('/prompts', speakingController.getSpeakingPrompts);
router.post('/evaluate', speakingController.evaluateSpeaking);

module.exports = router;
