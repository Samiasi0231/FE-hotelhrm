import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { superAdminApi } from "@/api/services";
import { formatDate, getInitials } from "@/lib/utils";
import { Card, Input } from "@/components/ui/common";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/toaster";
import { Search, ToggleLeft, ToggleRight } from "lucide-react";

const ROLE_COLORS: Record<string, string> = {
  SUPER_ADMIN: "bg-red-100 text-red-700",
  HOTEL_DIRECTOR: "bg-amber-100 text-amber-700",
  ADMIN: "bg-purple-100 text-purple-700",
  ADMIN_HR: "bg-blue-100 text-blue-700",
  STAFF: "bg-slate-100 text-slate-700",
};

// ── Avatar: shows photo if uploaded, initials otherwise ───────────────────────
function UserAvatar({ user }: { user: any }) {
  const [imgError, setImgError] = useState(false);
  const showImage = user.avatar && !imgError;

  return (
    <div className="w-9 h-9 rounded-full overflow-hidden bg-blue-600 flex items-center justify-center flex-shrink-0 border-2 border-white ring-1 ring-slate-200">
      {showImage ? (
        <img
          src={user.avatar}
          alt={`${user.firstName} ${user.lastName}`}
          className="w-full h-full object-cover"
          onError={() => setImgError(true)}
        />
      ) : (
        <span className="text-white text-xs font-bold">
          {getInitials(user.firstName, user.lastName)}
        </span>
      )}
    </div>
  );
}

export default function SuperAdminUsers() {
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [page, setPage] = useState(1);

  const { data: usersData, isLoading } = useQuery({
    queryKey: ["super-users", roleFilter, page],
    queryFn: async () => {
      const r = await superAdminApi.getUsers({
        role: roleFilter || undefined,
        page,
        limit: 20,
      });
      return Array.isArray(r.data)
        ? { data: r.data, meta: { total: r.data.length } }
        : r.data;
    },
  });

  const { mutate: toggleStatus } = useMutation({
    mutationFn: (id: string) => superAdminApi.toggleUserStatus(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["super-users"] });
      toast.success("User status updated");
    },
    onError: () => toast.error("Failed to update user status"),
  });

  const users: any[] = usersData?.data ?? [];
  const meta = usersData?.meta ?? {};
  const filtered = users.filter((u: any) =>
    `${u.firstName} ${u.lastName} ${u.email}`
      .toLowerCase()
      .includes(search.toLowerCase()),
  );

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">All Users</h1>
        <p className="text-slate-500 text-sm">
          {meta.total ?? 0} registered users
        </p>
      </div>

      {/* Search + filter */}
      <div className="flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input
            placeholder="Search by name or email..."
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select
          className="h-10 rounded-md border border-input bg-background px-3 text-sm"
          value={roleFilter}
          onChange={(e) => {
            setRoleFilter(e.target.value);
            setPage(1);
          }}
        >
          <option value="">All Roles</option>
          <option value="SUPER_ADMIN">Super Admin</option>
          <option value="HOTEL_DIRECTOR">Hotel Director</option>
          <option value="ADMIN">Admin</option>
          <option value="ADMIN_HR">Admin HR</option>
          <option value="STAFF">Staff</option>
        </select>
      </div>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-slate-50">
                <th className="text-left px-4 py-3 font-medium text-slate-500">
                  User
                </th>
                <th className="text-left px-4 py-3 font-medium text-slate-500">
                  Role
                </th>
                <th className="text-left px-4 py-3 font-medium text-slate-500">
                  Phone
                </th>
                <th className="text-left px-4 py-3 font-medium text-slate-500">
                  Joined
                </th>
                <th className="text-left px-4 py-3 font-medium text-slate-500">
                  Status
                </th>
                <th className="text-left px-4 py-3 font-medium text-slate-500">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {isLoading ? (
                [...Array(6)].map((_, i) => (
                  <tr key={i}>
                    <td colSpan={6} className="px-4 py-3">
                      <div className="h-4 bg-slate-200 rounded animate-pulse" />
                    </td>
                  </tr>
                ))
              ) : filtered.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-4 py-12 text-center text-slate-400"
                  >
                    No users found
                  </td>
                </tr>
              ) : (
                filtered.map((u: any) => (
                  <tr
                    key={u.id}
                    className="hover:bg-slate-50 transition-colors"
                  >
                    {/* User cell */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <UserAvatar user={u} />
                        <div className="min-w-0">
                          <p className="font-semibold text-slate-800 truncate">
                            {u.firstName} {u.lastName}
                          </p>
                          <p className="text-xs text-slate-400 truncate">
                            {u.email}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Role */}
                    <td className="px-4 py-3">
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full font-medium ${ROLE_COLORS[u.role] ?? "bg-slate-100 text-slate-600"}`}
                      >
                        {u.role.replaceAll("_", " ")}
                      </span>
                    </td>

                    {/* Phone */}
                    <td className="px-4 py-3 text-slate-500">
                      {u.phone || "—"}
                    </td>

                    {/* Joined */}
                    <td className="px-4 py-3 text-slate-500">
                      {formatDate(u.createdAt)}
                    </td>

                    {/* Status */}
                    <td className="px-4 py-3">
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full font-medium ${u.isActive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}
                      >
                        {u.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>

                    {/* Action */}
                    <td className="px-4 py-3">
                      <button
                        onClick={() => {
                          if (
                            confirm(
                              `${u.isActive ? "Deactivate" : "Activate"} ${u.firstName}?`,
                            )
                          )
                            toggleStatus(u.id);
                        }}
                        className={`flex items-center gap-1 text-xs px-2 py-1 rounded font-medium transition-colors ${
                          u.isActive
                            ? "bg-red-50 text-red-600 hover:bg-red-100"
                            : "bg-green-50 text-green-600 hover:bg-green-100"
                        }`}
                      >
                        {u.isActive ? (
                          <>
                            <ToggleRight className="w-3.5 h-3.5" /> Deactivate
                          </>
                        ) : (
                          <>
                            <ToggleLeft className="w-3.5 h-3.5" /> Activate
                          </>
                        )}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {meta.totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t">
            <p className="text-sm text-slate-500">
              Page {meta.page} of {meta.totalPages}
            </p>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                disabled={!meta.hasPrevPage}
                onClick={() => setPage((p) => p - 1)}
              >
                Previous
              </Button>
              <Button
                size="sm"
                variant="outline"
                disabled={!meta.hasNextPage}
                onClick={() => setPage((p) => p + 1)}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
