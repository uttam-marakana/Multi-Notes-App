import { useEffect, useState } from "react";
import { useTheme } from "../../contexts/ThemeContext";
import { useAuth } from "../../contexts/AuthContext";
import { useBoard } from "../../contexts/BoardContext";
import PINModal from "../PINModal";
import {
  getPriorityColor,
  truncateText,
  formatDate,
  getFileIcon,
  formatFileSize,
  verifyProtectedPIN,
  grantProtectedAccess,
  hasProtectedAccess,
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
  const { boards } = useBoard();
  const [showPINModal, setShowPINModal] = useState(false);
  const [pendingAction, setPendingAction] = useState(null);
  const [isVerified, setIsVerified] = useState(
    !note.isProtected || hasProtectedAccess("note", note.id),
  );

  const currentUserId = currentUser?.uid;
  const board = boards.find((item) => item.id === boardId);
  const boardPinHash = board?.isProtected ? board.pin : null;
  const isOwner = !note.ownerId || note.ownerId === currentUserId;
  const isPinned = Boolean(
    currentUserId && note.pinnedBy?.includes(currentUserId),
  );
  const priorityColor = getPriorityColor(note.priority, priorityColors);
  const noteColor = note.color;

  useEffect(() => {
    setIsVerified(!note.isProtected || hasProtectedAccess("note", note.id));
  }, [note.id, note.isProtected]);

  const runProtectedAction = (action) => {
    if (note.isProtected && !isVerified) {
      setPendingAction(() => action);
      setShowPINModal(true);
      return;
    }

    action();
  };

  const handleEdit = () => {
    if (!isOwner) return;
    runProtectedAction(onEdit);
  };

  const handleDelete = () => {
    if (!isOwner) return;
    runProtectedAction(onDelete);
  };

  const handlePin = () => {
    if (!isOwner) return;
    runProtectedAction(onPin);
  };

  const handlePINSubmit = async (pin) => {
    if (!verifyProtectedPIN(pin, note.pin, boardPinHash)) {
      throw new Error("Invalid PIN");
    }

    grantProtectedAccess("note", note.id);
    setIsVerified(true);
    setShowPINModal(false);

    const nextAction = pendingAction;
    setPendingAction(null);
    nextAction?.();
  };

  return (
    <>
      <article
        className={`note-card ${isDragging ? "dragging" : ""}`}
        style={{
          backgroundColor: colors.surface,
          borderColor: colors.border,
          borderLeftColor: note.color || priorityColor,
        }}
      >
        {note.isProtected && !isVerified && (
          <div
            className="protected-badge"
            style={{ backgroundColor: colors.danger }}
          >
            Locked
          </div>
        )}

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

        {isPinned && (
          <div
            className="pinned-badge"
            style={{ backgroundColor: colors.primary }}
          >
            Pinned
          </div>
        )}

        <div
          className="priority-indicator"
          style={{ backgroundColor: priorityColor }}
          title={`Priority: ${note.priority?.toUpperCase()}`}
        />

        <h4 className="note-title" style={{ color: colors.text }}>
          {truncateText(note.title, 30)}
        </h4>

        <p className="note-preview" style={{ color: colors.textMuted }}>
          {truncateText(note.content, 90) || "No content yet."}
        </p>

        {note.files?.length > 0 && (
          <div className="note-files" style={{ borderColor: colors.border }}>
            {note.files.slice(0, 3).map((file) => (
              <a
                key={file.path || file.url}
                href={file.url}
                target="_blank"
                rel="noreferrer"
                className="note-file-item"
                style={{
                  backgroundColor: colors.background,
                  borderColor: colors.border,
                  color: colors.text,
                }}
              >
                {file.type?.startsWith("image/") ? (
                  <img
                    src={file.url}
                    alt={file.name}
                    className="note-file-thumb"
                  />
                ) : (
                  <span className="note-file-icon">
                    {getFileIcon(file.type)}
                  </span>
                )}
                <span className="note-file-name">
                  {truncateText(file.name, 16)}
                </span>
                <small className="note-file-size">
                  {formatFileSize(file.size)}
                </small>
              </a>
            ))}
            {note.files.length > 3 && (
              <span className="note-file-more">
                +{note.files.length - 3} more
              </span>
            )}
          </div>
        )}

        <div
          className="note-meta"
          style={{ color: colors.textMuted, borderTopColor: colors.border }}
        >
          <small>{formatDate(note.createdAt) || "recently updated"}</small>
          <small>{note.priority || "low"} priority</small>
          {note.files?.length > 0 && (
            <small>{note.files.length} attachment(s)</small>
          )}
        </div>

        <div className="note-actions">
          <button
            className="btn btn-outline btn-sm"
            onClick={handleEdit}
            title={isOwner ? "Edit note" : "Read only"}
            disabled={!isOwner}
          >
            Edit
          </button>

          {isOwner && (
            <>
              <button
                className="btn btn-ghost btn-sm"
                onClick={handlePin}
                title={isPinned ? "Unpin note" : "Pin note"}
                style={{ color: isPinned ? colors.primary : colors.textMuted }}
              >
                {isPinned ? "★" : "☆"}
              </button>

              <button
                className="btn btn-ghost btn-sm"
                onClick={handleDelete}
                title="Delete note"
                style={{ color: colors.danger }}
              >
                Delete
              </button>
            </>
          )}
        </div>
      </article>

      <PINModal
        isOpen={showPINModal}
        onClose={() => {
          setPendingAction(null);
          setShowPINModal(false);
        }}
        onSubmit={handlePINSubmit}
        title="Note Protected"
        description="Enter the 4-digit PIN to continue with this note."
      />
    </>
  );
}
