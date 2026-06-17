import { motion } from "motion/react";

interface DargonProps {
  color: string;
  glowColor: string;
  delay: number;
  duration: number;
  yPath: string[];
  xPath: string[];
  scale: number;
  angle: number[];
  bodyType: "serpent" | "western" | "starwyrm" | "overlord";
}

const dargonList: DargonProps[] = [
  {
    color: "#f43f5e", // Crimson Fire Drake
    glowColor: "rgba(244, 63, 94, 0.95)",
    delay: 0,
    duration: 16,
    xPath: ["-300px", "105%"],
    yPath: ["5%", "25%", "15%"],
    angle: [10, -5, 12],
    scale: 1.4,
    bodyType: "serpent"
  },
  {
    color: "#10b981", // Emerald Wood Dragon
    glowColor: "rgba(16, 185, 129, 0.85)",
    delay: 3,
    duration: 22,
    xPath: ["105%", "-300px"],
    yPath: ["35%", "20%", "30%"],
    angle: [-12, 15, -10],
    scale: 1.2,
    bodyType: "western"
  },
  {
    color: "#6366f1", // Indigo Sovereign Star Wyrm
    glowColor: "rgba(99, 102, 241, 0.95)",
    delay: 6,
    duration: 14,
    xPath: ["-300px", "105%"],
    yPath: ["55%", "40%", "48%"],
    angle: [20, -10, 15],
    scale: 1.5,
    bodyType: "starwyrm"
  },
  {
    color: "#f59e0b", // Golden Aureate Overlord
    glowColor: "rgba(245, 158, 11, 0.9)",
    delay: 9,
    duration: 19,
    xPath: ["105%", "-300px"],
    yPath: ["20%", "45%", "35%"],
    angle: [-15, 25, -15],
    scale: 1.35,
    bodyType: "overlord"
  },
  {
    color: "#a855f7", // Purple Void Emperor
    glowColor: "rgba(168, 85, 247, 0.9)",
    delay: 4,
    duration: 24,
    xPath: ["-300px", "105%"],
    yPath: ["70%", "85%", "75%"],
    angle: [5, -15, 8],
    scale: 1.3,
    bodyType: "serpent"
  },
  {
    color: "#ec4899", // Magenta Zenith Leviathan
    glowColor: "rgba(236, 72, 153, 0.85)",
    delay: 11,
    duration: 20,
    xPath: ["105%", "-300px"],
    yPath: ["90%", "65%", "85%"],
    angle: [-10, 20, -12],
    scale: 1.45,
    bodyType: "western"
  }
];

