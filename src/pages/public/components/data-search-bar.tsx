// src/pages/public/components/DateSearchBar.tsx
import { useState } from "react";
import { Calendar, ChevronRight, Loader2 } from "lucide-react";
import { todayStr, nightsBetween } from "../../../lib/utils";

interface Props {
  checkIn: string;
  checkOut: string;
  onSearch: (ci: string, co: string) => void;
  loading: boolean;
}

export function DateSearchBar({ checkIn, checkOut, onSearch, loading }: Props) {
  const [ci, setCi] = useState(checkIn);
  const [co, setCo] = useState(checkOut);
  const nights = nightsBetween(ci, co);

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-5">
      <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">
        Find Available Rooms
      </p>
      <div className="flex flex-col sm:flex-row gap-3">
        {(["checkIn", "checkOut"] as const).map((field) => (
          <div key={field} className="flex-1 space-y-1.5">
            <label className="text-xs font-semibold text-slate-600 flex items-center gap-1.5">
              <Calendar className="w-3 h-3" />{" "}
              {field === "checkIn" ? "Check-in" : "Check-out"}
            </label>
            <input
              type="date"
              min={field === "checkIn" ? todayStr() : ci || todayStr()}
              value={field === "checkIn" ? ci : co}
              onChange={(e) =>
                field === "checkIn"
                  ? setCi(e.target.value)
                  : setCo(e.target.value)
              }
              className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        ))}
        <div className="flex items-end">
          <button
            onClick={() => ci && co && onSearch(ci, co)}
            disabled={!ci || !co || loading}
            className="w-full sm:w-auto px-6 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold rounded-xl text-sm transition-colors flex items-center gap-2 justify-center"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <ChevronRight className="w-4 h-4" />
            )}
            {nights > 0 ? `Search · ${nights}n` : "Search"}
          </button>
        </div>
      </div>
    </div>
  );
}
