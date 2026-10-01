// src/pages/public/components/BookingModal/PayingStep.tsx
import { CreditCard } from "lucide-react";
import { CountdownBar } from "../count-down-bar";

export function PayingStep({
  bookingCreatedAt,
}: {
  bookingCreatedAt: Date | null;
}) {
  return (
    <div className="p-8 flex flex-col items-center gap-5">
      <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center">
        <CreditCard className="w-8 h-8 text-blue-600" />
      </div>
      <div className="text-center">
        <p className="text-slate-800 font-bold text-lg">
          Payment window is open
        </p>
        <p className="text-slate-500 text-sm mt-1">
          Complete your payment in the Paystack popup to confirm your booking.
        </p>
      </div>
      {bookingCreatedAt && <CountdownBar bookingCreatedAt={bookingCreatedAt} />}
      <div className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 text-center">
        <p className="text-slate-500 text-xs">
          ⚠️ Do not close this page until payment is complete
        </p>
      </div>
    </div>
  );
}
