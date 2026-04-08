import React, { useState, useRef, useEffect } from "react";
import { useTheme } from "../contexts/ThemeContext";

export default function PINModal({
  isOpen,
  onClose,
  onSubmit,
  title = "Enter PIN",
  description = "This item is protected with a PIN",
}) {
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { colors } = useTheme();
  const pinInputsRef = useRef([]);

  // Handle PIN change with auto-focus to next input
  const handlePinChange = (index, value) => {
    // Only allow numbers
    let newValue = value.replace(/[^0-9]/g, "");

    if (newValue.length > 1) {
      // Paste operation
      const newPin = newValue.slice(0, 4);
      const inputs = pinInputsRef.current;
      newPin.split("").forEach((digit, i) => {
        if (inputs[i]) {
          inputs[i].value = digit;
        }
      });
      setPin(newPin);
      if (newPin.length === 4) {
        inputs[3]?.focus();
      }
    } else {
      // Single character input
      setPin((prev) => {
        let updated = prev.split("");
        updated[index] = newValue;
        updated = updated.slice(0, 4);
        return updated.join("");
      });

      // Auto-focus to next input
      if (newValue && index < 3) {
        pinInputsRef.current[index + 1]?.focus();
      }
    }

    setError("");
  };

  const handleBackspace = (index, e) => {
    if (e.key === "Backspace") {
      if (!e.currentTarget.value && index > 0) {
        pinInputsRef.current[index - 1]?.focus();
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (pin.length !== 4) {
      setError("PIN must be 4 digits");
      return;
    }

    setLoading(true);
    try {
      await onSubmit(pin);
      setPin("");
      setError("");
    } catch (err) {
      setError(err.message || "Invalid PIN");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      setPin("");
      setError("");
      pinInputsRef.current[0]?.focus();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      className="modal-overlay"
      style={{ backgroundColor: "rgba(0, 0, 0, 0.7)" }}
      onClick={onClose}
    >
      <div
        className="modal"
        style={{ backgroundColor: colors.surface }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className="modal-header"
          style={{ borderBottomColor: colors.border }}
        >
          <h2 className="modal-title">{title}</h2>
          <button className="modal-close" onClick={onClose}>
            ✕
          </button>
        </div>

        <div className="modal-body">
          <p style={{ color: colors.textMuted, marginBottom: "1.5rem" }}>
            {description}
          </p>

          <form onSubmit={handleSubmit}>
            {/* PIN Input Display */}
            <div
              style={{
                display: "flex",
                gap: "0.75rem",
                justifyContent: "center",
                marginBottom: "1.5rem",
              }}
            >
              {[0, 1, 2, 3].map((index) => (
                <input
                  key={index}
                  ref={(el) => (pinInputsRef.current[index] = el)}
                  type="password"
                  maxLength="1"
                  value={pin[index] || ""}
                  onChange={(e) => handlePinChange(index, e.target.value)}
                  onKeyDown={(e) => handleBackspace(index, e)}
                  style={{
                    width: "50px",
                    height: "60px",
                    fontSize: "1.5rem",
                    textAlign: "center",
                    fontWeight: "bold",
                    letterSpacing: "0.2em",
                    backgroundColor: colors.background,
                    border: `2px solid ${colors.border}`,
                    borderRadius: "0.5rem",
                    color: colors.text,
                    transition: "all 0.3s ease",
                  }}
                  inputMode="numeric"
                  disabled={loading}
                />
              ))}
            </div>

            {error && (
              <div
                style={{
                  color: colors.danger || "#EF4444",
                  fontSize: "0.875rem",
                  textAlign: "center",
                  marginBottom: "1rem",
                }}
              >
                {error}
              </div>
            )}

            {/* Number Pad (optional) */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(3, 1fr)",
                gap: "0.5rem",
                marginBottom: "1.5rem",
              }}
            >
              {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                <button
                  key={num}
                  type="button"
                  onClick={() => {
                    if (pin.length < 4) {
                      const newPin = pin + String(num);
                      setPin(newPin);
                      if (newPin.length === 4) {
                        // Auto-submit on 4 digits
                        setTimeout(() => {
                          pinInputsRef.current[3].blur();
                        }, 100);
                      } else {
                        const nextIndex = newPin.length;
                        if (nextIndex < 4) {
                          pinInputsRef.current[nextIndex]?.focus();
                        }
                      }
                    }
                  }}
                  style={{
                    padding: "0.75rem",
                    fontSize: "1.25rem",
                    fontWeight: "600",
                    backgroundColor: colors.border,
                    border: `1px solid ${colors.border}`,
                    borderRadius: "0.5rem",
                    cursor: "pointer",
                    transition: "all 0.3s ease",
                    color: colors.text,
                  }}
                  disabled={loading}
                  onMouseEnter={(e) => {
                    e.target.style.backgroundColor = colors.primary;
                    e.target.style.color = "white";
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.backgroundColor = colors.border;
                    e.target.style.color = colors.text;
                  }}
                >
                  {num}
                </button>
              ))}
              <button
                type="button"
                onClick={() => {
                  if (pin.length > 0) {
                    setPin(pin.slice(0, -1));
                    pinInputsRef.current[pin.length - 1]?.focus();
                  }
                }}
                style={{
                  gridColumn: "2",
                  padding: "0.75rem",
                  fontSize: "1.25rem",
                  fontWeight: "600",
                  backgroundColor: colors.border,
                  border: `1px solid ${colors.border}`,
                  borderRadius: "0.5rem",
                  cursor: "pointer",
                  transition: "all 0.3s ease",
                  color: colors.text,
                }}
                disabled={loading}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = colors.danger || "#EF4444";
                  e.target.style.color = "white";
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = colors.border;
                  e.target.style.color = colors.text;
                }}
              >
                ⌫
              </button>
            </div>

            <div
              className="modal-footer"
              style={{ borderTopColor: colors.border }}
            >
              <button
                type="button"
                className="btn btn-ghost"
                onClick={onClose}
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={pin.length !== 4 || loading}
              >
                {loading ? "Verifying..." : "Verify PIN"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
