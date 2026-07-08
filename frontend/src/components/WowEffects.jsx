// ============================================================
// components/WowEffects.jsx
//
// 1. useParticleBurst  — hook, call on generate click
// 2. InkDropLoader     — replaces loading orb
// 3. useMagneticCard   — hook, attach to mode cards
// 4. useConfetti       — hook, fires once on first save
// 5. useAmbientSound   — hook, whoosh on generate, chime on result
// ============================================================
import { useState, useEffect, useRef, useCallback } from "react";

// ── 1. Particle Burst ─────────────────────────────────────────
// Returns { ParticleBurst, triggerBurst }
// Render <ParticleBurst /> anywhere, call triggerBurst(x, y) on click

export function useParticleBurst() {
  const [particles, setParticles] = useState([]);

  const triggerBurst = useCallback((x, y) => {
    const count = 28;
    const newParticles = Array.from({ length: count }, (_, i) => {
      const angle    = (i / count) * 360 + Math.random() * 20;
      const distance = 60 + Math.random() * 80;
      const size     = 3 + Math.random() * 5;
      const duration = 0.5 + Math.random() * 0.4;
      const colors   = ["#C4572A", "#D4673A", "#d97706", "#92600A", "#E07040", "#FAD6A5"];
      return {
        id:    Date.now() + i,
        x, y, angle, distance, size, duration,
        color: colors[Math.floor(Math.random() * colors.length)],
        delay: Math.random() * 0.1,
      };
    });
    setParticles(newParticles);
    setTimeout(() => setParticles([]), 1000);
  }, []);

  const ParticleBurst = () => (
    <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 9999 }}>
      {particles.map(p => (
        <div key={p.id} style={{
          position:  "absolute",
          left:      p.x,
          top:       p.y,
          width:     p.size,
          height:    p.size,
          borderRadius: "50%",
          background: p.color,
          transform: "translate(-50%, -50%)",
          animation: `particleFly ${p.duration}s ease-out ${p.delay}s forwards`,
          "--angle":    p.angle + "deg",
          "--distance": p.distance + "px",
        }} />
      ))}
    </div>
  );

  return { ParticleBurst, triggerBurst };
}


// ── 2. Ink Drop Loader ────────────────────────────────────────
// Drop-in replacement for the loading orb section

export function InkDropLoader({ mode }) {
  const [drops, setDrops] = useState([]);

  useEffect(() => {
    // Spawn ink drops at intervals
    const colors = ["#C4572A", "#1B3A5C", "#d97706", "#2D7A4F", "#C4572A"];
    let i = 0;
    const interval = setInterval(() => {
      const color = colors[i % colors.length];
      setDrops(prev => [
        ...prev.slice(-5), // keep max 6
        {
          id:    Date.now(),
          x:     20 + Math.random() * 60,
          color,
          size:  40 + Math.random() * 60,
          delay: 0,
        }
      ]);
      i++;
    }, 700);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="inkdrop-loader">
      <div className="inkdrop-canvas">
        {drops.map(d => (
          <div key={d.id} className="inkdrop-drop" style={{
            left:            `${d.x}%`,
            width:           d.size,
            height:          d.size,
            background:      d.color,
            marginLeft:      -(d.size / 2),
          }} />
        ))}
      </div>
      <p className="inkdrop-label">Crafting your {mode} content</p>
    </div>
  );
}


// ── 3. Magnetic Card Hook ─────────────────────────────────────
// Usage: const { cardRef, cardStyle } = useMagneticCard();
// Apply cardRef and cardStyle to the mode card element

export function useMagneticCard(strength = 12) {
  const cardRef  = useRef(null);
  const [style,  setStyle]  = useState({});
  const frameRef = useRef(null);

  const handleMove = useCallback((e) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const cx   = rect.left + rect.width  / 2;
    const cy   = rect.top  + rect.height / 2;
    const dx   = (e.clientX - cx) / (rect.width  / 2);
    const dy   = (e.clientY - cy) / (rect.height / 2);

    cancelAnimationFrame(frameRef.current);
    frameRef.current = requestAnimationFrame(() => {
      setStyle({
        transform:  `perspective(600px) rotateX(${-dy * strength * 0.5}deg) rotateY(${dx * strength * 0.5}deg) translateZ(6px)`,
        transition: "transform 0.1s ease",
        boxShadow:  `${-dx * 8}px ${-dy * 8}px 24px rgba(196,87,42,0.20)`,
      });
    });
  }, [strength]);

  const handleLeave = useCallback(() => {
    cancelAnimationFrame(frameRef.current);
    setStyle({
      transform:  "perspective(600px) rotateX(0deg) rotateY(0deg) translateZ(0px)",
      transition: "transform 0.4s ease, box-shadow 0.4s ease",
      boxShadow:  "",
    });
  }, []);

  return { cardRef, cardStyle: style, onMouseMove: handleMove, onMouseLeave: handleLeave };
}


