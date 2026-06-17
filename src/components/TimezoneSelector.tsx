import React from "react";
import { Globe, X, CheckCircle2, Circle } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface TimezoneSelectorProps {
  currentTz: string;
  onSelect: (tz: string) => void;
  isOpen: boolean;
  onClose: () => void;
}

const timezones = [
  { value: "local", label: "LOCAL TIME" },
  { value: "UTC", label: "UTC (LONDON)" },
  { value: "America/New_York", label: "EST (NEW YORK)" },
  { value: "Asia/Tokyo", label: "JST (TOKYO)" },
];

export default function TimezoneSelector({ currentTz, onSelect, isOpen, onClose }: TimezoneSelectorProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100]"
          />
          
          {/* Modal Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-x-4 top-1/4 md:inset-x-auto md:left-1/2 md:-translate-x-1/2 md:w-[450px] bg-[#07090F] border border-gray-800/80 rounded-[40px] shadow-[0_25px_80px_-15px_rgba(0,0,0,0.8)] z-[101] overflow-hidden"
          >
            <div className="p-8">
              <div className="flex items-center justify-between mb-10">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-indigo-500/10 rounded-2xl border border-indigo-500/20">
                    <Globe className="text-indigo-400" size={28} />
                  </div>
                  <div>
                    <h2 className="text-2xl font-black text-white tracking-tighter uppercase italic leading-none">Global Epoch</h2>
                    <p className="text-[10px] text-gray-500 font-bold tracking-[0.2em] uppercase mt-1">Select Active Feed Timezone</p>
                  </div>
                </div>
                <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full text-gray-500 transition-colors">
                  <X size={24} />
                </button>
              </div>

              <div className="flex flex-col gap-4">
                {timezones.map((tz) => {
                  const isSelected = currentTz === tz.value;
                  return (
                    <button
                      key={tz.value}
                      onClick={() => {
                        onSelect(tz.value);
                        onClose();
                      }}
                      className={`group flex items-center justify-between p-6 rounded-[28px] border transition-all duration-500 ${
                        isSelected 
                        ? "bg-indigo-500/10 border-indigo-500/40 shadow-[0_0_40px_rgba(99,102,241,0.05)]" 
                        : "bg-gray-900/20 border-gray-800/40 hover:border-gray-700/60 hover:bg-gray-800/20"
                      }`}
                    >
                      <span className={`text-2xl font-black tracking-tight transition-all duration-300 ${isSelected ? 'text-indigo-400 scale-105 origin-left' : 'text-gray-500 group-hover:text-gray-300'}`}>
                        {tz.label}
                      </span>
                      
                      <div className="relative flex items-center justify-center">
                        <div className={`w-10 h-10 rounded-full border-2 transition-all duration-500 flex items-center justify-center ${
                          isSelected ? 'border-indigo-500 bg-indigo-500/20 shadow-[0_0_20px_rgba(99,102,241,0.2)]' : 'border-gray-800 bg-black/20'
                        }`}>
                          {isSelected ? (
                            <motion.div 
                              layoutId="tz-active"
                              className="w-4 h-4 bg-indigo-500 rounded-full shadow-[0_0_15px_rgba(99,102,241,1)]" 
                            />
                          ) : (
                            <Circle size={16} className="text-gray-800 opacity-0 group-hover:opacity-100 transition-opacity" />
                          )}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
              
              <div className="mt-10 pt-8 border-t border-gray-800/30 text-center">
                <p className="text-[9px] text-gray-600 font-mono tracking-[0.4em] uppercase">
                  Sovereign Verdict Protocol // Temporal Sync Verified
                </p>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
