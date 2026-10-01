// src/pages/bookings/detail/booking-detail.constants.ts

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

export const STATUS_COLOR: Record<string, string> = {
  PENDING: "bg-amber-50  text-amber-700  border-amber-200",
  CONFIRMED: "bg-green-50  text-green-700  border-green-200",
  CHECKED_IN: "bg-blue-50   text-blue-700   border-blue-200",
  CHECKED_OUT: "bg-slate-50  text-slate-500  border-slate-200",
  CANCELLED: "bg-red-50    text-red-600    border-red-200",
  TIMEOUT: "bg-slate-50  text-slate-400  border-slate-200",
};