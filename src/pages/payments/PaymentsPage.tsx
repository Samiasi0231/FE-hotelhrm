// src/pages/payments/PaymentsPage.tsx — FULL REPLACEMENT
// Split into ./components — this file wires data and renders sections.

import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { paymentApi } from "@/api/services";
import { useAuth } from "@/contexts/AuthContext";
import { CheckCircle2, Clock } from "lucide-react";

import { RevenueCards } from "./components/revenue-cards";
import { ApprovalRow } from "./components/approval-row";
import {
  TransactionHistoryTable,
  type TransactionTab,
} from "./components/transaction-history-table";

const REVENUE_ROLES = ["HOTEL_DIRECTOR", "ADMIN", "SUPER_ADMIN"];

export default function PaymentsPage() {
  const { user, hotelId } = useAuth();
  const qc = useQueryClient();

  const canSeeRevenue = REVENUE_ROLES.includes(user?.role ?? "");
  const [tab, setTab] = useState<TransactionTab>("all");

  const { data: revenue } = useQuery({
    queryKey: ["revenue", hotelId],
    queryFn: () =>
      paymentApi.getRevenue(hotelId!).then((r) => r.data?.data || r.data),
    enabled: !!hotelId && canSeeRevenue,
  });

  const { data: paymentsData, isLoading } = useQuery({
    queryKey: ["payments", hotelId, tab],
    queryFn: () =>
      paymentApi
        .getByHotel(hotelId!, { limit: 100 })
        .then((r) => r.data?.data || r.data),
    enabled: !!hotelId,
  });

  // ALL staff see pending approvals — no role gate
  const { data: pendingData } = useQuery({
    queryKey: ["pending-approvals", hotelId],
    queryFn: () =>
      paymentApi
        .getPendingApprovals(hotelId!)
        .then((r) => r.data?.data || r.data),
    enabled: !!hotelId,
    refetchInterval: 20_000,
  });

  function refresh() {
    qc.invalidateQueries({ queryKey: ["payments", hotelId] });
    qc.invalidateQueries({ queryKey: ["pending-approvals", hotelId] });
    qc.invalidateQueries({ queryKey: ["bookings"] });
    qc.invalidateQueries({ queryKey: ["rooms"] });
  }

  const allPayments = paymentsData?.data ?? paymentsData ?? [];
  const pending = pendingData ?? [];

  const filtered = allPayments.filter((p: any) => {
    if (tab === "manual") return p.isManual;
    if (tab === "online") return !p.isManual;
    return true;
  });

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold">Payments</h1>
        <p className="text-muted-foreground text-sm">
          Payment tracking, approvals and revenue
        </p>
      </div>

      {canSeeRevenue && revenue && <RevenueCards revenue={revenue} />}

      <div className="space-y-3">
        <h2 className="text-lg font-bold flex items-center gap-2">
          <Clock className="w-5 h-5 text-amber-500" />
          Pending Approvals
          {pending.length > 0 && (
            <span className="text-sm bg-amber-500 text-white px-2.5 py-0.5 rounded-full font-bold animate-pulse">
              {pending.length}
            </span>
          )}
        </h2>

        {pending.length === 0 ? (
          <div className="border-2 border-dashed border-slate-200 rounded-2xl p-8 text-center">
            <CheckCircle2 className="w-8 h-8 text-green-300 mx-auto mb-2" />
            <p className="text-slate-500 font-medium text-sm">
              All payments are settled — nothing pending
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {pending.map((p: any) => (
              <ApprovalRow
                key={p.id}
                p={p}
                currentUser={user}
                onDone={refresh}
              />
            ))}
          </div>
        )}
      </div>

      <TransactionHistoryTable
        tab={tab}
        onTabChange={setTab}
        payments={filtered}
        isLoading={isLoading}
      />
    </div>
  );
}
