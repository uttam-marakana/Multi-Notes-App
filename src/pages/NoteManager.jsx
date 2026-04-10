import { useEffect, useMemo, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useAuth } from "../contexts/AuthContext";
import { useNote } from "../contexts/NoteContext";
import { useBoard } from "../contexts/BoardContext";
import { useTheme } from "../contexts/ThemeContext";
import { guestStorage } from "../utils/guestStorage";
import {
  grantProtectedAccess,
  hasProtectedAccess,
  verifyPIN,
} from "../utils/helpers";
import ConfirmationModal from "../components/ConfirmationModal";
import PINModal from "../components/PINModal";
import PageBackButton from "../components/PageBackButton";
import NoteList from "../components/notes/NoteList";

export default function NoteManager() {
  const [searchParams] = useSearchParams();
  const boardId = searchParams.get("boardId");
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const {
    notes,
    fetchNotes,
    deleteNote,
    toggleNotePin,
    updateNoteOrder,
    loading: notesLoading,
  } = useNote();
  const { boards, loading: boardsLoading } = useBoard();
  const { colors } = useTheme();

  const [guestNotes, setGuestNotes] = useState([]);
  const [showConfirm, setShowConfirm] = useState(false);
  const [showPINModal, setShowPINModal] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null);
  const [boardVerified, setBoardVerified] = useState(
    !boardId || hasProtectedAccess("board", boardId),
  );

  useEffect(() => {
    if (!boardId) return undefined;

    if (currentUser) {
      return fetchNotes(boardId);
    }

    const saved = guestStorage.getNotes(boardId);
    setGuestNotes(saved);
    return undefined;
  }, [boardId, currentUser, fetchNotes]);

  const board = useMemo(
    () => boards.find((item) => item.id === boardId),
    [boards, boardId],
  );

  useEffect(() => {
    if (!board) return;

    const verified = !board.isProtected || hasProtectedAccess("board", board.id);
    setBoardVerified(verified);
    setShowPINModal(board.isProtected && !verified);
  }, [board]);

  const displayNotes = currentUser ? notes : guestNotes;

  const handleBoardPINSubmit = async (pin) => {
    if (!board || !verifyPIN(pin, board.pin)) {
      throw new Error("Invalid PIN");
    }

    grantProtectedAccess("board", board.id);
    setBoardVerified(true);
    setShowPINModal(false);
  };

  const handleAddNote = () => {
    if (!currentUser) {
      toast.error("Please login to create notes");
      navigate(`/login?redirect=${encodeURIComponent(`/notes/add?boardId=${boardId}`)}`);
      return;
    }

    if (!boardId) {
      toast.error("Board ID is required");
      return;
    }

    if (board?.isProtected && !boardVerified) {
      setShowPINModal(true);
      return;
    }

    navigate(`/notes/add?boardId=${boardId}`);
  };

  const handleEditNote = (noteId) => {
    if (!currentUser) {
      toast.error("Please login to edit notes");
      navigate(
        `/login?redirect=${encodeURIComponent(`/notes/edit/${noteId}?boardId=${boardId}`)}`,
      );
      return;
    }

    navigate(`/notes/edit/${noteId}?boardId=${boardId}`);
  };

  const handleDeleteNote = (noteId) => {
    setConfirmAction({
      type: "deleteNote",
      noteId,
      title: "Delete Note",
      message: "This action cannot be undone. Delete this note?",
    });
    setShowConfirm(true);
  };

  const executeDeleteNote = async (noteId) => {
    if (!currentUser) {
      const updated = guestNotes.filter((item) => item.id !== noteId);
      setGuestNotes(updated);
      guestStorage.saveNotes(boardId, updated);
      toast.success("Note deleted");
      return;
    }

    try {
      await deleteNote(boardId, noteId);
      toast.success("Note deleted successfully");
    } catch (error) {
      toast.error(error.message || "Failed to delete note");
    }
  };

  const handlePin = (noteId) => {
    if (!currentUser) {
      toast.error("Please login to pin notes");
      navigate(`/login?redirect=${encodeURIComponent(`/notes?boardId=${boardId}`)}`);
      return;
    }

    setConfirmAction({
      type: "pinNote",
      noteId,
      title: "Pin Note",
      message: "Update note pin status?",
    });
    setShowConfirm(true);
  };

  const executePinNote = async (noteId) => {
    try {
      await toggleNotePin(boardId, noteId);
      toast.success("Note updated");
    } catch {
      toast.error("Failed to update note");
    }
  };

  const handleConfirm = () => {
    setShowConfirm(false);

    if (confirmAction?.type === "deleteNote") {
      executeDeleteNote(confirmAction.noteId);
    } else if (confirmAction?.type === "pinNote") {
      executePinNote(confirmAction.noteId);
    }
  };

  if (!boardId) {
    return (
      <div
        className="note-manager glass-container"
        style={{ backgroundColor: colors.background }}
      >
        <div className="container">
          <div
            className="empty-state glass-card"
            style={{
              backgroundColor: colors.surface,
              borderColor: colors.border,
            }}
          >
            <h3 style={{ color: colors.text }}>No Board Selected</h3>
            <p style={{ color: colors.textMuted }}>
              Choose a board first to view and manage notes.
            </p>
            <button className="btn btn-primary" onClick={() => navigate("/")}>
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (boardsLoading || (currentUser && !board)) {
    return (
      <div
        className="note-manager glass-container"
        style={{ backgroundColor: colors.background }}
      >
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Loading board...</p>
        </div>
      </div>
    );
  }

  if (!board) {
    return (
      <div
        className="note-manager glass-container"
        style={{ backgroundColor: colors.background }}
      >
        <div className="container">
          <div className="empty-state glass-card">
            <h3 style={{ color: colors.text }}>Board not found</h3>
            <p style={{ color: colors.textMuted }}>
              The selected board no longer exists or you no longer have access.
            </p>
            <button className="btn btn-primary" onClick={() => navigate("/")}>
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  const isLocked = board.isProtected && !boardVerified;

  return (
    <div
      className="note-manager glass-container"
      style={{ backgroundColor: colors.background }}
    >
      <div className="container">
        <PageBackButton fallback="/" />
        <div className="note-manager-header glass-card">
          <div>
            <h2 style={{ color: colors.text, margin: 0 }}>{board.name}</h2>
            <p style={{ color: colors.textMuted, margin: 0 }}>
              {board.description || "Manage your notes, priorities, files, and protected content here."}
            </p>
          </div>
          <button
            className="btn btn-primary"
            onClick={handleAddNote}
            style={{ whiteSpace: "nowrap" }}
            disabled={isLocked}
          >
            New Note
          </button>
        </div>

        {isLocked ? (
          <div className="empty-state glass-card">
            <h3 style={{ color: colors.text }}>This board is protected</h3>
            <p style={{ color: colors.textMuted }}>
              Enter the board PIN to view notes and continue with CRUD actions.
            </p>
            <button className="btn btn-primary" onClick={() => setShowPINModal(true)}>
              Unlock Board
            </button>
          </div>
        ) : notesLoading ? (
          <div className="loading-state">
            <div className="spinner"></div>
            <p>Loading notes...</p>
          </div>
        ) : (
          <NoteList
            notes={displayNotes}
            boardId={boardId}
            onEdit={handleEditNote}
            onDelete={handleDeleteNote}
            onPin={handlePin}
            onReorder={(noteIds) => {
              if (currentUser) {
                updateNoteOrder(boardId, noteIds);
              } else {
                const reordered = noteIds.map((id) =>
                  guestNotes.find((item) => item.id === id),
                );
                setGuestNotes(reordered);
                guestStorage.saveNotes(boardId, reordered);
              }
            }}
          />
        )}
      </div>

      <PINModal
        isOpen={showPINModal}
        onClose={() => setShowPINModal(false)}
        onSubmit={handleBoardPINSubmit}
        title="Board Protected"
        description="Enter the board PIN to access and manage notes."
      />

      <ConfirmationModal
        isOpen={showConfirm}
        title={confirmAction?.title}
        message={confirmAction?.message}
        confirmText="Confirm"
        cancelText="Cancel"
        isDangerous={confirmAction?.type === "deleteNote"}
        onConfirm={handleConfirm}
        onCancel={() => setShowConfirm(false)}
      />
    </div>
  );
}
