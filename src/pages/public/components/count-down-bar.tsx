// src/pages/public/components/CountdownBar.tsx
import { AlertCircle, Timer } from "lucide-react";
import { useCountdown } from "../../../hooks/use-count-down";
import { HOLD_MINUTES } from "../../../lib/constant";

export function CountdownBar({ bookingCreatedAt }: { bookingCreatedAt: Date }) {
  const { mm, ss, pct, expired, secondsLeft } = useCountdown(
    bookingCreatedAt,
    HOLD_MINUTES,
  );
  const urgent = secondsLeft <= 5 * 60;

  if (expired) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-3 flex items-center gap-3">
        <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
        <div>
          <p className="text-red-700 text-sm font-semibold">
            Reservation expired
          </p>
          <p className="text-red-600 text-xs mt-0.5">
            This hold has timed out. Please close and try booking again.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`rounded-xl p-3 border ${urgent ? "bg-red-50 border-red-200" : "bg-amber-50 border-amber-200"}`}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Timer
            className={`w-4 h-4 ${urgent ? "text-red-500" : "text-amber-600"}`}
          />
          <span
            className={`text-xs font-semibold ${urgent ? "text-red-700" : "text-amber-700"}`}
          >
            Room held for you
          </span>
        </div>
        <span
          className={`text-lg font-bold font-mono tabular-nums ${urgent ? "text-red-600" : "text-amber-700"}`}
        >
          {mm}:{ss}
        </span>
      </div>
      <div className="w-full h-1.5 bg-white/60 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-1000 ${urgent ? "bg-red-500" : "bg-amber-500"}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <p
        className={`text-xs mt-1.5 ${urgent ? "text-red-600 font-medium" : "text-amber-600"}`}
      >
        {urgent
          ? "⚠️ Complete payment now — this room will be released soon"
          : "Complete payment to confirm your reservation"}
      </p>
    </div>
  );
}
