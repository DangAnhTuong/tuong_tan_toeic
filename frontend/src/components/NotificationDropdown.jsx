import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  Bell, 
  CheckCheck, 
  Pin, 
  Sparkles, 
  Gift, 
  Wrench, 
  Megaphone, 
  ExternalLink, 
  Clock, 
  Check, 
  X,
  RotateCw
} from 'lucide-react';

export default function NotificationDropdown({ isOpen, onClose, onUnreadChange }) {
  const navigate = useNavigate();
  const dropdownRef = useRef(null);
  const [activeFilter, setActiveFilter] = useState('all'); // 'all' | 'unread'
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        onClose();
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  // Fetch notifications
  const fetchNotifications = async (silent = false) => {
    try {
      if (!silent) setIsLoading(true);
      const res = await axios.get('/api/v1/notifications/user');
      if (res.data?.success) {
        const notifs = res.data.data || [];
        setNotifications(notifs);
        const unread = res.data.unreadCount || 0;
        setUnreadCount(unread);
        if (onUnreadChange) onUnreadChange(unread);
      }
    } catch (err) {
      console.warn('Notifications fetch warning:', err.message);
    } finally {
      if (!silent) setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchNotifications();
    }
  }, [isOpen]);

  // Mark single notification as read
  const handleMarkAsRead = async (notif) => {
    if (notif.isRead) return;
    try {
      await axios.post(`/api/v1/notifications/${notif._id}/read`);
      setNotifications(prev => 
        prev.map(n => n._id === notif._id ? { ...n, isRead: true } : n)
      );
      setUnreadCount(prev => {
        const updated = Math.max(0, prev - 1);
        if (onUnreadChange) onUnreadChange(updated);
        return updated;
      });
    } catch (err) {
      console.warn('Mark as read error:', err.message);
    }
  };

  // Mark all notifications as read
  const handleMarkAllAsRead = async () => {
    try {
      await axios.post('/api/v1/notifications/read-all');
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
      if (onUnreadChange) onUnreadChange(0);
    } catch (err) {
      console.warn('Mark all as read error:', err.message);
    }
  };

  // Click on a notification item
  const handleItemClick = (notif) => {
    handleMarkAsRead(notif);
    if (notif.actionUrl) {
      onClose();
      navigate(notif.actionUrl);
    }
  };

  // Filter notifications
  const filteredNotifications = notifications.filter(n => {
    if (activeFilter === 'unread') return !n.isRead;
    return true;
  });

  // Helper for notification type badges
  const getTypeBadge = (type) => {
    switch (type) {
      case 'update':
        return {
          icon: Sparkles,
          label: 'Cập nhật',
          bg: 'bg-cyan-500/15 text-cyan-400 border-cyan-500/30'
        };
      case 'promo':
        return {
          icon: Gift,
          label: 'Ưu đãi',
          bg: 'bg-amber-500/15 text-amber-400 border-amber-500/30'
        };
      case 'system':
        return {
          icon: Wrench,
          label: 'Hệ thống',
          bg: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
        };
      default:
        return {
          icon: Megaphone,
          label: 'Thông báo',
          bg: 'bg-purple-500/15 text-purple-400 border-purple-500/30'
        };
    }
  };

  // Helper to format time
  const formatTime = (dateStr) => {
    if (!dateStr) return '';
    try {
      const date = new Date(dateStr);
      const now = new Date();
      const diffMs = now - date;
      const diffMins = Math.floor(diffMs / (1000 * 60));
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

      if (diffMins < 1) return 'Vừa xong';
      if (diffMins < 60) return `${diffMins} phút trước`;
      if (diffHours < 24) return `${diffHours} giờ trước`;
      if (diffDays === 1) return 'Hôm qua';
      if (diffDays < 7) return `${diffDays} ngày trước`;
      return date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' });
    } catch {
      return '';
    }
  };

  if (!isOpen) return null;

  return (
    <div
      ref={dropdownRef}
      className="absolute right-0 top-full mt-2 w-[340px] sm:w-[420px] max-h-[540px] rounded-3xl dark:bg-slate-950 bg-white border dark:border-slate-800 border-slate-200 shadow-2xl shadow-black/90 z-[100] flex flex-col overflow-hidden animate-fadeIn"
      style={{ transformOrigin: 'top right' }}
    >
      {/* HEADER */}
      <div className="p-4 pb-3 border-b dark:border-slate-800 border-slate-200 dark:bg-slate-950 bg-white flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <Bell className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-heading font-extrabold text-sm dark:text-white text-slate-900 flex items-center gap-1.5">
              Hòm Thư Thông Báo
              {unreadCount > 0 && (
                <span className="px-1.5 py-0.5 rounded-full bg-rose-500 text-white text-[10px] font-black leading-none">
                  {unreadCount}
                </span>
              )}
            </h3>
            <p className="text-[11px] dark:text-slate-400 text-slate-500">
              Cập nhật bài học & thông báo từ Admin
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1">
          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllAsRead}
              className="px-2 py-1 rounded-lg dark:hover:bg-slate-900 hover:bg-slate-100 text-[11px] font-bold text-cyan-600 dark:text-cyan-400 flex items-center gap-1 transition-colors"
              title="Đánh dấu tất cả đã đọc"
            >
              <CheckCheck className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Đã đọc hết</span>
            </button>
          )}
          <button
            onClick={() => fetchNotifications(true)}
            className="p-1.5 rounded-lg dark:hover:bg-slate-900 hover:bg-slate-100 text-slate-400 hover:text-white transition-colors"
            title="Làm mới thông báo"
          >
            <RotateCw className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg dark:hover:bg-slate-900 hover:bg-slate-100 text-slate-400 hover:text-white transition-colors"
            title="Đóng"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* FILTER TABS */}
      <div className="px-4 py-2 border-b dark:border-slate-800 border-slate-100 dark:bg-slate-950 bg-white flex items-center gap-2 text-xs font-bold">
        <button
          onClick={() => setActiveFilter('all')}
          className={`px-3 py-1 rounded-full transition-all ${
            activeFilter === 'all'
              ? 'bg-cyan-500 text-slate-950 font-black shadow-sm'
              : 'dark:text-slate-400 text-slate-600 dark:hover:text-white hover:text-slate-900'
          }`}
        >
          Tất cả ({notifications.length})
        </button>
        <button
          onClick={() => setActiveFilter('unread')}
          className={`px-3 py-1 rounded-full transition-all flex items-center gap-1 ${
            activeFilter === 'unread'
              ? 'bg-rose-500 text-white font-black shadow-sm'
              : 'dark:text-slate-400 text-slate-600 dark:hover:text-white hover:text-slate-900'
          }`}
        >
          <span>Chưa đọc</span>
          {unreadCount > 0 && (
            <span className="w-2 h-2 rounded-full bg-rose-400 animate-pulse"></span>
          )}
        </button>
      </div>

      {/* NOTIFICATIONS LIST */}
      <div className="flex-1 overflow-y-auto divide-y dark:divide-slate-800/80 divide-slate-100 dark:bg-slate-950 bg-white max-h-[380px] custom-scrollbar">
        {isLoading ? (
          <div className="p-8 text-center space-y-2">
            <div className="w-6 h-6 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="text-xs dark:text-slate-400 text-slate-500">Đang tải thông báo...</p>
          </div>
        ) : filteredNotifications.length === 0 ? (
          <div className="p-8 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl dark:bg-slate-900 bg-slate-100 flex items-center justify-center mx-auto text-slate-400 border dark:border-slate-800 border-slate-200">
              <Bell className="w-6 h-6 stroke-[1.5]" />
            </div>
            <div>
              <p className="font-heading font-bold text-sm dark:text-slate-300 text-slate-700">
                {activeFilter === 'unread' ? 'Không có thông báo chưa đọc' : 'Chưa có thông báo mới nào'}
              </p>
              <p className="text-[11px] dark:text-slate-500 text-slate-400 mt-1">
                Các cập nhật và mẹo luyện thi ETS từ Admin sẽ xuất hiện tại đây.
              </p>
            </div>
          </div>
        ) : (
          filteredNotifications.map((notif) => {
            const badge = getTypeBadge(notif.type);
            const BadgeIcon = badge.icon;

            return (
              <div
                key={notif._id}
                onClick={() => handleItemClick(notif)}
                className={`p-4 transition-colors cursor-pointer relative group flex gap-3 ${
                  notif.isRead
                    ? 'dark:bg-slate-950 bg-white dark:hover:bg-slate-900/70 hover:bg-slate-50 opacity-85 hover:opacity-100'
                    : 'dark:bg-[#0f172a] bg-cyan-50/50 dark:hover:bg-[#1e293b] hover:bg-cyan-50 font-medium'
                }`}
              >
                {/* UNREAD INDICATOR */}
                {!notif.isRead && (
                  <div className="absolute left-1.5 top-5 w-2 h-2 rounded-full bg-cyan-400 shadow-sm shadow-cyan-400/50"></div>
                )}

                {/* TYPE ICON */}
                <div className={`w-9 h-9 rounded-2xl flex items-center justify-center shrink-0 border ${badge.bg}`}>
                  <BadgeIcon className="w-4 h-4" />
                </div>

                {/* CONTENT */}
                <div className="flex-1 min-w-0 space-y-1">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {notif.isPinned && (
                        <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-md bg-amber-500/20 text-amber-400 text-[10px] font-black border border-amber-500/30">
                          <Pin className="w-2.5 h-2.5" />
                          Ghim
                        </span>
                      )}
                      <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[10px] font-bold border ${badge.bg}`}>
                        {badge.label}
                      </span>
                    </div>
                    <span className="text-[10px] dark:text-slate-500 text-slate-400 shrink-0 flex items-center gap-1">
                      <Clock className="w-2.5 h-2.5" />
                      {formatTime(notif.createdAt)}
                    </span>
                  </div>

                  <h4 className={`text-xs leading-snug break-words ${
                    notif.isRead
                      ? 'dark:text-slate-300 text-slate-800'
                      : 'dark:text-white text-slate-950 font-extrabold'
                  }`}>
                    {notif.title}
                  </h4>

                  <p className="text-[11px] dark:text-slate-400 text-slate-600 line-clamp-2 leading-relaxed">
                    {notif.content}
                  </p>

                  {/* ACTION LINK */}
                  {notif.actionUrl && (
                    <div className="pt-1">
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-cyan-600 dark:text-cyan-400 group-hover:underline">
                        <span>Truy cập ngay</span>
                        <ExternalLink className="w-3 h-3" />
                      </span>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* FOOTER */}
      <div className="p-2.5 border-t dark:border-slate-800 border-slate-100 dark:bg-slate-950 bg-slate-50 text-center">
        <span className="text-[10px] dark:text-slate-500 text-slate-400 font-medium">
          Tường Tận TOEIC • Nền Tảng Luyện Thi 4 Kỹ Năng
        </span>
      </div>
    </div>
  );
}
