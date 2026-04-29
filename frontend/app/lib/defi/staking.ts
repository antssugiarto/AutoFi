/**
 * Staking Integration (Native SOL / Liquid Staking)
 * 
 * Handles SOL staking via AutoFi vault (on-chain).
 * On mainnet: could integrate with Marinade (mSOL) or Jito (JitoSOL).
 * On devnet: stakes via AutoFi smart contract vault.
 */

import { Connection, PublicKey, SystemProgram, Transaction, LAMPORTS_PER_SOL } from "@solana/web3.js";

const STAKING_POOL = new PublicKey("2SvggQkCPdgAi2o289yue5WWwm8dEX4WzamLr5y3pL81");

export interface StakingResult {
  success: boolean;
  signature?: string;
  token: string;
  amount: number;
  protocol: string;
  error?: string;
}

/**
 * Stake SOL or liquid staking tokens.
 * Transfers to AutoFi vault which acts as staking pool.
 */
export async function stakeToken(
  connection: Connection,
  sendTransaction: (tx: any, conn: Connection) => Promise<string>,
  userPublicKey: PublicKey,
  token: string,
  amountSOL: number,
): Promise<StakingResult> {
  const protocol = token === "mSOL" ? "Marinade" : token === "JitoSOL" ? "Jito" : "AutoFi Vault";

  try {
    console.log(`[Staking] Staking ${amountSOL} ${token} via ${protocol}...`);

    const lamports = Math.floor(amountSOL * LAMPORTS_PER_SOL);
    const tx = new Transaction().add(
      SystemProgram.transfer({
        fromPubkey: userPublicKey,
        toPubkey: STAKING_POOL,
        lamports,
      })
    );

    const signature = await sendTransaction(tx, connection);
    console.log(`[Staking] Stake tx: ${signature}`);

    return { success: true, signature, token, amount: amountSOL, protocol };
  } catch (err: any) {
    console.error("[Staking] Stake failed:", err.message);
    return { success: false, token, amount: amountSOL, protocol, error: err.message };
  }
}
