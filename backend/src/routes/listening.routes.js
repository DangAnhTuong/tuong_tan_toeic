const express = require('express');
const router = express.Router();
const listeningController = require('../controllers/listening.controller');

router.get('/exercises', listeningController.getListeningExercises);
router.get('/exercises/:id', listeningController.getExerciseById);

module.exports = router;
