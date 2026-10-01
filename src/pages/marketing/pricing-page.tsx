import { PricingTable } from "./components/pricing-table";

export default function PricingPage() {
  return (
    <section className="py-16 px-5 sm:px-8">
      <div className="max-w-5xl mx-auto">
        <div className="text-center max-w-xl mx-auto mb-10">
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900">
            Pricing built for independent hotels
          </h1>
          <p className="text-slate-500 mt-3 text-sm">
            Choose the plan that matches the size of your property. No
            per-booking transaction fees from us — only the payment provider's
            standard processing fee applies.
          </p>
        </div>
        <PricingTable />

        <div className="max-w-2xl mx-auto mt-16 space-y-4">
          <h2 className="font-bold text-slate-900 text-lg">Frequently asked</h2>
          {[
            {
              q: "Are there setup fees?",
              a: "No. Create your account, onboard your hotel, and you're live the same day.",
            },
            {
              q: "Can I change plans later?",
              a: "Yes — upgrade or downgrade anytime from your hotel settings.",
            },
            {
              q: "How are online payments handled?",
              a: "Guest payments go through Paystack directly to your hotel's account. HotelMS does not hold your funds.",
            },
          ].map(({ q, a }) => (
            <div key={q} className="border border-slate-200 rounded-xl p-4">
              <p className="font-semibold text-slate-800 text-sm">{q}</p>
              <p className="text-slate-500 text-sm mt-1">{a}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
