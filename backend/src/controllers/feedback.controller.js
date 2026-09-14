const Feedback = require('../models/Feedback');
const { sanitizeAttachments } = require('../utils/securitySanitizer');

// POST /api/v1/feedback
exports.createFeedback = async (req, res) => {
  try {
    const { content, category, attachments, userEmail, userName } = req.body;

    const isChat = (content && content.startsWith('[Tin nhắn Chat gửi Admin]')) || category === 'other';
    const minLength = isChat ? 1 : 5;

    if (!content || content.trim().length < minLength) {
      return res.status(400).json({
        success: false,
        message: isChat ? 'Vui lòng nhập nội dung tin nhắn.' : 'Nội dung đề xuất cần tối thiểu 5 ký tự.'
      });
    }

    if (content.length > 2000) {
      return res.status(400).json({
        success: false,
        message: 'Nội dung đề xuất không được vượt quá 2000 ký tự.'
      });
    }

    const userId = req.user ? req.user._id : null;
    const authorName = userName || (req.user ? (req.user.name || req.user.fullName || req.user.email?.split('@')[0]) : 'Học viên ẩn danh');
    const authorEmail = userEmail || (req.user ? req.user.email : '');

    // Sanitize user-provided attachments against Stored XSS
    const safeAttachments = sanitizeAttachments(attachments);

    const newFeedback = await Feedback.create({
      userId,
      userName: authorName,
      userEmail: authorEmail,
      content: content.trim(),
      category: category || 'feature',
      attachments: safeAttachments,
      status: 'pending'
    });

    res.status(201).json({
      success: true,
      message: isChat ? 'Đã gửi tin nhắn đến Admin thành công!' : 'Gửi đề xuất thành công! Cảm ơn bạn đã đồng hành đóng góp cho Tường Tận TOEIC.',
      data: newFeedback
    });
  } catch (error) {
    console.error('Error creating feedback:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi hệ thống khi lưu đề xuất góp ý.'
    });
  }
};

// GET /api/v1/feedback/my-feedbacks
exports.getMyFeedbacks = async (req, res) => {
  try {
    const userId = req.user ? req.user._id : null;
    const userEmail = req.user?.email || req.query.email;

    if (!userId && !userEmail) {
      return res.json({ success: true, data: [] });
    }

    const query = {
      $or: []
    };

    if (userId) query.$or.push({ userId });
    if (userEmail) query.$or.push({ userEmail });

    const feedbacks = await Feedback.find(query).sort({ created_at: -1 });

    res.json({
      success: true,
      data: feedbacks
    });
  } catch (error) {
    console.error('Error fetching my feedbacks:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi hệ thống khi tải đề xuất của bạn.'
    });
  }
};

// GET /api/v1/feedback/all (Admin view)
exports.getAllFeedbacks = async (req, res) => {
  try {
    const { status, search, limit = 50, page = 1 } = req.query;
    const query = {};

    if (status && status !== 'all') {
      if (status === 'chat') {
        query.content = { $regex: '^\\[Tin nhắn Chat gửi Admin\\]', $options: 'i' };
      } else if (status === 'feedback') {
        query.content = { $not: { $regex: '^\\[Tin nhắn Chat gửi Admin\\]', $options: 'i' } };
      } else {
        query.status = status;
      }
    }

    if (search && search.trim()) {
      const s = search.trim();
      query.$or = [
        { userName: { $regex: s, $options: 'i' } },
        { userEmail: { $regex: s, $options: 'i' } },
        { content: { $regex: s, $options: 'i' } }
      ];
    }

    const total = await Feedback.countDocuments(query);
    const pendingCount = await Feedback.countDocuments({ status: 'pending' });
    const chatCount = await Feedback.countDocuments({ content: { $regex: '^\\[Tin nhắn Chat gửi Admin\\]', $options: 'i' } });

    const feedbacks = await Feedback.find(query)
      .sort({ created_at: -1 })
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit));

    res.json({
      success: true,
      data: feedbacks,
      total,
      pendingCount,
      chatCount
    });
  } catch (error) {
    console.error('Error fetching all feedbacks:', error);
    res.status(500).json({ success: false, message: 'Lỗi khi tải toàn bộ đề xuất.' });
  }
};

// PUT /api/v1/feedback/:id/reply (Admin reply)
exports.replyFeedback = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, replyText } = req.body;

    const feedback = await Feedback.findById(id);
    if (!feedback) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy đề xuất/tin nhắn.' });
    }

    if (status) {
      feedback.status = status;
    } else {
      feedback.status = 'done';
    }

    if (replyText) {
      feedback.adminReply = {
        text: replyText.trim(),
        repliedAt: new Date(),
        adminName: req.user?.fullName || req.user?.name || 'Admin Đặng Anh Tường'
      };
    }

    await feedback.save();

    res.json({
      success: true,
      message: 'Cập nhật phản hồi thành công.',
      data: feedback
    });
  } catch (error) {
    console.error('Error replying feedback:', error);
    res.status(500).json({ success: false, message: 'Lỗi khi trả lời đề xuất.' });
  }
};

// DELETE /api/v1/feedback/:id (Admin delete)
exports.deleteFeedback = async (req, res) => {
  try {
    const { id } = req.params;
    await Feedback.findByIdAndDelete(id);
    res.json({
      success: true,
      message: 'Đã xóa tin nhắn/đề xuất thành công.'
    });
  } catch (error) {
    console.error('Error deleting feedback:', error);
    res.status(500).json({ success: false, message: 'Lỗi khi xóa tin nhắn.' });
  }
};
