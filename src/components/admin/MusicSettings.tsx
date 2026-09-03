import { useRef, useState } from "react";
import { SiteSettings } from "../../types";
import { isAllowedAudioFile, readFileAsDataURL } from "../../utils/sanitize";

interface Props {
  settings: SiteSettings;
  onSave: (settings: SiteSettings) => Promise<void>;
}

export default function MusicSettingsPanel({ settings, onSave }: Props) {
  const [local, setLocal] = useState(settings.music);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  async function handleFile(file: File | undefined) {
    if (!file) return;
    const check = isAllowedAudioFile(file);
    if (!check.ok) {
      setError(check.reason ?? "Unsupported file.");
      return;
    }
    setError(null);
    const src = await readFileAsDataURL(file);
    setLocal((prev) => ({ ...prev, trackSrc: src, trackName: file.name }));
  }

  async function save() {
    await onSave({ ...settings, music: local });
    setSaved(true);
    window.setTimeout(() => setSaved(false), 1500);
  }

  return (
    <div className="max-w-xl">
      <h2 className="font-sans font-semibold text-xl text-graphite mb-6">Background Music</h2>

      <div className="flex items-center gap-3 mb-6">
        <input
          type="checkbox"
          id="music-enabled"
          checked={local.enabled}
          onChange={(e) => setLocal((prev) => ({ ...prev, enabled: e.target.checked }))}
          className="w-4 h-4"
        />
        <label htmlFor="music-enabled" className="font-mono text-[12px] uppercase tracking-[0.05em]">
          Enable background music on the public site
        </label>
      </div>

      <div className="mb-5">
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          className="font-mono text-[11px] uppercase border border-graphite/25 px-3 py-2 hover:border-blueprint hover:text-blueprint"
        >
          Upload track (MP3 / WAV / OGG)
        </button>
        <input
          ref={fileRef}
          type="file"
          accept="audio/mpeg,audio/mp3,audio/wav,audio/ogg"
          className="hidden"
          onChange={(e) => handleFile(e.target.files?.[0])}
        />
        {local.trackName && (
          <p className="font-mono text-[11px] text-graphite/60 mt-2">
            Current track: {local.trackName}
          </p>
        )}
        {error && <p className="font-mono text-[11px] text-rust mt-2">{error}</p>}
      </div>

      <label className="block mb-6">
        <span className="block font-mono text-[10px] tracking-[0.08em] uppercase text-graphite/50 mb-1">
          Default volume — {Math.round(local.defaultVolume * 100)}%
        </span>
        <input
          type="range"
          min={0}
          max={0.6}
          step={0.02}
          value={local.defaultVolume}
          onChange={(e) =>
            setLocal((prev) => ({ ...prev, defaultVolume: parseFloat(e.target.value) }))
          }
          className="w-full max-w-sm"
        />
        <span className="block font-mono text-[10px] text-graphite/40 mt-1">
          Capped at 60% — visitors control mute independently.
        </span>
      </label>

      {local.trackSrc && (
        <audio controls src={local.trackSrc} className="mb-6 w-full max-w-sm" />
      )}

      <p className="font-mono text-[10px] text-graphite/40 mb-6 max-w-md leading-relaxed">
        Browsers block autoplay with sound. Visitors will see the mute/unmute
        button in the top-left corner; music only starts after they interact
        with the page, and their mute choice is remembered on that device.
      </p>

      <button
        type="button"
        onClick={save}
        className="font-mono text-[11px] tracking-[0.08em] uppercase bg-graphite text-paper px-4 py-2 hover:bg-blueprint transition-colors"
      >
        {saved ? "Saved" : "Save changes"}
      </button>
    </div>
  );
}
