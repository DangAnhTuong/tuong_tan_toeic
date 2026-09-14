const mongoose = require('mongoose');

const blogPostSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  slug: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    index: true
  },
  excerpt: {
    type: String,
    default: ''
  },
  content: {
    type: String,
    required: true
  },
  category: {
    type: String,
    enum: ['tips', 'strategy', 'roadmap', 'experience', 'resources'],
    default: 'experience',
    index: true
  },
  author: {
    type: String,
    default: 'TƯỜNG TẬN TOEIC'
  },
  cover_image_url: {
    type: String,
    default: ''
  },
  read_time: {
    type: String,
    default: '5 phút đọc'
  },
  is_hidden: {
    type: Boolean,
    default: false,
    index: true
  },
  order_index: {
    type: Number,
    default: 0,
    index: true
  },
  tags: [{
    type: String
  }],
  views: {
    type: Number,
    default: 0
  },
  created_at: {
    type: Date,
    default: Date.now
  },
  updated_at: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

module.exports = mongoose.model('BlogPost', blogPostSchema);
