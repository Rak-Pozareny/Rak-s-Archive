import { v4 as uuid } from "uuid";
import { supabase } from "../lib/supabaseClient";
import { ContentRepository } from "./ContentRepository";
import { Post, SiteSettings, DEFAULT_SETTINGS } from "../types";

const SETTINGS_ROW_ID = "singleton";

/**
 * Shared backend implementation of ContentRepository, backed by a
 * Supabase Postgres database. Every visitor reads the same rows;
 * only an authenticated admin (see useAdminAuth.ts) can write to them,
 * enforced server-side by Postgres Row Level Security — not just by
 * hiding a button in the UI. See supabase/schema.sql for the tables and
 * policies this expects, and README.md for setup steps.
 *
 * Only instantiated when isSupabaseConfigured is true (see
 * repository/index.ts), so the non-null assertions on `supabase` below
 * are safe in practice.
 */

interface PostRow {
  id: string;
  project_number: number;
  revision: string;
  title: string;
  date: string;
  category: string;
  excerpt: string;
  content: string;
  featured_image: Post["featuredImage"] | null;
  images: Post["images"];
  tags: string[];
  project_status: Post["projectStatus"];
  is_demo: boolean;
  order_index: number;
  created_at: string;
  updated_at: string;
}

function rowToPost(row: PostRow): Post {
  return {
    id: row.id,
    projectNumber: row.project_number,
    revision: row.revision,
    title: row.title,
    date: row.date,
    category: row.category as Post["category"],
    excerpt: row.excerpt,
    content: row.content,
    featuredImage: row.featured_image ?? undefined,
    images: row.images ?? [],
    tags: row.tags ?? [],
    projectStatus: row.project_status,
    isDemo: row.is_demo ?? false,
    order: row.order_index,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function postToRow(post: Post): PostRow {
  return {
    id: post.id,
    project_number: post.projectNumber,
    revision: post.revision,
    title: post.title,
    date: post.date,
    category: post.category,
    excerpt: post.excerpt,
    content: post.content,
    featured_image: post.featuredImage ?? null,
    images: post.images,
    tags: post.tags,
    project_status: post.projectStatus,
    is_demo: post.isDemo ?? false,
    order_index: post.order,
    created_at: post.createdAt,
    updated_at: post.updatedAt,
  };
}

export class SupabaseRepository implements ContentRepository {
  async getPosts(): Promise<Post[]> {
    const { data, error } = await supabase!
      .from("posts")
      .select("*")
      .order("order_index", { ascending: false });
    if (error) throw error;
    return (data ?? []).map((row) => rowToPost(row as PostRow));
  }

  async getPost(id: string): Promise<Post | undefined> {
    const { data, error } = await supabase!
      .from("posts")
      .select("*")
      .eq("id", id)
      .maybeSingle();
    if (error) throw error;
    return data ? rowToPost(data as PostRow) : undefined;
  }

  async createPost(post: Post): Promise<Post> {
    const existing = await this.getPosts();
    const maxOrder = existing.reduce((m, p) => Math.max(m, p.order), 0);
    const maxProjectNumber = existing.reduce((m, p) => Math.max(m, p.projectNumber), 0);
    const now = new Date().toISOString();
    const toSave: Post = {
      ...post,
      id: post.id || uuid(),
      order: maxOrder + 1,
      projectNumber: post.projectNumber || maxProjectNumber + 1,
      createdAt: post.createdAt || now,
      updatedAt: now,
    };
    const { error } = await supabase!.from("posts").insert(postToRow(toSave));
    if (error) throw error;
    return toSave;
  }

  async updatePost(post: Post): Promise<Post> {
    const updated: Post = { ...post, updatedAt: new Date().toISOString() };
    const { error } = await supabase!
      .from("posts")
      .update(postToRow(updated))
      .eq("id", post.id);
    if (error) throw error;
    return updated;
  }

  async deletePost(id: string): Promise<void> {
    const { error } = await supabase!.from("posts").delete().eq("id", id);
    if (error) throw error;
  }

  async duplicatePost(id: string): Promise<Post | undefined> {
    const original = await this.getPost(id);
    if (!original) return undefined;
    const existing = await this.getPosts();
    const maxOrder = existing.reduce((m, p) => Math.max(m, p.order), 0);
    const maxProjectNumber = existing.reduce((m, p) => Math.max(m, p.projectNumber), 0);
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
    const { error } = await supabase!.from("posts").insert(postToRow(copy));
    if (error) throw error;
    return copy;
  }

  async reorderPosts(orderedIds: string[]): Promise<void> {
    const total = orderedIds.length;
    const now = new Date().toISOString();
    const results = await Promise.all(
      orderedIds.map((id, i) =>
        supabase!
          .from("posts")
          .update({ order_index: total - i, updated_at: now })
          .eq("id", id)
      )
    );
    const failed = results.find((r) => r.error);
    if (failed?.error) throw failed.error;
  }

  async getSettings(): Promise<SiteSettings> {
    const { data, error } = await supabase!
      .from("site_settings")
      .select("data")
      .eq("id", SETTINGS_ROW_ID)
      .maybeSingle();
    if (error) throw error;
    return (data?.data as SiteSettings) ?? DEFAULT_SETTINGS;
  }

  async updateSettings(settings: SiteSettings): Promise<SiteSettings> {
    const { error } = await supabase!
      .from("site_settings")
      .upsert({ id: SETTINGS_ROW_ID, data: settings });
    if (error) throw error;
    return settings;
  }

  async resetToSeed(): Promise<void> {
    // Deliberately unsupported on the shared backend: a "wipe everyone's
    // content back to demo posts" button is too destructive once real
    // visitors can see this data. Manage seed/demo content directly via
    // the Supabase table editor or SQL editor instead.
    throw new Error(
      "Resetting to demo content isn't available on the shared backend — edit or delete posts individually, or use the Supabase table editor."
    );
  }
}
