/**
 * Solana Balance Fetcher
 *
 * Fetches real SOL balance from the connected wallet
 * using the Solana RPC connection.
 */

import { Connection, PublicKey, LAMPORTS_PER_SOL } from "@solana/web3.js";

/**
 * Gets the SOL balance of a wallet address.
 * @returns Balance in SOL (not lamports)
 */
export async function getSolBalance(
  connection: Connection,
  publicKey: PublicKey
): Promise<number> {
  try {
    const lamports = await connection.getBalance(publicKey);
    return lamports / LAMPORTS_PER_SOL;
  } catch (err) {
    console.error("Failed to fetch SOL balance:", err);
    return 0;
  }
}
