// ============================================================
// components/ConfigPanel.jsx
// New features:
//   - Voice/mic input (Web Speech API — free, built into Chrome)
//   - Advanced / content-specific fields (collapsible)
//   - All existing fields unchanged
// ============================================================
import { useState, useRef, useEffect } from "react";
import { TONES, AUDIENCES, ROLES, WORD_LIMIT, MODES, ADVANCED_FIELDS } from "../config/constants";

export default function ConfigPanel({
  form, update,
  keywordInput, setKeywordInput, addKeyword, removeKeyword,
  onBack, onGenerate, generateBtnRef, loading, error
}) {
  const modeObj     = MODES.find(m => m.id === form.mode);
  const canGenerate = form.topic.trim().length > 0 && !loading;
  const [showAdvanced, setShowAdvanced] = useState(false);
  const advancedFields = ADVANCED_FIELDS[form.mode] || [];

  // Initialise advanced field defaults when mode changes
  useEffect(() => {
    if (advancedFields.length > 0) {
      advancedFields.forEach(f => {
        if (!form[f.id]) update(f.id, f.default);
      });
    }
  }, [form.mode]);

  return (
    <div className="card fade-in">

      {/* ── Header ─────────────────────────────────────────── */}
      <div className="config-header">
        <button className="back-btn" onClick={onBack}>&#8592; Back</button>
        <div className="mode-badge" style={{"--mode-color": modeObj?.color}}>
          {modeObj?.icon} {modeObj?.label}
        </div>
      </div>

      <div className="card-header">
        <h2 className="card-title">Configure your content</h2>
        <p className="card-subtitle">Fill in the details to get the best results from the AI</p>
      </div>

      {/* ── Topic + Mic ────────────────────────────────────── */}
      <div className="form-section">
        <label className="field-label">
          Topic <span className="required">*</span>
          <span className="field-hint"> — or use 🎤 to speak</span>
        </label>
        <div className="topic-row">
          <textarea
            className="field-textarea topic-textarea"
            placeholder="e.g. The benefits of AI for content creators"
            value={form.topic}
            onChange={e => update("topic", e.target.value)}
            rows={3}
          />
          <VoiceMic form={form} update={update} />
        </div>
      </div>

      {/* ── Tone + Right column ────────────────────────────── */}
      <div className="form-row">
        <div className="form-section">
          <label className="field-label">Tone of Voice</label>
          <div className="chip-grid">
            {TONES.map(t => (
              <button
                key={t.id}
                className={`chip ${form.tone === t.id ? "chip--active" : ""}`}
                onClick={() => update("tone", t.id)}
              >
                <span>{t.emoji}</span> {t.id}
              </button>
            ))}
          </div>
          <input
            className="field-input"
            style={{marginTop: "10px"}}
            placeholder="Or type a custom tone..."
            value={TONES.find(t => t.id === form.tone) ? "" : form.tone}
            onChange={e => update("tone", e.target.value)}
            onFocus={() => { if (TONES.find(t => t.id === form.tone)) update("tone", ""); }}
          />
        </div>

        <div className="form-section">
          <label className="field-label">Target Audience</label>
          <ComboField
            options={AUDIENCES}
            value={form.target_audience}
            onChange={v => update("target_audience", v)}
            placeholder="Or type a custom audience..."
          />

          <label className="field-label" style={{marginTop: "18px"}}>Role / Persona</label>
          <ComboField
            options={ROLES}
            value={form.role}
            onChange={v => update("role", v)}
            placeholder="Or type a custom role..."
          />

          <label className="field-label" style={{marginTop: "18px"}}>
            Word Count — <strong className="accent">{form.word_limit} words</strong>
          </label>
          <input
            type="range"
            className="field-range"
            min={WORD_LIMIT.min} max={WORD_LIMIT.max} step={WORD_LIMIT.step}
            value={form.word_limit}
            onChange={e => update("word_limit", Number(e.target.value))}
          />
          <div className="range-labels">
            <span>{WORD_LIMIT.min}</span><span>{WORD_LIMIT.max}</span>
          </div>
        </div>
      </div>

      {/* ── Keywords ───────────────────────────────────────── */}
      <div className="form-section">
        <label className="field-label">
          Keywords <span className="field-hint">(press Enter or comma to add)</span>
        </label>
        <div className="keyword-box">
          {form.keywords.map(kw => (
            <span key={kw} className="keyword-tag">
              {kw}
              <button className="tag-remove" onClick={() => removeKeyword(kw)}>&#215;</button>
            </span>
          ))}
          <input
            className="keyword-input"
            placeholder={form.keywords.length === 0 ? "e.g. innovation, AI, digital..." : "Add keyword..."}
            value={keywordInput}
            onChange={e => setKeywordInput(e.target.value)}
            onKeyDown={addKeyword}
          />
        </div>
      </div>

      {/* ── Advanced Features (collapsible) ────────────────── */}
      {advancedFields.length > 0 && (
        <div className="advanced-section">
          <button
            className="advanced-toggle"
            onClick={() => setShowAdvanced(s => !s)}
          >
            <span className="advanced-toggle-icon">{modeObj?.icon}</span>
            <span className="advanced-toggle-label">
              {modeObj?.label} Specific Features
            </span>
            <span className={`advanced-toggle-arrow ${showAdvanced ? "advanced-toggle-arrow--open" : ""}`}>
              ▾
            </span>
          </button>

          {showAdvanced && (
            <div className="advanced-body">
              <div className="advanced-divider">
                <span>⚙️ ADVANCED OPTIONS</span>
              </div>
              {advancedFields.map(field => (
                <div key={field.id} className="form-section" style={{marginBottom: "20px"}}>
                  <label className="field-label">{field.label}</label>
                  {field.type === "chips" && (
                    <div className="chip-grid">
                      {field.options.map(opt => (
                        <button
                          key={opt}
                          className={`chip ${form[field.id] === opt ? "chip--active" : ""}`}
                          onClick={() => update(field.id, opt)}
                        >
                          {opt}
                        </button>
                      ))}
                    </div>
                  )}
                  {field.type === "input" && (
                    <input
                      className="field-input"
                      placeholder={field.placeholder}
                      value={form[field.id] || ""}
                      onChange={e => update(field.id, e.target.value)}
                    />
                  )}
                  {field.type === "select" && (
                    <select
                      className="field-select"
                      value={form[field.id] || field.default}
                      onChange={e => update(field.id, e.target.value)}
                    >
                      {field.options.map(opt => (
                        <option key={opt} value={opt}>{opt}</option>
                      ))}
                    </select>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── Toggles ────────────────────────────────────────── */}
      <div className="toggles-row">
        <Toggle
          label="AI Editor Review"
          icon="&#9998;"
          sub="Auto-critique and improve the draft"
          checked={form.use_editor}
          onChange={v => update("use_editor", v)}
        />
        <Toggle
          label="Include Emojis"
          icon="&#128515;"
          sub="Add emojis to the generated content"
          checked={form.include_emojis}
          onChange={v => update("include_emojis", v)}
        />
      </div>

      {error && <div className="error-box">{error}</div>}

      <button
        ref={generateBtnRef}
        className={`generate-btn ${!canGenerate ? "generate-btn--disabled" : ""}`}
        onClick={onGenerate}
        disabled={!canGenerate}
      >
        {loading
          ? <span className="btn-loading"><Spinner /> Generating...</span>
          : "⚡ Generate Content"
        }
      </button>
    </div>
  );
}

// ── Voice Mic Component ───────────────────────────────────────
function VoiceMic({ form, update }) {
  const [status,  setStatus]  = useState("idle"); // idle | listening | processing | error
  const [message, setMessage] = useState("");
  const recognitionRef = useRef(null);

  const isSupported = "webkitSpeechRecognition" in window || "SpeechRecognition" in window;

  // Keyword maps for field extraction
  const TONE_KEYWORDS = {
    casual:         "Casual",
    informal:       "Casual",
    professional:   "Professional",
    formal:         "Professional",
    witty:          "Witty",
    funny:          "Witty",
    inspirational:  "Inspirational",
    motivational:   "Inspirational",
    technical:      "Technical",
    authoritative:  "Authoritative",
    conversational: "Conversational",
    persuasive:     "Persuasive",
  };

  const AUDIENCE_KEYWORDS = {
    developers:    "AI Developers",
    developer:     "AI Developers",
    students:      "Students & Researchers",
    student:       "Students & Researchers",
    founders:      "Startup Founders",
    entrepreneurs: "Startup Founders",
    marketers:     "Marketing Teams",
    managers:      "Product Managers",
    executives:    "Business Executives",
  };

  const extractFields = (transcript) => {
    const lower = transcript.toLowerCase();
    const extracted = {};

    // Extract tone
    for (const [keyword, tone] of Object.entries(TONE_KEYWORDS)) {
      if (lower.includes(keyword + " tone") || lower.includes("be " + keyword) || lower.includes(keyword + " style")) {
        extracted.tone = tone;
        break;
      }
    }

    // Extract emoji preference
    if (lower.includes("include emoji") || lower.includes("with emoji") || lower.includes("add emoji")) {
      extracted.include_emojis = true;
    }
    if (lower.includes("no emoji") || lower.includes("without emoji")) {
      extracted.include_emojis = false;
    }

    // Extract audience
    for (const [keyword, audience] of Object.entries(AUDIENCE_KEYWORDS)) {
      if (lower.includes("for " + keyword) || lower.includes("target " + keyword)) {
        extracted.target_audience = audience;
        break;
      }
    }

    // Extract word count hints
    const wordMatch = lower.match(/(\d+)\s*words?/);
    if (wordMatch) {
      const count = parseInt(wordMatch[1]);
      if (count >= 50 && count <= 800) extracted.word_limit = count;
    }

    // Extract clean topic — remove field instructions
    let topic = transcript;
    const removePatterns = [
      /with (casual|professional|witty|inspirational|technical|authoritative|conversational|persuasive) tone/gi,
      /be (casual|professional|witty|inspirational|technical|authoritative|conversational|persuasive)/gi,
      /include emojis?/gi,
      /with emojis?/gi,
      /add emojis?/gi,
      /no emojis?/gi,
      /without emojis?/gi,
      /for (developers?|students?|founders?|entrepreneurs?|marketers?|managers?|executives?)/gi,
      /target (developers?|students?|founders?|entrepreneurs?|marketers?|managers?|executives?)/gi,
      /\d+ words?/gi,
    ];
    removePatterns.forEach(p => { topic = topic.replace(p, ""); });
    topic = topic.replace(/\s+/g, " ").trim().replace(/^,|,$/, "").trim();

    return { topic, extracted };
  };

  const startListening = () => {
    if (!isSupported) {
      setStatus("error");
      setMessage("Voice not supported in this browser. Try Chrome.");
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    recognitionRef.current = recognition;

    recognition.onstart = () => {
      setStatus("listening");
      setMessage("Listening... speak now");
    };

    recognition.onresult = (event) => {
      setStatus("processing");
      const transcript = event.results[0][0].transcript;
      const confidence = event.results[0][0].confidence;

      if (confidence < 0.5) {
        setStatus("error");
        setMessage("Couldn't understand clearly. Please speak again or type.");
        setTimeout(() => { setStatus("idle"); setMessage(""); }, 3000);
        return;
      }

      const { topic, extracted } = extractFields(transcript);

      // Apply extracted values
      if (topic) update("topic", topic);
      Object.entries(extracted).forEach(([key, val]) => update(key, val));

      // Build feedback message
      const applied = Object.keys(extracted);
      if (applied.length > 0) {
        setMessage(`Got it! Set: ${applied.join(", ")}`);
      } else {
        setMessage("Topic captured!");
      }
      setStatus("idle");
      setTimeout(() => setMessage(""), 3000);
    };

    recognition.onerror = (event) => {
      setStatus("error");
      if (event.error === "no-speech") {
        setMessage("No speech detected. Please try again.");
      } else if (event.error === "not-allowed") {
        setMessage("Microphone access denied. Please allow mic in browser settings.");
      } else {
        setMessage("Error occurred. Please try again or type your topic.");
      }
      setTimeout(() => { setStatus("idle"); setMessage(""); }, 4000);
    };

    recognition.onend = () => {
      if (status === "listening") {
        setStatus("idle");
      }
    };

    recognition.start();
  };

  const stopListening = () => {
    recognitionRef.current?.stop();
    setStatus("idle");
    setMessage("");
  };

  if (!isSupported) return null;

  return (
    <div className="mic-wrapper">
      <button
        className={`mic-btn ${status === "listening" ? "mic-btn--active" : ""} ${status === "error" ? "mic-btn--error" : ""}`}
        onClick={status === "listening" ? stopListening : startListening}
        title={status === "listening" ? "Stop listening" : "Speak your topic and fields"}
        type="button"
      >
        {status === "listening" ? (
          <span className="mic-icon mic-icon--pulse">🎙️</span>
        ) : status === "processing" ? (
          <span className="mic-icon">⏳</span>
        ) : status === "error" ? (
          <span className="mic-icon">⚠️</span>
        ) : (
          <span className="mic-icon">🎤</span>
        )}
      </button>
      {message && (
        <div className={`mic-message ${status === "error" ? "mic-message--error" : ""}`}>
          {message}
        </div>
      )}
    </div>
  );
}

// ── ComboField ────────────────────────────────────────────────
function ComboField({ options, value, onChange, placeholder }) {
  const [custom, setCustom] = useState("");
  const isCustom = !options.includes(value);

  return (
    <div>
      <select
        className="field-select"
        value={isCustom ? "__custom__" : value}
        onChange={e => {
          if (e.target.value === "__custom__") {
            onChange(custom);
          } else {
            onChange(e.target.value);
            setCustom("");
          }
        }}
      >
        {options.map(o => <option key={o} value={o}>{o}</option>)}
        <option value="__custom__">✏️ Type custom...</option>
      </select>
      {(isCustom || value === "") && (
        <input
          className="field-input"
          style={{marginTop: "8px"}}
          placeholder={placeholder}
          value={isCustom ? value : custom}
          onChange={e => {
            setCustom(e.target.value);
            onChange(e.target.value);
          }}
          autoFocus
        />
      )}
    </div>
  );
}

function Toggle({ label, icon, sub, checked, onChange }) {
  return (
    <div className={`toggle-card ${checked ? "toggle-card--on" : ""}`} onClick={() => onChange(!checked)}>
      <div className="toggle-info">
        <span className="toggle-label">{icon} {label}</span>
        <span className="toggle-sub">{sub}</span>
      </div>
      <div className={`toggle-track ${checked ? "toggle-track--on" : ""}`}>
        <div className={`toggle-thumb ${checked ? "toggle-thumb--on" : ""}`} />
      </div>
    </div>
  );
}

function Spinner() {
  return <span className="spinner" />;
}
