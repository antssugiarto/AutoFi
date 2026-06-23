/**
 * Performance Service (Improve Loop)
 * 
 * Stores expected vs actual profit data per strategy.
 * Compares performance delta and updates confidence scores.
 * Uses JSON file as lightweight database.
 * 
 * Flow:
 *   1. User deploys → frontend sends expectedProfit
 *   2. User checks/withdraws → frontend sends actualProfit
 *   3. Service calculates delta and adjusts confidence
 */

const fs = require("fs");
const path = require("path");
const mongoose = require("mongoose");
const StrategyModel = require("../models/Performance");

const DATA_FILE = process.env.VERCEL 
  ? path.join("/tmp", "performance.json")
  : path.join(__dirname, "../../data/performance.json");

// Default confidence per strategy (matches initial backtest output)
// Now using 0.0 - 1.0 scale (decimal) for consistency
const DEFAULT_CONFIDENCE = {
  staking: 0.75,
  lending: 0.72,
  "swap-yield": 0.68,
  "aggressive-lending": 0.65,
};

/**
 * Load performance data from JSON file.
 * Creates default structure if file doesn't exist.
 */
function loadData() {
  try {
    if (fs.existsSync(DATA_FILE)) {
      return JSON.parse(fs.readFileSync(DATA_FILE, "utf8"));
    }
  } catch (err) {
    console.error("[Performance] Failed to load data:", err.message);
  }

  // Default structure
  const defaultData = { strategies: {} };
  for (const [name, confidence] of Object.entries(DEFAULT_CONFIDENCE)) {
    defaultData.strategies[name] = {
      confidence,
      totalRecords: 0,
      avgAccuracy: 1.0,
      records: [],
    };
  }
  saveData(defaultData);
  return defaultData;
}

/**
 * Save performance data to JSON file.
 */
function saveData(data) {
  const dir = path.dirname(DATA_FILE);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
}

const isCloud = () => mongoose.connection.readyState === 1;

async function loadDataAsync() {
  if (isCloud()) {
    const strategies = await StrategyModel.find();
    const data = { strategies: {} };
    for (const s of strategies) {
      data.strategies[s.name] = s.toObject();
    }
    for (const [name, confidence] of Object.entries(DEFAULT_CONFIDENCE)) {
      if (!data.strategies[name]) {
        data.strategies[name] = {
          confidence,
          totalRecords: 0,
          avgAccuracy: 1.0,
          records: [],
        };
      }
    }
    return data;
  }
  return loadData();
}

async function saveDataAsync(data) {
  if (isCloud()) {
    for (const [name, strategyData] of Object.entries(data.strategies)) {
      await StrategyModel.findOneAndUpdate(
        { name },
        { $set: strategyData },
        { upsert: true, new: true }
      );
    }
  } else {
    saveData(data);
  }
}

/**
 * Record expected profit when user deploys a strategy.
 */
async function recordDeployment(strategyName, walletAddress, amount, expectedAPY) {
  const data = await loadDataAsync();
  
  if (!data.strategies[strategyName]) {
    data.strategies[strategyName] = {
      confidence: 0.70, // Default decimal confidence
      totalRecords: 0,
      avgAccuracy: 1.0,
      records: [],
    };
  }

  // Calculate expected daily profit rate
  const expectedDailyRate = expectedAPY / 365 / 100;

  data.strategies[strategyName].records.push({
    walletAddress,
    amount,
    expectedAPY,
    expectedDailyRate,
    deployedAt: Date.now(),
    actualProfit: null,
    delta: null,
    accuracy: null,
    checkedAt: null,
  });

  await saveDataAsync(data);
  return { success: true, strategyName };
}

/**
 * Record actual profit and update confidence.
 * Called when user checks performance or withdraws.
 */