// ── 4. Confetti Hook ──────────────────────────────────────────
// Usage: const { triggerConfetti } = useConfetti();
// Call triggerConfetti() on first save

export function useConfetti() {
  const firedRef = useRef(false);

  const triggerConfetti = useCallback(() => {
    if (firedRef.current) return; // only once per session
    firedRef.current = true;

    const canvas = document.createElement("canvas");
    canvas.style.cssText = "position:fixed;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:9999";
    document.body.appendChild(canvas);

    const ctx    = canvas.getContext("2d");
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;

    const colors  = ["#C4572A","#d97706","#92600A","#1B3A5C","#2D7A4F","#E07040","#FAD6A5","#FFFFFF"];
    const pieces  = Array.from({ length: 120 }, () => ({
      x:    Math.random() * canvas.width,
      y:    -20 - Math.random() * canvas.height * 0.3,
      w:    5  + Math.random() * 8,
      h:    8  + Math.random() * 12,
      color:  colors[Math.floor(Math.random() * colors.length)],
      rot:    Math.random() * 360,
      rotV:   (Math.random() - 0.5) * 6,
      vx:     (Math.random() - 0.5) * 4,
      vy:     2 + Math.random() * 4,
      opacity: 1,
    }));

    let frame;
    let age = 0;

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      age++;
      pieces.forEach(p => {
        p.x   += p.vx;
        p.y   += p.vy;
        p.rot += p.rotV;
        p.vy  += 0.06; // gravity
        if (age > 120) p.opacity = Math.max(0, p.opacity - 0.015);

        ctx.save();
        ctx.globalAlpha = p.opacity;
        ctx.translate(p.x + p.w / 2, p.y + p.h / 2);
        ctx.rotate((p.rot * Math.PI) / 180);
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
        ctx.restore();
      });

      if (age < 220) {
        frame = requestAnimationFrame(animate);
      } else {
        document.body.removeChild(canvas);
      }
    };

    frame = requestAnimationFrame(animate);
  }, []);

  return { triggerConfetti };
}


// ── 5. Ambient Sound Hook ─────────────────────────────────────
// Usage: const { playGenerate, playResult } = useAmbientSound();

export function useAmbientSound() {
  const ctxRef = useRef(null);

  const getCtx = () => {
    if (!ctxRef.current) {
      ctxRef.current = new (window.AudioContext || window.webkitAudioContext)();
    }
    return ctxRef.current;
  };

  // Soft whoosh on generate click
  const playGenerate = useCallback(() => {
    try {
      const ctx  = getCtx();
      const buf  = ctx.createBuffer(1, ctx.sampleRate * 0.5, ctx.sampleRate);
      const data = buf.getChannelData(0);
      for (let i = 0; i < data.length; i++) {
        const t  = i / ctx.sampleRate;
        data[i]  = Math.exp(-t * 5) * (Math.random() * 2 - 1) * (1 - t * 1.8);
      }
      const src    = ctx.createBufferSource();
      src.buffer   = buf;
      const filter = ctx.createBiquadFilter();
      filter.type  = "bandpass";
      filter.frequency.setValueAtTime(1200, ctx.currentTime);
      filter.frequency.exponentialRampToValueAtTime(300, ctx.currentTime + 0.5);
      filter.Q.value = 0.8;
      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.18, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);
      src.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);
      src.start();
    } catch (_) {}
  }, []);

  // Gentle chime when content appears
  const playResult = useCallback(() => {
    try {
      const ctx   = getCtx();
      const freqs = [523.25, 659.25, 783.99]; // C5, E5, G5 — major chord

      freqs.forEach((freq, i) => {
        const osc  = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type   = "sine";
        osc.frequency.value = freq;
        gain.gain.setValueAtTime(0, ctx.currentTime + i * 0.08);
        gain.gain.linearRampToValueAtTime(0.10, ctx.currentTime + i * 0.08 + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.08 + 1.2);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime + i * 0.08);
        osc.stop(ctx.currentTime  + i * 0.08 + 1.2);
      });
    } catch (_) {}
  }, []);

  return { playGenerate, playResult };
}
