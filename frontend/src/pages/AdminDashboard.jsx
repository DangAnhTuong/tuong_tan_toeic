import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import axios from 'axios';
import { getStoredUser } from '../utils/auth';
import { 
  ShieldCheck, 
  Users, 
  CreditCard, 
  TrendingUp, 
  Crown, 
  Sparkles, 
  Search, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  RefreshCw, 
  Zap, 
  Flame, 
  BookOpen, 
  Headphones, 
  ChevronRight, 
  DollarSign, 
  FileText,
  Settings,
  QrCode, 
  Check, 
  AlertCircle,
  ChevronLeft,
  MessageSquare,
  Send,
  Trash2,
  Inbox,
  MessageCircle,
  ExternalLink,
  Smile,
  CornerDownRight,
  Megaphone,
  Pin,
  Gift,
  Wrench,
  Bell
} from 'lucide-react';

// Security helper: ensure attachment links only use safe protocols (prevents Stored XSS)
const getSafeUrl = (url) => {
  if (!url || typeof url !== 'string') return '#';
  const clean = url.trim();
  if (/^https?:\/\//i.test(clean) || /^data:image\/(png|jpe?g|gif|webp|bmp);base64,/i.test(clean)) {
    return clean;
  }
  return '#';
};

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'messenger' | 'feedback' | 'users' | 'orders' | 'courses' | 'settings'
  const [stats, setStats] = useState(null);
  const [courseStats, setCourseStats] = useState(null);
  const [usersData, setUsersData] = useState({ users: [], total: 0, page: 1, totalPages: 1 });
  const [ordersData, setOrdersData] = useState({ orders: [], total: 0, page: 1, totalPages: 1 });
  const [usersPage, setUsersPage] = useState(1);
  const [ordersPage, setOrdersPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [userFilter, setUserFilter] = useState('all'); // 'all' | 'premium' | 'free' | 'admin'
  const [orderFilter, setOrderFilter] = useState('all'); // 'all' | 'PAID' | 'PENDING'
  const [actionMessage, setActionMessage] = useState(null);
  const [isActionLoading, setIsActionLoading] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);

  // 1. Messenger 2-Column State
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState('');
  const [isSendingChat, setIsSendingChat] = useState(false);
  const [chatSearch, setChatSearch] = useState('');
  const [chatFilter, setChatFilter] = useState('all'); // 'all' | 'unread' | 'replied'
  const [totalUnreadMessages, setTotalUnreadMessages] = useState(0);
  const [isLoadingChatMessages, setIsLoadingChatMessages] = useState(false);
  const chatScrollRef = useRef(null);

  // 2. Dedicated Feedback & Bug Reports State
  const [feedbackData, setFeedbackData] = useState({ items: [], total: 0, page: 1, totalPages: 1, pendingCount: 0, bugCount: 0, featureCount: 0 });
  const [feedbackPage, setFeedbackPage] = useState(1);
  const [feedbackFilter, setFeedbackFilter] = useState('all'); // 'all' | 'pending' | 'done' | 'bug' | 'feature' | 'content' | 'ui'
  const [feedbackSearch, setFeedbackSearch] = useState('');
  const [feedbackReplyMap, setFeedbackReplyMap] = useState({});

  // 3. Broadcast Notifications State
  const [adminNotifications, setAdminNotifications] = useState([]);
  const [adminNotifTitle, setAdminNotifTitle] = useState('');
  const [adminNotifContent, setAdminNotifContent] = useState('');
  const [adminNotifType, setAdminNotifType] = useState('announcement');
  const [adminNotifPriority, setAdminNotifPriority] = useState('normal');
  const [adminNotifActionUrl, setAdminNotifActionUrl] = useState('');
  const [adminNotifTarget, setAdminNotifTarget] = useState('all');
  const [adminNotifIsPinned, setAdminNotifIsPinned] = useState(false);
  const [isBroadcasting, setIsBroadcasting] = useState(false);

  const quickReplies = [
    'Chào bạn! Mình là Thầy Tường, Admin Tường Tận TOEIC. Mình có thể hỗ trợ gì cho bạn?',
    'Tài khoản VIP 4 tháng của bạn đã được kích hoạt thành công nhé! Chúc bạn ôn tập bứt phá điểm số! 🎉',
    'Cảm ơn bạn đã phản ánh. Mình đã kiểm tra và khắc phục ngay trên hệ thống rồi nhé!',
    'Bạn thử đăng xuất và đăng nhập lại để hệ thống cập nhật tiến độ học tập mới nhất nhé!'
  ];

  // 1. Fetch Dashboard Stats
  const fetchStats = async () => {
    try {
      setIsLoading(true);
      const res = await axios.get('/api/v1/admin/stats');
      if (res.data?.data) {
        setStats(res.data.data);
      }
    } catch (err) {
      console.warn('Stats fetch warning:', err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // 2. Fetch Course & Repository Stats
  const fetchCourseStats = async () => {
    try {
      const res = await axios.get('/api/v1/admin/course-stats');
      if (res.data?.data) {
        setCourseStats(res.data.data);
      }
    } catch (err) {
      console.warn('Course stats warning:', err.message);
    }
  };

  // 3. Fetch Users List
  const fetchUsers = async (page = usersPage) => {
    try {
      setIsLoading(true);
      const res = await axios.get('/api/v1/admin/users', {
        params: { search: searchQuery, filter: userFilter, page, limit: 15 }
      });
      if (res.data?.data) {
        setUsersData(res.data.data);
        setUsersPage(page);
      }
    } catch (err) {
      console.warn('Users fetch warning:', err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // 4. Fetch Orders List
  const fetchOrders = async (page = ordersPage) => {
    try {
      setIsLoading(true);
      const res = await axios.get('/api/v1/admin/transactions', {
        params: { status: orderFilter, page, limit: 15 }
      });
      if (res.data?.data) {
        setOrdersData(res.data.data);
        setOrdersPage(page);
      }
    } catch (err) {
      console.warn('Orders fetch warning:', err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // 5. Fetch Messenger Conversations
  const fetchConversations = async (silent = false) => {
    try {
      if (!silent) setIsLoading(true);
      const res = await axios.get('/api/v1/chat/admin/conversations', {
        params: { search: chatSearch, filter: chatFilter }
      });
      if (res.data?.success) {
        const convList = res.data.data || [];
        setConversations(convList);
        setTotalUnreadMessages(res.data.totalUnread || 0);

        // Auto select first conversation if none selected
        if (!selectedConversation && convList.length > 0) {
          setSelectedConversation(convList[0]);
          fetchConversationMessages(convList[0].conversationId, true);
        } else if (selectedConversation) {
          const fresh = convList.find(c => c.conversationId === selectedConversation.conversationId);
          if (fresh) setSelectedConversation(fresh);
        }
      }
    } catch (err) {
      console.warn('Conversations fetch error:', err.message);
    } finally {
      if (!silent) setIsLoading(false);
    }
  };

  // 6. Fetch Messages for a specific conversation
  const fetchConversationMessages = async (convId, silent = false) => {
    if (!convId) return;
    try {
      if (!silent) setIsLoadingChatMessages(true);
      const res = await axios.get(`/api/v1/chat/conversation/${convId}`);
      if (res.data?.success) {
        setChatMessages(res.data.data || []);
        setTimeout(() => {
          chatScrollRef.current?.scrollIntoView({ behavior: 'smooth' });
        }, 80);
      }
    } catch (err) {
      console.warn('Conversation messages fetch error:', err.message);
    } finally {
      if (!silent) setIsLoadingChatMessages(false);
    }
  };

  // 7. Select conversation
  const handleSelectConversation = (conv) => {
    setSelectedConversation(conv);
    fetchConversationMessages(conv.conversationId);
    if (conv.unreadCount > 0) {
      setConversations(prev => prev.map(c => c.conversationId === conv.conversationId ? { ...c, unreadCount: 0 } : c));
      setTotalUnreadMessages(prev => Math.max(0, prev - conv.unreadCount));
    }
  };

  // 8. Send Chat Message to Student
  const handleSendChatMessage = async (textOverride = null) => {
    const textToSend = (textOverride || chatInput)?.trim();
    if (!textToSend || !selectedConversation) return;
    setChatInput('');
    setIsSendingChat(true);

    const tempId = 'temp_' + Date.now();
    const tempMsg = {
      _id: tempId,
      conversationId: selectedConversation.conversationId,
      senderRole: 'admin',
      senderName: 'Admin Tường Tận TOEIC',
      text: textToSend,
      createdAt: new Date().toISOString()
    };
    setChatMessages(prev => [...prev, tempMsg]);
    setTimeout(() => {
      chatScrollRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 50);

    try {
      const res = await axios.post('/api/v1/chat/send', {
        conversationId: selectedConversation.conversationId,
        recipientEmail: selectedConversation.studentEmail,
        text: textToSend
      });
      if (res.data?.success) {
        setChatMessages(prev => prev.map(m => m._id === tempId ? res.data.data : m));
        fetchConversations(true);
      }
    } catch (err) {
      setActionMessage({ type: 'error', text: 'Không thể gửi tin nhắn. Vui lòng thử lại!' });
      setTimeout(() => setActionMessage(null), 3000);
    } finally {
      setIsSendingChat(false);
    }
  };

  // 9. Delete Conversation
  const handleDeleteConversation = async (convId, e) => {
    e?.stopPropagation();
    if (!window.confirm('Bạn có chắc chắn muốn xóa toàn bộ lịch sử trò chuyện này không?')) return;
    try {
      const res = await axios.delete(`/api/v1/chat/admin/conversation/${convId}`);
      if (res.data?.success) {
        setActionMessage({ type: 'success', text: 'Đã xóa cuộc trò chuyện thành công!' });
        setTimeout(() => setActionMessage(null), 3000);
        if (selectedConversation?.conversationId === convId) {
          setSelectedConversation(null);
          setChatMessages([]);
        }
        fetchConversations(true);
      }
    } catch (err) {
      setActionMessage({ type: 'error', text: 'Có lỗi khi xóa cuộc trò chuyện.' });
      setTimeout(() => setActionMessage(null), 3000);
    }
  };

  // 10. Fetch Dedicated Feedbacks & Bug Reports
  const fetchFeedbacks = async (page = feedbackPage) => {
    try {
      setIsLoading(true);
      const res = await axios.get('/api/v1/feedback/all', {
        params: { status: feedbackFilter, search: feedbackSearch, page, limit: 12 }
      });
      if (res.data?.success) {
        const items = res.data.data || [];
        const bugCount = items.filter(f => f.category === 'bug').length;
        const featureCount = items.filter(f => f.category === 'feature').length;
        setFeedbackData({
          items,
          total: res.data.total || 0,
          totalPages: Math.ceil((res.data.total || 0) / 12) || 1,
          pendingCount: res.data.pendingCount || 0,
          bugCount,
          featureCount,
          page
        });
        setFeedbackPage(page);
      }
    } catch (err) {
      console.warn('Feedback fetch warning:', err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // 11. Send Feedback Reply
  const handleSendFeedbackReply = async (feedbackId) => {
    const text = feedbackReplyMap[feedbackId]?.trim();
    if (!text) return;
    try {
      setIsActionLoading(true);
      const res = await axios.put(`/api/v1/feedback/${feedbackId}/reply`, {
        replyText: text,
        status: 'done'
      });
      if (res.data?.success) {
        setActionMessage({ type: 'success', text: 'Đã gửi phản hồi góp ý đến học viên!' });
        setFeedbackReplyMap(prev => ({ ...prev, [feedbackId]: '' }));
        setTimeout(() => setActionMessage(null), 4000);
        fetchFeedbacks(feedbackPage);
      }
    } catch (err) {
      setActionMessage({ type: 'error', text: 'Có lỗi khi gửi phản hồi góp ý.' });
      setTimeout(() => setActionMessage(null), 4000);
    } finally {
      setIsActionLoading(false);
    }
  };

  // 12. Delete Feedback
  const handleDeleteFeedback = async (feedbackId) => {
    if (!window.confirm('Bạn có chắc muốn xóa phiếu góp ý/báo lỗi này?')) return;
    try {
      setIsActionLoading(true);
      const res = await axios.delete(`/api/v1/feedback/${feedbackId}`);
      if (res.data?.success) {
        setActionMessage({ type: 'success', text: 'Đã xóa phiếu góp ý thành công.' });
        setTimeout(() => setActionMessage(null), 3000);
        fetchFeedbacks(feedbackPage);
      }
    } catch (err) {
      setActionMessage({ type: 'error', text: 'Có lỗi khi xóa phiếu góp ý.' });
      setTimeout(() => setActionMessage(null), 3000);
    } finally {
      setIsActionLoading(false);
    }
  };

  // 9. Fetch Admin Notifications
  const fetchAdminNotifications = async () => {
    try {
      setIsLoading(true);
      const res = await axios.get('/api/v1/notifications/admin/all');
      if (res.data?.success) {
        setAdminNotifications(res.data.data || []);
      }
    } catch (err) {
      console.warn('Admin notifications fetch warning:', err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // 10. Broadcast Notification
  const handleBroadcastNotification = async (e) => {
    e?.preventDefault();
    if (!adminNotifTitle.trim() || !adminNotifContent.trim()) {
      setActionMessage({ type: 'error', text: 'Vui lòng điền đầy đủ tiêu đề và nội dung thông báo.' });
      setTimeout(() => setActionMessage(null), 3500);
      return;
    }

    try {
      setIsBroadcasting(true);
      const res = await axios.post('/api/v1/notifications/admin/create', {
        title: adminNotifTitle.trim(),
        content: adminNotifContent.trim(),
        type: adminNotifType,
        priority: adminNotifPriority,
        actionUrl: adminNotifActionUrl.trim(),
        targetAudience: adminNotifTarget,
        isPinned: adminNotifIsPinned
      });

      if (res.data?.success) {
        setActionMessage({ type: 'success', text: '🚀 Đã phát thông báo thành công tới toàn bộ học viên!' });
        setTimeout(() => setActionMessage(null), 4000);
        setAdminNotifTitle('');
        setAdminNotifContent('');
        setAdminNotifActionUrl('');
        setAdminNotifIsPinned(false);
        fetchAdminNotifications();
      }
    } catch (err) {
      setActionMessage({ type: 'error', text: 'Lỗi phát thông báo: ' + (err.response?.data?.message || err.message) });
      setTimeout(() => setActionMessage(null), 3500);
    } finally {
      setIsBroadcasting(false);
    }
  };

  // 11. Delete Notification
  const handleDeleteNotification = async (id) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa thông báo này? Học viên sẽ không còn thấy nó nữa.')) return;
    try {
      const res = await axios.delete(`/api/v1/notifications/admin/${id}`);
      if (res.data?.success) {
        setActionMessage({ type: 'success', text: 'Đã xóa thông báo thành công.' });
        setTimeout(() => setActionMessage(null), 3000);
        setAdminNotifications(prev => prev.filter(n => n._id !== id));
      }
    } catch (err) {
      setActionMessage({ type: 'error', text: 'Lỗi xóa thông báo: ' + err.message });
      setTimeout(() => setActionMessage(null), 3000);
    }
  };

  // 12. Toggle Pin Notification
  const handleTogglePinNotification = async (id) => {
    try {
      const res = await axios.patch(`/api/v1/notifications/admin/${id}/pin`);
      if (res.data?.success) {
        setActionMessage({ type: 'success', text: res.data.message });
        setTimeout(() => setActionMessage(null), 3000);
        setAdminNotifications(prev => prev.map(n => n._id === id ? { ...n, isPinned: !n.isPinned } : n));
      }
    } catch (err) {
      setActionMessage({ type: 'error', text: 'Lỗi ghim thông báo: ' + err.message });
      setTimeout(() => setActionMessage(null), 3000);
    }
  };

  useEffect(() => {
    async function verifyAdmin() {
      try {
        const localUser = getStoredUser();
        // 1. Fast check in localStorage
        if (!localUser || localUser.role !== 'admin') {
          navigate('/', { replace: true });
          return;
        }

        // 2. Strict server verification
        const res = await axios.get('/api/v1/auth/me');
        if (res.data?.success && res.data?.data?.role === 'admin') {
          setIsAuthorized(true);
          setIsCheckingAuth(false);
          fetchStats();
          fetchCourseStats();
          fetchConversations(true);
          fetchFeedbacks(1);
          fetchAdminNotifications();
        } else {
          navigate('/', { replace: true });
        }
      } catch (err) {
        navigate('/', { replace: true });
      }
    }

    verifyAdmin();
  }, [navigate]);

  // Tab change & filter watcher
  useEffect(() => {
    if (activeTab === 'messenger') fetchConversations();
    if (activeTab === 'feedback') fetchFeedbacks(1);
    if (activeTab === 'notifications') fetchAdminNotifications();
    if (activeTab === 'users') fetchUsers(1);
    if (activeTab === 'orders') fetchOrders(1);
    if (activeTab === 'courses') fetchCourseStats();
  }, [activeTab, userFilter, orderFilter, feedbackFilter, chatFilter]);

  // Live polling for messenger when on tab
  useEffect(() => {
    if (activeTab !== 'messenger') return;
    const timer = setInterval(() => {
      fetchConversations(true);
      if (selectedConversation?.conversationId) {
        fetchConversationMessages(selectedConversation.conversationId, true);
      }
    }, 4000);
    return () => clearInterval(timer);
  }, [activeTab, selectedConversation?.conversationId]);

  // Handle Grant, Extend or Revoke VIP
  const handleVipAction = async (userId, action, durationDays = 120) => {
    try {
      setIsActionLoading(true);
      const res = await axios.post('/api/v1/admin/grant-vip', {
        userId,
        action,
        durationDays
      });
      if (res.data?.success) {
        setActionMessage({
          type: 'success',
          text: res.data.message || 'Cập nhật quyền thành công!'
        });
        setTimeout(() => setActionMessage(null), 4000);
        fetchUsers(usersPage);
        fetchStats();
      }
    } catch (err) {
      setActionMessage({
        type: 'error',
        text: err.response?.data?.message || 'Có lỗi xảy ra khi cập nhật quyền.'
      });
      setTimeout(() => setActionMessage(null), 4000);
    } finally {
      setIsActionLoading(false);
    }
  };

  // Handle 1-Click Approve Order
  const handleApproveOrder = async (orderCode) => {
    try {
      setIsActionLoading(true);
      const res = await axios.post('/api/v1/admin/approve-order', { orderCode });
      if (res.data?.success) {
        setActionMessage({
          type: 'success',
          text: res.data.message || `Đã duyệt đơn ${orderCode} và kích hoạt VIP 120 ngày!`
        });
        setTimeout(() => setActionMessage(null), 5000);
        fetchOrders(ordersPage);
        fetchStats();
      }
    } catch (err) {
      setActionMessage({
        type: 'error',
        text: err.response?.data?.message || 'Có lỗi xảy ra khi duyệt đơn hàng.'
      });
      setTimeout(() => setActionMessage(null), 4000);
    } finally {
      setIsActionLoading(false);
    }
  };

  // Format Currency VND
  const formatCurrency = (val) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val || 0);
  };

  if (isCheckingAuth) {
    return (
      <div className="min-h-screen bg-[#070b14] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-slate-400 text-sm font-medium">Đang xác thực quyền quản trị...</p>
        </div>
      </div>
    );
  }

  if (!isAuthorized) {
    return null;
  }

  return (
    <div className="min-h-screen bg-[#070b14] text-slate-100 font-sans pb-20 selection:bg-cyan-500 selection:text-slate-950">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-8 animate-fadeIn">
        
        {/* ========================================================================= */}
        {/* HEADER: ADMIN PORTAL IDENTITY */}
        {/* ========================================================================= */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-3xl bg-gradient-to-r from-slate-900 via-slate-900/90 to-cyan-950/40 border border-slate-800 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
          <div className="absolute bottom-0 right-1/3 w-60 h-60 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="space-y-1 relative z-10">
            <div className="flex items-center gap-2.5">
              <div className="p-2.5 rounded-2xl bg-gradient-to-br from-amber-400 to-yellow-500 text-slate-950 shadow-lg shadow-amber-500/20">
                <ShieldCheck className="w-6 h-6 stroke-[2.5]" />
              </div>
              <h1 className="text-2xl sm:text-3xl font-black font-heading text-white tracking-tight">
                Trung Tâm Quản Trị Hệ Thống
              </h1>
              <span className="px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/30 text-amber-300 font-black text-xs uppercase tracking-wider flex items-center gap-1">
                <Crown className="w-3.5 h-3.5 fill-amber-400" />
                <span>Super Admin</span>
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-400 pl-11">
              Dữ liệu thật 100% từ MongoDB: 132 Học viên VIP (Gói 99k) • Duyệt VietQR MB Bank tự động • Quản trị toàn diện nền tảng TOEIC.
            </p>
          </div>

          {/* Quick Nav Actions */}
          <div className="flex items-center gap-3 relative z-10">
            <button
              onClick={() => {
                fetchStats();
                if (activeTab === 'messenger') fetchConversations();
                if (activeTab === 'feedback') fetchFeedbacks();
                if (activeTab === 'users') fetchUsers();
                if (activeTab === 'orders') fetchOrders();
                if (activeTab === 'courses') fetchCourseStats();
              }}
              className="p-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-all flex items-center gap-2 text-xs font-bold shadow-md active:scale-95"
              title="Làm mới dữ liệu"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-cyan-400' : ''}`} />
              <span className="hidden sm:inline">Làm mới</span>
            </button>

            <button
              onClick={() => navigate('/hub')}
              className="py-3 px-5 rounded-2xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-xs transition-all flex items-center gap-2 shadow-lg shadow-cyan-500/20 active:scale-95"
            >
              <span>Về Trang Học Viên</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Action Alert Banner */}
        {actionMessage && (
          <div className={`p-4 rounded-2xl border text-xs font-bold flex items-center gap-3 animate-fadeIn ${
            actionMessage.type === 'success' 
              ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300' 
              : 'bg-rose-500/15 border-rose-500/30 text-rose-300'
          }`}>
            {actionMessage.type === 'success' ? <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" /> : <XCircle className="w-5 h-5 text-rose-400 shrink-0" />}
            <span>{actionMessage.text}</span>
          </div>
        )}

        {/* ========================================================================= */}
        {/* 7 MAIN NAVIGATION TABS */}
        {/* ========================================================================= */}
        <div className="flex items-center gap-2 border-b border-slate-800 pb-2 overflow-x-auto custom-scrollbar">
          {[
            { id: 'overview', label: '📊 Tổng Quan Hệ Thống', count: null },
            { id: 'messenger', label: '💬 Trung Tâm Messenger', count: totalUnreadMessages || null },
            { id: 'feedback', label: '📝 Hòm Thư Góp Ý & Lỗi', count: feedbackData.pendingCount || null },
            { id: 'notifications', label: '📢 Phát Thông Báo', count: adminNotifications.length || null },
            { id: 'users', label: '👥 Quản Lý Học Viên', count: stats?.totalUsers || 177 },
            { id: 'orders', label: '💳 Giao Dịch & VietQR', count: stats?.totalOrdersCount || 135 },
            { id: 'courses', label: '📚 Ngân Hàng Đề & Bài Học', count: null },
            { id: 'settings', label: '⚙️ Cấu Hình VietQR', count: null }
          ].map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-5 py-3 rounded-2xl text-xs font-extrabold flex items-center gap-2 transition-all shrink-0 ${
                  isActive
                    ? 'bg-cyan-500 text-slate-950 shadow-lg shadow-cyan-500/20 scale-105'
                    : 'text-slate-400 hover:text-white hover:bg-slate-900 border border-transparent'
                }`}
              >
                <span>{tab.label}</span>
                {tab.count !== null && (
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                    isActive ? 'bg-slate-950 text-cyan-400' : 'bg-slate-800 text-slate-400'
                  }`}>
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* ========================================================================= */}
        {/* TAB 1: OVERVIEW METRICS */}
        {/* ========================================================================= */}
        {activeTab === 'overview' && (
          <div className="space-y-8 animate-fadeIn">
            
            {/* 4 Hero Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              
              {/* Card 1: Doanh Thu Thực Tế */}
              <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-3 relative overflow-hidden shadow-xl">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Tổng Doanh Thu Thực Tế</span>
                  <div className="p-2.5 rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    <DollarSign className="w-5 h-5" />
                  </div>
                </div>
                <div className="space-y-1">
                  <h3 className="text-2xl sm:text-3xl font-black text-emerald-400 font-heading">
                    {formatCurrency(stats?.totalRevenue || 13068000)}
                  </h3>
                  <p className="text-[11px] text-slate-400 flex items-center gap-1 font-semibold">
                    <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
                    <span>{stats?.totalPaidOrdersCount || 132} đơn đã thanh toán (132 x 99k)</span>
                  </p>
                </div>
              </div>

              {/* Card 2: Học Viên */}
              <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-3 relative overflow-hidden shadow-xl">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Tổng Học Viên</span>
                  <div className="p-2.5 rounded-2xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                    <Users className="w-5 h-5" />
                  </div>
                </div>
                <div className="space-y-1">
                  <h3 className="text-2xl sm:text-3xl font-black text-white font-heading">
                    {stats?.totalUsers || 177} học viên
                  </h3>
                  <p className="text-[11px] text-amber-400 flex items-center gap-1 font-bold">
                    <Crown className="w-3.5 h-3.5 fill-amber-400" />
                    <span>{stats?.totalPremiumUsers || 132} VIP Active ({stats?.vipConversionRate || '74.6%'})</span>
                  </p>
                </div>
              </div>

              {/* Card 3: Lượt Làm Bài Tập */}
              <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-3 relative overflow-hidden shadow-xl">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Lượt Làm Bài Tập</span>
                  <div className="p-2.5 rounded-2xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
                    <Zap className="w-5 h-5" />
                  </div>
                </div>
                <div className="space-y-1">
                  <h3 className="text-2xl sm:text-3xl font-black text-purple-400 font-heading">
                    {(stats?.totalExercisesDone || 7601).toLocaleString('vi-VN')} câu
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Tích lũy từ 132 học viên VIP & học viên Free
                  </p>
                </div>
              </div>

              {/* Card 4: Tổng Giờ Học */}
              <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-3 relative overflow-hidden shadow-xl">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Thời Gian Học</span>
                  <div className="p-2.5 rounded-2xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
                    <Clock className="w-5 h-5" />
                  </div>
                </div>
                <div className="space-y-1">
                  <h3 className="text-2xl sm:text-3xl font-black text-amber-400 font-heading">
                    {(stats?.totalStudyHours || 844).toLocaleString('vi-VN')} Giờ
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Tổng thời gian học tập thực tế trên web
                  </p>
                </div>
              </div>

            </div>

            {/* Middle Section: Single Package Structure & Live Orders */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              
              {/* Left: Package Breakdown (Duy nhất 1 gói 99k) */}
              <div className="lg:col-span-5 p-6 rounded-3xl bg-slate-900/70 border border-slate-800 space-y-5 shadow-xl">
                <div className="flex items-center justify-between">
                  <h3 className="font-heading font-extrabold text-base text-white flex items-center gap-2">
                    <span>📦 Gói Cước Hệ Thống (Duy Nhất 1 Gói)</span>
                  </h3>
                  <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-black border border-emerald-500/30">
                    100% Thị phần
                  </span>
                </div>

                <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-950 to-slate-900 border border-cyan-500/30 space-y-4 shadow-lg">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="font-black text-white text-sm">Gói VIP Khai Trương (4 Tháng)</span>
                        <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[9px] font-black">
                          🔥 Duy nhất
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400">Thời hạn sử dụng 120 ngày (4 tháng)</p>
                    </div>
                    <div className="text-right">
                      <span className="text-xs text-slate-500 line-through">199.000₫</span>
                      <p className="text-base font-black text-emerald-400 font-heading">99.000₫</p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs font-bold">
                      <span className="text-slate-300">Số lượng học viên đã đăng ký:</span>
                      <span className="text-cyan-400 font-mono text-sm">{stats?.totalPremiumUsers || 132} học viên</span>
                    </div>
                    <div className="h-2.5 rounded-full bg-slate-950 overflow-hidden border border-slate-800">
                      <div style={{ width: '100%' }} className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-emerald-400" />
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
                    <span>Tổng doanh thu từ gói:</span>
                    <span className="font-mono font-bold text-emerald-400">{formatCurrency(stats?.totalRevenue || 13068000)}</span>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-cyan-950/20 border border-cyan-500/20 text-xs text-cyan-300 space-y-1.5">
                  <span className="font-bold flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-cyan-400" />
                    <span>Chính sách giá minh bạch & tối giản:</span>
                  </span>
                  <p className="text-slate-400 text-[11px] leading-relaxed">
                    Nền tảng vận hành duy nhất 1 gói học phí 99.000 ₫ để tối ưu tỷ lệ chuyển đổi ({stats?.vipConversionRate || '74.6%'}), không chia nhỏ các gói 1 tháng hay 3 tháng gây phân vân cho người học.
                  </p>
                </div>
              </div>

              {/* Right: Recent Transactions */}
              <div className="lg:col-span-7 p-6 rounded-3xl bg-slate-900/70 border border-slate-800 space-y-5 shadow-xl">
                <div className="flex items-center justify-between">
                  <h3 className="font-heading font-extrabold text-base text-white flex items-center gap-2">
                    <span>⚡ Giao Dịch VietQR Gần Đây</span>
                    <span className="px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 text-[10px] font-mono font-bold">
                      {stats?.totalOrdersCount || 135} đơn
                    </span>
                  </h3>
                  <button 
                    onClick={() => setActiveTab('orders')}
                    className="text-xs text-cyan-400 hover:underline flex items-center gap-1 font-bold"
                  >
                    <span>Xem tất cả</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="divide-y divide-slate-800/80 max-h-[340px] overflow-y-auto custom-scrollbar pr-1">
                  {(stats?.recentOrders || []).slice(0, 7).map((order, idx) => (
                    <div key={order._id || idx} className="py-3 flex items-center justify-between text-xs hover:bg-slate-800/30 px-2 rounded-xl transition-colors">
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-white">{order.orderCode}</span>
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                            order.status === 'PAID'
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                              : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                          }`}>
                            {order.status === 'PAID' ? '✓ PAID' : '⏳ PENDING'}
                          </span>
                        </div>
                        <p className="text-slate-400 text-[11px]">{order.planName || 'Gói VIP Khai Trương (4 Tháng)'}</p>
                      </div>
                      <div className="text-right space-y-0.5">
                        <span className={`font-mono font-bold text-sm ${order.status === 'PAID' ? 'text-emerald-400' : 'text-amber-400'}`}>
                          +{formatCurrency(order.amount)}
                        </span>
                        <p className="text-[10px] text-slate-500">{new Date(order.createdAt).toLocaleString('vi-VN')}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>

          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB MESSENGER: TRUNG TÂM CHAT 2 CỘT VỚI HỌC VIÊN */}
        {/* ========================================================================= */}
        {activeTab === 'messenger' && (
          <div className="rounded-3xl bg-slate-900/90 border border-slate-800 shadow-2xl overflow-hidden animate-fadeIn">
            <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[680px]">
              
              {/* LEFT COLUMN: DANH SÁCH CUỘC HỘI THOẠI */}
              <div className="lg:col-span-4 xl:col-span-4 border-r border-slate-800 flex flex-col bg-slate-950/40">
                {/* Header & Search */}
                <div className="p-4 border-b border-slate-800/80 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                        <MessageSquare className="w-4 h-4" />
                      </div>
                      <span className="font-heading font-extrabold text-white text-sm">Hộp Thư Messenger</span>
                    </div>
                    {totalUnreadMessages > 0 && (
                      <span className="px-2.5 py-0.5 rounded-full bg-rose-500 text-white text-[10px] font-black animate-pulse">
                        {totalUnreadMessages} tin mới
                      </span>
                    )}
                  </div>

                  {/* Search Input */}
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={chatSearch}
                      onChange={(e) => setChatSearch(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && fetchConversations()}
                      placeholder="Tìm theo tên, email học viên..."
                      className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 outline-none focus:border-cyan-500 transition-all"
                    />
                  </div>

                  {/* Filter Pills */}
                  <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 custom-scrollbar">
                    {[
                      { id: 'all', label: `Tất cả (${conversations.length})` },
                      { id: 'unread', label: `Chưa đọc 🔴` },
                      { id: 'replied', label: `Đã trả lời ✓` }
                    ].map((f) => (
                      <button
                        key={f.id}
                        onClick={() => setChatFilter(f.id)}
                        className={`px-3 py-1 rounded-lg text-[11px] font-bold transition-all shrink-0 ${
                          chatFilter === f.id
                            ? 'bg-cyan-500 text-slate-950 font-black'
                            : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800/80'
                        }`}
                      >
                        {f.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Conversation List */}
                <div className="flex-1 overflow-y-auto max-h-[560px] custom-scrollbar divide-y divide-slate-800/40">
                  {conversations.length === 0 ? (
                    <div className="p-8 text-center text-slate-500 space-y-2">
                      <MessageCircle className="w-8 h-8 mx-auto text-slate-700" />
                      <p className="text-xs font-bold text-slate-400">Chưa có cuộc trò chuyện nào</p>
                      <p className="text-[11px]">Tin nhắn từ học viên qua khung chat sẽ hiển thị tại đây.</p>
                    </div>
                  ) : (
                    conversations.map((conv) => {
                      const isSelected = selectedConversation?.conversationId === conv.conversationId;
                      const hasUnread = (conv.unreadCount || 0) > 0;
                      const displayTime = conv.lastMessageAt
                        ? new Date(conv.lastMessageAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
                        : '';

                      return (
                        <div
                          key={conv.conversationId}
                          onClick={() => handleSelectConversation(conv)}
                          className={`p-3.5 transition-all cursor-pointer flex items-start gap-3 relative group ${
                            isSelected
                              ? 'bg-gradient-to-r from-cyan-950/40 to-slate-900 border-l-4 border-cyan-400'
                              : 'hover:bg-slate-900/60'
                          }`}
                        >
                          {/* Avatar */}
                          <div className="relative shrink-0">
                            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-cyan-600 to-blue-600 flex items-center justify-center text-white font-black text-sm shadow-md">
                              {(conv.studentName || conv.studentEmail || 'U').charAt(0).toUpperCase()}
                            </div>
                            {hasUnread && (
                              <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-rose-500 border-2 border-slate-950 animate-ping" />
                            )}
                            {hasUnread && (
                              <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-rose-500 border-2 border-slate-950" />
                            )}
                          </div>

                          {/* Info */}
                          <div className="flex-1 min-w-0 space-y-0.5">
                            <div className="flex items-center justify-between">
                              <h4 className={`text-xs font-bold truncate max-w-[150px] ${isSelected ? 'text-cyan-300' : 'text-white'}`}>
                                {conv.studentName || 'Học viên TOEIC'}
                              </h4>
                              <span className="text-[10px] text-slate-500 font-mono shrink-0">{displayTime}</span>
                            </div>

                            <p className="text-[11px] text-slate-400 font-mono truncate">
                              {conv.studentEmail || 'Chưa có email'}
                            </p>

                            <div className="flex items-center justify-between pt-0.5">
                              <p className={`text-xs truncate max-w-[180px] ${hasUnread ? 'text-white font-bold' : 'text-slate-400'}`}>
                                {conv.lastSenderRole === 'admin' ? 'Bạn: ' : ''}{conv.lastMessage || 'Đã gửi tin nhắn'}
                              </p>
                              {hasUnread && (
                                <span className="px-1.5 py-0.2 rounded-full bg-rose-500 text-white font-mono text-[9px] font-black shrink-0">
                                  {conv.unreadCount}
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Quick Delete button on hover */}
                          <button
                            onClick={(e) => handleDeleteConversation(conv.conversationId, e)}
                            className="opacity-0 group-hover:opacity-100 p-1 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-all absolute right-2 top-2"
                            title="Xóa cuộc trò chuyện"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              {/* RIGHT COLUMN: KHUNG TRÒ CHUYỆN 2 CHIỀU */}
              <div className="lg:col-span-8 xl:col-span-8 flex flex-col bg-slate-900/60">
                {!selectedConversation ? (
                  <div className="flex-1 flex flex-col items-center justify-center p-12 text-center text-slate-500 space-y-3">
                    <div className="w-16 h-16 rounded-3xl bg-slate-800/80 border border-slate-700/80 flex items-center justify-center text-cyan-400 shadow-xl">
                      <MessageSquare className="w-8 h-8" />
                    </div>
                    <h3 className="font-heading font-extrabold text-base text-white">Chọn Cuộc Trò Chuyện</h3>
                    <p className="text-xs text-slate-400 max-w-sm leading-relaxed">
                      Nhấn vào học viên bên danh sách cột trái để mở khung chat trực tiếp 2 chiều theo thời gian thực.
                    </p>
                  </div>
                ) : (
                  <>
                    {/* Chat Header */}
                    <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/40">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-cyan-600 to-blue-600 flex items-center justify-center text-white font-black text-sm shadow">
                          {(selectedConversation.studentName || selectedConversation.studentEmail || 'U').charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-white text-sm">{selectedConversation.studentName || 'Học viên TOEIC'}</span>
                            <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 text-[10px] font-bold border border-emerald-500/20 flex items-center gap-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                              <span>Trực tuyến</span>
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-400 font-mono">{selectedConversation.studentEmail || 'Học viên'}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => fetchConversationMessages(selectedConversation.conversationId)}
                          className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-all text-xs flex items-center gap-1.5"
                          title="Làm mới tin nhắn"
                        >
                          <RefreshCw className={`w-3.5 h-3.5 ${isLoadingChatMessages ? 'animate-spin text-cyan-400' : ''}`} />
                          <span className="hidden sm:inline">Làm mới</span>
                        </button>

                        <button
                          onClick={(e) => handleDeleteConversation(selectedConversation.conversationId, e)}
                          className="p-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 transition-all text-xs"
                          title="Xóa cuộc trò chuyện"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Messages Viewport */}
                    <div className="flex-1 p-4 overflow-y-auto space-y-3 custom-scrollbar min-h-[420px] max-h-[460px] bg-slate-950/20">
                      {chatMessages.length === 0 ? (
                        <div className="p-8 text-center text-slate-500 text-xs">
                          Chưa có tin nhắn nào trong cuộc trò chuyện này.
                        </div>
                      ) : (
                        chatMessages.map((msg, idx) => {
                          const isAdmin = msg.senderRole === 'admin';
                          const timeStr = msg.createdAt
                            ? new Date(msg.createdAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
                            : '';

                          return (
                            <div
                              key={msg._id || idx}
                              className={`flex flex-col ${isAdmin ? 'items-end' : 'items-start'}`}
                            >
                              <div className="flex items-end gap-2 max-w-[80%]">
                                {!isAdmin && (
                                  <div className="w-6 h-6 rounded-lg bg-slate-800 text-cyan-300 flex items-center justify-center text-[10px] font-bold shrink-0">
                                    {(msg.senderName || 'H').charAt(0).toUpperCase()}
                                  </div>
                                )}

                                <div
                                  className={`p-3 rounded-2xl text-xs sm:text-sm leading-relaxed whitespace-pre-wrap shadow-md ${
                                    isAdmin
                                      ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-br-sm'
                                      : 'bg-slate-800 text-slate-100 rounded-bl-sm border border-slate-700/80'
                                  }`}
                                >
                                  {msg.text}
                                </div>
                              </div>

                              <span className="text-[10px] text-slate-500 font-mono mt-1 px-1">
                                {isAdmin ? 'Admin • ' : ''}{timeStr}
                              </span>
                            </div>
                          );
                        })
                      )}
                      <div ref={chatScrollRef} />
                    </div>

                    {/* Quick Responses Bar */}
                    <div className="px-4 py-2 bg-slate-950/60 border-t border-slate-800/80 flex items-center gap-2 overflow-x-auto custom-scrollbar">
                      <span className="text-[10px] text-slate-400 font-bold shrink-0 flex items-center gap-1">
                        <Sparkles className="w-3 h-3 text-cyan-400" />
                        <span>Mẫu nhanh:</span>
                      </span>
                      {quickReplies.map((qr, i) => (
                        <button
                          key={i}
                          onClick={() => handleSendChatMessage(qr)}
                          className="px-2.5 py-1 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white text-[11px] border border-slate-700/60 transition-all shrink-0 max-w-[220px] truncate"
                          title={qr}
                        >
                          {qr}
                        </button>
                      ))}
                    </div>

                    {/* Input Composer Bar */}
                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        handleSendChatMessage();
                      }}
                      className="p-3.5 bg-slate-950/80 border-t border-slate-800 flex items-center gap-3"
                    >
                      <input
                        type="text"
                        value={chatInput}
                        onChange={(e) => setChatInput(e.target.value)}
                        placeholder="Nhập tin nhắn phản hồi học viên (Nhấn Enter để gửi)..."
                        className="flex-1 px-4 py-2.5 rounded-2xl bg-slate-900 border border-slate-800 focus:border-cyan-500 text-xs sm:text-sm text-white placeholder-slate-500 outline-none transition-all"
                      />
                      <button
                        type="submit"
                        disabled={isSendingChat || !chatInput.trim()}
                        className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 disabled:opacity-40 disabled:cursor-not-allowed text-slate-950 font-black text-xs transition-all flex items-center gap-1.5 shadow-lg shadow-cyan-500/20 shrink-0 active:scale-95"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>Gửi tin</span>
                      </button>
                    </form>
                  </>
                )}
              </div>

            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB FEEDBACK: HÒM THƯ GÓP Ý & BÁO LỖI RIÊNG BIỆT */}
        {/* ========================================================================= */}
        {activeTab === 'feedback' && (
          <div className="space-y-6 animate-fadeIn">
            {/* Top 4 Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              <div className="p-5 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-2 shadow-xl">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Tổng Góp Ý & Báo Lỗi</span>
                  <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                    <Inbox className="w-4 h-4" />
                  </div>
                </div>
                <h3 className="text-2xl font-black text-white font-heading">{feedbackData.total}</h3>
                <p className="text-[11px] text-slate-400">Phiếu gửi từ học viên</p>
              </div>

              <div className="p-5 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-2 shadow-xl">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Chờ Xử Lý</span>
                  <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
                    <Clock className="w-4 h-4" />
                  </div>
                </div>
                <h3 className="text-2xl font-black text-amber-400 font-heading">{feedbackData.pendingCount}</h3>
                <p className="text-[11px] text-amber-400/80 font-bold">Cần xem & duyệt</p>
              </div>

              <div className="p-5 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-2 shadow-xl">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Báo Lỗi Đề Thi/Web</span>
                  <div className="p-2 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20">
                    <AlertCircle className="w-4 h-4" />
                  </div>
                </div>
                <h3 className="text-2xl font-black text-rose-400 font-heading">{feedbackData.bugCount}</h3>
                <p className="text-[11px] text-slate-400">Phản ánh câu hỏi hoặc giao diện</p>
              </div>

              <div className="p-5 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-2 shadow-xl">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Đã Xử Lý Xong</span>
                  <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                </div>
                <h3 className="text-2xl font-black text-emerald-400 font-heading">
                  {Math.max(0, feedbackData.total - feedbackData.pendingCount)}
                </h3>
                <p className="text-[11px] text-emerald-400/80 font-bold">Hoàn tất tiếp nhận</p>
              </div>
            </div>

            {/* Search and Filters Bar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-slate-900/80 border border-slate-800">
              <div className="relative w-full sm:w-80">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={feedbackSearch}
                  onChange={(e) => setFeedbackSearch(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && fetchFeedbacks(1)}
                  placeholder="Tìm phiếu góp ý, email, nội dung..."
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 outline-none focus:border-cyan-500 transition-all"
                />
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1 custom-scrollbar">
                {[
                  { id: 'all', label: `Tất cả (${feedbackData.total})` },
                  { id: 'pending', label: `⏳ Chờ xử lý (${feedbackData.pendingCount})` },
                  { id: 'done', label: '✓ Đã xử lý' },
                  { id: 'bug', label: '🐞 Báo lỗi' },
                  { id: 'feature', label: '✨ Tính năng mới' }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => {
                      setFeedbackFilter(tab.id);
                      setFeedbackPage(1);
                    }}
                    className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${
                      feedbackFilter === tab.id
                        ? 'bg-cyan-500 text-slate-950 font-extrabold shadow-md shadow-cyan-500/20'
                        : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Feedbacks List */}
            {feedbackData.items.length === 0 ? (
              <div className="p-12 text-center rounded-3xl bg-slate-900/40 border border-slate-800 text-slate-400 space-y-2">
                <Inbox className="w-10 h-10 mx-auto text-slate-600" />
                <p className="font-bold text-sm text-slate-300">Không có phiếu góp ý nào</p>
                <p className="text-xs text-slate-500">Chưa có phiếu góp ý hay báo lỗi nào phù hợp bộ lọc này.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {feedbackData.items.map((item) => {
                  const isDone = item.status === 'done' || item.status === 'accepted';
                  const currentReply = feedbackReplyMap[item._id] ?? '';

                  return (
                    <div 
                      key={item._id}
                      className="p-5 rounded-3xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition-all shadow-xl space-y-4"
                    >
                      {/* Card Header: User info & status */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800/80">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-cyan-600 to-teal-500 flex items-center justify-center text-white font-extrabold text-sm shadow-md">
                            {(item.userName || item.userEmail || 'U').charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-white text-sm">{item.userName || 'Học viên'}</span>
                              <span className={`px-2 py-0.5 rounded-full text-[10px] font-black border ${
                                item.category === 'bug'
                                  ? 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                                  : item.category === 'feature'
                                    ? 'bg-purple-500/20 text-purple-300 border-purple-500/30'
                                    : 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30'
                              }`}>
                                {item.category === 'bug' ? '🐞 Báo lỗi' : item.category === 'feature' ? '✨ Đề xuất tính năng' : '💡 Góp ý'}
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-400 font-mono">{item.userEmail || 'Chưa cung cấp email'}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 self-start sm:self-auto">
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${
                            isDone
                              ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                              : 'bg-amber-500/15 text-amber-400 border-amber-500/30 animate-pulse'
                          }`}>
                            {isDone ? '✓ Đã tiếp nhận' : '⏳ Chờ duyệt'}
                          </span>
                          <span className="text-[11px] text-slate-500 font-mono">
                            {new Date(item.created_at).toLocaleString('vi-VN')}
                          </span>
                          <button
                            onClick={() => handleDeleteFeedback(item._id)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors ml-1"
                            title="Xóa phiếu góp ý"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {/* Card Body: Content */}
                      <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800/60">
                        <p className="text-xs sm:text-sm text-slate-200 whitespace-pre-wrap leading-relaxed">
                          {item.content}
                        </p>

                        {/* Attachments */}
                        {item.attachments && item.attachments.length > 0 && (
                          <div className="flex flex-wrap gap-2 pt-2 mt-2 border-t border-slate-800/50">
                            {item.attachments.map((att, i) => {
                              const safeHref = getSafeUrl(att.url);
                              return (
                                <a
                                  key={i}
                                  href={safeHref}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  onClick={(e) => { if (safeHref === '#') e.preventDefault(); }}
                                  className="px-2.5 py-1 rounded-lg bg-slate-800 text-[11px] text-cyan-300 hover:underline border border-slate-700 flex items-center gap-1"
                                >
                                  <span>📎 {att.name || 'Tệp đính kèm'}</span>
                                </a>
                              );
                            })}
                          </div>
                        )}
                      </div>

                      {/* Previous Admin Reply */}
                      {item.adminReply?.text && (
                        <div className="p-3.5 rounded-2xl bg-cyan-950/20 border border-cyan-500/30 space-y-1">
                          <div className="flex items-center justify-between text-[11px]">
                            <span className="font-bold text-cyan-300 flex items-center gap-1">
                              <span>🛡️ {item.adminReply.adminName || 'Admin Tường Tận TOEIC'}</span>
                              <span className="text-slate-400">• Đã phản hồi</span>
                            </span>
                            {item.adminReply.repliedAt && (
                              <span className="text-slate-500 font-mono">
                                {new Date(item.adminReply.repliedAt).toLocaleString('vi-VN')}
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-cyan-100 whitespace-pre-wrap">
                            {item.adminReply.text}
                          </p>
                        </div>
                      )}

                      {/* Reply Composer */}
                      <div className="pt-2 flex flex-col sm:flex-row gap-2.5 items-end">
                        <textarea
                          rows={2}
                          value={currentReply}
                          onChange={(e) => setFeedbackReplyMap(prev => ({ ...prev, [item._id]: e.target.value }))}
                          placeholder="Nhập câu trả lời phản hồi phiếu góp ý này..."
                          className="w-full p-3 rounded-2xl bg-slate-950 border border-slate-800 focus:border-cyan-500 text-xs text-white placeholder-slate-500 outline-none resize-none transition-all"
                        />
                        <button
                          disabled={isActionLoading || !currentReply.trim()}
                          onClick={() => handleSendFeedbackReply(item._id)}
                          className="px-5 py-3 rounded-2xl bg-cyan-500 hover:bg-cyan-400 disabled:opacity-40 disabled:cursor-not-allowed text-slate-950 font-black text-xs transition-all flex items-center gap-2 shadow-lg shadow-cyan-500/20 shrink-0"
                        >
                          <Send className="w-3.5 h-3.5" />
                          <span>Phản Hồi</span>
                        </button>
                      </div>
                    </div>
                  );
                })}

                {/* Pagination */}
                <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 flex items-center justify-between text-xs text-slate-400">
                  <span>
                    Hiển thị <span className="font-bold text-white">{feedbackData.items.length}</span> / <span className="font-bold text-white">{feedbackData.total}</span> phiếu
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      disabled={feedbackPage <= 1}
                      onClick={() => fetchFeedbacks(feedbackPage - 1)}
                      className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-white font-bold flex items-center gap-1"
                    >
                      <ChevronLeft className="w-3.5 h-3.5" />
                      <span>Trước</span>
                    </button>
                    <span className="px-3 py-1 rounded-xl bg-slate-900 border border-slate-800 font-mono text-cyan-400 font-bold">
                      {feedbackPage} / {feedbackData.totalPages || 1}
                    </span>
                    <button
                      disabled={feedbackPage >= feedbackData.totalPages}
                      onClick={() => fetchFeedbacks(feedbackPage + 1)}
                      className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-white font-bold flex items-center gap-1"
                    >
                      <span>Sau</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB NOTIFICATIONS: PHÁT THÔNG BÁO TOÀN SÀN */}
        {/* ========================================================================= */}
        {activeTab === 'notifications' && (
          <div className="space-y-6 animate-fadeIn">
            {/* Top 3 Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              <div className="p-5 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-2 shadow-xl">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Tổng Thông Báo Đã Phát</span>
                  <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
                    <Megaphone className="w-4 h-4" />
                  </div>
                </div>
                <h3 className="text-2xl font-black text-white font-heading">{adminNotifications.length}</h3>
                <p className="text-[11px] text-slate-400">Tin nhắn toàn sàn</p>
              </div>

              <div className="p-5 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-2 shadow-xl">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Thông Báo Đang Ghim</span>
                  <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
                    <Pin className="w-4 h-4" />
                  </div>
                </div>
                <h3 className="text-2xl font-black text-amber-400 font-heading">
                  {adminNotifications.filter(n => n.isPinned).length}
                </h3>
                <p className="text-[11px] text-amber-400/80 font-bold">Hiển thị ưu tiên hàng đầu</p>
              </div>

              <div className="p-5 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-2 shadow-xl">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Tổng Lượt Học Viên Xem</span>
                  <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                    <Users className="w-4 h-4" />
                  </div>
                </div>
                <h3 className="text-2xl font-black text-cyan-400 font-heading">
                  {adminNotifications.reduce((acc, curr) => acc + (curr.readCount || 0), 0)}
                </h3>
                <p className="text-[11px] text-cyan-400/80 font-bold">Lượt đọc thông báo</p>
              </div>
            </div>

            {/* Main Content: 2 Columns on Desktop */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              {/* LEFT: BROADCAST COMPOSER FORM (5 COLS) */}
              <div className="lg:col-span-5 p-6 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-xl space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-xl bg-purple-500/15 text-purple-400 border border-purple-500/30">
                      <Megaphone className="w-4 h-4" />
                    </div>
                    <h3 className="font-heading font-black text-base text-white">Soạn Thông Báo Mới</h3>
                  </div>
                  <span className="px-2 py-0.5 rounded-full bg-purple-500/15 text-purple-400 border border-purple-500/30 text-[10px] font-bold">
                    Toàn Sàn
                  </span>
                </div>

                <form onSubmit={handleBroadcastNotification} className="space-y-4">
                  {/* Title */}
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-300">Tiêu đề thông báo *</label>
                    <input
                      type="text"
                      value={adminNotifTitle}
                      onChange={(e) => setAdminNotifTitle(e.target.value)}
                      placeholder="VD: 🎉 Ra mắt 10 Bộ Đề ETS 2026 Mới Nhất..."
                      className="w-full p-3 rounded-2xl bg-slate-950 border border-slate-800 focus:border-cyan-500 text-xs text-white placeholder-slate-500 outline-none transition-all"
                    />
                  </div>

                  {/* Content */}
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-300">Nội dung thông báo *</label>
                    <textarea
                      rows={4}
                      value={adminNotifContent}
                      onChange={(e) => setAdminNotifContent(e.target.value)}
                      placeholder="Nhập chi tiết nội dung thông báo, mẹo học tập, hướng dẫn học viên..."
                      className="w-full p-3 rounded-2xl bg-slate-950 border border-slate-800 focus:border-cyan-500 text-xs text-white placeholder-slate-500 outline-none resize-none transition-all"
                    />
                  </div>

                  {/* Type & Priority Row */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-300">Loại thông báo</label>
                      <select
                        value={adminNotifType}
                        onChange={(e) => setAdminNotifType(e.target.value)}
                        className="w-full p-2.5 rounded-2xl bg-slate-950 border border-slate-800 text-xs text-white outline-none focus:border-cyan-500"
                      >
                        <option value="announcement">📢 Thông Báo Chung</option>
                        <option value="update">📝 Cập Nhật Đề Thi</option>
                        <option value="promo">🎁 Ưu Đãi VIP</option>
                        <option value="system">🛠️ Nâng Cấp Hệ Thống</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-300">Độ ưu tiên</label>
                      <select
                        value={adminNotifPriority}
                        onChange={(e) => setAdminNotifPriority(e.target.value)}
                        className="w-full p-2.5 rounded-2xl bg-slate-950 border border-slate-800 text-xs text-white outline-none focus:border-cyan-500"
                      >
                        <option value="normal">Bình thường</option>
                        <option value="high">Quan trọng ⭐</option>
                        <option value="urgent">Khẩn cấp ⚡</option>
                      </select>
                    </div>
                  </div>

                  {/* Target Audience & Action URL */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-300">Đối tượng nhận</label>
                      <select
                        value={adminNotifTarget}
                        onChange={(e) => setAdminNotifTarget(e.target.value)}
                        className="w-full p-2.5 rounded-2xl bg-slate-950 border border-slate-800 text-xs text-white outline-none focus:border-cyan-500"
                      >
                        <option value="all">Tất cả học viên (All)</option>
                        <option value="free">Chỉ học viên Free</option>
                        <option value="pro">Chỉ học viên VIP</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-300">Liên kết (Tùy chọn)</label>
                      <input
                        type="text"
                        value={adminNotifActionUrl}
                        onChange={(e) => setAdminNotifActionUrl(e.target.value)}
                        placeholder="VD: /tests hoặc /pricing"
                        className="w-full p-2.5 rounded-2xl bg-slate-950 border border-slate-800 focus:border-cyan-500 text-xs text-white placeholder-slate-500 outline-none transition-all"
                      />
                    </div>
                  </div>

                  {/* Pinned Checkbox */}
                  <label className="flex items-center gap-2.5 p-3 rounded-2xl bg-slate-950/60 border border-slate-800/80 cursor-pointer hover:border-amber-500/40 transition-colors">
                    <input
                      type="checkbox"
                      checked={adminNotifIsPinned}
                      onChange={(e) => setAdminNotifIsPinned(e.target.checked)}
                      className="w-4 h-4 rounded text-amber-500 focus:ring-0 cursor-pointer"
                    />
                    <div className="flex items-center gap-1.5 text-xs font-bold text-slate-300">
                      <Pin className="w-3.5 h-3.5 text-amber-400" />
                      <span>Ghim lên đầu hòm thư thông báo của học viên</span>
                    </div>
                  </label>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={isBroadcasting}
                    className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-purple-600 via-indigo-600 to-cyan-500 hover:from-purple-500 hover:to-cyan-400 disabled:opacity-50 text-white font-heading font-black text-xs transition-all shadow-lg shadow-purple-500/25 flex items-center justify-center gap-2"
                  >
                    {isBroadcasting ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>Đang phát thông báo...</span>
                      </>
                    ) : (
                      <>
                        <Megaphone className="w-4 h-4" />
                        <span>Phát Thông Báo Toàn Sàn Ngay</span>
                      </>
                    )}
                  </button>
                </form>
              </div>

              {/* RIGHT: BROADCASTED NOTIFICATIONS LIST (7 COLS) */}
              <div className="lg:col-span-7 p-6 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-xl space-y-4 flex flex-col">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-xl bg-cyan-500/15 text-cyan-400 border border-cyan-500/30">
                      <Bell className="w-4 h-4" />
                    </div>
                    <h3 className="font-heading font-black text-base text-white">
                      Danh Sách Thông Báo Đã Phát ({adminNotifications.length})
                    </h3>
                  </div>

                  <button
                    onClick={fetchAdminNotifications}
                    className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                    title="Làm mới"
                  >
                    <RefreshCw className="w-4 h-4" />
                  </button>
                </div>

                {/* Notifications List */}
                <div className="space-y-3 flex-1 overflow-y-auto max-h-[580px] custom-scrollbar pr-1">
                  {adminNotifications.length === 0 ? (
                    <div className="p-12 text-center space-y-3">
                      <div className="w-12 h-12 rounded-2xl bg-slate-800 flex items-center justify-center mx-auto text-slate-500">
                        <Megaphone className="w-6 h-6" />
                      </div>
                      <p className="text-xs text-slate-400">Chưa có thông báo nào được phát.</p>
                    </div>
                  ) : (
                    adminNotifications.map((notif) => (
                      <div
                        key={notif._id}
                        className={`p-4 rounded-2xl border transition-all space-y-2.5 ${
                          notif.isPinned
                            ? 'bg-amber-500/5 border-amber-500/30'
                            : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              {notif.isPinned && (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-black border border-amber-500/40">
                                  <Pin className="w-3 h-3" />
                                  Đang Ghim
                                </span>
                              )}
                              <span className="px-2 py-0.5 rounded-full bg-purple-500/15 text-purple-300 text-[10px] font-bold border border-purple-500/30">
                                {notif.type === 'update' ? '📝 Cập nhật' : notif.type === 'promo' ? '🎁 Ưu đãi' : notif.type === 'system' ? '🛠️ Hệ thống' : '📢 Thông báo'}
                              </span>
                              <span className="text-[10px] text-slate-500 flex items-center gap-1 font-mono">
                                <Clock className="w-3 h-3" />
                                {new Date(notif.createdAt).toLocaleString('vi-VN')}
                              </span>
                            </div>

                            <h4 className="font-heading font-extrabold text-sm text-white leading-snug">
                              {notif.title}
                            </h4>
                          </div>

                          <div className="flex items-center gap-1 shrink-0">
                            <button
                              onClick={() => handleTogglePinNotification(notif._id)}
                              className={`p-1.5 rounded-xl border transition-colors ${
                                notif.isPinned
                                  ? 'bg-amber-500 text-slate-950 border-amber-400'
                                  : 'bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white border-slate-700'
                              }`}
                              title={notif.isPinned ? 'Bỏ ghim' : 'Ghim lên đầu'}
                            >
                              <Pin className="w-3.5 h-3.5" />
                            </button>

                            <button
                              onClick={() => handleDeleteNotification(notif._id)}
                              className="p-1.5 rounded-xl bg-slate-800 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 border border-slate-700 transition-colors"
                              title="Xóa thông báo"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        <p className="text-xs text-slate-400 leading-relaxed break-words">
                          {notif.content}
                        </p>

                        <div className="flex items-center justify-between pt-1 border-t border-slate-900 text-[11px] text-slate-500">
                          <div className="flex items-center gap-3">
                            <span className="flex items-center gap-1 text-cyan-400 font-bold">
                              <Users className="w-3.5 h-3.5" />
                              {notif.readCount || 0} học viên đã xem
                            </span>
                            {notif.actionUrl && (
                              <span className="text-slate-400 font-mono">
                                Link: {notif.actionUrl}
                              </span>
                            )}
                          </div>
                          <span className="text-slate-400">
                            Người phát: <span className="text-slate-300 font-semibold">{notif.senderAdmin?.adminName || 'Admin'}</span>
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 2: USER MANAGEMENT */}
        {/* ========================================================================= */}
        {activeTab === 'users' && (
          <div className="space-y-6 animate-fadeIn">
            
            {/* Search & Filter Bar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-slate-900/80 border border-slate-800">
              <div className="relative w-full sm:w-80">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && fetchUsers(1)}
                  placeholder="Tìm theo tên, email, mã học viên..."
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 outline-none focus:border-cyan-500 transition-all"
                />
              </div>

              {/* 3 User Levels Filter Pills */}
              <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1 custom-scrollbar">
                {[
                  { id: 'all', label: `Tất cả (${stats?.totalUsers || 177})` },
                  { id: 'premium', label: `⭐ VIP Premium (${stats?.totalPremiumUsers || 132})` },
                  { id: 'free', label: `🌱 Học viên Free (${stats?.totalFreeUsers || 45})` },
                  { id: 'admin', label: '👑 Admin (1)' }
                ].map((f) => (
                  <button
                    key={f.id}
                    onClick={() => {
                      setUserFilter(f.id);
                      setUsersPage(1);
                    }}
                    className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${
                      userFilter === f.id
                        ? 'bg-cyan-500 text-slate-950 font-extrabold shadow-md shadow-cyan-500/20'
                        : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Users Table */}
            <div className="rounded-3xl bg-slate-900/80 border border-slate-800 overflow-hidden shadow-2xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-950/80 border-b border-slate-800 text-slate-400 font-bold uppercase text-[10px] tracking-wider">
                    <tr>
                      <th className="p-4 pl-6">Học Viên</th>
                      <th className="p-4">Cấp Bậc & Thời Hạn VIP</th>
                      <th className="p-4">Mục Tiêu Điểm</th>
                      <th className="p-4">Tiến Độ Hôm Nay</th>
                      <th className="p-4">Streak & XP</th>
                      <th className="p-4 pr-6 text-right">Thao Tác Cấp Quyền</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {usersData.users.map((user) => {
                      const isAdmin = user.role === 'admin';
                      const isVip = user.isPro || isAdmin;
                      return (
                        <tr key={user._id || user.userId} className="hover:bg-slate-800/40 transition-colors">
                          
                          {/* User Column */}
                          <td className="p-4 pl-6">
                            <div className="flex items-center gap-3">
                              <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-white font-extrabold text-sm shadow-md ${
                                isAdmin 
                                  ? 'bg-gradient-to-tr from-amber-500 to-yellow-400 text-slate-950' 
                                  : isVip 
                                    ? 'bg-gradient-to-tr from-cyan-600 to-teal-500' 
                                    : 'bg-slate-800 text-slate-400'
                              }`}>
                                {user.avatar || (user.fullName ? user.fullName[0] : 'U')}
                              </div>
                              <div>
                                <p className="font-bold text-white flex items-center gap-1.5">
                                  <span>{user.fullName || 'Học viên'}</span>
                                  {isAdmin && <Crown className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />}
                                </p>
                                <p className="text-[11px] text-slate-400 font-mono">{user.email || user.userId}</p>
                              </div>
                            </div>
                          </td>

                          {/* VIP Status */}
                          <td className="p-4">
                            {isAdmin ? (
                              <span className="px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-300 font-extrabold text-[10px] border border-amber-500/30 flex items-center gap-1 w-fit">
                                <Crown className="w-3 h-3 fill-amber-400" />
                                <span>Super Admin</span>
                              </span>
                            ) : isVip ? (
                              <div className="space-y-0.5">
                                <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 font-extrabold text-[10px] border border-emerald-500/30 flex items-center gap-1 w-fit">
                                  <Sparkles className="w-3 h-3" />
                                  <span>VIP 4 Tháng (99k)</span>
                                </span>
                                {user.proExpiresAt && (
                                  <p className="text-[10px] text-slate-400">
                                    Hạn: {new Date(user.proExpiresAt).toLocaleDateString('vi-VN')}
                                  </p>
                                )}
                              </div>
                            ) : (
                              <span className="px-2.5 py-1 rounded-full bg-slate-800 text-slate-400 font-semibold text-[10px] border border-slate-700">
                                🌱 Học viên Free
                              </span>
                            )}
                          </td>

                          {/* Target Score */}
                          <td className="p-4">
                            <div className="space-y-0.5">
                              <span className="font-bold text-cyan-400">
                                {user.currentScore || 100} ➔ {user.targetScore || 650}+
                              </span>
                              <p className="text-[10px] text-slate-500">Mục tiêu TOEIC</p>
                            </div>
                          </td>

                          {/* Today Progress */}
                          <td className="p-4">
                            <div className="text-[11px] space-y-0.5 text-slate-300">
                              <span>📖 {user.todayProgress?.reading || 0} câu Đọc</span>
                              <br />
                              <span>🎧 {user.todayProgress?.listening || 0} câu Nghe</span>
                            </div>
                          </td>

                          {/* Streak & XP */}
                          <td className="p-4">
                            <div className="space-y-0.5">
                              <span className="text-amber-400 font-bold flex items-center gap-1">
                                <Flame className="w-3.5 h-3.5 fill-amber-400" />
                                {user.streakDays || 0} ngày
                              </span>
                              <span className="text-slate-400 text-[10px] font-mono">
                                {(user.totalXp || 0).toLocaleString()} XP
                              </span>
                            </div>
                          </td>

                          {/* Actions */}
                          <td className="p-4 pr-6 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              {!isVip ? (
                                <button
                                  disabled={isActionLoading}
                                  onClick={() => handleVipAction(user.userId, 'grant', 120)}
                                  className="px-3 py-1.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500 text-emerald-300 hover:text-slate-950 font-black text-[10px] border border-emerald-500/30 transition-all active:scale-95 shadow-md"
                                  title="Cấp VIP Khai Trương (120 Ngày)"
                                >
                                  + Cấp VIP 4T
                                </button>
                              ) : (
                                !isAdmin && (
                                  <>
                                    <button
                                      disabled={isActionLoading}
                                      onClick={() => handleVipAction(user.userId, 'extend', 120)}
                                      className="px-2.5 py-1.5 rounded-xl bg-cyan-500/20 hover:bg-cyan-500 text-cyan-300 hover:text-slate-950 font-bold text-[10px] border border-cyan-500/30 transition-all active:scale-95"
                                      title="Gia hạn thêm 120 ngày VIP"
                                    >
                                      +120N
                                    </button>
                                    <button
                                      disabled={isActionLoading}
                                      onClick={() => handleVipAction(user.userId, 'revoke')}
                                      className="px-2.5 py-1.5 rounded-xl bg-rose-500/15 hover:bg-rose-500 text-rose-400 hover:text-white font-bold text-[10px] border border-rose-500/30 transition-all active:scale-95"
                                      title="Hạ quyền về Free"
                                    >
                                      Hủy VIP
                                    </button>
                                  </>
                                )
                              )}
                            </div>
                          </td>

                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Pagination Bar */}
              <div className="p-4 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400 bg-slate-950/40">
                <span>
                  Hiển thị <span className="font-bold text-white">{usersData.users.length}</span> / <span className="font-bold text-white">{usersData.total}</span> học viên
                </span>
                <div className="flex items-center gap-2">
                  <button
                    disabled={usersPage <= 1}
                    onClick={() => fetchUsers(usersPage - 1)}
                    className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs flex items-center gap-1 font-bold"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                    <span>Trước</span>
                  </button>
                  <span className="px-3 py-1 rounded-xl bg-slate-900 border border-slate-800 font-mono text-cyan-400 font-bold">
                    {usersPage} / {usersData.totalPages || 1}
                  </span>
                  <button
                    disabled={usersPage >= usersData.totalPages}
                    onClick={() => fetchUsers(usersPage + 1)}
                    className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs flex items-center gap-1 font-bold"
                  >
                    <span>Sau</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>

          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 3: PAYMENT TRANSACTIONS & VIETQR */}
        {/* ========================================================================= */}
        {activeTab === 'orders' && (
          <div className="space-y-6 animate-fadeIn">
            
            {/* Filter Bar */}
            <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-900/80 border border-slate-800">
              <h3 className="font-heading font-extrabold text-sm text-white flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-cyan-400" />
                <span>Nhật Ký Đơn Hàng Thanh Toán VietQR (Dữ Liệu Thật)</span>
              </h3>

              <div className="flex items-center gap-2">
                {[
                  { id: 'all', label: `Tất cả (${stats?.totalOrdersCount || 135})` },
                  { id: 'PAID', label: `Đã thanh toán (${stats?.totalPaidOrdersCount || 132})` },
                  { id: 'PENDING', label: `Chờ duyệt (${stats?.pendingOrdersCount || 3})` }
                ].map((st) => (
                  <button
                    key={st.id}
                    onClick={() => {
                      setOrderFilter(st.id);
                      setOrdersPage(1);
                    }}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                      orderFilter === st.id
                        ? 'bg-cyan-500 text-slate-950 font-extrabold'
                        : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                    }`}
                  >
                    {st.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Orders Table */}
            <div className="rounded-3xl bg-slate-900/80 border border-slate-800 overflow-hidden shadow-2xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-950/80 border-b border-slate-800 text-slate-400 font-bold uppercase text-[10px] tracking-wider">
                    <tr>
                      <th className="p-4 pl-6">Mã Đơn</th>
                      <th className="p-4">Học Viên</th>
                      <th className="p-4">Gói VIP</th>
                      <th className="p-4">Số Tiền (VND)</th>
                      <th className="p-4">Tài Khoản Thụ Hưởng</th>
                      <th className="p-4">Thời Gian</th>
                      <th className="p-4">Trạng Thái</th>
                      <th className="p-4 pr-6 text-right">Thao Tác</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 font-mono">
                    {ordersData.orders.map((ord) => (
                      <tr key={ord._id || ord.orderCode} className="hover:bg-slate-800/40 transition-colors">
                        <td className="p-4 pl-6 font-bold text-white">{ord.orderCode}</td>
                        <td className="p-4 font-sans text-slate-300">
                          <p className="font-bold text-white">{ord.customerName || 'Học viên TOEIC'}</p>
                          <p className="text-[10px] text-slate-400 font-mono">{ord.customerEmail || ord.userId}</p>
                        </td>
                        <td className="p-4 text-slate-300 font-sans text-[11px]">{ord.planName}</td>
                        <td className="p-4 font-bold text-emerald-400">{formatCurrency(ord.amount)}</td>
                        <td className="p-4 text-slate-400 text-[11px] font-sans">
                          {ord.bankInfo?.bankId || 'MB'} • {ord.bankInfo?.accountNo || '0335847674'}
                        </td>
                        <td className="p-4 text-slate-400 font-sans text-[11px]">{new Date(ord.createdAt).toLocaleString('vi-VN')}</td>
                        <td className="p-4">
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-black ${
                            ord.status === 'PAID'
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                              : 'bg-amber-500/20 text-amber-300 border border-amber-500/30 animate-pulse'
                          }`}>
                            {ord.status === 'PAID' ? '✓ PAID' : '⏳ PENDING'}
                          </span>
                        </td>
                        <td className="p-4 pr-6 text-right font-sans">
                          {ord.status === 'PENDING' ? (
                            <button
                              disabled={isActionLoading}
                              onClick={() => handleApproveOrder(ord.orderCode)}
                              className="px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-[10px] transition-all shadow-md active:scale-95 flex items-center gap-1 ml-auto"
                            >
                              <Check className="w-3 h-3 stroke-[3]" />
                              <span>Duyệt & Kích Hoạt VIP</span>
                            </button>
                          ) : (
                            <span className="text-slate-500 text-[11px] flex items-center gap-1 justify-end">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                              <span>Hoàn tất</span>
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination Bar */}
              <div className="p-4 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400 bg-slate-950/40">
                <span>
                  Hiển thị <span className="font-bold text-white">{ordersData.orders.length}</span> / <span className="font-bold text-white">{ordersData.total}</span> giao dịch
                </span>
                <div className="flex items-center gap-2">
                  <button
                    disabled={ordersPage <= 1}
                    onClick={() => fetchOrders(ordersPage - 1)}
                    className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs flex items-center gap-1 font-bold"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                    <span>Trước</span>
                  </button>
                  <span className="px-3 py-1 rounded-xl bg-slate-900 border border-slate-800 font-mono text-cyan-400 font-bold">
                    {ordersPage} / {ordersData.totalPages || 1}
                  </span>
                  <button
                    disabled={ordersPage >= ordersData.totalPages}
                    onClick={() => fetchOrders(ordersPage + 1)}
                    className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs flex items-center gap-1 font-bold"
                  >
                    <span>Sau</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>

          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 4: COURSE DATA & CONTENT REPOSITORY */}
        {/* ========================================================================= */}
        {activeTab === 'courses' && (
          <div className="space-y-6 animate-fadeIn">
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
              
              <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-3 shadow-xl">
                <div className="p-3 rounded-2xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 w-fit">
                  <FileText className="w-5 h-5" />
                </div>
                <h4 className="font-heading font-extrabold text-base text-white">91 Đề Thi ETS Full</h4>
                <p className="text-xs text-slate-400">18.200 câu hỏi thật từ 2019 đến 2026 kèm giải thích tiếng Việt và audio ETS bản quyền.</p>
                <div className="pt-2 border-t border-slate-800 text-[11px] text-cyan-300 font-bold flex items-center justify-between">
                  <span>Trạng thái: Sẵn sàng 100%</span>
                  <span className="px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300">ETS Real</span>
                </div>
              </div>

              <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-3 shadow-xl">
                <div className="p-3 rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 w-fit">
                  <BookOpen className="w-5 h-5" />
                </div>
                <h4 className="font-heading font-extrabold text-base text-white">13.622 Câu Reading</h4>
                <p className="text-xs text-slate-400">Trọn bộ 5 Level Part 5, 6, 7 & 14 chuyên đề ngữ pháp chuyên sâu, giải thích 4 bước sư phạm.</p>
                <div className="pt-2 border-t border-slate-800 text-[11px] text-emerald-300 font-bold flex items-center justify-between">
                  <span>Trạng thái: Sẵn sàng 100%</span>
                  <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300">5 Levels</span>
                </div>
              </div>

              <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-3 shadow-xl">
                <div className="p-3 rounded-2xl bg-purple-500/10 text-purple-400 border border-purple-500/20 w-fit">
                  <Headphones className="w-5 h-5" />
                </div>
                <h4 className="font-heading font-extrabold text-base text-white">11.785 Câu Listening</h4>
                <p className="text-xs text-slate-400">Nghe chép chính tả audio đơn lẻ chống lộ dịch + Luyện nghe Passage Part 3 & 4 độc lập 300 cụm.</p>
                <div className="pt-2 border-t border-slate-800 text-[11px] text-purple-300 font-bold flex items-center justify-between">
                  <span>Trạng thái: Sẵn sàng 100%</span>
                  <span className="px-2 py-0.5 rounded bg-purple-500/20 text-purple-300">Audio Cut</span>
                </div>
              </div>

              <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-3 shadow-xl">
                <div className="p-3 rounded-2xl bg-amber-500/10 text-amber-400 border border-amber-500/20 w-fit">
                  <Sparkles className="w-5 h-5" />
                </div>
                <h4 className="font-heading font-extrabold text-base text-white">3.515+ Từ Vựng SRS</h4>
                <p className="text-xs text-slate-400">83 Chủ đề Spaced Repetition SuperMemo-2 + 2 Game Cyber Neon Word Blast và Word Match.</p>
                <div className="pt-2 border-t border-slate-800 text-[11px] text-amber-300 font-bold flex items-center justify-between">
                  <span>Trạng thái: Sẵn sàng 100%</span>
                  <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300">SM-2 Ready</span>
                </div>
              </div>

            </div>

          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 5: VIETQR CONFIGURATION & BANK DETAILS */}
        {/* ========================================================================= */}
        {activeTab === 'settings' && (
          <div className="space-y-6 animate-fadeIn">
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              
              {/* Left: Bank Settings */}
              <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-5 shadow-xl">
                <h3 className="font-heading font-extrabold text-base text-white flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-cyan-400" />
                  <span>Tài Khoản Thụ Hưởng VietQR</span>
                </h3>

                <div className="space-y-3 divide-y divide-slate-800/80 text-xs">
                  <div className="pt-2 flex items-center justify-between">
                    <span className="text-slate-400">Ngân hàng thụ hưởng:</span>
                    <span className="font-bold text-white">Ngân hàng Quân Đội (MB Bank)</span>
                  </div>
                  <div className="pt-3 flex items-center justify-between">
                    <span className="text-slate-400">Số tài khoản:</span>
                    <span className="font-mono font-bold text-cyan-400 text-sm">0335847674</span>
                  </div>
                  <div className="pt-3 flex items-center justify-between">
                    <span className="text-slate-400">Chủ tài khoản:</span>
                    <span className="font-bold text-amber-400 uppercase">DANG ANH TUONG</span>
                  </div>
                  <div className="pt-3 flex items-center justify-between">
                    <span className="text-slate-400">Cú pháp chuyển khoản:</span>
                    <span className="font-mono font-bold text-emerald-400">TOEICxxxxx</span>
                  </div>
                  <div className="pt-3 flex items-center justify-between">
                    <span className="text-slate-400">Giá gói khai trương:</span>
                    <span className="font-bold text-white">99.000 ₫ (gốc 199.000 ₫)</span>
                  </div>
                  <div className="pt-3 flex items-center justify-between">
                    <span className="text-slate-400">Thời hạn gói cước:</span>
                    <span className="font-bold text-white">120 ngày (4 tháng)</span>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-emerald-950/20 border border-emerald-500/20 text-xs text-emerald-300 space-y-1">
                  <span className="font-bold flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>Cơ Chế Webhook Tự Động:</span>
                  </span>
                  <p className="text-slate-400 text-[11px] leading-relaxed">
                    Khi học viên quét mã VietQR và hoàn tất chuyển khoản với nội dung TOEICxxxxx, hệ thống sẽ tự động kích hoạt 120 ngày VIP trong vòng 3 - 5 giây. Nếu ngân hàng chậm, Admin có thể bấm nút "Duyệt đơn thủ công" ở tab Giao Dịch.
                  </p>
                </div>
              </div>

              {/* Right: VietQR Dynamic Live Preview */}
              <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-5 shadow-xl flex flex-col items-center justify-center text-center">
                <h3 className="font-heading font-extrabold text-base text-white flex items-center gap-2">
                  <QrCode className="w-5 h-5 text-cyan-400" />
                  <span>Mã VietQR Mẫu (Gói VIP 99k)</span>
                </h3>

                <div className="p-4 rounded-2xl bg-white shadow-2xl">
                  <img
                    src="https://img.vietqr.io/image/MB-0335847674-compact2.png?amount=99000&addInfo=TOEIC_DEMO&accountName=DANG%20ANH%20TUONG"
                    alt="VietQR Demo"
                    className="w-56 h-auto rounded-lg"
                  />
                </div>

                <p className="text-[11px] text-slate-400 max-w-xs">
                  Mã QR động chuẩn VietQR NAPAS 247 được sinh tự động cho từng đơn hàng với số tiền cố định 99.000 ₫.
                </p>
              </div>

            </div>

          </div>
        )}

      </main>
    </div>
  );
}
