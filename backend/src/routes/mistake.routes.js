const express = require('express');
const router = express.Router();
const mistakeController = require('../controllers/mistake.controller');
const { optionalAuth } = require('../middleware/authMiddleware');

router.post('/', optionalAuth, mistakeController.recordMistake);
router.post('/record', optionalAuth, mistakeController.recordMistake);
router.get('/', optionalAuth, mistakeController.getMistakes);
router.get('/stats', optionalAuth, mistakeController.getMistakeStats);
router.put('/:id/master', optionalAuth, mistakeController.markMastered);
router.delete('/:id', optionalAuth, mistakeController.deleteMistake);

module.exports = router;

