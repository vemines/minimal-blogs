import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import rehypeSanitize from 'rehype-sanitize';
import { customSanitizeSchema } from './sanitizeSchema';
import { VideoPlayer } from './VideoPlayer';
import { isVideoUrl } from './videoUtils';
import { R2_PUBLIC_URL, getEffectiveDataBaseUrl } from '../../services/api';

export interface TabItem {
  label: string;
  content: React.ReactNode;
}

export interface TabSwitcherProps {
  tabs: TabItem[];
  defaultTab?: number;
  onZoomImage?: (src: string, alt?: string) => void;
}

export const TabSwitcher: React.FC<TabSwitcherProps> = ({ tabs, defaultTab = 0, onZoomImage }) => {
  const [activeIdx, setActiveIdx] = useState<number>(
    defaultTab >= 0 && defaultTab < tabs.length ? defaultTab : 0
  );

  if (!tabs || tabs.length === 0) return null;

  const activeTab = tabs[activeIdx] || tabs[0];

  // Helper to normalize image URLs with R2 prefix if configured, otherwise keep relative
  const getFullImageUrl = (src?: string) => {
    if (!src) return '';
    if (src.startsWith('http://') || src.startsWith('https://') || src.startsWith('data:')) {
      return src;
    }
    if (!R2_PUBLIC_URL) {
      const base = getEffectiveDataBaseUrl();
      const cleanSrc = src.replace(/^\/+/, '');
      return base ? `${base}/${cleanSrc}` : (src.startsWith('/') ? src : `/${src}`);
    }
    const cleanR2 = R2_PUBLIC_URL.replace(/\/+$/, '');
    const cleanSrc = src.replace(/^\/+/, '');
    return `${cleanR2}/${cleanSrc}`;
  };

  return (
    <div className="not-prose my-6 w-full max-w-full min-w-0">
      {/* Tab Navigation Pill Bar */}
      <div className="flex items-center gap-1.5 p-1.5 rounded-xl bg-zinc-100 dark:bg-[#1f2128] border border-zinc-200/80 dark:border-[rgba(255,255,255,0.08)] overflow-x-auto w-fit max-w-full">
        {tabs.map((tab, idx) => {
          const isActive = idx === activeIdx;
          return (
            <button
              key={`tab-btn-${idx}`}
              type="button"
              onClick={() => setActiveIdx(idx)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors duration-150 cursor-pointer select-none flex items-center gap-1.5 border ${
                isActive
                  ? 'bg-white dark:bg-[#18191e] text-[#1976d2] dark:text-[#90caf9] shadow-xs border-zinc-200/80 dark:border-zinc-700/80'
                  : 'border-transparent text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 hover:bg-zinc-200/50 dark:hover:bg-zinc-800/40'
              }`}
            >
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab Content Box with natural text wrapping and multimedia rendering */}
      <div className="mt-2.5 p-4 sm:p-5 rounded-2xl border border-zinc-200 dark:border-[rgba(255,255,255,0.1)] bg-zinc-50/70 dark:bg-[#15161b] text-zinc-800 dark:text-zinc-200 text-xs sm:text-sm leading-relaxed w-full max-w-full min-w-0 break-words whitespace-normal print:bg-[#f8fafc] print:border print:border-[#cbd5e1] print:text-[#1e293b] print:p-3.5 print:my-2 print:shadow-none print:break-inside-avoid">
        <div key={`tab-panel-${activeIdx}`} className="tab-fade-in w-full min-w-0">
          {typeof activeTab.content === 'string' ? (
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              rehypePlugins={[rehypeRaw, [rehypeSanitize, customSanitizeSchema]]}
              components={{
                p({ children }) {
                  return <p className="my-2.5 first:mt-0 last:mb-0 break-words whitespace-normal leading-relaxed print:text-[#1e293b] print:my-1">{children}</p>;
                },
                img({ src, alt }) {
                  if (isVideoUrl(src)) {
                    return <VideoPlayer src={src} title={alt} />;
                  }
                  const fullSrc = getFullImageUrl(src);
                  return (
                    <span className="block my-4 text-center not-prose print:my-3 print:block">
                      <img
                        src={fullSrc}
                        alt={alt || ''}
                        onClick={() => onZoomImage?.(fullSrc, alt)}
                        className="mx-auto rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-md max-h-[450px] object-contain cursor-zoom-in hover:opacity-95 transition-opacity print:max-h-[300px] print:shadow-none print:border print:border-zinc-300 print:rounded-lg print:break-inside-avoid"
                        loading="lazy"
                        decoding="async"
                      />
                      {alt && (
                        <span className="block text-xs text-zinc-500 dark:text-zinc-400 mt-2 italic print:text-zinc-600 print:mt-1">
                          {alt}
                        </span>
                      )}
                    </span>
                  );
                },
                video({ src, poster, controls = true, autoPlay, loop, muted, className, ...props }: any) {
                  return (
                    <VideoPlayer
                      src={src}
                      poster={poster}
                      controls={controls}
                      autoPlay={autoPlay}
                      loop={loop}
                      muted={muted}
                      className={className}
                      {...props}
                    />
                  );
                },
                iframe({ src, title, className, ...props }: any) {
                  if (!src) return null;
                  return (
                    <div className={`not-prose my-4 aspect-video w-full rounded-2xl overflow-hidden border border-zinc-200 dark:border-[rgba(255,255,255,0.12)] shadow-md bg-black/90 print:hidden ${className || ''}`}>
                      <iframe
                        src={src}
                        title={title || 'Trình phát video'}
                        className="w-full h-full border-0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                        allowFullScreen
                        loading="lazy"
                        {...props}
                      />
                    </div>
                  );
                },
                a({ href, children, ...props }: any) {
                  if (href && isVideoUrl(href)) {
                    const linkText = typeof children === 'string' ? children.trim() : '';
                    if (!linkText || linkText === href || linkText.startsWith('http://') || linkText.startsWith('https://')) {
                      return <VideoPlayer src={href} />;
                    }
                  }
                  return (
                    <a
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#1976d2] dark:text-[#90caf9] hover:underline font-medium break-all"
                      {...props}
                    >
                      {children}
                    </a>
                  );
                },
                code({ className, children, ...props }: any) {
                  const match = /language-(\w+)/.exec(className || '');
                  const lang = match ? match[1].toLowerCase() : '';
                  const rawText = String(children || '').trim();

                  if (lang === 'video') {
                    const lines = rawText.split('\n');
                    const videoData: Record<string, string> = {};

                    if (
                      !rawText.includes('\n') &&
                      (rawText.startsWith('http://') ||
                        rawText.startsWith('https://') ||
                        rawText.startsWith('/') ||
                        isVideoUrl(rawText))
                    ) {
                      return <VideoPlayer src={rawText} />;
                    }

                    const knownKeys = ['url', 'src', 'title', 'poster', 'autoplay', 'loop', 'muted', 'controls', 'aspectratio'];
                    for (const line of lines) {
                      const trimmedLine = line.trim();
                      if (!trimmedLine) continue;

                      const colonIdx = trimmedLine.indexOf(':');
                      const possibleKey = colonIdx !== -1 ? trimmedLine.slice(0, colonIdx).trim().toLowerCase() : '';

                      if (knownKeys.includes(possibleKey)) {
                        videoData[possibleKey] = trimmedLine.slice(colonIdx + 1).trim();
                      } else if (
                        trimmedLine.startsWith('http://') ||
                        trimmedLine.startsWith('https://') ||
                        trimmedLine.startsWith('/') ||
                        isVideoUrl(trimmedLine)
                      ) {
                        if (!videoData.url && !videoData.src) {
                          videoData.src = trimmedLine;
                        }
                      }
                    }

                    return (
                      <VideoPlayer
                        src={videoData.url || videoData.src || rawText}
                        title={videoData.title}
                        poster={videoData.poster}
                        autoPlay={videoData.autoplay === 'true'}
                        loop={videoData.loop === 'true'}
                        muted={videoData.muted === 'true'}
                        controls={videoData.controls !== 'false'}
                      />
                    );
                  }

                  const isMultiLine = rawText.includes('\n');
                  if (isMultiLine) {
                    return (
                      <pre className="my-2.5 p-3 rounded-xl bg-zinc-900 text-emerald-400 font-mono text-xs overflow-x-auto max-w-full print:bg-[#f8f9fa] print:text-[#0f172a] print:border print:border-[#cbd5e1] print:p-2.5 print:my-1.5 print:break-inside-avoid">
                        <code>{children}</code>
                      </pre>
                    );
                  }
                  return (
                    <code className="px-1.5 py-0.5 rounded bg-zinc-200/60 dark:bg-zinc-800 text-emerald-700 dark:text-emerald-400 font-mono text-xs font-semibold break-all inline-block max-w-full overflow-x-auto align-middle print:bg-[#f1f5f9] print:text-[#0f172a] print:border print:border-[#cbd5e1]" {...props}>
                      {children}
                    </code>
                  );
                },
                pre({ node, children, ...props }: any) {
                  const codeChild = (node?.children?.[0] as any);
                  const className = codeChild?.properties?.className;
                  const cls = Array.isArray(className) ? className.join(' ') : String(className || '');
                  if (cls.includes('language-video')) {
                    return <>{children}</>;
                  }
                  return <div className="my-2 max-w-full overflow-x-auto print:my-1" {...props}>{children}</div>;
                },
                ol({ children }) {
                  return <ol className="list-decimal pl-5 my-2.5 space-y-2 break-words whitespace-normal print:my-1 print:space-y-1">{children}</ol>;
                },
                ul({ children }) {
                  return <ul className="list-disc pl-5 my-2.5 space-y-2 break-words whitespace-normal print:my-1 print:space-y-1">{children}</ul>;
                },
                li({ children }) {
                  return <li className="break-words whitespace-normal leading-relaxed print:text-[#1e293b]">{children}</li>;
                },
                kbd({ children }) {
                  return (
                    <kbd className="px-1.5 py-0.5 text-[11px] font-mono font-semibold bg-zinc-200 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded shadow-xs print:bg-[#f1f5f9] print:text-[#1e293b] print:border-[#cbd5e1] print:border-b-2 print:border-b-[#94a3b8] print:shadow-none">
                      {children}
                    </kbd>
                  );
                },
              }}
            >
              {activeTab.content}
            </ReactMarkdown>
          ) : (
            activeTab.content
          )}
        </div>
      </div>
    </div>
  );
};
