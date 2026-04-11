import { useState } from "react";
import { useTheme } from "../../contexts/ThemeContext";
import { useAuth } from "../../contexts/AuthContext";
import BoardCard from "./BoardCard";
import PINModal from "../PINModal";
import { verifyPIN, grantProtectedAccess } from "../../utils/helpers";

const BoardList = ({ boards, onDelete, onPin }) => {
  const { colors } = useTheme();
  const { currentUser } = useAuth();
  const currentUserId = currentUser?.uid;

  const [showPINModal, setShowPINModal] = useState(false);
  const [selectedBoard, setSelectedBoard] = useState(null);
  const [pendingAction, setPendingAction] = useState(null);

  const pinnedBoards = boards.filter((b) =>
    b.pinnedBy?.includes(currentUserId),
  );

  const unpinnedBoards = boards.filter(
    (b) => !b.pinnedBy?.includes(currentUserId),
  );

  const handleRequirePin = (board, action) => {
    console.log("PIN modal opening for board:", board?.id, board?.name);
    setSelectedBoard(board);
    setPendingAction(() => action);
    setShowPINModal(true);
  };

  const handlePINSubmit = async (pin) => {
    if (!selectedBoard || !verifyPIN(pin, selectedBoard.pin)) {
      throw new Error("Invalid PIN");
    }

    grantProtectedAccess("board", selectedBoard.id);

    setShowPINModal(false);

    const action = pendingAction;
    setPendingAction(null);
    setSelectedBoard(null);

    action?.(); // 🔥 resume original flow
  };

  return (
    <>
      <div className="board-list-container">
        {pinnedBoards.length > 0 && (
          <div className="board-section">
            <h3 style={{ color: colors.text }}>⭐ Pinned Boards</h3>
            <div className="board-grid">
              {pinnedBoards.map((board) =>
                board?.id ? (
                  <BoardCard
                    key={board.id}
                    board={board}
                    onDelete={onDelete}
                    onPin={onPin}
                    onRequirePin={handleRequirePin}
                  />
                ) : null,
              )}
            </div>
          </div>
        )}

        <div className="board-section">
          <h3 style={{ color: colors.text }}>Your Boards</h3>
          <div className="board-grid">
            {unpinnedBoards.map((board) =>
              board?.id ? (
                <BoardCard
                  key={board.id}
                  board={board}
                  onDelete={onDelete}
                  onPin={onPin}
                  onRequirePin={handleRequirePin}
                />
              ) : null,
            )}
          </div>
        </div>
      </div>

      {/* 🔥 SINGLE GLOBAL PIN MODAL */}
      <PINModal
        isOpen={showPINModal}
        onClose={() => {
          setShowPINModal(false);
          setPendingAction(null);
          setSelectedBoard(null);
        }}
        onSubmit={handlePINSubmit}
        title="Board Protected"
        description="Enter PIN to continue"
      />
    </>
  );
};

export default BoardList;
