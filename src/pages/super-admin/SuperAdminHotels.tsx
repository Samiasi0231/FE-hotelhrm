// src/pages/super-admin/SuperAdminHotels.tsx — FULL REPLACEMENT

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { superAdminApi } from "@/api/services";
import { formatDate, getStatusColor } from "@/lib/utils";
import { Card, Input } from "@/components/ui/common";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/toaster";
import {
  Search,
  Building2,
  ShieldCheck,
  ShieldX,
  Star,
  Link,
  Copy,
  ExternalLink,
  Check,
} from "lucide-react";

const SUBSCRIPTION_PLANS = ["SMALL", "LARGE"];
const SUBSCRIPTION_MONTHS = [1, 3, 6, 12];

// ─── Copy-link button ─────────────────────────────────────────────────────────
function CopyLinkButton({ slug }: { slug?: string }) {
  const [copied, setCopied] = useState(false);

  if (!slug) {
    return <span className="text-xs text-slate-300 italic">No link yet</span>;
  }

  const url = `${window.location.origin}/book/${slug}`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Copy failed", "Please copy manually.");
    }
  };

  return (
    <div className="flex items-center gap-1.5">
      {/* Open link */}
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        title={url}
        className="inline-flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 font-medium max-w-[120px] truncate"
      >
        <Link className="w-3 h-3 flex-shrink-0" />
        <span className="truncate">/book/{slug}</span>
      </a>

      {/* Copy button */}
      <button
        onClick={handleCopy}
        title="Copy booking link"
        className={`flex-shrink-0 p-1 rounded transition-colors ${
          copied
            ? "text-green-600 bg-green-50"
            : "text-slate-400 hover:text-slate-700 hover:bg-slate-100"
        }`}
      >
        {copied ? (
          <Check className="w-3.5 h-3.5" />
        ) : (
          <Copy className="w-3.5 h-3.5" />
        )}
      </button>

      {/* External link */}
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        title="Open in new tab"
        className="flex-shrink-0 p-1 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
      >
        <ExternalLink className="w-3.5 h-3.5" />
      </a>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function SuperAdminHotels() {
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);
  const [subModal, setSubModal] = useState<{
    hotelId: string;
    name: string;
  } | null>(null);
  const [subPlan, setSubPlan] = useState("LARGE");
  const [subMonths, setSubMonths] = useState(12);

  const { data: hotelsData, isLoading } = useQuery({
    queryKey: ["super-hotels", search, statusFilter, page],
    queryFn: async () => {
      const r = await superAdminApi.getHotels({
        search: search || undefined,
        status: statusFilter || undefined,
        page,
        limit: 15,
      });
      return Array.isArray(r.data)
        ? { data: r.data, meta: { total: r.data.length } }
        : r.data;
    },
  });

  const { mutate: suspendHotel } = useMutation({
    mutationFn: (id: string) => superAdminApi.suspendHotel(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["super-hotels"] });
      toast.success("Hotel suspended");
    },
    onError: () => toast.error("Failed to suspend hotel"),
  });

  const { mutate: activateHotel } = useMutation({
    mutationFn: (id: string) => superAdminApi.activateHotel(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["super-hotels"] });
      toast.success("Hotel activated");
    },
    onError: () => toast.error("Failed to activate hotel"),
  });

  const { mutate: updateSubscription, isPending: updatingSub } = useMutation({
    mutationFn: ({
      id,
      plan,
      months,
    }: {
      id: string;
      plan: string;
      months: number;
    }) => superAdminApi.updateSubscription(id, plan, months),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["super-hotels"] });
      toast.success("Subscription updated!");
      setSubModal(null);
    },
    onError: () => toast.error("Failed to update subscription"),
  });

  const hotels: any[] = hotelsData?.data ?? [];
  const meta = hotelsData?.meta ?? {};

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">All Hotels</h1>
        <p className="text-muted-foreground text-sm">
          {meta.total ?? 0} hotels on the platform
        </p>
      </div>

      <div className="flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search hotels by name or city..."
            className="pl-9"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
          />
        </div>
        <select
          className="h-10 rounded-md border border-input bg-background px-3 text-sm"
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            setPage(1);
          }}
        >
          <option value="">All Status</option>
          <option value="ACTIVE">Active</option>
          <option value="INACTIVE">Inactive</option>
          <option value="SUSPENDED">Suspended</option>
          <option value="EXPIRED">Expired</option>
        </select>
      </div>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-slate-50">
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">
                  Hotel
                </th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">
                  Director
                </th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">
                  Location
                </th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">
                  Booking Link
                </th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">
                  Plan
                </th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">
                  Expiry
                </th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">
                  Stats
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
                [...Array(5)].map((_, i) => (
                  <tr key={i}>
                    <td colSpan={9} className="px-4 py-3">
                      <div className="h-4 bg-slate-200 rounded animate-pulse" />
                    </td>
                  </tr>
                ))
              ) : hotels.length === 0 ? (
                <tr>
                  <td
                    colSpan={9}
                    className="px-4 py-12 text-center text-muted-foreground"
                  >
                    <Building2 className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                    No hotels found
                  </td>
                </tr>
              ) : (
                hotels.map((h: any) => (
                  <tr key={h.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                          <Building2 className="w-4 h-4 text-blue-600" />
                        </div>
                        <div>
                          <p className="font-medium">{h.name}</p>
                          <div className="flex">
                            {[...Array(h.starRating || 0)].map((_, i) => (
                              <Star
                                key={i}
                                className="w-2.5 h-2.5 text-amber-400 fill-amber-400"
                              />
                            ))}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-medium text-xs">
                        {h.director?.firstName} {h.director?.lastName}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {h.director?.email}
                      </p>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground text-xs">
                      {h.city}, {h.state}
                    </td>

                    {/* ── Booking Link column ── */}
                    <td className="px-4 py-3">
                      <CopyLinkButton slug={h.slug} />
                    </td>

                    <td className="px-4 py-3">
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                          h.subscriptionPlan === "LARGE"
                            ? "bg-purple-100 text-purple-700"
                            : "bg-blue-100 text-blue-700"
                        }`}
                      >
                        {h.subscriptionPlan}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">
                      {h.subscriptionExpiry
                        ? formatDate(h.subscriptionExpiry)
                        : "—"}
                    </td>
                    <td className="px-4 py-3 text-xs">
                      <span className="text-slate-600">
                        🏠 {h._count?.rooms ?? 0} rooms
                      </span>
                      <br />
                      <span className="text-slate-600">
                        👥 {h._count?.staff ?? 0} staff
                      </span>
                      <br />
                      <span className="text-slate-600">
                        📋 {h._count?.bookings ?? 0} bookings
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full font-medium ${getStatusColor(h.subscriptionStatus)}`}
                      >
                        {h.subscriptionStatus}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-col gap-1">
                        <button
                          onClick={() =>
                            setSubModal({ hotelId: h.id, name: h.name })
                          }
                          className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 font-medium text-left"
                        >
                          Update Sub
                        </button>
                        {h.subscriptionStatus !== "SUSPENDED" ? (
                          <button
                            onClick={() => {
                              if (confirm(`Suspend ${h.name}?`))
                                suspendHotel(h.id);
                            }}
                            className="text-xs px-2 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200 font-medium flex items-center gap-1"
                          >
                            <ShieldX className="w-3 h-3" /> Suspend
                          </button>
                        ) : (
                          <button
                            onClick={() => activateHotel(h.id)}
                            className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded hover:bg-green-200 font-medium flex items-center gap-1"
                          >
                            <ShieldCheck className="w-3 h-3" /> Activate
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

        {meta.totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t">
            <p className="text-sm text-muted-foreground">
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

      {/* Subscription Modal */}
      {subModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-sm">
            <h3 className="text-lg font-bold mb-1">Update Subscription</h3>
            <p className="text-sm text-muted-foreground mb-4">
              {subModal.name}
            </p>
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Plan</label>
                <select
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={subPlan}
                  onChange={(e) => setSubPlan(e.target.value)}
                >
                  {SUBSCRIPTION_PLANS.map((p) => (
                    <option key={p} value={p}>
                      {p} Hotel Plan
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Duration</label>
                <select
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={subMonths}
                  onChange={(e) => setSubMonths(Number(e.target.value))}
                >
                  {SUBSCRIPTION_MONTHS.map((m) => (
                    <option key={m} value={m}>
                      {m} month{m > 1 ? "s" : ""}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex gap-3 pt-2">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setSubModal(null)}
                >
                  Cancel
                </Button>
                <Button
                  className="flex-1"
                  disabled={updatingSub}
                  onClick={() =>
                    updateSubscription({
                      id: subModal.hotelId,
                      plan: subPlan,
                      months: subMonths,
                    })
                  }
                >
                  {updatingSub ? "Saving..." : "Confirm"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
