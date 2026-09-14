const User = require('../models/User');
const OtpVerification = require('../models/OtpVerification');
const { generateToken } = require('../middleware/authMiddleware');
const { OAuth2Client } = require('google-auth-library');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const { sendResetPasswordEmail, sendRegistrationOtpEmail } = require('../utils/emailService');

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || '151027052858-mmdiucsj3s8ddkmfk0rieanmhojts1np.apps.googleusercontent.com';
const googleClient = new OAuth2Client(GOOGLE_CLIENT_ID);

// Secure admin check via env var (comma-separated emails)
const ADMIN_EMAILS = (process.env.ADMIN_EMAILS || 'danganhtuongg@gmail.com')
  .split(',')
  .map(e => e.trim().toLowerCase());
const isAdminEmail = (email) => ADMIN_EMAILS.includes(email.toLowerCase().trim());

// 1.1 Send Registration OTP to Email (Disabled - Google 1-Click Login Enforced)
exports.sendRegistrationOtp = async (req, res) => {
  return res.status(403).json({
    success: false,
    message: 'Hệ thống Tường Tận TOEIC yêu cầu xác thực tài khoản Google thật. Vui lòng bấm nút "Tiếp tục với Google" để đăng nhập và bảo vệ an toàn tài khoản của bạn.'
  });
};

// 1.2 Verify OTP and Finalize Registration (Disabled - Google 1-Click Login Enforced)
exports.verifyOtpAndRegister = async (req, res) => {
  return res.status(403).json({
    success: false,
    message: 'Hệ thống Tường Tận TOEIC yêu cầu xác thực tài khoản Google thật. Vui lòng bấm nút "Tiếp tục với Google" để đăng nhập và bảo vệ an toàn tài khoản của bạn.'
  });
};

// 1.3 Register Handler (Enforce Google 1-Click OAuth only)
exports.register = async (req, res) => {
  return res.status(403).json({
    success: false,
    message: 'Hệ thống Tường Tận TOEIC yêu cầu xác thực tài khoản Google thật. Vui lòng bấm nút "Tiếp tục với Google" để đăng nhập và bảo vệ an toàn tài khoản của bạn.'
  });
};

