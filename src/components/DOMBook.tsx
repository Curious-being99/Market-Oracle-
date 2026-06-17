import React, { useState, useEffect, useRef } from "react";
import { SymbolFullState } from "../types";
import { Shield, Zap, Clock } from "lucide-react";
import { formatTimestamp } from "../utils/timezone";

interface DOMBookProps {
  symbolState: SymbolFullState;
  timezone?: string;
}

export default function DOMBook({ symbolState, timezone = "local" }: DOMBookProps) {
  const bids = symbolState?.dom?.bids || [];
  const asks = symbolState?.dom?.asks || [];
  const symbol = symbolState.symbol || "EURUSD";
  const decimals = symbolState.decimals ?? 5;
  const currentPrice = symbolState.currentPrice || 0;

  const [currentTime, setCurrentTime] = useState<number>(Date.now());
  const containerRef = useRef<HTMLDivElement>(null);
  const spreadRef = useRef<HTMLDivElement>(null);

  // Auto-centering logic for the spread zone
  useEffect(() => {
    if (containerRef.current && spreadRef.current) {
      const container = containerRef.current;
      const spread = spreadRef.current;
      
      // Calculate center alignment
      const scrollPos = spread.offsetTop - (container.clientHeight / 2) + (spread.clientHeight / 2);
      
      // Execute scroll immediately on symbol change or initial load
      container.scrollTo({ top: scrollPos, behavior: 'instant' as ScrollBehavior });
    }
  }, [symbol]); // Re-center when symbol changes or bids/asks are populated

  // Also trigger centering once when depth data is first populated if it was empty
  const hasDepthData = bids.length > 0 || asks.length > 0;
  useEffect(() => {
    if (hasDepthData && containerRef.current && spreadRef.current) {
      const container = containerRef.current;
      const spread = spreadRef.current;
      const scrollPos = spread.offsetTop - (container.clientHeight / 2) + (spread.clientHeight / 2);
      container.scrollTo({ top: scrollPos, behavior: 'auto' });
    }
  }, [hasDepthData]);

  useEffect(() => {
    const interval = setInterval(() => setCurrentTime(Date.now()), 1000);
    return () => clearInterval(interval);
  }, []);

  // Calculate maximum size for relative bars
  const maxSize = Math.max(
    ...bids.map((b) => b.size),
    ...asks.map((a) => a.size),
    100
  );

  // Re-calculate the exact key bounds in sync with SovereignCheatRadar
  const pSize = symbolState.pipSize || 0.0001;
  const nearestBidPool = symbolState.liquidityPools?.find((p) => p.side === "buy");
  const nearestAskPool = symbolState.liquidityPools?.find((p) => p.side === "sell");

  return (
    <div className="osmotic-glass p-5 flex flex-col h-full font-mono relative overflow-hidden shadow-2xl" id="dom-panel">
      {/* Header */}
      <div className="flex justify-between items-center mb-4 pb-3 border-b border-indigo-500/10">
        <div>
          <h3 className="oracle-header-title text-xs flex items-center gap-1.5">
            <Shield size={12} className="text-rose-500/60" />
            Depth Of Market
            {!symbolState.hasRealVolume && (
               <span className="text-[9px] text-amber-500/60 border border-amber-500/10 px-1.5 py-0.5 rounded font-bold ml-1 uppercase font-mono">Price Only</span>
            )}
          </h3>
          <p className="oracle-glowing-value-red text-sm font-black mt-0.5 font-mono">
            {symbol} @ {currentPrice?.toFixed(decimals)}
          </p>
        </div>
        <div className="text-right flex flex-col items-end justify-center">
           <div className="flex items-center gap-1.5 text-slate-400 text-[10px] bg-slate-950/60 border border-indigo-500/10 px-2.5 py-1 rounded-lg font-mono">
             <Clock size={10} className="text-amber-500" />
             {formatTimestamp(currentTime, timezone)}
           </div>
        </div>
      </div>

      {/* DOM Ladder */}
      <div 
        ref={containerRef}
        className="flex-1 overflow-y-auto max-h-[380px] pr-1 scroll-smooth no-scrollbar"
      >
        <div className="grid grid-cols-3 gap-1 oracle-data-label py-1 border-b border-indigo-500/10 text-center select-none mb-1">
          <div>Bid Size</div>
          <div>Price ({symbol})</div>
          <div>Ask Size</div>
        </div>

        {/* ASKS (Order Book Sells) - Rendered High to Low */}
        {[...asks].reverse().map((ask, idx) => {
          const pct = Math.min(100, (ask.size / maxSize) * 100);
          
          // Detect if ask matches or is closest to MM Supply limit
          const isMmSupplyLevel = nearestAskPool && Math.abs(ask.price - nearestAskPool.price) < pSize * 0.4;

          return (
            <div
              key={`ask-${ask.price}-${idx}`}
              className={`grid grid-cols-3 gap-1 py-1 rounded transition-color items-center ${
                isMmSupplyLevel ? "border border-rose-500/40 bg-rose-950/10" : ""
              }`}
            >
              <div className="text-right pr-2">
                {isMmSupplyLevel && (
                  <span className="text-[8px] text-rose-500/60 font-bold uppercase tracking-tighter whitespace-nowrap">
                    Supply Zone
                  </span>
                )}
              </div>
              <div className={`text-center font-bold font-mono py-0.5 border border-rose-900/10 rounded text-xs ${
                isMmSupplyLevel ? "text-rose-500 font-bold" : "text-rose-500/50"
              }`}>
                {ask.price?.toFixed(decimals)}
              </div>
              <div className="relative pl-2 flex items-center justify-start h-full">
                <div
                  className="absolute left-0 top-0 bottom-0 bg-rose-950/30 rounded-r"
                  style={{ width: `${pct}%` }}
                />
                <span className="relative z-10 text-rose-400/80 ml-1.5">{ask.size}</span>
              </div>
            </div>
          );
        })}

        {/* SPREAD INDICATOR */}
        <div 
          ref={spreadRef}
          className="my-1.5 py-1 bg-gray-900 border-y border-gray-800 text-center text-xs font-semibold rounded text-amber-500-light tracking-wide font-sans text-gray-400"
        >
          SPREAD:{" "}
          <span className="text-amber-500/80 font-mono">
            {asks[0] && bids[0]
              ? Math.abs(asks[0].price - bids[0].price).toFixed(decimals)
              : "0.00000"}
          </span>
        </div>

        {/* BIDS (Order Book Buys) - Rendered High to Low */}
        {bids.map((bid, idx) => {
          const pct = Math.min(100, (bid.size / maxSize) * 100);
          
          // Detect if bid matches or is closest to MM Demand limit
          const isMmDemandLevel = nearestBidPool && Math.abs(bid.price - nearestBidPool.price) < pSize * 0.4;

          return (
            <div
              key={`bid-${bid.price}-${idx}`}
              className={`grid grid-cols-3 gap-1 py-1 rounded transition-color items-center ${
                isMmDemandLevel ? "border border-emerald-500/40 bg-emerald-950/10" : ""
              }`}
            >
              <div className="relative pr-2 flex items-center justify-end h-full">
                <div
                  className="absolute right-0 top-0 bottom-0 bg-emerald-950/30 rounded-l"
                  style={{ width: `${pct}%` }}
                />
                <span className="relative z-10 text-emerald-400/80 mr-1.5">{bid.size}</span>
              </div>
              <div className={`text-center font-bold font-mono py-0.5 border border-emerald-900/10 rounded text-xs ${
                isMmDemandLevel ? "text-emerald-500 font-bold" : "text-emerald-500/50"
              }`}>
                {bid.price?.toFixed(decimals)}
              </div>
              <div className="text-left pl-2">
                {isMmDemandLevel && (
                  <span className="text-[8px] text-emerald-500/60 font-bold uppercase tracking-tighter whitespace-nowrap">
                    Demand Zone
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-3 flex items-center justify-between text-[10px] text-gray-500 pt-3 border-t border-gray-800 font-sans">
        <span className="flex items-center gap-1">
          <Zap size={11} className="text-amber-400" />
          DIRECT L3 SECURE BROADCAST
        </span>
        <span>ZERO LAG FEEDS</span>
      </div>
    </div>
  );
}

