const mongoose = require('mongoose');

const chatMessageSchema = new mongoose.Schema({
  conversationId: {
    type: String,
    required: true,
    index: true // Ví dụ: "conv_student@gmail.com" hoặc "conv_userId"
  },
  senderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  senderName: {
    type: String,
    required: true,
    trim: true
  },
  senderEmail: {
    type: String,
    default: '',
    trim: true,
    lowercase: true
  },
  senderRole: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  senderAvatar: {
    type: String,
    default: ''
  },
  recipientEmail: {
    type: String,
    default: '',
    trim: true,
    lowercase: true
  },
  text: {
    type: String,
    required: true,
    trim: true,
    maxlength: 3000
  },
  attachments: [{
    type: { type: String, default: 'image' },
    url: String,
    name: String
  }],
  isReadByAdmin: {
    type: Boolean,
    default: false,
    index: true
  },
  isReadByUser: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now,
    index: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('ChatMessage', chatMessageSchema);
