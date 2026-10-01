import { Shield, Lock, Database, Eye } from "lucide-react";

const POINTS = [
  {
    icon: Lock,
    title: "Encrypted in transit",
    desc: "All traffic between your staff, guests, and our servers is encrypted via HTTPS.",
  },
  {
    icon: Database,
    title: "Isolated hotel data",
    desc: "Each hotel's bookings, staff, and guest records are strictly scoped — no cross-hotel visibility.",
  },
  {
    icon: Eye,
    title: "Full audit logging",
    desc: "Every sensitive action — payments, cancellations, staff changes — is logged with who, what, and when.",
  },
  {
    icon: Shield,
    title: "Role-based access",
    desc: "Staff only see what their role permits. Directors and Admins control every permission.",
  },
];

export function DataProtectionSection() {
  return (
    <section id="data-protection" className="bg-slate-50 py-16">
      <div className="max-w-5xl mx-auto px-5 sm:px-8">
        <div className="text-center max-w-xl mx-auto mb-10">
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900">
            Your guest and staff data, protected
          </h2>
          <p className="text-slate-500 mt-2 text-sm">
            Hotel data is sensitive. Here's how HotelMS keeps it safe.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {POINTS.map(({ icon: Icon, title, desc }) => (
            <div
              key={title}
              className="bg-white rounded-2xl border border-slate-200 p-5 flex gap-4"
            >
              <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center flex-shrink-0">
                <Icon className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-sm">{title}</h3>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  {desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
