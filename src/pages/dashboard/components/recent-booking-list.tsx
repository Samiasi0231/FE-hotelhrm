// src/pages/dashboard/components/RecentBookingsList.tsx
import { Link } from "react-router-dom";
import { formatDate, getStatusColor } from "@/lib/utils";

export function RecentBookingsList({ bookings }: { bookings: any[] }) {
  if (!bookings?.length) {
    return <p className="px-5 py-6 text-sm text-muted-foreground text-center">No bookings yet</p>;
  }

  return (
    <div className="divide-y">
      {bookings.slice(0, 6).map((b: any) => {
        const isPaid = b.payments?.some((p: any) => p.status === "SUCCESS");
        return (
          <Link key={b.id} to={`/bookings/${b.id}`} className="block px-5 py-3 hover:bg-slate-50 transition-colors">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="text-sm font-semibold truncate text-slate-800">{b.guestName}</p>
                <p className="text-xs text-muted-foreground">Room {b.room?.roomNumber} · {b.nights}n</p>
                <p className="text-xs text-muted-foreground">{formatDate(b.checkIn)}</p>
              </div>
              <div className="text-right flex-shrink-0">
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${getStatusColor(b.status)}`}>{b.status}</span>
                <p className={`text-xs mt-1 font-semibold ${isPaid ? "text-green-600" : "text-amber-600"}`}>
                  {isPaid ? "✅ Paid" : "⏳ Unpaid"}
                </p>
              </div>
            </div>
          </Link>
        );
      })}
    </div>
  );
}