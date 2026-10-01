// src/pages/settings/ProfileSettingsPage.tsx — FULL FILE
// Any logged-in user can update their name, phone, and avatar

import { useState, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { authApi } from "@/api/services";
import { toast } from "@/components/ui/toaster";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { Camera, Loader2, Save, User } from "lucide-react";

export default function ProfileSettingsPage() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [form, setForm] = useState({
    firstName: user?.firstName || "",
    lastName: user?.lastName || "",
    phone: "",
  });

  // ── Avatar upload ────────────────────────────────────────────────────────────
  const { mutate: uploadAvatar, isPending: uploadingAvatar } = useMutation({
    mutationFn: (file: File) => authApi.uploadAvatar(file),
    onSuccess: (res) => {
      const url = res.data?.data?.avatar || res.data?.avatar;
      qc.invalidateQueries({ queryKey: ["profile"] });
      toast.success("Profile photo updated");
      setAvatarPreview(null);
      setAvatarFile(null);
    },
    onError: () => toast.error("Failed to upload photo"),
  });

  // ── Profile update ───────────────────────────────────────────────────────────
  const { mutate: updateProfile, isPending: updatingProfile } = useMutation({
    mutationFn: () => authApi.updateProfile(form),
    // ^ make sure authApi has: updateProfile: (data) => apiClient.put('/auth/profile', data)
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["profile"] });
      toast.success("Profile updated");
    },
    onError: () => toast.error("Failed to update profile"),
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  };

  const handleSaveAvatar = () => {
    if (avatarFile) uploadAvatar(avatarFile);
  };

  const handleCancelAvatar = () => {
    setAvatarFile(null);
    setAvatarPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const currentAvatar = avatarPreview || user?.avatar;

  return (
    <div className="space-y-6 animate-fade-in max-w-xl">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Profile Settings</h1>
        <p className="text-slate-500 text-sm mt-0.5">
          Update your personal information and photo
        </p>
      </div>

      {/* ── Avatar section ────────────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6">
        <h2 className="font-semibold text-slate-900 text-sm mb-4">
          Profile Photo
        </h2>
        <div className="flex items-center gap-5">
          {/* Avatar circle */}
          <div className="relative flex-shrink-0">
            <div className="w-20 h-20 rounded-full overflow-hidden bg-blue-100 flex items-center justify-center border-2 border-slate-200">
              {currentAvatar ? (
                <img
                  src={currentAvatar}
                  alt="Avatar"
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-blue-600 text-2xl font-bold">
                  {user?.firstName?.[0]}
                  {user?.lastName?.[0]}
                </span>
              )}
            </div>
            {/* Camera button */}
            <button
              onClick={() => fileInputRef.current?.click()}
              className="absolute -bottom-1 -right-1 w-7 h-7 bg-blue-600 hover:bg-blue-700 rounded-full flex items-center justify-center shadow-md transition-colors"
            >
              <Camera className="w-3.5 h-3.5 text-white" />
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
            />
          </div>

          <div className="flex-1 min-w-0">
            {avatarFile ? (
              // Preview state — show save/cancel
              <div className="space-y-2">
                <p className="text-sm font-medium text-slate-700">
                  New photo selected
                </p>
                <p className="text-xs text-slate-400 truncate">
                  {avatarFile.name}
                </p>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={handleSaveAvatar}
                    disabled={uploadingAvatar}
                  >
                    {uploadingAvatar ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />{" "}
                        Uploading…
                      </>
                    ) : (
                      <>
                        <Save className="w-3.5 h-3.5 mr-1.5" /> Save Photo
                      </>
                    )}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleCancelAvatar}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              // Default state
              <div className="space-y-1">
                <p className="text-sm font-medium text-slate-700">
                  {user?.firstName} {user?.lastName}
                </p>
                <p className="text-xs text-slate-400">{user?.email}</p>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="text-xs text-blue-600 hover:text-blue-700 font-medium transition-colors"
                >
                  Change photo →
                </button>
              </div>
            )}
          </div>
        </div>
        <p className="text-xs text-slate-400 mt-4">
          JPG or PNG. Max 5MB. Square images work best.
        </p>
      </div>

      {/* ── Profile info ──────────────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6">
        <h2 className="font-semibold text-slate-900 text-sm mb-4">
          Personal Information
        </h2>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            {(["firstName", "lastName"] as const).map((key) => (
              <div key={key} className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-600">
                  {key === "firstName" ? "First Name" : "Last Name"}
                </label>
                <input
                  value={form[key]}
                  onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                  className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            ))}
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-600">
              Email
            </label>
            <input
              value={user?.email || ""}
              disabled
              className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm bg-slate-50 text-slate-400 cursor-not-allowed"
            />
            <p className="text-xs text-slate-400">Email cannot be changed</p>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-600">
              Phone
            </label>
            <input
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              placeholder="+234 800 000 0000"
              className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-600">Role</label>
            <input
              value={user?.role?.toLowerCase().replace(/_/g, " ") || ""}
              disabled
              className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm bg-slate-50 text-slate-400 cursor-not-allowed capitalize"
            />
          </div>
        </div>

        <div className="flex justify-end mt-5">
          <Button onClick={() => updateProfile()} disabled={updatingProfile}>
            {updatingProfile ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Saving…
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" /> Save Changes
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
