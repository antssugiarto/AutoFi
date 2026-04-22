/**
 * API Service Layer
 *
 * Handles communication between the Next.js frontend
 * and the Express backend intent engine (POST /intent).
 */

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

/* ── Request / Response Interfaces ── */

export interface IntentRequest {
  wallet: string;
  amount: number;
  token: string;
  strategy: string; // backend tier: "low" | "stable" | "balanced" | "aggressive"
}

export interface StrategyResult {
  name: string;
  steps: string[];
  expectedAPY: number;
  risk: string;
}

export interface BacktestResult {
  shortTermReturn: number;
  midTermReturn: number;
  longTermReturn: number;
  finalScore: number;
  confidence: number;
}

export interface IntentResponse {
  strategy: StrategyResult;
  backtest: BacktestResult;
}

export interface IntentError {
  error: string;
}

/* ── API Functions ── */

/**
 * Sends the user's intent to the backend engine and returns
 * the best strategy + multi-window backtest results.
 *
 * @throws {Error} on network failure or validation error from backend
 */
export async function submitIntent(data: IntentRequest): Promise<IntentResponse> {
  const res = await fetch(`${API_BASE}/intent`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  const body = await res.json();

  if (!res.ok) {
    // Backend returns { error: "..." } on validation failure
    throw new Error((body as IntentError).error || "An unexpected error occurred.");
  }

  return body as IntentResponse;
}
