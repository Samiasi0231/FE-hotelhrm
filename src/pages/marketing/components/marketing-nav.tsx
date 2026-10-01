import { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { Hotel, Menu, X } from "lucide-react";

const NAV_LINKS = [
  { label: "Home", to: "/" },
  { label: "Features", to: "/features" },
  { label: "Pricing", to: "/pricing" },
  { label: "Rooms", to: "/explore-rooms" },
  { label: "About", to: "/about" },
  { label: "Contact", to: "/contact" },
];

export function MarketingNav() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-100">
      <div className="max-w-6xl mx-auto px-5 sm:px-8 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <Hotel className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-slate-900">HotelMS</span>
        </Link>

        <nav className="hidden md:flex items-center gap-8">
          {NAV_LINKS.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              className={({ isActive }) =>
                `text-sm font-medium transition-colors ${isActive ? "text-blue-600" : "text-slate-600 hover:text-slate-900"}`
              }
            >
              {l.label}
            </NavLink>
          ))}
        </nav>

        <div className="hidden md:flex items-center gap-3">
          <Link to="/login" className="text-sm font-medium text-slate-600 hover:text-slate-900">
            Sign in
          </Link>
          <Link
            to="/register"
            className="text-sm font-semibold bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            Get started
          </Link>
        </div>

        <button onClick={() => setOpen((v) => !v)} className="md:hidden p-2 text-slate-600">
          {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {open && (
        <div className="md:hidden border-t border-slate-100 px-5 py-4 space-y-3">
          {NAV_LINKS.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              onClick={() => setOpen(false)}
              className="block text-sm font-medium text-slate-700"
            >
              {l.label}
            </NavLink>
          ))}
          <div className="flex gap-3 pt-2 border-t border-slate-100">
            <Link to="/login" onClick={() => setOpen(false)} className="flex-1 text-center text-sm font-medium py-2 border border-slate-200 rounded-lg">
              Sign in
            </Link>
            <Link to="/register" onClick={() => setOpen(false)} className="flex-1 text-center text-sm font-semibold bg-blue-600 text-white py-2 rounded-lg">
              Get started
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}