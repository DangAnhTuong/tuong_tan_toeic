const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chat.controller');
const { optionalAuth, requireAuth } = require('../middleware/authMiddleware');

const ADMIN_EMAILS = ['danganhtuongg@gmail.com', 'admin@tuongtan.toeic'];

// Custom middleware for Admin verification
const verifyAdminAccess = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: '⚠️ Vui lòng đăng nhập để truy cập hòm thư quản trị.'
    });
  }

  const isAdmin = req.user.role === 'admin' || 
    (req.user.email && ADMIN_EMAILS.includes(req.user.email.toLowerCase().trim()));

  if (!isAdmin) {
    return res.status(403).json({
      success: false,
      message: '⛔ Bạn không có quyền quản trị.'
    });
  }
  next();
};

// 1. Send message (User or Admin)
router.post('/send', optionalAuth, chatController.sendMessage);

// 2. Admin: Get all student conversations (Grouped & Sorted)
router.get('/admin/conversations', requireAuth, verifyAdminAccess, chatController.getAdminConversations);

// 3. Admin: Delete conversation
router.delete('/admin/conversation/:conversationId', requireAuth, verifyAdminAccess, chatController.deleteConversation);

// 4. Get conversation messages by conversationId (Admin or Student)
router.get('/conversation/:conversationId', optionalAuth, chatController.getConversationMessages);

// 5. Student: Get own messages
router.get('/my-messages', optionalAuth, chatController.getMyMessages);

module.exports = router;
