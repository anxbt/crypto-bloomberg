# CryptoDesk — The Crypto Bloomberg Terminal

> A Bloomberg-style crypto intelligence terminal built on SoSoValue infrastructure.
> Submitted for **SoSoValue Wave Hacks — Builder 1: One Person On-Chain Finance Business with Social Value**.

CryptoDesk gives retail and professional crypto traders a single interface to track live prices, ETF flows, macro events, crypto equities, and SSI index performance — all in one terminal-style dashboard.

---

## Features

- **Universal Search** — type any ticker (BTC, ETH, SOL), macro event (CPI, FOMC, NFP), crypto stock (MSTR, COIN, MARA), or SSI index (MAG7, LAYER1) and the entire terminal re-contextualises instantly
- **Three-Panel Layout** — Signal Feed (live news + sentiment), Chart Panel (price + ETF flow overlays, macro surprise history, stock + BTC treasury), Action Layer (live price hero, key stats, AI brief, bull/bear scenarios)
- **Live SoDEX Prices** — pulls real-time spot data from the SoDEX public API with 5-second refresh
- **ETF Flow Charts** — BTC/ETH ETF net inflow overlaid directly on the price chart
- **AI Market Briefs** — 60-word terminal-style briefs generated via OpenRouter (Mistral-7B), cached per context
- **Macro Event Tracker** — CPI/FOMC/NFP history vs BTC reaction chart, next release countdown, beat/miss scenario modelling
- **BTC Treasury Analysis** — MSTR and other crypto equity holdings, avg cost basis, unrealised gain, mNAV premium
- **SSI Index Dashboard** — MAG7 / LAYER1 constituent weights, 1M/3M/1Y returns, rebalancing signal
- **Smart Fallback Mode** — runs fully on rich mock data when API keys are absent, so the UI always works

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19, Vite 8, Tailwind CSS 4 |
| Charts | Recharts |
| State | Zustand |
| Backend | Node.js, Express 5 |
| Dev server | nodemon (auto-restart on file change) |
| Package manager | pnpm |
| Data — prices | SoDEX public API (no key required) |
| Data — market data | SoSoValue Open API |
| Data — AI briefs | OpenRouter (Mistral-7B Instruct) |

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│  Browser  localhost:5175                                         │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  TopBar  — universal search + quick-access pills         │   │
│  ├─────────────┬────────────────────────┬───────────────────┤   │
│  │ Signal Feed │    Chart & Context     │  Action Layer     │   │
│  │ (news tabs, │  (price + ETF flow,    │  (price hero,     │   │
│  │  macro      │   macro surprise,      │   key stats,      │   │
│  │  countdown) │   stock treasury)      │   AI brief,       │   │
│  │             │                        │   scenarios)      │   │
│  └─────────────┴────────────────────────┴───────────────────┘   │
└──────────────────────────┬──────────────────────────────────────┘
                           │  /api/*  (Vite proxy)
┌──────────────────────────▼──────────────────────────────────────┐
│  Backend  localhost:4000                                         │
│                                                                  │
│  /api/search          — classify query → {type, id}             │
│  /api/currency/:id    — snapshot + klines + scenarios           │
│  /api/news            — hot news + sentiment, deduped           │
│  /api/etf             — ETF AUM history + snapshot              │
│  /api/macro           — calendar, history, BTC reaction         │
│  /api/stock/:ticker   — price + BTC treasury + klines           │
│  /api/index/:ticker   — SSI index snapshot + constituents       │
│  /api/ai/brief        — OpenRouter AI brief (10 min cache)      │
│  /api/sodex/ticker    — live spot prices (5 sec cache)          │
│                                                                  │
│  In-memory TTL cache protects SoSoValue 20 req/min rate limit   │
│  Graceful fallback to rich mock data when no API keys set       │
└──────────────────────────────────────────────────────────────────┘
```

---

## Prerequisites

- **Node.js** v18 or later
- **pnpm** v8 or later — install with `npm install -g pnpm`
- A SoSoValue API key *(optional — app runs on rich mock data without it)*
- An OpenRouter API key *(optional — AI briefs fall back to curated copy)*

---

## Setup

### 1. Clone the repository

```bash
git clone <your-repo-url>
cd soso
```

### 2. Backend setup

```bash
cd backend
pnpm install
```

Copy the environment template and add your keys:

```bash
cp .env.example .env
```

Edit `.env`:

```env
# Required for live market data (optional — mock data used if blank)
SOSOVALUE_API_KEY=your_sosovalue_key_here
SOSOVALUE_BASE_URL=https://open-api.sosovalue.com/v1

# Required for AI market briefs (optional — curated copy used if blank)
OPENROUTER_API_KEY=your_openrouter_key_here

# Backend port (default: 4000)
PORT=4000
```

Start the backend:

```bash
# Development — auto-restarts when you edit any file in src/
pnpm dev

# Production
pnpm start
```

Expected output:

```
Backend listening on http://localhost:4000
  SoSoValue: live | OpenRouter: live
```

Verify with a health check:

```bash
curl http://localhost:4000/health
# → {"status":"ok","sosovalue":true,"openrouter":true}
```

### 3. Frontend setup

Open a **new terminal tab** and run:

```bash
cd frontend
pnpm install
pnpm dev
```

Vite starts on **http://localhost:5175**.

It automatically proxies all `/api/*` requests to the backend at `localhost:4000` — no extra CORS or network configuration needed.

### 4. Open the terminal

Go to **http://localhost:5175** in your browser.

The terminal auto-loads BTC on startup. Use the search bar or quick-access pills:

| Context | Example queries |
|---------|----------------|
| Crypto currency | `BTC` `ETH` `SOL` `BNB` `XRP` |
| Macro event | `CPI` `FOMC` `NFP` `PCE` `GDP` |
| Crypto equity | `MSTR` `COIN` `MARA` `RIOT` |
| SSI Index | `MAG7` `LAYER1` |

---

## Running Both Servers

Open two terminal tabs from the project root:

**Terminal 1 — Backend**
```bash
cd backend && pnpm dev
```

**Terminal 2 — Frontend**
```bash
cd frontend && pnpm dev
```

Both must be running simultaneously. The frontend will show a loading spinner and gracefully degrade to cached/mock data if the backend is temporarily unavailable.

---

## API Keys

### SoSoValue Open API
1. Sign up at [sosovalue.com](https://sosovalue.com)
2. Navigate to **Account → API Keys** and create a new key
3. Paste it into `backend/.env` as `SOSOVALUE_API_KEY`
4. The backend cache (30s for prices, 2min for news, 5min for ETF/stock data) keeps usage well within the 20 req/min rate limit

### OpenRouter
1. Sign up at [openrouter.ai](https://openrouter.ai)
2. Go to **Keys → Create Key**
3. Paste it into `backend/.env` as `OPENROUTER_API_KEY`
4. The app uses `mistralai/mistral-7b-instruct` — briefs are cached for 10 minutes so cost is minimal

### Running without API keys

Leave both keys blank — the app starts immediately with rich mock data covering all four context types (BTC currency, CPI macro, MSTR stock, MAG7 index). Every panel, chart, and tab is fully functional in this mode.

---

## Project Structure

```
soso/
├── backend/
│   ├── src/
│   │   ├── index.js              # Express entry point, CORS, health check
│   │   ├── cache.js              # In-memory TTL cache (Map-based)
│   │   ├── routes/
│   │   │   └── api.js            # All 9 API routes + response normalisation
│   │   ├── services/
│   │   │   ├── sosovalue.js      # SoSoValue API client (key read at call time)
│   │   │   ├── openrouter.js     # OpenRouter AI client
│   │   │   ├── binance.js        # Binance klines (public, no key required)
│   │   │   └── sodex.js          # SoDEX spot prices (public, no key required)
│   │   └── fallback/
│   │       └── data.js           # Rich mock data for all 4 contexts
│   ├── .env.example
│   └── package.json
│
└── frontend/
    ├── src/
    │   ├── pages/
    │   │   └── TerminalPage.jsx        # Root page, search orchestration
    │   ├── components/
    │   │   ├── TopBar/
    │   │   │   └── TopBar.jsx          # Search bar, pills, context badge, spinner
    │   │   ├── ThreePanelShell/
    │   │   │   └── ThreePanelShell.jsx # Three-column panel layout
    │   │   ├── panels/
    │   │   │   ├── SignalFeed.jsx       # News feed, category tabs, macro countdown
    │   │   │   ├── ChartPanel.jsx       # Recharts: price, macro, stock, index
    │   │   │   └── ActionLayer.jsx      # Stats, AI brief, scenarios, wave-2 CTA
    │   │   └── ErrorBoundary.jsx        # Catches render errors, shows retry
    │   ├── services/
    │   │   └── api.js                  # Frontend API client (Promise.allSettled)
    │   └── data/
    │       └── mockData.js             # Search suggestions, local mock klines
    └── package.json
```

---

## How It Works

1. **Search** — query is sent to `/api/search` which classifies it into one of four contexts: `currency`, `macro`, `stock`, or `index`
2. **Parallel load** — the frontend fires simultaneous requests (`Promise.allSettled`) for the market snapshot, news feed, and AI brief for that context
3. **Panel update** — all three panels re-render with the new context data at once; partial failures degrade gracefully (e.g. AI brief timeout doesn't block price data)
4. **Caching** — the backend caches each response with context-appropriate TTLs to stay within SoSoValue's rate limit without slowing the UI
5. **Normalisation** — a `normalizeSnap()` function maps SoSoValue's varying field names (`price`/`currentPrice`/`priceUsd`, `change24h`/`changePercent24h`, etc.) to a consistent frontend shape

---

## Built for SoSoValue Wave Hacks

CryptoDesk is built directly on SoSoValue's data infrastructure:

- **SSI Indices** — MAG7, LAYER1 and more are first-class citizens in the terminal
- **ETF Flow Data** — BTC and ETH spot ETF net inflow is overlaid on every price chart
- **BTC Treasury Tracker** — sourced from the SoSoValue treasury API
- **SoDEX Live Prices** — real-time spot prices from SoSoValue's own DEX

The goal: give every retail investor access to the same market intelligence that institutional desks pay tens of thousands of dollars a year for — free, open, and in real time.

---

## License

MIT
