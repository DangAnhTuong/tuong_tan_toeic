import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { 
  X, 
  Smartphone, 
  Download, 
  Share, 
  PlusSquare, 
  CheckCircle2, 
  Zap, 
  Sparkles,
  ShieldCheck,
  ChevronRight
} from 'lucide-react';

export default function InstallAppModal({ isOpen, onClose }) {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [installedSuccess, setInstalledSuccess] = useState(false);

  useEffect(() => {
    // Detect iOS
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(userAgent);
    setIsIOS(isIosDevice);

    // Detect if already installed in Standalone mode
    const isInStandaloneMode = 
      window.matchMedia('(display-mode: standalone)').matches || 
      window.navigator.standalone || 
      document.referrer.includes('android-app://');
    setIsStandalone(Boolean(isInStandaloneMode));

    // Capture Android/Desktop Chrome install prompt
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  if (!isOpen) return null;

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setInstalledSuccess(true);
        setDeferredPrompt(null);
      }
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 sm:p-6 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      {/* Backdrop click */}
      <div className="fixed inset-0" onClick={onClose} />

      {/* Modal Content */}
      <div className="relative w-full max-w-lg rounded-3xl dark:bg-[#0b1120] bg-white border dark:border-slate-800 border-slate-200 shadow-2xl overflow-hidden z-10 animate-scaleUp">
        
        {/* Decorative Top Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-32 bg-gradient-to-b from-cyan-500/20 via-sky-500/10 to-transparent blur-2xl pointer-events-none" />

        {/* Header */}
        <div className="relative p-6 pb-4 border-b dark:border-slate-800/80 border-slate-200 flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-cyan-500 to-sky-400 p-0.5 shadow-lg shadow-cyan-500/20 flex-shrink-0">
              <div className="w-full h-full dark:bg-[#0b1120] bg-white rounded-[14px] flex items-center justify-center">
                <Smartphone className="w-6 h-6 text-cyan-400" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-heading font-black text-lg dark:text-white text-slate-900">
                  Cài Đặt App Tường Tận TOEIC
                </h3>
                <span className="px-2 py-0.5 rounded-full bg-cyan-500/15 text-cyan-600 dark:text-cyan-300 font-mono font-bold text-[10px] border border-cyan-500/30">
                  PWA ⚡
                </span>
              </div>
              <p className="text-xs dark:text-slate-400 text-slate-500 mt-0.5">
                Học mượt mà toàn màn hình, không cần App Store / CH Play
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl dark:bg-slate-900 bg-slate-100 dark:text-slate-400 text-slate-600 hover:text-slate-900 dark:hover:text-white border dark:border-slate-800 border-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body Content */}
        <div className="p-6 space-y-5 max-h-[70vh] overflow-y-auto">

          {/* Already installed banner */}
          {isStandalone || installedSuccess ? (
            <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-500 dark:text-emerald-400 flex items-center gap-3">
              <CheckCircle2 className="w-6 h-6 shrink-0" />
              <div className="text-xs">
                <p className="font-bold">Ứng dụng đã được cài đặt trên thiết bị!</p>
                <p className="text-[11px] opacity-80 mt-0.5">Bạn đang trải nghiệm phiên bản độc lập (Standalone App) tốt nhất.</p>
              </div>
            </div>
          ) : null}

          {/* Feature highlights */}
          <div className="grid grid-cols-3 gap-2.5 text-center">
            <div className="p-3 rounded-2xl dark:bg-slate-900/60 bg-slate-50 border dark:border-slate-800/80 border-slate-200 space-y-1">
              <div className="w-7 h-7 mx-auto rounded-xl bg-cyan-500/15 text-cyan-400 flex items-center justify-center text-xs font-bold">
                📱
              </div>
              <p className="font-bold text-[11px] dark:text-slate-200 text-slate-800">Toàn màn hình</p>
              <p className="text-[9px] dark:text-slate-400 text-slate-500">Ẩn thanh URL duyệt web</p>
            </div>

            <div className="p-3 rounded-2xl dark:bg-slate-900/60 bg-slate-50 border dark:border-slate-800/80 border-slate-200 space-y-1">
              <div className="w-7 h-7 mx-auto rounded-xl bg-amber-500/15 text-amber-400 flex items-center justify-center text-xs font-bold">
                ⚡
              </div>
              <p className="font-bold text-[11px] dark:text-slate-200 text-slate-800">Siêu nhẹ & Nhanh</p>
              <p className="text-[9px] dark:text-slate-400 text-slate-500">Dưới 2MB, mở tức thì</p>
            </div>

            <div className="p-3 rounded-2xl dark:bg-slate-900/60 bg-slate-50 border dark:border-slate-800/80 border-slate-200 space-y-1">
              <div className="w-7 h-7 mx-auto rounded-xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center text-xs font-bold">
                🔄
              </div>
              <p className="font-bold text-[11px] dark:text-slate-200 text-slate-800">Auto Update</p>
              <p className="text-[9px] dark:text-slate-400 text-slate-500">Tự cập nhật câu hỏi mới</p>
            </div>
          </div>

          {/* iOS Instructions */}
          {isIOS ? (
            <div className="p-4 rounded-2xl dark:bg-slate-900/90 bg-slate-50 border dark:border-slate-800 border-slate-200 space-y-3">
              <div className="flex items-center gap-2 text-xs font-extrabold text-sky-500">
                <span>🍎 Hướng Dẫn Cài Đặt Trên iPhone / iPad (Safari):</span>
              </div>

              <div className="space-y-2.5 text-xs">
                <div className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-sky-500/20 text-sky-400 font-bold flex items-center justify-center shrink-0 text-[11px] mt-0.5">
                    1
                  </span>
                  <div className="dark:text-slate-300 text-slate-700 leading-relaxed">
                    Nhấn nút <strong className="dark:text-white text-slate-900 inline-flex items-center gap-1 font-extrabold px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-800"><Share className="w-3 h-3 text-sky-500" /> Chia sẻ (Share)</strong> ở thanh dưới cùng của trình duyệt Safari.
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-sky-500/20 text-sky-400 font-bold flex items-center justify-center shrink-0 text-[11px] mt-0.5">
                    2
                  </span>
                  <div className="dark:text-slate-300 text-slate-700 leading-relaxed">
                    Cuộn xuống menu và chọn <strong className="dark:text-white text-slate-900 inline-flex items-center gap-1 font-extrabold px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-800"><PlusSquare className="w-3 h-3 text-emerald-500" /> "Thêm vào MH chính" (Add to Home Screen)</strong>.
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-sky-500/20 text-sky-400 font-bold flex items-center justify-center shrink-0 text-[11px] mt-0.5">
                    3
                  </span>
                  <div className="dark:text-slate-300 text-slate-700 leading-relaxed">
                    Nhấn <strong className="text-cyan-400 font-black">"Thêm" (Add)</strong> ở góc phải trên màn hình. Biểu tượng app sẽ xuất hiện ngay trên màn hình chính của iPhone!
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* Android / Chrome Instructions or 1-Click Install */
            <div className="p-4 rounded-2xl dark:bg-slate-900/90 bg-slate-50 border dark:border-slate-800 border-slate-200 space-y-3">
              <div className="flex items-center gap-2 text-xs font-extrabold text-emerald-500">
                <span>🤖 Cài Đặt Trên Android (Google Chrome):</span>
              </div>

              {deferredPrompt ? (
                <div className="space-y-3">
                  <p className="text-xs dark:text-slate-300 text-slate-700 leading-relaxed">
                    Trình duyệt của bạn đã sẵn sàng cài đặt ứng dụng Tường Tận TOEIC với 1 chạm duy nhất:
                  </p>
                  <button
                    onClick={handleInstallClick}
                    className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-cyan-500 via-sky-500 to-teal-400 text-slate-950 font-heading font-black text-sm flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/25 active:scale-95 transition-all cursor-pointer"
                  >
                    <Download className="w-4 h-4 stroke-[2.5]" />
                    <span>CÀI ĐẶT NGAY VÀO ĐIỆN THOẠI (1 CHẠM)</span>
                  </button>
                </div>
              ) : (
                <div className="space-y-2.5 text-xs">
                  <div className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 font-bold flex items-center justify-center shrink-0 text-[11px] mt-0.5">
                      1
                    </span>
                    <div className="dark:text-slate-300 text-slate-700 leading-relaxed">
                      Nhấn vào biểu tượng <strong className="dark:text-white text-slate-900 font-extrabold">Ba chấm (⋮)</strong> ở góc phải trên cùng của Google Chrome.
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 font-bold flex items-center justify-center shrink-0 text-[11px] mt-0.5">
                      2
                    </span>
                    <div className="dark:text-slate-300 text-slate-700 leading-relaxed">
                      Chọn <strong className="dark:text-white text-slate-900 font-extrabold px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-800">"Cài đặt ứng dụng" (Install app)</strong> hoặc <strong className="dark:text-white text-slate-900 font-extrabold px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-800">"Thêm vào Màn hình chính"</strong>.
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 font-bold flex items-center justify-center shrink-0 text-[11px] mt-0.5">
                      3
                    </span>
                    <div className="dark:text-slate-300 text-slate-700 leading-relaxed">
                      Xác nhận <strong className="text-emerald-400 font-bold">"Cài đặt"</strong>. Ứng dụng sẽ xuất hiện trên màn hình điện thoại như một ứng dụng tải từ Google Play!
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Privacy & Safe Notice */}
          <div className="flex items-center gap-2 text-[11px] dark:text-slate-400 text-slate-500 bg-slate-100/50 dark:bg-slate-900/40 p-3 rounded-xl border dark:border-slate-800/50 border-slate-200">
            <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
            <span>Được bảo vệ bởi giao thức HTTPS an toàn, dữ liệu học tập tự động đồng bộ trên mọi thiết bị.</span>
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 border-t dark:border-slate-800/80 border-slate-200 flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl dark:bg-slate-900 bg-slate-100 hover:bg-slate-200 dark:hover:bg-slate-800 text-xs font-bold dark:text-slate-300 text-slate-700 border dark:border-slate-800 border-slate-200 transition-colors"
          >
            Đóng
          </button>
        </div>

      </div>
    </div>,
    document.body
  );
}
