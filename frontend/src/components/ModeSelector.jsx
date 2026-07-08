// ============================================================
// components/ModeSelector.jsx  --  with magnetic card effect
// ============================================================
import { MODES } from "../config/constants";
import { useMagneticCard } from "./WowEffects";

function MagneticModeCard({ m, selected, onSelect }) {
  const { cardRef, cardStyle, onMouseMove, onMouseLeave } = useMagneticCard(10);

  return (
    <button
      ref={cardRef}
      className={`mode-card ${selected === m.id ? "mode-card--active" : ""}`}
      style={{ "--mode-color": m.color, ...cardStyle }}
      onClick={() => onSelect(m.id)}
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
    >
      <span className="mode-icon">{m.icon}</span>
      <span className="mode-name">{m.label}</span>
      <span className="mode-desc">{m.desc}</span>
      <span className="mode-arrow">&#8594;</span>
    </button>
  );
}

export default function ModeSelector({ selected, onSelect }) {
  return (
    <div className="card fade-in">
      <div className="card-header">
        <h2 className="card-title">What would you like to create?</h2>
        <p className="card-subtitle">Choose a content format to begin crafting your message</p>
      </div>
      <div className="mode-grid">
        {MODES.map(m => (
          <MagneticModeCard key={m.id} m={m} selected={selected} onSelect={onSelect} />
        ))}
      </div>
    </div>
  );
}
