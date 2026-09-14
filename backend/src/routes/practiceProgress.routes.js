const express = require('express');
const router = express.Router();
const practiceProgressController = require('../controllers/practiceProgress.controller');
const { optionalAuth } = require('../middleware/authMiddleware');

// All routes support optional auth (authenticated users or guest sessions)
router.use(optionalAuth);

// Save or update practice progress
router.post('/', practiceProgressController.savePracticeProgress);

// Get all practice progress for user
router.get('/', practiceProgressController.getUserPracticeProgress);

// Get single exercise progress
router.get('/:exerciseKey', practiceProgressController.getSinglePracticeProgress);

// Reset / delete exercise progress
router.delete('/:exerciseKey', practiceProgressController.resetPracticeProgress);

module.exports = router;
