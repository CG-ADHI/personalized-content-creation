// ============================================================
// hooks/useContentForm.js  --  All form state & API logic
// Additions vs v1:
//   - incrementGuestCount() called after each successful gen
//   - saveToHistory() saves to Supabase for authed users
// ============================================================
import { useState, useCallback } from "react";
import { DEFAULT_MODEL, WORD_LIMIT, API_ENDPOINT, ENABLE_RESEARCH } from "../config/constants";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../lib/supabase";

const initialForm = {
  topic:           "",
  mode:            "linkedin",
  model_name:      DEFAULT_MODEL,
  word_limit:      WORD_LIMIT.default,
  tone:            "Professional",
  target_audience: "General Public",
  role:            "General",
  keywords:        [],
  include_emojis:  false,
  use_research:    ENABLE_RESEARCH,
  use_editor:      true,
  revision_count:  0,
};

export function useContentForm() {
  const { state, user, incrementGuestCount } = useAuth();

  const [form,         setForm]         = useState(initialForm);
  const [keywordInput, setKeywordInput] = useState("");
  const [loading,      setLoading]      = useState(false);
  const [result,       setResult]       = useState(null);
  const [error,        setError]        = useState(null);
  const [step,         setStep]         = useState(0);

  const update = useCallback((field, value) =>
    setForm(f => ({ ...f, [field]: value })), []);

  const addKeyword = useCallback((e) => {
    if ((e.key === "Enter" || e.key === ",") && keywordInput.trim()) {
      e.preventDefault();
      const kw = keywordInput.trim().replace(/,$/, "");
      if (kw && !form.keywords.includes(kw))
        setForm(f => ({ ...f, keywords: [...f.keywords, kw] }));
      setKeywordInput("");
    }
  }, [keywordInput, form.keywords]);

  const removeKeyword = useCallback((kw) =>
    setForm(f => ({ ...f, keywords: f.keywords.filter(k => k !== kw) })), []);

  const generate = useCallback(async () => {
    if (!form.topic.trim()) return;
    setLoading(true);
    setError(null);
    try {
      // ── CONNECT YOUR BACKEND ────────────────────────────────
      const res = await fetch(API_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error("Backend error");
      const data = await res.json();
      setResult(data);
      setStep(2);
      // ────────────────────────────────────────────────────────


      // Track guest count after successful generation
      if (state === "guest") incrementGuestCount();

    } catch (err) {
      setError("Could not reach the backend. Make sure your server is running on port 8000.");
    } finally {
      setLoading(false);
    }
  }, [form, state, incrementGuestCount]);

  // ── Save to Supabase (authed users only) ──────────────────
  const saveToHistory = useCallback(async (result, form) => {
    if (state !== "authed" || !user) return;
    const { error } = await supabase.from("content_history").insert({
      user_id:        user.id,
      topic:          form.topic,
      mode:           result.mode,
      tone:           form.tone,
      role:           form.role,
      target_audience:form.target_audience,
      word_limit:     form.word_limit,
      keywords:       form.keywords,
      include_emojis: form.include_emojis,
      content:        result.content,
      revision_count: result.revision_count,
    });
    if (error) throw error;
  }, [state, user]);

  // ── Load history from Supabase ────────────────────────────
  const loadHistory = useCallback(async () => {
    if (state !== "authed" || !user) return [];
    const { data, error } = await supabase
      .from("content_history")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(50);
    if (error) throw error;
    return data || [];
  }, [state, user]);

  const reset = useCallback(() => {
    setStep(0);
    setResult(null);
    setError(null);
    setForm(f => ({ ...f, topic: "", keywords: [], revision_count: 0 }));
    setKeywordInput("");
  }, []);

  return {
    form, update,
    keywordInput, setKeywordInput, addKeyword, removeKeyword,
    loading, result, error,
    step, setStep,
    generate, reset,
    saveToHistory, loadHistory,
    setResult, // Expose setResult to allow loading full result from history
  };
}
