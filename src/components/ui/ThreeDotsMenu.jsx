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

    const handleOutsideClick = (e) => {
      if (!rootRef.current?.contains(e.target)) {
        setOpen(false);
        onClose?.();
      }
    };

    const handleEscape = (e) => {
      if (e.key === "Escape") {
        setOpen(false);
        onClose?.();
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [open, onClose]);

  const closeMenu = () => {
    setOpen(false);
    onClose?.();
  };

  return (
    <div
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
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((prev) => !prev)}
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
          role="menu"
          className="three-dots-dropdown"
          style={{
            position: "absolute",
            right: 0,
            top: "calc(100% + 0.5rem)",
            minWidth: "150px",
            maxWidth: "220px",
            zIndex: 999,
            display: "flex",
            flexDirection: "column",
            background: "var(--glass-bg)",
            border: "1px solid var(--glass-border)",
            borderRadius: "var(--radius-md)",
            boxShadow: "var(--shadow-md)",
            padding: "0.25rem",
            backdropFilter: "blur(10px)",
            overflow: "hidden",
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
                role="menuitem"
                disabled={disabled}
                className="three-dots-item"
                onClick={() => {
                  if (disabled) return;

                  closeMenu();
                  onClick?.();
                }}
                style={{
                  width: "100%",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  padding: "0.625rem 0.75rem",
                  border: "none",
                  background: "transparent",
                  color: danger ? "var(--color-danger)" : "var(--color-text)",
                  fontSize: "0.9rem",
                  cursor: disabled ? "not-allowed" : "pointer",
                  opacity: disabled ? 0.6 : 1,
                  borderRadius: "var(--radius-sm)",
                  textAlign: "left",
                }}
              >
                {icon && (
                  <span
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      flexShrink: 0,
                    }}
                  >
                    {icon}
                  </span>
                )}

                <span>{label}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
