// src/pages/dashboard/components/StatCard.tsx
import { TrendingUp, TrendingDown } from "lucide-react";
import { Card, CardContent } from "@/components/ui/common";

interface Props {
  title: string;
  value: string | number;
  sub?: string;
  trend?: number;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  alert?: boolean;
}

export function StatCard({
  title,
  value,
  sub,
  trend,
  icon: Icon,
  color,
  alert,
}: Props) {
  const isUp = (trend ?? 0) >= 0;
  return (
    <Card className={`overflow-hidden ${alert ? "ring-2 ring-amber-400" : ""}`}>
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div className="min-w-0 flex-1">
            <p className="text-sm text-muted-foreground font-medium">{title}</p>
            <p className="text-2xl font-bold mt-1 text-slate-900">{value}</p>
            {trend !== undefined && (
              <div
                className={`flex items-center gap-1 mt-1 text-xs font-medium ${isUp ? "text-green-600" : "text-red-500"}`}
              >
                {isUp ? (
                  <TrendingUp className="w-3 h-3" />
                ) : (
                  <TrendingDown className="w-3 h-3" />
                )}
                {Math.abs(trend)}% vs last month
              </div>
            )}
            {sub && <p className="text-xs text-muted-foreground mt-1">{sub}</p>}
          </div>
          <div className={`p-2.5 rounded-xl flex-shrink-0 ml-3 ${color}`}>
            <Icon className="w-5 h-5 text-white" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
