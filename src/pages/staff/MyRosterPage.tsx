// src/pages/staff/MyRosterPage.tsx
// Personal schedule view — any staff member sees only their own shifts,
// and only once the Director/Admin has published the week.

import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { hotelApi, rosterApi } from "@/api/services";
import { Card, CardContent, CardHeader } from "@/components/ui/common";
import { Button } from "@/components/ui/button";
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  Clock,
} from "lucide-react";

function getMonday(d: Date) {
  const date = new Date(d);
  const day = date.getDay();

  date.setDate(date.getDate() + (day === 0 ? -6 : 1 - day));
  date.setHours(0, 0, 0, 0);

  return date;
}

// IMPORTANT:
// Use local date values instead of toISOString().
// toISOString() converts Nigerian time (UTC+1) to UTC,
// which can move midnight to the previous calendar day.
function toISODate(d: Date) {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function addDays(d: Date, n: number) {
  const nd = new Date(d);
  nd.setDate(nd.getDate() + n);

  return nd;
}

export default function MyRosterPage() {
  const [weekStart, setWeekStart] = useState(() => getMonday(new Date()));

  const weekDays = useMemo(
    () => Array.from({ length: 7 }, (_, i) => addDays(weekStart, i)),
    [weekStart],
  );

  // Get the hotel belonging to the logged-in user
  const { data: hotel } = useQuery({
    queryKey: ["my-hotel"],
    queryFn: () => hotelApi.getMyHotel().then((r) => r.data?.data || r.data),
  });

  // Get ONLY the logged-in user's roster.
  // The backend gets the userId from the JWT.
  const { data: myWeek, isLoading } = useQuery({
    queryKey: ["my-roster", hotel?.id, toISODate(weekStart)],

    queryFn: () =>
      rosterApi
        .getMyWeek(hotel!.id, toISODate(weekStart))
        .then((r) => r.data?.data || r.data),

    enabled: !!hotel?.id,
  });

  // Convert backend entries into:
  // {
  //   "2026-10-05": Monday entry,
  //   "2026-10-09": Friday entry,
  //   "2026-10-11": Sunday entry
  // }
  //
  // We use split("T")[0] because the backend already
  // gives us the correct calendar date.
  const entriesByDate = useMemo(() => {
    const map = new Map<string, any>();

    (myWeek?.entries ?? []).forEach((entry: any) => {
      const dateKey = entry.date.split("T")[0];

      map.set(dateKey, entry);
    });

    return map;
  }, [myWeek]);

  const notYetPublished = myWeek?.status === "DRAFT";

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold">My Schedule</h1>

        <p className="text-muted-foreground text-sm">
          Your shifts for the week
        </p>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            {/* Previous week */}
            <Button
              size="sm"
              variant="outline"
              onClick={() => setWeekStart((w) => addDays(w, -7))}
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>

            {/* Current week */}
            <div className="flex items-center gap-2 text-sm font-medium">
              <CalendarIcon className="w-4 h-4 text-slate-400" />

              {weekDays[0].toLocaleDateString("en-GB", {
                day: "numeric",
                month: "short",
              })}

              {" – "}

              {weekDays[6].toLocaleDateString("en-GB", {
                day: "numeric",
                month: "short",
                year: "numeric",
              })}
            </div>

            {/* Next week */}
            <Button
              size="sm"
              variant="outline"
              onClick={() => setWeekStart((w) => addDays(w, 7))}
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>

        <CardContent>
          {isLoading ? (
            <div className="space-y-2">
              {[...Array(7)].map((_, i) => (
                <div
                  key={i}
                  className="h-14 bg-slate-100 rounded-lg animate-pulse"
                />
              ))}
            </div>
          ) : notYetPublished ? (
            <p className="text-sm text-slate-500 text-center py-10">
              The schedule for this week hasn't been published yet. Check back
              soon.
            </p>
          ) : (
            <div className="space-y-2">
              {weekDays.map((d) => {
                const dateKey = toISODate(d);

                const entry = entriesByDate.get(dateKey);

                const shift = entry?.shiftType;

                const isToday = dateKey === toISODate(new Date());

                return (
                  <div
                    key={dateKey}
                    className={`flex items-center justify-between p-3 rounded-lg border ${
                      isToday
                        ? "border-blue-300 bg-blue-50"
                        : "border-slate-100"
                    }`}
                  >
                    {/* Date */}
                    <div>
                      <p className="text-sm font-semibold text-slate-800">
                        {d.toLocaleDateString("en", {
                          weekday: "long",
                        })}

                        {isToday && (
                          <span className="ml-2 text-xs text-blue-600 font-normal">
                            Today
                          </span>
                        )}
                      </p>

                      <p className="text-xs text-slate-400">
                        {d.toLocaleDateString("en-GB", {
                          day: "numeric",
                          month: "short",
                        })}
                      </p>
                    </div>

                    {/* Shift */}
                    {shift ? (
                      <div className="flex items-center gap-2">
                        {shift.startTime && (
                          <span className="text-xs text-slate-500 flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5" />

                            {shift.startTime}
                            {"–"}
                            {shift.endTime}
                          </span>
                        )}

                        <span
                          className="text-xs font-bold px-2.5 py-1 rounded-full"
                          style={{
                            backgroundColor: `${shift.color}22`,
                            color: shift.color,
                          }}
                        >
                          {shift.name}
                        </span>
                      </div>
                    ) : (
                      <span className="text-xs text-slate-400">
                        No shift assigned
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
