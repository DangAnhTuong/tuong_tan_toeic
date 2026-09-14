const Notification = require('../models/Notification');
const User = require('../models/User');

// ==========================================
// ADMIN APIS
// ==========================================

// 1. Create & Broadcast a Notification (Admin only)
exports.createNotification = async (req, res) => {
  try {
    const { title, content, type, priority, actionUrl, targetAudience, isPinned } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({ success: false, message: 'Tiêu đề thông báo không được để trống.' });
    }
    if (!content || !content.trim()) {
      return res.status(400).json({ success: false, message: 'Nội dung thông báo không được để trống.' });
    }

    const notification = await Notification.create({
      title: title.trim(),
      content: content.trim(),
      type: type || 'announcement',
      priority: priority || 'normal',
      actionUrl: actionUrl ? actionUrl.trim() : '',
      targetAudience: targetAudience || 'all',
      isPinned: Boolean(isPinned),
      senderAdmin: {
        adminId: req.user?._id,
        adminName: req.user?.fullName || 'Admin Đặng Anh Tường',
        adminEmail: req.user?.email || 'danganhtuongg@gmail.com'
      }
    });

    return res.status(201).json({
      success: true,
      message: '🚀 Đã phát thông báo thành công tới toàn bộ học viên!',
      data: notification
    });
  } catch (err) {
    console.error('Error creating notification:', err);
    return res.status(500).json({ success: false, message: 'Lỗi máy chủ khi tạo thông báo: ' + err.message });
  }
};

// 2. Get All Notifications for Admin (Admin only)
exports.getAdminNotifications = async (req, res) => {
  try {
    const { search, type, limit = 50, page = 1 } = req.query;
    const query = {};

    if (search && search.trim()) {
      query.$or = [
        { title: { $regex: search.trim(), $options: 'i' } },
        { content: { $regex: search.trim(), $options: 'i' } }
      ];
    }
    if (type && type !== 'all') {
      query.type = type;
    }

    const skip = (parseInt(page, 10) - 1) * parseInt(limit, 10);
    const [total, notifications] = await Promise.all([
      Notification.countDocuments(query),
      Notification.find(query)
        .sort({ isPinned: -1, createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit, 10))
        .lean()
    ]);

    const formatted = notifications.map(n => ({
      ...n,
      readCount: n.readBy ? n.readBy.length : 0
    }));

    return res.status(200).json({
      success: true,
      total,
      data: formatted
    });
  } catch (err) {
    console.error('Error getting admin notifications:', err);
    return res.status(500).json({ success: false, message: err.message });
  }
};

// 3. Delete Notification (Admin only)
exports.deleteNotification = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Notification.findByIdAndDelete(id);
    if (!deleted) {
      return res.status(404).json({ success: false, message: 'Thông báo không tồn tại hoặc đã bị xóa.' });
    }
    return res.status(200).json({ success: true, message: 'Đã xóa thông báo thành công.' });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// 4. Toggle Pin Notification (Admin only)
