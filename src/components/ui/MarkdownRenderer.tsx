"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import type { Components } from "react-markdown";

const components: Components = {
  h1: ({ node, ...props }) => (
    <h1
      className="text-xl font-bold text-white mt-6 mb-3 pb-1 border-b border-zinc-700/50 first:mt-0"
      {...props}
    />
  ),
  h2: ({ node, ...props }) => (
    <h2
      className="text-lg font-bold text-white mt-5 mb-2 first:mt-0"
      {...props}
    />
  ),
  h3: ({ node, ...props }) => (
    <h3
      className="text-base font-semibold text-violet-300 mt-4 mb-2 first:mt-0"
      {...props}
    />
  ),
  h4: ({ node, ...props }) => (
    <h4
      className="text-sm font-semibold text-zinc-200 mt-3 mb-1 first:mt-0"
      {...props}
    />
  ),
  p: ({ node, ...props }) => (
    <p className="mb-3 last:mb-0 text-zinc-300 leading-relaxed" {...props} />
  ),
  ul: ({ node, ...props }) => (
    <ul
      className="list-disc pl-5 mb-4 space-y-1 text-zinc-300"
      {...props}
    />
  ),
  ol: ({ node, ...props }) => (
    <ol
      className="list-decimal pl-5 mb-4 space-y-1 text-zinc-300"
      {...props}
    />
  ),
  li: ({ node, ...props }) => (
    <li className="leading-relaxed text-zinc-300" {...props} />
  ),
  strong: ({ node, ...props }) => (
    <strong className="font-semibold text-white" {...props} />
  ),
  em: ({ node, ...props }) => (
    <em className="italic text-zinc-300" {...props} />
  ),
  hr: ({ node, ...props }) => (
    <hr className="border-zinc-700/60 my-5" {...props} />
  ),
  blockquote: ({ node, ...props }) => (
    <blockquote
      className="border-l-2 border-violet-500/60 pl-4 py-1 my-4 text-zinc-400 italic"
      {...props}
    />
  ),
  // Inline code (single backtick)
  code: ({ node, className, children, ...props }: any) => {
    const isBlock = !!className; // remark-gfm sets className like "language-typescript"
    if (isBlock) {
      // Block code — rendered by the `pre` handler below
      return (
        <code className={className} {...props}>
          {children}
        </code>
      );
    }
    // Inline code
    return (
      <code
        className="bg-zinc-800 text-violet-300 rounded px-1.5 py-0.5 text-[0.82em] font-mono border border-zinc-700/40"
        {...props}
      >
        {children}
      </code>
    );
  },
  // Fenced code blocks (triple backtick)
  pre: ({ node, children, ...props }) => (
    <pre
      className="bg-zinc-900 border border-zinc-700/50 rounded-xl p-4 my-4 overflow-x-auto text-xs font-mono leading-relaxed text-zinc-200"
      {...props}
    >
      {children}
    </pre>
  ),
  a: ({ node, ...props }) => (
    <a
      className="text-violet-400 underline underline-offset-2 hover:text-violet-300 transition-colors"
      target="_blank"
      rel="noopener noreferrer"
      {...props}
    />
  ),
  table: ({ node, ...props }) => (
    <div className="overflow-x-auto my-4">
      <table
        className="w-full text-sm border-collapse border border-zinc-700/40 rounded-lg"
        {...props}
      />
    </div>
  ),
  thead: ({ node, ...props }) => (
    <thead className="bg-zinc-800/60" {...props} />
  ),
  th: ({ node, ...props }) => (
    <th
      className="border border-zinc-700/40 px-3 py-2 text-left text-xs font-semibold text-white uppercase tracking-wider"
      {...props}
    />
  ),
  td: ({ node, ...props }) => (
    <td
      className="border border-zinc-700/40 px-3 py-2 text-zinc-300"
      {...props}
    />
  ),
  tr: ({ node, ...props }) => (
    <tr className="even:bg-zinc-800/20" {...props} />
  ),
};

interface MarkdownRendererProps {
  children: string;
  className?: string;
}

/**
 * A fully-styled markdown renderer for AI-generated answers.
 * Uses remark-gfm for GitHub-Flavored Markdown support (tables, task lists,
 * strikethrough, autolinks) and custom component overrides for dark-mode styling.
 *
 * IMPORTANT: Do NOT wrap this in a `whitespace-pre-wrap` container — that class
 * bypasses the markdown parser and causes double newlines and raw code blocks.
 */
export function MarkdownRenderer({ children, className }: MarkdownRendererProps) {
  return (
    <div className={className}>
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
        {children}
      </ReactMarkdown>
    </div>
  );
}
