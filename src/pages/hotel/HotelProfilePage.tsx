// src/pages/hotel/HotelProfilePage.tsx — FULL REPLACEMENT
// Adds logo upload directly on the profile page

import { useRef, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { hotelApi } from "@/api/services";
import { toast } from "@/components/ui/toaster";
import { formatDate, getStatusColor } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/common";
import { Button } from "@/components/ui/button";
import {
  Hotel,
  MapPin,
  Phone,
  Mail,
  Star,
  Edit,
  Users,
  BedDouble,
  CalendarCheck,
  Camera,
  Loader2,
  Save,
} from "lucide-react";

export default function HotelProfilePage() {
  const qc = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [logoFile, setLogoFile] = useState<File | null>(null);

  const { data: hotel, isLoading } = useQuery({
    queryKey: ["my-hotel"],
    queryFn: () => hotelApi.getMyHotel().then((r) => r.data?.data || r.data),
  });

  const { data: stats } = useQuery({
    queryKey: ["hotel-stats", hotel?.id],
    queryFn: () =>
      hotelApi.getStats(hotel!.id).then((r) => r.data?.data || r.data),
    enabled: !!hotel?.id,
  });

  // ── Logo upload ──────────────────────────────────────────────────────────────
  const { mutate: uploadLogo, isPending: uploadingLogo } = useMutation({
    mutationFn: (file: File) => hotelApi.uploadLogo(hotel!.id, file),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["my-hotel"] });
      toast.success("Hotel logo updated");
      setLogoPreview(null);
      setLogoFile(null);
    },
    onError: () => toast.error("Failed to upload logo"),
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setLogoFile(file);
    setLogoPreview(URL.createObjectURL(file));
  };

  const handleCancelLogo = () => {
    setLogoFile(null);
    setLogoPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  if (isLoading)
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-48 bg-slate-200 rounded-xl" />
      </div>
    );

  if (!hotel)
    return (
      <div className="text-center py-20">
        <Hotel className="w-12 h-12 text-slate-300 mx-auto mb-4" />
        <h2 className="text-lg font-semibold text-slate-700">No hotel yet</h2>
        <p className="text-slate-500 text-sm mb-4">
          Create your hotel to get started
        </p>
        <Link to="/hotel/create">
          <Button>Create Hotel</Button>
        </Link>
      </div>
    );

  const currentLogo = logoPreview || hotel.logo;

  return (
    <div className="space-y-6 animate-fade-in max-w-4xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Hotel Profile</h1>
          <p className="text-slate-500 text-sm">
            Manage your hotel information
          </p>
        </div>
        <Link to="/hotel/edit">
          <Button variant="outline">
            <Edit className="w-4 h-4 mr-2" />
            Edit Hotel
          </Button>
        </Link>
      </div>

      {/* Main card */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-start gap-5">
            {/* ── Logo with upload button ─────────────────────────────────── */}
            <div className="flex-shrink-0 flex flex-col items-center gap-2">
              <div className="relative">
                <div className="w-20 h-20 rounded-2xl overflow-hidden bg-blue-100 border-2 border-slate-200 flex items-center justify-center">
                  {currentLogo ? (
                    <img
                      src={currentLogo}
                      alt={hotel.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Hotel className="w-8 h-8 text-blue-600" />
                  )}
                </div>
                {/* Camera button */}
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

              {/* Save / Cancel buttons appear after picking a file */}
              {logoFile && (
                <div className="flex flex-col gap-1.5 w-full">
                  <button
                    onClick={() => uploadLogo(logoFile)}
                    disabled={uploadingLogo}
                    className="flex items-center justify-center gap-1 text-xs font-semibold px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-60"
                  >
                    {uploadingLogo ? (
                      <>
                        <Loader2 className="w-3 h-3 animate-spin" /> Saving…
                      </>
                    ) : (
                      <>
                        <Save className="w-3 h-3" /> Save
                      </>
                    )}
                  </button>
                  <button
                    onClick={handleCancelLogo}
                    className="text-xs text-slate-500 hover:text-slate-700 text-center transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              )}
              {!logoFile && (
                <p className="text-xs text-slate-400 text-center">
                  Change logo
                </p>
              )}
            </div>

            {/* Hotel info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-xl font-bold text-slate-900">
                  {hotel.name}
                </h2>
                <span
                  className={`text-xs px-2 py-0.5 rounded-full font-medium ${getStatusColor(hotel.subscriptionStatus)}`}
                >
                  {hotel.subscriptionStatus}
                </span>
              </div>
              <div className="flex items-center gap-1 mt-1">
                {[...Array(hotel.starRating || 3)].map((_, i) => (
                  <Star
                    key={i}
                    className="w-3.5 h-3.5 text-amber-400 fill-amber-400"
                  />
                ))}
              </div>
              {hotel.tagline && (
                <p className="text-slate-400 text-xs italic mt-1">
                  "{hotel.tagline}"
                </p>
              )}
              <p className="text-slate-500 text-sm mt-2 line-clamp-2">
                {hotel.description}
              </p>
            </div>
          </div>

          {/* Contact grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6 pt-6 border-t">
            <div className="flex items-start gap-2">
              <MapPin className="w-4 h-4 text-slate-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-xs text-slate-400">Address</p>
                <p className="text-sm font-medium text-slate-800">
                  {hotel.address}
                </p>
                <p className="text-sm text-slate-500">
                  {hotel.city}, {hotel.state}, {hotel.country}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <Phone className="w-4 h-4 text-slate-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-xs text-slate-400">Phone</p>
                <p className="text-sm font-medium text-slate-800">
                  {hotel.phone}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <Mail className="w-4 h-4 text-slate-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-xs text-slate-400">Email</p>
                <p className="text-sm font-medium text-slate-800">
                  {hotel.email}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            {
              label: "Total Rooms",
              value: stats.totalRooms,
              sub: `${stats.availableRooms} available`,
              icon: BedDouble,
              color: "bg-blue-600",
            },
            {
              label: "Active Bookings",
              value: stats.activeBookings,
              sub: undefined,
              icon: CalendarCheck,
              color: "bg-green-600",
            },
            {
              label: "Total Staff",
              value: stats.totalStaff,
              sub: undefined,
              icon: Users,
              color: "bg-purple-600",
            },
          ].map(({ label, value, sub, icon: Icon, color }) => (
            <Card key={label}>
              <CardContent className="p-4 flex items-center gap-3">
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`}
                >
                  <Icon className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-xs text-slate-400">{label}</p>
                  <p className="text-xl font-bold text-slate-900">{value}</p>
                  {sub && <p className="text-xs text-slate-400">{sub}</p>}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Subscription */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div>
              <p className="text-xs text-slate-400">Subscription Plan</p>
              <p className="font-semibold text-slate-900 capitalize">
                {hotel.subscriptionPlan?.toLowerCase()} Hotel Plan
              </p>
            </div>
            <div>
              <p className="text-xs text-slate-400">Expires</p>
              <p className="font-semibold text-slate-900">
                {hotel.subscriptionExpiry
                  ? formatDate(hotel.subscriptionExpiry)
                  : "—"}
              </p>
            </div>
            <div>
              <p className="text-xs text-slate-400">Status</p>
              <span
                className={`text-xs px-2 py-1 rounded-full font-medium ${getStatusColor(hotel.subscriptionStatus)}`}
              >
                {hotel.subscriptionStatus}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
