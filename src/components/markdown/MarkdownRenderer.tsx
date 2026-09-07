import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import rehypeSlug from 'rehype-slug';
import rehypeSanitize from 'rehype-sanitize';
import { customSanitizeSchema } from './sanitizeSchema';
import { CodeBlock } from './CodeBlock';
import { Callout } from './Callout';
import type { CalloutType } from './Callout';
import { ImageZoomModal } from './ImageZoomModal';
import { DownloadCard } from './DownloadCard';
import { TabSwitcher } from './TabSwitcher';
import { VideoPlayer } from './VideoPlayer';
import { isVideoUrl } from './videoUtils';
import { R2_PUBLIC_URL, getEffectiveDataBaseUrl } from '../../services/api';

interface MarkdownRendererProps {
  content: string;
}

// Helper to extract plain text recursively from React nodes or AST children
const extractNodeText = (node: any): string => {
  if (!node) return '';
  if (typeof node === 'string' || typeof node === 'number') return String(node);
  if (Array.isArray(node)) return node.map(extractNodeText).join(' ');
  if (React.isValidElement(node)) return extractNodeText((node.props as any)?.children);
  return '';
};

// Detect if a table is a Do's & Don'ts comparison table
const isDosAndDontsContent = (children: any): boolean => {
  const text = extractNodeText(children).toLowerCase();
  const hasDo = text.includes('nên làm') || text.includes('khuyến nghị') || text.includes("do's") || text.includes('✅');
  const hasDont = text.includes('không nên') || text.includes('cần tránh') || text.includes("don't") || text.includes('❌');
  return hasDo && hasDont;
};

// Helper to determine the number of columns in a markdown table
const getTableColumnCount = (node: any, children?: any): number => {
  if (node && Array.isArray(node.children)) {
    // 1. Search thead -> tr -> th/td
    for (const child of node.children) {
      if (child?.type === 'element' && child.tagName === 'thead' && Array.isArray(child.children)) {
        for (const tr of child.children) {
          if (tr?.type === 'element' && tr.tagName === 'tr' && Array.isArray(tr.children)) {
            const cells = tr.children.filter((cell: any) => cell?.type === 'element' && (cell.tagName === 'th' || cell.tagName === 'td'));
            if (cells.length > 0) return cells.length;
          }
        }
      }
    }

    // 2. Search tbody or direct tr
    for (const child of node.children) {
      if (child?.type === 'element' && child.tagName === 'tbody' && Array.isArray(child.children)) {
        for (const tr of child.children) {
          if (tr?.type === 'element' && tr.tagName === 'tr' && Array.isArray(tr.children)) {
            const cells = tr.children.filter((cell: any) => cell?.type === 'element' && (cell.tagName === 'th' || cell.tagName === 'td'));
            if (cells.length > 0) return cells.length;
          }
        }
      }
      if (child?.type === 'element' && child.tagName === 'tr' && Array.isArray(child.children)) {
        const cells = child.children.filter((cell: any) => cell?.type === 'element' && (cell.tagName === 'th' || cell.tagName === 'td'));
        if (cells.length > 0) return cells.length;
      }
    }
  }

  // 3. Fallback: inspect React children
  if (children) {
    let fallbackCount = 0;
    React.Children.forEach(children, (child) => {
      if (fallbackCount > 0) return;
      if (!React.isValidElement(child)) return;
      const childProps = child.props as any;
      if (childProps && childProps.children) {
        React.Children.forEach(childProps.children, (trChild) => {
          if (fallbackCount > 0) return;
          if (React.isValidElement(trChild)) {
            const trProps = trChild.props as any;
            if (trProps && trProps.children) {
              const count = React.Children.count(trProps.children);
              if (count > 0) fallbackCount = count;
            }
          }
        });
      }
    });
    if (fallbackCount > 0) return fallbackCount;
  }

  return 0;
};

// Check if an AST node contains an input element
const hasInputChild = (node: any): boolean => {
  if (!node) return false;
  if (node.tagName === 'input') return true;
  if (Array.isArray(node.children)) {
    return node.children.some(hasInputChild);
  }
  return false;
};

