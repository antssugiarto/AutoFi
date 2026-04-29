/**
 * Strategy Configuration
 * 
 * Defines minimum balance requirements per strategy tier,
 * available strategy definitions, historical APY data,
 * and multi-window backtest settings.
 * All values are configurable — no hardcoding inside service logic.
 */

// Minimum SOL balance required to execute each strategy tier
const MIN_BALANCE = {
  low: 0.1,
  stable: 0.3,
  balanced: 0.5,
  aggressive: 1,
};

// Valid strategy tiers (derived from MIN_BALANCE keys)
const VALID_STRATEGIES = Object.keys(MIN_BALANCE);

/**
 * Strategy candidate definitions.
 * 
 * Each strategy defines:
 *  - name: unique identifier
 *  - steps: ordered execution steps (human-readable)
 *  - risk: risk tier ("low" | "medium" | "high")
 *  - expectedAPY: projected annual percentage yield
 *  - applicableTiers: which user-selected strategy tiers can use this
 * 
 * To add a new strategy, simply append to this array.
 * Forbidden methods (LP, leverage) are intentionally excluded.
 */
const STRATEGY_CANDIDATES = [
  {
    name: "staking",
    steps: ["stake SOL"],
    risk: "low",
    expectedAPY: 6,
    applicableTiers: ["low", "stable", "balanced", "aggressive"],
  },
  {
    name: "lending",
    steps: ["swap SOL → USDC", "lend USDC"],
    risk: "medium",
    expectedAPY: 8,
    applicableTiers: ["stable", "balanced", "aggressive"],
  },
  {
    name: "swap-yield",
    steps: ["swap SOL → USDC", "swap USDC → mSOL", "stake mSOL"],
    risk: "medium",
    expectedAPY: 10,
    applicableTiers: ["balanced", "aggressive"],
  },
  {
    name: "aggressive-lending",
    steps: ["swap SOL → USDC", "lend USDC", "borrow SOL", "stake SOL"],
    risk: "high",
    expectedAPY: 14,
    applicableTiers: ["aggressive"],
  },
];

/**
 * Historical APY data for backtesting (dummy but realistic).
 * 90 data points = 90 days of daily APY snapshots.
 * 
 * Pattern: realistic DeFi APY fluctuation between ~3% and ~15%
 * with occasional dips and spikes to test rebalancing triggers.
 */
const HISTORICAL_APY_BASE = [
  // Week 1-2 (Days 1-14): Stable period
  7.2, 7.5, 7.1, 6.8, 7.3, 7.0, 6.9,
  7.4, 7.6, 7.2, 6.5, 7.1, 7.3, 7.0,
  // Week 3-4 (Days 15-28): Slight growth
  7.8, 8.0, 8.2, 7.9, 8.5, 8.1, 7.7,
  8.3, 8.6, 8.0, 7.5, 8.4, 8.2, 8.0,
  // Week 5-6 (Days 29-42): Volatile period with dips
  6.0, 4.5, 3.8, 5.2, 6.8, 7.5, 8.0,
  9.2, 8.5, 4.2, 3.5, 5.0, 6.5, 7.8,
  // Week 7-8 (Days 43-56): Recovery
  8.5, 9.0, 9.3, 8.8, 9.5, 9.2, 8.7,
  9.1, 9.4, 9.0, 8.6, 9.3, 9.5, 9.1,
  // Week 9-10 (Days 57-70): High yield period
  10.2, 11.0, 10.5, 11.5, 12.0, 10.8, 11.2,
  10.0, 11.8, 12.5, 11.0, 10.5, 11.3, 12.0,
  // Week 11-12 (Days 71-84): Decline
  9.5, 8.8, 8.0, 7.5, 7.0, 6.5, 6.0,
  5.5, 5.0, 4.8, 4.5, 5.2, 5.8, 6.2,
  // Week 13 (Days 85-90): Stabilizing
  6.5, 6.8, 7.0, 7.2, 7.5, 7.3,
];

/**
 * Returns historical APY data with small random noise (±0.5%)
 * so that each backtest run produces slightly different results.
 */
function getHistoricalAPY() {
  return HISTORICAL_APY_BASE.map(apy => {
    const noise = (Math.random() - 0.5) * 1.0; // ±0.5% variation
    return Math.max(0.1, parseFloat((apy + noise).toFixed(2)));
  });
}

// For backward compatibility, export as getter
const HISTORICAL_APY = HISTORICAL_APY_BASE;

/**
 * Multi-window backtest configuration.
 * 
 * Each window defines:
 *  - name: identifier for the window
 *  - days: number of days to simulate (taken from the END of historical data)
 *  - weight: contribution to the final weighted score
 * 
 * Weights MUST sum to 1.0
 */
const BACKTEST_WINDOWS = [
  { name: "short",  days: 7,   weight: 0.5 },
  { name: "mid",    days: 30,  weight: 0.3 },
  { name: "long",   days: 90,  weight: 0.2 },
];

module.exports = {
  MIN_BALANCE,
  VALID_STRATEGIES,
  STRATEGY_CANDIDATES,
  HISTORICAL_APY,
  getHistoricalAPY,
  BACKTEST_WINDOWS,
};
