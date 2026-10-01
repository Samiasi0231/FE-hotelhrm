import {
  BedDouble,
  CalendarCheck,
  Users,
  CreditCard,
  Clock,
  ShieldCheck,
  CalendarDays,
  BarChart3,
  Globe,
} from "lucide-react";

export const FEATURES = [
  {
    icon: BedDouble,
    title: "Room Management",
    desc: "Track every room's status, pricing, and availability in real time.",
  },
  {
    icon: CalendarCheck,
    title: "Online Bookings",
    desc: "A branded public booking page, accepting Paystack payments 24/7.",
  },
  {
    icon: CreditCard,
    title: "Manual Payments",
    desc: "Record cash, POS, or bank transfer payments with a staff approval workflow.",
  },
  {
    icon: Users,
    title: "Staff Management",
    desc: "Invite staff by email, assign roles, and control who can do what.",
  },
  {
    icon: CalendarDays,
    title: "Duty Rosters",
    desc: "Build weekly shift schedules your team can view from anywhere.",
  },
  {
    icon: Clock,
    title: "Attendance & Geofencing",
    desc: "Clock in/out verified against your property's actual location.",
  },
  {
    icon: ShieldCheck,
    title: "Full Audit Trail",
    desc: "Every booking, payment, and status change is logged with who did it.",
  },
  {
    icon: BarChart3,
    title: "Revenue Dashboard",
    desc: "Live occupancy, revenue trends, and booking activity at a glance.",
  },
  {
    icon: Globe,
    title: "Multi-Hotel Ready",
    desc: "Built to scale from a single property to a growing portfolio.",
  },
];

export function FeatureGrid({ limit }: { limit?: number }) {
  const items = limit ? FEATURES.slice(0, limit) : FEATURES;
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
      {items.map(({ icon: Icon, title, desc }) => (
        <div
          key={title}
          className="bg-white border border-slate-200 rounded-2xl p-6 hover:shadow-md transition-shadow"
        >
          <div className="w-11 h-11 bg-blue-50 rounded-xl flex items-center justify-center mb-4">
            <Icon className="w-5 h-5 text-blue-600" />
          </div>
          <h3 className="font-bold text-slate-900 mb-1.5">{title}</h3>
          <p className="text-sm text-slate-500 leading-relaxed">{desc}</p>
        </div>
      ))}
    </div>
  );
}
