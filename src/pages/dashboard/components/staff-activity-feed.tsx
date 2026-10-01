// src/pages/dashboard/components/StaffActivityFeed.tsx
import { Link } from "react-router-dom";
import { LogIn, LogOut } from "lucide-react";
import { formatDate } from "@/lib/utils";

export function StaffActivityFeed({ activities }: { activities: any[] }) {
  if (!activities?.length) {
    return (
      <p className="px-5 py-6 text-sm text-muted-foreground text-center">
        No staff activity yet
      </p>
    );
  }

  return (
    <div className="divide-y">
      {activities.slice(0, 8).map((b: any) => {
        const isCheckIn = b.status === "CHECKED_IN";
        const staffMember = isCheckIn ? b.checkedInBy : b.checkedOutBy;
        const staffName = staffMember?.user
          ? `${staffMember.user.firstName} ${staffMember.user.lastName}`
          : "Unknown staff";

        return (
          <Link
            key={b.id}
            to={`/bookings/${b.id}`}
            className="flex items-start gap-3 px-5 py-3 hover:bg-slate-50 transition-colors"
          >
            <div
              className={`mt-0.5 flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center ${isCheckIn ? "bg-blue-100" : "bg-slate-100"}`}
            >
              {isCheckIn ? (
                <LogIn className="w-3.5 h-3.5 text-blue-600" />
              ) : (
                <LogOut className="w-3.5 h-3.5 text-slate-500" />
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-slate-800 truncate">
                {staffName}
              </p>
              <p className="text-xs text-muted-foreground truncate">
                {isCheckIn ? "Checked in" : "Checked out"}{" "}
                <span className="font-medium text-slate-700">
                  {b.guestName}
                </span>
                {" · "}Room {b.room?.roomNumber}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {formatDate(b.updatedAt)}
              </p>
            </div>
            <span
              className={`flex-shrink-0 text-xs px-2 py-0.5 rounded-full font-medium mt-0.5 ${isCheckIn ? "bg-blue-50 text-blue-700" : "bg-slate-100 text-slate-600"}`}
            >
              {isCheckIn ? "Check-in" : "Check-out"}
            </span>
          </Link>
        );
      })}
    </div>
  );
}
