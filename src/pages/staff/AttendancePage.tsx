// src/pages/attendance/AttendancePage.tsx — FULL REPLACEMENT
// Location Settings link visible only to HOTEL_DIRECTOR/ADMIN, routing to
// its own dedicated page rather than an inline card.

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { hotelApi, attendanceApi, staffApi } from "@/api/services";
import { formatDateTime, getInitials } from "@/lib/utils";
import { getCurrentPosition } from "@/lib/geolocation";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/common";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/toaster";
import { Clock, LogIn, LogOut, Users, MapPin } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const GEOFENCE_MANAGER_ROLES = ["HOTEL_DIRECTOR", "ADMIN"];

export default function AttendancePage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0],
  );

  const canManageGeofence = GEOFENCE_MANAGER_ROLES.includes(user?.role ?? "");

  const { data: hotel } = useQuery({
    queryKey: ["my-hotel"],
    queryFn: () => hotelApi.getMyHotel().then((r) => r.data?.data || r.data),
  });

  const { data: todayStatus, refetch: refetchStatus } = useQuery({
    queryKey: ["today-status"],
    queryFn: () =>
      attendanceApi.getTodayStatus().then((r) => r.data?.data || r.data),
  });

  const { data: myStaff } = useQuery({
    queryKey: ["my-staff", hotel?.id],
    queryFn: () =>
      staffApi.getAll(hotel!.id, { limit: 100 }).then((r) => {
        const list = r.data?.data?.data || r.data?.data || r.data || [];
        return list.find((s: any) => s.user?.id === user?.id);
      }),
    enabled: !!hotel?.id,
  });

  const { data: dailyRecords, isLoading } = useQuery({
    queryKey: ["daily-attendance", hotel?.id, selectedDate],
    queryFn: () =>
      attendanceApi
        .getDailyRecords(hotel!.id, selectedDate)
        .then((r) => r.data?.data || r.data),
    enabled: !!hotel?.id,
  });

  const { mutate: clockIn, isPending: clockingIn } = useMutation({
    mutationFn: async () => {
      const { latitude, longitude } = await getCurrentPosition();
      return attendanceApi.clockIn(myStaff!.id, latitude, longitude);
    },
    onSuccess: () => {
      refetchStatus();
      qc.invalidateQueries({ queryKey: ["daily-attendance"] });
      toast.success("Clocked in successfully!");
    },
    onError: (e: any) =>
      toast.error("Clock-in failed", e.response?.data?.message || e.message),
  });

  const { mutate: clockOut, isPending: clockingOut } = useMutation({
    mutationFn: async () => {
      const { latitude, longitude } = await getCurrentPosition();
      return attendanceApi.clockOut(myStaff!.id, latitude, longitude);
    },
    onSuccess: () => {
      refetchStatus();
      qc.invalidateQueries({ queryKey: ["daily-attendance"] });
      toast.success("Clocked out successfully!");
    },
    onError: (e: any) =>
      toast.error("Clock-out failed", e.response?.data?.message || e.message),
  });

  const isClockedIn = todayStatus?.isClockedIn;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold">Attendance</h1>
          <p className="text-muted-foreground text-sm">
            Track clock in/out and daily records
          </p>
        </div>

        {canManageGeofence && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate("/settings/attendance")}
          >
            <MapPin className="w-4 h-4 mr-2" /> Location Settings
          </Button>
        )}
      </div>

      {myStaff && (
        <Card className="border-2 border-blue-100">
          <CardContent className="p-6">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-3">
                <div
                  className={`w-12 h-12 rounded-xl flex items-center justify-center ${isClockedIn ? "bg-green-100" : "bg-slate-100"}`}
                >
                  <Clock
                    className={`w-6 h-6 ${isClockedIn ? "text-green-600" : "text-slate-400"}`}
                  />
                </div>
                <div>
                  <p className="font-semibold">My Attendance</p>
                  <p className="text-sm text-muted-foreground">
                    {isClockedIn
                      ? "🟢 Currently clocked in"
                      : "⚪ Not clocked in"}
                  </p>
                  {todayStatus?.lastRecord && (
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Last: {formatDateTime(todayStatus.lastRecord.timestamp)}
                    </p>
                  )}
                </div>
              </div>
              <div className="flex gap-2">
                {!isClockedIn ? (
                  <Button
                    onClick={() => clockIn()}
                    disabled={clockingIn}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <LogIn className="w-4 h-4 mr-2" />
                    {clockingIn ? "Getting location…" : "Clock In"}
                  </Button>
                ) : (
                  <Button
                    onClick={() => clockOut()}
                    disabled={clockingOut}
                    variant="outline"
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    {clockingOut ? "Getting location…" : "Clock Out"}
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <Users className="w-4 h-4" /> Daily Records
          </CardTitle>
          <input
            type="date"
            className="h-9 rounded-md border border-input bg-background px-3 text-sm"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
          />
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <div
                  key={i}
                  className="h-14 bg-slate-200 rounded-lg animate-pulse"
                />
              ))}
            </div>
          ) : !dailyRecords?.length ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              No attendance records for this date
            </p>
          ) : (
            <div className="space-y-2">
              {dailyRecords.map((record: any, i: number) => (
                <div
                  key={i}
                  className="flex items-center justify-between p-3 rounded-lg border"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-bold">
                      {getInitials(
                        record.user?.firstName,
                        record.user?.lastName,
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-sm">
                        {record.user?.firstName} {record.user?.lastName}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {record.staff?.department} · {record.staff?.position}
                      </p>
                    </div>
                  </div>
                  <div className="text-right text-sm">
                    <div className="flex gap-3">
                      {record.clockIn && (
                        <div>
                          <p className="text-xs text-muted-foreground">In</p>
                          <p className="font-medium text-green-600">
                            {new Date(record.clockIn).toLocaleTimeString("en", {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </p>
                        </div>
                      )}
                      {record.clockOut && (
                        <div>
                          <p className="text-xs text-muted-foreground">Out</p>
                          <p className="font-medium text-slate-600">
                            {new Date(record.clockOut).toLocaleTimeString(
                              "en",
                              { hour: "2-digit", minute: "2-digit" },
                            )}
                          </p>
                        </div>
                      )}
                      {record.hoursWorked && (
                        <div>
                          <p className="text-xs text-muted-foreground">Hours</p>
                          <p className="font-bold text-blue-600">
                            {record.hoursWorked}h
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
