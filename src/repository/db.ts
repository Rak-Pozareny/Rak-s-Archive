import { openDB, DBSchema, IDBPDatabase } from "idb";
import { Post, SiteSettings } from "../types";

interface ArchiveDB extends DBSchema {
  posts: {
    key: string;
    value: Post;
    indexes: { "by-order": number };
  };
  settings: {
    key: string;
    value: SiteSettings;
  };
}

const DB_NAME = "engineering-archive";
const DB_VERSION = 1;

let dbPromise: Promise<IDBPDatabase<ArchiveDB>> | null = null;

export function getDB() {
  if (!dbPromise) {
    dbPromise = openDB<ArchiveDB>(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains("posts")) {
          const store = db.createObjectStore("posts", { keyPath: "id" });
          store.createIndex("by-order", "order");
        }
        if (!db.objectStoreNames.contains("settings")) {
          db.createObjectStore("settings");
        }
      },
    });
  }
  return dbPromise;
}
