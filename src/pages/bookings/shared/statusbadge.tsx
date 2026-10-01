// src/pages/bookings/shared/StatusBadge.tsx
// One badge component, one size prop, used everywhere a booking status shows.

import { AlertCircle } from "lucide-react";
import { STATUS_CONFIG } from "../shared/booking.constant";

interface Props {
  status: string;
  size?: "sm" | "md";
}

export function StatusBadge({ status, size = "md" }: Props) {
  const cfg = STATUS_CONFIG[status] ?? {
    label: status.replace("_", " "),
    bg: "bg-slate-50 text-slate-500 border-slate-200",
    icon: AlertCircle,
  };
  const Icon = cfg.icon;
  const sizeCls =
    size === "sm"
      ? "text-xs px-2.5 py-1 gap-1.5"
      : "text-sm px-3 py-1.5 gap-1.5";
  const iconCls = size === "sm" ? "w-3 h-3" : "w-4 h-4";

  return (
    <span
      className={`inline-flex items-center font-semibold rounded-full border ${sizeCls} ${cfg.bg}`}
    >
      <Icon className={iconCls} />
      {cfg.label}
    </span>
  );
}
