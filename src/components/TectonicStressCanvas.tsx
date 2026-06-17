import React, { useEffect, useRef, useState } from "react";
import { SymbolFullState } from "../types";

interface TectonicStressCanvasProps {
  symbolState: SymbolFullState | null;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  alpha: number;
  life: number;
  maxLife: number;
}

interface Shockwave {
  x: number;
  y: number;
  radius: number;
  maxRadius: number;
  force: number;
}

export default function TectonicStressCanvas({ symbolState }: TectonicStressCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const contextRef = useRef<CanvasRenderingContext2D | null>(null);
  const stateRef = useRef<SymbolFullState | null>(null);
  const priceRef = useRef<number>(0);
  const mouseRef = useRef({ x: 0, y: 0, targetX: 0, targetY: 0, active: false });

  // Physics Arrays for particle flows and ripple deforms
  const particlesRef = useRef<Particle[]>([]);
  const shockwavesRef = useRef<Shockwave[]>([]);
  const tickCounter = useRef<number>(0);

  stateRef.current = symbolState;

  // Track price shifts to trigger local topological ruptures (shockwaves)
  useEffect(() => {
    if (symbolState && symbolState.currentPrice) {
      const prevPrice = priceRef.current;
      const currentPrice = symbolState.currentPrice;
      priceRef.current = currentPrice;

      if (prevPrice > 0 && prevPrice !== currentPrice && canvasRef.current) {
        const canvas = canvasRef.current;
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;
        
        // Spawn a localized space-time rupture matching the flow direction
        const isUp = currentPrice > prevPrice;
        shockwavesRef.current.push({
          x: centerX + (Math.random() * 200 - 100),
          y: centerY + (Math.random() * 200 - 100),
          radius: 10,
          maxRadius: Math.max(canvas.width, canvas.height) * 0.6,
          force: isUp ? 25 : -25,
        });

        // Breed particles carrying trade vectors (Disabled to remove color particles from background)

      }
    }
  }, [symbolState?.currentPrice]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    contextRef.current = ctx;

    // Responsive Canvas Resizer using ResizeObserver boundary limits
    const updateSize = () => {
      const dpr = window.devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.scale(dpr, dpr);
    };

    updateSize();
    const observer = new ResizeObserver(() => {
      updateSize();
    });
    observer.observe(canvas.parentElement || document.body);

    // Mouse interactive capture
    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouseRef.current.targetX = e.clientX - rect.left;
      mouseRef.current.targetY = e.clientY - rect.top;
      mouseRef.current.active = true;
    };

    const handleMouseLeave = () => {
      mouseRef.current.active = false;
    };

    window.addEventListener("mousemove", handleMouseMove);
    canvas.addEventListener("mouseleave", handleMouseLeave);

    let animationId: number;

    // PRINCIPLE CORE: The Physical Topological Tension Solver Loop
    const render = () => {
      tickCounter.current++;
      const w = canvas.width / (window.devicePixelRatio || 1);
      const h = canvas.height / (window.devicePixelRatio || 1);

      // Deep Space background void
      ctx.fillStyle = "#060913";
      ctx.fillRect(0, 0, w, h);

      // Interpolate real cursor coordinates
      const mouse = mouseRef.current;
      mouse.x += (mouse.targetX - mouse.x) * 0.1;
      mouse.y += (mouse.targetY - mouse.y) * 0.1;

      // 1. UPDATE AND SOLVE ACTIVE SHOCKWAVES
      shockwavesRef.current = shockwavesRef.current.filter((s) => {
        s.radius += 8;
        return s.radius < s.maxRadius;
      });

      // 2. RENDER TOPOLOGICAL CURVATURE FIELD (THE DEFORMING SPANNET MESH)
      let chromaColor = "99, 102, 241"; // default indigo
      if (stateRef.current) {
        const typeVal = stateRef.current.type as string;
        if (typeVal === "index") chromaColor = "245, 158, 11";
        else if (typeVal === "forex") chromaColor = "16, 185, 129";
        else if (typeVal === "equity") chromaColor = "129, 140, 248";
        else if (typeVal === "crypto") chromaColor = "219, 39, 119";
      }

      const gridSize = 45;
      ctx.beginPath();
      ctx.strokeStyle = `rgba(${chromaColor}, 0.055)`;
      ctx.lineWidth = 1;

      // Draw the space coordinates deformed by gravity wells and current shockwaves
      for (let x = 0; x < w + gridSize; x += gridSize) {
        ctx.beginPath();
        for (let y = 0; y < h + gridSize; y += 15) {
          // Resolve deformation forces for this spatial coordinate
          let dx = 0;
          let dy = 0;

          // A. Resolve gravity from current price center
          const centerX = w / 2;
          const centerY = h / 2;
          const distToCenter = Math.hypot(x - centerX, y - centerY);
          const gravityIntensity = 3000 / (distToCenter + 150);
          const centerAngle = Math.atan2(centerY - y, centerX - x);
          dx += Math.cos(centerAngle) * gravityIntensity;
          dy += Math.sin(centerAngle) * gravityIntensity;

          // B. Resolve gravity from mouse cursor
          if (mouse.active) {
            const distToMouse = Math.hypot(x - mouse.x, y - mouse.y);
            if (distToMouse < 300) {
              const mouseIntensity = (300 - distToMouse) * 0.15;
              const mouseAngle = Math.atan2(mouse.y - y, mouse.x - x);
              dx += Math.cos(mouseAngle) * mouseIntensity;
              dy += Math.sin(mouseAngle) * mouseIntensity;
            }
          }

          // C. Resolve current shockwaves
          shockwavesRef.current.forEach((s) => {
            const distToShock = Math.hypot(x - s.x, y - s.y);
            const distDiff = Math.abs(distToShock - s.radius);
            if (distDiff < 80) {
              const waveIntensity = Math.sin((distDiff / 80) * Math.PI) * (s.force * (1 - s.radius / s.maxRadius));
              const angle = Math.atan2(y - s.y, x - s.x);
              dx += Math.cos(angle) * waveIntensity;
              dy += Math.sin(angle) * waveIntensity;
            }
          });

          // Draw the deformed coordinate dot/line
          const resolvedX = x + dx;
          const resolvedY = y + dy;

          if (y === 0) {
            ctx.moveTo(resolvedX, resolvedY);
          } else {
            ctx.lineTo(resolvedX, resolvedY);
          }
        }
        ctx.stroke();
      }

      // Draw horizontal topological alignments
      for (let y = 0; y < h + gridSize; y += gridSize) {
        ctx.beginPath();
        for (let x = 0; x < w + gridSize; x += 15) {
          let dx = 0;
          let dy = 0;

          const centerX = w / 2;
          const centerY = h / 2;
          const distToCenter = Math.hypot(x - centerX, y - centerY);
          const gravityIntensity = 3000 / (distToCenter + 150);
          const centerAngle = Math.atan2(centerY - y, centerX - x);
          dx += Math.cos(centerAngle) * gravityIntensity;
          dy += Math.sin(centerAngle) * gravityIntensity;

          if (mouse.active) {
            const distToMouse = Math.hypot(x - mouse.x, y - mouse.y);
            if (distToMouse < 300) {
              const mouseIntensity = (300 - distToMouse) * 0.15;
              const mouseAngle = Math.atan2(mouse.y - y, mouse.x - x);
              dx += Math.cos(mouseAngle) * mouseIntensity;
              dy += Math.sin(mouseAngle) * mouseIntensity;
            }
          }

          shockwavesRef.current.forEach((s) => {
            const distToShock = Math.hypot(x - s.x, y - s.y);
            const distDiff = Math.abs(distToShock - s.radius);
            if (distDiff < 80) {
              const waveIntensity = Math.sin((distDiff / 80) * Math.PI) * (s.force * (1 - s.radius / s.maxRadius));
              const angle = Math.atan2(y - s.y, x - s.x);
              dx += Math.cos(angle) * waveIntensity;
              dy += Math.sin(angle) * waveIntensity;
            }
          });

          const resolvedX = x + dx;
          const resolvedY = y + dy;

          if (x === 0) {
            ctx.moveTo(resolvedX, resolvedY);
          } else {
            ctx.lineTo(resolvedX, resolvedY);
          }
        }
        ctx.stroke();
      }

      // 3. RENDER ORDER-BOOK CONCENTRIC gravitational ORBITS
      if (stateRef.current) {
        const s = stateRef.current;
        const centerX = w / 2;
        const centerY = h / 2;

        // Draw orbital orbits mapping limit order bounds
        const bidsList = s.dom?.bids || [];
        const asksList = s.dom?.asks || [];
        const totalBids = bidsList.reduce((acc, curr) => acc + curr.size, 0) || 1;
        const totalAsks = asksList.reduce((acc, curr) => acc + curr.size, 0) || 1;

        // Bid Side Orbit (Green, concentric contraction)
        ctx.strokeStyle = "rgba(16, 185, 129, 0.08)";
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        const bidRadius = 130 + Math.sin(tickCounter.current * 0.02) * 10;
        ctx.arc(centerX, centerY, bidRadius, 0, Math.PI * 2);
        ctx.stroke();

        // Ask Side Orbit (Red, concentric contraction)
        ctx.strokeStyle = "rgba(239, 68, 68, 0.06)";
        ctx.beginPath();
        const askRadius = 240 + Math.cos(tickCounter.current * 0.015) * 15;
        ctx.arc(centerX, centerY, askRadius, 0, Math.PI * 2);
        ctx.stroke();

        // Spawn ambient particles floating in the field (Disabled to remove color particles from background)

      }

      // 4. SOLVE AND DRAW PARTICULATE FLOWS
      particlesRef.current = particlesRef.current.filter((p) => {
        p.life++;
        p.x += p.vx;
        p.y += p.vy;

        // Trace orbital field pull towards center
        const centerX = w / 2;
        const centerY = h / 2;
        const dist = Math.hypot(p.x - centerX, p.y - centerY);
        const pull = 0.03;
        p.vx += (centerX - p.x) / dist * pull;
        p.vy += (centerY - p.y) / dist * pull;

        // Apply friction to slow extreme explosions
        p.vx *= 0.99;
        p.vy *= 0.99;

        const currentAlpha = p.alpha * (1 - p.life / p.maxLife);
        ctx.fillStyle = `${p.color}${currentAlpha})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();

        return p.life < p.maxLife;
      });

      // 5. DRAW THE CENTER CORE ORACLE SINGULARITY
      const heartPulse = 14 + Math.sin(tickCounter.current * 0.08) * 2;
      ctx.beginPath();
      const gradient = ctx.createRadialGradient(w/2, h/2, 1, w/2, h/2, heartPulse * 2.5);
      gradient.addColorStop(0, `rgba(${chromaColor}, 0.4)`);
      gradient.addColorStop(0.3, `rgba(${chromaColor}, 0.15)`);
      gradient.addColorStop(1, `rgba(${chromaColor}, 0)`);
      ctx.fillStyle = gradient;
      ctx.arc(w/2, h/2, heartPulse * 2.5, 0, Math.PI * 2);
      ctx.fill();

      ctx.beginPath();
      ctx.arc(w/2, h/2, 2.5, 0, Math.PI * 2);
      ctx.fillStyle = "#ffffff";
      ctx.shadowBlur = 15;
      ctx.shadowColor = `rgb(${chromaColor})`;
      ctx.fill();
      ctx.shadowBlur = 0; // reset shadow state

      animationId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener("mousemove", handleMouseMove);
      canvas.removeEventListener("mouseleave", handleMouseLeave);
      observer.disconnect();
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none select-none z-0"
      style={{ opacity: 0.85 }}
    />
  );
}