exports.togglePinNotification = async (req, res) => {
  try {
    const { id } = req.params;
    const notif = await Notification.findById(id);
    if (!notif) {
      return res.status(404).json({ success: false, message: 'Thông báo không tồn tại.' });
    }
    notif.isPinned = !notif.isPinned;
    await notif.save();

    return res.status(200).json({
      success: true,
      message: notif.isPinned ? '📌 Đã ghim thông báo lên đầu.' : 'Đã bỏ ghim thông báo.',
      data: notif
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// ==========================================
// STUDENT / PUBLIC APIS
// ==========================================

// 5. Get Notifications for Students (Filtered & with read status)
exports.getUserNotifications = async (req, res) => {
  try {
    const currentUser = req.user;
    const userTier = currentUser?.isPro ? 'pro' : 'free';
    const userIdStr = currentUser?._id?.toString();
    const userEmail = currentUser?.email || req.query.email;

    // Audience filter: 'all' OR matching tier
    const audienceFilter = ['all'];
    if (userTier === 'pro') audienceFilter.push('pro');
    if (userTier === 'free') audienceFilter.push('free');

    const notifications = await Notification.find({
      targetAudience: { $in: audienceFilter }
    })
      .sort({ isPinned: -1, createdAt: -1 })
      .limit(40)
      .lean();

    const formatted = notifications.map(n => {
      const isRead = n.readBy && n.readBy.some(r => {
        if (userIdStr && r.userId && r.userId.toString() === userIdStr) return true;
        if (userEmail && r.userEmail && r.userEmail.toLowerCase() === userEmail.toLowerCase()) return true;
        return false;
      });

      return {
        _id: n._id,
        title: n.title,
        content: n.content,
        type: n.type,
        priority: n.priority,
        actionUrl: n.actionUrl,
        isPinned: n.isPinned,
        senderName: n.senderAdmin?.adminName || 'Admin Tường Tận TOEIC',
        createdAt: n.createdAt,
        isRead: Boolean(isRead)
      };
    });

    const unreadCount = formatted.filter(n => !n.isRead).length;

    return res.status(200).json({
      success: true,
      unreadCount,
      count: formatted.length,
      data: formatted
    });
  } catch (err) {
    console.error('Error getting user notifications:', err);
    return res.status(500).json({ success: false, message: err.message });
  }
};

// 6. Fast Unread Count for Notification Bell badge
exports.getUnreadCount = async (req, res) => {
  try {
    const currentUser = req.user;
    const userTier = currentUser?.isPro ? 'pro' : 'free';
    const userIdStr = currentUser?._id?.toString();
    const userEmail = currentUser?.email || req.query.email;

    const audienceFilter = ['all'];
    if (userTier === 'pro') audienceFilter.push('pro');
    if (userTier === 'free') audienceFilter.push('free');

    const notifications = await Notification.find({
      targetAudience: { $in: audienceFilter }
    })
      .select('readBy isPinned createdAt')
      .sort({ isPinned: -1, createdAt: -1 })
      .limit(50)
      .lean();

    let unreadCount = 0;
    notifications.forEach(n => {
      const isRead = n.readBy && n.readBy.some(r => {
        if (userIdStr && r.userId && r.userId.toString() === userIdStr) return true;
        if (userEmail && r.userEmail && r.userEmail.toLowerCase() === userEmail.toLowerCase()) return true;
        return false;
      });
      if (!isRead) unreadCount++;
    });

    return res.status(200).json({
      success: true,
      unreadCount
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// 7. Mark Specific Notification as Read
exports.markAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    const currentUser = req.user;
    const userEmail = currentUser?.email || req.body.email;
    const userId = currentUser?._id;

    if (!userEmail && !userId) {
      return res.status(200).json({ success: true, message: 'Khách vãng lai' });
    }

    const notif = await Notification.findById(id);
    if (!notif) {
      return res.status(404).json({ success: false, message: 'Thông báo không tồn tại.' });
    }

    const alreadyRead = notif.readBy.some(r => {
      if (userId && r.userId && r.userId.toString() === userId.toString()) return true;
      if (userEmail && r.userEmail && r.userEmail.toLowerCase() === userEmail.toLowerCase()) return true;
      return false;
    });

    if (!alreadyRead) {
      notif.readBy.push({
        userId: userId || null,
        userEmail: userEmail || '',
        readAt: new Date()
      });
      await notif.save();
    }

    return res.status(200).json({ success: true, message: 'Đã đánh dấu đã đọc.' });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// 8. Mark All Notifications as Read
exports.markAllAsRead = async (req, res) => {
  try {
    const currentUser = req.user;
    const userEmail = currentUser?.email || req.body.email;
    const userId = currentUser?._id;

    if (!userEmail && !userId) {
      return res.status(200).json({ success: true, message: 'Khách vãng lai' });
    }

    const notifications = await Notification.find({
      $or: [
        { 'readBy.userId': { $ne: userId } },
        { 'readBy.userEmail': { $ne: userEmail } }
      ]
    });

    const updatePromises = notifications.map(notif => {
      const alreadyRead = notif.readBy.some(r => {
        if (userId && r.userId && r.userId.toString() === userId.toString()) return true;
        if (userEmail && r.userEmail && r.userEmail.toLowerCase() === userEmail.toLowerCase()) return true;
        return false;
      });

      if (!alreadyRead) {
        notif.readBy.push({
          userId: userId || null,
          userEmail: userEmail || '',
          readAt: new Date()
        });
        return notif.save();
      }
      return Promise.resolve();
    });

    await Promise.all(updatePromises);

    return res.status(200).json({ success: true, message: 'Đã đánh dấu tất cả thông báo là đã đọc.' });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};
