import { useEffect, useRef, useState } from "react";
import { GoKebabHorizontal } from "react-icons/go";

export default function ThreeDotsMenu({
  items = [],
  onClose,
  buttonStyle = {},
  menuStyle = {},
  iconColor = "currentColor",
}) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef(null);

  useEffect(() => {
    if (!open) return;

    const onDocClick = (e) => {
      const el = rootRef.current;
      if (!el) return;
      if (!el.contains(e.target)) {
        setOpen(false);
        onClose?.();
      }
    };

    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, [open, onClose]);

  return (
    <div
      className="three-dots-menu"
      ref={rootRef}
      style={{
        position: "relative",
        display: "flex",
        flexShrink: 0,
      }}
    >
      <button
        type="button"
        aria-label="Open menu"
        onClick={() => setOpen((v) => !v)}
        className="three-dots-button btn btn-ghost btn-sm"
        style={{
          padding: "0.5rem",
          minWidth: "40px",
          width: "40px",
          height: "40px",
          color: iconColor,
          flexShrink: 0,
          ...buttonStyle,
        }}
      >
        <GoKebabHorizontal className="svg-size" />
      </button>

      {open && (
        <div
          className="three-dots-dropdown"
          style={{
            position: "absolute",
            right: 0,
            top: "calc(100% + 0.5rem)",
            minWidth: 150,
            zIndex: 999,
            display: "flex",
            flexDirection: "column",
            background: "var(--glass-bg)",
            border: "1px solid var(--glass-border)",
            borderRadius: "var(--radius-md)",
            boxShadow: "var(--shadow-md)",
            padding: "0.25rem",
            backdropFilter: "blur(10px)",
            ...menuStyle,
          }}
        >
          {items.map((item, idx) => {
            const {
              label,
              onClick,
              danger = false,
              disabled = false,
              icon = null,
            } = item;

            return (
              <button
                key={`${label}-${idx}`}
                type="button"
                className="three-dots-item"
                disabled={disabled}
                onClick={() => {
                  if (disabled) return;
                  setOpen(false);
                  onClose?.();
                  onClick?.();
                }}
                style={{
                  width: "100%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "flex-start",
                  gap: "0.5rem",
                  padding: "0.5rem 0.75rem",
                  border: "none",
                  background: "transparent",
                  color: danger ? "var(--color-danger)" : "var(--color-text)",
                  fontSize: "0.9rem",
                  cursor: disabled ? "not-allowed" : "pointer",
                  opacity: disabled ? 0.6 : 1,
                  borderRadius: "var(--radius-sm)",
                }}
              >
                {icon && <span style={{ display: "inline-flex" }}>{icon}</span>}
                <span>{label}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
