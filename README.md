# Institutional Market Sentiniel & Analysis Engine

This repository contains a high-fidelity market research and hypothesis modeling engine. It utilizes real-time WebSocket ingestion, advanced neural network processing (MLP/mLL), and natural language processing (NLP) to provide institutional-grade tape analysis.

## Core Features

- **Real-Time Data Ingestion:** Synchronous connections to high-liquidity market feeds (Pyth, Binance, Gate.io).
- **Neural Pipeline (mLL/MLP):** Continuous online backpropagation of ticker data to predict institutional posture and bias.
- **NLP Analysis:** Deep analysis of market narratives and user queries using a custom linguistic engine.
- **Full-Stack Architecture:** Node.js/Express backend with a responsive React frontend.

## Getting Started

### Prerequisites
- Node.js (v20+)
- npm

### Installation
```bash
npm install
```

### Running in Development
```bash
npm run dev
```

### Building for Production
```bash
npm run build
```
This will bundle the frontend and compile the backend into `dist/server.cjs`.

### Running in Production
```bash
npm start
```

## Architecture

Please see `ARCHITECTURE.md` for a detailed technical breakdown.
