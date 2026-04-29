const { checkLiveRebalance } = require("../services/rebalanceService");

/**
 * Handle rebalance check requests.
 */
async function handleCheck(req, res) {
  const { strategyName, tier } = req.query;

  if (!strategyName || !tier) {
    return res.status(400).json({ error: "strategyName and tier are required" });
  }

  const result = await checkLiveRebalance(strategyName, tier);
  return res.json(result);
}

module.exports = { handleCheck };
