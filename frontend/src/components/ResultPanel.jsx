// ============================================================
// components/ResultPanel.jsx
// New features:
//   - Download dropdown: TXT / DOCX / PDF
//   - Emoji + DOCX/PDF confirmation popup
//   - Translate button (free — MyMemory API, no key needed)
// ============================================================
import { useState } from "react";
import { MODES, LANGUAGES } from "../config/constants";
import { useAuth } from "../context/AuthContext";

export default function ResultPanel({ result, form, onTweak, onNew, onSave }) {
  const { state } = useAuth();
  const [copied,      setCopied]      = useState(false);
  const [saved,       setSaved]       = useState(false);
  const [saving,      setSaving]      = useState(false);
  const [saveErr,     setSaveErr]     = useState("");
  const [showDropdown,setShowDropdown]= useState(false);
  const [emojiWarning,setEmojiWarning]= useState(null); // "docx" | "pdf" | null
  const [showTranslate,setShowTranslate] = useState(false);
  const [translateLang, setTranslateLang] = useState("Spanish");
  const [translating,  setTranslating]   = useState(false);
  const [translated,   setTranslated]    = useState(null);
  const [translateErr, setTranslateErr]  = useState("");

  const modeObj = MODES.find(m => m.id === result.mode);
  const content = translated || result.content;

  // ── Copy ─────────────────────────────────────────────────
  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  // ── Save ─────────────────────────────────────────────────
  const handleSave = async () => {
    setSaving(true); setSaveErr("");
    try {
      await onSave(result, form);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (e) {
      setSaveErr("Could not save. Try again.");
    } finally {
      setSaving(false);
    }
  };

  // ── Download TXT ─────────────────────────────────────────
  const downloadTxt = () => {
    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `${form.topic.slice(0, 30).replace(/\s+/g, "_")}_${form.mode}.txt`;
    a.click();
    setShowDropdown(false);
  };

  // ── Download DOCX ─────────────────────────────────────────
  const downloadDocx = async () => {
    setShowDropdown(false);
    // Import docx dynamically
    try {
      const { Document, Packer, Paragraph, TextRun, HeadingLevel } = await import("docx");
      const lines = content.split("\n");
      const children = lines.map((line, i) => {
        if (i === 0 && line.trim().length > 0) {
          return new Paragraph({
            heading: HeadingLevel.HEADING_1,
            children: [new TextRun({ text: line, bold: true, size: 28 })],
          });
        }
        return new Paragraph({
          children: [new TextRun({ text: line, size: 22 })],
          spacing: { after: 120 },
        });
      });

      const doc = new Document({
        sections: [{ properties: {}, children }],
      });

      const buffer = await Packer.toBlob(doc);
      const a = document.createElement("a");
      a.href = URL.createObjectURL(buffer);
      a.download = `${form.topic.slice(0, 30).replace(/\s+/g, "_")}_${form.mode}.docx`;
      a.click();
    } catch (e) {
      alert("DOCX generation failed. Please run: npm install docx");
    }
  };

  // ── Download PDF ──────────────────────────────────────────
  const downloadPdf = async () => {
    setShowDropdown(false);
    try {
      const { jsPDF } = await import("jspdf");
      const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
      doc.setFont("helvetica");
      doc.setFontSize(12);
      const lines = doc.splitTextToSize(content, 180);
      let y = 20;
      lines.forEach(line => {
        if (y > 270) { doc.addPage(); y = 20; }
        doc.text(line, 15, y);
        y += 7;
      });
      doc.save(`${form.topic.slice(0, 30).replace(/\s+/g, "_")}_${form.mode}.pdf`);
    } catch (e) {
      alert("PDF generation failed. Please run: npm install jspdf");
    }
  };

  // ── Download click routing ────────────────────────────────
  const handleDownloadClick = (format) => {
    setShowDropdown(false);
    if (form.include_emojis && (format === "docx" || format === "pdf")) {
      setEmojiWarning(format);
    } else {
      if (format === "txt")  downloadTxt();
      if (format === "docx") downloadDocx();
      if (format === "pdf")  downloadPdf();
    }
  };

  // ── Translate (MyMemory API — free, no key) ───────────────
  const handleTranslate = async () => {
  setTranslating(true); setTranslateErr(""); setTranslated(null);
  try {
    const langCode = LANG_CODES[translateLang] || "es";
    const text     = result.content;

    // Split into ~450 char chunks at sentence boundaries
    const chunks = [];
    let current  = "";
    const sentences = text.split(/(?<=[.!?\n])\s*/);

    for (const sentence of sentences) {
      if ((current + sentence).length > 450) {
        if (current.trim()) chunks.push(current.trim());
        current = sentence;
      } else {
        current += (current ? " " : "") + sentence;
      }
    }
    if (current.trim()) chunks.push(current.trim());

    // Translate each chunk with a small delay to avoid rate limiting
    const results = [];
    for (const chunk of chunks) {
      const encoded = encodeURIComponent(chunk);
      const url     = `https://api.mymemory.translated.net/get?q=${encoded}&langpair=en|${langCode}`;
      const res     = await fetch(url);
      const data    = await res.json();
      if (data.responseStatus === 200) {
        results.push(data.responseData.translatedText);
      } else {
        results.push(chunk); // fallback to original if chunk fails
      }
      // Small delay between requests to avoid rate limiting
      await new Promise(r => setTimeout(r, 300));
    }

    setTranslated(results.join("\n"));
  } catch {
    setTranslateErr("Translation service unavailable. Check your internet connection.");
  } finally {
    setTranslating(false);
  }
};

  const resetTranslation = () => { setTranslated(null); setTranslateErr(""); };

  return (
    <div className="card fade-in">

      {/* ── Emoji Warning Modal ───────────────────────────── */}
      {emojiWarning && (
        <div className="modal-overlay" onClick={() => setEmojiWarning(null)}>
          <div className="modal-card fade-in" onClick={e => e.stopPropagation()} style={{maxWidth: "420px"}}>
            <div className="emoji-warn-icon">⚠️</div>
            <h3 className="modal-title" style={{fontSize:"18px"}}>Heads up before downloading</h3>
            <p className="modal-subtitle">
              Downloading as <strong>.{emojiWarning}</strong> may not render emojis correctly.
              <br/><strong>Downloading as .txt is recommended for better results with emojis.</strong>
            </p>
            <div style={{display:"flex", gap:"10px", marginTop:"20px"}}>
              <button className="landing-btn" style={{flex:1, padding:"10px"}} onClick={downloadTxt}>
                ✓ Download .txt instead
              </button>
              <button
                className="back-btn"
                style={{flex:1, padding:"10px", textAlign:"center"}}
                onClick={() => {
                  setEmojiWarning(null);
                  if (emojiWarning === "docx") downloadDocx();
                  if (emojiWarning === "pdf")  downloadPdf();
                }}
              >
                Continue as .{emojiWarning}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="result-header">
        <div>
          <div className="mode-badge" style={{"--mode-color": modeObj?.color}}>
            {modeObj?.icon} {modeObj?.label}
          </div>
          <h2 className="card-title" style={{marginTop: "8px"}}>Your content is ready</h2>
          <p className="card-subtitle">
            Completed {result.revision_count > 1
              ? `after ${result.revision_count} AI review cycles`
              : "in one pass"}
          </p>
        </div>
        <div className="result-actions">
          <button className={`copy-btn ${copied ? "copy-btn--done" : ""}`} onClick={handleCopy}>
            {copied ? "✓ Copied!" : "📋 Copy"}
          </button>

          {/* Download dropdown */}
          <div className="download-wrapper">
            <button className="download-btn" onClick={() => setShowDropdown(s => !s)}>
              &#8615; Download <span className="download-caret">▾</span>
            </button>
            {showDropdown && (
              <div className="download-dropdown">
                <button onClick={() => handleDownloadClick("txt")}>
                  &#8615; Download TXT
                </button>
                <button onClick={() => handleDownloadClick("docx")}>
                  Download DOCX
                </button>
                <button onClick={() => handleDownloadClick("pdf")}>
                  Download PDF
                </button>
              </div>
            )}
          </div>

          <button className="new-btn" onClick={onNew}>+ New</button>
        </div>
      </div>

      <div className="result-content">
        <pre className="result-text">{content}</pre>
      </div>

      {/* ── Translate section ─────────────────────────────── */}
      <div className="translate-section">
        <button
          className="translate-toggle-btn"
          onClick={() => setShowTranslate(s => !s)}
        >
          🌐 {showTranslate ? "Hide Translate" : "Translate Content"}
        </button>

        {showTranslate && (
          <div className="translate-body">
            <div className="translate-row">
              <select
                className="field-select"
                value={translateLang}
                onChange={e => { setTranslateLang(e.target.value); resetTranslation(); }}
                style={{flex:1}}
              >
                {LANGUAGES.map(l => <option key={l} value={l}>{l}</option>)}
              </select>
              <button
                className={`translate-btn ${translating ? "translate-btn--loading" : ""}`}
                onClick={handleTranslate}
                disabled={translating}
              >
                {translating ? "Translating..." : "Translate →"}
              </button>
              {translated && (
                <button className="translate-reset-btn" onClick={resetTranslation} title="Show original">
                  ↺ Original
                </button>
              )}
            </div>
            {translateErr && <p className="auth-error">{translateErr}</p>}
            {translated && (
              <div className="translate-note">
                📝 Showing translated version. Copy or download will use the translated text.
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── Save prompt ───────────────────────────────────── */}
      <div className="save-prompt">
        <div className="save-prompt-text">
          <span className="save-prompt-icon">{state === "authed" ? "☁️" : "📋"}</span>
          <div>
            <p className="save-prompt-title">
              {state === "authed" ? "Save to your account?" : "Save locally?"}
            </p>
            <p className="save-prompt-sub">
              {state === "authed"
                ? "Access from any device."
                : "Saved in this session only. Sign up to keep history permanently."}
            </p>
          </div>
        </div>
        <div style={{display:"flex", flexDirection:"column", alignItems:"flex-end", gap:"4px"}}>
          <button
            className={`save-btn ${saved ? "save-btn--done" : ""}`}
            onClick={handleSave}
            disabled={saved || saving}
          >
            {saving ? "Saving..." : saved ? "✓ Saved!" : "Save"}
          </button>
          {saveErr && <p style={{fontSize:"11px", color:"var(--error-text)", fontFamily:"var(--font-mono)"}}>{saveErr}</p>}
        </div>
      </div>

      <div className="result-meta">
        {[
          { label: "Format",    value: form.mode },
          { label: "Tone",      value: form.tone },
          { label: "Audience",  value: form.target_audience },
          { label: "Role",      value: form.role },
          { label: "Length",    value: `~${form.word_limit} words` },
          form.include_emojis && { label: "Emojis",    value: "On" },
          form.use_editor     && { label: "AI Editor", value: `${result.revision_count} cycle${result.revision_count !== 1 ? "s" : ""}` },
          translated          && { label: "Translated", value: translateLang },
        ].filter(Boolean).map(item => (
          <div key={item.label} className="meta-pill">
            <span className="meta-label">{item.label}</span>
            <span className="meta-value">{item.value}</span>
          </div>
        ))}
      </div>

      <button className="tweak-btn" onClick={onTweak}>
        &#8592; Adjust Settings &amp; Regenerate
      </button>
    </div>
  );
}

// ISO language codes for MyMemory API
const LANG_CODES = {
  "Spanish": "es", "French": "fr", "German": "de", "Hindi": "hi",
  "Arabic": "ar", "Portuguese": "pt", "Italian": "it", "Japanese": "ja",
  "Korean": "ko", "Chinese (Simplified)": "zh", "Russian": "ru",
  "Dutch": "nl", "Turkish": "tr", "Bengali": "bn", "Tamil": "ta",
  "Telugu": "te", "Marathi": "mr", "Kannada": "kn", "Gujarati": "gu",
  "Punjabi": "pa", "Urdu": "ur", "Malayalam": "ml",
};
