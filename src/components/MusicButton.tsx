import { useEffect, useRef, useState } from "react";
import { MusicSettings } from "../types";

const MUTE_KEY = "archive-music-muted";

export default function MusicButton({ music }: { music: MusicSettings }) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [muted, setMuted] = useState<boolean>(() => {
    try {
      const stored = localStorage.getItem(MUTE_KEY);
      // default to muted until the visitor opts in, respecting autoplay rules
      return stored === null ? true : stored === "true";
    } catch {
      return true;
    }
  });
  const [hasInteracted, setHasInteracted] = useState(false);

  useEffect(() => {
    if (!music.enabled || !music.trackSrc) return;

    function unlock() {
      setHasInteracted(true);
      window.removeEventListener("pointerdown", unlock);
      window.removeEventListener("keydown", unlock);
    }
    window.addEventListener("pointerdown", unlock);
    window.addEventListener("keydown", unlock);
    return () => {
      window.removeEventListener("pointerdown", unlock);
      window.removeEventListener("keydown", unlock);
    };
  }, [music.enabled, music.trackSrc]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !music.enabled) return;
    audio.volume = music.defaultVolume;
    if (!muted && hasInteracted) {
      audio.play().catch(() => {
        // Autoplay blocked — the visitor can still press the button
        // once they've interacted with the page.
      });
    } else {
      audio.pause();
    }
  }, [muted, hasInteracted, music.enabled, music.defaultVolume]);

  if (!music.enabled || !music.trackSrc) return null;

  function toggle() {
    setHasInteracted(true);
    setMuted((prev) => {
      const next = !prev;
      try {
        localStorage.setItem(MUTE_KEY, String(next));
      } catch {
        /* ignore */
      }
      return next;
    });
  }

  return (
    <>
      <audio ref={audioRef} src={music.trackSrc} loop preload="none" />
      <button
        onClick={toggle}
        aria-label={muted ? "Play background music" : "Mute background music"}
        aria-pressed={!muted}
        className="fixed top-5 left-5 z-30 w-9 h-9 flex items-center justify-center rounded-full bg-paper/90 border border-graphite/15 text-graphite shadow-sm backdrop-blur hover:border-blueprint/50 transition-colors"
      >
        <span className="font-mono text-sm" aria-hidden>
          {muted ? "♪" : "♫"}
        </span>
      </button>
    </>
  );
}
