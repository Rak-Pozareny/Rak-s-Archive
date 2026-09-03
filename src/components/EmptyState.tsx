export default function EmptyState() {
  return (
    <div className="max-w-3xl mx-auto px-6 sm:px-8 py-28 text-center">
      <div className="mx-auto mb-6 w-14 h-14 border border-graphite/20 rounded-sm grid-texture" />
      <p className="font-mono text-[11px] tracking-[0.15em] text-blueprint mb-2">
        ARCHIVE EMPTY
      </p>
      <p className="font-serif text-graphite-soft">
        No field notes have been recorded yet.
      </p>
    </div>
  );
}
