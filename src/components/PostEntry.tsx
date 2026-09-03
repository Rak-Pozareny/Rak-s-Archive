import { useMemo } from "react";
import { Post } from "../types";
import { renderMarkdown } from "../utils/sanitize";

const STATUS_LABEL: Record<Post["projectStatus"], string> = {
  active: "ACTIVE",
  completed: "COMPLETED",
  archived: "ARCHIVED",
  experiment: "EXPERIMENT",
  "on-hold": "ON HOLD",
};

const STATUS_COLOR: Record<Post["projectStatus"], string> = {
  active: "text-blueprint",
  completed: "text-cyan",
  archived: "text-aluminum",
  experiment: "text-rust",
  "on-hold": "text-aluminum",
};

function formatDate(iso: string) {
  try {
    return new Date(iso).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
    });
  } catch {
    return iso;
  }
}

interface PostEntryProps {
  post: Post;
  index: number;
  onOpenImage: (postId: string, imageIndex: number) => void;
}

export default function PostEntry({ post, index, onOpenImage }: PostEntryProps) {
  const html = useMemo(() => renderMarkdown(post.content), [post.content]);
  const galleryImages = post.images;

  return (
    <article
      className="entry-reveal max-w-3xl mx-auto px-6 sm:px-8 py-14 sm:py-20 border-b border-graphite/10 last:border-b-0"
      style={{ animationDelay: `${Math.min(index, 4) * 60}ms` }}
    >
      <div className="font-mono text-[11px] tracking-[0.1em] text-graphite/50 mb-3 flex flex-wrap items-center gap-x-2">
        <span className="text-blueprint">
          PROJECT {String(post.projectNumber).padStart(3, "0")}
        </span>
        <span aria-hidden>·</span>
        <span>{post.category.toUpperCase()}</span>
        <span aria-hidden>·</span>
        <span className={STATUS_COLOR[post.projectStatus]}>
          {STATUS_LABEL[post.projectStatus]}
        </span>
        {post.isDemo && (
          <span className="ml-2 px-1.5 py-0.5 border border-rust/40 text-rust text-[10px]">
            DEMO PROJECT
          </span>
        )}
      </div>

      <h2 className="font-sans font-semibold text-2xl sm:text-3xl text-graphite mb-2 leading-snug">
        {post.title}
      </h2>

      <div className="font-mono text-[11px] tracking-[0.05em] text-graphite/40 mb-8">
        {formatDate(post.date)} · {post.revision}
      </div>

      {post.featuredImage && (
        <figure className="mb-8 -mx-6 sm:mx-0">
          <button
            className="block w-full"
            onClick={() =>
              onOpenImage(
                post.id,
                galleryImages.findIndex((i) => i.id === post.featuredImage!.id) ?? 0
              )
            }
          >
            <img
              src={post.featuredImage.src}
              alt={post.featuredImage.alt || post.title}
              loading="lazy"
              className="w-full h-auto object-cover sm:rounded-sm"
            />
          </button>
          {post.featuredImage.caption && (
            <figcaption className="font-mono text-[10px] tracking-[0.05em] text-graphite/40 mt-2 px-6 sm:px-0">
              {post.featuredImage.caption}
            </figcaption>
          )}
        </figure>
      )}

      <p className="font-serif text-lg text-graphite-soft mb-8 max-w-2xl">
        {post.excerpt}
      </p>

      <div
        className="prose-log text-graphite"
        // Content is Markdown authored in the admin editor, converted and
        // sanitized through renderMarkdown() (marked + DOMPurify) before
        // ever reaching innerHTML.
        dangerouslySetInnerHTML={{ __html: html }}
      />

      {galleryImages.length > 0 && (
        <div className="grid grid-cols-2 gap-2 mt-8">
          {galleryImages.map((img, i) => (
            <button
              key={img.id}
              onClick={() => onOpenImage(post.id, i)}
              className="group relative overflow-hidden sm:rounded-sm bg-graphite/5 aspect-[4/3]"
            >
              <img
                src={img.src}
                alt={img.alt || `${post.title} — figure ${i + 1}`}
                loading="lazy"
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
              {img.caption && (
                <span className="absolute bottom-0 left-0 right-0 bg-graphite/70 text-paper text-[10px] font-mono px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  {img.caption}
                </span>
              )}
            </button>
          ))}
        </div>
      )}

      {post.tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-10">
          {post.tags.map((tag) => (
            <span
              key={tag}
              className="font-mono text-[10px] tracking-[0.05em] text-graphite/50 border border-graphite/15 px-2 py-1"
            >
              #{tag}
            </span>
          ))}
        </div>
      )}
    </article>
  );
}
