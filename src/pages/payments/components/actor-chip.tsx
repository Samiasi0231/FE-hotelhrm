// src/pages/payments/components/ActorChip.tsx
// Compact staff-identity display — used in both the approval queue and the
// transaction history table.

interface Props {
  u?: { firstName: string; lastName: string; email: string; role: string };
  staffOf?: { employeeId?: string; position?: string; department?: string };
}

export function ActorChip({ u, staffOf }: Props) {
  if (!u) return <span className="text-slate-300 text-xs">—</span>;

  return (
    <div className="space-y-0.5">
      <p className="font-semibold text-slate-800 text-xs">
        {u.firstName} {u.lastName}
      </p>
      <div className="flex flex-wrap gap-1">
        <span className="bg-blue-50 text-blue-700 text-[10px] px-1.5 py-0.5 rounded-full font-semibold">
          {u.role}
        </span>
        {staffOf?.position && (
          <span className="bg-slate-100 text-slate-600 text-[10px] px-1.5 py-0.5 rounded-full">
            {staffOf.position}
          </span>
        )}
        {staffOf?.employeeId && (
          <span className="bg-slate-100 text-slate-600 text-[10px] px-1.5 py-0.5 rounded-full font-mono">
            #{staffOf.employeeId}
          </span>
        )}
      </div>
      <p className="text-slate-400 text-[10px]">{u.email}</p>
    </div>
  );
}
