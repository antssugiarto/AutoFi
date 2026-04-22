/**
 * Intent Service
 * 
 * Responsible for validating user intent input.
 * Ensures wallet, amount, token, and strategy meet all requirements
 * before passing downstream to strategy generation.
 */

const { MIN_BALANCE, VALID_STRATEGIES } = require("../config/strategyConfig");

/**
 * Validates the incoming intent payload.
 * 
 * @param {Object} intent - The raw intent from the request body
 * @param {string} intent.wallet - User wallet address
 * @param {number} intent.amount - Amount of token to deploy
 * @param {string} intent.token - Token symbol (e.g. "SOL")
 * @param {string} intent.strategy - Strategy tier ("low"|"stable"|"balanced"|"aggressive")
 * @returns {Object} Validated and sanitized intent object
 * @throws {Error} If any validation rule fails
 */
async function validateIntent(intent) {
  const { wallet, amount, token, strategy } = intent;

  // --- Wallet validation ---
  if (!wallet || typeof wallet !== "string" || wallet.trim().length === 0) {
    throw new Error("Wallet address is required and must be a non-empty string.");
  }

  // --- Amount validation ---
  if (amount === undefined || amount === null || typeof amount !== "number" || amount <= 0) {
    throw new Error("Amount must be a positive number greater than 0.");
  }

  // --- Strategy validation ---
  if (!strategy || !VALID_STRATEGIES.includes(strategy)) {
    throw new Error(
      `Invalid strategy "${strategy}". Must be one of: ${VALID_STRATEGIES.join(", ")}.`
    );
  }

  // --- Minimum balance check per strategy tier ---
  const minRequired = MIN_BALANCE[strategy];
  if (amount < minRequired) {
    throw new Error(
      `Insufficient amount for "${strategy}" strategy. Minimum required: ${minRequired} ${token || "SOL"}.`
    );
  }

  // Return clean, validated intent
  return {
    wallet: wallet.trim(),
    amount,
    token: token || "SOL",
    strategy,
  };
}

module.exports = { validateIntent };
