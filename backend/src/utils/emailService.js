const nodemailer = require('nodemailer');

// 1. Configure Transporter
const createTransporter = () => {
  const user = process.env.SMTP_USER || process.env.EMAIL_USER;
  const pass = process.env.SMTP_PASS || process.env.EMAIL_PASS || process.env.SMTP_APP_PASSWORD;

  if (!user || !pass) {
    return null;
  }

  const host = process.env.SMTP_HOST || 'smtp.gmail.com';
  const port = parseInt(process.env.SMTP_PORT, 10) || 465;
  const secure = port === 465; // true for 465, false for 587

  return nodemailer.createTransport({
    host,
    port,
    secure,
    auth: {
      user,
      pass
    },
    tls: {
      rejectUnauthorized: false
    }
  });
};

/**
 * Sends a password reset email to student
 */
exports.sendResetPasswordEmail = async ({ toEmail, fullName, resetUrl }) => {
  const transporter = createTransporter();
  const senderEmail = process.env.SMTP_FROM || process.env.SMTP_USER || 'no-reply@toeic.danganhtuong.dev';
  const appName = 'Tường Tận TOEIC';

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #0b1120; color: #e2e8f0; margin: 0; padding: 20px; }
        .container { max-width: 560px; margin: 0 auto; background-color: #0f172a; border: 1px solid #1e293b; border-radius: 20px; padding: 32px; box-shadow: 0 10px 30px rgba(0,0,0,0.5); }
        .header { text-align: center; padding-bottom: 24px; border-bottom: 1px solid #1e293b; }
        .brand { font-size: 20px; font-weight: 800; color: #10b981; letter-spacing: 1px; }
        .content { padding: 28px 0; line-height: 1.6; font-size: 15px; color: #cbd5e1; }
        .btn-box { text-align: center; margin: 32px 0; }
        .btn { display: inline-block; padding: 14px 32px; background: linear-gradient(135deg, #10b981, #0d9488); color: #022c22 !important; text-decoration: none; font-weight: 800; font-size: 15px; border-radius: 12px; box-shadow: 0 4px 15px rgba(16, 185, 129, 0.35); }
        .link-alt { font-size: 12px; color: #64748b; word-break: break-all; margin-top: 16px; }
        .link-alt a { color: #38bdf8; }
        .notice { font-size: 13px; color: #94a3b8; background-color: #1e293b/60; border-left: 3px solid #f59e0b; padding: 12px 16px; border-radius: 8px; margin-top: 24px; }
        .footer { text-align: center; padding-top: 24px; border-top: 1px solid #1e293b; font-size: 12px; color: #64748b; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="brand">🎯 TƯỜNG TẬN TOEIC</div>
        </div>
        <div class="content">
          <p>Xin chào <strong>${fullName || 'Học viên'}</strong>,</p>
          <p>Hệ thống vừa nhận được yêu cầu đặt lại mật khẩu cho tài khoản học viên gắn với email <strong>${toEmail}</strong> trên nền tảng <strong>${appName}</strong>.</p>
          <p>Vui lòng bấm vào nút bên dưới để tiến hành tạo mật khẩu mới:</p>
          
          <div class="btn-box">
            <a href="${resetUrl}" class="btn">ĐẶT LẠI MẬT KHẨU MỚI →</a>
          </div>

          <p class="link-alt">
            Nếu nút bấm trên không hoạt động, bạn hãy sao chép và dán trực tiếp đường dẫn sau vào trình duyệt:<br>
            <a href="${resetUrl}">${resetUrl}</a>
          </p>

          <div class="notice">
            ⏱️ <strong>Lưu ý:</strong> Liên kết đặt lại mật khẩu này có hiệu lực trong vòng <strong>60 phút</strong>.<br>
            Nếu bạn không gửi yêu cầu này, bạn hoàn toàn có thể yên tâm bỏ qua email. Mật khẩu hiện tại của bạn vẫn được giữ an toàn tuyệt đối.
          </div>
        </div>
        <div class="footer">
          © 2026 Tường Tận TOEIC — Nền Tảng Luyện Thi TOEIC 4 Kỹ Năng Hàng Đầu.<br>
          Hỗ trợ học viên: danganhtuongg@gmail.com
        </div>
      </div>
    </body>
    </html>
  `;

  if (!transporter) {
    console.warn(`[EMAIL SERVICE] SMTP credentials not set. Password reset link for ${toEmail}: ${resetUrl}`);
    return {
      success: true,
      isMock: true,
      message: 'Mã đặt lại mật khẩu đã được tạo (SMTP chưa cấu hình).'
    };
  }

  try {
    const info = await transporter.sendMail({
      from: `"${appName}" <${senderEmail}>`,
      to: toEmail,
      subject: `[${appName}] Hướng Dẫn Đặt Lại Mật Khẩu Tài Khoản`,
      html: htmlContent
    });

    console.log(`[EMAIL SERVICE] Reset email sent to ${toEmail}. MessageId: ${info.messageId}`);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error(`[EMAIL SERVICE ERROR] Failed to send email to ${toEmail}:`, error.message);
    throw error;
  }
};

/**
 * Sends a 6-digit OTP verification code for student account registration
 */
exports.sendRegistrationOtpEmail = async ({ toEmail, fullName, otpCode }) => {
  const transporter = createTransporter();
  const senderEmail = process.env.SMTP_FROM || process.env.SMTP_USER || 'no-reply@toeic.danganhtuong.dev';
  const appName = 'Tường Tận TOEIC';

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #0b1120; color: #e2e8f0; margin: 0; padding: 20px; }
        .container { max-width: 560px; margin: 0 auto; background-color: #0f172a; border: 1px solid #1e293b; border-radius: 20px; padding: 32px; box-shadow: 0 10px 30px rgba(0,0,0,0.5); }
        .header { text-align: center; padding-bottom: 24px; border-bottom: 1px solid #1e293b; }
        .brand { font-size: 20px; font-weight: 800; color: #10b981; letter-spacing: 1px; }
        .content { padding: 28px 0; line-height: 1.6; font-size: 15px; color: #cbd5e1; }
        .otp-box { text-align: center; margin: 30px 0; }
        .otp-code { display: inline-block; font-size: 34px; font-weight: 900; letter-spacing: 10px; color: #10b981; background-color: #022c22; border: 2px solid #059669; border-radius: 16px; padding: 14px 28px; font-family: 'Courier New', Courier, monospace; box-shadow: 0 4px 20px rgba(16, 185, 129, 0.25); }
        .notice { font-size: 13px; color: #94a3b8; background-color: #1e293b; border-left: 3px solid #f59e0b; padding: 12px 16px; border-radius: 8px; margin-top: 24px; }
        .footer { text-align: center; padding-top: 24px; border-top: 1px solid #1e293b; font-size: 12px; color: #64748b; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="brand">🎯 TƯỜNG TẬN TOEIC</div>
        </div>
        <div class="content">
          <p>Xin chào <strong>${fullName || 'Học viên'}</strong>,</p>
          <p>Bạn vừa thực hiện đăng ký tài khoản học viên bằng email <strong>${toEmail}</strong> trên nền tảng <strong>${appName}</strong>.</p>
          <p>Dưới đây là mã xác thực <strong>OTP (6 chữ số)</strong> để hoàn tất đăng ký tài khoản của bạn:</p>
          
          <div class="otp-box">
            <div class="otp-code">${otpCode}</div>
          </div>

          <div class="notice">
            ⏱️ <strong>Lưu ý bảo mật:</strong><br>
            • Mã xác thực này có hiệu lực trong vòng <strong>5 phút</strong>.<br>
            • Tuyệt đối không chia sẻ mã này cho bất kỳ ai để bảo vệ an toàn tài khoản.<br>
            • Nếu bạn không thực hiện đăng ký này, vui lòng bỏ qua email.
          </div>
        </div>
        <div class="footer">
          © 2026 Tường Tận TOEIC — Nền Tảng Luyện Thi TOEIC 4 Kỹ Năng Hàng Đầu.<br>
          Hỗ trợ học viên: danganhtuongg@gmail.com
        </div>
      </div>
    </body>
    </html>
  `;

  if (!transporter) {
    console.log(`\n=============================================================`);
    console.log(`[EMAIL SERVICE - DEV/TEST OTP] 📬 Email: ${toEmail}`);
    console.log(`[EMAIL SERVICE - DEV/TEST OTP] 🔑 Mã OTP 6 số: >>> ${otpCode} <<< (Hạn 5 phút)`);
    console.log(`=============================================================\n`);
    return {
      success: true,
      isMock: true,
      otpCode,
      message: 'Mã OTP đã được tạo (Chế độ phát triển/kiểm thử).'
    };
  }

  try {
    const info = await transporter.sendMail({
      from: `"${appName}" <${senderEmail}>`,
      to: toEmail,
      subject: `[${appName}] Mã Xác Thực Đăng Ký Tài Khoản: ${otpCode}`,
      html: htmlContent
    });

    console.log(`[EMAIL SERVICE] OTP email sent to ${toEmail}. MessageId: ${info.messageId}`);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error(`[EMAIL SERVICE ERROR] Failed to send OTP email to ${toEmail}:`, error.message);
    throw error;
  }
};

