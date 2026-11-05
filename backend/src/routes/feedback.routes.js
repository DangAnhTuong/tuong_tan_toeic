const express = require('express');
const router = express.Router();
const feedbackController = require('../controllers/feedback.controller');
const { optionalAuth, requireAuth, requireAdmin } = require('../middleware/authMiddleware');

router.post('/', optionalAuth, feedbackController.createFeedback);
router.get('/my-feedbacks', optionalAuth, feedbackController.getMyFeedbacks);
router.get('/all', requireAuth, requireAdmin, feedbackController.getAllFeedbacks);
router.put('/:id/reply', requireAuth, requireAdmin, feedbackController.replyFeedback);
router.delete('/:id', requireAuth, requireAdmin, feedbackController.deleteFeedback);

module.exports = router;
