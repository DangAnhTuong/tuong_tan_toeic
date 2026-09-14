import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { useGoogleLogin } from '@react-oauth/google';
import { useAuth } from '../context/AuthContext';
import { apiGoogleAuth } from '../utils/auth';
import { 
  X, 
  Flame, 
  Zap, 
  BookMarked, 
  AlertCircle,
  CheckCircle2,
  Sparkles,
  ShieldCheck,
  Check,
  Lock
} from 'lucide-react';

export default function AuthModal() {
  const { authModalConfig, closeAuthModal, login } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState(null);

  const handleClose = () => {
    setAlert(null);
    closeAuthModal();
  };

  const handleSuccess = (userData, jwtToken) => {
    login(userData, jwtToken);
    setAlert({
      type: 'success',
      message: `🎉 Chào mừng ${userData.fullName || 'bạn'}! Đang chuyển vào bài học...`
    });

    setTimeout(() => {
      handleClose();
      if (typeof authModalConfig.onSuccessCallback === 'function') {
        authModalConfig.onSuccessCallback();
      } else if (authModalConfig.redirectUrl) {
        navigate(authModalConfig.redirectUrl);
      }
    }, 600);
  };

  // Google OAuth 1-Click Login (Standard across Đậu TOEIC & Modern EdTech)
  const googleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setLoading(true);
      setAlert(null);
      try {
        if (tokenResponse?.access_token) {
          const res = await apiGoogleAuth({
            accessToken: tokenResponse.access_token
          });
          if (res?.token && res?.data) {
            handleSuccess(res.data, res.token);
          } else {
            throw new Error('Xác thực Google không thành công.');
          }
        }
      } catch (err) {
        console.error('Google auth error:', err);
        setAlert({
          type: 'error',
          message: err.response?.data?.message || 'Đăng nhập Google thất bại. Vui lòng thử lại.'
        });
      } finally {
        setLoading(false);
      }
    },
    onError: (err) => {
      console.warn('Google login error:', err);
      setAlert({
        type: 'error',
        message: 'Đăng nhập Google bị gián đoạn. Vui lòng thử lại.'
      });
    }
  });

  if (!authModalConfig.isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fadeIn">
      {/* Click outside to close */}
      <div className="fixed inset-0" onClick={handleClose} />

      <div className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-emerald-500/10 z-10 overflow-hidden">
        {/* Ambient Glows */}
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 p-2 rounded-xl bg-slate-800/80 text-slate-400 hover:text-white hover:bg-slate-700 transition-all active:scale-95 cursor-pointer"
          aria-label="Đóng"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="text-center space-y-2 mb-6">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 mb-1 shadow-lg shadow-emerald-500/10">
            <Sparkles className="w-7 h-7" />
          </div>
          <h2 className="text-2xl font-black text-white tracking-tight">
            Đăng Nhập Phòng Học
          </h2>
          <p className="text-xs text-slate-400 leading-relaxed max-w-xs mx-auto">
            {authModalConfig.message || 'Đăng nhập nhanh 1 chạm bằng Google để tự động lưu tiến độ học, chuỗi Streak và bảng điểm.'}
          </p>

          {/* Value props badges */}
          <div className="flex items-center justify-center gap-2 pt-2 flex-wrap text-[11px]">
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-400 font-semibold">
              <Flame className="w-3 h-3 text-orange-500" /> Lưu Streak
            </span>
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 font-semibold">
              <Zap className="w-3 h-3 text-amber-500" /> Tích lũy XP
            </span>
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-semibold">
              <BookMarked className="w-3 h-3 text-emerald-500" /> Sổ tay câu sai
            </span>
          </div>
        </div>

        {/* Feedback Alert */}
        {alert && (
          <div
            className={`mb-5 p-3 rounded-xl text-xs flex items-center gap-2 font-medium border ${
              alert.type === 'error'
                ? 'bg-rose-500/10 border-rose-500/30 text-rose-300'
                : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
            }`}
          >
            {alert.type === 'error' ? (
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            ) : (
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
            )}
            <span>{alert.message}</span>
          </div>
        )}

        {/* 1-Click Google Login Button - Hero Prominent */}
        <div className="space-y-4 my-2">
          <button
            type="button"
            onClick={() => googleLogin()}
            disabled={loading}
            className="w-full py-4 px-5 rounded-2xl bg-white hover:bg-slate-100 text-slate-900 font-extrabold text-sm sm:text-base flex items-center justify-center gap-3 transition-all duration-200 active:scale-[0.98] shadow-xl shadow-white/10 hover:shadow-emerald-500/20 border border-slate-200 cursor-pointer disabled:opacity-60 group"
          >
            <svg className="w-5 h-5 transition-transform group-hover:scale-110" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span>{loading ? 'Đang xác thực Google...' : 'Tiếp tục với Google (1 giây)'}</span>
          </button>

          {/* Benefits List */}
          <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-2.5 text-xs text-slate-300">
            <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs">
              <ShieldCheck className="w-4 h-4 shrink-0" />
              <span>Tài khoản Google thật — An toàn 100%</span>
            </div>
            <div className="space-y-1.5 pl-1 text-[11px] text-slate-400">
              <div className="flex items-center gap-2">
                <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>Không cần tạo hay nhớ mật khẩu phức tạp</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>Tự động đồng bộ tiến độ học giữa Điện thoại & Máy tính</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>Chống mất tài khoản và bảo mật theo chuẩn quốc tế</span>
              </div>
            </div>
          </div>
        </div>

        {/* Security Footer Note */}
        <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-center gap-1.5 text-[11px] text-slate-500 text-center">
          <Lock className="w-3 h-3 text-slate-500" />
          <span>Hệ thống bảo vệ danh tính qua giao thức Google OAuth 2.0.</span>
        </div>
      </div>
    </div>,
    document.body
  );
}
