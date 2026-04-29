/**
 * Performance Controller
 * 
 * API endpoints for the Improve Loop:
 *   POST /performance/deploy   - Record expected profit at deploy time
 *   POST /performance/check    - Record actual profit and update confidence
 *   GET  /performance/confidence - Get all confidence scores
 *   GET  /performance/history/:strategy - Get performance history
 */

const {
  recordDeployment,
  recordActualProfit,
  getConfidenceScores,
  getPerformanceHistory,
} = require("../services/performanceService");

/**
 * POST /performance/deploy
 * Body: { strategyName, walletAddress, amount, expectedAPY }
 */
async function handleDeploy(req, res) {
  try {
    const { strategyName, walletAddress, amount, expectedAPY } = req.body;

    if (!strategyName || !amount || !expectedAPY) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const result = recordDeployment(
      strategyName,
      walletAddress || "anonymous",
      amount,
      expectedAPY
    );

    return res.json(result);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}

/**
 * POST /performance/check
 * Body: { strategyName, walletAddress, amount, actualProfit, daysElapsed }
 */
async function handleCheck(req, res) {
  try {
    const { strategyName, walletAddress, amount, actualProfit, daysElapsed } = req.body;

    if (!strategyName || amount === undefined || actualProfit === undefined) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const result = recordActualProfit(
      strategyName,
      walletAddress || "anonymous",
      amount,
      actualProfit,
      daysElapsed || 1
    );

    return res.json(result);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}

/**
 * GET /performance/confidence
 * Returns confidence scores for all strategies
 */
async function handleGetConfidence(req, res) {
  try {
    const scores = getConfidenceScores();
    return res.json(scores);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}

/**
 * GET /performance/history/:strategy
 * Returns performance history for a specific strategy
 */
async function handleGetHistory(req, res) {
  try {
    const { strategy } = req.params;
    const history = getPerformanceHistory(strategy);
    return res.json(history);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}

module.exports = {
  handleDeploy,
  handleCheck,
  handleGetConfidence,
  handleGetHistory,
};
