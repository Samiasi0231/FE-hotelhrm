import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import DashboardLayout from "@/layouts/DashboardLayout";
import AuthLayout from "@/layouts/AuthLayout";

import LoginPage from "@/pages/auth/LoginPage";
import RegisterPage from "@/pages/auth/RegisterPage";
import ForgotPasswordPage from "@/pages/auth/ForgotPasswordPage";
import SuperAdminLoginPage from "@/pages/auth/superAdminloginPage";
import AcceptInvitePage from "@/pages/auth/AcceptInvitePage";

import DashboardPage from "@/pages/dashboard/dashboard-page";
import HotelProfilePage from "@/pages/hotel/HotelProfilePage";
import CreateHotelPage from "@/pages/hotel/CreateHotelPage";
import EditHotelPage from "@/pages/hotel/EditHotelPage";
import RoomsPage from "@/pages/rooms/RoomsPage";
import AddRoomPage from "@/pages/rooms/AddRoomPage";
import EditRoomPage from "@/pages/rooms/EditRoomPage";
import RoomDetailPage from "@/pages/rooms/RoomDetailPage";
import BookingsPage from "@/pages/bookings/BookingsPage";
import BookingDetailPage from "@/pages/bookings/BookingDetailPage";
import CalendarPage from "@/pages/bookings/CalendarPage";
import NewBookingPage from "@/pages/bookings/NewBookingPage";
import StaffPage from "@/pages/staff/StaffPage";
import RosterPage from "@/pages/staff/RosterPage";
import RosterSettingsPage from "@/pages/settings/roster-settings-page";
import MyRosterPage from "@/pages/staff/MyRosterPage";
import SendInvitePage from "@/pages/staff/SendInvitePage";
import StaffDetailPage from "@/pages/staff/StaffDetailPage";
import AttendancePage from "@/pages/staff/AttendancePage";
import PaymentsPage from "@/pages/payments/PaymentsPage";
import SuperAdminDashboard from "@/pages/super-admin/SuperAdminDashboard";
import SuperAdminHotels from "@/pages/super-admin/SuperAdminHotels";
import SuperAdminUsers from "@/pages/super-admin/SuperAdminUsers";
import SuperAdminbrandingpage from "@/pages/super-admin/superAdminbrandingPage";

import SettingsPage from "@/pages/settings/SettingsPage";
import HotelPoliciesPage from "@/pages/settings/hotelPoliciesPage";
import AttendanceSettingsPage from "@/pages/settings/attendance-setting-page";
import AuditLogsPage from "@/pages/audit/AuditLogsPage";
import OnboardingPage from "@/pages/onboarding/onboardingPages";
import PublicHotelPage from "@/pages/public/publicPage";

// ── Marketing site ────────────────────────────────────────────────────────
import MarketingLayout from "@/pages/marketing/marketing-layout";
import HomePage from "@/pages/marketing/home-page";
import FeaturesPage from "@/pages/marketing/features-page";
import PricingPage from "@/pages/marketing/pricing-page";
import AboutPage from "@/pages/marketing/about-page";
import RoomsShowcasePage from "@/pages/marketing/rooms-showcase-page";
import ContactPage from "@/pages/marketing/contact-page";
import DemoPage from "@/pages/marketing/demo-page"

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* ── Marketing site — public, no auth ─────────────────────────── */}
          <Route element={<MarketingLayout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/features" element={<FeaturesPage />} />
            <Route path="/pricing" element={<PricingPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/explore-rooms" element={<RoomsShowcasePage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/demo" element={<DemoPage />} />
          </Route>

          {/* ── Super Admin portal — completely separate, own design ───────── */}
          <Route path="/super-admin/login" element={<SuperAdminLoginPage />} />

          {/* ── Staff / Director auth ──────────────────────────────────────── */}
          <Route element={<AuthLayout />}>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/accept-invite" element={<AcceptInvitePage />} />
          </Route>

          {/* ── Public booking page (no auth) ──────────────────────────────── */}
          <Route path="/book/:slug" element={<PublicHotelPage />} />

          {/* ── Onboarding (auth required, outside DashboardLayout) ─────────── */}
          <Route element={<ProtectedRoute />}>
            <Route path="/onboarding" element={<OnboardingPage />} />
          </Route>

          {/* ── Main app ───────────────────────────────────────────────────── */}
          <Route element={<ProtectedRoute />}>
            <Route element={<DashboardLayout />}>
              <Route path="/dashboard" element={<DashboardPage />} />

              <Route path="/hotel" element={<HotelProfilePage />} />
              <Route path="/hotel/create" element={<CreateHotelPage />} />
              <Route path="/hotel/edit" element={<EditHotelPage />} />

              <Route path="/rooms" element={<RoomsPage />} />
              <Route path="/rooms/add" element={<AddRoomPage />} />
              <Route path="/rooms/:id" element={<RoomDetailPage />} />
              <Route path="/rooms/:id/edit" element={<EditRoomPage />} />

              <Route path="/bookings" element={<BookingsPage />} />
              <Route path="/bookings/new" element={<NewBookingPage />} />
              <Route path="/bookings/calendar" element={<CalendarPage />} />
              <Route path="/bookings/:id" element={<BookingDetailPage />} />

              <Route path="/staff" element={<StaffPage />} />
              <Route path="/staff/invite" element={<SendInvitePage />} />
              <Route path="/staff/:id" element={<StaffDetailPage />} />
              <Route path="/roster" element={<RosterPage />} />
              <Route path="/settings/roster" element={<RosterSettingsPage />} />
              <Route path="/roster/mine" element={<MyRosterPage />} />
              <Route path="/attendance" element={<AttendancePage />} />

              <Route path="/payments" element={<PaymentsPage />} />
              <Route path="/audit-logs" element={<AuditLogsPage />} />

              <Route path="/settings" element={<SettingsPage />} />
              <Route
                path="/settings/policies"
                element={<HotelPoliciesPage />}
              />
              <Route
                path="/settings/attendance"
                element={<AttendanceSettingsPage />}
              />

              {/* Super Admin routes */}
              <Route path="/super-admin" element={<SuperAdminDashboard />} />
              <Route
                path="/super-admin/hotels"
                element={<SuperAdminHotels />}
              />
              <Route path="/super-admin/users" element={<SuperAdminUsers />} />
              <Route
                path="/super-admin/branding"
                element={<SuperAdminbrandingpage />}
              />
            </Route>
          </Route>

          {/* Unknown paths land on the marketing home, not the dashboard —
              a logged-out visitor hitting a typo'd URL should see the
              public site, not get redirected into an auth wall. */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        <Toaster />
      </AuthProvider>
    </BrowserRouter>
  );
}