// 2. Login with Email & Password
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Vui lòng nhập đầy đủ email và mật khẩu.' });
    }

    const cleanEmail = email.toLowerCase().trim();
    const user = await User.findOne({ email: cleanEmail });

    if (!user) {
      return res.status(401).json({ success: false, message: 'Email hoặc mật khẩu không chính xác.' });
    }

    // If user registered with Google and has no password
    if (!user.password) {
      return res.status(400).json({
        success: false,
        message: 'Tài khoản này được đăng ký bằng Google. Vui lòng bấm Đăng nhập bằng Google.'
      });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Email hoặc mật khẩu không chính xác.' });
    }

    const token = generateToken(user);

    return res.status(200).json({
      success: true,
      message: '🎉 Đăng nhập thành công!',
      token,
      data: {
        id: user._id,
        userId: user.userId,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
        isPro: user.isPro,
        proTier: user.proTier,
        currentScore: user.currentScore,
        targetScore: user.targetScore,
        totalXp: user.totalXp,
        streakDays: user.streakDays
      }
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// 3. Google OAuth Login / Cryptographic Token Verification (Commercial Grade)
exports.googleAuth = async (req, res) => {
  try {
    const { accessToken, idToken, email, fullName, googleId, avatar } = req.body;
    let verifiedEmail = null;
    let verifiedName = fullName || '';
    let verifiedAvatar = avatar || '';
    let verifiedGoogleId = googleId || null;

    // A. Priority 1: Cryptographic ID Token Verification (OpenID Connect RS256)
    if (idToken) {
      try {
        const ticket = await googleClient.verifyIdToken({
          idToken,
          audience: GOOGLE_CLIENT_ID
        });
        const payload = ticket.getPayload();
        if (payload?.email) {
          verifiedEmail = payload.email.toLowerCase().trim();
          verifiedName = payload.name || verifiedName;
          verifiedAvatar = payload.picture || verifiedAvatar;
          verifiedGoogleId = payload.sub || verifiedGoogleId;
        }
      } catch (idErr) {
        console.warn('Google ID token verification failed:', idErr.message);
      }
    }

    // B. Priority 2: Google Access Token Verification via Server-to-Server UserInfo
    if (!verifiedEmail && accessToken) {
      try {
        const googleRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
          headers: { Authorization: `Bearer ${accessToken}` },
          signal: AbortSignal.timeout(10000)
        });
        if (googleRes.ok) {
          const profile = await googleRes.json();
          if (profile?.email) {
            verifiedEmail = profile.email.toLowerCase().trim();
            verifiedName = profile.name || profile.given_name || verifiedName;
            verifiedAvatar = profile.picture || verifiedAvatar;
            verifiedGoogleId = profile.sub || verifiedGoogleId;
          }
        }
      } catch (tokenErr) {
        console.warn('Google access token verification failed:', tokenErr.message);
      }
    }

    // C. Priority 3: Fallback for test automation in non-production environments (Strictly gated by test secret)
    if (!verifiedEmail && process.env.NODE_ENV !== 'production' && email && req.headers['x-e2e-test-secret'] === 'tuong_tan_toeic_e2e_secret_2026') {
      verifiedEmail = email.toLowerCase().trim();
    }

    if (!verifiedEmail) {
      return res.status(401).json({
        success: false,
        message: 'Xác thực tài khoản Google không hợp lệ hoặc đã hết hạn. Vui lòng đăng nhập lại.'
      });
    }

    let user = await User.findOne({ email: verifiedEmail });

    if (!user) {
      // Create new user from verified Google profile
      user = await User.create({
        userId: `google_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
        email: verifiedEmail,
        fullName: verifiedName || verifiedEmail.split('@')[0],
        avatar: verifiedAvatar || (verifiedName || verifiedEmail).charAt(0).toUpperCase(),
        googleId: verifiedGoogleId,
        role: isAdminEmail(verifiedEmail) ? 'admin' : 'user',
        isPro: isAdminEmail(verifiedEmail),
        proTier: isAdminEmail(verifiedEmail) ? 'lifetime' : 'free',
        currentScore: 100,
        targetScore: 650,
        streakDays: 1,
        totalXp: 100
      });
    } else {
      // Update Google info if not set
      if (verifiedGoogleId && !user.googleId) {
        user.googleId = verifiedGoogleId;
        await user.save();
      }
    }

    const token = generateToken(user);

    return res.status(200).json({
      success: true,
      message: '🎉 Đăng nhập Google thành công!',
      token,
      data: {
        id: user._id,
        userId: user.userId,
        email: user.email,
        fullName: user.fullName,
        avatar: user.avatar,
        role: user.role,
        isPro: user.isPro,
        proTier: user.proTier,
        currentScore: user.currentScore,
        targetScore: user.targetScore,
        totalXp: user.totalXp,
        streakDays: user.streakDays
      }
    });
  } catch (error) {
    console.error('Google auth error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// 4. Get Current Logged In User Profile
exports.getMe = async (req, res) => {
  try {
    const user = req.user;
    if (!user) {
      return res.status(401).json({ success: false, message: 'Chưa đăng nhập.' });
    }

    return res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// 5. Forgot Password (Send reset link to student email)
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ success: false, message: 'Vui lòng nhập địa chỉ email.' });
    }

    const cleanEmail = email.toLowerCase().trim();
    const user = await User.findOne({ email: cleanEmail });

    if (!user) {
      // Return positive message for security
      return res.status(200).json({
        success: true,
        message: 'Nếu email tồn tại trên hệ thống, chúng tôi đã gửi liên kết đặt lại mật khẩu về hộp thư của bạn.'
      });
    }

    if (!user.password && user.googleId) {
      return res.status(400).json({
        success: false,
        message: 'Tài khoản này được đăng nhập bằng Google. Vui lòng bấm "Đăng nhập bằng Google".'
      });
    }

    // Generate secure random reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');

    // Token expires in 60 minutes
    user.resetPasswordToken = hashedToken;
    user.resetPasswordExpires = Date.now() + 60 * 60 * 1000;
    await user.save({ validateBeforeSave: false });

    // Client reset URL
    const clientBaseUrl = process.env.CLIENT_URL || 'https://toeic.danganhtuong.dev';
    const resetUrl = `${clientBaseUrl}/reset-password?token=${resetToken}`;

    await sendResetPasswordEmail({
      toEmail: user.email,
      fullName: user.fullName,
      resetUrl
    });

    return res.status(200).json({
      success: true,
      message: 'Liên kết đặt lại mật khẩu đã được gửi đến email của bạn. Vui lòng kiểm tra hộp thư (cả mục Spam/Quảng cáo).'
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    return res.status(500).json({ success: false, message: 'Không thể gửi email đặt lại mật khẩu. Vui lòng thử lại sau.' });
  }
};

// 6. Reset Password with Token
exports.resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      return res.status(400).json({ success: false, message: 'Vui lòng cung cấp mã xác nhận và mật khẩu mới.' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ success: false, message: 'Mật khẩu mới phải có tối thiểu 6 ký tự.' });
    }

    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Liên kết đặt lại mật khẩu không hợp lệ hoặc đã hết hạn (chỉ có hiệu lực trong 60 phút).'
      });
    }

    // Set new password (pre-save hook hashes it)
    user.password = newPassword;
    user.resetPasswordToken = null;
    user.resetPasswordExpires = null;
    await user.save();

    // Auto-login: generate JWT token
    const jwtToken = generateToken(user);

    return res.status(200).json({
      success: true,
      message: '🎉 Đặt lại mật khẩu thành công! Bạn có thể tiếp tục học tập.',
      token: jwtToken,
      data: {
        id: user._id,
        userId: user.userId,
        email: user.email,
        fullName: user.fullName,
        avatar: user.avatar,
        role: user.role,
        isPro: user.isPro,
        proTier: user.proTier,
        currentScore: user.currentScore,
        targetScore: user.targetScore,
        totalXp: user.totalXp,
        streakDays: user.streakDays
      }
    });
  } catch (error) {
    console.error('Reset password error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// 7. Get Real Public Stats for Landing & Auth Pages
exports.getPublicStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments({});
    return res.json({
      success: true,
      data: {
        totalUsers,
        displayUsers: `${totalUsers}+`,
        totalListening: '11785+',
        totalGrammar: '997+',
        totalTests: '91+'
      }
    });
  } catch (err) {
    return res.json({
      success: true,
      data: {
        totalUsers: 194,
        displayUsers: '190+',
        totalListening: '11785+',
        totalGrammar: '997+',
        totalTests: '91+'
      }
    });
  }
};
