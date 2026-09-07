import React from 'react';
import { Download } from 'lucide-react';

export interface DownloadCardProps {
  title: string;
  size?: string;
  url?: string;
  description?: string;
}

export const DownloadCard: React.FC<DownloadCardProps> = ({
  title,
  size,
  url = '#',
  description,
}) => {
  const isSafeUrl = (targetUrl?: string): boolean => {
    if (!targetUrl || targetUrl === '#') return false;
    return /^(https?:\/\/|\/|mailto:|tel:)/i.test(targetUrl.trim());
  };

  const safeUrl = isSafeUrl(url) ? url : '#';
  const isExternal = safeUrl.startsWith('http');
  const canDownload = !isExternal && safeUrl !== '#';

  return (
    <a
      href={safeUrl}
      target={isExternal ? '_blank' : undefined}
      rel={isExternal ? 'noopener noreferrer' : undefined}
      download={canDownload ? true : undefined}
      className="download-card group not-prose my-5 p-4 sm:p-4.5 rounded-2xl border border-zinc-200 dark:border-[rgba(255,255,255,0.12)] bg-white dark:bg-[#18191e] shadow-sm hover:shadow-md hover:border-blue-300 dark:hover:border-blue-800/80 transition-all flex items-start gap-4 cursor-pointer no-underline block print:my-2.5 print:p-3 print:bg-[#f8fafc] print:border print:border-[#cbd5e1] print:shadow-none print:break-inside-avoid"
    >
      {/* Left: Download Icon Box with Size placed directly below it */}
      <div className="flex flex-col items-center shrink-0 min-w-[52px] print:min-w-[44px]">
        <div className="w-11 h-11 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-[#1976d2] dark:text-[#90caf9] border border-blue-100 dark:border-blue-900/50 flex items-center justify-center group-hover:bg-[#1976d2] group-hover:text-white transition-colors print:w-9 print:h-9 print:bg-[#eff6ff] print:border-[#bfdbfe] print:text-[#1976d2]">
          <Download className="w-5 h-5 print:w-4 print:h-4" />
        </div>
        {size && (
          <span className="font-mono text-[11px] font-medium text-zinc-500 dark:text-zinc-400 mt-1.5 text-center whitespace-nowrap print:text-zinc-600 print:text-[9px] print:mt-1">
            {size}
          </span>
        )}
      </div>

      {/* Right Content: Title & Max 2-line Description */}
      <div className="min-w-0 flex-1">
        {/* Title */}
        <h4 className="text-sm sm:text-base font-bold text-zinc-900 dark:text-zinc-100 tracking-tight group-hover:text-[#1976d2] dark:group-hover:text-[#90caf9] transition-colors m-0 line-clamp-1 print:text-[#0f172a] print:text-xs">
          {title}
        </h4>

        {/* Description strictly capped at max 2 lines */}
        {description && (
          <p
            className="text-xs text-zinc-600 dark:text-zinc-400 mt-1.5 m-0 line-clamp-2 overflow-hidden text-ellipsis leading-relaxed print:text-zinc-700 print:text-[10px] print:mt-1"
            style={{
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
            }}
          >
            {description}
          </p>
        )}
      </div>
    </a>
  );
};
