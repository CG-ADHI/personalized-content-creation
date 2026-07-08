// ============================================================
// App.jsx  --  Root component
// New: SplashScreen, particle burst, confetti, ambient sound
// ============================================================
import { useState, useEffect, useRef } from "react";
import { useAuth }         from "./context/AuthContext";
import SplashScreen        from "./components/SplashScreen";
import LandingPage         from "./components/LandingPage";
import GuestLimitModal     from "./components/GuestLimitModal";
import StepIndicator       from "./components/StepIndicator";
import ModeSelector        from "./components/ModeSelector";
import ConfigPanel         from "./components/ConfigPanel";
import LoadingScreen       from "./components/LoadingScreen";
import ResultPanel         from "./components/ResultPanel";
import HistoryPanel        from "./components/HistoryPanel";
import { useContentForm }  from "./hooks/useContentForm";
import {
  useParticleBurst,
  useConfetti,
  useAmbientSound,
} from "./components/WowEffects";
import "./App.css";
import { supabase } from "./lib/supabase";

export default function App() {
  const { state, authLoading, displayName, signOut, guestLimitReached, generationsLeft } = useAuth();

  const [splashDone,   setSplashDone]   = useState(false);
  const [darkMode,     setDarkMode]     = useState(false);
  const [showHistory,  setShowHistory]  = useState(false);
  const [localHistory, setLocalHistory] = useState([]);
  const [showLimit,    setShowLimit]    = useState(false);

  const { ParticleBurst, triggerBurst } = useParticleBurst();
  const { triggerConfetti }             = useConfetti();
  const { playGenerate, playResult }    = useAmbientSound();
  const generateBtnRef                  = useRef(null);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", darkMode ? "dark" : "light");
  }, [darkMode]);

  useEffect(() => {
    if (guestLimitReached) setShowLimit(true);
  }, [guestLimitReached]);

  const {
    form, update,
    keywordInput, setKeywordInput, addKeyword, removeKeyword,
    loading, result, error,
    step, setStep,
    generate, reset,
    saveToHistory, loadHistory,
    setResult,
  } = useContentForm();

  const handleGenerate = () => {
    if (guestLimitReached) { setShowLimit(true); return; }
    if (generateBtnRef.current) {
      const rect = generateBtnRef.current.getBoundingClientRect();
      triggerBurst(rect.left + rect.width / 2, rect.top + rect.height / 2);
    }
    playGenerate();
    generate();
  };

  useEffect(() => {
    if (step === 2 && result) playResult();
  }, [step, result]);

  const WORD_DEFAULTS = {
    linkedin: 150, blog: 600, email: 200,
    ad: 100, tweet: 60, instagram: 120,
  };

  const handleModeSelect = (modeId) => {
    update("mode", modeId);
    update("word_limit", WORD_DEFAULTS[modeId] || 150);
    setStep(1);
  };

  const handleSave = async (result, form) => {
    triggerConfetti();
    if (state === "authed") {
      await saveToHistory(result, form);
    } else {
      const entry = {
        id:      Date.now(),
        date:    new Date().toLocaleDateString("en-IN", { day:"numeric", month:"short", hour:"2-digit", minute:"2-digit" }),
        topic:   form.topic,
        mode:    result.mode,
        tone:    form.tone,
        content: result.content,
        revision_count: result.revision_count,
      };
      setLocalHistory(prev => [entry, ...prev.slice(0, 19)]);
    }
  };

  const handleLoadHistory = (item) => {
    update("mode",  item.mode);
    update("topic", item.topic);
    update("tone",  item.tone);
    setResult({
      content:        item.content,
      mode:           item.mode,
      revision_count: item.revision_count || 1,
    });
    setShowHistory(false);
    setStep(2);
  };

  const handleDeleteHistory = async (id) => {
    setLocalHistory(prev => prev.filter(h => h.id !== id));
    if (state === "authed") {
      await supabase.from("content_history").delete().eq("id", id);
    }
  };

  if (!splashDone) return <SplashScreen onEnter={() => setSplashDone(true)} />;

  if (authLoading) return (
    <div style={{display:"flex",alignItems:"center",justifyContent:"center",minHeight:"100vh",background:"var(--bg)"}}>
      <span className="spinner" style={{borderColor:"var(--border)",borderTopColor:"var(--accent)",width:"32px",height:"32px"}}/>
    </div>
  );

  if (state === "landing") return (
    <LandingPage darkMode={darkMode} onToggleDark={() => setDarkMode(d => !d)} />
  );

  return (
    <div className="app">
      <ParticleBurst />
      {showLimit && <GuestLimitModal onClose={() => setShowLimit(false)} />}

      <header className="app-header">
        <div className="header-inner">
          <div className="brand">
            <div className="brand-mark"><span className="brand-hex">&#11045;</span></div>
            <div className="brand-text">
              <span className="brand-name">AI Content Studio</span>
              <span className="brand-tagline">Personalized Media Creation System</span>
            </div>
          </div>
          <div className="header-controls">
            {state === "guest" && (
              <button className={`guest-counter ${guestLimitReached ? "guest-counter--warn" : ""}`}
                onClick={() => setShowLimit(true)}>
                {guestLimitReached ? "🔒 Limit reached" : `⚡ ${generationsLeft} free left`}
              </button>
            )}
            <span className="header-user">👋 {displayName}</span>
            <button className={`header-icon-btn ${showHistory ? "header-icon-btn--active" : ""}`}
              onClick={() => setShowHistory(s => !s)} title="Content History">
              &#128203;
              {(state === "authed" || localHistory.length > 0) && (
                <span className="history-badge">{state === "guest" ? localHistory.length : "✓"}</span>
              )}
            </button>
            <button className="header-icon-btn" onClick={() => setDarkMode(d => !d)}>
              {darkMode ? "☀️" : "🌙"}
            </button>
            <button className="header-icon-btn signout-btn" onClick={signOut}>↪</button>
          </div>
        </div>
      </header>

      <div className="step-bar">
        <StepIndicator current={loading ? 2 : step === 2 ? 3 : step} />
      </div>

      <div className="app-layout">
        <main className="app-main">
          {step === 0 && !loading && (
            <ModeSelector selected={form.mode} onSelect={handleModeSelect} />
          )}
          {step === 1 && !loading && (
            <ConfigPanel
              form={form} update={update}
              keywordInput={keywordInput}
              setKeywordInput={setKeywordInput}
              addKeyword={addKeyword}
              removeKeyword={removeKeyword}
              onBack={() => setStep(0)}
              onGenerate={handleGenerate}
              generateBtnRef={generateBtnRef}
              loading={loading}
              error={error}
            />
          )}
          {loading && <LoadingScreen mode={form.mode} />}
          {step === 2 && result && !loading && (
            <ResultPanel
              result={result} form={form}
              onTweak={() => setStep(1)}
              onNew={reset}
              onSave={handleSave}
            />
          )}
        </main>
        {showHistory && (
          <aside className="history-sidebar">
            <HistoryPanel
              localHistory={localHistory}
              loadHistory={loadHistory}
              onLoad={handleLoadHistory}
              onDelete={handleDeleteHistory}
              onClose={() => setShowHistory(false)}
            />
          </aside>
        )}
      </div>

      <footer className="app-footer">
        <span>AI System for Personalized Content Creation in Media</span>
        <span className="footer-sep">&#183;</span>
        <span>Powered by LangGraph</span>
      </footer>
    </div>
  );
}
