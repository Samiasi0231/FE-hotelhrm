// src/pages/public/components/BookingModal/SuccessStep.tsx
import { CheckCircle2 } from "lucide-react";
import { formatPrice } from "../../../../lib/utils";

interface Props {
  booking: any;
  hotel: any;
  room: any;
  form: any;
  nights: number;
  total: number;
  onClose: () => void;
}

export function SuccessStep({
  booking,
  hotel,
  room,
  form,
  nights,
  total,
  onClose,
}: Props) {
  const rows: [string, string][] = [
    ["🏨 Hotel", hotel.name],
    ["🛏 Room", `${room.roomType} — Room ${room.roomNumber}`],
    [
      "📅 Check-in",
      new Date(form.checkIn).toLocaleDateString("en-GB", {
        weekday: "short",
        day: "numeric",
        month: "long",
      }),
    ],
    [
      "📅 Check-out",
      new Date(form.checkOut).toLocaleDateString("en-GB", {
        weekday: "short",
        day: "numeric",
        month: "long",
      }),
    ],
    ["🌙 Nights", `${nights}`],
    ["💳 Total Paid", formatPrice(total)],
    ["✅ Status", "Confirmed"],
  ];

  return (
    <div className="p-6 space-y-4">
      <div className="text-center space-y-3">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
          <CheckCircle2 className="w-10 h-10 text-green-600" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-slate-900">
            Payment Successful!
          </h3>
          <p className="text-slate-500 text-sm mt-1">
            Your booking is confirmed
          </p>
        </div>
      </div>

      <div className="bg-blue-600 rounded-2xl p-5 text-center">
        <p className="text-blue-200 text-xs font-semibold uppercase tracking-widest mb-1">
          Booking Reference
        </p>
        <p className="text-white text-3xl font-black font-mono tracking-[0.2em]">
          {booking.bookingRef}
        </p>
        <p className="text-blue-200 text-xs mt-2">
          Screenshot this for check-in
        </p>
      </div>

      <div className="bg-slate-50 rounded-xl p-4 space-y-2.5 text-sm">
        {rows.map(([k, v]) => (
          <div key={k} className="flex justify-between items-center">
            <span className="text-slate-500">{k}</span>
            <span className="font-semibold text-slate-800 text-right max-w-[55%]">
              {v}
            </span>
          </div>
        ))}
      </div>

      <div className="bg-green-50 border border-green-100 rounded-xl p-4">
        <p className="font-semibold text-green-800 text-sm mb-1">
          📧 Confirmation email sent
        </p>
        <p className="text-green-700 text-xs">
          Full booking details have been sent to{" "}
          <strong>{form.guestEmail}</strong>. The hotel has also been notified.
        </p>
      </div>

      <button
        onClick={onClose}
        className="w-full py-3.5 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition-colors"
      >
        Done
      </button>
    </div>
  );
}
