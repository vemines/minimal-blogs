import React from 'react';
import { ArrowLeft, Bookmark } from 'lucide-react';
import type { PostMeta, TagItem } from '../types/blog';
import { PostCard } from '../components/home/PostCard';

interface SavedPostsViewProps {
  posts: PostMeta[];
  tagsList: TagItem[];
  bookmarkedIds: number[];
  onToggleBookmark: (id: number) => void;
  onSelectPost: (id: number) => void;
  onNavigateHome: () => void;
}

export const SavedPostsView: React.FC<SavedPostsViewProps> = ({
  posts,
  tagsList,
  bookmarkedIds,
  onToggleBookmark,
  onSelectPost,
  onNavigateHome,
}) => {
  const savedPosts = posts.filter((p) => bookmarkedIds.includes(p.id));

  return (
    <div className="w-full max-w-[1120px] mx-auto px-4 sm:px-6 py-8">
      {/* Top Header */}
      <div className="flex items-center justify-between gap-4 pb-6 border-b border-[#e2e8f0] dark:border-[rgba(255,255,255,0.08)] mb-8">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onNavigateHome}
            className="p-2 rounded-lg text-zinc-500 hover:text-[#1976d2] dark:hover:text-[#90caf9] bg-white dark:bg-[#18191e] hover:bg-zinc-100 dark:hover:bg-[#252833] transition-colors cursor-pointer border border-[#cbd5e1] dark:border-[rgba(255,255,255,0.12)]"
            title="Quay lại trang chủ"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#121316] dark:text-[#f0f0f2] flex items-center gap-2 m-0">
              <Bookmark className="w-5 h-5 text-[#1976d2] dark:text-[#90caf9] fill-[#1976d2] dark:fill-[#90caf9]" />
              Bài Viết Đã Lưu
            </h1>
          </div>
        </div>
      </div>

      {/* Content Grid */}
      {savedPosts.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {savedPosts.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              tagsList={tagsList}
              isBookmarked={true}
              onToggleBookmark={onToggleBookmark}
              onSelectPost={onSelectPost}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-20 px-4 border border-dashed border-[#cbd5e1] dark:border-[rgba(255,255,255,0.15)] rounded-2xl bg-white dark:bg-[#18191e]">
          <div className="w-12 h-12 rounded-full bg-blue-50 dark:bg-blue-950/40 text-[#1976d2] dark:text-[#90caf9] mx-auto flex items-center justify-center mb-3">
            <Bookmark className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-[#121316] dark:text-[#f0f0f2] mb-1">
            Chưa có bài viết nào được lưu
          </h3>
          <p className="text-xs text-[#64748b] dark:text-[#94a3b8] max-w-sm mx-auto mb-5">
            Nhấn biểu tượng bookmark để lưu bài viết và xem lại sau.
          </p>
          <button
            type="button"
            onClick={onNavigateHome}
            className="px-4 py-2 rounded-lg bg-[#1976d2] hover:bg-[#1565c0] text-white text-xs font-semibold shadow-sm transition-colors cursor-pointer"
          >
            Khám phá danh sách bài viết
          </button>
        </div>
      )}
    </div>
  );
};
