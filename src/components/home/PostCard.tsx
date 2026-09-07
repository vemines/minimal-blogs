import React from 'react';
import { Bookmark } from 'lucide-react';
import type { PostMeta, TagItem } from '../../types/blog';
import { formatDisplayDate } from '../../types/blog';
import { prefetchPost } from '../../services/prefetcher';

interface PostCardProps {
  post: PostMeta;
  tagsList?: TagItem[];
  isBookmarked: boolean;
  onToggleBookmark: (id: number) => void;
  onSelectPost: (id: number) => void;
}

export const PostCard: React.FC<PostCardProps> = ({
  post,
  tagsList = [],
  isBookmarked,
  onToggleBookmark,
  onSelectPost,
}) => {
  const postTime = post.datetime || post.date || '';

  // Speculative prefetch on mouse enter / touch start
  const handlePrefetch = () => {
    prefetchPost(post.id, postTime);
  };

  // Resolve tag names for up to 3 tags
  const postTagIds = post.tags || [];
  const tagNames: string[] = [];

  postTagIds.forEach((id) => {
    const found = tagsList.find((t) => t.id === id);
    if (found) tagNames.push(found.name);
  });

  // Fallback if no tags mapped
  if (tagNames.length === 0) {
    tagNames.push('Chủ đề chung');
  }

  const displayTags = tagNames.slice(0, 3);
  const remainingCount = tagNames.length - displayTags.length;

  return (
    <article
      onMouseEnter={handlePrefetch}
      onTouchStart={handlePrefetch}
      onClick={() => onSelectPost(post.id)}
      className="group relative p-6 sm:p-7 rounded-xl bg-white dark:bg-[#18191e] hover:bg-[#f8fafc] dark:hover:bg-[#22252e] border border-zinc-200 dark:border-[rgba(255,255,255,0.12)] hover:border-[#1976d2]/50 dark:hover:border-[#90caf9]/50 transition-all duration-200 cursor-pointer flex flex-col justify-between min-h-[235px] shadow-sm hover:shadow-md select-none"
    >
      <div>
        {/* Top Bar: Subject Badges & Save Button (hover arrow removed) */}
        <div className="flex items-start justify-between gap-3 mb-2.5">
          {/* Display up to 3 tags + remaining badge */}
          <div className="flex items-center gap-1.5 flex-wrap flex-1 min-w-0 pt-0.5">
            {displayTags.map((tagName, idx) => (
              <span
                key={idx}
                className="font-mono text-[11px] uppercase tracking-wider px-2 py-0.5 rounded border border-[#1976d2]/25 dark:border-[#90caf9]/30 bg-blue-50/70 dark:bg-blue-950/40 text-[#1976d2] dark:text-[#90caf9] font-semibold truncate max-w-[140px]"
                title={tagName}
              >
                {tagName}
              </span>
            ))}
            {remainingCount > 0 && (
              <span
                className="font-mono text-[10px] px-1.5 py-0.5 rounded border border-zinc-200 dark:border-zinc-700 bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 font-medium shrink-0"
                title={`Còn ${remainingCount} chủ đề khác`}
              >
                +{remainingCount} chủ đề khác
              </span>
            )}
          </div>

          {/* Bookmark / Save Button placed directly in top-right */}
          <div className="shrink-0" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              onClick={() => onToggleBookmark(post.id)}
              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                isBookmarked
                  ? 'text-[#1976d2] dark:text-[#90caf9] bg-blue-50 dark:bg-blue-950/50'
                  : 'text-zinc-400 hover:text-[#1976d2] dark:hover:text-[#90caf9] hover:bg-zinc-100 dark:hover:bg-zinc-800'
              }`}
              title={isBookmarked ? 'Bỏ lưu bài viết' : 'Lưu bài viết'}
              aria-label="Save post"
            >
              <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-[#1976d2] dark:fill-[#90caf9]' : ''}`} />
            </button>
          </div>
        </div>

        {/* Title (clamped to 2 lines for consistency) */}
        <h2 className="text-base sm:text-lg font-semibold leading-snug tracking-tight text-[#121316] dark:text-[#f0f0f2] line-clamp-2 group-hover:text-[#1976d2] dark:group-hover:text-[#90caf9] transition-colors mb-2">
          {post.title}
        </h2>

        {/* Date / Time (no seconds displayed) */}
        <div className="font-mono text-xs text-[#94a3b8] dark:text-[#64748b] italic">
          {formatDisplayDate(postTime)}
        </div>
      </div>

      {/* Summary (clamped to 3 lines for clean uniform bottom alignment) */}
      <p className="text-xs sm:text-sm leading-relaxed text-[#475569] dark:text-[#94a3b8] font-normal line-clamp-3 mt-auto pt-2">
        {post.summary || 'Tài liệu hướng dẫn kỹ thuật chi tiết.'}
      </p>
    </article>
  );
};
