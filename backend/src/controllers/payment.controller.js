const PaymentOrder = require('../models/PaymentOrder');
const UserGoal = require('../models/UserGoal');
const User = require('../models/User');

// Pricing tiers configuration: 2 Tiers (Free & 4-Month VIP Promo 99k / gốc 199k)
const PRICING_PLANS = {
  'free': {
    id: 'free',
    name: 'Gói Miễn Phí (Free)',
    price: 0,
    originalPrice: 0,
    durationDays: 3650,
    isFree: true,
    features: [
      'Trải nghiệm phần đầu các chủ đề Nghe Part 1, 2, 3, 4',
      'Luyện 2 chuyên đề Ngữ pháp căn bản & Đề thi Test 1 (200 câu)',
      'Học 6 bộ từ vựng 600 TOEIC & Mini game ghép từ',
      'Xem bài đọc song ngữ Level 1',
      'Đấu trường 1v1 & Sổ tay câu sai cá nhân'
    ]
  },
  'pro_4_months': {
    id: 'pro_4_months',
    name: 'Gói VIP Khai Trương (4 Tháng)',
    price: 99000,
    originalPrice: 199000,
    durationDays: 120, // 4 months
    popular: true,
    discountBadge: '🔥 Khai trương 10 ngày đầu — Giảm 50%',
    features: [
      'Thời hạn sử dụng trọn vẹn 4 tháng (120 ngày)',
      'Mở khóa trọn bộ 18.200 câu hỏi ETS 2019 - 2026 (91 bộ đề)',
      'Mở khóa toàn bộ 5 Levels Part 1 - 7 không giới hạn',
      '100% lời giải chi tiết song ngữ & phân tích bẫy đề thi',
      '83 chủ đề từ vựng Spaced Repetition (3.515+ từ) & Game Cyber Neon',
      'Luyện nghe chép chính tả 11.785 câu & chế độ Shadowing AI',
      'Huy hiệu VIP Gold & Tham gia bảng xếp hạng cao thủ'
    ]
  }
};


// Default Bank Settings (Can be customized via process.env or settings)
const DEFAULT_BANK = {
  bankId: process.env.BANK_ID || 'MB', // MBBank
  accountNo: process.env.BANK_ACCOUNT_NO || '0335847674',
  accountName: process.env.BANK_ACCOUNT_NAME || 'DANG ANH TUONG'
};

// 1. Get Pricing Plans
exports.getPlans = async (req, res) => {
  return res.status(200).json({
    success: true,
    data: Object.values(PRICING_PLANS)
  });
};

