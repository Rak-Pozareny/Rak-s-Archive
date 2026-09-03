import { createClient, SupabaseClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

/**
 * True once VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set (locally
 * in .env.local, or in your host's environment variables). When false,
 * the app falls back to the browser-only IndexedDB repository — content
 * still works, but it's local to one browser and not shared between
 * visitors. See README.md "Shared, permanent content".
 */
export const isSupabaseConfigured = Boolean(url && anonKey);

export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(url as string, anonKey as string)
  : null;
