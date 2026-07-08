"use client";

import { useState } from "react";
import { useAuthStore } from "@/stores/authStore";
import { Card } from "@/components/ui/Card";
import { Save, LogOut } from "lucide-react";

export default function SettingsPage() {
  const { user, logout } = useAuthStore();
  
  // NOTE: Simple local state for UI purposes. 
  // In a full implementation, this would sync via API.
  const [formData, setFormData] = useState({
    name: user?.name || "",
    currentRole: user?.currentRole || "",
    experience: user?.experience || "",
  });

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Settings</h1>
        <p className="mt-1 text-sm text-zinc-400">
          Manage your account preferences and career details.
        </p>
      </div>

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
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full rounded-xl border border-zinc-800 bg-zinc-900/60 px-4 py-2.5 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-violet-500/50 transition-colors"
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
                  className="w-full rounded-xl border border-zinc-800 bg-zinc-900/60 px-4 py-2.5 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-violet-500/50 transition-colors"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm text-zinc-400 font-medium ml-1">
                  Years of Experience
                </label>
                <input
                  type="number"
                  placeholder="e.g. 5"
                  value={formData.experience}
                  onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
                  className="w-full rounded-xl border border-zinc-800 bg-zinc-900/60 px-4 py-2.5 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-violet-500/50 transition-colors"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="pt-6 border-t border-zinc-800/60 flex justify-end">
          <button className="flex items-center gap-2 rounded-xl bg-violet-600 px-6 py-2.5 text-sm font-medium text-white hover:bg-violet-500 transition-colors shadow-lg shadow-violet-600/20">
            <Save className="h-4 w-4" />
            Save Changes
          </button>
        </div>
      </Card>

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
