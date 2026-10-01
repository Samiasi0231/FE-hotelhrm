// src/pages/bookings/detail/ActorCard.tsx
// Displays full staff account details for any audit-trail actor.

interface Props {
  user?: { firstName: string; lastName: string; email: string; role: string };
  staffRecord?: { employeeId?: string; position?: string; department?: string };
  label: string;
}

export function ActorCard({ user, staffRecord, label }: Props) {
  if (!user) return null;

  return (
    <div className="mt-1.5 bg-white border border-slate-100 rounded-xl px-3 py-2.5 text-xs space-y-0.5">
      <p className="text-slate-400 font-semibold uppercase tracking-wide text-[10px]">
        {label}
      </p>
      <p className="font-bold text-slate-800">
        {user.firstName} {user.lastName}
      </p>
      <div className="flex flex-wrap gap-2 mt-1">
        <span className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full font-semibold">
          {user.role}
        </span>
        {staffRecord?.position && (
          <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">
            {staffRecord.position}
          </span>
        )}
        {staffRecord?.department && (
          <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">
            {staffRecord.department}
          </span>
        )}
        {staffRecord?.employeeId && (
          <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-mono">
            #{staffRecord.employeeId}
          </span>
        )}
      </div>
      <p className="text-slate-400 mt-0.5">{user.email}</p>
    </div>
  );
}
