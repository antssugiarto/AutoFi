/**
 * Performance Tracker (Frontend → Backend Improve Loop)
 * 
 * Sends expected and actual profit data to the backend
 * so the AI can learn and adjust confidence scores.
 */

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

/**
 * Report deployment to backend (records expected profit).
 * Called after successful strategy execution.
 */
export async function reportDeployment(
  strategyName: string,
  walletAddress: string,
  amount: number,
  expectedAPY: number
): Promise<void> {
  try {
    await fetch(`${API_BASE}/performance/deploy`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ strategyName, walletAddress, amount, expectedAPY }),
    });
    console.log("[ImproveLoop] Deployment recorded:", strategyName);
  } catch (err) {
    console.warn("[ImproveLoop] Failed to report deployment:", err);
  }
}

/**
 * Report actual performance to backend (triggers confidence update).
 * Called when user visits dashboard or withdraws.
 */
export async function reportActualProfit(
  strategyName: string,
  walletAddress: string,
  amount: number,
  actualProfit: number,
  daysElapsed: number
): Promise<{ confidence?: number; avgAccuracy?: number } | null> {
  try {
    const res = await fetch(`${API_BASE}/performance/check`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ strategyName, walletAddress, amount, actualProfit, daysElapsed }),
    });
    const data = await res.json();
    console.log("[ImproveLoop] Performance checked:", data);
    return data;
  } catch (err) {
    console.warn("[ImproveLoop] Failed to report profit:", err);
    return null;
  }
}

/**
 * Fetch latest confidence scores from backend.
 */
export async function fetchConfidenceScores(): Promise<Record<string, {
  confidence: number;
  avgAccuracy: number;
  totalRecords: number;
}> | null> {
  try {
    const res = await fetch(`${API_BASE}/performance/confidence`);
    return await res.json();
  } catch (err) {
    console.warn("[ImproveLoop] Failed to fetch confidence:", err);
    return null;
  }
}

/**
 * Fetch performance history for a specific strategy.
 */
export async function fetchPerformanceHistory(strategyName: string) {
  try {
    const res = await fetch(`${API_BASE}/performance/history/${strategyName}`);
    return await res.json();
  } catch (err) {
    console.warn("[ImproveLoop] Failed to fetch history:", err);
    return null;
  }
}
