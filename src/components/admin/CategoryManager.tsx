import { useState } from "react";
import { SiteSettings, Category } from "../../types";

interface Props {
  settings: SiteSettings;
  onSave: (settings: SiteSettings) => Promise<void>;
}

export default function CategoryManager({ settings, onSave }: Props) {
  const [categories, setCategories] = useState<Category[]>(settings.categories);
  const [newCategory, setNewCategory] = useState("");
  const [saved, setSaved] = useState(false);

  function addCategory() {
    const trimmed = newCategory.trim();
    if (!trimmed || categories.includes(trimmed as Category)) return;
    setCategories([...categories, trimmed as Category]);
    setNewCategory("");
  }

  function removeCategory(cat: Category) {
    setCategories(categories.filter((c) => c !== cat));
  }

  async function save() {
    await onSave({ ...settings, categories });
    setSaved(true);
    window.setTimeout(() => setSaved(false), 1500);
  }

  return (
    <div className="max-w-lg">
      <h2 className="font-sans font-semibold text-xl text-graphite mb-6">Categories</h2>

      <ul className="flex flex-wrap gap-2 mb-5">
        {categories.map((cat) => (
          <li
            key={cat}
            className="font-mono text-[11px] uppercase tracking-[0.05em] border border-graphite/20 px-2.5 py-1.5 flex items-center gap-2"
          >
            {cat}
            <button
              type="button"
              onClick={() => removeCategory(cat)}
              aria-label={`Remove ${cat}`}
              className="text-graphite/40 hover:text-rust"
            >
              ×
            </button>
          </li>
        ))}
      </ul>

      <div className="flex gap-2 mb-6">
        <input
          value={newCategory}
          onChange={(e) => setNewCategory(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              addCategory();
            }
          }}
          placeholder="New category…"
          className="bg-paper border border-graphite/15 px-3 py-2 text-sm flex-1"
        />
        <button
          type="button"
          onClick={addCategory}
          className="font-mono text-[11px] uppercase border border-graphite/25 px-3 py-2 hover:border-blueprint hover:text-blueprint"
        >
          Add
        </button>
      </div>

      <button
        type="button"
        onClick={save}
        className="font-mono text-[11px] tracking-[0.08em] uppercase bg-graphite text-paper px-4 py-2 hover:bg-blueprint transition-colors"
      >
        {saved ? "Saved" : "Save changes"}
      </button>
    </div>
  );
}
