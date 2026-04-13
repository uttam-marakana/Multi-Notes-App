import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useTheme } from "../contexts/ThemeContext";

export default function PINModal({
  isOpen,
  onClose,
  onSubmit,
  title = "Enter PIN",
  description = "4-digit PIN required",
}) {
  const { theme, colors } = useTheme();
  const [digits, setDigits] = useState(["", "", "", ""]);
  const [error, setError] = useState("");
  const pinInputsRef = useRef([]);

  useEffect(() => {
    if (!isOpen) return;

    setDigits(["", "", "", ""]);
    setError("");

    setTimeout(() => pinInputsRef.current[0]?.focus(), 50);
  }, [isOpen]);

  if (!isOpen) return null;

  const handleChange = (i, val) => {
    const clean = val.replace(/\D/g, "");
    const next = [...digits];

    if (clean.length > 1) {
      clean.split("").forEach((d, idx) => {
        if (i + idx < 4) next[i + idx] = d;
      });
    } else {
      next[i] = clean;
    }

    setDigits(next);
    if (clean && i < 3) pinInputsRef.current[i + 1]?.focus();
  };

  const handleKeyDown = (i, e) => {
    if (e.key === "Backspace" && !digits[i] && i > 0) {
      pinInputsRef.current[i - 1]?.focus();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const pin = digits.join("");

    if (pin.length !== 4) {
      setError("Enter 4-digit PIN");
      pinInputsRef.current[0]?.focus();
      return;
    }

    setError("");
    try {
      await onSubmit(pin);
    } catch {
      setError("❌ Invalid PIN. Try again.");
      pinInputsRef.current[0]?.focus();
      setDigits(["", "", "", ""]);
    }
  };

  return createPortal(
    <div className="modal-overlay" onClick={onClose}>
      <div
        className={`modal pin-modal ${theme}`}
        style={{
          background: `var(--glass-bg)`,
          border: `1px solid var(--glass-border)`,
          color: `var(--color-text)`,
          backdropFilter: "blur(20px)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <h3 className="modal-title">{title}</h3>
          <button className="modal-close" onClick={onClose} aria-label="Close">
            ×
          </button>
        </div>
        <div className="modal-body pin-modal-body">
          <p>{description}</p>
          <form onSubmit={handleSubmit} className="pin-group">
            <div className="pin-modal-inputs">
              {[0, 1, 2, 3].map((i) => (
                <input
                  key={i}
                  ref={(el) => (pinInputsRef.current[i] = el)}
                  value={digits[i]}
                  onChange={(e) => handleChange(i, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(i, e)}
                  type="password"
                  inputMode="numeric"
                  maxLength={1}
                  className="pin-modal-digit bg-background border-border hover:scale-[1.05] focus:(ring-primary ring-2 shadow-glow) text-2xl font-bold"
                  aria-label={`Digit ${i + 1}`}
                />
              ))}
            </div>
            {error && (
              <div className="alert alert-error mt-3" role="alert">
                {error}
              </div>
            )}
          </form>
        </div>
        <div className="modal-footer">
          <button
            type="button"
            className="btn btn-outline"
            onClick={onClose}
            style={{ "--color-primary": colors.primary }}
          >
            Cancel
          </button>
          <button
            type="button"
            className="btn btn-primary"
            disabled={digits.join("").length !== 4}
            onClick={handleSubmit}
          >
            Verify PIN
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
