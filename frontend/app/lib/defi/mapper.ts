/**
 * Strategy-to-DeFi Mapper
 * 
 * Maps human-readable strategy steps (from AI/backend) to actual
 * DeFi protocol calls (Jupiter, Marginfi, Staking).
 * 
 * Strategy steps from strategyConfig.js:
 *   "stake SOL"              → stakeToken(SOL)
 *   "swap SOL → USDC"        → executeSwap(SOL, USDC)
 *   "swap USDC → mSOL"       → executeSwap(USDC, mSOL)
 *   "lend USDC"              → depositToLending(USDC)
 *   "borrow SOL"             → borrowFromLending(SOL)
 *   "stake mSOL"             → stakeToken(mSOL)
 */

import { Connection, PublicKey } from "@solana/web3.js";
import { executeSwap, type SwapResult } from "./jupiter";
import { depositToLending, borrowFromLending, type LendingResult } from "./lending";
import { stakeToken, type StakingResult } from "./staking";

export type StepStatus = "pending" | "executing" | "done" | "failed";

export interface StepProgress {
  index: number;
  label: string;
  type: "swap" | "lend" | "borrow" | "stake";
  status: StepStatus;
  signature?: string;
  error?: string;
}

export type DeFiResult = SwapResult | LendingResult | StakingResult;

interface ParsedAction {
  type: "swap" | "lend" | "borrow" | "stake";
  inputToken: string;
  outputToken?: string;
}

/**
 * Parse a strategy step string into a structured action.
 */
function parseStep(step: string): ParsedAction {
  const s = step.toLowerCase().trim();

  // "swap SOL → USDC" or "swap USDC → mSOL"
  if (s.startsWith("swap")) {
    const match = step.match(/swap\s+(\w+)\s*[→>]\s*(\w+)/i);
    if (match) {
      return { type: "swap", inputToken: match[1], outputToken: match[2] };
    }
  }

  // "lend USDC"
  if (s.startsWith("lend")) {
    const match = step.match(/lend\s+(\w+)/i);
    return { type: "lend", inputToken: match ? match[1] : "USDC" };
  }

  // "borrow SOL"
  if (s.startsWith("borrow")) {
    const match = step.match(/borrow\s+(\w+)/i);
    return { type: "borrow", inputToken: match ? match[1] : "SOL" };
  }

  // "stake SOL" or "stake mSOL"
  if (s.startsWith("stake")) {
    const match = step.match(/stake\s+(\w+)/i);
    return { type: "stake", inputToken: match ? match[1] : "SOL" };
  }

  // Default: treat as staking
  return { type: "stake", inputToken: "SOL" };
}

/**
 * Build the initial progress array from strategy steps.
 */
export function buildStepProgress(steps: string[]): StepProgress[] {
  return steps.map((label, index) => {
    const parsed = parseStep(label);
    return {
      index,
      label,
      type: parsed.type,
      status: "pending" as StepStatus,
    };
  });
}

/**
 * Execute a full strategy step-by-step through DeFi protocols.
 * Calls onProgress after each step to update UI.
 * 
 * Amount is split proportionally across steps that require funds.
 */
export async function executeStrategy(
  steps: string[],
  amountSOL: number,
  connection: Connection,
  sendTransaction: (tx: any, conn: Connection) => Promise<string>,
  userPublicKey: PublicKey,
  onProgress: (stepProgress: StepProgress[]) => void,
): Promise<{ success: boolean; results: DeFiResult[] }> {
  const progress = buildStepProgress(steps);
  const results: DeFiResult[] = [];

  // Amount available for each step (first step gets full amount,
  // subsequent steps use remaining or proof amounts)
  let remainingAmount = amountSOL;

  for (let i = 0; i < steps.length; i++) {
    const action = parseStep(steps[i]);

    // Mark current step as executing
    progress[i].status = "executing";
    onProgress([...progress]);

    // Small delay for UX (show the step transition)
    await new Promise(r => setTimeout(r, 800));

    let result: DeFiResult;
    const stepAmount = i === 0 ? remainingAmount : Math.min(remainingAmount, 0.001);

    try {
      switch (action.type) {
        case "swap":
          result = await executeSwap(
            connection, sendTransaction, userPublicKey,
            action.inputToken, action.outputToken || "USDC", stepAmount,
          );
          break;

        case "lend":
          result = await depositToLending(
            connection, sendTransaction, userPublicKey,
            action.inputToken, stepAmount,
          );
          break;

        case "borrow":
          result = await borrowFromLending(
            connection, sendTransaction, userPublicKey,
            action.inputToken, stepAmount,
          );
          break;

        case "stake":
          result = await stakeToken(
            connection, sendTransaction, userPublicKey,
            action.inputToken, stepAmount,
          );
          break;

        default:
          result = await stakeToken(
            connection, sendTransaction, userPublicKey,
            "SOL", stepAmount,
          );
      }

      results.push(result);

      if (result.success) {
        progress[i].status = "done";
        progress[i].signature = result.signature;
        remainingAmount = Math.max(0, remainingAmount - stepAmount);
      } else {
        progress[i].status = "failed";
        progress[i].error = result.error;
        // Continue to next steps even if one fails (best-effort execution)
      }
    } catch (err: any) {
      progress[i].status = "failed";
      progress[i].error = err.message;
    }

    onProgress([...progress]);
  }

  const allSucceeded = progress.every(s => s.status === "done");
  return { success: allSucceeded, results };
}
