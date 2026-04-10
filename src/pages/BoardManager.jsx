import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useBoard } from "../contexts/BoardContext";
import { useTheme } from "../contexts/ThemeContext";
import { guestStorage } from "../utils/guestStorage";
import ConfirmationModal from "../components/ConfirmationModal";
import AddBoard from "./AddBoard";
import BoardList from "../components/boards/BoardList";
import { MdOutlineAddCircleOutline } from "react-icons/md";

export default function BoardManager() {
  const { currentUser } = useAuth();
  const { boards, deleteBoard, toggleBoardPin, loading } = useBoard();

  const { colors } = useTheme();
  const navigate = useNavigate();

  const [isCreating, setIsCreating] = useState(false);
  const [guestBoards, setGuestBoards] = useState([]);
  const [showConfirm, setShowConfirm] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null);

  /* ------ LOAD GUEST DATA ----------------------------- */
  useEffect(() => {
    if (!currentUser) {
      const saved = guestStorage.getBoards();
      setGuestBoards(saved);
    }
  }, [currentUser]);

  const displayBoards = currentUser ? boards : guestBoards;
  const pinnedBoardsCount = displayBoards.filter((board) =>
    board.pinnedBy?.includes(currentUser?.uid),
  ).length;

  /* ------ DELETE ----------------------------- */
  const handleDelete = (boardId) => {
    setConfirmAction({
      type: "delete",
      boardId,
      title: "Delete Board",
      message: "This action cannot be undone. Are you sure?",
    });
    setShowConfirm(true);
  };

  const executeDelete = async (boardId) => {
    if (!currentUser) {
      const updated = guestBoards.filter((b) => b.id !== boardId);
      setGuestBoards(updated);
      guestStorage.saveBoards(updated);
      toast.success("Board deleted (guest mode)");
      return;
    }

    try {
      await deleteBoard(boardId);
      toast.success("Board deleted successfully!");
    } catch (error) {
      toast.error(error.message || "Failed to delete board.");
    }
  };

  /* ------ PIN ----------------------------- */
  const handlePin = (boardId) => {
    if (!currentUser) {
      toast.error("Please login to pin boards");
      navigate("/login?redirect=/dashboard");
      return;
    }

    setConfirmAction({
      type: "pin",
      boardId,
      title: "Pin Board",
      message: "Update board pin status?",
    });
    setShowConfirm(true);
  };

  const executePin = async (boardId) => {
    try {
      await toggleBoardPin(boardId);
      toast.success("Board updated!");
    } catch {
      toast.error("Failed to pin board.");
    }
  };

  /* ------ CREATE BOARD ----------------------------- */
  const handleCreateBoard = () => {
    if (!currentUser) {
      toast.error("Please login to save boards permanently");
      navigate("/login?redirect=/dashboard");
      return;
    }
    setIsCreating(true);
  };

  /* ------ CONFIRM MODAL ----------------------------- */
  const handleConfirm = () => {
    setShowConfirm(false);

    if (confirmAction?.type === "delete") {
      executeDelete(confirmAction.boardId);
    } else if (confirmAction?.type === "pin") {
      executePin(confirmAction.boardId);
    }
  };

  /* ------ UI ----------------------------- */
  return (
    <div className="board-manager glass-container">
      {/* HEADER */}
      <div className="board-manager-header glass-card">
        <div>
          <h2 style={{ color: colors.text }}>Boards</h2>
          <p style={{ color: colors.textMuted, margin: 0 }}>
            {displayBoards.length} total board(s) and {pinnedBoardsCount} pinned
          </p>
        </div>

        <button className="btn btn-primary" onClick={handleCreateBoard}>
          <MdOutlineAddCircleOutline />
          New Board
        </button>
      </div>

      {/* CREATE FORM */}
      {isCreating && <AddBoard onSuccess={() => setIsCreating(false)} />}

      {/* LOADING */}
      {loading && (
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Loading boards...</p>
        </div>
      )}

      {/* BOARDS */}
      {!loading && displayBoards.length > 0 && (
        <BoardList
          boards={displayBoards}
          onDelete={handleDelete}
          onPin={handlePin}
        />
      )}

      {/* EMPTY STATE */}
      {!loading && displayBoards.length === 0 && (
        <div className="empty-state glass-card">
          <h3>No Boards Yet</h3>
          <p>
            {currentUser
              ? "Create your first board to start organizing!"
              : "Login to create boards!"}
          </p>

          <button className="btn btn-primary" onClick={handleCreateBoard}>
            {currentUser ? "✨ Create Board" : "🔑 Login"}
          </button>
        </div>
      )}

      {/* CONFIRM MODAL */}
      <ConfirmationModal
        isOpen={showConfirm}
        title={confirmAction?.title}
        message={confirmAction?.message}
        confirmText="Confirm"
        cancelText="Cancel"
        isDangerous={confirmAction?.type === "delete"}
        onConfirm={handleConfirm}
        onCancel={() => setShowConfirm(false)}
      />
    </div>
  );
}