// Interactive Checkbox component so users can check/uncheck tasks in markdown
const InteractiveCheckbox: React.FC<React.InputHTMLAttributes<HTMLInputElement>> = ({
  checked,
  defaultChecked,
  disabled: _disabled,
  className,
  ...props
}) => {
  const [isChecked, setIsChecked] = useState<boolean>(Boolean(checked ?? defaultChecked));

  return (
    <input
      type="checkbox"
      checked={isChecked}
      onChange={(e) => setIsChecked(e.target.checked)}
      className={`mr-2.5 rounded text-[#1976d2] dark:text-[#90caf9] focus:ring-[#1976d2] w-4 h-4 cursor-pointer accent-[#1976d2] align-middle hover:scale-110 transition-transform ${className || ''}`}
      {...props}
    />
  );
};

export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content }) => {
  const [zoomImage, setZoomImage] = useState<{ src: string; alt?: string } | null>(null);

  // Helper to normalize image URLs with R2 prefix if configured, otherwise keep relative
  const getFullImageUrl = (src?: string) => {
    if (!src) return '';
    if (src.startsWith('http://') || src.startsWith('https://') || src.startsWith('data:')) {
      return src;
    }
    if (!R2_PUBLIC_URL) {
      const base = getEffectiveDataBaseUrl();
      const cleanSrc = src.replace(/^\/+/, '');
      return base ? `${base}/${cleanSrc}` : (src.startsWith('/') ? src : `/${src}`);
    }
    const cleanR2 = R2_PUBLIC_URL.replace(/\/+$/, '');
    const cleanSrc = src.replace(/^\/+/, '');
    return `${cleanR2}/${cleanSrc}`;
  };

  return (
    <>
      <div className="markdown-body prose prose-zinc dark:prose-invert max-w-none text-zinc-800 dark:text-zinc-200 text-sm sm:text-base leading-relaxed">
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          rehypePlugins={[rehypeRaw, [rehypeSanitize, customSanitizeSchema], rehypeSlug]}
          components={{
            // 1. Code Blocks
            code({ node, className, children, ...props }) {
              const isInline = !className && typeof children === 'string' && !children.includes('\n');
              if (isInline) {
                return (
                  <code className="px-1.5 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-emerald-700 dark:text-emerald-400 font-mono text-xs font-semibold" {...props}>
                    {children}
                  </code>
                );
              }

              const match = /language-(\w+)/.exec(className || '');
              const lang = match ? match[1].toLowerCase() : '';

              // Special handler for ```download codeblock
              if (lang === 'download') {
                const rawText = String(children || '').trim();
                const lines = rawText.split('\n');
                const cardData: Record<string, string> = {};
                for (const line of lines) {
                  const colonIdx = line.indexOf(':');
                  if (colonIdx !== -1) {
                    const key = line.slice(0, colonIdx).trim().toLowerCase();
                    const val = line.slice(colonIdx + 1).trim();
                    cardData[key] = val;
                  }
                }
                return (
                  <DownloadCard
                    title={cardData.title || 'Tài nguyên tải về'}
                    size={cardData.size}
                    url={cardData.url || '#'}
                    description={cardData.description}
                  />
                );
              }

              // Special handler for ```tabs codeblock
              if (lang === 'tabs') {
                const rawText = String(children || '');
                const tabMatches = rawText.split(/(?:^|\n)===\s*([^\n]+)\n/g);
                const parsedTabs: { label: string; content: string }[] = [];
                if (tabMatches.length > 1) {
                  for (let i = 1; i < tabMatches.length; i += 2) {
                    const label = tabMatches[i].trim();
                    const tabContent = (tabMatches[i + 1] || '').trim();
                    if (label) {
                      parsedTabs.push({ label, content: tabContent });
                    }
                  }
                }
                if (parsedTabs.length > 0) {
                  return <TabSwitcher tabs={parsedTabs} />;
                }
              }

              // Special handler for ```video codeblock
              if (lang === 'video') {
                const rawText = String(children || '').trim();
                const lines = rawText.split('\n');
                const videoData: Record<string, string> = {};

                const firstLine = lines[0].trim();
                if (lines.length === 1 && !firstLine.includes(':')) {
                  return <VideoPlayer src={firstLine} />;
                }

                for (const line of lines) {
                  const colonIdx = line.indexOf(':');
                  if (colonIdx !== -1) {
                    const key = line.slice(0, colonIdx).trim().toLowerCase();
                    const val = line.slice(colonIdx + 1).trim();
                    videoData[key] = val;
                  } else if (line.trim().startsWith('http://') || line.trim().startsWith('https://') || line.trim().startsWith('/')) {
                    if (!videoData.url && !videoData.src) {
                      videoData.src = line.trim();
                    }
                  }
                }

                return (
                  <VideoPlayer
                    src={videoData.url || videoData.src}
                    title={videoData.title}
                    poster={videoData.poster}
                    autoPlay={videoData.autoplay === 'true'}
                    loop={videoData.loop === 'true'}
                    muted={videoData.muted === 'true'}
                    controls={videoData.controls !== 'false'}
                  />
                );
              }

              // Extract title from code attributes if present (e.g. ```bat title="test.bat")
              let title = '';
              if (node?.data?.meta && typeof node.data.meta === 'string') {
                const titleMatch = node.data.meta.match(/title="([^"]+)"/);
                if (titleMatch) title = titleMatch[1];
              }

              return (
                <CodeBlock className={className} title={title}>
                  {children}
                </CodeBlock>
              );
            },

            // Unwrap <pre> for custom rich components (tabs, download, video) so they don't inherit monospace / whitespace-pre
            pre({ node, children, ...props }) {
              const codeChild = (node?.children?.[0] as any);
              const className = codeChild?.properties?.className;
              const cls = Array.isArray(className) ? className.join(' ') : String(className || '');
              if (cls.includes('language-tabs') || cls.includes('language-download') || cls.includes('language-video')) {
                return <>{children}</>;
              }
              return <pre {...props}>{children}</pre>;
            },

            // Keycaps (<kbd>)
            kbd({ children }) {
              return (
                <kbd className="inline-flex items-center justify-center px-1.5 py-0.5 text-xs font-mono font-semibold rounded-md border border-zinc-300 dark:border-zinc-700 border-b-2 border-b-zinc-400 dark:border-b-zinc-600 bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 shadow-xs select-none align-middle print:bg-[#f1f5f9] print:text-[#1e293b] print:border-[#cbd5e1] print:border-b-2 print:border-b-[#94a3b8] print:shadow-none">
                  {children}
                </kbd>
              );
            },

            // 2. Callout / Alert parser in blockquotes
            blockquote({ children }) {
              const childrenArray = React.Children.toArray(children);
              
              // Find the first valid React element with children (skipping raw whitespace strings like "\n")
              const firstElementIdx = childrenArray.findIndex(
                (c) => React.isValidElement(c) && Boolean((c.props as { children?: React.ReactNode })?.children)
              );

              if (firstElementIdx !== -1) {
                const firstElement = childrenArray[firstElementIdx] as React.ReactElement<{ children?: React.ReactNode }>;
                const pChildren = React.Children.toArray(firstElement.props.children);
                
                // Find first non-empty string child within paragraph
                const firstStringIdx = pChildren.findIndex((c) => typeof c === 'string' && c.trim().length > 0);
                if (firstStringIdx !== -1) {
                  const firstText = pChildren[firstStringIdx] as string;
                  const calloutMatch = firstText.match(/^\s*\[!(NOTE|TIP|IMPORTANT|WARNING|CAUTION)\]\s*([\s\S]*)/i);
                  
                  if (calloutMatch) {
                    const type = calloutMatch[1].toUpperCase() as CalloutType;
                    const afterMarker = calloutMatch[2].replace(/^\s*[\r\n]+/, '');

                    // Reconstruct paragraph without the [!TYPE] marker
                    const updatedPChildren: React.ReactNode[] = [];
                    for (let i = 0; i < firstStringIdx; i++) {
                      updatedPChildren.push(pChildren[i]);
                    }
                    if (afterMarker.trim().length > 0) {
                      updatedPChildren.push(afterMarker);
                    }
                    for (let i = firstStringIdx + 1; i < pChildren.length; i++) {
                      updatedPChildren.push(pChildren[i]);
                    }

                    // Remaining blocks in blockquote
                    const restBlocks = [
                      ...childrenArray.slice(0, firstElementIdx),
                      ...childrenArray.slice(firstElementIdx + 1),
                    ].filter((item) => typeof item !== 'string' || item.trim().length > 0);

                    return (
                      <Callout type={type}>
                        {updatedPChildren.length > 0 && <p className="m-0">{updatedPChildren}</p>}
                        {restBlocks}
                      </Callout>
                    );
                  }
                }
              }

              return (
                <blockquote className="border-l-4 border-[#1976d2] pl-4 py-2 my-4 italic text-zinc-600 dark:text-zinc-400 bg-blue-50/40 dark:bg-blue-950/20 rounded-r-lg">
                  {children}
                </blockquote>
              );
            },

            // 3. Images with Lightbox Zoom & R2 URL prefixing (or VideoPlayer if source is video)
            img({ src, alt }) {
              if (isVideoUrl(src)) {
                return <VideoPlayer src={src} title={alt} />;
              }
              const fullSrc = getFullImageUrl(src);
              return (
                <span className="block my-6 text-center not-prose print:my-4 print:block">
                  <img
                    src={fullSrc}
                    alt={alt || ''}
                    onClick={() => setZoomImage({ src: fullSrc, alt })}
                    className="mx-auto rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-md max-h-[500px] object-contain cursor-zoom-in hover:opacity-95 transition-opacity print:max-h-[350px] print:shadow-none print:border print:border-zinc-300 print:rounded-lg print:break-inside-avoid"
                    loading="eager"
                    decoding="async"
                  />
                  {alt && (
                    <span className="block text-xs text-zinc-500 dark:text-zinc-400 mt-2 italic print:text-zinc-600 print:mt-1">
                      {alt}
                    </span>
                  )}
                </span>
              );
            },

            // 3.1. HTML5 Video tag support: <video src="..." poster="..." ... />
            video({ src, poster, controls = true, autoPlay, loop, muted, className, ...props }: any) {
              return (
                <VideoPlayer
                  src={src}
                  poster={poster}
                  controls={controls}
                  autoPlay={autoPlay}
                  loop={loop}
                  muted={muted}
                  className={className}
                  {...props}
                />
              );
            },

            // 3.2. Responsive Iframe support for YouTube, Vimeo, Loom, Cloudflare Stream
            iframe({ src, title, className, ...props }: any) {
              if (!src) return null;
              return (
                <div className={`not-prose my-6 aspect-video w-full rounded-2xl overflow-hidden border border-zinc-200 dark:border-[rgba(255,255,255,0.12)] shadow-md bg-black/90 print:hidden ${className || ''}`}>
                  <iframe
                    src={src}
                    title={title || 'Trình phát video'}
                    className="w-full h-full border-0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                    loading="lazy"
                    {...props}
                  />
                </div>
              );
            },

            // 4. Tables (Standard & Do's and Don'ts)
            table({ node, children, ...props }: any) {
              const isDosDonts = isDosAndDontsContent(children);
              const colCount = getTableColumnCount(node, children);
              const minWidthPx = colCount > 0 ? colCount * 150 : undefined;

              return (
                <div className={`overflow-x-auto my-6 rounded-2xl border shadow-sm not-prose print:my-3 print:rounded-lg print:shadow-none print:break-inside-avoid print:overflow-visible ${
                  isDosDonts
                    ? 'border-emerald-200/80 dark:border-emerald-900/40 dos-donts-container print:border-emerald-200'
                    : 'border-zinc-200 dark:border-zinc-800 print:border-zinc-300'
                }`}>
                  <table
                    {...props}
                    style={{
                      ...(minWidthPx ? { minWidth: `${minWidthPx}px` } : {}),
                      ...(props.style || {}),
                    }}
                    className={`w-full text-left text-xs sm:text-sm divide-y print:!min-w-full print:bg-white print:divide-zinc-200 ${
                      isDosDonts
                        ? 'dos-donts-table divide-emerald-100 dark:divide-emerald-900/30 bg-white dark:bg-[#18191e]'
                        : 'divide-zinc-200 dark:divide-zinc-800 bg-white dark:bg-[#1f1f23]'
                    }`}
                  >
                    {children}
                  </table>
                </div>
              );
            },
            th({ children }) {
              return (
                <th className="px-4 py-3 bg-zinc-100 dark:bg-zinc-800 font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-wider text-[11px] print:bg-[#f8fafc] print:text-[#0f172a] print:border print:border-[#cbd5e1] print:py-2 print:px-3 print:text-[10px]">
                  {children}
                </th>
              );
            },
            td({ children }) {
              return (
                <td className="px-4 py-3 text-zinc-700 dark:text-zinc-300 border-t border-zinc-100 dark:border-zinc-800/60 print:text-[#1e293b] print:border print:border-[#e2e8f0] print:py-2 print:px-3 print:text-[10px] print:bg-white">
                  {children}
                </td>
              );
            },

            // 5. Headings: H1 is suppressed to avoid duplicate post title
            h1() {
              return null;
            },
            h2({ children, id }) {
              return (
                <h2 id={id} className="text-xl sm:text-2xl font-bold text-zinc-900 dark:text-zinc-100 tracking-tight mt-8 mb-3 scroll-mt-6">
                  {children}
                </h2>
              );
            },
            h3({ children, id }) {
              return (
                <h3 id={id} className="text-lg sm:text-xl font-semibold text-zinc-900 dark:text-zinc-100 mt-6 mb-2 scroll-mt-6">
                  {children}
                </h3>
              );
            },

            // 6. Centered & well-spaced Dividers and Line breaks
            hr() {
              return (
                <div className="my-9 flex items-center justify-center not-prose">
                  <hr className="w-full border-0 border-t border-zinc-200 dark:border-zinc-800" />
                </div>
              );
            },
            br() {
              return <span className="block my-2.5" />;
            },

            // 7. Safe Links: only permit safe schemes, block javascript:
            a({ href, children, ...props }) {
              const isSafe = !href || /^(https?:\/\/|\/|#|mailto:|tel:)/i.test(href.trim());
              const safeHref = isSafe ? href : '#';
              const isExternal = safeHref?.startsWith('http');
              return (
                <a
                  href={safeHref}
                  target={isExternal ? '_blank' : undefined}
                  rel={isExternal ? 'noopener noreferrer' : undefined}
                  className="text-[#1976d2] dark:text-[#90caf9] hover:underline font-medium"
                  {...props}
                >
                  {children}
                </a>
              );
            },

            // 8. Lists (Procedural steps, bulleted lists, and task lists)
            ol({ children, ...props }: any) {
              return (
                <ol className="list-decimal pl-6 sm:pl-7 my-4 space-y-3 marker:text-zinc-500 dark:marker:text-zinc-400 marker:font-semibold" {...props}>
                  {children}
                </ol>
              );
            },
            ul({ className, children, ...props }: any) {
              const isTaskList = className?.includes('contains-task-list');
              return (
                <ul
                  className={
                    isTaskList
                      ? 'list-none pl-0 my-3 space-y-1.5'
                      : 'list-disc pl-6 sm:pl-7 my-3 space-y-2 marker:text-zinc-400 dark:marker:text-zinc-500'
                  }
                  {...props}
                >
                  {children}
                </ul>
              );
            },
            li({ node, children, className, ...props }: any) {
              const isInputLi = className?.includes('task-list-item') || hasInputChild(node);
              if (isInputLi) {
                return (
                  <li
                    className={`${className || ''} list-none cursor-pointer select-none py-0.5 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors`}
                    onClick={(e) => {
                      const target = e.target as HTMLElement;
                      if (target.tagName.toLowerCase() !== 'input') {
                        const input = e.currentTarget.querySelector('input');
                        if (input) {
                          input.click();
                        }
                      }
                    }}
                    {...props}
                  >
                    {children}
                  </li>
                );
              }
              return (
                <li className={`leading-relaxed pl-1 ${className || ''}`} {...props}>
                  {children}
                </li>
              );
            },

            // 9. All Input components (Checkboxes, Radios, Text fields, etc.)
            input({ type, checked, defaultChecked, disabled: _disabled, className, name, ...props }: any) {
              if (type === 'checkbox') {
                return (
                  <InteractiveCheckbox
                    defaultChecked={Boolean(checked ?? defaultChecked)}
                    className={className}
                    {...props}
                  />
                );
              }
              if (type === 'radio') {
                return (
                  <input
                    type="radio"
                    name={name}
                    defaultChecked={Boolean(checked ?? defaultChecked)}
                    className={`mr-2.5 text-[#1976d2] dark:text-[#90caf9] focus:ring-[#1976d2] w-4 h-4 cursor-pointer accent-[#1976d2] align-middle hover:scale-110 transition-transform ${className || ''}`}
                    {...props}
                  />
                );
              }
              return (
                <input
                  type={type}
                  className="px-3 py-1.5 text-xs bg-white dark:bg-[#18191e] border border-zinc-300 dark:border-zinc-700 rounded-lg text-zinc-900 dark:text-zinc-100 outline-none focus:border-[#1976d2] dark:focus:border-[#90caf9] transition-all"
                  {...props}
                />
              );
            },

            // 8. Collapsible Accordion (<details> and <summary>)
            details({ children, ...props }) {
              return (
                <details
                  className="accordion-item group my-4 p-4 rounded-xl bg-zinc-50/80 dark:bg-[#18191e] border border-zinc-200 dark:border-[rgba(255,255,255,0.12)] transition-all duration-200 open:shadow-sm print:my-2.5 print:p-3 print:bg-[#f8fafc] print:border print:border-[#cbd5e1] print:shadow-none print:break-inside-avoid print:open"
                  {...props}
                >
                  {children}
                </details>
              );
            },
            summary({ children, ...props }) {
              return (
                <summary
                  className="font-semibold text-xs sm:text-sm text-zinc-900 dark:text-zinc-100 cursor-pointer list-none flex items-center gap-2 select-none hover:text-[#1976d2] dark:hover:text-[#90caf9] transition-colors print:text-[#0f172a] print:font-bold print:border-b print:border-b-[#cbd5e1] print:pb-1.5 print:mb-2"
                  {...props}
                >
                  <span className="text-xs transition-transform duration-200 group-open:rotate-90 text-[#1976d2] dark:text-[#90caf9] print:text-[#1976d2]">
                    ▶
                  </span>
                  <span>{children}</span>
                </summary>
              );
            },

            // 9. HTML-based TabSwitcher
            div({ className, children, ...props }) {
              const cls = String(className || '');
              const dataProps = props as Record<string, any>;
              const dataComp = dataProps['data-component'];

              // HTML Tabs: <div class="tabs"><div data-tab="...">...</div></div>
              if (cls.includes('tabs') || dataComp === 'tabs') {
                const childArray = React.Children.toArray(children);
                const parsedTabs: { label: string; content: React.ReactNode }[] = [];

                childArray.forEach((child) => {
                  if (React.isValidElement(child)) {
                    const childProps = child.props as Record<string, any>;
                    const label = childProps['data-tab'] || childProps['data-label'] || childProps.title;
                    if (label) {
                      parsedTabs.push({
                        label,
                        content: childProps.children,
                      });
                    }
                  }
                });

                if (parsedTabs.length > 0) {
                  return <TabSwitcher tabs={parsedTabs} />;
                }
              }

              return <div className={className} {...props}>{children}</div>;
            },
          }}
        >
          {content}
        </ReactMarkdown>
      </div>

      {/* Image Lightbox Modal */}
      <ImageZoomModal
        src={zoomImage?.src || null}
        alt={zoomImage?.alt}
        onClose={() => setZoomImage(null)}
      />
    </>
  );
};
