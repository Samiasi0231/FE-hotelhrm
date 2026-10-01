import { formatCurrency, formatDateTime } from "@/lib/utils";
import { METHOD_LABEL, CANCEL_TYPE_LABEL } from "./booking-detail.constants";
import { ActorCard } from "./autor-card";

type Event = {
  color: string;
  title: string;
  time?: string;
  user?: any;
  staffRecord?: any;
  note?: string;
};

function buildEvents(booking: any): Event[] {
  const events: Event[] = [];

  events.push({
    color: "bg-blue-400",
    title: "Booking created",
    time: formatDateTime(booking.createdAt),
  });

  booking.payments?.forEach((p: any) => {
    if (p.isManual) {
      const rb = p.recordedByUser;
      events.push({
        color: "bg-amber-400",
        title: `Manual payment recorded — ${METHOD_LABEL[p.paymentMethod] ?? p.paymentMethod}`,
        user: rb,
        staffRecord: rb?.staffOf,
        note: (p.providerData as any)?.note,
        time: p.recordedAt ? formatDateTime(p.recordedAt) : undefined,
      });
      if (p.manualStatus === "APPROVED") {
        const ab = p.approvedByUser;
        events.push({
          color: "bg-green-500",
          title: `Payment approved${p.approvalNote ? ` — "${p.approvalNote}"` : ""}`,
          user: ab,
          staffRecord: ab?.staffOf,
          time: p.approvedAt ? formatDateTime(p.approvedAt) : undefined,
        });
      }
      if (p.manualStatus === "REJECTED") {
        const ab = p.approvedByUser;
        events.push({
          color: "bg-red-400",
          title: `Payment rejected — "${p.rejectionReason ?? ""}"`,
          user: ab,
          staffRecord: ab?.staffOf,
          time: p.approvedAt ? formatDateTime(p.approvedAt) : undefined,
        });
      }
    } else if (p.status === "SUCCESS") {
      events.push({
        color: "bg-green-400",
        title: `Online payment confirmed — ${p.provider}`,
        note: `Ref: ${p.providerRef}`,
        time: p.paidAt ? formatDateTime(p.paidAt) : undefined,
      });
    } else if (p.status === "REFUNDED") {
      events.push({ color: "bg-purple-400", title: "Payment refunded" });
    }
  });

  if (booking.confirmedAt) {
    events.push({
      color: "bg-green-500",
      title: "Booking confirmed",
      time: formatDateTime(booking.confirmedAt),
    });
  }

  if (booking.checkedInAt) {
    const ci = booking.checkedInBy;
    events.push({
      color: "bg-blue-500",
      title: "Guest checked in",
      user: ci?.user,
      staffRecord: ci,
      time: formatDateTime(booking.checkedInAt),
    });
  }

  if (booking.checkedOutAt) {
    const co = booking.checkedOutBy;
    events.push({
      color: "bg-slate-400",
      title: "Guest checked out",
      user: co?.user,
      staffRecord: co,
      time: formatDateTime(booking.checkedOutAt),
    });
  }

  if (booking.cancelledAt) {
    const cu = booking.cancelledByUser;
    const parts = [
      booking.cancelType
        ? `${CANCEL_TYPE_LABEL[booking.cancelType] ?? booking.cancelType}`
        : null,
      booking.refundAmount
        ? `Refund: ${formatCurrency(booking.refundAmount)}`
        : null,
    ]
      .filter(Boolean)
      .join(" · ");

    events.push({
      color: "bg-red-400",
      title:
        booking.status === "TIMEOUT"
          ? "Booking expired (unpaid)"
          : `Booking cancelled${parts ? ` — ${parts}` : ""}`,
      user: cu,
      staffRecord: cu?.staffOf,
      note: booking.cancelReason?.split("|")[0]?.replace("Reason:", "").trim(),
      time: formatDateTime(booking.cancelledAt),
    });
  }

  return events;
}

export function AuditTrail({ booking }: { booking: any }) {
  const events = buildEvents(booking);

  return (
    <div className="space-y-4">
      {events.map((e, i) => (
        <div key={i} className="flex items-start gap-3">
          <div
            className={`w-2.5 h-2.5 rounded-full mt-1.5 flex-shrink-0 ${e.color}`}
          />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-slate-800">{e.title}</p>
            {e.note && (
              <p className="text-xs text-slate-500 italic mt-0.5">"{e.note}"</p>
            )}
            {e.time && (
              <p className="text-xs text-slate-400 mt-0.5">{e.time}</p>
            )}
            {e.user && (
              <ActorCard user={e.user} staffRecord={e.staffRecord} label="By" />
            )}
          </div>
        </div>
      ))}
      {events.length <= 1 && (
        <p className="text-xs text-muted-foreground">
          No further activity recorded yet
        </p>
      )}
    </div>
  );
}
