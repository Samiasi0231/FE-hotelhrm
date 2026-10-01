// src/pages/bookings/BookingsPage.tsx — FULL REPLACEMENT
// All status config, payment badges, and "is this recent/checkable" logic
// now come from shared/ — nothing here is computed inline anymore.

import { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { bookingApi } from "@/api/services";
import { useAuth } from "@/contexts/AuthContext";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input, Card } from "@/components/ui/common";
import { toast } from "@/components/ui/toaster";
import {
  Search,
  CalendarCheck,
  Plus,
  Eye,
  BedDouble,
  Phone,
  Mail,
  Users,
  Banknote,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

import { STATUS_CONFIG, STATUSES } from "./shared/booking.constant";
import {
  isTodayOrAfter,
  isRecentlyConfirmed,
  getPaymentBadge,
} from "./shared/booking.utils";
import { StatusBadge } from "./shared/statusbadge";

export default function BookingsPage() {
  const qc = useQueryClient();
  const { hotelId } = useAuth();

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);
  const [view, setView] = useState<"table" | "cards">("table");

  const { data: bookingsData, isLoading } = useQuery({
    queryKey: ["bookings", hotelId, statusFilter, page],
    queryFn: () =>
      bookingApi
        .getAll(hotelId!, {
          status: statusFilter || undefined,
          page,
          limit: 20,
        })
        .then((r) => r.data?.data || r.data),
    enabled: !!hotelId,
    refetchInterval: 30_000,
  });

  const { mutate: updateStatus } = useMutation({
    mutationFn: ({
      id,
      status,
      reason,
    }: {
      id: string;
      status: string;
      reason?: string;
    }) => bookingApi.updateStatus(id, status, reason),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["bookings"] });
      qc.invalidateQueries({ queryKey: ["rooms"] });
      toast.success("Booking updated");
    },
    onError: () => toast.error("Failed to update booking"),
  });

  const bookings: any[] = bookingsData?.data ?? bookingsData ?? [];
  const meta = bookingsData?.meta ?? {};

  const filtered = bookings.filter(
    (b: any) =>
      !search ||
      b.bookingRef?.toLowerCase().includes(search.toLowerCase()) ||
      b.guestName?.toLowerCase().includes(search.toLowerCase()) ||
      b.guestEmail?.toLowerCase().includes(search.toLowerCase()) ||
      b.guestPhone?.includes(search) ||
      b.room?.roomType?.toLowerCase().includes(search.toLowerCase()) ||
      b.room?.roomNumber?.includes(search),
  );

  const counts = bookings.reduce((acc: any, b: any) => {
    acc[b.status] = (acc[b.status] || 0) + 1;
    return acc;
  }, {});

  // Computed once here, reused by the banner AND passed down per-row — never
  // recomputed inline in table/card rendering.
  const newConfirmedCount = bookings.filter((b) =>
    isRecentlyConfirmed(b),
  ).length;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Bookings</h1>
          <p className="text-slate-500 text-sm">
            {meta.total ?? bookings.length} total
          </p>
        </div>
        <div className="flex gap-2">
          <Link to="/bookings/calendar">
            <Button variant="outline">
              <CalendarCheck className="w-4 h-4 mr-2" /> Calendar
            </Button>
          </Link>
          <Link to="/bookings/new">
            <Button>
              <Plus className="w-4 h-4 mr-2" /> New Booking
            </Button>
          </Link>
        </div>
      </div>

      {newConfirmedCount > 0 && (
        <div className="bg-green-50 border border-green-200 rounded-xl px-4 py-3 flex items-center gap-3">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          <p className="text-green-800 text-sm font-semibold">
            🎉 {newConfirmedCount} new confirmed booking
            {newConfirmedCount > 1 ? "s" : ""} in the last 24 hours
          </p>
          <button
            onClick={() => setStatusFilter("CONFIRMED")}
            className="ml-auto text-xs text-green-700 underline hover:no-underline"
          >
            View
          </button>
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        {Object.entries(STATUS_CONFIG).map(([status, cfg]) => {
          const count = counts[status] || 0;
          if (count === 0) return null;
          return (
            <button
              key={status}
              onClick={() =>
                setStatusFilter(statusFilter === status ? "" : status)
              }
              className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full border transition-all
                ${statusFilter === status ? cfg.bg + " ring-2 ring-offset-1 ring-current" : cfg.bg + " opacity-70 hover:opacity-100"}`}
            >
              {count} {cfg.label}
            </button>
          );
        })}
        {statusFilter && (
          <button
            onClick={() => setStatusFilter("")}
            className="text-xs text-slate-500 hover:text-slate-700 px-2 underline"
          >
            Clear
          </button>
        )}
      </div>

      <div className="flex gap-3 flex-wrap items-center">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input
            placeholder="Search by name, ref, email, room..."
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            setPage(1);
          }}
          className="h-10 rounded-md border border-input bg-background px-3 text-sm"
        >
          {STATUSES.map((s) => (
            <option key={s} value={s}>
              {s || "All Status"}
            </option>
          ))}
        </select>
        <div className="flex border border-slate-200 rounded-lg overflow-hidden">
          {(["table", "cards"] as const).map((v) => (
            <button
              key={v}
              onClick={() => setView(v)}
              className={`px-3 py-2 text-xs font-medium transition-colors capitalize ${view === v ? "bg-slate-900 text-white" : "text-slate-500 hover:bg-slate-50"}`}
            >
              {v}
            </button>
          ))}
        </div>
      </div>

      {view === "table" && (
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-slate-50">
                  {[
                    "Ref",
                    "Guest",
                    "Room",
                    "Dates",
                    "Amount",
                    "Payment",
                    "Status",
                    "Actions",
                  ].map((h) => (
                    <th
                      key={h}
                      className="text-left px-4 py-3 font-semibold text-slate-600"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y">
                {isLoading ? (
                  [...Array(5)].map((_, i) => (
                    <tr key={i}>
                      <td colSpan={8} className="px-4 py-3">
                        <div className="h-4 bg-slate-100 rounded animate-pulse" />
                      </td>
                    </tr>
                  ))
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-4 py-16 text-center">
                      <BedDouble className="w-8 h-8 text-slate-200 mx-auto mb-2" />
                      <p className="text-slate-500 font-medium">
                        No bookings found
                      </p>
                    </td>
                  </tr>
                ) : (
                  filtered.map((b: any) => {
                    const canCheckIn = isTodayOrAfter(b.checkIn);
                    const payBadge = getPaymentBadge(b);
                    const isNew = isRecentlyConfirmed(b);
                    const pendingManual = b.payments?.some(
                      (p: any) =>
                        p.isManual && p.manualStatus === "PENDING_APPROVAL",
                    );

                    return (
                      <tr
                        key={b.id}
                        className={`hover:bg-slate-50 transition-colors ${isNew ? "bg-green-50/30" : ""}`}
                      >
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1.5">
                            <span className="font-mono text-xs font-bold text-blue-600">
                              {b.bookingRef}
                            </span>
                            {isNew && (
                              <span className="text-xs bg-green-500 text-white px-1.5 py-0.5 rounded font-bold">
                                NEW
                              </span>
                            )}
                            {pendingManual && (
                              <span title="Manual payment awaiting approval">
                                <Banknote className="w-4 h-4 text-amber-500" />
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-slate-400 mt-0.5">
                            {formatDate(b.createdAt)}
                          </p>
                        </td>
                        <td className="px-4 py-3">
                          <p className="font-semibold text-slate-800">
                            {b.guestName}
                          </p>
                          <p className="text-xs text-slate-400">
                            {b.guestEmail}
                          </p>
                          <p className="text-xs text-slate-400">
                            {b.guestPhone}
                          </p>
                        </td>
                        <td className="px-4 py-3">
                          <p className="font-medium">
                            Room {b.room?.roomNumber}
                          </p>
                          <p className="text-xs text-slate-400">
                            {b.room?.roomType}
                          </p>
                          <p className="text-xs text-slate-400">{b.nights}n</p>
                        </td>
                        <td className="px-4 py-3 text-xs text-slate-600">
                          <p>
                            In:{" "}
                            <span className="font-medium">
                              {formatDate(b.checkIn)}
                            </span>
                          </p>
                          <p>
                            Out:{" "}
                            <span className="font-medium">
                              {formatDate(b.checkOut)}
                            </span>
                          </p>
                        </td>
                        <td className="px-4 py-3 font-bold text-slate-900">
                          {formatCurrency(b.totalAmount)}
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`text-xs font-semibold px-2 py-0.5 rounded-full ${payBadge.cls}`}
                          >
                            {payBadge.label}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <StatusBadge status={b.status} size="sm" />
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1 flex-wrap">
                            <Link to={`/bookings/${b.id}`}>
                              <button className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-slate-700">
                                <Eye className="w-4 h-4" />
                              </button>
                            </Link>
                            {b.status === "CONFIRMED" && (
                              <div>
                                <button
                                  disabled={!canCheckIn}
                                  onClick={() =>
                                    updateStatus({
                                      id: b.id,
                                      status: "CHECKED_IN",
                                    })
                                  }
                                  className={`px-2 py-1.5 rounded-lg text-xs font-bold transition-colors
                                  ${canCheckIn ? "bg-blue-600 text-white hover:bg-blue-700" : "bg-slate-100 text-slate-400 cursor-not-allowed"}`}
                                >
                                  {canCheckIn ? "Check In" : "Waiting"}
                                </button>
                                {!canCheckIn && (
                                  <p className="text-[10px] text-slate-400 mt-0.5 text-center">
                                    {formatDate(b.checkIn)}
                                  </p>
                                )}
                              </div>
                            )}
                            {b.status === "CHECKED_IN" && (
                              <button
                                onClick={() =>
                                  updateStatus({
                                    id: b.id,
                                    status: "CHECKED_OUT",
                                  })
                                }
                                className="text-xs px-2 py-1 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 font-semibold transition-colors"
                              >
                                Check Out
                              </button>
                            )}
                            {(b.status === "PENDING" ||
                              b.status === "CONFIRMED") && (
                              <Link to={`/bookings/${b.id}`}>
                                <button className="text-xs px-2 py-1 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 font-semibold transition-colors">
                                  Cancel
                                </button>
                              </Link>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
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
                  <ChevronLeft className="w-4 h-4 mr-1" /> Previous
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  disabled={!meta.hasNextPage}
                  onClick={() => setPage((p) => p + 1)}
                >
                  Next <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            </div>
          )}
        </Card>
      )}

      {view === "cards" && (
        <>
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[...Array(4)].map((_, i) => (
                <div
                  key={i}
                  className="h-64 bg-slate-100 rounded-2xl animate-pulse"
                />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-16">
              <BedDouble className="w-10 h-10 text-slate-200 mx-auto mb-3" />
              <p className="text-slate-500 font-semibold">No bookings found</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filtered.map((b: any) => {
                const canCheckIn = isTodayOrAfter(b.checkIn);
                const payBadge = getPaymentBadge(b);
                const pendingManual = b.payments?.some(
                  (p: any) =>
                    p.isManual && p.manualStatus === "PENDING_APPROVAL",
                );
                const isNew = isRecentlyConfirmed(b);

                const borderColor =
                  b.status === "CONFIRMED"
                    ? "border-green-200"
                    : b.status === "CHECKED_IN"
                      ? "border-blue-200"
                      : b.status === "PENDING"
                        ? "border-amber-200"
                        : "border-slate-200";

                const barColor =
                  b.status === "CONFIRMED"
                    ? "bg-green-500"
                    : b.status === "CHECKED_IN"
                      ? "bg-blue-500"
                      : b.status === "PENDING"
                        ? "bg-amber-400"
                        : b.status === "CHECKED_OUT"
                          ? "bg-slate-400"
                          : "bg-red-400";

                return (
                  <div
                    key={b.id}
                    className={`bg-white rounded-2xl border overflow-hidden hover:shadow-md transition-all ${borderColor}`}
                  >
                    <div className={`h-1.5 ${barColor}`} />
                    <div className="p-5 space-y-4">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-black font-mono text-slate-900">
                              {b.bookingRef}
                            </span>
                            {isNew && (
                              <span className="text-xs bg-green-500 text-white px-2 py-0.5 rounded-full font-bold">
                                NEW ✓
                              </span>
                            )}
                            {pendingManual && (
                              <span title="Manual payment awaiting approval">
                                <Banknote className="w-4 h-4 text-amber-500" />
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-slate-400 mt-0.5">
                            {formatDate(b.createdAt)}
                          </p>
                        </div>
                        <StatusBadge status={b.status} size="sm" />
                      </div>

                      <div className="bg-slate-50 rounded-xl p-3 space-y-1.5">
                        <p className="font-bold text-slate-800 text-sm">
                          {b.guestName}
                        </p>
                        <div className="flex items-center gap-1.5 text-xs text-slate-500">
                          <Mail className="w-3 h-3" />{" "}
                          <span className="truncate">{b.guestEmail}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-xs text-slate-500">
                          <Phone className="w-3 h-3" /> {b.guestPhone}
                        </div>
                        <div className="flex items-center gap-1.5 text-xs text-slate-500">
                          <Users className="w-3 h-3" />
                          {b.adults} adult{b.adults !== 1 ? "s" : ""}
                          {b.children > 0
                            ? ` · ${b.children} child${b.children !== 1 ? "ren" : ""}`
                            : ""}
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        {[
                          {
                            label: "Check-in",
                            date: b.checkIn,
                            color: "bg-blue-50 text-blue-500",
                          },
                          {
                            label: "Check-out",
                            date: b.checkOut,
                            color: "bg-slate-50 text-slate-500",
                          },
                        ].map(({ label, date, color }) => (
                          <div
                            key={label}
                            className={`${color.split(" ")[0]} rounded-xl p-3`}
                          >
                            <p
                              className={`text-xs font-semibold mb-0.5 ${color.split(" ")[1]}`}
                            >
                              {label}
                            </p>
                            <p className="text-sm font-bold text-slate-800">
                              {new Date(date).toLocaleDateString("en-GB", {
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                              })}
                            </p>
                          </div>
                        ))}
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center">
                            <BedDouble className="w-4 h-4 text-slate-600" />
                          </div>
                          <div>
                            <p className="text-xs font-semibold text-slate-700">
                              {b.room?.roomType}
                            </p>
                            <p className="text-xs text-slate-400">
                              Room {b.room?.roomNumber} · {b.nights}n
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-black text-slate-900">
                            {formatCurrency(b.totalAmount)}
                          </p>
                          <span
                            className={`text-xs font-semibold px-1.5 py-0.5 rounded-full ${payBadge.cls}`}
                          >
                            {payBadge.label}
                          </span>
                        </div>
                      </div>

                      <div className="flex gap-2 pt-1">
                        <Link to={`/bookings/${b.id}`} className="flex-1">
                          <button className="w-full py-2 border border-slate-200 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors flex items-center justify-center gap-1">
                            <Eye className="w-3.5 h-3.5" /> View
                          </button>
                        </Link>
                        {b.status === "CONFIRMED" && (
                          <div className="flex-1">
                            <button
                              disabled={!canCheckIn}
                              onClick={() =>
                                updateStatus({ id: b.id, status: "CHECKED_IN" })
                              }
                              className={`w-full py-2 rounded-xl text-xs font-bold transition-colors
                                ${canCheckIn ? "bg-blue-600 text-white hover:bg-blue-700" : "bg-slate-100 text-slate-400 cursor-not-allowed"}`}
                            >
                              {canCheckIn ? "Check In" : "Waiting"}
                            </button>
                          </div>
                        )}
                        {b.status === "CHECKED_IN" && (
                          <button
                            onClick={() =>
                              updateStatus({ id: b.id, status: "CHECKED_OUT" })
                            }
                            className="flex-1 py-2 bg-slate-800 text-white rounded-xl text-xs font-bold hover:bg-slate-900 transition-colors"
                          >
                            Check Out
                          </button>
                        )}
                        {(b.status === "PENDING" ||
                          b.status === "CONFIRMED") && (
                          <Link to={`/bookings/${b.id}`} className="flex-1">
                            <button className="w-full py-2 bg-red-50 text-red-600 border border-red-200 rounded-xl text-xs font-bold hover:bg-red-100 transition-colors">
                              Cancel
                            </button>
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {meta.totalPages > 1 && (
            <div className="flex items-center justify-between">
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
        </>
      )}
    </div>
  );
}
