import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { 
  MessageSquare, 
  X, 
  Send, 
  Users, 
  Smile, 
  Sparkles, 
  Flame, 
  ChevronLeft, 
  Circle,
  Volume2,
  VolumeX,
  Target,
  ShieldCheck
} from 'lucide-react';
import axios from 'axios';

import { getStoredUser, getAuthToken } from '../utils/auth';

export const ADMIN_CONTACT = {
  name: 'Admin Tường Tận TOEIC',
  fullName: 'Đặng Anh Tường • Admin Tường Tận TOEIC',
  role: 'Admin Hệ Thống',
  isAdmin: true,
  avatar: '🛡️'
};

export default function FloatingSocialChat() {
  const location = useLocation();
  const pathname = location.pathname;
  const [currentUser, setCurrentUser] = useState(getStoredUser());

  useEffect(() => {
    const handleAuthChange = () => {
      setCurrentUser(getStoredUser());
    };
    window.addEventListener('storage', handleAuthChange);
    window.addEventListener('user_login_success', handleAuthChange);
    return () => {
      window.removeEventListener('storage', handleAuthChange);
      window.removeEventListener('user_login_success', handleAuthChange);
    };
  }, []);

  const token = getAuthToken();
  const isAuthenticated = !!currentUser && !currentUser?.isGuest && !!token;
  const isCurrentAdmin = currentUser?.role === 'admin' || currentUser?.email?.toLowerCase() === 'danganhtuongg@gmail.com';
  const mySenderName = currentUser?.name || currentUser?.fullName || (currentUser?.email ? currentUser.email.split('@')[0] : 'Bạn');

  // Do NOT render floating chat on auth/landing authentication pages
  const isAuthPage = 
    pathname === '/login' || 
    pathname === '/signup' || 
    pathname === '/forgot-password' || 
    pathname === '/reset-password';

  // Do NOT render floating chat in practice rooms, test rooms, or game arenas where bottom toolbars exist
  const isPracticeOrExam = 
    pathname.includes('/practice') || 
    pathname.includes('/level-practice') || 
    pathname.includes('/room') || 
    pathname.includes('/dictation') ||
    pathname.includes('/grammar/') ||
    pathname.includes('/article/') ||
    pathname.includes('/battle') ||
    pathname.includes('/learn/') ||
    pathname.includes('/review');

  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('global'); // 'global' | 'direct'
  const [activeDirectUser, setActiveDirectUser] = useState(null);
  const [unreadCount, setUnreadCount] = useState(1);
  const [inputMessage, setInputMessage] = useState('');
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Global Community Messages
  const [globalMessages, setGlobalMessages] = useState([
    {
      id: 1,
      sender: 'Diệu Anh Nguyễn',
      role: 'Top 1 Tuần 👑',
      avatar: 'D',
      text: 'Chào mọi người, hôm nay ai luyện đề ETS 2026 Test 2 cùng mình không? 🎯',
      time: '14:20',
      badge: 'Lv. 18'
    },
    {
      id: 2,
      sender: 'Thành Trung Đỗ',
      role: 'Á Quân 🥈',
      avatar: 'T',
      text: 'Mẹo làm Part 5 là nhìn 4 đáp án trước xem là bài tập từ loại hay ngữ pháp nhé các bạn!',
      time: '14:25',
      badge: 'Lv. 16'
    },
    {
      id: 3,
      sender: 'Ngọc Nguyễn',
      role: 'Chuỗi 138 ngày 🔥',
      avatar: 'N',
      text: 'Mỗi ngày cứ làm đều đặn 1 bài nghe chép chính tả là tai lên trình thấy rõ luôn á 💪',
      time: '14:32',
      badge: 'Lv. 15'
    }
  ]);

  // Direct 1-on-1 Chats (Map of userId -> Messages)
  const defaultAdminMessages = [
    {
      id: 'admin-init',
      sender: ADMIN_CONTACT.name,
      text: 'Xin chào bạn! Mình là Đặng Anh Tường, Admin Tường Tận TOEIC 🛡️. Bạn có thắc mắc về lộ trình học, kỹ thuật đề thi, báo lỗi nội dung hoặc cần hỗ trợ tài khoản? Cứ để lại tin nhắn tại đây, mình sẽ hỗ trợ bạn ngay nhé!',
      time: 'Hôm nay',
      isMe: false
    }
  ];

  const [directConversations, setDirectConversations] = useState(() => {
    try {
      const saved = localStorage.getItem('tuongtan_direct_conversations');
      if (saved) {
        const parsed = JSON.parse(saved);
        // Clean out any simulated bot conversation (e.g. 'phạm tú')
        delete parsed['phạm tú'];
        if (!parsed[ADMIN_CONTACT.name] || parsed[ADMIN_CONTACT.name].length === 0) {
          parsed[ADMIN_CONTACT.name] = defaultAdminMessages;
        }
        return parsed;
      }
      return { [ADMIN_CONTACT.name]: defaultAdminMessages };
    } catch {
      return { [ADMIN_CONTACT.name]: defaultAdminMessages };
    }
  });

  const messagesEndRef = useRef(null);

  // Save conversations to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('tuongtan_direct_conversations', JSON.stringify(directConversations));
    } catch (e) {}
  }, [directConversations]);

  // 1. Fetch inquiries for Admin
  const [adminInquiries, setAdminInquiries] = useState([]);

  const fetchAdminInquiries = () => {
    if (!isCurrentAdmin) return;
    axios.get('/api/v1/chat/admin/conversations', { params: { limit: 50 } })
      .then(res => {
        if (res.data?.data) {
          setAdminInquiries(res.data.data);
        }
      })
      .catch(() => {});
  };

  useEffect(() => {
    if (isCurrentAdmin && isOpen) {
      fetchAdminInquiries();
    }
  }, [isCurrentAdmin, isOpen]);

  // Group inquiries by student into threads from ChatMessage API
  const studentThreads = useMemo(() => {
    if (!isCurrentAdmin) return [];
    return adminInquiries.map(item => ({
      key: item.conversationId,
      name: item.studentName || 'Học viên TOEIC',
      email: item.studentEmail || '',
      lastMessage: item.lastMessage || 'Đã gửi tin nhắn',
      lastTime: item.lastMessageAt ? new Date(item.lastMessageAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) : '',
      hasPending: (item.unreadCount || 0) > 0,
      unreadCount: item.unreadCount || 0
    }));
  }, [adminInquiries, isCurrentAdmin]);

  // 2. Fetch my chat messages with Admin to sync 2-way real-time (auto-poll every 3s)
  useEffect(() => {
    if (isCurrentAdmin || !isOpen) return;

    const fetchMyChat = () => {
      axios.get('/api/v1/chat/my-messages', {
        params: { email: currentUser?.email }
      }).then(res => {
        if (res.data?.data && res.data.data.length > 0) {
          const synced = [defaultAdminMessages[0]];
          res.data.data.forEach(m => {
            const sendTime = new Date(m.createdAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
            synced.push({
              sender: m.senderRole === 'admin' ? ADMIN_CONTACT.name : 'me',
              text: m.text,
              time: sendTime,
              isMe: m.senderRole !== 'admin'
            });
          });

          setDirectConversations(prev => ({
            ...prev,
            [ADMIN_CONTACT.name]: synced
          }));
        }
      }).catch(() => {});
    };

    fetchMyChat();
    const interval = setInterval(fetchMyChat, 3000);
    return () => clearInterval(interval);
  }, [isCurrentAdmin, isOpen, currentUser?.email]);

  // Listen to open_admin_chat event
  useEffect(() => {
    function handleOpenAdminChat() {
      setActiveDirectUser(ADMIN_CONTACT);
      setActiveTab('direct');
      setIsOpen(true);
      setUnreadCount(0);
    }

    window.addEventListener('open_admin_chat', handleOpenAdminChat);
    return () => window.removeEventListener('open_admin_chat', handleOpenAdminChat);
  }, []);

  // Listen to external event from UserProfilePopover
  useEffect(() => {
    function handleOpenDirectChat(event) {
      const targetUser = event.detail;
      if (!targetUser) return;

      const targetName = targetUser.name || targetUser.fullName || targetUser.user;
      
      // STRICT RULE: Only confirmed friends can open direct chat (Admin is exempted!)
      const isAdmin = targetUser.isAdmin || targetName === ADMIN_CONTACT.name;
      if (!isAdmin) {
        let savedFriends = [];
        try {
          savedFriends = JSON.parse(localStorage.getItem('tuongtan_friends') || '[]');
        } catch (e) {}

        if (!savedFriends.includes(targetName)) {
          // Non-friends / Bots are blocked from direct chat
          return;
        }
      }

      setActiveDirectUser(targetUser);
      setActiveTab('direct');
      setIsOpen(true);
      setUnreadCount(0);

      // Initialize empty thread if not present (NO automated bot greeting!)
      if (!directConversations[targetName]) {
        setDirectConversations(prev => ({
          ...prev,
          [targetName]: targetName === ADMIN_CONTACT.name ? defaultAdminMessages : []
        }));
      }
    }

    window.addEventListener('open_direct_chat', handleOpenDirectChat);
    return () => window.removeEventListener('open_direct_chat', handleOpenDirectChat);
  }, [directConversations]);

  // Scroll to bottom when messages update
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [globalMessages, directConversations, activeDirectUser, isOpen]);

  const handleSendMessage = (e) => {
    e?.preventDefault();
    if (!inputMessage.trim()) return;

    const currentTime = new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
    const textToSend = inputMessage.trim();
    setInputMessage('');

    if (activeTab === 'global') {
      const newMsg = {
        id: Date.now(),
        sender: `Bạn (${mySenderName})`,
        avatar: mySenderName.charAt(0).toUpperCase(),
        text: textToSend,
        time: currentTime,
        isMe: true,
        badge: 'Lv. 15'
      };
      setGlobalMessages(prev => [...prev, newMsg]);

      // STRICT RULE: No automated bot responses in community chat
    } else if (activeTab === 'direct' && activeDirectUser) {
      // If Admin is replying to a student thread
      if (activeDirectUser.isStudentThread) {
        const studentKey = activeDirectUser.key;
        const newMsg = {
          sender: 'Admin',
          text: textToSend,
          time: currentTime,
          isMe: true
        };

        setDirectConversations(prev => ({
          ...prev,
          [studentKey]: [...(prev[studentKey] || []), newMsg]
        }));

        axios.post('/api/v1/chat/send', {
          conversationId: studentKey,
          recipientEmail: activeDirectUser.email,
          text: textToSend
        }).then(() => {
          fetchAdminInquiries();
        }).catch(() => {});
        return;
      }

      const targetName = activeDirectUser.name || activeDirectUser.fullName || activeDirectUser.user;
      const isAdmin = activeDirectUser.isAdmin || targetName === ADMIN_CONTACT.name;
      
      // Check friendship before sending for regular users (Admin is exempted!)
      if (!isAdmin) {
        let savedFriends = [];
        try {
          savedFriends = JSON.parse(localStorage.getItem('tuongtan_friends') || '[]');
        } catch (e) {}

        if (!savedFriends.includes(targetName)) {
          return;
        }
      }

      const newMsg = {
        sender: 'me',
        text: textToSend,
        time: currentTime,
        isMe: true
      };

      setDirectConversations(prev => ({
        ...prev,
        [targetName]: [...(prev[targetName] || []), newMsg]
      }));

      // If message is sent to Admin, persist to backend so Admin receives it
      if (isAdmin) {
        axios.post('/api/v1/chat/send', {
          text: textToSend,
          senderName: mySenderName,
          senderEmail: currentUser?.email
        }).catch(() => {});
      }
    }
  };

  const quickPrompts = [
    'Hôm nay các bạn luyện đề nào rồi? 🔥',
    'Phần 5 ngữ pháp có mẹo gì hay không ạ? 📚',
    'Cùng nhau cố gắng thi đạt điểm cao nhé! 🎯'
  ];

  // STRICT RULE: Require registered & logged in user to show chat!
  // Placed after all Hooks to strictly comply with React Rules of Hooks
  if (!isAuthenticated || isAuthPage || isPracticeOrExam) {
    return null;
  }

  return (
    <>
      {/* FLOATING TRIGGER BUTTON (BOTTOM RIGHT) */}
      {!isOpen && (
        <div className="fixed bottom-20 sm:bottom-6 right-4 sm:right-6 z-40 animate-bounce-subtle">
          <button
            onClick={() => {
              setIsOpen(true);
              setUnreadCount(0);
            }}
            className="relative flex items-center gap-2.5 px-3.5 sm:px-4 py-2.5 sm:py-3 rounded-full bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-400 hover:to-teal-400 text-slate-950 font-black text-xs sm:text-sm shadow-2xl shadow-cyan-500/40 hover:scale-105 transition-all cursor-pointer border border-cyan-300/40"
          >
            <div className="relative">
              <MessageSquare className="w-4 h-4 sm:w-5 sm:h-5 fill-slate-950" />
              <span className="absolute -top-1 -right-1 w-2 sm:w-2.5 h-2 sm:h-2.5 rounded-full bg-emerald-400 border-2 border-slate-950 animate-ping" />
              <span className="absolute -top-1 -right-1 w-2 sm:w-2.5 h-2 sm:h-2.5 rounded-full bg-emerald-400 border-2 border-slate-950" />
            </div>
            
            <span className="font-heading tracking-wide">Chat</span>

            {unreadCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-rose-500 text-white font-mono text-[10px] font-black shadow">
                {unreadCount}
              </span>
            )}
          </button>
        </div>
      )}

      {/* FLOATING CHAT WINDOW DRAWER */}
      {isOpen && (
        <div className="fixed bottom-0 sm:bottom-6 right-0 sm:right-6 z-50 w-full sm:max-w-[380px] h-[85vh] sm:h-[520px] rounded-t-3xl sm:rounded-3xl bg-[#0b1329] border border-slate-700/90 text-white shadow-2xl flex flex-col overflow-hidden animate-scaleUp">
          
          {/* Header */}
          <div className="p-4 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              {activeTab === 'direct' && activeDirectUser && (
                <button 
                  onClick={() => setActiveTab('direct_list')}
                  className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
              )}
              
              <div className="relative">
                <div className={`w-9 h-9 rounded-xl p-0.5 shadow ${
                  activeTab === 'direct' && (activeDirectUser?.isAdmin || activeDirectUser?.name === ADMIN_CONTACT.name)
                    ? 'bg-gradient-to-tr from-purple-500 via-indigo-500 to-cyan-400'
                    : 'bg-gradient-to-tr from-cyan-500 to-teal-400'
                }`}>
                  <div className="w-full h-full bg-slate-900 rounded-[10px] flex items-center justify-center font-bold text-xs text-cyan-300">
                    {activeTab === 'direct' && activeDirectUser 
                      ? (activeDirectUser.avatar || (activeDirectUser.name || 'U').charAt(0).toUpperCase())
                      : '💬'
                    }
                  </div>
                </div>
                <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-500 border-2 border-slate-900" />
              </div>

              <div>
                <h4 className="font-heading font-extrabold text-xs sm:text-sm text-white truncate max-w-[170px] flex items-center gap-1">
                  <span>
                    {activeTab === 'direct' && activeDirectUser 
                      ? (activeDirectUser.name || activeDirectUser.fullName)
                      : 'Cộng Đồng TOEIC'
                    }
                  </span>
                  {activeTab === 'direct' && (activeDirectUser?.isAdmin || activeDirectUser?.name === ADMIN_CONTACT.name) && (
                    <span className="text-[10px] text-cyan-400 font-bold">✓</span>
                  )}
                  {activeTab === 'direct' && activeDirectUser?.isStudentThread && (
                    <span className="text-[10px] text-amber-400 font-bold">Học viên</span>
                  )}
                </h4>
                <p className="text-[10px] text-emerald-400 flex items-center gap-1 font-mono">
                  <Circle className="w-1.5 h-1.5 fill-emerald-400" />
                  <span className="truncate max-w-[150px]">
                    {activeTab === 'direct' && (activeDirectUser?.isAdmin || activeDirectUser?.name === ADMIN_CONTACT.name)
                      ? 'Admin đang trực tuyến'
                      : activeTab === 'direct' && activeDirectUser?.isStudentThread
                        ? (activeDirectUser.email || 'Tin nhắn học viên')
                        : '142 học viên online'
                    }
                  </span>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button 
                onClick={() => setSoundEnabled(!soundEnabled)} 
                title={soundEnabled ? 'Tắt âm báo' : 'Bật âm báo'}
                className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
              >
                {soundEnabled ? <Volume2 className="w-4 h-4 text-cyan-400" /> : <VolumeX className="w-4 h-4 text-slate-500" />}
              </button>

              <button 
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Navigation Tabs (Chat Chung vs Tin Nhắn Riêng) */}
          <div className="flex items-center border-b border-slate-800 bg-slate-950/60 p-1.5 text-xs font-bold">
            <button
              onClick={() => {
                setActiveTab('global');
                setActiveDirectUser(null);
              }}
              className={`flex-1 py-1.5 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
                activeTab === 'global' 
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30' 
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>Phòng Chat Chung</span>
            </button>

            <button
              onClick={() => setActiveTab(activeDirectUser ? 'direct' : 'direct_list')}
              className={`flex-1 py-1.5 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
                activeTab === 'direct' || activeTab === 'direct_list'
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' 
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>{isCurrentAdmin ? 'Hòm Thư Học Viên' : 'Tin Nhắn Bạn Bè'}</span>
              {isCurrentAdmin && studentThreads.some(t => t.hasPending) && (
                <span className="px-1.5 py-0.2 rounded-full bg-amber-500 text-slate-950 font-bold text-[9px]">
                  {studentThreads.filter(t => t.hasPending).length}
                </span>
              )}
            </button>
          </div>

          {/* CHAT MESSAGES BODY */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3.5 text-xs">
            
            {/* 1. Global Room Messages */}
            {activeTab === 'global' && (
              <>
                <div className="p-2.5 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 text-[11px] text-center space-y-1">
                  <span className="font-bold">🌟 Chào mừng bạn đến với Phòng Chat TOEIC!</span>
                  <p className="text-[10px] text-slate-300">Hãy cùng chia sẻ kinh nghiệm, hỏi bài và động viên nhau học tốt nhé.</p>
                </div>

                {globalMessages.map((msg) => (
                  <div 
                    key={msg.id}
                    className={`flex flex-col ${msg.isMe ? 'items-end' : 'items-start'} space-y-1`}
                  >
                    {!msg.isMe && (
                      <div className="flex items-center gap-1.5 text-[10px] text-slate-400 pl-1">
                        <span className="font-bold text-slate-200">{msg.sender}</span>
                        {msg.role && (
                          <span className="px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 font-mono text-[9px]">
                            {msg.role}
                          </span>
                        )}
                        <span>{msg.time}</span>
                      </div>
                    )}

                    <div 
                      className={`max-w-[82%] p-3 rounded-2xl leading-relaxed shadow-sm ${
                        msg.isMe
                          ? 'bg-gradient-to-r from-cyan-500 to-teal-500 text-slate-950 font-medium rounded-br-none'
                          : 'bg-slate-900 border border-slate-800 text-slate-100 rounded-bl-none'
                      }`}
                    >
                      {msg.text}
                    </div>
                  </div>
                ))}
              </>
            )}

            {/* 2. Direct Conversations List (When not inside a specific chat) */}
            {activeTab === 'direct_list' && (() => {
              let savedFriends = [];
              try {
                savedFriends = JSON.parse(localStorage.getItem('tuongtan_friends') || '[]');
              } catch (e) {}

              // Only show conversations with accepted friends
              const friendEntries = Object.entries(directConversations).filter(([userName]) => savedFriends.includes(userName));

              return (
                <div className="space-y-2.5">
                  {/* PINNED OFFICIAL ADMIN SUPPORT CARD OR ADMIN INBOX */}
                  {isCurrentAdmin ? (
                    <div className="space-y-2">
                      <div className="text-[11px] text-cyan-400 font-bold flex items-center justify-between">
                        <div className="flex items-center gap-1">
                          <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
                          <span>Hòm thư học viên gửi Admin:</span>
                        </div>
                        <span className="px-1.5 py-0.2 rounded-full bg-cyan-500/20 text-cyan-300 font-mono text-[10px]">
                          {studentThreads.length} học viên
                        </span>
                      </div>

                      {studentThreads.length === 0 ? (
                        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 text-center text-slate-400 text-xs">
                          <p>Chưa có tin nhắn nào từ học viên.</p>
                        </div>
                      ) : (
                        studentThreads.map((th) => (
                          <div
                            key={th.key}
                            onClick={() => {
                              axios.get(`/api/v1/chat/conversation/${th.key}`).then(res => {
                                if (res.data?.data) {
                                  const msgs = res.data.data.map(m => ({
                                    sender: m.senderRole === 'admin' ? 'Admin' : th.name,
                                    text: m.text,
                                    time: new Date(m.createdAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
                                    isMe: m.senderRole === 'admin'
                                  }));
                                  setDirectConversations(prev => ({
                                    ...prev,
                                    [th.key]: msgs
                                  }));
                                }
                              }).catch(() => {});

                              setActiveDirectUser({
                                name: th.name,
                                email: th.email,
                                key: th.key,
                                isStudentThread: true
                              });
                              setActiveTab('direct');
                            }}
                            className="p-3 rounded-2xl bg-slate-900 border border-slate-800 hover:border-cyan-400/50 transition-all flex items-center justify-between cursor-pointer group shadow-sm"
                          >
                            <div className="flex items-center gap-2.5">
                              <div className="relative shrink-0">
                                <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-600 to-teal-500 flex items-center justify-center font-bold text-sm text-white shadow">
                                  {th.name.charAt(0).toUpperCase()}
                                </div>
                                {th.hasPending && (
                                  <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-amber-400 border-2 border-slate-950 animate-ping" />
                                )}
                              </div>
                              <div>
                                <div className="flex items-center gap-1.5">
                                  <h5 className="font-heading font-extrabold text-white text-xs group-hover:text-cyan-300 transition-colors truncate max-w-[130px]">
                                    {th.name}
                                  </h5>
                                  {th.hasPending ? (
                                    <span className="px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 text-[9px] font-bold">
                                      Chờ trả lời
                                    </span>
                                  ) : (
                                    <span className="px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 text-[9px] font-bold">
                                      Đã trả lời
                                    </span>
                                  )}
                                </div>
                                <p className="text-[11px] text-slate-400 truncate max-w-[160px]">
                                  {th.lastMessage}
                                </p>
                              </div>
                            </div>
                            <span className="text-[10px] text-slate-500 shrink-0">{th.lastTime}</span>
                          </div>
                        ))
                      )}
                    </div>
                  ) : (
                    <div className="space-y-1.5">
                      <div className="text-[11px] text-cyan-400 font-bold flex items-center gap-1">
                        <ShieldCheck className="w-3.5 h-3.5" />
                        <span>Kênh hỗ trợ chính thức:</span>
                      </div>
                      <div
                        onClick={() => {
                          setActiveDirectUser(ADMIN_CONTACT);
                          setActiveTab('direct');
                        }}
                        className="p-3 rounded-2xl bg-gradient-to-r from-purple-950/50 via-slate-900 to-cyan-950/40 border border-cyan-500/40 hover:border-cyan-400 transition-all flex items-center justify-between cursor-pointer group shadow-md hover:scale-[1.01]"
                      >
                        <div className="flex items-center gap-2.5">
                          <div className="relative shrink-0">
                            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-purple-500 via-indigo-500 to-cyan-400 p-0.5 shadow">
                              <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center font-bold text-sm text-cyan-300">
                                🛡️
                              </div>
                            </div>
                            <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-slate-950" />
                          </div>
                          <div>
                            <div className="flex items-center gap-1.5">
                              <h5 className="font-heading font-extrabold text-white text-xs group-hover:text-cyan-300 transition-colors">
                                Admin Tường Tận TOEIC
                              </h5>
                              <span className="px-1.5 py-0.2 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-[9px] font-mono font-bold">
                                ADMIN ✓
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-300 truncate max-w-[170px]">
                              {directConversations[ADMIN_CONTACT.name]?.[directConversations[ADMIN_CONTACT.name]?.length - 1]?.text || 'Nhắn tin hỗ trợ & giải đáp thắc mắc...'}
                            </p>
                          </div>
                        </div>
                        <span className="text-[11px] text-cyan-400 font-bold group-hover:underline shrink-0">
                          Chat ngay
                        </span>
                      </div>
                    </div>
                  )}

                  <div className="text-[11px] text-slate-400 font-medium pt-1">Hội thoại bạn bè:</div>
                  {friendEntries.length === 0 ? (
                    <div className="py-12 text-center text-slate-500 space-y-2 px-4">
                      <Users className="w-8 h-8 mx-auto opacity-40" />
                      <p className="text-xs font-bold text-slate-300">Chưa có tin nhắn bạn bè nào</p>
                      <p className="text-[11px] text-slate-400">Bạn cần kết bạn và được đối phương chấp nhận để bắt đầu trò chuyện riêng tư!</p>
                    </div>
                  ) : (
                    friendEntries.map(([userName, msgs]) => {
                      const lastMsg = msgs[msgs.length - 1];
                      return (
                        <div
                          key={userName}
                          onClick={() => {
                            setActiveDirectUser({ name: userName });
                            setActiveTab('direct');
                          }}
                          className="p-3 rounded-2xl bg-slate-900 border border-slate-800 hover:border-amber-500/40 transition-all flex items-center justify-between cursor-pointer group"
                        >
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-full bg-amber-500/20 text-amber-400 font-bold flex items-center justify-center">
                              {userName.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <h5 className="font-bold text-white text-xs group-hover:text-amber-400 transition-colors">
                                {userName}
                              </h5>
                              <p className="text-[11px] text-slate-400 truncate max-w-[180px]">
                                {lastMsg?.text || 'Bắt đầu trò chuyện...'}
                              </p>
                            </div>
                          </div>
                          <span className="text-[10px] text-slate-500">{lastMsg?.time || ''}</span>
                        </div>
                      );
                    })
                  )}
                </div>
              );
            })()}

            {/* 3. Single Direct 1-on-1 Chat */}
            {activeTab === 'direct' && activeDirectUser && (
              <>
                {activeDirectUser.isStudentThread ? (
                  <div className="p-2.5 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 text-[11px] text-center flex items-center justify-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-cyan-400 shrink-0" />
                    <span>Hòm thư học viên: <strong className="text-white">{activeDirectUser.name}</strong> ({activeDirectUser.email || 'Chưa có email'})</span>
                  </div>
                ) : activeDirectUser.isAdmin || activeDirectUser.name === ADMIN_CONTACT.name ? (
                  <div className="p-2.5 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 text-[11px] text-center flex items-center justify-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-cyan-400 shrink-0" />
                    <span>Bạn đang nhắn tin trực tiếp với <strong className="text-white">Admin Tường Tận TOEIC</strong> (Phản hồi trong ngày)</span>
                  </div>
                ) : (
                  <div className="p-2.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-[11px] text-center">
                    Đang trò chuyện riêng tư với <strong className="text-white">{activeDirectUser.name}</strong>
                  </div>
                )}

                {(directConversations[activeDirectUser.key || activeDirectUser.name || activeDirectUser.fullName] || []).map((msg, idx) => (
                  <div 
                    key={idx}
                    className={`flex flex-col ${msg.isMe ? 'items-end' : 'items-start'} space-y-1`}
                  >
                    {!msg.isMe && (
                      <div className="text-[10px] text-slate-400 pl-1">
                        <span className="font-bold text-slate-200">{msg.sender}</span> • {msg.time}
                      </div>
                    )}
                    <div 
                      className={`max-w-[82%] p-3 rounded-2xl leading-relaxed shadow-sm ${
                        msg.isMe
                          ? 'bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 font-bold rounded-br-none'
                          : 'bg-slate-900 border border-slate-800 text-slate-100 rounded-bl-none'
                      }`}
                    >
                      {msg.text}
                    </div>
                  </div>
                ))}
              </>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Prompts Carousel (Only in global tab) */}
          {activeTab === 'global' && (
            <div className="px-3 py-1.5 bg-slate-950/80 border-t border-slate-800/80 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
              {quickPrompts.map((prompt, i) => (
                <button
                  key={i}
                  onClick={() => setInputMessage(prompt)}
                  className="px-2.5 py-1 rounded-full bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:border-cyan-500/40 text-[10px] whitespace-nowrap transition-colors"
                >
                  {prompt}
                </button>
              ))}
            </div>
          )}

          {/* Input Footer */}
          {activeTab !== 'direct_list' && (
            <form 
              onSubmit={handleSendMessage}
              className="p-3 bg-slate-900 border-t border-slate-800 flex items-center gap-2"
            >
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder={
                  activeTab === 'global' 
                    ? 'Nhắn tin vào phòng chat...' 
                    : activeDirectUser?.isStudentThread
                      ? `Trả lời cho ${activeDirectUser.name}...`
                      : activeDirectUser?.isAdmin || activeDirectUser?.name === ADMIN_CONTACT.name
                        ? 'Nhắn cho Admin Tường Tận TOEIC...'
                        : `Nhắn cho ${activeDirectUser?.name || 'bạn học'}...`
                }
                className="flex-1 bg-slate-950 border border-slate-800 focus:border-cyan-500 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 outline-none transition-all"
              />

              <button
                type="submit"
                disabled={!inputMessage.trim()}
                className="p-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 disabled:opacity-30 text-slate-950 transition-all shadow-md shadow-cyan-500/20 active:scale-95 cursor-pointer"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          )}

        </div>
      )}
    </>
  );
}
