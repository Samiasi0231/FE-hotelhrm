
import { DataProtectionSection } from "./components/data-protection-section";

export default function AboutPage() {
  return (
    <div>
      <section className="py-16 px-5 sm:px-8">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900">
            About HotelMS
          </h1>
          <p className="text-slate-600 mt-5 leading-relaxed">
            HotelMS was built for independent hotels and small hotel groups
            across Nigeria and West Africa who were managing bookings on paper,
            staff on WhatsApp, and payments in multiple places. We bring rooms,
            bookings, staff, attendance, and payments into one platform —
            without the complexity built for large international chains.
          </p>
        </div>
      </section>
      <DataProtectionSection />
      <section id="terms" className="py-16 px-5 sm:px-8">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-xl font-bold text-slate-900">Terms of Service</h2>
          <p className="text-slate-500 text-sm mt-3">
            Full terms of service — add your actual legal terms here once
            drafted.
          </p>
        </div>
      </section>
    </div>
  );
}
