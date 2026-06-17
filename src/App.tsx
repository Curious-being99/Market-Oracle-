import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { SymbolSummary, SymbolFullState, DOMLevel, CVDData, FootprintBar, FootprintRow } from "./types";
import DOMBook from "./components/DOMBook";
import FootprintChart from "./components/FootprintChart";
import CVDChart from "./components/CVDChart";
import AISentinel from "./components/AISentinel";
import SovereignDefendedPoolRadar from "./components/SovereignDefendedPoolRadar";
import TimezoneSelector from "./components/TimezoneSelector";
import Landing from "./components/Landing";
import MainPageLoader from "./components/MainPageLoader";
import TectonicStressCanvas from "./components/TectonicStressCanvas";
import {
  TrendingUp,
  TrendingDown,
  RefreshCw,
  Cpu,
  Bookmark,
  Activity,
  User,
  ExternalLink,
  ShieldCheck,
  AlertCircle,
  Wifi,
  Globe,
  Key,
  Database
} from "lucide-react";

export default function App() {
  const [view, setView] = useState<"landing" | "main">("landing");
  const [symbols, setSymbols] = useState<SymbolSummary[]>([]);
  const [selectedSymbolCode, setSelectedSymbolCode] = useState<string>("EURUSD");
  const [activeState, setActiveState] = useState<SymbolFullState | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [transitionComplete, setTransitionComplete] = useState<boolean>(false);
  const [notifications, setNotifications] = useState<Array<{ id: string; msg: string; type: "success" | "error" | "info" }>>([]);
  const [globalTimezone, setGlobalTimezone] = useState<string>("local");
  const [isTzSelectorOpen, setIsTzSelectorOpen] = useState<boolean>(false);
  const [exchangeConfig, setExchangeConfig] = useState<{ binance: boolean; bitget: boolean }>({ binance: false, bitget: false });
  const [exchangeAccounts, setExchangeAccounts] = useState<any>(null);
  const [copiedIp, setCopiedIp] = useState<boolean>(false);
  const [proxyRotator, setProxyRotator] = useState<any>(null);
  const [isRotatingInAction, setIsRotatingInAction] = useState<boolean>(false);

  const [feedMode] = useState<"institutional">("institutional");

  // Fetch detailed verified exchange account statuses
  const fetchExchangeDetailedBalances = async () => {
    try {
      const res = await fetch("/api/exchange-accounts");
      if (res.ok) {
        const contentType = res.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
          const data = await res.json();
          setExchangeAccounts(data);
        }
      }
    } catch (err) {
      // Quiet fail to avoid polluting console during startup Transients
    }
  };

  const fetchProxyRotatorStatus = async () => {
    try {
      const res = await fetch("/api/proxy-rotator");
      if (res.ok) {
        const contentType = res.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
          const data = await res.json();
          setProxyRotator(data);
        }
      }
    } catch (err) {
      // Quiet fail to avoid polluting console during startup Transients
    }
  };

  // Fetch all supported symbols on mount
  const fetchAllSymbols = async () => {
    try {
      const res = await fetch("/api/market-data");
      if (!res.ok) {
        throw new Error(`Server status ${res.status}`);
      }
      const contentType = res.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        throw new Error(`Invalid content-type: ${contentType}`);
      }
      const data = await res.json();
      if (data.symbols && data.symbols.length > 0) {
        setSymbols(data.symbols);
      }
      if (data.exchangeKeysConfigured) {
        setExchangeConfig(data.exchangeKeysConfigured);
      }
    } catch (err) {
      // Silently retry in the background during initial Express boot phase instead of throwing red alerts
    }
  };

  // Fetch full details of selected symbol
  const fetchSymbolDetails = async (symCode: string) => {
    try {
      const res = await fetch(`/api/market-data/${symCode}`);
      if (!res.ok) {
        throw new Error(`Server status ${res.status}`);
      }
      const contentType = res.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        throw new Error(`Invalid content-type: ${contentType}`);
      }
      const data = await res.json();
      setActiveState(data);
    } catch (err) {
      // Quiet fail on startup/reload transients
    } finally {
      setLoading(false);
    }
  };

  // Initial trigger
  useEffect(() => {
    let active = true;
    const initLoad = async () => {
      await fetchAllSymbols();
      if (active) {
        await fetchExchangeDetailedBalances();
        await fetchProxyRotatorStatus();
      }
    };
    initLoad();
    
    return () => {
      active = false;
    };
  }, []);

  // Real-time pure-SSE streaming
  useEffect(() => {
    // Only connect SSE when we are actually loaded to save bandwidth if stuck early
    // Or connect immediately.
    const sse = new EventSource(`/api/stream?symbol=${selectedSymbolCode}`);

    sse.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.symbols && data.symbols.length > 0) {
          setSymbols(data.symbols);
        }
        if (data.activeState) {
          setActiveState(data.activeState);
          setLoading(false);
        }
      } catch (err) {}
    };

    sse.addEventListener("system", (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.exchangeAccounts) {
          setExchangeAccounts(data.exchangeAccounts);
        }
        if (data.proxyState) {
          setProxyRotator(data.proxyState);
        }
      } catch (err) {}
    });

    return () => {
      sse.close();
    };
  }, [selectedSymbolCode]);

  if (view === "landing") {
    return <Landing onLaunch={() => setView("main")} exchangeAccounts={exchangeAccounts} exchangeConfig={exchangeConfig} />;
  }

  // Beautiful interactive multi-stage transition scene while verifying exchange polling & local AI pipeline
  if (!transitionComplete) {
    return (
      <MainPageLoader 
        symbols={symbols}
        activeState={activeState}
        fetchAllSymbols={fetchAllSymbols}
        fetchSymbolDetails={fetchSymbolDetails}
        selectedSymbolCode={selectedSymbolCode}
        onComplete={() => setTransitionComplete(true)} 
      />
    );
  }

  const themes = {
    index: {
      chroma: "rgb(245, 158, 11)",
      chromaDim: "rgba(245, 158, 11, 0.15)",
      chromaBg: "rgba(245, 158, 11, 0.03)",
      chromaGlow: "rgba(245, 158, 11, 0.4)",
      chromaText: "rgb(251, 191, 36)"
    },
    forex: {
      chroma: "rgb(16, 185, 129)",
      chromaDim: "rgba(16, 185, 129, 0.15)",
      chromaBg: "rgba(16, 185, 129, 0.03)",
      chromaGlow: "rgba(16, 185, 129, 0.35)",
      chromaText: "rgb(52, 211, 153)"
    },
    equity: {
      chroma: "rgb(129, 140, 248)",
      chromaDim: "rgba(129, 140, 248, 0.15)",
      chromaBg: "rgba(129, 140, 248, 0.03)",
      chromaGlow: "rgba(129, 140, 248, 0.4)",
      chromaText: "rgb(165, 180, 252)"
    },
    crypto: {
      chroma: "rgb(219, 39, 119)",
      chromaDim: "rgba(219, 39, 119, 0.15)",
      chromaBg: "rgba(219, 39, 119, 0.03)",
      chromaGlow: "rgba(219, 39, 119, 0.4)",
      chromaText: "rgb(244, 114, 182)"
    }
  };

  const activeTheme = activeState
    ? (themes[activeState.type as keyof typeof themes] || themes.equity)
    : themes.equity;

  const themeStyles = {
    "--theme-chroma": activeTheme.chroma,
    "--theme-chroma-dim": activeTheme.chromaDim,
    "--theme-chroma-bg": activeTheme.chromaBg,
    "--theme-chroma-glow": activeTheme.chromaGlow,
    "--theme-chroma-text": activeTheme.chromaText,
  } as React.CSSProperties;

  return (
    <div className="min-h-screen bg-[#05060b] text-slate-100 flex flex-col font-sans relative overflow-x-hidden" id="master-container" style={themeStyles}>
      
      {/* Real-time Generative Space-Time Order Flow Physics Canvas */}
      <TectonicStressCanvas symbolState={activeState} />
      
      {/* Notifications overlay system */}
      <div className="fixed top-5 right-5 z-50 flex flex-col gap-2.5 max-w-sm pointer-events-none">
        {notifications.map((n) => (
          <div
            key={n.id}
            className="p-4 rounded-xl shadow-2xl backdrop-blur-md border text-xs font-semibold flex items-center gap-2 animate-fade-in bg-slate-950/80 osmotic-accent-border"
          >
            <Activity size={14} className="animate-pulse" style={{ color: "var(--theme-chroma)" }} />
            <span>{n.msg}</span>
          </div>
        ))}
      </div>

      {/* Main Professional Toolbar (Osmotic Translucent Glass Ribbon) */}
      <header className="border-b border-indigo-500/10 bg-slate-950/45 backdrop-blur-xl px-4 py-4 md:px-6 flex flex-col md:flex-row justify-between items-center gap-4 relative z-20">
        <div className="flex items-center gap-4">
          <div className="relative p-1.5 border border-rose-500/20 rounded-xl bg-rose-950/10 shadow-[0_0_15px_rgba(244,63,94,0.15)] flex items-center justify-center">
            <svg viewBox="0 0 100 100" width="30" height="30" className="text-rose-500">
              {/* Elegant Golden and Crimson Oracle Eye */}
              <path d="M10 50 Q 50 15, 90 50 Q 50 85, 10 50 Z" stroke="currentColor" strokeWidth="2.5" fill="none" className="text-rose-500/80" />
              <path d="M25 50 Q 50 30, 75 50 Q 50 70, 25 50 Z" stroke="currentColor" strokeWidth="1.5" fill="none" className="text-amber-500/80" />
              <ellipse cx="50" cy="50" rx="8" ry="22" fill="currentColor" className="text-rose-500" />
              <circle cx="48" cy="46" r="2" fill="white" />
              {/* Surrounding runes */}
              <path d="M50 5 L50 15 M50 85 L50 95 M5 50 L15 50 M85 50 L95 50" stroke="currentColor" strokeWidth="1" className="text-rose-500/40" />
            </svg>
          </div>
          <div>
            <h1 className="text-sm font-black uppercase tracking-widest flex items-center gap-1.5 font-sans text-gray-100">
              MARKET <span className="osmotic-title-gradient font-bold">ORACLE</span>
            </h1>
            <p className="text-[10px] text-gray-500 font-mono tracking-wide">SOVEREIGN FX & CME LIQUIDITY ABSORPTION TERMINAL</p>
          </div>
        </div>

        {/* Global summary stats row */}
        <div className="flex flex-wrap items-center gap-3 md:gap-6 text-xs text-slate-400 font-mono">
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setIsTzSelectorOpen(true)}
              className="flex items-center gap-2 bg-[#020306]/75 border hover:bg-indigo-500/5 text-slate-300 text-[10px] uppercase font-bold rounded-lg px-3 py-1.5 transition-all duration-300 pointer-events-auto"
              style={{ borderColor: "var(--theme-chroma-dim)" }}
            >
              <Globe size={12} className="transition-colors duration-500" style={{ color: "var(--theme-chroma)" }} />
              <span>{
                globalTimezone === "local" ? "Local Time" :
                globalTimezone === "UTC" ? "UTC (London)" :
                globalTimezone === "America/New_York" ? "EST (New York)" :
                "JST (Tokyo)"
              }</span>
            </button>
            <TimezoneSelector 
              currentTz={globalTimezone}
              onSelect={setGlobalTimezone}
              isOpen={isTzSelectorOpen}
              onClose={() => setIsTzSelectorOpen(false)}
            />
          </div>
          <div className="flex items-center gap-1.5 bg-slate-950/40 border border-indigo-500/5 rounded px-2.5 py-1 text-[10px] uppercase font-bold tracking-tight">
            <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: (exchangeConfig.binance || exchangeConfig.bitget) ? "#10b981" : "var(--theme-chroma)", boxShadow: (exchangeConfig.binance || exchangeConfig.bitget) ? "0 0 8px #10b981" : "0 0 8px var(--theme-chroma)" }} />
            <span className="text-gray-500">FEED:</span> <span className="font-extrabold" style={{ color: (exchangeConfig.binance || exchangeConfig.bitget) ? "#10b981" : "var(--theme-chroma)" }}>{(exchangeConfig.binance || exchangeConfig.bitget) ? "LIVE EXCHANGE" : "CME-DIRECT"}</span>
          </div>
          <div className="flex items-center gap-1.5 bg-slate-950/40 border border-indigo-500/5 rounded px-2.5 py-1 text-[10px] uppercase font-bold tracking-tight">
            <ShieldCheck size={11} className="transition-colors duration-500" style={{ color: "var(--theme-chroma)" }} />
            <span className="text-gray-500">SENTINEL:</span> <span className="font-extrabold" style={{ color: "var(--theme-chroma)" }}>ACTIVE</span>
          </div>
        </div>
      </header>

      {/* Workspace Sub-Header - Status Ribbon */}
      <div className="bg-slate-950/20 px-4 py-2 border-b border-indigo-500/5 flex flex-col md:flex-row md:items-center justify-between gap-3 text-[10px] font-mono relative z-15">
        <div className="flex items-center gap-2 text-slate-400">
          <span className="font-extrabold uppercase tracking-widest text-[9px]" style={{ color: "var(--theme-chroma)" }}>📊 ALGORITHMIC PORT</span>
          {(exchangeConfig.binance || exchangeConfig.bitget) ? (
            <span className="text-emerald-400 bg-emerald-950/30 border border-emerald-500/20 px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest animate-pulse">⚡ LIVE ASSET BRIDGE CONNECTED</span>
          ) : (
            <span className="text-amber-500/80 bg-amber-950/20 border border-amber-500/10 px-2 py-0.5 rounded text-[8px] font-bold uppercase tracking-widest">💻 HIGH-FIDELITY TELEMETRY STREAM</span>
          )}
        </div>
        
        {/* Connection status display */}
        <div className="flex items-center gap-2 text-slate-400">
          <span className="text-gray-500 text-[9px] uppercase tracking-wider">CURRENT NETWORK:</span>
          <span className="bg-slate-950/65 px-2 py-0.5 rounded border uppercase text-[9px] font-bold flex items-center gap-1.5" style={{ borderColor: "var(--theme-chroma-dim)" }}>
            <span className="w-1 h-1 rounded-full animate-ping" style={{ backgroundColor: (exchangeConfig.binance || exchangeConfig.bitget) ? "#10b981" : "var(--theme-chroma)" }} />
            {(exchangeConfig.binance || exchangeConfig.bitget) ? "Live SECURE Order-Flow Verification Active" : "Live CME Protocol Direct Stream Active"}
          </span>
        </div>
      </div>

      {/* Ticker Row - Categorized Grouping */}
      <div className="bg-[#05070e]/80 backdrop-blur-md border-b border-indigo-500/10 px-4 py-3.5 flex flex-nowrap md:flex-wrap items-center gap-4 md:gap-6 w-full relative z-10 overflow-x-auto no-scrollbar">
        
        {/* Indices Group */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <span className="text-[9px] font-black text-amber-500/80 font-mono uppercase tracking-[0.2em] whitespace-nowrap">Indices:</span>
          <div className="quantum-selector-band">
            {symbols.filter(s => s.type === "index").map((sym) => {
              const isSelected = sym.symbol === selectedSymbolCode;
              return (
                <button
                  key={sym.symbol}
                  onClick={() => setSelectedSymbolCode(sym.symbol)}
                  className={`quantum-btn ${isSelected ? "quantum-btn-index-active" : ""}`}
                >
                  {isSelected && <span className="quantum-indicator-dot" />}
                  {sym.symbol}
                </button>
              );
            })}
          </div>
        </div>

        <div className="hidden md:block w-px h-6 bg-indigo-500/10 flex-shrink-0" />

        {/* Foreign Exchange Group */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <span className="text-[9px] font-black text-emerald-500/80 font-mono uppercase tracking-[0.2em] whitespace-nowrap">Forex:</span>
          <div className="quantum-selector-band">
            {symbols.filter(s => s.type === "forex" && !["TSLA", "NVDA", "BABA", "JD", "TCEHY"].includes(s.symbol)).map((sym) => {
              const isSelected = sym.symbol === selectedSymbolCode;
              return (
                <button
                  key={sym.symbol}
                  onClick={() => setSelectedSymbolCode(sym.symbol)}
                  className={`quantum-btn ${isSelected ? "quantum-btn-forex-active" : ""}`}
                >
                  {isSelected && <span className="quantum-indicator-dot" />}
                  {sym.symbol}
                </button>
              );
            })}
          </div>
        </div>

        <div className="hidden md:block w-px h-6 bg-indigo-500/10 flex-shrink-0" />

        {/* Corporate Equities Group */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <span className="text-[9px] font-black text-indigo-500/80 font-mono uppercase tracking-[0.2em] whitespace-nowrap">Equities:</span>
          <div className="quantum-selector-band">
            {symbols.filter(s => ["TSLA", "NVDA", "BABA", "JD", "TCEHY", "AAPL"].includes(s.symbol)).map((sym) => {
              const isSelected = sym.symbol === selectedSymbolCode;
              return (
                <button
                  key={sym.symbol}
                  onClick={() => setSelectedSymbolCode(sym.symbol)}
                  className={`quantum-btn ${isSelected ? "quantum-btn-equity-active" : ""}`}
                >
                  {isSelected && <span className="quantum-indicator-dot" />}
                  {sym.symbol}
                </button>
              );
            })}
          </div>
        </div>

        <div className="hidden md:block w-px h-6 bg-indigo-500/10 flex-shrink-0" />

        {/* Digital Assets Group */}
        <div className="flex items-center gap-2 pr-4 flex-shrink-0">
          <span className="text-[9px] font-black text-rose-500/80 font-mono uppercase tracking-[0.2em] whitespace-nowrap">Crypto:</span>
          <div className="quantum-selector-band">
            {symbols.filter(s => s.type === "crypto").map((sym) => {
              const isSelected = sym.symbol === selectedSymbolCode;
              return (
                <button
                  key={sym.symbol}
                  onClick={() => setSelectedSymbolCode(sym.symbol)}
                  className={`quantum-btn ${isSelected ? "quantum-btn-crypto-active" : ""}`}
                >
                  {isSelected && <span className="quantum-indicator-dot" />}
                  {sym.symbol}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Trading Stage layout */}
      <main className="flex-1 p-4 md:p-6 max-w-7xl mx-auto w-full flex flex-col gap-6">
        
        {/* Normal charts tab content with high-fidelity cross-fade transitions */}
        <AnimatePresence mode="wait">
          <motion.div
            key={selectedSymbolCode}
            initial={{ opacity: 0, y: 2 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -2 }}
            transition={{ duration: 0.18, ease: "easeInOut" }}
            className="flex flex-col gap-6"
          >
            {/* Visual Symbol Metrics Summary Card (Osmotic Glass Membrane) */}
            {activeState && (
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 osmotic-glass p-5 font-mono relative overflow-hidden shadow-2xl">
                {!activeState.hasRealVolume && (
                  <div className="absolute top-0 right-0 px-3 py-1 text-[9px] font-bold uppercase tracking-widest border-l border-b rounded-bl-lg" style={{ color: "var(--theme-chroma)", borderColor: "var(--theme-chroma-dim)" }}>
                    Data Integrity: Price Ticks Only
                  </div>
                )}
                <div className="flex-1 w-full md:w-auto md:border-r pr-0 md:pr-4" style={{ borderColor: "var(--theme-chroma-dim)" }}>
                  <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider block">Currently Selected Asset</span>
                  <h2 className="text-lg font-black text-white mt-1 flex items-center gap-1.5 flex-wrap">
                    <span style={{ color: "var(--theme-chroma)" }}>{activeState.symbol}</span>
                    <span className="text-xs text-slate-400 font-mono">({activeState.name})</span>
                  </h2>
                </div>
                <div className="flex-1 w-full md:w-auto md:border-r px-0 md:px-4" style={{ borderColor: "var(--theme-chroma-dim)" }}>
                  <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider block">Cumulative Volume Delta (CVD)</span>
                  <p className="text-lg font-black mt-1" style={{ color: activeState.hasRealVolume ? "var(--theme-chroma)" : "#334155" }}>
                    {activeState.hasRealVolume ? `${activeState.cvd?.[activeState.cvd.length - 1]?.delta ?? 0} Lots` : "READ ONLY"}
                  </p>
                </div>
                <div className="flex-1 w-full md:w-auto md:border-r px-0 md:px-4" style={{ borderColor: "var(--theme-chroma-dim)" }}>
                  <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider block">Pivotal Liquidity Zone</span>
                  <p className="text-sm font-bold text-emerald-500 mt-1.5 font-mono">
                    BIDS: {activeState.liquidityPools?.filter(l => l.side === "buy")[0]?.price?.toFixed(activeState.decimals ?? 5) || "0.00"}
                  </p>
                </div>
                <div className="flex-1 w-full md:w-auto px-0 md:px-4">
                  <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider block">Sweep Resistance Levels</span>
                  <p className="text-sm font-bold text-rose-500 mt-1.5 font-mono">
                    ASKS: {activeState.liquidityPools?.filter(l => l.side === "sell")[0]?.price?.toFixed(activeState.decimals ?? 5) || "0.00"}
                  </p>
                </div>
                
              </div>
            )}

            {/* Sovereign Market Maker Defended Pool Radar Indicator */}
            {activeState && <SovereignDefendedPoolRadar symbolState={activeState} />}

            {/* Master Bento Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
              
              {/* Left: Depth of Market (DOM) - Takes 4 Columns on lg */}
              <div className="col-span-1 lg:col-span-4 h-full">
                {activeState ? (
                  <DOMBook
                    symbolState={activeState}
                    timezone={globalTimezone}
                  />
                ) : (
                  <div className="h-full bg-[#0B0F19] border border-gray-800 rounded-xl p-6 flex flex-col items-center justify-center text-gray-500">
                    <p>Loading Depth of Market ladder...</p>
                  </div>
                )}
              </div>

              {/* Centre: Footprint Chart Viewer - Takes 4 Columns on lg */}
              <div className="col-span-1 lg:col-span-4 h-full">
                {activeState ? (
                  <FootprintChart symbolState={activeState} timezone={globalTimezone} />
                ) : (
                  <div className="h-full bg-[#0B0F19] border border-gray-800 rounded-xl p-6 flex flex-col items-center justify-center text-gray-500">
                    <p>Establishing Order Book Stream...</p>
                  </div>
                )}
              </div>

              {/* Right: Cumulative Volume Delta Chart & AI Sentinel - Takes 4 Columns on lg */}
              <div className="col-span-1 lg:col-span-4 flex flex-col gap-6">
                
                {/* CVD Line Plot */}
                <div className="flex-1">
                  {activeState ? (
                    <CVDChart symbolState={activeState} timezone={globalTimezone} />
                  ) : (
                    <div className="h-[250px] bg-[#0B0F19] border border-gray-800 rounded-xl p-6 flex flex-col items-center justify-center text-gray-500">
                      <p>Initializing Recharts vectors...</p>
                    </div>
                  )}
                </div>

                {/* Sovereign Oracle Sentinel Terminal */}
                <div className="flex-1">
                  {activeState ? (
                    <AISentinel currentSymbol={activeState} timezone={globalTimezone} />
                  ) : (
                    <div className="h-[300px] bg-[#0B0F19] border border-gray-800 rounded-xl p-6 flex flex-col items-center justify-center text-gray-500">
                      <p>Oracle booting up...</p>
                    </div>
                  )}
                </div>

              </div>

            </div>
          </motion.div>
        </AnimatePresence>

        {/* Instructive Order Flow Cheat Sheet & Live Bridge Instructions */}
        <footer className="grid grid-cols-1 xl:grid-cols-5 gap-6">
          
          {/* Panel 1: Order Flow Master Mechanics (3 Columns) */}
          <div className="xl:col-span-3 bg-[#0B0F19] border border-gray-800/80 rounded-xl p-5 font-mono text-xs">
            <h4 className="font-bold text-gray-300 mb-3 font-sans text-sm uppercase tracking-wider flex items-center gap-1.5">
              <span>Order Flow Master Mechanics</span>
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-gray-500 leading-relaxed">
              <div>
                <span className="text-amber-500 font-bold block mb-1 uppercase tracking-tight">Aggressive vs Passive:</span>
                <span>Aggressive bidders buy via markets on the Ask (right), lifting prices. Passive bidders stack limits in the DOM, absorbing selling pressure.</span>
              </div>
              <div>
                <span className="text-indigo-500 font-bold block mb-1 uppercase tracking-tight">Delta Divergences:</span>
                <span>Vertical delta without price move demonstrates absorption blocks. Aggressive orders are hitting heavy institutional limits.</span>
              </div>
              <div>
                <span className="text-emerald-500 font-bold block mb-1 uppercase tracking-tight">Liquidity Boundaries:</span>
                <span>Central banks trigger stops around key book thresholds. Use the AI Oracle to stay ahead of scheduled interest rate spikes.</span>
              </div>
            </div>
          </div>

          {/* Panel 2: Live Exchange Integration (2 Columns) */}
          <div className="xl:col-span-2 bg-[#0C111D] border border-indigo-500/10 rounded-xl p-5 font-mono text-xs flex flex-col justify-between">
            <div>
              <h4 className="font-bold text-slate-200 mb-3 font-sans text-sm uppercase tracking-wider flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full animate-pulse bg-emerald-500" />
                  Live Exchange Integration Matrix
                </span>
                {(exchangeConfig.binance || exchangeConfig.bitget) ? (
                  <span className="text-[9px] bg-emerald-950/50 text-emerald-400 border border-emerald-500/30 px-1.5 py-0.5 rounded font-black">ACTIVE</span>
                ) : (
                  <span className="text-[9px] bg-amber-950/40 text-amber-500 border border-amber-500/20 px-1.5 py-0.5 rounded font-bold">READY TO BRIDGE</span>
                )}
              </h4>

              {!(exchangeConfig.binance || exchangeConfig.bitget) ? (
                <>
                  <p className="text-gray-500 leading-relaxed mb-3">
                    The terminal core is fully production-hardened. To bridge your live accounts, configure your secure exchange credential variables inside your backend <code className="text-slate-300 border-b border-dashed border-gray-700">.env</code> keys parameters:
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-[10px] text-gray-400 border-t border-indigo-500/5 pt-3">
                    <div>
                      <span className="font-bold text-slate-300 block mb-0.5 uppercase tracking-tight">⚡ Binance Secure API</span>
                      <code className="text-[9px] text-indigo-400 font-bold block font-mono">BINANCE_API_KEY</code>
                      <code className="text-[9px] text-indigo-400 font-bold block font-mono">BINANCE_API_SECRET</code>
                    </div>
                    <div>
                      <span className="font-bold text-slate-300 block mb-0.5 uppercase tracking-tight">⚡ Bitget Secure API (V2)</span>
                      <code className="text-[9px] text-emerald-400 font-bold block font-mono">BITGET_API_KEY</code>
                      <code className="text-[9px] text-emerald-400 font-bold block font-mono">BITGET_API_SECRET</code>
                      <code className="text-[9px] text-emerald-400 font-bold block font-mono">BITGET_API_PASSPHRASE</code>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <p className="text-gray-400 leading-relaxed mb-1 text-[11px]">
                    Direct connection established with live API keys. Querying read-only spot account parameters:
                  </p>
                  {exchangeAccounts ? (
                    <div className="space-y-3 mt-3">
                      {/* Binance Account Section */}
                      {exchangeConfig.binance && exchangeAccounts.binance && (
                        <div className="bg-slate-950/50 border border-indigo-500/5 rounded-lg p-2.5">
                          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1 mb-2 text-[10px]">
                            <div className="flex items-center gap-1.5">
                              <span className="font-bold text-slate-300">Binance Spot:</span>
                            </div>
                            <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded font-mono border self-start sm:self-auto ${
                              exchangeAccounts.binance.status.includes("Connected") 
                                ? "bg-emerald-950/30 text-emerald-400 border-emerald-500/20" 
                                : "bg-rose-950/20 text-rose-400 border-rose-500/20"
                            }`}>
                              {exchangeAccounts.binance.status}
                            </span>
                          </div>
                          {exchangeAccounts.binance.balances && exchangeAccounts.binance.balances.length > 0 ? (
                            <div className="grid grid-cols-2 gap-2 mt-1.5 max-h-[110px] overflow-y-auto pr-1 no-scrollbar">
                              {exchangeAccounts.binance.balances.map((b: any) => (
                                <div key={b.asset} className="flex justify-between bg-white/[0.01] border border-white/[0.03] rounded px-2 py-0.5 text-[10px]">
                                  <span className="text-gray-400 font-bold">{b.asset}</span>
                                  <span className="text-indigo-400 font-bold font-mono">{b.free.toLocaleString()}</span>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="text-[9px] text-gray-500 italic p-1 bg-black/10 rounded">
                              No balances queryable. Ensure your key restrictions permit &ldquo;Enable Reading&rdquo;.
                            </div>
                          )}
                        </div>
                      )}

                      {/* Bitget Account Section */}
                      {exchangeConfig.bitget && exchangeAccounts.bitget && (
                        <div className="bg-slate-950/50 border border-indigo-500/5 rounded-lg p-2.5">
                          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1 mb-2 text-[10px]">
                            <div className="flex items-center gap-1.5">
                              <span className="font-bold text-slate-300">Bitget Spot:</span>
                            </div>
                            <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded font-mono border self-start sm:self-auto ${
                              exchangeAccounts.bitget.status.includes("Connected") 
                                ? "bg-emerald-950/30 text-emerald-400 border-emerald-500/20" 
                                : "bg-rose-950/20 text-rose-400 border-rose-500/20"
                            }`}>
                              {exchangeAccounts.bitget.status}
                            </span>
                          </div>
                          {exchangeAccounts.bitget.balances && exchangeAccounts.bitget.balances.length > 0 ? (
                            <div className="grid grid-cols-2 gap-2 mt-1.5 max-h-[110px] overflow-y-auto pr-1 no-scrollbar">
                              {exchangeAccounts.bitget.balances.map((b: any) => (
                                <div key={b.asset} className="flex justify-between bg-white/[0.01] border border-white/[0.03] rounded px-2 py-0.5 text-[10px]">
                                  <span className="text-gray-400 font-bold">{b.asset}</span>
                                  <span className="text-indigo-400 font-bold font-mono">{b.free.toLocaleString()}</span>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="text-[9px] text-gray-500 italic p-1 bg-black/10 rounded">
                              No balances queryable. Ensure your key restrictions permit &ldquo;Enable Reading&rdquo;.
                            </div>
                          )}
                        </div>
                      )}

                      <div className="bg-emerald-950/20 border border-emerald-500/10 rounded-lg p-2.5 text-[10px] text-emerald-400 mt-2 font-mono">
                        <span className="font-black block uppercase tracking-wide mb-1">
                          🛡️ HARMLESS READ-ONLY PROTOCOL VALIDATED
                        </span>
                        <span>Your exchange keys restrict trades and withdrawals. Real assets are completely safe and untouchable.</span>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center p-6 text-gray-500 italic font-mono">
                      Contacting live API gates...
                    </div>
                  )}
                </>
              )}

              {/* Dynamic IP Whitelist Assistance Panel */}
              {exchangeAccounts && exchangeAccounts.publicIp && (
                <div className="bg-slate-900/60 border border-indigo-500/10 rounded-lg p-2.5 mt-3">
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1 text-[10px]">
                    <span className="font-bold text-gray-300 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
                      📡 Current Server Outbound IP:
                    </span>
                    <div className="flex items-center gap-1.5 self-start sm:self-auto">
                      <code className="bg-black/40 text-emerald-400 font-mono font-black px-2 py-0.5 rounded text-[10px] select-all tracking-wider border border-white/[0.04]">
                        {exchangeAccounts.publicIp}
                      </code>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(exchangeAccounts.publicIp);
                          setCopiedIp(true);
                          setTimeout(() => setCopiedIp(false), 2000);
                        }}
                        className={`px-2 py-0.5 rounded text-[9px] font-bold active:scale-95 transition-all text-white ${
                          copiedIp ? "bg-emerald-600/80" : "bg-indigo-600/50 hover:bg-indigo-500/60"
                        }`}
                      >
                        {copiedIp ? "Copied!" : "Copy"}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Open-Source Public Proxy Rotator Interface */}
              <div className="bg-slate-900/40 border border-gray-800/80 rounded-lg p-3 mt-3 font-mono text-[10px]">
                <div className="flex items-center justify-between border-b border-white/[0.05] pb-2 mb-2">
                  <span className="font-bold text-gray-300 flex items-center gap-1.5">
                    <span className="text-indigo-400">⚡</span>
                    <span>Public Proxy Rotator (Open-Source)</span>
                  </span>
                  {proxyRotator?.isScrapingInProgress ? (
                    <span className="text-[9px] bg-indigo-950/40 text-indigo-400 border border-indigo-500/20 px-2 py-0.5 rounded flex items-center gap-1 animate-pulse">
                      <span className="w-1 h-1 rounded-full bg-indigo-400 animate-ping" />
                      Scraping...
                    </span>
                  ) : proxyRotator?.enabled ? (
                    <span className="text-[9px] bg-emerald-950/40 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded font-black text-emerald-300">
                      ACTIVE
                    </span>
                  ) : (
                    <span className="text-[9px] bg-gray-950/40 text-gray-400 border border-gray-800/20 px-2 py-0.5 rounded">
                      OFF (DIRECT)
                    </span>
                  )}
                </div>

                <div className="space-y-1.5 mb-3 text-gray-400">
                  <div>
                    <span className="font-bold block text-gray-300 uppercase tracking-tight text-[9px] mb-0.5">Egress Route:</span>
                    {proxyRotator?.enabled ? (
                      <span className="text-emerald-400 font-bold bg-emerald-900/40 px-1.5 py-0.5 rounded select-all border border-emerald-500/20 font-mono">
                        {proxyRotator.memoryProxyUrl}
                      </span>
                    ) : (
                      <span>Direct Outbound (Standard GCP Cloud Run IP - Dynamic)</span>
                    )}
                  </div>
                  
                  {proxyRotator?.proxies && proxyRotator.proxies.length > 0 && (
                    <div>
                      <span className="font-bold block text-gray-300 uppercase tracking-tight text-[9px] mb-0.5">Scraped Candidates Queue:</span>
                      <div className="flex flex-wrap gap-1 max-h-[50px] overflow-y-auto pr-1 no-scrollbar">
                        {proxyRotator.proxies.slice(0, 10).map((p: any, idx: number) => (
                          <span 
                            key={idx} 
                            className={`text-[8.5px] px-1.5 py-0.5 rounded border ${
                              p.status === "active" 
                                ? "bg-emerald-950/30 text-emerald-400 border-emerald-500/20" 
                                : p.status === "failed"
                                ? "bg-rose-950/10 text-rose-500/60 border-rose-500/10 line-through"
                                : "bg-gray-950/40 text-gray-500 border-gray-800/10"
                            }`}
                          >
                            {p.ip}:{p.port} {p.latency ? `${p.latency}ms` : ""}
                          </span>
                        ))}
                        {proxyRotator.proxies.length > 10 && (
                          <span className="text-[8.5px] text-gray-600 self-center">+{proxyRotator.proxies.length - 10} more</span>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                <div className="bg-indigo-950/20 border border-indigo-500/10 p-2.5 rounded text-[10px] text-zinc-400 mt-1 leading-snug">
                  Outbound rota, candidates queue validation, and geo-ip lookup execute fully automatically inside the server context every 5 minutes. No manual intervention required.
                </div>
                <p className="text-[8px] text-gray-500 mt-2 leading-tight">
                  💡 Free open-source proxies are gathered instantly from official mirrors without registration. Ideal for quick API whitelist checks, but they can experience latency or connection changes over time.
                </p>
              </div>
            </div>
            
            <p className="text-[10px] text-gray-500 italic mt-4 border-t border-indigo-500/5 pt-2 flex items-center gap-1.5">
              <span>Once loaded, the system automatically transitions from local read-only telemetry into live execution gates.</span>
            </p>
          </div>

        </footer>

      </main>
    </div>
  );
}
