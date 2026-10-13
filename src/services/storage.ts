import type { PostMeta, TagItem } from '../types/blog';

const THEME_KEY = 'blog_theme';
const BOOKMARKS_KEY = 'blog_bookmarks';
const POSTS_CACHE_KEY = 'blog_posts_cache';
const POST_CONTENT_PREFIX = 'blog_post_content_';

export interface CachedPostData {
  content: string;
  date?: string;
}

export const storage = {
  // Theme management
  getTheme(): 'light' | 'dark' {
    const saved = localStorage.getItem(THEME_KEY);
    if (saved === 'dark' || saved === 'light') return saved;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  },

  setTheme(theme: 'light' | 'dark') {
    localStorage.setItem(THEME_KEY, theme);
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  },

  // Bookmarks management
  getBookmarks(): number[] {
    try {
      const data = localStorage.getItem(BOOKMARKS_KEY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  toggleBookmark(id: number): boolean {
    const current = this.getBookmarks();
    const exists = current.includes(id);
    let updated: number[];
    if (exists) {
      updated = current.filter((item) => item !== id);
    } else {
      updated = [...current, id];
    }
    localStorage.setItem(BOOKMARKS_KEY, JSON.stringify(updated));
    return !exists;
  },

  isBookmarked(id: number): boolean {
    return this.getBookmarks().includes(id);
  },

  // Offline cache for posts.json list
  getCachedPosts(): PostMeta[] | null {
    try {
      const data = localStorage.getItem(POSTS_CACHE_KEY);
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  },

  setCachedPosts(posts: PostMeta[]) {
    try {
      localStorage.setItem(POSTS_CACHE_KEY, JSON.stringify(posts));
    } catch (e) {
      console.warn('Could not cache posts in localStorage:', e);
    }
  },

  // Offline cache for tags
  getCachedTags(): TagItem[] | null {
    try {
      const data = localStorage.getItem('blog_tags_cache');
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  },

  setCachedTags(tags: TagItem[]) {
    try {
      localStorage.setItem('blog_tags_cache', JSON.stringify(tags));
    } catch (e) {
      console.warn('Could not cache tags:', e);
    }
  },

  // Offline cache for pinned IDs
  getCachedPinnedIds(): number[] | null {
    try {
      const data = localStorage.getItem('blog_pinned_cache');
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  },

  setCachedPinnedIds(ids: number[]) {
    try {
      localStorage.setItem('blog_pinned_cache', JSON.stringify(ids));
    } catch (e) {
      console.warn('Could not cache pinned IDs:', e);
    }
  },

  // Cache for individual markdown posts
  getCachedPostContent(id: number): CachedPostData | null {
    try {
      const raw = localStorage.getItem(`${POST_CONTENT_PREFIX}${id}`);
      if (!raw) return null;
      if (raw.startsWith('{') && raw.includes('"content"')) {
        return JSON.parse(raw);
      }
      // Backward compatibility for legacy plain text cache
      return { content: raw };
    } catch {
      return null;
    }
  },

  setCachedPostContent(id: number, content: string, date?: string) {
    try {
      const data: CachedPostData = { content, date };
      localStorage.setItem(`${POST_CONTENT_PREFIX}${id}`, JSON.stringify(data));
    } catch (e) {
      console.warn(`Could not cache post ${id} content:`, e);
    }
  },
};
