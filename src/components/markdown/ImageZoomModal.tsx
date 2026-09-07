import React, { useEffect, useState, useRef } from 'react';
import { X, ZoomIn, ZoomOut, RotateCcw, ExternalLink } from 'lucide-react';

interface ImageZoomModalProps {
  src: string | null;
  alt?: string;
  onClose: () => void;
}

export const ImageZoomModal: React.FC<ImageZoomModalProps> = ({ src, alt, onClose }) => {
  const [scale, setScale] = useState<number>(1);
  const [position, setPosition] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const dragStartRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  const handleZoomIn = () => {
    setScale((prev) => Math.min(prev + 0.3, 3.5));
  };

  const handleZoomOut = () => {
    setScale((prev) => {
      const next = Math.max(prev - 0.3, 0.6);
      if (next <= 1) setPosition({ x: 0, y: 0 });
      return next;
    });
  };

  const handleReset = () => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
  };

  // 1. Lock body scrolling when modal is active
  useEffect(() => {
    if (!src) return;
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === '+' || e.key === '=') handleZoomIn();
      if (e.key === '-') handleZoomOut();
      if (e.key === '0') handleReset();
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [src, onClose]);

  // Drag to pan when zoomed
  const handleMouseDown = (e: React.MouseEvent) => {
    if (scale <= 1) return;
    setIsDragging(true);
    dragStartRef.current = { x: e.clientX - position.x, y: e.clientY - position.y };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || scale <= 1) return;
    setPosition({
      x: e.clientX - dragStartRef.current.x,
      y: e.clientY - dragStartRef.current.y,
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  if (!src) return null;

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-fade-in select-none"
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
    >
      {/* Modal Floating Toolbar */}
      <div
        onClick={(e) => e.stopPropagation()}
        className="fixed top-5 z-50 flex items-center gap-1 bg-[#18181b]/90 border border-white/20 px-3 py-1.5 rounded-full shadow-2xl backdrop-blur-sm text-white"
      >
        <button
          type="button"
          onClick={handleZoomIn}
          className="p-1.5 hover:bg-white/20 rounded-full transition-colors cursor-pointer"
          title="Phóng to (+)"
        >
          <ZoomIn className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={handleZoomOut}
          className="p-1.5 hover:bg-white/20 rounded-full transition-colors cursor-pointer"
          title="Thu nhỏ (-)"
        >
          <ZoomOut className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={handleReset}
          className="p-1.5 hover:bg-white/20 rounded-full transition-colors cursor-pointer"
          title="Khôi phục kích thước ban đầu (0)"
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </button>

        <span className="font-mono text-xs px-2 opacity-70">
          {Math.round(scale * 100)}%
        </span>

        <a
          href={src}
          target="_blank"
          rel="noopener noreferrer"
          className="p-1.5 hover:bg-white/20 rounded-full transition-colors cursor-pointer"
          title="Mở ảnh gốc trong tab mới"
        >
          <ExternalLink className="w-3.5 h-3.5" />
        </a>

        <div className="w-[1px] h-4 bg-white/20 mx-1" />

        <button
          type="button"
          onClick={onClose}
          className="p-1.5 hover:bg-rose-500/80 rounded-full transition-colors cursor-pointer"
          title="Đóng (Esc)"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Image Container with Zoom and Drag */}
      <div
        onClick={(e) => e.stopPropagation()}
        onMouseDown={handleMouseDown}
        className={`relative max-w-full max-h-[85vh] flex flex-col items-center overflow-visible ${
          scale > 1 ? (isDragging ? 'cursor-grabbing' : 'cursor-grab') : 'cursor-default'
        }`}
      >
        <img
          src={src}
          alt={alt || 'Xem chi tiết ảnh'}
          style={{
            transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
            transition: isDragging ? 'none' : 'transform 0.18s ease-out',
          }}
          className="max-w-full max-h-[80vh] object-contain rounded-xl shadow-2xl border border-white/10 pointer-events-auto"
          draggable={false}
        />

        {/* Caption */}
        {alt && (
          <p className="mt-4 text-xs text-zinc-300 text-center max-w-xl font-medium tracking-wide">
            {alt}
          </p>
        )}
      </div>
    </div>
  );
};
