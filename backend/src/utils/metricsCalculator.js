/**
 * Metrics Calculator (Multi-Window)
 * 
 * Computes final performance metrics from multi-window backtest results:
 *  - Per-window return and confidence
 *  - Weighted final score
 *  - Overall confidence (weighted average across windows)
 */

const { BACKTEST_WINDOWS } = require("../config/strategyConfig");

/**
 * Calculates the confidence score based on return consistency.
 * 
 * Logic:
 *  - Compute daily returns from balance snapshots
 *  - Calculate the coefficient of variation (stddev / mean)
 *  - Lower variation = higher confidence
 *  - Stable growth → confidence near 1.0
 *  - Volatile growth → confidence closer to 0.0
 * 
 * @param {Array<number>} dailyBalances - Sequential daily balance snapshots
 * @returns {number} Confidence score between 0 and 1
 */
function calculateConfidence(dailyBalances) {
  if (dailyBalances.length < 2) return 0;

  // Calculate daily returns (percentage change day-over-day)
  const dailyReturns = [];
  for (let i = 1; i < dailyBalances.length; i++) {
    const returnPct = (dailyBalances[i] - dailyBalances[i - 1]) / dailyBalances[i - 1];
    dailyReturns.push(returnPct);
  }

  if (dailyReturns.length === 0) return 0;

  // Mean of daily returns
  const mean = dailyReturns.reduce((sum, r) => sum + r, 0) / dailyReturns.length;

  // Standard deviation of daily returns
  const variance =
    dailyReturns.reduce((sum, r) => sum + Math.pow(r - mean, 2), 0) / dailyReturns.length;
  const stdDev = Math.sqrt(variance);

  // Coefficient of variation (handle zero mean edge case)
  if (Math.abs(mean) < 1e-10) return 0.5;
  const cv = stdDev / Math.abs(mean);

  // Map CV to confidence: lower CV = higher confidence
  // Using exponential decay: confidence = e^(-cv * scaleFactor)
  const scaleFactor = 2;
  const confidence = Math.exp(-cv * scaleFactor);

  // Clamp between 0 and 1
  return Math.min(1, Math.max(0, parseFloat(confidence.toFixed(4))));
}

/**
 * Computes multi-window metrics from backtest results.
 * 
 * For each window:
 *  - Return percentage
 *  - Confidence score (based on daily balance consistency)
 * 
 * Final output:
 *  - shortTermReturn, midTermReturn, longTermReturn
 *  - finalScore (weighted composite)
 *  - confidence (weighted average of per-window confidence)
 * 
 * @param {number} initialBalance - Starting balance
 * @param {Object} backtestResult - Result from multi-window runBacktest()
 * @returns {Object} Multi-window metrics with final score and confidence
 */
function calculateMultiWindowMetrics(initialBalance, backtestResult) {
  const { windows, finalScore } = backtestResult;

  // --- Calculate per-window confidence ---
  const windowMetrics = {};
  let weightedConfidence = 0;

  for (const windowConfig of BACKTEST_WINDOWS) {
    const windowData = windows[windowConfig.name];
    const confidence = calculateConfidence(windowData.dailyBalances);

    windowMetrics[windowConfig.name] = {
      return: parseFloat(windowData.returnPercent.toFixed(4)),
      confidence,
    };

    // Accumulate weighted confidence
    weightedConfidence += confidence * windowConfig.weight;
  }

  // --- Build final output ---
  return {
    shortTermReturn: windowMetrics.short.return,
    midTermReturn: windowMetrics.mid.return,
    longTermReturn: windowMetrics.long.return,
    finalScore: parseFloat(finalScore.toFixed(4)),
    confidence: parseFloat(weightedConfidence.toFixed(4)),
  };
}

module.exports = { calculateMultiWindowMetrics, calculateConfidence };
