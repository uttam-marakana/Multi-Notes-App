import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import { useBoard } from "../../contexts/BoardContext";
import { useTheme } from "../../contexts/ThemeContext";
import BoardCard from "../../components/boards/BoardCard";
import ConfirmationModal from "../../components/ui/ConfirmationModal";
import { getTrashedBoardIds, restoreBoard, purgeBoardTrash } from "../../utils/trashStorage";

export default function TrashBoards() {
  const navigate = useNavigate();

  const { boards } = useBoard();
  const { colors } = useTheme();

  const [confirm, setConfirm] = useState({ open: false, boardId: null });

  const trashedBoards = useMemo(() => {
    const ids = new Set(getTrashedBoardIds());
    const list = Array.isArray(boards) ? boards : [];
    return list.filter((b) => ids.has(b.id));
  }, [boards]);

  const handleRestore = (boardId) => {
    restoreBoard(boardId);
  };

  const handlePurgeRequest = (boardId) => {
    setConfirm({ open: true, boardId });
  };

  const handlePurge = () => {
    const boardId = confirm.boardId;
    setConfirm({ open: false, boardId: null });
    purgeBoardTrash(boardId);
  };

  return (
    <div className="board-manager glass-container" style={{ backgroundColor: colors.background }}>
      <div className="board-manager-header glass-card">
        <div>
          <h2 style={{ color: colors.text }}>Trash</h2>
          <p style={{ color: colors.textMuted, margin: 0 }}>
            {trashedBoards.length} trashed board(s)
          </p>
        </div>

        <button className="btn btn-outline" onClick={() => navigate("/")}>
          Back
        </button>
      </div>

      {trashedBoards.length === 0 ? (
        <div className="empty-state glass-card">
          <h3 style={{ color: colors.text }}>Trash is empty</h3>
          <p style={{ color: colors.textMuted }}>
            Deleted boards will appear here until you restore or purge.
          </p>
        </div>
      ) : (
        <div className="board-list-container">
          <div className="board-section">
            <div className="board-grid">
              {trashedBoards.map((board) => (
                <div key={board.id}>
                  <BoardCard
                    board={board}
                    onDelete={() => handlePurgeRequest(board.id)}
                    onPin={() => {}}
                    onDuplicate={() => {}}
                    onRequirePin={() => {}}
                  />

                  <div style={{ display: "flex", gap: 8, marginTop: 12, flexWrap: "wrap" }}>
                    <button className="btn btn-primary" onClick={() => handleRestore(board.id)}>
                      Restore
                    </button>
                    <button className="btn btn-danger" onClick={() => handlePurgeRequest(board.id)}>
                      Delete permanently
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <ConfirmationModal
        isOpen={confirm.open}
        title="Delete permanently?"
        message="This will remove the board from the trash permanently (UI-only)."
        confirmText="Delete"
        cancelText="Cancel"
        isDangerous
        onConfirm={handlePurge}
        onCancel={() => setConfirm({ open: false, boardId: null })}
      />
    </div>
  );
}

