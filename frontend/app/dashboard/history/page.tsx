"use client";

import { useState, useEffect } from "react";
import { IconTrendingUp, IconArrowForward, IconArrowUpward, IconTrackChanges, IconPayments, IconAutorenew } from "@/app/components/icons";
import Link from "next/link";
import AmbientBackground from "@/app/components/ambient-background";
import { getTransactions, type Transaction } from "@/app/lib/storage";

export default function HistoryPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [filter, setFilter] = useState("All");

  useEffect(() => {
    setTransactions(getTransactions());
  }, []);

  const filtered = filter === "All"
    ? transactions
    : transactions.filter((tx) => tx.type === filter);

  return (
    <main className="pt-24 pb-12 px-8 flex-1 flex flex-col relative overflow-hidden">
      <AmbientBackground
        fixed={false}
        blobs={[
          { color: "secondary", position: "top-right", size: "lg" },
          { color: "tertiary", position: "bottom-left", size: "md" },
        ]}
      />
      <div className="max-w-[1200px] mx-auto w-full flex-1 flex flex-col animate-in fade-in zoom-in-95 duration-500">
        <header className="mb-8">
          <span className="text-primary tracking-[0.2em] font-bold uppercase mb-2 block text-xs">
            Transaction Logs
          </span>
          <h1 className="text-3xl md:text-4xl font-headline font-extrabold text-white tracking-tight">
            History
          </h1>
        </header>

        {transactions.length > 0 ? (
          <>
            <div className="mb-6 flex flex-col md:flex-row md:items-end justify-between gap-6">
              <p className="text-on-surface-variant text-sm">Full log of your automated portfolio activities.</p>
              <div className="flex gap-2">
                {["All", "Deploy", "Withdraw"].map((f) => (
                  <button
                    key={f}
                    onClick={() => setFilter(f)}
                    className={`px-4 py-2 rounded-full text-xs font-bold transition-colors ${filter === f ? "bg-surface-bright text-white" : "bg-surface-container text-on-surface-variant hover:text-white hover:bg-surface-variant"}`}
                  >
                    {f === "All" ? "All" : f === "Deploy" ? "Deposits" : "Withdrawals"}
                  </button>
                ))}
              </div>
            </div>

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
                    {filtered.map((tx) => (
                      <tr key={tx.id} className="hover:bg-surface-container-highest/30 transition-colors">
                        <td className="px-6 py-5">
                          <div className="flex items-center gap-4">
                            <div className={`w-10 h-10 rounded-full bg-surface-container flex items-center justify-center ${tx.type === "Deploy" ? "text-primary" : "text-tertiary"}`}>
                              {tx.type === "Deploy" ? <IconPayments size={18} /> : <IconAutorenew size={18} />}
                            </div>
                            <div>
                              <div className="font-bold text-sm text-white">{tx.type}</div>
                              <div className="text-xs text-on-surface-variant capitalize">{tx.strategyName}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-5">
                          <div className={`font-mono text-sm font-bold ${tx.type === "Deploy" ? "text-primary" : "text-tertiary"}`}>
                            {tx.type === "Deploy" ? "+" : "-"}{tx.amount} {tx.token}
                          </div>
                        </td>
                        <td className="px-6 py-5">
                          <div className="text-sm text-on-surface-variant">{new Date(tx.timestamp).toLocaleString()}</div>
                        </td>
                        <td className="px-6 py-5">
                          <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-bold ${tx.status === "Success" ? "bg-tertiary/10 text-tertiary" : "bg-error/10 text-error"}`}>
                            {tx.status}
                          </span>
                        </td>
                      </tr>
                    ))}
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
