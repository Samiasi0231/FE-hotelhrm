// src/pages/public/components/BookingModal/ProcessingStep.tsx
import { CreditCard } from "lucide-react";

export function ProcessingStep({ step }: { step: "submitting" | "verifying" }) {
  return (
    <div className="p-12 flex flex-col items-center gap-4">
      <div className="relative">
        <div className="w-16 h-16 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin" />
        <CreditCard className="w-6 h-6 text-blue-600 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
      </div>
      <p className="text-slate-700 font-semibold">
        {step === "submitting"
          ? "Reserving your room..."
          : "Verifying payment..."}
      </p>
      <p className="text-slate-400 text-sm text-center max-w-xs">
        {step === "submitting"
          ? "Holding this room for 30 minutes while you complete payment"
          : "Confirming with Paystack — please wait"}
      </p>
    </div>
  );
}
