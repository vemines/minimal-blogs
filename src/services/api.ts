import type { PostMeta, TagItem } from '../types/blog';
import { storage } from './storage';

export const R2_PUBLIC_URL = (import.meta?.env?.VITE_R2_PUBLIC_URL as string) || '';
export const APP_TITLE = (import.meta?.env?.VITE_APP_TITLE as string) || 'Minimal Blogs';
export const APP_FOOTER = (import.meta?.env?.VITE_APP_FOOTER as string) || 'Minimal Blogs, create with ❤️ by VeMines';

// Returns the subpath base URL if hosted on GitHub Pages or configured via BASE_URL (e.g., '/minimal-blogs')
export const getAppBase = (): string => {
  if (typeof window !== 'undefined') {
    const { pathname, hostname } = window.location;
    if (hostname.endsWith('github.io')) {
      const firstSegment = pathname.split('/').filter(Boolean)[0];
      if (firstSegment) {
        return `/${firstSegment}`;
      }
    }
    const base = import.meta.env.BASE_URL;
    if (base && base !== './' && base !== '/') {
      return base.replace(/\/+$/, '');
    }
  }
  return '';
};

// Base URL for blog data (posts.json, tags.json, pinned.txt, posts/*.md).
export const getEffectiveDataBaseUrl = (): string => {
  const dataUrl = (import.meta?.env?.VITE_DATA_URL as string) || (import.meta?.env?.VITE_DATA_BASE_URL as string);
  if (dataUrl) {
    return dataUrl.replace(/\/+$/, '');
  }
  if (typeof window !== 'undefined') {
    const appBase = getAppBase();
    if (appBase) {
      return `${window.location.origin}${appBase}`;
    }
  }
  return '';
};

export const DATA_BASE_URL = getEffectiveDataBaseUrl();

interface MemoryCacheItem {
  content: string;
  date?: string;
  timestamp: number;
}

// In-memory runtime cache for freshness & 0ms transitions
const CACHE_TTL_MS = 5 * 60 * 1000;
const memoryCache = new Map<number, MemoryCacheItem>();
let cachedTags: TagItem[] | null = null;
let cachedPinnedIds: number[] | null = null;

/**
 * Checks whether cached date matches expected post date.
 * Allows compatibility between date-only prefix and datetime (e.g. "2026-03-12" vs "2026-03-12 10:30:00").
 */
export function isDateFresh(cachedDate?: string, expectedDate?: string): boolean {
  if (!expectedDate) return true;
  if (!cachedDate) return false;
  if (cachedDate === expectedDate) return true;
  if (expectedDate.startsWith(cachedDate) || cachedDate.startsWith(expectedDate)) return true;
  return false;
}

/**
 * Synchronously retrieves cached post markdown (from RAM or LocalStorage)
 * to avoid flashing loading skeleton on navigation or page refresh.
 */
export function getSynchronousPostContent(id: number, expectedDate?: string): string | null {
  const mem = memoryCache.get(id);
  if (mem) {
    if (import.meta.env.DEV) {
      // In DEV, use memory cache for immediate render to prevent scroll jump,
      // while fetchPostContent will still fetch fresh content asynchronously.
      return mem.content;
    }
    if (isDateFresh(mem.date, expectedDate)) {
      return mem.content;
    }
  }
  const local = storage.getCachedPostContent(id);
  if (local && (import.meta.env.DEV || isDateFresh(local.date, expectedDate))) {
    const cleaned = local.content.replace(/^#\s+[^\r\n]+[\r\n]*/, '').trim();
    memoryCache.set(id, { content: cleaned, date: expectedDate || local.date, timestamp: Date.now() });
    return cleaned;
  }
  return null;
}

export function hasMemoryCache(id: number, expectedDate?: string): boolean {
  if (import.meta.env.DEV) {
    return false;
  }
  const item = memoryCache.get(id);
  if (!item) return false;
  if (!isDateFresh(item.date, expectedDate)) {
    return false;
  }
  return Date.now() - item.timestamp < CACHE_TTL_MS;
}

export function sortPostsDesc(posts: PostMeta[]): PostMeta[] {
  return [...posts].sort((a, b) => {
    const timeA = a.datetime ? new Date(a.datetime).getTime() : 0;
    const timeB = b.datetime ? new Date(b.datetime).getTime() : 0;
    if (isNaN(timeA) && isNaN(timeB)) return b.id - a.id;
    if (isNaN(timeA)) return 1;
    if (isNaN(timeB)) return -1;
    if (timeB !== timeA) return timeB - timeA;
    return b.id - a.id;
  });
}

/**
 * Fetches the post index.
 * In DEV mode (npm run dev), loads /data.json first so edits are immediately visible.
 * In production, loads minified /posts.json.
 */
export async function fetchPosts(): Promise<{ posts: PostMeta[]; isOffline: boolean }> {
  try {
    const baseUrl = getEffectiveDataBaseUrl();
    let res: Response | null = null;

    // Trong môi trường DEV, ưu tiên nạp data.json để chỉnh sửa trực quan
    if (import.meta.env.DEV) {
      try {
        const devRes = await fetch(`${baseUrl}/data.json?t=${Date.now()}`);
        if (devRes.ok) {
          res = devRes;
        }
      } catch (devErr) {
        console.warn('Không thể nạp data.json trong DEV mode, fallback sang posts.json:', devErr);
      }
    }

    if (!res) {
      res = await fetch(`${baseUrl}/posts.json?t=${Date.now()}`);
    }

    if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);

    const data: PostMeta[] = await res.json();

    // Sort descending by datetime (newest first)
    const sorted = sortPostsDesc(data);

    // Cache for offline use
    storage.setCachedPosts(sorted);
    return { posts: sorted, isOffline: false };
  } catch (error) {
    console.warn('Failed to load posts index:', error);
    const cached = storage.getCachedPosts();
    if (cached && cached.length > 0) {
      return { posts: cached, isOffline: true };
    }
    // Return empty array when error occurs with no fallback to other files
    return { posts: [], isOffline: true };
  }
}

