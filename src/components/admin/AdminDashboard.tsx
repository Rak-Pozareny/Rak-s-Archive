import { useState } from "react";
import { Post, SiteSettings } from "../../types";
import PostList from "./PostList";
import PostEditor from "./PostEditor";
import BackgroundSettingsPanel from "./BackgroundSettings";
import MusicSettingsPanel from "./MusicSettings";
import CategoryManager from "./CategoryManager";

interface AdminDashboardProps {
  posts: Post[];
  settings: SiteSettings;
  onCreatePost: (post: Post) => Promise<void>;
  onUpdatePost: (post: Post) => Promise<void>;
  onDeletePost: (id: string) => Promise<void>;
  onDuplicatePost: (id: string) => Promise<void>;
  onReorderPosts: (orderedIds: string[]) => Promise<void>;
  onUpdateSettings: (settings: SiteSettings) => Promise<void>;
  onResetToSeed: () => Promise<void>;
  onLogout: () => void;
  sharedMode: boolean;
}

type Tab = "posts" | "appearance" | "music" | "categories";
type View = { tab: Tab; editingPostId?: string | "new" };

export default function AdminDashboard(props: AdminDashboardProps) {
  const { posts, settings } = props;
  const [view, setView] = useState<View>({ tab: "posts" });

  const editingPost =
    view.editingPostId && view.editingPostId !== "new"
      ? posts.find((p) => p.id === view.editingPostId)
      : undefined;

  return (
    <div className="min-h-screen bg-paper-dim">
      <header className="sticky top-0 z-20 bg-graphite text-paper border-b border-graphite/50">
        <div className="max-w-5xl mx-auto px-6 flex items-center justify-between h-14">
          <div className="flex items-center gap-6">
            <p className="font-mono text-[11px] tracking-[0.15em] text-cyan">
              ADMIN / {settings.siteName.toUpperCase()}
            </p>
            <nav className="hidden sm:flex gap-4 font-mono text-[11px] tracking-[0.08em] uppercase">
              {(
                [
                  ["posts", "Posts"],
                  ["appearance", "Appearance"],
                  ["music", "Music"],
                  ["categories", "Categories"],
                ] as [Tab, string][]
              ).map(([tab, label]) => (
                <button
                  key={tab}
                  onClick={() => setView({ tab })}
                  className={`pb-0.5 border-b-2 transition-colors ${
                    view.tab === tab
                      ? "border-cyan text-paper"
                      : "border-transparent text-paper/50 hover:text-paper"
                  }`}
                >
                  {label}
                </button>
              ))}
            </nav>
          </div>
          <button
            onClick={props.onLogout}
            className="font-mono text-[11px] tracking-[0.1em] uppercase border border-paper/30 px-3 py-1.5 hover:bg-paper hover:text-graphite transition-colors"
          >
            Log Out
          </button>
        </div>
        <nav className="sm:hidden flex gap-4 font-mono text-[10px] tracking-[0.08em] uppercase px-6 pb-3 overflow-x-auto">
          {(
            [
              ["posts", "Posts"],
              ["appearance", "Appearance"],
              ["music", "Music"],
              ["categories", "Categories"],
            ] as [Tab, string][]
          ).map(([tab, label]) => (
            <button
              key={tab}
              onClick={() => setView({ tab })}
              className={`whitespace-nowrap pb-0.5 border-b-2 ${
                view.tab === tab ? "border-cyan text-paper" : "border-transparent text-paper/50"
              }`}
            >
              {label}
            </button>
          ))}
        </nav>
      </header>

      <div
        className={`px-6 py-2 text-center font-mono text-[10px] tracking-[0.08em] uppercase ${
          props.sharedMode
            ? "bg-cyan/10 text-cyan"
            : "bg-rust/10 text-rust"
        }`}
      >
        {props.sharedMode
          ? "Shared mode — changes are saved permanently and visible to every visitor"
          : "Local mode — changes are only saved in this browser, not shared with visitors (set up Supabase in README.md)"}
      </div>

      <main className="max-w-5xl mx-auto px-6 py-10">
        {view.tab === "posts" && !view.editingPostId && (
          <PostList
            posts={posts}
            sharedMode={props.sharedMode}
            onNew={() => setView({ tab: "posts", editingPostId: "new" })}
            onEdit={(id) => setView({ tab: "posts", editingPostId: id })}
            onDelete={props.onDeletePost}
            onDuplicate={props.onDuplicatePost}
            onReorder={props.onReorderPosts}
            onResetToSeed={props.onResetToSeed}
          />
        )}

        {view.tab === "posts" && view.editingPostId && (
          <PostEditor
            key={view.editingPostId}
            post={editingPost}
            categories={settings.categories}
            onCancel={() => setView({ tab: "posts" })}
            onSave={async (post) => {
              if (editingPost) {
                await props.onUpdatePost(post);
              } else {
                await props.onCreatePost(post);
              }
              setView({ tab: "posts" });
            }}
          />
        )}

        {view.tab === "appearance" && (
          <BackgroundSettingsPanel
            settings={settings}
            onSave={props.onUpdateSettings}
          />
        )}

        {view.tab === "music" && (
          <MusicSettingsPanel settings={settings} onSave={props.onUpdateSettings} />
        )}

        {view.tab === "categories" && (
          <CategoryManager settings={settings} onSave={props.onUpdateSettings} />
        )}
      </main>
    </div>
  );
}
