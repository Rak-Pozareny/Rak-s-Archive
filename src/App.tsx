import { useMemo, useState, type CSSProperties } from "react";
import Header from "./components/Header";
import Filters from "./components/Filters";
import PostEntry from "./components/PostEntry";
import Lightbox from "./components/Lightbox";
import MusicButton from "./components/MusicButton";
import BackToTop from "./components/BackToTop";
import EmptyState from "./components/EmptyState";
import AdminDashboard from "./components/admin/AdminDashboard";
import { useContent } from "./hooks/useContent";
import { useAdminAuth } from "./hooks/useAdminAuth";
import { BackgroundSettings } from "./types";

function backgroundStyle(bg: BackgroundSettings): CSSProperties {
  switch (bg.mode) {
    case "solid":
      return { backgroundColor: bg.solidColor };
    case "gradient":
      return {
        backgroundImage: `linear-gradient(160deg, ${bg.gradientFrom}, ${bg.gradientTo})`,
      };
    case "image":
      return bg.imageSrc
        ? {
            backgroundImage: `url(${bg.imageSrc})`,
            backgroundPosition: bg.imagePosition,
            backgroundSize: bg.imageSize,
            backgroundRepeat: "no-repeat",
            backgroundAttachment: "fixed",
          }
        : { backgroundColor: bg.solidColor };
    case "paper":
      return { backgroundColor: "#F2EFE7" };
    case "blueprint":
    default:
      return { backgroundColor: bg.solidColor };
  }
}

export default function App() {
  const {
    posts,
    settings,
    loading,
    createPost,
    updatePost,
    deletePost,
    duplicatePost,
    reorderPosts,
    updateSettings,
    resetToSeed,
  } = useContent();
  const { isAdmin, checkingSession, justUnlocked, logout, sharedMode } = useAdminAuth();

  const [activeCategory, setActiveCategory] = useState("All");
  const [lightbox, setLightbox] = useState<{ postId: string; index: number } | null>(
    null
  );

  const categories = useMemo(() => {
    const set = new Set(posts.map((p) => p.category));
    return Array.from(set);
  }, [posts]);

  const visiblePosts = useMemo(() => {
    if (activeCategory === "All") return posts;
    return posts.filter((p) => p.category === activeCategory);
  }, [posts, activeCategory]);

  const lightboxPost = lightbox ? posts.find((p) => p.id === lightbox.postId) : null;

  if (loading || checkingSession) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="font-mono text-xs tracking-[0.15em] text-graphite/40">
          LOADING ARCHIVE…
        </p>
      </div>
    );
  }

  if (isAdmin) {
    return (
      <AdminDashboard
        posts={posts}
        settings={settings}
        onCreatePost={createPost}
        onUpdatePost={updatePost}
        onDeletePost={deletePost}
        onDuplicatePost={duplicatePost}
        onReorderPosts={reorderPosts}
        onUpdateSettings={updateSettings}
        onResetToSeed={resetToSeed}
        onLogout={logout}
        sharedMode={sharedMode}
      />
    );
  }

  return (
    <div className="min-h-screen relative" style={backgroundStyle(settings.background)}>
      {settings.background.mode === "blueprint" && (
        <div
          className="fixed inset-0 grid-texture pointer-events-none"
          style={{ opacity: settings.background.imageOpacity }}
        />
      )}
      {settings.background.mode === "paper" && (
        <div className="fixed inset-0 paper-texture pointer-events-none" />
      )}
      {settings.background.mode === "image" && settings.background.imageSrc && (
        <div
          className="fixed inset-0 pointer-events-none"
          style={{ backgroundColor: "#F2EFE7", opacity: settings.background.overlayOpacity }}
        />
      )}

      <div className="relative">
        <MusicButton music={settings.music} />

        {justUnlocked && (
          <div
            role="status"
            className="fixed top-5 right-5 z-40 font-mono text-[10px] tracking-[0.1em] bg-graphite text-paper px-3 py-2 rounded-sm"
          >
            ADMIN MODE
          </div>
        )}

        <Header settings={settings} />

        {posts.length > 0 && (
          <Filters
            categories={categories}
            active={activeCategory}
            onChange={setActiveCategory}
          />
        )}

        <main>
          {visiblePosts.length === 0 ? (
            <EmptyState />
          ) : (
            visiblePosts.map((post, i) => (
              <PostEntry
                key={post.id}
                post={post}
                index={i}
                onOpenImage={(postId, index) => setLightbox({ postId, index })}
              />
            ))
          )}
        </main>

        <footer className="max-w-3xl mx-auto px-6 sm:px-8 py-14 font-mono text-[10px] tracking-[0.1em] text-graphite/30">
          END OF LOG
        </footer>

        <BackToTop />

        {lightboxPost && lightbox && (
          <Lightbox
            images={lightboxPost.images}
            index={lightbox.index}
            onClose={() => setLightbox(null)}
            onNavigate={(index) => setLightbox({ postId: lightboxPost.id, index })}
          />
        )}
      </div>
    </div>
  );
}
