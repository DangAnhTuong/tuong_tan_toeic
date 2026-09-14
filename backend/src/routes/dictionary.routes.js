const express = require('express');
const router = express.Router();
const dictionaryController = require('../controllers/dictionary.controller');

// Public lookup route (0đ cost, cached)
router.get('/lookup', dictionaryController.lookupWord);

module.exports = router;
