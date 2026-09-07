import React from 'react';
import { Sun, Moon, Bookmark } from 'lucide-react';

interface HeaderProps {
  currentTheme: 'light' | 'dark';
  onToggleTheme: () => void;
  bookmarkCount: number;
  onNavigateHome: () => void;
  onNavigateSaved: () => void;
  isSavedPage?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  currentTheme,
  onToggleTheme,
  bookmarkCount,
  onNavigateHome,
  onNavigateSaved,
  isSavedPage = false,
}) => {
  return (
    <header className="w-full bg-white dark:bg-[#18191e] border-b border-[#e6e7eb] dark:border-[rgba(255,255,255,0.12)] transition-colors duration-200">
      <div className="max-w-[1120px] mx-auto px-4 sm:px-6 py-4 flex items-center justify-between gap-4">
        {/* Just title: Minimal Blogs */}
        <div
          onClick={onNavigateHome}
          className="cursor-pointer group select-none"
        >
          <span className="text-xl sm:text-2xl font-bold tracking-tight text-[#121316] dark:text-[#f0f0f2] group-hover:text-[#1976d2] dark:group-hover:text-[#90caf9] transition-colors">
            Minimal Blogs
          </span>
        </div>

        {/* Action Controls: Saved Posts Link & Theme Toggle */}
        <div className="flex items-center gap-3">
          {/* Link to Saved Posts Page */}
          <button
            type="button"
            onClick={onNavigateSaved}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${isSavedPage
                ? 'bg-[#1976d2] text-white shadow-sm'
                : 'text-[#121316] dark:text-[#f0f0f2] hover:text-[#1976d2] dark:hover:text-[#90caf9] hover:bg-zinc-100 dark:hover:bg-[#252833] border border-transparent'
              }`}
            title="Xem các bài viết đã lưu"
          >
            <Bookmark className={`w-4 h-4 ${isSavedPage ? 'fill-white text-white' : 'text-[#64748b] dark:text-[#94a3b8]'}`} />
            <span className="hidden sm:inline">Bài viết đã lưu</span>
            {bookmarkCount > 0 && (
              <span
                className={`font-mono text-[11px] font-semibold transition-colors ${isSavedPage
                    ? 'text-blue-100'
                    : 'text-zinc-500 dark:text-zinc-400'
                  }`}
              >
                ({bookmarkCount})
              </span>
            )}
          </button>

          {/* Theme Toggle Button */}
          <button
            type="button"
            onClick={onToggleTheme}
            className="p-2 text-[#585c64] dark:text-[#8e9299] hover:text-[#1976d2] dark:hover:text-[#90caf9] hover:bg-zinc-100 dark:hover:bg-[#252833] rounded-lg transition-all cursor-pointer border border-[#e6e7eb] dark:border-[rgba(255,255,255,0.12)]"
            title={currentTheme === 'dark' ? 'Chuyển sang giao diện Sáng' : 'Chuyển sang giao diện Tối'}
            aria-label="Toggle Theme"
          >
            {currentTheme === 'dark' ? (
              <Sun className="w-4 h-4 text-amber-300" />
            ) : (
              <Moon className="w-4 h-4 text-zinc-700" />
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
