/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        paper: "#F2EFE7",
        "paper-dim": "#E8E3D6",
        graphite: "#1B1D1E",
        "graphite-soft": "#2A2D2E",
        blueprint: "#26456B",
        "blueprint-light": "#4A7BA6",
        cyan: "#4F8A8B",
        aluminum: "#9AA0A6",
        rust: "#B5533C",
      },
      fontFamily: {
        serif: ["'Source Serif 4'", "Georgia", "serif"],
        mono: ["'IBM Plex Mono'", "'JetBrains Mono'", "monospace"],
        sans: ["'Inter'", "system-ui", "sans-serif"],
      },
      backgroundImage: {
        blueprint:
          "linear-gradient(rgba(38,69,107,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(38,69,107,0.06) 1px, transparent 1px)",
      },
      backgroundSize: {
        grid: "24px 24px",
      },
    },
  },
  plugins: [],
};
