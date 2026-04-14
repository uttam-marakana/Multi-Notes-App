import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../../contexts/ThemeContext";
import { useAuth } from "../../contexts/AuthContext";
import {
  truncateText,
  formatDate,
  hasProtectedAccess,
} from "../../utils/helpers";
import { GoStar, GoStarFill } from "react-icons/go";

export default function BoardCard({
  board,
  onDelete,
  onPin,
  onRequirePin,
  isDragging = false,
}) {
  const { colors } = useTheme();
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const [isVerified, setIsVerified] = useState(
    !board.isProtected || hasProtectedAccess("board", board.id),
  );

  const currentUserId = currentUser?.uid;

  const isOwner =
    !board.ownerId ||
    board.ownerId === currentUserId ||
    board.userId === currentUserId;

  const isPinned = Boolean(
    currentUserId && board.pinnedBy?.includes(currentUserId),
  );

  useEffect(() => {
    setIsVerified(!board.isProtected || hasProtectedAccess("board", board.id));
  }, [board.id, board.isProtected]);

  const runProtectedAction = (action) => {
    if (board.isProtected && !isVerified) {
      onRequirePin?.(board, action); // 🔥 delegate to parent
      return;
    }
    action();
  };

  const handleViewNotes = () => {
    if (!currentUser) {
      toast.error("Please login to view notes");
      navigate(
        `/login?redirect=${encodeURIComponent(`/notes?boardId=${board.id}`)}`,
      );
      return;
    }

    runProtectedAction(() => {
      navigate(`/notes?boardId=${board.id}`);
    });
  };

  const handleEdit = () => {
    if (!currentUser) {
      toast.error("Please login to edit boards");
      navigate(
        `/login?redirect=${encodeURIComponent(`/boards/edit/${board.id}`)}`,
      );
      return;
    }

    if (!isOwner) {
      toast.error("You can only edit your own boards");
      return;
    }

    runProtectedAction(() => {
      navigate(`/boards/edit/${board.id}`);
    });
  };

  const handleTogglePin = () => {
    if (!currentUser) {
      toast.error("Please login to pin boards");
      navigate("/login?redirect=/");
      return;
    }

    runProtectedAction(() => onPin(board.id));
  };

  const handleDelete = () => {
    if (!currentUser) {
      toast.error("Please login to delete boards");
      navigate("/login?redirect=/");
      return;
    }

    if (!isOwner) {
      toast.error("You can only delete your own boards");
      return;
    }

    runProtectedAction(() => onDelete(board.id));
  };

  return (
    <article
      className={`board-card ${isDragging ? "dragging" : ""}`}
      style={{
        borderLeftColor: board.color || colors.primary,
        backgroundColor: colors.surface,
        borderColor: colors.border,
      }}
    >
      <div className="board-card-top">
        <div className="board-card-header">
          <div
            className="board-color-indicator"
            style={{ backgroundColor: board.color || colors.primary }}
          />
          <div className="board-title-group">
            <h4 className="board-title" style={{ color: colors.text }}>
              {truncateText(board.name, 42)}
            </h4>
            <p className="board-subtitle" style={{ color: colors.textMuted }}>
              {board.isProtected && !isVerified
                ? "PIN required to open"
                : "Ready to manage notes"}
            </p>
          </div>
        </div>

        <div className="board-card-badges">
          {board.isProtected && (
            <span
              className="board-chip board-chip-danger"
              style={{ backgroundColor: colors.danger }}
            >
              {isVerified ? "Unlocked" : "Protected"}
            </span>
          )}
          {isPinned && (
            <span
              className="board-chip board-chip-primary"
              style={{ backgroundColor: colors.primary }}
            >
              Pinned
            </span>
          )}
        </div>
      </div>

      <div className="board-card-body">
        <p className="board-description" style={{ color: colors.textMuted }}>
          {board.description
            ? truncateText(board.description, 120)
            : "Use this board to organize notes and files."}
        </p>
      </div>

      <div
        className="board-meta"
        style={{ color: colors.textMuted, borderTopColor: colors.border }}
      >
        <small>Created {formatDate(board.createdAt) || "recently"}</small>
        <small>{board.isProtected ? "Secure board" : "Open board"}</small>
      </div>

      <div className="board-actions">
        <button className="btn btn-primary btn-sm" onClick={handleViewNotes}>
          View Notes
        </button>

        <button className="btn btn-outline btn-sm" onClick={handleEdit}>
          Edit
        </button>

        <button
          className="btn btn-ghost btn-sm"
          onClick={handleTogglePin}
          style={{ color: isPinned ? colors.primary : colors.textMuted }}
        >
          {isPinned ? (
            <GoStarFill className="svg-size" />
          ) : (
            <GoStar className="svg-size" />
          )}
        </button>

        <button
          className="btn btn-ghost btn-sm"
          onClick={handleDelete}
          style={{ color: colors.danger }}
        >
          Delete
        </button>
      </div>
    </article>
  );
}
