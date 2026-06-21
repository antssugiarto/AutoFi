import { NextRequest, NextResponse } from "next/server";

/**
 * Solana RPC Proxy
 *
 * Forwards JSON-RPC requests from the browser to Solana Mainnet RPC.
 * This bypasses CORS restrictions — the browser talks to our own Next.js
 * server (same origin), and the server talks to Solana (server-to-server).
 *
 * Endpoint: POST /api/rpc
 */

const MAINNET_RPC_ENDPOINTS = [
  "https://api.mainnet-beta.solana.com",
  "https://rpc.ankr.com/solana",
  "https://solana.public-rpc.com",
];

export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  // Try each endpoint in order until one succeeds
  for (const endpoint of MAINNET_RPC_ENDPOINTS) {
    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        console.warn(`[RPC Proxy] ${endpoint} returned ${response.status}, trying next...`);
        continue;
      }

      const data = await response.json();
      return NextResponse.json(data);
    } catch (err) {
      console.warn(`[RPC Proxy] ${endpoint} failed:`, err);
      continue;
    }
  }

  return NextResponse.json(
    { error: "All Solana RPC endpoints failed" },
    { status: 502 }
  );
}
