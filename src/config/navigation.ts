import {
  LayoutDashboard,
  Hotel,
  BedDouble,
  CalendarCheck,
  Users,
  CreditCard,
  ClipboardList,
  Shield,
  CalendarDays,
  Clock,
  ShieldCheck,
  Building2,
} from "lucide-react";

export interface NavItem {
  label: string;
  to: string;
  icon: React.ComponentType<{ className?: string }>;
  roles?: string[]; // omitted = visible to everyone shown this list
}

export const navItems: NavItem[] = [
  {
    label: "Dashboard",
    to: "/dashboard",
    icon: LayoutDashboard,
    roles: ["SUPER_ADMIN", "HOTEL_DIRECTOR", "ADMIN", "ADMIN_HR", "STAFF"],
  },
  {
    label: "Hotel Profile",
    to: "/hotel",
    icon: Hotel,
    roles: ["HOTEL_DIRECTOR", "ADMIN", "ADMIN_HR"],
  },
  {
    label: "Rooms",
    to: "/rooms",
    icon: BedDouble,
    roles: ["HOTEL_DIRECTOR", "ADMIN", "ADMIN_HR", "STAFF"],
  },
  {
    label: "Bookings",
    to: "/bookings",
    icon: CalendarCheck,
    roles: ["HOTEL_DIRECTOR", "ADMIN", "ADMIN_HR", "STAFF"],
  },
  {
    label: "Staff",
    to: "/staff",
    icon: Users,
    roles: ["HOTEL_DIRECTOR", "ADMIN", "ADMIN_HR"],
  },
  {
    label: "Staff Duty Schedule",
    to: "/roster",
    icon: CalendarDays,
    roles: ["HOTEL_DIRECTOR", "ADMIN", "ADMIN_HR", "STAFF"],
  },
  {
    label: "Attendance",
    to: "/attendance",
    icon: Clock,
    roles: ["HOTEL_DIRECTOR", "ADMIN", "ADMIN_HR", "STAFF"],
  },
  {
    label: "Payments",
    to: "/payments",
    icon: CreditCard,
    roles: ["HOTEL_DIRECTOR", "ADMIN"],
  },
  {
    label: "Hotel Policies",
    to: "/settings/policies",
    icon: Shield,
    roles: ["HOTEL_DIRECTOR", "ADMIN", "ADMIN_HR"],
  },
  {
    label: "Audit Logs",
    to: "/audit-logs",
    icon: ClipboardList,
    roles: ["SUPER_ADMIN", "HOTEL_DIRECTOR", "ADMIN"],
  },
];

export const superAdminItems: NavItem[] = [
  { label: "Super Admin", to: "/super-admin", icon: ShieldCheck },
  { label: "All Hotels", to: "/super-admin/hotels", icon: Building2 },
  { label: "All Users", to: "/super-admin/users", icon: Users },
  { label: "Branding", to: "/super-admin/branding", icon: ShieldCheck },
];