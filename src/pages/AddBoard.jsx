import React, { useRef, useState } from "react";
import toast from "react-hot-toast";
import { useBoard } from "../contexts/BoardContext";
import { useTheme } from "../contexts/ThemeContext";

export default function AddBoard({ onSuccess }) {
  const nameRef = useRef();
  const descriptionRef = useRef();
  const [selectedColor, setSelectedColor] = useState("#3B82F6");
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [isProtected, setIsProtected] = useState(false);
  const [pin, setPin] = useState("");
  const [pinConfirm, setPinConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const { addBoard } = useBoard();
  const { colors, boardColorPalette } = useTheme();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const name = nameRef.current.value.trim();

    if (!name) {
      toast.error("Board name is required");
      return;
    }

    if (isProtected) {
      if (pin.length !== 4) {
        toast.error("PIN must be exactly 4 digits");
        return;
      }
      if (pin !== pinConfirm) {
        toast.error("PINs do not match");
        return;
      }
    }

    setLoading(true);
    try {
      await addBoard({
        name,
        description: descriptionRef.current.value.trim(),
        color: selectedColor,
        isProtected,
        pin: isProtected ? pin : null,
      });

      toast.success("Board created successfully!");
      nameRef.current.value = "";
      descriptionRef.current.value = "";
      setSelectedColor("#3B82F6");
      setIsProtected(false);
      setPin("");
      setPinConfirm("");
      setShowAdvanced(false);

      if (onSuccess) onSuccess();
    } catch (error) {
      toast.error(error.message || "Failed to create board");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="add-board-container"
      style={{
        backgroundColor: colors.surface,
        borderColor: colors.border,
      }}
    >
      <h3 style={{ color: colors.text, marginBottom: "1.5rem" }}>
        ✨ Create New Board
      </h3>

      <form onSubmit={handleSubmit} className="add-board-form">
        {/* Basic Fields */}
        <div className="form-group">
          <label style={{ color: colors.text }}>Board Name *</label>
          <input
            ref={nameRef}
            type="text"
            placeholder="Enter board name (e.g., 'Project Ideas', 'Daily Notes')"
            required
            maxLength="100"
            style={{
              backgroundColor: colors.background,
              borderColor: colors.border,
              color: colors.text,
            }}
          />
        </div>

        <div className="form-group">
          <label style={{ color: colors.text }}>Description</label>
          <textarea
            ref={descriptionRef}
            placeholder="Add a description for this board (optional)"
            maxLength="200"
            rows="2"
            style={{
              backgroundColor: colors.background,
              borderColor: colors.border,
              color: colors.text,
            }}
          />
          <small style={{ color: colors.textMuted }}>
            {descriptionRef.current?.value?.length || 0}/200
          </small>
        </div>

        {/* Color Selection */}
        <div className="form-group">
          <label style={{ color: colors.text }}>Board Color</label>
          <div className="color-picker">
            {boardColorPalette.map((color) => (
              <button
                key={color}
                type="button"
                className={`color-option ${
                  selectedColor === color ? "selected" : ""
                }`}
                style={{
                  backgroundColor: color,
                  borderColor:
                    selectedColor === color ? colors.text : "transparent",
                }}
                onClick={() => setSelectedColor(color)}
                title={color}
              />
            ))}
          </div>
        </div>

        {/* Advanced Options */}
        <div className="advanced-toggle">
          <button
            type="button"
            className="btn btn-ghost btn-sm"
            onClick={() => setShowAdvanced(!showAdvanced)}
            style={{ color: colors.primary }}
          >
            {showAdvanced ? "▼" : "▶"} Advanced Options
          </button>
        </div>

        {showAdvanced && (
          <div className="advanced-options">
            <div
              className="form-group"
              style={{
                padding: "1rem",
                backgroundColor: colors.background,
                borderRadius: "0.5rem",
                border: `1px solid ${colors.border}`,
              }}
            >
              <label
                style={{
                  color: colors.text,
                  display: "flex",
                  gap: "0.5rem",
                  alignItems: "center",
                }}
              >
                <input
                  type="checkbox"
                  checked={isProtected}
                  onChange={(e) => setIsProtected(e.target.checked)}
                  style={{ cursor: "pointer" }}
                />
                🔒 Protect with PIN
              </label>

              {isProtected && (
                <div
                  style={{
                    marginTop: "1rem",
                    display: "flex",
                    flexDirection: "column",
                    gap: "0.75rem",
                  }}
                >
                  <div>
                    <label
                      style={{
                        color: colors.text,
                        display: "block",
                        marginBottom: "0.5rem",
                      }}
                    >
                      PIN (4 digits)
                    </label>
                    <input
                      type="password"
                      placeholder="Enter 4-digit PIN"
                      maxLength="4"
                      value={pin}
                      onChange={(e) =>
                        setPin(
                          e.target.value.replace(/[^0-9]/g, "").slice(0, 4),
                        )
                      }
                      style={{
                        backgroundColor: colors.background,
                        borderColor: colors.border,
                        color: colors.text,
                      }}
                    />
                  </div>

                  <div>
                    <label
                      style={{
                        color: colors.text,
                        display: "block",
                        marginBottom: "0.5rem",
                      }}
                    >
                      Confirm PIN
                    </label>
                    <input
                      type="password"
                      placeholder="Confirm 4-digit PIN"
                      maxLength="4"
                      value={pinConfirm}
                      onChange={(e) =>
                        setPinConfirm(
                          e.target.value.replace(/[^0-9]/g, "").slice(0, 4),
                        )
                      }
                      style={{
                        backgroundColor: colors.background,
                        borderColor: colors.border,
                        color: colors.text,
                      }}
                    />
                  </div>

                  {pin && pinConfirm && pin !== pinConfirm && (
                    <small style={{ color: colors.danger }}>
                      ⚠️ PINs do not match
                    </small>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="form-actions">
          <button
            type="submit"
            className="btn btn-primary btn-lg"
            disabled={loading}
          >
            {loading ? "Creating..." : "✨ Create Board"}
          </button>
        </div>
      </form>
    </div>
  );
}
