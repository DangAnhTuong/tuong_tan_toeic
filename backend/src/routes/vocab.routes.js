const express = require('express');
const router = express.Router();
const vocabController = require('../controllers/vocab.controller');
const { optionalAuth } = require('../middleware/authMiddleware');

router.get('/topics', optionalAuth, vocabController.getVocabTopics);
router.get('/topics/:id', optionalAuth, vocabController.getVocabTopicById);
router.get('/due-reviews', optionalAuth, vocabController.getDueReviewWords);
router.get('/due-count', optionalAuth, vocabController.getDueReviewWords);
router.get('/user-summary', optionalAuth, vocabController.getUserVocabSummary);
router.get('/summary', optionalAuth, vocabController.getUserVocabSummary);
router.post('/rate', optionalAuth, vocabController.rateVocabWord);
router.post('/basket', optionalAuth, vocabController.addToBasket);
router.get('/basket', optionalAuth, vocabController.getBasketWords);
router.delete('/basket/:word', optionalAuth, vocabController.removeFromBasket);
router.get('/my-words', optionalAuth, vocabController.getMyWords);
router.get('/decks', optionalAuth, vocabController.getUserDecks);
router.delete('/decks/:deckName', optionalAuth, vocabController.deleteDeck);
router.post('/scan-image', optionalAuth, vocabController.scanVocabImage);
router.post('/custom-topic', optionalAuth, vocabController.createCustomTopic);

module.exports = router;

