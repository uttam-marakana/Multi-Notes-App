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
      {label && <label>Board Color</label>}
      <div className="relative">
        <div
          className="w-full h-12 rounded-lg border-2 border-dashed border-border cursor-pointer hover:border-primary transition-colors flex items-center justify-center shadow-md hover:shadow-lg"
          style={{ backgroundColor: customColor }}
          onClick={() => setIsOpen(!isOpen)}
        >
          <span className="text-sm font-medium opacity-80">
            Click to change
          </span>
        </div>

        {isOpen && (
          <div className="absolute top-full left-0 right-0 mt-2 p-4 bg-surface border border-border rounded-xl shadow-2xl z-50">
            <div className="flex flex-wrap gap-3 mb-4 justify-center max-w-max mx-auto">
              {allColors.slice(0, 24).map((color) => (
                <button
                  key={color}
                  className="w-10 h-10 rounded-lg border-2 hover:scale-110 transition-all shadow-md hover:shadow-lg cursor-pointer"
                  style={{
                    backgroundColor: color,
                    borderColor: value === color ? "white" : "transparent",
                  }}
                  onClick={() => handleSelect(color)}
                />
              ))}
            </div>

            <div className="flex gap-2 items-center">
              <input
                type="color"
                value={customColor}
                onChange={(e) => {
                  setCustomColor(e.target.value);
                  onChange(e.target.value);
                }}
                className="w-12 h-12 rounded-lg border-2 border-border cursor-pointer hover:border-primary transition-colors shadow-md"
              />
              <button
                className="btn btn-sm"
                onClick={() => handleSelect(customColor)}
              >
                Apply
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
