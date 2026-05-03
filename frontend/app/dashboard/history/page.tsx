"use client";

import { useState, useEffect, useRef } from "react";
import { 
  IconTrackChanges, 
  IconPayments, 
  IconAutorenew,
  IconChevronLeft,
  IconChevronRight,
  IconCalendarMonth,
  IconClose
} from "@/app/components/icons";
import Link from "next/link";
import AmbientBackground from "@/app/components/ambient-background";
import ScrollReveal from "@/app/components/ScrollReveal";
import { getTransactions, type Transaction } from "@/app/lib/storage";

export default function HistoryPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [filter, setFilter] = useState("All");
  const [isLoaded, setIsLoaded] = useState(false);
  const [entriesPerPage, setEntriesPerPage] = useState(5);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const dateInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setTransactions(getTransactions());
    setIsLoaded(true);
  }, []);

  // Combined filtering (Tab + Date)
  const filtered = transactions.filter((tx) => {
    const matchesTab = filter === "All" || 
      (filter === "Deposits" && tx.type === "Deploy") || 
      (filter === "Withdrawals" && tx.type === "Withdraw") ||
      (filter === "Rebalancing" && tx.type === "Rebalance");
    
    const matchesDate = !selectedDate || 
      new Date(tx.timestamp).toISOString().split('T')[0] === selectedDate;

    return matchesTab && matchesDate;
  });

  // Pagination logic
  const totalPages = Math.ceil(filtered.length / entriesPerPage) || 1;
  const currentEntries = filtered.slice((currentPage - 1) * entriesPerPage, currentPage * entriesPerPage);

  const formatDate = (dateStr: string | number | null) => {
    if (!dateStr) return "dd/mm/tttt";
    const d = new Date(dateStr);
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  };

  return (
    <main className="pt-4 pb-20 md:pb-6 px-4 md:px-8 flex-1 flex flex-col relative overflow-hidden">
      <AmbientBackground
        fixed={false}
        blobs={[
          { color: "secondary", position: "top-right", size: "lg" },
          { color: "tertiary", position: "bottom-left", size: "md" },
        ]}
      />
      <div className="max-w-[1200px] mx-auto w-full flex-1 flex flex-col">
        <header className="mb-6">
          <ScrollReveal animationClass="spawn-rise" delay={100}>
            <span className="text-primary tracking-[0.2em] font-bold uppercase mb-2 block text-xs">
              Transaction Logs
            </span>
            <h1 className="text-3xl md:text-4xl font-headline font-extrabold text-white tracking-tight">
              History
            </h1>
          </ScrollReveal>
        </header>

        {!isLoaded ? (
          <div className="flex-1 flex flex-col items-center justify-center py-12 opacity-0 animate-in fade-in duration-500 delay-200 fill-mode-forwards">
            <div className="w-10 h-10 rounded-full border-4 border-surface-container-highest border-t-primary animate-spin" />
          </div>
        ) : (
          <>
            {/* Top Controls: Two Rows */}
            <ScrollReveal animationClass="spawn-rise" delay={200}>
              <div className="mb-6 space-y-4">
                {/* Row 1: Filter Tabs */}
                <div className="flex bg-surface-container-low rounded-2xl overflow-x-auto border border-outline-variant/5 self-start w-fit">
                  {["All", "Deposits", "Withdrawals", "Rebalancing"].map((f) => (
                    <button
                      key={f}
                      onClick={() => {
                        setFilter(f);
                        setCurrentPage(1);
                      }}
                      className={`px-3 md:px-4 py-1.5 text-xs md:text-sm font-bold transition-all whitespace-nowrap ${filter === f ? "bg-surface-bright text-white" : "text-on-surface-variant hover:text-white"}`}
                    >
                      {f}
                    </button>
                  ))}
                </div>


                {/* Row 2: Showing (Left) and Date (Right) */}
                <div className="flex flex-row items-center justify-between gap-2 overflow-x-auto pb-1">
                  {/* Showing dropdown */}
                  <div className="flex items-center gap-2">
                    <span className="text-[13px] text-on-surface-variant capitalize font-medium">Show</span>
                    <select 
                      value={entriesPerPage}
                      onChange={(e) => {
                        setEntriesPerPage(Number(e.target.value));
                        setCurrentPage(1);
                      }}
                      className="bg-surface-container-low border border-outline-variant/10 rounded-xl px-2 md:px-3 py-1.5 text-xs md:text-sm font-bold text-white focus:outline-none focus:border-primary transition-colors cursor-pointer"
                    >
                      {[5, 10, 25, 50].map(n => (
                        <option key={n} value={n}>{n}</option>
                      ))}
                    </select>
                    <span className="text-[13px] text-on-surface-variant capitalize font-medium hidden sm:inline">Per Page</span>
                  </div>

                  {/* Date Selection */}
                  <div className="flex items-center gap-2">
                    <span className="text-[13px] text-on-surface-variant capitalize font-medium">Date</span>
                    <div className="flex items-center gap-2">
                      <div 
                        className="flex items-center gap-2 bg-surface-container-low border border-outline-variant/10 rounded-xl px-4 py-1.5 text-sm font-bold text-white transition-all hover:border-primary/50 hover:bg-surface-container cursor-pointer relative"
                        onClick={() => dateInputRef.current?.showPicker()}
                      >
                        <IconCalendarMonth size={16} className="text-primary" />
                        <span>{formatDate(selectedDate)}</span>
                        <input 
                          ref={dateInputRef}
                          type="date"
                          value={selectedDate || ""}
                          onChange={(e) => setSelectedDate(e.target.value || null)}
                          className="absolute inset-0 opacity-0 w-full pointer-events-none"
                        />
                      </div>
                      
                      {selectedDate && (
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedDate(null);
                          }}
                          className="w-8 h-8 flex items-center justify-center rounded-xl bg-surface-container-highest/30 text-on-surface-variant hover:text-error hover:bg-error/10 transition-all"
                        >
                          <IconClose size={16} />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </ScrollReveal>

            {/* Table or Minimal Empty State */}
            <ScrollReveal animationClass="spawn-rise" delay={300}>
              <div className="bg-surface-container-low rounded-3xl overflow-hidden border border-outline-variant/5">
                {filtered.length > 0 ? (
                  <>
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="bg-surface-container-highest/10 border-b border-outline-variant/5">
                            <th className="px-4 md:px-6 py-4 capitalize text-sm text-on-surface-variant font-medium">Transaction</th>
                            <th className="px-4 md:px-6 py-4 capitalize text-sm text-on-surface-variant font-medium">Amount</th>
                            <th className="px-4 md:px-6 py-4 capitalize text-sm text-on-surface-variant font-medium hidden sm:table-cell">Date</th>
                            <th className="px-4 md:px-6 py-4 capitalize text-sm text-on-surface-variant font-medium text-right">Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-outline-variant/5">
                          {currentEntries.map((tx) => (
                            <tr key={tx.id} className="hover:bg-white/[0.01] transition-colors group">
                              <td className="px-6 py-5">
                                <div className="flex items-center gap-4">
                                  <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-transform group-hover:scale-105 ${tx.type === "Deploy" ? "bg-primary/10 text-primary" : tx.type === "Withdraw" ? "bg-tertiary/10 text-tertiary" : "bg-secondary/10 text-secondary"}`}>
                                    {tx.type === "Deploy" ? <IconPayments size={18} /> : tx.type === "Withdraw" ? <IconAutorenew size={18} /> : <IconTrackChanges size={18} />}
                                  </div>
                                  <div>
                                    <div className="font-bold text-sm text-white">
                                      {tx.type === "Deploy" ? "Deposit" : tx.type === "Withdraw" ? "Withdrawal" : "Rebalance"}
                                    </div>
                                    <div className="text-xs text-on-surface-variant capitalize">{tx.strategyName}</div>
                                    <div className="text-[10px] text-on-surface-variant/60 mt-1 sm:hidden">
                                      {formatDate(tx.timestamp)}
                                    </div>
                                  </div>
                                </div>
                              </td>
                              <td className="px-4 md:px-6 py-5 font-mono text-sm font-bold text-white">
                                {tx.type === "Deploy" ? "+" : "-"}{tx.amount.toFixed(4)} {tx.token}
                              </td>
                              <td className="px-4 md:px-6 py-5 text-sm text-on-surface-variant hidden sm:table-cell">
                                {formatDate(tx.timestamp)}
                              </td>
                              <td className="px-6 py-5 text-right">
                                <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold tracking-widest uppercase ${tx.status === "Success" ? "bg-tertiary/10 text-tertiary" : "bg-error/10 text-error"}`}>
                                  {tx.status}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {/* Footer Controls */}
                    <div className="px-6 py-5 flex items-center justify-end border-t border-outline-variant/5">
                      <div className="flex items-center gap-2">
                        <button 
                          onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                          disabled={currentPage === 1}
                          className="w-8 h-8 flex items-center justify-center rounded-full border border-outline-variant/10 text-on-surface-variant hover:text-white hover:bg-surface-container transition-all disabled:opacity-20 disabled:cursor-not-allowed"
                        >
                          <IconChevronLeft size={16} />
                        </button>
                        
                        <div className="flex items-center gap-1 px-2">
                          {[...Array(totalPages)].map((_, i) => (
                            <button
                              key={i + 1}
                              onClick={() => setCurrentPage(i + 1)}
                              className={`w-8 h-8 rounded-full text-xs font-bold transition-all ${currentPage === i + 1 ? "bg-primary text-on-primary shadow-lg shadow-primary/20" : "text-on-surface-variant hover:text-white hover:bg-surface-container"}`}
                            >
                              {i + 1}
                            </button>
                          ))}
                        </div>

                        <button 
                          onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                          disabled={currentPage === totalPages}
                          className="w-8 h-8 flex items-center justify-center rounded-full border border-outline-variant/10 text-on-surface-variant hover:text-white hover:bg-surface-container transition-all disabled:opacity-20 disabled:cursor-not-allowed"
                        >
                          <IconChevronRight size={16} />
                        </button>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="py-20 flex items-center justify-center text-center">
                    <p className="text-on-surface-variant text-sm">No transaction found</p>
                  </div>
                )}
              </div>
            </ScrollReveal>
          </>
        )}
      </div>
    </main>
  );
}