/**
 * Fetches tags metadata (tags.json) with offline storage fallback
 */
export async function fetchTags(): Promise<TagItem[]> {
  if (!import.meta.env.DEV && cachedTags) return cachedTags;
  try {
    const baseUrl = getEffectiveDataBaseUrl();
    const res = await fetch(`${baseUrl}/tags.json?t=${Date.now()}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    cachedTags = await res.json();
    storage.setCachedTags(cachedTags!);
    return cachedTags!;
  } catch (err) {
    console.warn('Failed to load tags.json, using offline cache:', err);
    const offline = storage.getCachedTags();
    if (offline) {
      cachedTags = offline;
      return offline;
    }
    return [];
  }
}

/**
 * Fetches pinned post IDs from pinned.txt with offline storage fallback
 */
export async function fetchPinnedIds(): Promise<number[]> {
  if (!import.meta.env.DEV && cachedPinnedIds) return cachedPinnedIds;
  try {
    const baseUrl = getEffectiveDataBaseUrl();
    const res = await fetch(`${baseUrl}/pinned.txt?t=${Date.now()}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const text = await res.text();
    cachedPinnedIds = text
      .split('\n')
      .map((line) => line.trim())
      .filter((line) => line.length > 0 && !isNaN(Number(line)))
      .map(Number);
    storage.setCachedPinnedIds(cachedPinnedIds);
    return cachedPinnedIds;
  } catch (err) {
    console.warn('Failed to load pinned.txt, using offline cache:', err);
    const offline = storage.getCachedPinnedIds();
    if (offline) {
      cachedPinnedIds = offline;
      return offline;
    }
    return [];
  }
}

/**
 * Fetches markdown content for a post by numeric ID (/posts/<id>.md).
 * In DEV mode, bypasses memory and localStorage cache completely so edits update instantly!
 * In production, compares datetime: if post.date matches cached.date, returns cache immediately (0ms).
 */
export async function fetchPostContent(
  id: number,
  expectedDate?: string
): Promise<{ content: string; fromCache: boolean }> {
  const now = Date.now();

  // In production, check cache first (0ms load).
  // In development mode, bypass cache completely so any edits to .md files show immediately upon refresh!
  if (!import.meta.env.DEV) {
    // 1. Check in-memory cache first: if date matches, return 0ms
    const mem = memoryCache.get(id);
    if (mem && isDateFresh(mem.date, expectedDate) && now - mem.timestamp < CACHE_TTL_MS) {
      return { content: mem.content, fromCache: true };
    }

    // 2. Check localStorage cache: if date matches, promote to RAM and return 0ms
    const localCached = storage.getCachedPostContent(id);
    if (localCached && isDateFresh(localCached.date, expectedDate)) {
      const cleaned = localCached.content.replace(/^#\s+[^\r\n]+[\r\n]*/, '').trim();
      memoryCache.set(id, { content: cleaned, date: expectedDate || localCached.date, timestamp: now });
      return { content: cleaned, fromCache: true };
    }
  }

  // 3. Date does not match or not in cache (or DEV mode): fetch fresh content from network
  try {
    const baseUrl = getEffectiveDataBaseUrl();
    const res = await fetch(`${baseUrl}/posts/${id}.md?t=${now}`);

    if (res.status === 404) {
      // Post markdown does not exist yet. Explicitly throw NOT_FOUND, DO NOT cache placeholder
      throw new Error('NOT_FOUND');
    }

    if (!res.ok) {
      throw new Error(`HTTP ${res.status}: ${res.statusText}`);
    }

    let text = await res.text();

    // Check if the response is actually an HTML SPA fallback (Vite rewrite on missing files)
    const contentType = res.headers.get('content-type') || '';
    if (
      contentType.includes('text/html') ||
      text.trim().startsWith('<!doctype') ||
      text.trim().startsWith('<html')
    ) {
      throw new Error('NOT_FOUND');
    }

    // Strip leading H1 title if present to avoid duplicating the post header title
    text = text.replace(/^#\s+[^\r\n]+[\r\n]*/, '').trim();

    // In DEV, also populate memoryCache so hot reloads / re-renders have immediate content for scroll height
    memoryCache.set(id, { content: text, date: expectedDate, timestamp: now });

    // Save content to persistent storage so initial render on reload has synchronous content to prevent scroll jump
    storage.setCachedPostContent(id, text, expectedDate);

    return { content: text, fromCache: false };
  } catch (error: any) {
    // 4. Fallback to localStorage cache if offline or fetch fails (but not for 404 unwritten posts)
    if (error?.message !== 'NOT_FOUND') {
      const localCached = storage.getCachedPostContent(id);
      if (localCached) {
        const cleaned = localCached.content.replace(/^#\s+[^\r\n]+[\r\n]*/, '').trim();
        memoryCache.set(id, { content: cleaned, date: localCached.date, timestamp: now });
        return { content: cleaned, fromCache: true };
      }
    }
    throw error;
  }
}

/**
 * Directly primes the in-memory cache (used by prefetcher)
 */
export function setMemoryCache(id: number, content: string, date?: string) {
  if (import.meta.env.DEV) return;
  memoryCache.set(id, { content, date, timestamp: Date.now() });
}
