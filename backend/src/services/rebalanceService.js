/**
 * Rebalance Service
 * 
 * Evaluates whether the current strategy should be switched
 * based on configurable trigger conditions:
 *  1. APY drop below threshold
 *  2. Risk exceeds maximum allowed
 *  3. Balance stagnation over consecutive days
 */

const { REBALANCE_CONFIG, RISK_LEVELS } = require("../config/riskConfig");

/**
 * Determines if a rebalance should be triggered.
 * 
 * @param {Object} params
 * @param {number} params.currentAPY - APY for the current period
 * @param {string} params.strategyRisk - Current strategy's risk level ("low"|"medium"|"high")
 * @param {Array<number>} params.dailyBalances - Array of daily balance snapshots
 * @param {number} params.day - Current day index in the simulation
 * @returns {Object} { triggered: boolean, reason: string|null }
 */
function shouldRebalance({ currentAPY, strategyRisk, dailyBalances, day }) {
  const { apyThreshold, maxRisk, stagnationDays } = REBALANCE_CONFIG;

  // --- Rule 1: APY dropped below threshold ---
  if (currentAPY < apyThreshold) {
    return {
      triggered: true,
      reason: `APY dropped to ${currentAPY}%, below threshold of ${apyThreshold}%.`,
    };
  }

  // --- Rule 2: Strategy risk exceeds maximum allowed ---
  const riskLevel = RISK_LEVELS[strategyRisk] || 0;
  if (riskLevel > maxRisk) {
    return {
      triggered: true,
      reason: `Strategy risk "${strategyRisk}" (level ${riskLevel}) exceeds max allowed (${maxRisk}).`,
    };
  }

  // --- Rule 3: Balance stagnation ---
  // Check if balance has not grown for `stagnationDays` consecutive days
  if (dailyBalances.length >= stagnationDays) {
    const recentBalances = dailyBalances.slice(-stagnationDays);
    const isStagnant = recentBalances.every(
      (bal, i) => i === 0 || bal <= recentBalances[i - 1]
    );

    if (isStagnant && recentBalances.length > 1) {
      return {
        triggered: true,
        reason: `Balance stagnant for ${stagnationDays} consecutive days.`,
      };
    }
  }

  // No rebalance needed
  return { triggered: false, reason: null };
}

module.exports = { shouldRebalance };
