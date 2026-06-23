/**
 * Rebalance Tracker
 * 
 * Communication layer for Stage 10 (Monitoring + Rebalance).
 */

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

export interface RebalanceSuggestion {
  triggered: boolean;
  reason: string | null;
  optimalStrategy?: {
    name: string;
    expectedAPY: number;
    risk: string;
    steps: string[];
  };
}

/**
 * Checks if current strategy should be rebalanced.
 */
export async function checkRebalance(strategyName: string, tier: string): Promise<RebalanceSuggestion> {
  try {
    const response = await fetch(`${BACKEND_URL}/rebalance/check?strategyName=${strategyName}&tier=${tier}`);
    if (!response.ok) throw new Error("Failed to check rebalance");
    return await response.json();
  } catch (error) {
    console.error("[Rebalance] Check failed:", error);
    return { triggered: false, reason: null };
  }
}
