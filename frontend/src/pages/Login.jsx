import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { useGoogleLogin } from '@react-oauth/google';
import { apiGoogleAuth } from '../utils/auth';
import { useAuth } from '../context/AuthContext';
import { Headphones, CheckCircle2, AlertCircle, ShieldCheck, Check, Lock, Sparkles } from 'lucide-react';

export default function Login() {
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

  // Trigger Google Login Popup Window (1-Click standard)
  const googleLogin = useGoogleLogin({
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
            message: `🎉 Chào mừng ${res?.data?.fullName || 'học viên'}! Đang vào phòng học...`
          });
          setTimeout(() => {
            navigate(redirectUrl);
          }, 800);
        }
      } catch (err) {
        console.error('Login error:', err);
        setAuthAlert({
          type: 'error',
          message: err.response?.data?.message || 'Đăng nhập Google thất bại. Vui lòng thử lại.'
        });
      } finally {
        setLoading(false);
      }
    },
    onError: (err) => {
      console.warn('Google login error:', err);
      setAuthAlert({
        type: 'error',
        message: 'Đăng nhập Google bị gián đoạn. Vui lòng thử lại.'
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
              <Sparkles className="w-3.5 h-3.5" /> Chuẩn Đăng Nhập 1-Chạm
            </div>
            <h1 className="text-3xl font-extrabold font-heading text-white tracking-tight">Chào mừng trở lại</h1>
            <p className="text-sm text-slate-400">Đăng nhập nhanh bằng tài khoản Google để tiếp tục lộ trình học.</p>
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

          {/* Google Login Button - Hero Size */}
          <div className="space-y-4 pt-2">
            <button
              onClick={() => googleLogin()}
              disabled={loading}
              className="w-full py-4 px-5 rounded-2xl bg-white hover:bg-slate-100 text-slate-950 font-extrabold text-sm sm:text-base shadow-xl shadow-white/10 hover:shadow-amber-500/20 flex items-center justify-center gap-3.5 transition-all transform hover:-translate-y-0.5 active:translate-y-0 cursor-pointer disabled:opacity-60 group border border-slate-200"
            >
              <svg className="w-5 h-5 transition-transform group-hover:scale-110" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
              </svg>
              <span>{loading ? 'Đang xác thực Google...' : 'Tiếp tục với Google (1 giây)'}</span>
            </button>

            {/* Benefits box */}
            <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2.5 text-xs text-slate-300">
              <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs">
                <ShieldCheck className="w-4 h-4 shrink-0" />
                <span>Xác thực tài khoản Google chính chủ 100%</span>
              </div>
              <div className="space-y-1.5 pl-1 text-[11px] text-slate-400">
                <div className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>Không cần tạo hay nhớ mật khẩu, không lo quên mật khẩu</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>Tự động lưu điểm thi thử, bài luyện nghe và chuỗi Streak</span>
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
              Luyện Thi TOEIC Tường Tận
            </h2>
            <p className="text-sm text-slate-300 leading-relaxed">
              Trang web luyện thi TOEIC 4 kỹ năng toàn diện chuẩn format đề thi thật ETS.
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
