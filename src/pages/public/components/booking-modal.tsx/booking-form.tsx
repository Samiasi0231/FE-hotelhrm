// src/pages/public/components/BookingModal/BookingForm.tsx
import {
  Calendar,
  Check,
  Clock,
  CreditCard,
  Shield,
  Timer,
} from "lucide-react";
import { formatPrice, todayStr } from "../../../../lib/utils";
import { CountdownBar } from "../count-down-bar";

interface Props {
  form: any;
  onFormChange: (form: any) => void;
  room: any;
  nights: number;
  total: number;
  booking: any;
  expired: boolean;
  bookingCreatedAt: Date | null;
  onSubmit: (e: React.FormEvent) => void;
}

const GUEST_FIELDS = [
  {
    key: "guestName",
    label: "Full Name",
    type: "text",
    placeholder: "John Adeyemi",
  },
  {
    key: "guestEmail",
    label: "Email Address",
    type: "email",
    placeholder: "john@example.com",
  },
  {
    key: "guestPhone",
    label: "Phone Number",
    type: "tel",
    placeholder: "+234 800 000 0000",
  },
];

export function BookingForm({
  form,
  onFormChange,
  room,
  nights,
  total,
  booking,
  expired,
  bookingCreatedAt,
  onSubmit,
}: Props) {
  return (
    <form onSubmit={onSubmit} className="p-5 space-y-4">
      {bookingCreatedAt && <CountdownBar bookingCreatedAt={bookingCreatedAt} />}

      {expired && booking && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-center">
          <p className="text-red-700 text-sm font-semibold">⏱ Hold expired</p>
          <p className="text-red-600 text-xs mt-0.5">
            Please close this and select the room again.
          </p>
        </div>
      )}

      {booking && !expired && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 flex items-start gap-2">
          <Timer className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-blue-800 text-xs font-semibold">
              Room is still held for you
            </p>
            <p className="text-blue-600 text-xs mt-0.5">
              Booking{" "}
              <strong className="font-mono">{booking.bookingRef}</strong> is
              reserved. Click below to reopen payment.
            </p>
          </div>
        </div>
      )}

      <div className="bg-gradient-to-br from-slate-900 to-blue-900 rounded-2xl p-5 text-white">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-slate-400 text-xs font-medium uppercase tracking-widest">
              Total to Pay
            </p>
            <p className="text-3xl font-black mt-1">{formatPrice(total)}</p>
            <p className="text-slate-400 text-xs mt-1">
              {formatPrice(Number(room.pricePerNight))} × {nights} night
              {nights !== 1 ? "s" : ""}
            </p>
          </div>
          <div className="text-right">
            <div className="bg-white/10 rounded-xl px-3 py-2 space-y-1.5">
              <div>
                <p className="text-slate-400 text-xs">Check-in</p>
                <p className="text-white text-sm font-bold">
                  {new Date(form.checkIn).toLocaleDateString("en-GB", {
                    day: "numeric",
                    month: "short",
                  })}
                </p>
              </div>
              <div className="border-t border-white/10 pt-1.5">
                <p className="text-slate-400 text-xs">Check-out</p>
                <p className="text-white text-sm font-bold">
                  {new Date(form.checkOut).toLocaleDateString("en-GB", {
                    day: "numeric",
                    month: "short",
                  })}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {(["checkIn", "checkOut"] as const).map((field) => (
          <div key={field} className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-600 flex items-center gap-1">
              <Calendar className="w-3 h-3" />{" "}
              {field === "checkIn" ? "Check-in" : "Check-out"}
            </label>
            <input
              type="date"
              min={
                field === "checkIn" ? todayStr() : form.checkIn || todayStr()
              }
              value={form[field]}
              disabled={!!booking}
              onChange={(e) =>
                onFormChange({ ...form, [field]: e.target.value })
              }
              className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-slate-50 disabled:text-slate-400 disabled:cursor-not-allowed"
              required
            />
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-600">Adults</label>
          <select
            value={form.adults}
            disabled={!!booking}
            onChange={(e) => onFormChange({ ...form, adults: +e.target.value })}
            className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-slate-50 disabled:cursor-not-allowed"
          >
            {Array.from({ length: room.capacity }, (_, i) => i + 1).map((n) => (
              <option key={n} value={n}>
                {n} Adult{n !== 1 ? "s" : ""}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-600">
            Children
          </label>
          <select
            value={form.children}
            disabled={!!booking}
            onChange={(e) =>
              onFormChange({ ...form, children: +e.target.value })
            }
            className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-slate-50 disabled:cursor-not-allowed"
          >
            {[0, 1, 2, 3, 4].map((n) => (
              <option key={n} value={n}>
                {n} {n === 1 ? "Child" : "Children"}
              </option>
            ))}
          </select>
        </div>
      </div>

      <hr className="border-slate-100" />

      <div className="space-y-3">
        <p className="text-sm font-bold text-slate-800">Your Details</p>
        {GUEST_FIELDS.map(({ key, label, type, placeholder }) => (
          <div key={key} className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-600">
              {label} *
            </label>
            <input
              type={type}
              placeholder={placeholder}
              value={form[key]}
              disabled={!!booking}
              onChange={(e) => onFormChange({ ...form, [key]: e.target.value })}
              required
              className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-slate-50 disabled:text-slate-400 disabled:cursor-not-allowed"
            />
          </div>
        ))}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-600">
            Special Requests
          </label>
          <textarea
            placeholder="Dietary needs, room preferences, late check-in..."
            value={form.specialRequests}
            disabled={!!booking}
            onChange={(e) =>
              onFormChange({ ...form, specialRequests: e.target.value })
            }
            rows={2}
            className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none disabled:bg-slate-50 disabled:cursor-not-allowed"
          />
        </div>
      </div>

      <div className="flex items-center justify-center gap-5 text-xs text-slate-400">
        <span className="flex items-center gap-1.5">
          <Shield className="w-3.5 h-3.5 text-green-500" /> Paystack secured
        </span>
        <span className="flex items-center gap-1.5">
          <Clock className="w-3.5 h-3.5 text-blue-400" /> 30-min hold
        </span>
        <span className="flex items-center gap-1.5">
          <Check className="w-3.5 h-3.5 text-blue-500" /> Instant confirm
        </span>
      </div>

      <button
        type="submit"
        disabled={nights <= 0 || (expired && !!booking)}
        className="w-full py-4 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-xl transition-colors flex items-center justify-center gap-2 text-sm"
      >
        <CreditCard className="w-5 h-5" />
        {booking && !expired
          ? "Reopen Payment"
          : `Pay ${formatPrice(total)} with Paystack`}
      </button>

      <p className="text-center text-xs text-slate-400">
        🔒 Card details never stored · Powered by Paystack
      </p>
    </form>
  );
}
