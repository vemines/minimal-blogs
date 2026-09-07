import React, { useState, useMemo, useEffect } from 'react';
import { Pin } from 'lucide-react';
import type { PostMeta, TagItem } from '../types/blog';
import { PostCard } from '../components/home/PostCard';
import { Pagination } from '../components/home/Pagination';
import { TagFilterDropdown } from '../components/home/TagFilterDropdown';
import { prefetchPostsBatch } from '../services/prefetcher';

interface HomeViewProps {
  posts: PostMeta[];
  tagsList: TagItem[];
  pinnedIds: number[];
  loading: boolean;
  isOffline: boolean;
  bookmarkedIds: number[];
  onToggleBookmark: (id: number) => void;
  onSelectPost: (id: number) => void;
}

const PAGE_SIZE = 10; // 10 items per page

export const HomeView: React.FC<HomeViewProps> = ({
  posts,
  tagsList,
  pinnedIds,
  loading,
  bookmarkedIds,
  onToggleBookmark,
  onSelectPost,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTagId, setSelectedTagId] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState(1);


  // Separate pinned posts from regular posts
  const { pinnedPosts, regularPosts } = useMemo(() => {
    const pinned: PostMeta[] = [];
    const regular: PostMeta[] = [];

    posts.forEach((post) => {
      if (pinnedIds.includes(post.id)) {
        pinned.push(post);
      } else {
        regular.push(post);
      }
    });

    return { pinnedPosts: pinned, regularPosts: regular };
  }, [posts, pinnedIds]);

  // Filter regular posts by search query and selected tag
  const filteredRegularPosts = useMemo(() => {
    return regularPosts.filter((post) => {
      // 1. Tag filter
      if (selectedTagId !== null && !post.tags?.includes(selectedTagId)) {
        return false;
      }

      // 2. Search query filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchTitle = post.title.toLowerCase().includes(q);
        const matchSummary = post.summary?.toLowerCase().includes(q);
        const matchId = post.id.toString() === q.replace(/^#/, '');

        // Match tag names
        const matchTags = post.tags?.some((tId) => {
          const tName = tagsList.find((t) => t.id === tId)?.name.toLowerCase();
          return tName?.includes(q);
        });

        if (!matchTitle && !matchSummary && !matchTags && !matchId) {
          return false;
        }
      }

      return true;
    });
  }, [regularPosts, searchQuery, selectedTagId, tagsList]);

  // Reset page to 1 when filters change (render-time state adjustment without cascading effect)
  const [prevFilterKey, setPrevFilterKey] = useState<string>(`${searchQuery}_${selectedTagId}`);
  const currentFilterKey = `${searchQuery}_${selectedTagId}`;
  if (prevFilterKey !== currentFilterKey) {
    setPrevFilterKey(currentFilterKey);
    setCurrentPage(1);
  }

  // Virtual pagination calculation (fixed 6 items per page)
  const totalPages = Math.ceil(filteredRegularPosts.length / PAGE_SIZE);
  const paginatedPosts = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filteredRegularPosts.slice(start, start + PAGE_SIZE);
  }, [filteredRegularPosts, currentPage]);

  const isSearchingOrFiltering = Boolean(searchQuery.trim() || selectedTagId !== null);

  // Active posts visible on this page (pinned posts on page 1 + paginated regular posts)
  const activePagePosts = useMemo(() => {
    const list = [...paginatedPosts];
    if (!isSearchingOrFiltering && currentPage === 1) {
      pinnedPosts.forEach((p) => {
        if (!list.some((item) => item.id === p.id)) {
          list.unshift(p);
        }
      });
    }
    return list;
  }, [paginatedPosts, pinnedPosts, isSearchingOrFiltering, currentPage]);

  // Immediately prefetch all posts on the current page for instant SSR-speed opening
  useEffect(() => {
    if (activePagePosts.length > 0) {
      prefetchPostsBatch(activePagePosts);
    }
  }, [activePagePosts]);

  return (
    <div className="w-full max-w-[1120px] mx-auto px-4 sm:px-6 py-8">
      {/* High-Contrast Search Bar & Custom Tag Dropdown */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mb-8">
        {/* Search Input with Sharp Contrast */}
        <div className="relative flex-1">
          <svg
            className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#64748b] dark:text-[#94a3b8] pointer-events-none"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm kiếm bài viết, chủ để, ID bài viết"
            className="w-full h-10 bg-white dark:bg-[#1e2026] border border-[#94a3b8] dark:border-[rgba(255,255,255,0.18)] focus:border-[#1976d2] dark:focus:border-[#90caf9] focus:ring-1 focus:ring-[#1976d2] dark:focus:ring-[#90caf9] rounded-lg py-2 pr-8 pl-10 text-sm text-[#0f172a] dark:text-[#f8fafc] placeholder:text-[#64748b] dark:placeholder:text-[#94a3b8] font-normal outline-none shadow-sm transition-all"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-[#64748b] hover:text-[#0f172a] dark:hover:text-white cursor-pointer"
              title="Xóa tìm kiếm"
            >
              ✕
            </button>
          )}
        </div>

        {/* Custom Tag Filter Dropdown */}
        <TagFilterDropdown
          tags={tagsList}
          selectedTagId={selectedTagId}
          onSelectTag={setSelectedTagId}
        />
      </div>

      {/* Loading Skeleton (10 cards) */}
      {loading ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {Array.from({ length: 10 }).map((_, idx) => (
            <div key={idx} className="h-[235px] p-6 rounded-xl bg-white dark:bg-[#18191e] border border-zinc-200 dark:border-[rgba(255,255,255,0.12)] animate-pulse space-y-4">
              <div className="h-4 w-24 bg-zinc-200 dark:bg-zinc-800 rounded"></div>
              <div className="h-6 w-3/4 bg-zinc-200 dark:bg-zinc-800 rounded"></div>
              <div className="h-3 w-28 bg-zinc-200 dark:bg-zinc-800 rounded"></div>
              <div className="h-4 w-full bg-zinc-200 dark:bg-zinc-800 rounded"></div>
            </div>
          ))}
        </div>
      ) : (
        <>
          {/* ─── DEDICATED PINNED POSTS SECTION ─── */}
          {!isSearchingOrFiltering && currentPage === 1 && pinnedPosts.length > 0 && (
            <section className="mb-10" aria-label="Pinned Posts">
              <div className="flex items-center gap-2 mb-3 text-xs font-bold uppercase tracking-wider text-[#1976d2] dark:text-[#90caf9]">
                <Pin className="w-3.5 h-3.5 rotate-45" />
                <span>Bài Viết Ghim Nổi Bật</span>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                {pinnedPosts.map((post) => (
                  <PostCard
                    key={`pinned-${post.id}`}
                    post={post}
                    tagsList={tagsList}
                    isBookmarked={bookmarkedIds.includes(post.id)}
                    onToggleBookmark={onToggleBookmark}
                    onSelectPost={onSelectPost}
                  />
                ))}
              </div>
              <div className="my-8 border-b border-[#e2e8f0] dark:border-[rgba(255,255,255,0.08)]" />
            </section>
          )}

          {/* ─── REGULAR PAGINATED POSTS GRID (Breakpoint: 1024px) ─── */}
          {paginatedPosts.length > 0 ? (
            <main className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              {paginatedPosts.map((post) => (
                <PostCard
                  key={post.id}
                  post={post}
                  tagsList={tagsList}
                  isBookmarked={bookmarkedIds.includes(post.id)}
                  onToggleBookmark={onToggleBookmark}
                  onSelectPost={onSelectPost}
                />
              ))}
            </main>
          ) : (
            /* Empty Search State */
            <div className="text-center py-16 px-4 border border-dashed border-[#cbd5e1] dark:border-[rgba(255,255,255,0.15)] rounded-2xl bg-white dark:bg-[#18191e]">
              <p className="text-[#475569] dark:text-[#94a3b8] text-sm mb-3">
                Không tìm thấy bài viết nào phù hợp với bộ lọc hiện tại.
              </p>
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setSelectedTagId(null);
                }}
                className="text-xs font-mono text-[#1976d2] dark:text-[#90caf9] hover:underline cursor-pointer"
              >
                Xóa tất cả bộ lọc để xem lại
              </button>
            </div>
          )}

          {/* Fixed 7-Item Pagination */}
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={(page) => {
              setCurrentPage(page);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
        </>
      )}
    </div>
  );
};
