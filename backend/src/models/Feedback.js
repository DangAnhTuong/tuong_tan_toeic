const mongoose = require('mongoose');

const feedbackSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  userName: {
    type: String,
    default: 'Học viên'
  },
  userEmail: {
    type: String,
    default: ''
  },
  content: {
    type: String,
    required: true,
    minlength: 1,
    maxlength: 2000,
    trim: true
  },
  category: {
    type: String,
    enum: ['feature', 'bug', 'content', 'ui', 'other'],
    default: 'feature'
  },
  attachments: [{
    type: {
      type: String, // 'image' | 'file' | 'link'
      default: 'file'
    },
    name: String,
    url: String,
    size: Number
  }],
  status: {
    type: String,
    enum: ['pending', 'reviewing', 'accepted', 'done', 'rejected'],
    default: 'pending',
    index: true
  },
  adminReply: {
    text: { type: String, default: '' },
    repliedAt: { type: Date, default: null },
    adminName: { type: String, default: 'Admin Tường Tận TOEIC' }
  },
  isPublic: {
    type: Boolean,
    default: false
  },
  created_at: {
    type: Date,
    default: Date.now,
    index: true
  }
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

module.exports = mongoose.model('Feedback', feedbackSchema);