export const Dragon = () => {
  return (
    <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
      {dargonList.map((dargon, index) => (
        <motion.div
          key={index}
          initial={{ left: dargon.xPath[0], top: dargon.yPath[0], opacity: 0, scale: dargon.scale }}
          animate={{
            left: dargon.xPath,
            top: dargon.yPath,
            rotate: dargon.angle,
            opacity: [0, 0.95, 0.95, 0],
          }}
          transition={{
            duration: dargon.duration,
            delay: dargon.delay,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute select-none"
          style={{ 
            filter: `drop-shadow(0 0 25px ${dargon.glowColor}) drop-shadow(0 0 10px ${dargon.color})` 
          }}
        >
          {/* Internal undulating wrapper to give the serpentine dragon realistic swimming/gliding motion */}
          <motion.div
            animate={{
              y: [0, -18, 18, 0],
              rotate: [0, 4, -4, 0]
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="relative"
          >
            {/* SVG Illustration of the High-Fidelity Dragon */}
            <svg
              viewBox="0 0 150 150"
              width="280"
              height="280"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              style={{ color: dargon.color }}
            >
              {/* SERPENTINE / EASTERN DRAGON DETAILED RENDER */}
              {dargon.bodyType === "serpent" && (
                <>
                  {/* Serpentine Body coils */}
                  <path
                    d="M 120,40 Q 100,20 80,45 T 40,30 T 10,60"
                    stroke={dargon.color}
                    strokeWidth="4"
                    strokeLinecap="round"
                    className="opacity-40"
                  />
                  {/* Detailed Dragon Skin scales line */}
                  <path
                    d="M 120,40 Q 100,20 80,45 T 40,30 T 10,60"
                    stroke="#ffffff"
                    strokeWidth="1.2"
                    strokeDasharray="2 3"
                    strokeLinecap="round"
                    className="opacity-90"
                  />
                  {/* Dragon Head */}
                  <path
                    d="M 115,35 L 135,32 L 140,42 L 125,48 Z"
                    fill={dargon.color}
                    className="opacity-90"
                  />
                  {/* Antlers/Horns */}
                  <path d="M 125,35 Q 130,15 140,12 M 120,38 Q 115,20 110,18" stroke="#ffffff" strokeWidth="1.5" strokeLinecap="round" />
                  {/* Roaring Dragon Mouth details */}
                  <path d="M 135,32 L 145,28 L 142,36 L 138,36" fill="#ffffff" />
                  {/* Glowing Dragon Red Eye */}
                  <circle cx="128" cy="38" r="1.8" fill="#ffffff" className="animate-ping" />
                  {/* Majestic Whiskers flowing in the wind */}
                  <motion.path
                    d="M 133,45 Q 145,55 130,70"
                    stroke="#ffffff"
                    strokeWidth="0.8"
                    animate={{ d: ["M 133,45 Q 145,55 130,70", "M 133,45 Q 150,50 135,65", "M 133,45 Q 145,55 130,70"] }}
                    transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                  />
                  {/* Glowing Flame mane around back of neck */}
                  <path d="M 115,34 C 110,25 105,35 100,32 C 95,28 98,40 90,38" stroke={dargon.color} strokeWidth="2.5" />
                </>
              )}

              {/* WESTERN DRAGON DETAILED RENDER */}
              {dargon.bodyType === "western" && (
                <>
                  {/* Sleek Muscular Dragon Body */}
                  <path
                    d="M 20,40 Q 45,15 70,45 T 120,50"
                    stroke={dargon.color}
                    strokeWidth="5.5"
                    strokeLinecap="round"
                    className="opacity-30"
                  />
                  <path
                    d="M 20,40 Q 45,15 70,45 T 120,50"
                    stroke="#ffffff"
                    strokeWidth="1"
                    strokeDasharray="4 4"
                    className="opacity-70"
                  />
                  {/* Powerful wings */}
                  <motion.path
                    d="M 45,25 Q 10, -10 25, -25 Q 45, -20 50, 15 Z"
                    fill={dargon.color}
                    fillOpacity="0.45"
                    stroke="#ffffff"
                    strokeWidth="1"
                    animate={{ rotate: [0, -15, 10, 0], transformOrigin: "45px 25px" }}
                    transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut" }}
                  />
                  <motion.path
                    d="M 55,25 Q 90, -10 75, -25 Q 55, -20 50, 15 Z"
                    fill={dargon.color}
                    fillOpacity="0.3"
                    stroke={dargon.color}
                    strokeWidth="1"
                    animate={{ rotate: [0, 15, -10, 0], transformOrigin: "55px 25px" }}
                    transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut", delay: 0.1 }}
                  />
                  {/* Fierce dragon head looking forward */}
                  <path d="M 110,48 L 132,55 L 125,62 L 105,52 Z" fill={dargon.color} />
                  <path d="M 120,52 L 135,46 L 126,54" stroke="#ffffff" strokeWidth="1.2" />
                  <circle cx="115" cy="52" r="1.5" fill="#ffffff" />
                  {/* Dragon claws / spikes on tail */}
                  <path d="M 118,50 L 122,50 M 10,38 L 15,40 M 5,42 L 8,42" stroke="#ffffff" strokeWidth="1.5" />
                </>
              )}

              {/* INDIGO SOVEREIGN STAR WYRM RENDER */}
              {dargon.bodyType === "starwyrm" && (
                <>
                  {/* Cosmic central stream */}
                  <path
                    d="M 10,75 C 35,45 65,105 100,75 C 115,60 130,75 140,75"
                    stroke={dargon.color}
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    className="opacity-70"
                  />
                  {/* Star dust constellation dots on body */}
                  <circle cx="22" cy="65" r="2" fill="#ffffff" className="animate-ping" />
                  <circle cx="50" cy="85" r="1.5" fill="#ffffff" />
                  <circle cx="85" cy="72" r="2.2" fill="#ffffff" />
                  <circle cx="115" cy="70" r="1.2" fill="#ffffff" />
                  
                  {/* Ethereal ribbon fin wings */}
                  <motion.path
                    d="M 65,70 Q 50,20 30,35 Q 50,55 65,70"
                    fill={dargon.color}
                    fillOpacity="0.5"
                    stroke="#ffffff"
                    strokeWidth="0.8"
                    animate={{ scaleX: [1, 0.7, 1.1, 1], scaleY: [1, 0.8, 1.15, 1], transformOrigin: "65px 70px" }}
                    transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
                  />
                  <motion.path
                    d="M 75,70 Q 90,20 110,35 Q 90,55 75,70"
                    fill={dargon.color}
                    fillOpacity="0.35"
                    stroke="#ffffff"
                    strokeWidth="0.8"
                    animate={{ scaleX: [1, 0.8, 1.2, 1], scaleY: [1, 0.7, 1.1, 1], transformOrigin: "75px 70px" }}
                    transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut", delay: 0.3 }}
                  />
                  {/* Wyrm Crown */}
                  <path d="M 135,70 L 148,75 L 138,82 Z" fill="#ffffff" />
                  <path d="M 135,68 Q 140,55 148,58" stroke={dargon.color} strokeWidth="1.5" />
                </>
              )}

              {/* GOLDEN AUREATE OVERLORD RENDER */}
              {dargon.bodyType === "overlord" && (
                <>
                  {/* Divine Golden Dragon body curve */}
                  <path
                    d="M 15,35 Q 40,75 75,35 T 135,45"
                    stroke={dargon.color}
                    strokeWidth="6"
                    strokeLinecap="round"
                    className="opacity-30"
                  />
                  <path
                    d="M 15,35 Q 40,75 75,35 T 135,45"
                    stroke="#ffffff"
                    strokeWidth="1.5"
                    strokeDasharray="6 3"
                    className="opacity-80"
                  />
                  {/* Wings of Aureate solar light */}
                  <motion.path
                    d="M 55,42 Q 20,5 30,-20 Q 60,10 55,42 Z"
                    fill={dargon.color}
                    fillOpacity="0.6"
                    stroke="#ffffff"
                    strokeWidth="1"
                    animate={{ rotate: [0, -20, 15, 0], transformOrigin: "55px 42px" }}
                    transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut" }}
                  />
                  <motion.path
                    d="M 65,42 Q 100,5 90,-20 Q 70,10 65,42 Z"
                    fill={dargon.color}
                    fillOpacity="0.4"
                    stroke="#ffffff"
                    strokeWidth="0.8"
                    animate={{ rotate: [0, 20, -15, 0], transformOrigin: "65px 42px" }}
                    transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut", delay: 0.15 }}
                  />
                  {/* Overlord horned head */}
                  <path d="M 125,40 L 140,32 L 144,45 L 128,48 Z" fill={dargon.color} />
                  <path d="M 126,38 Q 120,20 115,22 M 134,35 Q 138,15 145,18" stroke="#ffffff" strokeWidth="1.5" strokeLinecap="round" />
                  <circle cx="132" cy="40" r="1.5" fill="#ffffff" />
                </>
              )}

              {/* Interactive Flame/Spike embers trailing behind for supreme graphics fidelity */}
              <motion.circle
                cx="35"
                cy="75"
                r="1.8"
                fill="#ffffff"
                animate={{ opacity: [0, 1, 0], scale: [0.5, 1.5, 0.5], x: [-15, -45], y: [0, -10] }}
                transition={{ duration: 1.4, repeat: Infinity, delay: 0.1 }}
              />
              <motion.circle
                cx="65"
                cy="85"
                r="2.2"
                fill={dargon.color}
                animate={{ opacity: [0, 1, 0], scale: [0.5, 2, 0.5], x: [-20, -55], y: [10, -5] }}
                transition={{ duration: 1.8, repeat: Infinity, delay: 0.4 }}
              />
              <motion.circle
                cx="95"
                cy="55"
                r="1.5"
                fill="#ffffff"
                animate={{ opacity: [0, 1, 0], scale: [0.5, 1.8, 0.5], x: [-15, -35], y: [-5, 10] }}
                transition={{ duration: 1.2, repeat: Infinity, delay: 0.7 }}
              />
            </svg>
          </motion.div>
        </motion.div>
      ))}
    </div>
  );
};

