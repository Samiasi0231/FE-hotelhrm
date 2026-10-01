// src/pages/dashboard/DashboardPage.tsx — FULL REPLACEMENT
// Sub-components moved to ./components/, super admin view to ./SuperAdminDash.

import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { dashboardApi, hotelApi } from "@/api/services";
import { formatCurrency } from "@/lib/utils";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/common";
import {
  BedDouble,
  CalendarCheck,
  Users,
  DollarSign,
  ArrowUpRight,
  Clock,
  CheckCircle2,
  LogIn,
  LogOut,
} from "lucide-react";

import { SuperAdminDash } from "./super-admin-dashboard";
import { StatCard } from "./components/stat-card";
import { RoomOccupancyBar } from "./components/room-occupancy-bar";
import { TodayCard } from "./components/today-card";
import { StaffActivityFeed } from "./components/staff-activity-feed";
import { RecentBookingsList } from "./components/recent-booking-list";
import { RevenueChart } from "./components/revenue-chart";

export default function DashboardPage() {
  const { user } = useAuth();
  const [hotelId, setHotelId] = useState<string | null>(null);

  const { data: hotel } = useQuery({
    queryKey: ["my-hotel"],
    queryFn: () => hotelApi.getMyHotel().then((r) => r.data?.data || r.data),
    enabled: user?.role !== "SUPER_ADMIN",
  });

  useEffect(() => {
    if (hotel?.id) setHotelId(hotel.id);
  }, [hotel]);

  const { data: dashboard, isLoading } = useQuery({
    queryKey: ["dashboard", hotelId],
    queryFn: () =>
      dashboardApi
        .getHotelDashboard(hotelId!)
        .then((r) => r.data?.data || r.data),
    enabled: !!hotelId,
    refetchInterval: 60_000,
  });

  const { data: superDash } = useQuery({
    queryKey: ["super-dashboard"],
    queryFn: () =>
      dashboardApi.getSuperAdminDashboard().then((r) => r.data?.data || r.data),
    enabled: user?.role === "SUPER_ADMIN",
  });

  const { data: revenueChart } = useQuery({
    queryKey: ["revenue-chart", hotelId],
    queryFn: () =>
      dashboardApi
        .getRevenueChart(hotelId!, "monthly")
        .then((r) => r.data?.data || r.data),
    enabled: !!hotelId,
  });

  if (user?.role === "SUPER_ADMIN" && superDash) {
    return <SuperAdminDash superDash={superDash} />;
  }

  if (isLoading || !dashboard) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="h-8 w-48 bg-slate-200 rounded" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-28 bg-slate-200 rounded-xl" />
          ))}
        </div>
        <div className="h-64 bg-slate-200 rounded-xl" />
      </div>
    );
  }

  const ov = dashboard.overview;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
          <p className="text-muted-foreground text-sm mt-0.5">
            Welcome back, {user?.firstName}!
          </p>
        </div>
        <Link
          to="/bookings/new"
          className="inline-flex items-center gap-2 bg-blue-600 text-white text-sm px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium"
        >
          <CalendarCheck className="w-4 h-4" /> New Booking
        </Link>
      </div>

      {ov.pendingBookings > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 flex items-center gap-3">
          <div className="w-2 h-2 bg-amber-500 rounded-full animate-pulse flex-shrink-0" />
          <p className="text-amber-800 text-sm font-semibold">
            ⏳ {ov.pendingBookings} booking{ov.pendingBookings > 1 ? "s" : ""}{" "}
            awaiting payment
          </p>
          <Link
            to="/bookings?status=PENDING"
            className="ml-auto text-xs text-amber-700 underline hover:no-underline flex-shrink-0"
          >
            View
          </Link>
        </div>
      )}

      <div>
        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">
          Today's Activity
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <TodayCard
            label="Check-ins Today"
            count={ov.todayCheckIns}
            icon={LogIn}
            color="bg-blue-50 border-blue-200 text-blue-700"
            linkTo="/bookings?status=CONFIRMED"
          />
          <TodayCard
            label="Check-outs Today"
            count={ov.todayCheckOuts}
            icon={LogOut}
            color="bg-slate-50 border-slate-200 text-slate-700"
            linkTo="/bookings?status=CHECKED_IN"
          />
          <TodayCard
            label="Currently In-house"
            count={ov.checkedInBookings}
            icon={Users}
            color="bg-green-50 border-green-200 text-green-700"
            linkTo="/bookings?status=CHECKED_IN"
          />
          <TodayCard
            label="Awaiting Payment"
            count={ov.pendingBookings}
            icon={Clock}
            color={
              ov.pendingBookings > 0
                ? "bg-amber-50 border-amber-300 text-amber-700"
                : "bg-slate-50 border-slate-200 text-slate-700"
            }
            linkTo="/bookings?status=PENDING"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Rooms"
          value={ov.totalRooms}
          sub={`${ov.occupancyRate}% occupancy rate`}
          icon={BedDouble}
          color="bg-blue-600"
        />
        <StatCard
          title="Bookings This Month"
          value={ov.monthlyBookings}
          trend={ov.bookingGrowth}
          icon={CalendarCheck}
          color="bg-green-600"
        />
        <StatCard
          title="Monthly Revenue"
          value={formatCurrency(ov.monthlyRevenue)}
          trend={ov.revenueGrowth}
          icon={DollarSign}
          color="bg-amber-500"
        />
        <StatCard
          title="Active Staff"
          value={ov.activeStaff}
          sub={`of ${ov.totalStaff} total`}
          icon={Users}
          color="bg-purple-600"
        />
      </div>

      <Card>
        <CardContent className="p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-slate-900">Room Status</h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                Live — updates every minute
              </p>
            </div>
            <Link
              to="/rooms"
              className="text-xs text-blue-600 hover:underline flex items-center gap-1"
            >
              Manage rooms <ArrowUpRight className="w-3 h-3" />
            </Link>
          </div>
          <RoomOccupancyBar
            available={ov.availableRooms}
            occupied={ov.occupiedRooms}
            maintenance={ov.maintenanceRooms}
            total={ov.totalRooms}
          />
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Revenue Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <RevenueChart data={revenueChart} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">Recent Bookings</CardTitle>
            <Link
              to="/bookings"
              className="text-xs text-blue-600 hover:underline flex items-center gap-1"
            >
              View all <ArrowUpRight className="w-3 h-3" />
            </Link>
          </CardHeader>
          <CardContent className="px-0">
            <RecentBookingsList bookings={dashboard.recentBookings} />
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-blue-500" />
              Staff Check-in / Check-out Activity
            </CardTitle>
            <Link
              to="/bookings"
              className="text-xs text-blue-600 hover:underline flex items-center gap-1"
            >
              View all <ArrowUpRight className="w-3 h-3" />
            </Link>
          </CardHeader>
          <CardContent className="px-0">
            <StaffActivityFeed activities={dashboard.staffActivity} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
