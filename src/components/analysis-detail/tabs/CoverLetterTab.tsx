"use client";

import { useState } from "react";
import { Card } from "@/components/ui/Card";
import { Copy, CheckCircle2 } from "lucide-react";
import { useAnalysisCoverLetter } from "@/hooks/useAnalysis";
import { TabContentSkeleton } from "@/components/ui/Skeleton";
import ReactMarkdown from "react-markdown";

interface CoverLetterTabProps {
  analysisId: string;
}

export function CoverLetterTab({ analysisId }: CoverLetterTabProps) {
  const { data: analysis, isLoading } = useAnalysisCoverLetter(analysisId);
  const coverLetter = analysis?.results?.coverLetter;
  const [copied, setCopied] = useState(false);

  if (isLoading) {
    return <TabContentSkeleton />;
  }

  if (!coverLetter) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-zinc-500">
        <p>No Cover Letter generated.</p>
      </div>
    );
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(coverLetter.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold text-white">Custom Cover Letter</h3>
        <button
          onClick={handleCopy}
          className="flex items-center gap-2 rounded-xl bg-zinc-800 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700 transition-colors"
        >
          {copied ? (
            <>
              <CheckCircle2 className="h-4 w-4 text-emerald-400" />
              <span className="text-emerald-400">Copied!</span>
            </>
          ) : (
            <>
              <Copy className="h-4 w-4" />
              Copy to Clipboard
            </>
          )}
        </button>
      </div>

      <Card className="bg-zinc-950 p-8">
        <div className="mb-8 border-b border-zinc-800 pb-4">
          <p className="text-sm text-zinc-500 font-medium">Subject:</p>
          <p className="text-base font-semibold text-white mt-1">
            {coverLetter.subject}
          </p>
        </div>
        <div className="prose prose-invert max-w-none text-zinc-300">
          {/* <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed">
            {coverLetter.content}
          </pre> */}
          <ReactMarkdown
            components={{
              h1: ({ node, ...props }) => (
                <h1
                  className="text-xl font-bold text-white mt-6 mb-2 first:mt-0"
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
                  className="text-base font-bold text-white mt-4 mb-2 first:mt-0"
                  {...props}
                />
              ),
              p: ({ node, ...props }) => (
                <p className="mb-3 last:mb-0 text-sm text-zinc-300" {...props} />
              ),
              ul: ({ node, ...props }) => (
                <ul
                  className="list-disc pl-5 mb-4 space-y-1 text-sm text-zinc-300"
                  {...props}
                />
              ),
              ol: ({ node, ...props }) => (
                <ol
                  className="list-decimal pl-5 mb-4 space-y-1 text-zinc-300"
                  {...props}
                />
              ),
              li: ({ node, ...props }) => <li className="mb-0.5" {...props} />,
              strong: ({ node, ...props }) => (
                <strong className="font-semibold text-white" {...props} />
              ),
            }}
          >
            {coverLetter.content?.replace(/<br\s*\/?>/gi, "  \n")}
          </ReactMarkdown>
        </div>
      </Card>
    </div>
  );
}
