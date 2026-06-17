# Architecture: Institutional Market Sentinel

The Sentinel is an integrated full-stack research platform designed for high-frequency order flow analysis and narrative sentiment correlation.

## High-Level Overview

The system is designed as a centralized data-processing hub (server) that feeds a real-time reactive interface (client).

## Technical Stack

- **Runtime:** Node.js (TypeScript)
- **Frontend:** React + TailwindCSS + Recharts
- **Backend:** Express.js + Vite Middleware
- **Data Protocols:** WebSockets (Pyth, Binance, Bitget) + REST API Polling (Gate.io, Yahoo)
- **Intelligence Layer:**
    - **MLP (Multi-Layer Perceptron):** Processes tick data, order book imbalance, and CVD (Cumulative Volume Delta) to calculate institutional probability maps.
    - **mLL (Micro Language Learner):** Generative speech module for system state articulation.
    - **NLP Module:** Processes user intent and market context to synthesize sentiment scores.

## Component Breakdown

### 1. Data Ingestion Engine
Handles the live feeds, normalizes market data formats into internal `symbolsState`, and anchors liquidity pools.

### 2. Neural Processing Hub (`server.ts`)
The brains of the project.
- **`processRealTrade`**: Atomically updates price, order volume, and side.
- **`updateCVD`**: Monitors volume-delta pressure over time.
- **MLP/mLL Forward Pass**: Executes the neural inference loop whenever market parameters shift significantly via `recordTickAndTrainMLP` and the `liveMLPBrain`.

### 3. API Surface
- **`/api/*`**: Proxies requests for AI analysis and system telemetry, preventing exposure of research keys.
- **`/api/ai-pipeline-health`**: Telemetry endpoint exposing MSE (Mean Squared Error), training epochs, and dense connection parameters for the MLP.

### 4. Frontend Visualization
- **`src/components/`**: React components that subscribe to feed updates.
- **`AISentinel`**: The bridge between linguistic user queries and the neural backend.
- **`MainPageLoader`**: Manages the multi-phase initialization pipeline.

## Production Path

This project follows a bundled production flow:
1. `vite build` creates static assets.
2. `esbuild` bundles intermediate Typescript server into `dist/server.cjs`.
3. `node dist/server.cjs` acts as the unified, server-rendered application host.
