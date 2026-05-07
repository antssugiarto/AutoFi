<div align="center">

# AutoFi

**Automated DeFi Strategy Engine**

[![Solana](https://img.shields.io/badge/Solana-Devnet-9945FF?logo=solana&logoColor=white)](https://solana.com)
[![Next.js](https://img.shields.io/badge/Next.js-15-black?logo=next.js)](https://nextjs.org)
[![Anchor](https://img.shields.io/badge/Anchor-Framework-blue)](https://www.anchor-lang.com)
[![License: ISC](https://img.shields.io/badge/License-ISC-green.svg)](https://opensource.org/licenses/ISC)

</div>

---

## Overview

AutoFi eliminates the complexity of DeFi by transforming user **intents** (e.g., "Maximize my profit" or "Grow safely") into optimized, multi-step on-chain strategies — all automated by an AI engine.

**Key Features:**
- **Intent-Based Execution** — Users pick a goal, not a protocol. The AI engine selects the optimal DeFi path.
- **Live Performance Tracking** — Continuously monitors deployed strategies with accuracy scoring and confidence metrics.
- **Smart Rebalancing** — Detects underperforming vaults and suggests optimal strategy swaps.
- **On-Chain Vaults** — Funds are secured via Anchor smart contracts on Solana Devnet.
- **Full Wallet Session Protection** — All app pages require an active wallet connection.

---

## Architecture

```
AutoFi/
├── frontend/          → Next.js 15 (App Router) — UI & wallet integration
│   ├── app/
│   │   ├── components/    → Reusable UI components (Navbar, Sidebar, WalletGuard, etc.)
│   │   ├── lib/           → Core logic (storage, API client, DeFi integrations)
│   │   │   └── defi/      → Protocol adapters (Jupiter, Lending, Staking)
│   │   ├── dashboard/     → Protected dashboard pages (Overview, Strategy, History)
│   │   ├── strategy/      → Goal selection page
│   │   ├── amount/        → Investment amount input
│   │   ├── preview/       → Strategy preview before execution
│   │   ├── execute/       → On-chain transaction execution
│   │   └── withdraw/      → Vault withdrawal flow
│   └── idl/               → Anchor IDL for smart contract interaction
│
├── backend/           → Express.js — AI Strategy Engine & Performance API
│   └── src/
│       ├── controllers/   → Route handlers (intent, performance, rebalance)
│       ├── services/      → Business logic (strategy scoring, backtest, confidence)
│       ├── config/        → Strategy configurations and pool definitions
│       └── utils/         → Shared helpers
│
└── autofi-smart-contract/ → Anchor/Rust — Solana Program
    ├── programs/          → Smart contract source (vault deposit/withdraw)
    └── tests/             → Integration tests
```

---

## How It Works

```
┌─────────────┐     ┌──────────────┐     ┌────────────────┐     ┌──────────────┐
│  User picks │ ──→ │  AI Engine   │ ──→ │  Strategy      │ ──→ │  On-Chain    │
│  a Goal     │     │  scores &    │     │  Preview &     │     │  Execution   │
│  (Intent)   │     │  backtests   │     │  Confirmation  │     │  via Anchor  │
└─────────────┘     └──────────────┘     └────────────────┘     └──────────────┘
                                                                        │
                          ┌─────────────────────────────────────────────┘
                          ▼
                   ┌──────────────┐     ┌──────────────┐
                   │  Performance │ ──→ │  Rebalance   │
                   │  Monitoring  │     │  Suggestions │
                   │  (Accuracy,  │     │  (Auto-swap  │
                   │   Confidence)│     │   strategy)  │
                   └──────────────┘     └──────────────┘
```

1. **Intent** — User selects a DeFi goal (e.g., Maximize Profit, Grow Safely).
2. **AI Scoring** — Backend scores all available strategies using multi-window backtesting (7d/30d/90d returns) and selects the optimal one.
3. **Preview** — User reviews the selected strategy, expected APY, risk level, and AI confidence score.
4. **Execution** — Funds are deposited into an Anchor vault on Solana Devnet. DeFi steps (swap, lend, stake) are executed.
5. **Monitoring** — The system continuously checks actual vs. expected profit, updating accuracy and confidence using a weighted moving average.
6. **Rebalancing** — If a better strategy is detected, the system suggests an auto-rebalance.

---

## Quick Start

### Prerequisites

- [Node.js](https://nodejs.org/) v18+
- [Solana CLI](https://docs.solana.com/cli/install-solana-cli-tools) (for smart contract deployment)
- [Anchor](https://www.anchor-lang.com/docs/installation) (for smart contract development)
- A Solana wallet (e.g., [Phantom](https://phantom.app/)) set to **Devnet**

### 1. Clone the Repository

```bash
https://github.com/antssugiarto/AutoFi.git
cd AutoFi
```

### 2. Start the Backend (AI Engine)

```bash
cd backend
npm install
npm start
# Server runs on http://localhost:3001
```

### 3. Start the Frontend

```bash
cd frontend
npm install
npm run dev
# App runs on http://localhost:3000
```

### 4. Connect Wallet

1. Open `http://localhost:3000` in your browser.
2. Switch your Phantom wallet to **Devnet**.
3. Click **"Connect Wallet"** → start using AutoFi!

### 5. Smart Contract (Optional — already deployed)

The smart contract is already deployed on Devnet. To redeploy:

```bash
cd autofi-smart-contract
anchor build
anchor deploy
```

---

## Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | Next.js 15, TypeScript, Solana Wallet Adapter |
| **Backend** | Express.js, Node.js |
| **Smart Contract** | Anchor Framework, Rust |
| **Blockchain** | Solana (Devnet) |
| **Styling** | Custom CSS Design System (Material 3 inspired) |

---

## Key Files

| File | Purpose |
|---|---|
| `frontend/app/lib/storage.ts` | Client-side vault & transaction state management |
| `frontend/app/lib/performanceTracker.ts` | Frontend ↔ Backend performance reporting loop |
| `frontend/app/components/wallet-guard.tsx` | Route protection — redirects if wallet not connected |
| `backend/src/services/strategyService.js` | AI strategy scoring & multi-window backtesting |
| `backend/src/services/performanceService.js` | Accuracy tracking & confidence calculation |
| `backend/data/performance.json` | Persistent performance history storage |

---

## License

ISC © AutoFi Team
