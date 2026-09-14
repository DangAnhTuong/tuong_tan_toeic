const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Tiêu đề thông báo là bắt buộc'],
      trim: true,
      maxlength: 200
    },
    content: {
      type: String,
      required: [true, 'Nội dung thông báo là bắt buộc'],
      trim: true
    },
    type: {
      type: String,
      enum: ['announcement', 'update', 'promo', 'system'],
      default: 'announcement'
    },
    priority: {
      type: String,
      enum: ['normal', 'high', 'urgent'],
      default: 'normal'
    },
    actionUrl: {
      type: String,
      trim: true,
      default: ''
    },
    targetAudience: {
      type: String,
      enum: ['all', 'free', 'pro'],
      default: 'all'
    },
    isPinned: {
      type: Boolean,
      default: false
    },
    senderAdmin: {
      adminId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      adminName: {
        type: String,
        default: 'Ban Quản Trị Tường Tận TOEIC'
      },
      adminEmail: {
        type: String,
        default: 'danganhtuongg@gmail.com'
      }
    },
    readBy: [
      {
        userId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User'
        },
        userEmail: String,
        readAt: {
          type: Date,
          default: Date.now
        }
      }
    ]
  },
  {
    timestamps: true
  }
);

// Indexes for fast lookup by target audience, pinned status, and time
notificationSchema.index({ createdAt: -1 });
notificationSchema.index({ isPinned: -1, createdAt: -1 });
notificationSchema.index({ targetAudience: 1 });
notificationSchema.index({ 'readBy.userId': 1 });
notificationSchema.index({ 'readBy.userEmail': 1 });

module.exports = mongoose.model('Notification', notificationSchema);
