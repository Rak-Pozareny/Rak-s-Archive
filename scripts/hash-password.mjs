#!/usr/bin/env node
/**
 * Generates the SHA-256 hash to put in your .env.local file as
 * VITE_ADMIN_PASSWORD_HASH, so the real password is never written to disk
 * in this project and never committed to git.
 *
 * Usage:
 *   node scripts/hash-password.mjs "your new password"
 */
import { createHash } from "node:crypto";

const password = process.argv.slice(2).join(" ");

if (!password) {
  console.error('Usage: node scripts/hash-password.mjs "your new password"');
  process.exit(1);
}

if (password.length < 10) {
  console.warn(
    "Warning: that's short. Prefer a longer passphrase (4+ random words, or 12+ characters) over a short PIN — it's the only real defense a static site has."
  );
}

const hash = createHash("sha256").update(password, "utf8").digest("hex");

console.log("\nAdd this line to a .env.local file in the project root:\n");
console.log(`VITE_ADMIN_PASSWORD_HASH=${hash}\n`);
console.log(
  "Do not put the plaintext password itself anywhere in the project. .env.local is already git-ignored.\n"
);
