import { useEffect } from 'react';

export default function usePageTitle(title, description) {
  useEffect(() => {
    // 1. Update Document Title
    document.title = title ? `${title} - Tường Tận TOEIC` : 'Tường Tận TOEIC — Nền Tảng Luyện Thi TOEIC 4 Kỹ Năng Hàng Đầu';

    try {
      const cleanPath = window.location.pathname.replace(/\/+$/, '') || '/';
      const currentUrl = window.location.origin + cleanPath;

      // 2. Dynamic Canonical Tag
      let canonical = document.querySelector("link[rel='canonical']");
      if (!canonical) {
        canonical = document.createElement('link');
        canonical.setAttribute('rel', 'canonical');
        document.head.appendChild(canonical);
      }
      canonical.setAttribute('href', currentUrl);

      // 3. Dynamic OpenGraph & Twitter URL
      const ogUrl = document.querySelector("meta[property='og:url']");
      if (ogUrl) ogUrl.setAttribute('content', currentUrl);
      const twUrl = document.querySelector("meta[name='twitter:url']");
      if (twUrl) twUrl.setAttribute('content', currentUrl);

      // 4. Dynamic Meta Descriptions
      if (description) {
        const metaDesc = document.querySelector("meta[name='description']");
        if (metaDesc) metaDesc.setAttribute('content', description);
        const ogDesc = document.querySelector("meta[property='og:description']");
        if (ogDesc) ogDesc.setAttribute('content', description);
        const twDesc = document.querySelector("meta[name='twitter:description']");
        if (twDesc) twDesc.setAttribute('content', description);
      }
    } catch (e) {
      // Silently ignore DOM manipulation errors if any
    }
  }, [title, description]);
}
