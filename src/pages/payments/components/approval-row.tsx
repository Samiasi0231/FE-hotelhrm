// src/pages/payments/components/ApprovalRow.tsx
import { useState } from "react";
import { Link } from "react-router-dom";
import { paymentApi } from "@/api/services";
import { formatCurrency, formatDateTime } from "@/lib/utils";
import { CANCEL_TYPE_LABEL } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/toaster";
import { ShieldCheck, ShieldX, Eye } from "lucide-react";
import { ActorChip } from "./actor-chip";

interface Props {
  p: any;
  currentUser: any;
  onDone: () => void;
}

export function ApprovalRow({ p, currentUser, onDone }: Props) {
  const [mode, setMode] = useState<"idle" | "approve" | "reject">("idle");
  const [note, setNote] = useState("");
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);
  const rb = p.recordedByUser;
  const b = p.booking;

  async function approve() {
    if (!note.trim()) {
      toast.error("Approval note required");
      return;
    }
    try {
      setLoading(true);
      await paymentApi.approveManual(p.id, note);
      toast.success("Payment approved", "Booking confirmed");
      onDone();
    } catch (e: any) {
      toast.error("Failed", e?.response?.data?.message);
    } finally {
      setLoading(false);
    }
  }

  async function reject() {
    if (!reason.trim()) {
      toast.error("Rejection reason required");
      return;
    }
    try {
      setLoading(true);
      await paymentApi.rejectManual(p.id, reason);
      toast.success("Payment rejected");
      onDone();
    } catch (e: any) {
      toast.error("Failed", e?.response?.data?.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="border border-amber-200 bg-amber-50 rounded-2xl p-5 space-y-4">
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div className="space-y-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-black font-mono text-slate-900">
              {b?.bookingRef}
            </span>
            <span className="text-xs bg-amber-200 text-amber-800 px-2 py-0.5 rounded-full font-semibold">
              {CANCEL_TYPE_LABEL[p.paymentMethod] ?? p.paymentMethod}
            </span>
          </div>
          <p className="text-sm font-semibold text-slate-800">{b?.guestName}</p>
          <p className="text-xs text-slate-500">
            {b?.guestEmail} · {b?.guestPhone}
          </p>
          {b?.checkIn && (
            <p className="text-xs text-slate-400">
              {new Date(b.checkIn).toLocaleDateString("en-GB", {
                day: "numeric",
                month: "short",
                year: "numeric",
              })}
              {" → "}
              {new Date(b.checkOut).toLocaleDateString("en-GB", {
                day: "numeric",
                month: "short",
                year: "numeric",
              })}
            </p>
          )}
        </div>
        <div className="text-right">
          <p className="text-2xl font-black text-slate-900">
            {formatCurrency(p.amount)}
          </p>
          <p className="text-xs text-slate-400 mt-0.5">
            Recorded {formatDateTime(p.recordedAt)}
          </p>
        </div>
      </div>

      {rb && (
        <div className="bg-white rounded-xl px-3 py-2.5 space-y-1">
          <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wide">
            Recorded by
          </p>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-sm flex-shrink-0">
              {rb.firstName?.[0]}
              {rb.lastName?.[0]}
            </div>
            <ActorChip u={rb} staffOf={rb.staffOf} />
          </div>
          {(p.providerData as any)?.note && (
            <p className="text-xs text-slate-500 italic mt-1">
              Note: "{(p.providerData as any).note}"
            </p>
          )}
        </div>
      )}

      <div className="bg-white border border-blue-100 rounded-xl px-3 py-2.5 space-y-1">
        <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wide">
          Approval will be recorded under
        </p>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-green-700 font-bold text-sm flex-shrink-0">
            {currentUser?.firstName?.[0]}
            {currentUser?.lastName?.[0]}
          </div>
          <ActorChip u={currentUser} staffOf={currentUser?.staffOf} />
        </div>
      </div>

      <div className="flex gap-2">
        <Link
          to={`/bookings/${p.bookingId}`}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-600 border border-slate-200 hover:bg-slate-50 transition-colors"
        >
          <Eye className="w-3.5 h-3.5" /> View Booking
        </Link>
        {mode === "idle" && (
          <>
            <button
              onClick={() => setMode("approve")}
              className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-green-600 hover:bg-green-700 text-white rounded-xl text-xs font-bold transition-colors"
            >
              <ShieldCheck className="w-3.5 h-3.5" /> Approve
            </button>
            <button
              onClick={() => setMode("reject")}
              className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 rounded-xl text-xs font-bold transition-colors"
            >
              <ShieldX className="w-3.5 h-3.5" /> Reject
            </button>
          </>
        )}
      </div>

      {mode === "approve" && (
        <div className="space-y-2">
          <input
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Approval note e.g. Cash counted, ₦50,000 received..."
            className="w-full h-9 rounded-lg border border-slate-300 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
          />
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setMode("idle")}
              className="flex-1"
            >
              Back
            </Button>
            <button
              onClick={approve}
              disabled={loading || !note.trim()}
              className="flex-1 py-2 bg-green-600 hover:bg-green-700 text-white rounded-xl text-xs font-bold disabled:opacity-50 transition-colors"
            >
              {loading ? "Confirming..." : "Confirm Approval"}
            </button>
          </div>
        </div>
      )}

      {mode === "reject" && (
        <div className="space-y-2">
          <input
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Rejection reason e.g. Amount does not match..."
            className="w-full h-9 rounded-lg border border-slate-300 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-red-400"
          />
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setMode("idle")}
              className="flex-1"
            >
              Back
            </Button>
            <button
              onClick={reject}
              disabled={loading || !reason.trim()}
              className="flex-1 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold disabled:opacity-50 transition-colors"
            >
              {loading ? "Rejecting..." : "Confirm Rejection"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
