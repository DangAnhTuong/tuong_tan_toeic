const express = require('express');
const router = express.Router();
const dictionaryController = require('../controllers/dictionary.controller');

// Public lookup route (0đ cost, cached)
router.get('/lookup', dictionaryController.lookupWord);

// 2-Way Text Translation routes (VI <-> EN, Free Zero-Cost)
router.get('/translate', dictionaryController.translateText);
router.post('/translate', dictionaryController.translateText);

module.exports = router;
