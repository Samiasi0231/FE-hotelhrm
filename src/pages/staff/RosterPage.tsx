// src/pages/staff/RosterPage.tsx — FULL REPLACEMENT
// All edits (shift cells + custom column values) are staged locally and only
// sent to the server when "Save Changes" is clicked — drag-fill also stages
// into the same pendingShifts map instead of firing its own request.

import { useState, useMemo, useCallback, useEffect } from "react";
import { useNavigate, Navigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { hotelApi, staffApi, rosterApi } from "@/api/services";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/components/ui/toaster";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/common";
import {
  ChevronLeft,
  ChevronRight,
  Lock,
  Unlock,
  Send,
  Save,
  Loader2,
  Calendar as CalendarIcon,
  Settings,
} from "lucide-react";

const EDITOR_ROLES = ["HOTEL_DIRECTOR", "ADMIN"];

function getMonday(d: Date) {
  const date = new Date(d);
  const day = date.getDay();
  date.setDate(date.getDate() + (day === 0 ? -6 : 1 - day));
  date.setHours(0, 0, 0, 0);
  return date;
}

function toISODate(d: Date) {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function isoDatePart(isoString: string) {
  return isoString.split("T")[0];
}

function addDays(d: Date, n: number) {
  const nd = new Date(d);
  nd.setDate(nd.getDate() + n);
  return nd;
}

export default function RosterPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const canEdit = EDITOR_ROLES.includes(user?.role ?? "");

  const [weekStart, setWeekStart] = useState(() => getMonday(new Date()));
  const weekDays = useMemo(
    () => Array.from({ length: 7 }, (_, i) => addDays(weekStart, i)),
    [weekStart],
  );
  const weekKey = toISODate(weekStart);

  // ── Staged edits — nothing here has been saved to the server yet ─────────
  // Keys are `${staffId}_${date}` for shifts, `${staffId}_${columnId}` for columns.
  const [pendingShifts, setPendingShifts] = useState<
    Record<string, string | null>
  >({});
  const [pendingColumnValues, setPendingColumnValues] = useState<
    Record<string, string>
  >({});
  const hasPendingChanges =
    Object.keys(pendingShifts).length > 0 ||
    Object.keys(pendingColumnValues).length > 0;

  // Drag-fill state (paints into pendingShifts as it drags)
  const [dragging, setDragging] = useState<{
    staffId: string;
    shiftTypeId: string | null;
  } | null>(null);

  const { data: hotel } = useQuery({
    queryKey: ["my-hotel"],
    queryFn: () => hotelApi.getMyHotel().then((r) => r.data?.data || r.data),
  });

  const { data: rawStaffList } = useQuery({
    queryKey: ["staff-list", hotel?.id],
    queryFn: () =>
      staffApi.getAll(hotel!.id, { limit: 200 }).then((r) => {
        const list = r.data?.data?.data || r.data?.data || r.data || [];
        return list.filter((s: any) => s.isActive);
      }),
    enabled: !!hotel?.id,
  });

  const staffList = useMemo(() => {
    if (!rawStaffList) return [];
    return [...rawStaffList]
      .filter((s: any) => !s.hiddenFromRoster)
      .sort((a: any, b: any) => (a.rosterOrder ?? 0) - (b.rosterOrder ?? 0));
  }, [rawStaffList]);

  const { data: shiftTypes } = useQuery({
    queryKey: ["shift-types", hotel?.id],
    queryFn: () =>
      rosterApi.getShiftTypes(hotel!.id).then((r) => r.data?.data || r.data),
    enabled: !!hotel?.id,
  });

  const { data: customColumns } = useQuery({
    queryKey: ["roster-columns", hotel?.id],
    queryFn: () =>
      rosterApi.getColumns(hotel!.id).then((r) => r.data?.data || r.data),
    enabled: !!hotel?.id,
  });

  const { data: roster, isLoading: rosterLoading } = useQuery({
    queryKey: ["roster", hotel?.id, weekKey],
    queryFn: () =>
      rosterApi.getWeek(hotel!.id, weekKey).then((r) => r.data?.data || r.data),
    enabled: !!hotel?.id,
  });

  const entryMap = useMemo(() => {
    const map = new Map<string, any>();
    (roster?.entries ?? []).forEach((e: any) =>
      map.set(`${e.staffId}_${isoDatePart(e.date)}`, e),
    );
    return map;
  }, [roster]);

  const cellValueMap = useMemo(() => {
    const map = new Map<string, any>();
    (roster?.cellValues ?? []).forEach((v: any) =>
      map.set(`${v.staffId}_${v.columnId}`, v),
    );
    return map;
  }, [roster]);

  const isLocked = roster?.status === "LOCKED";

  // Clear staged edits whenever the week or roster identity changes, so stale
  // pending edits from a different week never leak into a newly loaded one.
  useEffect(() => {
    setPendingShifts({});
    setPendingColumnValues({});
  }, [roster?.id]);

  // Warn before leaving the tab with unsaved changes
  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => {
      if (hasPendingChanges) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [hasPendingChanges]);

  // ── Single combined save — one call for shifts, one for columns ──────────
  const { mutate: saveAllChanges, isPending: savingAll } = useMutation({
    mutationFn: async () => {
      const shiftEntries = Object.entries(pendingShifts).map(
        ([key, shiftTypeId]) => {
          const [staffId, date] = key.split("_");
          return { staffId, date, shiftTypeId };
        },
      );
      const columnValues = Object.entries(pendingColumnValues).map(
        ([key, value]) => {
          const [staffId, columnId] = key.split("_");
          return { staffId, columnId, value };
        },
      );

      const calls: Promise<any>[] = [];
      if (shiftEntries.length)
        calls.push(rosterApi.bulkUpsertEntries(roster!.id, shiftEntries));
      if (columnValues.length)
        calls.push(rosterApi.bulkSetCellValues(roster!.id, columnValues));
      await Promise.all(calls);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["roster", hotel?.id, weekKey] });
      setPendingShifts({});
      setPendingColumnValues({});
      toast.success("Roster saved");
    },
    onError: (e: any) =>
      toast.error("Failed to save", e.response?.data?.message),
  });

  // ── Status transitions ────────────────────────────────────────────────────
  const { mutate: publish, isPending: publishing } = useMutation({
    mutationFn: () => rosterApi.publish(roster!.id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["roster"] });
      toast.success("Roster published");
    },
    onError: (e: any) =>
      toast.error("Failed to publish", e.response?.data?.message),
  });
  const { mutate: lockRoster, isPending: locking } = useMutation({
    mutationFn: () => rosterApi.lock(roster!.id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["roster"] });
      toast.success("Roster locked");
    },
    onError: (e: any) =>
      toast.error("Failed to lock", e.response?.data?.message),
  });
  const { mutate: unlockRoster, isPending: unlocking } = useMutation({
    mutationFn: () => rosterApi.unlock(roster!.id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["roster"] });
      toast.success("Roster unlocked");
    },
    onError: (e: any) =>
      toast.error("Failed to unlock", e.response?.data?.message),
  });

  // ── Drag-to-fill — paints into pendingShifts, no network calls during drag ─
  const handleCellMouseDown = useCallback(
    (staffId: string, date: string, currentShiftId: string | null) => {
      if (!canEdit || isLocked) return;
      setDragging({ staffId, shiftTypeId: currentShiftId });
      setPendingShifts((prev) => ({
        ...prev,
        [`${staffId}_${date}`]: currentShiftId,
      }));
    },
    [canEdit, isLocked],
  );

  const handleCellMouseEnter = useCallback(
    (staffId: string, date: string) => {
      if (!dragging || dragging.staffId !== staffId) return;
      setPendingShifts((prev) => ({
        ...prev,
        [`${staffId}_${date}`]: dragging.shiftTypeId,
      }));
    },
    [dragging],
  );

  const handleMouseUp = useCallback(() => {
    setDragging(null);
  }, []);

  const shiftById = useMemo(() => {
    const m = new Map<string, any>();
    (shiftTypes ?? []).forEach((s: any) => m.set(s.id, s));
    return m;
  }, [shiftTypes]);

  if (!canEdit) return <Navigate to="/roster/mine" replace />;

  return (
    <div
      className="space-y-6 animate-fade-in"
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold">Roster</h1>
          <p className="text-muted-foreground text-sm">Weekly staff schedule</p>
        </div>

        <div className="flex items-center gap-2">
          {canEdit && (
            <Button
              size="sm"
              variant="ghost"
              onClick={() => navigate("/settings/roster")}
            >
              <Settings className="w-4 h-4 mr-1.5" /> Customize
            </Button>
          )}

          {canEdit && hasPendingChanges && !isLocked && (
            <Button
              size="sm"
              onClick={() => saveAllChanges()}
              disabled={savingAll}
            >
              {savingAll ? (
                <Loader2 className="w-4 h-4 mr-1.5 animate-spin" />
              ) : (
                <Save className="w-4 h-4 mr-1.5" />
              )}
              Save Changes (
              {Object.keys(pendingShifts).length +
                Object.keys(pendingColumnValues).length}
              )
            </Button>
          )}

          {canEdit && roster && (
            <>
              {roster.status === "DRAFT" && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => publish()}
                  disabled={publishing || hasPendingChanges}
                >
                  {publishing ? (
                    <Loader2 className="w-4 h-4 mr-1.5 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4 mr-1.5" />
                  )}
                  Publish
                </Button>
              )}
              {roster.status !== "LOCKED" ? (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => lockRoster()}
                  disabled={locking || hasPendingChanges}
                >
                  <Lock className="w-4 h-4 mr-1.5" /> Lock
                </Button>
              ) : (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => unlockRoster()}
                  disabled={unlocking}
                >
                  <Unlock className="w-4 h-4 mr-1.5" /> Unlock
                </Button>
              )}
            </>
          )}
        </div>
      </div>

      {hasPendingChanges && (
        <div className="flex items-center gap-2 text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
          You have unsaved changes — click "Save Changes" to apply them.
        </div>
      )}

      <Card>
        <CardHeader className="flex flex-row items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <Button
              size="sm"
              variant="outline"
              onClick={() => setWeekStart((w) => addDays(w, -7))}
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <div className="flex items-center gap-2 text-sm font-medium">
              <CalendarIcon className="w-4 h-4 text-slate-400" />
              {weekDays[0].toLocaleDateString("en-GB", {
                day: "numeric",
                month: "short",
              })}{" "}
              –{" "}
              {weekDays[6].toLocaleDateString("en-GB", {
                day: "numeric",
                month: "short",
                year: "numeric",
              })}
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setWeekStart((w) => addDays(w, 7))}
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>

          {roster && (
            <span
              className={`text-xs font-semibold px-3 py-1 rounded-full ${
                roster.status === "DRAFT"
                  ? "bg-slate-100 text-slate-600"
                  : roster.status === "PUBLISHED"
                    ? "bg-green-100 text-green-700"
                    : "bg-red-100 text-red-700"
              }`}
            >
              {roster.status}
            </span>
          )}
        </CardHeader>

        <CardContent className="overflow-x-auto">
          {rosterLoading || !staffList.length ? (
            <div className="space-y-2">
              {[...Array(5)].map((_, i) => (
                <div
                  key={i}
                  className="h-12 bg-slate-100 rounded animate-pulse"
                />
              ))}
            </div>
          ) : (
            <table className="w-full border-collapse select-none">
              <thead>
                <tr>
                  <th className="text-left text-xs font-semibold text-slate-500 p-2 sticky left-0 bg-white min-w-[160px]">
                    Staff
                  </th>
                  {weekDays.map((d) => (
                    <th
                      key={toISODate(d)}
                      className="text-center text-xs font-semibold text-slate-500 p-2 min-w-[90px]"
                    >
                      <div>
                        {d.toLocaleDateString("en", { weekday: "short" })}
                      </div>
                      <div className="text-slate-400 font-normal">
                        {d.getDate()}
                      </div>
                    </th>
                  ))}
                  {(customColumns ?? []).map((col: any) => (
                    <th
                      key={col.id}
                      className="text-center text-xs font-semibold text-slate-500 p-2 min-w-[110px] border-l border-slate-100"
                    >
                      {col.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {staffList.map((s: any) => (
                  <tr key={s.id} className="border-t border-slate-100">
                    <td className="p-2 sticky left-0 bg-white text-sm font-medium text-slate-800">
                      {s.user?.firstName} {s.user?.lastName}
                      <div className="text-xs text-slate-400 font-normal">
                        {s.position}
                      </div>
                    </td>

                    {weekDays.map((d) => {
                      const dateKey = toISODate(d);
                      const cellKey = `${s.id}_${dateKey}`;
                      const pending = pendingShifts[cellKey];
                      const entry = entryMap.get(cellKey);
                      const activeShiftId =
                        pending !== undefined
                          ? pending
                          : (entry?.shiftTypeId ?? null);
                      const shift = activeShiftId
                        ? shiftById.get(activeShiftId)
                        : null;
                      const isPendingCell = cellKey in pendingShifts;

                      return (
                        <td
                          key={dateKey}
                          className="p-1 text-center"
                          onMouseDown={() =>
                            handleCellMouseDown(s.id, dateKey, activeShiftId)
                          }
                          onMouseEnter={() =>
                            handleCellMouseEnter(s.id, dateKey)
                          }
                        >
                          {canEdit && !isLocked ? (
                            <select
                              value={activeShiftId ?? ""}
                              onChange={(e) =>
                                setPendingShifts((prev) => ({
                                  ...prev,
                                  [cellKey]: e.target.value || null,
                                }))
                              }
                              className={`w-full text-xs rounded-lg py-2 px-1 font-semibold cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-400 ${
                                isPendingCell
                                  ? "border-2 border-amber-400"
                                  : "border-0"
                              }`}
                              style={{
                                backgroundColor: shift
                                  ? `${shift.color}22`
                                  : "#f1f5f9",
                                color: shift ? shift.color : "#94a3b8",
                              }}
                            >
                              <option value="">—</option>
                              {(shiftTypes ?? []).map((st: any) => (
                                <option key={st.id} value={st.id}>
                                  {st.code}
                                </option>
                              ))}
                            </select>
                          ) : (
                            <div
                              className="w-full text-xs rounded-lg py-2 px-1 font-semibold"
                              style={{
                                backgroundColor: shift
                                  ? `${shift.color}22`
                                  : "#f8fafc",
                                color: shift ? shift.color : "#cbd5e1",
                              }}
                            >
                              {shift ? shift.code : "—"}
                            </div>
                          )}
                        </td>
                      );
                    })}

                    {(customColumns ?? []).map((col: any) => {
                      const key = `${s.id}_${col.id}`;
                      const existing = cellValueMap.get(key);
                      const pendingValue = pendingColumnValues[key];
                      const displayValue =
                        pendingValue !== undefined
                          ? pendingValue
                          : (existing?.value ?? "");
                      const isPendingCell = key in pendingColumnValues;

                      return (
                        <td
                          key={col.id}
                          className="p-1 border-l border-slate-100"
                        >
                          {canEdit && !isLocked ? (
                            <input
                              type={col.type === "NUMBER" ? "number" : "text"}
                              defaultValue={displayValue}
                              onBlur={(e) => {
                                if (
                                  e.target.value !== (existing?.value ?? "")
                                ) {
                                  setPendingColumnValues((prev) => ({
                                    ...prev,
                                    [key]: e.target.value,
                                  }));
                                }
                              }}
                              className={`w-full text-xs rounded-lg py-1.5 px-2 focus:outline-none focus:ring-2 focus:ring-blue-400 ${
                                isPendingCell
                                  ? "border-2 border-amber-400"
                                  : "border border-slate-200"
                              }`}
                            />
                          ) : (
                            <div className="text-xs text-slate-600 px-2 py-1.5">
                              {existing?.value || "—"}
                            </div>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>

      {shiftTypes?.length > 0 && (
        <div className="flex flex-wrap gap-3 text-xs">
          {shiftTypes.map((st: any) => (
            <div key={st.id} className="flex items-center gap-1.5">
              <span
                className="w-3 h-3 rounded"
                style={{ backgroundColor: st.color }}
              />
              <span className="text-slate-600">
                {st.code} — {st.name}
                {st.startTime ? ` (${st.startTime}–${st.endTime})` : ""}
              </span>
            </div>
          ))}
        </div>
      )}

      {canEdit && (!shiftTypes || shiftTypes.length === 0) && (
        <p className="text-sm text-amber-600 bg-amber-50 border border-amber-200 rounded-lg p-3">
          No shift types configured yet.{" "}
          <button
            onClick={() => navigate("/settings/roster")}
            className="underline font-medium"
          >
            Add one in Roster Settings.
          </button>
        </p>
      )}
    </div>
  );
}
