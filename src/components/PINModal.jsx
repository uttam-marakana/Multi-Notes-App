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

  const handlePinChange = (index, value) => {
    const clean = value.replace(/[^0-9]/g, "");

    setPin((prev) => {
      const arr = prev.split("");
      arr[index] = clean;
      return arr.join("").slice(0, 4);
    });

    if (clean && index < 3) {
      pinInputsRef.current[index + 1]?.focus();
    }

    setError("");
  };

  const handleBackspace = (index, e) => {
    if (e.key === "Backspace" && !e.target.value && index > 0) {
      pinInputsRef.current[index - 1]?.focus();
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
      await onSubmit(pin); // parent handles navigation
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
      setTimeout(() => pinInputsRef.current[0]?.focus(), 100);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      className="modal-overlay"
      style={{ backgroundColor: "rgba(0,0,0,0.7)" }}
      onClick={onClose}
    >
      <div
        className="modal"
        style={{ backgroundColor: colors.surface }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <h2>{title}</h2>
          <button onClick={onClose}>✕</button>
        </div>

        <div className="modal-body">
          <p style={{ color: colors.textMuted }}>{description}</p>

          <form onSubmit={handleSubmit}>
            <div
              style={{ display: "flex", gap: "10px", justifyContent: "center" }}
            >
              {[0, 1, 2, 3].map((i) => (
                <input
                  key={i}
                  ref={(el) => (pinInputsRef.current[i] = el)}
                  value={pin[i] || ""}
                  onChange={(e) => handlePinChange(i, e.target.value)}
                  onKeyDown={(e) => handleBackspace(i, e)}
                  maxLength="1"
                  type="password"
                  disabled={loading}
                  style={{
                    width: "50px",
                    height: "60px",
                    textAlign: "center",
                    fontSize: "20px",
                  }}
                />
              ))}
            </div>

            {error && <p style={{ color: "red" }}>{error}</p>}

            <div style={{ marginTop: "1rem" }}>
              <button type="button" onClick={onClose}>
                Cancel
              </button>

              <button type="submit" disabled={loading}>
                {loading ? "Verifying..." : "Verify"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
