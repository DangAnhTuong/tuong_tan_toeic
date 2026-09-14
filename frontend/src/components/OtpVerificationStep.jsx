import React, { useState, useEffect, useRef } from 'react';
import { Mail, ArrowLeft, RefreshCw, CheckCircle2, AlertCircle, ShieldCheck } from 'lucide-react';
import { apiVerifyRegistrationOtp, apiSendRegistrationOtp } from '../utils/auth';

export default function OtpVerificationStep({
  email,
  password,
  fullName,
  initialDevOtp = null,
  onSuccess,
  onBack
}) {
  const [otpDigits, setOtpDigits] = useState(['', '', '', '', '', '']);
  const [countdown, setCountdown] = useState(60);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);
  const [successMsg, setSuccessMsg] = useState(
    initialDevOtp 
      ? `Mã xác thực thử nghiệm: ${initialDevOtp}` 
      : 'Mã xác thực đã được gửi đến hộp thư của bạn.'
  );

  const inputRefs = useRef([]);

  // Auto-focus first input on mount
  useEffect(() => {
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, []);

  // 60-second countdown timer for resend
  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setInterval(() => {
      setCountdown((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [countdown]);

  const handleDigitChange = (index, value) => {
    // Only allow numeric input
    const cleanVal = value.replace(/\D/g, '');
    if (!cleanVal) {
      const newDigits = [...otpDigits];
      newDigits[index] = '';
      setOtpDigits(newDigits);
      return;
    }

    // Handle single digit
    const digit = cleanVal.slice(-1);
    const newDigits = [...otpDigits];
    newDigits[index] = digit;
    setOtpDigits(newDigits);
    setErrorMsg(null);

    // Auto-focus next input
    if (index < 5) {
      inputRefs.current[index + 1]?.focus();
    } else {
      // If 6th digit entered, auto submit
      const fullCode = newDigits.join('');
      if (fullCode.length === 6) {
        verifyCode(fullCode);
      }
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace') {
      if (!otpDigits[index] && index > 0) {
        // Move to previous input on backspace if current is empty
        inputRefs.current[index - 1]?.focus();
      }
    } else if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === 'ArrowRight' && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (!pastedData) return;

    const newDigits = [...otpDigits];
    for (let i = 0; i < 6; i++) {
      newDigits[i] = pastedData[i] || '';
    }
    setOtpDigits(newDigits);
    setErrorMsg(null);

    if (pastedData.length === 6) {
      inputRefs.current[5]?.focus();
      verifyCode(pastedData);
    } else {
      const nextIndex = Math.min(pastedData.length, 5);
      inputRefs.current[nextIndex]?.focus();
    }
  };

  const verifyCode = async (codeToVerify) => {
    const code = codeToVerify || otpDigits.join('');
    if (code.length < 6) {
      setErrorMsg('Vui lòng nhập đủ 6 chữ số mã xác thực.');
      return;
    }

    setIsVerifying(true);
    setErrorMsg(null);

    try {
      const res = await apiVerifyRegistrationOtp(email, code);
      if (res?.token && res?.data) {
        setSuccessMsg('🎉 Xác thực thành công! Đang vào học...');
        setTimeout(() => {
          onSuccess(res.data, res.token);
        }, 500);
      } else {
        throw new Error('Xác thực không thành công.');
      }
    } catch (err) {
      console.error('Verify OTP error:', err);
      const msg = err.response?.data?.message || 'Mã xác thực OTP không đúng hoặc đã hết hạn.';
      setErrorMsg(msg);
      // Reset input focus
      inputRefs.current[0]?.focus();
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResend = async () => {
    if (countdown > 0 || isResending) return;
    setIsResending(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const res = await apiSendRegistrationOtp(email, password, fullName);
      setCountdown(60);
      setOtpDigits(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
      if (res?.devOtp) {
        setSuccessMsg(`Đã gửi lại mã mới! (Mã thử nghiệm: ${res.devOtp})`);
      } else {
        setSuccessMsg('Mã OTP mới đã được gửi vào hòm thư Gmail của bạn!');
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Không thể gửi lại mã lúc này. Vui lòng thử lại sau ít phút.');
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="space-y-5 animate-fadeIn">
      {/* Top back button */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Sửa thông tin</span>
        </button>
        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
          <ShieldCheck className="w-3 h-3" /> Xác thực Gmail thật
        </span>
      </div>

      {/* Hero Info */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 shadow-lg shadow-emerald-500/10">
          <Mail className="w-6 h-6" />
        </div>
        <h3 className="text-xl font-black text-white tracking-tight">
          Nhập Mã Xác Thực OTP
        </h3>
        <p className="text-xs text-slate-400 leading-relaxed max-w-sm mx-auto">
          Mã xác thực gồm 6 chữ số đã được gửi đến hòm thư:
          <br />
          <strong className="text-emerald-300 font-semibold break-all">{email}</strong>
        </p>
      </div>

      {/* Alert notifications */}
      {errorMsg && (
        <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2 font-medium">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
          <span>{errorMsg}</span>
        </div>
      )}

      {successMsg && !errorMsg && (
        <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2 font-medium">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* 6-Digit OTP Input Boxes */}
      <div className="flex justify-center items-center gap-2 sm:gap-3 py-2" onPaste={handlePaste}>
        {otpDigits.map((digit, idx) => (
          <input
            key={idx}
            ref={(el) => (inputRefs.current[idx] = el)}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={digit}
            onChange={(e) => handleDigitChange(idx, e.target.value)}
            onKeyDown={(e) => handleKeyDown(idx, e)}
            disabled={isVerifying}
            className={`w-11 h-13 sm:w-12 sm:h-14 text-center text-xl sm:text-2xl font-mono font-black rounded-2xl bg-slate-950 border transition-all duration-200 outline-none ${
              digit
                ? 'border-emerald-500 text-emerald-400 shadow-lg shadow-emerald-500/20 bg-emerald-500/5'
                : 'border-slate-800 text-white focus:border-emerald-500/60 focus:bg-slate-900'
            } ${errorMsg ? 'border-rose-500/50' : ''}`}
          />
        ))}
      </div>

      {/* Submit Button */}
      <button
        type="button"
        onClick={() => verifyCode()}
        disabled={isVerifying || otpDigits.join('').length < 6}
        className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold text-sm flex items-center justify-center gap-2 transition-all active:scale-[0.98] shadow-lg shadow-emerald-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isVerifying ? (
          <>
            <RefreshCw className="w-4 h-4 animate-spin" />
            <span>Đang xác thực mã...</span>
          </>
        ) : (
          <span>Xác Nhận & Tạo Tài Khoản</span>
        )}
      </button>

      {/* Resend OTP & Notes */}
      <div className="text-center space-y-2 pt-1">
        <div className="text-xs text-slate-400">
          {countdown > 0 ? (
            <span>
              Chưa nhận được mã? Gửi lại sau <strong className="text-emerald-400 font-mono">{countdown}s</strong>
            </span>
          ) : (
            <button
              type="button"
              onClick={handleResend}
              disabled={isResending}
              className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 underline underline-offset-4 transition-colors disabled:opacity-60 inline-flex items-center gap-1"
            >
              {isResending && <RefreshCw className="w-3 h-3 animate-spin" />}
              <span>Gửi lại mã xác thực OTP</span>
            </button>
          )}
        </div>

        <p className="text-[11px] text-slate-500 leading-normal">
          💡 Vui lòng kiểm tra kỹ hòm thư <strong>Hộp thư đến</strong> hoặc thư mục <strong>Spam / Thư rác</strong>.
        </p>
      </div>
    </div>
  );
}
