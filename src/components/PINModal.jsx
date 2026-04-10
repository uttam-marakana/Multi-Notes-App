import { useEffect, useRef, useState } from "react";
import { useTheme } from "../contexts/ThemeContext";

export default function PINModal({
  isOpen,
  onClose,
  onSubmit,
  title = "Enter PIN",
  description = "This item is protected with a PIN.",
}) {
  const { colors } = useTheme();
  const [digits, setDigits] = useState(["", "", "", ""]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const pinInputsRef = useRef([]);

  useEffect(() => {
    if (!isOpen) return;

    setDigits(["", "", "", ""]);
    setError("");
    setLoading(false);

    const timer = window.setTimeout(() => {
      pinInputsRef.current[0]?.focus();
    }, 40);

    return () => window.clearTimeout(timer);
  }, [isOpen]);

  if (!isOpen) return null;

  const handlePinChange = (index, value) => {
    const cleanValue = value.replace(/\D/g, "");
    const nextDigits = [...digits];

    if (!cleanValue) {
      nextDigits[index] = "";
      setDigits(nextDigits);
      setError("");
      return;
    }

    const incomingDigits = cleanValue.slice(0, 4).split("");
    incomingDigits.forEach((digit, offset) => {
      if (index + offset < 4) {
        nextDigits[index + offset] = digit;
      }
    });

    setDigits(nextDigits);
    setError("");

    const nextIndex = Math.min(index + incomingDigits.length, 3);
    pinInputsRef.current[nextIndex]?.focus();
  };

  const handleBackspace = (index, event) => {
    if (event.key !== "Backspace") return;

    if (digits[index]) {
      const nextDigits = [...digits];
      nextDigits[index] = "";
      setDigits(nextDigits);
      return;
    }

    if (index > 0) {
      pinInputsRef.current[index - 1]?.focus();
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const pin = digits.join("");
    if (pin.length !== 4) {
      setError("PIN must be 4 digits");
      return;
    }

    setLoading(true);

    try {
      await onSubmit(pin);
      setDigits(["", "", "", ""]);
      setError("");
    } catch (submitError) {
      setError(submitError.message || "Invalid PIN");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal pin-modal"
        style={{ backgroundColor: colors.surface, borderColor: colors.border }}
        onClick={(event) => event.stopPropagation()}
      >
        <div className="modal-header">
          <div>
            <h2 className="modal-title" style={{ margin: 0 }}>
              {title}
            </h2>
            <p style={{ color: colors.textMuted, margin: "0.5rem 0 0 0" }}>
              {description}
            </p>
          </div>
          <button type="button" className="modal-close" onClick={onClose}>
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-body pin-modal-body">
          <div className="pin-modal-inputs">
            {[0, 1, 2, 3].map((index) => (
              <input
                key={index}
                ref={(element) => {
                  pinInputsRef.current[index] = element;
                }}
                value={digits[index]}
                onChange={(event) => handlePinChange(index, event.target.value)}
                onKeyDown={(event) => handleBackspace(index, event)}
                maxLength={4}
                type="password"
                inputMode="numeric"
                autoComplete="one-time-code"
                disabled={loading}
                className="pin-modal-digit"
                style={{
                  borderColor: error ? colors.danger : colors.border,
                  backgroundColor: colors.background,
                  color: colors.text,
                }}
              />
            ))}
          </div>

          {error && (
            <p className="form-error" style={{ marginBottom: 0 }}>
              {error}
            </p>
          )}

          <div className="modal-footer">
            <button type="button" className="btn btn-outline" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? "Verifying..." : "Verify PIN"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
