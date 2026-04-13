import { useState, useEffect } from "react";
import { useTheme } from "../contexts/ThemeContext";

const generateColors = (count = 12) => {
  const colors = [];
  const hues = [210, 270, 330, 0, 30, 60, 120, 180, 240, 300, 50, 90];
  const saturations = [60, 70, 80];
  const lightnesses = [50, 55, 60];

  for (let i = 0; i < count; i++) {
    const hue = hues[i % hues.length];
    const sat = saturations[Math.floor(i / 4) % saturations.length];
    const light = lightnesses[Math.floor(i / 12) % lightnesses.length];
    colors.push(`hsl(${hue}, ${sat}%, ${light}%)`);
  }

  // Add popular colors
  colors.push("#FF6B6B", "#4ECDC4", "#45B7D1", "#96CEB4", "#FECA57", "#FF9FF3");

  return [...new Set(colors)].slice(0, count);
};

export default function ColorPicker({
  value,
  onChange,
  label,
  className = "",
}) {
  const { boardColorPalette } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const [customColor, setCustomColor] = useState(value || "#3B82F6");

  const allColors = [...boardColorPalette, ...generateColors(16)];

  useEffect(() => {
    setCustomColor(value || "#3B82F6");
  }, [value]);

  const handleSelect = (color) => {
    onChange(color);
    setCustomColor(color);
    setIsOpen(false);
  };

  return (
    <div className={`space-y-2 ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-text">{label}</label>
      )}
      <div className="relative">
        {/* Preview Swatch */}
        <div
          className="w-full h-16 md:h-20 rounded-xl border-2 border-dashed border-border cursor-pointer hover:border-primary hover:shadow-xl active:scale-[0.98] transition-all duration-200 flex items-center justify-center p-4 shadow-md ring-1 ring-border/30 bg-gradient-to-r from-surface/30"
          style={{ backgroundColor: customColor }}
          onClick={() => setIsOpen(!isOpen)}
          title="Tap to pick color"
        >
          <div className="flex items-center gap-3 w-full">
            <div
              className="w-12 h-12 md:w-14 md:h-14 rounded-lg shadow-lg ring-2 ring-border/50 flex-shrink-0"
              style={{ backgroundColor: customColor }}
            />
            <div className="min-w-0 flex-1">
              <span className="block text-xs font-mono bg-surface/80 px-2 py-1 rounded-md truncate">
                {customColor}
              </span>
              <span className="text-xs opacity-70 block mt-0.5">
                Click to change ▼
              </span>
            </div>
          </div>
        </div>

        {/* Color Grid + Picker */}
        {isOpen && (
          <div className="absolute top-full left-0 z-50 w-[calc(100vw-2rem)] max-w-lg p-4 md:p-6 bg-surface border border-border rounded-2xl shadow-2xl backdrop-blur-xl mt-2 origin-top scale-100 animate-in fade-in zoom-in duration-200 mx-auto right-0 left-0 md:left-auto md:right-0">
            {/* Swatches Grid */}
            <div className="grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-8 gap-2 mb-4 justify-items-center">
              {allColors.map((color) => (
                <button
                  key={color}
                  className="w-14 h-14 rounded-xl border-3 hover:scale-110 active:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl focus:outline-none focus:ring-4 ring-primary/30 cursor-pointer group"
                  style={{
                    backgroundColor: color,
                    borderColor:
                      value === color ? "var(--color-primary)" : "transparent",
                  }}
                  onClick={() => handleSelect(color)}
                  title={color}
                >
                  {value === color && (
                    <span className="absolute inset-0 bg-white/20 rounded-xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      ✓
                    </span>
                  )}
                </button>
              ))}
            </div>

            {/* Custom Picker */}
            <div className="flex gap-3 items-center p-3 bg-gradient-to-r from-background/50 to-surface/50 rounded-xl border backdrop-blur">
              <input
                type="color"
                value={customColor}
                onChange={(e) => {
                  setCustomColor(e.target.value);
                  onChange(e.target.value);
                }}
                className="w-16 h-16 rounded-xl border-2 border-border cursor-pointer hover:border-primary/75 active:scale-95 shadow-md hover:shadow-lg transition-all duration-200 ring-1 ring-border/30"
                title="Custom color"
              />
              <span className="text-xs font-mono bg-primary/10 px-3 py-1 rounded-lg text-primary font-semibold min-w-[4rem] text-center">
                {customColor}
              </span>
              <button
                className="btn btn-xs !px-4 whitespace-nowrap flex-shrink-0"
                onClick={() => handleSelect(customColor)}
              >
                Apply
              </button>
            </div>

            {/* Hint */}
            <p className="text-xs text-text-muted mt-3 text-center">
              Tap color or use picker • Esc to close
            </p>
          </div>
        )}
      </div>

      {/* Click outside handler */}
      {isOpen && (
        <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
      )}
    </div>
  );
}
