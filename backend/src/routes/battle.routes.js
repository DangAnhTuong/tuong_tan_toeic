const express = require('express');
const router = express.Router();
const battleController = require('../controllers/battle.controller');
const { optionalAuth } = require('../middleware/authMiddleware');

router.get('/arena-info', optionalAuth, battleController.getBattleArenaInfo);
router.post('/matchmake', optionalAuth, battleController.matchmakeBattle);
router.post('/finish', optionalAuth, battleController.finishBattle);

module.exports = router;
