// src/pages/bookings/detail/ApprovalPanel.tsx
import { useState } from "react";
import { paymentApi } from "@/api/services";
import { formatCurrency } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/toaster";
import { ShieldCheck, ShieldX } from "lucide-react";
import { METHOD_LABEL } from "./booking-detail.constants";
import { ActorCard } from "./autor-card";

interface Props {
  payment: any;
  actor: any;
  onSuccess: () => void;
}

export function ApprovalPanel({ payment, actor, onSuccess }: Props) {
  const [approvalNote, setApprovalNote] = useState("");
  const [rejectionReason, setRejectionReason] = useState("");
  const [tab, setTab] = useState<"approve" | "reject" | null>(null);
  const [loading, setLoading] = useState(false);
  const rb = payment.recordedByUser;

  async function approve() {
    if (!approvalNote.trim()) {
      toast.error("Note required");
      return;
    }
    try {
      setLoading(true);
      await paymentApi.approveManual(payment.id, approvalNote);
      toast.success("Payment approved", "Booking confirmed");
      onSuccess();
    } catch (e: any) {
      toast.error("Failed", e?.response?.data?.message);
    } finally {
      setLoading(false);
    }
  }

  async function reject() {
    if (!rejectionReason.trim()) {
      toast.error("Reason required");
      return;
    }
    try {
      setLoading(true);
      await paymentApi.rejectManual(payment.id, rejectionReason);
      toast.success("Payment rejected");
      onSuccess();
    } catch (e: any) {
      toast.error("Failed", e?.response?.data?.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="border-2 border-amber-300 bg-amber-50 rounded-2xl p-5 space-y-4">
      <div className="flex items-center gap-2">
        <div className="w-2 h-2 bg-amber-500 rounded-full animate-pulse" />
        <h3 className="font-bold text-amber-800 text-sm">
          Manual Payment — Ready for Approval
        </h3>
      </div>

      <div className="grid grid-cols-2 gap-3 text-sm">
        <div className="bg-white rounded-xl p-3">
          <p className="text-xs text-slate-400 font-semibold">Method</p>
          <p className="font-bold mt-0.5">
            {METHOD_LABEL[payment.paymentMethod] ?? payment.paymentMethod}
          </p>
        </div>
        <div className="bg-white rounded-xl p-3">
          <p className="text-xs text-slate-400 font-semibold">Amount</p>
          <p className="font-bold text-green-700 mt-0.5">
            {formatCurrency(payment.amount)}
          </p>
        </div>
      </div>

      {rb && (
        <ActorCard
          user={rb}
          staffRecord={rb.staffOf}
          label="Payment recorded by"
        />
      )}

      {(payment.providerData as any)?.note && (
        <div className="bg-white rounded-xl p-3 text-xs text-slate-600">
          <p className="font-semibold text-slate-400 mb-0.5">Staff note</p>
          <p className="italic">"{(payment.providerData as any).note}"</p>
        </div>
      )}

      <div className="bg-white border border-blue-100 rounded-xl p-3 text-xs text-slate-600 space-y-1">
        <p className="font-semibold text-slate-400 uppercase tracking-wide text-[10px]">
          Approval will be recorded under
        </p>
        <p className="font-bold text-slate-800">
          {actor?.firstName} {actor?.lastName}
        </p>
        <div className="flex gap-2 flex-wrap">
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

      {tab === null && (
        <div className="flex gap-3">
          <button
            onClick={() => setTab("approve")}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-xl text-sm font-bold transition-colors"
          >
            <ShieldCheck className="w-4 h-4" /> Approve Payment
          </button>
          <button
            onClick={() => setTab("reject")}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 rounded-xl text-sm font-bold transition-colors"
          >
            <ShieldX className="w-4 h-4" /> Reject
          </button>
        </div>
      )}

      {tab === "approve" && (
        <div className="space-y-2">
          <input
            value={approvalNote}
            onChange={(e) => setApprovalNote(e.target.value)}
            placeholder="Approval note e.g. Cash counted and confirmed..."
            className="w-full h-10 rounded-lg border border-slate-300 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
          />
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setTab(null)}
              className="flex-1"
            >
              Back
            </Button>
            <button
              onClick={approve}
              disabled={loading || !approvalNote.trim()}
              className="flex-1 py-2 bg-green-600 hover:bg-green-700 text-white rounded-xl text-sm font-bold disabled:opacity-50"
            >
              {loading ? "Confirming..." : "Confirm Approval"}
            </button>
          </div>
        </div>
      )}

      {tab === "reject" && (
        <div className="space-y-2">
          <input
            value={rejectionReason}
            onChange={(e) => setRejectionReason(e.target.value)}
            placeholder="Rejection reason..."
            className="w-full h-10 rounded-lg border border-slate-300 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-red-400"
          />
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setTab(null)}
              className="flex-1"
            >
              Back
            </Button>
            <button
              onClick={reject}
              disabled={loading || !rejectionReason.trim()}
              className="flex-1 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-sm font-bold disabled:opacity-50"
            >
              {loading ? "Rejecting..." : "Confirm Rejection"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
