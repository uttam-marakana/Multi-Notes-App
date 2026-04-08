import React from "react";
import { useTheme } from "../contexts/ThemeContext";

export default function ConfirmationModal({
  isOpen,
  title = "Confirm Action",
  message = "Are you sure?",
  confirmText = "Confirm",
  cancelText = "Cancel",
  isDangerous = false,
  onConfirm,
  onCancel,
}) {
  const { colors } = useTheme();

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onCancel}
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: "rgba(0, 0, 0, 0.5)",
          zIndex: 999,
        }}
      />

      {/* Modal */}
      <div
        style={{
          position: "fixed",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          backgroundColor: colors.surface,
          borderColor: colors.border,
          border: `1px solid ${colors.border}`,
          borderRadius: "0.75rem",
          padding: "2rem",
          minWidth: "360px",
          maxWidth: "500px",
          boxShadow: `0 20px 25px -5px rgba(0, 0, 0, 0.2)`,
          zIndex: 1000,
        }}
      >
        <h3 style={{ color: colors.text, margin: "0 0 0.75rem 0" }}>{title}</h3>
        <p style={{ color: colors.textMuted, margin: "0 0 1.5rem 0" }}>
          {message}
        </p>

        <div
          style={{
            display: "flex",
            gap: "1rem",
            justifyContent: "flex-end",
          }}
        >
          <button
            onClick={onCancel}
            style={{
              padding: "0.75rem 1.5rem",
              borderRadius: "0.5rem",
              border: `1px solid ${colors.border}`,
              backgroundColor: colors.background,
              color: colors.text,
              cursor: "pointer",
              fontSize: "0.95rem",
              fontWeight: "500",
              transition: "all 0.2s ease",
            }}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = colors.border;
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = colors.background;
            }}
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            style={{
              padding: "0.75rem 1.5rem",
              borderRadius: "0.5rem",
              border: "none",
              backgroundColor: isDangerous ? colors.danger : colors.primary,
              color: "white",
              cursor: "pointer",
              fontSize: "0.95rem",
              fontWeight: "500",
              transition: "all 0.2s ease",
            }}
            onMouseEnter={(e) => {
              e.target.style.filter = "brightness(0.9)";
            }}
            onMouseLeave={(e) => {
              e.target.style.filter = "brightness(1)";
            }}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </>
  );
}
