import React from "react";
import {
  ResponsiveContainer,
  ComposedChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
  ReferenceLine
} from "recharts";
import { SymbolFullState } from "../types";
import { formatTimestamp, getSessionMarker } from "../utils/timezone";
import { LineChart, Activity, Shield } from "lucide-react";

interface CVDChartProps {
  symbolState: SymbolFullState;
  timezone?: string;
}

export default function CVDChart({ symbolState, timezone = "local" }: CVDChartProps) {
  const data = (symbolState.cvd || []).map(d => ({
    ...d,
    timeLabel: d.time ? formatTimestamp(Number(d.time), timezone) : ""
  }));

  // Track session starts to overlay vertical lines
  const sessionMarkers = data
    .map(d => {
      const marker = getSessionMarker(Number(d.time), symbolState.timeframe || 1);
      if (marker) {
        return {
          timeLabel: d.timeLabel,
          ...marker
        };
      }
      return null;
    })
    .filter((m): m is { timeLabel: string; name: string; color: string; short: string } => m !== null);

  // Track precise Institutional Absorption points (micro divergences)
  const absorptionSignals: Array<{ timeLabel: string; time: string; type: string; color: string; desc: string }> = [];
  const onePip = symbolState.pipSize || 0.0001;
  
  // Calculate the average delta-per-pip of the symbol to make the detector fully self-calibrating
  let totalDeltaPerPip = 0;
  let ratioCount = 0;
  for (let i = 1; i < data.length; i++) {
    const pDiffInPips = Math.abs(data[i].price - data[i - 1].price) / onePip;
    const dDiff = Math.abs(data[i].delta - data[i - 1].delta);
    if (pDiffInPips > 0 && dDiff > 0) {
      totalDeltaPerPip += dDiff / pDiffInPips;
      ratioCount++;
    }
  }
  const avgDeltaPerPip = ratioCount > 0 ? (totalDeltaPerPip / ratioCount) : 1200;

  // Calculate average delta difference to make the detector fully scale-invariant
  let totalDeltaDiff = 0;
  let validDiffCount = 0;
  for (let i = 1; i < data.length; i++) {
    const diff = Math.abs(data[i].delta - data[i - 1].delta);
    if (diff > 0) {
      totalDeltaDiff += diff;
      validDiffCount++;
    }
  }
  const averageDeltaDiff = validDiffCount > 0 ? (totalDeltaDiff / validDiffCount) : 1000;
  const deltaThreshold = Math.max(150, averageDeltaDiff * 1.25);

  for (let i = 1; i < data.length; i++) {
    const priceDiff = data[i].price - data[i - 1].price;
    const deltaDiff = data[i].delta - data[i - 1].delta;

    // Detect absorption using our self-calibrated price impact model
    // 1. BUY ABS (Bullish Buy-Limit Absorption): Aggressive short volume absorbed by passive rest-limit bids.
    if (deltaDiff <= -deltaThreshold) {
      const actualDropInPips = (data[i - 1].price - data[i].price) / onePip;
      const expectedDropInPips = -deltaDiff / avgDeltaPerPip;
      
      // If price drops far less than aggressive delta pressure dictates, it's absorbed!
      if (actualDropInPips >= 0 && actualDropInPips <= expectedDropInPips * 0.55) {
        if (absorptionSignals.length === 0 || Number(data[i].time) - Number(absorptionSignals[absorptionSignals.length - 1].time) > 2 * 60000) {
          absorptionSignals.push({
            timeLabel: data[i].timeLabel,
            time: String(data[i].time),
            type: "BUY ABS",
            color: "#10B981", // Emerald
            desc: "Bullish Buy-Limit Absorption"
          });
        }
      }
    } 
    // 2. SELL ABS (Bearish Sell-Limit Absorption): Aggressive long volume absorbed by passive rest-limit asks.
    else if (deltaDiff >= deltaThreshold) {
      const actualRiseInPips = (data[i].price - data[i - 1].price) / onePip;
      const expectedRiseInPips = deltaDiff / avgDeltaPerPip;
      
      // If price rises far less than aggressive delta pressure dictates, it's absorbed!
      if (actualRiseInPips >= 0 && actualRiseInPips <= expectedRiseInPips * 0.55) {
        if (absorptionSignals.length === 0 || Number(data[i].time) - Number(absorptionSignals[absorptionSignals.length - 1].time) > 2 * 60000) {
          absorptionSignals.push({
            timeLabel: data[i].timeLabel,
            time: String(data[i].time),
            type: "SELL ABS",
            color: "#EF4444", // Rose
            desc: "Bearish Sell-Limit Absorption"
          });
        }
      }
    }
  }

  const activeDivergences = absorptionSignals.slice(-2);

  const currentDelta = data[data.length - 1]?.delta || 0;
  const startDelta = data[0]?.delta || 0;
  const currentPrice = data[data.length - 1]?.price || 0;
  const startPrice = data[0]?.price || 0;

  const formatDelta = (val: number) => {
    return new Intl.NumberFormat('en-US').format(Math.round(val));
  };

  const getDivergence = () => {
    if (!symbolState.hasRealVolume) return "Price Action Only";
    const deltaChange = currentDelta - startDelta;
    const priceChange = currentPrice - startPrice;

    // Precision divergence detection for institutional absorption
    const priceStabilityThreshold = 0.00015 * currentPrice; // ~1.5 pips of relative drift

    // 1. Institutional Absorption Divergences (Limit orders swallowing aggressive market orders)
    if (priceChange >= -priceStabilityThreshold && deltaChange < -1500) {
      return "Bullish Absorption (Divergence)";
    }
    if (priceChange <= priceStabilityThreshold && deltaChange > 1500) {
      return "Bearish Absorption (Divergence)";
    }
    
    // 2. Absolute/Classic Divergences
    // Price falling but Cumulative Buying grows (Bullish Accumulation)
    if (priceChange < -priceStabilityThreshold && deltaChange > 500) {
      return "Bullish Accumulation (Divergence)";
    }
    // Price rising but Cumulative Selling grows (Bearish Distribution)
    if (priceChange > priceStabilityThreshold && deltaChange < -500) {
      return "Bearish Distribution (Divergence)";
    }

    // 3. Normal Coordinated Expansion
    if (priceChange > 0 && deltaChange > 0) return "Symmetric Expansion (Bull)";
    if (priceChange < 0 && deltaChange < 0) return "Symmetric Contraction (Bear)";
    return "Consolidation Node";
  };

  return (
    <div className="osmotic-glass p-5 flex flex-col h-full overflow-hidden shadow-2xl" id="cvd-panel">
      {/* Header Info */}
      <div className="flex justify-between items-center mb-4 pb-3 border-b border-indigo-500/10">
        <div>
          <h3 className="oracle-header-title text-xs flex items-center gap-2">
            <LineChart size={14} className={symbolState.hasRealVolume ? "text-[#6366F1]" : "text-amber-500"} />
            {symbolState.hasRealVolume ? "CVD Delta vs Price Divergence" : "Price Elasticity Tracking (CVD Blocked)"}
          </h3>
          <p className="oracle-data-label mt-1">
            {symbolState.hasRealVolume 
              ? "CVD maps cumulative aggressive buys minus aggressive sells. Match divergence at key blocks."
              : "Institutional volume size is hidden for this asset. Divergence analysis is restricted to price velocity."}
          </p>
        </div>
        {symbolState.hasRealVolume && (
          <div className="text-right text-xs font-mono">
            <span className="oracle-data-label text-[10px]">Current Delta:</span>{" "}
            <span
              className={`font-bold ${
                currentDelta >= 0
                  ? "oracle-glowing-value-green"
                  : "oracle-glowing-value-red"
              }`}
            >
              {currentDelta > 0 ? "+" : ""}{formatDelta(currentDelta)}
            </span>
          </div>
        )}
      </div>

      {/* Recharts Dual Axis Line Wrapper */}
      <div className="w-full min-h-[240px] relative">
        {data.length === 0 ? (
          <div className="flex items-center justify-center h-[240px] text-gray-500 font-mono text-sm">
            Insufficient delta history...
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={240}>
            <ComposedChart
              data={data}
              margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
            >
              <defs>
                <linearGradient id="colorCvd" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#312E81" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#1E1B4B" stopOpacity={0.2}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1F2937" vertical={false} />
              
              <XAxis
                dataKey="timeLabel"
                stroke="#6B7280"
                fontSize={10}
                tickLine={false}
                axisLine={false}
              />
              
              {/* Left Y-axis: Cumulative Volume Delta */}
              <YAxis
                yAxisId="left"
                stroke="#6366F1"
                fontSize={9}
                tickLine={false}
                axisLine={false}
                domain={["auto", "auto"]}
              />
              
              {/* Right Y-axis: Market Price */}
              <YAxis
                yAxisId="right"
                orientation="right"
                stroke="#F59E0B"
                fontSize={9}
                tickLine={false}
                axisLine={false}
                domain={["auto", "auto"]}
              />

              <Tooltip
                contentStyle={{
                  backgroundColor: "#0F172A",
                  borderColor: "#1E293B",
                  borderRadius: "8px",
                  fontSize: "11px",
                  color: "#F8FAFC",
                  fontFamily: "monospace",
                }}
              />
              <Legend
                verticalAlign="top"
                height={28}
                fontSize={10}
                wrapperStyle={{ fontSize: "10px", marginTop: "-6px" }}
              />

              {/* Baseline for neutral Delta */}
              <ReferenceLine yAxisId="left" y={0} stroke="#4B5563" strokeDasharray="3 3" />

              {/* Precise Institutional Absorption levels */}
              {activeDivergences.map((divPoint, index) => (
                <ReferenceLine
                  key={`imbalance-absorb-${index}-${divPoint.time}`}
                  x={divPoint.timeLabel}
                  stroke={divPoint.color}
                  strokeDasharray="2 3"
                  strokeWidth={1}
                  label={{
                    value: `⚡ ${divPoint.type}`,
                    position: "insideBottomLeft",
                    fill: divPoint.color,
                    fontSize: 8,
                    fontFamily: "monospace",
                    fontWeight: "bold",
                    dy: -12,
                  }}
                />
              ))}

              {/* Major Market Sessions (Tokyo, London, NYC) - Time-based liquidity shifts */}
              {sessionMarkers.map((marker, index) => (
                <ReferenceLine
                  key={`session-line-${index}-${marker.timeLabel}`}
                  x={marker.timeLabel}
                  stroke={marker.color}
                  strokeDasharray="4 4"
                  strokeWidth={1.5}
                  label={{
                    value: `▲ ${marker.short} Open`,
                    position: "insideTopLeft",
                    fill: marker.color,
                    fontSize: 8.5,
                    fontFamily: "monospace",
                    fontWeight: "bold",
                    dy: 10,
                  }}
                />
              ))}

              <Line
                yAxisId="left"
                type="monotone"
                dataKey="delta"
                name="Cumulative Delta"
                stroke="#6366F1AA"
                strokeWidth={1.5}
                dot={false}
                activeDot={{ r: 3 }}
                isAnimationActive={false}
              />

              <Line
                yAxisId="right"
                type="monotone"
                dataKey="price"
                name="Asset Price"
                stroke="#F59E0B99"
                strokeWidth={1.5}
                dot={false}
                isAnimationActive={false}
              />
            </ComposedChart>
          </ResponsiveContainer>
        )}
      </div>

      <div className="mt-2.5 flex flex-col gap-1.5 border-t border-gray-800/80 pt-2 font-mono text-[10px]">
        {/* Market Divergence State */}
        <div className="flex items-center justify-between bg-[#121829]/50 px-2.5 py-1.5 rounded border border-gray-800/30">
          <span className="flex items-center gap-1 text-gray-500">
            <Activity size={12} className="text-indigo-400" />
            Core Divergence Profile:
          </span>
          <span className={`${getDivergence().includes("(Divergence)") ? "text-amber-400" : "text-gray-300"} font-bold`}>
            {getDivergence()}
          </span>
        </div>

        {/* Dynamic Absorption Real-Time Feed */}
        {activeDivergences.length > 0 && (
          <div className="flex flex-col gap-1 bg-black/40 p-2 rounded border border-gray-900/60">
            <div className="text-[9px] text-gray-500 font-bold uppercase tracking-wider flex items-center gap-1.5 border-b border-gray-900 pb-1 mb-1">
              <Shield size={10} className="text-indigo-400" />
              Institutional Absorption Log:
            </div>
            {activeDivergences.map((sig, idx) => (
              <div key={`abs-feed-${idx}`} className="flex justify-between items-center text-[9px] px-1 py-0.5 hover:bg-gray-900/30">
                <span className="text-gray-500">{sig.timeLabel}</span>
                <span className="font-bold flex items-center gap-1" style={{ color: sig.color }}>
                  ⚡ {sig.desc.toUpperCase()}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
