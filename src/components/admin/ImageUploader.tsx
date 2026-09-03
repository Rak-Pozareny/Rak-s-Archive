import { useRef, useState } from "react";
import { v4 as uuid } from "uuid";
import { PostImage } from "../../types";
import { isAllowedImageFile, optimizeImage } from "../../utils/sanitize";

interface ImageUploaderProps {
  images: PostImage[];
  featuredImageId?: string;
  onChange: (images: PostImage[]) => void;
  onSetFeatured: (imageId: string) => void;
}

export default function ImageUploader({
  images,
  featuredImageId,
  onChange,
  onSetFeatured,
}: ImageUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    setError(null);
    setBusy(true);
    const next: PostImage[] = [...images];
    for (const file of Array.from(files)) {
      const check = isAllowedImageFile(file);
      if (!check.ok) {
        setError(check.reason ?? "Unsupported file.");
        continue;
      }
      try {
        const src = await optimizeImage(file);
        next.push({ id: uuid(), src, caption: "", alt: file.name });
      } catch {
        setError("Could not process one of the images.");
      }
    }
    onChange(next);
    setBusy(false);
    if (inputRef.current) inputRef.current.value = "";
  }

  function updateCaption(id: string, caption: string) {
    onChange(images.map((img) => (img.id === id ? { ...img, caption } : img)));
  }

  function remove(id: string) {
    onChange(images.filter((img) => img.id !== id));
  }

  function move(index: number, direction: -1 | 1) {
    const target = index + direction;
    if (target < 0 || target >= images.length) return;
    const next = [...images];
    [next[index], next[target]] = [next[target], next[index]];
    onChange(next);
  }

  return (
    <div>
      <label className="block font-mono text-[11px] tracking-[0.08em] uppercase text-graphite/60 mb-2">
        Images
      </label>

      <div className="flex items-center gap-3 mb-3">
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={busy}
          className="font-mono text-[11px] tracking-[0.08em] uppercase border border-graphite/25 px-3 py-2 hover:border-blueprint hover:text-blueprint transition-colors disabled:opacity-50"
        >
          {busy ? "Processing…" : "Upload images"}
        </button>
        <span className="font-mono text-[10px] text-graphite/40">
          JPG, PNG, WebP — resized automatically
        </span>
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        multiple
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />

      {error && <p className="font-mono text-[11px] text-rust mb-3">{error}</p>}

      {images.length > 0 && (
        <ul className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {images.map((img, i) => (
            <li
              key={img.id}
              className="border border-graphite/15 bg-paper-dim p-2 flex flex-col gap-2"
            >
              <div className="relative aspect-[4/3] bg-graphite/10 overflow-hidden">
                <img src={img.src} alt={img.alt || ""} className="w-full h-full object-cover" />
                {featuredImageId === img.id && (
                  <span className="absolute top-1 left-1 bg-blueprint text-paper text-[9px] font-mono px-1.5 py-0.5">
                    FEATURED
                  </span>
                )}
              </div>
              <input
                type="text"
                value={img.caption ?? ""}
                onChange={(e) => updateCaption(img.id, e.target.value)}
                placeholder="Caption…"
                className="font-mono text-[10px] px-2 py-1 border border-graphite/15 bg-paper"
              />
              <div className="flex items-center justify-between font-mono text-[10px] uppercase">
                <div className="flex gap-1.5">
                  <button
                    type="button"
                    onClick={() => move(i, -1)}
                    disabled={i === 0}
                    className="text-graphite/40 hover:text-graphite disabled:opacity-20"
                  >
                    ◀
                  </button>
                  <button
                    type="button"
                    onClick={() => move(i, 1)}
                    disabled={i === images.length - 1}
                    className="text-graphite/40 hover:text-graphite disabled:opacity-20"
                  >
                    ▶
                  </button>
                </div>
                <button
                  type="button"
                  onClick={() => onSetFeatured(img.id)}
                  className="text-graphite/50 hover:text-blueprint"
                >
                  Set featured
                </button>
                <button
                  type="button"
                  onClick={() => remove(img.id)}
                  className="text-graphite/50 hover:text-rust"
                >
                  Remove
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
