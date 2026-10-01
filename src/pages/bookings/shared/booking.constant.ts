// src/pages/bookings/shared/booking.constants.ts
// Single source of truth for status labels/colors/icons and payment/cancel
// labels — used by BookingsPage, BookingDetailPage, and NewBookingPage.

import { Clock, CheckCircle2, XCircle } from "lucide-react";

export const STATUS_CONFIG: Record<string, { label: string; bg: string; icon: any }> = {
  PENDING: { label: "Awaiting Payment", bg: "bg-amber-50 text-amber-700 border-amber-200", icon: Clock },
  CONFIRMED: { label: "Confirmed & Paid", bg: "bg-green-50 text-green-700 border-green-200", icon: CheckCircle2 },
  CHECKED_IN: { label: "Checked In", bg: "bg-blue-50 text-blue-700 border-blue-200", icon: CheckCircle2 },
  CHECKED_OUT: { label: "Checked Out", bg: "bg-slate-50 text-slate-500 border-slate-200", icon: CheckCircle2 },
  CANCELLED: { label: "Cancelled", bg: "bg-red-50 text-red-600 border-red-200", icon: XCircle },
  TIMEOUT: { label: "Expired", bg: "bg-slate-50 text-slate-400 border-slate-200", icon: XCircle },
};

export const STATUSES = ["", "PENDING", "CONFIRMED", "CHECKED_IN", "CHECKED_OUT", "CANCELLED", "TIMEOUT"];

export const METHOD_LABEL: Record<string, string> = {
  CASH: "💵 Cash",
  POS: "💳 POS Terminal",
  BANK_TRANSFER: "🏦 Bank Transfer",
  ONLINE: "🌐 Online",
};

export const CANCEL_TYPE_LABEL: Record<string, string> = {
  REFUND: "💰 Refund Guest",
  NO_REFUND: "🚫 No Refund",
  WAIVER: "🤝 Waiver",
  OTHER: "📝 Other",
};