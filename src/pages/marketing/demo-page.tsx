
import { Link } from "react-router-dom";
import { PlayCircle, ArrowRight } from "lucide-react";

const DEMO_HOTEL_SLUG = "demo-hotel";
export default function DemoPage() {
  return (
    <section className="py-20 px-5 sm:px-8 text-center">
      <div className="max-w-xl mx-auto">
        <PlayCircle className="w-12 h-12 text-blue-600 mx-auto mb-5" />
        <h1 className="text-3xl font-black text-slate-900">
          See HotelMS in action
        </h1>
        <p className="text-slate-500 mt-3 text-sm">
          Browse a live example of a hotel's public booking page, built on
          HotelMS.
        </p>
        <Link
          to={`/book/${DEMO_HOTEL_SLUG}`}
          className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 py-3.5 rounded-xl mt-8 transition-colors"
        >
          View live demo <ArrowRight className="w-4 h-4" />
        </Link>
        <p className="text-xs text-slate-400 mt-4">
          Want a guided walkthrough instead?{" "}
          <Link to="/contact" className="text-blue-600 hover:underline">
            Contact us
          </Link>{" "}
          to book a call.
        </p>
      </div>
    </section>
  );
}
