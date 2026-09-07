import { fetchPostContent, hasMemoryCache } from './api';
import type { PostMeta } from '../types/blog';

// In-flight promises to avoid duplicate requests
const inFlightRequests = new Set<number>();

/**
 * Prefetches a post content into memory cache
 */
export async function prefetchPost(id: number, date?: string): Promise<void> {
  if (hasMemoryCache(id, date) || inFlightRequests.has(id)) {
    return;
  }

  inFlightRequests.add(id);
  try {
    await fetchPostContent(id, date);
  } catch (err) {
    console.debug(`Prefetch for post ${id} quietly failed:`, err);
  } finally {
    inFlightRequests.delete(id);
  }
}

/**
 * Immediately and eagerly prefetches all posts visible on the current page.
 * Fetches in parallel with Promise.allSettled so clicking any post card opens in 0ms without skeleton!
 */
export async function prefetchPostsBatch(posts: PostMeta[]): Promise<void> {
  if (!posts || posts.length === 0) return;

  const needingPrefetch = posts.filter(
    (p) => !hasMemoryCache(p.id, p.datetime || p.date) && !inFlightRequests.has(p.id)
  );

  if (needingPrefetch.length === 0) return;

  await Promise.allSettled(
    needingPrefetch.map((post) => prefetchPost(post.id, post.datetime || post.date))
  );
}

/**
 * Schedules idle prefetching for top posts (pinned or recent)
 */
export function scheduleIdlePrefetch(posts: PostMeta[], limit: number = 10) {
  const targetPosts = posts.slice(0, limit);

  const runPrefetch = () => {
    targetPosts.forEach((post, index) => {
      // Stagger slightly to avoid blocking network queue
      setTimeout(() => {
        prefetchPost(post.id, post.datetime || post.date);
      }, index * 200);
    });
  };

  if ('requestIdleCallback' in window) {
    (window as Window & { requestIdleCallback: (cb: () => void) => void }).requestIdleCallback(runPrefetch);
  } else {
    setTimeout(runPrefetch, 1000);
  }
}
