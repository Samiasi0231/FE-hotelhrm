// src/pages/bookings/BookingDetailPage.tsx — FULL REPLACEMENT
// Orchestration only. All constants/utils/StatusBadge/ActorCard come from
// ./shared — nothing here is duplicated from BookingsPage or elsewhere.
// Modals and panels live in ./detail.

import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { bookingApi, paymentApi } from "@/api/services";
import { useAuth } from "@/contexts/AuthContext";
import { formatCurrency, formatDate, formatDateTime } from "@/lib/utils";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/common";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/toaster";
import {
  ArrowLeft,
  User,
  BedDouble,
  CreditCard,
  Phone,
  Mail,
  Users,
  Clock,
  AlertCircle,
  CalendarCheck,
  Banknote,
  ClipboardList,
} from "lucide-react";

import {
  daysUntil,
  isPaid as checkIsPaid,
  getPendingManualPayment,
} from "./shared/booking.utils";
import { METHOD_LABEL } from "./shared/booking.constant";
import { StatusBadge } from "./shared/statusbadge";
import { ActorCard } from "./shared/autor-card";
import { DateLockedBtn } from "./detail/date-lock-btn";
import { RecordPaymentModal } from "./detail/record-payment-modal";
import { CancelModal } from "./detail/cancel-modal";
import { ApprovalPanel } from "./detail/approval-panel";
import { AuditTrail } from "./detail/audit-trail";

