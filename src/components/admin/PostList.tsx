import { useState } from "react";
import { Post } from "../../types";

interface PostListProps {
  posts: Post[];
  sharedMode: boolean;
  onNew: () => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => Promise<void>;
  onDuplicate: (id: string) => Promise<void>;
  onReorder: (orderedIds: string[]) => Promise<void>;
  onResetToSeed: () => Promise<void>;
}

export default function PostList({
  posts,
  sharedMode,
  onNew,
  onEdit,
  onDelete,
  onDuplicate,
  onReorder,
  onResetToSeed,
}: PostListProps) {
  const [pendingDelete, setPendingDelete] = useState<string | null>(null);

  function move(index: number, direction: -1 | 1) {
    const target = index + direction;
    if (target < 0 || target >= posts.length) return;
    const ids = posts.map((p) => p.id);
    [ids[index], ids[target]] = [ids[target], ids[index]];
    onReorder(ids);
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-sans font-semibold text-xl text-graphite">Posts</h2>
        <div className="flex gap-3">
          {!sharedMode && (
            <button
              onClick={onResetToSeed}
              className="font-mono text-[11px] tracking-[0.08em] uppercase text-graphite/50 hover:text-graphite"
            >
              Reset demo content
            </button>
          )}
          <button
            onClick={onNew}
            className="font-mono text-[11px] tracking-[0.08em] uppercase bg-graphite text-paper px-4 py-2 hover:bg-blueprint transition-colors"
          >
            + New Post
          </button>
        </div>
      </div>

      {posts.length === 0 && (
        <p className="font-serif text-graphite-soft py-10 text-center">
          No posts yet. Create your first entry.
        </p>
      )}

      <ul className="divide-y divide-graphite/10 border border-graphite/10 bg-paper">
        {posts.map((post, i) => (
          <li key={post.id} className="flex items-center gap-4 px-4 py-3">
            <div className="flex flex-col">
              <button
                onClick={() => move(i, -1)}
                disabled={i === 0}
                aria-label="Move up"
                className="text-graphite/40 hover:text-graphite disabled:opacity-20 leading-none text-xs"
              >
                ▲
              </button>
              <button
                onClick={() => move(i, 1)}
                disabled={i === posts.length - 1}
                aria-label="Move down"
                className="text-graphite/40 hover:text-graphite disabled:opacity-20 leading-none text-xs"
              >
                ▼
              </button>
            </div>

            <div className="flex-1 min-w-0">
              <p className="font-mono text-[10px] tracking-[0.08em] text-blueprint">
                PROJECT {String(post.projectNumber).padStart(3, "0")} · {post.category.toUpperCase()} ·{" "}
                {post.projectStatus.toUpperCase()}
              </p>
              <p className="font-sans font-medium text-graphite truncate">{post.title}</p>
              <p className="font-mono text-[10px] text-graphite/40">{post.date}</p>
            </div>

            <div className="flex gap-2 font-mono text-[11px] tracking-[0.05em] uppercase">
              <button
                onClick={() => onEdit(post.id)}
                className="text-graphite/60 hover:text-blueprint"
              >
                Edit
              </button>
              <button
                onClick={() => onDuplicate(post.id)}
                className="text-graphite/60 hover:text-blueprint"
              >
                Duplicate
              </button>
              {pendingDelete === post.id ? (
                <>
                  <button
                    onClick={() => {
                      onDelete(post.id);
                      setPendingDelete(null);
                    }}
                    className="text-rust font-semibold"
                  >
                    Confirm
                  </button>
                  <button
                    onClick={() => setPendingDelete(null)}
                    className="text-graphite/40"
                  >
                    Cancel
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setPendingDelete(post.id)}
                  className="text-graphite/60 hover:text-rust"
                >
                  Delete
                </button>
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
