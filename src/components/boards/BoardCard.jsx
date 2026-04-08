import React, { useState } from "react";
import toast from "react-hot-toast";
import { useTheme } from "../../contexts/ThemeContext";
import { useAuth } from "../../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { truncateText, formatDate } from "../../utils/helpers";
import PINModal from "../PINModal";

export default function BoardCard({
  board,
  onDelete,
  onPin,
  isDragging = false,
}) {
  const { colors } = useTheme();
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [showPINModal, setShowPINModal] = useState(false);
  const [isVerified, setIsVerified] = useState(!board.isProtected);
  const currentUserId = currentUser?.uid;
  const isOwner = !board.ownerId || board.ownerId === currentUserId;

  const handleEdit = () => {
    if (!currentUser) {
      toast.error("Please login to edit boards");
      navigate(`/login?redirect=/boards/edit/${board.id}`);
      return;
    }
    if (!isOwner) {
      toast.error("You can only edit your own boards");
      return;
    }
    if (board.isProtected && !isVerified) {
      setShowPINModal(true);
      return;
    }
    navigate(`/boards/edit/${board.id}`);
  };

  const handleViewNotes = () => {
    if (board.isProtected && !isVerified) {
      setShowPINModal(true);
      return;
    }
    if (!currentUser) {
      toast.error("Please login to view notes");
      navigate(`/login?redirect=/notes?boardId=${board.id}`);
      return;
    }
    navigate(`/notes?boardId=${board.id}`);
  };

  const handlePINSubmit = async (pin) => {
    const { hashPIN } = await import("../../utils/helpers");
    if (hashPIN(pin) === board.pin) {
      setIsVerified(true);
      setShowPINModal(false);
      return;
    }
    throw new Error("Invalid PIN");
  };

  const isPinned = board.pinnedBy?.includes(currentUserId);

  return (
    <>
      <div
        className={`board-card ${isDragging ? "dragging" : ""}`}
        style={{
          borderLeftColor: board.color || colors.primary,
          backgroundColor: colors.surface,
          borderColor: colors.border,
        }}
      >
        {/* Protected Badge */}
        {board.isProtected && !isVerified && (
          <div
            className="protected-badge"
            style={{ backgroundColor: colors.danger }}
          >
            🔒 Protected
          </div>
        )}

        {/* Pinned Badge */}
        {isPinned && (
          <div
            className="pinned-badge"
            style={{ backgroundColor: colors.primary }}
          >
            ⭐ Pinned
          </div>
        )}

        {/* Board Header */}
        <div className="board-card-header">
          <div
            className="board-color-indicator"
            style={{ backgroundColor: board.color || colors.primary }}
          />
          <h3 className="board-title" style={{ color: colors.text }}>
            {truncateText(board.name, 25)}
          </h3>
        </div>

        {/* Board Description */}
        {board.description && (
          <p className="board-description" style={{ color: colors.textMuted }}>
            {truncateText(board.description, 50)}
          </p>
        )}

        {/* Board Meta */}
        <div
          className="board-meta"
          style={{ color: colors.textMuted, borderTopColor: colors.border }}
        >
          <small>Created: {formatDate(board.createdAt)}</small>
        </div>

        {/* Action Buttons */}
        <div className="board-actions">
          <button
            className="btn btn-sm btn-outline"
            onClick={handleViewNotes}
            style={
              !isVerified
                ? {
                    borderColor: colors.primary,
                    color: colors.primary,
                  }
                : {}
            }
          >
            📋 View Notes
          </button>

          {isVerified && (
            <>
              <button
                className="btn btn-sm btn-ghost"
                onClick={handleEdit}
                title="Edit board"
              >
                ✏️
              </button>

              <button
                className="btn btn-sm btn-ghost"
                onClick={() => onPin(board.id)}
                title={isPinned ? "Unpin board" : "Pin board"}
                style={{ color: isPinned ? colors.primary : colors.textMuted }}
              >
                {isPinned ? "⭐" : "☆"}
              </button>

              <button
                className="btn btn-sm btn-ghost"
                onClick={() => onDelete(board.id)}
                title="Delete board"
                style={{ color: colors.danger }}
              >
                🗑️
              </button>
            </>
          )}
        </div>
      </div>

      {/* PIN Verification Modal */}
      <PINModal
        isOpen={showPINModal}
        onClose={() => setShowPINModal(false)}
        onSubmit={handlePINSubmit}
        title="Board Protected"
        description={`This board is protected with a 4-digit PIN. Enter the PIN to continue.`}
      />
    </>
  );
}
