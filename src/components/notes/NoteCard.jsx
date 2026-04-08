import React, { useState } from "react";
import { useTheme } from "../../contexts/ThemeContext";
import { useAuth } from "../../contexts/AuthContext";
import PINModal from "../PINModal";
import {
  getPriorityColor,
  truncateText,
  formatDate,
} from "../../utils/helpers";

export default function NoteCard({
  note,
  boardId,
  onEdit,
  onDelete,
  onPin,
  isDragging = false,
}) {
  const { colors, priorityColors } = useTheme();
  const { currentUser } = useAuth();
  const [showPINModal, setShowPINModal] = useState(false);
  const [isVerified, setIsVerified] = useState(!note.isProtected);
  const currentUserId = currentUser?.uid;
  const isOwner = !note.ownerId || note.ownerId === currentUserId;

  const handleEdit = () => {
    if (!isOwner) return;
    if (note.isProtected && !isVerified) {
      setShowPINModal(true);
      return;
    }
    onEdit();
  };

  const handlePINSubmit = async (pin) => {
    const { hashPIN } = await import("../../utils/helpers");
    if (hashPIN(pin) === note.pin) {
      setIsVerified(true);
      setShowPINModal(false);
      return;
    }
    throw new Error("Invalid PIN");
  };

  const isPinned = note.pinnedBy?.includes(currentUserId);
  const priorityColor = getPriorityColor(note.priority, priorityColors);

  return (
    <>
      <div
        className={`note-card ${isDragging ? "dragging" : ""}`}
        style={{
          backgroundColor: colors.surface,
          borderColor: colors.border,
          borderLeftColor: priorityColor,
        }}
      >
        {/* Protected Badge */}
        {note.isProtected && !isVerified && (
          <div
            className="protected-badge"
            style={{ backgroundColor: colors.danger }}
          >
            🔒
          </div>
        )}

        {/* Read-Only Banner */}
        {!isOwner && (
          <div
            style={{
              position: "absolute",
              top: "1rem",
              left: "1rem",
              backgroundColor: colors.warning,
              color: "white",
              padding: "0.25rem 0.5rem",
              borderRadius: "0.5rem",
              fontSize: "0.75rem",
            }}
          >
            Read Only
          </div>
        )}

        {/* Pinned Badge */}
        {isPinned && (
          <div
            className="pinned-badge"
            style={{ backgroundColor: colors.primary }}
          >
            ⭐
          </div>
        )}

        {/* Priority Indicator */}
        <div
          className="priority-indicator"
          style={{ backgroundColor: priorityColor }}
          title={`Priority: ${note.priority?.toUpperCase()}`}
        />

        {/* Note Content */}
        <h4 className="note-title" style={{ color: colors.text }}>
          {truncateText(note.title, 30)}
        </h4>

        <p className="note-preview" style={{ color: colors.textMuted }}>
          {truncateText(note.content, 60)}
        </p>

        {/* Note Meta */}
        <div
          className="note-meta"
          style={{ color: colors.textMuted, borderTopColor: colors.border }}
        >
          <small>{formatDate(note.createdAt)}</small>
          {note.files?.length > 0 && (
            <small>📎 {note.files.length} file(s)</small>
          )}
        </div>

        {/* Action Buttons */}
        <div className="note-actions">
          <button
            className="btn btn-sm btn-ghost"
            onClick={handleEdit}
            title={isOwner ? "Edit note" : "Read only"}
            style={{
              color: isOwner ? colors.text : colors.textMuted,
              cursor: isOwner ? "pointer" : "not-allowed",
            }}
            disabled={!isOwner}
          >
            ✏️
          </button>

          {isOwner && isVerified && (
            <>
              <button
                className="btn btn-sm btn-ghost"
                onClick={() => onPin()}
                title={isPinned ? "Unpin note" : "Pin note"}
                style={{ color: isPinned ? colors.primary : colors.textMuted }}
              >
                {isPinned ? "⭐" : "☆"}
              </button>

              <button
                className="btn btn-sm btn-ghost"
                onClick={() => onDelete()}
                title="Delete note"
                style={{ color: colors.danger }}
              >
                🗑️
              </button>
            </>
          )}
        </div>
      </div>

      <PINModal
        isOpen={showPINModal}
        onClose={() => setShowPINModal(false)}
        onSubmit={handlePINSubmit}
        title="Note Protected"
        description="This note is protected with a PIN. Enter it to continue."
      />
    </>
  );
}
