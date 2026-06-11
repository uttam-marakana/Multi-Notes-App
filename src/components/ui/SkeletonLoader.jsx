import React from "react";
import { useTheme } from "../../contexts/ThemeContext";

export default function SkeletonLoader({
  variant = "card",
  count = 6,
  className = "",
}) {
  const { colors } = useTheme();

  const skeletonStyle = {
    background: `linear-gradient(90deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.14) 35%, rgba(255,255,255,0.06) 70%)`,
    borderColor: colors.border,
  };

  const base =
    variant === "board"
      ? { minHeight: 280 }
      : variant === "note"
        ? { minHeight: 300 }
        : { minHeight: 220 };

  return (
    <div className={className} aria-busy="true" aria-live="polite">
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
          gap: "1rem",
        }}
      >
        {Array.from({ length: count }).map((_, idx) => (
          <div
            key={idx}
            className="skeleton-card"
            style={{
              ...base,
              borderRadius: "var(--radius-lg)",
              border: `1px solid ${colors.border}`,
              backgroundColor: colors.surface,
              overflow: "hidden",
              position: "relative",
              boxShadow: "0 8px 32px 0 rgba(31, 38, 135, 0.08)",
            }}
          >
            <div
              style={{
                position: "absolute",
                inset: 0,
                transform: "translateX(-100%)",
                background: skeletonStyle.background,
                animation: "skeleton-shimmer 1.2s ease-in-out infinite",
              }}
            />

            <div style={{ position: "relative", padding: "1.25rem" }}>
              <div
                style={{
                  height: 14,
                  width: "70%",
                  borderRadius: 999,
                  background: "rgba(255,255,255,0.08)",
                  marginBottom: "0.75rem",
                }}
              />
              <div
                style={{
                  height: 12,
                  width: "90%",
                  borderRadius: 999,
                  background: "rgba(255,255,255,0.08)",
                  marginBottom: "0.5rem",
                }}
              />
              <div
                style={{
                  height: 12,
                  width: "60%",
                  borderRadius: 999,
                  background: "rgba(255,255,255,0.08)",
                  marginBottom: "1rem",
                }}
              />

              <div
                style={{
                  height: 12,
                  width: "100%",
                  borderRadius: 999,
                  background: "rgba(255,255,255,0.08)",
                  marginBottom: "0.5rem",
                }}
              />
              <div
                style={{
                  height: 12,
                  width: "85%",
                  borderRadius: 999,
                  background: "rgba(255,255,255,0.08)",
                  marginBottom: "0.5rem",
                }}
              />
              <div
                style={{
                  height: 12,
                  width: "75%",
                  borderRadius: 999,
                  background: "rgba(255,255,255,0.08)",
                  marginBottom: "0.75rem",
                }}
              />

              <div
                style={{
                  display: "flex",
                  gap: "0.5rem",
                  alignItems: "center",
                }}
              >
                <div
                  style={{
                    height: 30,
                    width: 110,
                    borderRadius: 999,
                    background: "rgba(255,255,255,0.08)",
                  }}
                />
                <div
                  style={{
                    height: 30,
                    width: 90,
                    borderRadius: 999,
                    background: "rgba(255,255,255,0.08)",
                  }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      <style>{`
        @keyframes skeleton-shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
      `}</style>
    </div>
  );
}

