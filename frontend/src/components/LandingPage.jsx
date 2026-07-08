// ============================================================
// components/LandingPage.jsx
//
// Tab 1 — "Try Free"  → guest entry (just a name)
// Tab 2 — "Sign In"   → Supabase email + password
// Tab 3 — "Sign Up"   → Supabase create account
// ============================================================
import { useState } from "react";
import { useAuth, GUEST_LIMIT } from "../context/AuthContext";

export default function LandingPage({ darkMode, onToggleDark }) {
  const { signInAsGuest, signIn, signUp } = useAuth();
  const [tab, setTab] = useState("guest"); // "guest"|"signin"|"signup"

  return (
    <div className="landing">
      <div className="landing-bg">
        <div className="landing-orb landing-orb-1" />
        <div className="landing-orb landing-orb-2" />
        <div className="landing-orb landing-orb-3" />
      </div>

      <div className="landing-card">
        {/* Brand */}
        <div className="landing-brand">
          <div className="landing-mark"><span>&#11045;</span></div>
          <h1 className="landing-title">AI Content Studio</h1>
          <p className="landing-sub">Personalized Media Creation System</p>
        </div>
        <button
             className="landing-theme-btn"
             onClick={onToggleDark}
             title={darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
         >
             {darkMode ? "☀️ Light Mode" : "🌙 Dark Mode"}
        </button>

        {/* Feature grid */}
        <div className="landing-features">
          {[
            { icon: "💼", text: "LinkedIn, blogs, emails & ads" },
            { icon: "⚙️", text: "AI editor reviews drafts automatically" },
            { icon: "🎯", text: "Tone, role & audience control" },
            { icon: "📋", text: "Save history to your account" },
          ].map((f, i) => (
            <div key={i} className="landing-feature">
              <span className="landing-feature-icon">{f.icon}</span>
              <span className="landing-feature-text">{f.text}</span>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="auth-tabs">
          <button
            className={`auth-tab ${tab === "guest"  ? "auth-tab--active" : ""}`}
            onClick={() => setTab("guest")}
          >Try Free</button>
          <button
            className={`auth-tab ${tab === "signin" ? "auth-tab--active" : ""}`}
            onClick={() => setTab("signin")}
          >Sign In</button>
          <button
            className={`auth-tab ${tab === "signup" ? "auth-tab--active" : ""}`}
            onClick={() => setTab("signup")}
          >Create Account</button>
        </div>

        {tab === "guest"  && <GuestForm  onSubmit={signInAsGuest} />}
        {tab === "signin" && <SignInForm  onSubmit={signIn} onSwitch={() => setTab("signup")} />}
        {tab === "signup" && <SignUpForm  onSubmit={signUp} onSwitch={() => setTab("signin")} />}

      </div>
    </div>
  );
}

// ── Guest form ────────────────────────────────────────────────
function GuestForm({ onSubmit }) {
  const [name,    setName]    = useState("");
  const [error,   setError]   = useState("");
  const [loading, setLoading] = useState(false);

  const handle = () => {
    if (!name.trim()) { setError("Please enter your name."); return; }
    setLoading(true);
    setTimeout(() => onSubmit(name.trim()), 600);
  };

  return (
    <div className="auth-form">
      <p className="auth-form-note">
        Try <strong>{GUEST_LIMIT} generations free</strong> — no account needed.
        Sign up anytime to save history and get unlimited access.
      </p>
      <label className="landing-label">Your name</label>
      <input
        className={`landing-input ${error ? "landing-input--error" : ""}`}
        placeholder="e.g. Laxman"
        value={name}
        onChange={e => { setName(e.target.value); setError(""); }}
        onKeyDown={e => e.key === "Enter" && handle()}
        autoFocus
      />
      {error && <p className="auth-error">{error}</p>}
      <button className={`landing-btn ${loading ? "landing-btn--loading" : ""}`} onClick={handle} disabled={loading}>
        {loading
          ? <span className="landing-btn-inner"><span className="landing-spinner" /> Getting ready...</span>
          : <span className="landing-btn-inner">Start for Free &#8594;</span>
        }
      </button>
      <p className="landing-note">No email required. History not saved in guest mode.</p>
    </div>
  );
}

// ── Sign in form ──────────────────────────────────────────────
function SignInForm({ onSubmit, onSwitch }) {
  const [email,   setEmail]   = useState("");
  const [pass,    setPass]    = useState("");
  const [error,   setError]   = useState("");
  const [loading, setLoading] = useState(false);

  const handle = async () => {
    if (!email || !pass) { setError("Please fill in all fields."); return; }
    setLoading(true); setError("");
    try {
      await onSubmit(email, pass);
    } catch (e) {
      setError(e.message || "Sign in failed. Check your email and password.");
      setLoading(false);
    }
  };

  return (
    <div className="auth-form">
      <label className="landing-label">Email</label>
      <input className={`landing-input ${error ? "landing-input--error" : ""}`}
        type="email" placeholder="you@example.com"
        value={email} onChange={e => { setEmail(e.target.value); setError(""); }}
        onKeyDown={e => e.key === "Enter" && handle()} autoFocus
      />
      <label className="landing-label" style={{marginTop:"12px"}}>Password</label>
      <input className="landing-input"
        type="password" placeholder="Your password"
        value={pass} onChange={e => setPass(e.target.value)}
        onKeyDown={e => e.key === "Enter" && handle()}
      />
      {error && <p className="auth-error">{error}</p>}
      <button className={`landing-btn ${loading ? "landing-btn--loading" : ""}`} onClick={handle} disabled={loading}>
        {loading
          ? <span className="landing-btn-inner"><span className="landing-spinner" /> Signing in...</span>
          : <span className="landing-btn-inner">Sign In &#8594;</span>
        }
      </button>
      <p className="auth-switch">
        Don't have an account?{" "}
        <button className="auth-switch-btn" onClick={onSwitch}>Create one free</button>
      </p>
    </div>
  );
}

// ── Sign up form ──────────────────────────────────────────────
function SignUpForm({ onSubmit, onSwitch }) {
  const [name,      setName]      = useState("");
  const [email,     setEmail]     = useState("");
  const [pass,      setPass]      = useState("");
  const [confirm,   setConfirm]   = useState("");
  const [error,     setError]     = useState("");
  const [loading,   setLoading]   = useState(false);
  const [done,      setDone]      = useState(false);

  const handle = async () => {
    if (!name || !email || !pass) { setError("Please fill in all fields."); return; }
    if (pass !== confirm)          { setError("Passwords do not match."); return; }
    if (pass.length < 6)           { setError("Password must be at least 6 characters."); return; }
    setLoading(true); setError("");
    try {
      const { needsConfirmation } = await onSubmit(email, pass, name);
      if (needsConfirmation) setDone(true);
    } catch (e) {
      setError(e.message || "Sign up failed. Try again.");
      setLoading(false);
    }
  };

  if (done) return (
    <div className="auth-form">
      <div className="auth-confirm-box">
        <span className="auth-confirm-icon">📧</span>
        <h3 className="auth-confirm-title">Check your email</h3>
        <p className="auth-confirm-text">
          We sent a confirmation link to <strong>{email}</strong>.
          Click it to activate your account, then come back to sign in.
        </p>
        <button className="auth-switch-btn" onClick={onSwitch}>Go to Sign In</button>
      </div>
    </div>
  );

  return (
    <div className="auth-form">
      <label className="landing-label">Your Name</label>
      <input className="landing-input" placeholder="e.g. Laxman"
        value={name} onChange={e => { setName(e.target.value); setError(""); }}
        autoFocus
      />
      <label className="landing-label" style={{marginTop:"12px"}}>Email</label>
      <input className={`landing-input ${error ? "landing-input--error" : ""}`}
        type="email" placeholder="you@example.com"
        value={email} onChange={e => { setEmail(e.target.value); setError(""); }}
      />
      <label className="landing-label" style={{marginTop:"12px"}}>Password</label>
      <input className="landing-input" type="password" placeholder="Min. 6 characters"
        value={pass} onChange={e => setPass(e.target.value)}
      />
      <label className="landing-label" style={{marginTop:"12px"}}>Confirm Password</label>
      <input className="landing-input" type="password" placeholder="Repeat password"
        value={confirm} onChange={e => setConfirm(e.target.value)}
        onKeyDown={e => e.key === "Enter" && handle()}
      />
      {error && <p className="auth-error">{error}</p>}
      <button className={`landing-btn ${loading ? "landing-btn--loading" : ""}`} onClick={handle} disabled={loading}>
        {loading
          ? <span className="landing-btn-inner"><span className="landing-spinner" /> Creating account...</span>
          : <span className="landing-btn-inner">Create Account &#8594;</span>
        }
      </button>
      <p className="auth-switch">
        Already have an account?{" "}
        <button className="auth-switch-btn" onClick={onSwitch}>Sign in</button>
      </p>
    </div>
  );
}
