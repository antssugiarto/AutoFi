/**
 * Risk Configuration
 * 
 * Defines risk weights used in strategy scoring
 * and rebalancing trigger thresholds.
 */

// Risk weight applied as a penalty in the scoring formula:
// score = expectedAPY - RISK_WEIGHT[risk]
const RISK_WEIGHT = {
  low: 1,
  medium: 2,
  high: 3,
};

// Numeric risk levels for comparison in rebalancing logic
const RISK_LEVELS = {
  low: 1,
  medium: 2,
  high: 3,
};

// Rebalancing trigger configuration
const REBALANCE_CONFIG = {
  apyThreshold: 5,       // If current APY drops below this, trigger rebalance
  maxRisk: 2,            // Max numeric risk allowed (1=low, 2=medium, 3=high)
  stagnationDays: 3,     // If no growth for this many consecutive days, rebalance
};

module.exports = {
  RISK_WEIGHT,
  RISK_LEVELS,
  REBALANCE_CONFIG,
};
