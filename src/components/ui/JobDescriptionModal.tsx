"use client";

import { X, Briefcase, Calendar } from "lucide-react";

interface JobDescriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  job: {
    title: string;
    company: string;
    description: string;
    createdAt?: string | Date;
  } | null;
}

export function JobDescriptionModal({
  isOpen,
  onClose,
  job,
}: JobDescriptionModalProps) {
  if (!isOpen || !job) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-3xl h-[80vh] bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden flex flex-col shadow-2xl relative animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-zinc-800 bg-zinc-950">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-500/10 text-blue-400">
              <Briefcase className="h-5 w-5" />
            </div>
            <div className="overflow-hidden">
              <h3 className="font-semibold text-white truncate pr-4 leading-tight">
                {job.title}
              </h3>
              <p className="text-xs text-zinc-400 mt-0.5 truncate">{job.company}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors cursor-pointer"
            title="Close Preview"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 bg-zinc-950/85 overflow-y-auto p-6 space-y-6 custom-scrollbar">
          <div className="space-y-3.5">
            <h4 className="text-xs font-bold text-zinc-500 uppercase tracking-wider">
              Full Job Description
            </h4>
            <div className="text-sm text-zinc-300 leading-relaxed whitespace-pre-wrap font-sans">
              {job.description}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-4 border-t border-zinc-850 bg-zinc-950">
          <div className="flex items-center gap-2 text-xs text-zinc-500">
            {job.createdAt && (
              <>
                <Calendar className="h-3.5 w-3.5" />
                <span>Added {new Date(job.createdAt).toLocaleDateString()}</span>
              </>
            )}
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white transition-colors text-sm font-medium cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
