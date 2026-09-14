const express = require('express');
const router = express.Router();
const mocktestController = require('../controllers/mocktest.controller');

const { optionalAuth } = require('../middleware/authMiddleware');

router.get('/tests', mocktestController.getMockTests);
router.get('/tests/:id', mocktestController.getMockTestById);
router.post('/submit', optionalAuth, mocktestController.submitMockTest);

module.exports = router;
