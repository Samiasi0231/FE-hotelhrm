
// src/pages/bookings/shared/booking.utils.ts
// Every date/status derivation used across the bookings pages lives here —
// nowhere else should recompute these inline.

export function isTodayOrAfter(d: string) {
  const date = new Date(d);
  date.setHours(0, 0, 0, 0);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return today >= date;
}

export function daysUntil(d: string) {
  const date = new Date(d);
  date.setHours(0, 0, 0, 0);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return Math.ceil((date.getTime() - today.getTime()) / 86400000);
}

/** True if a CONFIRMED booking was created within the last N hours (default 24). */
export function isRecentlyConfirmed(booking: any, hours = 24) {
  return booking.status === "CONFIRMED" && Date.now() - new Date(booking.createdAt).getTime() < hours * 60 * 60 * 1000;
}

export function isPaid(booking: any) {
  return booking.payments?.some((p: any) => p.status === "SUCCESS") ?? false;
}

export function getPendingManualPayment(booking: any) {
  return booking.payments?.find((p: any) => p.isManual && p.manualStatus === "PENDING_APPROVAL");
}

export function getPaymentBadge(booking: any): { label: string; cls: string } {
  if (isPaid(booking)) return { label: "✅ Paid", cls: "bg-green-50 text-green-700" };
  if (getPendingManualPayment(booking)) return { label: "🕐 Awaiting Approval", cls: "bg-amber-50 text-amber-800" };
  return { label: "⏳ Unpaid", cls: "bg-slate-100 text-slate-500" };
}