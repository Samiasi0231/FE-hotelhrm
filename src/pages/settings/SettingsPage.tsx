// src/pages/settings/SettingsPage.tsx — FULL REPLACEMENT
// Unified settings: profile info + avatar upload + password change
// Calls refreshUser() after avatar/profile save so sidebar + header update instantly

import { useState, useRef } from "react";
import { useMutation } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import apiClient from "@/api/client";
import { authApi } from "@/api/services";
import { toast } from "@/components/ui/toaster";
import { Button } from "@/components/ui/button";
import {
  Input,
  Label,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/common";
import { getInitials } from "@/lib/utils";
import { Loader2, User, Lock, Bell, Camera, Save, X } from "lucide-react";

export default function SettingsPage() {
  const { user, refreshUser } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ── Avatar state ─────────────────────────────────────────────────────────────
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);

  // ── Profile form — pre-filled from context ────────────────────────────────────
  const [profile, setProfile] = useState({
    firstName: user?.firstName || "",
    lastName: user?.lastName || "",
    phone: (user as any)?.phone || "",
  });

  // ── Password form ─────────────────────────────────────────────────────────────
  const [passwords, setPasswords] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  // ── Avatar upload mutation ────────────────────────────────────────────────────
  const { mutate: uploadAvatar, isPending: uploadingAvatar } = useMutation({
    mutationFn: (file: File) => authApi.uploadAvatar(file),
    onSuccess: async () => {
      await refreshUser(); // ← pulls fresh user (with new avatar URL) into context
      toast.success("Profile photo updated");
      setAvatarPreview(null);
      setAvatarFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    },
    onError: () => toast.error("Failed to upload photo"),
  });

  // ── Profile update mutation ───────────────────────────────────────────────────
  const { mutate: updateProfile, isPending: savingProfile } = useMutation({
    mutationFn: () => apiClient.put("/auth/profile", profile),
    onSuccess: async () => {
      await refreshUser(); // ← updates name in sidebar/header immediately
      toast.success("Profile updated!");
    },
    onError: () => toast.error("Failed to update profile"),
  });

  // ── Password change mutation ──────────────────────────────────────────────────
  const { mutate: changePassword, isPending: changingPw } = useMutation({
    mutationFn: () =>
      apiClient.patch("/auth/change-password", {
        currentPassword: passwords.currentPassword,
        newPassword: passwords.newPassword,
      }),
    onSuccess: () => {
      toast.success("Password changed!");
      setPasswords({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    },
    onError: (e: any) =>
      toast.error(e.response?.data?.message || "Failed to change password"),
  });

  // ── File picker handlers ──────────────────────────────────────────────────────
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  };

  const handleCancelAvatar = () => {
    setAvatarFile(null);
    setAvatarPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // What to show in the avatar circle:
  // 1. New file preview (local blob)  2. Saved Cloudinary URL  3. Initials fallback
  const displayAvatar = avatarPreview || (user as any)?.avatar;

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwords.newPassword !== passwords.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    if (passwords.newPassword.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }
    changePassword();
  };

  return (
    <div className="max-w-2xl space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Settings</h1>
        <p className="text-slate-500 text-sm">
          Manage your account and preferences
        </p>
      </div>

      {/* ── Profile Card ─────────────────────────────────────────────────────── */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <User className="w-4 h-4" /> Profile Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Avatar section */}
          <div className="flex items-center gap-5 mb-6 pb-6 border-b">
            {/* Avatar circle + camera button */}
            <div className="relative flex-shrink-0">
              <div className="w-20 h-20 rounded-2xl overflow-hidden bg-blue-600 flex items-center justify-center border-2 border-slate-200">
                {displayAvatar ? (
                  <img
                    src={displayAvatar}
                    alt="avatar"
                    className="w-full h-full object-cover"
                    // key forces re-render when URL changes after upload
                    key={displayAvatar}
                  />
                ) : (
                  <span className="text-white text-xl font-bold">
                    {getInitials(user?.firstName, user?.lastName)}
                  </span>
                )}
              </div>

              {/* Camera overlay button */}
              <button
                onClick={() => fileInputRef.current?.click()}
                className="absolute -bottom-1 -right-1 w-7 h-7 bg-blue-600 hover:bg-blue-700 rounded-full flex items-center justify-center shadow-md transition-colors"
                title="Change photo"
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

            {/* Right side: name + actions */}
            <div className="flex-1 min-w-0">
              {avatarFile ? (
                // File selected — show save/cancel
                <div className="space-y-2">
                  <p className="text-sm font-semibold text-slate-700">
                    New photo selected
                  </p>
                  <p className="text-xs text-slate-400 truncate">
                    {avatarFile.name}
                  </p>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={() => uploadAvatar(avatarFile)}
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
                      <X className="w-3.5 h-3.5 mr-1" /> Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                // Default state
                <div>
                  <p className="font-semibold text-slate-900">
                    {user?.firstName} {user?.lastName}
                  </p>
                  <p className="text-slate-500 text-sm">{user?.email}</p>
                  <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-medium mt-1.5 inline-block">
                    {user?.role?.replace(/_/g, " ")}
                  </span>
                  <div className="mt-2">
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="text-xs text-blue-600 hover:text-blue-700 font-medium transition-colors"
                    >
                      Change photo →
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Profile form */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              updateProfile();
            }}
            className="space-y-4"
          >
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>First Name</Label>
                <Input
                  value={profile.firstName}
                  onChange={(e) =>
                    setProfile({ ...profile, firstName: e.target.value })
                  }
                />
              </div>
              <div className="space-y-1.5">
                <Label>Last Name</Label>
                <Input
                  value={profile.lastName}
                  onChange={(e) =>
                    setProfile({ ...profile, lastName: e.target.value })
                  }
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Phone Number</Label>
              <Input
                type="tel"
                placeholder="+234 800 000 0000"
                value={profile.phone}
                onChange={(e) =>
                  setProfile({ ...profile, phone: e.target.value })
                }
              />
            </div>
            <div className="space-y-1.5">
              <Label>Email</Label>
              <Input
                value={user?.email || ""}
                disabled
                className="bg-slate-50 text-slate-400"
              />
              <p className="text-xs text-slate-400">Email cannot be changed</p>
            </div>
            <div className="flex justify-end">
              <Button type="submit" disabled={savingProfile}>
                {savingProfile ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Saving…
                  </>
                ) : (
                  "Save Profile"
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* ── Change Password Card ──────────────────────────────────────────────── */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Lock className="w-4 h-4" /> Change Password
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label>Current Password</Label>
              <Input
                type="password"
                placeholder="Enter current password"
                value={passwords.currentPassword}
                onChange={(e) =>
                  setPasswords({
                    ...passwords,
                    currentPassword: e.target.value,
                  })
                }
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label>New Password</Label>
              <Input
                type="password"
                placeholder="Min 8 characters"
                value={passwords.newPassword}
                onChange={(e) =>
                  setPasswords({ ...passwords, newPassword: e.target.value })
                }
                required
                minLength={8}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Confirm New Password</Label>
              <Input
                type="password"
                placeholder="Repeat new password"
                value={passwords.confirmPassword}
                onChange={(e) =>
                  setPasswords({
                    ...passwords,
                    confirmPassword: e.target.value,
                  })
                }
                required
              />
              {passwords.newPassword &&
                passwords.confirmPassword &&
                passwords.newPassword !== passwords.confirmPassword && (
                  <p className="text-xs text-red-500">Passwords do not match</p>
                )}
            </div>
            <div className="flex justify-end">
              <Button type="submit" disabled={changingPw}>
                {changingPw ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Changing…
                  </>
                ) : (
                  "Change Password"
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* ── Notifications placeholder ─────────────────────────────────────────── */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Bell className="w-4 h-4" /> Notifications
            <span className="text-xs bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full ml-auto font-normal">
              Coming in v2
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-slate-500">
            WhatsApp notifications, email digests, and booking alerts will be
            available in version 2 of HotelMS.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
