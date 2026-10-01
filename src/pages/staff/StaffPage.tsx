import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { hotelApi, staffApi, inviteApi } from "@/api/services";
import { getInitials, getStatusColor } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input, Card, CardContent } from "@/components/ui/common";
import { Mail, Search, ShieldOff, ShieldCheck, Eye } from "lucide-react";
import { toast } from "@/components/ui/toaster";

export default function StaffPage() {
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [deptFilter, setDeptFilter] = useState("");

  const { data: hotel } = useQuery({
    queryKey: ["my-hotel"],
    queryFn: () => hotelApi.getMyHotel().then((r) => r.data?.data || r.data),
  });

  const { data: staffData, isLoading } = useQuery({
    queryKey: ["staff", hotel?.id, deptFilter],
    queryFn: () =>
      staffApi
        .getAll(hotel!.id, { department: deptFilter || undefined, limit: 100 })
        .then((r) => r.data?.data || r.data),
    enabled: !!hotel?.id,
  });

  const { data: departments } = useQuery({
    queryKey: ["departments", hotel?.id],
    queryFn: () =>
      staffApi.getDepartments(hotel!.id).then((r) => r.data?.data || r.data),
    enabled: !!hotel?.id,
  });

  const { mutate: revoke } = useMutation({
    mutationFn: (staffId: string) => inviteApi.revokeAccess(staffId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["staff"] });
      toast.success("Access revoked");
    },
    onError: (e: any) =>
      toast.error(
        "Error",
        e.response?.data?.message || "Failed to revoke access",
      ),
  });

  const { mutate: grant } = useMutation({
    mutationFn: (staffId: string) => inviteApi.grantAccess(staffId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["staff"] });
      toast.success("Access granted");
    },
    onError: (e: any) =>
      toast.error(
        "Error",
        e.response?.data?.message || "Failed to grant access",
      ),
  });

  const staff = staffData?.data || staffData || [];
  const filtered = staff.filter(
    (s: any) =>
      `${s.user?.firstName} ${s.user?.lastName}`
        .toLowerCase()
        .includes(search.toLowerCase()) ||
      s.employeeId?.toLowerCase().includes(search.toLowerCase()) ||
      s.department?.toLowerCase().includes(search.toLowerCase()),
  );

  const roleColors: Record<string, string> = {
    ADMIN: "bg-purple-100 text-purple-700",
    ADMIN_HR: "bg-blue-100 text-blue-700",
    STAFF: "bg-slate-100 text-slate-700",
    HOTEL_DIRECTOR: "bg-amber-100 text-amber-700",
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold">Staff</h1>
          <p className="text-muted-foreground text-sm">
            {staff.length} total staff members
          </p>
        </div>
        <Link to="/staff/invite">
          <Button>
            <Mail className="w-4 h-4 mr-2" />
            Invite Staff
          </Button>
        </Link>
      </div>

      <div className="flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search staff..."
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select
          className="h-10 rounded-md border border-input bg-background px-3 text-sm"
          value={deptFilter}
          onChange={(e) => setDeptFilter(e.target.value)}
        >
          <option value="">All Departments</option>
          {(departments || []).map((d: any) => (
            <option key={d.department} value={d.department}>
              {d.department} ({d.count})
            </option>
          ))}
        </select>
      </div>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-slate-50">
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">
                  Staff
                </th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">
                  ID
                </th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">
                  Department
                </th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">
                  Position
                </th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">
                  Role
                </th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">
                  Status
                </th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {isLoading ? (
                [...Array(4)].map((_, i) => (
                  <tr key={i}>
                    <td colSpan={7} className="px-4 py-3">
                      <div className="h-4 bg-slate-200 rounded animate-pulse" />
                    </td>
                  </tr>
                ))
              ) : filtered.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-4 py-12 text-center text-muted-foreground"
                  >
                    No staff found
                  </td>
                </tr>
              ) : (
                filtered.map((s: any) => (
                  <tr key={s.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                          {getInitials(s.user?.firstName, s.user?.lastName)}
                        </div>
                        <div>
                          <p className="font-medium">
                            {s.user?.firstName} {s.user?.lastName}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {s.user?.email}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 font-mono text-xs">
                      {s.employeeId}
                    </td>
                    <td className="px-4 py-3">{s.department}</td>
                    <td className="px-4 py-3">{s.position}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full font-medium ${roleColors[s.user?.role] || "bg-slate-100 text-slate-600"}`}
                      >
                        {s.user?.role}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full font-medium ${s.isActive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}
                      >
                        {s.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1">
                        <Link to={`/staff/${s.id}`}>
                          <button className="p-1.5 rounded hover:bg-slate-100 text-muted-foreground">
                            <Eye className="w-4 h-4" />
                          </button>
                        </Link>
                        {s.isActive ? (
                          <button
                            title="Revoke access"
                            onClick={() => {
                              if (
                                confirm(
                                  "Revoke this staff member's access? They will be unable to log in immediately.",
                                )
                              )
                                revoke(s.id);
                            }}
                            className="p-1.5 rounded hover:bg-red-50 text-muted-foreground hover:text-red-600"
                          >
                            <ShieldOff className="w-4 h-4" />
                          </button>
                        ) : (
                          <button
                            title="Grant access"
                            onClick={() => {
                              if (
                                confirm(
                                  "Grant this staff member access? They will be able to log in immediately.",
                                )
                              )
                                grant(s.id);
                            }}
                            className="p-1.5 rounded hover:bg-green-50 text-muted-foreground hover:text-green-600"
                          >
                            <ShieldCheck className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
