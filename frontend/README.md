# AutoFi Frontend

Next.js 15 (App Router) application with TypeScript, Solana Wallet Adapter, and a custom Material 3-inspired design system.

## Development

```bash
npm install
npm run dev
```

Runs on `http://localhost:3000`. Requires the backend running on port `3001`.

## Structure

- `app/` — Pages and route groups (strategy → amount → preview → execute → dashboard)
- `app/components/` — Shared UI components (Navbar, Sidebar, WalletGuard, etc.)
- `app/lib/` — Core utilities (storage, API client, type definitions)
- `app/lib/defi/` — DeFi protocol adapters (Jupiter swap, lending, staking)
- `idl/` — Anchor IDL for smart contract interaction
- `public/` — Static assets (logo, favicon)
