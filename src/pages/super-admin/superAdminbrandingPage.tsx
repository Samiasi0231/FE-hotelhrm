// src/pages/super-admin/PlatformBrandingPage.tsx — FULL FILE

import { useRef, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { platformApi } from "@/api/services";
import { toast } from "@/components/ui/toaster";
import { Button } from "@/components/ui/button";
import { Camera, Save, X, Loader2, Hotel, Info } from "lucide-react";

export default function PlatformBrandingPage() {
  const qc = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [imgError, setImgError] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ["platform-logo"],
    queryFn: () => platformApi.getLogo().then((r) => r.data?.data ?? r.data),
  });

  const currentLogo = preview || (!imgError && data?.logo) || null;

  const { mutate: upload, isPending: uploading } = useMutation({
    mutationFn: (f: File) => platformApi.uploadLogo(f),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["platform-logo"] });
      toast.success("Platform logo updated — visible to all users instantly");
      setPreview(null);
      setFile(null);
      setImgError(false);
    },
    onError: () => toast.error("Failed to upload logo"),
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setFile(f);
    setPreview(URL.createObjectURL(f));
    setImgError(false);
  };

  const handleCancel = () => {
    setFile(null);
    setPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-xl">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Platform Branding</h1>
        <p className="text-slate-500 text-sm mt-0.5">
          Upload the HotelMS trademark logo — displayed in the sidebar for every
          user across all hotels
        </p>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-xl px-4 py-3 flex items-start gap-3">
        <Info className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
        <p className="text-blue-700 text-sm">
          This logo is your SaaS trademark. It appears in the top-left sidebar
          for all hotel directors, admins, and staff — regardless of which hotel
          they belong to.
        </p>
      </div>

      {/* Upload card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-5">
        <h2 className="font-semibold text-slate-900 text-sm">Platform Logo</h2>

        <div className="flex items-start gap-6">
          {/* Logo circle */}
          <div className="relative flex-shrink-0">
            <div className="w-24 h-24 rounded-2xl overflow-hidden bg-slate-900 border-2 border-slate-200 flex items-center justify-center">
              {isLoading ? (
                <Loader2 className="w-6 h-6 text-slate-400 animate-spin" />
              ) : currentLogo ? (
                <img
                  src={currentLogo}
                  alt="Platform logo"
                  className="w-full h-full object-contain p-2"
                  onError={() => setImgError(true)}
                />
              ) : (
                <Hotel className="w-10 h-10 text-blue-400" />
              )}
            </div>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="absolute -bottom-1 -right-1 w-7 h-7 bg-blue-600 hover:bg-blue-700 rounded-full flex items-center justify-center shadow-md transition-colors"
              title="Change logo"
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

          {/* Right side */}
          <div className="flex-1 min-w-0 space-y-3">
            {file ? (
              <>
                <p className="text-sm font-semibold text-slate-700">
                  New logo selected
                </p>
                <p className="text-xs text-slate-400 truncate">{file.name}</p>

                {/* Mini sidebar preview */}
                <div className="flex items-center gap-2 bg-slate-900 rounded-xl px-3 py-2 w-fit">
                  <div className="w-7 h-7 rounded-lg overflow-hidden bg-blue-600 flex items-center justify-center flex-shrink-0">
                    {preview && (
                      <img
                        src={preview}
                        alt="preview"
                        className="w-full h-full object-contain p-0.5"
                      />
                    )}
                  </div>
                  <div>
                    <p className="text-white text-xs font-bold leading-none">
                      HotelMS
                    </p>
                    <p className="text-slate-400 text-[10px] mt-0.5">
                      Management Platform
                    </p>
                  </div>
                </div>
                <p className="text-xs text-slate-400">↑ Sidebar preview</p>

                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={() => upload(file)}
                    disabled={uploading}
                  >
                    {uploading ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />{" "}
                        Uploading…
                      </>
                    ) : (
                      <>
                        <Save className="w-3.5 h-3.5 mr-1.5" /> Save Logo
                      </>
                    )}
                  </Button>
                  <Button size="sm" variant="outline" onClick={handleCancel}>
                    <X className="w-3.5 h-3.5 mr-1" /> Cancel
                  </Button>
                </div>
              </>
            ) : (
              <>
                <p className="text-sm text-slate-600">
                  {data?.logo
                    ? "Logo is live — all users see it in their sidebar."
                    : "No logo uploaded yet. The default Hotel icon is shown."}
                </p>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors"
                >
                  {data?.logo ? "Change logo →" : "Upload logo →"}
                </button>
                <p className="text-xs text-slate-400">
                  PNG or SVG recommended. Square or wide logos work best. Max
                  5MB.
                </p>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Live sidebar simulation */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6">
        <h2 className="font-semibold text-slate-900 text-sm mb-4">
          Live sidebar preview
        </h2>
        <div className="bg-slate-900 rounded-xl p-4 flex items-center gap-3 w-fit">
          <div className="w-9 h-9 rounded-xl overflow-hidden bg-blue-600 flex items-center justify-center flex-shrink-0">
            {currentLogo ? (
              <img
                src={currentLogo}
                alt="logo"
                className="w-full h-full object-contain p-0.5"
              />
            ) : (
              <Hotel className="w-5 h-5 text-white" />
            )}
          </div>
          <div>
            <p className="text-white font-bold text-sm leading-none">HotelMS</p>
            <p className="text-slate-400 text-xs mt-0.5">Management Platform</p>
          </div>
        </div>
        <p className="text-xs text-slate-400 mt-3">
          This is exactly what every user sees in their sidebar.
        </p>
      </div>
    </div>
  );
}
