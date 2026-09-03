import { v4 as uuid } from "uuid";
import { getDB } from "./db";
import { ContentRepository } from "./ContentRepository";
import { Post, SiteSettings, DEFAULT_SETTINGS } from "../types";
import { seedPosts } from "../data/seedPosts";

const SETTINGS_KEY = "site-settings";

export class IndexedDBRepository implements ContentRepository {
  private seeded = false;

  private async ensureSeeded() {
    if (this.seeded) return;
    this.seeded = true;
    const db = await getDB();
    const count = await db.count("posts");
    if (count === 0) {
      const tx = db.transaction("posts", "readwrite");
      for (const post of seedPosts) {
        await tx.store.put(post);
      }
      await tx.done;
    }
    const settings = await db.get("settings", SETTINGS_KEY);
    if (!settings) {
      await db.put("settings", DEFAULT_SETTINGS, SETTINGS_KEY);
    }
  }

  async getPosts(): Promise<Post[]> {
    await this.ensureSeeded();
    const db = await getDB();
    const posts = await db.getAllFromIndex("posts", "by-order");
    return posts.sort((a, b) => b.order - a.order);
  }

  async getPost(id: string): Promise<Post | undefined> {
    await this.ensureSeeded();
    const db = await getDB();
    return db.get("posts", id);
  }

  async createPost(post: Post): Promise<Post> {
    await this.ensureSeeded();
    const db = await getDB();
    const existing = await db.getAllFromIndex("posts", "by-order");
    const maxOrder = existing.reduce((m, p) => Math.max(m, p.order), 0);
    const maxProjectNumber = existing.reduce(
      (m, p) => Math.max(m, p.projectNumber),
      0
    );
    const now = new Date().toISOString();
    const toSave: Post = {
      ...post,
      id: post.id || uuid(),
      order: maxOrder + 1,
      projectNumber: post.projectNumber || maxProjectNumber + 1,
      createdAt: post.createdAt || now,
      updatedAt: now,
    };
    await db.put("posts", toSave);
    return toSave;
  }

  async updatePost(post: Post): Promise<Post> {
    const db = await getDB();
    const updated: Post = { ...post, updatedAt: new Date().toISOString() };
    await db.put("posts", updated);
    return updated;
  }

  async deletePost(id: string): Promise<void> {
    const db = await getDB();
    await db.delete("posts", id);
  }

  async duplicatePost(id: string): Promise<Post | undefined> {
    const original = await this.getPost(id);
    if (!original) return undefined;
    const db = await getDB();
    const existing = await db.getAllFromIndex("posts", "by-order");
    const maxOrder = existing.reduce((m, p) => Math.max(m, p.order), 0);
    const maxProjectNumber = existing.reduce(
      (m, p) => Math.max(m, p.projectNumber),
      0
    );
    const now = new Date().toISOString();
    const copy: Post = {
      ...original,
      id: uuid(),
      title: `${original.title} (Copy)`,
      order: maxOrder + 1,
      projectNumber: maxProjectNumber + 1,
      revision: "REV. 01",
      createdAt: now,
      updatedAt: now,
    };
    await db.put("posts", copy);
    return copy;
  }

  async reorderPosts(orderedIds: string[]): Promise<void> {
    const db = await getDB();
    // orderedIds[0] should render first (newest position) -> highest order value
    const total = orderedIds.length;
    const tx = db.transaction("posts", "readwrite");
    for (let i = 0; i < orderedIds.length; i++) {
      const post = await tx.store.get(orderedIds[i]);
      if (post) {
        post.order = total - i;
        post.updatedAt = new Date().toISOString();
        await tx.store.put(post);
      }
    }
    await tx.done;
  }

  async getSettings(): Promise<SiteSettings> {
    await this.ensureSeeded();
    const db = await getDB();
    const settings = await db.get("settings", SETTINGS_KEY);
    return settings ?? DEFAULT_SETTINGS;
  }

  async updateSettings(settings: SiteSettings): Promise<SiteSettings> {
    const db = await getDB();
    await db.put("settings", settings, SETTINGS_KEY);
    return settings;
  }

  async resetToSeed(): Promise<void> {
    const db = await getDB();
    await db.clear("posts");
    const tx = db.transaction("posts", "readwrite");
    for (const post of seedPosts) {
      await tx.store.put(post);
    }
    await tx.done;
    await db.put("settings", DEFAULT_SETTINGS, SETTINGS_KEY);
  }
}
