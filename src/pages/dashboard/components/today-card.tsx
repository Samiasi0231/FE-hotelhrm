// src/pages/dashboard/components/TodayCard.tsx
import { Link } from "react-router-dom";

interface Props {
  label: string;
  count: number;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  linkTo: string;
}

export function TodayCard({ label, count, icon: Icon, color, linkTo }: Props) {
  return (
    <Link to={linkTo} className="block">
      <div
        className={`rounded-2xl p-4 border-2 ${color} hover:shadow-md transition-all`}
      >
        <Icon className="w-5 h-5 mb-2 opacity-70" />
        <p className="text-2xl font-black">{count}</p>
        <p className="text-xs font-semibold mt-0.5 opacity-80">{label}</p>
      </div>
    </Link>
  );
}
