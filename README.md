# ChainCred – Ethereum Reputation Passport (ETHGlobal)

![Logo](public/logo.png)

Badges: Next.js 14 • React 18 • Tailwind • Hardhat • Solidity • Ethers v6 • wagmi/viem • The Graph • ZK (snarkjs/circomlib)

### What is this?
ChainCred issues a non-transferable Reputation Passport SBT that proves on-chain activity quality and, optionally, human uniqueness via Self Protocol–backed zero-knowledge verification. Apps can gate features (voting, airdrops, access) using the passport + identity proof to resist Sybil attacks.

### Why it matters
- Stronger Sybil resistance for DAOs, airdrops, and consumer apps
- Portable, privacy-preserving reputation that follows the person (not wallets)
- Composable: integrates Self Protocol, The Graph, and cross-chain signals

---

## Architecture (high level)
- Frontend: Next.js App Router in `app/` with reusable UI in `components/`
- API routes: `app/api/*` for score, reputation, identity verification, health/monitoring, and docs
- Smart contracts: SBT + gates + verifier in `contracts/` (Hardhat)
- On-chain data: GraphQL via The Graph (`lib/the-graph*.ts`, `lib/graphClient.ts`) and GRC-20 signals
- ZK and identity: Self Protocol integrations + ZK helpers in `lib/self-protocol-*.ts`, `lib/zk-circuit.ts`
- Integrations: Hypergraph, Zero-G AI, and more in `lib/*-integration.ts`

Data flow (happy path)
1) Connect wallet → 2) Fetch reputation inputs (The Graph, integrations) → 3) Compute score server/client → 4) Verify identity (ZK, Self Protocol) → 5) Mint SBT (`ReputationPassport`) → 6) Gate access with `ReputationGate`

---

## Features & workflows
- Reputation scoring: see `lib/scoring.ts`, UI `components/score-meter.tsx`, `components/scoring-explanation.tsx`
- SBT minting: `contracts/ReputationPassport.sol`, UI `components/sbt-minter.tsx`, `components/real-sbt-minter.tsx`
- Access control: `contracts/ReputationGate.sol` + `components/gate.tsx`
- Identity verification (Self Protocol): `contracts/SelfProtocolVerifier.sol`, `lib/self-protocol*.ts`, `components/self-protocol-verification*.tsx`
- End-to-end verification flow: `components/verification-flow.tsx`, pages in `app/verification*`
- Deployment status UI: `app/deployment-status/page.tsx`
- Demos: airdrop (`app/demo/airdrop/page.tsx`) and vote (`app/demo/vote/page.tsx`)

Key API routes
- `app/api/score/route.ts`: compute/return score
- `app/api/reputation/route.ts`: reputation endpoints
- `app/api/self-verify/*`: Self Protocol routes (init, callback, webhook)
- `app/api/integrated-score/route.ts`: fused scoring
- `app/api/monitoring/route.ts`, `app/api/health/route.ts`: ops
- `app/api/docs/route.ts`: API docs feed

---

## Side tracks (integrations and experiments)
- Self Protocol track: identity proofs with privacy (`docs/self-protocol-integration.md`)
- ZK protocol track: circuits/flows and guarantees (`docs/zk-protocol.md`, `lib/zk-circuit.ts`)
- The Graph + GRC-20: on-chain activity ingestion (`lib/the-graph*.ts`, `lib/grc20-integration.ts`)
- Hypergraph signals: network intelligence integration (`lib/hypergraph-integration.ts`)
- Zero-G AI heuristics: enrichment layers (`lib/zero-g-ai.ts`, `lib/zero-g-enhanced.ts`)
- QR flows and formats: deep-linking and verification UX (`lib/qr-code-formats.ts`, `components/qr-code-tester.tsx`)
- Wallet adapters playgrounds: RainbowKit/thirdweb/walletconnect variants under `components/*wallet*`

---

