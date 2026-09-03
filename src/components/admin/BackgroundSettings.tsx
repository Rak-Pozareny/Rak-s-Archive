import { useRef, useState } from "react";
import { SiteSettings, BackgroundMode } from "../../types";
import { isAllowedImageFile, readFileAsDataURL } from "../../utils/sanitize";

interface Props {
  settings: SiteSettings;
  onSave: (settings: SiteSettings) => Promise<void>;
}

const MODES: { value: BackgroundMode; label: string }[] = [
  { value: "blueprint", label: "Blueprint grid" },
  { value: "paper", label: "Paper / notebook" },
  { value: "solid", label: "Solid color" },
  { value: "gradient", label: "Gradient" },
  { value: "image", label: "Custom image" },
];

export default function BackgroundSettingsPanel({ settings, onSave }: Props) {
  const [local, setLocal] = useState(settings);
  const [siteName, setSiteName] = useState(settings.siteName);
  const [tagline, setTagline] = useState(settings.tagline);
  const [archiveLabel, setArchiveLabel] = useState(settings.archiveLabel);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  function updateBg<K extends keyof SiteSettings["background"]>(
    key: K,
    value: SiteSettings["background"][K]
  ) {
    setLocal((prev) => ({ ...prev, background: { ...prev.background, [key]: value } }));
  }

  async function handleImage(file: File | undefined) {
    if (!file) return;
    const check = isAllowedImageFile(file);
    if (!check.ok) {
      setError(check.reason ?? "Unsupported file.");
      return;
    }
    setError(null);
    const src = await readFileAsDataURL(file);
    updateBg("imageSrc", src);
  }

  async function save() {
    await onSave({ ...local, siteName, tagline, archiveLabel });
    setSaved(true);
    window.setTimeout(() => setSaved(false), 1500);
  }

  return (
    <div className="max-w-2xl">
      <h2 className="font-sans font-semibold text-xl text-graphite mb-6">Site Appearance</h2>

      <section className="mb-8 space-y-4">
        <h3 className="font-mono text-[11px] tracking-[0.08em] uppercase text-graphite/50">
          Identity
        </h3>
        <LabeledInput label="Site name / your name" value={siteName} onChange={setSiteName} />
        <LabeledInput label="Tagline" value={tagline} onChange={setTagline} />
        <LabeledInput
          label="Archive label"
          value={archiveLabel}
          onChange={setArchiveLabel}
        />
      </section>

      <section className="mb-8">
        <h3 className="font-mono text-[11px] tracking-[0.08em] uppercase text-graphite/50 mb-3">
          Background
        </h3>
        <div className="flex flex-wrap gap-2 mb-5">
          {MODES.map((m) => (
            <button
              key={m.value}
              type="button"
              onClick={() => updateBg("mode", m.value)}
              className={`font-mono text-[11px] uppercase tracking-[0.05em] px-3 py-2 border ${
                local.background.mode === m.value
                  ? "border-blueprint text-blueprint bg-blueprint/5"
                  : "border-graphite/20 text-graphite/60"
              }`}
            >
              {m.label}
            </button>
          ))}
        </div>

        {(local.background.mode === "solid" || local.background.mode === "blueprint") && (
          <LabeledInput
            label="Base color"
            type="color"
            value={local.background.solidColor}
            onChange={(v) => updateBg("solidColor", v)}
          />
        )}

        {local.background.mode === "gradient" && (
          <div className="flex gap-4">
            <LabeledInput
              label="From"
              type="color"
              value={local.background.gradientFrom}
              onChange={(v) => updateBg("gradientFrom", v)}
            />
            <LabeledInput
              label="To"
              type="color"
              value={local.background.gradientTo}
              onChange={(v) => updateBg("gradientTo", v)}
            />
          </div>
        )}

        {local.background.mode === "image" && (
          <div className="space-y-3">
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="font-mono text-[11px] uppercase border border-graphite/25 px-3 py-2 hover:border-blueprint hover:text-blueprint"
            >
              Upload background image
            </button>
            <input
              ref={fileRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              onChange={(e) => handleImage(e.target.files?.[0])}
            />
            {local.background.imageSrc && (
              <img
                src={local.background.imageSrc}
                alt="Background preview"
                className="w-full max-w-xs h-32 object-cover border border-graphite/15"
              />
            )}
            <div className="grid grid-cols-2 gap-3">
              <LabeledSelect
                label="Position"
                value={local.background.imagePosition}
                onChange={(v) => updateBg("imagePosition", v)}
                options={["center", "top", "bottom", "left", "right"]}
              />
              <LabeledSelect
                label="Size"
                value={local.background.imageSize}
                onChange={(v) => updateBg("imageSize", v)}
                options={["cover", "contain", "auto"]}
              />
            </div>
            <RangeField
              label="Overlay opacity (readability)"
              value={local.background.overlayOpacity}
              onChange={(v) => updateBg("overlayOpacity", v)}
            />
          </div>
        )}

        {error && <p className="font-mono text-[11px] text-rust mt-2">{error}</p>}
      </section>

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

function LabeledInput({
  label,
  value,
  onChange,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
}) {
  return (
    <label className="block">
      <span className="block font-mono text-[10px] tracking-[0.08em] uppercase text-graphite/50 mb-1">
        {label}
      </span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-paper border border-graphite/15 px-3 py-2 text-sm"
      />
    </label>
  );
}

function LabeledSelect({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: string[];
}) {
  return (
    <label className="block">
      <span className="block font-mono text-[10px] tracking-[0.08em] uppercase text-graphite/50 mb-1">
        {label}
      </span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-paper border border-graphite/15 px-3 py-2 text-sm"
      >
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
    </label>
  );
}

function RangeField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <label className="block">
      <span className="block font-mono text-[10px] tracking-[0.08em] uppercase text-graphite/50 mb-1">
        {label} — {Math.round(value * 100)}%
      </span>
      <input
        type="range"
        min={0}
        max={1}
        step={0.05}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="w-full"
      />
    </label>
  );
}
