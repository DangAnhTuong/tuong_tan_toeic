const ChatMessage = require('../models/ChatMessage');
const User = require('../models/User');
const { sanitizeAttachments } = require('../utils/securitySanitizer');

const ADMIN_EMAILS = ['danganhtuongg@gmail.com', 'admin@tuongtan.toeic'];

// Helper to determine if user is admin
function checkIsAdmin(user) {
  if (!user) return false;
  if (user.role === 'admin') return true;
  if (user.email && ADMIN_EMAILS.includes(user.email.toLowerCase().trim())) return true;
  return false;
}

/**
 * @desc   Send a chat message (2-way: Student <-> Admin)
 * @route  POST /api/v1/chat/send
 * @access Public / Private (Auth optional)
 */
exports.sendMessage = async (req, res) => {
  try {
    const { text, attachments = [], recipientEmail = '' } = req.body;
    let { conversationId, senderName, senderEmail } = req.body;

    if (!text || !text.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Nội dung tin nhắn không được để trống.'
      });
    }

    const user = req.user;
    const isAdmin = checkIsAdmin(user);

    let senderRole = 'user';
    let senderId = null;

    if (user) {
      senderId = user._id;
      senderEmail = user.email || senderEmail || '';
      senderName = user.fullName || user.name || senderName || 'Học viên';
      if (isAdmin) {
        senderRole = 'admin';
        senderName = user.fullName || 'Admin Tường Tận TOEIC';
      }
    } else {
      senderRole = 'user';
      senderName = senderName?.trim() || 'Khách vãng lai';
      senderEmail = senderEmail?.trim().toLowerCase() || '';
    }

    // Determine conversationId
    if (!conversationId) {
      if (isAdmin) {
        if (recipientEmail) {
          conversationId = `conv_${recipientEmail.toLowerCase().trim()}`;
        } else {
          return res.status(400).json({
            success: false,
            message: 'Admin cần cung cấp conversationId hoặc recipientEmail.'
          });
        }
      } else {
        const identifier = senderEmail ? senderEmail.toLowerCase().trim() : (senderId ? senderId.toString() : 'guest_' + Date.now());
        conversationId = `conv_${identifier}`;
      }
    }

    const message = await ChatMessage.create({
      conversationId,
      senderId,
      senderName,
      senderEmail,
      senderRole,
      recipientEmail: recipientEmail ? recipientEmail.toLowerCase().trim() : '',
      text: text.trim(),
      attachments: sanitizeAttachments(attachments),
      isReadByAdmin: senderRole === 'admin',
      isReadByUser: senderRole === 'user'
    });

    return res.status(201).json({
      success: true,
      message: 'Tin nhắn đã được gửi thành công.',
      data: message
    });
  } catch (error) {
    console.error('Chat sendMessage Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi máy chủ khi gửi tin nhắn.',
      error: error.message
    });
  }
};

/**
 * @desc   Get all conversations for Admin (Grouped by student)
 * @route  GET /api/v1/chat/admin/conversations
 * @access Admin only
 */
exports.getAdminConversations = async (req, res) => {
  try {
    const { search = '', filter = 'all' } = req.query;

    const pipeline = [
      { $sort: { createdAt: 1 } },
      {
        $group: {
          _id: "$conversationId",
          conversationId: { $first: "$conversationId" },
          lastMessage: { $last: "$text" },
          lastMessageAt: { $last: "$createdAt" },
          lastSenderRole: { $last: "$senderRole" },
          lastSenderName: { $last: "$senderName" },
          totalMessages: { $sum: 1 },
          unreadCount: {
            $sum: {
              $cond: [
                { $and: [{ $eq: ["$senderRole", "user"] }, { $eq: ["$isReadByAdmin", false] }] },
                1,
                0
              ]
            }
          },
          // Find student email and name from user messages
          allUserEmails: {
            $push: {
              $cond: [{ $eq: ["$senderRole", "user"] }, "$senderEmail", "$recipientEmail"]
            }
          },
          allUserNames: {
            $push: {
              $cond: [{ $eq: ["$senderRole", "user"] }, "$senderName", null]
            }
          }
        }
      },
      {
        $project: {
          conversationId: 1,
          lastMessage: 1,
          lastMessageAt: 1,
          lastSenderRole: 1,
          lastSenderName: 1,
          totalMessages: 1,
          unreadCount: 1,
          studentEmail: {
            $reduce: {
              input: "$allUserEmails",
              initialValue: "",
              in: { $cond: [{ $ne: ["$$this", ""] }, "$$this", "$$value"] }
            }
          },
          studentName: {
            $reduce: {
              input: "$allUserNames",
              initialValue: "Học viên",
              in: { $cond: [{ $ne: ["$$this", null] }, "$$this", "$$value"] }
            }
          }
        }
      },
      { $sort: { lastMessageAt: -1 } }
    ];

    let conversations = await ChatMessage.aggregate(pipeline);

    // Apply search query
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      conversations = conversations.filter(c => 
        (c.studentName && c.studentName.toLowerCase().includes(q)) ||
        (c.studentEmail && c.studentEmail.toLowerCase().includes(q)) ||
        (c.lastMessage && c.lastMessage.toLowerCase().includes(q))
      );
    }

    // Apply filter
    if (filter === 'unread') {
      conversations = conversations.filter(c => c.unreadCount > 0);
    } else if (filter === 'replied') {
      conversations = conversations.filter(c => c.lastSenderRole === 'admin');
    }

    const totalUnread = conversations.reduce((sum, c) => sum + (c.unreadCount || 0), 0);

    return res.status(200).json({
      success: true,
      count: conversations.length,
      totalUnread,
      data: conversations
    });
  } catch (error) {
    console.error('Chat getAdminConversations Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi máy chủ khi lấy danh sách cuộc trò chuyện.',
      error: error.message
    });
  }
};

