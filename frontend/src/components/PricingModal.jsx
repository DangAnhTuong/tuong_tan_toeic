import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import axios from 'axios';
import { 
  X, 
  Crown, 
  Check, 
  Sparkles, 
  Zap, 
  ShieldCheck, 
  Copy, 
  Clock, 
  Loader2, 
  CheckCircle2,
  ArrowRight,
  QrCode,
  CreditCard,
  Flame,
  Award,
  AlertTriangle,
  RefreshCw,
  Calendar,
  Lock
} from 'lucide-react';
import { getStoredUser, setStoredUser } from '../utils/auth';

export default function PricingModal({ isOpen, onClose, onUpgradeSuccess }) {
  const [plans, setPlans] = useState([]);
  const [selectedPlanId, setSelectedPlanId] = useState('pro_4_months');
  const [currentStep, setCurrentStep] = useState('select_plan'); // 'select_plan' | 'qr_payment' | 'success' | 'already_vip'
  const [orderData, setOrderData] = useState(null);
  const [isCreatingOrder, setIsCreatingOrder] = useState(false);
  const [isCheckingManual, setIsCheckingManual] = useState(false);
  const [manualCheckNotice, setManualCheckNotice] = useState(null);
  const [pendingOrder, setPendingOrder] = useState(null);
  const [myStatus, setMyStatus] = useState(null);
  const [forceShowPlans, setForceShowPlans] = useState(false);
  const [copyStatus, setCopyStatus] = useState({ account: false, content: false });
  const [timeLeft, setTimeLeft] = useState(900); // 15 mins
  const [currentUser, setCurrentUser] = useState(getStoredUser());

  // Default fallback plans: 2 Tiers (Free & 4-Month VIP 99k)
  const fallbackPlans = [
    {
      id: 'free',
      name: 'Gói Miễn Phí (Free)',
      price: 0,
      originalPrice: 0,
      durationDays: 3650,
      isFree: true,
      features: [
        'Trải nghiệm 20 câu đầu mỗi Level Nghe & Đọc Part 1 - 7',
        'Luyện 2 chuyên đề Ngữ pháp căn bản & Đề thi Test 1 (200 câu)',
        'Học 6 bộ từ vựng 600 TOEIC & Mini game ghép từ',
        'Xem bài đọc song ngữ Level 1',
        'Đấu trường 1v1 & Sổ tay câu sai cá nhân'
      ]
    },
    {
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
  ];

  // Fetch plans and check user payment status on open
  useEffect(() => {
    async function checkUserAndPlans() {
      const stored = getStoredUser();
      setCurrentUser(stored);
      setManualCheckNotice(null);
      setForceShowPlans(false);

      // 1. Fetch public pricing plans
      try {
        const resPlans = await axios.get('/api/v1/payment/plans');
        if (resPlans.data?.data && resPlans.data.data.length > 0) {
          setPlans(resPlans.data.data);
        } else {
          setPlans(fallbackPlans);
        }
      } catch (err) {
        setPlans(fallbackPlans);
      }

      // 2. Check live user payment and VIP status from backend
      try {
        const resStatus = await axios.get('/api/v1/payment/my-status');
        if (resStatus.data?.success) {
          const { isPro, proTier, proExpiresAt, latestOrder } = resStatus.data;
          setMyStatus(resStatus.data);

          if (isPro) {
            // Synchronize with local storage if not marked yet
            setStoredUser({ ...(stored || {}), isPro: true, proTier: proTier || 'pro_4_months', proExpiresAt });
            if (onUpgradeSuccess) onUpgradeSuccess();
            setCurrentStep('already_vip');
            return;
          }

          // If not Pro yet, check if there is an active pending order in the last 30 mins
          if (latestOrder && latestOrder.status === 'PENDING') {
            const orderAgeMs = Date.now() - new Date(latestOrder.createdAt).getTime();
            if (orderAgeMs < 30 * 60 * 1000) {
              setPendingOrder(latestOrder);
            } else {
              setPendingOrder(null);
            }
          } else {
            setPendingOrder(null);
          }
        }
      } catch (err) {
        console.warn('Could not fetch user payment status:', err);
      }

      // If already VIP in localStorage
      if (stored?.isPro) {
        if (onUpgradeSuccess) onUpgradeSuccess();
        setCurrentStep('already_vip');
      } else {
        setCurrentStep('select_plan');
      }
      setSelectedPlanId('pro_4_months');
      setOrderData(null);
    }

    if (isOpen) {
      checkUserAndPlans();
    }
  }, [isOpen]);

  // Polling order status while on QR step
  useEffect(() => {
    let timer = null;
    let pollInterval = null;

    if (currentStep === 'qr_payment' && orderData?.orderCode) {
      // Countdown
      timer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      // Poll status every 3s
      pollInterval = setInterval(async () => {
        try {
          const res = await axios.get(`/api/v1/payment/check-status/${orderData.orderCode}`);
          const ord = res.data?.data;
          if (ord?.status === 'PAID' || ord?.isPro) {
            clearInterval(pollInterval);
            // Update local user
            const current = getStoredUser();
            const updated = setStoredUser({
              ...current,
              isPro: true,
              proTier: ord.proTier || 'pro_4_months',
              proExpiresAt: ord.proExpiresAt
            });
            setCurrentUser(updated);
            setPendingOrder(null);
            setCurrentStep('success');
            if (onUpgradeSuccess) onUpgradeSuccess();
          }
        } catch (e) {}
      }, 3000);
    }

    return () => {
      if (timer) clearInterval(timer);
      if (pollInterval) clearInterval(pollInterval);
    };
  }, [currentStep, orderData]);

  if (!isOpen) return null;

  const displayPlans = plans.length > 0 ? plans : fallbackPlans;
  const currentPlan = displayPlans.find(p => p.id === selectedPlanId) || displayPlans[1] || displayPlans[0];

  // Format currency VND
  const formatCurrency = (val) => {
    if (!val || val === 0) return '0 ₫';
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val);
  };

  // Format time MM:SS
  const formatTime = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Manual Check Payment
  const handleManualCheck = async (targetOrderCode) => {
    const code = targetOrderCode || orderData?.orderCode || pendingOrder?.orderCode;
    if (!code) return;

    setIsCheckingManual(true);
    setManualCheckNotice({
      type: 'info',
      text: 'Đang kết nối đối soát trực tiếp với SePay và MB Bank...'
    });

    try {
      // 1. Check order status
      const resOrder = await axios.get(`/api/v1/payment/check-status/${code}`);
      const ordInfo = resOrder.data?.data;

      // 2. Check my-status
      const resMy = await axios.get('/api/v1/payment/my-status');
      const isNowPro = Boolean(ordInfo?.status === 'PAID' || resMy.data?.isPro);

      if (isNowPro) {
        const current = getStoredUser();
        const updated = setStoredUser({
          ...current,
          isPro: true,
          proTier: ordInfo?.proTier || resMy.data?.proTier || 'pro_4_months',
          proExpiresAt: ordInfo?.proExpiresAt || resMy.data?.proExpiresAt
        });
        setCurrentUser(updated);
        setPendingOrder(null);
        setCurrentStep('success');
        if (onUpgradeSuccess) onUpgradeSuccess();
      } else {
        setManualCheckNotice({
          type: 'warning',
          text: `Hệ thống chưa nhận được tín hiệu trừ tiền cho mã [${code}]. Nếu bạn vừa chuyển khoản thành công trong App ngân hàng, hệ thống sẽ tự động kích hoạt sau 5 - 30 giây. Xin vui lòng KHÔNG chuyển khoản lại!`
        });
      }
    } catch (err) {
      setManualCheckNotice({
        type: 'error',
        text: 'Chưa thể kết nối tới cổng thanh toán, vui lòng thử lại sau vài giây.'
      });
    } finally {
      setIsCheckingManual(false);
    }
  };

  // Create or Resume Order
  const handleProceedToPayment = async () => {
    if (currentPlan.isFree || currentPlan.price === 0) {
      onClose();
      return;
    }

    setIsCreatingOrder(true);
    setManualCheckNotice(null);
    try {
      const res = await axios.post('/api/v1/payment/create-order', {
        planId: selectedPlanId,
        forceExtend: forceShowPlans
      });

      if (res.data?.alreadyPro) {
        // Already VIP!
        const current = getStoredUser();
        setStoredUser({ ...current, isPro: true, ...res.data.data });
        setCurrentStep('already_vip');
        return;
      }

      if (res.data?.data) {
        const ord = res.data.data;
        setOrderData(ord);
        if (res.data?.isExistingPending) {
          setManualCheckNotice({
            type: 'warning',
            text: `Bạn đang có lệnh chuyển khoản [${ord.orderCode}] đang chờ đối soát. Hệ thống đang hiển thị lại mã QR cũ để tránh chuyển khoản 2 lần!`
          });
        }
        setTimeLeft(900);
        setCurrentStep('qr_payment');
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Không thể tạo đơn hàng, vui lòng đăng nhập và thử lại.');
    } finally {
      setIsCreatingOrder(false);
    }
  };

  // Copy to clipboard
  const handleCopy = (text, type) => {
    navigator.clipboard.writeText(text);
    setCopyStatus(prev => ({ ...prev, [type]: true }));
    setTimeout(() => {
      setCopyStatus(prev => ({ ...prev, [type]: false }));
    }, 2000);
  };

  return createPortal(
    <div 
      className="fixed inset-0 z-[9999] bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div 
        className="max-w-3xl w-full glass-card rounded-3xl border border-slate-800 bg-slate-950 p-6 md:p-8 space-y-6 relative animate-scaleUp max-h-[92vh] overflow-y-auto shadow-2xl my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* STEP: ALREADY VIP (Khi tài khoản đã lên VIP) */}
        {currentStep === 'already_vip' && !forceShowPlans && (
          <div className="py-6 space-y-6 text-center max-w-xl mx-auto animate-scaleUp">
            
            {/* VIP Crown Glow Badge */}
            <div className="relative inline-block">
              <div className="w-24 h-24 rounded-3xl bg-gradient-to-tr from-amber-500 via-amber-400 to-yellow-300 flex items-center justify-center mx-auto shadow-2xl shadow-amber-500/40 animate-pulse">
                <Crown className="w-12 h-12 text-slate-950" />
              </div>
              <div className="absolute -top-1 -right-1 px-2.5 py-0.5 rounded-full bg-emerald-500 text-slate-950 text-[10px] font-black uppercase tracking-wider border-2 border-slate-950 shadow">
                ACTIVE ✓
              </div>
            </div>

            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5" />
                <span>TÀI KHOẢN CỦA BẠN ĐÃ LÀ VIP GOLD</span>
              </div>
              <h2 className="text-2xl md:text-3xl font-heading font-extrabold text-white">
                Bạn Đang Sở Hữu Trọn Quyền Lợi VIP
              </h2>
              <p className="text-xs md:text-sm text-slate-300 leading-relaxed max-w-md mx-auto">
                Hệ thống ghi nhận bạn đã chuyển khoản và kích hoạt thành công gói VIP. <strong className="text-amber-400">Bạn KHÔNG cần phải chuyển khoản lại!</strong>
              </p>
            </div>

            {/* VIP Status Card */}
            <div className="p-5 rounded-2xl bg-gradient-to-b from-slate-900 to-amber-950/20 border border-amber-500/40 text-left space-y-3 shadow-xl">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2.5">
                  <Award className="w-5 h-5 text-amber-400" />
                  <span className="font-heading font-bold text-white text-sm">Gói Dịch Vụ:</span>
                </div>
                <span className="font-heading font-black text-amber-300 text-sm">
                  VIP Khai Trương (4 Tháng)
                </span>
              </div>

              <div className="flex items-center justify-between border-b border-slate-800 pb-3 text-xs">
                <span className="text-slate-400">Trạng thái tài khoản:</span>
                <span className="px-2.5 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 font-bold flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Đã kích hoạt & Đang hoạt động
                </span>
              </div>

              {myStatus?.proExpiresAt && (
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">Thời hạn sử dụng đến:</span>
                  <span className="font-mono font-bold text-cyan-300">
                    {new Date(myStatus.proExpiresAt).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                  </span>
                </div>
              )}
            </div>

            {/* Unlocked Benefits Highlights */}
            <div className="grid grid-cols-2 gap-2 text-left text-[11px] text-slate-300 pt-1">
              <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center gap-2">
                <Check className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span>18.200 câu hỏi ETS 2019 - 2026</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center gap-2">
                <Check className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span>11.785 câu Nghe Chép & AI</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center gap-2">
                <Check className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span>83 chủ đề SRS 3.515+ từ vựng</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center gap-2">
                <Check className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span>Lời giải chi tiết & mẹo bẫy ETS</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3 pt-2">
              <button
                onClick={() => {
                  const current = getStoredUser() || {};
                  setStoredUser({ 
                    ...current, 
                    isPro: true, 
                    proTier: myStatus?.proTier || current.proTier || 'pro_4_months', 
                    proExpiresAt: myStatus?.proExpiresAt || current.proExpiresAt 
                  });
                  if (onUpgradeSuccess) onUpgradeSuccess();
                  onClose();
                }}
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-amber-400 via-amber-500 to-orange-400 hover:from-amber-300 hover:to-orange-300 text-slate-950 font-heading font-black text-sm shadow-xl shadow-amber-500/30 transition-all hover:scale-[1.02] flex items-center justify-center gap-2 cursor-pointer"
              >
                <Zap className="w-4 h-4 fill-slate-950" />
                <span>Bắt Đầu Luyện Thi Ngay</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={() => setForceShowPlans(true)}
                className="text-xs text-slate-400 hover:text-amber-400 transition-colors underline cursor-pointer"
              >
                Tôi muốn xem bảng giá hoặc gia hạn thêm thời gian
              </button>
            </div>
          </div>
        )}

        {/* STEP 1: SELECT PLAN */}
        {(currentStep === 'select_plan' || (currentStep === 'already_vip' && forceShowPlans)) && (
          <div className="space-y-6">
            
            {/* Header */}
            <div className="text-center space-y-2 max-w-xl mx-auto">
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold uppercase tracking-wider">
                <Crown className="w-4 h-4" />
                <span>NÂNG CẤP TƯỜNG TẬN TOEIC PRO</span>
              </div>
              <h2 className="text-2xl md:text-3xl font-heading font-extrabold text-white">
                Bứt Phá Mục Tiêu TOEIC 750+ Cùng AI
              </h2>
              <p className="text-xs md:text-sm text-slate-400">
                Mở khóa toàn diện 4 kỹ năng Nghe - Nói - Đọc - Viết & 18.200 câu hỏi ETS có lời giải chi tiết
              </p>
            </div>

            {/* PENDING ORDER NOTIFICATION BANNER (NẾU ĐÃ CHUYỂN KHOẢN HOẶC CÓ ĐƠN ĐANG CHỜ) */}
            {pendingOrder && (
              <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-950/40 via-amber-900/25 to-slate-900 border-2 border-amber-500/50 text-amber-200 shadow-xl shadow-amber-500/10 space-y-3">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 shrink-0 mt-0.5">
                    <AlertTriangle className="w-5 h-5 animate-pulse" />
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-heading font-extrabold text-white text-sm">
                        Bạn đang có đơn thanh toán #{pendingOrder.orderCode} ({formatCurrency(pendingOrder.amount)})
                      </span>
                      <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-bold border border-amber-500/40">
                        Đang chờ đối soát
                      </span>
                    </div>
                    <p className="text-xs text-amber-300/90 leading-relaxed">
                      Nếu bạn <strong>ĐÃ CHUYỂN KHOẢN</strong> qua App ngân hàng, xin vui lòng <strong>KHÔNG chuyển khoản lại</strong> để tránh trừ tiền thừa! Hệ thống đang tự động đối soát và kích hoạt VIP.
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2.5 pt-1 border-t border-amber-500/20">
                  <button
                    onClick={() => handleManualCheck(pendingOrder.orderCode)}
                    disabled={isCheckingManual}
                    className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-heading font-black text-xs shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    {isCheckingManual ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Đang kiểm tra đối soát...</span>
                      </>
                    ) : (
                      <>
                        <RefreshCw className="w-3.5 h-3.5" />
                        <span>Tôi Đã Chuyển Khoản — Kích Hoạt Ngay</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={() => {
                      setOrderData(pendingOrder);
                      setTimeLeft(900);
                      setCurrentStep('qr_payment');
                    }}
                    className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs border border-slate-700 transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <QrCode className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Xem lại mã QR #{pendingOrder.orderCode}</span>
                  </button>
                </div>
              </div>
            )}

            {/* Pricing Cards Grid (2 Tiers) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-2">
              {displayPlans.map((plan) => {
                const isSelected = selectedPlanId === plan.id;
                const isFree = Boolean(plan.isFree || plan.price === 0);

                return (
                  <div
                    key={plan.id}
                    onClick={() => setSelectedPlanId(plan.id)}
                    className={`relative rounded-3xl p-6 border transition-all cursor-pointer flex flex-col justify-between ${
                      isSelected
                        ? isFree
                          ? 'bg-slate-900/90 border-slate-500 shadow-xl shadow-slate-500/10 ring-1 ring-slate-400'
                          : 'bg-gradient-to-b from-slate-900/95 to-amber-950/20 border-amber-400 shadow-2xl shadow-amber-500/15 ring-2 ring-amber-400/80 scale-[1.02]'
                        : 'bg-slate-950 border-slate-800 hover:border-slate-700 hover:bg-slate-900/40'
                    }`}
                  >
                    {/* Badge */}
                    {plan.discountBadge && (
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider shadow-lg bg-gradient-to-r from-amber-400 via-orange-500 to-rose-500 text-slate-950 shrink-0 whitespace-nowrap">
                        {plan.discountBadge}
                      </div>
                    )}

                    <div className="space-y-4 pt-1">
                      <div className="space-y-1.5 border-b border-slate-800/80 pb-4">
                        <div className="flex items-center justify-between">
                          <h3 className="font-heading font-extrabold text-lg text-white">
                            {plan.name}
                          </h3>
                          {!isFree && (
                            <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-bold text-[10px] border border-amber-500/30">
                              4 THÁNG
                            </span>
                          )}
                        </div>

                        <div className="flex items-baseline gap-2 pt-1">
                          {isFree ? (
                            <span className="text-3xl font-black font-mono text-emerald-400">
                              Miễn Phí
                            </span>
                          ) : (
                            <>
                              <span className="text-3xl font-black font-mono text-amber-400">
                                {formatCurrency(plan.price)}
                              </span>
                              {plan.originalPrice > plan.price && (
                                <span className="text-sm font-bold font-mono text-slate-500 line-through">
                                  {formatCurrency(plan.originalPrice)}
                                </span>
                              )}
                              <span className="text-xs text-slate-400 font-medium">/ 4 tháng</span>
                            </>
                          )}
                        </div>
                      </div>

                      {/* Feature List */}
                      <ul className="space-y-2.5 text-xs text-slate-300">
                        {plan.features.map((feat, idx) => (
                          <li key={idx} className="flex items-start gap-2.5">
                            <Check className={`w-4 h-4 shrink-0 mt-0.5 ${isFree ? 'text-slate-400' : 'text-amber-400'}`} />
                            <span className="leading-snug">{feat}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="pt-6">
                      <button
                        className={`w-full py-3 rounded-xl text-xs font-heading font-extrabold transition-all flex items-center justify-center gap-1.5 ${
                          isSelected
                            ? isFree
                              ? 'bg-slate-800 hover:bg-slate-700 text-white shadow-md'
                              : 'bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 shadow-lg shadow-amber-500/25 font-black'
                            : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
                        }`}
                      >
                        <span>
                          {isSelected 
                            ? (isFree ? 'Gói Đang Sử Dụng' : 'Gói Đang Chọn 🔥') 
                            : (isFree ? 'Chọn Gói Này' : 'Nâng Cấp Gói VIP')
                          }
                        </span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Bottom Action */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-800">
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Kích hoạt tự động sau 2s quét QR • Bảo hành hoàn tiền 100%</span>
              </div>

              {currentPlan.isFree ? (
                <button
                  onClick={onClose}
                  className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-white font-heading font-bold text-sm transition-all cursor-pointer"
                >
                  Bắt Đầu Học Miễn Phí
                </button>
              ) : (
                <button
                  onClick={handleProceedToPayment}
                  disabled={isCreatingOrder}
                  className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-gradient-to-r from-amber-400 via-amber-500 to-orange-400 hover:from-amber-300 hover:to-orange-300 text-slate-950 font-heading font-black text-sm shadow-xl shadow-amber-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  {isCreatingOrder ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Đang tạo mã VietQR...</span>
                    </>
                  ) : (
                    <>
                      <span>Thanh Toán VietQR ({formatCurrency(currentPlan.price)})</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              )}
            </div>

          </div>
        )}

        {/* STEP 2: VIETQR PAYMENT SCAN */}
        {currentStep === 'qr_payment' && orderData && (
          <div className="space-y-6">
            
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <span className="text-[10px] font-extrabold text-teal-400 uppercase tracking-wider">
                  BƯỚC 2: QUÉT MÃ VIETQR QUA ỨNG DỤNG NGÂN HÀNG
                </span>
                <h3 className="font-heading font-extrabold text-xl text-white">
                  Đơn Hàng #{orderData.orderCode}
                </h3>
              </div>

              <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-amber-400 font-mono font-bold text-xs">
                <Clock className="w-3.5 h-3.5 animate-pulse" />
                <span>Hết hạn sau: {formatTime(timeLeft)}</span>
              </div>
            </div>

            {/* Manual Check Notice Banner */}
            {manualCheckNotice && (
              <div className={`p-3.5 rounded-2xl border text-xs leading-relaxed flex items-start gap-2.5 animate-fadeIn ${
                manualCheckNotice.type === 'warning' 
                  ? 'bg-amber-500/15 border-amber-500/40 text-amber-200' 
                  : manualCheckNotice.type === 'info'
                  ? 'bg-cyan-500/15 border-cyan-500/40 text-cyan-200'
                  : 'bg-rose-500/15 border-rose-500/40 text-rose-200'
              }`}>
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{manualCheckNotice.text}</span>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
              
              {/* LEFT: VIETQR CODE IMAGE (5 COLS) */}
              <div className="md:col-span-5 flex flex-col items-center justify-center p-4 rounded-3xl bg-white text-slate-950 shadow-2xl">
                <img 
                  src={orderData.qrUrl} 
                  alt="VietQR Payment"
                  className="w-full max-w-[260px] h-auto object-contain rounded-xl"
                />
                <div className="mt-2 text-center">
                  <span className="text-[11px] font-bold text-slate-600 block">
                    Mở App Ngân hàng bất kỳ để Quét Mã QR
                  </span>
                  <span className="text-[10px] text-slate-400 font-medium">
                    Hỗ trợ Vietcombank, MB, Techcombank, VPBank, Momo...
                  </span>
                </div>
              </div>

              {/* RIGHT: TRANSFER DETAILS & MANUAL INFO (7 COLS) */}
              <div className="md:col-span-7 space-y-4">
                
                <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-3 text-xs">
                  
                  {/* Ngân Hàng */}
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                    <span className="text-slate-400 font-medium">Ngân hàng:</span>
                    <span className="font-bold text-white uppercase font-mono">
                      MB BANK (Ngân hàng Quân Đội)
                    </span>
                  </div>

                  {/* Số tài khoản */}
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                    <span className="text-slate-400 font-medium">Số tài khoản:</span>
                    <div className="flex items-center gap-2">
                      <span className="font-bold font-mono text-sm text-cyan-400">{orderData.bankInfo?.accountNo}</span>
                      <button
                        onClick={() => handleCopy(orderData.bankInfo?.accountNo, 'account')}
                        className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] font-bold flex items-center gap-1 cursor-pointer"
                      >
                        <Copy className="w-3 h-3" />
                        <span>{copyStatus.account ? 'Đã chép' : 'Sao chép'}</span>
                      </button>
                    </div>
                  </div>

                  {/* Chủ tài khoản */}
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                    <span className="text-slate-400 font-medium">Chủ tài khoản:</span>
                    <span className="font-bold text-white font-mono uppercase">{orderData.bankInfo?.accountName}</span>
                  </div>

                  {/* Số tiền */}
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                    <span className="text-slate-400 font-medium">Số tiền thanh toán:</span>
                    <span className="font-black text-base font-mono text-amber-400">
                      {formatCurrency(orderData.amount)}
                    </span>
                  </div>

                  {/* Nội dung chuyển khoản (QUAN TRỌNG NHẤT) */}
                  <div className="flex items-center justify-between pt-1">
                    <span className="text-amber-400 font-bold">Nội dung CK (Bắt buộc):</span>
                    <div className="flex items-center gap-2">
                      <span className="font-black font-mono text-sm px-2 py-0.5 rounded bg-amber-500/20 border border-amber-500/40 text-amber-300">
                        {orderData.transferContent}
                      </span>
                      <button
                        onClick={() => handleCopy(orderData.transferContent, 'content')}
                        className="p-1 rounded bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 text-[10px] font-bold flex items-center gap-1 border border-amber-500/40 cursor-pointer"
                      >
                        <Copy className="w-3 h-3" />
                        <span>{copyStatus.content ? 'Đã chép' : 'Sao chép'}</span>
                      </button>
                    </div>
                  </div>

                </div>

                {/* Instant Check Button */}
                <button
                  onClick={() => handleManualCheck(orderData.orderCode)}
                  disabled={isCheckingManual}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-slate-950 font-heading font-black text-xs shadow-lg shadow-teal-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  {isCheckingManual ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Đang kiểm tra đối soát với MB Bank...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      <span>TÔI ĐÃ CHUYỂN KHOẢN RỒI — KIỂM TRA & LÊN VIP NGAY</span>
                    </>
                  )}
                </button>

                {/* Status indicator */}
                <div className="p-3 rounded-xl bg-teal-500/10 border border-teal-500/20 flex items-center gap-2 text-xs text-teal-300 animate-pulse">
                  <Loader2 className="w-4 h-4 animate-spin text-teal-400 shrink-0" />
                  <span>Hệ thống đang tự động lắng nghe giao dịch chuyển khoản... (Tự kích hoạt sau 2s)</span>
                </div>

                {/* Trust & Guarantee Pill */}
                <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between text-xs">
                  <span className="text-slate-400">🛡️ Tự động kích hoạt ngay sau khi ngân hàng nhận tiền.</span>
                  <span className="text-amber-400 font-bold font-mono">100% Realtime</span>
                </div>

              </div>

            </div>

            {/* Back Button */}
            <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-xs">
              <button
                onClick={() => setCurrentStep('select_plan')}
                className="text-slate-400 hover:text-white font-semibold cursor-pointer"
              >
                ← Quay lại chọn gói khác
              </button>
            </div>

          </div>
        )}

        {/* STEP 3: PAYMENT SUCCESS */}
        {currentStep === 'success' && (
          <div className="py-8 space-y-6 text-center max-w-md mx-auto animate-scaleUp">
            <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-emerald-400 to-teal-400 flex items-center justify-center mx-auto shadow-2xl shadow-emerald-500/30">
              <CheckCircle2 className="w-10 h-10 text-slate-950" />
            </div>

            <div className="space-y-2">
              <span className="text-[10px] font-extrabold text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20 uppercase tracking-wider">
                GIAO DỊCH HOÀN TẤT THÀNH CÔNG 🎉
              </span>
              <h2 className="text-2xl md:text-3xl font-heading font-extrabold text-white">
                Chào Mừng Bạn Đến Với TOEIC PRO!
              </h2>
              <p className="text-xs text-slate-300 leading-relaxed">
                Tài khoản của bạn đã được kích hoạt đầy đủ quyền lợi VIP. Toàn bộ 18.200 câu hỏi ETS, AI Speaking và Writing đã sẵn sàng phục vụ bạn.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900 border border-emerald-500/30 flex items-center justify-center gap-3">
              <Award className="w-6 h-6 text-amber-400" />
              <span className="font-heading font-black text-amber-300 text-sm">
                TRẠNG THÁI: TÀI KHOẢN VIP GOLD
              </span>
            </div>

            <button
              onClick={() => {
                onClose();
              }}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-heading font-black text-sm shadow-xl shadow-emerald-500/30 transition-all hover:scale-105 cursor-pointer"
            >
              Bắt Đầu Luyện Đề Ngay
            </button>
          </div>
        )}

      </div>
    </div>,
    document.body
  );
}
