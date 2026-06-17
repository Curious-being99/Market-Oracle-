export interface DOMLevel {
  price: number;
  size: number;
  mySize: number;
}

export interface FootprintRow {
  price: number;
  bidVolume: number;
  askVolume: number;
  isImbalanceBuy: boolean;
  isImbalanceSell: boolean;
}

export interface FootprintBar {
  timestamp: number;
  open: number;
  high: number;
  low: number;
  close: number;
  rows: FootprintRow[];
  totalVolume: number;
}

export interface CVDData {
  time: string;
  delta: number;
  price: number;
}

export interface SymbolSummary {
  symbol: string;
  name: string;
  type: "forex" | "index" | "crypto";
  currentPrice: number;
  pipSize: number;
  decimals: number;
  hasRealVolume: boolean;
  liquidityPools: Array<{ id: string; price: number; size: number; side: "buy" | "sell" }>;
}

export interface SymbolFullState extends SymbolSummary {
  cvd: CVDData[];
  dom: {
    bids: DOMLevel[];
    asks: DOMLevel[];
  };
  footprintCache?: Record<number, FootprintBar[]>;
  footprints: FootprintBar[];
  timeframe: number;
}
