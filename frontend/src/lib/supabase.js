// ============================================================
// lib/supabase.js  --  Supabase client (singleton)
//
// SETUP:
//   1. Go to https://supabase.com → New project (free)
//   2. Settings → API → copy Project URL and anon key
//   3. Paste them below
//   4. npm install @supabase/supabase-js
// ============================================================
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL  = "https://tozssdsfzibrsgtkoheg.supabase.co";   // ← paste here
const SUPABASE_ANON = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRvenNzZHNmemlicnNndGtvaGVnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI5NTQwNTYsImV4cCI6MjA4ODUzMDA1Nn0.DpS_GxJ3M0GirMYtz6SrvBx3Cuh7pLYFkXvkhFS7vjQ";                          // ← paste here

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON);
