import { useQuery } from "@tanstack/react-query";
import { superAdminApi } from "@/api/services";
import { formatCurrency } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/common";
import {
  Building2,
  Users,
  CalendarCheck,
  DollarSign,
  TrendingUp,
} from "lucide-react";

export default function SuperAdminDashboard() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ["super-stats"],
    queryFn: () => superAdminApi.getStats().then((r) => r.data), 
  });

  if (isLoading)
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-8 w-48 bg-slate-200 rounded" />
        <div className="grid grid-cols-3 gap-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-24 bg-slate-200 rounded-xl" />
          ))}
        </div>
      </div>
    );

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold">Super Admin Dashboard</h1>
        <p className="text-muted-foreground text-sm">Platform-wide metrics</p>
      </div>

      {stats && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              {
                label: "Total Hotels",
                value: stats.totalHotels,
                sub: `${stats.activeHotels} active · ${stats.inactiveHotels} inactive`,
                icon: Building2,
                color: "bg-blue-600",
              },
              {
                label: "Total Users",
                value: stats.totalUsers,
                sub: "Across all hotels",
                icon: Users,
                color: "bg-purple-600",
              },
              {
                label: "Total Bookings",
                value: stats.totalBookings,
                icon: CalendarCheck,
                color: "bg-green-600",
              },
              {
                label: "Total Revenue",
                value: formatCurrency(stats.totalRevenue),
                sub: "Successful payments",
                icon: DollarSign,
                color: "bg-amber-500",
              },
              {
                label: "Active Rate",
                value: stats.totalHotels
                  ? `${Math.round((stats.activeHotels / stats.totalHotels) * 100)}%`
                  : "—",
                sub: `${stats.inactiveHotels} inactive or suspended`,
                icon: TrendingUp,
                color:
                  stats.totalHotels &&
                  stats.activeHotels / stats.totalHotels >= 0.8
                    ? "bg-green-600"
                    : "bg-orange-500",
              },
            ].map(({ label, value, sub, icon: Icon, color }) => (
              <Card key={label}>
                <CardContent className="p-5 flex items-center gap-3">
                  <div
                    className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${color}`}
                  >
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">{label}</p>
                    <p className="text-xl font-bold">{value}</p>
                    {sub && (
                      <p className="text-xs text-muted-foreground">{sub}</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Subscription breakdown */}
          {stats.subscriptionBreakdown?.length > 0 && (
            <div>
              <h2 className="text-base font-semibold text-slate-900 mb-3">
                Subscription breakdown
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {stats.subscriptionBreakdown.map((b: any) => (
                  <Card key={`${b.subscriptionPlan}-${b.subscriptionStatus}`}>
                    <CardContent className="p-4">
                      <p className="text-lg font-bold">{b._count}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {b.subscriptionPlan} · {b.subscriptionStatus}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
