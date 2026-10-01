
import { Link } from "react-router-dom";
import { BedDouble, ArrowRight } from "lucide-react";

export default function RoomsShowcasePage() {
  return (
    <section className="py-16 px-5 sm:px-8">
      <div className="max-w-4xl mx-auto text-center">
        <BedDouble className="w-10 h-10 text-blue-600 mx-auto mb-4" />
        <h1 className="text-3xl sm:text-4xl font-black text-slate-900">
          Every room, always up to date
        </h1>
        <p className="text-slate-500 mt-3 max-w-xl mx-auto text-sm">
          Guests browse your live room availability and book directly — each
          hotel gets its own branded public booking page, like the one below.
        </p>
        <Link
          to="/demo"
          className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 py-3.5 rounded-xl mt-8 transition-colors"
        >
          See a live example <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </section>
  );
}
