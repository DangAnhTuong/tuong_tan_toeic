const express = require('express');
const router = express.Router();
const feedbackController = require('../controllers/feedback.controller');
const { optionalAuth, requireAdmin } = require('../middleware/authMiddleware');

router.post('/', optionalAuth, feedbackController.createFeedback);
router.get('/my-feedbacks', optionalAuth, feedbackController.getMyFeedbacks);
router.get('/all', optionalAuth, feedbackController.getAllFeedbacks);
router.put('/:id/reply', optionalAuth, feedbackController.replyFeedback);
router.delete('/:id', optionalAuth, feedbackController.deleteFeedback);

module.exports = router;
