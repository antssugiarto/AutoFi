"use client";

import React, { createContext, useContext, useState, ReactNode, useCallback, useMemo, useEffect } from "react";
import type { BacktestResult, StrategyResult } from "./types";

export type Status = "idle" | "executing" | "success" | "failed";

export interface GlobalState {
  walletAddress: string | null;
  goal: string | null;
  amount: number | null;
  strategy: any | null;
  status: Status;
  backtestResult: BacktestResult | null;
  strategyResult: StrategyResult | null;
}

interface GlobalContextProps {
  state: GlobalState;
  setWalletAddress: (address: string | null) => void;
  setGoal: (goal: string | null) => void;
  setAmount: (amount: number | null) => void;
  setStrategy: (strategy: any | null) => void;
  setStatus: (status: Status) => void;
  setBacktestResult: (result: BacktestResult | null) => void;
  setStrategyResult: (result: StrategyResult | null) => void;
  resetState: () => void;
}

const STORAGE_KEY = "autofi_wizard_state";

const initialState: GlobalState = {
  walletAddress: null,
  goal: null,
  amount: null,
  strategy: null,
  status: "idle",
  backtestResult: null,
  strategyResult: null,
};

const GlobalContext = createContext<GlobalContextProps | undefined>(undefined);

export function GlobalStateProvider({ children }: { children: ReactNode }) {
  // Initialize state from sessionStorage if available
  const [state, setState] = useState<GlobalState>(() => {
    if (typeof window !== "undefined") {
      const saved = sessionStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : initialState;
    }
    return initialState;
  });

  // Sync state to sessionStorage whenever it changes
  useEffect(() => {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  const setWalletAddress = useCallback((address: string | null) => setState((prev) => ({ ...prev, walletAddress: address })), []);
  const setGoal = useCallback((goal: string | null) => setState((prev) => ({ ...prev, goal })), []);
  const setAmount = useCallback((amount: number | null) => setState((prev) => ({ ...prev, amount })), []);
  const setStrategy = useCallback((strategy: any | null) => setState((prev) => ({ ...prev, strategy })), []);
  const setStatus = useCallback((status: Status) => setState((prev) => ({ ...prev, status })), []);
  const setBacktestResult = useCallback((result: BacktestResult | null) => setState((prev) => ({ ...prev, backtestResult: result })), []);
  const setStrategyResult = useCallback((result: StrategyResult | null) => setState((prev) => ({ ...prev, strategyResult: result })), []);
  
  const resetState = useCallback(() => {
    setState(initialState);
    sessionStorage.removeItem(STORAGE_KEY);
  }, []);

  const value = useMemo(() => ({
    state,
    setWalletAddress,
    setGoal,
    setAmount,
    setStrategy,
    setStatus,
    setBacktestResult,
    setStrategyResult,
    resetState
  }), [state, setWalletAddress, setGoal, setAmount, setStrategy, setStatus, setBacktestResult, setStrategyResult, resetState]);

  return (
    <GlobalContext.Provider value={value}>
      {children}
    </GlobalContext.Provider>
  );
}

export function useGlobalState() {
  const context = useContext(GlobalContext);
  if (context === undefined) {
    throw new Error("useGlobalState must be used within a GlobalStateProvider");
  }
  return context;
}

