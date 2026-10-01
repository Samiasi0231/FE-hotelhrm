// src/pages/settings/AttendanceSettingsPage.tsx — FULL REPLACEMENT
// Dedicated page for geofence configuration — HOTEL_DIRECTOR/ADMIN only.
// Supports both CIRCLE (pin + radius) and POLYGON (custom marked area) modes.

import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { hotelApi, attendanceApi } from "@/api/services";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/components/ui/toaster";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/common";

import GoogleLocationPicker from "@/pages/settings/google-loacation-picker";
import { getCurrentPosition } from "@/lib/geolocation";
import {
  MapPin,
  Loader2,
  CheckCircle2,
  Lock,
  ShieldCheck,
  ShieldOff,
} from "lucide-react";

const ALLOWED_ROLES = ["HOTEL_DIRECTOR", "ADMIN"];

export default function AttendanceSettingsPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const canManage = ALLOWED_ROLES.includes(user?.role ?? "");

  const [geofenceType, setGeofenceType] = useState<"CIRCLE" | "POLYGON">(
    "CIRCLE",
  );
  const [polygonPoints, setPolygonPoints] = useState<
    { lat: number; lng: number }[]
  >([]);
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(
    null,
  );
  const [radius, setRadius] = useState(100);
  const [enabled, setEnabled] = useState(true);
  const [locating, setLocating] = useState(false);

  const { data: hotel } = useQuery({
    queryKey: ["my-hotel"],
    queryFn: () => hotelApi.getMyHotel().then((r) => r.data?.data || r.data),
    enabled: canManage,
  });

  const { data: settings, isLoading: settingsLoading } = useQuery({
    queryKey: ["attendance-settings", hotel?.id],
    queryFn: () =>
      attendanceApi.getSettings(hotel!.id).then((r) => r.data?.data || r.data),
    enabled: !!hotel?.id && canManage,
  });

  useEffect(() => {
    if (settings?.latitude != null && settings?.longitude != null) {
      setCoords({
        lat: Number(settings.latitude),
        lng: Number(settings.longitude),
      });
    }
    if (settings?.attendanceRadiusM) setRadius(settings.attendanceRadiusM);
    if (settings?.attendanceGeofenceEnabled !== undefined)
      setEnabled(settings.attendanceGeofenceEnabled);
    if (settings?.attendanceGeofenceType)
      setGeofenceType(settings.attendanceGeofenceType);
    if (settings?.attendanceGeofencePoints)
      setPolygonPoints(settings.attendanceGeofencePoints);
  }, [settings]);

  const { mutate: toggleGeofence, isPending: toggling } = useMutation({
    mutationFn: (next: boolean) =>
      attendanceApi.toggleGeofence(hotel!.id, next),
    onSuccess: (_, next) => {
      setEnabled(next);
      qc.invalidateQueries({ queryKey: ["attendance-settings", hotel?.id] });
      toast.success(
        next ? "Location check enabled" : "Location check disabled",
      );
    },
    onError: (e: any) =>
      toast.error("Failed to update", e.response?.data?.message),
  });

  const { mutate: saveLocation, isPending: saving } = useMutation({
    mutationFn: () =>
      attendanceApi.setLocation(hotel!.id, {
        attendanceGeofenceType: geofenceType,
        ...(geofenceType === "CIRCLE"
          ? {
              latitude: coords!.lat,
              longitude: coords!.lng,
              attendanceRadiusM: radius,
            }
          : { attendanceGeofencePoints: polygonPoints }),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["attendance-settings", hotel?.id] });
      toast.success("Attendance area saved");
    },
    onError: (e: any) =>
      toast.error("Failed to save", e.response?.data?.message),
  });

  const captureLocation = async () => {
    setLocating(true);
    try {
      const pos = await getCurrentPosition();
      setCoords({ lat: pos.latitude, lng: pos.longitude });
      toast.success("Location captured — review and save below");
    } catch (err: any) {
      toast.error("Couldn't get location", err.message);
    } finally {
      setLocating(false);
    }
  };

  // ── Save eligibility differs by mode ────────────────────────────────────
  const canSave =
    geofenceType === "CIRCLE" ? !!coords : polygonPoints.length >= 3;

  if (!canManage) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 text-center px-4">
        <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center">
          <Lock className="w-8 h-8 text-red-400" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-slate-900">
            Access Restricted
          </h2>
          <p className="text-slate-500 text-sm mt-1 max-w-xs">
            Only Hotel Directors and Admins can manage attendance location
            settings.
          </p>
        </div>
        <Button variant="outline" onClick={() => navigate("/attendance")}>
          Back to Attendance
        </Button>
      </div>
    );
  }

  if (settingsLoading || !hotel) {
    return (
      <div className="space-y-4 animate-pulse max-w-xl">
        <div className="h-8 w-64 bg-slate-200 rounded" />
        <div className="h-80 bg-slate-100 rounded-2xl" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in max-w-xl">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">
          Attendance Location
        </h1>
        <p className="text-slate-500 text-sm mt-0.5">
          Control whether staff must be physically on-site to clock in/out
        </p>
      </div>

      {/* ── On/Off toggle ─────────────────────────────────────────────────── */}
      <Card>
        <CardContent className="p-5">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center ${enabled ? "bg-green-100" : "bg-slate-100"}`}
              >
                {enabled ? (
                  <ShieldCheck className="w-5 h-5 text-green-600" />
                ) : (
                  <ShieldOff className="w-5 h-5 text-slate-400" />
                )}
              </div>
              <div>
                <p className="font-semibold text-slate-900">
                  Location check is {enabled ? "ON" : "OFF"}
                </p>
                <p className="text-xs text-slate-500">
                  {enabled
                    ? "Staff must be within the marked area to clock in/out"
                    : "Staff can clock in/out from anywhere"}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => toggleGeofence(!enabled)}
              disabled={toggling}
              className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors flex-shrink-0 disabled:opacity-50 ${enabled ? "bg-green-500" : "bg-slate-300"}`}
            >
              <span
                className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-sm transition-transform ${enabled ? "translate-x-6" : "translate-x-1"}`}
              />
            </button>
          </div>
        </CardContent>
      </Card>

      {/* ── Location + shape configuration ──────────────────────────────────── */}
      <Card className={!enabled ? "opacity-50 pointer-events-none" : ""}>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <MapPin className="w-4 h-4" /> Hotel Location & Attendance Area
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          {/* "Use my current location" only makes sense in CIRCLE mode —
              in POLYGON mode the map click IS the location-setting action. */}
          {geofenceType === "CIRCLE" && (
            <div className="flex items-center gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={captureLocation}
                disabled={locating}
              >
                {locating ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Getting
                    location…
                  </>
                ) : (
                  <>
                    <MapPin className="w-4 h-4 mr-2" /> Use my current location
                  </>
                )}
              </Button>
              {coords && (
                <span className="text-sm text-green-600 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" /> Location set
                </span>
              )}
            </div>
          )}

          {geofenceType === "CIRCLE" && coords && (
            <p className="text-xs text-slate-400 font-mono bg-slate-50 rounded-lg p-2.5">
              Lat: {coords.lat.toFixed(6)} · Lng: {coords.lng.toFixed(6)}
            </p>
          )}

          <GoogleLocationPicker
            geofenceType={geofenceType}
            onGeofenceTypeChange={setGeofenceType}
            latitude={coords?.lat ?? null}
            longitude={coords?.lng ?? null}
            radiusMeters={radius}
            onLocationChange={(lat, lng) => setCoords({ lat, lng })}
            polygonPoints={polygonPoints}
            onPolygonPointsChange={setPolygonPoints}
          />

          {/* Radius +/- controls only apply to CIRCLE mode */}
          {geofenceType === "CIRCLE" && (
            <div className="flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => setRadius((r) => Math.max(20, r - 10))}
                className="w-9 h-9 rounded-full border border-slate-300 text-slate-600 hover:bg-slate-50 flex items-center justify-center font-bold text-lg"
              >
                −
              </button>
              <div className="text-center min-w-[90px]">
                <p className="text-2xl font-bold text-blue-600 tabular-nums">
                  {radius}m
                </p>
                <p className="text-xs text-slate-400">radius</p>
              </div>
              <button
                type="button"
                onClick={() => setRadius((r) => Math.min(2000, r + 10))}
                className="w-9 h-9 rounded-full border border-slate-300 text-slate-600 hover:bg-slate-50 flex items-center justify-center font-bold text-lg"
              >
                +
              </button>
            </div>
          )}

          {/* Polygon mode: point count feedback in place of the radius readout */}
          {geofenceType === "POLYGON" && (
            <p className="text-center text-sm text-slate-500">
              {polygonPoints.length < 3
                ? `Mark ${3 - polygonPoints.length} more point${3 - polygonPoints.length === 1 ? "" : "s"} to complete the area`
                : `Area marked with ${polygonPoints.length} points`}
            </p>
          )}

          <div className="flex justify-end pt-3 border-t">
            <Button
              onClick={() => saveLocation()}
              disabled={!canSave || saving}
            >
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Saving…
                </>
              ) : (
                "Save Location"
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
