/* ============================================================
   Types & Interfaces
   ============================================================ */

export type GoalType =
  | "maximize_profit"
  | "grow_safely"
  | "cheapest_swap"
  | "auto_portfolio";

export interface Goal {
  id: GoalType;
  title: string;
  description: string;
  icon: string;
  accentColor: string;
  apy: string;
  risk: string;
  confidence: string;
}

export interface Token {
  symbol: string;
  name: string;
  logoColor: string;
  balance: number;
  usdPrice: number;
}

export interface Strategy {
  id: string;
  name: string;
  description: string;
  risk: "Low" | "Moderate" | "High" | "Aggressive";
  fees: string;
  estimatedApr: number;
  tag?: string;
}

export interface ExecutionStep {
  icon: string;
  title: string;
  description: string;
  accentColor: string;
}

export interface ActivityItem {
  id: string;
  title: string;
  description: string;
  icon: string;
  accentColor: string;
  value?: string;
  valueColor?: string;
  status?: string;
  timestamp: string;
}

export interface PortfolioBalance {
  total: number;
  staked: number;
  available: number;
  yield24h: number;
  changePercent: number;
}

export interface AssetHolding {
  symbol: string;
  amount: number;
  logoColor: string;
}

export type NavItem = {
  label: string;
  href: string;
  icon: string;
};

