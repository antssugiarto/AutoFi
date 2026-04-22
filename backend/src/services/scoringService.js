/**
 * Scoring Service
 * 
 * Assigns a risk-adjusted score to each strategy candidate
 * and selects the best one.
 * 
 * Formula: score = expectedAPY - RISK_WEIGHT[risk]
 */

const { RISK_WEIGHT } = require("../config/riskConfig");

/**
 * Scores a single strategy candidate.
 * 
 * @param {Object} strategy - A strategy candidate
 * @returns {Object} Strategy with computed score attached
 */
function scoreStrategy(strategy) {
  const weight = RISK_WEIGHT[strategy.risk] || 0;
  const score = strategy.expectedAPY - weight;

  return {
    ...strategy,
    score,
  };
}

/**
 * Scores all candidates, sorts descending, and returns:
 *  - all: the full sorted list with scores
 *  - best: the top-scoring strategy
 * 
 * @param {Array<Object>} strategies - Array of strategy candidates
 * @returns {Object} { all: Array, best: Object }
 */
async function scoreAndSelect(strategies) {
  // Score each candidate
  const scored = strategies.map(scoreStrategy);

  // Sort by score descending (highest = best)
  scored.sort((a, b) => b.score - a.score);

  return {
    all: scored,
    best: scored[0],
  };
}

module.exports = { scoreAndSelect, scoreStrategy };
