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

  // Add some popular colors
  colors.push("#FF6B6B", "#4ECDC4", "#45B7D1", "#96CEB4", "#FECA57", "#FF9FF3");

  return colors.slice(0, count);
};

export default function ColorPicker({
  value,
  onChange,
  label = "Select Color",
  className = "",
}) {
  const { boardColorPalette } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const [customColor, setCustomColor] = useState(value || "#3B82F6");
  const [showCustom, setShowCustom] = useState(false);

  const allColors = [...boardColorPalette, ...generateColors(12)];

  useEffect(() => {
    setCustomColor(value || "#3B82F6");
  }, [value]);

  const handleSelect = (color) => {
    onChange(color);
    setCustomColor(color);
    setIsOpen(false);
  };

  return (
    <div className={`form-group ${className}`}>
      {label && <label>{label}</label>}
      <div className="relative group">
        <div
          className="w-full h-14 md:h-16 rounded-xl border-2 border-dashed border-border cursor-pointer hover:border-primary group-hover:shadow-lg transition-all duration-200 flex items-center justify-center bg-gradient-to-br from-background/50 to-surface/50 shadow-md backdrop-blur-sm active:scale-[0.98]"
          style={{ backgroundColor: customColor }}
          onClick={() => setIsOpen(!isOpen)}
          title="Tap to pick color"
        >
          <div className="flex items-center gap-2 px-4">
            <div className="w-8 h-8 rounded-lg shadow-md ring-1 ring-border/50" style={{ backgroundColor: customColor }} />
            <span className="text-sm font-semibold opacity-90 truncate">
              {customColor}
            </span>
            <span className="ml-auto text-xs opacity-60">▼</span>
          </div>
        </div>

        {isOpen && (
          <div className="absolute top-full left-0 z-50 w-screen max-w-md p-3 bg-surface border border-border rounded-xl shadow-2xl backdrop-blur-sm mt-2 mx-[-1rem] md:mx-0 md:w-auto md:left-auto md:right-0">
            <div className="flex flex-col sm:flex-row gap-3 mb-4">
              <div className="grid grid-cols-5 sm:grid-cols-6 gap-2 justify-center">
                {allColors.slice(0, 24).map((color) => (
      </div>
                    key={color}
                    className="w-12 h-12 md:w-10 md:h-10 rounded-lg border-2 hover:scale-110 active:scale-95 transition-all duration-200 shadow-md hover:shadow-lg cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/50"
                    style={{
                      backgroundColor: color,
                      borderColor: value === color ? "var(--color-primary)" : "transparent",
                    }}
                    onClick={() => handleSelect(color)}
                  />
                ))}
              </div>
              
              <div className="flex gap-2 items-center p-2 bg-background/50 rounded-lg">
                <input
                  type="color"
                  value={customColor}
                  onChange={(e) => {
                    setCustomColor(e.target.value);
                    onChange(e.target.value);
                  }}
                  className="w-14 h-14 rounded-lg border-2 border-border cursor-pointer hover:border-primary/75 active:scale-95 transition-all shadow-sm hover:shadow-md"
                />
                <button
                  className="btn btn-xs px-3 whitespace-nowrap"
                  onClick={() => handleSelect(customColor)}
                >
                  ✓ Apply
                </button>
              </div>
            </div>
            
            <div className="text-xs text-text-muted text-center">
              Tap swatch or use color picker
            </div>
          </div>
        )}
    </div>
  );
}
