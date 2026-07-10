"use client";

import { useState, useEffect } from "react";
import { useAuthStore } from "@/stores/authStore";
import { Card } from "@/components/ui/Card";
import { Save, LogOut, Loader2, AlertCircle, CheckCircle } from "lucide-react";
import { apiFetch } from "@/lib/api";
import type { User } from "@/types";

export default function SettingsPage() {
  const { user, logout, setUser } = useAuthStore();
  
  const [formData, setFormData] = useState({
    name: "",
    currentRole: "",
    experience: "",
    preferences: {
      targetRole: "",
      location: "",
      remote: false,
      expectedSalary: "",
    },
  });

  const [isSaving, setIsSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Sync store user to local form state on mount/update
  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || "",
        currentRole: user.currentRole || "",
        experience: user.experience !== undefined ? String(user.experience) : "",
        preferences: {
          targetRole: user.preferences?.targetRole || "",
          location: user.preferences?.location || "",
          remote: !!user.preferences?.remote,
          expectedSalary: user.preferences?.expectedSalary !== undefined ? String(user.preferences.expectedSalary) : "",
        },
      });
    }
  }, [user]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSuccess(false);
    setError(null);

    const experienceVal = formData.experience === "" ? 0 : Number(formData.experience);
    const expectedSalaryVal = formData.preferences.expectedSalary === "" ? undefined : Number(formData.preferences.expectedSalary);

    const payload = {
      name: formData.name.trim(),
      currentRole: formData.currentRole.trim(),
      experience: experienceVal,
      preferences: {
        targetRole: formData.preferences.targetRole.trim() || undefined,
        location: formData.preferences.location.trim() || undefined,
        remote: formData.preferences.remote,
        expectedSalary: expectedSalaryVal,
      },
    };

    try {
      const updatedUser = await apiFetch<User>("/api/auth/me", {
        method: "PUT",
        body: JSON.stringify(payload),
      });
      setUser(updatedUser);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      setError(err.message || "Failed to update profile");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Settings</h1>
        <p className="mt-1 text-sm text-zinc-400">
          Manage your account preferences and career details.
        </p>
      </div>

      <form onSubmit={handleSave}>
        <Card className="space-y-6">
          <div>
            <h2 className="text-lg font-semibold text-white mb-4">Profile Information</h2>
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                {user?.avatar ? (
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="h-16 w-16 rounded-full object-cover border border-zinc-700"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-violet-600 to-indigo-600 text-xl font-bold text-white">
                    {user?.name?.charAt(0) || "U"}
                  </div>
                )}
                <div>
                  <p className="text-sm font-medium text-white">{user?.name}</p>
                  <p className="text-xs text-zinc-400">{user?.email}</p>
                  <p className="text-xs text-zinc-500 mt-1">Logged in via Google</p>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2 pt-4">
                <div className="space-y-1.5">
                  <label className="text-sm text-zinc-400 font-medium ml-1">
                    Full Name
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    disabled={isSaving}
                    className="w-full rounded-xl border border-zinc-800 bg-zinc-900/60 px-4 py-2.5 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-violet-500/50 transition-colors disabled:opacity-50"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm text-zinc-400 font-medium ml-1">
                    Current Role
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Software Engineer"
                    value={formData.currentRole}
                    onChange={(e) => setFormData({ ...formData, currentRole: e.target.value })}
                    disabled={isSaving}
                    className="w-full rounded-xl border border-zinc-800 bg-zinc-900/60 px-4 py-2.5 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-violet-500/50 transition-colors disabled:opacity-50"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm text-zinc-400 font-medium ml-1">
                    Years of Experience
                  </label>
                  <input
                    type="number"
                    min="0"
                    placeholder="e.g. 5"
                    value={formData.experience}
                    onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
                    disabled={isSaving}
                    className="w-full rounded-xl border border-zinc-800 bg-zinc-900/60 px-4 py-2.5 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-violet-500/50 transition-colors disabled:opacity-50"
                  />
                </div>
              </div>

              {/* Preferences Section */}
              <div className="border-t border-zinc-800/60 pt-6 mt-6">
                <h3 className="text-base font-medium text-white mb-4">Career Preferences</h3>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <label className="text-sm text-zinc-400 font-medium ml-1">
                      Target Role
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Senior Software Engineer"
                      value={formData.preferences.targetRole}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          preferences: { ...formData.preferences, targetRole: e.target.value },
                        })
                      }
                      disabled={isSaving}
                      className="w-full rounded-xl border border-zinc-800 bg-zinc-900/60 px-4 py-2.5 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-violet-500/50 transition-colors disabled:opacity-50"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm text-zinc-400 font-medium ml-1">
                      Preferred Location
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Hyderabad, India"
                      value={formData.preferences.location}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          preferences: { ...formData.preferences, location: e.target.value },
                        })
                      }
                      disabled={isSaving}
                      className="w-full rounded-xl border border-zinc-800 bg-zinc-900/60 px-4 py-2.5 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-violet-500/50 transition-colors disabled:opacity-50"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm text-zinc-400 font-medium ml-1">
                      Expected Salary (₹ / Year)
                    </label>
                    <input
                      type="number"
                      min="0"
                      placeholder="e.g. 120000"
                      value={formData.preferences.expectedSalary}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          preferences: { ...formData.preferences, expectedSalary: e.target.value },
                        })
                      }
                      disabled={isSaving}
                      className="w-full rounded-xl border border-zinc-800 bg-zinc-900/60 px-4 py-2.5 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-violet-500/50 transition-colors disabled:opacity-50"
                    />
                  </div>
                </div>

                <div className="mt-6 flex items-center justify-between rounded-xl border border-zinc-800 bg-zinc-900/40 p-4">
                  <div className="space-y-0.5">
                    <label htmlFor="remote" className="text-sm font-medium text-white select-none cursor-pointer">
                      Remote Work Preference
                    </label>
                    <p className="text-xs text-zinc-500">Are you open to fully remote opportunities?</p>
                  </div>
                  <input
                    id="remote"
                    type="checkbox"
                    checked={formData.preferences.remote}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        preferences: { ...formData.preferences, remote: e.target.checked },
                      })
                    }
                    disabled={isSaving}
                    className="h-5 w-5 rounded border-zinc-800 bg-zinc-900 accent-violet-600 text-violet-600 focus:ring-violet-500/50 disabled:opacity-50 cursor-pointer"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-zinc-800/60 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex-1">
              {error && (
                <p className="text-sm text-red-400 flex items-center gap-1.5">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  {error}
                </p>
              )}
              {success && (
                <p className="text-sm text-emerald-400 flex items-center gap-1.5">
                  <CheckCircle className="h-4 w-4 shrink-0" />
                  Changes saved successfully!
                </p>
              )}
            </div>
            
            <button
              type="submit"
              disabled={isSaving}
              className="flex items-center justify-center gap-2 rounded-xl bg-violet-600 px-6 py-2.5 text-sm font-medium text-white hover:bg-violet-500 transition-colors shadow-lg shadow-violet-600/20 disabled:opacity-50 disabled:cursor-not-allowed w-full sm:w-auto"
            >
              {isSaving ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  Save Changes
                </>
              )}
            </button>
          </div>
        </Card>
      </form>

      <Card className="border-red-500/20 bg-red-500/5">
        <div>
          <h2 className="text-lg font-semibold text-red-400 mb-1">Danger Zone</h2>
          <p className="text-sm text-zinc-400 mb-4">
            Sign out of your account or delete your data permanently.
          </p>
          <button
            onClick={logout}
            className="flex items-center gap-2 rounded-xl border border-red-500/20 bg-red-500/10 px-6 py-2.5 text-sm font-medium text-red-400 hover:bg-red-500/20 transition-colors"
          >
            <LogOut className="h-4 w-4" />
            Sign Out
          </button>
        </div>
      </Card>
    </div>
  );
}
