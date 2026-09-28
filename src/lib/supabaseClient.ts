/**
 * Cliente Supabase Chrónos — projeto tdehdxwdechsadpfencc.
 * Preferir variáveis VITE_* no .env.local; fallback para URL do projeto.
 */
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";

export const SUPABASE_URL =
  import.meta.env.VITE_SUPABASE_URL || "https://tdehdxwdechsadpfencc.supabase.co";

export const SUPABASE_PUBLISHABLE_KEY =
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || "";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    storage: typeof window !== "undefined" ? localStorage : undefined,
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});

export default supabase;
