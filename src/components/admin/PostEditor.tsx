import { useRef, useState, type FormEvent, type ReactNode } from "react";
import { v4 as uuid } from "uuid";
import { Post, ProjectStatus, PostImage } from "../../types";
import ImageUploader from "./ImageUploader";
import { renderMarkdown } from "../../utils/sanitize";

interface PostEditorProps {
  post?: Post;
  categories: string[];
  onCancel: () => void;
  onSave: (post: Post) => Promise<void>;
}

const STATUS_OPTIONS: ProjectStatus[] = [
  "active",
  "completed",
  "archived",
  "experiment",
  "on-hold",
];

const TOOLBAR: { label: string; wrap: [string, string]; block?: boolean }[] = [
  { label: "B", wrap: ["**", "**"] },
  { label: "I", wrap: ["*", "*"] },
  { label: "H2", wrap: ["\n## ", ""] },
  { label: "Quote", wrap: ["\n> ", ""] },
  { label: "List", wrap: ["\n- ", ""] },
  { label: "1.", wrap: ["\n1. ", ""] },
  { label: "Link", wrap: ["[", "](https://)"] },
  { label: "Code", wrap: ["`", "`"] },
  { label: "Code block", wrap: ["\n```\n", "\n```\n"], block: true },
  { label: "Table", wrap: ["\n| A | B |\n| --- | --- |\n| 1 | 2 |\n", ""], block: true },
];

function today() {
  return new Date().toISOString().slice(0, 10);
}

export default function PostEditor({ post, categories, onCancel, onSave }: PostEditorProps) {
  const [title, setTitle] = useState(post?.title ?? "");
  const [date, setDate] = useState(post?.date ?? today());
  const [category, setCategory] = useState(post?.category ?? categories[0] ?? "Other");
  const [tags, setTags] = useState(post?.tags.join(", ") ?? "");
  const [excerpt, setExcerpt] = useState(post?.excerpt ?? "");
  const [content, setContent] = useState(post?.content ?? "");
  const [status, setStatus] = useState<ProjectStatus>(post?.projectStatus ?? "active");
  const [revision, setRevision] = useState(post?.revision ?? "REV. 01");
  const [images, setImages] = useState<PostImage[]>(post?.images ?? []);
  const [featuredImageId, setFeaturedImageId] = useState<string | undefined>(
    post?.featuredImage?.id
  );
  const [showPreview, setShowPreview] = useState(false);
  const [saving, setSaving] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  function applyToolbar(before: string, after: string) {
    const el = textareaRef.current;
    if (!el) return;
    const start = el.selectionStart;
    const end = el.selectionEnd;
    const selected = content.slice(start, end);
    const next = content.slice(0, start) + before + selected + after + content.slice(end);
    setContent(next);
    requestAnimationFrame(() => {
      el.focus();
      el.selectionStart = start + before.length;
      el.selectionEnd = start + before.length + selected.length;
    });
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    setSaving(true);
    const featured = images.find((img) => img.id === featuredImageId);
    const toSave: Post = {
      id: post?.id ?? uuid(),
      projectNumber: post?.projectNumber ?? 0,
      revision,
      title: title.trim(),
      date,
      category: category as Post["category"],
      excerpt,
      content,
      images,
      featuredImage: featured,
      tags: tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
      projectStatus: status,
      isDemo: post?.isDemo ?? false,
      order: post?.order ?? 0,
      createdAt: post?.createdAt ?? new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    await onSave(toSave);
    setSaving(false);
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-3xl">
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-sans font-semibold text-xl text-graphite">
          {post ? "Edit Post" : "New Post"}
        </h2>
        <div className="flex gap-3 font-mono text-[11px] tracking-[0.08em] uppercase">
          <button type="button" onClick={onCancel} className="text-graphite/50 hover:text-graphite">
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="bg-graphite text-paper px-4 py-2 hover:bg-blueprint transition-colors disabled:opacity-50"
          >
            {saving ? "Saving…" : "Save Post"}
          </button>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-4 mb-4">
        <Field label="Title">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            className="input"
          />
        </Field>
        <Field label="Date">
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="input"
          />
        </Field>
        <Field label="Category">
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="input"
          >
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Status">
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as ProjectStatus)}
            className="input"
          >
            {STATUS_OPTIONS.map((s) => (
              <option key={s} value={s}>
                {s.toUpperCase()}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Revision label">
          <input value={revision} onChange={(e) => setRevision(e.target.value)} className="input" />
        </Field>
        <Field label="Tags (comma separated)">
          <input value={tags} onChange={(e) => setTags(e.target.value)} className="input" />
        </Field>
      </div>

      <Field label="Short description / excerpt">
        <textarea
          value={excerpt}
          onChange={(e) => setExcerpt(e.target.value)}
          rows={2}
          className="input"
        />
      </Field>

      <div className="mt-4 mb-2 flex items-center justify-between">
        <label className="font-mono text-[11px] tracking-[0.08em] uppercase text-graphite/60">
          Main content (Markdown)
        </label>
        <button
          type="button"
          onClick={() => setShowPreview((p) => !p)}
          className="font-mono text-[10px] tracking-[0.08em] uppercase text-blueprint"
        >
          {showPreview ? "Edit" : "Preview"}
        </button>
      </div>

      {!showPreview ? (
        <>
          <div className="flex flex-wrap gap-1.5 mb-2">
            {TOOLBAR.map((t) => (
              <button
                key={t.label}
                type="button"
                onClick={() => applyToolbar(t.wrap[0], t.wrap[1])}
                className="font-mono text-[10px] uppercase border border-graphite/20 px-2 py-1 hover:border-blueprint hover:text-blueprint"
              >
                {t.label}
              </button>
            ))}
          </div>
          <textarea
            ref={textareaRef}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={16}
            className="input font-mono text-[13px] leading-relaxed"
            placeholder="Write the project log in Markdown…"
          />
        </>
      ) : (
        <div
          className="prose-log border border-graphite/15 bg-paper p-6 min-h-[200px]"
          dangerouslySetInnerHTML={{ __html: renderMarkdown(content) }}
        />
      )}

      <div className="mt-8">
        <ImageUploader
          images={images}
          featuredImageId={featuredImageId}
          onChange={setImages}
          onSetFeatured={setFeaturedImageId}
        />
      </div>

      <style>{`
        .input {
          width: 100%;
          background: white;
          border: 1px solid rgba(27,29,30,0.15);
          padding: 0.55rem 0.7rem;
          font-family: Inter, system-ui, sans-serif;
          font-size: 0.9rem;
        }
        .input:focus {
          border-color: #26456B;
          outline: none;
        }
      `}</style>
    </form>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="block font-mono text-[10px] tracking-[0.08em] uppercase text-graphite/50 mb-1">
        {label}
      </span>
      {children}
    </label>
  );
}
