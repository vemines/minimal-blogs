import React, { useState } from 'react';
import { Copy, Check, Terminal } from 'lucide-react';

interface CodeBlockProps {
  children?: React.ReactNode;
  className?: string;
  title?: string;
}

export const CodeBlock: React.FC<CodeBlockProps> = ({ children, className, title }) => {
  const [copied, setCopied] = useState(false);

  // Extract raw text from children
  const codeString = React.Children.toArray(children)
    .map((child) => (typeof child === 'string' ? child : ''))
    .join('')
    .trim();

  // Extract language from className (e.g. "language-bat")
  const match = /language-(\w+)/.exec(className || '');
  const language = match ? match[1] : '';

  const handleCopy = async () => {
    if (!codeString) return;
    try {
      await navigator.clipboard.writeText(codeString);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.warn('Copy failed:', err);
    }
  };

  return (
    <div className="my-5 rounded-2xl overflow-hidden border border-zinc-200 dark:border-zinc-800 bg-[#1e1e24] text-zinc-100 shadow-md not-prose print:bg-[#f8f9fa] print:text-black print:border print:border-zinc-300 print:shadow-none print:break-inside-avoid">
      {/* Code Header Bar: Title, Language, Copy Button */}
      <div className="px-4 py-2.5 bg-[#18181b] border-b border-zinc-800/80 flex items-center justify-between gap-3 text-xs print:bg-zinc-100 print:border-b-zinc-300 print:text-black">
        <div className="flex items-center gap-2 text-zinc-300 font-mono print:text-black">
          <Terminal className="w-3.5 h-3.5 text-emerald-400 print:text-black" />
          <span className="font-semibold print:text-black">{title || (language ? `${language.toUpperCase()} Script` : 'Lệnh / Script')}</span>
        </div>

        <div className="flex items-center gap-2">
          {language && (
            <span className="px-1.5 py-0.5 rounded text-[10px] uppercase font-mono font-bold bg-zinc-800 text-zinc-400 border border-zinc-700 print:bg-white print:text-black print:border-zinc-300">
              {language}
            </span>
          )}
          <button
            onClick={handleCopy}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium bg-zinc-800 hover:bg-zinc-700 text-zinc-200 hover:text-white transition-all cursor-pointer border border-zinc-700 no-print"
            title="Sao chép câu lệnh"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400">Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copy</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Code Content */}
      <pre className="p-4 overflow-x-auto text-xs sm:text-sm font-mono leading-relaxed text-zinc-200 bg-[#141416] m-0 print:bg-[#f8f9fa] print:text-black">
        <code className="print:text-black">{children}</code>
      </pre>
    </div>
  );
};
