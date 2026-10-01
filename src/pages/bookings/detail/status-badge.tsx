// src/pages/bookings/detail/StatusBadge.tsx
import { Clock, CheckCircle2, XCircle, AlertCircle } from "lucide-react";
import { STATUS_COLOR } from "./booking-detail.constants";

const STATUS_ICON: Record<string, any> = {
  PENDING: Clock,
  CONFIRMED: CheckCircle2,
  CHECKED_IN: CheckCircle2,
  CHECKED_OUT: CheckCircle2,
  CANCELLED: XCircle,
  TIMEOUT: XCircle,
};

export function StatusBadge({ status }: { status: string }) {
  const Icon = STATUS_ICON[status] ?? AlertCircle;
  return (
    <span
      className={`inline-flex items-center gap-1.5 text-sm font-semibold px-3 py-1.5 rounded-full border ${
        STATUS_COLOR[status] ?? "bg-slate-50 text-slate-500 border-slate-200"
      }`}
    >
      <Icon className="w-4 h-4" />
      {status.replace("_", " ")}
    </span>
  );
}
