import React, { useState, useEffect } from "react";
import { motion } from "motion/react";
import { ArrowRight, Cpu, ShieldCheck, Zap } from "lucide-react";
import { Typewriter } from "./Typewriter";
import { Dragon } from "./Dragon";
import TectonicStressCanvas from "./TectonicStressCanvas";

interface LandingProps {
  onLaunch: () => void;
  exchangeAccounts?: any;
  exchangeConfig?: any;
}

export default function Landing({ onLaunch, exchangeAccounts, exchangeConfig }: LandingProps) {
  const [titleText, setTitleText] = useState("");
  const [titleState, setTitleState] = useState<"typing" | "loading" | "deleting" | "waiting">("typing");
  const fullTitle = "THE MARKET ORACLE AWAITS...";

  useEffect(() => {
    let timer: NodeJS.Timeout;

    const tick = () => {
      if (titleState === "typing") {
        if (titleText.length < fullTitle.length) {
          setTitleText(fullTitle.slice(0, titleText.length + 1));
          timer = setTimeout(tick, 70);
        } else {
          setTitleState("loading");
        }
      } else if (titleState === "loading") {
        // Dwelling period showing portal loading state
        timer = setTimeout(() => {
          setTitleState("deleting");
        }, 3500);
      } else if (titleState === "deleting") {
        if (titleText.length > 0) {
          setTitleText(fullTitle.slice(0, titleText.length - 1));
          timer = setTimeout(tick, 30);
        } else {
          setTitleState("waiting");
        }
      } else if (titleState === "waiting") {
        // Waiting stage before restarting
        timer = setTimeout(() => {
          setTitleState("typing");
        }, 1200);
      }
    };

    if (titleState === "typing" || titleState === "deleting") {
      timer = setTimeout(tick, titleState === "deleting" ? 30 : 70);
    } else {
      tick();
    }

    return () => clearTimeout(timer);
  }, [titleText, titleState]);

  return (
    <div className="min-h-screen bg-[#02050e] text-gray-200 flex flex-col items-center justify-center p-6 relative overflow-hidden">
      
      {/* 1. Base High-Chroma Cybernetic Grid with Radial Vignette */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(244,63,94,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(244,63,94,0.03)_1px,transparent_1px)] bg-[size:45px_45px] pointer-events-none z-0" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_15%,#02040a_85%)] pointer-events-none z-0" />

      {/* 1a. Massive Central Sovereign Draconic Sigil Engine (Glorious, dense background vectors) */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[85%] max-w-4xl h-[85%] max-h-4xl pointer-events-none z-0 opacity-25 select-none overflow-visible flex items-center justify-center">
        {/* Intricate Celestial Rotating Outer Ring */}
        <motion.svg
          viewBox="0 0 500 500"
          className="absolute w-full h-full text-rose-500/25"
          animate={{ rotate: 360 }}
          transition={{ duration: 75, repeat: Infinity, ease: "linear" }}
        >
          <circle cx="250" cy="250" r="230" stroke="currentColor" strokeWidth="1" strokeDasharray="3 9" fill="none" />
          <circle cx="250" cy="250" r="210" stroke="currentColor" strokeWidth="0.75" strokeDasharray="25 150" fill="none" />
          <circle cx="250" cy="250" r="190" stroke="currentColor" strokeWidth="1.5" strokeDasharray="4 4" fill="none" />
          {/* Compass labels around outer dial */}
          <text x="245" y="45" fill="currentColor" className="text-[10px] font-mono font-bold">000° NORTH_GATE</text>
          <text x="435" y="254" fill="currentColor" className="text-[10px] font-mono font-bold">090° EAST</text>
          <text x="245" y="465" fill="currentColor" className="text-[10px] font-mono font-bold">180° SOUTH_GATE</text>
          <text x="25" y="254" fill="currentColor" className="text-[10px] font-mono font-bold">270° WEST</text>
          {/* Concentric tick marks inside compass */}
          {Array.from({ length: 48 }).map((_, i) => {
            const angle = (i * 360) / 48;
            const x1 = 250 + 175 * Math.cos((angle * Math.PI) / 180);
            const y1 = 250 + 175 * Math.sin((angle * Math.PI) / 180);
            const x2 = 250 + 190 * Math.cos((angle * Math.PI) / 180);
            const y2 = 250 + 190 * Math.sin((angle * Math.PI) / 180);
            return (
              <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="currentColor" strokeWidth={i % 4 === 0 ? "1.5" : "0.5"} />
            );
          })}
        </motion.svg>

        {/* Counter-Rotating Celestial Inner Ring (Amber Glow) */}
        <motion.svg
          viewBox="0 0 500 500"
          className="absolute w-[80%] h-[80%] text-amber-500/20"
          animate={{ rotate: -360 }}
          transition={{ duration: 50, repeat: Infinity, ease: "linear" }}
        >
          <circle cx="250" cy="250" r="150" stroke="currentColor" strokeWidth="1" strokeDasharray="8 12" fill="none" />
          <circle cx="250" cy="250" r="130" stroke="currentColor" strokeWidth="0.75" fill="none" />
          {/* Inner multi-point dragon summon polygon */}
          <path d="M 250,100 L 379,175 L 379,325 L 250,400 L 121,325 L 121,175 Z" stroke="currentColor" strokeWidth="1" fill="none" />
          <path d="M 250,100 L 379,325 L 121,325 Z M 250,400 L 121,175 L 379,175 Z" stroke="currentColor" strokeWidth="0.5" fill="none" />
          <circle cx="250" cy="250" r="100" stroke="currentColor" strokeWidth="2" strokeDasharray="40 10" fill="none" />
        </motion.svg>

        {/* Core Pulsating Draconic Seed Sigil (Violet-Indigo Ring) */}
        <motion.svg
          viewBox="0 0 500 500"
          className="absolute w-[50%] h-[50%] text-indigo-500/25"
          animate={{ scale: [0.98, 1.05, 0.98] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        >
          <circle cx="250" cy="250" r="85" stroke="currentColor" strokeWidth="2" fill="none" />
          <circle cx="250" cy="250" r="45" stroke="currentColor" strokeWidth="0.75" strokeDasharray="1 3" fill="none" />
          {/* Rune segments */}
          <path d="M 250,5 T 250,16 M 250,495 T 250,484 M 5,250 T 16,250 M 495,250 T 484,250" stroke="currentColor" strokeWidth="1" />
        </motion.svg>
      </div>

      {/* 1b. Interstitial Metric Tick Marks / Cybernetic Scale Rulers (Far edges) */}
      <div className="absolute top-0 bottom-0 left-6 w-[1px] bg-rose-500/10 hidden md:block pointer-events-none z-0">
        <div className="sticky top-0 h-screen flex flex-col justify-between py-12 text-[9px] font-mono text-rose-500/40 select-none">
          <span>[SYS_INIT]</span>
          <span>LATENCY: 0.12ms</span>
          <span>CHROMA FLOW</span>
          <span>GRID_H: 3450m v2</span>
          <span>SEC_MATRIX_OFF</span>
          <span>[END_TICK]</span>
        </div>
      </div>
      <div className="absolute top-0 bottom-0 right-6 w-[1px] bg-amber-500/10 hidden md:block pointer-events-none z-0">
        <div className="sticky top-0 h-screen flex flex-col justify-between py-12 text-[9px] font-mono text-amber-500/40 text-right select-none">
          <span>PORTAL_ACTIVE</span>
          <span>RECV_BANDWIDTH // OK</span>
          <span>TStress: MAX</span>
          <span>COGNITIVE_CORE_v5</span>
          <span>KAS_STABLE_RATE</span>
          <span>[0x7F43...F27]</span>
        </div>
      </div>

      {/* Horizontal Graphic Decals (HUD Headers and Footers) */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 w-[90%] max-w-6xl flex justify-between items-center text-[10px] font-mono text-rose-500/[0.35] tracking-[0.25em] pointer-events-none z-10 uppercase select-none">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
          <span>Sovereign Market Engine</span>
        </div>
        <div className="hidden sm:block">STATUS: ORACLE LINK ONLINE</div>
        <div>UTC: {new Date().toISOString().slice(11, 19)}</div>
      </div>

      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-[90%] max-w-6xl flex justify-between items-center text-[9px] font-mono text-gray-500/40 tracking-[0.2em] pointer-events-none z-10 uppercase select-none">
        <div>ORACLE TELEMETRY CHRONICLES</div>
        <div className="hidden sm:block">STATUS: SECURE MATCH CORES</div>
        <div>EST. LATENCY: 1.4ms</div>
      </div>

      {/* Decorative Technical HUD Brackets at corners */}
      <div className="absolute top-8 left-8 w-12 h-12 border-t-2 border-l-2 border-rose-500/30 pointer-events-none z-0 hidden lg:block rounded-tl-md">
        <div className="w-2 h-2 bg-rose-500 absolute top-0 left-0" />
      </div>
      <div className="absolute top-8 right-8 w-12 h-12 border-t-2 border-r-2 border-amber-500/30 pointer-events-none z-0 hidden lg:block rounded-tr-md">
        <div className="w-2 h-2 bg-amber-500 absolute top-0 right-0" />
      </div>
      <div className="absolute bottom-8 left-8 w-12 h-12 border-b-2 border-l-2 border-indigo-500/30 pointer-events-none z-0 hidden lg:block rounded-bl-md">
        <div className="w-2 h-2 bg-indigo-500 absolute bottom-0 left-0" />
      </div>
      <div className="absolute bottom-8 right-8 w-12 h-12 border-b-2 border-r-2 border-rose-500/30 pointer-events-none z-0 hidden lg:block rounded-br-md">
        <div className="w-2 h-2 bg-rose-500 absolute bottom-0 right-0" />
      </div>

      {/* Cybernetic Telemetry Sidebar Modules (Data Pillars) */}
      <div className="absolute top-1/4 left-10 w-44 flex flex-col gap-6 text-[10px] font-mono text-slate-500/40 pointer-events-none select-none z-0 hidden xl:flex">
        <div className="p-3 border border-slate-800 bg-slate-950/40 rounded-xl space-y-1.5">
          <div className="text-rose-500/60 font-bold uppercase tracking-wider">ORACLE CONTROLLER</div>
          <div className="flex justify-between"><span>CPU0_CORE :</span> <span className="text-emerald-500">92.4%</span></div>
          <div className="flex justify-between"><span>TEMP :</span> <span className="text-amber-500">41.8C</span></div>
          <div className="flex justify-between"><span>FANS :</span> <span>100%</span></div>
        </div>
        <div className="p-3 border border-slate-800 bg-slate-950/40 rounded-xl space-y-1.5">
          <div className="text-amber-500/60 font-bold uppercase tracking-wider">NETWORK MESH</div>
          <div className="flex justify-between"><span>SYS_DOCK :</span> <span className="text-amber-500">ACTIVE</span></div>
          <div className="flex justify-between"><span>GATE_R :</span> <span>491/sc</span></div>
          <div className="flex justify-between"><span>SIG_L :</span> <span className="text-emerald-500">99.8%</span></div>
        </div>
      </div>

      <div className="absolute top-1/4 right-10 w-44 flex flex-col gap-6 text-[10px] font-mono text-slate-500/40 pointer-events-none select-none z-0 hidden xl:flex">
        <div className="p-3 border border-slate-800 bg-slate-950/40 rounded-xl space-y-1.5">
          <div className="text-indigo-400 font-bold uppercase tracking-wider">LIQUID SHARDS</div>
          <div className="flex justify-between"><span>CME_FEED :</span> <span className="text-emerald-500">LIVE</span></div>
          <div className="flex justify-between"><span>MEM_RE :</span> <span>2.84 GB</span></div>
          <div className="flex justify-between"><span>STAB_C :</span> <span className="text-indigo-400">SECURE</span></div>
        </div>
        <div className="p-3 border border-slate-800 bg-slate-950/40 rounded-xl space-y-1.5">
          <div className="text-rose-500/60 font-bold uppercase tracking-wider">ATTORT_EST</div>
          <div className="flex justify-between"><span>X_RATIO :</span> <span>1.042m</span></div>
          <div className="flex justify-between"><span>Y_AXIS :</span> <span>0.849n</span></div>
          <div className="flex justify-between"><span>W_WAVE :</span> <span className="text-rose-400">114.2Hz</span></div>
        </div>
      </div>

      {/* 2. Soft Ambient Drift Gradients */}
      <div className="absolute top-[8%] left-[12%] w-[420px] h-[420px] rounded-full bg-rose-500/[0.04] blur-[140px] pointer-events-none z-0 animate-pulse" />
      <div className="absolute bottom-[10%] right-[18%] w-[480px] h-[480px] rounded-full bg-amber-500/[0.04] blur-[150px] pointer-events-none z-0 animate-pulse" />
      <div className="absolute top-[45%] left-[45%] w-[350px] h-[350px] rounded-full bg-indigo-500/[0.03] blur-[120px] pointer-events-none z-0 animate-pulse" />

      {/* 3. Infinite Scanline Sweep Beam */}
      <motion.div
        initial={{ y: "-100%" }}
        animate={{ y: "150%" }}
        transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
        className="absolute inset-x-0 h-56 bg-gradient-to-b from-transparent via-rose-500/[0.03] to-transparent pointer-events-none z-0"
      />

      {/* 4. Draconic Cybernetic Star-Wyrm Sigils (Synthesized Constellations) */}
      <div className="absolute top-14 left-14 w-96 h-96 opacity-25 pointer-events-none select-none hidden lg:block z-0">
        <motion.svg
          viewBox="0 0 200 200"
          width="100%"
          height="100%"
          className="text-rose-500/25"
          animate={{ rotate: 360 }}
          transition={{ duration: 90, repeat: Infinity, ease: "linear" }}
        >
          <circle cx="100" cy="100" r="85" stroke="currentColor" strokeWidth="0.75" strokeDasharray="3 6" fill="none" />
          <circle cx="100" cy="100" r="65" stroke="currentColor" strokeWidth="0.5" fill="none" />
          <circle cx="100" cy="100" r="95" stroke="currentColor" strokeWidth="1.5" strokeDasharray="50 150" fill="none" />
          <path d="M 100 5 L 100 195 M 5 100 L 195 100" stroke="currentColor" strokeWidth="0.5" strokeDasharray="1 5" />
          {/* Inner concentric runes */}
          <circle cx="100" cy="100" r="45" stroke="currentColor" strokeWidth="0.5" strokeDasharray="2 3" fill="none" />
        </motion.svg>
      </div>

      <div className="absolute bottom-14 right-14 w-[420px] h-[420px] opacity-25 pointer-events-none select-none hidden lg:block z-0">
        <motion.svg
          viewBox="0 0 200 200"
          width="100%"
          height="100%"
          className="text-amber-500/25"
          animate={{ rotate: -360 }}
          transition={{ duration: 120, repeat: Infinity, ease: "linear" }}
        >
          <circle cx="100" cy="100" r="90" stroke="currentColor" strokeWidth="0.75" strokeDasharray="6 10" fill="none" />
          <circle cx="100" cy="100" r="75" stroke="currentColor" strokeWidth="0.5" fill="none" />
          <circle cx="100" cy="100" r="55" stroke="currentColor" strokeWidth="1" strokeDasharray="100 15" fill="none" />
          {/* Star polygon inside */}
          <path d="M100,25 L162,135 L38,135 Z" stroke="currentColor" strokeWidth="0.75" fill="none" />
          <path d="M100,175 L38,65 L162,65 Z" stroke="currentColor" strokeWidth="0.75" fill="none" />
        </motion.svg>
      </div>

      {/* Real-time Generative Space-Time Order Flow Physics Canvas */}
      <TectonicStressCanvas symbolState={null} />
      
      {/* Dragon Flying */}
      <Dragon />
      
      <div className="max-w-2xl w-full z-10 p-8 md:p-12 transition-all duration-700 flex flex-col items-center text-center">
        {/* Glowing Oracle Emblems / Eye of the Sovereign Oracle */}
        <div className="relative p-6 border border-rose-500/20 rounded-full bg-rose-950/10 mb-8 shadow-[0_0_60px_rgba(244,63,94,0.15)] flex items-center justify-center">
          <svg viewBox="0 0 100 100" width="56" height="56" className="text-rose-500">
            {/* Elegant Golden and Crimson Oracle Eye */}
            <path d="M10 50 Q 50 15, 90 50 Q 50 85, 10 50 Z" stroke="currentColor" strokeWidth="2.5" fill="none" className="text-rose-500/80" />
            <path d="M25 50 Q 50 30, 75 50 Q 50 70, 25 50 Z" stroke="currentColor" strokeWidth="1.5" fill="none" className="text-amber-500/80" />
            <ellipse cx="50" cy="50" rx="8" ry="22" fill="currentColor" className="text-rose-500" />
            <circle cx="48" cy="46" r="2" fill="white" />
            {/* Surrounding runes */}
            <path d="M50 5 L50 15 M50 85 L50 95 M5 50 L15 50 M85 50 L95 50" stroke="currentColor" strokeWidth="1" className="text-rose-500/40" />
          </svg>
        </div>

        <h1 className={`text-4xl md:text-[44px] font-black tracking-widest mb-10 font-sans uppercase flex items-center justify-center min-h-[64px] transition-all duration-500 ${titleState === "loading" ? "text-rose-500 animate-pulse drop-shadow-[0_0_15px_rgba(244,63,94,0.5)]" : "text-white"}`}>
          {titleText}
        </h1>

        <p className="text-slate-400 text-sm md:text-[15px] mb-10 max-w-lg leading-relaxed font-mono uppercase tracking-wider">
          Unleash the <span className="text-rose-400 font-bold">Sovereign Liquidity Matrix</span>. Commune with multi-agent cognitive cores, real-time foot-printing, and sovereign order flow telemetry.
        </p>

        <div className="mb-6" />

        <button
          onClick={onLaunch}
          className="group flex items-center gap-3 bg-rose-950/20 border border-rose-500/20 text-white px-10 py-5 rounded-full font-black text-sm uppercase tracking-widest hover:bg-rose-500/20 hover:border-rose-500/50 transition-all hover:shadow-[0_0_35px_rgba(244,63,94,0.25)] shadow-lg font-mono relative overflow-hidden active:scale-95"
        >
          Consult The Market Oracle
          <ArrowRight size={16} className="group-hover:translate-x-1.5 transition-transform text-rose-500" />
        </button>
      </div>
    </div>
  );
}
