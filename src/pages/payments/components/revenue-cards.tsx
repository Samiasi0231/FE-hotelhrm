import { TrendingUp, DollarSign, CreditCard } from "lucide-react";
import { Card, CardContent } from "@/components/ui/common";
import { formatCurrency } from "@/lib/utils";

export function RevenueCards({ revenue }: { revenue: any }) {
  const items = [
    {
      label: "Monthly Revenue",
      value: revenue.monthlyRevenue,
      icon: TrendingUp,
      color: "bg-green-600",
    },
    {
      label: "Yearly Revenue",
      value: revenue.yearlyRevenue,
      icon: DollarSign,
      color: "bg-blue-600",
    },
    {
      label: "Total Revenue",
      value: revenue.totalRevenue,
      icon: CreditCard,
      color: "bg-purple-600",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {items.map(({ label, value, icon: Icon, color }) => (
        <Card key={label}>
          <CardContent className="p-4 flex items-center gap-3">
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`}
            >
              <Icon className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">{label}</p>
              <p className="text-xl font-bold">{formatCurrency(value)}</p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
