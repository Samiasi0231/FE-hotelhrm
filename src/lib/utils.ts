import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number | string, currency = 'NGN') {
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
  }).format(Number(amount))
}

export function formatDate(date: string | Date, options?: Intl.DateTimeFormatOptions) {
  return new Intl.DateTimeFormat('en-NG', {
    year: 'numeric', month: 'short', day: 'numeric',
    ...options,
  }).format(new Date(date))
}

export function formatDateTime(date: string | Date) {
  return new Intl.DateTimeFormat('en-NG', {
    year: 'numeric', month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit',
  }).format(new Date(date))
}

export function getInitials(firstName = '', lastName = '') {
  return `${firstName[0] || ''}${lastName[0] || ''}`.toUpperCase()
}

export function getStatusColor(status: string) {
  const colors: Record<string, string> = {
    PENDING: 'bg-yellow-100 text-yellow-800',
    CONFIRMED: 'bg-green-100 text-green-800',
    CHECKED_IN: 'bg-blue-100 text-blue-800',
    CHECKED_OUT: 'bg-slate-100 text-slate-800',
    CANCELLED: 'bg-red-100 text-red-800',
    TIMEOUT: 'bg-orange-100 text-orange-800',
    SUCCESS: 'bg-green-100 text-green-800',
    FAILED: 'bg-red-100 text-red-800',
    AVAILABLE: 'bg-green-100 text-green-800',
    OCCUPIED: 'bg-blue-100 text-blue-800',
    MAINTENANCE: 'bg-orange-100 text-orange-800',
    ACTIVE: 'bg-green-100 text-green-800',
    INACTIVE: 'bg-slate-100 text-slate-800',
    SUSPENDED: 'bg-red-100 text-red-800',
  }
  return colors[status] || 'bg-slate-100 text-slate-600'
}

export function calcNights(checkIn: string | Date, checkOut: string | Date) {
  const ms = new Date(checkOut).getTime() - new Date(checkIn).getTime()
  return Math.ceil(ms / (1000 * 60 * 60 * 24))
}
// /lib/payment.ts
export const CANCEL_TYPE_LABEL: Record<string, string> = {
  REFUND: "💰 Refund Guest",
  NO_REFUND: "🚫 No Refund",
  WAIVER: "🤝 Waiver",
  OTHER: "📝 Other",
};

// src/lib/paystack.ts
// Standalone Paystack script loader — not page-specific, safe to reuse
// anywhere else Paystack's inline checkout is needed.

export function loadPaystackScript(): Promise<void> {
  return new Promise((resolve, reject) => {
    if ((window as any).PaystackPop) {
      resolve();
      return;
    }
    const s = document.createElement("script");
    s.src = "https://js.paystack.co/v1/inline.js";
    s.onload = () => resolve();
    s.onerror = () => reject(new Error("Failed to load Paystack"));
    document.head.appendChild(s);
  });
}

// src/pages/public/shared/date.utils.ts

export function formatPrice(n: number) {
  return `₦${Number(n).toLocaleString("en-NG")}`;
}

export function toDateInput(d: Date) {
  return d.toISOString().split("T")[0];
}

export function nightsBetween(a: string, b: string) {
  if (!a || !b) return 0;
  return Math.max(0, Math.ceil((new Date(b).getTime() - new Date(a).getTime()) / 86400000));
}

export function todayStr() {
  return toDateInput(new Date());
}

export function tomorrowStr() {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return toDateInput(d);
}