import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { UploadCloud, ArrowRight, FileText, CheckCircle2, Search, X } from "lucide-react";
import { cn } from "@/lib/cn";
import { apiFetch } from "@/lib/api";
import { Card } from "@/components/ui/Card";
import { useResumes } from "@/hooks/useResumes";
import type { Resume } from "@/types";

interface ResumeUploadStepProps {
  selectedResume: Resume | null;
  onSelectResume: (resume: Resume | null) => void;
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
  const [mode, setMode] = useState<"new" | "existing">("new");
  const [search, setSearch] = useState("");

  const { data: resumes, isLoading: resumesLoading } = useResumes();

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

  const filteredResumes = resumes?.filter((r) =>
    r.originalName.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Card className="max-w-2xl mx-auto space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-white">Select a Resume</h2>
        <p className="mt-1 text-sm text-zinc-400">
          Upload a new resume or select an existing one to analyze.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 p-1 bg-zinc-900/60 rounded-xl border border-zinc-800">
        <button
          onClick={() => setMode("new")}
          className={cn(
            "flex-1 py-2 text-sm font-medium rounded-lg transition-all",
            mode === "new"
              ? "bg-zinc-800 text-white shadow-sm"
              : "text-zinc-500 hover:text-zinc-300"
          )}
        >
          Upload New
        </button>
        <button
          onClick={() => setMode("existing")}
          className={cn(
            "flex-1 py-2 text-sm font-medium rounded-lg transition-all",
            mode === "existing"
              ? "bg-zinc-800 text-white shadow-sm"
              : "text-zinc-500 hover:text-zinc-300"
          )}
        >
          Select Existing
        </button>
      </div>

      {/* Upload Area */}
      {mode === "new" && (
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
      )}

      {/* Existing Resumes Library */}
      {mode === "existing" && (
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
            <input
              type="text"
              placeholder="Search resumes..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-xl border border-zinc-800 bg-zinc-900/60 py-2.5 pl-9 pr-4 text-sm text-zinc-200 placeholder:text-zinc-500 focus:outline-none focus:border-violet-500/50 transition-colors"
            />
          </div>

          {!resumesLoading && resumes && resumes.length > 0 ? (
            <div className="grid gap-3 max-h-80 overflow-y-auto pr-2 scrollbar-hide">
              {filteredResumes?.map((resume) => {
                const isSelected = selectedResume?._id === resume._id;

                return (
                  <div
                    key={resume._id}
                    onClick={() => {
                      setUploadedFile(null); // Clear uploaded file since we selected from library
                      onSelectResume(resume);
                    }}
                    className={cn(
                      "flex items-start gap-4 p-4 rounded-xl border cursor-pointer transition-all duration-200",
                      isSelected
                        ? "border-violet-500 bg-violet-500/10 shadow-[0_0_15px_rgba(37,99,235,0.15)]"
                        : "border-zinc-800 bg-zinc-900/40 hover:border-zinc-700 hover:bg-zinc-900/80"
                    )}
                  >
                    <div
                      className={cn(
                        "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg font-bold text-sm transition-colors",
                        isSelected
                          ? "bg-violet-500/20 text-violet-400"
                          : "bg-zinc-800 text-zinc-400"
                      )}
                    >
                      <FileText className="h-5 w-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p
                        className={cn(
                          "text-sm font-medium truncate",
                          isSelected ? "text-white" : "text-zinc-200"
                        )}
                      >
                        {resume.originalName}
                      </p>
                      <p className="text-xs text-zinc-500 mt-0.5">
                        Uploaded {new Date(resume.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    {isSelected && (
                      <CheckCircle2 className="h-5 w-5 text-violet-500 shrink-0 mt-2.5" />
                    )}
                  </div>
                );
              })}
            </div>
          ) : resumesLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-16 rounded-xl border border-zinc-800 bg-zinc-900/20 animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-sm text-zinc-500">No saved resumes in your library.</p>
              <button
                onClick={() => setMode("new")}
                className="mt-2 text-sm text-violet-400 hover:text-violet-300 font-medium"
              >
                Upload one now
              </button>
            </div>
          )}
        </div>
      )}

      {/* Selected Resume Details */}
      {selectedResume && (
        <div className="flex items-center gap-4 p-4 rounded-xl border border-violet-500/50 bg-violet-500/10 shadow-[0_0_15px_rgba(37,99,235,0.15)] animate-in fade-in slide-in-from-bottom-2 duration-300">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-violet-500/20 text-violet-400">
            <FileText className="h-5 w-5" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate">
              {selectedResume.originalName}
            </p>
            <p className="text-xs text-violet-300/70 mt-0.5">
              {uploadedFile 
                ? `${(uploadedFile.size / (1024 * 1024)).toFixed(2)} MB`
                : `Imported from library • ${new Date(selectedResume.createdAt).toLocaleDateString()}`}
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => {
                setUploadedFile(null);
                onSelectResume(null);
              }}
              className="p-1.5 text-zinc-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
              title="Remove selection"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
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
