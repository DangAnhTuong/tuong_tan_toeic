import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useGoogleLogin } from '@react-oauth/google';
import { apiGoogleAuth } from '../utils/auth';
import { useAuth } from '../context/AuthContext';
import { Headphones, CheckCircle2, AlertCircle, ShieldCheck, Check, Lock, Sparkles } from 'lucide-react';
import axios from 'axios';

export default function SignUp() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [searchParams] = useSearchParams();
  const redirectParam = searchParams.get('redirect');
  const redirectUrl = redirectParam ? decodeURIComponent(redirectParam) : '/hub';

  const [loading, setLoading] = useState(false);
  const [authAlert, setAuthAlert] = useState(null);
  const [stats, setStats] = useState({
    totalUsers: '200+',
    totalListening: '11785+',
    totalGrammar: '997+',
    totalTests: '91+'
  });

  useEffect(() => {
    axios.get('/api/v1/auth/public-stats').then(res => {
      if (res.data?.data) {
        setStats(prev => ({
          ...prev,
          totalUsers: res.data.data.displayUsers || `${res.data.data.totalUsers}+`
        }));
      }
    }).catch(() => {});
  }, []);

  // Trigger Google Sign Up Popup Window (1-Click standard matching Đậu TOEIC)
  const googleSignUp = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setLoading(true);
      setAuthAlert(null);
      try {
        if (tokenResponse?.access_token) {
          const res = await apiGoogleAuth({
            accessToken: tokenResponse.access_token
          });
          if (res?.data && res?.token) {
            login(res.data, res.token);
          }
          setAuthAlert({
            type: 'success',
            message: `🎉 Đăng ký thành công! Chào mừng ${res?.data?.fullName || 'học viên'}...`
          });
          setTimeout(() => {
            navigate(redirectUrl);
          }, 800);
        }
      } catch (err) {
        console.error('Google sign up error:', err);
        setAuthAlert({
          type: 'error',
          message: err.response?.data?.message || 'Đăng ký Google thất bại. Vui lòng thử lại.'
        });
      } finally {
        setLoading(false);
      }
    },
    onError: (error) => {
      console.warn('Google sign up error:', error);
      setAuthAlert({
        type: 'error',
        message: 'Đăng ký Google bị gián đoạn. Vui lòng thử lại.'
      });
    }
  });

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col lg:flex-row font-sans">
      
      {/* LEFT FORM SECTION */}
      <div className="flex-1 flex flex-col justify-between p-8 md:p-16 lg:p-20 bg-slate-950">
        
        {/* Brand Header */}
        <Link to="/" className="flex items-center gap-2 group w-fit">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-amber-300 p-0.5 shadow-lg shadow-amber-500/20">
            <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
              <Headphones className="w-5 h-5 text-amber-400" />
            </div>
          </div>
          <span className="font-heading font-extrabold text-xl text-white tracking-wide">
            TƯỜNG TẬN <span className="text-amber-400">TOEIC</span>
          </span>
        </Link>

        {/* Center Form Area */}
        <div className="max-w-md w-full mx-auto my-12 space-y-6">
          <div className="space-y-2 text-center lg:text-left">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 font-bold text-xs mb-1">
              <Sparkles className="w-3.5 h-3.5" /> Chuẩn Đậu TOEIC — Nhanh 1 Giây
            </div>
            <h1 className="text-3xl font-extrabold font-heading text-white tracking-tight">Tạo tài khoản học viên</h1>
            <p className="text-sm text-slate-400">Bắt đầu học thử 4 kỹ năng và tự động lưu lại toàn bộ tiến độ của bạn.</p>
          </div>

          {/* ALERT NOTIFICATION BANNER */}
          {authAlert && (
            <div className={`p-4 rounded-2xl border text-xs font-bold flex items-center gap-3 animate-fadeIn ${
              authAlert.type === 'success'
                ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-400'
                : 'bg-rose-500/10 border-rose-500/40 text-rose-400'
            }`}>
              {authAlert.type === 'success' ? <CheckCircle2 className="w-5 h-5 shrink-0" /> : <AlertCircle className="w-5 h-5 shrink-0" />}
              <span>{authAlert.message}</span>
            </div>
          )}

          {/* Google Sign Up Button - Hero Size */}
          <div className="space-y-4 pt-2">
            <button
              onClick={() => googleSignUp()}
              disabled={loading}
              className="w-full py-4 px-5 rounded-2xl bg-white hover:bg-slate-100 text-slate-950 font-extrabold text-sm sm:text-base shadow-xl shadow-white/10 hover:shadow-amber-500/20 flex items-center justify-center gap-3.5 transition-all transform hover:-translate-y-0.5 active:translate-y-0 cursor-pointer disabled:opacity-60 group border border-slate-200"
            >
              <svg className="w-5 h-5 transition-transform group-hover:scale-110" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 15.987 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"/>
              </svg>
              <span>{loading ? 'Đang kết nối Google...' : 'Đăng ký nhanh với Google (1 giây)'}</span>
            </button>

            {/* Benefits box */}
            <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2.5 text-xs text-slate-300">
              <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs">
                <ShieldCheck className="w-4 h-4 shrink-0" />
                <span>100% Gmail thật — Tuyệt đối không tài khoản rác</span>
              </div>
              <div className="space-y-1.5 pl-1 text-[11px] text-slate-400">
                <div className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>Xác thực tự động qua Google, không cần tạo mật khẩu</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>Kích hoạt ngay tài khoản học viên và mở khóa bài học Free</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>Bảo toàn điểm số và kết quả bài thi qua mọi thiết bị</span>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-2 text-center">
            <div className="flex items-center justify-center gap-1.5 text-xs text-slate-500">
              <Lock className="w-3.5 h-3.5" />
              <span>Bảo mật chuẩn quốc tế qua giao thức Google OAuth 2.0.</span>
            </div>
          </div>

          <p className="text-xs text-slate-400 text-center">
            Đã có tài khoản?{' '}
            <Link to={redirectParam ? `/login?redirect=${encodeURIComponent(redirectUrl)}` : '/login'} className="text-amber-400 font-bold hover:underline">
              Đăng nhập ngay
            </Link>
          </p>
        </div>

        {/* Footer */}
        <div className="text-xs text-slate-500 text-center lg:text-left">
          © 2026 Tường Tận TOEIC. All rights reserved.
        </div>

      </div>

      {/* RIGHT HERO PANELS WITH CHECKLIST & METRICS */}
      <div className="flex-1 bg-gradient-to-br from-amber-600/30 via-slate-900 to-slate-950 p-8 md:p-16 lg:p-20 flex flex-col items-center justify-center text-center relative overflow-hidden border-l border-slate-800">
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-amber-500/20 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 max-w-lg space-y-8">
          <div className="w-20 h-20 mx-auto rounded-3xl bg-gradient-to-tr from-amber-400 to-amber-600 p-0.5 shadow-2xl shadow-amber-500/30">
            <div className="w-full h-full bg-slate-950 rounded-[22px] flex items-center justify-center text-3xl">
              🎯
            </div>
          </div>

          <div className="space-y-3">
            <h2 className="text-3xl font-extrabold font-heading text-white tracking-tight">
              Bắt Đầu Hành Trình TOEIC
            </h2>
            <p className="text-sm text-slate-300 leading-relaxed">
              Nền tảng luyện thi TOEIC toàn diện với đầy đủ kỹ năng: Nghe • Đọc • Ngữ pháp • Từ vựng
            </p>
          </div>

          {/* Stats Badges */}
          <div className="grid grid-cols-2 gap-3 max-w-sm mx-auto text-left">
            <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-1">
              <div className="text-xs text-slate-400 font-medium">Học viên</div>
              <div className="text-xl font-extrabold text-amber-400">{stats.totalUsers}</div>
            </div>
            <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-1">
              <div className="text-xs text-slate-400 font-medium">Câu Dictation</div>
              <div className="text-xl font-extrabold text-emerald-400">{stats.totalListening}</div>
            </div>
            <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-1">
              <div className="text-xs text-slate-400 font-medium">Bộ đề ETS</div>
              <div className="text-xl font-extrabold text-cyan-400">{stats.totalTests} Đề</div>
            </div>
            <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-1">
              <div className="text-xs text-slate-400 font-medium">Ngữ pháp</div>
              <div className="text-xl font-extrabold text-purple-400">{stats.totalGrammar} Câu</div>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