async function recordActualProfit(strategyName, walletAddress, amount, actualProfit, daysElapsed) {
  const data = await loadDataAsync();
  const strategy = data.strategies[strategyName];

  if (!strategy) {
    return { success: false, error: "Strategy not found" };
  }

  // Find the matching deployment record
  const record = strategy.records.find(
    (r) => r.walletAddress === walletAddress && r.amount === amount && !r.checkedAt
  );

  if (!record) {
    // No matching unchecked record, create a new comparison entry
    const expectedProfit = amount * (DEFAULT_CONFIDENCE[strategyName] ? 
      ({ staking: 6, lending: 8, "swap-yield": 10, "aggressive-lending": 14 }[strategyName] || 8) : 8
    ) / 100 / 365 * daysElapsed;

    const delta = actualProfit - expectedProfit;
    const accuracy = expectedProfit !== 0 
      ? Math.max(0, 1 - Math.abs(delta / expectedProfit))
      : actualProfit === 0 ? 1 : 0;

    strategy.records.push({
      walletAddress,
      amount,
      expectedAPY: null,
      expectedDailyRate: null,
      deployedAt: Date.now() - daysElapsed * 86400000,
      actualProfit,
      expectedProfit,
      delta,
      accuracy,
      checkedAt: Date.now(),
    });
  } else {
    // Update existing record
    const expectedProfit = record.amount * record.expectedDailyRate * daysElapsed;
    record.actualProfit = actualProfit;
    record.delta = actualProfit - expectedProfit;
    record.accuracy = expectedProfit !== 0 
      ? Math.max(0, 1 - Math.abs(record.delta / expectedProfit))
      : actualProfit === 0 ? 1 : 0;
    record.checkedAt = Date.now();
    record.daysElapsed = daysElapsed;
  }

  // --- UPDATE CONFIDENCE ---
  const checkedRecords = strategy.records.filter((r) => r.checkedAt && r.accuracy !== null);
  
  if (checkedRecords.length > 0) {
    // Sort by checkedAt descending (newest first)
    checkedRecords.sort((a, b) => b.checkedAt - a.checkedAt);

    // Calculate weighted accuracy (newest records have more weight)
    // weight = 0.9 ^ index (0th index = 1.0, 1st = 0.9, 2nd = 0.81, etc.)
    let totalWeight = 0;
    let weightedAccuracySum = 0;
    
    // Only consider last 20 records for current performance
    const recordsToConsider = checkedRecords.slice(0, 20);
    
    recordsToConsider.forEach((r, i) => {
      const weight = Math.pow(0.85, i); // Decay factor
      weightedAccuracySum += r.accuracy * weight;
      totalWeight += weight;
    });

    const avgAccuracy = weightedAccuracySum / totalWeight;
    strategy.avgAccuracy = avgAccuracy;
    strategy.totalRecords = checkedRecords.length;

    // Adjust confidence based on weighted accuracy
    const baseConfidence = DEFAULT_CONFIDENCE[strategyName] || 0.70;
    
    if (avgAccuracy >= 0.95) {
      // Near perfect: high boost
      strategy.confidence = Math.min(0.99, baseConfidence + 0.20);
    } else if (avgAccuracy >= 0.85) {
      // Very good
      strategy.confidence = Math.min(0.95, baseConfidence + 0.10);
    } else if (avgAccuracy >= 0.70) {
      // Good/Target
      strategy.confidence = baseConfidence;
    } else if (avgAccuracy >= 0.50) {
      // Underperforming
      strategy.confidence = Math.max(0.40, baseConfidence - 0.15);
    } else {
      // Significant deviation
      strategy.confidence = Math.max(0.20, baseConfidence - 0.30);
    }
  }

  await saveDataAsync(data);

  return {
    success: true,
    strategyName,
    confidence: strategy.confidence,
    avgAccuracy: strategy.avgAccuracy,
    totalRecords: strategy.totalRecords,
  };
}

/**
 * Get current confidence scores for all strategies.
 */
async function getConfidenceScores() {
  const data = await loadDataAsync();
  const scores = {};

  for (const [name, strategy] of Object.entries(data.strategies)) {
    scores[name] = {
      confidence: strategy.confidence,
      avgAccuracy: strategy.avgAccuracy,
      totalRecords: strategy.totalRecords,
    };
  }

  return scores;
}

/**
 * Get confidence for a specific strategy.
 */
async function getStrategyConfidence(strategyName) {
  const data = await loadDataAsync();
  const strategy = data.strategies[strategyName];
  
  if (!strategy) {
    return DEFAULT_CONFIDENCE[strategyName] || 0.70;
  }

  return strategy.confidence;
}

/**
 * Get full performance history for a strategy.
 */
async function getPerformanceHistory(strategyName) {
  const data = await loadDataAsync();
  const strategy = data.strategies[strategyName];

  if (!strategy) {
    return { records: [], confidence: DEFAULT_CONFIDENCE[strategyName] || 0.70 };
  }

  return {
    records: strategy.records.filter((r) => r.checkedAt),
    confidence: strategy.confidence,
    avgAccuracy: strategy.avgAccuracy,
    totalRecords: strategy.totalRecords,
  };
}

/**
 * Resets all performance data.
 */
async function resetData() {
  const defaultData = { strategies: {} };
  for (const [name, confidence] of Object.entries(DEFAULT_CONFIDENCE)) {
    defaultData.strategies[name] = {
      confidence,
      totalRecords: 0,
      avgAccuracy: 1.0,
      records: [],
    };
  }
  await saveDataAsync(defaultData);
  return { success: true };
}

module.exports = {
  recordDeployment,
  recordActualProfit,
  getConfidenceScores,
  getStrategyConfidence,
  getPerformanceHistory,
  resetData,
};

