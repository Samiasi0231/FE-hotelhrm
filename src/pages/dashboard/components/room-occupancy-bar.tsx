// src/pages/dashboard/components/RoomOccupancyBar.tsx

interface Props {
  available: number;
  occupied: number;
  maintenance: number;
  total: number;
}

export function RoomOccupancyBar({
  available,
  occupied,
  maintenance,
  total,
}: Props) {
  const availPct = total > 0 ? (available / total) * 100 : 0;
  const occupPct = total > 0 ? (occupied / total) * 100 : 0;
  const maintPct = total > 0 ? (maintenance / total) * 100 : 0;

  return (
    <div className="space-y-3">
      <div className="flex h-4 rounded-full overflow-hidden bg-slate-100">
        <div
          className="bg-green-500 transition-all"
          style={{ width: `${availPct}%` }}
          title={`Available: ${available}`}
        />
        <div
          className="bg-red-400 transition-all"
          style={{ width: `${occupPct}%` }}
          title={`Occupied: ${occupied}`}
        />
        <div
          className="bg-amber-400 transition-all"
          style={{ width: `${maintPct}%` }}
          title={`Maintenance: ${maintenance}`}
        />
      </div>
      <div className="flex items-center gap-4 text-xs">
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-green-500 inline-block" />{" "}
          {available} Available
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-red-400 inline-block" />{" "}
          {occupied} Occupied
        </span>
        {maintenance > 0 && (
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400 inline-block" />{" "}
            {maintenance} Maintenance
          </span>
        )}
      </div>
    </div>
  );
}
