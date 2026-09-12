// Cliente Supabase da Chrónos — aponta para o projeto próprio (tdehdxwdechsadpfencc).
// Este módulo substitui "@/integrations/supabase/client" através de um alias no vite.config.ts.
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";

export const SUPABASE_URL = "https://tdehdxwdechsadpfencc.supabase.co";
export const SUPABASE_PUBLISHABLE_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRkZWhkeHdkZWNoc2FkcGZlbmNjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODM5OTEwMjMsImV4cCI6MjA5OTU2NzAyM30.OB7XiZAF9LgsnilHJqd5CFU__NaxNBaWbGERBtrHTKc";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    storage: localStorage,
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});

export default supabase;
