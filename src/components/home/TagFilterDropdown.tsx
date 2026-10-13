import React, { useState, useRef, useEffect } from 'react';
import { Tag, ChevronDown, Check } from 'lucide-react';
import type { TagItem } from '../../types/blog';

interface TagFilterDropdownProps {
  tags: TagItem[];
  selectedTagId: number | null;
  onSelectTag: (tagId: number | null) => void;
}

export const TagFilterDropdown: React.FC<TagFilterDropdownProps> = ({
  tags,
  selectedTagId,
  onSelectTag,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [filterText, setFilterText] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close when clicking outside or pressing Escape
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false);
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const currentTagName = selectedTagId !== null 
    ? tags.find((t) => t.id === selectedTagId)?.name || 'Chủ đề'
    : 'Tất cả chủ đề';

  const visibleTags = tags.filter((t) =>
    t.name.toLowerCase().includes(filterText.toLowerCase().trim())
  );

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      {/* Dropdown Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`h-10 px-3.5 rounded-lg flex items-center gap-2 text-xs font-medium border transition-all cursor-pointer select-none ${
          selectedTagId !== null
            ? 'border-[#1976d2] bg-blue-50/70 dark:bg-blue-950/40 text-[#1976d2] dark:text-[#90caf9]'
            : 'border-[#94a3b8] dark:border-[rgba(255,255,255,0.18)] bg-white dark:bg-[#1e2026] text-[#121316] dark:text-[#f0f0f2] hover:border-[#1976d2] dark:hover:border-[#90caf9]'
        }`}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <Tag className="w-3.5 h-3.5 text-[#1976d2] dark:text-[#90caf9]" />
        <span className="max-w-[130px] truncate">{currentTagName}</span>
        <ChevronDown className={`w-3.5 h-3.5 text-[#64748b] dark:text-[#94a3b8] transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown Popover */}
      {isOpen && (
        <div className="absolute left-0 sm:right-0 sm:left-auto mt-2 w-60 rounded-xl bg-white dark:bg-[#18191e] border border-[#cbd5e1] dark:border-[rgba(255,255,255,0.18)] shadow-xl z-50 overflow-hidden animate-in fade-in-0 zoom-in-95 duration-100">
          {/* Quick Filter Search inside Popover if tags > 6 */}
          {tags.length > 6 && (
            <div className="p-2 border-b border-[#e2e8f0] dark:border-[rgba(255,255,255,0.08)]">
              <input
                type="text"
                value={filterText}
                onChange={(e) => setFilterText(e.target.value)}
                placeholder="Tìm chủ đề..."
                className="w-full px-2.5 py-1.5 text-xs bg-[#f1f5f9] dark:bg-[#121316] border border-[#cbd5e1] dark:border-[rgba(255,255,255,0.14)] rounded-md text-[#121316] dark:text-[#f0f0f2] outline-none focus:border-[#1976d2]"
                autoFocus
              />
            </div>
          )}

          {/* Options List */}
          <div className="max-h-60 overflow-y-auto p-1.5 space-y-0.5" role="listbox">
            {/* "Tất cả chủ đề" Option */}
            <button
              type="button"
              onClick={() => {
                onSelectTag(null);
                setIsOpen(false);
              }}
              className={`w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-xs transition-colors cursor-pointer text-left ${
                selectedTagId === null
                  ? 'bg-blue-50 dark:bg-blue-950/50 text-[#1976d2] dark:text-[#90caf9] font-semibold'
                  : 'text-[#334155] dark:text-[#cbd5e1] hover:bg-[#f1f5f9] dark:hover:bg-[#252833]'
              }`}
            >
              <span>Tất cả chủ đề</span>
              {selectedTagId === null && <Check className="w-3.5 h-3.5 text-[#1976d2] dark:text-[#90caf9]" />}
            </button>

            {/* Individual Tags */}
            {visibleTags.map((tag) => {
              const isSelected = selectedTagId === tag.id;
              return (
                <button
                  key={tag.id}
                  type="button"
                  onClick={() => {
                    onSelectTag(tag.id);
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-xs transition-colors cursor-pointer text-left ${
                    isSelected
                      ? 'bg-blue-50 dark:bg-blue-950/50 text-[#1976d2] dark:text-[#90caf9] font-semibold'
                      : 'text-[#334155] dark:text-[#cbd5e1] hover:bg-[#f1f5f9] dark:hover:bg-[#252833]'
                  }`}
                >
                  <span className="truncate">{tag.name}</span>
                  {isSelected && <Check className="w-3.5 h-3.5 text-[#1976d2] dark:text-[#90caf9]" />}
                </button>
              );
            })}

            {visibleTags.length === 0 && (
              <div className="p-3 text-center text-xs text-[#94a3b8]">
                Không có chủ đề nào
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
