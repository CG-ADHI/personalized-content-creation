// ============================================================
// context/AuthContext.jsx
//
// Manages three states:
//   "landing"  → user hasn't entered name yet
//   "guest"    → entered name, up to 5 free generations
//   "authed"   → signed in with Supabase email/password
//
// Guest limit is stored in localStorage so it survives refresh.
// ============================================================
import { createContext, useContext, useState, useEffect } from "react";
import { supabase } from "../lib/supabase";

const AuthContext = createContext(null);

export const GUEST_LIMIT = 5;

export function AuthProvider({ children }) {
  const [state,      setState]      = useState("landing"); // "landing"|"guest"|"authed"
  const [user,       setUser]       = useState(null);       // Supabase user or { name, isGuest }
  const [guestCount, setGuestCount] = useState(0);
  const [authLoading,setAuthLoading]= useState(true);

  // On mount — check if Supabase already has a session
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser(session.user);
        setState("authed");
      }
      setAuthLoading(false);
    });

    // Listen for auth changes (login, logout, token refresh)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser(session.user);
        setState("authed");
      } else {
        // Only reset to landing if we were authed before
        setState(s => s === "authed" ? "landing" : s);
        setUser(null);
      }
    });

    // Restore guest count from localStorage
    const saved = parseInt(localStorage.getItem("guestCount") || "0", 10);
    setGuestCount(saved);

    return () => subscription.unsubscribe();
  }, []);

  // ── Guest sign in (just a name) ───────────────────────────
  const signInAsGuest = (name) => {
    setUser({ name, isGuest: true });
    setState("guest");
  };

  // ── Supabase sign up ──────────────────────────────────────
  const signUp = async (email, password, name) => {
    const { data, error } = await supabase.auth.signUp({
      email, password,
      options: { data: { display_name: name } },
    });
    if (error) throw error;

    // If email confirmation is on, user won't be active yet
    if (data.user && !data.session) {
      return { needsConfirmation: true };
    }
    return { needsConfirmation: false };
  };

  // ── Supabase sign in ──────────────────────────────────────
  const signIn = async (email, password) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
  };

  // ── Sign out ──────────────────────────────────────────────
  const signOut = async () => {
    if (user?.isGuest) {
      setUser(null);
      setState("landing");
    } else {
      await supabase.auth.signOut();
      setState("landing");
      setUser(null);
    }
  };

  // ── Increment guest generation count ─────────────────────
  const incrementGuestCount = () => {
    const next = guestCount + 1;
    setGuestCount(next);
    localStorage.setItem("guestCount", String(next));
  };

  // ── Check if guest hit the limit ─────────────────────────
  const guestLimitReached = state === "guest" && guestCount >= GUEST_LIMIT;
  const generationsLeft   = state === "guest" ? Math.max(0, GUEST_LIMIT - guestCount) : null;

  // Display name helper
  const displayName = user?.isGuest
    ? user.name
    : user?.user_metadata?.display_name || user?.email?.split("@")[0] || "User";

  return (
    <AuthContext.Provider value={{
      state, user, authLoading,
      displayName,
      guestCount, guestLimitReached, generationsLeft,
      signInAsGuest, signUp, signIn, signOut, incrementGuestCount,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
