import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Sparkles, 
  ExternalLink, 
  BookOpen, 
  Headphones, 
  FileText, 
  CheckCircle2, 
  Info, 
  Flame 
} from 'lucide-react';

function inlineFormat(text) {
  if (!text) return '';
  // bold **text**
  let formatted = text.replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold text-white">$1</strong>');
  // italic *text*
  formatted = formatted.replace(/\*(.*?)\*/g, '<em class="italic text-slate-300">$1</em>');
  // code `text`
  formatted = formatted.replace(/`([^`]+)`/g, '<code class="px-1.5 py-0.5 rounded bg-slate-800 text-cyan-300 font-mono text-[12px] border border-slate-700/60">$1</code>');
  return formatted;
}

export default function BlogMarkdownRenderer({ content }) {
  if (!content) return null;

  const lines = content.split('\n');
  const elements = [];
  let i = 0;
  let keyIdx = 0;

  while (i < lines.length) {
    const line = lines[i];
    const trimmed = line.trim();

    // 1. Empty lines
    if (!trimmed) {
      i++;
      continue;
    }

    // 2. Blockquote / Callout (> ...)
    if (trimmed.startsWith('>')) {
      let quoteLines = [];
      while (i < lines.length && lines[i].trim().startsWith('>')) {
        quoteLines.push(lines[i].trim().replace(/^>\s*/, ''));
        i++;
      }
      const quoteText = quoteLines.join(' ');

      // Check if it has an internal link to Tường Tận TOEIC features
      const isFeatureCallout = quoteText.includes('/listen') || quoteText.includes('/vocabulary') || quoteText.includes('/tests') || quoteText.includes('/read');

      elements.push(
        <div 
          key={keyIdx++} 
          className={`my-5 p-4 sm:p-5 rounded-2xl border transition-all ${
            isFeatureCallout 
              ? 'bg-gradient-to-r from-cyan-950/40 via-slate-900/90 to-blue-950/40 border-cyan-500/40 shadow-lg shadow-cyan-500/10' 
              : 'bg-slate-900/70 border-slate-800 text-slate-300'
          }`}
        >
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 shrink-0 mt-0.5">
              {isFeatureCallout ? <Sparkles className="w-5 h-5" /> : <Info className="w-5 h-5" />}
            </div>
            <div className="text-xs sm:text-sm text-slate-200 leading-relaxed space-y-2">
              <span dangerouslySetInnerHTML={{ __html: inlineFormat(quoteText) }} />
              {isFeatureCallout && (
                <div className="pt-2 flex flex-wrap gap-2">
                  {quoteText.includes('/listen/dictation') && (
                    <Link
                      to="/listen/dictation"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-cyan-500 to-teal-500 text-slate-950 font-bold text-xs hover:scale-105 transition-all shadow"
                    >
                      <Headphones className="w-3.5 h-3.5" />
                      <span>Vào Phòng Nghe Chép Chính Tả</span>
                    </Link>
                  )}
                  {quoteText.includes('/vocabulary') && (
                    <Link
                      to="/vocabulary"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 font-bold text-xs hover:scale-105 transition-all shadow"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Học 84 Chủ Đề Từ Vựng SM-2</span>
                    </Link>
                  )}
                  {quoteText.includes('/tests') && (
                    <Link
                      to="/tests"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-500 text-white font-bold text-xs hover:scale-105 transition-all shadow"
                    >
                      <FileText className="w-3.5 h-3.5" />
                      <span>Thi Thử 10 Bộ Đề ETS 2026</span>
                    </Link>
                  )}
                  {quoteText.includes('/read') && (
                    <Link
                      to="/read"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-bold text-xs hover:scale-105 transition-all shadow"
                    >
                      <BookOpen className="w-3.5 h-3.5" />
                      <span>Luyện 13.622 Câu Hỏi Reading</span>
                    </Link>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      );
      continue;
    }

    // 3. Headings
    if (trimmed.startsWith('# ')) {
      elements.push(
        <h1 key={keyIdx++} className="text-2xl sm:text-3xl font-heading font-black text-white mt-8 mb-4 tracking-tight">
          {trimmed.slice(2)}
        </h1>
      );
      i++;
      continue;
    }

    if (trimmed.startsWith('## ')) {
      elements.push(
        <h2 key={keyIdx++} className="text-xl sm:text-2xl font-heading font-extrabold text-white mt-7 mb-3 border-b border-slate-800/80 pb-2 flex items-center gap-2">
          <span className="w-2 h-6 rounded-full bg-gradient-to-b from-cyan-400 to-teal-500 shrink-0" />
          <span>{trimmed.slice(3)}</span>
        </h2>
      );
      i++;
      continue;
    }

    if (trimmed.startsWith('### ')) {
      elements.push(
        <h3 key={keyIdx++} className="text-lg sm:text-xl font-heading font-bold text-cyan-300 mt-5 mb-2">
          {trimmed.slice(4)}
        </h3>
      );
      i++;
      continue;
    }

    if (trimmed.startsWith('#### ')) {
      elements.push(
        <h4 key={keyIdx++} className="text-base sm:text-lg font-heading font-semibold text-slate-200 mt-4 mb-2">
          {trimmed.slice(5)}
        </h4>
      );
      i++;
      continue;
    }

    // 4. Unordered Lists (- or *)
    if (/^[\-\*]\s+/.test(trimmed)) {
      const listItems = [];
      while (i < lines.length && /^[\-\*]\s+/.test(lines[i].trim())) {
        listItems.push(lines[i].trim().replace(/^[\-\*]\s+/, ''));
        i++;
      }
      elements.push(
        <ul key={keyIdx++} className="my-3 space-y-2 pl-2">
          {listItems.map((item, idx) => (
            <li key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-300 leading-relaxed">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 shrink-0 mt-2" />
              <span dangerouslySetInnerHTML={{ __html: inlineFormat(item) }} />
            </li>
          ))}
        </ul>
      );
      continue;
    }

    // 5. Numbered Lists (1. 2.)
    if (/^\d+\.\s+/.test(trimmed)) {
      const listItems = [];
      while (i < lines.length && /^\d+\.\s+/.test(lines[i].trim())) {
        const itemText = lines[i].trim().replace(/^\d+\.\s+/, '');
        listItems.push(itemText);
        i++;
      }
      elements.push(
        <ol key={keyIdx++} className="my-3 space-y-2.5 pl-1">
          {listItems.map((item, idx) => (
            <li key={idx} className="flex items-start gap-3 text-xs sm:text-sm text-slate-300 leading-relaxed">
              <span className="w-5 h-5 rounded-full bg-slate-800 text-cyan-400 font-mono text-[11px] font-bold flex items-center justify-center shrink-0 mt-0.5 border border-slate-700">
                {idx + 1}
              </span>
              <span dangerouslySetInnerHTML={{ __html: inlineFormat(item) }} />
            </li>
          ))}
        </ol>
      );
      continue;
    }

    // 6. Normal Paragraph
    elements.push(
      <p key={keyIdx++} className="text-xs sm:text-sm text-slate-300 leading-relaxed my-3">
        <span dangerouslySetInnerHTML={{ __html: inlineFormat(trimmed) }} />
      </p>
    );
    i++;
  }

  return (
    <div className="prose prose-invert max-w-none space-y-1">
      {elements}
    </div>
  );
}
