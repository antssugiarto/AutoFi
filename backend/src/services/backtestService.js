/**
 * Backtest Service (Multi-Window)
 * 
 * Simulates strategy performance across multiple time windows:
 *  - Short-term (7 days)
 *  - Mid-term (30 days)
 *  - Long-term (90 days)
 * 
 * Each window runs independent daily compounding with rebalancing.
 * Results are weighted to produce a final composite score.
 * 
 * Formula: balance *= (1 + apy / 365)
 */

const { HISTORICAL_APY, getHistoricalAPY, BACKTEST_WINDOWS } = require("../config/strategyConfig");
const { shouldRebalance } = require("./rebalanceService");
const { scoreAndSelect } = require("./scoringService");

/**
 * Simulates daily compounding for a single day.
 * 
 * @param {number} balance - Current balance
 * @param {number} apy - Annual percentage yield (e.g. 7.5 means 7.5%)
 * @returns {number} Updated balance after one day of compounding
 */
function simulateDay(balance, apy) {
  return balance * (1 + apy / 100 / 365);
}

/**
 * Runs a single-window backtest simulation with rebalancing.
 * 
 * For each day in the window:
 *  1. Check rebalance triggers (APY drop, risk, stagnation)
 *  2. If triggered → re-score all candidates and switch to best
 *  3. Apply daily compounding
 * 
 * @param {number} initialBalance - Starting balance
 * @param {Object} strategy - The initially selected best strategy
 * @param {Array<Object>} allStrategies - All strategy candidates (for rebalancing)
 * @param {Array<number>} apyData - Historical APY data for this window
 * @returns {Object} { finalBalance, dailyBalances, rebalanceEvents, activeStrategy }
 */
async function runSingleWindow(initialBalance, strategy, allStrategies, apyData) {
  let balance = initialBalance;
  let activeStrategy = { ...strategy };
  const dailyBalances = [balance];
  const rebalanceEvents = [];

  for (let day = 0; day < apyData.length; day++) {
    const currentAPY = apyData[day];

    // --- Rebalance check ---
    const rebalanceNeeded = shouldRebalance({
      currentAPY,
      strategyRisk: activeStrategy.risk,
      dailyBalances,
      day,
    });

    if (rebalanceNeeded.triggered) {
      // Re-score all candidates and switch to the new best
      const { best: newBest } = await scoreAndSelect(allStrategies);

      // Only switch if the new best is actually different
      if (newBest.name !== activeStrategy.name) {
        rebalanceEvents.push({
          day,
          reason: rebalanceNeeded.reason,
          from: activeStrategy.name,
          to: newBest.name,
        });
        activeStrategy = { ...newBest };
      }
    }

    // --- Simulate one day of compounding ---
    balance = simulateDay(balance, currentAPY);
    dailyBalances.push(balance);
  }

  return {
    finalBalance: balance,
    dailyBalances,
    rebalanceEvents,
    activeStrategy,
  };
}

/**
 * Extracts a time window slice from the historical data.
 * Takes the LAST N days from the dataset (most recent data).
 * 
 * @param {Array<number>} fullData - Complete historical APY dataset
 * @param {number} days - Number of days for this window
 * @returns {Array<number>} Sliced APY data
 */
function getWindowData(fullData, days) {
  if (days >= fullData.length) {
    return [...fullData];
  }
  return fullData.slice(fullData.length - days);
}

/**
 * Runs multi-window backtesting across all configured windows.
 * 
 * Process:
 *  1. For each window (short, mid, long), extract the relevant APY slice
 *  2. Run independent simulation with rebalancing per window
 *  3. Calculate return percentage per window
 *  4. Compute weighted final score: (short * 0.5) + (mid * 0.3) + (long * 0.2)
 * 
 * @param {number} initialBalance - Starting balance
 * @param {Object} strategy - The initially selected best strategy
 * @param {Array<Object>} allStrategies - All strategy candidates (for rebalancing)
 * @param {Array<number>} [historicalData] - Full APY dataset (defaults to config)
 * @returns {Object} Multi-window backtest results with final composite score
 */
async function runBacktest(initialBalance, strategy, allStrategies, historicalData = null) {
  // Use noisy data by default for realistic variation
  if (!historicalData) historicalData = getHistoricalAPY();
  const windowResults = {};
  let totalRebalanceEvents = [];

  // --- Run each window independently ---
  for (const window of BACKTEST_WINDOWS) {
    const apySlice = getWindowData(historicalData, window.days);

    const result = await runSingleWindow(
      initialBalance,
      strategy,
      allStrategies,
      apySlice
    );

    // Calculate return % for this window
    const returnAmount = result.finalBalance - initialBalance;
    const returnPercent = (returnAmount / initialBalance) * 100;

    windowResults[window.name] = {
      days: apySlice.length,
      finalBalance: result.finalBalance,
      return: returnAmount,
      returnPercent,
      dailyBalances: result.dailyBalances,
      rebalanceEvents: result.rebalanceEvents,
    };

    totalRebalanceEvents = totalRebalanceEvents.concat(
      result.rebalanceEvents.map((e) => ({ ...e, window: window.name }))
    );
  }

  // --- Compute weighted final score ---
  // finalScore = (shortReturn * 0.5) + (midReturn * 0.3) + (longReturn * 0.2)
  let finalScore = 0;
  for (const window of BACKTEST_WINDOWS) {
    const windowReturn = windowResults[window.name].returnPercent;
    finalScore += windowReturn * window.weight;
  }

  return {
    windows: windowResults,
    finalScore,
    rebalanceEvents: totalRebalanceEvents,
  };
}

module.exports = { runBacktest, runSingleWindow, simulateDay, getWindowData };
