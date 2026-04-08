import React, { useState } from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useBoard } from "../contexts/BoardContext";
import { useTheme } from "../contexts/ThemeContext";
import AddBoard from "./AddBoard";
import BoardList from "../components/boards/BoardList";

export default function BoardManager() {
  const { currentUser } = useAuth();
  const { boards, deleteBoard, updateBoardOrder, toggleBoardPin, loading } =
    useBoard();
  const { colors } = useTheme();
  const navigate = useNavigate();
  const [isCreating, setIsCreating] = useState(false);

  const handleDelete = async (boardId) => {
    if (!currentUser) {
      toast.error("Please login to delete boards");
      navigate("/login?redirect=/dashboard");
      return;
    }

    const confirmDelete = window.confirm(
      "Are you sure you want to delete this board? This action cannot be undone.",
    );
    if (!confirmDelete) return;

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

    try {
      await toggleBoardPin(boardId);
      toast.success("Board updated!");
    } catch (error) {
      toast.error("Failed to pin board.");
    }
  };

  const handleReorder = async (boardIds) => {
    if (!currentUser) {
      toast.error("Please login to reorder boards");
      navigate("/login?redirect=/dashboard");
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
      toast.error("Please login to create boards");
      navigate("/login?redirect=/dashboard");
      return;
    }
    setIsCreating(true);
  };

  return (
    <div className="board-manager">
      <div className="board-manager-header">
        <h2 style={{ color: colors.text, margin: 0 }}>📊 Your Boards</h2>
        <button
          className="btn btn-primary"
          onClick={handleCreateBoard}
          style={{ whiteSpace: "nowrap" }}
        >
          ➕ New Board
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

      {!loading && boards.length > 0 && (
        <BoardList
          boards={boards}
          onDelete={handleDelete}
          onPin={handlePin}
          onReorder={handleReorder}
        />
      )}

      {!loading && boards.length === 0 && (
        <div
          className="empty-state"
          style={{
            backgroundColor: colors.surface,
            borderColor: colors.border,
            padding: "3rem",
            borderRadius: "1rem",
            textAlign: "center",
          }}
        >
          <h3 style={{ color: colors.text, fontSize: "1.5rem" }}>
            📋 No Boards Yet
          </h3>
          <p style={{ color: colors.textMuted, marginBottom: "1.5rem" }}>
            {currentUser
              ? "Create your first board to get started organizing your notes!"
              : "Login to create boards and start organizing your notes!"}
          </p>
          <button
            className="btn btn-primary btn-lg"
            onClick={handleCreateBoard}
          >
            {currentUser ? "✨ Create First Board" : "🔑 Login to Create"}
          </button>
        </div>
      )}
    </div>
  );
}
