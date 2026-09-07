import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import rehypeSanitize from 'rehype-sanitize';
import { customSanitizeSchema } from './sanitizeSchema';

export interface TabItem {
  label: string;
  content: React.ReactNode;
}

export interface TabSwitcherProps {
  tabs: TabItem[];
  defaultTab?: number;
}

export const TabSwitcher: React.FC<TabSwitcherProps> = ({ tabs, defaultTab = 0 }) => {
  const [activeIdx, setActiveIdx] = useState<number>(
    defaultTab >= 0 && defaultTab < tabs.length ? defaultTab : 0
  );

  if (!tabs || tabs.length === 0) return null;

  const activeTab = tabs[activeIdx] || tabs[0];

  return (
    <div className="not-prose my-6 w-full max-w-full min-w-0">
      {/* Tab Navigation Pill Bar */}
      <div className="flex items-center gap-1.5 p-1.5 rounded-xl bg-zinc-100 dark:bg-[#1f2128] border border-zinc-200/80 dark:border-[rgba(255,255,255,0.08)] overflow-x-auto w-fit max-w-full">
        {tabs.map((tab, idx) => {
          const isActive = idx === activeIdx;
          return (
            <button
              key={`tab-btn-${idx}`}
              type="button"
              onClick={() => setActiveIdx(idx)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors duration-150 cursor-pointer select-none flex items-center gap-1.5 border ${
                isActive
                  ? 'bg-white dark:bg-[#18191e] text-[#1976d2] dark:text-[#90caf9] shadow-xs border-zinc-200/80 dark:border-zinc-700/80'
                  : 'border-transparent text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 hover:bg-zinc-200/50 dark:hover:bg-zinc-800/40'
              }`}
            >
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab Content Box with natural text wrapping and clean keycap rendering */}
      <div className="mt-2.5 p-4 sm:p-5 rounded-2xl border border-zinc-200 dark:border-[rgba(255,255,255,0.1)] bg-zinc-50/70 dark:bg-[#15161b] text-zinc-800 dark:text-zinc-200 text-xs sm:text-sm leading-relaxed w-full max-w-full min-w-0 break-words whitespace-normal print:bg-[#f8fafc] print:border print:border-[#cbd5e1] print:text-[#1e293b] print:p-3.5 print:my-2 print:shadow-none print:break-inside-avoid">
        <div key={`tab-panel-${activeIdx}`} className="tab-fade-in w-full min-w-0">
          {typeof activeTab.content === 'string' ? (
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              rehypePlugins={[rehypeRaw, [rehypeSanitize, customSanitizeSchema]]}
              components={{
                p({ children }) {
                  return <p className="my-2 first:mt-0 last:mb-0 break-words whitespace-normal leading-relaxed print:text-[#1e293b] print:my-1">{children}</p>;
                },
                code({ children }) {
                  const textStr = String(children || '');
                  const isMultiLine = textStr.includes('\n');
                  if (isMultiLine) {
                    return (
                      <pre className="my-2.5 p-3 rounded-xl bg-zinc-900 text-emerald-400 font-mono text-xs overflow-x-auto max-w-full print:bg-[#f8f9fa] print:text-[#0f172a] print:border print:border-[#cbd5e1] print:p-2.5 print:my-1.5 print:break-inside-avoid">
                        <code>{children}</code>
                      </pre>
                    );
                  }
                  return (
                    <code className="px-1.5 py-0.5 rounded bg-zinc-200/60 dark:bg-zinc-800 text-emerald-700 dark:text-emerald-400 font-mono text-xs font-semibold break-all inline-block max-w-full overflow-x-auto align-middle print:bg-[#f1f5f9] print:text-[#0f172a] print:border print:border-[#cbd5e1]">
                      {children}
                    </code>
                  );
                },
                pre({ children }) {
                  return <div className="my-2 max-w-full overflow-x-auto print:my-1">{children}</div>;
                },
                ol({ children }) {
                  return <ol className="list-decimal pl-5 my-2 space-y-2 break-words whitespace-normal print:my-1 print:space-y-1">{children}</ol>;
                },
                ul({ children }) {
                  return <ul className="list-disc pl-5 my-2 space-y-2 break-words whitespace-normal print:my-1 print:space-y-1">{children}</ul>;
                },
                li({ children }) {
                  return <li className="break-words whitespace-normal leading-relaxed print:text-[#1e293b]">{children}</li>;
                },
                kbd({ children }) {
                  return (
                    <kbd className="px-1.5 py-0.5 text-[11px] font-mono font-semibold bg-zinc-200 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded shadow-xs print:bg-[#f1f5f9] print:text-[#1e293b] print:border-[#cbd5e1] print:border-b-2 print:border-b-[#94a3b8] print:shadow-none">
                      {children}
                    </kbd>
                  );
                },
              }}
            >
              {activeTab.content}
            </ReactMarkdown>
          ) : (
            activeTab.content
          )}
        </div>
      </div>
    </div>
  );
};
