// src/components/settings/LocationSettingsCard.tsx
import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { attendanceApi } from "@/api/services";
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
import { getCurrentPosition } from "@/lib/geolocation";
import { MapPin, Loader2, CheckCircle2 } from "lucide-react";

export default function LocationSettingsCard({ hotelId }: { hotelId: string }) {
  const qc = useQueryClient();

  const { data: settings, isLoading } = useQuery({
    queryKey: ["attendance-settings", hotelId],
    queryFn: () =>
      attendanceApi.getSettings(hotelId).then((r) => r.data?.data || r.data),
    enabled: !!hotelId,
  });

  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(
    null,
  );
  const [radius, setRadius] = useState(100);
  const [locating, setLocating] = useState(false);

  useEffect(() => {
    if (settings?.latitude != null && settings?.longitude != null) {
      setCoords({
        lat: Number(settings.latitude),
        lng: Number(settings.longitude),
      });
    }
    if (settings?.attendanceRadiusM) setRadius(settings.attendanceRadiusM);
  }, [settings]);

  const { mutate: saveLocation, isPending: saving } = useMutation({
    mutationFn: () =>
      attendanceApi.setLocation(hotelId, {
        latitude: coords!.lat,
        longitude: coords!.lng,
        attendanceRadiusM: radius,
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["attendance-settings", hotelId] });
      toast.success("Attendance location saved");
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

  if (isLoading) {
    return <div className="h-48 bg-slate-100 rounded-2xl animate-pulse" />;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <MapPin className="w-4 h-4" /> Attendance Location
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-slate-500">
          Set your hotel's exact location so staff can only clock in/out when
          physically on-site. Stand at the hotel's main entrance and tap the
          button below.
        </p>

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

        {coords && (
          <div className="text-xs text-slate-400 font-mono bg-slate-50 rounded-lg p-2.5">
            Lat: {coords.lat.toFixed(6)} · Lng: {coords.lng.toFixed(6)}
          </div>
        )}

        <div className="space-y-1.5 max-w-xs">
          <Label>Allowed radius (meters)</Label>
          <Input
            type="number"
            min={20}
            max={2000}
            value={radius}
            onChange={(e) => setRadius(Number(e.target.value))}
          />
          <p className="text-xs text-slate-400">
            Staff must be within this distance to clock in/out. 100m covers most
            single-building properties.
          </p>
        </div>

        <div className="flex justify-end pt-2 border-t">
          <Button onClick={() => saveLocation()} disabled={!coords || saving}>
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
  );
}
