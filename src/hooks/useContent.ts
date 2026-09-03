import { useCallback, useEffect, useState } from "react";
import { repository } from "../repository";
import { Post, SiteSettings, DEFAULT_SETTINGS } from "../types";

export function useContent() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [settings, setSettings] = useState<SiteSettings>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    const [loadedPosts, loadedSettings] = await Promise.all([
      repository.getPosts(),
      repository.getSettings(),
    ]);
    setPosts(loadedPosts);
    setSettings(loadedSettings);
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      await refresh();
      if (!cancelled) setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [refresh]);

  const createPost = useCallback(
    async (post: Post) => {
      await repository.createPost(post);
      await refresh();
    },
    [refresh]
  );

  const updatePost = useCallback(
    async (post: Post) => {
      await repository.updatePost(post);
      await refresh();
    },
    [refresh]
  );

  const deletePost = useCallback(
    async (id: string) => {
      await repository.deletePost(id);
      await refresh();
    },
    [refresh]
  );

  const duplicatePost = useCallback(
    async (id: string) => {
      await repository.duplicatePost(id);
      await refresh();
    },
    [refresh]
  );

  const reorderPosts = useCallback(
    async (orderedIds: string[]) => {
      await repository.reorderPosts(orderedIds);
      await refresh();
    },
    [refresh]
  );

  const updateSettings = useCallback(async (next: SiteSettings) => {
    const saved = await repository.updateSettings(next);
    setSettings(saved);
  }, []);

  const resetToSeed = useCallback(async () => {
    await repository.resetToSeed();
    await refresh();
  }, [refresh]);

  return {
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
  };
}
