import { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import { useTheme } from "../../contexts/ThemeContext";

export default function RenameModal({
  isOpen,
  title = "Rename",
  initialValue = "",
  confirmText = "Save",
  cancelText = "Cancel",
  onClose,
  onConfirm,
  placeholder = "Enter name",
}) {
  const { colors } = useTheme();
  const [value, setValue] = useState(initialValue);
  const inputRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return;
    setValue(initialValue || "");
    setTimeout(() => inputRef.current?.focus(), 0);
  }, [isOpen, initialValue]);

  if (!isOpen) return null;

  const handleConfirm = () => {
    const next = value.trim();
    if (!next) {
      toast.error("Name cannot be empty");
      return;
    }
    onConfirm?.(next);
  };

  return (
    <div className="modal-overlay" onClick={onClose} role="dialog" aria-modal="true">
      <div className="modal" onClick={(e) => e.stopPropagation()} style={{ backgroundColor: colors.surface }}>
        <div className="modal-header" style={{ borderBottomColor: colors.border }}>
          <h3 className="modal-title" style={{ color: colors.text }}>
            {title}
          </h3>
          <button className="modal-close" onClick={onClose} aria-label="Close">
            ×
          </button>
        </div>

        <div className="modal-body" style={{ paddingTop: "1rem" }}>
          <div className="form-group">
            <label style={{ color: colors.text }}>New name</label>
            <input
              ref={inputRef}
              value={value}
              placeholder={placeholder}
              onChange={(e) => setValue(e.target.value)}
              maxLength={100}
              style={{ borderColor: colors.border, backgroundColor: colors.background, color: colors.text }}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleConfirm();
              }}
            />
          </div>
        </div>

        <div className="modal-footer" style={{ borderTopColor: colors.border }}>
          <button className="btn btn-outline" onClick={onClose}>
            {cancelText}
          </button>
          <button className="btn btn-primary" onClick={handleConfirm}>
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}

