// src/pages/settings/RosterSettingsPage.tsx
// Roster customization — Director/Admin only. Manage shift types, custom
// columns, and staff row order/visibility, so each hotel shapes its own grid.

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { hotelApi, staffApi, rosterApi } from "@/api/services";
import { useAuth } from "@/contexts/AuthContext";
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
import {
  Lock,
  Plus,
  Trash2,
  GripVertical,
  Eye,
  EyeOff,
  Palette,
  Loader2,
} from "lucide-react";

const ALLOWED_ROLES = ["HOTEL_DIRECTOR", "ADMIN"];

function SectionCard({ icon: Icon, title, description, children }: any) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <Icon className="w-4 h-4" /> {title}
        </CardTitle>
        <p className="text-xs text-slate-400 mt-0.5">{description}</p>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}

export default function RosterSettingsPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const canManage = ALLOWED_ROLES.includes(user?.role ?? "");

  const { data: hotel } = useQuery({
    queryKey: ["my-hotel"],
    queryFn: () => hotelApi.getMyHotel().then((r) => r.data?.data || r.data),
    enabled: canManage,
  });

  // ── Shift types ───────────────────────────────────────────────────────
  const { data: shiftTypes } = useQuery({
    queryKey: ["shift-types", hotel?.id],
    queryFn: () =>
      rosterApi.getShiftTypes(hotel!.id).then((r) => r.data?.data || r.data),
    enabled: !!hotel?.id,
  });

  const [newShift, setNewShift] = useState({
    name: "",
    code: "",
    startTime: "",
    endTime: "",
    color: "#2563eb",
  });

  const { mutate: addShiftType, isPending: addingShift } = useMutation({
    mutationFn: () =>
      rosterApi.createShiftType(hotel!.id, {
        name: newShift.name,
        code: newShift.code.toUpperCase(),
        startTime: newShift.startTime || undefined,
        endTime: newShift.endTime || undefined,
        color: newShift.color,
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["shift-types", hotel?.id] });
      setNewShift({
        name: "",
        code: "",
        startTime: "",
        endTime: "",
        color: "#2563eb",
      });
      toast.success("Shift type added");
    },
    onError: (e: any) =>
      toast.error("Failed to add shift type", e.response?.data?.message),
  });

  const { mutate: removeShiftType } = useMutation({
    mutationFn: (id: string) => rosterApi.deactivateShiftType(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["shift-types", hotel?.id] });
      toast.success("Shift type removed");
    },
  });

  // ── Custom columns ────────────────────────────────────────────────────
  const { data: columns } = useQuery({
    queryKey: ["roster-columns", hotel?.id],
    queryFn: () =>
      rosterApi.getColumns(hotel!.id).then((r) => r.data?.data || r.data),
    enabled: !!hotel?.id,
  });

  const [newColumn, setNewColumn] = useState({
    label: "",
    type: "TEXT" as "TEXT" | "NUMBER",
  });

  const { mutate: addColumn, isPending: addingColumn } = useMutation({
    mutationFn: () => rosterApi.createColumn(hotel!.id, newColumn),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["roster-columns", hotel?.id] });
      setNewColumn({ label: "", type: "TEXT" });
      toast.success("Column added");
    },
    onError: (e: any) =>
      toast.error("Failed to add column", e.response?.data?.message),
  });

  const { mutate: removeColumn } = useMutation({
    mutationFn: (id: string) => rosterApi.deactivateColumn(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["roster-columns", hotel?.id] });
      toast.success("Column removed");
    },
  });

  // ── Staff order / visibility ──────────────────────────────────────────
  const { data: staffList } = useQuery({
    queryKey: ["staff-list-settings", hotel?.id],
    queryFn: () =>
      staffApi.getAll(hotel!.id, { limit: 200 }).then((r) => {
        const list = r.data?.data?.data || r.data?.data || r.data || [];
        return list
          .filter((s: any) => s.isActive)
          .sort(
            (a: any, b: any) => (a.rosterOrder ?? 0) - (b.rosterOrder ?? 0),
          );
      }),
    enabled: !!hotel?.id,
  });

  const [orderedStaff, setOrderedStaff] = useState<any[] | null>(null);
  const effectiveStaff = orderedStaff ?? staffList ?? [];
  const [dragIndex, setDragIndex] = useState<number | null>(null);

  const { mutate: saveStaffOrder, isPending: savingOrder } = useMutation({
    mutationFn: (staffIds: string[]) => rosterApi.reorderStaff(staffIds),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["staff-list-settings", hotel?.id] });
      toast.success("Staff order saved");
    },
  });

  const { mutate: toggleVisibility } = useMutation({
    mutationFn: ({ staffId, hidden }: { staffId: string; hidden: boolean }) =>
      rosterApi.toggleStaffVisibility(staffId, hidden),
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: ["staff-list-settings", hotel?.id] }),
  });

  const handleDragStart = (index: number) => setDragIndex(index);
  const handleDragOver = (index: number) => {
    if (dragIndex === null || dragIndex === index) return;
    const list = [...effectiveStaff];
    const [moved] = list.splice(dragIndex, 1);
    list.splice(index, 0, moved);
    setDragIndex(index);
    setOrderedStaff(list);
  };
  const handleDragEnd = () => {
    setDragIndex(null);
    if (orderedStaff) saveStaffOrder(orderedStaff.map((s) => s.id));
  };

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
            Only Hotel Directors and Admins can customize roster settings.
          </p>
        </div>
        <Button variant="outline" onClick={() => navigate("/roster")}>
          Back to Roster
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Roster Settings</h1>
        <p className="text-slate-500 text-sm mt-0.5">
          Customize shift types, columns, and staff order for your roster
        </p>
      </div>

      {/* ── Shift types ──────────────────────────────────────────────────── */}
      <SectionCard
        icon={Palette}
        title="Shift Types"
        description="What appears in each cell — e.g. Morning, Night, Off"
      >
        <div className="space-y-2 mb-4">
          {(shiftTypes ?? []).map((st: any) => (
            <div
              key={st.id}
              className="flex items-center justify-between p-2.5 rounded-lg border border-slate-100"
            >
              <div className="flex items-center gap-2.5">
                <span
                  className="w-3 h-3 rounded"
                  style={{ backgroundColor: st.color }}
                />
                <span className="text-sm font-medium">{st.name}</span>
                <span className="text-xs text-slate-400 font-mono">
                  ({st.code})
                </span>
                {st.startTime && (
                  <span className="text-xs text-slate-400">
                    {st.startTime}–{st.endTime}
                  </span>
                )}
              </div>
              <button
                onClick={() => removeShiftType(st.id)}
                className="text-red-400 hover:text-red-600"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
          {(!shiftTypes || shiftTypes.length === 0) && (
            <p className="text-xs text-slate-400 text-center py-3">
              No shift types yet — add one below.
            </p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-2">
          <Input
            placeholder="Name (e.g. Morning)"
            value={newShift.name}
            onChange={(e) => setNewShift({ ...newShift, name: e.target.value })}
          />
          <Input
            placeholder="Code (e.g. M)"
            maxLength={4}
            value={newShift.code}
            onChange={(e) => setNewShift({ ...newShift, code: e.target.value })}
          />
          <Input
            type="time"
            value={newShift.startTime}
            onChange={(e) =>
              setNewShift({ ...newShift, startTime: e.target.value })
            }
          />
          <Input
            type="time"
            value={newShift.endTime}
            onChange={(e) =>
              setNewShift({ ...newShift, endTime: e.target.value })
            }
          />
        </div>
        <div className="flex items-center gap-2 mt-2">
          <input
            type="color"
            value={newShift.color}
            onChange={(e) =>
              setNewShift({ ...newShift, color: e.target.value })
            }
            className="w-9 h-9 rounded cursor-pointer border border-slate-200"
          />
          <Button
            size="sm"
            onClick={() => addShiftType()}
            disabled={!newShift.name || !newShift.code || addingShift}
            className="flex-1"
          >
            {addingShift ? (
              <Loader2 className="w-4 h-4 mr-1.5 animate-spin" />
            ) : (
              <Plus className="w-4 h-4 mr-1.5" />
            )}
            Add Shift Type
          </Button>
        </div>
      </SectionCard>

      {/* ── Custom columns ───────────────────────────────────────────────── */}
      <SectionCard
        icon={Plus}
        title="Custom Columns"
        description="Extra columns beyond the 7 weekdays — e.g. Notes, Overtime Hours"
      >
        <div className="space-y-2 mb-4">
          {(columns ?? []).map((col: any) => (
            <div
              key={col.id}
              className="flex items-center justify-between p-2.5 rounded-lg border border-slate-100"
            >
              <div>
                <span className="text-sm font-medium">{col.label}</span>
                <span className="text-xs text-slate-400 ml-2">
                  ({col.type})
                </span>
              </div>
              <button
                onClick={() => removeColumn(col.id)}
                className="text-red-400 hover:text-red-600"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
          {(!columns || columns.length === 0) && (
            <p className="text-xs text-slate-400 text-center py-3">
              No custom columns yet.
            </p>
          )}
        </div>

        <div className="flex gap-2">
          <Input
            placeholder="Column name (e.g. Notes)"
            value={newColumn.label}
            onChange={(e) =>
              setNewColumn({ ...newColumn, label: e.target.value })
            }
            className="flex-1"
          />
          <select
            value={newColumn.type}
            onChange={(e) =>
              setNewColumn({
                ...newColumn,
                type: e.target.value as "TEXT" | "NUMBER",
              })
            }
            className="border border-slate-200 rounded-lg text-sm px-2"
          >
            <option value="TEXT">Text</option>
            <option value="NUMBER">Number</option>
          </select>
          <Button
            size="sm"
            onClick={() => addColumn()}
            disabled={!newColumn.label || addingColumn}
          >
            {addingColumn ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Plus className="w-4 h-4" />
            )}
          </Button>
        </div>
      </SectionCard>

      {/* ── Staff row order / visibility ─────────────────────────────────── */}
      <SectionCard
        icon={GripVertical}
        title="Staff Row Order"
        description="Drag to reorder how staff appear on the roster; toggle to hide inactive rows"
      >
        <div className="space-y-1.5">
          {effectiveStaff.map((s: any, index: number) => (
            <div
              key={s.id}
              draggable
              onDragStart={() => handleDragStart(index)}
              onDragOver={(e) => {
                e.preventDefault();
                handleDragOver(index);
              }}
              onDragEnd={handleDragEnd}
              className={`flex items-center justify-between p-2.5 rounded-lg border cursor-grab active:cursor-grabbing ${
                s.hiddenFromRoster
                  ? "border-slate-100 bg-slate-50 opacity-60"
                  : "border-slate-100"
              }`}
            >
              <div className="flex items-center gap-2.5">
                <GripVertical className="w-4 h-4 text-slate-300" />
                <span className="text-sm font-medium">
                  {s.user?.firstName} {s.user?.lastName}
                </span>
                <span className="text-xs text-slate-400">{s.position}</span>
              </div>
              <button
                onClick={() =>
                  toggleVisibility({
                    staffId: s.id,
                    hidden: !s.hiddenFromRoster,
                  })
                }
                className="text-slate-400 hover:text-slate-600"
                title={
                  s.hiddenFromRoster ? "Show on roster" : "Hide from roster"
                }
              >
                {s.hiddenFromRoster ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
          ))}
        </div>
        {savingOrder && (
          <p className="text-xs text-slate-400 mt-2">Saving order…</p>
        )}
      </SectionCard>
    </div>
  );
}
