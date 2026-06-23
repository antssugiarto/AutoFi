/**
 * AutoFi — Automated DeFi Strategy Engine
 * 
 * Pure simulation backend (no blockchain integration).
 * Implements: Intent → Validation → Strategy → Scoring → Backtest → Output
 */

require('dotenv').config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const { handleIntent } = require("./controllers/intentController");
const {
  handleDeploy,
  handleCheck,
  handleGetConfidence,
  handleGetHistory,
} = require("./controllers/performanceController");
const { handleCheck: handleRebalanceCheck } = require("./controllers/rebalanceController");

const app = express();
const PORT = process.env.PORT || 3001;

// --- Database Connection ---
if (process.env.MONGODB_URI) {
  mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log("[MongoDB] Successfully connected to cloud database."))
  .catch((err) => console.error("[MongoDB] Connection error:", err));
} else {
  console.log("[Local DB] MONGODB_URI not found in .env. Falling back to local performance.json");
}

// --- Middleware ---
app.use(cors({
  origin: ["http://localhost:3000", "http://localhost:3001"],
  methods: ["GET", "POST"],
}));
app.use(express.json());

// --- Routes ---
app.post("/intent", handleIntent);

// --- Performance / Improve Loop Routes ---
app.post("/performance/deploy", handleDeploy);
app.post("/performance/check", handleCheck);
app.get("/performance/confidence", handleGetConfidence);
app.get("/performance/history/:strategy", handleGetHistory);

// --- Rebalance Monitor Routes ---
app.get("/rebalance/check", handleRebalanceCheck);

// --- Health check ---
app.get("/health", (req, res) => {
  res.json({ status: "ok", engine: "AutoFi DeFi Strategy Engine", version: "1.0.0" });
});

// --- Start server ---
const server = app.listen(PORT, () => {
  console.log(`AutoFi engine running on http://localhost:${PORT}`);
}).on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`Error: Port ${PORT} is already in use. Please kill the existing process or use a different port.`);
  } else {
    console.error('Server error:', err);
  }
  process.exit(1);
});

module.exports = app;
