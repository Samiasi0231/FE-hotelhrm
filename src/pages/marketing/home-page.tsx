import { Link } from "react-router-dom";
import { ArrowRight, PlayCircle } from "lucide-react";
import { FeatureGrid } from "./components/feature-grid";
import { PricingTable } from "./components/pricing-table";
import { DataProtectionSection } from "./components/data-protection-section";

export default function HomePage() {
  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-b from-blue-50 to-white py-20 px-5 sm:px-8 text-center">
        <div className="max-w-2xl mx-auto">
          <span className="inline-block text-xs font-semibold text-blue-700 bg-blue-100 px-3 py-1 rounded-full mb-4">
            Built for Nigerian & West African hotels
          </span>
          <h1 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight">
            Run your hotel — bookings, staff, and payments — from one dashboard
          </h1>
          <p className="text-slate-500 mt-4 text-base sm:text-lg">
            HotelMS replaces spreadsheets and WhatsApp groups with a single
            platform for rooms, reservations, staff, and revenue.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center mt-8">
            <Link
              to="/register"
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 py-3.5 rounded-xl flex items-center justify-center gap-2 transition-colors"
            >
              Get started free <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/demo"
              className="border border-slate-300 text-slate-700 font-bold px-6 py-3.5 rounded-xl flex items-center justify-center gap-2 hover:bg-slate-50 transition-colors"
            >
              <PlayCircle className="w-4 h-4" /> See a live demo
            </Link>
          </div>
        </div>
      </section>

      {/* Feature highlights */}
      <section className="py-16 px-5 sm:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center max-w-xl mx-auto mb-10">
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900">
              Everything your front desk needs
            </h2>
            <p className="text-slate-500 mt-2 text-sm">
              From check-in to payroll, HotelMS covers the daily work of running
              a hotel.
            </p>
          </div>
          <FeatureGrid limit={6} />
          <div className="text-center mt-8">
            <Link
              to="/features"
              className="text-sm font-semibold text-blue-600 hover:underline"
            >
              See all features →
            </Link>
          </div>
        </div>
      </section>

      {/* Pricing teaser */}
      <section className="bg-slate-50 py-16 px-5 sm:px-8">
        <div className="max-w-5xl mx-auto">
          <div className="text-center max-w-xl mx-auto mb-10">
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900">
              Simple, transparent pricing
            </h2>
            <p className="text-slate-500 mt-2 text-sm">
              No hidden fees. No per-booking charges.
            </p>
          </div>
          <PricingTable />
          <div className="text-center mt-8">
            <Link
              to="/pricing"
              className="text-sm font-semibold text-blue-600 hover:underline"
            >
              Full pricing details →
            </Link>
          </div>
        </div>
      </section>

      <DataProtectionSection />

      {/* Final CTA */}
      <section className="py-16 px-5 sm:px-8 text-center">
        <h2 className="text-2xl sm:text-3xl font-black text-slate-900">
          Ready to run your hotel smarter?
        </h2>
        <p className="text-slate-500 mt-2 text-sm">
          Set up your hotel's booking page in minutes.
        </p>
        <Link
          to="/register"
          className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 py-3.5 rounded-xl mt-6 transition-colors"
        >
          Create your hotel account <ArrowRight className="w-4 h-4" />
        </Link>
      </section>
    </div>
  );
}
