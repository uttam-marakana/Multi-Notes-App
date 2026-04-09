import React, { useState, useEffect } from "react";
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
  const { boards, deleteBoard, updateBoardOrder, toggleBoardPin, loading } =
    useBoard();
  const { colors } = useTheme();
  const navigate = useNavigate();
  const [isCreating, setIsCreating] = useState(false);
  const [guestBoards, setGuestBoards] = useState([]);
  const [showConfirm, setShowConfirm] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null);

  // Load guest data
  useEffect(() => {
    if (!currentUser) {
      const saved = guestStorage.getBoards();
      setGuestBoards(saved);
    }
  }, [currentUser]);

  const displayBoards = currentUser ? boards : guestBoards;

  const handleDelete = async (boardId) => {
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
      toast.success("Board deleted (temporary data)");
      return;
    }

    try {
      await deleteBoard(boardId);
      toast.success("Board deleted successfully!");
    } catch (error) {
      toast.error(error.message || "Failed to delete board.");
    }
  };

  const handlePin = async (boardId) => {
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
    } catch (error) {
      toast.error("Failed to pin board.");
    }
  };

  const handleReorder = async (boardIds) => {
    if (!currentUser) {
      const reordered = boardIds.map((id) =>
        guestBoards.find((b) => b.id === id),
      );
      setGuestBoards(reordered);
      guestStorage.saveBoards(reordered);
      return;
    }

    try {
      await updateBoardOrder(boardIds);
      toast.success("Boards reordered!");
    } catch (error) {
      toast.error("Failed to reorder boards.");
    }
  };

  const handleCreateBoard = () => {
    if (!currentUser) {
      toast.error("Please login to save boards permanently");
      navigate("/login?redirect=/dashboard");
      return;
    }
    setIsCreating(true);
  };

  const handleConfirm = () => {
    setShowConfirm(false);
    if (confirmAction.type === "delete") {
      executeDelete(confirmAction.boardId);
    } else if (confirmAction.type === "pin") {
      executePin(confirmAction.boardId);
    }
  };

  return (
    <div className="board-manager glass-container">
      <div className="board-manager-header glass-card">
        <h2 style={{ color: colors.text, margin: 0 }}>Create Boards</h2>
        <button
          className="btn btn-primary"
          onClick={handleCreateBoard}
          style={{ whiteSpace: "nowrap" }}
        >
          <MdOutlineAddCircleOutline />
          New Board
        </button>
      </div>

      {isCreating && <AddBoard onSuccess={() => setIsCreating(false)} />}

      {loading && (
        <div
          className="loading-state"
          style={{
            color: colors.textMuted,
            textAlign: "center",
            padding: "2rem",
          }}
        >
          <div className="spinner"></div>
          <p>Loading boards...</p>
        </div>
      )}

      {!loading && displayBoards.length > 0 && (
        <BoardList
          boards={displayBoards}
          onDelete={handleDelete}
          onPin={handlePin}
          onReorder={handleReorder}
        />
      )}

      {!loading && displayBoards.length === 0 && (
        <div
          className="empty-state glass-card"
          style={{
            backgroundColor: colors.surface,
            borderColor: colors.border,
            padding: "3rem",
            borderRadius: "1rem",
            textAlign: "center",
          }}
        >
          <h3 style={{ color: colors.text, fontSize: "1.5rem" }}>
            No Boards Yet
          </h3>
          <p style={{ color: colors.textMuted, marginBottom: "1.5rem" }}>
            {currentUser
              ? "Create your first board to get started organizing your notes!"
              : "Login to create boards and save them permanently!"}
          </p>
          <button
            className="btn btn-primary btn-lg"
            onClick={handleCreateBoard}
          >
            {currentUser ? "✨ Create First Board" : "🔑 Login to Create"}
          </button>
        </div>
      )}

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
