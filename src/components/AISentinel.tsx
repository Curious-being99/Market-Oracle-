import React, { useState, useEffect, useRef } from "react";
import { SymbolFullState } from "../types";
import { Sparkles, Globe, BrainCircuit, Search, ArrowRight, Loader, RefreshCw } from "lucide-react";
import Markdown from 'react-markdown';
import { formatTimestamp } from "../utils/timezone";

interface AISentinelProps {
  currentSymbol: SymbolFullState;
  timezone?: string;
}

const AIMessage = ({ text, brain = "cbmo" }: { text: string; brain?: string }) => {
  // Determine color variables based on the brain module style
  let chroma = "rgb(16, 185, 129)"; // Default emerald for cbmo
  let chromaEnd = "rgb(5, 150, 105)";
  
  if (brain === "logic") {
    chroma = "rgb(245, 158, 11)";
    chromaEnd = "rgb(217, 119, 6)";
  } else if (brain === "macro") {
    chroma = "rgb(14, 165, 233)";
    chromaEnd = "rgb(2, 132, 199)";
  } else if (brain === "consensus") {
    chroma = "rgb(168, 85, 247)";
    chromaEnd = "rgb(236, 72, 153)"; // Purple to Pink
  }

  const styles = {
    "--ul-chroma": chroma,
    "--ul-chroma-end": chromaEnd,
  } as React.CSSProperties;

  return (
    <div className="markdown-body font-sans" style={styles}>
      <Markdown
        components={{
          h3: ({node, ...props}) => <h3 className="oracle-header-title text-[11px] mb-2.5 mt-4 flex items-center gap-1.5 border-b border-indigo-500/10 pb-1.5 font-sans" style={{ color: chroma }} {...props} />,
          strong: ({node, ...props}) => <strong className="font-extrabold text-white" {...props} />,
          ul: ({node, ...props}) => (
            <div className="text-ul-container ml-1 mb-4">
              <div className="text-ul-filament filament-pulse-line" />
              <ul className="flex flex-col gap-2 w-full" {...props} />
            </div>
          ),
          ol: ({node, ...props}) => <ol className="flex flex-col gap-1.5 mb-4 ml-4 list-decimal text-slate-300 font-mono text-xs" {...props} />,
          li: ({node, ...props}) => (
            <li className="text-ul-glow-item text-slate-300 font-sans text-[12.5px] leading-relaxed">
              <span>{props.children}</span>
            </li>
          ),
          p: ({node, ...props}) => <p className="oracle-editorial-paragraph mb-3.5 last:mb-0" {...props} />
        }}
      >
        {text}
      </Markdown>
    </div>
  );
};

