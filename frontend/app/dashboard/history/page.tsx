"use client";

import { IconTrendingUp, IconArrowForward, IconSwapHoriz, IconArrowUpward, IconTrackChanges } from "@/app/components/icons";
import Link from "next/link";
import { useGlobalState } from "@/app/lib/GlobalStateContext";

const HISTORY_DATA = [
  { id: "tx-1", type: "Harvest", asset: "USDC", amount: "+$45.20", date: "Today, 14:32", status: "Success", icon: IconTrendingUp, color: "text-tertiary" },
  { id: "tx-2", type: "Deposit", asset: "USDC", amount: "+$10,000.00", date: "Yesterday, 09:15", status: "Success", icon: IconArrowForward, color: "text-primary" },
  { id: "tx-3", type: "Rebalance", asset: "Multiple", amount: "~", date: "Apr 14, 2026", status: "Success", icon: IconSwapHoriz, color: "text-secondary" },
  { id: "tx-4", type: "Withdraw", asset: "SOL", amount: "-$500.00", date: "Apr 10, 2026", status: "Success", icon: IconArrowUpward, color: "text-on-surface" },
  { id: "tx-5", type: "Deposit", asset: "USDC", amount: "+$5,000.00", date: "Mar 28, 2026", status: "Success", icon: IconArrowForward, color: "text-primary" },
  { id: "tx-6", type: "Failed Route", asset: "USDC", amount: "-$0.00", date: "Mar 25, 2026", status: "Failed", icon: IconSwapHoriz, color: "text-error" },
];

export default function HistoryPage() {
  const { state } = useGlobalState();
  const hasStrategy = state.status === "success" || state.goal !== null;

  return (
    <main className="pt-24 pb-12 px-8 flex-1 flex flex-col relative overflow-hidden">
      <div className="max-w-3xl mx-auto w-full flex-1 flex flex-col animate-in fade-in zoom-in-95 duration-500">
        {hasStrategy ? (
          <>
            <header className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="font-headline text-3xl font-extrabold text-white mb-2">Transaction History</h1>
          <p className="text-on-surface-variant text-sm">Full log of your automated portfolio activities.</p>
        </div>
        <div className="flex gap-2">
          {["All", "Deposits", "Yields", "Withdrawals"].map((filter, i) => (
            <button 
              key={filter} 
              className={`px-4 py-2 rounded-full text-xs font-bold transition-colors ${i === 0 ? "bg-surface-bright text-white" : "bg-surface-container text-on-surface-variant hover:text-white hover:bg-surface-variant"}`}
            >
              {filter}
            </button>
          ))}
        </div>
      </header>

      <div className="bg-surface-container-low rounded-3xl border border-outline-variant/10 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-outline-variant/10 bg-surface-container-highest/30">
                <th className="px-6 py-4 text-xs font-bold text-on-surface-variant uppercase tracking-wider">Transaction</th>
                <th className="px-6 py-4 text-xs font-bold text-on-surface-variant uppercase tracking-wider">Amount</th>
                <th className="px-6 py-4 text-xs font-bold text-on-surface-variant uppercase tracking-wider">Date</th>
                <th className="px-6 py-4 text-xs font-bold text-on-surface-variant uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/10">
              {HISTORY_DATA.map((tx) => {
                const Icon = tx.icon;
                return (
                  <tr key={tx.id} className="hover:bg-surface-container-highest/30 transition-colors group">
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-full bg-surface-container flex items-center justify-center ${tx.color}`}>
                          <Icon size={18} />
                        </div>
                        <div>
                          <div className="font-bold text-sm text-white">{tx.type}</div>
                          <div className="text-xs text-on-surface-variant">{tx.asset}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className={`font-mono text-sm font-bold ${tx.amount.startsWith("+") ? "text-tertiary" : tx.amount.startsWith("-") && tx.status === "Success" ? "text-white" : "text-on-surface-variant"}`}>
                        {tx.amount}
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="text-sm text-on-surface-variant">{tx.date}</div>
                    </td>
                    <td className="px-6 py-5">
                      <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-bold ${tx.status === "Success" ? "bg-tertiary/10 text-tertiary" : "bg-error/10 text-error"}`}>
                        {tx.status}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center py-12 text-center h-[60vh]">
            <div className="w-20 h-20 mb-5 rounded-full bg-surface-container-highest flex items-center justify-center text-primary">
              <IconTrackChanges size={40} />
            </div>
            <h2 className="text-2xl font-headline font-bold text-white mb-3">No Transaction History</h2>
            <p className="text-sm text-on-surface-variant max-w-md mb-6">
              You don&apos;t have any recorded transactions yet. Once your strategy starts executing, your history will appear here.
            </p>
            <Link
              href="/strategy"
              className="px-6 py-3 bg-gradient-to-r from-primary to-primary-dim text-white text-sm font-bold rounded-full shadow-[0_0_24px_rgba(163,166,255,0.3)] hover:shadow-[0_0_32px_rgba(163,166,255,0.5)] transition-all"
            >
              Explore Strategies
            </Link>
          </div>
        )}
      </div>
    </main>
  );
}

