import { marked } from "marked";
import DOMPurify from "dompurify";

marked.setOptions({
  breaks: true,
  gfm: true,
});

/**
 * Converts trusted-author Markdown into sanitized HTML safe to render
 * with dangerouslySetInnerHTML. Every post body goes through here before
 * it reaches the DOM, and every uploaded/pasted image src is validated
 * separately in ImageUploader.
 */
export function renderMarkdown(markdown: string): string {
  const rawHtml = marked.parse(markdown, { async: false }) as string;
  return DOMPurify.sanitize(rawHtml, {
    ALLOWED_TAGS: [
      "p",
      "br",
      "strong",
      "em",
      "b",
      "i",
      "u",
      "s",
      "a",
      "ul",
      "ol",
      "li",
      "h1",
      "h2",
      "h3",
      "h4",
      "blockquote",
      "code",
      "pre",
      "table",
      "thead",
      "tbody",
      "tr",
      "th",
      "td",
      "hr",
      "img",
      "figure",
      "figcaption",
      "span",
    ],
    ALLOWED_ATTR: ["href", "src", "alt", "title", "class", "target", "rel"],
    ALLOW_DATA_ATTR: false,
  });
}

const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
const MAX_IMAGE_BYTES = 8 * 1024 * 1024; // 8MB safety cap for a local prototype

export function isAllowedImageFile(file: File): { ok: boolean; reason?: string } {
  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    return { ok: false, reason: "Only JPG, PNG, and WebP images are supported." };
  }
  if (file.size > MAX_IMAGE_BYTES) {
    return { ok: false, reason: "Image is larger than 8MB." };
  }
  return { ok: true };
}

const ALLOWED_AUDIO_TYPES = ["audio/mpeg", "audio/mp3", "audio/wav", "audio/ogg"];
const MAX_AUDIO_BYTES = 20 * 1024 * 1024;

export function isAllowedAudioFile(file: File): { ok: boolean; reason?: string } {
  if (!ALLOWED_AUDIO_TYPES.includes(file.type)) {
    return { ok: false, reason: "Only MP3, WAV, and OGG audio are supported." };
  }
  if (file.size > MAX_AUDIO_BYTES) {
    return { ok: false, reason: "Audio file is larger than 20MB." };
  }
  return { ok: true };
}

/**
 * Downscales an image client-side before it's stored, so the public
 * archive doesn't ship enormous camera-original files. Returns a JPEG
 * data URL.
 */
export function optimizeImage(
  file: File,
  maxDimension = 2000,
  quality = 0.85
): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(reader.error);
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error("Could not read image"));
      img.onload = () => {
        let { width, height } = img;
        if (width > maxDimension || height > maxDimension) {
          const scale = maxDimension / Math.max(width, height);
          width = Math.round(width * scale);
          height = Math.round(height * scale);
        }
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          resolve(reader.result as string);
          return;
        }
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL("image/jpeg", quality));
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  });
}

export function readFileAsDataURL(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(reader.error);
    reader.onload = () => resolve(reader.result as string);
    reader.readAsDataURL(file);
  });
}
