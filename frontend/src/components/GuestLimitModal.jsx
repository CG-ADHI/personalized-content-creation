// ============================================================
// Shown as an overlay when guest hits the 5-generation limit
// ============================================================
import { useState } from "react";
import { useAuth, GUEST_LIMIT } from "../context/AuthContext";

export default function GuestLimitModal({ onClose }) {
  const { signIn, signUp } = useAuth();
  const [tab,     setTab]     = useState("signup");
  const [name,    setName]    = useState("");
  const [email,   setEmail]   = useState("");
  const [pass,    setPass]    = useState("");
  const [confirm, setConfirm] = useState("");
  const [error,   setError]   = useState("");
  const [loading, setLoading] = useState(false);
  const [done,    setDone]    = useState(false);

  const handleSignIn = async () => {
    if (!email || !pass) { setError("Fill in all fields."); return; }
    setLoading(true); setError("");
    try { await signIn(email, pass); }
    catch (e) { setError(e.message || "Sign in failed."); setLoading(false); }
  };

  const handleSignUp = async () => {
    if (!name || !email || !pass) { setError("Fill in all fields."); return; }
    if (pass !== confirm)          { setError("Passwords don't match."); return; }
    if (pass.length < 6)           { setError("Password min 6 characters."); return; }
    setLoading(true); setError("");
    try {
      const { needsConfirmation } = await signUp(email, pass, name);
      if (needsConfirmation) setDone(true);
    } catch (e) { setError(e.message || "Sign up failed."); setLoading(false); }
  };

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-card fade-in">

        {/* Header */}
        <div className="modal-header">
          <div className="modal-limit-badge">
            🎯 {GUEST_LIMIT}/{GUEST_LIMIT} free generations used
          </div>
          <button className="modal-close" onClick={onClose}>&#215;</button>
        </div>

        <h2 className="modal-title">You've used all free generations</h2>
        <p className="modal-subtitle">
          Create a free account to get <strong>unlimited generations</strong>,
          save your history, and access your content from any device.
        </p>

        {/* Tabs */}
        <div className="auth-tabs" style={{marginBottom: "20px"}}>
          <button className={`auth-tab ${tab === "signup" ? "auth-tab--active" : ""}`} onClick={() => { setTab("signup"); setError(""); }}>
            Create Account
          </button>
          <button className={`auth-tab ${tab === "signin" ? "auth-tab--active" : ""}`} onClick={() => { setTab("signin"); setError(""); }}>
            Sign In
          </button>
        </div>

        {done ? (
          <div className="auth-confirm-box">
            <span className="auth-confirm-icon">📧</span>
            <h3 className="auth-confirm-title">Check your email</h3>
            <p className="auth-confirm-text">
              Confirmation link sent to <strong>{email}</strong>. Click it then sign in.
            </p>
            <button className="auth-switch-btn" onClick={() => { setTab("signin"); setDone(false); }}>
              Go to Sign In
            </button>
          </div>
        ) : tab === "signup" ? (
          <div className="auth-form">
            <label className="landing-label">Name</label>
            <input className="landing-input" placeholder="Your name"
              value={name} onChange={e => { setName(e.target.value); setError(""); }} autoFocus />
            <label className="landing-label" style={{marginTop:"10px"}}>Email</label>
            <input className={`landing-input ${error ? "landing-input--error":""}`}
              type="email" placeholder="you@example.com"
              value={email} onChange={e => { setEmail(e.target.value); setError(""); }} />
            <label className="landing-label" style={{marginTop:"10px"}}>Password</label>
            <input className="landing-input" type="password" placeholder="Min. 6 characters"
              value={pass} onChange={e => setPass(e.target.value)} />
            <label className="landing-label" style={{marginTop:"10px"}}>Confirm Password</label>
            <input className="landing-input" type="password" placeholder="Repeat password"
              value={confirm} onChange={e => setConfirm(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleSignUp()} />
            {error && <p className="auth-error">{error}</p>}
            <button className={`landing-btn ${loading?"landing-btn--loading":""}`} onClick={handleSignUp} disabled={loading}>
              {loading
                ? <span className="landing-btn-inner"><span className="landing-spinner"/>Creating...</span>
                : <span className="landing-btn-inner">Create Free Account &#8594;</span>}
            </button>
          </div>
        ) : (
          <div className="auth-form">
            <label className="landing-label">Email</label>
            <input className={`landing-input ${error?"landing-input--error":""}`}
              type="email" placeholder="you@example.com"
              value={email} onChange={e => { setEmail(e.target.value); setError(""); }} autoFocus />
            <label className="landing-label" style={{marginTop:"10px"}}>Password</label>
            <input className="landing-input" type="password" placeholder="Your password"
              value={pass} onChange={e => setPass(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleSignIn()} />
            {error && <p className="auth-error">{error}</p>}
            <button className={`landing-btn ${loading?"landing-btn--loading":""}`} onClick={handleSignIn} disabled={loading}>
              {loading
                ? <span className="landing-btn-inner"><span className="landing-spinner"/>Signing in...</span>
                : <span className="landing-btn-inner">Sign In &#8594;</span>}
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
