import React, { useEffect, useState, useRef, useCallback } from 'react';
import { ArrowLeft, Bookmark, Calendar, Share2, Check, AlertCircle, Printer, Link2, ChevronUp, Plus, FileQuestion } from 'lucide-react';
import type { PostMeta, TagItem } from '../types/blog';
import { formatDisplayDate } from '../types/blog';
import { fetchPostContent, getSynchronousPostContent } from '../services/api';
import { MarkdownRenderer } from '../components/markdown/MarkdownRenderer';
import { TableOfContents } from '../components/markdown/TableOfContents';
import { ErrorBoundary } from '../components/common/ErrorBoundary';

interface PostDetailViewProps {
  postId: number;
  postMeta?: PostMeta;
  tagsList?: TagItem[];
  isBookmarked: boolean;
  onToggleBookmark: (id: number) => void;
  onBack: () => void;
}

export const PostDetailView: React.FC<PostDetailViewProps> = ({
  postId,
  postMeta,
  tagsList = [],
  isBookmarked,
  onToggleBookmark,
  onBack,
}) => {
  const articleRef = useRef<HTMLElement>(null);
  const postTime = postMeta?.datetime || postMeta?.date;

  // Check synchronous cache (RAM or LocalStorage) to eliminate loading skeleton flash
  const initialCache = getSynchronousPostContent(postId, postTime);
  const [content, setContent] = useState<string>(() => initialCache || '');
  const [loading, setLoading] = useState<boolean>(() => !initialCache);
  const [error, setError] = useState<string | null>(null);
  const [copiedLink, setCopiedLink] = useState<boolean>(false);
  const [isFabOpen, setIsFabOpen] = useState<boolean>(false);
  const [showScrollTop, setShowScrollTop] = useState<boolean>(false);
  const [isPrinting, setIsPrinting] = useState<boolean>(false);

  // Derive loading & reset state during render when postId changes to prevent set-state-in-effect
  const [prevPostId, setPrevPostId] = useState<number>(postId);
  if (prevPostId !== postId) {
    setPrevPostId(postId);
    const syncCache = getSynchronousPostContent(postId, postTime);
    setLoading(!syncCache);
    setError(null);
    setContent(syncCache || '');
  }

  // Track previous postId to only scroll to top when actually navigating to a DIFFERENT post
  const activePostIdRef = useRef<number>(postId);
  // Remember last known scroll position in ref so it is always accessible across renders
  const getInitialSavedScroll = (): number => {
    if (typeof window === 'undefined') return 0;
    const saved = sessionStorage.getItem(`scroll_pos_${postId}`);
    if (saved) {
      const val = parseInt(saved, 10);
      if (!isNaN(val) && val > 0) return val;
    }
    return 0;
  };
  const lastScrollYRef = useRef<number>(getInitialSavedScroll());

  // Flag to know if user has interacted/scrolled manually
  const isUserInteractingRef = useRef<boolean>(false);
  // Flag to know if programmatic restoration is actively running
  const isRestoringRef = useRef<boolean>(false);

  // Set history.scrollRestoration = 'manual' to prevent browser native scroll clobbering on SPA reload
  useEffect(() => {
    if (typeof window !== 'undefined' && 'scrollRestoration' in window.history) {
      const original = window.history.scrollRestoration;
      window.history.scrollRestoration = 'manual';
      return () => {
        window.history.scrollRestoration = original;
      };
    }
  }, []);

  // Track genuine user interaction so we know when the user deliberately moves scroll
  useEffect(() => {
    const handleUserInteraction = () => {
      isUserInteractingRef.current = true;
    };

    window.addEventListener('wheel', handleUserInteraction, { passive: true, capture: true });
    window.addEventListener('touchmove', handleUserInteraction, { passive: true, capture: true });
    const handleKeyDown = (e: KeyboardEvent) => {
      if ([' ', 'ArrowUp', 'ArrowDown', 'PageUp', 'PageDown', 'Home', 'End'].includes(e.key)) {
        isUserInteractingRef.current = true;
      }
    };
    window.addEventListener('keydown', handleKeyDown, { passive: true, capture: true });
    window.addEventListener('pointerdown', handleUserInteraction, { passive: true, capture: true });

    return () => {
      window.removeEventListener('wheel', handleUserInteraction, { capture: true });
      window.removeEventListener('touchmove', handleUserInteraction, { capture: true });
      window.removeEventListener('keydown', handleKeyDown, { capture: true });
      window.removeEventListener('pointerdown', handleUserInteraction, { capture: true });
    };
  }, []);

  // Initialize lastScrollYRef from sessionStorage if changed
  useEffect(() => {
    const saved = sessionStorage.getItem(`scroll_pos_${postId}`);
    if (saved) {
      const val = parseInt(saved, 10);
      if (!isNaN(val) && val > 0) {
        lastScrollYRef.current = val;
      }
    }
  }, [postId]);

  // Continuously record scroll position into sessionStorage & ref with throttling
  useEffect(() => {
    let scrollTimeout: ReturnType<typeof setTimeout> | null = null;
    let lastRecordedY = window.scrollY;

    const handleScroll = () => {
      const currentY = window.scrollY;
      setShowScrollTop(currentY > window.innerHeight * 0.5);

      // Protect target position: while programmatic restoration is underway and user hasn't touched scroll,
      // ignore clamped intermediate scroll values that are lower than target
      if (!isUserInteractingRef.current && isRestoringRef.current && currentY < lastScrollYRef.current - 50) {
        return;
      }

      if (currentY > 0) {
        lastScrollYRef.current = currentY;
        lastRecordedY = currentY;

        // Throttle sessionStorage writes to at most once per 100ms
        if (!scrollTimeout) {
          scrollTimeout = setTimeout(() => {
            sessionStorage.setItem(`scroll_pos_${postId}`, lastRecordedY.toString());
            scrollTimeout = null;
          }, 100);
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });

    // Also capture before page reloads/unmounts (e.g. Vite full-reload on public file change)
    const handleBeforeUnload = () => {
      if (scrollTimeout) {
        clearTimeout(scrollTimeout);
        scrollTimeout = null;
      }
      const finalY = Math.max(window.scrollY, lastScrollYRef.current);
      if (finalY > 0) {
        sessionStorage.setItem(`scroll_pos_${postId}`, finalY.toString());
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      if (scrollTimeout) {
        clearTimeout(scrollTimeout);
      }
      // Save immediate position on unmount
      const finalY = Math.max(window.scrollY, lastScrollYRef.current);
      if (finalY > 0) {
        sessionStorage.setItem(`scroll_pos_${postId}`, finalY.toString());
      }
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [postId]);

  // Helper to attempt restoring scroll position multiple times to handle DOM reflow/images
  const restoreScrollPosition = useCallback((targetY: number) => {
    if (targetY <= 0) return;
    // CRITICAL: Never restore during skeleton post! Wait until markdown content is loaded and rendered
    if (!content) return;

    isRestoringRef.current = true;

    const attemptScroll = (): boolean => {
      if (isUserInteractingRef.current) {
        isRestoringRef.current = false;
        return true;
      }

      const maxScroll = Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
      if (maxScroll <= 0) return false;

      const clampedTarget = Math.min(targetY, maxScroll);
      window.scrollTo({ top: clampedTarget, behavior: 'instant' });

      // If we are close enough to targetY, we consider restoration complete
      if (Math.abs(window.scrollY - targetY) <= 15) {
        isRestoringRef.current = false;
        return true;
      }
      return false;
    };

    // Immediate attempt in next animation frame
    requestAnimationFrame(() => {
      if (attemptScroll()) return;
    });

    // Multi-attempt restore over 2.5 seconds to account for layout shifts, font loads, and async images
    const timeouts: ReturnType<typeof setTimeout>[] = [];
    const delays = [30, 80, 150, 300, 600, 1000, 1600, 2400];
    delays.forEach((delay) => {
      const t = setTimeout(() => {
        if (attemptScroll()) {
          timeouts.forEach(clearTimeout);
        }
      }, delay);
      timeouts.push(t);
    });

    // Attach listeners to images inside the article to re-scroll as each image loads
    if (articleRef.current) {
      const images = articleRef.current.querySelectorAll('img');
      images.forEach((img) => {
        if (!img.complete) {
          const onImgLoad = () => {
            img.removeEventListener('load', onImgLoad);
            img.removeEventListener('error', onImgLoad);
            attemptScroll();
          };
          img.addEventListener('load', onImgLoad);
          img.addEventListener('error', onImgLoad);
        }
      });
    }

    // Safety timeout: stop restoration state after 3 seconds
    setTimeout(() => {
      isRestoringRef.current = false;
    }, 3000);
  }, [content]);

  // Restore scroll position when content is rendered and available (handles page refresh / Vite reload)
  useEffect(() => {
    if (!content) return; // Do not attempt while skeleton is showing!

    const savedY = sessionStorage.getItem(`scroll_pos_${postId}`);
    const targetY = savedY ? parseInt(savedY, 10) : lastScrollYRef.current;
    if (targetY && targetY > 0) {
      requestAnimationFrame(() => {
        restoreScrollPosition(targetY);
      });
    }
  }, [content, postId, restoreScrollPosition]);

  // Load post content
  useEffect(() => {
    let isMounted = true;
    const isDifferentPost = activePostIdRef.current !== postId;
    activePostIdRef.current = postId;

    // Only reset scroll to 0 if actually navigating to a DIFFERENT post
    if (isDifferentPost) {
      sessionStorage.removeItem(`scroll_pos_${postId}`);
      lastScrollYRef.current = 0;
      isUserInteractingRef.current = false;
      window.scrollTo({ top: 0, behavior: 'instant' });
    }

    // Preserve target scroll position before re-fetching:
    // When editing the markdown file, window.scrollY might temporarily reset if DOM collapses,
    // so we prioritize lastScrollYRef or sessionStorage.
    const savedSessionY = parseInt(sessionStorage.getItem(`scroll_pos_${postId}`) || '0', 10);
    const targetScrollY = Math.max(window.scrollY, lastScrollYRef.current, savedSessionY);

    fetchPostContent(postId, postTime)
      .then(({ content: mdContent }) => {
        if (isMounted) {
          setContent(mdContent);
          setLoading(false);

          // If updating the SAME post (dev live reload or background refetch), restore scroll!
          if (!isDifferentPost && targetScrollY > 0) {
            requestAnimationFrame(() => {
              restoreScrollPosition(targetScrollY);
            });
          }
        }
      })
      .catch((err) => {
        if (isMounted) {
          setError(err.message || 'Không thể tải nội dung bài viết.');
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [postId, postTime, restoreScrollPosition]);

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    } catch {
      // Fallback
    }
  };

  // Helper to ensure all images in the article are fully loaded and decoded before print dialog opens
  const ensureImagesLoaded = async (): Promise<void> => {
    if (!articleRef.current) return;
    const images = Array.from(articleRef.current.querySelectorAll('img'));
    if (images.length === 0) return;

    // Force loading="eager" on all images
    images.forEach((img) => {
      img.loading = 'eager';
    });

    await Promise.all(
      images.map((img) => {
        if (img.complete && img.naturalWidth !== 0) {
          return Promise.resolve();
        }
        return new Promise<void>((resolve) => {
          img.onload = () => resolve();
          img.onerror = () => resolve(); // don't freeze print if an image fails
          setTimeout(resolve, 2500); // 2.5s safety timeout
        });
      })
    );
  };

  // Standard afterprint listener for accurate CSS print cleanup & image loading guarantee
  const handlePrint = async () => {
    setIsPrinting(true);
    document.body.classList.add('print-compressed');

    // Wait for all article images to load so they render crisply in PDF
    await ensureImagesLoaded();

    const cleanup = () => {
      document.body.classList.remove('print-compressed');
      setIsPrinting(false);
      window.removeEventListener('afterprint', cleanup);
    };
    window.addEventListener('afterprint', cleanup);

    // Give browser paint engine 100ms to draw images before opening print dialog
    setTimeout(() => {
      window.print();
    }, 100);
  };

  // Ensure print-compressed is cleaned up and handle native Ctrl+P (beforeprint/afterprint)
  useEffect(() => {
    const handleBeforePrint = () => {
      document.body.classList.add('print-compressed');
      if (articleRef.current) {
        const images = Array.from(articleRef.current.querySelectorAll('img'));
        images.forEach((img) => {
          img.loading = 'eager';
        });
      }
    };
    const handleAfterPrint = () => {
      document.body.classList.remove('print-compressed');
      setIsPrinting(false);
    };

    window.addEventListener('beforeprint', handleBeforePrint);
    window.addEventListener('afterprint', handleAfterPrint);

    return () => {
      window.removeEventListener('beforeprint', handleBeforePrint);
      window.removeEventListener('afterprint', handleAfterPrint);
      document.body.classList.remove('print-compressed');
    };
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="w-full max-w-[1120px] mx-auto px-4 sm:px-6 py-6 sm:py-8 relative">
      {/* Top Action Bar: Back button (Trang chủ), Print/Save PDF button, Bookmark, Share */}
      <div className="flex items-center justify-between gap-3 pb-6 border-b border-[#e2e8f0] dark:border-[rgba(255,255,255,0.08)] no-print">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg border border-[#cbd5e1] dark:border-[rgba(255,255,255,0.12)] bg-white dark:bg-[#18191e] text-[#334155] dark:text-[#cbd5e1] hover:bg-zinc-50 dark:hover:bg-[#22252e] hover:text-[#1976d2] dark:hover:text-[#90caf9] text-xs font-semibold shadow-sm transition-all cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4 text-[#1976d2] dark:text-[#90caf9]" />
          <span>Trang chủ</span>
        </button>

        <div className="flex items-center gap-2">
          {/* Print / Save Compressed PDF Button */}
          <button
            type="button"
            onClick={handlePrint}
            disabled={isPrinting}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#cbd5e1] dark:border-[rgba(255,255,255,0.12)] bg-white dark:bg-[#18191e] text-[#475569] dark:text-[#94a3b8] hover:text-[#1976d2] dark:hover:text-[#90caf9] hover:bg-zinc-50 dark:hover:bg-[#22252e] text-xs font-semibold shadow-sm transition-colors cursor-pointer disabled:opacity-60"
            title={isPrinting ? 'Đang chuẩn bị ảnh và trang in...' : 'In tài liệu / Lưu PDF nén (Ctrl+P)'}
          >
            <Printer className={`w-4 h-4 text-[#1976d2] dark:text-[#90caf9] ${isPrinting ? 'animate-pulse' : ''}`} />
          </button>

          {/* Copy Link Button */}
          <button
            type="button"
            onClick={handleShare}
            className="p-2 rounded-lg border border-[#cbd5e1] dark:border-[rgba(255,255,255,0.12)] bg-white dark:bg-[#18191e] text-[#475569] dark:text-[#94a3b8] hover:text-[#1976d2] dark:hover:text-[#90caf9] hover:bg-zinc-50 dark:hover:bg-[#22252e] transition-colors cursor-pointer"
            title="Sao chép link bài viết"
          >
            {copiedLink ? <Check className="w-4 h-4 text-[#1976d2] dark:text-[#90caf9]" /> : <Share2 className="w-4 h-4" />}
          </button>

          {/* Bookmark Button */}
          <button
            type="button"
            onClick={() => onToggleBookmark(postId)}
            className={`p-2 rounded-lg border transition-colors cursor-pointer ${isBookmarked
              ? 'border-[#1976d2]/50 dark:border-[#90caf9]/50 bg-blue-50 dark:bg-blue-950/40 text-[#1976d2] dark:text-[#90caf9]'
              : 'border-[#cbd5e1] dark:border-[rgba(255,255,255,0.12)] bg-white dark:bg-[#18191e] text-[#475569] dark:text-[#94a3b8] hover:text-[#1976d2] dark:hover:text-[#90caf9] hover:bg-zinc-50 dark:hover:bg-[#22252e]'
              }`}
            title={isBookmarked ? 'Bỏ lưu bài viết' : 'Lưu bài viết'}
          >
            <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-[#1976d2] dark:fill-[#90caf9]' : ''}`} />
          </button>
        </div>
      </div>

      {/* 404 Dedicated Clean UI */}
      {error === 'NOT_FOUND' ? (
        <div className="py-20 px-6 max-w-lg mx-auto text-center">
          <div className="w-14 h-14 rounded-2xl bg-blue-50 dark:bg-blue-950/40 text-[#1976d2] dark:text-[#90caf9] border border-blue-100 dark:border-blue-900/50 flex items-center justify-center mx-auto mb-4 shadow-sm">
            <FileQuestion className="w-7 h-7" />
          </div>
          <h2 className="text-lg sm:text-xl font-bold text-zinc-900 dark:text-zinc-100 tracking-tight">
            Bài viết chưa có nội dung
          </h2>
          <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mt-2 leading-relaxed">
            Blog #{postId} hiện đang được cập nhật.
          </p>
          <div className="mt-6 flex items-center justify-center gap-3">
            <button
              type="button"
              onClick={onBack}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#1976d2] hover:bg-blue-700 text-white text-xs font-semibold shadow-sm transition-all cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Quay lại trang chủ</span>
            </button>
          </div>
        </div>
      ) : (
        /* Main Content Layout */
        <div className="mt-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Article Body */}
          <article
            ref={articleRef}
            id="printable-article"
            className="lg:col-span-8 p-6 sm:p-8 rounded-xl bg-white dark:bg-[#18191e] border border-zinc-200 dark:border-[rgba(255,255,255,0.12)] shadow-sm space-y-6 print:border-0 print:shadow-none print:p-0 print:bg-transparent"
          >
            {/* Post Header (Well-spaced divider, readingTime removed) */}
            {postMeta && (
              <div className="space-y-2 pb-5 mb-6 border-b border-[#e2e8f0] dark:border-[rgba(255,255,255,0.08)] print:border-b-zinc-300">
                <h1 className="text-xl sm:text-2xl font-bold text-[#0f172a] dark:text-[#f8fafc] tracking-tight leading-snug m-0 print:text-black">
                  {postMeta.title}
                </h1>

                <div className="flex items-center gap-2.5 text-xs text-[#64748b] dark:text-[#94a3b8] font-mono pt-1 print:text-zinc-600">
                  <span className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5" /> {formatDisplayDate(postTime)}
                  </span>
                </div>
              </div>
            )}

            {/* Loading / Error / Markdown Content */}
            {loading && !content ? (
              <div className="space-y-4 py-8">
                <div className="h-6 bg-zinc-200 dark:bg-zinc-800 rounded-md w-3/4 animate-pulse" />
                <div className="h-4 bg-zinc-200 dark:bg-zinc-800 rounded-md w-full animate-pulse" />
                <div className="h-4 bg-zinc-200 dark:bg-zinc-800 rounded-md w-5/6 animate-pulse" />
                <div className="h-32 bg-zinc-200 dark:bg-zinc-800 rounded-xl w-full animate-pulse mt-6" />
              </div>
            ) : error && !content ? (
              <div className="p-6 rounded-2xl border border-rose-200 dark:border-rose-900/60 bg-rose-50 dark:bg-rose-950/30 text-rose-800 dark:text-rose-200 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 shrink-0 text-rose-600 dark:text-rose-400 mt-0.5" />
                <div className="space-y-1">
                  <h3 className="text-sm font-bold m-0">
                    {!navigator.onLine
                      ? 'Thiết bị đang ngoại tuyến'
                      : 'Không thể tải nội dung bài viết'}
                  </h3>
                  <p className="text-xs m-0 text-rose-700 dark:text-rose-300 leading-relaxed">
                    {!navigator.onLine
                      ? 'Bài viết này chưa được lưu vào bộ nhớ ngoại tuyến. Vui lòng kết nối mạng để xem nội dung.'
                      : error}
                  </p>
                  <button
                    type="button"
                    onClick={() => window.location.reload()}
                    className="mt-3 inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-semibold cursor-pointer shadow-sm transition-colors"
                  >
                    <span>Thử tải lại</span>
                  </button>
                </div>
              </div>
            ) : (
              <ErrorBoundary>
                <MarkdownRenderer content={content} />
              </ErrorBoundary>
            )}

            {/* Article Topics / Tags */}
            {postMeta?.tags && postMeta.tags.length > 0 && (
              <div className="pt-6 border-t border-[#e2e8f0] dark:border-[rgba(255,255,255,0.08)] flex items-center gap-2 flex-wrap text-xs">
                <span className="text-zinc-500 dark:text-zinc-400 font-semibold">Chủ đề:</span>
                {postMeta.tags.map((tagId) => {
                  const tagObj = tagsList.find((t) => t.id === tagId);
                  if (!tagObj) return null;
                  return (
                    <span
                      key={tagId}
                      className="font-mono text-[11px] uppercase tracking-wider px-2.5 py-0.5 rounded-md border border-[#1976d2]/25 dark:border-[#90caf9]/30 bg-blue-50/70 dark:bg-blue-950/40 text-[#1976d2] dark:text-[#90caf9] font-semibold"
                    >
                      {tagObj.name}
                    </span>
                  );
                })}
              </div>
            )}

            {/* Footer Navigation */}
            <div className="pt-6 border-t border-[#e2e8f0] dark:border-[rgba(255,255,255,0.08)] flex items-center justify-between no-print">
              <button
                type="button"
                onClick={onBack}
                className="inline-flex items-center gap-2 text-xs font-bold text-[#1976d2] dark:text-[#90caf9] hover:underline cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" /> Trang chủ
              </button>
              <button
                type="button"
                onClick={scrollToTop}
                className="text-xs text-[#64748b] dark:text-[#94a3b8] hover:text-[#1976d2] dark:hover:text-[#90caf9] cursor-pointer"
              >
                Lên đầu trang ↑
              </button>
            </div>
          </article>

          {/* Right Sticky Sidebar (Table of Contents only) */}
          <aside className="hidden lg:block lg:col-span-4 sticky top-6 space-y-4 no-print">
            <TableOfContents content={content} />
          </aside>
        </div>
      )}

      {/* ─── FLOATING ACTION BAR (FAB) & SCROLL TO TOP (POST PAGE ONLY) ─── */}
      <div className="fixed bottom-6 right-6 z-40 flex flex-col items-end gap-2.5 no-print">
        {/* 1. Scroll To Top Button (Positioned ABOVE FAB, Square with rounded corners) */}
        {showScrollTop && (
          <button
            type="button"
            onClick={scrollToTop}
            className="w-11 h-11 rounded-xl bg-white dark:bg-[#18191e] border border-[#cbd5e1] dark:border-[rgba(255,255,255,0.18)] text-[#1976d2] dark:text-[#90caf9] flex items-center justify-center shadow-lg hover:bg-blue-50 dark:hover:bg-blue-950/40 transition-all duration-200 cursor-pointer animate-in fade-in-0 slide-in-from-bottom-2"
            title="Cuộn lên đầu trang"
            aria-label="Cuộn lên đầu trang"
          >
            <ChevronUp className="w-5 h-5" />
          </button>
        )}

        {/* 2. FAB Row (Square with rounded corners) */}
        <div className="relative flex items-center gap-2">
          {/* Action Row */}
          <div
            className={`flex items-center gap-1.5 p-1.5 rounded-xl bg-white dark:bg-[#18191e] border border-[#cbd5e1] dark:border-[rgba(255,255,255,0.18)] shadow-lg transition-all duration-200 ${isFabOpen
              ? 'opacity-100 translate-x-0 pointer-events-auto'
              : 'opacity-0 translate-x-4 pointer-events-none'
              }`}
          >
            {/* Share */}
            <button
              type="button"
              onClick={handleShare}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-[#475569] dark:text-[#94a3b8] hover:bg-blue-50 dark:hover:bg-blue-950/40 hover:text-[#1976d2] dark:hover:text-[#90caf9] transition-colors cursor-pointer"
              title="Sao chép link"
            >
              {copiedLink ? <Check className="w-4 h-4 text-emerald-500" /> : <Link2 className="w-4 h-4" />}
            </button>

            {/* Bookmark */}
            <button
              type="button"
              onClick={() => onToggleBookmark(postId)}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-[#475569] dark:text-[#94a3b8] hover:bg-blue-50 dark:hover:bg-blue-950/40 hover:text-[#1976d2] dark:hover:text-[#90caf9] transition-colors cursor-pointer"
              title={isBookmarked ? 'Bỏ lưu bài viết' : 'Lưu bài viết'}
            >
              <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-[#1976d2] text-[#1976d2] dark:fill-[#90caf9] dark:text-[#90caf9]' : ''}`} />
            </button>

            {/* Print / Save Compressed PDF */}
            <button
              type="button"
              onClick={handlePrint}
              disabled={isPrinting}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-[#475569] dark:text-[#94a3b8] hover:bg-blue-50 dark:hover:bg-blue-950/40 hover:text-[#1976d2] dark:hover:text-[#90caf9] transition-colors cursor-pointer disabled:opacity-60"
              title={isPrinting ? 'Đang chuẩn bị ảnh và trang in...' : 'In / Lưu PDF nén (Ctrl+P)'}
            >
              <Printer className={`w-4 h-4 ${isPrinting ? 'animate-pulse' : ''}`} />
            </button>
          </div>

          {/* Main FAB Trigger (Square with rounded corners) */}
          <button
            type="button"
            onClick={() => setIsFabOpen(!isFabOpen)}
            className={`w-11 h-11 rounded-xl bg-[#1976d2] hover:bg-[#1565c0] text-white flex items-center justify-center shadow-lg hover:shadow-xl transition-transform duration-200 cursor-pointer ${isFabOpen ? 'rotate-45' : ''
              }`}
            title="Thao tác nhanh"
            aria-label="Thao tác nhanh"
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};
