import React, { useEffect, useState, useRef } from 'react';
import { List, MoveVertical } from 'lucide-react';

interface TocItem {
  id: string;
  text: string;
  level: number;
}

interface TableOfContentsProps {
  content: string;
}

export const TableOfContents: React.FC<TableOfContentsProps> = ({ content }) => {
  const [headings, setHeadings] = useState<TocItem[]>([]);
  const [activeId, setActiveId] = useState<string>('');
  const [isDragging, setIsDragging] = useState<boolean>(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const isMouseDownRef = useRef<boolean>(false);
  const startYRef = useRef<number>(0);
  const startScrollTopRef = useRef<number>(0);
  const hasMovedRef = useRef<boolean>(false);

  // Extract H2 and H3 headings directly from rendered markdown DOM using requestAnimationFrame
  useEffect(() => {
    const extractHeadings = () => {
      const headingElements = Array.from(
        document.querySelectorAll<HTMLElement>('.markdown-body h2, .markdown-body h3')
      );

      if (headingElements.length > 0) {
        const items: TocItem[] = headingElements.map((el, index) => ({
          id: el.id || `heading-${index}`,
          text: el.textContent || '',
          level: el.tagName === 'H2' ? 2 : 3,
        }));
        setHeadings(items);
      }
    };

    const rafId = requestAnimationFrame(extractHeadings);
    return () => cancelAnimationFrame(rafId);
  }, [content]);

  // Scroll-spy: actively track which heading section the user is currently reading on scroll with rAF throttling
  useEffect(() => {
    if (headings.length === 0) return;

    let ticking = false;
    let rafId: number | null = null;

    const updateActiveHeading = () => {
      const scrollPosition = window.scrollY + 100;

      let currentActive = headings[0]?.id || '';
      for (let i = 0; i < headings.length; i++) {
        const el = document.getElementById(headings[i].id);
        if (el) {
          const top = el.getBoundingClientRect().top + window.scrollY;
          if (top <= scrollPosition) {
            currentActive = headings[i].id;
          }
        }
      }
      setActiveId(currentActive);
      ticking = false;
    };

    const handleScroll = () => {
      if (!ticking) {
        ticking = true;
        rafId = requestAnimationFrame(updateActiveHeading);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    updateActiveHeading();

    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (rafId !== null) {
        cancelAnimationFrame(rafId);
      }
    };
  }, [headings]);

  // Dynamic drag handlers - Attach listeners strictly during active mousedown session
  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return; // Only primary button
    isMouseDownRef.current = true;
    hasMovedRef.current = false;
    startYRef.current = e.clientY;
    if (containerRef.current) {
      startScrollTopRef.current = containerRef.current.scrollTop;
    }

    const onGlobalMouseMove = (moveEvt: MouseEvent) => {
      if (!isMouseDownRef.current || !containerRef.current) return;
      const deltaY = moveEvt.clientY - startYRef.current;
      if (Math.abs(deltaY) > 4) {
        hasMovedRef.current = true;
        setIsDragging(true);
      }
      if (hasMovedRef.current) {
        containerRef.current.scrollTop = startScrollTopRef.current - deltaY;
      }
    };

    const onGlobalMouseUp = () => {
      isMouseDownRef.current = false;
      setIsDragging(false);
      window.removeEventListener('mousemove', onGlobalMouseMove);
      window.removeEventListener('mouseup', onGlobalMouseUp);
      setTimeout(() => {
        hasMovedRef.current = false;
      }, 80);
    };

    window.addEventListener('mousemove', onGlobalMouseMove);
    window.addEventListener('mouseup', onGlobalMouseUp);
  };

  // Touch drag handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length !== 1) return;
    isMouseDownRef.current = true;
    hasMovedRef.current = false;
    startYRef.current = e.touches[0].clientY;
    if (containerRef.current) {
      startScrollTopRef.current = containerRef.current.scrollTop;
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isMouseDownRef.current || !containerRef.current || e.touches.length !== 1) return;
    const deltaY = e.touches[0].clientY - startYRef.current;
    if (Math.abs(deltaY) > 4) {
      hasMovedRef.current = true;
      setIsDragging(true);
    }
    if (hasMovedRef.current) {
      e.preventDefault();
      containerRef.current.scrollTop = startScrollTopRef.current - deltaY;
    }
  };

  const handleTouchEnd = () => {
    isMouseDownRef.current = false;
    setIsDragging(false);
    setTimeout(() => {
      hasMovedRef.current = false;
    }, 80);
  };

  if (headings.length < 2) return null;

  const scrollToHeading = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setActiveId(id);
    }
  };

  const handleItemClick = (e: React.MouseEvent, id: string) => {
    // If a drag occurred, do NOT trigger navigation
    if (hasMovedRef.current) {
      e.preventDefault();
      e.stopPropagation();
      return;
    }
    scrollToHeading(id);
  };

  return (
    <nav className="p-4 rounded-xl bg-white dark:bg-[#18191e] border border-zinc-200 dark:border-[rgba(255,255,255,0.12)] text-xs shadow-sm select-none">
      {/* Header */}
      <div className="flex items-center justify-between font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-wider mb-2.5 text-[11px]">
        <div className="flex items-center gap-2">
          <List className="w-4 h-4 text-[#1976d2] dark:text-[#90caf9]" />
          <span>Mục lục bài viết</span>
        </div>
        <div className="flex items-center gap-1 text-[10px] lowercase font-normal text-zinc-400 dark:text-zinc-500">
          <MoveVertical className="w-3 h-3" />
          <span>kéo để cuộn</span>
        </div>
      </div>

      {/* Drag-to-Scroll Container (Natural page wheel pass-through, no CPU hogging) */}
      <div
        ref={containerRef}
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        className={`max-h-[min(620px,calc(100vh-11rem))] overflow-hidden ${
          isDragging ? 'cursor-grabbing' : 'cursor-grab'
        }`}
        style={{ touchAction: 'pan-y' }}
      >
        <ul className="space-y-1 m-0 p-0 list-none">
          {headings.map((item, idx) => {
            const isActive = activeId === item.id;
            return (
              <li
                key={idx}
                style={{ paddingLeft: item.level === 3 ? '0.75rem' : '0' }}
              >
                <button
                  type="button"
                  onClick={(e) => handleItemClick(e, item.id)}
                  className={`text-left block w-full py-1.5 px-2 rounded-md text-xs transition-colors line-clamp-1 select-none pointer-events-auto ${
                    isDragging ? 'cursor-grabbing' : 'cursor-grab'
                  } ${
                    isActive
                      ? 'font-bold text-[#1976d2] dark:text-[#90caf9] bg-blue-50 dark:bg-blue-950/40'
                      : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-50 dark:hover:bg-zinc-800/50'
                  }`}
                >
                  {item.text}
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    </nav>
  );
};
