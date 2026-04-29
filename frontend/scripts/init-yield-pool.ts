import { Connection, Keypair, PublicKey, SystemProgram } from "@solana/web3.js";
import { Program, AnchorProvider, Wallet } from "@coral-xyz/anchor";
import * as fs from "fs";
import * as path from "path";
import * as os from "os";

const idlPath = path.join(process.cwd(), "idl", "autofi_smart_contract.json");
const idl = JSON.parse(fs.readFileSync(idlPath, "utf-8"));

// Hardcoded for Devnet
const connection = new Connection("https://api.devnet.solana.com", "confirmed");

async function main() {
  console.log("Initializing Yield Pool...");

  // Get the default keypair from WSL (or Windows)
  const keypairPath = "\\\\wsl.localhost\\Ubuntu\\home\\lixinn\\.config\\solana\\id.json";
  const secretKeyString = fs.readFileSync(keypairPath, "utf-8");
  const secretKey = Uint8Array.from(JSON.parse(secretKeyString));
  const adminKeypair = Keypair.fromSecretKey(secretKey);

  const wallet = new Wallet(adminKeypair);
  const provider = new AnchorProvider(connection, wallet, { commitment: "confirmed" });
  
  const program = new Program(idl as any, provider);

  const [yieldPoolPda] = PublicKey.findProgramAddressSync(
    [Buffer.from("yield_pool")],
    program.programId
  );

  console.log("Yield Pool PDA:", yieldPoolPda.toBase58());
  console.log("Admin Address:", adminKeypair.publicKey.toBase58());

  try {
    const tx = await program.methods
      .initializeYieldPool()
      .accounts({
        yieldPool: yieldPoolPda,
        admin: adminKeypair.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .rpc();
    
    console.log("Initialization successful. Signature:", tx);

    // Now send some SOL to the Yield Pool to fund it for interest payouts
    console.log("Funding Yield Pool with 1 SOL...");
    const fundTx = await connection.requestAirdrop(yieldPoolPda, 1_000_000_000);
    await connection.confirmTransaction(fundTx, "confirmed");
    console.log("Funding successful.");

  } catch (err: any) {
    if (err.message.includes("already in use")) {
      console.log("Yield Pool already initialized.");
    } else {
      console.error("Error initializing:", err);
    }
  }
}

main().catch(console.error);
