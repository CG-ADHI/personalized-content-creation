// ============================================================
// components/SplashScreen.jsx
//
// Ornate palace door splash screen.
// - Custom key cursor in door area
// - Lock pulses gold
// - Click → key turns → doors swing open in 3D → landing page
// - Web Audio API sounds (no files needed)
// ============================================================
import { useState, useEffect, useRef, useCallback } from "react";

export default function SplashScreen({ onEnter }) {
  const [phase,       setPhase]       = useState("idle");
  // idle | hover-door | hover-lock | turning | opening | done
  const [cursorPos,   setCursorPos]   = useState({ x: -200, y: -200 });
  const [cursorAngle, setCursorAngle] = useState(-30);
  const [titleVisible,setTitleVisible]= useState(false);
  const [subtitleVis, setSubtitleVis] = useState(false);
  const doorRef  = useRef(null);
  const audioCtx = useRef(null);
  const prevPos  = useRef({ x: 0, y: 0 });

  // Fade in title sequence
  useEffect(() => {
    const t1 = setTimeout(() => setTitleVisible(true),  800);
    const t2 = setTimeout(() => setSubtitleVis(true),  1800);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  // ── Audio helpers ────────────────────────────────────────
  const getAudio = () => {
    if (!audioCtx.current) {
      audioCtx.current = new (window.AudioContext || window.webkitAudioContext)();
    }
    return audioCtx.current;
  };

  const playLockClick = () => {
    try {
      const ctx  = getAudio();
      const buf  = ctx.createBuffer(1, ctx.sampleRate * 0.15, ctx.sampleRate);
      const data = buf.getChannelData(0);
      for (let i = 0; i < data.length; i++) {
        const t = i / ctx.sampleRate;
        data[i] = Math.exp(-t * 40) * (Math.random() * 2 - 1) * 0.6
                + Math.exp(-t * 80) * Math.sin(2 * Math.PI * 180 * t) * 0.4;
      }
      const src = ctx.createBufferSource();
      src.buffer = buf;
      const gain = ctx.createGain();
      gain.gain.setValueAtTime(1, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
      src.connect(gain);
      gain.connect(ctx.destination);
      src.start();
    } catch (_) {}
  };

  const playDoorCreak = () => {
    try {
      const ctx = getAudio();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(80, ctx.currentTime);
      osc.frequency.linearRampToValueAtTime(40, ctx.currentTime + 1.2);
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.4);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 1.4);
    } catch (_) {}
  };

  const playWhoosh = () => {
    try {
      const ctx  = getAudio();
      const buf  = ctx.createBuffer(1, ctx.sampleRate * 1.0, ctx.sampleRate);
      const data = buf.getChannelData(0);
      for (let i = 0; i < data.length; i++) {
        const t = i / ctx.sampleRate;
        data[i] = Math.exp(-t * 2) * (Math.random() * 2 - 1) * Math.pow(1 - t, 2);
      }
      const src    = ctx.createBufferSource();
      src.buffer   = buf;
      const filter = ctx.createBiquadFilter();
      filter.type  = "bandpass";
      filter.frequency.setValueAtTime(800, ctx.currentTime);
      filter.frequency.exponentialRampToValueAtTime(200, ctx.currentTime + 1.0);
      filter.Q.value = 0.5;
      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.0);
      src.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);
      src.start();
    } catch (_) {}
  };

  // ── Mouse tracking ───────────────────────────────────────
  const handleMouseMove = useCallback((e) => {
    const x = e.clientX;
    const y = e.clientY;

    // Calculate key rotation based on movement direction
    const dx = x - prevPos.current.x;
    const dy = y - prevPos.current.y;
    const angle = Math.atan2(dy, dx) * (180 / Math.PI) - 45;
    setCursorAngle(angle);
    prevPos.current = { x, y };
    setCursorPos({ x, y });

    if (!doorRef.current) return;
    const rect = doorRef.current.getBoundingClientRect();
    const inDoor = x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom;

    // Check if near keyhole (centre of door)
    const cx = rect.left + rect.width  / 2;
    const cy = rect.top  + rect.height * 0.52;
    const dist = Math.sqrt((x - cx) ** 2 + (y - cy) ** 2);
    const nearLock = dist < 40;

    if (phase === "idle" || phase === "hover-door" || phase === "hover-lock") {
      if (nearLock)       setPhase("hover-lock");
      else if (inDoor)    setPhase("hover-door");
      else                setPhase("idle");
    }
  }, [phase]);

  // ── Click handler ────────────────────────────────────────
  const handleClick = useCallback(() => {
    if (phase !== "hover-lock") return;

    setPhase("turning");
    playLockClick();

    setTimeout(() => {
      setPhase("opening");
      playDoorCreak();
      playWhoosh();
    }, 600);

    setTimeout(() => {
      setPhase("done");
    }, 2200);

    setTimeout(() => {
      onEnter();
    }, 2400);
  }, [phase, onEnter]);

  const showKeyCursor = phase === "hover-door" || phase === "hover-lock" || phase === "turning";
  const isOpening     = phase === "opening" || phase === "done";
  const lockGlowing   = phase === "hover-lock" || phase === "turning";

  return (
    <div
      className={`splash-root ${isOpening ? "splash-root--opening" : ""}`}
      onMouseMove={handleMouseMove}
      onClick={handleClick}
      style={{ cursor: showKeyCursor ? "none" : "default" }}
    >
      {/* ── Atmosphere ──────────────────────────────────── */}
      <div className="splash-bg">
        <div className="splash-vignette" />
        <div className="splash-floor" />
      </div>

      {/* ── Floating dust motes ─────────────────────────── */}
      {[...Array(18)].map((_, i) => (
        <div key={i} className="dust-mote" style={{
          left:              `${10 + Math.random() * 80}%`,
          animationDelay:    `${Math.random() * 8}s`,
          animationDuration: `${6 + Math.random() * 8}s`,
          width:             `${1 + Math.random() * 2}px`,
          height:            `${1 + Math.random() * 2}px`,
          opacity:           0.2 + Math.random() * 0.4,
        }} />
      ))}

      {/* ── Title ───────────────────────────────────────── */}
      <div className={`splash-title-block ${titleVisible ? "splash-title-block--visible" : ""}`}>
        <p className="splash-pre-title">Welcome to</p>
        <h1 className="splash-main-title">AI Content Studio</h1>
      </div>

      {/* ── Door scene ──────────────────────────────────── */}
      <div className="splash-scene">

        {/* Glow behind door */}
        <div className={`door-back-glow ${lockGlowing ? "door-back-glow--bright" : ""}`} />

        {/* Door frame */}
        <div className="door-frame" ref={doorRef}>

          {/* Arch topper */}
          <div className="door-arch">
            <div className="door-arch-inner" />
            <div className="door-arch-gem" />
          </div>

          {/* Door panels wrapper — 3D perspective */}
          <div className={`door-panels ${isOpening ? "door-panels--open" : ""}`}>

            {/* Left panel */}
            <div className={`door-panel door-panel--left ${isOpening ? "door-panel--left-open" : ""}`}>
              <div className="panel-wood" />
              <div className="panel-border" />
              <div className="panel-inset panel-inset--tl" />
              <div className="panel-inset panel-inset--bl" />
              <div className="panel-hinge panel-hinge--top-left" />
              <div className="panel-hinge panel-hinge--bot-left" />
              <div className="panel-strip" />
            </div>

            {/* Right panel */}
            <div className={`door-panel door-panel--right ${isOpening ? "door-panel--right-open" : ""}`}>
              <div className="panel-wood" />
              <div className="panel-border" />
              <div className="panel-inset panel-inset--tr" />
              <div className="panel-inset panel-inset--br" />
              <div className="panel-hinge panel-hinge--top-right" />
              <div className="panel-hinge panel-hinge--bot-right" />
              <div className="panel-strip panel-strip--right" />

              {/* Keyhole — on right panel near centre */}
              <div className={`door-keyhole ${lockGlowing ? "door-keyhole--glow" : ""} ${phase === "turning" ? "door-keyhole--turning" : ""}`}>
                <svg viewBox="0 0 32 48" width="32" height="48">
                  <circle cx="16" cy="14" r="10" fill="none" stroke="currentColor" strokeWidth="2.5" />
                  <circle cx="16" cy="14" r="5"  fill="currentColor" opacity="0.4" />
                  <path   d="M10 22 L14 42 L18 42 L22 22 Z" fill="currentColor" />
                </svg>
              </div>
            </div>

            {/* Light seam between doors */}
            <div className="door-seam" />
          </div>

          {/* Doorstep */}
          <div className="door-step" />
        </div>

        {/* Hint text */}
        <div className={`splash-hint ${subtitleVis ? "splash-hint--visible" : ""} ${isOpening ? "splash-hint--hidden" : ""}`}>
          {phase === "hover-lock"
            ? "✦ Click to unlock"
            : phase === "hover-door"
            ? "Move to the keyhole"
            : "The content awaits"}
        </div>
      </div>

      {/* ── Flash overlay on open ────────────────────────── */}
      <div className={`splash-flash ${isOpening ? "splash-flash--active" : ""}`} />

      {/* ── Custom key cursor ───────────────────────────── */}
      {showKeyCursor && (
        <div
          className={`key-cursor ${lockGlowing ? "key-cursor--glow" : ""} ${phase === "turning" ? "key-cursor--turning" : ""}`}
          style={{
            left:      cursorPos.x,
            top:       cursorPos.y,
            transform: `translate(-50%, -50%) rotate(${phase === "turning" ? cursorAngle + 90 : cursorAngle}deg)`,
          }}
        >
          <svg viewBox="0 0 48 80" width="38" height="62">
            {/* Key head */}
            <circle cx="16" cy="18" r="13" fill="none" stroke="currentColor" strokeWidth="3.5" />
            <circle cx="16" cy="18" r="6"  fill="currentColor" opacity="0.5" />
            {/* Key shaft */}
            <rect x="13.5" y="30" width="5" height="40" rx="2" fill="currentColor" />
            {/* Key teeth */}
            <rect x="18.5" y="44" width="8" height="4" rx="1.5" fill="currentColor" />
            <rect x="18.5" y="54" width="6" height="4" rx="1.5" fill="currentColor" />
            <rect x="18.5" y="62" width="9" height="4" rx="1.5" fill="currentColor" />
          </svg>
        </div>
      )}
    </div>
  );
}
