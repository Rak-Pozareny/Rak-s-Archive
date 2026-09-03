import { useEffect, useRef } from "react";
import { PostImage } from "../types";

interface LightboxProps {
  images: PostImage[];
  index: number;
  onClose: () => void;
  onNavigate: (index: number) => void;
}

export default function Lightbox({ images, index, onClose, onNavigate }: LightboxProps) {
  const closeRef = useRef<HTMLButtonElement>(null);
  const image = images[index];

  useEffect(() => {
    closeRef.current?.focus();
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") onNavigate((index + 1) % images.length);
      if (e.key === "ArrowLeft") onNavigate((index - 1 + images.length) % images.length);
    }
    window.addEventListener("keydown", onKeyDown);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = prevOverflow;
    };
  }, [index, images.length, onClose, onNavigate]);

  if (!image) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Image viewer"
      className="fixed inset-0 z-50 bg-graphite/95 flex flex-col items-center justify-center px-4 py-6"
      onClick={onClose}
    >
      <button
        ref={closeRef}
        onClick={(e) => {
          e.stopPropagation();
          onClose();
        }}
        aria-label="Close image viewer"
        className="absolute top-5 right-5 text-paper/80 hover:text-paper font-mono text-2xl leading-none w-10 h-10 flex items-center justify-center"
      >
        ×
      </button>

      {images.length > 1 && (
        <>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onNavigate((index - 1 + images.length) % images.length);
            }}
            aria-label="Previous image"
            className="absolute left-2 sm:left-6 top-1/2 -translate-y-1/2 text-paper/70 hover:text-paper font-mono text-3xl w-10 h-10 flex items-center justify-center"
          >
            ‹
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onNavigate((index + 1) % images.length);
            }}
            aria-label="Next image"
            className="absolute right-2 sm:right-6 top-1/2 -translate-y-1/2 text-paper/70 hover:text-paper font-mono text-3xl w-10 h-10 flex items-center justify-center"
          >
            ›
          </button>
        </>
      )}

      <img
        src={image.src}
        alt={image.alt || "Project photograph"}
        onClick={(e) => e.stopPropagation()}
        className="max-h-[80vh] max-w-full object-contain select-none"
      />

      <div className="mt-4 text-center">
        {image.caption && (
          <p className="font-mono text-xs text-paper/70 mb-1">{image.caption}</p>
        )}
        {images.length > 1 && (
          <p className="font-mono text-[10px] text-paper/40">
            {index + 1} / {images.length}
          </p>
        )}
      </div>
    </div>
  );
}
