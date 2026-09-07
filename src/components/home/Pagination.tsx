import React, { useState } from 'react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
}) => {
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [inputPage, setInputPage] = useState<string>('');

  if (totalPages <= 1) return null;

  const handleJump = () => {
    const page = parseInt(inputPage, 10);
    if (!isNaN(page)) {
      const clampedPage = Math.min(Math.max(page, 1), totalPages);
      onPageChange(clampedPage);
    }
    setEditingIndex(null);
    setInputPage('');
  };

  // Fixed 7-Item Window Pagination Algorithm
  const getPageNumbers = (): (number | string)[] => {
    const N = totalPages;
    const P = currentPage;

    // 1. If total_pages <= 7: Show all pages without any ellipsis
    if (N <= 7) {
      const all: number[] = [];
      for (let i = 1; i <= N; i++) all.push(i);
      return all;
    }

    // 2. If total_pages > 7: Always show a fixed number of 7 elements (including ellipses)
    // Left boundary
    if (P <= 4) {
      return [1, 2, 3, 4, 5, '...', N];
    }

    // Right boundary
    if (P >= N - 3) {
      return [1, '...', N - 4, N - 3, N - 2, N - 1, N];
    }

    // Middle view
    return [1, '...', P - 1, P, P + 1, '...', N];
  };

  const pages = getPageNumbers();

  return (
    <nav className="flex items-center justify-center gap-1.5 mt-10 mb-6" aria-label="Pagination">
      {/* Previous Button (<) */}
      <button
        type="button"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="min-w-[36px] h-9 px-2.5 rounded-md text-xs font-mono text-[#585c64] dark:text-[#8e9299] hover:text-[#1976d2] dark:hover:text-[#90caf9] hover:bg-blue-50 dark:hover:bg-blue-950/30 disabled:opacity-25 disabled:cursor-default transition-all flex items-center justify-center cursor-pointer border border-transparent"
        aria-label="Previous page"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <polyline points="15 18 9 12 15 6"></polyline>
        </svg>
      </button>

      {/* 7 Page Elements */}
      {pages.map((item, idx) => {
        if (item === '...') {
          if (editingIndex === idx) {
            return (
              <input
                key={`ellipsis-input-${idx}`}
                type="number"
                autoFocus
                min={1}
                max={totalPages}
                value={inputPage}
                onChange={(e) => setInputPage(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleJump();
                  } else if (e.key === 'Escape') {
                    setEditingIndex(null);
                    setInputPage('');
                  }
                }}
                onBlur={handleJump}
                placeholder="#"
                className="no-spinner w-11 h-9 px-1 text-center font-mono text-xs rounded-md bg-white dark:bg-[#18191e] border-2 border-[#1976d2] dark:border-[#90caf9] text-zinc-900 dark:text-zinc-100 outline-none shadow-sm [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              />
            );
          }

          return (
            <button
              key={`ellipsis-${idx}`}
              type="button"
              onClick={() => {
                setEditingIndex(idx);
                setInputPage('');
              }}
              className="min-w-[32px] h-9 px-1 text-[#969ba3] dark:text-[#8e9299] hover:text-[#1976d2] dark:hover:text-[#90caf9] hover:bg-blue-50 dark:hover:bg-blue-950/40 rounded-md font-mono text-xs select-none flex items-center justify-center cursor-pointer transition-colors border border-transparent hover:border-blue-200 dark:hover:border-blue-800"
              title="Bấm để nhập số trang cần đến"
            >
              ···
            </button>
          );
        }

        const pageNum = item as number;
        const isActive = pageNum === currentPage;

        return (
          <button
            key={pageNum}
            type="button"
            onClick={() => onPageChange(pageNum)}
            className={`min-w-[36px] h-9 px-2.5 rounded-md font-mono text-xs transition-all flex items-center justify-center cursor-pointer ${
              isActive
                ? 'bg-[#1976d2] text-white font-bold shadow-sm shadow-blue-500/30'
                : 'text-[#585c64] dark:text-[#8e9299] hover:text-[#1976d2] dark:hover:text-[#90caf9] hover:bg-blue-50 dark:hover:bg-blue-950/30'
            }`}
            aria-current={isActive ? 'page' : undefined}
          >
            {pageNum}
          </button>
        );
      })}

      {/* Next Button (>) */}
      <button
        type="button"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="min-w-[36px] h-9 px-2.5 rounded-md text-xs font-mono text-[#585c64] dark:text-[#8e9299] hover:text-[#1976d2] dark:hover:text-[#90caf9] hover:bg-blue-50 dark:hover:bg-blue-950/30 disabled:opacity-25 disabled:cursor-default transition-all flex items-center justify-center cursor-pointer border border-transparent"
        aria-label="Next page"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <polyline points="9 18 15 12 9 6"></polyline>
        </svg>
      </button>
    </nav>
  );
};