## Tech stack
- Web app: Next.js 14 (App Router), React 18, Tailwind, Radix UI
- Web3: wagmi, viem, RainbowKit, thirdweb (optional), Ethers v6
- Contracts: Solidity 0.8.19/0.8.28, Hardhat, OpenZeppelin
- Data: GraphQL, `graphql-request`, The Graph, GRC-20
- ZK: snarkjs, circomlib (Poseidon), privacy-first verification flows
- Tooling: TypeScript, Vercel, PostCSS

---

## Contracts
- `ReputationPassport.sol`: non-transferable SBT with score view helpers
- `ReputationGate.sol`: access checks combining score + identity
- `ReputationOracle.sol`: score oracle updates
- `SelfProtocolVerifier.sol`: Self identity proof verification
- `CrossChainReputation.sol`: unify signals across chains

Compiled and deployed with Hardhat. See scripts in `scripts/*.js` and config in `hardhat.config.js`.

Contract addresses are centralized in `lib/contract-addresses.ts` (update after deploys).

---

## Getting started (local)
1) Install deps
```bash
pnpm install
# or npm install / yarn
```
2) Env
```bash
cp env.example .env
# fill RPC URLs, PRIVATE_KEY, explorer API keys
```
3) Run dev
```bash
pnpm dev
# Next.js on http://localhost:3000
```
4) Compile contracts
```bash
pnpm compile
```
5) Local deploy (Hardhat)
```bash
pnpm deploy:hardhat
```

Useful pages
- `/verification` end-to-end flow
- `/dashboard`, `/backend-dashboard` internal views
- `/demo/airdrop`, `/demo/vote` demos
- `/deployment-status` deployment inspection

---

## Deploying to testnet/mainnet
- Quickstart: `scripts/deploy-real-contracts.js` with networks in `hardhat.config.js`
- Guides: see `SETUP_GUIDE.md`, `DEPLOYMENT_GUIDE.md`, and `MAINNET_DEPLOYMENT.md`

Common scripts
```bash
pnpm deploy:sepolia
pnpm deploy:polygon
pnpm deploy:mainnet
pnpm verify:sepolia
```

After deployment, update `lib/contract-addresses.ts` and verify via `/deployment-status`.

---

## How it works (deeper)
- Score computation: `lib/scoring.ts` aggregates activity via The Graph and integrations
- Identity proofs: Self Protocol ZK proof generation and verification (`docs/self-protocol-integration.md`, `docs/zk-protocol.md`)
- SBT lifecycle: user meets threshold → mint SBT → used by `ReputationGate` for access
- APIs: server routes orchestrate fetching, verification, and responses

"One human, one reputation": SBT is non-transferable and bound to identity proofs while preserving privacy.

---

## Environment
Copy `env.example` to `.env` and provide:
- `PRIVATE_KEY`, `SEPOLIA_RPC_URL`, `MAINNET_RPC_URL`, `CELO_ALFAJORES_RPC_URL`, etc.
- Explorer API keys: `ETHERSCAN_API_KEY`, `POLYGONSCAN_API_KEY`, `CELO_EXPLORER_API_KEY`

---

## Roadmap & future impact
- Stronger anti-Sybil guarantees via richer signals and multi-attribute ZK proofs
- Cross-chain portability and reputation bridging via `CrossChainReputation`
- Safer governance and fairer airdrops through verifiable uniqueness
- Privacy-first attestations enabling consumer UX without doxxing
- Ecosystem impact: common, composable reputation primitive that protocols can adopt

---

## References
- Setup: `SETUP_GUIDE.md`
- Deployment: `DEPLOYMENT_GUIDE.md`, `MAINNET_DEPLOYMENT.md`
- Self Protocol: `docs/self-protocol-integration.md`
- ZK protocol: `docs/zk-protocol.md`
- APIs: browse `app/api/*` and `app/api/docs/route.ts`

