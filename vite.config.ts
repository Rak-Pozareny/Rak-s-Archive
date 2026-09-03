import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// VITE_BASE_PATH is set automatically by the GitHub Pages workflow
// (.github/workflows/deploy-pages.yml) to "/<repo-name>/", since GitHub
// Pages serves this site from a subpath rather than the domain root.
// Left unset (the default), it falls back to "/", which is correct for
// Vercel, Netlify, or local dev.
export default defineConfig({
  base: process.env.VITE_BASE_PATH || "/",
  plugins: [react()],
});
