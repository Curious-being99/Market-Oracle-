import React, { useState } from "react";
import { SymbolFullState, FootprintBar } from "../types";
import { formatTimestamp, getSessionMarker } from "../utils/timezone";
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown, 
  Target, 
  HelpCircle, 
  Layers, 
  Activity, 
  Percent,
  CheckCircle2,
  BookOpen,
  Shield,
  ShieldAlert,
  Sliders
} from "lucide-react";

interface FootprintChartProps {
  symbolState: SymbolFullState;
  timezone?: string;
}

export default function FootprintChart({ symbolState, timezone = "local" }: FootprintChartProps) {
  const footprints = symbolState.footprints || [];
  const [showExplanation, setShowExplanation] = useState<boolean>(true);
  const [hftGuard, setHftGuard] = useState<boolean>(true);

  // Helper to determine decs
  const decimalPlaces = symbolState.decimals ?? 5;

  return (
    <div className="osmotic-glass p-5 flex flex-col h-full overflow-hidden shadow-2xl relative" id="footprint-panel">
      
      {/* Header Info */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-4 pb-4 border-b border-indigo-500/10 gap-3">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-1 px-2 rounded bg-amber-500/10 border border-amber-500/20">
              <BarChart3 size={14} className="text-amber-400" />
            </div>
            <h3 className="oracle-header-title text-xs">
              Order Flow Footprint ({symbolState.timeframe >= 43200 ? "1M" : symbolState.timeframe >= 10080 ? "1W" : symbolState.timeframe >= 1440 ? "1D" : symbolState.timeframe >= 60 ? `${symbolState.timeframe/60}H` : `${symbolState.timeframe}M`} Profile)
            </h3>
            <span className={`text-[9px] px-1 rounded font-mono font-bold opacity-60 border ${symbolState.type === 'index' ? 'text-indigo-400 border-indigo-500/20' : 'text-emerald-500 border-emerald-500/10'}`}>
              {symbolState.type === 'index' ? 'CME INDEX' : 'TICK FEED'}
            </span>
          </div>
          <p className="oracle-data-label mt-1">
            Aggressive buying is printed on the ASK side (right), aggressive selling is printed on the BID side (left).
          </p>
        </div>
        
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => setHftGuard(!hftGuard)}
            title={hftGuard ? "HFT Volatility Noise Filter is ACTIVE. Micro-volume spikes at bar extremes are filtered dynamically." : "HFT Volatility Noise Filter is OFF. Shows raw micro-volume ticks."}
            className={`flex items-center gap-1 px-2.5 py-1 text-[10px] font-mono font-bold uppercase rounded border transition-all ${
              hftGuard 
                ? "bg-emerald-950/40 border-emerald-500/35 text-emerald-400 hover:bg-emerald-950/60" 
                : "bg-rose-950/40 border-rose-500/35 text-rose-400 hover:bg-rose-950/60 animate-pulse"
            }`}
          >
            {hftGuard ? <Shield size={11} className="text-emerald-400" /> : <ShieldAlert size={11} className="text-rose-400" />}
            HFT GUARD: {hftGuard ? "ACTIVE (FLTRD)" : "OFF (RAW NOISE)"}
          </button>

          <button
            onClick={() => setShowExplanation(!showExplanation)}
            className="flex items-center gap-1 px-2.5 py-1 text-[10px] font-mono font-bold uppercase rounded border border-gray-700 bg-gray-800/40 text-gray-300 hover:text-white hover:bg-gray-800 hover:border-gray-600 transition-all"
          >
            <HelpCircle size={11} className="text-amber-400" />
            {showExplanation ? "Hide Interactive Blueprint" : "Show Legend Guide"}
          </button>
          
          <div className="flex gap-2 text-[10px] font-mono">
            <div className="flex items-center gap-1.5 border-b border-emerald-500/20 px-1 py-0.5">
              <span className="w-1 h-1 bg-emerald-600/40 rounded-full" />
              <span className="text-emerald-500/70 font-bold uppercase">Ask Imbalance</span>
            </div>
            <div className="flex items-center gap-1.5 border-b border-rose-500/20 px-1 py-0.5">
              <span className="w-1 h-1 bg-rose-600/40 rounded-full" />
              <span className="text-rose-500/70 font-bold uppercase">Bid Imbalance</span>
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Blueprint Explanation */}
      {showExplanation && (
        <div className="mb-4 p-3.5 bg-gray-950/80 border border-gray-800/90 rounded-lg text-xs leading-relaxed font-sans text-gray-300 relative overflow-hidden transition-all duration-300">
          <div className="absolute right-0 top-0 opacity-[0.03] pointer-events-none p-4">
            <BookOpen size={100} className="text-white" />
          </div>
          <h4 className="text-[11px] font-mono font-bold text-amber-500/70 uppercase tracking-widest flex items-center gap-1.5 mb-2">
            <CheckCircle2 size={12} />
            Sovereign Institutional Auction Engine
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-gray-400 text-[11px] font-mono">
            <div className="bg-[#121829] p-2.5 rounded border border-gray-800/60 hover:border-rose-500/20 transition-colors">
              <span className="text-rose-500/90 font-bold block mb-1">⚡ STACKED IMBALANCES</span>
              Diagonal buying/selling orders (≥ 2.5x volume imbalance) at 3+ consecutive price levels. Confirms heavy institutional blocks.
            </div>
            <div className="bg-[#121829] p-2.5 rounded border border-gray-800/60 hover:border-amber-500/20 transition-colors">
              <span className="text-amber-500/90 font-bold block mb-1">📍 NAKED POC (NPOC)</span>
              Highest volume node of a bar that has never been pierced by subsequent candles. Strongest magnetic targets for major executions.
            </div>
            <div className="bg-[#121829] p-2.5 rounded border border-gray-800/60 hover:border-violet-500/20 transition-colors">
              <span className="text-violet-400/90 font-bold block mb-1">⚠️ UNFINISHED AUCTION (UA)</span>
              Non-zero volumes print at extremes. Prone to micro-tick volatility noise on 1M/5M feeds. Cross-verify stack signals on 30M/1H profiles to separate systemic campaigns.
            </div>
            <div className="bg-[#121829] p-2.5 rounded border border-gray-800/60 hover:border-emerald-500/20 transition-colors">
              <span className="text-emerald-500/90 font-bold block mb-1">📈 DIAGONAL MATCHING</span>
              Aggressive market buys (Ask) match diagonally with aggressive sells (Bid) at the tick level below (Ask_P vs Bid_[P-1]). Correct institutional rule.
            </div>
          </div>
        </div>
      )}

      {/* Lower Timeframe Volatility Risk Indicator / Multi-Timeframe warning banner */}
      {symbolState.timeframe < 15 && (
        <div className={`mb-4 p-3 rounded-lg border text-[11px] font-mono flex flex-col md:flex-row justify-between items-start md:items-center gap-2 transition-all duration-200 ${
          hftGuard 
            ? "bg-emerald-950/10 border-emerald-500/20 text-emerald-400" 
            : "bg-amber-950/20 border-amber-500/20 text-amber-300"
        }`}>
          <div className="flex items-center gap-2">
            <ShieldAlert size={14} className={hftGuard ? "text-emerald-400" : "text-amber-400 animate-bounce"} />
            <div>
              <span className="font-bold uppercase">
                {hftGuard ? "⚡ HFT DYNAMIC FILTER ACTIVE: " : "⚠️ TIMEFRAME NOISE WARNING: "}
              </span>
              <span>
                {hftGuard 
                  ? `${symbolState.timeframe}M timeframe volatility is protected. Unfinished Auction thresholds are scaled dynamically based on bar density.` 
                  : `Raw ${symbolState.timeframe}M stream. Volatile micro-volume fills can trigger false Unfinished Auctions (UA). Activate HFT Guard to protect executions.`}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-1 bg-[#121829] px-2 py-1 rounded border border-gray-800 text-[9px] uppercase font-bold tracking-wider text-indigo-400 flex-shrink-0">
            <span>Confirm on 30M / 1H profiles</span>
          </div>
        </div>
      )}

      {/* Main footprint visualization layout */}
      <div className="flex-1 overflow-x-auto overflow-y-hidden py-2 min-h-[460px] no-scrollbar">
        {footprints.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-[400px] text-gray-500 font-mono text-xs">
            <Activity className="animate-pulse text-indigo-400 mb-2" size={24} />
            <p>Awaiting live order flow volume streams...</p>
          </div>
        ) : (
          <div className="flex gap-6 h-full items-stretch min-w-[700px] justify-start px-2">
            {footprints.map((bar: FootprintBar, idx: number) => {
              // Calculate POC
              let maxRowVol = 0;
              let pocPrice = 0;
              let barBidSum = 0;
              let barAskSum = 0;

              bar.rows.forEach((r) => {
                const tot = r.bidVolume + r.askVolume;
                barBidSum += r.bidVolume;
                barAskSum += r.askVolume;
                if (tot > maxRowVol) {
                  maxRowVol = tot;
                  pocPrice = r.price;
                }
              });

              // 1. Math-backed Diagonal Institutional Imbalances (diagonal comparison)
              const imbalanceRatio = 2.5; // Strict institutional default
              const minImbalanceVol = 12; // Filter threshold to ensure material volume

              const rowsWithImbalances = bar.rows.map((row, rIdx) => {
                let diagonalIsImbalanceBuy = false;
                let diagonalIsImbalanceSell = false;

                // Diagonal Buy Imbalance: Ask at P vs Bid at P-1 (rIdx + 1, as rows are sorted descending)
                if (rIdx < bar.rows.length - 1) {
                  const nextRowBid = bar.rows[rIdx + 1].bidVolume;
                  if (row.askVolume >= nextRowBid * imbalanceRatio && row.askVolume >= minImbalanceVol) {
                    diagonalIsImbalanceBuy = true;
                  }
                }

                // Diagonal Sell Imbalance: Bid at P vs Ask at P+1 (rIdx - 1, as rows are sorted descending)
                if (rIdx > 0) {
                  const prevRowAsk = bar.rows[rIdx - 1].askVolume;
                  if (row.bidVolume >= prevRowAsk * imbalanceRatio && row.bidVolume >= minImbalanceVol) {
                    diagonalIsImbalanceSell = true;
                  }
                }

                return {
                  ...row,
                  diagonalIsImbalanceBuy,
                  diagonalIsImbalanceSell
                };
              });

              // Stacked Imbalance detection (3 or more consecutive levels)
              let currentBuyRun: number[] = [];
              let currentSellRun: number[] = [];
              const stackedBuyIndices = new Set<number>();
              const stackedSellIndices = new Set<number>();

              rowsWithImbalances.forEach((row, rIdx) => {
                if (row.diagonalIsImbalanceBuy) {
                  currentBuyRun.push(rIdx);
                } else {
                  if (currentBuyRun.length >= 3) {
                    currentBuyRun.forEach(i => stackedBuyIndices.add(i));
                  }
                  currentBuyRun = [];
                }

                if (row.diagonalIsImbalanceSell) {
                  currentSellRun.push(rIdx);
                } else {
                  if (currentSellRun.length >= 3) {
                    currentSellRun.forEach(i => stackedSellIndices.add(i));
                  }
                  currentSellRun = [];
                }
              });
              
              if (currentBuyRun.length >= 3) {
                currentBuyRun.forEach(i => stackedBuyIndices.add(i));
              }
              if (currentSellRun.length >= 3) {
                currentSellRun.forEach(i => stackedSellIndices.add(i));
              }

              // 2. Untested/Naked POC (NPOC) Evaluation
              let isPocTested = false;
              for (let j = idx + 1; j < footprints.length; j++) {
                const laterBar = footprints[j];
                if (pocPrice >= laterBar.low && pocPrice <= laterBar.high) {
                  isPocTested = true;
                  break;
                }
              }
              // If price did not trade through this price level in any future candles, it is "Naked"
              const isNakedPOC = !isPocTested && idx < footprints.length - 1;

              // 3. Unfinished Auction (UA) Detection with smart HFT Filtering
              const topRow = rowsWithImbalances[0];
              const bottomRow = rowsWithImbalances[rowsWithImbalances.length - 1];
              
              const isLowerTimeframe = symbolState.timeframe < 15;
              let uaThreshold = 3; // Basic raw trading volume
              
              if (hftGuard) {
                if (isLowerTimeframe) {
                  // For 1M/5M, calculate dynamic minimum volume threshold based on average footprint cluster volume to filter micro noise
                  const avgBarRowVol = bar.rows.length > 0 ? (bar.totalVolume / bar.rows.length) : 0;
                  uaThreshold = Math.max(12, Math.round(avgBarRowVol * 0.45));
                } else {
                  // Medium/Higher timeframes require at least 6 contracts
                  uaThreshold = 6;
                }
              }

              const isUnfinishedHigh = topRow && topRow.bidVolume >= uaThreshold && topRow.askVolume >= uaThreshold;
              const isUnfinishedLow = bottomRow && bottomRow.bidVolume >= uaThreshold && bottomRow.askVolume >= uaThreshold;

              // Calculate Delta indices
              const barDelta = Math.round(barAskSum - barBidSum);
              const isDeltaPositive = barDelta >= 0;
              const deltaPercentage = bar.totalVolume > 0 
                ? Math.round((barDelta / bar.totalVolume) * 100) 
                : 0;

              const isBullish = bar.close >= bar.open;

              const sessionMarker = getSessionMarker(bar.timestamp, symbolState.timeframe || 1);

              return (
                <React.Fragment key={`foot-bar-wrapper-${idx}-${bar.timestamp}`}>
                  {sessionMarker && (
                    <div className="flex flex-col justify-center items-center px-4 flex-shrink-0 self-stretch relative min-h-[400px]">
                      {/* Vertical Dashed Line representing market session start */}
                      <div 
                        className="w-[1.5px] h-full border-l border-dashed opacity-60"
                        style={{ borderColor: sessionMarker.color }}
                      />
                      {/* Session Badge Pill */}
                      <div 
                        className="absolute top-[40%] py-1 px-2.5 rounded-md text-[9px] font-bold font-mono uppercase border tracking-widest text-center shadow-2xl transform -translate-y-1/2 whitespace-nowrap z-30"
                        style={{ 
                          backgroundColor: "#0B0F19", 
                          borderColor: sessionMarker.color, 
                          color: sessionMarker.color,
                        }}
                      >
                        ⚡ {sessionMarker.name}
                      </div>
                    </div>
                  )}
                  <div
                    className="flex flex-col border border-gray-800/80 bg-gray-950/60 rounded-xl p-3 w-[180px] relative transition-colors duration-75 hover:border-indigo-500/40 hover:bg-[#121829]/90 hover:shadow-lg flex-shrink-0"
                    style={
                      isNakedPOC 
                        ? { borderColor: "#F59E0B", boxShadow: "0 0 14px rgba(245, 158, 11, 0.18)" }
                        : sessionMarker 
                          ? { borderColor: sessionMarker.color, boxShadow: `0 0 10px ${sessionMarker.color}15` } 
                          : undefined
                    }
                  >
                  
                  {/* Candlestick Marker Header */}
                  <div className="flex flex-col gap-1 text-[10px] font-mono border-b border-gray-800/60 pb-2 mb-2">
                    <div className="flex justify-between items-center text-gray-400">
                      <span className="font-bold text-gray-200 bg-gray-900 border border-gray-800 px-1.5 py-0.5 rounded text-[9px]">
                        {formatTimestamp(bar.timestamp, timezone)}
                      </span>
                      <span
                        className={`font-semibold flex items-center gap-0.5 px-1 py-0.5 text-[9px] opacity-70 ${
                          isBullish 
                            ? "text-emerald-500/80 border-b border-emerald-500/20" 
                            : "text-rose-500/80 border-b border-rose-500/20"
                        }`}
                      >
                        {isBullish ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
                        {isBullish ? "BULL" : "BEAR"}
                      </span>
                    </div>

                    {/* Institutional Warning Overlays (UA, NPOC) */}
                    {(isUnfinishedHigh || isNakedPOC || isUnfinishedLow) && (
                      <div className="flex flex-wrap gap-1 mt-1.5 p-1 bg-black/40 rounded border border-gray-800/40">
                        {isUnfinishedHigh && (
                          <span 
                            title={hftGuard ? `HFT Guard Validated. Minimum required volume to trigger: ${uaThreshold} contracts. (Filters random micro-ticks)` : "RAW Unfinished Auction high. Vulnerable to low-timeframe volatility."}
                            className={`text-[7.5px] px-1 py-0.5 rounded font-mono font-bold tracking-wider cursor-help border transition-colors ${
                              hftGuard 
                                ? "bg-violet-950/65 border-violet-500/25 text-violet-400" 
                                : "bg-rose-950/30 border-rose-500/25 text-rose-300 animate-pulse"
                            }`}
                          >
                            {hftGuard ? "⚡ UA HIGH" : "⚠️ UA HIGH (RAW)"}
                          </span>
                        )}
                        {isNakedPOC && (
                          <span className="text-[7.5px] px-1 py-0.5 rounded font-mono font-bold tracking-wider bg-amber-950/60 border border-amber-500/20 text-amber-400 animate-pulse">
                            📍 NAKED POC
                          </span>
                        )}
                        {isUnfinishedLow && (
                          <span 
                            title={hftGuard ? `HFT Guard Validated. Minimum required volume to trigger: ${uaThreshold} contracts. (Filters random micro-ticks)` : "RAW Unfinished Auction low. Vulnerable to low-timeframe volatility."}
                            className={`text-[7.5px] px-1 py-0.5 rounded font-mono font-bold tracking-wider cursor-help border transition-colors ${
                              hftGuard 
                                ? "bg-violet-950/65 border-violet-500/25 text-violet-400" 
                                : "bg-rose-950/30 border-rose-500/25 text-rose-300 animate-pulse"
                            }`}
                          >
                            {hftGuard ? "⚡ UA LOW" : "⚠️ UA LOW (RAW)"}
                          </span>
                        )}
                      </div>
                    )}
                    
                    {/* Header bar columns label */}
                    <div className="grid grid-cols-2 text-center text-[8px] tracking-widest text-gray-500 font-bold uppercase mt-1 border-t border-gray-900 pt-1">
                      <div className="border-r border-gray-800/40 text-rose-500/70">Bid Vol</div>
                      <div className="text-emerald-500/70">Ask Vol</div>
                    </div>
                  </div>

                  {/* Footprint Rows (Vertical scale) */}
                  <div className="flex-1 overflow-y-auto max-h-[350px] flex flex-col gap-[3px] pr-1.5 scrollbar-thin scrollbar-thumb-gray-800">
                    {rowsWithImbalances.map((row, rowIdx) => {
                      const totalVol = row.bidVolume + row.askVolume;
                      const isPOC = Math.abs(row.price - pocPrice) < 1e-7;

                      // Width calculations for the volume histogram bars
                      const bidRatio = maxRowVol > 0 ? (row.bidVolume / maxRowVol) * 100 : 0;
                      const askRatio = maxRowVol > 0 ? (row.askVolume / maxRowVol) * 100 : 0;

                      const hasStackedSell = stackedSellIndices.has(rowIdx);
                      const hasStackedBuy = stackedBuyIndices.has(rowIdx);

                      return (
                         <div
                          key={`row-${row.price}-${rowIdx}`}
                          className={`grid grid-cols-2 text-[10px] font-mono rounded relative items-center py-1 overflow-hidden border ${
                            isPOC
                              ? isNakedPOC 
                                ? "border-amber-400 bg-amber-950/50 shadow-[0_0_12px_rgba(245,158,11,0.3)]"
                                : "border-amber-400/60 bg-amber-950/20 shadow-[0_0_8px_rgba(245,158,11,0.15)]"
                              : "border-transparent bg-gray-950/40"
                          }`}
                        >
                          {/* Left Column Bid (Aggressive Selling Heat) */}
                          <div className="relative pr-6 py-0.5 text-right z-10 font-bold">
                            {/* Visual Histogram Background for Bid Selection */}
                            <div 
                              className="absolute right-0 top-0 bottom-0 pointer-events-none rounded-r transition-all duration-75"
                              style={{
                                width: `${Math.min(90, bidRatio)}%`,
                                backgroundColor: hasStackedSell
                                  ? "rgba(225, 29, 72, 0.42)"
                                  : row.diagonalIsImbalanceSell 
                                    ? "rgba(225, 29, 72, 0.22)" 
                                    : "rgba(244, 63, 94, 0.08)"
                              }}
                            />
                            <span className={
                              hasStackedSell
                                ? "text-rose-400 font-extrabold font-mono scale-110 inline-block text-[11px] animate-pulse"
                                : row.diagonalIsImbalanceSell 
                                  ? "text-rose-500 font-black font-mono scale-105 inline-block text-[10.5px]" 
                                  : "text-gray-400 font-mono"
                            }>
                              {row.bidVolume}
                              {hasStackedSell && <span className="text-[7.5px] text-rose-500 ml-0.5 font-bold">⚡</span>}
                            </span>
                          </div>

                          {/* Right Column Ask (Aggressive Buying Heat) */}
                          <div className="relative pl-6 py-0.5 text-left z-10 font-bold">
                            {/* Visual Histogram Background for Ask Selection */}
                            <div 
                              className="absolute left-0 top-0 bottom-0 pointer-events-none rounded-l transition-all duration-75"
                              style={{
                                width: `${Math.min(90, askRatio)}%`,
                                backgroundColor: hasStackedBuy
                                  ? "rgba(16, 185, 129, 0.38)"
                                  : row.diagonalIsImbalanceBuy 
                                    ? "rgba(16, 185, 129, 0.18)" 
                                    : "rgba(16, 185, 129, 0.05)"
                              }}
                            />
                            <span className={
                              hasStackedBuy
                                ? "text-emerald-400 font-extrabold font-mono scale-110 inline-block text-[11px] animate-pulse"
                                : row.diagonalIsImbalanceBuy 
                                  ? "text-emerald-500 font-black font-mono scale-105 inline-block text-[10.5px]" 
                                  : "text-gray-400 font-mono"
                            }>
                              {row.askVolume}
                              {hasStackedBuy && <span className="text-[7.5px] text-emerald-500 ml-0.5 font-bold">⚡</span>}
                            </span>
                          </div>

                          {/* Mid Price Overlay Pill */}
                          <div className={`absolute left-[50%] top-[50%] translate-x-[-50%] translate-y-[-50%] pointer-events-none z-20 px-1 py-0.5 text-[8px] font-mono font-bold rounded-sm border ${
                            isPOC 
                              ? isNakedPOC
                                ? "bg-amber-900 border-amber-400 text-amber-100"
                                : "bg-amber-950 border-amber-500/30 text-amber-500/80" 
                              : "bg-gray-950 border-gray-800/60 text-gray-300"
                          } leading-none shadow-sm`}>
                            {row.price?.toFixed(decimalPlaces)}
                          </div>

                          {/* POC Marker Badge */}
                          {isPOC && (
                            <div className="absolute right-0.5 top-0 bottom-0 flex items-center z-30 pointer-events-none">
                              <Target size={7} className={isNakedPOC ? "text-amber-400 animate-bounce" : "text-amber-500/60 animate-spin-slow"} />
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* High Quality Transaction Analytics Footer */}
                  <div className="mt-2.5 pt-2 border-t border-gray-800/80 text-[9px] font-mono text-gray-400 space-y-1 bg-gray-950/40 p-1.5 rounded">
                    <div className="flex justify-between items-center text-[10px] pb-1 border-b border-gray-900">
                      <span className="text-gray-500 font-semibold uppercase tracking-wider">Bar Delta:</span>
                      <span className={`font-bold flex items-center pr-0.5 ${
                        isDeltaPositive ? "text-emerald-500/90" : "text-rose-500/90"
                      }`}>
                        {isDeltaPositive ? "+" : ""}{barDelta}
                        <span className="text-[7.5px] ml-1 text-gray-500">({deltaPercentage}%)</span>
                      </span>
                    </div>

                    {/* Vol summary slider indicator */}
                    <div className="w-full bg-gray-900 h-1 rounded overflow-hidden flex">
                      <div 
                        className="bg-rose-500 h-full" 
                        style={{ width: `${bar.totalVolume > 0 ? (barBidSum / bar.totalVolume) * 100 : 50}%` }} 
                      />
                      <div 
                        className="bg-emerald-500 h-full" 
                        style={{ width: `${bar.totalVolume > 0 ? (barAskSum / bar.totalVolume) * 100 : 50}%` }} 
                      />
                    </div>

                    <div className="flex justify-between">
                      <span className="text-gray-500">Volume:</span>
                      <span className="text-white font-semibold">
                        {bar.totalVolume}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Range w/c:</span>
                      <span className="text-gray-300">
                        {bar.open?.toFixed(decimalPlaces)} &rarr; {bar.close?.toFixed(decimalPlaces)}
                      </span>
                    </div>
                  </div>

                </div>
              </React.Fragment>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
}
