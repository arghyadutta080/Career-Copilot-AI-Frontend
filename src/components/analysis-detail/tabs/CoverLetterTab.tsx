"use client";

import { useState } from "react";
import { Card } from "@/components/ui/Card";
import { Copy, CheckCircle2 } from "lucide-react";
import { useAnalysisCoverLetter } from "@/hooks/useAnalysis";
import { TabContentSkeleton } from "@/components/ui/Skeleton";

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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h3 className="text-xl font-bold text-white">Custom Cover Letter</h3>
        <button
          onClick={handleCopy}
          className="flex items-center justify-center gap-2 rounded-xl bg-zinc-800 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700 transition-colors cursor-pointer w-full sm:w-auto"
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

      <Card className="bg-zinc-950 p-4 sm:p-6 lg:p-8">
        <div className="mb-8 border-b border-zinc-800 pb-4">
          <p className="text-sm text-zinc-500 font-medium">Subject:</p>
          <p className="text-base font-semibold text-white mt-1">
            {coverLetter.subject}
          </p>
        </div>
        <div className="prose prose-invert max-w-none text-zinc-300">
          <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed">
            {coverLetter.content}
          </pre>
        </div>
      </Card>
    </div>
  );
}
