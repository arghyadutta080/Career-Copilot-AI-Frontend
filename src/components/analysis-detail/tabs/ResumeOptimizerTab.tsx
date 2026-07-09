import { useState } from "react";
import { Card } from "@/components/ui/Card";
import { Copy, Check, FileEdit, TrendingUp } from "lucide-react";
import { useAnalysisOptimizer } from "@/hooks/useAnalysis";
import { TabContentSkeleton } from "@/components/ui/Skeleton";
import ReactMarkdown from "react-markdown";

interface ResumeOptimizerTabProps {
  analysisId: string;
}

export function ResumeOptimizerTab({ analysisId }: ResumeOptimizerTabProps) {
  const { data: analysis, isLoading } = useAnalysisOptimizer(analysisId);
  const optimizer = analysis?.results?.optimizer;
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    if (!optimizer?.optimizedContent) return;
    try {
      const markdownContent = optimizer.optimizedContent.replace(/<br\s*\/?>/gi, "  \n");
      await navigator.clipboard.writeText(markdownContent);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy text: ", err);
    }
  };

  if (isLoading) {
    return <TabContentSkeleton />;
  }

  if (!optimizer) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-zinc-500">
        <p>No Resume Optimizer results available.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold text-white">Optimized Resume</h3>
        <button
          onClick={handleCopy}
          className="flex items-center gap-2 rounded-xl bg-violet-600 px-4 py-2 text-sm font-medium text-white hover:bg-violet-500 transition-all duration-200 active:scale-95 shadow-md shadow-violet-600/10"
        >
          {copied ? (
            <>
              <Check className="h-4 w-4" />
              Copied!
            </>
          ) : (
            <>
              <Copy className="h-4 w-4" />
              Copy Optimized Content
            </>
          )}
        </button>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-1 space-y-6">
          <Card>
            <h4 className="text-md font-medium text-zinc-400 mb-2">ATS Impact Prediction</h4>
            <div className="flex items-center gap-4">
              <div className="text-3xl font-bold text-zinc-500 line-through">
                {optimizer.atsImpact.currentScore}%
              </div>
              <TrendingUp className="h-6 w-6 text-emerald-500" />
              <div className="text-3xl font-bold text-emerald-400">
                {optimizer.atsImpact.expectedScore}%
              </div>
            </div>
            <p className="text-sm text-zinc-400 mt-2">{optimizer.atsImpact.reason}</p>
          </Card>

          <Card>
            <h4 className="text-md font-medium text-white flex items-center gap-2 mb-3">
              <FileEdit className="h-4 w-4 text-violet-400" />
              Keyword Suggestions
            </h4>
            <div className="flex flex-wrap gap-2">
              {optimizer.keywordSuggestions.map((keyword, i) => (
                <span
                  key={i}
                  className="inline-flex items-center rounded-lg bg-zinc-800 px-2 py-1 text-xs font-medium text-zinc-300"
                >
                  {keyword}
                </span>
              ))}
            </div>
          </Card>

          {optimizer.experienceSuggestions.length > 0 && (
            <Card>
              <h4 className="text-md font-medium text-white mb-3">Experience Tweaks</h4>
              <div className="space-y-4">
                {optimizer.experienceSuggestions.map((exp, i) => (
                  <div key={i} className="text-sm">
                    <p className="font-semibold text-zinc-200">{exp.role}</p>
                    <p className="text-sm text-zinc-500 mb-1">{exp.company}</p>
                    <ul className="list-disc pl-4 space-y-1 text-zinc-400 text-sm">
                      {exp.suggestions.map((sug, j) => (
                        <li key={j}>{sug}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>

        <div className="md:col-span-2">
          <Card className="h-full bg-zinc-950 p-6 overflow-x-auto">
            <h4 className="text-sm font-medium text-zinc-500 mb-4 uppercase tracking-wider">
              Optimized Content Preview
            </h4>
            <div className="text-sm text-zinc-300 space-y-4 font-sans leading-relaxed">
              <ReactMarkdown
                components={{
                  h1: ({ node, ...props }) => <h1 className="text-xl font-bold text-white mt-6 mb-2 first:mt-0" {...props} />,
                  h2: ({ node, ...props }) => <h2 className="text-lg font-bold text-white mt-5 mb-2 first:mt-0" {...props} />,
                  h3: ({ node, ...props }) => <h3 className="text-base font-bold text-white mt-4 mb-2 first:mt-0" {...props} />,
                  p: ({ node, ...props }) => <p className="mb-3 last:mb-0 text-zinc-300" {...props} />,
                  ul: ({ node, ...props }) => <ul className="list-disc pl-5 mb-4 space-y-1 text-zinc-300" {...props} />,
                  ol: ({ node, ...props }) => <ol className="list-decimal pl-5 mb-4 space-y-1 text-zinc-300" {...props} />,
                  li: ({ node, ...props }) => <li className="mb-0.5" {...props} />,
                  strong: ({ node, ...props }) => <strong className="font-semibold text-white" {...props} />,
                }}
              >
                {optimizer.optimizedContent?.replace(/<br\s*\/?>/gi, "  \n")}
              </ReactMarkdown>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
