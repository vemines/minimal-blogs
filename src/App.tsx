import { useEffect, useState } from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';
import type { PostMeta, TagItem } from './types/blog';
import { fetchPosts, fetchTags, fetchPinnedIds } from './services/api';
import { storage } from './services/storage';
import { Header } from './components/layout/Header';
import { HomeView } from './views/HomeView';
import { SavedPostsView } from './views/SavedPostsView';
import { PostDetailView } from './views/PostDetailView';

export function App() {
  // Lazy initial state from offline cache for instant 0ms first render without skeleton flash
  const [posts, setPosts] = useState<PostMeta[]>(() => storage.getCachedPosts() || []);
  const [tagsList, setTagsList] = useState<TagItem[]>(() => storage.getCachedTags() || []);
  const [pinnedIds, setPinnedIds] = useState<number[]>(() => storage.getCachedPinnedIds() || []);
  const [loading, setLoading] = useState<boolean>(() => {
    const cached = storage.getCachedPosts();
    return !cached || cached.length === 0;
  });
  const [isOffline, setIsOffline] = useState<boolean>(false);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [currentPostId, setCurrentPostId] = useState<number | null>(null);
  const [isSavedRoute, setIsSavedRoute] = useState<boolean>(false);
  const [bookmarkedIds, setBookmarkedIds] = useState<number[]>(() => storage.getBookmarks());

  // Lazy Initial State for Theme to prevent cascading render warning
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const saved = storage.getTheme();
    storage.setTheme(saved);
    return saved;
  });

  // Initialize Route on mount
  useEffect(() => {
    // Parse URL for initial route
    const parseUrlRoute = () => {
      const path = window.location.pathname;
      const hash = window.location.hash;
      const search = new URLSearchParams(window.location.search);

      // Check /saved
      if (path === '/saved' || hash === '#/saved' || hash === '#saved') {
        setIsSavedRoute(true);
        setCurrentPostId(null);
        return;
      }

      // Check ?id=1
      if (search.get('id')) {
        const id = parseInt(search.get('id')!, 10);
        if (!isNaN(id)) {
          setCurrentPostId(id);
          setIsSavedRoute(false);
          return;
        }
      }

      // Check /posts/0, /post/1, /post-0, /posts-0
      const pathMatch = path.match(/\/posts?[-/](\d+)/);
      if (pathMatch) {
        setCurrentPostId(parseInt(pathMatch[1], 10));
        setIsSavedRoute(false);
        return;
      }

      // Check #/posts/0, #/post/1, #post-0, #posts-0
      const hashMatch = hash.match(/#\/?posts?[-/](\d+)/);
      if (hashMatch) {
        setCurrentPostId(parseInt(hashMatch[1], 10));
        setIsSavedRoute(false);
        return;
      }

      setCurrentPostId(null);
      setIsSavedRoute(false);
    };

    parseUrlRoute();

    // Handle browser forward/back buttons (popstate)
    const handlePopState = () => {
      parseUrlRoute();
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const [reloadKey, setReloadKey] = useState<number>(0);

  const handleRetry = () => {
    setLoading(true);
    setFetchError(null);
    setReloadKey((k) => k + 1);
  };

  // Fetch posts.txt (gzip), tags.json, and pinned.txt on load with retry resilience
  useEffect(() => {
    let active = true;

    Promise.all([fetchPosts(), fetchTags(), fetchPinnedIds()])
      .then(([{ posts: data, isOffline: offline }, tags, pinned]) => {
        if (!active) return;
        if (data.length === 0 && offline) {
          setFetchError('Không thể tải danh mục bài viết từ máy chủ và chưa có bản lưu ngoại tuyến.');
        } else {
          setPosts(data);
          setTagsList(tags);
          setPinnedIds(pinned);
          setIsOffline(offline);
        }
        setLoading(false);
      })
      .catch((err) => {
        if (!active) return;
        console.error('Error fetching data:', err);
        setFetchError('Lỗi kết nối máy chủ dữ liệu. Vui lòng kiểm tra lại kết nối mạng.');
        setLoading(false);
      });

    // Auto-retry when connection restores
    const handleOnline = () => {
      handleRetry();
    };
    window.addEventListener('online', handleOnline);
    return () => {
      active = false;
      window.removeEventListener('online', handleOnline);
    };
  }, [reloadKey]);

  // Navigation handlers
  const navigateToPost = (id: number) => {
    setCurrentPostId(id);
    setIsSavedRoute(false);
    window.history.pushState(null, '', `/posts/${id}`);
  };

  const navigateToHome = () => {
    setCurrentPostId(null);
    setIsSavedRoute(false);
    window.history.pushState(null, '', '/');
  };

  const navigateToSaved = () => {
    setIsSavedRoute(true);
    setCurrentPostId(null);
    window.history.pushState(null, '', '/saved');
  };

  // Theme toggle
  const toggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    storage.setTheme(nextTheme);
  };

  // Bookmark toggle
  const handleToggleBookmark = (id: number) => {
    storage.toggleBookmark(id);
    setBookmarkedIds(storage.getBookmarks());
  };

  const currentPostMeta = posts.find((p) => p.id === currentPostId);

  return (
    <div className="min-h-screen flex flex-col bg-[#fafafa] dark:bg-[#0c0d0e] text-[#121316] dark:text-[#f0f0f2] transition-colors duration-200">
      {/* Header */}
      <Header
        currentTheme={theme}
        onToggleTheme={toggleTheme}
        bookmarkCount={bookmarkedIds.length}
        onNavigateHome={navigateToHome}
        onNavigateSaved={navigateToSaved}
        isSavedPage={isSavedRoute}
      />

      {/* Main Content Area */}
      <main className="flex-1">
        {fetchError && posts.length === 0 ? (
          <div className="min-h-[400px] flex items-center justify-center p-6">
            <div className="max-w-md w-full p-8 rounded-2xl border border-rose-200 dark:border-rose-900/60 bg-rose-50/80 dark:bg-rose-950/20 text-center shadow-sm">
              <div className="w-12 h-12 rounded-xl bg-rose-100 dark:bg-rose-900/40 text-rose-600 dark:text-rose-400 flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="w-6 h-6" />
              </div>
              <h2 className="text-base sm:text-lg font-bold text-rose-900 dark:text-rose-100 tracking-tight">
                Không thể kết nối máy chủ dữ liệu
              </h2>
              <p className="text-xs sm:text-sm text-rose-700 dark:text-rose-300 mt-2 leading-relaxed">
                {fetchError}
              </p>
              <div className="mt-6 flex items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={handleRetry}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#1976d2] hover:bg-blue-700 text-white text-xs font-semibold shadow-sm transition-colors cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Thử kết nối lại</span>
                </button>
              </div>
            </div>
          </div>
        ) : isSavedRoute ? (
          <SavedPostsView
            posts={posts}
            tagsList={tagsList}
            bookmarkedIds={bookmarkedIds}
            onToggleBookmark={handleToggleBookmark}
            onSelectPost={navigateToPost}
            onNavigateHome={navigateToHome}
          />
        ) : currentPostId !== null ? (
          <PostDetailView
            postId={currentPostId}
            postMeta={currentPostMeta}
            tagsList={tagsList}
            isBookmarked={bookmarkedIds.includes(currentPostId)}
            onToggleBookmark={handleToggleBookmark}
            onBack={navigateToHome}
          />
        ) : (
          <HomeView
            posts={posts}
            tagsList={tagsList}
            pinnedIds={pinnedIds}
            loading={loading}
            isOffline={isOffline}
            bookmarkedIds={bookmarkedIds}
            onToggleBookmark={handleToggleBookmark}
            onSelectPost={navigateToPost}
          />
        )}
      </main>

      {/* Reduced Height Footer */}
      <footer className="w-full py-4 border-t border-[#e2e8f0] dark:border-[rgba(255,255,255,0.08)] text-center text-xs text-[#64748b] dark:text-[#94a3b8] no-print">
        <div className="max-w-[1120px] mx-auto px-4">
          <p className="m-0 font-medium">
            Minimal Blogs, create with ❤️ by VeMines
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;
