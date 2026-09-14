const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');

router.get('/profile', userController.getUserProfile);
router.put('/goal', userController.updateUserGoal);
router.put('/daily-goals', userController.updateDailyGoals);
router.post('/record-progress', userController.recordLearningProgress);
router.post('/record-practice-session', userController.recordPracticeSession);
router.post('/claim-share-reward', userController.claimShareReward);
router.get('/score-prediction', userController.getScorePrediction);
router.post('/sync-study-time', userController.syncStudyTime);

module.exports = router;
