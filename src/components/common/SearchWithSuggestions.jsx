import { useEffect, useMemo, useRef, useState } from "react";
import { useDebouncedValue } from "../../hooks/useDebouncedValue";

export default function SearchWithSuggestions({
  label = "Search",
  value,
  onChange,
  suggestions,
  placeholder = "Type to search...",
  debounceMs = 250,
  maxSuggestions = 8,
  getSuggestionLabel,
  onPickSuggestion,
}) {
  const [open, setOpen] = useState(false);
  const debounced = useDebouncedValue(value, debounceMs);
  const rootRef = useRef(null);

  const computedSuggestions = useMemo(() => {
    const list = Array.isArray(suggestions) ? suggestions : [];
    const q = (debounced || "").trim().toLowerCase();
    if (!q) return [];

    const filtered = list
      .map((s) => {
        const labelText =
          typeof getSuggestionLabel === "function"
            ? getSuggestionLabel(s)
            : String(s?.label ?? s?.title ?? s ?? "");
        return { item: s, labelText };
      })
      .filter(({ labelText }) => labelText.toLowerCase().includes(q));

    // ranking: prefix matches first
    filtered.sort((a, b) => {
      const aStarts = a.labelText.toLowerCase().startsWith(q);
      const bStarts = b.labelText.toLowerCase().startsWith(q);
      if (aStarts !== bStarts) return aStarts ? -1 : 1;
      return a.labelText.localeCompare(b.labelText);
    });

    return filtered
      .slice(0, maxSuggestions)
      .map(({ item, labelText }) => ({ item, labelText }));
  }, [suggestions, debounced, getSuggestionLabel, maxSuggestions]);

  useEffect(() => {
    if (!debounced?.trim()) {
      setOpen(false);
      return;
    }
    setOpen(true);
  }, [debounced]);

  useEffect(() => {
    const onDocClick = (e) => {
      const el = rootRef.current;
      if (!el) return;
      if (!el.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  return (
    <div className="relative" ref={rootRef}>
      <label className="text-sm text-muted" style={{ display: "block" }}>
        {label}
      </label>
      <input
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        placeholder={placeholder}
        className="mt-1"
        onFocus={() => setOpen(true)}
      />

      {open && computedSuggestions.length > 0 && (
        <div
          className="absolute left-0 right-0 mt-2 z-[100] glass-card overflow-hidden"
          style={{ borderColor: "var(--glass-border)" }}
        >
          {computedSuggestions.map(({ item, labelText }) => (
            <button
              type="button"
              key={String(item?.id ?? labelText)}
              className="w-full text-left px-3 py-2 hover:bg-[rgba(59,130,246,0.08)]"
              onClick={() => {
                onPickSuggestion?.(item);
                setOpen(false);
              }}
            >
              {labelText}
            </button>
          ))}
        </div>
      )}

      {open && debounced?.trim() && computedSuggestions.length === 0 && (
        <div
          className="absolute left-0 right-0 mt-2 z-[100] glass-card px-3 py-2 text-sm text-muted"
          style={{ borderColor: "var(--glass-border)" }}
        >
          No matches
        </div>
      )}
    </div>
  );
}

