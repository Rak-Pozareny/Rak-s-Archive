interface FiltersProps {
  categories: string[];
  active: string;
  onChange: (category: string) => void;
}

export default function Filters({ categories, active, onChange }: FiltersProps) {
  const options = ["All", ...categories];

  return (
    <nav
      aria-label="Filter projects by category"
      className="sticky top-0 z-20 backdrop-blur bg-paper/85 border-b border-graphite/10"
    >
      <div className="max-w-3xl mx-auto px-6 sm:px-8">
        <ul className="flex gap-5 overflow-x-auto no-scrollbar py-3 font-mono text-[11px] tracking-[0.1em]">
          {options.map((opt) => {
            const isActive = opt === active;
            return (
              <li key={opt}>
                <button
                  onClick={() => onChange(opt)}
                  className={`whitespace-nowrap uppercase pb-1 border-b-2 transition-colors ${
                    isActive
                      ? "border-blueprint text-blueprint"
                      : "border-transparent text-graphite/50 hover:text-graphite"
                  }`}
                  aria-current={isActive ? "true" : undefined}
                >
                  {opt}
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    </nav>
  );
}
