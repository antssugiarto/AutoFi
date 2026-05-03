/**
 * Strategy Service
 * 
 * Dynamically generates strategy candidates based on the user's
 * selected strategy tier. Filters from the master candidate list
 * defined in strategyConfig.
 * 
 * Extensibility: to add new strategies, update STRATEGY_CANDIDATES
 * in strategyConfig.js — no changes needed here.
 */

const { STRATEGY_CANDIDATES } = require("../config/strategyConfig");

/**
 * Generates a filtered list of strategy candidates
 * that are applicable to the given strategy tier.
 * 
 * @param {string} strategyTier - The user's chosen tier ("low"|"stable"|"balanced"|"aggressive")
 * @returns {Array<Object>} Array of applicable strategy candidates
 */
async function generateStrategies(strategyTier) {
  // Filter candidates whose applicableTiers include the user's selection
  const candidates = STRATEGY_CANDIDATES
    .filter((s) => s.applicableTiers.includes(strategyTier))
    .map((s) => {
      // Add a small random fluctuation (Market Noise)
      // Base APY + random value between -0.5% and +0.5%
      const noise = (Math.random() * 1.0 - 0.5);
      const dynamicAPY = Math.max(1, s.expectedAPY + noise); // Ensure at least 1%

      return {
        name: s.name,
        steps: [...s.steps],
        risk: s.risk,
        expectedAPY: parseFloat(dynamicAPY.toFixed(2)),
      };
    });

  if (candidates.length === 0) {
    throw new Error(`No strategies available for tier "${strategyTier}".`);
  }

  return candidates;
}

module.exports = { generateStrategies };