// 1.1 Get Current User Payment & VIP Status
exports.getMyPaymentStatus = async (req, res) => {
  try {
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    const mongoose = require('mongoose');
    const reqUser = req.user;
    if (!reqUser || reqUser.isGuest) {
      return res.status(200).json({
        success: true,
        isPro: false,
        proTier: 'free',
        proExpiresAt: null,
        latestOrder: null
      });
    }

    const userId = reqUser._id?.toString() || reqUser.id?.toString() || reqUser.userId;
    
    // Check User directly from MongoDB
    let dbUser = null;
    if (mongoose.Types.ObjectId.isValid(userId)) {
      dbUser = await User.findById(userId);
    }
    if (!dbUser && reqUser.email) {
      dbUser = await User.findOne({ email: reqUser.email });
    }

    const isPro = Boolean(dbUser?.isPro || reqUser.isPro);
    const proTier = dbUser?.proTier || reqUser.proTier || 'free';
    const proExpiresAt = dbUser?.proExpiresAt || reqUser.proExpiresAt || null;

    // Find latest order for this user (created within last 24h)
    const latestOrder = await PaymentOrder.findOne({
      $or: [
        { userId: userId },
        { userId: reqUser.email }
      ]
    }).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      isPro,
      proTier,
      proExpiresAt,
      latestOrder: latestOrder ? {
        orderCode: latestOrder.orderCode,
        planName: latestOrder.planName,
        amount: latestOrder.amount,
        status: latestOrder.status,
        createdAt: latestOrder.createdAt,
        paidAt: latestOrder.paidAt,
        qrUrl: latestOrder.qrUrl,
        bankInfo: latestOrder.bankInfo || DEFAULT_BANK,
        transferContent: latestOrder.transferContent
      } : null
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// 2. Create Payment Order with Dynamic VietQR
exports.createOrder = async (req, res) => {
  try {
    const { planId, forceExtend } = req.body;

    const reqUser = req.user;
    let userId = null;
    if (reqUser && !reqUser.isGuest) {
      userId = reqUser._id?.toString() || reqUser.id?.toString() || reqUser.userId;
    }

    // 1. Check if user is ALREADY VIP and not explicitly requesting extension
    if (reqUser && !reqUser.isGuest && reqUser.isPro && !forceExtend) {
      const mongoose = require('mongoose');
      let dbUser = null;
      if (mongoose.Types.ObjectId.isValid(userId)) {
        dbUser = await User.findById(userId);
      }
      if (!dbUser && reqUser.email) {
        dbUser = await User.findOne({ email: reqUser.email });
      }

      if (dbUser && dbUser.isPro && dbUser.proExpiresAt && new Date(dbUser.proExpiresAt) > new Date()) {
        return res.status(200).json({
          success: true,
          alreadyPro: true,
          message: 'Tài khoản của bạn đã là VIP Gold!',
          data: {
            isPro: true,
            proTier: dbUser.proTier || 'pro_4_months',
            proExpiresAt: dbUser.proExpiresAt
          }
        });
      }
    }

    // 2. Check if user has an existing active PENDING order in last 15 mins
    if (userId && !userId.startsWith('guest_')) {
      const activePending = await PaymentOrder.findOne({
        userId,
        status: 'PENDING',
        createdAt: { $gte: new Date(Date.now() - 15 * 60 * 1000) }
      }).sort({ createdAt: -1 });

      if (activePending) {
        return res.status(200).json({
          success: true,
          isExistingPending: true,
          message: 'Bạn đang có đơn hàng chờ thanh toán',
          data: {
            orderCode: activePending.orderCode,
            planName: activePending.planName,
            amount: activePending.amount,
            qrUrl: activePending.qrUrl,
            bankInfo: activePending.bankInfo,
            transferContent: activePending.transferContent,
            createdAt: activePending.createdAt
          }
        });
      }
    }

    if (!userId) {
      userId = req.body.userId || `guest_${Math.floor(100000 + Math.random() * 900000)}`;
    }

    const planKey = (planId && PRICING_PLANS[planId]) ? planId : 'pro_4_months';
    const selectedPlan = PRICING_PLANS[planKey];
    if (!selectedPlan || selectedPlan.price <= 0) {
      return res.status(400).json({ success: false, message: 'Gói dịch vụ không yêu cầu thanh toán.' });
    }

    // Generate unique order code: TOEIC + 5 random alphanumeric chars
    const randomSuffix = Math.floor(10000 + Math.random() * 90000);
    const orderCode = `TOEIC${randomSuffix}`;
    const transferContent = `${orderCode}`;

    // Build VietQR Dynamic Image URL
    const qrUrl = `https://img.vietqr.io/image/${DEFAULT_BANK.bankId}-${DEFAULT_BANK.accountNo}-compact2.png?amount=${selectedPlan.price}&addInfo=${encodeURIComponent(transferContent)}&accountName=${encodeURIComponent(DEFAULT_BANK.accountName)}`;

    const order = await PaymentOrder.create({
      orderCode,
      userId,
      planId: selectedPlan.id,
      planName: selectedPlan.name,
      amount: selectedPlan.price,
      qrUrl,
      bankInfo: DEFAULT_BANK,
      transferContent,
      status: 'PENDING'
    });

    return res.status(201).json({
      success: true,
      message: 'Tạo đơn thanh toán thành công',
      data: {
        orderCode: order.orderCode,
        planName: order.planName,
        amount: order.amount,
        qrUrl: order.qrUrl,
        bankInfo: order.bankInfo,
        transferContent: order.transferContent,
        createdAt: order.createdAt
      }
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// 3. Check Order Status
exports.checkOrderStatus = async (req, res) => {
  try {
    const { orderCode } = req.params;
    const order = await PaymentOrder.findOne({ orderCode });

    if (!order) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy đơn hàng.' });
    }

    let isPro = order.status === 'PAID';
    let proTier = order.planId;
    let proExpiresAt = null;

    if (order.status === 'PAID') {
      const mongoose = require('mongoose');
      let user = null;
      if (mongoose.Types.ObjectId.isValid(order.userId)) {
        user = await User.findById(order.userId);
      }
      if (!user && order.userId) {
        user = await User.findOne({ email: order.userId });
      }
      if (user) {
        isPro = Boolean(user.isPro);
        proTier = user.proTier || order.planId;
        proExpiresAt = user.proExpiresAt;
      }
    }

    return res.status(200).json({
      success: true,
      data: {
        orderCode: order.orderCode,
        status: order.status,
        planId: order.planId,
        paidAt: order.paidAt,
        isPro,
        proTier,
        proExpiresAt
      }
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// 4. Webhook Receiver (SePay, PayOS, Casso, or Bank Hub with Multi-Layer Protection)
exports.handleWebhook = async (req, res) => {
  try {
    const payload = req.body || {};
    const webhookSecret = process.env.PAYMENT_WEBHOOK_SECRET || 'tuong_tan_toeic_webhook_secret_mb_secure_2026';
    
    // Extract transfer content and amount (supports standard SePay / PayOS / Casso format)
    const content = payload.content || 
      payload.description || 
      payload.transactionContent || 
      payload.body || 
      payload.orderCode || 
      payload.code || 
      '';

    const amount = Number(
      payload.transferAmount || 
      payload.amount || 
      payload.amountIn || 
      payload.amount_in || 
      0
    );

    const incomingAccount = (payload.accountNumber || payload.account_number || payload.subAccount || '').toString().trim();
    const clientIp = req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.ip || req.connection?.remoteAddress || '';

    console.log('[PAYMENT WEBHOOK RECEIVED]:', {
      orderCodeContent: content,
      amount,
      clientIp,
      account: incomingAccount
    });

    // Extract order code: e.g. TOEIC79934
    const match = content.match(/TOEIC\d{5}/i);
    const orderCode = match ? match[0].toUpperCase() : null;

    // Security Verification Layers:
    // 1. Secret token match (if configured in SePay / PayOS / Casso)
    const incomingSecret = req.headers['x-api-key'] || 
      req.headers['authorization'] || 
      req.headers['x-sepay-key'] ||
      req.headers['x-payos-key'] ||
      req.query?.secret || 
      payload.secret || 
      payload.webhookSecret ||
      payload.apiKey;

    const matchesConfiguredSecret = incomingSecret && (
      incomingSecret === webhookSecret ||
      incomingSecret === `Bearer ${webhookSecret}` ||
      incomingSecret === `Apikey ${webhookSecret}` ||
      incomingSecret.toString().trim() === webhookSecret.trim()
    );

    // 2. Known Gateway IPs (SePay, Casso, local dev)
    const isKnownGatewayIp = clientIp.includes('171.244.35.') || 
      clientIp.includes('103.149.28.') || 
      clientIp.includes('127.0.0.1') || 
      clientIp.includes('::1') ||
      clientIp === 'localhost';

    // 3. Bank Account matches our MB Bank account
    const matchesOurAccount = incomingAccount === DEFAULT_BANK.accountNo || incomingAccount === '0335847674';

    // 4. Valid authentic order exists in DB
    let pendingOrder = null;
    if (orderCode) {
      pendingOrder = await PaymentOrder.findOne({ orderCode });
    }

    const isAuthenticOrder = Boolean(pendingOrder);

    // Decision: Authorized if secret matches, or known IP, or our account, or authentic existing order
    const isAuthorized = matchesConfiguredSecret || isKnownGatewayIp || matchesOurAccount || isAuthenticOrder;

    if (!isAuthorized) {
      console.warn(`[SECURITY ALERT] Unauthorized payment webhook call rejected from IP: ${clientIp}`, {
        incomingAccount,
        orderCode
      });
      return res.status(401).json({ 
        success: false, 
        message: 'Unauthorized webhook access. Invalid secret or unrecognized bank gateway.' 
      });
    }

    if (!orderCode) {
      return res.status(200).json({ success: false, message: 'No matching TOEIC order code found in content.' });
    }

    const order = pendingOrder || await PaymentOrder.findOne({ orderCode });
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found for code: ' + orderCode });
    }

    // IDEMPOTENCY CHECK: Prevent double activation or replay attacks
    if (order.status === 'PAID') {
      return res.status(200).json({ success: true, message: 'Order was already processed.' });
    }

    // Verify amount (must meet or exceed plan price)
    if (amount > 0 && amount < order.amount) {
      return res.status(400).json({ success: false, message: 'Amount transferred is less than order amount.' });
    }

    // Mark order as PAID
    order.status = 'PAID';
    order.paidAt = new Date();
    order.webhookPayload = payload;
    if (!order.transferContent) {
      order.transferContent = orderCode;
    }
    await order.save();

    // Activate Pro Account — sync BOTH User model AND UserGoal model
    const { expiryDate } = await activateProAccount(order.userId, order.planId);

    console.log(`[PAYMENT ACTIVATION SUCCESS]: User ${order.userId} upgraded to ${order.planName} via order ${orderCode}`);

    return res.status(200).json({
      success: true,
      message: `Tài khoản ${order.userId} đã được nâng cấp thành công gói ${order.planName}!`,
      data: { orderCode, isPro: true, proTier: order.planId, expiresAt: expiryDate }
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ── SHARED HELPER: Activate Pro on both User + UserGoal models ──────────────
async function activateProAccount(userId, planId) {
  const plan = PRICING_PLANS[planId] || PRICING_PLANS['pro_4_months'];
  const expiryDate = new Date();
  expiryDate.setDate(expiryDate.getDate() + plan.durationDays);

  // 1. Update UserGoal model (legacy progress tracker)
  try {
    let userGoal = await UserGoal.findOne({ userId });
    if (userGoal) {
      userGoal.isPro = true;
      userGoal.proTier = planId;
      userGoal.proExpiresAt = expiryDate;
      await userGoal.save();
    }
  } catch (e) {}

  // 2. Update User model (source of truth for JWT auth)
  let user = null;
  const mongoose = require('mongoose');
  if (userId && mongoose.Types.ObjectId.isValid(userId)) {
    try { user = await User.findById(userId); } catch (e) {}
  }
  if (!user && userId) {
    try { user = await User.findOne({ $or: [{ userId }, { email: userId }] }); } catch (e) {}
  }

  if (user) {
    user.isPro = true;
    user.proTier = planId;
    user.proExpiresAt = expiryDate;
    await user.save();
  }

  return { expiryDate, plan };
}

// 5. Simulate Payment Success (Demo Mode / Developer Testing)
exports.simulatePaymentSuccess = async (req, res) => {
  try {
    const { orderCode } = req.params;
    const order = await PaymentOrder.findOne({ orderCode });

    if (!order) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy đơn hàng: ' + orderCode });
    }

    if (order.status === 'PAID') {
      return res.status(200).json({ success: true, message: 'Đơn hàng đã được thanh toán từ trước.' });
    }

    order.status = 'PAID';
    order.paidAt = new Date();
    order.webhookPayload = { simulated: true, time: new Date() };
    await order.save();

    // Activate Pro — sync both User + UserGoal models
    const { expiryDate } = await activateProAccount(order.userId, order.planId);

    return res.status(200).json({
      success: true,
      message: `[DEMO SIMULATION] Đã kích hoạt thành công ${order.planName}!`,
      data: { orderCode, isPro: true, proTier: order.planId, expiresAt: expiryDate }
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

