import React, { useState } from 'react';
import { Film, AlertCircle, ExternalLink } from 'lucide-react';
import { getFullMediaUrl, parseVideoSource } from './videoUtils';

export interface VideoPlayerProps {
  src?: string;
  url?: string;
  title?: string;
  poster?: string;
  autoPlay?: boolean;
  loop?: boolean;
  muted?: boolean;
  controls?: boolean;
  className?: string;
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({
  src,
  url,
  title,
  poster,
  autoPlay = false,
  loop = false,
  muted = false,
  controls = true,
  className = '',
}) => {
  const rawSource = (src || url || '').trim();
  const [hasError, setHasError] = useState<boolean>(false);

  if (!rawSource) return null;

  const parsed = parseVideoSource(rawSource);
  const resolvedPoster = poster ? getFullMediaUrl(poster) : undefined;

  return (
    <figure className={`not-prose my-6 group ${className}`}>
      {/* Video Viewport: 16:9 Aspect Ratio Container */}
      <div className="relative w-full aspect-video rounded-2xl overflow-hidden bg-black/90 dark:bg-black/95 border border-zinc-200 dark:border-[rgba(255,255,255,0.12)] shadow-md transition-shadow hover:shadow-lg print:hidden">
        {hasError ? (
          /* Error fallback UI */
          <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center bg-zinc-900 text-zinc-300">
            <AlertCircle className="w-10 h-10 text-amber-400 mb-2.5 opacity-90" />
            <p className="text-sm font-semibold text-zinc-100 m-0">Không thể phát tệp video</p>
            <p className="text-xs text-zinc-400 mt-1 mb-3 max-w-sm">
              Tập tin video có thể chưa được đồng bộ hoặc định dạng không hỗ trợ trên trình duyệt này.
            </p>
            {parsed.directUrl && (
              <a
                href={parsed.directUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[#1976d2] hover:bg-[#1565c0] text-white text-xs font-medium transition-colors no-underline"
              >
                <span>Mở trong tab mới</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            )}
          </div>
        ) : parsed.type === 'direct' ? (
          /* HTML5 Video Player */
          <video
            src={parsed.directUrl}
            poster={resolvedPoster}
            controls={controls}
            autoPlay={autoPlay}
            loop={loop}
            muted={muted || autoPlay}
            playsInline
            preload="metadata"
            onError={() => setHasError(true)}
            className="w-full h-full object-contain"
          >
            Trình duyệt của bạn không hỗ trợ thẻ video HTML5.
          </video>
        ) : (
          /* Embedded Video (YouTube / Vimeo / Loom / Iframe) */
          <iframe
            src={parsed.embedUrl}
            title={title || 'Trình phát video'}
            className="w-full h-full border-0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            loading="lazy"
          />
        )}
      </div>

      {/* Caption / Title below video */}
      {title && (
        <figcaption className="flex items-center justify-center gap-1.5 mt-2.5 text-xs text-zinc-500 dark:text-zinc-400 italic text-center print:text-zinc-600">
          <Film className="w-3.5 h-3.5 shrink-0 opacity-70" />
          <span>{title}</span>
        </figcaption>
      )}

      {/* Clean Print Layout Fallback (Since videos cannot play on printed paper/PDF) */}
      <div className="hidden print:flex items-center gap-2.5 p-3 rounded-lg border border-zinc-300 bg-zinc-50 text-xs text-zinc-700 break-inside-avoid">
        <Film className="w-4 h-4 text-zinc-500 shrink-0" />
        <div className="min-w-0 flex-1">
          <span className="font-semibold text-zinc-900">Tài liệu Video: </span>
          <span>{title || 'Tập tin hướng dẫn trực quan'}</span>
          <div className="font-mono text-[10px] text-zinc-500 truncate mt-0.5">
            {parsed.directUrl || parsed.embedUrl || rawSource}
          </div>
        </div>
      </div>
    </figure>
  );
};
