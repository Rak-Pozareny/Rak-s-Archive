import { Post, SiteSettings } from "../types";

/**
 * Storage-agnostic content interface.
 *
 * This prototype ships an IndexedDB-backed implementation
 * (see IndexedDBRepository.ts) so posts and settings survive page
 * reloads on one device/browser. It intentionally does NOT provide
 * multi-device sync, real authentication, or durable cloud storage.
 *
 * To move to production, implement this same interface against a real
 * backend (see README.md "Going to production") and swap the single
 * instantiation in src/repository/index.ts — nothing else in the app
 * needs to change.
 */
export interface ContentRepository {
  getPosts(): Promise<Post[]>;
  getPost(id: string): Promise<Post | undefined>;
  createPost(post: Post): Promise<Post>;
  updatePost(post: Post): Promise<Post>;
  deletePost(id: string): Promise<void>;
  duplicatePost(id: string): Promise<Post | undefined>;
  reorderPosts(orderedIds: string[]): Promise<void>;

  getSettings(): Promise<SiteSettings>;
  updateSettings(settings: SiteSettings): Promise<SiteSettings>;

  resetToSeed(): Promise<void>;
}
