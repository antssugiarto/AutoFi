const mongoose = require('mongoose');

const RecordSchema = new mongoose.Schema({
  walletAddress: { type: String, required: true },
  amount: { type: Number, required: true },
  expectedAPY: { type: Number, default: null },
  expectedDailyRate: { type: Number, default: null },
  deployedAt: { type: Number, required: true },
  actualProfit: { type: Number, default: null },
  expectedProfit: { type: Number, default: null },
  delta: { type: Number, default: null },
  accuracy: { type: Number, default: null },
  checkedAt: { type: Number, default: null },
  daysElapsed: { type: Number, default: null }
});

const StrategySchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  confidence: { type: Number, required: true, default: 0.70 },
  totalRecords: { type: Number, default: 0 },
  avgAccuracy: { type: Number, default: 1.0 },
  records: [RecordSchema]
});

module.exports = mongoose.model('Strategy', StrategySchema);
