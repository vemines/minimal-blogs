import React, { useState, useRef } from 'react';
import { CheckCircle2, XCircle, ArrowRight, X } from 'lucide-react';

export interface QuizInputCardProps {
  question?: string;
  answer: string;
  placeholder?: string;
  successMessage?: string;
  errorMessage?: string;
}

export const QuizInputCard: React.FC<QuizInputCardProps> = ({
  question,
  answer,
  placeholder = 'Nhập câu trả lời của bạn...',
  successMessage = 'Chính xác! Bạn đã trả lời đúng.',
  errorMessage = 'Chưa chính xác, vui lòng thử lại.',
}) => {
  const [inputValue, setInputValue] = useState('');
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const inputRef = useRef<HTMLInputElement>(null);

  // Exact single answer, trimmed
  const expectedAnswer = (answer || '').trim();

  const handleCheck = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const cleanInput = inputValue.trim();

    if (!cleanInput) {
      setStatus('idle');
      return;
    }

    const isMatch = cleanInput === expectedAnswer;
    setStatus(isMatch ? 'success' : 'error');
  };

  const handleReset = () => {
    setInputValue('');
    setStatus('idle');
    inputRef.current?.focus();
  };

  return (
    <div
      className={`not-prose my-5 p-4 sm:p-5 rounded-2xl border transition-all duration-300 ${
        status === 'success'
          ? 'bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-300 dark:border-emerald-800 shadow-sm'
          : status === 'error'
          ? 'bg-rose-50/50 dark:bg-rose-950/20 border-rose-300 dark:border-rose-800 shadow-sm'
          : 'bg-white dark:bg-[#18191e] border-zinc-200 dark:border-[rgba(255,255,255,0.12)] shadow-xs'
      }`}
    >
      {/* Question Header */}
      {question && (
        <h4 className="text-sm sm:text-base font-semibold text-zinc-900 dark:text-zinc-100 mb-3.5 leading-snug">
          {question}
        </h4>
      )}

      {/* Input Form */}
      <form onSubmit={handleCheck} className="flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1">
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={(e) => {
              setInputValue(e.target.value);
              if (status !== 'idle') setStatus('idle');
            }}
            placeholder={placeholder}
            className={`w-full pl-3.5 pr-9 py-2 sm:py-2.5 text-xs sm:text-sm rounded-xl border bg-white dark:bg-[#121316] text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-500 outline-none transition-all ${
              status === 'success'
                ? 'border-emerald-500 focus:ring-2 focus:ring-emerald-500/20'
                : status === 'error'
                ? 'border-rose-500 focus:ring-2 focus:ring-rose-500/20'
                : 'border-zinc-300 dark:border-zinc-700 focus:border-[#1976d2] dark:focus:border-[#90caf9] focus:ring-2 focus:ring-[#1976d2]/20'
            }`}
          />
          {(inputValue.length > 0 || status !== 'idle') && (
            <button
              type="button"
              onClick={handleReset}
              title="Xóa nội dung"
              aria-label="Xóa nội dung"
              className="absolute right-2.5 top-1/2 -translate-y-1/2 w-6 h-6 flex items-center justify-center rounded-full text-zinc-400 hover:text-zinc-700 dark:text-zinc-500 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <button
          type="submit"
          className="inline-flex items-center justify-center gap-1.5 px-4 py-2 sm:py-2.5 text-xs sm:text-sm font-semibold rounded-xl bg-[#1976d2] hover:bg-[#1565c0] text-white shadow-xs hover:shadow transition-all cursor-pointer select-none active:scale-98 shrink-0"
        >
          <span>Kiểm tra</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </form>

      {/* Result Status Message */}
      {status === 'success' && (
        <div className="mt-3 flex items-start gap-2 text-xs sm:text-sm font-medium text-emerald-700 dark:text-emerald-400 animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 shrink-0 text-emerald-600 dark:text-emerald-400 mt-0.5" />
          <p className="m-0 leading-relaxed">{successMessage}</p>
        </div>
      )}

      {status === 'error' && (
        <div className="mt-3 flex items-start gap-2 text-xs sm:text-sm font-medium text-rose-700 dark:text-rose-400 animate-fadeIn">
          <XCircle className="w-4 h-4 sm:w-5 sm:h-5 shrink-0 text-rose-600 dark:text-rose-400 mt-0.5" />
          <p className="m-0 leading-relaxed">{errorMessage}</p>
        </div>
      )}
    </div>
  );
};
