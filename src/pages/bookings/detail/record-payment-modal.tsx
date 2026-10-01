// src/pages/bookings/detail/RecordPaymentModal.tsx
import { useState } from "react";
import { paymentApi } from "@/api/services";
import { formatCurrency } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/toaster";
import { Banknote, Info } from "lucide-react";
import { METHOD_LABEL } from "./booking-detail.constants";

interface Props {
  booking: any;
  onClose: () => void;
  onSuccess: () => void;
}

export function RecordPaymentModal({ booking, onClose, onSuccess }: Props) {
  const [method, setMethod] = useState<"CASH" | "POS" | "BANK_TRANSFER">(
    "CASH",
  );
  const [note, setNote] = useState("");
  const [amount, setAmount] = useState(Number(booking.totalAmount));
  const [loading, setLoading] = useState(false);

  async function submit() {
    try {
      setLoading(true);
      await paymentApi.recordManual({
        bookingId: booking.id,
        paymentMethod: method,
        note,
        amount,
      });
      toast.success("Payment recorded", "Ready for approval");
      onSuccess();
      onClose();
    } catch (e: any) {
      toast.error("Failed", e?.response?.data?.message || "Please try again");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 space-y-5">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold flex items-center gap-2">
            <Banknote className="w-5 h-5 text-green-600" /> Record Payment
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
          <p className="text-slate-500 mt-0.5">
            Total Due:{" "}
            <span className="font-bold text-slate-800">
              {formatCurrency(booking.totalAmount)}
            </span>
          </p>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-semibold text-slate-700">
            Payment Method *
          </label>
          <div className="grid grid-cols-3 gap-2">
            {(["CASH", "POS", "BANK_TRANSFER"] as const).map((m) => (
              <button
                key={m}
                onClick={() => setMethod(m)}
                className={`py-2.5 px-2 rounded-xl text-xs font-semibold border-2 transition-all
                  ${method === m ? "border-blue-600 bg-blue-50 text-blue-700" : "border-slate-200 text-slate-600 hover:border-slate-300"}`}
              >
                {METHOD_LABEL[m]}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-semibold text-slate-700">
            Amount (₦)
          </label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(+e.target.value)}
            min={1}
            className="w-full h-10 rounded-lg border border-slate-300 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-semibold text-slate-700">
            Reference / Note (optional)
          </label>
          <input
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="e.g. POS receipt #4521..."
            className="w-full h-10 rounded-lg border border-slate-300 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="bg-green-50 border border-green-200 rounded-xl p-3 text-xs text-green-700 flex gap-2">
          <Info className="w-4 h-4 flex-shrink-0 mt-0.5" />
          Your account details will be recorded with this payment. You can
          approve it immediately after recording.
        </div>

        <div className="flex gap-3 pt-1">
          <Button variant="outline" onClick={onClose} className="flex-1">
            Cancel
          </Button>
          <Button
            onClick={submit}
            disabled={loading || !amount}
            className="flex-1 bg-green-600 hover:bg-green-700"
          >
            {loading ? "Recording..." : "Record Payment"}
          </Button>
        </div>
      </div>
    </div>
  );
}
