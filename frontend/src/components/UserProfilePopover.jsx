import React, { useState, useEffect } from 'react';
import { 
  UserPlus, 
  MessageSquare, 
  ShieldAlert, 
  Flame, 
  Zap, 
  Clock, 
  Calendar, 
  Check, 
  X, 
  Crown, 
  Target,
  Sparkles,
  Award,
  UserCheck,
  Lock
} from 'lucide-react';
import AvatarWithCrownFrame from './AvatarWithCrownFrame';

// Deterministic string hash function: guarantees 100% stable values for any name across renders
function getDeterministicHash(str = '') {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

export default function UserProfilePopover({ user, isOpen, onClose, onStartChat }) {
  const [friendStatus, setFriendStatus] = useState('none'); // 'none' | 'pending' | 'friends'
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportReason, setReportReason] = useState('');
  const [toastMessage, setToastMessage] = useState(null);

  useEffect(() => {
    if (!user) return;
    try {
      const savedFriends = JSON.parse(localStorage.getItem('tuongtan_friends') || '[]');
      const savedPending = JSON.parse(localStorage.getItem('tuongtan_pending_friends') || '[]');
      
      const userName = user.name || user.fullName || user.user;
      const isBot = user.isBot ?? true;

      // Bot accounts can NEVER be accepted as friends
      if (isBot) {
        if (savedPending.includes(userName)) {
          setFriendStatus('pending');
        } else {
          setFriendStatus('none');
        }
      } else {
        if (savedFriends.includes(userName)) {
          setFriendStatus('friends');
        } else if (savedPending.includes(userName)) {
          setFriendStatus('pending');
        } else {
          setFriendStatus('none');
        }
      }
    } catch (e) {
      setFriendStatus('none');
    }
  }, [user]);

  if (!isOpen || !user) return null;

  const name = user.name || user.fullName || user.user || 'Học viên';
  const hash = getDeterministicHash(name);

  const targetScore = user.targetScore || user.target || '800';
  const streak = user.streak || user.streakDays || ((hash % 16) + 4);
  const xp = user.xp ? (user.xp > 1000 ? `${(user.xp / 1000).toFixed(1)}k` : user.xp) : `${((hash % 15) + 5).toFixed(1)}k`;
  
  // 100% STABLE STUDY TIME (NEVER USES Math.random!)
  const fallbackHours = (hash % 24) + 12; // 12h - 35h
  const fallbackMins = (hash % 50) + 10;  // 10p - 59p
  const timeSpent = user.timeSpent || `${fallbackHours}h ${fallbackMins}p`;
  
  // Authentic join date: real creation date for actual users, or naturally distributed dates across 2026 for bots
  let joinDate = '';
  if (user.createdAt) {
    joinDate = new Date(user.createdAt).toLocaleDateString('vi-VN');
  } else if (user.joinDate && user.joinDate !== '20/06/2026') {
    joinDate = user.joinDate;
  } else {
    const dayNum = String((hash % 27) + 1).padStart(2, '0');
    const monthNum = String((hash % 8) + 1).padStart(2, '0');
    joinDate = `${dayNum}/${monthNum}/2026`;
  }
  const level = user.level || ((hash % 10) + 12);
  const avatar = user.avatar || null;

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleAddFriend = () => {
    try {
      const savedPending = JSON.parse(localStorage.getItem('tuongtan_pending_friends') || '[]');
      if (!savedPending.includes(name)) {
        savedPending.push(name);
        localStorage.setItem('tuongtan_pending_friends', JSON.stringify(savedPending));
      }
      setFriendStatus('pending');
      showToast(`Đã gửi lời mời kết bạn đến ${name}!`);
    } catch (e) {
      setFriendStatus('pending');
    }
  };

  const handleMessage = () => {
    // STRICT RULE: ONLY FRIENDS CAN MESSAGE!
    if (friendStatus !== 'friends') {
      showToast('⚠️ Bạn cần kết bạn và chờ đối phương chấp nhận để nhắn tin!');
      return;
    }
    if (onStartChat) {
      onStartChat(user);
    } else {
      window.dispatchEvent(new CustomEvent('open_direct_chat', { 
        detail: {
          id: user.id || user._id || name,
          name,
          level,
          targetScore,
          streak,
          avatar
        } 
      }));
    }
    onClose();
  };

  const handleReport = () => {
    setShowReportModal(false);
    showToast('Cảm ơn bạn đã phản hồi. Quản trị viên sẽ kiểm duyệt tài khoản này.');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fadeIn">
      {/* Backdrop click to close */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Popover Container */}
      <div 
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-sm rounded-3xl bg-[#0f172a] border border-slate-700/80 shadow-2xl p-6 text-white space-y-5 animate-scaleUp z-10"
      >
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full bg-slate-800/80 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* User Header: Avatar + Name + Target Badge */}
        <div className="flex items-center gap-3.5 pr-6">
          <div className="relative shrink-0">
            <AvatarWithCrownFrame 
              rank={user.rank} 
              avatar={avatar} 
              name={name} 
              size="md" 
            />
          </div>

          <div className="space-y-1">
            <h3 className="font-heading font-black text-base text-white truncate max-w-[190px]">
              {name}
            </h3>
            <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-slate-800/80 border border-slate-700 text-[11px] text-slate-300 font-medium">
              <Target className="w-3 h-3 text-cyan-400" />
              <span>Mục tiêu: <strong className="text-white font-mono">{targetScore}</strong></span>
            </div>
          </div>
        </div>

        {/* 3 Core Stats Cards (Streak, XP, Time Spent) */}
        <div className="grid grid-cols-3 gap-2 bg-slate-900/90 p-3 rounded-2xl border border-slate-800/80 text-center">
          
          {/* Streak */}
          <div className="space-y-0.5">
            <div className="flex items-center justify-center gap-1 text-orange-400">
              <Flame className="w-3.5 h-3.5 fill-orange-400" />
              <span className="font-black font-mono text-sm sm:text-base text-white">{streak}</span>
            </div>
            <p className="text-[10px] text-slate-400 font-medium leading-tight">streak dài nhất</p>
          </div>

          {/* XP */}
          <div className="space-y-0.5 border-x border-slate-800">
            <div className="flex items-center justify-center gap-1 text-amber-400">
              <Zap className="w-3.5 h-3.5 fill-amber-400" />
              <span className="font-black font-mono text-sm sm:text-base text-white">{xp}</span>
            </div>
            <p className="text-[10px] text-slate-400 font-medium leading-tight">tổng XP</p>
          </div>

          {/* Time Spent */}
          <div className="space-y-0.5">
            <div className="flex items-center justify-center gap-1 text-sky-400">
              <Clock className="w-3.5 h-3.5" />
              <span className="font-bold font-mono text-xs text-white truncate">{timeSpent}</span>
            </div>
            <p className="text-[10px] text-slate-400 font-medium leading-tight">thời gian học</p>
          </div>

        </div>

        {/* Social Action Buttons Row */}
        <div className="flex items-center gap-2 pt-1">
          {/* Add Friend Button */}
          {friendStatus === 'none' && (
            <button
              onClick={handleAddFriend}
              className="flex-1 py-2.5 px-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-xs flex items-center justify-center gap-1.5 shadow-md shadow-cyan-500/20 active:scale-95 transition-all cursor-pointer"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Kết bạn</span>
            </button>
          )}

          {friendStatus === 'pending' && (
            <button
              disabled
              className="flex-1 py-2.5 px-3 rounded-xl bg-slate-800 border border-slate-700 text-amber-400 font-bold text-xs flex items-center justify-center gap-1.5 opacity-90"
            >
              <Clock className="w-3.5 h-3.5" />
              <span>Đã gửi lời mời</span>
            </button>
          )}

          {friendStatus === 'friends' && (
            <button
              disabled
              className="flex-1 py-2.5 px-3 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 font-bold text-xs flex items-center justify-center gap-1.5"
            >
              <UserCheck className="w-3.5 h-3.5" />
              <span>Bạn bè</span>
            </button>
          )}

          {/* Direct Message Button */}
          {friendStatus === 'friends' ? (
            <button
              onClick={handleMessage}
              className="flex-1 py-2.5 px-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-xs flex items-center justify-center gap-1.5 transition-all active:scale-95 cursor-pointer shadow-md shadow-cyan-500/20"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>Nhắn tin</span>
            </button>
          ) : (
            <button
              onClick={handleMessage}
              title="Chỉ nhắn tin được sau khi đã kết bạn và đối phương chấp nhận"
              className="flex-1 py-2.5 px-3 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 text-slate-400 hover:text-slate-300 font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer group"
            >
              <Lock className="w-3.5 h-3.5 text-slate-500 group-hover:text-amber-400 transition-colors" />
              <span>Nhắn tin</span>
              <span className="px-1.5 py-0.5 rounded text-[9px] bg-slate-700/80 text-amber-300 font-mono">Khóa</span>
            </button>
          )}

          {/* Block / Report Button */}
          <button
            onClick={() => setShowReportModal(true)}
            title="Báo cáo hoặc chặn người dùng"
            className="p-2.5 rounded-xl bg-slate-800/80 hover:bg-rose-500/20 border border-slate-700 hover:border-rose-500/40 text-slate-400 hover:text-rose-400 transition-colors cursor-pointer"
          >
            <ShieldAlert className="w-4 h-4" />
          </button>
        </div>

        {/* Lock note for non-friends */}
        {friendStatus !== 'friends' && (
          <p className="text-[11px] text-center text-slate-400/90 flex items-center justify-center gap-1.5 pt-0.5">
            <Lock className="w-3 h-3 text-amber-400/80 shrink-0" />
            <span>Chỉ mở tính năng nhắn tin khi cả hai đã là bạn bè</span>
          </p>
        )}

        {/* Join Date Footer */}
        <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
          <div className="flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-slate-500" />
            <span>Tham gia từ {joinDate}</span>
          </div>
          <span className="font-mono text-slate-500 font-semibold">Cấp độ {level}</span>
        </div>

        {/* Report Modal Inside Popover */}
        {showReportModal && (
          <div className="absolute inset-0 bg-slate-900/95 backdrop-blur-md rounded-3xl p-5 flex flex-col justify-between z-20 animate-fadeIn">
            <div className="space-y-3">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <span className="font-bold text-sm text-rose-400 flex items-center gap-1.5">
                  <ShieldAlert className="w-4 h-4" />
                  <span>Báo cáo vi phạm</span>
                </span>
                <button onClick={() => setShowReportModal(false)} className="text-slate-400 hover:text-white">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <p className="text-xs text-slate-300">
                Hãy cho chúng tôi biết lý do bạn muốn báo cáo tài khoản <strong>{name}</strong>:
              </p>
              <div className="space-y-1.5">
                {[
                  'Ngôn từ không phù hợp',
                  'Gian lận điểm / spam',
                  'Ảnh đại diện vi phạm',
                  'Lý do khác'
                ].map((reason) => (
                  <button
                    key={reason}
                    onClick={() => setReportReason(reason)}
                    className={`w-full text-left p-2 rounded-xl text-xs transition-colors border ${
                      reportReason === reason 
                        ? 'bg-rose-500/20 border-rose-500/50 text-rose-300 font-bold' 
                        : 'bg-slate-800/60 border-slate-700/60 text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    {reason}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                onClick={() => setShowReportModal(false)}
                className="flex-1 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-bold"
              >
                Hủy
              </button>
              <button
                onClick={handleReport}
                disabled={!reportReason}
                className="flex-1 py-2 rounded-xl bg-rose-500 hover:bg-rose-400 disabled:opacity-40 text-white text-xs font-bold shadow-md shadow-rose-500/20"
              >
                Gửi báo cáo
              </button>
            </div>
          </div>
        )}

        {/* Floating Toast inside Modal */}
        {toastMessage && (
          <div className="absolute top-2 inset-x-4 bg-emerald-500 text-slate-950 px-3 py-2 rounded-xl text-xs font-bold text-center shadow-xl animate-fadeIn z-30 flex items-center justify-center gap-1.5">
            <Check className="w-3.5 h-3.5 stroke-[3]" />
            <span>{toastMessage}</span>
          </div>
        )}

      </div>
    </div>
  );
}
