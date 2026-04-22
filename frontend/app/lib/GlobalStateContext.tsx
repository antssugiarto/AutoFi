"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";
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
  const [state, setState] = useState<GlobalState>(initialState);

  const setWalletAddress = (address: string | null) => setState((prev) => ({ ...prev, walletAddress: address }));
  const setGoal = (goal: string | null) => setState((prev) => ({ ...prev, goal }));
  const setAmount = (amount: number | null) => setState((prev) => ({ ...prev, amount }));
  const setStrategy = (strategy: any | null) => setState((prev) => ({ ...prev, strategy }));
  const setStatus = (status: Status) => setState((prev) => ({ ...prev, status }));
  const setBacktestResult = (result: BacktestResult | null) => setState((prev) => ({ ...prev, backtestResult: result }));
  const setStrategyResult = (result: StrategyResult | null) => setState((prev) => ({ ...prev, strategyResult: result }));
  const resetState = () => setState(initialState);

  return (
    <GlobalContext.Provider
      value={{
        state,
        setWalletAddress,
        setGoal,
        setAmount,
        setStrategy,
        setStatus,
        setBacktestResult,
        setStrategyResult,
        resetState,
      }}
    >
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

