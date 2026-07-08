import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { UploadCloud, ArrowRight, FileText, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/cn";
import { apiFetch } from "@/lib/api";
import { Card } from "@/components/ui/Card";
import type { Resume } from "@/types";

interface ResumeUploadStepProps {
  selectedResume: Resume | null;
  onSelectResume: (resume: Resume) => void;
  onNext: () => void;
}

export function ResumeUploadStep({
  selectedResume,
  onSelectResume,
  onNext,
}: ResumeUploadStepProps) {
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    setUploading(true);
    setUploadError(null);
    setUploadedFile(file);

    const formData = new FormData();
    formData.append("resume", file);

    try {
      // NOTE: Using a hypothetical upload endpoint, update if different
      const response = await apiFetch<{ success: boolean; resume: Resume }>("/api/resumes/upload", {
        method: "POST",
        body: formData,
      });
      
      onSelectResume(response.resume);
    } catch (err: any) {
      setUploadError(err.message || "Failed to upload resume");
    } finally {
      setUploading(false);
    }
  }, [onSelectResume]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "application/pdf": [".pdf"],
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [".docx"],
    },
    maxFiles: 1,
    multiple: false,
  });

  return (
    <Card className="max-w-2xl mx-auto space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-white">Select a Resume</h2>
        <p className="mt-1 text-sm text-zinc-400">
          Upload a new resume or select an existing one to analyze.
        </p>
      </div>

      {/* Upload Area */}
      <div
        {...getRootProps()}
        className={cn(
          "relative flex flex-col items-center justify-center py-12 px-4 rounded-2xl border-2 border-dashed transition-all duration-200 cursor-pointer group bg-zinc-950/50",
          isDragActive
            ? "border-violet-500 bg-violet-500/5"
            : "border-zinc-800 hover:border-violet-500/50 hover:bg-zinc-900",
          uploading && "opacity-50 pointer-events-none"
        )}
      >
        <input {...getInputProps()} />
        
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-zinc-900 border border-zinc-800 shadow-xl group-hover:scale-110 transition-transform duration-300 mb-4 text-violet-400">
          {uploading ? (
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-zinc-500 border-t-violet-500" />
          ) : (
            <UploadCloud className="h-8 w-8" />
          )}
        </div>
        
        <h3 className="text-base font-semibold text-zinc-200">
          {isDragActive ? "Drop your resume here" : "Click or drag to upload"}
        </h3>
        <p className="mt-1 text-sm text-zinc-500">
          Supports PDF and DOCX (Max 5MB)
        </p>

        {uploadError && (
          <p className="mt-4 text-sm text-red-400 bg-red-500/10 px-3 py-1.5 rounded-lg">
            {uploadError}
          </p>
        )}
      </div>

      {/* Uploaded File Details */}
      {selectedResume && uploadedFile && (
        <div className="flex items-center gap-4 p-4 rounded-xl border border-violet-500/50 bg-violet-500/10 shadow-[0_0_15px_rgba(139,92,246,0.1)]">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-violet-500/20 text-violet-400">
            <FileText className="h-5 w-5" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate">
              {uploadedFile.name}
            </p>
            <p className="text-xs text-violet-300/70 mt-0.5">
              {(uploadedFile.size / (1024 * 1024)).toFixed(2)} MB
            </p>
          </div>
          <CheckCircle2 className="h-5 w-5 text-violet-500 shrink-0" />
        </div>
      )}

      {/* Actions */}
      <div className="flex justify-end pt-4 border-t border-zinc-800/60 mt-8">
        <button
          onClick={onNext}
          disabled={!selectedResume}
          className="flex items-center gap-2 rounded-xl bg-violet-600 px-6 py-2.5 text-sm font-medium text-white hover:bg-violet-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-violet-600/20"
        >
          Continue
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </Card>
  );
}
