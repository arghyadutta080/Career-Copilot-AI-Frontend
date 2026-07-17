import { useState } from "react";
import { Briefcase, ArrowRight, CheckCircle2, ChevronDown, FileText, Download } from "lucide-react";
import { cn } from "@/lib/cn";
import { useJobDescriptions } from "@/hooks/useAnalysis";
import { apiFetch } from "@/lib/api";
import { Card } from "@/components/ui/Card";
import type { JobDescription, CreateJobDescriptionInput } from "@/types";

interface JobDescriptionStepProps {
  selectedJob: JobDescription | null;
  onSelectJob: (job: JobDescription) => void;
  onBack: () => void;
  onNext: () => void;
}

export function JobDescriptionStep({
  selectedJob,
  onSelectJob,
  onBack,
  onNext,
}: JobDescriptionStepProps) {
  const { data: jobs, isLoading, refetch } = useJobDescriptions();
  const [mode, setMode] = useState<"existing" | "new">("existing");
  const [formData, setFormData] = useState<CreateJobDescriptionInput>({
    title: "",
    company: "",
    description: "",
  });
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [importUrl, setImportUrl] = useState("");
  const [importing, setImporting] = useState(false);
  const [importError, setImportError] = useState<string | null>(null);

  const handleImport = async () => {
    if (!importUrl) {
      setImportError("Please enter a job URL.");
      return;
    }
    setFormData({
      title: "",
      company: "",
      description: "",
    });
    setImporting(true);
    setImportError(null);
    try {
      const result = await apiFetch<any>("/api/job/import", {
        method: "POST",
        body: JSON.stringify({ url: importUrl }),
      });
      setFormData({
        title: result.title || "",
        company: result.company || "",
        description: result.description || "",
      });
    } catch (err: any) {
      setImportError(err.message || "Failed to import job description.");
    } finally {
      setImporting(false);
    }
  };

  const handleCreate = async () => {
    if (!formData.title || !formData.company || !formData.description) {
      setError("Please fill out all fields.");
      return;
    }

    setCreating(true);
    setError(null);

    try {
      const newJob = await apiFetch<JobDescription>("/api/job-descriptions", {
        method: "POST",
        body: JSON.stringify(formData),
      });

      await refetch();
      onSelectJob(newJob);
      onNext();
    } catch (err: any) {
      setError(err.message || "Failed to save job description");
    } finally {
      setCreating(false);
    }
  };

  return (
    <Card className="max-w-2xl mx-auto space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-white">Job Description</h2>
        <p className="mt-1 text-sm text-zinc-400">
          Provide the job description you are targeting for this analysis.
        </p>
      </div>

      <div className="flex gap-2 p-1 bg-zinc-900/60 rounded-xl border border-zinc-800">
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
        <button
          onClick={() => setMode("new")}
          className={cn(
            "flex-1 py-2 text-sm font-medium rounded-lg transition-all",
            mode === "new"
              ? "bg-zinc-800 text-white shadow-sm"
              : "text-zinc-500 hover:text-zinc-300"
          )}
        >
          Add New
        </button>
      </div>

      {mode === "existing" && (
        <div className="space-y-4">
          {!isLoading && jobs && jobs.length > 0 ? (
            <div className="grid gap-3 max-h-80 overflow-y-auto pr-2 scrollbar-hide">
              {jobs.map((job) => {
                const isSelected = selectedJob?._id === job._id;

                return (
                  <div
                    key={job._id}
                    onClick={() => onSelectJob(job)}
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
                      {job.company.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p
                        className={cn(
                          "text-sm font-medium truncate",
                          isSelected ? "text-white" : "text-zinc-200"
                        )}
                      >
                        {job.title}
                      </p>
                      <p className="text-xs text-zinc-500 mt-0.5 truncate">
                        {job.company}
                      </p>
                    </div>
                    {isSelected && (
                      <CheckCircle2 className="h-5 w-5 text-violet-500 shrink-0 mt-2.5" />
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-sm text-zinc-500">No saved job descriptions.</p>
              <button
                onClick={() => setMode("new")}
                className="mt-2 text-sm text-violet-400 hover:text-violet-300"
              >
                Add a new one
              </button>
            </div>
          )}
        </div>
      )}

      {mode === "new" && (
        <div className="space-y-4">
          {/* Import Section */}
          <div className="p-4 bg-zinc-900/60 border border-zinc-800 rounded-xl space-y-3">
            <label className="text-sm text-zinc-400 font-medium ml-1">
              Import from URL
            </label>
            <div className="flex gap-2">
              <input
                type="url"
                placeholder="https://..."
                value={importUrl}
                onChange={(e) => setImportUrl(e.target.value)}
                className="flex-1 rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-2.5 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-violet-500/50 transition-colors"
                onKeyDown={(e) => e.key === "Enter" && handleImport()}
              />
              <button
                onClick={handleImport}
                disabled={importing || !importUrl}
                className="flex items-center gap-2 rounded-xl bg-zinc-800 px-4 py-2.5 text-sm font-medium text-white hover:bg-zinc-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {importing ? "Importing..." : (
                  <>
                    <Download className="h-4 w-4" />
                    Import
                  </>
                )}
              </button>
            </div>
            {importError && (
              <p className="text-xs text-red-400 mt-2">{importError}</p>
            )}
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-sm text-zinc-400 font-medium ml-1">
                Job Title
              </label>
              <input
                type="text"
                placeholder="e.g. Senior Frontend Engineer"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                className="w-full rounded-xl border border-zinc-800 bg-zinc-900/60 px-4 py-2.5 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-violet-500/50 transition-colors"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm text-zinc-400 font-medium ml-1">
                Company
              </label>
              <input
                type="text"
                placeholder="e.g. Google"
                value={formData.company}
                onChange={(e) =>
                  setFormData({ ...formData, company: e.target.value })
                }
                className="w-full rounded-xl border border-zinc-800 bg-zinc-900/60 px-4 py-2.5 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-violet-500/50 transition-colors"
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-sm text-zinc-400 font-medium ml-1">
              Job Description
            </label>
            <textarea
              placeholder="Paste the full job description here..."
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              rows={8}
              className="w-full rounded-xl border border-zinc-800 bg-zinc-900/60 px-4 py-3 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-violet-500/50 transition-colors resize-none"
            />
          </div>

          {error && (
            <p className="text-sm text-red-400 bg-red-500/10 px-3 py-1.5 rounded-lg">
              {error}
            </p>
          )}
        </div>
      )}

      {/* Actions */}
      <div className="flex justify-between pt-4 border-t border-zinc-800/60 mt-8">
        <button
          onClick={onBack}
          className="px-6 py-2.5 text-sm font-medium text-zinc-400 hover:text-white transition-colors"
        >
          Back
        </button>
        {mode === "existing" ? (
          <button
            onClick={onNext}
            disabled={!selectedJob}
            className="flex items-center gap-2 rounded-xl bg-violet-600 px-6 py-2.5 text-sm font-medium text-white hover:bg-violet-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-violet-600/20"
          >
            Continue
            <ArrowRight className="h-4 w-4" />
          </button>
        ) : (
          <button
            onClick={handleCreate}
            disabled={creating || !formData.title.trim() || !formData.company.trim() || !formData.description.trim()}
            className="flex items-center gap-2 rounded-xl bg-violet-600 px-6 py-2.5 text-sm font-medium text-white hover:bg-violet-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-violet-600/20"
          >
            {creating ? "Saving..." : "Save & Continue"}
            {!creating && <ArrowRight className="h-4 w-4" />}
          </button>
        )}
      </div>
    </Card>
  );
}
