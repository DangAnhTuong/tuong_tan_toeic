const express = require('express');
const router = express.Router();
const audioController = require('../controllers/audio.controller');

// GET /api/v1/audio/tts?text=...&accent=us
router.get('/tts', audioController.getSpeechAudio);

module.exports = router;
