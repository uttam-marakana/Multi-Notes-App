import { createContext, useContext, useEffect, useState } from "react";

const ThemeContext = createContext();

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within ThemeProvider");
  }
  return context;
}

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => {
    // Check localStorage first
    const savedTheme = localStorage.getItem("app-theme");
    if (savedTheme) return savedTheme;

    // Check system preference
    if (
      typeof window !== "undefined" &&
      typeof window.matchMedia === "function" &&
      window.matchMedia("(prefers-color-scheme: dark)").matches
    ) {
      return "dark";
    }
    return "light";
  });

  // Apply theme to document
  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute("data-theme", theme);
    localStorage.setItem("app-theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === "light" ? "dark" : "light"));
  };

  const colors = {
    light: {
      primary: "#3B82F6",
      secondary: "#8B5CF6",
      success: "#10B981",
      danger: "#EF4444",
      warning: "#F59E0B",
      info: "#0EA5E9",
      background: "#F9FAFB",
      surface: "#FFFFFF",
      border: "#E5E7EB",
      text: "#1F2937",
      textMuted: "#6B7280",
      shadowColor: "rgba(0, 0, 0, 0.1)",
    },
    dark: {
      primary: "#60A5FA",
      secondary: "#A78BFA",
      success: "#34D399",
      danger: "#F87171",
      warning: "#FBBF24",
      info: "#38BDF8",
      background: "#111827",
      surface: "#1F2937",
      border: "#374151",
      text: "#F3F4F6",
      textMuted: "#9CA3AF",
      shadowColor: "rgba(0, 0, 0, 0.3)",
    },
  };

  const currentColors = colors[theme];

  // Priority level colors
  const priorityColors = {
    low: theme === "light" ? "#10B981" : "#34D399", // Green
    medium: theme === "light" ? "#F59E0B" : "#FBBF24", // Amber
    high: theme === "light" ? "#EF4444" : "#F87171", // Red
  };

  // Board colors palette (for user selection)
  const boardColorPalette = [
    "#3B82F6", // Blue
    "#8B5CF6", // Purple
    "#EC4899", // Pink
    "#EF4444", // Red
    "#F59E0B", // Amber
    "#10B981", // Green
    "#06B6D4", // Cyan
    "#6366F1", // Indigo
  ];

  return (
    <ThemeContext.Provider
      value={{
        theme,
        toggleTheme,
        colors: currentColors,
        allColors: colors,
        priorityColors,
        boardColorPalette,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}
