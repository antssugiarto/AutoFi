/* ============================================================
   Mock Data & Constants
   ============================================================ */

import type {
  Goal,
  Token,
  Strategy,
  ExecutionStep,
  ActivityItem,
  PortfolioBalance,
  AssetHolding,
} from "./types";

// â”€â”€ Goals â”€â”€
export const GOALS: Goal[] = [
  {
    id: "maximize_profit",
    title: "Maximize Profit",
    description:
      "Aggressive yields across high-liquidity pools and automated farming vaults.",
    icon: "auto_awesome",
    accentColor: "primary",
    apy: "14.0%",
    risk: "High",
    confidence: "65%",
  },
  {
    id: "grow_safely",
    title: "Grow Safely",
    description:
      "Prioritize capital preservation using stablecoin strategies and blue-chip assets.",
    icon: "shield",
    accentColor: "secondary",
    apy: "6.0%",
    risk: "Low",
    confidence: "75%",
  },
  {
    id: "cheapest_swap",
    title: "Cheapest Swap",
    description:
      "Routing through all major DEXs to find the lowest slippage and zero gas overhead.",
    icon: "bolt",
    accentColor: "tertiary",
    apy: "8.0%",
    risk: "Stable",
    confidence: "72%",
  },
  {
    id: "auto_portfolio",
    title: "Auto Portfolio",
    description:
      "Set it and forget it. Our AI rebalances your holdings to target your ideal index.",
    icon: "smart_toy",
    accentColor: "on-surface",
    apy: "10.0%",
    risk: "Medium",
    confidence: "68%",
  },
];

// â”€â”€ Tokens â”€â”€
export const TOKENS: Token[] = [
  {
    symbol: "SOL",
    name: "Solana Native",
    logoColor: "#9945FF",
    balance: 24.5,
    usdPrice: 178.5,
  },
  {
    symbol: "USDC",
    name: "USD Coin",
    logoColor: "#2775ca",
    balance: 1240.5,
    usdPrice: 1.0,
  },
];

// â”€â”€ Featured Strategies â”€â”€
export const STRATEGIES: Strategy[] = [
  {
    id: "blue-chip-autopilot",
    name: "The Blue-Chip Autopilot",
    description:
      "Automatically rebalance between ETH, BTC, and top stablecoins to capture market growth while minimizing volatility.",
    risk: "Moderate",
    fees: "0.1%",
    estimatedApr: 12.4,
    tag: "Most Popular",
  },
  {
    id: "high-yield-aggregator",
    name: "High Yield Aggregator",
    description:
      "Aggressively scans liquidity pools across 12 chains to find the highest temporary yield opportunities.",
    risk: "High",
    fees: "0.3%",
    estimatedApr: 24.8,
  },
  {
    id: "stablecoin-sanctuary",
    name: "Stablecoin Sanctuary",
    description:
      "Maximum safety. Strategy focused solely on top-tier audited stablecoin yield generators.",
    risk: "Low",
    fees: "0.05%",
    estimatedApr: 8.2,
  },
];

// â”€â”€ Execution Steps â”€â”€
export const EXECUTION_STEPS: ExecutionStep[] = [
  {
    icon: "swap",
    title: "We will: Swap SOL to USDC",
    description: "Optimal route found via Jupiter Aggregator (0.01% slippage)",
    accentColor: "primary",
  },
  {
    icon: "deposit",
    title: "We will: Deposit into lending protocol",
    description: "Collateralizing USDC in Solend Main Pool",
    accentColor: "secondary",
  },
];

// â”€â”€ Mock Portfolio â”€â”€
export const PORTFOLIO: PortfolioBalance = {
  total: 142504.82,
  staked: 84120.0,
  available: 58384.82,
  yield24h: 242.1,
  changePercent: 2.4,
};

// â”€â”€ Mock Asset Holdings â”€â”€
export const HOLDINGS: AssetHolding[] = [
  { symbol: "ETH", amount: 24.5, logoColor: "#627EEA" },
  { symbol: "USDC", amount: 82100.0, logoColor: "#2775CA" },
  { symbol: "WBTC", amount: 1.2, logoColor: "#F7931A" },
];

// â”€â”€ Activity Feed â”€â”€
export const ACTIVITY: ActivityItem[] = [
  {
    id: "1",
    title: "Auto-Rebalance Executed",
    description: "Optimizing pools across Curve & Convex",
    icon: "autorenew",
    accentColor: "tertiary",
    status: "Success",
    timestamp: "2 minutes ago",
  },
  {
    id: "2",
    title: "Yield Harvested",
    description: "Strategy: Yield Alpha Phase II",
    icon: "payments",
    accentColor: "primary",
    value: "+$14.20",
    valueColor: "tertiary",
    timestamp: "1 hour ago",
  },
];

// â”€â”€ Stats â”€â”€
export const STATS = [
  { value: "$1.2B+", label: "Total Value Locked" },
  { value: "45k+", label: "Active Strategists" },
  { value: "120+", label: "DeFi Protocols" },
  { value: "0.01s", label: "Execution Speed" },
];

// â”€â”€ Navigation â”€â”€
export const NAV_LINKS: { label: string; href: string }[] = [];

export const SIDEBAR_LINKS = [
  { label: "Overview", href: "/dashboard", icon: "dashboard" },
  { label: "My Goals", href: "/strategy", icon: "track_changes" },
  { label: "Analytics", href: "#", icon: "insights" },
  { label: "Settings", href: "#", icon: "settings" },
];

