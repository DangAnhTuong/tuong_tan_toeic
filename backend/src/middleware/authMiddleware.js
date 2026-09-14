const jwt = require('jsonwebtoken');
const User = require('../models/User');

const JWT_SECRET = process.env.JWT_SECRET || 'tuong_tan_toeic_jwt_secret_key_2026_super_secure';

// 1. Generate JWT Token
const generateToken = (user) => {
  return jwt.sign(
    {
      id: user._id || user.userId,
      userId: user.userId || user._id,
      email: user.email,
      role: user.role || 'user',
      isPro: Boolean(user.isPro)
    },
    JWT_SECRET,
    { expiresIn: '30d' } // 30-day persistent session
  );
};

// 2. Middleware to extract and verify user token (Optional / Soft Auth)
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      const decoded = jwt.verify(token, JWT_SECRET);
      
      const user = await User.findById(decoded.id || decoded.userId).select('-password');
      if (user) {
        req.user = user;
        return next();
      }
    }
  } catch (err) {
    // Token invalid/expired - continue as guest
  }

  // Fallback: treat as anonymous guest (NOT admin, NOT pro)
  // SECURITY: Do NOT grant admin/isPro to unauthenticated users in production
  req.user = {
    userId: null,
    fullName: 'Khách',
    email: null,
    role: 'user',
    isPro: false,
    isGuest: true
  };
  next();
};

// 3. Strict Required Auth (Must have valid JWT token)
// SECURITY: Dev bypass removed — auth is enforced in ALL environments
const requireAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: '⚠️ Vui lòng đăng nhập để thực hiện hành động này.'
      });
    }

    const token = authHeader.split(' ')[1];
    let decoded;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch (e) {
      return res.status(401).json({
        success: false,
        message: '⚠️ Token không hợp lệ hoặc đã hết hạn. Vui lòng đăng nhập lại.'
      });
    }

    const user = await User.findById(decoded.id || decoded.userId).select('-password');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: '⚠️ Tài khoản không tồn tại hoặc phiên đăng nhập đã hết hạn.'
      });
    }

    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({
      success: false,
      message: '⚠️ Phiên đăng nhập không hợp lệ hoặc đã hết hạn.'
    });
  }
};

// 4. Strict Admin Only Middleware
// SECURITY: Dev bypass removed — admin check enforced in ALL environments
const requireAdmin = async (req, res, next) => {
  try {
    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: '⛔ Bạn không có quyền truy cập trang quản trị.'
      });
    }
    next();
  } catch (err) {
    return res.status(403).json({ success: false, message: 'Forbidden' });
  }
};

module.exports = {
  JWT_SECRET,
  generateToken,
  optionalAuth,
  requireAuth,
  requireAdmin
};
