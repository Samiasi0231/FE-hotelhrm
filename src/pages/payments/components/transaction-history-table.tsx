import { Card, CardHeader, CardTitle } from "@/components/ui/common";
import { TransactionRow } from "./transaction-row";

const TABLE_HEADERS = [
  "Reference",
  "Guest",
  "Method",
  "Amount",
  "Status",
  "Recorded By",
  "Approved By",
  "Date",
];
const TABS = ["all", "online", "manual"] as const;
export type TransactionTab = (typeof TABS)[number];

const TAB_LABEL: Record<TransactionTab, string> = {
  all: "All",
  online: "🌐 Online",
  manual: "🏦 Manual",
};

interface Props {
  tab: TransactionTab;
  onTabChange: (tab: TransactionTab) => void;
  payments: any[];
  isLoading: boolean;
}

export function TransactionHistoryTable({
  tab,
  onTabChange,
  payments,
  isLoading,
}: Props) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between flex-wrap gap-3">
          <CardTitle className="text-base">Transaction History</CardTitle>
          <div className="flex border border-slate-200 rounded-lg overflow-hidden text-xs">
            {TABS.map((t) => (
              <button
                key={t}
                onClick={() => onTabChange(t)}
                className={`px-3 py-2 font-semibold capitalize transition-colors ${tab === t ? "bg-slate-900 text-white" : "text-slate-500 hover:bg-slate-50"}`}
              >
                {TAB_LABEL[t]}
              </button>
            ))}
          </div>
        </div>
      </CardHeader>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-slate-50">
              {TABLE_HEADERS.map((h) => (
                <th
                  key={h}
                  className="text-left px-4 py-3 font-semibold text-slate-600 whitespace-nowrap"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y">
            {isLoading ? (
              [...Array(5)].map((_, i) => (
                <tr key={i}>
                  <td colSpan={8}>
                    <div className="h-4 m-4 bg-slate-100 rounded animate-pulse" />
                  </td>
                </tr>
              ))
            ) : payments.length === 0 ? (
              <tr>
                <td
                  colSpan={8}
                  className="px-4 py-12 text-center text-muted-foreground"
                >
                  No payments found
                </td>
              </tr>
            ) : (
              payments.map((p: any) => <TransactionRow key={p.id} p={p} />)
            )}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
