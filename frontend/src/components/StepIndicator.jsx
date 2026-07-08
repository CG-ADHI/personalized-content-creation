// ============================================================
// components/StepIndicator.jsx
// ============================================================
import React from "react";

const STEPS = ["Select Format", "Configure", "Your Content"];

export default function StepIndicator({ current }) {
  return (
    <div className="step-indicator">
      {STEPS.map((label, i) => (
        <React.Fragment key={i}>
          <div className={`step-item ${current >= i ? "active" : ""} ${current > i ? "done" : ""}`}>
            <div className="step-dot">
              {current > i ? <span className="check">✓</span> : <span>{i + 1}</span>}
            </div>
            <span className="step-label">{label}</span>
          </div>
          {i < STEPS.length - 1 && (
            <div className={`step-line ${current > i ? "done" : ""}`} />
          )}
        </React.Fragment>
      ))}
    </div>
  );
}
