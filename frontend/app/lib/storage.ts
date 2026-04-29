/**
 * LocalStorage Persistence Layer
 *
 * Manages active vaults and transaction history.
 * All data survives page refresh and browser restart.
 */

const VAULTS_KEY = "autofi_vaults";
const HISTORY_KEY = "autofi_history";

/* ── Types ── */

export interface Vault {
  id: string;
  strategyName: string;
  tier: string; // Added for Stage 10 rebalancing
  steps: string[];
  expectedAPY: number;
  risk: string;
  amount: number;
  token: string;
  confidence: number;
  shortTermReturn: number;
  midTermReturn: number;
  longTermReturn: number;
  finalScore: number;
  deployedAt: number; // timestamp ms
}

export interface Transaction {
  id: string;
  type: "Deploy" | "Withdraw" | "Rebalance";
  strategyName: string;
  amount: number;
  token: string;
  timestamp: number;
  status: "Success" | "Failed";
}

/* ── Vault Operations ── */

export function getVaults(): Vault[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(VAULTS_KEY) || "[]");
  } catch {
    return [];
  }
}

export function saveVault(vault: Omit<Vault, "id">): Vault {
  const vaults = getVaults();
  const newVault: Vault = { ...vault, id: `vault-${Date.now()}` };
  vaults.push(newVault);
  localStorage.setItem(VAULTS_KEY, JSON.stringify(vaults));
  return newVault;
}

export function removeVault(id: string): void {
  const vaults = getVaults().filter((v) => v.id !== id);
  localStorage.setItem(VAULTS_KEY, JSON.stringify(vaults));
}

export function updateVault(updatedVault: Vault): void {
  const vaults = getVaults();
  const index = vaults.findIndex((v) => v.id === updatedVault.id);
  if (index !== -1) {
    vaults[index] = updatedVault;
    localStorage.setItem(VAULTS_KEY, JSON.stringify(vaults));
  }
}

export function hardReset(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(VAULTS_KEY);
  localStorage.removeItem(HISTORY_KEY);
}



export function updateVaultAmount(id: string, newAmount: number): void {
  const vaults = getVaults();
  const vault = vaults.find((v) => v.id === id);
  if (vault) {
    vault.amount = newAmount;
    // Reset deployedAt so yield calculation restarts from new amount
    vault.deployedAt = Date.now();
    localStorage.setItem(VAULTS_KEY, JSON.stringify(vaults));
  }
}

export function getVaultById(id: string): Vault | undefined {
  return getVaults().find((v) => v.id === id);
}

/* ── Transaction Operations ── */

export function getTransactions(): Transaction[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(HISTORY_KEY) || "[]");
  } catch {
    return [];
  }
}

export function addTransaction(tx: Omit<Transaction, "id">): Transaction {
  const txs = getTransactions();
  const newTx: Transaction = { ...tx, id: `tx-${Date.now()}` };
  txs.unshift(newTx); // newest first
  localStorage.setItem(HISTORY_KEY, JSON.stringify(txs));
  return newTx;
}

/* ── Growth Calculation ── */

/**
 * Calculates simulated current value of a vault based on APY and time elapsed.
 * Formula: amount * (1 + APY/100 * daysElapsed/365)
 */
export function calculateGrowth(vault: Vault): {
  currentValue: number;
  profit: number;
  daysElapsed: number;
} {
  const now = Date.now();
  const msElapsed = now - vault.deployedAt;
  const yearsElapsed = msElapsed / (1000 * 60 * 60 * 24 * 365.25);
  const profit = vault.amount * (vault.expectedAPY / 100) * yearsElapsed;
  const currentValue = vault.amount + profit;
  const daysElapsed = msElapsed / (1000 * 60 * 60 * 24);
  return { currentValue, profit, daysElapsed };
}

/**
 * Calculates total portfolio value across all vaults.
 */
export function getTotalPortfolio(): {
  totalValue: number;
  totalProfit: number;
  totalDeployed: number;
} {
  const vaults = getVaults();
  let totalValue = 0;
  let totalProfit = 0;
  let totalDeployed = 0;

  for (const vault of vaults) {
    const { currentValue, profit } = calculateGrowth(vault);
    totalValue += currentValue;
    totalProfit += profit;
    totalDeployed += vault.amount;
  }

  return { totalValue, totalProfit, totalDeployed };
}
