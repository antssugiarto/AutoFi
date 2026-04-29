/**
 * Intent Controller
 * 
 * Handles HTTP request/response ONLY.
 * All business logic is delegated to services.
 * 
 * Pipeline: Intent → Validation → Strategy Generation → Scoring → Multi-Window Backtest → Metrics
 */

const { validateIntent } = require("../services/intentService");
const { generateStrategies } = require("../services/strategyService");
const { scoreAndSelect } = require("../services/scoringService");
const { runBacktest } = require("../services/backtestService");
const { calculateMultiWindowMetrics } = require("../utils/metricsCalculator");
const { getStrategyConfidence } = require("../services/performanceService");

/**
 * POST /intent
 * 
 * Accepts user intent, runs the full DeFi strategy pipeline
 * with multi-window backtesting, and returns the best strategy
 * with composite performance metrics.
 * 
 * Confidence is now DYNAMIC — it improves or degrades based on
 * historical accuracy from the Improve Loop.
 */
async function handleIntent(req, res) {
  try {
    const validatedIntent = await validateIntent(req.body);
    const candidates = await generateStrategies(validatedIntent.strategy);
    const { all: scoredStrategies, best: bestStrategy } = await scoreAndSelect(candidates);

    const backtestResult = await runBacktest(
      validatedIntent.amount,
      bestStrategy,
      candidates
    );

    const metrics = calculateMultiWindowMetrics(
      validatedIntent.amount,
      backtestResult
    );

    // Use DYNAMIC confidence from Improve Loop (overrides static backtest)
    const dynamicConfidence = getStrategyConfidence(bestStrategy.name);

    return res.json({
      strategy: {
        name: bestStrategy.name,
        steps: bestStrategy.steps,
        expectedAPY: bestStrategy.expectedAPY,
        risk: bestStrategy.risk,
      },
      backtest: {
        shortTermReturn: metrics.shortTermReturn,
        midTermReturn: metrics.midTermReturn,
        longTermReturn: metrics.longTermReturn,
        finalScore: metrics.finalScore,
        confidence: dynamicConfidence, // ← Dynamic from Improve Loop
      },
    });
  } catch (error) {
    return res.status(400).json({
      error: error.message,
    });
  }
}

module.exports = { handleIntent };
