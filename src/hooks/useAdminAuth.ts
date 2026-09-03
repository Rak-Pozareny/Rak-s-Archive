import { useCallback, useEffect, useRef, useState } from "react";
import { sha256Hex } from "../utils/hash";
import { supabase, isSupabaseConfigured } from "../lib/supabaseClient";

/**
 * Two modes, chosen automatically based on whether Supabase is configured:
 *
 * SHARED MODE (VITE_SUPABASE_URL + VITE_SUPABASE_ANON_KEY + VITE_ADMIN_EMAIL
 * are all set): the hidden password entry triggers a real Supabase
 * signInWithPassword() call against a single admin account you create in
 * the Supabase dashboard. This is genuine, server-checked authentication —
 * the database enforces (via Row Level Security, see supabase/schema.sql)
 * that only that signed-in account can write posts/settings. Nobody can
 * bypass this from the browser console the way they could with a purely
 * client-side check.
 *
 * LOCAL MODE (Supabase not configured): falls back to the original
 * client-side hash comparison against VITE_ADMIN_PASSWORD_HASH. This
 * remains NOT real security — see the comment in that branch below — and
 * content saved this way stays in one browser (IndexedDB), never shared.
 *
 * Either way, the hidden keyboard-sequence UX is the same: click
 * somewhere that isn't a text field, type the password, press Enter.
 */

const SESSION_KEY = "archive-admin-session"; // local mode only
const MAX_BUFFER = 128;
const MAX_ATTEMPTS = 5;
const LOCKOUT_MS = 30_000;

const ADMIN_EMAIL = import.meta.env.VITE_ADMIN_EMAIL;
const SHARED_MODE = isSupabaseConfigured && Boolean(ADMIN_EMAIL);

// LOCAL MODE ONLY. Fallback hash is SHA-256 of "changeme-please", used
// only so a fresh checkout doesn't crash. Set your own
// VITE_ADMIN_PASSWORD_HASH (see scripts/hash-password.mjs) before
// publishing a site that runs in local mode.
const FALLBACK_HASH =
  "7fbe492d7707687274232f58e6593d83496be2f471a71ae07d2019115b97095d";
const CONFIGURED_HASH = import.meta.env.VITE_ADMIN_PASSWORD_HASH;
const LOCAL_PASSWORD_HASH = CONFIGURED_HASH || FALLBACK_HASH;

if (!SHARED_MODE && !CONFIGURED_HASH && import.meta.env.DEV) {
  // eslint-disable-next-line no-console
  console.warn(
    '[admin-auth] Running in local mode with a fallback demo password hash. Configure Supabase for shared/permanent content, or at minimum set VITE_ADMIN_PASSWORD_HASH — see README.md.'
  );
}

export function useAdminAuth() {
  const [isAdmin, setIsAdmin] = useState<boolean>(() => {
    if (SHARED_MODE) return false; // resolved async below via getSession()
    try {
      return sessionStorage.getItem(SESSION_KEY) === "true";
    } catch {
      return false;
    }
  });
  const [checkingSession, setCheckingSession] = useState(SHARED_MODE);
  const [justUnlocked, setJustUnlocked] = useState(false);
  const buffer = useRef("");
  const attempts = useRef(0);
  const lockedUntil = useRef(0);

  // SHARED MODE: pick up an existing Supabase session on load, and stay
  // in sync if it changes (e.g. token refresh, or signing out in another
  // tab).
  useEffect(() => {
    if (!SHARED_MODE || !supabase) return;
    supabase.auth.getSession().then(({ data }) => {
      setIsAdmin(Boolean(data.session));
      setCheckingSession(false);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsAdmin(Boolean(session));
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  const login = useCallback(() => {
    setIsAdmin(true);
    setJustUnlocked(true);
    attempts.current = 0;
    if (!SHARED_MODE) {
      try {
        sessionStorage.setItem(SESSION_KEY, "true");
      } catch {
        /* ignore - private browsing etc. */
      }
    }
    window.setTimeout(() => setJustUnlocked(false), 1500);
  }, []);

  const logout = useCallback(() => {
    setIsAdmin(false);
    if (SHARED_MODE && supabase) {
      void supabase.auth.signOut();
    } else {
      try {
        sessionStorage.removeItem(SESSION_KEY);
      } catch {
        /* ignore */
      }
    }
  }, []);

  useEffect(() => {
    if (isAdmin) return; // no need to listen once unlocked

    function isTypingInField() {
      const el = document.activeElement;
      if (!el) return false;
      const tag = el.tagName.toLowerCase();
      return (
        tag === "input" ||
        tag === "textarea" ||
        (el as HTMLElement).isContentEditable
      );
    }

    async function tryLogin(candidate: string) {
      if (Date.now() < lockedUntil.current) return; // locked out, ignore silently

      let ok = false;
      if (SHARED_MODE && supabase) {
        const { error } = await supabase.auth.signInWithPassword({
          email: ADMIN_EMAIL as string,
          password: candidate,
        });
        ok = !error;
      } else {
        const candidateHash = await sha256Hex(candidate);
        ok = candidateHash === LOCAL_PASSWORD_HASH;
      }

      if (ok) {
        login();
        return;
      }
      attempts.current += 1;
      if (attempts.current >= MAX_ATTEMPTS) {
        lockedUntil.current = Date.now() + LOCKOUT_MS;
        attempts.current = 0;
      }
    }

    function onKeyDown(e: KeyboardEvent) {
      if (isTypingInField()) return; // don't hijack normal typing/forms
      if (Date.now() < lockedUntil.current) return;

      if (e.key === "Enter") {
        const candidate = buffer.current;
        buffer.current = "";
        if (candidate) void tryLogin(candidate);
        return;
      }

      if (e.key === "Backspace") {
        buffer.current = buffer.current.slice(0, -1);
        return;
      }

      if (e.key.length === 1) {
        buffer.current = (buffer.current + e.key).slice(-MAX_BUFFER);
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isAdmin, login]);

  return { isAdmin, checkingSession, justUnlocked, login, logout, sharedMode: SHARED_MODE };
}
