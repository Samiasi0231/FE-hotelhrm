// src/pages/bookings/detail/CancelModal.tsx
import { useState } from "react";
import { bookingApi } from "@/api/services";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/toaster";
import { XCircle, User } from "lucide-react";
import { CANCEL_TYPE_LABEL } from "./booking-detail.constants";

interface Props {
  booking: any;
  actor: any;
  onClose: () => void;
  onSuccess: () => void;
}

export function CancelModal({ booking, actor, onClose, onSuccess }: Props) {
  const [cancelType, setCancelType] = useState<
    "NO_REFUND" | "REFUND" | "WAIVER" | "OTHER"
  >("NO_REFUND");
  const [reason, setReason] = useState("");
  const [refundAmount, setRefundAmount] = useState(Number(booking.totalAmount));
  const [loading, setLoading] = useState(false);
  const isPaid = booking.payments?.some((p: any) => p.status === "SUCCESS");

  async function submit() {
    if (!reason.trim()) {
      toast.error("Reason required");
      return;
    }
    try {
      setLoading(true);
      await bookingApi.updateStatus(
        booking.id,
        "CANCELLED",
        reason,
        cancelType,
        cancelType === "REFUND" ? refundAmount : undefined,
      );
      toast.success("Booking cancelled");
      onSuccess();
      onClose();
    } catch (e: any) {
      toast.error("Failed", e?.response?.data?.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 space-y-5">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold flex items-center gap-2">
            <XCircle className="w-5 h-5 text-red-500" /> Cancel Booking
          </h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 text-xl"
          >
            ✕
          </button>
        </div>

        <div className="bg-slate-50 rounded-xl p-3 text-sm">
          <p className="font-semibold">
            {booking.bookingRef} — {booking.guestName}
          </p>
          <p className="text-slate-500">
            {formatDate(booking.checkIn)} → {formatDate(booking.checkOut)} ·{" "}
            <span className="font-bold text-slate-800">
              {formatCurrency(booking.totalAmount)}
            </span>
          </p>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-semibold text-slate-700">
            Cancellation Type *
          </label>
          <div className="grid grid-cols-2 gap-2">
            {(["NO_REFUND", "REFUND", "WAIVER", "OTHER"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setCancelType(t)}
                className={`py-2.5 px-3 rounded-xl text-xs font-semibold border-2 transition-all text-left
                  ${cancelType === t ? "border-red-500 bg-red-50 text-red-700" : "border-slate-200 text-slate-600 hover:border-slate-300"}`}
              >
                {CANCEL_TYPE_LABEL[t]}
              </button>
            ))}
          </div>
          {cancelType === "REFUND" && !isPaid && (
            <p className="text-xs text-amber-600">
              ⚠️ No confirmed payment found on this booking
            </p>
          )}
        </div>

        {cancelType === "REFUND" && (
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-slate-700">
              Refund Amount (₦)
            </label>
            <input
              type="number"
              value={refundAmount}
              onChange={(e) => setRefundAmount(+e.target.value)}
              max={Number(booking.totalAmount)}
              min={0}
              className="w-full h-10 rounded-lg border border-slate-300 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-red-400"
            />
            <p className="text-xs text-slate-400">
              Max: {formatCurrency(booking.totalAmount)}
            </p>
          </div>
        )}

        <div className="space-y-1.5">
          <label className="text-sm font-semibold text-slate-700">
            Reason *
          </label>
          <textarea
            rows={3}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Provide a clear reason for cancellation..."
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-400 resize-none"
          />
        </div>

        <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-600 space-y-1">
          <p className="font-semibold flex items-center gap-1">
            <User className="w-3.5 h-3.5" /> Cancellation recorded under your
            account:
          </p>
          <p className="font-bold text-slate-800">
            {actor?.firstName} {actor?.lastName}
          </p>
          <div className="flex gap-2">
            <span className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full">
              {actor?.role}
            </span>
            {actor?.staffOf?.position && (
              <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">
                {actor.staffOf.position}
              </span>
            )}
            {actor?.staffOf?.employeeId && (
              <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-mono">
                #{actor.staffOf.employeeId}
              </span>
            )}
          </div>
          <p className="text-slate-400">{actor?.email}</p>
        </div>

        <div className="flex gap-3 pt-1">
          <Button variant="outline" onClick={onClose} className="flex-1">
            Back
          </Button>
          <button
            onClick={submit}
            disabled={loading || !reason.trim()}
            className={`flex-1 py-2 rounded-xl text-sm font-bold transition-colors
              ${loading || !reason.trim() ? "bg-slate-100 text-slate-400 cursor-not-allowed" : "bg-red-600 hover:bg-red-700 text-white"}`}
          >
            {loading ? "Cancelling..." : "Confirm Cancellation"}
          </button>
        </div>
      </div>
    </div>
  );
}
