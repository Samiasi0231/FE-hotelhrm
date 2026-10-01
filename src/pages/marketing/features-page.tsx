
import { FeatureGrid } from "./components/feature-grid";

export default function FeaturesPage() {
  return (
    <section className="py-16 px-5 sm:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="text-center max-w-xl mx-auto mb-10">
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900">
            Everything HotelMS does
          </h1>
          <p className="text-slate-500 mt-3 text-sm">
            One platform for the full daily operation of an independent hotel.
          </p>
        </div>
        <FeatureGrid />
      </div>
    </section>
  );
}
