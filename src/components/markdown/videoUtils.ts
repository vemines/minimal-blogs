import { R2_PUBLIC_URL, getEffectiveDataBaseUrl } from '../../services/api';

/**
 * Resolves media URL relative to CDN / R2 bucket or base URL if not an absolute http(s) URL.
 */
export const getFullMediaUrl = (path?: string): string => {
  if (!path) return '';
  const trimmed = path.trim();
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://') || trimmed.startsWith('data:')) {
    return trimmed;
  }
  if (!R2_PUBLIC_URL) {
    const base = getEffectiveDataBaseUrl();
    const cleanPath = trimmed.replace(/^\/+/, '');
    return base ? `${base}/${cleanPath}` : (trimmed.startsWith('/') ? trimmed : `/${trimmed}`);
  }
  const cleanR2 = R2_PUBLIC_URL.replace(/\/+$/, '');
  const cleanPath = trimmed.replace(/^\/+/, '');
  return `${cleanR2}/${cleanPath}`;
};

/**
 * Checks if a given URL or filename is a recognized video source or embed.
 */
export const isVideoUrl = (rawUrl?: string): boolean => {
  if (!rawUrl) return false;
  const url = rawUrl.trim();
  const clean = url.split('?')[0].split('#')[0].toLowerCase();
  if (/\.(mp4|webm|ogg|ogv|mov|m4v)$/i.test(clean)) return true;
  if (/(?:youtube\.com|youtu\.be|vimeo\.com|loom\.com)/i.test(url)) return true;
  return false;
};

export interface ParsedVideoSource {
  type: 'youtube' | 'vimeo' | 'loom' | 'iframe' | 'direct';
  embedUrl?: string;
  directUrl?: string;
}

export function parseVideoSource(rawUrl: string): ParsedVideoSource {
  const url = rawUrl.trim();

  // 1. YouTube (youtube.com, youtu.be, shorts, embed)
  const ytMatch = url.match(/(?:youtu\.be\/|youtube(?:-nocookie)?\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=|shorts\/))([a-zA-Z0-9_-]{11})/i);
  if (ytMatch) {
    const videoId = ytMatch[1];
    // Extract timestamp (?t=120s or ?t=120)
    let startSeconds: string | null = null;
    const timeMatch = url.match(/[?&]t=(\d+h)?(\d+m)?(\d+s?|\d+)/i);
    if (timeMatch) {
      let secs = 0;
      if (timeMatch[1]) secs += parseInt(timeMatch[1], 10) * 3600;
      if (timeMatch[2]) secs += parseInt(timeMatch[2], 10) * 60;
      if (timeMatch[3]) secs += parseInt(timeMatch[3], 10);
      if (secs > 0) startSeconds = String(secs);
    }
    const startParam = startSeconds ? `&start=${startSeconds}` : '';
    return {
      type: 'youtube',
      embedUrl: `https://www.youtube-nocookie.com/embed/${videoId}?rel=0&modestbranding=1${startParam}`,
    };
  }

  // 2. Vimeo (vimeo.com/123456789 or player.vimeo.com/video/123456789)
  const vimeoMatch = url.match(/(?:vimeo\.com\/(?:video\/)?|player\.vimeo\.com\/video\/)(\d+)/i);
  if (vimeoMatch) {
    return {
      type: 'vimeo',
      embedUrl: `https://player.vimeo.com/video/${vimeoMatch[1]}?dnt=1&title=0&byline=0`,
    };
  }

  // 3. Loom (loom.com/share/... or loom.com/embed/...)
  const loomMatch = url.match(/loom\.com\/(?:share|embed)\/([a-zA-Z0-9_-]+)/i);
  if (loomMatch) {
    return {
      type: 'loom',
      embedUrl: `https://www.loom.com/embed/${loomMatch[1]}`,
    };
  }

  // 4. Generic iframe embed URLs (e.g. Cloudflare Stream / Bilibili / DailyMotion)
  if (url.includes('/embed/') || url.includes('videodelivery.net') || url.includes('player.')) {
    return {
      type: 'iframe',
      embedUrl: url,
    };
  }

  // 5. Direct HTML5 video file
  return {
    type: 'direct',
    directUrl: getFullMediaUrl(url),
  };
}
