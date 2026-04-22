/**
 * Goal ↔ Strategy Mapping
 *
 * Maps the frontend GoalType identifiers to the backend
 * strategy tiers expected by the intent engine.
 *
 * Frontend Goal        → Backend Strategy Tier
 * ─────────────────────────────────────────────
 * maximize_profit      → aggressive
 * grow_safely          → low
 * cheapest_swap        → stable
 * auto_portfolio       → balanced
 */

import type { GoalType } from "./types";

const GOAL_TO_STRATEGY: Record<GoalType, string> = {
  maximize_profit: "aggressive",
  grow_safely: "low",
  cheapest_swap: "stable",
  auto_portfolio: "balanced",
};

/**
 * Converts a frontend goal ID to the corresponding backend strategy tier.
 *
 * @param goal - A GoalType string from the frontend
 * @returns The backend strategy tier string
 */
export function mapGoalToStrategy(goal: string | null): string {
  if (!goal) return "balanced"; // default fallback
  return GOAL_TO_STRATEGY[goal as GoalType] || "balanced";
}
