import { ContentRepository } from "./ContentRepository";
import { IndexedDBRepository } from "./IndexedDBRepository";
import { SupabaseRepository } from "./SupabaseRepository";
import { isSupabaseConfigured } from "../lib/supabaseClient";

/**
 * True when the app is reading/writing a shared Supabase backend, so
 * admin changes are visible to every visitor and persist permanently.
 * False when falling back to per-browser IndexedDB (local only) — the
 * UI uses this to warn whoever's in the admin dashboard which mode
 * they're in.
 */
export const usingSharedBackend = isSupabaseConfigured;

// Single instantiation point. To move to a different backend later,
// implement ContentRepository against it and swap the line below —
// nothing else in the app needs to change.
export const repository: ContentRepository = usingSharedBackend
  ? new SupabaseRepository()
  : new IndexedDBRepository();
