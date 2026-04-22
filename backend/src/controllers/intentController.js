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

/**
 * POST /intent
 * 
 * Accepts user intent, runs the full DeFi strategy pipeline
 * with multi-window backtesting, and returns the best strategy
 * with composite performance metrics.
 */
async function handleIntent(req, res) {
  try {
    // Step 1: Validate intent
    const validatedIntent = await validateIntent(req.body);

    // Step 2: Generate strategy candidates for the selected tier
    const candidates = await generateStrategies(validatedIntent.strategy);

    // Step 3: Score all candidates and select the best
    const { all: scoredStrategies, best: bestStrategy } = await scoreAndSelect(candidates);

    // Step 4: Run multi-window backtest (short/mid/long) with rebalancing
    const backtestResult = await runBacktest(
      validatedIntent.amount,
      bestStrategy,
      candidates
    );

    // Step 5: Calculate multi-window metrics
    const metrics = calculateMultiWindowMetrics(
      validatedIntent.amount,
      backtestResult
    );

    // Step 6: Return strict JSON response
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
        confidence: metrics.confidence,
      },
    });
  } catch (error) {
    // Return validation/processing errors as structured JSON
    return res.status(400).json({
      error: error.message,
    });
  }
}

module.exports = { handleIntent };
