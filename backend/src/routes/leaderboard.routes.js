const express = require('express');
const router = express.Router();
const leaderboardController = require('../controllers/leaderboard.controller');

router.get('/', leaderboardController.getLeaderboard);
router.get('/rankings', leaderboardController.getLeaderboard);

module.exports = router;
