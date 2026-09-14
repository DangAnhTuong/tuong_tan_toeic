import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { getStoredUser, setStoredUser, clearStoredUser } from '../utils/auth';
import { 
  User, 
  Key, 
  Smartphone, 
  Bell, 
  LogOut, 
  Crown, 
  AlertCircle,
  Target,
  Sparkles,
  ArrowRight,
  Lock,
  CheckCircle2,
  ShieldCheck
} from 'lucide-react';

import axios from 'axios';

export default function UserHub() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'account-profile';

  // Dynamic user profile state from API
  const [userProfile, setUserProfile] = useState(null);
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Password Form States
  const [newPass, setNewPass] = useState('');
  const [confirmPass, setConfirmPass] = useState('');

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await axios.get('/api/v1/user/profile');
        if (res.data?.data) {
          const u = res.data.data;
          setUserProfile(u);
          setDisplayName(u.name || (u.isGuest ? 'Học Viên Trải Nghiệm' : 'Học Viên'));
          setEmail(u.email || (u.isGuest ? 'khach_trai_nghiem@tuongtan.edu.vn' : ''));
        }
      } catch (err) {
        const localUser = getStoredUser() || {};
        setUserProfile(localUser);
        setDisplayName(localUser.name || 'Học Viên Trải Nghiệm');
        setEmail(localUser.email || 'khach_trai_nghiem@tuongtan.edu.vn');
      }
    };
    fetchProfile();
  }, [activeTab]);

  const handleTabChange = (tabId) => {
    setSearchParams({ tab: tabId });
  };

  const handleSaveProfile = (e) => {
    e.preventDefault();
    setStoredUser({ name: displayName, fullName: displayName });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  const handleLogout = () => {
    clearStoredUser();
    navigate('/login');
  };

  return (
    <div className="min-h-screen dark:bg-[#0b1120] bg-[#f8fafc] dark:text-slate-100 text-slate-900 flex flex-col font-sans pb-12 transition-colors duration-200">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          {/* LEFT SIDEBAR MENU */}
          <aside className="lg:col-span-1 space-y-6">
            
            {/* TÀI KHOẢN */}
            <div className="space-y-1">
              <span className="px-3 text-[11px] font-extrabold text-slate-500 uppercase tracking-wider">TÀI KHOẢN</span>
              <nav className="space-y-1 mt-2">
                {[
                  { id: 'account-profile', label: 'Thông tin cá nhân', icon: User },
                  { id: 'account-password', label: 'Đổi mật khẩu', icon: Key },
                  { id: 'account-devices', label: 'Thiết bị', icon: Smartphone },
                  { id: 'account-notifications', label: 'Thông báo', icon: Bell }
                ].map((item) => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleTabChange(item.id)}
                      className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                        isActive
                          ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30 font-bold shadow-sm'
                          : 'dark:text-slate-400 text-slate-600 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-900/60'
                      }`}
                    >
                      <Icon className={`w-4 h-4 ${isActive ? 'text-amber-500 dark:text-amber-400' : 'text-slate-400'}`} />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </nav>
            </div>

            {/* NĂNG LỰC & DỰ BÁO ĐIỂM AI */}
            <div className="space-y-1 pt-4 border-t dark:border-slate-800 border-slate-200">
              <span className="px-3 text-[11px] font-extrabold text-cyan-600 dark:text-cyan-400 uppercase tracking-wider">AI DỰ BÁO NĂNG LỰC</span>
              <nav className="space-y-1 mt-2">
                {[
                  { id: 'skill-radar', label: 'Biểu Đồ 7 Kỹ Năng & Điểm', icon: Target }
                ].map((item) => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleTabChange(item.id)}
                      className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                        isActive
                          ? 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/30 font-bold shadow-sm'
                          : 'dark:text-slate-400 text-slate-600 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-900/60'
                      }`}
                    >
                      <Icon className={`w-4 h-4 ${isActive ? 'text-cyan-500 dark:text-cyan-400' : 'text-slate-400'}`} />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </nav>
            </div>



            {/* LOGOUT */}
            <div className="pt-4 border-t dark:border-slate-800 border-slate-200">
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold text-rose-500 hover:bg-rose-500/10 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span>Đăng xuất</span>
              </button>
            </div>

          </aside>

          {/* MAIN TAB CONTENT */}
          <section className="lg:col-span-3 space-y-6">
            
            {/* TAB 1: THÔNG TIN CÁ NHÂN */}
            {activeTab === 'account-profile' && (
              <div className="space-y-6 animate-fadeIn">
                <div className="border-b dark:border-slate-800 border-slate-200 pb-4">
                  <h2 className="text-2xl font-extrabold font-heading text-slate-900 dark:text-white">Thông tin cá nhân</h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Chỉnh sửa tên hiển thị và ảnh đại diện</p>
                </div>

                <form onSubmit={handleSaveProfile} className="rounded-3xl border dark:border-slate-800 border-slate-200 p-6 md:p-8 space-y-6 dark:bg-slate-900/60 bg-white shadow-sm">
                  {/* Avatar Upload */}
                  <div className="flex items-center gap-6">
                    <div className="w-20 h-20 rounded-full bg-amber-500 border-2 border-amber-400 flex items-center justify-center font-bold text-slate-950 text-3xl shadow-xl">
                      {displayName.charAt(0).toUpperCase()}
                    </div>
                    <button type="button" className="px-4 py-2 rounded-xl dark:bg-slate-800 bg-slate-100 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 border dark:border-slate-700 border-slate-200 transition-colors">
                      Đổi ảnh
                    </button>
                  </div>

                  {/* Display Name */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Tên hiển thị</label>
                    <input
                      type="text"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      className="w-full max-w-lg px-4 py-3 rounded-xl dark:bg-slate-950 bg-white border dark:border-slate-800 border-slate-200 text-xs font-medium text-slate-900 dark:text-white focus:border-amber-400 outline-none shadow-sm"
                    />
                  </div>

                  {/* Email (Read-Only & Protected by Google) */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between max-w-lg">
                      <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Email tài khoản</label>
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                        <CheckCircle2 className="w-3 h-3" /> Đã xác thực Google
                      </span>
                    </div>
                    <div className="relative max-w-lg">
                      <input
                        type="email"
                        value={email}
                        readOnly
                        disabled
                        className="w-full px-4 py-3 rounded-xl dark:bg-slate-950/60 bg-slate-100 border dark:border-slate-800/80 border-slate-300 text-xs font-medium dark:text-slate-400 text-slate-500 cursor-not-allowed outline-none select-none"
                      />
                      <Lock className="w-3.5 h-3.5 text-slate-500 absolute right-3.5 top-1/2 -translate-y-1/2" />
                    </div>
                    <p className="text-[11px] text-slate-500">
                      Email gắn với tài khoản Google thật của bạn và được bảo vệ cố định.
                    </p>
                  </div>

                  <button
                    type="submit"
                    className="px-6 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-lg shadow-amber-500/20 transition-all cursor-pointer"
                  >
                    {savedSuccess ? 'Đã lưu thay đổi ✓' : 'Lưu thay đổi'}
                  </button>
                </form>

                {/* Gói hiện tại */}
                <div className={`rounded-3xl border p-6 md:p-8 space-y-4 shadow-sm ${
                  userProfile?.isPro
                    ? 'border-amber-500/30 dark:bg-gradient-to-r dark:from-amber-500/10 dark:via-slate-900 dark:to-slate-950 bg-gradient-to-r from-amber-50 via-white to-orange-50/50'
                    : 'dark:border-slate-800 border-slate-200 dark:bg-slate-900/60 bg-white'
                }`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Crown className={`w-6 h-6 ${userProfile?.isPro ? 'text-amber-500 dark:text-amber-400' : 'text-slate-400'}`} />
                      <h3 className="font-bold text-base text-slate-900 dark:text-white">Gói hiện tại</h3>
                    </div>
                    <span className={`px-3 py-1 rounded-full font-black text-xs uppercase tracking-wider ${
                      userProfile?.isPro
                        ? 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/20'
                        : 'dark:bg-slate-800 bg-slate-100 text-slate-600 dark:text-slate-400 border dark:border-slate-700 border-slate-200'
                    }`}>
                      {userProfile?.isPro 
                        ? (userProfile.proTier === 'pro_4_months' ? 'Gói VIP Khai Trương (4 Tháng)' : 'VIP Gold')
                        : 'Gói Miễn Phí (Free)'}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-xs pt-2">
                    <div>
                      <span className="text-slate-500 dark:text-slate-400 font-medium">TRẠNG THÁI</span>
                      <p className={`font-extrabold mt-1 ${userProfile?.isPro ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-700 dark:text-slate-300'}`}>
                        {userProfile?.isPro ? 'Đang hoạt động (Full 4 Kỹ Năng)' : 'Tài khoản trải nghiệm Free'}
                      </p>
                    </div>
                    <div>
                      <span className="text-slate-500 dark:text-slate-400 font-medium">NGÀY HẾT HẠN</span>
                      <p className={`font-extrabold mt-1 ${userProfile?.isPro ? 'text-amber-600 dark:text-amber-400' : 'text-slate-500 dark:text-slate-400'}`}>
                        {userProfile?.isPro && userProfile?.proExpiresAt
                          ? new Date(userProfile.proExpiresAt).toLocaleDateString('vi-VN')
                          : 'Miễn phí các phần cơ bản'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: ĐỔI MẬT KHẨU */}
            {activeTab === 'account-password' && (
              <div className="space-y-6 animate-fadeIn">
                <div className="border-b dark:border-slate-800 border-slate-200 pb-4">
                  <h2 className="text-2xl font-extrabold font-heading text-slate-900 dark:text-white">Bảo mật & Mật khẩu</h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Trạng thái bảo mật tài khoản học viên</p>
                </div>

                <div className="rounded-3xl border dark:border-slate-800 border-slate-200 p-6 md:p-8 space-y-5 max-w-xl dark:bg-slate-900/60 bg-white shadow-sm">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center shrink-0 text-emerald-400">
                      <ShieldCheck className="w-6 h-6" />
                    </div>
                    <div className="space-y-1">
                      <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                        Tài khoản bảo mật qua Google
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                        Tài khoản của bạn (<strong className="text-emerald-400">{email}</strong>) được kết nối và xác thực trực tiếp bởi Google. Mật khẩu và bảo mật 2 lớp được bảo vệ an toàn tuyệt đối bởi Google, bạn không cần phải tạo hoặc quản lý mật khẩu thủ công.
                      </p>
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80 text-xs text-slate-400 space-y-1.5">
                    <div className="flex items-center gap-2 text-emerald-400 font-semibold text-[11px]">
                      <Check className="w-3.5 h-3.5" />
                      <span>Xác thực OpenID Connect RS256 chuẩn quốc tế</span>
                    </div>
                    <div className="flex items-center gap-2 text-emerald-400 font-semibold text-[11px]">
                      <Check className="w-3.5 h-3.5" />
                      <span>Không thể bị đánh cắp hay dò quét mật khẩu trên trang web</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 3: THIẾT BỊ */}
            {activeTab === 'account-devices' && (
              <div className="space-y-6 animate-fadeIn">
                <div className="border-b dark:border-slate-800 border-slate-200 pb-4">
                  <h2 className="text-2xl font-extrabold font-heading text-slate-900 dark:text-white">Thiết bị đăng nhập</h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Quản lý các thiết bị đã đăng nhập</p>
                </div>

                <div className="p-5 rounded-2xl border dark:border-slate-800 border-slate-200 dark:bg-slate-900/60 bg-white shadow-sm flex items-center gap-4 max-w-xl">
                  <div className="p-3 rounded-xl dark:bg-slate-800 bg-amber-50 text-amber-500 dark:text-amber-400">
                    <Smartphone className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-slate-900 dark:text-white">Desktop</h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Lần cuối: 31/7/2026</p>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 4: THÔNG BÁO */}
            {activeTab === 'account-notifications' && (
              <div className="space-y-6 animate-fadeIn">
                <div className="border-b dark:border-slate-800 border-slate-200 pb-4">
                  <h2 className="text-2xl font-extrabold font-heading text-slate-900 dark:text-white">Thông báo</h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Nhận nhắc học từ vựng và ôn tập hàng ngày</p>
                </div>

                <div className="p-6 rounded-3xl border dark:border-slate-800 border-slate-200 space-y-4 max-w-xl dark:bg-slate-900/60 bg-white shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-blue-500/20 text-blue-500 dark:text-blue-400">
                      <Bell className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-slate-900 dark:text-white">Thông báo đẩy (Push)</h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400">Nhận nhắc nhỏ ôn tập từ vựng, streak và mục tiêu học tập ngay trên thiết bị.</p>
                    </div>
                  </div>

                  <button className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition-colors">
                    Bật thông báo
                  </button>
                </div>
              </div>
            )}



            {/* TAB 9: BIỂU ĐỒ RADAR & DỰ BÁO ĐIỂM AI */}
            {activeTab === 'skill-radar' && (
              <div className="space-y-6 animate-fadeIn">
                <div className="border-b dark:border-slate-800 border-slate-200 pb-4 flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-extrabold font-heading text-slate-900 dark:text-white">
                      Bản Đồ Năng Lực 7 Kỹ Năng & AI Dự Báo Điểm 📊
                    </h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Phân tích độ chính xác theo từng Part, chỉ ra điểm mạnh và 3 điểm nghẽn kéo tụt điểm
                    </p>
                  </div>
                  <div className="px-3.5 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-600 dark:text-cyan-400 text-xs font-black font-mono">
                    DỰ ĐOÁN: ~660/990 PTS
                  </div>
                </div>

                {/* Embedded Radar Section */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Left: Summary Metrics */}
                  <div className="rounded-3xl border dark:border-slate-800 border-slate-200 p-6 space-y-4 dark:bg-slate-900/60 bg-white shadow-sm">
                    <h3 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-cyan-500 dark:text-cyan-400" />
                      <span>Tổng Quan Năng Lực Dự Đoán</span>
                    </h3>

                    <div className="grid grid-cols-2 gap-3 font-mono">
                      <div className="p-3.5 rounded-2xl dark:bg-slate-950 bg-slate-50 border dark:border-slate-800 border-slate-200">
                        <span className="text-[10px] text-slate-500 dark:text-slate-400 block font-sans">Listening Dự Đoán</span>
                        <span className="text-xl font-black text-sky-600 dark:text-sky-400">357 / 495</span>
                      </div>
                      <div className="p-3.5 rounded-2xl dark:bg-slate-950 bg-slate-50 border dark:border-slate-800 border-slate-200">
                        <span className="text-[10px] text-slate-500 dark:text-slate-400 block font-sans">Reading Dự Đoán</span>
                        <span className="text-xl font-black text-emerald-600 dark:text-emerald-400">302 / 495</span>
                      </div>
                    </div>

                    <div className="p-4 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 space-y-1 text-xs">
                      <div className="flex justify-between font-bold">
                        <span className="text-cyan-700 dark:text-cyan-300">Khả năng đạt mục tiêu 650+:</span>
                        <span className="text-emerald-600 dark:text-emerald-400 font-mono">78% (Khả thi trong 3 tuần)</span>
                      </div>
                      <p className="text-[11px] text-slate-600 dark:text-slate-300">
                        Nếu duy trì mục tiêu làm bài hằng ngày, bạn sẽ vượt mốc 650 điểm trong vòng 18-21 ngày tới.
                      </p>
                    </div>

                    {/* Strengths list */}
                    <div className="space-y-2 pt-2 border-t dark:border-slate-800 border-slate-200">
                      <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider block">
                        🌟 Điểm Mạnh Nhất:
                      </span>
                      <div className="space-y-1.5 text-xs text-slate-700 dark:text-slate-300">
                        <div className="flex items-center justify-between p-2 rounded-xl dark:bg-slate-950 bg-slate-50 border dark:border-slate-800 border-slate-200">
                          <span>Part 1: Mô tả tranh (Listening)</span>
                          <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">88%</span>
                        </div>
                        <div className="flex items-center justify-between p-2 rounded-xl dark:bg-slate-950 bg-slate-50 border dark:border-slate-800 border-slate-200">
                          <span>Part 2: Hỏi - Đáp (Listening)</span>
                          <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">82%</span>
                        </div>
                        <div className="flex items-center justify-between p-2 rounded-xl dark:bg-slate-950 bg-slate-50 border dark:border-slate-800 border-slate-200">
                          <span>Part 5: Ngữ pháp cơ bản (Reading)</span>
                          <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">76%</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right: Bottlenecks to Fix */}
                  <div className="rounded-3xl border dark:border-slate-800 border-slate-200 p-6 space-y-4 dark:bg-slate-900/60 bg-white shadow-sm">
                    <h3 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 text-rose-500 dark:text-rose-400" />
                      <span>3 Điểm Nghẽn Cần Bứt Phá Ngay</span>
                    </h3>

                    <div className="space-y-3">
                      {[
                        { part: 'Part 7', name: 'Đọc hiểu đoạn văn', acc: '52%', gain: '+45 pts', link: '/read?part=7&level=2', tip: 'Luyện kỹ năng Skimming & Scanning để rút ngắn thời gian đọc.' },
                        { part: 'Part 6', name: 'Điền câu đoạn văn', acc: '62%', gain: '+20 pts', link: '/read?part=6&level=2', tip: 'Củng cố các liên từ nối ý (However, Therefore).' },
                        { part: 'Part 4', name: 'Bài nói độc thoại', acc: '64%', gain: '+25 pts', link: '/listen/level-practice?part=4&level=2', tip: 'Đọc trước 3 câu hỏi trước khi audio phát.' }
                      ].map((item, i) => (
                        <div key={i} className="p-3.5 rounded-2xl dark:bg-slate-950 bg-slate-50 border dark:border-slate-800 border-slate-200 space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-xs text-slate-900 dark:text-white">{item.part}: {item.name}</span>
                            <span className="text-xs font-mono font-bold text-amber-600 dark:text-amber-400">{item.gain}</span>
                          </div>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400">{item.tip}</p>
                          <a 
                            href={item.link}
                            className="inline-flex items-center gap-1 text-[11px] font-bold text-cyan-600 dark:text-cyan-400 hover:text-cyan-500"
                          >
                            <span>Luyện tập ngay</span>
                            <ArrowRight className="w-3 h-3" />
                          </a>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

          </section>

        </div>

      </main>
    </div>
  );
}