export default function BookingDetailPage() {
  const { id } = useParams<{ id: string }>();
  const qc = useQueryClient();
  const { user } = useAuth();

  const [showPayModal, setShowPayModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);

  // ALL authenticated hotel staff can record/approve — no role restriction
  const canRecordPay = !!user;

  const { data: booking, isLoading } = useQuery({
    queryKey: ["booking", id],
    queryFn: () => bookingApi.getById(id!).then((r) => r.data?.data || r.data),
    refetchInterval: 30_000,
  });

  const { mutate: updateStatus, isPending } = useMutation({
    mutationFn: ({ status, reason }: { status: string; reason?: string }) =>
      bookingApi.updateStatus(id!, status, reason),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["booking", id] });
      qc.invalidateQueries({ queryKey: ["bookings"] });
      qc.invalidateQueries({ queryKey: ["rooms"] });
      toast.success("Booking updated");
    },
    onError: (e: any) => {
      const msg = e?.response?.data?.message;
      toast.error(
        "Failed",
        Array.isArray(msg) ? msg.join(", ") : msg || "Please try again",
      );
    },
  });

  function refresh() {
    qc.invalidateQueries({ queryKey: ["booking", id] });
    qc.invalidateQueries({ queryKey: ["bookings"] });
    qc.invalidateQueries({ queryKey: ["rooms"] });
    qc.invalidateQueries({ queryKey: ["payments"] });
  }

  const { mutate: payOnline, isPending: paying } = useMutation({
    mutationFn: () => paymentApi.initiatePaystack({ bookingId: id }),
    onSuccess: (res) => {
      const d = res.data?.data || res.data;
      if (d?.authorizationUrl) window.open(d.authorizationUrl, "_blank");
      toast.success("Payment window opened");
    },
    onError: () => toast.error("Failed to initiate payment"),
  });

  if (isLoading) {
    return (
      <div className="max-w-3xl space-y-4 animate-pulse">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-24 bg-slate-200 rounded-xl" />
        ))}
      </div>
    );
  }
  if (!booking)
    return <p className="text-muted-foreground">Booking not found</p>;

  const paid = checkIsPaid(booking);
  const pendingManual = getPendingManualPayment(booking);
  const checkInDays = daysUntil(booking.checkIn);
  const checkOutDays = daysUntil(booking.checkOut);

  return (
    <div className="max-w-3xl space-y-6 animate-fade-in pb-12">
      {showPayModal && (
        <RecordPaymentModal
          booking={booking}
          onClose={() => setShowPayModal(false)}
          onSuccess={refresh}
        />
      )}
      {showCancelModal && (
        <CancelModal
          booking={booking}
          actor={user}
          onClose={() => setShowCancelModal(false)}
          onSuccess={refresh}
        />
      )}

      <div className="flex items-center gap-3 flex-wrap">
        <Link to="/bookings">
          <Button variant="outline" size="sm">
            <ArrowLeft className="w-4 h-4 mr-1" /> Back
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold font-mono">{booking.bookingRef}</h1>
          <p className="text-muted-foreground text-sm">
            Created {formatDateTime(booking.createdAt)}
          </p>
        </div>
      </div>

      <Card>
        <CardContent className="p-5 space-y-4">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div className="space-y-2">
              <StatusBadge status={booking.status} />
              <span
                className={`text-xs font-semibold px-2 py-0.5 rounded-full inline-flex
                ${paid ? "bg-green-50 text-green-700" : pendingManual ? "bg-amber-50 text-amber-700" : "bg-slate-100 text-slate-500"}`}
              >
                {paid
                  ? "✅ Payment confirmed"
                  : pendingManual
                    ? "⏳ Payment recorded — ready to approve"
                    : "💳 Payment pending"}
              </span>
            </div>

            <div className="flex flex-wrap gap-2 items-start">
              {booking.status === "PENDING" && !pendingManual && (
                <>
                  <Button
                    size="sm"
                    onClick={() => payOnline()}
                    disabled={paying}
                  >
                    <CreditCard className="w-4 h-4 mr-1" />
                    {paying ? "Opening..." : "Pay Online"}
                  </Button>
                  {canRecordPay && (
                    <button
                      onClick={() => setShowPayModal(true)}
                      className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-semibold bg-green-50 text-green-700 border border-green-200 hover:bg-green-100 transition-colors"
                    >
                      <Banknote className="w-4 h-4" /> Manual Payment
                    </button>
                  )}
                  <button
                    onClick={() => setShowCancelModal(true)}
                    className="px-3 py-2 rounded-xl text-sm font-semibold bg-red-50 text-red-600 border border-red-200 hover:bg-red-100 transition-colors"
                  >
                    Cancel
                  </button>
                </>
              )}

              {booking.status === "CONFIRMED" && (
                <>
                  <DateLockedBtn
                    label="Check In Guest"
                    onClick={() => updateStatus({ status: "CHECKED_IN" })}
                    targetDate={booking.checkIn}
                    targetLabel="Check-in"
                    disabled={isPending}
                    colorClass="bg-blue-600 hover:bg-blue-700 text-white"
                  />
                  <button
                    onClick={() => setShowCancelModal(true)}
                    disabled={isPending}
                    className="px-3 py-2 rounded-xl text-sm font-semibold bg-red-50 text-red-600 border border-red-200 hover:bg-red-100 transition-colors"
                  >
                    Cancel
                  </button>
                </>
              )}

              {booking.status === "CHECKED_IN" && (
                <DateLockedBtn
                  label="Check Out Guest"
                  onClick={() => updateStatus({ status: "CHECKED_OUT" })}
                  targetDate={booking.checkOut}
                  targetLabel="Check-out"
                  disabled={isPending}
                  colorClass="bg-slate-800 hover:bg-slate-900 text-white"
                />
              )}
            </div>
          </div>

          {booking.status === "CONFIRMED" && checkInDays > 0 && (
            <div className="bg-blue-50 border border-blue-100 rounded-xl p-3 flex items-center gap-2">
              <CalendarCheck className="w-4 h-4 text-blue-600 flex-shrink-0" />
              <p className="text-blue-700 text-xs font-medium">
                Check-in in{" "}
                <strong>
                  {checkInDays} day{checkInDays !== 1 ? "s" : ""}
                </strong>{" "}
                — {formatDate(booking.checkIn)}
              </p>
            </div>
          )}
          {booking.status === "CHECKED_IN" && checkOutDays > 0 && (
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 flex items-center gap-2">
              <Clock className="w-4 h-4 text-slate-500 flex-shrink-0" />
              <p className="text-slate-600 text-xs font-medium">
                Check-out in{" "}
                <strong>
                  {checkOutDays} day{checkOutDays !== 1 ? "s" : ""}
                </strong>{" "}
                — {formatDate(booking.checkOut)}
              </p>
            </div>
          )}
          {booking.status === "CHECKED_IN" && checkOutDays <= 0 && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0" />
              <p className="text-amber-700 text-xs font-medium">
                Check-out date has passed — please process check-out
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {pendingManual && (
        <ApprovalPanel
          payment={pendingManual}
          actor={user}
          onSuccess={refresh}
        />
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <User className="w-4 h-4" /> Guest
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2.5 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Name</span>
              <span className="font-semibold">{booking.guestName}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground flex items-center gap-1">
                <Mail className="w-3 h-3" /> Email
              </span>
              <a
                href={`mailto:${booking.guestEmail}`}
                className="font-medium text-blue-600 hover:underline truncate max-w-[55%]"
              >
                {booking.guestEmail}
              </a>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground flex items-center gap-1">
                <Phone className="w-3 h-3" /> Phone
              </span>
              <a
                href={`tel:${booking.guestPhone}`}
                className="font-medium text-blue-600 hover:underline"
              >
                {booking.guestPhone}
              </a>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground flex items-center gap-1">
                <Users className="w-3 h-3" /> Guests
              </span>
              <span className="font-medium">
                {booking.adults} adult{booking.adults !== 1 ? "s" : ""}
                {booking.children > 0
                  ? ` · ${booking.children} child${booking.children !== 1 ? "ren" : ""}`
                  : ""}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <BedDouble className="w-4 h-4" /> Stay
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2.5 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Room</span>
              <span className="font-semibold">
                {booking.room?.roomNumber} — {booking.room?.roomType}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Check-in</span>
              <span className="font-medium">{formatDate(booking.checkIn)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Check-out</span>
              <span className="font-medium">
                {formatDate(booking.checkOut)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Nights</span>
              <span className="font-medium">{booking.nights}</span>
            </div>
            <div className="flex justify-between border-t pt-2">
              <span className="font-bold">Total</span>
              <span className="font-black text-blue-600 text-base">
                {formatCurrency(booking.totalAmount)}
              </span>
            </div>
            {booking.cancelType === "REFUND" && booking.refundAmount && (
              <div className="flex justify-between border-t pt-2">
                <span className="text-red-600 font-medium">Refund</span>
                <span className="font-bold text-red-600">
                  {formatCurrency(booking.refundAmount)}
                </span>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {booking.specialRequests && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Special Requests</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-amber-50 border border-amber-100 rounded-xl p-4">
              <p className="text-sm text-amber-800 leading-relaxed">
                {booking.specialRequests}
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {booking.payments?.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <CreditCard className="w-4 h-4" /> Payment History
            </CardTitle>
          </CardHeader>
          <CardContent className="divide-y">
            {booking.payments.map((p: any) => {
              const rb = p.recordedByUser;
              const ab = p.approvedByUser;
              return (
                <div key={p.id} className="py-4 text-sm space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold">
                        {METHOD_LABEL[p.paymentMethod] ?? p.paymentMethod}
                      </span>
                      {p.isManual && (
                        <span className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full">
                          Manual
                        </span>
                      )}
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full font-semibold
                        ${
                          p.status === "SUCCESS"
                            ? "bg-green-50  text-green-700"
                            : p.status === "FAILED"
                              ? "bg-red-50    text-red-600"
                              : p.status === "REFUNDED"
                                ? "bg-purple-50 text-purple-700"
                                : "bg-amber-50  text-amber-700"
                        }`}
                      >
                        {p.isManual && p.manualStatus
                          ? p.manualStatus.replace("_", " ")
                          : p.status}
                      </span>
                    </div>
                    <span className="font-black text-slate-900">
                      {formatCurrency(p.amount)}
                    </span>
                  </div>
                  {rb && (
                    <ActorCard
                      user={rb}
                      staffRecord={rb.staffOf}
                      label="Recorded by"
                    />
                  )}
                  {ab &&
                    (p.manualStatus === "APPROVED" ||
                      p.manualStatus === "REJECTED") && (
                      <ActorCard
                        user={ab}
                        staffRecord={ab.staffOf}
                        label={
                          p.manualStatus === "APPROVED"
                            ? "Approved by"
                            : "Rejected by"
                        }
                      />
                    )}
                  {p.paidAt && (
                    <p className="text-xs text-slate-400">
                      {formatDateTime(p.paidAt)}
                    </p>
                  )}
                </div>
              );
            })}
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <ClipboardList className="w-4 h-4" /> Corporate Audit Trail
          </CardTitle>
        </CardHeader>
        <CardContent>
          <AuditTrail booking={booking} />
        </CardContent>
      </Card>
    </div>
  );
}
