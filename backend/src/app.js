/**
 * AutoFi — Automated DeFi Strategy Engine
 * 
 * Pure simulation backend (no blockchain integration).
 * Implements: Intent → Validation → Strategy → Scoring → Backtest → Output
 */

const express = require("express");
const cors = require("cors");
const { handleIntent } = require("./controllers/intentController");

const app = express();
const PORT = process.env.PORT || 3001;

// --- Middleware ---
app.use(cors());
app.use(express.json());

// --- Routes ---
app.post("/intent", handleIntent);

// --- Health check ---
app.get("/health", (req, res) => {
  res.json({ status: "ok", engine: "AutoFi DeFi Strategy Engine", version: "1.0.0" });
});

// --- Start server ---
app.listen(PORT, () => {
  console.log(`AutoFi engine running on http://localhost:${PORT}`);
});

module.exports = app;
