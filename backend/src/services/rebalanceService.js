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

const { generateStrategies } = require("./strategyService");
const { scoreAndSelect } = require("./scoringService");

/**
 * Live Market Monitor: Checks if a current strategy is still optimal
 * compared to other strategies available for the same tier.
 */
async function checkLiveRebalance(currentStrategyName, currentTier) {
  try {
    // 1. Get current candidates for the same tier
    const candidates = await generateStrategies(currentTier);
    
    // 2. Score them using fresh market data
    const { all: scoredCandidates } = await scoreAndSelect(candidates);
    
    // 3. Find the best current one
    const bestCurrent = scoredCandidates[0];
    
    // 4. Find the strategy the user is currently using
    const current = scoredCandidates.find(s => s.name === currentStrategyName);
    
    if (!current || !bestCurrent) return { triggered: false };

    // 5. Threshold: Only rebalance if new strategy is > 10% better in score
    const threshold = 1.10;
    const isBetter = bestCurrent.name !== current.name && bestCurrent.score > (current.score * threshold);

    if (!isBetter) return { triggered: false, reason: null };

    const improvement = ((bestCurrent.score - current.score) / current.score * 100).toFixed(1);

    return {
      triggered: true,
      reason: `MARKET ALERT: "${bestCurrent.name}" (APY ${bestCurrent.expectedAPY}%) outperforms your current "${current.name}" by +${improvement}%. Switching is recommended.`,
      optimalStrategy: bestCurrent,
    };
  } catch (error) {
    console.error("[Rebalance] Live check failed:", error.message);
    return { triggered: false };
  }
}

module.exports = { shouldRebalance, checkLiveRebalance };
