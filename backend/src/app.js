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
app.use(cors({
  origin: ["http://localhost:3000", "http://localhost:3001"],
  methods: ["GET", "POST"],
}));
app.use(express.json());

// --- Routes ---
app.post("/intent", handleIntent);

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
