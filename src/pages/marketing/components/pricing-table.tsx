import { Link } from "react-router-dom";
import { Check } from "lucide-react";

const PLANS = [
  {
    name: "Small Property",
    code: "SMALL",
    price: "₦15,000",
    period: "/month",
    desc: "For independent hotels with up to 20 rooms",
    features: [
      "Up to 20 rooms",
      "Unlimited bookings",
      "Online + manual payments",
      "Staff management (up to 5 accounts)",
      "Attendance & roster",
      "Email support",
    ],
    cta: "Start with Small",
  },
  {
    name: "Large Property",
    code: "LARGE",
    price: "₦35,000",
    period: "/month",
    desc: "For hotels and small chains with growing teams",
    features: [
      "Unlimited rooms",
      "Unlimited bookings",
      "Online + manual payments",
      "Unlimited staff accounts",
      "Attendance, roster & geofencing",
      "Priority support",
      "Full audit log & export",
    ],
    cta: "Start with Large",
    highlighted: true,
  },
];

export function PricingTable() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-3xl mx-auto">
      {PLANS.map((plan) => (
        <div
          key={plan.code}
          className={`rounded-2xl p-7 border-2 ${plan.highlighted ? "border-blue-600 bg-blue-50/40 relative" : "border-slate-200 bg-white"}`}
        >
          {plan.highlighted && (
            <span className="absolute -top-3 left-7 bg-blue-600 text-white text-xs font-bold px-3 py-1 rounded-full">
              Most Popular
            </span>
          )}
          <h3 className="font-bold text-slate-900 text-lg">{plan.name}</h3>
          <p className="text-sm text-slate-500 mt-1">{plan.desc}</p>
          <div className="mt-4 flex items-baseline gap-1">
            <span className="text-3xl font-black text-slate-900">
              {plan.price}
            </span>
            <span className="text-sm text-slate-400">{plan.period}</span>
          </div>
          <ul className="mt-5 space-y-2.5">
            {plan.features.map((f) => (
              <li
                key={f}
                className="flex items-start gap-2 text-sm text-slate-600"
              >
                <Check className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />{" "}
                {f}
              </li>
            ))}
          </ul>
          <Link
            to="/register"
            className={`mt-6 block text-center py-3 rounded-xl font-bold text-sm transition-colors ${
              plan.highlighted
                ? "bg-blue-600 hover:bg-blue-700 text-white"
                : "border border-slate-300 text-slate-700 hover:bg-slate-50"
            }`}
          >
            {plan.cta}
          </Link>
        </div>
      ))}
    </div>
  );
}
