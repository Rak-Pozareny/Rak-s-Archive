import { SiteSettings } from "../types";

export default function Header({ settings }: { settings: SiteSettings }) {
  return (
    <header className="relative overflow-hidden border-b border-graphite/10">
      <div className="absolute inset-0 grid-texture opacity-60 pointer-events-none" />
      <div className="relative max-w-3xl mx-auto px-6 sm:px-8 pt-20 pb-14 sm:pt-28 sm:pb-16">
        <p className="font-mono text-[11px] tracking-[0.18em] text-blueprint mb-4">
          {settings.archiveLabel}
        </p>
        <h1 className="font-sans font-semibold text-4xl sm:text-5xl leading-tight text-graphite mb-4">
          {settings.siteName}
        </h1>
        <p className="font-serif text-lg sm:text-xl text-graphite-soft max-w-lg">
          {settings.tagline}
        </p>
      </div>
    </header>
  );
}
