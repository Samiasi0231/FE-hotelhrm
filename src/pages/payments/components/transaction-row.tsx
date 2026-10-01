// src/pages/payments/components/TransactionRow.tsx
import { formatCurrency, formatDateTime } from "@/lib/utils";
import { CANCEL_TYPE_LABEL } from "@/lib/utils";
import { Banknote } from "lucide-react";
import { ActorChip } from "./actor-chip";

function getStatusDisplay(p: any) {
  const statusClass =
    p.isManual && p.manualStatus === "PENDING_APPROVAL"
      ? "bg-amber-50 text-amber-700"
      : p.isManual && p.manualStatus === "APPROVED"
        ? "bg-green-50 text-green-700"
        : p.isManual && p.manualStatus === "REJECTED"
          ? "bg-red-50 text-red-600"
          : p.status === "SUCCESS"
            ? "bg-green-50 text-green-700"
            : p.status === "FAILED"
              ? "bg-red-50 text-red-600"
              : p.status === "REFUNDED"
                ? "bg-purple-50 text-purple-700"
                : "bg-slate-100 text-slate-600";

  const label =
    p.isManual && p.manualStatus ? p.manualStatus.replace(/_/g, " ") : p.status;

  return { statusClass, label };
}

export function TransactionRow({ p }: { p: any }) {
  const rb = p.recordedByUser;
  const ab = p.approvedByUser;
  const { statusClass, label } = getStatusDisplay(p);

  return (
    <tr className="hover:bg-slate-50 transition-colors">
      <td className="px-4 py-3">
        <div className="flex items-center gap-1.5">
          <span className="font-mono text-xs font-bold text-blue-600 truncate max-w-[110px]">
            {p.providerRef ?? "—"}
          </span>
          {p.isManual && (
            <Banknote className="w-3.5 h-3.5 text-green-600 flex-shrink-0" />
          )}
        </div>
        <p className="text-xs text-slate-400 mt-0.5">{p.booking?.bookingRef}</p>
      </td>

      <td className="px-4 py-3">
        <p className="font-semibold text-slate-800">{p.booking?.guestName}</p>
      </td>

      <td className="px-4 py-3">
        <span
          className={`text-xs px-2 py-0.5 rounded-full font-medium whitespace-nowrap
          ${
            p.provider === "PAYSTACK"
              ? "bg-blue-100 text-blue-700"
              : p.provider === "FLUTTERWAVE"
                ? "bg-orange-100 text-orange-700"
                : "bg-green-100 text-green-700"
          }`}
        >
          {CANCEL_TYPE_LABEL[p.paymentMethod] ?? p.paymentMethod}
        </span>
      </td>

      <td className="px-4 py-3 font-bold text-slate-900 whitespace-nowrap">
        {formatCurrency(p.amount)}
      </td>

      <td className="px-4 py-3">
        <span
          className={`text-xs px-2 py-0.5 rounded-full font-semibold whitespace-nowrap ${statusClass}`}
        >
          {label}
        </span>
      </td>

      <td className="px-4 py-3">
        {rb ? (
          <ActorChip u={rb} staffOf={rb.staffOf} />
        ) : (
          <span className="text-slate-300 text-xs">—</span>
        )}
      </td>

      <td className="px-4 py-3">
        {ab ? (
          <div className="space-y-1">
            <ActorChip u={ab} staffOf={ab.staffOf} />
            {p.approvalNote && (
              <p className="text-[10px] text-green-600 italic truncate max-w-[140px]">
                "{p.approvalNote}"
              </p>
            )}
            {p.rejectionReason && (
              <p className="text-[10px] text-red-500 italic truncate max-w-[140px]">
                "{p.rejectionReason}"
              </p>
            )}
          </div>
        ) : (
          <span className="text-slate-300 text-xs">—</span>
        )}
      </td>

      <td className="px-4 py-3 text-xs text-muted-foreground whitespace-nowrap">
        {formatDateTime(p.paidAt ?? p.createdAt)}
      </td>
    </tr>
  );
}
