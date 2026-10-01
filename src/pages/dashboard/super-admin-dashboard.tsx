// src/pages/dashboard/SuperAdminDash.tsx
import {
  BedDouble,
  Users,
  CalendarCheck,
  DollarSign,
  AlertCircle,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/common";
import { formatCurrency, getStatusColor } from "@/lib/utils";
import { StatCard } from "./components/stat-card";

export function SuperAdminDash({ superDash }: { superDash: any }) {
  const ov = superDash.overview;
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">
          Super Admin Dashboard
        </h1>
        <p className="text-muted-foreground text-sm mt-0.5">
          Platform-wide overview
        </p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard
          title="Total Hotels"
          value={ov.totalHotels}
          sub={`${ov.activeHotels} active · ${ov.suspendedHotels} suspended`}
          icon={BedDouble}
          color="bg-blue-600"
        />
        <StatCard
          title="Total Users"
          value={ov.totalUsers}
          icon={Users}
          color="bg-purple-600"
        />
        <StatCard
          title="Total Bookings"
          value={ov.totalBookings}
          icon={CalendarCheck}
          color="bg-green-600"
        />
        <StatCard
          title="Monthly Revenue"
          value={formatCurrency(ov.monthlyRevenue)}
          icon={DollarSign}
          color="bg-amber-500"
        />
        <StatCard
          title="Suspended Hotels"
          value={ov.suspendedHotels}
          icon={AlertCircle}
          color="bg-red-500"
        />
      </div>
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Recent Hotels</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="divide-y">
            {superDash.recentHotels?.map((h: any) => (
              <div
                key={h.id}
                className="py-3 flex items-center justify-between gap-3"
              >
                <div className="min-w-0">
                  <p className="font-semibold text-sm truncate">{h.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {h.city}, {h.country} · {h.director?.email}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    🏠 {h._count?.rooms} rooms · 👥 {h._count?.staff} staff · 📋{" "}
                    {h._count?.bookings} bookings
                  </p>
                </div>
                <span
                  className={`text-xs px-2 py-0.5 rounded-full font-medium flex-shrink-0 ${getStatusColor(h.subscriptionStatus)}`}
                >
                  {h.subscriptionStatus}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