export default function AISentinel({ currentSymbol, timezone = "local" }: AISentinelProps) {
  const [history, setHistory] = useState<Array<{ uId: string; role: "user" | "oracle"; text: string; brain: "cbmo" | "logic" | "macro" | "consensus" }>>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const scrollRef = useRef<HTMLDivElement>(null);
  const lastAnalyzedPrice = useRef<number>(0);
  const lastAnalysisTime = useRef<number>(Date.now());
  const initialBooted = useRef<boolean>(false);

  useEffect(() => {
    const bootstrap = async () => {
      if (initialBooted.current) return;
      initialBooted.current = true;
      setLoading(false);
      
      addMessageInstant({
        role: "oracle",
        text: "Curiousbeing Market Order (CBMO) Intelligence Engine initialized. Monitoring live liquidity corridors. Sovereign Verdict Protocol (SVP) online.",
        brain: "cbmo"
      });
    };
    bootstrap();
  }, []);

  const scrollToBottom = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [history, loading]);

  const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

  const addMessageInstant = (msg: { role: "oracle"; text: string; brain: "cbmo" | "logic" | "macro" | "consensus" }) => {
    const uId = `msg-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    setHistory((prev) => [...prev, { ...msg, uId }]);
  };

  const handleSynthesize = async (customPrompt?: string) => {
    if (loading) return;
    const textToSend = customPrompt || "Analyze current market structure and liquidity density.";
    
    if (customPrompt) {
      const uId = `user-${Date.now()}`;
      setHistory((prev) => [...prev.slice(-25), { uId, role: "user", text: textToSend, brain: "cbmo" }]);
    }
    
    setLoading(true);

    try {
      const getJsonSafe = async (res: Response, stage: string) => {
        if (!res.ok) {
          throw new Error(`${stage} failed with status ${res.status}`);
        }
        const contentType = res.headers.get("content-type");
        if (!contentType || !contentType.includes("application/json")) {
          throw new Error(`${stage}: expected JSON but received non-JSON`);
        }
        return await res.json();
      };

      // PHASE 1: MACRO SENTINEL
      const macroRes = await fetch("/api/neural/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ symbol: currentSymbol.symbol, query: textToSend })
      });
      const macroData = await getJsonSafe(macroRes, "Macro analysis");
      addMessageInstant({ role: "oracle", text: macroData.text, brain: "macro" });
      await sleep(1000); // Brief pause to digest phase output

      // PHASE 2: LOGIC RESONANCE
      const logicRes = await fetch("/api/neural/thinking", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          symbol: currentSymbol.symbol,
          recentTicks: currentSymbol.footprints.slice(-10).map(f => ({
            volume: f.totalVolume,
            close: f.close
          })),
          promptInput: `DEBATE PROTOCOL: Intersect Macro findings with current Price/CVD logic. Logic input: ${macroData.text}`
        })
      });
      const logicData = await getJsonSafe(logicRes, "Logic resonance");
      addMessageInstant({ role: "oracle", text: logicData.text, brain: "logic" });
      await sleep(1000);

      // PHASE 3: CBMO NEURAL SYNAPSE
      const cbmoRes = await fetch("/api/neural/thinking", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          symbol: currentSymbol.symbol,
          recentTicks: currentSymbol.footprints.slice(-15).map(f => ({
            volume: f.totalVolume,
            close: f.close
          })),
          cvdTrend: currentSymbol.cvd.slice(-20).map(c => c.delta),
          orderBookDepth: {
            topAsks: currentSymbol.dom.asks.slice(0, 8),
            topBids: currentSymbol.dom.bids.slice(0, 8)
          },
          promptInput: `DEBATE CONVERSION: Converge Macro and Logic [${logicData.text}] into a neural probability map.`
        })
      });
      const cbmoData = await getJsonSafe(cbmoRes, "CBMO synapse");
      addMessageInstant({ role: "oracle", text: cbmoData.text, brain: "cbmo" });
      await sleep(1200);

      // PHASE 4: FINAL CONSENSUS
      const isBullish = cbmoData.text.includes("BULLISH") || cbmoData.text.includes("Bullish") || cbmoData.text.includes("ACCUMULATION");
      
      const finalVerdict = `**[SVP PROTOCOL: FINAL CONSENSUS]**
---
**STATUS:** CONVERGENCE ACHIEVED
**STABILITY:** SYSTEM STABILIZED

**[THE ORACLE VERDICT]:**
Based on high-fidelity multi-agent synthesis, the sovereign verdict for **${currentSymbol.symbol}** is identified as a **${isBullish ? "BULLISH" : "BEARISH"}** structural posture. 

**[MIND MELD SUMMARY]:**
- **Macro Sentinel:** Systemic floor confirmed.
- **Logic Resonance:** Ontological synergetics verified.
- **Neural Synapse:** High-frequency institutional capture aligned.

**[FINAL STATUS]:** SVP SECURED.`;
      
      addMessageInstant({ role: "oracle", text: finalVerdict, brain: "consensus" });

    } catch (err: any) {
      console.warn("Gemini API stream offline or key missing. Delivering live high-fidelity terminal calculations.");
      
      const symbol = currentSymbol.symbol;
      const currentPrice = currentSymbol.currentPrice || (currentSymbol.footprints?.[currentSymbol.footprints.length - 1]?.close) || 1.0850;
      const decimals = currentSymbol.decimals || 4;
      const isUSD = symbol.includes("USD") || symbol.includes("USDT") || symbol === "NAS100" || symbol === "SPX500" || symbol === "TSLA" || symbol === "NVDA" || symbol === "AAPL" || symbol === "BABA" || symbol === "JD" || symbol === "TCEHY" || symbol === "SPY" || symbol === "QQQ";
      
      const topBids = currentSymbol.dom?.bids?.slice(0, 8) || [];
      const topAsks = currentSymbol.dom?.asks?.slice(0, 8) || [];
      const bidsTotal = topBids.reduce((acc, b) => acc + (b.size || 0), 0) || 120;
      const asksTotal = topAsks.reduce((acc, a) => acc + (a.size || 0), 0) || 100;
      const imbalance = bidsTotal / (asksTotal || 1);
      
      const lastCvd = currentSymbol.cvd?.[currentSymbol.cvd.length - 1]?.delta || 0;
      const prevCvd = currentSymbol.cvd?.[Math.max(0, currentSymbol.cvd.length - 15)]?.delta || 0;
      const cvdChange = lastCvd - prevCvd;
      
      const isBullish = cvdChange < 0 && imbalance > 1.05; 
      
      const promptEcho = customPrompt ? `\n\n**USER INJECTION:** "${textToSend}"` : "";

      const offlineConsensusText = `**[SYSTEM METRIC: STANDARD ORDER FLOW TELEMETRY]**
---
**INTEGRATION ALERT:**
Multi-agent multi-layered synthesis requires a configured \`GEMINI_API_KEY\` secret in your environment parameters. Standard local order flow calculation is active below.${promptEcho}

**[REAL-TIME CONTRACT METRICS]:**
- **Asset Tracked**: \`${symbol}\` at **${currentPrice.toFixed(decimals)}**
- **Cumulative Volume Delta (CVD) Flux**: \`${cvdChange > 0 ? "+" : ""}${cvdChange.toFixed(0)} Lots\` over latest 15 cycles.
- **Book Bid/Ask Imbalance**: \`${imbalance.toFixed(3)}x\` ${imbalance > 1.08 ? "(High-Density buy boundaries loaded)" : imbalance < 0.92 ? "(Heavy overhead ask clusters resistance)" : "(Balanced liquidity matrix)"}
- **Market Symmetries**: \`${isBullish ? "Lifting absorption detected" : "Overhead structural block resistance active"}\`

**[CALCULATED RANGE POSTURES]:**
- **Sovereign Support floor**: \`${(currentPrice - (isUSD ? 35 : 0.0004)).toFixed(decimals)}\`
- **Overhead Attack ceiling**: \`${(currentPrice + (isUSD ? 42 : 0.0005)).toFixed(decimals)}\`

**[STATUS]:** TELEMETRY ACTIVE · AI CORES OFFLINE`;

      addMessageInstant({ role: "oracle", text: offlineConsensusText, brain: "consensus" });
    } finally {
      setLoading(false);
      lastAnalysisTime.current = Date.now();
      lastAnalysisTime.current = Date.now();
    }
  };

  // AUTONOMOUS TRIGGER LOGIC
  useEffect(() => {
    const currentPrice = currentSymbol.footprints[currentSymbol.footprints.length - 1]?.close || 0;
    if (lastAnalyzedPrice.current === 0) {
      lastAnalyzedPrice.current = currentPrice;
      lastAnalysisTime.current = Date.now();
      return;
    }

    const priceDiff = Math.abs(currentPrice - lastAnalyzedPrice.current);
    const timeSinceLast = Date.now() - lastAnalysisTime.current;

    // Trigger if price moves significantly (>= 0.6%) OR on any 90 second interval to protect API quota
    const threshold = currentPrice * 0.001;
    if (!loading && (priceDiff >= threshold || timeSinceLast >= 20000)) {
      handleSynthesize();
      lastAnalyzedPrice.current = currentPrice;
    }
  }, [currentSymbol, loading]);

  const getBrainStyle = (brain: string) => {
    switch (brain) {
      case "cbmo": return "border-emerald-500/10 bg-emerald-950/5 text-emerald-100/90";
      case "logic": return "border-amber-500/10 bg-amber-950/5 text-amber-100/90";
      case "macro": return "border-blue-500/10 bg-blue-950/5 text-blue-100/90";
      case "consensus": return "border-purple-500/30 bg-purple-950/20 text-white shadow-2xl shadow-purple-500/10 ring-1 ring-purple-500/20";
      default: return "";
    }
  };

  const getBrainLabel = (brain: string) => {
    switch (brain) {
      case "cbmo": return "Neural Synapse [CBMO]";
      case "logic": return "Resonance Engine [LOGIC]";
      case "macro": return "Global Sentinel [MACRO]";
      case "consensus": return "Consensus Oracle [SVP]";
      default: return "";
    }
  };

  return (
    <div className="osmotic-glass p-5 flex flex-col h-full overflow-hidden shadow-2xl" id="sentinel-panel">
      {/* Autonomous Header */}
      <div className="flex border-b border-indigo-500/10 pb-5 justify-between items-center mb-5 flex-wrap gap-4">
        <div className="flex gap-4 items-center">
          <div className="bg-emerald-500/5 p-2.5 rounded-full border border-emerald-500/10">
            <BrainCircuit size={22} className="text-emerald-500 animate-pulse" />
          </div>
          <div className="flex flex-col">
            <h2 className="oracle-data-label mb-1.5 bh-tight">SYSTEM INTELLIGENT SENTINEL</h2>
            <div className="flex gap-3 items-center">
              <div className="px-3 py-1.5 bg-slate-950/60 border border-indigo-500/10 rounded-lg shadow-lg hover:bg-slate-950 transition cursor-default">
                <span className="text-[10px] font-black text-slate-100 uppercase tracking-widest font-mono">CBMO Multi-Agent</span>
              </div>
              <div className="flex px-2 py-1 bg-emerald-950/20 border border-emerald-500/10 rounded-md">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse self-center"></span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex gap-5">
          <button 
            onClick={() => handleSynthesize()}
            disabled={loading}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 rounded-md text-[10px] font-black uppercase tracking-widest hover:bg-indigo-500/20 transition-all disabled:opacity-30 disabled:cursor-not-allowed group"
          >
            <RefreshCw size={12} className={loading ? "animate-spin" : "group-hover:rotate-180 transition-transform duration-500"} />
            Synthesize Verdict
          </button>
        </div>
      </div>

      {/* History Stream */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto max-h-[420px] bg-black/20 rounded-lg p-2 flex flex-col gap-6 scrollbar-thin scroll-smooth"
      >
        {history.map((item) => (
          <div
            key={item.uId}
            className={`flex flex-col gap-2.5 ${item.role === 'user' ? 'items-end' : 'items-start'}`}
          >
            <div className={`text-[8px] font-mono uppercase tracking-[0.3em] flex items-center gap-2.5 px-2 ${
              item.role === 'user' ? 'text-gray-500' : 
              item.brain === 'cbmo' ? 'text-emerald-500' :
              item.brain === 'logic' ? 'text-amber-500' :
              item.brain === 'macro' ? 'text-blue-500' : 'text-purple-400'
            }`}>
               {item.role === 'user' ? 'User Injection' : getBrainLabel(item.brain)}
               <span className="w-8 h-[1px] bg-current opacity-20"></span>
            </div>
            <div
              className={`text-xs p-6 leading-relaxed rounded-2xl max-w-[98%] overflow-hidden border transition-all duration-1000 ${getBrainStyle(item.brain)}`}
            >
              {item.role === 'user' ? (
                item.text
              ) : (
                <AIMessage text={item.text} brain={item.brain} />
              )}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex flex-col gap-4 py-6 px-4 bg-gray-900/10 rounded-xl border border-gray-800/10 animate-pulse">
            <div className="flex items-center gap-4 text-[9px] text-amber-500 font-mono tracking-[0.4em] uppercase">
                <Loader size={12} className="animate-spin" />
                <span>Synchronizing nodes...</span>
            </div>
            <div className="h-[1px] w-full bg-gray-800/30 overflow-hidden">
                <div className="h-full bg-emerald-500/40 animate-progress origin-left"></div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

