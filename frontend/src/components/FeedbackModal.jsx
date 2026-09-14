import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import axios from 'axios';
import { 
  Lightbulb, 
  X, 
  Send, 
  Image as ImageIcon, 
  Paperclip, 
  Link as LinkIcon, 
  FolderClock, 
  Sparkles, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Check, 
  Plus, 
  Trash2, 
  Loader2,
  ExternalLink,
  MessageSquare
} from 'lucide-react';
import { getStoredUser } from '../utils/auth';

export default function FeedbackModal({ isOpen, onClose, initialTab = 'new' }) {
  if (!isOpen) return null;

  const [activeTab, setActiveTab] = useState(initialTab); // 'new' | 'mine'
  const [content, setContent] = useState('');
  const [attachments, setAttachments] = useState([]);
  const [showLinkInput, setShowLinkInput] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');
  const [linkName, setLinkName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // My feedbacks state
  const [myFeedbacks, setMyFeedbacks] = useState([]);
  const [isLoadingFeedbacks, setIsLoadingFeedbacks] = useState(false);

  const fileInputRef = useRef(null);
  const imageInputRef = useRef(null);
  const storedUser = getStoredUser();

  // Fetch my feedbacks when opening or switching to 'mine' tab
  const fetchMyFeedbacks = async () => {
    setIsLoadingFeedbacks(true);
    try {
      const email = storedUser?.email || localStorage.getItem('guest_feedback_email');
      const res = await axios.get('/api/v1/feedback/my-feedbacks', {
        params: { email }
      });
      if (res.data?.data) {
        setMyFeedbacks(res.data.data);
      }
    } catch (err) {
      console.error('Error fetching feedbacks:', err);
    } finally {
      setIsLoadingFeedbacks(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchMyFeedbacks();
    }
  }, [isOpen]);

  useEffect(() => {
    if (activeTab === 'mine') {
      fetchMyFeedbacks();
    }
  }, [activeTab]);

  // Handle local file uploads (converted to base64 or simulated URLs)
  const handleFileUpload = (e, type) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    if (attachments.length + files.length > 5) {
      setErrorMessage('Tối đa 5 đính kèm cho mỗi đề xuất.');
      return;
    }

    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = () => {
        setAttachments(prev => [
          ...prev,
          {
            type: type === 'image' ? 'image' : 'file',
            name: file.name,
            url: reader.result,
            size: file.size
          }
        ].slice(0, 5));
      };
      reader.readAsDataURL(file);
    });

    e.target.value = '';
  };

  const getSafeUrl = (url) => {
    if (!url || typeof url !== 'string') return '#';
    const clean = url.trim();
    if (/^https?:\/\//i.test(clean) || /^data:image\/(png|jpe?g|gif|webp|bmp);base64,/i.test(clean)) {
      return clean;
    }
    return '#';
  };

  const handleAddLink = () => {
    if (!linkUrl.trim()) return;
    let formattedUrl = linkUrl.trim();
    
    // Security check: strictly reject javascript:, vbscript:, data:
    if (/^(javascript|vbscript|data):/i.test(formattedUrl)) {
      setErrorMessage('Chỉ chấp nhận liên kết web an toàn (http:// hoặc https://).');
      return;
    }

    if (!/^https?:\/\//i.test(formattedUrl)) {
      formattedUrl = 'https://' + formattedUrl;
    }

    if (attachments.length >= 5) {
      setErrorMessage('Tối đa 5 đính kèm cho mỗi đề xuất.');
      return;
    }

    setAttachments(prev => [
      ...prev,
      {
        type: 'link',
        name: linkName.trim() || formattedUrl,
        url: formattedUrl
      }
    ]);

    setLinkUrl('');
    setLinkName('');
    setShowLinkInput(false);
  };

  const handleRemoveAttachment = (idx) => {
    setAttachments(prev => prev.filter((_, i) => i !== idx));
  };

  const handleSubmit = async () => {
    if (content.trim().length < 10) {
      setErrorMessage('Vui lòng nhập tối thiểu 10 ký tự để chia sẻ ý tưởng rõ ràng.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage('');

    try {
      const res = await axios.post('/api/v1/feedback', {
        content: content.trim(),
        category: 'feature',
        attachments,
        userEmail: storedUser?.email,
        userName: storedUser?.name || storedUser?.fullName
      });

      if (res.data?.success) {
        setSubmitSuccess(true);
        setContent('');
        setAttachments([]);
        fetchMyFeedbacks();
        setTimeout(() => {
          setSubmitSuccess(false);
          setActiveTab('mine');
        }, 1200);
      }
    } catch (err) {
      setErrorMessage(err.response?.data?.message || 'Có lỗi xảy ra khi gửi đề xuất. Vui lòng thử lại!');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'done':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
            <CheckCircle2 className="w-3 h-3" /> Đã hoàn thành
          </span>
        );
      case 'accepted':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-cyan-500/15 text-cyan-400 border border-cyan-500/30">
            <Sparkles className="w-3 h-3" /> Đã tiếp nhận & lên kế hoạch
          </span>
        );
      case 'reviewing':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-sky-500/15 text-sky-400 border border-sky-500/30">
            <Clock className="w-3 h-3" /> Đang xem xét kỹ
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-500/15 text-amber-400 border border-amber-500/30">
            <Clock className="w-3 h-3" /> Đang chờ duyệt
          </span>
        );
    }
  };

  return createPortal(
    <div 
      onClick={onClose}
      className="fixed inset-0 z-[99999] flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto animate-fadeIn"
    >
      <div 
        className="relative w-full max-w-xl bg-[#0b1329] border border-slate-700/80 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] my-auto animate-scaleUp text-slate-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* MODAL HEADER WITH GRADIENT (Matching screenshot) */}
        <div className="relative px-6 py-5 bg-gradient-to-r from-cyan-500 via-sky-500 to-blue-600 text-white shadow-md">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white/80 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center shadow-inner shrink-0">
              <Lightbulb className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg sm:text-xl font-heading font-extrabold tracking-tight">
                Đề xuất & Góp ý
              </h3>
              <p className="text-xs sm:text-sm text-white/90 leading-tight">
                Chia sẻ ý tưởng của bạn — mỗi phản hồi giúp Tường Tận TOEIC tốt hơn mỗi ngày.
              </p>
            </div>
          </div>
        </div>

        {/* TAB SWITCHER */}
        <div className="flex border-b border-slate-800 bg-slate-900/60 shrink-0">
          <button
            onClick={() => setActiveTab('new')}
            className={`flex-1 py-3 px-4 flex items-center justify-center gap-2 text-xs sm:text-sm font-bold border-b-2 transition-all ${
              activeTab === 'new'
                ? 'border-cyan-400 text-cyan-400 bg-cyan-500/5'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>Đề xuất mới</span>
          </button>

          <button
            onClick={() => setActiveTab('mine')}
            className={`flex-1 py-3 px-4 flex items-center justify-center gap-2 text-xs sm:text-sm font-bold border-b-2 transition-all ${
              activeTab === 'mine'
                ? 'border-cyan-400 text-cyan-400 bg-cyan-500/5'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
            }`}
          >
            <FolderClock className="w-4 h-4" />
            <span>Đề xuất của tôi</span>
            {myFeedbacks.length > 0 && (
              <span className="ml-1 px-1.5 py-0.2 rounded-full bg-cyan-500/20 text-cyan-300 font-mono text-[10px]">
                {myFeedbacks.length}
              </span>
            )}
          </button>
        </div>

        {/* TAB CONTENT BODY */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4">
          
          {activeTab === 'new' && (
            <div className="space-y-4">
              {submitSuccess ? (
                <div className="py-12 text-center space-y-3">
                  <div className="w-14 h-14 mx-auto rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center animate-bounce">
                    <Check className="w-8 h-8" />
                  </div>
                  <h4 className="font-heading font-extrabold text-lg text-white">Gửi đề xuất thành công!</h4>
                  <p className="text-xs text-slate-400 max-w-sm mx-auto">
                    Cảm ơn bạn! Đội ngũ Admin Tường Tận TOEIC sẽ nghiên cứu kỹ và phản hồi sớm nhất.
                  </p>
                </div>
              ) : (
                <>
                  {/* TEXTAREA INPUT */}
                  <div className="relative">
                    <textarea
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                      maxLength={2000}
                      rows={6}
                      placeholder="Bạn muốn Tường Tận TOEIC cải thiện điều gì? Ví dụ: thêm tính năng ôn từ vựng theo topic, sửa lỗi phần Nghe Part 3, giao diện tối..."
                      className="w-full p-4 rounded-2xl bg-slate-900/90 border border-slate-800 focus:border-cyan-500/80 focus:ring-2 focus:ring-cyan-500/20 text-xs sm:text-sm text-slate-100 placeholder-slate-500 resize-none transition-all outline-none leading-relaxed"
                    />
                  </div>

                  {/* ATTACHMENT ACTION BAR */}
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={() => imageInputRef.current?.click()}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700/60 text-xs text-slate-300 hover:text-white transition-colors"
                    >
                      <ImageIcon className="w-3.5 h-3.5 text-cyan-400" />
                      <span>Ảnh</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700/60 text-xs text-slate-300 hover:text-white transition-colors"
                    >
                      <Paperclip className="w-3.5 h-3.5 text-sky-400" />
                      <span>Tệp</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setShowLinkInput(!showLinkInput)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700/60 text-xs text-slate-300 hover:text-white transition-colors"
                    >
                      <LinkIcon className="w-3.5 h-3.5 text-amber-400" />
                      <span>Liên kết</span>
                    </button>

                    {/* Hidden inputs */}
                    <input
                      ref={imageInputRef}
                      type="file"
                      accept="image/*"
                      multiple
                      className="hidden"
                      onChange={(e) => handleFileUpload(e, 'image')}
                    />
                    <input
                      ref={fileInputRef}
                      type="file"
                      multiple
                      className="hidden"
                      onChange={(e) => handleFileUpload(e, 'file')}
                    />
                  </div>

                  {/* LINK INPUT BOX */}
                  {showLinkInput && (
                    <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 space-y-2 animate-fadeIn">
                      <div className="flex gap-2">
                        <input
                          type="text"
                          placeholder="Nhập URL (ví dụ: https://...)"
                          value={linkUrl}
                          onChange={(e) => setLinkUrl(e.target.value)}
                          className="flex-1 px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-xs text-slate-200 outline-none focus:border-cyan-500"
                        />
                        <input
                          type="text"
                          placeholder="Tiêu đề link (tuỳ chọn)"
                          value={linkName}
                          onChange={(e) => setLinkName(e.target.value)}
                          className="w-1/3 px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-xs text-slate-200 outline-none focus:border-cyan-500"
                        />
                        <button
                          type="button"
                          onClick={handleAddLink}
                          className="px-3 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold transition-colors"
                        >
                          Thêm
                        </button>
                      </div>
                    </div>
                  )}

                  {/* ATTACHMENT LIST */}
                  {attachments.length > 0 && (
                    <div className="space-y-1.5 pt-1">
                      <div className="text-[11px] text-slate-400 font-medium">Đính kèm ({attachments.length}/5):</div>
                      <div className="flex flex-wrap gap-2">
                        {attachments.map((att, i) => (
                          <div 
                            key={i}
                            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-800/80 border border-slate-700 text-[11px] text-slate-200"
                          >
                            {att.type === 'image' ? (
                              <ImageIcon className="w-3 h-3 text-cyan-400" />
                            ) : att.type === 'link' ? (
                              <LinkIcon className="w-3 h-3 text-amber-400" />
                            ) : (
                              <Paperclip className="w-3 h-3 text-sky-400" />
                            )}
                            <span className="truncate max-w-[150px]">{att.name}</span>
                            <button
                              type="button"
                              onClick={() => handleRemoveAttachment(i)}
                              className="text-slate-400 hover:text-rose-400 ml-1"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* ERROR MESSAGE */}
                  {errorMessage && (
                    <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>{errorMessage}</span>
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {activeTab === 'mine' && (
            <div className="space-y-3">
              {isLoadingFeedbacks ? (
                <div className="py-12 flex flex-col items-center justify-center gap-2 text-slate-400">
                  <Loader2 className="w-6 h-6 animate-spin text-cyan-400" />
                  <span className="text-xs">Đang tải danh sách đề xuất...</span>
                </div>
              ) : myFeedbacks.length === 0 ? (
                <div className="py-12 text-center text-slate-400 space-y-2">
                  <FolderClock className="w-10 h-10 mx-auto opacity-40 text-slate-500" />
                  <p className="text-xs sm:text-sm font-semibold text-slate-300">
                    Bạn chưa có đề xuất nào
                  </p>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto">
                    Mọi ý kiến đóng góp của bạn đều giúp Tường Tận TOEIC nâng cấp nền tảng tốt hơn mỗi ngày!
                  </p>
                </div>
              ) : (
                myFeedbacks.map((item) => (
                  <div 
                    key={item._id}
                    className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2.5 hover:border-slate-700 transition-all"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[11px] text-slate-400 font-mono">
                        {new Date(item.created_at).toLocaleDateString('vi-VN', {
                          year: 'numeric',
                          month: '2-digit',
                          day: '2-digit',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                      {getStatusBadge(item.status)}
                    </div>

                    <p className="text-xs sm:text-sm text-slate-200 whitespace-pre-wrap leading-relaxed">
                      {item.content}
                    </p>

                    {item.attachments && item.attachments.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {item.attachments.map((att, i) => {
                          const safeHref = getSafeUrl(att.url);
                          return (
                            <a
                              key={i}
                              href={safeHref}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={(e) => { if (safeHref === '#') e.preventDefault(); }}
                              className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-800 text-[10px] text-cyan-300 hover:text-cyan-200 hover:underline border border-slate-700"
                            >
                              <ExternalLink className="w-2.5 h-2.5" />
                              <span className="truncate max-w-[120px]">{att.name}</span>
                            </a>
                          );
                        })}
                      </div>
                    )}

                    {/* ADMIN REPLY CALLOUT */}
                    {item.adminReply?.text && (
                      <div className="mt-2.5 p-3 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-xs space-y-1">
                        <div className="flex items-center gap-2 text-cyan-400 font-bold text-[11px]">
                          <MessageSquare className="w-3.5 h-3.5" />
                          <span>Phản hồi từ {item.adminReply.adminName || 'Admin Tường Tận TOEIC'}</span>
                        </div>
                        <p className="text-slate-200 text-xs leading-relaxed">
                          {item.adminReply.text}
                        </p>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {/* MODAL FOOTER (Matching screenshot) */}
        {activeTab === 'new' && !submitSuccess && (
          <div className="flex items-center justify-between gap-3 border-t border-slate-800 bg-slate-900/80 px-6 py-3.5 shrink-0">
            <div className="text-[11px] sm:text-xs text-slate-400 font-mono">
              <span>{content.trim().length}/2000 ký tự</span>
              <span className="mx-1.5">•</span>
              <span>{attachments.length}/5 đính kèm</span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                className="px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                Huỷ
              </button>

              <button
                type="button"
                onClick={handleSubmit}
                disabled={isSubmitting || content.trim().length < 10}
                className={`flex items-center gap-1.5 px-5 py-2 rounded-xl text-xs sm:text-sm font-bold shadow-lg transition-all ${
                  content.trim().length >= 10 && !isSubmitting
                    ? 'bg-gradient-to-r from-cyan-500 via-sky-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white shadow-cyan-500/25 hover:scale-105 active:scale-95'
                    : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700/50'
                }`}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Đang gửi...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Gửi đề xuất</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>,
    document.body
  );
}