/**
 * @desc   Get messages for a specific conversation (Admin & Student)
 * @route  GET /api/v1/chat/conversation/:conversationId
 * @access Public / Private
 */
exports.getConversationMessages = async (req, res) => {
  try {
    const { conversationId } = req.params;
    if (!conversationId) {
      return res.status(400).json({
        success: false,
        message: 'Thiếu mã cuộc hội thoại (conversationId).'
      });
    }

    const messages = await ChatMessage.find({ conversationId })
      .sort({ createdAt: 1 })
      .limit(200);

    // Mark as read based on who is viewing
    const user = req.user;
    const isAdmin = checkIsAdmin(user);

    if (isAdmin) {
      await ChatMessage.updateMany(
        { conversationId, senderRole: 'user', isReadByAdmin: false },
        { $set: { isReadByAdmin: true } }
      );
    } else {
      await ChatMessage.updateMany(
        { conversationId, senderRole: 'admin', isReadByUser: false },
        { $set: { isReadByUser: true } }
      );
    }

    return res.status(200).json({
      success: true,
      count: messages.length,
      data: messages
    });
  } catch (error) {
    console.error('Chat getConversationMessages Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi máy chủ khi lấy lịch sử tin nhắn.',
      error: error.message
    });
  }
};

/**
 * @desc   Get student's own conversation with Admin
 * @route  GET /api/v1/chat/my-messages
 * @access Public / Private
 */
exports.getMyMessages = async (req, res) => {
  try {
    const user = req.user;
    const email = user?.email || req.query.email;
    const guestId = req.query.guestId;

    let conversationId = '';
    if (email) {
      conversationId = `conv_${email.toLowerCase().trim()}`;
    } else if (user?._id) {
      conversationId = `conv_${user._id.toString()}`;
    } else if (guestId) {
      conversationId = `conv_${guestId.trim()}`;
    }

    if (!conversationId) {
      return res.status(200).json({
        success: true,
        count: 0,
        data: []
      });
    }

    const messages = await ChatMessage.find({ conversationId })
      .sort({ createdAt: 1 })
      .limit(100);

    // Mark Admin's replies as read by user
    await ChatMessage.updateMany(
      { conversationId, senderRole: 'admin', isReadByUser: false },
      { $set: { isReadByUser: true } }
    );

    return res.status(200).json({
      success: true,
      conversationId,
      count: messages.length,
      data: messages
    });
  } catch (error) {
    console.error('Chat getMyMessages Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy tin nhắn của bạn.',
      error: error.message
    });
  }
};

/**
 * @desc   Delete a conversation (Admin only)
 * @route  DELETE /api/v1/chat/admin/conversation/:conversationId
 * @access Admin only
 */
exports.deleteConversation = async (req, res) => {
  try {
    const { conversationId } = req.params;
    await ChatMessage.deleteMany({ conversationId });

    return res.status(200).json({
      success: true,
      message: 'Đã xóa toàn bộ cuộc hội thoại thành công.'
    });
  } catch (error) {
    console.error('Chat deleteConversation Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi khi xóa cuộc hội thoại.',
      error: error.message
    });
  }
};
