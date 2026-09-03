/**
 * Hashes a string with SHA-256 using the browser's built-in Web Crypto API
 * (no dependency, no plaintext ever touches storage or comparison).
 *
 * This raises the bar above a plaintext password sitting in the bundle,
 * but it is NOT strong secrecy: the hash itself still ships in the public
 * JS bundle, because the browser has to be able to check against it. A
 * determined attacker with the bundle and unlimited guesses can still
 * brute-force a short/guessable password offline. Treat this as "harder
 * to casually spot" rather than "secure" — see README.md.
 */
export async function sha256Hex(input: string): Promise<string> {
  const data = new TextEncoder().encode(input);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}
