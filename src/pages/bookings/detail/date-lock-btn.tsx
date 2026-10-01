// src/pages/bookings/detail/DateLockedBtn.tsx
import { Lock, Info } from "lucide-react";
import { isTodayOrAfter, daysUntil } from "./booking-detail.utils";

interface Props {
  label: string;
  onClick: () => void;
  targetDate: string;
  targetLabel: string;
  disabled?: boolean;
  colorClass?: string;
}

export function DateLockedBtn({
  label,
  onClick,
  targetDate,
  targetLabel,
  disabled,
  colorClass,
}: Props) {
  const canAct = isTodayOrAfter(targetDate);
  const days = daysUntil(targetDate);
  const isDisabled = !canAct || disabled;

  return (
    <div className="flex flex-col gap-1">
      <button
        onClick={onClick}
        disabled={isDisabled}
        className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all
          ${isDisabled ? "bg-slate-100 text-slate-400 cursor-not-allowed" : (colorClass ?? "bg-blue-600 hover:bg-blue-700 text-white")}`}
      >
        {!canAct && <Lock className="w-3.5 h-3.5" />}
        {label}
      </button>
      {!canAct && (
        <p className="text-xs text-slate-400 flex items-center gap-1">
          <Info className="w-3 h-3" />
          {targetLabel} in {days} day{days !== 1 ? "s" : ""}
        </p>
      )}
    </div>
  );
}
